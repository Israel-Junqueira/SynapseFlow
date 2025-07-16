"use client"

import { Button } from "@/components/ui/button"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Bomb, Flag } from "lucide-react"

interface Cell {
  row: number
  col: number
  isMine: boolean
  isRevealed: boolean
  isFlagged: boolean
  neighborMines: number
}

const BOARD_SIZE = 10
const NUM_MINES = 15

const MinesweeperGame: React.FC = () => {
  const [board, setBoard] = useState<Cell[][]>([])
  const [gameOver, setGameOver] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [flagsLeft, setFlagsLeft] = useState(NUM_MINES)

  const initializeBoard = useCallback(() => {
    const newBoard: Cell[][] = Array(BOARD_SIZE)
      .fill(null)
      .map((_, r) =>
        Array(BOARD_SIZE)
          .fill(null)
          .map((_, c) => ({
            row: r,
            col: c,
            isMine: false,
            isRevealed: false,
            isFlagged: false,
            neighborMines: 0,
          })),
      )

    // Place mines
    let minesPlaced = 0
    while (minesPlaced < NUM_MINES) {
      const r = Math.floor(Math.random() * BOARD_SIZE)
      const c = Math.floor(Math.random() * BOARD_SIZE)
      if (!newBoard[r][c].isMine) {
        newBoard[r][c].isMine = true
        minesPlaced++
      }
    }

    // Calculate neighbor mines
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (!newBoard[r][c].isMine) {
          let count = 0
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              if (dr === 0 && dc === 0) continue
              const nr = r + dr
              const nc = c + dc
              if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && newBoard[nr][nc].isMine) {
                count++
              }
            }
          }
          newBoard[r][c].neighborMines = count
        }
      }
    }

    setBoard(newBoard)
    setGameOver(false)
    setGameWon(false)
    setFlagsLeft(NUM_MINES)
  }, [])

  // AQUI ESTÁ A MUDANÇA: Chamar initializeBoard APENAS no cliente
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Garante que roda apenas no navegador
      initializeBoard()
    }
  }, [initializeBoard])

  const revealCell = useCallback(
    (row: number, col: number) => {
      if (gameOver || gameWon || board[row][col].isRevealed || board[row][col].isFlagged) {
        return
      }

      const newBoard = board.map((row) => [...row])
      const cell = newBoard[row][col]
      cell.isRevealed = true

      if (cell.isMine) {
        setGameOver(true)
        // Reinicia o jogo imediatamente ao clicar em uma bomba
        setTimeout(() => initializeBoard(), 500) // Pequeno delay para ver a bomba antes de reiniciar
        return
      }

      if (cell.neighborMines === 0) {
        // Auto-reveal neighbors if no mines around
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue
            const nr = row + dr
            const nc = col + dc
            if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && !newBoard[nr][nc].isRevealed) {
              revealCell(nr, nc) // Recursive call
            }
          }
        }
      }
      setBoard(newBoard)
    },
    [board, gameOver, gameWon, initializeBoard],
  )

  const checkGameWon = useCallback(() => {
    let revealedCount = 0
    let flaggedMines = 0
    board.forEach((row) =>
      row.forEach((cell) => {
        if (cell.isRevealed && !cell.isMine) {
          revealedCount++
        }
        if (cell.isFlagged && cell.isMine) {
          flaggedMines++
        }
      }),
    )

    if (revealedCount === BOARD_SIZE * BOARD_SIZE - NUM_MINES) {
      setGameWon(true)
    }
  }, [board])

  useEffect(() => {
    if (!gameOver && !gameWon) {
      checkGameWon()
    }
  }, [board, gameOver, gameWon, checkGameWon])

  const handleClick = (row: number, col: number) => {
    console.log(`Click: ${row}, ${col}`) // Log para depuração
    if (gameOver || gameWon) return
    revealCell(row, col)
  }

  const handleRightClick = (e: React.MouseEvent, row: number, col: number) => {
    e.preventDefault()
    console.log(`Right Click: ${row}, ${col}`) // Log para depuração
    if (gameOver || gameWon || board[row][col].isRevealed) return

    const newBoard = board.map((r) => [...r])
    const cell = newBoard[row][col]

    if (cell.isFlagged) {
      cell.isFlagged = false
      setFlagsLeft((prev) => prev + 1)
    } else if (flagsLeft > 0) {
      cell.isFlagged = true
      setFlagsLeft((prev) => prev - 1)
    }
    setBoard(newBoard)
  }

  const getCellContent = (cell: Cell) => {
    if (cell.isRevealed) {
      if (cell.isMine) {
        return <Bomb className="h-4 w-4 text-red-500" />
      }
      return cell.neighborMines > 0 ? (
        <span
          className={`font-bold ${
            cell.neighborMines === 1
              ? "text-blue-400"
              : cell.neighborMines === 2
                ? "text-green-400"
                : cell.neighborMines === 3
                  ? "text-red-400"
                  : "text-purple-400"
          }`}
        >
          {cell.neighborMines}
        </span>
      ) : (
        ""
      )
    }
    if (cell.isFlagged) {
      return <Flag className="h-4 w-4 text-yellow-400" />
    }
    return ""
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-[#1a1a2e]/70 rounded-lg shadow-xl border border-[#3a3a5a] text-gray-100">
      <h2 className="text-2xl font-bold text-[#a020f0] mb-4">Campo Minado</h2>
      <div className="text-lg mb-2">
        Bandeiras Restantes: <span className="font-bold text-yellow-400">{flagsLeft}</span>
      </div>
      {gameOver && <div className="text-red-500 text-xl font-bold mb-2">GAME OVER!</div>}
      {gameWon && <div className="text-green-500 text-xl font-bold mb-2">VOCÊ VENCEU!</div>}
      <div
        className="grid gap-0.5"
        style={{
          gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
        }}
      >
        {board.map((row, rIdx) =>
          row.map((cell, cIdx) => (
            <div
              key={`${rIdx}-${cIdx}`}
              className={`w-6 h-6 flex items-center justify-center text-sm cursor-pointer select-none transition-all duration-100
                ${
                  cell.isRevealed
                    ? cell.isMine
                      ? "bg-red-900/50"
                      : "bg-[#3a3a5a]/50"
                    : "bg-[#3a3a5a] border-t border-l border-[#4a4a6a] border-b-2 border-r-2 border-[#1a1a2e] active:border-b active:border-r active:border-[#4a4a6a] active:bg-[#1a1a2e] hover:bg-[#4a4a6a]"
                }
                ${gameOver && cell.isMine && !cell.isRevealed ? "bg-red-900/50" : ""}
              `}
              onClick={() => handleClick(rIdx, cIdx)}
              onContextMenu={(e) => handleRightClick(e, rIdx, cIdx)}
            >
              {getCellContent(cell)}
            </div>
          )),
        )}
      </div>
      {(gameOver || gameWon) && (
        <Button onClick={initializeBoard} className="mt-4 bg-[#a020f0] hover:bg-[#8a1acb] text-white">
          Reiniciar Jogo
        </Button>
      )}
    </div>
  )
}

export default MinesweeperGame
