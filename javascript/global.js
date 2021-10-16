//Globals
const socket    = io("https://valentine-venture-server.herokuapp.com/");
//const socket    = io("http://localhost:3030");
const client    = feathers();

client.configure( feathers.socketio(socket) );

// Use localStorage to store our login token
client.configure(feathers.authentication({
  storage: window.localStorage
}));


const the_map = L.map("map").fitWorld();
the_map.setView([43.2557, -79.8711], 13);
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy;',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoicGF0cmlja21hbGFyYWRldmVsb3BlciIsImEiOiJja3RhdG9sNWoxcHhsMnBucmN2dDBsajh2In0.SyHhgEOXvWgrBEYCEc3uAA',
}).addTo( the_map );

const mapquest_url = "http://open.mapquestapi.com/geocoding/v1/address?key=bbvn8lIzHUQYMVAUp3TFOsK4aQl02PEG";
//&boundingBox=43.3761068333526,-80.01467127854438,43.076913126087135,-79.67581527190661 


//  Custom Icon for Markers
var heartMarker = L.icon({
    iconUrl: 'assets/vv-marker.png',
    iconSize: [32, 42],
    iconAnchor: [0, 42],
    popupAnchor: [0, -42],/*
    shadowUrl: 'assets/vv-marker-shadow.png',
    shadowSize: [68, 95],
    shadowAnchor: [22, 94] */
});

var userMarker = L.icon({
    iconUrl: 'assets/vv-user-marker.png',
    iconSize: [28, 28],
    iconAnchor: [0, 28],
    popupAnchor: [0, -28]
});

