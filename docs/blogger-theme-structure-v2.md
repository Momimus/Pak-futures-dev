# Blogger Theme Structure: A Comprehensive Guide

This document provides a comprehensive, end-to-end guide on how to understand, build, and customize a modern Blogger theme. We will cover the core XML structure, the data binding system, layout concepts (sections and widgets), and the step-by-step process of assembling a theme from scratch.

This guide is intended for developers and designers who are comfortable with HTML and CSS and want to gain a deep understanding of Blogger's theming engine.

## 1. Introduction

### What is a Blogger Theme?

A Blogger theme is a single **XML file** that dictates the entire structure, layout, and appearance of a Blogger blog. It's not just a set of HTML and CSS files; it's a template that intelligently combines:

* **XHTML:** The static markup that defines the skeleton of your site.
* **Blogger-specific XML Tags:** A set of custom tags (using the `b:` namespace) that provide logic, layouts, and placeholders.
* **Data Expressions:** A system (using `data:` and `expr:` namespaces) for pulling in and displaying blog content (like posts, titles, and settings).
* **CSS:** All of your theme's styles, which are embedded within a special `<b:skin>` tag.
* **JavaScript:** Any client-side logic, also embedded within the XML.

The Blogger platform *parses* this single XML file, executes the logic, fetches the data, and renders a complete HTML page for the end-user.

### Who is this Guide For?

* **Web Designers** wanting to create custom Blogger templates for clients.
* **Bloggers with HTML/CSS skills** who want to move beyond the visual Customizer.
* **Developers** who need to maintain or reverse-engineer an existing Blogger theme.

## 2. Prerequisites

Before you begin, you should have a solid understanding of:

* **HTML:** You must be comfortable with all standard HTML5 tags (`<header>`, `<main>`, `<article>`, `<div>`, etc.).
* **CSS:** You need strong CSS skills to style your theme.
* **XML (Basics):** You should understand the basic syntax of XML, such as opening/closing tags, attributes, and the concept of namespaces. You don't need to be an expert, but you must be precise with your syntax.

---

## 3. The Core Anatomy of a Blogger Theme

At the highest level, a Blogger theme is an XML document. The root element is `<html>`, and it must declare several **namespaces** (xmlns) to tell Blogger's parser how to interpret the tags.

### 3.1. The XML + Namespaces

Your theme's `<html>` tag will always look similar to this:

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE html>
<html xmlns='[http://www.w3.org/1999/xhtml](http://www.w3.org/1999/xhtml)'
      xmlns:b='[http://www.google.com/2005/gml/b](http://www.google.com/2005/gml/b)'
      xmlns:data='[http://www.google.com/2005/gml/data](http://www.google.com/2005/gml/data)'
      xmlns:expr='[http://www.google.com/2005/gml/expr](http://www.google.com/2005/gml/expr)'
      b:css='true'
      b:layoutsVersion='3'
      b:responsive='true'
      b:defaultwidgetversion='2'
      b:templateVersion='1.0.0'>
  </html>
````

  * **`xmlns="http://www.w3.org/1999/xhtml"`**: The default namespace. This means any tag without a prefix (like `<div>`, `<head>`) is treated as standard XHTML.
  * **`xmlns:b="..."`**: The **Blogger namespace**. This is for structural tags that create layouts and widgets, like `<b:section>` and `<b:widget>`.
  * **`xmlns:data="..."`**: The **Data namespace**. This is used to *access* blog data, like `data:blog.title` or `data:post.body`.
  * **`xmlns:expr="..."`**: The **Expression namespace**. This is used to *assign* data to HTML attributes, like `<a expr:href='data:post.url'>`.

### 3.2. Root `<html>` Attributes

The `<html>` tag has several important `b:` attributes that configure the theme's behavior:

  * **`b:css='true'`**: A boolean. If `'true'` (default), Blogger will automatically include its default widget CSS. If `'false'`, you are responsible for styling *everything*, including the admin navbar. Most modern themes set this to `'false'` for full control.
  * **`b:layoutsVersion='3'`**: This specifies you are using the modern "Layouts" system (the drag-and-drop admin UI). Always use `'3'`.
  * **`b:responsive='true'`**: Signals to Blogger that your theme is responsive, which can affect how mobile views are handled.
  * **`b:defaultwidgetversion='2'`**: Sets the default version for any new widgets added. Version 2 widgets are more modern and flexible.
  * **`b:templateVersion='1.0.0'`**: Your theme's own version number.

### 3.3. The Data Namespace (`data:`)

This is your read-only library of all blog information. You use it in your HTML to print data.

  * `data:blog.title` prints the blog's title.
  * `data:post.body` prints the post's content.
  * `data:view.isHomepage` is a boolean (`true` or `false`) you can use for logic.

