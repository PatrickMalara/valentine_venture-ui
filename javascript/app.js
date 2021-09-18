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


function open_login_signup_modal(event) {
    event.preventDefault();
    event.cancelBubble = true;
    event.stopPropagation();

    if ( state.user === undefined ) {
        modals.open('login_signup'); 
    } else {
        modals.open('user_menu');
    }

}


async function create_location_record(event) {
    event.preventDefault();
    const review_name           = event.target["review-name"].value.trim();
    const review_description    = event.target["review-description"].value.trim();
    const review_category       = event.target["review-category"].value.trim();
    const review_address        = event.target["review-address"].value.trim();
    const review_banner         = event.target["review-banner"].value.trim();
    const review_website        = event.target["review-website"].value.trim();

    try {
        await client.service("locations").create( {
            name:               review_name,
            description:        review_description,
            address:            review_address,
            website_url:        review_website,
            cover_img_url:      review_banner,
            latitude:           modals.review_suggestion.marker.getLatLng().lat,
            longitude:          modals.review_suggestion.marker.getLatLng().lng,
            main_category_id:   review_category
        } );

        const index = modals.review_suggestion.curr_index;

        await client.service("suggestion").remove( modals.review_suggestion.suggestions_array[ index ].id );
        modals.review_suggestion.suggestions_array.splice( index, 1 );
        modals.set_review_index_and_render_suggestion( 0 );


    } catch( error ) {
        console.error("Failed to create the suggestion. Error: ", error);
    }
}


async function create_suggestion_record(event) {
    event.preventDefault();
    const suggestion_name           = event.target["suggestion-name"].value.trim();
    const suggestion_description    = event.target["suggestion-description"].value.trim();
    const suggestion_category       = event.target["suggestion-category"].value.trim();
    const suggestion_address        = event.target["suggestion-address"].value.trim();


    try {
        await client.service("suggestions").create( {
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


// Malara helper function
function create_category(event) {
    event.preventDefault();
    client.service("categories").create( {
        name: event.target["name"].value.trim()
    } );
}


async function search( event ) {
    event.preventDefault(); 

    try {

        let response = await client.service("locations").find();
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
            const user_marker = L.marker([ 43.2557, -79.8711 ], { icon: userMarker });
            user_marker.addTo( the_map );

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
    } catch(error) {
        console.log( "Attempted to Reauthenticate: Failed", error );
    }
        
} )();
