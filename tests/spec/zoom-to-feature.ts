import { Feature, Map, View } from "ol";
import { should } from "../base";
import { zoomToFeature } from "../../ol3-fun/navigation";
import Point from "ol/geom/Point";
import { cssin } from "../../index";

describe("zoomToFeature", () => {
  const un = [] as Array<() => void>;

  after(() => {
    un.forEach((f) => f());
  });

  before(() => {
    const div =
      document.createElement("div");
    div.id = "map";
    document.body.appendChild(div);
    un.push(() => div.remove());
    un.push(
      cssin(
        "zoom-to-feature",
        `#map {width:20em;height:20em;border:1px solid red}`
      )
    );
  });

  it("zoomToFeature", (done) => {
    should(
      !!zoomToFeature,
      "zoomToFeature"
    );
    const map = new Map({
      view: new View({
        zoom: 0,
        center: [0, 0],
      }),
      target: "map",
    });
    const feature = new Feature();
    const geom = new Point([100, 100]);
    feature.setGeometry(geom);

    map.once("postrender", () => {
      const res = map
        .getView()
        .getResolution()!;

      const zoom = map
        .getView()
        .getZoom()!;

      zoomToFeature(map, feature, {
        duration: 200,
        minResolution: res / 4,
      }).then(() => {
        let [cx, cy] = map
          .getView()
          .getCenter()!;
        should(
          map.getView().getZoom() ===
            zoom + 2,
          "zoom in two because minRes is 1/4 of initial res"
        );
        should(cx === 100, "center-x");
        should(cy === 100, "center-y");
        done();

        map.dispose();
      });
    });
  });
});
