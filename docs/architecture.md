# FloodPulse Architecture Specification

FloodPulse is an end-to-end, probabilistic flood forecasting and road infrastructure resilience platform designed for rapid disaster response.

```
                              +-------------------------------------------+
                              |              Raw Data Sources             |
                              | Caravan (Global) | CAMELS-IND (Peninsular)|
                              | MERIT Hydro / DEM | Sentinel-1 SAR | OSM  |
                              +-------------------------------------------+
                                                    |
                                                    v
                                      +---------------------------+
                                      |   Ingestion & Features    |
                                      | Dynamic forcings, HAND,   |
                                      |   osm nx NetworkGraph     |
                                      +---------------------------+
                                                    |
             +--------------------------------------+--------------------------------------+
             |                                                                             |
             v                                                                             v
+-------------------------------+                                            +-------------------------------+
| Stage 1: Streamflow Forecaster|                                            |  Stage 2: Flood Susceptibility|
| Pretrained on Caravan         |                                            | Terrain features (HAND, slope)|
| Fine-tuned on CAMELS-IND      |                                            | + Sentinel-1 SAR observations |
| Outputs: Quantiles [q05..q95] |                                            | Outputs: Inundation raster/P(F)|
+-------------------------------+                                            +-------------------------------+
             |                                                                             |
             +--------------------------------------+--------------------------------------+
                                                    |
                                                    v
                                      +---------------------------+
                                      | Stage 3: Road Closure Prob|
                                      | Inundation depth & extent |
                                      | mapped to OSM road edges  |
                                      | P(closure | depth, type)  |
                                      +---------------------------+
                                                    |
                                                    v
                                      +---------------------------+
                                      | Stage 4: Risk-Aware Route |
                                      | Safe emergency routing on |
                                      | risk-weighted dual graph  |
                                      +---------------------------+
                                                    |
                                                    v
                                      +---------------------------+
                                      | Stage 5: Serving & Stack  |
                                      | FastAPI + PostGIS backend |
                                      | React + MapLibre UI       |
                                      | MLflow experiment tracking|
                                      +---------------------------+
                                                    |
                                                    v
                                      +---------------------------+
                                      | Stage 6: LLM Report Agent |
                                      | Synthesizes situational   |
                                      | briefing; strictly zero   |
                                      | numerical hallucinations  |
                                      +---------------------------+
```

---

## Component Details

### 1. Multi-Basin Streamflow Forecaster
- **Input**: Daily meteorological forcings (ERA5-Land / IMDAA: precipitation, temperature, radiation, humidity, wind, PET) + catchment static attributes (area, elevation, slope, soil, geology).
- **Model**: Multi-layer Long Short-Term Memory (LSTM) network with sequence memory of 365 days.
- **Probabilistic Head**: Quantile Regression estimating the distribution of streamflow: $\tau \in \{0.05, 0.10, 0.25, 0.50, 0.75, 0.90, 0.95\}$.
- **Transfer Learning**: Pretrained on hundreds of global catchments (Caravan) to learn universal hydrological dynamics, followed by transfer learning and fine-tuning on Indian river basins (CAMELS-IND).

### 2. Terrain & SAR Susceptibility Engine
- **Input**: Height Above Nearest Drainage (HAND), digital elevation models (DEM), slope, and drainage accumulation combined with Sentinel-1 GRD SAR backscatter imagery.
- **Output**: Calibrated 30m flood susceptibility and inundation extent rasters under predicted peak return flows.

### 3. Road Segment Closure Probability
- **Input**: OpenStreetMap road network graph filtered for vehicular routing (trunk, primary, secondary, tertiary, residential).
- **Formulation**: Road edges overlaid onto inundation depth. A logistic fragility curve maps predicted water depth $d$ to edge transit failure probability $P(\text{closure} \mid d)$.

### 4. Risk-Aware Emergency Routing
- **Input**: Origin-destination dispatch queries for first responders and emergency vehicles.
- **Routing Algorithm**: Risk-penalized Dijkstra / A* routing where edge traversal cost is a function of free-flow travel time $t_e$ and closure risk $P_e$:
  $$C(e) = t_e \cdot \left(1 + \lambda \cdot P_e\right)$$
  ensuring ambulances and relief trucks avoid high-risk or flooded chokepoints.

### 5. Serving, Storage, and Tracking
- **FastAPI**: Async REST API serving basin predictions, risk GeoJSON layers, and route queries.
- **PostGIS**: Spatial database indexing road networks (`LINESTRING`), gauge stations (`POINT`), and flood polygons (`MULTIPOLYGON`).
- **MLflow**: Tracks model hyperparameters, pinball losses, KGE/NSE metrics, and model artifacts.
- **Docker Compose**: Containerized orchestration without heavyweight clustering.

### 6. Grounded LLM Report Agent
- **Role**: Translates structured forecasts and road hazard metrics into executive situational bulletins for civil defense authorities.
- **Strict Boundary**: Never computes or hallucinates numbers; all figures (peak flow, return period, closed road segments, ETA delays) are populated strictly from deterministic pipeline outputs into a structured prompt schema.
