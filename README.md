# 🍽️ Cooking Recipes Platform - Plateforme de Recettes Intelligente

Une plateforme moderne et complète de gestion de recettes avec intelligence artificielle, authentification utilisateur et fonctionnalités sociales avancées.

## ✨ Aperçu du Projet

Plateforme fullstack de recettes de cuisine avec :
- **Backend NestJS** avec authentification JWT et base de données PostgreSQL
- **Frontend React** moderne avec TypeScript et SCSS
- **Intelligence Artificielle** Mistral + Stability AI pour génération de texte et d'images
- **Système d'utilisateurs** complet avec profils personnalisables
- **Fonctionnalités sociales** : avis, notes et partage de recettes
- **Génération d'images IA** : Images culinaires professionnelles avec Stability AI

## 🎯 Fonctionnalités Principales

### 👤 Authentification & Profils
- ✅ **Inscription/Connexion** : Système d'authentification sécurisé JWT
- ✅ **Confirmation email** : Vérification par email avec tokens
- ✅ **Profils utilisateur** : Gestion des informations personnelles
- 🚧 **Photo de profil** : Upload et gestion d'avatar personnalisé
- 🚧 **Description utilisateur** : Bio et présentation personnelle

### 📖 Gestion des Recettes
- ✅ **Création de recettes** : Interface intuitive avec tous les détails
- ✅ **Recettes privées/publiques** : Contrôle de la visibilité
- ✅ **Mes recettes** : Tableau de bord personnel des créations
- ✅ **Recherche avancée** : Par ingrédients, intolérances, difficulté
- ✅ **Filtrage intelligent** : Par tags, allergènes, calories

### 🤖 Intelligence Artificielle
- ✅ **Génération automatique de recettes** : Recettes créées par Mistral AI
- ✅ **Analyse nutritionnelle intelligente** : Calcul automatique des valeurs
- ✅ **Génération d'images culinaires** : Images professionnelles avec Stability AI
- ✅ **Traduction automatique** : Prompts traduits en anglais pour l'IA
- ✅ **Personnalisation IA** : Basée sur les préférences utilisateur
- ✅ **Suggestions intelligentes** : Recettes adaptées aux intolérances
- ✅ **Parsing avancé** : Extraction précise des composants de recette

### ⭐ Fonctionnalités Sociales (En développement)
- 🚧 **Système de notation** : Notes en étoiles (1-5)
- 🚧 **Avis et commentaires** : Feedback détaillé sur les recettes
- 🚧 **Partage social** : Partage de recettes entre utilisateurs
- 🚧 **Recettes favorites** : Sauvegarde des recettes appréciées

## 🔧 Dernières Améliorations (Août 2025)

### ✅ Corrections Récentes
- **🖼️ Intégration Stability AI** : Génération d'images culinaires professionnelles
- **🌍 Traduction automatique** : Prompts français → anglais pour l'IA
- **🔍 Parsing amélioré** : Extraction précise du nom de recette
- **⚡ Performance optimisée** : Réduction des temps de réponse IA
- **🐛 Corrections de bugs** : Gestion d'erreurs robuste et logging détaillé

### 🎯 Nouvelles Fonctionnalités IA
- **Génération de recettes avec images** : Workflow complet texte + image
- **Prompt engineering avancé** : Prompts optimisés pour meilleurs résultats
- **Gestion multilingue** : Support français avec traduction automatique
- **Cache intelligent** : Réduction des appels API redondants

## 🏗️ Architecture Technique

### Backend (NestJS + TypeScript + PostgreSQL)
```
backend/
├── src/
│   ├── auth/              # Authentification JWT & Guards
│   ├── users/             # Gestion des utilisateurs
│   ├── recipes/           # CRUD recettes avec relations
│   ├── reviews/           # Système d'avis et notes
│   ├── ai/                # Contrôleur IA (Mistral + Stability)
│   ├── mistral/           # Service d'intégration Mistral AI
│   │   ├── mistral.service.ts    # Génération texte + parsing
│   │   ├── mistral.module.ts     # Module IA
│   │   └── translatePromptToEnglish() # Traduction automatique
│   ├── stability/         # Service Stability AI (Images)
│   ├── airtable/          # Service legacy Airtable
│   ├── mail/              # Service d'envoi d'emails
│   └── database/          # Migrations et seeds
├── Dockerfile             # Multi-stage pour production
└── docker-compose.yml     # Orchestration avec PostgreSQL
```

