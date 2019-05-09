const body = document.querySelector("body");

const createElement = function(tag, classnames) {
    let el = document.createElement(tag);
    if (classnames) {
        if (Array.isArray(classnames)) {
            classnames.forEach(classname => el.classList.add(classname))
        }
        else {
            el.classList.add(classnames);
        }
    }
    return el;
};

const gameWindow = createElement("div", "game");
body.appendChild(gameWindow);

const makeCells = function(height, width) {
    let cells = [];
    for(let row = 0; row < height; row++) {
        for(let col = 0; col < width; col++) {
            let walls = [];
            let cell = {
                row,
                col,
                walls,
                items: [],
                element: createElement("div", "cell"),
            };
            cell.element.appendChild(createElement("div", "lights"));
            cell.element.appendChild(createElement("div", "walls"));
            cells.push(cell);
        }
    }
    return cells;
};

const makePlayer = function(row, col) {
    var player = {
        row,
        col,
        element: createElement("div", "player"),
        inventory: {
            items: [],
            element: createElement("div", "inventory"),
        },
    };
    player.element.appendChild(player.inventory.element);
    return player;
}

const renderPlayer = function() {
    unrender(player);
    const targetLocation = getCellIndex(player);
    grid.cells[targetLocation].element.appendChild(player.element);
};

const getCellIndex = function(object, theGrid) {
    var g = theGrid || grid;
    if (object.row < 0 || object.row >= g.height) return null;
    if (object.col < 0 || object.col >= g.width) return null;
    return object.row * g.width + object.col;
};

const getObjectCell = function(object) {
    var coords = getCellIndex(object);
    if (coords === null) return null;
    return grid.cells[coords];
};

const arrayRemove = function(array, item) {
    // https://stackoverflow.com/a/5767357/178082
    var index = array.indexOf(item);
    if (index > -1) {
        array.splice(index, 1);
    }
};

const unrender = function(object) {
    let el = object.element;
    if (el.parentNode) {
        el.parentNode.removeChild(el);
    }
}

const checkTerminalState = function(cell) {
    const doors = cell.items.filter(i => i.name === "exit");
    if (doors.length === 0) return;
    if (grid.systemItem.booted === false) {
        alert("you must boot the system before you can exit!");
        return;
    }
    const exit = doors[0];
    if (exit.locked === false) {
        playSfx("win");
        setTimeout(() => {
            alert("You have brought the system back online.");
            showLeaderboard();
            // TODO: show exit dialog
        }, 0);
    }
}
const addInventoryItem = function(cell, item, character) {
    let inventoryItems = character.inventory.items;
    let inventoryElement = character.inventory.element;
    item.row = 0;
    item.col = inventoryItems.length;
    inventoryItems.push(item);
    unrender(item);
    inventoryElement.appendChild(item.element);
    playSfx(item.name);
    arrayRemove(cell.items, item);
    return false; // not blocking
};
const interactWithDoor = function(item, character) {
    if (!item.locked) return false;
    let keys = character.inventory.items.filter(item => item.name === "keys");
    if (keys.length === 0) {
        playSfx("door-locked");
        return true;
    }
    item.locked = false;
    let firstKey = keys[0];
    unrender(firstKey);
    delete firstKey;
    // TODO: play unlocking sound (like a door slowly opening or something)
    return false;
};
const interactWithSystem = function(item, character) {
    if (item.booted === false) {
        let data = character.inventory.items.filter(item => item.name === "data");
        if (data.length === 0) {
            alert("in order to reboot the system, you need to find the data disk");
        } else {
            playSfx("data");
            item.booted = true;
            let firstData = data[0];
            unrender(firstData);
            delete firstData;
            // TODO: make it change color or something visual so you know it's done
        }
    }
    return true;
};
const interactWithDesk = function(desk, character) {
    // show the grid stored in the desk as a modal
    // stop player controls and only allow clicking or esc
    if (!introDialog.pickedUp) {
        introDialog.render();
        introDialog.pickedUp = true;
    }
    return true;
};
const interactWithItems = function(cell, character) {
    let blocked = false;
    const actions = cell.items.map(item => {
        if (item.collectible) {
            return () => addInventoryItem(cell, item, character);
        } else if (item.name === "exit") {
            return () => interactWithDoor(item, character);
        } else if (item.name === "system") {
            return () => interactWithSystem(item, character);
        } else if (item.name === "filing-cabinet") {
            return () => interactWithItems(item, character);
        } else if (item.name === "desk") {
            return () => interactWithDesk(item, character);
        }
    });
    actions.forEach(action => {
        if (action) {
            blocked = blocked || action();
        }
    });
    return !blocked;
};


