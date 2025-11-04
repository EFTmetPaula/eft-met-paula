# 📧 Paula Sangers EFT - Periodieke Mailing Systeem

Dit systeem verstuurt automatisch periodieke nieuwsbrieven en herinneringsmails naar je mailinglijst.

## ✨ Functionaliteiten

- 📨 **Automatische nieuwsbrieven**: Verstuur wekelijks, maandelijks of dagelijks
- 💝 **Herinneringsmails**: Neem contact op met eerdere cliënten
- 👥 **Mailinglijst beheer**: Voeg ontvangers toe of verwijder ze
- 🎨 **Professionele templates**: Mooie HTML emails met je branding
- 🤖 **Automatische planning**: Stel in en vergeet het!

## 🚀 Installatie

### Stap 1: Installeer benodigde packages

Open PowerShell in deze map en voer uit:

```powershell
pip install -r requirements.txt
```

### Stap 2: Start het programma

```powershell
python start_mailer.py
```

## 📋 Gebruik

### Hoofdmenu opties:

1. **Voeg ontvanger toe** - Voeg een nieuwe persoon toe aan je mailinglijst
2. **Verwijder ontvanger** - Verwijder iemand van de mailinglijst
3. **Toon ontvangers** - Bekijk je complete mailinglijst
4. **Verstuur nieuwsbrief NU** - Test direct een nieuwsbrief
5. **Verstuur herinneringsmail NU** - Test direct een herinneringsmail
6. **Start automatische scheduler** - Zet automatische verzending aan
7. **Stop scheduler** - Zet automatische verzending uit

## 🎯 Aanbevolen Schema's

### Voor Nieuwsbrieven:
- **Wekelijks**: Elke maandag om 9:00
- **Tweewekelijks**: Gebruik een externe scheduler of pas de code aan
- **Maandelijks**: Eerste dag van de maand om 9:00

### Voor Herinneringsmails:
- **Maandelijks**: Voor follow-up met eerdere cliënten
- **Per kwartaal**: Pas de code aan voor driemaandelijks

## 📝 Email Types

### 1. Nieuwsbrief
- Moderne, kleurrijke opmaak
- Bevat tips, workshops en inspiratie
- Ideaal voor regelmatig contact

### 2. Herinneringsmail
- Persoonlijke, warme toon
- Speciaal aanbod voor terugkerende cliënten
- Ideaal voor re-engagement

## 🔧 Configuratie

### Email instellingen

De email configuratie staat in de code:
- **SMTP Server**: smtp.gmail.com
- **Port**: 587
- **Van**: paulasangerseft@gmail.com
- **App Wachtwoord**: (al geconfigureerd)

### Mailinglijst bestand

Ontvangers worden opgeslagen in `mail_recipients.json`. Dit bestand wordt automatisch aangemaakt.

## 💡 Tips

1. **Test eerst**: Gebruik "Verstuur NU" om te testen voordat je de scheduler start
2. **Start klein**: Begin met een kleine lijst ontvangers
3. **Pas templates aan**: Bewerk `periodic_mailer.py` om de email content aan te passen
4. **Houd het venster open**: Als de scheduler draait, moet het programma blijven draaien
5. **Automatisch starten**: Gebruik Windows Task Scheduler om het programma automatisch te starten

## 🔒 Beveiliging

- **App Wachtwoord**: Gebruik een Gmail App Password, geen normaal wachtwoord
- **Privégegevens**: Het `mail_recipients.json` bestand bevat emailadressen - bewaar het veilig
- **GDPR**: Vraag altijd toestemming voordat je mensen toevoegt aan de mailinglijst

## 🆘 Problemen Oplossen

### Email wordt niet verzonden
- Check je internet verbinding
- Controleer of het Gmail app wachtwoord correct is
- Check of 2-factor authenticatie aan staat in Gmail

### Scheduler werkt niet
- Zorg dat het programma blijft draaien
- Check of de tijd correct is ingesteld
- Kijk in de console voor foutmeldingen

### Ontvangers krijgen geen email
- Check spam folder
- Controleer of het emailadres correct is
- Test eerst met "Verstuur NU"

## 📞 Support

Voor vragen of problemen, bekijk de code of pas de templates aan naar je wensen!

## 🎨 Email Templates Aanpassen

### Nieuwsbrief aanpassen

Bewerk in `periodic_mailer.py` de functie `maak_nieuwsbrief_email()`:

```python
def maak_nieuwsbrief_email(self, ontvanger_naam):
    html_content = f"""
    <!-- Pas hier je HTML aan -->
    """
    return html_content
```

### Kleuren aanpassen

In de HTML templates zie je kleuren zoals:
- `#667eea` (paars/blauw)
- `#764ba2` (donkerpaars)
- `#f5576c` (roze/rood)

Vervang deze met je eigen brand kleuren!

## ✅ Checklist voor Eerste Gebruik

- [ ] Installeer requirements (`pip install -r requirements.txt`)
- [ ] Test email verzending met "Verstuur NU"
- [ ] Voeg testontvangers toe
- [ ] Controleer of emails aankomen (check spam!)
- [ ] Pas email templates aan naar je stijl
- [ ] Stel scheduler in voor gewenste interval
- [ ] Maak notitie in agenda voor eerste automatische verzending

## 🌟 Extra Mogelijkheden

Wil je meer? Je kunt het systeem uitbreiden met:

- **Gepersonaliseerde content** per ontvanger
- **A/B testing** van verschillende email versies
- **Statistieken** over geopende emails (vereist extra tools)
- **Verschillende segmenten** in je mailinglijst
- **Attachments** zoals PDFs of afbeeldingen

Veel succes met je periodieke mailings! 🎉
