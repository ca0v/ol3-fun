import { Dictionary } from "./extensions";

// from https://github.com/unclechu/node-deep-extend/blob/master/lib/deep-extend.js

export interface TraceItem {
	path?: string;
	target: Object;
	key: string | number;
	value: any;
	was: any;
}

export type History = Array<object>;

export function extend<A extends object>(a: A, b?: Partial<A>, trace = <Array<TraceItem>>[], history: History = []) {
	if (!b) {
		b = <A>a;
		a = <any>{};
	}
	let merger = new Merger(trace, history);
	return <A>merger.deepExtend(a, b);
}

function isUndefined(a: any) {
	return typeof a === "undefined";
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

function isArray(val: any) {
	return Array.isArray(val);
}

function isHash(val: any) {
	return !isPrimitive(val) && !canClone(val) && !isArray(val);
}

function canClone(val: any) {
	if (val instanceof Date) return true;
	if (val instanceof RegExp) return true;
	return false;
}

function clone(val: any): any {
	if (val instanceof Date) return new Date(val.getTime());
	if (val instanceof RegExp) return new RegExp(val.source);
	throw `unclonable type encounted: ${typeof val}`;
}

function cloneArray(val: Array<any>): Array<any> {
	return val.map(v => (isArray(v) ? cloneArray(v) : canClone(v) ? clone(v) : v));
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
	 * @param target Object to be extended is the first argument
	 * @param source Object with values to be copied into target is the second parameter
	 *
	 * @returns extended object or false if have no target object or incorrect type.
	 *
	 * If you wish to clone source object (without modify it), just use empty new
	 * object as first argument, like this:
	 *   deepExtend({}, yourObj_1, [yourObj_N]);
	 */
	public deepExtend<T extends any, U extends any>(target: T, source: U) {
		let history = this.history;

		if (<any>target === source) return target; // nothing left to merge

		if (!target || (!isHash(target) && !isArray(target))) {
			throw "first argument must be an object";
		}
		if (!source || (!isHash(source) && !isArray(source))) {
			throw "second argument must be an object";
		}

		/**
		 * only track objects that trigger a recursion
		 */
		push(history, target);

		/**
		 * ignore functions
		 */
		if (typeof source === "function") {
			return target;
		}

		/**
		 * copy arrays into array
		 */
		if (isArray(source)) {
			if (!isArray(target)) {
				throw "attempting to merge an array into a non-array";
			}
			this.merge("id", <Array<any>>(<any>target), <Array<any>>(<any>source));
			return target;
		} else if (isArray(target)) {
			throw "attempting to merge a non-array into an array";
		}

		/**
		 * copy the values from source into the target
		 */
		Object.keys(source).forEach(k => this.mergeChild(k, target, source[k]));

		return target;
	}

	private mergeChild(key: string | number, target: any, sourceValue: any): void {
		let targetValue = target[key];
		/**
		 * nothing to do for this key
		 */
		if (sourceValue === targetValue) return;

		/**
		 * if new value is primitive create/update the target value
		 */
		if (isPrimitive(sourceValue)) {
			// record change
			this.trace.push({
				key: key,
				target: target,
				was: targetValue,
				value: sourceValue
			});
			target[key] = sourceValue;
			return;
		}
		/**
		 * Maybe it's a pseudo-primitive that we can clone (Date or RegEx)
		 */
		if (canClone(sourceValue)) {
			sourceValue = clone(sourceValue);
			// record change
			this.trace.push({
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
		if (isArray(sourceValue)) {
			/**
			 * we're dealing with objects (two arrays) that deepExtend understands
			 */
			if (isArray(targetValue)) {
				this.deepExtend(targetValue, sourceValue);
				return;
			}
			/**
			 * create/update the target with the source array
			 */
			sourceValue = cloneArray(sourceValue);
			this.trace.push({
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
			// clone the source
			let traceIndex = this.trace.length;
			try {
				sourceValue = this.deepExtend({}, sourceValue);
			} finally {
				this.trace.splice(traceIndex, this.trace.length - traceIndex);
			}
			this.trace.push({
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
	}

	private merge(key: string, target: Array<any>, source: Array<any>) {
		// skip trivial arrays
		if (!isArray(target)) throw "target must be an array";
		if (!isArray(source)) throw "input must be an array";
		if (!source.length) return target;

		// quickly find keyed targets
		let hash = <Dictionary<number>>{};
		target.forEach((item, i) => {
			if (!item[key]) return;
			hash[item[key]] = i;
		});

		source.forEach((sourceItem, i) => {
			let sourceKey = sourceItem[key];
			let targetIndex = hash[sourceKey];

			/**
			 * No "id" so perform a naive update/create on the target
			 */
			if (isUndefined(sourceKey)) {
				if (isHash(target[i]) && !!target[i][key]) {
					throw "cannot replace an identified array item with a non-identified array item";
				}
				this.mergeChild(i, target, sourceItem);
				return;
			}

			/**
			 * not target so add it to the end of the array
			 */
			if (isUndefined(targetIndex)) {
				this.mergeChild(target.length, target, sourceItem);
				return;
			}

			/**
			 * The target item exists so need to merge the source item
			 */
			this.mergeChild(targetIndex, target, sourceItem);
			return;
		});

		return target;
	}
}
