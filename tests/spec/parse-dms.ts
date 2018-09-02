import { should } from "../base";
import { parse } from "ol3-fun/parse-dms";

describe("parse-dms", () => {
    it("parse", () => {
        let dms = parse(`10 5'2" 10`);
        if (typeof dms === "number") throw "lat-lon expected";
        should(dms.lat === 10.08388888888889, "10 degrees 5 minutes 2 seconds");
        should(dms.lon === 10, "10 degrees 0 minutes 0 seconds");
    });
});

