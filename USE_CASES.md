# Cas d'utilisation - Novelya Backend

## Utilisateur non connecté (Visiteur)

### Authentification

- **S'inscrire** - Créer un nouveau compte utilisateur (`POST /register`)
- **Se connecter** - Se connecter avec un compte existant (`POST /login`)

### Light Novels (Consultation)

- **Voir tous les light novels** - Récupérer la liste complète des light novels disponibles (`GET /lightnovels`)
- **Rechercher par nom** - Rechercher des light novels par titre (`GET /lightnovels/search/{name}`)
- **Filtrer par genre** - Voir les light novels d'un genre spécifique (`GET /lightnovels/genre/{genre}`)
- **Voir les détails** - Consulter les informations détaillées d'un light novel (`GET /lightnovels/{id}`)

---

## Utilisateur connecté (Membre)

### Authentification

- **Se déconnecter** - Déconnexion et suppression du cookie JWT (`POST /logout`)

### Profil utilisateur

- **Voir son profil** - Récupérer ses propres informations (`GET /users/me`)
- **Voir son profil détaillé** - Consulter son profil complet par ID (`GET /users/{id}`)
- **Modifier son profil** - Mettre à jour ses informations personnelles (`PUT /users/{id}`)
- **Supprimer son compte** - Supprimer définitivement son compte (`DELETE /users/{id}`)

### Panier

- **Modifier son panier** - Ajouter ou retirer des articles de son panier (`PATCH /users/{id}/cart`)
    - Quantité positive = ajout au panier
    - Quantité négative = retrait du panier
    - Quantité finale ≤ 0 = suppression de l'article

### Historique d'achats

- **Valider un achat** - Transférer le panier vers l'historique d'achats (`PATCH /users/{id}/history`)

### Liste de souhaits (Wishlist)

- **Gérer sa wishlist** - Ajouter ou retirer un light novel de sa liste de souhaits (`PATCH /users/{id}/wishlist`)

---

## Administrateur

L'administrateur hérite de toutes les capacités de l'utilisateur connecté, avec des privilèges étendus :

### Gestion des utilisateurs

- **Voir tous les utilisateurs** - Récupérer la liste complète des utilisateurs (`GET /users`)
- **Voir un utilisateur spécifique** - Consulter le profil de n'importe quel utilisateur (`GET /users/{id}`)
- **Modifier un utilisateur** - Mettre à jour les informations de n'importe quel utilisateur (`PUT /users/{id}`)
- **Supprimer un utilisateur** - Supprimer le compte de n'importe quel utilisateur (`DELETE /users/{id}`)

### Gestion des light novels

- **Créer un light novel** - Ajouter un nouveau light novel au catalogue (`POST /lightnovels`)
- **Modifier un light novel** - Mettre à jour les informations d'un light novel existant (`PUT /lightnovels/{id}`)
- **Supprimer un light novel** - Retirer un light novel du catalogue (`DELETE /lightnovels/{id}`)
- **Uploader une couverture** - Ajouter/modifier l'image de couverture d'un light novel (`PATCH /lightnovels/{id}/cover`)

---

## Récapitulatif des routes par rôle

| Route                            | Non connecté | Utilisateur | Administrateur |
| -------------------------------- | ------------ | ----------- | -------------- |
| `POST /register`                 | ✅           | ✅          | ✅             |
| `POST /login`                    | ✅           | ✅          | ✅             |
| `POST /logout`                   | ❌           | ✅          | ✅             |
| `GET /lightnovels`               | ✅           | ✅          | ✅             |
| `GET /lightnovels/search/{name}` | ✅           | ✅          | ✅             |
| `GET /lightnovels/genre/{genre}` | ✅           | ✅          | ✅             |
| `GET /lightnovels/{id}`          | ✅           | ✅          | ✅             |
| `POST /lightnovels`              | ❌           | ❌          | ✅             |
| `PUT /lightnovels/{id}`          | ❌           | ❌          | ✅             |
| `DELETE /lightnovels/{id}`       | ❌           | ❌          | ✅             |
| `PATCH /lightnovels/{id}/cover`  | ❌           | ❌          | ✅             |
| `GET /users/me`                  | ❌           | ✅          | ✅             |
| `GET /users`                     | ❌           | ❌          | ✅             |
| `GET /users/{id}`                | ❌           | Soi-même    | Tous           |
| `PUT /users/{id}`                | ❌           | Soi-même    | Tous           |
| `DELETE /users/{id}`             | ❌           | Soi-même    | Tous           |
| `PATCH /users/{id}/cart`         | ❌           | Soi-même    | ❌             |
| `PATCH /users/{id}/history`      | ❌           | Soi-même    | ❌             |
| `PATCH /users/{id}/wishlist`     | ❌           | Soi-même    | ❌             |

**Légende :**

- ✅ = Accès autorisé
- ❌ = Accès refusé
- "Soi-même" = Accès uniquement à ses propres données
- "Tous" = Accès à toutes les données
