@echo off
REM Run all seeders in the correct order
echo Running seeders in sequence...

cd %~dp0\..\..
echo Current directory: %CD%

echo 1. Seeding users...
npx sequelize-cli db:seed --seed src/seeders/20240101000002-demo-users.js
if %ERRORLEVEL% NEQ 0 goto error

echo 2. Seeding tournaments...
npx sequelize-cli db:seed --seed src/seeders/20240101000005-demo-tournaments.js
if %ERRORLEVEL% NEQ 0 goto error

echo All seeders completed successfully!
goto end

:error
echo Error running seeders. Check output above for details.
exit /b 1

:end
echo Database seeding complete.
