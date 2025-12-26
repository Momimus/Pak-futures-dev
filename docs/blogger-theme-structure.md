# Blogger Theme Structure: A Practical, End‑to‑End Guide

This guide explains how Blogger themes are structured, what each core concept means (sections, widgets, includables, variables, expressions), and how to assemble a complete theme from scratch. It complements `docs/xml.md` (anatomy and tags), `docs/structure.md` (project layout), and `docs/scripts.md` (pack/unpack workflow).

## Core Concepts

### HTML + Namespaces
- Root element is `<html>` with XHTML and Blogger namespaces:
  - `xmlns="http://www.w3.org/1999/xhtml"`
  - `xmlns:b="http://www.google.com/2005/gml/b"`
  - `xmlns:data="http://www.google.com/2005/gml/data"`
  - `xmlns:expr="http://www.google.com/2005/gml/expr"`
  - Optional: `xmlns:g="http://schemas.google.com/g/2005"`

### Blogger Data + Expressions
- `data:*` exposes structured data (blog, view, posts, widgets).
- `expr:*` binds attributes to expressions, e.g. `expr:href='data:post.url'`.
- Control flow elements:
  - `<b:if cond='...'>...</b:if>`
  - `<b:loop values='...' var='...'>...</b:loop>`
  - `<b:with value='...' var='...'>...</b:with>`

### Sections
- `<b:section>` is a layout region (header, nav, content, sidebar, footer).
- Attributes you’ll commonly see: `id`, `name`, `class`, `maxwidgets`, `showaddelement`.
- The Blogger Layout UI allows adding/removing widgets inside sections defined in the template.

### Widgets
- `<b:widget>` are content units inside sections.
- Attributes: `id`, `type` (e.g., `LinkList`, `HTML`, `Text`, `Label`, `Blog`), `title`, `visible`, `locked`, `version`.
- Often include `<b:widget-settings>` (key/value store) and reference includables for rendering.

### Includables + Includes
- Define reusable templates with `<b:includable id='...'>...</b:includable>`.
- Insert them with `<b:include name='...' [data='...']/>`.
- Common names: `main` (widget body), `widget-title`, component fragments.
- `all-head-content` is a special include used in `<head>`.

### Skin + Variables
- `<b:skin><![CDATA[ ... ]]></b:skin>` contains both:
  - `<Variable>` and `<Group>` markup for theme customization (color, string, font, etc.).
  - The theme’s CSS rules (often referencing variables: `$(main.color)`).

## Minimal Theme Skeleton (Annotated)

```xml
<?xml version='1.0' encoding='UTF-8'?>
<!DOCTYPE html>
<html xmlns='http://www.w3.org/1999/xhtml'
      xmlns:b='http://www.google.com/2005/gml/b'
      xmlns:data='http://www.google.com/2005/gml/data'
      xmlns:expr='http://www.google.com/2005/gml/expr'
      b:css='false'
      b:layoutsVersion='3'
      b:responsive='true'
      b:defaultwidgetversion='2'
      b:templateVersion='1.0.0'>
  <head>
    <meta name='viewport' content='width=device-width, initial-scale=1' />
    <title><data:blog.pageName/></title>
    <b:include data='blog' name='all-head-content'/>
    <b:skin><![CDATA[
/*
<!-- Variable definitions -->
<Variable name="main.color" type="color" description="Primary Color" default="#1967D2" value="#1967D2"/>
<Variable name="body.text.color" type="color" description="Text Color" default="#333" value="#333"/>
*/

/* Base CSS starts after variables */
body { color: $(body.text.color); }
a { color: $(main.color); }
    ]]></b:skin>
  </head>
  <body>
    <!-- Header section -->
    <b:section id='header' name='Header' class='header' maxwidgets='2' showaddelement='yes'>
      <b:widget id='Header1' type='Header' title='Blog Header' version='2' visible='true'>
        <b:includable id='main'>
          <h1 class='site-title'><data:blog.title/></h1>
        </b:includable>
      </b:widget>
    </b:section>

    <!-- Content section with blog posts widget -->
    <b:section id='content' name='Content' class='content' maxwidgets='5' showaddelement='yes'>
      <b:widget id='Blog1' type='Blog' title='Blog Posts' version='2' visible='true'>
        <b:includable id='main'>
          <b:loop values='data:posts' var='post'>
            <article class='post'>
              <h2><a expr:href='data:post.url'><data:post.title/></a></h2>
              <div class='entry'><data:post.body/></div>
            </article>
          </b:loop>
        </b:includable>
      </b:widget>
    </b:section>

    <!-- Sidebar links -->
    <b:section id='sidebar' name='Sidebar' class='sidebar' maxwidgets='10' showaddelement='yes'>
      <b:widget id='LinkList1' type='LinkList' title='Links' version='2' visible='true'>
        <b:widget-settings>
          <b:widget-setting name='sorting'>NONE</b:widget-setting>
          <b:widget-setting name='shownum'>5</b:widget-setting>
        </b:widget-settings>
        <b:includable id='main'>
          <ul class='link-list'>
            <b:loop values='data:links' var='l'>
              <li><a expr:href='data:l.target'><data:l.name/></a></li>
            </b:loop>
          </ul>
        </b:includable>
      </b:widget>
    </b:section>

    <!-- Footer -->
    <b:section id='footer' name='Footer' class='footer' maxwidgets='2' showaddelement='yes'/>
  </body>
</html>
```

