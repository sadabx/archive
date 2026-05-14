# π archive

A curated resource wiki with an Arch Wiki-inspired dark interface.

## Features

- **Dark Wiki UI** — Linux Libertine headings, monospace accents, sticky TOC sidebar
- **Live Search** — Instant filtering across all resources; `Ctrl K` to focus
- **Hierarchical Categories** — Nested sub-categories with collapsible sections
- **Markdown Guides** — Individual `.md` files rendered client-side via [marked.js](https://github.com/markedjs/marked)
- **Data-Driven** — Add resources and guides without modifying HTML or JS

## Structure

```
├── index.html          # Shell: header, sidebar, content area
├── styles.css          # Theme and component styles
├── script.js           # Data loading, routing, search, Markdown rendering
├── links.json          # Resource categories and links
└── posts/
    ├── index.json      # Guide manifest (title, date, tags, file path)
    └── *.md            # Individual guide files
```

## Adding a Resource

Edit `links.json`. Flat category:

```json
{
  "id": "tools",
  "category": "Tools",
  "icon": "🧰",
  "description": "Useful utilities.",
  "links": [
    { "name": "GitHub", "url": "https://github.com", "tags": ["dev"], "description": "Code hosting." }
  ]
}
```

Category with sub-categories:

```json
{
  "id": "streaming",
  "category": "Streaming",
  "icon": "📺",
  "subcategories": [
    { "id": "movies", "label": "Movies & TV", "icon": "🎬", "links": [ ... ] },
    { "id": "anime",  "label": "Anime",        "icon": "⛩️", "links": [ ... ] }
  ]
}
```

## Adding a Guide

1. Create `posts/<slug>.md`
2. Add an entry to `posts/index.json`:

```json
{
  "file": "posts/my-guide.md",
  "title": "My Guide",
  "date": "2026-05-15",
  "cat": "general",
  "catLabel": "General",
  "tags": ["tutorial"],
  "desc": "Short description shown in the guide header."
}
```

## Customization

Edit `:root` CSS variables in `styles.css` to adjust colors, fonts, and layout widths.

## License

[MIT](LICENSE.md) © [trionine](https://trionine.xyz)
