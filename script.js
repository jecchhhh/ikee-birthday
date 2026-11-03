// =====================================
// BASIC ELEMENTS
// =====================================

const TOTAL_PAGES = 14;

const pages = Array.from(
    { length: TOTAL_PAGES },
    (_, i) => `pages/page-${String(i + 1).padStart(2, "0")}.jpg`
);

const introScreen = document.getElementById("introScreen");
const bookScreen = document.getElementById("bookScreen");

const openEnvelopeButton = document.getElementById("openEnvelope");

const closedCover = document.getElementById("closedCover");
const openBookButton = document.getElementById("openBook");

const bookDisplay = document.getElementById("bookDisplay");
const bookMount = document.getElementById("bookMount");

const bookControls = document.getElementById("bookControls");

const previousButton = document.getElementById("previousPage");
const nextButton = document.getElementById("nextPage");

const pageCounter = document.getElementById("pageCounter");

const readAgainButton = document.getElementById("readAgain");

const backgroundMusic = document.getElementById("backgroundMusic");

const petalContainer = document.getElementById("petalContainer");
const flowerConfetti = document.getElementById("flowerConfetti");

let pageFlip = null;

let isInitializing = false;
let isBookInitialized = false;
let isBookOpen = false;
let musicStarted = false;
let openingRequest = false;


// =====================================
// PRELOAD ALL BOOK PAGES
// =====================================

const preloadPromises = pages.map(src => {

    return new Promise(resolve => {

        const img = new Image();

        img.onload = resolve;

        img.onerror = () => {
            console.error("Unable to load image:", src);
            resolve();
        };

        img.src = src;

        if (img.complete) {
            resolve();
        }

    });

});

const allPagesReady = Promise.all(preloadPromises);


// =====================================
// FLOWER CONFETTI
// =====================================

function createFlowerConfetti() {

    const flowers = ["✿", "❀", "✾", "✽", "♡"];

    const colors = [
        "#D9A9A2",
        "#E8C9A7",
        "#A5A78A",
        "#C98F89",
        "#F0D99D"
    ];

    const envelope = document.querySelector(".envelope");
    const rect = envelope.getBoundingClientRect();

    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;

    for (let i = 0; i < 32; i++) {

        const flower = document.createElement("span");

        flower.classList.add("flower-piece");

        const angle = (Math.PI * 2 * i) / 32;

        const distance = 100 + Math.random() * 190;

        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance - 35;

        flower.textContent =
            flowers[Math.floor(Math.random() * flowers.length)];

        flower.style.left = `${originX}px`;
        flower.style.top = `${originY}px`;

        flower.style.setProperty("--flower-x", `${x}px`);
        flower.style.setProperty("--flower-y", `${y}px`);

        flower.style.setProperty(
            "--flower-rotation",
            `${Math.random() * 500 - 250}deg`
        );

        flower.style.setProperty(
            "--flower-size",
            `${13 + Math.random() * 13}px`
        );

        flower.style.setProperty(
            "--flower-duration",
            `${1.5 + Math.random() * 1.2}s`
        );

        flower.style.color =
            colors[Math.floor(Math.random() * colors.length)];

        flower.style.fontSize =
            `${13 + Math.random() * 13}px`;

        flowerConfetti.appendChild(flower);

        flower.addEventListener("animationend", () => {
            flower.remove();
        });

    }

}


// =====================================
// OPEN ENVELOPE
// =====================================

openEnvelopeButton.addEventListener("click", () => {

    if (musicStarted) return;

    musicStarted = true;

    backgroundMusic.volume = 0.35;

    backgroundMusic.play().catch(() => {
        console.log("Music could not start. Check music/slow-dance.mp3");
    });

    createFlowerConfetti();

    introScreen.classList.add("opening");

    setTimeout(() => {

        introScreen.style.display = "none";

        bookScreen.classList.add("visible");

    }, 850);

});


// =====================================
// INITIALIZE FLIPBOOK
// =====================================

