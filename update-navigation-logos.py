#!/usr/bin/env python3
"""
Script om alle navigatiebalken aan te passen zodat ze naar het juiste logo pad verwijzen
"""

import os
import re

def update_navigation_logos():
    """
    Update alle navigatiebalken om naar logo/logo-avatar-zonderbg.png te verwijzen
    """
    # Zoek alle HTML bestanden
    html_files = []
    for root, dirs, files in os.walk('.'):
        for file in files:
            if file.endswith('.html'):
                html_files.append(os.path.join(root, file))
    
    print(f"🔍 Gevonden {len(html_files)} HTML bestanden om te controleren...")
    
    total_replacements = 0
    
    for html_file in html_files:
        try:
            with open(html_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            replacements_in_file = 0
            
            # Vervang alle avatar/logo-avatar-zonderbg.png naar logo/logo-avatar-zonderbg.png
            # Dit werkt voor bestanden in de root directory
            content = re.sub(
                r'src="avatar/logo-avatar-zonderbg\.png"',
                'src="logo/logo-avatar-zonderbg.png"',
                content
            )
            
            # Vervang alle ../avatar/logo-avatar-zonderbg.png naar ../logo/logo-avatar-zonderbg.png
            # Dit werkt voor bestanden in subdirectories
            content = re.sub(
                r'src="\.\./avatar/logo-avatar-zonderbg\.png"',
                'src="../logo/logo-avatar-zonderbg.png"',
                content
            )
            
            # Tel vervangingen
            if content != original_content:
                replacements_in_file = len(re.findall(r'avatar/logo-avatar-zonderbg\.png', original_content)) - len(re.findall(r'avatar/logo-avatar-zonderbg\.png', content))
                total_replacements += replacements_in_file
                
                # Schrijf het bestand terug
                with open(html_file, 'w', encoding='utf-8') as f:
                    f.write(content)
                
                print(f"✓ {html_file}: {replacements_in_file} vervangingen")
        
        except Exception as e:
            print(f"❌ Fout bij {html_file}: {e}")
    
    print(f"\n📊 Samenvatting:")
    print(f"Totale vervangingen: {total_replacements}")
    print(f"Navigatiebalken bijgewerkt!")
    
    # Controleer of er nog oude referenties zijn
    print(f"\n🔍 Controleer of er nog oude referenties zijn:")
    remaining_old_refs = 0
    
    for html_file in html_files:
        try:
            with open(html_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Zoek alle oude referenties
            old_refs = re.findall(r'avatar/logo-avatar-zonderbg\.png', content)
            if old_refs:
                print(f"  ⚠️  {html_file}: {len(old_refs)} oude referenties gevonden")
                remaining_old_refs += len(old_refs)
        
        except Exception as e:
            continue
    
    if remaining_old_refs == 0:
        print("✅ Geen oude referenties meer gevonden!")
    else:
        print(f"⚠️  Nog {remaining_old_refs} oude referenties gevonden")

if __name__ == "__main__":
    update_navigation_logos() 