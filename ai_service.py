import os
from anthropic import Anthropic

# Initialiser le client Anthropic
client = Anthropic()

def calculate_lead_score(contact):
    """
    Calcule le score du lead avec Claude
    Retourne un score entre 0 et 100
    """
    
    api_key = os.getenv("ANTHROPIC_API_KEY")
    
    # Si pas de clé API, utiliser un scoring par défaut
    if not api_key:
        return get_default_score(contact)
    
    try:
        prompt = f"""Analyse ce contact commercial et donne un score de 0 a 100.

CONTACT:
- Nom: {contact['first_name']} {contact['last_name']}
- Email: {contact['email']}
- Entreprise: {contact.get('company', 'N/A')}
- Poste: {contact.get('position', 'N/A')}
- Source: {contact['source']}

CRITERES DE SCORING:
- Source: 
  * referral/recommandation = 95 points
  * appel direct = 85 points
  * linkedin = 75 points
  * web/form = 60 points
  * email = 55 points
  * autre = 50 points
  
- Poste:
  * CEO/Directeur/Manager = +20 points
  * Professionnel = +10 points
  * Assistant/Junior = -5 points
  
- Entreprise connue = +10 points

REPONSE:
Donne UNIQUEMENT un nombre entre 0 et 100, rien d'autre.
Pas de texte, pas d'explication, juste le chiffre."""

        message = client.messages.create(
            model="claude-opus-4-8",
            max_tokens=10,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        
        # Extraire le score
        score_text = message.content[0].text.strip()
        score = int(score_text)
        return max(0, min(100, score))
        
    except Exception as e:
        print(f"⚠️ Erreur Claude: {e}")
        return get_default_score(contact)

def get_default_score(contact):
    """Scoring par défaut si Claude n'est pas disponible"""
    score = 50
    
    source_scores = {
        "referral": 95,
        "recommandation": 95,
        "appel": 85,
        "linkedin": 75,
        "web": 60,
        "email": 55,
    }
    
    score = source_scores.get(contact.get('source', '').lower(), 50)
    
    position = contact.get('position', '').lower()
    if any(word in position for word in ['ceo', 'directeur', 'manager', 'director']):
        score += 20
    elif any(word in position for word in ['assistant', 'junior']):
        score -= 5
    else:
        score += 10
    
    return max(0, min(100, score))

def get_lead_priority_and_recommendation(score):
    """
    Détermine la priorité basée sur le score
    et génère une recommandation avec Claude
    """
    
    # Déterminer la priorité
    if score >= 75:
        priority = "Hot"
    elif score >= 50:
        priority = "Warm"
    else:
        priority = "Cold"
    
    api_key = os.getenv("ANTHROPIC_API_KEY")
    
    if not api_key:
        return priority, get_default_recommendation(priority, score)
    
    try:
        prompt = f"""Score du prospect: {score}/100
Priorité: {priority}

Donne UNE SEULE recommandation courte et actionnable pour le suivi commercial.
La recommandation doit être:
- Concise (maximum 15 mots)
- Pratique et actionnable
- Pertinente pour la priorité

REPONSE:
Donne uniquement la recommandation, sans explications ni ponctuation supplémentaire."""

        message = client.messages.create(
            model="claude-opus-4-8",
            max_tokens=50,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        
        recommendation = message.content[0].text.strip()
        return priority, recommendation
        
    except Exception as e:
        print(f"⚠️ Erreur Claude recommendation: {e}")
        return priority, get_default_recommendation(priority, score)

def get_default_recommendation(priority, score):
    """Recommandations par défaut"""
    recommendations = {
        "Hot": "Appel prioritaire dans les 24h",
        "Warm": "Suivi par email ou appel cette semaine",
        "Cold": "Ajouter à la liste de nurturing"
    }
    return recommendations.get(priority, "Suivi à prévoir")

def summarize_interaction(interaction_type, notes):
    """
    Génère un résumé intelligent de l'interaction avec Claude
    """
    
    api_key = os.getenv("ANTHROPIC_API_KEY")
    
    if not api_key:
        return get_default_summary(interaction_type, notes)
    
    try:
        prompt = f"""Interaction commerciale:
Type: {interaction_type}
Notes brutes: {notes}

Resume cette interaction en UNE SEULE phrase professionnelle et concise.
La résumé doit:
- Être court (maximum 20 mots)
- Capturer l'essentiel
- Être utile pour une relecture future

REPONSE:
Donne uniquement le résumé, sans guillemets ni ponctuation supplémentaire."""

        message = client.messages.create(
            model="claude-opus-4-8",
            max_tokens=50,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        
        summary = message.content[0].text.strip()
        return summary
        
    except Exception as e:
        print(f"⚠️ Erreur Claude summary: {e}")
        return get_default_summary(interaction_type, notes)

def get_default_summary(interaction_type, notes):
    """Résumé par défaut"""
    type_labels = {
        "appel": "Appel",
        "email": "Email",
        "reunion": "Réunion",
        "visite": "Visite"
    }
    
    label = type_labels.get(interaction_type, interaction_type)
    return f"{label}: {notes[:50]}..." if len(notes) > 50 else f"{label}: {notes}"