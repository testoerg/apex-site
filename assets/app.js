/* ==========================================================================
   Apex — Branches Under Control
   Front-end interactivity engine (no backend — persists via localStorage)
   ========================================================================== */
(function(){
  "use strict";

  const PAGE = document.body.dataset.page || "page";
  const LS = "apexdb_";

  /* ------------------------------------------------------------------ *
   *  Small storage helpers
   * ------------------------------------------------------------------ */
  function lsGet(key, fallback){
    try{ const v = localStorage.getItem(LS+key); return v===null? fallback : JSON.parse(v); }
    catch(e){ return fallback; }
  }
  function lsSet(key, val){
    try{ localStorage.setItem(LS+key, JSON.stringify(val)); }catch(e){/* ignore quota errors */}
  }

  /* ------------------------------------------------------------------ *
   *  Toasts
   * ------------------------------------------------------------------ */
  let toastStack;
  function ensureToastStack(){
    if(!toastStack){
      toastStack = document.createElement("div");
      toastStack.className = "toast-stack";
      document.body.appendChild(toastStack);
    }
    return toastStack;
  }
  function toast(message, type){
    const stack = ensureToastStack();
    const el = document.createElement("div");
    el.className = "toast" + (type ? " "+type : "");
    el.innerHTML = '<span class="dot"></span><span>'+message+'</span>';
    stack.appendChild(el);
    setTimeout(()=>{
      el.classList.add("leaving");
      setTimeout(()=> el.remove(), 320);
    }, 3200);
  }
  window.ApexToast = toast;

  /* ------------------------------------------------------------------ *
   *  Ripple effect on interactive elements
   * ------------------------------------------------------------------ */
  function attachRipple(el){
    el.addEventListener("click", function(e){
      const rect = el.getBoundingClientRect();
      const ripple = document.createElement("span");
      const size = Math.max(rect.width, rect.height);
      ripple.className = "ripple";
      ripple.style.width = ripple.style.height = size+"px";
      ripple.style.left = (e.clientX - rect.left - size/2)+"px";
      ripple.style.top = (e.clientY - rect.top - size/2)+"px";
      el.appendChild(ripple);
      setTimeout(()=> ripple.remove(), 650);
    });
  }
  function wireRipples(){
    document.querySelectorAll(".btn, .nav-item, .icon-btn, .menu-tile").forEach(el=>{
      if(el.dataset.rippleBound) return;
      el.dataset.rippleBound = "1";
      attachRipple(el);
    });
  }

  /* ------------------------------------------------------------------ *
   *  Modal system
   * ------------------------------------------------------------------ */
  function openModal({title, bodyHTML, submitLabel, onSubmit}){
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.innerHTML = `
      <div class="modal-box">
        <div class="modal-head"><h3>${title}</h3><button type="button" class="modal-close">&times;</button></div>
        <form>
          <div class="modal-body">${bodyHTML}</div>
          <div class="modal-foot">
            <button type="button" class="btn modal-cancel">إلغاء</button>
            <button type="submit" class="btn btn-primary">${submitLabel || "حفظ"}</button>
          </div>
        </form>
      </div>`;
    document.body.appendChild(overlay);
    wireRipples();

    function close(){
      overlay.classList.add("leaving");
      setTimeout(()=> overlay.remove(), 220);
    }
    overlay.querySelector(".modal-close").addEventListener("click", close);
    overlay.querySelector(".modal-cancel").addEventListener("click", close);
    overlay.addEventListener("click", (e)=>{ if(e.target === overlay) close(); });
    document.addEventListener("keydown", function esc(e){
      if(e.key === "Escape"){ close(); document.removeEventListener("keydown", esc); }
    });

    const form = overlay.querySelector("form");
    form.addEventListener("submit", function(e){
      e.preventDefault();
      const data = {};
      form.querySelectorAll("[data-field]").forEach(inp=>{ data[inp.dataset.field] = inp.value.trim(); });
      const ok = onSubmit(data, close);
      if(ok !== false) close();
    });

    const firstInput = overlay.querySelector("input, select, textarea");
    if(firstInput) setTimeout(()=> firstInput.focus(), 80);
    return overlay;
  }
  window.ApexModal = openModal;

  function fieldHTML(label, field, opts){
    opts = opts || {};
    const req = opts.required===false ? "" : "required";
    if(opts.select){
      const options = opts.select.map(o=>`<option value="${o}">${o}</option>`).join("");
      return `<div class="field"><label>${label}</label><select data-field="${field}" ${req}>${options}</select></div>`;
    }
    const type = opts.type || "text";
    const val = opts.value!==undefined ? `value="${opts.value}"` : "";
    return `<div class="field"><label>${label}</label><input type="${type}" data-field="${field}" placeholder="${opts.placeholder||''}" ${val} ${req}></div>`;
  }

  /* ------------------------------------------------------------------ *
   *  KPI delta engine — persists additions/removals across reloads
   * ------------------------------------------------------------------ */
  function ensureKpiBase(){
    document.querySelectorAll(".kpi-value").forEach(el=>{
      if(el.dataset.base === undefined) el.dataset.base = el.textContent.trim();
    });
  }
  function parseNum(str){
    const m = str.match(/^([\d,\.]+)(.*)$/);
    if(!m) return null;
    return { num: parseFloat(m[1].replace(/,/g,"")), suffix: m[2]||"", raw: m[1] };
  }
  function formatLike(num, raw){
    if(raw.indexOf(",") > -1) return Math.round(num).toLocaleString("en-US");
    if(raw.indexOf(".") > -1){ const d = raw.split(".")[1].length; return num.toFixed(d); }
    return Math.round(num).toString();
  }
  function applyKpiDeltas(){
    ensureKpiBase();
    const deltas = lsGet(PAGE+"_kpi", {});
    document.querySelectorAll(".kpi-value").forEach((el, i)=>{
      const parsed = parseNum(el.dataset.base);
      if(!parsed) return;
      const d = deltas[i] || 0;
      el.textContent = d===0 ? el.dataset.base : formatLike(parsed.num + d, parsed.raw) + parsed.suffix;
    });
  }
  function bumpKpi(index, delta){
    const deltas = lsGet(PAGE+"_kpi", {});
    deltas[index] = (deltas[index]||0) + delta;
    lsSet(PAGE+"_kpi", deltas);
    applyKpiDeltas();
    const card = document.querySelectorAll(".kpi-card")[index];
    if(card){ card.classList.add("shake"); setTimeout(()=>card.classList.remove("shake"), 420); }
  }

  /* ------------------------------------------------------------------ *
   *  Row persistence: remember dynamically added rows + removed seed rows
   * ------------------------------------------------------------------ */
  function tagSeedRows(){
    document.querySelectorAll("tbody").forEach((tb, ti)=>{
      [...tb.children].forEach((tr, ri)=>{
        if(!tr.dataset.rowId) tr.dataset.rowId = "seed-"+ti+"-"+ri;
      });
    });
  }
  function hideRemovedRows(){
    const removed = lsGet(PAGE+"_removed", []);
    removed.forEach(id=>{
      const tr = document.querySelector('tbody tr[data-row-id="'+CSS.escape(id)+'"]');
      if(tr) tr.remove();
    });
  }
  function markRemoved(id){
    const removed = lsGet(PAGE+"_removed", []);
    removed.push(id);
    lsSet(PAGE+"_removed", removed);
  }
  function restoreAddedRows(tbodySelector, buildRow){
    const tbody = document.querySelector(tbodySelector);
    if(!tbody) return;
    const rows = lsGet(PAGE+"_"+tbodySelector+"_rows", []);
    rows.forEach(data=>{
      tbody.insertAdjacentHTML("beforeend", buildRow(data));
    });
  }
  function persistAddedRow(tbodySelector, data){
    const key = PAGE+"_"+tbodySelector+"_rows";
    const rows = lsGet(key, []);
    rows.push(data);
    lsSet(key, rows);
  }
  function addRow(tbodySelector, html, data){
    const tbody = document.querySelector(tbodySelector);
    if(!tbody) return;
    tbody.insertAdjacentHTML("afterbegin", html);
    const tr = tbody.firstElementChild;
    tr.classList.add("row-enter");
    tr.dataset.rowId = "added-"+Date.now()+"-"+Math.round(Math.random()*9999);
    if(data) persistAddedRow(tbodySelector, data);
  }

  /* ------------------------------------------------------------------ *
   *  Row actions (view / edit / delete) — generic, works on any table
   * ------------------------------------------------------------------ */
  function wireRowActions(){
    document.querySelectorAll(".row-actions").forEach(group=>{
      if(group.dataset.bound) return;
      group.dataset.bound = "1";
      const icons = group.querySelectorAll(".icon-btn");
      const tr = group.closest("tr");
      if(icons[0]) icons[0].addEventListener("click", ()=>{
        const cells = [...tr.children].slice(0,-1).map(td=>td.textContent.trim()).filter(Boolean);
        toast("عرض: " + cells.slice(0,2).join(" — "), "info");
      });
      if(icons[1]) icons[1].addEventListener("click", ()=>{
        toast("فتح نموذج التعديل...", "info");
      });
      if(icons[2]) icons[2].addEventListener("click", ()=>{
        if(!confirm("هل أنت متأكد من الحذف؟ لا يمكن التراجع عن هذا الإجراء.")) return;
        tr.classList.add("row-exit");
        markRemoved(tr.dataset.rowId);
        setTimeout(()=> tr.remove(), 350);
        toast("تم الحذف بنجاح", "success");
      });
    });
  }

  /* ------------------------------------------------------------------ *
   *  Search filtering (sidebar nav + tables)
   * ------------------------------------------------------------------ */
  function wireSearchInputs(){
    document.querySelectorAll("input").forEach(inp=>{
      const ph = inp.getAttribute("placeholder") || "";
      if(!ph.includes("بحث")) return;
      if(inp.dataset.searchBound) return;
      inp.dataset.searchBound = "1";

      if(inp.closest(".sidebar-search")){
        inp.addEventListener("input", ()=>{
          const term = inp.value.trim().toLowerCase();
          document.querySelectorAll(".nav-item").forEach(item=>{
            const txt = item.textContent.trim().toLowerCase();
            item.style.display = (term === "" || txt.includes(term)) ? "" : "none";
          });
        });
        return;
      }
      inp.addEventListener("input", ()=>{
        const term = inp.value.trim().toLowerCase();
        const scope = inp.closest(".card") || document.querySelector(".page-body");
        if(!scope) return;
        scope.querySelectorAll("tbody tr").forEach(tr=>{
          const text = tr.textContent.toLowerCase();
          tr.style.display = (term === "" || text.includes(term)) ? "" : "none";
        });
      });
    });
  }

  /* ------------------------------------------------------------------ *
   *  Topbar: live date + functional bell/gear icons + unread dot
   * ------------------------------------------------------------------ */
  const AR_DAYS = ["الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"];
  const AR_MONTHS = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];
  function setLiveDate(){
    const now = new Date();
    const str = AR_DAYS[now.getDay()] + " " + now.getDate() + " " + AR_MONTHS[now.getMonth()] + " " + now.getFullYear();
    document.querySelectorAll(".topbar-date").forEach(el=> el.textContent = str);
  }
  function wireTopbarIcons(){
    document.querySelectorAll(".topbar-right .icon-btn").forEach(btn=>{
      if(btn.dataset.bound) return;
      const svgHtml = btn.innerHTML;
      if(svgHtml.includes("M6 8a6 6 0 0 1 12 0")){ // bell
        btn.dataset.bound = "1";
        btn.style.cursor = "pointer";
        btn.addEventListener("click", ()=>{
          if(PAGE !== "notifications") window.location.href = "notifications.html";
        });
      } else if(svgHtml.includes("M19.4 15")){ // gear
        btn.dataset.bound = "1";
        btn.style.cursor = "pointer";
        btn.addEventListener("click", ()=>{
          if(PAGE !== "settings") window.location.href = "settings.html";
        });
      }
    });
    // unread dot synced across pages via localStorage
    const totalNotifs = 8;
    const readCount = lsGet("notifs_read_count", 0);
    const bell = [...document.querySelectorAll(".topbar-right .icon-btn")].find(b=> b.innerHTML.includes("M6 8a6 6 0 0 1 12 0"));
    if(bell){
      if(readCount < totalNotifs) bell.classList.add("has-dot");
      else bell.classList.remove("has-dot");
    }
  }

  /* ------------------------------------------------------------------ *
   *  Login page — splash + redirect
   * ------------------------------------------------------------------ */
  function initLoginPage(){
    const form = document.getElementById("loginForm");
    const googleBtn = document.getElementById("googleLoginBtn");
    const forgot = document.getElementById("forgotPassLink");

    function runSplash(){
      const splash = document.createElement("div");
      splash.className = "boot-splash";
      splash.innerHTML = `
        <div class="boot-logo"><img src="assets/logo.svg" alt="Apex"></div>
        <h2>Apex</h2>
        <p>جاري تجهيز لوحة تحكم إدارة الموقع...</p>
        <div class="boot-bar"><span></span></div>`;
      document.body.appendChild(splash);
      setTimeout(()=>{
        splash.classList.add("leaving");
        setTimeout(()=>{ window.location.href = "dashboard.html"; }, 420);
      }, 1900);
    }

    if(form) form.addEventListener("submit", function(e){
      e.preventDefault();
      const btn = document.getElementById("loginSubmitBtn");
      btn.disabled = true;
      btn.textContent = "جاري التحقق...";
      setTimeout(runSplash, 450);
    });
    if(googleBtn) googleBtn.addEventListener("click", runSplash);
    if(forgot) forgot.addEventListener("click", function(e){
      e.preventDefault();
      toast("تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني (تجريبي)", "info");
    });
  }

  /* ------------------------------------------------------------------ *
   *  Per-page wiring
   * ------------------------------------------------------------------ */
  function findButtonByText(text, root){
    root = root || document;
    return [...root.querySelectorAll("button")].find(b=> b.textContent.trim().includes(text));
  }

  function initBranches(){
    const tbodySel = ".grid-2 .card:first-child tbody";
    restoreAddedRows(tbodySel, d=> branchRowHTML(d));
    function branchRowHTML(d){
      const badgeClass = d.status === "نشط" ? "badge-green" : (d.status === "متوقف" ? "badge-red" : "badge-orange");
      return `<tr><td>${d.name}</td><td>${d.address}</td><td>${d.phone}</td><td>${d.manager}</td>
        <td><span class="badge ${badgeClass}">${d.status}</span></td>
        <td><div class="row-actions">
          <span class="icon-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z"/><circle cx="12" cy="12" r="3"/></svg></span>
          <span class="icon-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg></span>
          <span class="icon-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16"/><path d="M6 7V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2m1 0-.8 12.2A2 2 0 0 1 16.2 21H7.8a2 2 0 0 1-2-1.8L5 7"/></svg></span>
        </div></td></tr>`;
    }
    const btn = findButtonByText("إضافة فرع جديد");
    if(btn) btn.addEventListener("click", ()=>{
      openModal({
        title: "إضافة فرع جديد",
        submitLabel: "إضافة الفرع",
        bodyHTML: fieldHTML("اسم الفرع","name",{placeholder:"مثال: فرع دمياط"}) +
                  fieldHTML("العنوان","address",{placeholder:"العنوان بالتفصيل"}) +
                  fieldHTML("رقم الهاتف","phone",{placeholder:"01000000000"}) +
                  fieldHTML("مدير الفرع","manager",{placeholder:"اسم المدير"}) +
                  fieldHTML("الحالة","status",{select:["نشط","تحت المراجعة","متوقف"]}),
        onSubmit(data){
          addRow(tbodySel, branchRowHTML(data), data);
          bumpKpi(0, 1);
          if(data.status === "نشط") bumpKpi(1, 1);
          else if(data.status === "تحت المراجعة") bumpKpi(2, 1);
          toast("تم إضافة الفرع بنجاح", "success");
        }
      });
    });
  }

  function initInventory(){
    const tbodySel = ".grid-2 .card:first-child tbody";
    function invRowHTML(d){
      const low = d.status === "منخفض";
      return `<tr><td>${d.name}</td><td>${d.branch}</td><td>${d.qty}</td><td>${d.min}</td>
        <td><span class="badge ${low?'badge-red':'badge-green'}">${d.status}</span></td></tr>`;
    }
    restoreAddedRows(tbodySel, invRowHTML);
    const btn = findButtonByText("إضافة صنف");
    if(btn) btn.addEventListener("click", ()=>{
      openModal({
        title: "إضافة صنف للمخزون",
        submitLabel: "إضافة الصنف",
        bodyHTML: fieldHTML("اسم الصنف","name",{placeholder:"مثال: أرز أبيض"}) +
                  fieldHTML("الفرع","branch",{placeholder:"مثال: فرع القاهرة"}) +
                  fieldHTML("الكمية الحالية","qty",{placeholder:"مثال: 25 كجم"}) +
                  fieldHTML("الحد الأدنى","min",{placeholder:"مثال: 15 كجم"}),
        onSubmit(data){
          const qtyNum = parseFloat(data.qty) || 0;
          const minNum = parseFloat(data.min) || 0;
          data.status = qtyNum < minNum ? "منخفض" : "متوفر";
          addRow(tbodySel, invRowHTML(data), data);
          if(data.status === "منخفض") bumpKpi(1, 1);
          toast("تم إضافة الصنف بنجاح", "success");
        }
      });
    });
  }

  function initHR(){
    const tbodySel = ".grid-2 .card:first-child tbody";
    function hrRowHTML(d){
      return `<tr><td>${d.name}</td><td>${d.job}</td><td>${d.branch}</td><td>${d.phone}</td><td>${d.date}</td>
        <td><span class="badge badge-green">نشط</span></td></tr>`;
    }
    restoreAddedRows(tbodySel, hrRowHTML);
    const btn = findButtonByText("إضافة موظف");
    if(btn) btn.addEventListener("click", ()=>{
      const today = new Date().toISOString().slice(0,10);
      openModal({
        title: "إضافة موظف جديد",
        submitLabel: "إضافة الموظف",
        bodyHTML: fieldHTML("اسم الموظف","name",{placeholder:"الاسم بالكامل"}) +
                  fieldHTML("الوظيفة","job",{placeholder:"مثال: كاشير"}) +
                  fieldHTML("الفرع","branch",{placeholder:"مثال: فرع الجيزة"}) +
                  fieldHTML("رقم الهاتف","phone",{placeholder:"01000000000"}) +
                  fieldHTML("تاريخ التعيين","date",{type:"date", value: today}),
        onSubmit(data){
          addRow(tbodySel, hrRowHTML(data), data);
          bumpKpi(2, 1);
          toast("تم إضافة الموظف بنجاح", "success");
        }
      });
    });
  }

  function initSuppliers(){
    const tbodySel = ".grid-2 .card:first-child tbody";
    function supRowHTML(d){
      return `<tr><td>${d.supplier}</td><td>${d.items}</td><td>${d.phone}</td><td>${d.date}</td><td>${d.value} EGP</td>
        <td><span class="badge badge-orange">قيد الشحن</span></td></tr>`;
    }
    restoreAddedRows(tbodySel, supRowHTML);
    const btn = findButtonByText("طلب شراء جديد");
    if(btn) btn.addEventListener("click", ()=>{
      const today = new Date().toISOString().slice(0,10);
      openModal({
        title: "طلب شراء جديد",
        submitLabel: "إرسال الطلب",
        bodyHTML: fieldHTML("اسم المورد","supplier",{placeholder:"مثال: مؤسسة الفا للحوم"}) +
                  fieldHTML("المنتجات","items",{placeholder:"مثال: لحوم وفراخ"}) +
                  fieldHTML("رقم الهاتف","phone",{placeholder:"01000000000"}) +
                  fieldHTML("تاريخ الطلب","date",{type:"date", value: today}) +
                  fieldHTML("القيمة (EGP)","value",{placeholder:"مثال: 10000", type:"number"}),
        onSubmit(data){
          addRow(tbodySel, supRowHTML(data), data);
          bumpKpi(2, 1);
          toast("تم إرسال طلب الشراء للمورد", "success");
        }
      });
    });
  }

  function initCustomers(){
    const tbodySel = ".grid-2 .card:first-child tbody";
    function custRowHTML(d){
      return `<tr><td>${d.name}</td><td>${d.phone}</td><td>${d.branch}</td><td>0 طلبات</td><td>0 EGP</td></tr>`;
    }
    restoreAddedRows(tbodySel, custRowHTML);
    const btn = findButtonByText("إضافة عميل");
    if(btn) btn.addEventListener("click", ()=>{
      openModal({
        title: "إضافة عميل جديد",
        submitLabel: "إضافة العميل",
        bodyHTML: fieldHTML("اسم العميل","name",{placeholder:"الاسم بالكامل"}) +
                  fieldHTML("رقم الهاتف","phone",{placeholder:"01000000000"}) +
                  fieldHTML("الفرع المعتاد","branch",{placeholder:"مثال: فرع القاهرة"}),
        onSubmit(data){
          addRow(tbodySel, custRowHTML(data), data);
          bumpKpi(0, 1);
          toast("تم إضافة العميل بنجاح", "success");
        }
      });
    });
  }

  function initComplaints(){
    const tbodySel = ".grid-2 .card:first-child tbody";
    function compRowHTML(d){
      return `<tr><td>${d.order}</td><td>${d.type}</td><td>${d.branch}</td><td>${d.date}</td>
        <td><span class="badge badge-orange">جديدة</span></td></tr>`;
    }
    restoreAddedRows(tbodySel, compRowHTML);
    const btn = findButtonByText("تسجيل شكوى");
    if(btn) btn.addEventListener("click", ()=>{
      const today = new Date().toISOString().slice(0,10);
      openModal({
        title: "تسجيل شكوى جديدة",
        submitLabel: "تسجيل الشكوى",
        bodyHTML: fieldHTML("رقم الطلب","order",{placeholder:"مثال: #ORD-1030"}) +
                  fieldHTML("نوع الشكوى","type",{select:["تأخير الطلب","العلبة مثقوبة","وصل بارد","جسم غريب","سلوك من الطيار","نقص في الطلب","طعم غير مطابق","العبوة مكسورة","أخرى"]}) +
                  fieldHTML("الفرع","branch",{placeholder:"مثال: فرع القاهرة"}) +
                  fieldHTML("التاريخ","date",{type:"date", value: today}),
        onSubmit(data){
          addRow(tbodySel, compRowHTML(data), data);
          bumpKpi(0, 1); // قيد المراجعة
          bumpKpi(2, 1); // إجمالي الشكاوى
          toast("تم تسجيل الشكوى وسيتم متابعتها", "success");
        }
      });
    });
  }

  function initMaintenance(){
    const tbodySel = ".card:last-child tbody";
    function maintRowHTML(d){
      return `<tr><td>${d.device}</td><td>${d.branch}</td><td>${d.priority}</td><td>${d.tech||'-'}</td>
        <td><span class="badge badge-blue">جديدة</span></td></tr>`;
    }
    restoreAddedRows(tbodySel, maintRowHTML);
    const btn = findButtonByText("تسجيل عطل");
    if(btn) btn.addEventListener("click", ()=>{
      openModal({
        title: "تسجيل عطل جديد",
        submitLabel: "تسجيل العطل",
        bodyHTML: fieldHTML("الجهاز / المعدة","device",{placeholder:"مثال: ثلاجة المطبخ"}) +
                  fieldHTML("الفرع","branch",{placeholder:"مثال: فرع القاهرة"}) +
                  fieldHTML("الأولوية","priority",{select:["عالية","متوسطة","منخفضة"]}) +
                  fieldHTML("الفني المسؤول","tech",{placeholder:"اختياري", required:false}),
        onSubmit(data){
          addRow(tbodySel, maintRowHTML(data), data);
          bumpKpi(0, 1);
          toast("تم تسجيل العطل وسيتم توزيعه على الفني المناسب", "success");
        }
      });
    });
  }

  function initMarketing(){
    function offerRowHTML(d){
      return `<tr><td>${d.name}</td><td>${d.branches}</td><td>${d.from}</td><td>${d.to}</td><td>0 طلب</td>
        <td><span class="badge badge-green">نشط</span></td></tr>`;
    }
    const tables = document.querySelectorAll("table tbody");
    const offersTbody = tables[tables.length-1];
    const offersSelKey = "offers_tbody";
    if(offersTbody){
      const rows = lsGet(PAGE+"_"+offersSelKey+"_rows", []);
      rows.forEach(d=> offersTbody.insertAdjacentHTML("beforeend", offerRowHTML(d)));
    }
    const btn = findButtonByText("إضافة عرض");
    if(btn) btn.addEventListener("click", ()=>{
      const today = new Date().toISOString().slice(0,10);
      openModal({
        title: "إضافة عرض جديد",
        submitLabel: "إضافة العرض",
        bodyHTML: fieldHTML("اسم العرض","name",{placeholder:"مثال: خصم 15% على البيتزا"}) +
                  fieldHTML("الفروع","branches",{placeholder:"مثال: كل الفروع"}) +
                  fieldHTML("من تاريخ","from",{type:"date", value: today}) +
                  fieldHTML("إلى تاريخ","to",{type:"date"}),
        onSubmit(data){
          if(offersTbody) offersTbody.insertAdjacentHTML("afterbegin", offerRowHTML(data));
          const rows = lsGet(PAGE+"_"+offersSelKey+"_rows", []);
          rows.push(data);
          lsSet(PAGE+"_"+offersSelKey+"_rows", rows);
          bumpKpi(0, 1);
          toast("تم إضافة العرض وتفعيله", "success");
        }
      });
    });
    const activateBtn = findButtonByText("تفعيل العرض");
    if(activateBtn) activateBtn.addEventListener("click", ()=>{
      activateBtn.textContent = "تم التفعيل ✓";
      activateBtn.disabled = true;
      toast("تم تفعيل العرض على كل الفروع", "success");
    });
  }

  function initSettings(){
    // Persist free-text fields by their label text
    document.querySelectorAll(".field").forEach(field=>{
      const label = field.querySelector("label");
      const input = field.querySelector("input");
      if(!label || !input) return;
      const key = "settings_"+label.textContent.trim();
      const saved = lsGet(key, null);
      if(saved !== null) input.value = saved;
    });
    document.querySelectorAll(".card .btn-primary").forEach(btn=>{
      if(!btn.textContent.includes("حفظ التغييرات")) return;
      btn.addEventListener("click", ()=>{
        const card = btn.closest(".card");
        const original = btn.innerHTML;
        btn.disabled = true;
        btn.textContent = "جاري الحفظ...";
        setTimeout(()=>{
          card.querySelectorAll(".field").forEach(field=>{
            const label = field.querySelector("label");
            const input = field.querySelector("input");
            if(label && input) lsSet("settings_"+label.textContent.trim(), input.value);
          });
          btn.disabled = false;
          btn.innerHTML = original;
          toast("تم حفظ التغييرات بنجاح", "success");
        }, 600);
      });
    });
    // Add-user modal
    const tbody = document.querySelector(".table-wrap table tbody");
    function userRowHTML(d){
      return `<tr><td>${d.name}</td><td>${d.email}</td><td>${d.role}</td><td><span class="badge badge-green">نشط</span></td></tr>`;
    }
    if(tbody) restoreAddedRows(".table-wrap table tbody", userRowHTML);
    const addUserBtn = findButtonByText("إضافة مستخدم");
    if(addUserBtn) addUserBtn.addEventListener("click", ()=>{
      openModal({
        title: "إضافة مستخدم جديد",
        submitLabel: "إضافة المستخدم",
        bodyHTML: fieldHTML("الاسم","name",{placeholder:"الاسم بالكامل"}) +
                  fieldHTML("البريد الإلكتروني","email",{type:"email", placeholder:"user@apex-system.com"}) +
                  fieldHTML("الدور","role",{select:["مدير عام","مدير فرع","كاشير","موظف مخزن"]}),
        onSubmit(data){
          addRow(".table-wrap table tbody", userRowHTML(data), data);
          toast("تم إضافة المستخدم بنجاح", "success");
        }
      });
    });
  }

  function initPermissions(){
    document.querySelectorAll(".card").forEach(card=>{
      const title = card.querySelector("h3");
      if(!title) return;
      const roleKey = "perm_"+title.textContent.trim();
      const boxes = card.querySelectorAll('input[type="checkbox"]');
      const saved = lsGet(roleKey, null);
      if(saved){
        boxes.forEach((b,i)=>{ if(saved[i] !== undefined) b.checked = saved[i]; });
      }
      const saveBtn = [...card.querySelectorAll("button")].find(b=> b.textContent.includes("حفظ الصلاحيات"));
      if(saveBtn) saveBtn.addEventListener("click", ()=>{
        const state = [...boxes].map(b=> b.checked);
        lsSet(roleKey, state);
        const original = saveBtn.innerHTML;
        saveBtn.innerHTML = "تم الحفظ ✓";
        setTimeout(()=> saveBtn.innerHTML = original, 1500);
        toast('تم حفظ صلاحيات دور "'+title.textContent.trim()+'"', "success");
      });
    });
  }

  function initNotifications(){
    const card = document.querySelector(".page-body .card");
    const notifItems = card ? [...card.children].filter(c=> c.tagName === "DIV" && !c.classList.contains("card-head")) : [];
    const readState = lsGet("notifs_read", []);
    notifItems.forEach((item, i)=>{
      if(readState[i]) item.classList.add("is-read");
      const viewBtn = item.querySelector("button");
      if(viewBtn) viewBtn.addEventListener("click", ()=>{
        const titleEl = item.querySelector('div[style*="font-weight:700"]');
        const title = (titleEl ? titleEl.textContent : item.textContent).trim();
        readState[i] = true;
        lsSet("notifs_read", readState);
        item.classList.add("is-read");
        lsSet("notifs_read_count", readState.filter(Boolean).length);
        wireTopbarIcons();
        let target = null;
        if(title.includes("شكوى")) target = "complaints.html";
        else if(title.includes("عطل")) target = "maintenance.html";
        else if(title.includes("طلب") && title.includes("#")) target = "orders.html";
        else if(title.includes("مخزون")) target = "inventory.html";
        else if(title.includes("مبيعات")) target = "sales.html";
        else if(title.includes("مورد") || title.includes("شراء")) target = "suppliers.html";
        else if(title.includes("صلاحيات")) target = "permissions.html";
        else if(title.includes("عرض")) target = "marketing.html";
        toast("فتح: " + title.slice(0,40) + (target? " ..." : ""), "info");
        if(target) setTimeout(()=> window.location.href = target, 700);
      });
    });
    const markAllBtn = findButtonByText("تعليم الكل كمقروء");
    if(markAllBtn) markAllBtn.addEventListener("click", ()=>{
      notifItems.forEach((item,i)=>{ item.classList.add("is-read"); readState[i] = true; });
      lsSet("notifs_read", readState);
      lsSet("notifs_read_count", notifItems.length);
      wireTopbarIcons();
      toast("تم تعليم كل التنبيهات كمقروءة", "success");
    });
  }

  function initReports(){
    document.querySelectorAll("button").forEach(btn=>{
      if(!btn.textContent.includes("تصدير")) return;
      btn.addEventListener("click", ()=>{
        const row = btn.closest("tr");
        const name = row ? row.children[0].textContent.trim() : "تقرير";
        const original = btn.innerHTML;
        btn.innerHTML = "جاري التجهيز...";
        btn.disabled = true;
        setTimeout(()=>{
          const content = "Apex — " + name + "\nتاريخ التصدير: " + new Date().toLocaleString("ar-EG") +
            "\n\nهذا تقرير تجريبي تم توليده تلقائياً من نظام Apex لإدارة الفروع.";
          const blob = new Blob([content], {type:"text/plain;charset=utf-8"});
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = name.replace(/\s+/g,"_") + ".txt";
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
          btn.innerHTML = original;
          btn.disabled = false;
          toast('تم تصدير "'+name+'" بنجاح', "success");
        }, 700);
      });
    });
  }

  function initDashboardLinks(){
    // Make KPI cards on dashboard/sales clickable shortcuts to relevant pages
    const map = {
      "إجمالي المبيعات":"sales.html", "المبيعات اليوم":"sales.html",
      "إجمالي المخزون":"inventory.html", "إجمالي الطلبات":"orders.html",
      "إجمالي الخسائر":"accounts.html", "الخسائر / المرتجعات":"accounts.html"
    };
    document.querySelectorAll(".kpi-card").forEach(card=>{
      const label = card.querySelector(".kpi-label");
      if(!label) return;
      const target = map[label.textContent.trim()];
      if(target && target !== (PAGE+".html")){
        card.style.cursor = "pointer";
        card.addEventListener("click", ()=> window.location.href = target);
      }
    });
  }

  /* ------------------------------------------------------------------ *
   *  Boot
   * ------------------------------------------------------------------ */
  document.addEventListener("DOMContentLoaded", function(){
    if(PAGE === "index"){
      initLoginPage();
      return; // login page has no app-shell
    }

    setLiveDate();
    tagSeedRows();
    hideRemovedRows();
    applyKpiDeltas();
    wireRipples();
    wireRowActions();
    wireSearchInputs();
    wireTopbarIcons();
    initDashboardLinks();

    const initers = {
      branches: initBranches,
      inventory: initInventory,
      hr: initHR,
      suppliers: initSuppliers,
      customers: initCustomers,
      complaints: initComplaints,
      maintenance: initMaintenance,
      marketing: initMarketing,
      settings: initSettings,
      permissions: initPermissions,
      notifications: initNotifications,
      reports: initReports
    };
    if(initers[PAGE]) initers[PAGE]();

    // Re-run generic wiring after any dynamic content is added
    const observer = new MutationObserver(()=>{ wireRipples(); wireRowActions(); });
    observer.observe(document.body, {childList:true, subtree:true});

    // Sidebar toggle for small screens
    document.querySelectorAll("[data-sidebar-toggle]").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        document.querySelector(".sidebar").classList.toggle("open");
      });
    });
  });
})();
