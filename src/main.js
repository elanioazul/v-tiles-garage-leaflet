import './style.css'
import "leaflet/dist/leaflet.css";
import L from 'leaflet';
import wms from 'leaflet.wms';
import "leaflet.vectorgrid";
import 'leaflet-switch-basemap';
////////////////////////////////// commun setup
//////////////////////////////////
//////////////////////////////////
let config = {
  minZoom: 2,
  maxZoom: 18,
};
const zoom = 16;
const lat = 48.48024880;
const lng = 2.19373095;

const map = L.map("map", config).setView([lat, lng], zoom);

L.control.scale().addTo(map); 

// Patch if not present the wms plugin by attacing the plugin to the L namespace
if (wms && !L.wms) {
  L.wms = wms;
}
if (!L.wms) {
  console.error('leaflet.wms plugin is NOT loaded!');
} else {
  console.log('leaflet.wms plugin is loaded.');
}

const clickedContours = [];

// const osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
//   attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
// }).addTo(map);

const baseSwitcher = new L.basemapsSwitcher([
  {
    layer: L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map), //DEFAULT MAP
    icon: './assets/img1.PNG',
    name: 'Map one'
  },
  {
    layer: L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png',{
      attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
    }),
    icon: './assets/img2.PNG',
    name: 'Map two'
  },
  {
    layer: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    }),
    icon: './assets/img3.PNG',
    name: 'Map three'
  },
], { position: 'topright' }).addTo(map);


// var imageUrlWMS = `
// http://localhost:8081/geoserver/wms?
// service=WMS
// &version=1.1.1
// &request=GetMap
// &layers=testing_the_waters:treesminas
// &styles=testing_the_waters:treemine
// &bbox=2.193,48.479,2.195,48.482
// &width=500
// &height=500
// &srs=EPSG:4326
// &format=image/gif
// &time=2026-01-12,2026-01-13,2026-01-14
// &transparent=true`

// //wms/animate endpoint extitnto (https://discourse.osgeo.org/t/wms-animator-options-disapeared/151851)
// var imageUrlAnim1 = `
// http://localhost:8081/geoserver/wms/animate?LAYERS=testing_the_waters:treesminas
// &styles=testing_the_waters:treemine
// &aparam=time
// &avalues=2026-01-12,2026-01-13,2026-01-14
// &format=image/gif;subtype=animated
// &format_options=gif_loop_continuously:true;gif_frames_delay:1000`


var errorOverlayUrl = 'https://cdn-icons-png.flaticon.com/512/110/110641.png';
var latLngBounds = L.latLngBounds([[48.479, 2.193], [48.482, 2.195]]);

// var imageLayer = L.imageOverlay(imageUrlWMS, latLngBounds, {
//     opacity: 0.8,
//     errorOverlayUrl: errorOverlayUrl,
//     interactive: true
// }).addTo(map);

var times = ['2026-01-12', '2026-01-13', '2026-01-14'];
var currentIndex = 0;
var layer;

function updateAnimation() {
    var time = times[currentIndex];
    var url = `
      http://localhost:8081/geoserver/wms?service=WMS
      &version=1.1.1&request=GetMap
      &layers=testing_the_waters:treesminas
      &styles=testing_the_waters:treemine
      &bbox=2.193,48.479,2.195,48.482
      &width=500
      &height=500
      &srs=EPSG:4326
      &format=image/png
      &transparent=true
      &time=${time}
    `;
    
    if (layer) map.removeLayer(layer);
    
    layer = L.imageOverlay(url, latLngBounds, {
      opacity: 0.8,
      errorOverlayUrl: errorOverlayUrl,
      interactive: true
    }).addTo(map);
    
    currentIndex = (currentIndex + 1) % times.length;
}

// Change frame every 1 second
setInterval(updateAnimation, 1000);

//L.rectangle(latLngBounds, {color: "#c31818", weight: 1, fillOpacity: 0.1}).addTo(map);

