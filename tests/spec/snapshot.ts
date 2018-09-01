import { should } from "../base";
import Snapshot = require("ol3-fun/snapshot");
import ol = require("openlayers");
import { pair, range, html } from "ol3-fun/common";

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
        let geom = new ol.geom.Polygon([circle(1)]);
        let feature = new ol.Feature(geom);
        feature.setStyle(new ol.style.Style({
            fill: new ol.style.Fill({
                color: "black"
            }),
            stroke: new ol.style.Stroke({
                color: "blue",
                width: 3
            })
        }));
        let data = Snapshot.snapshot(feature, 64);
        should(!!data, "snapshot returns data");
        document.body.appendChild(html(`<img src="${data}" />`));
        throw "here i am"
    });

});