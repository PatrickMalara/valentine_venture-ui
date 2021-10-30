modals.user_menu = {
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

            const generate_charts_btn = document.createElement("button");
            generate_charts_btn.innerText = "Generate Charts";
            generate_charts_btn.addEventListener(
                "click",
                () => { modals.open("generate_charts"); }
            );

            const view_flagged_btn = document.createElement("button");
            view_flagged_btn.innerText = "View Flagged Locations";
            view_flagged_btn.addEventListener(
                "click",
                () => { modals.open("review_suggestions"); }
            );

            user_menu_el.appendChild( review_suggestions_btn );
            user_menu_el.appendChild( generate_charts_btn );
            user_menu_el.appendChild( view_flagged_btn );
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
}
