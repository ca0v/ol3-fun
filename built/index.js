define("ol3-fun/common", ["require", "exports"], function (require, exports) {
    "use strict";
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
            styleTag.appendChild(document.createTextNode(css));
            document.head.appendChild(styleTag);
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
        var _this = this;
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
                    func.apply(_this, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow)
                func.call(_this, args);
        });
    }
    exports.debounce = debounce;
    function html(html) {
        var d = document;
        var a = d.createElement("div");
        var b = d.createDocumentFragment();
        a.innerHTML = html;
        while (a.firstChild)
            b.appendChild(a.firstChild);
        return b.firstElementChild;
    }
    exports.html = html;
    function pair(a1, a2) {
        var result = [];
        a1.forEach(function (v1) { return a2.forEach(function (v2) { return result.push([v1, v2]); }); });
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
define("ol3-fun/navigation", ["require", "exports", "openlayers", "ol3-fun/common"], function (require, exports, ol, common_1) {
    "use strict";
    function zoomToFeature(map, feature, options) {
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
                duration: duration
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
    }
    exports.zoomToFeature = zoomToFeature;
});
define("ol3-fun/parse-dms", ["require", "exports"], function (require, exports) {
    "use strict";
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
        var _a;
    }
    exports.parse = parse;
});
define("index", ["require", "exports", "ol3-fun/common", "ol3-fun/navigation", "ol3-fun/parse-dms"], function (require, exports, common, navigation, dms) {
    "use strict";
    var index = common.defaults(common, {
        dms: dms,
        navigation: navigation
    });
    return index;
});
define("ol3-fun/examples/debounce", ["require", "exports", "openlayers", "ol3-fun/common"], function (require, exports, ol, common_2) {
    "use strict";
    function run() {
        var map = new ol.Map({
            loadTilesWhileAnimating: true,
            loadTilesWhileInteracting: true,
            controls: [],
            interactions: [],
            target: document.getElementsByClassName("map")[0],
            view: new ol.View({
                center: [-8200000, 4000000],
                zoom: 3,
                projection: "EPSG:3857"
            }),
            layers: [new ol.layer.Tile({
                    source: new ol.source.OSM()
                })]
        });
        var vectors = new ol.layer.Vector({
            source: new ol.source.Vector()
        });
        map.addLayer(vectors);
        var clearAll = common_2.debounce(function () { return vectors.getSource().clear(); }, 1000);
        var onClick = common_2.debounce(function (args) {
            vectors.getSource().addFeature(new ol.Feature(new ol.geom.Point(args.coordinate)));
            clearAll();
        }, 100);
        map.on("click", onClick);
    }
    exports.run = run;
});
define("ol3-fun/examples/goto", ["require", "exports", "openlayers", "ol3-fun/common", "ol3-fun/parse-dms"], function (require, exports, ol, common_3, parse_dms_1) {
    "use strict";
    common_3.cssin("html", "\n\n.notebook {\n    background: white;\n    border: 1px solid rgba(66,66,66,1);\n    padding: 4px;\n}\n\n.notebook:after {\n    content: \"+\";\n    position: absolute;\n    left: calc(50% - 5px);\n}\n\n.notebook textarea {\n    width: 240px;\n    height: 80px;\n    background: rgb(250, 250, 210);\n    resize: none;\n}\n\n.parse-container {\n    position: absolute;\n    top: 1em;\n    right: 1em;\n}\n");
    function run() {
        var html = "<tr><td>Test</td></tr>";
        var tr = common_3.html(html);
        console.assert(tr === null);
        html = "<table><tbody><tr><td>Test</td></tr></tbody></table>";
        var table = common_3.html(html);
        console.assert(table.outerHTML === html);
        html = "<canvas width=\"100\" height=\"100\"></canvas>";
        var canvas = common_3.html(html);
        console.assert(canvas.outerHTML === html);
        console.assert(!!canvas.getContext("2d"));
        var map = new ol.Map({
            loadTilesWhileAnimating: true,
            loadTilesWhileInteracting: true,
            controls: ol.control.defaults({
                attribution: false,
                rotate: true
            }),
            interactions: ol.interaction.defaults({
                zoomDuration: 1000
            }),
            overlays: [],
            target: document.getElementsByClassName("map")[0],
            view: new ol.View({
                center: [-8800000, 4000000],
                zoom: 15,
                projection: "EPSG:3857"
            }),
            layers: [new ol.layer.Tile({
                    source: new ol.source.OSM()
                })]
        });
        map.on("click", function (args) {
            var location = new ol.geom.Point(args.coordinate);
            location.transform(map.getView().getProjection(), "EPSG:4326");
            var overlay = new ol.Overlay({
                insertFirst: true,
                positioning: "bottom-center",
                offset: [0, -5],
                element: common_3.html("\n            <div class='notebook'>\n            <h3>Hello World</h3>\n            <table>\n                <tr><td>X lon</td><td>" + location.getFirstCoordinate()[0] + "</td></tr>\n                <tr><td>Y lat</td><td>" + location.getFirstCoordinate()[1] + "</td></tr>\n            </table>\n            <textarea placeholder='Describe Location'></textarea>\n            </div>\n            "),
                position: args.coordinate
            });
            map.addOverlay(overlay);
        });
        {
            document.body.appendChild(common_3.html("<div class='parse-container'><label>Enter Coordinates:</label><input class='parse' placeholder=\"59&deg;12'7.7&quot;N 02&deg;15'39.6&quot;W\"/></div>"));
            var parseInput_1 = document.body.getElementsByClassName("parse")[0];
            parseInput_1.addEventListener("change", function () {
                var result = parse_dms_1.parse(parseInput_1.value);
                if (typeof result === "number") {
                    alert(result);
                }
                else {
                    var location_1 = new ol.geom.Point([result.lon, result.lat]);
                    location_1.transform("EPSG:4326", map.getView().getProjection());
                    map.getView().setCenter(location_1.getFirstCoordinate());
                }
            });
        }
        var vectors = new ol.layer.Vector({
            source: new ol.source.Vector()
        });
        map.addLayer(vectors);
    }
    exports.run = run;
});
define("ol3-fun/examples/html", ["require", "exports", "openlayers", "ol3-fun/common"], function (require, exports, ol, common_4) {
    "use strict";
    common_4.cssin("html", "\n\n.notebook {\n    background: white;\n    border: 1px solid rgba(66,66,66,1);\n    padding: 4px;\n}\n\n.notebook:after {\n    content: \"+\";\n    position: absolute;\n    left: calc(50% - 5px);\n}\n\n.notebook textarea {\n    width: 240px;\n    height: 80px;\n    background: rgb(250, 250, 210);\n    resize: none;\n}\n");
    function run() {
        var html = "<tr><td>Test</td></tr>";
        var tr = common_4.html(html);
        console.assert(tr === null);
        html = "<table><tbody><tr><td>Test</td></tr></tbody></table>";
        var table = common_4.html(html);
        console.assert(table.outerHTML === html);
        html = "<canvas width=\"100\" height=\"100\"></canvas>";
        var canvas = common_4.html(html);
        console.assert(canvas.outerHTML === html);
        console.assert(!!canvas.getContext("2d"));
        var map = new ol.Map({
            loadTilesWhileAnimating: true,
            loadTilesWhileInteracting: true,
            controls: ol.control.defaults({
                attribution: false,
                rotate: true
            }),
            interactions: ol.interaction.defaults({
                zoomDuration: 1000
            }),
            overlays: [],
            target: document.getElementsByClassName("map")[0],
            view: new ol.View({
                center: [-8800000, 4000000],
                zoom: 15,
                projection: "EPSG:3857"
            }),
            layers: [new ol.layer.Tile({
                    source: new ol.source.OSM()
                })]
        });
        map.on("click", function (args) {
            var overlay = new ol.Overlay({
                insertFirst: true,
                positioning: "bottom-center",
                offset: [0, -5],
                element: common_4.html("\n            <div class='notebook'>\n            <h3>Hello World</h3>\n            <table>\n                <tr><td>X lon</td><td>" + args.coordinate[0] + "</td></tr>\n                <tr><td>Y lat</td><td>" + args.coordinate[1] + "</td></tr>\n            </table>\n            <textarea placeholder='Describe Location'></textarea>\n            </div>\n            "),
                position: args.coordinate
            });
            map.addOverlay(overlay);
        });
        var vectors = new ol.layer.Vector({
            source: new ol.source.Vector()
        });
        map.addLayer(vectors);
    }
    exports.run = run;
});
define("ol3-fun/examples/index", ["require", "exports"], function (require, exports) {
    "use strict";
    function run() {
        var l = window.location;
        var path = "" + l.origin + l.pathname + "?run=ol3-fun/examples/";
        var labs = "\n    debounce\n    goto\n    html\n    polyline\n    zoomToFeature\n    index\n    ";
        var styles = document.createElement("style");
        document.head.appendChild(styles);
        styles.innerText += "\n    #map {\n        display: none;\n    }\n    .test {\n        margin: 20px;\n    }\n    ";
        var labDiv = document.createElement("div");
        document.body.appendChild(labDiv);
        labDiv.innerHTML = labs
            .split(/ /)
            .map(function (v) { return v.trim(); })
            .filter(function (v) { return !!v; })
            .map(function (lab) { return "<div class='test'><a href='" + path + lab + "&debug=1'>" + lab + "</a></div>"; })
            .join("\n");
        var testDiv = document.createElement("div");
        document.body.appendChild(testDiv);
        testDiv.innerHTML = "<a href='" + l.origin + l.pathname + "?run=ol3-fun/tests/index'>tests</a>";
    }
    exports.run = run;
    ;
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
define("ol3-fun/examples/polyline", ["require", "exports", "openlayers", "ol3-fun/ol3-polyline", "ol3-fun/google-polyline", "jquery"], function (require, exports, ol, PolylineEncoder, GoogleEncoder, $) {
    "use strict";
    var PRECISION = 6;
    var css = "\n<style>\n    .polyline-encoder .area {\n        margin: 20px;\n    }\n\n    .polyline-encoder .area p {\n        font-size: smaller;\n    }\n\n    .polyline-encoder .area canvas {\n        vertical-align: top;\n    }\n\n    .polyline-encoder .area label {\n        display: block;\n        margin: 10px;\n        border-bottom: 1px solid black;\n    }\n\n    .polyline-encoder .area textarea {\n        min-width: 400px;\n        min-height: 200px;\n    }\n</style>\n";
    var ux = "\n<div class='polyline-encoder'>\n    <p>\n    Demonstrates simplifying a geometry and then encoding it.  Enter an Input Geometry (e.g. [[1,2],[3,4]]) and watch the magic happen\n    </p>\n\n    <div class='input area'>\n        <label>Input Geometry</label>\n        <p>Enter a geometry here as an array of points in the form [[x1,y1], [x2,y2], ..., [xn, yn]]</p>\n        <textarea></textarea>\n        <canvas></canvas>\n    </div>\n\n    <div class='simplified area'>\n        <label>Simplified Geometry</label>\n        <p>This is a 'simplified' version of the Input Geometry.  \n        You can also enter a geometry here as an array of points in the form [[x1,y1], [x2,y2], ..., [xn, yn]]</p>\n        <textarea></textarea>\n        <canvas></canvas>\n    </div>\n\n    <div class='encoded area'>\n        <label>Encoded Simplified Geometry</label>\n        <p>This is an encoding of the Simplified Geometry.  You can also enter an encoded value here</p>\n        <textarea>[encoding]</textarea>\n        <div>Use google encoder?</div>\n        <input type='checkbox' id='use-google' />\n        <p>Ported to Typescript from https://github.com/DeMoehn/Cloudant-nyctaxi/blob/master/app/js/polyline.js</p>\n    </div>\n\n    <div class='decoded area'>\n        <label>Decoded Simplified Geometry</label>\n        <p>This is the decoding of the Encoded Geometry</p>\n        <textarea>[decoded]</textarea>\n        <canvas></canvas>\n    </div>\n\n</div>\n";
    var encoder;
    var sample_input = [
        [-115.25532322799027, 36.18318333413792], [-115.25480459088912, 36.18318418322269], [-115.25480456865377, 36.18318418316166], [-115.25480483306748, 36.1831581364999], [-115.25480781267404, 36.18315812665095], [-115.2548095138256, 36.183158095267615], [-115.25481120389723, 36.183158054840916], [-115.2548128940441, 36.18315799638853], [-115.2548145842662, 36.18315791991047], [-115.25481628564361, 36.18315783445006], [-115.25481797597863, 36.18315773093339], [-115.25481965527126, 36.18315760936059], [-115.25482134571912, 36.18315747880541], [-115.2548230362423, 36.18315733022459], [-115.25482471568543, 36.183157172600346], [-115.25482639524148, 36.183156987937565], [-115.25482807479749, 36.183156803274784], [-115.25482974334876, 36.183156591542996], [-115.2548314230553, 36.18315637082881], [-115.25483309171943, 36.18315613205847], [-115.25483476042122, 36.183155884275266], [-115.25483641808054, 36.18315561843585], [-115.25483807581516, 36.18315533457071], [-115.25483973358743, 36.18315504169277], [-115.25484138031726, 36.183154730758616], [-115.25484302712233, 36.18315440179879], [-115.25484467396501, 36.183154063826066], [-115.25484630976528, 36.1831537077972], [-115.2548479456032, 36.18315334275542], [-115.25484957043632, 36.183152950644654], [-115.25485119526944, 36.183152558533834], [-115.25485280906014, 36.183152148366815], [-115.2548544229261, 36.18315172017415], [-115.2548560257496, 36.18315127392525], [-115.25485762861075, 36.18315081866349], [-115.25485922039188, 36.18315035435842], [-115.25486081224824, 36.18314987202764], [-115.25486239306215, 36.183149371640624], [-115.25486396279601, 36.1831488622103], [-115.25486553260517, 36.18314833475428], [-115.2548670913342, 36.18314779825488], [-115.25486863902088, 36.183147243699295], [-115.25487018674515, 36.18314668013086], [-115.25487172342703, 36.18314609850624], [-115.25487324902879, 36.18314550783829], [-115.25487476358818, 36.18314489911408], [-115.25487627818518, 36.18314428137708], [-115.25487778173971, 36.18314364558384], [-115.25487928533187, 36.18314300077779], [-115.25488076676396, 36.18314233788503], [-115.25488224823366, 36.183141665979406], [-115.25488370754327, 36.1831409759871], [-115.25488516689049, 36.18314027698193], [-115.25488661519529, 36.183139559920576], [-115.25488805238238, 36.183138842828726], [-115.25488948968233, 36.183138098698365], [-115.2548909047846, 36.18313734549412], [-115.25489231992445, 36.18313658327705], [-115.25489371286662, 36.18313581198606], [-115.25489510588402, 36.18313502266943], [-115.25489647670366, 36.183134224279], [-115.25489784759858, 36.18313340786281], [-115.25489919629575, 36.18313258237279], [-115.25490054503052, 36.18313174786991], [-115.25490187156761, 36.18313090429319], [-115.25490319817993, 36.18313004269079], [-115.25490450259451, 36.183129172014546], [-115.25490580704671, 36.183128292325435], [-115.25490708933879, 36.18312739454964], [-115.25490836055086, 36.18312648773055], [-115.25490962068287, 36.183125571868075], [-115.25491086973481, 36.18312464696224], [-115.25491210774435, 36.183123704000224], [-115.25491332355611, 36.18312275196436], [-115.25491453940552, 36.183121790915635], [-115.25491573305723, 36.18312082079315], [-115.25491691562885, 36.183119841627246], [-115.25491808715805, 36.18311884440516], [-115.25491924756955, 36.18311784715259], [-115.25492038582102, 36.18311683181332], [-115.2549215129924, 36.18311580743071], [-115.25492262908377, 36.183114774004764], [-115.25492373409503, 36.18311373153546], [-115.25492481690861, 36.183112679992306], [-115.2549258886421, 36.18311161940585], [-115.25492694929561, 36.183110549776046], [-115.25492798775133, 36.183109471072356], [-115.25492901516465, 36.183108374312525], [-115.25493003146033, 36.1831072775222], [-115.25493102555829, 36.18310617165801], [-115.25493200857615, 36.18310505675048], [-115.25493298051404, 36.183103932799625], [-115.25493393025415, 36.18310279977493], [-115.25493486891426, 36.18310165770687], [-115.25493579649431, 36.183100506595494], [-115.25493670187666, 36.18309934641027], [-115.25493759614129, 36.18309818619454], [-115.25493846824591, 36.183097007892144], [-115.25493931811518, 36.18309582952875], [-115.25494016802205, 36.183094642152525], [-115.25494099573123, 36.18309344570244], [-115.25494180124268, 36.18309224017851], [-115.25494259567414, 36.183091025611276], [-115.25494336787024, 36.18308981098305], [-115.25494412898631, 36.183088587311474], [-115.2549448790223, 36.183087354596566], [-115.25494560682303, 36.18308612182065], [-115.25494631246364, 36.18308487095804], [-115.25494700698661, 36.18308362006498], [-115.25494767927427, 36.18308236911088], [-115.2549483404819, 36.18308110911343], [-115.25494897949177, 36.183079840042225], [-115.25494960742166, 36.183078561927644], [-115.25495021311626, 36.183077283752056], [-115.25495080769318, 36.183076005545956], [-115.25495138011001, 36.18307470925323], [-115.25495193025388, 36.183073421912326], [-115.25495246935542, 36.18307211651528], [-115.25495298618397, 36.18307082007], [-115.25495349197016, 36.183069505568625], [-115.2549539754834, 36.183068200019065], [-115.25495443679894, 36.18306688539569], [-115.25495488703444, 36.183065561728924], [-115.25495531503466, 36.183064238001236], [-115.25495573195485, 36.18306290523016], [-115.2553212003638, 36.183064339787606], [-115.25532322799027, 36.18318333413792]
    ];
    function updateEncoder() {
        var input = $(".simplified textarea")[0];
        var geom = new ol.geom.LineString(JSON.parse(input.value));
        var encoded = encoder.encode(geom.getCoordinates(), PRECISION);
        $(".encoded textarea").val(encoded).change();
    }
    function updateDecoder() {
        var input = $(".encoded textarea")[0];
        $(".decoded textarea").val(JSON.stringify(encoder.decode(input.value, PRECISION))).change();
        updateCanvas(".decoded canvas", ".decoded textarea");
    }
    function updateCanvas(canvas_id, features_id) {
        var canvas = $(canvas_id)[0];
        canvas.width = canvas.height = 200;
        var geom = new ol.geom.LineString(JSON.parse($(features_id)[0].value));
        var extent = geom.getExtent();
        var scale = (function () {
            var _a = [ol.extent.getWidth(extent), ol.extent.getHeight(extent)], w = _a[0], h = _a[1];
            var _b = ol.extent.getCenter(extent), x0 = _b[0], y0 = _b[1];
            var _c = [canvas.width / 2, canvas.height / 2], dx = _c[0], dy = _c[1];
            var _d = [dx / w, dy / h], sx = _d[0], sy = _d[1];
            return function (x, y) {
                return [sx * (x - x0) + dx, -sy * (y - y0) + dy];
            };
        })();
        var c = canvas.getContext("2d");
        c.beginPath();
        {
            c.strokeStyle = "#000000";
            c.lineWidth = 1;
            geom.getCoordinates().forEach(function (p, i) {
                var _a = scale(p[0], p[1]), x = _a[0], y = _a[1];
                console.log(x, y);
                (i === 0) && c.moveTo(x, y);
                c.lineTo(x, y);
            });
            c.stroke();
            c.closePath();
        }
        c.beginPath();
        {
            c.strokeStyle = "#FF0000";
            c.lineWidth = 1;
            geom.getCoordinates().forEach(function (p, i) {
                var _a = scale(p[0], p[1]), x = _a[0], y = _a[1];
                c.moveTo(x, y);
                c.rect(x, y, 1, 1);
            });
            c.stroke();
            c.closePath();
        }
    }
    function run() {
        $(css).appendTo("head");
        $(ux).appendTo(".map");
        $("#use-google").change(function (args) {
            encoder = $("#use-google:checked").length ? new GoogleEncoder() : new PolylineEncoder(6, 2);
            $(".simplified textarea").change();
        }).change();
        $(".encoded textarea").change(updateDecoder);
        $(".simplified textarea").change(function () {
            updateCanvas(".simplified canvas", ".simplified textarea");
            updateEncoder();
        });
        $(".input textarea")
            .val(JSON.stringify(sample_input))
            .change(function (args) {
            var input = $(".input textarea")[0];
            var coords = JSON.parse("" + input.value);
            var geom = new ol.geom.LineString(coords);
            geom = geom.simplify(Math.pow(10, -PRECISION));
            $(".simplified textarea").val(JSON.stringify(geom.getCoordinates())).change();
            updateCanvas(".input canvas", ".input textarea");
        })
            .change();
    }
    exports.run = run;
});
define("ol3-fun/examples/zoomToFeature", ["require", "exports", "openlayers", "ol3-fun/navigation", "ol3-fun/common"], function (require, exports, ol, navigation_1, common_5) {
    "use strict";
    function randomCoordinate(size, _a) {
        if (size === void 0) { size = 100; }
        var _b = _a === void 0 ? [-8238299, 4970071] : _a, x = _b[0], y = _b[1];
        return [x + size * Math.random(), y + size * Math.random()];
    }
    function run() {
        var tiles = new ol.layer.Tile({
            source: new ol.source.OSM()
        });
        var vectors = new ol.layer.Vector({
            source: new ol.source.Vector(),
            style: function (feature, resolution) {
                var style = new ol.style.Style({});
                switch (feature.getGeometry().getType()) {
                    case "Point":
                        style.setImage(new ol.style.Circle({
                            radius: 20,
                            fill: new ol.style.Fill({
                                color: "rgba(60, 60, 60, 0.1)"
                            }),
                            stroke: new ol.style.Stroke({
                                color: "rgba(60, 66, 60, 0.1)",
                                width: 1
                            })
                        }));
                        break;
                    case "Polygon":
                        style.setFill(new ol.style.Fill({
                            color: "rgba(60, 6, 60, 0.1)"
                        }));
                        style.setStroke(new ol.style.Stroke({
                            color: "rgba(60, 60, 60, 0.1)",
                            width: 1
                        }));
                        break;
                }
                return style;
            }
        });
        var map = new ol.Map({
            loadTilesWhileAnimating: true,
            loadTilesWhileInteracting: true,
            target: document.getElementsByClassName("map")[0],
            view: new ol.View({
                center: [-8200000, 4000000],
                zoom: 3,
                projection: "EPSG:3857"
            }),
            layers: [tiles, vectors]
        });
        var points = common_5.range(10).map(function (n) {
            return new ol.Feature(new ol.geom.Point(randomCoordinate(500)));
        });
        var polys = common_5.range(10).map(function (n) {
            var p0 = randomCoordinate(1000);
            var geom = new ol.geom.Polygon([[p0, randomCoordinate(10, p0), randomCoordinate(10, p0), p0]]);
            var feature = new ol.Feature(geom);
            return feature;
        });
        var geoms = [].concat(points, polys);
        common_5.shuffle(geoms);
        vectors.getSource().addFeatures(geoms);
        var select = new ol.interaction.Select({
            style: function (feature) {
                var style = new ol.style.Style({
                    text: new ol.style.Text({
                        text: 1 + geoms.indexOf(feature) + "",
                        fill: new ol.style.Fill({
                            color: "black"
                        }),
                        stroke: new ol.style.Stroke({
                            color: "white",
                            width: 2
                        })
                    })
                });
                switch (feature.getGeometry().getType()) {
                    case "Point":
                        style.setImage(new ol.style.Circle({
                            radius: 20,
                            fill: new ol.style.Fill({
                                color: "rgba(60, 6, 60, 0.6)"
                            }),
                            stroke: new ol.style.Stroke({
                                color: "rgba(60, 6, 60, 0.6)",
                                width: 1
                            })
                        }));
                        break;
                    case "Polygon":
                        style.setFill(new ol.style.Fill({
                            color: "rgba(60, 6, 60, 0.6)"
                        }));
                        style.setStroke(new ol.style.Stroke({
                            color: "rgba(60, 6, 60, 0.6)",
                            width: 1
                        }));
                        break;
                }
                return style;
            }
        });
        select.setMap(map);
        geoms.forEach(function (f, i) { return setTimeout(function () {
            var features = select.getFeatures();
            features.insertAt(0, f);
            navigation_1.zoomToFeature(map, f);
            while (features.getLength() > 2)
                features.removeAt(2);
        }, 1000 + i * 2000); });
    }
    exports.run = run;
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
            var isPoint = extent[0] === extent[2];
            var _a = ol.extent.getCenter(extent), dx = _a[0], dy = _a[1];
            var scale = isPoint ? 1 : Math.min(canvas.width / ol.extent.getWidth(extent), canvas.height / ol.extent.getHeight(extent));
            geom.translate(-dx, -dy);
            geom.scale(scale, -scale);
            geom.translate(canvas.width / 2, canvas.height / 2);
            var vtx = ol.render.toContext(canvas.getContext("2d"));
            var styles = getStyle(feature);
            if (!Array.isArray(styles))
                styles = [styles];
            styles.forEach(function (style) { return vtx.drawFeature(feature, style); });
        };
        Snapshot.snapshot = function (feature) {
            var canvas = document.createElement("canvas");
            var geom = feature.getGeometry();
            this.render(canvas, feature);
            return canvas.toDataURL();
        };
        return Snapshot;
    }());
    return Snapshot;
});
//# sourceMappingURL=index.js.map