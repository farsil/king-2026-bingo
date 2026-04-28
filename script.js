const bingo = [
    "Oggetto smarrito",
    "Round di spareggio",
    "Si blocca una freccia",
    "2 o più fail in un round",
    "Chart di Exchswasion",
    "Pass con meno di 80% EX",
    "Pareggio EX",
    "Quattro stelline (100% ITG)",
    "Tutti fanno più di 96% EX su una chart",
    "LosT estratta",
    "Qualcuno si sente male",
    "You tried (quasi quad)",
    "Dandoscoring (0 Excellent + merda varia)",
    "Crasha il gioco",
    "Il torneo parte in orario",
    "Chart di Lama",
    "Piantino al torneo",
    "Black & White (16) in finale",
    "Borsa non fa la tech",
    "Nessuno fa più di 96% EX su una chart",
    "Salta la corrente",
    "Un giocatore si ritira",
    "Comeback in finale (da 2-0 a 2-3)",
    "Precisione Leccese (xx.00% EX)"
]

function useTemplate(templateId) {
    const templateElement = document.getElementById(templateId);
    const clone = document.importNode(templateElement.content, true);

    const root = document.getElementById("root");
    while (root.childElementCount > 0) {
        root.removeChild(root.lastChild);
    }
    root.appendChild(clone);
}

function getTextNode(element) {
    return Array.from(element.childNodes).find(
        node => node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== ''
    );
}

function shuffleArray(array, rand) {
    const clone = array.slice();
    for (let i = clone.length - 1; i >= 1; i--) {
        const j = Math.floor(rand() * (i + 1));
        [clone[i], clone[j]] = [clone[j], clone[i]];
    }
    return clone;
}

// Get hash from string, used to initialize PRNG
function cyrb128(str) {
    let h1 = 1779033703, h2 = 3144134277,
        h3 = 1013904242, h4 = 2773480762;
    for (let i = 0, k; i < str.length; i++) {
        k = str.charCodeAt(i);
        h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
        h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
        h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
        h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
    }
    h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
    h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
    h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
    h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
    h1 ^= (h2 ^ h3 ^ h4), h2 ^= h1, h3 ^= h1, h4 ^= h1;
    return [h1 >>> 0, h2 >>> 0, h3 >>> 0, h4 >>> 0];
}

// Simple PNRG for low-security applications
function sfc32(a, b, c, d) {
    return function () {
        a |= 0;
        b |= 0;
        c |= 0;
        d |= 0;
        let t = (a + b | 0) + d | 0;
        d = d + 1 | 0;
        a = b ^ b >>> 9;
        b = c + (c << 3) | 0;
        c = (c << 21 | c >>> 11);
        c = c + t | 0;
        return (t >>> 0) / 4294967296;
    }
}

function getStoredSet(key) {
    const value = window.localStorage.getItem(key);
    return value ? new Set(value.split(",").map(Number)) : new Set();
}

function addToStoredSet(key, value) {
    const set = getStoredSet(key);
    if (set.size === 0) {
        window.localStorage.setItem(key, value);
    } else {
        set.add(Number(value));
        window.localStorage.setItem(key, Array.from(set.values().map(String)).join(","));
    }
}

function removeFromStoredSet(key, value) {
    const set = getStoredSet(key);
    if (set.size > 0) {
        set.delete(Number(value));
        window.localStorage.setItem(key, Array.from(set.values().map(String)).join(","));
    }
}

function generateBingoCard() {
    useTemplate("bingo-card-template");
    const name = window.localStorage.getItem("name");
    const activeCells = getStoredSet("active");

    const mainElement = document.querySelector("main");

    const h2Element = mainElement.querySelector("h2");
    getTextNode(h2Element).textContent = `Fai del tuo peggio, ${name}`

    const changeNameButtonElement = h2Element.querySelector("button");
    changeNameButtonElement.onclick = handleNameChangeClick;

    const rand = sfc32(...cyrb128(name.toLowerCase()));
    const shuffledBingo = shuffleArray(bingo, rand);
    shuffledBingo.splice(12, 0, "Free");

    let i = 0;
    for (const trElement of mainElement.querySelectorAll("tr")) {
        for (const tdElement of trElement.querySelectorAll("td")) {
            const tdButtonElement = tdElement.querySelector("button");
            if (i === 12) {
                tdButtonElement.dataset.active = "true";
                tdButtonElement.disabled = true;
            }
            tdButtonElement.textContent = shuffledBingo[i];
            if (activeCells.has(i)) tdButtonElement.dataset.active = "true";
            tdButtonElement.dataset.index = i.toString();
            tdButtonElement.onclick = handleBingoCardClick;
            i++;
        }
    }


    const claimedSequences = getStoredSet("claimed");
    const footerElement = document.querySelector("footer");

    i = 0;
    for (const buttonElement of footerElement.querySelectorAll("button")) {
        if (claimedSequences.has(i)) buttonElement.dataset.active = "true";
        buttonElement.dataset.index = i.toString();
        buttonElement.onclick = handleBingoSequenceClick;
        i++;
    }
}

function handleBingoCardClick(e) {
    const buttonElement = e.target;
    if ('active' in buttonElement.dataset) {
        delete buttonElement.dataset.active;
        removeFromStoredSet("active", buttonElement.dataset.index);
    } else {
        buttonElement.dataset.active = "true";
        addToStoredSet("active", buttonElement.dataset.index);
    }
}

function handleBingoSequenceClick(e) {
    const buttonElement = e.currentTarget;
    if ('active' in buttonElement.dataset) {
        delete buttonElement.dataset.active;
        removeFromStoredSet("claimed", buttonElement.dataset.index);
    } else {
        buttonElement.dataset.active = "true";
        addToStoredSet("claimed", buttonElement.dataset.index);
    }
}

function handleNameChangeClick() {
    window.localStorage.clear();
    location.reload();
}

function handleInputChange(e) {
    const name = e.target.value;
    const formElement = document.querySelector("form");
    const buttonElement = formElement.querySelector("button");
    buttonElement.disabled = name.length === 0;
}

function handleSubmitName(e) {
    e.preventDefault();
    const name = e.target.name.value.trim();
    window.localStorage.setItem("name", name);
    generateBingoCard();
}


if (window.localStorage.getItem("name")) {
    generateBingoCard();
} else {
    useTemplate("name-entry-template");
    const formElement = document.querySelector("form");
    formElement?.querySelector("input")?.addEventListener("input", handleInputChange);
    formElement?.addEventListener("submit", handleSubmitName);
}

