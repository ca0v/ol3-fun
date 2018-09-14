import { should, shouldEqual, stringify, shouldThrow } from "../base";
import { extend as deepExtend, TraceItem } from "../../ol3-fun/deep-extend";

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
		shouldThrow(() => deepExtend([], {}), "[] and {}");
		shouldThrow(() => deepExtend(<any>1, <any>2), "primitives");
		shouldThrow(() => deepExtend(new Date(2000, 1, 1), new Date(2000, 1, 2)), "clonable primitives");
		let a = { a: 1 };
		let b = { b: a };
		(<any>a).b = b;
		shouldThrow(() => deepExtend(b), "b->a->b");
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

	it("confirms trace is 1 when exactly one change is merged", () => {
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

	it("confirms trace is 2 when exactly two changes is merged", () => {
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

	it("confirms change log", done => {
		let target = <any>{
			foo: 1,
			bar: 2
		};

		let trace = <Array<TraceItem>>[];

		deepExtend(
			target,
			{
				foo: target.foo,
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

		// do a noop merge
		deepExtend(
			target,
			{
				object: {}
			},
			(trace = [])
		);

		shouldEqual(trace.length, 0, "object was merged (but unchanged)");

		// do a merge which changes p1
		deepExtend(
			target,
			{
				object: {
					p1: 1,
					p2: target.object.p2
				}
			},
			(trace = [])
		);

		shouldEqual(trace.length, 1, "object.p1 was touched");

		t = trace.shift();
		shouldEqual(t.key, "p1", "p1 changed");
		shouldEqual(t.was, "p1", "it was 'p1'");
		shouldEqual(t.value, 1, "it is 1");

		// do a merge which changes a2
		// currently it is a2: [{ id: "v1", value: 1 }]
		deepExtend(
			target,
			{
				object: {
					a2: [
						{
							id: "v1",
							value: 2
						},
						{
							id: "v2",
							value: "val2"
						}
					]
				}
			},
			(trace = [])
		);

		shouldEqual(trace.map(t => t.key).join(" "), "value 1", "object.a2(2) had one change(1) and one addition(3)");

		trace = trace.filter(t => t.value !== t.was);
		shouldEqual(trace.length, 2, "a2.v1 -> 2, a2.v2 was created");

		t = trace.shift();
		shouldEqual(t.key, "value", "a2.v1 -> 2");
		shouldEqual(t.was, 1, "it was 1");
		shouldEqual(t.value, 2, "it is 2");

		t = trace.shift();
		shouldEqual(t.key, "1", "v2 was added");
		shouldEqual(typeof t.was, "undefined", "it was undefined");
		shouldEqual(t.value.value, "val2", "a2.v2 is 'val2'");

		done();
	});
});
