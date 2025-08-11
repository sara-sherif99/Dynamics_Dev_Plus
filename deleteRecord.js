(async function waitForXrm(attempts = 10) {
    if (typeof Xrm !== "undefined" && Xrm.Page && Xrm.Page.getAttribute) {
        try {
            Xrm = getXRM();
            if (Xrm.Page.data) {
                showOverlay(deleteRecord);
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

function deleteRecord() {
    Xrm.WebApi.deleteRecord(Xrm.Page.data.entity.getEntityName(),  Xrm.Page.data.entity.getId()).then(

    function success(result) {
    },
    function (error) {

        console.error("Error deleting record: " + error.message);

    }
);

}

function showOverlay(onConfirm) {
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
        textAlign: "left",
        minWidth: "200px"
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
        cursor: "pointer",
    });
    closeBtn.onclick = () => {
        overlay.remove();
        backdrop.remove();
    };
    overlay.appendChild(closeBtn);

    const messageDiv = document.createElement("div");
    messageDiv.textContent = "Delete This Record?";
    Object.assign(messageDiv.style, {
        fontSize: "16px",
        color: "#333",
        fontFamily: "Segoe UI, Arial, sans-serif",
        whiteSpace: "pre-line"
    });
    overlay.appendChild(messageDiv);


    const btnContainer = document.createElement("div");
    Object.assign(btnContainer.style, {
        textAlign: "center"
    });

    const deleteRecordBtn = document.createElement("button");
    deleteRecordBtn.textContent = "Delete Record";
    Object.assign(deleteRecordBtn.style, {
        padding: "8px 16px",
        backgroundColor: "#508C9B",
        color: "#fff",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        marginTop: "20px"
    });
    deleteRecordBtn.onclick = () => {
        onConfirm();
        overlay.remove();
        backdrop.remove();
    };

    btnContainer.appendChild(deleteRecordBtn);

    overlay.appendChild(btnContainer);

    document.body.appendChild(backdrop);
    document.body.appendChild(overlay);
}