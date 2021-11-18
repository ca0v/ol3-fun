import {
  Map,
  MapEvent,
  Overlay,
  View,
} from "ol";
import { defaults as controlDefaults } from "ol/control";
import { Coordinate } from "ol/coordinate";
import Point from "ol/geom/Point";
import { defaults as interactionDefaults } from "ol/interaction";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import {
  TileDebug,
  Vector,
} from "ol/source";
import { createXYZ } from "ol/tilegrid";
import {
  cssin,
  html as toHtml,
} from "../index";
import { parse as dms } from "../ol3-fun/parse-dms";

cssin(
  "html",
  `

.notebook {
    background: white;
    border: 1px solid rgba(66,66,66,1);
    padding: 4px;
}

.notebook:after {
    content: "+";
    position: absolute;
    left: calc(50% - 5px);
}

.notebook textarea {
    width: 240px;
    height: 80px;
    background: rgb(250, 250, 210);
    resize: none;
}

.parse-container {
    position: absolute;
    top: 1em;
    right: 1em;
}
`
);

export function run() {
  alert(
    "click the map to create a marker, enter 59 15 in the 'Enter Coordinates' area"
  );

  let map = new Map({
    controls: controlDefaults({
      attribution: false,
      rotate: true,
    }),
    interactions: interactionDefaults({
      zoomDuration: 1000,
    }),
    overlays: [],
    target: <any>(
      document.querySelector(".map")
    ),
    view: new View({
      center: [-8800000, 4000000],
      zoom: 15,
      projection: "EPSG:3857",
    }),
    layers: [
      new TileLayer({
        source: new TileDebug({
          projection: "EPSG:3857",
          tileGrid: createXYZ({
            tileSize: 256,
          }),
        }),
      }),
    ],
  });

  map.on("click", (args: any) => {
    let location = new Point(
      args.coordinate
    );
    location.transform(
      map.getView().getProjection(),
      "EPSG:4326"
    );

    let overlay = new Overlay({
      insertFirst: true,
      positioning: <any>"bottom-center",
      offset: [0, -5],
      element: toHtml(`
            <div class='notebook'>
            <h3>Hello World</h3>
            <table>
                <tr><td>X lon</td><td>${
                  location.getFirstCoordinate()[0]
                }</td></tr>
                <tr><td>Y lat</td><td>${
                  location.getFirstCoordinate()[1]
                }</td></tr>
            </table>
            <textarea placeholder='Describe Location'></textarea>
            </div>
            `),
      position: args.coordinate,
    });
    map.addOverlay(overlay);
  });

  {
    document.body.appendChild(
      toHtml(
        `<div class='parse-container'><label>Enter Coordinates:</label><input class='parse' placeholder="59&deg;12'7.7&quot;N 02&deg;15'39.6&quot;W"/></div>`
      )
    );
    let parseInput = <HTMLInputElement>(
      document.body.getElementsByClassName(
        "parse"
      )[0]
    );
    parseInput.addEventListener(
      "change",
      () => {
        let result = dms(
          parseInput.value
        );
        if (
          typeof result === "number"
        ) {
          alert(result);
        } else {
          let location = new Point(<
            Coordinate
          >[result.lon, result.lat]);
          location.transform(
            "EPSG:4326",
            map
              .getView()
              .getProjection()
          );
          map
            .getView()
            .setCenter(
              location.getFirstCoordinate()
            );
        }
      }
    );
  }

  let vectors = new VectorLayer({
    source: new Vector(),
  });

  map.addLayer(vectors);
}
