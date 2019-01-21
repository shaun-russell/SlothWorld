import {CollisionModel, ICollidable} from "./Collision";
import {Direction, randomNumBetween} from "./DataStructures";
import { ElementManager } from "./ElementManager";
import { Resources } from "./Resources";

export class Item implements ICollidable {

  get attributes(): ItemAttributes {
    return this._attributes;
  }

  /**
   * Returns the collision coordinate model at the current square's position.
   */
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

  public static createItem(direction: Direction, x: number, y: number): Item {
    const attributes = ItemAttributes.createRandomAttributes();
    if (attributes.isHazard) {
    }
    const item = new Item(direction, x, y, attributes);

    return item;
  }

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
  // private height: number;
  // private width: number;
  private collisionBuffer: number;

  // private colour: string;
  private image: HTMLImageElement = ElementManager.getElement(Resources.NULL_IMAGE) as HTMLImageElement;
  private speed: number;
  private _attributes: ItemAttributes;
  private constructor(direction: Direction, x: number, y: number, attributes: ItemAttributes) {
    // attributes: ItemAttributes, letter: string) {
    this.direction = direction;
    this.x = x;
    this.y = y;
    // this.height = 30;
    // this.width = 30;
    // 5 speeds between 3 and 6 (inclusive)
    this.speed = randomNumBetween(3, 6) / 2;
    this.active = true;
    this.collisionBuffer = 5;
    this._attributes = attributes;
    // temporary
    // this.colour = this._attributes.iconPath;
    if (this.attributes.iconPath[0] !== "#") {
      // read this as a path
      console.log("loading hazard");
      this.image = ElementManager.getElement(this.attributes.iconPath) as HTMLImageElement;
    }
  }

  // setColour(newColour: string): void {
  //   // NOTE: because argb is a valid colour, the responsibility is on
  //   // the developer to provide a correct colour (it's static and not hard)
  //   // rather than the program assuming the correct colour format.
  //   // If the colour came from the user, it would be a different story.
  //   // this.colour = newColour;
  // }

  public moveX(): void {
    this.x += this.speed * this.direction;
  }

  public setLetter(letter: string): any {
    this.letter = letter;
  }

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
      context.font = "50px Coiny";
      // context.fillStyle = '#000';
      context.fillStyle = "#F9C22E";
      context.fillText(this.letter, this.x, this.y);
    } else {
      const widthDiff = (this.image.width / 2);
      const heightDiff = (this.image.height / 2);
      const x1 = this.x - widthDiff;
      const y1 = this.y - heightDiff;

      const x2 = this.x + widthDiff;
      const y2 = this.y + heightDiff;

      context.drawImage(this.image as HTMLImageElement, x1, y1, x2 - x1, y2 - y1);
      // if (this.attributes.isHazard) {
      //   context.drawImage(<HTMLImageElement>this.image, x1, y1, x2-x1, y2-y1);
      // }
      // else {
      //   // generate a square from code
      //   context.beginPath();
      //   context.rect(x1,y1, x2-x1, y2-y1);
      //   context.fillStyle = this.colour;
      //   context.fill();
      //   context.closePath();
      // }
    }
  }
}

class ItemAttributes {

  public static createRandomAttributes(): ItemAttributes {
    const randNum = randomNumBetween(0, 90);
    // search most common first (saves on cycles because it returns earlier
    // when the most common is checked first)

    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      if (randNum >= item.rarity) { return item; }
    }

    // if nothing found, return the error (resilience!)
    return this.items[0];
  }

  public static createLetterAttributes(): any {
    return new ItemAttributes(2, false, "#BC815F", "Letter", 16, true);
  }

  // These needed to be sorted by rarity with most common (highest) first
  private static items: ItemAttributes[] = [
    new ItemAttributes(1, false, "fruit1", "", 40),
    new ItemAttributes(0, true, "hazard", "Hazard", 22),
    new ItemAttributes(4, false, "fruit2", "", 13),
    // new ItemAttributes(0, false, 'fruit3', '', 7),
    new ItemAttributes(8, false, "fruit3", "", 5),
    new ItemAttributes(16, false, "fruit4", "", 1),
    // new ItemAttributes(32, false, '#7C00FF', '', 1),
  ];

  public points: number;
  public rarity: number;
  public iconPath: string;
  public name: string;

  // these booleans look like they should be subclasses of item
  // but with only 2 in a simple game, it's not a priority
  public isHazard: boolean;
  public isLetter: boolean;
  private constructor(points: number, isHazard: boolean, iconPath: string,
                      name: string, rarity: number, isLetter = false) {
    this.points = points;
    this.isHazard = isHazard;
    this.iconPath = iconPath;
    this.name = name;
    this.rarity = rarity;
    this.isLetter = isLetter;
  }
}
