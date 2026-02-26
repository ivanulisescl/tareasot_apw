# Despliegue: GitLab + GitHub

**Importante:** GitHub es público. `proyectos.json` NO debe subirse nunca a GitHub.

## Configuración inicial

```bash
git remote add github https://github.com/TU_USUARIO/tareasot_apw.git
```

## Subir cambios

Usar siempre el script (GitHub recibe versión sin `proyectos.json`):

```bash
./push.sh        # Linux/Mac
push.bat         # Windows
```

**No hacer** `git push github master` directamente: subiría proyectos.json.
