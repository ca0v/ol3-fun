import ol = require("openlayers");

function getStyle(feature: ol.Feature) {
	let style = feature.getStyle() as
		| ol.style.Style
		| ol.style.Style[]
		| ol.FeatureStyleFunction
		| ol.StyleFunction
		| null;
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

/**
 * Converts a feature to an image
 */
class Snapshot {
	/**
	 * @param canvas Canvas which will contain the feature
	 * @param feature Feature to render on the canvas, the style must be assigned to the style
	 */
	static render(canvas: HTMLCanvasElement, feature: ol.Feature) {
		// clone the feature to the geometry can be modified
		feature = feature.clone();
		let geom = feature.getGeometry() as ol.geom.Polygon;
		let extent = geom.getExtent();

		let [cx, cy] = ol.extent.getCenter(extent);
		let [w, h] = [ol.extent.getWidth(extent), ol.extent.getHeight(extent)];
		let isPoint = w === 0 || h === 0;
		let ff = 1 / (window.devicePixelRatio || 1);
		let scale = isPoint ? 1 : Math.min((ff * canvas.width) / w, (ff * canvas.height) / h);
		geom.translate(-cx, -cy); // center at 0,0
		geom.scale(scale, -scale); // fill the canvas, flipping the y axis
		geom.translate(Math.ceil((ff * canvas.width) / 2), Math.ceil((ff * canvas.height) / 2)); // move center to center of canvas

		let ctx = canvas.getContext("2d");
		if (!ctx) throw "unable to get canvas context";
		let vtx = ol.render.toContext(ctx);
		let styles = <ol.style.Style[]>(<any>getStyle(feature));
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