const updateLighting = function(oldCell, newCell, character) {
    let flashlights = character.inventory.items.filter(item => item.name === "flashlight");
    if (flashlights.length === 0) return;
    
    let hasLeftWall = oldCell.walls.indexOf("left") != -1;
    let hasRightWall = oldCell.walls.indexOf("right") != -1;
    let hasTopWall = oldCell.walls.indexOf("top") != -1;
    let hasBottomWall = oldCell.walls.indexOf("bottom") != -1;
    let neighbor = getObjectCell({row:oldCell.row-1,col:oldCell.col-1});
    if (neighbor && !hasLeftWall && !hasTopWall) neighbor.element.setAttribute("light-level", "25");
    neighbor = getObjectCell({row:oldCell.row-1,col:oldCell.col-0});
    if (neighbor && !hasTopWall) neighbor.element.setAttribute("light-level", "25");
    neighbor = getObjectCell({row:oldCell.row-1,col:oldCell.col+1});
    if (neighbor && !hasRightWall && !hasTopWall) neighbor.element.setAttribute("light-level", "25");
    neighbor = getObjectCell({row:oldCell.row+1,col:oldCell.col-1});
    if (neighbor && !hasLeftWall && !hasBottomWall) neighbor.element.setAttribute("light-level", "25");
    neighbor = getObjectCell({row:oldCell.row+1,col:oldCell.col-0});
    if (neighbor && !hasBottomWall) neighbor.element.setAttribute("light-level", "25");
    neighbor = getObjectCell({row:oldCell.row+1,col:oldCell.col+1});
    if (neighbor && !hasBottomWall && !hasRightWall) neighbor.element.setAttribute("light-level", "25");
    neighbor = getObjectCell({row:oldCell.row-0,col:oldCell.col-1});
    if (neighbor && !hasLeftWall) neighbor.element.setAttribute("light-level", "25");
    neighbor = getObjectCell({row:oldCell.row-0,col:oldCell.col+1});
    if (neighbor && !hasRightWall) neighbor.element.setAttribute("light-level", "25");

    hasLeftWall = newCell.walls.indexOf("left") != -1;
    hasRightWall = newCell.walls.indexOf("right") != -1;
    hasTopWall = newCell.walls.indexOf("top") != -1;
    hasBottomWall = newCell.walls.indexOf("bottom") != -1;
    neighbor = getObjectCell({row:newCell.row-1,col:newCell.col-1});
    if (neighbor && !hasLeftWall && !hasTopWall) neighbor.element.setAttribute("light-level", "25");
    neighbor = getObjectCell({row:newCell.row-1,col:newCell.col-0});
    if (neighbor && !hasTopWall) neighbor.element.setAttribute("light-level", "50");
    neighbor = getObjectCell({row:newCell.row-1,col:newCell.col+1});
    if (neighbor && !hasRightWall && !hasTopWall) neighbor.element.setAttribute("light-level", "25");
    neighbor = getObjectCell({row:newCell.row+1,col:newCell.col-1});
    if (neighbor && !hasLeftWall && !hasBottomWall) neighbor.element.setAttribute("light-level", "25");
    neighbor = getObjectCell({row:newCell.row+1,col:newCell.col-0});
    if (neighbor && !hasBottomWall) neighbor.element.setAttribute("light-level", "50");
    neighbor = getObjectCell({row:newCell.row+1,col:newCell.col+1});
    if (neighbor && !hasBottomWall && !hasRightWall) neighbor.element.setAttribute("light-level", "25");
    neighbor = getObjectCell({row:newCell.row-0,col:newCell.col-1});
    if (neighbor && !hasLeftWall) neighbor.element.setAttribute("light-level", "50");
    neighbor = getObjectCell({row:newCell.row-0,col:newCell.col+1});
    if (neighbor && !hasRightWall) neighbor.element.setAttribute("light-level", "50");

    newCell.element.setAttribute("light-level", "75");
    // roberttables subscription! first ever!
}
const updateCamera = function(object) {
    let left = 50*object.col;
    let top = 50*object.row;
    grid.element.style.transform = "translate(-" + left + "px,-" + top + "px)";
};
const enterCheck = {
    "w": "bottom",
    "a": "right",
    "s": "top",
    "d": "left",
};
const handlePlayerMove = function(event) {
    const oldCell = getObjectCell(player);
    let newCellCoords = { row: player.row, col: player.col };
    // check if can leave
    if (event.key === "w" && oldCell.walls.indexOf("top") === -1) {
        newCellCoords.row = player.row - 1;
    }
    else if (event.key === "a" && oldCell.walls.indexOf("left") === -1) {
        newCellCoords.col = player.col - 1;
    }
    else if (event.key === "s" && oldCell.walls.indexOf("bottom") === -1) {
        newCellCoords.row = player.row + 1;
    }
    else if (event.key === "d" && oldCell.walls.indexOf("right") === -1) {
        newCellCoords.col = player.col + 1;
    }
    let newCell = getObjectCell(newCellCoords);
    if (oldCell !== newCell) {
        incrementMoveCounter(1);
        // check if can enter
        let canMoveThere = interactWithItems(newCell, player);
        if (event.key === "w" && newCell.walls.indexOf("bottom") >= 0) {
            canMoveThere = false;
        }
        else if (event.key === "a" && newCell.walls.indexOf("right") >= 0) {
            canMoveThere = false;
        }
        else if (event.key === "s" && newCell.walls.indexOf("top") >= 0) {
            canMoveThere = false;
        }
        else if (event.key === "d" && newCell.walls.indexOf("bottom") >= 0) {
            canMoveThere = false;
        }
        if (canMoveThere) {
            // nothing blocking us, so move character
            player.row = newCellCoords.row;
            player.col = newCellCoords.col;
            arrayRemove(oldCell.items, player);
            newCell.items.push(player);
            renderPlayer();
        } else {
            newCell = oldCell;
        }
    }
    updateLighting(oldCell, newCell, player);
    updateCamera(player);
    checkTerminalState(newCell);
};

