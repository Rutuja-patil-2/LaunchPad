import os

from django.conf import settings
from django.http import FileResponse, Http404
from django.views.decorators.http import require_GET


@require_GET
def serve_media(request, path):
    """Serve uploaded files from MEDIA_ROOT, with legacy path fallback."""

    candidates = [
        os.path.join(settings.MEDIA_ROOT, path),
        os.path.join(settings.BASE_DIR, path),
    ]

    for file_path in candidates:
        if os.path.isfile(file_path):
            return FileResponse(
                open(file_path, 'rb')
            )

    raise Http404('File not found')
