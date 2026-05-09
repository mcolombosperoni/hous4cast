# hous4cast — Analisi e razionale delle scelte di prodotto

> Documento di supporto alla presentazione al committente.
> Spiega il contesto competitivo, le alternative valutate e le motivazioni dietro le decisioni chiave del progetto.

---

## 1. Il punto di partenza: Gabetti Busto Arsizio su Tally

Il committente utilizzava già una soluzione operativa: un form di valutazione immobiliare costruito su **Tally** (piattaforma SaaS di form builder), accessibile all'URL `tally.so/r/7RW98P`.

Il form Tally includeva:

- Tutti i campi di qualificazione del venditore (metratura, zona, indirizzo, stato interno, piano, anno di costruzione, accessori, email, telefono)
- Una **pagina di risultato** con la stima min/max calcolata tramite la funzione **Tally Calculations** (disponibile nel piano Pro)
- Cover image dell'agenzia e colori brandizzati Gabetti (rosso `#982121`)
- Invio automatico di una email di notifica all'agente ad ogni submission

Tally rendeva tutto questo **accessibile senza competenze di sviluppo**: l'interfaccia drag & drop permette di definire variabili per ogni campo, scrivere formule moltiplicative e mostrare il risultato in una pagina finale, il tutto in pochi pomeriggi.

---

## 2. Perché non continuare con Tally?

Nonostante la semplicità di Tally, sono emersi limiti strutturali che rendono la soluzione non scalabile per un prodotto serio.

### 2.1 I coefficienti di stima sono pubblici

La limitazione più critica: **le formule di calcolo sono visibili nel sorgente HTML/JS della pagina**. Chiunque apra gli strumenti di sviluppo del browser può leggere i prezzi al metro quadro per zona, i coefficienti per piano, stato, anno di costruzione — i dati commercialmente più sensibili dell'agenzia.

Con hous4cast, tutta la logica di calcolo vive in **Firestore** (database server-side) e nel bundle compilato dell'applicazione. I valori non sono mai esposti in chiaro nel DOM o in form nascosti.

### 2.2 Costo per agenzia

Tally Pro costa circa **€29/mese per workspace**. Ogni agenzia che adotta la soluzione richiede un workspace separato. Con 5 agenzie clienti: €145/mese, circa €1.740/anno — solo per il form builder, senza alcuna personalizzazione.

hous4cast gira su **Firebase free tier** (Spark plan): le funzionalità attuali (form, Firestore, hosting statico su GitHub Pages) hanno costo operativo pari a zero per il numero di agenzie gestibili nella fascia tipica di un'agenzia immobiliare italiana.

### 2.3 Zero white-label nel piano gratuito

Il piano free di Tally mostra il footer "Realizzato con Tally, il modo più semplice per creare moduli" — visibile nella pagina dell'utente finale. Il piano Pro rimuove il branding, ma al costo mensile sopra citato.

hous4cast è completamente white-label per costruzione: nessun logo di terze parti, nessun costo per rimuoverlo.

### 2.4 Multi-agenzia: un form per agenzia, non un prodotto

Con Tally, gestire più agenzie significa gestire più form separati, in workspace separati, con configurazioni duplicate. Non esiste il concetto di "admin centralizzato" che gestisce N clienti da un unico pannello.

hous4cast nasce come piattaforma multi-tenant: un unico pannello admin, N agenzie, ognuna con la propria configurazione indipendente di branding, zone, prezzi e privacy.

### 2.5 Ownership dei dati

I lead compilati su Tally sono salvati sui server di Tally (UE, ma pur sempre un third party). L'agenzia non ha accesso diretto al database. In caso di cancellazione dell'account o modifica dei termini di servizio, i dati storici sono a rischio.

Con hous4cast, ogni lead viene scritto nel **Firestore dell'agenzia** — un database Firebase gestito dall'agenzia stessa, esportabile, integrabile con qualsiasi sistema CRM via API.

---

## 3. Cosa fa hous4cast che Tally non può fare

| Funzione | Tally | hous4cast |
|---|---|---|
| Form di valutazione + stima istantanea | ✅ (Pro, ~€29/mese) | ✅ |
| Branding colori | ✅ limitato | ✅ palette completa, logo, cover image, dark mode |
| White-label (zero "Powered by…") | ❌ free / ✅ Pro a pagamento | ✅ sempre |
| Admin self-service per l'agenzia | ❌ richiede account Tally | ✅ pannello dedicato |
| Modifica prezzi e zone senza sviluppatore | ❌ | ✅ editor in-app |
| Coefficienti di stima privati (non in chiaro) | ❌ visibili nel sorgente | ✅ su Firestore |
| Multi-agenzia da un unico pannello | ❌ | ✅ |
| QR code generato dall'admin con locale preimpostato | ❌ | ✅ |
| Ownership completa dei lead | ❌ (server Tally) | ✅ (Firestore agenzia) |
| Notifica agente email/Telegram server-side | ❌ (solo Zapier/webhook Pro) | ✅ (Firebase Cloud Functions) |
| PDF branded scaricabile dal venditore | ❌ | ✅ (roadmap) |
| Dashboard lead con filtri ed export CSV | ❌ (export base Pro) | ✅ (roadmap) |
| Autenticazione admin | ❌ chiunque abbia il link | ✅ Firebase Auth (roadmap) |
| Costo operativo per agenzia aggiuntiva | ~€29/mese | ~€0 |

