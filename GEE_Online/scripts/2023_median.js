////////////////////////////////
// Load uploaded boundary
////////////////////////////////
var regionName = 'MA'; // Provide either 'Boston' or 'MA'

if (regionName === 'Boston'){
  // For Boston, load the shape object stored in assets
  var aoi_path = "projects/boston-greenspace/assets/boston_aoi";
  var aoi = ee.FeatureCollection(aoi_path);
} else {
  // Load a state from TIGER dataset
  var aoi = ee.FeatureCollection("TIGER/2018/States")
            // .filter(ee.Filter.eq('NAME', 'Arizona'))
            .filter(ee.Filter.eq('NAME', 'Massachusetts'))
            .geometry();
}

Map.addLayer(aoi, {});
print("AOI loaded ...");

////////////////////////////////
// Compute NDVI
////////////////////////////////

// Mask function using SCL
// Remove pixels that are contaminated by clouds, cloud shadows, cirrus, or snow, 
// leaving only “good” surface pixels for analysis.
function maskS2clouds(img) {
  var scl = img.select('SCL');
  var mask = scl.neq(3)   // cloud shadow
              .and(scl.neq(8))  // medium cloud
              .and(scl.neq(9))  // cloud
              .and(scl.neq(10)) // thin cirrus
              .and(scl.neq(11)); // snow/ice
  return img.updateMask(mask);
}

var s2 = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
  .filterBounds(aoi)
  .filterDate('2023-01-01', '2023-12-31')
  .map(maskS2clouds)
  .map(function(img){
    var ndvi = img.normalizedDifference(['B8', 'B4']).rename('NDVI');
    return ndvi.copyProperties(img, ['system:time_start']);
  });

print("Finished computing NDVI.");

var ndvi2023 = s2.median().clip(aoi);

////////////////////////////////
// Visualize NDVI
////////////////////////////////

// Visualization parameters (TBD)
// var ndviVis = {min: -1, max: 1, palette: ['blue', 'white', 'green']};
var ndviVis = {
  min: 0,
  max: 1,
  palette: [
    'ffffff', 'ce7e45', 'df923d', 'f1b555', 'fcd163', '99b718', '74a901',
    '66a000', '529400', '3e8601', '207401', '056201', '004c00', '023b01',
    '012e01', '011d01', '011301'
  ],
};

// Add to map
if (regionName === 'Boston'){
  Map.centerObject(aoi, 11);
} else {
  Map.centerObject(aoi, 8);
}

Map.addLayer(ndvi2023, ndviVis, 'Median NDVI 2023');
print("Finished plotting.");

////////////////////////////////
// Export NDVI
////////////////////////////////
Export.image.toDrive({
  image: ndvi2023,
  description: 'NDVI_2023_MA',    // Task name
  folder: 'GEE_NDVI_Export', // Folder in Google Drive
  fileNamePrefix: 'NDVI_2023_MA', // File name
  region: aoi,                    // Must be ee.Geometry or GeoJSON
  scale: 10,                      // Pixel resolution (meters)
  crs: 'EPSG:4326',               // Coordinate reference system
  maxPixels: 1e13,                // Large number to allow full export
  fileFormat: 'GeoTIFF'
});
