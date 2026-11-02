/* ==========================================================================
   Apex — Branches Under Control
   Front-end interactivity engine
   ========================================================================== */
(function(){
  "use strict";
  // نظام التنبيهات العام
  window.ApexToast = function(message, type = 'info') {
    let container = document.querySelector(".toast-stack");
    if (!container) {
      container = document.createElement("div");
      container.className = "toast-stack";
      document.body.appendChild(container);
    }
    const toast = document.createElement("div");
    toast.className = "toast " + type;
    toast.innerHTML = '<span class="dot"></span><span>' + message + '</span>';
    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add("leaving");
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  };
  
  // تفعيل تفاعلات الأزرار والجداول عند تحميل الصفحة
  document.addEventListener("DOMContentLoaded", () => {
    console.log("Apex Engine Loaded Successfully.");
  });
})();
