(async function waitForXrm(attempts = 10) {
    if (typeof Xrm !== "undefined" && Xrm.Page && Xrm.Page.getAttribute) {
        try {
            Xrm = getXRM();
            if (Xrm.Page.data) {
                var fieldsArray = GetFieldsOnForm();
                showFieldSelectionOverlay(
                    fieldsArray,
                    getFieldTranslations
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
        requirementLevel: attr.getRequiredLevel(),
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

async function getFieldTranslations(attribute) {
    var entityName = Xrm.Page.data.entity.getEntityName();
    var schemaName = attribute.getName();

    return getMetaData(entityName, schemaName);
}

async function getMetaData(entityName, schemaName) {
    var fieldTransltions;
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

        var result = await response.json();
        const translations = result.DisplayName?.LocalizedLabels?.map(l => ({
            label: l.Label,
            language: l.LanguageCode
        })) || [];

        fieldTransltions = `Field Translations:\n`;
        Object.values(translations).forEach(trns => {
            fieldTransltions += `- ${trns.language}: "${trns.label}"\n`;
        });

    }
    catch (error) {
        console.error("Error retrieving field metadata:", error);
        throw error;
    }
    return fieldTransltions;
}

async function showFieldSelectionOverlay(fieldsArray, onclick) {
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


    const groupedByTab = {};
    fieldsArray.forEach(field => {
        if (!groupedByTab[field.tab]) {
            groupedByTab[field.tab] = [];
        }
        groupedByTab[field.tab].push(field);
    });

    const fieldList = document.createElement("div");
    for (const [tabName, fields] of Object.entries(groupedByTab)) {
        const tabHeader = document.createElement("strong");
        tabHeader.textContent = tabName;
        Object.assign(tabHeader.style, {
            display: "block",
            marginTop: "12px",
            marginBottom: "6px",
            color: "#508C9B"
        });
        fieldList.appendChild(tabHeader);

        fields.forEach(({ logicalName, label }) => {
            const wrapper = document.createElement("div");
            Object.assign(wrapper.style, {
                marginBottom: "6px"
            });

            const labelEl = document.createElement("label");
            labelEl.htmlFor = logicalName;
            labelEl.textContent = ` ${label || logicalName}`;
            labelEl.style.marginLeft = "6px";

            wrapper.appendChild(labelEl);

            const infoBtn = document.createElement("button");
            infoBtn.textContent = "🔎";
            infoBtn.title = "View field metadata";
            Object.assign(infoBtn.style, {
                fontSize: "20px",
                cursor: "pointer",
                padding: "2px 2px",
                border: "none",
                background: "#fff"
            });
            infoBtn.onclick = async () => {
                const attribute = Xrm.Page.getAttribute(logicalName);
                if (attribute) {
                    const metadata = await onclick(attribute);
                    showMetadataOverlay(metadata, label);
                } else {
                    alert("⚠️ Field not found in Xrm.");
                }
            };

            wrapper.appendChild(infoBtn);

            fieldList.appendChild(wrapper);
        });


        fieldList.appendChild(document.createElement("hr"));
    }
    overlay.appendChild(fieldList);

    document.body.appendChild(backdrop);
    document.body.appendChild(overlay);
}

function showMetadataOverlay(metadata, fieldLabel) {
    document.getElementById("d365-metadata-overlay")?.remove();

    const overlay = document.createElement("div");
    overlay.id = "d365-metadata-overlay";
    Object.assign(overlay.style, {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        backgroundColor: "#fff",
        border: "1px solid #ccc",
        padding: "20px",
        borderRadius: "8px",
        boxShadow: "0 2px 20px rgba(0,0,0,0.3)",
        zIndex: "10000",
        maxWidth: "500px",
        maxHeight: "80vh",
        overflowY: "auto",
        fontFamily: "Segoe UI, sans-serif",
        whiteSpace: "pre-wrap"
    });

    const closeBtn = document.createElement("button");
    closeBtn.textContent = "✖";
    Object.assign(closeBtn.style, {
        position: "absolute",
        top: "10px",
        right: "10px",
        background: "transparent",
        border: "none",
        fontSize: "18px",
        cursor: "pointer",
        color: "#666"
    });
    closeBtn.onclick = () => overlay.remove();
    overlay.appendChild(closeBtn);

    const heading = document.createElement("h2");
    heading.textContent = `Field Translations: ${fieldLabel}`;
    Object.assign(heading.style, { margin: "12px", color: "#508C9B" });
    overlay.appendChild(heading);

    const pre = document.createElement("pre");
    pre.textContent = metadata;
    Object.assign(pre.style, {
        background: "#f7f7f7",
        padding: "12px",
        borderRadius: "4px",
        border: "1px solid #eee",
        fontSize: "20px",
        display: "inline-block",
        maxWidth: "100%",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word"
    });

    overlay.appendChild(pre);

    document.body.appendChild(overlay);
}
