// from https://github.com/unclechu/node-deep-extend/blob/master/lib/deep-extend.js

export interface TraceItem {
	path?: string;
	target: Object;
	key: string;
	value: any;
	was: any;
}

export type History = Array<object>;

export function extend<A extends object, T extends A>(
	a?: A,
	b?: T,
	trace = <Array<TraceItem>>[],
	history: History = []
) {
	let merger = new Merger(trace, history);
	return <A & T>merger.deepExtend(a, b);
}

function isPrimitive(a: any) {
	switch (typeof a) {
		case "object":
			return null === a;
		case "string":
			return true;
		case "number":
			return true;
		case "undefined":
			return true;
		default:
			throw `unknown type: ${typeof a}`;
	}
}

function canClone(val: any) {
	return val instanceof Date || val instanceof RegExp ? true : false;
}

function isHash(val: any) {
	return !isPrimitive(val) && !canClone(val);
}

function clone(val: any): any {
	if (val instanceof Date) return new Date(val.getTime());
	if (val instanceof RegExp) return new RegExp(val.source);
	throw `unclonable type encounted: ${typeof val}`;
}

function push(history: Array<any>, a: any) {
	if (isPrimitive(a)) return;
	if (-1 < history.indexOf(a)) {
		let keys = Object.keys(a);
		if (keys.some(k => !isPrimitive(a[k]))) {
			let values = Object.keys(a)
				.map(k => a[k])
				.filter(isPrimitive);
			throw `possible circular reference detected, nested shared objects prohibited: ${keys}=${values}`;
		}
	} else history.push(a);
}

class Merger {
	constructor(public trace: Array<TraceItem>, public history: History) {}

	/**
	 * @param a Object to be extended is the first argument
	 * @param b Object with values to be copied into target is the second parameter
	 *
	 * @returns extended object or false if have no target object or incorrect type.
	 *
	 * If you wish to clone source object (without modify it), just use empty new
	 * object as first argument, like this:
	 *   deepExtend({}, yourObj_1, [yourObj_N]);
	 */
	public deepExtend<T extends any, U extends T>(a: T, b: U) {
		let trace = this.trace;
		let history = this.history;

		if (a === b) return a; // nothing left to merge
		if (!a) return b;
		if (!b) return a;

		if (!isHash(a)) {
			throw "first argument must be an object";
		}
		if (!isHash(b)) {
			throw "second argument must be an object";
		}

		let target = a;
		let source = b;

		/**
		 * only track objects that trigger a recursion
		 */
		push(history, a);

		/**
		 * ignore functions
		 */
		if (typeof source === "function") {
			return target;
		}

		/**
		 * copy arrays into array
		 */
		if (Array.isArray(source)) {
			if (!Array.isArray(target)) {
				throw "attempting to merge an array into a non-array";
			}
			this.merge("id", target, source);
			return target;
		} else if (Array.isArray(target)) {
			throw "attempting to merge an array into a non-array";
		}

		/**
		 * copy the values from source into the target
		 */
		Object.keys(source).forEach(key => {
			let targetValue = target[key]; // source value
			let sourceValue = source[key]; // new value

			/**
			 * nothing to do for this key
			 */
			if (sourceValue === targetValue) return;

			/**
			 * if new value is primitive create/update the target value
			 */
			if (isPrimitive(sourceValue)) {
				// record change
				trace.push({
					key: key,
					target: target,
					was: targetValue,
					value: sourceValue
				});
				target[key] = sourceValue;
				return;
			}

			/**
			 * Make sure it's not a Date or RegEx or DOM node, etc...
			 */
			if (canClone(sourceValue)) {
				sourceValue = clone(sourceValue);
				// record change
				trace.push({
					key: key,
					target: target,
					was: targetValue,
					value: sourceValue
				});
				target[key] = sourceValue;
				return;
			}

			/**
			 * if new value is an array, merge with existing array or create a new property
			 */
			if (Array.isArray(sourceValue)) {
				/**
				 * we're dealing with objects (two arrays) that deepExtend understands
				 */
				if (Array.isArray(targetValue)) {
					this.deepExtend(targetValue, sourceValue);
					return;
				}

				/**
				 * create/update the target with the source array
				 */
				trace.push({
					key: key,
					target: target,
					was: targetValue,
					value: sourceValue
				});
				target[key] = sourceValue;
				return;
			}

			/**
			 * source is not primitive, not a clonable primitive and not an array
			 * so it must be an object with keys
			 */
			if (!isHash(sourceValue)) {
				throw `unexpected source type: ${typeof sourceValue}`;
			}

			/**
			 * if the target is not a hash object then create/update it
			 */
			if (!isHash(targetValue)) {
				trace.push({
					key: key,
					target: target,
					was: targetValue,
					value: sourceValue
				});
				target[key] = sourceValue;
				return;
			}

			/**
			 * Both source and target are known by deepExtend...
			 */
			this.deepExtend(targetValue, sourceValue);
			return;
		});

		return target;
	}

	/**
	 * Recursive cloning array.
	 */
	private deepCloneArray(arr: Array<any>, history: History = []) {
		var clone: any = [];
		arr.forEach((item, index) => {
			push(history, item);
			if (typeof item === "object" && item !== null) {
				if (Array.isArray(item)) {
					clone[index] = this.deepCloneArray(item, history);
				} else if (canClone(item)) {
					clone[index] = clone(item);
				} else {
					// do not want to effect this.trace, just want to clone the item
					clone[index] = extend({}, item, this.trace, history);
				}
			} else {
				clone[index] = item;
			}
			push(history, clone[index]);
		});
		return clone;
	}

	private merge(key: string, target: Array<any>, input: Array<any>) {
		// skip trivial arrays
		if (!input.length) return target;

		// target keys
		let hash = <any>{};
		target.forEach((item, i) => (hash[item[key]] = i));

		input.forEach(item => {
			let id = item[key];

			/**
			 * not in target then add it to the end of the array
			 */
			if (typeof hash[id] === "undefined") {
				// update the hash but it won't be needed
				hash[id] = target.push(item) - 1;

				this.trace &&
					this.trace.push({
						key: hash[id],
						target: target,
						value: item,
						was: undefined
					});
				return;
			}

			/**
			 * The item already exists so need to merge the contents
			 * later items have higher priority but earlier items appear earlier in the array,
			 * could unshift instead of push but then hash would need refreshing
			 * any other solution?
			 */
			this.deepExtend(target[hash[id]], item);
		});

		return target;
	}
}
