/* ResumeForge - Resume Builder logic */
(function () {
  'use strict';

  var STORAGE_KEY = 'resumeforge_data_v1';
  var PREF_KEY = 'resumeforge_prefs_v1';

  var COLORS = ['#2563eb', '#0ea5e9', '#0f766e', '#7c3aed', '#db2777', '#dc2626', '#ea580c', '#0f172a'];

  var emptyState = {
    fullName: '', jobTitle: '', email: '', phone: '', location: '', website: '', linkedin: '',
    summary: '', skills: '', languages: '',
    experience: [], education: [], projects: [], certifications: []
  };

  var sampleState = {
    fullName: 'Jordan Carter',
    jobTitle: 'Senior Software Engineer',
    email: 'jordan.carter@email.com',
    phone: '+1 (555) 482-1190',
    location: 'San Francisco, CA',
    website: 'jordancarter.dev',
    linkedin: 'linkedin.com/in/jordancarter',
    summary: 'Results-driven software engineer with 8+ years building scalable web applications. Passionate about clean architecture, mentoring teams, and shipping products that delight users. Proven track record of reducing load times and leading cross-functional projects.',
    skills: 'JavaScript, TypeScript, React, Node.js, AWS, PostgreSQL, Docker, System Design, Team Leadership',
    languages: 'English (Native), Spanish (Professional)',
    experience: [
      { role: 'Senior Software Engineer', company: 'BrightLabs Inc.', start: 'Jan 2021', end: 'Present', location: 'Remote', desc: 'Led a team of 5 engineers to rebuild the core platform, cutting page load time by 45%.\nDesigned a microservices architecture serving 2M+ monthly users.\nMentored junior developers and introduced code review best practices.' },
      { role: 'Software Engineer', company: 'Nimbus Tech', start: 'Jun 2017', end: 'Dec 2020', location: 'Austin, TX', desc: 'Built customer-facing dashboards in React used by 50k+ businesses.\nImproved API response times by 60% through query optimization.' }
    ],
    education: [
      { degree: 'B.Sc. in Computer Science', school: 'University of Texas at Austin', start: '2013', end: '2017', location: 'Austin, TX', desc: 'Graduated with honors. President of the Coding Club.' }
    ],
    projects: [
      { name: 'OpenTask', link: 'github.com/jordan/opentask', desc: 'Open-source task manager with 3k+ GitHub stars, built with React and Node.js.' }
    ],
    certifications: [
      { name: 'AWS Certified Solutions Architect', issuer: 'Amazon Web Services', year: '2022' }
    ]
  };

  // Field templates for repeatable sections
  var SECTIONS = {
    experience: {
      title: 'Experience',
      fields: [
        { key: 'role', label: 'Job Title', ph: 'Senior Engineer' },
        { key: 'company', label: 'Company', ph: 'Company Inc.' },
        { key: 'start', label: 'Start Date', ph: 'Jan 2021', half: true },
        { key: 'end', label: 'End Date', ph: 'Present', half: true },
        { key: 'location', label: 'Location', ph: 'City, Country' },
        { key: 'desc', label: 'Description (one bullet per line)', ph: 'Achieved X by doing Y…', area: true }
      ]
    },
    education: {
      title: 'Education',
      fields: [
        { key: 'degree', label: 'Degree', ph: 'B.Sc. Computer Science' },
        { key: 'school', label: 'School / University', ph: 'University Name' },
        { key: 'start', label: 'Start Year', ph: '2013', half: true },
        { key: 'end', label: 'End Year', ph: '2017', half: true },
        { key: 'location', label: 'Location', ph: 'City, Country' },
        { key: 'desc', label: 'Notes (optional)', ph: 'Honors, GPA, activities…', area: true }
      ]
    },
    projects: {
      title: 'Project',
      fields: [
        { key: 'name', label: 'Project Name', ph: 'My Project' },
        { key: 'link', label: 'Link (optional)', ph: 'github.com/you/project' },
        { key: 'desc', label: 'Description', ph: 'What it does and your role…', area: true }
      ]
    },
    certifications: {
      title: 'Certification',
      fields: [
        { key: 'name', label: 'Certification', ph: 'AWS Certified…' },
        { key: 'issuer', label: 'Issuer', ph: 'Amazon Web Services', half: true },
        { key: 'year', label: 'Year', ph: '2022', half: true }
      ]
    }
  };

  var state, prefs;

  /* ---------- utils ---------- */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function load() {
    try { state = Object.assign({}, emptyState, JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}); }
    catch (e) { state = JSON.parse(JSON.stringify(emptyState)); }
    ['experience', 'education', 'projects', 'certifications'].forEach(function (k) {
      if (!Array.isArray(state[k])) state[k] = [];
    });
    try { prefs = Object.assign({ template: 'modern', color: COLORS[0], photo: '' }, JSON.parse(localStorage.getItem(PREF_KEY)) || {}); }
    catch (e) { prefs = { template: 'modern', color: COLORS[0], photo: '' }; }
  }
  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
  }

  /* ---------- editor: simple bindings ---------- */
  function bindSimpleFields() {
    document.querySelectorAll('[data-bind]').forEach(function (el) {
      var key = el.getAttribute('data-bind');
      el.value = state[key] || '';
      el.addEventListener('input', function () {
        state[key] = el.value;
        render(); save();
      });
    });
  }

  /* ---------- editor: repeatable sections ---------- */
  function renderSectionEditor(section) {
    var cfg = SECTIONS[section];
    var list = document.getElementById(section + 'List');
    list.innerHTML = '';
    state[section].forEach(function (item, idx) {
      var card = document.createElement('div');
      card.className = 'item-card';
      var fieldsHtml = '';
      var rowBuffer = [];
      cfg.fields.forEach(function (f) {
        var input = f.area
          ? '<textarea data-sec="' + section + '" data-idx="' + idx + '" data-key="' + f.key + '" placeholder="' + esc(f.ph) + '">' + esc(item[f.key]) + '</textarea>'
          : '<input data-sec="' + section + '" data-idx="' + idx + '" data-key="' + f.key + '" placeholder="' + esc(f.ph) + '" value="' + esc(item[f.key]) + '" />';
        var fieldHtml = '<div class="field"><label>' + f.label + '</label>' + input + '</div>';
        if (f.half) {
          rowBuffer.push(fieldHtml);
          if (rowBuffer.length === 2) { fieldsHtml += '<div class="field-row">' + rowBuffer.join('') + '</div>'; rowBuffer = []; }
        } else {
          if (rowBuffer.length) { fieldsHtml += rowBuffer.join(''); rowBuffer = []; }
          fieldsHtml += fieldHtml;
        }
      });
      if (rowBuffer.length) fieldsHtml += rowBuffer.join('');

      card.innerHTML = '<div class="item-head"><strong>' + cfg.title + ' ' + (idx + 1) +
        '</strong><button class="btn-remove" data-remove="' + section + '" data-idx="' + idx + '" title="Remove">&times;</button></div>' + fieldsHtml;
      list.appendChild(card);
    });

    // bind inputs
    list.querySelectorAll('[data-sec]').forEach(function (el) {
      el.addEventListener('input', function () {
        var i = +el.getAttribute('data-idx');
        var k = el.getAttribute('data-key');
        state[section][i][k] = el.value;
        render(); save();
      });
    });
    list.querySelectorAll('[data-remove]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var i = +btn.getAttribute('data-idx');
        state[section].splice(i, 1);
        renderSectionEditor(section); render(); save();
      });
    });
  }

  function setupAddButtons() {
    document.querySelectorAll('[data-add]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var section = btn.getAttribute('data-add');
        var obj = {};
        SECTIONS[section].fields.forEach(function (f) { obj[f.key] = ''; });
        state[section].push(obj);
        renderSectionEditor(section); render(); save();
      });
    });
  }

  /* ---------- accordion ---------- */
  function setupAccordions() {
    document.querySelectorAll('.acc-head').forEach(function (head) {
      head.addEventListener('click', function () { head.closest('.acc').classList.toggle('open'); });
    });
  }

  /* ---------- photo ---------- */
  function setupPhoto() {
    var input = document.getElementById('photoInput');
    var preview = document.getElementById('photoPreview');
    if (prefs.photo) preview.src = prefs.photo;
    input.addEventListener('change', function () {
      var file = input.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function (e) { prefs.photo = e.target.result; preview.src = prefs.photo; render(); save(); };
      reader.readAsDataURL(file);
    });
    document.getElementById('removePhoto').addEventListener('click', function () {
      prefs.photo = ''; input.value = '';
      preview.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='64' height='64' fill='%23e2e8f0'/%3E%3C/svg%3E";
      render(); save();
    });
  }

  /* ---------- toolbar ---------- */
  function setupToolbar() {
    var tplSelect = document.getElementById('templateSelect');
    tplSelect.value = prefs.template;
    tplSelect.addEventListener('change', function () { prefs.template = tplSelect.value; render(); save(); });

    var sw = document.getElementById('swatches');
    COLORS.forEach(function (c) {
      var b = document.createElement('button');
      b.className = 'swatch' + (c === prefs.color ? ' active' : '');
      b.style.background = c;
      b.title = c;
      b.addEventListener('click', function () {
        prefs.color = c;
        sw.querySelectorAll('.swatch').forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        render(); save();
      });
      sw.appendChild(b);
    });

    document.getElementById('loadSampleBtn').addEventListener('click', function () {
      if (confirm('Load sample content? This will replace your current entries.')) {
        state = JSON.parse(JSON.stringify(sampleState));
        refreshEditor(); render(); save();
      }
    });
    document.getElementById('resetBtn').addEventListener('click', function () {
      if (confirm('Clear everything and start fresh?')) {
        state = JSON.parse(JSON.stringify(emptyState));
        prefs.photo = '';
        document.getElementById('photoPreview').src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='64' height='64' fill='%23e2e8f0'/%3E%3C/svg%3E";
        refreshEditor(); render(); save();
      }
    });
    document.getElementById('downloadBtn').addEventListener('click', downloadPDF);
    var printBtn = document.getElementById('printBtn');
    if (printBtn) printBtn.addEventListener('click', printPDF);
  }

  function refreshEditor() {
    document.querySelectorAll('[data-bind]').forEach(function (el) { el.value = state[el.getAttribute('data-bind')] || ''; });
    ['experience', 'education', 'projects', 'certifications'].forEach(renderSectionEditor);
  }

  /* ---------- preview rendering ---------- */
  function listToArr(str) { return (str || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean); }
  function descToHtml(desc) {
    var lines = (desc || '').split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
    if (!lines.length) return '';
    if (lines.length === 1) return '<div class="r-item-desc">' + esc(lines[0]) + '</div>';
    return '<div class="r-item-desc"><ul>' + lines.map(function (l) { return '<li>' + esc(l) + '</li>'; }).join('') + '</ul></div>';
  }

  function contactHtml() {
    var bits = [];
    if (state.email) bits.push('<span>✉ ' + esc(state.email) + '</span>');
    if (state.phone) bits.push('<span>☎ ' + esc(state.phone) + '</span>');
    if (state.location) bits.push('<span>📍 ' + esc(state.location) + '</span>');
    if (state.website) bits.push('<span>🌐 ' + esc(state.website) + '</span>');
    if (state.linkedin) bits.push('<span>in ' + esc(state.linkedin) + '</span>');
    return bits.join('');
  }

  function expSection() {
    if (!state.experience.length) return '';
    var items = state.experience.map(function (e) {
      return '<div class="r-item"><div class="r-item-top"><div>' +
        '<div class="r-item-title">' + esc(e.role || '') + '</div>' +
        '<div class="r-item-sub">' + esc(e.company || '') + (e.location ? ' · ' + esc(e.location) : '') + '</div></div>' +
        '<div class="r-item-date">' + esc(e.start || '') + (e.end ? ' – ' + esc(e.end) : '') + '</div></div>' +
        descToHtml(e.desc) + '</div>';
    }).join('');
    return '<div class="r-section"><div class="r-section-title">Experience</div>' + items + '</div>';
  }
  function eduSection() {
    if (!state.education.length) return '';
    var items = state.education.map(function (e) {
      return '<div class="r-item"><div class="r-item-top"><div>' +
        '<div class="r-item-title">' + esc(e.degree || '') + '</div>' +
        '<div class="r-item-sub">' + esc(e.school || '') + (e.location ? ' · ' + esc(e.location) : '') + '</div></div>' +
        '<div class="r-item-date">' + esc(e.start || '') + (e.end ? ' – ' + esc(e.end) : '') + '</div></div>' +
        descToHtml(e.desc) + '</div>';
    }).join('');
    return '<div class="r-section"><div class="r-section-title">Education</div>' + items + '</div>';
  }
  function projSection() {
    if (!state.projects.length) return '';
    var items = state.projects.map(function (p) {
      return '<div class="r-item"><div class="r-item-top"><div class="r-item-title">' + esc(p.name || '') + '</div>' +
        (p.link ? '<div class="r-item-date">' + esc(p.link) + '</div>' : '') + '</div>' +
        descToHtml(p.desc) + '</div>';
    }).join('');
    return '<div class="r-section"><div class="r-section-title">Projects</div>' + items + '</div>';
  }
  function certSection() {
    if (!state.certifications.length) return '';
    var items = state.certifications.map(function (c) {
      return '<div class="r-item"><div class="r-item-top"><div class="r-item-title">' + esc(c.name || '') + '</div>' +
        '<div class="r-item-date">' + esc(c.year || '') + '</div></div>' +
        (c.issuer ? '<div class="r-item-sub">' + esc(c.issuer) + '</div>' : '') + '</div>';
    }).join('');
    return '<div class="r-section"><div class="r-section-title">Certifications</div>' + items + '</div>';
  }
  function skillsSection() {
    var arr = listToArr(state.skills);
    if (!arr.length) return '';
    return '<div class="r-section"><div class="r-section-title">Skills</div><div class="r-skills">' +
      arr.map(function (s) { return '<span class="r-skill">' + esc(s) + '</span>'; }).join('') + '</div></div>';
  }
  function langSection() {
    var arr = listToArr(state.languages);
    if (!arr.length) return '';
    return '<div class="r-section"><div class="r-section-title">Languages</div><div class="r-skills">' +
      arr.map(function (s) { return '<span class="r-skill">' + esc(s) + '</span>'; }).join('') + '</div></div>';
  }
  function summarySection() {
    if (!state.summary) return '';
    return '<div class="r-section"><div class="r-section-title">Summary</div><div class="r-summary">' + esc(state.summary) + '</div></div>';
  }

  function headerHtml(showPhoto) {
    var photo = (showPhoto && prefs.photo) ? '<img class="r-photo" src="' + prefs.photo + '" alt="" />' : '';
    var name = state.fullName || '<span class="r-empty">Your Name</span>';
    var title = state.jobTitle ? '<div class="r-title">' + esc(state.jobTitle) + '</div>' : '';
    return '<div class="r-header">' + photo +
      '<div style="flex:1;"><div class="r-name">' + (state.fullName ? esc(state.fullName) : name) + '</div>' +
      title + '<div class="r-contact">' + contactHtml() + '</div></div></div>';
  }

  // Build an rgba tint from a hex color. html2canvas (PDF export) does not
  // support CSS color-mix(), so we compute the light accent tint here instead.
  function hexToTint(hex, alpha) {
    var h = String(hex || '#2563eb').replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var r = parseInt(h.substr(0, 2), 16) || 37;
    var g = parseInt(h.substr(2, 2), 16) || 99;
    var b = parseInt(h.substr(4, 2), 16) || 235;
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
  }

  function render() {
    var resume = document.getElementById('resume');
    resume.className = 'resume tpl-' + prefs.template;
    resume.style.setProperty('--rf-accent', prefs.color);
    resume.style.setProperty('--rf-accent-tint', hexToTint(prefs.color, 0.12));

    var tpl = prefs.template;
    if (tpl === 'sidebar') {
      var sidePhoto = prefs.photo ? '<img class="r-photo" src="' + prefs.photo + '" alt="" />' : '';
      var side = '<div class="r-side">' + sidePhoto +
        '<div class="r-name">' + (state.fullName ? esc(state.fullName) : 'Your Name') + '</div>' +
        (state.jobTitle ? '<div class="r-title">' + esc(state.jobTitle) + '</div>' : '') +
        '<div class="r-section"><div class="r-section-title">Contact</div><div class="r-contact">' + contactHtml() + '</div></div>' +
        skillsSection() + langSection() + '</div>';
      var main = '<div class="r-main">' + summarySection() + expSection() + eduSection() + projSection() + certSection() + '</div>';
      resume.innerHTML = side + main;
    } else {
      resume.innerHTML = headerHtml(tpl === 'modern') +
        summarySection() + expSection() + eduSection() + skillsSection() + projSection() + certSection() + langSection();
    }
  }

  /* ---------- PDF ---------- */
  function fileBase() {
    return (state.fullName || 'resume').replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '').toLowerCase() || 'resume';
  }

  function toRGB(hex) {
    var h = String(hex || '#2563eb').replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    return [parseInt(h.substr(0, 2), 16) || 0, parseInt(h.substr(2, 2), 16) || 0, parseInt(h.substr(4, 2), 16) || 0];
  }
  function imgFormat(dataURL) {
    if (/^data:image\/png/i.test(dataURL)) return 'PNG';
    if (/^data:image\/jpe?g/i.test(dataURL)) return 'JPEG';
    if (/^data:image\/webp/i.test(dataURL)) return 'WEBP';
    return 'PNG';
  }
  function getJsPDF() {
    if (window.jspdf && window.jspdf.jsPDF) return window.jspdf.jsPDF;
    if (window.jsPDF) return window.jsPDF;
    return null;
  }

  // PRIMARY EXPORT: a true VECTOR PDF. Instead of taking a screenshot of the
  // resume and stretching that image onto an A4 page (which pixelates), we draw
  // the text, lines and sections directly into the PDF with jsPDF. The result
  // contains real text, so it stays perfectly sharp at any zoom level.
  function downloadPDF() {
    var JsPDF = getJsPDF();
    var btn = document.getElementById('downloadBtn');
    if (!JsPDF) { printPDF(); return; } // safety fallback

    var orig = btn.textContent;
    btn.textContent = 'Generating…'; btn.disabled = true;

    try {
      var doc = new JsPDF({ unit: 'pt', format: 'a4', compress: true });
      var tpl = prefs.template;
      if (tpl === 'sidebar') drawSidebar(doc);
      else drawSingleColumn(doc, tpl);
      doc.save(fileBase() + '_resume.pdf');
    } catch (e) {
      printPDF();
    } finally {
      btn.textContent = orig; btn.disabled = false;
    }
  }

  // ----- single-column vector layout (Modern / Classic / Minimal) -----
  function drawSingleColumn(doc, tpl) {
    var pageW = doc.internal.pageSize.getWidth();
    var pageH = doc.internal.pageSize.getHeight();
    var L = 48, R = 48, top = 50, bottom = 48;
    var contentW = pageW - L - R;

    var serif = (tpl === 'classic');
    var font = serif ? 'times' : 'helvetica';
    var accent = prefs.color;
    var aRGB = toRGB(accent);
    var nameRGB = (tpl === 'classic') ? [17, 17, 17] : aRGB;
    var titleRGB = (tpl === 'classic') ? [17, 17, 17] : aRGB;
    var centered = (tpl === 'classic');
    var showPhoto = (tpl === 'modern') && !!prefs.photo;

    var C = { y: top };
    function ens(h) { if (C.y + h > pageH - bottom) { doc.addPage(); C.y = top; } }

    var name = state.fullName || 'Your Name';

    // ---- header ----
    if (centered) {
      doc.setFont(font, 'bold'); doc.setFontSize(24); doc.setTextColor(nameRGB[0], nameRGB[1], nameRGB[2]);
      doc.text(name, pageW / 2, C.y, { align: 'center', baseline: 'top' }); C.y += 28;
      if (state.jobTitle) {
        doc.setFont(font, 'normal'); doc.setFontSize(12.5); doc.setTextColor(70, 70, 70);
        doc.text(state.jobTitle, pageW / 2, C.y, { align: 'center', baseline: 'top' }); C.y += 18;
      }
      var ci = contactArr();
      if (ci.length) {
        doc.setFont(font, 'normal'); doc.setFontSize(9.5); doc.setTextColor(90, 90, 90);
        var cl = doc.splitTextToSize(ci.join('   \u2022   '), contentW);
        doc.text(cl, pageW / 2, C.y, { align: 'center', baseline: 'top' }); C.y += cl.length * 12;
      }
      C.y += 6;
      doc.setDrawColor(34, 34, 34); doc.setLineWidth(1.2);
      doc.line(L, C.y, L + contentW, C.y); C.y += 16;
    } else {
      var photoW = 0;
      if (showPhoto) {
        try { doc.addImage(prefs.photo, imgFormat(prefs.photo), L + contentW - 70, C.y, 70, 70); photoW = 84; } catch (e) {}
      }
      var tw = contentW - photoW;
      doc.setFont(font, 'bold'); doc.setFontSize(24); doc.setTextColor(nameRGB[0], nameRGB[1], nameRGB[2]);
      var nameLines = doc.splitTextToSize(name, tw);
      doc.text(nameLines, L, C.y, { baseline: 'top' });
      var hy = C.y + nameLines.length * 26;
      if (state.jobTitle) {
        doc.setFont(font, 'normal'); doc.setFontSize(12.5); doc.setTextColor(70, 70, 70);
        doc.text(state.jobTitle, L, hy, { baseline: 'top' }); hy += 18;
      }
      var items = contactArr();
      if (items.length) {
        doc.setFont(font, 'normal'); doc.setFontSize(9.5); doc.setTextColor(90, 90, 90);
        var ls = doc.splitTextToSize(items.join('   \u2022   '), tw);
        doc.text(ls, L, hy, { baseline: 'top' }); hy += ls.length * 12;
      }
      C.y = Math.max(hy, showPhoto ? C.y + 72 : hy) + 6;
      if (tpl === 'modern') {
        doc.setDrawColor(aRGB[0], aRGB[1], aRGB[2]); doc.setLineWidth(2);
        doc.line(L, C.y, L + contentW, C.y); C.y += 16;
      } else if (tpl === 'minimal') {
        C.y += 4;
      } else {
        doc.setDrawColor(200, 200, 200); doc.setLineWidth(0.8);
        doc.line(L, C.y, L + contentW, C.y); C.y += 14;
      }
    }

    function sectionTitle(t) {
      ens(34);
      doc.setFont(font, 'bold'); doc.setFontSize(11); doc.setTextColor(titleRGB[0], titleRGB[1], titleRGB[2]);
      doc.text(t.toUpperCase(), L, C.y, { baseline: 'top' }); C.y += 14;
      if (tpl === 'minimal') { C.y += 2; }
      else if (tpl === 'classic') { doc.setDrawColor(150, 150, 150); doc.setLineWidth(0.6); doc.line(L, C.y, L + contentW, C.y); C.y += 10; }
      else { doc.setDrawColor(226, 232, 240); doc.setLineWidth(0.7); doc.line(L, C.y, L + contentW, C.y); C.y += 10; }
      doc.setTextColor(45, 45, 45);
    }

    // ---- sections (match preview order) ----
    if (state.summary) {
      sectionTitle('Summary');
      doc.setFont(font, 'normal'); doc.setFontSize(10.2); doc.setTextColor(55, 55, 55);
      var sm = doc.splitTextToSize(state.summary, contentW);
      ens(sm.length * 13); doc.text(sm, L, C.y, { baseline: 'top' }); C.y += sm.length * 13 + 8;
    }
    if (state.experience.length) { sectionTitle('Experience'); drawEntries(doc, C, ens, L, contentW, font, serif, state.experience, 'role', 'company'); }
    if (state.education.length) { sectionTitle('Education'); drawEntries(doc, C, ens, L, contentW, font, serif, state.education, 'degree', 'school'); }
    drawTagList(doc, C, ens, L, contentW, font, sectionTitle, 'Skills', state.skills);
    if (state.projects.length) { sectionTitle('Projects'); drawProjects(doc, C, ens, L, contentW, font, serif); }
    if (state.certifications.length) { sectionTitle('Certifications'); drawCerts(doc, C, ens, L, contentW, font, serif); }
    drawTagList(doc, C, ens, L, contentW, font, sectionTitle, 'Languages', state.languages);
  }

  // experience / education entries
  function drawEntries(doc, C, ens, x, w, font, serif, arr, titleKey, subKey) {
    arr.forEach(function (e) {
      ens(40);
      var dateStr = (e.start || '') + (e.end ? ' \u2013 ' + e.end : '');
      doc.setFont(font, 'bold'); doc.setFontSize(11); doc.setTextColor(30, 30, 30);
      var roleLines = doc.splitTextToSize(e[titleKey] || '', w - 110);
      doc.text(roleLines, x, C.y, { baseline: 'top' });
      if (dateStr) {
        doc.setFont(font, 'normal'); doc.setFontSize(9); doc.setTextColor(110, 110, 110);
        doc.text(dateStr, x + w, C.y, { align: 'right', baseline: 'top' });
      }
      C.y += roleLines.length * 13;
      var sub = (e[subKey] || '') + (e.location ? '  \u00b7  ' + e.location : '');
      if (sub.trim()) {
        doc.setFont(font, serif ? 'italic' : 'normal'); doc.setFontSize(10); doc.setTextColor(80, 80, 80);
        var sl = doc.splitTextToSize(sub, w); doc.text(sl, x, C.y, { baseline: 'top' }); C.y += sl.length * 12;
      }
      if (e.desc) {
        doc.setFont(font, 'normal'); doc.setFontSize(9.7); doc.setTextColor(55, 55, 55);
        e.desc.split('\n').map(function (s) { return s.trim(); }).filter(Boolean).forEach(function (line) {
          var wr = doc.splitTextToSize(line, w - 14); ens(wr.length * 12 + 2);
          doc.text('\u2022', x + 2, C.y, { baseline: 'top' });
          doc.text(wr, x + 14, C.y, { baseline: 'top' }); C.y += wr.length * 12;
        });
      }
      C.y += 9;
    });
  }

  function drawProjects(doc, C, ens, x, w, font, serif) {
    state.projects.forEach(function (p) {
      ens(30);
      doc.setFont(font, 'bold'); doc.setFontSize(11); doc.setTextColor(30, 30, 30);
      var nameLines = doc.splitTextToSize(p.name || '', w - 110);
      doc.text(nameLines, x, C.y, { baseline: 'top' });
      if (p.link) {
        doc.setFont(font, 'normal'); doc.setFontSize(9); doc.setTextColor(110, 110, 110);
        doc.text(p.link, x + w, C.y, { align: 'right', baseline: 'top' });
      }
      C.y += nameLines.length * 13;
      if (p.desc) {
        doc.setFont(font, 'normal'); doc.setFontSize(9.7); doc.setTextColor(55, 55, 55);
        var dl = doc.splitTextToSize(p.desc, w); ens(dl.length * 12); doc.text(dl, x, C.y, { baseline: 'top' }); C.y += dl.length * 12;
      }
      C.y += 9;
    });
  }

  function drawCerts(doc, C, ens, x, w, font, serif) {
    state.certifications.forEach(function (c) {
      ens(26);
      doc.setFont(font, 'bold'); doc.setFontSize(10.6); doc.setTextColor(30, 30, 30);
      var nm = doc.splitTextToSize(c.name || '', w - 80);
      doc.text(nm, x, C.y, { baseline: 'top' });
      if (c.year) {
        doc.setFont(font, 'normal'); doc.setFontSize(9); doc.setTextColor(110, 110, 110);
        doc.text(c.year, x + w, C.y, { align: 'right', baseline: 'top' });
      }
      C.y += nm.length * 12.5;
      if (c.issuer) {
        doc.setFont(font, serif ? 'italic' : 'normal'); doc.setFontSize(9.5); doc.setTextColor(80, 80, 80);
        doc.text(c.issuer, x, C.y, { baseline: 'top' }); C.y += 12;
      }
      C.y += 7;
    });
  }

  function drawTagList(doc, C, ens, x, w, font, sectionTitle, label, raw) {
    var arr = listToArr(raw);
    if (!arr.length) return;
    sectionTitle(label);
    doc.setFont(font, 'normal'); doc.setFontSize(10); doc.setTextColor(55, 55, 55);
    var lines = doc.splitTextToSize(arr.join('   \u00b7   '), w);
    ens(lines.length * 13); doc.text(lines, x, C.y, { baseline: 'top' }); C.y += lines.length * 13 + 8;
  }

  // ----- two-column vector layout (Sidebar template) -----
  function drawSidebar(doc) {
    var pageW = doc.internal.pageSize.getWidth();
    var pageH = doc.internal.pageSize.getHeight();
    var accent = prefs.color, aRGB = toRGB(accent);
    var sideW = 200, pad = 22;
    var font = 'helvetica';

    function sideBg() { doc.setFillColor(aRGB[0], aRGB[1], aRGB[2]); doc.rect(0, 0, sideW, pageH, 'F'); }
    sideBg();

    // ----- left column -----
    var lx = pad, lw = sideW - pad * 2, ly = 40;
    if (prefs.photo) {
      try { var pw = 100; doc.addImage(prefs.photo, imgFormat(prefs.photo), sideW / 2 - pw / 2, ly, pw, pw); ly += pw + 16; } catch (e) {}
    }
    doc.setFont(font, 'bold'); doc.setFontSize(18); doc.setTextColor(255, 255, 255);
    var nm = doc.splitTextToSize(state.fullName || 'Your Name', lw);
    doc.text(nm, sideW / 2, ly, { align: 'center', baseline: 'top' }); ly += nm.length * 21;
    if (state.jobTitle) {
      doc.setFont(font, 'normal'); doc.setFontSize(10.5); doc.setTextColor(238, 242, 255);
      var jt = doc.splitTextToSize(state.jobTitle, lw);
      doc.text(jt, sideW / 2, ly, { align: 'center', baseline: 'top' }); ly += jt.length * 13;
    }
    ly += 12;

    function sideTitle(t) {
      doc.setFont(font, 'bold'); doc.setFontSize(10.5); doc.setTextColor(255, 255, 255);
      doc.text(t.toUpperCase(), lx, ly, { baseline: 'top' }); ly += 13;
      doc.setDrawColor(255, 255, 255); doc.setLineWidth(0.5); doc.line(lx, ly, lx + lw, ly); ly += 8;
    }
    function sideLines(arr, bullet) {
      doc.setFont(font, 'normal'); doc.setFontSize(9); doc.setTextColor(240, 244, 255);
      arr.forEach(function (it) {
        var l = doc.splitTextToSize((bullet ? '\u2022  ' : '') + it, lw);
        doc.text(l, lx, ly, { baseline: 'top' }); ly += l.length * 11 + 2;
      });
      ly += 8;
    }
    var ci = contactArr();
    if (ci.length) { sideTitle('Contact'); sideLines(ci, false); }
    var sk = listToArr(state.skills);
    if (sk.length) { sideTitle('Skills'); sideLines(sk, true); }
    var lg = listToArr(state.languages);
    if (lg.length) { sideTitle('Languages'); sideLines(lg, true); }

    // ----- right column -----
    var rx = sideW + 26, rw = pageW - rx - 40;
    var C = { y: 44 };
    function ens(h) { if (C.y + h > pageH - 40) { doc.addPage(); sideBg(); C.y = 44; } }
    function rSection(t) {
      ens(34);
      doc.setFont(font, 'bold'); doc.setFontSize(11.5); doc.setTextColor(aRGB[0], aRGB[1], aRGB[2]);
      doc.text(t.toUpperCase(), rx, C.y, { baseline: 'top' }); C.y += 14;
      doc.setDrawColor(226, 232, 240); doc.setLineWidth(0.7); doc.line(rx, C.y, rx + rw, C.y); C.y += 10;
      doc.setTextColor(45, 45, 45);
    }

    if (state.summary) {
      rSection('Summary');
      doc.setFont(font, 'normal'); doc.setFontSize(10.2); doc.setTextColor(55, 55, 55);
      var sm = doc.splitTextToSize(state.summary, rw);
      ens(sm.length * 13); doc.text(sm, rx, C.y, { baseline: 'top' }); C.y += sm.length * 13 + 8;
    }
    if (state.experience.length) { rSection('Experience'); drawEntries(doc, C, ens, rx, rw, font, false, state.experience, 'role', 'company'); }
    if (state.education.length) { rSection('Education'); drawEntries(doc, C, ens, rx, rw, font, false, state.education, 'degree', 'school'); }
    if (state.projects.length) { rSection('Projects'); drawProjects(doc, C, ens, rx, rw, font, false); }
    if (state.certifications.length) { rSection('Certifications'); drawCerts(doc, C, ens, rx, rw, font, false); }
  }

  // plain-text contact list (no emoji — keeps PDF fonts clean)
  function contactArr() {
    var a = [];
    if (state.email) a.push(state.email);
    if (state.phone) a.push(state.phone);
    if (state.location) a.push(state.location);
    if (state.website) a.push(state.website);
    if (state.linkedin) a.push(state.linkedin);
    return a;
  }

  // Vector "print to PDF" — uses the browser's native print to Save as PDF.
  function printPDF() {
    var prevTitle = document.title;
    document.title = fileBase() + '_resume';
    window.addEventListener('afterprint', function restore() {
      document.title = prevTitle;
      window.removeEventListener('afterprint', restore);
    });
    window.print();
  }

  /* ---------- init ---------- */
  load();
  bindSimpleFields();
  setupAddButtons();
  ['experience', 'education', 'projects', 'certifications'].forEach(renderSectionEditor);
  setupAccordions();
  setupPhoto();
  setupToolbar();
  render();
})();
