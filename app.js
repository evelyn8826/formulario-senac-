var AREAS = [];
var ST = ["REALIZADO","EM ANDAMENTO","PREVISTO","NAO INICIADO","NAO REALIZADO"];
var SK = {REALIZADO:"REA","EM ANDAMENTO":"EA",PREVISTO:"PRE","NAO INICIADO":"NI","NAO REALIZADO":"NR"};
var T70 = ["JOB ROTATION","LIDERANCA DE PROJETO DESAFIADOR","RESOLUCAO DE PROBLEMAS"];
var T20 = ["BENCHMARKING","COMUNIDADE DE PRATICA","COMPARTILHAMENTO DE CONHECIMENTO","FEEDBACK ESTRUTURADO","MENTORIA","VISITA TECNICA"];
var DIRS = [
  "I. Oferta de educacao profissional alinhada as demandas do mercado e da sociedade",
  "II. Promocao de inclusao produtiva, sustentabilidade e diversidade",
  "III. Efetividade no relacionamento com o setor produtivo",
  "IV. Fortalecimento da comunicacao e da visibilidade institucional",
  "V. Promocao da inovacao no Senac e no setor produtivo",
  "VI. Fortalecimento dos mecanismos de conformidade",
  "VII. Fortalecimento da gestao sistemica orientada a dados e resultados"
];
var COMPS = ["Atuacao Integrada","Excelencia no Trabalho","Orientacao para Inovacao","Lideranca e Gestao de Pessoas"];
var S = {
  step: location.pathname === "/painel" ? "painel" : "home",
  area:"", ai:0, st:{}, bk:"", cls:[], ac:{},
  pt:"st", fs:"", fa:"",
  n:{nm:"",jt:"",tp:"",cl:"",ori:"",cp:"",md:"",vg:"",cg:"",di:"",df:"",sa:"",pp:[]}
};

function el(id) { return document.getElementById(id); }
function R(h) { el("app").innerHTML = h; window.scrollTo(0,0); }
function go(p) { S.step = p; D(); }
function goH() { go("home"); }
function goM() { go("modo"); }
function goAc() { go("acoes"); }
function goL() { go("login"); }
function openD() { el("dov").classList.add("open"); el("drw").classList.add("open"); }
function closeD() { el("dov").classList.remove("open"); el("drw").classList.remove("open"); }

function ge(t) {
  if (T70.indexOf(t) >= 0) return "70";
  if (T20.indexOf(t) >= 0) return "20";
  return "10";
}
function bd(s) {
  return {REALIZADO:"#28a745","EM ANDAMENTO":"#ffc107",PREVISTO:"#17a2b8","NAO INICIADO":"#ced4da","NAO REALIZADO":"#dc3545"}[s] || "#ced4da";
}
function bc(s) {
  return {REALIZADO:"#155724","EM ANDAMENTO":"#856404",PREVISTO:"#0c5460","NAO INICIADO":"#6c757d","NAO REALIZADO":"#721c24"}[s] || "#6c757d";
}
function sc(s) {
  return {REALIZADO:"sR","EM ANDAMENTO":"sE",PREVISTO:"sP","NAO INICIADO":"sN","NAO REALIZADO":"sNR"}[s] || "sN";
}

function ajax(method, url, data, cb) {
  var x = new XMLHttpRequest();
  x.open(method, url);
  if (method === "POST") x.setRequestHeader("Content-Type","application/json");
  x.onload = function() {
    try { cb(null, JSON.parse(x.responseText)); }
    catch(e) { cb(e, null); }
  };
  x.onerror = function() { cb(new Error("network"), null); };
  x.send(data ? JSON.stringify(data) : null);
}

function LI(h) {
  h = h || 32;
  return '<img src="/static/logo.png" alt="Senac" style="height:' + h + 'px;object-fit:contain;">';
}
function HDR(sub, title, backFn, backLbl) {
  var b = backFn ? '<button class="btn bh" onclick="' + backFn + '()">&#8592; ' + (backLbl||"Voltar") + '</button>' : "";
  return '<div class="hdr"><div class="hl">' + LI() + '<div class="ht"><p>' + sub + '</p><h2>' + title + '</h2></div></div>' + b + '</div>';
}

