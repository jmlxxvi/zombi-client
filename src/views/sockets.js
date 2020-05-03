(() => {

    INDEX.i18n.apply();

    ZOMBI.radio.turnon("ZOMBI_SERVER_SOCKET_SEND", (traffic) => {

        const sockets_enable_elem = document.getElementById("sockets_enable");

        const sockets_enabled = (!!sockets_enable_elem) ? document.getElementById("sockets_enable").checked : false;

        if(sockets_enabled) {

            const table_row = "<tr><td>" + moment(new Date()).format('HH:mm:ss') + "</td><td><i class='fas fa-arrow-up'></i</td><td>" + JSON.stringify(traffic).replace(/","/g, '", "') + "</td></tr>";

            $("#sockets_table tbody").append(table_row);

        }
    
    }, "SOCKETS_LOGGER");

    ZOMBI.radio.turnon("ZOMBI_SERVER_SOCKET_RECEIVE", (traffic) => {

        const sockets_enable_elem = document.getElementById("sockets_enable");

        const sockets_enabled = (!!sockets_enable_elem) ? document.getElementById("sockets_enable").checked : false;

        if(sockets_enabled) {

            const table_row = "<tr><td>" + moment(new Date()).format('HH:mm:ss') + "</td><td><i class='fas fa-arrow-down'></i></td><td>" + JSON.stringify(traffic).replace(/,/g, ', ') + "</td></tr>";

            $("#sockets_table tbody").append(table_row);

        }
    
    }, "SOCKETS_LOGGER");

    $("#sockets_clear").on("click", event => {

        event.preventDefault();

        $("#sockets_table tbody").html("");

    });

})()






