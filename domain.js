export const KEY='used-pc-mystery:ep1:v3';
export const times=['4월 18일 23:58','4월 19일 00:06','4월 19일 00:07','4월 19일 00:08','4월 19일 00:10'];
export const events=['관리 계정의 보관 번호 수정','윤서의 보관실 퇴실','야간 반입 지시 발행','야간 직원의 보관실 반입','물품 수령 확인'];
export const evidence=[['F06','F07'],['F06','F07'],['F14'],['F06','F07'],['F15']];
export const claimTexts=['야간 반입 지시가 발행될 때 윤서는 아직 보관실을 나가지 않았다.','비교 대상 세 묶음은 처음부터 빈 위치 번호로 등록되어 있었다.','ADM 계정을 사용한 특정 인물과 모든 책임이 이 기록만으로 확정된다.'];
export const claimEvidence=[['F06','F07','F14'],['F09'],['F06','F09']];
export const refIds=['F06','F07','F09','F13','F14','F15'];
export const judgments={supported:'자료가 뒷받침함',contradicted:'자료와 모순됨',undetermined:'이 자료만으로 판단 불가'};
export const backupReasons={duplicate_order:'순번 중복·누락',overwritten_original:'변경 후 값이 원본 칸을 덮음',copy_error:'복사 오류 검사 실패',valid:'문제 없음'};
export const claimReasons={account_not_person:'계정 기록만으로 사용 인물과 전체 책임을 확정할 수 없음',clock_unknown:'시계 오차를 모름',no_changes:'변경 기록이 없음'};
export function fresh(seen=[]){return {schemaVersion:3,contentVersion:'ep1-1.2.0',started:false,stage:0,restored:[],opened:[],pins:[],attempts:[0,0,0,0,0],policy:null,choice:null,ending:null,endingsSeen:seen,draft:[3,0,4,1,2].map(id=>({id})),claims:[0,1,2].map(()=>({judgment:'',refs:[],reason:''})),backupDraft:{candidate:'',r1:'',r3:''},handoffPrepared:false,cpWitness:null,cpFinal:null,settings:{size:100,motion:false,sound:false},revision:0};}
export function accessible(id,s){if(['F01','F03','F04'].includes(id))return true;if(['F02','F07'].includes(id))return s.restored.includes(id);let n=Number(id.slice(1));return n===16?!!s.policy:n>=13?s.stage>=4:n>=10?s.stage>=3:n>=8?s.stage>=2:s.stage>=1;}
export function checkKey(stage,input){const v=input.normalize('NFKC').trim().toUpperCase();if(!([0,1].includes(stage)?/^\d{4}$/:/^[A-Z0-9]{6}$/).test(v))return {ok:false,format:true,message:stage===2?'영문자와 숫자 여섯 자리로 입력해 주세요.':'숫자 네 자리로 입력해 주세요. 앞자리 0도 필요합니다.'};return {ok:v===['0417','0006','A2C4D6'][stage],message:stage===1&&v==='2356'?'이 값은 장치 시각입니다.':stage===1&&v==='2406'?'자정 이후는 00시로 적습니다.':['접수일과 출고일을 다시 비교해 보세요.','장치의 오차 방향과 자정이 지나는 순간을 확인해 보세요.','현재 번호가 아닌 원래 번호인지, 서로 같은 묶음 ID인지 확인해 보세요.'][stage]};}
export function checkBackup(d){return ['candidate','r1','r3'].filter(k=>d[k]!=={candidate:'R2',r1:'duplicate_order',r3:'overwritten_original'}[k]);}
export function checkTimeline(d,claims){const errors=[];if(d.length!==5||d.some((c,i)=>c.id!==i))errors.push({id:'order',message:'사건 순서를 다시 확인하세요.'});claims.forEach((c,i)=>{const wrong=[];if(c.judgment!==['contradicted','contradicted','undetermined'][i])wrong.push('판정');if(!claimEvidence[i].every(r=>c.refs.includes(r)))wrong.push('필수 근거 누락');if(i===2&&c.reason!=='account_not_person')wrong.push('이유');if(wrong.length)errors.push({id:i,message:wrong.join(' · ')+'를 다시 확인하세요.'});});return errors;}
export function endingFor(policy,choice){return policy==='protect'?(choice==='full'?'C':'D'):(choice==='full'?'A':'B');}
export function snapshot(s){const {cpWitness,cpFinal,settings,endingsSeen,...rest}=s;return structuredClone(rest);}
export function prepareHandoff(s){if(s.stage!==5||!s.policy||!s.opened.includes('F10')||s.choice)throw Error('최종 검토의 선행 조건을 확인해 주세요.');if(s.handoffPrepared){if(!s.cpFinal||s.cpFinal.policy!==s.policy)throw Error('최종 복귀 지점을 확인할 수 없습니다.');return s;}const next={...s,restored:[...new Set([...s.restored,'F02','F07'])],handoffPrepared:true};next.cpFinal=snapshot(next);return next;}
export function canFinalize(s){return s.stage===5&&s.opened.includes('F10')&&!!s.policy&&s.handoffPrepared&&!!s.cpFinal&&s.cpFinal.policy===s.policy&&!s.choice&&!s.ending;}
export function summaryFor(policy){return '윤서가 보존한 기록에서 보관 번호 변경과 사건 시각 해석의 문제를 발견했습니다. 윤서의 안부와 후속 인계 범위를 확인하고 싶습니다. 상세 기록은 이 컴퓨터에 보존되어 있습니다.\n'+(policy==='identify'?'비공개 확인을 허용한 증언자: 민아 / BK-04':'증언자: W1, 식별정보 미전달');}
export function validate(s,boundary=null){
 const bad=message=>{throw Error(message)};
 if(!s||s.schemaVersion!==3||s.contentVersion!=='ep1-1.2.0'||!Number.isInteger(s.stage)||s.stage<0||s.stage>5)bad('저장 버전 또는 진행 상태를 읽을 수 없습니다.');
 for(const k of ['restored','opened','pins','endingsSeen','draft','claims','attempts'])if(!Array.isArray(s[k]))bad('저장 데이터가 손상되었습니다.');
 for(const k of ['restored','opened','pins','endingsSeen'])if(new Set(s[k]).size!==s[k].length)bad('중복된 저장 항목입니다.');
 if(s.restored.some(x=>!['F02','F07'].includes(x))||s.opened.some(x=>!/^F(0[1-9]|1[0-6])$/.test(x)||!accessible(x,s))||s.pins.some(x=>!s.opened.includes(x)))bad('파일 접근 상태가 잘못되었습니다.');
 if(![null,'protect','identify'].includes(s.policy)||!s.settings||![100,125].includes(s.settings.size)||s.policy&&(s.stage<4||!s.opened.includes('F13'))||s.stage===5&&!s.policy)bad('분기 상태가 잘못되었습니다.');
 if(s.endingsSeen.some(x=>!['A','B','C','D'].includes(x))||s.attempts.length!==5||s.attempts.some(x=>!Number.isInteger(x)||x<0))bad('개인 기록이 손상되었습니다.');
 if(s.draft.length!==5||new Set(s.draft.map(x=>x.id)).size!==5||s.draft.some(x=>!Number.isInteger(x.id)||x.id<0||x.id>4))bad('시간표가 손상되었습니다.');
 if(s.claims.length!==3||s.claims.some(x=>!x||!['',...Object.keys(judgments)].includes(x.judgment)||!Array.isArray(x.refs)||x.refs.some(r=>!refIds.includes(r))||!['',...Object.keys(claimReasons)].includes(x.reason)))bad('주장 검토 기록이 손상되었습니다.');
 const b=s.backupDraft;if(!b||!['','R1','R2','R3'].includes(b.candidate)||!['',...Object.keys(backupReasons)].includes(b.r1)||!['',...Object.keys(backupReasons)].includes(b.r3))bad('백업 초안이 손상되었습니다.');
 if(s.stage>=4&&checkBackup(b).length||s.stage===5&&checkTimeline(s.draft,s.claims).length)bad('해결 상태와 제출 기록이 일치하지 않습니다.');
 if(typeof s.handoffPrepared!=='boolean'||s.handoffPrepared&&(s.stage!==5||!s.opened.includes('F10')||!s.policy))bad('인계 준비 상태가 잘못되었습니다.');
 if(![null,'full','summary'].includes(s.choice)||!!s.choice!==!!s.ending||s.choice&&(!s.handoffPrepared||s.ending!==endingFor(s.policy,s.choice)))bad('결말 상태가 잘못되었습니다.');
 if(boundary==='witness'&&(s.stage!==4||s.policy||s.handoffPrepared||s.choice))bad('증언자 복귀 지점이 잘못되었습니다.');
 if(boundary==='final'&&(!s.handoffPrepared||s.choice||s.ending))bad('최종 복귀 지점이 잘못되었습니다.');
 if(!boundary){if(s.handoffPrepared&&(!s.cpFinal||s.cpFinal.policy!==s.policy))bad('최종 복귀 지점이 없습니다.');for(const [key,type] of [['cpWitness','witness'],['cpFinal','final']])if(s[key]){const cp=s[key];if('cpWitness'in cp||'cpFinal'in cp)bad('재귀 복귀 지점입니다.');validate({...cp,settings:s.settings,endingsSeen:s.endingsSeen},type);}}
 return s;
}
