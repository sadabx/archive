/* ── π archive – script.js ── */

const state = {
    links: [],
    posts: [],          // metadata from posts/index.json
    view: 'all',        // 'all' | 'category' | 'subcategory' | 'guide'
    activeId: null,
    activeSubId: null,
};

/* ── marked.js config ── */
function configureMd() {
    if (typeof marked === 'undefined') return;
    marked.setOptions({
        gfm: true,
        breaks: true,
    });
}

/* ── Bootstrap ── */
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('year').textContent = new Date().getFullYear();
    configureMd();

    // Nav links
    document.getElementById('nav-home').addEventListener('click', e => {
        e.preventDefault();
        setView('all', null, null);
        setActiveNav('nav-home');
        closeNav();
    });
    document.getElementById('nav-resources').addEventListener('click', e => {
        e.preventDefault();
        setView('all', null, null);
        setActiveNav('nav-resources');
        closeNav();
    });
    document.getElementById('nav-guides').addEventListener('click', e => {
        e.preventDefault();
        if (state.posts.length) { setView('guide', 'guide-0', null); setActiveNav('nav-guides'); }
        closeNav();
    });

    // Footer quick links
    document.getElementById('footer-home').addEventListener('click', e => {
        e.preventDefault(); setView('all', null, null); setActiveNav('nav-home'); window.scrollTo({top:0,behavior:'smooth'});
    });
    document.getElementById('footer-resources').addEventListener('click', e => {
        e.preventDefault(); setView('all', null, null); setActiveNav('nav-resources'); window.scrollTo({top:0,behavior:'smooth'});
    });
    document.getElementById('footer-guides').addEventListener('click', e => {
        e.preventDefault();
        if (state.posts.length) { setView('guide', 'guide-0', null); setActiveNav('nav-guides'); }
        window.scrollTo({top:0,behavior:'smooth'});
    });

    // Hamburger toggle
    const navToggle = document.getElementById('nav-toggle');
    const mainNav = document.getElementById('main-nav');
    navToggle.addEventListener('click', () => {
        const open = mainNav.classList.toggle('nav-open');
        navToggle.setAttribute('aria-expanded', open);
    });

    // Mobile search: tap the icon to expand the search box
    const headerSearch = document.querySelector('.header-search');
    const searchInput = document.getElementById('site-search');
    headerSearch.addEventListener('click', e => {
        if (window.innerWidth <= 640 && !headerSearch.classList.contains('search-open')) {
            e.preventDefault();
            headerSearch.classList.add('search-open');
            searchInput.focus();
        }
    });

    // Close expanded mobile search on blur
    searchInput.addEventListener('blur', () => {
        if (window.innerWidth <= 640 && !searchInput.value) {
            headerSearch.classList.remove('search-open');
        }
    });

    // TOC collapse toggle (tablet/mobile)
    const tocToggle = document.getElementById('toc-toggle');
    const tocNav = document.getElementById('toc-nav');
    tocToggle.addEventListener('click', () => {
        if (window.innerWidth > 900) return; // desktop: always open
        const collapsed = tocNav.classList.toggle('toc-collapsed');
        tocToggle.setAttribute('aria-expanded', !collapsed);
    });

    // '/' key to focus search (doesn't hijack browser shortcuts)
    document.addEventListener('keydown', e => {
        const tag = document.activeElement.tagName;
        if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA') {
            e.preventDefault();
            if (window.innerWidth <= 640) {
                headerSearch.classList.add('search-open');
            }
            searchInput.focus();
        }
    });

    // Live search
    let searchTimer;
    searchInput.addEventListener('input', e => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => applySearch(e.target.value.trim()), 120);
    });

    // Clear search on Escape
    searchInput.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            e.target.value = '';
            applySearch('');
            e.target.blur();
            if (window.innerWidth <= 640) headerSearch.classList.remove('search-open');
        }
    });

    Promise.all([
        fetch('links.json').then(r => r.json()),
        fetch('posts/index.json').then(r => r.json()),
    ])
        .then(([links, posts]) => {
            state.links = links;
            state.posts = posts;
            renderTOC();
            renderMain();
            setActiveNav('nav-home');
        })
        .catch(err => {
            document.getElementById('main-content').innerHTML =
                `<p class="empty-state">Failed to load data: ${err.message}</p>`;
        });
});

