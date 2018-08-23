import { expect } from "expect.js";
import { asArray, uuid } from "../ol3-fun/common";

function should(result: boolean) {
    if (!result) throw "oops";
}

describe("expect", () => {
    it("expect", () => {
        should(expect === undefined); // not sure how to get this reference
    });
});

describe("asArray tests", () => {

    it("asArray", done => {
        document.body.appendChild(document.createElement("div"));
        let list = document.getElementsByTagName("div");
        console.log("list", list);
        let result = asArray(list);
        console.log("result", result, result.length);
        should(result.length === list.length);
        done();
    });

});

describe("uuid tests", () => {
    it("uuid", () => {
        should(uuid().length === 36);
    });
});