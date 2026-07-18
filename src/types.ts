export type Category='読み'|'書き'|'部首'|'画数'|'送り仮名'|'同音異字'|'熟語'|'四字熟語'|'対義語・類義語'|'誤字訂正'|'使い分け';
export interface Question{id:string;grade:string;category:Category;question:string;answer:string;choices:string[];explanation:string;kanji:string[];difficulty:number;sourceTag:string;similar?:Omit<Question,'id'|'grade'|'similar'>}
export interface AnswerLog{questionId:string;category:Category;kanji:string[];correct:boolean;at:string;mode:'daily'|'mini'|'full'}
export interface StudyRecord{version:1;id:string;date:string;completedAt:string;durationMinutes:number;grade:string;activity:string;correct:number;total:number;learnedKanji:string[];masteredKanji:string[];wrongKanji:string[];strengths:string[];weaknesses:string[];nextAction:string;steps:boolean[];answers:AnswerLog[];mock?:'mini'|'full'}
export interface Settings{grade:string;examDate:string;dailyLimitMinutes:number;courseMode:'kanken'|'school';schoolGrade:string}
export interface Store{version:1;settings:Settings;records:StudyRecord[];draft?:{index:number;answers:AnswerLog[];startedAt:string};importedIds:string[]}
