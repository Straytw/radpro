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

const TETRIS_COLS = 10;
const TETRIS_ROWS = 18;

const tetrominoes = [
  {
    type: 'I',
    color: '#8ab4f8',
    matrix: [
      [1, 1, 1, 1]
    ]
  },
  {
    type: 'O',
    color: '#fdd663',
    matrix: [
      [1, 1],
      [1, 1]
    ]
  },
  {
    type: 'T',
    color: '#9aa0a6',
    matrix: [
      [0, 1, 0],
      [1, 1, 1]
    ]
  },
  {
    type: 'S',
    color: '#81c995',
    matrix: [
      [0, 1, 1],
      [1, 1, 0]
    ]
  },
  {
    type: 'Z',
    color: '#f28b82',
    matrix: [
      [1, 1, 0],
      [0, 1, 1]
    ]
  },
  {
    type: 'J',
    color: '#8ab4f8',
    matrix: [
      [1, 0, 0],
      [1, 1, 1]
    ]
  },
  {
    type: 'L',
    color: '#c4a7f5',
    matrix: [
      [0, 0, 1],
      [1, 1, 1]
    ]
  }
];

const state = {
  mode: 'chess',
  score: 0,
  lines: 0,
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
  tetrisBoard: Array.from({ length: TETRIS_ROWS }, () => Array(TETRIS_COLS).fill(null)),
  currentPiece: null,
  gameOver: false,
  activeCell: null
};

function formatTime(value) {
  const minutes = String(Math.floor(value / 60)).padStart(2, '0');
  const seconds = String(value % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function cloneMatrix(matrix) {
  return matrix.map((row) => [...row]);
}

function createPiece() {
  const template = tetrominoes[Math.floor(Math.random() * tetrominoes.length)];
  const matrix = cloneMatrix(template.matrix);

  return {
    type: template.type,
    color: template.color,
    matrix,
    x: Math.floor((TETRIS_COLS - matrix[0].length) / 2),
    y: -1
  };
}

function collides(piece, offsetX = 0, offsetY = 0, nextMatrix = piece.matrix) {
  for (let y = 0; y < nextMatrix.length; y++) {
    for (let x = 0; x < nextMatrix[y].length; x++) {
      if (!nextMatrix[y][x]) continue;

      const boardX = piece.x + x + offsetX;
      const boardY = piece.y + y + offsetY;

      if (boardX < 0 || boardX >= TETRIS_COLS || boardY >= TETRIS_ROWS) {
        return true;
      }

      if (boardY >= 0 && state.tetrisBoard[boardY][boardX]) {
        return true;
      }
    }
  }

  return false;
}

function rotateMatrix(matrix) {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const rotated = Array.from({ length: cols }, () => Array(rows).fill(0));

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      rotated[x][rows - 1 - y] = matrix[y][x];
    }
  }

  return rotated;
}

function mergePiece() {
  if (!state.currentPiece) return;

  for (let y = 0; y < state.currentPiece.matrix.length; y++) {
    for (let x = 0; x < state.currentPiece.matrix[y].length; x++) {
      if (!state.currentPiece.matrix[y][x]) continue;

      const boardX = state.currentPiece.x + x;
      const boardY = state.currentPiece.y + y;

      if (boardY >= 0) {
        state.tetrisBoard[boardY][boardX] = state.currentPiece.color;
      }
    }
  }
}

function clearLines() {
  let removed = 0;

  for (let y = TETRIS_ROWS - 1; y >= 0; y--) {
    if (state.tetrisBoard[y].every(Boolean)) {
      state.tetrisBoard.splice(y, 1);
      state.tetrisBoard.unshift(Array(TETRIS_COLS).fill(null));
      removed += 1;
      y += 1;
    }
  }

  if (removed > 0) {
    state.lines += removed;
    state.score += removed * 100;
  }
}

function spawnPiece() {
  state.currentPiece = createPiece();
  if (collides(state.currentPiece, 0, 0)) {
    state.gameOver = true;
  }
}

function movePiece(dx, dy) {
  if (!state.currentPiece || state.gameOver) return;

  const nextX = state.currentPiece.x + dx;
  const nextY = state.currentPiece.y + dy;

  if (!collides(state.currentPiece, dx, dy)) {
    state.currentPiece.x = nextX;
    state.currentPiece.y = nextY;
    renderBoard();
    return;
  }

  if (dy > 0) {
    mergePiece();
    clearLines();
    spawnPiece();
    renderBoard();
  }
}

