modals.generate_charts = {

    ctx: document.getElementById('generated_chart').getContext('2d'),
    screen: "categories",

    set_screen: function( screen_name ) {
        
        document.getElementById('generated_chart').style.display = "none";

        const ratings_container = document.getElementById( "ratings_container" );
        while( ratings_container.firstChild ) { // Clear out the Container Content
                ratings_container.removeChild( ratings_container.firstChild );
        }

        const new_container = document.getElementById( "new_container" );
        while( new_container.firstChild ) { // Clear out the Container Content
                new_container.removeChild( new_container.firstChild );
        }

        if ( screen_name === "ratings" ) {
            this.ratings_screen();            
        } else if ( screen_name === "categories" ) {
            this.categories_screen();

        } else if ( screen_name === "new") {
            this.new_screen();            
        }
    },

    init: async function() {
        this.set_screen( "categories" );
    },

    new_screen: async function() {
        const response = await client.service("stats").get( "new" );

        const h4 = document.createElement("h4");
        h4.innerText = "10 Newest Locations";
        new_container.appendChild( h4);

        // Build the List of locations
        for ( let i = 0; i < response.data.length; i++ ) {
            const loc = document.createElement("div");
            loc.classList.add("location-item");
            loc.innerHTML = `
                <span> <i class="bi bi-geo-alt-fill "></i> ${response.data[i].name} </span>
            `;


            loc.addEventListener( "click", (event) => { 
                modals.location.load_location( response.data[i].id );
                modals.open("location");
            } );
            new_container.appendChild( loc );
        }

    },

    ratings_screen: async function() {
        const response = await client.service("stats").get( "ratings" );
        console.info( "ratings_screen", response );

        const liked_locations = document.createElement("div");
        const disliked_locations = document.createElement("div");


        const h4_liked = document.createElement("h4");
        h4_liked.classList.add( "text-blue" );
        h4_liked.innerText = "Top Liked Locations";
        liked_locations.appendChild( h4_liked );

        const h4_disliked = document.createElement("h4");
        h4_disliked.classList.add( "text-orange" );
        h4_disliked .innerText = "Top Disiked Locations";
        disliked_locations.appendChild( h4_disliked  );
        

        ratings_container.appendChild( liked_locations );
        ratings_container.appendChild( disliked_locations );

        // Build the List of top LIKED locations
        for ( let i = 0; i < response.liked.length; i++ ) {
            const loc = document.createElement("div");
            loc.classList.add("rating_location");
            loc.innerHTML = `
                <span> <i class="bi bi-geo-alt-fill text-blue"></i> ${response.liked[i].name} </span>
                <span class="text-blue"> ${response.liked[i].likes} </span>
            `;

            loc.addEventListener( "click", (event) => { 
                modals.location.load_location( response.liked[i].id );
                modals.open("location") 
            } );

            liked_locations.appendChild( loc );
        }


        // Build the List of top DISLIKED locations
        for ( let i = 0; i < response.disliked.length; i++ ) {
            const loc = document.createElement("div");
            loc.classList.add("rating_location");
            loc.innerHTML = `
                <span> <i class="bi bi-geo-alt-fill text-orange"></i> ${response.disliked[i].name} </span>
                <span class="text-orange"> ${response.disliked[i].likes} </span>
            `;

            loc.addEventListener( "click", (event) => { 
                modals.location.load_location( response.disliked[i].id );
                modals.open("location") 
            } );

            disliked_locations.appendChild( loc );
        }
    },

    categories_screen: async function() {
        document.getElementById('generated_chart').style.display = "block";

        // @TODO create a chart service to avoid future issues with feathers pagination limits
        const response = await client.service("locations").find( {
            query: {
                $select: ["main_category_id"],
                $limit: 1000 //@TODO create a new enpoint just for generating chart data
            }
        } );

        console.log("response of count", response );

        const outdoors_count = response.filter( loc => loc.main_category_id === 1).length
        const art_count = response.filter( loc => loc.main_category_id === 2).length
        const eating_count = response.filter( loc => loc.main_category_id === 3).length
        const drinking_count = response.filter( loc => loc.main_category_id === 4).length
        const games_count = response.filter( loc => loc.main_category_id === 5).length
        const animals_count = response.filter( loc => loc.main_category_id === 6).length

        const the_chart = new Chart(this.ctx, {
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
