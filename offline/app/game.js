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

const makeCells = function(height, width) {
    let cells = [];
    for(let row = 0; row < height; row++) {
        for(let col = 0; col < width; col++) {
            let walls = [];
            if (row === 0) walls.push("top");
            if (row === height - 1) walls.push("bottom");
            if (col === 0 || (col===4 && row < 6)) walls.push("left");
            if (col === width - 1 || (col===3 && row < 6)) walls.push("right");
            let cell = {
                row,
                col,
                walls,
                items: [],
                element: createElement("div", "cell"),
            };
            walls.forEach(w => cell.element.classList.add("wall-" + w));
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
    return object.row * g.width + object.col;
};

const getObjectCell = function(object) {
    return grid.cells[getCellIndex(object)];
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
        const canMoveThere = interactWithItems(newCell, player);
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
    body.appendChild(g);
};

const makeGrid = function(player) {
    let grid = {
        width: 8,
        height: 8,
        element: createElement("div", "grid"),
        cells: makeCells(8, 8),
    };
    grid.cells[getCellIndex({row:4,col:4}, grid)].items.push(player);
    grid.cells[getCellIndex({row:1,col:1}, grid)].items.push(makeItem(1,1,"keys",true));
    grid.cells[getCellIndex({row:7,col:3}, grid)].items.push(makeItem(7,3,"flashlight",true));
    grid.cells[getCellIndex({row:0,col:0}, grid)].items.push(makeItem(0,0,"exit",false,{locked:true}));
    const data = makeItem(0,0,"data",true);
    grid.cells[getCellIndex({row:0,col:6}, grid)].items.push(makeItem(0,6,"filing-cabinet",false,{items:[data]}));
    grid.systemItem = makeItem(7,7,"system",false,{booted:false});
    grid.cells[getCellIndex({row:7,col:7}, grid)].items.push(grid.systemItem);
    grid.cells[getCellIndex({row:3,col:4}, grid)].items.push(makeItem(3,4,"desk",false));
    grid.cells[getCellIndex({row:4,col:4}, grid)].items.push(makeItem(4,4,"couch",false));
    return grid;
};
let player = makePlayer(4, 4);
let grid = makeGrid(player);
let move_counter = {
    moves: 0,
    element: createElement("div", "move-counter"),
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
    const handler = keypressControl[keypressControl.length - 1];
    handler(event);
};

const startGame = function() {
    body.setAttribute("view", "game");
    incrementMoveCounter(0);
    introDialog.render();
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
        body.appendChild(this.element);
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
    {side: "left", avatar: "🧔", text: "There's a flashlight in my desk in the next room over, hurry up, we're counting on you!" },
]);

const runGame = function() {
    renderGrid(grid);
    grid.element.appendChild(move_counter.element);
    addKeypressControl(handlePlayerMove);
    body.addEventListener("keydown", handleKeypress);
    renderLeaderboard();
    showLeaderboard();
};

runGame();