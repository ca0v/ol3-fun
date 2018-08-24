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

    alert("check the console for failed assertions");

    let html = "<tr>A<td>B</td></tr>";
    let tr = <HTMLTableRowElement>toHtml(html);
    console.assert(tr.nodeValue === "AB", "setting innerHTML on a 'div' will not assign tr elements");

    html = "<table><tbody><tr><td>Test</td></tr></tbody></table>";
    let table = <HTMLTableElement>toHtml(html);
    console.assert(table.outerHTML === html);

    html = `<canvas width="100" height="100"></canvas>`;
    let canvas = <HTMLCanvasElement>toHtml(html);
    console.assert(canvas.outerHTML === html);
    console.assert(!!canvas.getContext("2d"));

    console.log("success!");
}