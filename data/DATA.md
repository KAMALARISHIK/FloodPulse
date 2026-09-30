# FloodPulse Data Acquisition Guide

This document provides exact, verified instructions for acquiring, verifying, and storing each dataset used across FloodPulse.

> **Storage Rule**: All raw data files and large processed arrays are stored under `data/raw/` and `data/processed/`, which are git-ignored. Never commit raw or processed binary datasets into git.

---

## 1. Caravan Global Hydrological Dataset
- **Description**: Open-community large-sample hydrology dataset aggregating daily meteorological forcings (ERA5-Land), catchment attributes, and discharge data for thousands of basins across the world.
- **Reference**: Kratzert, F., et al. (2023). Caravan – A global community dataset for large-sample hydrology. *Scientific Data*, 10(1), 61.
- **Official Repository**: [https://doi.org/10.5281/zenodo.6578598](https://doi.org/10.5281/zenodo.6578598)
- **License**: CC-BY-4.0 (Creative Commons Attribution 4.0 International)
- **Automated Fetching**:
  ```bash
  python scripts/download_caravan.py --output-dir data/raw/caravan
  ```
- **Manual Acquisition**:
  1. Visit Zenodo record `6578598`.
  2. Download `timeseries/csv` or `timeseries/netcdf` and `attributes`.
  3. Extract into `data/raw/caravan/`.

---

## 2. CAMELS-IND (Indian Catchment Hydrometeorology)
- **Description**: Hydrometeorological daily time series (1980–2020), 19 atmospheric forcings (IMDAA, IMD, GLEAM), 211 static catchment attributes, and streamflow observations for 472 Peninsular Indian catchments (228/242 gauges with >30% observed record).
- **Reference**: Mangukiya, N. K., Kumar, K. B., Dey, P., Sharma, S., Bejagam, V., Mujumdar, P. P., and Sharma, A. (2025). CAMELS-IND: hydrometeorological time series and catchment attributes for 228 catchments in Peninsular India. *Earth System Science Data*, 17, 461–491. https://doi.org/10.5194/essd-17-461-2025
- **Official Repository**: [https://doi.org/10.5281/zenodo.14005378](https://doi.org/10.5281/zenodo.14005378)
- **License**: CC-BY-4.0
- **Access Status**: Zenodo access is currently listed as **Restricted / Access Request**.
  - To request access: Log into Zenodo and submit an access request specifying research/academic use to the dataset authors (Prof. Ashutosh Sharma, IIT Roorkee; Nikunj K. Mangukiya).
  - Once granted, download `CAMELS_IND_Catchments_Streamflow_Sufficient.zip` and catchment attribute tables.
- **Automated Fetching Tool**:
  ```bash
  # If a Zenodo API token with granted access is available:
  python scripts/download_camels_ind.py --output-dir data/raw/camels_ind --token <ZENODO_ACCESS_TOKEN>
  ```
- **Place files at**: `data/raw/camels_ind/`

---

## 3. High-Resolution Digital Elevation & Terrain (HAND / Slope)
- **Source**: MERIT Hydro / HydroSHEDS / Copernicus GLO-30 DEM
  - MERIT Hydro: [http://hydro.iis.u-tokyo.ac.jp/~yamadai/MERIT_Hydro/](http://hydro.iis.u-tokyo.ac.jp/~yamadai/MERIT_Hydro/) (Yamazaki et al., 2019)
  - HydroSHEDS: [https://www.hydrosheds.org/](https://www.hydrosheds.org/)
  - Copernicus DEM: Open access via Copernicus Data Space Ecosystem
- **Variables**: Height Above Nearest Drainage (HAND), slope, flow direction, flow accumulation, river network lines.
- **Place files at**: `data/raw/terrain/`

---

## 4. Synthetic Aperture Radar (SAR) Flood Extent Imagery
- **Source**: Sentinel-1 C-band Synthetic Aperture Radar (GRD - Ground Range Detected)
- **Portal**: Copernicus Data Space Ecosystem (CDSE): [https://dataspace.copernicus.eu/](https://dataspace.copernicus.eu/)
- **Usage**: Water-vs-land backscatter thresholding (Otsu / adaptive bimodal thresholding) during verified historical flood event dates.
- **Place files at**: `data/raw/sar/`

---

## 5. Road Network Infrastructure
- **Source**: OpenStreetMap (OSM) via Geofabrik regional dumps or Overpass API
- **License**: Open Database License (ODbL)
- **Coverage**: Highway network (motorway, trunk, primary, secondary, tertiary, residential) for the target urban basin.
- **Place files at**: `data/raw/osm/`
