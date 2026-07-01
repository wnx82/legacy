#!/bin/bash
# Crée les bases de données logiques nécessaires (legacy, keycloak, umami)
# dans la même instance PostgreSQL, chacune isolée avec son propre schéma.
set -e
set -u

function create_database() {
	local database=$1
	echo "Création de la base de données '$database'"
	psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
	    SELECT 'CREATE DATABASE "$database"' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$database')\gexec
	    GRANT ALL PRIVILEGES ON DATABASE "$database" TO "$POSTGRES_USER";
EOSQL
}

if [ -n "${POSTGRES_MULTIPLE_DATABASES:-}" ]; then
	echo "Bases de données multiples demandées : $POSTGRES_MULTIPLE_DATABASES"
	IFS=',' read -ra DBS <<<"$POSTGRES_MULTIPLE_DATABASES"
	for db in "${DBS[@]}"; do
		create_database "$db"
	done
	echo "Bases de données créées avec succès."
fi
