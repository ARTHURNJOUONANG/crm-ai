from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Contact, Interaction
from ai_service import calculate_lead_score, get_lead_priority_and_recommendation, summarize_interaction
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# Router
router = APIRouter()

# ===== MODELS PYDANTIC =====
class ContactCreate(BaseModel):
    first_name: str
    last_name: str
    email: str
    phone: str
    company: str
    position: str
    source: str
    status: str = "Lead"

class ContactUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    position: Optional[str] = None
    source: Optional[str] = None
    status: Optional[str] = None

class ContactResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    phone: str
    company: str
    position: str
    source: str
    status: str
    lead_score: int
    priority: str
    recommendation: str
    created_at: datetime  # ✅ DATETIME, pas string!

    class Config:
        from_attributes = True

class InteractionCreate(BaseModel):
    contact_id: int
    interaction_type: str  # "appel", "email", "reunion", "visite"
    notes: str

class InteractionResponse(BaseModel):
    id: int
    contact_id: int
    interaction_type: str
    notes: str
    summary: str
    created_at: datetime  # ✅ DATETIME, pas string!

    class Config:
        from_attributes = True

# ===== ROUTES CONTACTS =====

@router.post("/contacts", response_model=ContactResponse)
async def create_contact(contact: ContactCreate, db: Session = Depends(get_db)):
    """Créer un nouveau contact avec Lead Scoring automatique"""
    
    # Préparer les données pour le scoring
    contact_dict = {
        "first_name": contact.first_name,
        "last_name": contact.last_name,
        "email": contact.email,
        "company": contact.company,
        "position": contact.position,
        "source": contact.source,
    }
    
    # Calculer le score avec Claude
    lead_score = calculate_lead_score(contact_dict)
    priority, recommendation = get_lead_priority_and_recommendation(lead_score)
    
    # Créer le contact en base
    db_contact = Contact(
        first_name=contact.first_name,
        last_name=contact.last_name,
        email=contact.email,
        phone=contact.phone,
        company=contact.company,
        position=contact.position,
        source=contact.source,
        status=contact.status,
        lead_score=lead_score,
        priority=priority,
        recommendation=recommendation
    )
    
    db.add(db_contact)
    db.commit()
    db.refresh(db_contact)
    
    return db_contact

@router.get("/contacts", response_model=List[ContactResponse])
async def list_contacts(db: Session = Depends(get_db)):
    """Lister tous les contacts"""
    contacts = db.query(Contact).all()
    return contacts

@router.get("/contacts/{contact_id}", response_model=ContactResponse)
async def get_contact(contact_id: int, db: Session = Depends(get_db)):
    """Récupérer les détails d'un contact"""
    contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact non trouvé")
    return contact

@router.put("/contacts/{contact_id}", response_model=ContactResponse)
async def update_contact(contact_id: int, contact: ContactUpdate, db: Session = Depends(get_db)):
    """Modifier un contact"""
    db_contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not db_contact:
        raise HTTPException(status_code=404, detail="Contact non trouvé")
    
    # Mettre à jour les champs
    update_data = contact.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_contact, field, value)
    
    db.commit()
    db.refresh(db_contact)
    return db_contact

@router.delete("/contacts/{contact_id}")
async def delete_contact(contact_id: int, db: Session = Depends(get_db)):
    """Supprimer un contact"""
    db_contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not db_contact:
        raise HTTPException(status_code=404, detail="Contact non trouvé")
    
    db.delete(db_contact)
    db.commit()
    
    return {"message": "Contact supprimé"}

# ===== ROUTES INTERACTIONS =====

@router.post("/interactions", response_model=InteractionResponse)
async def create_interaction(interaction: InteractionCreate, db: Session = Depends(get_db)):
    """Créer une interaction avec résumé automatique Claude"""
    
    # Vérifier que le contact existe
    contact = db.query(Contact).filter(Contact.id == interaction.contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact non trouvé")
    
    # Générer le résumé avec Claude
    summary = summarize_interaction(interaction.interaction_type, interaction.notes)
    
    # Créer l'interaction
    db_interaction = Interaction(
        contact_id=interaction.contact_id,
        interaction_type=interaction.interaction_type,
        notes=interaction.notes,
        summary=summary
    )
    
    db.add(db_interaction)
    db.commit()
    db.refresh(db_interaction)
    
    return db_interaction

@router.get("/contacts/{contact_id}/interactions", response_model=List[InteractionResponse])
async def get_contact_interactions(contact_id: int, db: Session = Depends(get_db)):
    """Récupérer l'historique des interactions d'un contact"""
    interactions = db.query(Interaction).filter(Interaction.contact_id == contact_id).all()
    return interactions

# ===== ROUTES ANALYTICS =====

@router.get("/leads/top")
async def get_top_leads(db: Session = Depends(get_db)):
    """Récupérer les 5 meilleurs leads"""
    top_leads = db.query(Contact).order_by(Contact.lead_score.desc()).limit(5).all()
    return [
        {
            "id": lead.id,
            "name": f"{lead.first_name} {lead.last_name}",
            "company": lead.company,
            "score": lead.lead_score,
            "priority": lead.priority
        }
        for lead in top_leads
    ]

@router.get("/leads/stats")
async def get_leads_stats(db: Session = Depends(get_db)):
    """Récupérer les statistiques des leads"""
    total = db.query(Contact).count()
    hot = db.query(Contact).filter(Contact.priority == "Hot").count()
    warm = db.query(Contact).filter(Contact.priority == "Warm").count()
    cold = db.query(Contact).filter(Contact.priority == "Cold").count()
    
    return {
        "total": total,
        "hot": hot,
        "warm": warm,
        "cold": cold,
        "conversion_rate": f"{(hot / total * 100):.1f}%" if total > 0 else "0%"
    }

@router.post("/leads/score")
async def score_lead(contact_id: int, db: Session = Depends(get_db)):
    """Recalculer le score d'un lead"""
    contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact non trouvé")
    
    # Préparer les données pour le scoring
    contact_dict = {
        "first_name": contact.first_name,
        "last_name": contact.last_name,
        "email": contact.email,
        "company": contact.company,
        "position": contact.position,
        "source": contact.source,
    }
    
    # Recalculer le score
    new_score = calculate_lead_score(contact_dict)
    priority, recommendation = get_lead_priority_and_recommendation(new_score)
    
    # Mettre à jour
    contact.lead_score = new_score
    contact.priority = priority
    contact.recommendation = recommendation
    
    db.commit()
    db.refresh(contact)
    
    return {
        "contact_id": contact.id,
        "new_score": new_score,
        "priority": priority,
        "recommendation": recommendation
    }