const dom = function (s) {
    if (typeof s === "string") {
        this.value = Array.prototype.slice.call(document.querySelectorAll(s));
    }
    if (typeof s === "object") {
        this.value = [s];
    }
};

dom.prototype = {
    id: function() {
        return this.value[0].id;
    },
    data: function(key, value) {
        if((typeof value == 'undefined')) return this.value[0].dataset[key];
        else {
            this.value[0].dataset[key] = value;
        }
    },
    visible: function() {
        const style = window.getComputedStyle(this.value[0]);
        return !(style.display === 'none')
    },
    element: function(index = 0) {
        return this.value[index]
    },
    elements: function() {
        return this.value
    },
    click: function() {
        this.value[0].click();
    },
    val: function(v) {
        if((typeof v == 'undefined')) return this.value[0].value;
        else {
            if (this.value[0]) { return this.value[0].value = v; }
            else { console.error(`Element not found!`); }
        }
    },
    eq: function (n) {
        this.value = [this.value[n]];
        return this;
    },
    each: function (fn) {
        [].forEach.call(this.value, fn);
        return this;
    },
    css: function (v) {
        return this.each(function (i) {
            i.style.cssText = i.style.cssText + v;
        });
    },
    cssdom: function (v) {
        return this.each(function (i) {
            for (var key in v) {
                i.style[key] = v[key];
            }
        });
    },
    attr: function (a, v) {
        return this.each(function (i) {
            i.setAttribute(a, v);
        });
    },
    getAttr: function (v) {
        return this.value[0].getAttribute(v);
    },
    removeAttr: function (v) {
        return this.each(function (i) {
            i.removeAttribute(v);
        });
    },
    animate: function (time, scale, rotate, rotateX, rotateY, translateX, translateY, skewX, skewY, opacity) {
        return this.each(function (i) {
            i.style.cssText = i.style.cssText + 'transition: all ' + time + 's ease-in-out; transform: scale(' + scale + ') rotate(' + rotate + 'deg) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translate(' + translateX + 'px, ' + translateY + 'px) skew(' + skewX + 'deg, ' + skewY + 'deg); opacity:' + opacity + ';'
        });
    },
    on: function (type, fn) {
        return this.each(function (i) {
            i.addEventListener(type, fn, false);
        });
    },
    hasClass: function (v) {
        var a = v.split(' ');
        let has = false;
        this.each(function (i) {
            for (var x = 0; x < a.length; x++) {
                if (i.classList.contains(a[x])) { has = true; } 
            }
        });
        return has;
    },
    addClass: function (v) {
        var a = v.split(' ');
        return this.each(function (i) {
            for (var x = 0; x < a.length; x++) {
                if (i.classList) {
                  i.classList.add(a[x]);
                }
                else {
                  i.className += ' ' + a[x];
                }
            }
        });
    },
    toggleClass: function (v) {
        var a = v.split(' ');
        return this.each(function (i) {
            for (var x = 0; x < a.length; x++) {
                if (i.classList) {
                    i.classList.toggle(a[x]);
                }
                else {
                    if (new RegExp('\\b'+ a[x] +'\\b').test(i.className)) {
                        i.className = i.className.replace(new RegExp('\\b'+ a[x] +'\\b', 'g'), '');
                    } else {
                        i.className += ' ' + a[x];
                    }
                }
            }
        });
    },
    removeClass: function (v) {
        var a = v.split(' ');
        return this.each(function (i) {
            for (var x = 0; x < a.length; x++) {
                if (i.classList) {
                    i.classList.remove(a[x]);
                }
                else {
                    i.className = i.className.replace(new RegExp('\\b'+ a[x] +'\\b', 'g'), '');
                }
            }
        });
    },
    html: function (v) {
        return (typeof v == 'undefined') ? this.value[0].innerHTML : this.each(function(i) {
            i.innerHTML = v;
        });
    },
    text: function (v) {
        return (typeof v == 'undefined') ? this.value[0].innerText || this.value[0].textContent : this.each(function(i) {
            i.innerText = v;
            i.textContent = v;
        });
    },
    insertBefore: function (v) {
        return this.each(function (i) {
            i.insertAdjacentHTML("beforeBegin", v);
        });
    },
    insertAfter: function (v) {
        return this.each(function (i) {
            i.insertAdjacentHTML("afterEnd", v);
        });
    },
    insertFirst: function (v) {
        return this.each(function (i) {
            i.insertAdjacentHTML("afterBegin", v);
        });
    },
    insertLast: function (v) {
        return this.each(function (i) {
            i.insertAdjacentHTML("beforeEnd", v);
        });
    },
    empty: function () {
        return this.each(function (i) {
            i.innerHTML = "";
        });
    },
    parent: function () {
        return $(this.value[0].parentNode);
    },
    siblings: function () {
        this.value = Array.prototype.filter.call(this.value[0].parentNode.children, (child) =>
          child !== this.value[0]);
        return this;
    },
    children: function (v) {
        if((typeof v == 'undefined')) {
            this.value = Array.prototype.filter.call(this.value[0].children, (child) =>
            child !== this.value[0]);
          return this;
        } else {
            this.value = this.value[0].querySelectorAll(v);
            return this;
        }

    },
    offset: function () {
        return this.each(function (i) {
            offset = i.getBoundingClientRect();
        });
    },
    log: function () {
        console.log(this);
        return this;
    },
};

const factory = function (selector) { return new dom(selector); };

export default factory;

