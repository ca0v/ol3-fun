import { should, shouldEqual, stringify, shouldThrow } from "../base";
import { extend as deepExtend, TraceItem } from "../../ol3-fun/deep-extend";
import { range } from "ol3-fun/common";

describe("utils/deep-extend", () => {
	it("trivial merges", () => {
		shouldEqual(stringify(deepExtend({}, {})), stringify({}), "empty objects");
		shouldEqual(stringify(deepExtend([], [])), stringify([]), "empty arrays");
		shouldEqual(stringify(deepExtend([,], [, ,])), stringify([,]), "arrays with empty items");
		let o = { a: 1 };
		shouldEqual(o, deepExtend(o, o), "merges same object");
		should(o !== deepExtend(o), "clones when second argument not provided");
	});

	it("invalid merges", () => {
		shouldThrow(() => deepExtend({}, []), "{} and []");
		shouldThrow(() => deepExtend(<any>[], {}), "[] and {}");
		shouldThrow(() => deepExtend(<any>1, <any>2), "primitives");
		shouldThrow(() => deepExtend(new Date(2000, 1, 1), new Date(2000, 1, 2)), "clonable primitives");
		let a = { a: 1 };
		let b = { b: a };
		(<any>a).b = b;
		shouldEqual(shouldThrow(() => deepExtend(b), "b->a->b"), "circular reference detected");
	});

	it("merges with duplicate objects that might be detected as recursive", () => {
		let o = { a: { date: new Date(Date.now() - 1000), address: { street: "main" } } };
		let p = { o1: o, o2: o };
		shouldEqual(stringify(deepExtend(p)), stringify(p), "two children pointing to the same object");
		let q = { p1: p, p2: [p], p3: [{ id: "P", value: p }] };
		let actual = stringify(deepExtend(q, <any>deepExtend(p, <any>o)));
		should(!!actual, "complex linked");
	});

	it("simple data merges", () => {
		let o = deepExtend({ v1: 1 });
		shouldEqual(o.v1, 1, "adds v1");
		deepExtend(o, { v1: 2 });
		shouldEqual(o.v1, 2, "updates v1");
	});

	it("simple array merges", () => {
		shouldEqual(stringify(deepExtend([1], [])), stringify([1]), "[1] + []");
		shouldEqual(stringify(deepExtend([1], [2])), stringify([2]), "[1] + [2]");
		shouldEqual(stringify(deepExtend([1, 2, 3], [2])), stringify([2, 2, 3]), "[1,2,3] + [2]");
		shouldEqual(stringify(deepExtend([2], [1, 2, 3])), stringify([1, 2, 3]), "[2] + [1,2,3]");
		shouldEqual(stringify(deepExtend([, , , 4], [1, 2, 3])), stringify([1, 2, 3, 4]), "array can have empty items");
		shouldEqual(
			stringify(deepExtend([{ id: 1 }], [{ id: 2 }])),
			stringify([{ id: 1 }, { id: 2 }]),
			"[1] + [2] with ids"
		);
	});

	it("preserves array ordering", () => {
		shouldEqual(deepExtend([{ id: 1 }], [{ id: 1 }, { id: 2 }])[0].id, 1, "first item id");
		shouldEqual(deepExtend([{ id: 2 }], [{ id: 1 }, { id: 2 }])[0].id, 2, "first item id");
		shouldEqual(deepExtend([<any>{ id: 1 }, { id: 3 }], [{ id: 2 }, { id: 1, v: 1 }])[0].v, 1, "first item id");
	});

	it("clones objects with primitives", () => {
		let source = { v1: { v2: { v3: 1 } } };
		let o = deepExtend(source);
		shouldEqual(o.v1.v2.v3, 1, "properly extends {}");
		should(source.v1 !== o.v1, "properly clones objects");
	});

	it("clones dates", () => {
		let source = { date: new Date() };
		let o = deepExtend(source);
		should(source.date !== o.date, "dates are clones");
		shouldEqual(source.date.getUTCDate(), o.date.getUTCDate(), "date values are preserved");
	});

	it("clones nested objects", () => {
		let source = { v1: { v2: { v3: 1 } } };
		let o = deepExtend(source);
		should(source !== o, "clones source");
		shouldEqual(source.v1.v2.v3, o.v1.v2.v3, "properly extends v3");
		should(source.v1 !== o.v1, "properly clones v1");
		should(source.v1.v2 !== o.v1.v2, "properly clones v1.v2");
	});

	it("clones arrays", () => {
		let source = { v1: range(1).map(i => ({ id: i + 1, value: i })) };
		let o = deepExtend(source);
		should(source !== o, "clones source");
		should(source.v1 !== o.v1, "clones v1");
		should(source.v1[0].value === o.v1[0].value, "extends v1[1].value");
		should(source.v1[0] !== o.v1[0], "clones v1[1]");
	});

	it("confirms references are preserved", () => {
		let x = { foo: { bar: "foo" }, array: [{ id: "a", value: "ax" }] };
		let y = { foo: { bar: "bar" }, array: [{ id: "a", value: "ay" }] };
		let xfoo = x.foo;
		let xarray = x.array[0];
		let z = deepExtend(x, y);
		shouldEqual(x, z, "returns x");
		shouldEqual(xfoo, z.foo, "reference foo preserved");
		shouldEqual(xarray.value, "ay", "existing array references are preserved");
	});

	it("confirms array merge is 'id' aware", () => {
		let o1 = {
			values: [
				{
					id: "v1",
					value: { v1: 1 }
				},
				{
					id: "v2",
					value: { v2: 1 }
				},
				{
					id: "v9",
					value: { v9: 1 }
				}
			]
		};

		let o2 = {
			values: [
				{
					id: "v1",
					value: { v1: 2 }
				},
				{
					id: "v9",
					value: { v9: 2 }
				}
			]
		};

		let o = deepExtend(o1);
		shouldEqual(o.values[0].value.v1, 1, "object is clone of o1, v1");
		shouldEqual(o.values[1].value.v2, 1, "object is clone of o1, v2");
		shouldEqual(o.values[2].value.v9, 1, "object is clone of o1, v9");

		deepExtend(o, o2);
		shouldEqual(o.values[0].value.v1, 2, "merge replaces v1");
		shouldEqual(o.values[1].value.v2, 1, "merge preserves v2");
		shouldEqual(o.values[2].value.v9, 2, "merge replaces v9");
	});

	it("confirms array references are preserved", () => {
		let x = { foo: { bar: "foo" } };
		let y = { foo: { bar: "bar" } };
		let xfoo = x.foo;
		let z = deepExtend(x, y);
		shouldEqual(x, z, "returns x");
		shouldEqual(xfoo, z.foo, "reference foo preserved");
	});

	it("confirms trace is empty when merging duplicate objects", () => {
		let trace: Array<TraceItem> = [];
		deepExtend({}, {}, trace);
		shouldEqual(trace.length, 0, "no activity 0");
		deepExtend({ a: 1 }, { a: 1 }, trace);
		shouldEqual(trace.length, 0, "no activity 1");
		deepExtend({ a: 1, b: [1] }, { a: 1, b: [1] }, trace);
		shouldEqual(trace.length, 0, "no activity 2");
		deepExtend({ a: 1, b: [1], c: {} }, { a: 1, b: [1], c: {} }, trace);
		shouldEqual(trace.length, 0, "no activity 3");
		deepExtend({ a: 1, b: [1], c: { d: 1 } }, { a: 1, b: [1], c: { d: 1 } }, trace);
		shouldEqual(trace.length, 0, "no activity 4");
		deepExtend({ a: [1, 2, 3] }, { a: [1, 2, 3] }, (trace = []));
		shouldEqual(trace.length, 0, "no activity 5");
		deepExtend({ a: [1, 2, [3]] }, { a: [1, 2, [3]] }, (trace = []));
		shouldEqual(trace.length, 0, "no activity 6");
	});

	it("confirms trace count is 1 when exactly one change is merged", () => {
		let trace: Array<TraceItem> = [];
		deepExtend({ a: 1, b: [1], c: { d: 1 } }, { a: 2, b: [1], c: { d: 1 } }, (trace = []));
		shouldEqual(trace.length, 1, "a:1->2");
		deepExtend({ a: 1, b: [1], c: { d: 1 } }, { a: 1, b: [2], c: { d: 1 } }, (trace = []));
		shouldEqual(trace.length, 1, "b:1->2");
		deepExtend({ a: 1, b: [1], c: { d: 1 } }, { a: 1, b: [1], c: { d: 2 } }, (trace = []));
		shouldEqual(trace.length, 1, "d:1->2");
		deepExtend({ a: [1, 2, 3] }, { a: [1, 2, 30] }, (trace = []));
		shouldEqual(trace.length, 1, "3->30");
		deepExtend({ a: [1, 2, [3]] }, { a: [1, 2, [3, 4]] }, (trace = []));
		shouldEqual(trace.length, 1, "[3]->[3,4]");
	});

	it("confirms trace count is 2 when exactly two changes is merged", () => {
		let trace: Array<TraceItem> = [];
		deepExtend({ a: 1, b: [1], c: { d: 1 } }, { a: 2, b: [1, 2], c: { d: 1 } }, (trace = []));
		shouldEqual(trace.length, 2, "a:1->2, b:adds 2");
		deepExtend({ a: 1, b: [1], c: { d: 1 } }, { a: 1, b: [2, 1], c: { d: 1 } }, (trace = []));
		shouldEqual(trace.length, 2, "b:1->2,adds 1");
		deepExtend(<any>{ a: 1, b: [1], c: { d: 1 } }, { a: 1, b: [1], c: { d: 2, e: 3 } }, (trace = []));
		shouldEqual(trace.length, 2, "c.d:1->2, c.e:added");
		deepExtend({ a: [1, 2, 3] }, { a: [10, 2, 30] }, (trace = []));
		shouldEqual(trace.length, 2, "1->10, 3->30");
		deepExtend({ a: [1, 2, [3]] }, { a: [1, 2, [3, 4], 5] }, (trace = []));
		shouldEqual(trace.length, 2, "[3]->[3,4], 4 added");
	});

	it("confirms trace content", () => {
		let trace = <Array<TraceItem>>[];

		let target = deepExtend(
			<any>{
				foo: 1,
				bar: 2
			},
			{
				foo: 1,
				property: "should fire 'add' event with this object and string path to it",
				object: {
					p1: "p1",
					p2: 2,
					a1: [1, 2, 3],
					a2: [{ id: "v1", value: 1 }]
				}
			},
			trace
		);

		shouldEqual(trace.length, 2, "property added, object added");
		shouldEqual(trace.length, trace.filter(t => t.value !== t.was).length, "no trivial trace elements");
		shouldEqual(trace.map(t => t.key).join(" "), "property object", "changes are depth first");

		// property
		let t = trace.shift();
		shouldEqual(t.key, "property", "property");
		shouldEqual(t.value, target.property, "target.property");

		// object
		t = trace.shift();
		shouldEqual(t.key, "object", "object");
		shouldEqual(t.value, target.object, "target.object");
	});

	it("generates empty diff from the trace", () => {
		let trace = <Array<TraceItem>>[];
		let a = {
			personalInfo: {
				email: "aliceames@email.org",
				lastName: "Ames",
				firstName: "Alice"
			},
			name: "name"
		};
		let b = {
			name: "name",
			personalInfo: {
				firstName: "Alice",
				lastName: "Ames",
				email: "aliceames@email.org"
			}
		};
		let expected = {};
		deepExtend(a, b, (trace = []));
		console.log("trace", stringify(trace));
		shouldEqual(stringify(diff(trace)), stringify(expected));
	});

	it("generates a diff from the trace", () => {
		let trace = <Array<TraceItem>>[];
		let a = {
			name: "name",
			personalInfo: {
				firstName: "Alice",
				lastName: "Ames"
			}
		};
		let b = {
			name: "name",
			personalInfo: {
				firstName: "Alice",
				lastName: "Ames",
				email: "aliceames@email.org"
			}
		};
		let expected = {
			personalInfo: {
				email: "aliceames@email.org"
			}
		};
		deepExtend(a, b, (trace = []));
		console.log("trace", stringify(trace));
		/**
		 * I want a minimal version of b, in this case it should drop the name
		 */
		shouldEqual(stringify(diff(trace)), stringify(expected));
	});
});

function forcePath(o: any, path: Array<string>) {
	let node = o;
	path.forEach(n => (node = node[n] = node[n] || <any>{}));
	return node;
}

function diff(trace: Array<TraceItem>) {
	let result = <any>{};
	trace.forEach(t => {
		let path = t.path.reverse();
		let key = path.pop();
		forcePath(result, path)[key] = t.value;
	});
	return result;
}
