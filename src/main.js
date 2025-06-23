import './style.css'
import "leaflet/dist/leaflet.css";
import L from 'leaflet';
import wms from 'leaflet.wms';
import "leaflet.vectorgrid";

////////////////////////////////// commun setup
//////////////////////////////////
//////////////////////////////////
let config = {
  minZoom: 2,
  maxZoom: 18,
};
const zoom = 15;
const lat = 40.85024106;
const lng = -3.95526317;

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



const osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

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
  console.log(e.target._zoom);
  
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
//   'http://localhost:8080/geoserver/gwc/service/wmts/rest/htl:curvasnivel_opendem/htl:curvasnivel_opendem/WebMercatorQuad/{z}/{y}/{x}?format=image/png',
//   {
//     tileSize: 256,
//     attribution: 'GeoServer WMTS'
//   }
// ).addTo(map);


//////////////////////////////////geoserver vector tiles curvas nivel geom + wms curvas nivel labels
//////////////////////////////////
const url = 'http://localhost:8080/geoserver/gwc/service/wmts/rest/htl:curvasnivel_opendem/htl:curvasnivel_opendem_v_tiles/WebMercatorQuad/{z}/{y}/{x}?format=application/vnd.mapbox-vector-tile';
const vectorTileStyling = {
  curvasnivel_opendem: (properties, zoom) => {
    const grossCalc = (ele) => {
      if (ele % 200 === 0) {
        return 2;
      } else if (ele % 100 === 0) {
        return 1;
      } else {
        return 0.5;
      }
    }
    return {
      weight: grossCalc(properties.elevation),
      color: '#E0945E'
    }
  }
}
const vectorGrid = L.vectorGrid.protobuf(url, {
  vectorTileLayerStyles: vectorTileStyling,
  interactive: true
}).addTo(map);

const curvasNivelWmsLabels = L.tileLayer.wms('http://localhost:8080/geoserver/htl/wms?', {
  layers: 'curvasnivel_opendem',
  format: 'image/png',
  version: '1.3.0',
  styles: 'curvasnivel_opendem_only_labels',
  transparent: true,
}).addTo(map);

vectorGrid.on('mouseover', function(e) {
  console.log('Hovered feature properties:', e.layer.properties);

  if (e.layer && e.latlng) {
    L.popup()
      .setLatLng(e.latlng)
      .setContent(JSON.stringify(e.layer.properties, null, 2))
      .openOn(map);
  }
});

vectorGrid.on('mouseout', function(e) {
  map.closePopup();
});




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
// const polygonsLabels = L.wms.overlay('http://localhost:8080/geoserver/htl/wms?', {
//   layers: 'htl:geoboundaries_adm0',
//   styles: 'htl:geoboundaries_adm0_labels',
//   format: 'image/png',
//   transparent: 'true',
//   version: '1.1.0'
// }).addTo(map);
// const polygonsGeom = L.tileLayer(
//   'http://localhost:8080/geoserver/gwc/service/wmts/rest/htl:geoboundaries_adm0/htl:geoboundaries_adm0_polygons/WebMercatorQuad/{z}/{y}/{x}?format=image/png',
//   {
//     tileSize: 256,
//     attribution: 'GeoServer WMTS'
//   }
// ).addTo(map);