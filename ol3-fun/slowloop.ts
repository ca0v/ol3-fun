/**
 * Executes a series of functions in a delayed manner
 * @param functions one function executes per interval
 * @param interval length of the interval in milliseconds
 * @param cycles number of types to run each function
 * @returns promise indicating the process is complete
 */
export async function slowloop(
  functions: Array<Function>,
  interval = 1000,
  cycles = 1,
  notify?: (args: {
    index: number;
    cycle: number;
  }) => void
) {
  let index = 0;
  let cycle = 0;

  if (!functions || 0 >= cycles) {
    return;
  }

  return new Promise<void>(
    (good, bad) => {
      const h = setInterval(() => {
        try {
          if (
            index === functions.length
          ) {
            index = 0;
            if (++cycle === cycles) {
              clearInterval(h);
              good();
              return;
            }
          }
          try {
            notify &&
              notify({ index, cycle });
            functions[index++]();
          } catch (ex) {
            clearInterval(h);
            bad(ex);
            return;
          }
        } catch (ex) {
          bad(ex);
        }
      }, interval);
    }
  );
}
