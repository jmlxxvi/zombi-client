"use stric";

import config from "./config";

var seq = 0;

var radio_stations = [];
var radio_device_counter = 0;

var ws_client = null;

var state_data = {};

const _local_storage = (key, value) => {
	if (typeof value === "undefined") { return localStorage.getItem(key); }
	else if (value === null) { localStorage.removeItem(key); }
	else { localStorage.setItem(key, value); }
};

const _log_time = () => {
	return (new Date().toISOString().split("T")[1]).replace("Z", "");
};

const log = (message, context = "UNKNOWN", error = false) => {
	const time = _log_time();

	if (config.CONSOLE_LOG_ENABLED) { 
		if(error) { console.error(`${time} ${context}: ${message}`); 
		} else { console.log(`${time} ${context}: ${message}`); }
		
	}
};

const sequence = () => { return seq++; };

const token = token => { return _local_storage("zombi_token", token) };

const fullname = fullname => { return _local_storage("zombi_fullname", fullname) };

const timezone = tz => { return _local_storage("zombi_timezone", tz) };

const language = lang => { return _local_storage("zombi_language", lang) };

const wipe_user_data = (include_lang = false) => {
	token(null);
	fullname(null);
	timezone(null);
	if (include_lang) { language(null); }
};

const state = {
	set({key, value, namespace = "global"}) {
		let current_state = {};

		Object.assign(current_state, state_data); // We return the previous state below

		if(typeof state_data[namespace] === "undefined") {
			state_data[namespace] = {};
		}

		state_data[namespace][key] = value;

		log(`State for module/key ${namespace}/${key} changed to ${JSON.stringify(value)}`, "STATE");

		dispatch("ZOMBI_STATE_CHANGE", { namespace, key, value, state_data });

		return current_state;
	},
	get({key = null, namespace = "global"}) {
		console.log("getting satte " + key)
		if(key === null) {
			if (state_data[namespace]) {
				return state_data[namespace]; 
			} else { 
				return null; 
			} 
		} else {
			if (state_data[namespace] && state_data[namespace][key]) {
				return state_data[namespace][key]; 
			} else { 
				return null; 
			} 
		}
	},
	data() { return state_data; },
	clear() { state_data = {}; dispatch("ZOMBI_STATE_CHANGE", { namespace: null, key: null, value: null, state_data }); }
};

const ws = {

	close() { if (ws_client) { ws_client.close(); } },

	connect(keep = true) {

		if (config.SOCKETS_CONNECT_ENABLED) {

			const token = token();

			if (token === null) {

				log("Token not set, reconnecting later", "SOCKETS");

				setTimeout(() => { ws.connect(); }, config.SOCKETS_RECCONNECT_TIME);

			} else if (keep && ws_client.readyState && ws_client.readyState === 1) {

				log("Already connected to server", "SOCKETS");

			} else {

				let url;

				if (!!config.SERVER_SOCK_HOST) {

					const protocol = (location.protocol === "http:") ? "ws:" : "wss:";

					//  If the port number is not specified or if it is the scheme's default port (like 80 or 443), an empty string is returned
					const port = location.port ? ":" + location.port : "";

					url = `${protocol}//${location.hostname}${port}?token=${token()}`;

				} else {

					url = `${config.SERVER_SOCK_HOST}?token=${token()}`;

				}

				log("Connecting to " + url, "SOCKETS");

				ws_client = new WebSocket(url);

				ws_client.onopen = () => {

					dispatch("ZOMBI_SERVER_SOCKET_CONNECTED");

					log("Connected", "SOCKETS");

				};

				ws_client.onclose = event => {

					dispatch("ZOMBI_SERVER_SOCKET_DISCONNECTED");

					const reconnect_time = config.SOCKETS_RECCONNECT_TIME;

					log(`Socket is closed. Reconnect will be attempted in ${reconnect_time} milliseconds: ${event.reason}`, "SOCKETS");

					setTimeout(() => { ws.connect(); }, reconnect_time);

				};

				ws_client.onmessage = event => {

					log("Message: " + event.data, "SOCKETS");

					if (event.data.substring(0, 4) === "ping") { // Server sent hertbeat ping

						if (ws_client && ws_client.readyState && ws_client.readyState === 1) {

							log("Server sent ping, answering with pong", "SOCKETS");

							ws_client.send("pong");

						} else {

							log("Cannot answer ping, not connected", "SOCKETS");

						}

					} else {

						const data = JSON.parse(event.data);

						dispatch("zombi-server-socket-receive", data);

					}

				};

				ws_client.onerror = event => {

					log("Connection error", "SOCKETS");

				};

			}

		} else { log("IO: Connection disabled on config", "SOCKETS"); }

	}

};

