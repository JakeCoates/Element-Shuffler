const browser = chrome || browser;

let selectingElement = false;
let previousHighlight = null;

window.addEventListener("load", () => {
    setTimeout(() => {
        loadShuffleButtons();
    }, 1000);
});

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "selectElement") {
        // Start selecting elements
        selectingElement = true;
        document.body.style.cursor = "crosshair";
        sendResponse({status: "Element selection started"});
    } else if (request.action === "clearElements") {
        // Clear all shuffle buttons
        clearAllShuffleButtons();
        sendResponse({status: "Elements cleared"});
    }
});

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

document.addEventListener("click", (e) => {
    if (selectingElement) {
        const element = e.target;
        addPermanentButtons(element);
        selectingElement = false;
        document.body.style.cursor = "default";
        if (previousHighlight) {
            previousHighlight.classList.remove("highlighted");
        }
    }
});

function addPermanentButtons(element, existingPosition) {
    const buttonContainer = createButtonContainer(element, existingPosition);
    document.body.appendChild(buttonContainer);

    // Save the button position and associated element information to storage
    if (!existingPosition) {
        saveButtonPosition(element, buttonContainer);
    }
}

function createButtonContainer(element, existingPosition) {
    const buttonContainer = document.createElement("div");
    buttonContainer.className = "button-container";
    buttonContainer.innerHTML = `
        <button class="up-button">⬆️</button>
        <button class="down-button">⬇️</button>
        <button class="left-button">⬅️</button>
        <button class="right-button">➡️</button>
        <button class="shuffle-button">Shuffle</button>
        <button class="remove-button">✖</button>
    `;

    const rect = element.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const topPosition = rect.top + window.scrollY - 34;
    const bottomPosition = rect.bottom + window.scrollY + 5;

    if (existingPosition) {
        buttonContainer.style.top = existingPosition.top;
        buttonContainer.style.left = existingPosition.left;
    } else {
        buttonContainer.style.top = topPosition < 0 ? `${bottomPosition}px` : `${topPosition}px`;
        buttonContainer.style.left = `${rect.left + window.scrollX}px`;
    }

    buttonContainer.style.position = "absolute";
    buttonContainer.style.zIndex = 9999;
    buttonContainer.style.display = "flex";
    buttonContainer.style.alignItems = "center";
    buttonContainer.style.gap = "5px";

    styleButton(buttonContainer.querySelector(".shuffle-button"), "rgba(0, 0, 0, .55)", "white");
    styleButton(buttonContainer.querySelector(".remove-button"), "rgba(0, 0, 0, .55)", "white");
    styleButton(buttonContainer.querySelector(".up-button"), "rgba(0, 0, 0, .55)", "white");
    styleButton(buttonContainer.querySelector(".down-button"), "rgba(0, 0, 0, .55)", "white");
    styleButton(buttonContainer.querySelector(".left-button"), "rgba(0, 0, 0, .55)", "white");
    styleButton(buttonContainer.querySelector(".right-button"), "rgba(0, 0, 0, .55)", "white");

    addEventListeners(buttonContainer, element);

    return buttonContainer;
}

function styleButton(button, bgColor, color) {
    button.style.backgroundColor = bgColor;
    button.style.color = color;
    button.style.border = "1px solid rgba(255, 255, 255, .15)";
    button.style.borderRadius = "5px";
    button.style.padding = "4px";
    button.style.display = "flex";
    button.style.alignItems = "center";
    button.style.cursor = "pointer";
    button.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
}

function addEventListeners(buttonContainer, element) {
    const shuffleBtn = buttonContainer.querySelector(".shuffle-button");
    const upBtn = buttonContainer.querySelector(".up-button");
    const downBtn = buttonContainer.querySelector(".down-button");
    const leftBtn = buttonContainer.querySelector(".left-button");
    const rightBtn = buttonContainer.querySelector(".right-button");
    const removeBtn = buttonContainer.querySelector(".remove-button");

    shuffleBtn.addEventListener("click", () => shuffleChildren(element));
    upBtn.addEventListener("click", () => selectParentElement(element, buttonContainer));
    downBtn.addEventListener("click", () => selectChildElement(element, buttonContainer));
    leftBtn.addEventListener("click", () => selectPreviousSibling(element, buttonContainer));
    rightBtn.addEventListener("click", () => selectNextSibling(element, buttonContainer));
    removeBtn.addEventListener("click", () => removeShuffleButton(element, buttonContainer));

    shuffleBtn.addEventListener("mouseover", () => highlightElement(element));
    upBtn.addEventListener("mouseover", () => highlightElement(element.parentElement));
    downBtn.addEventListener("mouseover", () => highlightElement(element.firstElementChild));
    leftBtn.addEventListener("mouseover", () => highlightElement(element.previousElementSibling));
    rightBtn.addEventListener("mouseover", () => highlightElement(element.nextElementSibling));
    shuffleBtn.addEventListener("mouseout", () => removeHighlight());
    upBtn.addEventListener("mouseout", () => removeHighlight());
    downBtn.addEventListener("mouseout", () => removeHighlight());
    leftBtn.addEventListener("mouseout", () => removeHighlight());
    rightBtn.addEventListener("mouseout", () => removeHighlight());
}

function selectParentElement(element, buttonContainer) {
    if (element.parentElement) {
        updateButtonPosition(element.parentElement, buttonContainer);
    }
}

function selectChildElement(element, buttonContainer) {
    if (element.firstElementChild) {
        updateButtonPosition(element.firstElementChild, buttonContainer);
    }
}

function selectPreviousSibling(element, buttonContainer) {
    if (element.previousElementSibling) {
        updateButtonPosition(element.previousElementSibling, buttonContainer);
    }
}

function selectNextSibling(element, buttonContainer) {
    if (element.nextElementSibling) {
        updateButtonPosition(element.nextElementSibling, buttonContainer);
    }
}

function loadShuffleButtons() {
    chrome.storage.local.get({ shuffleButtons: [] }, (result) => {
        const shuffleButtons = result.shuffleButtons;
        shuffleButtons.forEach(buttonData => {
            const element = getElementFromPath(buttonData.elementPath);
            if (element) {
                const existingPosition = { top: buttonData.top, left: buttonData.left };
                const buttonContainer = createButtonContainer(element, existingPosition);
                document.body.appendChild(buttonContainer);
            }
        });
    });
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

function highlightElement(element) {
    if (element) {
        element.classList.add("highlighted");
    }
}

function removeHighlight() {
    const highlightedElements = document.querySelectorAll(".highlighted");
    highlightedElements.forEach(el => el.classList.remove("highlighted"));
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

function updateButtonPosition(newElement, buttonContainer) {
    buttonContainer.remove();
    addPermanentButtons(newElement, { top: buttonContainer.style.top, left: buttonContainer.style.left });
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