### 3.4. The Expression Namespace (`expr:`)

This is your tool for *binding* data to HTML attributes. You can't just write `<a href="data:post.url">...</a>`. The server wouldn't understand it. Instead, you use `expr:` to tell the server to evaluate the data.

```xml
<a expr:href='data:post.url'>
  <data:post.title/>
</a>

<a href='data:post.url'>
  ...
</a>
```

-----

## 4\. Minimal Theme Skeleton (Annotated)

This is a bare-bones, working theme. You can copy this, save it as `theme.xml`, and upload it to a test blog.

```xml
<?xml version='1.0' encoding='UTF-8'?>
<!DOCTYPE html>
<html xmlns='[http://www.w3.org/1999/xhtml](http://www.w3.org/1999/xhtml)'
      xmlns:b='[http://www.google.com/2005/gml/b](http://www.google.com/2005/gml/b)'
      xmlns:data='[http://www.google.com/2005/gml/data](http://www.google.com/2005/gml/data)'
      xmlns:expr='[http://www.google.com/2005/gml/expr](http://www.google.com/2005/gml/expr)'
      b:css='false'
      b:layoutsVersion='3'
      b:responsive='true'
      b:defaultwidgetversion='2'
      b:templateVersion='1.0.0'>

  <head>
    <meta name='viewport' content='width=device-width, initial-scale=1' />
    
    <title>
      <b:if cond='data:view.isHomepage'><data:blog.title/>
      <b:elseif cond='data:view.isPost or data:view.isPage'/><data:blog.pageName/> - <data:blog.title/>
      <b:else/><data:blog.pageTitle/>
      </b:if>
    </title>
    
    <b:include data='blog' name='all-head-content'/>
    
    <b:skin><![CDATA[
      /*
      <Variable name="main.color" type="color" description="Primary Color" default="#1967D2" value="#1967D2"/>
      <Variable name="body.text.color" type="color" description="Text Color" default="#333" value="#333"/>
      */

      /* Base CSS starts after variables */
      body {
        font-family: sans-serif;
        background: #fff;
        color: $(body.text.color);
      }
      a {
        color: $(main.color);
      }
      .header, .content, .sidebar, .footer {
        max-width: 960px;
        margin: 20px auto;
        padding: 10px;
      }
      .sidebar {
        border-left: 1px solid #eee;
      }
    ]]></b:skin>
  </head>
  
  <body>
    <b:section id='header' name='Header' class='header' maxwidgets='1' showaddelement='yes'>
      <b:widget id='Header1' type='Header' title='My Blog' version='2' visible='true'>
        <b:includable id='main'>
          <h1 class='site-title'>
            <a expr:href='data:blog.homepageUrl'>
              <data:blog.title/>
            </a>
          </h1>
        </b:includable>
      </b:widget>
    </b:section>

    <b:section id='content' name='Content' class='content' maxwidgets='1' showaddelement='no'>
      <b:widget id='Blog1' type='Blog' title='Blog Posts' version='2' visible='true'>
        <b:includable id='main'>
          <b:loop values='data:posts' var='post'>
            <article class='post'>
              <h2><a expr:href='data:post.url'><data:post.title/></a></h2>
              <div class='post-body entry'><data:post.body/></div>
            </article>
          </b:loop>
        </b:includable>
      </b:widget>
    </b:section>

    <b:section id='sidebar' name='Sidebar' class='sidebar' maxwidgets='10' showaddelement='yes'>
      <b:widget id='LinkList1' type='LinkList' title='Links' version='2' visible='true'>
        <b:includable id='main'>
          <ul class='link-list'>
            <b:loop values='data:links' var='link'>
              <li><a expr:href='data:link.target'><data:link.name/></a></li>
            </b:loop>
          </ul>
        </b:includable>
      </b:widget>
    </b:section>

    <b:section id='footer' name='Footer' class='footer' maxwidgets='3' showaddelement='yes'>
      <b:widget id='Text1' type='Text' title='Copyright' version='2' visible='true'>
        <b:includable id='main'>
          <p>Copyright 2025 - My Blog</p>
        </b:includable>
      </b:widget>
    </b:section>
    
  </body>
</html>
```

-----

## 5\. Layout Building Blocks: Sections & Widgets

Your theme's layout is defined by two tags: `<b:section>` and `<b:widget>`.

  * A **Section** is a container that defines a "region" in your layout (e.g., "Sidebar", "Header").
  * A **Widget** is a block of content *inside* a Section (e.g., "Labels", "Popular Posts").

The Blogger "Layout" admin page is just a UI for moving widgets between the sections you define.

### 5.1. `b:section` (Sections) In Depth

This is the main layout tag. It creates a drop-target in the Layout editor.

