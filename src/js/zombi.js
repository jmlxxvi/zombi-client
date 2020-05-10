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

const ZOMBI = {

	log(message, context = "UNKNOWN") {
		const time = _log_time();

		if (config.CONSOLE_LOG_ENABLED) { console.log(`${time} ${context}: ${message}`); }
	},

	error(message, context = "UNKNOWN") {
		const time = _log_time();

		if (config.CONSOLE_LOG_ENABLED) { console.error(`${time} ${context}: ${message}`); }
	},

	sequence() { return seq++; },

	token(token) { return _local_storage("zombi_token", token) },

	fullname(fullname) { return _local_storage("zombi_fullname", fullname) },

	timezone(tz) { return _local_storage("zombi_timezone", tz) },

	language(lang) { return _local_storage("zombi_language", lang) },

	state: {

		set(key, value) {

			let current_state = {};

			Object.assign(current_state, state_data); // We return the previous state below

			state_data[key] = value;

			ZOMBI.log(`State for key ${key} changed to ${JSON.stringify(value)}`, "STATE");

			ZOMBI.radio.emit("ZOMBI_STATE_CHANGE", { key, value, state_data });

			return current_state;

		},

		get(key) { if (state_data[key]) { return state_data[key]; } else { return null; } },

		data() { return state_data; },

		clear() { state_data = {}; ZOMBI.radio.emit("ZOMBI_STATE_CHANGE", { key: null, value: null, state_data }); }

	},

	ws: {

		close() { if (ws_client) { ws_client.close(); } },

		connect(keep = true) {

			if (config.SOCKETS_CONNECT_ENABLED) {

				const token = ZOMBI.token();

				if (token === null) {

					ZOMBI.log("Token not set, reconnecting later", "SOCKETS");

					setTimeout(() => { ZOMBI.ws.connect(); }, config.SOCKETS_RECCONNECT_TIME);

				} else if (keep && ws_client.readyState && ws_client.readyState === 1) {

					ZOMBI.log("Already connected to server", "SOCKETS");

				} else {

					let url;

					if (!!config.SERVER_SOCK_HOST) {

						const protocol = (location.protocol === "http:") ? "ws:" : "wss:";

						//  If the port number is not specified or if it is the scheme's default port (like 80 or 443), an empty string is returned
						const port = location.port ? ":" + location.port : "";

						url = `${protocol}//${location.hostname}${port}?token=${ZOMBI.token()}`;

					} else {

						url = `${config.SERVER_SOCK_HOST}?token=${ZOMBI.token()}`;

					}

					ZOMBI.log("Connecting to " + url, "SOCKETS");

					ws_client = new WebSocket(url);

					ws_client.onopen = () => {

						ZOMBI.radio.emit("ZOMBI_SERVER_SOCKET_CONNECTED");

						ZOMBI.log("Connected", "SOCKETS");

					};

					ws_client.onclose = event => {

						ZOMBI.radio.emit("ZOMBI_SERVER_SOCKET_DISCONNECTED");

						const reconnect_time = config.SOCKETS_RECCONNECT_TIME;

						ZOMBI.log(`Socket is closed. Reconnect will be attempted in ${reconnect_time} milliseconds: ${event.reason}`, "SOCKETS");

						setTimeout(() => { ZOMBI.ws.connect(); }, reconnect_time);

					};

					ws_client.onmessage = event => {

						ZOMBI.log("Message: " + event.data, "SOCKETS");

						if (event.data.substring(0, 4) === "ping") { // Server sent hertbeat ping

							if (ws_client && ws_client.readyState && ws_client.readyState === 1) {

								ZOMBI.log("Server sent ping, answering with pong", "SOCKETS");

								ws_client.send("pong");

							} else {

								ZOMBI.log("Cannot answer ping, not connected", "SOCKETS");

							}

						} else {

							const data = JSON.parse(event.data);

							ZOMBI.radio.emit("ZOMBI_SERVER_SOCKET_RECEIVE", data);

						}

					};

					ws_client.onerror = event => {

						ZOMBI.log("Connection error", "SOCKETS");

					};

				}

			} else { ZOMBI.log("IO: Connection disabled on config", "SOCKETS"); }

		}

	},
	server(params, callback) {

		if (typeof callback === "function") { return ZOMBI._exec(params, callback); }
		else {
			return new Promise((resolve, reject) => {
				ZOMBI._exec(params, (err, res) => {
					if (err) { reject(err); }
					else { resolve(res); }
				});

			});
		}

	},
	_exec(params, callback) {

		const token = ZOMBI.token();
		const base = {
			mod: "",
			fun: "",
			args: {},
			sequence: ZOMBI.sequence()
		};

		if (token) { base.token = token }; // Token should be an string or not sent at all

		const smarap = (Array.isArray(params)) ? { mod: params[0], fun: params[1], args: params[2] } : params;
		const merged = { ...base, ...smarap };

		ZOMBI.radio.emit("ZOMBI_SERVER_CALL_START", [merged.mod, merged.fun]);

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
	
						if (response.code === 1001) { ZOMBI.radio.emit("ZOMBI_SERVER_SESSION_EXPIRED"); } 
						else { if (typeof callback === "function") { callback(response); } }
	
					}

				} 

				ZOMBI.radio.emit("ZOMBI_SERVER_CALL_TRAFFIC", { sequence: merged.sequence, request: merged, response });
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

				ZOMBI.error(error, "SERVER");

				ZOMBI.radio.emit("ZOMBI_SERVER_CALL_TRAFFIC", { sequence: merged.sequence, request: merged, response: `Server error: ${error.message}` });
			})
			.then(() => {
				ZOMBI.radio.emit("ZOMBI_SERVER_CALL_FINISH", [merged.mod, merged.fun]);
			});

		return merged;

	},

	radio: {

		turnon(station, func, listener = null) {

			if (!radio_stations[station]) { radio_stations[station] = []; }

			var radio_device_id = (++radio_device_counter).toString();

			if (ZOMBI.radio._check_exists(station, "listener", listener)) {

				ZOMBI.log(`RADIO: The listner ${listener} is already listening to ${station}`);

			} else {

				radio_stations[station].push({
					radio_device_id,
					func,
					listener
				});

				const who_is_listening = (listener === null) ? radio_device_id : listener;

				ZOMBI.log(`Receptor ${who_is_listening} is now listening to station ${station}`, "RADIO");

			}

			return radio_device_id;

		},

		emit(station, music = null) {

			// const sequence = ZOMBI.sequence();

			if (!radio_stations[station]) {

				ZOMBI.log(`Nobody is listening to station ${station}`, "RADIO");

				return false;

			}

			setTimeout(function () {

				let subscribers = radio_stations[station],
					len = subscribers ? subscribers.length : 0;

				while (len--) {

					subscribers[len].func(music);

					const who_is_listening = (subscribers[len].listener === null) ? subscribers[len].radio_device_id : subscribers[len].listener;

					ZOMBI.log(`Station ${station} is emiting the music ${JSON.stringify(music)	} to receptor ${who_is_listening}`, "RADIO");

				}

			}, 0);

		},

		turnoff(radio_device_id) {

			for (var m in radio_stations) {

				if (radio_stations[m]) {

					for (var i = 0, j = radio_stations[m].length; i < j; i++) {

						if (radio_stations[m][i].radio_device_id === radio_device_id) {

							ZOMBI.log(`Device ${radio_device_id} is not listening to station ${m} anymore`, "RADIO");

							radio_stations[m].splice(i, 1);

							return radio_device_id;

						}

					}

				}

			}

		},

		_check_exists(station2add, what, thing) {

			let it_does = false;

			for (const station in radio_stations) {

				if (radio_stations[station]) {

					const j = radio_stations[station].length;

					for (let i = 0; i < j; i++) {

						if (station === station2add && radio_stations[station][i][what] === thing) {

							it_does = true;

						}

					}

				}

			}

			return it_does;

		},

	},

	utils: {

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

	},

};

export default ZOMBI;