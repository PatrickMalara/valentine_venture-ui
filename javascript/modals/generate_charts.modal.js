modals.generate_charts = {

    ctx: document.getElementById('generated_chart').getContext('2d'),
    screen: "categories",

    set_screen: function( screen_name ) {
        if ( screen_name === "ratings" ) {
            
        } else if ( screen_name === "categories" ) {

        } else if ( screen_name === "Something else") {

        }
    }

    init: async function() {

    /*
     * We Intially Load the Categories Chart
     * */

        // @TODO create a chart service to avoid future issues with feathers pagination limits
        const response = await client.service("locations").find( {
            query: {
                $select: ["main_category_id"]
            }
        } );

        const outdoors_count = response.data.filter( loc => loc.main_category_id === 1).length
        const art_count = response.data.filter( loc => loc.main_category_id === 2).length
        const eating_count = response.data.filter( loc => loc.main_category_id === 3).length
        const drinking_count = response.data.filter( loc => loc.main_category_id === 4).length
        const games_count = response.data.filter( loc => loc.main_category_id === 5).length
        const animals_count = response.data.filter( loc => loc.main_category_id === 6).length

        const the_chart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Outdoors', 'Eating', 'Drinking', 'Games', 'Art', 'Animals'],
                datasets: [{
                    label: '# of Votes',
                    data: [outdoors_count, eating_count, drinking_count, games_count, art_count, animals_count],
                    backgroundColor: [
                        'mediumaquamarine',
                        'khaki',
                        'deepskyblue',
                        'lightcoral',
                        'darkorchid',
                        'sandybrown'
                    ],
                    borderColor: [
                        'white',
                        'white',
                        'white',
                        'white',
                        'white',
                        'white'
                    ],
                    borderWidth: 1
                }]
            },
        });
    }
}
