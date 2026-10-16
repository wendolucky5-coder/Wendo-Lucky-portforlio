# Wendo Lucky — Portfolio

A creative, interactive portfolio for a Game & Animation Technology student.

## Run it in VS Code
1. Unzip this folder and open it in VS Code (`File → Open Folder`).
2. Install the **Live Server** extension (Ritwick Dey), right-click `index.html` → **Open with Live Server**.
   (Double-clicking `index.html` also works. You need internet for the fonts and Three.js.)

## What's inside
- `index.html` — all content (about, skills, project cards, contact)
- `css/style.css` — theme colors are the variables at the top (`--a`, `--b`, `--c`)
- `js/main.js` — sound effects (with mute toggle), custom cursor, filters, 3D hero, 3D viewer

## Make it yours
1. **Email & socials** — search `youremail@example.com` and the `#` links in the Contact section.
2. **Projects** — copy a `<article class="card">` block in `index.html`. Set `data-cat` to `game`, `animation`, `design` or `video`, and list the exact tools in the tags.
3. **Real thumbnails** — in a card, replace the `<div class="cube">…</div>` with `<img src="images/my-shot.jpg" alt="…" style="width:100%;height:100%;object-fit:cover">` (create an `images/` folder).
4. **Videos** — paste a YouTube/Vimeo `<iframe>` into a card, or link to it.
5. **Your own 3D model** — easiest: replace the viewer `<canvas>` with a Sketchfab embed `<iframe>` (Sketchfab → Share → Embed). Or export `.glb` from Blender and load it with Three.js `GLTFLoader` in the marked block in `js/main.js`.
6. **Sound** — sounds are synthesized in code and start OFF. Visitors turn them on with the button in the nav.

## Publish for free
Push the folder to GitHub and enable **GitHub Pages**, or drag it into **Netlify Drop** / **Vercel**. Also post your work on **ArtStation** and your playable games on **itch.io**, and link them in the Contact section.
