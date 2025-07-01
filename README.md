# 🍽️ Cooking Recipes - Générateur de Recettes avec IA

Projet ESGI - Système de génération et de gestion de recettes de cuisine personnalisées avec analyse nutritionnelle utilisant Mistral AI.

## 🎯 Fonctionnalités

### ✅ Fonctionnalités principales
- **Visualisation des recettes** : Liste et détail des recettes avec navigation intuitive
- **Recherche avancée** : Recherche par nom, ingrédient ou type de plat
- **Création manuelle** : Formulaire pour créer des recettes personnalisées
- **Génération IA** : Génération automatique de recettes avec Mistral AI
- **Analyse nutritionnelle** : Calcul automatique des valeurs nutritionnelles
- **Gestion des intolérances** : Prise en compte des restrictions alimentaires

### 🤖 Fonctionnalités IA (Mistral)
- **Génération de recettes** : Création intelligente basée sur les ingrédients disponibles
- **Analyse nutritionnelle** : Calcul des calories, protéines, glucides, lipides, vitamines et minéraux
- **Personnalisation** : Prise en compte du nombre de personnes, intolérances et préférences alimentaires
- **Suggestions d'amélioration** : Conseils pour optimiser les recettes existantes

## 🏗️ Architecture

### Backend (NestJS + TypeScript)
```
backend/
├── src/
│   ├── airtable/          # Service d'intégration Airtable
│   ├── mistral/           # Service d'intégration Mistral AI
│   ├── ai/                # Contrôleur pour les fonctionnalités IA
│   ├── recipes/           # Gestion des recettes
│   └── interfaces/        # Types TypeScript
```

### Frontend (React + TypeScript + SCSS)
```
frontend/
├── src/
│   ├── components/        # Composants réutilisables
│   ├── pages/            # Pages principales
│   ├── services/         # Services API
│   ├── types/            # Types TypeScript
│   └── styles/           # Styles SCSS
```

## 🚀 Installation et démarrage

### Prérequis
- Node.js (version 16+)
- npm ou yarn
- Clé API Mistral AI
- Base Airtable configurée

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Configurer les variables d'environnement
npm run start:dev
```

### Frontend
```bash
cd frontend
npm install
npm start
```

### Variables d'environnement (backend/.env)
```env
MISTRAL_API_KEY=votre_clé_mistral
AIRTABLE_API_TOKEN=votre_token_airtable
AIRTABLE_BASE_ID=votre_base_id
AIRTABLE_RECIPES_TABLE_NAME=Recettes
```

## 🎮 Utilisation

### 1. Créer une recette manuellement
- Accéder à `/create`
- Remplir le formulaire avec nom, type, ingrédients, instructions
- L'analyse nutritionnelle est générée automatiquement

### 2. Générer une recette avec l'IA
- Accéder à `/generate`
- Spécifier les ingrédients disponibles
- Configurer les préférences (nombre de personnes, intolérances, régime)
- L'IA génère une recette complète avec analyse nutritionnelle

### 3. Parcourir les recettes
- Page d'accueil avec recherche en temps réel
- Clic sur une recette pour voir le détail complet
- Affichage de l'analyse nutritionnelle détaillée

## 🔧 Technologies utilisées

### Backend
- **NestJS** : Framework Node.js moderne
- **TypeScript** : Typage statique
- **Axios** : Client HTTP
- **Mistral AI** : Intelligence artificielle pour la génération
- **Airtable** : Base de données cloud

### Frontend
- **React 19** : Framework frontend
- **TypeScript** : Typage statique
- **React Router** : Navigation
- **SCSS** : Préprocesseur CSS
- **Axios** : Client HTTP

## 🎨 Design et UX

- **Interface moderne** : Design responsive et intuitif
- **Navigation fluide** : Routing avec React Router
- **Feedback utilisateur** : Messages d'état et erreurs
- **Accessibilité** : Structure sémantique HTML

## 🧪 Tests

```bash
# Backend
cd backend
npm run test
npm run test:e2e

# Frontend
cd frontend
npm test
```

## 📈 Perspectives d'amélioration

### Court terme
- [ ] Sauvegarde des recettes favorites
- [ ] Partage de recettes via liens
- [ ] Import/export de recettes
- [ ] Mode hors ligne basique

### Moyen terme
- [ ] Système de notation et commentaires
- [ ] Planification de menus hebdomadaires
- [ ] Liste de courses automatique
- [ ] Suggestions basées sur l'historique

### Long terme
- [ ] Application mobile native
- [ ] Reconnaissance d'images d'ingrédients
- [ ] Intégration avec appareils IoT
- [ ] Communauté d'utilisateurs

## 👥 Équipe

- **Développement Backend** : API NestJS, intégration Mistral AI
- **Développement Frontend** : Interface React, UX/UI
- **Base de données** : Structure Airtable, modélisation
- **Intelligence Artificielle** : Prompts Mistral, optimisation

## 📄 Licence

Projet académique ESGI - Tous droits réservés

## 🔗 Liens utiles

- [Documentation Mistral AI](https://docs.mistral.ai/)
- [API Airtable](https://airtable.com/developers/web/api)
- [NestJS Documentation](https://docs.nestjs.com/)
- [React Documentation](https://react.dev/)

---

*Générer des recettes n'a jamais été aussi simple ! 🍳✨*