/* ==========================================================================
   VIREO — Main JavaScript
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function () {
  initBurgerMenu();
  initHeaderScroll();
  initSmoothScroll();
  initForms();
  initSearch();
  initToast();
  initBackToTop();
  initPlaceholderImages();
  initYandexMetrikaGoals();
});

/* ---------- Burger Menu ---------- */
function initBurgerMenu() {
  const burger = document.querySelector('.burger');
  const nav = document.querySelector('.nav');

  if (!burger || !nav) return;

  burger.addEventListener('click', function () {
    const isOpen = nav.classList.contains('open');
    nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', !isOpen);
  });

  // Close menu when clicking a link
  const navLinks = document.querySelectorAll('.nav a');
  navLinks.forEach(link => {
    link.addEventListener('click', function () {
      nav.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });

  // Close on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      nav.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    }
  });
}

/* ---------- Header hide/show on scroll ---------- */
function initHeaderScroll() {
  const header = document.querySelector('.header');
  if (!header) return;

  let lastScrollY = window.scrollY;
  let ticking = false;

  window.addEventListener('scroll', function () {
    lastScrollY = window.scrollY;
    if (!ticking) {
      window.requestAnimationFrame(function () {
        if (lastScrollY > 100) {
          header.classList.add('hidden');
        } else {
          header.classList.remove('hidden');
        }
        ticking = false;
      });
      ticking = true;
    }
  });
}

/* ---------- Smooth Scroll for anchor links ---------- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const headerOffset = 80;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      }
    });
  });
}

/* ---------- Forms ---------- */
function initForms() {
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn ? btn.innerHTML : '';

      // Simple validation
      let isValid = true;
      const requiredFields = form.querySelectorAll('[required]');
      requiredFields.forEach(field => {
        if (!field.value.trim()) {
          isValid = false;
          field.style.borderColor = '#d32f2f';
          field.addEventListener('input', function () {
            this.style.borderColor = '';
          }, { once: true });
        }
      });

      const privacyCheckbox = form.querySelector('input[type="checkbox"][required]');
      if (privacyCheckbox && !privacyCheckbox.checked) {
        isValid = false;
        showToast('Необходимо согласие на обработку персональных данных');
      }

      if (!isValid) {
        showToast('Пожалуйста, заполните все обязательные поля');
        return;
      }

      // Simulate sending
      if (btn) {
        btn.innerHTML = 'Отправка...';
        btn.disabled = true;
      }

      setTimeout(() => {
        if (btn) {
          btn.innerHTML = originalText;
          btn.disabled = false;
        }
        form.reset();
        showToast('Заявка успешно отправлена. Мы свяжемся с вами в ближайшее время.');
        
        // Yandex Metrika goal: form submit
        if (typeof ym !== 'undefined') {
          ym(99999999, 'reachGoal', 'FORM_SUBMIT');
        }
      }, 1200);
    });
  });

  // Clickable phone and email links with tracking
  document.querySelectorAll('a[href^="tel:"]').forEach(link => {
    link.addEventListener('click', function () {
      if (typeof ym !== 'undefined') {
        ym(99999999, 'reachGoal', 'PHONE_CLICK');
      }
    });
  });

  document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
    link.addEventListener('click', function () {
      if (typeof ym !== 'undefined') {
        ym(99999999, 'reachGoal', 'EMAIL_CLICK');
      }
    });
  });

  // Social links open in new tab
  document.querySelectorAll('.social-link, .socials a').forEach(link => {
    const href = link.getAttribute('href');
    if (href && (href.includes('instagram.com') || href.includes('t.me'))) {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
      link.addEventListener('click', function () {
        if (typeof ym !== 'undefined') {
          ym(99999999, 'reachGoal', 'SOCIAL_CLICK');
        }
      });
    }
  });
}

/* ---------- Search (Instructions page) ---------- */
function initSearch() {
  const searchInput = document.querySelector('.search-box input');
  const items = document.querySelectorAll('.instr-item');
  const noResults = document.querySelector('.no-results');

  if (!searchInput || items.length === 0) return;

  searchInput.addEventListener('input', function () {
    const query = this.value.toLowerCase().trim();
    let visibleCount = 0;

    items.forEach(item => {
      const text = item.textContent.toLowerCase();
      if (text.includes(query)) {
        item.style.display = 'flex';
        visibleCount++;
      } else {
        item.style.display = 'none';
      }
    });

    if (noResults) {
      if (visibleCount === 0 && query.length > 0) {
        noResults.style.display = 'block';
      } else {
        noResults.style.display = 'none';
      }
    }
  });
}

/* ---------- Toast Notifications ---------- */
function initToast() {
  // Create toast element if not exists
  if (!document.querySelector('.toast')) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
}

