import { describe, it, should, shouldEqual, slowloop } from "../base";

describe("slowloop", () => {
    it("slowloop empty", (done) => {
        try {
            slowloop(null);
            should(false, "slowloop requires an array");
        } catch {
            done();
        }
    });

    it("slowloop fast", (done) => {
        let count = 0;
        let inc = () => count++;
        slowloop([inc, inc, inc], 0, 100).then(() => {
            shouldEqual(count, 300, "0 ms * 100 iterations * 3 functions => 300 invocations");
            done();
        });
    }).timeout(2000);

    it("slowloop iterations", (done) => {
        let count = 0;
        let inc = () => count++;
        slowloop([inc]).then(() => {
            shouldEqual(count, 1, "defaults to a single iteration");
            slowloop([inc], 0, 2).then(() => {
                shouldEqual(count, 3, "performs two iterations");
                slowloop([inc], 0, 0).then(() => {
                    shouldEqual(count, 3, "performs 0 iterations");
                    done();
                });
            });
        });
    });
});