// const pnoa = L.tileLayer.wms("http://www.ign.es/wms-inspire/pnoa-ma?SERVICE=WMS&", {
//     layers: "OI.OrthoimageCoverage",
//     format: 'image/jpeg',
//     transparent: true,
//     version: '1.3.0',
//     attribution: "PNOA WMS. Cedido por © Instituto Geográfico Nacional de España"
// }).addTo(map);

// const esriImagery = L.tileLayer('https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
//     attribution: 'Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community'
// }).addTo(map);

map.on("zoomend", (e) => {
  const zoom = e.target.getZoom();
  
  // Calculate resolution (meters per pixel) for EPSG:3857
  const earthCircumference = 40075017; // meters at the equator in Leaflet’s default EPSG:3857 CRS
  const tileSize = 256; // pixels
  const resolution = earthCircumference / (tileSize * Math.pow(2, zoom));
  
  // Calculate scale denominator using standardized pixel size (0.28 mm = 0.00028 m)
  const standardizedPixelSize = 0.00028; // meters
  const scaleDenominator = resolution / standardizedPixelSize;
  
  console.log(`Zoom Level: ${zoom}`);
  console.log(`Resolution: ${resolution.toFixed(6)} meters/pixel`);
  console.log(`Scale Denominator: ${Math.round(scaleDenominator)}`);
  
})



//////////////////////////////////
//CURVAS_NIVEL
//////////////////////////////////


//////////////////////////////////vector tiles martin postgres
//////////////////////////////////
// const url = 'http://localhost:3000/curvasnivel_opendem/{z}/{x}/{y}';
// const vectorTileStyling = {
//   curvasnivel_opendem: (properties, zoom) => {
//     const grossCalc = (ele) => {
//       if (ele % 200 === 0) {
//         return 2;
//       } else if (ele % 100 === 0) {
//         return 1;
//       } else {
//         return 0.5;
//       }
//     }
//     return {
//       weight: grossCalc(properties.elevation),
//       color: '#E0945E'
//     }
//   }
// }
// const vectorGrid = L.vectorGrid.protobuf(url, {
//   vectorTileLayerStyles: vectorTileStyling,
//   interactive: true,
//   minZoom: 15,
// }).addTo(map);

// vectorGrid.on('mouseover', function(e) {
//   console.log('Hovered feature properties:', e.layer.properties);

//   if (e.layer && e.latlng) {
//     L.popup()
//       .setLatLng(e.latlng)
//       .setContent(JSON.stringify(e.layer.properties, ['elevation', 'type'], 2))
//       .openOn(map);
//   }
// });

// vectorGrid.on('mouseout', function(e) {
//   map.closePopup();
// });



//////////////////////////////////geoserver wms
//////////////////////////////////
// L.tileLayer.wms('http://localhost:8080/geoserver/htl/wms?', {
//   layers: 'curvasnivel_mdt',
//   format: 'image/png',
//   version: '1.3.0',
//   styles: 'curvasnivel_mdt',
//   transparent: true,
// }).addTo(map);


//////////////////////////////////geoserver wmts
//////////////////////////////////
// L.tileLayer(
//   'http://localhost:8080/geoserver/gwc/service/wmts/rest/htl:curvasnivel_opendem/htl:curvasnivel_opendem_improved/WebMercatorQuad/{z}/{y}/{x}?format=image/png',
//   {
//     tileSize: 256,
//     attribution: 'GeoServer WMTS'
//   }
// ).addTo(map);


//////////////////////////////////geoserver vector tiles curvas nivel geom + wms curvas nivel labels
//////////////////////////////////
// const url = 'http://localhost:8080/geoserver/gwc/service/wmts/rest/htl:curvasnivel_opendem/htl:curvasnivel_opendem_v_tiles_extra/WebMercatorQuad/{z}/{y}/{x}?format=application/vnd.mapbox-vector-tile';
// const vectorTileStyling = {
//   curvasnivel_opendem: (properties, zoom) => {
//     const grossCalc = (ele) => {
//       if (ele % 200 === 0) {
//         return 2;
//       } else if (ele % 100 === 0) {
//         return 1;
//       } else {
//         return 0.5;
//       }
//     }
//     return {
//       weight: grossCalc(properties.elevation),
//       color: '#E0945E'
//     }
//   }
// }
// const vectorGrid = L.vectorGrid.protobuf(url, {
//   vectorTileLayerStyles: vectorTileStyling,
//   interactive: true,
//   getFeatureId: function(feature) {
//     // Adjust based on your actual properties; e.g., if there's a 'fid' or 'id' field
//     console.log(feature);
//     return feature.properties.id;  // Or feature.properties.id, or a combination like feature.properties.elevation + '_' + feature.properties.someOtherProp
//   }
// }).addTo(map);

