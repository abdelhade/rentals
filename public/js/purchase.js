$(document).ready(function () {

  if (sessionStorage.getItem('luxe_auth') !== 'true') { window.location.href = '/login.html'; return; }

  let _products = [];
  let _rowCount = 0;

  // ── Load dropdowns ───────────────────────────────────────
  $.get('/api/suppliers', function (res) {
    (res.data || []).forEach(s => $('#supplierId').append(`<option value="${s.id}">${s.name}</option>`));
  });

  $.get('/api/warehouses', function (res) {
    (res.data || []).forEach(w => $('#warehouseId').append(`<option value="${w.id}">${w.name}</option>`));
  });

  $.get('/api/products', function (res) {
    _products = res.data || [];
    addRow(); // first empty row
    $('#supplierId').focus();
  });

  // ── Default date & invoice number ───────────────────────
  $('#invoiceDate').val(new Date().toISOString().split('T')[0]);
  $('#invoiceNo').val('PUR-' + Date.now().toString().slice(-6));

  // ── Add row ──────────────────────────────────────────────
  function addRow() {
    _rowCount++;
    const prodOpts = _products.map(p =>
      `<option value="${p.id}" data-cost="${p.costPrice}">${p.name}</option>`
    ).join('');

    const $tr = $(`
      <tr data-row="${_rowCount}">
        <td>${_rowCount}</td>
        <td>
          <select class="td-select r-product">
            <option value="">— اختر صنف —</option>${prodOpts}
          </select>
        </td>
        <td><input type="number" class="td-input r-qty" value="1" min="0.001" step="0.001"></td>
        <td><input type="number" class="td-input r-price" value="0" min="0" step="0.01"></td>
        <td><input type="number" class="td-input r-total" value="0" readonly></td>
        <td><button type="button" class="del-row-btn" title="حذف">✕</button></td>
      </tr>`);

    $('#itemsBody').append($tr);
    $tr.find('.r-product').focus();
  }

  $('#addRowBtn').on('click', addRow);

  // ── Row events ───────────────────────────────────────────
  $('#itemsBody').on('change', '.r-product', function () {
    const $row = $(this).closest('tr');
    const opt  = $(this).find(':selected');
    const cost = parseFloat(opt.data('cost')) || 0;
    $row.find('.r-price').val(cost.toFixed(2));
    calcRow($row);
    calcFooter();
    // move focus to qty
    $row.find('.r-qty').select();
  });

  $('#itemsBody').on('input', '.r-qty, .r-price', function () {
    const $row = $(this).closest('tr');
    calcRow($row);
    calcFooter();
  });

  // auto-add row when tabbing out of last row's price
  $('#itemsBody').on('keydown', '.r-price', function (e) {
    if (e.key === 'Tab' && !e.shiftKey) {
      const $rows = $('#itemsBody tr');
      if ($(this).closest('tr').is($rows.last())) {
        e.preventDefault();
        addRow();
      }
    }
  });

  $('#itemsBody').on('click', '.del-row-btn', function () {
    if ($('#itemsBody tr').length === 1) return; // keep at least 1
    $(this).closest('tr').remove();
    renumberRows();
    calcFooter();
  });

  function calcRow($row) {
    const qty   = parseFloat($row.find('.r-qty').val())   || 0;
    const price = parseFloat($row.find('.r-price').val()) || 0;
    $row.find('.r-total').val((qty * price).toFixed(2));
  }

  function renumberRows() {
    $('#itemsBody tr').each(function (i) {
      $(this).find('td:first').text(i + 1);
      $(this).attr('data-row', i + 1);
    });
    _rowCount = $('#itemsBody tr').length;
  }

  // ── Footer calculations ──────────────────────────────────
  function calcFooter() {
    let subtotal = 0;
    $('#itemsBody .r-total').each(function () { subtotal += parseFloat($(this).val()) || 0; });

    const discPct = parseFloat($('#discountPct').val()) || 0;
    const discAmt = parseFloat($('#discountAmt').val()) || 0;
    const paid    = parseFloat($('#paid').val())        || 0;

    const total     = Math.max(0, subtotal - discAmt);
    const remaining = Math.max(0, total - paid);

    $('#fTotal').val(total.toFixed(2));
    $('#fRemaining').val(remaining.toFixed(2));

    // red if remaining > 0
    $('#fRemaining').toggleClass('highlight-red', remaining > 0);
  }

  // discount % → amount
  $('#discountPct').on('input', function () {
    let subtotal = 0;
    $('#itemsBody .r-total').each(function () { subtotal += parseFloat($(this).val()) || 0; });
    const pct = parseFloat($(this).val()) || 0;
    $('#discountAmt').val(((pct / 100) * subtotal).toFixed(2));
    calcFooter();
  });

  // discount amount → %
  $('#discountAmt').on('input', function () {
    let subtotal = 0;
    $('#itemsBody .r-total').each(function () { subtotal += parseFloat($(this).val()) || 0; });
    const amt = parseFloat($(this).val()) || 0;
    $('#discountPct').val(subtotal > 0 ? ((amt / subtotal) * 100).toFixed(2) : 0);
    calcFooter();
  });

  $('#paid').on('input', calcFooter);

  // ── Toast ────────────────────────────────────────────────
  function toast(msg) {
    $('#toast').text(msg).fadeIn(200);
    setTimeout(() => $('#toast').fadeOut(400), 3000);
  }

  // ── Save ─────────────────────────────────────────────────
  $('#saveBtn').on('click', function () {
    const supplierId = $('#supplierId').val();
    if (!supplierId) { toast('اختر المورد أولاً'); $('#supplierId').focus(); return; }

    const items = [];
    let valid = true;
    const warehouseId = $('#warehouseId').val() || null;

    $('#itemsBody tr').each(function () {
      const productId = $(this).find('.r-product').val();
      const qty       = parseFloat($(this).find('.r-qty').val());
      const unitCost  = parseFloat($(this).find('.r-price').val());
      if (!productId) return; // skip empty rows
      if (!qty || qty <= 0) { toast('تحقق من الكميات'); valid = false; return false; }
      items.push({ productId, qty, unitCost, warehouseId });
    });

    if (!valid) return;
    if (!items.length) { toast('أضف صنفاً واحداً على الأقل'); return; }

    const payload = {
      supplierId,
      date:  $('#invoiceDate').val(),
      paid:  parseFloat($('#paid').val()) || 0,
      notes: $('#notes').val(),
      items
    };

    const $btn = $(this).prop('disabled', true).text('جاري الحفظ...');

    $.ajax({
      url: '/api/purchases', method: 'POST',
      contentType: 'application/json', data: JSON.stringify(payload),
      success: function () {
        sessionStorage.setItem('inv_saved', '1');
        window.location.href = '/index.html';
      },
      error: function (xhr) {
        toast(xhr.responseJSON?.message || 'حدث خطأ');
        $btn.prop('disabled', false).text('💾 حفظ الفاتورة');
      }
    });
  });

  // ── Back ─────────────────────────────────────────────────
  $('#backBtn').on('click', function () { window.location.href = '/index.html'; });

});