This is intentionally minimal: one header widget, one posts widget, one list widget, a few variables, and CSS using variables.

## Sections In Depth

- Purpose: define layout regions the Blogger Layout editor can target.
- Put semantic HTML around sections for structure (e.g., `<header>`, `<main>`, `<aside>`, `<footer>`). Blogger doesn’t require it but it improves SEO/accessibility.
- Common patterns:
  - `header`: logo, site title, nav.
  - `content`: blog posts or static content, hero, featured area.
  - `sidebar`: lists, ads, profile, labels.
  - `footer`: copyright, links, widgets.
- Example with conditional visibility:

```xml
<b:section id='hero' name='Hero' class='hero' maxwidgets='1' showaddelement='yes'>
  <b:if cond='data:view.isHomepage'>
    <b:widget id='HTML1' type='HTML' title='Hero' visible='true'>
      <b:includable id='main'>
        <div class='hero-box'>Welcome to our blog!</div>
      </b:includable>
    </b:widget>
  </b:if>
</b:section>
```

## Widgets In Depth

- Built-in types you’ll see frequently:
  - `Blog` (posts), `HTML` (raw HTML/JS), `Text` (text block), `LinkList` (menu/links), `Label` (tags), `BlogArchive`, `Profile`, `PopularPosts`, `FeaturedPost`.
- Important attributes:
  - `visible='true'` toggles rendering.
  - `locked='true'` prevents deletion from Layout.
  - `version='2'` is common for modern templates.
- Settings: arbitrary key/value strings inside `<b:widget-settings>`.
- Snippet: Custom HTML widget showing a promo card only on post pages:

```xml
<b:widget id='HTMLPromo' type='HTML' title='Promo' version='2' visible='true'>
  <b:includable id='main'>
    <b:if cond='data:view.isPost'>
      <aside class='promo'>
        <h3>Special Offer</h3>
        <p>Use code BLOG10 at checkout.</p>
      </aside>
    </b:if>
  </b:includable>
</b:widget>
```

## Includables + Composition Patterns

- `b:includable` is like a named template. Widgets often define:
  - `id='main'` for their core markup.
  - `id='widget-title'` for standard title handling.
- `b:include` inserts an includable by `name` and may pass `data` (context object).
- Example: shared widget title includable and reuse across widgets.

```xml
<b:includable id='widget-title' var='this'>
  <b:if cond='data:this.title'>
    <h3 class='widget-title'><data:this.title/></h3>
  </b:if>
</b:includable>

<b:widget id='HTML2' type='HTML' title='About' version='2' visible='true'>
  <b:includable id='main' var='this'>
    <b:include name='widget-title' data='this'/>
    <div class='about'>Short about text…</div>
  </b:includable>
</b:widget>
```

## Variables + Skin Best Practices

- Variable types: `color`, `string`, `font`, `background`, and more.
- Good hygiene:
  - Group related variables under `<Group>` with `description` and `selector`.
  - Keep defaults sensible; ensure `value` matches current design.
  - Use variables in CSS so users can tune the theme without editing CSS.
- Example:

```css
/* Inside <b:skin> CDATA */
/*
<Group description="Brand" selector=":root">
  <Variable name="brand.color" type="color" description="Brand Color" default="#0a84ff" value="#0a84ff"/>
  <Variable name="brand.text" type="color" description="Brand Text" default="#111" value="#111"/>
</Group>
*/

:root {
  --brand-color: $(brand.color);
  --brand-text: $(brand.text);
}
```

## Expressions + Page Context

- Common flags on `data:view`:
  - `isHomepage`, `isPost`, `isPage`, `isArchive`, `isLabelSearch`, `isSearch`, `isLayoutMode`.
