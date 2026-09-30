# FloodPulse: Probabilistic Flood-Forecasting & Road-Impact Platform

> **Status: In Development (Phase 1 Completed)**  
> *Notice: This repository is in active development. Benchmarks, streamflow metrics, and inundation layers are strictly evaluated on empirical splits. No synthetic or placeholder performance figures are published.*

---

## 1. Problem Statement

Flooding in Indian river basins poses recurrent, high-consequence threats to lives, agrarian economies, and urban transport infrastructure. Traditional operational flood forecasts face three critical bottlenecks:
1. **Scarcity & Sparsity of In-situ Records**: Many Indian river basins have fragmented or missing streamflow gauges, making standard hydrological models difficult to calibrate reliably.
2. **Deterministic Output Fallacy**: Flooding is driven by meteorological uncertainty (extreme monsoonal rainfall, tropical cyclonic depressions). Deterministic single-number forecasts fail to convey tail risks.
3. **Decoupled Impact on Transit Networks**: Knowing that a river will rise by 2.5 meters does not tell emergency responders which roads, bridges, and ambulance evacuation corridors will become impassable.

**FloodPulse** bridges the gap between catchment-scale hydro-meteorological forecasting and street-level disaster response by:
- Pretraining a multi-basin LSTM on thousands of global catchments (Caravan) and transferring representations to Peninsular Indian basins (CAMELS-IND) with probabilistic quantile outputs ($q_{05} \dots q_{95}$).
- Combining Height Above Nearest Drainage (HAND), digital elevation, and Sentinel-1 SAR flood imagery to estimate 2D inundation depth and susceptibility.
- Mapping predicted flood depths onto the OpenStreetMap (OSM) highway network to derive edge-level road closure probabilities.
- Providing risk-penalized emergency routing for first responders.

---

## 2. Planned Architecture

```
+---------------------------------------------------------------------------------------+
|                                    Data Layer                                         |
|  - Global Catchment Hydrology: Caravan (CC-BY-4.0, Zenodo 6578598)                     |
|  - Peninsular India Catchments: CAMELS-IND (CC-BY-4.0 / Restricted, Zenodo 14005378)   |
|  - Terrain & Topography: MERIT Hydro / GLO-30 DEM (HAND, Slope, Drainage)              |
|  - Satellite SAR Imagery: Sentinel-1 C-Band GRD (Copernicus CDSE)                     |
|  - Road Networks: OpenStreetMap (ODbL, Geofabrik / Overpass)                          |
+---------------------------------------------------------------------------------------+
                                           |
                                           v
+---------------------------------------------------------------------------------------+
|                                   Core Pipeline                                       |
|                                                                                       |
|  [Stage 1: Multi-Basin LSTM]         [Stage 2: Terrain & SAR Susceptibility]          |
|  - Pretrained on Caravan             - HAND + Slope + SAR Water Masks                 |
|  - Fine-tuned on CAMELS-IND          - Calibrated flood extent raster                 |
|  - Quantile Heads: q05..q95          - Stage-to-inundation depth mapping             |
|                  \                                 /                                  |
|                   +---------------+---------------+                                   |
|                                   |                                                   |
|                                   v                                                   |
|                      [Stage 3: Road Closure Engine]                                   |
|                      - Depth-fragility curve over OSM graph                           |
|                      - P(Closure | depth, road_type)                                  |
|                                   |                                                   |
|                                   v                                                   |
|                      [Stage 4: Risk-Aware Emergency Routing]                          |
|                      - Risk-penalized Dijkstra / A* routing                           |
|                      - Cost: Travel_Time * (1 + lambda * P_closure)                   |
+---------------------------------------------------------------------------------------+
                                           |
                                           v
+---------------------------------------------------------------------------------------+
|                                   Serving & UX                                        |
|  - Backend: FastAPI + PostGIS (Docker Compose)                                        |
|  - Experiment Tracking: MLflow (KGE, NSE, Pinball Loss, CRPS)                         |
|  - Web UI: React + MapLibre GL JS interactive hazard dashboard                        |
|  - Situational Reporting: Grounded LLM Agent (strictly deterministic number schemas)  |
+---------------------------------------------------------------------------------------+
```

