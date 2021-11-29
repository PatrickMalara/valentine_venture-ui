//Globals
//const socket    = io("https://valentine-venture-server.herokuapp.com/");
const socket    = io("http://localhost:3030");
const client    = feathers();

client.configure( feathers.socketio(socket) );

// Use localStorage to store our login token
client.configure(feathers.authentication({
  storage: window.localStorage
}));


const the_map = L.map("map").fitWorld();
the_map.setView([43.2557, -79.8711], 13);
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoicGF0cmlja21hbGFyYWRldmVsb3BlciIsImEiOiJja3RhdG9sNWoxcHhsMnBucmN2dDBsajh2In0.SyHhgEOXvWgrBEYCEc3uAA',
}).addTo( the_map );

const geolocoder_url = "https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyDPdS-vxRHXOrrVOVZfwEbp99pzHCmop-o";


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

var outdoorsMarker = L.icon({
    iconUrl: 'assets/vv-outdoorsmarker.png',
    iconSize: [26, 34],
    iconAnchor: [0, 42],
    popupAnchor: [0, -42],/*
    shadowUrl: 'assets/vv-marker-shadow.png',
    shadowSize: [68, 95],
    shadowAnchor: [22, 94] */
});

var artMarker = L.icon({
    iconUrl: 'assets/vv-artmarker.png',
    iconSize: [26, 34],
    iconAnchor: [0, 42],
    popupAnchor: [0, -42],/*
    shadowUrl: 'assets/vv-marker-shadow.png',
    shadowSize: [68, 95],
    shadowAnchor: [22, 94] */
});

var drinkingMarker = L.icon({
    iconUrl: 'assets/vv-drinkingmarker.png',
    iconSize: [26, 34],
    iconAnchor: [0, 42],
    popupAnchor: [0, -42],/*
    shadowUrl: 'assets/vv-marker-shadow.png',
    shadowSize: [68, 95],
    shadowAnchor: [22, 94] */
});

var eatingMarker = L.icon({
    iconUrl: 'assets/vv-foodmarker.png',
    iconSize: [26, 34],
    iconAnchor: [0, 42],
    popupAnchor: [0, -42],/*
    shadowUrl: 'assets/vv-marker-shadow.png',
    shadowSize: [68, 95],
    shadowAnchor: [22, 94] */
});

var gamesMarker = L.icon({
    iconUrl: 'assets/vv-gamemarker.png',
    iconSize: [26, 34],
    iconAnchor: [0, 42],
    popupAnchor: [0, -42],/*
    shadowUrl: 'assets/vv-marker-shadow.png',
    shadowSize: [68, 95],
    shadowAnchor: [22, 94] */
});


var animalsMarker = L.icon({
    iconUrl: 'assets/vv-animalsmarker.png',
    iconSize: [26, 34],
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

