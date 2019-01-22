/** Allows an object to have collision functionality. */
export interface ICollidable {
  /** The required getter property needed for collision detection. */
  readonly collisionModel: CollisionModel;
}

/** */
export class CollisionModel {
  public x1: number;
  public y1: number;
  public x2: number;
  public y2: number;

  /**
   * Create a new collision model from edges.
   * @param x1 The left edge (x1)
   * @param y1 The top edge (y1)
   * @param x2 The right edge (x2)
   * @param y2 The bottom edge (y2)
   */
  public constructor(x1: number, y1: number, x2: number, y2: number) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
  }

  /**
   * Returns true if this collision model collides with the provided model.
   * @param model The model to check for a collision with.
   */
  public collidesWith(model: CollisionModel): boolean {
    return (this.x1 <= model.x2 && this.x2 >= model.x1 &&
      this.y1 <= model.y2 && this.y2 >= model.y1);
  }
}
