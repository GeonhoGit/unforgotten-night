import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,checkBackup,checkTimeline,validate,snapshot,prepareHandoff,endingFor} from '../dist/domain.js';

const correctBackup={candidate:'R2',r1:'duplicate_order',r2:'valid',r3:'overwritten_original'};
const claims=()=>[
 {judgment:'contradicted',refs:['F06','F07','F14'],reason:''},
 {judgment:'contradicted',refs:['F09'],reason:''},
 {judgment:'undetermined',refs:['F06','F09'],reason:'account_not_person'}
];
const draft=[0,1,2,3,4].map(id=>({id}));

test('all three backup assessments must be correct, including the selected copy',()=>{
 assert.deepEqual(checkBackup(correctBackup),[]);
 assert.deepEqual(checkBackup({...correctBackup,r2:''}),['r2']);
 assert.deepEqual(checkBackup({...correctBackup,r2:'copy_error'}),['r2']);
 assert.deepEqual(checkBackup({...correctBackup,candidate:'R1'}),['candidate']);
});

test('an older unfinished save gets a blank R2 assessment, not an automatic answer',()=>{
 const s=fresh();s.started=true;s.stage=3;
 s.backupDraft={candidate:'R2',r1:'duplicate_order',r3:'overwritten_original'};
 const restored=validate(JSON.parse(JSON.stringify(s)));
 assert.equal(restored.backupDraft.r2,'');
 assert.deepEqual(checkBackup(restored.backupDraft),['r2']);
});

test('completed legacy saves and both replay checkpoints remain usable in all endings',()=>{
 const s=fresh();s.started=true;s.stage=4;
 s.backupDraft={candidate:'R2',r1:'duplicate_order',r3:'overwritten_original'};
 s.cpWitness=snapshot(s);s.opened=['F13','F10'];s.policy='protect';s.stage=5;
 s.draft=structuredClone(draft);s.claims=claims();
 const prepared=prepareHandoff(s);
 for(const policy of ['protect','identify'])for(const choice of ['full','summary']){
  const branch=JSON.parse(JSON.stringify(prepared));
  branch.policy=policy;branch.cpFinal.policy=policy;branch.choice=choice;
  branch.ending=endingFor(policy,choice);branch.endingsSeen=[branch.ending];
  validate(branch);
  assert.equal(branch.backupDraft.r2,'valid');
  assert.equal(branch.cpWitness.backupDraft.r2,'valid');
  assert.equal(branch.cpFinal.backupDraft.r2,'valid');
 }
});

test('an explicitly wrong assessment in a solved save is rejected, not silently repaired',()=>{
 const s=fresh();s.stage=4;s.backupDraft={...correctBackup,r2:'copy_error'};
 assert.throws(()=>validate(s));
});

test('Q3 accepts relevant account records without requiring an arbitrary document pair',()=>{
 for(const refs of [['F06'],['F09'],['F14'],['F06','F07','F09']]){
  const c=claims();c[2].refs=refs;
  assert.deepEqual(checkTimeline(draft,c),[]);
 }
});

test('Q3 still needs evidence of the account record and a valid limit-of-evidence reason',()=>{
 for(const refs of [[],['F07'],['F15']]){
  const c=claims();c[2].refs=refs;
  assert.ok(checkTimeline(draft,c).some(e=>e.id===2));
 }
 const c=claims();c[2].reason='clock_unknown';
 assert.ok(checkTimeline(draft,c).some(e=>e.id===2));
});
