# PROPATI — Frontend Guidelines

## File Structure

One file: `index.html`

All CSS in `<style>` blocks inside the file. All JS in one `<script>` block at the bottom of `<body>`. No imports, no modules, no build.

---

## Typography

```css
/* Headings / Brand */
font-family: 'Bricolage Grotesque', sans-serif;

/* UI / Body / Buttons */
font-family: 'Outfit', sans-serif;

/* Serif / Display (logo, hero) */
font-family: 'DM Serif Display', serif;

/* Monospace (references, IDs, code) */
font-family: 'DM Mono', monospace;
```

Google Fonts import at top of `<head>`:
```html
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600;700;800&family=Outfit:wght@400;500;600;700;800&family=DM+Serif+Display&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
```

### Font Scale
```
Hero title:     clamp(2rem, 4.5vw, 3.2rem)   font-weight: 800
Page title:     1.1rem                         font-weight: 700, Bricolage Grotesque
Card title:     0.87rem                        font-weight: 700
Body text:      0.83–0.88rem                   font-weight: 400–500
Label/meta:     0.72–0.78rem                   font-weight: 400–600
Tag/badge:      0.65–0.70rem                   font-weight: 700, uppercase
Mono/ref:       0.62–0.72rem                   DM Mono
```

---

## Colour System

### CSS Variables (set on :root or theme class)

```css
/* Shared semantic colours */
--green:      #22c55e;
--green-bg:   rgba(34,197,94,0.1);
--amber:      #f59e0b;
--amber-bg:   rgba(245,158,11,0.1);
--red:        #ef4444;
--red-bg:     rgba(239,68,68,0.1);
--blue:       #3b82f6;
--blue-bg:    rgba(59,130,246,0.1);
```

### Role Themes

#### Landing & Marketplace
```css
background: #f5f3ee  /* warm sand */
text:       #1a1a1a
accent:     #c9952a  /* gold */
nav-bg:     rgba(245,243,238,0.95) with backdrop-filter: blur(14px)
```

#### Landlord (`.theme-landlord`)
```css
--l-bg:       #0f0f0f
--l-surface:  #141414
--l-surface2: #1a1a1a
--l-border:   rgba(255,255,255,0.08)
--l-text:     #f8f6f0
--l-muted:    #888680
--l-accent:   #d4622a  /* rust */
--l-accent2:  #c8520a
--l-glow:     rgba(212,98,42,0.1)
```

#### Tenant (`.theme-tenant`)
```css
--t-bg:       #f7f5f0
--t-surface:  #ffffff
--t-border:   #e8e5df
--t-text:     #111110
--t-muted:    #7a7870
--t-accent:   #0e7c6a  /* teal */
--t-accent2:  #14a88e
```

#### Agent (`.theme-agent`)
```css
--a-bg:       #060d18
--a-surface:  #0d1b2e
--a-border:   rgba(255,255,255,0.07)
--a-text:     #e8eef8
--a-muted:    #4a6480
--a-accent:   #c9952a  /* gold */
--a-accent2:  #e0b04a
```

#### Admin (`.theme-admin`)
```css
background:  #0c0e12
accent:      #00d4c8  /* cyan */
```

#### Estate Manager (`.em-*`)
```css
background:  #080E18  /* deep navy */
sidebar-bg:  #080E18
accent:      #6EA8FE  /* blue */
border:      #1A2A3A
text:        #C8D8E8
muted:       #5A7A9A
```

---

## Spacing Scale

```
0.2rem  →  tight
0.3rem  →  very small
0.4rem  →  small gap
0.5rem  →  small
0.6rem  →  base small
0.7rem  →  base
0.8rem  →  medium-small
0.9rem  →  medium
1rem    →  default spacing unit
1.2rem  →  medium-large
1.5rem  →  large
1.8rem  →  page padding (desktop content)
2rem    →  section spacing
3rem    →  hero padding
```

Content area padding: `1.6rem 1.8rem` desktop, `1rem` mobile.

---

## Border Radius Scale

