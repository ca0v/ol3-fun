export function isPrimitive(a: any) {
	switch (typeof a) {
		case "boolean":
			return true;
		case "number":
			return true;
		case "object":
			return null === a;
		case "string":
			return true;
		case "symbol":
			return true;
		case "undefined":
			return true;
		default:
			throw `unknown type: ${typeof a}`;
	}
}
