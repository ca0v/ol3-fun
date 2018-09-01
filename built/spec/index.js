define("tests/base", ["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
    function should(result, msg) {
        if (!result)
            throw msg || "oops";
    }
    exports.should = should;
    function stringify(o) {
        return JSON.stringify(o, null, '\t');
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
define("tests/common.test", ["require", "exports", "tests/base", "ol3-fun/common"], function (require, exports, base_1, common_1) {
    "use strict";
    exports.__esModule = true;
    function sum(list) {
        return list.reduce(function (a, b) { return a + b; }, 0);
    }
    describe("expect", function () {
        it("expect", function () {
        });
    });
    describe("common", function () {
        describe("asArray tests", function () {
            it("asArray", function (done) {
                if (!document)
                    return;
                document.body.appendChild(document.createElement("div"));
                var list = document.getElementsByTagName("div");
                var result = common_1.asArray(list);
                base_1.should(result.length === list.length, "array size matches list size");
                done();
            });
        });
        describe("uuid tests", function () {
            it("uuid", function () {
                base_1.should(common_1.uuid().length === 36, "uuid has 36 characters");
            });
        });
        describe("pair tests", function () {
            it("empty test", function () {
                base_1.should(0 === common_1.pair([], []).length, "empty result");
                base_1.should(0 === common_1.pair([1], []).length, "empty result");
                base_1.should(0 === common_1.pair([], [1]).length, "empty result");
            });
            it("ensures all combinations", function () {
                var A = [1, 3, 5], B = [7, 11, 13], result = common_1.pair(A, B);
                base_1.should((A.length * sum(B) + B.length * sum(A)) === sum(result.map(function (v) { return v[0] + v[1]; })), "create product from two vectors");
            });
        });
        describe("range tests", function () {
            it("empty test", function () {
                base_1.should(0 === common_1.range(0).length, "empty result");
            });
            it("size tests", function () {
                base_1.should(1 === common_1.range(1).length, "single item");
                base_1.should(10 === common_1.range(10).length, "ten items");
            });
            it("content tests", function () {
                base_1.should(45 === sum(common_1.range(10)), "range '10' contains 0..9");
            });
        });
    });
    describe("shuffle tests", function () {
        it("empty test", function () {
            base_1.should(0 === common_1.shuffle([]).length, "empty result");
        });
        it("size tests", function () {
            base_1.should(1 === common_1.shuffle(common_1.range(1)).length, "single item");
            base_1.should(10 === common_1.shuffle(common_1.range(10)).length, "ten items");
        });
        it("content tests", function () {
            base_1.should(45 === sum(common_1.shuffle(common_1.range(10))), "range '10' contains 0..9");
        });
    });
    describe("toggle tests", function () {
        it("toggle", function () {
            var div = document.createElement("div");
            base_1.should(div.className === "", "div contains no className");
            common_1.toggle(div, "foo");
            base_1.should(div.className === "foo", "toggle adds");
            common_1.toggle(div, "foo");
            base_1.should(div.className === "", "second toggles removes");
            common_1.toggle(div, "foo", true);
            base_1.should(div.className === "foo", "forces foo to exist when it does not exist");
            common_1.toggle(div, "foo", true);
            base_1.should(div.className === "foo", "forces foo to exist when it already exists");
            common_1.toggle(div, "foo", false);
            base_1.should(div.className === "", "forces foo to not exist");
            common_1.toggle(div, "foo", false);
            base_1.should(div.className === "", "forces foo to not exist");
        });
    });
    describe("parse tests", function () {
        it("parse", function () {
            var num = 0;
            var bool = false;
            base_1.should(common_1.parse("", "").toString() === "", "empty string");
            base_1.should(common_1.parse("1", "").toString() === "1", "numeric string");
            base_1.should(common_1.parse("1", num) === 1, "numeric string as number returns number");
            base_1.should(common_1.parse("0", bool) === false, "0 as boolean is false");
            base_1.should(common_1.parse("1", bool) === true, "1 as boolean is true");
            base_1.should(common_1.parse("false", bool) === false, "'false' as boolean is false");
            base_1.should(common_1.parse("true", bool) === true, "'true' as boolean is true");
            base_1.should(common_1.parse("1", num) === 1, "numeric string as number returns number");
            base_1.should(common_1.parse("1", num) === 1, "numeric string as number returns number");
            base_1.should(common_1.parse("1,2,3", [num])[1] === 2, "parse into numeric array");
        });
    });
    describe("getQueryParameters tests", function () {
    });
    describe("getParameterByName tests", function () {
    });
    describe("doif tests", function () {
    });
    describe("mixin tests", function () {
    });
    describe("defaults tests", function () {
    });
    describe("cssin tests", function () {
    });
    describe("html tests", function () {
        it("", function () {
            var markup = "<tr>A<td>B</td></tr>";
            var tr = common_1.html(markup);
            base_1.should(tr.nodeValue === "AB", "setting innerHTML on a 'div' will not assign tr elements");
            markup = "<table><tbody><tr><td>Test</td></tr></tbody></table>";
            var table = common_1.html(markup);
            base_1.should(table.outerHTML === markup, "preserves tr when within a table");
            markup = "<canvas width=\"100\" height=\"100\"></canvas>";
            var canvas = common_1.html(markup);
            base_1.should(canvas.outerHTML === markup, "canvas markup preserved");
            base_1.should(!!canvas.getContext("2d"), "cnvas has 2d context");
        });
    });
});
define("ol3-fun/navigation", ["require", "exports", "openlayers", "jquery", "ol3-fun/common"], function (require, exports, ol, $, common_2) {
    "use strict";
    exports.__esModule = true;
    function zoomToFeature(map, feature, options) {
        var promise = $.Deferred();
        options = common_2.defaults(options || {}, {
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
define("tests/navigation.test", ["require", "exports", "tests/base", "openlayers", "ol3-fun/navigation", "ol3-fun/parse-dms"], function (require, exports, base_2, ol, navigation_1, parse_dms_1) {
    "use strict";
    exports.__esModule = true;
    describe("parse-dms", function () {
        it("parse", function () {
            var dms = parse_dms_1.parse("10 5'2\" 10");
            if (typeof dms === "number")
                throw "lat-lon expected";
            base_2.should(dms.lat === 10.08388888888889, "10 degrees 5 minutes 2 seconds");
            base_2.should(dms.lon === 10, "10 degrees 0 minutes 0 seconds");
        });
    });
    describe("ol/Map", function () {
        it("ol/Map", function () {
            base_2.should(!!ol.Map, "Map");
        });
    });
    describe("zoomToFeature", function () {
        it("zoomToFeature", function (done) {
            base_2.should(!!navigation_1.zoomToFeature, "zoomToFeature");
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
                navigation_1.zoomToFeature(map, feature, {
                    duration: 200,
                    minResolution: res / 4
                }).then(function () {
                    var _a = map.getView().getCenter(), cx = _a[0], cy = _a[1];
                    base_2.should(map.getView().getZoom() === zoom + 2, "zoom in two because minRes is 1/4 of initial res");
                    base_2.should(cx === 100, "center-x");
                    base_2.should(cy === 100, "center-y");
                    done();
                });
            });
        });
    });
});
define("tests/index", ["require", "exports", "tests/common.test", "tests/navigation.test"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
});
//# sourceMappingURL=index.js.map