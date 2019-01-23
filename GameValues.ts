export class GameValues {

  static get fruitYTop() { return 140; }
  static get fruitYBot() { return this.scHeight - 100; }

  static get centerX() { return this.scWidth / 2; }
  static get centerY() { return this.scHeight / 2; }

  public static fps = 16;

  // window size
  public static scWidth = 0;
  public static scHeight = 0;

  // key positions for gameplay
  public static branchY = 70;
  public static seesawLogY = 540;

  // movement limiters
  public static padEdge = 2;
  public static padCentre = 75;

  // speeds
  public static xSpeed = 4 * (16/10);
  public static minYSpeed = 1.5 * (16/10);
  public static launchYSpeed = 8.5 * (16/10);
  public static maxYSpeed = 15.5 * (16/10);
  public static ySpeed = 5 * (16/10);
  public static yDeceleration = 0.07 * (16/10);
  public static yAcceleration = 0.2 * (16/10);
  public static itemMinSpeed = 8
  public static itemMaxSpeed = 15;

  // timing
  public static stunTicks = 240; // * (16/10);
  public static gameTimeLength = 40;
  public static bigTimeBonus = 10;
  public static timeTick = 0.5;

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
