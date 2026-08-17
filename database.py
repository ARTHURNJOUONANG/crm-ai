from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
import os

# Configuration de la base de données SQLite
DATABASE_URL = "sqlite:///./crm.db"

# Créer l'engine
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    echo=False  # Mets à True pour voir les requêtes SQL
)

# Créer la session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Créer la base déclarative
Base = declarative_base()

def init_db():
    """Initialiser la base de données"""
    from models import Contact, Interaction  # Import ici pour éviter les circular imports
    Base.metadata.create_all(bind=engine)
    print("✅ Tables créées/vérifiées")

def get_db():
    """Dépendance FastAPI pour obtenir une session DB"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()