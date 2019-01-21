import { Actor, ActorState } from './Actor'
import { Direction, Bounds, NumberRange, randomNumBetween, IDict, degToRad } from './DataStructures'
import { Item } from './Item'
import { WordSet } from './WordSet'
import { GameValueSet } from './GameValueSet';


export class Game {
  constructor() {
    // subscribe to key events early
    document.onkeydown = this.keyDown.bind(this);
    document.onkeyup = this.keyReleased.bind(this);
  }

  initialise(canvasId: string) {
    // if restarting game
    this.stopTimers();
    this.actors = [];
    this.items = [];

    this.canvas = <HTMLCanvasElement>document.getElementById(canvasId);
    this.context = <CanvasRenderingContext2D>this.canvas.getContext("2d");


    this.loadSprites();

    GameValueSet.init(this.canvas); //fullHeight = this.canvas.height;
    // this.pos.fullWidth = this.canvas.width;

    let boundsLeft = new NumberRange(GameValueSet.padEdge,
      GameValueSet.scWidth / 2 - GameValueSet.padCentre);

    let boundsRight = new NumberRange(GameValueSet.scWidth / 2 + GameValueSet.padCentre,
      GameValueSet.scWidth - GameValueSet.padEdge);
    var leftActor = new Actor(ActorState.resting, boundsLeft, this.sprites['sloth-1']);
    var rightActor = new Actor(ActorState.waiting, boundsRight, this.sprites['sloth-2']);
    this.actors = [leftActor, rightActor]

    this.activeActorNum = 0;
    this.targetWord = new WordSet("HELLO");
    this.gameTime = 60;
    this.score = 0;
    this.leftKeyDown = false;
    this.rightKeyDown = false;

    this.gameStarted = true;

    this.startTimers();
  }

  startTimers() {
    let framerate = 10; // 10 
    this.drawTimer = setInterval(this.draw.bind(this), framerate);
    this.squareTimer = setInterval(this.spawnNewItem.bind(this), 500);
    this.gameTimer = setInterval(this.tickGameTimer.bind(this), 500);
  }

  private canvas: any;
  public context: any; // change this back to private
  // private scoreElement: any;

  public screenBounds: Bounds = new Bounds(0, 0);

  public leftKeyDown = false;
  public rightKeyDown = false;
  public gameStarted = false;

  public targetWord: WordSet = new WordSet("HELLO");

  private drawTimer: number = 0;
  private squareTimer: number = 0;
  private gameTimer: number = 0;

  private score: number = 0;
  public items: Item[] = []

  public sprites: IDict<HTMLImageElement> = {};


  // Use this list and index method. Can't assign an activeActor pointer
  // in javascript, so instead the activeActor is done through a list index.
  // When the actor changes, the index changes. Avoids all reference/assignment
  // problems using the objects and object references.
  private actors: Actor[] = [];
  public activeActorNum: number = 0;

  private loadSprites() {
    this.sprites['seesaw-log'] = <HTMLImageElement>document.getElementById('seesaw-log');
    this.sprites['seesaw-rock'] = <HTMLImageElement>document.getElementById('seesaw-rock');
    this.sprites['sloth-1'] = <HTMLImageElement>document.getElementById('sloth-1');
    this.sprites['sloth-2'] = <HTMLImageElement>document.getElementById('sloth-2');
  }


  private keyDown(e: KeyboardEvent) {
    e = e || window.event;
    if (!this.gameStarted && e.keyCode == 32) {
      (document.getElementById('ui') as HTMLDivElement).setAttribute('style', 'display: none');
      (window as any)['game'].initialise('game-canvas');
      return;
    }
    if (e.keyCode == 32 && this.getActiveActor().state == ActorState.resting) {
      // space bar, start descent
      this.getActiveActor().state = ActorState.descending;
      this.getActiveActor().dy = Direction.Forward;
      GameValueSet.ySpeed = GameValueSet.minYSpeed;
    }

    // if game started, just exit to avoid calling uninitialised objects
    if (!this.gameStarted) { return; }

    if (e.keyCode == 37) {
      // left arrow
      this.getActiveActor().dx = Direction.Reverse;
      this.leftKeyDown = true;
    }
    else if (e.keyCode == 39) {
      // right arrow
      this.getActiveActor().dx = Direction.Forward;
      this.rightKeyDown = true;
    }
  }

