$(document).ready(function () {

  // ── Auth Guard ──────────────────────────────────────────
  if (sessionStorage.getItem('luxe_auth') !== 'true') { window.location.href = '/login.html'; return; }
  $('#logoutBtn').on('click', function () { sessionStorage.removeItem('luxe_auth'); window.location.href = '/login.html'; });

  // ── Sidebar ─────────────────────────────────────────────
  $('#hamburger').on('click', function () { $('#sidebar').toggleClass('open'); $('#sidebarOverlay').toggleClass('open'); });
  $('#sidebarOverlay').on('click', function () { $('#sidebar, #sidebarOverlay').removeClass('open'); });

  // Accordion toggle
  $('.sidebar-nav').on('click', '.acc-header', function () {
    $(this).closest('.acc-group').toggleClass('open');
  });

  // External page links
  $('.sidebar-nav').on('click', '.nav-link-page', function () {
    window.location.href = $(this).data('href');
  });

  $('.sidebar-nav').on('click', '.nav-item:not(.nav-link-page)', function () {
    const $t = $(this);
    $t.addClass('active').closest('.sidebar-nav').find('.nav-item').not($t).removeClass('active');
    $('.dashboard-section').hide();
    $($t.data('target')).show();
    $('#sidebar, #sidebarOverlay').removeClass('open');
    loadSection($t.data('target'));
  });

  function loadSection(target) {
    switch (target) {
      case '#customersSection':  fetchCustomers(); break;
      case '#suppliersSection':  fetchSuppliers(); break;
      case '#categoriesSection': fetchCategories(); break;
      case '#warehousesSection': fetchWarehouses(); break;
      case '#productsSection':   fetchProducts(); break;
      case '#usersSection':      fetchUsers(); break;
      case '#employeesSection':  fetchEmployees(); break;
      case '#purchasesSection':  fetchPurchases(); break;
      case '#salesSection':      fetchSales(); break;
      case '#rentalsSection':    fetchSuits(); fetchRentals(); break;
      case '#receiptsSection':   fetchReceipts(); break;
      case '#paymentsSection':   fetchPayments(); break;
      case '#reportsSection':    fetchReports(); break;
    }
  }

  // ── Helpers ──────────────────────────────────────────────
  function emptyRow(cols, msg) {
    return `<tr><td colspan="${cols}" style="color:var(--text-secondary);text-align:center;padding:30px">${msg}</td></tr>`;
  }
  function fmtDate(d) { return d ? new Date(d).toLocaleDateString('ar-EG') : '—'; }
  function fmtMoney(n) { return Number(n || 0).toLocaleString('ar-EG', { minimumFractionDigits: 2 }); }
  function badge(status) { return `<span class="badge-${status}">${status}</span>`; }

  // ── Generic Entity Modal ─────────────────────────────────
  let _entitySave = null;
  function openEntityModal(title, fieldsHtml, onSave) {
    $('#entityModalTitle').text(title);
    $('#entityForm').html(fieldsHtml + '<button type="submit" class="submit-btn" style="margin-top:8px">حفظ</button>');
    $('#entityErrorMsg').hide().text('');
    _entitySave = onSave;
    $('#entityModal').addClass('active');
    setTimeout(() => $('#entityModal input:visible, #entityModal select:visible').first().focus(), 100);
  }
  $('#closeEntityModal, #entityModal').on('click', function (e) {
    if (e.target === this) $('#entityModal').removeClass('active');
  });
  $('#entityForm').on('submit', function (e) {
    e.preventDefault();
    if (_entitySave) _entitySave();
  });

  function entityAjax(method, url, data, onSuccess) {
    $.ajax({
      url, method, contentType: 'application/json', data: JSON.stringify(data),
      success: function (res) { if (res.success) { $('#entityModal').removeClass('active'); onSuccess(); } },
      error: function (xhr) { $('#entityErrorMsg').text(xhr.responseJSON?.message || 'خطأ').show(); }
    });
  }

  function confirmDelete(url, onSuccess) {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;
    $.ajax({ url, method: 'DELETE', success: onSuccess, error: function (xhr) { alert(xhr.responseJSON?.message || 'فشل الحذف'); } });
  }

  // ══════════════════════════════════════
  //  CUSTOMERS
  // ══════════════════════════════════════
  function fetchCustomers() {
    $.get('/api/customers', function (res) {
      const $b = $('#customersTable tbody').empty();
      if (!res.data?.length) { $b.append(emptyRow(5, 'لا يوجد عملاء')); return; }
      res.data.forEach(function (c) {
        $b.append(`<tr>
          <td>${c.name}</td><td>${c.email||'—'}</td><td>${c.phone||'—'}</td>
          <td>${fmtMoney(c.balance)}</td>
          <td>
            <button class="icon-btn edit" data-type="customer" data-id="${c.id}" data-name="${c.name}" data-email="${c.email||''}" data-phone="${c.phone||''}" data-address="${c.address||''}">تعديل</button>
            <button class="icon-btn del" data-url="/api/customers/${c.id}" data-cb="fetchCustomers">حذف</button>
          </td></tr>`);
      });
    });
  }

  $('#addCustomerBtn').on('click', function () {
    openEntityModal('إضافة عميل', customerFields(), function () {
      entityAjax('POST', '/api/customers', getEntityData(['name','email','phone','address']), fetchCustomers);
    });
  });

  function customerFields(d) {
    d = d || {};
    return `
      <div class="form-group"><label>الاسم *</label><input id="ef_name" value="${d.name||''}" required></div>
      <div class="form-group"><label>البريد</label><input type="email" id="ef_email" value="${d.email||''}"></div>
      <div class="form-group"><label>الهاتف</label><input id="ef_phone" value="${d.phone||''}"></div>
      <div class="form-group"><label>العنوان</label><input id="ef_address" value="${d.address||''}"></div>`;
  }

  // ══════════════════════════════════════
  //  SUPPLIERS
  // ══════════════════════════════════════
  function fetchSuppliers() {
    $.get('/api/suppliers', function (res) {
      const $b = $('#suppliersTable tbody').empty();
      if (!res.data?.length) { $b.append(emptyRow(6, 'لا يوجد موردين')); return; }
      res.data.forEach(function (s) {
        $b.append(`<tr>
          <td>${s.name}</td><td>${s.email||'—'}</td><td>${s.phone||'—'}</td><td>${s.address||'—'}</td>
          <td>${fmtMoney(s.balance)}</td>
          <td>
            <button class="icon-btn edit" data-type="supplier" data-id="${s.id}" data-name="${s.name}" data-email="${s.email||''}" data-phone="${s.phone||''}" data-address="${s.address||''}">تعديل</button>
            <button class="icon-btn del" data-url="/api/suppliers/${s.id}" data-cb="fetchSuppliers">حذف</button>
          </td></tr>`);
      });
    });
  }

  $('#addSupplierBtn').on('click', function () {
    openEntityModal('إضافة مورد', supplierFields(), function () {
      entityAjax('POST', '/api/suppliers', getEntityData(['name','email','phone','address']), fetchSuppliers);
    });
  });

  function supplierFields(d) { return customerFields(d); } // same fields

  // ══════════════════════════════════════
  //  CATEGORIES
  // ══════════════════════════════════════
  function fetchCategories() {
    $.get('/api/categories', function (res) {
      const $b = $('#categoriesTable tbody').empty();
      if (!res.data?.length) { $b.append(emptyRow(2, 'لا توجد مجموعات')); return; }
      res.data.forEach(function (c) {
        $b.append(`<tr><td>${c.name}</td><td>
          <button class="icon-btn edit" data-type="category" data-id="${c.id}" data-name="${c.name}">تعديل</button>
          <button class="icon-btn del" data-url="/api/categories/${c.id}" data-cb="fetchCategories">حذف</button>
        </td></tr>`);
      });
    });
  }

  $('#addCategoryBtn').on('click', function () {
    openEntityModal('إضافة مجموعة', `<div class="form-group"><label>الاسم *</label><input id="ef_name" required></div>`, function () {
      entityAjax('POST', '/api/categories', { name: $('#ef_name').val() }, fetchCategories);
    });
  });

  // ══════════════════════════════════════
  //  WAREHOUSES
  // ══════════════════════════════════════
  function fetchWarehouses() {
    $.get('/api/warehouses', function (res) {
      const $b = $('#warehousesTable tbody').empty();
      if (!res.data?.length) { $b.append(emptyRow(3, 'لا توجد مخازن')); return; }
      res.data.forEach(function (w) {
        $b.append(`<tr><td>${w.name}</td><td>${w.location||'—'}</td><td>
          <button class="icon-btn edit" data-type="warehouse" data-id="${w.id}" data-name="${w.name}" data-location="${w.location||''}">تعديل</button>
          <button class="icon-btn del" data-url="/api/warehouses/${w.id}" data-cb="fetchWarehouses">حذف</button>
        </td></tr>`);
      });
    });
  }

  $('#addWarehouseBtn').on('click', function () {
    openEntityModal('إضافة صندوق / مخزن', `
      <div class="form-group"><label>الاسم *</label><input id="ef_name" required></div>
      <div class="form-group"><label>الموقع</label><input id="ef_location"></div>`, function () {
      entityAjax('POST', '/api/warehouses', { name: $('#ef_name').val(), location: $('#ef_location').val() }, fetchWarehouses);
    });
  });

  // ══════════════════════════════════════
  //  PRODUCTS
  // ══════════════════════════════════════
  function fetchProducts() {
    $.get('/api/products', function (res) {
      const $b = $('#productsTable tbody').empty();
      if (!res.data?.length) { $b.append(emptyRow(6, 'لا توجد أصناف')); return; }
      res.data.forEach(function (p) {
        $b.append(`<tr>
          <td>${p.name}</td><td>${p.sku}</td><td>${p.category?.name||'—'}</td>
          <td>${fmtMoney(p.costPrice)}</td><td>${fmtMoney(p.salePrice)}</td>
          <td>
            <button class="icon-btn edit" data-type="product" data-id="${p.id}"
              data-name="${p.name}" data-sku="${p.sku}" data-unit="${p.unit}"
              data-costprice="${p.costPrice}" data-saleprice="${p.salePrice}"
              data-categoryid="${p.categoryId||''}">تعديل</button>
            <button class="icon-btn del" data-url="/api/products/${p.id}" data-cb="fetchProducts">حذف</button>
          </td></tr>`);
      });
    });
  }

  $('#addProductBtn').on('click', function () {
    buildProductModal({});
  });

  function buildProductModal(d) {
    $.get('/api/categories', function (catRes) {
      const catOpts = (catRes.data||[]).map(c => `<option value="${c.id}" ${d.categoryid===c.id?'selected':''}>${c.name}</option>`).join('');
      openEntityModal(d.id ? 'تعديل صنف' : 'إضافة صنف', `
        <div class="form-group"><label>الاسم *</label><input id="ef_name" value="${d.name||''}" required></div>
        <div class="form-group"><label>SKU *</label><input id="ef_sku" value="${d.sku||''}" required></div>
        <div class="form-group"><label>الوحدة</label><input id="ef_unit" value="${d.unit||'piece'}"></div>
        <div class="form-group"><label>سعر التكلفة</label><input type="number" id="ef_costPrice" value="${d.costprice||0}" min="0"></div>
        <div class="form-group"><label>سعر البيع</label><input type="number" id="ef_salePrice" value="${d.saleprice||0}" min="0"></div>
        <div class="form-group"><label>المجموعة</label>
          <select id="ef_categoryId" class="action-select" style="width:100%;padding:10px;background:rgba(0,0,0,0.2);border:1px solid var(--border-color);border-radius:6px;color:white;">
            <option value="">— بدون مجموعة —</option>${catOpts}
          </select>
        </div>`, function () {
        const payload = { name: $('#ef_name').val(), sku: $('#ef_sku').val(), unit: $('#ef_unit').val(),
          costPrice: $('#ef_costPrice').val(), salePrice: $('#ef_salePrice').val(), categoryId: $('#ef_categoryId').val() || null };
        entityAjax(d.id ? 'PUT' : 'POST', d.id ? `/api/products/${d.id}` : '/api/products', payload, fetchProducts);
      });
    });
  }

  // ══════════════════════════════════════
  //  USERS
  // ══════════════════════════════════════
  function fetchUsers() {
    $.get('/api/users', function (res) {
      const $b = $('#usersTable tbody').empty();
      if (!res.data?.length) { $b.append(emptyRow(5, 'لا يوجد مستخدمين')); return; }
      res.data.forEach(function (u) {
        $b.append(`<tr>
          <td>${u.name}</td><td>${u.email}</td><td>${u.phone}</td><td>${fmtDate(u.createdAt)}</td>
          <td>
            <button class="icon-btn edit" data-type="user" data-id="${u.id}" data-name="${u.name}" data-email="${u.email}" data-phone="${u.phone}">تعديل</button>
            <button class="icon-btn del" data-url="/api/users/${u.id}" data-cb="fetchUsers">حذف</button>
          </td></tr>`);
      });
    });
  }

  $('#addUserBtn').on('click', function () {
    openEntityModal('إضافة مستخدم', `
      <div class="form-group"><label>الاسم *</label><input id="ef_name" required></div>
      <div class="form-group"><label>البريد *</label><input type="email" id="ef_email" required></div>
      <div class="form-group"><label>الهاتف *</label><input id="ef_phone" required></div>`, function () {
      entityAjax('POST', '/api/users', getEntityData(['name','email','phone']), fetchUsers);
    });
  });

  // ── Generic edit/delete delegation ──────────────────────
  const cbMap = { customer: fetchCustomers, supplier: fetchSuppliers, category: fetchCategories,
    warehouse: fetchWarehouses, product: fetchProducts, user: fetchUsers };

  $(document).on('click', '.icon-btn.edit', function () {
    const $b = $(this), type = $b.data('type'), d = $b.data();
    if (type === 'product') { buildProductModal(d); return; }
    const fields = {
      customer:  customerFields(d),
      supplier:  supplierFields(d),
      category:  `<div class="form-group"><label>الاسم *</label><input id="ef_name" value="${d.name}" required></div>`,
      warehouse: `<div class="form-group"><label>الاسم *</label><input id="ef_name" value="${d.name}" required></div>
                  <div class="form-group"><label>الموقع</label><input id="ef_location" value="${d.location||''}"></div>`,
      user:      `<div class="form-group"><label>الاسم *</label><input id="ef_name" value="${d.name}" required></div>
                  <div class="form-group"><label>البريد *</label><input type="email" id="ef_email" value="${d.email}" required></div>
                  <div class="form-group"><label>الهاتف *</label><input id="ef_phone" value="${d.phone}" required></div>`,
    };
    const urlMap = { customer: '/api/customers', supplier: '/api/suppliers', category: '/api/categories',
      warehouse: '/api/warehouses', user: '/api/users' };
    openEntityModal('تعديل', fields[type], function () {
      const keys = { customer: ['name','email','phone','address'], supplier: ['name','email','phone','address'],
        category: ['name'], warehouse: ['name','location'], user: ['name','email','phone'] };
      entityAjax('PUT', `${urlMap[type]}/${d.id}`, getEntityData(keys[type]), cbMap[type]);
    });
  });

  $(document).on('click', '.icon-btn.del', function () {
    const $b = $(this);
    confirmDelete($b.data('url'), function () { cbMap[$b.data('cb').replace('fetch','').toLowerCase()] && cbMap[$b.data('cb').replace('fetch','').toLowerCase()](); window[`fetch${$b.data('cb').replace('fetch','')}`]?.(); });
    // simpler:
    const cbName = $b.data('cb');
    if (cbName === 'fetchCustomers') confirmDelete($b.data('url'), fetchCustomers);
    else if (cbName === 'fetchSuppliers') confirmDelete($b.data('url'), fetchSuppliers);
    else if (cbName === 'fetchCategories') confirmDelete($b.data('url'), fetchCategories);
    else if (cbName === 'fetchWarehouses') confirmDelete($b.data('url'), fetchWarehouses);
    else if (cbName === 'fetchProducts') confirmDelete($b.data('url'), fetchProducts);
    else if (cbName === 'fetchUsers') confirmDelete($b.data('url'), fetchUsers);
    else if (cbName === 'fetchPurchases') confirmDelete($b.data('url'), fetchPurchases);
    else if (cbName === 'fetchSales') confirmDelete($b.data('url'), fetchSales);
  });

  function getEntityData(keys) {
    const obj = {};
    keys.forEach(k => { const v = $(`#ef_${k}`).val(); if (v !== undefined) obj[k] = v || null; });
    return obj;
  }

  // ══════════════════════════════════════
  //  INVOICE MODAL (Purchases & Sales)
  // ══════════════════════════════════════
  let _invoiceType = null;
  let _products = [], _warehouses = [];

  function openInvoiceModal(type) {
    _invoiceType = type;
    $('#invoiceModalTitle').text(type === 'purchase' ? 'فاتورة مشتريات' : 'فاتورة مبيعات');
    $('#invoiceErrorMsg').hide();
    $('#invoiceItemsRows').empty();
    $('#invoicePaid').val(0);
    $('#invoiceNotes').val('');
    $('#invoiceTotal').text('0');
    const today = new Date().toISOString().split('T')[0];
    $('#invoiceDate').val(today);

    Promise.all([
      $.get('/api/products'),
      $.get('/api/warehouses'),
      type === 'purchase' ? $.get('/api/suppliers') : $.get('/api/customers')
    ]).then(function ([pRes, wRes, partyRes]) {
      _products = pRes.data || [];
      _warehouses = wRes.data || [];
      const parties = partyRes.data || [];
      const label = type === 'purchase' ? 'المورد' : 'العميل';
      const partyOpts = parties.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
      $('#invoicePartyField').html(`<div class="form-group"><label>${label} *</label>
        <select id="invoicePartyId" class="action-select" style="width:100%;padding:12px;background:rgba(0,0,0,0.2);border:1px solid var(--border-color);border-radius:6px;color:white;" required>
          <option value="">— اختر —</option>${partyOpts}
        </select></div>`);
      addInvoiceRow();
      $('#invoiceModal').addClass('active');
      setTimeout(() => $('#invoiceModal input:visible, #invoiceModal select:visible').first().focus(), 100);
    });
  }

  function addInvoiceRow() {
    const prodOpts = _products.map(p => `<option value="${p.id}" data-price="${p.costPrice}" data-sale="${p.salePrice}">${p.name}</option>`).join('');
    const whOpts = _warehouses.map(w => `<option value="${w.id}">${w.name}</option>`).join('');
    const idx = $('#invoiceItemsRows .invoice-row').length;
    $('#invoiceItemsRows').append(`
      <div class="invoice-row" data-idx="${idx}">
        <select class="inv-product"><option value="">— صنف —</option>${prodOpts}</select>
        <input type="number" class="inv-qty" placeholder="الكمية" min="0.01" step="0.01" value="1">
        <input type="number" class="inv-price" placeholder="السعر" min="0" step="0.01" value="0">
        <button type="button" class="remove-row-btn">✕</button>
      </div>
      <div class="invoice-row" style="grid-template-columns:2fr 2fr auto;margin-top:-4px;margin-bottom:12px;">
        <select class="inv-warehouse" style="grid-column:1/3"><option value="">— مخزن (اختياري) —</option>${whOpts}</select>
        <span></span>
      </div>`);
    bindInvoiceRowEvents();
  }

  function bindInvoiceRowEvents() {
    $('#invoiceItemsRows').off('change', '.inv-product').on('change', '.inv-product', function () {
      const $row = $(this).closest('.invoice-row');
      const opt = $(this).find(':selected');
      const price = _invoiceType === 'purchase' ? opt.data('price') : opt.data('sale');
      $row.find('.inv-price').val(price || 0);
      calcInvoiceTotal();
    });
    $('#invoiceItemsRows').off('input', '.inv-qty,.inv-price').on('input', '.inv-qty,.inv-price', calcInvoiceTotal);
    $('#invoiceItemsRows').off('click', '.remove-row-btn').on('click', '.remove-row-btn', function () {
      $(this).closest('.invoice-row').next('.invoice-row').remove();
      $(this).closest('.invoice-row').remove();
      calcInvoiceTotal();
    });
  }

  function calcInvoiceTotal() {
    let total = 0;
    $('#invoiceItemsRows .invoice-row').each(function () {
      const qty = parseFloat($(this).find('.inv-qty').val()) || 0;
      const price = parseFloat($(this).find('.inv-price').val()) || 0;
      total += qty * price;
    });
    $('#invoiceTotal').text(fmtMoney(total));
  }

  $('#addInvoiceItem').on('click', addInvoiceRow);
  $('#closeInvoiceModal, #invoiceModal').on('click', function (e) {
    if (e.target === this) $('#invoiceModal').removeClass('active');
  });

  $('#invoiceForm').on('submit', function (e) {
    e.preventDefault();
    const partyId = $('#invoicePartyId').val();
    if (!partyId) { $('#invoiceErrorMsg').text('اختر ' + (_invoiceType === 'purchase' ? 'المورد' : 'العميل')).show(); return; }

    const items = [];
    const rows = $('#invoiceItemsRows .invoice-row');
    for (let i = 0; i < rows.length; i += 2) {
      const $r = $(rows[i]);
      const productId = $r.find('.inv-product').val();
      const qty = parseFloat($r.find('.inv-qty').val());
      const price = parseFloat($r.find('.inv-price').val());
      const warehouseId = $(rows[i+1]).find('.inv-warehouse').val() || null;
      if (!productId || !qty) continue;
      if (_invoiceType === 'purchase') items.push({ productId, qty, unitCost: price, warehouseId });
      else items.push({ productId, qty, unitPrice: price, warehouseId });
    }
    if (!items.length) { $('#invoiceErrorMsg').text('أضف صنفاً واحداً على الأقل').show(); return; }

    const payload = {
      [`${_invoiceType === 'purchase' ? 'supplierId' : 'customerId'}`]: partyId,
      date: $('#invoiceDate').val(), paid: $('#invoicePaid').val(),
      notes: $('#invoiceNotes').val(), items
    };

    const url = _invoiceType === 'purchase' ? '/api/purchases' : '/api/sales';
    $.ajax({
      url, method: 'POST', contentType: 'application/json', data: JSON.stringify(payload),
      success: function () {
        $('#invoiceModal').removeClass('active');
        _invoiceType === 'purchase' ? fetchPurchases() : fetchSales();
      },
      error: function (xhr) { $('#invoiceErrorMsg').text(xhr.responseJSON?.message || 'خطأ').show(); }
    });
  });

  $('#addPurchaseBtn').on('click', function () { window.location.href = '/purchase.html'; });
  $('#addSaleBtn').on('click', function () { openInvoiceModal('sale'); });

  // ══════════════════════════════════════
  //  PURCHASES & SALES TABLES
  // ══════════════════════════════════════
  function fetchPurchases() {
    $.get('/api/purchases', function (res) {
      const $b = $('#purchasesTable tbody').empty();
      if (!res.data?.length) { $b.append(emptyRow(6, 'لا توجد مشتريات')); return; }
      res.data.forEach(function (p) {
        $b.append(`<tr>
          <td>${p.supplier?.name||'—'}</td><td>${fmtDate(p.date)}</td>
          <td>${fmtMoney(p.total)}</td><td>${fmtMoney(p.paid)}</td>
          <td>${badge(p.status)}</td>
          <td><button class="icon-btn del" data-url="/api/purchases/${p.id}" data-cb="fetchPurchases">حذف</button></td>
        </tr>`);
      });
    });
  }

  function fetchSales() {
    $.get('/api/sales', function (res) {
      const $b = $('#salesTable tbody').empty();
      if (!res.data?.length) { $b.append(emptyRow(6, 'لا توجد مبيعات')); return; }
      res.data.forEach(function (s) {
        $b.append(`<tr>
          <td>${s.customer?.name||'—'}</td><td>${fmtDate(s.date)}</td>
          <td>${fmtMoney(s.total)}</td><td>${fmtMoney(s.paid)}</td>
          <td>${badge(s.status)}</td>
          <td><button class="icon-btn del" data-url="/api/sales/${s.id}" data-cb="fetchSales">حذف</button></td>
        </tr>`);
      });
    });
  }

  // ══════════════════════════════════════
  //  RENTALS (Suits)
  // ══════════════════════════════════════
  function fetchSuits() {
    $.get('/api/suits', function (res) {
      const $grid = $('#suitsGrid').empty();
      if (!res.data?.length) { $grid.html('<p style="color:var(--text-secondary)">لا توجد بدل.</p>'); return; }
      res.data.forEach(function (item) {
        const avail = item.status === 'AVAILABLE';
        $grid.append(`<div class="suit-card">
          <h3>${item.suitModel.name}</h3>
          <p>${item.suitModel.description||''}</p>
          <p><strong>المقاس:</strong> ${item.size} &nbsp;|&nbsp; <strong>SKU:</strong> ${item.sku}</p>
          <div class="price-tag">$${item.suitModel.basePrice} / يوم</div>
          <button class="btn book-btn" data-id="${item.id}" ${avail?'':'disabled'}>
            ${avail ? 'احجز الآن' : 'غير متاح (' + item.status + ')'}
          </button></div>`);
      });
    });
  }

  $('#suitsGrid').on('click', '.book-btn', function () {
    $('#suitItemId').val($(this).data('id'));
    $.get('/api/users', function (res) {
      const $sel = $('#bookingUserId').empty().append('<option value="">— اختر —</option>');
      (res.data||[]).forEach(u => $sel.append(`<option value="${u.id}">${u.name}</option>`));
    });
    $('#bookingErrorMsg').hide();
    $('#bookingModal').addClass('active');
    setTimeout(() => $('#bookingModal input:visible, #bookingModal select:visible').first().focus(), 100);
  });

  $('#closeBookingModal, #bookingModal').on('click', function (e) {
    if (e.target === this) { $('#bookingModal').removeClass('active'); $('#bookingForm')[0].reset(); }
  });

  $('#bookingForm').on('submit', function (e) {
    e.preventDefault();
    const $btn = $('#submitBookingBtn').prop('disabled', true).text('جاري الحجز...');
    $.ajax({
      url: '/api/rentals', method: 'POST', contentType: 'application/json',
      data: JSON.stringify({
        userId: $('#bookingUserId').val(), suitItemId: $('#suitItemId').val(),
        startDate: new Date($('#startDate').val()).toISOString(),
        endDate: new Date($('#endDate').val()).toISOString(),
        depositAmount: parseFloat($('#depositAmount').val())
      }),
      success: function () { $('#bookingModal').removeClass('active'); $('#bookingForm')[0].reset(); fetchSuits(); fetchRentals(); },
      error: function (xhr) { $('#bookingErrorMsg').text(xhr.responseJSON?.message || 'خطأ').show(); },
      complete: function () { $btn.prop('disabled', false).text('تأكيد الحجز'); }
    });
  });

  function fetchRentals() {
    $.get('/api/rentals', function (res) {
      const $b = $('#rentalsTable tbody').empty();
      if (!res.data?.length) { $b.append(emptyRow(6, 'لا توجد حجوزات')); return; }
      const statuses = ['BOOKED','PICKED_UP','RETURNED','CLEANING','COMPLETED','CANCELLED'];
      res.data.forEach(function (r) {
        const opts = statuses.map(s => `<option value="${s}" ${r.orderStatus===s?'selected':''}>${s.replace('_',' ')}</option>`).join('');
        $b.append(`<tr>
          <td>${r.user?.name||'—'}</td>
          <td>${r.suitItem?.suitModel?.name||'—'} (${r.suitItem?.size||''})</td>
          <td>${fmtDate(r.startDate)} → ${fmtDate(r.endDate)}</td>
          <td>$${fmtMoney(r.totalPrice)}</td>
          <td><span class="status-badge status-${r.orderStatus}">${r.orderStatus.replace('_',' ')}</span></td>
          <td><select class="action-select rental-status-change" data-id="${r.id}">${opts}</select></td>
        </tr>`);
      });
    });
  }

  $('#rentalsTable').on('change', '.rental-status-change', function () {
    const $sel = $(this).prop('disabled', true);
    $.ajax({
      url: `/api/rentals/${$sel.data('id')}/status`, method: 'PUT',
      contentType: 'application/json', data: JSON.stringify({ status: $sel.val() }),
      success: function () { fetchSuits(); fetchRentals(); },
      error: function (xhr) { alert(xhr.responseJSON?.message || 'خطأ'); fetchRentals(); },
      complete: function () { $sel.prop('disabled', false); }
    });
  });

  // ══════════════════════════════════════
  //  VOUCHERS
  // ══════════════════════════════════════
  function openVoucherModal(type) {
    const isReceipt = type === 'receipt';
    $('#voucherModalTitle').text(isReceipt ? 'سند قبض' : 'سند دفع');
    $('#voucherErrorMsg').hide();
    $('#voucherForm')[0].reset();
    $('#voucherDate').val(new Date().toISOString().split('T')[0]);
    const url = isReceipt ? '/api/customers' : '/api/suppliers';
    const label = isReceipt ? 'العميل' : 'المورد';
    $.get(url, function (res) {
      const opts = (res.data||[]).map(p => `<option value="${p.id}">${p.name}</option>`).join('');
      $('#voucherPartyField').html(`<div class="form-group"><label>${label} *</label>
        <select id="voucherPartyId" class="action-select" style="width:100%;padding:12px;background:rgba(0,0,0,0.2);border:1px solid var(--border-color);border-radius:6px;color:white;" required>
          <option value="">— اختر —</option>${opts}
        </select></div>`);
      $('#voucherModal').data('type', type).addClass('active');
      setTimeout(() => $('#voucherModal input:visible, #voucherModal select:visible').first().focus(), 100);
    });
  }

  $('#addReceiptBtn').on('click', function () { openVoucherModal('receipt'); });
  $('#addPaymentBtn').on('click', function () { openVoucherModal('payment'); });
  $('#closeVoucherModal, #voucherModal').on('click', function (e) {
    if (e.target === this) $('#voucherModal').removeClass('active');
  });

  $('#voucherForm').on('submit', function (e) {
    e.preventDefault();
    const type = $('#voucherModal').data('type');
    const isReceipt = type === 'receipt';
    const partyId = $('#voucherPartyId').val();
    if (!partyId) { $('#voucherErrorMsg').text('اختر ' + (isReceipt ? 'العميل' : 'المورد')).show(); return; }
    const payload = {
      [`${isReceipt ? 'customerId' : 'supplierId'}`]: partyId,
      amount: $('#voucherAmount').val(), date: $('#voucherDate').val(), notes: $('#voucherNotes').val()
    };
    $.ajax({
      url: isReceipt ? '/api/vouchers/receipts' : '/api/vouchers/payments',
      method: 'POST', contentType: 'application/json', data: JSON.stringify(payload),
      success: function () { $('#voucherModal').removeClass('active'); isReceipt ? fetchReceipts() : fetchPayments(); },
      error: function (xhr) { $('#voucherErrorMsg').text(xhr.responseJSON?.message || 'خطأ').show(); }
    });
  });

  function fetchReceipts() {
    $.get('/api/vouchers/receipts', function (res) {
      const $b = $('#receiptsTable tbody').empty();
      if (!res.data?.length) { $b.append(emptyRow(4, 'لا توجد سندات قبض')); return; }
      res.data.forEach(function (v) {
        $b.append(`<tr><td>${v.customer?.name||'—'}</td><td>${fmtMoney(v.amount)}</td><td>${fmtDate(v.date)}</td><td>${v.notes||'—'}</td></tr>`);
      });
    });
  }

  function fetchPayments() {
    $.get('/api/vouchers/payments', function (res) {
      const $b = $('#paymentsTable tbody').empty();
      if (!res.data?.length) { $b.append(emptyRow(4, 'لا توجد سندات دفع')); return; }
      res.data.forEach(function (v) {
        $b.append(`<tr><td>${v.supplier?.name||'—'}</td><td>${fmtMoney(v.amount)}</td><td>${fmtDate(v.date)}</td><td>${v.notes||'—'}</td></tr>`);
      });
    });
  }

  // ══════════════════════════════════════
  //  REPORTS
  // ══════════════════════════════════════
  function fetchReports() {
    $.get('/api/reports/summary', function (res) {
      const d = res.data;
      $('#summaryCards').html(`
        <div class="stat-card"><div class="stat-label">العملاء</div><div class="stat-value">${d.customers}</div></div>
        <div class="stat-card"><div class="stat-label">الموردين</div><div class="stat-value">${d.suppliers}</div></div>
        <div class="stat-card"><div class="stat-label">الأصناف</div><div class="stat-value">${d.products}</div></div>
        <div class="stat-card"><div class="stat-label">إجمالي المشتريات</div><div class="stat-value">${fmtMoney(d.totalPurchases)}</div></div>
        <div class="stat-card"><div class="stat-label">إجمالي المبيعات</div><div class="stat-value">${fmtMoney(d.totalSales)}</div></div>
        <div class="stat-card"><div class="stat-label">إجمالي الإيجار</div><div class="stat-value">${fmtMoney(d.totalRentals)}</div></div>
        <div class="stat-card"><div class="stat-label">إجمالي القبض</div><div class="stat-value">${fmtMoney(d.totalReceipts)}</div></div>
        <div class="stat-card"><div class="stat-label">إجمالي الدفع</div><div class="stat-value">${fmtMoney(d.totalPayments)}</div></div>
      `);
    });
    $.get('/api/reports/stock', function (res) {
      const $b = $('#stockTable tbody').empty();
      if (!res.data?.length) { $b.append(emptyRow(4, 'لا توجد بيانات مخزون')); return; }
      res.data.forEach(function (s) {
        $b.append(`<tr><td>${s.product?.name||'—'}</td><td>${s.product?.category?.name||'—'}</td><td>${s.warehouse?.name||'—'}</td><td>${s.quantity}</td></tr>`);
      });
    });
  }

  // ══════════════════════════════════════
  //  EMPLOYEES
  // ══════════════════════════════════════
  function fetchEmployees() {
    $.get('/api/employees', function (res) {
      const $b = $('#employeesTable tbody').empty();
      if (!res.data?.length) { $b.append(emptyRow(7, 'لا يوجد موظفين')); return; }
      res.data.forEach(function (e) {
        const statusBadge = e.status === 'ACTIVE'
          ? '<span class="badge-PAID">نشط</span>'
          : '<span class="badge-PENDING">غير نشط</span>';
        $b.append(`<tr>
          <td>${e.name}</td>
          <td>${e.jobTitle || '—'}</td>
          <td>${e.phone || '—'}</td>
          <td>${fmtMoney(e.salary)}</td>
          <td>${fmtDate(e.hireDate)}</td>
          <td>${statusBadge}</td>
          <td>
            <button class="icon-btn edit emp-edit"
              data-id="${e.id}" data-name="${e.name}" data-phone="${e.phone||''}"
              data-email="${e.email||''}" data-jobtitle="${e.jobTitle||''}"
              data-salary="${e.salary}" data-hiredate="${e.hireDate?.split('T')[0]||''}"
              data-status="${e.status}">تعديل</button>
            <button class="icon-btn del emp-del" data-id="${e.id}">حذف</button>
          </td>
        </tr>`);
      });
    });
  }

  function employeeFormHtml(d) {
    d = d || {};
    return `
      <div class="form-group"><label>الاسم *</label><input id="ef_name" value="${d.name||''}" required></div>
      <div class="form-group"><label>المسمى الوظيفي</label><input id="ef_jobTitle" value="${d.jobtitle||''}"></div>
      <div class="form-group"><label>الهاتف</label><input id="ef_phone" value="${d.phone||''}"></div>
      <div class="form-group"><label>البريد الإلكتروني</label><input type="email" id="ef_email" value="${d.email||''}"></div>
      <div class="form-group"><label>الراتب</label><input type="number" id="ef_salary" value="${d.salary||0}" min="0"></div>
      <div class="form-group"><label>تاريخ التعيين</label><input type="date" id="ef_hireDate" value="${d.hiredate||new Date().toISOString().split('T')[0]}"></div>
      <div class="form-group"><label>الحالة</label>
        <select id="ef_status" class="action-select" style="width:100%;padding:10px;background:rgba(0,0,0,0.2);border:1px solid var(--border-color);border-radius:6px;color:white;">
          <option value="ACTIVE" ${d.status==='ACTIVE'?'selected':''}>نشط</option>
          <option value="INACTIVE" ${d.status==='INACTIVE'?'selected':''}>غير نشط</option>
        </select>
      </div>`;
  }

  $('#addEmployeeBtn').on('click', function () {
    openEntityModal('إضافة موظف', employeeFormHtml(), function () {
      entityAjax('POST', '/api/employees', {
        name: $('#ef_name').val(), jobTitle: $('#ef_jobTitle').val(),
        phone: $('#ef_phone').val(), email: $('#ef_email').val() || null,
        salary: $('#ef_salary').val(), hireDate: $('#ef_hireDate').val(),
        status: $('#ef_status').val()
      }, fetchEmployees);
    });
  });

  $(document).on('click', '.emp-edit', function () {
    const d = $(this).data();
    openEntityModal('تعديل موظف', employeeFormHtml(d), function () {
      entityAjax('PUT', `/api/employees/${d.id}`, {
        name: $('#ef_name').val(), jobTitle: $('#ef_jobTitle').val(),
        phone: $('#ef_phone').val(), email: $('#ef_email').val() || null,
        salary: $('#ef_salary').val(), hireDate: $('#ef_hireDate').val(),
        status: $('#ef_status').val()
      }, fetchEmployees);
    });
  });

  $(document).on('click', '.emp-del', function () {
    confirmDelete(`/api/employees/${$(this).data('id')}`, fetchEmployees);
  });

  // ── Init ─────────────────────────────────────────────────
  fetchCustomers();

});