// ── HOME ──────────────────────────────────────────────────────
function rHome() {
  R('<div class="home-wrap">'
   + '<div class="home-nav">' + LI(42) + '<span>Gerencia de Recursos Humanos</span></div>'
   + '<div class="home-body">'
   + '<div class="home-tag"><span>Gerencia de Recursos Humanos &mdash; Senac DN</span></div>'
   + '<h1 class="home-title">A&ccedil;&otilde;es de Desenvolvimento<br><span>70 &middot; 20 &middot; 10</span></h1>'
   + '<p class="home-sub">Mapeamento de a&ccedil;&otilde;es de desenvolvimento de time</p>'
   + '<div class="home-btns">'
   + '<button class="btn bg bf" onclick="goA()">Acessar Formul&aacute;rio</button>'
   + '<button class="btn bf" style="background:transparent;border:1.5px solid rgba(255,255,255,.2);color:rgba(255,255,255,.5);margin-top:.25rem;" onclick="goL()">Acesso &mdash; Recursos Humanos</button>'
   + '</div></div></div>');
}

// ── AREA ──────────────────────────────────────────────────────
function goA() {
  if (AREAS.length > 0) { S.step = "area"; rArea(); return; }
  R('<div class="loading"><p>Carregando areas...</p></div>');
  ajax("GET", "/api/areas", null, function(e, d) {
    if (e) { alert("Erro ao carregar areas. Servidor ativo?"); rHome(); return; }
    AREAS = d;
    S.step = "area";
    rArea();
  });
}
function rArea() {
  var f = S.bk;
  var lista = AREAS.filter(function(a) { return !f || a.toLowerCase().indexOf(f.toLowerCase()) >= 0; });
  var rows = lista.map(function(a) {
    var i = AREAS.indexOf(a);
    return '<div class="ai" onclick="selA(' + i + ')">'
      + '<span style="font-size:.9rem;font-weight:600;">' + a + '</span>'
      + '<span style="color:#9aa0a8;">&#8594;</span></div>';
  }).join("");
  R(HDR("Gerencia de Recursos Humanos", "Selecione sua area", "goH", "Voltar")
   + '<div class="page" style="padding-top:1.5rem;">'
   + '<div class="card ca" style="margin-bottom:1rem;"><p style="font-size:.85rem;color:#856404;">Selecione sua secao para carregar colaboradores e acoes mapeadas.</p></div>'
   + '<input placeholder="Buscar area..." value="' + f + '" oninput="S.bk=this.value;rArea();" style="margin-bottom:.75rem;">'
   + '<div class="sc">' + rows + '</div></div>');
}
function selA(i) {
  S.area = AREAS[i]; S.ai = 0;
  R('<div class="loading"><p>Carregando ' + S.area + '...</p></div>');
  ajax("POST", "/api/area", {area: S.area}, function(e, d) {
    if (e) { alert("Erro ao carregar area."); return; }
    S.cls = d.colabs || []; S.ac = d.acoes || {}; S.st = {};
    var ks = Object.keys(S.ac);
    for (var i = 0; i < ks.length; i++) {
      var ps = S.ac[ks[i]].p || [];
      for (var j = 0; j < ps.length; j++) S.st[ks[i]+"||"+ps[j][0]] = ps[j][2] || "NAO INICIADO";
    }
    S.step = "modo"; rModo();
  });
}

// ── MODO ──────────────────────────────────────────────────────
function rModo() {
  var nA = Object.keys(S.ac).length, nC = S.cls.length;
  var atCard = nA > 0
    ? '<div class="mc" onclick="goAc()">'
      + '<div style="font-size:1.8rem;margin-bottom:.5rem;">&#10003;</div>'
      + '<h3>Atualizar acoes ja mapeadas</h3>'
      + '<p>Confirme o status dos colaboradores nas ' + nA + ' acoes planejadas.</p></div>'
    : "";
  R(HDR(S.area, "O que deseja fazer?", "goA", "Trocar area")
   + '<div class="page" style="padding-top:1.5rem;">'
   + '<div class="card ca" style="margin-bottom:1.5rem;">'
   + '<p style="font-size:.7rem;color:#9aa0a8;text-transform:uppercase;margin-bottom:3px;">Area selecionada</p>'
   + '<h3 style="font-size:1.1rem;">' + S.area + '</h3>'
   + '<p style="font-size:.8rem;color:#856404;margin-top:.25rem;">' + nC + ' colaboradores &middot; ' + nA + ' acoes mapeadas</p></div>'
   + '<p class="lb">O que voce deseja fazer?</p>'
   + atCard
   + '<div class="mc" onclick="rNova(true)">'
   + '<div style="font-size:1.8rem;margin-bottom:.5rem;">+</div>'
   + '<h3>Registrar nova acao realizada</h3>'
   + '<p>Registre uma acao 70/20 que sua equipe realizou e que nao estava no plano.</p>'
   + '</div></div>');
}

