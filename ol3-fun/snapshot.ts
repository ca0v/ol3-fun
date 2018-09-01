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

    /**
     * @param canvas Canvas which will contain the feature
     * @param feature Feature to render on the canvas, the style must be assigned to the style
     */
    static render(canvas: HTMLCanvasElement, feature: ol.Feature) {
        feature = feature.clone();
        let geom = feature.getGeometry() as ol.geom.SimpleGeometry;
        let extent = geom.getExtent();

        let [cx, cy] = ol.extent.getCenter(extent);
        let [w, h] = [ol.extent.getWidth(extent), ol.extent.getHeight(extent)];
        let isPoint = w === 0 || h === 0;
        let scale = isPoint ? 1 : Math.min(canvas.width / w, canvas.height / h);

        geom.translate(-cx, -cy);
        geom.scale(scale, -scale);
        geom.translate(canvas.width / 2, canvas.height / 2);

        console.log(scale, cx, cy, w, h);

        let vtx = ol.render.toContext(canvas.getContext("2d"));
        let styles = <ol.style.Style[]><any>getStyle(feature);
        if (!Array.isArray(styles)) styles = <any>[styles];
        styles.forEach(style => vtx.drawFeature(feature, style));
    }

    /**
     * @param feature Feature to render as image data
     * @return convert features into data:image/png;base64;  
     */
    static snapshot(feature: ol.Feature, size = 128) {
        let canvas = document.createElement("canvas");
        canvas.width = canvas.height = size;
        this.render(canvas, feature);
        return canvas.toDataURL();
    }
}

export = Snapshot;