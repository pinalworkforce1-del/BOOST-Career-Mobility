(function(){
'use strict';
if(window===window.top)return;
const origins=new Set(['https://pinal.boostpathways.org','https://pinalworkforce1-del.github.io']);
function request(){window.parent.postMessage({type:'pinal-boost-module-restore-request',module:'module3'},'*')}
window.addEventListener('message',function(event){
 if(event.source!==window.parent||!origins.has(event.origin)||event.data?.type!=='pinal-boost-module-restore'||event.data.module!=='module3')return;
 const info=event.data.state||{},saved=info.module3||{},start=saved.startingPoint||{};
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
   const scores=info.module1?.scores||{};
   for(const letter of ['R','I','A','S','E','C']){
     const input=document.getElementById(letter);
     if(input&&Number.isFinite(Number(scores[letter])))input.value=String(scores[letter]);
   }
   renderOccupationalValue();
   if(Array.isArray(saved.selfAssessment)&&saved.selfAssessment.length){
     renderSkillCards();
     document.getElementById('skills')?.classList.remove('hidden');
     for(let i=0;i<currentSkills.length;i++){
       const item=saved.selfAssessment.find(x=>x.skill===currentSkills[i]);
       if(!item)return;
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
})();