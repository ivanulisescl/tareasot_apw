#!/bin/sh
# Push a GitLab y GitHub. GitHub NUNCA recibe proyectos.json (solo placeholder).

set -e

if ! git diff --quiet 2>/dev/null || ! git diff --cached --quiet 2>/dev/null; then
  echo "Hay cambios sin commitear. Haz commit antes de ejecutar push."
  exit 1
fi

echo "Pushing to GitLab..."
git push gitlab master 2>/dev/null || git push origin master

echo "Preparando push a GitHub (sin proyectos.json)..."
git branch -D gh-public 2>/dev/null || true
git checkout -b gh-public
cp data/proyectos.json.public data/proyectos.json
git add data/proyectos.json
git commit -m "Public: sin datos de proyectos"
git push github gh-public:master --force
git checkout master
git branch -D gh-public

echo "Listo: GitLab + GitHub actualizados."