  private keyReleased(e: KeyboardEvent) {
    if (!this.gameStarted) { return; }
    // the reason to not just set dx to 0 is because a player can hold both
    // arrow keys down at the same time. Holding LEFT, then holding RIGHT before
    // releasing LEFT shouldn't stop the RIGHT movement. If we just set it to 0,
    // it stops the current movement
    if (e.keyCode == 37) {
      // left arrow
      this.leftKeyDown = false;
      if (this.rightKeyDown == true) {
        // go back to this direction instead
        // R held, L held, L released (but R still held)
        this.getActiveActor().dx = Direction.Forward;
      }
      else this.getActiveActor().dx = Direction.Stopped;
    }
    else if (e.keyCode == 39) {
      // right arrow
      this.rightKeyDown = false;
      if (this.leftKeyDown == true) {
        // go back to this direction instead
        // L held, R held, R released (but L still held)
        this.getActiveActor().dx = Direction.Reverse;
      }
      else this.getActiveActor().dx = Direction.Stopped;
    }
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

  drawTime() {
    this.context.font = '20px Coiny';
    this.context.fillStyle = "#3A3D3B";
    let maxWidth = 100;
    let timePercentage = this.gameTime / 60;
    this.context.fillRect(200, 60, maxWidth + 8, 16);
    this.context.fillStyle = "#F9C22E";
    this.context.fillRect(204, 64, maxWidth * timePercentage, 8);
    // this.context.fillText(this.gameTime, 220, 50);
  }

  drawScore() {
    this.context.font = '64px Coiny';
    this.context.fillStyle = "#3A3D3B";
    this.context.fillStyle = "#F9C22E";
    let position = 232;
    if (this.score > 99) { position -= 32; }
    else if (this.score > 9) { position -= 16; }
    this.context.fillText(this.score, position, 48);
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
    // this.context.fillStyle = "#000";
    this.context.fillStyle = "#3A3D3B";
    this.context.fillStyle = "#F9C22E";
    this.context.fillText(text, 188, 112);
  }

  drawSpriteXY(context: CanvasRenderingContext2D, imageName: string,
    x: number, y: number, centerX: boolean = false, centerY: boolean = false) {
    let width = this.sprites[imageName].width;
    let height = this.sprites[imageName].height;
    // If centerX or centerY, then the origin coordinate is (0.5,0.5), not (0,0)
    let px = x;
    if (centerX) {
      px = x - (width / 2);
    }

    let py = y;
    if (centerY) {
      px = x - (width / 2);
    }
    context.drawImage(this.sprites[imageName], px, py, width, height);
  }

  drawSpriteFixed(context: CanvasRenderingContext2D, imageName: string, fixedPos: [number, number]) {
    let width = this.sprites[imageName].width;
    let height = this.sprites[imageName].height;
    // If centerX or centerY, then the origin coordinate is (0.5,0.5), not (0,0)
    let px = GameValueSet.scWidth * fixedPos[0] - (width / 2);
    let py = GameValueSet.scHeight * fixedPos[1] - (height / 2);

    // correct in corners
    // todo: improve this and make it apply for everything
    if (fixedPos[1] == 1) {
      py -= height / 2;
    }

    context.drawImage(this.sprites[imageName], px, py, width, height);
  }

  draw() {
    // THIS DRAW METHOD RUNS INSIDE WINDOW CONTEXT
    // 'this' REFERS TO 'window', NOT THE GAME CLASS
    (this.context as CanvasRenderingContext2D).clearRect(0, 0, GameValueSet.scWidth, GameValueSet.scHeight);

    this.drawTime();
    this.drawScore();
    this.drawWords();

    // move horizontally
    this.getActiveActor().moveX(this.leftKeyDown, this.rightKeyDown);
    this.getActiveActor().moveY();

    // update squares
    this.items.forEach(sq => {
      if (sq.active) {
        sq.checkCanvasWidthBounds(GameValueSet.scWidth);
        // check collision
        if (sq.active && !this.getActiveActor().isStunned) {
          if (this.getActiveActor().collisionModel.collidesWith(sq.collisionModel)) {
            sq.setColour("#00FF00");
            sq.active = false;
            this.addScore(sq.attributes.points);
            if (sq.attributes.isLetter) {
              this.targetWord.addLetter(sq.letter);
              if (this.targetWord.isWordComplete) {
                // new word, time boost
                this.setNewWord();
              }
            }
            else if (sq.attributes.isHazard) {
              this.getActiveActor().applyStun();
            }
          }
        }
        // update square
        sq.moveX();
        sq.draw(<CanvasRenderingContext2D>this.context);
      }
    });


    // draw seesaw
    this.drawSpriteXY(this.context, 'seesaw-rock', GameValueSet.scWidth / 2 - this.sprites['seesaw-rock'].width / 2, GameValueSet.scHeight - this.sprites['seesaw-rock'].height + 3);
    // rotate seesaw to direction of new active actor
    let slW = this.sprites['seesaw-log'].width;
    let xt = GameValueSet.centerX - slW / 2 + slW / 2;
    let slH = this.sprites['seesaw-log'].height;
    let yt = 540 - slH / 2 + slH / 2;
    this.context.translate(xt, yt);
    if (this.activeActorNum == 0) {
      this.context.rotate(degToRad(10));
    }
    else {
      this.context.rotate(degToRad(350));
    }
    this.context.translate(-xt, -yt);
    this.drawSpriteXY(this.context, 'seesaw-log', GameValueSet.centerX, 540, true);

    // reset the rotation
    this.context.setTransform(1, 0, 0, 1, 0, 0);
    // update character position
    this.drawActors();

    if (this.getActiveActor().state == ActorState.landing) {
      // save the current movement so we can pass it to the next actor
      let prevDx = this.getActiveActor().dx;
      // swap characters when one reaches the bottom (seesaw)
      this.switchActor();
      // launch the new actor upwards
      this.getActiveActor().state = ActorState.ascending;

      GameValueSet.ySpeed = GameValueSet.maxYSpeed;
      this.getActiveActor().dy = Direction.Reverse;
      // add the current movement to the new actor (makes transition fluid)
      this.getActiveActor().dx = prevDx;
    }
    if (this.getActiveActor().state == ActorState.ascending &&
      GameValueSet.ySpeed > GameValueSet.minYSpeed) {
      // console.log('DECELERATING');
      GameValueSet.ySpeed -= GameValueSet.ySpeedDelta;
    }
    else if (this.getActiveActor().state == ActorState.descending &&
      GameValueSet.ySpeed < GameValueSet.maxYSpeed) {
      // console.log('ACCELERATING');
      GameValueSet.ySpeed += GameValueSet.ySpeedADelta;
    }
  }

  private gameTime = 60;
  // private timerbar: HTMLProgressElement | null = null;

  tickGameTimer() {
    this.gameTime -= 0.5;
    if (this.gameTime == 0) {
      // Game Over
      this.gameOver();
    }
  }

  setNewWord(): void {
    this.gameTime += 15;
    if (this.targetWord.fullWord.toLowerCase() == "hello") {
      this.targetWord = new WordSet("WORLD");
    }
    else {
      this.targetWord = new WordSet("HELLO");
    }
  }

  gameOver(): void {
    console.log('GAME OVER');
    this.stopTimers();
    (document.getElementById('ui') as HTMLDivElement).setAttribute('style', 'display: flex');
    (document.getElementById('score-panel') as HTMLDivElement).setAttribute('style', 'display: block');
    (document.getElementById('score-text') as HTMLHeadingElement).textContent = this.score.toString();
    (document.getElementById('play-button') as HTMLButtonElement).textContent = "REPLAY";
  }

  addScore(newPoints: number): any {
    this.score += newPoints;
    // if (this.scoreElement != null) {
    //   this.scoreElement.textContent = 'Score: ' + this.score;
    // }
  }

  private timeOffset = 0;
  spawnNewItem() {
    // console.log('new context = ', this);
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
      xOrigin = GameValueSet.scWidth;
    }
    else {
      direction = Direction.Forward;
      xOrigin = 0;
    }

    // inverted because upper is a smaller number than lower
    var yPosition = randomNumBetween(GameValueSet.fruitYTop, GameValueSet.fruitYBot);

    // create a new random item
    if (randomNumBetween(0, 5) == 1) {
      // spawn letter
      let letter = this.targetWord.getNewLetter();
      this.items.push(Item.createLetter(letter, direction, xOrigin, yPosition));
    }
    else {
      // spawn fruit
      this.items.push(Item.createItem(direction, xOrigin, yPosition))
    }

    // let newItem = 
    // var square = new Item(direction, yPosition, xOrigin, attributes, letter);
    // game.squares.push(square);

    // delete squares that are no longer visible
    this.items = this.items.filter(item => {
      return item.active;
    });

    // create a new offset
    this.timeOffset = randomNumBetween(0, 2);
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
(window as any)['game'] = new Game();