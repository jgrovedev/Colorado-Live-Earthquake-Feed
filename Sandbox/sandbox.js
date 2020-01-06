// sets map starting location
var map = L.map('map',{
    center: [39.20, -105.78],
    zoom: 8,
    minZoom: 2,
    maxZoom: 18,
    attributionControl: false,
});

// sets style for county borders layer
var borderStyle = {
    'color':'#2F4F4F',
    'fill': false,
    'weight': 2,
    'opacity': 1,
}

// // highlight county borders
// function highlightFeature(e) {
//     var layer = e.target;

//     layer.setStyle({
//         weight: 5,
//         color: '#666',
//         dashArray: '',
//         fillOpacity: 0.7
//     });

//     if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
//         layer.bringToFront();
//     }
// }

// // reset county borders highlight
// function resetHighlight(e) {
//     borderLayer.resetStyle(e.target);
// }

// // zooms to selected feature
// function zoomToFeature(e) {
//     map.fitBounds(e.target.getBounds());
// }

// function onEachFeature(feature, layer) {
//     layer.on({
//         mouseover: highlightFeature,
//         mouseout: resetHighlight,
//         click: zoomToFeature,
//     });
// }

// // loads county borders from geojson
// var borderLayer = L.geoJSON(countyBorders, {
//     style: borderStyle,
//     onEachFeature: onEachFeature,
// });
