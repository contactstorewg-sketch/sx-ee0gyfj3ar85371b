(function(){
const D=window.DATA,T=D.teams,LG=D.leagues,app=document.getElementById('app');
const fr=x=>String(x).replace('.',',');
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const norm=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9 ]+/g,' ').replace(/\s+/g,' ').trim();
const lgByKey={};LG.forEach((l,i)=>{l.i=i;lgByKey[l.k]=l});
T.forEach(t=>{t._n=norm(t.nom+' '+t.k+' '+(t.al||''));t._w=t._n.split(' ')});
function lev(a,b){if(Math.abs(a.length-b.length)>2)return 9;const m=[];for(let i=0;i<=a.length;i++){m[i]=[i];for(let j=1;j<=b.length;j++)m[i][j]=i?Math.min(m[i-1][j]+1,m[i][j-1]+1,m[i-1][j-1]+(a[i-1]===b[j-1]?0:1)):j}return m[a.length][b.length]}
function search(q){q=norm(q);if(!q)return[];const qw=q.split(' ');const out=[];
 for(const t of T){let s=0;
  if(t._n===q)s=100;else if(t._w.includes(q))s=90;else if(t._n.startsWith(q))s=80;else if(t._w.some(w=>w.startsWith(q)))s=70;else if(t._n.includes(q))s=55;
  else{let ok=0;for(const w of qw){let best=9;for(const x of t._w){best=Math.min(best,lev(w,x),w.length>=4?lev(w,x.slice(0,w.length)):9)}if(best<=(w.length>5?2:1))ok++}if(ok===qw.length)s=40}
  if(s)out.push([s+Math.min(t.n,400)/100,t])}
 return out.sort((a,b)=>b[0]-a[0]).slice(0,8).map(x=>x[1])}
function teamLink(t){return `<a href="#/equipe/${t.id}">${esc(t.nom)}<small>${esc(t.lgn)}</small></a>`}
function setNav(k){document.querySelectorAll('nav a').forEach(a=>a.classList.toggle('on',a.dataset.t===k));document.getElementById('back').style.display=(k==='home'||k==='ligues'||k==='profils'||k==='apropos'||k==='match')?'none':'block';window.scrollTo(0,0)}
const BIG=['Ligue 1','Premier League','Liga','Serie A','Bundesliga','Ligue 2','Ligue des champions'];
function home(){setNav('home');
 const fav=['Paris SG','Lille','Marseille','Lyon','Monaco','Lens'].map(k=>T.find(t=>t.k===k)).filter(Boolean);
 app.innerHTML=`<h2>Quel score sort le plus ?</h2><p class="sub">Tape le nom d’une équipe (ex. « psg », « lille », « real »).</p>
 <div class="search"><input id="q" type="search" autocomplete="off" placeholder="Rechercher une équipe…" aria-label="Rechercher une équipe"></div>
 <div class="res" id="res"></div>
 <h3>Raccourcis</h3><div class="chips">${fav.map((t,i)=>`<a class="${i<2?'hot':''}" href="#/equipe/${t.id}">${esc(t.k==='Paris SG'?'PSG':t.nom)}</a>`).join('')}</div>
 <h3>Grands championnats</h3><div class="chips">${BIG.map(k=>lgByKey[k]).filter(Boolean).map(l=>`<a href="#/ligue/${l.i}">${esc(l.nom)}</a>`).join('')}</div>
 <h3>Tous matchs confondus</h3><p class="sub">${fr(D.nmatch.toLocaleString('fr-FR'))} matchs, saisons 2023-24 à 2025-26 (score domicile-extérieur).</p>
 ${D.glob.slice(0,5).map(g=>card(g.s,'',g.k,D.nmatch,g.p,g.cj,null)).join('')}`;
 const q=document.getElementById('q'),res=document.getElementById('res');
 q.addEventListener('input',()=>{const r=search(q.value);res.innerHTML=q.value.trim()&&!r.length?'<p class="sub">Aucune équipe trouvée. Essaie un autre mot.</p>':r.map(teamLink).join('')});
 q.addEventListener('keydown',e=>{if(e.key==='Enter'){const r=search(q.value);if(r[0])location.hash='#/equipe/'+r[0].id}});
}
function card(s,lab,k,n,p,cj,e){
 const max=Math.max(p,e||0,1),w=Math.min(100,p/Math.max(25,max*1.15)*100),we=e!=null?Math.min(100,e/Math.max(25,max*1.15)*100):null;
 let cmp='';if(e!=null){const d=p-e;const cls=Math.abs(d)<1.5?'eq':d>0?'up':'dn',ar=Math.abs(d)<1.5?'≈':d>0?'↑':'↓';
  cmp=`<div class="cmp"><span class="${cls}">${ar}</span> Normale du championnat : <b>${fr(e.toFixed(1))} %</b> (cote juste ${e>0?fr((100/e).toFixed(1)):'–'})</div>`}
 return `<div class="sc"><div class="row"><div class="big">${esc(s)}</div><div><div class="lab">${esc(lab)}</div><div class="pct">${fr(p.toFixed(1))} %</div><div class="fx">${k} fois sur ${n} matchs · cote juste <b>${fr(cj.toFixed(1))}</b></div></div></div>
 <div class="bar"><i style="width:${w}%"></i>${we!=null?`<b style="left:${we}%"></b>`:''}</div>${cmp}</div>`}
