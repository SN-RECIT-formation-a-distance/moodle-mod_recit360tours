$from = "moodle-mod_recit360tours/src/*"
$to = "shared/recitfad3/mod/recit360tours"

try {
    . ("..\sync\watcher.ps1")
}
catch {
    Write-Host "Error while loading sync.ps1 script." 
}