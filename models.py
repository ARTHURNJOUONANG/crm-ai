from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class Contact(Base):
    """Modèle Contact"""
    __tablename__ = "contacts"
    
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=True)
    company = Column(String, nullable=True)
    position = Column(String, nullable=True)
    source = Column(String, nullable=False)  # referral, appel, linkedin, web, email, direct
    status = Column(String, default="Lead")  # Lead, Contact, Prospect, Client
    lead_score = Column(Integer, default=0)  # 0-100
    priority = Column(String, default="Cold")  # Hot, Warm, Cold
    recommendation = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relation
    interactions = relationship("Interaction", back_populates="contact", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Contact {self.first_name} {self.last_name} - Score: {self.lead_score}>"

class Interaction(Base):
    """Modèle Interaction"""
    __tablename__ = "interactions"
    
    id = Column(Integer, primary_key=True, index=True)
    contact_id = Column(Integer, ForeignKey("contacts.id"), nullable=False)
    interaction_type = Column(String, nullable=False)  # appel, email, reunion, visite
    notes = Column(String, nullable=True)
    summary = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relation
    contact = relationship("Contact", back_populates="interactions")
    
    def __repr__(self):
        return f"<Interaction {self.interaction_type} - Contact ID: {self.contact_id}>"