#!/bin/bash
set -e

echo "Importing seed data..."

# Attendre que MongoDB soit prêt
until mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; do
  echo "Waiting for MongoDB..."
  sleep 1
done

# Restaurer la base novelya
mongorestore --db novelya --drop /docker-entrypoint-initdb.d/novelya/

echo "Seed data imported successfully!"
