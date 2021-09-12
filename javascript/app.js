//Globals
const socket    = io("http://localhost:3030");
const app       = feathers();

app.configure( feathers.socketio(socket) );

const the_map = L.map("map").setView([43.2557, -79.8711], 13);
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoicGF0cmlja21hbGFyYWRldmVsb3BlciIsImEiOiJja3RhdG9sNWoxcHhsMnBucmN2dDBsajh2In0.SyHhgEOXvWgrBEYCEc3uAA',
}).addTo( the_map );


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



const state = {
    user_pos:           undefined,
    locations_array:    [],
    selected_location:  undefined,

    preferences: [
        { name: "animals",  applied: false },
        { name: "outdoors", applied: false },
        { name: "games",    applied: false },
        { name: "eating",   applied: false },
        { name: "art",      applied: false },
        { name: "drinking", applied: false }
    ],
};


function toggle_preference( pref_name ) {
    const preference_to_toggle = state.preferences.find( pref => pref.name === pref_name );

    if (preference_to_toggle.applied === true) { 
        preference_to_toggle.applied = false;
        document.getElementById("pref-" + pref_name).classList.remove("pref-applied");

    } else { 
        preference_to_toggle.applied  = true;
        document.getElementById("pref-" + pref_name).classList.add("pref-applied");
    }

}

async function load_location_modal_contents( lat, lng ) {
    
    try {
        let response = await app.service("locations").find( { 
            query: {
                latitude: lat,
                longitude: lng
            } 
        } );


       if ( response.data.length === 0 ) {
         throw new Error("No Location found with that latitude and longitude");
       }

        state.selected_location = response.data[0];

        // Update the contents of the Modal
        const name_el   = document.getElementById("location-modal-name");
        name_el.innerText = state.selected_location.name;
        name_el.classList.remove("ghost-loading");

        const cover_el  = document.getElementById("location-modal-banner")
        cover_el.style.background = `url('${state.selected_location.cover_img_url}') `;
        cover_el.classList.remove("ghost-loading");

        const desc_el   = document.getElementById("location-modal-description")
        desc_el.innerText = state.selected_location.description;
        desc_el.classList.remove("ghost-loading");


    } catch( error ) {
        console.error( error );
    }

}


async function search( event ) {
    event.preventDefault(); 

    try {

        let response = await app.service("locations").find();
        console.log( response );

        state.locations_array = response.data;
        for( let i = 0; i < response.data.length; i += 1 ) {
            const marker = L.marker([ response.data[i].latitude, response.data[i].longitude ], { icon: heartMarker })

            marker.addEventListener(
                "click", 
                (event) => { 
                    modals.open("location");
                    load_location_modal_contents( event.latlng.lat, event.latlng.lng );
                    console.debug(event); 
                }
            );
                
            marker.addTo(the_map);
        }

    } catch(error) {
        console.error( error ); 
    }

}


( function main() {

    if ( navigator.geolocation ) {
        navigator.geolocation.getCurrentPosition( (position) => {
            state.user_pos = position.coords;

            const user_marker = L.marker([ state.user_pos.latitude, state.user_pos.longitude ], { icon: userMarker });
            user_marker.addTo( the_map );
        });

        
    }
        
} )();