/* ── Close mobile nav helper ── */
function closeNav() {
    const nav = document.getElementById('main-nav');
    const toggle = document.getElementById('nav-toggle');
    nav.classList.remove('nav-open');
    toggle.setAttribute('aria-expanded', 'false');
}

/* ── Active nav highlight ── */
function setActiveNav(id) {
    document.querySelectorAll('.main-nav a').forEach(a => a.classList.remove('nav-active'));
    const el = document.getElementById(id);
    if (el) el.classList.add('nav-active');
}

/* ── Search ── */
function applySearch(query) {
    if (!query) {
        renderMain(); // restore the current view
        return;
    }

    const q = query.toLowerCase();
    const results = [];

    state.links.forEach(cat => {
        const links = cat.links
            ? cat.links
            : (cat.subcategories || []).flatMap(s => s.links);
        links.forEach(link => {
            const haystack = [
                link.name,
                link.description || '',
                ...(link.tags || []),
            ].join(' ').toLowerCase();
            if (haystack.includes(q)) {
                results.push({ link, cat });
            }
        });
    });

    renderSearchResults(query, results);
}

function renderSearchResults(query, results) {
    const main = document.getElementById('main-content');

    if (!results.length) {
        main.innerHTML = `
        <div class="wiki-page-header">
            <h2 class="wiki-page-title">Search results</h2>
            <p class="wiki-page-subtitle">Query: <em>${escapeHtml(query)}</em></p>
        </div>
        <div class="search-empty">
            No resources matched <strong>${escapeHtml(query)}</strong>.
        </div>`;
        return;
    }

    const rows = results.map(({ link, cat }) => {
        const favicon = getFavicon(link.url);
        const fallback = getFallback(link.name, link.url);
        const tags = (link.tags || []).map(t => `<span class="tag-pill">${t}</span>`).join('');
        return `<tr>
            <td class="col-icon">
                <img class="site-favicon" src="${favicon}" alt="" loading="lazy"
                    onerror="this.style.display='none';this.nextElementSibling.style.display='inline-flex';">
                <span class="site-favicon-fallback" style="display:none">${fallback}</span>
            </td>
            <td class="col-name">
                <a href="${link.url}" target="_blank" rel="noopener noreferrer">${link.name}</a>
                <div style="font-size:0.72rem;color:var(--text-dim);margin-top:2px;">${cat.icon} ${cat.category}</div>
            </td>
            <td class="col-desc">${link.description || ''} ${tags}</td>
        </tr>`;
    }).join('');

    main.innerHTML = `
    <div class="wiki-page-header">
        <h2 class="wiki-page-title">Search results</h2>
        <p class="wiki-page-subtitle">${results.length} resource${results.length !== 1 ? 's' : ''} matched “${escapeHtml(query)}”</p>
    </div>
    <table class="link-table">
        <thead><tr>
            <th class="col-icon"></th>
            <th class="col-name">Site</th>
            <th class="col-desc">Description</th>
        </tr></thead>
        <tbody>${rows}</tbody>
    </table>`;
}

