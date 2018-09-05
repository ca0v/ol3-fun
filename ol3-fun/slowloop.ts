export function slowloop(
  functions: Array<Function>,
  interval = 1000,
  cycles = 1
) {
  let d = $.Deferred();
  let index = 0;

  if (!functions || 0 >= cycles) {
    d.resolve();
    return d;
  }

  let h = setInterval(() => {
    if (index === functions.length) {
      index = 0;
      cycles--;
      if (cycles <= 0) {
        d.resolve();
        return;
      }
    }
    functions[index++]();
  }, interval);
  d.done(() => clearInterval(h));
  return d;
}
