import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Publieke embed: laadt widget op externe sites. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  if (!token || !/^[0-9a-f-]{36}$/i.test(token)) {
    return new NextResponse("// Zylmero: ongeldige token", {
      headers: { "Content-Type": "application/javascript; charset=utf-8" },
    });
  }

  const origin =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    new URL(request.url).origin;

  const js = `(function(){
  var T=${JSON.stringify(token)};
  var API=${JSON.stringify(origin + "/api/widget/lead")};
  function el(t,a,c){var e=document.createElement(t);if(a)for(var k in a)e[k]=a[k];if(c)for(var i=0;i<c.length;i++)e.appendChild(c[i]);return e;}
  function open(){root.style.display='flex';inp.focus();}
  function close(){root.style.display='none';}
  var btn=el('button',{type:'button',className:'cf-w-btn',textContent:'Chat'},[]);
  var root=el('div',{className:'cf-w-root'},[]);
  var card=el('div',{className:'cf-w-card'},[]);
  var inp=el('input',{type:'text',placeholder:'Je naam',className:'cf-w-inp'});
  var em=el('input',{type:'email',placeholder:'E-mail (optioneel)',className:'cf-w-inp'});
  var ph=el('input',{type:'tel',placeholder:'Telefoon (optioneel)',className:'cf-w-inp'});
  var msg=el('textarea',{placeholder:'Waar kunnen we mee helpen?',className:'cf-w-ta'});
  var err=el('div',{className:'cf-w-err'});
  var sub=el('button',{type:'button',className:'cf-w-sub',textContent:'Verstuur'},[]);
  sub.onclick=function(){
    err.textContent='';
    fetch(API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:T,name:inp.value.trim(),email:em.value.trim(),phone:ph.value.trim(),message:msg.value.trim()})})
    .then(function(r){return r.json();})
    .then(function(d){if(d.ok){card.innerHTML='<p class=\\'cf-w-ok\\'>Bedankt — we nemen snel contact op.</p>';}else{err.textContent=d.error||'Mislukt';}})
    .catch(function(){err.textContent='Netwerkfout';});
  };
  card.appendChild(el('p',{className:'cf-w-h',textContent:'Stel je vraag'}));
  card.appendChild(inp);card.appendChild(em);card.appendChild(ph);card.appendChild(msg);card.appendChild(err);card.appendChild(sub);
  root.appendChild(card);
  btn.onclick=open;
  root.onclick=function(e){if(e.target===root)close();};
  var style=el('style',{},[]);
  style.textContent='.cf-w-btn{position:fixed;right:20px;bottom:20px;z-index:99999;padding:14px 20px;border-radius:999px;border:none;background:#0d9488;color:#fff;font:600 15px system-ui,sans-serif;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.2);}.cf-w-root{display:none;position:fixed;inset:0;z-index:99998;background:rgba(0,0,0,.35);align-items:flex-end;justify-content:flex-end;padding:20px;}.cf-w-card{width:100%;max-width:380px;background:#fff;border-radius:16px;padding:16px;box-shadow:0 20px 50px rgba(0,0,0,.25);}.cf-w-h{margin:0 0 10px;font:600 16px system-ui,sans-serif;color:#0f172a;}.cf-w-inp,.cf-w-ta{width:100%;box-sizing:border-box;margin:6px 0;padding:10px 12px;border:1px solid #e2e8f0;border-radius:10px;font:14px system-ui,sans-serif;}.cf-w-ta{min-height:72px;resize:vertical;}.cf-w-sub{margin-top:10px;width:100%;padding:12px;border:none;border-radius:12px;background:#0d9488;color:#fff;font:600 14px system-ui,sans-serif;cursor:pointer;}.cf-w-err{color:#b91c1c;font:13px system-ui,sans-serif;margin-top:6px;min-height:18px;}.cf-w-ok{margin:0;font:14px system-ui,sans-serif;color:#0f172a;}';
  document.head.appendChild(style);
  document.body.appendChild(btn);
  document.body.appendChild(root);
})();`;

  return new NextResponse(js, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