---

## 3. Project Roadmap

- [x] **Phase 1: Foundation & Evaluation First**
  - [x] Repository scaffold, pyproject.toml, strict ruff/mypy/pytest configuration.
  - [x] Core evaluation module (`src/floodpulse/evaluation/`): NSE, KGE, peak flow/timing errors, POD/FAR/CSI, pinball loss, CRPS, persistence & climatology baselines.
  - [x] Rigorous split utilities enforcing zero temporal and basin leakage.
  - [x] Data audit tooling (`scripts/download_caravan.py`, `scripts/download_camels_ind.py`, `notebooks/01_data_audit.ipynb`).
  - [x] Basin & city feasibility analysis (`docs/feasibility.md`).
  - [x] GitHub Actions CI workflow.
- [ ] **Phase 2: Hydrological Baselines & Single-Basin LSTM**
  - [ ] Implement and evaluate Naive Persistence & Day-of-Year Climatology baselines.
  - [ ] Single-basin PyTorch LSTM with asymmetric pinball loss for quantile streamflow forecasting.
  - [ ] Benchmark against verified CAMELS-IND streamflow observations.
- [ ] **Phase 3: Multi-Basin Transfer & Pretraining**
  - [ ] Global pretraining on Caravan catchments.
  - [ ] Domain adaptation and fine-tuning on Peninsular Indian basins.
  - [ ] Out-of-basin spatial generalization testing.
- [ ] **Phase 4: Terrain Susceptibility & Road Fragility**
  - [ ] HAND and slope feature extraction for candidate urban basin.
  - [ ] Sentinel-1 SAR inundation calibration.
  - [ ] OpenStreetMap graph extraction and depth-to-closure probability modeling.
- [ ] **Phase 5: Serving, Routing Engine & Web Dashboard**
  - [ ] Risk-penalized A* emergency routing service.
  - [ ] FastAPI endpoints + PostGIS spatial queries.
  - [ ] React + MapLibre GL frontend.
- [ ] **Phase 6: Grounded Incident Briefing Agent**
  - [ ] Civil defense situational reports driven strictly by deterministic pipeline outputs.

---

## 4. Evaluation Protocol

All models are evaluated under strict hydrological protocols:
- **No Random Splitting**: Data splits are strictly partitioned by **time** (chronological training: 1980–2005, validation: 2006–2012, testing: 2013–2020) and by **basin** (spatial hold-out basins).
- **Domain Metrics**: Kling-Gupta Efficiency (KGE), Nash-Sutcliffe Efficiency (NSE), Peak Flow Error (PFE), and Peak Timing Error (PTE).
- **Probabilistic Calibration**: Quantile Pinball Loss, Continuous Ranked Probability Score (CRPS), and Prediction Interval Coverage Probability (PICP).

See [`docs/evaluation_protocol.md`](docs/evaluation_protocol.md) for detailed definitions and equations.

---

## 5. Development & Testing

```bash
# Setup virtual environment
python -m venv .venv
source .venv/bin/activate  # Or on Windows: .venv\Scripts\activate

# Install dependencies in editable mode
pip install -e ".[dev]"

# Run code style & linting
ruff check .
ruff format --check .

# Run static type checking
mypy src tests

# Run unit tests
pytest tests/
```

---

## 6. Licences & Attributions

- FloodPulse software is licensed under the [MIT License](LICENSE).
- Datasets are governed by their respective licenses (Caravan: CC-BY-4.0; CAMELS-IND: CC-BY-4.0; OpenStreetMap: ODbL). See [`docs/data_sources_and_licences.md`](docs/data_sources_and_licences.md).
