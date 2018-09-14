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
define("ol3-fun/is-primitive", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function isPrimitive(a) {
        switch (typeof a) {
            case "boolean":
                return true;
            case "number":
                return true;
            case "object":
                return null === a;
            case "string":
                return true;
            case "symbol":
                return true;
            case "undefined":
                return true;
            default:
                throw `unknown type: ${typeof a}`;
        }
    }
    exports.isPrimitive = isPrimitive;
});
define("ol3-fun/is-cyclic", ["require", "exports", "ol3-fun/is-primitive"], function (require, exports, is_primitive_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function isCyclic(a) {
        if (is_primitive_1.isPrimitive(a))
            return false;
        let test = (o, history) => {
            if (is_primitive_1.isPrimitive(o))
                return false;
            if (0 <= history.indexOf(o)) {
                return true;
            }
            return Object.keys(o).some(k => test(o[k], [o].concat(history)));
        };
        return Object.keys(a).some(k => test(a[k], [a]));
    }
    exports.isCyclic = isCyclic;
});
define("ol3-fun/deep-extend", ["require", "exports", "ol3-fun/is-cyclic", "ol3-fun/is-primitive"], function (require, exports, is_cyclic_1, is_primitive_2) {
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
    function isArray(val) {
        return Array.isArray(val);
    }
    function isHash(val) {
        return !is_primitive_2.isPrimitive(val) && !canClone(val) && !isArray(val);
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
    class Merger {
        constructor(trace, history) {
            this.trace = trace;
            this.history = history;
        }
        deepExtend(target, source) {
            if (target === source)
                return target;
            if (!target || (!isHash(target) && !isArray(target))) {
                throw "first argument must be an object";
            }
            if (!source || (!isHash(source) && !isArray(source))) {
                throw "second argument must be an object";
            }
            if (typeof source === "function") {
                return target;
            }
            this.push(source);
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
        cloneArray(val) {
            this.push(val);
            return val.map(v => (isArray(v) ? this.cloneArray(v) : canClone(v) ? clone(v) : v));
        }
        push(a) {
            if (is_primitive_2.isPrimitive(a))
                return;
            if (-1 < this.history.indexOf(a)) {
                if (is_cyclic_1.isCyclic(a)) {
                    throw `circular reference detected`;
                }
            }
            else
                this.history.push(a);
        }
        mergeChild(key, target, sourceValue) {
            let targetValue = target[key];
            if (sourceValue === targetValue)
                return;
            if (is_primitive_2.isPrimitive(sourceValue)) {
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
                sourceValue = this.cloneArray(sourceValue);
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
define("index", ["require", "exports", "ol3-fun/common", "ol3-fun/navigation", "ol3-fun/parse-dms", "ol3-fun/slowloop", "ol3-fun/deep-extend"], function (require, exports, common_2, navigation_1, parse_dms_1, slowloop_1, deep_extend_1) {
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
        slowloop: slowloop_1.slowloop,
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
define("ol3-fun/extensions", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Extensions {
        constructor() {
            this.hash = new WeakMap(null);
        }
        isExtended(o) {
            return this.hash.has(o);
        }
        extend(o, ext) {
            let hashData = this.hash.get(o);
            if (!hashData) {
                hashData = {};
                this.hash.set(o, hashData);
            }
            ext && Object.keys(ext).forEach(k => (hashData[k] = ext[k]));
            return hashData;
        }
        bind(o1, o2) {
            if (this.isExtended(o1)) {
                if (this.isExtended(o2)) {
                    if (this.hash.get(o1) === this.hash.get(o2))
                        return;
                    throw "both objects already bound";
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
//# sourceMappingURL=index.max.js.map