import { readFileSync, writeFileSync } from "fs";

const layouts = [
  {
    file: "src/layouts/ClaudeCodeLayout.astro",
    prefix: "cc",
    section: "claude-code",
    brandLabel: "Claude Code",
    easterEgg: "apex", // keep apex mode
  },
  {
    file: "src/layouts/CodexLayout.astro",
    prefix: "cx",
    section: "codex-cli",
    brandLabel: "Codex",
    easterEgg: "lobster", // keep lobster mode
  },
  {
    file: "src/layouts/GeminiLayout.astro",
    prefix: "gc",
    section: "gemini-cli",
    brandLabel: "Gemini",
    easterEgg: "nova", // keep nova mode
  },
];

for (const layout of layouts) {
  console.log(`Processing ${layout.file}...`);
  let content = readFileSync(layout.file, "utf-8");
  const p = layout.prefix;

  // 1. Add SharedNav import
  if (!content.includes('import SharedNav')) {
    content = content.replace(
      `import { ViewTransitions } from "astro:transitions";`,
      `import { ViewTransitions } from "astro:transitions";\nimport SharedNav from "../components/SharedNav.astro";`
    );
  }

  // 2. Replace header block (from <header to </header>) with SharedNav + sub-nav
  const headerStart = content.indexOf(`<header class="${p}-nav-header"`);
  const headerEnd = content.indexOf(`</header>`, headerStart) + `</header>`.length;
  if (headerStart === -1) { console.log(`  No header found, skipping`); continue; }

  const crossNavStart = content.indexOf(`<div class="${p}-cross-nav">`);
  const crossNavEnd = content.indexOf(`</div>\n    </div>`, crossNavStart);
  // Find the closing of cross-nav div

  const mainStart = content.indexOf(`<main style="padding-top: 73px;">`, headerEnd);

  // Build replacement
  const newNav = `    <!-- Shared top nav -->
    <SharedNav currentSection="${layout.section}" />

    <!-- ${layout.brandLabel} sub-nav -->
    <div class="${p}-subnav">
      <div class="${p}-subnav__inner">
        <span class="${p}-subnav__brand">${layout.brandLabel}</span>
        {navLinks.map((link) => (
          <a
            href={link.href}
            class={\`${p}-subnav__link \${currentPage === link.key ? "${p}-subnav__link--active" : ""}\`}
          >
            {link.label}
          </a>
        ))}
      </div>
    </div>

    <!-- Main content -->
    <main>
      <slot />
    </main>`;

  // Replace from headerStart to main end tag
  const mainEndTag = `</main>`;
  const mainEndIdx = content.indexOf(mainEndTag, mainStart) + mainEndTag.length;

  // Find the actual content we need to cut: header through cross-nav and main
  // Let's find the cross-nav closing
  let crossNavCloseEnd = -1;
  if (crossNavStart !== -1) {
    // cross-nav is <div class="xx-cross-nav">\n  <div class="xx-cross-nav__inner">...</div>\n</div>
    const innerClose = content.indexOf(`</div>`, crossNavStart + `<div class="${p}-cross-nav">`.length + 50);
    const outerClose = content.indexOf(`</div>`, innerClose + 6);
    crossNavCloseEnd = outerClose + `</div>`.length;
  }

  // Replace header + cross-nav + main block
  const cutEnd = crossNavCloseEnd > mainStart ? crossNavCloseEnd : mainEndIdx;
  // Actually let's be smarter: cut from headerStart to just before footer
  const footerStart = content.indexOf(`<!-- Footer -->`);
  if (footerStart === -1) {
    console.log(`  No footer comment found`);
    continue;
  }

  // Cut from headerStart to just before footer, replacing with SharedNav + subnav + main
  const before = content.substring(0, headerStart);
  const after = content.substring(footerStart);
  
  content = before + newNav + "\n\n    " + after;

  // 3. Remove old theme toggle script (between </footer> and next <!--)
  // Find the theme toggle script block
  const themeScriptStart = content.indexOf(`<script>\n      // === THEME TOGGLE ===`);
  if (themeScriptStart === -1) {
    // Try alternate
    const altStart = content.indexOf(`<script>\n      // Theme toggle`);
    // Just find the script that has THEME_KEY
  }
  
  // Actually let's find and remove the theme+mobile script
  // It starts with <script> and contains THEME_KEY
  const scriptBlocks = [];
  let searchFrom = 0;
  while (true) {
    const sIdx = content.indexOf(`<script>`, searchFrom);
    if (sIdx === -1) break;
    const eIdx = content.indexOf(`</script>`, sIdx);
    const block = content.substring(sIdx, eIdx + `</script>`.length);
    if (block.includes("THEME_KEY") || block.includes(`${p.toUpperCase()}_THEME_KEY`)) {
      scriptBlocks.push({ start: sIdx, end: eIdx + `</script>`.length, block });
    }
    searchFrom = eIdx + 1;
  }

  // Remove theme script blocks (reverse order to preserve indices)
  for (const sb of scriptBlocks.reverse()) {
    // Keep if it's the easter egg script
    if (sb.block.includes(`${layout.easterEgg}`) && !sb.block.includes("THEME_KEY")) continue;
    if (sb.block.includes("THEME_KEY")) {
      content = content.substring(0, sb.start) + content.substring(sb.end);
    }
  }

  // 4. Replace cross-nav CSS with subnav CSS
  const crossNavCSSStart = content.indexOf(`.${p}-cross-nav {`);
  if (crossNavCSSStart !== -1) {
    // Find the end of cross-nav styles
    const mediaEnd = content.indexOf(`}`, content.indexOf(`.${p}-cross-nav { display: none;`, crossNavCSSStart));
    const crossNavCSSEnd = content.indexOf(`\n`, mediaEnd + 1);
    
    const subnavCSS = `      .${p}-subnav {
        background: var(--${p}-bg-surface, var(--${p}-bg));
        border-bottom: 2px solid var(--${p}-border-dim, var(--${p}-border));
        position: sticky;
        top: 56px;
        z-index: 49;
      }
      .${p}-subnav__inner {
        max-width: 1400px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        gap: 1.5rem;
        padding: 0.5rem 1.25rem;
      }
      .${p}-subnav__brand {
        font-family: var(--${p}-font-headline);
        font-weight: 900;
        font-size: 1rem;
        color: var(--${p}-primary-bright, var(--${p}-primary));
        font-style: italic;
        letter-spacing: -0.03em;
      }
      .${p}-subnav__link {
        font-family: var(--${p}-font-headline);
        font-weight: 700;
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        text-decoration: none;
        color: var(--${p}-text);
        opacity: 0.6;
        padding-bottom: 2px;
        transition: color 100ms, opacity 100ms;
      }
      .${p}-subnav__link:hover {
        opacity: 1;
        color: var(--${p}-primary-bright, var(--${p}-primary));
      }
      .${p}-subnav__link--active {
        color: var(--${p}-primary-bright, var(--${p}-primary));
        opacity: 1;
        border-bottom: 3px solid var(--${p}-primary-bright, var(--${p}-primary));
      }`;
    
    // Find the actual start of the cross-nav CSS block (including comment if present)
    let cssBlockStart = crossNavCSSStart;
    const commentBefore = content.lastIndexOf("/*", crossNavCSSStart);
    if (commentBefore !== -1 && commentBefore > crossNavCSSStart - 50) {
      cssBlockStart = commentBefore;
    }
    
    content = content.substring(0, cssBlockStart) + `      /* Sub-nav */\n` + subnavCSS + content.substring(crossNavCSSEnd);
  }

  // 5. Remove mobile-cross styles
  content = content.replace(new RegExp(`\\s*\\.${p}-mobile-cross-label[^}]+\\}\\s*\\.${p}-mobile-cross-link[^}]+\\}[^}]+\\}[^}]+\\}`, 'gs'), '');
  content = content.replace(new RegExp(`\\.${p}-mobile-cross-label[^}]+\\}\\s*`, 'g'), '');

  // 6. Remove the data-layout="claude-code" type stuff from remaining scripts
  content = content.replace(/document\.documentElement\.setAttribute\("data-layout",\s*"[^"]+"\);?\n?/g, '');

  writeFileSync(layout.file, content);
  console.log(`  ✅ ${layout.file} updated`);
}

console.log("Done!");
