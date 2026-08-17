import os
from dotenv import load_dotenv

# CHARGER LES VARIABLES D'ENVIRONNEMENT AVANT TOUS LES AUTRES IMPORTS!
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import init_db, get_db
from routes import router

api_key = os.getenv("ANTHROPIC_API_KEY")
if not api_key:
    print("ATTENTION: ANTHROPIC_API_KEY non trouvee dans .env")
else:
    print("ANTHROPIC_API_KEY chargee avec succes")

app = FastAPI(
    title="Solocal CRM API",
    description="API CRM avec Lead Scoring intelligent via Claude",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    print("Demarrage du serveur...")
    init_db()
    print("Base de donnees initialisee")

app.include_router(router)

@app.get("/")
async def root():
    return {
        "message": "Bienvenue sur Solocal CRM API",
        "status": "Serveur actif",
        "claude_api": "Integre" if api_key else "Non configure",
        "version": "1.0.0"
    }

@app.get("/health")
async def health():
    return {
        "status": "Serveur OK",
        "database": "Connectee",
        "api_claude": "Chargee" if api_key else "Non chargee"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True
    )