// ── ATUALIZAR ─────────────────────────────────────────────────
function rAcoes() {
  var ks = Object.keys(S.ac), idx = S.ai, ac = ks[idx], d = S.ac[ac];
  if (!d) { goM(); return; }
  var exp = parseFloat(d.e), ec = exp===70?"e70":exp===20?"e20":"e10";
  var dn = function(a) {
    var ps = S.ac[a] ? S.ac[a].p || [] : [];
    for (var j = 0; j < ps.length; j++) if (!S.st[a+"||"+ps[j][0]] || S.st[a+"||"+ps[j][0]]==="NAO INICIADO") return false;
    return true;
  };
  var dots = ks.map(function(a,i) {
    return '<div class="dot ' + (i===idx?"cur":dn(a)?"dn":"") + '" onclick="S.ai=' + i + ';rAcoes();" title="' + a + '"></div>';
  }).join("");
  var pH = (d.p||[]).map(function(p) {
    var ch = p[0], nm = p[1], st = S.st[ac+"||"+ch]||"NAO INICIADO", chs = ch.replace(".0","");
    var pills = ST.map(function(o) {
      return '<button class="pill ' + (st===o?"p"+SK[o]:"") + '" data-ac="' + ac + '" data-ch="' + ch + '" data-val="' + o + '" onclick="uSt(this)">' + o + '</button>';
    }).join("");
    return '<div class="pcd" style="border-color:' + bd(st) + '33;" id="cd' + chs + '">'
      + '<div style="display:flex;justify-content:space-between;margin-bottom:.5rem;">'
      + '<div><div style="font-size:.86rem;font-weight:600;">' + nm + '</div>'
      + '<div style="font-size:.68rem;color:#9aa0a8;">Chapa ' + chs + '</div></div>'
      + '<span class="sb ' + sc(st) + '" id="sb' + chs + '">' + st + '</span></div>'
      + '<div style="display:flex;gap:.3rem;flex-wrap:wrap;">' + pills + '</div></div>';
  }).join("");
  var bbs = ST.map(function(s) {
    return '<button class="btn" data-mac="' + ac + '" data-mval="' + s + '" style="padding:3px 9px;border-radius:20px;font-size:.7rem;background:' + bd(s) + '22;color:' + bc(s) + ';border:1.5px solid ' + bd(s) + '66;" onclick="mAll(this)">* ' + s + '</button>';
  }).join("");
  var nxt = idx < ks.length-1
    ? '<button class="btn bn" style="flex:2;" onclick="S.ai++;rAcoes();">Proxima &#8594;</button>'
    : '<button class="btn bv" style="flex:2;" onclick="sAtu()">Enviar respostas</button>';
  R(HDR(S.area, "Acao "+(idx+1)+" de "+ks.length, "goM", "Modo")
   + '<div style="max-width:760px;margin:0 auto;padding:0 1rem;"><div class="pr"><div class="prf" style="width:' + Math.round((idx+1)/ks.length*100) + '%;"></div></div></div>'
   + '<div class="page">'
   + '<div class="card cb" style="margin-top:1rem;display:flex;align-items:center;gap:.75rem;">'
   + '<span class="eb ' + ec + '">' + exp + '%</span>'
   + '<div><h3 style="margin-bottom:2px;">' + ac + '</h3>'
   + '<p class="mu" style="font-size:.75rem;">' + d.t + ' &middot; ' + (d.p||[]).length + ' colaborador(es)</p></div></div>'
   + '<div class="bb"><span>Marcar todos como:</span>' + bbs + '</div>'
   + '<span class="lb">Status por colaborador</span>' + pH
   + '<div class="nr"><button class="btn bh2" ' + (idx===0?"disabled":"") + ' onclick="S.ai--;rAcoes();">&#8592; Anterior</button>' + nxt + '</div>'
   + '<div class="dots">' + dots + '</div></div>');
}
function uSt(btn) {
  var ac = btn.getAttribute("data-ac"), ch = btn.getAttribute("data-ch"), val = btn.getAttribute("data-val");
  S.st[ac+"||"+ch] = val;
  var chs = ch.replace(".0","");
  var sb = el("sb"+chs); if (sb) { sb.textContent = val; sb.className = "sb "+sc(val); }
  var cd = el("cd"+chs); if (cd) {
    cd.style.borderColor = bd(val)+"33";
    var pp = cd.querySelectorAll(".pill");
    for (var i = 0; i < pp.length; i++) { var pv = pp[i].getAttribute("data-val"); pp[i].className = "pill"+(pv===val?" p"+SK[pv]:""); }
  }
}
function mAll(btn) {
  var ac = btn.getAttribute("data-mac"), val = btn.getAttribute("data-mval");
  var p = S.ac[ac]; if (!p) return;
  for (var i = 0; i < p.p.length; i++) S.st[ac+"||"+p.p[i][0]] = val;
  rAcoes();
}
function sAtu() {
  var sl = [], ks = Object.keys(S.ac);
  for (var i = 0; i < ks.length; i++) {
    var ac = ks[i], d = S.ac[ac], ps = d.p || [];
    for (var j = 0; j < ps.length; j++) sl.push({chapa:ps[j][0].replace(".0",""),nome:ps[j][1],acao:ac,area:S.area,status:S.st[ac+"||"+ps[j][0]]||"NAO INICIADO",tipo:d.t||"",exp:d.e||""});
  }
  ajax("POST","/api/salvar",{tipo:"atualizar",area:S.area,statuses:sl},function(e){
    if (e) { alert("Erro ao salvar. Tente novamente."); return; }
    go("sucesso");
  });
}

