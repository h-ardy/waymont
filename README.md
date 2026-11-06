# Waymont Solutions website

Plain HTML, CSS and JavaScript. No build step, no framework. Open `index.html` in a browser to see it, or use the Live Server extension in VS Code.

```
index.html               all pages (home, our work, prices, what we believe, our team, get a price)
assets/css/site.css      every style, colors at the top under :root
assets/js/site.js        all animation and interaction, SETTINGS block at the top
assets/js/lenis.min.js   smooth scrolling library (MIT license, don't edit)
assets/fonts/            Archivo and Schibsted Grotesk (SIL Open Font License)
```

## Put in your own info

Use VS Code's search (Ctrl+Shift+F / Cmd+Shift+F) for each of these:

| Search for | What it is | Where |
|---|---|---|
| `wanghardy10@gmail.com` | Contact email, shows twice | index.html |
| `Southern Ohio` | Your area, shows in the hero, contact page, footer and page description | index.html |
| `dillingerdetailing.com`, `Puzzle-Circle` | The two sites on the Our work page | index.html |
| `Hardy Wang`, `Ethan` | Names, roles and bios on the Our Team page | index.html |
| `<h2>Starter</h2>` | Start of the three plans (Starter, Professional, Premium) | index.html |
| `Monthly help` | Monthly plan wording | index.html |
| `© 2026` | Footer year | index.html |
| `SETTINGS` | Cycling words, estimator prices, form address | assets/js/site.js |
| `s-bakery`, `s-detail`, `s-club`, `s-idea` | The four sample phone sites: wording in index.html, styles in site.css | index.html, site.css |
| `--sand`, `--pine` | Colors | assets/css/site.css (`:root`) |

If you change a price, change it in both places: the text in `index.html` (hero, Prices page, estimator, contact form choices) and `SITE.prices` in `site.js`.

## Turn on the contact form (Formspree)

GitHub Pages can't receive form messages by itself. Formspree's free plan forwards them to your email.

1. Go to formspree.io and sign up with the email you want messages sent to.
2. Confirm your email from the message Formspree sends you.
3. Click "+ New form". Name it "Waymont website". Formspree shows an endpoint like `https://formspree.io/f/abcdwxyz`. Copy it.
4. In `assets/js/site.js`, paste it into the SETTINGS block: `formEndpoint: 'https://formspree.io/f/abcdwxyz'`
5. Commit and push. After GitHub Pages updates, send yourself a test message from the live site. The first message may ask you to confirm in Formspree.
6. Optional: in Formspree's form settings, add your github.io address (and your own domain later) under allowed domains, so nobody else can post to your form.

Once the endpoint is filled in, the "not connected yet" note on the thank-you screen goes away on its own.

## Publish on GitHub Pages

1. Create a new repository on github.com (for example `waymont-site`).
2. In VS Code: open this folder, then Source Control, Initialize Repository, commit, and Publish Branch to that repository.
3. On GitHub: Settings, Pages, Source: "Deploy from a branch", Branch: `main`, folder `/ (root)`. Save.
4. After a minute the site is live at `https://YOUR-USERNAME.github.io/waymont-site/`.
5. For your own domain, add it under Settings, Pages, Custom domain, and follow GitHub's DNS steps.

## Page links

The site is one file with hash links: `#work`, `#prices`, `#philosophy`, `#team`, `#contact`. Those work on GitHub Pages with no extra setup.
