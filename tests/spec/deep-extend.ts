import { should, shouldEqual, stringify } from "../base";
import { extend as deepExtend, TraceItem } from "../../ol3-fun/deep-extend";

describe("utils/deep-extend", () => {
	it("merges same object", () => {
		let o = { a: 1 };
		shouldEqual(o, deepExtend(o, o), "X === deepExtend(X,X)");
	});

	it("merges data into an object", done => {
		let o = <any>{};
		deepExtend(o, { v1: 1 });
		shouldEqual(o.v1, 1, "adds v1");

		deepExtend(o, {
			v1: { v2: 2 }
		});
		shouldEqual(o.v1.v2, 2, "updates v1");

		done();
	});

	it("confirms references are preserved", () => {
		let x = { foo: { bar: "foo" } };
		let y = { foo: { bar: "bar" } };
		let xfoo = x.foo;
		let trace: Array<TraceItem> = [];
		let z = deepExtend(x, y, trace);
		console.log("trace", stringify(trace));
		shouldEqual(x, z, "returns x");
		shouldEqual(xfoo, z.foo, "reference foo preserved");
	});

	it("confirms array merge is 'id' aware", done => {
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

		let o = deepExtend({}, o1);
		shouldEqual(o.values[0].value.v1, 1, "object is clone of o1, v1");
		shouldEqual(o.values[1].value.v2, 1, "object is clone of o1, v2");
		shouldEqual(o.values[2].value.v9, 1, "object is clone of o1, v9");

		deepExtend(o, o2);
		shouldEqual(o.values[0].value.v1, 2, "merge replaces v1");
		shouldEqual(o.values[1].value.v2, 1, "merge preserves v2");
		shouldEqual(o.values[2].value.v9, 2, "merge replaces v9");

		done();
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
							value: 1
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

		shouldEqual(
			trace.map(t => t.key).join(" "),
			"id value 0 1 a2 object",
			"object.a2(2) had one change(1) and one addition(3)"
		);

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