### Frontend (React + TypeScript + SCSS)
```
frontend/
├── src/
│   ├── components/        # Composants réutilisables
│   │   ├── Header.tsx     # Navigation avec auth
│   │   ├── Footer.tsx     # Pied de page
│   │   └── IntoleranceSelector.tsx
│   ├── pages/            # Pages principales
│   │   ├── Home.tsx       # Accueil avec recherche
│   │   ├── Login.tsx      # Connexion utilisateur
│   │   ├── Register.tsx   # Inscription
│   │   ├── Profile.tsx    # Profil utilisateur
│   │   ├── ConfirmEmail.tsx # Confirmation email
│   │   ├── CreateRecipe.tsx # Création de recette
│   │   ├── GenerateRecipe.tsx # Génération IA avec images
│   │   └── RecipeDetail.tsx # Détail de recette
│   ├── services/         # Services API
│   │   ├── authService.ts # Authentification
│   │   ├── recipeService.ts # Gestion recettes
│   │   └── aiService.ts   # Intelligence artificielle
│   │       ├── generateRecipeWithImage() # Workflow complet
│   │       ├── translateToEnglish()      # Traduction frontend
│   │       └── generateImageWithStability() # Intégration images
│   ├── types/            # Interfaces TypeScript
│   └── styles/           # Styles SCSS modulaires
├── Dockerfile            # Multi-stage pour production
└── package.json          # Dépendances React
```

## 🚀 Installation et Démarrage

### 🐳 Avec Docker (Recommandé)

```bash
# Cloner le projet
git clone https://github.com/Narutino10/cooking-recipes-project.git
cd cooking-recipes-project

# Lancer tous les services
docker-compose up --build

# Accéder à l'application
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001
# Base de données: localhost:5432
```

### 💻 Installation Manuelle

#### Backend
```bash
cd backend
npm install

# Configuration de l'environnement
cp .env.example .env
# Éditer .env avec vos clés API

# Démarrage en développement
npm run start:dev

# Tests
npm run test
npm run test:e2e
```

#### Frontend
```bash
cd frontend
npm install

# Configuration de l'environnement
cp .env.example .env
# Configurer REACT_APP_API_URL

# Démarrage en développement
npm start

# Tests
npm test

# Build de production
npm run build
```

## ⚙️ Configuration

### Variables d'Environnement Backend
```env
# Base de données
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=cooking_recipes

# Authentification
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Email
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password

# IA Mistral (Texte)
MISTRAL_API_KEY=your-mistral-api-key
MISTRAL_IMAGE_API_URL=https://api.mistral.ai/v1/images

# IA Stability (Images)
STABILITY_API_KEY=your-stability-api-key
STABILITY_API_URL=https://api.stability.ai/v2beta/stable-image/generate/core
IMAGE_API_PROVIDER=stability

# Legacy Airtable
AIRTABLE_API_TOKEN=your-airtable-token
AIRTABLE_BASE_ID=your-base-id
```

### Variables d'Environnement Frontend
```env
REACT_APP_API_URL=http://localhost:3001
REACT_APP_APP_NAME=Cooking Recipes Platform
```

## 🎮 Guide d'Utilisation

### 👤 Authentification
1. **Inscription** : Créer un compte via `/register`
2. **Confirmation email** : Vérifier votre email
3. **Connexion** : Se connecter via `/login`
4. **Profil** : Gérer ses informations via `/profile`

### 📖 Gestion des Recettes

#### Créer une Recette
1. Accéder à `/create-recipe`
2. Remplir les informations :
   - **Nom et description**
   - **Ingrédients** (liste détaillée)
   - **Instructions** étape par étape
   - **Informations nutritionnelles**
   - **Tags et intolérances**
   - **Visibilité** (publique/privée)

#### Générer une Recette avec l'IA
1. Accéder à `/generate-recipe`
2. Spécifier :
   - **Ingrédients disponibles**
   - **Nombre de personnes**
   - **Intolérances alimentaires**
   - **Type de plat souhaité**
3. L'IA génère une recette complète avec analyse nutritionnelle

#### Découvrir les Recettes
- **Page d'accueil** : Parcourir toutes les recettes publiques
- **Recherche** : Par nom, ingrédients ou tags
- **Filtrage** : Par intolérances, difficulté, calories
- **Mes recettes** : Via le profil utilisateur

### ⭐ Interactions Sociales (Bientôt disponible)
- **Noter une recette** : Système d'étoiles 1-5
- **Laisser un avis** : Commentaires détaillés
- **Partager** : Avec la communauté

## 🔧 Technologies et Stack

