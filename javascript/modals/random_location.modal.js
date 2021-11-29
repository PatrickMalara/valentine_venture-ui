modals.random_location = {
    init: async function() {

        // Get the count of all the Date Locations, since their ID's are all ints
        // I going to use a random number and search until I find a location
        const count_response = await client.service("locations").find( {
           query: {
               $select: ['id']
           }
        } );
        console.log( count_response );

        let random_location_id = Math.floor( Math.random() * count_response.length  + 1);
        let random_location_response = undefined;

        // Just continue searching until we find a location... I know... but it works for now
        while ( random_location_response == undefined ) { 
            console.debug( "Searching for a Random Location", random_location_id );
            try {
                random_location_response = await client.service("locations").get( random_location_id );
            } catch (error) {
                random_location_id = Math.floor( Math.random() * count_response.length + 1);
                random_location_response = undefined;
            }
        }
        console.debug( "Found a Random Location" );

        // Navigate to the Marker on the map and load the location modal for our Random date
        the_map.flyTo( [random_location_response.latitude, random_location_response.longitude], 18 );
        modals.open('location');
        modals.location.load_location( random_location_response.id );

    }
}
