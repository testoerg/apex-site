// دوال النظام التفاعلية لمنصة Apex

// عرض رسائل التنبيه (Toast)
function showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = 'position:fixed; bottom:20px; left:20px; z-index:9999; display:flex; flex-direction:column; gap:10px;';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.style.cssText = 'background:#182140; color:#fff; padding:12px 20px; border-radius:8px; font-family:Cairo,sans-serif; font-size:13px; box-shadow:0 4px 12px rgba(0,0,0,0.3); border-right:4px solid ' + (type === 'error' ? '#f8695f' : type === 'success' ? '#22c55e' : '#4f7dff') + '; transition:all 0.3s ease; opacity:0; transform:translateY(20px);';
    toast.textContent = message;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    }, 10);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// زيادة أو تقليل قيم الـ KPI مباشرة
function bumpKpi(elementId, amount) {
    const el = document.getElementById(elementId);
    if (el) {
        let val = parseInt(el.textContent) || 0;
        el.textContent = val + amount;
    }
}

// إضافة صف جديد إلى الجداول
function addRow(tableId, htmlContent) {
    const table = document.getElementById(tableId);
    if (table) {
        const tbody = table.querySelector('tbody') || table;
        const tr = document.createElement('tr');
        tr.innerHTML = htmlContent;
        tbody.prepend(tr);
    }
}

// إدارة النوافذ المنخفضة (Modals)
function openModal(options) {
    const existing = document.getElementById('dynamicModal');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'dynamicModal';
    overlay.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); backdrop-filter:blur(4px); z-index:10000; display:flex; align-items:center; justify-content:center;';
    
    let fieldsHtml = '';
    if (options.fields) {
        options.fields.forEach(f => {
            fieldsHtml += `<div style="margin-bottom:15px;"><label style="display:block; margin-bottom:5px; font-size:13px; color:#cbd5e1;">${f.label}</label><input type="text" name="${f.name}" placeholder="${f.placeholder || ''}" style="width:100%; padding:10px; border-radius:8px; border:1px solid rgba(255,255,255,0.1); background:#0f172a; color:#fff; font-family:Cairo,sans-serif;"></div>`;
        });
    }

    overlay.innerHTML = `
        <div style="background:#1e293b; width:100%; max-width:450px; padding:25px; border-radius:16px; border:1px solid rgba(255,255,255,0.08); font-family:Cairo,sans-serif; color:#fff;">
            <h3 style="margin-top:0; margin-bottom:20px; font-size:18px; color:#f8fafc;">${options.title || 'إدخال بيانات'}</h3>
            <form id="modalForm">${fieldsHtml}
                <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px;">
                    <button type="button" id="modalCancel" style="padding:8px 16px; border-radius:8px; border:1px solid rgba(255,255,255,0.1); background:transparent; color:#cbd5e1; cursor:pointer;">إلغاء</button>
                    <button type="submit" style="padding:8px 20px; border-radius:8px; border:none; background:#4f7dff; color:#fff; cursor:pointer; font-weight:600;">${options.submitLabel || 'حفظ'}</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById('modalCancel').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

    document.getElementById('modalForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = {};
        const inputs = overlay.querySelectorAll('input');
        inputs.forEach(input => { formData[input.name] = input.value; });
        if (options.onSubmit) options.onSubmit(formData);
        overlay.remove();
    });
}