### Backend
- **🏗️ NestJS** : Framework Node.js enterprise
- **📝 TypeScript** : Typage statique et moderne
- **🛡️ Passport JWT** : Authentification sécurisée
- **🗄️ TypeORM** : ORM pour PostgreSQL
- **📧 Nodemailer** : Envoi d'emails
- **🤖 Mistral AI** : Génération de texte et recettes
- **🎨 Stability AI** : Génération d'images culinaires
- **🐳 Docker** : Conteneurisation multi-stage

### Frontend
- **⚛️ React 18** : Framework frontend moderne
- **📝 TypeScript** : Typage statique
- **🧭 React Router** : Navigation SPA
- **🎨 SCSS** : Préprocesseur CSS avancé
- **📡 Axios** : Client HTTP avec intercepteurs
- **🔄 React Hooks** : Gestion d'état moderne

### Base de Données & Infrastructure
- **🐘 PostgreSQL** : Base de données relationnelle
- **🐳 Docker Compose** : Orchestration des services
- **📊 Airtable** : Support legacy
- **☁️ Production ready** : Dockerfiles optimisés

## 🎨 Design et Expérience Utilisateur

### Interface Moderne
- **🎨 Design responsive** : Adapté mobile et desktop
- **⚡ Navigation fluide** : Single Page Application
- **🎯 UX intuitive** : Interface claire et moderne
- **🌈 SCSS modulaire** : Styles maintenables et réutilisables

### Accessibilité
- **♿ Structure sémantique** : HTML accessible
- **⌨️ Navigation clavier** : Support complet
- **🔍 SEO optimisé** : Meta tags et structure
- **📱 Mobile first** : Responsive design

## 🧪 Tests et Qualité

```bash
# Tests Backend
cd backend
npm run test              # Tests unitaires
npm run test:e2e         # Tests end-to-end
npm run test:cov         # Couverture de code

# Tests Frontend
cd frontend
npm test                 # Tests unitaires React
npm run test:coverage   # Couverture de code

# Linting et Formatage
npm run lint            # ESLint
npm run format          # Prettier
```

## 📈 Roadmap et Évolutions

### 🚧 Version 1.1 (En cours)
- [x] ✅ Système d'authentification complet
- [x] ✅ Profils utilisateur avec CRUD
- [x] ✅ Recettes privées/publiques
- [ ] 🔄 Upload de photos de profil
- [ ] 🔄 Système de notation (étoiles)
- [ ] 🔄 Avis et commentaires détaillés

### 🎯 Version 1.2 (Prochaine)
- [ ] 📱 Application mobile React Native
- [ ] 🔍 Recherche elasticsearch avancée
- [ ] 📊 Analytics et statistiques utilisateur
- [ ] 🤝 Système d'amis et followers
- [ ] 📅 Planificateur de repas hebdomadaire

### 🚀 Version 2.0 (Vision long terme)
- [ ] 🎥 Upload de vidéos de recettes
- [ ] 🛒 Génération automatique de listes de courses
- [ ] 🏪 Intégration avec services de livraison
- [ ] 🎮 Gamification (badges, niveaux)
- [ ] 🌍 Internationalisation multi-langues
- [ ] 🔌 API publique pour développeurs

## 🤝 Contribution et Développement

### Structure du Projet
```
cooking-recipes-project/
├── 📁 backend/           # API NestJS + PostgreSQL
├── 📁 frontend/          # React App + SCSS
├── 📄 docker-compose.yml # Orchestration complète
├── 📄 .env.example       # Template configuration
└── 📄 README.md          # Documentation (ce fichier)
```

### Standards de Code
- **TypeScript strict** : Typage obligatoire
- **ESLint + Prettier** : Code formaté automatiquement
- **Convention de nommage** : camelCase, PascalCase
- **Git conventional commits** : Messages structurés
- **Tests unitaires** : Couverture minimum 80%

### Workflow de Développement
1. **Fork** le projet
2. **Créer une branch** : `git checkout -b feature/nouvelle-fonctionnalite`
3. **Développer** avec tests
4. **Commit** : `git commit -m "feat: ajout système de notation"`
5. **Push** : `git push origin feature/nouvelle-fonctionnalite`
6. **Pull Request** avec description détaillée

## 🏢 Équipe et Rôles

### 👨‍💻 Développement
- **Backend Lead** : Architecture NestJS, base de données, API REST
- **Frontend Lead** : Interface React, UX/UI, intégration API
- **DevOps** : Docker, CI/CD, déploiement production
- **IA/ML** : Intégration Mistral, optimisation prompts

