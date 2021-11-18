import { Feature, Map } from "ol";
import { defaults } from "./common";
import {
  containsExtent,
  createEmpty,
  extend,
  getWidth,
} from "ol/extent";
import { Geometry } from "ol/geom";

/**
 * A less disorienting way of changing the maps extent (maybe!)
 * Zoom out until new feature is visible
 * Zoom to that feature
 * @param map The openlayers map
 * @param feature The feature to zoom to
 * @param options Animation constraints
 */
export async function zoomToFeature(
  map: Map,
  feature: Feature<Geometry>,
  ops?: {
    // animation duration in milliseconds
    duration?: number;
    // number of pixels to pad around final extent
    padding?: number;
    // maximum zoom level as a resolution
    minResolution?: number;
  }
) {
  return new Promise<void>(
    (good, bad) => {
      let options = defaults(
        ops || {},
        {
          duration: 1000,
          padding: 256,
          minResolution:
            2 *
            map
              .getView()
              .getMinResolution(),
        }
      );

      let view = map.getView();
      let currentExtent =
        view.calculateExtent(
          map.getSize()
        );
      let targetExtent = feature
        ?.getGeometry()
        ?.getExtent();

      let doit = (duration: number) => {
        view.fit(targetExtent!, {
          size: map.getSize(),
          padding: [
            options.padding,
            options.padding,
            options.padding,
            options.padding,
          ],
          minResolution:
            options.minResolution,
          duration: duration,
          callback: () => good(),
        });
      };

      if (
        targetExtent &&
        containsExtent(
          currentExtent,
          targetExtent
        )
      ) {
        // new extent is contained within current extent, pan and zoom in
        doit(options.duration);
      } else if (
        targetExtent &&
        containsExtent(
          currentExtent,
          targetExtent
        )
      ) {
        // new extent is contained within current extent, pan and zoom out
        doit(options.duration);
      } else {
        // zoom out until target extent is in view
        let fullExtent = createEmpty();
        extend(
          fullExtent,
          currentExtent
        );
        targetExtent &&
          extend(
            fullExtent,
            targetExtent
          );
        let dscale =
          getWidth(fullExtent) /
          getWidth(currentExtent);
        let duration =
          0.5 * options.duration;
        view.fit(fullExtent, {
          size: map.getSize(),
          padding: [
            options.padding,
            options.padding,
            options.padding,
            options.padding,
          ],
          minResolution:
            options.minResolution,
          duration: duration,
        });
        setTimeout(
          () =>
            doit(
              0.5 * options.duration
            ),
          duration
        );
      }
    }
  );
}
