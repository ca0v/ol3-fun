export function should(result: boolean, msg: string) {
    if (!result) throw msg || "oops";
}

export function shouldEqual<T>(a: T, b: T, msg: string) {
    if (a !== b) console.warn(`${a} <> ${b}`);
    should (a === b, msg);
}

export function stringify(o: Object) {
    return JSON.stringify(o, null, '\t');
}