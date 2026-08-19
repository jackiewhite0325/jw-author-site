#!/usr/bin/env python3
"""
Patches gen_pages.py: hash-routing for spine links + shared libHash script.
Provides robust error handling, configuration management, and dry-run mode.
"""
import sys
import argparse
import json
from pathlib import Path


# Configuration: All replacements in one place for easy maintenance
PATCHES = [
    {
        'name': 'script_block',
        'old': '''<script>
document.getElementById("back-link").addEventListener("click",
function (e) {
if (history.length > 1) { e.preventDefault(); history.back(); }
});
</script>''',
        'new': '''<script>
function libHash(id) {
  var r = document.referrer;
  if (r && (/sigil_study\\.html/.test(r) || /\/index\\.html/.test(r))) {
    return r.split('#')[0] + '#book=' + id;
  }
  return 'sigil_study.html#book=' + id;
}
document.getElementById("back-link").addEventListener("click",
function (e) {
  if (history.length > 1) { e.preventDefault(); history.back(); }
});
</script>''',
        'expected_count': 2
    },
    {
        'name': 'spine_template',
        'old': 'href="__SIB_%s__"',
        'new': 'href="sigil_study.html#book=%s" onclick="this.href=libHash(\'%s\')"',
        'expected_count': 1
    },
    {
        'name': 'cta_link',
        'old': 'href="__U_muffin_wiggles__"',
        'new': 'href="sigil_study.html#book=muffin-wiggles" onclick="this.href=libHash(\'muffin-wiggles\')"',
        'expected_count': 1
    },
    {
        'name': 'photo_fallback',
        'old': 'onerror="this.src=\'__U_muffin_wiggles__\'.replace(/[^/]*$/, \'\') + \'cover_muffin1.jpg\'"',
        'new': 'onerror="this.src=\'https://r2.dev\'"',
        'expected_count': 1
    }
]


def load_file(file_path):
    """Load file contents with error handling."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    except FileNotFoundError:
        print(f"Error: File not found at {file_path}", file=sys.stderr)
        sys.exit(1)
    except IOError as e:
        print(f"Error reading file {file_path}: {e}", file=sys.stderr)
        sys.exit(1)


def save_file(file_path, content):
    """Save file contents with error handling."""
    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
    except IOError as e:
        print(f"Error writing file {file_path}: {e}", file=sys.stderr)
        sys.exit(1)


def apply_patches(src, verbose=False):
    """Apply all patches to source content. Returns (patched_src, success, details)."""
    details = []
    
    for patch in PATCHES:
        count = src.count(patch['old'])
        
        if count != patch['expected_count']:
            details.append({
                'name': patch['name'],
                'status': 'FAILED',
                'expected': patch['expected_count'],
                'found': count
            })
            return src, False, details
        
        src = src.replace(patch['old'], patch['new'])
        details.append({
            'name': patch['name'],
            'status': 'OK',
            'expected': patch['expected_count'],
            'found': count
        })
        
        if verbose:
            print(f"  ✓ {patch['name']}: replaced {count} occurrence(s)")
    
    return src, True, details


def print_summary(details):
    """Print summary of patch results."""
    print("\nPatch Summary:")
    print("-" * 50)
    for detail in details:
        status_symbol = "✓" if detail['status'] == 'OK' else "✗"
        print(f"{status_symbol} {detail['name']:<20} {detail['status']:<10} ({detail['found']}/{detail['expected']})")
    print("-" * 50)


def main():
    parser = argparse.ArgumentParser(
        description='Patch gen_pages.py with hash-routing and libHash script'
    )
    parser.add_argument(
        '--file',
        default='/workspace/jw_ideas/gen_pages.py',
        help='Path to gen_pages.py (default: /workspace/jw_ideas/gen_pages.py)'
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Preview changes without writing to disk'
    )
    parser.add_argument(
        '--verbose',
        action='store_true',
        help='Show detailed patch information'
    )
    
    args = parser.parse_args()
    
    # Load source file
    if args.verbose:
        print(f"Loading {args.file}...")
    src = load_file(args.file)
    
    # Apply patches
    if args.verbose:
        print("Applying patches...")
    patched_src, success, details = apply_patches(src, verbose=args.verbose)
    
    # Print summary
    print_summary(details)
    
    if not success:
        print("\nError: Some patches failed. File not modified.", file=sys.stderr)
        sys.exit(1)
    
    # Write or preview
    if args.dry_run:
        print("\n[DRY RUN] Changes would be written to:", args.file)
        print(f"Total changes: {len([d for d in details if d['status'] == 'OK'])} patches applied")
    else:
        if args.verbose:
            print(f"Writing patched content to {args.file}...")
        save_file(args.file, patched_src)
        print(f"\n✓ Successfully patched {args.file}")
    
    return 0


if __name__ == '__main__':
    sys.exit(main())
