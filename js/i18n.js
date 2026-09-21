/* ==========================================================
   i18n — легка багатомовність без збірки.

   Як це працює
   - Українська — мова за замовчуванням, її текст лежить прямо в index.html
     (добре для SEO). Скрипт сам збирає його у словник `uk`.
   - Для елементів з data-i18n="ключ" підставляється переклад з словника.
   - Для атрибутів: data-i18n-attr="aria-label:ключ;alt:ключ2".
   - Ключі "meta.title" та "meta.description" перекладають <title> і meta description.

   Як додати мову (пізніше)
   1. Створіть js/lang/en.js такого вигляду:
        window.PORTFOLIO_LANGS = window.PORTFOLIO_LANGS || {};
        window.PORTFOLIO_LANGS.en = { "nav.projects": "Projects", ... };
      Для російської — так само, файл js/lang/ru.js та ключ `ru`.
   2. Підключіть файл у index.html ПЕРЕД <script src="js/i18n.js">.
   3. Перемикач мов у шапці з'явиться автоматично.
   Ключі, яких немає в словнику, показуються українською.
   ========================================================== */
(function () {
  'use strict';

  var BASE = 'uk';
  var LABELS = { uk: 'UA', en: 'EN', ru: 'RU' };
  var dict = { uk: {} };
  var registered = window.PORTFOLIO_LANGS || {};
  Object.keys(registered).forEach(function (k) { dict[k] = registered[k]; });

  var root = document.documentElement;
  var descMeta = document.querySelector('meta[name="description"]');

  function attrPairs(el) {
    var raw = el.getAttribute('data-i18n-attr');
    if (!raw) return [];
    return raw.split(';').map(function (p) {
      var i = p.indexOf(':');
      return [p.slice(0, i).trim(), p.slice(i + 1).trim()];
    });
  }

  // 1. Збираємо базовий (український) словник із розмітки
  document.querySelectorAll('[data-i18n]').forEach(function (el) {
    dict[BASE][el.getAttribute('data-i18n')] = el.innerHTML;
  });
  document.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
    attrPairs(el).forEach(function (pair) { dict[BASE][pair[1]] = el.getAttribute(pair[0]); });
  });
  dict[BASE]['meta.title'] = document.title;
  if (descMeta) dict[BASE]['meta.description'] = descMeta.getAttribute('content');

  function t(lang, key) {
    var d = dict[lang];
    return d && d[key] != null ? d[key] : dict[BASE][key];
  }

  function apply(lang) {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var v = t(lang, el.getAttribute('data-i18n'));
      if (v != null) el.innerHTML = v;
    });
    document.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
      attrPairs(el).forEach(function (pair) {
        var v = t(lang, pair[1]);
        if (v != null) el.setAttribute(pair[0], v);
      });
    });
    var title = t(lang, 'meta.title');
    if (title) document.title = title;
    var desc = t(lang, 'meta.description');
    if (desc && descMeta) descMeta.setAttribute('content', desc);
    root.setAttribute('lang', lang);
  }

  function setLang(lang) {
    if (!dict[lang]) lang = BASE;
    apply(lang);
    try { localStorage.setItem('lang', lang); } catch (e) {}
    var box = document.getElementById('lang');
    if (box) box.querySelectorAll('button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.lang === lang));
    });
  }

  // 2. Перемикач мов (лише якщо є більше однієї мови)
  var langs = Object.keys(dict);
  var box = document.getElementById('lang');
  if (box && langs.length > 1) {
    box.hidden = false;
    langs.forEach(function (l) {
      var b = document.createElement('button');
      b.type = 'button';
      b.dataset.lang = l;
      b.textContent = LABELS[l] || l.toUpperCase();
      b.addEventListener('click', function () { setLang(l); });
      box.appendChild(b);
    });
  }

  var saved = null;
  try { saved = localStorage.getItem('lang'); } catch (e) {}
  setLang(saved && dict[saved] ? saved : BASE);

  window.PortfolioI18n = { setLang: setLang };
})();
