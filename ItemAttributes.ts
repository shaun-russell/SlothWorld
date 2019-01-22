import { randomNumBetween } from "./DataStructures";
import { Resources } from "./Resources";

/** A container for Item stats and details. This could probably be merged
 *  with the Item class.
 */
export class ItemAttributes {

  /** Creates a random fruit item. */
  public static createFruitAttributes(): ItemAttributes {
    const randNum = randomNumBetween(0, 90);
    // this.items needs to be sorted with the highest 'rarity' first.
    for (const item of this.items) {
      if (randNum >= item.rarity) { return item; }
    }

    // if nothing found, return the error (resilience!)
    return this.items[0];
  }

  /** Creates the ItemAttributes for a letter item. */
  public static createLetterAttributes(): any {
    return new ItemAttributes(2, false, Resources.NULL_IMAGE, "Letter", 0, true);
  }

  // These needed to be sorted by rarity with most common (highest) first
  private static items: ItemAttributes[] = [
    new ItemAttributes(1, false, Resources.fruitA, "Watermelon", 40),
    new ItemAttributes(0, true, Resources.hazard, "Hazard", 22, false, Resources.hazardFlipped),
    new ItemAttributes(2, false, Resources.fruitB, "Honeydew Melon", 13),
    new ItemAttributes(4, false, Resources.fruitC, "Rock Melon", 5),
    new ItemAttributes(8, false, Resources.fruitD, "Crystal Melon", 1),
  ];

  public points: number;
  public rarity: number;
  public iconPath: string;
  public iconPathFlipped: string;
  public name: string;

  // these booleans look like they should be subclasses of item
  // but with only 2 in a simple game, it's not a priority
  public isHazard: boolean;
  public isLetter: boolean;

  /**
   * Private constructor for Item Attributes, as they are created through
   * a static method rather than from outside.
   * @param points The number of points the item is worth.
   * @param isHazard True if the item stuns the player.
   * @param iconPath The string path to the image.
   * @param name The name of the item.
   * @param rarity The probability that this item will be generated.
   * @param isLetter Optional: True if the item is a letter item.
   * @param flippedImage Optional: an image path but pre-flipped
   */
  private constructor(points: number, isHazard: boolean, iconPath: string,
                      name: string, rarity: number, isLetter = false,
                      flippedImage = '') {
    this.points = points;
    this.isHazard = isHazard;
    this.iconPath = iconPath;
    this.name = name;
    this.rarity = rarity;
    this.isLetter = isLetter;
    this.iconPathFlipped = flippedImage;
  }
}
