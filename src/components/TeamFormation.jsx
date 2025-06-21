"use client"

import { useState, useEffect } from "react"
import "../styles/TeamFormation.css"

export default function TeamFormation({ juries, candidates, setCandidates, teams, setTeams, onNext }) {
  const [autoTeams, setAutoTeams] = useState([])

  useEffect(() => {
    generateTeams()
  }, [juries, candidates])

  const generateTeams = () => {
    if (juries.length === 0 || candidates.length === 0) return

    const candidatesPerTeam = Math.floor(candidates.length / juries.length)
    const remainder = candidates.length % juries.length

    // Trier les candidats par nom
    const sortedCandidates = [...candidates].sort((a, b) => a.name.localeCompare(b.name))
    const shuffledCandidates = [...sortedCandidates].sort(() => Math.random() - 0.5)
    const newTeams = []

    let candidateIndex = 0

    // Répartir les candidats supplémentaires de manière plus équitable
    const teamSizes = juries.map((_, index) => candidatesPerTeam + (index < remainder ? 1 : 0))

    // Mélanger les tailles pour une répartition plus équitable
    for (let i = teamSizes.length - 1; i > 0; i--) {
      if (teamSizes[i] > teamSizes[i - 1] && Math.random() > 0.5) {
        ;[teamSizes[i], teamSizes[i - 1]] = [teamSizes[i - 1], teamSizes[i]]
      }
    }

    juries.forEach((jury, index) => {
      const teamSize = teamSizes[index]
      const teamCandidates = shuffledCandidates.slice(candidateIndex, candidateIndex + teamSize)

      newTeams.push({
        id: jury.id,
        juryName: jury.name,
        candidates: teamCandidates.map((c) => ({ ...c, teamId: jury.id })).sort((a, b) => a.name.localeCompare(b.name)),
        color: getTeamColor(index),
      })

      candidateIndex += teamSize
    })

    setAutoTeams(newTeams)
  }

  const getTeamColor = (index) => {
    const colors = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#feca57", "#ff9ff3", "#54a0ff"]
    return colors[index % colors.length]
  }

  const confirmTeams = () => {
    setTeams(autoTeams)

    // Mettre à jour les candidats avec leur teamId
    const updatedCandidates = candidates.map((candidate) => {
      const team = autoTeams.find((team) => team.candidates.some((c) => c.id === candidate.id))
      return { ...candidate, teamId: team ? team.id : null }
    })

    setCandidates(updatedCandidates)
    onNext()
  }

  return (
    <div className="team-formation">
      <h2>🏆 Formation des Équipes</h2>

      <div className="team-stats">
        <div className="stat">
          <span className="stat-number">{juries.length}</span>
          <span className="stat-label">Jurés</span>
        </div>
        <div className="stat">
          <span className="stat-number">{candidates.length}</span>
          <span className="stat-label">Candidats</span>
        </div>
        <div className="stat">
          <span className="stat-number">{Math.floor(candidates.length / juries.length)}</span>
          <span className="stat-label">Candidats/Équipe</span>
        </div>
      </div>

      <div className="teams-container">
        {autoTeams.map((team, index) => (
          <div key={team.id} className="team-card" style={{ borderColor: team.color }}>
            <div className="team-header" style={{ backgroundColor: team.color }}>
              <h3>Équipe {team.juryName}</h3>
              <span className="team-count">{team.candidates.length} candidats</span>
            </div>
            <div className="team-candidates">
              {team.candidates.map((candidate) => (
                <div key={candidate.id} className="candidate-chip">
                  👨‍🍳 {candidate.name}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="team-actions">
        <button className="regenerate-button" onClick={generateTeams}>
          🔄 Régénérer les équipes
        </button>
        <button className="confirm-button" onClick={confirmTeams}>
          ✅ Confirmer les équipes
        </button>
      </div>
    </div>
  )
}
