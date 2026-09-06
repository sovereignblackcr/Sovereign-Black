(function () {
  "use strict";

  // Year in footer
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Header scroll state
  const header = document.getElementById("header");
  function updateHeader() {
    if (window.scrollY > 40) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  }
  window.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();

  // Mobile nav toggle
  const navToggle = document.getElementById("navToggle");
  const navMobile = document.getElementById("navMobile");

  if (navToggle && navMobile) {
    navToggle.addEventListener("click", function () {
      const isOpen = navMobile.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    });

    // Close mobile nav on link click
    navMobile.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navMobile.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", "Open menu");
      });
    });
  }

  // Smooth close of mobile menu on resize to desktop
  window.addEventListener("resize", function () {
    if (window.innerWidth > 980 && navMobile) {
      navMobile.classList.remove("open");
      if (navToggle) {
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", "Open menu");
      }
    }
  });

  // Form handling
  const form = document.getElementById("requestForm");
  const formSuccess = document.getElementById("formSuccess");
  const submitBtn = document.getElementById("submitBtn");
  const resetBtn = document.getElementById("resetForm");

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      // Basic validation
      const required = form.querySelectorAll("[required]");
      let valid = true;
      required.forEach(function (field) {
        if (!field.value.trim()) {
          valid = false;
          field.style.borderColor = "#b87333";
        } else {
          field.style.borderColor = "";
        }
      });

      const service = form.querySelector("#service");
      if (service && (service.value.includes("Coming Soon") || !service.value)) {
        valid = false;
        service.style.borderColor = "#b87333";
      }

      if (!valid) {
        alert("Please complete all required fields and select an available service.");
        return;
      }

      // Build payload
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
        submittedAt: new Date().toISOString()
      };

      // Disable button
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending…";
      }

      // Primary method: Formspree (user must replace FORM_ID)
      // Fallback: open mailto with prefilled body so the request is never lost
      const formspreeEndpoint = "https://formspree.io/f/YOUR_FORM_ID"; // ← replace after signup

      // Try Formspree first if configured; otherwise fall back to mailto
      if (formspreeEndpoint.includes("YOUR_FORM_ID")) {
        // Mailto fallback – works immediately without any third-party account
        const subject = encodeURIComponent("Sovereign Black Service Request – " + data.service);
        const body = encodeURIComponent(
          "New Service Request\n" +
          "==================\n\n" +
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

        // Show success UI after a short delay so the mailto can open
        setTimeout(function () {
          form.hidden = true;
          if (formSuccess) formSuccess.hidden = false;
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Submit Request";
          }
        }, 600);
      } else {
        // Real Formspree submission
        fetch(formspreeEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify(data)
        })
          .then(function (res) {
            if (!res.ok) throw new Error("Network response was not ok");
            form.hidden = true;
            if (formSuccess) formSuccess.hidden = false;
          })
          .catch(function () {
            // Ultimate fallback to mailto
            const subject = encodeURIComponent("Sovereign Black Service Request – " + data.service);
            const body = encodeURIComponent(JSON.stringify(data, null, 2));
            window.location.href = "mailto:sovereignblackcr@gmail.com?subject=" + subject + "&body=" + body;
            form.hidden = true;
            if (formSuccess) formSuccess.hidden = false;
          })
          .finally(function () {
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.textContent = "Submit Request";
            }
          });
      }
    });
  }

  if (resetBtn && form && formSuccess) {
    resetBtn.addEventListener("click", function () {
      form.reset();
      form.hidden = false;
      formSuccess.hidden = true;
      // Clear any error borders
      form.querySelectorAll("input, select, textarea").forEach(function (el) {
        el.style.borderColor = "";
      });
    });
  }

  // Prevent booking of coming-soon services even if somehow selected
  const serviceSelect = document.getElementById("service");
  if (serviceSelect) {
    serviceSelect.addEventListener("change", function () {
      if (this.value.includes("Coming Soon")) {
        this.value = "";
        alert("This service is not yet available. Please select Mobile Notary or Loan Signing.");
      }
    });
  }
})();
