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
function setNav(k){document.querySelectorAll('nav a').forEach(a=>a.classList.toggle('on',a.dataset.t===k));document.getElementById('back').style.display=(k==='home'||k==='ligues'||k==='profils'||k==='apropos')?'none':'block';window.scrollTo(0,0)}
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
let side='dom';
function team(id){const t=T[id];if(!t)return home();setNav('team');const l=lgByKey[t.lg];
 const v=t[side];
 app.innerHTML=`<h2>${esc(t.nom)}</h2><p class="sub">${l?`<a href="#/ligue/${l.i}">${esc(t.lgn)}</a>`:esc(t.lgn)} · ${t.n} matchs (2023-24 à 2025-26)</p>
 <div class="tabs"><button data-s="dom" class="${side==='dom'?'on':''}">🏠 Domicile</button><button data-s="ext" class="${side==='ext'?'on':''}">✈️ Extérieur</button></div>
 <p class="leg">Score vu côté ${esc(t.nom)} (ses buts d’abord). Barre verte = fréquence de l’équipe, trait blanc = normale du championnat.</p>
 ${v.top.map(x=>card(x.s,x.l,x.k,v.n,x.p,x.cj,x.e)).join('')}
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
 ${l.top.slice(0,6).map(x=>card(x.s,'',x.k,l.n,x.p,x.cj,null)).join('')}
 ${l.eq.length?`<h3>Équipes (${l.eq.length})</h3><div class="list">${l.eq.map(id=>`<a href="#/equipe/${id}">${esc(T[id].nom)}<small>${T[id].n} matchs ›</small></a>`).join('')}</div>`:''}`}
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
 if(h[0]==='equipe')team(+h[1]);else if(h[0]==='ligue')ligue(+h[1]);else if(h[0]==='ligues')ligues();else if(h[0]==='profils')profils();else if(h[0]==='apropos')apropos();else home()}
window.addEventListener('hashchange',route);route();
})();
