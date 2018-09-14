import { describe, it, should, shouldEqual, shouldThrow } from "../base";
import { Extensions } from "../../ol3-fun/extensions";
import { range, shuffle } from "../../ol3-fun/common";

describe("data/extensions", () => {
	it("ensures the api", () => {
		let x = new Extensions();
		shouldEqual(typeof x.extend, "function", "extend method");
		shouldEqual(typeof x.bind, "function", "bind method");
	});

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

	it("ensures two extensions can bind data to the same object", () => {
		let ext1 = new Extensions();
		let ext2 = new Extensions();
		let o = {};
		ext1.extend(o, { ext: 1 });
		ext2.extend(o, { ext: 2 });
		shouldEqual((<any>ext1.extend(o)).ext, 1, "ext1");
		shouldEqual((<any>ext2.extend(o)).ext, 2, "ext2");
	});

	it("ensures two extended objects cannot be bound", () => {
		let x = new Extensions();
		let o = {};
		let p = {};
		x.extend(o);
		x.extend(p);
		shouldThrow(() => x.bind(o, p), "cannot bind extended objects");
	});

	it("extension references are preserved", () => {
		let x = new Extensions();
		let o = {};
		let p = <any>x.extend(o);
		x.extend(o, { name: "P" });
		shouldEqual(p.name, "P", "extension references are preserved");
	});

	it("binds two objects to the same extension", () => {
		let x = new Extensions();
		let o1 = { id: 1 };
		let o2 = Object.create({ id: 2 });

		x.bind(o1, o2);
		x.extend(o1, { foo: "foo1" });
		shouldEqual((<any>x.extend(o1)).foo, "foo1");
		x.extend(o2, { foo: "foo2" });
		shouldEqual((<any>x.extend(o1)).foo, "foo2");
	});

	it("extension integrity testing (100 objects X 10 extensions)", () => {
		let x = range(10).map(n => new Extensions());
		let data = range(1000).map(n => Object.create({ id: n }));
		data.map((d, i) => x[i % 10].extend(d, { data: shuffle(range(1000)) }));
		data.forEach((d, i) => {
			let data = (<{ data: Array<number> }>x[i % 10].extend(d)).data;
			data = data.filter(v => v <= d.id);
			x[i % 10].extend(d, { data });
		});
		let sums = data.map((d, i) => {
			let ext = x[i % 10].extend(d) as { data: Array<number> };
			shouldEqual(ext.data.length, i + 1, `extension data has ${i + 1} items`);
			return ext.data.reduce((a, b) => a + b, 0);
		});
		console.log(sums);
		// CODEFIGHTS: what is the closed expression for this?
		shouldEqual(sums.reduce((a, b) => a + b, 0), 166666500);
	});

	it("extensions performance testing (1 million accesses)", () => {
		// how to capture memory?
		let x = new Extensions();
		let data = range(500000).map(n => ({ id: n }));
		let counter = { count: 0 };
		data.forEach(d => x.extend(d, { counter }));
		data.forEach(d => (<{ counter: { count: number } }>x.extend(d)).counter.count++);
		shouldEqual(counter.count, data.length, `accessed ${data.length} items`);
	}).timeout(600);
});
