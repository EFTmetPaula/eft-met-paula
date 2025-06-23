#!/usr/bin/env python3
"""
Script om afbeeldingen te optimaliseren voor de EFT website
Converteert PNG bestanden naar geoptimaliseerde WebP en PNG formaten
"""

import os
import subprocess
from PIL import Image
import sys

def optimize_image(input_path, output_dir, quality=85, max_width=800):
    """
    Optimaliseer een afbeelding door deze te comprimeren en naar WebP te converteren
    """
    try:
        # Open de afbeelding
        with Image.open(input_path) as img:
            # Converteer naar RGB als nodig (voor PNG met transparantie)
            if img.mode in ('RGBA', 'LA', 'P'):
                # Maak een witte achtergrond voor transparante afbeeldingen
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                img = background
            elif img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Resize als de afbeelding te groot is
            if img.width > max_width:
                ratio = max_width / img.width
                new_height = int(img.height * ratio)
                img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)
            
            # Maak output directory als deze niet bestaat
            os.makedirs(output_dir, exist_ok=True)
            
            # Genereer bestandsnamen
            base_name = os.path.splitext(os.path.basename(input_path))[0]
            webp_path = os.path.join(output_dir, f"{base_name}.webp")
            png_path = os.path.join(output_dir, f"{base_name}-optimized.png")
            
            # Sla op als WebP (hoofdformaat)
            img.save(webp_path, 'WEBP', quality=quality, optimize=True)
            
            # Sla ook op als geoptimaliseerde PNG (fallback)
            img.save(png_path, 'PNG', optimize=True, compress_level=9)
            
            # Print resultaten
            original_size = os.path.getsize(input_path)
            webp_size = os.path.getsize(webp_path)
            png_size = os.path.getsize(png_path)
            
            print(f"✓ {os.path.basename(input_path)}:")
            print(f"  Origineel: {original_size / 1024:.1f} KB")
            print(f"  WebP: {webp_size / 1024:.1f} KB ({webp_size/original_size*100:.1f}%)")
            print(f"  PNG: {png_size / 1024:.1f} KB ({png_size/original_size*100:.1f}%)")
            
            return webp_path, png_path
            
    except Exception as e:
        print(f"❌ Fout bij optimaliseren van {input_path}: {e}")
        return None, None

def main():
    # Directories met afbeeldingen
    image_dirs = ['avatar', 'logo']
    
    # Output directory voor geoptimaliseerde afbeeldingen
    output_dir = 'optimized-images'
    
    print("🚀 Start optimaliseren van afbeeldingen...")
    print("=" * 50)
    
    total_saved = 0
    total_original = 0
    
    for dir_name in image_dirs:
        if not os.path.exists(dir_name):
            continue
            
        print(f"\n📁 Verwerken van {dir_name}/")
        print("-" * 30)
        
        # Maak output subdirectory
        dir_output = os.path.join(output_dir, dir_name)
        os.makedirs(dir_output, exist_ok=True)
        
        # Verwerk alle PNG bestanden
        for filename in os.listdir(dir_name):
            if filename.lower().endswith('.png'):
                input_path = os.path.join(dir_name, filename)
                
                # Skip als het al een geoptimaliseerde versie is
                if 'optimized' in filename:
                    continue
                
                original_size = os.path.getsize(input_path)
                total_original += original_size
                
                webp_path, png_path = optimize_image(input_path, dir_output)
                
                if webp_path and png_path:
                    total_saved += os.path.getsize(webp_path)
    
    print("\n" + "=" * 50)
    print("📊 Samenvatting:")
    print(f"Totale originele grootte: {total_original / 1024 / 1024:.1f} MB")
    print(f"Totale geoptimaliseerde grootte: {total_saved / 1024 / 1024:.1f} MB")
    print(f"Besparing: {((total_original - total_saved) / total_original * 100):.1f}%")
    print(f"\n✅ Geoptimaliseerde afbeeldingen opgeslagen in: {output_dir}/")
    print("\n💡 Volgende stappen:")
    print("1. Test de geoptimaliseerde afbeeldingen")
    print("2. Update HTML bestanden om WebP te gebruiken met PNG fallback")
    print("3. Voeg lazy loading toe waar nodig")

if __name__ == "__main__":
    main() 