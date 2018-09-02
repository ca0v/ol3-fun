import ol = require("openlayers");
import { cssin, html as toHtml } from "../ol3-fun/common";
import { parse as dms } from "../ol3-fun/parse-dms";

cssin("html", `

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
`);

export function run() {

    alert("click the map to create a marker, enter 59 15 in the 'Enter Coordinates' area");

    let map = new ol.Map({
        loadTilesWhileAnimating: true,
        loadTilesWhileInteracting: true,
        controls: ol.control.defaults({
            attribution: false,
            rotate: true
        }),
        interactions: ol.interaction.defaults({
            zoomDuration: 1000
        }),
        overlays: [],
        target: document.getElementsByClassName("map")[0],
        view: new ol.View({
            center: [-8800000, 4000000],
            zoom: 15,
            projection: "EPSG:3857",
        }),
        layers: [new ol.layer.Tile({
            source: new ol.source.OSM()
        })]
    });

    map.on("click", (args: ol.MapBrowserPointerEvent) => {
        let location = new ol.geom.Point(args.coordinate);
        location.transform(map.getView().getProjection(), "EPSG:4326");

        let overlay = new ol.Overlay({
            insertFirst: true,
            positioning: "bottom-center",
            offset: [0, -5],
            element: toHtml(`
            <div class='notebook'>
            <h3>Hello World</h3>
            <table>
                <tr><td>X lon</td><td>${location.getFirstCoordinate()[0]}</td></tr>
                <tr><td>Y lat</td><td>${location.getFirstCoordinate()[1]}</td></tr>
            </table>
            <textarea placeholder='Describe Location'></textarea>
            </div>
            `),
            position: args.coordinate
        });
        map.addOverlay(overlay);
    });

    {
        document.body.appendChild(toHtml(`<div class='parse-container'><label>Enter Coordinates:</label><input class='parse' placeholder="59&deg;12'7.7&quot;N 02&deg;15'39.6&quot;W"/></div>`));
        let parseInput = <HTMLInputElement>document.body.getElementsByClassName("parse")[0];
        parseInput.addEventListener("change", () => {
            let result = dms(parseInput.value);
            if (typeof result === "number") {
                alert(result);
            } else {
                let location = new ol.geom.Point(<ol.Coordinate>[result.lon, result.lat]);
                location.transform("EPSG:4326", map.getView().getProjection());
                map.getView().setCenter(location.getFirstCoordinate());
            }
        });
    }

    let vectors = new ol.layer.Vector({
        source: new ol.source.Vector()
    });

    map.addLayer(vectors);

}