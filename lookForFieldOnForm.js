(async function waitForXrm(attempts = 10) {
  if (typeof Xrm !== "undefined" && Xrm.Page && Xrm.Page.getAttribute) {
    try {
      Xrm = getXRM();
      if (Xrm.Page.data) {
        showOverlayWithInput("Enter Field Schema Name",
          focusOnField
        )
      }
      else {
        alert("❌ Make sure you're on a record form.");
      }
    } catch (e) {
      alert("❌ Script error: " + e.message);
    }
  } else if (attempts > 0) {
    setTimeout(() => waitForXrm(attempts - 1), 1000);
  } else {
    alert("❌ Xrm never became available. Make sure you're on a record form.");
  }
})();

function getXRM() {
    if (isUCI()) {
        return window.Xrm;
    }
    else {
        return $("iframe").filter(function () {
            return $(this).css("visibility") == "visible"
        })[0].contentWindow.Xrm;
    }
}

function isUCI() {
    var baseUrl = Xrm.Utility.getGlobalContext().getCurrentAppUrl();
    if (baseUrl.includes("appid"))
        return true;
    else
        false;
}

function focusOnField(fieldName) {
  const formContext = Xrm.Page;
  const control = formContext.getControl(fieldName);

  if (!control) {
    alert(`Field '${fieldName}' not found on the form.`);
    return;
  }
  const section = control.getParent();
  const tab = section.getParent();

  if (tab && typeof tab.setVisible === "function") {
    tab.setVisible(true);
    tab.setFocus();
  }
  if (section.getVisible() == false) {
    section.setVisible(true);
  }
  control.setVisible(true);
  control.setFocus();
  let attempts = 0;

  const intervalId = setInterval(() => {
    try {
      const input = document.querySelector(
        `[data-id="${fieldName}"] input, [data-id="${fieldName}"] select, [data-id="${fieldName}"] textarea, [data-id="${fieldName}"] div`
      );

      if (input) {
        input.scrollIntoView({ behavior: "smooth", block: "center" });

        const originalBg = input.style.backgroundColor;
        input.style.transition = "background-color 0.3s ease";
        input.style.backgroundColor = "#fff3b0";

        setTimeout(() => {
          input.style.backgroundColor = originalBg || "";
        }, 2000);

        clearInterval(intervalId);
      }

      if (++attempts >= 50) {
        clearInterval(intervalId);
      }
    } catch (e) {
      clearInterval(intervalId);
    }
  }, 100);
}

function showOverlayWithInput(promptMsg, onConfirm) {
  const existingBox = document.getElementById("d365-overlay-box");
  const existingBackdrop = document.getElementById("d365-overlay-backdrop");
  if (existingBox) existingBox.remove();
  if (existingBackdrop) existingBackdrop.remove();

  const backdrop = document.createElement("div");
  backdrop.id = "d365-overlay-backdrop";
  Object.assign(backdrop.style, {
    position: "fixed",
    top: "0", left: "0", width: "100%", height: "100%",
    background: "rgba(0, 0, 0, 0.3)",
    zIndex: "9998"
  });

  const overlay = document.createElement("div");
    overlay.id = "d365-overlay-box";
    Object.assign(overlay.style, {
        position: "fixed",
        top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        background: "#ffffff",
        color: "#333",
        padding: "0px 30px 30px 30px",
        borderRadius: "8px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
        fontSize: "16px",
        fontFamily: "Segoe UI, Arial, sans-serif",
        maxWidth: "90vw",
        maxHeight: "80vh",
        overflowY: "auto",
        zIndex: "9999",
        textAlign: "left"
    });

    const headerRow = document.createElement("div");
    Object.assign(headerRow.style, {
        position: "sticky",
        top: "0",
        background: "#fff",
        padding: "10px 0px",
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        zIndex: "10000"
    });

    const closeBtn = document.createElement("button");
    closeBtn.textContent = "✖";
    Object.assign(closeBtn.style, {
        background: "transparent",
        border: "none",
        color: "#666",
        fontSize: "18px",
        cursor: "pointer"
    });
    closeBtn.onclick = () => {
        overlay.remove();
        backdrop.remove();
    };

    headerRow.appendChild(closeBtn);
    overlay.appendChild(headerRow);

  const messageDiv = document.createElement("div");
  messageDiv.textContent = promptMsg;
  overlay.appendChild(messageDiv);

  const input = document.createElement("input");
  input.type = "text";
  Object.assign(input.style, {
    width: "100%",
    fontSize: "16px",
    color: "#333",
    fontFamily: "Segoe UI, Arial, sans-serif",
    padding: "12px",
    marginTop: "16px",
    marginBottom: "24px",
    boxSizing: "border-box",
    border: "1px solid #ccc",
    borderRadius: "4px"
  });

  overlay.appendChild(input);

  const btnContainer = document.createElement("div");
  Object.assign(btnContainer.style, {
    textAlign: "right"
  });

  const okBtn = document.createElement("button");
  okBtn.textContent = "OK";
  Object.assign(okBtn.style, {
    padding: "8px 16px",
    backgroundColor: "#508C9B",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer"
  });
  okBtn.onclick = () => {
    const value = input.value.trim();
    if (value) {
      onConfirm(value);
      overlay.remove();
      backdrop.remove();
    } else {
      alert("Please enter a value.");
    }
  };

  btnContainer.appendChild(okBtn);
  overlay.appendChild(btnContainer);

  document.body.appendChild(backdrop);
  document.body.appendChild(overlay);
}

