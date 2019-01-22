import {CollisionModel, ICollidable} from "./Collision";
import { Colours } from "./Colours";
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

/** Represents a playable charater with movement. */
export class Actor implements ICollidable {
  public x: number;
  public y: number;
  public xDirection: number;
  public yDirection: number;

  public sprite: HTMLImageElement;
  public state: ActorState;

  private xMin: number;
  private xMax: number;
  private collisionBuffer: number;

  private stunTicks: number = 0;

  /**
   * Construct a new Actor
   * @param state The starting state of this Actor
   * @param xMovementRange A NumberRange containing the minimum and maximum
   *                       horizontal bounds of the actor.
   * @param sprite
   */
  constructor(state: ActorState, xMovementRange: NumberRange, sprite: HTMLImageElement) {
    this.state = state;
    this.xMin = xMovementRange.min;
    this.xMax = xMovementRange.max;

    this.xDirection = Direction.Stopped;
    this.yDirection = Direction.Stopped;

    this.sprite = sprite;
    // this.radius = 15;
    this.collisionBuffer = 5;

    // x = centre of character bounds
    this.x = ((this.xMax - this.xMin) / 2) + this.xMin;

    // set the initial Y position based on the character state
    if (this.state === ActorState.resting) {
      this.y = GameValues.branchY;
    } else {
      this.y = GameValues.seesawLogY;
    }
  }

  /** Adds a stun effect to the actor. */
  public applyStun() {
    this.stunTicks = GameValues.stunTicks;
  }

  /* NOTE on updating character movement and position checks
        Because dy is just direction (-1,0,1), movement combines speed with this.
        Therefore all edge checks must require the speed (otherwise the actor
        could go past the edge
    */

  /**
   * Update the actor's horizontal position depending on movement key values.
   * @param leftKeyDown Down state of the LEFT movement key
   * @param rightKeyDown Down state of the RIGHT movement key
   */
  public moveX(leftKeyDown: boolean, rightKeyDown: boolean) {
    // Hit the left or right edge? Stop movement and don't update.
    const xPosition = this.x + (this.xDirection * GameValues.xSpeed);
    if (xPosition + this.sprite.width / 2 >= this.xMax || // R against R edge
        xPosition - this.sprite.width / 2 <= this.xMin) { // L against L edge
      // Actor against edge, don't move it.
      this.xDirection = Direction.Stopped;
      return;
    }

    // Now check positions when a key is held down.
    if (leftKeyDown || rightKeyDown) {
      // need to clamp this within game bounds
      const newPosition = this.x + (GameValues.xSpeed * this.xDirection);
      if (newPosition < this.xMin) {
        // set position to minimum
        this.x = this.xMin;
      } else if (newPosition > this.xMax) {
        // set position to maximum
        this.x = this.xMax;
      } else {
        // set position according to speed and direction
        this.x += GameValues.xSpeed * this.xDirection;
      }
    }
  }

  /** Update actor's vertical position. */
  public moveY(): void {
    const yPosition = this.y + (this.yDirection * GameValues.ySpeed);
    if (yPosition < GameValues.branchY) {
      // actor has reached the vertical height limit
      this.yDirection = Direction.Stopped;
      this.state = ActorState.resting;
      return;
    } else if (yPosition > GameValues.seesawLogY) {
      // actor has reached the lower height limit
      // stop movement and prepare for actor switching
      this.yDirection = Direction.Stopped;
      this.state = ActorState.landing;
      return;
    }

    // move actor vertically
    this.y += GameValues.ySpeed * this.yDirection;
  }

  /** Returns true if the sloth actor is stunned. */
  public get isStunned() { return this.stunTicks > 0; }

  /** Returns the collision model for the actor (including buffer zone). */
  public get collisionModel(): CollisionModel {
    const widthDiff = (this.sprite.width / 2);
    const heightDiff = (this.sprite.height / 2);

    // x and y point to the centre of the actor, therefore they need
    // to be offset to the top left and bot right for collision bounds
    const x1 = this.x - (widthDiff + this.collisionBuffer);
    const y1 = this.y - (heightDiff + this.collisionBuffer);

    const x2 = this.x + widthDiff + this.collisionBuffer;
    const y2 = this.y + heightDiff + this.collisionBuffer;

    return new CollisionModel(y1, x2, y2, x1);
  }

  /** Render the current actor on the canvas context. */
  public draw(context: CanvasRenderingContext2D): void {
    // get top left corner of sprite at current x,y position
    const px = this.x - this.sprite.width / 2;
    const py = this.y - this.sprite.height / 2;

    // Apply the stun effect
    if (this.isStunned) {
      this.stunTicks--;
      context.fillStyle = Colours.STUN_COLOUR;
      context.fillRect(px, py, this.sprite.width, this.sprite.height);
    }
    context.drawImage(this.sprite, px, py, this.sprite.width, this.sprite.height);
  }
}
