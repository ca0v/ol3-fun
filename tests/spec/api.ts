import { describe, it, should, shouldEqual } from "../base";
import * as API from "../../index";

describe("API", () => {
    it("full api exists", () => {
        shouldEqual(
            [
                API.asArray,
                API.cssin,
                API.debounce,
                API.defaults,
                API.dms.parse,
                API.doif,
                API.getParameterByName,
                API.getQueryParameters,
                API.html,
                API.mixin,
                API.navigation.zoomToFeature,
                API.pair,
                API.parse,
                API.range,
                API.shuffle,
                API.slowloop,
                API.toggle,
                API.uuid,
            ].every((f) => typeof f === "function"),
            true,
            "API functions exist",
        );
    });
});
