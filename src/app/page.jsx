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
                <div className="winner-name">
                  <h3>{winner.name}</h3>
                </div>
                <div className="winner-stats">
                  <div className="winner-score">
                    <span className="score-label">Moyenne générale</span>
                    <span className="score-value">
                      {/* Calcul correct de la moyenne générale */}
                      {winner.scores && winner.scores.length > 0
                        ? (
                            winner.scores.reduce((a, b) => a + b, 0) /
                            winner.scores.length
                          ).toFixed(1)
                        : "0.0"}
                      /20
                    </span>
                  </div>
                  <div className="winner-battles">
                    <span className="battles-label">Épreuves</span>
                    <span className="battles-value">
                      {winner.scores ? winner.scores.length : 0}
                    </span>
                  </div>
                </div>
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

        .winner-card {
          background: linear-gradient(
            135deg,
            #ffd700 0%,
            #ffed4e 50%,
            #f39c12 100%
          );
          border-radius: 20px;
          padding: 2rem;
          text-align: center;
          box-shadow: 0 10px 30px rgba(243, 156, 18, 0.4);
          border: 3px solid #f39c12;
          position: relative;
          overflow: hidden;
          animation: goldShimmer 3s ease-in-out infinite;
        }

        .winner-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.2) 0%,
            transparent 100%
          );
          pointer-events: none;
        }

        .winner-name {
          position: relative;
          z-index: 2;
          margin-bottom: 1.5rem;
        }

        .winner-name h3 {
          font-size: 2.5rem;
          font-weight: 800;
          color: #8b4513;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
          margin: 0;
          font-family: var(--font-display);
        }

        .winner-stats {
          display: flex;
          justify-content: center;
          gap: 2rem;
          position: relative;
          z-index: 2;
        }

        .winner-score,
        .winner-battles {
          background: rgba(255, 255, 255, 0.9);
          padding: 1rem 1.5rem;
          border-radius: 15px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          border: 2px solid #e67e22;
        }

        .score-label,
        .battles-label {
          display: block;
          font-size: 0.9rem;
          color: #8b4513;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .score-value,
        .battles-value {
          display: block;
          font-size: 1.8rem;
          font-weight: 800;
          color: #d35400;
          font-family: var(--font-display);
        }

        @keyframes goldShimmer {
          0% {
            box-shadow: 0 10px 30px rgba(243, 156, 18, 0.4);
          }
          50% {
            box-shadow: 0 15px 40px rgba(243, 156, 18, 0.6);
          }
          100% {
            box-shadow: 0 10px 30px rgba(243, 156, 18, 0.4);
          }
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .conseils-button {
            position: static;
            margin-bottom: 15px;
            font-size: 0.8rem;
            padding: 8px 12px;
          }

          .header-actions {
            text-align: center;
          }

          .winner-name h3 {
            font-size: 2rem;
          }

          .winner-stats {
            flex-direction: column;
            gap: 1rem;
          }

          .winner-score,
          .winner-battles {
            padding: 0.8rem 1rem;
          }

          .score-value,
          .battles-value {
            font-size: 1.5rem;
          }
        }
      `}</style>
      <Footer />
    </div>
  );
}