### 🎯 Product Management
- **Product Owner** : Définition fonctionnalités, roadmap
- **UX Designer** : Wireframes, prototypes, tests utilisateur
- **QA Engineer** : Tests automatisés, validation fonctionnelle

## 🔐 Sécurité et Bonnes Pratiques

### Backend
- ✅ **Authentification JWT** avec refresh tokens
- ✅ **Validation des données** avec class-validator
- ✅ **Hash des mots de passe** avec bcrypt
- ✅ **Protection CORS** configurée
- ✅ **Rate limiting** contre le spam
- ✅ **Sanitisation** des entrées utilisateur

### Frontend
- ✅ **Gestion sécurisée des tokens** (localStorage)
- ✅ **Validation des formulaires** côté client
- ✅ **Protection des routes** avec guards
- ✅ **Échappement XSS** automatique React
- ✅ **HTTPS en production** obligatoire

## 📊 Performance et Monitoring

### Métriques Backend
- **Response Time** : < 200ms pour 95% des requêtes
- **Uptime** : 99.9% de disponibilité
- **Database** : Connexions poolées, index optimisés
- **Memory** : Limite 512MB par conteneur

### Métriques Frontend
- **First Paint** : < 1s
- **Bundle Size** : < 500KB gzippé
- **Lighthouse Score** : > 90/100
- **Mobile Performance** : Optimisé responsive

## 🌍 Déploiement Production

### Infrastructure Cloud
```bash
# Build des images
docker build -t cooking-app-backend ./backend
docker build -t cooking-app-frontend ./frontend

# Déploiement avec Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# Monitoring des logs
docker-compose logs -f
```

### Variables Production
```env
NODE_ENV=production
DATABASE_SSL=true
JWT_SECRET=your-production-secret-256-bits
FRONTEND_URL=https://yourdomain.com
MAIL_FROM=noreply@yourdomain.com
```

## 🎓 Projet Académique ESGI

### Contexte Pédagogique
- **Module** : Développement Full Stack JavaScript
- **Année** : Master 2 - Architecture des Logiciels
- **Objectifs** : Maîtrise stack moderne, patterns architecturaux
- **Durée** : 6 mois de développement
- **Évaluation** : Soutenance technique + démonstration

### Compétences Développées
- 🏗️ **Architecture** : Microservices, design patterns
- 🔧 **Backend** : NestJS, TypeORM, JWT, PostgreSQL
- ⚛️ **Frontend** : React, TypeScript, state management
- 🤖 **IA** : Intégration API Mistral, prompt engineering
- 🐳 **DevOps** : Docker, CI/CD, déploiement cloud
- 🧪 **Testing** : Unit tests, integration tests, E2E

## 📄 Licence et Mentions Légales

### Licence
```
MIT License - Projet Académique ESGI

Copyright (c) 2025 Cooking Recipes Platform Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

### Crédits
- **Mistral AI** : Génération intelligente de recettes et texte
- **Stability AI** : Génération d'images culinaires professionnelles
- **Airtable** : Base de données legacy
- **Unsplash** : Images de recettes libres de droits
- **Icons8** : Iconographie interface utilisateur

## 🛠️ Bonnes Pratiques IA & Debugging

### 🔧 Résolution des Problèmes Courants

#### Erreur 500 - Stability AI
```bash
# Vérifier les logs du backend
docker logs cooking-recipes-backend --tail 20

# Vérifier la clé API Stability
echo $STABILITY_API_KEY

# Tester l'endpoint directement
curl -X POST http://localhost:3001/ai/generate-image \
  -H "Content-Type: application/json" \
  -d '{"prompt": "A beautiful culinary dish"}'
```

#### Parsing de Recette Incorrect
- **Problème** : Le nom extrait est la description nutritionnelle
- **Solution** : Vérifier le parsing dans `aiService.ts`
- **Debug** : Consulter les logs frontend pour voir l'extraction

#### Traduction Non Fonctionnelle
- **Problème** : Prompts encore en français
- **Solution** : Vérifier les fonctions `translateToEnglish()`
- **Debug** : Logs montrent "Original prompt" vs "Translated prompt"

### 🎯 Optimisations IA

#### Prompt Engineering
```typescript
// Bon prompt pour Stability AI
const prompt = `Professional culinary photograph of ${dishName}, 
gourmet presentation, natural lighting, food photography style`;

