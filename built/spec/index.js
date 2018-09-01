define("tests/base", ["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
    function should(result, msg) {
        if (!result)
            throw msg || "oops";
    }
    exports.should = should;
    function shouldEqual(a, b, msg) {
        if (a !== b)
            console.warn(a + " <> " + b);
        should(a === b, msg);
    }
    exports.shouldEqual = shouldEqual;
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
define("tests/spec/common", ["require", "exports", "tests/base", "ol3-fun/common"], function (require, exports, base_1, common_1) {
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
define("tests/spec/openlayers", ["require", "exports", "tests/base", "openlayers"], function (require, exports, base_2, ol) {
    "use strict";
    exports.__esModule = true;
    describe("ol/Map", function () {
        it("ol/Map", function () {
            base_2.should(!!ol.Map, "Map");
        });
    });
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
define("tests/spec/parse-dms", ["require", "exports", "tests/base", "ol3-fun/parse-dms"], function (require, exports, base_3, parse_dms_1) {
    "use strict";
    exports.__esModule = true;
    describe("parse-dms", function () {
        it("parse", function () {
            var dms = parse_dms_1.parse("10 5'2\" 10");
            if (typeof dms === "number")
                throw "lat-lon expected";
            base_3.should(dms.lat === 10.08388888888889, "10 degrees 5 minutes 2 seconds");
            base_3.should(dms.lon === 10, "10 degrees 0 minutes 0 seconds");
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
define("tests/spec/polyline", ["require", "exports", "tests/base", "ol3-fun/google-polyline", "ol3-fun/ol3-polyline", "ol3-fun/common"], function (require, exports, base_4, GooglePolylineEncoder, PolylineEncoder, common_2) {
    "use strict";
    exports.__esModule = true;
    describe("GooglePolylineEncoder", function () {
        it("GooglePolylineEncoder", function () {
            base_4.should(!!GooglePolylineEncoder, "GooglePolylineEncoder");
        });
        var points = common_2.pair(common_2.range(10), common_2.range(10));
        var poly = new GooglePolylineEncoder();
        var encoded = poly.encode(points);
        var decoded = poly.decode(encoded);
        base_4.shouldEqual(encoded.length, 533, "encoding is 533 characters");
        base_4.shouldEqual(base_4.stringify(decoded), base_4.stringify(points), "encode->decode");
    });
    describe("PolylineEncoder", function () {
        it("PolylineEncoder", function () {
            base_4.should(!!PolylineEncoder, "PolylineEncoder");
        });
        var points = common_2.pair(common_2.range(10), common_2.range(10));
        var poly = new PolylineEncoder();
        var encoded = poly.encode(points);
        var decoded = poly.decode(encoded);
        base_4.shouldEqual(encoded.length, 533, "encoding is 533 characters");
        base_4.shouldEqual(base_4.stringify(decoded), base_4.stringify(points), "encode->decode");
        poly = new PolylineEncoder(6);
        encoded = poly.encode(points);
        decoded = poly.decode(encoded);
        base_4.shouldEqual(encoded.length, 632, "encoding is 632 characters");
        base_4.shouldEqual(base_4.stringify(decoded), base_4.stringify(points), "encode->decode");
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
            var scale = isPoint ? 1 : Math.min(canvas.width / w, canvas.height / h);
            var ff = 2 / 3;
            scale *= ff;
            geom.translate(-cx, -cy);
            geom.scale(scale, -scale);
            geom.translate(Math.ceil(canvas.width * ff / 2), Math.ceil(canvas.height * ff / 2));
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
define("tests/spec/snapshot", ["require", "exports", "tests/base", "ol3-fun/snapshot", "openlayers", "ol3-fun/common"], function (require, exports, base_5, Snapshot, ol, common_3) {
    "use strict";
    exports.__esModule = true;
    var pointData = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAJyElEQVR4Xu2be2wVaRnGfx+Ue1VuC+VmoYpQbksVELlKQaOrIgqCytVgRMIuYRNBI5G6/UMpmNBshKggCAUEBA2CSzBQUAIqLrJYMNxaoEChwHIr5bow5pl8w54t57Qzc85hydI3OQmH+WbOvM/3Xp/3q+E5F/Oc608tALUW8JwjUOsCz7kB1AbBWheodYGniIDjOHWAF4DmQBOgEdAQaADcB+4Cd4BK4BpwBXjHGOMk6zWT6gKO40hBKdsCaAZ8BGhrQRAAHggC4F4EABVW+QsWCIFxFXjbGHM7kWAkG4AOwABgMNAX6Ao0BlJ8KPGOBeQo8CbwT+DvxphTPu71vSThADiOI5PWbg+1yncH2gAtrQVIeblCTfIIeAjc0M4Dl4H/WiD2AhcTYQ0JBcBxHJn7x4Es4It211sDdWvS1ud1ucRbQKEF4phcJZ4YkWgAZO7fAKZa//az0z51f7xMAVHWsQJYB+wxxiiAhpKEAOA4jgJbH+BLwCCgs/XzhDy/imYCQJ+TwD+A7cBeY0xpGATifkGr/GeAUVb5jmFeJOQ954F/AxtkCUCZMUbW4VsSAcAY4Jt29xUA3w/ZCqwHNhpjVEv4ltAAOI6jSP8x4LvAF4D2CQx2vhWwC8/awLgcOGKMUdbwJaEAcBxHqawH8HXga/bfvn4wiYuOA3+xgfE/xhjVETVKWABU0Y0EFtj87qewqfFl4lwghZUNfgCsASr8pMewAHzOpjv5vsrZZKS7oHgo+Omz1lrBTj/pMRAAjuPUswq/Aoy1pe2zsPuRYP0P2Az8UtWjMeZBdUgGBUCBLwN4zUb9oLv0tNbvAnJsQFQTFVOCAvAJ4MvAeOCTYbW5e/cuN27coLy8nKtXr3L79m0aNWpE06ZNadWqFc2aNaNxY/VMoeWIrQ3+aIw5nEgAVPAoyHwaaBfm9S5fvkxxcTFFRUWcPXuWK1euUFlZ6SrcokUL0tLS6N27N507d6Zly5bUrRuqjSgHioA8Y8yORALwEvC6VT5U0VNYWMjGjRtZu3YtFRUVPHr0buFmjCElJYXx48czbtw4hg0bRoMGogoCi7gFcQovG2NUIMXvAo7jqJ1VufszS3IE2hrt/NGjR1m3bh07d+6kpKSEBw+ejE916tQhIyODIUOGMGbMGLKyslyrCChqo/XwH9mUKCIlKqvkOwY4jpMJjAZ+CKQGeSEpeujQIVf5rVu3cuyYutjqpVOnTgwfPpypU6fSv3//mpbHuv4LC8DhWIVREADU6ir1qfRV7vct169fZ/PmzcyePdsNeg8faoOqF1lCvXr1WLp0KRMnTqxpeazrfwB+D7xhjJFbPCFBABgGjAP0NoFC9PHjx9m0aRPz5893/d5x/HGcAmH58uVMnjw5LAD7bDZYGos9CgKAGh4BoI/ITt+yb98+NmzY4O6mUl4QWbFiBVOmTAlyS+Ta08Am4KfGmFvxWoDyv0pfNUCBANi2bRvr1693P6oBgkicAEjpP9lscDNeAFT/a/e/HRSAvXv3uhawbNmyp20BYpBlAa8lwgJEbXt8X6AYoPSnGLBgwQJu3oy6EVGNIgExQCyR2KLfGmM0cIkrCH7KAvBy0Cxw7do1NwvMmTPnaWeBlTYL7IrVGQYJguL6VAeoyfhQED++d+8eBw8eZPXq1Wzfvp2TJ8VnVi/p6eluMTRt2jQGDhxY0/JY11W0rQaOG2Oi5t4gAMRFgqjxOXz4sBsLdu/ezblz59yAGFkKe7m/Q4cODBgwgNGjR9OnTx/athXpHEikrMiR2bYQuhF3Jaifdxzn84Cqq05Bq0Hv9ffv38+WLVtYs2YNFy9e5M6dd12zYcOGbic4YcIERo0a5Spfv379QJrbxXqo2uBXjTEqhmKKbwuwAKgmfdWOvESCBhZ1f6WlpZw4cYIzZ85QVlbmdoTNmzd3d7p9+/Z06dIFuYC6QVlFCLlox2gLjDE7EwmA+ICv2FQYmg+Q2esjC7hw4QKXLl1ylW3Tpo3b+KgjDKm4p6tYoY2WJldbnDALaBrBCKkwelZlt2WtimqiyIO6gBxSneAcmxI/6nPU/TSBUvmrQYlilSbIUZsg74UCAeDd5DiO0qHKYllBKGIkCYh4HZY3JdrkZ0oUFgDN+9UTKM9+OAnKhHmkNzT9MVBgd7/GOWFYANQM9QO+Yw9CPM2BaCxwNCjdD/zGniTx1XaGAsCmRFmBRuITLAiizALRZGG2OcY9l+yoXPxfoFF5aAAi4oEA+BYw3J72SqBevh/1V9v0rI3V9MR6UtwA7Nq1q0dZWdnI9PT0z6ampvZMSUl5zGB2767jQf5FpbKY4QD3qeA5ZFtepb6SWDV/sgDQmT+ZX0xZuHAh06dPp0mT2DSi5gJDhw7lwIED7nMmTZrEypVq5KKKG+0rKipKc3Jyri9atOjFjIyMn5eUlCj4BZZ4LaBHdnZ20apVq2jX7sk5yf3798nLy3O7vyVLlsQEQTvfs2dPjhzRQAfXAqrhDZ3KyspHvXr1utaxY8eWI0eOZNasWbotlC6hboqA+TEAIj1GjBjxnh3YsWMH/fr1Y8aMGS7Hr5c9ffq0W/reunWL1q1bu8p6AETerMmR3EGjslOnTjkCMTMzszQrK+vNLVu2nM/Pz58p4CN+VwWaTpgGkqQCIDp78eLFbgu8Z8+e62lpafXy8vLe4wsy95kzZ7qdnyeypvPnldWelMzMzL8VFxe/MGjQoG5VANDiVvY8oW8QkgGATo5Ivjdx4sSZHgBz5859u7y8vIXMvFu3bu4Cz0XmzZvnfo90AVlP165d3Y5R3ID1e9eaBE6k2+m7gCwsLOwJVDsMrYpMMgB4/BtSSORG5Evron1ZpOTgwYPdOCEQqgKgyZDGaHKt7OxsV2lNleU23vcqrvf+ARAtCGoIIuULCgrIzc11g1V+fj45OTlvpaamnuzbt++YSDOuCoAXPwoKCt4AXvKsQgBKqrjA94Ff+7Z9uzCpFhDxMheXLVuWNnbsWA+Qr9rK7ZKUEg+gXY3mAhGmXVQDAKF0CXVThGLVZgHblCih79BMIAIApQud/r4VqfQHBQD5oQ4o6HS3J6/n5ua+4rnAvHnzVgFnsrOzf1KdCygIBrCAZ8YFolnVtOzs7F9J2SBBsDoAdNAi0mIs0uIs/xUkDiTDBaI9U7lfU5qsoGkwlgUIALmVzg9EBFs1Zjoj6FviBUA8QORfcCha68R4NNHaxYrmUS5q5C4SwxO5j/oMT1Tg/K7KvTqrJNorUhRc/+xb+7D1c5Uf0IEp/ZGERH/JIU4ulsgSZKZaLyZJR0V05F0KRz7nDJBuH6IxksxaAHojIu//VHS9aNepM6yWAo/2Uv8H0ZFLfdjQEyIAAAAASUVORK5CYII=";
    var circleData = "data:image/png;base64,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";
    function show(data) {
        document.body.appendChild(common_3.html("<img src=\"" + data + "\" />"));
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
        for (var i = 0; i < points; i++) {
            result[i] = [radius * Math.sin(a), radius * Math.cos(a)];
            a += dr;
        }
        return result;
    }
    describe("Snapshot", function () {
        it("Snapshot", function () {
            base_5.should(!!Snapshot, "Snapshot");
            base_5.should(!!Snapshot.render, "Snapshot.render");
            base_5.should(!!Snapshot.snapshot, "Snapshot.snapshot");
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
            base_5.shouldEqual(data, pointData, "point");
        });
        it("Converts a polygon to image data", function () {
            var geom = new ol.geom.Polygon([circle(3 + 100 * Math.random())]);
            var feature = new ol.Feature(geom);
            base_5.shouldEqual(feature.getGeometry(), geom, "geom still assigned");
            feature.setStyle(new ol.style.Style({
                fill: new ol.style.Fill({
                    color: "black"
                }),
                stroke: new ol.style.Stroke({
                    color: "blue",
                    width: 3
                })
            }));
            var originalCoordinates = base_5.stringify(geom.getCoordinates());
            var data = Snapshot.snapshot(feature, 64);
            console.log(data);
            base_5.should(!!data, "snapshot returns data");
            show(data);
            var finalCoordinates = base_5.stringify(geom.getCoordinates());
            base_5.shouldEqual(originalCoordinates, finalCoordinates, "coordinates unchanged");
            base_5.shouldEqual(feature.getGeometry(), geom, "geom still assigned");
            base_5.shouldEqual(data, circleData, "circle data as expected");
        });
    });
});
define("ol3-fun/navigation", ["require", "exports", "openlayers", "jquery", "ol3-fun/common"], function (require, exports, ol, $, common_4) {
    "use strict";
    exports.__esModule = true;
    function zoomToFeature(map, feature, options) {
        var promise = $.Deferred();
        options = common_4.defaults(options || {}, {
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
define("tests/spec/zoom-to-feature", ["require", "exports", "openlayers", "tests/base", "ol3-fun/navigation"], function (require, exports, ol, base_6, navigation_1) {
    "use strict";
    exports.__esModule = true;
    describe("zoomToFeature", function () {
        it("zoomToFeature", function (done) {
            base_6.should(!!navigation_1.zoomToFeature, "zoomToFeature");
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
                    base_6.should(map.getView().getZoom() === zoom + 2, "zoom in two because minRes is 1/4 of initial res");
                    base_6.should(cx === 100, "center-x");
                    base_6.should(cy === 100, "center-y");
                    done();
                });
            });
        });
    });
});
define("tests/index", ["require", "exports", "tests/spec/common", "tests/spec/openlayers", "tests/spec/parse-dms", "tests/spec/polyline", "tests/spec/snapshot", "tests/spec/zoom-to-feature"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
});
//# sourceMappingURL=index.js.map