```xml
<aside class='sidebar-wrapper'>
  <b:section id='sidebar' name='Sidebar' class='sidebar' maxwidgets='8' showaddelement='yes'>
    </b:section>
</aside>
```

**Common `b:section` Attributes:**

| Attribute | Description |
| :--- | :--- |
| **`id`** | **(Required)** A unique name for the section. This is the *most important* attribute. It must be unique within the theme. |
| **`name`** | **(Required)** The human-readable name shown in the Layout editor (e.g., "Sidebar (Top)"). |
| `class` | A CSS class to be added to the rendered container. Blogger often wraps sections in a `div`, so this class will be applied to it. |
| `maxwidgets` | The maximum number of widgets this section can hold. |
| `showaddelement` | `yes` or `no`. Controls if the "Add a Gadget" link appears in the Layout editor. |
| `growth` | `horizontal` or `vertical` (default). Used for rare cases like the `Navbar` widget. |

> **Best Practice:** Wrap your `<b:section>` tags in semantic HTML (`<header>`, `<main>`, `<aside>`, `<footer>`). This gives you styling and accessibility control. The section tag *itself* only renders its widgets and a simple wrapper `div`.

### 5.2. `b:widget` (Widgets) In Depth

This tag defines a default piece of content. When you add a widget in the theme XML, it appears by default. A user can remove it *unless* you lock it.

```xml
<b:section id='header' name='Header' class='header' maxwidgets='1' showaddelement='yes'>
  
  <b:widget id='Header1' type='Header' title='My Blog' version='2' visible='true' locked='true'>
    <b:includable id='main'>
      ...
    </b:includable>
  </b:widget>
  
</b:section>
```

**Common `b:widget` Attributes:**

| Attribute | Description |
| :--- | :--- |
| **`id`** | **(Required)** A unique ID for this widget (e.g., `Header1`, `Blog1`, `LinkList12`). Must be unique. |
| **`type`** | **(Required)** The type of widget. This is the most important part, as it determines what `data:` is available inside it. |
| `visible` | `true` or `false`. Controls if the widget renders. |
| `locked` | `true` or `false`. If `true`, the user *cannot* remove or move this widget from the Layout editor. Essential for core widgets like `Blog1` or `Header1`. |
| `title` | The default title for the widget. Can be overridden by the user. |
| `version` | `1` or `2`. Always use `2` for modern themes. |
| `data` | Advanced: An object of data to pass to the widget's includables. |

**Common Widget Types (`type`):**

| Type | Description | Key Data Available |
| :--- | :--- | :--- |
| `Blog` | **The most important widget.** Renders your posts. | `data:posts`, `data:post` (in loop) |
| `Header` | Displays the blog title and description. | `data:blog.title`, `data:blog.description` |
| `HTML` | A blank slate for any HTML, CSS, or JavaScript. | `data:content` (the raw HTML) |
| `Text` | A simple text box. | `data:content` |
| `LinkList` | Renders a list of links (a menu). | `data:links`, `data:link` (in loop) |
| `Label` | Renders a list of all blog labels (tags). | `data:labels`, `data:label` (in loop) |
| `BlogArchive` | Renders the archive tree. | `data:archives`, `data:archive` (in loop) |
| `PopularPosts` | Displays a list of popular posts. | `data:posts`, `data:post` (in loop) |
| `Profile` | Displays the blog author's profile. | `data:user` |
| `FeaturedPost`| Displays a single post you select. | `data:post` |

-----

## 6\. The Brains: Data, Expressions, and Control Flow

Blogger's "magic" comes from its data-binding and control flow tags. These allow your single XML file to render many different pages (homepage, post page, archive page) correctly.

### 6.1. Control Flow Tags

These `b:` tags let you add logic to your theme.

#### `b:if` / `b:elseif` / `b:else`

This is the most common tag you'll use. It conditionally renders a block of HTML.

```xml
<b:if cond='data:view.isHomepage'>
  <div class='hero-banner'>...</div>
<b:elseif cond='data:view.isPost'/>
  <div class='post-meta'>...</div>
<b:else/>
  <div class='page-title-bar'>...</div>
</b:if>
```

#### `b:loop`

This iterates over a list of data (like posts or labels) and repeats a block of HTML for each item.

  * `values`: The data list to iterate (e.g., `data:posts`).
  * `var`: The name to give the *current item* in the loop (e.g., `post`).

<!-- end list -->

```xml
<b:loop values='data:posts' var='post'>
  <article class='post-preview'>
    <h2><a expr:href='data:post.url'><data:post.title/></a></h2>
    <p><data:post.snippet/></p>
  </article>
</b:loop>
```

You can also get the loop index:

```xml
<b:loop values='data:posts' var='post' index='i'>
  <div class='post-index'><data:i/></div> <article>...</article>
</b:loop>
```

#### `b:with`