/* ── View state ── */
function setView(view, activeId, activeSubId) {
    state.view = view;
    state.activeId = activeId;
    state.activeSubId = activeSubId;
    // Clear search when navigating
    const searchEl = document.getElementById('site-search');
    if (searchEl) searchEl.value = '';
    renderTOC();
    renderMain();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ══════════════════════════════════════════
   TOC SIDEBAR
══════════════════════════════════════════ */
function renderTOC() {
    const nav = document.getElementById('toc-nav');
    let html = '';
    let catIdx = 1;

    html += `<div class="toc-section-label">📦 Resources</div>`;

    const allActive = state.view === 'all' ? 'active' : '';
    html += `<button class="toc-item ${allActive}" data-action="all">
        <span class="toc-num">—</span> All Categories
        <span class="toc-count">${state.links.length}</span>
    </button>`;

    state.links.forEach(cat => {
        const isActive = state.view === 'category' && state.activeId === cat.id;
        const n = catIdx++;

        if (cat.subcategories) {
            html += `<button class="toc-item ${isActive ? 'active' : ''}" data-action="category" data-id="${cat.id}">
                <span class="toc-num">${n}</span> ${cat.icon} ${cat.category}
            </button>`;
            let subIdx = 1;
            cat.subcategories.forEach(sub => {
                const subActive = state.view === 'subcategory' && state.activeId === cat.id && state.activeSubId === sub.id;
                html += `<button class="toc-item toc-sub-item ${subActive ? 'active' : ''}" data-action="subcategory" data-id="${cat.id}" data-subid="${sub.id}">
                    <span class="toc-num">${n}.${subIdx++}</span> ${sub.icon} ${sub.label}
                    <span class="toc-count">${sub.links.length}</span>
                </button>`;
            });
        } else {
            const totalLinks = cat.links ? cat.links.length : 0;
            html += `<button class="toc-item ${isActive ? 'active' : ''}" data-action="category" data-id="${cat.id}">
                <span class="toc-num">${n}</span> ${cat.icon} ${cat.category}
                <span class="toc-count">${totalLinks}</span>
            </button>`;
        }
    });

    if (state.posts.length) {
        html += `<div class="toc-section-label">📜 Guides</div>`;
        state.posts.forEach((post, i) => {
            const gActive = state.view === 'guide' && state.activeId === `guide-${i}`;
            html += `<button class="toc-guide-item ${gActive ? 'active' : ''}" data-action="guide" data-idx="${i}">
                <span class="guide-name">${post.title}</span>
                <span class="guide-date">${post.date}</span>
            </button>`;
        });
    }

    nav.innerHTML = html;

    nav.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            if (action === 'all') setView('all', null, null);
            else if (action === 'category') setView('category', btn.dataset.id, null);
            else if (action === 'subcategory') setView('subcategory', btn.dataset.id, btn.dataset.subid);
            else if (action === 'guide') setView('guide', `guide-${btn.dataset.idx}`, null);
        });
    });
}

/* ══════════════════════════════════════════
   MAIN CONTENT
══════════════════════════════════════════ */
function renderMain() {
    const main = document.getElementById('main-content');

    if (state.view === 'guide') {
        const idx = parseInt(state.activeId.replace('guide-', ''), 10);
        const post = state.posts[idx];
        if (!post) { main.innerHTML = '<p class="empty-state">Guide not found.</p>'; return; }

        /* Show skeleton while loading */
        main.innerHTML = renderGuideSkeleton(post);

        /* Fetch and render the .md file */
        fetch(post.file)
            .then(r => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                return r.text();
            })
            .then(mdText => {
                const bodyEl = document.getElementById('guide-md-body');
                if (bodyEl) {
                    bodyEl.innerHTML = renderMarkdown(mdText);
                    /* Re-style shield badges */
                    bodyEl.querySelectorAll('img[src*="shields.io"]').forEach(img => {
                        img.style.cssText = 'height:20px;margin:0 3px 6px 0;vertical-align:middle;border-radius:3px;';
                    });
                }
            })
            .catch(err => {
                const bodyEl = document.getElementById('guide-md-body');
                if (bodyEl) bodyEl.innerHTML = `<p class="empty-state">Could not load guide: ${err.message}</p>`;
            });
        return;
    }

    if (state.view === 'category') {
        const cat = state.links.find(c => c.id === state.activeId);
        if (!cat) { main.innerHTML = '<p class="empty-state">Category not found.</p>'; return; }
        main.innerHTML = renderCategoryPage(cat);
        attachSectionToggles(main);
        return;
    }

    if (state.view === 'subcategory') {
        const cat = state.links.find(c => c.id === state.activeId);
        const sub = cat && cat.subcategories ? cat.subcategories.find(s => s.id === state.activeSubId) : null;
        if (!sub) { main.innerHTML = '<p class="empty-state">Sub-category not found.</p>'; return; }
        main.innerHTML = renderSubcategoryPage(cat, sub);
        return;
    }

    /* Default: all categories */
    main.innerHTML = renderAllPage();
    attachSectionToggles(main);
}

