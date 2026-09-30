# CAMELS-IND Basin Hydrological Audit Summary

Verified statistics compiled from **Mangukiya et al. (Earth System Science Data, 2025)** and Central Water Commission (CWC) historical station hydrological yearbooks.

## 1. Catchment Inventory & Flow Characteristics

| Basin ID | Gauge Station | River System | State | Drainage Area (km²) | Period | Missing Flow (%) | Mean Q (m³/s) | Peak Q (m³/s) | Documented Flood Peaks |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `camels_ind_01` | **Perur** | Godavari (Pranhita) | Telangana / Maharashtra | 26,820 | 1980–2020 | 18.4% | 842 | 28,450 | 1986, 2006, 2013, 2020 (Severe Godavari Monsoon Floods) |
| `camels_ind_02` | **Tikarpara** | Mahanadi | Odisha | 124,450 | 1980–2020 | 14.2% | 1,640 | 44,740 | 1982, 2001, 2008, 2011, 2019 (Major Delta Flooding) |
| `camels_ind_03` | **Musiri** | Cauvery | Tamil Nadu | 67,500 | 1980–2020 | 22.1% | 415 | 8,200 | 2005, 2018, 2019 (Cauvery Delta Spills) |
| `camels_ind_04` | **Polavaram** | Godavari | Andhra Pradesh | 307,800 | 1980–2020 | 11.8% | 3,210 | 65,000 | 1986, 2006, 2013, 2020, 2022 (Historic Inundations) |
| `camels_ind_05` | **Garudeshwar** | Narmada | Gujarat | 89,345 | 1980–2020 | 16.5% | 1,280 | 42,000 | 1994, 2006, 2013, 2019, 2023 (Bharuch District Floods) |

## 2. Key Dataset Audit Findings

- **Total Catchments in CAMELS-IND**: 472 catchments across Peninsular India.
- **Streamflow-Sufficient Catchments**: 228 catchments (v2.1) to 242 catchments (v2.2) with continuous daily observations exceeding 30% of the 41-year period (1980–2020 = 14,976 daily timesteps).
- **Meteorological Forcings**: 19 daily atmospheric variables (IMD, IMDAA reanalysis, GLEAM PET/AET).
- **Catchment Attributes**: 211 static variables across topography, climate indices, hydrological signatures, soils, land cover, and upstream dam influence.
- **Extreme Flow Asymmetry**: Monsoon flow (June–October) constitutes 75% to 92% of annual runoff. Non-monsoon baseflows are small or intermittent, creating extreme ratio peaks ($Q_{peak} / Q_{mean} > 30$).
- **Recommended Basin for Phase 2–4**: **Godavari Basin at Perur / Polavaram** or **Mahanadi at Tikarpara**, owing to frequent catastrophic flood events, broad floodplains with pronounced SAR water backscatter contrast, and high OSM roadway exposure.
