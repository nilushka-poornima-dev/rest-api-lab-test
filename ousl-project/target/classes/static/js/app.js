/**
 * Book Store Management System - Simple CRUD
 */

const API_BASE = '/api/books';

const app = {
  books: [],
  bookModal: null,

  init() {
    this.bookModal = new bootstrap.Modal(document.getElementById('bookModal'));
    this.loadBooks();
    this.checkHealth();
  },

  // Toast notifications
  showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toastEl = document.createElement('div');
    const bg = type === 'success' ? 'bg-success' : (type === 'danger' ? 'bg-danger' : 'bg-primary');
    toastEl.className = `toast align-items-center text-white ${bg} border-0 shadow`;
    toastEl.setAttribute('role', 'alert');
    toastEl.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    `;
    container.appendChild(toastEl);
    const toast = new bootstrap.Toast(toastEl, { delay: 3500 });
    toast.show();
    toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
  },

  // Health check
  async checkHealth() {
    try {
      const res = await fetch('/actuator/health');
      if (res.ok) {
        document.getElementById('health-text').textContent = 'Online';
      }
    } catch (e) {
      document.getElementById('health-text').textContent = 'Offline';
    }
  },

  // 1. READ ALL
  async loadBooks() {
    try {
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error('Failed to load books');
      this.books = await res.json();
      this.renderTable(this.books);
    } catch (err) {
      this.showToast('Could not load books: ' + err.message, 'danger');
    }
  },

  renderTable(books) {
    const tbody = document.getElementById('books-table-body');

    if (!books || books.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center py-5 text-muted">
            <i class="bi bi-inbox fs-2 d-block mb-2"></i>
            No books found in the store. Click <strong>Add New Book</strong> to get started!
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = books.map((b, index) => `
      <tr>
        <td class="ps-4 text-muted small">${index + 1}</td>
        <td><strong class="text-dark">${this.escape(b.title)}</strong></td>
        <td>${this.escape(b.author)}</td>
        <td><span class="badge-category">${this.escape(b.category)}</span></td>
        <td><code class="text-muted">${this.escape(b.isbn)}</code></td>
        <td class="fw-bold">$${Number(b.price).toFixed(2)}</td>
        <td>
          <span class="badge ${b.stockQuantity <= 5 ? 'bg-warning-subtle text-warning border border-warning' : 'bg-success-subtle text-success'}">
            ${b.stockQuantity} in stock
          </span>
        </td>
        <td class="text-end pe-4">
          <button class="btn btn-sm btn-outline-primary me-1" title="Edit Book" onclick="app.openEditModal(${b.id})">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger" title="Delete Book" onclick="app.deleteBook(${b.id}, '${this.escape(b.title)}')">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>
    `).join('');
  },

  // 2. OPEN ADD MODAL
  openAddModal() {
    document.getElementById('bookModalTitle').textContent = 'Add New Book';
    document.getElementById('book-form').reset();
    document.getElementById('book-id').value = '';
    this.bookModal.show();
  },

  // 3. OPEN EDIT MODAL
  async openEditModal(id) {
    try {
      const res = await fetch(`${API_BASE}/${id}`);
      if (!res.ok) throw new Error('Book not found');
      const b = await res.json();

      document.getElementById('bookModalTitle').textContent = 'Edit Book';
      document.getElementById('book-id').value = b.id;
      document.getElementById('book-title').value = b.title;
      document.getElementById('book-author').value = b.author;
      document.getElementById('book-category').value = b.category;
      document.getElementById('book-isbn').value = b.isbn;
      document.getElementById('book-price').value = b.price;
      document.getElementById('book-stock').value = b.stockQuantity;

      this.bookModal.show();
    } catch (err) {
      this.showToast(err.message, 'danger');
    }
  },

  // 4. CREATE / UPDATE BOOK
  async saveBook() {
    const id = document.getElementById('book-id').value;
    const payload = {
      title: document.getElementById('book-title').value.trim(),
      author: document.getElementById('book-author').value.trim(),
      category: document.getElementById('book-category').value.trim(),
      isbn: document.getElementById('book-isbn').value.trim(),
      price: parseFloat(document.getElementById('book-price').value),
      stockQuantity: parseInt(document.getElementById('book-stock').value, 10)
    };

    const isEdit = Boolean(id);
    const url = isEdit ? `${API_BASE}/${id}` : API_BASE;
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error('Save operation failed (HTTP ' + res.status + ')');
      }

      this.bookModal.hide();
      this.showToast(isEdit ? 'Book updated successfully!' : 'New book added successfully!', 'success');
      this.loadBooks();
    } catch (err) {
      this.showToast(err.message, 'danger');
    }
  },

  // 5. DELETE BOOK
  async deleteBook(id, title) {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete book');
      this.showToast(`Deleted "${title}"`, 'success');
      this.loadBooks();
    } catch (err) {
      this.showToast(err.message, 'danger');
    }
  },

  escape(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
};

document.addEventListener('DOMContentLoaded', () => app.init());
