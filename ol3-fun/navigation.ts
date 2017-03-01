import ol = require("openlayers");

/**
 * A less disorienting way of changing the maps extent
 */
export function zoomToFeature(map: ol.Map, feature: ol.Feature, duration = 2500) {
    let extent = feature.getGeometry().getExtent();
    let w1 = ol.extent.getWidth(map.getView().calculateExtent(map.getSize()));
    let w2 = ol.extent.getWidth(extent);

    map.getView().animate(
        {
            center: ol.extent.getCenter(extent),
            duration: duration
        },
        {
            zoom: map.getView().getZoom() + Math.round(Math.log(w1 / w2) / Math.log(2)) - 1,
            duration: duration
        }, () => {
            map.getView().fit(feature.getGeometry().getExtent(), map.getSize());
        });

}