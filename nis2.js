/* Споделена логика за заглавния нав.
   Изгражда едно падащо меню „☰ Меню“ с всички страници, групирани като в index.html.
   Това е единственият източник на менюто — всяка страница получава идентичен нав. */
(function () {
  var MENU = [
    { title: "Портал", links: [
      ["index.html", "🏠 Начало"]
    ]},
    { title: "Запознаване със закона", links: [
      ["overview.html", "📋 Преглед на промените"],
      ["comparison.html", "🔍 Сравнение на текста"],
      ["training.html", "🎬 Модули (презентация)"]
    ]},
    { title: "Оценка и съответствие", links: [
      ["gap-analysis.html", "✅ GAP анализ"],
      ["isms.html", "📚 СУИС (ISMS) — документи"],
      ["crosswalk.html", "🧭 Crosswalk ISO 27001 ↔ NIS 2"]
    ]},
    { title: "Инструменти за прилагане", links: [
      ["risk-matrix.html", "📊 Анализ на риска"],
      ["incident-report.html", "🚨 Управление на инциденти"],
      ["continuity.html", "🔄 Непрекъсваемост на дейността"],
      ["supply-chain.html", "🔗 Сигурност на веригата"],
      ["supplier-register.html", "🏭 Регистър на доставчиците"],
      ["access-crypto.html", "🔐 Достъп и криптография"],
      ["cyber-hygiene.html", "🎓 Киберхигиена и обучение"],
      ["improvement.html", "📈 Непрекъснато подобрение"]
    ]},
    { title: "Изкуствен интелект", links: [
      ["nis2-ai.html", "🤖 NIS 2 и изкуственият интелект"],
      ["ai-inventory.html", "🧾 AI-BOM — инвентар на ИИ"],
      ["nhi-register.html", "🪪 Регистър на NHI"],
      ["ai-training.html", "🎭 Обучение: deepfakes и AI"],
      ["identity-ai.html", "🎤 Идентичността в ерата на AI (презентация)"],
      ["ai-security-trends.html", "🛰 AI сигурност: тенденции и управление"],
      ["document.html?doc=ai-use-policy", "📄 Политика за ползване на AI"]
    ]}
  ];

  function curPath() {
    var p = location.pathname.split('/').pop() || 'index.html';
    return p === '' ? 'index.html' : p;
  }
  function isActive(href, pathOnly, docId) {
    var hp = href.split('?')[0];
    var hq = href.indexOf('?doc=') > -1 ? href.split('?doc=')[1] : null;
    if (hq) return pathOnly === 'document.html' && docId === hq;   // конкретен документ
    return hp === pathOnly;                                         // обикновена страница (без значение query)
  }

  function buildMenu(nav) {
    var pathOnly = curPath();
    var docId = pathOnly === 'document.html' ? new URLSearchParams(location.search).get('doc') : null;
    nav.innerHTML = '';

    var dd = document.createElement('div'); dd.className = 'site-dd';
    var btn = document.createElement('button'); btn.className = 'site-ddbtn menu-btn'; btn.type = 'button'; btn.textContent = '☰ Меню';
    var menu = document.createElement('div'); menu.className = 'site-ddmenu mega';

    var anyActive = false;
    MENU.forEach(function (g) {
      var h = document.createElement('div'); h.className = 'ddhead'; h.textContent = g.title; menu.appendChild(h);
      g.links.forEach(function (l) {
        var a = document.createElement('a'); a.href = l[0]; a.textContent = l[1];
        if (isActive(l[0], pathOnly, docId)) { a.classList.add('active'); anyActive = true; }
        menu.appendChild(a);
      });
    });
    // Документните страници (document.html?doc=...) подсветяват СУИС, ако не са изрично в менюто.
    if (!anyActive && pathOnly === 'document.html') {
      var ismsLink = menu.querySelector('a[href="isms.html"]');
      if (ismsLink) { ismsLink.classList.add('active'); anyActive = true; }
    }
    if (anyActive) btn.classList.add('active');

    dd.appendChild(btn); dd.appendChild(menu); nav.appendChild(dd);

    btn.addEventListener('click', function (e) { e.stopPropagation(); dd.classList.toggle('open'); });
    document.addEventListener('click', function () { dd.classList.remove('open'); });
    menu.addEventListener('click', function (e) { e.stopPropagation(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') dd.classList.remove('open'); });
  }

  function init() {
    var nav = document.querySelector('.sitebar .sitenav');
    if (nav) buildMenu(nav);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
