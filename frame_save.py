"""Save a base64 JPEG (passed via stdin) as N duplicate frame files starting at index I."""
import sys, base64, re
from pathlib import Path

b64   = sys.argv[1]
start = int(sys.argv[2])
count = int(sys.argv[3])
out   = Path(sys.argv[4])

if b64.startswith('data:image'):
    b64 = re.sub(r'^data:image/[^;]+;base64,', '', b64)

raw = base64.b64decode(b64)
for i in range(count):
    (out / f"frame_{start+i:05d}.jpg").write_bytes(raw)

print(f"saved {count} frames from {start} to {start+count-1}")
