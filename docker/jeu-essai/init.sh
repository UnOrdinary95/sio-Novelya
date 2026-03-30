#!/bin/bash
set -e

echo "Importing seed data..."

# Attendre que MongoDB soit prêt
until mongosh -u "$MONGO_INITDB_ROOT_USERNAME" -p "$MONGO_INITDB_ROOT_PASSWORD" --authenticationDatabase admin --eval "db.adminCommand('ping')" > /dev/null 2>&1; do
  echo "Waiting for MongoDB..."
  sleep 1
done

# Restaurer la base novelya avec authentification
mongorestore -u "$MONGO_INITDB_ROOT_USERNAME" -p "$MONGO_INITDB_ROOT_PASSWORD" --authenticationDatabase admin --db novelya --drop /docker-entrypoint-initdb.d/novelya/

echo "Seed data imported successfully!"
