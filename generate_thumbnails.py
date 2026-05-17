import os
from PIL import Image

def generate_thumbnails(photo_dir, max_width=500, quality=80):
    print(f"Scanning photographs in: {photo_dir}")
    
    if not os.path.exists(photo_dir):
        print(f"Error: Directory {photo_dir} does not exist.")
        return
        
    converted = 0
    skipped = 0
    errors = 0
    
    for file in os.listdir(photo_dir):
        # Only process webp files that are not already thumbnails
        if file.lower().endswith(".webp") and not file.lower().endswith("_thumb.webp"):
            file_path = os.path.join(photo_dir, file)
            thumb_name = os.path.splitext(file)[0] + "_thumb.webp"
            thumb_path = os.path.join(photo_dir, thumb_name)
            
            try:
                # If thumbnail already exists and is newer than source, skip
                if os.path.exists(thumb_path) and os.path.getmtime(thumb_path) >= os.path.getmtime(file_path):
                    skipped += 1
                    continue
                    
                with Image.open(file_path) as img:
                    # Calculate aspect ratio
                    w_percent = max_width / float(img.size[0])
                    h_size = int(float(img.size[1]) * float(w_percent))
                    
                    # Resize
                    thumb_img = img.resize((max_width, h_size), Image.Resampling.LANCZOS)
                    thumb_img.save(thumb_path, "WEBP", quality=quality)
                    
                    print(f"Generated thumbnail: {file} -> {thumb_name} ({max_width}px width, Q={quality})")
                    converted += 1
                    
            except Exception as e:
                print(f"Error generating thumbnail for {file}: {e}")
                errors += 1
                
    print(f"\nProcessing complete! Generated: {converted} | Skipped: {skipped} | Errors: {errors}")

if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    photo_folder = os.path.join(current_dir, "Photographs")
    generate_thumbnails(photo_folder)
