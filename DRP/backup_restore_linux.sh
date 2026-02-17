#!/bin/bash
# Backup y Restore Cross-Platform Linux
# Uso:
#   ./backup_restore_linux.sh backup    -> Genera backup
#   ./backup_restore_linux.sh restore <archivo.sql> -> Restaura datos

# Configuración
CONTAINER_NAME="academico-db"
DB_USER="backend"
DB_NAME="academico"

# Acción
ACTION=$1
BACKUP_FILE=$2

if [ "$ACTION" == "backup" ]; then
    DATE=$(date +%F_%H-%M)
    BACKUP_FILE="backup_$DATE.sql"
    echo "Generando backup de datos PostgreSQL en $BACKUP_FILE ..."
    docker exec "$CONTAINER_NAME" pg_dump -U "$DB_USER" -a "$DB_NAME" > "$BACKUP_FILE"
    echo "Backup completado: $BACKUP_FILE"

elif [ "$ACTION" == "restore" ]; then
    if [ -z "$BACKUP_FILE" ]; then
        echo "Error: debes especificar el archivo a restaurar."
        echo "Uso: $0 restore <archivo.sql>"
        exit 1
    fi
    echo "Restaurando datos desde $BACKUP_FILE ..."
    cat "$BACKUP_FILE" | docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME"
    echo "Restauración completada."

else
    echo "Uso: $0 backup|restore <archivo.sql>"
    exit 1
fi