This is a utility tag for creating a new variable, usually to shorten a long data path or to store the result of a complex expression.

```xml
<b:if cond='data:widget.settings.style.showImage and data:widget.settings.style.imageSize == "large"'>
  ...
</b:if>

<b:with value='data:widget.settings.style' var='style'>
  <b:if cond='data:style.showImage and data:style.imageSize == "large"'>
    ...
  </b:if>
</b:with>
```

### 6.2. Common Data: `data:blog`

This global object contains blog-wide information. Available everywhere.

| Data Key | Example Value | Description |
| :--- | :--- | :--- |
| `data:blog.title` | "My Awesome Blog" | The title of the blog. |
| `data:blog.homepageUrl` | "https://www.google.com/search?q=https://myblog.blogspot.com/" | The full URL to the homepage. |
| `data:blog.url` | (varies) | The canonical URL for the *current* page. |
| `data:blog.pageTitle` | "Posts labeled 'Gadgets'" | The full title for the current page. |
| `data:blog.pageName` | "My First Post" | The title of the current post or page. |
| `data:blog.blogId` | "1234567890" | The unique ID for the blog. |
| `data:blog.language.direction`| "ltr" | The language direction ('ltr' or 'rtl'). |
| `data:blog.encoding` | "UTF-8" | The blog's character encoding. |

### 6.3. View Context: `data:view`

This global object tells you *what kind of page* you are currently on. This is the key to conditional logic.

| Data Key | Type | Description |
| :--- | :--- | :--- |
| `data:view.isHomepage` | Boolean | `true` if on the main homepage. |
| `data:view.isPost` | Boolean | `true` if on an individual post page. |
\*| `data:view.isPage` | Boolean | `true` if on a standalone "Page" (not a post). |
| `data:view.isItem` | Boolean | `true` if `isPost` OR `isPage`. |
| `data:view.isArchive` | Boolean | `true` if on a date-based archive page. |
| `data:view.isLabelSearch`| Boolean | `true` if on a label search results page. |
| `data:view.isSearch` | Boolean | `true` if on a general search results page. |
| `data:view.isError` | Boolean | `true` if on the 404 error page. |
| `data:view.isLayoutMode` | Boolean | `true` if you are currently in the "Layout" admin UI. |
| `data:view.search.query` | String | The user's search term (on search pages). |
| `data:view.search.label` | String | The label name (on label search pages). |

### 6.4. Post Data: `data:post`

This object is available *inside* a `<b:loop values='data:posts'>` or *globally* on a post page (`data:view.isPost`).

| Data Key | Example Value | Description |
| :--- | :--- | :--- |
| `data:post.url` | ".../2025/11/my-first-post.html" | The canonical URL of the post. |
| `data:post.title` | "My First Post" | The post title. |
| `data:post.body` | "\<p\>This is the full post...\</p\>" | The complete HTML content of the post. |
| `data:post.snippet` | "This is the first part..." | A short snippet, often used on home/archive pages. |
| `data:post.author` | "Admin" | The display name of the post author. |
| `data:post.timestamp` | "11/11/25" | The formatted post date. |
| `data:post.labels` | (List) | A list of label objects. Loop with `<b:loop values='data:post.labels' var='label'>`. |
| `data:post.labels.first.name`| "Gadgets" | The name of the *first* label (if it exists). |
| `data:post.thumbnailUrl` | ".../s72-c/image.jpg" | A URL to a small thumbnail (if available). |
| `data:post.featuredImage` | ".../s1600/image.jpg" | The full-size featured image (if available). |
| `data:post.id` | "987654321" | The unique ID for the post. |

### 6.5. Advanced Expressions: Operators & Lambdas

You can do more than just print data. The `cond` and `expr` attributes can evaluate complex expressions.

  * **Logical Operators:** Use `and`, `or`, `not`.

    ```xml
    <b:if cond='data:view.isPost and data:post.author == "Admin"'>
      ...
    </b:if>
    ```

  * **Ternary Operator:** A one-line if/else statement.

    ```xml
    <div expr:class='data:label.name == "Tech" ? "dark" : "light"'>
      ...
    </div>
    ```

  * **Lambda Operator (`=>`):** Used for array/list transformations.

    ```xml
    <b:with value='data:post.labels map (l => l.name)' var='labelNames'/>

    <b:with value='data:post.labels find (l => l.name == "Featured")' var='featuredLabel'/>

    <img expr:src='data:post.featuredImage resizeImage 800'/>
    ```

-----

## 7\. Reusability & Modularity: Includables

If `<b:section>` and `<b:widget>` are the *layout*, then `<b:includable>` and `<b:include>` are the *functions*. They are the most powerful part of Blogger theming, allowing you to create reusable components.

  * **`<b:includable id='...'>`**: Defines a reusable template "snippet."
  * **`<b:include name='...'/>`**: Calls and renders that snippet.

