// from https://github.com/unclechu/node-deep-extend/blob/master/lib/deep-extend.js

import { Dictionary } from "./dictionary";
import { isCyclic } from "./is-cyclic";
import { isPrimitive } from "./is-primitive";

/**
 * Each merge action is recorded in a trace item
 */
export interface TraceItem {
  path?: Path;
  target: Object;
  key: string | number;
  value: any;
  was: any;
}

function isArrayLike(o: any) {
  let keys = Object.keys(o);
  return keys.every(
    (k) =>
      k === parseInt(k, 10).toString()
  );
}

/**
 * Internally tracks visited objects for cycle detection
 */
type History = Array<object>;
type Path = Array<any>;

/**
 * deep mixin, replacing items in a with items in b
 * array items with an "id" are used to identify pairs, otherwise b overwrites a
 * @param a object to extend
 * @param b data to inject into the object
 * @param trace optional change tracking
 * @param history object added here are not visited
 */
export function extend<
  A extends object
>(
  a: A,
  b?: Partial<A>,
  trace?: Array<TraceItem>,
  history: History = []
) {
  if (!b) {
    b = <A>a;
    a = <any>{};
  }
  let merger = new Merger(
    trace,
    history
  );
  return <A>merger.deepExtend(a, b, []);
}

function isUndefined(a: any) {
  return typeof a === "undefined";
}

function isArray(val: any) {
  return Array.isArray(val);
}

function isHash(val: any) {
  return (
    !isPrimitive(val) &&
    !canClone(val) &&
    !isArray(val)
  );
}

function canClone(val: any) {
  if (val instanceof Date) return true;
  if (val instanceof RegExp)
    return true;
  return false;
}

function clone(val: any): any {
  if (val instanceof Date)
    return new Date(val.getTime());
  if (val instanceof RegExp)
    return new RegExp(val.source);
  throw `unclonable type encounted: ${typeof val}`;
}

/**
 * Helper class for managing the trace
 */
class Merger {
  private trace(item: TraceItem) {
    if (this.traceItems) {
      this.traceItems.push(item);
    }
  }

  constructor(
    public traceItems:
      | Array<TraceItem>
      | null
      | undefined,
    public history: History
  ) {}

  /**
   * @param target Object to be extended
   * @param source Object with values to be copied into target
   * @returns extended object
   */
  public deepExtend<
    T extends any,
    U extends any
  >(target: T, source: U, path: Path) {
    if (<any>target === source)
      return target; // nothing left to merge

    if (
      !target ||
      (!isHash(target) &&
        !isArray(target))
    ) {
      throw "first argument must be an object";
    }
    if (
      !source ||
      (!isHash(source) &&
        !isArray(source))
    ) {
      throw "second argument must be an object";
    }

    /**
     * ignore functions
     */
    if (typeof source === "function") {
      return target;
    }

    /**
     * only track objects that trigger a recursion
     */
    this.push(source);

    /**
     * copy arrays into array
     */
    if (isArray(source)) {
      if (!isArray(target)) {
        throw "attempting to merge an array into a non-array";
      }
      this.mergeArray(
        "id",
        <Array<any>>(<any>target),
        <Array<any>>(<any>source),
        path
      );
      return target;
    } else if (isArray(target)) {
      if (!isArrayLike(source)) {
        throw "attempting to merge a non-array into an array";
      }
    }

    /**
     * copy the values from source into the target
     */
    Object.keys(<any>source).forEach(
      (k) =>
        this.mergeChild(
          k,
          target,
          source[k],
          path.slice()
        )
    );

    return target;
  }

  private cloneArray(
    val: Array<any>,
    path: Path
  ): Array<any> {
    this.push(val);
    return val.map((v) => {
      if (isPrimitive(v)) return v;
      if (isHash(v))
        return this.deepExtend(
          {},
          v,
          path
        );
      if (isArray(v))
        return this.cloneArray(v, path);
      if (canClone(v)) return clone(v);
      throw `unknown type encountered: ${typeof v}`;
    });
  }

  private push(a: any) {
    if (isPrimitive(a)) return;
    if (-1 < this.history.indexOf(a)) {
      if (isCyclic(a)) {
        throw `circular reference detected`;
      }
    } else this.history.push(a);
  }

  private mergeChild(
    key: string | number,
    target: any,
    sourceValue: any,
    path: Path
  ): void {
    let targetValue = target[key];
    /**
     * nothing to do for this key
     */
    if (sourceValue === targetValue)
      return;

    /**
     * if new value is primitive create/update the target value
     */
    if (isPrimitive(sourceValue)) {
      // record change
      path.push(key);
      this.trace({
        path: path,
        key: key,
        target: target,
        was: targetValue,
        value: sourceValue,
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
      path.push(key);
      this.trace({
        path: path,
        key: key,
        target: target,
        was: targetValue,
        value: sourceValue,
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
        this.deepExtendWithKey(
          targetValue,
          sourceValue,
          path,
          key
        );
        return;
      }
      /**
       * create/update the target with the source array
       */
      sourceValue = this.cloneArray(
        sourceValue,
        path
      );
      path.push(key);
      this.trace({
        path: path,
        key: key,
        target: target,
        was: targetValue,
        value: sourceValue,
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
      let merger = new Merger(
        null,
        this.history
      );
      sourceValue = merger.deepExtend(
        {},
        sourceValue,
        path
      );
      path.push(key);
      this.trace({
        path: path,
        key: key,
        target: target,
        was: targetValue,
        value: sourceValue,
      });
      target[key] = sourceValue;
      return;
    }
    /**
     * Both source and target are known by deepExtend...
     */
    this.deepExtendWithKey(
      targetValue,
      sourceValue,
      path,
      key
    );
    return;
  }

  deepExtendWithKey(
    targetValue: any,
    sourceValue: any,
    path: any[],
    key: string | number
  ): any {
    let index = path.push(key);
    this.deepExtend(
      targetValue,
      sourceValue,
      path
    );
    // no changes, remove key from path
    if (index === path.length)
      path.pop();
  }

  private mergeArray(
    key: string,
    target: Array<any>,
    source: Array<any>,
    path: Path
  ) {
    // skip trivial arrays
    if (!isArray(target))
      throw "target must be an array";
    if (!isArray(source))
      throw "input must be an array";
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
        if (
          isHash(target[i]) &&
          !!target[i][key]
        ) {
          throw "cannot replace an identified array item with a non-identified array item";
        }
        this.mergeChild(
          i,
          target,
          sourceItem,
          path.slice()
        );
        return;
      }

      /**
       * not target so add it to the end of the array
       */
      if (isUndefined(targetIndex)) {
        this.mergeChild(
          target.length,
          target,
          sourceItem,
          path.slice()
        );
        return;
      }

      /**
       * The target item exists so need to merge the source item
       */
      this.mergeChild(
        targetIndex,
        target,
        sourceItem,
        path.slice()
      );
      return;
    });

    return target;
  }
}
