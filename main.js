(function () {
  "use strict";

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const header = document.getElementById("header");
  function updateHeader() {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 28);
  }
  window.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();

  // Mobile navigation
  const navToggle = document.getElementById("navToggle");
  const navMobile = document.getElementById("navMobile");
  if (navToggle && navMobile) {
    navToggle.addEventListener("click", function () {
      const isOpen = navMobile.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
      navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    });
    navMobile.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navMobile.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", "Open menu");
      });
    });
  }

  window.addEventListener("resize", function () {
    if (window.innerWidth > 980 && navMobile) {
      navMobile.classList.remove("open");
      if (navToggle) {
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", "Open menu");
      }
    }
  });

  // Prevent selecting unavailable services.
  const serviceSelect = document.getElementById("service");
  if (serviceSelect) {
    serviceSelect.addEventListener("change", function () {
      if (this.value.includes("Coming Soon")) {
        this.value = "";
        alert("This service is not yet available. Please select Mobile Notary or Loan Signing.");
      }
    });
  }

  // Set the minimum requested date to today.
  const dateField = document.getElementById("preferredDate");
  if (dateField) {
    const now = new Date();
    const localToday = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString().slice(0, 10);
    dateField.min = localToday;
  }

  // Request form. Formspree can be activated later by replacing YOUR_FORM_ID.
  const form = document.getElementById("requestForm");
  const formSuccess = document.getElementById("formSuccess");
  const submitBtn = document.getElementById("submitBtn");
  const resetBtn = document.getElementById("resetForm");

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      let valid = true;
      form.querySelectorAll("[required]").forEach(function (field) {
        const empty = !String(field.value || "").trim();
        field.setAttribute("aria-invalid", empty ? "true" : "false");
        field.style.borderColor = empty ? "#a66b45" : "";
        if (empty) valid = false;
      });

      const service = form.querySelector("#service");
      if (service && (!service.value || service.value.includes("Coming Soon"))) {
        valid = false;
        service.style.borderColor = "#a66b45";
        service.setAttribute("aria-invalid", "true");
      }

      if (!valid) {
        const firstInvalid = form.querySelector('[aria-invalid="true"]');
        if (firstInvalid) firstInvalid.focus();
        alert("Please complete the required fields and select an available service.");
        return;
      }

      const data = {
        fullName: form.fullName.value.trim(),
        phone: form.phone.value.trim(),
        email: form.email.value.trim(),
        service: form.service.value,
        preferredDate: form.preferredDate.value || "Not specified",
        preferredTime: form.preferredTime.value.trim() || "Not specified",
        location: form.location.value.trim(),
        signers: form.signers.value || "N/A",
        documents: form.documents.value.trim() || "N/A",
        description: form.description.value.trim() || "N/A",
        contactMethod: form.contactMethod.value,
        submittedAt: new Date().toLocaleString()
      };

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = "Preparing Request…";
      }

      const formspreeEndpoint = "https://formspree.io/f/YOUR_FORM_ID";

      function showSuccess() {
        form.hidden = true;
        if (formSuccess) formSuccess.hidden = false;
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = 'Request Service <span>↗</span>';
        }
      }

      function openMailto() {
        const subject = encodeURIComponent("Rison Concierge Service Request — " + data.service);
        const body = encodeURIComponent(
          "RISON CONCIERGE — SERVICE REQUEST\n" +
          "================================\n\n" +
          "Name: " + data.fullName + "\n" +
          "Phone: " + data.phone + "\n" +
          "Email: " + data.email + "\n" +
          "Service: " + data.service + "\n" +
          "Preferred Date: " + data.preferredDate + "\n" +
          "Preferred Time: " + data.preferredTime + "\n" +
          "Location / City: " + data.location + "\n" +
          "Number of Signers: " + data.signers + "\n" +
          "Documents: " + data.documents + "\n" +
          "Preferred Contact: " + data.contactMethod + "\n\n" +
          "Description:\n" + data.description + "\n\n" +
          "Submitted: " + data.submittedAt
        );
        window.location.href = "mailto:sovereignblackcr@gmail.com?subject=" + subject + "&body=" + body;
        setTimeout(showSuccess, 700);
      }

      if (formspreeEndpoint.includes("YOUR_FORM_ID")) {
        openMailto();
      } else {
        fetch(formspreeEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify(data)
        })
          .then(function (res) {
            if (!res.ok) throw new Error("Submission failed");
            showSuccess();
          })
          .catch(openMailto);
      }
    });
  }

  if (resetBtn && form && formSuccess) {
    resetBtn.addEventListener("click", function () {
      form.reset();
      form.hidden = false;
      formSuccess.hidden = true;
      form.querySelectorAll("input, select, textarea").forEach(function (el) {
        el.style.borderColor = "";
        el.removeAttribute("aria-invalid");
      });
    });
  }
})();
