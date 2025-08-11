(async function waitForXrm(attempts = 10) {
    if (typeof Xrm !== "undefined" && Xrm.Page && Xrm.Page.getAttribute) {
        try {
            showOverlayWithInput("Enter Entity Schema Name",
                goToEntityList
            )
        } catch (e) {
            alert("❌ Script error: " + e.message);
        }
    } else if (attempts > 0) {
        setTimeout(() => waitForXrm(attempts - 1), 1000);
    } else {
        alert("❌ Xrm never became available. Make sure you're on a record form.");
    }
})();

async function goToEntityList(entityschemaname, mode) {
    if (mode == "uci") {
        var baseUrl = Xrm.Utility.getGlobalContext().getCurrentAppUrl();
        if (!baseUrl.includes("appid")) {
            baseUrl += `/main.aspx?appid=${await GetAnyAppID()}`;
        } 
        var targetUrl = baseUrl + `&newWindow=true&pagetype=entitylist&etn=${entityschemaname}`
        window.open(targetUrl, "_blank");
    } else if (mode == "classic") {
        var targetUrl = Xrm.Page.context.getClientUrl() + `/main.aspx?pagetype=entitylist&etn=${entityschemaname}`
        window.open(targetUrl, "_blank");
    }
}

async function GetAnyAppID() {
    var appid;
    await Xrm.WebApi.retrieveMultipleRecords("appmodule", "?$filter=statecode eq 0 and navigationtype eq 0 and clienttype eq 4 and appmoduleid ne null and name ne null")
        .then(function (result) {
            if (result.entities && result.entities.length > 0) {
                appid = result.entities[0].appmoduleid;
            } else {
                appid = null;
            }
        })
        .catch(function (error) {
            console.error("Error retrieving app modules:", error.message);
        });
    return appid;
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
        padding: "40px",
        borderRadius: "8px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
        fontSize: "18px",
        fontFamily: "Segoe UI, Arial, sans-serif",
        maxWidth: "600px",
        maxHeight: "80vh",
        overflowY: "auto",
        zIndex: "9999",
        textAlign: "left"
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

    const uciBtn = document.createElement("button");
    uciBtn.textContent = "UCI";
    Object.assign(uciBtn.style, {
        padding: "8px 16px",
        backgroundColor: "#508C9B",
        color: "#fff",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        marginRight: "8px"
    });
    uciBtn.onclick = () => {
        const value = input.value.trim();
        if (value) {
            onConfirm(value, "uci");
            overlay.remove();
            backdrop.remove();
        } else {
            alert("Please enter a value.");
        }
    };

    const classicBtn = document.createElement("button");
    classicBtn.textContent = "Classic";
    Object.assign(classicBtn.style, {
        padding: "8px 16px",
        backgroundColor: "#134B70",
        color: "#fff",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer"
    });
    const isOnPremises = Xrm.Utility.getGlobalContext().isOnPremises();
    if (isOnPremises == false) {
        classicBtn.disabled = true;
        classicBtn.style.backgroundColor = "#999";
        classicBtn.style.cursor = "not-allowed";
    }
    classicBtn.onclick = () => {
        if (classicBtn.disabled) return;
        const value = input.value.trim();
        if (value) {
            onConfirm(value, "classic");
            overlay.remove();
            backdrop.remove();
        } else {
            alert("Please enter a value.");
        }
    };

    btnContainer.appendChild(uciBtn);
    btnContainer.appendChild(classicBtn);

    overlay.appendChild(btnContainer);

    document.body.appendChild(backdrop);
    document.body.appendChild(overlay);
}