.PHONY: help d-up d-down

help:
	@echo.
	@echo "Commandes disponibles:"
	@echo "make d-up    - Démarrer les conteneurs Docker en arrière-plan"
	@echo "make d-down  - Arrêter et supprimer les conteneurs Docker"
	@echo.

d-up:
	docker compose up -d

d-down:
	docker compose down