// const curvasNivelWmsLabels = L.tileLayer.wms('http://localhost:8080/geoserver/htl/wms?', {
//   layers: 'curvasnivel_opendem',
//   format: 'image/png',
//   version: '1.3.0',
//   styles: 'curvasnivel_opendem_only_labels',
//   transparent: true,
// }).addTo(map);

// // Track the currently highlighted (hovered) and selected (clicked) feature IDs
// let currentHoverId = null;
// let currentSelectedId = null;

// vectorGrid.on('mouseover', function(e) {
//   console.log('Hovered feature properties:', e.layer.properties);

//   if (e.layer && e.latlng) {
//     L.popup()
//       .setLatLng(e.latlng)
//       .setContent(JSON.stringify(e.layer.properties, null, 2))
//       .openOn(map);
//   }

//   const id = vectorGrid.options.getFeatureId(e.layer);
//   // Only apply hover style if the feature is not currently selected
//   if (id !== currentHoverId && id !== currentSelectedId) {
//     if (currentHoverId !== null) {
//       vectorGrid.resetFeatureStyle(currentHoverId);
//     }
//     vectorGrid.setFeatureStyle(id, {
//       weight: 1,
//       color: '#eb4034',
//     });
//     currentHoverId = id;
//   }
// });

// vectorGrid.on('mouseout', function(e) {
//   map.closePopup();

//   if (currentHoverId !== null && currentHoverId !== currentSelectedId) {
//     vectorGrid.resetFeatureStyle(currentHighlightId);
//     currentHighlightId = null;
//   }
// });

// vectorGrid.on('click', function (e) {
//   console.log('Clicked feature properties:', e.layer.properties);
//   const id = vectorGrid.options.getFeatureId(e.layer);

//   // If the clicked feature is already selected, reset it
//   if (id === currentSelectedId) {
//     vectorGrid.resetFeatureStyle(id);
//     currentSelectedId = null;
//   } else {
//     // Reset previous selected feature, if any
//     if (currentSelectedId !== null) {
//       vectorGrid.resetFeatureStyle(currentSelectedId);
//     }
//     // Apply selected style to the clicked feature
//     vectorGrid.setFeatureStyle(id, {
//       weight: 1,
//       color: '#3449ebff',
//     });
//     currentSelectedId = id;
//   }

//   // Ensure hover state is cleared to avoid conflicts
//   if (currentHoverId !== null) {
//     vectorGrid.resetFeatureStyle(currentHoverId);
//     currentHoverId = null;
//   }
// });




//////////////////////////////////geoserver vector tiles with con labels from geoserver 
//////////////////////////////////using vt-labels and vt-label-attributes in the style (contours_custom_ordenance_v-tiles_labels)
//////////////////////////////////parecen venir ambas capas, pero contours_calc_labels directamente no la pinto
// const url = 'http://localhost:8080/geoserver/gwc/service/wmts/rest/htl:curvasnivel_opendem/htL:curvasnivel_opendem_v_tiles_labels/WebMercatorQuad/{z}/{y}/{x}?&vt-labels=true&vt-label-attributes=elevation&format=application/vnd.mapbox-vector-tile';
// const vectorTileStyling = {
//   curvasnivel_opendem: (properties, zoom) => {
//     console.log('contours_calc properties:', properties);
//     const grossCalc = (ele) => {
//       if (ele % 200 === 0) {
//         return 2;
//       } else if (ele % 100 === 0) {
//         return 1;
//       } else {
//         return 0.5;
//       }
//     }
//     return {
//       weight: grossCalc(properties.elevation),
//       color: '#E0945E'
//     }
//   },
//   curvasnivel_opendem_labels: function(properties, zoom) {
//     console.log('contours_calc_labels properties:', properties);
//     return {
//       radius: 5,
//       fillColor: "#ff0000",
//       color: "#000000",
//       weight: 1,
//       fillOpacity: 1,
//       opacity: 0
//     }
//   }
// }