const makeItem = function(row, col, name, collectible, attributes) {
    let item = {
        row,
        col,
        name,
        collectible,
        element: createElement("div", ["item", name]),
    };
    Object.keys(attributes || {}).forEach(key => {
        if (item.hasOwnProperty(key)) {
            throw "cannot overwrite required property on item: " + key;
        }
        item[key] = attributes[key];
    })
    return item;
};

const renderCell = function(cell) {
    const element = cell.element;
    cell.items.forEach(item => {
        element.appendChild(item.element);
    });
    return element;
};

const renderGrid = function(grid) {
    const g = grid.element;
    grid.cells.forEach(cell => g.appendChild(renderCell(cell)));
    gameWindow.appendChild(g);
};

function load_image(name, callback) {
	let _temp = new Image();
	_temp.src = name;
	_temp.onload = callback;
}
let player = null;
let grid = null;
let move_counter = {
    moves: 0,
    element: createElement("div", "move-counter"),
};
const worldThings = {
    "0": "wall", /* black */
    "16777215": "floor", /* white */
    "16715007": "locked-door-boss", /* light purple */
    "11665663": "filing-cabinet", /* dark purple */
    "65530": "unlocked-door", /* cyan */
    "8421504": "window", /* gray */
    "16766976": "couch", /* gold */
    "5046016": "desk", /* green */
    "16738816": "locked-door-security", /* orange */
    "16711684": "system", /* red */
    "8323182": "player", /* dark purple */
    "4164863": "keys", /* bold blue */
};
const initialize_world = function(event) {
    _temp = document.createElement('canvas');
    _temp.width = level_width = event.target.width;
    _temp.height = level_height = event.target.height;
    _temp = _temp.getContext('2d')
    _temp.drawImage(this, 0, 0);
    _temp =_temp.getImageData(0, 0, level_width, level_height).data;
    grid = makeGrid(level_width, level_height);
    let filingCabinets = [];
    for(let r = 0; r < level_height; r++) {
        for(let c = 0; c < level_width; c++) {
            let i = (r * level_width + c) * 4;
            let value = (_temp[i] << 16) + (_temp[i+1] << 8) + _temp[i+2];
            let thing = worldThings[""+value];
            let cell = grid.cells[getCellIndex({row:r,col:c})];
            if (thing === "wall") {
                cell.walls = ["top", "left", "right", "bottom"];
                cell.walls.forEach(w => cell.element.classList.add("wall-" + w));
            } else if (thing === "locked-door-boss") {
                cell.items.push(makeItem(r,c,"exit",false,{locked:true}));
            } else if (thing === "filing-cabinet") {
                var fc = makeItem(r,c,"filing-cabinet",false,{items:[]});
                cell.items.push(fc);
                filingCabinets.push(fc);
            } else if (thing === "unlocked-door") {
                cell.items.push(makeItem(r,c,"exit",false,{locked:false}));
            } else if (thing === "window") {
                cell.walls = ["top", "left", "right", "bottom"];
                cell.walls.forEach(w => cell.element.classList.add("wall-" + w));
                cell.items.push(makeItem(r,c,"window",false));
            } else if (thing === "couch") {
                cell.items.push(makeItem(r,c,"couch",false));
            } else if (thing === "desk") {
                cell.items.push(makeItem(r,c,"desk",false));
            } else if (thing === "locked-door-security") {
                cell.items.push(makeItem(r,c,"exit",false,{locked:true}));
            } else if (thing === "system") {
                grid.systemItem = makeItem(r,c,"system",false,{booted:false});
                cell.items.push(grid.systemItem);
            } else if (thing === "player") {
                player = makePlayer(r, c);
                cell.items.push(player);
            } else if (thing === "keys") {
                cell.items.push(makeItem(r,c,"keys",true));
            }
        }
    }
    let closest = {
        dist: straightLineDistance(player, filingCabinets[0]),
        fc: filingCabinets[0]
    };
    for(let i = 1; i < filingCabinets.length; i++) {
        let dist = straightLineDistance(player, filingCabinets[i]);
        if (dist < closest.dist) {
            closest.dist = dist;
            closest.fc = filingCabinets[i];
        }
    }
    var flashlight = makeItem(0,0,"flashlight",true);
    closest.fc.items.push(flashlight);
    const data = makeItem(0,0,"data",true);
    filingCabinets[getRandomInt(filingCabinets.length)].items.push(data);
    setTimeout(runGame, 1);
};
const straightLineDistance = function(a, b) {
    return Math.sqrt(Math.pow(b.row-a.row, 2) + Math.pow(b.col-a.col, 2));
};
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

