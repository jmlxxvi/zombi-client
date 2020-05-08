import $ from "./dom";

const INDEX = (() => {

	var datatable_nodes = {};

	var i18n_data;

	var local_data = {};

	return {

		data: {

			get(key) { if (typeof local_data[key] === "undefined") { return null; } else { return local_data[key]; } },
			set(key, value) { local_data[key] = value; }

		},

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

				} else {

					return text;

				}

			}

		},

		i18n: {

			_moment_locale() {

				const language = ZOMBI.language();

				let l;

				// Exceptions to locales because, for example, there is no zh but we have zh-cn
				switch (language) {

					case "zh": l = "zh-cn"; break;

					default: l = language; break;
				}

				return l;

			},

			// In case we need to change it later, see above
			_numbro_locale() { return ZOMBI.language(); },

			format_number: function (number, precision = 2, currency = false) {
				// Alternative to accounting or numbro: https://refreshless.com/wnumb/

				// Reference: https://numbrojs.com/format.html
				numbro.setLanguage(INDEX.i18n._numbro_locale());

				if (currency) {

					return numbro(number).format({ thousandSeparated: true, mantissa: precision });

				} else {

					return numbro(number).formatCurrency({ mantissa: precision });

				}

			},

			utc2timeago(timestamp) {

				return moment(timestamp, "X").locale(INDEX.i18n._moment_locale()).tz(ZOMBI.timezone()).fromNow();

			},

			// https://en.wikipedia.org/wiki/ISO_8601
			iso2timeago(datetime) {

				return moment(datetime).locale(INDEX.i18n._moment_locale()).tz(ZOMBI.timezone()).fromNow();

			},

			utc2local(timestamp, format = null, with_zone = false) {

				let f;

				// Reference: http://momentjs.com/docs/#/displaying/format/
				if (format === null) { f = "LLL"; }

				if (!with_zone) { f += " z"; }

				return moment(timestamp, "X").locale(INDEX.i18n._moment_locale()).tz(ZOMBI.timezone()).format(f);

			},

			init(data, apply) {

				i18n_data = data;

				if (apply === true) { INDEX.i18n.apply(); }

			},

			label(name, replace, transform) {

				let i, repl;

				if (!replace) { repl = []; }
				else { repl = (Array.isArray(replace)) ? replace : [replace]; }

				const replace_members = repl.length;

				let label;

				if (i18n_data && i18n_data[name]) {

					label = i18n_data[name];

					for (i = 1; i <= replace_members; i++) {

						label = label.split("{" + i + "}").join(repl[i - 1]);

					}

					if (typeof transform === "function") { label = transform(label, n); }

				} else { label = "[" + name + "]"; }

				return INDEX.utils.escape_for_html(label);

			},

			apply() { $('.i18n').each(function () {
					if ($(this).data("i18n")) {
						$(this).html(INDEX.i18n.label($(this).data("i18n"))); 
					}
			}); }

		},

		flash({ message, severity = "error", title = "" }) {

			const timeout = severity === "error" ? 6000 : 10000;

			$("#flash_message").removeClass("opacity-0");
			$("#flash_message > .flash_text").text(message);
			$("#flash_message > .flash_title").text(title);

			setTimeout(() => { $("#flash_message").addClass("opacity-0"); }, timeout);
		},

		router: {

			navigate(reload) {

				ZOMBI.log("AHOY sailor!!", "ROUTER");

				if (!location.hash) { location.hash = `#/${ZOMBI.config("LANDING_VIEW")}` }

				const hash = location.hash.substr(1);

				const components = hash.split("/");

				const fragment = components[0];
				const view = components[1];

				const view_id = `zombi_view_${view}`;

				const params = [];

				for (let i = 2, l = components.length; i < l; i++) {

					params.push(components[i]);

				};

				if (INDEX.router.check(view)) {

					if (reload) {

						$('#views_container > #' + view_id).remove();

					}

					const url = ZOMBI.config("SERVER_HTTP_HOST") ? `${ZOMBI.config("SERVER_HTTP_HOST")}/zombi/views/${view}` : `views/${view}`;

					const viewHTML = `${url}.html`;
					const viewJS = `${url}.js`;

					if (!$('#views_container > #' + view_id).length) {

						ZOMBI.log(`Loading view ${view}`, "ROUTER");

						$('#views_container > div').each(function () {

							$(this).addClass('d-none');

						});

						$('#views_container').append('<div id="' + view_id + '"></div>');

						INDEX.spinner.hide();

						$.ajax(

							{ url: viewHTML, cache: false, dataType: "html" }

						).done((data) => {

							$('#views_container > #' + view_id).html(data);

							const script = document.createElement("script");
							script.setAttribute("src", viewJS);
							script.setAttribute("type", "text/javascript");
							document.head.appendChild(script);

							script.onload = () => { // We wait for the view to be loaded and listening
								INDEX.router.emit_route_change({ fragment, view, params })
							};

						}).fail((x, s, e) => {

							INDEX.flash(INDEX.i18n.label("ERROR_LOADING_VIEW"));

						}).always(() => { INDEX.spinner.hide(); });

					} else { // View was already lodaed

						ZOMBI.log(`View ${view} was already loaded`, "ROUTER");

						$('#views_container > div').each(function () {

							$(this).addClass('d-none');

						});

						$('#views_container > #' + view_id).removeClass('d-none');

						INDEX.router.emit_route_change({ fragment, view, params });

					}

				}

			},

			check(view, params) {
				// In the future we may want to check permissions
				return true;
			},

			clear() {

				$('#views_container > div').each(function () {

					$(this).remove();

				});

			},

			emit_route_change({ fragment, view, params }) {

				ZOMBI.radio.emit(
					"ZOMBI_SERVER_ROUTE_CHANGED",
					{
						fragment,
						view,
						params
					}
				);

			}

		},

		wipe_local_data() {

			ZOMBI.token(null);
			ZOMBI.fullname(null);
			ZOMBI.timezone(null);
			//ZOMBI.language(null); // We keep lang so the user get the login page on his language

		},

		logoff(server = true) {

			INDEX.router.clear();

			INDEX.close_modal();

			if (server) {

				ZOMBI.server(
					["system/login", "logoff"],
					() => {
						$("#index_navbar_username").text("");
						$("#index_login_modal").modal();
						INDEX.wipe_local_data();
						ZOMBI.ws.close();
					}
				);

			} else {

				INDEX.wipe_local_data();

				$("#index_navbar_username").text("");

				$("#index_login_modal").modal();

				INDEX.overlay.hide();

			}

		},

		spinner: {
			show() { $("#index_navbar_spinner").removeClass("d-none"); },
			hide() { $("#index_navbar_spinner").addClass("d-none"); }
		},

		overlay: {
			hide() { $('#overlay').fadeOut(); },
			show() { $('#overlay').fadeIn(); }
		},

		load_modal(modal) {

			$('#index_popup_modal_content').load("modals/" + modal + ".html", (response, status, xhr) => {

				if (status == "error") { INDEX.flash(INDEX.i18n.label("ERROR_LOADING_MODAL_WINDOW")); }

				else { $('#index_popup_modal').modal(); }

			});

		},

		close_modal() { $('#index_popup_modal').modal("hide"); },

		select(node, source, filter, empty, selected) {

			const empty_data = (empty && Array.isArray(empty) && empty.length === 2) ? empty : null;

			const [mod, fun] = source.split(":");

			const element = document.getElementById(node);

			element.innerHTML = "";

			ZOMBI.server(
				[mod, fun, filter],

				response => {

					if (response.error) { INDEX.flash(response.message); }

					else {

						const elements = response.data

						if (empty_data !== null) {

							const option = document.createElement('option');

							option.value = empty_data[0];
							option.text = empty_data[1];

							element.add(option);

						}

						for (const s of elements) {

							const option = document.createElement('option');

							option.value = s[0];
							option.text = s[1];

							if (s[0] == selected) { option.selected = true; }

							element.add(option);

						}

					}

				}

			);

		},

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

