/**
 * Executes a series of functions in a delayed manner
 * @param functions one function executes per interval
 * @param interval length of the interval in milliseconds
 * @param cycles number of types to run each function
 * @returns promise indicating the process is complete
 */
export function slowloop(functions: Array<Function>, interval = 1000, cycles = 1) {
	let d = $.Deferred();
	let index = 0;
	let cycle = 0;

	if (!functions || 0 >= cycles) {
		d.resolve();
		return d;
	}

	let h = setInterval(() => {
		if (index === functions.length) {
			index = 0;
			if (++cycle === cycles) {
				d.resolve();
				clearInterval(h);
				return;
			}
		}
		try {
			d.notify({ index, cycle });
			functions[index++]();
		} catch (ex) {
			clearInterval(h);
			d.reject(ex);
		}
	}, interval);
	return d;
}
