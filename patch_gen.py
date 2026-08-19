#!/usr/bin/env python3
# Patches gen_pages.py: hash-routing for spine links + shared libHash script.
import sys

src = open('/workspace/jw_ideas/gen_pages.py').read()

OLD_SCRIPT = '''<script>
document.getElementById("back-link").addEventListener("click",
function (e) {
if (history.length > 1) { e.preventDefault(); history.back(); }
});
</script>'''

NEW_SCRIPT = '''<script>
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
</script>'''

count = src.count(OLD_SCRIPT)
assert count == 2, "expected 2 script blocks, found %d" % count
src = src.replace(OLD_SCRIPT, NEW_SCRIPT)

OLD_SPINE = 'href="__SIB_%s__"'
NEW_SPINE = 'href="sigil_study.html#book=%s" onclick="this.href=libHash(\'%s\')"'
n = src.count(OLD_SPINE)
assert n == 1, "expected 1 spine template, found %d" % n
src = src.replace(OLD_SPINE, NEW_SPINE)

OLD_CTA = 'href="__U_muffin_wiggles__"'
NEW_CTA = 'href="sigil_study.html#book=muffin-wiggles" onclick="this.href=libHash(\'muffin-wiggles\')"'
assert src.count(OLD_CTA) == 1, "CTA not found"
src = src.replace(OLD_CTA, NEW_CTA)

OLD_FB = 'onerror="this.src=\'__U_muffin_wiggles__\'.replace(/[^/]*$/, \'\') + \'cover_muffin1.jpg\'"'
NEW_FB = 'onerror="this.src=\'https://r2.dev\'"'
assert src.count(OLD_FB) == 1, "photo fallback not found"
src = src.replace(OLD_FB, NEW_FB)

open('/workspace/jw_ideas/gen_pages.py', 'w').write(src)
print("patched gen_pages.py OK")
