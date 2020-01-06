// get about modal element
var modal = document.getElementById('simpleModal');
// get open about modal link
var aboutModal = document.getElementById('aboutModal');
// get close button
var closeBtn = document.getElementsByClassName('closeBtn')[0];

// listen for open/close click
aboutModal.addEventListener('click', openModal);
closeBtn.addEventListener('click', closeModal);
window.addEventListener('click', outsideClick);

// opens and closes modal
function openModal(){
    modal.style.display = 'block';
}
function closeModal(){
    modal.style.display = 'none';
}
function outsideClick(e){
    if(e.target == modal){
    modal.style.display = 'none';
    }
}

// tile layers stored in a variable
var topoLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
}),
    CartoDB_DarkMatter = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
	    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	    subdomains: 'abcd',
	    maxZoom: 19
    }),
    CartoDB_Voyager = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 19
});

// sets map starting location
var map = L.map('map',{
    center: [39.20, -105.78],
    zoom: 8,
    minZoom: 2,
    maxZoom: 18,
    attributionControl: false,
});

// custom attribute
L.control.attribution({prefix: ''}).addTo(map);
map.attributionControl.addAttribution( '<b>' +'Developed by: ' + 
    '</b>' + '<a href="#" style="color:#0000ff">' + '<b>' + 'Jared Grove' + 
    '</b>' + '</a>' + ' | ' + '<a href="https://leafletjs.com/">' + 'Leaflet' +
    '</a>');

// sets default baseMap
map.addLayer(CartoDB_DarkMatter);

// sets style for county borders layer
var borderStyle = {
    'color':'#2F4F4F',
    'fill': false,
    'weight': 2,
    'opacity': 1,
}

// seta style for fault layer
var qfaultStyle = { 
	"color": "#ff0000",
	"weight": 1,
	"opacity": 0.65
};

// loads county borders from geojson
var borderLayer = L.geoJSON(countyBorders, {
    style: borderStyle,
});

// loads faults from geojson
var qFaults = L.geoJSON(qFaults, {
    style: qfaultStyle,
});

// custom point icon
var oilIcon = L.icon({
    iconUrl: "Images/oil-drill.svg",
    iconSize:     [38, 95], // size of the icon
    iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
    popupAnchor:  [-3, -60] // point from which the popup should open relative to the iconAnchor
});

// markercluster plugin
var clusterMarkers = L.markerClusterGroup();
var activeWells = L.geoJSON(activeWells, {
    pointToLayer: function (feature, latlng) { // adds custom icon to geojson points
        return L.marker(latlng, {icon: oilIcon})
    },
    onEachFeature: function (feature, layer) {  // binds data in geosjon to a popup
        layer.bindPopup(
            '<b>Well Operator: </b>' + feature.properties.Operator + '<br>' +
            '<b>Operator Number: </b>' + feature.properties.Operat_Num + '<br>' +
            '<b>Facility Id: </b>' + feature.properties.Facil_Id + '<br>' +
            '<b>Well Name: </b>' + feature.properties.Well_Name + '<br>' +
            '<b>Field Name: </b>' + feature.properties.Field_Name + '<br>' + '<br>' +
            '<b>Permit Approved: </b>' + feature.properties.Perm_Appr + '<br>' +
            '<b>Permit Expiration: </b>' + feature.properties.Perm_Exp + '<br>'
        );
    }});

map.fitBounds(activeWells.getBounds()); // ensures all points are on screen

// Scales cirlce icon based magnitude
function circleSize(mag) {
    return mag * 9;
}

// colors circle icon based on magnitude
function getColor(mag) {
    var colors = ['lightgreen','yellowgreen','gold','orange','lightsalmon','tomato'];
    return  mag > 5? colors[5]:
            mag > 4? colors[4]:
            mag > 3? colors[3]:
            mag > 2? colors[2]:
            mag > 1? colors[1]:
                     colors[0];
}

// filters geojson repsonse from USGS to Colorado only
function eqFilter(feature) {
    if (feature.properties.place.includes(', Colorado')) 
    return true
  }

// adds geojson feed of earthquakes from USGS url (must create a function to layer it on leaflet)
$.getJSON('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson', function(earthQuakes) {
    var points = L.geoJSON(earthQuakes, {
        filter: eqFilter,
        onEachFeature: function (feature, layer) {  // binds data in geosjon to a popup
            var eqDate = new Date(feature.properties.time); // converts epoch date
            layer.bindPopup(
                '<b>Location: </b>' + feature.properties.place + '<br>' +
                '<b>Magnitude: </b>' + feature.properties.mag + '<br>' +
                '<b>Depth: </b>' + feature.geometry.coordinates[2] + 'km' + '<br>' +
                '<b>Time: </b>' + eqDate.toGMTString() + '<br>' +
                '<br><center><a href=' + feature.properties.url + '>USGS Details</a></center>',
            )
        },
        pointToLayer: function(feature, latlng){  // changes default icons to circles and styles accordingly
            return new L.circleMarker(latlng, {
                radius: circleSize(feature.properties.mag),
                fillColor: getColor(feature.properties.mag),
                color: "#000",
                weight: 1.5,
                opacity: 1,
                fillOpacity: 0.5,
            });
        }
    }).addTo(map);
});

// adds base map selection to layer control
var baseMaps = {
    'Topograph' : topoLayer,
    'CartoDB Dark' : CartoDB_DarkMatter,
    'CartoDB Light' : CartoDB_Voyager
}

// adds layer control
L.control.layers(baseMaps, {
    'County Borders' : borderLayer, // unchecked by default
    'Active Oil & Gas Wells' : clusterMarkers.addLayer(activeWells).addTo(map), // adds cluster markers to map, checked by default
    'Quaternary Faults': qFaults.addTo(map), //checked by default
}).addTo(map);


// adds legend to map
var legend = L.control({position: 'bottomright'});

legend.onAdd = function(map) {
    var div = L.DomUtil.create('div', 'info legend'),
        magnitudes = [0,1,2,3,4,5];

    div.innerHTML += "<center><h4 style='margin:4px'>Legend</h4></center>"     
    div.innerHTML += '<img src="Images/oil-drill.svg" height="25px" width="25px">' + '&nbsp;&nbsp;&nbsp' + "Active Wells"
    div.innerHTML += "<div><hr style='display:inline-block; width:25px; color:#ff0000' />&nbsp;&nbsp;Faults</div>"
    div.innerHTML += "<div><hr style='display:inline-block; width:25px; color:#2F4F4F' />&nbsp;&nbsp;County Borders</div>"
    div.innerHTML += "<b><center><p style='margin:2px'>Magnitudes</p></center></b>" 
                
    // loop through color intervals and generate a lable
    for (var i=0; i < magnitudes.length; i++) {
        div.innerHTML += 
                        '<i class="circle" style=background:' + getColor(magnitudes[i] + 1) + '></i>' +
                        magnitudes[i] + (magnitudes[i+1]?'&ndash;' + magnitudes[i+1] + '<br>': '+');
    }
   
    // toggles legend on and off from nav bar link
    var legendLink = document.getElementById("legend");
    legendLink.addEventListener('click', legendToggle);
    
    function legendToggle(){
        if (div.style.display === "none"){
            div.style.display = "block"
        } else {
            div.style.display = "none"
        }
    }
    return div

};
legend.addTo(map);

// adds scale to map
L.control.scale().addTo(map);
