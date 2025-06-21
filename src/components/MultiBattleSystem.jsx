"use client";

import { useState, useEffect } from "react";
import TieBreakerModal from "./TieBreakerModal";
import EliminationSummaryModal from "./EliminationSummaryModal";
import ConfirmationModal from "./ConfirmationModal";
import BattleTimer from "./BattleTimer";
import "../styles/MultiBattleSystem.css";
import EliminationSelectionModal from "./EliminationSelectionModal";
import MultiBattleEliminationModal from "./MultiBattleEliminationModal";

export default function MultiBattleSystem({
  candidates,
  setCandidates,
  juries,
  teams,
  battles,
  setBattles,
  gameHistory,
  setGameHistory,
}) {
  const [currentBattles, setCurrentBattles] = useState([]);
  const [battleRound, setBattleRound] = useState(1);
  const [scores, setScores] = useState({});
  const [timeLimit, setTimeLimit] = useState(60);
  const [showTieBreaker, setShowTieBreaker] = useState(false);
  const [tiedCandidates, setTiedCandidates] = useState([]);
  const [battleResults, setBattleResults] = useState([]);
  const [activeBattleTab, setActiveBattleTab] = useState(0);
  const [showEliminationSummary, setShowEliminationSummary] = useState(false);
  const [lastEliminated, setLastEliminated] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showEliminationSelection, setShowEliminationSelection] =
    useState(false);
  const [battleResultsForElimination, setBattleResultsForElimination] =
    useState([]);
  const [showMultiBattleElimination, setShowMultiBattleElimination] =
    useState(false);

  const activeCandidates = candidates.filter((c) => !c.eliminated);

  // Liste complète des challenges disponibles
  const availableChallenges = [
    "Les pâtes",
    "Mini-burgers",
    "Crêpes aux fruits",
    "Cookies",
  ];

  useEffect(() => {
    if (currentBattles.length === 0 && activeCandidates.length > 1) {
      generateMultipleBattles();
    }
  }, [activeCandidates]);

  // Fonction pour obtenir les jurés autorisés à noter un candidat
  const getAuthorizedJuries = (candidateTeamId) => {
    return juries.filter((jury) => {
      const juryTeam = teams.find((team) => team.juryName === jury.name);
      return !juryTeam || juryTeam.id !== candidateTeamId;
    });
  };

  const generateMultipleBattles = () => {
    if (activeCandidates.length <= 1) return;

    // Composition complètement aléatoire
    const shuffledCandidates = [...activeCandidates].sort(
      () => Math.random() - 0.5
    );
    const numBattles = Math.min(3, Math.ceil(activeCandidates.length / 4));
    const candidatesPerBattle = Math.ceil(
      shuffledCandidates.length / numBattles
    );

    const newBattles = [];

    for (let i = 0; i < numBattles; i++) {
      const startIndex = i * candidatesPerBattle;
      const endIndex = Math.min(
        startIndex + candidatesPerBattle,
        shuffledCandidates.length
      );
      const battleCandidates = shuffledCandidates.slice(startIndex, endIndex);

      if (battleCandidates.length > 0) {
        // Déterminer le type de battle
        const teamIds = [...new Set(battleCandidates.map((c) => c.teamId))];
        const battleType = teamIds.length > 1 ? "inter-team" : "standard";

        // Sélectionner un challenge aléatoire par défaut
        const randomChallenge =
          availableChallenges[
            Math.floor(Math.random() * availableChallenges.length)
          ];

        newBattles.push({
          id: Date.now() + i,
          battleNumber: i + 1,
          type: battleType,
          candidates: battleCandidates,
          challenge: randomChallenge,
          timeLimit: timeLimit,
          completed: false,
        });
      }
    }

    setCurrentBattles(newBattles);
    setActiveBattleTab(0);

    // Initialiser les scores seulement pour les jurés autorisés
    const initialScores = {};
    newBattles.forEach((battle) => {
      battle.candidates.forEach((candidate) => {
        initialScores[candidate.id] = {};
        const authorizedJuries = getAuthorizedJuries(candidate.teamId);
        authorizedJuries.forEach((jury) => {
          initialScores[candidate.id][jury.id] = 10;
        });
      });
    });
    setScores(initialScores);
  };

  const updateBattleChallenge = (battleId, newChallenge) => {
    setCurrentBattles((prev) =>
      prev.map((battle) =>
        battle.id === battleId ? { ...battle, challenge: newChallenge } : battle
      )
    );
  };

  const updateScore = (candidateId, juryId, score) => {
    setScores((prev) => ({
      ...prev,
      [candidateId]: {
        ...prev[candidateId],
        [juryId]: Math.max(0, Math.min(20, score)),
      },
    }));
  };

  const handleTimeLimitChange = (newTimeLimit) => {
    setTimeLimit(newTimeLimit);
    // Mettre à jour toutes les battles actuelles
    setCurrentBattles((prev) =>
      prev.map((battle) => ({
        ...battle,
        timeLimit: newTimeLimit,
      }))
    );
  };

  const handleTimeUp = () => {
    // Optionnel : actions à effectuer quand le temps est écoulé
    console.log("⏰ Temps écoulé pour l'épreuve !");
  };

  const completeBattles = () => {
    if (currentBattles.length === 0) return;
    setShowConfirmation(true);
  };

  const handleConfirmCompletion = () => {
    setShowConfirmation(false);
    proceedWithCompletion();
  };

  const handleRecheckScores = () => {
    setShowConfirmation(false);
    // L'utilisateur reste sur la page pour vérifier
  };

  const proceedWithCompletion = () => {
    let allResults = [];

    // Calculer les résultats pour chaque battle
    currentBattles.forEach((battle) => {
      const battleResults = battle.candidates.map((candidate) => {
        const candidateScores = Object.values(scores[candidate.id] || {});
        const average =
          candidateScores.length > 0
            ? candidateScores.reduce((a, b) => a + b, 0) /
              candidateScores.length
            : 0;

        return {
          ...candidate,
          battleScore: average,
          battleScores: scores[candidate.id] || {},
          battleNumber: battle.battleNumber,
        };
      });

      battleResults.sort((a, b) => b.battleScore - a.battleScore);
      allResults = [...allResults, ...battleResults];
    });

    // Trier tous les résultats par score
    allResults.sort((a, b) => b.battleScore - a.battleScore);

    // Déterminer les candidats automatiquement qualifiés (top 3 ou 30% des meilleurs)
    const numQualified = Math.max(
      1,
      Math.min(3, Math.floor(allResults.length * 0.3))
    );
    const qualifiedCandidates = allResults.slice(0, numQualified);
    const eliminableCandidates = allResults.filter(
      (result) =>
        !qualifiedCandidates.some((qualified) => qualified.id === result.id)
    );

    // Si plusieurs battles, utiliser la modale multi-battle
    if (currentBattles.length > 1) {
      setBattleResultsForElimination(eliminableCandidates);
      setShowMultiBattleElimination(true);
      return;
    }

    // Une seule battle : vérifier les égalités pour la dernière place parmi les éliminables
    if (eliminableCandidates.length === 0) {
      // Tous les candidats sont qualifiés, pas d'élimination
      finalizeBattleResults(allResults, []);
      return;
    }

    const lowestScore =
      eliminableCandidates[eliminableCandidates.length - 1].battleScore;
    const candidatesWithLowestScore = eliminableCandidates.filter(
      (r) => r.battleScore === lowestScore
    );

    if (candidatesWithLowestScore.length > 1) {
      // Il y a égalité, utiliser le tie-breaker
      setTiedCandidates(candidatesWithLowestScore);
      setBattleResults(allResults);
      setShowTieBreaker(true);
      return;
    }

    // Pas d'égalité, mais on doit quand même permettre de choisir qui éliminer
    setBattleResultsForElimination(eliminableCandidates);
    setShowEliminationSelection(true);
  };

  const finalizeBattleResults = (allResults, eliminatedCandidates) => {
    // Mettre à jour les candidats
    const updatedCandidates = candidates.map((candidate) => {
      const result = allResults.find((r) => r.id === candidate.id);
      if (!result) return candidate;

      const newBattleScores = [...candidate.battleScores, result.battleScore];
      const newScores = [...candidate.scores, result.battleScore];
      const newAverage =
        newScores.reduce((a, b) => a + b, 0) / newScores.length;
      const isEliminated = eliminatedCandidates.some(
        (e) => e.id === candidate.id
      );

      return {
        ...candidate,
        scores: newScores,
        battleScores: newBattleScores,
        averageScore: newAverage,
        eliminated: isEliminated,
        eliminatedAt: isEliminated ? new Date() : candidate.eliminatedAt,
        eliminatedAtBattle: isEliminated
          ? battleRound
          : candidate.eliminatedAtBattle,
      };
    });

    setCandidates(updatedCandidates);

    // Enregistrer les battles
    const completedBattles = currentBattles.map((battle) => ({
      ...battle,
      results: allResults.filter((r) => r.battleNumber === battle.battleNumber),
      completed: true,
      round: battleRound,
    }));

    setBattles([...battles, ...completedBattles]);

    // Ajouter à l'historique
    setGameHistory([
      ...gameHistory,
      {
        type: "multi-battle",
        battles: completedBattles,
        eliminated: eliminatedCandidates,
        round: battleRound,
        timestamp: new Date(),
      },
    ]);

    // Afficher le résumé des éliminations
    setLastEliminated(eliminatedCandidates);
    setShowEliminationSummary(true);

    setCurrentBattles([]);
    setScores({});
    setBattleRound((prev) => prev + 1);
  };

  const handleTieBreakerResult = (selectedCandidates) => {
    finalizeBattleResults(battleResults, selectedCandidates);
    setShowTieBreaker(false);
    setTiedCandidates([]);
    setBattleResults([]);
  };

  const handleEliminationSelection = (selectedCandidates) => {
    finalizeBattleResults(battleResultsForElimination, selectedCandidates);
    setShowEliminationSelection(false);
    setBattleResultsForElimination([]);
  };

  const handleMultiBattleElimination = (selectedCandidates) => {
    finalizeBattleResults(battleResultsForElimination, selectedCandidates);
    setShowMultiBattleElimination(false);
    setBattleResultsForElimination([]);
  };

  // Fonction pour vérifier si tous les candidats ont reçu toutes leurs notes
  const areAllScoresComplete = () => {
    return currentBattles.every((battle) =>
      battle.candidates.every((candidate) => {
        const authorizedJuries = getAuthorizedJuries(candidate.teamId);
        return authorizedJuries.every(
          (jury) =>
            scores[candidate.id] && scores[candidate.id][jury.id] !== undefined
        );
      })
    );
  };

  // Fonction pour compter les scores manquants
  const getMissingScoresCount = () => {
    let missing = 0;
    currentBattles.forEach((battle) =>
      battle.candidates.forEach((candidate) => {
        const authorizedJuries = getAuthorizedJuries(candidate.teamId);
        authorizedJuries.forEach((jury) => {
          if (
            !scores[candidate.id] ||
            scores[candidate.id][jury.id] === undefined
          ) {
            missing++;
          }
        });
      })
    );
    return missing;
  };

  // Fonction pour déterminer le rang d'un candidat
  const getCandidateRank = (candidate, sortedCandidates) => {
    const index = sortedCandidates.findIndex((c) => c.id === candidate.id);
    return index + 1;
  };

  if (currentBattles.length === 0) {
    return (
      <div className="multi-battle-system">
        <div className="loading-battle">
          <h2>🔥 Préparation de l'épreuve {battleRound}...</h2>
          <div className="chef-spinner">👨‍🍳</div>
        </div>
      </div>
    );
  }

  // Trier les candidats actifs par moyenne décroissante
  const sortedActiveCandidates = [...activeCandidates].sort(
    (a, b) => b.averageScore - a.averageScore
  );
  const bestScore = sortedActiveCandidates[0]?.averageScore;
  const worstScore =
    sortedActiveCandidates[sortedActiveCandidates.length - 1]?.averageScore;

  // Déterminer les candidats automatiquement qualifiés
  const numQualified = Math.max(
    1,
    Math.min(3, Math.floor(sortedActiveCandidates.length * 0.3))
  );
  const qualifiedCandidates = sortedActiveCandidates.slice(0, numQualified);
  const qualifiedThreshold =
    qualifiedCandidates[qualifiedCandidates.length - 1]?.averageScore;

  return (
    <div className="multi-battle-system">
      <div className="battle-header">
        <h2>🍳 ÉPREUVE {battleRound}</h2>
        <div className="battle-info">
          <span className="battle-count">
            🥘 {currentBattles.length} Battle
            {currentBattles.length > 1 ? "s" : ""} aléatoire
            {currentBattles.length > 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Configuration du temps */}
      <div className="time-configuration">
        <div className="time-input">
          <label>⏱️ Temps limite (minutes) :</label>
          <input
            type="number"
            min="15"
            max="180"
            step="15"
            value={timeLimit}
            onChange={(e) =>
              handleTimeLimitChange(Number.parseInt(e.target.value))
            }
          />
        </div>
        <BattleTimer timeLimit={timeLimit} onTimeUp={handleTimeUp} />
      </div>

      {/* Navigation par onglets */}
      <div className="battle-tabs">
        {currentBattles.map((battle, index) => (
          <button
            key={battle.id}
            className={`battle-tab ${
              activeBattleTab === index ? "active" : ""
            }`}
            onClick={() => setActiveBattleTab(index)}
          >
            <span className="tab-icon">
              {battle.type === "inter-team" ? "⚔️" : "🍽️"}
            </span>
            <span className="tab-title">Battle {battle.battleNumber}</span>
            <span className="tab-subtitle">
              {battle.type === "inter-team" ? "Inter-équipes" : "Standard"}
            </span>
          </button>
        ))}
      </div>

      {/* Contenu de la battle active */}
      {currentBattles[activeBattleTab] && (
        <div className="active-battle">
          <div className="battle-challenge">
            <div className="challenge-header">
              <h3>
                🎯 Challenge de la Battle{" "}
                {currentBattles[activeBattleTab].battleNumber}
              </h3>
              <div className="challenge-selector">
                <label>Choisir le challenge :</label>
                <select
                  value={currentBattles[activeBattleTab].challenge}
                  onChange={(e) =>
                    updateBattleChallenge(
                      currentBattles[activeBattleTab].id,
                      e.target.value
                    )
                  }
                  className="challenge-dropdown"
                >
                  {availableChallenges.map((challenge) => (
                    <option key={challenge} value={challenge}>
                      {challenge}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="current-challenge">
              <span className="challenge-name">
                📋 {currentBattles[activeBattleTab].challenge}
              </span>
            </div>
            <div className="challenge-details">
              <span>
                ⏱️ {currentBattles[activeBattleTab].timeLimit} minutes
              </span>
              <span>
                {currentBattles[activeBattleTab].type === "inter-team"
                  ? "⚔️ Battle Inter-équipes"
                  : "🍽️ Battle Standard"}
              </span>
            </div>
          </div>

          <div className="battle-candidates">
            {currentBattles[activeBattleTab].candidates.map((candidate) => {
              const authorizedJuries = getAuthorizedJuries(candidate.teamId);
              return (
                <div key={candidate.id} className="battle-candidate">
                  <div className="candidate-header">
                    <div className="candidate-info">
                      <h4>👨‍🍳 {candidate.name}</h4>
                      <span
                        className="team-badge"
                        style={{
                          backgroundColor:
                            teams.find((t) => t.id === candidate.teamId)
                              ?.color || "#ccc",
                        }}
                      >
                        Équipe{" "}
                        {teams.find((t) => t.id === candidate.teamId)?.juryName}
                      </span>
                    </div>
                    <div className="candidate-stats">
                      <div className="stat">
                        <span className="stat-label">Moyenne générale</span>
                        <span className="stat-value">
                          {candidate.averageScore.toFixed(1)}/20
                        </span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Épreuves</span>
                        <span className="stat-value">
                          {candidate.scores.length}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="scoring-section">
                    <h5>🧑‍⚖️ Notation des jurés autorisés</h5>
                    {authorizedJuries.length === 0 ? (
                      <div className="no-jury-warning">
                        ⚠️ Aucun juré autorisé à noter ce candidat (conflit
                        d'équipe)
                      </div>
                    ) : (
                      <div className="scoring">
                        {authorizedJuries.map((jury) => (
                          <div key={jury.id} className="jury-score">
                            <label>{jury.name}</label>
                            <input
                              type="number"
                              min="0"
                              max="20"
                              step="0.5"
                              value={scores[candidate.id]?.[jury.id] || 10}
                              onChange={(e) =>
                                updateScore(
                                  candidate.id,
                                  jury.id,
                                  Number.parseFloat(e.target.value)
                                )
                              }
                            />
                            <span>/20</span>
                          </div>
                        ))}
                        <div className="average-score">
                          <span className="average-label">
                            Moyenne épreuve:
                          </span>
                          <span className="average-value">
                            {Object.values(scores[candidate.id] || {}).length >
                            0
                              ? (
                                  Object.values(
                                    scores[candidate.id] || {}
                                  ).reduce((a, b) => a + b, 0) /
                                  Object.values(scores[candidate.id] || {})
                                    .length
                                ).toFixed(1)
                              : "0.0"}
                            /20
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="battle-actions">
        <div className="completion-status">
          {!areAllScoresComplete() && (
            <div className="missing-scores-warning">
              ⚠️ {getMissingScoresCount()} note
              {getMissingScoresCount() > 1 ? "s" : ""} manquante
              {getMissingScoresCount() > 1 ? "s" : ""}
            </div>
          )}
        </div>
        <button
          className="complete-battles-button"
          onClick={completeBattles}
          disabled={!areAllScoresComplete()}
        >
          🏁 Terminer l'Épreuve {battleRound}
        </button>
      </div>

      <div className="remaining-candidates">
        <h3>👨‍🍳 Classement actuel: {activeCandidates.length} candidats</h3>
        <div className="candidates-status">
          {sortedActiveCandidates.map((candidate, index) => {
            const rank = index + 1;
            const isFirst = candidate.averageScore === bestScore;
            const isLast =
              candidate.averageScore === worstScore &&
              sortedActiveCandidates.length > 1;
            const isQualified =
              candidate.averageScore >= qualifiedThreshold &&
              rank <= numQualified;

            return (
              <div
                key={candidate.id}
                className={`candidate-status ${
                  isFirst ? "best-candidate" : ""
                } ${isLast ? "worst-candidate" : ""} ${
                  isQualified ? "qualified-candidate" : ""
                }`}
              >
                <div className="rank-indicator">
                  <span className="rank-number">#{rank}</span>
                  {isFirst && <span className="rank-icon">🏆</span>}
                  {isLast && <span className="rank-icon">⚠️</span>}
                  {isQualified && !isFirst && (
                    <span className="rank-icon">✅</span>
                  )}
                </div>
                <span className="name">{candidate.name}</span>
                <span className="score">
                  {candidate.averageScore.toFixed(1)}/20
                </span>
                <span className="battles">
                  {candidate.scores.length} épreuves
                </span>
                {isQualified && (
                  <span className="qualification-badge">QUALIFIÉ</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {showEliminationSelection && (
        <EliminationSelectionModal
          candidates={battleResultsForElimination}
          onSelect={handleEliminationSelection}
          onClose={() => setShowEliminationSelection(false)}
          battleRound={battleRound}
        />
      )}

      {showConfirmation && (
        <ConfirmationModal
          onConfirm={handleConfirmCompletion}
          onRecheck={handleRecheckScores}
          onClose={() => setShowConfirmation(false)}
        />
      )}

      {showTieBreaker && (
        <TieBreakerModal
          tiedCandidates={tiedCandidates}
          onSelect={handleTieBreakerResult}
          onClose={() => setShowTieBreaker(false)}
          allowMultiple={true}
        />
      )}

      {showEliminationSummary && (
        <EliminationSummaryModal
          eliminatedCandidates={lastEliminated}
          battleRound={battleRound - 1}
          allCandidates={candidates}
          onClose={() => setShowEliminationSummary(false)}
        />
      )}

      {showMultiBattleElimination && (
        <MultiBattleEliminationModal
          battleResults={battleResultsForElimination}
          onSelect={handleMultiBattleElimination}
          onClose={() => setShowMultiBattleElimination(false)}
          battleRound={battleRound}
        />
      )}
    </div>
  );
}
