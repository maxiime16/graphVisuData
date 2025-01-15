# Projet : Visualisation des données scolaires

Ce projet est une application web permettant de visualiser et d'interagir avec des données spécifiques grâce à des graphiques, une carte interactive et des fonctionnalités de recherche. Voici un aperçu des fichiers et fonctionnalités inclus dans le projet.

## Structure du projet

### 1. Fichiers HTML

#### `index.html`
- **Description** : Page principale de l'application web.
- **Fonctionnalités** :
  - Affichage de graphiques interactifs.
  - Composants pour la recherche et l'interaction avec les données.
- **Sections principales** :
  - Barre de navigation avec des liens pour basculer entre les graphiques et la recherche.
  - Deux sections distinctes :
    - Une pour les graphiques.
    - Une autre pour la recherche et la carte.

#### `/ecole/oldindex.html`
- **Description** : Ancienne version ou sauvegarde de la page principale.
- **Usage** : Peut être utilisée pour référence ou comparaison.

### 2. Fichiers CSS

#### `css/styles.css`
- **Description** : Feuille de style principale pour l'application.
- **Thème** :
  - Basé sur des couleurs harmonieuses (vert, blanc, orange, en accord avec un thème irlandais).
- **Composants stylisés** :
  - Barre de navigation.
  - Sections pour les graphiques et la recherche.
  - Boutons, tableaux, formulaires et la carte interactive.

### 3. Fichiers JavaScript

#### `js/charts.js`
- **Description** : Contient les scripts pour les graphiques interactifs.
- **Fonctionnalités** :
  - Génération de graphiques à l'aide de Chart.js.
  - Récupération des données depuis une API publique.
  - Deux graphiques principaux :
    - **Graphique des décès par tranche d'âge et par sexe**.
    - **Graphique des décès par année (1970-2024)**.

#### `js/searchAndMap.js`
- **Description** : Contient les scripts pour la recherche avancée et la carte interactive.
- **Fonctionnalités** :
  - Intégration avec la bibliothèque Leaflet pour afficher des données géographiques.
  - Composants de recherche basés sur des critères comme le nom, le prénom, l'année ou le département.

## Fonctionnalités principales

1. **Graphiques interactifs**
   - Visualisation des données via Chart.js.
   - Affichage des tendances par année et par tranche d'âge.

2. **Recherche avancée**
   - Interface utilisateur pour rechercher des données spécifiques.
   - Options pour filtrer par différents critères (nom, département, etc.).

3. **Carte interactive**
   - Utilisation de Leaflet pour visualiser les données géographiques.

## Installation et utilisation

1. **Prérequis**
   - Navigateur moderne compatible avec ES6+.
   - Connexion Internet pour charger les dépendances (Chart.js, Leaflet).

2. **Lancer le projet**
   - Ouvrir `index.html` dans votre navigateur.

3. **Interagir avec l'application**
   - Naviguez entre les graphiques et la recherche via la barre de navigation.
   - Explorez les données via les graphiques ou la carte interactive.

## Dépendances

- **Chart.js** : Bibliothèque pour afficher des graphiques.
- **Leaflet.js** : Bibliothèque pour la visualisation de données géographiques.
