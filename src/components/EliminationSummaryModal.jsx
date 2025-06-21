"use client";

import "../styles/EliminationSummaryModal.css";

export default function EliminationSummaryModal({
  eliminatedCandidates,
  battleRound,
  allCandidates,
  onClose,
}) {
  const allEliminated = allCandidates
    .filter((c) => c.eliminated)
    .sort((a, b) => (b.eliminatedAtBattle || 0) - (a.eliminatedAtBattle || 0));

  return (
    <div className="elimination-summary-modal-overlay">
      <div className="elimination-summary-modal">
        <div className="modal-header">
          <h2>📋 RÉSUMÉ DES ÉLIMINATIONS</h2>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="current-elimination">
          <h3>🔥 Épreuve {battleRound} - Candidats éliminés :</h3>
          <div className="eliminated-list">
            {eliminatedCandidates.map((candidate) => (
              <div key={candidate.id} className="eliminated-candidate current">
                <span className="candidate-name">💀 {candidate.name}</span>
                <span className="candidate-score">
                  Moyenne: {candidate.averageScore.toFixed(1)}/20
                </span>
                <span className="elimination-reason">
                  Éliminé à l'épreuve {battleRound}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="all-eliminations">
          <h3>📊 Historique complet des éliminations :</h3>
          <div className="elimination-history">
            {allEliminated.map((candidate) => (
              <div key={candidate.id} className="eliminated-candidate">
                <div className="candidate-info">
                  <span className="candidate-name">👨‍🍳 {candidate.name}</span>
                  <span className="candidate-score">
                    {candidate.averageScore.toFixed(1)}/20
                  </span>
                </div>
                <div className="elimination-details">
                  <span className="elimination-battle">
                    Épreuve {candidate.eliminatedAtBattle}
                  </span>
                  <span className="elimination-date">
                    {candidate.eliminatedAt
                      ? new Date(candidate.eliminatedAt).toLocaleDateString(
                          "fr-FR"
                        )
                      : "N/A"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-actions">
          <button className="continue-button" onClick={onClose}>
            🍳 Continuer le concours
          </button>
        </div>
      </div>
    </div>
  );
}
