import { should } from "../base";
import * as ol from "openlayers";

describe("ol/Map", () => {
    it("ol/Map", () => {
        should(!!ol.Map, "Map");
    });
});
