/**
 * decouples API from implementation
 */
import {
	asArray,
	debounce,
	defaults,
	doif,
	getParameterByName,
	getQueryParameters,
	html,
	mixin,
	pair,
	parse,
	range,
	shuffle,
	toggle,
	uuid
} from "./ol3-fun/common";
import { cssin, loadCss } from "./ol3-fun/css";
import { zoomToFeature } from "./ol3-fun/navigation";
import { parse as dmsParse } from "./ol3-fun/parse-dms";
import { slowloop } from "./ol3-fun/slowloop";
import { extend as deepExtend } from "./ol3-fun/deep-extend";

let index = {
	asArray,
	cssin,
	loadCss,
	debounce,
	defaults,
	doif,
	deepExtend,
	getParameterByName,
	getQueryParameters,
	html,
	mixin,
	pair,
	parse,
	range,
	shuffle,
	toggle,
	uuid,
	slowloop,
	dms: {
		parse: dmsParse,
		fromDms: (dms: string) => dmsParse(dms) as { lon: number; lat: number },
		fromLonLat: (o: { lon: number; lat: number }) => dmsParse(o) as string
	},
	navigation: {
		zoomToFeature
	}
};

export = index;
