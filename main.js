"use strict";
var ItemAttributes = (function () {
    function ItemAttributes(points, isHazard, iconPath, name, rarity, isLetter) {
        if (isLetter === void 0) { isLetter = false; }
        this.points = points;
        this.isHazard = isHazard;
        this.iconPath = iconPath;
        this.name = name;
        this.rarity = rarity;
        this.isLetter = isLetter;
    }
    ItemAttributes.getRandomItem = function () {
        var randNum = randomNumBetween(0, 100);
        // search most common first (saves on cycles because it returns earlier
        // when the most common is checked first)
        for (var i = 0; i < this.items.length; i++) {
            var item = this.items[i];
            if (randNum >= item.rarity)
                return item;
        }
        // if nothing found, return the error (resilience!)
        return this.items[0];
    };
    // These needed to be sorted by rarity with most common (highest) first
    ItemAttributes.items = [
        new ItemAttributes(1, false, '#7F3300', 'Wood', 30),
        new ItemAttributes(0, true, '#FF0000', 'Hazard', 22),
        new ItemAttributes(2, false, '#BC815F', 'Bronze', 16),
        new ItemAttributes(4, false, '#C4C4C4', 'Silver', 11),
        new ItemAttributes(0, false, '#000000', 'Letter', 7, true),
        new ItemAttributes(8, false, '#FFD800', 'Gold', 4),
        new ItemAttributes(16, false, '#AAFFFF', 'Platinum', 2),
        new ItemAttributes(32, false, '#7C00FF', 'Astral', 1),
    ];
    return ItemAttributes;
}());
function degToRad(degrees) {
    return degrees * Math.PI / 180;
}
// using generics so it's flexible
var KeyValuePair = (function () {
    function KeyValuePair(key, value) {
        this.key = key;
        this.value = value;
    }
    return KeyValuePair;
}());
var WordInventory = (function () {
    function WordInventory(word) {
        this.wordArray = [];
        for (var i = 0; i < word.length; i++) {
            var char = word[i];
            this.wordArray.push(new KeyValuePair(char, false));
        }
        this.fullWord = word;
    }
    WordInventory.prototype.addLetter = function (letter) {
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
    Object.defineProperty(WordInventory.prototype, "isWordComplete", {
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
    WordInventory.prototype.getNewLetter = function () {
        // find all letters whose value is false (not filled)
        var availableLetters = this.wordArray.filter(function (kvpair) {
            return !kvpair.value;
        });
        // js random in inclusive,inclusive (not inc,exc)
        var randomIndex = randomNumBetween(0, availableLetters.length - 1);
        return availableLetters[randomIndex].key;
    };
    return WordInventory;
}());
var FixedPosition = (function () {
    function FixedPosition() {
    }
    FixedPosition.LEFT_TOP = [0.0, 0.0];
    FixedPosition.MID_TOP = [0.5, 0.0];
    FixedPosition.RIGHT_TOP = [1.0, 0.0];
    FixedPosition.LEFT_MID = [0.0, 0.5];
    FixedPosition.MID_MID = [0.5, 0.5];
    FixedPosition.RIGHT_MID = [1.0, 0.5];
    FixedPosition.LEFT_BOT = [0.0, 1.0];
    FixedPosition.MID_BOT = [0.5, 1.0];
    FixedPosition.RIGHT_BOT = [1.0, 1.0];
    return FixedPosition;
}());
var ScreenPositions = (function () {
    function ScreenPositions() {
        this.fullHeight = 0;
        this.fullWidth = 0;
        this.hangY = 90;
        this.seesawYHigh = 0;
        this.padEdge = 20;
        this.padCenter = 70;
    }
    Object.defineProperty(ScreenPositions.prototype, "seesawYLow", {
        get: function () { return this.fullHeight - 30; },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(ScreenPositions.prototype, "fruitYTop", {
        get: function () { return 100; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ScreenPositions.prototype, "fruitYBot", {
        get: function () { return this.fullHeight - 100; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ScreenPositions.prototype, "centerX", {
        get: function () { return this.fullWidth / 2; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ScreenPositions.prototype, "centerY", {
        get: function () { return this.fullHeight / 2; },
        enumerable: true,
        configurable: true
    });
    return ScreenPositions;
}());
var Game = (function () {
    function Game() {
        this.screenBounds = new Bounds(0, 0);
        this.ySpeed = 6;
        this.xSpeed = 4;
        this.pos = new ScreenPositions();
        this.leftKeyDown = false;
        this.rightKeyDown = false;
        this.targetWord = new WordInventory("HELLO");
        this.drawTimer = 0;
        this.squareTimer = 0;
        this.gameTimer = 0;
        this.score = 0;
        this.squares = [];
        this.sprites = {};
        // Use this list and index method. Can't assign an activeActor pointer
        // in javascript, so instead the activeActor is done through a list index.
        // When the actor changes, the index changes. Avoids all reference/assignment
        // problems using the objects and object references.
        this.actors = [];
        this.activeActorNum = 0;
        this.gameTime = 60;
        this.timerbar = null;
        this.timeOffset = 0;
    }
    Game.prototype.initialise = function (canvasId) {
        // if restarting game
        this.stopTimers();
        this.canvas = document.getElementById(canvasId);
        this.context = this.canvas.getContext("2d");
        this.scoreElement = document.getElementById('score');
        this.timerbar = document.getElementById('timer-bar');
        this._loadSprites();
        // this.c = this.canvas.height - 30;
        // this.lowerY = this.canvas.height - 100;
        this.pos.fullHeight = this.canvas.height;
        this.pos.fullWidth = this.canvas.width;
        // this.screenBounds = new Bounds(this.canvasHeight, this.canvasWidth);
        var boundsLeft = new NumberRange(game.pos.padEdge, game.pos.fullWidth / 2 - game.pos.padCenter);
        var boundsRight = new NumberRange(game.pos.fullWidth / 2 + game.pos.padCenter, game.pos.fullWidth - game.pos.padEdge);
        var leftActor = new Actor(ActorState.resting, boundsLeft, this.sprites['sloth-1']);
        var rightActor = new Actor(ActorState.waiting, boundsRight, this.sprites['sloth-2']);
        this.actors = [leftActor, rightActor];
        this.targetWord = new WordInventory("HELLO");
        var framerate = 10; // 10 
        this.drawTimer = setInterval(game.draw, framerate);
        this.squareTimer = setInterval(game.spawnSquare, 500);
        this.gameTimer = setInterval(game.tickTimer, 500);
    };
    Game.prototype._loadSprites = function () {
        this.sprites['seesaw-log'] = document.getElementById('seesaw-log');
        this.sprites['seesaw-rock'] = document.getElementById('seesaw-rock');
        this.sprites['sloth-1'] = document.getElementById('sloth-1');
        this.sprites['sloth-2'] = document.getElementById('sloth-2');
    };
    Game.prototype.getActiveActor = function () {
        return this.actors[this.activeActorNum];
    };
    Game.prototype.stopTimers = function () {
        window.clearInterval(this.drawTimer);
        window.clearInterval(this.squareTimer);
        window.clearInterval(this.gameTimer);
    };
    Game.prototype.drawActors = function () {
        var _this = this;
        // this is its own function because actors is private and the 'draw' method
        // is run from the window context
        this.actors.forEach(function (actor) {
            actor.draw(_this.context);
        });
    };
    Game.prototype.drawWords = function () {
        var text = "";
        this.targetWord.wordArray.forEach(function (kv) {
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
    };
    Game.prototype.drawSpriteXY = function (context, imageName, x, y, centerX, centerY) {
        if (centerX === void 0) { centerX = false; }
        if (centerY === void 0) { centerY = false; }
        var width = game.sprites[imageName].width;
        var height = game.sprites[imageName].height;
        // If centerX or centerY, then the origin coordinate is (0.5,0.5), not (0,0)
        var px = x;
        if (centerX) {
            px = x - (width / 2);
        }
        var py = y;
        if (centerY) {
            px = x - (width / 2);
        }
        context.drawImage(game.sprites[imageName], px, py, width, height);
    };
    Game.prototype.drawSpriteFixed = function (context, imageName, fixedPos) {
        var width = game.sprites[imageName].width;
        var height = game.sprites[imageName].height;
        // If centerX or centerY, then the origin coordinate is (0.5,0.5), not (0,0)
        var px = game.pos.fullWidth * fixedPos[0] - (width / 2);
        var py = game.pos.fullHeight * fixedPos[1] - (height / 2);
        // correct in corners
        // todo: improve this and make it apply for everything
        if (fixedPos[1] == 1) {
            py -= height / 2;
        }
        context.drawImage(game.sprites[imageName], px, py, width, height);
    };
    Game.prototype.draw = function () {
        // THIS DRAW METHOD RUNS INSIDE WINDOW CONTEXT
        // 'this' REFERS TO 'window', NOT THE GAME CLASS
        game.context.clearRect(0, 0, game.pos.fullWidth, game.pos.fullHeight);
        game.drawWords();
        // move horizontally
        game.getActiveActor().moveX();
        game.getActiveActor().moveY();
        // update squares
        game.squares.forEach(function (sq) {
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
                sq.draw(game.context);
            }
        });
        // draw seesaw
        game.drawSpriteFixed(game.context, 'seesaw-rock', FixedPosition.MID_BOT);
        // rotate seesaw to direction of new active actor
        var slW = game.sprites['seesaw-log'].width;
        var xt = game.pos.centerX - slW / 2 + slW / 2;
        var slH = game.sprites['seesaw-log'].height;
        var yt = 540 - slH / 2 + slH / 2;
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
            var prevDx = game.getActiveActor().dx;
            // swap characters when one reaches the bottom (seesaw)
            game.switchActor();
            // launch the new actor upwards
            game.getActiveActor().state = ActorState.ascending;
            game.getActiveActor().dy = Direction.Reverse;
            // add the current movement to the new actor (makes transition fluid)
            game.getActiveActor().dx = prevDx;
        }
    };
    Game.prototype.tickGameTimer = function () {
        this.gameTime -= 0.5;
        if (this.gameTime == 0) {
            // Game Over
            console.log('GAME OVER');
        }
        else if (this.timerbar != null) {
            this.timerbar.value = this.gameTime;
        }
    };
    Game.prototype.tickTimer = function () {
        // send the context back to the game object
        game.tickGameTimer();
    };
    Game.prototype.setNewWord = function () {
        this.gameTime += 20;
        if (this.targetWord.fullWord.toLowerCase() == "hello") {
            this.targetWord = new WordInventory("WORLD");
        }
        else {
            this.targetWord = new WordInventory("HELLO");
        }
    };
    Game.prototype.addScore = function (newPoints) {
        game.score += newPoints;
        if (this.scoreElement != null) {
            this.scoreElement.textContent = 'Score: ' + game.score;
        }
    };
    Game.prototype.spawnSquare = function () {
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
        var attributes = ItemAttributes.getRandomItem();
        var letter = '';
        if (attributes.isLetter) {
            letter = game.targetWord.getNewLetter();
        }
        var square = new Square(direction, yPosition, xOrigin, attributes, letter);
        game.squares.push(square);
        // delete squares that are no longer visible
        game.squares = game.squares.filter(function (sq) {
            return sq.active;
        });
        // create a new offset
        this.timeOffset = randomNumBetween(0, 4);
    };
    Game.prototype.switchActor = function () {
        this.getActiveActor().dx = Direction.Stopped;
        if (this.activeActorNum == 0) {
            this.activeActorNum = 1;
        }
        else {
            this.activeActorNum = 0;
        }
    };
    return Game;
}());
// although render origin is top left, it is more consistent with the *user* that
// bottom is the bottom, even though the bottom Y is higher than the upper Y
function randomNumBetween(lower, upper) {
    return Math.floor(Math.random() * (upper - lower + 1) + lower);
}
var CollisionModel = (function () {
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
var Direction;
(function (Direction) {
    Direction[Direction["Forward"] = 1] = "Forward";
    Direction[Direction["Stopped"] = 0] = "Stopped";
    Direction[Direction["Reverse"] = -1] = "Reverse";
})(Direction || (Direction = {}));
var Bounds = (function () {
    function Bounds(height, width) {
        this.height = height;
        this.width = width;
    }
    return Bounds;
}());
var NumberRange = (function () {
    function NumberRange(min, max) {
        this.min = min;
        this.max = max;
    }
    return NumberRange;
}());
var game = new Game();
window.onload = function () {
    game.initialise('game-canvas');
};
/** The animation/position states of an actor. */
var ActorState;
(function (ActorState) {
    ActorState[ActorState["descending"] = 0] = "descending";
    ActorState[ActorState["ascending"] = 1] = "ascending";
    ActorState[ActorState["jumping"] = 2] = "jumping";
    ActorState[ActorState["landing"] = 3] = "landing";
    ActorState[ActorState["resting"] = 4] = "resting";
    ActorState[ActorState["waiting"] = 5] = "waiting";
})(ActorState || (ActorState = {}));
var Actor = (function () {
    function Actor(state, xLimit, sprite) {
        this.yLerp = 30;
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
    Actor.prototype.getYLerpSpeed = function () {
        return 0;
    };
    Actor.prototype.moveX = function () {
        // hit the left or right edge?
        // stop movement (and don't update)
        // Because dx is just direction, movement combines speed with this.
        // Therefore all edge checks must require the speed (otherwise the actor
        // goes past the edge and is permanently stuck
        if (this.x + (this.dx * game.xSpeed) >= this.xMax || this.x + (this.dx * game.xSpeed) <= this.xMin) {
            this.dx = Direction.Stopped;
        }
        else if (game.leftKeyDown || game.rightKeyDown) {
            // need to clamp this within game bounds
            var newPosition = this.x + (game.xSpeed * this.dx);
            if (newPosition < this.xMin)
                this.x = this.xMin;
            else if (newPosition > this.xMax)
                this.x = this.xMax;
            else
                this.x += game.xSpeed * this.dx;
        }
    };
    Actor.prototype.moveY = function () {
        // Because dy is just direction (-1,0,1), movement combines speed with this.
        // Therefore all edge checks must require the speed (otherwise the actor
        // goes past the edge and is permanently stuck
        if (this.y + (this.dy * game.ySpeed) < game.pos.hangY) {
            // actor has reached the vertical height limit
            this.dy = Direction.Stopped;
            this.state = ActorState.resting;
        }
        else if (this.y + (this.dy * game.ySpeed) > game.pos.seesawYLow) {
            // actor has reached the lower height limit
            this.dy = Direction.Stopped;
            this.state = ActorState.landing;
        }
        else {
            // move vertically
            // if lerp frames, then lerp
            this.y += game.ySpeed * this.dy;
        }
    };
    Object.defineProperty(Actor.prototype, "collisionModel", {
        get: function () {
            var widthDiff = this.sprite.width / 2 + this.collisionBuffer;
            var heightDiff = this.sprite.height / 2 + this.collisionBuffer;
            return new CollisionModel(this.y - heightDiff, this.x + widthDiff, this.y + widthDiff, this.x - widthDiff);
        },
        enumerable: true,
        configurable: true
    });
    Actor.prototype.draw = function (context) {
        // context.beginPath();
        // context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        // context.fillStyle = this.colour;
        // context.fill();
        // context.closePath();
        var px = this.x - this.sprite.width;
        var py = this.y - this.sprite.height;
        context.drawImage(this.sprite, px, py, this.sprite.width, this.sprite.height);
    };
    return Actor;
}());
var Square = (function () {
    function Square(direction, yPosition, xOrigin, attributes, letter) {
        this.letter = '';
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
    Square.prototype.setColour = function (newColour) {
        // NOTE: because argb is a valid colour, the responsibility is on
        // the developer to provide a correct colour (it's static and not hard)
        // rather than the program assuming the correct colour format.
        // If the colour came from the user, it would be a different story.
        this.colour = newColour;
    };
    Square.prototype.moveX = function () {
        this.xPosition += this.speed * this.direction;
    };
    Object.defineProperty(Square.prototype, "attributes", {
        get: function () {
            return this._attributes;
        },
        enumerable: true,
        configurable: true
    });
    Square.prototype.checkCanvasWidthBounds = function (width) {
        // Include width in position calculation so the object does not
        // get disabled as soon as one side hits the screen bounds.
        // The object is only disabled when it is *entirely* outside the bounds.
        if (this.xPosition + this.width < 0 ||
            this.xPosition - this.width > width) {
            this.active = false;
        }
        // return the active state to save needing another if statement
        return this.active;
    };
    Object.defineProperty(Square.prototype, "collisionModel", {
        /**
         * Returns the collision coordinate model at the current square's position.
         */
        get: function () {
            var heightDiff = this.height / 2 + this.collisionBuffer;
            var widthDiff = this.width / 2 + this.collisionBuffer;
            return new CollisionModel(this.yPosition - heightDiff, this.xPosition + widthDiff, this.yPosition + widthDiff, this.xPosition - widthDiff);
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Draws the square on the canvas context.
     * @param context The canvas context to draw on.
     */
    Square.prototype.draw = function (context) {
        // don't draw if it is disabled
        if (!this.active)
            return;
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
    };
    return Square;
}());
document.onkeydown = keyDown;
document.onkeyup = keyReleased;
function keyDown(e) {
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
function keyReleased(e) {
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
        else
            game.getActiveActor().dx = Direction.Stopped;
    }
    else if (e.keyCode == 39) {
        // right arrow
        game.rightKeyDown = false;
        if (game.leftKeyDown == true) {
            // go back to this direction instead
            // L held, R held, R released (but L still held)
            game.getActiveActor().dx = Direction.Reverse;
        }
        else
            game.getActiveActor().dx = Direction.Stopped;
    }
}
