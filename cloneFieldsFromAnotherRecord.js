(async function waitForXrm(attempts = 10) {
    if (typeof Xrm !== "undefined" && Xrm.Page && Xrm.Page.getAttribute) {
        try {
            Xrm = getXRM();
            if (Xrm.Page.data) {
                var fieldsArray = GetFieldsOnForm();
                showFieldSelectionOverlay(
                    fieldsArray,
                    CloneFields
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

function GetFieldsOnForm() {
    const attributes = Xrm.Page.data.entity.attributes.get();
    return attributes.map(attr => ({
        logicalName: attr.getName(),
        fieldType: attr.getAttributeType(),
        label: Xrm.Page.getControl(attr.getName())?.getLabel() || attr.getName(),
        tab: (() => {
            const ctrl = Xrm.Page.getControl(attr.getName());
            if (!ctrl) return "Fields Not On Form";
            const section = ctrl.getParent();
            const tab = section?.getParent?.();
            return tab?.getLabel?.() || "";
        })()
    }));
}

async function CloneFields(selectedFields, recordId) {
    var schemaNamesOfFields = selectedFields.map(f => f.fieldType === "lookup" ? `_${f.fieldName}_value` : f.fieldName).join(",");
    const entityName = Xrm.Page.data.entity.getEntityName();
    await Xrm.WebApi.retrieveRecord(entityName, recordId, `?$select=${schemaNamesOfFields}`).then(
        function success(result) {
            selectedFields.forEach((field) => {
                if (field.fieldType == "lookup" && result[`_${field.fieldName}_value`]) {
                    Xrm.Page.getAttribute(field.fieldName).setValue([{
                        id: result[`_${field.fieldName}_value`],
                        name: result[`_${field.fieldName}_value@OData.Community.Display.V1.FormattedValue`],
                        entityType: result[`_${field.fieldName}_value@Microsoft.Dynamics.CRM.lookuplogicalname`]
                    }]);
                }
                else if (field.fieldType == "datetime" && result[field.fieldName]) {
                    Xrm.Page.getAttribute(field.fieldName).setValue(new Date(result[field.fieldName]));
                }
                else {
                    Xrm.Page.getAttribute(field.fieldName).setValue(result[field.fieldName]);
                }
            });
        },
        function (error) {
            alert(error.message);
        }
    );
}

function showFieldSelectionOverlay(fieldsArray, onConfirm) {
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
        padding: "24px",
        borderRadius: "8px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
        fontSize: "16px",
        fontFamily: "Segoe UI, Arial, sans-serif",
        maxWidth: "700px",
        maxHeight: "80vh",
        width: "500px",
        overflowY: "auto",
        zIndex: "9999",
        textAlign: "left",
        boxSizing: "border-box"
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

    const idLabel = document.createElement("label");
    idLabel.textContent = "Source Record ID";
    Object.assign(idLabel.style, {
        display: "block",
        marginBottom: "6px",
        color: "#134B70",
        fontWeight: "bold"
    });

    const idInput = document.createElement("input");
    idInput.type = "text";
    idInput.placeholder = "Enter source record ID (GUID)";
    Object.assign(idInput.style, {
        width: "100%",
        padding: "8px",
        fontSize: "14px",
        marginBottom: "20px",
        borderRadius: "4px",
        border: "1px solid #ccc",
        boxSizing: "border-box"
    });

    overlay.appendChild(idLabel);
    overlay.appendChild(idInput);

    const groupedByTab = {};
    fieldsArray.forEach(field => {
        if (!groupedByTab[field.tab]) {
            groupedByTab[field.tab] = [];
        }
        groupedByTab[field.tab].push(field);
    });

    const fieldList = document.createElement("div");

    const selectAllWrapper = document.createElement("div");
    selectAllWrapper.style.marginBottom = "12px";

    const selectAllCheckbox = document.createElement("input");
    selectAllCheckbox.type = "checkbox";
    selectAllCheckbox.id = "chk_select_all";
    selectAllCheckbox.style.width="auto";

    const selectAllLabel = document.createElement("label");
    selectAllLabel.htmlFor = "chk_select_all";
    selectAllLabel.textContent = " Select All Fields";
    selectAllLabel.style.marginLeft = "6px";
    selectAllLabel.style.fontWeight = "bold";

    selectAllWrapper.appendChild(selectAllCheckbox);
    selectAllWrapper.appendChild(selectAllLabel);
    fieldList.appendChild(selectAllWrapper);

    selectAllCheckbox.addEventListener("change", () => {
        const checkboxes = overlay.querySelectorAll("input[type=checkbox]");
        checkboxes.forEach(cb => {
            if (!cb.disabled && cb.id !== "chk_select_all") {
                cb.checked = selectAllCheckbox.checked;
            }
        });
    });

    for (const [tabName, fields] of Object.entries(groupedByTab)) {
        const tabHeader = document.createElement("strong");
        tabHeader.textContent = tabName;
        Object.assign(tabHeader.style, {
            display: "block",
            marginTop: "12px",
            marginBottom: "6px",
            color: "#134B70"
        });
        fieldList.appendChild(tabHeader);

        fields.forEach(({ logicalName, label }) => {
            const wrapper = document.createElement("div");
            Object.assign(wrapper.style, {
                marginBottom: "6px"
            });

            const systemFields = ["createdby", "createdon", "modifiedby", "modifiedon", "ownerid"];
            const isSystemField = systemFields.includes(logicalName.toLowerCase());

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.value = logicalName;
            checkbox.id = `chk_${logicalName}`;
            checkbox.style.width="auto";
            if (isSystemField) {
                checkbox.disabled = true;
                checkbox.style.cursor = "not-allowed";
            }

            const labelEl = document.createElement("label");
            labelEl.htmlFor = checkbox.id;
            labelEl.textContent = ` ${label || logicalName}`;
            labelEl.style.marginLeft = "6px";
            if (isSystemField) {
                labelEl.style.color = "#999";
            }

            wrapper.appendChild(checkbox);
            wrapper.appendChild(labelEl);
            fieldList.appendChild(wrapper);
        });


        fieldList.appendChild(document.createElement("hr"));
    }
    overlay.appendChild(fieldList);

    const btnContainer = document.createElement("div");
    Object.assign(btnContainer.style, { textAlign: "right", marginTop: "20px" });

    const okBtn = document.createElement("button");
    okBtn.textContent = "Clone Selected";
    Object.assign(okBtn.style, {
        padding: "8px 16px",
        backgroundColor: "#508C9B",
        color: "#fff",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer"
    });

    okBtn.onclick = () => {
        const selected = [...overlay.querySelectorAll("input[type=checkbox]:checked")]
            .filter(cb => cb.id !== "chk_select_all")
            .map(cb => ({
                fieldName: cb.value,
                fieldType: fieldsArray.find(f => f.logicalName == cb.value).fieldType
            }));
        const recordId = idInput.value.trim();

        if (!recordId) {
            alert("Please enter a Record ID.");
            return;
        }

        if (selected.length > 0) {
            onConfirm(selected, recordId);
            overlay.remove();
            backdrop.remove();
        } else {
            alert("Please select at least one field.");
        }
    };

    btnContainer.appendChild(okBtn);
    overlay.appendChild(btnContainer);

    document.body.appendChild(backdrop);
    document.body.appendChild(overlay);
}

