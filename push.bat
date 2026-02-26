@echo off
REM Push a GitLab y GitHub. GitHub NUNCA recibe proyectos.json.
setlocal

git diff --quiet 2>nul && git diff --cached --quiet 2>nul || (
  echo Hay cambios sin commitear. Haz commit antes de ejecutar push.
  exit /b 1
)

echo Pushing to GitLab...
git push gitlab master 2>nul || git push origin master
if errorlevel 1 (
  echo Error al hacer push a GitLab
  exit /b 1
)

echo Preparando push a GitHub (sin proyectos.json)...
git branch -D gh-public 2>nul
git checkout -b gh-public
copy /Y data\proyectos.json.public data\proyectos.json >nul
git add data/proyectos.json
git commit -m "Public: sin datos de proyectos"
git push github gh-public:main --force
git checkout master
git branch -D gh-public

echo Listo: GitLab + GitHub actualizados.
