/* "Adjust glass": blur + transparency, remembered per browser. */
(function () {
  var K = 'aria_glass', root = document.documentElement, s = { blur: 18, a: 10 };
  try { s = Object.assign(s, JSON.parse(localStorage.getItem(K) || '{}')); } catch (e) {}
  function apply() { root.style.setProperty('--glass-blur', s.blur + 'px'); root.style.setProperty('--glass-a', s.a / 100); }
  function save() { try { localStorage.setItem(K, JSON.stringify(s)); } catch (e) {} }
  apply();
  document.addEventListener('DOMContentLoaded', function () {
    var box = document.createElement('div'); box.className = 'glass-ctl';
    box.innerHTML = '<div class="glass-pop"><label>Blur<input type="range" min="0" max="40" value="' + s.blur + '" id="gB"></label>' +
      '<label>Transparency<input type="range" min="2" max="40" value="' + s.a + '" id="gA"></label></div>' +
      '<button type="button" aria-expanded="false">Adjust glass</button>';
    document.body.appendChild(box);
    var btn = box.querySelector('button');
    btn.onclick = function () { var o = box.classList.toggle('open'); btn.setAttribute('aria-expanded', o); };
    box.querySelector('#gB').oninput = function (e) { s.blur = +e.target.value; apply(); save(); };
    box.querySelector('#gA').oninput = function (e) { s.a = +e.target.value; apply(); save(); };
  });
})();
