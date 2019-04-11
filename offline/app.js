
const body = document.getElementsByTagName("body")[0];

const createElement = function(tag, classname) {
    let el = document.createElement(tag);
    if (classname) {
        el.classList.add(classname);
    }
    return el;
};

const makeCells = function(height, width) {
    let cells = [];
    for(let row = 0; row < height; row++) {
        for(let col = 0; col < width; col++) {
            let element = createElement("div", "cell");
            cells.push({ element, row, col });
        }
    }
    return cells;
};

const makePlayer = function(row, col) {
    return {
        row,
        col,
        element: createElement("div", "player"),
    };
};

const renderGrid = function(grid) {
    const g = grid.element;
    grid.cells.forEach(cell => {
        g.appendChild(cell.element);
    });
    renderPlayer(grid);
    // last
    body.appendChild(g);
};

const renderPlayer = function(grid) {
    const p = grid.player;
    //https://developer.mozilla.org/en-US/docs/Web/API/Node/removeChild
    if (p.parentNode) {
        p.parentNode.removeChild(p);
    }
    const i = p.row * grid.width + p.col;
    grid.cells[i].element.appendChild(p.element);
}

const handlePlayerMovement = function(event) {
    if (event.keyCode < 37 || event.keyCode > 40) return;
    let offset = null;
    if (event.keyCode == 37) offset = { row: 0, col: -1 }; // left
    else if (event.keyCode == 38) offset = { row: -1, col: 0 }; // up
    else if (event.keyCode == 39) offset = { row: 0, col: 1 }; // right
    else if (event.keyCode == 40) offset = { row: 1, col: 0 }; // down
    let player = grid.player;
    const newRow = player.row + offset.row;
    const newCol = player.col + offset.col;
    if (newRow >= 0 && newRow < grid.height) player.row = newRow;
    if (newCol >= 0 && newCol < grid.width) player.col = newCol;
    renderPlayer(grid);
}
body.addEventListener("keydown", handlePlayerMovement);

let grid = {
    height: 8,
    width: 8,
    element: createElement("div", "grid"),
    cells: makeCells(8, 8),
    player: makePlayer(4, 4),
};

renderGrid(grid);