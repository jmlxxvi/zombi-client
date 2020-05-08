import "./css/styles.css";

import config from "./js/config";
import ZOMBI from "./js/zombi";
import app from "./js/app";
import $ from "./js/dom";

// const languages = [
//     { code: "es", name: "Español" },
//     { code: "pt", name: "Português" },
//     { code: "en", name: "English" },
//     { code: "fr", name: "Français" },
//     { code: "de", name: "Deutsch" },
//     { code: "it", name: "Italiano" },
//     { code: "ko", name: "한국어" },
//     { code: "ja", name: "日本語" },
//     { code: "he", name: "עברית" },
//     { code: "ru", name: "Русский" },
//     { code: "zh", name: "中文" }
// ];

const i18n_labels = {
    es: { LOGIN: "Ingresar", USERNAME: "Usuario", PASSWORD: "Contraseña", NOLOGIN: "Nombre de usuario o clave incorrectos" },
    en: { LOGIN: "Login", USERNAME: "Username", PASSWORD: "Password", NOLOGIN: "Incorrect username or password" },
    pt: { LOGIN: "Login", USERNAME: "Nome de usuário", PASSWORD: "Senha", NOLOGIN: "Usuário ou senha incorretos" },
    fr: { LOGIN: "Connexion", USERNAME: "Nom d'utilisateur", PASSWORD: "Mot de passe", NOLOGIN: "Identifiant ou mot de passe incorrect" },
    de: { LOGIN: "Login", USERNAME: "Benutzername", PASSWORD: "Passwort", NOLOGIN: "Falscher Benutzername oder Passwort" },
    it: { LOGIN: "Login ", USERNAME: "Nome utente", PASSWORD: "Parola d'ordine", NOLOGIN: "Nome utente o password errati" },
    he: { LOGIN: " כניסה ", USERNAME: "שם משתמש", PASSWORD: "סיסמה", NOLOGIN: "שם משתמש או סיסמא שגוי" },
    ru: { LOGIN: " Логин ", USERNAME: "Имя пользователя", PASSWORD: "пароль", NOLOGIN: "Неверное имя пользователя или пароль" },
    ko: { LOGIN: "로그인 ", USERNAME: "사용자 이름", PASSWORD: "암호", NOLOGIN: "잘못된 사용자 이름 또는 비밀번호" },
    ja: { LOGIN: "「ログイン」", USERNAME: "ユーザー名", PASSWORD: "パスワード", NOLOGIN: "ユーザーネームまたはパスワードが違います" },
    zh: { LOGIN: "登录", USERNAME: "用户名", PASSWORD: "密码", NOLOGIN: "用户名或密码错误" }
};

let selected_language = config.DEFAULT_LANGUAGE;

$(".lang_select_link").each(item => {

    $(item).addClass("text-gray-500");

});

$(".lang_select_link").on("click", function (event) {
    event.preventDefault();
    const lang = this.dataset.lang;
    set_lang(lang);
});

const set_lang = lang => {
    selected_language = lang;

    $("#username").attr('placeholder', i18n_labels[lang]["USERNAME"]);
    $("#password").attr('placeholder', i18n_labels[lang]["PASSWORD"]);
    $("#login_button_text").html(i18n_labels[lang]["LOGIN"]);

    $(".lang_select_link").each(item => {
        $(item).removeClass("text-blue-600");
        $(item).addClass("text-gray-500");

        if(lang === item.dataset.lang) {
            $(item).addClass("text-blue-600");
        }
    });
};

set_lang(selected_language);

$("#login_button").on("click", () => {

    // ZOMBI.server(
    //     ["system/login", "login", ["system", "thelord", "es"]],
    //     response => {
    //         console.log(response);
    //     }
    // );

    app.flash({ message: "wwevwefwee", title: "WTF!?" });

    // $("#flash_message").removeClass("opacity-0");
    // // $("#flash_message").addClass("opacity-100");

    // $("#flash_message > .font-bold").addClass("text-blue-900");

});

$(".flash_close").on("click", () => {

    $("#flash_message").addClass("opacity-0");

});

