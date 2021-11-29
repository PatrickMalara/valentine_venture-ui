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
                first_name: response.user.first_name,
                last_name: response.user.last_name,
                email: response.user.email,
                is_admin: response.user.is_admin == 1 ? true : false
            }

            console.debug( response );

            modals.open("user_menu");

        } catch(error) {
            console.error( error );
            notify("Try again.", "bad");
        }
    },

    // Invoked by a form's onsubmit Event
    attempt_signup: async function(event) {
        event.preventDefault();
        event.cancelBubble = true;
        event.stopPropagation();

        const first_name  = event.target["first_name"].value.trim();
        const last_name  = event.target["last_name"].value.trim();
        const email     = event.target["email"].value.trim();
        const password  = event.target["password"].value.trim();

        if ( email === "" || password === "" || first_name === "" || last_name === "" ) {
            console.log(" Neither email or password may be empty ");
            notify("Form fields must not be empty.", "bad");
            return;
        }


        try {
            let response = await client.service('users').create( {
                first_name: first_name,
                last_name:  last_name,
                email:      email,
                password:   password
            } );

            notify("Signed Up!", "good");

            // Yes, this is a fake event.... but it works darn well
            this.attempt_login( {
                target: {
                    email: { value: email },
                    password: { value: password }
                },
                preventDefault: () => {},
                stopPropagation: () => {}
            } )

        } catch(error) {
            console.log("Error Creating a new User: ", error );
            notify("Try again.", "bad");
        }
    }
};
