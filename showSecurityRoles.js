(async function waitForXrm(attempts = 10) {
    if (typeof Xrm !== "undefined" && Xrm.Page && Xrm.Page.getAttribute) {
        try {
            if (Xrm.Page.data) {
                getSecurityRoles();
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

async function getSecurityRoles() {
    var reocrdId = Xrm.Page.data.entity.getId().replace("{", "").replace("}", "");
    var entityName = Xrm.Page.data.entity.getEntityName();

    if (entityName == "team" || entityName == "systemuser") {
        await Xrm.WebApi.retrieveMultipleRecords(entityName, `?$filter=${entityName}id eq ${reocrdId}&$expand=${entityName}roles_association($select=name)`).then(
            function success(result) {
                var securityRoles = entityName == "systemuser" ? result.entities[0].systemuserroles_association : result.entities[0].teamroles_association;
                if (securityRoles.length > 0) {
                    var msg = `✅ Security Roles:\n\n`;
                    for (var i = 0; i < securityRoles.length; i++) {
                        msg += securityRoles[i].name + "\n";
                    }
                    showOverlay(msg, entityName, reocrdId, goToManageRoles)
                } else {
                    alert("❌ This User/Team does not have and Security Role assigned to it");
                }
            },
            function (error) {
                console.log(error.message);
            }
        );
    }
    else {
        alert("❌ Security Roles can be assigned to Users or Teams only");
    }
}

function goToManageRoles(isOnPremises, entityName, recordId) {
    if (isOnPremises) {
        var url = Xrm.Utility.getGlobalContext().getClientUrl() +
            `/main.aspx?etn=${entityName}&pagetype=entityrecord&id=${encodeURIComponent(recordId)}`;
        window.open(url, "_blank");
    }
    else {
        const envId = Xrm.Utility.getGlobalContext().organizationSettings.organizationId;
        const tenantId = Xrm.Utility.getGlobalContext().organizationSettings.bapEnvironmentId;
        var url = entityName == 'team' ? `teams` : `${tenantId}/users`;
        var targetUrl = `https://admin.powerplatform.microsoft.com/settingredirect/${envId}/${url}`
        window.open(targetUrl, "_blank");
    }

}

function showOverlay(msg, entityName, recordId, onConfirm) {
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
    messageDiv.textContent = msg;
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

    const manageRolesBtn = document.createElement("button");
    manageRolesBtn.textContent = "Manage Roles";
    Object.assign(manageRolesBtn.style, {
        padding: "8px 16px",
        backgroundColor: "#508C9B",
        color: "#fff",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        marginTop: "20px"
    });
    const isOnPremises = Xrm.Utility.getGlobalContext().isOnPremises();
    manageRolesBtn.onclick = () => {
        onConfirm(isOnPremises, entityName, recordId);
        overlay.remove();
        backdrop.remove();
    };

    btnContainer.appendChild(manageRolesBtn);

    overlay.appendChild(btnContainer);

    document.body.appendChild(backdrop);
    document.body.appendChild(overlay);
}