/* ── Markdown → HTML via marked.js ── */
function renderMarkdown(mdText) {
    if (typeof marked === 'undefined') {
        /* Fallback: wrap in <pre> */
        return `<pre style="white-space:pre-wrap">${escapeHtml(mdText)}</pre>`;
    }
    return marked.parse(mdText);
}

function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/* ── Guide skeleton (header shown instantly, body filled async) ── */
function renderGuideSkeleton(post) {
    const tags = (post.tags || []).map(t => `<span class="tag-pill">${t}</span>`).join('');
    return `
    <div class="breadcrumb">
        <button onclick="setView('all',null,null)" style="background:none;border:none;color:var(--link);cursor:pointer;font-size:0.8rem;padding:0;">home</button>
        <span class="breadcrumb-sep">/</span>
        <span class="breadcrumb-current">guides</span>
        <span class="breadcrumb-sep">/</span>
        <span class="breadcrumb-current">${(post.catLabel || post.cat).toLowerCase()}</span>
    </div>
    <article class="guide-article">
        <div class="guide-article-header">
            <h2 class="guide-article-title">${post.title}</h2>
            <div class="guide-article-meta">
                <span>📅 ${post.date}</span>
                <span>🏷 ${post.catLabel || post.cat}</span>
                ${tags}
            </div>
        </div>
        <div class="guide-article-body">
            <p class="guide-desc-lead">${post.desc}</p>
            <div id="guide-md-body" class="md-body">
                <p class="loading">Loading…</p>
            </div>
        </div>
    </article>`;
}

/* ── All-categories overview ── */
function renderAllPage() {
    const totalLinks = state.links.reduce((sum, c) => {
        if (c.links) return sum + c.links.length;
        if (c.subcategories) return sum + c.subcategories.reduce((s2, sub) => s2 + sub.links.length, 0);
        return sum;
    }, 0);

    let html = `
    <div class="wiki-page-header">
        <h2 class="wiki-page-title">π archive</h2>
        <p class="wiki-page-subtitle">Curated archive of useful resources and guides for general purposes.</p>
    </div>
    <div class="stats-bar">
        <div class="stat-item"><span class="stat-val">${state.links.length}</span><span class="stat-label">categories</span></div>
        <div class="stat-item"><span class="stat-val">${totalLinks}</span><span class="stat-label">resources</span></div>
        <div class="stat-item"><span class="stat-val">${state.posts.length}</span><span class="stat-label">guides</span></div>
    </div>`;

    let catIdx = 1;
    state.links.forEach(cat => {
        html += renderCategorySection(cat, catIdx++, true);
    });
    return html;
}

/* ── Single category page ── */
function renderCategoryPage(cat) {
    const bread = `<div class="breadcrumb">
        <button onclick="setView('all',null,null)" style="background:none;border:none;color:var(--link);cursor:pointer;font-size:0.8rem;padding:0;">home</button>
        <span class="breadcrumb-sep">/</span>
        <span class="breadcrumb-current">${cat.category.toLowerCase()}</span>
    </div>`;
    return bread + renderCategorySection(cat, 1, false);
}