### 7.1. Defining with `b:includable`

An includable is a block of markup with a unique `id`. It's almost always defined *inside* a `<b:widget>`.

Every widget *must* have an includable with `id='main'` to be rendered.

```xml
<b:widget id='HTML1' type='HTML' ...>
  <b:includable id='main'>
    <h2><data:widget.title/></h2>
    <div><data:widget.content/></div>
  </b:includable>
  
  <b:includable id='my-other-snippet'>
    <p>This is a reusable part.</p>
  </b:includable>
</b:widget>
```

### 7.2. Using with `b:include`

The `<b:include>` tag calls an includable by its `name` (which matches the `id`).

```xml
<b:widget id='HTML1' type='HTML' ...>
  <b:includable id='main'>
    <b:include name='my-other-snippet'/>
    <b:include name='my-other-snippet'/>
  </b:includable>
  
  <b:includable id='my-other-snippet'>
    <p>This is a reusable part.</p>
  </b:includable>
</b:widget>
```

**Global vs. Local:**

  * An include *within* a widget (like above) first looks for an includable with that `name` *inside the same widget*.
  * If it doesn't find it, it looks *globally* (outside any widgets, usually at the top level of `<body>`).

### 7.3. The `var` Attribute and Data Scoping

An includable can define its own `var` (e.g., `var='this'`). This creates a local-scoped variable for the data inside it, making it cleaner.

You can pass new data to an include using the `data` attribute.

### 7.4. Composition Example: A Reusable Widget Frame

This is the most common and powerful pattern.

1.  **Define a global "frame" includable:**

    ```xml
    <b:includable id='widget-frame' var='this'>
      <div class='widget-box'>
        <b:if cond='data:this.title'>
          <h3 class='widget-title'><data:this.title/></h3>
        </b:if>
        <div class='widget-content'>
          <b:include name='this.content' data='this.data'/>
        </div>
      </div>
    </b:includable>
    ```

2.  **Use this frame inside your widgets:**

    ```xml
    <b:widget id='LinkList1' type='LinkList' ...>
      <b:includable id='main' var='this'>
        <b:include name='widget-frame' 
                   data='{ title: data:this.title, 
                           content: "actual-content", 
                           data: data:this }' />
      </b:includable>
      
      <b:includable id='actual-content' var='this'>
        <ul>
          <b:loop values='data:this.links' var='link'>
            <li><a expr:href='data:link.target'><data:link.name/></a></li>
          </b:loop>
        </ul>
      </b:includable>
    </b:widget>

    <b:widget id='Label1' type='Label' ...>
      <b:includable id='main' var='this'>
        <b:include name='widget-frame' 
                   data='{ title: data:this.title, 
                           content: "actual-content", 
                           data: data:this }' />
      </b:includable>
      
      <b:includable id='actual-content' var='this'>
        <div class='label-cloud'>
          <b:loop values='data:this.labels' var='label'>
            <a expr:href='data:label.url'><data:label.name/></a>
          </b:loop>
        </div>
      </b:includable>
    </b:widget>
    ```

This pattern keeps your HTML dry. You only define the "widget box" markup *once*.

-----

## 8\. The `Blog` Widget: The Heart of the Theme

The widget with `type='Blog'` (usually `id='Blog1'`) is the most important and complex widget. It's responsible for rendering all your posts. You **must** have *exactly one* `Blog` widget in your theme.

### 8.1. Why `Blog1` is Special

The `Blog` widget's `main` includable behaves differently depending on the page view:

  * **On the homepage (`isHomepage`):** It loops through `data:posts` (e.g., the 10 most recent) and renders the `post` includable for each.
  * **On a post page (`isPost`):** It *does not loop*. It just renders the `post` includable *once* for the *single* `data:post` object.
  * **On an archive page (`isArchive`):** It loops through the posts for that month/label, just like the homepage.

### 8.2. Core `Blog` Widget Includables

You customize the `Blog` widget by overriding its *many* default includables.

| Includable ID | Description |
| :--- | :--- |
| `main` | The main entry point. By default, it just loops or calls `post`. |
| `post` | Renders a single post. This is the one you'll customize most. |
| `post-body` | Renders the `data:post.body` content. |
| `post-footer` | Renders the post footer (timestamp, labels, comments link). |
| `comments` | Renders the entire comment block, form, and list. |
| `comment-form` | The "Post a comment" form. |
| `post-snippet` | Renders the `data:post.snippet` (used on `main` page). |

### 8.3. Customizing the Post Loop

A common pattern is to show a *snippet* on the homepage but the *full body* on the post page.

