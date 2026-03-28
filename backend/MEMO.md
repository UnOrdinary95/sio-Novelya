# MEMO Novelya

## Accès MongoDB (PROD)

```bash
sudo docker-compose -f docker-compose.prod.yaml exec mongodb mongosh -u $(grep MONGO_USER .env | cut -d= -f2) -p $(grep MONGO_PASSWORD .env | cut -d= -f2) --authenticationDatabase admin
```

### Commandes MongoDB

```mongodb
show dbs                    # Liste les bases
use novelya                 # Changer de base
show collections            # Lister les collections
db.LightNovel.countDocuments()  # Compter les docs
db.LightNovel.findOne()     # Voir un doc
db.LightNovel.find().limit(5)   # Voir 5 docs
db.dropDatabase()            # Supprimer la base (attention!)
exit                         # Quitter
```

## Déploiement back

```bash
# Rebuild + redémarrage
sudo docker-compose -f docker-compose.prod.yaml build
sudo docker-compose -f docker-compose.prod.yaml down -v
sudo docker-compose -f docker-compose.prod.yaml up -d

# Voir les logs
sudo docker-compose -f docker-compose.prod.yaml logs novelya-back -f
```
