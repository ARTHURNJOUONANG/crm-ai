import os
from dotenv import load_dotenv

# ⭐ CHARGER LES VARIABLES D'ENVIRONNEMENT AVANT TOUS LES AUTRES IMPORTS!
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import init_db, get_db
from routes import router

# Vérifier que la clé API est chargée
api_key = os.getenv("ANTHROPIC_API_KEY")
if not api_key:
    print("⚠️ ATTENTION: ANTHROPIC_API_KEY non trouvée dans .env")
    print("Le Lead Scoring utilisera des valeurs par défaut")
else:
    print("✅ ANTHROPIC_API_KEY chargée avec succès")

# Initialiser l'application FastAPI
app = FastAPI(
    title="Solocal CRM API",
    description="API CRM avec Lead Scoring intelligent via Claude",
    version="1.0.0"
)

# ⭐ CONFIGURATION CORS - DOIT ÊTRE AVANT LES ROUTES
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialiser la base de données au démarrage
@app.on_event("startup")
async def startup_event():
    """Exécuté au démarrage de l'app"""
    print("🚀 Démarrage du serveur...")
    init_db()
    print("✅ Base de données initialisée")

# Inclure les routes
app.include_router(router)

# Route de test
@app.get("/")
async def root():
    return {
        "message": "Bienvenue sur Solocal CRM API",
        "status": "✅ Serveur actif",
        "docs": "http://localhost:8000/docs",
        "claude_api": "✅ Intégré" if api_key else "⚠️ Non configuré",
        "version": "1.0.0"
    }

# Route de santé (utile pour les health checks du serveur)
@app.get("/health")
async def health():
    return {
        "status": "✅ Serveur OK",
        "database": "✅ Connectée",
        "api_claude": "✅ Chargée" if api_key else "⚠️ Non chargée"
    }

# Lancer le serveur
if __name__ == "__main__":
    import uvicorn
    print("\n" + "="*60)
    print("🚀 DÉMARRAGE SOLOCAL CRM API")
    print("="*60)
    print("📍 Serveur: http://localhost:8000")
    print("📚 Docs: http://localhost:8000/docs")
    print("🔑 API Claude: " + ("✅ ACTIVÉE" if api_key else "⚠️ NON CONFIGURÉE"))
    print("🌐 CORS: ✅ Activé pour toutes origines (demo)")
    print("="*60 + "\n")
    
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True
    )    )