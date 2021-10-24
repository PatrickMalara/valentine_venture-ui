modals.review_suggestions = {
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
};
