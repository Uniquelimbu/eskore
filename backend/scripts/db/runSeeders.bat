@echo off
REM Run all seeders in the correct order
echo Running seeders in sequence...

cd %~dp0\..\..
echo Current directory: %CD%

echo 1. Seeding leagues...
npx sequelize-cli db:seed --seed src/seeders/20240101000001-demo-leagues.js
if %ERRORLEVEL% NEQ 0 goto error

echo 2. Seeding users...
npx sequelize-cli db:seed --seed src/seeders/20240101000002-demo-users.js
if %ERRORLEVEL% NEQ 0 goto error

echo 3. Seeding teams...
npx sequelize-cli db:seed --seed src/seeders/20240101000003-demo-teams.js
if %ERRORLEVEL% NEQ 0 goto error

echo 4. Seeding user-team relationships...
npx sequelize-cli db:seed --seed src/seeders/20240101000004-demo-user-teams.js
if %ERRORLEVEL% NEQ 0 goto error

echo 5. Seeding tournaments...
npx sequelize-cli db:seed --seed src/seeders/20250510-demo-001-tournaments.js
if %ERRORLEVEL% NEQ 0 goto error

echo 6. Seeding matches...
npx sequelize-cli db:seed --seed src/seeders/20250510-demo-002-matches.js
if %ERRORLEVEL% NEQ 0 goto error

echo All seeders completed successfully!
goto end

:error
echo Error running seeders. Check output above for details.
exit /b 1

:end
echo Database seeding complete.
