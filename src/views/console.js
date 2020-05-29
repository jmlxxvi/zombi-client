
import config from "../js/config";
import * as ZOMBI from "../js/zombi";
import * as app from "../js/app";
import $ from "../js/dom";

let started = false;

let me = null;

const render = (view, params, fragment) => {

    me = view;

    ZOMBI.log(`I am a module! ${JSON.stringify(params)}, running on ${me}`, `VIEW:${me}`);

    if(started) {

        ZOMBI.log(`I was already started`, `VIEW:${me}`);


    } else {

        return true;


        ZOMBI.log(`This is the first time I run`, `VIEW:${me}`);

        // ZOMBI.listen("zombi-server-call-traffic",music => { console.log(music); }, "SPINNER_LISTENER_INDEX");

        return true;



        const console_syntax_colors = (json) => {

            json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
                var cls = 'number';
                if (/^"/.test(match)) {
                    if (/:$/.test(match)) {
                        cls = 'key';
                    } else {
                        cls = 'string';
                    }
                } else if (/true|false/.test(match)) {
                    cls = 'boolean';
                } else if (/null/.test(match)) {
                    cls = 'null';
                }
                return '<span class="' + cls + '">' + match + '</span>';
            });
        
        };
        
        const console_delete_response = () => {
        
            document.getElementById("console_response").innerHTML = "";
            // document.getElementById("console_function_details_data").innerHTML = "";
        
        };
        
        const console_show_response = (data) => {
        
            document.getElementById("console_response").innerHTML = console_syntax_colors(JSON.stringify(data, null, 4));
        
        };
        
        const console_show_request = (data) => {
        
            document.getElementById("console_request").innerHTML = console_syntax_colors(JSON.stringify(data, null, 4));
        
        };
        
        ZOMBI.server(
        
            ["sys_console", "mods"],
        
            response => {
        
                if (response.error) { app.flash(response.message); }
        
                else {
        
                    const console_function = document.getElementById("console_function");
        
                    console_function.innerHTML = "";
        
                    const console_module = document.getElementById("console_module");
        
                    console_module.innerHTML = "";
        
                    const modules = response.data;
        
                    const default_option = document.createElement('option');
        
                    default_option.value = "";
                    default_option.text = "-";
        
                    console_module.add(default_option);
        
                    for (const s of modules) {
        
                        const option = document.createElement('option');
        
                        option.value = s;
                        option.text = s;
        
                        console_module.add(option);
        
                    }
        
                }
        
            }
        
        );
        
        const console_module_element = document.getElementById("console_module");
        
        console_module_element.addEventListener("change", () => {
        
            console_delete_response();
        
            const console_function_element = document.getElementById("console_function")
        
            console_function_element.innerHTML = "";
        
            if (console_module_element.value !== "") {
        
                console_module_comments(console_module_element.value);
        
                ZOMBI.server(
        
                    {
                        mod: "sys_console",
                        fun: "funs",
                        args: console_module_element.value
                    },
        
                    response => {
        
                        if (response.error) { app.flash(response.message); }
        
                        else {
        
                            const functions = response.data;
        
                            for (const s of functions) {
        
                                const option = document.createElement('option');
        
                                option.value = s;
                                option.text = s;
        
                                console_function_element.add(option);
        
                            }
        
                        }
        
                    }
        
                );
        
            }
        
        });
        
        // const console_function_element = document.getElementById("console_function");
        
        const console_module_comments = mod => {
        
            ZOMBI.server(
        
                ["sys_console", "coms", mod],
        
                response => {
        
                    if (response.error) {
        
                        app.flash(response.message);
        
                    } else {
        
                        if (response.data.length === 0) {
        
                            document.getElementById("console_function_details").innerHTML = "";
        
                        } else {
        
                            const md = window.markdownit({
                                highlight: function (str, lang) {
                                    if (lang && hljs.getLanguage(lang)) {
                                        try {
                                            return '<pre class="hljs"><code>' +
                                                hljs.highlight(lang, str, true).value +
                                                '</code></pre>';
                                        } catch (__) { }
                                    }
        
                                    return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
                                },
                                html: true,
                                linkify: false,
                                typographer: true
                            });
        
                            const result = md.render(response.data);
        
                            document.getElementById("console_function_details").innerHTML = result;
        
                        }
        
                    }
        
                }
        
            );
        
        }
        
        document.getElementById("submit_buttton").addEventListener("click", function (event) {
        
            event.preventDefault();
        
            try {
        
                const mod = document.getElementById("console_module").value;
                const fun = document.getElementById("console_function").value;
                const args = document.getElementById("console_arguments").value;
        
                const console_raw_json_checked = document.getElementById("console_raw_json").checked;
        
                if (mod === "" || fun === "") {
        
                    app.flash(app.i18n.label("SELECT_A_MODULE_AND_A_FUNCTION"));
        
                } else {
        
                    const sgra = (console_raw_json_checked) ? JSON.parse(args) : (args.split('\n').length === 1) ? args : args.split('\n');
        
                    const request = ZOMBI.server(
        
                        [mod, fun, sgra],
        
                        response => {
        
                            console_show_response(response);
        
                        }
        
                    );
        
                    console_show_request(request);
        
                }
        
            } catch (err) {
        
                app.flash(err.message, "error", "JSON");
        
            }
        
        }, false);

    }

    started = true;

}

const hide = (view, params, fragment) => {

    ZOMBI.log(`You are going ${me} -> ${view}`, `VIEW:${me}`);

}

export default { render, hide };