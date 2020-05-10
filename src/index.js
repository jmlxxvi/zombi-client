import "./css/styles.css";

// https://github.com/zloirock/core-js#babel
// import "core-js"; 
// import "regenerator-runtime/runtime";

import config from "./js/config";
import ZOMBI from "./js/zombi";
import app from "./js/app";
import $ from "./js/dom";

ZOMBI.radio.turnon("ZOMBI_SERVER_CALL_START", () => { $(".index_spinner_icon").removeClass("hidden"); }, "SPINNER_LISTENER_INDEX");
ZOMBI.radio.turnon("ZOMBI_SERVER_CALL_FINISH", () => { $(".index_spinner_icon").addClass("hidden"); }, "SPINNER_LISTENER_INDEX");

ZOMBI.radio.turnon("ZOMBI_SERVER_SESSION_EXPIRED", () => { app.logoff(false); }, "LOGOUT_LISTENER_INDEX");

ZOMBI.radio.turnon(
    "ZOMBI_SERVER_SOCKET_RECEIVE",
    music => { if (music.context && music.context === "SESSIONS_SEND_MESSAGE") { app.flash(music.data, "success"); } },
    "MESSAGE_LISTENER_INDEX"
);

ZOMBI.radio.turnon(
    "ZOMBI_SERVER_SOCKET_RECEIVE",
    music => { if (music.context && music.context === "ZOMBI_SERVER_SESSION_EXPIRED") { app.logoff(false); } },
    "SESSION_EXPIRE_LISTENER"
);

ZOMBI.radio.turnon("ZOMBI_SERVER_SOCKET_CONNECTED", () => { $(".index_websockets_icon").removeClass("text-red-700"); }, "SOCKET_CONNECT_LISTENER_INDEX");
ZOMBI.radio.turnon("ZOMBI_SERVER_SOCKET_DISCONNECTED", () => { $(".index_websockets_icon").addClass("text-red-700"); }, "SOCKET_CONNECT_LISTENER_INDEX");

$(".flash_close").on("click", () => { $("#flash_message").addClass("opacity-0"); });

window.addEventListener("hashchange", app.router.navigate);

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
            }
        }
    );
};

if (!ZOMBI.token()) { window.location.replace("login.html"); } 
else { index_start(); }

console.log(app.i18n.utc2local(1589063092));

$(".index_dropdown_profile").on("click", event => {

    event.preventDefault();

    $("#index_dropdown_profile_menu").toggleClass("hidden");
    $("#index_dropdown_profile_close").toggleClass("hidden");

});

$("#index_dropdown_profile_close").on("click", () => {

    $("#index_dropdown_profile_menu").addClass("hidden");
    $("#index_dropdown_profile_close").addClass("hidden");

});

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