"use client"

import { useState, useEffect, useRef } from "react"
import "../styles/BattleTimer.css"

export default function BattleTimer({ timeLimit, onTimeUp }) {
  const [timeRemaining, setTimeRemaining] = useState(timeLimit * 60) // en secondes
  const [isRunning, setIsRunning] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    setTimeRemaining(timeLimit * 60)
    setIsFinished(false)
  }, [timeLimit])

  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsRunning(false)
            setIsFinished(true)
            if (onTimeUp) onTimeUp()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }

    return () => clearInterval(intervalRef.current)
  }, [isRunning, timeRemaining, onTimeUp])

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getTimeStatus = () => {
    const percentage = (timeRemaining / (timeLimit * 60)) * 100
    if (percentage > 50) return "safe"
    if (percentage > 25) return "warning"
    if (percentage > 10) return "danger"
    return "critical"
  }

  const startTimer = () => setIsRunning(true)
  const pauseTimer = () => setIsRunning(false)
  const resetTimer = () => {
    setIsRunning(false)
    setTimeRemaining(timeLimit * 60)
    setIsFinished(false)
  }

  return (
    <div className={`battle-timer ${getTimeStatus()} ${isFinished ? "finished" : ""}`}>
      <div className="timer-display">
        <div className="time-text">{formatTime(timeRemaining)}</div>
        <div className="time-label">{isFinished ? "⏰ TEMPS ÉCOULÉ !" : isRunning ? "🔥 EN COURS" : "⏸️ EN PAUSE"}</div>
      </div>

      <div className="timer-progress">
        <div
          className="progress-bar"
          style={{
            width: `${(timeRemaining / (timeLimit * 60)) * 100}%`,
          }}
        />
      </div>

      <div className="timer-controls">
        {!isRunning ? (
          <button className="timer-btn start" onClick={startTimer} disabled={isFinished}>
            ▶️ Démarrer
          </button>
        ) : (
          <button className="timer-btn pause" onClick={pauseTimer}>
            ⏸️ Pause
          </button>
        )}
        <button className="timer-btn reset" onClick={resetTimer}>
          🔄 Reset
        </button>
      </div>

      {isFinished && (
        <div className="time-up-alert">
          <span>🚨 TEMPS ÉCOULÉ ! 🚨</span>
        </div>
      )}
    </div>
  )
}
