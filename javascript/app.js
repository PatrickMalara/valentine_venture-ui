//Globals
const socket    = io("http://localhost:3030");
const client    = feathers();

client.configure( feathers.socketio(socket) );

// Use localStorage to store our login token
client.configure(feathers.authentication({
  storage: window.localStorage
}));



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
    user:               undefined,
    user_pos:           undefined,
    locations_array:    [],
    selected_location:  undefined,


    categories:         [],

    preferences: [
        { name: "animals",  applied: false },
        { name: "outdoors", applied: false },
        { name: "games",    applied: false },
        { name: "eating",   applied: false },
        { name: "art",      applied: false },
        { name: "drinking", applied: false }
    ],
};


// Slighty confusing, and I might change this. But on the UI, i call categories "preferences"
function toggle_preference( cat_name ) {
    const cat_to_toggle = state.categories.find( cat => cat.name === cat_name );

    if (cat_to_toggle.applied === true) { 
        cat_to_toggle.applied = false;
        document.getElementById("pref-" + cat_name).classList.remove("pref-applied");

    } else { 
        cat_to_toggle.applied  = true;
        document.getElementById("pref-" + cat_name).classList.add("pref-applied");
    }

    search();

}

async function load_location_modal_contents( lat, lng ) {
    
    try {
        let response = await client.service("locations").find( { 
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
        cover_el.style.backgroundImage = `url('${state.selected_location.cover_img_url}') `;
        cover_el.classList.remove("ghost-loading");

        const desc_el   = document.getElementById("location-modal-description")
        desc_el.innerText = state.selected_location.description;
        desc_el.classList.remove("ghost-loading");


    } catch( error ) {
        console.error( error );
    }

}


async function attempt_login(event) { 
    event.preventDefault();
    event.cancelBubble = true;
    event.stopPropagation();

    const email     = event.target["email"].value.trim();
    const password  = event.target["password"].value.trim();

    if ( email === "" || password === "" ) {
        console.log(" Neither email or password may be empty ");
        return;
    }

    try { 
        let response = await client.authenticate( {
            strategy: "local",
            email: email,
            password: password
        } );

        state.user = {
            id: response.id,
            email: response.email,
            is_admin: response.is_admin ? true : false
        }

        console.debug( response );

        modals.open("user-menu");

    } catch(error) {
        console.error( error );
    }
}


// Invoked by a form's onsubmit Event
async function attempt_signup(event) {
    event.preventDefault();
    event.cancelBubble = true;
    event.stopPropagation();

    const email     = event.target["email"].value.trim();
    const password  = event.target["password"].value.trim();

    if ( email === "" || password === "" ) {
        console.log(" Neither email or password may be empty ");
        return;
    }


    try {
        let response = await client.service('users').create( {
            email:      email,
            password:   password
        } );

    } catch(erorr) {
        console.log("Error Creating a new User: ", error );
    }
}


function open_login_signup_modal(event) {
    event.preventDefault();
    event.cancelBubble = true;
    event.stopPropagation();

    if ( state.user === undefined ) {
        modals.open('login-signup'); 
    } else {
        modals.open('user-menu');
    }

}


function create_location_record(event) {
    event.preventDefault();
    const review_name           = event.target["review-name"].value.trim();
    const review_description    = event.target["review-description"].value.trim();
    const review_category       = event.target["review-category"].value.trim();
    const review_address        = event.target["review-address"].value.trim();
    const review_banner         = event.target["review-banner"].value.trim();
    const review_website        = event.target["review-website"].value.trim();



    try {
        client.service("locations").create( {
            name:               review_name,
            description:        review_description,
            address:            review_address,
            website_url:        review_website,
            cover_img_url:      review_banner,
            latitude:           modals.review_suggestion_state.marker.getLatLng().lat,
            longitude:          modals.review_suggestion_state.marker.getLatLng().lng,
            main_category_id:   review_category
        } );

    } catch( error ) {
        console.error("Failed to create the suggestion. Error: ", error);
    }
}


function create_suggestion_record(event) {
    event.preventDefault();
    const suggestion_name           = event.target["suggestion-name"].value.trim();
    const suggestion_description    = event.target["suggestion-description"].value.trim();
    const suggestion_category       = event.target["suggestion-category"].value.trim();
    const suggestion_address        = event.target["suggestion-address"].value.trim();



    try {
        client.service("suggestions").create( {
            user_id:            state.user.id,
            name:               suggestion_name,
            description:        suggestion_description,
            address:            suggestion_address,
            latitude:           modals.suggest_location_state.marker.getLatLng().lat,
            longitude:          modals.suggest_location_state.marker.getLatLng().lng,
            main_category_id:   suggestion_category
        } );

    } catch( error ) {
        console.error("Failed to create the suggestion. Error: ", error);
    }
}


function create_category(event) {
    event.preventDefault();
    client.service("categories").create( {
        name: event.target["name"].value.trim()
    } );
}


async function search( event ) {
    if( event !== undefined ) { event.preventDefault(); }

    try {

        let response = await client.service("locations").find( { 
            query: {
                main_category_id: {
                    $in: state.categories.filter( cat => cat.applied === true ).map( cat => cat.id )
                }
            }
        } );
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


( async function main() {

    /* This is getting annoying while testing code unrelated to the user's position :| 
    if ( navigator.geolocation ) {
        navigator.geolocation.getCurrentPosition( (position) => {
            state.user_pos = position.coords;

            const user_marker = L.marker([ state.user_pos.latitude, state.user_pos.longitude ], { icon: userMarker });
            user_marker.addTo( the_map );
        });

        
    }

    */

    try {
        let response = await client.reAuthenticate();
        console.log( "Attempted to Reauthenticate: Success", response );

        state.user = {
            id: response.user.id,
            email: response.user.email,
            is_admin: response.user.is_admin ? true : false
        }
    } catch(error) {
        console.log( "Attempted to Reauthenticate: Failed", error );
    }

    try {
        let response = await client.service('categories').find();
        state.categories = response.data;

        let i = 0;
        let catlng = state.categories.length
        for( i = 0; i < catlng; i += 1 ) {
            state.categories.applied = false;
        }

    } catch(error) {
        console.log( "Attempted to Reauthenticate: Failed", error );
    }
        
} )();