// ── NOVA ACAO ─────────────────────────────────────────────────
function rNova(reset) {
  if (reset) S.n = {nm:"",jt:"",tp:"",cl:"",ori:"",cp:"",md:"",vg:"",cg:"",di:"",df:"",sa:"",pp:[]};
  var n = S.n, t = n.tp, exp = t ? ge(t) : "", sa = n.sa;
  var diD = !sa ? "disabled" : "", dfD = (!sa||sa==="PREVISTO") ? "disabled" : "", cgD = (!sa||sa==="PREVISTO") ? "disabled" : "";
  var diO = sa==="REALIZADO"||sa==="EM ANDAMENTO", dfO = sa==="REALIZADO", cgO = sa==="REALIZADO";
  var hint = sa==="REALIZADO" ? "Data inicio, termino e carga obrigatorios."
    : sa==="EM ANDAMENTO" ? "Data inicio obrigatoria. Demais opcionais." : "Datas e carga opcionais.";
  var pItm = S.cls.map(function(p,i) {
    var sl = false; for (var j = 0; j < n.pp.length; j++) if (n.pp[j][0]===p[0]) { sl=true; break; }
    return '<div class="pi '+(sl?"sl":"")+'" onclick="tgP('+i+')">'
      + '<input type="checkbox" '+(sl?"checked":"")+'  onclick="event.stopPropagation();tgP('+i+')">'
      + '<div><div class="pn">'+p[1]+'</div><div class="pc">'+p[0]+'</div></div></div>';
  }).join("");
  var stBtns = '<button class="so '+(sa==="REALIZADO"?"r2":"") + '" data-sa="REALIZADO" onclick="sSa(this)">&#10003; Realizado</button>'
    + '<button class="so '+(sa==="EM ANDAMENTO"?"e2":"")+ '" data-sa="EM ANDAMENTO" onclick="sSa(this)">&#9654; Em Andamento</button>'
    + '<button class="so '+(sa==="PREVISTO"?"p2":"")      + '" data-sa="PREVISTO" onclick="sSa(this)">&#128197; Previsto</button>';
  var tpOpts = '<option value="">Selecione...</option>'
    + '<optgroup label="70% - Aprender Fazendo">'
    + '<option '+(t==="JOB ROTATION"?"selected":"")+'">JOB ROTATION</option>'
    + '<option '+(t==="LIDERANCA DE PROJETO DESAFIADOR"?"selected":"")+'">LIDERANCA DE PROJETO DESAFIADOR</option>'
    + '<option '+(t==="RESOLUCAO DE PROBLEMAS"?"selected":"")+'">RESOLUCAO DE PROBLEMAS</option>'
    + '</optgroup><optgroup label="20% - Aprender com os Outros">'
    + '<option '+(t==="BENCHMARKING"?"selected":"")+'">BENCHMARKING</option>'
    + '<option '+(t==="COMUNIDADE DE PRATICA"?"selected":"")+'">COMUNIDADE DE PRATICA</option>'
    + '<option '+(t==="COMPARTILHAMENTO DE CONHECIMENTO"?"selected":"")+'">COMPARTILHAMENTO DE CONHECIMENTO</option>'
    + '<option '+(t==="FEEDBACK ESTRUTURADO"?"selected":"")+'">FEEDBACK ESTRUTURADO</option>'
    + '<option '+(t==="MENTORIA"?"selected":"")+'">MENTORIA</option>'
    + '<option '+(t==="VISITA TECNICA"?"selected":"")+'">VISITA TECNICA</option>'
    + '</optgroup><optgroup label="10% - Aprender Estudando">'
    + '<option '+(t==="SABER SENAC"?"selected":"")+'">SABER SENAC</option></optgroup>';
  var dOpts = DIRS.map(function(d) { return '<option '+(n.ori===d?"selected":"")+'>'+d+'</option>'; }).join("");
  var cOpts = COMPS.map(function(c) { return '<option '+(n.cp===c?"selected":"")+'>'+c+'</option>'; }).join("");
  R(HDR(S.area,"Registrar nova acao","goM","Voltar")
   + '<div class="page">'
   + '<div class="ib" style="margin-top:1rem;"><p><strong>Objetivo:</strong> Mapear acoes de responsabilidade do lider. O RH nao executa nem financia. Cada acao precisa ter <strong>intencionalidade</strong> voltada ao desenvolvimento do colaborador. O aprendizado mais impactante vem das experiencias praticas e da interacao no trabalho.</p></div>'
   + '<div class="card"><div class="ch"><h3 style="color:#fff;margin:0;">Nova Acao</h3><p style="color:rgba(255,255,255,.6);font-size:.78rem;margin-top:3px;">Campos com * sao obrigatorios</p></div>'
   + '<span class="lb">Identificacao</span>'
   + '<label class="fl">Nome da Acao *</label><input placeholder="Ex: Workshop de Lideranca" value="'+n.nm+'" oninput="S.n.nm=this.value">'
   + '<label class="fl">Justificativa Breve *</label><textarea placeholder="Descreva o objetivo desta acao..." oninput="S.n.jt=this.value">'+n.jt+'</textarea></div>'
   + '<div class="card"><span class="lb">Classificacao</span>'
   + '<div class="row"><div><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:3px;">'
   + '<label class="fl" style="margin:0;">Tipo de Acao *</label><button class="gb" onclick="openD()">? Guia</button></div>'
   + '<select onchange="S.n.tp=this.value;rNova(false);">'+tpOpts+'</select></div>'
   + '<div style="min-width:90px;max-width:100px;"><label class="fl">Experiencia</label>'
   + '<div style="display:flex;align-items:center;justify-content:center;height:38px;border-radius:8px;border:1.5px solid #e8eaed;background:#f4f5f7;margin-bottom:.5rem;">'
   + (exp ? '<span class="eb e'+exp+'">'+exp+'%</span>' : '<span class="mu" style="font-size:.72rem;">Auto</span>')
   + '</div></div></div>'
   + '<div class="row">'
   + '<div><label class="fl">Classificacao *</label><select onchange="S.n.cl=this.value"><option value="">Selecione...</option><option '+(n.cl==="COMPORTAMENTAL"?"selected":"")+'">COMPORTAMENTAL</option><option '+(n.cl==="TECNICO"?"selected":"")+'">TECNICO</option></select></div>'
   + '<div><label class="fl">Modalidade *</label><select onchange="S.n.md=this.value"><option value="">Selecione...</option><option '+(n.md==="PRESENCIAL"?"selected":"")+'">PRESENCIAL</option><option '+(n.md==="ONLINE"?"selected":"")+'">ONLINE</option><option '+(n.md==="HIBRIDO"?"selected":"")+'">HIBRIDO</option></select></div></div>'
   + '<label class="fl">Diretriz Estrategica *</label><select onchange="S.n.ori=this.value" style="margin-bottom:.5rem;"><option value="">Selecione...</option>'+dOpts+'</select>'
   + '<div class="row"><div><label class="fl">Competencia *</label><select onchange="S.n.cp=this.value"><option value="">Selecione...</option>'+cOpts+'</select></div>'
   + '<div><label class="fl">Viagem?</label><select onchange="S.n.vg=this.value"><option value="">Selecione...</option><option '+(n.vg==="SIM"?"selected":"")+'">SIM</option><option '+(n.vg==="NAO"?"selected":"")+'">NAO</option></select></div></div></div>'
   + '<div class="card"><span class="lb">Status e Datas *</span>'
   + '<label class="fl">Status da Acao *</label><div class="ss">'+stBtns+'</div>'
   + (sa ? '<div class="row">'
     + '<div><label class="fl">Data Inicio '+(diO?"*":"(opcional)")+'</label><input type="date" value="'+n.di+'" '+diD+' onchange="S.n.di=this.value"></div>'
     + '<div><label class="fl">Data Termino '+(dfO?"*":"(opcional)")+'</label><input type="date" value="'+n.df+'" '+dfD+' onchange="S.n.df=this.value"></div>'
     + '<div><label class="fl">Carga '+(cgO?"*":"(opcional)")+'</label><input type="time" value="'+n.cg+'" '+cgD+' onchange="S.n.cg=this.value"></div></div>'
     + '<div class="ib" style="padding:.6rem .8rem;margin-top:-.25rem;"><p>'+hint+'</p></div>'
     : '<div class="ib"><p>Selecione o status acima para habilitar os campos de data.</p></div>')
   + '</div>'
   + '<div class="card"><span class="lb">Participantes * &mdash; '+n.pp.length+' de '+S.cls.length+'</span>'
   + '<div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.6rem;">'
   + '<span style="font-size:.78rem;color:'+(n.pp.length>0?"#155724":"#9aa0a8")+';font-weight:600;">'+n.pp.length+' selecionado(s)</span>'
   + '<button class="btn" style="padding:4px 10px;border-radius:20px;font-size:.7rem;background:'+(n.pp.length===S.cls.length?"#f8d7da":"#d4edda")+';color:'+(n.pp.length===S.cls.length?"#721c24":"#155724")+';border:1px solid '+(n.pp.length===S.cls.length?"#f5c6cb":"#c3e6cb")+'" onclick="tgAll()">'+(n.pp.length===S.cls.length?"Desmarcar todos":"Selecionar todos")+'</button></div>'
   + '<div class="pg">'+pItm+'</div></div>'
   + '<button class="btn bv bf" style="margin-top:.5rem;" onclick="envN()">Registrar Acao</button>'
   + '<button class="btn bh2 bf" onclick="goM()">Cancelar</button></div>');
}
function sSa(btn) { S.n.sa = btn.getAttribute("data-sa"); rNova(false); }
function tgAll() { S.n.pp = S.n.pp.length===S.cls.length ? [] : S.cls.slice(); rNova(false); }
function tgP(i) {
  var item = S.cls[i], ix = -1;
  for (var j = 0; j < S.n.pp.length; j++) if (S.n.pp[j][0]===item[0]) { ix=j; break; }
  if (ix >= 0) S.n.pp.splice(ix,1); else S.n.pp.push(item);
  rNova(false);
}
function envN() {
  var n = S.n;
  if (!n.nm.trim()) { alert("Preencha o nome da acao."); return; }
  if (!n.jt.trim()) { alert("Preencha a justificativa."); return; }
  if (!n.tp) { alert("Selecione o tipo de acao."); return; }
  if (!n.cl) { alert("Selecione a classificacao."); return; }
  if (!n.md) { alert("Selecione a modalidade."); return; }
  if (!n.ori) { alert("Selecione a diretriz estrategica."); return; }
  if (!n.cp) { alert("Selecione a competencia."); return; }
  if (!n.sa) { alert("Selecione o status da acao."); return; }
  if (n.sa==="REALIZADO" && (!n.di||!n.df)) { alert("Para acoes realizadas, informe as datas."); return; }
  if (n.sa==="REALIZADO" && !n.cg) { alert("Informe a carga horaria."); return; }
  if (n.sa==="EM ANDAMENTO" && !n.di) { alert("Informe a data de inicio."); return; }
  if (!n.pp.length) { alert("Selecione ao menos um participante."); return; }
  ajax("POST","/api/salvar",{tipo:"nova",area:S.area,novaAcao:{
    nome:n.nm,just:n.jt,tipo:n.tp,exp:ge(n.tp),cls:n.cl,ori:n.ori,
    comp:n.cp,modal:n.md,viagem:n.vg,carga:n.cg,di:n.di,df:n.df,
    status_acao:n.sa,parts:n.pp.map(function(p){return[p[0],p[1]];})
  }},function(e){
    if (e) { alert("Erro ao salvar."); return; }
    go("sucesso");
  });
}

