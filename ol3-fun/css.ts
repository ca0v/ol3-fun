/**
 * Adds exactly one instance of the CSS to the app with a mechanism
 * for disposing by invoking the destructor returned by this method.
 * Note the css will not be removed until the dependency count reaches
 * 0 meaning the number of calls to cssin('id') must match the number
 * of times the destructor is invoked.
 * let d1 = cssin('foo', '.foo { background: white }');
 * let d2 = cssin('foo', '.foo { background: white }');
 * d1(); // reduce dependency count
 * d2(); // really remove the css
 * @param name unique id for this style tag
 * @param css css content
 * @returns destructor
 */
export function cssin(
  name: string,
  css: string
) {
  let id = `style-${name}`;
  let styleTag = <HTMLStyleElement>(
    document.getElementById(id)
  );
  if (!styleTag) {
    styleTag =
      document.createElement("style");
    styleTag.id = id;
    styleTag.type = "text/css";
    document.head.appendChild(styleTag);
    styleTag.appendChild(
      document.createTextNode(css)
    );
  }

  let dataset = styleTag.dataset;
  dataset["count"] =
    parseInt(dataset["count"] || "0") +
    1 +
    "";

  return () => {
    dataset["count"] =
      parseInt(
        dataset["count"] || "0"
      ) -
      1 +
      "";
    if (dataset["count"] === "0") {
      styleTag.remove();
    }
  };
}

export function loadCss(options: {
  name: string;
  url?: string;
  css?: string;
}) {
  if (!options.name)
    throw "must provide a name to prevent css duplication";
  if (options.url && options.css)
    throw "cannot provide both a url and a css";
  if (options.css)
    return cssin(
      options.name,
      options.css
    );
  if (!options.url)
    throw "must provide either a url or css option";

  let id = `style-${options.name}`;
  let head =
    document.getElementsByTagName(
      "head"
    )[0];
  let link = <HTMLLinkElement>(
    document.getElementById(id)
  );
  if (!link) {
    link =
      document.createElement("link");
    link.id = id;
    link.type = "text/css";
    link.rel = "stylesheet";
    link.href = options.url;
    head.appendChild(link);
  }
  let dataset = link.dataset;
  dataset["count"] =
    parseInt(dataset["count"] || "0") +
    1 +
    "";
  return () => {
    dataset["count"] =
      parseInt(
        dataset["count"] || "0"
      ) -
      1 +
      "";
    if (dataset["count"] === "0") {
      link.remove();
    }
  };
}
