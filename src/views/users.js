"use strict";

import config from "../js/config";
import * as ZOMBI from "../js/zombi";
import * as app from "../js/app";
import $ from "../js/dom";

let started = false;

let me = null;

let page = 0;

const render = (view, params, fragment) => {

    me = view;

    ZOMBI.log(`I am a module! ${JSON.stringify(params)}, running on ${me}`, `VIEW:${me}`);

    if (started) {

        ZOMBI.log(`I was already started`, `VIEW:${me}`);


    } else {

        ZOMBI.server(
            [
                "system/labels", 
                "users_table_data",
                {
                    page,
                    search: $("#users_table_search").val()
                }
            ],
            response => {

                if(response.error) {

                    app.flash(response.message);


                } else {

                    let table_rows = "";

                    $(".users_table > tbody").empty();

                    // console.log(response)

                    response.data.forEach(row => {

                        table_rows += `<tr>
                                <td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                                    <div class="flex items-center">
                                        <div class="flex-shrink-0 h-10 w-10">
                                            <img class="h-10 w-10 rounded-full"
                                                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                                                alt="" />
                                        </div>
                                        <div class="ml-4">
                                            <div class="text-sm leading-5 font-medium text-gray-900">Bernard Lane</div>
                                            <div class="text-sm leading-5 text-gray-500">bernardlane@example.com</div>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                                    <div class="text-sm leading-5 text-gray-900">Director</div>
                                    <div class="text-sm leading-5 text-gray-500">Human Resources</div>
                                </td>
                                <td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                                    <span
                                        class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                        Active
                                    </span>
                                </td>
                                <td
                                    class="px-6 py-4 whitespace-no-wrap border-b border-gray-200 text-sm leading-5 text-gray-500">
                                    Owner
                                </td>
                                <td
                                    class="px-6 py-4 whitespace-no-wrap text-right border-b border-gray-200 text-sm leading-5 font-medium">
                                    <a href="#" class="text-indigo-600 hover:text-indigo-900">Edit</a>
                                </td>
                            </tr>`;

                            console.log($(".users_table > tbody"));
    
                        
    
                    });

                    $(".users_table > tbody").insertAfter(table_rows);

                }

                



            }
        );


        ZOMBI.log(`This is the first time I run`, `VIEW:${me}`);

    }

    started = true;

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
//         "users_table",
//         "sys_labels/users_table_data",
//         [
//             {
//                 "name": "id",
//                 className: 'dt-center',
//                 searchable: false,
//                 orderable: false,
//                 render: function (data, type, row, meta) {
//                     return "<a href='#' class='users_table_edit_link' data-uid='" + data + "' data-name='" + row[1] + "'><i class='fas fa-edit'></i></a>";
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
//         "users_table_download",
//         "users_table_refresh"
//     );

//     $("body").off("click", ".users_table_edit_link").on("click", ".users_table_edit_link", function(event) {

//         event.preventDefault();

//         const uid = $(this).data("uid");

//         const name = $(this).data("name");

//         INDEX.data.set("users_edit_id", uid);
//         INDEX.data.set("users_edit_name", name);

//         INDEX.load_modal("users_edit");

//     });

//     $("#users_table_label_add").on("click", (event) => {

//         INDEX.load_modal("users_add");

//     });

// });


// $(() => {

//     INDEX.i18n.apply();

//     INDEX.datatables.create(
//         "users_table",
//         "sys_users/users_table_data",
//         [
//             {
//                 "name": "id",
//                 className: 'dt-center',
//                 searchable: false,
//                 orderable: false,
//                 render: function (data, type, row, meta) {
//                     return "<a href='#' class='users_table_edit_link' data-uid='" + data + "' data-name='" + row[3] + "'><i class='fas fa-edit'></i></a>";
//                 }
//             },
//             {

//                 "name": "message",
//                 className: 'dt-center',
//                 searchable: false,
//                 orderable: true,
//                 render: function (data, type, row, meta) {
//                     return "<a href='#' class='users_table_message_link' data-uid='" + row[0] + "' data-uname='" + row[3] + "'><i class='fas fa-envelope'></i></a>";
//                 }
//             },

//             { "name": "username", searchable: true },

//             { "name": "full_name", searchable: true },
//             {
//                 "name": "admin",
//                 className: 'dt-center',
//                 searchable: false,
//                 orderable: true,
//                 render: function (data, type, row, meta) {
//                     const icon = (data === "Y") ? "check" : "minus" ;
//                     return "<a href='#' class='users_table_admin_link' data-uid='" + row[0] + "'><i class='fas fa-" + icon + "'></i></a>";
//                 }
//             },
//             { "name": "email", searchable: true },
//             {
//                 "name": "language", 
//                 searchable: true, 
//                 className: 'dt-center' 
//             },
//             {
//                 "name": "country", 
//                 searchable: false
//             },
//             {
//                 "name": "timezone", 
//                 searchable: true
//             },
//             {
//                 "name": "country", 
//                 searchable: false,
//                 render: function (data, type, row, meta) {
//                     return INDEX.i18n.utc2local(data);
//                 }
//             }
//         ],
//         "users_table_download",
//         "users_table_refresh"
//     );

//     $('body').off("click", ".users_table_edit_link").on("click", ".users_table_edit_link", function(event) {

//         event.preventDefault();

//         const uid = $(this).data("uid");

//         const name = $(this).data("name");

//         INDEX.data.set("users_edit_id", uid);
//         INDEX.data.set("users_edit_name", name);

//         INDEX.load_modal("users_edit");

//     });

//     $('body').off("click", ".users_table_admin_link").on("click", ".users_table_admin_link", function(event) {

//         event.preventDefault();

//         const uid = $(this).data("uid");

//         ZOMBI.server(
//             ["sys_users", "users_toggle_admin", parseInt(uid)],

//             response => {

//                 if(response.error) { INDEX.flash(response.message); } 
                    
//                 else { INDEX.datatables.refresh("users_table"); }
            
//             }

//         );

//     });

//     $('body').off("click", ".users_table_message_link").on("click", ".users_table_message_link", function(event) {

//         event.preventDefault();

//         const uid   = $(this).data("uid");
//         const uname = $(this).data("uname");

//         INDEX.data.set("users_message_user_id", uid);
//         INDEX.data.set("users_message_uname", uname);

//         INDEX.load_modal("users_message");

//     });

//     $("#users_table_user_add").on("click", (event) => {

//         INDEX.load_modal("users_add");

//     });

// });
