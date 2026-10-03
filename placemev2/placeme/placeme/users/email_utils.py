import random
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from datetime import timedelta

from .models import EmailVerification

CODE_TTL_MINUTES = 15


def generate_verification_code():
    return f'{random.randint(100000, 999999)}'


def create_and_send_verification_code(email):
    email = email.strip().lower()
    code = generate_verification_code()
    expires_at = timezone.now() + timedelta(minutes=CODE_TTL_MINUTES)

    EmailVerification.objects.filter(email=email).delete()
    EmailVerification.objects.create(
        email=email,
        code=code,
        expires_at=expires_at,
    )

    subject = 'Launchpad — verify your email'
    message = (
        f'Your Launchpad verification code is: {code}\n\n'
        f'This code expires in {CODE_TTL_MINUTES} minutes.\n'
        'If you did not request this, you can ignore this email.'
    )

    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [email],
        fail_silently=False,
    )

    return code


def verify_email_code(email, code):
    email = email.strip().lower()
    code = str(code).strip()

    record = (
        EmailVerification.objects.filter(email=email, code=code)
        .order_by('-created_at')
        .first()
    )

    if not record:
        return False, 'Invalid verification code.'

    if record.expires_at < timezone.now():
        return False, 'Verification code has expired. Request a new code.'

    EmailVerification.objects.filter(email=email).delete()
    return True, None
