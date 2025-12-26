# Blogger Theme Pack/Unpack Workflow

These helper scripts (`scripts/unpack_theme.py` and `scripts/pack_theme.py`) turn a monolithic Blogger theme XML into a modular workspace and back again. This document explains how to run them, what directory layout they expect, and how to safely iterate on the theme.

## Prerequisites
- Python 3.9+ with standard library only (no external deps).
- A Blogger theme XML you want to edit, e.g. `project/packed/theme-4402507496343781843.xml`.
- The repository root as your working directory when running commands.

## Unpacking a Theme

```bash
python3 scripts/unpack_theme.py project/packed/theme-4402507496343781843.xml project/unpacked
```

What happens under the hood:
1. **Namespace patching** – missing optional namespaces (e.g. `g:`) are injected so the XML parser never fails on “unbound prefix”.
2. **Skin splitting** – everything inside `<b:skin>` is stripped down to a placeholder; CSS is persisted to `styles.css` and theme variables are converted into structured JSON (`variables.json`).
3. **Head includables** – `<b:include data="blog" name="all-head-content"/>` is extracted to `includables/all-head-content.xml`.
4. **Structural elements** – every `<b:section>`, `<b:widget>`, and `<b:includable>` is saved as an individual XML file (`sections/*.xml`, `widgets/*.xml`, `includables/defs/*.xml`). The original positions in `main.html` are replaced with metadata-rich HTML comments (`<!--PCK_PLACEHOLDER …-->`) that remember where to reinsert each fragment.
5. **Inline assets** – inline `<script>` blocks are moved into `script.js` (as `[SCRIPT:<id>]…` ranges) and `<style>` tags become individual files in `inline-styles/*.css`.
6. **Main shell** – `main.html` now holds only the structural shell of the template, the placeholders, and the head/body scaffolding. No CSS, JS, or widget bodies remain in this file.

## Unpacked Layout

```
project/unpacked/
├── includables/
│   ├── all-head-content.xml
│   └── defs/                    # Every <b:includable id="...">
├── inline-styles/               # Each inline <style> becomes <name>.css
├── sections/                    # Every <b:section> by sanitized ID
├── widgets/                     # Every <b:widget> by sanitized ID or title
├── main.html                    # Blogger shell with placeholders
├── script.js                    # Inline scripts in tagged blocks
├── styles.css                   # Pure CSS outside <Variable> definitions
└── variables.json               # Ordered list of variables/groups/comments
```

Each placeholder comment now starts with a human-friendly label followed by the encoded metadata, e.g.

```
<!--SECTION sections/home-ad-top1.xml | PCK_PLACEHOLDER …-->
```

That means you can Ctrl/Cmd+click the relative path in most editors to open the backing file, while the packer still decodes the `PCK_PLACEHOLDER …` tail during rebuilds.

## Editing Guidelines

- **Sections & widgets**: edit the XML in `sections/*.xml` or `widgets/*.xml`. These files still contain Blogger tags (`expr:*`, `<b:include>`, etc.), so keep them well-formed XML.
- **Includables/defs**: complex snippets such as widget templates or repeated blocks live here. If you add new ones, ensure the filename is unique and that the surrounding placeholder points to the right file.
- **Inline styles/scripts**: adjust the `.css` files in `inline-styles/` and the marked ranges inside `script.js`. Always keep the `// [SCRIPT:id]` and `// [END SCRIPT]` markers intact; the packer uses them to reassemble the document.
- **Variables**: `variables.json` keeps the `<Variable>` definitions in order (including optional `<Group>` metadata). Each entry has `entry_type` (`variable` or `comment`), optional `group`, and the original attributes. Update values in place; avoid removing keys unless you know Blogger accepts it.
- **Global CSS**: `styles.css` should contain only actual CSS rules—no `<Variable>` markup or comments like `<!-- Variable definitions -->`.
- **Placeholder comments**: feel free to click the `SECTION …`, `WIDGET …`, etc. portion to jump to the source file, but never delete the `| PCK_PLACEHOLDER …` tail; it contains the metadata needed for repacking.

