"use client";

import { useState } from "react";
import "../styles/EnhancedScoreBoard.css";

export default function EnhancedScoreBoard({ candidates }) {
  const [sortBy, setSortBy] = useState("average"); // average, elimination, name

  // Fonction pour déterminer le rang précis selon le nombre de candidats restants
  const getPreciseRank = (remainingCount, isEliminated, eliminatedAtBattle) => {
    if (isEliminated) {
      // Pour les éliminés, on détermine leur rang final
      if (remainingCount === 1)
        return { status: "🏆 VAINQUEUR", color: "#ffd700", icon: "👑" };
      if (remainingCount === 2)
        return { status: "2ème place", color: "#c0c0c0", icon: "🥈" };
      if (remainingCount === 3)
        return { status: "3ème place", color: "#cd7f32", icon: "🥉" };
      if (remainingCount === 4)
        return { status: "4ème place", color: "#ff8a65", icon: "4️⃣" };
      if (remainingCount === 5)
        return { status: "5ème place", color: "#ffab91", icon: "5️⃣" };
      if (remainingCount === 6)
        return { status: "6ème place", color: "#ffccbc", icon: "6️⃣" };
      if (remainingCount <= 8)
        return { status: "Demi-finaliste", color: "#ff6b6b", icon: "🔥" };
      if (remainingCount <= 12)
        return { status: "Quart de finale", color: "#4ecdc4", icon: "⚡" };
      if (remainingCount <= 16)
        return { status: "8ème de finale", color: "#74b9ff", icon: "🎯" };
      return {
        status: `Éliminé épreuve ${eliminatedAtBattle}`,
        color: "#999",
        icon: "❌",
      };
    }

    // Pour les candidats encore en course
    if (remainingCount === 1)
      return { status: "🏆 VAINQUEUR", color: "#ffd700", icon: "👑" };
    if (remainingCount === 2)
      return { status: "Finaliste", color: "#c0c0c0", icon: "🥈" };
    if (remainingCount === 3)
      return { status: "Demi-finaliste", color: "#cd7f32", icon: "🥉" };
    if (remainingCount === 4)
      return { status: "Demi-finaliste", color: "#ff8a65", icon: "🔥" };
    if (remainingCount <= 6)
      return { status: "Quart de finale", color: "#ff6b6b", icon: "⚡" };
    if (remainingCount <= 8)
      return { status: "Quart de finale", color: "#4ecdc4", icon: "🎯" };
    if (remainingCount <= 12)
      return { status: "8ème de finale", color: "#74b9ff", icon: "🚀" };
    if (remainingCount <= 16)
      return { status: "16ème de finale", color: "#a29bfe", icon: "⭐" };
    return { status: "En course", color: "#4caf50", icon: "✅" };
  };

  const getSortedCandidates = () => {
    const sorted = [...candidates];
    const activeCandidates = candidates.filter((c) => !c.eliminated);

    switch (sortBy) {
      case "average":
        return sorted.sort((a, b) => {
          if (a.eliminated && !b.eliminated) return 1;
          if (!a.eliminated && b.eliminated) return -1;
          return b.averageScore - a.averageScore;
        });
      case "elimination":
        return sorted.sort((a, b) => {
          if (!a.eliminated && !b.eliminated)
            return b.averageScore - a.averageScore;
          if (a.eliminated && !b.eliminated) return 1;
          if (!a.eliminated && b.eliminated) return -1;
          return (b.eliminatedAtBattle || 0) - (a.eliminatedAtBattle || 0);
        });
      case "name":
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return sorted;
    }
  };

  const sortedCandidates = getSortedCandidates();
  const activeCandidates = candidates.filter((c) => !c.eliminated);

  return (
    <div className="enhanced-scoreboard">
      <div className="scoreboard-header">
        <h2>🏆 Tableau des Scores</h2>
        <div className="sort-controls">
          <label>Trier par :</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="average">🎯 Moyenne générale</option>
            <option value="elimination">📅 Ordre d'élimination</option>
            <option value="name">📝 Nom alphabétique</option>
          </select>
        </div>
      </div>

      <div className="scoreboard-stats">
        <div className="stat-card">
          <span className="stat-number">{activeCandidates.length}</span>
          <span className="stat-label">En course</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">
            {candidates.filter((c) => c.eliminated).length}
          </span>
          <span className="stat-label">Éliminés</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">
            {candidates.length > 0
              ? (
                  candidates.reduce((sum, c) => sum + c.averageScore, 0) /
                  candidates.length
                ).toFixed(1)
              : "0.0"}
          </span>
          <span className="stat-label">Moyenne générale</span>
        </div>
      </div>

      <div className="scoreboard-table">
        <div className="table-header">
          <span>Rang</span>
          <span>Candidat</span>
          <span>Statut</span>
          <span>Moy. Générale</span>
          <span>Dernière Épreuve</span>
          <span>Épreuves</span>
          <span>Évolution</span>
        </div>

        {sortedCandidates.map((candidate, index) => {
          const competitionStatus = getPreciseRank(
            activeCandidates.length + (candidate.eliminated ? 1 : 0),
            candidate.eliminated,
            candidate.eliminatedAtBattle
          );

          return (
            <div
              key={candidate.id}
              className={`table-row ${
                candidate.eliminated ? "eliminated" : ""
              }`}
            >
              <span className="rank">
                {!candidate.eliminated ? (
                  <span className="active-rank">#{index + 1}</span>
                ) : (
                  <span className="eliminated-rank">❌</span>
                )}
              </span>
              <span className="name">
                <span className="candidate-icon">
                  {candidate.eliminated ? "💀" : "👨‍🍳"}
                </span>
                <span className="candidate-name">{candidate.name}</span>
              </span>
              <span className="status">
                <div
                  className="status-badge"
                  style={{ backgroundColor: competitionStatus.color }}
                >
                  <span className="status-icon">{competitionStatus.icon}</span>
                  <span className="status-text">
                    {competitionStatus.status}
                  </span>
                </div>
              </span>
              <span className="average">
                <span className="score-value">
                  {candidate.averageScore.toFixed(1)}
                </span>
                <span className="score-max">/20</span>
              </span>
              <span className="last-battle">
                {candidate.battleScores.length > 0 ? (
                  <span className="last-score">
                    {candidate.battleScores[
                      candidate.battleScores.length - 1
                    ].toFixed(1)}
                    /20
                  </span>
                ) : (
                  <span className="no-score">N/A</span>
                )}
              </span>
              <span className="battles">{candidate.scores.length}</span>
              <div className="evolution">
                {candidate.battleScores.map((score, i) => (
                  <span
                    key={i}
                    className={`score-point ${
                      score >= 15
                        ? "excellent"
                        : score >= 12
                        ? "good"
                        : score >= 10
                        ? "average"
                        : "poor"
                    }`}
                    title={`Épreuve ${i + 1}: ${score.toFixed(1)}/20`}
                  >
                    {score.toFixed(1)}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
