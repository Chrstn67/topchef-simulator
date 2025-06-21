"use client"

import "../styles/ConfirmationModal.css"

export default function ConfirmationModal({ onConfirm, onRecheck, onClose }) {
  return (
    <div className="confirmation-modal-overlay">
      <div className="confirmation-modal">
        <div className="modal-header">
          <h2>🔍 VÉRIFICATION FINALE</h2>
          <p>Êtes-vous sûr d'avoir correctement rempli toutes les notes ?</p>
        </div>

        <div className="modal-content">
          <div className="warning-box">
            <span className="warning-icon">⚠️</span>
            <div className="warning-text">
              <strong>Attention !</strong>
              <p>Une fois l'épreuve terminée, vous ne pourrez plus modifier les notes.</p>
              <p>Vérifiez bien que tous les jurés ont noté tous les candidats.</p>
            </div>
          </div>

          <div className="options">
            <div className="option-card recheck">
              <div className="option-icon">🔍</div>
              <div className="option-content">
                <h3>Vérifier les notes</h3>
                <p>Retourner pour contrôler et corriger les notes si nécessaire</p>
              </div>
            </div>

            <div className="option-card confirm">
              <div className="option-icon">✅</div>
              <div className="option-content">
                <h3>Tout est correct</h3>
                <p>Finaliser l'épreuve et passer à la suite</p>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button className="recheck-button" onClick={onRecheck}>
            🔍 Vérifier les notes
          </button>
          <button className="confirm-button" onClick={onConfirm}>
            ✅ Tout est correct, continuer
          </button>
        </div>
      </div>
    </div>
  )
}
