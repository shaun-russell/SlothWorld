export enum Direction {
  Forward = 1,
  Stopped = 0,
  Reverse = -1,
}

export class Bounds {
  constructor(height: number, width: number) {
    this.height = height;
    this.width = width;
  }

  public height: number;
  public width: number;
}

export class NumberRange {
  constructor(min: number, max: number) {
    this.min = min;
    this.max = max;
  }
  public min: number;
  public max: number;
}


export function randomNumBetween(lower: number, upper: number) {
  return Math.floor(Math.random() * (upper - lower + 1) + lower)
}


export interface IDict<T> {
  [key: string]: T
}


// using generics so it's flexible
export class KeyValuePair<T> {
  constructor(key: string, value: T) {
    this.key = key;
    this.value = value;
  }
  public key: string;
  public value: T;
}

export function degToRad(degrees: number) {
  return degrees * Math.PI / 180;
}

