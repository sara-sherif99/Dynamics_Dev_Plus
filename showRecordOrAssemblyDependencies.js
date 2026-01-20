(async function waitForXrm(attempts = 10) {
    if (typeof Xrm !== "undefined" && Xrm.Page && Xrm.Page.getAttribute) {
        try {
            showOverlayWithInput("Enter Record ID or Assembly Name",
                getProcessesContainsThisRecord
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

async function getProcessesContainsThisRecord(recordId) {
    var processes;
    showLoader("Fetching dependent processes...");
    await Xrm.WebApi.retrieveMultipleRecords("workflow", `?$filter=contains(xaml,'${recordId}') and _parentworkflowid_value eq null&$select=name,category`).then(
        function success(result) {
            processes = result.entities.map(obj =>
            ({
                ProcessName: obj["name"],
                ProcessCategory: obj["category@OData.Community.Display.V1.FormattedValue"],
                ProcessId: obj["workflowid"]
            })
            );
        },
        function (error) {
            console.log(error.message);
        }
    );
    hideLoader();
    showOverlayWithTables("✅ Dependent Processes", processes)
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
        const value = input.value.trim();
        if (value) {
            onConfirm(value);
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
            : createEmptyTable(title, "No Dependent Processes")
    );

    overlay.appendChild(container);
    document.body.appendChild(backdrop);
    document.body.appendChild(overlay);
}
function createTable(title, data) {
    const section = document.createElement("div");

    const heading = document.createElement("h3");
    heading.textContent = title;
    Object.assign(heading.style, {
        marginBottom: "10px",
        color: "#508C9B"
    });
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

                if (key.toLowerCase().includes("name")) {
                    const a = document.createElement("a");
                    a.href = `sfa/workflow/edit.aspx?id=%7b${row.ProcessId}%7d`;

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
                }
                else {
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
        color: "#508C9B"
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

function showLoader(message = "Loading...") {
    const existingLoader = document.getElementById("d365-loader");
    if (existingLoader) return;

    const loader = document.createElement("div");
    loader.id = "d365-loader";
    Object.assign(loader.style, {
        position: "fixed",
        top: "0",
        left: "0",
        width: "100vw",
        height: "100vh",
        background: "rgba(0, 0, 0, 0.4)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: "10000",
        color: "#fff",
        fontSize: "18px",
        fontFamily: "Segoe UI, Arial, sans-serif"
    });

    const spinner = document.createElement("div");
    Object.assign(spinner.style, {
        border: "5px solid #f3f3f3",
        borderTop: "5px solid #508C9B",
        borderRadius: "50%",
        width: "40px",
        height: "40px",
        animation: "spin 1s linear infinite"
    });

    const text = document.createElement("div");
    text.textContent = message;
    text.style.marginTop = "10px";

    loader.appendChild(spinner);
    loader.appendChild(text);

    document.body.appendChild(loader);

    const style = document.createElement("style");
    style.innerHTML = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
}

function hideLoader() {
    const loader = document.getElementById("d365-loader");
    if (loader) loader.remove();
}
