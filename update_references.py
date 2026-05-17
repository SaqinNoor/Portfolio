"""Utility script to update HTML and CSS source image extensions to WebP."""

import os
import re

def update_image_references(root_dir):
    """Scan root directory recursively and replace image extension references with .webp.

    Args:
        root_dir (str): The root directory to scan.
    """
    # Pattern to match common image extensions
    img_extensions = r'\.(jpg|jpeg|png|JPG|JPEG|PNG)'
    
    # File formats to check for references
    ref_extensions = ('.html', '.css', '.js', '.jsx', '.ts', '.tsx', '.vue')
    exclude_dirs = {'.git', 'node_modules', 'dist', '.venv'}
    
    updated_files_count = 0
    total_replacements = 0

    print(f"Scanning files for image reference updates: {root_dir}")

    for root, dirs, files in os.walk(root_dir):
        # Exclude development and dependency directories
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        
        for file in files:
            # Skip python utility files
            if file.endswith(ref_extensions) and file not in ('update_references.py', 'convert_to_webp.py'):
                file_path = os.path.join(root, file)
                
                try:
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()
                    
                    new_content, count = re.subn(img_extensions, '.webp', content)
                    
                    if count > 0:
                        with open(file_path, 'w', encoding='utf-8') as f:
                            f.write(new_content)
                        print(f"Updated {count} reference(s) in: {file}")
                        updated_files_count += 1
                        total_replacements += count
                except Exception as e:
                    print(f"Error scanning file {file}: {e}")

    print("\n" + "=" * 40)
    print("Reference Update Summary")
    print("=" * 40)
    print(f"Files updated:        {updated_files_count}")
    print(f"Total replacements:   {total_replacements}")
    print("=" * 40)

if __name__ == "__main__":
    current_directory = os.path.dirname(os.path.abspath(__file__))
    update_image_references(current_directory)
