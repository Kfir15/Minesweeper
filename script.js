let board = [];
let minePositions = [];
let rows = 10;
let cols = 10;
let mineCount = 15;
let revealedCount = 0;
let gameOver = false;
window.startGame = startGame;

function startGame() {
    // get the game settings that the user has chosen
    rows = parseInt(document.getElementById('rows').value);
    cols = parseInt(document.getElementById('cols').value);
    mineCount = parseInt(document.getElementById('mines').value);
    revealedCount = 0;
    gameOver = false;

    board = [];
    minePositions = [];

    const boardDiv = document.getElementById('game-board');
    boardDiv.innerHTML = '';
    document.getElementById('status').textContent = '';

    // set grid size in CSS
    boardDiv.style.gridTemplateColumns = `repeat(${cols}, 30px)`;

    // create the board array and the cells
    for (let r = 0; r < rows; r++) {
        const row = [];
        for (let c = 0; c < cols; c++) {
            const cell = {
                row: r,
                col: c,
                mine: false,
                revealed: false,
                flagged: false,
                element: null,
                adjacentMines: 0,
            };

            // create each cell div and add event listener
            const div = document.createElement('div');
            div.classList.add('cell');
            div.addEventListener('click', () => revealCell(r, c));
            div.addEventListener('contextmenu', e => {
                e.preventDefault();
                toggleFlag(r, c);
            });

            boardDiv.appendChild(div);
            cell.element = div;
            row.push(cell);
        }
        board.push(row);
    }

    // randomly place mines
    let minesPlaced = 0;
    while (minesPlaced < mineCount) {
        const r = Math.floor(Math.random() * rows);
        const c = Math.floor(Math.random() * cols);
        if (!board[r][c].mine) {
            board[r][c].mine = true;
            minePositions.push({ r, c });
            minesPlaced++;
        }
    }

    // calculate how many mines surround each cell
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            board[r][c].adjacentMines = countAdjacentMines(r, c);
        }
    }
}

// counts how many mines are around a specific cell
function countAdjacentMines(r, c) {
    let count = 0;
    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            if (
                nr >= 0 && nr < rows &&
                nc >= 0 && nc < cols &&
                !(dr === 0 && dc === 0) &&
                board[nr][nc].mine
            ) {
                count++;
            }
        }
    }
    return count;
}

// reveal a cell and handles game logic
function revealCell(r, c) {
    const cell = board[r][c];

    // if the cell is on flag, dont reveal it
    if (cell.revealed || cell.flagged || gameOver) return;

    cell.revealed = true;
    cell.element.classList.add('revealed');

    // if the cell is a mine, game over
    if (cell.mine) {
        cell.element.textContent = '💣';
        cell.element.classList.add('mine');
        gameOver = true;
        revealAllMines();
        document.getElementById('status').textContent = '💥 Game Over!';
        return;
    }

    revealedCount++;

    // if there are mines around, show the number
    if (cell.adjacentMines > 0) {
        cell.element.textContent = cell.adjacentMines;
        cell.element.classList.add(`number-${cell.adjacentMines}`);
    } else {
        // if no mines around, auto-reveal surrounding cells
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                const nr = r + dr;
                const nc = c + dc;
                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                    revealCell(nr, nc);
                }
            }
        }
    }

    // check if all safe cells have been revealed
    if (revealedCount === rows * cols - mineCount) {
        // if it did, game over
        document.getElementById('status').textContent = '🎉 You Win!';
        gameOver = true;
    }
}

// put flag on right click
function toggleFlag(r, c) {
    const cell = board[r][c];
    if (cell.revealed || gameOver) return;

    cell.flagged = !cell.flagged;
    cell.element.classList.toggle('flagged');
    cell.element.textContent = cell.flagged ? '🚩' : '';
}

// show all mines after game over
function revealAllMines() {
    for (const { r, c } of minePositions) {
        const cell = board[r][c];
        cell.element.textContent = '💣';
        cell.element.classList.add('mine', 'revealed');
    }
}
