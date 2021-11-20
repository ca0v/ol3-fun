import {
  should,
  shouldEqual,
  slowloop,
} from "../base";
import { range } from "../../ol3-fun/common";

describe("slowloop", () => {
  it("slowloop empty", (done) => {
    try {
      slowloop(<any>null);
      should(
        false,
        "slowloop requires an array"
      );
    } catch {
      done();
    }
  });

  it("slowloop with progress", async () => {
    let progressCount = 0;
    await slowloop(
      range(7).map((n) => () => {}),
      0,
      5,
      () => progressCount++
    );
    shouldEqual(
      progressCount,
      7 * 5,
      "progress callbacks"
    );
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

  it("slowloop with abort", async () => {
    try {
      await slowloop(
        [
          () => {
            should(
              false,
              "aborted from inside"
            );
          },
        ],
        10,
        1,
        () => {
          throw "aborted from outside";
        }
      );
    } catch (ex) {
      shouldEqual(
        ex,
        "aborted from outside",
        "aborted from outside"
      );
    }
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
    slowloop([inc], 0).then(() => {
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
