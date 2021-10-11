const modals = {
    modal_elements: document.getElementsByClassName("modal"),

    login_signup: {
        attempt_login: async function( event ) {
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

                modals.open("user_menu");

            } catch(error) {
                console.error( error );
            }
        },

        // Invoked by a form's onsubmit Event
        attempt_signup: async function(event) {
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

    },


    review_suggestions: {
        map:                undefined,
        marker:             undefined,
        debounce_timeout:   undefined,
        curr_index:         0,             // The Index of the Suggestion that is currently being displayed

        suggestions_array:  [],
        form_elements:      [],


        next_suggestion: function() {
            if ( this.curr_index === (this.suggestions_array.length - 1) ) {
                return;
            }

            this.set_review_index_and_render_suggestion( this.curr_index + 1 );
        },

        previous_suggestion: function() {
            if ( this.curr_index === 0 ) {
                return;
            }

            this.set_review_index_and_render_suggestion( this.curr_index - 1 );
        },

        delete_curr_suggestion: async function() {
            await client.service("suggestions").remove(
                this.suggestions_array[ this.curr_index ].id
            );

            this.set_review_index_and_render_suggestion( 0 );
        },

        set_review_index_and_render_suggestion: function( new_index ) {
            this.curr_index = new_index;

            // Update the DOM input's values
            this.form_elements["review-name"].value         = this.suggestions_array[ new_index ].name;
            this.form_elements["review-description"].value  = this.suggestions_array[ new_index ].description;
            this.form_elements["review-category"].value     = this.suggestions_array[ new_index ].main_category_id;
            this.form_elements["review-address"].value      = this.suggestions_array[ new_index ].address;

            this.form_elements["review-banner"].value   = "";
            this.form_elements["review-website"].value  = "";
        },

        init: async function() {
             try {
                const response = await client.service("suggestions").find();

                this.suggestions_array = response.data;

                console.debug( this.review_suggestion_state );

                // We want to update the Modal to render the First suggestion... if there is one...
                if ( this.form_elements.length === 0 ) {
                    this.form_elements = document.getElementsByClassName("review-form-el");

                    const category_el = this.form_elements["review-category"];
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
            
                // Update the DOM input's values
                this.set_review_index_and_render_suggestion( 0 );

                // Create the Map if it hasent been created yet
                if ( this.map === undefined ) {
                    this.map = L.map("review-map").setView([43.2557, -79.8711], 13);

                    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
                        maxZoom: 18,
                        id: 'mapbox/streets-v11',
                        tileSize: 512,
                        zoomOffset: -1,
                        accessToken: 'pk.eyJ1IjoicGF0cmlja21hbGFyYWRldmVsb3BlciIsImEiOiJja3RhdG9sNWoxcHhsMnBucmN2dDBsajh2In0.SyHhgEOXvWgrBEYCEc3uAA',
                    }).addTo( this.map );

                } else {
                    this.map.setView([43.2557, -79.8711], 13);
                }

                // Create the Marker 
                if ( this.marker === undefined ) {
                    this.marker = L.marker(
                        [ 
                            this.suggestions_array[0].latitude,
                            this.suggestions_array[0].longitude
                        ], { draggable: true, icon: heartMarker });

                    this.marker.addTo( this.map );

                } else { 
                    this.marker.setLatLng( L.latLng(
                        this.suggestions_array[0].latitude,
                        this.suggestions_array[0].longitude,
                    ) );
                }

                this.map.flyTo(
                    [
                        this.suggestions_array[0].latitude,
                        this.suggestions_array[0].longitude,
                    ], 16);


                this.form_elements["review-address"].addEventListener( // When that Address is updated, query the Latitude and Longitude and render it on the map
                    "input",
                    async (event) => {
                        const self = this;
                        clearTimeout( this.debounce_timeout );
                        this.debounce_timeout = setTimeout(
                            async function( ) {

                                const address_to_lookup = self.form_elements["review-address"].value.trim(); 

                                if ( address_to_lookup === "" ) {
                                    return;
                                }

                                let response = undefined;
                                try {
                                    response = await fetch(`${mapquest_url}&location=${address_to_lookup}, ON, Canada`);
                                    response = await response.json();

                                    console.debug( response );

                                    if ( response.info.statuscode != 0 ) {
                                        // If there was an error calculating the Latitude and Longitude, just return.
                                        return;
                                    }

                                    self.marker.setLatLng( L.latLng(
                                        response.results[0].locations[0].latLng.lat,
                                        response.results[0].locations[0].latLng.lng
                                    ) );

                                    self.map.flyTo(
                                        [
                                            response.results[0].locations[0].latLng.lat, 
                                            response.results[0].locations[0].latLng.lng
                                        ], 16);


                                } catch(error) { 
                                    console.error( error );
                                }

                            }
                        , 500, self );
                    }
                );


            } catch( error ) {
                console.error( error );
            }


        }
    },

    suggest_location: {
        map:                undefined,
        marker:             undefined,
        debounce_timer:     undefined,


        init: async function() {
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
            if ( this.map === undefined ) {
                this.map = L.map("suggestion-map").setView([43.2557, -79.8711], 13);

                L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
                    maxZoom: 18,
                    id: 'mapbox/streets-v11',
                    tileSize: 512,
                    zoomOffset: -1,
                    accessToken: 'pk.eyJ1IjoicGF0cmlja21hbGFyYWRldmVsb3BlciIsImEiOiJja3RhdG9sNWoxcHhsMnBucmN2dDBsajh2In0.SyHhgEOXvWgrBEYCEc3uAA',
                }).addTo( this.map );
            } else {
                this.map.setView([43.2557, -79.8711], 13);
            }
            

            const address_textbox = document.getElementById("suggestion-address");
            
            address_textbox.addEventListener(           // When that Address is updated, query the Latitude and Longitude and render it on the map
                "input",
                async (event) => {

                    const self = this;
                    clearTimeout( this.debounce_timeout );
                    this.debounce_timeout = setTimeout(
                        async function( ) {

                            const address_to_lookup = address_textbox.value.trim(); 

                            if ( address_to_lookup === "" ) {
                                return;
                            }


                            let response = undefined;
                            try {
                                response = await fetch(`${mapquest_url}&location=${address_to_lookup}, ON, Canada`);
                                response = await response.json();

                                console.debug( response );

                                if ( response.info.statuscode != 0 ) {
                                    // If there was an error calculating the Latitude and Longitude, just return.
                                    return;
                                }


                                if ( self.marker === undefined ) {
                                    self.marker = L.marker(
                                        [ 
                                            response.results[0].locations[0].latLng.lat, 
                                            response.results[0].locations[0].latLng.lng
                                        ], { draggable: true, icon: heartMarker });

                                    self.marker.addTo( self.map );

                                } else { 
                                    self.marker.setLatLng( L.latLng(
                                        response.results[0].locations[0].latLng.lat,
                                        response.results[0].locations[0].latLng.lng
                                    ) );
                                }
                                

                                self.map.flyTo(
                                    [
                                        response.results[0].locations[0].latLng.lat, 
                                        response.results[0].locations[0].latLng.lng
                                    ], 16);


                            } catch(error) { 
                                console.error( error );
                            }

                        }
                    , 500, self );
                }
            );
        }
    },



    user_menu: {
        loaded: false,

        init: async function() {

            if ( this.loaded === true) {    
                return;
            }
            // first time opening up this modal
            

            // Get the User Menu Modal Content so we can render the correct options for the user
            const user_menu_el = document.getElementById("user-menu-content");
            while( user_menu_el.firstChild ) {
                user_menu_el.removeChild( user_menu_el.firstChild );
            }
            
            if ( state.user.is_admin === true ) {
                const review_suggestions_btn = document.createElement("button");
                review_suggestions_btn.innerText = "Review Suggestions";
                review_suggestions_btn.addEventListener(
                    "click",
                    () => { modals.open("review_suggestions"); }
                );

                user_menu_el.appendChild( review_suggestions_btn );
            }
            else {
                const suggest_location_btn = document.createElement("button");
                suggest_location_btn.innerText = "Suggest Location";
                suggest_location_btn.addEventListener(
                    "click",
                    () => { modals.open("suggest_location"); }
                );

                user_menu_el.appendChild( suggest_location_btn );
            }

        }
    },


    location: {
        the_location: undefined,
        is_dropdown_open: false,

        save_location: async function() {
            try {
                const response = await client.service("saved-locations").create( {
                    user_id:        state.user.id,
                    location_id:    state.selected_location.id 
                } );

                console.log("Yay, location saved!");

            } catch(error) {
                console.error("Failed to save Location: ", error);
            }
        },
         
        load_location: async function( location_id ) {
           try {
                let response = await client.service("locations").get( location_id );

                console.log(" response from location Modal:", response );

                state.selected_location = response;

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
        },

        dropdown_click_listener: function(event) {
            console.debug("dropdown_click_listener Created", event);

            if ( this.is_dropdown_open === true ) {
                if ( event.target.nodeName !== "LI" && event.target.nodeName !== "UL" && event.target.id !== "dropdown") {
                    const dropdown_el = document.getElementById("location_option_dropdown");
                    dropdown_el.style.display = "none";
                    document.removeEventListener( "click", this.dropdown_click_listener );

                    this.is_dropdown_open = false;
                }    

            } else {
                this.is_dropdown_open = true;
            }

        },

        open_location_option_dropdown: function(event) {
            console.debug(event);
            const dropdown_el = document.getElementById("location_option_dropdown");

            dropdown_el.style.display = "block";
            dropdown_el.style.left = (event.clientX - 30) + "px";
            dropdown_el.style.top = (event.clientY - 15) + "px";

            document.addEventListener( "click", this.dropdown_click_listener );
        }
    },


    saved_locations: {

        saved_array: [],

        init: async function() {

            try {
                const response = await client.service("saved-locations").find( {
                    query: {
                        user_id: state.user.id
                    }
                } );

                this.saved_array = response.data;

                // Update the Modal DOM
                let saved_item = document.getElementById("template-saved-item").content.firstElementChild.cloneNode(true);
                const ul_el = document.getElementById("saved-list");
                while( ul_el.firstChild ) { 
                    ul_el.removeChild( ul_el.firstChild );
                }

                let i = 0;
                const length = this.saved_array.length;
                for( i = 0; i < length; i += 1 ) {
                    saved_item = saved_item.cloneNode(true);
                    saved_item.lastElementChild.innerText = this.saved_array[i].location_name
                    ul_el.appendChild( saved_item );
                }

            } catch (error) {
                console.error( "Error fetching saved locations", error );

            }

        }
    },

    preferences: {},


    // Close every modal and open the 'parameterized' modal
    open: function( modal_to_open ) {
        console.log("Opening modal: ", modal_to_open );

        let i = 0;
        let length = this.modal_elements.length
        for( i = 0; i < length; i += 1 ) {
            if ( this.modal_elements[i].id === modal_to_open ) {
                this.modal_elements[i].style.display = "flex";

                if ( "init" in this[modal_to_open] ) {
                    this[modal_to_open].init();
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