```xml
<b:widget id='Blog1' type='Blog' locked='true' ...>
  <b:includable id='main'>
    <b:if cond='data:view.isMultipleItems'>
      <b:loop values='data:posts' var='post'>
        <b:include name='post' data='post'/>
      </b:loop>
    <b:else/>
      <b:include name='post' data='post'/>
    </b:if>
  </b:includable>

  <b:includable id='post' var='post'>
    <article class='post'>
      <h2><a expr:href='data:post.url'><data:post.title/></a></h2>
      
      <div class='post-content'>
        <b:if cond='data:view.isItem'>
          <data:post.body/>
        <b:else/>
          <data:post.snippet/>
          <a expr:href='data:post.url' class='read-more'>Read More</a>
        </b:if>
      </div>
      
      <b:include name='post-footer' data='post'/>
    </article>
    
    <b:if cond='data:view.isItem'>
      <b:include name='comments' data='post'/>
    </b:if>
  </b:includable>

  <b:includable id='post-footer' var='post'>
    <footer class='post-footer'>
      <span class='timestamp'><data:post.timestamp/></span>
      <b:if cond='data:post.labels'>
        <span class='labels'>
          <b:loop values='data:post.labels' var='label'>
            <a expr:href='data:label.url'><data:label.name/></a>
          </b:loop>
        </span>
      </b:if>
    </footer>
  </b:includable>

  </b:widget>
```

-----

## 9\. Styling: The `b:skin` Tag & Variables

All of your theme's CSS, plus the variable definitions for the "Theme Customizer" UI, live inside the `<b:skin>` tag.

### 9.1. Structure of `b:skin`

It's a `CDATA` block, which tells the XML parser to *ignore* the content inside it (so CSS characters like `>` don't break the XML).

```xml
<b:skin><![CDATA[
  /*
  <Group description="Colors" selector="body">
    <Variable name="main.color" type="color" ... />
  </Group>
  */

  /* 2. Your actual CSS rules go here */
  body {
    color: #333;
  }
  
  a {
    color: $(main.color); /* Using the variable */
  }
]]></b:skin>
```

### 9.2. Defining Variables (`<Variable>`)

This XML defines a field in the Theme Customizer.

**Common `<Variable>` Attributes:**

| Attribute | Description |
| :--- | :--- |
| `name` | **(Required)** The unique variable name (e.g., `body.text.color`). |
| `description` | The human-readable label shown in the Customizer. |
| `type` | The type of UI control: `color`, `font`, `string`, `background`, `length`. |
| `default` | The default value if the user hasn't changed it. |
| `value` | The *current* saved value. This is what you should use as the "default" when designing. |

**Variable Types (`type`):**

| Type | Description | Example |
| :--- | :--- | :--- |
| `color` | A color picker. | `default="#ffffff"` |
| `string` | A simple text input. | `default="Hello"` |
| `font` | A complex font picker (family, size, weight, style). | `default="normal normal 16px Arial, sans-serif"` |
| `background` | A complex background picker (color, image, repeat). | `default="transparent none repeat scroll 0% 0%"` |
| `length` | A text input for pixel, em, or % values. | `default="960px"` |

### 9.3. Grouping Variables (`<Group>`)

You can group related variables together in the Customizer UI using the `<Group>` tag.

```xml
/*
<Group description="Brand Colors" selector=":root">
  <Variable name="brand.primary" type="color" ... />
  <Variable name="brand.secondary" type="color" ... />
</Group>

<Group description="Typography" selector="body">
  <Variable name="body.font" type="font" ... />
  <Variable name="heading.font" type="font" ... />
</Group>
*/
```

### 9.4. Using Variables in CSS

To use a variable in your CSS, you use the `$(variable.name)` syntax.

```css
/* This is NOT CSS Custom Property syntax! */
/* It is a pre-processor directive. */

h1, h2, h3 {
  font: $(heading.font);
}
body {
  font: $(body.font);
  background: $(brand.primary);
}
```

When Blogger renders the page, it will *replace* `$(heading.font)` with the user's saved value (e.g., `"bold 24px 'Open Sans', sans-serif"`) *before* serving the CSS.

### 9.5. Best Practice: Bridging to CSS Custom Properties

The `$(var)` syntax is old. A much more powerful, modern approach is to use Blogger variables to *set* CSS Custom Properties (CSS Variables).

```css
/*
<Group description="Colors" selector=":root">
  <Variable name="brand.color" type="color" description="Brand Color" default="#0a84ff" value="#0a84ff"/>
  <Variable name="body.text" type="color" description="Body Text" default="#333" value="#333"/>
</Group>
*/

/* 1. Define CSS variables in :root using Blogger variables */
:root {
  --brand-color: $(brand.color);
  --body-text-color: $(body.text);
  --font-sans: "Inter", -apple-system, sans-serif;
}

/* 2. Use your new CSS variables throughout your stylesheet */
body {
  color: var(--body-text-color);
  font-family: var(--font-sans);
}

a {
  color: var(--brand-color);
}
```

