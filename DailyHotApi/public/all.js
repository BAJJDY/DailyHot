(function () {
  var API_KEY = window.__API_KEY__ || "";

  function apiFetch(url, opts) {
    opts = opts || {};
    if (API_KEY) {
      opts.headers = Object.assign({}, opts.headers, { "X-Api-Key": API_KEY });
    }
    return fetch(url, opts);
  }

  var cards = document.querySelectorAll(".c[data-path]");
  var queue = Array.from(cards);
  var concurrency = 4;
  var running = 0;
  var onlineCount = 0;
  var offlineCount = 0;

  function updateStats() {
    var onlineEl = document.getElementById("stat-online");
    var offlineEl = document.getElementById("stat-offline");
    if (onlineEl) onlineEl.textContent = onlineCount;
    if (offlineEl) offlineEl.textContent = offlineCount;
  }

  function next() {
    while (running < concurrency && queue.length > 0) {
      var card = queue.shift();
      running++;
      check(card);
    }
  }

  function check(card) {
    var path = card.getAttribute("data-path");
    if (!path) { running--; next(); return; }
    var badge = card.querySelector(".c-st");
    var text = badge ? badge.querySelector("u") : null;
    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, 8000);
    apiFetch(path + "?limit=1", { signal: controller.signal })
      .then(function (r) {
        clearTimeout(timer);
        if (badge) {
          if (r.ok) {
            badge.classList.add("ok");
            onlineCount++;
          } else {
            badge.classList.add("err");
            offlineCount++;
          }
          if (text) text.textContent = r.status + "";
        }
        updateStats();
      })
      .catch(function () {
        clearTimeout(timer);
        if (badge) {
          badge.classList.add("err");
          if (text) text.textContent = "离线";
        }
        offlineCount++;
        updateStats();
      })
      .then(function () { running--; next(); });
  }

  next();

  window.openModal = function (path, name) {
    var modal = document.getElementById("modal");
    document.getElementById("modal-title").textContent = name;
    document.getElementById("modal-body").innerHTML =
      '<div class="ld"><div class="sp"></div><span>检测中</span></div>';
    modal.classList.add("active");

    var startTime = Date.now();
    apiFetch(path + "?skipEnc=1")
      .then(function (r) {
        var elapsed = Date.now() - startTime;
        var status = r.status;
        var statusText = r.statusText;
        var ok = r.ok;

        return r.json().then(function (res) {
          return { ok: ok, status: status, statusText: statusText, elapsed: elapsed, res: res };
        }).catch(function () {
          return { ok: ok, status: status, statusText: statusText, elapsed: elapsed, res: null };
        });
      })
      .then(function (result) {
        var ok = result.ok;
        var status = result.status;
        var elapsed = result.elapsed;
        var res = result.res;

        var body = document.getElementById("modal-body");
        var total = (res && res.data) ? res.data.length : 0;
        var fromCache = (res && res.fromCache) ? true : false;
        var updateTime = (res && res.updateTime) ? new Date(res.updateTime).toLocaleString() : "--";

        var statusClass = ok ? "ok" : "err";
        var statusLabel = ok ? "正常" : "异常";
        var statusIcon = ok ? "&#10003;" : "&#10005;";

        body.innerHTML =
          '<div class="rs ' + statusClass + '">' +
            '<div class="rs-ic">' + statusIcon + '</div>' +
            '<h4>' + statusLabel + '</h4>' +
          '</div>' +
          '<div class="il">' +
            '<div class="ir"><span class="lb">接口路径</span><span class="vl">' + path + '</span></div>' +
            '<div class="ir"><span class="lb">HTTP 状态</span><span class="vl"><span class="sc ' + statusClass + '">' + status + '</span></span></div>' +
            '<div class="ir"><span class="lb">响应耗时</span><span class="vl">' + elapsed + ' ms</span></div>' +
            '<div class="ir"><span class="lb">数据条数</span><span class="vl">' + total + ' 条</span></div>' +
            '<div class="ir"><span class="lb">数据来源</span><span class="vl">' + (fromCache ? '缓存' : '实时请求') + '</span></div>' +
            '<div class="ir"><span class="lb">更新时间</span><span class="vl">' + updateTime + '</span></div>' +
          '</div>';
      })
      .catch(function () {
        var elapsed = Date.now() - startTime;
        var body = document.getElementById("modal-body");
        body.innerHTML =
          '<div class="rs err">' +
            '<div class="rs-ic">&#10005;</div>' +
            '<h4>离线</h4>' +
          '</div>' +
          '<div class="il">' +
            '<div class="ir"><span class="lb">接口路径</span><span class="vl">' + path + '</span></div>' +
            '<div class="ir"><span class="lb">HTTP 状态</span><span class="vl">请求失败</span></div>' +
            '<div class="ir"><span class="lb">响应耗时</span><span class="vl">' + elapsed + ' ms</span></div>' +
          '</div>';
      });
  };

  window.closeModal = function (e) {
    if (!e || e.target === document.getElementById("modal") ||
        (e.target && e.target.tagName === "BUTTON")) {
      document.getElementById("modal").classList.remove("active");
    }
  };

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") window.closeModal();
  });
})();