// ── SUCESSO ───────────────────────────────────────────────────
function rSuc() {
  R('<div style="padding:1rem;background:#f0f2f5;min-height:100vh;display:flex;align-items:center;">'
   + '<div class="sbx" style="width:100%;">'
   + '<div style="width:64px;height:64px;background:#d4edda;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;font-size:2rem;">&#10003;</div>'
   + '<h2 style="color:#1a2744;font-size:1.4rem;margin-bottom:.5rem;">Resposta registrada!</h2>'
   + '<p style="color:#9aa0a8;margin-bottom:1.5rem;">' + S.area + '</p>'
   + '<button class="btn bg bf" onclick="goM()">&#8592; Registrar outra acao</button>'
   + '<button class="btn bh2 bf" onclick="goA()" style="margin-top:.25rem;">Trocar area</button>'
   + '</div></div>');
}

// ── LOGIN ─────────────────────────────────────────────────────
function rLogin() {
  R('<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(160deg,#1a2744,#243057);padding:2rem;">'
   + '<div style="max-width:340px;width:100%;">'
   + '<div class="card" style="text-align:center;padding:2.5rem;border-top:3px solid #c9973a;">'
   + '<div style="width:56px;height:56px;background:#1a2744;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;font-size:1.5rem;">&#128274;</div>'
   + '<h3 style="margin-bottom:.25rem;">Desenvolvimento Organizacional</h3>'
   + '<p class="mu" style="margin-bottom:1.5rem;">Acesso restrito</p>'
   + '<input type="password" id="sIn" placeholder="Senha..." style="text-align:center;">'
   + '<div id="sErr" style="color:#721c24;font-size:.78rem;margin-bottom:.5rem;display:none;">Senha incorreta.</div>'
   + '<button class="btn bn bf" onclick="chkS()">Entrar</button>'
   + '<button class="btn bh2 bf" style="margin-top:.25rem;" onclick="goH()">&#8592; Voltar</button>'
   + '</div></div></div>');
  setTimeout(function() {
    var inp = el("sIn");
    if (inp) inp.addEventListener("keydown", function(e) { if (e.key==="Enter") chkS(); });
  }, 100);
}
function chkS() {
  var inp = el("sIn");
  if (inp && inp.value === "senac2026") { location.href = "/painel"; }
  else { var e = el("sErr"); if (e) e.style.display = "block"; }
}

