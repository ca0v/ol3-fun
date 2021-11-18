import { Feature, Map, View } from "ol";
import { should } from "../base";
import { zoomToFeature } from "../../ol3-fun/navigation";
import Point from "ol/geom/Point";

describe("zoomToFeature", () => {
  it("zoomToFeature", (done) => {
    should(
      !!zoomToFeature,
      "zoomToFeature"
    );
    let map = new Map({
      view: new View({
        zoom: 0,
        center: [0, 0],
      }),
    });
    let feature = new Feature();
    let geom = new Point([100, 100]);
    feature.setGeometry(geom);

    map.once("postrender", () => {
      let res = map
        .getView()
        .getResolution();
      let zoom = map
        .getView()
        .getZoom();
      zoomToFeature(map, feature, {
        duration: 200,
        minResolution: res / 4,
      }).then(() => {
        let [cx, cy] = map
          .getView()
          .getCenter();
        should(
          map.getView().getZoom() ===
            zoom + 2,
          "zoom in two because minRes is 1/4 of initial res"
        );
        should(cx === 100, "center-x");
        should(cy === 100, "center-y");
        done();
      });
    });
  });
});
