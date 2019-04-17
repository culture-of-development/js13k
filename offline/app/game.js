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
            cells.push({
                row,
                col,
                items: [],
                element: createElement("div", "cell"),
            });
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

const pickUpItems = function(cell, character) {
    let inventoryItems = character.inventory.items;
    let inventoryElement = character.inventory.element;
    cell.items.forEach(item => {
        if (!item.collectible) return;
        item.row = 0;
        item.col = inventoryItems.length;
        inventoryItems.push(item);
        unrender(item);
        inventoryElement.appendChild(item.element);
        playSfx(item.name);
    });
    inventoryItems.forEach(item => {
        arrayRemove(cell.items, item);
    });
}

const checkWin = function(cell) {
    var doors = cell.items.filter(i => i.name === "door");
    if (doors.length === 0) return;
    const itemsNeeded = { "keys": false, "flashlight": false, "data": false };
    player.inventory.items.forEach(item => {
        if (itemsNeeded.hasOwnProperty(item.name)) {
            itemsNeeded[item.name] = true;
        }
    })
    let missingItems = Object.keys(itemsNeeded).filter(i => !itemsNeeded[i]);
    console.log(missingItems);
    if (missingItems.length === 0) {
        playSfx("win");
        setTimeout(() => {
            alert("You have brought the system back online.");
            showLeaderboard();
        }, 0);
    }
}

const handlePlayerMove = function(event) {
    incrementMoveCounter(1);
    const oldCell = getObjectCell(player);
    if (event.key === "w") player.row = Math.max(0, player.row - 1);
    else if (event.key === "a") player.col = Math.max(0, player.col - 1);
    else if (event.key === "s") player.row = Math.min(grid.height - 1, player.row + 1);
    else if (event.key === "d") player.col = Math.min(grid.width - 1, player.col + 1);
    const newCell = getObjectCell(player);
    if (oldCell != newCell) {
        arrayRemove(oldCell.items, player);
        newCell.items.push(player);
    }
    pickUpItems(newCell, player);
    renderPlayer();
    checkWin(newCell);
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
    grid.cells[getCellIndex({row:0,col:6}, grid)].items.push(makeItem(0,6,"flashlight",true));
    grid.cells[getCellIndex({row:7,col:3}, grid)].items.push(makeItem(7,3,"data",true));
    grid.cells[getCellIndex({row:0,col:0}, grid)].items.push(makeItem(0,0,"door",false,{locked:true}));
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

const startGame = function() {
    body.setAttribute("view", "game");
    body.addEventListener("keydown", handlePlayerMove);
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
        clickToContinueElement.innerHTML = "Click to continue...";
        this.element.appendChild(clickToContinueElement);
        this.moveTextNext();
    }

    render() {
        body.appendChild(this.element);
    }

    unrender() {
        unrender(this);
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
    incrementMoveCounter(0);
    introDialog.render();
    renderLeaderboard();
    showLeaderboard();
};

runGame();