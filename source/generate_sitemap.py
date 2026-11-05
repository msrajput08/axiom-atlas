from pathlib import Path
import sys,xml.etree.ElementTree as ET
root=Path(__file__).resolve().parent
if len(sys.argv)<2 or not sys.argv[1].startswith("https://"):
 print("Usage: python generate_sitemap.py https://your-real-domain.netlify.app");exit(1)
base=sys.argv[1].strip().rstrip("/")
urls=["/"]+["/"+str(p.relative_to(root)).replace("/index.html", "/") for p in root.rglob("index.html") if p != root/"index.html"]
urlset=ET.Element("urlset",xmlns="http://www.sitemaps.org/schemas/sitemap/0.9")
for path in urls:
 u=ET.SubElement(urlset,"url");ET.SubElement(u,"loc").text=base+path
ET.indent(urlset,space="  ");ET.ElementTree(urlset).write(root/"sitemap.xml",encoding="utf-8",xml_declaration=True)
(root/"robots.txt").write_text("User-agent: *\nAllow: /\nSitemap: "+base+"/sitemap.xml\n")
for p in [root/"index.html",*root.glob("tools/*/index.html"),*root.glob("categories/*/index.html"),root/"about/index.html",root/"privacy/index.html"]:
 txt=p.read_text(encoding="utf8");start=txt.find("<link rel=\"canonical\"");
 if start!=-1:txt=txt[:start]+txt[txt.find(">",start)+1:]
 relative="/" if p==root/"index.html" else "/"+str(p.relative_to(root)).replace("/index.html","/")
 txt=txt.replace("</title>","</title><link rel=\"canonical\" href=\""+base+relative+"\">",1)
 p.write_text(txt,encoding="utf8")
print("Created sitemap with",len(urls),"URLs for",base)