const server = (params, callback) => {

	if (typeof callback === "function") { return _exec(params, callback); }
	else {
		return new Promise((resolve, reject) => {
			_exec(params, (err, res) => {
				if (err) { reject(err); }
				else { resolve(res); }
			});

		});
	}

};

const _exec = (params, callback) => {

	const tkn = token();
	const base = {
		mod: "",
		fun: "",
		args: {},
		sequence: sequence()
	};

	if (tkn) { base.token = tkn }; // Token should be an string or not sent at all

	const smarap = (Array.isArray(params)) ? { mod: params[0], fun: params[1], args: params[2] } : params;
	const merged = { ...base, ...smarap };

	dispatch("zombi-server-call-start", [merged.mod, merged.fun]);

	const url = config.SERVER_HTTP_HOST ? `${config.SERVER_HTTP_HOST}${config.SERVER_PATH}` : config.SERVER_PATH;

	fetch(url, {
		method: 'POST',
		mode: 'cors', // no-cors, *cors, same-origin
		cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
		credentials: 'same-origin', // include, *same-origin, omit
		headers: {
			'Content-Type': 'application/json'
		},
		redirect: 'follow', // manual, *follow, error
		referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
		body: JSON.stringify(merged),
	})
		.then(response => {
			if(response.status === 204) { return false; } // Response from OPTIONS preflight
			else if(response.status === 200 || response.status === 500) { return response.json(); } 
			else {
				if (typeof callback === "function") {
					callback({
						error: true,
						code: response.status,
						message: response.statusText,
						data: null
					});
				}

				return false;
			}
			
		})
		.then(response => {

			if(response !== false) {

				if (
					typeof response === "undefined" ||
					typeof response.error === "undefined" ||
					typeof response.code === "undefined" ||
					typeof response.data === "undefined" ||
					typeof response.message === "undefined"
				) {

					if (typeof callback === "function") {
						callback({
							error: true,
							code: 602,
							message: `Malformed response from server`,
							data: null
						});
					}

				} else {

					if (response.code === 1001) { dispatch("zombi-server-session-expired"); } 
					else { if (typeof callback === "function") { callback(response); } }

				}

			} 

			dispatch("zombi-server-call-traffic", { sequence: merged.sequence, request: merged, response });
		})
		.catch((error) => {

			if (typeof callback === "function") {
				callback({
					error: true,
					code: 600,
					message: `Server error: ${error.message}`,
					data: null
				});
			}

			log(error, "SERVER", true);

			dispatch("zombi-server-call-traffic", { sequence: merged.sequence, request: merged, response: `Server error: ${error.message}` });
		})
		.then(() => {
			dispatch("zombi-server-call-finish", [merged.mod, merged.fun]);
		});

	return merged;

};

const listen = (event, fun, who = "UNKNOWN") => {
	log(`${who} is now listening to event ${event}`, "EVENTS");
	window.addEventListener(event, e => { fun(e.detail); });
};

const dispatch = (event, data = null) => {
	if(event !== "zombi-server-call-traffic") {
		log(`Dispatching event ${event} with data ${JSON.stringify(data)}`, "EVENTS");
	}
	const e = new CustomEvent(event, { bubbles: true, detail: data });
	window.dispatchEvent(e);
};

// const radio = {

// 	turnon(station, func, listener = null) {

// 		const who_is_listening = (listener === null) ? radio_device_id : listener;

// 		window.addEventListener(station, event => {
// 			log(`Receptor ${who_is_listening} is now listening to station ${station}`, "RADIO");
// 			func(event.detail)
//         });

// 	},

// 	emit(station, music = null) {

// 		log(`Station ${station} is emiting the music ${JSON.stringify(music)}`, "RADIO");

// 		const event = new CustomEvent(station, { detail: music });

//         window.dispatchEvent(event);

// 	},

// };

const utils = {

	base64toBlob(base64Data, contentType) {
		contentType = contentType || '';
		var sliceSize = 1024;
		var byteCharacters = atob(base64Data);
		var bytesLength = byteCharacters.length;
		var slicesCount = Math.ceil(bytesLength / sliceSize);
		var byteArrays = new Array(slicesCount);

		for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
			var begin = sliceIndex * sliceSize;
			var end = Math.min(begin + sliceSize, bytesLength);

			var bytes = new Array(end - begin);
			for (var offset = begin, i = 0; offset < end; ++i, ++offset) {
				bytes[i] = byteCharacters[offset].charCodeAt(0);
			}
			byteArrays[sliceIndex] = new Uint8Array(bytes);
		}
		return new Blob(byteArrays, { type: contentType });
	}

};

/* ----- */

export {
	token,
	fullname,
	language,
	timezone,
	log,
	// radio,
	server,
	state,
	utils,
	ws,
	wipe_user_data,
	listen,
	dispatch
}