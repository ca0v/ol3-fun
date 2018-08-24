import ol = require("openlayers");
import { debounce } from "../common";

export function run() {

    let map = new ol.Map({
        loadTilesWhileAnimating: true,
        loadTilesWhileInteracting: true,
        controls: [],
        interactions: [],
        target: document.getElementsByClassName("map")[0],
        view: new ol.View({
            center: [-8200000, 4000000],
            zoom: 3,
            projection: "EPSG:3857",
        }),
        layers: [new ol.layer.Tile({
            source: new ol.source.OSM()
        })]
    });

    let vectors = new ol.layer.Vector({
        source: new ol.source.Vector()
    });

    map.addLayer(vectors);

    let clearAll = debounce(() => vectors.getSource().clear(), 1000);

    let onClick = debounce((args: {
        coordinate: ol.Coordinate
    }) => {
        vectors.getSource().addFeature(new ol.Feature(new ol.geom.Point(args.coordinate)));
        clearAll();
    }, 100);


    map.on("click", <any>onClick);

}