import { should, shouldEqual, stringify } from "../base";
import * as ol from "openlayers";
import { zoomToFeature } from "ol3-fun/navigation";
import { parse } from "ol3-fun/parse-dms";
import GooglePolylineEncoder = require("ol3-fun/google-polyline");
import PolylineEncoder = require("ol3-fun/ol3-polyline");
import Snapshot = require("ol3-fun/snapshot");
import { pair, range } from "ol3-fun/common";

describe("parse-dms", () => {
    it("parse", () => {
        let dms = parse(`10 5'2" 10`);
        if (typeof dms === "number") throw "lat-lon expected";
        should(dms.lat === 10.08388888888889, "10 degrees 5 minutes 2 seconds");
        should(dms.lon === 10, "10 degrees 0 minutes 0 seconds");
    });
});

describe("ol/Map", () => {
    it("ol/Map", () => {
        should(!!ol.Map, "Map");
    });
});

describe("zoomToFeature", () => {
    it("zoomToFeature", (done) => {
        should(!!zoomToFeature, "zoomToFeature");
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
            zoomToFeature(map, feature, {
                duration: 200,
                minResolution: res / 4,
            }).then(() => {
                let [cx, cy] = map.getView().getCenter();
                should(map.getView().getZoom() === zoom + 2, "zoom in two because minRes is 1/4 of initial res");
                should(cx === 100, "center-x");
                should(cy === 100, "center-y");
                done();
            });
        });
    });
});

describe("GooglePolylineEncoder", () => {
    it("GooglePolylineEncoder", () => {
        should(!!GooglePolylineEncoder, "GooglePolylineEncoder");
    });

    let points = pair(range(10), range(10));
    let poly = new GooglePolylineEncoder();

    let encoded = poly.encode(points);
    let decoded = poly.decode(encoded);

    shouldEqual(encoded.length, 533, "encoding is 533 characters");
    shouldEqual(stringify(decoded), stringify(points), "encode->decode");
});

describe("PolylineEncoder", () => {
    it("PolylineEncoder", () => {
        should(!!PolylineEncoder, "PolylineEncoder");
    });

    let points = pair(range(10), range(10));
    let poly = new PolylineEncoder(); // default precision is 5

    let encoded = poly.encode(points);
    let decoded = poly.decode(encoded);

    shouldEqual(encoded.length, 533, "encoding is 533 characters");
    shouldEqual(stringify(decoded), stringify(points), "encode->decode");

    poly = new PolylineEncoder(6);

    encoded = poly.encode(points);
    decoded = poly.decode(encoded);

    shouldEqual(encoded.length, 632, "encoding is 632 characters");
    shouldEqual(stringify(decoded), stringify(points), "encode->decode");

});

describe("Snapshot", () => {
    it("Snapshot", () => {
        should(!!Snapshot, "Snapshot");
    })
});