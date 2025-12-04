# Google Earth Engine for NDVI Calculation

## Workflow for Calculating Quartely NDVI (Boston or MA Area from 2023 to 2025)

### Phase 1: Setup & Account Management

#### 1.1 Register for Google Earth Engine
- Go to https://earthengine.google.com/signup/
- Sign in with your Gmail/Google account
- **CRITICAL**: Verify your noncommercial eligibility status when prompted (required for all academic accounts)

#### 1.2 Access the Earth Engine Code Editor
- Navigate to https://code.earthengine.google.com/
- Login with your registered account
- Familiarize yourself with the IDE:
  - **Left panel**: Scripts, Assets, and documentation
  - **Center panel**: Code editor (JavaScript)
  - **Right panel**: Map viewer and console output
  - **Tasks tab**: Track and manage export jobs

#### 1.3 Understand the Workflow Architecture
- **Input**: Study area geometry (Boston or MA region) + date range (2023-2025)
- **Processing**: Load image collection → filter → calculate NDVI → create quarterly composites
- **Output**: Export monthly NDVI rasters to Google Drive as GeoTIFF

---

### Phase 2: Define Study Area
1. Download shapefiles of [Massachusetts state](https://www.mass.gov/info-details/massgis-data-municipalities) and [Boston city](https://gis.data.mass.gov/datasets/boston::boston-neighborhood-boundaries/about) under "GEE_Online/assets/Massachusetts_State_Plane" directory.
2. Run the conversion script to transform the crs to EPSG:4326:
```bash
python3 GEE/assets/format_conversion.py
```
3. Go to "Assets" tab → "New" → "Shape files"
4. Upload these boundary files and name them as `ma_aoi` and `boston_aoi` respectively
5. Reference them in code: `ee.FeatureCollection("")`

Note: You can also use pre-built boundaries in GEE if you prefer (by calling 
`ee.FeatureCollection` with appropriate dataset ID). I finally did use pre-built
boundaries for Massachusetts. 

---

### Phase 3: Load and Filter Satellite Data and Calcuate Quartely NDVI from 2023 to 2025
I chose **Sentinel-2** ('COPERNICUS/S2_SR_HARMONIZED') with 10m spatial resolution and frequent revisit (5 days) for this workflow (for coarser resolution needs, Landsat 8-9 or MODIS could be alternatives). I created functions to a mask function using SCL. Then, I used B8 (NIR) and B4 (Red) bands to calculate NDVI from 2023 to 2025, before deriving the median estimate of each of the 12 quarters within the 3-year period. Finally, I visualized each quarterly NDVI on the map and exported them to Google Drive. 

For detailed code, please refer to [2023_to_2025_quarterly.js](GEE_Online/scripts/2023_to_2025_quarterly.js). There is also ([2023_median.js](GEE_Online/scripts/2023_median.js), which is just an exploration code for GEE that calculates median NDVI for the whole year of 2023).

---

## Useful Resources for Google Earth Engine

### Datasets
- [Earth Engine Data](https://developers.google.com/earth-engine/datasets/)

---

### Tutorials
- [GEE Official Guides](https://developers.google.com/earth-engine/guides)
- [GEE Book](https://www.eefabook.org/)
- [Processing and Downloading NDVI Data Using Google Earth Engine](https://www.datawim.com/post/download-ndvi-data-using-google-earth-engine/)
- [Monitoring Vegetation Health with Google Earth Engine: A Complete NDVI Analysis Tutorial](https://www.mapcrafty.com/posts/Google_Earth_Engine_NDVI_Analysis_Tutorial/)
- [NDVI, Mapping a Function over a Collection, Quality Mosaicking](https://developers.google.com/earth-engine/tutorials/tutorial_api_06)
- [YouTube: How to Calculate NDVI Using Landsat 9](https://www.youtube.com/watch?v=qW3dzrkdzkU&list=PLajaK_7aADSCpV7_zUKwQCE0jCtZ2vIFH&index=9)