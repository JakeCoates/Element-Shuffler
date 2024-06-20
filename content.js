let selectingElement = false;
let previousHighlight = null;


window.addEventListener("load", () => {
  loadShuffleButtons();
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "selectElement") {
        selectingElement = true;
        document.body.style.cursor = "crosshair";
    } else if (request.action === "clearElements") {
        clearAllShuffleButtons();
    }
});

// Highlight element on hover
document.addEventListener("mouseover", (e) => {
    if (selectingElement) {
        const element = e.target;
        if (previousHighlight) {
            previousHighlight.classList.remove("highlighted");
        }
        element.classList.add("highlighted");
        previousHighlight = element;
    }
});

// Add permanent button on click
document.addEventListener("click", (e) => {
    if (selectingElement) {
        const element = e.target;
        addPermanentShuffleButton(element);
        selectingElement = false;
        document.body.style.cursor = "default";
        if (previousHighlight) {
            previousHighlight.classList.remove("highlighted");
        }
    }
});

function addPermanentShuffleButton(element) {
    const buttonContainer = document.createElement("div");
    buttonContainer.className = "button-container";
    buttonContainer.innerHTML = `
        <button class="shuffle-button">Shuffle</button>
        <button class="remove-button">✖</button>
    `;

    const rect = element.getBoundingClientRect();
    buttonContainer.style.position = "absolute";
    buttonContainer.style.left = `${rect.left + window.scrollX}px`;
    buttonContainer.style.top = `${rect.top + window.scrollY - 34}px`;
    buttonContainer.style.zIndex = 9999;
    buttonContainer.style.display = "flex";
    buttonContainer.style.gap = "5px";

    const shuffleBtn = buttonContainer.querySelector(".shuffle-button");
    shuffleBtn.style.backgroundColor = "rgba(0, 0, 0, .55)";
    shuffleBtn.style.color = "white";
    shuffleBtn.style.border = "1px solid rgba(255, 255, 255, .15)";
    shuffleBtn.style.borderRadius = "5px";
    shuffleBtn.style.padding = "5px 10px";
    shuffleBtn.style.cursor = "pointer";

    const removeBtn = buttonContainer.querySelector(".remove-button");
    removeBtn.style.backgroundColor = "rgba(0, 0, 0, .55)";
    removeBtn.style.color = "white";
    removeBtn.style.border = "1px solid rgba(255, 255, 255, .15)";
    removeBtn.style.borderRadius = "5px";
    removeBtn.style.padding = "4px";
    removeBtn.style.cursor = "pointer";

    shuffleBtn.addEventListener("click", () => shuffleChildren(element));
    removeBtn.addEventListener("click", () => removeShuffleButton(element, buttonContainer));

    document.body.appendChild(buttonContainer);

    // Save the button position and associated element information to storage
    saveButtonPosition(element, buttonContainer);
}

function shuffleChildren(element) {
    if (element && element.children.length > 0) {
        const childrenArray = Array.from(element.children);
        for (let i = childrenArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            element.appendChild(childrenArray[j]);
        }
    }
}

function saveButtonPosition(element, button) {
    const buttonData = {
        left: button.style.left,
        top: button.style.top,
        elementPath: getElementPath(element)
    };

    chrome.storage.local.get({ shuffleButtons: [] }, (result) => {
        const shuffleButtons = result.shuffleButtons;
        shuffleButtons.push(buttonData);
        chrome.storage.local.set({ shuffleButtons });
    });
}

function loadShuffleButtons() {
    chrome.storage.local.get({ shuffleButtons: [] }, (result) => {
        const shuffleButtons = result.shuffleButtons;
        shuffleButtons.forEach(buttonData => {
            const element = getElementFromPath(buttonData.elementPath);
            if (element) {
                const buttonContainer = document.createElement("div");
                buttonContainer.className = "button-container";
                buttonContainer.innerHTML = `
                    <button class="shuffle-button">Shuffle</button>
                    <button class="remove-button">✖</button>
                `;
                buttonContainer.style.position = "absolute";
                buttonContainer.style.left = buttonData.left;
                buttonContainer.style.top = buttonData.top;
                buttonContainer.style.zIndex = 9999;
                buttonContainer.style.display = "flex";
                buttonContainer.style.gap = "5px";

                const shuffleBtn = buttonContainer.querySelector(".shuffle-button");
                shuffleBtn.style.backgroundColor = "rgba(0, 0, 0, .55)";
                shuffleBtn.style.color = "white";
                shuffleBtn.style.border = "1px solid rgba(255, 255, 255, .15)";
                shuffleBtn.style.borderRadius = "5px";
                shuffleBtn.style.padding = "5px 10px";
                shuffleBtn.style.cursor = "pointer";

                const removeBtn = buttonContainer.querySelector(".remove-button");
                removeBtn.style.backgroundColor = "rgba(0, 0, 0, .55)";
                removeBtn.style.color = "white";
                removeBtn.style.border = "1px solid rgba(255, 255, 255, .15)";
                removeBtn.style.borderRadius = "5px";
                removeBtn.style.padding = "4px";
                removeBtn.style.cursor = "pointer";

                shuffleBtn.addEventListener("click", () => shuffleChildren(element));
                removeBtn.addEventListener("click", () => removeShuffleButton(element, buttonContainer));

                document.body.appendChild(buttonContainer);
            }
        });
    });
}

function getElementPath(element) {
    const path = [];
    while (element) {
        let selector = element.nodeName.toLowerCase();
        if (element.id) {
            selector += `#${element.id}`;
            path.unshift(selector);
            break;
        } else {
            let sibling = element;
            let nth = 1;
            while (sibling.previousElementSibling) {
                sibling = sibling.previousElementSibling;
                if (sibling.nodeName.toLowerCase() === selector) nth++;
            }
            selector += `:nth-of-type(${nth})`;
        }
        path.unshift(selector);
        element = element.parentElement;
    }
    return path.join(" > ");
}

function getElementFromPath(path) {
    return document.querySelector(path);
}

function removeShuffleButton(element, button) {
    button.remove();
    chrome.storage.local.get({ shuffleButtons: [] }, (result) => {
        const shuffleButtons = result.shuffleButtons;
        const newShuffleButtons = shuffleButtons.filter(buttonData => {
            const el = getElementFromPath(buttonData.elementPath);
            return el !== element;
        });
        chrome.storage.local.set({ shuffleButtons: newShuffleButtons });
    });
}

function clearAllShuffleButtons() {
    document.querySelectorAll('.button-container').forEach(button => button.remove());
    chrome.storage.local.set({ shuffleButtons: [] });
}

// Add CSS for highlighted elements
const style = document.createElement("style");
style.textContent = `
  .highlighted {
    outline: 2px solid rgb(213, 234, 255);
  }
  .button-container button {
    opacity: 0.9;
    transition: opacity 0.1s;
  }
  .button-container button:hover {
    opacity: 1;
  }
`;
document.head.appendChild(style);
