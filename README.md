# Jeregrette — Frontend

**[jeregrette.com](https://jeregrette.com)** est un réseau où l'on publie ses regrets, sous un pseudo ou en anonyme. Les autres y réagissent ou les republient avec leur propre commentaire.

Ce dépôt contient l'application web. L'API, en Laravel, vit dans un dépôt privé.

![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)

<p align="center">
  <img src="docs/capture-mobile.jpg" alt="Le fil de Jeregrette sur mobile" width="320">
</p>

---

## Fonctionnalités

**Le fil**
- Fil infini **virtualisé** : seules les cartes visibles à l'écran existent dans la page, le défilement reste fluide même sur un petit téléphone.
- Bannière « nouveaux regrets » : le site vérifie régulièrement s'il y a du nouveau, sans recharger la page.
- Réactions (💀 🤣 😭 👍 💪) avec leurs compteurs, et republication avec commentaire.
- La republication s'ouvre dans une fenêtre par-dessus le fil, tout en gardant sa propre adresse partageable.

**Publier et partager**
- Publication d'un regret en quelques secondes, depuis le bouton toujours visible en bas de l'écran.
- **Comptes invités** : la première action crée un compte invité, on peut publier sans s'inscrire.
- **Partage en image** : chaque regret devient un PNG carré de 1080 × 1080, généré côté serveur aux couleurs de sa carte. L'image passe par le menu de partage du téléphone, WhatsApp compris, avec un lien `wa.me` en secours quand le navigateur ne sait pas partager de fichier.

**Comptes**
- Inscription, connexion, profil, pages publiques des utilisateurs, badge vérifié.
- Notifications.

**Fiabilité et sécurité**
- Le navigateur ne parle jamais directement à l'API : Next.js sert d'intermédiaire, et l'adresse de l'API comme les jetons restent côté serveur.
- Jetons de session dans des cookies `httpOnly`, illisibles par le JavaScript de la page, renouvelés automatiquement. Un seul renouvellement est lancé même si plusieurs requêtes arrivent en même temps.
- **Mode panne** : si l'API répond par une erreur 5xx ou 429, ou ne répond plus, le fil affiche un message clair et réessaie tout seul. Le délai commence à 8 s, s'allonge à chaque essai jusqu'à 60 s, et les essais s'arrêtent tant que l'onglet est caché.
- Les appels passent toujours en HTTPS, pour qu'aucun mot de passe ne circule en clair.

**Partout**
- Application installable (PWA).
- Version Android possible avec Capacitor (`npm run cap:build`).

---

## Stack technique

| Domaine | Outils |
| --- | --- |
| Framework | Next.js 16 (App Router, Server Actions, route handlers, `proxy.ts`) |
| UI | React 19, TypeScript, Tailwind CSS 4 |
| Fil | TanStack Virtual |
| Images de partage | `next/og` |
| Mobile | PWA (`@ducanh2912/next-pwa`), Capacitor |
| API | Laravel (dépôt privé) |
| Déploiement | Vercel, Docker, GitHub Actions |

---

## Organisation du code

```
src/
├── app/              # Pages et routes (App Router)
│   ├── (feed)/       # Le fil
│   ├── (modal)/      # Connexion, inscription, publier, republier
│   ├── @modal/       # Les mêmes écrans ouverts par-dessus le fil
│   ├── api/feed/     # Intermédiaire entre le navigateur et l'API
│   └── regret/[id]/  # Page d'un regret et son image de partage
├── components/       # Interface : fil, cartes, réactions, comptes…
├── lib/              # Appels à l'API, sessions, conversion des données
├── types/            # Types de l'API
└── proxy.ts          # Sessions et redirections, avant chaque requête
scripts/
└── mesure-api.py     # Chronomètre l'API pour savoir si une lenteur vient du back ou du front
```

---

## Lancer le projet

Prérequis : Node.js 22.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Le site tourne alors sur [http://localhost:3000](http://localhost:3000).

| Variable | Rôle |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Adresse publique du site, utilisée pour les métadonnées et les liens de partage |
| `API_URL` | Adresse de l'API Laravel (HTTPS obligatoire, sauf en local) |
| `AVATAR_UPLOAD` | `1` pour activer l'envoi de photo de profil quand l'API le permet |

| Commande | Rôle |
| --- | --- |
| `npm run dev` | Serveur de développement |
| `npm run build` puis `npm start` | Version de production |
| `npm run lint` | Vérification du code |
| `npm run cap:build` | Préparation de la version Android |
| `python3 scripts/mesure-api.py` | Mesure des temps de réponse de l'API |

---

## Déploiement

- **Production** : sur Vercel, à l'adresse [jeregrette.com](https://jeregrette.com).
- **Docker** : image en plusieurs étapes, en sortie `standalone`, lancée avec un utilisateur sans droits d'administration. Chaque envoi sur la branche `ci-cd` construit l'image et la publie sur Docker Hub grâce à GitHub Actions.

```bash
docker build -t jeregrette-frontend .
docker run -p 3000:3000 jeregrette-frontend
```

---

## L'équipe

| | Rôle |
| --- | --- |
| **Christ Jérémie N'GBE** | Design de l'interface (Figma) |
| **Armand Yapi** | Front-end |
| **Georges Kennel KASSI** | Back-end (API Laravel), et sur le front : fil infini, renouvellement des sessions |
| **Elie N'srango** | DevOps : Docker, CI/CD, hébergement de l'API |