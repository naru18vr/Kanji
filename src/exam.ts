import type {AnswerLog,Category,Question,StudyRecord} from './types';

export const examSpecs:Record<string,{pass:number;characters:number;categories:Category[]}>= {
 '10級':{pass:80,characters:80,categories:['読み','書き','画数']},
 '9級':{pass:80,characters:240,categories:['読み','書き','画数']},
 '8級':{pass:80,characters:440,categories:['読み','書き','部首','画数','送り仮名','対義語・類義語','同音異字']},
 '7級':{pass:70,characters:642,categories:['読み','書き','部首','画数','送り仮名','対義語・類義語','同音異字','熟語']},
 '6級':{pass:70,characters:835,categories:['読み','書き','部首','画数','送り仮名','対義語・類義語','同音異字','熟語']},
 '5級':{pass:70,characters:1026,categories:['読み','書き','部首','画数','送り仮名','対義語・類義語','同音異字','熟語','四字熟語','誤字訂正']},
 '4級':{pass:70,characters:1339,categories:['読み','書き','部首','送り仮名','対義語・類義語','同音異字','熟語','四字熟語','誤字訂正']},
 '3級':{pass:70,characters:1623,categories:['読み','書き','部首','送り仮名','対義語・類義語','同音異字','熟語','四字熟語','誤字訂正']}
};

export function coverage(grade:string,bank:Question[]){
 const spec=examSpecs[grade],qs=bank.filter(q=>q.grade===grade),chars=new Set(qs.flatMap(q=>q.kanji));
 const missing=spec.categories.filter(c=>!qs.some(q=>q.category===c));
 return{questions:qs.length,characters:chars.size,targetCharacters:spec.characters,categories:spec.categories.length-missing.length,totalCategories:spec.categories.length,missing};
}

export function readiness(grade:string,bank:Question[],records:StudyRecord[]){
 const spec=examSpecs[grade],c=coverage(grade,bank),mocks=records.filter(r=>r.grade===`漢検${grade}`&&r.mock),recent=records.filter(r=>r.grade===`漢検${grade}`).slice(-10),logs:AnswerLog[]=recent.flatMap(r=>r.answers),byCategory=spec.categories.map(category=>{const a=logs.filter(x=>x.category===category);return{category,total:a.length,rate:a.length?Math.round(a.filter(x=>x.correct).length/a.length*100):null}}),weak=byCategory.filter(x=>x.rate===null||x.rate<spec.pass),lastMocks=mocks.slice(-2),mockRate=lastMocks.length?Math.round(lastMocks.reduce((n,r)=>n+r.correct,0)/lastMocks.reduce((n,r)=>n+r.total,0)*100):null;
 const bankReady=c.missing.length===0&&c.characters>=Math.min(spec.characters,80)&&c.questions>=50;
 const evidenceReady=lastMocks.length>=2&&byCategory.every(x=>x.total>=3)&&mockRate!==null;
 const passed=bankReady&&evidenceReady&&mockRate!>=spec.pass&&weak.length===0;
 const reason=!bankReady?'この級の教材範囲がまだ十分ではありません':lastMocks.length<2?`判定には模試があと${2-lastMocks.length}回必要です`:!evidenceReady?'すべての分野をあと3問ずつ確認します':passed?'合格点に届く力が安定しています':'合格点まで、苦手分野を復習しましょう';
 return{...c,pass:spec.pass,mockRate,byCategory,passed,reason,bankReady,evidenceReady};
}
