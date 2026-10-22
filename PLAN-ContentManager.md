# Plan: Deployment and In-App Content Management

## Part A: Deployment (cPanel Git)

Goal: replace `publish_site.ps1` and manual copying with cPanel Git Version Control.

`.cpanel.yml` (repo root) copies each project's `wwwroot` into `public_html`, mirroring what `publish_site.ps1` produces:

| Source | Destination |
|---|---|
| `Dashboard/wwwroot` | `public_html/` (site root) |
| `CCT.121 Study Terminal/wwwroot` | `public_html/CCT.121/` |
| `NOS.120 Study Terminal/wwwroot` | `public_html/NOS.120/` |
| `NOS.130 Study Terminal/wwwroot` | `public_html/NOS.130/` |

### Workflow
1. Commit and push to GitHub.
2. cPanel > Git Version Control > Manage > **Update from Remote**.
3. **Deploy HEAD Commit**.

### Notes
- Deploy only copies. Files deleted from the repo remain on the server until removed by hand.
- Deploy requires a clean working tree in the cPanel clone. Never edit files in `repositories/`.
- `data/state.json` is created on the server by `api/state.php` and is not in the repo, so deploys do not overwrite it.
- New projects need a new `cp` line (and a `mkdir`) in `.cpanel.yml`.
- Verify the home path (`/home/minderas`) in File Manager if the deploy fails.

### Cleanup (once deploy works)
- Remove `_publish/`, `__publish/` and `site/` from the repo if they are generated artifacts, and add them to `.gitignore`.
- Retire `publish_site.ps1`.
- Delete stale old copies in `public_html` after backing up anything needed.
- Optional later: GitHub webhook or Actions to pull automatically, so the two cPanel clicks are not needed.

## Part B: In-App Content Manager

Goal: add and edit content from inside the app, with no file edits. Built-in chapters stay read-only.

### Design
- New sidebar module **Content Manager** (group: Reference).
- User content is saved through the existing store (`CCT.store`, `api/state.php` with `localStorage` fallback) under a key such as `userContent`.
- At startup, after built-in chapters load, saved content is registered as a "My Content" chapter (`CCT.addChapter`). Existing screens, scope selector and search then show it with no changes.
- Export and import of all user content as a JSON file for backup.
- The `state.php` size limit is 2 MB (`MAX_BYTES`); raise it if content grows.

### Phases

| Phase | Scope | Notes |
|---|---|---|
| 1 | Foundation | Content Manager shell, store key, merge into a "My Content" chapter, JSON export/import |
| 2 | Glossary, flashcards, quiz | Simple forms; matches the array schemas used in `core.js` |
| 3 | Notes | Title, category, summary, body with a small formatting toolbar (bold, lists, tables, code) |
| 4 | Command lists | Table entry (command, switches, purpose); feeds a reference note, flashcards and optional terminal commands |
| 5 | Procedures and chain of custody | Step builder with optional checkpoint question; custody scenario with expected fields |
| 6 | Disk images | Guided file-tree builder (name, size, times, header bytes, flags), partitions, questions |
| 7 | Polish | Edit, delete, duplicate built-in item into My Content, validation, empty-state hints |

### Schema reference (from `core.js` and existing chapters)
- Glossary: `[term, definition, usage]`
- Card: `[question, answer]`
- Quiz: `[question, [options], correctIndex, explanation]`
- Note: `{ id, title, category: legal|ops|apps, summary, body }`
- Procedure: `{ id, title, intro, steps: [{ title, body, check?: { q, opts, a } }] }`
- Custody: `{ id, title, story, fields: [{ key, label, expect, accept?, type?, options? }] }`
- Image: `{ id, title, story, scheme, sectorSize, totalSectors, parts, tree, hiddenTree?, questions }`

### Risks
- Note bodies are HTML. Sanitize or restrict input so pasted content cannot run scripts.
- Last write wins in `state.php`; avoid using two devices at once.
- Without PHP, content lives in browser storage only. Export is the backup.
- Content IDs derive from a hash of the text, so editing a term or question resets that item's progress.

### Recommended order
1. Get Part A working.
2. Phases 1 and 2, then use them for a while.
3. Phases 3 to 7 as needed.