- Useful data:
  - `data:blog.title`, `data:blog.homepageUrl`, `data:view.url.canonical`, `data:posts` (loop), `data:post.*` fields.
- Examples:

```xml
<a expr:href='data:blog.homepageUrl'>Home</a>
<b:if cond='data:view.isHomepage'>…</b:if>
<b:loop values='data:posts' var='post'>
  <a expr:href='data:post.url'><data:post.title/></a>
</b:loop>
```

## Building A Theme From Scratch (Step By Step)

1. Start with skeleton
   - Create `<html>` with namespaces and `<head>` containing `all-head-content` and a minimal `<b:skin>`.
2. Define variables + CSS
   - Add a few color and font variables; use them in global CSS rules.
3. Add sections
   - `header`, `content`, `sidebar`, `footer` as `<b:section>` with sensible `id`/`name`.
4. Add core widgets
   - `Header` widget for the site title/logo; `Blog` widget for posts; `LinkList` for navigation.
5. Add includables for reusable bits
   - A `widget-title` template and any post card/loop templates.
6. Page-specific features
   - Homepage hero (`b:if cond='data:view.isHomepage'`).
   - Breadcrumbs on post pages (`b:if cond='data:view.isPost'`).
7. Enhance with styles + JS
   - Include Google Fonts, icon fonts, and any third-party CSS via `<link>`. Keep heavy JS conditional or deferred.
8. Validate + iterate
   - Upload to Blogger (Theme → Restore → Upload), preview, test labels/search/archive views.
   - Tweak variables for the theme editor.

### Example: Adding A Featured Area On Homepage Only

```xml
<b:section id='featured' name='Featured' class='featured' maxwidgets='1' showaddelement='yes'>
  <b:if cond='data:view.isHomepage'>
    <b:widget id='HTMLFeatured' type='HTML' title='Featured' version='2' visible='true'>
      <b:includable id='main'>
        <div class='featured-grid'>
          <div class='card'>Highlight 1</div>
          <div class='card'>Highlight 2</div>
        </div>
      </b:includable>
    </b:widget>
  </b:if>
</b:section>
```

### Example: Basic Sidebar With Labels + Archive

```xml
<b:section id='sidebar' name='Sidebar' class='sidebar' maxwidgets='10' showaddelement='yes'>
  <b:widget id='Label1' type='Label' title='Labels' version='2' visible='true'>
    <b:includable id='main'>
      <div class='labels'>
        <b:loop values='data:labels' var='label'>
          <a expr:href='data:label.url'><data:label.name/></a>
        </b:loop>
      </div>
    </b:includable>
  </b:widget>

  <b:widget id='BlogArchive1' type='BlogArchive' title='Archive' version='2' visible='true'>
    <b:includable id='main'>
      <ul class='archive'>
        <b:loop values='data:archives' var='arc'>
          <li><a expr:href='data:arc.url'><data:arc.name/></a></li>
        </b:loop>
      </ul>
    </b:includable>
  </b:widget>
</b:section>
```

## Page Types And Layout Strategy

- Homepage: hero, featured posts/sections, condensed post cards.
- Post page: full post body, author box, related posts, comments.
- Static page: focus on content; fewer widgets.
- Archive/label/search: lists and filters; consider distinct layout CSS.

Use `b:if` to toggle sections or widgets for each page type; keep the DOM lean to improve performance.

## Performance + Quality Tips

- Limit blocking CSS/JS; use CDNs for common assets.
- Keep image sizes reasonable; use responsive images when possible.
- Reuse includables for repeated markup.
- Prefer CSS variables backed by Blogger `<Variable>`s for easy theming.
- Validate theme upload errors promptly; expression and namespace issues surface there.

## Debugging + Validation

- If Blogger rejects upload: check for malformed XML, unclosed tags, unknown attributes, or invalid expressions.
- Use the Blogger Theme editor preview; inspect element in the browser to confirm widget output.
- For tricky templates, comment sections of the layout to isolate problems.

## Mapping To This Project’s Workflow

- Unpack → edit modular files → pack → validate. See `docs/scripts.md`.
- Structural elements become labeled placeholders in `main.html` during unpacking:
  - `SECTION sections/...`, `WIDGET widgets/...`, `INCLUDABLE includables/defs/...`, `INLINE_STYLE inline-styles/...`, `SCRIPT script-N (head|body)`.
- These labels are clickable paths in most editors and point to the fragment you should edit.

With these building blocks and patterns, you can design robust, maintainable Blogger themes while keeping a clean separation between structure, behavior, and presentation.

