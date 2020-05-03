(() => {

    INDEX.i18n.apply();

    ZOMBI.radio.turnon(
        "ZOMBI_SERVER_CALL_TRAFFIC", 
        traffic => {

            const traffic_enable_elem = document.getElementById("traffic_enable");

            const traffice_enabled = (!!traffic_enable_elem) ? document.getElementById("traffic_enable").checked : false;

            if(traffice_enabled) {

                const local_traffic = {};

                Object.assign(local_traffic, traffic); // We don't want to mess with the original object

                local_traffic.request.token = local_traffic.request.token.match(/.{1,8}/g).join(" ");

                const local_request = JSON.stringify(local_traffic.request);

                const local_response = JSON.stringify(local_traffic.response);

                const table_row = "<tr><td>" + local_traffic.sequence + "</td><td>" + local_request + "</td><td>" + local_response.replace(/,/g, ', ') + "</td></tr>";

                $("#traffic_table tbody").append(table_row);

            }
        
        }, 
        "TRAFFIC_LOGGER"
    );

    $("#traffic_clear").on("click", event => {

        event.preventDefault();

        $("#traffic_table tbody").html("");

    });

})()





