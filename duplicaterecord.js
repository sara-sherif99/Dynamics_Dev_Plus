(async function waitForXrm(attempts = 10) {
    if (typeof Xrm !== "undefined" && Xrm.Page && Xrm.Page.getAttribute) {
        try {
            Xrm = getXRM();
            if (Xrm.Page.data) {
                showOverlay(duplicateRecord);
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

function duplicateRecord() {
    var formContext = Xrm.Page;
    var entityName = formContext.data.entity.getEntityName();

    var systemFields = ["createdon", "createdby", "modifiedon", "modifiedby", "ownerid"];
    var attributes = formContext.data.entity.attributes.get();
    var formParameters = {};

    attributes.forEach(async function (attribute) {
        var logicalName = attribute.getName();
        var value = attribute.getValue();

        if (!formParameters.hasOwnProperty(logicalName) && value !== null && !systemFields.includes(logicalName)) {
            if (attribute.getAttributeType() === "lookup") {
                var lookupValue = value[0];
                formParameters[logicalName] = lookupValue.id;
                formParameters[logicalName + "name"] = lookupValue.name;
                if (isUCI())
                    formParameters[logicalName + "type"] = lookupValue.entityType;
                else {
                    await Xrm.Utility.getEntityMetadata("businessunit").then(function(result){
                        formParameters[logicalName + "type"] = result.ObjectTypeCode;
                    });
                }
            } else if (attribute.getAttributeType() === "boolean") {
                formParameters[logicalName] = value ? 1 : 0;
            } else if (attribute.getAttributeType() === "datetime") {
                formParameters[logicalName] = value.toISOString();
            } else {
                formParameters[logicalName] = value;
            }
        }
    });

    var entityFormOptions = {
        entityName: entityName,
        openInNewWindow: true
    };
    Xrm.Navigation.openForm(entityFormOptions, formParameters).then(
        function (success) {
        },
        function (error) {
            console.error("Error opening form: " + error.message);
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
    messageDiv.textContent = "Duplicate This Record?";
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

    const duplicateRecordBtn = document.createElement("button");
    duplicateRecordBtn.textContent = "Duplicate Record";
    Object.assign(duplicateRecordBtn.style, {
        padding: "8px 16px",
        backgroundColor: "#508C9B",
        color: "#fff",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        marginTop: "20px"
    });
    duplicateRecordBtn.onclick = () => {
        onConfirm();
        overlay.remove();
        backdrop.remove();
    };

    btnContainer.appendChild(duplicateRecordBtn);

    overlay.appendChild(btnContainer);

    document.body.appendChild(backdrop);
    document.body.appendChild(overlay);
}