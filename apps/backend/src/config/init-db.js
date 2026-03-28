db = db.getSiblingDB("novelya");

// Crée si ils n'existent pas déjà
db.createCollection("LightNovel");
db.createCollection("User");

// Création d'un index unique sur le champ "email" de la collection "User"
db.User.createIndex({ email: 1 }, { unique: true });

// Création d'un index sur le champ "genres" de la collection "LightNovel" (pour les recherches par genre)
db.LightNovel.createIndex({ genres: 1 });
