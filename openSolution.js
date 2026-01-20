(async function waitForXrm(attempts = 10) {
    if (typeof Xrm !== "undefined" && Xrm.Page && Xrm.Page.getAttribute) {
        try {
            showOverlayWithInput("Enter Solution Name",
                openSolution
            )
        } catch (e) {
            alert("❌ Script error: " + e.message);
        }
    } else if (attempts > 0) {
        setTimeout(() => waitForXrm(attempts - 1), 1000);
    } else {
        alert("❌ Xrm never became available.");
    }
})();

async function openSolution(solutionName) {
    var solutionId = await getSolutionId(solutionName);
    if (solutionId != "") {
        window.open([
            `${Xrm.Page.context.getClientUrl()}/tools/solution/edit.aspx?id=${solutionId}`,
        ], "_blank", "width=800,height=600,resizable=yes,scrollbars=yes");
    }
    else{
        alert("❌ Cannot find a solution with this name.");
    }
}

async function getSolutionId(solutionName) {
    var solutionId = "";
    await Xrm.WebApi.retrieveMultipleRecords("solution", `?$select=solutionid&$filter=friendlyname eq '${solutionName}'`).then(
        function success(result) {
            if (result && result.entities.length > 0)
                solutionId = result.entities[0].solutionid;
        },
        function (error) {
            console.log(error.message);
        }
    );
    return solutionId;
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

    const btn = document.createElement("button");
    btn.textContent = "Open";
    Object.assign(btn.style, {
        padding: "8px 16px",
        backgroundColor: "#508C9B",
        color: "#fff",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        marginRight: "8px"
    });
    btn.onclick = () => {
        const value = input.value.trim();
        if (value) {
            onConfirm(value);
            overlay.remove();
            backdrop.remove();
        } else {
            alert("Please enter a value.");
        }
    };

    btnContainer.appendChild(btn);

    overlay.appendChild(btnContainer);

    document.body.appendChild(backdrop);
    document.body.appendChild(overlay);
}