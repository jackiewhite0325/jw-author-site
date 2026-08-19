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
        'new': 'onerror="this.src=\'images/children/book1-cover-v2.png\'"',
        'expected_count': 1
    }
]
