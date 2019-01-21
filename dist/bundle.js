(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Collision_1 = require("./Collision");
var DataStructures_1 = require("./DataStructures");
var GameValues_1 = require("./GameValues");
/** The animation/position states of an actor. */
var ActorState;
(function (ActorState) {
    ActorState[ActorState["descending"] = 0] = "descending";
    ActorState[ActorState["ascending"] = 1] = "ascending";
    ActorState[ActorState["jumping"] = 2] = "jumping";
    ActorState[ActorState["landing"] = 3] = "landing";
    ActorState[ActorState["resting"] = 4] = "resting";
    ActorState[ActorState["waiting"] = 5] = "waiting";
})(ActorState = exports.ActorState || (exports.ActorState = {}));
var Actor = /** @class */ (function () {
    function Actor(state, xLimit, sprite) {
        this.stunTicks = 0;
        this.state = state;
        this.xMin = xLimit.min;
        this.xMax = xLimit.max;
        this.dx = DataStructures_1.Direction.Stopped;
        this.dy = DataStructures_1.Direction.Stopped;
        this.sprite = sprite;
        // this.radius = 15;
        this.collisionBuffer = 10;
        // x = centre of character bounds
        this.x = ((this.xMax - this.xMin) / 2) + this.xMin;
        // set the initial Y position based on the character state
        if (this.state === ActorState.resting) {
            this.y = GameValues_1.GameValues.branchY;
        }
        else {
            this.y = GameValues_1.GameValues.seesawLogY;
        }
    }
    Object.defineProperty(Actor.prototype, "isStunned", {
        get: function () { return this.stunTicks > 0; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Actor.prototype, "collisionModel", {
        get: function () {
            var widthDiff = (this.sprite.width / 2);
            var heightDiff = (this.sprite.height / 2);
            // x and y are centred values
            // offset x and y by negatives
            var x1 = this.x - (widthDiff + this.collisionBuffer);
            var y1 = this.y - (heightDiff + this.collisionBuffer);
            var x2 = this.x + widthDiff + this.collisionBuffer;
            var y2 = this.y + heightDiff + this.collisionBuffer;
            // (game.context as CanvasRenderingContext2D).fillRect(x1, y1, x2-x1, y2-y1);
            return new Collision_1.CollisionModel(y1, x2, y2, x1);
        },
        enumerable: true,
        configurable: true
    });
    Actor.prototype.applyStun = function () {
        this.stunTicks = 600;
    };
    // private yLerp: number = 30;
    // private getYLerpSpeed(): number {
    //   return 0;
    // }
    Actor.prototype.moveX = function (leftKeyDown, rightKeyDown) {
        // hit the left or right edge?
        // stop movement (and don't update)
        // Because dx is just direction, movement combines speed with this.
        // Therefore all edge checks must require the speed (otherwise the actor
        // goes past the edge and is permanently stuck
        var xPosition = this.x + (this.dx * GameValues_1.GameValues.xSpeed);
        if (xPosition + this.sprite.width / 2 >= this.xMax || // check R against R edge
            xPosition - this.sprite.width / 2 <= this.xMin) { // check L against L edge
            this.dx = DataStructures_1.Direction.Stopped;
        }
        else if (leftKeyDown || rightKeyDown) {
            // need to clamp this within game bounds
            var newPosition = this.x + (GameValues_1.GameValues.xSpeed * this.dx);
            if (newPosition < this.xMin) {
                this.x = this.xMin;
            }
            else if (newPosition > this.xMax) {
                this.x = this.xMax;
            }
            else {
                this.x += GameValues_1.GameValues.xSpeed * this.dx;
            }
        }
    };
    Actor.prototype.moveY = function () {
        // Because dy is just direction (-1,0,1), movement combines speed with this.
        // Therefore all edge checks must require the speed (otherwise the actor
        // goes past the edge and is permanently stuck
        var yPosition = this.y + (this.dy * GameValues_1.GameValues.ySpeed);
        if (yPosition < GameValues_1.GameValues.branchY) {
            // actor has reached the vertical height limit
            this.dy = DataStructures_1.Direction.Stopped;
            this.state = ActorState.resting;
        }
        else if (yPosition > GameValues_1.GameValues.seesawLogY) {
            // actor has reached the lower height limit
            this.dy = DataStructures_1.Direction.Stopped;
            this.state = ActorState.landing;
        }
        else {
            // move vertically
            // if lerp frames, then lerp
            this.y += GameValues_1.GameValues.ySpeed * this.dy;
        }
    };
    Actor.prototype.draw = function (context) {
        var px = this.x - this.sprite.width / 2;
        var py = this.y - this.sprite.height / 2;
        if (this.isStunned) {
            this.stunTicks--;
            context.fillStyle = "#FFFF00";
            context.fillRect(px, py, this.sprite.width, this.sprite.height);
        }
        context.drawImage(this.sprite, px, py, this.sprite.width, this.sprite.height);
    };
    return Actor;
}());
exports.Actor = Actor;

},{"./Collision":2,"./DataStructures":3,"./GameValues":5}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CollisionModel = /** @class */ (function () {
    function CollisionModel(top, right, bottom, left) {
        this.top = top;
        this.right = right;
        this.bottom = bottom;
        this.left = left;
    }
    CollisionModel.prototype.collidesWith = function (model) {
        return (this.left <= model.right && this.right >= model.left &&
            this.top <= model.bottom && this.bottom >= model.top);
    };
    return CollisionModel;
}());
exports.CollisionModel = CollisionModel;

},{}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Direction;
(function (Direction) {
    Direction[Direction["Forward"] = 1] = "Forward";
    Direction[Direction["Stopped"] = 0] = "Stopped";
    Direction[Direction["Reverse"] = -1] = "Reverse";
})(Direction = exports.Direction || (exports.Direction = {}));
var Bounds = /** @class */ (function () {
    function Bounds(height, width) {
        this.height = height;
        this.width = width;
    }
    return Bounds;
}());
exports.Bounds = Bounds;
var NumberRange = /** @class */ (function () {
    function NumberRange(min, max) {
        this.min = min;
        this.max = max;
    }
    return NumberRange;
}());
exports.NumberRange = NumberRange;
function randomNumBetween(lower, upper) {
    return Math.floor(Math.random() * (upper - lower + 1) + lower);
}
exports.randomNumBetween = randomNumBetween;
// using generics so it's flexible
var KeyValuePair = /** @class */ (function () {
    function KeyValuePair(key, value) {
        this.key = key;
        this.value = value;
    }
    return KeyValuePair;
}());
exports.KeyValuePair = KeyValuePair;
function degToRad(degrees) {
    return degrees * Math.PI / 180;
}
exports.degToRad = degToRad;

},{}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** Handles HTML element access and manipulation. */
var ElementManager = /** @class */ (function () {
    function ElementManager() {
    }
    /** Handle messy HTML element fetching. */
    ElementManager.getElement = function (resourceId) {
        var element = document.getElementById(resourceId);
        // at some point, handle error conditions
        return element;
    };
    return ElementManager;
}());
exports.ElementManager = ElementManager;

},{}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GameValues = /** @class */ (function () {
    function GameValues() {
    }
    Object.defineProperty(GameValues, "fruitYTop", {
        get: function () { return 140; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GameValues, "fruitYBot", {
        get: function () { return this.scHeight - 100; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GameValues, "centerX", {
        get: function () { return this.scWidth / 2; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GameValues, "centerY", {
        get: function () { return this.scHeight / 2; },
        enumerable: true,
        configurable: true
    });
    GameValues.Initialise = function (canvas) {
        this.scWidth = canvas.width;
        this.scHeight = canvas.height;
    };
    // window size
    GameValues.scWidth = 0;
    GameValues.scHeight = 0;
    // key positions for gameplay
    GameValues.branchY = 50;
    GameValues.seesawLogY = 540;
    // movement limiters
    GameValues.padEdge = 8;
    GameValues.padCentre = 60;
    // speeds
    GameValues.xSpeed = 4;
    GameValues.minYSpeed = 3.5;
    GameValues.maxYSpeed = 8.5;
    GameValues.ySpeed = 5;
    GameValues.ySpeedDelta = 0.06;
    GameValues.ySpeedADelta = 0.16;
    return GameValues;
}());
exports.GameValues = GameValues;

},{}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Collision_1 = require("./Collision");
var DataStructures_1 = require("./DataStructures");
var ElementManager_1 = require("./ElementManager");
var Resources_1 = require("./Resources");
var Item = /** @class */ (function () {
    function Item(direction, x, y, attributes) {
        this.letter = "";
        // private colour: string;
        this.image = ElementManager_1.ElementManager.getElement(Resources_1.Resources.NULL_IMAGE);
        // attributes: ItemAttributes, letter: string) {
        this.direction = direction;
        this.x = x;
        this.y = y;
        // this.height = 30;
        // this.width = 30;
        // 5 speeds between 3 and 6 (inclusive)
        this.speed = DataStructures_1.randomNumBetween(3, 6) / 2;
        this.active = true;
        this.collisionBuffer = 5;
        this._attributes = attributes;
        // temporary
        // this.colour = this._attributes.iconPath;
        if (this.attributes.iconPath[0] !== "#") {
            // read this as a path
            console.log("loading hazard");
            this.image = ElementManager_1.ElementManager.getElement(this.attributes.iconPath);
        }
    }
    Object.defineProperty(Item.prototype, "attributes", {
        get: function () {
            return this._attributes;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Item.prototype, "collisionModel", {
        /**
         * Returns the collision coordinate model at the current square's position.
         */
        get: function () {
            var widthDiff = (this.image.width / 2);
            var heightDiff = (this.image.height / 2);
            // x and y are centred values
            // offset x and y by negatives
            var x1 = this.x - (widthDiff + this.collisionBuffer);
            var y1 = this.y - (heightDiff + this.collisionBuffer);
            var x2 = this.x + widthDiff + this.collisionBuffer;
            var y2 = this.y + heightDiff + this.collisionBuffer;
            return new Collision_1.CollisionModel(y1, x2, y2, x1);
        },
        enumerable: true,
        configurable: true
    });
    Item.createItem = function (direction, x, y) {
        var attributes = ItemAttributes.createRandomAttributes();
        if (attributes.isHazard) {
        }
        var item = new Item(direction, x, y, attributes);
        return item;
    };
    Item.createLetter = function (letter, direction, x, y) {
        var attributes = ItemAttributes.createLetterAttributes();
        var item = new Item(direction, x, y, attributes);
        item.setLetter(letter);
        return item;
    };
    // setColour(newColour: string): void {
    //   // NOTE: because argb is a valid colour, the responsibility is on
    //   // the developer to provide a correct colour (it's static and not hard)
    //   // rather than the program assuming the correct colour format.
    //   // If the colour came from the user, it would be a different story.
    //   // this.colour = newColour;
    // }
    Item.prototype.moveX = function () {
        this.x += this.speed * this.direction;
    };
    Item.prototype.setLetter = function (letter) {
        this.letter = letter;
    };
    Item.prototype.checkCanvasWidthBounds = function (width) {
        // Include width in position calculation so the object does not
        // get disabled as soon as one side hits the screen bounds.
        // The object is only disabled when it is *entirely* outside the bounds.
        if (this.x + this.image.width < 0 ||
            this.x - this.image.width > width) {
            this.active = false;
        }
        // return the active state to save needing another if statement
        return this.active;
    };
    /**
     * Draws the square on the canvas context.
     * @param context The canvas context to draw on.
     */
    Item.prototype.draw = function (context) {
        // don't draw if it is disabled
        if (!this.active) {
            return;
        }
        if (this.attributes.isLetter) {
            context.font = "50px Coiny";
            // context.fillStyle = '#000';
            context.fillStyle = "#F9C22E";
            context.fillText(this.letter, this.x, this.y);
        }
        else {
            var widthDiff = (this.image.width / 2);
            var heightDiff = (this.image.height / 2);
            var x1 = this.x - widthDiff;
            var y1 = this.y - heightDiff;
            var x2 = this.x + widthDiff;
            var y2 = this.y + heightDiff;
            context.drawImage(this.image, x1, y1, x2 - x1, y2 - y1);
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
    };
    return Item;
}());
exports.Item = Item;
var ItemAttributes = /** @class */ (function () {
    function ItemAttributes(points, isHazard, iconPath, name, rarity, isLetter) {
        if (isLetter === void 0) { isLetter = false; }
        this.points = points;
        this.isHazard = isHazard;
        this.iconPath = iconPath;
        this.name = name;
        this.rarity = rarity;
        this.isLetter = isLetter;
    }
    ItemAttributes.createRandomAttributes = function () {
        var randNum = DataStructures_1.randomNumBetween(0, 90);
        // search most common first (saves on cycles because it returns earlier
        // when the most common is checked first)
        for (var i = 0; i < this.items.length; i++) {
            var item = this.items[i];
            if (randNum >= item.rarity) {
                return item;
            }
        }
        // if nothing found, return the error (resilience!)
        return this.items[0];
    };
    ItemAttributes.createLetterAttributes = function () {
        return new ItemAttributes(2, false, "#BC815F", "Letter", 16, true);
    };
    // These needed to be sorted by rarity with most common (highest) first
    ItemAttributes.items = [
        new ItemAttributes(1, false, "fruit1", "", 40),
        new ItemAttributes(0, true, "hazard", "Hazard", 22),
        new ItemAttributes(4, false, "fruit2", "", 13),
        // new ItemAttributes(0, false, 'fruit3', '', 7),
        new ItemAttributes(8, false, "fruit3", "", 5),
        new ItemAttributes(16, false, "fruit4", "", 1),
    ];
    return ItemAttributes;
}());

},{"./Collision":2,"./DataStructures":3,"./ElementManager":4,"./Resources":7}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Resources = /** @class */ (function () {
    function Resources() {
    }
    // seesaw components
    Resources.seesawLog = "seesaw-log";
    Resources.seesawRock = "seesaw-rock";
    // fruit items
    Resources.fruitA = "fruit1";
    Resources.fruitB = "fruit2";
    Resources.fruitC = "fruit3";
    Resources.fruitD = "fruit4";
    Resources.hazard = "hazard";
    // sloth actors
    Resources.slothA = "sloth-1";
    Resources.slothB = "sloth-2";
    // meta
    Resources.NULL_IMAGE = "null-image";
    return Resources;
}());
exports.Resources = Resources;

},{}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DataStructures_1 = require("./DataStructures");
var WordSet = /** @class */ (function () {
    /**
     * Initialise a new WordSet using any string word.
     * @param word
     */
    function WordSet(word) {
        this.wordArray = [];
        // Create an array for every character in the word
        for (var i = 0; i < word.length; i++) {
            var char = word[i];
            // each word starts as false. words are collected during the game
            this.wordArray.push(new DataStructures_1.KeyValuePair(char, false));
        }
        this.fullWord = word;
    }
    WordSet.prototype.addLetter = function (letter) {
        // set the value of this letter to true
        for (var i = 0; i < this.wordArray.length; i++) {
            var kvPair = this.wordArray[i];
            if (kvPair.key.toLowerCase() == letter.toLowerCase() && !kvPair.value) {
                // letter is not filled and matches
                kvPair.value = true;
                break;
            }
        }
        // if word doesn't match anything (such as when the word changes,
        // but the player collides with an old letter) do nothing.
    };
    Object.defineProperty(WordSet.prototype, "isWordComplete", {
        get: function () {
            // return false if any letter is unfinished
            var complete = true;
            for (var i = 0; i < this.wordArray.length; i++) {
                var kvPair = this.wordArray[i];
                if (!kvPair.value) {
                    // word found, just exit now
                    complete = false;
                    return complete;
                }
            }
            // if not returned, it means all letters are true, and therefore 
            // the word is complete
            return complete;
        },
        enumerable: true,
        configurable: true
    });
    WordSet.prototype.getNewLetter = function () {
        // find all letters whose value is false (not filled)
        var availableLetters = this.wordArray.filter(function (kvpair) {
            return !kvpair.value;
        });
        // js random in inclusive,inclusive (not inc,exc)
        var randomIndex = DataStructures_1.randomNumBetween(0, availableLetters.length - 1);
        return availableLetters[randomIndex].key;
    };
    return WordSet;
}());
exports.WordSet = WordSet;

},{"./DataStructures":3}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Actor_1 = require("./Actor");
var DataStructures_1 = require("./DataStructures");
var Item_1 = require("./Item");
var Resources_1 = require("./Resources");
var GameValues_1 = require("./GameValues");
var WordSet_1 = require("./WordSet");
var ElementManager_1 = require("./ElementManager");
var Game = /** @class */ (function () {
    function Game() {
        // private scoreElement: any;
        this.screenBounds = new DataStructures_1.Bounds(0, 0);
        this.leftKeyDown = false;
        this.rightKeyDown = false;
        this.gameStarted = false;
        this.targetWord = new WordSet_1.WordSet("HELLO");
        this.items = [];
        this.sprites = {};
        this.activeActorNum = 0;
        this.drawTimer = 0;
        this.squareTimer = 0;
        this.gameTimer = 0;
        this.score = 0;
        // Use this list and index method. Can't assign an activeActor pointer
        // in javascript, so instead the activeActor is done through a list index.
        // When the actor changes, the index changes. Avoids all reference/assignment
        // problems using the objects and object references.
        this.actors = [];
        this.gameTime = 60;
        this.timeOffset = 0;
        // subscribe to key events early
        document.onkeydown = this.keyDown.bind(this);
        document.onkeyup = this.keyReleased.bind(this);
    }
    Game.prototype.initialise = function (canvasId) {
        // if restarting game
        this.stopTimers();
        this.actors = [];
        this.items = [];
        this.canvas = ElementManager_1.ElementManager.getElement(canvasId);
        this.context = this.canvas.getContext("2d");
        this.loadSprites();
        GameValues_1.GameValues.Initialise(this.canvas); // fullHeight = this.canvas.height;
        // this.pos.fullWidth = this.canvas.width;
        var boundsLeft = new DataStructures_1.NumberRange(GameValues_1.GameValues.padEdge, GameValues_1.GameValues.scWidth / 2 - GameValues_1.GameValues.padCentre);
        var boundsRight = new DataStructures_1.NumberRange(GameValues_1.GameValues.scWidth / 2 + GameValues_1.GameValues.padCentre, GameValues_1.GameValues.scWidth - GameValues_1.GameValues.padEdge);
        var leftActor = new Actor_1.Actor(Actor_1.ActorState.resting, boundsLeft, this.sprites["sloth-1"]);
        var rightActor = new Actor_1.Actor(Actor_1.ActorState.waiting, boundsRight, this.sprites["sloth-2"]);
        this.actors = [leftActor, rightActor];
        this.activeActorNum = 0;
        this.targetWord = new WordSet_1.WordSet("HELLO");
        this.gameTime = 60;
        this.score = 0;
        this.leftKeyDown = false;
        this.rightKeyDown = false;
        this.gameStarted = true;
        this.startTimers();
    };
    Game.prototype.startTimers = function () {
        var framerate = 10; // 10
        this.drawTimer = setInterval(this.draw.bind(this), framerate);
        this.squareTimer = setInterval(this.spawnNewItem.bind(this), 500);
        this.gameTimer = setInterval(this.tickGameTimer.bind(this), 500);
    };
    Game.prototype.getActiveActor = function () {
        return this.actors[this.activeActorNum];
    };
    Game.prototype.stopTimers = function () {
        window.clearInterval(this.drawTimer);
        window.clearInterval(this.squareTimer);
        window.clearInterval(this.gameTimer);
    };
    Game.prototype.draw = function () {
        var _this = this;
        // THIS DRAW METHOD RUNS INSIDE WINDOW CONTEXT
        // 'this' REFERS TO 'window', NOT THE GAME CLASS
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
                if (sq.active && !_this.getActiveActor().isStunned) {
                    if (_this.getActiveActor().collisionModel.collidesWith(sq.collisionModel)) {
                        // todo play animation and sound here?
                        // sq.setColour("#00FF00");
                        sq.active = false;
                        _this.addScore(sq.attributes.points);
                        if (sq.attributes.isLetter) {
                            _this.targetWord.addLetter(sq.letter);
                            if (_this.targetWord.isWordComplete) {
                                // new word, time boost
                                _this.setNewWord();
                            }
                        }
                        else if (sq.attributes.isHazard) {
                            _this.getActiveActor().applyStun();
                        }
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
            var prevDx = this.getActiveActor().dx;
            // swap characters when one reaches the bottom (seesaw)
            this.switchActor();
            // launch the new actor upwards
            this.getActiveActor().state = Actor_1.ActorState.ascending;
            GameValues_1.GameValues.ySpeed = GameValues_1.GameValues.maxYSpeed;
            this.getActiveActor().dy = DataStructures_1.Direction.Reverse;
            // add the current movement to the new actor (makes transition fluid)
            this.getActiveActor().dx = prevDx;
        }
        if (this.getActiveActor().state === Actor_1.ActorState.ascending &&
            GameValues_1.GameValues.ySpeed > GameValues_1.GameValues.minYSpeed) {
            // console.log('DECELERATING');
            GameValues_1.GameValues.ySpeed -= GameValues_1.GameValues.ySpeedDelta;
        }
        else if (this.getActiveActor().state === Actor_1.ActorState.descending &&
            GameValues_1.GameValues.ySpeed < GameValues_1.GameValues.maxYSpeed) {
            // console.log('ACCELERATING');
            GameValues_1.GameValues.ySpeed += GameValues_1.GameValues.ySpeedADelta;
        }
    };
    // private timerbar: HTMLProgressElement | null = null;
    Game.prototype.tickGameTimer = function () {
        this.gameTime -= 0.5;
        if (this.gameTime === 0) {
            // Game Over
            this.gameOver();
        }
    };
    Game.prototype.setNewWord = function () {
        this.gameTime += 15;
        if (this.targetWord.fullWord.toLowerCase() === "hello") {
            this.targetWord = new WordSet_1.WordSet("WORLD");
        }
        else {
            this.targetWord = new WordSet_1.WordSet("HELLO");
        }
    };
    Game.prototype.gameOver = function () {
        // console.log("GAME OVER");
        this.stopTimers();
        ElementManager_1.ElementManager.getElement("ui").setAttribute("style", "display: flex");
        ElementManager_1.ElementManager.getElement("score-panel").setAttribute("style", "display: block");
        ElementManager_1.ElementManager.getElement("score-text").textContent = this.score.toString();
        ElementManager_1.ElementManager.getElement("play-button").textContent = "REPLAY";
    };
    Game.prototype.addScore = function (newPoints) {
        this.score += newPoints;
        // if (this.scoreElement != null) {
        //   this.scoreElement.textContent = 'Score: ' + this.score;
        // }
    };
    Game.prototype.spawnNewItem = function () {
        // console.log('new context = ', this);
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
            xOrigin = GameValues_1.GameValues.scWidth;
        }
        else {
            direction = DataStructures_1.Direction.Forward;
            xOrigin = 0;
        }
        // inverted because upper is a smaller number than lower
        var yPosition = DataStructures_1.randomNumBetween(GameValues_1.GameValues.fruitYTop, GameValues_1.GameValues.fruitYBot);
        // create a new random item
        if (DataStructures_1.randomNumBetween(0, 5) === 1) {
            // spawn letter
            var letter = this.targetWord.getNewLetter();
            this.items.push(Item_1.Item.createLetter(letter, direction, xOrigin, yPosition));
        }
        else {
            // spawn fruit
            this.items.push(Item_1.Item.createItem(direction, xOrigin, yPosition));
        }
        // let newItem =
        // var square = new Item(direction, yPosition, xOrigin, attributes, letter);
        // game.squares.push(square);
        // delete squares that are no longer visible
        this.items = this.items.filter(function (item) {
            return item.active;
        });
        // create a new offset
        this.timeOffset = DataStructures_1.randomNumBetween(0, 2);
    };
    Game.prototype.switchActor = function () {
        this.getActiveActor().dx = DataStructures_1.Direction.Stopped;
        if (this.activeActorNum === 0) {
            this.activeActorNum = 1;
        }
        else {
            this.activeActorNum = 0;
        }
    };
    Game.prototype.drawActors = function () {
        var _this = this;
        // this is its own function because actors is private and the 'draw' method
        // is run from the window context
        this.actors.forEach(function (actor) {
            actor.draw(_this.context);
        });
    };
    Game.prototype.drawTime = function () {
        this.context.font = "20px Coiny";
        this.context.fillStyle = "#3A3D3B";
        var maxWidth = 100;
        var timePercentage = this.gameTime / 60;
        this.context.fillRect(200, 60, maxWidth + 8, 16);
        this.context.fillStyle = "#F9C22E";
        this.context.fillRect(204, 64, maxWidth * timePercentage, 8);
        // this.context.fillText(this.gameTime, 220, 50);
    };
    Game.prototype.drawScore = function () {
        this.context.font = "64px Coiny";
        this.context.fillStyle = "#3A3D3B";
        this.context.fillStyle = "#F9C22E";
        var position = 232;
        if (this.score > 99) {
            position -= 32;
        }
        else if (this.score > 9) {
            position -= 16;
        }
        this.context.fillText(this.score, position, 48);
    };
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
        // this.context.fillStyle = "#000";
        this.context.fillStyle = "#3A3D3B";
        this.context.fillStyle = "#F9C22E";
        this.context.fillText(text, 188, 112);
    };
    /** Draw the Rock of the seesaw to the screen. */
    Game.prototype.drawSeesawRock = function () {
        var rockX = GameValues_1.GameValues.scWidth / 2 - this.sprites[Resources_1.Resources.seesawRock].width / 2;
        var rockY = GameValues_1.GameValues.scHeight - this.sprites[Resources_1.Resources.seesawRock].height + 3;
        this.drawSpriteXY(this.context, Resources_1.Resources.seesawRock, rockX, rockY);
    };
    /** Draw the Log of the seesaw to the screen at the correct rotation. */
    Game.prototype.drawSeesawLog = function () {
        // translate to the centre in order to correctly rotate
        var xTranslation = GameValues_1.GameValues.centerX - this.sprites[Resources_1.Resources.seesawLog].width;
        var yTranslation = GameValues_1.GameValues.seesawLogY - this.sprites[Resources_1.Resources.seesawLog].height;
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
        this.drawSpriteXY(this.context, "seesaw-log", GameValues_1.GameValues.centerX, 540, true);
        // reset the rotation
        this.context.setTransform(1, 0, 0, 1, 0, 0);
    };
    Game.prototype.drawSpriteXY = function (context, imageName, x, y, centerX, centerY) {
        if (centerX === void 0) { centerX = false; }
        if (centerY === void 0) { centerY = false; }
        var width = this.sprites[imageName].width;
        var height = this.sprites[imageName].height;
        // If centerX or centerY, then the origin coordinate is (0.5,0.5), not (0,0)
        var px = x;
        if (centerX) {
            px = x - (width / 2);
        }
        var py = y;
        if (centerY) {
            px = x - (width / 2);
        }
        context.drawImage(this.sprites[imageName], px, py, width, height);
    };
    // private drawSpriteFixed(context: CanvasRenderingContext2D, imageName: string, fixedPos: [number, number]) {
    //   const width = this.sprites[imageName].width;
    //   const height = this.sprites[imageName].height;
    //   // If centerX or centerY, then the origin coordinate is (0.5,0.5), not (0,0)
    //   const px = GameValues.scWidth * fixedPos[0] - (width / 2);
    //   let py = GameValues.scHeight * fixedPos[1] - (height / 2);
    //   // correct in corners
    //   // todo: improve this and make it apply for everything
    //   if (fixedPos[1] === 1) {
    //     py -= height / 2;
    //   }
    //   context.drawImage(this.sprites[imageName], px, py, width, height);
    // }
    Game.prototype.loadSprites = function () {
        this.sprites["seesaw-log"] = ElementManager_1.ElementManager.getElement("seesaw-log");
        this.sprites["seesaw-rock"] = ElementManager_1.ElementManager.getElement("seesaw-rock");
        this.sprites["sloth-1"] = ElementManager_1.ElementManager.getElement("sloth-1");
        this.sprites["sloth-2"] = ElementManager_1.ElementManager.getElement("sloth-2");
    };
    Game.prototype.keyDown = function (e) {
        e = e || window.event;
        if (!this.gameStarted && e.keyCode === 32) {
            ElementManager_1.ElementManager.getElement("ui").setAttribute("style", "display: none");
            window.game.initialise("game-canvas");
            return;
        }
        if (e.keyCode === 32 && this.getActiveActor().state === Actor_1.ActorState.resting) {
            // space bar, start descent
            this.getActiveActor().state = Actor_1.ActorState.descending;
            this.getActiveActor().dy = DataStructures_1.Direction.Forward;
            GameValues_1.GameValues.ySpeed = GameValues_1.GameValues.minYSpeed;
        }
        // if game started, just exit to avoid calling uninitialised objects
        if (!this.gameStarted) {
            return;
        }
        if (e.keyCode === 37) {
            // left arrow
            this.getActiveActor().dx = DataStructures_1.Direction.Reverse;
            this.leftKeyDown = true;
        }
        else if (e.keyCode === 39) {
            // right arrow
            this.getActiveActor().dx = DataStructures_1.Direction.Forward;
            this.rightKeyDown = true;
        }
    };
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
                this.getActiveActor().dx = DataStructures_1.Direction.Forward;
            }
            else {
                this.getActiveActor().dx = DataStructures_1.Direction.Stopped;
            }
        }
        else if (e.keyCode === 39) {
            // right arrow
            this.rightKeyDown = false;
            if (this.leftKeyDown === true) {
                // go back to this direction instead
                // L held, R held, R released (but L still held)
                this.getActiveActor().dx = DataStructures_1.Direction.Reverse;
            }
            else {
                this.getActiveActor().dx = DataStructures_1.Direction.Stopped;
            }
        }
    };
    return Game;
}());
exports.Game = Game;
// although render origin is top left, it is more consistent with the *user* that
// bottom is the bottom, even though the bottom Y is higher than the upper Y
window.game = new Game();

},{"./Actor":1,"./DataStructures":3,"./ElementManager":4,"./GameValues":5,"./Item":6,"./Resources":7,"./WordSet":8}]},{},[9]);
