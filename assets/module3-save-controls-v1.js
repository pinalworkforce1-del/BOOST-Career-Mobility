(()=>{
'use strict';
if(window===window.top)return;
const TRUSTED=new Set(['https://pinal.boostpathways.org','https://pinalworkforce1-del.github.io']);
const send=(payload)=>{for(const origin of TRUSTED)window.parent.postMessage(payload,origin)};
function install(){
 const print=document.getElementById('printBtn');
 if(!print||document.getElementById('boostModule3SaveBottom'))return;
 const button=document.createElement('button');
 button.id='boostModule3SaveBottom';button.type='button';button.className='btn';
 button.style.cssText='background:#238a43;color:#fff;border-color:#238a43;margin:0 8px 8px 0;padding:12px 18px;font-weight:900';
 button.textContent='✓ SAVE RESULTS & RETURN TO BOOST';
 const row=print.parentElement;
 row.insertBefore(button,print);
 const note=document.createElement('p');note.id='boostModule3SaveHelp';
 note.style.cssText='font-size:.85rem;color:#426579;margin:2px 0 12px';
 note.textContent='Saves your career mobility results to your BOOST account before returning to the map. Printing a PDF does not save your module completion.';
 row.insertBefore(note,row.querySelector('p.sub')||null);
 button.addEventListener('click',()=>{
  button.disabled=true;button.textContent='Requesting secure save…';
  send({type:'pinal-boost-module3-finish-request'});
  setTimeout(()=>{if(document.contains(button)){button.disabled=false;button.textContent='✓ SAVE RESULTS & RETURN TO BOOST'}},10000);
 });
}
window.addEventListener('message',event=>{
 if(event.source!==window.parent||!TRUSTED.has(event.origin)||event.data?.type!=='pinal-boost-module3-collect')return;
 const requestId=event.data.requestId;
 if(typeof requestId!=='string'||requestId.length>100)return;
 const report=document.getElementById('reportSection');
 const reportCreated=!!(report&&!report.classList.contains('hidden'));
 const now=new Date().toISOString();
 const careerSet=new Map();
 const record=o=>{if(o&&o.soc&&o.title)careerSet.set(String(o.soc),o)};
 try{
  for(const x of window.boostModule3SavedCareerRecords?.().careers||[]){
   const soc=String(x?.soc||x?.socCode||'').split('.')[0];
   const occ=occs.find(o=>String(o.soc).split('.')[0]===soc);
   if(occ)record(occ);
  }
  for(const o of selectedOccupations())record(o);
  if(target)record(target);
  const careers=[...careerSet.values()].map(o=>({soc:String(o.soc),title:o.title,
    interestAlignment:hasInterestProfile()?Math.round(interest(o)):null,
    occupationalCompatibility:current?Math.round(occupationalAdjacency(current,o)):null,
    transferableSkillAlignment:Math.round(skillMatch(o)),
    earlyCareerWage:Number(o.p25||0),jobZone:o.jobZone||null,
    mobilityScore:Math.round(immediateMobility(o).score)}));
  const selfAssessment=currentSkills.map((skill,i)=>{
   const value=document.querySelector('input[name="sk'+i+'"]:checked')?.value;
   return value?{skill,use:value}:null;
  }).filter(Boolean);
  const interestScores=Object.fromEntries(['R','I','A','S','E','C'].map(k=>[k,Number(document.getElementById(k)?.value||0)]));
  const evidence={
   source:'pinal_module3_report_verified',module:'module3',capturedAt:now,completedAt:now,
   reportCreated,completionReady:reportCreated,
   startingPoint:current?{soc:current.soc,title:current.title,occupation:current.title,jobZone:current.jobZone||null}:null,
   currentWage:Number(document.getElementById('currentWage')?.value||0)||null,
   workNote:document.getElementById('workNote')?.value||'',
   interestScores,selfAssessment,careers,
   comparisonBySoc:Object.fromEntries(careers.map(c=>[c.soc,c])),
   reflection:document.getElementById('reflection')?.value||''
  };
  window.parent.postMessage({type:'pinal-boost-module3-current',requestId,module3:evidence},event.origin);
 }catch(err){
  window.parent.postMessage({type:'pinal-boost-module3-current',requestId,error:String(err?.message||err)},event.origin);
 }
});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
