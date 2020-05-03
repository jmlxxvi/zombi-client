(() => {

    INDEX.i18n.apply();

    const generate_table = () => {

        const data = ZOMBI.state.data();

        let table_html = "<table class='table'>";

        table_html += "<tr>";

        table_html += `<th>${INDEX.i18n.label("KEY")}</th>`;
        table_html += `<th>${INDEX.i18n.label("VALUE")}</th>`;

        table_html += "</tr>";

        for (const key of Object.keys(data)) {

            table_html += "<tr>";

            table_html += `<td style='text-align: left;'>${key}</td>`;
            table_html += `<td style='text-align: left;'>${JSON.stringify(data[key])}</td>`;

            table_html += "</tr>";

        }
        
        table_html += "</table>";

        $("#state_table_container").html(table_html);

    };

    generate_table();

    $("#state_refresh").on("click", event => {

        event.preventDefault();

        generate_table();

    });

})()






