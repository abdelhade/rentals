$(document).ready(function () {

  if (sessionStorage.getItem('luxe_auth') !== 'true') { window.location.href = '/login.html'; return; }

  let _products = [];
  let _rowCount  = 0;

  // ── Load dropdowns ───────────────────────────────────────
  $.get('/api/customers',  function (r) { (r.data||[]).forEach(c => $('#customerId').append(`<option value="${c.id}">${c.name}</option>`)); });
  $.get('/api/employees',  function (r) { (r.data||[]).forEach(e => $('#employeeId').append(`<option value="${e.id}">${e.name}</option>`)); });
  $.get('/api/products',   function (r) {
    _products = r.data || [];
    addRow();
    $('#customerId').focus();
  });

  // ── Defaults ─────────────────────────────────────────────
  const today = new Date().toISOString().split('T')[0];
  $('#startDate').val(today);
  $('#endDate').val(today);
  $('#rentalNo').val('RNT-' + Date.now().toString().slice(-6));

  // ── Days calculation ─────────────────────────────────────
  function calcDays() {
    const s = new Date($('#startDate').val());
    const e = new Date($('#endDate').val());
    if (!$('#startDate').val() || !$('#endDate').val() || e <= s) return 0;
    return Math.ceil((e - s) / (1000 * 3600 * 24));
  }

  function refreshDays() {
    const d = calcDays();
    $('#daysCount').text(d);
    // update all rows
    $('#itemsBody tr').each(function () { calcRow($(this)); });
    calcFooter();
  }

  $('#startDate, #endDate').on('change', refreshDays);

  // ── Add row ──────────────────────────────────────────────
  function addRow() {
    _rowCount++;
    const prodOpts = _products.map(p =>
      `<option value="${p.id}" data-rate="${p.salePrice}">${p.name} (${p.sku})</option>`
    ).join('');

    const $tr = $(`
      <tr data-row="${_rowCount}">
        <td>${_rowCount}</td>
        <td>
          <select class="td-select r-product">
            <option value="">— اختر صنف —</option>${prodOpts}
          </select>
        </td>
        <td><input type="number" class="td-input r-qty" value="1" min="1" step="1"></td>
        <td><input type="number" class="td-input r-rate" value="0" min="0" step="0.01"></td>
        <td><input type="text"   class="td-input r-days" readonly value="${calcDays()}"></td>
        <td><input type="number" class="td-input r-total" readonly value="0"></td>
        <td><button type="button" class="del-row-btn" title="حذف">✕</button></td>
      </tr>`);

    $('#itemsBody').append($tr);
    $tr.find('.r-product').focus();
  }

  $('#addRowBtn').on('click', addRow);

  // ── Row events ───────────────────────────────────────────
  $('#itemsBody').on('change', '.r-product', function () {
    const $row = $(this).closest('tr');
    const rate = parseFloat($(this).find(':selected').data('rate')) || 0;
    $row.find('.r-rate').val(rate.toFixed(2));
    calcRow($row);
    calcFooter();
    $row.find('.r-qty').select();
  });

  $('#itemsBody').on('input', '.r-qty, .r-rate', function () {
    calcRow($(this).closest('tr'));
    calcFooter();
  });

  // Tab from last row → new row
  $('#itemsBody').on('keydown', '.r-rate', function (e) {
    if (e.key === 'Tab' && !e.shiftKey) {
      if ($(this).closest('tr').is($('#itemsBody tr').last())) {
        e.preventDefault();
        addRow();
      }
    }
  });

  $('#itemsBody').on('click', '.del-row-btn', function () {
    if ($('#itemsBody tr').length === 1) return;
    $(this).closest('tr').remove();
    renumber();
    calcFooter();
  });

  function calcRow($row) {
    const qty   = parseFloat($row.find('.r-qty').val())  || 0;
    const rate  = parseFloat($row.find('.r-rate').val()) || 0;
    const days  = calcDays();
    $row.find('.r-days').val(days);
    $row.find('.r-total').val((qty * rate * Math.max(days, 1)).toFixed(2));
  }

  function renumber() {
    $('#itemsBody tr').each(function (i) {
      $(this).find('td:first').text(i + 1);
      $(this).attr('data-row', i + 1);
    });
    _rowCount = $('#itemsBody tr').length;
  }

  // ── Footer ───────────────────────────────────────────────
  function calcFooter() {
    let subtotal = 0;
    $('#itemsBody .r-total').each(function () { subtotal += parseFloat($(this).val()) || 0; });

    const discAmt   = parseFloat($('#discountAmt').val()) || 0;
    const paid      = parseFloat($('#paid').val())        || 0;
    const total     = Math.max(0, subtotal - discAmt);
    const remaining = Math.max(0, total - paid);

    $('#fTotal').val(total.toFixed(2));
    $('#fRemaining').val(remaining.toFixed(2));
    $('#fRemaining').css('color', remaining > 0 ? '#f94144' : 'var(--accent-color)');
  }

  $('#discountPct').on('input', function () {
    let sub = 0;
    $('#itemsBody .r-total').each(function () { sub += parseFloat($(this).val()) || 0; });
    $('#discountAmt').val(((parseFloat($(this).val())||0) / 100 * sub).toFixed(2));
    calcFooter();
  });

  $('#discountAmt').on('input', function () {
    let sub = 0;
    $('#itemsBody .r-total').each(function () { sub += parseFloat($(this).val()) || 0; });
    $('#discountPct').val(sub > 0 ? ((parseFloat($(this).val())||0) / sub * 100).toFixed(2) : 0);
    calcFooter();
  });

  $('#paid').on('input', calcFooter);

  // ── Toast ────────────────────────────────────────────────
  function toast(msg) { $('#toast').text(msg).fadeIn(200); setTimeout(() => $('#toast').fadeOut(400), 3000); }

  // ── Save ─────────────────────────────────────────────────
  $('#saveBtn').on('click', function () {
    const customerId = $('#customerId').val();
    const startDate  = $('#startDate').val();
    const endDate    = $('#endDate').val();

    if (!customerId)  { toast('اختر العميل أولاً');          $('#customerId').focus(); return; }
    if (!startDate)   { toast('حدد تاريخ البداية');          $('#startDate').focus();  return; }
    if (!endDate)     { toast('حدد تاريخ النهاية');          $('#endDate').focus();    return; }
    if (calcDays() <= 0) { toast('تاريخ النهاية يجب أن يكون بعد البداية'); return; }

    const items = [];
    let valid = true;

    $('#itemsBody tr').each(function () {
      const productId = $(this).find('.r-product').val();
      const qty       = parseFloat($(this).find('.r-qty').val());
      const dailyRate = parseFloat($(this).find('.r-rate').val());
      if (!productId) return;
      if (!qty || qty <= 0) { toast('تحقق من الكميات'); valid = false; return false; }
      items.push({ productId, qty, dailyRate });
    });

    if (!valid) return;
    if (!items.length) { toast('أضف صنفاً واحداً على الأقل'); return; }

    const payload = {
      customerId,
      employeeId: $('#employeeId').val() || null,
      startDate, endDate,
      notes: $('#notes').val(),
      items
    };

    const $btn = $(this).prop('disabled', true).text('جاري الحفظ...');

    $.ajax({
      url: '/api/item-rentals', method: 'POST',
      contentType: 'application/json', data: JSON.stringify(payload),
      success: function () { window.location.href = '/index.html'; },
      error: function (xhr) {
        toast(xhr.responseJSON?.message || 'حدث خطأ');
        $btn.prop('disabled', false).text('💾 حفظ العملية');
      }
    });
  });

  $('#backBtn').on('click', function () { window.location.href = '/index.html'; });

});