// ── PAINEL ────────────────────────────────────────────────────
function rPainel() {
  R('<div class="loading"><p>Carregando painel...</p></div>');
  var q = "";
  if (S.fs) q += (q?"&":"?") + "status=" + encodeURIComponent(S.fs);
  if (S.fa) q += (q?"&":"?") + "area=" + encodeURIComponent(S.fa);
  ajax("GET", "/api/respostas"+q, null, function(e, data) {
    if (e) { alert("Erro ao carregar painel."); return; }
    var rs = data.st||[], nv = data.nv||[], st = data.stats||{}, ar = st.areas||[];
    var TAB = String.fromCharCode(9), NL = String.fromCharCode(10);
    var arO = ar.map(function(a) { return '<option '+(S.fa===a?"selected":"")+'>'+a+'</option>'; }).join("");
    var stO = ST.map(function(s) { return '<option '+(S.fs===s?"selected":"")+'>'+s+'</option>'; }).join("");
    var eSt = rs.map(function(r) {
      return [r.chapa||"",r.nome||"",r.acao||"",r.area||"",r.status||"",r.tipo||"",r.exp||""].join(TAB);
    }).join(NL);
    var eNv = nv.map(function(r) {
      return [r.area||"",r.nome||"",r.tipo||"",r.exp||"",r.modal||"",r.viagem||"",r.carga||"",r.di||"",r.df||"",r.st_acao||"",r.cls||"",r.ori||"",r.comp||"",r.just||"",r.parts||""].join(TAB);
    }).join(NL);
    var sRows = rs.length === 0
      ? '<div class="card" style="text-align:center;padding:2rem;"><p class="mu">Nenhuma resposta ainda.</p></div>'
      : rs.map(function(r) {
          return '<div class="rr"><div><p style="font-size:.82rem;font-weight:600;">'+(r.nome||"")+'</p>'
            + '<p style="font-size:.68rem;color:#9aa0a8;">'+(r.area||"")+' &middot; '+(r.acao||"")+' &middot; '+(r.data||"")+'</p></div>'
            + '<span class="sb '+sc(r.status||"")+'">'+(r.status||"")+'</span></div>';
        }).join("");
    var nRows = nv.length === 0
      ? '<div class="card" style="text-align:center;padding:2rem;"><p class="mu">Nenhuma nova acao ainda.</p></div>'
      : nv.filter(function(r) { return !S.fa||r.area===S.fa; }).map(function(r) {
          return '<div class="card" style="margin-bottom:.75rem;border-left:4px solid #c9973a;">'
            + '<div style="display:flex;justify-content:space-between;margin-bottom:.4rem;">'
            + '<div><p style="font-weight:700;">'+(r.nome||"")+'</p><p style="font-size:.72rem;color:#9aa0a8;">'+(r.area||"")+' &middot; '+(r.data||"")+'</p></div>'
            + '<span class="eb e'+(r.exp==="70"?"70":r.exp==="20"?"20":"10")+'">'+(r.exp||"")+'%</span></div>'
            + '<p style="font-size:.75rem;color:#6c757d;">'+(r.tipo||"")+' &middot; '+(r.modal||"")+' &middot; '+(r.di||"")+' a '+(r.df||"")+' &middot; '+(r.carga||"")+'</p></div>';
        }).join("");
    var tc = S.pt === "st"
      ? '<div class="card" style="padding:.75rem 1rem;margin-bottom:1rem;"><div class="row" style="margin-bottom:0;">'
        + '<div><span class="lb" style="margin-bottom:3px;">Filtrar por status</span><select onchange="S.fs=this.value;rPainel()"><option value="">Todos</option>'+stO+'</select></div>'
        + '<div><span class="lb" style="margin-bottom:3px;">Filtrar por area</span><select onchange="S.fa=this.value;rPainel()"><option value="">Todas</option>'+arO+'</select></div></div></div>'
        + '<p class="mu" style="font-size:.78rem;margin-bottom:.75rem;">'+rs.length+' registro(s)</p>'+sRows
      : S.pt === "nv"
        ? '<div class="card" style="padding:.75rem 1rem;margin-bottom:1rem;"><select onchange="S.fa=this.value;rPainel()"><option value="">Todas as areas</option>'+arO+'</select></div>'+nRows
        : '<div class="card ca" style="margin-bottom:1rem;"><p style="font-size:.83rem;color:#856404;line-height:1.5;"><strong>Como usar:</strong> Clique em Copiar, abra o Excel, clique em uma celula vazia e pressione <strong>Ctrl+V</strong>.</p></div>'
          + '<div class="card" style="padding:.75rem 1rem;margin-bottom:1rem;"><div class="row" style="margin-bottom:0;">'
          + '<div><span class="lb" style="margin-bottom:3px;">Status</span><select onchange="S.fs=this.value;rPainel()"><option value="">Todos</option>'+stO+'</select></div>'
          + '<div><span class="lb" style="margin-bottom:3px;">Area</span><select onchange="S.fa=this.value;rPainel()"><option value="">Todas</option>'+arO+'</select></div></div></div>'
          + '<p class="mu" style="font-size:.78rem;margin-bottom:.5rem;">'+rs.length+' registros de status (Chapa | Nome | Acao | Area | Status | Tipo | Experiencia)</p>'
          + '<textarea class="ea" id="exSt" readonly>'+eSt+'</textarea>'
          + '<button class="btn bg" style="margin-bottom:1.5rem;" onclick="cp(\'exSt\')">&#128203; Copiar status para Excel</button>'
          + (nv.length > 0
            ? '<p class="mu" style="font-size:.78rem;margin-bottom:.5rem;">'+nv.length+' novas acoes (Area|Nome|Tipo|Exp|Modal|Viagem|Carga|Inicio|Fim|Status|Classif|Orientador|Comp|Justif|Participantes)</p>'
              + '<textarea class="ea" id="exNv" readonly>'+eNv+'</textarea>'
              + '<button class="btn bv" onclick="cp(\'exNv\')">&#128203; Copiar novas acoes para Excel</button>'
            : "");
    R('<div class="hdr"><div class="hl">' + LI()
     + '<div class="ht"><p style="color:#c9973a;font-weight:700;text-transform:uppercase;">Desenvolvimento Organizacional</p>'
     + '<h2>Painel 70-20-10 &middot; 2026</h2></div></div>'
     + '<div style="display:flex;gap:.5rem;">'
     + '<button class="btn bh" onclick="rPainel()">&#8635; Atualizar</button>'
     + '<a href="/" style="text-decoration:none;"><button class="btn bh">&#8592; Sair</button></a></div></div>'
     + '<div class="page">'
     + '<div class="g4" style="margin-top:1rem;">'
     + '<div class="kpi"><div class="kv" style="color:#1a2744;">'+(st.total||0)+'</div><div class="kl">Registros</div></div>'
     + '<div class="kpi"><div class="kv" style="color:#155724;">'+(st.real||0)+'</div><div class="kl">Realizados</div></div>'
     + '<div class="kpi"><div class="kv" style="color:#1a2744;">'+(st.pct||0)+'%</div><div class="kl">% Realizado</div></div>'
     + '<div class="kpi"><div class="kv" style="color:#856404;">'+(st.n_nv||0)+'</div><div class="kl">Novas acoes</div></div></div>'
     + '<div class="tabs">'
     + '<button class="tab '+(S.pt==="st"?"act":"")+'" onclick="S.pt=\'st\';rPainel()">Status</button>'
     + '<button class="tab '+(S.pt==="nv"?"act":"")+'" onclick="S.pt=\'nv\';rPainel()">Novas acoes</button>'
     + '<button class="tab '+(S.pt==="ex"?"act":"")+'" onclick="S.pt=\'ex\';rPainel()">Exportar Excel</button>'
     + '</div>' + tc + '</div>');
  });
}
function cp(id) {
  var ta = el(id); if (!ta) return;
  ta.select(); document.execCommand("copy");
  alert("Copiado! Abra o Excel e pressione Ctrl+V.");
}

// ── DISPATCH ──────────────────────────────────────────────────
function D() {
  var s = S.step;
  if (s==="home") rHome();
  else if (s==="area") rArea();
  else if (s==="modo") rModo();
  else if (s==="acoes") rAcoes();
  else if (s==="nova") rNova(false);
  else if (s==="sucesso") rSuc();
  else if (s==="login") rLogin();
  else if (s==="painel") rPainel();
}
D();
