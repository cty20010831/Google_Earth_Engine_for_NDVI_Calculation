import geopandas as gpd
from pathlib import Path
import os
import warnings

warnings.filterwarnings('ignore')

dir = Path(__file__).parent.absolute()

file_mapping = {
    'Massachusetts_State_Plane/Boston_Neighborhood_Boundaries.shp': 'boston_aoi.shp',
    'Massachusetts_State_Plane/TOWNSSURVEY_POLYM_GENCOAST.shp': 'ma_aoi.shp'
}

for i, v in file_mapping.items():
    print(f"Processing file: {i} -> {v}")

    # Read the shapefile
    gdf = gpd.read_file(os.path.join(dir, i))

    # Set the current CRS (Massachusetts State Plane)
    gdf = gdf.set_crs('EPSG:26986') # Checked EPSG code 

    sample_bounds = gdf.geometry.bounds.iloc[0]
    print(f"Sample bounds before reprojection: {sample_bounds}")

    # Reproject to EPSG:4326 (WGS84 lat/lon)
    gdf_reprojected = gdf.to_crs('EPSG:4326')

    sample_bounds = gdf_reprojected.geometry.bounds.iloc[0]
    print(f"Sample bounds after reprojection: {sample_bounds}")

    # Save as new shapefile
    gdf_reprojected.to_file(os.path.join(dir, v))

    print("Reprojected shapefile saved!")