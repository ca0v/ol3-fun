import { isPrimitive } from "./is-primitive";

/**
 * Determine if an object refers back to itself
 */
export function isCyclic(a: any) {
	if (isPrimitive(a)) return false;

	let test = (o: any, history: Array<object>): boolean => {
		if (isPrimitive(o)) return false;
		if (0 <= history.indexOf(o)) {
			return true;
		}
		return Object.keys(o).some(k => test(o[k], [o].concat(history)));
	};

	return Object.keys(a).some(k => test(a[k], [a]));
}
