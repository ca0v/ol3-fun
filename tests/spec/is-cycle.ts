import {
  should,
  shouldEqual,
  shouldThrow,
  stringify,
} from "../base";
import { isCyclic } from "../../ol3-fun/is-cyclic";

describe("is-cycle", () => {
  it("false tests", () => {
    let a = {};
    let b = { a: a };

    should(
      !isCyclic({
        a,
        b,
      }),
      "nothing in this graph refers back to an ancestor of itself"
    );
  });

  it("true tests", () => {
    let a = { b: <any>"" };
    let b = { a: a };
    a.b = b;

    should(isCyclic(b), "b->a->b");
    should(
      isCyclic({ b }),
      "{}->b->a->b"
    );
    shouldThrow(
      () => stringify(b),
      "cycles cannot be serialized"
    );
  });
});
