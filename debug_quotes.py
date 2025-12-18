
import io

file_path = r'd:\scaffold\app\builder\page.tsx'
with io.open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

quotes = []
for i, char in enumerate(content):
    if char == "'":
        # Find line number
        line_no = content.count('\n', 0, i) + 1
        # Find column number
        last_newline = content.rfind('\n', 0, i)
        col_no = i - last_newline
        quotes.append((line_no, col_no, char))

print(f"Total single quotes: {len(quotes)}")
for q in quotes:
    # Print the line content
    line = content.splitlines()[q[0]-1]
    print(f"{q[0]}:{q[1]}: {line}")
