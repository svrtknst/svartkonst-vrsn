import { hasChanged, commit, isEmpty, vrsn, Vrsn as t, size, undo, update, current } from './core';


export class Vrsn<T> {
  get isEmpty(): boolean {
    return isEmpty(this.history);
  }

  get hasChanged(): boolean {
    return hasChanged(this.history);
  }

  get current(): T | undefined {
    // unclear why this isnt handled by the overloads...
    if (isEmpty(this.history)) {
      return undefined;
    }

    return current(this.history);
  }

  constructor(
    private history: t<T>,
    public readonly size: number
  ) { }

  static of<T>(startWith: T): Vrsn<T> {
    const history = vrsn(startWith);

    return new Vrsn(
      history,
      size(history)
    );
  }

  commit(value: T): Vrsn<T> {
    return new Vrsn(
      commit(this.history, value),
      this.size + 1
    );
  }

  update(fn: (v: T) => T): Vrsn<T> {
    return new Vrsn(
      update(this.history, fn),
      this.size + 1
    );
  }

  undo(count = 1): Vrsn<T> {
    return new Vrsn(
      undo(this.history),
      // lets hope this is accurate hah. should be.
      Math.max(this.size - count, 0)
    )
  }

  /**
   * Return the oldest non-empty value. 
   */
  oldest(): T | undefined {
    const [v, _] = undo(this.history, this.size - 1);

    return v;
  }
}