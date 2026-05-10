# AI Study Assistant

Një aplikacion web që përdor AI për të gjeneruar **summary**, **quiz** dhe **escape room game** nga çdo tekst që ngjit përdoruesi.

## Linku Live

(Linku do të shtohet pas deploy-it në Vercel)

## Teknologjitë

- **Frontend:** React + Vite
- **AI API:** Groq (llama-3.1-8b-instant)
- **Styling:** CSS moderne (gradient, responsive)

## Funksionalitetet

- ✅ Ngjit tekst dhe merr një përmbledhje të shkurtër
- ✅ Gjenero 5 pyetje me zgjedhje (multiple choice quiz)
- ✅ Luaj "Escape Room" me 3 enigma bazuar në tekst
- ✅ Loading state dhe error handling

## Si të përdoret

1. Ngjisni tekstin tuaj në fushën e madhe
2. Klikoni butonin "✨ Gjenero"
3. Shfletoni rezultatet përmes 3 skedave: Summary, Quiz, Escape Room

## Instalimi lokal

```bash
git clone https://github.com/EriiGerii/projekti-i-4-ui.git
cd projekti-i-4-ui
npm install
npm run dev