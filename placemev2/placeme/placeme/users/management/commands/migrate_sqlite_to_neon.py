"""
Copy data from a local SQLite db.sqlite3 into the active DATABASE_URL (Neon PostgreSQL).

Usage (from placeme/placeme directory):
  set DATABASE_URL=postgresql://...neon...?sslmode=require
  python manage.py migrate
  python manage.py migrate_sqlite_to_neon --sqlite-path db.sqlite3
"""

import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

from django.conf import settings
from django.core.management import call_command
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = 'Export SQLite data and load it into the configured PostgreSQL (Neon) database.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--sqlite-path',
            default='db.sqlite3',
            help='Path to the SQLite database file (relative to project BASE_DIR).',
        )
        parser.add_argument(
            '--skip-migrate',
            action='store_true',
            help='Skip running migrate on PostgreSQL before loading data.',
        )

    def handle(self, *args, **options):
        engine = settings.DATABASES['default'].get('ENGINE', '')
        if not engine.endswith('postgresql'):
            raise CommandError(
                'DATABASE_URL must point to PostgreSQL (Neon). '
                f'Current engine: {engine or "unknown"}'
            )

        base_dir = Path(settings.BASE_DIR)
        sqlite_path = base_dir / options['sqlite_path']
        if not sqlite_path.is_file():
            raise CommandError(f'SQLite file not found: {sqlite_path}')

        if not options['skip_migrate']:
            self.stdout.write('Applying migrations on PostgreSQL...')
            call_command('migrate', interactive=False, verbosity=1)

        sqlite_url = f'sqlite:///{sqlite_path.as_posix()}'
        env = os.environ.copy()
        env['DATABASE_URL'] = sqlite_url

        with tempfile.NamedTemporaryFile(
            mode='w',
            suffix='.json',
            delete=False,
            encoding='utf-8',
        ) as tmp:
            dump_path = tmp.name

        self.stdout.write(f'Dumping data from {sqlite_path}...')
        manage_py = base_dir / 'manage.py'
        dump_cmd = [
            sys.executable,
            str(manage_py),
            'dumpdata',
            '--natural-foreign',
            '--natural-primary',
            '-e', 'contenttypes',
            '-e', 'auth.Permission',
            '--indent', '2',
        ]
        result = subprocess.run(
            dump_cmd,
            env=env,
            capture_output=True,
            text=True,
            cwd=str(base_dir),
            check=False,
        )
        if result.returncode != 0:
            Path(dump_path).unlink(missing_ok=True)
            raise CommandError(result.stderr or result.stdout or 'dumpdata failed')

        Path(dump_path).write_text(result.stdout, encoding='utf-8')

        self.stdout.write('Loading data into PostgreSQL...')
        try:
            call_command('loaddata', dump_path, verbosity=1)
        finally:
            Path(dump_path).unlink(missing_ok=True)

        self.stdout.write(self.style.SUCCESS('SQLite data migrated to Neon PostgreSQL.'))
