export function should(result: boolean, msg: string) {
    if (!result) throw msg || "oops";
}

export function stringify(o: Object) {
    return JSON.stringify(o, null, '\t');
}