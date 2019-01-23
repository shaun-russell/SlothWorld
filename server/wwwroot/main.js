"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Actor_1 = require("./Actor");
var Colours_1 = require("./Colours");
var DataStructures_1 = require("./DataStructures");
var ElementManager_1 = require("./ElementManager");
var GameValues_1 = require("./GameValues");
var Item_1 = require("./Item");
var Resources_1 = require("./Resources");
var WordSet_1 = require("./WordSet");
/** The main game that manages and runs everything. */
var Game = /** @class */ (function () {
    /** Sets up basic keyboard events. */
    function Game() {
        this.leftKeyDown = false;
        this.rightKeyDown = false;
        this.gameStarted = false;
        this.score = 0;
        this.targetWord = new WordSet_1.WordSet(GameValues_1.GameValues.word1);
        this.items = [];
        this.sprites = {};
        this.timeOffset = 0;
        this.drawTimer = 0;
        this.squareTimer = 0;
        this.gameTimer = 0;
        // Use this list and index method. Can't assign an activeActor pointer
        // in javascript, so instead the activeActor is done through a list index.
        // When the actor changes, the index changes. Avoids all reference/assignment
        // problems using the objects and object references.
        this.activeActorNum = 0;
        this.actors = [];
        this.gameTime = GameValues_1.GameValues.gameTimeLength;
        // subscribe to key events early. This allows keyboard listening in the menu
        // (before the game loop has started)
        document.onkeydown = this.keyDown.bind(this);
        document.onkeyup = this.keyReleased.bind(this);
    }
    /**
     * Initialises the game once the play button has been pressed.
     * Allows easy reinitialisation for replaying the game.
     * @param canvasId Use the canvas to build the context and get dimensions
     */
    Game.prototype.initialise = function (canvasId) {
        // if restarting game
        this.stopTimers();
        this.actors = [];
        this.items = [];
        this.canvas = ElementManager_1.ElementManager.getElement(canvasId);
        this.context = this.canvas.getContext("2d");
        this.loadSprites();
        GameValues_1.GameValues.Initialise(this.canvas);
        var boundsLeft = new DataStructures_1.NumberRange(GameValues_1.GameValues.padEdge, GameValues_1.GameValues.scWidth / 2 - GameValues_1.GameValues.padCentre);
        var boundsRight = new DataStructures_1.NumberRange(GameValues_1.GameValues.scWidth / 2 + GameValues_1.GameValues.padCentre, GameValues_1.GameValues.scWidth - GameValues_1.GameValues.padEdge);
        var leftActor = new Actor_1.Actor(Actor_1.ActorState.resting, boundsLeft, this.sprites[Resources_1.Resources.slothA]);
        var rightActor = new Actor_1.Actor(Actor_1.ActorState.waiting, boundsRight, this.sprites[Resources_1.Resources.slothB]);
        this.actors = [leftActor, rightActor];
        this.activeActorNum = 0;
        this.targetWord = new WordSet_1.WordSet("HELLO");
        this.gameTime = GameValues_1.GameValues.gameTimeLength;
        this.score = 0;
        this.leftKeyDown = false;
        this.rightKeyDown = false;
        this.gameStarted = true;
        this.startTimers();
    };
    /** Runs all draw, spawn, score timers. */
    Game.prototype.startTimers = function () {
        this.drawTimer = setInterval(this.draw.bind(this), GameValues_1.GameValues.fps);
        this.squareTimer = setInterval(this.spawnNewItem.bind(this), 500);
        this.gameTimer = setInterval(this.tickGameTimer.bind(this), 500);
    };
    /** Returns the current active sloth actor. */
    Game.prototype.getActiveActor = function () {
        return this.actors[this.activeActorNum];
    };
    /** Kills all timers. */
    Game.prototype.stopTimers = function () {
        window.clearInterval(this.drawTimer);
        window.clearInterval(this.squareTimer);
        window.clearInterval(this.gameTimer);
    };
    /** The main draw loop for the game. */
    Game.prototype.draw = function () {
        var _this = this;
        this.context.clearRect(0, 0, GameValues_1.GameValues.scWidth, GameValues_1.GameValues.scHeight);
        this.drawTime();
        this.drawScore();
        this.drawWords();
        // move horizontally
        this.getActiveActor().moveX(this.leftKeyDown, this.rightKeyDown);
        this.getActiveActor().moveY();
        // update squares
        this.items.forEach(function (sq) {
            if (sq.active) {
                sq.checkCanvasWidthBounds(GameValues_1.GameValues.scWidth);
                // check collision
                if (sq.active && !_this.getActiveActor().isStunned &&
                    _this.getActiveActor().collisionModel.collidesWith(sq.collisionModel)) {
                    // todo play animation and sound here?
                    sq.active = false;
                    _this.addScore(sq.attributes.points);
                    if (sq.attributes.isLetter) {
                        // small time boost for fun purposes
                        _this.targetWord.activateLetter(sq.letter);
                        if (_this.targetWord.isWordComplete) {
                            // new word, time boost
                            _this.setNewWord();
                        }
                    }
                    else if (sq.attributes.isHazard) {
                        _this.getActiveActor().applyStun();
                    }
                }
                // update square
                sq.moveX();
                sq.draw(_this.context);
            }
        });
        this.drawSeesawRock();
        this.drawSeesawLog();
        // update character position
        this.drawActors();
        if (this.getActiveActor().state === Actor_1.ActorState.landing) {
            // save the current movement so we can pass it to the next actor
            var prevDx = this.getActiveActor().xDirection;
            // swap characters when one reaches the bottom (seesaw)
            this.switchActor();
            // launch the new actor upwards
            this.getActiveActor().state = Actor_1.ActorState.ascending;
            GameValues_1.GameValues.ySpeed = GameValues_1.GameValues.launchYSpeed;
            this.getActiveActor().yDirection = DataStructures_1.Direction.Reverse;
            // add the current movement to the new actor (makes transition fluid)
            this.getActiveActor().xDirection = prevDx;
        }
        if (this.getActiveActor().state === Actor_1.ActorState.ascending &&
            GameValues_1.GameValues.ySpeed > GameValues_1.GameValues.minYSpeed) {
            GameValues_1.GameValues.ySpeed -= GameValues_1.GameValues.yDeceleration;
        }
        else if (this.getActiveActor().state === Actor_1.ActorState.descending &&
            GameValues_1.GameValues.ySpeed < GameValues_1.GameValues.maxYSpeed) {
            GameValues_1.GameValues.ySpeed += GameValues_1.GameValues.yAcceleration;
        }
    };
    /** Update the game timer, ending the game if the timer runs out. */
    Game.prototype.tickGameTimer = function () {
        if (this.gameTime < 0) {
            // Game Over
            this.endGame();
        }
        this.gameTime -= GameValues_1.GameValues.timeTick;
    };
    /** Creates a new world, adds time, alternating between Hello and World */
    Game.prototype.setNewWord = function () {
        this.gameTime += GameValues_1.GameValues.bigTimeBonus;
        if (this.targetWord.word === GameValues_1.GameValues.word1) {
            this.targetWord = new WordSet_1.WordSet(GameValues_1.GameValues.word2);
        }
        else {
            this.targetWord = new WordSet_1.WordSet(GameValues_1.GameValues.word1);
        }
    };
    /** Ends the game and updates the UI for replay and score presentation. */
    Game.prototype.endGame = function () {
        this.stopTimers();
        var flex = "display: flex";
        var gameOverMessage = "Game over!";
        ElementManager_1.ElementManager.getElement(Resources_1.Resources.uiContainer).setAttribute("style", flex);
        ElementManager_1.ElementManager.getElement(Resources_1.Resources.uiScorePanel).setAttribute("style", flex);
        ElementManager_1.ElementManager.getElement(Resources_1.Resources.uiScoreText).textContent = this.score.toString();
        ElementManager_1.ElementManager.getElement(Resources_1.Resources.uiTitle).textContent = gameOverMessage;
        ElementManager_1.ElementManager.getElement(Resources_1.Resources.uiPlayButton).textContent = "REPLAY";
    };
    /**
     * Add to the player's score.
     * @param newPoints The points to add.
     */
    Game.prototype.addScore = function (newPoints) {
        this.score += newPoints;
    };
    /** Spawns a new item (hazard, fruit, letter) */
    Game.prototype.spawnNewItem = function () {
        // if there's a delay, skip this function
        if (this.timeOffset > 0) {
            this.timeOffset--;
            return;
        }
        // spawn a square
        var direction = DataStructures_1.randomNumBetween(0, 1);
        var xOrigin = 0;
        if (direction === DataStructures_1.Direction.Stopped) {
            direction = DataStructures_1.Direction.Reverse;
            xOrigin = GameValues_1.GameValues.scWidth + 50;
        }
        else {
            direction = DataStructures_1.Direction.Forward;
            xOrigin = -50;
        }
        // inverted because upper is a smaller number than lower
        var yPosition = DataStructures_1.randomNumBetween(GameValues_1.GameValues.fruitYTop, GameValues_1.GameValues.fruitYBot);
        // create a new random item
        if (DataStructures_1.randomNumBetween(0, 5) === 1) {
            // spawn letter
            var letter = this.targetWord.getUnactivatedLetter();
            this.items.push(Item_1.Item.createLetter(letter, direction, xOrigin, yPosition));
        }
        else {
            // spawn fruit
            this.items.push(Item_1.Item.createFruit(direction, xOrigin, yPosition));
        }
        // delete squares that are no longer visible
        this.items = this.items.filter(function (item) {
            return item.active;
        });
        // create a new offset
        this.timeOffset = DataStructures_1.randomNumBetween(0, 2);
    };
    /** Switches the active sloth to the other sloth. */
    Game.prototype.switchActor = function () {
        this.getActiveActor().xDirection = DataStructures_1.Direction.Stopped;
        if (this.activeActorNum === 0) {
            this.activeActorNum = 1;
        }
        else {
            this.activeActorNum = 0;
        }
    };
    /** Draws the playable sloth actors. */
    Game.prototype.drawActors = function () {
        var _this = this;
        // this is its own function because actors is private and the 'draw' method
        // is run from the window context
        this.actors.forEach(function (actor) {
            actor.draw(_this.context);
        });
    };
    /** Draws the timer progress bar on the screen. */
    Game.prototype.drawTime = function () {
        // These pixel positions don't affect the gameplay.
        // Since they are static and there are many, they aren't 'bad' magic numbers.
        this.context.font = "20px Coiny";
        this.context.fillStyle = Colours_1.Colours.DARK_GREY;
        var maxWidth = 100;
        this.context.fillRect(200, 60, maxWidth + 8, 16);
        this.context.fillStyle = Colours_1.Colours.THEME;
        var drawableTime = this.gameTime;
        if (this.gameTime < 0) {
            drawableTime = 0;
        }
        var timePercentage = drawableTime / GameValues_1.GameValues.gameTimeLength;
        this.context.fillRect(204, 64, maxWidth * timePercentage, 8);
    };
    /** Draws the score number on the screen. */
    Game.prototype.drawScore = function () {
        this.context.font = "64px Coiny";
        this.context.fillStyle = Colours_1.Colours.DARK_GREY;
        this.context.fillStyle = Colours_1.Colours.THEME;
        var position = 232;
        // adjust draw position depending on number of characters
        // makes the numbers look more centred
        if (this.score > 99) {
            position -= 32;
        }
        else if (this.score > 9) {
            position -= 16;
        }
        this.context.fillText(this.score, position, 48);
    };
    /** Draws the wordset on the screen. */
    Game.prototype.drawWords = function () {
        var text = "";
        this.targetWord.wordArray.forEach(function (kv) {
            if (kv.value) {
                text += kv.key.toUpperCase();
            }
            else {
                text += "_";
            }
        });
        this.context.font = "40px Coiny";
        this.context.fillStyle = Colours_1.Colours.DARK_GREY;
        this.context.fillStyle = Colours_1.Colours.THEME;
        this.context.fillText(text, 188, 112);
    };
    /** Draw the Rock of the seesaw to the screen. */
    Game.prototype.drawSeesawRock = function () {
        var rockX = GameValues_1.GameValues.scWidth / 2 - this.sprites[Resources_1.Resources.seesawRock].width / 2;
        var rockY = GameValues_1.GameValues.scHeight - this.sprites[Resources_1.Resources.seesawRock].height + 3;
        this.drawSpriteXY(Resources_1.Resources.seesawRock, rockX, rockY);
    };
    /** Draw the Log of the seesaw to the screen at the correct rotation. */
    Game.prototype.drawSeesawLog = function () {
        // translate to the centre in order to correctly rotate
        var xTranslation = GameValues_1.GameValues.centerX;
        var yTranslation = GameValues_1.GameValues.seesawLogY;
        // rotate seesaw to direction of new active actor
        // rotation requires a transform to the centre
        this.context.translate(xTranslation, yTranslation);
        if (this.activeActorNum === 0) {
            this.context.rotate(DataStructures_1.degToRad(10));
        }
        else {
            this.context.rotate(DataStructures_1.degToRad(360 - 10));
        }
        // then translate back to the original position
        this.context.translate(-xTranslation, -yTranslation);
        this.drawSpriteXY("seesaw-log", GameValues_1.GameValues.centerX, 540, true);
        // reset the rotation
        this.context.setTransform(1, 0, 0, 1, 0, 0);
    };
    /**
     * Rendering helper function to manage drawing sprites with centred coordinates.
     * @param imageName The sprite name.
     * @param x The x drawing coordinate.
     * @param y The y drawing coordinate.
     * @param centerX Draws in the middle of the screen if true.
     */
    Game.prototype.drawSpriteXY = function (imageName, x, y, centerX) {
        if (centerX === void 0) { centerX = false; }
        var width = this.sprites[imageName].width;
        var height = this.sprites[imageName].height;
        // If centerX or centerY, then the origin coordinate is (0.5,0.5), not (0,0)
        var px = x;
        if (centerX) {
            px = x - (width / 2);
        }
        this.context.drawImage(this.sprites[imageName], px, y, width, height);
    };
    /** Loads the sprites from HTML img elements */
    Game.prototype.loadSprites = function () {
        this.sprites[Resources_1.Resources.seesawLog] = ElementManager_1.ElementManager.getElement(Resources_1.Resources.seesawLog);
        this.sprites[Resources_1.Resources.seesawRock] = ElementManager_1.ElementManager.getElement(Resources_1.Resources.seesawRock);
        this.sprites[Resources_1.Resources.slothA] = ElementManager_1.ElementManager.getElement(Resources_1.Resources.slothA);
        this.sprites[Resources_1.Resources.slothB] = ElementManager_1.ElementManager.getElement(Resources_1.Resources.slothB);
    };
    /**
     * Key down handler
     * @param e The key that is pressed.
     */
    Game.prototype.keyDown = function (e) {
        e = e || window.event;
        if (!this.gameStarted && e.keyCode === 32) {
            ElementManager_1.ElementManager.getElement("ui").setAttribute("style", "display: none");
            ElementManager_1.ElementManager.getElement('fruit-display').setAttribute('style', 'display: none');
            window.game.initialise("game-canvas");
            return;
        }
        if (e.keyCode === 32 && this.getActiveActor().state === Actor_1.ActorState.resting) {
            // space bar, start descent
            this.getActiveActor().state = Actor_1.ActorState.descending;
            this.getActiveActor().yDirection = DataStructures_1.Direction.Forward;
            GameValues_1.GameValues.ySpeed = GameValues_1.GameValues.minYSpeed;
        }
        // if game started, just exit to avoid calling uninitialised objects
        if (!this.gameStarted) {
            return;
        }
        if (e.keyCode === 37) {
            // left arrow
            this.getActiveActor().xDirection = DataStructures_1.Direction.Reverse;
            this.leftKeyDown = true;
        }
        else if (e.keyCode === 39) {
            // right arrow
            this.getActiveActor().xDirection = DataStructures_1.Direction.Forward;
            this.rightKeyDown = true;
        }
    };
    /**
     * Key released handler
     * @param e The key that is released.
     */
    Game.prototype.keyReleased = function (e) {
        if (!this.gameStarted) {
            return;
        }
        // the reason to not just set dx to 0 is because a player can hold both
        // arrow keys down at the same time. Holding LEFT, then holding RIGHT before
        // releasing LEFT shouldn't stop the RIGHT movement. If we just set it to 0,
        // it stops the current movement
        if (e.keyCode === 37) {
            // left arrow
            this.leftKeyDown = false;
            if (this.rightKeyDown === true) {
                // go back to this direction instead
                // R held, L held, L released (but R still held)
                this.getActiveActor().xDirection = DataStructures_1.Direction.Forward;
            }
            else {
                this.getActiveActor().xDirection = DataStructures_1.Direction.Stopped;
            }
        }
        else if (e.keyCode === 39) {
            // right arrow
            this.rightKeyDown = false;
            if (this.leftKeyDown === true) {
                // go back to this direction instead
                // L held, R held, R released (but L still held)
                this.getActiveActor().xDirection = DataStructures_1.Direction.Reverse;
            }
            else {
                this.getActiveActor().xDirection = DataStructures_1.Direction.Stopped;
            }
        }
    };
    return Game;
}());
exports.Game = Game;
// THIS INITIALISES EVERYTHING
window.game = new Game();
