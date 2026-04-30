# 0011-admin-branding-firebase-colorpicker.md

## Titolo
Persistenza branding admin con Firebase, upload immagini su Firebase Storage, color picker react-colorful

## Stato
DECIDED

## Contesto
Per la user story US-Admin (configurazione palette colori, logo, immagine agenzia) servono:
- Persistenza sicura e scalabile delle configurazioni e delle immagini
- UI moderna e reattiva per la selezione colori
- Upload immagini con anteprima e salvataggio

## Decisione
- **Persistenza:** Firestore (Firebase) per la configurazione branding, Firebase Storage per immagini/logo. Le immagini vengono caricate su Storage e la URL pubblica viene salvata in Firestore.
- **Upload immagini:** Limite 2MB, formati PNG/JPG/SVG. Preview locale immediata, poi URL definitiva dopo upload.
- **Color picker:** Si usa `react-colorful` (moderno, leggero, TypeScript ready, ben mantenuto).
- **Testing:** Playwright per E2E, React Testing Library per componenti.

## Conseguenze
- Serve configurare un progetto Firebase e fornire le chiavi di configurazione (file `.env` o direttamente nel codice, da NON committare).
- Dipendenze da installare: `firebase`, `react-colorful`.
- La UI sarà fluida, con preview istantanea e modifiche persistenti.
- Tutti i test saranno coperti.

## Azioni richieste
- Creare un progetto Firebase (https://console.firebase.google.com/), abilitare Firestore e Storage.
- Ottenere le chiavi di configurazione web (API key, projectId, ecc.).
- Inserire le chiavi in un file `.env` (esempio: `.env.example`).
- Installare le dipendenze necessarie.

---

Refs: US-Admin

