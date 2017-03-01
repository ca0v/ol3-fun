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
            styleTag.innerText = css;
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
                    func.call(_this, args);
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
});
define("ol3-fun/examples/html", ["require", "exports", "ol3-fun/common"], function (require, exports, common_1) {
    "use strict";
    function run() {
        var html = "<tr><td>Test</td></tr>";
        var tr = common_1.html(html);
        console.assert(tr === null);
        html = "<table><tbody><tr><td>Test</td></tr></tbody></table>";
        var table = common_1.html(html);
        console.assert(table.outerHTML === html);
        html = "<canvas width=\"100\" height=\"100\"></canvas>";
        var canvas = common_1.html(html);
        console.assert(canvas.outerHTML === html);
        canvas.getContext("2d");
    }
    exports.run = run;
});
define("ol3-fun/examples/index", ["require", "exports"], function (require, exports) {
    "use strict";
    function run() {
        var l = window.location;
        var path = "" + l.origin + l.pathname + "?run=ol3-fun/examples/";
        var labs = "\n    html\n    zoomToFeature\n    index\n    ";
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
define("ol3-fun/navigation", ["require", "exports", "openlayers"], function (require, exports, ol) {
    "use strict";
    function zoomToFeature(map, feature, duration) {
        if (duration === void 0) { duration = 2500; }
        var extent = feature.getGeometry().getExtent();
        var w1 = ol.extent.getWidth(map.getView().calculateExtent(map.getSize()));
        var w2 = ol.extent.getWidth(extent);
        map.getView().animate({
            center: ol.extent.getCenter(extent),
            duration: duration
        }, {
            zoom: map.getView().getZoom() + Math.round(Math.log(w1 / w2) / Math.log(2)) - 1,
            duration: duration
        }, function () {
            map.getView().fit(feature.getGeometry().getExtent(), map.getSize());
        });
    }
    exports.zoomToFeature = zoomToFeature;
});
define("ol3-fun/examples/zoomToFeature", ["require", "exports", "ol3-fun/navigation"], function (require, exports, navigation_1) {
    "use strict";
    function run() {
        var map = new ol.Map({
            target: document.getElementsByClassName("map")[0],
            view: new ol.View({
                center: [0, 0],
                zoom: 15
            })
        });
        var graticule = new ol.Graticule({
            maxLines: 500,
            strokeStyle: new ol.style.Stroke({
                color: 'rgba(255,120,0,0.9)',
                width: 2,
                lineDash: [0.5, 4]
            })
        });
        graticule.setMap(map);
        setTimeout(function () {
            var feature = new ol.Feature();
            feature.setGeometry(new ol.geom.Point([-115, 35]));
            navigation_1.zoomToFeature(map, feature);
        }, 5000);
    }
    exports.run = run;
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
define("ol3-fun/snapshot", ["require", "exports", "openlayers"], function (require, exports, ol) {
    "use strict";
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
            var styles = feature.getStyleFunction()(0);
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