"use client";

import { useState } from "react";
import "../styles/Conseils.css";

export default function Conseils({ isOpen = true, onClose = () => {} }) {
  const [activeTab, setActiveTab] = useState("hygiene");

  if (!isOpen) return null;

  const hygieneRules = [
    {
      title: "Lavage des mains",
      description:
        "Se laver les mains avec de l'eau et du savon pendant 20 à 30 secondes : avant de cuisiner, après être allé aux toilettes, après s'être mouché ou avoir toussé, et après chaque manipulation d'aliments crus.",
      icon: "🧼",
    },
    {
      title: "Désinfection des mains",
      description:
        "Si pas d'accès immédiat à un point d'eau : utiliser du gel hydroalcoolique (au moins 60 % d'alcool) avant et après les activités collectives.",
      icon: "🧴",
    },
    {
      title: "Surfaces de travail",
      description:
        "Nettoyer avec de l'eau savonneuse puis désinfecter les plans de travail, les tables et les poignées avant et après usage.",
      icon: "🧽",
    },
    {
      title: "Matériel personnel",
      description:
        "Chacun utilise sa propre gourde, ses couverts, son verre. Aucun partage de nourriture ou d'ustensiles.",
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
        "Utiliser des ustensiles propres et dédiés pour chaque type d'aliment (couteaux, planches, pinces). Laver immédiatement après usage.",
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
      category: "Plats de Pâtes",
      icon: "🍝",
      color: "#ff6b6b",
      items: [
        {
          dish: "Pâtes à la bolognaise",
          time: "45 min",
          tip: "Préparer la sauce en premier, laisser mijoter pendant que l'eau chauffe et les pâtes cuisent",
        },
        {
          dish: "Pâtes à la carbonara",
          time: "20-25 min",
          tip: "Préparer la sauce hors du feu pour éviter de cuire les œufs, mélanger rapidement avec les pâtes chaudes",
        },
        {
          dish: "Pâtes twist créatives (pesto roquette-noix, citron-ricotta)",
          time: "25-30 min",
          tip: "Mixer les ingrédients de la sauce pendant la cuisson des pâtes pour optimiser le temps",
        },
      ],
    },
    {
      category: "Mini-Burgers",
      icon: "🍔",
      color: "#4ecdc4",
      items: [
        {
          dish: "Mini-burgers classiques",
          time: "30-40 min",
          tip: "Former les steaks et préparer la garniture pendant la cuisson des pains ou steaks",
        },
        {
          dish: "Mini-burgers originaux (falafel, saumon, fromage raclette)",
          time: "35-45 min",
          tip: "Faire les sauces et tailler les garnitures à l'avance pour pouvoir tout assembler rapidement",
        },
      ],
    },
    {
      category: "Sauces & Accompagnements",
      icon: "🍯",
      color: "#f39c12",
      items: [
        {
          dish: "Sauce burger maison",
          time: "5-10 min",
          tip: "Mélanger mayo, ketchup, cornichons hachés, oignon, moutarde, paprika : préparer en début de session",
        },
      ],
    },
    {
      category: "Crêpes",
      icon: "🥞",
      color: "#9b59b6",
      items: [
        {
          dish: "Crêpes aux fruits",
          time: "30-40 min",
          tip: "Faire la pâte à l'avance (repos = meilleure texture), et laver/tailler les fruits pendant ce temps",
        },
        {
          dish: "Crêpes twist (matcha-mangue, cacao-banane flambée)",
          time: "35-45 min",
          tip: "Préparer les garnitures pendant la cuisson des crêpes pour servir chaud",
        },
      ],
    },
    {
      category: "Cookies & Pâtisseries",
      icon: "🍪",
      color: "#e67e22",
      items: [
        {
          dish: "Cookies classiques",
          time: "15 min + cuisson 10-12 min",
          tip: "Former les boules à l'avance, et enfourner à la fin de la session pour un effet « sortie du four »",
        },
        {
          dish: "Cookies originaux (chocolat blanc-framboise, tahini-noisette)",
          time: "25-30 min",
          tip: "Ne pas hésiter à surgeler la pâte pour une meilleure tenue pendant la cuisson",
        },
      ],
    },
  ];

  return (
    <div className="conseils-overlay">
      <div className="conseils-modal">
        <div className="conseils-header">
          <h2 className="conseils-header-title">📋 Conseils de Cuisine</h2>
          <button className="conseils-close-button" onClick={onClose}>
            ❌
          </button>
        </div>

        <div className="conseils-tabs">
          <button
            className={`conseils-tab ${
              activeTab === "hygiene" ? "active" : ""
            }`}
            onClick={() => setActiveTab("hygiene")}
          >
            🧼 Hygiène
          </button>
          <button
            className={`conseils-tab ${activeTab === "timing" ? "active" : ""}`}
            onClick={() => setActiveTab("timing")}
          >
            ⏱️ Timing
          </button>
        </div>

        <div className="conseils-content">
          {activeTab === "hygiene" && (
            <div className="hygiene-section">
              <h3 className="section-title">Règles d'hygiène essentielles</h3>
              <div className="rules-grid">
                {hygieneRules.map((rule, index) => (
                  <div key={index} className="rule-card">
                    <div className="rule-icon">{rule.icon}</div>
                    <div className="rule-text">
                      <h4 className="rule-title">{rule.title}</h4>
                      <p className="rule-description">{rule.description}</p>
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
              <h3 className="section-title">
                Conseils de préparation et timing par catégorie
              </h3>
              {timingTips.map((category, index) => (
                <div key={index} className="timing-category">
                  <h4
                    className="category-header"
                    style={{
                      background: `linear-gradient(135deg, ${category.color}, ${category.color}dd)`,
                    }}
                  >
                    <span className="category-icon">{category.icon}</span>
                    {category.category}
                  </h4>
                  <div className="timing-items">
                    {category.items.map((item, itemIndex) => (
                      <div
                        key={itemIndex}
                        className={`timing-item ${
                          itemIndex === category.items.length - 1 ? "last" : ""
                        }`}
                      >
                        <div className="dish-info">
                          <span className="dish-name">{item.dish}</span>
                          <span
                            className="time-badge"
                            style={{ background: category.color }}
                          >
                            {item.time}
                          </span>
                        </div>
                        <p className="dish-tip">💡 {item.tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div className="general-tips">
                <h4 className="general-tips-title">
                  Conseils généraux de timing
                </h4>
                <ul className="general-tips-list">
                  <li className="general-tips-item">
                    <strong>Mise en place :</strong> Préparer tous les
                    ingrédients avant de commencer
                  </li>
                  <li className="general-tips-item">
                    <strong>Multitâche :</strong> Utiliser les temps de cuisson
                    pour préparer d'autres éléments
                  </li>
                  <li className="general-tips-item">
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
