import {
  describe,
  it,
  should,
  shouldEqual,
  slowloop,
} from "../base";
import { range } from "../../ol3-fun/common";

describe("slowloop", () => {
  it("slowloop empty", (done) => {
    try {
      slowloop(null);
      should(
        false,
        "slowloop requires an array"
      );
    } catch {
      done();
    }
  });

  it("slowloop with progress", () => {
    let progressCount = 0;
    return slowloop(
      range(7).map((n) => () => {}),
      0,
      5
    )
      .progress((args) => {
        console.log(args);
        progressCount++;
      })
      .then(() => {
        shouldEqual(
          progressCount,
          7 * 5,
          "progress callbacks"
        );
      });
  });

  it("slowloop with exceptions", () => {
    return slowloop([
      () => {
        throw "exception occured in slowloop";
      },
    ])
      .then(() =>
        should(
          false,
          "failure expected"
        )
      )
      .catch((ex) => should(!!ex, ex));
  });

  it("slowloop with abort", () => {
    return slowloop(
      [
        () => {
          should(
            false,
            "aborted from inside"
          );
        },
      ],
      10
    )
      .reject("aborted from outside")
      .catch((ex) =>
        shouldEqual(
          ex,
          "aborted from outside",
          "aborted from outside"
        )
      );
  });

  it("slowloop fast", (done) => {
    let count = 0;
    let inc = () => count++;
    slowloop(
      [inc, inc, inc],
      0,
      100
    ).then(() => {
      shouldEqual(
        count,
        300,
        "0 ms * 100 iterations * 3 functions => 300 invocations"
      );
      done();
    });
  }).timeout(2000);

  it("slowloop iterations", (done) => {
    let count = 0;
    let inc = () => count++;
    slowloop([inc]).then(() => {
      shouldEqual(
        count,
        1,
        "defaults to a single iteration"
      );
      slowloop([inc], 0, 2).then(() => {
        shouldEqual(
          count,
          3,
          "performs two iterations"
        );
        slowloop([inc], 0, 0).then(
          () => {
            shouldEqual(
              count,
              3,
              "performs 0 iterations"
            );
            done();
          }
        );
      });
    });
  });
});
