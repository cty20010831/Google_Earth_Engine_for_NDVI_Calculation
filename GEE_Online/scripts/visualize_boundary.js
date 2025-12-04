// Load uploaded boundary
// var aoi_path = "projects/boston-greenspace/assets/boston_aoi"
var aoi_path = "projects/boston-greenspace/assets/ma_aoi"
var aoi = ee.FeatureCollection(aoi_path);

// Center the map on my study area
Map.centerObject(aoi, 11);  // zoom level 11 (adjust 0-20)

// Add the boundary to the map with a red outline
Map.addLayer(
  aoi.style({
    color: 'red',           // Outline color
    fillColor: '00000000'   // Transparent fill (00000000 = transparent)
  }),
  {},
  'AOI Boundary'    // Layer name in map
);