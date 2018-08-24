import ol = require("openlayers");

function getStyle(feature: ol.Feature) {
    let style = feature.getStyle();
    if (!style) {
        let styleFn = feature.getStyleFunction();
        if (styleFn) {
            style = styleFn(0);
        }
    }
    if (!style) {
        style = new ol.style.Style({
            text: new ol.style.Text({
                text: "?"
            })
        });
    }
    if (!Array.isArray(style)) style = <any>[style];
    return <ol.style.Style[]>style;
}

class Snapshot {

    static render(canvas: HTMLCanvasElement, feature: ol.Feature) {
        feature = feature.clone();
        let geom = feature.getGeometry() as ol.geom.SimpleGeometry;
        let extent = geom.getExtent();

        let isPoint = extent[0] === extent[2];
        let [dx, dy] = ol.extent.getCenter(extent);
        let scale = isPoint ? 1 : Math.min(canvas.width / ol.extent.getWidth(extent), canvas.height / ol.extent.getHeight(extent));

        geom.translate(-dx, -dy);
        geom.scale(scale, -scale);
        geom.translate(canvas.width / 2, canvas.height / 2);

        let vtx = ol.render.toContext(canvas.getContext("2d"));
        let styles = <ol.style.Style[]><any>getStyle(feature);
        if (!Array.isArray(styles)) styles = <any>[styles];
        styles.forEach(style => vtx.drawFeature(feature, style));
    }

    /**
     * convert features into data:image/png;base64;  
     */
    static snapshot(feature: ol.Feature) {
        let canvas = document.createElement("canvas");
        let geom = feature.getGeometry();
        this.render(canvas, feature);
        return canvas.toDataURL();
    }
}

export = Snapshot;