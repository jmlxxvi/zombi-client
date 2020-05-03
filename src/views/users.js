$(() => {

    INDEX.i18n.apply();

    INDEX.datatables.create(
        "users_table",
        "sys_users/users_table_data",
        [
            {
                "name": "id",
                className: 'dt-center',
                searchable: false,
                orderable: false,
                render: function (data, type, row, meta) {
                    return "<a href='#' class='users_table_edit_link' data-uid='" + data + "' data-name='" + row[3] + "'><i class='fas fa-edit'></i></a>";
                }
            },
            {

                "name": "message",
                className: 'dt-center',
                searchable: false,
                orderable: true,
                render: function (data, type, row, meta) {
                    return "<a href='#' class='users_table_message_link' data-uid='" + row[0] + "' data-uname='" + row[3] + "'><i class='fas fa-envelope'></i></a>";
                }
            },

            { "name": "username", searchable: true },

            { "name": "full_name", searchable: true },
            {
                "name": "admin",
                className: 'dt-center',
                searchable: false,
                orderable: true,
                render: function (data, type, row, meta) {
                    const icon = (data === "Y") ? "check" : "minus" ;
                    return "<a href='#' class='users_table_admin_link' data-uid='" + row[0] + "'><i class='fas fa-" + icon + "'></i></a>";
                }
            },
            { "name": "email", searchable: true },
            {
                "name": "language", 
                searchable: true, 
                className: 'dt-center' 
            },
            {
                "name": "country", 
                searchable: false
            },
            {
                "name": "timezone", 
                searchable: true
            },
            {
                "name": "country", 
                searchable: false,
                render: function (data, type, row, meta) {
                    return INDEX.i18n.utc2local(data);
                }
            }
        ],
        "users_table_download",
        "users_table_refresh"
    );

    $('body').off("click", ".users_table_edit_link").on("click", ".users_table_edit_link", function(event) {

        event.preventDefault();

        const uid = $(this).data("uid");

        const name = $(this).data("name");

        INDEX.data.set("users_edit_id", uid);
        INDEX.data.set("users_edit_name", name);

        INDEX.load_modal("users_edit");

    });

    $('body').off("click", ".users_table_admin_link").on("click", ".users_table_admin_link", function(event) {

        event.preventDefault();

        const uid = $(this).data("uid");

        ZOMBI.server(
            ["sys_users", "users_toggle_admin", parseInt(uid)],

            response => {

                if(response.error) { INDEX.flash(response.message); } 
                    
                else { INDEX.datatables.refresh("users_table"); }
            
            }

        );

    });

    $('body').off("click", ".users_table_message_link").on("click", ".users_table_message_link", function(event) {

        event.preventDefault();

        const uid   = $(this).data("uid");
        const uname = $(this).data("uname");

        INDEX.data.set("users_message_user_id", uid);
        INDEX.data.set("users_message_uname", uname);

        INDEX.load_modal("users_message");

    });

    $("#users_table_user_add").on("click", (event) => {

        INDEX.load_modal("users_add");

    });

});
