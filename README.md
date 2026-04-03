# 🎨 Energy Smart PV Cards (Frontend Lovelace)

Questo repository contiene le interfacce grafiche (Custom Cards) per l'integrazione **Energy Smart PV Climate** di Home Assistant.

⚠️ **ATTENZIONE REQUISITO FONDAMENTALE:** Queste card funzionano *solo* se hai già installato e configurato l'integrazione backend. Se non l'hai ancora fatto, installala da qui: 👉 **https://github.com/winniko/energy-smart-pv-climate**

In questo pacchetto troverai due card incluse in un unico file:
1. **Energy Smart PV Card:** Ideale per controllare e visualizzare i dettagli di una singola zona/split.
2. **Energy Smart PV Unified Card:** Una plancia di comando globale per visualizzare e gestire tutte le tue zone contemporaneamente in un'unica vista compatta.

---

## 📥 Installazione

### Metodo 1: Tramite HACS (Consigliato)

1. Apri **HACS** nel tuo Home Assistant.
2. Vai nella sezione **Interfaccia** (o "Frontend").
3. Clicca sui tre puntini in alto a destra e seleziona **Repository personalizzati**.
4. Incolla l'URL di questo repository: `[INSERISCI QUI L'URL DI QUESTO REPO GITHUB]`
5. Scegli come Categoria: **Lovelace**.
6. Clicca su **Aggiungi**, poi cerca "Energy Smart PV Cards" nella lista e clicca su **Scarica**.
7. **IMPORTANTE:** HACS dovrebbe chiederti di aggiungere la risorsa alla tua plancia. Se non lo fa in automatico, vai su *Impostazioni > Plance > Risorse* e aggiungi questo URL come *Modulo JavaScript*:
   `/hacsfiles/NOME_DEL_TUO_REPO_FRONTEND/energy-smart-pv-cards.js` (assicurati che il nome della cartella corrisponda a quello scaricato da HACS).

### Metodo 2: Installazione Manuale

1. Scarica il file `energy-smart-pv-cards.js` dalle *Release* o direttamente dal codice sorgente.
2. Copia il file all'interno della cartella `config/www/` del tuo Home Assistant (creala se non esiste).
3. Vai su **Impostazioni > Plance > Risorse** (assicurati di avere la modalità avanzata attiva nel tuo profilo utente).
4. Clicca su **Aggiungi Risorsa**, inserisci `/local/energy-smart-pv-cards.js` e seleziona **Modulo JavaScript**.

---

## 🛠 Come usare le Card

Una volta installata la risorsa, puoi aggiungere le card alla tua plancia in due modi:

### Tramite Interfaccia Visiva (UI Editor)
1. Vai nella tua plancia di Home Assistant e clicca su "Modifica plancia".
2. Clicca su "Aggiungi Scheda".
3. Scorri fino in fondo o cerca:
   * **Energy Smart PV Card** (per la scheda singola)
   * **Energy Smart PV Unified Card** (per la scheda multipla)
4. Nell'editor visivo, seleziona le tue entità **Sensore di stato zona** (es. `sensor.soggiorno_status`) create dall'integrazione backend.

### Tramite Codice (YAML)

Se preferisci usare l'editor YAML o hai una plancia in modalità codice, ecco come configurarle:

#### Card Singola (Una zona)
```yaml
type: custom:energy-smart-pv-card
entities:
  - sensor.soggiorno_status
