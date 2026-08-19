import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

import gen_pages


class GenPagesTests(unittest.TestCase):
    def test_variant_uses_lookup_table(self):
        self.assertEqual(gen_pages.variant(1, "children"), " sc-v2")
        self.assertEqual(gen_pages.variant(2, "more"), " sc-v3")
        self.assertEqual(gen_pages.variant(0, "fiction"), "")

    def test_generator_writes_pages_and_shared_assets(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            output_dir = Path(tmpdir)
            env = os.environ.copy()
            env["JW_AUTHOR_SITE_OUTPUT_DIR"] = str(output_dir)
            subprocess.run(
                [sys.executable, "gen_pages.py"],
                cwd=Path(__file__).resolve().parent,
                env=env,
                check=True,
            )

            self.assertTrue((output_dir / "book-pages.css").exists())
            self.assertTrue((output_dir / "muffin-wiggles.html").exists())
            self.assertTrue((output_dir / "muffin-memorial.html").exists())

            muffin_page = (output_dir / "muffin-wiggles.html").read_text(encoding="utf-8")
            self.assertIn('<link rel="stylesheet" href="book-pages.css">', muffin_page)
            self.assertNotIn("<style>", muffin_page)
            self.assertIn("https://r2.dev/1787087435477", muffin_page)


if __name__ == "__main__":
    unittest.main()
