(() => {

    INDEX.i18n.apply();

    const generate_table = () => {

        const data = ZOMBI.get_log();

        let table_html = "<table class='table'>";

        table_html += "<tr>";

        table_html += `<th>${INDEX.i18n.label("SEQUENCE")}</th>`;
        table_html += `<th>${INDEX.i18n.label("TIME")}</th>`;
        table_html += `<th>${INDEX.i18n.label("CONTEXT")}</th>`;
        table_html += `<th>${INDEX.i18n.label("MESSAGE")}</th>`;

        table_html += "</tr>";

        for (const row of data) {

            table_html += "<tr>";

            table_html += `<td style='text-align: left;'>${row[0]}</td>`;
            table_html += `<td style='text-align: left;'>${row[1]}</td>`;
            table_html += `<td style='text-align: left;'>${row[3]}</td>`;
            table_html += `<td style='text-align: left;'>${row[2]}</td>`;

            table_html += "</tr>";

        }
        
        table_html += "</table>";

        $("#radio_log_table_container").html(table_html);

    };

    generate_table();

    $("#radio_log_refresh").on("click", event => {

        event.preventDefault();

        generate_table();

    });

})()






