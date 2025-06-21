"use client";

import { useState } from "react";
import "../styles/MultiBattleEliminationModal.css";

export default function MultiBattleEliminationModal({
  battleResults,
  onSelect,
  onClose,
  battleRound,
}) {
  const [selectedCandidates, setSelectedCandidates] = useState({});

  // Grouper les résultats par battle
  const battleGroups = battleResults.reduce((groups, candidate) => {
    const battleNumber = candidate.battleNumber;
    if (!groups[battleNumber]) {
      groups[battleNumber] = [];
    }
    groups[battleNumber].push(candidate);
    return groups;
  }, {});

  // Trier les candidats dans chaque battle par score croissant
  Object.keys(battleGroups).forEach((battleNumber) => {
    battleGroups[battleNumber].sort((a, b) => a.battleScore - b.battleScore);
  });

  const toggleCandidate = (battleNumber, candidate) => {
    setSelectedCandidates((prev) => {
      const battleSelections = prev[battleNumber] || [];
      const isSelected = battleSelections.some((c) => c.id === candidate.id);

      if (isSelected) {
        return {
          ...prev,
          [battleNumber]: battleSelections.filter((c) => c.id !== candidate.id),
        };
      } else {
        return {
          ...prev,
          [battleNumber]: [...battleSelections, candidate],
        };
      }
    });
  };

  const handleConfirm = () => {
    // Vérifier que chaque battle a au moins un éliminé
    const allBattleNumbers = Object.keys(battleGroups);
    const isValid = allBattleNumbers.every((battleNumber) => {
      const selections = selectedCandidates[battleNumber] || [];
      return selections.length > 0;
    });

    if (isValid) {
      // Combiner tous les candidats sélectionnés
      const allSelected = Object.values(selectedCandidates).flat();
      onSelect(allSelected);
    }
  };

  const isSelected = (battleNumber, candidate) => {
    const battleSelections = selectedCandidates[battleNumber] || [];
    return battleSelections.some((c) => c.id === candidate.id);
  };

  const getBattleSelectionCount = (battleNumber) => {
    return (selectedCandidates[battleNumber] || []).length;
  };

  const getTotalSelectionCount = () => {
    return Object.values(selectedCandidates).flat().length;
  };

  const isValidSelection = () => {
    const allBattleNumbers = Object.keys(battleGroups);
    return allBattleNumbers.every((battleNumber) => {
      return getBattleSelectionCount(battleNumber) > 0;
    });
  };

  const getLowestScoreInBattle = (battleNumber) => {
    const candidates = battleGroups[battleNumber];
    return candidates.length > 0 ? candidates[0].battleScore : 0;
  };

  const hasLowestScoreInBattle = (battleNumber, candidate) => {
    return candidate.battleScore === getLowestScoreInBattle(battleNumber);
  };

  return (
    <div className="multi-battle-elimination-modal-overlay">
      <div className="multi-battle-elimination-modal">
        <div className="modal-header">
          <h2>⚔️ ÉLIMINATIONS PAR BATTLE</h2>
          <p>
            Épreuve {battleRound} - Sélectionnez au moins 1 candidat à éliminer
            par battle
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
                <li>Au moins 1 candidat doit être éliminé par battle</li>
                <li>Vous pouvez éliminer plusieurs candidats par battle</li>
                <li>
                  Les candidats avec le score le plus bas sont mis en évidence
                </li>
                <li>Les candidats qualifiés ne peuvent pas être éliminés</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="battles-container">
          {Object.entries(battleGroups).map(([battleNumber, candidates]) => (
            <div key={battleNumber} className="battle-section">
              <div className="battle-header">
                <h3>🥘 Battle {battleNumber}</h3>
                <div className="battle-status">
                  <span
                    className={`selection-count ${
                      getBattleSelectionCount(battleNumber) > 0
                        ? "valid"
                        : "invalid"
                    }`}
                  >
                    {getBattleSelectionCount(battleNumber)} éliminé
                    {getBattleSelectionCount(battleNumber) > 1 ? "s" : ""}
                    {getBattleSelectionCount(battleNumber) === 0 && " ⚠️"}
                  </span>
                </div>
              </div>

              <div className="battle-candidates">
                {candidates.map((candidate, index) => (
                  <div
                    key={candidate.id}
                    className={`candidate-item ${
                      isSelected(battleNumber, candidate) ? "selected" : ""
                    } ${
                      hasLowestScoreInBattle(battleNumber, candidate)
                        ? "lowest-score"
                        : ""
                    }`}
                    onClick={() => toggleCandidate(battleNumber, candidate)}
                  >
                    <div className="candidate-rank">
                      <span className="rank-number">#{index + 1}</span>
                      {hasLowestScoreInBattle(battleNumber, candidate) && (
                        <span className="lowest-badge">📉</span>
                      )}
                    </div>

                    <div className="candidate-info">
                      <h4>👨‍🍳 {candidate.name}</h4>
                      <div className="candidate-scores">
                        <span className="battle-score">
                          Battle:{" "}
                          <strong>{candidate.battleScore.toFixed(1)}/20</strong>
                        </span>
                        <span className="average-score">
                          Moyenne:{" "}
                          <strong>
                            {candidate.averageScore.toFixed(1)}/20
                          </strong>
                        </span>
                      </div>
                    </div>

                    <div className="selection-indicator">
                      {isSelected(battleNumber, candidate) && (
                        <div className="selected-badge">
                          <span className="badge-icon">💀</span>
                          <span className="badge-text">ÉLIMINÉ</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="selection-summary">
          <div className="summary-content">
            <div className="total-count">
              <span className="total-label">Total des éliminations :</span>
              <span className="total-number">
                {getTotalSelectionCount()} candidat
                {getTotalSelectionCount() > 1 ? "s" : ""}
              </span>
            </div>
            {!isValidSelection() && (
              <div className="validation-warning">
                ⚠️ Chaque battle doit avoir au moins 1 candidat éliminé
              </div>
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
            disabled={!isValidSelection()}
          >
            Confirmer les éliminations ({getTotalSelectionCount()})
          </button>
        </div>
      </div>
    </div>
  );
}
