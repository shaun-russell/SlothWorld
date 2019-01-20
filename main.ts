class ItemAttributes {
  static getRandomItem(): ItemAttributes {
    let randNum = randomNumBetween(0, 100);
    // search most common first (saves on cycles because it returns earlier
    // when the most common is checked first)
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      if (randNum >= item.rarity) return item;
    }

    // if nothing found, return the error (resilience!)
    return this.items[0];
  }

  constructor(points: number, isHazard: boolean, iconPath: string,
    name: string, rarity: number, isLetter = false) {
    this.points = points;
    this.isHazard = isHazard;
    this.iconPath = iconPath;
    this.name = name;
    this.rarity = rarity;
    this.isLetter = isLetter;
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
    new ItemAttributes(1, false, '#7F3300', 'Wood', 30),
    new ItemAttributes(0, true, '#FF0000', 'Hazard', 22),
    new ItemAttributes(2, false, '#BC815F', 'Bronze', 16),
    new ItemAttributes(4, false, '#C4C4C4', 'Silver', 11),
    new ItemAttributes(0, false, '#000000', 'Letter', 7, true),
    new ItemAttributes(8, false, '#FFD800', 'Gold', 4),
    new ItemAttributes(16, false, '#AAFFFF', 'Platinum', 2),
    new ItemAttributes(32, false, '#7C00FF', 'Astral', 1),
  ];
}

function degToRad(degrees: number) {
  return degrees * Math.PI / 180;
}

// using generics so it's flexible
class KeyValuePair<T> {
  constructor(key: string, value: T) {
    this.key = key;
    this.value = value;
  }
  public key: string;
  public value: T;
}

