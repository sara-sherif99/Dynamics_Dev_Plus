(async function waitForXrm(attempts = 10) {
  if (typeof Xrm !== "undefined" && Xrm.Page && Xrm.Page.getAttribute) {
    try {
      if (Xrm.Page.data) {
        var processId = Xrm.Page.data.process.getActiveProcess()?.getId();
        if (processId) {
          getBPFStages(processId);
        } else {
          alert("❌ This record does not have BPF applied to it.");
        }
      } else {
        alert("❌ Make sure you're on a record form.");
      }
    } catch (e) {
      alert("❌ Script error: " + e.message);
    }
  } else if (attempts > 0) {
    setTimeout(() => waitForXrm(attempts - 1), 1000);
  } else {
    alert("❌ Make sure you're on a record form.");
  }
})();

function getBPFStages(processId) {
  const result = Xrm.WebApi.retrieveMultipleRecords("processstage", `?$filter=processid/workflowid eq ${processId}&$select=stagename`).then(
    function success(result) {
      const output = result.entities.map(
        (s) => `${s.stagename}: "${s.processstageid}"`
      ).join('\n');
      showOverlay(`✅ BPF Stages IDs:\n\n${output}`);
    },
    function (error) {
      console.log(error.message);
    }
  );
}

function showOverlay(msg) {
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
    padding: "50px 50px",
    borderRadius: "8px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
    fontSize: "18px",
    fontFamily: "Segoe UI, Arial, sans-serif",
    maxWidth: "500px",
    maxHeight: "80vh",
    overflowY: "auto",
    zIndex: "9999",
    whiteSpace: "pre-wrap",
    textAlign: "left",
    position: "fixed"
  });

  const closeBtn = document.createElement("button");
  closeBtn.textContent = "✖";
  Object.assign(closeBtn.style, {
    position: "absolute",
    top: "10px",
    right: "10px",
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

  overlay.appendChild(closeBtn);

  const messageDiv = document.createElement("div");
  messageDiv.textContent = msg;
  Object.assign(messageDiv.style, {
    fontSize: "16px",
    color: "#333",
    fontFamily: "Segoe UI, Arial, sans-serif",
  });
  overlay.appendChild(messageDiv);

  document.body.appendChild(backdrop);
  document.body.appendChild(overlay);
}

