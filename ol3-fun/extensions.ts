/**
 * Stores associated data in an in-memory repository using a WeakMap
 */
export class Extensions {
  private hash = new WeakMap(null);

  public isExtended(o: any) {
    return this.hash.has(o);
  }

  /**
    Forces the existence of an extension container for an object
    @param o the object of interest
    @param [ext] sets these value on the extension object
    @returns the extension object
    */
  extend<
    T extends object,
    U extends any
  >(o: T, ext?: U) {
    let hashData = this.hash.get(o);
    if (!hashData) {
      hashData = {};
      this.hash.set(o, hashData);
    }

    // update the extension values
    ext &&
      Object.keys(<any>ext).forEach(
        (k) =>
          (hashData[k] = (<any>ext)[k])
      );

    return <U>hashData;
  }

  /**
    Ensures extensions are shared across objects
    */
  bind(o1: any, o2: any) {
    if (this.isExtended(o1)) {
      if (this.isExtended(o2)) {
        if (
          this.hash.get(o1) ===
          this.hash.get(o2)
        )
          return;
        throw "both objects already bound";
      } else {
        this.hash.set(
          o2,
          this.extend(o1)
        );
      }
    } else {
      this.hash.set(
        o1,
        this.extend(o2)
      );
    }
  }
}
