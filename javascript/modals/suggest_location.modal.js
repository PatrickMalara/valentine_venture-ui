modals.suggest_location = {
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

};
