import { slowloop } from "../ol3-fun/slowloop";
import { Suite, Func, AsyncFunc } from "mocha";
import { expect, assert, deepEqual } from "@ca0v/ceylon/index";

// (title: string, fn: (this: Suite) => void): Suite
export function describe(title: string, fn: (this: Suite) => void): Suite {
	console.log(title || "undocumented test group");
	return window.describe(title, fn);
}

export function it(title: string, fn: Func | AsyncFunc) {
	console.log(title || "undocumented test");
	return window.it(title, fn);
}

// can't figure out how to load "should" library (index.js seems amd compliant..should work)
export function should(result: boolean, message: string) {
	console.log(message || "undocumented assertion");
	if (!result) throw message;
}

export function shouldEqual<T>(a: T, b: T, message?: string) {
	if (a != b) {
		let msg = `"${a}" <> "${b}"`;
		message = (message ? message + ": " : "") + msg;
		console.warn(msg);
	}
	should(a == b, message);
}

export function shouldThrow(fn: Function, message?: string) {
	try {
		fn();
	} catch (ex) {
		should(!!ex, ex);
		return ex;
	}
	should(false, `expected an exception${message ? ": " + message : ""}`);
}

export function stringify(o: Object) {
	return JSON.stringify(o, null, "\t");
}

export { slowloop, expect, assert, deepEqual };
