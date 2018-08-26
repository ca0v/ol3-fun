import ol = require("openlayers");
import { debounce } from "../ol3-fun/common";

export function run() {

    let msgs = ["Allowing 0.1 seconds between clicks, click the map multiple times to create markers, they will clear after 1 second of being idle", "uses debounce to prevent user from clicking too fast and to clear markers after on second if no clicking"];
    console.log(msgs);
    alert(msgs.join("\n"));

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