

const createElement = function(tag, classname) {
    let el = document.createElement(tag);
    if (classname) {
        el.classList.add(classname);
    }
    return el;
};

const makeCells = function(height, width) {
    let cells = [];
    for(let r = 0; r < height; r++) {
        for(let c = 0; c < width; c++) {
            let element = createElement("div", "cell");
            cells.push({ element });
        }
    }
    return cells;
};

const renderGrid = function(grid) {
    const g = grid.element;
    grid.cells.forEach(cell => {
        g.appendChild(cell.element);
    });
    document.getElementsByTagName("body")[0].appendChild(g);
};

let grid = {
    element: createElement("div", "grid"),
    cells: makeCells(8, 8),
};

renderGrid(grid);