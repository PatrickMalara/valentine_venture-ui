modals.saved_locations = {
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
};
