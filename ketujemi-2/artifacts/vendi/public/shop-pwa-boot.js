/** Runs before the React bundle — per-shop manifest so install is the shop, not KetuJemi. */
(function () {
  var m = location.pathname.match(/^\/dyqani\/([^/?#]+)/i);
  if (!m) return;
  var slug = decodeURIComponent(m[1].replace(/\+/g, " "));
  var manifestUrl = "/api/shops/" + encodeURIComponent(slug) + "/manifest.webmanifest";

  document.querySelectorAll('link[rel="manifest"]').forEach(function (el) {
    el.parentNode && el.parentNode.removeChild(el);
  });

  var link = document.createElement("link");
  link.rel = "manifest";
  link.href = manifestUrl;
  document.head.appendChild(link);

  function setMeta(name, content) {
    if (!content) return;
    var el = document.querySelector('meta[name="' + name + '"]');
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute("name", name);
      document.head.appendChild(el);
    }
    el.setAttribute("content", content);
  }

  function setAppleIcon(href) {
    if (!href) return;
    var el = document.querySelector('link[rel="apple-touch-icon"]');
    if (!el) {
      el = document.createElement("link");
      el.setAttribute("rel", "apple-touch-icon");
      document.head.appendChild(el);
    }
    el.setAttribute("href", href);
  }

  fetch(manifestUrl, { credentials: "same-origin" })
    .then(function (r) {
      return r.ok ? r.json() : null;
    })
    .then(function (manifest) {
      if (!manifest) return;
      if (manifest.name) document.title = manifest.name;
      setMeta("apple-mobile-web-app-title", manifest.short_name || manifest.name);
      setMeta("application-name", manifest.short_name || manifest.name);
      var icon = manifest.icons && manifest.icons[0] && manifest.icons[0].src;
      if (icon) setAppleIcon(icon);
    })
    .catch(function () {});
})();
