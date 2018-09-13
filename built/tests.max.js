define("ol3-fun/slowloop", ["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
    function slowloop(functions, interval, cycles) {
        if (interval === void 0) { interval = 1000; }
        if (cycles === void 0) { cycles = 1; }
        var d = $.Deferred();
        var index = 0;
        var cycle = 0;
        if (!functions || 0 >= cycles) {
            d.resolve();
            return d;
        }
        var h = setInterval(function () {
            if (index === functions.length) {
                index = 0;
                if (++cycle === cycles) {
                    d.resolve();
                    clearInterval(h);
                    return;
                }
            }
            try {
                d.notify({ index: index, cycle: cycle });
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
    exports.__esModule = true;
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
        if (a != b)
            console.warn("\"" + a + "\" <> \"" + b + "\"");
        should(a == b, message);
    }
    exports.shouldEqual = shouldEqual;
    function stringify(o) {
        return JSON.stringify(o, null, "\t");
    }
    exports.stringify = stringify;
});
define("ol3-fun/common", ["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
    function uuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    exports.uuid = uuid;
    function asArray(list) {
        var result = new Array(list.length);
        for (var i = 0; i < list.length; i++) {
            result[i] = list[i];
        }
        return result;
    }
    exports.asArray = asArray;
    function toggle(e, className, force) {
        var exists = e.classList.contains(className);
        if (exists && force !== true) {
            e.classList.remove(className);
            return false;
        }
        ;
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
            return (v.split(",").map(function (v) { return parse(v, type[0]); }));
        }
        throw "unknown type: " + type;
    }
    exports.parse = parse;
    function getQueryParameters(options, url) {
        if (url === void 0) { url = window.location.href; }
        var opts = options;
        Object.keys(opts).forEach(function (k) {
            doif(getParameterByName(k, url), function (v) {
                var value = parse(v, opts[k]);
                if (value !== undefined)
                    opts[k] = value;
            });
        });
    }
    exports.getQueryParameters = getQueryParameters;
    function getParameterByName(name, url) {
        if (url === void 0) { url = window.location.href; }
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"), results = regex.exec(url);
        if (!results)
            return null;
        if (!results[2])
            return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }
    exports.getParameterByName = getParameterByName;
    function doif(v, cb) {
        if (v !== undefined && v !== null)
            cb(v);
    }
    exports.doif = doif;
    function mixin(a, b) {
        Object.keys(b).forEach(function (k) { return a[k] = b[k]; });
        return a;
    }
    exports.mixin = mixin;
    function defaults(a) {
        var b = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            b[_i - 1] = arguments[_i];
        }
        b.forEach(function (b) {
            Object.keys(b).filter(function (k) { return a[k] === undefined; }).forEach(function (k) { return a[k] = b[k]; });
        });
        return a;
    }
    exports.defaults = defaults;
    function cssin(name, css) {
        var id = "style-" + name;
        var styleTag = document.getElementById(id);
        if (!styleTag) {
            styleTag = document.createElement("style");
            styleTag.id = id;
            styleTag.type = "text/css";
            document.head.appendChild(styleTag);
            styleTag.appendChild(document.createTextNode(css));
        }
        var dataset = styleTag.dataset;
        dataset["count"] = parseInt(dataset["count"] || "0") + 1 + "";
        return function () {
            dataset["count"] = parseInt(dataset["count"] || "0") - 1 + "";
            if (dataset["count"] === "0") {
                styleTag.remove();
            }
        };
    }
    exports.cssin = cssin;
    function debounce(func, wait, immediate) {
        if (wait === void 0) { wait = 50; }
        if (immediate === void 0) { immediate = false; }
        var timeout;
        return (function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var later = function () {
                timeout = null;
                if (!immediate)
                    func.apply({}, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = window.setTimeout(later, wait);
            if (callNow)
                func.apply({}, args);
        });
    }
    exports.debounce = debounce;
    function html(html) {
        var a = document.createElement("div");
        a.innerHTML = html;
        return (a.firstElementChild || a.firstChild);
    }
    exports.html = html;
    function pair(a1, a2) {
        var result = new Array(a1.length * a2.length);
        var i = 0;
        a1.forEach(function (v1) { return a2.forEach(function (v2) { return result[i++] = [v1, v2]; }); });
        return result;
    }
    exports.pair = pair;
    function range(n) {
        var result = new Array(n);
        for (var i = 0; i < n; i++)
            result[i] = i;
        return result;
    }
    exports.range = range;
    function shuffle(array) {
        var currentIndex = array.length;
        var temporaryValue;
        var randomIndex;
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
    exports.__esModule = true;
    function zoomToFeature(map, feature, options) {
        var promise = $.Deferred();
        options = common_1.defaults(options || {}, {
            duration: 1000,
            padding: 256,
            minResolution: 2 * map.getView().getMinResolution()
        });
        var view = map.getView();
        var currentExtent = view.calculateExtent(map.getSize());
        var targetExtent = feature.getGeometry().getExtent();
        var doit = function (duration) {
            view.fit(targetExtent, {
                size: map.getSize(),
                padding: [options.padding, options.padding, options.padding, options.padding],
                minResolution: options.minResolution,
                duration: duration,
                callback: function () { return promise.resolve(); }
            });
        };
        if (ol.extent.containsExtent(currentExtent, targetExtent)) {
            doit(options.duration);
        }
        else if (ol.extent.containsExtent(currentExtent, targetExtent)) {
            doit(options.duration);
        }
        else {
            var fullExtent = ol.extent.createEmpty();
            ol.extent.extend(fullExtent, currentExtent);
            ol.extent.extend(fullExtent, targetExtent);
            var dscale = ol.extent.getWidth(fullExtent) / ol.extent.getWidth(currentExtent);
            var duration = 0.5 * options.duration;
            view.fit(fullExtent, {
                size: map.getSize(),
                padding: [options.padding, options.padding, options.padding, options.padding],
                minResolution: options.minResolution,
                duration: duration
            });
            setTimeout(function () { return doit(0.5 * options.duration); }, duration);
        }
        return promise;
    }
    exports.zoomToFeature = zoomToFeature;
});
define("ol3-fun/parse-dms", ["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
    function decDegFromMatch(m) {
        var signIndex = {
            "-": -1,
            "N": 1,
            "S": -1,
            "E": 1,
            "W": -1
        };
        var latLonIndex = {
            "-": "",
            "N": "lat",
            "S": "lat",
            "E": "lon",
            "W": "lon"
        };
        var degrees, minutes, seconds, sign, latLon;
        sign = signIndex[m[2]] || signIndex[m[1]] || signIndex[m[6]] || 1;
        degrees = Number(m[3]);
        minutes = m[4] ? Number(m[4]) : 0;
        seconds = m[5] ? Number(m[5]) : 0;
        latLon = latLonIndex[m[1]] || latLonIndex[m[6]];
        if (!inRange(degrees, 0, 180))
            throw 'Degrees out of range';
        if (!inRange(minutes, 0, 60))
            throw 'Minutes out of range';
        if (!inRange(seconds, 0, 60))
            throw 'Seconds out of range';
        return {
            decDeg: sign * (degrees + minutes / 60 + seconds / 3600),
            latLon: latLon
        };
    }
    function inRange(value, a, b) {
        return value >= a && value <= b;
    }
    function parse(dmsString) {
        var _a;
        dmsString = dmsString.trim();
        var dmsRe = /([NSEW])?(-)?(\d+(?:\.\d+)?)[°º:d\s]?\s?(?:(\d+(?:\.\d+)?)['’‘′:]\s?(?:(\d{1,2}(?:\.\d+)?)(?:"|″|’’|'')?)?)?\s?([NSEW])?/i;
        var dmsString2;
        var m1 = dmsString.match(dmsRe);
        if (!m1)
            throw 'Could not parse string';
        if (m1[1]) {
            m1[6] = undefined;
            dmsString2 = dmsString.substr(m1[0].length - 1).trim();
        }
        else {
            dmsString2 = dmsString.substr(m1[0].length).trim();
        }
        var decDeg1 = decDegFromMatch(m1);
        var m2 = dmsString2.match(dmsRe);
        var decDeg2 = m2 && decDegFromMatch(m2);
        if (typeof decDeg1.latLon === 'undefined') {
            if (!isNaN(decDeg1.decDeg) && decDeg2 && isNaN(decDeg2.decDeg)) {
                return decDeg1.decDeg;
            }
            else if (!isNaN(decDeg1.decDeg) && decDeg2 && !isNaN(decDeg2.decDeg)) {
                decDeg1.latLon = 'lat';
                decDeg2.latLon = 'lon';
            }
            else {
                throw 'Could not parse string';
            }
        }
        if (typeof decDeg2.latLon === 'undefined') {
            decDeg2.latLon = decDeg1.latLon === 'lat' ? 'lon' : 'lat';
        }
        return _a = {},
            _a[decDeg1.latLon] = decDeg1.decDeg,
            _a[decDeg2.latLon] = decDeg2.decDeg,
            _a;
    }
    exports.parse = parse;
});
define("index", ["require", "exports", "ol3-fun/common", "ol3-fun/navigation", "ol3-fun/parse-dms", "ol3-fun/slowloop"], function (require, exports, common_2, navigation_1, parse_dms_1, slowloop_2) {
    "use strict";
    var index = {
        asArray: common_2.asArray,
        cssin: common_2.cssin,
        debounce: common_2.debounce,
        defaults: common_2.defaults,
        doif: common_2.doif,
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
            parse: parse_dms_1.parse
        },
        navigation: {
            zoomToFeature: navigation_1.zoomToFeature
        }
    };
    return index;
});
define("tests/spec/api", ["require", "exports", "tests/base", "index"], function (require, exports, base_1, API) {
    "use strict";
    exports.__esModule = true;
    base_1.describe("API", function () {
        base_1.it("full api exists", function () {
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
            ].every(function (f) { return typeof f === "function"; }), true, "API functions exist");
        });
    });
});
define("tests/spec/common", ["require", "exports", "tests/base", "ol3-fun/common"], function (require, exports, base_2, common_3) {
    "use strict";
    exports.__esModule = true;
    function sum(list) {
        return list.reduce(function (a, b) { return a + b; }, 0);
    }
    describe("asArray tests", function () {
        it("asArray", function (done) {
            if (!document)
                return;
            document.body.appendChild(document.createElement("div"));
            var list = document.getElementsByTagName("div");
            var result = common_3.asArray(list);
            base_2.should(result.length === list.length, "array size matches list size");
            done();
        });
    });
    describe("uuid tests", function () {
        it("uuid", function () {
            base_2.should(common_3.uuid().length === 36, "uuid has 36 characters");
        });
    });
    describe("pair tests", function () {
        it("empty test", function () {
            base_2.should(0 === common_3.pair([], []).length, "empty result");
            base_2.should(0 === common_3.pair([1], []).length, "empty result");
            base_2.should(0 === common_3.pair([], [1]).length, "empty result");
        });
        it("ensures all combinations", function () {
            var A = [1, 3, 5], B = [7, 11, 13], result = common_3.pair(A, B);
            base_2.should((A.length * sum(B) + B.length * sum(A)) === sum(result.map(function (v) { return v[0] + v[1]; })), "create product from two vectors");
        });
    });
    describe("range tests", function () {
        it("empty test", function () {
            base_2.should(0 === common_3.range(0).length, "empty result");
        });
        it("size tests", function () {
            base_2.should(1 === common_3.range(1).length, "single item");
            base_2.should(10 === common_3.range(10).length, "ten items");
        });
        it("content tests", function () {
            base_2.should(45 === sum(common_3.range(10)), "range '10' contains 0..9");
        });
    });
    describe("shuffle tests", function () {
        it("empty test", function () {
            base_2.should(0 === common_3.shuffle([]).length, "empty result");
        });
        it("size tests", function () {
            base_2.should(1 === common_3.shuffle(common_3.range(1)).length, "single item");
            base_2.should(10 === common_3.shuffle(common_3.range(10)).length, "ten items");
        });
        it("content tests", function () {
            base_2.should(45 === sum(common_3.shuffle(common_3.range(10))), "range '10' contains 0..9");
        });
    });
    describe("toggle tests", function () {
        it("toggle", function () {
            var div = document.createElement("div");
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
    describe("parse tests", function () {
        it("parse", function () {
            var num = 0;
            var bool = false;
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
    describe("getQueryParameters tests", function () {
        it("getQueryParameters", function () {
            var options = { a: "" };
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
    describe("getParameterByName tests", function () {
        it("getParameterByName", function () {
            base_2.shouldEqual(common_3.getParameterByName("a", "foo?a=1"), "1", "a=1");
            base_2.shouldEqual(common_3.getParameterByName("b", "foo?a=1"), null, "b does not exist");
        });
    });
    describe("doif tests", function () {
        var die = function (n) { throw "doif callback not expected to execute: " + n; };
        var spawn = function () {
            var v = true;
            return function () { return v = !v; };
        };
        it("doif false tests", function () {
            common_3.doif(undefined, die);
            common_3.doif(null, die);
        });
        it("doif empty tests", function () {
            var c = spawn();
            common_3.doif(0, c);
            base_2.shouldEqual(c(), true, "0 invokes doif");
            common_3.doif(false, c);
            base_2.shouldEqual(c(), true, "false invokes doif");
            common_3.doif({}, c);
            base_2.shouldEqual(c(), true, "{} invokes doif");
        });
        it("doif value tests", function () {
            common_3.doif(0, function (v) { return base_2.shouldEqual(v, 0, "0"); });
            common_3.doif({ a: 100 }, function (v) { return base_2.shouldEqual(v.a, 100, "a = 100"); });
        });
    });
    describe("mixin tests", function () {
        it("simple mixins", function () {
            base_2.shouldEqual(common_3.mixin({ a: 1 }, { b: 2 }).a, 1, "a=1");
            base_2.shouldEqual(common_3.mixin({ a: 1 }, { b: 2 }).b, 2, "b=2");
            base_2.shouldEqual(common_3.mixin({ a: 1 }, { b: 2 }).c, undefined, "c undefined");
            base_2.shouldEqual(common_3.mixin({ a: 1 }, {}).a, 1, "a=1");
            base_2.shouldEqual(common_3.mixin({}, { b: 2 }).b, 2, "b=2");
        });
        it("nested mixins", function () {
            var _a;
            base_2.shouldEqual(common_3.mixin({ vermont: { burlington: true } }, (_a = {}, _a["south carolina"] = { greenville: true }, _a))["south carolina"].greenville, true, "greenville is in south carolina");
            base_2.shouldEqual(common_3.mixin({ vermont: { burlington: true } }, { vermont: { greenville: false } }).vermont.greenville, false, "greenville is not in vermont");
            base_2.shouldEqual(common_3.mixin({ vermont: { burlington: true } }, { vermont: { greenville: false } }).vermont.burlington, undefined, "second vermont completely wipes out 1st");
        });
    });
    describe("defaults tests", function () {
        it("defaults", function () {
            base_2.shouldEqual(common_3.defaults({ a: 1 }, { a: 2, b: 3 }).a, 1, "a = 1");
            base_2.shouldEqual(common_3.defaults({ a: 1 }, { a: 2, b: 3 }).b, 3, "b = 3");
            base_2.shouldEqual(common_3.defaults({}, { a: 2, b: 3 }).a, 2, "a = 2");
        });
    });
    describe("cssin tests", function () {
        it("hides the body", function () {
            var handles = [];
            handles.push(common_3.cssin("css1", "body {display: none}"));
            handles.push(common_3.cssin("css1", "body {display: block}"));
            base_2.shouldEqual(getComputedStyle(document.body).display, "none", "body is hidden, 1st css1 wins");
            handles.shift()();
            base_2.shouldEqual(getComputedStyle(document.body).display, "none", "body is still hidden, 1st css1 still registered");
            handles.shift()();
            base_2.shouldEqual(getComputedStyle(document.body).display, "block", "body is no longer hidden, css1 destroyed");
        });
    });
    describe("html tests", function () {
        it("tableless tr test", function () {
            var markup = "<tr>A<td>B</td></tr>";
            var tr = common_3.html(markup);
            base_2.should(tr.nodeValue === "AB", "setting innerHTML on a 'div' will not assign tr elements");
        });
        it("table tr test", function () {
            var markup = "<table><tbody><tr><td>Test</td></tr></tbody></table>";
            var table = common_3.html(markup);
            base_2.should(table.outerHTML === markup, "preserves tr when within a table");
        });
        it("canvas test", function () {
            var markup = "<canvas width=\"100\" height=\"100\"></canvas>";
            var canvas = common_3.html(markup);
            base_2.should(canvas.outerHTML === markup, "canvas markup preserved");
            base_2.should(!!canvas.getContext("2d"), "cnvas has 2d context");
        });
    });
});
define("tests/spec/slowloop", ["require", "exports", "tests/base", "ol3-fun/common"], function (require, exports, base_3, common_4) {
    "use strict";
    exports.__esModule = true;
    base_3.describe("slowloop", function () {
        base_3.it("slowloop empty", function (done) {
            try {
                base_3.slowloop(null);
                base_3.should(false, "slowloop requires an array");
            }
            catch (_a) {
                done();
            }
        });
        base_3.it("slowloop with progress", function () {
            var progressCount = 0;
            return base_3.slowloop(common_4.range(7).map(function (n) { return function () { }; }), 0, 5)
                .progress(function (args) {
                console.log(args);
                progressCount++;
            })
                .then(function () {
                base_3.shouldEqual(progressCount, 7 * 5, "progress callbacks");
            });
        });
        base_3.it("slowloop with exceptions", function () {
            return base_3.slowloop([
                function () {
                    throw "exception occured in slowloop";
                }
            ])
                .then(function () { return base_3.should(false, "failure expected"); })["catch"](function (ex) { return base_3.should(!!ex, ex); });
        });
        base_3.it("slowloop with abort", function () {
            return base_3.slowloop([
                function () {
                    base_3.should(false, "aborted from inside");
                }
            ], 10)
                .reject("aborted from outside")["catch"](function (ex) { return base_3.shouldEqual(ex, "aborted from outside", "aborted from outside"); });
        });
        base_3.it("slowloop fast", function (done) {
            var count = 0;
            var inc = function () { return count++; };
            base_3.slowloop([inc, inc, inc], 0, 100).then(function () {
                base_3.shouldEqual(count, 300, "0 ms * 100 iterations * 3 functions => 300 invocations");
                done();
            });
        }).timeout(2000);
        base_3.it("slowloop iterations", function (done) {
            var count = 0;
            var inc = function () { return count++; };
            base_3.slowloop([inc]).then(function () {
                base_3.shouldEqual(count, 1, "defaults to a single iteration");
                base_3.slowloop([inc], 0, 2).then(function () {
                    base_3.shouldEqual(count, 3, "performs two iterations");
                    base_3.slowloop([inc], 0, 0).then(function () {
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
    exports.__esModule = true;
    describe("ol/Map", function () {
        it("ol/Map", function () {
            base_4.should(!!ol.Map, "Map");
        });
    });
});
define("tests/spec/parse-dms", ["require", "exports", "tests/base", "ol3-fun/parse-dms"], function (require, exports, base_5, parse_dms_2) {
    "use strict";
    exports.__esModule = true;
    base_5.describe("parse-dms", function () {
        base_5.it("parse", function () {
            var dms = parse_dms_2.parse("10 5'2\" 10");
            if (typeof dms === "number")
                throw "lat-lon expected";
            base_5.should(dms.lat === 10.08388888888889, "10 degrees 5 minutes 2 seconds");
            base_5.should(dms.lon === 10, "10 degrees 0 minutes 0 seconds");
        });
    });
});
define("ol3-fun/google-polyline", ["require", "exports"], function (require, exports) {
    "use strict";
    var PolylineEncoder = (function () {
        function PolylineEncoder() {
        }
        PolylineEncoder.prototype.encodeCoordinate = function (coordinate, factor) {
            coordinate = Math.round(coordinate * factor);
            coordinate <<= 1;
            if (coordinate < 0) {
                coordinate = ~coordinate;
            }
            var output = '';
            while (coordinate >= 0x20) {
                output += String.fromCharCode((0x20 | (coordinate & 0x1f)) + 0x3f);
                coordinate >>= 5;
            }
            output += String.fromCharCode(coordinate + 0x3f);
            return output;
        };
        PolylineEncoder.prototype.decode = function (str, precision) {
            if (precision === void 0) { precision = 5; }
            var index = 0, lat = 0, lng = 0, coordinates = [], latitude_change, longitude_change, factor = Math.pow(10, precision);
            while (index < str.length) {
                var byte = 0;
                var shift = 0;
                var result = 0;
                do {
                    byte = str.charCodeAt(index++) - 0x3f;
                    result |= (byte & 0x1f) << shift;
                    shift += 5;
                } while (byte >= 0x20);
                var latitude_change_1 = ((result & 1) ? ~(result >> 1) : (result >> 1));
                shift = result = 0;
                do {
                    byte = str.charCodeAt(index++) - 0x3f;
                    result |= (byte & 0x1f) << shift;
                    shift += 5;
                } while (byte >= 0x20);
                longitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));
                lat += latitude_change_1;
                lng += longitude_change;
                coordinates.push([lat / factor, lng / factor]);
            }
            return coordinates;
        };
        PolylineEncoder.prototype.encode = function (coordinates, precision) {
            if (precision === void 0) { precision = 5; }
            if (!coordinates.length)
                return '';
            var factor = Math.pow(10, precision), output = this.encodeCoordinate(coordinates[0][0], factor) + this.encodeCoordinate(coordinates[0][1], factor);
            for (var i = 1; i < coordinates.length; i++) {
                var a = coordinates[i], b = coordinates[i - 1];
                output += this.encodeCoordinate(a[0] - b[0], factor);
                output += this.encodeCoordinate(a[1] - b[1], factor);
            }
            return output;
        };
        return PolylineEncoder;
    }());
    return PolylineEncoder;
});
define("ol3-fun/ol3-polyline", ["require", "exports", "openlayers"], function (require, exports, ol) {
    "use strict";
    var Polyline = ol.format.Polyline;
    var PolylineEncoder = (function () {
        function PolylineEncoder(precision, stride) {
            if (precision === void 0) { precision = 5; }
            if (stride === void 0) { stride = 2; }
            this.precision = precision;
            this.stride = stride;
        }
        PolylineEncoder.prototype.flatten = function (points) {
            var nums = new Array(points.length * this.stride);
            var i = 0;
            points.forEach(function (p) { return p.map(function (p) { return nums[i++] = p; }); });
            return nums;
        };
        PolylineEncoder.prototype.unflatten = function (nums) {
            var points = new Array(nums.length / this.stride);
            for (var i = 0; i < nums.length / this.stride; i++) {
                points[i] = nums.slice(i * this.stride, (i + 1) * this.stride);
            }
            return points;
        };
        PolylineEncoder.prototype.round = function (nums) {
            var factor = Math.pow(10, this.precision);
            return nums.map(function (n) { return Math.round(n * factor) / factor; });
        };
        PolylineEncoder.prototype.decode = function (str) {
            var nums = Polyline.decodeDeltas(str, this.stride, Math.pow(10, this.precision));
            return this.unflatten(this.round(nums));
        };
        PolylineEncoder.prototype.encode = function (points) {
            return Polyline.encodeDeltas(this.flatten(points), this.stride, Math.pow(10, this.precision));
        };
        return PolylineEncoder;
    }());
    return PolylineEncoder;
});
define("tests/spec/polyline", ["require", "exports", "tests/base", "ol3-fun/google-polyline", "ol3-fun/ol3-polyline", "ol3-fun/common"], function (require, exports, base_6, GooglePolylineEncoder, PolylineEncoder, common_5) {
    "use strict";
    exports.__esModule = true;
    describe("GooglePolylineEncoder", function () {
        it("GooglePolylineEncoder", function () {
            base_6.should(!!GooglePolylineEncoder, "GooglePolylineEncoder");
        });
        var points = common_5.pair(common_5.range(10), common_5.range(10));
        var poly = new GooglePolylineEncoder();
        var encoded = poly.encode(points);
        var decoded = poly.decode(encoded);
        base_6.shouldEqual(encoded.length, 533, "encoding is 533 characters");
        base_6.shouldEqual(base_6.stringify(decoded), base_6.stringify(points), "encode->decode");
    });
    describe("PolylineEncoder", function () {
        it("PolylineEncoder", function () {
            base_6.should(!!PolylineEncoder, "PolylineEncoder");
        });
        var points = common_5.pair(common_5.range(10), common_5.range(10));
        var poly = new PolylineEncoder();
        var encoded = poly.encode(points);
        var decoded = poly.decode(encoded);
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
        var style = feature.getStyle();
        if (!style) {
            var styleFn = feature.getStyleFunction();
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
    var Snapshot = (function () {
        function Snapshot() {
        }
        Snapshot.render = function (canvas, feature) {
            feature = feature.clone();
            var geom = feature.getGeometry();
            var extent = geom.getExtent();
            var _a = ol.extent.getCenter(extent), cx = _a[0], cy = _a[1];
            var _b = [ol.extent.getWidth(extent), ol.extent.getHeight(extent)], w = _b[0], h = _b[1];
            var isPoint = w === 0 || h === 0;
            var ff = 1 / (window.devicePixelRatio || 1);
            var scale = isPoint ? 1 : Math.min(ff * canvas.width / w, ff * canvas.height / h);
            geom.translate(-cx, -cy);
            geom.scale(scale, -scale);
            geom.translate(Math.ceil(ff * canvas.width / 2), Math.ceil(ff * canvas.height / 2));
            console.log(scale, cx, cy, w, h, geom.getCoordinates());
            var vtx = ol.render.toContext(canvas.getContext("2d"));
            var styles = getStyle(feature);
            if (!Array.isArray(styles))
                styles = [styles];
            styles.forEach(function (style) { return vtx.drawFeature(feature, style); });
        };
        Snapshot.snapshot = function (feature, size) {
            if (size === void 0) { size = 128; }
            var canvas = document.createElement("canvas");
            canvas.width = canvas.height = size;
            this.render(canvas, feature);
            return canvas.toDataURL();
        };
        return Snapshot;
    }());
    return Snapshot;
});
define("tests/spec/snapshot", ["require", "exports", "tests/base", "ol3-fun/snapshot", "openlayers", "ol3-fun/common"], function (require, exports, base_7, Snapshot, ol, common_6) {
    "use strict";
    exports.__esModule = true;
    var pointData = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAFdUlEQVR4Xu1aXUybVRh+3hiWxiX+ZNSMECvjJxiqyaROyq5M2MWUZGyDLEZg0WzhJ2QELharjmbWGgqOOTRxTMDIGHpBpIwE40Un3ujA0EmUYkhcRpoJRObfJkJG9Ji3+1gWoP2+rudrSvq9l/2e857nPOc5/yUkeVCStx+GAIYDklwBYwgkuQGMSdAYAsYQSHIFjCGQ5AYwVgFjCBhDIMkViPsQEEKkANgFIB2AGcCjAP4AsADgOoBxIlqJV7/ETQAhRCWAlwA8D+DBCA38G8DXAD4jok/1FkJ3AYQQVgDdAAruozHfAqgloh/uo6ymIroKIIQ4DOBjAA9oYrMx6F8AVUTEeaSHLgIIITjvOwBel8jYTURNEvOFUuklQDMAh2yyAJqJ6A2ZeaULIIR4GUCfTJJrch0ion5Z+aUKIIRIA/CzyiwfK/d/AGQQES+bMYdsAc4D4OVO7/iEiF6VUYk0AYQQvMyNyiClMUc+EX2vERsWJlOAqHp/enoaY2NjmJubQ1paGgoKCpCbmxtNe3qI6JVoCmyElSKAsuz9CiBVC6GzZ8+ioaEBt2/fvgvfsmUL2tvbUVNToyUFYxaI6DGt4HA4WQLw3v47LWQ6OjpQW1sbFnru3DlUVVVpScWYZ4hoQitYTwfwjq9HjQjbPTMzE8vLy2GhJpMJS0tLaqlWvzuIqEUrWE8BGgC8p0ZkYGAApaWlajAIIVQxCuArIirSCtZTgDcBuNWInDp1CsePH1eDRSPA70S0TTVhBICsOYAH9YdqRLxeLw4ePKgGi0aAL4noBdWEcRCAW/W5GpHZ2VlkZWXJnAP4qNyhVm+k77IckKVsgVW58Cwfaanr7OzE0aNHVfMogGwiuqoVrNscwImFEDMAntBCpr+/H/X19Zifn78LT09Px5kzZ1BWVqYlBWOuE9HjWsHhcFIcoAjQCUBz162srGB0dBRXrlxBfn4+7HY7UlL4ulBzfERE1ZrRYYAyBXgOwFishKIov4uIxqPAbwiVJoDigosA9sVKSkP5QSI6oAGnCpEtwJMAflKtNTbAfwDyiGg6tjR3SksVQHEBX4XxlZhe8RoRtcpKLl0AJjY+Pt5jMpn4fICtW7ciIyMjIt+ZmZkQzmzmd5KI0U5EvO2WFnoIwHvddT3Ep8Dq6vWT9tDQEEpKSkINunbt2jqxFhYW4Ha7MTg4OB8MBrMBLEprvR5DAMD7gUDgWF5e3l2efO5vaWnB7t27UVRUhMnJSRARrFYr+vr6sH37drALcnJyYLFYQuUWFxdDYjQ3Nwuz2Uw3b96E0+l8GsBkwgvg9/uPDQ8PM+He1NTUhzweT0lhYSFaW1tx48YN8DcOm82GiooKNDY2btgmi8XyZzAYfMTv94fKOJ1OP4BnN5MAfE2Grq6uwyyA3W7/y+v1Pswu4JiamkJxcTF/DzmAY//+/di27c4B79KlS6Hfjxw5glu3bqGurg69vb1Sh63UZErPrBsCq+TZ4nwbdPr06W+6u7t/GxkZ2Xf58uWQ1VcF2Lt3L5qamrw7duw4UF5ezlvmoMvlsigO4MliaDM5YJXrFwBGXC7Xu9zjNputgj/4fL4Lq4BVAViMPXv2VFRWVl5wOBxwOBxXT548maUIsOnmgHsJP+VyuX5kB3g8nom2trZfAoFA8VoHqAjwNgDnZnLA2h477/P5Ku+dA6xW64TP59sZzgEnTpyYcLvdO7Ozs0MridPp5JtgKa9CLKQecwCfBfhMwLY/tGbd5p0Ov/AeU3rxA+Uxhd8SAwB4m8ui2QHUKa9Mbyn/KHkxTM6YDKGHADERindhQ4B4K55o9RkOSLQeiTcfwwHxVjzR6jMckGg9Em8+hgPirXii1Zf0DvgfGiXvUAsr6xQAAAAASUVORK5CYII=";
    var circleData = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAHzUlEQVR4XuWbaWxVRRTHf+OGS1BRUQuCuICRRoMWFTRugEgCVo2IQqEgUAmpiCIgJuoHiAmgKEowBlsXwCLuEv2g0kaNti7RaBTFjaBScYtRq1FRueZ/79z75r32tfe9PmrpPclL+96dOzPnP+fMnG0MBSVvP2AUcIn9HFig7n8GNgBPAS+C+aNA/WIK05F3EFAJ3AAckr3Pb4Hv7ec74C9gJyDcDgeOsH+PbG1aPwLLgXvANLV3/u0EwDsMuA6YBbSw2l8EC8ZLwEYg7nyF5zBgJHABcFxLfP4CrACWgZGE5EV5AuB1A24HptvlcwbXyq4NFoiv8ppU85f6AtcCE62UpLX4HXgAmAdGIpUT5QGA1x94EjgpfaQvgaVAtRXtnOYRs7FwnwbcBByV+c4HwGVgPovZmd8sRwC8CcAq4ID0QaYCa4B/chm7HW33ttKghW8mDVPAPBG385gAeHsCd9uNzvYtZm8GlsQdaxe00/TnA7cBmmJEK4HZYP5ta9AYAHh7AOuBsanOGoFxQH1b/XfQ8zPtCalTJKJHgHIwOmayUhsA+MyvBspSPWg3vwL4qYOYiztMT6AGGJETCK0A0BLzDwHSdy/urDq4ndjRvjAlNghZAMjG/FUdzFC+wz0YG4RsAGhncXY3nXrS+VbVKd/Z7oL3pLmPBadiiuaDke2SRi0A4Mns+gjYJ2hZB1zYgUdcofDYy1qh54cd7gCKwXzujpABgC/6bwCnBY22AqcAeVuaheImz34OBt4FjgnffwsYAibaxDIBuBFYHLSWuA8B3s5z8M7y2ul2TSNW54JZFs7OAcA7EXgvJfoya4VHV6A7rKPq85KmCi4A8rcvCtiVFzfQtu0KAGg72wQcHzKzAczF+mIB8I4FtDnY7+cBr3QFzh0e5F7Xht+1B/QFsy0E4C7r19tGadZUFwJCJ1p0KiiOMNeAtz+wPRXQkGRIG7oiKVL3dMjYr0CRALjGRlaAbYFkdFpTt72LolNecYsoljBTAHwYGAiiOYC0oSvTPBu48Xl8XwA4no1icZKMrkwKXSqc6JPnAPAacHZX5tzh7XVAMQT/2AslQAagYm1JIBl5UoU0AGQDPZcE7gGddM9kAiDdiBu3391xOhRQfiWSAAU4FWlNEgV7v90DXrApvSQBIJ5HhgAo4uMEfROBg/Ksl4YAPJwZQ0sABErkTAwBUB5BFnGS6D5gRgiA4p8LksR9kFRmTgiAxKE8YQAocTQhBGCd/yVZ9Kif4bLH4Js2AJokCBTsHRwC8IMtTUkSAMpt9nCdIdXp/JkQBFIuseMNyhWWS5wEUlxQ8cE0b/B6W3yVBAAU+QpyI44EvAqcmwTuraSfFQGgMpI9gkCoqt46W+FDoddENYjfhCmQnZIAJ1g+w9ZAFXrQztTfTODecEJ1AkBcyzAGkuAWq8RneAhAhQDoAcgQsGVWJwCftmvJNm3axMCByi1CU1MTlZWVNDY2smLFChYvXsyaNTK9s1NVVRX9+vVjxIhCZ6gGAJ+EA0v1e4apscAw9kl+clplRU5giPnt27dHkxczo0aNory8nLq64Ohpi3YdAIoD+jlR0Vowk9zkqJbdSkGJLSxoa6rpzydNmsSCBQuYNWtWM2aHDRsWScDkyZMZNGgQ3bt3Z/369ehZ79692bFjB0uWLKFXr16RBGzcuJHhwwORra2tbYdUKAyucLhPWv0BYLa46fEqW4cKNERx81wgWLhwIaNHj6akRACmUyYAeioRF4NFRUUUFxejlR86dCgNDQ0+APX19ZSVlVFRUeEDKunSs+nTVaKcK70DnBq+tAqM9j63VNZTwmxLKjqqUjNFiuJTNgkQYzU1NWkSsHXrVp8RARD+H44UqoB+nzZNtcEpyk8K1IfW16e/gT5gVNWdWSvsqfzcCQ31tmdmfBBa2gPGjRvHypUrKS0t9TdBqYALQCgNkiCt+ObNm+nWrVszCYg/C7elkr1KiEa0HIzMXp8ya4RkJWgv6B48VoGRdCe3KvS2TgEXAKnG6tWrY+0BmlF1dXUOKqDqcrm9UWG7Ep/9wejWRksA6DdvdHqKaHcOlqh0dry7+mPAPO/+kK1QcpEtBbdtpRUKnO5ONDvTuVsE5tZMDrIBoN9118WxRK4G7t9NEKjINOll/o106wNbUYHwkX8RSmeHc2HnTmBuJ64gUQWIqmHl7kakkrcSMFFRQAwViEDQ0ajbF2ekXlIG+fJOGD3aF3gcGOPyp2DnWFWDZRPdOBcmVGSn3JnTs0qJh3aiahIJqy5vBP6HJdn048GoMDIrxQDAPxnUTlUFkn9LXwPSNXmQ/yepkFt7Ux93EkvBxCpzjQlApBLiWK6zlM3Ss/baoADpSDraXs0rdQeVjT8VjG65xKIcAfClQVdjdXPMgVzRZJ25qsn9ONbA+TdSSbNKebQPSe8zRdLkJJJ5AOCDoOLKW6xKqDDfIVmP8iF0ebJQ4TXdB5JBM9l1aMIxpeOKcC4Ek3NcP08AIpVQ9ETScE7zFZXPITBkQOlOozbOVvcjpwuZsFppmbC6mXsykIFz0FqRXIm8jrq8qJ0AREAo0K57rVcCko4WSGU4cjMEhi5/pzkoQD8r0mJauKbdA3T701VZXeNbA+blvLh2XioQABEQcqIkq9osB7d3chnvy6vRdr8OzG+F6vs/cM4xojBcMyUAAAAASUVORK5CYII=";
    function show(data) {
        document.body.appendChild(common_6.html("<img src=\"" + data + "\" />"));
    }
    function circle(radius, points) {
        if (radius === void 0) { radius = 1; }
        if (points === void 0) { points = 36; }
        if (points < 3)
            throw "a circle must contain at least three points";
        if (radius <= 0)
            throw "a circle must have a positive radius";
        var a = 0;
        var dr = (2 * Math.PI) / (points - 1);
        var result = new Array(points);
        for (var i = 0; i < points - 1; i++) {
            result[i] = [radius * Math.sin(a), radius * Math.cos(a)];
            a += dr;
        }
        result[result.length - 1] = result[0];
        return result;
    }
    describe("Snapshot", function () {
        it("Snapshot", function () {
            base_7.should(!!Snapshot, "Snapshot");
            base_7.should(!!Snapshot.render, "Snapshot.render");
            base_7.should(!!Snapshot.snapshot, "Snapshot.snapshot");
        });
        it("Converts a point to image data", function () {
            var feature = new ol.Feature(new ol.geom.Point([0, 0]));
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
                        width: 2
                    }),
                    offsetY: 16
                })
            }));
            var data = Snapshot.snapshot(feature, 64);
            show(data);
            if (1 === window.devicePixelRatio) {
                if (data !== pointData)
                    show(pointData);
                base_7.shouldEqual(data, pointData, "point data as expected");
            }
        });
        it("Converts a triangle to image data", function () {
            var points = circle(50, 4);
            var feature = new ol.Feature(new ol.geom.Polygon([points]));
            feature.setStyle(createStyle("Triangle"));
            var data = Snapshot.snapshot(feature, 64);
            show(data);
        });
        it("Converts a diamond to image data", function () {
            var points = circle(50, 5);
            var feature = new ol.Feature(new ol.geom.Polygon([points]));
            feature.setStyle(createStyle("Diamond"));
            var data = Snapshot.snapshot(feature, 64);
            show(data);
        });
        it("Converts a polygon to image data", function () {
            var geom = new ol.geom.Polygon([circle(3 + 100 * Math.random())]);
            var feature = new ol.Feature(geom);
            base_7.shouldEqual(feature.getGeometry(), geom, "geom still assigned");
            feature.setStyle(createStyle("Circle"));
            var originalCoordinates = base_7.stringify(geom.getCoordinates());
            var data = Snapshot.snapshot(feature, 64);
            console.log(data);
            base_7.should(!!data, "snapshot returns data");
            show(data);
            var finalCoordinates = base_7.stringify(geom.getCoordinates());
            base_7.shouldEqual(originalCoordinates, finalCoordinates, "coordinates unchanged");
            base_7.shouldEqual(feature.getGeometry(), geom, "geom still assigned");
            if (1 === window.devicePixelRatio) {
                if (data !== pointData)
                    show(circleData);
                base_7.shouldEqual(data, circleData, "circle data as expected");
            }
        });
    });
    function createStyle(text) {
        if (text === void 0) { text = ""; }
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
                    width: 2
                }),
                offsetY: 16
            })
        });
    }
});
define("tests/spec/zoom-to-feature", ["require", "exports", "openlayers", "tests/base", "ol3-fun/navigation"], function (require, exports, ol, base_8, navigation_2) {
    "use strict";
    exports.__esModule = true;
    describe("zoomToFeature", function () {
        it("zoomToFeature", function (done) {
            base_8.should(!!navigation_2.zoomToFeature, "zoomToFeature");
            var map = new ol.Map({
                view: new ol.View({
                    zoom: 0,
                    center: [0, 0]
                })
            });
            var feature = new ol.Feature();
            var geom = new ol.geom.Point([100, 100]);
            feature.setGeometry(geom);
            map.once("postrender", function () {
                var res = map.getView().getResolution();
                var zoom = map.getView().getZoom();
                navigation_2.zoomToFeature(map, feature, {
                    duration: 200,
                    minResolution: res / 4
                }).then(function () {
                    var _a = map.getView().getCenter(), cx = _a[0], cy = _a[1];
                    base_8.should(map.getView().getZoom() === zoom + 2, "zoom in two because minRes is 1/4 of initial res");
                    base_8.should(cx === 100, "center-x");
                    base_8.should(cy === 100, "center-y");
                    done();
                });
            });
        });
    });
});
define("tests/index", ["require", "exports", "tests/spec/api", "tests/spec/common", "tests/spec/slowloop", "tests/spec/openlayers-test", "tests/spec/parse-dms", "tests/spec/polyline", "tests/spec/snapshot", "tests/spec/zoom-to-feature"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
});
//# sourceMappingURL=tests.max.js.map