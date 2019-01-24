(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Collision_1 = require("./Collision");
var Colours_1 = require("./Colours");
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
/** Represents a playable charater with movement. */
var Actor = /** @class */ (function () {
    /**
     * Construct a new Actor
     * @param state The starting state of this Actor
     * @param xMovementRange A NumberRange containing the minimum and maximum
     *                       horizontal bounds of the actor.
     * @param sprite
     */
    function Actor(state, xMovementRange, sprite) {
        this.stunTicks = 0;
        this.state = state;
        this.xMin = xMovementRange.min;
        this.xMax = xMovementRange.max;
        this.xDirection = DataStructures_1.Direction.Stopped;
        this.yDirection = DataStructures_1.Direction.Stopped;
        this.sprite = sprite;
        // this.radius = 15;
        this.collisionBuffer = 5;
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
    /** Adds a stun effect to the actor. */
    Actor.prototype.applyStun = function () {
        this.stunTicks = GameValues_1.GameValues.stunTicks;
    };
    /* NOTE on updating character movement and position checks
          Because dy is just direction (-1,0,1), movement combines speed with this.
          Therefore all edge checks must require the speed (otherwise the actor
          could go past the edge
      */
    /**
     * Update the actor's horizontal position depending on movement key values.
     * @param leftKeyDown Down state of the LEFT movement key
     * @param rightKeyDown Down state of the RIGHT movement key
     */
    Actor.prototype.moveX = function (leftKeyDown, rightKeyDown) {
        // Hit the left or right edge? Stop movement and don't update.
        var xPosition = this.x + (this.xDirection * GameValues_1.GameValues.xSpeed);
        if (xPosition + this.sprite.width / 2 >= this.xMax || // R against R edge
            xPosition - this.sprite.width / 2 <= this.xMin) { // L against L edge
            // Actor against edge, don't move it.
            this.xDirection = DataStructures_1.Direction.Stopped;
            return;
        }
        // Now check positions when a key is held down.
        if (leftKeyDown || rightKeyDown) {
            // need to clamp this within game bounds
            var newPosition = this.x + (GameValues_1.GameValues.xSpeed * this.xDirection);
            if (newPosition < this.xMin) {
                // set position to minimum
                this.x = this.xMin;
            }
            else if (newPosition > this.xMax) {
                // set position to maximum
                this.x = this.xMax;
            }
            else {
                // set position according to speed and direction
                this.x += GameValues_1.GameValues.xSpeed * this.xDirection;
            }
        }
    };
    /** Update actor's vertical position. */
    Actor.prototype.moveY = function () {
        var yPosition = this.y + (this.yDirection * GameValues_1.GameValues.ySpeed);
        if (yPosition < GameValues_1.GameValues.branchY) {
            // actor has reached the vertical height limit
            this.yDirection = DataStructures_1.Direction.Stopped;
            this.state = ActorState.resting;
            return;
        }
        else if (yPosition > GameValues_1.GameValues.seesawLogY) {
            // actor has reached the lower height limit
            // stop movement and prepare for actor switching
            this.yDirection = DataStructures_1.Direction.Stopped;
            this.state = ActorState.landing;
            return;
        }
        // move actor vertically
        this.y += GameValues_1.GameValues.ySpeed * this.yDirection;
    };
    Object.defineProperty(Actor.prototype, "isStunned", {
        /** Returns true if the sloth actor is stunned. */
        get: function () { return this.stunTicks > 0; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Actor.prototype, "collisionModel", {
        /** Returns the collision model for the actor (including buffer zone). */
        get: function () {
            var widthDiff = (this.sprite.width / 2);
            var heightDiff = (this.sprite.height / 2);
            // x and y point to the centre of the actor, therefore they need
            // to be offset to the top left and bot right for collision bounds
            var x1 = this.x - (widthDiff + this.collisionBuffer);
            var y1 = this.y - (heightDiff + this.collisionBuffer);
            var x2 = this.x + widthDiff + this.collisionBuffer;
            var y2 = this.y + heightDiff + this.collisionBuffer;
            return new Collision_1.CollisionModel(x1, y1, x2, y2);
        },
        enumerable: true,
        configurable: true
    });
    /** Render the current actor on the canvas context. */
    Actor.prototype.draw = function (context) {
        // get top left corner of sprite at current x,y position
        var px = this.x - this.sprite.width / 2;
        var py = this.y - this.sprite.height / 2;
        // Apply the stun effect
        if (this.isStunned) {
            this.stunTicks--;
            context.fillStyle = Colours_1.Colours.STUN_COLOUR;
            context.globalAlpha = 0.6;
            // have to translate before rotation. Use the centre origin coordinates
            var xTranslation = this.x;
            var yTranslation = this.y;
            context.translate(xTranslation, yTranslation);
            // set up the rotation amount
            var rotation = this.stunTicks * 5 % 360;
            context.rotate(DataStructures_1.degToRad(rotation));
            // reset the translation so we can draw the image in the correct place
            context.translate(-xTranslation, -yTranslation);
            context.drawImage(this.sprite, px, py, this.sprite.width, this.sprite.height);
            // reset context changes
            context.globalAlpha = 1;
            context.setTransform(1, 0, 0, 1, 0, 0);
        }
        else {
            context.drawImage(this.sprite, px, py, this.sprite.width, this.sprite.height);
        }
    };
    return Actor;
}());
exports.Actor = Actor;

},{"./Collision":2,"./Colours":3,"./DataStructures":4,"./GameValues":6}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** */
var CollisionModel = /** @class */ (function () {
    /**
     * Create a new collision model from edges.
     * @param x1 The left edge (x1)
     * @param y1 The top edge (y1)
     * @param x2 The right edge (x2)
     * @param y2 The bottom edge (y2)
     */
    function CollisionModel(x1, y1, x2, y2) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
    }
    /**
     * Returns true if this collision model collides with the provided model.
     * @param model The model to check for a collision with.
     */
    CollisionModel.prototype.collidesWith = function (model) {
        return (this.x1 <= model.x2 && this.x2 >= model.x1 &&
            this.y1 <= model.y2 && this.y2 >= model.y1);
    };
    return CollisionModel;
}());
exports.CollisionModel = CollisionModel;

},{}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** Colour Manager for storing colours in one common location. */
var Colours = /** @class */ (function () {
    function Colours() {
    }
    // monochrome
    Colours.BLACK = "#000000";
    Colours.DARK_GREY = "#3A3D3B";
    Colours.WHITE = "#FFFFFF";
    // theme colours
    Colours.THEME = "#F9C22E";
    Colours.COMPLEMENT = "#23ACB4";
    Colours.STUN_COLOUR = "#FFFF00"; // replace this with animated image
    return Colours;
}());
exports.Colours = Colours;

},{}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Direction;
(function (Direction) {
    Direction[Direction["Forward"] = 1] = "Forward";
    Direction[Direction["Stopped"] = 0] = "Stopped";
    Direction[Direction["Reverse"] = -1] = "Reverse";
})(Direction = exports.Direction || (exports.Direction = {}));
/** Stores a pair of numbers (min and max). */
var NumberRange = /** @class */ (function () {
    /**
     * Create a min/max pair.
     * @param min Minimum number.
     * @param max Maximum number.
     */
    function NumberRange(min, max) {
        this.min = min;
        this.max = max;
    }
    return NumberRange;
}());
exports.NumberRange = NumberRange;
/** Generic KeyValuepair with string keys */
var KeyValuePair = /** @class */ (function () {
    /**
     *
     * @param key
     * @param value
     */
    function KeyValuePair(key, value) {
        this.key = key;
        this.value = value;
    }
    return KeyValuePair;
}());
exports.KeyValuePair = KeyValuePair;
/**
 * Converts a value from degrees into radians.
 * @param degrees The value to convert
 */
