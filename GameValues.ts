export class GameValues {

  static get fruitYTop() { return 140; }
  static get fruitYBot() { return this.scHeight - 100; }

  static get centerX() { return this.scWidth / 2; }
  static get centerY() { return this.scHeight / 2; }

  // window size
  public static scWidth = 0;
  public static scHeight = 0;

  // key positions for gameplay
  public static branchY = 50;
  public static seesawLogY = 540;

  // movement limiters
  public static padEdge = 8;
  public static padCentre = 60;

  // speeds
  public static xSpeed = 4;
  public static minYSpeed = 3.5;
  public static maxYSpeed = 8.5;
  public static ySpeed = 5;
  public static ySpeedDelta = 0.06;
  public static ySpeedADelta = 0.16;

  // timing
  public static stunTicks = 600;
  public static timeBonus = 12;

  // words
  public static word1 = "HELLO";
  public static word2 = "WORLD";

  /** Initialise the GameValues with the actual canvas so heights
   * can be correctly calculated.
   */
  public static Initialise(canvas: HTMLCanvasElement) {
    this.scWidth = canvas.width;
    this.scHeight = canvas.height;
  }
}
