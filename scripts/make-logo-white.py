from PIL import Image

img = Image.open('public/logo.png').convert('RGBA')
w, h = img.size
pix = img.load()

for y in range(h):
    for x in range(w):
        r, g, b, a = pix[x, y]
        if a > 0:
            pix[x, y] = (255, 255, 255, a)

img.save('public/logo-white.png')
print(f'Saved logo-white.png ({w}x{h})')
