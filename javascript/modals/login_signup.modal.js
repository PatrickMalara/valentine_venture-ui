modals.login_signup = {
    attempt_login: async function( event ) {
        event.preventDefault();
        event.cancelBubble = true;
        event.stopPropagation();

        const email     = event.target["email"].value.trim();
        const password  = event.target["password"].value.trim();

        if ( email === "" || password === "" ) {
            console.log(" Neither email or password may be empty ");
            return;
        }

        try { 
            let response = await client.authenticate( {
                strategy: "local",
                email: email,
                password: password
            } );

            state.user = {
                id: response.user.id,
                email: response.user.email,
                is_admin: response.is_admin ? true : false
            }

            console.debug( response );

            modals.open("user_menu");

        } catch(error) {
            console.error( error );
        }
    },

    // Invoked by a form's onsubmit Event
    attempt_signup: async function(event) {
        event.preventDefault();
        event.cancelBubble = true;
        event.stopPropagation();

        const email     = event.target["email"].value.trim();
        const password  = event.target["password"].value.trim();

        if ( email === "" || password === "" ) {
            console.log(" Neither email or password may be empty ");
            return;
        }


        try {
            let response = await client.service('users').create( {
                email:      email,
                password:   password
            } );

        } catch(erorr) {
            console.log("Error Creating a new User: ", error );
        }
    }
};
