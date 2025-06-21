"use client"

import { useState } from "react"
import "../styles/PDFGenerator.css"

export default function PDFGenerator({ candidates, teams, battles, winner, juries, gameHistory }) {
  const [generating, setGenerating] = useState(false)

  const generatePDF = async () => {
    setGenerating(true)

    try {
      // Dynamically import jsPDF
      const { jsPDF } = await import("jspdf")
      const doc = new jsPDF()

      let yPosition = 20
      const pageHeight = doc.internal.pageSize.height
      const margin = 20

      // Fonction pour ajouter une nouvelle page si nécessaire
      const checkPageBreak = (neededSpace) => {
        if (yPosition + neededSpace > pageHeight - margin) {
          doc.addPage()
          yPosition = 20
        }
      }

      // Titre principal
      doc.setFontSize(24)
      doc.setTextColor(220, 20, 60)
      doc.text("TOP CHEF - RAPPORT FINAL", 20, yPosition)
      yPosition += 20

      // Informations générales
      doc.setFontSize(16)
      doc.setTextColor(0, 0, 0)
      doc.text("INFORMATIONS GENERALES", 20, yPosition)
      yPosition += 10

      doc.setFontSize(12)
      doc.text(`Date: ${new Date().toLocaleDateString("fr-FR")}`, 20, yPosition)
      yPosition += 8
      doc.text(`Nombre de jures: ${juries.length}`, 20, yPosition)
      yPosition += 8
      doc.text(`Nombre de candidats: ${candidates.length}`, 20, yPosition)
      yPosition += 8
      doc.text(`Nombre de battles: ${battles.length}`, 20, yPosition)
      yPosition += 15

      // Vainqueur
      checkPageBreak(30)
      doc.setFontSize(18)
      doc.setTextColor(255, 215, 0)
      doc.text("VAINQUEUR", 20, yPosition)
      yPosition += 15

      doc.setFontSize(14)
      doc.setTextColor(0, 0, 0)
      doc.text(`${winner.name} - Moyenne: ${winner.averageScore.toFixed(1)}/20`, 20, yPosition)
      yPosition += 20

      // Classement final
      checkPageBreak(40)
      doc.setFontSize(16)
      doc.text("CLASSEMENT FINAL", 20, yPosition)
      yPosition += 15

      const sortedCandidates = [...candidates].sort((a, b) => {
        if (a.eliminated && !b.eliminated) return 1
        if (!a.eliminated && b.eliminated) return -1
        return b.averageScore - a.averageScore
      })

      doc.setFontSize(10)
      sortedCandidates.forEach((candidate, index) => {
        checkPageBreak(8)
        const rank = !candidate.eliminated ? index + 1 : "Elimine"
        const status = candidate.eliminated ? "ELIMINE" : "FINALISTE"
        doc.text(`${rank}. ${candidate.name} - ${candidate.averageScore.toFixed(1)}/20 - ${status}`, 20, yPosition)
        yPosition += 6
      })

      yPosition += 10

      // Équipes
      checkPageBreak(40)
      doc.setFontSize(16)
      doc.text("COMPOSITION DES EQUIPES", 20, yPosition)
      yPosition += 15

      teams.forEach((team) => {
        checkPageBreak(20)
        doc.setFontSize(12)
        doc.text(`Equipe ${team.juryName}:`, 20, yPosition)
        yPosition += 8

        team.candidates.forEach((candidate) => {
          checkPageBreak(6)
          doc.setFontSize(10)
          const candidateData = candidates.find((c) => c.id === candidate.id)
          doc.text(
            `  - ${candidate.name} (Moyenne: ${candidateData?.averageScore.toFixed(1) || "0.0"}/20)`,
            25,
            yPosition,
          )
          yPosition += 5
        })
        yPosition += 5
      })

      // Historique des battles
      checkPageBreak(40)
      doc.setFontSize(16)
      doc.text("HISTORIQUE DES BATTLES", 20, yPosition)
      yPosition += 15

      battles.forEach((battle, index) => {
        checkPageBreak(30)
        doc.setFontSize(12)
        doc.text(`Battle ${index + 1}: ${battle.challenge}`, 20, yPosition)
        yPosition += 8

        doc.setFontSize(10)
        doc.text(`Type: ${battle.type === "team" ? "Equipe" : "Individuelle"}`, 25, yPosition)
        yPosition += 6

        if (battle.results) {
          battle.results.forEach((result, resultIndex) => {
            checkPageBreak(6)
            const status = resultIndex === battle.results.length - 1 ? " (ELIMINE)" : ""
            doc.text(
              `  ${resultIndex + 1}. ${result.name} - ${result.battleScore.toFixed(1)}/20${status}`,
              30,
              yPosition,
            )
            yPosition += 5
          })
        }
        yPosition += 8
      })

      // Parcours détaillé de chaque candidat
      candidates.forEach((candidate) => {
        checkPageBreak(50)
        doc.setFontSize(14)
        doc.text(`PARCOURS DE ${candidate.name.toUpperCase()}`, 20, yPosition)
        yPosition += 12

        doc.setFontSize(10)
        doc.text(`Statut final: ${candidate.eliminated ? "Elimine" : "Finaliste"}`, 20, yPosition)
        yPosition += 6
        doc.text(`Moyenne generale: ${candidate.averageScore.toFixed(1)}/20`, 20, yPosition)
        yPosition += 6
        doc.text(`Nombre de battles: ${candidate.scores.length}`, 20, yPosition)
        yPosition += 8

        if (candidate.scores.length > 0) {
          doc.text("Scores par battle:", 20, yPosition)
          yPosition += 6

          candidate.scores.forEach((score, index) => {
            checkPageBreak(5)
            doc.text(`  Battle ${index + 1}: ${score.toFixed(1)}/20`, 25, yPosition)
            yPosition += 5
          })
        }
        yPosition += 10
      })

      // Sauvegarder le PDF
      doc.save("top-chef-rapport.pdf")
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error)
      alert("Erreur lors de la génération du PDF")
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="pdf-generator">
      <h2>📄 Rapport Final</h2>
      <p>Générez un rapport PDF complet du concours avec tous les détails.</p>

      <div className="pdf-content-preview">
        <h3>Le rapport contiendra :</h3>
        <ul>
          <li>✅ Informations générales du concours</li>
          <li>🏆 Vainqueur et podium</li>
          <li>📊 Classement final complet</li>
          <li>👥 Composition des équipes</li>
          <li>⚔️ Historique de toutes les battles</li>
          <li>📈 Parcours détaillé de chaque candidat</li>
          <li>📋 Statistiques et moyennes</li>
        </ul>
      </div>

      <button className="generate-pdf-button" onClick={generatePDF} disabled={generating}>
        {generating ? (
          <>
            <div className="spinner-small"></div>
            Génération en cours...
          </>
        ) : (
          <>📄 Générer le rapport PDF</>
        )}
      </button>
    </div>
  )
}
