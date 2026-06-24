# AGENTS.md

## Scopo del progetto
Aura Syncro è un gestionale per ristoranti.  
Ogni modifica deve privilegiare: stabilità, leggibilità, continuità architetturale, esperienza premium e assenza di regressioni.

## Regole obbligatorie
1. Non introdurre nuove librerie, framework, store globali o pattern architetturali senza approvazione esplicita.
2. Prima di scrivere codice, analizza e riusa i pattern già presenti nel progetto.
3. Non rifattorizzare aree ampie del codice se il task richiede una modifica localizzata.
4. Ogni modifica deve essere la più piccola possibile per risolvere il problema richiesto.
5. Non toccare contemporaneamente frontend, backend, database e infrastruttura nello stesso task, salvo richiesta esplicita.
6. Non modificare schema Prisma, migration SQL, routing, auth, ordini, cucina, pagamenti o websocket senza spiegare prima impatto e rischio.
7. Non rompere funzionalità esistenti per aggiungere nuove feature.
8. Ogni implementazione deve rispettare naming, struttura file, convenzioni React, convenzioni backend e stile già presenti.
9. Se esistono Context, hook, services, utils o componenti già adatti, vanno riusati prima di creare nuove astrazioni.
10. Se una dipendenza nuova sembra necessaria, fermati e spiega perché le soluzioni già presenti non bastano.

## Procedura prima di toccare il codice
Prima di implementare qualsiasi modifica, devi sempre:
1. Riassumere in 5-10 punti come è organizzata l’area coinvolta.
2. Elencare i file esistenti rilevanti.
3. Dire quali pattern esistenti riuserai.
4. Segnalare i rischi di regressione.
5. Proporre il piano minimo di modifica.
6. Aspettare conferma se il task coinvolge parti critiche.

## Parti critiche del progetto
Considera critiche e da toccare con massima cautela:
- gestione ordini
- schermata cucina
- carrello e OrderModal
- autenticazione e permessi
- websocket / socket.io
- sincronizzazione realtime
- pagamenti
- persistenza offline
- schema Prisma e migration SQL
- API backend in produzione

Per queste aree:
- fai modifiche incrementali;
- non introdurre cambi architetturali;
- non cambiare più di una responsabilità per volta;
- spiega sempre prima cosa cambierai.

## Regole per il frontend
1. Riusa componenti, hook, context e servizi esistenti.
2. Non introdurre store globali nuovi se il progetto usa già Context, React Query o pattern locali.
3. Non spostare logica critica in nuovi layer se non strettamente necessario.
4. Mantieni UI leggibile, coerente, premium, senza regressioni visive.
5. Non alterare il routing esistente senza motivo esplicito.
6. Non modificare layout globali per fix locali se non necessario.
7. Ogni stato loading, error ed empty state deve rimanere chiaro e leggibile.

## Regole per il backend
1. Non cambiare contratti API esistenti senza dichiararlo esplicitamente.
2. Non introdurre middleware, idempotency layer, servizi o astrazioni nuove senza giustificazione chiara.
3. Mantieni la logica semplice, leggibile e coerente con gli endpoint esistenti.
4. Non cambiare query Prisma o schema dati se il task non lo richiede in modo diretto.
5. Ogni modifica a ordini, cucina, realtime o pagamenti va considerata ad alto rischio.

## Regole per database e migration
1. Non creare migration automaticamente se non richiesto.
2. Prima di toccare `schema.prisma`, spiega perché serve davvero.
3. Se proponi una migration, descrivi:
   - motivo
   - impatto
   - rollback
   - rischio dati
4. Nessuna modifica DB deve essere fatta “insieme ad altro” se non è indispensabile.

## Regole di qualità del codice
1. Scrivi codice semplice, leggibile e coerente con lo stile esistente.
2. Evita over-engineering.
3. Evita astrazioni premature.
4. Evita duplicazioni inutili, ma non fare grossi refactor solo per pulizia.
5. Mantieni funzioni e componenti focalizzati su una responsabilità chiara.
6. Preferisci chiarezza a furbizia.
7. Non lasciare codice morto, import inutili o file mezzi introdotti.

## Regole di sicurezza operativa
1. Prima di proporre modifiche, controlla se esiste già una soluzione nel progetto.
2. Se qualcosa non è chiaro, fai domande invece di inventare.
3. Se trovi un problema fuori scope, segnalalo ma non correggerlo nello stesso task senza approvazione.
4. Non eseguire cambi distruttivi o diffusi senza consenso.
5. Se una modifica rischia di rompere il flusso ordini o cucina, fermati e chiedi conferma.

## Formato obbligatorio della risposta prima delle modifiche
Prima di scrivere codice, rispondi sempre con questo schema:

### Analisi
- area coinvolta
- file coinvolti
- pattern esistenti rilevati
- rischio regressione

### Piano
- modifiche minime previste
- cosa non toccherò
- eventuali dubbi

### Impatto
- frontend / backend / db / realtime
- livello di rischio: basso / medio / alto

## Formato obbligatorio della risposta dopo le modifiche
Dopo aver modificato il codice, rispondi sempre con:

### Modifiche eseguite
- file toccati
- cosa è cambiato
- perché

### Convenzioni rispettate
- pattern esistenti riusati
- librerie nuove introdotte: nessuna / elenco motivato

### Verifiche da fare
- test manuali consigliati
- aree da controllare
- possibili edge case

## Divieti espliciti
Non devi:
- introdurre librerie senza approvazione
- creare nuovi store globali senza motivo
- rifattorizzare tutto per risolvere un bug piccolo
- toccare schema Prisma o migration senza consenso
- cambiare frontend, backend e DB nello stesso passaggio salvo richiesta esplicita
- rompere schermata cucina, ordini o bootstrap app
- sostituire pattern esistenti con soluzioni “più comode” per te

## Obiettivo finale
Ogni cambiamento deve rendere Aura Syncro più stabile, vendibile, leggibile e premium, non più complesso.