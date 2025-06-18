(async function waitForXrm(attempts = 10) {
    if (typeof Xrm !== "undefined" && Xrm.Page && Xrm.Page.getAttribute) {
        try {
            if (Xrm.Page.data) {
                var fieldsArray = GetFieldsOnForm();
                showFieldSelectionOverlay(
                    fieldsArray,
                    getFieldMetadata
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

async function getFieldMetadata(attribute) {
    var fieldMetaData;
    var entityName = Xrm.Page.data.entity.getEntityName();
    var schemaName = attribute.getName();

    await Xrm.Utility.getEntityMetadata(entityName, [schemaName])
        .then(function (metadata) {
            const fieldData = metadata.Attributes.get(schemaName);

            const type = fieldData.attributeDescriptor.Type;

            const AttributeRequiredLevelCodeName = Object.entries(AttributeRRequiredLevelCode).reduce((acc, [key, value]) => {
                acc[value] = key;
                return acc;
            }, {});
            const requiredLevel = AttributeRequiredLevelCodeName[fieldData.attributeDescriptor.RequiredLevel].replace("_", " ");


            fieldMetaData = `Schema Name: ${schemaName}\n`;
            fieldMetaData += `Type: ${type}\n`;
            fieldMetaData += `Required: ${requiredLevel}\n`;

            if (type === "lookup")
                fieldMetaData += `Related Entity: ${fieldData.attributeDescriptor.EntityLogicalName}`;

            else if (type === "picklist") {
                const options = fieldData.OptionSet;
                fieldMetaData += `Options:\n`;
                Object.values(options).forEach(opt => {
                    fieldMetaData += `- ${opt.text} (${opt.value})\n`;
                });
            }
            else if (type == "multiselectpicklist" || type == "state" || type == "status") {
                const options = fieldData.attributeDescriptor.OptionSet;
                fieldMetaData += `Options:\n`;
                Object.values(options).forEach(opt => {
                    fieldMetaData += `- ${opt.Label} (${opt.Value})\n`;
                });
            }
        })
        .catch(function (error) {
            console.error("Metadata fetch error:", error.message);
        });

    return fieldMetaData;
}

async function showFieldSelectionOverlay(fieldsArray) {
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
            color: "#134B70"
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
                    const metadata = await getFieldMetadata(attribute);
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
    heading.textContent = `Field Metadata: ${fieldLabel}`;
    Object.assign(heading.style, { margin: "12px", color: "#134B70" });
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

var AttributeRRequiredLevelCode = {
    Optional: 0,
    System_Required: 1,
    Business_Recommended: 3,
    Business_Required: 2
};

