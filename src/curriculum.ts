import catalog from './school-catalog.json';
import {mitsumuraTerms,type MiddleGrade} from './mitsumura';
import {cumulativeKanji,kanjiByLevel} from './kanji-catalog';
import {schoolToKanken} from './session';
import type {Settings,Question} from './types';
const clean=(s:string)=>s.normalize('NFKC').replace(/^[漢字言葉]\d+\s*/,'').replace(/^情報整理のレッスン\s*/,'').replace(/^思考のレッスン\d*\s*/,'').replace(/^聴きひたる\s*/,'').replace(/[\s　]/g,'').replace('蓬萊','蓬莱').replace('3編','三編');
export const schoolUnits=catalog.map(u=>{
 const terms=mitsumuraTerms[u.schoolGrade as MiddleGrade];
 const key=clean(u.unit);
 const term=([1,2,3] as const).find(t=>terms[t].some(x=>key.includes(clean(x))||clean(x).includes(key)));
 if(!term)throw new Error(`学期対応がない単元: ${u.unit}`);
 return {...u,schoolTerm:term};
});
export function schoolCharacters(grade:string,term?:number){
 if(grade.startsWith('小学'))return kanjiByLevel[schoolToKanken[grade]]||'';
 return [...new Set(schoolUnits.filter(u=>u.schoolGrade===grade&&(!term||u.schoolTerm===term)).flatMap(u=>[...u.kanji]))].join('');
}
export function courseQuestions(s:Settings,bank:Question[]){
 if(s.courseMode==='kanken'){const allowed=new Set(cumulativeKanji(s.grade));return bank.filter(q=>!q.schoolGrade&&q.kanji.every(k=>allowed.has(k))&&Number(q.grade.replace('級',''))>=Number(s.grade.replace('級','')))}
 if(s.schoolGrade.startsWith('中学'))return bank.filter(q=>q.schoolGrade===s.schoolGrade&&q.schoolTerm===s.schoolTerm);
 const own=new Set(schoolCharacters(s.schoolGrade));return bank.filter(q=>!q.schoolGrade&&q.kanji.some(k=>own.has(k))&&q.grade===schoolToKanken[s.schoolGrade]);
}
