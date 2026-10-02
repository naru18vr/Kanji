"""Extract factual character allocation from publisher's character heading fonts.
Requires PyMuPDF. PDF practice sentences and illustrations are not copied.
"""
import fitz,re,json,sys
from pathlib import Path
root=Path(sys.argv[1]);manifest=json.loads((root/'mitsumura-manifest.json').read_text());rows=[]
for units in manifest:
 for u in units:
  doc=fitz.open(root/u['text'].replace('.txt','.pdf'));chars=[]
  for p in doc:
   if '一覧' not in p.get_text().replace('\n',''):continue
   for b in p.get_text('dict')['blocks']:
    for l in b.get('lines',[]):
     for s in l['spans']:
      if s['font']=='MitsukjyoPr5-Regular' and 14<s['size']<17 and len(s['text'])==1 and ('\u4e00'<=s['text']<='\u9fff' or '\U00020000'<=s['text']<='\U0002ffff'):chars.append(s['text'])
  # first onkun appearance/new kanji list headings only, deduplicated within unit
  rows.append({'schoolGrade':f"中学{u['grade']}年",'unit':u['unit'],'kanji':''.join(dict.fromkeys(chars)),'source':u['pdf']})
Path('src/school-catalog.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n')
for n in [1,2,3]:
 units=[x for x in rows if x['schoolGrade']==f'中学{n}年'];print(n,len(units),len(set(''.join(x['kanji'] for x in units))),[(x['unit'],len(x['kanji'])) for x in units])
