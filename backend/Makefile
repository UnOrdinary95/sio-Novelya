.PHONY: help mongosh docker-watch docker-logs docker-up docker-down

help:
	@echo.
	@echo "Commandes disponibles:"
	@echo "make mongosh      - Connecter à l'instance MongoDB avec mongosh"
	@echo "make docker-watch - Surveiller les changements et redémarrer le conteneur"
	@echo "make docker-logs  - Afficher les logs du conteneur novelya-back"
	@echo "make docker-up    - Démarrer les conteneurs Docker en arrière-plan"
	@echo "make docker-down  - Arrêter et supprimer les conteneurs Docker"
	@echo.

mongosh:
	mongosh "mongodb://admin:password@localhost:27017/novelya?authSource=admin"

docker-watch:
	docker compose watch

docker-logs:
	docker compose logs novelya-back -f

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down
