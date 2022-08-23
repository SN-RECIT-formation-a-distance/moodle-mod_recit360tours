echo off
set zipName=mod_recit360tours
set pluginName=recit360tours

rem remove the current 
del %zipName%

rem zip the folder except the folders .cache and node_modules
"c:\Program Files\7-Zip\7z.exe" a -mx "%zipName%.zip" "src\*" -mx0 -xr!"src\react\.cache" -xr!"src\react\node_modules" -xr!"src\react\package-lock.json"

rem set the plugin name
"c:\Program Files\7-Zip\7z.exe" rn "%zipName%.zip" "src\" "%pluginName%\"

pause