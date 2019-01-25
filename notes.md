Main Sections of the Program
Front end (display)
Data validation (can't submit an empty name). No framework, so just watching the onchange event and toggling the disabled state of the submit button.
Ajax to run HTTP requests to the server API, no jQuery because there are only 3 requests and that's accomplished fine with a basic helper function.

Front end (game logic)
Typescript
	- Classes: each object in the game is in a class. Classes like Actor (player sloths) and Item (wasps, fruit, letters) have draw and movement methods (internal).
	- Enums: tried to use these as often as possible to replace magic numbers (direction of movement) and strings (active key, actor states).
	- Interfaces: not as important at this scale, in a JavaScript language with limited reference support, and few objects that could use an interface. But demonstrates that I know how to use interfaces (vs class inheritance) and it's directly applicable to C# work.
	- Generic (KeyValuePair class) because Typescript supports generics.
	- Static Resources (image ids, element ids, colour theming, limited magic numbers and strings). Want to change a speed? Change it in one place. Positions, range of motion, spawn rates (part of item class rather than global though). Element id changes? Program won't break because one getElementById wasn't updated.
	- 
	- Encapsulation: The nature of a Game (of this size) is that there is one big class that manages the active objects. Everything is private unless it needs to be accessed.

Game Components: Draw loops, timer loops, item spawning loops.
WordSet class manages a word. Pass it a string, use the interface of add and isComplete [replace with proper names]
Asset management: loading sound and image assets, central audio manager with a simple play(id) interface. Wasp has two sprites; drawn based on the direction the wasp is travelling.
Collision detection: each object that implements ICollidable needs to create a collision box. Can modify this with a collision buffer int to increase or decrease the size. Collision model checks for an intersection with another model.

Challenges
Movement control
	- User can hold down two arrow keys and the game should respond to the last pressed active key (if it's still held down).
	- Store the states of each arrow key in booleans, and the last key pressed as an Enum. Need to transfer movement from one sloth to the other when it hits the seesaw, but the challenge in javascript languages is that you can't have a variable store a pointer or reference to the active sloth. Both sloths are stored in a list, and instead the active sloth is fetched and changed using an index number. This passes the sloth by reference, allowing me to call its movement methods and have each sloth's state kept independent.

Back end (leaderboard server)
Asp.net Core (how/why)
	- Worked with C# before, Aderant uses C#, logical choice of language.
	- .NET core is lightweight, only need a simple API for this application.

Web API (how/why)
	- HTTP Web API: Get, Post, and Delete API. No Put because it's a simple project. Each name has its own id, so duplicate names are allowed. This could be improved, but it's just a simple leaderboard system.
	- The Get is for fetching the leaderboard, post adds a new entry to the leaderboard.
	- The delete is for removing names. Public leaderboard, wanted a way to remove rude people. There's a special code to delete all in an emergency.

Entity Framework Core (how/why)
	- Azure App Service. Free tier, so initial server startup takes several seconds. Just needed something basic to run the back-end and I'm familiar with Azure. Also having the cloud provider, database, and app service, programming language, and ORM all by the same vendor should make deployment much smoother. For something of this size, the main advantage is that I can edit everything from the same place.
Git-based deployment
	- Push directly from repo to Azure web server with `git push web master`. No ftp or drag and drop, keeps the application and the source code synchronized.

Database (leaderboard database)
Entity Framework basically means I can build tables from classes and use LINQ instead of SQL. It removes the need for serializing and deserializing records and class instances, and it's safer to use LINQ than string SQL queries. The record classes are real classes, rather than transitional data holders, meaning I can use them all over the program and I don't need to update two classes anytime the properties are modified. Code-first database generation

The database is a basic Azure SQL database, which is a simple form/interface to SQL server. Connection strings are stored as environment variables rather than in the code. Just a single table because it only keeps ScoreRecord objects.

Game
Control two sloths as they use a seesaw to gather as much fruit as possible before the time runs out. When a sloth is dropped from its branch, it lands on the seesaw and launches the other sloth into the branch above it. Sloths can be moved during ascent and descent, and the playable sloth alternates each time the seesaw is hit.
Fruit comes in from the sides of the screen and different fruits earn different points. Wasps should be avoided because they will stun a sloth for a short period of time.
Letters will also travel across the screen, and collecting all letters will spell out a word and give a time bonus.
The game ends when the timer runs out.
The player can submit their score and their name to a global leaderboard table.
