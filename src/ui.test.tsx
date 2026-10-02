// @vitest-environment jsdom
import {afterEach,beforeEach,describe,it,expect,vi} from 'vitest';
import {render,screen,fireEvent,cleanup} from '@testing-library/react';
import App from './App';
import {KEY,emptyStore} from './storage';
import {questions} from './data';
beforeEach(()=>{localStorage.clear();sessionStorage.clear();window.history.replaceState({},'','/');vi.stubGlobal('scrollTo',vi.fn())});
afterEach(()=>{cleanup();vi.unstubAllGlobals()});
const click=(name:string)=>fireEvent.click(screen.getByRole('button',{name}));
describe('回答・再開・コース変更',()=>{
 it('回答後に再読み込みしても同じ問題・正誤を保持し、再回答を増やさない',()=>{
  let ui=render(<App/>);click('きょうの5問をはじめる');let s=JSON.parse(localStorage.getItem(KEY)!);const first=s.draft.questionIds[0];
  const q=questions.find(q=>q.id===first)!;
  if(q.choices.length)click(q.answer);else fireEvent.change(screen.getByRole('textbox',{name:'答え'}),{target:{value:q.answer}});
  click('こたえを決める');expect(screen.getByText('○ 正解')).toBeTruthy();ui.unmount();
  ui=render(<App/>);click('つづきから');expect(screen.getByText(q.question)).toBeTruthy();expect(screen.getByText('○ 正解')).toBeTruthy();expect(screen.queryByRole('button',{name:'こたえを決める'})).toBeNull();
  click('つぎの問題');s=JSON.parse(localStorage.getItem(KEY)!);expect(s.draft.answers).toHaveLength(1);expect(s.draft.index).toBe(1);expect(s.draft.questionIds[0]).toBe(first);
 });
 it('中3の3学期を選ぶとその範囲を開始し、学校の記録名で保存する',()=>{
  render(<App/>);click('学校の学年からえらぶ');fireEvent.click(screen.getByRole('button',{name:/^中学3年/}));click('3学期');click('この学期の漢字をはじめる');
  let s=JSON.parse(localStorage.getItem(KEY)!);expect(s.draft.courseKey).toBe('中学3年:3');
  for(let i=0;i<5;i++){
   const q=questions.find(q=>q.id===s.draft.questionIds[i])!;expect(q.schoolTerm).toBe(3);expect(q.schoolGrade).toBe('中学3年');
   fireEvent.change(screen.getByRole('textbox',{name:'答え'}),{target:{value:q.answer}});click('こたえを決める');click(i===4?'きょうの結果を見る':'つぎの問題');
  }
  s=JSON.parse(localStorage.getItem(KEY)!);expect(s.records[0].grade).toBe('中学3年・3学期');expect(s.records[0].answers).toHaveLength(5);expect(s.records[0].steps).toEqual([true]);expect(s.draft).toBeUndefined();
 });
 it('コース変更で途中問題を別の級の記録へ混ぜない',()=>{
  render(<App/>);click('きょうの5問をはじめる');click('⌂ ホーム');click('漢検の級からえらぶ');fireEvent.click(screen.getByRole('button',{name:/^漢検10級/}));
  expect(JSON.parse(localStorage.getItem(KEY)!).draft).toBeUndefined();click('この級で今日の学習をはじめる');
  const s=JSON.parse(localStorage.getItem(KEY)!);expect(s.draft.questionIds.every((id:string)=>questions.find(q=>q.id===id)?.grade==='10級')).toBe(true);
 });
 it('習得マップに中3の教科書一覧の全241字を表示する',()=>{
  const s=emptyStore();s.settings.schoolGrade='中学3年';localStorage.setItem(KEY,JSON.stringify(s));render(<App/>);click('できる漢字を見る　›');expect(screen.getByLabelText('241字中0字習得')).toBeTruthy();
 });
});