const makeGrid = function(level_width, level_height) {
    let grid = {
        width: level_width,
        height: level_height,
        element: createElement("div", "grid"),
        cells: makeCells(level_height, level_width),
    };
    grid.element.style.height = "" + (level_height*50) + "px";
    grid.element.style.width = "" + (level_width*50) + "px";
    return grid;
};


const incrementMoveCounter = function(value) {
    move_counter.moves += value;
    move_counter.element.innerHTML = "Moves: " + move_counter.moves;
};

const renderLeaderboard = function() {
    let element = createElement("div", "leaderboard");
    let leaderboard = {
        element: element,
    };
    let button = createElement("button", "play");
    button.innerHTML = "PLAY!";
    element.appendChild(button);
    button.addEventListener("click", startGame);
    body.appendChild(leaderboard.element);
};

let keypressControl = [];
const addKeypressControl = function(handler) {
    keypressControl.push(handler);
};
const removeKeypressControl = function(handler) {
    arrayRemove(keypressControl, handler);
};
const handleKeypress = function(event) {
    if (audioCtx) {
        event.preventDefault();
    }
    const handler = keypressControl[keypressControl.length - 1];
    handler(event);
};

const startGame = function() {
    body.setAttribute("view", "game");
    incrementMoveCounter(0);
    pickUpThePhoneDialog.render();
};