## Packing the Theme

```bash
python3 scripts/pack_theme.py project/unpacked project/packed/theme-4402507496343781843-rebuilt.xml
```

What the packer enforces:
1. **File presence** – `main.html`, `styles.css`, `variables.json`, and `script.js` must exist or the process aborts.
2. **Placeholder resolution** – the script repeatedly resolves placeholder comments for includables, sections, widgets, inline styles, and inline scripts, tracking attributes like `id`, `title`, `type`, etc. Missing fragments raise clear errors with the offending file path.
3. **Skin reconstruction** – variables are rebuilt into the original `<Group>/<Variable>` markup, followed by your current `styles.css` content, and wrapped back in `<![CDATA[...]]>` inside `<b:skin>`.
4. **Output hygiene** – the final XML gets the XML declaration + `<!DOCTYPE html>` header and preserves Blogger namespace declarations.

### Round-Trip Verification
For peace of mind before deploying:

```bash
# isolate the test run
rm -rf /tmp/blogger_unpacked_verify && mkdir -p /tmp/blogger_unpacked_verify
python3 scripts/unpack_theme.py project/packed/theme-4402507496343781843.xml /tmp/blogger_unpacked_verify
python3 scripts/pack_theme.py /tmp/blogger_unpacked_verify /tmp/theme-verify.xml

# structural check (counts sections/widgets/includables etc.)
python3 - <<'PY'
import importlib.util, json
from pathlib import Path
spec = importlib.util.spec_from_file_location('unpack', 'scripts/unpack_theme.py')
mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
def parse(path):
    text = mod._inject_optional_namespaces(Path(path).read_text())
    return mod.ET.fromstring(text, parser=mod.ET.XMLParser(target=mod.ET.TreeBuilder(insert_comments=True)))
orig = parse('project/packed/theme-4402507496343781843.xml')
rebuilt = parse('/tmp/theme-verify.xml')
counts = {name: (sum(1 for _ in orig.iter(tag)), sum(1 for _ in rebuilt.iter(tag)))
          for name, tag in [('sections', mod.B_SECTION), ('widgets', mod.B_WIDGET), ('includables', mod.B_INCLUDABLE)]}
print(json.dumps(counts, indent=2))
PY
```

Adjust paths as needed; the key idea is to run pack/unpack outside `project/unpacked` when testing so you do not overwrite your working tree.

## Troubleshooting

- **“unbound prefix” errors** – ensure you run the scripts from this repo; they auto-inject known namespaces before parsing. If Blogger introduces a new prefix, add it to `OPTIONAL_NAMESPACES` in both scripts.
- **Placeholder left in output** – indicates a missing fragment file. The comment’s leading label already shows the relative path (`SECTION sections/foo.xml`), so open that path or fix the missing file and rerun the packer.
- **`script.js` marker mismatch** – every `// [SCRIPT:id]` must have a matching `// [END SCRIPT]`. The packer halts if it detects nested markers or missing endings.
- **Duplicate filenames** – the unpacker sanitizes IDs/titles and appends numeric suffixes if needed. If you manually add files, keep names unique to avoid collisions during the next unpack.
- **Comparing against the original** – after packing, diff `project/packed/theme-*.xml` vs. the original to confirm only intentional changes exist. Blogger often tolerates whitespace differences, but functional diffs should be manageable thanks to the modular workflow.

## Quick Start Checklist
1. Run the unpack script into a clean directory.
2. Edit modular files (sections, widgets, includables, inline styles, CSS, variables, scripts).
3. Repack into a new XML file and test locally in Blogger or a staging blog.
4. Optionally run the verification snippet to assert structure parity.
5. Commit both scripts and the updated modular files; keep the original packed XML untouched unless you intentionally replace it.

With this workflow you can iterate on complex Blogger templates using normal source-control practices instead of editing a single unwieldy XML blob.
