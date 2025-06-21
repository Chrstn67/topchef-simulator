"use client";

import { useState } from "react";
import "../styles/EnhancedPDFGenerator.css";

export default function EnhancedPDFGenerator({
  candidates = [],
  teams = [],
  battles = [],
  winner = null,
  juries = [],
  gameHistory = [],
}) {
  const [generating, setGenerating] = useState(false);

  // Fonction utilitaire pour vérifier et nettoyer les données
  const sanitizeData = () => {
    const safeCandidates = Array.isArray(candidates) ? candidates : [];
    const safeTeams = Array.isArray(teams) ? teams : [];
    const safeBattles = Array.isArray(battles) ? battles : [];

    return { safeCandidates, safeTeams, safeBattles };
  };

  // Fonction utilitaire pour obtenir tous les scores valides
  const getAllValidScores = (candidatesList) => {
    return candidatesList
      .flatMap((c) => {
        const scores = c.battleScores || c.scores || [];
        return Array.isArray(scores) ? scores : [];
      })
      .filter(
        (score) => typeof score === "number" && !isNaN(score) && score >= 0
      );
  };

  // Fonction utilitaire pour calculer les statistiques utiles
  const calculateUsefulStats = (scores) => {
    if (!Array.isArray(scores) || scores.length === 0) {
      return {
        min: 0,
        max: 0,
        average: 0,
        median: 0,
      };
    }

    const sortedScores = [...scores].sort((a, b) => a - b);
    const sum = scores.reduce((acc, score) => acc + score, 0);
    const average = sum / scores.length;
    const median = sortedScores[Math.floor(sortedScores.length / 2)];

    return {
      min: Math.min(...scores),
      max: Math.max(...scores),
      average,
      median,
    };
  };

  const generateEnhancedPDF = async () => {
    setGenerating(true);

    try {
      // Sanitize data first
      const { safeCandidates, safeTeams, safeBattles } = sanitizeData();

      // Import dynamique de jsPDF
      const jsPDFModule = await import("jspdf");
      const jsPDF = jsPDFModule.default || jsPDFModule.jsPDF;

      if (!jsPDF) {
        throw new Error("jsPDF n'a pas pu être importé correctement");
      }

      const doc = new jsPDF();
      let yPosition = 20;
      const pageHeight = doc.internal.pageSize.height;
      const pageWidth = doc.internal.pageSize.width;
      const margin = 20;

      // Fonction pour ajouter une nouvelle page
      const addNewPage = () => {
        doc.addPage();
        yPosition = 20;
      };

      // Fonction pour vérifier si on a assez de place pour une section
      const checkSectionSpace = (neededSpace) => {
        if (yPosition + neededSpace > pageHeight - margin) {
          addNewPage();
        }
      };

      // Fonction pour ajouter un titre de section (avec nouvelle page si nécessaire)
      const addSectionTitle = (title, fontSize = 16, minSpaceNeeded = 50) => {
        checkSectionSpace(minSpaceNeeded);

        doc.setFontSize(fontSize);
        doc.setTextColor(44, 44, 44);
        doc.setFont("helvetica", "bold");
        doc.text(title, margin, yPosition);
        yPosition += 5;

        // Ligne sous le titre
        doc.setDrawColor(44, 44, 44);
        doc.setLineWidth(0.5);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 15;
      };

      // Fonction pour ajouter un sous-titre
      const addSubTitle = (title, fontSize = 12) => {
        if (yPosition + 15 > pageHeight - margin) {
          addNewPage();
        }
        doc.setFontSize(fontSize);
        doc.setTextColor(66, 66, 66);
        doc.setFont("helvetica", "bold");
        doc.text(title, margin, yPosition);
        yPosition += 10;
      };

      // Fonction pour ajouter du texte normal
      const addText = (text, fontSize = 10) => {
        if (yPosition + 8 > pageHeight - margin) {
          addNewPage();
        }
        doc.setFontSize(fontSize);
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "normal");
        doc.text(text, margin, yPosition);
        yPosition += 8;
      };

      // Fonction pour créer un tableau (avec gestion des sauts de page)
      const createTable = (headers, data, startY) => {
        const tableWidth = pageWidth - 2 * margin;
        const colWidth = tableWidth / headers.length;
        let currentY = startY;

        // Vérifier qu'on a assez de place pour au moins l'en-tête + 3 lignes
        const minSpaceNeeded = 8 + 3 * 6 + 10;
        if (currentY + minSpaceNeeded > pageHeight - margin) {
          addNewPage();
          currentY = yPosition;
        }

        // En-têtes
        doc.setFillColor(240, 240, 240);
        doc.rect(margin, currentY, tableWidth, 8, "F");
        doc.setDrawColor(200, 200, 200);
        doc.rect(margin, currentY, tableWidth, 8);

        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);

        headers.forEach((header, index) => {
          doc.text(header, margin + index * colWidth + 2, currentY + 5);
        });

        currentY += 8;

        // Données
        doc.setFont("helvetica", "normal");
        data.forEach((row, rowIndex) => {
          // Vérifier si on a assez de place pour cette ligne
          if (currentY + 6 > pageHeight - margin) {
            addNewPage();
            currentY = yPosition;

            // Répéter les en-têtes sur la nouvelle page
            doc.setFillColor(240, 240, 240);
            doc.rect(margin, currentY, tableWidth, 8, "F");
            doc.setDrawColor(200, 200, 200);
            doc.rect(margin, currentY, tableWidth, 8);

            doc.setFontSize(9);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(0, 0, 0);

            headers.forEach((header, index) => {
              doc.text(header, margin + index * colWidth + 2, currentY + 5);
            });

            currentY += 8;
            doc.setFont("helvetica", "normal");
          }

          // Alternance de couleurs
          if (rowIndex % 2 === 0) {
            doc.setFillColor(248, 248, 248);
            doc.rect(margin, currentY, tableWidth, 6, "F");
          }

          doc.setDrawColor(220, 220, 220);
          doc.rect(margin, currentY, tableWidth, 6);

          row.forEach((cell, cellIndex) => {
            doc.text(
              String(cell),
              margin + cellIndex * colWidth + 2,
              currentY + 4
            );
          });

          currentY += 6;
        });

        yPosition = currentY + 10;
        return yPosition;
      };

      // EN-TÊTE PRINCIPAL
      doc.setFillColor(44, 44, 44);
      doc.rect(0, 0, pageWidth, 40, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text("TOP CHEF SIMULATOR", pageWidth / 2, 20, { align: "center" });

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("RAPPORT FINAL DE COMPETITION", pageWidth / 2, 30, {
        align: "center",
      });

      yPosition = 60;

      // RESUME EXECUTIF
      addSectionTitle("RESUME EXECUTIF", 18, 80);

      addText(`Date du concours: ${new Date().toLocaleDateString("fr-FR")}`);
      addText(`Nombre de candidats: ${safeCandidates.length}`);
      addText(`Nombre d'epreuves: ${safeBattles.length}`);
      addText(`Nombre de jures: ${juries?.length || 0}`);
      addText(
        `Vainqueur: ${winner?.name || "N/A"} avec ${
          winner?.averageScore?.toFixed(1) || "0.0"
        }/20`
      );

      const eliminatedCount = safeCandidates.filter((c) => c.eliminated).length;
      const finalistsCount = safeCandidates.filter((c) => !c.eliminated).length;
      addText(`Finalistes restants: ${finalistsCount}`);
      addText(`Candidats elimines: ${eliminatedCount}`);
      addText(
        `Taux de survie: ${(
          (finalistsCount / Math.max(safeCandidates.length, 1)) *
          100
        ).toFixed(1)}%`
      );

      // PODIUM
      addSectionTitle("PODIUM", 16, 60);

      const podium = safeCandidates
        .filter((c) => !c.eliminated)
        .sort((a, b) => (b.averageScore || 0) - (a.averageScore || 0))
        .slice(0, 3);

      const podiumData = podium.map((candidate, index) => [
        `${index + 1}${index === 0 ? "er" : "eme"}`,
        candidate.name || "N/A",
        `${(candidate.averageScore || 0).toFixed(1)}/20`,
      ]);

      createTable(
        ["Position", "Candidat", "Score Moyen"],
        podiumData,
        yPosition
      );

      // MOYENNES GENERALES
      addSectionTitle("MOYENNES GENERALES", 16, 80);

      const allScores = getAllValidScores(safeCandidates);

      if (allScores.length > 0) {
        const globalStats = calculateUsefulStats(allScores);

        const statsData = [
          [
            "Moyenne generale du concours",
            `${globalStats.average.toFixed(2)}/20`,
          ],
          ["Moyenne mediane", `${globalStats.median.toFixed(2)}/20`],
          ["Meilleur score obtenu", `${globalStats.max.toFixed(1)}/20`],
          ["Score le plus bas", `${globalStats.min.toFixed(1)}/20`],
          ["Nombre total de notes", allScores.length.toString()],
        ];

        // Moyennes par tranche de performance
        const excellentScores = allScores.filter((s) => s >= 16).length;
        const bonScores = allScores.filter((s) => s >= 12 && s < 16).length;
        const moyenScores = allScores.filter((s) => s >= 8 && s < 12).length;
        const faibleScores = allScores.filter((s) => s < 8).length;

        statsData.push([
          "Scores excellents (16+/20)",
          `${excellentScores} (${(
            (excellentScores / allScores.length) *
            100
          ).toFixed(1)}%)`,
        ]);
        statsData.push([
          "Scores bons (12-16/20)",
          `${bonScores} (${((bonScores / allScores.length) * 100).toFixed(
            1
          )}%)`,
        ]);
        statsData.push([
          "Scores moyens (8-12/20)",
          `${moyenScores} (${((moyenScores / allScores.length) * 100).toFixed(
            1
          )}%)`,
        ]);
        statsData.push([
          "Scores faibles (<8/20)",
          `${faibleScores} (${((faibleScores / allScores.length) * 100).toFixed(
            1
          )}%)`,
        ]);

        createTable(["Statistique", "Valeur"], statsData, yPosition);
      }

      // CLASSEMENT DES CANDIDATS
      addSectionTitle("CLASSEMENT DETAILLE DES CANDIDATS", 16, 100);

      const candidateStats = safeCandidates
        .map((candidate) => {
          const scores = candidate.battleScores || candidate.scores || [];
          const validScores = scores.filter(
            (s) => typeof s === "number" && !isNaN(s) && s >= 0
          );
          const stats = calculateUsefulStats(validScores);

          return {
            name: candidate.name || "N/A",
            average: candidate.averageScore || stats.average,
            best: stats.max,
            worst: stats.min,
            participations: validScores.length,
            eliminated: candidate.eliminated || false,
            eliminatedAt: candidate.eliminatedAtBattle,
            progression:
              validScores.length > 1
                ? validScores[validScores.length - 1] - validScores[0]
                : 0,
          };
        })
        .sort((a, b) => b.average - a.average);

      const candidateTableData = candidateStats.map((stat, index) => [
        (index + 1).toString(),
        stat.name.length > 15 ? stat.name.substring(0, 15) + "..." : stat.name,
        stat.average.toFixed(1),
        stat.best.toFixed(1),
        stat.worst.toFixed(1),
        stat.participations.toString(),
        stat.progression > 0
          ? `+${stat.progression.toFixed(1)}`
          : stat.progression.toFixed(1),
        stat.eliminated ? `Elimine E${stat.eliminatedAt || "?"}` : "Finaliste",
      ]);

      createTable(
        [
          "Rang",
          "Candidat",
          "Moyenne",
          "Meilleur",
          "Pire",
          "Epreuves",
          "Progression",
          "Statut",
        ],
        candidateTableData,
        yPosition
      );

      // MOYENNES PAR EQUIPE
      if (safeTeams.length > 0) {
        addSectionTitle("MOYENNES PAR EQUIPE", 16, 80);

        const teamStats = safeTeams
          .map((team) => {
            const teamCandidates = safeCandidates.filter(
              (c) => c.teamId === team.id
            );
            const teamScores = getAllValidScores(teamCandidates);
            const activeCandidates = teamCandidates.filter(
              (c) => !c.eliminated
            ).length;
            const eliminatedCandidates = teamCandidates.filter(
              (c) => c.eliminated
            ).length;
            const teamStatsCalc = calculateUsefulStats(teamScores);

            return {
              name: team.juryName || team.name || "N/A",
              candidates: teamCandidates.length,
              active: activeCandidates,
              eliminated: eliminatedCandidates,
              avgScore: teamStatsCalc.average,
              bestScore: teamStatsCalc.max,
              survivalRate:
                teamCandidates.length > 0
                  ? (activeCandidates / teamCandidates.length) * 100
                  : 0,
            };
          })
          .sort((a, b) => b.avgScore - a.avgScore);

        const teamTableData = teamStats.map((stat) => [
          stat.name.length > 12
            ? stat.name.substring(0, 12) + "..."
            : stat.name,
          stat.candidates.toString(),
          stat.active.toString(),
          stat.eliminated.toString(),
          stat.avgScore.toFixed(1),
          stat.bestScore.toFixed(1),
          `${stat.survivalRate.toFixed(0)}%`,
        ]);

        createTable(
          [
            "Equipe",
            "Total",
            "Finalistes",
            "Elimines",
            "Moyenne",
            "Meilleur Score",
            "Taux Survie",
          ],
          teamTableData,
          yPosition
        );
      }

      // MOYENNES PAR EPREUVE
      let battleStats = [];
      if (safeBattles.length > 0) {
        addSectionTitle("MOYENNES PAR EPREUVE", 16, 80);

        battleStats = safeBattles.map((battle, index) => {
          const battleResults = Array.isArray(battle.results)
            ? battle.results
            : [];
          const battleScores = battleResults
            .map((r) => r.battleScore || 0)
            .filter((s) => typeof s === "number" && !isNaN(s) && s > 0);

          const battleStatsCalc = calculateUsefulStats(battleScores);

          return {
            round: battle.round || index + 1,
            challenge: (battle.challenge || "Epreuve inconnue").substring(
              0,
              25
            ),
            participants: battleResults.length,
            avgScore: battleStatsCalc.average,
            bestScore: battleStatsCalc.max,
            worstScore: battleStatsCalc.min,
            difficulty:
              battleStatsCalc.average > 0
                ? ((20 - battleStatsCalc.average) / 20) * 100
                : 0,
            eliminated:
              battleResults.length > 0
                ? battleResults[battleResults.length - 1]?.name || "N/A"
                : "N/A",
          };
        });

        const battleTableData = battleStats.map((stat) => [
          stat.round.toString(),
          stat.challenge,
          stat.participants.toString(),
          stat.avgScore.toFixed(1),
          stat.bestScore.toFixed(1),
          stat.worstScore.toFixed(1),
          `${stat.difficulty.toFixed(0)}%`,
          stat.eliminated.length > 10
            ? stat.eliminated.substring(0, 10) + "..."
            : stat.eliminated,
        ]);

        createTable(
          [
            "Epreuve",
            "Defi",
            "Participants",
            "Moyenne",
            "Meilleur",
            "Pire",
            "Difficulte",
            "Elimine",
          ],
          battleTableData,
          yPosition
        );
      }

      // HISTORIQUE DES EPREUVES
      if (safeBattles.length > 0) {
        addSectionTitle("HISTORIQUE DETAILLE DES EPREUVES", 16, 100);

        safeBattles.forEach((battle, index) => {
          // S'assurer qu'on a assez de place pour toute l'épreuve
          checkSectionSpace(40);

          addSubTitle(
            `Epreuve ${battle.round || index + 1}: ${
              battle.challenge || "Defi inconnu"
            }`
          );

          const battleResults = Array.isArray(battle.results)
            ? battle.results
            : [];
          if (battleResults.length > 0) {
            // Moyenne de l'épreuve
            const battleScores = battleResults
              .map((r) => r.battleScore || 0)
              .filter((s) => s > 0);
            if (battleScores.length > 0) {
              const avgScore =
                battleScores.reduce((a, b) => a + b, 0) / battleScores.length;
              addText(`Moyenne de l'epreuve: ${avgScore.toFixed(1)}/20`);
            }

            // Top 3
            const top3 = battleResults.slice(0, 3);
            top3.forEach((result, i) => {
              addText(
                `${i + 1}. ${result.name || "N/A"} - ${(
                  result.battleScore || 0
                ).toFixed(1)}/20`
              );
            });

            // Candidat éliminé
            if (battleResults.length > 3) {
              const eliminated = battleResults[battleResults.length - 1];
              addText(
                `ELIMINE: ${eliminated?.name || "N/A"} - ${(
                  eliminated?.battleScore || 0
                ).toFixed(1)}/20`
              );
            }
          }
          yPosition += 5;
        });
      }

      // FAITS MARQUANTS
      addSectionTitle("FAITS MARQUANTS", 16, 60);

      const records = [];

      if (candidateStats.length > 0) {
        const bestCandidate = candidateStats[0];
        const worstCandidate = candidateStats[candidateStats.length - 1];

        records.push(
          `Meilleur candidat: ${
            bestCandidate.name
          } avec ${bestCandidate.average.toFixed(1)}/20 de moyenne`
        );

        if (worstCandidate.eliminated) {
          records.push(
            `Dernier elimine: ${
              worstCandidate.name
            } avec ${worstCandidate.average.toFixed(1)}/20 de moyenne`
          );
        }

        const bestProgression = candidateStats.reduce(
          (max, candidate) =>
            candidate.progression > max.progression ? candidate : max,
          candidateStats[0]
        );

        if (bestProgression.progression > 0) {
          records.push(
            `Meilleure progression: ${
              bestProgression.name
            } (+${bestProgression.progression.toFixed(1)} points)`
          );
        }

        const mostParticipations = candidateStats.reduce(
          (max, candidate) =>
            candidate.participations > max.participations ? candidate : max,
          candidateStats[0]
        );

        records.push(
          `Plus d'epreuves: ${mostParticipations.name} avec ${mostParticipations.participations} participations`
        );
      }

      if (safeBattles.length > 0 && battleStats.length > 0) {
        const hardestBattle = battleStats.reduce(
          (max, battle) => (battle.difficulty > max.difficulty ? battle : max),
          battleStats[0]
        );
        const easiestBattle = battleStats.reduce(
          (min, battle) => (battle.difficulty < min.difficulty ? battle : min),
          battleStats[0]
        );

        records.push(
          `Epreuve la plus difficile: ${
            hardestBattle.challenge
          } (moyenne: ${hardestBattle.avgScore.toFixed(1)}/20)`
        );
        records.push(
          `Epreuve la plus facile: ${
            easiestBattle.challenge
          } (moyenne: ${easiestBattle.avgScore.toFixed(1)}/20)`
        );
      }

      records.push(
        `Taux d'elimination global: ${(
          (eliminatedCount / Math.max(safeCandidates.length, 1)) *
          100
        ).toFixed(1)}%`
      );

      records.forEach((record) => {
        addText(`- ${record}`);
      });

      // CLASSEMENT FINAL
      addSectionTitle("CLASSEMENT FINAL OFFICIEL", 16, 100);

      const sortedCandidates = [...safeCandidates].sort((a, b) => {
        if (a.eliminated && !b.eliminated) return 1;
        if (!a.eliminated && b.eliminated) return -1;
        return (b.averageScore || 0) - (a.averageScore || 0);
      });

      const finalTableData = sortedCandidates.map((candidate, index) => {
        const team = safeTeams.find((t) => t.id === candidate.teamId);
        const status = candidate.eliminated
          ? `Elimine E${candidate.eliminatedAtBattle || "?"}`
          : "Finaliste";

        return [
          (index + 1).toString(),
          candidate.name || "N/A",
          (team?.juryName || "N/A").length > 12
            ? (team?.juryName || "N/A").substring(0, 12) + "..."
            : team?.juryName || "N/A",
          `${(candidate.averageScore || 0).toFixed(1)}/20`,
          status,
        ];
      });

      createTable(
        ["Rang", "Candidat", "Equipe", "Moyenne Finale", "Statut"],
        finalTableData,
        yPosition
      );

      // PIED DE PAGE
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);

        doc.setFillColor(240, 240, 240);
        doc.rect(0, pageHeight - 15, pageWidth, 15, "F");

        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.setFont("helvetica", "normal");
        doc.text(
          `Top Chef Simulator - Rapport Final - Page ${i}/${totalPages} - ${new Date().toLocaleDateString(
            "fr-FR"
          )}`,
          pageWidth / 2,
          pageHeight - 5,
          { align: "center" }
        );
      }

      // Sauvegarder le PDF
      const fileName = `TopChef_Rapport_${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error);
      alert("Erreur lors de la génération du PDF: " + error.message);
    } finally {
      setGenerating(false);
    }
  };

  // Calculer les statistiques pour l'aperçu
  const { safeCandidates, safeTeams, safeBattles } = sanitizeData();
  const totalBattles = safeBattles.length;
  const eliminatedCount = safeCandidates.filter((c) => c.eliminated).length;
  const finalistsCount = safeCandidates.filter((c) => !c.eliminated).length;

  const allScores = getAllValidScores(safeCandidates);
  const globalStats = calculateUsefulStats(allScores);

  const teamStats = safeTeams.map((team) => {
    const teamCandidates = safeCandidates.filter((c) => c.teamId === team.id);
    return {
      name: team.juryName || team.name || "N/A",
      active: teamCandidates.filter((c) => !c.eliminated).length,
      total: teamCandidates.length,
    };
  });

  const bestTeam =
    teamStats.length > 0
      ? teamStats.reduce(
          (max, team) => (team.active > max.active ? team : max),
          teamStats[0]
        )
      : { name: "N/A" };

  return (
    <div className="enhanced-pdf-generator">
      <h2>Rapport Final Professionnel</h2>
      <p>
        Générez un rapport PDF complet avec des statistiques utiles et des
        moyennes détaillées.
      </p>

      <div className="pdf-preview">
        <div className="preview-section">
          <h3>Contenu du rapport :</h3>
          <div className="preview-grid">
            <div className="preview-item">
              <span className="icon">📋</span>
              <div>
                <strong>Résumé exécutif</strong>
                <p>Vue d'ensemble et taux de survie</p>
              </div>
            </div>
            <div className="preview-item">
              <span className="icon">🏆</span>
              <div>
                <strong>Podium officiel</strong>
                <p>Top 3 avec moyennes</p>
              </div>
            </div>
            <div className="preview-item">
              <span className="icon">📊</span>
              <div>
                <strong>Moyennes générales</strong>
                <p>Statistiques par tranches de performance</p>
              </div>
            </div>
            <div className="preview-item">
              <span className="icon">👥</span>
              <div>
                <strong>Classement des candidats</strong>
                <p>Moyennes et progressions</p>
              </div>
            </div>
            <div className="preview-item">
              <span className="icon">🏢</span>
              <div>
                <strong>Moyennes par équipe</strong>
                <p>Performance et taux de survie</p>
              </div>
            </div>
            <div className="preview-item">
              <span className="icon">⚔️</span>
              <div>
                <strong>Moyennes par épreuve</strong>
                <p>Difficulté et résultats</p>
              </div>
            </div>
          </div>
        </div>

        <div className="stats-preview">
          <h3>Aperçu des moyennes :</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-number">
                {winner?.averageScore?.toFixed(1) || "0.0"}
              </span>
              <span className="stat-label">Moyenne vainqueur</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">
                {globalStats.average.toFixed(1)}
              </span>
              <span className="stat-label">Moyenne générale</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{totalBattles}</span>
              <span className="stat-label">Épreuves</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{finalistsCount}</span>
              <span className="stat-label">Finalistes</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">
                {bestTeam.name.substring(0, 8)}
              </span>
              <span className="stat-label">Meilleure équipe</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">
                {(
                  (finalistsCount / Math.max(safeCandidates.length, 1)) *
                  100
                ).toFixed(0)}
                %
              </span>
              <span className="stat-label">Taux de survie</span>
            </div>
          </div>
        </div>
      </div>

      <button
        className="generate-enhanced-pdf-button"
        onClick={generateEnhancedPDF}
        disabled={generating}
      >
        {generating ? (
          <>
            <div className="spinner-small"></div>
            Génération en cours...
          </>
        ) : (
          <>Générer le rapport PDF</>
        )}
      </button>
    </div>
  );
}
