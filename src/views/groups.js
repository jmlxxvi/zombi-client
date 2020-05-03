$(() => {

    INDEX.i18n.apply();

    INDEX.datatables.create(
        "groups_table",
        "sys_groups/groups_table_data",
        [
            {
                "name": "edit",
                className: 'dt-center',
                searchable: false,
                orderable: true,
                render: function (data, type, row, meta) {
                    return "<a href='#' class='groups_table_edit_link' data-uid='" + data + "' data-name='" + row[1] + "'><i class='fas fa-edit'></i></a>";
                }
            },
            {
                "name": "name",
                className: 'dt-left',
                searchable: true,
                orderable: true
            },
            {
                "name": "description",
                className: 'dt-left',
                searchable: true,
                orderable: true
            },
            {
                "name": "members",
                className: 'dt-center',
                searchable: false,
                orderable: true,
                render: function (data, type, row, meta) {
                    return "<a href='#' class='groups_table_members_link' data-uid='" + data + "' data-name='" + row[1] + "'><i class='fas fa-users'></i></a>";
                }
            },
            {
                "name": "modules",
                className: 'dt-center',
                searchable: false,
                orderable: true,
                render: function (data, type, row, meta) {
                    return "<a href='#' class='groups_table_modules_link' data-uid='" + data + "' data-name='" + row[1] + "'><i class='fas fa-box-open'></i></a>";
                }
            },
            {
                "name": "created_by",
                className: 'dt-left',
                searchable: true,
                orderable: true
            },
            {
                "name": "created_ts", 
                searchable: false,
                render: function (data, type, row, meta) {
                    return INDEX.i18n.utc2local(data);
                }
            }
        ],
        "groups_table_download",
        "groups_table_refresh"
    );

    $("body").off("click", ".groups_table_members_link").on("click", ".groups_table_members_link", function(event) {

        event.preventDefault();

        const uid = $(this).data("uid");
        const name = $(this).data("name");

        INDEX.data.set("groups_members_id", uid);
        INDEX.data.set("groups_members_name", name);

        INDEX.load_modal("groups_members");

    });

    $("body").off("click", ".groups_table_modules_link").on("click", ".groups_table_modules_link", function(event) {

        event.preventDefault();

        const uid = $(this).data("uid");
        const name = $(this).data("name");

        INDEX.data.set("groups_modules_id", uid);
        INDEX.data.set("groups_modules_name", name);

        INDEX.load_modal("groups_modules");

    });

    $("body").off("click", ".groups_table_edit_link").on("click", ".groups_table_edit_link", function(event) {

        event.preventDefault();

        const uid = $(this).data("uid");
        const name = $(this).data("name");

        INDEX.data.set("groups_edit_id", uid);
        INDEX.data.set("groups_edit_name", name);

        INDEX.load_modal("groups_edit");

    });

    $("#groups_table_group_add").on("click", (event) => {

        INDEX.load_modal("groups_add");

    });

});
