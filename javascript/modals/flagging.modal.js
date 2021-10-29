modals.flagging = {
    flag: async function( reason_id ) {
    
        const flag_data = {
            user_id: state.user.id,
            location_id: state.selected_location.id,
            reason: reason_id
        }

        console.debug( flag_data );

        try {
           await client.service("flags").create( flag_data );

            modals.close("flagging");
        } catch(error) {
            console.error("Error flagging the location", error);
        }
    },

    // Called when the modal is closed
    close: function() {
        modals.open("location");
    }

}
