import {KeyValuePair, randomNumBetween} from './DataStructures'

export class WordSet {
  /**
   * Initialise a new WordSet using any string word.
   * @param word 
   */
  constructor(word: string) {
    // Create an array for every character in the word
    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      // each word starts as false. words are collected during the game
      this.wordArray.push(new KeyValuePair<Boolean>(char, false));
    }
    this.fullWord = word;
  }

  public wordArray: KeyValuePair<Boolean>[] = [];
  public fullWord: string;

  addLetter(letter: string) {
    // set the value of this letter to true
    for (let i = 0; i < this.wordArray.length; i++) {
      const kvPair = this.wordArray[i];
      if (kvPair.key.toLowerCase() == letter.toLowerCase() && !kvPair.value) {
        // letter is not filled and matches
        kvPair.value = true;
        break;
      }
    }
    // if word doesn't match anything (such as when the word changes,
    // but the player collides with an old letter) do nothing.
  }

  get isWordComplete(): boolean {
    // return false if any letter is unfinished
    let complete = true;
    for (let i = 0; i < this.wordArray.length; i++) {
      const kvPair = this.wordArray[i];
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

  getNewLetter(): string {
    // find all letters whose value is false (not filled)
    let availableLetters = this.wordArray.filter(kvpair => {
      return !kvpair.value;
    });
    // js random in inclusive,inclusive (not inc,exc)
    let randomIndex = randomNumBetween(0, availableLetters.length - 1);
    return availableLetters[randomIndex].key;

  }
}

