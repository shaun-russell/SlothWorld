import {CollisionModel, ICollidable} from "./Collision";
import { Colours } from "./Colours";
import {Direction, randomNumBetween} from "./DataStructures";
import { ElementManager } from "./ElementManager";
// import { GameValues } from "./GameValues";
import { ItemAttributes } from "./ItemAttributes";
import { Resources } from "./Resources";

// Note on why I didn't use inheritance/interfaces.

// This could have been structured with Item as a base class
// and FruitItem and LetterItem as derived classes. However,
// while they are both Items when drawing on the canvas and detecting
// collision, their interactions are different. Since I'd be
// checking the type, there's a significant difference between them.
// At this scale, it would look a bit forced to make these separate classes.

/** Represents a fruit or a letter than the player must collect. */
export class Item implements ICollidable {
  /** * Returns the collision coordinate model at the current square's position. */
  get collisionModel(): CollisionModel {
    const widthDiff = (this.image.width / 2);
    const heightDiff = (this.image.height / 2);

    // x and y are centred values
    // offset x and y by negatives
    const x1 = this.x - (widthDiff + this.collisionBuffer);
    const y1 = this.y - (heightDiff + this.collisionBuffer);

    const x2 = this.x + widthDiff + this.collisionBuffer;
    const y2 = this.y + heightDiff + this.collisionBuffer;

    return new CollisionModel(y1, x2, y2, x1);
  }

  public get attributes(): ItemAttributes { return this.itemAttributes; }

  /**
   * Create a random fruit item.
   * @param direction The direction to move across the screen.
   * @param x The origin x coordinate.
   * @param y The origin y coordinate.
   */
  public static createFruit(direction: Direction, x: number, y: number): Item {
    const attributes = ItemAttributes.createFruitAttributes();
    const item = new Item(direction, x, y, attributes);
    return item;
  }

  /**
   * Create a letter item.
   * @param letter
   * @param direction
   * @param x The origin x coordinate.
   * @param y The origin y coordinate.
   */
  public static createLetter(letter: string, direction: Direction, x: number, y: number) {
    const attributes = ItemAttributes.createLetterAttributes();
    const item = new Item(direction, x, y, attributes);
    item.setLetter(letter);

    return item;
  }

  /** If false, object should be deleted at the first opportunity. */
  public active: boolean;
  public letter: string = "";

  private direction: Direction;
  private x: number;
  private y: number;
  private collisionBuffer: number;

  // private colour: string;
  private image: HTMLImageElement = ElementManager.getElement(Resources.NULL_IMAGE) as HTMLImageElement;
  private speed: number;
  private itemAttributes: ItemAttributes;

  /**
   * Construct a new Item instance (privately).
   * @param direction The direction of movement.
   * @param x The origin X coordinate.
   * @param y The origin Y coordinate.
   * @param attributes The ItemAttributes containing the stats of the item.
   */
  private constructor(direction: Direction, x: number, y: number, attributes: ItemAttributes) {
    // Private constructor because the objects are built using the static
    // methods on this class. Want to keep the attributes under control.

    this.direction = direction;
    this.x = x;
    this.y = y;

    // 5 speeds between 3 and 6 (inclusive)
    this.speed = randomNumBetween(3, 6) / 2;
    this.active = true;
    this.collisionBuffer = 5;
    this.itemAttributes = attributes;

    this.image = ElementManager.getElement(this.attributes.iconPath) as HTMLImageElement;
  }

  /** Updates the item's horizontal position. */
  public moveX(): void {
    this.x += this.speed * this.direction;
  }

  /** Sets the letter value. */
  public setLetter(letter: string): any {
    // Typescript does not really support constructor overloads.
    // If it did, then letter setting would be in a 2nd constructor.
    this.letter = letter;
  }

  /**
   * Deactivates the item if it is outside the provided width bounds.
   * @param width The width of the screen. Items only move horizontally.
   */
  public checkCanvasWidthBounds(width: number): boolean {
    // Include width in position calculation so the object does not
    // get disabled as soon as one side hits the screen bounds.
    // The object is only disabled when it is *entirely* outside the bounds.
    if (this.x + this.image.width < 0 ||
      this.x - this.image.width > width) {
      this.active = false;
    }
    // return the active state to save needing another if statement
    return this.active;
  }

  /**
   * Draws the square on the canvas context.
   * @param context The canvas context to draw on.
   */
  public draw(context: CanvasRenderingContext2D) {
    // don't draw if it is disabled
    if (!this.active) { return; }

    if (this.attributes.isLetter) {
      // draw the letter
      context.font = "50px" + Resources.FONT;
      context.fillStyle = Colours.THEME;
      context.fillText(this.letter, this.x, this.y);
    } else {
      const widthDiff = (this.image.width / 2);
      const heightDiff = (this.image.height / 2);
      const x1 = this.x - widthDiff;
      const y1 = this.y - heightDiff;

      const x2 = this.x + widthDiff;
      const y2 = this.y + heightDiff;

      context.drawImage(this.image as HTMLImageElement, x1, y1, x2 - x1, y2 - y1);
    }
  }
}
