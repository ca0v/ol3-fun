import { run as debounce } from "./debounce";
import { run as goto } from "./goto";
import { run as polyline } from "./polyline";
import { run as zoomToFeature } from "./zoomToFeature";
import { run as jsondiff } from "./jsondiff";
import { getQueryParameters } from "../ol3-fun/common";

const examples = {
  debounce,
  goto,
  polyline,
  zoomToFeature,
  jsondiff,
};

export async function run() {
  const l = window.location;

  const query = getQueryParameters(
    { run: "examples/index" },
    l.search
  );

  if (query.run) {
    if (examples[query.run]) {
      examples[query.run]();
      return;
    }
  }
  const path = `${l.origin}${l.pathname}?run=`;

  const styles =
    document.createElement("style");
  document.head.appendChild(styles);

  styles.innerText += `
    #map {
        display: none;
    }
    .test {
        margin: 20px;
    }
    `;

  const labDiv =
    document.createElement("div");
  document.body.appendChild(labDiv);

  labDiv.innerHTML = Object.keys(
    examples
  )
    .map((v) => v.trim())
    .filter((v) => !!v)
    //.sort()
    .map(
      (lab) =>
        `<div class='test'><a href='${path}${lab}&debug=1'>${lab}</a></div>`
    )
    .join("\n");
}
