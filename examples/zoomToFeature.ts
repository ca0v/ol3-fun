import { Feature, Map, View } from "ol";
import { zoomToFeature } from "../ol3-fun/navigation";
import {
  range,
  shuffle,
} from "../ol3-fun/common";
import { Coordinate } from "ol/coordinate";
import {
  Tile,
  Vector as VectorLayer,
} from "ol/layer";
import { OSM, Vector } from "ol/source";
import {
  Circle,
  Text,
  Fill,
  Stroke,
  Style,
} from "ol/style";
import {
  Point,
  Polygon,
} from "ol/geom";
import { Select } from "ol/interaction";

function randomCoordinate(
  size = 100,
  [x, y] = [-8238299, 4970071]
) {
  return <Coordinate>[
    x + size * Math.random(),
    y + size * Math.random(),
  ];
}

export function run() {
  let tiles = new Tile({
    source: new OSM(),
  });

  let vectors = new VectorLayer({
    source: new Vector(),
    style: (
      feature: Feature,
      resolution: number
    ) => {
      let style = new Style({});

      switch (
        feature.getGeometry().getType()
      ) {
        case "Point":
          style.setImage(
            new Circle({
              radius: 20,
              fill: new Fill({
                color:
                  "rgba(60, 60, 60, 0.1)",
              }),
              stroke: new Stroke({
                color:
                  "rgba(60, 66, 60, 0.1)",
                width: 1,
              }),
            })
          );
          break;
        case "Polygon":
          style.setFill(
            new Fill({
              color:
                "rgba(60, 6, 60, 0.1)",
            })
          );
          style.setStroke(
            new Stroke({
              color:
                "rgba(60, 60, 60, 0.1)",
              width: 1,
            })
          );
          break;
      }

      return style;
    },
  });

  let map = new Map({
    target: <any>(
      document.querySelector(".map")
    ),
    view: new View({
      center: [-8200000, 4000000],
      zoom: 3,
      projection: "EPSG:3857",
    }),
    layers: [tiles, vectors],
  });

  let points = range(10).map(
    (n) =>
      new Feature(
        new Point(randomCoordinate(500))
      )
  );

  let polys = range(10).map((n) => {
    let p0 = randomCoordinate(1000);
    let geom = new Polygon([
      [
        p0,
        randomCoordinate(50, [
          p0[0] + 50,
          p0[1] + 50,
        ]),
        [p0[0] + 100, p0[1] + 100],
        p0,
      ],
    ]);
    let feature = new Feature(geom);
    return feature;
  });

  let geoms = [].concat(points, polys);
  shuffle(geoms);

  vectors
    .getSource()
    .addFeatures(geoms);

  let select = new Select({
    style: (feature: Feature) => {
      let style = new Style({
        text: new Text({
          text:
            1 +
            geoms.indexOf(feature) +
            "",
          fill: new Fill({
            color: "black",
          }),
          stroke: new Stroke({
            color: "white",
            width: 2,
          }),
        }),
      });

      switch (
        feature.getGeometry().getType()
      ) {
        case "Point":
          style.setImage(
            new Circle({
              radius: 20,
              fill: new Fill({
                color:
                  "rgba(60, 6, 60, 0.6)",
              }),
              stroke: new Stroke({
                color:
                  "rgba(60, 6, 60, 0.6)",
                width: 1,
              }),
            })
          );
          break;
        case "Polygon":
          style.setFill(
            new Fill({
              color:
                "rgba(60, 6, 60, 0.6)",
            })
          );
          style.setStroke(
            new Stroke({
              color:
                "rgba(60, 6, 60, 0.6)",
              width: 1,
            })
          );
          break;
      }

      return style;
    },
  });

  select.setMap(map);

  geoms.forEach((f, i) =>
    setTimeout(() => {
      let features =
        select.getFeatures();
      features.insertAt(0, f);
      zoomToFeature(map, f);
      while (features.getLength() > 2)
        features.removeAt(2);
      if (i === geoms.length - 1) {
        setTimeout(() => {
          features.clear();
          geoms.forEach((f) =>
            features.push(f)
          );
        }, 1000);
      }
    }, 1000 + i * 2000)
  );
}
