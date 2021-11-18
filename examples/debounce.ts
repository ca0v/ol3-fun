import { Feature, Map, View } from "ol";
import {
  Tile,
  Vector as VectorLayer,
} from "ol/layer";
import { debounce } from "../ol3-fun/common";
import {
  TileDebug,
  Vector,
} from "ol/source";
import { createXYZ } from "ol/tilegrid";
import { Coordinate } from "ol/coordinate";
import Point from "ol/geom/Point";

export function run() {
  let msgs = [
    "Allowing 0.1 seconds between clicks, click the map multiple times to create markers, they will clear after 1 second of being idle",
    "uses debounce to prevent user from clicking too fast and to clear markers after on second if no clicking",
  ];
  console.log(msgs);
  alert(msgs.join("\n"));

  let map = new Map({
    controls: [],
    interactions: [],
    target: document.querySelector(
      ".map"
    ) as HTMLElement,
    view: new View({
      center: [-8200000, 4000000],
      zoom: 3,
      projection: "EPSG:3857",
    }),
    layers: [
      new Tile({
        source: new TileDebug({
          projection: "EPSG:3857",
          tileGrid: createXYZ({
            tileSize: 256,
          }),
        }),
      }),
    ],
  });

  let vectors = new VectorLayer({
    source: new Vector(),
  });

  map.addLayer(vectors);

  let clearAll = debounce(
    () => vectors.getSource().clear(),
    1000
  );

  let onClick = debounce(
    (args: {
      coordinate: Coordinate;
    }) => {
      vectors
        .getSource()
        .addFeature(
          new Feature(
            new Point(args.coordinate)
          )
        );
      clearAll();
    },
    100
  );

  map.on("click", <any>onClick);
}
