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
    for(let r = 0; r < height; r++) {
        for(let c = 0; c < width; c++) {
            cells.push({ 
                items: [],
                element: createElement("div", "cell"),
            });
        }
    }
    return cells;
};

const makePlayer = function(row, col) {
    return {
        row,
        col,
        element: createElement("div", "player"),
        inventory: [],
    };
}

const renderPlayer = function() {
    if (player.parentNode) {
        player.parentNode.removeChild(player);
    }
    const targetLocation = player.row * grid.width + player.col;
    grid.cells[targetLocation].element.appendChild(player.element);
};

const handlePlayerMove = function(event) {
    if (event.key === "w") player.row = Math.max(0, player.row - 1);
    else if (event.key === "a") player.col = Math.max(0, player.col - 1);
    else if (event.key === "s") player.row = Math.min(grid.height - 1, player.row + 1);
    else if (event.key === "d") player.col = Math.min(grid.width - 1, player.col + 1);
    renderPlayer();
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
    grid.cells[4 * grid.width + 4].items.push(player);
    grid.cells[1 * grid.width + 1].items.push(makeItem(1,1,"widget"));
    grid.cells[0 * grid.width + 6].items.push(makeItem(0,6,"wodget"));
    grid.cells[7 * grid.width + 3].items.push(makeItem(7,3,"sprocket"));
    return grid;
};
let player = makePlayer(4, 4);
let grid = makeGrid(player);

renderGrid(grid);