const modals = {
    modal_elements: document.getElementsByClassName("modal"),

    preferences: {},

    // Close every modal and open the 'parameterized' modal
    open: function( modal_to_open ) {
        console.log("Opening modal: ", modal_to_open );

        let i = 0;
        let length = this.modal_elements.length
        for( i = 0; i < length; i += 1 ) {
            if ( this.modal_elements[i].id === modal_to_open ) {
                this.modal_elements[i].style.display = "flex";

                if ( "init" in this[modal_to_open] ) {
                    this[modal_to_open].init();
                }

            } else {
                this.modal_elements[i].style.display = "none";
            }
        }
    },

    close: function( modal_to_close ) {

       // @TODO move this to the location close method
       if ( modal_to_close === "location" ) {
            document.getElementById("comment_form").style.display = "none";
       }

       if ( "close" in this[modal_to_close] ) {
            this[modal_to_close].close();
       }

       this.modal_elements[modal_to_close].style.display = "none";
    }
};
