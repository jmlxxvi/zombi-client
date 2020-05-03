$(() => {

    INDEX.i18n.apply();

    const server_status_call = () => {

        ZOMBI.server(
            ["sys_stats", "server_status_data"],
            response => {
                if(response.error) { INDEX.flash(response.message); }
                else {
                    $("#server_status_server_cpu").html(response.data[1] + "%");
                    $("#server_status_server_memory").html(Math.round(parseInt(response.data[2][0])/1024/1024) + "MB");
                    $("#server_status_server_name").html(response.data[3]);
                    $("#server_status_server_platform").html(response.data[4]);
                    $("#server_status_server_release").html(response.data[5]);
                    $("#server_status_server_response").html(response.data[7].tav + "/" + response.data[7].tmi + "/" + response.data[7].tma);
                }
            }
        );

    };

    server_status_call();

});