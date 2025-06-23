#!/usr/bin/env python3
"""
Eenvoudig script om afbeeldingen te verkleinen en naar JPG te converteren
"""

import os
from PIL import Image

def resize_and_convert(input_path, output_dir, max_width=600, quality=85):
    """
    Verklein afbeelding en converteer naar JPG
    """
    try:
        # Open de afbeelding
        with Image.open(input_path) as img:
            # Converteer naar RGB (voor JPG)
            if img.mode in ('RGBA', 'LA', 'P'):
                # Maak witte achtergrond voor transparante afbeeldingen
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                img = background
            elif img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Bereken nieuwe afmetingen
            if img.width > max_width:
                ratio = max_width / img.width
                new_height = int(img.height * ratio)
                img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)
            
            # Maak output directory
            os.makedirs(output_dir, exist_ok=True)
            
            # Genereer bestandsnaam
            base_name = os.path.splitext(os.path.basename(input_path))[0]
            output_path = os.path.join(output_dir, f"{base_name}.jpg")
            
            # Sla op als JPG
            img.save(output_path, 'JPEG', quality=quality, optimize=True)
            
            # Print resultaten
            original_size = os.path.getsize(input_path)
            new_size = os.path.getsize(output_path)
            
            print(f"✓ {os.path.basename(input_path)}:")
            print(f"  Origineel: {original_size / 1024:.1f} KB")
            print(f"  Nieuw: {new_size / 1024:.1f} KB")
            print(f"  Besparing: {((original_size - new_size) / original_size * 100):.1f}%")
            print(f"  Afmetingen: {img.width}x{img.height}")
            
            return output_path
            
    except Exception as e:
        print(f"❌ Fout bij {input_path}: {e}")
        return None

def main():
    # Directories met afbeeldingen
    image_dirs = ['avatar', 'logo']
    
    # Output directory
    output_dir = 'resized-images'
    
    print("🚀 Start verkleinen van afbeeldingen...")
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
        
        # Verwerk alle PNG bestanden
        for filename in os.listdir(dir_name):
            if filename.lower().endswith('.png'):
                input_path = os.path.join(dir_name, filename)
                
                # Skip logo's met transparantie (deze behouden we als PNG)
                if 'logo' in filename.lower() and ('zonderbg' in filename.lower() or 'favicon' in filename.lower()):
                    print(f"⏭️  Overslaan {filename} (logo met transparantie)")
                    continue
                
                original_size = os.path.getsize(input_path)
                total_original += original_size
                
                output_path = resize_and_convert(input_path, dir_output)
                
                if output_path:
                    total_saved += os.path.getsize(output_path)
    
    print("\n" + "=" * 50)
    print("📊 Samenvatting:")
    print(f"Totale originele grootte: {total_original / 1024 / 1024:.1f} MB")
    print(f"Totale nieuwe grootte: {total_saved / 1024 / 1024:.1f} MB")
    print(f"Besparing: {((total_original - total_saved) / total_original * 100):.1f}%")
    print(f"\n✅ Verkleinde afbeeldingen opgeslagen in: {output_dir}/")
    print("\n💡 Volgende stappen:")
    print("1. Test de verkleinde afbeeldingen")
    print("2. Update HTML bestanden om .jpg te gebruiken")
    print("3. Voeg lazy loading toe")

if __name__ == "__main__":
    main() 