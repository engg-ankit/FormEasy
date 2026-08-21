@echo off
echo Switching to PostgreSQL for deployment...

:: Backup current schema
copy prisma\schema.prisma prisma\schema.sqlite.bak /Y

:: Replace provider using PowerShell
powershell -Command "(Get-Content 'prisma/schema.prisma') -replace 'provider = \"sqlite\"', 'provider = \"postgresql\"' | Set-Content 'prisma/schema.prisma'"

echo Schema switched to PostgreSQL
echo Now run: npx prisma db push ^&^& git add . ^&^& git commit -m "deploy: switch to postgres" ^&^& git push
echo.
echo After deploy, run: copy prisma\schema.sqlite.bak prisma\schema.prisma to restore local dev
pause
