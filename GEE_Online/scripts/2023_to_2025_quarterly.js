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
            .filter(ee.Filter.eq('NAME', 'Massachusetts'))
            .geometry();
}

Map.addLayer(aoi, {}, 'AOI');
print("AOI loaded ...");

////////////////////////////////
// Compute NDVI from 2023-01-01 to 2025-12-31
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
  .filterDate('2023-01-01', '2025-12-31')
  .map(maskS2clouds)
  .map(function(img){
    var ndvi = img.normalizedDifference(['B8', 'B4']).rename('NDVI');
    return ndvi.copyProperties(img, ['system:time_start']);
  });

print("Finished computing NDVI from 2023-01-01 to 2025-12-31.");

////////////////////////////////
// Compute each quarter's NDVI from 2023-01-01 to 2025-12-31
////////////////////////////////
// Years and quarters
var years = ee.List.sequence(2023, 2025);
var quarters = ee.List.sequence(1, 4);

// Map over years
var multiYearQuarterlyNDVI = years.map(function(y){
  var year = ee.Number(y);
  
  // Map over quarters
  var quarterlyImages = quarters.map(function(q){
    var startMonth = ee.Number(q).multiply(3).subtract(2);
    var start = ee.Date.fromYMD(year, startMonth, 1);
    var end = start.advance(3, 'month');
    
    var quarterlyImg = s2
      .filterDate(start, end)
      .median()
      .set('year', year)
      .set('quarter', q)
      .set('system:time_start', start.millis())
      .clip(aoi);
    
    return quarterlyImg;
  });
  
  return quarterlyImages;
}).flatten();  // flatten to a single list of images

// Convert to ImageCollection
var quarterlyNDVICol = ee.ImageCollection.fromImages(multiYearQuarterlyNDVI);

print("Finished computing each quarter's NDVI from 2023-01-01 to 2025-12-31.");

////////////////////////////////
// Visualize and save NDVI
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

// Add all quarters to the map
var yearsList = ee.List.sequence(2023, 2025);

yearsList.getInfo().forEach(function(y){
  for (var q=1; q<=4; q++){
    var img = quarterlyNDVICol
      .filter(ee.Filter.eq('year', y))
      .filter(ee.Filter.eq('quarter', q))
      .first();
    
    Map.addLayer(img, ndviVis, regionName + '_NDVI Year ' + y + ' Q' + q);
    
    // Export to Google Drive
    var fileName = regionName + '_NDVI_' + y + '_Q' + q;
    Export.image.toDrive({
      image: img,
      description: fileName,
      folder: 'GEE_NDVI_Export',
      fileNamePrefix: fileName,
      region: aoi,
      scale: 10,
      crs: 'EPSG:4326',
      maxPixels: 1e13,
      fileFormat: 'GeoTIFF'
    });
  }
});
