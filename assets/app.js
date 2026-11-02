/* ==========================================================================
   Apex — Branches Under Control
   Design system stylesheet
   ========================================================================== */

:root{
  --blue:#2f6bff;        --blue-soft:#e7edff;
  --green:#16a34a;       --green-soft:#e8f8ef;
  --red:#e0392b;         --red-soft:#fdeceb;
  --orange:#f39c1f;      --orange-soft:#fef2e0;
  --purple:#7c5cff;      --purple-soft:#efebff;
  --teal:#0fb5ae;        --teal-soft:#e2faf8;
  --grey-soft:#eef0f4;

  --bg:#f4f6fb;
  --card-bg:#ffffff;
  --card-border:#e9ecf5;
  --text:#1c2333;
  --text-dim:#5b6479;
  --text-mute:#8891a8;

  --shadow-sm:0 1px 2px rgba(30,40,80,.04), 0 1px 1px rgba(30,40,80,.03);
  --shadow-md:0 8px 24px rgba(30,40,80,.08);
  --shadow-lg:0 20px 48px rgba(30,40,80,.16);

  --radius:14px;
  --radius-sm:10px;
  --sidebar-w:252px;

  --ease:cubic-bezier(.22,1,.36,1);
}

*{box-sizing:border-box;}
html{scroll-behavior:smooth;}
body{
  margin:0;
  font-family:'Cairo',system-ui,sans-serif;
  background:var(--bg);
  color:var(--text);
  -webkit-font-smoothing:antialiased;
  font-size:14px;
}
a{text-decoration:none;color:inherit;}
button{font-family:inherit;cursor:pointer;}
input, select, textarea{font-family:inherit;}
h1,h2,h3,p{margin:0;}
::selection{background:rgba(47,107,255,.18);}

