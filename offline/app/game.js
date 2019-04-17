const body = document.getElementsByTagName("body")[0];

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
        if (item === character) return;
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

const checkWin = function() {
    if (player.row !== 0 || player.col !== 0) return;
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
        setTimeout(() => alert("You have brought the system back online."), 0);
    }
}

const handlePlayerMove = function(event) {
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
    checkWin();
};
body.addEventListener("keydown", handlePlayerMove);

const makeItem = function(row, col, name) {
    return {
        row,
        col,
        name,
        element: createElement("div", ["item", name]),
    }
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
    grid.cells[getCellIndex({row:1,col:1}, grid)].items.push(makeItem(1,1,"keys"));
    grid.cells[getCellIndex({row:0,col:6}, grid)].items.push(makeItem(0,6,"flashlight"));
    grid.cells[getCellIndex({row:7,col:3}, grid)].items.push(makeItem(7,3,"data"));
    return grid;
};
let player = makePlayer(4, 4);
let grid = makeGrid(player);

renderGrid(grid);