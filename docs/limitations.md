# Known System Limitations and Engineering Realities

Honest disclosure of assumptions, physical limitations, and operational boundaries is essential for safety-critical flood emergency systems.

---

## 1. Reservoir Operations & Anthropogenic Regulation
- **Limitation**: Major Peninsular Indian river basins (e.g., Godavari, Mahanadi, Krishna, Cauvery) have high degrees of regulation via multi-purpose dams (e.g., Hirakud, Srisailam, Nagarjuna Sagar, Mettur).
- **Impact**: Pure rainfall-runoff models predict naturalized/catchment-driven streamflow. Sudden emergency reservoir gate openings cannot be predicted purely from meteorology unless real-time reservoir outflow reports are ingested as boundary conditions.

## 2. Streamflow Gauge Data Sparsity & Extreme Event Gaps
- **Limitation**: In CAMELS-IND, out of 472 basins, only 228 to 242 have observed streamflow for more than 30% of the period 1980–2020.
- **Impact**: In extreme flood peaks, physical river gauges can submerge, wash out, or become inaccessible, leading to censored or missing peak observations precisely during catastrophic events.

## 3. Remote Sensing Revisit & Temporal Latency
- **Limitation**: Sentinel-1 C-band SAR satellite passes provide repeat coverage roughly every 6 to 12 days over any given Indian path.
- **Impact**: Fast-rising flash floods that peak and recede within 24–48 hours may be missed by Sentinel-1 if the flood peak does not coincide with the orbital pass.

## 4. Fluvial vs. Pluvial Urban Flooding
- **Limitation**: FloodPulse models riverine (fluvial) overtopping using catchment hydrology and Height Above Nearest Drainage (HAND).
- **Impact**: Localized urban street flooding caused by clogged stormwater drains or intense localized convective downpours (pluvial inundation) requires sub-meter urban hydraulic modeling (e.g., SWMM / 2D hydrodynamic mesh), which is beyond regional catchment models.

## 5. Road Network Elevation & Bridge Inferences
- **Limitation**: OpenStreetMap provides road centerline topology and attributes (tags like `bridge=yes`, `tunnel=yes`, `layer=1`), but typically lacks sub-meter vertical roadway embankment profiles.
- **Impact**: An elevated highway or flyover crossing an inundated floodplain might be falsely flagged as inundated if bridge tagging is incomplete in the raw OSM extract.
