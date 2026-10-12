# Arabic PDF Font

PDFs use the bundled `src/fonts/Amiri-Regular.ttf` font. Vite emits it as a
production asset, and the PDF renderer waits for the font to load before
capturing the document. No font download, `public/fonts/` setup, or CDN
connection is required.

If Arabic text still appears incorrectly in an already-installed app, update
the deployed app and clear its old cached version or reinstall it.
