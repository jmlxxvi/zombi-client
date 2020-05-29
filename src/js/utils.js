import $ from "./dom";

// Data escape
export function escapeUTF16(str) {
    var escaped = ''
    for (var i = 0; i < str.length; ++i) {
        var hex = str.charCodeAt(i).toString(16).toUpperCase();
        escaped += "\\u" + "0000".substr(hex.length) + hex;
    }
    return escaped;
}

export function unescapeUTF16(str) {
    var utf16_codes = convertEscapedUtf16CodesToUtf16Codes(str);
    return convertUtf16CodesToString(utf16_codes);
}

function convertEscapedUtf16CodesToUtf16Codes(str) {
    return convertEscapedCodesToCodes(str, "\\u", 16, 16);
}
function convertEscapedCodesToCodes(str, prefix, base, num_bits) {
    var parts = str.split(prefix);
    parts.shift();  // Trim the first element.
    var codes = [];
    var max = Math.pow(2, num_bits);
    for (var i = 0; i < parts.length; ++i) {
        var code = parseInt(parts[i], base);
        if (code >= 0 && code < max) {
            codes.push(code);
        } else {
            // Malformed code ignored.
        }
    }
    return codes;
}

function convertUtf16CodesToString(utf16_codes) {
    var unescaped = '';
    for (var i = 0; i < utf16_codes.length; ++i) {
        unescaped += String.fromCharCode(utf16_codes[i]);
    }
    return unescaped;
}


// Transitions
const _hide = (el) => {
    el.style.display = 'none'
}

const _show = (el) => {

    if (el.classList.contains("hidden")) {
        el.classList.remove("hidden");
    }
    else if (el.style.length === 1 && el.style.display === 'none') {
        el.removeAttribute('style')
    } else {
        el.style.removeProperty('display')
    }
}


export function enter(el, enter, enterStart, enterEnd) {
    const enter_classes = enter.split(' ').filter(i => i !== '')
    const enterStart_classes = enterStart.split(' ').filter(i => i !== '')
    const enterEnd_classes = enterEnd.split(' ').filter(i => i !== '')
    transitionClasses(el, enter_classes, enterStart_classes, enterEnd_classes, _show, () => { })
}

export function leave(el, leave, leaveStart, leaveEnd) {
    const leave_classes = leave.split(' ').filter(i => i !== '')
    const leaveStart_classes = leaveStart.split(' ').filter(i => i !== '')
    const leaveEnd_classes = leaveEnd.split(' ').filter(i => i !== '')
    transitionClasses(el, leave_classes, leaveStart_classes, leaveEnd_classes, () => { }, _hide)
}

function transitionClasses(el, classesDuring, classesStart, classesEnd, hook1, hook2) {
    const originalClasses = [];

    const stages = {
        start() {
            el.classList.add(...classesStart)
        },
        during() {
            el.classList.add(...classesDuring)
        },
        show() {
            hook1(el)
        },
        end() {
            // Don't remove classes that were in the original class attribute.
            el.classList.remove(...classesStart.filter(i => !originalClasses.includes(i)))
            el.classList.add(...classesEnd)
        },
        hide() {
            hook2(el)
        },
        cleanup() {
            el.classList.remove(...classesDuring.filter(i => !originalClasses.includes(i)))
            el.classList.remove(...classesEnd.filter(i => !originalClasses.includes(i)))
        },
    }

    transition(el, stages)
}

function transition(el, stages) {
    stages.start(el)
    stages.during(el)

    requestAnimationFrame(() => {
        // Note: Safari's transitionDuration property will list out comma separated transition durations
        // for every single transition property. Let's grab the first one and call it a day.
        let duration = Number(getComputedStyle(el).transitionDuration.replace(/,.*/, '').replace('s', '')) * 1000

        if (duration === 0) {
            duration = Number(getComputedStyle(el).animationDuration.replace('s', '')) * 1000
        }

        stages.show(el)

        requestAnimationFrame(() => {
            stages.end(el)

            setTimeout(() => {
                stages.hide(el)

                // Adding an "isConnected" check, in case the callback
                // removed the element from the DOM.
                if (el.isConnected) {
                    stages.cleanup(el)
                }
            }, duration);
        })
    });
}

export function toggle(id) {

    if ($(id).visible()) {
        leave(
            $(id).element(),
            "transition ease-out duration-200",
            "transform opacity-100 scale-100",
            "transform opacity-0 scale-75"
        );
    } else {
        enter(
            $(id).element(),
            "transition ease-in duration-200",
            "transform opacity-0 scale-75",
            "transform opacity-100 scale-100"
        );
    }
}

export function hide(id) {

    const elements = $(id).elements();

    elements.forEach(element => {

        leave(
            element,
            "transition ease-out duration-200",
            "transform opacity-100 scale-100",
            "transform opacity-0 scale-75"
        );

    });

}


export function show(id) {

    const elements = $(id).elements();

    elements.forEach(element => {

        enter(
            element,
            "transition ease-in duration-200",
            "transform opacity-0 scale-75",
            "transform opacity-100 scale-100"
        );

    });

}