$(() => {

	ZOMBI.radio.turnon("ZOMBI_SERVER_CALL_START", () => { INDEX.spinner.show(); }, "SPINNER_LISTENER_INDEX");

	ZOMBI.radio.turnon("ZOMBI_SERVER_CALL_FINISH", () => { INDEX.spinner.hide(); }, "SPINNER_LISTENER_INDEX");

	ZOMBI.radio.turnon("ZOMBI_SERVER_SESSION_EXPIRED", () => { INDEX.logoff(false); }, "LOGOUT_LISTENER_INDEX");

	ZOMBI.radio.turnon(
		"ZOMBI_SERVER_SOCKET_RECEIVE",
		(music) => {
			if (music.context && music.context === "SESSIONS_SEND_MESSAGE") {
				INDEX.flash(music.data, "success");
			}
		},
		"FLASH_MESSAGE_INDEX"
	);

	ZOMBI.radio.turnon(
		"ZOMBI_SERVER_SOCKET_RECEIVE",
		(music) => {
			if (music.context && music.context === "ZOMBI_SERVER_SESSION_EXPIRED") {
				INDEX.logoff(false);
			}
		},
		"SESSION_EXPIRE_LISTENER"
	);

	ZOMBI.radio.turnon(
		"ZOMBI_SERVER_SOCKET_CONNECTED",
		() => {
			$("#index_navbar_connection_icon").removeClass();
			$("#index_navbar_connection_icon").addClass("fas fa-link white");
		},
		"SOCKET_CONNECT_LISTENER_INDEX"
	);

	ZOMBI.radio.turnon(
		"ZOMBI_SERVER_SOCKET_DISCONNECTED",
		() => {
			$("#index_navbar_connection_icon").removeClass();
			$("#index_navbar_connection_icon").addClass("fas fa-unlink red");
		},
		"SOCKET_CONNECT_LISTENER_INDEX"
	);

	// const index_login_18n_languages = [
	//     ["es", "Español"],
	//     ["pt", "Português"],
	//     ["en", "English"],
	//     ["fr", "Français"],
	//     ["de", "Deutsch"],
	//     ["it", "Italiano"],
	//     ["ko", "한국어"],
	//     ["ja", "日本語"],
	//     ["he", "עברית"],
	//     ["ru", "Русский"],
	//     ["zh", "中文"]
	// ];

	const index_login_18n_labels = {

		es: {

			TITLE: "Ingrese a su cuenta",
			LOGIN: "Ingresar",
			FORGOT: "Olvidó la contraseña",
			ERROR: "Hubo un error contactando el servidor",
			RESTART: "No se puede iniciar la aplicacion",
			LANGUAGE: "Lenguaje",
			USERNAME: "Usuario",
			PASSWORD: "Contraseña",
			NOLOGIN: "Nombre de usuario o clave incorrectos"

		},

		en: {

			TITLE: "Enter you account",
			LOGIN: "Login",
			FORGOT: "Forgot your password?",
			ERROR: "Server error",
			RESTART: "Unable to start the application",
			LANGUAGE: "Language",
			USERNAME: "Username",
			PASSWORD: "Password",
			NOLOGIN: "Incorrect username or password"

		},

		pt: {

			TITLE: "Entre você conta ",
			LOGIN: "Login",
			FORGOT: "Esqueceu sua senha? ",
			ERROR: "Erro de servidor ",
			RESTART: "Não é possível iniciar o aplicativo",
			LANGUAGE: "Língua",
			USERNAME: "Nome de usuário",
			PASSWORD: "Senha",
			NOLOGIN: "Usuário ou senha incorretos"

		},

		fr: {

			TITLE: "Entrez votre compte",
			LOGIN: "Connexion",
			FORGOT: "Vous avez oublié votre mot de passe? ",
			ERROR: "Erreur de serveur ",
			RESTART: "Impossible de démarrer l'application",
			LANGUAGE: "La langue",
			USERNAME: "Nom d'utilisateur",
			PASSWORD: "Mot de passe",
			NOLOGIN: "Identifiant ou mot de passe incorrect"
		},

		de: {

			TITLE: "Geben Sie ihr Konto ",
			LOGIN: "Login",
			FORGOT: "Passwort vergessen? ",
			ERROR: "Server -Fehler",
			RESTART: "Die Anwendung kann nicht gestartet werden",
			LANGUAGE: "Sprache",
			USERNAME: "Benutzername",
			PASSWORD: "Passwort",
			NOLOGIN: "Falscher Benutzername oder Passwort"

		},

		it: {

			TITLE: "ENTER tuo account ",
			LOGIN: "Login ",
			FORGOT: "Hai dimenticato la password ?",
			ERROR: "Errore del server ",
			RESTART: "Impossibile avviare l'applicazione",
			LANGUAGE: "Lingua",
			USERNAME: "Nome utente",
			PASSWORD: "Parola d'ordine",
			NOLOGIN: "Nome utente o password errati"

		},

		he: {

			TITLE: " זן לך חשבון ",
			LOGIN: " כניסה ",
			FORGOT: " שכח את הסיסמה שלך ? ",
			ERROR: " שגיאת שרת ",
			RESTART: "לא ניתן להפעיל את היישום",
			LANGUAGE: "שפה",
			USERNAME: "שם משתמש",
			PASSWORD: "סיסמה",
			NOLOGIN: "שם משתמש או סיסמא שגוי"

		},

		ru: {

			TITLE: " Введите свой аккаунт ",
			LOGIN: " Логин ",
			FORGOT: " Забыли пароль ? ",
			ERROR: " Ошибка сервера ",
			RESTART: "Невозможно запустить приложение",
			LANGUAGE: "Язык",
			USERNAME: "Имя пользователя",
			PASSWORD: "пароль",
			NOLOGIN: "Неверное имя пользователя или пароль"

		},

		ko: {

			TITLE: "당신이 계정을 입력합니다 ",
			LOGIN: "로그인 ",
			FORGOT: "비밀번호를 잊어 버렸습니까? ",
			ERROR: "서버 오류",
			RESTART: "애플리케이션을 시작할 수 없습니다.",
			LANGUAGE: "언어",
			USERNAME: "사용자 이름",
			PASSWORD: "암호",
			NOLOGIN: "잘못된 사용자 이름 또는 비밀번호"

		},

		ja: {

			TITLE: "「あなたがアカウント入力」",
			LOGIN: "「ログイン」",
			FORGOT: "「パスワードを忘れましたか？",
			ERROR: "「サーバーエラー」",
			RESTART: "アプリケーションを起動できません",
			LANGUAGE: "言語",
			USERNAME: "ユーザー名",
			PASSWORD: "パスワード",
			NOLOGIN: "ユーザーネームまたはパスワードが違います"

		},

		zh: {

			TITLE: "你输入帐号",
			LOGIN: "登录",
			FORGOT: "忘记密码？",
			ERROR: "服务器错误",
			RESTART: "アプリケーションを起動できません",
			LANGUAGE: "语言",
			USERNAME: "用户名",
			PASSWORD: "密码",
			NOLOGIN: "用户名或密码错误"

		}

	};

	function zombi_login_set_lang(lang) {

		$("#index_login_i18n_title").html(index_login_18n_labels[lang]["TITLE"]);
		$("#index_login_i18n_login").html(index_login_18n_labels[lang]["LOGIN"]);

		$("#index_login_username").attr('placeholder', index_login_18n_labels[lang]["USERNAME"]);
		$("#index_login_password").attr('placeholder', index_login_18n_labels[lang]["PASSWORD"]);

		ZOMBI.language(lang);

	};

	$("#index_login_password").on("keyup", (event) => {

		if (event.which === 13) { $("#index_login_button").trigger("click"); }

	});

	$.validator.setDefaults({
		debug: false,
		errorElement: 'span',
		errorPlacement(error, element) {
			error.addClass('invalid-feedback');
			element.closest('.form-group').append(error);
		},
		highlight(element, errorClass, validClass) {
			$(element).addClass('is-invalid');
		},
		unhighlight(element, errorClass, validClass) {
			$(element).removeClass('is-invalid');
		}
	});

	$("#index_about_button").on("click", (event) => {

		event.preventDefault();

		INDEX.load_modal("about");

	});

	$("#index_profile_button").on("click", (event) => {

		event.preventDefault();

		INDEX.load_modal("profile");

	});

	$('#index_hamburguer').on('click', function () {
		$('#sidebar, #content').toggleClass('active');
		$('.collapse.in').toggleClass('in');
		$('a[aria-expanded=true]').attr('aria-expanded', 'false');
	});

	window.addEventListener("hashchange", INDEX.router.navigate);

	$("#index_logoff_button").on("click", (event) => {

		event.preventDefault();

		INDEX.close_modal();

		INDEX.logoff();

	});

	if (!ZOMBI.language()) {

		ZOMBI.language(ZOMBI.config("DEFAULT_LANGUAGE"));

		console.log("INDEX: Using default lang: " + ZOMBI.config("DEFAULT_LANGUAGE"));

	};

	zombi_login_set_lang(ZOMBI.language());

	$("#index_login_language").val(ZOMBI.language());

	$("#index_login_language").on("change", function (event) {

		event.preventDefault();

		$("#index_login_message").addClass("d-none");

		zombi_login_set_lang($(this).val());

	});

	const index_start = () => {

		ZOMBI.server(

			["system/login", "start"],

			response => {

				if (response.error) {

					$("#index_login_modal").modal();
					INDEX.flash(index_login_18n_labels[ZOMBI.language()]["RESTART"]);
					INDEX.overlay.hide();

				} else {

					$("#index_navbar_username").text(ZOMBI.fullname());

					INDEX.i18n.init(response.data.i18n, true);

					INDEX.router.navigate();

					INDEX.overlay.hide();

					ZOMBI.ws.connect(false);

				}

			}

		);

	};

	if (!ZOMBI.token()) { // aka not logged in

		$("#index_login_modal").modal();

		INDEX.close_modal();

		INDEX.overlay.hide();

	} else {

		index_start();

	}

	$("#index_login_button").on("click", (event) => {

		event.preventDefault();

		const password = $("#index_login_password").val();
		const username = $("#index_login_username").val();
		const language = $("#index_login_language").val();

		ZOMBI.server(

			["system/login", "login", [username, password, language]],

			response => {

				if (response.error) {

					if (response.code === 1004) {

						$("#index_login_message").text(index_login_18n_labels[language]["NOLOGIN"]);

					} else {

						INDEX.flash(index_login_18n_labels[ZOMBI.language()]["RESTART"]);

					}

					$("#index_login_message").removeClass("d-none");

				} else {

					ZOMBI.token(response.data.token);

					if (response.data.fullname) {

						$("#index_navbar_username").text(response.data.fullname);

						ZOMBI.fullname(response.data.fullname);

					}

					if (response.data.timezone) {

						ZOMBI.timezone(response.data.timezone);

					} else {

						ZOMBI.timezone(ZOMBI.config("DEFAULT_TIMEZONE"));

					}

					INDEX.i18n.init(response.data.i18n, true);

					INDEX.router.navigate();

					$('#index_login_modal').modal('hide');
					$("#index_login_message").addClass("d-none");

					ZOMBI.ws.connect(false);

				}

			}

		);

	});


	$("#sidebar .components li a").not(".dropdown-toggle").on("click", event => {
		// https://tylergaw.com/articles/reacting-to-media-queries-in-javascript/
		let mql = window.matchMedia('(max-width: 768px)');

		if (mql.matches) {

			$("#sidebar").toggleClass("active");

		}

	});

	$("#views_container").on("click", event => {

		let mql = window.matchMedia('(max-width: 768px)');

		if (mql.matches) {

			$("#sidebar").removeClass("active");

		}

	});

	// To close the menu by swipping left
	$("#sidebar .components").touchwipe({
		wipeLeft: function () { $("#sidebar").removeClass("active"); },
		// wipeRight: function () { alert("right"); },
		// wipeUp: function () { alert("up"); },
		// wipeDown: function () { alert("down"); },
		min_move_x: 20,
		min_move_y: 20,
		preventDefaultEvents: false
	});

});

export default INDEX;