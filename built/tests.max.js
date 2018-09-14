define("ol3-fun/slowloop", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function slowloop(functions, interval = 1000, cycles = 1) {
        let d = $.Deferred();
        let index = 0;
        let cycle = 0;
        if (!functions || 0 >= cycles) {
            d.resolve();
            return d;
        }
        let h = setInterval(() => {
            if (index === functions.length) {
                index = 0;
                if (++cycle === cycles) {
                    d.resolve();
                    clearInterval(h);
                    return;
                }
            }
            try {
                d.notify({ index, cycle });
                functions[index++]();
            }
            catch (ex) {
                clearInterval(h);
                d.reject(ex);
            }
        }, interval);
        return d;
    }
    exports.slowloop = slowloop;
});
define("tests/base", ["require", "exports", "ol3-fun/slowloop"], function (require, exports, slowloop_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.slowloop = slowloop_1.slowloop;
    function describe(title, fn) {
        console.log(title || "undocumented test group");
        return window.describe(title, fn);
    }
    exports.describe = describe;
    function it(title, fn) {
        console.log(title || "undocumented test");
        return window.it(title, fn);
    }
    exports.it = it;
    function should(result, message) {
        console.log(message || "undocumented assertion");
        if (!result)
            throw message;
    }
    exports.should = should;
    function shouldEqual(a, b, message) {
        if (a != b) {
            let msg = `"${a}" <> "${b}"`;
            message = (message ? message + ": " : "") + msg;
            console.warn(msg);
        }
        should(a == b, message);
    }
    exports.shouldEqual = shouldEqual;
    function shouldThrow(fn, message) {
        try {
            fn();
        }
        catch (ex) {
            should(!!ex, ex);
            return;
        }
        should(false, `expected an exception${message ? ": " + message : ""}`);
    }
    exports.shouldThrow = shouldThrow;
    function stringify(o) {
        return JSON.stringify(o, null, "\t");
    }
    exports.stringify = stringify;
});
define("ol3-fun/common", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function uuid() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
            var r = (Math.random() * 16) | 0, v = c == "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }
    exports.uuid = uuid;
    function asArray(list) {
        let result = new Array(list.length);
        for (let i = 0; i < list.length; i++) {
            result[i] = list[i];
        }
        return result;
    }
    exports.asArray = asArray;
    function toggle(e, className, force) {
        let exists = e.classList.contains(className);
        if (exists && force !== true) {
            e.classList.remove(className);
            return false;
        }
        if (!exists && force !== false) {
            e.classList.add(className);
            return true;
        }
        return exists;
    }
    exports.toggle = toggle;
    function parse(v, type) {
        if (typeof type === "string")
            return v;
        if (typeof type === "number")
            return parseFloat(v);
        if (typeof type === "boolean")
            return (v === "1" || v === "true");
        if (Array.isArray(type)) {
            return v.split(",").map(v => parse(v, type[0]));
        }
        throw `unknown type: ${type}`;
    }
    exports.parse = parse;
    function getQueryParameters(options, url = window.location.href) {
        let opts = options;
        Object.keys(opts).forEach(k => {
            doif(getParameterByName(k, url), v => {
                let value = parse(v, opts[k]);
                if (value !== undefined)
                    opts[k] = value;
            });
        });
    }
    exports.getQueryParameters = getQueryParameters;
    function getParameterByName(name, url = window.location.href) {
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"), results = regex.exec(url);
        if (!results)
            return null;
        if (!results[2])
            return "";
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }
    exports.getParameterByName = getParameterByName;
    function doif(v, cb) {
        if (v !== undefined && v !== null)
            cb(v);
    }
    exports.doif = doif;
    function mixin(a, ...b) {
        b.forEach(b => {
            Object.keys(b).forEach(k => (a[k] = b[k]));
        });
        return a;
    }
    exports.mixin = mixin;
    function defaults(a, ...b) {
        b.forEach(b => {
            Object.keys(b)
                .filter(k => a[k] === undefined)
                .forEach(k => (a[k] = b[k]));
        });
        return a;
    }
    exports.defaults = defaults;
    function cssin(name, css) {
        let id = `style-${name}`;
        let styleTag = document.getElementById(id);
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
    exports.cssin = cssin;
    function debounce(func, wait = 50, immediate = false) {
        let timeout;
        return ((...args) => {
            let later = () => {
                timeout = null;
                if (!immediate)
                    func.apply({}, args);
            };
            let callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = window.setTimeout(later, wait);
            if (callNow)
                func.apply({}, args);
        });
    }
    exports.debounce = debounce;
    function html(html) {
        let a = document.createElement("div");
        a.innerHTML = html;
        return (a.firstElementChild || a.firstChild);
    }
    exports.html = html;
    function pair(a1, a2) {
        let result = new Array(a1.length * a2.length);
        let i = 0;
        a1.forEach(v1 => a2.forEach(v2 => (result[i++] = [v1, v2])));
        return result;
    }
    exports.pair = pair;
    function range(n) {
        var result = new Array(n);
        for (let i = 0; i < n; i++)
            result[i] = i;
        return result;
    }
    exports.range = range;
    function shuffle(array) {
        let currentIndex = array.length;
        let temporaryValue;
        let randomIndex;
        while (0 !== currentIndex) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }
        return array;
    }
    exports.shuffle = shuffle;
});
define("ol3-fun/navigation", ["require", "exports", "openlayers", "jquery", "ol3-fun/common"], function (require, exports, ol, $, common_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function zoomToFeature(map, feature, options) {
        let promise = $.Deferred();
        options = common_1.defaults(options || {}, {
            duration: 1000,
            padding: 256,
            minResolution: 2 * map.getView().getMinResolution()
        });
        let view = map.getView();
        let currentExtent = view.calculateExtent(map.getSize());
        let targetExtent = feature.getGeometry().getExtent();
        let doit = (duration) => {
            view.fit(targetExtent, {
                size: map.getSize(),
                padding: [options.padding, options.padding, options.padding, options.padding],
                minResolution: options.minResolution,
                duration: duration,
                callback: () => promise.resolve()
            });
        };
        if (ol.extent.containsExtent(currentExtent, targetExtent)) {
            doit(options.duration);
        }
        else if (ol.extent.containsExtent(currentExtent, targetExtent)) {
            doit(options.duration);
        }
        else {
            let fullExtent = ol.extent.createEmpty();
            ol.extent.extend(fullExtent, currentExtent);
            ol.extent.extend(fullExtent, targetExtent);
            let dscale = ol.extent.getWidth(fullExtent) / ol.extent.getWidth(currentExtent);
            let duration = 0.5 * options.duration;
            view.fit(fullExtent, {
                size: map.getSize(),
                padding: [options.padding, options.padding, options.padding, options.padding],
                minResolution: options.minResolution,
                duration: duration
            });
            setTimeout(() => doit(0.5 * options.duration), duration);
        }
        return promise;
    }
    exports.zoomToFeature = zoomToFeature;
});
define("ol3-fun/parse-dms", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function decDegFromMatch(m) {
        var signIndex = {
            "-": -1,
            N: 1,
            S: -1,
            E: 1,
            W: -1
        };
        var latLonIndex = {
            "-": "",
            N: "lat",
            S: "lat",
            E: "lon",
            W: "lon"
        };
        var degrees, minutes, seconds, sign, latLon;
        sign = signIndex[m[2]] || signIndex[m[1]] || signIndex[m[6]] || 1;
        degrees = Number(m[3]);
        minutes = m[4] ? Number(m[4]) : 0;
        seconds = m[5] ? Number(m[5]) : 0;
        latLon = latLonIndex[m[1]] || latLonIndex[m[6]];
        if (!inRange(degrees, 0, 180))
            throw "Degrees out of range";
        if (!inRange(minutes, 0, 60))
            throw "Minutes out of range";
        if (!inRange(seconds, 0, 60))
            throw "Seconds out of range";
        return {
            decDeg: sign * (degrees + minutes / 60 + seconds / 3600),
            latLon: latLon
        };
    }
    function inRange(value, a, b) {
        return value >= a && value <= b;
    }
    function toDegreesMinutesAndSeconds(coordinate) {
        let absolute = Math.abs(coordinate);
        let degrees = Math.floor(absolute);
        let minutesNotTruncated = (absolute - degrees) * 60;
        let minutes = Math.floor(minutesNotTruncated);
        let seconds = Math.floor((minutesNotTruncated - minutes) * 60);
        return `${degrees} ${minutes} ${seconds}`;
    }
    function fromLonLatToDms(lon, lat) {
        let latitude = toDegreesMinutesAndSeconds(lat);
        let latitudeCardinal = lat >= 0 ? "N" : "S";
        let longitude = toDegreesMinutesAndSeconds(lon);
        let longitudeCardinal = lon >= 0 ? "E" : "W";
        return `${latitude} ${latitudeCardinal} ${longitude} ${longitudeCardinal}`;
    }
    function fromDmsToLonLat(dmsString) {
        dmsString = dmsString.trim();
        var dmsRe = /([NSEW])?(-)?(\d+(?:\.\d+)?)[°º:d\s]?\s?(?:(\d+(?:\.\d+)?)['’‘′:]\s?(?:(\d{1,2}(?:\.\d+)?)(?:"|″|’’|'')?)?)?\s?([NSEW])?/i;
        var dmsString2;
        let m1 = dmsString.match(dmsRe);
        if (!m1)
            throw "Could not parse string";
        if (m1[1]) {
            m1[6] = undefined;
            dmsString2 = dmsString.substr(m1[0].length - 1).trim();
        }
        else {
            dmsString2 = dmsString.substr(m1[0].length).trim();
        }
        let decDeg1 = decDegFromMatch(m1);
        let m2 = dmsString2.match(dmsRe);
        let decDeg2 = m2 && decDegFromMatch(m2);
        if (typeof decDeg1.latLon === "undefined") {
            if (!isNaN(decDeg1.decDeg) && decDeg2 && isNaN(decDeg2.decDeg)) {
                return decDeg1.decDeg;
            }
            else if (!isNaN(decDeg1.decDeg) && decDeg2 && !isNaN(decDeg2.decDeg)) {
                decDeg1.latLon = "lat";
                decDeg2.latLon = "lon";
            }
            else {
                throw "Could not parse string";
            }
        }
        if (typeof decDeg2.latLon === "undefined") {
            decDeg2.latLon = decDeg1.latLon === "lat" ? "lon" : "lat";
        }
        return {
            [decDeg1.latLon]: decDeg1.decDeg,
            [decDeg2.latLon]: decDeg2.decDeg
        };
    }
    function parse(value) {
        if (typeof value === "string")
            return fromDmsToLonLat(value);
        return fromLonLatToDms(value.lon, value.lat);
    }
    exports.parse = parse;
});
define("ol3-fun/extensions", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Extensions {
        constructor() {
            this.extensions = [];
            this.hash = new WeakMap(null);
        }
        isExtended(o) {
            return 0 <= this.extensions.indexOf(o);
        }
        getExtensionKey(o, force = true) {
            force && !this.isExtended(o) && this.extend(o);
            return this.extensions.indexOf(o);
        }
        extend(o, ext) {
            if (!this.isExtended(o)) {
                this.extensions.push(o);
            }
            let key = this.getExtensionKey(o, true);
            if (!this.hash.has(o))
                this.hash.set(o, {});
            let hashData = this.hash.get(o);
            if (ext) {
                Object.keys(ext).forEach(k => (hashData[k] = ext[k]));
                console.log("hashData", hashData);
            }
            return hashData;
        }
        bind(o1, o2) {
            if (this.isExtended(o1)) {
                if (this.isExtended(o2)) {
                    if (this.getExtensionKey(o1) !== this.getExtensionKey(o2)) {
                        throw "both objects already bound";
                    }
                }
                else {
                    this.hash.set(o2, this.extend(o1));
                }
            }
            else {
                this.hash.set(o1, this.extend(o2));
            }
        }
    }
    exports.Extensions = Extensions;
});
define("ol3-fun/deep-extend", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function extend(a, b, trace = [], history = []) {
        if (!b) {
            b = a;
            a = {};
        }
        let merger = new Merger(trace, history);
        return merger.deepExtend(a, b);
    }
    exports.extend = extend;
    function isUndefined(a) {
        return typeof a === "undefined";
    }
    function isPrimitive(a) {
        switch (typeof a) {
            case "object":
                return null === a;
            case "string":
                return true;
            case "number":
                return true;
            case "undefined":
                return true;
            default:
                throw `unknown type: ${typeof a}`;
        }
    }
    function isArray(val) {
        return Array.isArray(val);
    }
    function isHash(val) {
        return !isPrimitive(val) && !canClone(val) && !isArray(val);
    }
    function canClone(val) {
        if (val instanceof Date)
            return true;
        if (val instanceof RegExp)
            return true;
        return false;
    }
    function clone(val) {
        if (val instanceof Date)
            return new Date(val.getTime());
        if (val instanceof RegExp)
            return new RegExp(val.source);
        throw `unclonable type encounted: ${typeof val}`;
    }
    function cloneArray(val) {
        return val.map(v => (isArray(v) ? cloneArray(v) : canClone(v) ? clone(v) : v));
    }
    function push(history, a) {
        if (isPrimitive(a))
            return;
        if (-1 < history.indexOf(a)) {
            let keys = Object.keys(a);
            if (keys.some(k => !isPrimitive(a[k]))) {
                let values = Object.keys(a)
                    .map(k => a[k])
                    .filter(isPrimitive);
                throw `possible circular reference detected, nested shared objects prohibited: ${keys}=${values}`;
            }
        }
        else
            history.push(a);
    }
    class Merger {
        constructor(trace, history) {
            this.trace = trace;
            this.history = history;
        }
        deepExtend(target, source) {
            let history = this.history;
            if (target === source)
                return target;
            if (!target || (!isHash(target) && !isArray(target))) {
                throw "first argument must be an object";
            }
            if (!source || (!isHash(source) && !isArray(source))) {
                throw "second argument must be an object";
            }
            push(history, target);
            if (typeof source === "function") {
                return target;
            }
            if (isArray(source)) {
                if (!isArray(target)) {
                    throw "attempting to merge an array into a non-array";
                }
                this.merge("id", target, source);
                return target;
            }
            else if (isArray(target)) {
                throw "attempting to merge a non-array into an array";
            }
            Object.keys(source).forEach(k => this.mergeChild(k, target, source[k]));
            return target;
        }
        mergeChild(key, target, sourceValue) {
            let targetValue = target[key];
            if (sourceValue === targetValue)
                return;
            if (isPrimitive(sourceValue)) {
                this.trace.push({
                    key: key,
                    target: target,
                    was: targetValue,
                    value: sourceValue
                });
                target[key] = sourceValue;
                return;
            }
            if (canClone(sourceValue)) {
                sourceValue = clone(sourceValue);
                this.trace.push({
                    key: key,
                    target: target,
                    was: targetValue,
                    value: sourceValue
                });
                target[key] = sourceValue;
                return;
            }
            if (isArray(sourceValue)) {
                if (isArray(targetValue)) {
                    this.deepExtend(targetValue, sourceValue);
                    return;
                }
                sourceValue = cloneArray(sourceValue);
                this.trace.push({
                    key: key,
                    target: target,
                    was: targetValue,
                    value: sourceValue
                });
                target[key] = sourceValue;
                return;
            }
            if (!isHash(sourceValue)) {
                throw `unexpected source type: ${typeof sourceValue}`;
            }
            if (!isHash(targetValue)) {
                let traceIndex = this.trace.length;
                try {
                    sourceValue = this.deepExtend({}, sourceValue);
                }
                finally {
                    this.trace.splice(traceIndex, this.trace.length - traceIndex);
                }
                this.trace.push({
                    key: key,
                    target: target,
                    was: targetValue,
                    value: sourceValue
                });
                target[key] = sourceValue;
                return;
            }
            this.deepExtend(targetValue, sourceValue);
            return;
        }
        merge(key, target, source) {
            if (!isArray(target))
                throw "target must be an array";
            if (!isArray(source))
                throw "input must be an array";
            if (!source.length)
                return target;
            let hash = {};
            target.forEach((item, i) => {
                if (!item[key])
                    return;
                hash[item[key]] = i;
            });
            source.forEach((sourceItem, i) => {
                let sourceKey = sourceItem[key];
                let targetIndex = hash[sourceKey];
                if (isUndefined(sourceKey)) {
                    if (isHash(target[i]) && !!target[i][key]) {
                        throw "cannot replace an identified array item with a non-identified array item";
                    }
                    this.mergeChild(i, target, sourceItem);
                    return;
                }
                if (isUndefined(targetIndex)) {
                    this.mergeChild(target.length, target, sourceItem);
                    return;
                }
                this.mergeChild(targetIndex, target, sourceItem);
                return;
            });
            return target;
        }
    }
});
define("index", ["require", "exports", "ol3-fun/common", "ol3-fun/navigation", "ol3-fun/parse-dms", "ol3-fun/slowloop", "ol3-fun/deep-extend"], function (require, exports, common_2, navigation_1, parse_dms_1, slowloop_2, deep_extend_1) {
    "use strict";
    let index = {
        asArray: common_2.asArray,
        cssin: common_2.cssin,
        debounce: common_2.debounce,
        defaults: common_2.defaults,
        doif: common_2.doif,
        deepExtend: deep_extend_1.extend,
        getParameterByName: common_2.getParameterByName,
        getQueryParameters: common_2.getQueryParameters,
        html: common_2.html,
        mixin: common_2.mixin,
        pair: common_2.pair,
        parse: common_2.parse,
        range: common_2.range,
        shuffle: common_2.shuffle,
        toggle: common_2.toggle,
        uuid: common_2.uuid,
        slowloop: slowloop_2.slowloop,
        dms: {
            parse: parse_dms_1.parse,
            fromDms: (dms) => parse_dms_1.parse(dms),
            fromLonLat: (o) => parse_dms_1.parse(o)
        },
        navigation: {
            zoomToFeature: navigation_1.zoomToFeature
        }
    };
    return index;
});
define("tests/spec/api", ["require", "exports", "tests/base", "index"], function (require, exports, base_1, API) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    base_1.describe("API", () => {
        base_1.it("full api exists", () => {
            base_1.shouldEqual([
                API.asArray,
                API.cssin,
                API.debounce,
                API.defaults,
                API.dms.parse,
                API.doif,
                API.getParameterByName,
                API.getQueryParameters,
                API.html,
                API.mixin,
                API.navigation.zoomToFeature,
                API.pair,
                API.parse,
                API.range,
                API.shuffle,
                API.slowloop,
                API.toggle,
                API.uuid,
            ].every((f) => typeof f === "function"), true, "API functions exist");
        });
    });
});
define("tests/spec/common", ["require", "exports", "tests/base", "ol3-fun/common"], function (require, exports, base_2, common_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function sum(list) {
        return list.reduce((a, b) => a + b, 0);
    }
    describe("asArray tests", () => {
        it("asArray", done => {
            if (!document)
                return;
            document.body.appendChild(document.createElement("div"));
            let list = document.getElementsByTagName("div");
            let result = common_3.asArray(list);
            base_2.should(result.length === list.length, "array size matches list size");
            done();
        });
    });
    describe("uuid tests", () => {
        it("uuid", () => {
            base_2.should(common_3.uuid().length === 36, "uuid has 36 characters");
        });
    });
    describe("pair tests", () => {
        it("empty test", () => {
            base_2.should(0 === common_3.pair([], []).length, "empty result");
            base_2.should(0 === common_3.pair([1], []).length, "empty result");
            base_2.should(0 === common_3.pair([], [1]).length, "empty result");
        });
        it("ensures all combinations", () => {
            let A = [1, 3, 5], B = [7, 11, 13], result = common_3.pair(A, B);
            base_2.should((A.length * sum(B) + B.length * sum(A)) === sum(result.map(v => v[0] + v[1])), "create product from two vectors");
        });
    });
    describe("range tests", () => {
        it("empty test", () => {
            base_2.should(0 === common_3.range(0).length, "empty result");
        });
        it("size tests", () => {
            base_2.should(1 === common_3.range(1).length, "single item");
            base_2.should(10 === common_3.range(10).length, "ten items");
        });
        it("content tests", () => {
            base_2.should(45 === sum(common_3.range(10)), "range '10' contains 0..9");
        });
    });
    describe("shuffle tests", () => {
        it("empty test", () => {
            base_2.should(0 === common_3.shuffle([]).length, "empty result");
        });
        it("size tests", () => {
            base_2.should(1 === common_3.shuffle(common_3.range(1)).length, "single item");
            base_2.should(10 === common_3.shuffle(common_3.range(10)).length, "ten items");
        });
        it("content tests", () => {
            base_2.should(45 === sum(common_3.shuffle(common_3.range(10))), "range '10' contains 0..9");
        });
    });
    describe("toggle tests", () => {
        it("toggle", () => {
            let div = document.createElement("div");
            base_2.should(div.className === "", "div contains no className");
            common_3.toggle(div, "foo");
            base_2.should(div.className === "foo", "toggle adds");
            common_3.toggle(div, "foo");
            base_2.should(div.className === "", "second toggles removes");
            common_3.toggle(div, "foo", true);
            base_2.should(div.className === "foo", "forces foo to exist when it does not exist");
            common_3.toggle(div, "foo", true);
            base_2.should(div.className === "foo", "forces foo to exist when it already exists");
            common_3.toggle(div, "foo", false);
            base_2.should(div.className === "", "forces foo to not exist");
            common_3.toggle(div, "foo", false);
            base_2.should(div.className === "", "forces foo to not exist");
        });
    });
    describe("parse tests", () => {
        it("parse", () => {
            let num = 0;
            let bool = false;
            base_2.should(common_3.parse("", "").toString() === "", "empty string");
            base_2.should(common_3.parse("1", "").toString() === "1", "numeric string");
            base_2.should(common_3.parse("1", num) === 1, "numeric string as number returns number");
            base_2.should(common_3.parse("0", bool) === false, "0 as boolean is false");
            base_2.should(common_3.parse("1", bool) === true, "1 as boolean is true");
            base_2.should(common_3.parse("false", bool) === false, "'false' as boolean is false");
            base_2.should(common_3.parse("true", bool) === true, "'true' as boolean is true");
            base_2.should(common_3.parse("1", num) === 1, "numeric string as number returns number");
            base_2.should(common_3.parse("1", num) === 1, "numeric string as number returns number");
            base_2.should(common_3.parse("1,2,3", [num])[1] === 2, "parse into numeric array");
        });
    });
    describe("getQueryParameters tests", () => {
        it("getQueryParameters", () => {
            let options = { a: "" };
            common_3.getQueryParameters(options, "foo?a=1&b=2");
            base_2.shouldEqual(options.a, "1", "a=1 extracted");
            base_2.shouldEqual(options.b, undefined, "b not assigned");
            options = { b: "" };
            common_3.getQueryParameters(options, "foo?a=1&b=2");
            base_2.shouldEqual(options.b, "2", "b=2 extracted");
            base_2.shouldEqual(options.a, undefined, "a not assigned");
            options.a = options.b = options.c = "<null>";
            common_3.getQueryParameters(options, "foo?a=1&b=2");
            base_2.shouldEqual(options.a, "1", "a=1 extracted");
            base_2.shouldEqual(options.b, "2", "b=2 extracted");
            base_2.shouldEqual(options.c, "<null>", "c not assigned, original value untouched");
        });
    });
    describe("getParameterByName tests", () => {
        it("getParameterByName", () => {
            base_2.shouldEqual(common_3.getParameterByName("a", "foo?a=1"), "1", "a=1");
            base_2.shouldEqual(common_3.getParameterByName("b", "foo?a=1"), null, "b does not exist");
        });
    });
    describe("doif tests", () => {
        let die = (n) => { throw `doif callback not expected to execute: ${n}`; };
        let spawn = () => {
            let v = true;
            return () => v = !v;
        };
        it("doif false tests", () => {
            common_3.doif(undefined, die);
            common_3.doif(null, die);
        });
        it("doif empty tests", () => {
            let c = spawn();
            common_3.doif(0, c);
            base_2.shouldEqual(c(), true, "0 invokes doif");
            common_3.doif(false, c);
            base_2.shouldEqual(c(), true, "false invokes doif");
            common_3.doif({}, c);
            base_2.shouldEqual(c(), true, "{} invokes doif");
        });
        it("doif value tests", () => {
            common_3.doif(0, v => base_2.shouldEqual(v, 0, "0"));
            common_3.doif({ a: 100 }, v => base_2.shouldEqual(v.a, 100, "a = 100"));
        });
    });
    describe("mixin tests", () => {
        it("simple mixins", () => {
            base_2.shouldEqual(common_3.mixin({ a: 1 }, { b: 2 }).a, 1, "a=1");
            base_2.shouldEqual(common_3.mixin({ a: 1 }, { b: 2 }).b, 2, "b=2");
            base_2.shouldEqual(common_3.mixin({ a: 1 }, { b: 2 }).c, undefined, "c undefined");
            base_2.shouldEqual(common_3.mixin({ a: 1 }, {}).a, 1, "a=1");
            base_2.shouldEqual(common_3.mixin({}, { b: 2 }).b, 2, "b=2");
        });
        it("nested mixins", () => {
            base_2.shouldEqual(common_3.mixin({ vermont: { burlington: true } }, { ["south carolina"]: { greenville: true } })["south carolina"].greenville, true, "greenville is in south carolina");
            base_2.shouldEqual(common_3.mixin({ vermont: { burlington: true } }, { vermont: { greenville: false } }).vermont.greenville, false, "greenville is not in vermont");
            base_2.shouldEqual(common_3.mixin({ vermont: { burlington: true } }, { vermont: { greenville: false } }).vermont.burlington, undefined, "second vermont completely wipes out 1st");
        });
    });
    describe("defaults tests", () => {
        it("defaults", () => {
            base_2.shouldEqual(common_3.defaults({ a: 1 }, { a: 2, b: 3 }).a, 1, "a = 1");
            base_2.shouldEqual(common_3.defaults({ a: 1 }, { a: 2, b: 3 }).b, 3, "b = 3");
            base_2.shouldEqual(common_3.defaults({}, { a: 2, b: 3 }).a, 2, "a = 2");
        });
    });
    describe("cssin tests", () => {
        it("hides the body", () => {
            let handles = [];
            handles.push(common_3.cssin("css1", "body {display: none}"));
            handles.push(common_3.cssin("css1", "body {display: block}"));
            base_2.shouldEqual(getComputedStyle(document.body).display, "none", "body is hidden, 1st css1 wins");
            handles.shift()();
            base_2.shouldEqual(getComputedStyle(document.body).display, "none", "body is still hidden, 1st css1 still registered");
            handles.shift()();
            base_2.shouldEqual(getComputedStyle(document.body).display, "block", "body is no longer hidden, css1 destroyed");
        });
    });
    describe("html tests", () => {
        it("tableless tr test", () => {
            let markup = "<tr>A<td>B</td></tr>";
            let tr = common_3.html(markup);
            base_2.should(tr.nodeValue === "AB", "setting innerHTML on a 'div' will not assign tr elements");
        });
        it("table tr test", () => {
            let markup = "<table><tbody><tr><td>Test</td></tr></tbody></table>";
            let table = common_3.html(markup);
            base_2.should(table.outerHTML === markup, "preserves tr when within a table");
        });
        it("canvas test", () => {
            let markup = `<canvas width="100" height="100"></canvas>`;
            let canvas = common_3.html(markup);
            base_2.should(canvas.outerHTML === markup, "canvas markup preserved");
            base_2.should(!!canvas.getContext("2d"), "cnvas has 2d context");
        });
    });
});
define("tests/spec/slowloop", ["require", "exports", "tests/base", "ol3-fun/common"], function (require, exports, base_3, common_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    base_3.describe("slowloop", () => {
        base_3.it("slowloop empty", done => {
            try {
                base_3.slowloop(null);
                base_3.should(false, "slowloop requires an array");
            }
            catch (_a) {
                done();
            }
        });
        base_3.it("slowloop with progress", () => {
            let progressCount = 0;
            return base_3.slowloop(common_4.range(7).map(n => () => { }), 0, 5)
                .progress(args => {
                console.log(args);
                progressCount++;
            })
                .then(() => {
                base_3.shouldEqual(progressCount, 7 * 5, "progress callbacks");
            });
        });
        base_3.it("slowloop with exceptions", () => {
            return base_3.slowloop([
                () => {
                    throw "exception occured in slowloop";
                }
            ])
                .then(() => base_3.should(false, "failure expected"))
                .catch(ex => base_3.should(!!ex, ex));
        });
        base_3.it("slowloop with abort", () => {
            return base_3.slowloop([
                () => {
                    base_3.should(false, "aborted from inside");
                }
            ], 10)
                .reject("aborted from outside")
                .catch(ex => base_3.shouldEqual(ex, "aborted from outside", "aborted from outside"));
        });
        base_3.it("slowloop fast", done => {
            let count = 0;
            let inc = () => count++;
            base_3.slowloop([inc, inc, inc], 0, 100).then(() => {
                base_3.shouldEqual(count, 300, "0 ms * 100 iterations * 3 functions => 300 invocations");
                done();
            });
        }).timeout(2000);
        base_3.it("slowloop iterations", done => {
            let count = 0;
            let inc = () => count++;
            base_3.slowloop([inc]).then(() => {
                base_3.shouldEqual(count, 1, "defaults to a single iteration");
                base_3.slowloop([inc], 0, 2).then(() => {
                    base_3.shouldEqual(count, 3, "performs two iterations");
                    base_3.slowloop([inc], 0, 0).then(() => {
                        base_3.shouldEqual(count, 3, "performs 0 iterations");
                        done();
                    });
                });
            });
        });
    });
});
define("tests/spec/openlayers-test", ["require", "exports", "tests/base", "openlayers"], function (require, exports, base_4, ol) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    describe("ol/Map", () => {
        it("ol/Map", () => {
            base_4.should(!!ol.Map, "Map");
        });
    });
});
define("tests/spec/parse-dms", ["require", "exports", "tests/base", "ol3-fun/parse-dms"], function (require, exports, base_5, parse_dms_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    base_5.describe("parse-dms", () => {
        base_5.it("parse", () => {
            let dms = parse_dms_2.parse(`10 5'2" 10`);
            if (typeof dms === "number")
                throw "lat-lon expected";
            base_5.should(dms.lat === 10.08388888888889, "10 degrees 5 minutes 2 seconds");
            base_5.should(dms.lon === 10, "10 degrees 0 minutes 0 seconds");
        });
    });
});
define("ol3-fun/google-polyline", ["require", "exports"], function (require, exports) {
    "use strict";
    class PolylineEncoder {
        encodeCoordinate(coordinate, factor) {
            coordinate = Math.round(coordinate * factor);
            coordinate <<= 1;
            if (coordinate < 0) {
                coordinate = ~coordinate;
            }
            let output = '';
            while (coordinate >= 0x20) {
                output += String.fromCharCode((0x20 | (coordinate & 0x1f)) + 0x3f);
                coordinate >>= 5;
            }
            output += String.fromCharCode(coordinate + 0x3f);
            return output;
        }
        decode(str, precision = 5) {
            let index = 0, lat = 0, lng = 0, coordinates = [], latitude_change, longitude_change, factor = Math.pow(10, precision);
            while (index < str.length) {
                let byte = 0;
                let shift = 0;
                let result = 0;
                do {
                    byte = str.charCodeAt(index++) - 0x3f;
                    result |= (byte & 0x1f) << shift;
                    shift += 5;
                } while (byte >= 0x20);
                let latitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));
                shift = result = 0;
                do {
                    byte = str.charCodeAt(index++) - 0x3f;
                    result |= (byte & 0x1f) << shift;
                    shift += 5;
                } while (byte >= 0x20);
                longitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));
                lat += latitude_change;
                lng += longitude_change;
                coordinates.push([lat / factor, lng / factor]);
            }
            return coordinates;
        }
        encode(coordinates, precision = 5) {
            if (!coordinates.length)
                return '';
            let factor = Math.pow(10, precision), output = this.encodeCoordinate(coordinates[0][0], factor) + this.encodeCoordinate(coordinates[0][1], factor);
            for (let i = 1; i < coordinates.length; i++) {
                let a = coordinates[i], b = coordinates[i - 1];
                output += this.encodeCoordinate(a[0] - b[0], factor);
                output += this.encodeCoordinate(a[1] - b[1], factor);
            }
            return output;
        }
    }
    return PolylineEncoder;
});
define("ol3-fun/ol3-polyline", ["require", "exports", "openlayers"], function (require, exports, ol) {
    "use strict";
    const Polyline = ol.format.Polyline;
    class PolylineEncoder {
        constructor(precision = 5, stride = 2) {
            this.precision = precision;
            this.stride = stride;
        }
        flatten(points) {
            let nums = new Array(points.length * this.stride);
            let i = 0;
            points.forEach(p => p.map(p => nums[i++] = p));
            return nums;
        }
        unflatten(nums) {
            let points = new Array(nums.length / this.stride);
            for (let i = 0; i < nums.length / this.stride; i++) {
                points[i] = nums.slice(i * this.stride, (i + 1) * this.stride);
            }
            return points;
        }
        round(nums) {
            let factor = Math.pow(10, this.precision);
            return nums.map(n => Math.round(n * factor) / factor);
        }
        decode(str) {
            let nums = Polyline.decodeDeltas(str, this.stride, Math.pow(10, this.precision));
            return this.unflatten(this.round(nums));
        }
        encode(points) {
            return Polyline.encodeDeltas(this.flatten(points), this.stride, Math.pow(10, this.precision));
        }
    }
    return PolylineEncoder;
});
define("tests/spec/polyline", ["require", "exports", "tests/base", "ol3-fun/google-polyline", "ol3-fun/ol3-polyline", "ol3-fun/common"], function (require, exports, base_6, GooglePolylineEncoder, PolylineEncoder, common_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    describe("GooglePolylineEncoder", () => {
        it("GooglePolylineEncoder", () => {
            base_6.should(!!GooglePolylineEncoder, "GooglePolylineEncoder");
        });
        let points = common_5.pair(common_5.range(10), common_5.range(10));
        let poly = new GooglePolylineEncoder();
        let encoded = poly.encode(points);
        let decoded = poly.decode(encoded);
        base_6.shouldEqual(encoded.length, 533, "encoding is 533 characters");
        base_6.shouldEqual(base_6.stringify(decoded), base_6.stringify(points), "encode->decode");
    });
    describe("PolylineEncoder", () => {
        it("PolylineEncoder", () => {
            base_6.should(!!PolylineEncoder, "PolylineEncoder");
        });
        let points = common_5.pair(common_5.range(10), common_5.range(10));
        let poly = new PolylineEncoder();
        let encoded = poly.encode(points);
        let decoded = poly.decode(encoded);
        base_6.shouldEqual(encoded.length, 533, "encoding is 533 characters");
        base_6.shouldEqual(base_6.stringify(decoded), base_6.stringify(points), "encode->decode");
        poly = new PolylineEncoder(6);
        encoded = poly.encode(points);
        decoded = poly.decode(encoded);
        base_6.shouldEqual(encoded.length, 632, "encoding is 632 characters");
        base_6.shouldEqual(base_6.stringify(decoded), base_6.stringify(points), "encode->decode");
    });
});
define("ol3-fun/snapshot", ["require", "exports", "openlayers"], function (require, exports, ol) {
    "use strict";
    function getStyle(feature) {
        let style = feature.getStyle();
        if (!style) {
            let styleFn = feature.getStyleFunction();
            if (styleFn) {
                style = styleFn(0);
            }
        }
        if (!style) {
            style = new ol.style.Style({
                text: new ol.style.Text({
                    text: "?"
                })
            });
        }
        if (!Array.isArray(style))
            style = [style];
        return style;
    }
    class Snapshot {
        static render(canvas, feature) {
            feature = feature.clone();
            let geom = feature.getGeometry();
            let extent = geom.getExtent();
            let [cx, cy] = ol.extent.getCenter(extent);
            let [w, h] = [ol.extent.getWidth(extent), ol.extent.getHeight(extent)];
            let isPoint = w === 0 || h === 0;
            let ff = 1 / (window.devicePixelRatio || 1);
            let scale = isPoint ? 1 : Math.min((ff * canvas.width) / w, (ff * canvas.height) / h);
            geom.translate(-cx, -cy);
            geom.scale(scale, -scale);
            geom.translate(Math.ceil((ff * canvas.width) / 2), Math.ceil((ff * canvas.height) / 2));
            console.log(scale, cx, cy, w, h, geom.getCoordinates());
            let vtx = ol.render.toContext(canvas.getContext("2d"));
            let styles = getStyle(feature);
            if (!Array.isArray(styles))
                styles = [styles];
            styles.forEach(style => vtx.drawFeature(feature, style));
        }
        static snapshot(feature, size = 128) {
            let canvas = document.createElement("canvas");
            canvas.width = canvas.height = size;
            this.render(canvas, feature);
            return canvas.toDataURL();
        }
    }
    return Snapshot;
});
define("tests/spec/snapshot", ["require", "exports", "tests/base", "ol3-fun/snapshot", "openlayers", "ol3-fun/common"], function (require, exports, base_7, Snapshot, ol, common_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const pointData = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAFdUlEQVR4Xu1aXUybVRh+3hiWxiX+ZNSMECvjJxiqyaROyq5M2MWUZGyDLEZg0WzhJ2QELharjmbWGgqOOTRxTMDIGHpBpIwE40Un3ujA0EmUYkhcRpoJRObfJkJG9Ji3+1gWoP2+rudrSvq9l/2e857nPOc5/yUkeVCStx+GAIYDklwBYwgkuQGMSdAYAsYQSHIFjCGQ5AYwVgFjCBhDIMkViPsQEEKkANgFIB2AGcCjAP4AsADgOoBxIlqJV7/ETQAhRCWAlwA8D+DBCA38G8DXAD4jok/1FkJ3AYQQVgDdAAruozHfAqgloh/uo6ymIroKIIQ4DOBjAA9oYrMx6F8AVUTEeaSHLgIIITjvOwBel8jYTURNEvOFUuklQDMAh2yyAJqJ6A2ZeaULIIR4GUCfTJJrch0ion5Z+aUKIIRIA/CzyiwfK/d/AGQQES+bMYdsAc4D4OVO7/iEiF6VUYk0AYQQvMyNyiClMUc+EX2vERsWJlOAqHp/enoaY2NjmJubQ1paGgoKCpCbmxtNe3qI6JVoCmyElSKAsuz9CiBVC6GzZ8+ioaEBt2/fvgvfsmUL2tvbUVNToyUFYxaI6DGt4HA4WQLw3v47LWQ6OjpQW1sbFnru3DlUVVVpScWYZ4hoQitYTwfwjq9HjQjbPTMzE8vLy2GhJpMJS0tLaqlWvzuIqEUrWE8BGgC8p0ZkYGAApaWlajAIIVQxCuArIirSCtZTgDcBuNWInDp1CsePH1eDRSPA70S0TTVhBICsOYAH9YdqRLxeLw4ePKgGi0aAL4noBdWEcRCAW/W5GpHZ2VlkZWXJnAP4qNyhVm+k77IckKVsgVW58Cwfaanr7OzE0aNHVfMogGwiuqoVrNscwImFEDMAntBCpr+/H/X19Zifn78LT09Px5kzZ1BWVqYlBWOuE9HjWsHhcFIcoAjQCUBz162srGB0dBRXrlxBfn4+7HY7UlL4ulBzfERE1ZrRYYAyBXgOwFishKIov4uIxqPAbwiVJoDigosA9sVKSkP5QSI6oAGnCpEtwJMAflKtNTbAfwDyiGg6tjR3SksVQHEBX4XxlZhe8RoRtcpKLl0AJjY+Pt5jMpn4fICtW7ciIyMjIt+ZmZkQzmzmd5KI0U5EvO2WFnoIwHvddT3Ep8Dq6vWT9tDQEEpKSkINunbt2jqxFhYW4Ha7MTg4OB8MBrMBLEprvR5DAMD7gUDgWF5e3l2efO5vaWnB7t27UVRUhMnJSRARrFYr+vr6sH37drALcnJyYLFYQuUWFxdDYjQ3Nwuz2Uw3b96E0+l8GsBkwgvg9/uPDQ8PM+He1NTUhzweT0lhYSFaW1tx48YN8DcOm82GiooKNDY2btgmi8XyZzAYfMTv94fKOJ1OP4BnN5MAfE2Grq6uwyyA3W7/y+v1Pswu4JiamkJxcTF/DzmAY//+/di27c4B79KlS6Hfjxw5glu3bqGurg69vb1Sh63UZErPrBsCq+TZ4nwbdPr06W+6u7t/GxkZ2Xf58uWQ1VcF2Lt3L5qamrw7duw4UF5ezlvmoMvlsigO4MliaDM5YJXrFwBGXC7Xu9zjNputgj/4fL4Lq4BVAViMPXv2VFRWVl5wOBxwOBxXT548maUIsOnmgHsJP+VyuX5kB3g8nom2trZfAoFA8VoHqAjwNgDnZnLA2h477/P5Ku+dA6xW64TP59sZzgEnTpyYcLvdO7Ozs0MridPp5JtgKa9CLKQecwCfBfhMwLY/tGbd5p0Ov/AeU3rxA+Uxhd8SAwB4m8ui2QHUKa9Mbyn/KHkxTM6YDKGHADERindhQ4B4K55o9RkOSLQeiTcfwwHxVjzR6jMckGg9Em8+hgPirXii1Zf0DvgfGiXvUAsr6xQAAAAASUVORK5CYII=";
    const circleData = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAHzUlEQVR4XuWbaWxVRRTHf+OGS1BRUQuCuICRRoMWFTRugEgCVo2IQqEgUAmpiCIgJuoHiAmgKEowBlsXwCLuEv2g0kaNti7RaBTFjaBScYtRq1FRueZ/79z75r32tfe9PmrpPclL+96dOzPnP+fMnG0MBSVvP2AUcIn9HFig7n8GNgBPAS+C+aNA/WIK05F3EFAJ3AAckr3Pb4Hv7ec74C9gJyDcDgeOsH+PbG1aPwLLgXvANLV3/u0EwDsMuA6YBbSw2l8EC8ZLwEYg7nyF5zBgJHABcFxLfP4CrACWgZGE5EV5AuB1A24HptvlcwbXyq4NFoiv8ppU85f6AtcCE62UpLX4HXgAmAdGIpUT5QGA1x94EjgpfaQvgaVAtRXtnOYRs7FwnwbcBByV+c4HwGVgPovZmd8sRwC8CcAq4ID0QaYCa4B/chm7HW33ttKghW8mDVPAPBG385gAeHsCd9uNzvYtZm8GlsQdaxe00/TnA7cBmmJEK4HZYP5ta9AYAHh7AOuBsanOGoFxQH1b/XfQ8zPtCalTJKJHgHIwOmayUhsA+MyvBspSPWg3vwL4qYOYiztMT6AGGJETCK0A0BLzDwHSdy/urDq4ndjRvjAlNghZAMjG/FUdzFC+wz0YG4RsAGhncXY3nXrS+VbVKd/Z7oL3pLmPBadiiuaDke2SRi0A4Mns+gjYJ2hZB1zYgUdcofDYy1qh54cd7gCKwXzujpABgC/6bwCnBY22AqcAeVuaheImz34OBt4FjgnffwsYAibaxDIBuBFYHLSWuA8B3s5z8M7y2ul2TSNW54JZFs7OAcA7EXgvJfoya4VHV6A7rKPq85KmCi4A8rcvCtiVFzfQtu0KAGg72wQcHzKzAczF+mIB8I4FtDnY7+cBr3QFzh0e5F7Xht+1B/QFsy0E4C7r19tGadZUFwJCJ1p0KiiOMNeAtz+wPRXQkGRIG7oiKVL3dMjYr0CRALjGRlaAbYFkdFpTt72LolNecYsoljBTAHwYGAiiOYC0oSvTPBu48Xl8XwA4no1icZKMrkwKXSqc6JPnAPAacHZX5tzh7XVAMQT/2AslQAagYm1JIBl5UoU0AGQDPZcE7gGddM9kAiDdiBu3391xOhRQfiWSAAU4FWlNEgV7v90DXrApvSQBIJ5HhgAo4uMEfROBg/Ksl4YAPJwZQ0sABErkTAwBUB5BFnGS6D5gRgiA4p8LksR9kFRmTgiAxKE8YQAocTQhBGCd/yVZ9Kif4bLH4Js2AJokCBTsHRwC8IMtTUkSAMpt9nCdIdXp/JkQBFIuseMNyhWWS5wEUlxQ8cE0b/B6W3yVBAAU+QpyI44EvAqcmwTuraSfFQGgMpI9gkCoqt46W+FDoddENYjfhCmQnZIAJ1g+w9ZAFXrQztTfTODecEJ1AkBcyzAGkuAWq8RneAhAhQDoAcgQsGVWJwCftmvJNm3axMCByi1CU1MTlZWVNDY2smLFChYvXsyaNTK9s1NVVRX9+vVjxIhCZ6gGAJ+EA0v1e4apscAw9kl+clplRU5giPnt27dHkxczo0aNory8nLq64Ohpi3YdAIoD+jlR0Vowk9zkqJbdSkGJLSxoa6rpzydNmsSCBQuYNWtWM2aHDRsWScDkyZMZNGgQ3bt3Z/369ehZ79692bFjB0uWLKFXr16RBGzcuJHhwwORra2tbYdUKAyucLhPWv0BYLa46fEqW4cKNERx81wgWLhwIaNHj6akRACmUyYAeioRF4NFRUUUFxejlR86dCgNDQ0+APX19ZSVlVFRUeEDKunSs+nTVaKcK70DnBq+tAqM9j63VNZTwmxLKjqqUjNFiuJTNgkQYzU1NWkSsHXrVp8RARD+H44UqoB+nzZNtcEpyk8K1IfW16e/gT5gVNWdWSvsqfzcCQ31tmdmfBBa2gPGjRvHypUrKS0t9TdBqYALQCgNkiCt+ObNm+nWrVszCYg/C7elkr1KiEa0HIzMXp8ya4RkJWgv6B48VoGRdCe3KvS2TgEXAKnG6tWrY+0BmlF1dXUOKqDqcrm9UWG7Ep/9wejWRksA6DdvdHqKaHcOlqh0dry7+mPAPO/+kK1QcpEtBbdtpRUKnO5ONDvTuVsE5tZMDrIBoN9118WxRK4G7t9NEKjINOll/o106wNbUYHwkX8RSmeHc2HnTmBuJ64gUQWIqmHl7kakkrcSMFFRQAwViEDQ0ajbF2ekXlIG+fJOGD3aF3gcGOPyp2DnWFWDZRPdOBcmVGSn3JnTs0qJh3aiahIJqy5vBP6HJdn048GoMDIrxQDAPxnUTlUFkn9LXwPSNXmQ/yepkFt7Ux93EkvBxCpzjQlApBLiWK6zlM3Ss/baoADpSDraXs0rdQeVjT8VjG65xKIcAfClQVdjdXPMgVzRZJ25qsn9ONbA+TdSSbNKebQPSe8zRdLkJJJ5AOCDoOLKW6xKqDDfIVmP8iF0ebJQ4TXdB5JBM9l1aMIxpeOKcC4Ek3NcP08AIpVQ9ETScE7zFZXPITBkQOlOozbOVvcjpwuZsFppmbC6mXsykIFz0FqRXIm8jrq8qJ0AREAo0K57rVcCko4WSGU4cjMEhi5/pzkoQD8r0mJauKbdA3T701VZXeNbA+blvLh2XioQABEQcqIkq9osB7d3chnvy6vRdr8OzG+F6vs/cM4xojBcMyUAAAAASUVORK5CYII=";
    function show(data) {
        document.body.appendChild(common_6.html(`<img src="${data}" />`));
    }
    function circle(radius = 1, points = 36) {
        if (points < 3)
            throw "a circle must contain at least three points";
        if (radius <= 0)
            throw "a circle must have a positive radius";
        let a = 0;
        let dr = (2 * Math.PI) / (points - 1);
        let result = new Array(points);
        for (let i = 0; i < points - 1; i++) {
            result[i] = [radius * Math.sin(a), radius * Math.cos(a)];
            a += dr;
        }
        result[result.length - 1] = result[0];
        return result;
    }
    describe("Snapshot", () => {
        it("Snapshot", () => {
            base_7.should(!!Snapshot, "Snapshot");
            base_7.should(!!Snapshot.render, "Snapshot.render");
            base_7.should(!!Snapshot.snapshot, "Snapshot.snapshot");
        });
        it("Converts a point to image data", () => {
            let feature = new ol.Feature(new ol.geom.Point([0, 0]));
            feature.setStyle(new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 10,
                    fill: new ol.style.Fill({ color: "black" }),
                    stroke: new ol.style.Stroke({
                        color: "white",
                        width: 10
                    })
                }),
                text: new ol.style.Text({
                    text: "Point",
                    fill: new ol.style.Fill({
                        color: "white"
                    }),
                    stroke: new ol.style.Stroke({
                        color: "black",
                        width: 2,
                    }),
                    offsetY: 16
                })
            }));
            let data = Snapshot.snapshot(feature, 64);
            show(data);
            if (1 === window.devicePixelRatio) {
                if (data !== pointData)
                    show(pointData);
                base_7.shouldEqual(data, pointData, "point data as expected");
            }
        });
        it("Converts a triangle to image data", () => {
            let points = circle(50, 4);
            let feature = new ol.Feature(new ol.geom.Polygon([points]));
            feature.setStyle(createStyle("Triangle"));
            let data = Snapshot.snapshot(feature, 64);
            show(data);
        });
        it("Converts a diamond to image data", () => {
            let points = circle(50, 5);
            let feature = new ol.Feature(new ol.geom.Polygon([points]));
            feature.setStyle(createStyle("Diamond"));
            let data = Snapshot.snapshot(feature, 64);
            show(data);
        });
        it("Converts a polygon to image data", () => {
            let geom = new ol.geom.Polygon([circle(3 + 100 * Math.random())]);
            let feature = new ol.Feature(geom);
            base_7.shouldEqual(feature.getGeometry(), geom, "geom still assigned");
            feature.setStyle(createStyle("Circle"));
            let originalCoordinates = base_7.stringify(geom.getCoordinates());
            let data = Snapshot.snapshot(feature, 64);
            console.log(data);
            base_7.should(!!data, "snapshot returns data");
            show(data);
            let finalCoordinates = base_7.stringify(geom.getCoordinates());
            base_7.shouldEqual(originalCoordinates, finalCoordinates, "coordinates unchanged");
            base_7.shouldEqual(feature.getGeometry(), geom, "geom still assigned");
            if (1 === window.devicePixelRatio) {
                if (data !== pointData)
                    show(circleData);
                base_7.shouldEqual(data, circleData, "circle data as expected");
            }
        });
    });
    function createStyle(text = "") {
        return new ol.style.Style({
            fill: new ol.style.Fill({
                color: "black"
            }),
            stroke: new ol.style.Stroke({
                color: "blue",
                width: 3
            }),
            text: new ol.style.Text({
                text: text,
                fill: new ol.style.Fill({
                    color: "white"
                }),
                stroke: new ol.style.Stroke({
                    color: "black",
                    width: 2,
                }),
                offsetY: 16
            })
        });
    }
});
define("tests/spec/zoom-to-feature", ["require", "exports", "openlayers", "tests/base", "ol3-fun/navigation"], function (require, exports, ol, base_8, navigation_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    describe("zoomToFeature", () => {
        it("zoomToFeature", (done) => {
            base_8.should(!!navigation_2.zoomToFeature, "zoomToFeature");
            let map = new ol.Map({
                view: new ol.View({
                    zoom: 0,
                    center: [0, 0]
                })
            });
            let feature = new ol.Feature();
            let geom = new ol.geom.Point([100, 100]);
            feature.setGeometry(geom);
            map.once("postrender", () => {
                let res = map.getView().getResolution();
                let zoom = map.getView().getZoom();
                navigation_2.zoomToFeature(map, feature, {
                    duration: 200,
                    minResolution: res / 4,
                }).then(() => {
                    let [cx, cy] = map.getView().getCenter();
                    base_8.should(map.getView().getZoom() === zoom + 2, "zoom in two because minRes is 1/4 of initial res");
                    base_8.should(cx === 100, "center-x");
                    base_8.should(cy === 100, "center-y");
                    done();
                });
            });
        });
    });
});
define("tests/spec/deep-extend", ["require", "exports", "tests/base", "ol3-fun/deep-extend"], function (require, exports, base_9, deep_extend_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    describe("utils/deep-extend", () => {
        it("trivial merges", () => {
            base_9.shouldEqual(base_9.stringify(deep_extend_2.extend({}, {})), base_9.stringify({}), "empty objects");
            base_9.shouldEqual(base_9.stringify(deep_extend_2.extend([], [])), base_9.stringify([]), "empty arrays");
            base_9.shouldEqual(base_9.stringify(deep_extend_2.extend([,], [, ,])), base_9.stringify([,]), "arrays with empty items");
            let o = { a: 1 };
            base_9.shouldEqual(o, deep_extend_2.extend(o, o), "merges same object");
            base_9.should(o !== deep_extend_2.extend(o), "clones when second argument not provided");
        });
        it("invalid merges", () => {
            base_9.shouldThrow(() => deep_extend_2.extend({}, []), "{} and []");
            base_9.shouldThrow(() => deep_extend_2.extend([], {}), "[] and {}");
            base_9.shouldThrow(() => deep_extend_2.extend(1, 2), "primitives");
            base_9.shouldThrow(() => deep_extend_2.extend(new Date(2000, 1, 1), new Date(2000, 1, 2)), "clonable primitives");
            let a = { a: 1 };
            let b = { b: a };
            a.b = b;
            base_9.shouldThrow(() => deep_extend_2.extend(b), "b->a->b");
        });
        it("simple data merges", () => {
            let o = deep_extend_2.extend({ v1: 1 });
            base_9.shouldEqual(o.v1, 1, "adds v1");
            deep_extend_2.extend(o, { v1: 2 });
            base_9.shouldEqual(o.v1, 2, "updates v1");
        });
        it("simple array merges", () => {
            base_9.shouldEqual(base_9.stringify(deep_extend_2.extend([1], [])), base_9.stringify([1]), "[1] + []");
            base_9.shouldEqual(base_9.stringify(deep_extend_2.extend([1], [2])), base_9.stringify([2]), "[1] + [2]");
            base_9.shouldEqual(base_9.stringify(deep_extend_2.extend([1, 2, 3], [2])), base_9.stringify([2, 2, 3]), "[1,2,3] + [2]");
            base_9.shouldEqual(base_9.stringify(deep_extend_2.extend([2], [1, 2, 3])), base_9.stringify([1, 2, 3]), "[2] + [1,2,3]");
            base_9.shouldEqual(base_9.stringify(deep_extend_2.extend([, , , 4], [1, 2, 3])), base_9.stringify([1, 2, 3, 4]), "array can have empty items");
            base_9.shouldEqual(base_9.stringify(deep_extend_2.extend([{ id: 1 }], [{ id: 2 }])), base_9.stringify([{ id: 1 }, { id: 2 }]), "[1] + [2] with ids");
        });
        it("preserves array ordering", () => {
            base_9.shouldEqual(deep_extend_2.extend([{ id: 1 }], [{ id: 1 }, { id: 2 }])[0].id, 1, "first item id");
            base_9.shouldEqual(deep_extend_2.extend([{ id: 2 }], [{ id: 1 }, { id: 2 }])[0].id, 2, "first item id");
            base_9.shouldEqual(deep_extend_2.extend([{ id: 1 }, { id: 3 }], [{ id: 2 }, { id: 1, v: 1 }])[0].v, 1, "first item id");
        });
        it("clones objects with primitives", () => {
            let source = { v1: { v2: { v3: 1 } } };
            let o = deep_extend_2.extend(source);
            base_9.shouldEqual(o.v1.v2.v3, 1, "properly extends {}");
            base_9.should(source.v1 !== o.v1, "properly clones objects");
        });
        it("clones dates", () => {
            let source = { date: new Date() };
            let o = deep_extend_2.extend(source);
            base_9.should(source.date !== o.date, "dates are clones");
            base_9.shouldEqual(source.date.getUTCDate(), o.date.getUTCDate(), "date values are preserved");
        });
        it("confirms references are preserved", () => {
            let x = { foo: { bar: "foo" }, array: [{ id: "a", value: "ax" }] };
            let y = { foo: { bar: "bar" }, array: [{ id: "a", value: "ay" }] };
            let xfoo = x.foo;
            let xarray = x.array[0];
            let z = deep_extend_2.extend(x, y);
            base_9.shouldEqual(x, z, "returns x");
            base_9.shouldEqual(xfoo, z.foo, "reference foo preserved");
            base_9.shouldEqual(xarray.value, "ay", "existing array references are preserved");
        });
        it("confirms array merge is 'id' aware", () => {
            let o1 = {
                values: [
                    {
                        id: "v1",
                        value: { v1: 1 }
                    },
                    {
                        id: "v2",
                        value: { v2: 1 }
                    },
                    {
                        id: "v9",
                        value: { v9: 1 }
                    }
                ]
            };
            let o2 = {
                values: [
                    {
                        id: "v1",
                        value: { v1: 2 }
                    },
                    {
                        id: "v9",
                        value: { v9: 2 }
                    }
                ]
            };
            let o = deep_extend_2.extend(o1);
            base_9.shouldEqual(o.values[0].value.v1, 1, "object is clone of o1, v1");
            base_9.shouldEqual(o.values[1].value.v2, 1, "object is clone of o1, v2");
            base_9.shouldEqual(o.values[2].value.v9, 1, "object is clone of o1, v9");
            deep_extend_2.extend(o, o2);
            base_9.shouldEqual(o.values[0].value.v1, 2, "merge replaces v1");
            base_9.shouldEqual(o.values[1].value.v2, 1, "merge preserves v2");
            base_9.shouldEqual(o.values[2].value.v9, 2, "merge replaces v9");
        });
        it("confirms array references are preserved", () => {
            let x = { foo: { bar: "foo" } };
            let y = { foo: { bar: "bar" } };
            let xfoo = x.foo;
            let z = deep_extend_2.extend(x, y);
            base_9.shouldEqual(x, z, "returns x");
            base_9.shouldEqual(xfoo, z.foo, "reference foo preserved");
        });
        it("confirms trace is empty when merging duplicate objects", () => {
            let trace = [];
            deep_extend_2.extend({}, {}, trace);
            base_9.shouldEqual(trace.length, 0, "no activity 0");
            deep_extend_2.extend({ a: 1 }, { a: 1 }, trace);
            base_9.shouldEqual(trace.length, 0, "no activity 1");
            deep_extend_2.extend({ a: 1, b: [1] }, { a: 1, b: [1] }, trace);
            base_9.shouldEqual(trace.length, 0, "no activity 2");
            deep_extend_2.extend({ a: 1, b: [1], c: {} }, { a: 1, b: [1], c: {} }, trace);
            base_9.shouldEqual(trace.length, 0, "no activity 3");
            deep_extend_2.extend({ a: 1, b: [1], c: { d: 1 } }, { a: 1, b: [1], c: { d: 1 } }, trace);
            base_9.shouldEqual(trace.length, 0, "no activity 4");
            deep_extend_2.extend({ a: [1, 2, 3] }, { a: [1, 2, 3] }, (trace = []));
            base_9.shouldEqual(trace.length, 0, "no activity 5");
            deep_extend_2.extend({ a: [1, 2, [3]] }, { a: [1, 2, [3]] }, (trace = []));
            base_9.shouldEqual(trace.length, 0, "no activity 6");
        });
        it("confirms trace is 1 when exactly one change is merged", () => {
            let trace = [];
            deep_extend_2.extend({ a: 1, b: [1], c: { d: 1 } }, { a: 2, b: [1], c: { d: 1 } }, (trace = []));
            base_9.shouldEqual(trace.length, 1, "a:1->2");
            deep_extend_2.extend({ a: 1, b: [1], c: { d: 1 } }, { a: 1, b: [2], c: { d: 1 } }, (trace = []));
            base_9.shouldEqual(trace.length, 1, "b:1->2");
            deep_extend_2.extend({ a: 1, b: [1], c: { d: 1 } }, { a: 1, b: [1], c: { d: 2 } }, (trace = []));
            base_9.shouldEqual(trace.length, 1, "d:1->2");
            deep_extend_2.extend({ a: [1, 2, 3] }, { a: [1, 2, 30] }, (trace = []));
            base_9.shouldEqual(trace.length, 1, "3->30");
            deep_extend_2.extend({ a: [1, 2, [3]] }, { a: [1, 2, [3, 4]] }, (trace = []));
            base_9.shouldEqual(trace.length, 1, "[3]->[3,4]");
        });
        it("confirms trace is 2 when exactly two changes is merged", () => {
            let trace = [];
            deep_extend_2.extend({ a: 1, b: [1], c: { d: 1 } }, { a: 2, b: [1, 2], c: { d: 1 } }, (trace = []));
            base_9.shouldEqual(trace.length, 2, "a:1->2, b:adds 2");
            deep_extend_2.extend({ a: 1, b: [1], c: { d: 1 } }, { a: 1, b: [2, 1], c: { d: 1 } }, (trace = []));
            base_9.shouldEqual(trace.length, 2, "b:1->2,adds 1");
            deep_extend_2.extend({ a: 1, b: [1], c: { d: 1 } }, { a: 1, b: [1], c: { d: 2, e: 3 } }, (trace = []));
            base_9.shouldEqual(trace.length, 2, "c.d:1->2, c.e:added");
            deep_extend_2.extend({ a: [1, 2, 3] }, { a: [10, 2, 30] }, (trace = []));
            base_9.shouldEqual(trace.length, 2, "1->10, 3->30");
            deep_extend_2.extend({ a: [1, 2, [3]] }, { a: [1, 2, [3, 4], 5] }, (trace = []));
            base_9.shouldEqual(trace.length, 2, "[3]->[3,4], 4 added");
        });
        it("confirms change log", done => {
            let target = {
                foo: 1,
                bar: 2
            };
            let trace = [];
            deep_extend_2.extend(target, {
                foo: target.foo,
                property: "should fire 'add' event with this object and string path to it",
                object: {
                    p1: "p1",
                    p2: 2,
                    a1: [1, 2, 3],
                    a2: [{ id: "v1", value: 1 }]
                }
            }, trace);
            base_9.shouldEqual(trace.length, 2, "property added, object added");
            base_9.shouldEqual(trace.length, trace.filter(t => t.value !== t.was).length, "no trivial trace elements");
            base_9.shouldEqual(trace.map(t => t.key).join(" "), "property object", "changes are depth first");
            let t = trace.shift();
            base_9.shouldEqual(t.key, "property", "property");
            base_9.shouldEqual(t.value, target.property, "target.property");
            t = trace.shift();
            base_9.shouldEqual(t.key, "object", "object");
            base_9.shouldEqual(t.value, target.object, "target.object");
            deep_extend_2.extend(target, {
                object: {}
            }, (trace = []));
            base_9.shouldEqual(trace.length, 0, "object was merged (but unchanged)");
            deep_extend_2.extend(target, {
                object: {
                    p1: 1,
                    p2: target.object.p2
                }
            }, (trace = []));
            base_9.shouldEqual(trace.length, 1, "object.p1 was touched");
            t = trace.shift();
            base_9.shouldEqual(t.key, "p1", "p1 changed");
            base_9.shouldEqual(t.was, "p1", "it was 'p1'");
            base_9.shouldEqual(t.value, 1, "it is 1");
            deep_extend_2.extend(target, {
                object: {
                    a2: [
                        {
                            id: "v1",
                            value: 2
                        },
                        {
                            id: "v2",
                            value: "val2"
                        }
                    ]
                }
            }, (trace = []));
            base_9.shouldEqual(trace.map(t => t.key).join(" "), "value 1", "object.a2(2) had one change(1) and one addition(3)");
            trace = trace.filter(t => t.value !== t.was);
            base_9.shouldEqual(trace.length, 2, "a2.v1 -> 2, a2.v2 was created");
            t = trace.shift();
            base_9.shouldEqual(t.key, "value", "a2.v1 -> 2");
            base_9.shouldEqual(t.was, 1, "it was 1");
            base_9.shouldEqual(t.value, 2, "it is 2");
            t = trace.shift();
            base_9.shouldEqual(t.key, "1", "v2 was added");
            base_9.shouldEqual(typeof t.was, "undefined", "it was undefined");
            base_9.shouldEqual(t.value.value, "val2", "a2.v2 is 'val2'");
            done();
        });
    });
});
define("tests/spec/extensions", ["require", "exports", "tests/base", "ol3-fun/extensions"], function (require, exports, base_10, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    describe("data/extensions", () => {
        it("ensures no side-effects on the object", () => {
            let x = new extensions_1.Extensions();
            let o = {};
            let expected = JSON.stringify(o);
            x.extend(o, { custom: "data" });
            let actual = JSON.stringify(o);
            base_10.shouldEqual(expected, actual, "no side-effects");
        });
        it("ensures two objects can be bound to same extension data", () => {
            let x = new extensions_1.Extensions();
            let math = x.extend(Math, { sqrt2: Math.sqrt(2) });
            base_10.should(!!x.extend(Math).sqrt2, "Math.sqrt2");
            x.bind(Number, Math);
            base_10.shouldEqual(Math.round(math.sqrt2 * x.extend(Number).sqrt2), 2, "sqrt2*sqrt2 = 2");
        });
        it("ensures two objects can be bound to same extension data", () => {
            let x = new extensions_1.Extensions();
        });
    });
    describe("100% code coverage for data/extensions", () => {
        let ext1;
        let ext2;
        it("creates two extension instances", done => {
            ext1 = new extensions_1.Extensions();
            base_10.shouldEqual(typeof ext1.extend, "function", "extensions has an extend method");
            base_10.shouldEqual(typeof ext1.getExtensionKey, "function", "extensions has an getExtensionKey method");
            ext2 = new extensions_1.Extensions();
            let o1 = {};
            let o2 = {};
            let xo1 = ext1.extend(o1, { v1: 1 });
            base_10.shouldEqual(xo1, ext1.extend(o1), "extend returns extension object");
            base_10.shouldEqual(xo1.v1, 1, "ext1 v1");
            let xo2 = ext2.extend(o2, { v2: 2 });
            base_10.shouldEqual(xo2.v2, 2, "ext2 v2");
            ext2.extend(o1, { v2: 2 });
            base_10.shouldEqual(xo2.v2, 2, "ext2 v2");
            base_10.shouldEqual(xo1.v1, 1, "ext1 v1");
            done();
        });
        it("extends an object using the first extension instance", done => {
            let o = { v1: 1 };
            ext1.extend(o, { v1: 2 });
            base_10.shouldEqual(o.v1, 1, "v1 is unchanged");
            base_10.shouldEqual(ext1.extend(o).v1, 2, "the extended object has a value for v1 in the context of the first extender");
            false &&
                base_10.shouldEqual(ext1.getExtensionKey(o), ext2.getExtensionKey(o), "the internal extension key for an object should be the same for both extension instances");
            base_10.shouldEqual(typeof ext2.extend(o), "object", "the extended object exists in the context of the second extender");
            base_10.shouldEqual(typeof ext2.extend(o).v1, "undefined", "the extended object has no extension values in the context of the second extender");
            done();
        });
        it("extends an object using the both extension instances", done => {
            let o = { v1: 1 };
            ext1.extend(o, { v1: 2 });
            ext2.extend(o, { v1: 3 });
            base_10.shouldEqual(o.v1, 1, "v1 is unchanged");
            base_10.shouldEqual(ext1.extend(o).v1, 2, "the extended object has a value for v1 in the context of the first extender");
            base_10.shouldEqual(ext2.extend(o).v1, 3, "the extended object has a value for v1 in the context of the second extender");
            done();
        });
        it("forces a key to exist on an object without setting any values", done => {
            let o = {};
            ext1.getExtensionKey(o, true);
            base_10.shouldEqual(Object.keys(ext1.extend(o)).length, 0, "the extended object has no extension values in the context of the first extender");
            base_10.shouldEqual(Object.keys(ext2.extend(o)).length, 0, "the extended object has no extension values in the context of the second extender");
            base_10.should(ext1 !== ext2, "extensions should be unique");
            done();
        });
        it("binds two objects to the same extension", done => {
            let o1 = { id: 1 };
            let o2 = Object.create({ id: 2 });
            ext1.bind(o1, o2);
            ext1.extend(o1, { foo: "foo1" });
            base_10.shouldEqual(ext1.extend(o1).foo, "foo1");
            ext1.extend(o2, { foo: "foo2" });
            base_10.shouldEqual(ext1.extend(o1).foo, "foo2");
            done();
        });
        it("binds a new object to an extended object", done => {
            let o1 = { id: 1 };
            ext1.extend(o1, { foo: "foo1" });
            base_10.shouldEqual(ext1.extend(o1).foo, "foo1");
            let o3 = { id: 3 };
            ext1.bind(o1, o3);
            base_10.shouldEqual(ext1.extend(o3).foo, "foo1");
            let o4 = { id: 4 };
            ext1.extend(o4, { foo: "foo4" });
            base_10.shouldEqual(ext1.extend(o4).foo, "foo4");
            base_10.shouldThrow(() => ext1.bind(o1, o4), "should fail to bind since o4 already extended");
            done();
        });
    });
});
define("tests/index", ["require", "exports", "tests/spec/api", "tests/spec/common", "tests/spec/slowloop", "tests/spec/openlayers-test", "tests/spec/parse-dms", "tests/spec/polyline", "tests/spec/snapshot", "tests/spec/zoom-to-feature", "tests/spec/deep-extend", "tests/spec/extensions"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
//# sourceMappingURL=tests.max.js.map