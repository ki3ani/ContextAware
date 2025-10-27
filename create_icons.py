#!/usr/bin/env python3
"""
Generate placeholder icons for ContextAware extension
"""
from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size, output_path):
    """Create a simple gradient icon with CA text"""
    # Create image with gradient background
    img = Image.new('RGB', (size, size))
    draw = ImageDraw.Draw(img)

    # Draw gradient background (purple to blue)
    for y in range(size):
        # Gradient from #667eea to #764ba2
        r = int(102 + (118 - 102) * y / size)
        g = int(126 - (126 - 75) * y / size)
        b = int(234 - (234 - 162) * y / size)
        draw.line([(0, y), (size, y)], fill=(r, g, b))

    # Add rounded corners
    mask = Image.new('L', (size, size), 0)
    mask_draw = ImageDraw.Draw(mask)
    corner_radius = size // 5
    mask_draw.rounded_rectangle(
        [(0, 0), (size, size)],
        radius=corner_radius,
        fill=255
    )

    # Apply mask
    output = Image.new('RGBA', (size, size))
    output.paste(img, (0, 0))
    output.putalpha(mask)

    # Add "CA" text
    try:
        # Try to use a nice font
        font_size = size // 2
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size)
    except:
        # Fallback to default font
        font = ImageFont.load_default()

    # Draw text
    text = "CA"
    text_draw = ImageDraw.Draw(output)

    # Get text bounding box
    bbox = text_draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]

    # Center the text
    x = (size - text_width) // 2 - bbox[0]
    y = (size - text_height) // 2 - bbox[1]

    # Draw text with shadow
    shadow_offset = max(1, size // 32)
    text_draw.text((x + shadow_offset, y + shadow_offset), text, fill=(0, 0, 0, 100), font=font)
    text_draw.text((x, y), text, fill=(255, 255, 255, 255), font=font)

    # Save
    output.save(output_path, 'PNG')
    print(f"Created {output_path}")

# Create output directory
os.makedirs('public/icons', exist_ok=True)

# Generate all required sizes
sizes = [16, 32, 48, 128]
for size in sizes:
    create_icon(size, f'public/icons/icon{size}.png')

print("\n✅ All icons created successfully!")