function autres(arr,n,nb){const k=n-arr.reduce((a,x)=>a+x.k,0),p=n?k/n*100:0;
 return `<div class="sc oth"><div class="row"><div class="big">…</div><div><div class="lab">Tous les autres scores</div><div class="pct">${fr(p.toFixed(1))} %</div><div class="fx">${k} fois sur ${n} matchs</div></div></div></div>
 <p class="leg">Total : les ${nb} scores ci-dessus + les autres = 100 %.</p>`}

const P10=x=>fr((x*10).toFixed(1));
const pc=x=>fr((x*100).toFixed(1))+' %';
function bars(rows){const mx=Math.max(...rows.map(r=>r[1]),0.01);
 return `<div class="bars">${rows.map(r=>`<div class="br"><div class="bl">${r[0]}</div><div class="bt"><i style="width:${Math.max(2,r[1]/mx*100)}%"></i></div><div class="bv">${pc(r[1])}${r[2]!=null?`<small>${r[2]}</small>`:''}</div></div>`).join('')}</div>`}
function butsTeam(t,side){const v=t[side],b=v.b;if(!b)return '';const n=v.n,nm=esc(t.nom);
 const L=['0 but','1 but','2 buts','3 buts','4 buts','5 buts ou +'];
 const over=b.t[3]+b.t[4]+b.t[5],t23=b.t[2]+b.t[3];
 const DL=[`${nm} gagne de 2 buts ou +`,`${nm} gagne d’1 but`,'Match nul',`${nm} perd d’1 but`,`${nm} perd de 2 buts ou +`];
 return `<h3>⚽ Nombre de buts dans le match</h3><p class="leg">Total des 2 équipes, ${side==='dom'?'à domicile':'à l’extérieur'}, sur ${n} matchs. Moyenne : <b>${fr(((b.gf+b.ga)/n).toFixed(2))} buts</b> (${fr((b.gf/n).toFixed(2))} marqués, ${fr((b.ga/n).toFixed(2))} encaissés).</p>
 ${bars(L.map((l,i)=>[l,b.t[i]/n,b.t[i]+' fois']))}<p class="leg">Total = 100 %.</p>
 <h3>📈 Tendances</h3>
 <div class="tg"><div class="ti"><b>${pc(b.bt/n)}</b>Les deux équipes marquent</div><div class="ti"><b>${pc(over/n)}</b>Plus de 2,5 buts</div>
 <div class="ti"><b>${pc(1-over/n)}</b>Moins de 2,5 buts</div><div class="ti"><b>${pc(t23/n)}</b>2 ou 3 buts</div></div>
 <h3>↔️ Écart de buts</h3>${bars(DL.map((l,i)=>[l,b.d[i]/n,b.d[i]+' fois']))}`}
