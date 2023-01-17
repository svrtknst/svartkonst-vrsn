/**
 * We've got to competing models to deal with change. One is a linear cons list, 
 * The other would be to decorate elements with timestamps and tombstones. 
 *
 * How would that work in terms of ordering and stuff? Would only, like, work with lists. Haven't thought this through. 
 */


/**
 * Yes indeed, the trick to this is just wedging a cons list in there. 
 */
type Empty = [];
type Change<T> = [T, Vrsn<T>];
export type Vrsn<T> = Change<T> | Empty;

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

export function current<T>(history: Change<T>): Readonly<T>;
export function current<T>(history: Empty): undefined;
export function current<T>(history: Vrsn<T>): Readonly<T> | undefined {
  const [current, _] = history;

  return current;
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


export function isEmpty(history: Vrsn<unknown>): history is Empty {
  return history.length === 0;
}

export function hasChanged<T>(history: Vrsn<T>): history is Change<T> {
  return !isEmpty(history);
}


