const modals = {
    modal_elements: document.getElementsByClassName("modal"),

    //Specific for Suggestion, theres def a better way of doing this... i'll figure it out
    suggestion_debounce_timeout: undefined,
    suggestion_marker: undefined,

    review_suggestion: {
        state: {
            opened: false,
            map: undefined,
            marker: undefined,
            current_suggestion: undefined,
            suggestions_array:  []
            
        }
    },

    user_menu: {
        state: {
            loaded: false,
        }
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

function modal_user_menu_init() {
    if ( state.user.is_admin === true  && modals.user_menu.state.loaded === false ) {
        // Render Admin options
        const user_menu = document.getElementById("user-menu-content");
        while( user_menu.firstChild ) {
            user_menu.removeChild( user_menu.firstChild );
        }

        const review_suggestions_btn = document.createElement("button");
        review_suggestions_btn.innerText = "Review Suggestions";
        review_suggestions_btn.addEventListener(
            "click",
            () => { modals.open("review-suggestions"); }
        );

        user_menu.appendChild( review_suggestions_btn );

    } else if ( state.user.is_admin === false && modals.user_menu.state.loaded === false) {
        // Render Regular options
        const user_menu = document.getElementById("user-menu-content");
        while( user_menu.firstChild ) {
            user_menu.removeChild( user_menu.firstChild );
        }

        const suggest_location_btn = document.createElement("button");
        suggest_location_btn.innerText = "Suggest Location";
        suggest_location_btn.addEventListener(
            "click",
            () => { modals.open("suggest-location"); }
        );

        user_menu.appendChild( suggest_location_btn );
    }

}

async function modal_review_suggestion_init() {
    const response = await client.service("suggestions").find();

    modals.review_suggestion.state.suggestions_array = response.data;

    console.debug( modals.review_suggestion );

}

async function modal_suggest_location_init() {

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
    
    const suggestion_map = L.map("suggestion-map").setView([43.2557, -79.8711], 13);
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'pk.eyJ1IjoicGF0cmlja21hbGFyYWRldmVsb3BlciIsImEiOiJja3RhdG9sNWoxcHhsMnBucmN2dDBsajh2In0.SyHhgEOXvWgrBEYCEc3uAA',
    }).addTo( suggestion_map );

    const address_textbox = document.getElementById("suggestion-address");
    
    address_textbox.addEventListener(
        "input",
        async (event) => {

            clearTimeout( modals.suggestion_debounce_timeout );
            modals.suggestion_debounce_timeout = setTimeout(
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
                            return;
                        }

                        if ( modals.suggestion_marker === undefined ) {
                            modals.suggestion_marker = L.marker(
                                [ 
                                    response.results[0].locations[0].latLng.lat, 
                                    response.results[0].locations[0].latLng.lng
                                ], { draggable: true, icon: heartMarker });

                            modals.suggestion_marker.addTo( suggestion_map );

                        } else { 
                            modals.suggestion_marker.setLatLng( L.latLng(
                                response.results[0].locations[0].latLng.lat,
                                response.results[0].locations[0].latLng.lng
                            ) );
                        }
                        

                        suggestion_map.flyTo(
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

