import {KeyValuePair, randomNumBetween} from "./DataStructures";

/** A letter collection that is filled during the game. */
export class WordSet {
  public wordArray: Array<KeyValuePair<boolean>> = [];
  private fullWord: string;

  /**
   * Initialise a new WordSet using any string word.
   * @param word The word to use in the WordSet
   */
  constructor(word: string) {
    // Create an array for every character in the word
    for (const char of word) {
      // each word starts as false. words are collected during the game
      this.wordArray.push(new KeyValuePair<boolean>(char, false));
    }
    this.fullWord = word;
  }

  /** Returns true if all letters have been activated */
  get isWordComplete(): boolean {
    // return false if any letter is unfinished
    let complete = true;
    for (const kvPair of this.wordArray) {
      if (!kvPair.value) {
        // word found, just exit now
        complete = false;
        return complete;
      }
    }
    // if not returned, it means all letters are true, and therefore
    // the word is complete
    return complete;
  }

  /** Returns the full target word. */
  public get word(): string { return this.fullWord; }

  /** Activates a single letter in the word set. */
  public activateLetter(letter: string) {
    // set the value of this letter to true
    for (const kvPair of this.wordArray) {
      if (kvPair.key.toLowerCase() === letter.toLowerCase() && !kvPair.value) {
        // letter is not filled and matches
        kvPair.value = true;
        break;
      }
    }
    // sometimes a letter is doubled up on the screen (random generation)
    // so if a letter is not found, do nothing.
  }

  /** Returns a single random unactivated letter. */
  public getUnactivatedLetter(): string {
    // find all letters whose value is false (not filled)
    const availableLetters = this.wordArray.filter((kvpair) => {
      return !kvpair.value;
    });
    // return a blank if the word is finished, but the game loop hasn't 
    // generated a new word yet
    if (availableLetters.length < 1) {
      return ' ';
    }
    // js random in inclusive,inclusive (not inc,exc)
    const randomIndex = randomNumBetween(0, availableLetters.length - 1);
    return availableLetters[randomIndex].key;
  }
}
