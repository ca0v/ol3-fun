import ol = require("openlayers");
import { defaults } from "./common";

/**
 * A less disorienting way of changing the maps extent (maybe!)
 * Zoom out until new feature is visible
 * Zoom to that feature
 */
export function zoomToFeature(map: ol.Map, feature: ol.Feature, options?: {
    duration?: number;
    padding?: number;
    minResolution?: number;
}) {

    options = defaults(options || {}, {
        duration: 1000,
        padding: 256,
        minResolution: 2 * map.getView().getMinResolution()
    });

    let view = map.getView();
    let currentExtent = view.calculateExtent(map.getSize());
    let targetExtent = feature.getGeometry().getExtent();

    let doit = (duration: number) => {
        view.fit(targetExtent, map.getSize(), {
            padding: [options.padding, options.padding, options.padding, options.padding],
            minResolution: options.minResolution,
            duration: duration
        });
    }

    if (ol.extent.containsExtent(currentExtent, targetExtent)) {
        // new extent is contained within current extent, pan and zoom in
        doit(options.duration);
    } else if (ol.extent.containsExtent(currentExtent, targetExtent)) {
        // new extent is contained within current extent, pan and zoom out
        doit(options.duration);
    }
    else {
        // zoom out until target extent is in view
        let fullExtent = ol.extent.createEmpty();
        ol.extent.extend(fullExtent, currentExtent);
        ol.extent.extend(fullExtent, targetExtent);
        let dscale = ol.extent.getWidth(fullExtent) / ol.extent.getWidth(currentExtent);
        let duration = 0.5 * options.duration;
        view.fit(fullExtent, map.getSize(), {
            padding: [options.padding, options.padding, options.padding, options.padding],
            minResolution: options.minResolution,
            duration: duration
        });
        setTimeout(() => doit(0.5 * options.duration), duration);
    }

}