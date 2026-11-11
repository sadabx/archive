# π archive

Curated resource directory & wiki — Arch Wiki inspired.

Live site: [archive.trionine.com](https://archive.trionine.com)

---

## Features

- **Blazing Fast**: Pure static HTML, CSS, and Vanilla JS with instant live search.
- **Clean Structure**: Entire web root self-contained in `src/`.
- **Categorized & Tagged**: Subcategories, tags, mirrors, and direct links.
- **Web-First Contributions**: Submit links directly via GitHub Issue Forms.
- **Broken Link Reporting**: 1-click reporting flag (`⚑`) on every link row.
- **Automated Actions**: PR generation for both link submissions and link removals.
- **Admin Dashboard**: Visual CMS at `/admin` powered by Decap CMS.

---

## Repository Structure

```
├── .gitattributes
├── LICENSE.md
├── README.md
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── config.yml
│   │   ├── suggest-resource.yml     # Form for submitting new resources
│   │   └── report-broken-link.yml   # Form for reporting dead/obsolete links
│   ├── scripts/
│   │   ├── process-resource.js      # Adds link to data/links.json
│   │   └── remove-resource.js       # Removes link from data/links.json
│   └── workflows/
│       ├── add-resource.yml         # Auto PR on new suggestions
│       ├── remove-resource.yml      # Auto PR on label "remove-resource"
│       └── deploy.yml               # Auto-deploys ./src to GitHub Pages
└── src/                             # Complete website root
    ├── CNAME                        # Custom domain configuration
    ├── index.html                   # Main page layout & navigation
    ├── admin/                       # Decap CMS web admin
    │   ├── config.yml
    │   └── index.html
    ├── css/styles.css               # Styling, themes & responsive layouts
    ├── js/script.js                 # Router, search & dynamic link table
    └── data/links.json              # Curated resource database
```

---

## Contributing via Web (No Git Required!)

### 1. Suggesting a Resource (Community)
Anyone can suggest tools and links without touching code:
1. Click **"+ Suggest"** on the website, or open the [Resource Suggestion Form](https://github.com/sadabx/archive/issues/new?template=suggest-resource.yml).
2. Fill in the title, URL, category, and description.
3. Submit the issue! Our automated GitHub Action will parse the suggestion, verify it, and generate a Pull Request automatically.

### 2. Reporting Broken or Hijacked Links
1. Hover over any resource in the table and click the flag icon (`⚑`).
2. It automatically opens a pre-filled [Broken Link Report](https://github.com/sadabx/archive/issues/new?template=report-broken-link.yml) with the resource name and URL.
3. Maintainers can approve removal simply by adding the label `remove-resource` to the issue. The automated bot will remove it and open a PR.

### 3. Visual Content Management (Admin)
Visit `https://archive.trionine.com/admin` to access the visual Decap CMS dashboard to add, edit, or re-order categories and links directly in your browser.

### 4. Quick Web Edit (`github.dev`)
Press `.` (period) anywhere on the [sadabx/archive](https://github.com/sadabx/archive) GitHub repository to launch VS Code directly in your browser, edit `src/data/links.json`, and commit changes.

---

## Deployment (GitHub Pages)

Under **Settings → Pages** in your GitHub repository:
- Select **Source: GitHub Actions**.
- Pushing to `main` will automatically build and deploy the `./src` folder via `.github/workflows/deploy.yml`.

---

## License

[MIT](LICENSE.md) © [trionine](https://trionine.com)
