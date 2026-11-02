const boardEl = document.getElementById('gameBoard');
const statusTextEl = document.getElementById('statusText');
const scoreValueEl = document.getElementById('scoreValue');
const timeValueEl = document.getElementById('timeValue');

const modeButtons = [...document.querySelectorAll('.mode-card')];
const segmentButtons = [...document.querySelectorAll('.seg')];

const chessPieces = {
  white: {
    king: '♔', queen: '♕', rook: '♖', bishop: '♗', knight: '♘', pawn: '♙'
  },
  black: {
    king: '♚', queen: '♛', rook: '♜', bishop: '♝', knight: '♞', pawn: '♟'
  }
};

const state = {
  mode: 'chess',
  score: 0,
  time: 202,
  chessBoard: [
    ['black-rook', 'black-knight', 'black-bishop', 'black-queen', 'black-king', 'black-bishop', 'black-knight', 'black-rook'],
    Array(8).fill('black-pawn'),
    Array(8).fill(''),
    Array(8).fill(''),
    Array(8).fill(''),
    Array(8).fill(''),
    Array(8).fill('white-pawn'),
    ['white-rook', 'white-knight', 'white-bishop', 'white-queen', 'white-king', 'white-bishop', 'white-knight', 'white-rook']
  ],
  tetrisBoard: Array.from({ length: 8 }, () => Array(8).fill('')),
  fallingTetrimino: null,
  activeCell: null,
  selectedColor: 'light'
};

const tetrominoes = [
  { type: 'I', color: '#8ab4f8', cells: [[0,0],[1,0],[2,0],[3,0]] },
  { type: 'L', color: '#fdd663', cells: [[0,0],[0,1],[1,1],[2,1]] },
  { type: 'J', color: '#81c995', cells: [[2,0],[0,1],[1,1],[2,1]] },
  { type: 'O', color: '#f28b82', cells: [[0,0],[1,0],[0,1],[1,1]] },
  { type: 'T', color: '#9aa0a6', cells: [[1,0],[0,1],[1,1],[2,1]] },
  { type: 'S', color: '#8ab4f8', cells: [[1,0],[2,0],[0,1],[1,1]] },
  { type: 'Z', color: '#f28b82', cells: [[0,0],[1,0],[1,1],[2,1]] }
];

function formatTime(value) {
  const minutes = String(Math.floor(value / 60)).padStart(2, '0');
  const seconds = String(value % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function setMode(mode) {
  state.mode = mode;
  modeButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.mode === mode);
  });
  statusTextEl.textContent = mode === 'chess' ? 'Chess' : 'Tetris';

  if (mode === 'tetris') {
    generateTetrimino();
  }

  renderBoard();
}

function generateTetrimino() {
  const template = tetrominoes[Math.floor(Math.random() * tetrominoes.length)];
  state.fallingTetrimino = {
    ...template,
    x: 2,
    y: 0
  };
}

function drawChessCell(value, x, y) {
  const piece = value || '';
  const colorClass = piece.includes('white') ? 'white' : piece.includes('black') ? 'black' : '';
  const label = piece ? (piece.includes('pawn') ? chessPieces[piece.includes('white') ? 'white' : 'black'].pawn :
    piece.includes('rook') ? chessPieces[piece.includes('white') ? 'white' : 'black'].rook :
    piece.includes('knight') ? chessPieces[piece.includes('white') ? 'white' : 'black'].knight :
    piece.includes('bishop') ? chessPieces[piece.includes('white') ? 'white' : 'black'].bishop :
    piece.includes('queen') ? chessPieces[piece.includes('white') ? 'white' : 'black'].queen :
    chessPieces[piece.includes('white') ? 'white' : 'black'].king) : '';

  const cell = document.createElement('div');
  cell.className = `cell ${((x + y) % 2 === 0) ? 'light' : 'dark'} ${piece ? 'chess-piece' : ''} ${colorClass}`.trim();
  cell.textContent = label;
  return cell;
}

function drawTetrisCell(item, x, y) {
  const cell = document.createElement('div');
  const isFilled = !!item;
  const active = state.fallingTetrimino && state.fallingTetrimino.cells.some(([cx, cy]) => {
    return x === state.fallingTetrimino.x + cx && y === state.fallingTetrimino.y + cy;
  });

  cell.className = `cell ${((x + y) % 2 === 0) ? 'light' : 'dark'} ${isFilled || active ? 'tetris-piece' : ''}`.trim();
  if (isFilled || active) {
    cell.style.background = item || state.fallingTetrimino.color;
    cell.style.boxShadow = 'inset 0 0 0 1px rgba(255,255,255,0.08)';
  }
  return cell;
}

function renderBoard() {
  boardEl.innerHTML = '';

  if (state.mode === 'chess') {
    state.chessBoard.forEach((row, y) => {
      row.forEach((piece, x) => {
        const cell = drawChessCell(piece, x, y);
        if (state.activeCell && state.activeCell.x === x && state.activeCell.y === y) {
          cell.classList.add('selected');
        }
        boardEl.appendChild(cell);
      });
    });
  } else {
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const cell = drawTetrisCell(state.tetrisBoard[y][x], x, y);
        boardEl.appendChild(cell);
      }
    }
  }

  scoreValueEl.textContent = String(state.score);
  timeValueEl.textContent = formatTime(state.time);
}

function moveTetrimino(dx, dy) {
  if (!state.fallingTetrimino) return;

  const next = state.fallingTetrimino.cells.map(([cx, cy]) => [state.fallingTetrimino.x + cx + dx, state.fallingTetrimino.y + cy + dy]);
  const isValid = next.every(([x, y]) => x >= 0 && x < 8 && y >= 0 && y < 8 && !state.tetrisBoard[y][x]);

  if (!isValid) {
    if (dy > 0) {
      state.fallingTetrimino.cells.forEach(([cx, cy]) => {
        const px = state.fallingTetrimino.x + cx;
        const py = state.fallingTetrimino.y + cy;
        if (py >= 0 && py < 8) {
          state.tetrisBoard[py][px] = state.fallingTetrimino.color;
        }
      });
      state.score += 10;
      generateTetrimino();
    }
    return;
  }

  state.fallingTetrimino.x += dx;
  state.fallingTetrimino.y += dy;
  renderBoard();
}

function stepTetris() {
  if (state.mode !== 'tetris') return;
  moveTetrimino(0, 1);
}

modeButtons.forEach((button) => {
  button.addEventListener('click', () => setMode(button.dataset.mode));
});

segmentButtons.forEach((button) => {
  button.addEventListener('click', () => {
    segmentButtons.forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
  });
});

document.addEventListener('keydown', (event) => {
  if (state.mode === 'tetris') {
    if (event.key === 'ArrowLeft') moveTetrimino(-1, 0);
    if (event.key === 'ArrowRight') moveTetrimino(1, 0);
    if (event.key === 'ArrowDown') moveTetrimino(0, 1);
    if (event.key === 'ArrowUp') generateTetrimino();
  }
});

setInterval(() => {
  if (state.mode === 'tetris') {
    stepTetris();
  } else {
    state.time = (state.time + 1) % 3600;
  }
  renderBoard();
}, 600);

renderBoard();
