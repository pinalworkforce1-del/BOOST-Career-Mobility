(function(){
'use strict';
if(window===window.top)return;
const origins=new Set(['https://pinal.boostpathways.org','https://pinalworkforce1-del.github.io']);
let carryState=null;
function showSavedCareerComparisons(){
 const host=document.getElementById('occupationalValue');
 if(!host||!carryState||!current)return;
 const selected=[carryState.module1?.selected,carryState.module1?.careers,carryState.module2?.careers].find(x=>Array.isArray(x)&&x.length)||[];
 let panel=document.getElementById('boostSavedCareerComparisons');
 if(!panel){panel=document.createElement('section');panel.id='boostSavedCareerComparisons';panel.style.cssText='margin-top:20px;padding:18px;border:2px solid #2a9d8f;border-radius:14px;background:#f4faf9';host.insertAdjacentElement('afterend',panel)}
 const escText=x=>String(x??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
 const lookup=soc=>occs.find(x=>String(x.soc||'').split('.')[0]===String(soc||'').split('.')[0]);
 const pct=n=>Math.round(n)+'%';
 const baseline=hasInterestProfile()?interest(current):null;
 const validation=carryState.module2?.validationBySoc||{};
 const unique=[...new Map(selected.filter(x=>x&&typeof x==='object'&&x.soc).map(x=>[String(x.soc),x])).values()];
 const cards=unique.map(c=>{
  const o=lookup(c.soc),title=c.title||c.careerTitle||o?.title||'Saved occupation',v=validation[c.soc]||validation[String(c.soc).split('.')[0]]||{};
  if(!o)return '<article class="adjCard"><b>'+escText(title)+'</b><div class="whyLine">Saved from Discover. No matching occupational profile is available for a reliable comparison; review this occupation with your coach.</div></article>';
  const similarity=occupationalAdjacency(current,o),interestValue=hasInterestProfile()?interest(o):null;
  const diff=interestValue===null||baseline===null?null:interestValue-baseline;
  const interestNote=diff===null?'Interest scores unavailable':Math.abs(diff)<5?'Interest alignment is similar to your current occupation':diff>0?'Interest alignment is higher than your current occupation':'Interest alignment is lower than your current occupation';
  const prepDelta=Number(o.jobZone||0)-Number(current.jobZone||0);
  const prep='Job Zone '+(o.jobZone||'—')+(prepDelta>0?' • higher preparation level':prepDelta<0?' • lower preparation level':' • similar preparation level');
  const researched=[v.prepNote,v.employerSupportNote,v.lifeNote].filter(Boolean).map(x=>escText(x)).join(' • ');
  return '<article class="adjCard"><b>'+escText(title)+'</b> <span class="valueTag">EXPLORED IN MODULES 1–2</span><div class="adjMeta">Occupational compatibility: <b>'+pct(similarity)+'</b> (technical similarity and Job Zone, not qualification)<br>O*NET interest alignment: <b>'+(interestValue===null?'Not calculated':pct(interestValue))+'</b> '+(baseline===null?'':'• Current occupation: '+pct(baseline))+'<br>'+escText(prep)+'</div><div class="whyLine"><b>'+escText(interestNote)+'.</b> '+(priorityH(o)?'Meets BOOST regional opportunity screen. ':'Regional opportunity should be checked independently. ')+(researched?'Module 2 notes: '+researched+'. ':'')+'A strong interest match does not establish skills, credentials or hiring readiness.</div></article>';
 }).join('');
 panel.innerHTML='<div class="sectionKicker">Your saved career exploration</div><h3>How do the careers you explored compare?</h3><p class="muted">Compare your current experience with careers already saved in Discover and Reality Check. A new title might be more appealing, but a lower occupational match can mean a larger transition. Equally, work you already know may offer growth without a career change.</p><div class="adjGrid">'+(cards||'<p>Your saved Module 1 careers will appear here once they are available.</p>')+'</div><p class="whyLine"><b>Worth discussing with Rosie:</b> What is motivating a change—interest, wages, advancement, schedule, or something else? If your current work fits your interests and offers advancement, what would a new career improve? These comparisons invite exploration, not a recommendation to stay or leave.</p>';
}
window.boostShowSavedCareerComparisons=showSavedCareerComparisons;
function request(){window.parent.postMessage({type:'pinal-boost-module-restore-request',module:'module3'},'*')}
window.addEventListener('message',function(event){
 if(event.source!==window.parent||!origins.has(event.origin)||event.data?.type!=='pinal-boost-module-restore'||event.data.module!=='module3')return;
 const info=event.data.state||{},saved=info.module3||{},start=saved.startingPoint||{};
 carryState=info;
 setTimeout(showSavedCareerComparisons,60);
 // Module 1 interest scores must carry forward even when Module 3 has no saved starting occupation.
 const profile=info.module1||{};
 const scores=profile.scores||profile.interestScores||profile.riasecScores||{};
 const scoreKeys=['R','I','A','S','E','C'];
 let filled=0;
 for(const letter of scoreKeys){
   const raw=scores[letter]??scores[({R:'Realistic',I:'Investigative',A:'Artistic',S:'Social',E:'Enterprising',C:'Conventional'})[letter]];
   const input=document.getElementById(letter);
   if(input&&raw!==null&&raw!==undefined&&raw!==''&&Number.isFinite(Number(raw))){
     input.value=String(raw);
     input.dispatchEvent(new Event('input',{bubbles:true}));
     filled++;
   }
 }
 if(filled===scoreKeys.length){
   const heading=document.querySelector('#loadSkills')?.parentElement;
   if(heading&&!document.getElementById('pinalInterestCarryNote')){
     const note=document.createElement('p');note.id='pinalInterestCarryNote';
     note.style.cssText='color:#216246;font-size:.88rem;font-weight:700;margin:8px 0';
     note.textContent='Your six O*NET interest scores were brought forward from Module 1.';
     heading.insertBefore(note,document.getElementById('loadSkills'));
   }
 }
 if(!start.soc)return;
 try{
   const currentOcc=occs.find(o=>String(o.soc)===String(start.soc));
   if(!currentOcc)return;
   current=currentOcc;
   const occ=document.getElementById('occSearch'),code=document.getElementById('occSoc');
   if(occ)occ.value=currentOcc.title;
   if(code)code.value=currentOcc.soc;
   const tag=document.getElementById('selectedOcc');
   if(tag){tag.textContent='Previously selected: '+currentOcc.title+' • O*NET '+currentOcc.soc;tag.classList.remove('hidden')}
   const wage=document.getElementById('currentWage');
   if(wage&&Number(saved.currentWage)>0)wage.value=String(saved.currentWage);
   const note=document.getElementById('workNote');
   if(note&&saved.workNote)note.value=String(saved.workNote);
   renderOccupationalValue();
   showSavedCareerComparisons();
   if(Array.isArray(saved.selfAssessment)&&saved.selfAssessment.length){
     renderSkillCards();
     document.getElementById('skills')?.classList.remove('hidden');
     for(let i=0;i<currentSkills.length;i++){
       const item=saved.selfAssessment.find(x=>x.skill===currentSkills[i]);
       if(!item)continue;
       const choice=[...document.querySelectorAll('input[type="radio"]')].find(x=>x.name==='sk'+i&&x.value===item.use);
       if(choice)choice.checked=true;
     }
   }
   const panel=document.createElement('p');
   panel.style.cssText='background:#e7f4ff;color:#183b5c;border:1px solid #bddced;padding:12px;border-radius:10px;margin:12px 0';
   panel.textContent='Your previously saved occupation, wage, interest scores, and matching skill ratings are restored for review. Existing career decisions remain preserved in the saved results panel above. No completion has been submitted.';
   document.getElementById('selectedOcc')?.parentElement?.appendChild(panel);
 }catch(err){console.warn('BOOST mobility prefill unavailable',err)}
});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',request,{once:true});else request();
['occSearch','R','I','A','S','E','C'].forEach(id=>document.getElementById(id)?.addEventListener('change',()=>setTimeout(showSavedCareerComparisons,50)));
document.getElementById('occSearch')?.addEventListener('input',()=>setTimeout(showSavedCareerComparisons,200));
})();