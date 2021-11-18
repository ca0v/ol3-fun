import {
  should,
  shouldEqual,
  stringify,
} from "../base";
import { PolylineEncoder as GooglePolylineEncoder } from "../../ol3-fun/google-polyline";
import { PolylineEncoder } from "../../ol3-fun/ol3-polyline";
import {
  pair,
  range,
} from "../../ol3-fun/common";

describe("GooglePolylineEncoder", () => {
  it("GooglePolylineEncoder", () => {
    should(
      !!GooglePolylineEncoder,
      "GooglePolylineEncoder"
    );
  });

  let points = pair(
    range(10),
    range(10)
  );
  let poly =
    new GooglePolylineEncoder();

  let encoded = poly.encode(points);
  let decoded = poly.decode(encoded);

  shouldEqual(
    encoded.length,
    533,
    "encoding is 533 characters"
  );
  shouldEqual(
    stringify(decoded),
    stringify(points),
    "encode->decode"
  );
});

describe("PolylineEncoder", () => {
  it("PolylineEncoder", () => {
    should(
      !!PolylineEncoder,
      "PolylineEncoder"
    );
  });

  let points = pair(
    range(10),
    range(10)
  );
  let poly = new PolylineEncoder(); // default precision is 5

  let encoded = poly.encode(points);
  let decoded = poly.decode(encoded);

  shouldEqual(
    encoded.length,
    533,
    "encoding is 533 characters"
  );
  shouldEqual(
    stringify(decoded),
    stringify(points),
    "encode->decode"
  );

  poly = new PolylineEncoder(6);

  encoded = poly.encode(points);
  decoded = poly.decode(encoded);

  shouldEqual(
    encoded.length,
    632,
    "encoding is 632 characters"
  );
  shouldEqual(
    stringify(decoded),
    stringify(points),
    "encode->decode"
  );
});
