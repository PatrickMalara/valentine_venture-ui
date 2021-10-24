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

            user_menu_el.appendChild( review_suggestions_btn );
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
