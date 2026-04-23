import sys, base64, re
data = sys.stdin.read().strip().strip('"')
if data.startswith('data:image'):
    data = re.sub(r'^data:image/[^;]+;base64,', '', data)
with open(sys.argv[1], 'wb') as f:
    f.write(base64.b64decode(data))
