# 🥗 Cooking Recipes Project – ESGI 2025

Projet étudiant réalisé dans le cadre de l’ESGI. L’objectif est de concevoir un système web de **génération et gestion de recettes de cuisine personnalisées** avec **analyse nutritionnelle automatisée via intelligence artificielle**, en utilisant **Airtable** comme base de données.

## 👨‍🍳 Fonctionnalités principales

- 🔍 **Recherche de recettes** par nom, ingrédient ou type de plat
- 📜 **Liste des recettes** déjà générées
- 🍲 **Détail d’une recette** avec analyse nutritionnelle complète :
  - Calories, protéines, glucides, lipides
  - Vitamines, minéraux
- ✨ **Création automatique de recette** en fonction de :
  - Ingrédients disponibles
  - Nombre de personnes
  - Intolérances alimentaires

## 🧠 Intelligence Artificielle

Nous utilisons un **modèle IA** pour :
- Générer automatiquement des recettes personnalisées
- Produire l’analyse nutritionnelle en fonction des ingrédients saisis

## 🧱 Technologies utilisées

| Côté | Stack |
|------|-------|
| Frontend | React.js (TypeScript) |
| Backend | NestJS (TypeScript) |
| Base de données | Airtable |
| IA | OpenAI API / Modèle NLP |
| Outils | Docker (base PostgreSQL locale si besoin), GitHub |

## 🛠️ Installation

### Prérequis

- Node.js (v18+ recommandé)
- npm ou pnpm
- Un compte [Airtable](https://airtable.com/) avec API key
- Une clé API OpenAI

### Étapes

```bash
# Clone du projet
git clone https://github.com/Narutino10/cooking-recipes-project.git
cd cooking-recipes-project

# Installer les dépendances et lancer le front 
cd frontend
npm install
npm start

# Configuration
# Ajouter vos clés API dans un fichier `.env` :
AIRTABLE_API_KEY=xxxxxxxxxx
AIRTABLE_BASE_ID=xxxxxxxxxx
OPENAI_API_KEY=xxxxxxxxxx

# Installer les dépendances et lancer le back
cd frontend
npm install
npm run start:dev
````

## 🧪 Fonctionnement

* Le frontend permet de consulter les recettes existantes et d'en créer de nouvelles.
* Lors de la création :

  * Le frontend envoie les infos au backend
  * Le backend appelle l’API IA pour générer recette + analyse nutritionnelle
  * Les données sont ensuite stockées dans Airtable

## 🗃 Structure du projet

```bash
📁 frontend/      # Application React
📁 backend/       # Serveur NestJS
.env.example      # Exemple de fichier d’environnement
README.md         # Présent document
```

## 🔐 Gestion des données

* Toutes les recettes sont stockées dans **Airtable** via l'API REST.
* Une configuration d’accès partagé est prévue pour l’enseignant.

## 👥 Membres du groupe

* Ouahabi Ibrahim

## 📅 Deadline

> 📤 **Rendu GitHub + Airtable au plus tard le 14 juillet 2025 à 23h59**
> 🗣 **Soutenance prévue le 15 juillet 2025 – 15 min de présentation + 10 min d’échange**

## 📝 Licence

Projet académique – ESGI 2025 – Tous droits réservés.