class WordInventory {
  constructor(word: string) {
    for (let i = 0; i < word.length; i++) {
      const char = word[i];
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

class FixedPosition {
  public static LEFT_TOP: [number, number]  = [0.0, 0.0];
  public static MID_TOP: [number, number]   = [0.5, 0.0];
  public static RIGHT_TOP: [number, number] = [1.0, 0.0];

  public static LEFT_MID: [number, number]  = [0.0, 0.5];
  public static MID_MID: [number, number]   = [0.5, 0.5];
  public static RIGHT_MID: [number, number] = [1.0, 0.5];

  public static LEFT_BOT: [number, number]  = [0.0, 1.0];
  public static MID_BOT: [number, number]   = [0.5, 1.0];
  public static RIGHT_BOT: [number, number] = [1.0, 1.0];
}

interface IDict<T> {
  [key: string]: T
}

class ScreenPositions {
  constructor() {
  }

  public fullHeight = 0;
  public fullWidth = 0;

  public hangY = 90;

  public seesawYHigh = 0;
  get seesawYLow() { return this.fullHeight - 30; };

  public padEdge = 20;
  public padCenter = 70;

  get fruitYTop() { return 100; }
  get fruitYBot() { return this.fullHeight - 100; }

  get centerX() { return this.fullWidth / 2; }
  get centerY() { return this.fullHeight / 2; }
}

class Game {
  initialise(canvasId: string) {
    // if restarting game
    this.stopTimers();

    this.canvas = <HTMLCanvasElement>document.getElementById(canvasId);
    this.context = <CanvasRenderingContext2D>this.canvas.getContext("2d");
    this.scoreElement = <HTMLHeadingElement>document.getElementById('score');
    this.timerbar = <HTMLProgressElement>document.getElementById('timer-bar');

    this._loadSprites();

    // this.c = this.canvas.height - 30;
    // this.lowerY = this.canvas.height - 100;
    this.pos.fullHeight = this.canvas.height;
    this.pos.fullWidth = this.canvas.width;

    // this.screenBounds = new Bounds(this.canvasHeight, this.canvasWidth);

    var boundsLeft = new NumberRange(game.pos.padEdge,
                                     game.pos.fullWidth / 2 - game.pos.padCenter);
    var boundsRight = new NumberRange(game.pos.fullWidth / 2 + game.pos.padCenter,
                                      game.pos.fullWidth - game.pos.padEdge);
    var leftActor = new Actor(ActorState.resting, boundsLeft, this.sprites['sloth-1']);
    var rightActor = new Actor(ActorState.waiting, boundsRight, this.sprites['sloth-2']);
    this.actors = [leftActor, rightActor]

    this.targetWord = new WordInventory("HELLO");

    var framerate = 10; // 10 
    this.drawTimer = setInterval(game.draw, framerate);
    this.squareTimer = setInterval(game.spawnSquare, 500);
    this.gameTimer = setInterval(game.tickTimer, 500);
  }

  private canvas: any;
  private context: any;
  private scoreElement: any;

  public screenBounds: Bounds = new Bounds(0, 0);
  public ySpeed = 6;
  public xSpeed = 4;

  public pos = new ScreenPositions();

  public leftKeyDown = false;
  public rightKeyDown = false;


  public targetWord: WordInventory = new WordInventory("HELLO");

  private drawTimer: number = 0;
  private squareTimer: number = 0;
  private gameTimer: number = 0;

  private score: number = 0;
  public squares: Square[] = []

  public sprites: IDict<HTMLImageElement> = {};


  // Use this list and index method. Can't assign an activeActor pointer
  // in javascript, so instead the activeActor is done through a list index.
  // When the actor changes, the index changes. Avoids all reference/assignment
  // problems using the objects and object references.
  private actors: Actor[] = [];
  public activeActorNum: number = 0;

  _loadSprites() {
    this.sprites['seesaw-log'] = <HTMLImageElement>document.getElementById('seesaw-log');
    this.sprites['seesaw-rock'] = <HTMLImageElement>document.getElementById('seesaw-rock');
    this.sprites['sloth-1'] = <HTMLImageElement>document.getElementById('sloth-1');
    this.sprites['sloth-2'] = <HTMLImageElement>document.getElementById('sloth-2');
  }

  getActiveActor(): Actor {
    return this.actors[this.activeActorNum];
  }

  stopTimers(): void {
    window.clearInterval(this.drawTimer);
    window.clearInterval(this.squareTimer);
    window.clearInterval(this.gameTimer);
  }

  drawActors() {
    // this is its own function because actors is private and the 'draw' method
    // is run from the window context
    this.actors.forEach(actor => {
      actor.draw(<CanvasRenderingContext2D>this.context);
    });
  }

  drawWords() {
    let text = "";
    this.targetWord.wordArray.forEach(kv => {
      if (kv.value) {
        text += kv.key.toUpperCase();
      }
      else {
        text += '_';
      }
    });
    this.context.font = '40px Coiny';
    this.context.fillStyle = "#000";
    this.context.fillText(text, 180, 60);
  }

  drawSpriteXY(context: CanvasRenderingContext2D, imageName: string,
              x: number, y: number, centerX: boolean = false, centerY: boolean = false) {
    let width = game.sprites[imageName].width;
    let height = game.sprites[imageName].height;
    // If centerX or centerY, then the origin coordinate is (0.5,0.5), not (0,0)
    let px = x;
    if (centerX) {
      px = x - (width/2);
    }

    let py = y;
    if (centerY) {
      px = x - (width/2);
    }
    context.drawImage(game.sprites[imageName], px, py, width, height);
  }

  drawSpriteFixed(context: CanvasRenderingContext2D, imageName: string, fixedPos: [number, number]) {
    let width = game.sprites[imageName].width;
    let height = game.sprites[imageName].height;
    // If centerX or centerY, then the origin coordinate is (0.5,0.5), not (0,0)
    let px = game.pos.fullWidth * fixedPos[0] - (width / 2);
    let py = game.pos.fullHeight * fixedPos[1] - (height / 2);

    // correct in corners
    // todo: improve this and make it apply for everything
    if (fixedPos[1] == 1) {
      py -= height/2;
    }

    context.drawImage(game.sprites[imageName], px, py, width, height);
  }

  draw() {
    // THIS DRAW METHOD RUNS INSIDE WINDOW CONTEXT
    // 'this' REFERS TO 'window', NOT THE GAME CLASS
    (game.context as CanvasRenderingContext2D).clearRect(0, 0, game.pos.fullWidth, game.pos.fullHeight);


    game.drawWords();

    // move horizontally
    game.getActiveActor().moveX();
    game.getActiveActor().moveY();

    // update squares
    game.squares.forEach(sq => {
      if (sq.active) {
        sq.checkCanvasWidthBounds(game.pos.fullWidth);
        if (sq.active) {
          if (game.getActiveActor().collisionModel.collidesWith(sq.collisionModel)) {
            sq.setColour("#00FF00");
            sq.active = false;
            game.addScore(sq.attributes.points);
            if (sq.attributes.isLetter) {
              game.targetWord.addLetter(sq.letter);
              if (game.targetWord.isWordComplete) {
                // new word, time boost
                game.setNewWord();
              }
            }
          }
        }
        sq.moveX();
        sq.draw(<CanvasRenderingContext2D>game.context);
      }
    });


    // draw seesaw
    game.drawSpriteFixed(game.context, 'seesaw-rock', FixedPosition.MID_BOT);
    // rotate seesaw to direction of new active actor
    let slW = game.sprites['seesaw-log'].width;
    let xt = game.pos.centerX-slW/2+slW/2;
    let slH = game.sprites['seesaw-log'].height;
    let yt = 540-slH/2+slH/2;
    game.context.translate(xt, yt);
    if (game.activeActorNum == 0) {
      game.context.rotate(degToRad(10));
    }
    else {
      game.context.rotate(degToRad(350));
    }
    game.context.translate(-xt, -yt);
    game.drawSpriteXY(game.context, 'seesaw-log', game.pos.centerX, 540, true);

    // reset the rotation
    game.context.setTransform(1, 0, 0, 1, 0, 0);
    // update character position
    game.drawActors();

    if (game.getActiveActor().state == ActorState.landing) {
      // save the current movement so we can pass it to the next actor
      let prevDx = game.getActiveActor().dx;
      // swap characters when one reaches the bottom (seesaw)
      game.switchActor();
      // launch the new actor upwards
      game.getActiveActor().state = ActorState.ascending;
      game.getActiveActor().dy = Direction.Reverse;
      // add the current movement to the new actor (makes transition fluid)
      game.getActiveActor().dx = prevDx;
    }
  }

  private gameTime = 60;
  private timerbar: HTMLProgressElement | null = null;

  tickGameTimer() {
    this.gameTime -= 0.5;
    if (this.gameTime == 0) {
      // Game Over
      console.log('GAME OVER');
    }
    else if (this.timerbar != null) {
      this.timerbar.value = this.gameTime;
    }
  }

  tickTimer() {
    // send the context back to the game object
    game.tickGameTimer();
  }

  setNewWord(): void {
    this.gameTime += 20;
    if (this.targetWord.fullWord.toLowerCase() == "hello") {
      this.targetWord = new WordInventory("WORLD");
    }
    else {
      this.targetWord = new WordInventory("HELLO");
    }
  }

  addScore(newPoints: number): any {
    game.score += newPoints;
    if (this.scoreElement != null) {
      this.scoreElement.textContent = 'Score: ' + game.score;
    }
  }

  private timeOffset = 0;
  spawnSquare() {
    // if there's a delay, skip this function
    if (this.timeOffset > 0) {
      this.timeOffset--;
      return;
    }

    // spawn a square
    var direction = randomNumBetween(0, 1);
    var xOrigin = 0;
    if (direction == Direction.Stopped) {
      direction = Direction.Reverse;
      xOrigin = game.pos.fullWidth;
    }
    else {
      direction = Direction.Forward;
      xOrigin = 0;
    }

    // inverted because upper is a smaller number than lower
    var yPosition = randomNumBetween(game.pos.fruitYTop, game.pos.fruitYBot);

    let attributes = ItemAttributes.getRandomItem();
    let letter = '';
    if (attributes.isLetter) {
      letter = game.targetWord.getNewLetter();
    }
    var square = new Square(direction, yPosition, xOrigin, attributes, letter);
    game.squares.push(square);

    // delete squares that are no longer visible
    game.squares = game.squares.filter(sq => {
      return sq.active;
    });

    // create a new offset
    this.timeOffset = randomNumBetween(0, 4);
  }


  switchActor(): void {
    this.getActiveActor().dx = Direction.Stopped;
    if (this.activeActorNum == 0) {
      this.activeActorNum = 1;
    }
    else {
      this.activeActorNum = 0;
    }
  }
}

// although render origin is top left, it is more consistent with the *user* that
// bottom is the bottom, even though the bottom Y is higher than the upper Y

function randomNumBetween(lower: number, upper: number) {
  return Math.floor(Math.random() * (upper - lower + 1) + lower)
}


class CollisionModel {
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

interface ICollidable {
  readonly collisionModel: CollisionModel;
}

enum Direction {
  Forward = 1,
  Stopped = 0,
  Reverse = -1,
}

class Bounds {
  constructor(height: number, width: number) {
    this.height = height;
    this.width = width;
  }

  public height: number;
  public width: number;
}

class NumberRange {
  constructor(min: number, max: number) {
    this.min = min;
    this.max = max;
  }
  public min: number;
  public max: number;
}






var game = new Game();
window.onload = function () {
  game.initialise('game-canvas');
};









/** The animation/position states of an actor. */
enum ActorState {
  descending,
  ascending,
  jumping,
  landing,
  resting,
  waiting
}

class Actor implements ICollidable {
  constructor(state: ActorState, xLimit: NumberRange, sprite: HTMLImageElement) {
    this.state = state;
    this.xMin = xLimit.min;
    this.xMax = xLimit.max;

    this.dx = Direction.Stopped;
    this.dy = Direction.Stopped;

    this.sprite = sprite;
    // this.radius = 15;
    this.collisionBuffer = 15;

    // x = centre of character bounds
    this.x = ((this.xMax - this.xMin) / 2) + this.xMin;

    // set the initial Y position based on the character state
    if (this.state == ActorState.resting) {
      this.y = game.pos.hangY;
    }
    else {
      this.y = game.pos.seesawYLow;
    }
  }

  public x: number;
  public y: number;
  public dx: number;
  public dy: number;

  public sprite: HTMLImageElement;
  public state: ActorState;

  private xMin: number;
  private xMax: number;
  // private radius: number;
  private collisionBuffer: number;


  private yLerp: number = 30;
  private getYLerpSpeed(): number {
    return 0;
  }

  moveX() {
    // hit the left or right edge?
    // stop movement (and don't update)
    // Because dx is just direction, movement combines speed with this.
    // Therefore all edge checks must require the speed (otherwise the actor
    // goes past the edge and is permanently stuck
    if (this.x + (this.dx*game.xSpeed) >= this.xMax || this.x + (this.dx*game.xSpeed) <= this.xMin) {
      this.dx = Direction.Stopped;
    }

    // if not on the edge, move but don't change the original direction
    // The arrow keys change the direction, not the game. The game just
    // provides boundaries by ignoring the input (rather than overriding it)
    // this all helps keep movement responsive and reliable
    else if (game.leftKeyDown || game.rightKeyDown) {
      // need to clamp this within game bounds
      let newPosition = this.x + (game.xSpeed * this.dx);
      if (newPosition < this.xMin) this.x = this.xMin;
      else if (newPosition > this.xMax) this.x = this.xMax;
      // within bounds, set anywhere
      else this.x += game.xSpeed * this.dx;
    }
  }

  moveY() {
    // Because dy is just direction (-1,0,1), movement combines speed with this.
    // Therefore all edge checks must require the speed (otherwise the actor
    // goes past the edge and is permanently stuck
    if (this.y + (this.dy*game.ySpeed) < game.pos.hangY) {
      // actor has reached the vertical height limit
      this.dy = Direction.Stopped;
      this.state = ActorState.resting;
    }
    else if (this.y + (this.dy*game.ySpeed) > game.pos.seesawYLow) {
      // actor has reached the lower height limit
      this.dy = Direction.Stopped;
      this.state = ActorState.landing;
    }
    else {
      // move vertically
      // if lerp frames, then lerp
      this.y += game.ySpeed * this.dy;
    }
  }

  get collisionModel(): CollisionModel {
    var widthDiff = this.sprite.width / 2 + this.collisionBuffer;
    var heightDiff = this.sprite.height / 2 + this.collisionBuffer;
    return new CollisionModel(this.y - heightDiff,
      this.x + widthDiff,
      this.y + widthDiff,
      this.x - widthDiff)
  }

  draw(context: CanvasRenderingContext2D) {
    // context.beginPath();
    // context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    // context.fillStyle = this.colour;
    // context.fill();
    // context.closePath();
    let px = this.x - this.sprite.width;
    let py = this.y - this.sprite.height;
    context.drawImage(this.sprite, px, py, this.sprite.width, this.sprite.height);
  }
}


class Square implements ICollidable {
  constructor(direction: Direction, yPosition: number, xOrigin: number,
    attributes: ItemAttributes, letter: string) {
    this.direction = direction;
    this.xPosition = xOrigin;
    this.yPosition = yPosition;
    this.height = 30;
    this.width = 30;
    this.speed = randomNumBetween(1, 3);
    this.active = true;
    this.collisionBuffer = 10;
    this._attributes = attributes;
    // temporary
    this.colour = this._attributes.iconPath;
    if (this.attributes.isLetter) {
      this.letter = letter;
    }
  }

  /** If false, object should be deleted at the first opportunity. */
  public active: boolean;
  public letter: string = '';

  private direction: Direction;
  private xPosition: number;
  private yPosition: number;
  private height: number;
  private width: number;
  private collisionBuffer: number;

  private colour: string;
  private speed: number;
  private _attributes: ItemAttributes;

  setColour(newColour: string): void {
    // NOTE: because argb is a valid colour, the responsibility is on
    // the developer to provide a correct colour (it's static and not hard)
    // rather than the program assuming the correct colour format.
    // If the colour came from the user, it would be a different story.
    this.colour = newColour;
  }

  moveX(): void {
    this.xPosition += this.speed * this.direction;
  }

  get attributes(): ItemAttributes {
    return this._attributes;
  }


  checkCanvasWidthBounds(width: number): boolean {
    // Include width in position calculation so the object does not
    // get disabled as soon as one side hits the screen bounds.
    // The object is only disabled when it is *entirely* outside the bounds.
    if (this.xPosition + this.width < 0 ||
      this.xPosition - this.width > width) {
      this.active = false;
    }
    // return the active state to save needing another if statement
    return this.active;
  }

  /**
   * Returns the collision coordinate model at the current square's position.
   */
  get collisionModel(): CollisionModel {
    var heightDiff = this.height / 2 + this.collisionBuffer;
    var widthDiff = this.width / 2 + this.collisionBuffer;
    return new CollisionModel(this.yPosition - heightDiff,
      this.xPosition + widthDiff,
      this.yPosition + widthDiff,
      this.xPosition - widthDiff)
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
      context.fillText(this.letter, this.xPosition, this.yPosition);
    }
    else {
      context.beginPath();
      context.rect(this.xPosition, this.yPosition, this.height, this.width);
      context.fillStyle = this.colour;
      context.fill();
      context.closePath();
    }
  }
}




document.onkeydown = keyDown;
document.onkeyup = keyReleased;

function keyDown(e: KeyboardEvent) {
  e = e || window.event;
  if (e.keyCode == 32 && game.getActiveActor().state == ActorState.resting) {
    // space bar, start descent
    game.getActiveActor().state = ActorState.descending;
    game.getActiveActor().dy = Direction.Forward;
  }
  if (e.keyCode == 37) {
    // left arrow
    game.getActiveActor().dx = Direction.Reverse;
    game.leftKeyDown = true;
  }
  else if (e.keyCode == 39) {
    // right arrow
    game.getActiveActor().dx = Direction.Forward;
    game.rightKeyDown = true;
  }
}

function keyReleased(e: KeyboardEvent) {
  // the reason to not just set dx to 0 is because a player can hold both
  // arrow keys down at the same time. Holding LEFT, then holding RIGHT before
  // releasing LEFT shouldn't stop the RIGHT movement. If we just set it to 0,
  // it stops the current movement
  if (e.keyCode == 37) {
    // left arrow
    game.leftKeyDown = false;
    if (game.rightKeyDown == true) {
      // go back to this direction instead
      // R held, L held, L released (but R still held)
      game.getActiveActor().dx = Direction.Forward;
    }
    else game.getActiveActor().dx = Direction.Stopped;
  }
  else if (e.keyCode == 39) {
    // right arrow
    game.rightKeyDown = false;
    if (game.leftKeyDown == true) {
      // go back to this direction instead
      // L held, R held, R released (but L still held)
      game.getActiveActor().dx = Direction.Reverse;
    }
    else game.getActiveActor().dx = Direction.Stopped;
  }
}