function showToast(message) {
  const toast = document.querySelector('.toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}

/* ---------- Back to Top ---------- */
function initBackToTop() {
  // Optional: create back to top button
  const btn = document.createElement('button');
  btn.innerHTML = '↑';
  btn.className = 'back-to-top';
  btn.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: #000000;
    color: #ffffff;
    font-size: 20px;
    border: none;
    cursor: pointer;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
  `;
  document.body.appendChild(btn);

  window.addEventListener('scroll', function () {
    if (window.scrollY > 400) {
      btn.style.opacity = '1';
      btn.style.visibility = 'visible';
    } else {
      btn.style.opacity = '0';
      btn.style.visibility = 'hidden';
    }
  });

  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ---------- Placeholder Images (fallback when real images missing) ---------- */
function initPlaceholderImages() {
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    img.addEventListener('error', function () {
      this.style.display = 'none';
      const wrapper = this.closest('.card-image, .main-image, .thumb, .expert-visual, .card-image');
      if (wrapper) {
        wrapper.innerHTML = '<div class="card-placeholder">Фото скоро будет добавлено</div>';
      } else {
        this.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22400%22%20height%3D%22300%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23f0efeb%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20fill%3D%22%23999%22%20font-size%3D%2216%22%3EФото%20скоро%20будет%20добавлено%3C%2Ftext%3E%3C%2Fsvg%3E';
      }
    });
  });
}

/* ---------- Yandex Metrika Goals ---------- */
function initYandexMetrikaGoals() {
  // Placeholder for Yandex Metrika counter initialization
  // Заказчик должен заменить XXXXXXXX на реальный номер счётчика
  // Пример:
  /*
  ym(XXXXXXXX, 'init', {
    clickmap: true,
    trackLinks: true,
    accurateTrackBounce: true
  });
  */
}

/* ---------- Admin Panel (Simple) ---------- */
// Admin data stored in localStorage (demo). Real version needs backend.
const ADMIN_STORAGE_KEY = 'vireo_admin_data';

function initAdmin() {
  const adminTabs = document.querySelectorAll('.admin-tab');
  const adminSections = document.querySelectorAll('.admin-section');

  adminTabs.forEach(tab => {
    tab.addEventListener('click', function () {
      adminTabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');

      const sectionId = this.getAttribute('data-section');
      adminSections.forEach(s => {
        s.style.display = s.id === sectionId ? 'block' : 'none';
      });
    });
  });

  // Load existing data
  loadAdminData();

  // Handle form submissions
  const adminForms = document.querySelectorAll('.admin-form');
  adminForms.forEach(form => {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const formData = new FormData(this);
      const data = Object.fromEntries(formData.entries());
      
      const section = this.closest('.admin-section').id;
      saveAdminItem(section, data);
      
      this.reset();
      showToast('Запись успешно сохранена');
      loadAdminData();
    });
  });
}

function saveAdminItem(section, data) {
  const existing = JSON.parse(localStorage.getItem(ADMIN_STORAGE_KEY) || '{}');
  if (!existing[section]) existing[section] = [];
  existing[section].push({ id: Date.now(), ...data });
  localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(existing));
}

function loadAdminData() {
  const existing = JSON.parse(localStorage.getItem(ADMIN_STORAGE_KEY) || '{}');
  Object.keys(existing).forEach(section => {
    const tableBody = document.querySelector(`#${section} tbody`);
    if (!tableBody) return;
    tableBody.innerHTML = '';
    existing[section].forEach(item => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${item.name || item.title || item.document || '-'}</td>
        <td>${item.file || '-'}</td>
        <td>${item.size || '-'}</td>
        <td class="admin-actions">
          <button class="btn-small btn-edit" onclick="editItem(${item.id}, '${section}')">Редактировать</button>
          <button class="btn-small btn-delete" onclick="deleteItem(${item.id}, '${section}')">Удалить</button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  });
}

window.editItem = function (id, section) {
  const existing = JSON.parse(localStorage.getItem(ADMIN_STORAGE_KEY) || '{}');
  const item = existing[section].find(i => i.id === id);
  if (!item) return;
  
  const form = document.querySelector(`#${section} .admin-form`);
  if (!form) return;
  
  Object.keys(item).forEach(key => {
    const field = form.querySelector(`[name="${key}"]`);
    if (field) field.value = item[key];
  });
  
  showToast('Загрузите данные для редактирования. Измените и нажмите Сохранить.');
};

window.deleteItem = function (id, section) {
  if (!confirm('Удалить эту запись?')) return;
  const existing = JSON.parse(localStorage.getItem(ADMIN_STORAGE_KEY) || '{}');
  existing[section] = existing[section].filter(i => i.id !== id);
  localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(existing));
  loadAdminData();
  showToast('Запись удалена');
};

// Initialize admin if on admin page
if (document.querySelector('.admin-panel')) {
  initAdmin();
}