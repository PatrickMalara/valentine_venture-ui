const modals = {
    modal_elements: document.getElementsByClassName("modal"),

    open: function( modal_to_open ) {
        
        for( let i = 0; i < this.modal_elements.length; i += 1 ) {
            if ( this.modal_elements[i].id === modal_to_open ) {
                this.modal_elements[i].style.display = "flex";

                // This looks wrong, and it kinda is, but I may think of a better way in the future
                // I just want as little complexitity in my app right now
                if ( modal_to_open === "suggest-location" ) {
                    modal_suggest_location_init();
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

function modal_suggest_location_init() {
    
    const suggestion_map = L.map("suggestion-map").setView([43.2557, -79.8711], 13);
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'pk.eyJ1IjoicGF0cmlja21hbGFyYWRldmVsb3BlciIsImEiOiJja3RhdG9sNWoxcHhsMnBucmN2dDBsajh2In0.SyHhgEOXvWgrBEYCEc3uAA',
    }).addTo( suggestion_map );



}

