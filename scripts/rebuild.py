#!/usr/bin/env python3
"""Regenerate the committed public site, preserving Google verification and domain SEO."""
from pathlib import Path
import tempfile, shutil, subprocess, sys, os, re, json
root=Path(__file__).resolve().parent.parent
site=root/'site'; source=root/'source'
with tempfile.TemporaryDirectory() as d:
    work=Path(d)
    shutil.copytree(site,work,dirs_exist_ok=True)
    for name in ['make_catalog.py','build.py','generate_sitemap.py','editorial_cases.py','seo_focus.py','seo_expansion.py']:
        shutil.copy2(source/name,work/name)
    for name in ['make_catalog.py','build.py']:
        subprocess.run([sys.executable,name],cwd=work,check=True)
    subprocess.run([sys.executable,'generate_sitemap.py','https://axiomatlas.netlify.app'],cwd=work,check=True)
    # A public revision marker makes it possible to verify which Git commit Netlify
    # actually published, rather than assuming a passing GitHub test is a deploy.
    revision = os.environ.get('COMMIT_REF') or os.environ.get('GITHUB_SHA') or ''
    revision = revision.lower() if re.fullmatch(r'[0-9a-fA-F]{40}', revision) else None
    (work / 'build-info.json').write_text(
        json.dumps({'app': 'AxiomAtlas', 'revision': revision, 'kind': 'static-site'},
                   separators=(',', ':')) + '\n', encoding='utf8'
    )
    headers = work / '_headers'
    headers.write_text(headers.read_text(encoding='utf8') +
                       '\n/build-info.json\n  Cache-Control: no-store\n',
                       encoding='utf8')
    for item in list(work.iterdir()):
        if item.name.endswith('.py') or item.name=='__pycache__':
            continue
        dest=site/item.name
        if dest.is_dir(): shutil.rmtree(dest)
        elif dest.exists(): dest.unlink()
        if item.is_dir(): shutil.copytree(item,dest)
        else: shutil.copy2(item,dest)
print('Rebuilt public site in site/')
