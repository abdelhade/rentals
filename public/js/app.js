$(document).ready(function() {
  
  // Scoped initialization
  const SuitRentalApp = {
    init: function() {
      this.cacheDOM();
      this.bindEvents();
      this.fetchSuits();
      this.fetchRentals();
    },
    
    cacheDOM: function() {
      this.$suitsGrid = $('#suitsGrid');
      this.$rentalsTableBody = $('#rentalsTable tbody');
      this.$bookingModal = $('#bookingModal');
      this.$closeModalBtn = $('#closeModal');
      this.$bookingForm = $('#bookingForm');
      this.$suitItemIdInput = $('#suitItemId');
      this.$submitBtn = $('#submitBookingBtn');
    },

    bindEvents: function() {
      // Tab navigation
      $('.tabs').on('click', '.tab', function() {
        const $this = $(this);
        // Switch active class
        $this.addClass('active').siblings().removeClass('active');
        // Show target section, hide others
        const target = $this.data('target');
        $('.dashboard-section').hide();
        $(target).show();
      });
      
      // Close modal
      this.$closeModalBtn.on('click', this.closeModal.bind(this));
      this.$bookingModal.on('click', (e) => {
        if(e.target === this.$bookingModal[0]) this.closeModal();
      });

      // Handle booking form submission
      this.$bookingForm.on('submit', this.handleBookingSubmit.bind(this));
      
      // Handle status changes in table
      this.$rentalsTableBody.on('change', '.action-select', this.handleStatusChange.bind(this));
    },

    fetchSuits: function() {
      $.ajax({
        url: '/api/suits',
        method: 'GET',
        success: (response) => {
          if(response.success) {
            this.renderSuits(response.data);
          }
        },
        error: (err) => {
          console.error("Failed to load suits", err);
          this.$suitsGrid.html('<p>Failed to load inventory.</p>');
        }
      });
    },

    renderSuits: function(suits) {
      this.$suitsGrid.empty();
      if(suits.length === 0) {
        this.$suitsGrid.append('<p>No suits available.</p>');
        return;
      }

      suits.forEach(item => {
        const isAvailable = item.status === 'AVAILABLE';
        const cardHtml = `
          <div class="suit-card">
            <h3>${item.suitModel.name}</h3>
            <p>${item.suitModel.description}</p>
            <p><strong>Size:</strong> ${item.size} | <strong>SKU:</strong> ${item.sku}</p>
            <div class="price-tag">$${item.suitModel.basePrice} / Day</div>
            <button class="btn book-btn" data-id="${item.id}" ${!isAvailable ? 'disabled' : ''}>
              ${isAvailable ? 'Book Now' : 'Not Available (' + item.status + ')'}
            </button>
          </div>
        `;
        this.$suitsGrid.append(cardHtml);
      });
    },

    fetchRentals: function() {
      $.ajax({
        url: '/api/rentals',
        method: 'GET',
        success: (response) => {
          if(response.success) {
            this.renderRentals(response.data);
          }
        },
        error: (err) => {
          console.error("Failed to load rentals", err);
        }
      });
    },

    renderRentals: function(rentals) {
      this.$rentalsTableBody.empty();
      if(rentals.length === 0) {
        this.$rentalsTableBody.append('<tr><td colspan="6">No active rentals found.</td></tr>');
        return;
      }

      rentals.forEach(rental => {
        const start = new Date(rental.startDate).toLocaleDateString();
        const end = new Date(rental.endDate).toLocaleDateString();
        
        // Allowed Transitions
        const statusOptions = ['BOOKED', 'PICKED_UP', 'RETURNED', 'CLEANING', 'COMPLETED', 'CANCELLED'];
        
        const selectHtml = `
          <select class="action-select" data-id="${rental.id}">
            ${statusOptions.map(opt => `<option value="${opt}" ${rental.orderStatus === opt ? 'selected' : ''}>${opt.replace('_', ' ')}</option>`).join('')}
          </select>
        `;

        const rowHtml = `
          <tr>
            <td>${rental.user.name}</td>
            <td>${rental.suitItem.suitModel.name} (${rental.suitItem.size})</td>
            <td>${start} - ${end}</td>
            <td>$${rental.totalPrice}</td>
            <td><span class="status-badge status-${rental.orderStatus}">${rental.orderStatus.replace('_', ' ')}</span></td>
            <td>${selectHtml}</td>
          </tr>
        `;
        this.$rentalsTableBody.append(rowHtml);
      });
    },

    handleStatusChange: function(e) {
      const select = $(e.currentTarget);
      const rentalId = select.data('id');
      const newStatus = select.val();
      
      select.prop('disabled', true);

      $.ajax({
        url: \`/api/rentals/\${rentalId}/status\`,
        method: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify({ status: newStatus }),
        success: (response) => {
          if(response.success) {
            // Re-fetch everything to sync state changes!
            this.fetchSuits();
            this.fetchRentals();
          }
        },
        error: (xhr) => {
          alert('Failed to update status: ' + (xhr.responseJSON?.message || 'Unknown error'));
          this.fetchRentals(); // Revert UI
        },
        complete: () => {
          select.prop('disabled', false);
        }
      });
    },

    openModal: function(e) {
      const suitItemId = $(e.currentTarget).data('id');
      this.$suitItemIdInput.val(suitItemId);
      this.$bookingModal.addClass('active');
    },

    closeModal: function() {
      this.$bookingModal.removeClass('active');
      this.$bookingForm[0].reset();
    },

    handleBookingSubmit: function(e) {
      e.preventDefault();
      
      const payload = {
        userId: $('#userId').val(),
        suitItemId: this.$suitItemIdInput.val(),
        startDate: new Date($('#startDate').val()).toISOString(),
        endDate: new Date($('#endDate').val()).toISOString(),
        depositAmount: parseFloat($('#depositAmount').val())
      };

      this.$submitBtn.prop('disabled', true).text('Processing...');

      $.ajax({
        url: '/api/rentals',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(payload),
        success: (response) => {
          if(response.success) {
            this.closeModal();
            this.fetchSuits();
            this.fetchRentals();
          }
        },
        error: (xhr) => {
          const msg = xhr.responseJSON?.message || 'Validation Failed';
          alert('Error: ' + msg);
        },
        complete: () => {
          this.$submitBtn.prop('disabled', false).text('Confirm Reservation');
        }
      });
    }
  };

  // Run app
  SuitRentalApp.init();

});
