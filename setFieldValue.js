(async function waitForXrm(attempts = 10) {
    if (typeof Xrm !== "undefined" && Xrm.Page && Xrm.Page.getAttribute) {
        try {
            Xrm = getXRM();
            if (Xrm.Page.data) {
                showOverlayWithInputs(setFieldValue)
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

async function setFieldValue(fieldSchemaName, fieldValue) {
    try {
        const recordId = Xrm.Page.data.entity.getId().replace(/[{}]/g, "");
        const entityName = Xrm.Page.data.entity.getEntityName();

        const fieldData = await getMetaData(entityName, fieldSchemaName);        
        var fieldType = fieldData.AttributeType;

        let updateData = {};

        switch (fieldType) {
            case "Lookup":
            case "Customer":
            case "Owner":
                var targetEntityName = fieldData.Targets[0];
                const entityPluralName = await getEntityPluralName(targetEntityName);
                updateData[`${fieldData.SchemaName}@odata.bind`] = `/${entityPluralName}(${fieldValue.replace(/[{}]/g, "")})`;
                break;

            case "MultiSelectPicklist":
                updateData[fieldSchemaName] = fieldValue.split(",").map(v => ({ value: v }));
                break;

            default:
                updateData[fieldSchemaName] = fieldValue;
                break;
        }
        await Xrm.WebApi.updateRecord(entityName, recordId, updateData).then(() => Xrm.Page.data.refresh(false));

    } catch (err) {
        alert(`❌ Error setting field value: ${err.message}`);
    }
}

async function getMetaData(entityName, schemaName) {
    var fieldMetaData;
    var path = `${Xrm.Utility.getGlobalContext().getClientUrl()}/api/data/v9.1/EntityDefinitions(LogicalName='${entityName}')/Attributes(LogicalName='${schemaName}')`;
    try {
        var response = await fetch(path, {
            method: "GET",
            headers: {
                "OData-MaxVersion": "4.0",
                "OData-Version": "4.0",
                "Accept": "application/json",
                "Content-Type": "application/json; charset=utf-8"
            }
        });

        fieldMetaData = await response.json();
    }
    catch (error) {
        console.error("Error retrieving field metadata:", error);
        throw error;
    }
    return fieldMetaData;
}

async function getEntityPluralName(entityLogicalName) {
    const url = Xrm.Utility.getGlobalContext().getClientUrl() +
        `/api/data/v9.1/EntityDefinitions(LogicalName='${entityLogicalName}')?$select=LogicalCollectionName`;

    const res = await fetch(url, { headers: { "Accept": "application/json" } });
    if (!res.ok) throw new Error("Failed to get entity plural name");
    const data = await res.json();
    return data.LogicalCollectionName;
}


function showOverlayWithInputs(onConfirm) {
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

    const firstField = document.createElement("div");
    firstField.textContent = "Field Schema Name";
    overlay.appendChild(firstField);

    const firstInput = document.createElement("input");
    firstInput.type = "text";
    Object.assign(firstInput.style, {
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

    overlay.appendChild(firstInput);

    const secondField = document.createElement("div");
    secondField.textContent = "Value to Set";
    overlay.appendChild(secondField);

    const secondInput = document.createElement("input");
    secondInput.type = "text";
    Object.assign(secondInput.style, {
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

    overlay.appendChild(secondInput);

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
        const fieldSchemaName = firstInput.value.trim();
        const fieldValue = secondInput.value.trim();
        if (fieldSchemaName && fieldValue) {
            onConfirm(fieldSchemaName, fieldValue);
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

