# Deploying CCT.121 Study Terminal to MochaHost

The site is static HTML/JS plus one PHP file (`api/state.php`) that saves your progress
(notes, flashcards, quiz stats, etc.) in `data/state.json` on the server instead of the browser.
If PHP is unavailable the app silently falls back to browser localStorage.

## What to upload
Upload the **contents** of `CCT.121 Study Terminal/wwwroot/` (not the folder itself), including hidden files:

```
index.html
.htaccess
robots.txt
api/state.php
css/  js/  content/
```
Do not upload `Program.cs`, `appsettings*.json`, or `Lesson Material/` (unless you want those online).
The `data/` folder is created automatically on first use.

## 1. Create the site
1. Log in to MochaHost **cPanel**.
2. Use your main domain's document root (`public_html`), or create a subdomain
   (**Domains > Subdomains**, e.g. `study.yourdomain.com`) which gets its own folder.
   A subdomain is recommended so it is easy to protect separately.
3. Make sure PHP is enabled: **Select PHP Version** (or MultiPHP Manager) -> choose PHP 8.0 or newer.

## 2. Upload files
- **File Manager** -> open the site's folder -> **Upload** (zip the wwwroot contents, upload, then **Extract**), or use FTP (FileZilla).
- In File Manager, enable **Settings > Show Hidden Files (dotfiles)** so `.htaccess` is visible.

## 3. Permissions
| Item | Permission |
|---|---|
| Folders (`api`, `css`, `js`, `content`) | `755` |
| Files (`index.html`, `.js`, `.css`, `.php`, `.htaccess`) | `644` |
| `data/` folder (create it manually if you like) | `750` or `755` (must be writable by PHP) |
| `data/state.json` | `640` or `644` (set automatically) |

Right-click an item in File Manager -> **Change Permissions**. If saving fails with "Data folder is not writable",
set `data/` to `755`. Never use `777`.

## 4. Lock the site to only you
1. cPanel -> **Directory Privacy** (Password Protect Directories).
2. Select the site folder -> tick **Password protect this directory**, name it, Save.
3. Create a user + strong password -> Save.
This works for the whole site including `api/state.php`, so nobody else can read or write your data.
You will be prompted once per browser session.

Already in place: `robots.txt` and `X-Robots-Tag` ask search engines not to index it, and `.htaccess` blocks
direct access to `data/`.

Optional: enable **SSL/HTTPS** (cPanel -> SSL/TLS Status -> Run AutoSSL) so the password is not sent in clear text.
Then force HTTPS in the site's Domains settings ("Force HTTPS Redirect").

## 5. Verify
1. Open the site and enter the password.
2. Add a note or answer a flashcard, wait a second.
3. In File Manager confirm `data/state.json` exists and is updated.
4. Open the site in another browser: your progress should appear there too.
5. Visit `https://your-site/data/state.json` — it must return 404/403.
6. Visiting `https://your-site/api/state.php` directly returns `{"ok":false,"error":"Bad request"}` — this is expected.

## Notes
- First load migrates any existing browser progress to the server if the server has no data yet.
- Last write wins: avoid using it from two devices at the same time.
- Back up by downloading `data/state.json`. To reset, delete it.
- Local development (`dotnet run`) has no PHP, so it uses browser storage automatically.

## Troubleshooting
- **Progress not saving**: check `data/` permissions and PHP version; open browser DevTools -> Network -> `state.php`.
- **500 error**: `.htaccess` directive unsupported; remove the `<FilesMatch>` block or contact MochaHost support.
- **Blank page**: confirm all folders (`js`, `content`, `css`) were uploaded.
