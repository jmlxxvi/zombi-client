"use strict";

import { DateTime } from "luxon";

import config from "./config";
import * as ZOMBI from "./zombi";
import $ from "./dom";

import views from "./views";

var i18n_data;

let flash_timeout;

let last_view = null;

$("#flash_message").on("click", () => { $("#flash_message").addClass("hidden"); });

const flash = (args) => {

	let message, severity, title;

	if (typeof args === "string") {

		message = args;
		severity = "error";
		title = ""

	} else {

		message = args.message ? args.message : "";
		severity = args.severity ? args.severity : "error";
		title = args.title ? args.title : "";

	}

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
};

const utils = {

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

};

const i18n = {

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

		if (apply === true) { i18n.apply(); }

	},

	label(name, replace, transform) {

		let i, repl;

		const n = name.trim();

		if (!replace) { repl = []; }
		else { repl = (Array.isArray(replace)) ? replace : [replace]; }

		let label;

		if (i18n_data && i18n_data[n]) {

			label = i18n_data[n];

			for (i = 1; i <= repl.length; i++) { label = label.split("{" + i + "}").join(repl[i - 1]); }

			if (typeof transform === "function") { label = transform(label); }

		} else { label = "[" + n + "]"; }

		return utils.escape_for_html(label);

	},

	apply() {
		$(".i18n").each(item => {
			const word = $(item).html();

			if (word) { $(item).html(i18n.label(word)); }
		});
	}
};


const router = {
	go(path) { window.location.replace(`#/${path}`); },
	navigate() {

		if (!location.hash) {
			ZOMBI.log(`Navigating to default route: ${config.LANDING_VIEW}`, "ROUTER");
			location.hash = `#/${config.LANDING_VIEW}`;
			return true;
		}

		ZOMBI.log("AHOY sailor!!", "ROUTER");

		

		const hash = location.hash.substr(1);
		const components = hash.split("/");
		const fragment = components.shift();
		const view = components.shift();
		const params = [...components];
		const view_id = `zombi_view_${view}`;

		if (router.check(view)) {

			$('.zombi_view').each(item => { $(item).addClass('hidden'); });

			$(`#${view_id}`).removeClass("hidden");

			

			ZOMBI.dispatch("zombi-server-route-changed", { fragment, view, params });
			
			if(views[view] && typeof views[view].render === "function") {
				views[view].render(view, params, fragment);
			} else { ZOMBI.log(`View ${view} does not implement render()`, "ROUTER", true); }

			return true;

			if(last_view !== null && last_view !== view && views[last_view] && typeof views[last_view].hide === "function") {
				views[last_view].hide(view, params, fragment);
			}

			last_view = view;

		}

	},

	// In the future we may want to check permissions
	check(view, params) { return true; },
};

const logoff = (server = true) => {
	if (server) {
		// If server isn't fast enough we leave anyway
		setTimeout(() => { window.location.replace("login.html"); }, 2000);

		ZOMBI.server(
			["system/login", "logoff"],
			() => {
				ZOMBI.wipe_user_data();
				ZOMBI.ws.close();
				window.location.replace("login.html");
			}
		);
	} else {
		ZOMBI.wipe_user_data();
		window.location.replace("login.html");
	}

};

const overlay = {
	hide() { $('.overlay_spinner').addClass("hidden"); },
	show() { $('.overlay_spinner').removeClass("hidden"); },
};

const modal = {

	toggle(id) {
		// document.getElementById(id).classList.toggle("hidden");
		// document.getElementById(id + "-backdrop").classList.toggle("hidden");
		$(`#${id}`).toggleClass("hidden");
		$(".modal_backdrop").toggleClass("hidden");
		// $(`#${id}`).toggleClass("flex");
		// $(`#${id}-backdrop`).toggleClass("flex");
		// document.getElementById(id).classList.toggle("flex");
		// document.getElementById(id + "-backdrop").classList.toggle("flex");
	},

	close(id) {
		$(".modal").addClass("hidden");
		$(".modal_backdrop").addClass("hidden");
	}

}

const _nextFrame = () => {
	return new Promise(resolve => {
		requestAnimationFrame(() => {
			requestAnimationFrame(resolve);
		});
	});
}

const _afterTransition = element => {
	return new Promise(resolve => {
		const duration = Number(
			getComputedStyle(element)
				.transitionDuration
				.replace('s', '')
		) * 1000;

		setTimeout(() => {
			resolve();
		}, duration);
	});
}

const transitions = {

	async enter(element, transition) {

		element.classList.remove('hidden');
	
		element.classList.add(`${transition}-enter`);
		element.classList.add(`${transition}-enter-start`);
	
		await _nextFrame();
	
		element.classList.remove(`${transition}-enter-start`);
		element.classList.add(`${transition}-enter-end`);
	
		await _afterTransition(element);
	
		element.classList.remove(`${transition}-enter-end`);
		element.classList.remove(`${transition}-enter`);
	
	
	},
	
	async leave(element, transition) {
	
		element.classList.add(`${transition}-leave`);
		element.classList.add(`${transition}-leave-start`);
	
		await _nextFrame();
	
		element.classList.remove(`${transition}-leave-start`);
		element.classList.add(`${transition}-leave-end`);
	
		await _afterTransition(element);
	
		element.classList.remove(`${transition}-leave-end`);
		element.classList.remove(`${transition}-leave`);
	  
		element.classList.add('hidden');
	},
	async modal_enter(element) {

		const dom = $(element);

		dom.removeClass("hidden sm:hidden");

		dom.addClass("transition ease-out duration-1000");
		dom.addClass("opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95");
		await _nextFrame();
		dom.removeClass("opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95");
		dom.addClass("opacity-100 translate-y-0 sm:scale-100");



	// 	Entering: "ease-out duration-300"
	// 	From: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
	// 	To: "opacity-100 translate-y-0 sm:scale-100"
	//
	//  Leaving: "ease-in duration-200"
	// 	From: "opacity-100 translate-y-0 sm:scale-100"
	// 	To: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"

	},
	async modal_leave(element) {

		const dom = $(element);

		
		dom.addClass("transition ease-in duration-200");
		dom.addClass("opacity-100 translate-y-0 sm:scale-100");
		
		await _nextFrame();
		dom.removeClass("opacity-100 translate-y-0 sm:scale-100");
		dom.addClass("opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95");
		
		await _afterTransition(dom.element());

		dom.addClass("hidden sm:hidden");

	}
}

export { flash, utils, i18n, router, logoff, overlay, modal, transitions };



	// load_modal(modal) {

	// 	$('#index_popup_modal_content').load("modals/" + modal + ".html", (response, status, xhr) => {

	// 		if (status == "error") { flash(i18n.label("ERROR_LOADING_MODAL_WINDOW")); }

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

	// 			if (response.error) { flash(response.message); }

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
	// change_password(current, typed, retiped) {

	// 	ZOMBI.server(
	// 		["system/login", "reset_password", [current, typed, retiped]],
	// 		response => {

	// 			if (response.error) {

	// 				console.log(response.message);

	// 			} else {

	// 				console.log(JSON.stringify(response));

	// 			}

	// 		}

	// 	);

	// }


// };

// export default INDEX;


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