```
4px   →  tag, small pill
7–8px →  small button, input
9–10px → standard button, input field
11–12px → card
14px  →  large card
16px  →  modal desktop
20px  →  modal bottom-sheet mobile
50%   →  avatar, circle
100px →  pill / badge
```

---

## Components

### Card
```html
<div class="card">
  <div class="card-head">
    <span class="card-title">Title</span>
    <span>Action link</span>
  </div>
  <div class="card-body">
    Content
  </div>
</div>
```
- `border-radius: 14px`
- Border: theme border colour
- Background: theme surface colour
- card-head padding: `1rem 1.3rem`
- card-body padding: `1.1rem 1.3rem`

### Button — Primary
```html
<button class="btn-primary" style="background:ACCENT;color:TEXT">Label</button>
```
```css
padding: 0.55rem 1.1rem;
border-radius: 9px;
font-size: 0.82rem;
font-weight: 700;
font-family: 'Outfit', sans-serif;
transition: all 0.18s;
```
Hover: `transform: translateY(-1px)`

### Button — Login (large)
```css
.btn-login {
  width: 100%;
  padding: 0.8rem;
  background: linear-gradient(135deg, #c9952a, #e0b04a);
  color: #1a1a1a;
  border-radius: 10px;
  font-weight: 800;
  font-size: 0.92rem;
}
```

### Input / Field
```css
.inp-field {
  width: 100%;
  padding: 0.7rem 0.9rem;
  border: 1.5px solid rgba(255,255,255,0.1); /* or #e5e7eb on light */
  border-radius: 9px;
  font-family: 'Outfit', sans-serif;
  font-size: 0.85rem;
  transition: border-color 0.18s;
}
.inp-field:focus {
  outline: none;
  border-color: ACCENT_COLOR;
}
```
Label: `.inp-label` → `font-size: 0.74rem; font-weight: 600; color: muted`

### Tag / Badge
```css
.tag {
  font-size: 0.67rem;
  font-weight: 700;
  padding: 0.16rem 0.5rem;
  border-radius: 100px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  display: inline-block;
}
.tag-green  { background: rgba(34,197,94,0.1);   color: #22c55e; }
.tag-amber  { background: rgba(245,158,11,0.1);  color: #f59e0b; }
.tag-red    { background: rgba(239,68,68,0.1);   color: #ef4444; }
.tag-blue   { background: rgba(59,130,246,0.1);  color: #3b82f6; }
.tag-gold   { background: rgba(201,149,42,0.15); color: #c9952a; }
.tag-rust   { background: rgba(212,98,42,0.1);   color: #d4622a; }
.tag-teal   { background: rgba(14,124,106,0.1);  color: #0e7c6a; }
```

### Nav Item (sidebar)
```css
.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.62rem 0.75rem;
  border-radius: 10px;
  font-size: 0.84rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.18s;
  min-height: 44px; /* touch target */
  position: relative;
}
/* Active state has left accent bar */
.nav-item.active::before {
  content: '';
  position: absolute;
  left: -8px;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 16px;
  background: ACCENT;
  border-radius: 100px;
}
```

### Toast
```css
position: fixed;
bottom: 1.5rem;
left: 50%;
transform: translateX(-50%) translateY(STATE.toastVisible ? 0 : 100px);
background: #1a1a1a;
color: white;
padding: 0.7rem 1.4rem;
border-radius: 100px;
font-size: 0.85rem;
font-weight: 600;
z-index: 9999;
transition: transform 0.3s, opacity 0.3s;
```

### Avatar / Initials Circle
```css
width: 38px;
height: 38px;
border-radius: 50%;
display: flex;
align-items: center;
justify-content: center;
font-weight: 800;
font-size: 0.85rem;
background: linear-gradient(135deg, ACCENT1, ACCENT2);
color: white; /* or dark for gold */
```

---

## Layout

