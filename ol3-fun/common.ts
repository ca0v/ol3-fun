/**
 * Generate a UUID
 * @returns UUID
 *
 * Adapted from http://stackoverflow.com/a/2117523/526860
 */
export function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export function asArray<T extends HTMLInputElement>(list: NodeList) {
    let result = <Array<T>>new Array(list.length);
    for (let i = 0; i < list.length; i++) {
        result[i] = <T>list[i];
    }
    return result;
}

/***
 * ie11 compatible version of e.classList.toggle
 * if class exists then remove it and return false, if not, then add it and return true.
 * @param force true to add specified class value, false to remove it.
 * @returns true if className exists.
 */
export function toggle(e: HTMLElement, className: string, force? : boolean) {
    let exists = e.classList.contains(className);
    if (exists && force !== true) {
        e.classList.remove(className);
        return false;
    };
    if (!exists && force !== false) {
        e.classList.add(className);
        return true;
    }
    return exists;
}

export function parse<T>(v: string, type: T): T {
    if (typeof type === "string") return <any>v;
    if (typeof type === "number") return <any>parseFloat(v);
    if (typeof type === "boolean") return <any>(v === "1" || v === "true");
    if (Array.isArray(type)) {
        return <any>(v.split(",").map(v => parse(v, (<any>type)[0])));
    }
    throw `unknown type: ${type}`;
}

export function getQueryParameters(options: any, url = window.location.href) {
    let opts = <any>options;
    Object.keys(opts).forEach(k => {
        doif(getParameterByName(k, url), v => {
            let value = parse(v, opts[k]);
            if (value !== undefined) opts[k] = value;
        });
    });
}

export function getParameterByName(name: string, url = window.location.href) {
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

export function doif<T>(v: T, cb: (v: T) => void) {
    if (v !== undefined && v !== null) cb(v);
}

export function mixin<A extends any, B extends any>(a: A, b: B) {
    Object.keys(b).forEach(k => a[k] = b[k]);
    return <A & B>a;
}

export function defaults<A extends any, B extends any>(a: A, ...b: B[]): A & B {
    b.forEach(b => {
        Object.keys(b).filter(k => a[k] === undefined).forEach(k => a[k] = b[k]);
    });
    return <A & B>a;
}

/**
 * Adds exactly one instance of the CSS to the app with a mechanism
 * for disposing by invoking the destructor returned by this method.
 * Note the css will not be removed until the dependency count reaches
 * 0 meaning the number of calls to cssin('id') must match the number
 * of times the destructor is invoked.
 * let d1 = cssin('foo', '.foo { background: white }');
 * let d2 = cssin('foo', '.foo { background: white }');
 * d1(); // reduce dependency count
 * d2(); // really remove the css
 * @param name unique id for this style tag
 * @param css css content
 * @returns destructor
 */
export function cssin(name: string, css: string) {
    let id = `style-${name}`;
    let styleTag = <HTMLStyleElement>document.getElementById(id);
    if (!styleTag) {
        styleTag = document.createElement("style");
        styleTag.id = id;
        styleTag.type = "text/css";
        document.head.appendChild(styleTag);
        styleTag.appendChild(document.createTextNode(css));
    }

    let dataset = styleTag.dataset;
    dataset["count"] = parseInt(dataset["count"] || "0") + 1 + "";

    return () => {
        dataset["count"] = parseInt(dataset["count"] || "0") - 1 + "";
        if (dataset["count"] === "0") {
            styleTag.remove();
        }
    };
}

export function debounce<T extends Function>(func: T, wait = 50, immediate = false): T {
    let timeout: number;
    return <T><any>((...args: any[]) => {
        let later = () => {
            timeout = null;
            if (!immediate) func.apply({}, args);
        };
        let callNow = immediate && !timeout;

        clearTimeout(timeout);
        timeout = window.setTimeout(later, wait);
        if (callNow) func.apply({}, args);
    });
}

/**
 * poor $(html) substitute due to being 
 * unable to create <td>, <tr> elements
 */
export function html(html: string) {
    let a = document.createElement("div");
    a.innerHTML = html;
    return <HTMLElement>(a.firstElementChild || a.firstChild);
}

export function pair<A, B>(a1: A[], a2: B[]) {
    let result: Array<[A, B]> = new Array(a1.length * a2.length);
    let i = 0;
    a1.forEach(v1 => a2.forEach(v2 => result[i++] = [v1, v2]));
    return result;
}

export function range(n: number) {
    var result = new Array(n) as number[];
    for (let i = 0; i < n; i++) result[i] = i;
    return result;
}

// http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
export function shuffle<T>(array: T[]) {
    let currentIndex = array.length;
    let temporaryValue: T;
    let randomIndex: number;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}