This gives you the best of both worlds:

1.  Users can change `$(brand.color)` in the Customizer.
2.  You get the flexibility and power of CSS variables in your stylesheet.

-----

## 10\. Building a Theme From Scratch (Step-by-Step)

1.  **Start with the Skeleton:** Copy the "Minimal Theme Skeleton" from section 4 into a file named `theme.xml`.

2.  **Define Variables & Base CSS:** Open the `<b:skin>` tag.

      * Add `<Variable>` definitions for your primary colors and fonts (e.g., `brand.primary`, `body.text`, `body.font`, `heading.font`).
      * Write your CSS reset and basic styles in `:root` and `body`, using the bridging pattern from section 9.5.

3.  **Define Layout Sections:** In the `<body>`, map out your site's structure using semantic HTML and `<b:section>` tags.

    ```xml
    <body>
      <header class='site-header'>
        <b:section id='header' name='Header' maxwidgets='1' .../>
      </header>
      
      <div class='site-content-wrapper'>
        <main class='site-content'>
          <b:section id='main-content' name='Main Content' maxwidgets='1' .../>
        </main>
        
        <aside class='site-sidebar'>
          <b:section id='sidebar' name='Sidebar' maxwidgets='10' .../>
        </aside>
      </div>
      
      <footer class='site-footer'>
        <b:section id='footer' name='Footer' maxwidgets='3' .../>
      </footer>
    </body>
    ```

4.  **Add Core Widgets:** Add the *essential* default widgets.

      * Add a `<b:widget type='Header' id='Header1' ...>` to the `header` section.
      * Add a `<b:widget type='Blog' id='Blog1' locked='true' ...>` to the `main-content` section.
      * Add a `<b:widget type='Label' id='Label1' ...>` and `<b:widget type='BlogArchive' id='BlogArchive1' ...>` to the `sidebar` section to have some content.

5.  **Refine the `Blog` Widget:** This is the biggest task.

      * Go into `Blog1`. Implement the `main` includable with the `isMultipleItems` check (see section 8.3).
      * Implement the `post` includable. Style your `article` tag, title, and metadata.
      * Implement the `post-footer` includable.
      * Test: Upload your theme. Does the homepage show snippets? Does the post page show the full body?

6.  **Handle Page-Specific Logic:** Use `data:view` to refine the layout.

      * Want a big hero image only on the homepage?
        ```xml
        <header class='site-header'>
          <b:section id='header' .../>
          
          <b:if cond='data:view.isHomepage'>
            <div class='hero'>...</div>
          </b:if>
        </header>
        ```
      * Want to hide the sidebar on static pages?
        ```xml
        <div expr:class='data:view.isPage ? "site-content-wrapper no-sidebar" : "site-content-wrapper"'>
          <main>...</main>
          
          <b:if cond='not data:view.isPage'>
            <aside>...</aside>
          </b:if>
        </div>
        ```

7.  **Iterate and Test:** Keep uploading the theme and testing *all* page types:

      * Homepage
      * Post page
      * Static page
      * Label search page
      * Date archive page
      * 404 error page

-----

## 11\. Page Types and Layout Strategy

Use `data:view` flags to conditionally show/hide elements or apply CSS classes.

  * **Homepage (`data:view.isHomepage`)**

      * Show: Hero banner, featured post widgets, snippets.
      * Hide: Full post body, detailed author bio.

  * **Post Page (`data:view.isPost`)**

      * Show: Full `data:post.body`, comments, related posts, author box.
      * Hide: Snippets, hero banner.
      * *Tip:* Use `<b:if cond='data:view.isItem'>` to target both posts *and* static pages.

  * **Static Page (`data:view.isPage`)**

      * Often has a simplified layout.
      * Hide: Post metadata (date, labels), comments, author box.
      * *Tip:* You might add a class `body-is-page` to `<body>` and use CSS to hide elements.
        `<body expr:class='"body-" + data:view.type'>`

  * **Archive/Label/Search (`isArchive`, `isLabelSearch`, `isSearch`)**

      * Show: Page title (e.g., "Showing posts for 'Gadgets'"), post snippets.
      * *Tip:* Use `<b:if cond='data:view.isMultipleItems'>` to target all "list" views (homepage, archive, search).

-----

## 12\. Adding JavaScript

You can add JavaScript to your theme, but it must be done carefully.

### 12.1. Inline vs. External Scripts

