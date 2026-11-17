"""Verify the exact bundled 2014 source snapshots; no network needed."""
import hashlib, json
from pathlib import Path
root = Path(__file__).resolve().parents[1] / 'src' / 'data'
manifest = json.loads((root / 'manifest.json').read_text())
for name, expected in manifest['sha256'].items():
    assert hashlib.sha256((root / name).read_bytes()).hexdigest() == expected, name
print(f"Verified {len(manifest['sha256'])} pinned 2014 tables")
