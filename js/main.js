/* ResumeForge - shared site scripts */
(function () {
  'use strict';

  // Mobile nav toggle
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    // Close menu when a link is clicked (mobile)
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('open');
        toggle.classList.remove('open');
      });
    });
  }

  // FAQ accordion
  document.querySelectorAll('.faq-q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.faq-item');
      item.classList.toggle('open');
    });
  });

  // Auto year in footer
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  // Highlight current nav link
  var path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(function (a) {
    var href = a.getAttribute('href');
    if (href === path) a.classList.add('active');
  });

  // Simple contact form handler (no backend - mailto fallback)
  var cform = document.getElementById('contactForm');
  if (cform) {
    cform.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = document.getElementById('formStatus');
      var name = encodeURIComponent(document.getElementById('cf-name').value);
      var email = encodeURIComponent(document.getElementById('cf-email').value);
      var msg = encodeURIComponent(document.getElementById('cf-message').value);
      var subject = encodeURIComponent('ResumeForge Contact from ' + decodeURIComponent(name));
      var body = 'Name: ' + name + '%0D%0AEmail: ' + email + '%0D%0A%0D%0A' + msg;
      window.location.href = 'mailto:hello@resumeforge.example?subject=' + subject + '&body=' + body;
      if (status) {
        status.textContent = 'Opening your email app… If nothing happens, email us directly at hello@resumeforge.example';
        status.style.color = 'var(--success)';
      }
    });
  }
})();
