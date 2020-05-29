import "./css/styles.css";
// https://github.com/zloirock/core-js#babel
// import "core-js"; 
// import "regenerator-runtime/runtime";

import config from "./js/config";
import * as ZOMBI from "./js/zombi";
import * as app from "./js/app";
import $ from "./js/dom";
import { toggle, show, hide } from "./js/utils";

// import "alpinejs";

// Zombi's everywhere
// window.ZOMBI = ZOMBI;
// window.app = app;
// window.$ = $;

// Navigator event
window.addEventListener("hashchange", app.router.navigate);

// Radio handlers
ZOMBI.listen("zombi-server-call-start", () => { $(".index_spinner_icon").removeClass("hidden"); }, "SPINNER_LISTENER_INDEX");
ZOMBI.listen("zombi-server-call-finish", () => { $(".index_spinner_icon").addClass("hidden"); }, "SPINNER_LISTENER_INDEX");

ZOMBI.listen("zombi-server-session-expired", () => { app.logoff(false); }, "LOGOUT_LISTENER_INDEX");

ZOMBI.listen(
    "zombi-server-socket-receive",
    music => { if (music.context && music.context === "SESSIONS_SEND_MESSAGE") { app.flash({ message: music.data, severity: "success" }); } },
    "MESSAGE_LISTENER_INDEX"
);

ZOMBI.listen(
    "zombi-server-socket-receive",
    music => { if (music.context && music.context === "zombi-server-session-expired") { app.logoff(false); } },
    "SESSION_EXPIRE_LISTENER"
);

ZOMBI.listen(
    "zombi-server-route-changed",
    ({ fragment, view, params }) => {
        // alert("route changed to " + view)
        $(".index_navbar_menu").children().each(item => {
            const item_view = ($(item).getAttr("href")).split("/")[1];

            if (item_view && item_view === view) {
                $(item).addClass("text-white bg-gray-900");
                $(item).removeClass("text-gray-300 hover:text-white hover:bg-gray-700");
            } else {
                $(item).removeClass("text-white bg-gray-900");
                $(item).addClass("text-gray-300 hover:text-white hover:bg-gray-700");
            }
        });
    },
    "INDEX_ROUTE_CHANGE_EVENTS"
);

ZOMBI.listen("ZOMBI_SERVER_SOCKET_CONNECTED", () => { $(".index_websockets_icon").removeClass("text-red-700"); }, "SOCKET_CONNECT_LISTENER_INDEX");
ZOMBI.listen("ZOMBI_SERVER_SOCKET_DISCONNECTED", () => { $(".index_websockets_icon").addClass("text-red-700"); }, "SOCKET_CONNECT_LISTENER_INDEX");


// Menu mobile
$(".index_mobile_hamburguer").on("click", () => {
    $(".index_mobile_menu").toggleClass("hidden");
});

$(".index_settings_button").on("click", event => {
    event.preventDefault();

    ZOMBI.dispatch("index-show-modal");
    // $("#modal").element().__x.$data.show = true;
});


// ZOMBI.listen("index-modal-action", (data, who) => { alert(data + who); }, "PEPITO");

// Login & Logoff
$("#index_logoff_button").on("click", event => {
    event.preventDefault();
    app.logoff();
});

const index_start = () => {
    ZOMBI.server(
        ["system/login", "start"],
        response => {
            if (response.error) {
                app.flash({ message: "Application cannot start", severity: "error" });
                setTimeout(() => {
                    window.location.replace("login.html");
                }, 2000);
            } else {
                ZOMBI.fullname(response.data.fullname);
                ZOMBI.timezone(response.data.timezone);
                app.i18n.init(response.data.i18n, true);
                app.router.navigate();
                app.overlay.hide();
                ZOMBI.ws.connect(false);

                $(".index_profile_username").html(response.data.fullname);
                $(".index_profile_email").html(response.data.email);
            }
        }
    );
};


// Start of application code
if (!ZOMBI.token()) { window.location.replace("login.html"); }
else { index_start(); }


// console.log(app.i18n.utc2local(1589063092));

$(".index_dropdown_profile").on("click", event => {
    toggle("#index_dropdown_profile_menu");
    $("#index_dropdown_profile_close").toggleClass("hidden");
});

$("#index_dropdown_profile_close").on("click", () => {
    hide("#index_dropdown_profile_menu");
    $("#index_dropdown_profile_close").addClass("hidden");
});

$(".index_mobile_hamburguer").on("click", () => {
    $(".index_mobile_menu").toggleClass("hidden");
});

// Modals close events
$(".close_modal").on("click", event => {
    hide(".modal");
});

window.addEventListener("keydown", function(event) {
    if (event.key === "Escape") { hide(".modal"); } 
    hide("#index_dropdown_profile_menu");
    $("#index_dropdown_profile_close").addClass("hidden");
}, true);




// $("#sidebar .components li a").not(".dropdown-toggle").on("click", event => {
// 	// https://tylergaw.com/articles/reacting-to-media-queries-in-javascript/
// 	let mql = window.matchMedia('(max-width: 768px)');

// 	if (mql.matches) {

// 		$("#sidebar").toggleClass("active");

// 	}

// });

// $("#views_container").on("click", event => {

// 	let mql = window.matchMedia('(max-width: 768px)');

// 	if (mql.matches) {

// 		$("#sidebar").removeClass("active");

// 	}

// });

// // To close the menu by swipping left
// $("#sidebar .components").touchwipe({
// 	wipeLeft: function () { $("#sidebar").removeClass("active"); },
// 	// wipeRight: function () { alert("right"); },
// 	// wipeUp: function () { alert("up"); },
// 	// wipeDown: function () { alert("down"); },
// 	min_move_x: 20,
// 	min_move_y: 20,
// 	preventDefaultEvents: false
// });