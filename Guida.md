# ⚡ Energy Smart PV - Guida all'Uso

Benvenuto nella guida ufficiale di **Energy Smart PV**! Questo sistema intelligente ottimizza l'uso del tuo impianto fotovoltaico, incanalando l'energia in esubero verso i tuoi climatizzatori per riscaldare, raffrescare o deumidificare la casa a costo zero.

---

## 📊 1. Lettura della Card Principale

La schermata principale ti offre una panoramica istantanea di cosa sta facendo l'impianto:

*   **In Attesa (Monitoraggio):** L'impianto produce, ma non c'è abbastanza esubero per far partire i clima, oppure la casa è già in temperatura.
*   **In Uso:** C'è esubero solare! Il sistema ha acceso i climatizzatori per immagazzinare energia termica (caldo o freddo) nella casa.
*   **Ricarica Batteria:** L'esubero viene dirottato prioritariamente per caricare la batteria di casa (se sotto la soglia minima).
*   **Eco Mode:** Il sistema sta operando in modalità risparmio per ottimizzare i consumi.

---

## ⚙️ 2. Impostazioni di Base (Pannello 🎛️)

Cliccando sull'icona delle impostazioni, accedi al cuore del sistema:

*   **Soglia W:** Indica quanti Watt di *esubero netto* verso la rete devono esserci prima che il sistema decida di accendere i climatizzatori. (Es. `1000 W` = il clima parte solo se stai regalando più di 1000W alla rete).
*   **Batteria min. avvio (%):** Il sistema non accenderà MAI i climatizzatori se la tua batteria di accumulo è sotto questa percentuale. Serve a garantirti l'energia per la notte.
*   **Temp. Estate / Inverno:** Le temperature target che desideri raggiungere in casa. Il sistema calcolerà automaticamente gli offset per "sovra-riscaldare" o "sovra-raffrescare" la casa finché c'è sole gratis.
*   **Soglia Stacco %:** Se abiliti l'uso della batteria a fine esubero, il clima continuerà a funzionare pescando dalla batteria fino a questo limite, per poi spegnersi.

---

## 💧 3. Deumidificazione Intelligente

*   **Umidità (%):** Imposta la soglia massima di umidità desiderata.
*   **Deumidificazione Condivisa:** Se abilitata, sfrutta algoritmi avanzati confrontando l'umidità interna con quella esterna per attivare la funzione "Dry" del condizionatore in modo più efficiente.
*   **Deumidificazione in Inverno:** Permette di usare la deumidificazione anche quando l'impianto è impostato in modalità riscaldamento (utile per giornate uggiose ma non freddissime).

---

## 🕒 4. Programmatore Orario (AM / PM)

Vuoi che il sistema operi solo in determinati orari? Abilita il Programmatore Orario!
L'interfaccia si salva **automaticamente** non appena finisci di digitare o chiudi la tendina.

*   **Modalità Feriali/Festivi:** Per dividere la settimana in base alla tua presenza in casa.
*   **Fasce AM (Mattina) e PM (Pomeriggio/Sera):** Puoi impostare due slot indipendenti per giornata.
*   **Il trucco dello "Spegnimento Aperto":**
    *   Inserisci l'orario **Da:** (es. `09:30`).
    *   Lascia vuoto l'orario **A:** (`--:--`).
    *   *Risultato:* Il sistema saprà che può iniziare a lavorare dalle 09:30 in poi, e deciderà lui autonomamente quando spegnersi (quando tramonta il sole o si scarica la batteria).

---

*Progetto sviluppato e ottimizzato per Home Assistant.*