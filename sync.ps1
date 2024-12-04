$from = "moodle-mod_recit360tours/src/*"
$to = "shared/recitfad/mod/recit360tours"
$source = "./src";

try {
    . ("..\sync\watcher.ps1")
}
catch {
    Write-Host "Error while loading sync.ps1 script." 
}