#!/usr/bin/env python3
"""Regenerate the committed public site, preserving Google verification and domain SEO."""
from pathlib import Path
import tempfile, shutil, subprocess, sys
root=Path(__file__).resolve().parent.parent
site=root/'site'; source=root/'source'
with tempfile.TemporaryDirectory() as d:
    work=Path(d)
    shutil.copytree(site,work,dirs_exist_ok=True)
    for name in ['make_catalog.py','build.py','generate_sitemap.py']:
        shutil.copy2(source/name,work/name)
    for name in ['make_catalog.py','build.py']:
        subprocess.run([sys.executable,name],cwd=work,check=True)
    subprocess.run([sys.executable,'generate_sitemap.py','https://axiomatlas.netlify.app'],cwd=work,check=True)
    for item in list(work.iterdir()):
        if item.name.endswith('.py') or item.name=='__pycache__':
            continue
        dest=site/item.name
        if dest.is_dir(): shutil.rmtree(dest)
        elif dest.exists(): dest.unlink()
        if item.is_dir(): shutil.copytree(item,dest)
        else: shutil.copy2(item,dest)
print('Rebuilt public site in site/')
