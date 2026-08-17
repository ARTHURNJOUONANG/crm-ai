import React, { useState, useEffect } from "react"
import "./Landing.css"

function Landing({ onStart }) {
  const [visibleSections, setVisibleSections] = useState({})

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setVisibleSections((prev) => ({
            ...prev,
            [entry.target.id]: true,
          }))
        }
      })
    }, { threshold: 0.2 })

    document.querySelectorAll("[data-animate]").forEach((el) => {
      observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <div className="landing">
      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-animated">
            <img src="/logo.png" alt="Solocal" className="hero-logo" />
            <h1>Solocal CRM</h1>
            <p className="hero-subtitle">Transformez vos contacts en opportunites</p>
            <button className="cta-button" onClick={onStart}>
              Lancer le CRM →
            </button>
          </div>
        </div>
        <div className="hero-background">
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>
          <div className="blob blob-3"></div>
        </div>
      </section>

      {/* HERO IMAGE - TEAM */}
      <section id="hero-visual" data-animate className={`section hero-visual ${visibleSections["hero-visual"] ? "visible" : ""}`}>
        <div className="mockup-container">
          <div className="browser-mockup">
            <div className="browser-header">
              <div className="browser-button"></div>
              <div className="browser-button"></div>
              <div className="browser-button"></div>
              <div className="browser-url">solocal-crm.app</div>
            </div>
            <div className="browser-content">
              <div className="dashboard-mockup">
                <div className="dashboard-header">Dashboard - Vue d'ensemble</div>
                <div className="dashboard-grid">
                  <div className="mock-card">
                    <div className="mock-number">42</div>
                    <div className="mock-label">Contacts</div>
                  </div>
                  <div className="mock-card hot">
                    <div className="mock-number">15</div>
                    <div className="mock-label">Priorite Haute</div>
                  </div>
                  <div className="mock-card warm">
                    <div className="mock-number">18</div>
                    <div className="mock-label">Priorite Moyenne</div>
                  </div>
                  <div className="mock-card cold">
                    <div className="mock-number">9</div>
                    <div className="mock-label">Priorite Basse</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LE PROBLEME - AVEC IMAGES */}
      <section id="problem" data-animate className={`section problem ${visibleSections["problem"] ? "visible" : ""}`}>
        <h2>Les Defis du CRM Traditionnel</h2>
        <div className="problem-grid">
          <div className="problem-item">
            <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop" alt="Donnees dispersees" className="problem-image" />
            <h3>Donnees Dispersees</h3>
            <p>Contacts eparpilles entre Excel, email et logiciels differents</p>
          </div>
          <div className="problem-item">
            <img src="https://images.unsplash.com/photo-1484807352052-2e1f11eead26?w=400&h=300&fit=crop" alt="Perte de temps" className="problem-image" />
            <h3>Perte de Temps</h3>
            <p>3h par jour en saisie manuelle et recherche d'informations</p>
          </div>
          <div className="problem-item">
            <img src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop" alt="Conversion faible" className="problem-image" />
            <h3>Conversion Faible</h3>
            <p>Suivi defaillant = 60% de taux de conversion</p>
          </div>
          <div className="problem-item">
            <img src="https://images.unsplash.com/photo-1460925895917-adf4ee868e4e?w=400&h=300&fit=crop" alt="Leads perdus" className="problem-image" />
            <h3>Leads Perdus</h3>
            <p>30% des opportunites sont oubliees</p>
          </div>
        </div>
      </section>

      {/* AVANT/APRES */}
      <section id="before-after" data-animate className={`section before-after ${visibleSections["before-after"] ? "visible" : ""}`}>
        <h2>L'Impact du CRM Centralise</h2>
        <div className="comparison">
          <div className="before">
            <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=300&h=200&fit=crop" alt="Sans CRM" className="comparison-image" />
            <h3>Sans CRM</h3>
            <ul>
              <li>Donnees dispersees</li>
              <li>+3h saisie/jour</li>
              <li>Leads oublies</li>
              <li>60% conversion</li>
              <li>Desorganisation</li>
            </ul>
          </div>
          <div className="arrow-comparison">⟹</div>
          <div className="after">
            <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=300&h=200&fit=crop&crop=faces" alt="Avec CRM" className="comparison-image" />
            <h3>Avec Solocal CRM</h3>
            <ul>
              <li>Centralisee</li>
              <li>Saisie automatique</li>
              <li>Aucun lead perdu</li>
              <li>95% conversion</li>
              <li>Ordonnance maximale</li>
            </ul>
          </div>
        </div>
      </section>

      {/* LA SOLUTION - AVEC IMAGE */}
      <section id="solution" data-animate className={`section solution ${visibleSections["solution"] ? "visible" : ""}`}>
        <div className="solution-content">
          <div className="solution-text">
            <h2>La Plateforme Solocal CRM</h2>
            <p className="solution-subtitle">Solution complete pour centraliser et optimiser votre gestion commerciale</p>
            <ul className="solution-points">
              <li>Centralisez tous vos contacts</li>
              <li>Scoring automatique</li>
              <li>Priorisation intelligente</li>
              <li>Historique complet par contact</li>
              <li>Insights commerciaux</li>
            </ul>
          </div>
          <div className="solution-visual">
            <img src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=400&fit=crop" alt="Solution CRM" className="solution-image" />
          </div>
        </div>
      </section>

      {/* FEATURES SECTION - AVEC IMAGES */}
      <section id="features" data-animate className={`section features ${visibleSections["features"] ? "visible" : ""}`}>
        <h2>Fonctionnalites Principales</h2>
        <div className="features-grid">
          {/* Feature 1 */}
          <div className="feature-card">
            <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=350&h=200&fit=crop" alt="Gestion" className="feature-image" />
            <h3>Gestion Centralisee</h3>
            <p>Tous vos contacts au meme endroit. Organisez votre pipeline efficacement.</p>
          </div>

          {/* Feature 2 */}
          <div className="feature-card">
            <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=350&h=200&fit=crop" alt="Scoring" className="feature-image" />
            <h3>Prioritisation</h3>
            <p>Identifiez les meilleures opportunites et concentrez-vous sur les prospects qualifies.</p>
          </div>

          {/* Feature 3 */}
          <div className="feature-card">
            <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=350&h=200&fit=crop" alt="Historique" className="feature-image" />
            <h3>Historique Complet</h3>
            <p>Chaque interaction est enregistree. Aucun detail n'est oublie dans le suivi client.</p>
          </div>

          {/* Feature 4 */}
          <div className="feature-card">
            <img src="https://images.unsplash.com/photo-1460925895917-adf4ee868e4e?w=350&h=200&fit=crop" alt="Analytics" className="feature-image" />
            <h3>Insights Temps Reel</h3>
            <p>Visualisez votre pipeline et vos KPIs en un coup d'oeil pour prendre les bonnes decisions.</p>
          </div>

          {/* Feature 5 */}
          <div className="feature-card">
            <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=350&h=200&fit=crop" alt="Recommandations" className="feature-image" />
            <h3>Recommandations</h3>
            <p>Recevez des suggestions intelligentes pour optimiser votre approche commerciale.</p>
          </div>

          {/* Feature 6 */}
          <div className="feature-card">
            <img src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=350&h=200&fit=crop" alt="Architecture" className="feature-image" />
            <h3>Architecture Pro</h3>
            <p>Build pour la production. Pret pour vos donnees reelles et votre croissance.</p>
          </div>
        </div>
      </section>

      {/* WORKFLOW - AVEC IMAGE */}
      <section id="workflow" data-animate className={`section workflow ${visibleSections["workflow"] ? "visible" : ""}`}>
        <h2>Processus Simple</h2>
        <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=300&fit=crop" alt="Workflow" className="workflow-image" />
        <div className="workflow-steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Ajouter</h3>
            <p>Creez vos contacts</p>
          </div>
          <div className="arrow">⟹</div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Analyser</h3>
            <p>Evaluez les prospects</p>
          </div>
          <div className="arrow">⟹</div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Classer</h3>
            <p>Triez par priorite</p>
          </div>
          <div className="arrow">⟹</div>
          <div className="step">
            <div className="step-number">4</div>
            <h3>Convertir</h3>
            <p>Fermez les deals</p>
          </div>
        </div>
      </section>

      {/* STATS - AVEC IMAGE */}
      <section id="stats" data-animate className={`section stats ${visibleSections["stats"] ? "visible" : ""}`}>
        <h2>Resultats Mesurables</h2>
        <img src="https://images.unsplash.com/photo-1460925895917-adf4ee868e4e?w=800&h=300&fit=crop" alt="Resultats" className="stats-image" />
        <div className="stats-container">
          <div className="stat-box">
            <div className="stat-value">-70%</div>
            <div className="stat-label">Temps Saisie</div>
            <div className="stat-detail">3h/jour → 50min</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">+50%</div>
            <div className="stat-label">Productivite</div>
            <div className="stat-detail">Plus de taches valeur</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">95%</div>
            <div className="stat-label">Suivi Leads</div>
            <div className="stat-detail">Aucun n'est oublie</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">3x</div>
            <div className="stat-label">Meil. Conversion</div>
            <div className="stat-detail">60% → 95%</div>
          </div>
        </div>
      </section>

      {/* CTA FINAL - AVEC IMAGE HERO */}
      <section className="final-cta">
        <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=400&fit=crop" alt="Team" className="final-image" />
        <h2>Optimisez Votre Gestion Commerciale</h2>
        <p>Centralisez vos contacts et optimisez votre pipeline des demain</p>
        <button className="cta-button large" onClick={onStart}>
          Essayer Solocal CRM
        </button>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <p>Solocal CRM © 2026 - Solution de gestion commerciale</p>
      </footer>
    </div>
  )
}

export default Landing