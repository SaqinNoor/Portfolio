import os
import re

def update_image_references(root_dir):
    img_extensions = r'\.(jpg|jpeg|png|JPG|JPEG|PNG)'
    ref_extensions = ('.html', '.css', '.js', '.jsx', '.ts', '.tsx', '.vue')
    exclude_dirs = {'.git', 'node_modules', 'dist', '.venv'}
    
    updated = 0
    replacements = 0

    for root, dirs, files in os.walk(root_dir):
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        for file in files:
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
                        updated += 1
                        replacements += count
                except Exception as e:
                    print(f"Error {file}: {e}")

    print(f"\nFiles updated: {updated} | Replacements: {replacements}")

if __name__ == "__main__":
    update_image_references(os.path.dirname(os.path.abspath(__file__)))