You can add scripts just like in normal HTML, but you must be careful with XML characters.

  * **External (Recommended):**

    ```xml
    <script async='async' defer='defer' src='https://path/to/my/script.js'></script>

    <script src='[https://cdn.jsdelivr.net/gh/user/repo/my.js](https://cdn.jsdelivr.net/gh/user/repo/my.js)'></script>

    </body>
    </html>
    ```

  * **Inline (Wrap in CDATA):**

    ```xml
    <script>
    //<![CDATA[
      /* Your JS code here. */
      const a = 10;
      if (a < 20) {
        console.log('Hello');
      }
    //]]>
    </script>
    ```

    The `//<![CDATA[ ... //]]>` wrapper is critical. It prevents the XML parser from choking on characters like `<` or `&`.

### 12.2. The `b:js` and `b:css` Attributes

On the `<html>` tag, you can set `b:js='false'` and `b:css='false'`.

  * `b:css='false'`: **Recommended.** Stops Blogger from auto-including widget CSS. This gives you full control but means *you* must style everything (including the admin bar `div#navbar`).
  * `b:js='false'`: **Not Recommended.** This disables Blogger's core JavaScript, which will break comments, the mobile menu (from the default `Header` widget), and other dynamic features.

### 12.3. Conditional Script Loading

You can use `b:if` to only load scripts where they are needed.

```xml
<b:if cond='data:view.isPost'>
  <script defer='defer' src='httpsV://path/to/comment-highlighter.js'></script>
</b:if>
```

-----

## 13\. Performance & Quality Best Practices

  * **Use `b:css='false'`:** Take full control of your CSS.
  * **Bridge to CSS Variables:** Use the pattern in section 9.5. It's cleaner.
  * **`async` / `defer`:** Always add `async` or `defer` to your `<script>` tags to prevent render-blocking.
  * **Optimize Images:** Use the `resizeImage` lambda operator to serve appropriately sized images.
    ```xml
    <img expr:src='data:post.featuredImage resizeImage 600'/>
    ```
  * **Lazy Load Images:** Use `loading='lazy'` on images that are below the fold.
    ```xml
    <b:loop values='data:posts' var='post' index='i'>
      <img expr:src='data:post.featuredImage resizeImage 400'
           alt='...'
           width='400'
           height='300'
           expr:loading='data:i > 2 ? "lazy" : "eager"'/> </b:loop>
    ```
  * **Keep DOM Lean:** Don't wrap elements in endless `div`s. Use semantic HTML. Use `b:if` to avoid rendering empty containers.

-----

## 14\. Debugging and Validation

### 14.1. Common Upload Errors

When you try to upload/save your theme, Blogger parses the XML. If it fails, it will give you an error.

  * **`Error parsing XML, line X, column Y: ...`**: This is a pure XML syntax error.

      * **Common Cause:** An unclosed tag (`<div>` without `</div>`).
      * **Common Cause:** An un-quoted attribute (`<div class="foo" id=bar>`).
      * **Common Cause:** A stray character like `<` or `&` in your inline CSS/JS that isn't in a `CDATA` block.
      * **Common Cause:** Using `&` in an `expr:` attribute. You must use `&amp;`.
        ```xml
        <a expr:href='data:post.url + "?foo=bar&baz=1"'>...</a>
        <a expr:href='data:post.url + "?foo=bar&amp;baz=1"'>...</a>
        ```

  * **`The widget with id 'Blog1' is required`**: You deleted the `<b:widget id='Blog1' type='Blog'>` tag. You must have one.

  * **`A widget with id 'HTML1' was not found`**: You have an includable *outside* a widget that is trying to access `data:widget.content`. All widget-related data is only available inside `<b:widget>`.

### 14.2. Runtime Debugging

  * **Theme Doesn't Look Right:** Use your browser's "Inspect Element" tool. This is your best friend. Look at the rendered HTML.
  * **Data is Missing:** Print the data object to debug it.
    ```xml
    <textarea><data:post/></textarea>
    ```
  * **Isolate Problems:** Comment out sections of your theme using XML comments (\`\`) to find the broken part.

-----

## 15\. Development Workflow (Unpack/Pack)

Editing a single, 5000-line XML file is painful. The professional workflow is:

1.  **Unpack:** Use a community-built tool (like the one this project references) to "unpack" the `theme.xml` file. This tool splits the single file into a clean folder structure:

      * `main.xml` (the skeleton)
      * `sections/header.xml`
      * `sections/sidebar.xml`
      * `widgets/Blog1.xml`
      * `widgets/Label1.xml`
      * `skin/skin.css`
      * `skin/variables.xml`

2.  **Edit:** You now edit the small, modular files, which is vastly easier and cleaner. You can use version control (Git) effectively.

3.  **Pack:** You run the "pack" script, which recombines all your modular files back into the single `theme.xml` file.

4.  **Upload:** You upload the final `theme.xml` to Blogger for testing.

This workflow is outside the scope of the theme *structure* itself, but it's the key to building and maintaining complex, high-quality themes.

```