// //saca las layers que vienen, igual que en custom-v-tiles-inspector repo
// const vectorTileStyling2 = new Proxy({}, {
//   get(target, layerName) {
//     console.log('Styling layer:', layerName);
//     return (properties, zoom) => ({
//       color: '#ff0',
//       weight: 1,
//       fillOpacity: 0.4
//     });
//   }
// });
// const vectorGrid = L.vectorGrid.protobuf(url, {
//   vectorTileLayerStyles: vectorTileStyling,
//   interactive: true,
//   // getFeatureId: f => {
//   //   //console.log('Feature:', f);
//   //   return f.id || f.properties && f.properties.elevation;
//   // }
// }).addTo(map);

// vectorGrid.on('mouseover', function(e) {
//   console.log('Hovered feature properties:', e.layer.properties);
//   console.log('Hovered feature:', e.layerName, e.layer && e.layer.properties);

//   if (e.layer && e.latlng) {
//     L.popup()
//       .setLatLng(e.latlng)
//       .setContent(JSON.stringify(e.layer.properties, null, 2))
//       .openOn(map);
//   }
// });

// vectorGrid.on('mouseout', function(e) {
//   map.closePopup();
// });


//////////////////////////////////vector tiles custom loader v-tiles 
//////////////////////////////////
//////////////////////////////////
// const vectorGrid = L.vectorGrid.protobuf('http://localhost:5002/tiles/{z}/{x}/{y}.mvt', {
//   vectorTileLayerStyles: {
//     'tiles': {
//       color: 'red',
//       fill: true,
//       weight: 1,
//     }
//   },
//   minZoom: 15,
//   interactive: true
// }).addTo(map);

// vectorGrid.on('mouseover', function(e) {
//   console.log('Hovered feature properties:', e.layer.properties);
//   if (e.layer && e.latlng) {
//     L.popup()
//       .setLatLng(e.latlng)
//       .setContent(JSON.stringify(e.layer.properties, ['elevation', 'type'], 2))
//       .openOn(map);
//   }
// });
// vectorGrid.on('mouseout', function(e) {
//   map.closePopup();
// });



//////////////////////////////////
//ADMIN_DIVISION
//////////////////////////////////

//////////////////////////////////geoserver wms tiled
//////////////////////////////////
// L.tileLayer.wms('http://localhost:8080/geoserver/htl/wms?', {
//   layers: 'geoboundaries',
//   format: 'image/png',
//   version: '1.3.0',
//   styles: '',
//   transparent: true,
//   tiled: false
// }).addTo(map);
// L.tileLayer.wms('http://localhost:8080/geoserver/htl/wms?', {
//   layers: 'htl:geoboundaries_adm0',
//   format: 'image/png',
//   version: '1.1.0',
//   styles: 'htl:geoboundaries_adm0',
//   transparent: true,
// }).addTo(map);
// L.tileLayer.wms('http://localhost:8080/geoserver/htl/wms?', {
//   layers: 'htl:geoboundaries_adm1',
//   format: 'image/png',
//   version: '1.3.0',
//   styles: 'htl:geoboundaries_adm1',
//   transparent: true,
// }).addTo(map);
// L.tileLayer.wms('http://localhost:8080/geoserver/htl/wms?', {
//   layers: 'htl:geoboundaries_adm2',
//   format: 'image/png',
//   version: '1.3.0',
//   styles: 'htl:geoboundaries_adm2',
//   transparent: true,
// }).addTo(map);


