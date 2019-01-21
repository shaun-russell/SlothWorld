export class GameValueSet {
  public static init(canvas: HTMLCanvasElement) {
    this.scWidth = canvas.width;
    this.scHeight = canvas.height;
  }

  // window size
  public static scWidth = 0;
  public static scHeight = 0;

  // key positions for gameplay
  public static branchHeight = 50;
  public static seesawLogHeight = 540;

  // movement limiters
  public static padEdge = 20;
  public static padCentre = 70;


  public static xSpeed = 4;
  public static ySpeed = 6;

  static get fruitYTop() { return 140; }
  static get fruitYBot() { return this.scHeight - 100; }

  static get centerX() { return this.scWidth / 2; }
  static get centerY() { return this.scHeight / 2; }
}