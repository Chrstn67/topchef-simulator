"use client"

import { useState } from "react"
import "../styles/TieBreakerModal.css"

export default function TieBreakerModal({ tiedCandidates, onSelect, onClose, allowMultiple = false }) {
  const [selectedCandidates, setSelectedCandidates] = useState([])

  const toggleCandidate = (candidate) => {
    if (allowMultiple) {
      setSelectedCandidates((prev) => {
        const isSelected = prev.some((c) => c.id === candidate.id)
        if (isSelected) {
          return prev.filter((c) => c.id !== candidate.id)
        } else {
          return [...prev, candidate]
        }
      })
    } else {
      setSelectedCandidates([candidate])
    }
  }

  const handleConfirm = () => {
    if (selectedCandidates.length > 0) {
      onSelect(allowMultiple ? selectedCandidates : selectedCandidates[0])
    }
  }

  const isSelected = (candidate) => selectedCandidates.some((c) => c.id === candidate.id)

  // Trouver le candidat avec la moyenne générale la plus faible
  const candidateWithLowestAverage = tiedCandidates.reduce((lowest, current) =>
    current.averageScore < lowest.averageScore ? current : lowest,
  )

  const isLowestAverage = (candidate) => candidate.id === candidateWithLowestAverage.id

  return (
    <div className="tie-breaker-modal-overlay">
      <div className="tie-breaker-modal">
        <div className="modal-header">
          <h2>⚖️ ÉGALITÉ DÉTECTÉE</h2>
          <p>
            {allowMultiple
              ? "Plusieurs candidats ont la même note. Sélectionnez qui sera éliminé (un ou plusieurs)."
              : "Plusieurs candidats ont la même note. Le jury doit décider qui sera éliminé."}
          </p>
        </div>

        <div className="tied-candidates">
          <h3>Candidats à égalité :</h3>
          {tiedCandidates.map((candidate) => (
            <div
              key={candidate.id}
              className={`tied-candidate ${isSelected(candidate) ? "selected" : ""} ${isLowestAverage(candidate) ? "lowest-average" : ""}`}
              onClick={() => toggleCandidate(candidate)}
            >
              <div className="candidate-info">
                <h4>
                  👨‍🍳 {candidate.name}
                  {isLowestAverage(candidate) && <span className="lowest-badge">📉 Moyenne la plus faible</span>}
                </h4>
                <p>Score de l'épreuve: {candidate.battleScore.toFixed(1)}/20</p>
                <p>Moyenne générale: {candidate.averageScore.toFixed(1)}/20</p>
              </div>
              <div className="selection-indicator">
                {isSelected(candidate) && (
                  <span className="selected-badge">✓ SÉLECTIONNÉ{allowMultiple ? "" : " POUR ÉLIMINATION"}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="selection-info">
          {allowMultiple && (
            <p className="selection-count">
              {selectedCandidates.length} candidat{selectedCandidates.length > 1 ? "s" : ""} sélectionné
              {selectedCandidates.length > 1 ? "s" : ""} pour élimination
            </p>
          )}
        </div>

        <div className="modal-actions">
          <button className="cancel-button" onClick={onClose}>
            Annuler
          </button>
          <button className="confirm-button" onClick={handleConfirm} disabled={selectedCandidates.length === 0}>
            Confirmer l'élimination
          </button>
        </div>
      </div>
    </div>
  )
}
