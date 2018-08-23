require("expect.js");
import { asArray, uuid } from "../ol3-fun/common";

function should(result: boolean, msg: string) {
    if (!result) throw msg || "oops";
}

describe("expect", () => {
    it("expect", () => {
        should(!!expect, "expect is defined");
    });
});

describe("asArray tests", () => {

    it("asArray", done => {
        document.body.appendChild(document.createElement("div"));
        let list = document.getElementsByTagName("div");
        console.log("list", list);
        let result = asArray(list);
        console.log("result", result, result.length);
        should(result.length === list.length, "array size matches list size");
        done();
    });

});

describe("uuid tests", () => {
    it("uuid", () => {
        should(uuid().length === 36, "uuid has 36 characters");
    });
});