async function initializeBook() {

    if (isBookInitialized || isInitializing) return;

    isInitializing = true;

    await allPagesReady;

    if (!window.St || !window.St.PageFlip) {

        alert(
            "The page-flip library could not load. Please check your internet connection and refresh the page."
        );

        isInitializing = false;

        return;
    }

    pageFlip = new St.PageFlip(bookMount, {

        width: 420,
        height: 594,

        size: "stretch",

        minWidth: 280,
        maxWidth: 420,

        minHeight: 396,
        maxHeight: 594,

        drawShadow: true,
        maxShadowOpacity: 0.45,

        flippingTime: 1100,

        usePortrait: true,

        startPage: 0,

        autoSize: false,

        showCover: true,

        mobileScrollSupport: false,

        useMouseEvents: true,

        swipeDistance: 30,

        disableFlipByClick: false

    });


    // UPDATE WHEN PAGE CHANGES

    pageFlip.on("flip", event => {

        updatePageCounter(event.data);

    });


    // WHEN FLIPBOOK IS READY

    pageFlip.on("init", () => {

        isBookInitialized = true;

        isInitializing = false;

        updatePageCounter(0);

        if (openingRequest) {

            openingRequest = false;

            pageFlip.flipNext("bottom");

        }

    });


    // LOAD ALL 14 PAGES

    pageFlip.loadFromImages(pages);

}


// =====================================
// OPEN THE BOOK
// =====================================

openBookButton.addEventListener("click", async () => {

    if (isBookOpen || isInitializing) return;

    isBookOpen = true;

    closedCover.style.display = "none";

    bookDisplay.classList.add("visible");

    bookMount.classList.add("visible");

    bookControls.classList.add("visible");

    if (!isBookInitialized) {

        openingRequest = true;

        await initializeBook();

    } else {

        pageFlip.flipNext("bottom");

    }

});


// =====================================
// UPDATE PAGE COUNTER AND FINAL COVER
// =====================================

function updatePageCounter(index) {

    if (index === 0) {

        pageCounter.textContent = "Front cover";

    } else if (index === 13) {

        pageCounter.textContent = "Back cover";

    } else {

        const firstPage = index + 1;

        const lastPage = Math.min(index + 2, 13);

        pageCounter.textContent =
            `${firstPage} — ${lastPage} / ${TOTAL_PAGES}`;

    }

    previousButton.disabled = index === 0;

    nextButton.disabled = index === 13;

    // Show the read-again button only on the actual final page.
    readAgainButton.classList.toggle("visible", index === 13);

}


// =====================================
// NEXT PAGE
// =====================================

nextButton.addEventListener("click", () => {

    if (!pageFlip || !isBookOpen) return;

    const currentIndex = pageFlip.getCurrentPageIndex();

    if (currentIndex < TOTAL_PAGES - 1) {

        pageFlip.flipNext("bottom");

    }

});


// =====================================
// PREVIOUS PAGE
// =====================================

previousButton.addEventListener("click", () => {

    if (!pageFlip || !isBookOpen) return;

    const currentIndex = pageFlip.getCurrentPageIndex();

    if (currentIndex > 0) {

        pageFlip.flipPrev("bottom");

    }

});


// =====================================
// READ AGAIN
// =====================================

readAgainButton.addEventListener("click", () => {

    if (!pageFlip) return;

    readAgainButton.classList.remove("visible");

    pageFlip.turnToPage(0);

    pageCounter.textContent = "Front cover";

    previousButton.disabled = true;

    nextButton.disabled = false;

});


// =====================================
// KEYBOARD NAVIGATION
// =====================================

document.addEventListener("keydown", event => {

    if (!pageFlip || !isBookOpen) return;

    if (event.key === "ArrowRight") {

        if (pageFlip.getCurrentPageIndex() < TOTAL_PAGES - 1) {

            pageFlip.flipNext("bottom");

        }

    }

    if (event.key === "ArrowLeft") {

        if (pageFlip.getCurrentPageIndex() > 0) {

            pageFlip.flipPrev("bottom");

        }

    }

});


// =====================================
// FLOATING BACKGROUND PETALS
// =====================================

function createPetals() {

    for (let i = 0; i < 24; i++) {

        const petal = document.createElement("span");

        petal.classList.add("petal");

        petal.style.left = `${Math.random() * 100}%`;

        petal.style.animationDuration =
            `${12 + Math.random() * 15}s`;

        petal.style.animationDelay =
            `${Math.random() * -25}s`;

        petal.style.opacity =
            `${0.25 + Math.random() * 0.5}`;

        petal.style.transform =
            `scale(${0.6 + Math.random() * 0.8})`;

        petalContainer.appendChild(petal);

    }

}

createPetals();