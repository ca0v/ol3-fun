import { should } from "../base";
import { isPrimitive } from "../../ol3-fun/is-primitive";

describe("is-primitive", () => {
  it("true tests", () => {
    [
      "A",
      1,
      true,
      null,
      undefined,
      Symbol(0),
    ].forEach((v) =>
      should(
        isPrimitive(v),
        `${
          v && v.toString
            ? v.toString()
            : <any>v
        } is primitive`
      )
    );
  });

  it("false tests", () => {
    [
      new Date(),
      new RegExp(""),
      {},
      [],
    ].forEach((v) =>
      should(
        !isPrimitive(v),
        `${
          v && v.toString
            ? v.toString()
            : <any>v
        } is primitive`
      )
    );
  });
});