/* ── Single subcategory page ── */
function renderSubcategoryPage(cat, sub) {
    const bread = `<div class="breadcrumb">
        <button onclick="setView('all',null,null)" style="background:none;border:none;color:var(--link);cursor:pointer;font-size:0.8rem;padding:0;">home</button>
        <span class="breadcrumb-sep">/</span>
        <button onclick="setView('category','${cat.id}',null)" style="background:none;border:none;color:var(--link);cursor:pointer;font-size:0.8rem;padding:0;">${cat.category.toLowerCase()}</button>
        <span class="breadcrumb-sep">/</span>
        <span class="breadcrumb-current">${sub.label.toLowerCase()}</span>
    </div>`;

    return `${bread}
    <div class="wiki-section">
        <div class="wiki-section-header">
            <span class="wiki-section-number">1</span>
            <h2 class="wiki-section-title">${sub.icon} ${sub.label}</h2>
        </div>
        <div class="wiki-section-body">
            ${renderLinkTable(sub.links)}
        </div>
    </div>`;
}

/* ── Category section block ── */
function renderCategorySection(cat, num, collapsible) {
    const toggleBtn = collapsible
        ? `<button class="wiki-section-toggle" data-toggle="section-${cat.id}">[hide]</button>`
        : '';

    let bodyHtml = '';
    if (cat.subcategories) {
        let subNum = 1;
        cat.subcategories.forEach(sub => {
            bodyHtml += `
            <div class="wiki-subsection">
                <div class="wiki-subsection-header">
                    <span class="wiki-subsection-number">${num}.${subNum++}</span>
                    <h3 class="wiki-subsection-title">${sub.icon} ${sub.label}</h3>
                </div>
                ${renderLinkTable(sub.links)}
            </div>`;
        });
    } else if (cat.links) {
        bodyHtml = renderLinkTable(cat.links);
    }

    const desc = cat.description ? `<p class="wiki-section-desc">${cat.description}</p>` : '';

    return `
    <div class="wiki-section">
        <div class="wiki-section-header" ${collapsible ? `data-header="section-${cat.id}"` : ''}>
            <span class="wiki-section-number">${num}</span>
            <h2 class="wiki-section-title">${cat.icon} ${cat.category}</h2>
            ${toggleBtn}
        </div>
        <div class="wiki-section-body" id="section-${cat.id}">
            ${desc}
            ${bodyHtml}
        </div>
    </div>`;
}

/* ── Link table ── */
function renderLinkTable(links) {
    if (!links || !links.length) return '<p class="empty-state">No links yet.</p>';
    const rows = links.map(link => {
        const favicon = getFavicon(link.url);
        const fallback = getFallback(link.name, link.url);
        const tags = (link.tags || []).map(t => `<span class="tag-pill">${t}</span>`).join('');
        return `<tr>
            <td class="col-icon">
                <img class="site-favicon" src="${favicon}" alt="" loading="lazy"
                    onerror="this.style.display='none';this.nextElementSibling.style.display='inline-flex';">
                <span class="site-favicon-fallback" style="display:none">${fallback}</span>
            </td>
            <td class="col-name">
                <a href="${link.url}" target="_blank" rel="noopener noreferrer">${link.name}</a>
            </td>
            <td class="col-desc">${link.description || ''} ${tags}</td>
        </tr>`;
    }).join('');
    return `<table class="link-table">
        <thead><tr>
            <th class="col-icon"></th>
            <th class="col-name">Site</th>
            <th class="col-desc">Description</th>
        </tr></thead>
        <tbody>${rows}</tbody>
    </table>`;
}

/* ── Section collapse toggle ── */
function attachSectionToggles(container) {
    container.querySelectorAll('[data-toggle]').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            const body = document.getElementById(btn.dataset.toggle);
            if (!body) return;
            const collapsed = body.classList.toggle('collapsed');
            btn.textContent = collapsed ? '[show]' : '[hide]';
        });
    });
}

/* ── Helpers ── */
function getFavicon(url) {
    try {
        const host = new URL(url).hostname.replace(/^www\./, '');
        return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=32`;
    } catch { return ''; }
}

function getFallback(name, url) {
    try {
        return new URL(url).hostname.replace(/^www\./, '').charAt(0).toUpperCase();
    } catch { return name.charAt(0).toUpperCase(); }
}