import assert from 'node:assert/strict';
import {fresh,accessible,checkKey,checkBackup,checkTimeline,endingFor,snapshot,validate,prepareHandoff,canFinalize,summaryFor,refIds} from '../dist/domain.js';
import {files,endings,policyNotes,commonAfterword} from '../dist/content.js';
assert.equal(files.length,16);assert.equal(endings.length,4);assert.equal(files.find(f=>f.id==='F09').tables.length,2);
for(const [p,v] of [[0,'0417'],[1,'０００６'],[2,' a2c4d6 ']])assert.equal(checkKey(p,v).ok,true);
assert.equal(checkKey(1,'00:06').format,true);assert.equal(checkKey(2,'A0C0D0').ok,false);
assert.equal(checkBackup({candidate:'R2',r1:'duplicate_order',r3:'overwritten_original'}).length,0);
assert.deepEqual(checkBackup({candidate:'R2',r1:'duplicate_order',r3:'copy_error'}),['r3']);
const s=fresh();s.started=true;s.stage=3;assert.throws(()=>prepareHandoff(s));s.backupDraft={candidate:'R2',r1:'duplicate_order',r3:'overwritten_original'};s.stage=4;s.cpWitness=snapshot(s);s.opened=['F13'];s.policy='protect';
s.draft=[0,1,2,3,4].map(id=>({id}));s.claims=[{judgment:'contradicted',refs:['F06','F07','F14'],reason:''},{judgment:'contradicted',refs:['F09'],reason:''},{judgment:'undetermined',refs:['F06','F09'],reason:'account_not_person'}];
assert.equal(checkTimeline(s.draft,s.claims).length,0);assert.equal(checkTimeline(s.draft,s.claims.map(c=>({...c,refs:refIds}))).length,0);
assert.ok(checkTimeline(s.draft,s.claims.map(c=>({...c,refs:['F06']}))).length);assert.ok(checkTimeline(s.draft,s.claims.map((c,i)=>i===2?{...c,reason:'clock_unknown'}:c)).length);
s.stage=5;assert.throws(()=>prepareHandoff(s));assert.equal(canFinalize(s),false);assert.equal(validate(s),s);s.opened.push('F10');let p=prepareHandoff(s);assert.equal(canFinalize(p),true);assert.equal(prepareHandoff(p),p);const cp=p.cpFinal;assert.equal(prepareHandoff(p).cpFinal,cp);assert.deepEqual(p.restored,['F02','F07']);validate(JSON.parse(JSON.stringify(p)));
for(const [policy,choice,ending] of [['identify','full','A'],['identify','summary','B'],['protect','full','C'],['protect','summary','D']]){assert.equal(endingFor(policy,choice),ending);const branch={...p,policy,cpFinal:{...p.cpFinal,policy},choice,ending,endingsSeen:[ending]};validate(branch);}
assert.throws(()=>validate({...p,cpFinal:null}));assert.throws(()=>validate({...p,opened:['F10']}));assert.throws(()=>validate({...p,cpFinal:{...p.cpFinal,policy:'identify'}}));
assert.doesNotMatch(summaryFor('protect'),/민아|BK-04|23:58|00:06|A2|F06/);assert.match(summaryFor('identify'),/민아 \/ BK-04/);
assert.match(files.find(f=>f.id==='F04').text,/판매 위탁 아님/);assert.match(commonAfterword,/잘못 등록/);assert.match(policyNotes.protect,/짐작/);assert.ok(endings.every(e=>e.follow&&e.status.length===3));
console.log('PASS: v1.2 content, P1–P5 rules, extra evidence acceptance, J1 gate, late F10, atomic preparation, checkpoint idempotence, all four branches, summary exclusions, save validation.');
