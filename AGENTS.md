# AGENTS Guide for Codex/Copilot

This repository contains a Blogger theme and tooling to unpack a monolithic theme XML into a modular workspace and to pack it back into a single, valid theme XML. This guide gives AI coding agents (Codex/Copilot) practical, project‑specific instructions, conventions, and references.

## Key Docs (read these first)
- scripts and workflow: docs/scripts.md
- modular layout and fragments: docs/structure.md
- Blogger XML anatomy: docs/xml.md
- Deep dive and examples: docs/blogger-theme-structure.md

Paths above are workspace‑relative and should be opened directly when answering questions or performing edits.

## Ground Rules
- Keep the original packed theme immutable unless the user explicitly requests otherwise:
  - Packed source: project/packed/theme-*.xml
  - When verifying, write to /tmp or a new filename in project/packed to avoid overwrites.
- Use only Python stdlib. Do not introduce external dependencies.
- Do not remove or alter the metadata tail of placeholder comments. Human‑readable labels are fine, but the trailing "| CODEX_PLACEHOLDER …" must remain intact for the packer to work.
- Preserve Blogger namespaces (html, b, data, expr, and any optional ones). If you see new prefixes in a user‑provided theme, add them to OPTIONAL_NAMESPACES in both scripts.

## Pack/Unpack/Diff Scripts
- Unpack: `python3 scripts/unpack_theme.py <path/to/theme.xml> <output_dir>`
- Pack: `python3 scripts/pack_theme.py <unpacked_dir> <output/theme.xml>`
- Structural diff: `python3 scripts/xml_comparison.py <file_a.xml> <file_b.xml>`
  - The diff tool auto-creates `project/diffs/<timestamp>-xml-diff.md`. Never delete previous reports unless the user asks; they serve as history.
  - It normalizes Blogger namespaces automatically (OPTIONAL_NAMESPACES constant). Update that list if new prefixes appear.
  - Reports are grouped into Added / Removed / Changed entries. Use them to sanity-check large merges or to summarize differences for the user.

Unpack splits the theme into:
- main.html: a small structural shell with placeholder comments
- styles.css: pure CSS (variables removed)
- variables.json: ordered list of Variable/Group entries
- script.js: inline scripts as [SCRIPT:id] blocks
- inline-styles/*.css: each inline <style> extracted
- sections/*.xml: one file per <b:section>
- widgets/*.xml: one file per <b:widget>
- includables/all-head-content.xml: the head include
- includables/defs/*.xml: one file per <b:includable>

Placeholder comment format (human label + machine metadata):
- `<!--SECTION sections/<file>.xml | CODEX_PLACEHOLDER …-->`
- `<!--WIDGET widgets/<file>.xml | CODEX_PLACEHOLDER …-->`
- `<!--INCLUDABLE includables/defs/<file>.xml | CODEX_PLACEHOLDER …-->`
- `<!--INLINE_STYLE inline-styles/<file>.css | CODEX_PLACEHOLDER …-->`
- `<!--INCLUDE includables/all-head-content.xml | CODEX_PLACEHOLDER …-->`
- `<!--SCRIPT script-<n> (head|body) | CODEX_PLACEHOLDER …-->`

The packer resolves placeholders (recursively), reinserts fragments, and rebuilds <b:skin> CDATA from variables.json + styles.css.

## Typical Agent Tasks
When asked to modify the theme, prefer editing modular files and avoid editing placeholder tails by hand.

Examples:
- Change a color or string used by the theme editor:
  - Edit variables.json entries (entry_type=variable) and keep group metadata intact.
- Update global styles:
  - Edit styles.css; avoid re‑adding Variable markup here.
- Change inline styles or scripts:
  - Edit files under inline-styles/ and the ranges inside script.js (`// [SCRIPT:id]` … `// [END SCRIPT]`). Ensure markers remain balanced.
- Adjust a section or widget:
  - Edit the corresponding file under sections/ or widgets/.
- Add a new widget/section:
  - Add the real <b:widget>/<b:section> markup in the appropriate parent (e.g., in main.html or inside a section XML), pack, then unpack again. The unpacker will split it into its own file and create a labeled placeholder automatically. Do not craft placeholder metadata by hand.
- Add/modify includables:
  - Edit or add files under includables/defs/ and reference them with <b:include> in your widget/section. Pack + unpack to normalize.

## Verification & Safety
- Before sharing results, do a round‑trip validation without touching the original packed XML:
  - Unpack to /tmp or a throwaway dir; pack to a separate output file.
  - Compare counts of <b:section>, <b:widget>, <b:includable> between original and rebuilt.
  - Ensure main.html contains no inline <style> tags and that <b:skin> has no __CODEX_STYLES__ placeholder.
- Use the verification snippet in docs/scripts.md when needed.

## Coding Conventions (for scripts)
- Python only, stdlib only.
- Keep label + metadata format consistent for placeholders:
  - Human label first (clickable relative path where applicable), then `| CODEX_PLACEHOLDER <hex>`
- Avoid reflowing or pretty‑printing XML in ways that change semantics; rely on ElementTree serialization and respect namespaces.

## FAQ (for Agents)
- Q: Can I rename fragment files?
  - A: Yes, but update the human‑readable label path in the parent fragment. The packer keys off the metadata tail; the label path is for humans.
- Q: How do I add support for a new XML namespace prefix?
  - A: Add it to OPTIONAL_NAMESPACES in both scripts so parsing is robust.
- Q: Why do we keep the original packed XML?
  - A: It’s the source of truth; round‑trips should be reversible and diffable. Only overwrite it on explicit request.

## Where to Find Answers
- Implementation details: scripts/unpack_theme.py, scripts/pack_theme.py
- Workflow & commands: docs/scripts.md
- Layout & fragments: docs/structure.md
- Blogger XML tags & anatomy: docs/xml.md
- Long, example‑driven guide: docs/blogger-theme-structure.md

Adhere to this guide when making changes; reference the docs when answering user questions or when proposing edits. This AGENTS.md applies to the entire repository.
