/**
 * decouples API from implementation
 */
import {
    asArray,
    cssin,
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
    uuid,
} from "./ol3-fun/common";
import { zoomToFeature } from "./ol3-fun/navigation";
import { parse as dmsParse } from "./ol3-fun/parse-dms";
import { slowloop } from "./ol3-fun/slowloop";

let index = {
    asArray,
    cssin,
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
    uuid,
    slowloop,
    dms: {
        parse: dmsParse,
    },
    navigation: {
        zoomToFeature,
    },
};

export = index;
