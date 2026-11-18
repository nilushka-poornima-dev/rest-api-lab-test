/**
 * Student Management System - Simple CRUD
 */

const API_BASE = '/api/students';

const app = {
  students: [],
  studentModal: null,

  init() {
    this.studentModal = new bootstrap.Modal(document.getElementById('studentModal'));
    this.loadStudents();
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

  // 1. READ ALL
  async loadStudents() {
    try {
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error('Failed to load students');
      this.students = await res.json();
      this.renderTable(this.students);
    } catch (err) {
      this.showToast('Could not load students: ' + err.message, 'danger');
    }
  },

  renderTable(students) {
    const tbody = document.getElementById('students-table-body');

    if (!students || students.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center py-5 text-muted">
            <i class="bi bi-inbox fs-2 d-block mb-2"></i>
            No students found. Click <strong>Add New Student</strong> to get started!
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = students.map((s, index) => `
      <tr>
        <td class="ps-4 text-muted small">${index + 1}</td>
        <td><strong class="text-dark">${this.escape(s.firstName)}</strong></td>
        <td>${this.escape(s.lastName)}</td>
        <td>${this.escape(s.birthday)}</td>
        <td><span class="badge bg-primary-subtle text-primary border border-primary">${this.escape(s.course)}</span></td>
        <td>${this.escape(s.city)}</td>
        <td>${this.escape(s.phoneNumber)}</td>
        <td class="text-end pe-4">
          <button class="btn btn-sm btn-outline-primary me-1" title="Edit Student" onclick="app.openEditModal(${s.id})">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger" title="Delete Student" onclick="app.deleteStudent(${s.id}, '${this.escape(s.firstName)} ${this.escape(s.lastName)}')">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>
    `).join('');
  },

  // 2. OPEN ADD MODAL
  openAddModal() {
    document.getElementById('studentModalTitle').textContent = 'Add New Student';
    document.getElementById('student-form').reset();
    document.getElementById('student-id').value = '';
    this.studentModal.show();
  },

  // 3. OPEN EDIT MODAL
  async openEditModal(id) {
    try {
      const res = await fetch(`${API_BASE}/${id}`);
      if (!res.ok) throw new Error('Student not found');
      const s = await res.json();

      document.getElementById('studentModalTitle').textContent = 'Edit Student';
      document.getElementById('student-id').value = s.id;
      document.getElementById('student-firstName').value = s.firstName;
      document.getElementById('student-lastName').value = s.lastName;
      document.getElementById('student-birthday').value = s.birthday;
      document.getElementById('student-course').value = s.course;
      document.getElementById('student-city').value = s.city;
      document.getElementById('student-phoneNumber').value = s.phoneNumber;

      this.studentModal.show();
    } catch (err) {
      this.showToast(err.message, 'danger');
    }
  },

  // 4. CREATE / UPDATE STUDENT
  async saveStudent() {
    const id = document.getElementById('student-id').value;
    const payload = {
      firstName:   document.getElementById('student-firstName').value.trim(),
      lastName:    document.getElementById('student-lastName').value.trim(),
      birthday:    document.getElementById('student-birthday').value,
      course:      document.getElementById('student-course').value.trim(),
      city:        document.getElementById('student-city').value.trim(),
      phoneNumber: document.getElementById('student-phoneNumber').value.trim()
    };

    const isEdit = Boolean(id);
    const url    = isEdit ? `${API_BASE}/${id}` : API_BASE;
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

      this.studentModal.hide();
      this.showToast(isEdit ? 'Student updated successfully!' : 'New student added successfully!', 'success');
      this.loadStudents();
    } catch (err) {
      this.showToast(err.message, 'danger');
    }
  },

  // 5. DELETE STUDENT
  async deleteStudent(id, name) {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete student');
      this.showToast(`Deleted "${name}"`, 'success');
      this.loadStudents();
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
