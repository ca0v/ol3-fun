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
define("index", ["require", "exports", "ol3-fun/common"], function (require, exports, common) {
    "use strict";
    return common;
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
define("ol3-fun/navigation", ["require", "exports", "openlayers", "ol3-fun/common"], function (require, exports, ol, common_2) {
    "use strict";
    function zoomToFeature(map, feature, options) {
        options = common_2.defaults(options || {}, {
            duration: 1000,
            padding: 256,
            minResolution: 2 * map.getView().getMinResolution()
        });
        var view = map.getView();
        var currentExtent = view.calculateExtent(map.getSize());
        var targetExtent = feature.getGeometry().getExtent();
        var doit = function (duration) {
            view.fit(targetExtent, map.getSize(), {
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
            view.fit(fullExtent, map.getSize(), {
                padding: [options.padding, options.padding, options.padding, options.padding],
                minResolution: options.minResolution,
                duration: duration
            });
            setTimeout(function () { return doit(0.5 * options.duration); }, duration);
        }
    }
    exports.zoomToFeature = zoomToFeature;
});
define("ol3-fun/examples/zoomToFeature", ["require", "exports", "openlayers", "ol3-fun/navigation", "ol3-fun/common"], function (require, exports, ol, navigation_1, common_3) {
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
            source: new ol.source.Vector,
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
        var points = common_3.range(10).map(function (n) {
            return new ol.Feature(new ol.geom.Point(randomCoordinate(500)));
        });
        var polys = common_3.range(10).map(function (n) {
            var p0 = randomCoordinate(1000);
            var geom = new ol.geom.Polygon([[p0, randomCoordinate(10, p0), randomCoordinate(10, p0), p0]]);
            var feature = new ol.Feature(geom);
            return feature;
        });
        var geoms = [].concat(points, polys);
        common_3.shuffle(geoms);
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