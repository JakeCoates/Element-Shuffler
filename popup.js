const browser = chrome || browser;

document.getElementById("selectElement").addEventListener("click", () => {
  browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      browser.tabs.sendMessage(tabs[0].id, { action: "selectElement" }, response => {
          if (browser.runtime.lastError) {
              console.error(browser.runtime.lastError.message);
          } else {
              console.log(response.status);
          }
      });
  });
});

document.getElementById("clearElements").addEventListener("click", () => {
  browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      browser.tabs.sendMessage(tabs[0].id, { action: "clearElements" }, response => {
          if (browser.runtime.lastError) {
              console.error(browser.runtime.lastError.message);
          } else {
              console.log(response.status);
          }
      });
  });
});
