const modals = {
    modal_elements: document.getElementsByClassName("modal"),

    suggest_location_state: {
        debounce_timeout: undefined,
        marker:           undefined,
        map:              undefined
    },

    review_suggestion: {
        map:                undefined,
        marker:             undefined,
        curr_index:         undefined, // The Index of the Suggestion that is currently being displayed
        suggestions_array:  [],
        form_elements:      []
    },

    user_menu: {
        loaded: false,
    },


    open: function( modal_to_open ) {
        
        for( let i = 0; i < this.modal_elements.length; i += 1 ) {
            if ( this.modal_elements[i].id === modal_to_open ) {
                this.modal_elements[i].style.display = "flex";

                // This looks wrong, and it kinda is, but I may think of a better way in the future
                // I just want as little complexitity in my app right now
                if ( modal_to_open === "suggest-location" ) {
                    modal_suggest_location_init();
                }
                else if ( modal_to_open === "review-suggestions" ) {
                    modal_review_suggestion_init();
                }
                else if ( modal_to_open === "user-menu" ) {
                    modal_user_menu_init();
                }

            } else {
                this.modal_elements[i].style.display = "none";
            }
        }

    },

    close: function( modal_to_close ) {
       this.modal_elements[modal_to_close].style.display = "none";
    }

};


// I know im duplicating code here, I'll fix it later, its not a big issue now
function modal_user_menu_init() {
    if ( state.user.is_admin === true  && modals.user_menu.loaded === false ) {
        // Render Admin options
        const user_menu_el = document.getElementById("user-menu-content");
        while( user_menu_el.firstChild ) {
            user_menu_el.removeChild( user_menu_el.firstChild );
        }

        const review_suggestions_btn = document.createElement("button");
        review_suggestions_btn.innerText = "Review Suggestions";
        review_suggestions_btn.addEventListener(
            "click",
            () => { modals.open("review-suggestions"); }
        );

        user_menu_el.appendChild( review_suggestions_btn );

    } else if ( state.user.is_admin === false && modals.user_menu.loaded === false) {
        // Render Regular options
        const user_menu_el = document.getElementById("user-menu-content");
        while( user_menu_el.firstChild ) {
            user_menu_el.removeChild( user_menu_el.firstChild );
        }

        const suggest_location_btn = document.createElement("button");
        suggest_location_btn.innerText = "Suggest Location";
        suggest_location_btn.addEventListener(
            "click",
            () => { modals.open("suggest-location"); }
        );

        user_menu_el.appendChild( suggest_location_btn );
    }

}


async function modal_review_suggestion_init() {
    try {
        const response = await client.service("suggestions").find();

        modals.review_suggestion.suggestions_array = response.data;

        console.debug( modals.review_suggestion );

        // We want to update the Modal to render the First suggestion... if there is one...

        if ( modals.review_suggestion.form_elements.length === 0 ) {
            modals.review_suggestion.form_elements = document.getElementsByClassName("review-form-el");

            const category_el = modals.review_suggestion.form_elements["review-category"];
            if ( category_el.children.length == 0 ) {
                let option_el = undefined;
                for(let i = 0; i < state.categories.length; i += 1) {
                    option_el = document.createElement("option");
                    option_el.value = state.categories[i].id
                    option_el.innerText = state.categories[i].name
                    category_el.appendChild( option_el );
                }
            }
        }
    
        // Corelates to the Order of the Form
        modals.review_suggestion.form_elements["review-name"].value = 
            modals.review_suggestion.suggestions_array[0].name;
        modals.review_suggestion.form_elements["review-description"].value = 
            modals.review_suggestion.suggestions_array[0].description;
        modals.review_suggestion.form_elements["review-category"].value = 
            modals.review_suggestion.suggestions_array[0].main_category_id;
        modals.review_suggestion.form_elements["review-address"].value = 
            modals.review_suggestion.suggestions_array[0].address;

    } catch( error ) {
        console.error( error );
    }

}


async function modal_suggest_location_init() {

    // Fill in the Categories <Select></Select> if it hasnt already been filled
    const category_el = document.getElementById("suggestion-category");
    if ( category_el.children.length == 0 ) {
        let option_el = undefined;
        for(let i = 0; i < state.categories.length; i += 1) {
            option_el = document.createElement("option");
            option_el.value = state.categories[i].id
            option_el.innerText = state.categories[i].name
            category_el.appendChild( option_el );
        }
    }
    
    // Create/Reset the Suggestion Map
    if ( modals.suggest_location_state.map === undefined ) {
        modals.suggest_location_state.map = L.map("suggestion-map").setView([43.2557, -79.8711], 13);
    } else {
        modals.suggest_location_state.map.setView([43.2557, -79.8711], 13);
    }
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'pk.eyJ1IjoicGF0cmlja21hbGFyYWRldmVsb3BlciIsImEiOiJja3RhdG9sNWoxcHhsMnBucmN2dDBsajh2In0.SyHhgEOXvWgrBEYCEc3uAA',
    }).addTo( modals.suggest_location_state.map );

    const address_textbox = document.getElementById("suggestion-address");
    
    address_textbox.addEventListener(           // When that Address is updated, query the Latitude and Longitude and render it on the map
        "input",
        async (event) => {

            clearTimeout( modals.suggest_location_state.debounce_timeout );
            modals.suggest_location_state.debounce_timeout = setTimeout(
                async function( ) {


                    const address_to_lookup = address_textbox.value.trim(); 

                    if ( address_to_lookup === "" ) {
                        return;
                    }


                    let response = undefined;
                    try {
                        response = await fetch(`http://open.mapquestapi.com/geocoding/v1/address?key=bbvn8lIzHUQYMVAUp3TFOsK4aQl02PEG&location=${address_to_lookup}, ON, Canada&boundingBox=43.3761068333526,-80.01467127854438,43.076913126087135,-79.67581527190661`);
                        response = await response.json();

                        console.debug( response );

                        if ( response.info.statuscode != 0 ) {
                            // If there was an error calculating the Latitude and Longitude, just return.
                            return;
                        }


                        if ( modals.suggest_location_state.marker === undefined ) {
                            modals.suggest_location_state.marker = L.marker(
                                [ 
                                    response.results[0].locations[0].latLng.lat, 
                                    response.results[0].locations[0].latLng.lng
                                ], { draggable: true, icon: heartMarker });

                            modals.suggest_location_state.marker.addTo( modals.suggest_location_state.map );

                        } else { 
                            modals.suggestion_marker.setLatLng( L.latLng(
                                response.results[0].locations[0].latLng.lat,
                                response.results[0].locations[0].latLng.lng
                            ) );
                        }
                        

                        modals.suggest_location_state.map.flyTo(
                            [
                                response.results[0].locations[0].latLng.lat, 
                                response.results[0].locations[0].latLng.lng
                            ], 16);


                    } catch(error) { 
                        console.error( error );
                    }

                }
            , 500 );
        }
    );

}

