"""Utility script to convert standard images to optimized WebP format."""

import os
import sys
from PIL import Image

def convert_to_webp(root_dir, delete_original=False):
    """Scan the root directory recursively and convert images to WebP format.

    Args:
        root_dir (str): The root directory to scan.
        delete_original (bool): If True, delete original source images after conversion.
    """
    extensions = ('.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG')
    exclude_dirs = {'.git', 'node_modules', 'dist', '.venv'}
    
    converted_count = 0
    skipped_count = 0
    error_count = 0

    print(f"Scanning directory for conversion: {root_dir}")
    
    for root, dirs, files in os.walk(root_dir):
        # Exclude development and dependency directories
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        
        for file in files:
            if file.lower().endswith(extensions):
                file_path = os.path.join(root, file)
                webp_path = os.path.splitext(file_path)[0] + ".webp"
                
                try:
                    if os.path.exists(webp_path):
                        print(f"Skipping (WebP exists): {file}")
                        if delete_original:
                            os.remove(file_path)
                            print(f"Deleted original: {file}")
                        skipped_count += 1
                        continue
                    
                    with Image.open(file_path) as img:
                        img.save(webp_path, "WEBP", quality=80)
                        print(f"Converted: {file} -> {os.path.basename(webp_path)}")
                        converted_count += 1
                        
                    if delete_original:
                        os.remove(file_path)
                        print(f"Deleted original: {file}")
                        
                except Exception as e:
                    print(f"Error converting {file}: {e}")
                    error_count += 1

    print("\n" + "=" * 40)
    print("WebP Conversion Summary")
    print("" + "=" * 40)
    print(f"Successfully converted: {converted_count}")
    print(f"Skipped (already exist): {skipped_count}")
    print(f"Errors encountered:     {error_count}")
    print("=" * 40)

if __name__ == "__main__":
    delete_flag = "--delete" in sys.argv
    current_directory = os.path.dirname(os.path.abspath(__file__))
    convert_to_webp(current_directory, delete_original=delete_flag)
