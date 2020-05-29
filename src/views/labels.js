"use strict";

import config from "../js/config";
import * as ZOMBI from "../js/zombi";
import * as app from "../js/app";
import $ from "../js/dom";

import { toggle, show, escapeUTF16, unescapeUTF16 } from "../js/utils";

import { hide as transition_hide } from "../js/utils";

let started = false;

let me = null;

const render = (view, params, fragment) => {

    me = view;

    ZOMBI.log(`They sent me ${JSON.stringify(params)}`, `VIEW:${me}`);

    if (started) {

        ZOMBI.log(`I was already started`, `VIEW:${me}`);

    } else {

        started = true;

        ZOMBI.log(`This is the first time I run`, `VIEW:${me}`);

        const lang_label = `LANG_${ZOMBI.language().toUpperCase()}`;
        const lang_data_id = `label_lang_${ZOMBI.language().toLowerCase()}`;

        $("#labels_table_user_lang").text(app.i18n.label(lang_label));

        $(".labels_table_order_user_lang").data("order", lang_data_id);

        let page_row = 0;
        let page_size = 10;
        let column_dir = true; // Default dir "asc"
        let column_order = "2"; // Default column order
        let limit = false;

        $(".labels_table_search").attr('placeholder', app.i18n.label("SEARCH"));

        $(".labels_table_search").on("keyup", function () { page_row = 0; get_table_data(); });

        $(".labels_table_next").on("click", function (event) {

            event.preventDefault();

            if (!limit) { page_row++; get_table_data(); }

        });
        
        $(".labels_table_previous").on("click", function (event) {

            event.preventDefault();

            page_row--;

            if (page_row < 0) { page_row = 0; }
            else { get_table_data(); }

        });

        
        $(".labels_table_order").on("click", function (event) {

            event.preventDefault();

            column_order = this.dataset.order;

            column_dir = !column_dir;

            get_table_data();

        });

        $(".labels_table > tbody").html("");

        const get_table_data = () => {

            if (page_row <= 0) { page_row = 0; $(".labels_table_previous").addClass("cursor-not-allowed"); }
            else { $(".labels_table_previous").removeClass("cursor-not-allowed"); }

            

            ZOMBI.server(
                [
                    "system/labels",
                    "labels_table_data",
                    {
                        page: page_row,
                        size: page_size,
                        order: column_order,
                        dir: column_dir,
                        search: $(".labels_table_search").val()
                    }
                ],
                response => {

                    if (response.error) { app.flash(response.message); }
                    else {

                        let table_rows = "";

                        const data = response.data;

                        const message_3 = data.count;
                        const message_1 = (page_row * page_size) + 1;

                        const to = (page_row * page_size) + page_size;

                        let message_2 = to;

                        if (to > message_3) {
                            message_2 = message_3;
                            $(".labels_table_next").addClass("cursor-not-allowed");
                            limit = true;
                        } else {
                            $(".labels_table_next").removeClass("cursor-not-allowed");
                            limit = false;
                        }

                        const message = `<p class="text-sm leading-5 text-gray-700">
                                            ${app.i18n.label("SHOWING")}
                                            <span class="font-medium">${message_1}</span>
                                            ${app.i18n.label("TO", null, str => str.toLowerCase())}
                                            <span class="font-medium">${message_2}</span>
                                            ${app.i18n.label("OF", null, str => str.toLowerCase())}
                                            <span class="font-medium">${message_3}</span>
                                            ${app.i18n.label("RESULTS", null, str => str.toLowerCase())}
                                        </p>`;

                        $(".labels_table_message").html(message);

                        data.rows.forEach(row => {

                            table_rows += `<tr>
                                    <td class="px-6 py-4 border-b border-gray-200 text-gray-700 text-sm font-small">
                                        ${row.label_name}
                                    </td>
                                    <td class="px-6 py-4 border-b border-gray-200 text-gray-700 text-sm font-small">
                                        ${row.label_lang_en}
                                    </td>
                                    <td class="px-6 py-4 border-b border-gray-200 text-gray-700 text-sm font-small">
                                        ${row[`label_lang_${ZOMBI.language()}`]}
                                    </td>
                                    <td
                                        class="px-6 py-4 text-right border-b border-gray-200 text-sm leading-5 font-medium">
                                        <button id="labels_table_edit_button" data-row='${escapeUTF16(JSON.stringify(row))}' class="text-indigo-600 hover:text-indigo-900">Edit</button>
                                    </td>
                                </tr>`;

                        });

                        $(".labels_table > tbody").html(table_rows);

                    }

                }

            );

        }

        get_table_data();

        // We attach it to the document because they are dynamically created
        document.addEventListener("click", event => {

            if(event.target && event.target.id === 'labels_table_edit_button') {

                const data = JSON.parse(unescapeUTF16(event.target.dataset.row));

                Object.keys(data).forEach(key => {
                    $(`#labels_edit_${key}`).val(data[key]);
                });

                toggle("#labels_edit_modal");
            
            }
        });

        $(".labels_edit_save_button").on("click", () => {

            const values = {};

            $("#labels_edit_modal").children("input[id^='labels_edit_label_lang_']").each(item => {
                values[$(item).id().replace('labels_edit_label_lang_', '')] = $(item).val();
            });

            values["id"] = $("#labels_edit_id").val();
            values["name"] = $("#labels_edit_label_name").val();
            values["details"] = $("#labels_edit_details").val();

            ZOMBI.server(
                ["system/labels", "edit", values],
                response => {
                    if (response.error) {
                        app.flash(response.message);
                    } else {
                        get_table_data();
                        transition_hide("#labels_edit_modal");
                    }
                }
            );

        });

        $(".labels_table_add_button").on("click", () => {

            $("#labels_add_modal").children("input[id^='labels_add_label_lang_']").each(item => {
                $(item).val("");
            });

            $("#labels_add_label_name").val("");
            $("#labels_add_details").val("");

            toggle("#labels_add_modal");

        });

        $(".labels_add_save_button").on("click", () => {

            const values = {};

            $("#labels_add_modal").children("input[id^='labels_add_label_lang_']").each(item => {
                values[$(item).id().replace('labels_add_label_lang_', '')] = $(item).val();
            });

            values["name"] = $("#labels_add_label_name").val();
            values["details"] = $("#labels_add_details").val();

            if (values["name"] === "") {
                app.flash(app.i18n.label("NAME_CANNOT_BE_EMPTY"));
                return false;
            }

            if (values["en"] === "") {
                app.flash(app.i18n.label("ENGLISH_VALUE_IS_MANDATORY"));
                return false;
            }

            ZOMBI.server(
                ["system/labels", "create", values],
                response => {
                    if (response.error) {
                        app.flash(response.message);
                    } else {
                        get_table_data();
                        transition_hide("#labels_add_modal");
                    }
                }
            );

        });

    } // End of view setup

}