// ---- modèle Match (même calcul que le test sur 2025-26) ----
function pois(l){const o=[];let p=Math.exp(-l);for(let k=0;k<=10;k++){o.push(p);p*=l/(k+1)}return o}
function model(h,a){const K=D.K||25,l1=lgByKey[h.lg],l2=lgByKey[a.lg];
 let Lh=D.gm[0],La=D.gm[1];if(l1&&l2&&l1.mh){Lh=(l1.mh+l2.mh)/2;La=(l1.ma+l2.ma)/2}
 const H=h.dom,A=a.ext;
 const attH=(H.b.gf+K*Lh)/(H.n+K),defA=(A.b.ga+K*Lh)/(A.n+K),attA=(A.b.gf+K*La)/(A.n+K),defH=(H.b.ga+K*La)/(H.n+K);
 const lh=attH*defA/Lh,la=attA*defH/La,ph=pois(lh),pa=pois(la);
 const M=[];let s=0;for(let i=0;i<=10;i++)for(let j=0;j<=10;j++){const p=ph[i]*pa[j];M.push([i,j,p]);s+=p}M.forEach(x=>x[2]/=s);
 const tot=[0,0,0,0,0,0],dif=[0,0,0,0,0];let bt=0;
 for(const [i,j,p] of M){tot[Math.min(i+j,5)]+=p;const d=i-j;dif[d>=2?0:d==1?1:d==0?2:d==-1?3:4]+=p;if(i&&j)bt+=p}
 return {lh,la,M,tot,dif,bt,over:tot[3]+tot[4]+tot[5]}}
function pick(slot,label){return `<div class="pk"><div class="pkl">${label}</div><div id="sel${slot}"></div><div class="search"><input id="mq${slot}" type="search" autocomplete="off" placeholder="Rechercher une équipe…" aria-label="${label}"></div><div class="res" id="mr${slot}"></div></div>`}
function match(hid,aid){setNav('match');const BT=D.bt;let sel=[T[hid]||null,T[aid]||null];
 app.innerHTML=`<h2>Analyse d’un match</h2><p class="sub">Choisis les deux équipes. L’appli donne la tendance la plus probable et dit combien de fois ce type de prévision a été juste sur la saison 2025-26.</p>
 ${pick(0,'🏠 Équipe à domicile')}${pick(1,'✈️ Équipe à l’extérieur')}<div id="mo"></div>`;
 const draw=()=>{[0,1].forEach(k=>{const t=sel[k];document.getElementById('sel'+k).innerHTML=t?`<div class="chosen"><span>${esc(t.nom)}<small>${esc(t.lgn)}</small></span><button data-k="${k}">Changer</button></div>`:'';
   document.getElementById('mq'+k).parentNode.style.display=t?'none':'block';if(t)document.getElementById('mr'+k).innerHTML=''});
  app.querySelectorAll('.chosen button').forEach(b=>b.onclick=()=>{sel[+b.dataset.k]=null;history.replaceState(null,'','#/match');draw();document.getElementById('mq'+b.dataset.k).focus()});
  const mo=document.getElementById('mo');
  if(sel[0]&&sel[1]){if(sel[0]===sel[1]){mo.innerHTML='<p class="sub">Choisis deux équipes différentes.</p>';return}
   history.replaceState(null,'',`#/match/${sel[0].id}/${sel[1].id}`);mo.innerHTML=result(sel[0],sel[1],BT)}else mo.innerHTML=''};
 [0,1].forEach(k=>{const q=document.getElementById('mq'+k),r=document.getElementById('mr'+k);
  const show=()=>{const x=search(q.value).filter(t=>t!==sel[1-k]);r.innerHTML=q.value.trim()&&!x.length?'<p class="sub">Aucune équipe trouvée.</p>':x.map(t=>`<a href="#" data-id="${t.id}">${esc(t.nom)}<small>${esc(t.lgn)}</small></a>`).join('');
   r.querySelectorAll('a').forEach(a=>a.onclick=e=>{e.preventDefault();sel[k]=T[+a.dataset.id];q.value='';draw();if(!sel[1-k])document.getElementById('mq'+(1-k)).focus()})};
  q.addEventListener('input',show);q.addEventListener('keydown',e=>{if(e.key==='Enter'){const x=search(q.value).filter(t=>t!==sel[1-k]);if(x[0]){sel[k]=x[0];q.value='';draw()}}})});
 draw()}
