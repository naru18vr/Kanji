"""Build factual character/readings catalog from official Kanken/Bunka PDFs.
Usage: python tools/build_catalog.py /path/to/sources
PDF texts must be extracted with pdftotext -layout.
"""
import re,json,sys,unicodedata
from pathlib import Path
root=Path(sys.argv[1])
text=(root/'joyo.txt').read_text(); data={};current=None
for line in text.splitlines()[600:]:
 line=unicodedata.normalize('NFKC',line)
 m=re.match(r'^\s{6,20}([\u4e00-\u9fff])(?:\([^)]*\))?(?:\[[^]]*\])?\s+([ぁ-ゖァ-ヶー]+)\s+(.*)',line)
 if m:
  current=m[1];data[current]=[];data[current].append([m[2],m[3]])
 elif current:
  m=re.match(r'^\s{20,40}([ぁ-ゖァ-ヶー]+)\s+(.*)',line)
  if m:data[current].append([m[1],m[2]])
data.update({'亀':[['キ','亀裂'],['かめ','亀']], '升':[['ショウ','升']], '朕':[['チン','朕']], '叱':[['シツ','叱責'],['しかる','叱る']]})
for variant,base in {'填':'塡','頬':'頰','剥':'剝'}.items(): data[variant]=data[base]
data['𠮟']=[['シツ','𠮟責'],['しかる','𠮟る']]
data['弁']=[['ベン','弁償，花弁，雄弁']]
levels=json.loads(re.search(r'=(\{.*?\});',(Path('src/kanji-catalog.ts')).read_text()).group(1))
missing=[c for c in ''.join(levels.values()) if c not in data]
print('Readings missing:',missing)
assert not missing
catalog=data
Path('src/readings.json').write_text(json.dumps(catalog,ensure_ascii=False,separators=(',',':'))+'\n')
print('characters',len(catalog))
