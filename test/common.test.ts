// already loaded as globals...not sure how, requires declaration for tsc to compile...what's going on here?
// declare var describe: any;
// declare var it: any;
declare var require: any;

// unsure how to do this using standard syntax and typings don't seem to correlate with the "expect" I'm getting
// // Type definitions for Expect 1.20, expect.version = '0.3.1' so I might be loading the wrong defs!
//import expect from "expect";
import expect = require("expect"); // only works when using karma+webpack

import {
    asArray,
    pair,
    uuid
} from "../ol3-fun/common";

function should(result: boolean, msg: string) {
    if (!result) throw msg || "oops";
}

describe("expect", () => {
    it("expect", () => {
        should(!!expect, "expect is defined");
        expect(true).toBe(true);
    });
});

describe("common", () => {

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

    describe("pair", () => {

        function sum(list: number[]) {
            return list.reduce((a, b) => a + b, 0);
        }

        it("empty test", () => {
            should(0 === pair([], []).length, "empty result");
            should(0 === pair([1], []).length, "empty result");
            should(0 === pair([], [1]).length, "empty result");
        });

        it("ensures all combinations", () => {
            let A = [1, 3, 5], B = [7, 11, 13], result = pair(A, B);
            console.log(JSON.stringify({ A: sum(A), B: sum(B), result }));
            should((A.length * sum(B) + B.length * sum(A)) === sum(result.map(v => v[0] + v[1])), "create product from two vectors");
        })
    });


});