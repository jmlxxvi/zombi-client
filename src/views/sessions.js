(() => {

    INDEX.i18n.apply();

    const table_html = data => {

        let table_rows_html = "";

        for (const row of data) {

            const { token, session_data, user_name } = row;

            table_rows_html += `<tr><td>${user_name}</td><td>${ZOMBI.make_token_shorter(token)}</td><td>${JSON.stringify(session_data).replace(/","/g, '", "')}</td></tr>`;
            
        }

        return table_rows_html;

    };

    const populate_table = () => {

        ZOMBI.server(
            ["sys_sessions", "sessions_table_data"],
            response => {
                if(response.error) { INDEX.flash(response.message); }
                else {
                    const data = response.data;

                    const html = table_html(data);

                    $("#sessions_table tbody").empty();

                    $("#sessions_table tbody").append(html);

                }
            }    
        );
    };

    populate_table();

    $("#sessions_refresh").on("click", event => {

        event.preventDefault();

        populate_table();   

    });

})()