const showLeaderboard = function() {
    body.setAttribute("view", "leaderboard");
};

class Dialog {
    constructor(convo) {
        this.convo = convo;
        this.index = 0;
        this.element = createElement("div", "dialog");
        const that = this;
        this.element.addEventListener("click", () => that.moveTextNext());
        this.textElement = createElement("div", "text");
        this.element.appendChild(this.textElement);
        this.avatarElement = createElement("div", "avatar");
        this.element.appendChild(this.avatarElement);
        let clickToContinueElement = createElement("div", "click-to-continue");
        clickToContinueElement.innerHTML = "Click or press space to continue...";
        this.element.appendChild(clickToContinueElement);
        this.moveTextNext();

        this.inputHandler = function(event) {
            if (event.key === " ") {
                that.moveTextNext();
            }
        };
    }

    render() {
        gameWindow.appendChild(this.element);
        addKeypressControl(this.inputHandler);
    }

    unrender() {
        unrender(this);
        removeKeypressControl(this.inputHandler);
    }

    moveTextNext() {
        if (this.index >= this.convo.length) {
            this.unrender();
            return;
        }
        const nextItem = this.convo[this.index];
        // TODO: find a better way than setting innerHTML
        this.textElement.innerHTML = nextItem.text;
        this.avatarElement.innerHTML = nextItem.avatar;
        this.element.classList.remove("left");
        this.element.classList.remove("right");
        this.element.classList.add(nextItem.side);
        this.index++;
    }
}

var introDialog = new Dialog([
    {side: "left", avatar: "🧔", text: "Hey, are you awake?  I've been trying to call you for an hour!" },
    {side: "right", avatar: "🧞", text: "Hey, what's going on? It's dark in here and my head is killing me!" },
    {side: "left", avatar: "🧔", text: "Why are you still in the office?" },
    {side: "right", avatar: "🧞", text: "I don't know, whats.." },
    {side: "left", avatar: "🧔", text: "You know what, don't worry about it, that's not what matters right now..." },
    {side: "right", avatar: "🧞", text: "What do you mean?  What's wrong?" },
    {side: "left", avatar: "🧔", text: "The power is out and the system is offline, WE'RE LOSING MONEY! AND WE'RE LOSING IT FAST!" },
    {side: "right", avatar: "🧞", text: "How much do we have?  What can I do about it?" },
    {side: "left", avatar: "🧔", text: "Get the system back online, you need to collect the Windows 3.1 disks from around the office and restore the OS on the main server." },
    {side: "right", avatar: "🧞", text: "But it's pitch black in here, I can't see anything.." },
    {side: "left", avatar: "🧔", text: "There's a flashlight in the filing cabinet near your desk, hurry up, we're counting on you!" },
]);

var pickUpThePhoneDialog = new Dialog([
    {side: "left", avatar: "☎️", text: "There's a phone on the desk ringing like crazy.  Why don't you pick it up..." },
]);

const runGame = function() {
    renderGrid(grid);
    gameWindow.appendChild(move_counter.element);
    updateCamera(player);
    addKeypressControl(handlePlayerMove);
    body.addEventListener("keydown", handleKeypress);
    renderLeaderboard();
    showLeaderboard();
};

//initialize_world("world.png", runGame);
load_image("world.png", initialize_world);