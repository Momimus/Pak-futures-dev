#!/usr/bin/env python3
"""
Split a Blogger theme XML file into smaller, easier-to-edit pieces.

Usage:
    python scripts/unpack_theme.py path/to/theme.xml path/to/unpacked
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
import xml.etree.ElementTree as ET

HTML_NS = "http://www.w3.org/1999/xhtml"
BLOGGER_NS = "http://www.google.com/2005/gml/b"
DATA_NS = "http://www.google.com/2005/gml/data"
EXPR_NS = "http://www.google.com/2005/gml/expr"
OPTIONAL_NAMESPACES = {
    "g": "http://schemas.google.com/g/2005",
}

B_INCLUDABLE = f"{{{BLOGGER_NS}}}includable"
B_WIDGET = f"{{{BLOGGER_NS}}}widget"
B_SECTION = f"{{{BLOGGER_NS}}}section"

STRUCTURAL_EXTRACTIONS = (
    {
        "tag": B_INCLUDABLE,
        "directory": Path("includables/defs"),
        "id_attrs": ("id", "name"),
        "placeholder_kind": "includable",
        "filename_prefix": "includable",
    },
    {
        "tag": B_WIDGET,
        "directory": Path("widgets"),
        "id_attrs": ("id", "title", "type"),
        "placeholder_kind": "widget",
        "filename_prefix": "widget",
    },
    {
        "tag": B_SECTION,
        "directory": Path("sections"),
        "id_attrs": ("id", "name"),
        "placeholder_kind": "section",
        "filename_prefix": "section",
    },
)

STYLE_PLACEHOLDER_TOKEN = "__PCK_STYLES__"
PLACEHOLDER_PREFIX = "PCK_PLACEHOLDER "


def _register_namespaces() -> None:
    """Keep Blogger/Blogger data namespaces stable when we re-serialize XML."""
    ET.register_namespace("", HTML_NS)
    ET.register_namespace("b", BLOGGER_NS)
    ET.register_namespace("data", DATA_NS)
    ET.register_namespace("expr", EXPR_NS)


def _encode_placeholder(data: dict) -> str:
    """Encode metadata into a comment-safe hex payload."""
    return json.dumps(data, separators=(",", ":")).encode("utf-8").hex()


def _make_comment_placeholder(label: str, data: dict) -> ET.Element:
    """Create an ElementTree comment node that stores metadata plus a human label."""
    payload = _encode_placeholder(data)
    text = f"{label} | {PLACEHOLDER_PREFIX}{payload}"
    return ET.Comment(text)


def _qname(namespace: str, tag: str) -> str:
    return f"{{{namespace}}}{tag}"


def _ensure_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def _sanitize_identifier(raw_value: str | None, fallback: str) -> str:
    if raw_value:
        candidate = re.sub(r"[^A-Za-z0-9_.-]+", "_", raw_value.strip())
        candidate = candidate.strip("._")
        if candidate:
            return candidate
    return fallback


def _serialize_element(element: ET.Element) -> str:
    return ET.tostring(element, encoding="unicode")


def _inject_optional_namespaces(xml_text: str) -> str:
    missing: list[tuple[str, str]] = []
    for prefix, uri in OPTIONAL_NAMESPACES.items():
        if f"xmlns:{prefix}=" in xml_text:
            continue
        if re.search(rf"</?{re.escape(prefix)}:", xml_text):
            missing.append((prefix, uri))
    if not missing:
        return xml_text

    match = re.search(r"<html\b[^>]*>", xml_text, flags=re.IGNORECASE)
    if not match:
        return xml_text

    tag = match.group(0)
    additions = "".join(f' xmlns:{prefix}="{uri}"' for prefix, uri in missing)
    replacement = tag[:-1] + additions + ">"
    return xml_text.replace(tag, replacement, 1)


def _read_tree(xml_path: Path) -> ET.ElementTree:
    xml_text = xml_path.read_text(encoding="utf-8")
    xml_text = _inject_optional_namespaces(xml_text)
    parser = ET.XMLParser(target=ET.TreeBuilder(insert_comments=True))
    try:
        root = ET.fromstring(xml_text, parser=parser)
    except ET.ParseError as exc:  # pragma: no cover - defensive guard
        raise SystemExit(f"Failed to parse XML file: {exc}") from exc
    return ET.ElementTree(root)


def _extract_skin(skin_elem: ET.Element) -> str:
    """Return raw contents of the <b:skin> element and drop it from the tree."""
    raw_text = skin_elem.text or ""
    skin_elem.text = STYLE_PLACEHOLDER_TOKEN
    for child in list(skin_elem):
        skin_elem.remove(child)
    return raw_text


def _read_variable_entries(raw_skin: str) -> list[dict]:
    """
    Parse <Variable> and <Group> tags inside the <b:skin> CDATA section.

    Each entry contains:
        - type: "variable" | "comment"
        - group: optional dict describing the current <Group>
        - remaining keys mirror the attribute/value pairs from the <Variable> tag
    """
    entries: list[dict] = []
    attr_pattern = re.compile(r'([\w.\-:]+)\s*=\s*"([^"]*)"')
    token_pattern = re.compile(
        r"(<Group\b[^>]*>|</Group>|<Variable\b[^>]*/>|<!--.*?-->)", re.DOTALL
    )
    group_stack: list[dict] = []

    for token in token_pattern.findall(raw_skin):
        if token.startswith("<!--"):
            comment_text = token[4:-3].strip()
            if comment_text:
                entries.append({"entry_type": "comment", "text": comment_text})
            continue

        if token.startswith("<Group"):
            attrs = dict(attr_pattern.findall(token))
            group_stack.append(attrs)
            continue

        if token.startswith("</Group"):
            if group_stack:
                group_stack.pop()
            continue

        if token.startswith("<Variable"):
            attrs = dict(attr_pattern.findall(token))
            entry: dict = {
                "entry_type": "variable",
                "group": group_stack[-1].copy() if group_stack else None,
            }
            entry.update(attrs)
            entries.append(entry)

    return entries


def _write_variables_file(entries: list[dict], variables_path: Path) -> None:
    variables_path.write_text(
        json.dumps(entries, indent=2, ensure_ascii=True) + "\n",
        encoding="utf-8",
    )


def _strip_variable_markup(raw_skin: str) -> str:
    """Remove <Variable>/<Group> definitions from the CSS blob."""
    block_re = re.compile(
        r"/\*[^*]*<!--\s*Variable definitions\s*-->.*?\*/", re.DOTALL | re.IGNORECASE
    )
    css = block_re.sub("", raw_skin, count=1)
    css = re.sub(r"<Variable\b[^>]*/>\s*", "", css)
    css = re.sub(r"</?Group\b[^>]*>\s*", "", css)
    css = re.sub(
        r"<!--\s*(?:Variable definitions|Extra Variables)\s*-->\s*", "", css, flags=re.IGNORECASE
    )
    return css.strip() + ("\n" if css.strip() else "")


def _write_styles(css: str, css_path: Path) -> None:
    css_path.write_text(css, encoding="utf-8")


def _write_includable(include_elem: ET.Element, path: Path) -> None:
    include_str = _serialize_element(include_elem)
    path.write_text(include_str + "\n", encoding="utf-8")


def _replace_with_placeholder(root: ET.Element, target: ET.Element, payload: dict, label: str) -> bool:
    """Swap the target element with a placeholder comment while preserving ordering."""
    placeholder = _make_comment_placeholder(label, payload)
    placeholder.tail = target.tail
    for parent in root.iter():
        children = list(parent)
        for idx, child in enumerate(children):
            if child is target:
                parent.insert(idx, placeholder)
                parent.remove(target)
                return True
    return False


def _handle_head_include(head_elem: ET.Element, output_dir: Path) -> None:
    include_rel_path = Path("includables") / "all-head-content.xml"
    include_path = output_dir / include_rel_path
    include_elem = head_elem.find(f".//{_qname(BLOGGER_NS,'include')}[@name='all-head-content']")
    if include_elem is None:
        return

    _ensure_dir(include_path.parent)
    _write_includable(include_elem, include_path)
    _replace_with_placeholder(
        head_elem,
        include_elem,
        {
            "kind": "include",
            "name": "all-head-content",
            "file": include_rel_path.as_posix(),
        },
        f"INCLUDE {include_rel_path.as_posix()}",
    )


def _extract_structural_elements(root: ET.Element, output_dir: Path) -> None:
    for rule in STRUCTURAL_EXTRACTIONS:
        dir_path = output_dir / rule["directory"]
        _ensure_dir(dir_path)
        elements = list(root.iter(rule["tag"]))
        used_names: set[str] = set()
        for idx, element in enumerate(elements, start=1):
            identifier = None
            for attr in rule["id_attrs"]:
                identifier = element.attrib.get(attr)
                if identifier:
                    break
            base_name = _sanitize_identifier(identifier, f"{rule['filename_prefix']}-{idx}")
            filename = base_name
            suffix = 2
            while filename in used_names:
                filename = f"{base_name}-{suffix}"
                suffix += 1
            used_names.add(filename)
            relative_path = rule["directory"] / f"{filename}.xml"
            file_path = output_dir / relative_path
            file_path.write_text(_serialize_element(element) + "\n", encoding="utf-8")
            payload = {
                "kind": rule["placeholder_kind"],
                "file": relative_path.as_posix(),
                "identifier": identifier or filename,
            }
            label = f"{rule['placeholder_kind'].upper()} {relative_path.as_posix()}"
            _replace_with_placeholder(root, element, payload, label)


def _node_within(root: ET.Element, target: ET.Element) -> bool:
    for node in root.iter():
        if node is target:
            return True
    return False


def _extract_inline_scripts(root: ET.Element, head_elem: ET.Element | None) -> list[dict]:
    """Remove inline <script> tags and return their contents/metadata."""
    scripts: list[dict] = []
    counter = 1
    script_tag = _qname(HTML_NS, "script")

    def walk(node: ET.Element) -> None:
        nonlocal counter
        for child in list(node):
            if child.tag == script_tag and "src" not in child.attrib:
                script_id = f"script-{counter}"
                counter += 1
                code = child.text or ""
                location = "head" if head_elem is not None and _node_within(head_elem, child) else "body"
                scripts.append({"id": script_id, "code": code})
                _replace_with_placeholder(
                    root,
                    child,
                    {
                        "kind": "script",
                        "id": script_id,
                        "location": location,
                        "attrs": child.attrib,
                    },
                    f"SCRIPT {script_id} ({location})",
                )
            elif isinstance(child.tag, str):
                walk(child)

    walk(root)
    return scripts


def _extract_inline_styles(root: ET.Element, output_dir: Path) -> None:
    """Move inline <style> blocks into separate CSS files."""
    style_tag = _qname(HTML_NS, "style")
    styles_dir = output_dir / "inline-styles"
    counter = 1
    _ensure_dir(styles_dir)
    seen_names: set[str] = set()

    for element in list(root.iter(style_tag)):
        css = (element.text or "").strip("\n")
        identifier = element.attrib.get("id")
        base_name = _sanitize_identifier(identifier, f"style-{counter}")
        counter += 1
        name = base_name
        suffix = 2
        while name in seen_names:
            name = f"{base_name}-{suffix}"
            suffix += 1
        seen_names.add(name)

        relative_path = Path("inline-styles") / f"{name}.css"
        css_path = output_dir / relative_path
        css_path.write_text(css + ("\n" if css and not css.endswith("\n") else ""), encoding="utf-8")

        payload = {
            "kind": "inline-style",
            "file": relative_path.as_posix(),
            "attrs": dict(element.attrib),
        }
        label = f"INLINE_STYLE {relative_path.as_posix()}"
        _replace_with_placeholder(root, element, payload, label)


def _write_script_file(scripts: list[dict], script_path: Path) -> None:
    if not scripts:
        script_path.write_text("// No inline <script> blocks were extracted.\n", encoding="utf-8")
        return

    with script_path.open("w", encoding="utf-8") as handle:
        for entry in scripts:
            handle.write(f"// [SCRIPT:{entry['id']}]\n")
            code = entry["code"] or ""
            handle.write(code)
            if code and not code.endswith("\n"):
                handle.write("\n")
            handle.write("// [END SCRIPT]\n\n")


def _write_main_file(tree: ET.ElementTree, destination: Path) -> None:
    body = ET.tostring(tree.getroot(), encoding="unicode")
    header = "<?xml version='1.0' encoding='UTF-8'?>\n<!DOCTYPE html>\n"
    destination.write_text(header + body + "\n", encoding="utf-8")


def unpack_theme(xml_path: Path, output_dir: Path) -> None:
    if not xml_path.exists():
        raise SystemExit(f"XML file not found: {xml_path}")

    _ensure_dir(output_dir)
    _ensure_dir(output_dir / "includables")
    _register_namespaces()

    tree = _read_tree(xml_path)
    root = tree.getroot()
    head_elem = root.find(_qname(HTML_NS, "head"))
    _body_elem = root.find(_qname(HTML_NS, "body"))

    if head_elem is None or _body_elem is None:
        raise SystemExit("Expected <head> and <body> elements in the Blogger theme.")

    skin_elem = head_elem.find(f".//{_qname(BLOGGER_NS, 'skin')}")
    if skin_elem is None:
        raise SystemExit("Could not find <b:skin> inside the theme head.")

    raw_skin = _extract_skin(skin_elem)
    variable_entries = _read_variable_entries(raw_skin)
    _write_variables_file(variable_entries, output_dir / "variables.json")
    css = _strip_variable_markup(raw_skin)
    _write_styles(css, output_dir / "styles.css")

    _handle_head_include(head_elem, output_dir)

    _extract_structural_elements(root, output_dir)
    _extract_inline_styles(root, output_dir)

    scripts = _extract_inline_scripts(root, head_elem)
    _write_script_file(scripts, output_dir / "script.js")

    _write_main_file(tree, output_dir / "main.html")


def _parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Unpack a Blogger theme XML into multiple files.")
    parser.add_argument("xml_path", help="Path to the Blogger theme XML file.")
    parser.add_argument(
        "output_dir",
        help="Directory that will contain the unpacked files (e.g., project/unpacked).",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> None:
    args = _parse_args(argv or sys.argv[1:])
    xml_path = Path(args.xml_path).expanduser().resolve()
    output_dir = Path(args.output_dir).expanduser().resolve()
    unpack_theme(xml_path, output_dir)
    print(f"Unpacked theme '{xml_path}' into '{output_dir}'.")


if __name__ == "__main__":
    main()
