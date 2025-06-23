"use client";

import { useState } from "react";
import "../styles/EliminationSelectionModal.css";

export default function EliminationSelectionModal({
  candidates,
  onSelect,
  onClose,
  battleRound,
}) {
  const [selectedCandidates, setSelectedCandidates] = useState([]);

  // Trier les candidats par score de battle croissant (les moins bons en premier)
  const sortedCandidates = [...candidates].sort(
    (a, b) => a.battleScore - b.battleScore
  );

  // Identifier le candidat avec le score le plus bas
  const lowestScore = sortedCandidates[0]?.battleScore;
  const candidatesWithLowestScore = sortedCandidates.filter(
    (c) => c.battleScore === lowestScore
  );

  const toggleCandidate = (candidate) => {
    setSelectedCandidates((prev) => {
      const isSelected = prev.some((c) => c.id === candidate.id);
      if (isSelected) {
        return prev.filter((c) => c.id !== candidate.id);
      } else {
        return [...prev, candidate];
      }
    });
  };

  const handleConfirm = () => {
    if (selectedCandidates.length > 0) {
      onSelect(selectedCandidates);
    }
  };

  const isSelected = (candidate) =>
    selectedCandidates.some((c) => c.id === candidate.id);
  const hasLowestScore = (candidate) => candidate.battleScore === lowestScore;

  return (
    <div className="elimination-selection-modal-overlay">
      <div className="elimination-selection-modal">
        <div className="modal-header">
          <h2>⚔️ SÉLECTION DES ÉLIMINATIONS</h2>
          <p>
            Épreuve {battleRound} - Choisissez qui sera éliminé (au moins 1
            candidat)
          </p>
          <div className="qualification-info">
            <span className="info-text">
              ✅ Les candidats les mieux classés sont automatiquement qualifiés
            </span>
          </div>
        </div>

        <div className="elimination-info">
          <div className="info-box">
            <span className="info-icon">📋</span>
            <div className="info-text">
              <strong>Règles d'élimination :</strong>
              <ul>
                <li>Au moins 1 candidat doit être éliminé</li>
                <li>Vous pouvez éliminer plusieurs candidats</li>
                <li>
                  Les candidats avec le score le plus bas sont mis en évidence
                </li>
                <li>Les candidats qualifiés ne peuvent pas être éliminés</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="candidates-selection">
          <h3>Résultats de l'épreuve :</h3>
          {sortedCandidates.map((candidate, index) => (
            <div
              key={candidate.id}
              className={`candidate-item ${
                isSelected(candidate) ? "selected" : ""
              } ${hasLowestScore(candidate) ? "lowest-score" : ""}`}
              onClick={() => toggleCandidate(candidate)}
            >
              <div className="candidate-rank">
                <span className="rank-number">#{index + 1}</span>
                {hasLowestScore(candidate) && (
                  <span className="lowest-badge">📉</span>
                )}
              </div>

              <div className="candidate-info">
                <h4>👨‍🍳 {candidate.name}</h4>
                <div className="candidate-scores">
                  <span className="battle-score">
                    Épreuve:{" "}
                    <strong>{candidate.battleScore.toFixed(1)}/20</strong>
                  </span>
                  <span className="average-score">
                    Moyenne:{" "}
                    <strong>
                      {/* Calculer la moyenne correctement */}
                      {(() => {
                        // Si c'est la première épreuve, la moyenne est le score de battle
                        if (candidate.scores && candidate.scores.length === 0) {
                          return candidate.battleScore.toFixed(1);
                        }
                        // Sinon, calculer avec les scores existants + le nouveau score
                        const allScores = [
                          ...(candidate.scores || []),
                          candidate.battleScore,
                        ];
                        const average =
                          allScores.reduce((a, b) => a + b, 0) /
                          allScores.length;
                        return average.toFixed(1);
                      })()}
                      /20
                    </strong>
                  </span>
                </div>
              </div>

              <div className="selection-indicator">
                {isSelected(candidate) && (
                  <div className="selected-badge">
                    <span className="badge-icon">💀</span>
                    <span className="badge-text">ÉLIMINÉ</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="selection-summary">
          <div className="summary-content">
            <span className="selection-count">
              {selectedCandidates.length} candidat
              {selectedCandidates.length > 1 ? "s" : ""} sélectionné
              {selectedCandidates.length > 1 ? "s" : ""} pour élimination
            </span>
            {selectedCandidates.length === 0 && (
              <span className="warning-text">
                ⚠️ Vous devez sélectionner au moins 1 candidat
              </span>
            )}
          </div>
        </div>

        <div className="modal-actions">
          <button className="cancel-button" onClick={onClose}>
            Annuler
          </button>
          <button
            className="confirm-button"
            onClick={handleConfirm}
            disabled={selectedCandidates.length === 0}
          >
            Confirmer les éliminations ({selectedCandidates.length})
          </button>
        </div>
      </div>
    </div>
  );
}
