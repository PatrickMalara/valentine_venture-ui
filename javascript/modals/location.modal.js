modals.location = {
    the_location: undefined,
    is_dropdown_open: false,

    save_location: async function() {
        try {
            const response = await client.service("saved-locations").create( {
                user_id:        state.user.id,
                location_id:    state.selected_location.id 
            } );

            console.log("Yay, location saved!");

            notify("Saved!", "good");

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

            
            state.selected_location["comments"] = ( await client.service("comments").find( { 
                query: {
                    location_id: state.selected_location.id
                }
            } ) ).data;

            state.selected_location["ratings"] = ( await client.service("ratings").find( { 
                query: {
                    location_id: state.selected_location.id
                }
            } ) ).data;

        
            // Update the Comments View
            const comment_container = document.getElementById("comment-container");
            while( comment_container.firstChild ) {
                comment_container.removeChild( comment_container.firstChild );
            }

            const comment_template = document.getElementById("template-comment").content.firstElementChild.cloneNode(true);
            let i = 0;
            const length = state.selected_location.comments.length;
            for( i = 0; i < length; i += 1 ) {
                comment_el  = comment_template.cloneNode(true);
                comment_el.firstElementChild.innerText = state.selected_location.comments[i].comment
                comment_container.appendChild( comment_el );
            }

           // Update the Ratings View
           document.getElementById("like_count").innerText      = state.selected_location.ratings.filter( r => r.liked == 1 ).length;
           document.getElementById("dislike_count").innerText   = state.selected_location.ratings.filter( r => r.liked == 0 ).length;

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
                window.removeEventListener( "click", modals.location.dropdown_click_listener );

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
        window.addEventListener( "click", modals.location.dropdown_click_listener );
    },

    like_location: async function() {
        try {
            const response = client.service("ratings").create( {
                liked: true,
                user_id: state.user.id, 
                location_id: state.selected_location.id
            } );


            // Update the view
            document.getElementById("like_count").innerText = state.selected_location.ratings.filter( r => r.liked == 1 ).length + 1;
            
            notify("Liked!", "good" );

        } catch( error ) {
            console.error( error );
        }

    },

    dislike_location: async function() { 
        try {
            const response = client.service("ratings").create( {
                liked: false,
                user_id: state.user.id, 
                location_id: state.selected_location.id
            } );

            // Update the view
            document.getElementById("dislike_count").innerText = state.selected_location.ratings.filter( r => r.liked == 0 ).length + 1;
            
            notify("Disliked!", "good" );

        } catch( error ) {
            console.error( error );
        }
    },

    open_comment_box: function() { 
        document.getElementById("comment_form").style.display = "block";
        const comment_box_el = document.getElementById("comment_box");

        // Took from the dropdown_click_listener()
                const dropdown_el = document.getElementById("location_option_dropdown");
                dropdown_el.style.display = "none";
                window.removeEventListener( "click", modals.location.dropdown_click_listener );

                this.is_dropdown_open = false;

        comment_box_el.focus();
    },

    comment_location: async function(event) {
        event.preventDefault();

        const comment_text = event.target["0"].value;

        if ( comment_text.trim() === "" ) { return; } // Dont comment empty string

        try { 
            await client.service( "comments" ).create( {
                user_id:        state.user.id,
                location_id:    state.selected_location.id,
                comment:        comment_text.trim()
            } );

            const comment_container = document.getElementById("comment-container");
            const comment_template = document.getElementById("template-comment").content.firstElementChild.cloneNode(true);
            const comment_el = comment_template.cloneNode(true);
            comment_el.firstElementChild.innerText = comment_text.trim();
            comment_container.appendChild( comment_el );


            document.getElementById("comment_form").style.display = "none";
            event.target["0"].value = "";
            
            notify("Commented!", "good" );

        } catch(error) {
            console.error(error);
        }

    }


};
