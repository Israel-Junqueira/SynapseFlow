"use client"

import type React from "react"
import { useRef, useEffect, useState, useCallback } from "react"

const CANVAS_WIDTH = 300
const CANVAS_HEIGHT = 200
const PADDLE_WIDTH = 5
const PADDLE_HEIGHT = 40
const BALL_SIZE = 5
const PADDLE_SPEED = 2 // Velocidade do jogador
const AI_SPEED = 1.5 // Velocidade da IA (menor que a do jogador para ser batível)
const BALL_SPEED_INITIAL = 2

const PongGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameRunning, setGameRunning] = useState(true)

  // Usando useRef para o estado do jogo que muda rapidamente
  const player1Y = useRef(CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2)
  const player2Y = useRef(CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2)
  const ballX = useRef(CANVAS_WIDTH / 2)
  const ballY = useRef(CANVAS_HEIGHT / 2)
  const ballDx = useRef(BALL_SPEED_INITIAL)
  const ballDy = useRef(BALL_SPEED_INITIAL)

  // Input state
  const keysPressed = useRef<{ [key: string]: boolean }>({})

  const resetBall = useCallback(() => {
    ballX.current = CANVAS_WIDTH / 2
    ballY.current = CANVAS_HEIGHT / 2
    ballDx.current = BALL_SPEED_INITIAL * (Math.random() > 0.5 ? 1 : -1) // Direção X aleatória
    ballDy.current = BALL_SPEED_INITIAL * (Math.random() > 0.5 ? 1 : -1) // Direção Y aleatória
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = true
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = false
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number

    const gameLoop = () => {
      if (!gameRunning) return

      // Update player 1 paddle position based on input (W/S)
      if (keysPressed.current["w"]) {
        player1Y.current = Math.max(0, player1Y.current - PADDLE_SPEED)
      }
      if (keysPressed.current["s"]) {
        player1Y.current = Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, player1Y.current + PADDLE_SPEED)
      }

      // Update AI paddle position (player 2)
      // AI follows the ball's Y position
      if (ballY.current + BALL_SIZE / 2 < player2Y.current + PADDLE_HEIGHT / 2) {
        // Ball is above paddle center
        player2Y.current = Math.max(0, player2Y.current - AI_SPEED)
      } else if (ballY.current + BALL_SIZE / 2 > player2Y.current + PADDLE_HEIGHT / 2) {
        // Ball is below paddle center
        player2Y.current = Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, player2Y.current + AI_SPEED)
      }

      // Update ball position
      ballX.current += ballDx.current
      ballY.current += ballDy.current

      // Ball collision with top/bottom walls
      if (ballY.current <= 0 || ballY.current + BALL_SIZE >= CANVAS_HEIGHT) {
        ballDy.current = -ballDy.current
      }

      // Ball collision with paddles
      // Player 1 (left paddle)
      if (
        ballX.current <= PADDLE_WIDTH &&
        ballY.current + BALL_SIZE >= player1Y.current &&
        ballY.current <= player1Y.current + PADDLE_HEIGHT
      ) {
        ballDx.current = -ballDx.current
        ballX.current = PADDLE_WIDTH // Prevent sticking
      }
      // Player 2 (right paddle - AI)
      if (
        ballX.current + BALL_SIZE >= CANVAS_WIDTH - PADDLE_WIDTH &&
        ballY.current + BALL_SIZE >= player2Y.current &&
        ballY.current <= player2Y.current + PADDLE_HEIGHT
      ) {
        ballDx.current = -ballDx.current
        ballX.current = CANVAS_WIDTH - PADDLE_WIDTH - BALL_SIZE // Prevent sticking
      }

      // Ball out of bounds (reset)
      if (ballX.current < 0 || ballX.current + BALL_SIZE > CANVAS_WIDTH) {
        resetBall()
      }

      // Drawing
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
      ctx.fillStyle = "#FFF" // White color for elements

      // Draw paddles
      ctx.fillRect(0, player1Y.current, PADDLE_WIDTH, PADDLE_HEIGHT)
      ctx.fillRect(CANVAS_WIDTH - PADDLE_WIDTH, player2Y.current, PADDLE_WIDTH, PADDLE_HEIGHT)

      // Draw ball
      ctx.fillRect(ballX.current, ballY.current, BALL_SIZE, BALL_SIZE)

      animationFrameId = requestAnimationFrame(gameLoop)
    }

    resetBall() // Initial ball reset
    animationFrameId = requestAnimationFrame(gameLoop)

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [gameRunning, resetBall]) // Dependências mínimas para evitar recriação desnecessária da função

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-[#1a1a2e]/70 rounded-lg shadow-xl border border-[#3a3a5a] text-gray-100">
      <h2 className="text-2xl font-bold text-[#a020f0] mb-4">Pong</h2>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="bg-black border border-[#3a3a5a]"
      ></canvas>
      <div className="mt-4 text-sm text-gray-200">
        <p>Seu Jogador (Esquerdo): W (Cima), S (Baixo)</p>
        <p>Oponente (Direito): IA</p>
      </div>
    </div>
  )
}

export default PongGame