function rate(x,txt){return `<div class="rt">✅ Juste <b>${P10(x)} fois sur 10</b> ${txt||'en 2025-26'}</div>`}
function result(h,a,BT){const m=model(h,a),hn=esc(h.nom),an=esc(a.nom);
 const TL=['0 but','1 but','2 buts','3 buts','4 buts','5 buts ou +'];
 let bi=0;m.tot.slice(0,5).forEach((p,i)=>{if(p>m.tot[bi])bi=i});
 let rs=0;for(let s=1;s<=3;s++)if(m.tot.slice(s,s+3).reduce((x,y)=>x+y,0)>m.tot.slice(rs,rs+3).reduce((x,y)=>x+y,0))rs=s;
 const rp=m.tot.slice(rs,rs+3).reduce((x,y)=>x+y,0),rl=rs===3?'3 buts ou +':`${rs} à ${rs+2} buts`;
 const ov=m.over>=0.5,op=ov?m.over:1-m.over,conf=op>=0.6;
 const DL=[`Victoire de ${hn} par 2 buts ou +`,`Victoire de ${hn} par 1 but`,'Match nul',`Victoire de ${an} par 1 but`,`Victoire de ${an} par 2 buts ou +`];
 let di=0;m.dif.forEach((p,i)=>{if(p>m.dif[di])di=i});
 const top=m.M.slice().sort((x,y)=>y[2]-x[2]).slice(0,3),t3=top.reduce((x,y)=>x+y[2],0);
 const bty=m.bt>=0.5;
 return `<h3>${hn} – ${an}</h3><p class="leg">Buts attendus : ${hn} <b>${fr(m.lh.toFixed(2))}</b> · ${an} <b>${fr(m.la.toFixed(2))}</b> (d’après leurs ${h.dom.n} matchs à domicile et ${a.ext.n} à l’extérieur).</p>
 <div class="mc"><div class="mt">Nombre exact de buts le plus probable</div><div class="mv">${TL[bi]}</div><div class="mp">${pc(m.tot[bi])} de chances</div>${rate(BT.tot)}
  ${bars(TL.map((l,i)=>[l,m.tot[i]]))}</div>
 <div class="mc best"><div class="mt">⭐ Fourchette la plus sûre</div><div class="mv">${rl}</div><div class="mp">${pc(rp)} de chances</div>${rate(BT.r3)}</div>
 <div class="mc"><div class="mt">Plus ou moins de 2,5 buts</div><div class="mv">${ov?'Plus de 2,5':'Moins de 2,5'}</div><div class="mp">${pc(op)} de chances</div>
  ${conf?rate(BT.ou60,'en 2025-26 quand l’appli était aussi sûre (60 % ou plus)'):rate(BT.ou,'en 2025-26')+'<div class="lw">Ici c’est presque du 50/50 : tendance faible.</div>'}</div>
 <div class="mc"><div class="mt">Les deux équipes marquent</div><div class="mv">${bty?'Oui':'Non'}</div><div class="mp">${pc(bty?m.bt:1-m.bt)} de chances</div>${rate(BT.btts)}
  <div class="lw">⚠️ Pas mieux que de toujours dire « oui » (${P10(BT.btts_base)} sur 10). Peu fiable.</div></div>
 <div class="mc"><div class="mt">Écart de buts le plus probable</div><div class="mv sm">${DL[di]}</div><div class="mp">${pc(m.dif[di])} de chances</div>${rate(BT.dif)}</div>
 <div class="mc"><div class="mt">Les 3 scores les plus probables</div>${top.map(x=>`<div class="ts"><b>${x[0]}-${x[1]}</b><span>${pc(x[2])}</span></div>`).join('')}
  <div class="mp">Un des 3 : ${pc(t3)} de chances</div>${rate(BT.top3,'en 2025-26 (le bon score était dans les 3)')}<div class="lw">Le 1er score seul : juste ${P10(BT.top1)} fois sur 10.</div></div>
 <div class="warn">Ce sont des <b>stats du passé</b>, pas un conseil de pari. Test fait sur ${BT.n.toLocaleString('fr-FR')} matchs de 2025-26, en utilisant seulement les matchs joués avant chaque rencontre. Les prévisions « plus/moins 2,5 » testées perdaient environ 6 % face aux cotes moyennes du marché.</div>
 <p class="foot">Les jeux d’argent comportent des risques : endettement, dépendance… Appelez le 09 74 75 13 13 (appel non surtaxé). Interdit aux moins de 18 ans.</p>`}
