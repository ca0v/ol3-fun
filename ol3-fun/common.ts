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

export function cssin(name: string, css: string) {
    let id = `style-${name}`;
    let styleTag = <HTMLStyleElement>document.getElementById(id);
    if (!styleTag) {
        styleTag = document.createElement("style");
        styleTag.id = id;
        styleTag.innerText = css;
        document.head.appendChild(styleTag);
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
            if (!immediate) func.apply(this, args);
        };
        let callNow = immediate && !timeout;

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.call(this, args);
    });
}

/**
 * poor $(html) substitute due to being 
 * unable to create <td>, <tr> elements
 */
export function html(html: string) {
    let d = document;
    let a = d.createElement("div");
    let b = d.createDocumentFragment();
    a.innerHTML = html;
    while (a.firstChild) b.appendChild(a.firstChild);
    return <HTMLElement>b.firstElementChild;
}

export function pair<A, B>(a1: A[], a2: B[]) {
    let result: Array<[A, B]> = [];
    a1.forEach(v1 => a2.forEach(v2 => result.push([v1, v2])));
    return result;
}

export function range(n: number) {
    var result = new Array(n);
    for (var i = 0; i < n; i++) result[i] = i;
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