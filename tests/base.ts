import { slowloop } from "../ol3-fun/slowloop";
import {
  expect,
  assert,
  deepEqual,
} from "@ca0v/ceylon/index";

// can't figure out how to load "should" library (index.js seems amd compliant..should work)
export function should(
  result: boolean,
  message: string
) {
  console.log(
    message || "undocumented assertion"
  );
  if (!result) throw message;
}

export function shouldEqual<T>(
  a: T,
  b: T,
  message?: string
) {
  if (a != b) {
    let msg = `"${a}" <> "${b}"`;
    message =
      (message ? message + ": " : "") +
      msg;
    console.warn(msg);
  }
  should(a == b, message!);
}

export function shouldThrow(
  fn: Function,
  message?: string
) {
  try {
    fn();
  } catch (ex) {
    should(!!ex, <string>ex);
    return ex;
  }
  should(
    false,
    `expected an exception${
      message ? ": " + message : ""
    }`
  );
}

export function stringify(o: Object) {
  return JSON.stringify(o, null, "\t");
}

export {
  slowloop,
  expect,
  assert,
  deepEqual,
};