// Éviter les prompts trop longs
const cleanPrompt = prompt.substring(0, 500);
```

#### Gestion des Erreurs
```typescript
try {
  const image = await generateImage(prompt);
} catch (error) {
  console.error('IA Error:', error.message);
  // Fallback vers image par défaut
  return defaultImage;
}
```

#### Cache et Performance
- **Cache des résultats** : Éviter les appels répétés
- **Limite de taux** : Respecter les quotas API
- **Timeout approprié** : 30s pour Stability AI

## 🔗 Liens Utiles et Documentation

### 📚 Documentation Technique
- [NestJS Official Docs](https://docs.nestjs.com/) - Framework backend
- [React Documentation](https://react.dev/) - Framework frontend
- [TypeORM Guide](https://typeorm.io/) - ORM pour PostgreSQL
- [Mistral AI API](https://docs.mistral.ai/) - Intelligence artificielle texte
- [Stability AI API](https://platform.stability.ai/docs/api-reference) - Génération d'images
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

### 🛠️ Outils de Développement
- [VS Code Extensions](https://marketplace.visualstudio.com/) - Thunder Client, GitLens
- [Postman Collection](https://documenter.getpostman.com/) - Tests API
- [pgAdmin](https://www.pgadmin.org/) - Administration PostgreSQL
- [React DevTools](https://react.dev/learn/react-developer-tools)

### 🎨 Ressources Design
- [Material Design](https://material.io/) - Guidelines UX/UI
- [Figma Community](https://www.figma.com/community) - Templates design
- [CSS Grid Generator](https://cssgrid-generator.netlify.app/)
- [Color Palette Tools](https://coolors.co/)

---

## 🎉 Conclusion

**Cooking Recipes Platform** est bien plus qu'une simple application de recettes. C'est un écosystème complet qui combine :

- 🚀 **Technologies modernes** et performantes
- 🤖 **Intelligence artificielle avancée** : Mistral + Stability AI
- 🎨 **Génération d'images professionnelles** : Photos culinaires IA
- 🌍 **Support multilingue** : Français avec traduction automatique
- 👥 **Fonctionnalités sociales** pour la communauté  
- 🎨 **Design épuré** pour l'expérience utilisateur
- 🔒 **Sécurité robuste** pour la confiance
- 📱 **Vision mobile** pour l'accessibilité
- 🛠️ **Debugging avancé** et gestion d'erreurs

### 🌟 *"Cuisiner n'a jamais été aussi intelligent, visuel et social !"*

---

**Dernière mise à jour** : Août 2025 | **Version** : 1.1.0 | **Status** : ✅ Active Development

### 🎯 Fonctionnalités Clés Implémentées
- ✅ Authentification JWT complète
- ✅ Génération de recettes IA (Mistral)
- ✅ Génération d'images culinaires (Stability AI)
- ✅ Traduction automatique français → anglais
- ✅ Parsing avancé des réponses IA
- ✅ Interface utilisateur moderne et responsive
- ✅ Architecture microservices avec Docker

## 🛠️ Commandes de Maintenance et Debug

### Docker Management
```bash
# Redémarrer les services
docker-compose restart

# Redémarrer uniquement le backend
docker-compose restart backend

# Voir les logs en temps réel
docker-compose logs -f

# Voir les logs d'un service spécifique
docker-compose logs -f backend

# Nettoyer les conteneurs arrêtés
docker-compose down
docker system prune -f
```

### Base de Données
```bash
# Accéder à PostgreSQL
docker exec -it cooking-recipes-db psql -U cooking_user -d cooking_recipes

# Supprimer tous les utilisateurs (reset)
docker exec -it cooking-recipes-db psql -U cooking_user -d cooking_recipes -c "DELETE FROM users;"

# Voir les tables existantes
docker exec -it cooking-recipes-db psql -U cooking_user -d cooking_recipes -c "\dt"

# Backup de la base
docker exec cooking-recipes-db pg_dump -U cooking_user cooking_recipes > backup.sql
```

### Tests et Validation
```bash
# Tests backend
cd backend && npm run test:e2e

# Tests frontend
cd frontend && npm test

# Validation des API
curl http://localhost:3001/ai/test
curl http://localhost:3001/auth/profile -H "Authorization: Bearer YOUR_TOKEN"
```

### Monitoring des Performances
```bash
# Utilisation CPU/Mémoire des conteneurs
docker stats

# Logs d'erreur spécifiques
docker logs cooking-recipes-backend 2>&1 | grep -i error

# Vérification des variables d'environnement
docker exec cooking-recipes-backend env | grep -E "(MISTRAL|STABILITY|JWT)"
```

---

*Documentation mise à jour le 28 Août 2025 - Version 1.1.0*

Suppression User:
docker exec -it cooking-recipes-db psql -U cooking_user -d cooking_recipes -c "DELETE FROM users;"