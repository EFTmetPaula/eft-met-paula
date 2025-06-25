#!/usr/bin/env python3
"""
Script om QR codes te genereren voor PWA installatie
"""

import qrcode
from PIL import Image
import os

def generate_qr_codes():
    """
    Genereer QR codes voor verschillende doeleinden
    """
    # Maak qr-codes directory
    qr_dir = "qr-codes"
    os.makedirs(qr_dir, exist_ok=True)
    
    # Verschillende URLs voor QR codes
    qr_data = {
        "app-install": {
            "url": "https://eftmetpaula.github.io/eft-met-paula/install-app.html",
            "filename": "qr-app-install.png",
            "description": "Direct naar app installatie pagina"
        },
        "main-app": {
            "url": "https://eftmetpaula.github.io/eft-met-paula/",
            "filename": "qr-main-app.png", 
            "description": "Direct naar EFT app"
        },
        "eft-tapping": {
            "url": "https://eftmetpaula.github.io/eft-met-paula/eft-tapping.html",
            "filename": "qr-eft-tapping.png",
            "description": "Direct naar EFT tapping sessie"
        }
    }
    
    print("📱 QR Codes genereren...")
    print("=" * 40)
    
    for key, data in qr_data.items():
        try:
            # Maak QR code
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=10,
                border=4,
            )
            qr.add_data(data["url"])
            qr.make(fit=True)
            
            # Maak afbeelding
            qr_image = qr.make_image(fill_color="black", back_color="white")
            
            # Voeg logo toe in het midden
            try:
                logo = Image.open("logo/logo-avatar-zonderbg.png")
                logo = logo.resize((50, 50))
                
                # Bereken positie voor logo
                qr_width, qr_height = qr_image.size
                logo_width, logo_height = logo.size
                
                pos_x = (qr_width - logo_width) // 2
                pos_y = (qr_height - logo_height) // 2
                
                # Plak logo in het midden
                qr_image.paste(logo, (pos_x, pos_y), logo)
            except Exception as e:
                print(f"⚠️  Logo toevoegen mislukt: {e}")
            
            # Sla op
            filepath = os.path.join(qr_dir, data["filename"])
            qr_image.save(filepath)
            
            print(f"✅ {data['filename']} - {data['description']}")
            print(f"   URL: {data['url']}")
            
        except Exception as e:
            print(f"❌ Fout bij {key}: {e}")
    
    print(f"\n✅ QR codes opgeslagen in: {qr_dir}/")
    print("\n💡 Gebruik deze QR codes voor:")
    print("   - Social media posts")
    print("   - Flyers en brochures")
    print("   - Business cards")
    print("   - Presentaties")

if __name__ == "__main__":
    generate_qr_codes() 