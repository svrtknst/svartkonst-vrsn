/**
 * We've got to competing models to deal with change. One is a linear cons list, 
 * The other would be to decorate elements with timestamps and tombstones. 
 *
 * How would that work in terms of ordering and stuff? Would only, like, work with lists. Haven't thought this through. 
 */


/**
 * Yes indeed, the trick to this is just wedging a cons list in there. 
 */
type First = [];
type Later<T> = [T, Vrsn<T>];
export type Vrsn<T> = Later<T> | First;

export function vrsn<T>(startWith?: T): Vrsn<T> {
  if (startWith) {
    return commit(empty(), startWith);
  }

  return empty();
}

export function empty<T>(): Vrsn<T> {
  return [];
}

export function commit<T>(history: Vrsn<T>, next: T): Vrsn<T> {
  if (Object.isFrozen(next)) {
    return [next, history];
  }
  return [Object.freeze(next), history];
}

export function update<T>(history: Vrsn<T>, fn: (v: T) => T): Vrsn<T> {
  if (isEmpty(history)) {
    return history;
  }

  return commit(history, fn(current(history)));
}

export function current<_>(history: First, otherwise: void): undefined;
export function current<T>(history: First, otherwise: T): Readonly<T>;
export function current<T>(history: Later<T>): Readonly<T>;
export function current<T>(history: Vrsn<T>, otherwise?: T): Readonly<T> | undefined {
  const [current, _] = history;

  return current ?? otherwise;
}

export function undo<T>(history: Vrsn<T>, count = 1): Vrsn<T> {
  if (count < 1) {
    return history;
  }

  /* if empty, bail. doesn't matter how many desired undoings there are left. */
  if (isEmpty(history)) {
    return empty();
  }

  /* if not, we can take at least one more spin */
  const [_, t] = history;

  /* if we're at the final undoing, bail */
  if (count === 1) {
    return t;
  }

  return undo(t, count - 1);
}

/**
 * Expensive, be careful. 
 */
export function size(history: Vrsn<unknown>): number {
  return _size(history, 0);
}

function _size(history: Vrsn<unknown>, acc = 0): number {
  if (isEmpty(history)) {
    return acc;
  }

  const [_, t] = history;

  return _size(t, acc + 1);
}


export function isEmpty(history: Vrsn<unknown>): history is First {
  return history.length === 0;
}

export function hasChanged<T>(history: Vrsn<T>): history is Later<T> {
  return !isEmpty(history);
}


