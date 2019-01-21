
export class CollisionModel {
  constructor(top: number, right: number, bottom: number, left: number) {
    this.top = top;
    this.right = right;
    this.bottom = bottom;
    this.left = left;
  }

  public top: number;
  public right: number;
  public bottom: number;
  public left: number;

  collidesWith(model: CollisionModel): boolean {
    return (this.left <= model.right && this.right >= model.left &&
      this.top <= model.bottom && this.bottom >= model.top);
  }
}

export interface ICollidable {
  readonly collisionModel: CollisionModel;
}