(async function waitForXrm(attempts = 10) {
    if (typeof Xrm !== "undefined" && Xrm.Page && Xrm.Page.getAttribute) {
        try {
            Xrm = getXRM();
            if (Xrm.Page.data) {
                showTabSelectorOverlay();
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

function focusOnTab(tab) {
    tab.setVisible(true);
    tab.setFocus();
}

function showTabSelectorOverlay() {
    const formContext = Xrm.Page;

    const existingOverlay = document.getElementById("d365-tab-overlay");
    const existingBackdrop = document.getElementById("d365-tab-backdrop");
    if (existingOverlay) existingOverlay.remove();
    if (existingBackdrop) existingBackdrop.remove();

    const backdrop = document.createElement("div");
    backdrop.id = "d365-tab-backdrop";
    Object.assign(backdrop.style, {
        position: "fixed",
        top: "0", left: "0", width: "100%", height: "100%",
        backgroundColor: "rgba(0,0,0,0.3)",
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

    const header = document.createElement("h3");
    header.textContent = "Select a Tab";
    header.style.marginBottom = "12px";
    header.style.color = "#508C9B";
    overlay.appendChild(header);

    const tabs = formContext.ui.tabs.get();
    tabs.forEach(tab => {
        const name = tab.getName();
        const label = tab.getLabel();

        const tabBtn = document.createElement("button");
        tabBtn.textContent = `Tab Name: ${label}\nTab Id: ${name}`;
        Object.assign(tabBtn.style, {
            display: "block",
            margin: "6px 0",
            padding: "10px",
            width: "100%",
            height:"auto",
            textAlign: "left",
            border: "1px solid #ccc",
            background: "#f5f5f5",
            cursor: "pointer",
            borderRadius: "4px",
            whiteSpace: "pre-line"
        });

        tabBtn.onclick = () => {
            focusOnTab(tab);
            overlay.remove();
            backdrop.remove();
        };

        overlay.appendChild(tabBtn);
    });

    document.body.appendChild(backdrop);
    document.body.appendChild(overlay);
}
