# Changelog

## [1.0.0] - 2026-10-01
    - Version officielle 1.0.0 de l'interface utilisateur en tant qu'application web progressive

### Features: 
    - Prise en charge du mode application web progressive

## [1.0.1] - 2026-10-01

### Fixed
    - Correction du filigrane pour éviter le stockage au backend
    - Suppression du menu Hamberger
    - Ajout de nouvelles couleurs de backgound pour les posts
    - Transformation de la publication de nouveau regret en pop up


## [1.1.2] - 2026-10-04

### Changed
- Mise à jour du workflow CI/CD vers la version `1.1.2`.
- Ajout de la prise en charge de la personnalisation spécifique à chaque environnement (production vs. test) dans :
    - Le manifeste PWA (`src/app/manifest.ts`)
    - La configuration du site (`src/lib/config.ts`)

## [1.1.3] - 2026-10-11

### Changed
- Amélioration du cycle de vie PWA : mise en cache de l’URL de démarrage, rechargement au retour en ligne, activation immédiate du nouveau service worker et nettoyage des anciens caches.
- Désactivation de la mise en cache HTTP de `/sw.js` afin que le navigateur récupère la version courante du service worker.
