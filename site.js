/* Helios Equipment Services: demo website behaviour */
(function () {
  "use strict";

  /* 1. Return URLs: send visitors to thanks.html next to this page (works on any http/https host) */
  var leadRet = document.getElementById("leadRet");
  var caseRet = document.getElementById("caseRet");
  if ((location.protocol === "http:" || location.protocol === "https:") && leadRet && caseRet) {
    var base = new URL("thanks.html", location.href).href;
    leadRet.value = base + "?from=enquiry";
    caseRet.value = base + "?from=service";
  }

  /* 2. Support address: edit data-support-email on <body> */
  var mailLink = document.getElementById("supportMail");
  if (mailLink) {
    var addr = document.body.getAttribute("data-support-email");
    mailLink.textContent = addr;
    mailLink.href = "mailto:" + addr + "?subject=" + encodeURIComponent("Service request");
  }

  /* 3. Mobile menu */
  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("siteNav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* 4. Highlight the nav link of the section in view */
  if ("IntersectionObserver" in window && nav) {
    var links = {};
    nav.querySelectorAll("a").forEach(function (a) { links[a.getAttribute("href").slice(1)] = a; });
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && links[entry.target.id]) {
          Object.keys(links).forEach(function (k) { links[k].classList.remove("current"); links[k].removeAttribute("aria-current"); });
          links[entry.target.id].classList.add("current");
          links[entry.target.id].setAttribute("aria-current", "true");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(links).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) { observer.observe(section); }
    });
  }

  /* 5. Cooling circuit: show what each part does */
  var title = document.getElementById("circuitTitle");
  var text = document.getElementById("circuitText");
  var defaultTitle = title ? title.textContent : "";
  var defaultText = text ? text.textContent : "";
  var nodes = document.querySelectorAll("#circuit .node");
  function showNode(node) {
    nodes.forEach(function (n) { n.classList.remove("active"); });
    node.classList.add("active");
    title.textContent = node.getAttribute("data-title");
    text.textContent = node.getAttribute("data-text");
  }
  nodes.forEach(function (node) {
    node.setAttribute("aria-label", node.getAttribute("data-title") + ": " + node.getAttribute("data-text"));
    node.addEventListener("click", function () { showNode(node); });
    node.addEventListener("focus", function () { showNode(node); });
    node.addEventListener("mouseenter", function () { showNode(node); });
    node.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); showNode(node); }
    });
  });
  var circuit = document.getElementById("circuit");
  if (circuit) {
    circuit.addEventListener("mouseleave", function () {
      if (!circuit.contains(document.activeElement)) {
        nodes.forEach(function (n) { n.classList.remove("active"); });
        title.textContent = defaultTitle;
        text.textContent = defaultText;
      }
    });
  }

  /* 6. Equipment tabs with arrow-key support (re-run after the JSON renders new tabs) */
  function initTabs() {
    var tabs = Array.prototype.slice.call(document.querySelectorAll('.tabs [role="tab"]'));
    function selectTab(tab, focus) {
      tabs.forEach(function (t) {
        var selected = t === tab;
        t.setAttribute("aria-selected", String(selected));
        t.tabIndex = selected ? 0 : -1;
        document.getElementById(t.getAttribute("aria-controls")).hidden = !selected;
      });
      if (focus) { tab.focus(); }
    }
    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () { selectTab(tab, false); });
      tab.addEventListener("keydown", function (e) {
        var next = null;
        if (e.key === "ArrowRight") { next = tabs[(i + 1) % tabs.length]; }
        if (e.key === "ArrowLeft") { next = tabs[(i - 1 + tabs.length) % tabs.length]; }
        if (e.key === "Home") { next = tabs[0]; }
        if (e.key === "End") { next = tabs[tabs.length - 1]; }
        if (next) { e.preventDefault(); selectTab(next, true); }
      });
    });
  }
  initTabs();

  /* 7. "Enquire about..." fills the equipment type on the sales form (delegated, so JSON-built buttons work too) */
  document.addEventListener("click", function (e) {
    var btn = e.target.closest ? e.target.closest(".enquire") : null;
    if (!btn) { return; }
    var equipmentInput = document.getElementById("00NjV00000l33xZ");
    if (equipmentInput) { equipmentInput.value = btn.getAttribute("data-equipment"); }
    document.getElementById("enquiry").scrollIntoView({ behavior: "smooth" });
    window.setTimeout(function () {
      var first = document.getElementById("first_name");
      if (first) { first.focus({ preventScroll: true }); }
    }, 500);
  });

  /* 8. Coverage explainer */
  var statuses = {
    covered: { title: "Covered: the visit is included", text: "Your plan is active for this unit. We confirm that before the engineer travels, so there are no surprises." },
    expired: { title: "Expired: the visit is chargeable", text: "Your plan ended before this request. We tell you the visit is chargeable before anyone drives to site, and we can send a renewal quote at the same time." },
    none: { title: "Not covered: the visit is chargeable", text: "No plan has been set up for this unit. We tell you the visit is chargeable up front, and we can add the unit to a plan afterwards." }
  };
  var card = document.getElementById("statusCard");
  var buttons = document.querySelectorAll(".segment button");
  buttons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var state = btn.getAttribute("data-state");
      buttons.forEach(function (b) { b.setAttribute("aria-pressed", String(b === btn)); });
      card.setAttribute("data-state", state);
      document.getElementById("statusTitle").textContent = statuses[state].title;
      document.getElementById("statusText").textContent = statuses[state].text;
    });
  });

  /* 9. Service form: adapt the hints to the type of request */
  var typeRadios = document.querySelectorAll('input[name="type"]');
  var descLabel = document.getElementById("descLabel");
  var descHint = document.getElementById("descHint");
  var subject = document.getElementById("subject");
  typeRadios.forEach(function (radio) {
    radio.addEventListener("change", function () {
      if (radio.value === "Billing") {
        descLabel.textContent = "What is your question? *";
        descHint.textContent = "Include the invoice number if you have it.";
        subject.placeholder = "For example, question about invoice 12345";
      } else {
        descLabel.textContent = "What happened? *";
        descHint.textContent = "Include the unit serial number if you have it.";
        subject.placeholder = "For example, chiller 3 trips overnight";
      }
    });
  });

  /* 10. Prevent double submits and show progress */
  document.querySelectorAll("form").forEach(function (form) {
    var button = form.querySelector('button[type="submit"]');
    if (!button) { return; }
    var label = button.textContent;
    form.addEventListener("submit", function () {
      button.disabled = true;
      button.textContent = "Sending...";
    });
    window.addEventListener("pageshow", function () {
      button.disabled = false;
      button.textContent = label;
    });
  });
  /* 11. Content from data/site-data.json (products, FAQ, regions).
     The static HTML stays as a fallback when the file cannot be loaded, for example when opened from disk. */
  function el(tag, props, kids) {
    var node = document.createElement(tag);
    Object.keys(props || {}).forEach(function (k) {
      if (k === "text") { node.textContent = props[k]; }
      else if (k === "hidden") { node.hidden = props[k]; }
      else { node.setAttribute(k, props[k]); }
    });
    (kids || []).forEach(function (kid) { node.appendChild(kid); });
    return node;
  }

  function renderProducts(products) {
    var tabsEl = document.querySelector(".tabs");
    var panelsEl = document.getElementById("productPanels");
    if (!tabsEl || !panelsEl || !products || !products.length) { return; }
    tabsEl.textContent = "";
    panelsEl.textContent = "";
    products.forEach(function (p, i) {
      var first = i === 0;
      tabsEl.appendChild(el("button", {
        role: "tab", id: "tab-" + p.id, "aria-selected": String(first),
        "aria-controls": "panel-" + p.id, tabindex: first ? "0" : "-1", text: p.name, type: "button"
      }));
      var specs = el("dl", { "class": "spec" });
      (p.specs || []).forEach(function (sp) {
        specs.appendChild(el("dt", { text: sp.label }));
        specs.appendChild(el("dd", { text: sp.value }));
      });
      var left = el("div", {}, [
        el("p", { "class": "lead", text: p.tagline }),
        el("p", { text: p.description }),
        el("button", { "class": "btn enquire", type: "button", "data-equipment": p.enquiryType, text: "Enquire about " + p.name.toLowerCase() })
      ]);
      var right = el("div", {}, [
        el("figure", { "class": "product-image" }, [
          el("img", { src: p.image, alt: p.imageAlt || p.name, width: "800", height: "600", loading: "lazy" })
        ]),
        specs
      ]);
      panelsEl.appendChild(el("div", {
        "class": "tab-panel", id: "panel-" + p.id, role: "tabpanel", "aria-labelledby": "tab-" + p.id, hidden: !first
      }, [left, right]));
    });
    initTabs();
  }

  function renderFaq(faqs) {
    var list = document.getElementById("faqList");
    if (!list || !faqs || !faqs.length) { return; }
    list.textContent = "";
    faqs.forEach(function (f) {
      list.appendChild(el("details", {}, [el("summary", { text: f.question }), el("p", { text: f.answer })]));
    });
  }

  function renderRegions(regions, billingNote) {
    var section = document.getElementById("regions");
    var list = document.getElementById("regionList");
    if (!section || !list || !regions || !regions.length) { return; }
    list.textContent = "";
    regions.forEach(function (r) {
      list.appendChild(el("div", { "class": "region-row" }, [
        el("h3", { text: r.name }),
        el("p", { text: r.countries }),
        el("p", { "class": "team", text: r.team })
      ]));
    });
    if (billingNote) { document.getElementById("regionNote").textContent = billingNote; }
    section.hidden = false;
  }

  if (window.fetch) {
    fetch("data/site-data.json")
      .then(function (res) { if (!res.ok) { throw new Error("HTTP " + res.status); } return res.json(); })
      .then(function (data) {
        renderProducts(data.products);
        renderFaq(data.faqs);
        renderRegions(data.regions, data.billingNote);
      })
      .catch(function () { /* keep the static content */ });
  }
})();
