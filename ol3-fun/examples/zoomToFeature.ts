import { zoomToFeature } from "../navigation";

export function run() {
    let map = new ol.Map({
        target: document.getElementsByClassName("map")[0],
        view: new ol.View({
            center: [0, 0],
            zoom: 15
        })
    });

    let graticule = new ol.Graticule({
        // the style to use for the lines, optional.
        maxLines: 500,
        strokeStyle: new ol.style.Stroke({
            color: 'rgba(255,120,0,0.9)',
            width: 2,
            lineDash: [0.5, 4]
        })
    });
    graticule.setMap(map);

setTimeout(() => {
    let feature = new ol.Feature();
    feature.setGeometry(new ol.geom.Point([-115, 35]));
    zoomToFeature(map, feature);
}, 5000);

}