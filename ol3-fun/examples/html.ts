import ol = require("openlayers");
import { cssin, html as toHtml } from "../common";

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
`);

export function run() {
    let html = "<tr><td>Test</td></tr>";
    let tr = <HTMLTableRowElement>toHtml(html);
    console.assert(tr === null);

    html = "<table><tbody><tr><td>Test</td></tr></tbody></table>";
    let table = <HTMLTableElement>toHtml(html);
    console.assert(table.outerHTML === html);

    html = `<canvas width="100" height="100"></canvas>`;
    let canvas = <HTMLCanvasElement>toHtml(html);
    console.assert(canvas.outerHTML === html);
    console.assert(!!canvas.getContext("2d"));

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
        let overlay = new ol.Overlay({
            insertFirst: true,
            positioning: "bottom-center",
            offset: [0, -5],
            element: toHtml(`
            <div class='notebook'>
            <h3>Hello World</h3>
            <table>
                <tr><td>X lon</td><td>${args.coordinate[0]}</td></tr>
                <tr><td>Y lat</td><td>${args.coordinate[1]}</td></tr>
            </table>
            <textarea placeholder='Describe Location'></textarea>
            </div>
            `),
            position: args.coordinate
        });
        map.addOverlay(overlay);
    });


    let vectors = new ol.layer.Vector({
        source: new ol.source.Vector()
    });

    map.addLayer(vectors);

}