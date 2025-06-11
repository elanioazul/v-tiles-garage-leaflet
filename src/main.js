import './style.css'
import "leaflet/dist/leaflet.css";
import L from 'leaflet';
import "leaflet.vectorgrid";

////////////////////////////////// commun setup
//////////////////////////////////
//////////////////////////////////
let config = {
  minZoom: 7,
  maxZoom: 18,
};
const zoom = 14;
const lat = 40.85024106;
const lng = -3.95526317;

const map = L.map("map", config).setView([lat, lng], zoom);

L.control.scale().addTo(map); 

const osmUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const osmAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

L.tileLayer(osmUrl, {
  attribution: osmAttribution,
}).addTo(map);

map.on("zoomend", (e) => {
  console.log(e.target._zoom);
  
})



//////////////////////////////////vector tiles martin postgres
//////////////////////////////////
//////////////////////////////////
// const vectorGrid = L.vectorGrid.protobuf('http://localhost:3000/contours/{z}/{x}/{y}', {
//   vectorTileLayerStyles: {
//     'contours': {
//       color: 'red',
//       fill: true,
//       weight: 1,
//     }
//   },
//   interactive: true
// }).addTo(map);

// vectorGrid.on('mouseover', function(e) {
//   console.log('Hovered feature properties:', e.layer.properties);

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



//////////////////////////////////geoserver wms
//////////////////////////////////
//////////////////////////////////
// L.tileLayer.wms('http://localhost:8080/geoserver/htl/wms?', {
//   layers: 'contours_calc',
//   format: 'image/png',
//   version: '1.3.0',
//   styles: 'contours_custom_ordenance',
//   transparent: true,
// }).addTo(map);

//////////////////////////////////geoserver wmts
//////////////////////////////////
//////////////////////////////////
// L.tileLayer(
//   'http://localhost:8080/geoserver/gwc/service/wmts/rest/htl:contours_calc/htl:contours_custom_ordenance/WebMercatorQuad/{z}/{y}/{x}?format=image/png',
//   {
//     tileSize: 256,
//     attribution: 'GeoServer WMTS'
//   }
// ).addTo(map);


//////////////////////////////////geoserver vector tiles
//////////////////////////////////
//////////////////////////////////
// const url = 'http://localhost:8080/geoserver/gwc/service/wmts/rest/htl:contours_calc/htL:contours_custom_ordenance_v-tiles/WebMercatorQuad/{z}/{y}/{x}?format=application/vnd.mapbox-vector-tile';
// const vectorTileStyling = {
//   contours_calc: (propreties, zoom) => {
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
//       weight: grossCalc(propreties.elevation),
//       color: '#E0945E'
//     }
//   }
// }
// const vectorGrid = L.vectorGrid.protobuf(url, {
//   vectorTileLayerStyles: vectorTileStyling,
//   interactive: true
// }).addTo(map);

// vectorGrid.on('mouseover', function(e) {
//   console.log('Hovered feature properties:', e.layer.properties);

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




////////////// con labels from geoserver
const url = 'http://localhost:8080/geoserver/gwc/service/wmts/rest/htl:contours_calc/htL:contours_custom_ordenance_v-tiles/WebMercatorQuad/{z}/{y}/{x}?&vt-labels=true&vt-label-attributes=elevation&format=application/vnd.mapbox-vector-tile';
const vectorTileStyling = {
  contours_calc: (propreties, zoom) => {
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
      weight: grossCalc(propreties.elevation),
      color: '#E0945E'
    }
  },
  contours_calc_label: (properties, zoom) => ({
    //icon: false, // don't draw a circle
    //text: properties.elevation ? properties.elevation.toString() : '',
    //textSize: 12,
    //textFont: 'Arial Unicode MS Regular',
    //textFill: '#000',
    //textHaloColor: '#fff',
    //textHaloWidth: 2,
    weight: 1,
    fillColor: "#022c5b",
    color: "#022c5b",
    fillOpacity: 0.0,
    opacity: 0.0
  })
}
const vectorGrid = L.vectorGrid.protobuf(url, {
  vectorTileLayerStyles: vectorTileStyling,
  interactive: true
}).addTo(map);

//no funciona pq layeraddno es para vectorGrid layers
// const labelMarkers = [];
// vectorGrid.on('layeradd', function(e) {
//   if (e.layerName === 'contours_calc_label') {
//     const latlng = e.layer.getLatLng ? e.layer.getLatLng() : null;
//     if (latlng && e.layer.properties && e.layer.properties.elevation) {
//       const marker = L.marker(latlng, {
//         icon: L.divIcon({
//           className: 'contour-label',
//           html: `<span>${e.layer.properties.elevation}</span>`,
//           iconSize: [30, 16]
//         })
//       });
//       labelMarkers.push(marker);
//       marker.addTo(map);
//     }
//   }
// });

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
//   interactive: true
// }).addTo(map);

// vectorGrid.on('mouseover', function(e) {
//   console.log('Hovered feature properties:', e.layer.properties);
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

