export enum Direction {
  Forward = 1,
  Stopped = 0,
  Reverse = -1,
}

export class Bounds {

  public height: number;
  public width: number;
  constructor(height: number, width: number) {
    this.height = height;
    this.width = width;
  }
}

export class NumberRange {
  public min: number;
  public max: number;
  constructor(min: number, max: number) {
    this.min = min;
    this.max = max;
  }
}

export function randomNumBetween(lower: number, upper: number) {
  return Math.floor(Math.random() * (upper - lower + 1) + lower);
}

export interface IDict<T> {
  [key: string]: T;
}

// using generics so it's flexible
export class KeyValuePair<T> {
  public key: string;
  public value: T;
  constructor(key: string, value: T) {
    this.key = key;
    this.value = value;
  }
}

export function degToRad(degrees: number) {
  return degrees * Math.PI / 180;
}
