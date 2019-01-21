import {ICollidable, CollisionModel} from './Collision';
import {Direction, randomNumBetween} from './DataStructures';

export class Item implements ICollidable {
  private constructor(direction: Direction, x: number, y: number, attributes: ItemAttributes) {
    // attributes: ItemAttributes, letter: string) {
    this.direction = direction;
    this.x = x;
    this.y = y;
    this.height = 30;
    this.width = 30;
    this.speed = randomNumBetween(1, 3);
    this.active = true;
    this.collisionBuffer = 5;
    this._attributes = attributes;
    // temporary
    this.colour = this._attributes.iconPath;
  }

  /** If false, object should be deleted at the first opportunity. */
  public active: boolean;
  public letter: string = '';

  private direction: Direction;
  private x: number;
  private y: number;
  private height: number;
  private width: number;
  private collisionBuffer: number;

  private colour: string;
  private speed: number;
  private _attributes: ItemAttributes;


  public static createItem(direction: Direction, x: number, y:number): Item {
    let attributes = ItemAttributes.createRandomAttributes();
    let item = new Item(direction, x, y, attributes);

    return item;
  }

  public static createLetter(letter: string, direction: Direction, x: number, y:number) {
    let attributes = ItemAttributes.createLetterAttributes();
    let item = new Item(direction, x, y, attributes);
    item.setLetter(letter);

    return item;
  }

  setColour(newColour: string): void {
    // NOTE: because argb is a valid colour, the responsibility is on
    // the developer to provide a correct colour (it's static and not hard)
    // rather than the program assuming the correct colour format.
    // If the colour came from the user, it would be a different story.
    this.colour = newColour;
  }

  moveX(): void {
    this.x += this.speed * this.direction;
  }

  get attributes(): ItemAttributes {
    return this._attributes;
  }

  setLetter(letter: string): any {
    this.letter = letter;
  }

  checkCanvasWidthBounds(width: number): boolean {
    // Include width in position calculation so the object does not
    // get disabled as soon as one side hits the screen bounds.
    // The object is only disabled when it is *entirely* outside the bounds.
    if (this.x + this.width < 0 ||
      this.x - this.width > width) {
      this.active = false;
    }
    // return the active state to save needing another if statement
    return this.active;
  }

  /**
   * Returns the collision coordinate model at the current square's position.
   */
  get collisionModel(): CollisionModel {
    var widthDiff = (this.width/2);
    var heightDiff = (this.height/2);

    // x and y are centred values
    // offset x and y by negatives
    let x1 = this.x - (widthDiff + this.collisionBuffer);
    let y1 = this.y - (heightDiff + this.collisionBuffer);

    let x2 = this.x + widthDiff + this.collisionBuffer;
    let y2 = this.y + heightDiff + this.collisionBuffer;

    return new CollisionModel(y1, x2, y2, x1);
  }

  /**
   * Draws the square on the canvas context.
   * @param context The canvas context to draw on.
   */
  draw(context: CanvasRenderingContext2D) {
    // don't draw if it is disabled
    if (!this.active) return;

    // generate a square from code
    if (this.attributes.isLetter) {
      context.font = '50px Coiny';
      context.fillStyle = '#000';
      context.fillText(this.letter, this.x, this.y);
    }
    else {
      let widthDiff = (this.width/2);
      let heightDiff = (this.height/2);
      let x1 = this.x - widthDiff;
      let y1 = this.y - heightDiff;

      let x2 = this.x + widthDiff;
      let y2 = this.y + heightDiff;


      context.beginPath();
      context.rect(x1,y1, x2-x1, y2-y1);
      context.fillStyle = this.colour;
      context.fill();
      context.closePath();
    }
  }
}


class ItemAttributes {
  private constructor(points: number, isHazard: boolean, iconPath: string,
    name: string, rarity: number, isLetter = false) {
    this.points = points;
    this.isHazard = isHazard;
    this.iconPath = iconPath;
    this.name = name;
    this.rarity = rarity;
    this.isLetter = isLetter;
  }


  static createRandomAttributes(): ItemAttributes {
    let randNum = randomNumBetween(0, 60);
    // search most common first (saves on cycles because it returns earlier
    // when the most common is checked first)

    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      if (randNum >= item.rarity) return item;
    }

    // if nothing found, return the error (resilience!)
    return this.items[0];
  }


  static createLetterAttributes(): any {
    return new ItemAttributes(2, false, '#BC815F', 'Letter', 16, true)
  }

  public points: number;
  public rarity: number;
  public iconPath: string;
  public name: string;

  // these booleans look like they should be subclasses of item
  // but with only 2 in a simple game, it's not a priority
  public isHazard: boolean;
  public isLetter: boolean;

  // These needed to be sorted by rarity with most common (highest) first
  private static items: ItemAttributes[] = [
    new ItemAttributes(1, false, '#7F3300', '', 30),
    new ItemAttributes(0, true, '#FF0000', 'Hazard', 22),
    new ItemAttributes(4, false, '#C4C4C4', '', 13),
    new ItemAttributes(0, false, '#000000', '', 7),
    new ItemAttributes(8, false, '#FFD800', '', 4),
    new ItemAttributes(16, false, '#AAFFFF', '', 2),
    new ItemAttributes(32, false, '#7C00FF', '', 1),
  ];
}