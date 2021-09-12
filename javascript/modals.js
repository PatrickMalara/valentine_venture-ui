const modals = {
    modal_elements: document.getElementsByClassName("modal"),

    open: function( modal_to_open ) {
        
        for( let i = 0; i < this.modal_elements.length; i += 1 ) {
            if ( this.modal_elements[i].id === modal_to_open ) {
                this.modal_elements[i].style.display = "flex";
            } else {
                this.modal_elements[i].style.display = "none";
            }
        }

    },

    close: function( modal_to_close ) {
       this.modal_elements[modal_to_close].style.display = "none";
    }

};

