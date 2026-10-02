import {writingExamples} from './writing-examples';
import readings from './readings.json';
import {kanjiByLevel,cumulativeKanji,firstLevel} from './kanji-catalog';
import {schoolUnits} from './curriculum';
import type {Question} from './types';
const table=readings as Record<string,string[][]>;
const hira=(s:string)=>s.replace(/[ァ-ヶ]/g,c=>String.fromCharCode(c.charCodeAt(0)-96));
function make(kanji:string,grade:string,id:string,allowed:Set<string>,school?:{schoolGrade:string;schoolTerm:1|2|3;unit:string;source:string}):Question[]{
 const entries=table[kanji];if(!entries)throw new Error(`音訓なし: ${kanji}`);
 const on=entries.filter(([r])=>/^[ァ-ヶー]+$/.test(r)),used=on.length?on:entries.filter(([r])=>/^[ぁ-ゖ]+$/.test(r));
 const answers=[...new Set(used.map(([r])=>hira(r)))];if(!answers.length)return [];
 const sourceTag=school?.source||'文化庁 常用漢字表（2010）・漢検公式級別漢字表（2020）';
 const base={grade,kanji:[kanji],choices:[],difficulty:1,sourceTag,...(school?{schoolGrade:school.schoolGrade,schoolTerm:school.schoolTerm,unit:school.unit}:{})};
 const result:Question[]=[{...base,id:`${id}-r`,category:'読み',question:`「${kanji}」の${on.length?'音':'訓'}読みを、ひらがなで一つ書こう。`,answer:answers[0],acceptedAnswers:answers,explanation:`${on.length?'音':'訓'}読み：${used.map(([r])=>r).join('・')}。常用漢字表の基本練習です。`}];
 for(const [reading,examples] of entries){
  const words=examples.split(/[，、,]/).map(s=>s.trim());
  for(const word of words){
   if(!word.includes(kanji)||!/^[\u4e00-\u9fffぁ-ゖ々]+$/.test(word)||word===kanji)continue;
   const chars=[...word].filter(c=>/^[\u4e00-\u9fff]$/.test(c));
   if(chars.some(c=>!allowed.has(c)))continue;
   const masked=word.replaceAll(kanji,'□');
   const isOn=/^[ァ-ヶー]+$/.test(reading);
   result.push({...base,id:`${id}-w`,category:'書き',question:`「${masked}」の□に入る漢字を書こう（${isOn?'音':'訓'}読み：${hira(reading)}）。`,answer:kanji,explanation:`答えは「${kanji}」、言葉は「${word}」です。紙にも書いて、形を確認しよう。`});
   return result;
  }
 }
 const fallback=writingExamples[kanji];
 if(fallback){const [context,reading]=fallback;result.push({...base,id:`${id}-w`,category:'書き',question:context.includes('□')?`□に入る漢字を書こう。「${context}」（読み：${reading}）`:context,answer:kanji,explanation:`答えは「${kanji}」です。読みは「${reading}」。紙にも書いて形を確かめよう。`})}
 return result;
}
export const generatedQuestions:Question[]=[];
for(const [grade,chars] of Object.entries(kanjiByLevel)){
 if(!['10級','9級','8級','7級','6級','5級','4級','3級'].includes(grade))continue;
 for(const k of new Set(chars))generatedQuestions.push(...make(k,grade,`base-${grade}-${k}`,new Set(cumulativeKanji(grade))));
}
const elementary=cumulativeKanji('5級');
for(const u of schoolUnits){
 const previous=schoolUnits.filter(x=>x.schoolGrade<=u.schoolGrade).map(x=>x.kanji).join('');
 const allowed=new Set(elementary+previous);
 for(const k of u.kanji)generatedQuestions.push(...make(k,firstLevel(k)||'教科書',`school-${u.schoolGrade}-${u.unit}-${k}`,allowed,u));
}
