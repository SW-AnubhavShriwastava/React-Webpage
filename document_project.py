import os
import datetime

def create_project_documentation(frontend_path, backend_path, output_file):
    with open(output_file, 'w', encoding='utf-8') as f:
        # Write header
        f.write("Project Documentation\n")
        f.write("=" * 50 + "\n")
        f.write(f"Generated on: {datetime.datetime.now()}\n\n")

        # Document Frontend
        f.write("\nFRONTEND STRUCTURE\n")
        f.write("=" * 50 + "\n")
        document_directory(frontend_path, f, exclude=['node_modules', 'build', '.git'])

        # Document Backend
        f.write("\n\nBACKEND STRUCTURE\n")
        f.write("=" * 50 + "\n")
        document_directory(backend_path, f, exclude=['node_modules', '.git'])

def document_directory(path, file, exclude=None, indent=""):
    if exclude is None:
        exclude = []

    # List all items in directory
    try:
        items = os.listdir(path)
    except Exception as e:
        file.write(f"{indent}Error reading directory {path}: {str(e)}\n")
        return

    # Sort items (directories first, then files)
    dirs = []
    files = []
    for item in items:
        if item in exclude:
            continue
        full_path = os.path.join(path, item)
        if os.path.isdir(full_path):
            dirs.append(item)
        else:
            files.append(item)

    dirs.sort()
    files.sort()

    # Document directories
    for dir_name in dirs:
        full_path = os.path.join(path, dir_name)
        file.write(f"\n{indent}📁 {dir_name}/\n")
        document_directory(full_path, file, exclude, indent + "  ")

    # Document files
    for file_name in files:
        full_path = os.path.join(path, file_name)
        file.write(f"{indent}📄 {file_name}\n")
        
        # Read and write file contents for specific file types
        if file_name.endswith(('.js', '.jsx', '.ts', '.tsx', '.json', '.css', '.html', '.env', '.md')):
            try:
                with open(full_path, 'r', encoding='utf-8') as source_file:
                    file.write(f"{indent}{'=' * 40}\n")
                    file.write(f"{indent}File: {file_name}\n")
                    file.write(f"{indent}Content:\n")
                    file.write(f"{indent}```{os.path.splitext(file_name)[1][1:]}\n")
                    file.write(source_file.read())
                    file.write(f"\n{indent}```\n")
            except Exception as e:
                file.write(f"{indent}Error reading file: {str(e)}\n")

# Usage
frontend_path = r"C:\Users\Admin\Desktop\React-Webpage\api2"
backend_path = r"C:\Users\Admin\Desktop\React-Webpage\backend"
output_file = "project_documentation.txt"

create_project_documentation(frontend_path, backend_path, output_file)