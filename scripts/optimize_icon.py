from PIL import Image
from pathlib import Path

source = Path('/home/ubuntu/physicaai-mobile/assets/images/icon.png')
image = Image.open(source).convert('RGBA')
image.thumbnail((512, 512), Image.Resampling.LANCZOS)
for name in ('icon.png', 'splash-icon.png', 'favicon.png', 'android-icon-foreground.png'):
    target = source.parent / name
    image.save(target, format='PNG', optimize=True, compress_level=9)