let side='dom';
function team(id){const t=T[id];if(!t)return home();setNav('team');const l=lgByKey[t.lg];
 const v=t[side];
 app.innerHTML=`<h2>${esc(t.nom)}</h2><p class="sub">${l?`<a href="#/ligue/${l.i}">${esc(t.lgn)}</a>`:esc(t.lgn)} · ${t.n} matchs (2023-24 à 2025-26)</p>
 <div class="tabs"><button data-s="dom" class="${side==='dom'?'on':''}">🏠 Domicile</button><button data-s="ext" class="${side==='ext'?'on':''}">✈️ Extérieur</button></div>
 <p class="leg">Score vu côté ${esc(t.nom)} (ses buts d’abord). Barre verte = fréquence de l’équipe, trait blanc = normale du championnat.</p>
 ${v.top.map(x=>card(x.s,x.l,x.k,v.n,x.p,x.cj,x.e)).join('')}${autres(v.top,v.n,v.top.length)}
 ${butsTeam(t,side)}
 <div class="note"><b>Est-ce significatif ?</b><br>${t.notes.length?t.notes.map(esc).join('<br>')+'<br>':''}
 ${t.ts?(t.notes.length?'Les autres écarts ne passent pas les tests statistiques : ils peuvent venir du hasard.':'Non : aucun écart de cette équipe ne passe les tests statistiques (correction pour tests multiples, vérification sur 2025-26). Ils peuvent venir du hasard.'):'Pas assez de matchs pour un test fiable : les écarts peuvent venir du hasard.'}
 <br><span class="leg">La « normale » ne tient pas compte du niveau de l’équipe : un gros club gagne plus souvent que la moyenne, c’est normal.</span></div>
 <div class="warn">Cote juste = 1 ÷ fréquence passée. Ce n’est pas une prévision et les bookmakers proposent moins (marge).</div>`;
 app.querySelectorAll('.tabs button').forEach(b=>b.onclick=()=>{side=b.dataset.s;team(id)});
}
function ligues(){setNav('ligues');
 const ch=LG.filter(l=>l.eq.length),cups=LG.filter(l=>!l.eq.length);
 app.innerHTML=`<h2>Championnats</h2><p class="sub">Touche un championnat pour voir ses scores les plus fréquents et ses équipes.</p>
 <div class="list">${ch.map(l=>`<a href="#/ligue/${l.i}">${esc(l.nom)}<small>${l.n} matchs</small></a>`).join('')}</div>
 <h3>Coupes et compétitions</h3><div class="list">${cups.map(l=>`<a href="#/ligue/${l.i}">${esc(l.nom)}<small>${l.n} matchs</small></a>`).join('')}</div>`}
function ligue(i){const l=LG[i];if(!l)return ligues();setNav('ligue');
 app.innerHTML=`<h2>${esc(l.nom)}</h2><p class="sub">${l.n} matchs, 2023-24 à 2025-26 · score domicile-extérieur</p>
 ${l.eq.length?`<div class="search"><input id="lq" type="search" autocomplete="off" placeholder="Chercher une équipe de ce championnat…" aria-label="Chercher une équipe"></div>
 <h3 id="lh">Équipes (${l.eq.length})</h3><div class="list" id="ll"></div>`:''}
 <h3>Scores les plus fréquents</h3>
 ${l.top.slice(0,6).map(x=>card(x.s,'',x.k,l.n,x.p,x.cj,null)).join('')}${autres(l.top.slice(0,6),l.n,Math.min(6,l.top.length))}`;
 if(l.eq.length){const lq=document.getElementById('lq'),ll=document.getElementById('ll');
  const draw=()=>{const q=norm(lq.value);const ids=l.eq.filter(id=>!q||T[id]._n.includes(q)||T[id]._w.some(w=>lev(q,w)<=1));
   ll.innerHTML=ids.length?ids.map(id=>`<a href="#/equipe/${id}">${esc(T[id].nom)}<small>${T[id].n} matchs ›</small></a>`).join(''):'<p class="sub">Aucune équipe trouvée dans ce championnat.</p>'};
  lq.addEventListener('input',draw);lq.addEventListener('keydown',e=>{if(e.key==='Enter'){const a=ll.querySelector('a');if(a)location.hash=a.getAttribute('href')}});draw()}}
