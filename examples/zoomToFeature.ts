import ol = require("openlayers");
import { zoomToFeature } from "../ol3-fun/navigation";
import { range, shuffle } from "../ol3-fun/common";

function randomCoordinate(size = 100, [x, y] = [-8238299, 4970071]) {
    return <ol.Coordinate>[x + size * Math.random(), y + size * Math.random()];
}

export function run() {
    let tiles = new ol.layer.Tile({
        source: new ol.source.OSM()
    });

    let vectors = new ol.layer.Vector({
        source: new ol.source.Vector(),
        style: (feature: ol.Feature, resolution: number) => {

            let style = new ol.style.Style({
            });

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

    let map = new ol.Map({
        loadTilesWhileAnimating: true,
        loadTilesWhileInteracting: true,
        target: document.getElementsByClassName("map")[0],
        view: new ol.View({
            center: [-8200000, 4000000],
            zoom: 3,
            projection: "EPSG:3857",
        }),
        layers: [tiles, vectors]
    });

    let points = range(10).map(n =>
        new ol.Feature(new ol.geom.Point(randomCoordinate(500))));

    let polys = range(10).map(n => {
        let p0 = randomCoordinate(1000);
        let geom = new ol.geom.Polygon([[
            p0,
            randomCoordinate(50, [p0[0] + 50, p0[1] + 50]),
            [p0[0] + 100, p0[1] + 100],
            p0]]);
        let feature = new ol.Feature(geom);
        return feature;
    });

    let geoms = [].concat(points, polys);
    shuffle(geoms);

    vectors.getSource().addFeatures(geoms);

    let select = new ol.interaction.Select({
        style: (feature: ol.Feature) => {
            let style = new ol.style.Style({
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

    geoms.forEach((f, i) => setTimeout(() => {
        let features = select.getFeatures();
        features.insertAt(0, f);
        zoomToFeature(map, f);
        while (features.getLength() > 2) features.removeAt(2);
        if (i === geoms.length - 1) {
            setTimeout(() => {
                features.clear();
                geoms.forEach(f => features.push(f));
            }, 1000);
        }
    }, 1000 + i * 2000));

}