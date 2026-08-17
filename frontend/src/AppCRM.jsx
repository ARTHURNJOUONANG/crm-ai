import React, { useState, useEffect } from "react"
import axios from "axios"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import jsPDF from "jspdf"
import Papa from "papaparse"
import "./App.css"

const API_BASE = "https://crm-ai-1.onrender.com"
function AppCRM() {
  const [contacts, setContacts] = useState([])
  const [filteredContacts, setFilteredContacts] = useState([])
  const [selectedContact, setSelectedContact] = useState(null)
  const [editingContact, setEditingContact] = useState(null)
  const [tab, setTab] = useState("dashboard")
  const [loading, setLoading] = useState(false)
  const [topLeads, setTopLeads] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterPriority, setFilterPriority] = useState("all")
  const [filterSource, setFilterSource] = useState("all")
  
  const [newContact, setNewContact] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    company: "",
    position: "",
    source: "direct",
    status: "Lead"
  })

  const [newInteraction, setNewInteraction] = useState({
    interaction_type: "appel",
    notes: ""
  })

  useEffect(() => {
    loadContacts()
  }, [])

  const loadContacts = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_BASE}/contacts`)
      const data = Array.isArray(response.data) ? response.data : []
      setContacts(data)
      applyFilters(data, searchQuery, filterPriority, filterSource)
      
      const sorted = [...data].sort((a, b) => (b.lead_score || 0) - (a.lead_score || 0))
      setTopLeads(sorted.slice(0, 5))
      
      toast.success("Contacts chargés!", { autoClose: 2000 })
    } catch (error) {
      console.error("Erreur chargement contacts:", error)
      toast.error("Erreur lors du chargement", { autoClose: 2000 })
      setContacts([])
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = (contactsToFilter, search, priority, source) => {
    let filtered = [...contactsToFilter]

    if (search.trim()) {
      filtered = filtered.filter(c => 
        `${c.first_name} ${c.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        (c.company || "").toLowerCase().includes(search.toLowerCase())
      )
    }

    if (priority !== "all") {
      filtered = filtered.filter(c => c.priority === priority)
    }

    if (source !== "all") {
      filtered = filtered.filter(c => c.source === source)
    }

    setFilteredContacts(filtered)
  }

  const handleSearch = (query) => {
    setSearchQuery(query)
    applyFilters(contacts, query, filterPriority, filterSource)
  }

  const handleFilterPriority = (priority) => {
    setFilterPriority(priority)
    applyFilters(contacts, searchQuery, priority, filterSource)
  }

  const handleFilterSource = (source) => {
    setFilterSource(source)
    applyFilters(contacts, searchQuery, filterPriority, source)
  }

  const exportCSV = () => {
    if (contacts.length === 0) {
      toast.warning("Aucun contact à exporter", { autoClose: 2000 })
      return
    }

    const csv = Papa.unparse(contacts.map(c => ({
      "Prénom": c.first_name,
      "Nom": c.last_name,
      "Email": c.email,
      "Téléphone": c.phone,
      "Entreprise": c.company,
      "Poste": c.position,
      "Source": c.source,
      "Statut": c.status,
      "Score": c.lead_score,
      "Priorité": c.priority
    })))

    const link = document.createElement("a")
    link.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`
    link.download = `contacts_${new Date().toISOString().split('T')[0]}.csv`
    link.click()

    toast.success("CSV exporté!", { autoClose: 2000 })
  }

  const exportPDF = () => {
    if (contacts.length === 0) {
      toast.warning("Aucun contact à exporter", { autoClose: 2000 })
      return
    }

    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text("Rapport des Contacts", 20, 20)
    doc.setFontSize(10)
    doc.text(`Généré le: ${new Date().toLocaleDateString()}`, 20, 30)

    let yPosition = 50
    contacts.forEach((contact, idx) => {
      if (yPosition > 270) {
        doc.addPage()
        yPosition = 20
      }

      doc.setFontSize(11)
      doc.text(`${idx + 1}. ${contact.first_name} ${contact.last_name}`, 20, yPosition)
      yPosition += 7

      doc.setFontSize(9)
      doc.text(`Email: ${contact.email}`, 25, yPosition)
      yPosition += 5
      doc.text(`Entreprise: ${contact.company || "-"}`, 25, yPosition)
      yPosition += 5
      doc.text(`Score: ${contact.lead_score}/100 | Priorité: ${contact.priority}`, 25, yPosition)
      yPosition += 10
    })

    doc.save(`contacts_${new Date().toISOString().split('T')[0]}.pdf`)
    toast.success("PDF exporté!", { autoClose: 2000 })
  }

  const handleCreateContact = async (e) => {
    e.preventDefault()
    if (!newContact.first_name || !newContact.last_name || !newContact.email) {
      toast.error("Remplissez tous les champs requis", { autoClose: 2000 })
      return
    }

    try {
      setLoading(true)
      const response = await axios.post(`${API_BASE}/contacts`, newContact)
      const createdContact = response.data
      setContacts([...contacts, createdContact])
      
      setNewContact({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        company: "",
        position: "",
        source: "direct",
        status: "Lead"
      })
      
      loadContacts()
      toast.success("Contact créé!", { autoClose: 2000 })
      setTab("contacts")
    } catch (error) {
      console.error("Erreur création contact:", error)
      toast.error("Erreur: " + (error.response?.data?.detail || error.message), { autoClose: 2000 })
    } finally {
      setLoading(false)
    }
  }

  const loadContactDetails = async (contactId) => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_BASE}/contacts/${contactId}`)
      const contactData = response.data
      
      const interactionsResponse = await axios.get(`${API_BASE}/contacts/${contactId}/interactions`)
      const interactions = Array.isArray(interactionsResponse.data) ? interactionsResponse.data : []
      
      setSelectedContact({
        contact: contactData,
        interactions: interactions,
        lead: {
          score: contactData.lead_score,
          priority: contactData.priority,
          recommendation: contactData.recommendation
        }
      })
    } catch (error) {
      console.error("Erreur chargement détails:", error)
      toast.error("Erreur lors du chargement", { autoClose: 2000 })
    } finally {
      setLoading(false)
    }
  }

  const handleEditContact = async (e) => {
    e.preventDefault()
    if (!editingContact.first_name || !editingContact.last_name || !editingContact.email) {
      toast.error("Remplissez tous les champs requis", { autoClose: 2000 })
      return
    }

    try {
      setLoading(true)
      const response = await axios.put(`${API_BASE}/contacts/${editingContact.id}`, editingContact)
      const updatedContact = response.data
      
      setContacts(contacts.map(c => c.id === updatedContact.id ? updatedContact : c))
      setSelectedContact({
        ...selectedContact,
        contact: updatedContact
      })
      
      setEditingContact(null)
      toast.success("Contact modifié!", { autoClose: 2000 })
    } catch (error) {
      console.error("Erreur modification:", error)
      toast.error("Erreur: " + (error.response?.data?.detail || error.message), { autoClose: 2000 })
    } finally {
      setLoading(false)
    }
  }

  const handleAddInteraction = async (e) => {
    e.preventDefault()
    if (!newInteraction.notes) {
      toast.warning("Entrez des notes", { autoClose: 2000 })
      return
    }

    try {
      setLoading(true)
      const response = await axios.post(`${API_BASE}/interactions`, {
        contact_id: selectedContact.contact.id,
        interaction_type: newInteraction.interaction_type,
        notes: newInteraction.notes
      })

      const newInteractionData = response.data
      setSelectedContact({
        ...selectedContact,
        interactions: [...selectedContact.interactions, newInteractionData]
      })
      
      setNewInteraction({ interaction_type: "appel", notes: "" })
      toast.success("Interaction enregistrée!", { autoClose: 2000 })
    } catch (error) {
      console.error("Erreur ajout interaction:", error)
      toast.error("Erreur: " + (error.response?.data?.detail || error.message), { autoClose: 2000 })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteContact = async (contactId) => {
    if (!confirm("Confirmez la suppression?")) return
    
    try {
      await axios.delete(`${API_BASE}/contacts/${contactId}`)
      setContacts(contacts.filter(c => c.id !== contactId))
      setSelectedContact(null)
      toast.success("Contact supprimé!", { autoClose: 2000 })
      loadContacts()
    } catch (error) {
      console.error("Erreur suppression:", error)
      toast.error("Erreur: " + (error.response?.data?.detail || error.message), { autoClose: 2000 })
    }
  }

  const getPriorityColor = (score) => {
    if (score >= 75) return "hot"
    if (score >= 50) return "warm"
    return "cold"
  }

  const getPriorityLabel = (score) => {
    if (score >= 75) return "Haute"
    if (score >= 50) return "Moyenne"
    return "Basse"
  }

  const stats = {
    total: contacts.length,
    hot: contacts.filter(c => (c.lead_score || 0) >= 75).length,
    warm: contacts.filter(c => (c.lead_score || 0) >= 50 && (c.lead_score || 0) < 75).length,
    cold: contacts.filter(c => (c.lead_score || 0) < 50).length
  }

  const scoreDistribution = [
    { name: "Hot (75+)", value: stats.hot, color: "#FF4444" },
    { name: "Warm (50-74)", value: stats.warm, color: "#FFA500" },
    { name: "Cold (<50)", value: stats.cold, color: "#999999" }
  ]

  const sourceDistribution = contacts.reduce((acc, c) => {
    const existing = acc.find(item => item.name === c.source)
    if (existing) {
      existing.value += 1
    } else {
      acc.push({ name: c.source, value: 1 })
    }
    return acc
  }, [])

  const scoreData = contacts
    .sort((a, b) => a.id - b.id)
    .slice(-10)
    .map(c => ({
      name: `${c.first_name} ${c.last_name}`.substring(0, 10),
      score: c.lead_score || 0
    }))

  return (
    <div className="app">
      <ToastContainer position="bottom-right" />

      <header className="header">
        <div className="header-content">
          <h1>Solocal CRM</h1>
          <p>Plateforme intelligente de gestion des contacts</p>
        </div>
      </header>

      <div className="container">
        <div className="tabs">
          <button 
            className={`tab ${tab === "dashboard" ? "active" : ""}`} 
            onClick={() => setTab("dashboard")}
          >
            Dashboard
          </button>
          <button 
            className={`tab ${tab === "contacts" ? "active" : ""}`} 
            onClick={() => setTab("contacts")}
          >
            Contacts ({filteredContacts.length})
          </button>
          <button 
            className={`tab ${tab === "add" ? "active" : ""}`} 
            onClick={() => setTab("add")}
          >
            Nouveau
          </button>
        </div>

        {tab === "dashboard" && (
          <div className="tab-content dashboard">
            <h2>Vue d'ensemble</h2>
            
            <div className="stats-grid">
              <div className="stat-card total">
                <div className="stat-number">{stats.total}</div>
                <div className="stat-label">Contacts Total</div>
              </div>
              <div className="stat-card hot">
                <div className="stat-number">{stats.hot}</div>
                <div className="stat-label">Priorité Haute</div>
              </div>
              <div className="stat-card warm">
                <div className="stat-number">{stats.warm}</div>
                <div className="stat-label">Priorité Moyenne</div>
              </div>
              <div className="stat-card cold">
                <div className="stat-number">{stats.cold}</div>
                <div className="stat-label">Priorité Basse</div>
              </div>
            </div>

            <div className="charts-grid">
              <div className="chart-container">
                <h3>Distribution par priorité</h3>
                <ResponsiveContainer width="100%" height={250}>
  <PieChart>
    <Pie data={scoreDistribution} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value">
      {scoreDistribution.map((entry, index) => (
        <Cell key={`cell-${index}`} fill={entry.color} />
      ))}
    </Pie>
    <Tooltip />
    <Legend />
  </PieChart>
</ResponsiveContainer>
              </div>

              <div className="chart-container">
                <h3>Source des leads</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={sourceDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#0052CC" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-container full-width">
                <h3>Score des 10 derniers leads</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={scoreData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="score" stroke="#0052CC" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="leads-section">
              <h3>Contacts prioritaires</h3>
              <div className="top-leads">
                {topLeads.length === 0 ? (
                  <p className="no-data">Aucun contact</p>
                ) : (
                  topLeads.map((contact, idx) => (
                    <div 
                      key={contact.id} 
                      className="top-lead-item"
                      onClick={() => {
                        loadContactDetails(contact.id)
                        setTab("contacts")
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="lead-rank">#{idx + 1}</div>
                      <div className="lead-details">
                        <h4>{contact.first_name} {contact.last_name}</h4>
                        <p>{contact.company || "Entreprise"}</p>
                      </div>
                      <div className="lead-bar">
                        <div 
                          className="lead-progress" 
                          style={{ width: `${contact.lead_score || 0}%` }}
                        ></div>
                      </div>
                      <span className="lead-score">{(contact.lead_score || 0).toFixed(0)}/100</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {tab === "contacts" && (
          <div className="tab-content contacts">
            <div className="contacts-header">
              <h2>Mes Contacts</h2>
              <div className="export-buttons">
                <button onClick={exportCSV} className="btn btn-export">
                  Exporter CSV
                </button>
                <button onClick={exportPDF} className="btn btn-export">
                  Exporter PDF
                </button>
              </div>
            </div>

            <div className="search-filters">
              <div className="search-box">
                <input 
                  type="text" 
                  placeholder="Chercher par nom, email ou entreprise..." 
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="search-input"
                />
              </div>

              <div className="filters">
                <select 
                  value={filterPriority} 
                  onChange={(e) => handleFilterPriority(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">Toutes priorités</option>
                  <option value="Hot">Priorité Haute</option>
                  <option value="Warm">Priorité Moyenne</option>
                  <option value="Cold">Priorité Basse</option>
                </select>

                <select 
                  value={filterSource} 
                  onChange={(e) => handleFilterSource(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">Toutes sources</option>
                  <option value="direct">Direct</option>
                  <option value="web">Web</option>
                  <option value="appel">Appel</option>
                  <option value="email">Email</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="referral">Recommandation</option>
                </select>
              </div>
            </div>

            {filteredContacts.length === 0 ? (
              <div className="empty-state">
                <p>Aucun contact trouvé</p>
                <button onClick={() => setTab("add")} className="btn btn-primary">
                  Ajouter un contact
                </button>
              </div>
            ) : (
              <div className="contacts-grid">
                {filteredContacts.map(contact => (
                  <div
                    key={contact.id}
                    className={`contact-card priority-${getPriorityColor(contact.lead_score || 0)}`}
                    onClick={() => loadContactDetails(contact.id)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="card-header">
                      <div className="card-score">{(contact.lead_score || 0).toFixed(0)}</div>
                      <h3>{contact.first_name} {contact.last_name}</h3>
                      <span className={`card-badge priority-${getPriorityColor(contact.lead_score || 0)}`}>
                        {getPriorityLabel(contact.lead_score || 0)}
                      </span>
                    </div>
                    
                    <p className="company">{contact.company || "-"}</p>
                    
                    <div className="card-body">
                      <p>{contact.position || "Poste"}</p>
                      <p>{contact.email}</p>
                    </div>
                    
                    <button className="card-action">Voir le profil</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "add" && (
          <div className="tab-content form-section">
            <h2>Ajouter un nouveau contact</h2>
            <form onSubmit={handleCreateContact} className="contact-form">
              <div className="form-section">
                <h4>Informations personnelles</h4>
                <div className="form-row">
                  <input 
                    type="text" 
                    placeholder="Prénom *" 
                    value={newContact.first_name} 
                    onChange={(e) => setNewContact({...newContact, first_name: e.target.value})} 
                    required 
                  />
                  <input 
                    type="text" 
                    placeholder="Nom *" 
                    value={newContact.last_name} 
                    onChange={(e) => setNewContact({...newContact, last_name: e.target.value})} 
                    required 
                  />
                </div>
                <div className="form-row">
                  <input 
                    type="email" 
                    placeholder="Email *" 
                    value={newContact.email} 
                    onChange={(e) => setNewContact({...newContact, email: e.target.value})} 
                    required 
                  />
                  <input 
                    type="tel" 
                    placeholder="Téléphone" 
                    value={newContact.phone} 
                    onChange={(e) => setNewContact({...newContact, phone: e.target.value})} 
                  />
                </div>
              </div>

              <div className="form-section">
                <h4>Informations professionnelles</h4>
                <div className="form-row">
                  <input 
                    type="text" 
                    placeholder="Entreprise" 
                    value={newContact.company} 
                    onChange={(e) => setNewContact({...newContact, company: e.target.value})} 
                  />
                  <input 
                    type="text" 
                    placeholder="Poste" 
                    value={newContact.position} 
                    onChange={(e) => setNewContact({...newContact, position: e.target.value})} 
                  />
                </div>
              </div>

              <div className="form-section">
                <h4>Propriétés</h4>
                <div className="form-row">
                  <select 
                    value={newContact.source} 
                    onChange={(e) => setNewContact({...newContact, source: e.target.value})}
                  >
                    <option value="direct">Direct</option>
                    <option value="web">Web</option>
                    <option value="appel">Appel</option>
                    <option value="email">Email</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="referral">Recommandation</option>
                  </select>
                  <select 
                    value={newContact.status} 
                    onChange={(e) => setNewContact({...newContact, status: e.target.value})}
                  >
                    <option value="Lead">Lead</option>
                    <option value="Contact">Contact</option>
                    <option value="Prospect">Prospect</option>
                    <option value="Client">Client</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                {loading ? "Création..." : "Créer le contact"}
              </button>
            </form>
          </div>
        )}
      </div>

      {selectedContact && (
        <div className="modal-overlay" onClick={() => setSelectedContact(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedContact.contact.first_name} {selectedContact.contact.last_name}</h2>
              <button className="btn-close" onClick={() => setSelectedContact(null)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="info-section">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                  <h3>Informations</h3>
                  {!editingContact && (
                    <button 
                      className="btn btn-primary" 
                      onClick={() => setEditingContact({...selectedContact.contact})}
                      style={{ padding: "6px 12px", fontSize: "0.85rem" }}
                    >
                      Modifier
                    </button>
                  )}
                </div>

                {editingContact ? (
                  <form onSubmit={handleEditContact} style={{ background: "#f5f5f5", padding: "15px", borderRadius: "4px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                      <input 
                        type="text" 
                        placeholder="Prénom" 
                        value={editingContact.first_name}
                        onChange={(e) => setEditingContact({...editingContact, first_name: e.target.value})}
                        style={{ padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}
                        required
                      />
                      <input 
                        type="text" 
                        placeholder="Nom" 
                        value={editingContact.last_name}
                        onChange={(e) => setEditingContact({...editingContact, last_name: e.target.value})}
                        style={{ padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}
                        required
                      />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                      <input 
                        type="email" 
                        placeholder="Email" 
                        value={editingContact.email}
                        onChange={(e) => setEditingContact({...editingContact, email: e.target.value})}
                        style={{ padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}
                        required
                      />
                      <input 
                        type="tel" 
                        placeholder="Téléphone" 
                        value={editingContact.phone}
                        onChange={(e) => setEditingContact({...editingContact, phone: e.target.value})}
                        style={{ padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}
                      />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                      <input 
                        type="text" 
                        placeholder="Entreprise" 
                        value={editingContact.company}
                        onChange={(e) => setEditingContact({...editingContact, company: e.target.value})}
                        style={{ padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}
                      />
                      <input 
                        type="text" 
                        placeholder="Poste" 
                        value={editingContact.position}
                        onChange={(e) => setEditingContact({...editingContact, position: e.target.value})}
                        style={{ padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}
                      />
                    </div>

                    <div style={{ display: "flex", gap: "10px" }}>
                      <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? "Enregistrement..." : "Enregistrer"}
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-secondary"
                        onClick={() => setEditingContact(null)}
                      >
                        Annuler
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Email</label>
                      <p>{selectedContact.contact.email}</p>
                    </div>
                    <div className="info-item">
                      <label>Téléphone</label>
                      <p>{selectedContact.contact.phone || "-"}</p>
                    </div>
                    <div className="info-item">
                      <label>Entreprise</label>
                      <p>{selectedContact.contact.company || "-"}</p>
                    </div>
                    <div className="info-item">
                      <label>Poste</label>
                      <p>{selectedContact.contact.position || "-"}</p>
                    </div>
                    <div className="info-item">
                      <label>Source</label>
                      <p>{selectedContact.contact.source || "-"}</p>
                    </div>
                    <div className="info-item">
                      <label>Statut</label>
                      <p>{selectedContact.contact.status || "-"}</p>
                    </div>
                  </div>
                )}
              </div>

              {selectedContact.lead && (
                <div className="lead-section">
                  <h3>Score de qualification</h3>
                  <div className="score-display">
                    <div className={`score-circle priority-${getPriorityColor(selectedContact.lead.score)}`}>
                      {selectedContact.lead.score.toFixed(0)}
                    </div>
                    <div className="score-info">
                      <p><strong>Niveau:</strong> {selectedContact.lead.priority}</p>
                      <p className="recommendation"><strong>Recommandation:</strong> {selectedContact.lead.recommendation}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="interactions-section">
                <h3>Historique ({selectedContact.interactions.length})</h3>
                <div className="interactions-list">
                  {selectedContact.interactions.length === 0 ? (
                    <p className="no-data">Aucune interaction</p>
                  ) : (
                    selectedContact.interactions.map(int => (
                      <div key={int.id} className="interaction-card">
                        <div className="interaction-type">{int.interaction_type}</div>
                        <p className="interaction-notes"><strong>Notes:</strong> {int.notes}</p>
                        <p className="interaction-summary"><strong>Résumé:</strong> {int.summary}</p>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleAddInteraction} className="interaction-form">
                  <h4>Enregistrer une interaction</h4>
                  <select 
                    value={newInteraction.interaction_type} 
                    onChange={(e) => setNewInteraction({...newInteraction, interaction_type: e.target.value})}
                  >
                    <option value="appel">Appel</option>
                    <option value="email">Email</option>
                    <option value="reunion">Réunion</option>
                    <option value="visite">Visite</option>
                  </select>
                  <textarea 
                    placeholder="Notes..." 
                    value={newInteraction.notes} 
                    onChange={(e) => setNewInteraction({...newInteraction, notes: e.target.value})} 
                    rows="4"
                  ></textarea>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? "Enregistrement..." : "Enregistrer"}
                  </button>
                </form>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn btn-danger" 
                onClick={() => { 
                  handleDeleteContact(selectedContact.contact.id)
                  setSelectedContact(null) 
                }}
              >
                Supprimer
              </button>
              <button className="btn btn-secondary" onClick={() => setSelectedContact(null)}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AppCRM