import {
  html as toDom,
  cssin,
  debounce,
  deepExtend,
} from "../index";
import { stringify } from "../../ol3-fun/tests/base";
import featureserver = require("./extras/data/featureserver");
import mapserver = require("./extras/data/mapserver");

const css = `
textarea {
    background: black;
    color: white;
    min-width: 400px;
    min-height: 600px;
    white-space: nowrap;  
    overflow: auto;
}
`;

const html = `
<table>
    <tr>
    <td><label for="json1">Input 1</label></td>
    <td><label for="json2">Input 2</label></td>
    <td><label for="result">Diff</label></td></tr>
    <tr>
    <td><textarea id="json1" class="json-editor">{"a": 1}</textarea></td>
    <td><textarea id="json2" class="json-editor">{"b": 2}</textarea></td>
    <td><textarea id="result" class="json-editor">[result]</textarea></td>
    </tr>
    </table>
</div>
`;

function forcePath(
  o: any,
  path: Array<string>
) {
  let node = o;
  path.forEach(
    (n) =>
      (node = node[n] =
        node[n] || <any>{})
  );
  return node;
}

function diff(
  trace: Array<{
    path: Array<string>;
    value: any;
  }>
) {
  let result = <any>{};
  trace.forEach((t) => {
    let path = t.path.slice();
    let key = path.pop();
    forcePath(result, path)[key] =
      t.value;
  });
  return result;
}

export function run() {
  cssin("jsondiff", css);
  document
    .getElementById("map")
    .remove();
  document.body.appendChild(
    toDom(html)
  );
  let left = document.getElementById(
    "json1"
  ) as HTMLTextAreaElement;
  let right = document.getElementById(
    "json2"
  ) as HTMLTextAreaElement;
  let target = document.getElementById(
    "result"
  ) as HTMLTextAreaElement;
  let trace = <any>[];
  let doit = debounce(() => {
    try {
      let js1 = JSON.parse(left.value);
      let js2 = JSON.parse(right.value);
      deepExtend(
        js1,
        js2,
        (trace = [])
      );
      target.value = stringify(
        diff(trace)
      );
    } catch (ex) {
      target.value = ex;
    }
  }, 200);
  left.addEventListener("keydown", () =>
    doit()
  );
  right.addEventListener(
    "keydown",
    () => doit()
  );
  left.value = stringify(mapserver);
  right.value = stringify(
    featureserver
  );
  doit();
}
