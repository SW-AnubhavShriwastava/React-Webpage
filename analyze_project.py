import os
import json
import datetime

def analyze_project(frontend_path, backend_path, output_file):
    project_info = {
        "timestamp": str(datetime.datetime.now()),
        "frontend": {
            "path": frontend_path,
            "package_info": {},
            "dependencies": {},
            "structure": {},
            "components": [],
            "routes": [],
            "services": []
        },
        "backend": {
            "path": backend_path,
            "package_info": {},
            "dependencies": {},
            "structure": {},
            "routes": [],
            "models": [],
            "controllers": [],
            "middleware": []
        }
    }

    def read_file_content(file_path):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return f.read()
        except Exception as e:
            return f"Error reading file: {str(e)}"

    def analyze_directory(path, info_dict, project_type):
        for root, dirs, files in os.walk(path):
            # Skip node_modules and other unnecessary directories
            if 'node_modules' in dirs:
                dirs.remove('node_modules')
            if '.git' in dirs:
                dirs.remove('.git')
            if 'build' in dirs:
                dirs.remove('build')

            rel_path = os.path.relpath(root, path)
            if rel_path == '.':
                rel_path = ''

            for file in files:
                file_path = os.path.join(root, file)
                file_rel_path = os.path.join(rel_path, file)

                # Analyze specific files
                if file == 'package.json':
                    content = json.loads(read_file_content(file_path))
                    info_dict['package_info'] = {
                        'name': content.get('name'),
                        'version': content.get('version'),
                        'dependencies': content.get('dependencies', {}),
                        'devDependencies': content.get('devDependencies', {})
                    }

                # Analyze components (Frontend)
                if project_type == 'frontend' and file.endswith(('.js', '.jsx', '.tsx')) and '/components/' in file_path:
                    info_dict['components'].append({
                        'name': file,
                        'path': file_rel_path,
                        'content': read_file_content(file_path)
                    })

                # Analyze routes (Backend)
                if project_type == 'backend' and file.endswith('.js') and '/routes/' in file_path:
                    info_dict['routes'].append({
                        'name': file,
                        'path': file_rel_path,
                        'content': read_file_content(file_path)
                    })

                # Analyze models (Backend)
                if project_type == 'backend' and file.endswith('.js') and '/models/' in file_path:
                    info_dict['models'].append({
                        'name': file,
                        'path': file_rel_path,
                        'content': read_file_content(file_path)
                    })

    # Analyze frontend
    analyze_directory(frontend_path, project_info['frontend'], 'frontend')
    
    # Analyze backend
    analyze_directory(backend_path, project_info['backend'], 'backend')

    # Write to file
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(project_info, f, indent=2)

    # Create a human-readable summary
    with open(output_file.replace('.json', '_summary.txt'), 'w', encoding='utf-8') as f:
        f.write(f"Project Analysis Summary\n")
        f.write(f"Generated on: {project_info['timestamp']}\n\n")
        
        f.write("Frontend Summary:\n")
        f.write(f"- Package Name: {project_info['frontend']['package_info'].get('name')}\n")
        f.write(f"- Version: {project_info['frontend']['package_info'].get('version')}\n")
        f.write(f"- Number of Components: {len(project_info['frontend']['components'])}\n")
        f.write("\nComponents:\n")
        for comp in project_info['frontend']['components']:
            f.write(f"  - {comp['name']}\n")

        f.write("\nBackend Summary:\n")
        f.write(f"- Package Name: {project_info['backend']['package_info'].get('name')}\n")
        f.write(f"- Version: {project_info['backend']['package_info'].get('version')}\n")
        f.write(f"- Number of Routes: {len(project_info['backend']['routes'])}\n")
        f.write(f"- Number of Models: {len(project_info['backend']['models'])}\n")
        f.write("\nRoutes:\n")
        for route in project_info['backend']['routes']:
            f.write(f"  - {route['name']}\n")

# Usage
frontend_path = r"C:\Users\Admin\Desktop\React-Webpage\api2"
backend_path = r"C:\Users\Admin\Desktop\React-Webpage\backend"
output_file = "project_analysis.json"

analyze_project(frontend_path, backend_path, output_file)
print(f"Analysis complete. Check {output_file} and {output_file.replace('.json', '_summary.txt')} for results.")