function degToRad(degrees) {
    return degrees * Math.PI / 180;
}
exports.degToRad = degToRad;
/**
 * Create a random number between two numbers. Both are INCLUSIVE.
 * @param lower Inclusive lower bound.
 * @param upper Inclusive upper bound.
 */
function randomNumBetween(lower, upper) {
    return Math.floor(Math.random() * (upper - lower + 1) + lower);
}
exports.randomNumBetween = randomNumBetween;

},{}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
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
    /** Initialise the GameValues with the actual canvas so heights
     * can be correctly calculated.
     */
    GameValues.Initialise = function (canvas) {
        this.scWidth = canvas.width;
        this.scHeight = canvas.height;
    };
    GameValues.fps = 16;
    // window size
    GameValues.scWidth = 0;
    GameValues.scHeight = 0;
    // key positions for gameplay
    GameValues.branchY = 70;
    GameValues.seesawLogY = 540;
    // movement limiters
    GameValues.padEdge = 2;
    GameValues.padCentre = 75;
    // speeds
    GameValues.xSpeed = 4 * (16 / 10);
    GameValues.minYSpeed = 1.5 * (16 / 10);
    GameValues.launchYSpeed = 8.5 * (16 / 10);
    GameValues.maxYSpeed = 15.5 * (16 / 10);
    GameValues.ySpeed = 5 * (16 / 10);
    GameValues.yDeceleration = 0.07 * (16 / 10);
    GameValues.yAcceleration = 0.2 * (16 / 10);
    GameValues.itemMinSpeed = 8;
    GameValues.itemMaxSpeed = 14;
    // timing
    GameValues.stunTicks = 240; // * (16/10);
    GameValues.gameTimeLength = 40;
    GameValues.bigTimeBonus = 10;
    GameValues.timeTick = 0.5;
    // words
    GameValues.word1 = "HELLO";
    GameValues.word2 = "WORLD";
    return GameValues;
}());
exports.GameValues = GameValues;

},{}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Collision_1 = require("./Collision");
var Colours_1 = require("./Colours");
var DataStructures_1 = require("./DataStructures");
var ElementManager_1 = require("./ElementManager");
var ItemAttributes_1 = require("./ItemAttributes");
var Resources_1 = require("./Resources");
var GameValues_1 = require("./GameValues");
// Note on why I didn't use inheritance/interfaces.
// This could have been structured with Item as a base class
// and FruitItem and LetterItem as derived classes. However,
// while they are both Items when drawing on the canvas and detecting
// collision, their interactions are different. Since I'd be
// checking the type, there's a significant difference between them.
// At this scale, it would look a bit forced to make these separate classes.
/** Represents a fruit or a letter than the player must collect. */
var Item = /** @class */ (function () {
    /**
     * Construct a new Item instance (privately).
     * @param direction The direction of movement.
     * @param x The origin X coordinate.
     * @param y The origin Y coordinate.
     * @param attributes The ItemAttributes containing the stats of the item.
     */
    function Item(direction, x, y, attributes) {
        // Private constructor because the objects are built using the static
        // methods on this class. Want to keep the attributes under control.
        this.letter = "";
        this.splatTicks = 45;
        // private colour: string;
        this.image = ElementManager_1.ElementManager.getElement(Resources_1.Resources.NULL_IMAGE);
        this.flippedImage = null;
        this.direction = direction;
        this.x = x;
        this.y = y;
        // 5 speeds between 5 and 10 (inclusive)
        this.speed = DataStructures_1.randomNumBetween(GameValues_1.GameValues.itemMinSpeed, GameValues_1.GameValues.itemMaxSpeed) / 2;
        this.active = true;
        this.delete = false;
        this.collisionBuffer = 5;
        this.itemAttributes = attributes;
        this.image = ElementManager_1.ElementManager.getElement(this.attributes.iconPath);
        if (this.attributes.iconPathFlipped != '') {
            this.flippedImage = ElementManager_1.ElementManager.getElement(this.attributes.iconPathFlipped);
        }
        this.splat = ElementManager_1.ElementManager.getElement(Resources_1.Resources.splat);
    }
    Object.defineProperty(Item.prototype, "collisionModel", {
        /** * Returns the collision coordinate model at the current square's position. */
        get: function () {
            var widthDiff = (this.image.width / 2);
            var heightDiff = (this.image.height / 2);
            // x and y are centred values
            // offset x and y by negatives
            var x1 = this.x - (widthDiff + this.collisionBuffer);
            var y1 = this.y - (heightDiff + this.collisionBuffer);
            var x2 = this.x + widthDiff + this.collisionBuffer;
            var y2 = this.y + heightDiff + this.collisionBuffer;
            return new Collision_1.CollisionModel(x1, y1, x2, y2);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Item.prototype, "attributes", {
        get: function () { return this.itemAttributes; },
        enumerable: true,
        configurable: true
    });
    /**
     * Create a random fruit item.
     * @param direction The direction to move across the screen.
     * @param x The origin x coordinate.
     * @param y The origin y coordinate.
     */
    Item.createFruit = function (direction, x, y) {
        var attributes = ItemAttributes_1.ItemAttributes.createFruitAttributes();
        var item = new Item(direction, x, y, attributes);
        return item;
    };
    /**
     * Create a letter item.
     * @param letter
     * @param direction
     * @param x The origin x coordinate.
     * @param y The origin y coordinate.
     */
    Item.createLetter = function (letter, direction, x, y) {
        var attributes = ItemAttributes_1.ItemAttributes.createLetterAttributes();
        var item = new Item(direction, x, y, attributes);
        item.setLetter(letter);
        return item;
    };
    /** Updates the item's horizontal position. */
    Item.prototype.moveX = function () {
        this.x += this.speed * this.direction;
    };
    /** Sets the letter value. */
    Item.prototype.setLetter = function (letter) {
        // Typescript does not really support constructor overloads.
        // If it did, then letter setting would be in a 2nd constructor.
        this.letter = letter;
    };
    /**
     * Deactivates the item if it is outside the provided width bounds.
     * @param width The width of the screen. Items only move horizontally.
     */
    Item.prototype.checkCanvasWidthBounds = function (width) {
        // Include width in position calculation so the object does not
        // get disabled as soon as one side hits the screen bounds.
        // The object is only disabled when it is *entirely* outside the bounds.
        if (this.x + this.image.width < 0 ||
            this.x - this.image.width > width) {
            this.active = false;
            this.delete = true;
        }
        // return the active state to save needing another if statement
        return this.delete;
    };
    /**
     * Draws the square on the canvas context.
     * @param context The canvas context to draw on.
     */
    Item.prototype.draw = function (context) {
        // don't draw if it is disabled
        if (this.delete) {
            return;
        }
        var widthDiff = (this.image.width / 2);
        var heightDiff = (this.image.height / 2);
        var x1 = this.x - widthDiff;
        var y1 = this.y - heightDiff;
        var x2 = this.x + widthDiff;
        var y2 = this.y + heightDiff;
        if (!this.active) {
            if (this.splatTicks > 0) {
                context.globalAlpha = this.splatTicks / 45;
                context.drawImage(this.splat, x1, y1, x2 - x1, y2 - y1);
                context.globalAlpha = 1;
                this.splatTicks--;
            }
            else {
                this.delete = true;
            }
        }
        else if (this.attributes.isLetter) {
            // draw the letter
            context.font = "50px" + Resources_1.Resources.FONT;
            context.fillStyle = Colours_1.Colours.THEME;
            context.fillText(this.letter, this.x, this.y);
        }
        else {
            if (this.direction == DataStructures_1.Direction.Reverse && this.flippedImage != null) {
                context.drawImage(this.flippedImage, x1, y1, x2 - x1, y2 - y1);
            }
            else {
                context.drawImage(this.image, x1, y1, x2 - x1, y2 - y1);
            }
        }
    };
    return Item;
}());
exports.Item = Item;

},{"./Collision":2,"./Colours":3,"./DataStructures":4,"./ElementManager":5,"./GameValues":6,"./ItemAttributes":8,"./Resources":9}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DataStructures_1 = require("./DataStructures");
var Resources_1 = require("./Resources");
/** A container for Item stats and details. This could probably be merged
 *  with the Item class.
 */
var ItemAttributes = /** @class */ (function () {
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
    function ItemAttributes(points, isHazard, iconPath, name, rarity, isLetter, flippedImage) {
        if (isLetter === void 0) { isLetter = false; }
        if (flippedImage === void 0) { flippedImage = ''; }
        this.points = points;
        this.isHazard = isHazard;
        this.iconPath = iconPath;
        this.name = name;
        this.rarity = rarity;
        this.isLetter = isLetter;
        this.iconPathFlipped = flippedImage;
    }
    /** Creates a random fruit item. */
    ItemAttributes.createFruitAttributes = function () {
        var randNum = DataStructures_1.randomNumBetween(0, 90);
        // this.items needs to be sorted with the highest 'rarity' first.
        for (var _i = 0, _a = this.items; _i < _a.length; _i++) {
            var item = _a[_i];
            if (randNum >= item.rarity) {
                return item;
            }
        }
        // if nothing found, return the error (resilience!)
        return this.items[0];
    };
    /** Creates the ItemAttributes for a letter item. */
    ItemAttributes.createLetterAttributes = function () {
        return new ItemAttributes(2, false, Resources_1.Resources.NULL_IMAGE, "Letter", 0, true);
    };
    // These needed to be sorted by rarity with most common (highest) first
    ItemAttributes.items = [
        new ItemAttributes(1, false, Resources_1.Resources.fruitA, "Watermelon", 40),
        new ItemAttributes(0, true, Resources_1.Resources.hazard, "Hazard", 22, false, Resources_1.Resources.hazardFlipped),
        new ItemAttributes(2, false, Resources_1.Resources.fruitB, "Honeydew Melon", 13),
        new ItemAttributes(4, false, Resources_1.Resources.fruitC, "Rock Melon", 5),
        new ItemAttributes(8, false, Resources_1.Resources.fruitD, "Crystal Melon", 1),
    ];
    return ItemAttributes;
}());
exports.ItemAttributes = ItemAttributes;

},{"./DataStructures":4,"./Resources":9}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** Common store for resource ids like images and fonts. */
var Resources = /** @class */ (function () {
    function Resources() {
    }
    // Fonts
    Resources.FONT = "Coiny "; // trailing space for ez concatenation
    // seesaw components
    Resources.seesawLog = "seesaw-log";
    Resources.seesawRock = "seesaw-rock";
    // fruit items
    Resources.fruitA = "fruit1";
    Resources.fruitB = "fruit2";
    Resources.fruitC = "fruit3";
    Resources.fruitD = "fruit4";
    Resources.hazard = "hazard";
    Resources.hazardFlipped = "hazard-f";
    Resources.splat = "splat";
    // sloth actors
    Resources.slothA = "sloth-1";
    Resources.slothB = "sloth-2";
    // error content
    Resources.NULL_IMAGE = "null-image";
    // UI element ids
    Resources.uiTitle = "title";
    Resources.uiContainer = "ui";
    Resources.uiScoreText = "score-text";
    Resources.uiScorePanel = "score-panel";
    Resources.uiPlayButton = "play-button";
    Resources.uiSubmitButton = "submit-button";
    return Resources;
}());
exports.Resources = Resources;

},{}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DataStructures_1 = require("./DataStructures");
/** A letter collection that is filled during the game. */
var WordSet = /** @class */ (function () {
    /**
     * Initialise a new WordSet using any string word.
     * @param word The word to use in the WordSet
     */
    function WordSet(word) {
        this.wordArray = [];
        // Create an array for every character in the word
        for (var _i = 0, word_1 = word; _i < word_1.length; _i++) {
            var char = word_1[_i];
            // each word starts as false. words are collected during the game
            this.wordArray.push(new DataStructures_1.KeyValuePair(char, false));
        }
        this.fullWord = word;
    }
    Object.defineProperty(WordSet.prototype, "isWordComplete", {
        /** Returns true if all letters have been activated */
        get: function () {
            // return false if any letter is unfinished
            var complete = true;
            for (var _i = 0, _a = this.wordArray; _i < _a.length; _i++) {
                var kvPair = _a[_i];
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
    Object.defineProperty(WordSet.prototype, "word", {
        /** Returns the full target word. */
        get: function () { return this.fullWord; },
        enumerable: true,
        configurable: true
    });
    /** Activates a single letter in the word set. */
    WordSet.prototype.activateLetter = function (letter) {
        // set the value of this letter to true
        for (var _i = 0, _a = this.wordArray; _i < _a.length; _i++) {
            var kvPair = _a[_i];
            if (kvPair.key.toLowerCase() === letter.toLowerCase() && !kvPair.value) {
                // letter is not filled and matches
                kvPair.value = true;
                break;
            }
        }
        // sometimes a letter is doubled up on the screen (random generation)
        // so if a letter is not found, do nothing.
    };
    /** Returns a single random unactivated letter. */
    WordSet.prototype.getUnactivatedLetter = function () {
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

},{"./DataStructures":4}],11:[function(require,module,exports){
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
            if (!sq.delete) {
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
        ElementManager_1.ElementManager.getElement(Resources_1.Resources.uiSubmitButton).setAttribute("score", this.score.toString());
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
            return !item.delete;
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

},{"./Actor":1,"./Colours":3,"./DataStructures":4,"./ElementManager":5,"./GameValues":6,"./Item":7,"./Resources":9,"./WordSet":10}]},{},[11]);
