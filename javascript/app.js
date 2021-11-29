const state = {
    user:               undefined,
    user_pos:           undefined,
    locations_array:    [],
    selected_location:  undefined,

    search_term:        "",

    map_markers:        [],


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

const notification = document.getElementById("notification");


// Slighty confusing, and I might change this. But on the UI, i call categories "preferences"
function toggle_preference( cat_name ) {

    console.debug( "Category Name: ", cat_name);

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

/*
 * message - Text
 * emotion - ["good", "bad"] :Text
 * */
function notify( message, emotion ) { 
    notification.innerText = message;
    notification.classList.add(`notify-${emotion}`);

    setTimeout( function() {
        notification.classList.remove(`notify-${emotion}`);

        notification.classList.add("notify-close"); // Animation will last a hardcoded value, make sure timeout matches the classes animation length
        //notification.classList.remove("notify-close");
    }, 3000)
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



// Malara helper function
function create_category(event) {
    event.preventDefault();
    client.service("categories").create( {
        name: event.target["name"].value.trim()
    } );
}


async function search( event ) {

    
    if( event !== undefined ) { 
        event.preventDefault(); 
        console.log( event.target );
        state.search_term = event.target["0"].value.trim(); // The search bar
    }

    try {

        let categories_applied = [];
        if ( state.categories.filter( cat => cat.applied === true ).length === 0 ) {
            categories_applied = state.categories.map( cat => cat.id );
        } else {
            categories_applied = state.categories.filter( cat => cat.applied === true ).map( cat => cat.id );
        }

        let response = await client.service("search-controller").find( { 
            query: {
                search_term:    state.search_term,
                categories:     categories_applied
                /*main_category_id: {
                    $in: categories_applied
                }*/
            }
        } );
        console.log( response );

        // Remove the Markers from the Map, even though I should be using Object Pooling, but who cares....
        for( let i = 0; i < state.map_markers.length; i += 1 ) {
            state.map_markers[i].remove();
        }

        state.locations_array = response.data;
        let icon = { icon: heartMarker };
        for( let i = 0; i < response.data.length; i += 1 ) {        // @TODO use Object Pooling

            if ( response.data[i].main_category_id == 1 ) {
                icon.icon = outdoorsMarker;
            } else if ( response.data[i].main_category_id == 2 ) {
                icon.icon = artMarker;
            } else if ( response.data[i].main_category_id == 3 ) {
                icon.icon = eatingMarker;
            } else if ( response.data[i].main_category_id == 4 ) {
                icon.icon = drinkingMarker;
            } else if ( response.data[i].main_category_id == 5 ) {
                icon.icon = gamesMarker;
            } else if ( response.data[i].main_category_id == 6 ) {
                icon.icon = animalsMarker;
            }

            const marker = L.marker([ response.data[i].latitude, response.data[i].longitude ], icon )

            state.map_markers.push( marker );

            marker.addEventListener(
                "click", 
                (event) => { 
                    modals.open("location");
                    console.debug("Response:", response.data[i]);
                    modals.location.load_location( response.data[i].id );
                    console.debug(event); 
                }
            );
                
            marker.addTo(the_map);
        }

        notify( `${state.locations_array.length} Results!`, "good");

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
            first_name: response.user.first_name,
            last_name: response.user.last_name,
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

    search();
        
} )();
