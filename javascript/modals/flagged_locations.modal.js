modals.flagged_locations = {

    init: async function() {
        let flagged_response = undefined;
        try {
            flagged_response = await client.service("flags").find();
            console.log( { flagged_response } );
        } catch(error) {
            console.error( error );
            return;
        }

        let locations_response = undefined;
        try {
            locations_response = await client.service("locations").find( {
                query: {
                    id: {
                        $in: flagged_response.data.map( f => f.location_id )
                    }
                }
            } );

            console.log( { locations_response } );
        } catch(error) {
            console.error( error );
            return;
        }

        console.log( locations_response );

        const flagged_template = document.getElementById("template-flagged-item");

        // Update the Modal DOM
        let flagged_item = document.getElementById("template-flagged-item").content.firstElementChild.cloneNode(true);
        const flagged_container = document.getElementById("flagged_list");
        while( flagged_container.firstChild ) { 
            flagged_container.removeChild( flagged_container.firstChild );
        }

        let i = 0;
        const length = locations_response.length;
        for( i = 0; i < length; i += 1 ) {
            flagged_item = flagged_item.cloneNode(true);
            flagged_item.lastElementChild.innerText = locations_response[i].name;
            flagged_container.appendChild( flagged_item );
        }


    }


}
