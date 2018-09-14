import { describe, it, should, shouldEqual, shouldThrow } from "../base";
import { Extensions } from "../../ol3-fun/extensions";

describe("data/extensions", () => {
	it("ensures no side-effects on the object", () => {
		let x = new Extensions();
		let o = {};
		let expected = JSON.stringify(o);
		x.extend(o, { custom: "data" });
		let actual = JSON.stringify(o);
		shouldEqual(expected, actual, "no side-effects");
	});

	it("ensures two objects can be bound to same extension data", () => {
		let x = new Extensions();
		let math = x.extend(Math, { sqrt2: Math.sqrt(2) });
		should(!!(<any>x.extend(Math)).sqrt2, "Math.sqrt2");
		x.bind(Number, Math);
		shouldEqual(Math.round(math.sqrt2 * (<any>x.extend(Number)).sqrt2), 2, "sqrt2*sqrt2 = 2");
	});

	it("ensures two objects can be bound to same extension data", () => {
		let x = new Extensions();
	});
});

describe("100% code coverage for data/extensions", () => {
	let ext1: Extensions;
	let ext2: Extensions;

	it("creates two extension instances", done => {
		ext1 = new Extensions();
		shouldEqual(typeof ext1.extend, "function", "extensions has an extend method");
		shouldEqual(typeof ext1.getExtensionKey, "function", "extensions has an getExtensionKey method");
		ext2 = new Extensions();

		let o1 = {};
		let o2 = {};
		let xo1 = ext1.extend(o1, { v1: 1 });
		shouldEqual(xo1, ext1.extend(o1), "extend returns extension object");
		shouldEqual(xo1.v1, 1, "ext1 v1");

		let xo2 = ext2.extend(o2, { v2: 2 });
		shouldEqual(xo2.v2, 2, "ext2 v2");

		ext2.extend(o1, { v2: 2 });
		shouldEqual(xo2.v2, 2, "ext2 v2");
		shouldEqual(xo1.v1, 1, "ext1 v1");

		done();
	});

	it("extends an object using the first extension instance", done => {
		let o = { v1: 1 };
		ext1.extend(o, { v1: 2 });
		shouldEqual(o.v1, 1, "v1 is unchanged");
		shouldEqual(
			(<any>ext1.extend(o)).v1,
			2,
			"the extended object has a value for v1 in the context of the first extender"
		);
		false &&
			shouldEqual(
				ext1.getExtensionKey(o),
				ext2.getExtensionKey(o),
				"the internal extension key for an object should be the same for both extension instances"
			);
		shouldEqual(
			typeof ext2.extend(o),
			"object",
			"the extended object exists in the context of the second extender"
		);
		shouldEqual(
			typeof (<any>ext2.extend(o)).v1,
			"undefined",
			"the extended object has no extension values in the context of the second extender"
		);
		done();
	});

	it("extends an object using the both extension instances", done => {
		let o = { v1: 1 };
		ext1.extend(o, { v1: 2 });
		ext2.extend(o, { v1: 3 });
		shouldEqual(o.v1, 1, "v1 is unchanged");
		shouldEqual(
			(<any>ext1.extend(o)).v1,
			2,
			"the extended object has a value for v1 in the context of the first extender"
		);
		shouldEqual(
			(<any>ext2.extend(o)).v1,
			3,
			"the extended object has a value for v1 in the context of the second extender"
		);
		done();
	});

	it("forces a key to exist on an object without setting any values", done => {
		let o = {};
		ext1.getExtensionKey(o, true);
		shouldEqual(
			Object.keys(ext1.extend(o)).length,
			0,
			"the extended object has no extension values in the context of the first extender"
		);
		shouldEqual(
			Object.keys(ext2.extend(o)).length,
			0,
			"the extended object has no extension values in the context of the second extender"
		);
		should(ext1 !== ext2, "extensions should be unique");
		done();
	});

	it("binds two objects to the same extension", done => {
		let o1 = { id: 1 };
		let o2 = Object.create({ id: 2 });

		ext1.bind(o1, o2);
		ext1.extend(o1, { foo: "foo1" });
		shouldEqual((<any>ext1.extend(o1)).foo, "foo1");
		ext1.extend(o2, { foo: "foo2" });
		shouldEqual((<any>ext1.extend(o1)).foo, "foo2");

		done();
	});

	it("binds a new object to an extended object", done => {
		let o1 = { id: 1 };
		ext1.extend(o1, { foo: "foo1" });
		shouldEqual((<any>ext1.extend(o1)).foo, "foo1");

		let o3 = { id: 3 };
		ext1.bind(o1, o3);
		shouldEqual((<any>ext1.extend(o3)).foo, "foo1");

		let o4 = { id: 4 };
		ext1.extend(o4, { foo: "foo4" });
		shouldEqual((<any>ext1.extend(o4)).foo, "foo4");
		shouldThrow(() => ext1.bind(o1, o4), "should fail to bind since o4 already extended");

		done();
	});
});
