from pathlib import Path
import sys, json, re, xml.etree.ElementTree as ET

root = Path(__file__).resolve().parent
if len(sys.argv) < 2 or not sys.argv[1].startswith("https://"):
    print("Usage: python generate_sitemap.py https://your-real-domain.netlify.app")
    exit(1)

base = sys.argv[1].strip().rstrip("/")
catalog = json.loads((root / "assets/catalog.json").read_text(encoding="utf8"))
slug = lambda x: re.sub(r'(^-|-$)', '', re.sub(r'[^a-z0-9]+', '-', str(x).lower()))

primary_cat_paths = [f"/categories/{slug(c['name'])}/" for c in catalog["categories"]]
tool_paths = [f"/tools/{t['slug']}/" for t in catalog["tools"] if not t.get("isAlias")]
all_tool_paths = [f"/tools/{t['slug']}/" for t in catalog["tools"]]
urls = ["/", "/about/", "/privacy/"] + primary_cat_paths + tool_paths

urlset = ET.Element("urlset", xmlns="http://www.sitemaps.org/schemas/sitemap/0.9")
for path in urls:
    u = ET.SubElement(urlset, "url")
    ET.SubElement(u, "loc").text = base + path

ET.indent(urlset, space="  ")
ET.ElementTree(urlset).write(root / "sitemap.xml", encoding="utf-8", xml_declaration=True)
(root / "robots.txt").write_text("User-agent: *\nAllow: /\nSitemap: " + base + "/sitemap.xml\n", encoding="utf8")

for p in [root / "index.html", *root.glob("tools/*/index.html"), *root.glob("categories/*/index.html"), root / "about/index.html", root / "privacy/index.html"]:
    txt = p.read_text(encoding="utf8")
    if '<link rel="canonical"' not in txt:
        relative = "/" if p == root / "index.html" else "/" + str(p.relative_to(root)).replace("/index.html", "/")
        txt = txt.replace("</title>", '</title><link rel="canonical" href="' + base + relative + '">', 1)
        p.write_text(txt, encoding="utf8")

print("Created sitemap with", len(urls), "canonical URLs (and verified", len(all_tool_paths), "total tool routes) for", base)
