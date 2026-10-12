# Arabic PDF Rendering

PDF generation uses the bundled `src/fonts/Amiri-Regular.ttf` font. Vite emits
the font as a production asset, so Arabic PDF generation does not rely on an
external font CDN or a font installed on the user's device.

Before capturing the PDF, the renderer waits for the font to load. Its fixed
landscape layout wraps long table content so Arabic and mixed-language text
remain inside the page. Pages are exported as compressed JPEG images to keep
PDF files small enough to share, and only the selected PDF is generated.

To check rendering, generate both PDFs with Arabic and mixed Arabic/English
content. Verify connected Arabic glyphs, right-to-left text flow, and wrapped
table cells. If an already-installed app still shows the previous rendering,
update its cached app version or reinstall it.
