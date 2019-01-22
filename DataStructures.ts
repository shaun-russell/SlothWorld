export enum Direction {
  Forward = 1,
  Stopped = 0,
  Reverse = -1,
}

/** Stores a pair of numbers (min and max). */
export class NumberRange {
  public min: number;
  public max: number;

  /**
   * Create a min/max pair.
   * @param min Minimum number.
   * @param max Maximum number.
   */
  constructor(min: number, max: number) {
    this.min = min;
    this.max = max;
  }
}

/** Generic dictionary interface with string keys. */
export interface IDict<T> {
  [key: string]: T;
}

/** Generic KeyValuepair with string keys */
export class KeyValuePair<T> {
  public key: string;
  public value: T;

  /**
   *
   * @param key
   * @param value
   */
  constructor(key: string, value: T) {
    this.key = key;
    this.value = value;
  }
}

/**
 * Converts a value from degrees into radians.
 * @param degrees The value to convert
 */
export function degToRad(degrees: number): number {
  return degrees * Math.PI / 180;
}

/**
 * Create a random number between two numbers. Both are INCLUSIVE.
 * @param lower Inclusive lower bound.
 * @param upper Inclusive upper bound.
 */
export function randomNumBetween(lower: number, upper: number) {
  return Math.floor(Math.random() * (upper - lower + 1) + lower);
}
