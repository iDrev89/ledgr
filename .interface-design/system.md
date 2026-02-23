# Ledgr Design System

## Direction

**Intent:** A cashier or store manager at a Latin American retail business — opening the register at 8am, counting bills, closing the till at night, reconciling every peso. The interface must feel like precision accounting: trustworthy, ordered, warm.

**Feel:** Slate — ink on paper. Not cold tech. The precision of a double-entry ledger, the clarity of a ruled page. Dense but readable. Every number treated as something to count.

**Signature element:** Ledger-line rhythm. Section headers as column labels (`uppercase tracking-wider text-xs text-muted-foreground`). Data panels divided by column rules. `font-mono tabular-nums` on all currency — the mark of physical accounting.

---

## Foundation

**Depth strategy:** Borders-only. No shadows. Flat surfaces defined by ruled lines, like a ledger book.

**Spacing base:** 4px (Tailwind scale)

**Radius scale:**
- `rounded-sm` — inputs, small elements
- `rounded-md` — banners, summary rows, info panels
- `rounded-lg` — cards, dialogs (via `--radius: 0.5rem`)

---

## Color Tokens (globals.css)

### Light Mode — Slate (ruled page)
```
--background: 240 10% 98%     /* near-white, faint slate tint */
--foreground: 240 15%  8%     /* deep slate ink */
--card: 0 0% 100%             /* pure white — lifts above background */
--card-foreground: 240 15% 8%
--popover: 0 0% 100%
--popover-foreground: 240 15% 8%
--primary: 240 15%  8%        /* deep slate primary */
--primary-foreground: 240 8% 97%
--secondary: 240 8% 95%       /* slate surface */
--secondary-foreground: 240 15% 8%
--muted: 240 8% 95%
--muted-foreground: 240 6% 46%
--accent: 240 8% 92%
--accent-foreground: 240 15% 8%
--border: 240 10% 87%         /* slate ruled line — clearly visible */
--input: 240 10% 87%
--ring: 240 15%  8%
```

### Dark Mode — Slate Dark
```
--background: 240 12%  5%
--foreground: 240  8% 96%
--card: 240 10%  8%
--primary: 240  8% 96%
--primary-foreground: 240 12%  5%
--secondary: 240  8% 16%
--muted: 240  8% 16%
--muted-foreground: 240  6% 64%
--border: 240  8% 16%
--input: 240  8% 16%
--ring: 240  8% 96%
```

### Semantic (unchanged)
```
--success: 142 71% 45%    /* text-success */
--warning: 38 92% 50%     /* text-warning */
--destructive: 0 84% 60%  /* text-destructive */
--info: 217 91% 60%       /* text-info */
```

---

## Typography

**Typeface:** Inter (system default)

**Amount display:** `font-mono tabular-nums` — all currency values. Never plain text for numbers that must be counted.

**Section labels / column headers:** `text-xs font-semibold uppercase tracking-wider text-muted-foreground`

**Page title:** `text-2xl md:text-3xl font-bold tracking-tight`

---

## Patterns

### Status Banner (left-border strip)
A single horizontal strip with a 2px left border indicating state. No background fill — the border alone signals status.

```tsx
// Open session
<div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-md border border-l-2 border-l-success px-4 py-3 text-sm">
  account · opened-by · amount · elapsed
</div>

// No session (warning)
<div className="... border-l-warning ...">
```

States: `border-l-success` (open), `border-l-warning` (no session), `border-l-border` (loading)

### Ledger Panel (multi-column metrics)
A single bordered panel divided into columns with `divide-x`. Used for session turn summary. Replaces floating stat cards.

```tsx
<Card>
  <CardContent className="p-0">
    <div className="grid grid-cols-2 lg:grid-cols-4 divide-y divide-border lg:divide-y-0 lg:divide-x divide-border">
      <div className="px-5 py-4">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Label</p>
        <p className="mt-1.5 font-mono text-xl font-semibold tabular-nums text-success">$0</p>
      </div>
      {/* repeat for each column */}
    </div>
  </CardContent>
</Card>
```

Amount colors: income → `text-success`, expenses → `text-destructive`, neutral → `text-foreground`

### Ledger Row (label / value pairs)
Used in detail dialogs and data panels. Each row has a bottom border (`border-b border-border/40 last:border-0`) creating the ledger-line rhythm.

```tsx
<div className="rounded-md border px-3 py-1">
  <div className="flex items-start justify-between gap-4 py-1.5 border-b border-border/40 last:border-0">
    <span className="text-muted-foreground shrink-0 text-sm">Label</span>
    <span className="text-right font-medium font-mono tabular-nums text-sm">Value</span>
  </div>
</div>
```

Non-currency values use `mono={false}` to omit `font-mono tabular-nums`.

### Summary Rows (close dialog)
Difference and deposit amounts shown as a `divide-y` bordered panel:

```tsx
<div className="rounded-md border overflow-hidden divide-y divide-border">
  <div className="flex justify-between items-center text-sm px-3 py-2">
    <span className="text-muted-foreground">Label:</span>
    <span className="font-mono font-medium tabular-nums text-success/destructive/warning">
      $0 <span className="font-sans text-xs font-normal">— descriptor</span>
    </span>
  </div>
</div>
```

### Difference Color Logic
```
diff === 0  → text-success
diff < 0    → text-destructive
diff > 0    → text-warning
```
Always use semantic tokens (`text-success`, `text-destructive`, `text-warning`) — never hardcoded `text-green-600` etc.

---

## Component Notes

**Cards:** Use `<Card>` with default `border` depth (no shadow). Hover state: `hover:bg-accent/50 transition-all`.

**Badges for session status:** `variant="success"` for open, `variant="secondary"` for closed.

**Section headings above panels:** `text-xs font-semibold uppercase tracking-wider text-muted-foreground` — not `text-lg font-semibold`.

**Icons:** Only where they clarify action (Eye, Trash2, Vault, Lock). Not decorative. Not on metric labels.

---

*Last updated: 2026-02-22 — palette changed from Warm Stone (30°) to Slate (240°, desaturated)*
