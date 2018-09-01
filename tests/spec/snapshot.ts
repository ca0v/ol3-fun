import { should, stringify, shouldEqual } from "../base";
import Snapshot = require("ol3-fun/snapshot");
import ol = require("openlayers");
import { pair, range, html } from "ol3-fun/common";

const pointData = "data:image/png;base64,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";
const circleData = "data:image/png;base64,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";

function show(data: string) {
    document.body.appendChild(html(`<img src="${data}" />`));
}

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

    it("Converts a point to image data", () => {
        let feature = new ol.Feature(new ol.geom.Point([0, 0]));
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
                    width: 2,
                }),
                offsetY: 16
            })
        }));
        let data = Snapshot.snapshot(feature, 64);
        show(data);
        shouldEqual(data, pointData, "point");
    });

    it("Converts a polygon to image data", () => {
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
        show(data);
        let finalCoordinates = stringify(geom.getCoordinates());
        shouldEqual(originalCoordinates, finalCoordinates, "coordinates unchanged");
        shouldEqual(feature.getGeometry(), geom, "geom still assigned");
        shouldEqual(data, circleData, "circle data as expected");
    });

});