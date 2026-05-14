# π archive

> A curated resource wiki with an Arch Wiki-inspired dark interface.

π archive is a static website for organizing and browsing curated resources, tools, and guides. It features a wiki-style layout with a sticky table-of-contents sidebar, hierarchical categories with sub-categories, and individual Markdown-based guides rendered client-side.

## Features

- **Arch Wiki Theming** — Dark interface inspired by ArchWiki with Linux Libertine headings and monospace accents
- **Hierarchical Categories** — Categories with nested sub-categories (e.g. Streaming → Movie / Anime)
- **Wiki-style TOC Sidebar** — Sticky numbered navigation with section/sub-section entries
- **Markdown Guides** — Write guides as individual `.md` files, rendered with [marked.js](https://github.com/markedjs/marked)
- **Collapsible Sections** — `[hide]`/`[show]` toggles on the overview page
- **Responsive Design** — Works on desktop, tablet, and mobile
- **Data-Driven** — Add resources and guides without touching HTML or JS

## Project Structure

```
├── index.html            # Main page layout (header, TOC sidebar, content area)
├── styles.css            # Arch Wiki dark theme and Markdown body styles
├── script.js             # Data loading, TOC rendering, Markdown fetching
├── links.json            # Resource categories, sub-categories, and links
├── posts/
│   ├── index.json        # Guide metadata (title, date, tags, file path)
│   ├── wslu.md           # Guide: Windows Local Password Recovery
│   ├── ms-activation.md  # Guide: Microsoft Activation Scripts
│   └── idm.md            # Guide: IDM Activation
└── README.md             # This file
```

## Adding Content

### Add a Resource Link

Edit `links.json`. For a flat category (no sub-categories):

```json
{
  "id": "tools",
  "category": "Tools",
  "icon": "🧰",
  "description": "Useful utilities and developer tools.",
  "links": [
    {
      "name": "GitHub",
      "url": "https://github.com",
      "tags": ["dev", "git"],
      "description": "Code hosting and version control platform."
    }
  ]
}
```

For a category with sub-categories:

```json
{
  "id": "streaming",
  "category": "Streaming",
  "icon": "📺",
  "description": "Free streaming sources.",
  "subcategories": [
    {
      "id": "movies",
      "label": "Movie",
      "icon": "🎬",
      "links": [ ... ]
    },
    {
      "id": "anime",
      "label": "Anime",
      "icon": "⛩️",
      "links": [ ... ]
    }
  ]
}
```

### Add a Guide

1. Create a new `.md` file in `posts/` (e.g. `posts/my-guide.md`)
2. Add an entry to `posts/index.json`:

```json
{
  "file": "posts/my-guide.md",
  "title": "My New Guide",
  "date": "2026-05-15",
  "cat": "general",
  "catLabel": "General",
  "tags": ["tutorial"],
  "desc": "A short description shown in the guide header."
}
```

That's it — the guide will appear in the TOC sidebar automatically.

## Customization

Edit the `:root` CSS variables in `styles.css` to change colors, fonts, and layout widths.

## Browser Support

- Chrome / Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## License

Free to use and modify.
