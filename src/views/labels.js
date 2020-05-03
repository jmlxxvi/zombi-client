$(() => {

    INDEX.i18n.apply();
    
    INDEX.datatables.create(
        "labels_table",
        "sys_labels/labels_table_data",
        [
            {
                "name": "id",
                className: 'dt-center',
                searchable: false,
                orderable: false,
                render: function (data, type, row, meta) {
                    return "<a href='#' class='labels_table_edit_link' data-uid='" + data + "' data-name='" + row[1] + "'><i class='fas fa-edit'></i></a>";
                }
            },
            { "name": "label_name", searchable: true},
            { "name": "label_lang_es", searchable: true},
            { "name": "label_lang_pt", searchable: true},
            { "name": "label_lang_en", searchable: true},
            { "name": "label_lang_fr", searchable: true},
            { "name": "label_lang_de", searchable: true},
            { "name": "label_lang_it", searchable: true},
            { "name": "label_lang_ko", searchable: true},
            { "name": "label_lang_ja", searchable: true},
            { "name": "label_lang_he", searchable: true},
            { "name": "label_lang_ru", searchable: true},
            { "name": "label_lang_zh", searchable: true},
            { "name": "details", searchable: true}
        ],
        "labels_table_download",
        "labels_table_refresh"
    );

    $("body").off("click", ".labels_table_edit_link").on("click", ".labels_table_edit_link", function(event) {

        event.preventDefault();

        const uid = $(this).data("uid");

        const name = $(this).data("name");

        INDEX.data.set("labels_edit_id", uid);
        INDEX.data.set("labels_edit_name", name);

        INDEX.load_modal("labels_edit");

    });

    $("#labels_table_label_add").on("click", (event) => {

        INDEX.load_modal("labels_add");

    });

});