//////////////////////////////////geoserver wms no-tiled
//////////////////////////////////
// L.wms.overlay('http://localhost:8080/geoserver/htl/wms?', {
//   layers: 'htl:geoboundaries',
//   styles: '',
//   format: 'image/png',
//   transparent: 'true',
//   version: '1.1.0'
// }).addTo(map);
// L.wms.overlay('http://localhost:8080/geoserver/htl/wms?', {
//   layers: 'htl:geoboundaries_adm0',
//   styles: 'htl:geoboundaries_adm0',
//   format: 'image/png',
//   transparent: 'true',
//   version: '1.1.0'
// }).addTo(map);
// L.wms.overlay('http://localhost:8080/geoserver/htl/wms?', {
//   layers: 'htl:geoboundaries_adm1',
//   styles: 'htl:geoboundaries_adm1',
//   format: 'image/png',
//   transparent: 'true',
//   version: '1.1.0'
// }).addTo(map);
// L.wms.overlay('http://localhost:8080/geoserver/htl/wms?', {
//   layers: 'htl:geoboundaries_adm2',
//   styles: 'htl:geoboundaries_adm2', 
//   format: 'image/png',
//   transparent: 'true',
//   version: '1.1.0'
// }).addTo(map);

//////////////////////////////////geoserver wmts
//////////////////////////////////
// L.tileLayer(
//   'http://localhost:8080/geoserver/gwc/service/wmts/rest/htl:geoboundaries/WebMercatorQuad/{z}/{y}/{x}?format=image/png',
//   {
//     tileSize: 256,
//     attribution: 'GeoServer WMTS'
//   }
// ).addTo(map);


//////////////////////////////////geoserver wmts polygons and wms labels
//////////////////////////////////

// //ne:countries
// const geoserverDefaultCountries = L.wms.overlay('http://localhost:8080/geoserver/ne/wms?', {
//   layers: 'ne:countries',
//   styles: '',
//   format: 'image/png',
//   transparent: 'true',
//   version: '1.1.0'
// }).addTo(map);


// //geoboundaries_adm0
// const polygonsLabels_adm3 = L.wms.overlay('http://localhost:8080/geoserver/htl/wms?', {
//   layers: 'htl:geoboundaries_adm0',
//   styles: 'htl:geoboundaries_adm0_labels',
//   format: 'image/png',
//   transparent: 'true',
//   version: '1.1.0'
// }).addTo(map);
// const polygonsGeom_adm3 = L.tileLayer(
//   'http://localhost:8080/geoserver/gwc/service/wmts/rest/htl:geoboundaries_adm0/htl:geoboundaries_adm0_polygons/WebMercatorQuad/{z}/{y}/{x}?format=image/png',
//   {
//     tileSize: 256,
//     attribution: 'GeoServer WMTS'
//   }
// ).addTo(map);

// //geoboundaries_adm1
// const polygonsLabels_adm1 = L.wms.overlay('http://localhost:8080/geoserver/htl/wms?', {
//   layers: 'htl:geoboundaries_adm1',
//   styles: 'htl:geoboundaries_adm1_labels',
//   format: 'image/png',
//   transparent: 'true',
//   version: '1.1.0'
// }).addTo(map);
// const polygonsGeom_adm1 = L.tileLayer(
//   'http://localhost:8080/geoserver/gwc/service/wmts/rest/htl:geoboundaries_adm1/htl:geoboundaries_adm1_polygons/WebMercatorQuad/{z}/{y}/{x}?format=image/png',
//   {
//     tileSize: 256,
//     attribution: 'GeoServer WMTS'
//   }
// ).addTo(map);

// //geoboundaries_adm2
// const polygonsLabels_adm2 = L.wms.overlay('http://localhost:8080/geoserver/htl/wms?', {
//   layers: 'htl:geoboundaries_adm2',
//   styles: 'htl:geoboundaries_adm2_labels',
//   format: 'image/png',
//   transparent: 'true',
//   version: '1.1.0'
// }).addTo(map);
// const polygonsGeom_adm2 = L.tileLayer(
//   'http://localhost:8080/geoserver/gwc/service/wmts/rest/htl:geoboundaries_adm2/htl:geoboundaries_adm2_polygons/WebMercatorQuad/{z}/{y}/{x}?format=image/png',
//   {
//     tileSize: 256,
//     attribution: 'GeoServer WMTS'
//   }
// ).addTo(map);