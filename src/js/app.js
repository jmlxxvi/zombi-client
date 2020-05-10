"use strict";

import { DateTime } from "luxon";

import config from "./config";
import ZOMBI from "./zombi";
import $ from "./dom";



var i18n_data;

let flash_timeout;

$(".flash_close").on("click", () => {

    $("#flash_message").addClass("hidden");

});

const INDEX = (() => {

	return {

		utils: {

			// https://stackoverflow.com/a/46955619
			to_unicode(text) {
				const span = document.createElement('span');

				return text
					.replace(/&[#A-Za-z0-9]+;/gi, (entity, position, text) => {
						span.innerHTML = entity;
						return span.innerText;
					});
			},

			escape_for_html(text) {

				if (text && typeof text.replace === "function") {

					var map = {
						'&': '&amp;',
						'<': '&lt;',
						'>': '&gt;',
						'"': '&quot;',
						"'": '&#039;'
					};

					return text.replace(/[&<>"']/g, function (m) { return map[m]; });

				} else { return text; }

			}

		},

		i18n: {
			format_number: function (number, precision = 2, currency = false) {
				// Reference: https://numbrojs.com/format.html
				numbro.setLanguage(ZOMBI.language());

				if (currency) {
					return numbro(number).format({ thousandSeparated: true, mantissa: precision });
				} else {
					return numbro(number).formatCurrency({ mantissa: precision });
				}
			},
			utc2timeago(timestamp) {
				return DateTime.fromSeconds(timestamp, { zone: ZOMBI.timezone(), locale: ZOMBI.language() }).toRelative();
			},
			utc2local(timestamp, format = DateTime.DATE_SHORT) {
				// https://moment.github.io/luxon/docs/manual/formatting.html


				return DateTime.fromSeconds(timestamp, { zone: ZOMBI.timezone(), locale: ZOMBI.language() }).toLocaleString(format);
			},

			init(data, apply) {

				i18n_data = data;

				if (apply === true) { INDEX.i18n.apply(); }

			},

			label(name, replace, transform) {

				let i, repl;

				if (!replace) { repl = []; }
				else { repl = (Array.isArray(replace)) ? replace : [replace]; }

				let label;

				if (i18n_data && i18n_data[name]) {

					label = i18n_data[name];

					for (i = 1; i <= repl.length; i++) { label = label.split("{" + i + "}").join(repl[i - 1]); }

					if (typeof transform === "function") { label = transform(label, n); }

				} else { label = "[" + name + "]"; }

				return INDEX.utils.escape_for_html(label);

			},

			apply() { 
				$(".i18n").each(item => { 
					const word = $(item).html();

					if(word) { $(item).html(INDEX.i18n.label(word)); }
				});
			}
		},

		flash({ message, severity = "error", title = "" }) {
			clearTimeout(flash_timeout);

			const timeout = severity === "error" ? 6000 : 10000;
			const color = severity === "error" ? "red" : "green";

			$("#flash_message").addClass(`bg-${color}-100`);
			$("#flash_message").addClass(`text-${color}-700`);
			$("#flash_message").addClass(`border-${color}-400`);

			$("#flash_message").removeClass("hidden");

			$("#flash_message .flash_text").text(message);
			$("#flash_message .flash_title").text(title);

			flash_timeout = setTimeout(() => { $("#flash_message").addClass("hidden"); }, timeout);
		},

		router: {
			navigate() {
				ZOMBI.log("AHOY sailor!!", "ROUTER");

				if (!location.hash) { location.hash = `#/${config.LANDING_VIEW}`; return false; }

				const hash = location.hash.substr(1);
				const components = hash.split("/");
				const fragment = components[0];
				const view = components[1];
				const view_id = `zombi_view_${view}`;
				const params = [];

				for (let i = 2, l = components.length; i < l; i++) { params.push(components[i]); };

				if (INDEX.router.check(view)) {

					$('.zombi_view').each(item => { $(item).addClass('hidden'); });

					$(`#${view_id}`).removeClass("hidden");

					ZOMBI.radio.emit("ZOMBI_SERVER_ROUTE_CHANGED", { fragment, view, params });

				}

			},

			// In the future we may want to check permissions
			check(view, params) { return true; },
		},
		wipe_local_data() {
			ZOMBI.token(null);
			ZOMBI.fullname(null);
			ZOMBI.timezone(null);
			//ZOMBI.language(null); // We keep lang so the user get the login page on his language
		},
		logoff(server = true) {
			if (server) {
				// If server isn't fast enough we leave anyway
				setTimeout(() => { window.location.replace("login.html"); }, 2000);

				ZOMBI.server(
					["system/login", "logoff"],
					() => {
						INDEX.wipe_local_data();
						ZOMBI.ws.close();
						window.location.replace("login.html");
					}
				);
			} else {
				INDEX.wipe_local_data();
				window.location.replace("login.html");
			}

		},
		overlay: {
			hide() { $('.overlay_spinner').addClass("hidden"); },
			show() { $('.overlay_spinner').removeClass("hidden"); },
		},

		// load_modal(modal) {

		// 	$('#index_popup_modal_content').load("modals/" + modal + ".html", (response, status, xhr) => {

		// 		if (status == "error") { INDEX.flash(INDEX.i18n.label("ERROR_LOADING_MODAL_WINDOW")); }

		// 		else { $('#index_popup_modal').modal(); }

		// 	});

		// },

		// close_modal() { $('#index_popup_modal').modal("hide"); },

		// select(node, source, filter, empty, selected) {

		// 	const empty_data = (empty && Array.isArray(empty) && empty.length === 2) ? empty : null;

		// 	const [mod, fun] = source.split(":");

		// 	const element = document.getElementById(node);

		// 	element.innerHTML = "";

		// 	ZOMBI.server(
		// 		[mod, fun, filter],

		// 		response => {

		// 			if (response.error) { INDEX.flash(response.message); }

		// 			else {

		// 				const elements = response.data

		// 				if (empty_data !== null) {

		// 					const option = document.createElement('option');

		// 					option.value = empty_data[0];
		// 					option.text = empty_data[1];

		// 					element.add(option);

		// 				}

		// 				for (const s of elements) {

		// 					const option = document.createElement('option');

		// 					option.value = s[0];
		// 					option.text = s[1];

		// 					if (s[0] == selected) { option.selected = true; }

		// 					element.add(option);

		// 				}

		// 			}

		// 		}

		// 	);

		// },

		// TODO implement this
		change_password(current, typed, retiped) {

			ZOMBI.server(
				["system/login", "reset_password", [current, typed, retiped]],
				response => {

					if (response.error) {

						console.log(response.message);

					} else {

						console.log(JSON.stringify(response));

					}

				}

			);

		}

	};

})();

export default INDEX;


/*
Name 						Description 														Example in en_US 											Example in fr
DATE_SHORT 					short date 															10/14/1983 													14/10/1983
DATE_MED 					abbreviated date 													Oct 14, 1983 												14 oct. 1983
DATE_FULL 					full date 															October 14, 1983 											14 octobre 1983
DATE_HUGE 					full date with weekday 												Tuesday, October 14, 1983 									vendredi 14 octobre 1983
TIME_SIMPLE 				time 																1:30 PM 													13:30
TIME_WITH_SECONDS 			time with seconds 													1:30:23 PM 													13:30:23
TIME_WITH_SHORT_OFFSET 		time with seconds and abbreviated named offset 						1:30:23 PM EDT 												13:30:23 UTC−4
TIME_WITH_LONG_OFFSET 		time with seconds and full named offset 							1:30:23 PM Eastern Daylight Time 							13:30:23 heure d’été de l’Est
TIME_24_SIMPLE 				24-hour time 														13:30 														13:30
TIME_24_WITH_SECONDS 		24-hour time with seconds 											13:30:23 													13:30:23
TIME_24_WITH_SHORT_OFFSET 	24-hour time with seconds and abbreviated named offset 				13:30:23 EDT 												13:30:23 UTC−4
TIME_24_WITH_LONG_OFFSET 	24-hour time with seconds and full named offset 					13:30:23 Eastern Daylight Time 								13:30:23 heure d’été de l’Est
DATETIME_SHORT 				short date & time 													10/14/1983, 1:30 PM 										14/10/1983 à 13:30
DATETIME_MED 				abbreviated date & time 											Oct 14, 1983, 1:30 PM 										14 oct. 1983 à 13:30
DATETIME_FULL 				full date and time with abbreviated named offset 					October 14, 1983, 1:30 PM EDT 								14 octobre 1983 à 13:30 UTC−4
DATETIME_HUGE 				full date and time with weekday and full named offset 				Friday, October 14, 1983, 1:30 PM Eastern Daylight Time 	vendredi 14 octobre 1983 à 13:30 heure d’été de l’Est
DATETIME_SHORT_WITH_SECONDS short date & time with seconds 										10/14/1983, 1:30:23 PM 										14/10/1983 à 13:30:23
DATETIME_MED_WITH_SECONDS 	abbreviated date & time with seconds 								Oct 14, 1983, 1:30:23 PM 									14 oct. 1983 à 13:30:23
DATETIME_FULL_WITH_SECONDS 	full date and time with abbreviated named offset with seconds 		October 14, 1983, 1:30:23 PM EDT 							14 octobre 1983 à 13:30:23 UTC−4
DATETIME_HUGE_WITH_SECONDS 	full date and time with weekday and full named offset with seconds 	Friday, October 14, 1983, 1:30:23 PM Eastern Daylight Time 	vendredi 14 octobre 1983 à 13:30:23 heure d’été de l’Est
*/
