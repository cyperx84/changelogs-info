#!/usr/bin/env python3
"""Fix elements that got two class= attributes after style extraction."""
import re
from pathlib import Path

REPO = Path("/Users/cyperx/github/changelogs-info")
FILES = [
    "src/pages/openclaw/index.astro",
    "src/pages/claude-code/index.astro",
    "src/pages/codex-cli/index.astro",
    "src/pages/gemini-cli/index.astro",
    "src/pages/kilocode/index.astro",
]

def fix_double_classes(content: str) -> str:
    """Merge two class= attributes on the same element into one."""
    # Pattern: class="A" class="B" → class="A B"
    # Also handles class="A"class="B" (no space)
    pattern = r'class="([^"]*)"\s+class="([^"]*)"'
    
    def merger(match):
        c1 = match.group(1).strip()
        c2 = match.group(2).strip()
        merged = f"{c1} {c2}".strip()
        return f'class="{merged}"'
    
    # Run multiple times in case there are triples
    prev = None
    while prev != content:
        prev = content
        content = re.sub(pattern, merger, content)
    
    return content

for f in FILES:
    fp = REPO / f
    if not fp.exists():
        continue
    content = fp.read_text()
    new_content = fix_double_classes(content)
    if content != new_content:
        fp.write_text(new_content)
        fixes = content.count('class="') - new_content.count('class="')
        print(f"Fixed {fixes} double-class merges in {f}")
    else:
        print(f"OK: {f} (no double classes)")
