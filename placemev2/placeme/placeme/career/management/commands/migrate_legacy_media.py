import os
import shutil

from django.conf import settings
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = (
        'Move uploads saved before MEDIA_ROOT was configured '
        'into the media/ folder.'
    )

    def handle(self, *args, **options):
        media_root = settings.MEDIA_ROOT
        base_dir = settings.BASE_DIR

        legacy_folders = [
            'resumes',
            'profile_pictures',
        ]

        moved = 0

        for folder in legacy_folders:
            legacy_dir = base_dir / folder
            target_dir = media_root / folder

            if not legacy_dir.is_dir():
                continue

            target_dir.mkdir(
                parents=True,
                exist_ok=True
            )

            for file_path in legacy_dir.iterdir():
                if not file_path.is_file():
                    continue

                destination = target_dir / file_path.name

                if destination.exists():
                    self.stdout.write(
                        self.style.WARNING(
                            f'Skip (exists): {destination}'
                        )
                    )
                    continue

                shutil.move(
                    str(file_path),
                    str(destination)
                )
                moved += 1
                self.stdout.write(
                    f'Moved {file_path} -> {destination}'
                )

            if legacy_dir.exists() and not any(
                legacy_dir.iterdir()
            ):
                legacy_dir.rmdir()

        self.stdout.write(
            self.style.SUCCESS(
                f'Done. Moved {moved} file(s).'
            )
        )
