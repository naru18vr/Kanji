import {describe,it,expect} from 'vitest';
import {readiness} from './exam';
import {questions} from './data';
import {cumulativeKanji,firstLevel} from './kanji-catalog';
import {schoolUnits,schoolCharacters,courseQuestions} from './curriculum';
import {emptyStore,memoryProfile,migrate} from './storage';
import {selectDaily} from './session';
describe('公式教材の整合性',()=>{
 it('公式の累積対象字数と一致し、全字に読み問題がある',()=>{
  for(const [grade,count] of Object.entries({'10級':80,'9級':240,'8級':440,'7級':642,'6級':835,'5級':1026,'4級':1339,'3級':1623})){
   expect(cumulativeKanji(grade).length).toBe(count);
   const pool=courseQuestions({...emptyStore().settings,grade},questions);
   const writes=new Set(pool.filter(q=>q.category==='書き').flatMap(q=>q.kanji));
   expect([...cumulativeKanji(grade)].filter(k=>!writes.has(k))).toEqual([]);
   const reads=new Set(pool.filter(q=>q.category==='読み').flatMap(q=>q.kanji));
   expect([...cumulativeKanji(grade)].filter(k=>!reads.has(k))).toEqual([]);
   expect(pool.every(q=>q.kanji.every(k=>cumulativeKanji(grade).includes(k)))).toBe(true);
  }
 });
 it('学校の全87単元に学期を割り当て、各字に問題を用意',()=>{
  expect(schoolUnits).toHaveLength(87);
  for(const unit of schoolUnits)for(const k of unit.kanji)expect(questions.some(q=>q.schoolGrade===unit.schoolGrade&&q.unit===unit.unit&&q.kanji.includes(k))).toBe(true);
 });
 it('中3の各学期を切り替えると範囲内の問題だけを出す',()=>{
  const ids:string[][]=[];
  for(const term of [1,2,3] as const){
   const pool=courseQuestions({...emptyStore().settings,courseMode:'school',schoolGrade:'中学3年',schoolTerm:term},questions);
   expect(pool.length).toBeGreaterThan(10);expect(pool.every(q=>q.schoolGrade==='中学3年'&&q.schoolTerm===term)).toBe(true);
   expect(new Set(pool.flatMap(q=>q.kanji)).size).toBe(schoolCharacters('中学3年',term).length);ids.push(pool.map(q=>q.id));
  }
  expect(ids[0].some(id=>ids[1].includes(id))).toBe(false);
 });
 it('教科書に含まれる上位級の字を3級と偽らない',()=>{expect(firstLevel('傲')).toBe('2級');expect(questions.filter(q=>q.kanji.includes('傲')).every(q=>q.grade==='2級')).toBe(true)});
});
describe('出題と記録の回帰検査',()=>{
 it('全字に基本問題があっても本番用教材の検証が済むまで合格判定しない',()=>{expect(readiness('3級',questions,[]).bankReady).toBe(false)});
 it('未学習を進めつつ読み書きと期限の復習を選ぶ',()=>{
  const bank=courseQuestions({...emptyStore().settings,grade:'3級'},questions),now=Date.parse('2026-10-02T12:00:00Z');
  const q=bank.at(-1)!;const logs=[{questionId:q.id,category:q.category,kanji:q.kanji,correct:false,at:'2026-10-01T00:00:00Z',mode:'daily' as const}];
  const daily=selectDaily(bank,logs,now);expect(daily).toHaveLength(5);expect(daily.some(x=>x.kanji.some(k=>q.kanji.includes(k)))).toBe(true);expect(daily.some(q=>q.category==='書き')).toBe(true);
 });
 it('誤答より前の成功を再習得条件へ持ち越さない',()=>{
  const days=['2026-08-01','2026-08-05','2026-08-15','2026-09-01','2026-09-10'];
  const logs=days.map((d,i)=>({questionId:String(i),category:(i%2?'書き':'読み') as '読み'|'書き',kanji:['承'],correct:true,at:d+'T00:00:00Z',mode:'daily' as const}));
  logs.push({...logs[0],correct:false,at:'2026-09-11T00:00:00Z'},{...logs[0],at:'2026-09-12T00:00:00Z'});
  expect(memoryProfile(logs,'承',Date.parse('2026-10-02T00:00:00Z')).status).toBe('練習中');
 });
 it('壊れた設定や回答を取り込んでも安全な値へ戻す',()=>{const s=migrate({settings:{grade:'999級',schoolGrade:'不明',schoolTerm:99,dailyLimitMinutes:NaN},records:[{id:'a',total:1,answers:[{}],steps:'bad'}]});expect(s.settings.grade).toBe('6級');expect(s.settings.schoolTerm).toBe(1);expect(s.records[0].answers).toEqual([])});
});
