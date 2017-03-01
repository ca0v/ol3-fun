import { html as toHtml } from "../common";

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
    canvas.getContext("2d");
}