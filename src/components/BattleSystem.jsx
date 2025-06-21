"use client";

import { useState, useEffect } from "react";
import "../styles/BattleSystem.css";

export default function BattleSystem({
  candidates,
  setCandidates,
  juries,
  teams,
  battles,
  setBattles,
  gameHistory,
  setGameHistory,
}) {
  const [currentBattle, setCurrentBattle] = useState(null);
  const [battleType, setBattleType] = useState("individual"); // individual, team
  const [scores, setScores] = useState({});

  const activeCandidates = candidates.filter((c) => !c.eliminated);

  useEffect(() => {
    if (!currentBattle && activeCandidates.length > 1) {
      generateBattle();
    }
  }, [activeCandidates]);

  const generateBattle = () => {
    if (activeCandidates.length <= 1) return;

    // Déterminer le type de battle
    const teamCounts = teams
      .map(
        (team) => activeCandidates.filter((c) => c.teamId === team.id).length
      )
      .filter((count) => count > 0);

    let battleCandidates = [];
    let type = "individual";

    if (teamCounts.length > 1 && Math.random() > 0.3) {
      // Battle d'équipe
      type = "team";
      const activeTeams = teams.filter((team) =>
        activeCandidates.some((c) => c.teamId === team.id)
      );

      if (activeTeams.length >= 2) {
        const selectedTeams = activeTeams
          .sort(() => Math.random() - 0.5)
          .slice(0, 2);
        battleCandidates = activeCandidates.filter((c) =>
          selectedTeams.some((team) => team.id === c.teamId)
        );
      }
    }

    if (battleCandidates.length === 0) {
      // Battle individuelle
      type = "individual";
      const battleSize = Math.min(
        activeCandidates.length,
        Math.random() > 0.5 ? 2 : 3
      );
      battleCandidates = activeCandidates
        .sort(() => Math.random() - 0.5)
        .slice(0, battleSize);
    }

    const battle = {
      id: Date.now(),
      type,
      candidates: battleCandidates,
      challenge: generateChallenge(),
      completed: false,
    };

    setCurrentBattle(battle);
    setBattleType(type);

    // Initialiser les scores
    const initialScores = {};
    battleCandidates.forEach((candidate) => {
      initialScores[candidate.id] = {};
      juries.forEach((jury) => {
        initialScores[candidate.id][jury.id] = 10;
      });
    });
    setScores(initialScores);
  };

  const generateChallenge = () => {
    const challenges = [
      "Créer un plat signature en 60 minutes",
      "Revisiter un classique de la cuisine française",
      "Cuisiner avec des ingrédients mystères",
      "Réaliser un dessert spectaculaire",
      "Préparer un menu 3 services",
      "Défi technique: maîtriser une technique imposée",
      "Cuisiner pour 50 personnes",
      "Créer un plat végétarien innovant",
      "Défi pâtisserie: réaliser un entremet",
      "Cuisiner les yeux bandés",
    ];
    return challenges[Math.floor(Math.random() * challenges.length)];
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

  const completeBattle = () => {
    if (!currentBattle) return;

    // Calculer les moyennes pour cette battle
    const battleResults = currentBattle.candidates.map((candidate) => {
      const candidateScores = Object.values(scores[candidate.id] || {});
      const average =
        candidateScores.length > 0
          ? candidateScores.reduce((a, b) => a + b, 0) / candidateScores.length
          : 0;

      return {
        ...candidate,
        battleScore: average,
        battleScores: scores[candidate.id] || {},
      };
    });

    // Trier par score décroissant
    battleResults.sort((a, b) => b.battleScore - a.battleScore);

    // Déterminer qui est éliminé (le dernier)
    const eliminated = battleResults[battleResults.length - 1];

    // Mettre à jour les candidats
    const updatedCandidates = candidates.map((candidate) => {
      const battleResult = battleResults.find((r) => r.id === candidate.id);
      if (!battleResult) return candidate;

      const newScores = [...candidate.scores, battleResult.battleScore];
      const newAverage =
        newScores.reduce((a, b) => a + b, 0) / newScores.length;

      return {
        ...candidate,
        scores: newScores,
        averageScore: newAverage,
        eliminated: candidate.id === eliminated.id,
      };
    });

    setCandidates(updatedCandidates);

    // Enregistrer la battle
    const completedBattle = {
      ...currentBattle,
      results: battleResults,
      eliminated: eliminated,
      completed: true,
    };

    setBattles([...battles, completedBattle]);

    // Ajouter à l'historique
    setGameHistory([
      ...gameHistory,
      {
        type: "battle",
        battle: completedBattle,
        timestamp: new Date(),
      },
    ]);

    setCurrentBattle(null);
    setScores({});
  };

  // Trier les candidats actifs par moyenne décroissante
  const sortedActiveCandidates = [...activeCandidates].sort(
    (a, b) => b.averageScore - a.averageScore
  );

  // Déterminer le statut de chaque candidat
  const getCandidateStatus = (candidate, index) => {
    const totalCandidates = sortedActiveCandidates.length;
    if (index === 0) return "best";
    if (index === totalCandidates - 1) return "worst";
    return "normal";
  };

  if (!currentBattle) {
    return (
      <div className="battle-system">
        <div className="loading-battle">
          <h2>🔥 Préparation de la prochaine battle...</h2>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="battle-system">
      <div className="battle-header">
        <h2>
          🔥 {battleType === "team" ? "Battle d'Équipe" : "Battle Individuelle"}
        </h2>
        <div className="challenge">
          <h3>Défi: {currentBattle.challenge}</h3>
        </div>
      </div>

      <div className="battle-candidates">
        {currentBattle.candidates.map((candidate) => (
          <div key={candidate.id} className="battle-candidate">
            <div className="candidate-info">
              <h4>👨‍🍳 {candidate.name}</h4>
              {battleType === "team" && (
                <span className="team-badge">
                  Équipe{" "}
                  {teams.find((t) => t.id === candidate.teamId)?.juryName}
                </span>
              )}
            </div>

            <div className="scoring">
              {juries.map((jury) => (
                <div key={jury.id} className="jury-score">
                  <label>{jury.name}</label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={scores[candidate.id]?.[jury.id] || 10}
                    onChange={(e) =>
                      updateScore(
                        candidate.id,
                        jury.id,
                        Number.parseInt(e.target.value)
                      )
                    }
                  />
                  <span>/20</span>
                </div>
              ))}
              <div className="average-score">
                Moyenne:{" "}
                {Object.values(scores[candidate.id] || {}).length > 0
                  ? (
                      Object.values(scores[candidate.id] || {}).reduce(
                        (a, b) => a + b,
                        0
                      ) / Object.values(scores[candidate.id] || {}).length
                    ).toFixed(1)
                  : "0.0"}
                /20
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="battle-actions">
        <button className="complete-battle-button" onClick={completeBattle}>
          ⚔️ Terminer la Battle
        </button>
      </div>

      <div className="remaining-candidates">
        <h3>Candidats restants: {activeCandidates.length}</h3>
        <div className="candidates-grid">
          {sortedActiveCandidates.map((candidate, index) => {
            const status = getCandidateStatus(candidate, index);
            return (
              <div key={candidate.id} className={`mini-candidate ${status}`}>
                <span>{candidate.name}</span>
                <span className="mini-score">
                  {candidate.averageScore.toFixed(1)}
                </span>
                {status === "best" && <span className="status-icon">👑</span>}
                {status === "worst" && <span className="status-icon">⚠️</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
