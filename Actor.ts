import {CollisionModel, ICollidable} from "./Collision";
import {Direction, NumberRange} from "./DataStructures";
import {GameValues} from "./GameValues";

/** The animation/position states of an actor. */
export enum ActorState {
  descending,
  ascending,
  jumping,
  landing,
  resting,
  waiting,
}

export class Actor implements ICollidable {
  public get isStunned() { return this.stunTicks > 0; }

  get collisionModel(): CollisionModel {
    const widthDiff = (this.sprite.width / 2);
    const heightDiff = (this.sprite.height / 2);

    // x and y are centred values
    // offset x and y by negatives
    const x1 = this.x - (widthDiff + this.collisionBuffer);
    const y1 = this.y - (heightDiff + this.collisionBuffer);

    const x2 = this.x + widthDiff + this.collisionBuffer;
    const y2 = this.y + heightDiff + this.collisionBuffer;
    // (game.context as CanvasRenderingContext2D).fillRect(x1, y1, x2-x1, y2-y1);

    return new CollisionModel(y1, x2, y2, x1);
  }

  public x: number;
  public y: number;
  public dx: number;
  public dy: number;

  public sprite: HTMLImageElement;
  public state: ActorState;

  private xMin: number;
  private xMax: number;
  private collisionBuffer: number;

  private stunTicks: number = 0;
  constructor(state: ActorState, xLimit: NumberRange, sprite: HTMLImageElement) {
    this.state = state;
    this.xMin = xLimit.min;
    this.xMax = xLimit.max;

    this.dx = Direction.Stopped;
    this.dy = Direction.Stopped;

    this.sprite = sprite;
    // this.radius = 15;
    this.collisionBuffer = 10;

    // x = centre of character bounds
    this.x = ((this.xMax - this.xMin) / 2) + this.xMin;

    // set the initial Y position based on the character state
    if (this.state === ActorState.resting) {
      this.y = GameValues.branchY;
    } else {
      this.y = GameValues.seesawLogY;
    }
  }
  public applyStun() {
    this.stunTicks = 600;
  }

  // private yLerp: number = 30;
  // private getYLerpSpeed(): number {
  //   return 0;
  // }

  public moveX(leftKeyDown: boolean, rightKeyDown: boolean) {
    // hit the left or right edge?
    // stop movement (and don't update)
    // Because dx is just direction, movement combines speed with this.
    // Therefore all edge checks must require the speed (otherwise the actor
    // goes past the edge and is permanently stuck
    const xPosition = this.x + (this.dx * GameValues.xSpeed);
    if (xPosition + this.sprite.width / 2 >= this.xMax || // check R against R edge
        xPosition - this.sprite.width / 2 <= this.xMin) { // check L against L edge
      this.dx = Direction.Stopped;
    } else if (leftKeyDown || rightKeyDown) {
      // need to clamp this within game bounds
      const newPosition = this.x + (GameValues.xSpeed * this.dx);
      if (newPosition < this.xMin) { this.x = this.xMin; } else if (newPosition > this.xMax) { this.x = this.xMax; } else { this.x += GameValues.xSpeed * this.dx; }
    }
  }

  public moveY() {
    // Because dy is just direction (-1,0,1), movement combines speed with this.
    // Therefore all edge checks must require the speed (otherwise the actor
    // goes past the edge and is permanently stuck
    const yPosition = this.y + (this.dy * GameValues.ySpeed);
    if (yPosition < GameValues.branchY) {
      // actor has reached the vertical height limit
      this.dy = Direction.Stopped;
      this.state = ActorState.resting;
    } else if (yPosition > GameValues.seesawLogY) {
      // actor has reached the lower height limit
      this.dy = Direction.Stopped;
      this.state = ActorState.landing;
    } else {
      // move vertically
      // if lerp frames, then lerp
      this.y += GameValues.ySpeed * this.dy;
    }
  }

  public draw(context: CanvasRenderingContext2D) {
    const px = this.x - this.sprite.width / 2;
    const py = this.y - this.sprite.height / 2;

    if (this.isStunned) {
      this.stunTicks--;
      context.fillStyle = "#FFFF00";
      context.fillRect(px, py, this.sprite.width, this.sprite.height);
    }
    context.drawImage(this.sprite, px, py, this.sprite.width, this.sprite.height);
  }
}
