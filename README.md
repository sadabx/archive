# π archive

Curated resource wiki - ( Arch Wiki-inspired )

## Features

- **Usefull links**
- **Usefull guides**

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
  "id": "",
  "category": "",
  "icon": "",
  "description": "",
  "links": [
    { "name": "", "url": "", "tags": [""], "description": "" },
    { "name": "", "url": "", "tags": [""], "description": "" }
  ]
}
```

Category with sub-categories:

```json
{
  "id": "",
  "category": "",
  "icon": "",
  "description": "",
  "subcategories": [
    {
      "id": "",
      "label": "",
      "icon": "",
      "links": [
        { "name": "", "url": "", "tags": [""], "description": "" },
        { "name": "", "url": "", "tags": [""], "description": "" }
      ]
    },
    {
      "id": "",
      "label": "",
      "icon": "",
      "links": [
        { "name": "", "url": "", "tags": [""], "description": "" },
        { "name": "", "url": "", "tags": [""], "description": "" }
      ]
    }
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
