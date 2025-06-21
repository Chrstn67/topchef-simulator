"use client";

import { useState } from "react";

import "../styles/Conseils.css";

export default function Conseils({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState("hygiene");

  if (!isOpen) return null;

  const hygieneRules = [
    {
      title: "Lavage des mains",
      description:
        "Se laver les mains avec de l’eau et du savon pendant 20 à 30 secondes : avant de cuisiner, après être allé aux toilettes, après s’être mouché ou avoir toussé, et après chaque manipulation d’aliments crus.",
      icon: "🧼",
    },
    {
      title: "Désinfection des mains",
      description:
        "Si pas d’accès immédiat à un point d’eau : utiliser du gel hydroalcoolique (au moins 60 % d’alcool) avant et après les activités collectives.",
      icon: "🧴",
    },
    {
      title: "Surfaces de travail",
      description:
        "Nettoyer avec de l’eau savonneuse puis désinfecter les plans de travail, les tables et les poignées avant et après usage.",
      icon: "🧽",
    },
    {
      title: "Matériel personnel",
      description:
        "Chacun utilise sa propre gourde, ses couverts, son verre. Aucun partage de nourriture ou d’ustensiles.",
      icon: "🥤",
    },
    {
      title: "Séparation des aliments",
      description:
        "Toujours séparer les aliments crus (notamment viandes/œufs) des aliments prêts à consommer (pain, crudités) pour éviter les contaminations croisées.",
      icon: "🥩",
    },
    {
      title: "Conservation des aliments",
      description:
        "Respecter la chaîne du froid : conserver les produits frais à 4°C max, ne jamais rompre la chaîne même brièvement. Utiliser une glacière si besoin.",
      icon: "❄️",
    },
    {
      title: "Cuisson sécurisée",
      description:
        "Cuire toutes les viandes à cœur (min. 75°C). Les plats cuisinés doivent être maintenus au chaud à plus de 63°C jusqu'à consommation.",
      icon: "♨️",
    },
    {
      title: "Ustensiles propres",
      description:
        "Utiliser des ustensiles propres et dédiés pour chaque type d’aliment (couteaux, planches, pinces). Laver immédiatement après usage.",
      icon: "🔪",
    },
    {
      title: "Goûter les préparations",
      description:
        "Ne jamais goûter avec les doigts ou avec un couvert qui retourne dans le plat. Utiliser une cuillère propre à chaque test.",
      icon: "🥄",
    },
    {
      title: "Stockage des restes",
      description:
        "Ne jamais laisser de restes à température ambiante plus de 2h. Refroidir rapidement et stocker au frais dans des contenants hermétiques.",
      icon: "📦",
    },
    {
      title: "Blessures ou maladies",
      description:
        "Aucune personne blessée (coupure, plaie ouverte) ou malade (fièvre, toux, gastro) ne doit manipuler les aliments.",
      icon: "🚫",
    },
    {
      title: "Hygiène corporelle",
      description:
        "Cheveux attachés, pas de bijoux aux mains, ongles courts et propres. Porter une charlotte et un tablier si possible.",
      icon: "🧑‍🍳",
    },
    {
      title: "Gestion des déchets",
      description:
        "Jeter régulièrement les déchets dans des sacs fermés. Se laver les mains après avoir manipulé les poubelles.",
      icon: "🗑️",
    },
  ];

  const timingTips = [
    {
      category: "Entrées",
      items: [
        {
          dish: "Salade composée",
          time: "15-20 min",
          tip: "Préparer la vinaigrette en premier",
        },
        {
          dish: "Carpaccio",
          time: "10-15 min",
          tip: "Congeler la viande 30 min avant pour faciliter la découpe",
        },
        {
          dish: "Velouté",
          time: "30-40 min",
          tip: "Commencer par faire suer les légumes",
        },
      ],
    },
    {
      category: "Plats principaux",
      items: [
        {
          dish: "Poisson grillé",
          time: "15-20 min",
          tip: "Sortir du frigo 10 min avant cuisson",
        },
        {
          dish: "Viande rouge",
          time: "20-30 min",
          tip: "Laisser reposer 5 min après cuisson",
        },
        {
          dish: "Risotto",
          time: "25-35 min",
          tip: "Chauffer le bouillon en parallèle",
        },
      ],
    },
    {
      category: "Desserts",
      items: [
        {
          dish: "Mousse au chocolat",
          time: "20 min + 2h frigo",
          tip: "Préparer en premier pour le temps de prise",
        },
        {
          dish: "Tarte aux fruits",
          time: "45 min + cuisson",
          tip: "Précuire la pâte à blanc",
        },
        {
          dish: "Soufflé",
          time: "30 min",
          tip: "Servir immédiatement après cuisson",
        },
      ],
    },
  ];

  return (
    <div className="conseils-overlay">
      <div className="conseils-modal">
        <div className="conseils-header">
          <h2>📋 Conseils de Cuisine</h2>
          <button className="close-button" onClick={onClose}>
            ❌
          </button>
        </div>

        <div className="conseils-tabs">
          <button
            className={`tab ${activeTab === "hygiene" ? "active" : ""}`}
            onClick={() => setActiveTab("hygiene")}
          >
            🧼 Hygiène
          </button>
          <button
            className={`tab ${activeTab === "timing" ? "active" : ""}`}
            onClick={() => setActiveTab("timing")}
          >
            ⏱️ Timing
          </button>
        </div>

        <div className="conseils-content">
          {activeTab === "hygiene" && (
            <div className="hygiene-section">
              <h3>Règles d'hygiène essentielles</h3>
              <div className="rules-grid">
                {hygieneRules.map((rule, index) => (
                  <div key={index} className="rule-card">
                    <div className="rule-icon">{rule.icon}</div>
                    <div className="rule-text">
                      <h4>{rule.title}</h4>
                      <p>{rule.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="hygiene-reminder">
                <strong>⚠️ Rappel important :</strong> En cas de doute sur la
                fraîcheur d'un aliment, ne pas l'utiliser !
              </div>
            </div>
          )}

          {activeTab === "timing" && (
            <div className="timing-section">
              <h3>Conseils de préparation et timing</h3>
              {timingTips.map((category, index) => (
                <div key={index} className="timing-category">
                  <h4>{category.category}</h4>
                  <div className="timing-items">
                    {category.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="timing-item">
                        <div className="dish-info">
                          <strong>{item.dish}</strong>
                          <span className="time-badge">{item.time}</span>
                        </div>
                        <p className="tip">💡 {item.tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div className="timing-general-tips">
                <h4>Conseils généraux de timing</h4>
                <ul>
                  <li>
                    <strong>Mise en place :</strong> Préparer tous les
                    ingrédients avant de commencer
                  </li>
                  <li>
                    <strong>Multitâche :</strong> Utiliser les temps de cuisson
                    pour préparer d'autres éléments
                  </li>
                  <li>
                    <strong>Service :</strong> Prévoir 5-10 min de battement
                    pour le dressage
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
