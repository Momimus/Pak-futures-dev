# Blogger Theme XML Anatomy

This guide explains the structure of a Blogger theme XML file, the namespaces in use, and how the key Blogger tags work together. It complements `docs/structure.md` (project layout) and `docs/scripts.md` (pack/unpack workflow).

## Namespaces And Root

- Root element: `<html>`
- Namespaces commonly used:
  - Default HTML: `xmlns="http://www.w3.org/1999/xhtml"`
  - Blogger: `xmlns:b="http://www.google.com/2005/gml/b"`
  - Blogger data: `xmlns:data="http://www.google.com/2005/gml/data"`
  - Blogger expressions: `xmlns:expr="http://www.google.com/2005/gml/expr"`
  - Optional (seen in themes): `xmlns:g="http://schemas.google.com/g/2005"`
- Typical attributes on `<html>`: `b:css`, `b:defaultwidgetversion`, `b:layoutsVersion`, `b:responsive`, `b:templateVersion`, and expression-bound `expr:*` attributes.

## Head Section

- Standard HTML head elements: `<meta>`, `<title>`, `<link>`, `<script>`.
- Blogger include: `<b:include data="blog" name="all-head-content"/>` brings in Blogger-managed meta and feed tags.
- Inline conditionals: `<b:if cond="data:view.isHomepage">…</b:if>` to scope content by the current view.
- Skin and variables:
  - `<b:skin version="…"><![CDATA[ … ]]></b:skin>` encloses the theme’s variable declarations and CSS.
  - Variable markup inside CDATA:
    - Single variable: `<Variable name="main.color" type="color" default="#…" value="#…"/>`
    - Grouped variables: `<Group description="…" selector="…"> … </Group>` to organize variables for the theme editor.
  - After variables, regular CSS rules appear; both are inside the same CDATA block.

## Body Section

- Sections (`<b:section …>…</b:section>`) represent layout regions; they can contain HTML and widgets.
  - Attributes: `id`, `name`, `class`, `maxwidgets`, `showaddelement`.
  - Sections are what the Blogger Layout editor exposes in the UI.

- Widgets (`<b:widget …>…</b:widget>`) are placed inside sections.
  - Attributes: `id`, `type` (e.g., `LinkList`, `HTML`, `Text`, `Label`), `title`, `version`, `visible`.
  - Settings: `<b:widget-settings><b:widget-setting name="…">…</b:widget-setting>…</b:widget-settings>`.
  - Templates: widgets often render via `b:includable` content (see below).

- Includables and includes:
  - Define reusable templates with `<b:includable id="…" [var="…"]> … </b:includable>`.
  - Use them with `<b:include name="…" [data="…"]/>`; common patterns include `name='main'`, `name='widget-title'`, or in `head` as `name='all-head-content'`.

## Blogger Expressions And Data

- `expr:*` attributes allow binding values using Blogger’s expression language.
  - Examples: `expr:class='data:blog.languageDirection'`, `expr:href='data:post.url'`, `cond='data:view.isLayoutMode'`.
- `data:*` provides the current data model context (blog, view, widgets, posts).
- `b:if`, `b:loop`, and `b:with` control rendering logic:
  - `<b:if cond="…"> … </b:if>` conditional sections.
  - `<b:loop values='data:posts' var='post'> … </b:loop>` iterate over collections.
  - `<b:with value='…' var='…'> … </b:with>` create scoped bindings.

## Typical Flow In A Theme

1. `head` wires in system meta via `all-head-content`, sets fonts and third-party CSS, and defines the `<b:skin>` CDATA with variables + rules.
2. `body` composes major sections (header, navigation, content, sidebar, footer), each a `<b:section>`.
3. Each section hosts `<b:widget>` elements, which reference `<b:includable>` templates and can include additional `<b:include>`s.
4. Conditional blocks (`b:if`) toggle fragments for layout mode vs. normal view.

## What Blogger Accepts

- Root must be valid XHTML within Blogger’s constraints.
- Blogger tags must retain their namespaces and attributes.
- `<b:skin>` must remain in `head` with a single CDATA block that includes both variables and CSS.
- `expr:*` and `data:*` attributes must be well-formed; unknown variables or malformed expressions cause theme validation errors on upload.
- Comments are allowed and preserved.

## How Unpack/Pack Interacts With XML

- Unpack
  - Parses with namespaces and extracts:
    - Variables into `variables.json` and raw CSS into `styles.css`.
    - The `all-head-content` include into `includables/all-head-content.xml`.
    - Each `<b:section>`, `<b:widget>`, and `<b:includable>` to their own files.
    - Inline `<style>` tags to `inline-styles/*.css` and inline `<script>` blocks to `script.js`.
  - Replaces removed nodes with labeled placeholder comments that include resolvable relative paths and machine-readable metadata.

- Pack
  - Reads `main.html`, repeatedly resolves placeholders by loading fragments, and reassembles the widget/section/includable tree.
  - Builds the `<b:skin>` CDATA by regenerating `<Variable>/<Group>` markup from `variables.json` and appending `styles.css`.
  - Restores inline styles/scripts with their original attributes.
  - Preserves Blogger namespaces and writes a complete, valid theme XML.

## Tips For Editing XML Fragments

- Keep XML well-formed; every `<b:…>` tag must be properly closed.
- Preserve namespaces when adding new Blogger tags (e.g., `<b:widget>` not `<widget>`).
- When adding a new widget or includable, ensure IDs are unique within the theme.
- Prefer editing fragments over `main.html`; placeholders in `main.html` are intentional and are how packing finds child fragments.

