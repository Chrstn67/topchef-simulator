"use client";

import { useState, useEffect } from "react";
import TeamFormation from "../components/TeamFormation";
import MultiBattleSystem from "../components/MultiBattleSystem";
import EnhancedScoreBoard from "../components/EnhancedScoreBoard";
import EnhancedPDFGenerator from "../components/EnhancedPDFGenerator";
import Conseils from "../components/Conseils";
import Footer from "../components/Footer.jsx";
import "../styles/globals.css";

export default function TopChefApp() {
  const [phase, setPhase] = useState("setup"); // setup, teams, battle, final
  const [juries, setJuries] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [teams, setTeams] = useState([]);
  const [battles, setBattles] = useState([]);
  const [winner, setWinner] = useState(null);
  const [gameHistory, setGameHistory] = useState([]);
  const [tieBreakers, setTieBreakers] = useState([]);
  const [showConseils, setShowConseils] = useState(false);

  const addJury = (name) => {
    if (name.trim()) {
      const newJuries = [...juries, { id: Date.now(), name: name.trim() }];
      setJuries(newJuries.sort((a, b) => a.name.localeCompare(b.name)));
    }
  };

  const addCandidate = (name) => {
    if (name.trim()) {
      const newCandidates = [
        ...candidates,
        {
          id: Date.now(),
          name: name.trim(),
          status: "active",
          scores: [],
          battleScores: [],
          averageScore: 0,
          teamId: null,
          eliminated: false,
          eliminatedAt: null,
          eliminatedAtBattle: null,
        },
      ];
      setCandidates(newCandidates.sort((a, b) => a.name.localeCompare(b.name)));
    }
  };

  const removeJury = (id) => {
    setJuries(juries.filter((j) => j.id !== id));
  };

  const removeCandidate = (id) => {
    setCandidates(candidates.filter((c) => c.id !== id));
  };

  const startGame = () => {
    if (juries.length > 0 && candidates.length > 1) {
      setPhase("teams");
    }
  };

  const activeCandidates = candidates.filter((c) => !c.eliminated);

  useEffect(() => {
    if (activeCandidates.length === 1 && phase === "battle") {
      setWinner(activeCandidates[0]);
      setPhase("final");
    }
  }, [activeCandidates, phase]);

  return (
    <div className="top-chef-app">
      <header className="app-header">
        <h1>🍳 TOP CHEF SIMULATOR</h1>
        <div className="header-actions">
          <button
            className="conseils-button"
            onClick={() => setShowConseils(true)}
            title="Voir les conseils de cuisine"
          >
            📋 Conseils
          </button>
        </div>
        <div className="phase-indicator">
          <span className={phase === "setup" ? "active" : ""}>
            Configuration
          </span>
          <span className={phase === "teams" ? "active" : ""}>Équipes</span>
          <span className={phase === "battle" ? "active" : ""}>Battles</span>
          <span className={phase === "final" ? "active" : ""}>Final</span>
        </div>
      </header>

      <main className="app-main">
        {phase === "setup" && (
          <div className="setup-phase">
            <div className="setup-section">
              <h2>👨‍⚖️ Jury</h2>
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Nom du juré"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      addJury(e.target.value);
                      e.target.value = "";
                    }
                  }}
                />
                <button
                  onClick={(e) => {
                    const input = e.target.previousElementSibling;
                    addJury(input.value);
                    input.value = "";
                  }}
                >
                  Ajouter
                </button>
              </div>
              <div className="list">
                {juries.map((jury) => (
                  <div key={jury.id} className="list-item">
                    <span>{jury.name}</span>
                    <button onClick={() => removeJury(jury.id)}>❌</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="setup-section">
              <h2>👨‍🍳 Candidats</h2>
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Nom du candidat"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      addCandidate(e.target.value);
                      e.target.value = "";
                    }
                  }}
                />
                <button
                  onClick={(e) => {
                    const input = e.target.previousElementSibling;
                    addCandidate(input.value);
                    input.value = "";
                  }}
                >
                  Ajouter
                </button>
              </div>
              <div className="list">
                {candidates.map((candidate) => (
                  <div key={candidate.id} className="list-item">
                    <span>{candidate.name}</span>
                    <button onClick={() => removeCandidate(candidate.id)}>
                      ❌
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              className="start-button"
              onClick={startGame}
              disabled={juries.length === 0 || candidates.length < 2}
            >
              Commencer le concours
            </button>
          </div>
        )}

        {phase === "teams" && (
          <TeamFormation
            juries={juries}
            candidates={candidates}
            setCandidates={setCandidates}
            teams={teams}
            setTeams={setTeams}
            onNext={() => setPhase("battle")}
          />
        )}

        {phase === "battle" && (
          <MultiBattleSystem
            candidates={candidates}
            setCandidates={setCandidates}
            juries={juries}
            teams={teams}
            battles={battles}
            setBattles={setBattles}
            gameHistory={gameHistory}
            setGameHistory={setGameHistory}
          />
        )}

        {phase === "final" && winner && (
          <div className="final-phase">
            <div className="winner-announcement">
              <h2>🏆 VAINQUEUR</h2>
              <div className="winner-card">
                <h3>{winner.name}</h3>
                <p>Moyenne: {winner.averageScore.toFixed(1)}/20</p>
              </div>
            </div>

            <EnhancedScoreBoard candidates={candidates} />

            <EnhancedPDFGenerator
              candidates={candidates}
              teams={teams}
              battles={battles}
              winner={winner}
              juries={juries}
              gameHistory={gameHistory}
            />
          </div>
        )}
      </main>

      <Conseils isOpen={showConseils} onClose={() => setShowConseils(false)} />

      <style jsx>{`
        .app-header {
          position: relative;
        }

        .conseils-button {
          position: absolute;
          top: 20px;
          right: 20px;
          background: linear-gradient(135deg, #74b9ff, #0984e3);
          color: white;
          border: none;
          padding: 10px 15px;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          z-index: 100;

          &:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
            background: linear-gradient(135deg, #81c3ff, #2d96ff);
          }

          &:active {
            transform: translateY(0);
          }
        }

        /* Responsive adjustments */
        @media (max-width: 768px) .conseils-button {
          .header-actions {
            position: static;
            text-align: center;
            margin-bottom: 15px;
            font-size: 0.8rem;
            padding: 8px 12px;
          }
        }
      `}</style>
      <Footer />
    </div>
  );
}
