document.getElementById("getBPFStagesIDs").addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const script = document.createElement("script");
        script.src = chrome.runtime.getURL("getBPFStagesIDs.js");
        script.onload = function () {
          this.remove();
        };
        (document.head || document.documentElement).appendChild(script);
      }
    });
});

document.getElementById("getProcessesSessions").addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const script = document.createElement("script");
        script.src = chrome.runtime.getURL("getProcessesSessions.js");
        script.onload = function () {
          this.remove();
        };
        (document.head || document.documentElement).appendChild(script);
      }
    });
});

document.getElementById("getRelatedReports").addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const script = document.createElement("script");
        script.src = chrome.runtime.getURL("getRelatedReports.js");
        script.onload = function () {
          this.remove();
        };
        (document.head || document.documentElement).appendChild(script);
      }
    });
});
  
document.getElementById("lookForFieldOnForm").addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const script = document.createElement("script");
        script.src = chrome.runtime.getURL("lookForFieldOnForm.js");
        script.onload = function () {
          this.remove();
        };
        (document.head || document.documentElement).appendChild(script);
      }
    });
});

document.getElementById("goToEntityList").addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const script = document.createElement("script");
        script.src = chrome.runtime.getURL("goToEntityList.js");
        script.onload = function () {
          this.remove();
        };
        (document.head || document.documentElement).appendChild(script);
      }
    });
});

document.getElementById("cloneFieldsFromAnotherRecord").addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const script = document.createElement("script");
        script.src = chrome.runtime.getURL("cloneFieldsFromAnotherRecord.js");
        script.onload = function () {
          this.remove();
        };
        (document.head || document.documentElement).appendChild(script);
      }
    });
});

document.getElementById("duplicaterecord").addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const script = document.createElement("script");
        script.src = chrome.runtime.getURL("duplicaterecord.js");
        script.onload = function () {
          this.remove();
        };
        (document.head || document.documentElement).appendChild(script);
      }
    });
});

document.getElementById("showFieldMetadata").addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const script = document.createElement("script");
        script.src = chrome.runtime.getURL("showFieldMetadata.js");
        script.onload = function () {
          this.remove();
        };
        (document.head || document.documentElement).appendChild(script);
      }
    });
});

document.getElementById("showSecurityRoles").addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const script = document.createElement("script");
        script.src = chrome.runtime.getURL("showSecurityRoles.js");
        script.onload = function () {
          this.remove();
        };
        (document.head || document.documentElement).appendChild(script);
      }
    });
});

document.getElementById("showTabsOnForm").addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const script = document.createElement("script");
        script.src = chrome.runtime.getURL("showTabsOnForm.js");
        script.onload = function () {
          this.remove();
        };
        (document.head || document.documentElement).appendChild(script);
      }
    });
});

document.getElementById("deleteRecord").addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const script = document.createElement("script");
        script.src = chrome.runtime.getURL("deleteRecord.js");
        script.onload = function () {
          this.remove();
        };
        (document.head || document.documentElement).appendChild(script);
      }
    });
});

document.getElementById("setFieldValue").addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const script = document.createElement("script");
        script.src = chrome.runtime.getURL("setFieldValue.js");
        script.onload = function () {
          this.remove();
        };
        (document.head || document.documentElement).appendChild(script);
      }
    });
});