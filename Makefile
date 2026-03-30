.PHONY: help d-db d-up d-down d-ps d-front d-back d-build d-logs-front d-logs-back d-logs-db

help:
	@echo .
	@echo "Commandes Docker disponibles :"
	@echo "make d-up          : Démarrer tous les services (front + back + db)"
	@echo "make d-build       : Builder et démarrer tous les services"
	@echo "make d-down        : Arrêter tous les conteneurs"
	@echo "make d-ps          : Afficher l'état des conteneurs"
	@echo .
	@echo "Services individuels :"
	@echo "make d-front       : Démarrer uniquement le frontend"
	@echo "make d-back        : Démarrer uniquement le backend + db"
	@echo "make d-db          : Démarrer uniquement la base de données"
	@echo .
	@echo "Logs :"
	@echo "make d-logs-front  : Voir les logs du frontend"
	@echo "make d-logs-back   : Voir les logs du backend"
	@echo "make d-logs-db     : Voir les logs de la base de données"
	@echo .

# Commandes principales
d-up:
	docker compose up -d

d-build:
	docker compose up --build -d

d-down:
	docker compose down

d-ps:
	docker compose ps

# Services individuels
d-front:
	docker compose up -d frontend

d-back:
	docker compose up -d backend db

d-db:
	docker compose up -d db

# Logs
d-logs-front:
	docker compose logs -f frontend

d-logs-back:
	docker compose logs -f backend

d-logs-db:
	docker compose logs -f db
