#!/usr/bin/env python3
"""
Script om alle PNG referenties in HTML bestanden te vervangen door JPG
Behoudt logo's met transparantie als PNG
"""

import os
import re

def update_html_files():
    """
    Vervang alle PNG referenties door JPG in HTML bestanden
    """
    # Bestanden die we willen behouden als PNG (logo's met transparantie)
    keep_as_png = [
        'logo-avatar-zonderbg.png',
        'favicon.png'
    ]
    
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
            
            # Vervang PNG naar JPG voor avatar afbeeldingen
            # Maar skip logo's met transparantie
            for png_file in keep_as_png:
                # Skip deze bestanden - behoud als PNG
                continue
            
            # Vervang alle andere PNG bestanden naar JPG
            # Patroon: avatar/bestandsnaam.png -> avatar/bestandsnaam.jpg
            pattern = r'(avatar/[^"]*?)\.png'
            
            def replace_png(match):
                png_path = match.group(1) + '.png'
                jpg_path = match.group(1) + '.jpg'
                
                # Check of het bestand bestaat in de avatar map
                if os.path.exists(jpg_path):
                    return jpg_path
                else:
                    # Als JPG niet bestaat, behoud PNG
                    return png_path
            
            content = re.sub(pattern, replace_png, content)
            
            # Tel vervangingen
            if content != original_content:
                replacements_in_file = len(re.findall(r'\.png', original_content)) - len(re.findall(r'\.png', content))
                total_replacements += replacements_in_file
                
                # Schrijf het bestand terug
                with open(html_file, 'w', encoding='utf-8') as f:
                    f.write(content)
                
                print(f"✓ {html_file}: {replacements_in_file} vervangingen")
        
        except Exception as e:
            print(f"❌ Fout bij {html_file}: {e}")
    
    print(f"\n📊 Samenvatting:")
    print(f"Totale vervangingen: {total_replacements}")
    print(f"HTML bestanden bijgewerkt!")
    
    # Controleer welke PNG bestanden nog steeds worden gebruikt
    print(f"\n🔍 Controleer welke PNG bestanden nog worden gebruikt:")
    remaining_pngs = set()
    
    for html_file in html_files:
        try:
            with open(html_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Zoek alle PNG referenties
            png_matches = re.findall(r'avatar/[^"]*?\.png', content)
            for match in png_matches:
                remaining_pngs.add(match)
        
        except Exception as e:
            continue
    
    if remaining_pngs:
        print("Nog gebruikte PNG bestanden (deze behouden we):")
        for png in sorted(remaining_pngs):
            print(f"  - {png}")
    else:
        print("Geen PNG bestanden meer gevonden!")

if __name__ == "__main__":
    update_html_files() 