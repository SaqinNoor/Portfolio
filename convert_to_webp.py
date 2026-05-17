import os
import sys
from PIL import Image

def convert_to_webp(root_dir, delete_original=False):
    extensions = ('.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG')
    exclude_dirs = {'.git', 'node_modules', 'dist', '.venv'}
    
    converted = 0
    skipped = 0
    errors = 0

    print(f"Scanning directory: {root_dir}")
    
    for root, dirs, files in os.walk(root_dir):
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        for file in files:
            if file.lower().endswith(extensions):
                file_path = os.path.join(root, file)
                webp_path = os.path.splitext(file_path)[0] + ".webp"
                
                try:
                    if os.path.exists(webp_path):
                        if delete_original:
                            os.remove(file_path)
                        skipped += 1
                        continue
                    
                    with Image.open(file_path) as img:
                        img.save(webp_path, "WEBP", quality=80)
                        print(f"Converted: {file} -> {os.path.basename(webp_path)}")
                        converted += 1
                        
                    if delete_original:
                        os.remove(file_path)
                        
                except Exception as e:
                    print(f"Error {file}: {e}")
                    errors += 1

    print(f"\nConverted: {converted} | Skipped: {skipped} | Errors: {errors}")

if __name__ == "__main__":
    delete_flag = "--delete" in sys.argv
    convert_to_webp(os.path.dirname(os.path.abspath(__file__)), delete_original=delete_flag)
