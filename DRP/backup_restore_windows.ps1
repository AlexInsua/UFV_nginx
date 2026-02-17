# Backup y Restore Windows PowerShell
# Uso:
#   .\backup_restore_windows.ps1 backup       -> Genera backup
#   .\backup_restore_windows.ps1 restore <archivo.sql> -> Restaura datos

param (
    [Parameter(Mandatory=$true)]
    [ValidateSet("backup","restore")]
    [string]$Action,

    [string]$File
)

$ContainerName = "academico-db"
$DbUser = "backend"
$DbName = "academico"

if ($Action -eq "backup") {
    $date = Get-Date -Format "yyyy-MM-dd_HH-mm"
    $BackupFile = "backup_$date.sql"
    Write-Host "Generando backup de datos PostgreSQL en $BackupFile ..."
    docker exec $ContainerName pg_dump -U $DbUser -a $DbName > $BackupFile
    Write-Host "Backup completado: $BackupFile"

} elseif ($Action -eq "restore") {
    if (-not $File) {
        Write-Host "Error: debes especificar el archivo a restaurar."
        Write-Host "Uso: .\backup_restore_windows.ps1 restore <archivo.sql>"
        exit 1
    }
    Write-Host "Restaurando datos desde $File ..."
    Get-Content $File | docker exec -i $ContainerName psql -U $DbUser -d $DbName
    Write-Host "Restauración completada."
}
