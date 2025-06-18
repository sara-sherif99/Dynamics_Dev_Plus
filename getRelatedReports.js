(async function waitForXrm(attempts = 10) {
    if (typeof Xrm !== "undefined" && Xrm.Page && Xrm.Page.getAttribute) {
        try {
            if (Xrm.Page.data) {
                const entityName = Xrm.Page.data.entity.getEntityName();
                var reports = await getRelatedReports(entityName);
                showOverlayWithTables("✅ Related Reports", reports)
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

async function getRelatedReports(entityName) {
    var reports;
    await Xrm.WebApi.retrieveMultipleRecords("reportentity", `?$filter=objecttypecode eq '${entityName}'`).then(
        function success(result) {
            reports = result.entities.map(obj =>
            ({
                ReportName: obj["_reportid_value@OData.Community.Display.V1.FormattedValue"],
                CreatedBy: obj["_createdby_value@OData.Community.Display.V1.FormattedValue"],
                CreatedOn: obj["createdon@OData.Community.Display.V1.FormattedValue"],
                ReportId: obj["_reportid_value"]
            })
            );
        },
        function (error) {
            console.log(error.message);
        }
    );
    return reports;
}
function showOverlayWithTables(title, data) {
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
        fontSize: "16px",
        fontFamily: "Segoe UI, Arial, sans-serif",
        maxWidth: "90vw",
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

    const container = document.createElement("div");
    Object.assign(container.style, {
        display: "flex",
        gap: "40px",
        justifyContent: "center",
        flexWrap: "wrap"
    });

    container.appendChild(
        data.length > 0
            ? createTable(title, data)
            : createEmptyTable(title, "No Related Reports")
    );

    overlay.appendChild(container);
    document.body.appendChild(backdrop);
    document.body.appendChild(overlay);
}
function createTable(title, data) {
    const section = document.createElement("div");

    const heading = document.createElement("h3");
    heading.textContent = title;
    section.appendChild(heading);

    const table = document.createElement("table");
    Object.assign(table.style, {
        borderCollapse: "collapse",
        width: "100%",
        minWidth: "300px"
    });

    if (data.length > 0) {
        const thead = document.createElement("thead");
        const headRow = document.createElement("tr");
        Object.keys(data[0]).forEach(key => {
            const th = document.createElement("th");
            th.textContent = key;
            Object.assign(th.style, {
                border: "1px solid #ccc",
                padding: "6px 12px",
                backgroundColor: "#f5f5f5"
            });
            headRow.appendChild(th);
        });
        thead.appendChild(headRow);
        table.appendChild(thead);

        const tbody = document.createElement("tbody");
        data.forEach(row => {
            const tr = document.createElement("tr");
            Object.entries(row).forEach(([key, val]) => {
                const td = document.createElement("td");

                if (key.toLowerCase().includes("reportname")) {
                    const a = document.createElement("a");
                    a.href = `CRMReports/reportproperty.aspx?id=${row.ReportId}`;

                    a.textContent = val;
                    Object.assign(a.style, {
                        color: "#0078d4",
                        textDecoration: "underline"
                    });
                    a.onclick = function (e) {
                        e.preventDefault();
                        window.open(
                            a.href,
                            "_blank",
                            "width=800,height=600,resizable=yes,scrollbars=yes"
                        );
                    };
                    td.appendChild(a);
                } else {
                    td.textContent = val;
                }

                Object.assign(td.style, {
                    border: "1px solid #ccc",
                    padding: "6px 12px"
                });

                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
    }

    section.appendChild(table);
    return section;
}
function createEmptyTable(title, message) {
    const wrapper = document.createElement("div");
    wrapper.style.flex = "1";

    const titleEl = document.createElement("h3");
    titleEl.textContent = title;
    Object.assign(titleEl.style, {
        marginBottom: "10px",
        color: "#134B70"
    });

    const emptyMsg = document.createElement("div");
    emptyMsg.textContent = message;
    Object.assign(emptyMsg.style, {
        padding: "20px",
        border: "1px dashed #ccc",
        borderRadius: "6px",
        textAlign: "center",
        color: "#999",
        fontStyle: "italic",
        minWidth: "200px"
    });

    wrapper.appendChild(titleEl);
    wrapper.appendChild(emptyMsg);
    return wrapper;
}