const hide = (view, params, fragment) => {

    ZOMBI.log(`You are going ${me} -> ${view}`, `VIEW:${me}`);

}

const reload = (params) => {

    ZOMBI.log(`You are reloading ${me}`);

}

export default { render, hide, reload };



// $(() => {

//     INDEX.i18n.apply();

//     INDEX.datatables.create(
//         "labels_table",
//         "sys_labels/labels_table_data",
//         [
//             {
//                 "name": "id",
//                 className: 'dt-center',
//                 searchable: false,
//                 orderable: false,
//                 render: function (data, type, row, meta) {
//                     return "<a href='#' class='labels_table_edit_link' data-uid='" + data + "' data-name='" + row[1] + "'><i class='fas fa-edit'></i></a>";
//                 }
//             },
//             { "name": "label_name", searchable: true},
//             { "name": "label_lang_es", searchable: true},
//             { "name": "label_lang_pt", searchable: true},
//             { "name": "label_lang_en", searchable: true},
//             { "name": "label_lang_fr", searchable: true},
//             { "name": "label_lang_de", searchable: true},
//             { "name": "label_lang_it", searchable: true},
//             { "name": "label_lang_ko", searchable: true},
//             { "name": "label_lang_ja", searchable: true},
//             { "name": "label_lang_he", searchable: true},
//             { "name": "label_lang_ru", searchable: true},
//             { "name": "label_lang_zh", searchable: true},
//             { "name": "details", searchable: true}
//         ],
//         "labels_table_download",
//         "labels_table_refresh"
//     );

//     $("body").off("click", ".labels_table_edit_link").on("click", ".labels_table_edit_link", function(event) {

//         event.preventDefault();

//         const uid = $(this).data("uid");

//         const name = $(this).data("name");

//         INDEX.data.set("labels_edit_id", uid);
//         INDEX.data.set("labels_edit_name", name);

//         INDEX.load_modal("labels_edit");

//     });

//     $("#labels_table_label_add").on("click", (event) => {

//         INDEX.load_modal("labels_add");

//     });

// });
