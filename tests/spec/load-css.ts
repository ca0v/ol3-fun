import { describe, it, should, shouldEqual } from "../base";
import { loadCss, cssin } from "../../index";

describe("cssin tests", () => {
	it("hides the body", () => {
		let handles = [];
		handles.push(cssin("css1", "body {display: none}"));
		handles.push(cssin("css1", "body {display: block}"));
		shouldEqual(getComputedStyle(document.body).display, "none", "body is hidden, 1st css1 wins");
		handles.shift()();
		shouldEqual(getComputedStyle(document.body).display, "none", "body is still hidden, 1st css1 still registered");
		handles.shift()();
		shouldEqual(getComputedStyle(document.body).display, "block", "body is no longer hidden, css1 destroyed");
	});
});

describe("load-css", () => {
	it("loads css file", () => {
		should(!document.getElementById("style-load-css-test"), "node does not exist");
		let remover = loadCss({ name: "load-css-test", url: "../loaders/theme.css" });
		should(!!document.getElementById("style-load-css-test"), "node exists");
		remover();
		should(!document.getElementById("style-load-css-test"), "node does not exist");
	});

	it("loads css string", () => {
		let handles = [];
		handles.push(loadCss({ name: "css1", css: "body {display: none}" }));
		handles.push(loadCss({ name: "css1", css: "body {display: block}" }));
		shouldEqual(getComputedStyle(document.body).display, "none", "body is hidden, 1st css1 wins");
		handles.shift()();
		shouldEqual(getComputedStyle(document.body).display, "none", "body is still hidden, 1st css1 still registered");
		handles.shift()();
		shouldEqual(getComputedStyle(document.body).display, "block", "body is no longer hidden, css1 destroyed");
	});
});
