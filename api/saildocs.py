import os
import time
import smtplib
import imaplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import email
from email.header import decode_header

EMAIL_USER = os.getenv('GMAIL_APP_MAIL')
EMAIL_PASS = os.getenv('GMAIL_APP_PASS')
DOWNLOAD_FOLDER = "data"

def send_grib_request(latReq, lngReq, offsetDegrees):
    """
    Envoi de l'email via le serveur SMTP (exemple avec Gmail)
    """
    lat = round(latReq, 3)  # Arrondir à 3 décimales
    lng = round(lngReq, 3)  # Arrondir à 3 décimales
    grid_size = 6
    # Calculer les coins de la grille de 6° autour de la position
    lat_min = lat - offsetDegrees  # 3° de latitude sous la position
    lat_max = lat + offsetDegrees  # 3° de latitude au-dessus de la position
    lng_min = lng - offsetDegrees  # 3° de longitude à l'ouest
    lng_max = lng + offsetDegrees  # 3° de longitude à l'est

    a, d = convert_numeric_to_directional(lat_max, lng_max)
    b, c = convert_numeric_to_directional(lat_min, lng_min)

    lat_spacing, lng_spacing = calculate_grid_spacing(lat_min, lat_max, lng_min, lng_max, grid_size - 1)

    # Construire la requête Saildocs
    # Format de la requête : GFS:lat_max,lat_min,lng_min,lng_max|0.5,0.5|24,48|=WIND,PRESS,WAVE
    request_subject = f"GFS:{a},{b},{c},{d}"
    request_message = f"{request_subject}|{lat_spacing},{lng_spacing}|24,48|=\nWIND,PRESS,WAVE"

    # Configuration de l'email
    sender_email = EMAIL_USER
    receiver_email = "query@saildocs.com"
    subject = f"GRIB Request {request_subject}"
    body = request_message

    # Création de l'email
    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = receiver_email
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'plain'))

    # time.sleep(2)
    # return request_message, request_subject, receiver_email
    # Connexion au serveur SMTP (ici Gmail)
    with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
        server.login(sender_email, EMAIL_PASS)  # Authentification
        server.sendmail(sender_email, receiver_email, msg.as_string())  # Envoi de l'email
        return request_message, request_subject, receiver_email

def download_grib_attachment(search_subject):
    """
    Fonction pour se connecter à la boîte de réception et récupérer la pièce jointe
    """
    try:
        # Connexion au serveur IMAP (exemple avec Gmail)
        mail = imaplib.IMAP4_SSL("imap.gmail.com")
        mail.login(EMAIL_USER, EMAIL_PASS)

        # Sélectionner la boîte de réception
        mail.select("inbox")

        # Rechercher les emails de query@saildocs.com
        messages = search_email_by_subject(
            mail,
            from_email="query-reply@saildocs.com",
            subject=search_subject
        )

        # Récupérer le dernier email reçu (peut être ajusté selon les besoins)
        for num in messages[0].split():
            status, msg_data = mail.fetch(num, "(RFC822)")
            if status != "OK":
                continue

            for response_part in msg_data:
                if isinstance(response_part, tuple):
                    # Parse l'email
                    msg = email.message_from_bytes(response_part[1])

                    # Vérifier le sujet
                    subject, encoding = decode_header(msg["Subject"])[0]
                    if isinstance(subject, bytes):
                        subject = subject.decode(encoding if encoding else "utf-8")

                    # Vérifier l'expéditeur
                    from_ = msg.get("From")
                    print("De:", from_)

                    # Vérifier si l'email contient une pièce jointe
                    if msg.is_multipart():
                        for part in msg.walk():
                            # Extraire le contenu de la pièce jointe
                            content_type = part.get_content_type()
                            content_disposition = str(part.get("Content-Disposition"))

                            if "attachment" in content_disposition:
                                # Nom du fichier
                                filename = part.get_filename()

                                if filename:
                                    # Enregistrer le fichier dans le dossier spécifié
                                    filepath = os.path.join(DOWNLOAD_FOLDER, filename)
                                    with open(filepath, "wb") as f:
                                        f.write(part.get_payload(decode=True))
                                    print(f"Pièce jointe {filename} téléchargée.")
                                    return filepath
        print("Aucune pièce jointe trouvée.")
        return None
    except Exception as e:
        print(f"Erreur lors du téléchargement de la pièce jointe : {e}")
        return None
    finally:
        # Déconnexion
        mail.logout()

def search_email_by_subject(mail, from_email, subject):
    """
    Recherche un email par expéditeur et sujet.

    Parameters:
    - mail: Connexion IMAP4_SSL active
    - from_email: Adresse email de l'expéditeur
    - subject: Sujet exact de l'email à rechercher

    Returns:
    - list: Identifiants des emails correspondants
    """
    # Échappez les caractères spéciaux dans le sujet
    subject = subject.replace('"', '\\"')  # Échapper les guillemets

    # Construisez la requête SEARCH
    search_criteria = f'SUBJECT {subject}'

    # Effectuez la recherche
    status, messages = mail.search(None, search_criteria)

    if status != "OK":
        raise Exception(f"Erreur lors de la recherche : {status}")

    return messages[0].split()

def calculate_grid_spacing(lat_min, lat_max, lng_min, lng_max, grid_size):
    """
    Calculate grid spacing for a given lat-lng range and desired grid size.

    Parameters:
    - lat_min (float): Minimum latitude
    - lat_max (float): Maximum latitude
    - lng_min (float): Minimum longitude
    - lng_max (float): Maximum longitude
    - grid_size (int): Number of rows/columns in the final grid

    Returns:
    - tuple: (latitude_spacing, longitude_spacing)
    """
    # Calculate range
    lat_range = lat_max - lat_min
    lng_range = lng_max - lng_min

    lat_spacing = lat_range / (grid_size - 1)
    lng_spacing = lng_range / (grid_size - 1)

    return lat_spacing, lng_spacing

def convert_numeric_to_directional(lat, lng):
    """
    Convert numeric latitude and longitude to directional format.
    """
    lat_directional = f"{abs(lat)}{'N' if lat >= 0 else 'S'}"
    lng_directional = f"{abs(lng)}{'E' if lng >= 0 else 'W'}"
    return lat_directional, lng_directional
