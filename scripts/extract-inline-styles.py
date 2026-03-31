#!/usr/bin/env python3
"""
Extract inline style="" attributes from Astro page files into CSS classes.
Handles dynamic expressions (Astro template literals) by preserving them inline.
"""
import re, sys, os
from pathlib import Path
from collections import defaultdict

# Tool configs: page file → layout file, CSS prefix
TOOLS = [
    {
        "page": "src/pages/openclaw/index.astro",
        "layout": "src/layouts/OpenClawLayout.astro",
        "prefix": "oc",
    },
    {
        "page": "src/pages/claude-code/index.astro",
        "layout": "src/layouts/ClaudeCodeLayout.astro",
        "prefix": "cc",
    },
    {
        "page": "src/pages/codex-cli/index.astro",
        "layout": "src/layouts/CodexLayout.astro",
        "prefix": "cx",
    },
    {
        "page": "src/pages/gemini-cli/index.astro",
        "layout": "src/layouts/GeminiLayout.astro",
        "prefix": "gc",
    },
    {
        "page": "src/pages/kilocode/index.astro",
        "layout": "src/layouts/KilocodeLayout.astro",
        "prefix": "kc",
    },
]

REPO = Path("/Users/cyperx/github/changelogs-info")

def has_dynamic_expr(style_val: str) -> bool:
    """Check if a style value contains dynamic Astro/template expressions."""
    # Check for {variable} patterns that aren't just CSS var()
    # Remove CSS var() references first
    cleaned = re.sub(r'var\([^)]+\)', '', style_val)
    return '{' in cleaned

def normalize_style(style_val: str) -> str:
    """Normalize a style string for grouping."""
    # Sort properties alphabetically, normalize whitespace
    props = []
    for part in style_val.split(';'):
        part = part.strip()
        if not part:
            continue
        props.append(part)
    props.sort()
    return '; '.join(props)

def style_to_class_name(style_val: str, prefix: str, index: int) -> str:
    """Generate a class name from a style value."""
    # Try to guess a semantic name from the properties
    props = set()
    for part in style_val.split(';'):
        part = part.strip().lower()
        if ':' in part:
            prop_name = part.split(':')[0].strip()
            props.add(prop_name)
    
    # Common patterns
    if 'display' in props and 'flex' in style_val.lower():
        if 'flex-direction' in props and 'column' in style_val.lower():
            if 'gap' in props:
                return f"{prefix}-vstack"
            return f"{prefix}-vcol"
        return f"{prefix}-flex"
    
    if props == {'font-family', 'font-size', 'color', 'text-transform', 'letter-spacing'}:
        return f"{prefix}-label"
    
    if 'display' in props and 'grid' in style_val.lower():
        return f"{prefix}-grid"
    
    if 'flex' in props and 'min-width' in props:
        return f"{prefix}-flex-item"
    
    # Fallback: use index
    return f"{prefix}-s{index}"

def extract_from_file(page_path: Path, prefix: str) -> tuple[str, dict]:
    """Extract inline styles and return modified content + CSS classes."""
    content = page_path.read_text()
    
    # Find all style="..." attributes
    # This regex handles multi-line styles
    pattern = r'style="([^"]*)"'
    
    styles_map = {}  # normalized_style → class_name
    class_counter = defaultdict(int)
    
    # First pass: collect all unique static styles
    static_styles = []
    for match in re.finditer(pattern, content):
        style_val = match.group(1)
        if not style_val.strip():
            continue
        if has_dynamic_expr(style_val):
            continue
        normalized = normalize_style(style_val)
        if normalized not in styles_map:
            static_styles.append((normalized, style_val))
    
    # Generate class names for unique styles
    for i, (normalized, original) in enumerate(static_styles):
        name = style_to_class_name(original, prefix, i)
        # Deduplicate name
        base_name = name
        counter = 2
        while name in styles_map.values():
            name = f"{base_name}-{counter}"
            counter += 1
        styles_map[normalized] = name
    
    # Second pass: replace static styles with classes
    def replace_style(match):
        full_match = match.group(0)
        style_val = match.group(1)
        if not style_val.strip():
            return full_match
        if has_dynamic_expr(style_val):
            return full_match  # Keep dynamic styles inline
        
        normalized = normalize_style(style_val)
        if normalized in styles_map:
            class_name = styles_map[normalized]
            # Check if element already has a class attribute
            return f'class="{class_name}"'
        return full_match
    
    new_content = re.sub(pattern, replace_style, content)
    
    return new_content, styles_map

def generate_css(styles_map: dict, prefix: str) -> str:
    """Generate CSS from the styles map."""
    lines = [f"/* Extracted inline styles for {prefix}-* */"]
    for normalized, class_name in sorted(styles_map.items(), key=lambda x: x[1]):
        lines.append(f".{class_name} {{")
        for prop in normalized.split(';'):
            prop = prop.strip()
            if prop:
                lines.append(f"  {prop};")
        lines.append("}")
        lines.append("")
    return '\n'.join(lines)

def process_tool(tool: dict):
    """Process one tool's page file."""
    page_path = REPO / tool["page"]
    layout_path = REPO / tool["layout"]
    prefix = tool["prefix"]
    
    if not page_path.exists():
        print(f"  SKIP {page_path} (not found)")
        return
    
    print(f"\n{'='*60}")
    print(f"Processing: {page_path.name} (prefix: {prefix})")
    
    content = page_path.read_text()
    original_size = len(content)
    
    # Count inline styles before
    style_count_before = len(re.findall(r'style="[^"]*"', content))
    dynamic_count = sum(1 for m in re.finditer(r'style="([^"]*)"', content) if has_dynamic_expr(m.group(1)))
    
    new_content, styles_map = extract_from_file(page_path, prefix)
    
    # Count after
    style_count_after = len(re.findall(r'style="[^"]*"', new_content))
    
    # Generate CSS
    css = generate_css(styles_map, prefix)
    
    # Write modified page
    page_path.write_text(new_content)
    new_size = len(new_content)
    
    # Write CSS to a shared file
    css_path = REPO / f"src/styles/{prefix}-extracted.css"
    css_path.write_text(css)
    
    print(f"  Styles before: {style_count_before}")
    print(f"  Styles after:  {style_count_after} (kept {dynamic_count} dynamic)")
    print(f"  CSS classes generated: {len(styles_map)}")
    print(f"  Page size: {original_size} → {new_size} ({new_size - original_size:+d} bytes)")
    print(f"  CSS file: {css_path} ({len(css)} bytes)")

def main():
    os.chdir(REPO)
    for tool in TOOLS:
        process_tool(tool)
    
    print(f"\n{'='*60}")
    print("Done! Now you need to:")
    print("1. Import each *-extracted.css in the corresponding layout")
    print("2. Merge class attrs with existing class attrs where needed")
    print("3. Run pnpm build to verify")

if __name__ == "__main__":
    main()
