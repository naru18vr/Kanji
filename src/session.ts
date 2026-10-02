import type {Question,Settings,AnswerLog} from './types';
import {memoryProfile,localDate} from './storage';
export const schoolToKanken:Record<string,string>={'小学1年':'10級','小学2年':'9級','小学3年':'8級','小学4年':'7級','小学5年':'6級','小学6年':'5級','中学1年':'4級','中学2年':'4級','中学3年':'3級'};
export const courseKey=(s:Settings)=>s.courseMode==='school'?`${s.schoolGrade}:${s.schoolTerm}`:s.grade;
export function selectDaily(bank:Question[],logs:AnswerLog[],now=Date.now()){
 const attempted=new Set(logs.map(l=>l.questionId));
 const due=bank.filter(q=>q.kanji.some(k=>{const p=memoryProfile(logs,k,now);return p.status!=='未学習'&&p.due}));
 const fresh=bank.filter(q=>!attempted.has(q.id));
 const date=localDate(new Date(now));
 const rotated=bank.slice();const offset=Array.from(date).reduce((a,c)=>a+c.charCodeAt(0),0)%Math.max(1,bank.length);rotated.push(...rotated.splice(0,offset));
 const result:Question[]=[];const add=(q?:Question)=>{if(q&&!result.some(x=>x.id===q.id))result.push(q)};
 add(due[0]);add(fresh[0]);add(fresh.find(q=>q.category==='読み')||rotated.find(q=>q.category==='読み'));add(fresh.find(q=>q.category==='書き')||rotated.find(q=>q.category==='書き'));
 for(const q of [...due,...fresh,...rotated]){if(result.length>=5)break;add(q)}return result;
}
