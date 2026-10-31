(function(){
'use strict';
function saved(){
 const data=window.boostModule3SavedCareerRecords?.()||{};
 const list=Array.isArray(data.careers)?data.careers:[];
 const out=[],seen=new Set();
 for(const item of list){
  if(!item||typeof item!=='object')continue;
  const soc=String(item.soc||item.socCode||item.onetSoc||'').split('.')[0];
  const occ=occs.find(x=>String(x.soc).split('.')[0]===soc);
  if(occ&&!seen.has(occ.soc)){seen.add(occ.soc);out.push(occ)}
 }
 return out;
}
function include(){
 if(!current)return;
 for(const o of saved())if(o.soc!==current.soc)selectedSocs.add(String(o.soc));
 updateComparisonUI();
}
window.boostAutoIncludeSaved=include;
window.addEventListener('boost-module3-saved-careers-ready',()=>{if(mode==='open'||mode==='target')include()});
function card(o,kind){
 const it=hasInterestProfile()?interest(o):null,sk=skillMatch(o),comp=occupationalAdjacency(current,o),fit=careerFit(o),m=immediateMobility(o);
 const same=String(current.soc)===String(o.soc);
 const baseline=currentWageBaseline().value,delta=Number(o.p25||0)-baseline;
 const d=decisionClass(o);
 const status=same?'Current occupation':(!access(o,current.jobZone||2,0)?'Preparation to explore':sk>=55?'Transferable experience worth testing':'Skills to develop or verify');
 return '<article class="compareCard"><div class="mode">'+esc(kind)+'</div><h3>'+esc(o.title)+'</h3>'+
 '<p><b>'+esc(status)+'</b></p>'+
 '<div class="compareMetric"><span>O*NET interest alignment</span><b>'+(it===null?'Not calculated':Math.round(it)+'%')+'</b></div>'+
 '<div class="compareMetric"><span>Occupational compatibility</span><b>'+(same?'Starting point':Math.round(comp)+'%')+'</b></div>'+
 '<div class="compareMetric"><span>Transferable skill alignment</span><b>'+(same?'Starting point':Math.round(sk)+'%')+'</b></div>'+
 '<div class="compareMetric"><span>Early-career wage</span><b>'+money(o.p25)+'/hr</b></div>'+
 '<div class="compareMetric"><span>Difference from my wage</span><b>'+(delta>=0?'+':'')+money(delta)+'/hr</b></div>'+
 '<div class="compareMetric"><span>Preparation</span><b>'+(same?'Current role':access(o,current.jobZone||2,0)?'Closer / Accessible':'Development to verify')+'</b></div>'+
 '<p class="sub">'+(same?'This is the baseline for my comparison.':(it!==null&&it>interest(current)?'Interest alignment is higher than my current occupation. ':'')+'My current skills and any credentials still need to be checked against employer requirements.')+'</p></article>';
}
window.boostConciseReport=function(){
 if(!current)return false;
 const explored=saved().filter(o=>String(o.soc)!==String(current.soc));
 const userSelected=selectedOccupations().filter(o=>!explored.some(x=>x.soc===o.soc)&&o.soc!==current.soc);
 if(target&&target.soc!==current.soc&&!explored.some(x=>x.soc===target.soc)&&!userSelected.some(x=>x.soc===target.soc))userSelected.unshift(target);
 const primary=[...explored,...userSelected];
 const already=new Set([current.soc,...primary.map(o=>o.soc)]);
 const extra=v9Pool().filter(o=>!already.has(o.soc)&&interest(o)>=65&&skillMatch(o)>=55).slice(0,3);
 const examples=primary.length?primary.map(o=>card(o,explored.some(x=>x.soc===o.soc)?'Explored in Modules 1–2':'Added in Module 3')).join(''):'<div class="note">No saved explored occupations were available in this session. Your existing research has not been changed.</div>';
 const questions=['Which career still interests me after considering actual duties and workplace conditions?','Which transferable skills can I demonstrate to an employer, and what skills or credentials are missing?','Could I reach my goal through an adjacent job, employer training or advancement without starting over?','How do wages, preparation time and regional opportunities compare with my current work?'];
 const report='<div class="reportgrid"><div class="reportbox"><b>THIS IS WHERE I AM</b><h3>'+esc(current.title)+'</h3><p>Current or last wage: <b>'+money(currentWageBaseline().value)+'/hr</b></p><p>Interest alignment: <b>'+(hasInterestProfile()?Math.round(interest(current))+'%':'Not calculated')+'</b></p><p>My confirmed skills: '+selectedSkillWeights().slice(0,5).map(x=>esc(x[0])).join(', ')+'</p></div>'+
 '<div class="reportbox"><b>THIS IS WHERE I AM EXPLORING</b><p>'+primary.map(o=>esc(o.title)).join(' • ')+'</p><p>These are the careers I carried forward or added to my comparison, not careers BOOST selected for me.</p></div></div>'+
 '<h3>How My Explored Careers Align</h3><p class="sub">My interests and my transferable skills are separate signals. A high interest match does not mean I am qualified or need training.</p><div class="compareGrid">'+examples+'</div>'+
 '<h3>A Few Other Opportunities Worth Considering</h3><p class="sub">These alternatives are optional, based on the interests and transferable skills I reported. They are not required steps toward my chosen career.</p>'+(extra.length?'<div class="compareGrid">'+extra.map(o=>card(o,'Additional opportunity to consider')).join('')+'</div>':'<p class="note">No additional opportunities met the current interest and skill comparison thresholds.</p>')+
 '<h3>What Should I Discuss Next With My Career Coach?</h3><div class="evidenceSummary">'+questions.map(q=>'<p>• '+esc(q)+'</p>').join('')+
 '<p><b>Module 3 contribution:</b> I compared my existing occupation and explored careers using my stated experience, O*NET interest alignment, occupational similarity, preliminary preparation indicators and wage differences. My next step is to verify specific requirements and decide whether to work now, move into an adjacent role or build toward a longer-term goal.</p><small>This is career-planning evidence, not proof of eligibility or a guarantee of employment.</small></div>';
 document.getElementById('reportBody').innerHTML=report;
 document.getElementById('reportSection').classList.remove('hidden');
 document.getElementById('reportSection').scrollIntoView({behavior:'smooth'});
 return true;
};
})();
