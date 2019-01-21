/** Handles HTML element access and manipulation. */
export class ElementManager {

  /** Handle messy HTML element fetching. */
  public static getElement(resourceId: string): HTMLElement {
    const element = document.getElementById(resourceId) as HTMLElement;
    // at some point, handle error conditions
    return element;
  }
}
