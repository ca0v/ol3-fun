export interface Dictionary<T> {
	[index: string]: T;
}

/**
 * Stores associated data in an in-memory repository using a WeakMap
 */
export class Extensions {
	private extensions: Array<object> = [];
	private hash = new WeakMap(null);

	private isExtended(o: any) {
		return 0 <= this.extensions.indexOf(o);
	}

	/**
    Get the extension lookup identifier for this object
    @param o the object of interest
    @param force if true, forces the identifier to exist
    @returns -1 if not extended
    */
	getExtensionKey(o: any, force = true) {
		force && !this.isExtended(o) && this.extend(o);
		return this.extensions.indexOf(o);
	}

	/**
    Forces the existence of an extension container for an object
    @param o the object of interest
    @param [ext] sets these value on the extension object
    @returns the extension object
    */

	extend<T extends object, U extends any>(o: T, ext?: U) {
		if (!this.isExtended(o)) {
			this.extensions.push(<any>o);
		}
		let key = this.getExtensionKey(o, true);
		// ensure the extension object exists
		if (!this.hash.has(o)) this.hash.set(o, {});
		let hashData = this.hash.get(o);

		// update the extension values
		if (ext) {
			Object.keys(ext).forEach(k => (hashData[k] = ext[k]));
			console.log("hashData", hashData);
		}

		return <U>(<any>hashData);
	}

	/**
    Ensures extensions are shared across objects
    */
	bind(o1: any, o2: any) {
		if (this.isExtended(o1)) {
			if (this.isExtended(o2)) {
				if (this.getExtensionKey(o1) !== this.getExtensionKey(o2)) {
					throw "both objects already bound";
				}
			} else {
				this.hash.set(o2, this.extend(o1));
			}
		} else {
			this.hash.set(o1, this.extend(o2));
		}
	}
}
