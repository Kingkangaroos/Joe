from pathlib import Path
p=Path('settings.html')
s=p.read_text(encoding='utf-8')
old='The PIN protects your private skills (Discipline category)'
new='The PIN hides private skills in the app UI. It is a convenience lock, not encryption of synced data.'
if s.count(old)!=1:
    raise SystemExit('PIN copy anchor count != 1')
s=s.replace(old,new,1)
p.write_text(s,encoding='utf-8')
