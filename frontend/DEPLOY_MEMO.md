# Memo Déploiement VPS - Novelya (Nginx)

Ce fichier sert de rappel pour la mise en production du frontend sur un VPS avec Nginx.

## 1. Générer le build

Lancer la commande suivante.

> [!NOTE]
> Si votre site est dans un sous-dossier (ex: `mondomaine.com/novelya`), lancez : `ng build --base-href /novelya/`

```powershell
npm run build
```

## 2. Configuration Nginx (Pas à Pas)

### A. Créer le fichier de configuration

Remplacez `votre-site` par le nom souhaité.

```bash
sudo nano /etc/nginx/sites-available/novelya
```

**Copiez ce contenu dans le fichier :**

```nginx
server {
    listen 80;
    server_name votre-domaine.com; # <--- À MODIFIER
    root /var/www/novelya/browser; # <--- À MODIFIER vers le dossier dist uploadé
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### B. Activer le site

```bash
sudo ln -s /etc/nginx/sites-available/novelya /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### C. Sécuriser avec SSL (Certbot)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d votre-domaine.com
```

## 3. Déploiement (Transfert)

Transférez le **contenu** du dossier local `dist/novelya-front/browser/` vers le répertoire défini dans `root` (ex: `/var/www/novelya/browser`).

## 4. Maintenance / Reset

Si vous modifiez la config Nginx plus tard :

```bash
sudo nginx -t && sudo systemctl reload nginx
```

---

_Note : Si l'URL de l'API change, pensez à la mettre à jour dans `src/environments/environment.prod.ts`._
