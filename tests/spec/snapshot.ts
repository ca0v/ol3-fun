import { should, stringify, shouldEqual } from "../base";
import Snapshot = require("ol3-fun/snapshot");
import ol = require("openlayers");
import { pair, range, html } from "ol3-fun/common";

const circleData = "data:image/png;base64,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";

function circle(radius = 1, points = 36) {
    if (points < 3) throw "a circle must contain at least three points";
    if (radius <= 0) throw "a circle must have a positive radius";
    let a = 0;
    let dr = (2 * Math.PI) / (points - 1);
    let result = new Array(points) as Array<[number, number]>;
    for (let i = 0; i < points; i++) {
        result[i] = [radius * Math.sin(a), radius * Math.cos(a)];
        a += dr;
    }
    return result;
}

describe("Snapshot", () => {
    it("Snapshot", () => {
        should(!!Snapshot, "Snapshot");
        should(!!Snapshot.render, "Snapshot.render");
        should(!!Snapshot.snapshot, "Snapshot.snapshot");
    });

    it("Converts a feature to image data", () => {
        let geom = new ol.geom.Polygon([circle(3 + 100 * Math.random())]);
        let feature = new ol.Feature(geom);
        shouldEqual(feature.getGeometry(), geom, "geom still assigned");

        feature.setStyle(new ol.style.Style({
            fill: new ol.style.Fill({
                color: "black"
            }),
            stroke: new ol.style.Stroke({
                color: "blue",
                width: 3
            })
        }));
        let originalCoordinates = stringify(geom.getCoordinates());
        let data = Snapshot.snapshot(feature, 64);
        console.log(data);
        should(!!data, "snapshot returns data");
        document.body.appendChild(html(`<img src="${data}" />`));
        let finalCoordinates = stringify(geom.getCoordinates());
        shouldEqual(originalCoordinates, finalCoordinates, "coordinates unchanged");
        shouldEqual(feature.getGeometry(), geom, "geom still assigned");
        shouldEqual(data, circleData, "circle data as expected");
    });

});