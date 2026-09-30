# Verified Data Sources and Licences

Every dataset utilized or referenced by FloodPulse is vetted for provenance, official hosting URL, licensing constraints, and access restrictions. No placeholder or unverified links are permitted.

| Dataset | Provider / Authors | Verified URL / DOI | Licence | Access / Verification Status |
| :--- | :--- | :--- | :--- | :--- |
| **Caravan** | Frederik Kratzert et al. (Nature Sci Data 2023) | [https://doi.org/10.5281/zenodo.6578598](https://doi.org/10.5281/zenodo.6578598) | **CC-BY-4.0** | **Verified Open Access**. Direct download via Zenodo API / files archive. |
| **CAMELS-IND** | Nikunj K. Mangukiya, Ashutosh Sharma et al. (ESSD 2025) | [https://doi.org/10.5281/zenodo.14005378](https://doi.org/10.5281/zenodo.14005378) | **CC-BY-4.0** | **Verified Restricted**. Zenodo requires free user access request per author policy. 242 catchments with >30% observed streamflow. |
| **Sentinel-1 GRD SAR** | European Space Agency (ESA) / Copernicus | [https://dataspace.copernicus.eu/](https://dataspace.copernicus.eu/) | **Copernicus Open Access** | **Verified Open Access**. Free registration on CDSE (Copernicus Data Space Ecosystem) required for API download. |
| **MERIT Hydro / HAND** | Yamazaki et al. (Water Resour. Res. 2019) / Univ. of Tokyo | [http://hydro.iis.u-tokyo.ac.jp/~yamadai/MERIT_Hydro/](http://hydro.iis.u-tokyo.ac.jp/~yamadai/MERIT_Hydro/) | **CC-BY-NC 4.0** or Open for Research | **Verified Available**. Global 3-arcsec (90m) hydrography and HAND dataset. |
| **Copernicus DEM (GLO-30)** | European Space Agency (ESA) | [https://spacedata.copernicus.eu/](https://spacedata.copernicus.eu/) | **Copernicus Open Access** | **Verified Open Access**. 30m resolution elevation models. |
| **OpenStreetMap (OSM)** | OpenStreetMap Contributors | [https://www.openstreetmap.org/](https://www.openstreetmap.org/) / [https://download.geofabrik.de/asia/india.html](https://download.geofabrik.de/asia/india.html) | **ODbL (Open Database License)** | **Verified Open Access**. Free road network graphs via Geofabrik Indian regional extracts and Overpass API. |
| **India-WRIS / CWC Gauges** | Central Water Commission / MoJS India | [https://indiawris.gov.in/wris/](https://indiawris.gov.in/wris/) | **Government Open Data (NDSAP)** | **Verified Public Web Portal**. Underlying gauge data integrated within CAMELS-IND. |

---

## Detailed Notes on Restricted Access Datasets

### CAMELS-IND Access Protocol
1. CAMELS-IND is hosted on Zenodo under DOI `10.5281/zenodo.14005378`.
2. Although published under the permissive `CC-BY-4.0` license, the Zenodo deposit status is flagged as `"access_right": "restricted"`.
3. Downloading files (`CAMELS_IND_Catchments_Streamflow_Sufficient.zip` and attribute spreadsheets) requires submitting a Zenodo access request form.
4. In `scripts/download_camels_ind.py`, FloodPulse supports providing a `--token` for automated Zenodo API authentication once access has been approved, or extracting locally placed archives.
