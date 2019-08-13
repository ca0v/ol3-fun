// unsure how to do this using standard syntax and typings don't seem to correlate with the "expect" I'm getting
// // Type definitions for Expect 1.20, expect.version = '0.3.1' so I might be loading the wrong defs!
//import expect from "expect";
//import * as expect from "expect"; // only works when using karma+webpack
import { should, shouldEqual } from "../base";

import {
    asArray,
    pair,
    parse,
    range,
    shuffle,
    html,
    toggle,
    uuid,
    doif,
    mixin,
    defaults,
    cssin
} from "../../ol3-fun/common";

function sum(list: number[]) {
    return list.reduce((a, b) => a + b, 0);
}

describe("expect", () => {
    it("expect", () => {
        // should(!!expect, "expect is defined");
        // expect(true).toBe(true);
    });
});

describe("common", () => {

    describe("asArray tests", () => {

        it("asArray", done => {
            if (!document) return;
            document.body.appendChild(document.createElement("div"));
            let list = document.getElementsByTagName("div");
            let result = asArray(<any>list);
            should(result.length === list.length, "array size matches list size");
            done();
        });

    });

    describe("uuid tests", () => {
        it("uuid", () => {
            should(uuid().length === 36, "uuid has 36 characters");
        });
    });

    describe("pair tests", () => {

        it("empty test", () => {
            should(0 === pair([], []).length, "empty result");
            should(0 === pair([1], []).length, "empty result");
            should(0 === pair([], [1]).length, "empty result");
        });

        it("ensures all combinations", () => {
            let A = [1, 3, 5], B = [7, 11, 13], result = pair(A, B);
            should((A.length * sum(B) + B.length * sum(A)) === sum(result.map(v => v[0] + v[1])), "create product from two vectors");
        })
    });

    describe("range tests", () => {

        it("empty test", () => {
            should(0 === range(0).length, "empty result");
        });

        it("size tests", () => {
            should(1 === range(1).length, "single item");
            should(10 === range(10).length, "ten items");
        });

        it("content tests", () => {
            should(45 === sum(range(10)), "range '10' contains 0..9");
        });

    });

});

describe("shuffle tests", () => {

    it("empty test", () => {
        should(0 === shuffle([]).length, "empty result");
    });

    it("size tests", () => {
        should(1 === shuffle(range(1)).length, "single item");
        should(10 === shuffle(range(10)).length, "ten items");
    });

    it("content tests", () => {
        should(45 === sum(shuffle(range(10))), "range '10' contains 0..9");
    });
});

describe("toggle tests", () => {

    it("toggle", () => {
        let div = document.createElement("div");
        should(div.className === "", "div contains no className");
        toggle(div, "foo");
        should(div.className === "foo", "toggle adds");
        toggle(div, "foo");
        should(div.className === "", "second toggles removes");
        toggle(div, "foo", true);
        should(div.className === "foo", "forces foo to exist when it does not exist");
        toggle(div, "foo", true);
        should(div.className === "foo", "forces foo to exist when it already exists");
        toggle(div, "foo", false);
        should(div.className === "", "forces foo to not exist");
        toggle(div, "foo", false);
        should(div.className === "", "forces foo to not exist");
    });

});

describe("parse tests", () => {

    it("parse", () => {
        let num = 0;
        let bool = false;
        should(parse("", "").toString() === "", "empty string");
        should(parse("1", "").toString() === "1", "numeric string");
        should(parse("1", num) === 1, "numeric string as number returns number");
        should(parse("0", bool) === false, "0 as boolean is false");
        should(parse("1", bool as boolean) === true, "1 as boolean is true");
        should(parse("false", bool) === false, "'false' as boolean is false");
        should(parse("true", bool as boolean) === true, "'true' as boolean is true");
        should(parse("1", num) === 1, "numeric string as number returns number");
        should(parse("1", num) === 1, "numeric string as number returns number");
        should(parse("1,2,3", [num])[1] === 2, "parse into numeric array");
    });

});

describe("getQueryParameters tests", () => {

});

describe("getParameterByName tests", () => {

});

describe("doif tests", () => {

    it("tests false, null and undefined", () => {
        let run = false;
        let yes = () => run = true;
        let no = () => run = false;
        no(); doif(false, yes); should(run, "false is a value");
        no(); doif(null, yes); should(!run, "null is a not a value");
        no(); doif(undefined, yes); should(!run, "undefined is not a value");
    });
});

describe("mixin tests", () => {
    it("tests mixin of mixin", () => {
        let a = { a: "a" };
        let b = { b: "b" };
        let c = { c: "c" };
        let ab = mixin(a, b);
        let bc = mixin(b, c);
        bc.b = "bc.b";
        let abc = mixin(ab, bc);
        should(abc.a === ab.a, "abc.a");
        should(abc.b === bc.b, "abc.b");
        should(abc.c === bc.c, "abc.c");
    });
});

describe("defaults tests", () => {
    it("tests defaults", () => {
        let initialOptions = { color: "blue" };
        let defaultOptions = { color: "red", volume: 10 };
        let finalOptions = defaults(initialOptions, defaultOptions);
        should(finalOptions.color === "blue", "blue was provided as initial option");
        should(finalOptions.volume === 10, "volume was not initially provided so uses the default");
    });
});


describe("cssin tests", () => {
    let originalBackgroundColor = window.getComputedStyle(document.body).backgroundColor;
    it("paint background red", done => {
        let css = `body { background-color: red}`;
        let dispose = cssin("spec-common-cssin-1", css);
        let backgroundColor = window.getComputedStyle(document.body).backgroundColor;
        should(backgroundColor === "rgb(255, 0, 0)", "body is red");
        dispose();
        backgroundColor = window.getComputedStyle(document.body).backgroundColor;
        should(backgroundColor === originalBackgroundColor, "body is restored");
        done();
    })
});


describe("html tests", () => {

    it("creates markup from strings", () => {
        let markup = "<tr>A<td>B</td></tr>";
        let tr = <HTMLTableRowElement>html(markup);
        should(tr.nodeValue === "AB", "setting innerHTML on a 'div' will not assign tr elements");

        markup = "<table><tbody><tr><td>Test</td></tr></tbody></table>";
        let table = <HTMLTableElement>html(markup);
        should(table.outerHTML === markup, "preserves tr when within a table");

        markup = `<canvas width="100" height="100"></canvas>`;
        let canvas = <HTMLCanvasElement>html(markup);
        should(canvas.outerHTML === markup, "canvas markup preserved");
        should(!!canvas.getContext("2d"), "cnvas has 2d context");
    });
});