function rotatePiece() {
  if (!state.currentPiece || state.gameOver) return;

  const rotated = rotateMatrix(state.currentPiece.matrix);

  if (!collides(state.currentPiece, 0, 0, rotated)) {
    state.currentPiece.matrix = rotated;
  } else if (!collides(state.currentPiece, 1, 0, rotated)) {
    state.currentPiece.x += 1;
    state.currentPiece.matrix = rotated;
  } else if (!collides(state.currentPiece, -1, 0, rotated)) {
    state.currentPiece.x -= 1;
    state.currentPiece.matrix = rotated;
  }

  renderBoard();
}

function stepTetris() {
  if (state.mode !== 'tetris' || state.gameOver) return;

  if (!state.currentPiece) {
    spawnPiece();
  }

  movePiece(0, 1);
}

function setMode(mode) {
  state.mode = mode;
  modeButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.mode === mode);
  });
  statusTextEl.textContent = mode === 'chess' ? 'Chess' : 'Tetris';

  if (mode === 'tetris' && !state.currentPiece) {
    spawnPiece();
  }

  renderBoard();
}

function drawChessCell(value, x, y) {
  const piece = value || '';
  const colorClass = piece.includes('white') ? 'white' : piece.includes('black') ? 'black' : '';
  const label = piece ? (
    piece.includes('pawn') ? chessPieces[piece.includes('white') ? 'white' : 'black'].pawn :
    piece.includes('rook') ? chessPieces[piece.includes('white') ? 'white' : 'black'].rook :
    piece.includes('knight') ? chessPieces[piece.includes('white') ? 'white' : 'black'].knight :
    piece.includes('bishop') ? chessPieces[piece.includes('white') ? 'white' : 'black'].bishop :
    piece.includes('queen') ? chessPieces[piece.includes('white') ? 'white' : 'black'].queen :
    chessPieces[piece.includes('white') ? 'white' : 'black'].king
  ) : '';

  const cell = document.createElement('div');
  cell.className = `cell ${((x + y) % 2 === 0) ? 'light' : 'dark'} ${piece ? 'chess-piece' : ''} ${colorClass}`.trim();
  cell.textContent = label;
  return cell;
}

function drawTetrisCell(x, y) {
  const cell = document.createElement('div');
  const boardValue = state.tetrisBoard[y]?.[x] || null;
  const activeValue = state.currentPiece && state.currentPiece.matrix[y - state.currentPiece.y]?.[x - state.currentPiece.x];
  const fillColor = boardValue || (activeValue ? state.currentPiece.color : null);

  const classes = ['cell'];
  classes.push((x + y) % 2 === 0 ? 'light' : 'dark');
  if (fillColor) classes.push('tetris-piece');

  cell.className = classes.join(' ');
  if (fillColor) {
    cell.style.background = fillColor;
    cell.style.boxShadow = 'inset 0 0 0 1px rgba(255,255,255,0.08)';
  }

  return cell;
}

function renderBoard() {
  boardEl.innerHTML = '';
  boardEl.classList.toggle('tetris-board', state.mode === 'tetris');
  boardEl.classList.toggle('chess-board', state.mode === 'chess');

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
    for (let y = 0; y < TETRIS_ROWS; y++) {
      for (let x = 0; x < TETRIS_COLS; x++) {
        const cell = drawTetrisCell(x, y);
        boardEl.appendChild(cell);
      }
    }
  }

  scoreValueEl.textContent = String(state.score);
  timeValueEl.textContent = formatTime(state.time);
}

segmentButtons.forEach((button) => {
  button.addEventListener('click', () => {
    segmentButtons.forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
  });
});

modeButtons.forEach((button) => {
  button.addEventListener('click', () => setMode(button.dataset.mode));
});

document.addEventListener('keydown', (event) => {
  if (state.mode === 'tetris') {
    switch (event.key) {
      case 'ArrowLeft':
        movePiece(-1, 0);
        break;
      case 'ArrowRight':
        movePiece(1, 0);
        break;
      case 'ArrowDown':
        movePiece(0, 1);
        break;
      case 'ArrowUp':
        rotatePiece();
        break;
      case ' ':
        while (!collides(state.currentPiece, 0, 1)) {
          state.currentPiece.y += 1;
        }
        movePiece(0, 1);
        break;
      default:
        break;
    }
  }
});

setInterval(() => {
  if (state.mode === 'tetris') {
    stepTetris();
  } else {
    state.time = (state.time + 1) % 3600;
  }
  renderBoard();
}, 550);

setMode('chess');