/* Scrollbar */
::-webkit-scrollbar{width:9px;height:9px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:#d3d9ea;border-radius:20px;}
::-webkit-scrollbar-thumb:hover{background:#b9c2dc;}

/* ============================= App shell ============================= */
.app-shell{display:flex; min-height:100vh; align-items:stretch;}

.sidebar{
  width:var(--sidebar-w);
  min-width:var(--sidebar-w);
  background:var(--card-bg);
  border-inline-start:1px solid var(--card-border);
  display:flex;
  flex-direction:column;
  height:100vh;
  position:sticky;
  top:0;
  padding:18px 14px;
  gap:14px;
  transition:transform .35s var(--ease), width .35s var(--ease);
  z-index:40;
}
.sidebar-brand{display:flex; align-items:center; gap:10px; padding:4px 6px 10px; border-bottom:1px solid var(--card-border);}
.sidebar-brand img{width:34px;height:34px; animation:brandPop .6s var(--ease);}
.brand-name{font-weight:800; font-size:16px; letter-spacing:.2px;}
.brand-sub{font-size:10.5px; color:var(--text-mute); font-weight:600;}

.sidebar-search{
  display:flex; align-items:center; gap:8px;
  background:var(--bg); border:1px solid var(--card-border); border-radius:10px;
  padding:9px 12px; color:var(--text-mute);
  transition:border-color .2s var(--ease), box-shadow .2s var(--ease);
}
.sidebar-search:focus-within{border-color:var(--blue); box-shadow:0 0 0 3px rgba(47,107,255,.12);}
.sidebar-search svg{width:15px;height:15px; flex-shrink:0;}
.sidebar-search input{border:0; background:transparent; outline:0; width:100%; font-size:12.5px; color:var(--text);}

.sidebar-nav{display:flex; flex-direction:column; gap:2px; overflow-y:auto; flex:1; padding-inline-end:2px;}
.nav-item{
  display:flex; align-items:center; gap:11px;
  padding:9.5px 10px; border-radius:10px;
  color:var(--text-dim); font-size:12.8px; font-weight:600;
  position:relative; overflow:hidden;
  transition:background .18s var(--ease), color .18s var(--ease), transform .15s var(--ease);
}
.nav-item svg{width:17px;height:17px; flex-shrink:0; transition:transform .25s var(--ease);}
.nav-item:hover{background:var(--bg); color:var(--text); transform:translateX(-2px);}
[dir="rtl"] .nav-item:hover{transform:translateX(2px);}
.nav-item:hover svg{transform:scale(1.1);}
.nav-item.active{background:linear-gradient(135deg,var(--blue),#2557d6); color:#fff; box-shadow:0 6px 16px rgba(47,107,255,.28);}
.nav-item.active svg{filter:drop-shadow(0 1px 1px rgba(0,0,0,.15));}
.nav-item:active{transform:scale(.97);}

.sidebar-foot{font-size:10px; color:var(--text-mute); text-align:center; padding-top:8px; border-top:1px solid var(--card-border);}

/* ============================== Main col ============================== */
.main-col{flex:1; min-width:0; display:flex; flex-direction:column;}

.topbar{
  display:flex; align-items:center; gap:16px;
  padding:14px 26px; background:rgba(244,246,251,.85);
  backdrop-filter:blur(10px);
  position:sticky; top:0; z-index:30;
  border-bottom:1px solid var(--card-border);
}
.topbar-search{
  flex:1; max-width:420px; display:flex; align-items:center; gap:9px;
  background:var(--card-bg); border:1px solid var(--card-border); border-radius:10px;
  padding:9px 14px; color:var(--text-mute);
  transition:border-color .2s var(--ease), box-shadow .2s var(--ease);
}
.topbar-search:focus-within{border-color:var(--blue); box-shadow:0 0 0 3px rgba(47,107,255,.12);}
.topbar-search svg{width:15px;height:15px;flex-shrink:0;}
.topbar-search input{border:0; outline:0; background:transparent; width:100%; font-size:12.8px; color:var(--text);}

.topbar-right{display:flex; align-items:center; gap:10px; margin-inline-start:auto;}
.topbar-date{font-size:12px; color:var(--text-mute); font-weight:600; white-space:nowrap;}

.icon-btn{
  width:38px;height:38px; border-radius:10px; border:1px solid var(--card-border);
  background:var(--card-bg); display:flex; align-items:center; justify-content:center;
  color:var(--text-dim); position:relative; flex-shrink:0;
  transition:transform .18s var(--ease), box-shadow .18s var(--ease), color .18s var(--ease), border-color .18s var(--ease);
}
.icon-btn svg{width:17px;height:17px;}
.icon-btn:hover{transform:translateY(-2px); box-shadow:var(--shadow-md); color:var(--blue); border-color:#d7e2ff;}
.icon-btn:active{transform:translateY(0) scale(.94);}
.icon-btn.has-dot::after{
  content:''; position:absolute; top:7px; inset-inline-end:7px;
  width:7px;height:7px;border-radius:50%; background:var(--red); border:2px solid var(--card-bg);
}

.user-chip{display:flex; align-items:center; gap:9px; padding:5px 10px 5px 5px; border-radius:12px; cursor:pointer; transition:background .18s var(--ease);}
.user-chip:hover{background:var(--card-bg); box-shadow:var(--shadow-sm);}
.user-avatar{
  width:36px;height:36px;border-radius:50%; background:linear-gradient(135deg,var(--blue),var(--purple));
  color:#fff; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:13px;
  flex-shrink:0;
}
.user-name{font-size:12.5px; font-weight:700;}
.user-role{font-size:10.5px; color:var(--text-mute);}

.page-body{padding:22px 26px 60px; animation:pageIn .45s var(--ease);}
.page-head{margin-bottom:18px;}
.page-head h1{font-size:21px; font-weight:800;}
.page-head p{font-size:12.5px; color:var(--text-mute); margin-top:4px;}

/* ================================ Grids ================================ */
.kpi-row{display:grid; grid-template-columns:repeat(auto-fit,minmax(210px,1fr)); gap:14px; margin-bottom:18px;}
.grid-2{display:grid; grid-template-columns:1.3fr 1fr; gap:16px;}
.grid-3{display:grid; grid-template-columns:repeat(3,1fr); gap:14px; align-items:stretch;}
@media (max-width:980px){ .grid-2, .grid-3{grid-template-columns:1fr;} }

/* ================================ Cards ================================ */
.card, .kpi-card{
  background:var(--card-bg); border:1px solid var(--card-border); border-radius:var(--radius);
  padding:18px; box-shadow:var(--shadow-sm);
  transition:transform .25s var(--ease), box-shadow .25s var(--ease), border-color .25s var(--ease);
  animation:cardIn .5s var(--ease) both;
}
.card:hover, .kpi-card:hover{transform:translateY(-3px); box-shadow:var(--shadow-md); border-color:#dfe4f3;}
.card-head{display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:14px; flex-wrap:wrap;}
.card-head h3{font-size:14.5px; font-weight:800;}
.muted{font-size:11.5px; color:var(--text-mute); font-weight:600;}

.kpi-top{display:flex; align-items:center; justify-content:space-between; margin-bottom:12px;}
.kpi-icon{width:42px;height:42px;border-radius:12px; display:flex; align-items:center; justify-content:center;}
.kpi-icon svg{width:20px;height:20px;}
.kpi-value{font-size:21px; font-weight:800; letter-spacing:.2px;}
.kpi-label{font-size:12px; color:var(--text-mute); margin-top:3px; font-weight:600;}
.kpi-trend{font-size:11px; font-weight:800; padding:3px 8px; border-radius:20px;}
.trend-up{color:var(--green); background:var(--green-soft);}
.trend-down{color:var(--red); background:var(--red-soft);}

.legend-dot{display:inline-block; width:8px;height:8px;border-radius:50%; margin-inline-end:6px;}

/* ================================ Buttons ================================ */
.btn{
  display:inline-flex; align-items:center; justify-content:center; gap:7px;
  padding:9.5px 16px; border-radius:10px; border:1px solid var(--card-border);
  background:var(--card-bg); color:var(--text); font-size:12.8px; font-weight:700;
  position:relative; overflow:hidden; isolation:isolate;
  transition:transform .16s var(--ease), box-shadow .2s var(--ease), background .2s var(--ease), border-color .2s var(--ease), color .2s var(--ease);
  white-space:nowrap;
}
.btn svg{width:15px;height:15px;}
.btn:hover{transform:translateY(-2px); box-shadow:var(--shadow-md);}
.btn:active{transform:translateY(0) scale(.96);}
.btn-primary{background:linear-gradient(135deg,var(--blue),#2557d6); border-color:transparent; color:#fff; box-shadow:0 6px 16px rgba(47,107,255,.28);}
.btn-primary:hover{box-shadow:0 10px 22px rgba(47,107,255,.38);}
.btn-soft{background:var(--blue-soft); border-color:transparent; color:var(--blue);}
.btn-soft:hover{background:#dbe6ff;}
.btn-danger{background:var(--red-soft); border-color:transparent; color:var(--red);}
.btn-danger:hover{background:#fadbd8;}
.btn-block{width:100%;}
.btn-google{background:#fff; gap:10px;}
.btn:disabled{opacity:.55; cursor:not-allowed; transform:none !important; box-shadow:none !important;}

/* Ripple */
.btn .ripple, .nav-item .ripple, .icon-btn .ripple, .menu-tile .ripple{
  position:absolute; border-radius:50%; transform:scale(0); pointer-events:none;
  background:rgba(255,255,255,.55); animation:rippleAnim .6s ease-out forwards;
  z-index:0;
}
.btn-soft .ripple, .icon-btn .ripple{background:rgba(47,107,255,.25);}
.nav-item .ripple{background:rgba(47,107,255,.18);}
@keyframes rippleAnim{ to{ transform:scale(3.2); opacity:0; } }

/* ================================ Forms ================================ */
.field{margin-bottom:13px; display:flex; flex-direction:column; gap:6px;}
.field label{font-size:11.8px; font-weight:700; color:var(--text-dim);}
.field input, .field select, .field textarea{
  border:1px solid var(--card-border); border-radius:10px; padding:10px 12px;
  font-size:13px; background:var(--bg); color:var(--text); outline:0; width:100%;
  transition:border-color .2s var(--ease), box-shadow .2s var(--ease), background .2s var(--ease);
}
.field input:focus, .field select:focus, .field textarea:focus{
  border-color:var(--blue); background:#fff; box-shadow:0 0 0 3px rgba(47,107,255,.12);
}
.field textarea{resize:vertical; min-height:80px;}
.form-row-between{display:flex; align-items:center; justify-content:space-between; margin:6px 0 16px; font-size:12px;}
.form-row-between a{color:var(--blue); font-weight:700;}
.divider{display:flex; align-items:center; gap:10px; font-size:11px; color:var(--text-mute); margin:16px 0;}
.divider::before, .divider::after{content:''; flex:1; height:1px; background:var(--card-border);}

/* ================================ Tables ================================ */
.table-wrap{overflow-x:auto; border-radius:12px;}
table{width:100%; border-collapse:collapse; font-size:12.6px; min-width:560px;}
thead th{
  text-align:start; padding:11px 12px; color:var(--text-mute); font-weight:700;
  font-size:11.5px; border-bottom:1px solid var(--card-border); white-space:nowrap;
}
tbody td{padding:12px; border-bottom:1px solid var(--card-border); vertical-align:middle;}
tbody tr{transition:background .18s var(--ease);}
tbody tr:hover{background:var(--bg);}
tbody tr:last-child td{border-bottom:0;}
tbody tr.row-enter{animation:rowIn .45s var(--ease);}
tbody tr.row-exit{animation:rowOut .35s var(--ease) forwards;}

.row-actions{display:flex; align-items:center; gap:6px;}
.row-actions .icon-btn{width:30px;height:30px; border-radius:8px;}
.row-actions .icon-btn svg{width:14px;height:14px;}

/* ================================ Badges ================================ */
.badge{display:inline-flex; align-items:center; padding:4px 10px; border-radius:20px; font-size:11px; font-weight:800;}
.badge-green{background:var(--green-soft); color:var(--green);}
.badge-red{background:var(--red-soft); color:var(--red);}
.badge-orange{background:var(--orange-soft); color:var(--orange);}
.badge-blue{background:var(--blue-soft); color:var(--blue);}
.badge-purple{background:var(--purple-soft); color:var(--purple);}
.badge-teal{background:var(--teal-soft); color:var(--teal);}

/* ================================ Menu grid ================================ */
.menu-grid{display:grid; grid-template-columns:repeat(auto-fill,minmax(160px,1fr)); gap:14px;}
.menu-tile{
  background:var(--card-bg); border:1px solid var(--card-border); border-radius:var(--radius);
  padding:22px 14px; display:flex; flex-direction:column; align-items:center; gap:12px;
  text-align:center; font-weight:700; font-size:12.8px; position:relative; overflow:hidden;
  transition:transform .22s var(--ease), box-shadow .22s var(--ease), border-color .22s var(--ease);
  animation:cardIn .5s var(--ease) both;
}
.menu-tile:hover{transform:translateY(-5px) scale(1.02); box-shadow:var(--shadow-md); border-color:#dfe4f3;}
.menu-tile:active{transform:translateY(-1px) scale(.98);}
.tile-icon{width:52px;height:52px;border-radius:14px; display:flex; align-items:center; justify-content:center; transition:transform .3s var(--ease);}
.tile-icon svg{width:24px;height:24px;}
.menu-tile:hover .tile-icon{transform:rotate(-8deg) scale(1.08);}

/* ================================ Login page ================================ */
.login-shell{display:flex; min-height:100vh;}
.login-visual{
  flex:1.1; background:linear-gradient(155deg,#1a2340,#243268 45%,#2f6bff);
  color:#fff; padding:50px; display:flex; flex-direction:column; justify-content:center; gap:22px;
  position:relative; overflow:hidden;
}
.login-visual::before, .login-visual::after{
  content:''; position:absolute; border-radius:50%; background:rgba(255,255,255,.06);
}
.login-visual::before{width:420px;height:420px; top:-140px; inset-inline-end:-120px; animation:floatSlow 9s ease-in-out infinite;}
.login-visual::after{width:280px;height:280px; bottom:-120px; inset-inline-start:-80px; animation:floatSlow 11s ease-in-out infinite reverse;}
.login-visual h1{font-size:30px; font-weight:800; line-height:1.5; position:relative;}
.login-visual p{font-size:13.5px; color:#c7d0e6; line-height:1.9; max-width:420px; position:relative;}
.brand-row{display:flex; align-items:center; gap:12px; position:relative;}

.login-form-col{flex:1; display:flex; align-items:center; justify-content:center; padding:30px; background:#fff;}
.login-form{width:100%; max-width:380px; animation:pageIn .5s var(--ease);}
.login-form h2{font-size:22px; font-weight:800;}
.login-form .sub{font-size:12.5px; color:var(--text-mute); margin:6px 0 22px;}
.login-foot{text-align:center; font-size:11px; color:var(--text-mute); margin-top:20px;}

@media (max-width:860px){ .login-visual{display:none;} }

/* Splash / boot animation shown after login */
.boot-splash{
  position:fixed; inset:0; z-index:999; display:flex; align-items:center; justify-content:center;
  flex-direction:column; gap:18px; background:linear-gradient(155deg,#1a2340,#243268 45%,#2f6bff);
  color:#fff; opacity:0; animation:splashIn .5s var(--ease) forwards;
}
.boot-splash .boot-logo{
  width:84px;height:84px; border-radius:22px; background:rgba(255,255,255,.12); backdrop-filter:blur(6px);
  display:flex; align-items:center; justify-content:center; animation:logoPulse 1.6s ease-in-out infinite;
  box-shadow:0 0 0 0 rgba(255,255,255,.25);
}
.boot-splash .boot-logo img{width:46px;height:46px;}
.boot-splash h2{font-size:24px; font-weight:800; letter-spacing:.3px; opacity:0; animation:riseFade .6s var(--ease) .35s forwards;}
.boot-splash p{font-size:13px; color:#cfd8ee; opacity:0; animation:riseFade .6s var(--ease) .55s forwards;}
.boot-splash .boot-bar{width:220px; height:4px; border-radius:6px; background:rgba(255,255,255,.18); overflow:hidden; opacity:0; animation:riseFade .5s var(--ease) .7s forwards;}
.boot-splash .boot-bar span{display:block; height:100%; width:0%; background:#fff; border-radius:6px; animation:bootLoad 1.35s var(--ease) .75s forwards;}
.boot-splash.leaving{animation:splashOut .45s var(--ease) forwards;}

/* ================================ Modal ================================ */
.modal-overlay{
  position:fixed; inset:0; background:rgba(20,26,46,.5); backdrop-filter:blur(2px);
  display:flex; align-items:center; justify-content:center; z-index:200; padding:20px;
  opacity:0; animation:overlayIn .25s var(--ease) forwards;
}
.modal-overlay.leaving{animation:overlayOut .2s var(--ease) forwards;}
.modal-box{
  background:#fff; border-radius:16px; width:100%; max-width:460px; max-height:88vh; overflow-y:auto;
  box-shadow:var(--shadow-lg); transform:translateY(18px) scale(.97); opacity:0;
  animation:modalIn .32s var(--ease) .05s forwards;
}
.modal-overlay.leaving .modal-box{animation:modalOut .2s var(--ease) forwards;}
.modal-head{display:flex; align-items:center; justify-content:space-between; padding:18px 20px; border-bottom:1px solid var(--card-border);}
.modal-head h3{font-size:15px; font-weight:800;}
.modal-close{width:30px;height:30px;border-radius:8px; border:0; background:var(--bg); display:flex; align-items:center; justify-content:center; color:var(--text-dim); font-size:16px; transition:transform .15s var(--ease), background .15s var(--ease);}
.modal-close:hover{background:var(--red-soft); color:var(--red); transform:rotate(90deg);}
.modal-body{padding:20px;}
.modal-foot{padding:14px 20px 20px; display:flex; gap:10px; justify-content:flex-end;}

/* ================================ Toasts ================================ */
.toast-stack{position:fixed; bottom:22px; inset-inline-end:22px; z-index:300; display:flex; flex-direction:column; gap:10px; align-items:flex-end;}
.toast{
  background:#1c2333; color:#fff; padding:13px 18px; border-radius:12px; font-size:12.8px; font-weight:700;
  display:flex; align-items:center; gap:10px; box-shadow:var(--shadow-lg); min-width:220px; max-width:340px;
  animation:toastIn .35s var(--ease) forwards;
}
.toast.success{background:linear-gradient(135deg,#16a34a,#0e8a3c);}
.toast.error{background:linear-gradient(135deg,var(--red),#b52a1f);}
.toast.info{background:linear-gradient(135deg,var(--blue),#2557d6);}
.toast.leaving{animation:toastOut .3s var(--ease) forwards;}
.toast .dot{width:8px;height:8px;border-radius:50%; background:#fff; flex-shrink:0;}

/* ================================ Misc states ================================ */
.empty-hint{padding:26px; text-align:center; color:var(--text-mute); font-size:12.5px;}
.pulse-badge{animation:pulseSoft 1.8s ease-in-out infinite;}
.shake{animation:shake .4s ease;}
.is-read{opacity:.55;}
[data-notif-item]{transition:opacity .3s var(--ease), transform .3s var(--ease);}

/* ================================ Keyframes ================================ */
@keyframes pageIn{ from{opacity:0; transform:translateY(10px);} to{opacity:1; transform:translateY(0);} }
@keyframes cardIn{ from{opacity:0; transform:translateY(14px);} to{opacity:1; transform:translateY(0);} }
@keyframes rowIn{ from{opacity:0; transform:translateY(-6px); background:rgba(47,107,255,.08);} to{opacity:1; transform:translateY(0);} }
@keyframes rowOut{ to{opacity:0; transform:translateX(20px); height:0; padding:0;} }
@keyframes brandPop{ from{transform:scale(.6) rotate(-15deg); opacity:0;} to{transform:scale(1) rotate(0); opacity:1;} }
@keyframes floatSlow{ 0%,100%{transform:translateY(0);} 50%{transform:translateY(-22px);} }
@keyframes splashIn{ from{opacity:0;} to{opacity:1;} }
@keyframes splashOut{ from{opacity:1;} to{opacity:0; visibility:hidden;} }
@keyframes logoPulse{ 0%,100%{box-shadow:0 0 0 0 rgba(255,255,255,.28); transform:scale(1);} 50%{box-shadow:0 0 0 16px rgba(255,255,255,0); transform:scale(1.05);} }
@keyframes riseFade{ from{opacity:0; transform:translateY(10px);} to{opacity:1; transform:translateY(0);} }
@keyframes bootLoad{ from{width:0%;} to{width:100%;} }
@keyframes overlayIn{ from{opacity:0;} to{opacity:1;} }
@keyframes overlayOut{ from{opacity:1;} to{opacity:0;} }
@keyframes modalIn{ from{opacity:0; transform:translateY(18px) scale(.97);} to{opacity:1; transform:translateY(0) scale(1);} }
@keyframes modalOut{ from{opacity:1; transform:translateY(0) scale(1);} to{opacity:0; transform:translateY(10px) scale(.97);} }
@keyframes toastIn{ from{opacity:0; transform:translateX(30px);} to{opacity:1; transform:translateX(0);} }
[dir="rtl"] @keyframes toastIn{ }
@keyframes toastOut{ from{opacity:1; transform:translateX(0);} to{opacity:0; transform:translateX(30px);} }
@keyframes pulseSoft{ 0%,100%{transform:scale(1);} 50%{transform:scale(1.15);} }
@keyframes shake{ 10%,90%{transform:translateX(-1px);} 20%,80%{transform:translateX(2px);} 30%,50%,70%{transform:translateX(-4px);} 40%,60%{transform:translateX(4px);} }

/* ================================ Responsive ================================ */
@media (max-width:980px){
  .sidebar{position:fixed; inset-inline-start:0; top:0; height:100vh; transform:translateX(-105%);}
  [dir="rtl"] .sidebar{transform:translateX(105%);}
  .sidebar.open{transform:translateX(0);}
  [data-sidebar-toggle]{display:flex !important;}
  .app-shell{position:relative;}
}