### Dashboard Shell
```
.app-layout (display: flex, height: 100vh, overflow: hidden)
├── .sidebar (flex-shrink: 0, 220–240px wide, overflow-y: auto)
│   ├── .sb-header (logo)
│   ├── .sb-user-card (avatar + name + role)
│   ├── .sb-nav (nav items)
│   └── .sb-footer (sign out)
└── .main-area (flex: 1, display: flex, flex-direction: column)
    ├── .topbar (border-bottom, padding: 0.9rem 1.8rem)
    └── .content-area (flex: 1, overflow-y: auto, padding: 1.6rem 1.8rem)
```

### Grid Systems
```css
/* 2-col */
display: grid;
grid-template-columns: 1fr 1fr;
gap: 1rem;

/* 3-col KPI */
display: grid;
grid-template-columns: repeat(3, 1fr);
gap: 1rem;

/* 4-col KPI */
display: grid;
grid-template-columns: repeat(4, 1fr);
gap: 0.7rem;

/* Listing cards */
display: grid;
grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
gap: 1.2rem;
```

---

## Mobile Breakpoints

```css
/* Tablet / mobile */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: -280px;
    transition: left 0.28s cubic-bezier(0.4,0,0.2,1);
    z-index: 100;
  }
  .sidebar.open { left: 0; }
  .content-area { padding: 1rem; }
  /* Grids collapse */
  [style*="repeat(3"] { grid-template-columns: 1fr 1fr !important; }
  /* Modals become bottom sheets */
  .modal-box {
    position: fixed;
    bottom: 0; left: 0; right: 0;
    border-radius: 16px 16px 0 0;
  }
}

/* Small phones */
@media (max-width: 480px) {
  [style*="repeat(3"], [style*="repeat(4"] {
    grid-template-columns: 1fr !important;
  }
}
```

Mobile sidebar toggle: hamburger button (`.mob-menu-btn`) in topbar, overlay div with click-outside-to-close.

---

## Animation

```css
/* Fade up on load */
@keyframes lp-fade-up {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}
.fade-up { animation: lp-fade-up 0.5s ease both; }
.fade-up-1 { animation-delay: 0.05s; }
.fade-up-2 { animation-delay: 0.1s; }

/* Progress bar */
@keyframes shimmer {
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
}

/* Sidebar transition */
transition: left 0.28s cubic-bezier(0.4,0,0.2,1);

/* Button hover */
transition: all 0.18s;
hover: transform: translateY(-1px);
```

---

## Event Handling Pattern

All click events use **data-action delegation**:

```javascript
document.addEventListener('click', e => {
  const el = e.target.closest('[data-action]');
  if (!el) return;
  const action = el.dataset.action;
  switch(action) {
    case 'nav':        navigate(el.dataset.page); break;
    case 'goto-login': setState({ view: 'login' }); break;
    case 'toast':      showToast(el.dataset.msg); break;
    // ... etc
  }
});
```

Never attach inline `addEventListener`. Use `data-action` + `data-*` attributes or inline `onclick` for dynamic values (e.g. `onclick="signAgreement('${id}')"` inside template literals).

---

## State-Driven Rendering Pattern

```javascript
// CORRECT — always update state, never mutate DOM directly
function navigate(page) {
  setState({ page });
}

// CORRECT — conditional rendering in template literal
`${user.nin_verified
  ? '<span class="tag tag-green">✅ NIN Verified</span>'
  : ''}`

// WRONG — never do this
document.getElementById('something').style.display = 'block';
// Exception: toast animations and modal focus — use sparingly
```

---

## Writing Template Literals

### Nested template literals — use single quotes inside
```javascript
// CORRECT
return `<div style="color:${color}">
  ${items.map(i => `<span class="${i.active ? 'active' : ''}">${i.label}</span>`).join('')}
</div>`;

// WRONG — backtick inside backtick without function
// Always wrap nested in a function or use single quotes
```

### Ternary in template literals
```javascript
// CORRECT — JS expression
`${verified ? 'Verified' : 'Unverified'}`

// WRONG — nested template string with quotes
`${'${verified ? "Verified" : "Unverified"}'}`  // breaks
```

### Avoid escaped backticks
Never write `` \` `` inside a template literal function. If you need to close a template, close it properly. The `\`` pattern has caused multiple bugs in this project.
