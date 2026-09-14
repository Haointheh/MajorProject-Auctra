import smtplib
import random
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import EMAIL_ADDRESS, EMAIL_PASSWORD


def generate_otp() -> str:
    return str(random.randint(100000, 999999))


def send_otp_email(recipient_email: str, otp: str):
    message = MIMEMultipart()
    message["From"] = EMAIL_ADDRESS
    message["To"] = recipient_email
    message["Subject"] = "Auctra - Email Verification Code"

    body = f"""
    Hello,

    Your Auctra verification code is: {otp}

    This code expires in 10 minutes.

    If you did not request this, please ignore this email.

    Thank youuu!!!

    - Auctra Team
    """

    message.attach(MIMEText(body, "plain"))

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
        server.sendmail(EMAIL_ADDRESS, recipient_email, message.as_string())