const PROF=[
 ['0-0','Quand les cotes annoncent peu de buts, le 0-0 sort plus souvent.','11,3 %','7,0 %'],
 ['1-1','Quand le « Plus de 2,5 buts » est coté 2,10 ou plus, le 1-1 sort un peu plus souvent.','14,0 %','12,2 %'],
 ['1-0','Peu de buts attendus et favori à domicile : le 1-0 domicile ressort.','14,3 %','9,7 %'],
 ['2-0','Gros favori à domicile : le 2-0 domicile ressort.','11,5 %','6,8 %'],
 ['0-1','Favori à l’extérieur : le 0-1 ressort.','9,6 %','7,0 %'],
 ['1-2','Favori à l’extérieur : le 1-2 ressort aussi.','9,8 %','7,5 %']];
function profils(){setNav('profils');
 app.innerHTML=`<h2>Profils de match</h2><p class="sub">Situations où un score sort plus souvent que la moyenne (vérifié sur 2025-26). Score domicile-extérieur.</p>
 ${PROF.map(p=>`<div class="prof"><div class="s">${p[0]}</div><p>${p[1]}</p><p><b class="up">${p[2]}</b> des matchs de ce profil, contre <b>${p[3]}</b> en moyenne.</p></div>`).join('')}
 <div class="warn"><b>Important :</b> tous ces profils viennent des cotes elles-mêmes, donc les bookmakers les connaissent déjà. Face à des cotes réalistes (marge incluse), <b>aucun profil n’était rentable</b> dans nos simulations. Nous n’avons pas d’archive des cotes Winamax pour vérifier sur leurs cotes.</div>`}
function apropos(){setNav('apropos');
 app.innerHTML=`<h2>À propos</h2>
 <p><b>${D.nmatch.toLocaleString('fr-FR')} matchs</b> de football, saisons <b>2023-24, 2024-25 et 2025-26</b>, ${LG.length} compétitions, ${T.length} équipes (au moins 30 matchs).</p>
 <h3>Sources</h3><ul><li>football-data.co.uk (résultats et cotes)</li><li>betexplorer.com (coupes et compétitions non couvertes)</li></ul>
 <h3>Méthode</h3><ul><li>Score à la fin du temps réglementaire (90 minutes).</li><li>Exclus : équipes réserves, jeunes, féminines, sélections nationales, Russie.</li><li>Cote juste = 1 ÷ fréquence observée.</li><li>Normale du championnat = fréquence moyenne de ce score dans les compétitions où l’équipe a joué.</li><li>Tests : correction pour tests multiples (Benjamini-Hochberg), puis vérification sur la saison 2025-26.</li></ul>
 <h3>Limites</h3><ul><li>Le passé ne prédit pas l’avenir : effectifs et entraîneurs changent.</li><li>Petits échantillons : sur 40 matchs, 2 ou 3 scores de plus suffisent à créer un écart.</li><li>Les cotes réelles contiennent une marge : la cote proposée est en général plus basse que la cote juste.</li><li>Aucune stratégie rentable n’a été trouvée.</li></ul>
 <p class="leg">Application d’information statistique, sans lien avec un opérateur de paris. Aucune donnée collectée, aucun compte.</p>
 <p class="foot">Les jeux d’argent comportent des risques : endettement, dépendance… Appelez le 09 74 75 13 13 (appel non surtaxé). Interdit aux moins de 18 ans.</p>`}
function route(){const h=location.hash.replace(/^#\/?/,'').split('/');
 if(h[0]==='equipe')team(+h[1]);else if(h[0]==='ligue')ligue(+h[1]);else if(h[0]==='ligues')ligues();else if(h[0]==='profils')profils();else if(h[0]==='apropos')apropos();else if(h[0]==='match')match(+h[1],+h[2]);else home()}
window.addEventListener('hashchange',route);route();
})();