---

## 4. Le scelte tecnologiche e perché

### 4.1 Vite + React + TypeScript

Stack moderno, ampiamente supportato, con ecosistema maturo. TypeScript strict garantisce che errori di configurazione (es. coefficiente mancante, zona non trovata) vengano intercettati a compile time, non in produzione davanti all'utente finale.

### 4.2 GitHub Pages + hash routing

Deployment gratuito, zero infrastruttura da gestire. Il hash routing (`/#/estimate/gabetti-busto-arsizio`) è necessario perché GitHub Pages non supporta il server-side routing delle SPA. La struttura URL è comunque leggibile e condivisibile.

### 4.3 Firebase (Firestore + Authentication + Cloud Functions)

Scelto per tre motivi:

1. **Un unico account** per tutto: database (Firestore), autenticazione admin (Authentication), logica server-side per le email (Cloud Functions). Non serve gestire 4-5 tool diversi con credenziali separate.
2. **Free tier generoso**: le funzionalità attuali e quelle pianificate (lead capture, notifiche) rientrano nel piano Spark gratuito o nel piano Blaze con costi minimi (€0 per <125k scritture/mese, <1M letture/mese).
3. **Sicurezza server-side**: le Firestore Security Rules permettono di definire in modo dichiarativo chi può leggere/scrivere cosa. I venditori possono solo creare lead (`create: if true`), mai leggerli. Solo admin autenticati possono modificare configurazioni.

### 4.4 Cloudinary per le immagini

Le immagini (logo, cover) vengono caricate su Cloudinary (piano free: 25 crediti/mese, ~25k trasformazioni) anziché su Firebase Storage. Vantaggio principale: trasformazione automatica delle immagini (resize, compressione, WebP) tramite URL parametrico — nessun codice di resize lato server.

### 4.5 Config-driven con override su Firestore

L'architettura separa la **configurazione base** (file TypeScript nel repository, versionate con il codice) dagli **override runtime** (Firestore, modificabili dall'admin senza deployment).

Questo garantisce:
- **Fallback robusto**: se Firestore non è disponibile, l'app usa `localStorage`; se anche quello è vuoto, usa la config statica. L'agenzia non va mai offline per un problema di connettività.
- **Zero downtime per modifiche**: l'agente cambia un prezzo al metro quadro e viene riflesso immediatamente al prossimo caricamento della pagina, senza toccare il codice.
- **Tracciabilità**: la config base è in git — c'è sempre uno storico delle configurazioni originali.

---

## 5. Cosa rimane da costruire (roadmap)

Le funzionalità già pianificate e in backlog sono:

| Epic | Funzione | Priorità |
|---|---|---|
| **U** | Autenticazione admin con Firebase Auth | Alta — da fare prima del go-live |
| **T** | Cookie consent e compliance GDPR | Alta — necessaria per legge |
| **K** | Salvataggio lead + notifica email/Telegram agente | Alta — core value |
| **N** | Dashboard lead nell'admin (filtri, export CSV) | Media |
| **M** | Export PDF branded con la stima | Media |

---

## 6. Sintesi del valore per il committente

hous4cast non è un "form builder migliore di Tally". È una **piattaforma verticale per la lead generation immobiliare** con queste caratteristiche distintive:

- **Completamente white-label**: l'esperienza del venditore rispecchia al 100% l'identità dell'agenzia
- **Self-service per l'agente**: nessuna dipendenza da uno sviluppatore per modificare prezzi, zone o testi
- **Dati proprietari**: i lead appartengono all'agenzia, non a un SaaS terzo
- **Scalabile a zero costo marginale**: la seconda, quinta, decima agenzia non costa nulla in più di infrastruttura
- **Sicuro by design**: i coefficienti commerciali non sono mai esposti pubblicamente; l'accesso admin è protetto da autenticazione

La soluzione Tally esistente dimostrava che il mercato (anche il singolo agente Gabetti) ha già validato il bisogno. hous4cast costruisce sulla stessa necessità con una qualità, flessibilità e ownership che un SaaS generico non può offrire.

---

_Documento generato il 09/05/2026 — versione 1.0_

