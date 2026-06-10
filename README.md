# ResumeForge — Free Professional Resume & CV Builder

A fast, mobile-friendly, **privacy-first** resume and CV builder that runs entirely in the browser. Built as a static site so it can be hosted for free on **GitHub Pages**. Includes original blog content and the legal pages needed for **Google Search Console** indexing and **Google AdSense** review.

## ✨ Features

- **Live preview** — the resume updates instantly as you type.
- **4 professional templates** — Modern, Classic, Minimal, and Sidebar.
- **8 color themes** — switch the accent color with one click.
- **Profile photo** support (optional).
- **Rich sections** — Personal info, Summary, Experience, Education, Skills, Projects, Certifications, Languages.
- **Instant PDF download** via [html2pdf.js](https://github.com/eKoopmans/html2pdf.js) (with a browser-print fallback).
- **Auto-save** — your data is kept in the browser's local storage; nothing is uploaded to any server.
- **Sample data** and **reset** buttons for quick starts.
- **Fully responsive** for phones, tablets, and desktops.

## 📁 Project structure

```
.
├── index.html              # Landing page
├── builder.html            # The resume builder app
├── blog.html               # Blog index
├── blog/                   # Original articles (6)
├── about.html
├── contact.html
├── privacy-policy.html     # Includes Google AdSense disclosure
├── terms.html
├── disclaimer.html
├── 404.html
├── css/  (style.css, builder.css)
├── js/   (main.js, builder.js)
├── favicon.svg
├── manifest.json
├── robots.txt
├── sitemap.xml
└── .nojekyll               # Tells GitHub Pages to serve files as-is
```

## 🚀 Deploy to GitHub Pages

1. Push this repository to GitHub (a branch/PR has been created for you).
2. Go to **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **Deploy from a branch**.
4. Select the `main` branch and the `/ (root)` folder, then **Save**.
5. After a minute, your site will be live at:
   `https://<your-username>.github.io/Resume-CV-Builder/`

## 🔧 Before you go live (important)

Replace the placeholder URL `https://quicktoolkit1.github.io/Resume-CV-Builder/` with your **real** GitHub Pages URL in these files:

- `index.html`, `builder.html`, `blog.html`, and all other pages (the `<link rel="canonical">` and Open Graph tags)
- `blog/*.html` (canonical tags)
- `robots.txt` (the `Sitemap:` line)
- `sitemap.xml` (every `<loc>`)

Also update the placeholder contact email `hello@resumeforge.example` in `contact.html` and `js/main.js`.

## 🔎 Google Search Console

1. Verify ownership of your GitHub Pages site.
2. Submit `sitemap.xml` under **Sitemaps**.
3. Use **URL Inspection** to request indexing of key pages.

## 💰 Google AdSense

This project already includes the pages AdSense reviewers expect:

- Original, useful **content** (6 in-depth articles).
- **Privacy Policy** (with the required ads/cookies disclosure), **Terms**, **Disclaimer**, **About**, and **Contact** pages.
- Clear navigation and a mobile-friendly layout.

When approved, paste your AdSense code into the `.ad-slot` placeholders and add the AdSense verification script to each page's `<head>`. Apply only after your site is live with a custom or stable URL and has had some traffic.

## 🔒 Privacy

All resume data stays in your browser via `localStorage`. The site has no backend and collects no personal data itself.

## 📄 License

You are free to use and customize this project for your own resume-building site.
