"use client"

import "../styles/ScoreBoard.css"

export default function ScoreBoard({ candidates }) {
  const sortedCandidates = [...candidates].sort((a, b) => {
    if (a.eliminated && !b.eliminated) return 1
    if (!a.eliminated && b.eliminated) return -1
    return b.averageScore - a.averageScore
  })

  return (
    <div className="scoreboard">
      <h2>📊 Tableau des Scores</h2>

      <div className="scoreboard-table">
        <div className="table-header">
          <span>Rang</span>
          <span>Candidat</span>
          <span>Statut</span>
          <span>Moy. Générale</span>
          <span>Dernière Épreuve</span>
          <span>Battles</span>
          <span>Évolution</span>
        </div>

        {sortedCandidates.map((candidate, index) => (
          <div key={candidate.id} className={`table-row ${candidate.eliminated ? "eliminated" : ""}`}>
            <span className="rank">{!candidate.eliminated ? index + 1 : "❌"}</span>
            <span className="name">
              {candidate.eliminated ? "💀" : "👨‍🍳"} {candidate.name}
            </span>
            <span className={`status ${candidate.eliminated ? "eliminated" : "active"}`}>
              {candidate.eliminated ? `Éliminé (Épreuve ${candidate.eliminatedAtBattle})` : "En course"}
            </span>
            <span className="average">{candidate.averageScore.toFixed(1)}/20</span>
            <span className="last-battle">
              {candidate.battleScores.length > 0
                ? `${candidate.battleScores[candidate.battleScores.length - 1].toFixed(1)}/20`
                : "N/A"}
            </span>
            <span className="battles">{candidate.scores.length}</span>
            <div className="evolution">
              {candidate.battleScores.map((score, i) => (
                <span
                  key={i}
                  className={`score-point ${score >= 15 ? "high" : score >= 10 ? "medium" : "low"}`}
                  title={`Épreuve ${i + 1}: ${score.toFixed(1)}/20`}
                >
                  {score.toFixed(1)}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
