(async function waitForXrm(attempts = 10) {
    if (typeof Xrm !== "undefined" && Xrm.Page && Xrm.Page.getAttribute) {
        try {
            Xrm = getXRM();
            if (Xrm.Page.data) {
                var recordId = Xrm.Page.data.entity.getId();
                var rltProcesses = await getRealtimeProcessSessions(recordId);
                var bgProcesses = await getBackgroundProcessSessions(recordId);
                showOverlayWithTables("✅ Realtime Processes", rltProcesses, "✅ Background Processes", bgProcesses)
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

async function getRealtimeProcessSessions(recordId) {
    var realtimeprocess;
    await Xrm.WebApi.retrieveMultipleRecords("processsession", `?$filter=_regardingobjectid_value eq ${recordId}`).then(
        function success(result) {
            realtimeprocess =  result.entities.map(obj =>
            ({
                ProcessName: obj["_processid_value@OData.Community.Display.V1.FormattedValue"],
                StatusReason: obj["statuscode@OData.Community.Display.V1.FormattedValue"],
                ProcessSessionId: obj["processsessionid"]
            })
            );
        },
        function (error) {
            console.log(error.message);
        }
    );
    return realtimeprocess;
}

async function getBackgroundProcessSessions(recordId) {
    var bgProcesses;
    await Xrm.WebApi.retrieveMultipleRecords("asyncoperation", `?$filter=_regardingobjectid_value eq ${recordId}`).then(
        function success(result) {
            bgProcesses =  result.entities.map(obj =>
            ({
                ProcessName: obj["name"],
                StatusReason: obj["statuscode@OData.Community.Display.V1.FormattedValue"],
                ProcessSessionId: obj["asyncoperationid"]
            })
            );
        },
        function (error) {
            console.log(error.message);
        }
    );
    return bgProcesses;
}

function showOverlayWithTables(title1, data1, title2, data2) {
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
        data1.length > 0
            ? createTable(title1, data1, true)
            : createEmptyTable(title1, "No Realtime Processes")
    );

    container.appendChild(
        data2.length > 0
            ? createTable(title2, data2, false)
            : createEmptyTable(title2, "No Background Processes")
    );

    overlay.appendChild(container);
    document.body.appendChild(backdrop);
    document.body.appendChild(overlay);
}
function createTable(title, data, realtimeprocess) {
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

                if (key.toLowerCase().includes("processname")) {
                    const a = document.createElement("a");
                    if (realtimeprocess) {
                        a.href = `sfa/workflowsession/edit.aspx?id=${row.ProcessSessionId}&_CreateFromType=10709&_CreateFromId=%7b55984722-A57B-4B6B-966C-BB8A04D18CD5%7d`;
                    }
                    else {
                        a.href = `tools/workflowinstance/edit.aspx?id=${row.ProcessSessionId}&_CreateFromType=10709&_CreateFromId=%7b55984722-A57B-4B6B-966C-BB8A04D18CD5%7d`;
                    }
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
