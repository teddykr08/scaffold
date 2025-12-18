
import os

file_path = r'd:\scaffold\app\builder\page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    for i, line in enumerate(f):
        if "'" in line:
            print(f"{i+1}: {line.strip()}")
