/* =========================================================
   UNICANVAS
   Main JavaScript
   One Space. Every Idea.
========================================================= */


/* =========================================================
   PAGE NAVIGATION
========================================================= */
console.log("UNICANVAS SCRIPT LOADED ONCE");
const pages = document.querySelectorAll(".page");
const navItems = document.querySelectorAll(".nav-item");

function showPage(pageName) {

  pages.forEach(page => {
    page.classList.remove("active");
  });

  const target = document.getElementById(pageName);

  if (target) {
    target.classList.add("active");
  }

  navItems.forEach(item => {
    item.classList.remove("active");

    if (item.dataset.page === pageName) {
      item.classList.add("active");
    }
  });

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

  document.querySelector(".sidebar")?.classList.remove("open");
}

document.addEventListener("click", event => {

  const button = event.target.closest("[data-page]");

  if (!button) return;

  showPage(button.dataset.page);
});


/* =========================================================
   MOBILE MENU
========================================================= */

const mobileMenu = document.getElementById("mobileMenu");
const sidebar = document.querySelector(".sidebar");

if (mobileMenu && sidebar) {

  mobileMenu.addEventListener("click", () => {
    sidebar.classList.toggle("open");
  });

}


/* =========================================================
   TOAST
========================================================= */

const toast = document.getElementById("toast");

function showToast(message) {

  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(window.toastTimer);

  window.toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}


/* =========================================================
   PROJECT CREATION
========================================================= */

const projectGrid = document.getElementById("projectGrid");
const newProjectBtn = document.getElementById("newProjectBtn");
const addProjectCard = document.getElementById("addProjectCard");

function createProject() {

  const name = prompt("What is the name of your new project?");

  if (!name || !name.trim()) return;

  if (!projectGrid) return;

  const card = document.createElement("div");

  card.className = "project-card";

  card.innerHTML = `
    <div class="project-icon">✦</div>

    <div>
      <span>PROJECT</span>
      <h4>${escapeHTML(name)}</h4>
      <p>Ideas • Notes • Tasks</p>
    </div>

    <button class="open-project">→</button>
  `;

  projectGrid.insertBefore(card, addProjectCard);

  showToast("Project created ✦");
}

newProjectBtn?.addEventListener("click", createProject);
addProjectCard?.addEventListener("click", createProject);


/* =========================================================
   EXPLORE
========================================================= */

const exploreInput = document.getElementById("exploreSearch");
const exploreButton = document.getElementById("exploreButton");
const exploreResult = document.getElementById("exploreResult");

function explore() {

  if (!exploreInput || !exploreResult) return;

  const query = exploreInput.value.trim();

  if (!query) {

    exploreResult.innerHTML = `
      <strong>What would you like to explore?</strong>
      <br>
      <span>
        Search for a topic, idea, skill, invention, story or subject.
      </span>
    `;

    return;
  }

  exploreResult.innerHTML = `
    <div class="internal-explore">
      <div style="font-size:32px;margin-bottom:10px;">✦</div>

      <strong>Exploring "${escapeHTML(query)}"</strong>

      <p style="margin-top:10px;color:#a9a5c3;">
        UniCanvas is preparing an exploration space for this topic.
        You can discover ideas, videos, visual inspiration and
        creative possibilities without leaving UniCanvas.
      </p>

      <div style="
        display:grid;
        grid-template-columns:repeat(auto-fit,minmax(150px,1fr));
        gap:10px;
        margin-top:18px;
      ">

        <button class="uc-explore-action"
                data-explore-action="watch">
          ▶ Watch
        </button>

        <button class="uc-explore-action"
                data-explore-action="inspire">
          ✦ Inspire
        </button>

        <button class="uc-explore-action"
                data-explore-action="create">
          + Create
        </button>

        <button class="uc-explore-action"
                data-explore-action="ai">
          ✧ Ask AI
        </button>

      </div>
    </div>
  `;

  showToast("Exploration started ✦");
}

exploreButton?.addEventListener("click", explore);

exploreInput?.addEventListener("keydown", event => {

  if (event.key === "Enter") {
    explore();
  }

});


document.addEventListener("click", event => {

  const action = event.target.closest(".uc-explore-action");

  if (!action) return;

  showPage(action.dataset.exploreAction);

});


/* =========================================================
   AI CHAT
========================================================= */

/* =========================================================
   UNICANVAS AI STUDIO — SMART RESPONSE ENGINE
   ========================================================= */

/* =========================================================
   UNICANVAS — REAL AI STUDIO
   Browser → Your Backend → OpenAI Responses API
   ========================================================= */

const aiInput = document.getElementById("aiInput");
const sendAI = document.getElementById("sendAI");
const chatMessages = document.getElementById("chatMessages");

let aiHistory = [];


/* ---------- ADD MESSAGE ---------- */

function addMessage(text, type) {

    if (!chatMessages) return;

    const message = document.createElement("div");

    message.className =
        type === "user"
            ? "message user-message"
            : "message ai-message";

    message.innerHTML = `
        <div class="message-avatar">
            ${type === "user" ? "U" : "✦"}
        </div>

        <div>
            <p>${escapeHTML(text)}</p>
        </div>
    `;

    chatMessages.appendChild(message);

    chatMessages.scrollTop =
        chatMessages.scrollHeight;
}


/* ---------- TYPING MESSAGE ---------- */

function addThinkingMessage() {

    if (!chatMessages) return null;

    const message =
        document.createElement("div");

    message.className =
        "message ai-message";

    message.id =
        "ai-thinking-message";

    message.innerHTML = `
        <div class="message-avatar">✦</div>

        <div>
            <p class="ai-thinking">
                Thinking<span>.</span><span>.</span><span>.</span>
            </p>
        </div>
    `;

    chatMessages.appendChild(message);

    chatMessages.scrollTop =
        chatMessages.scrollHeight;

    return message;
}


/* ---------- TALK TO REAL AI ---------- */

async function generateAIResponse(userText) {

    aiHistory.push({
        role: "user",
        content: userText
    });

    /*
       Keep the conversation reasonably small.
       The latest messages are enough for context.
    */

    const recentHistory =
        aiHistory.slice(-12);

    const response =
        await fetch("/api/chat", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                messages: recentHistory
            })
        });

    if (!response.ok) {

        let errorMessage =
            "The AI could not respond right now.";

        try {

            const error =
                await response.json();

            if (error.error) {
                errorMessage =
                    error.error;
            }

        } catch (_) {}

        throw new Error(errorMessage);
    }

    const data =
        await response.json();

    const answer =
        data.reply ||
        "I couldn't generate a response.";

    aiHistory.push({
        role: "assistant",
        content: answer
    });

    return answer;
}


/* ---------- SEND ---------- */

async function sendMessage() {

    if (!aiInput || !sendAI) return;

    const text =
        aiInput.value.trim();

    if (!text) return;

    addMessage(text, "user");

    aiInput.value = "";

    sendAI.disabled = true;

    const thinking =
        addThinkingMessage();

    try {

        const response =
            await generateAIResponse(text);

        thinking?.remove();

        addMessage(
            response,
            "ai"
        );

    } catch (error) {

        console.error(
            "UniCanvas AI error:",
            error
        );

        thinking?.remove();

        addMessage(
            "I couldn't connect to the AI right now. Please try again.",
            "ai"
        );

    } finally {

        sendAI.disabled = false;

        aiInput.focus();
    }
}


/* ---------- SEND BUTTON ---------- */

sendAI?.addEventListener(
    "click",
    sendMessage
);


/* ---------- ENTER ---------- */

aiInput?.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {

            event.preventDefault();

            sendMessage();
        }
    }
);


/* ---------- SUGGESTIONS ---------- */

document
    .querySelectorAll(".suggestions button")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                if (!aiInput) return;

                aiInput.value =
                    button.textContent;

                sendMessage();
            }
        );
    });

/* =========================================================
   SUGGESTION BUTTONS
   ========================================================= */

document
    .querySelectorAll(".suggestions button")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                if (!aiInput) return;

                aiInput.value =
                    button.textContent;

                sendMessage();

            }
        );

    });


/* =========================================================
   RANDOM IDEA
========================================================= */

const randomIdea =
  document.getElementById("randomIdea");

const ideas = [

  "Design an app that helps people reduce wasted water.",

  "Invent a backpack that changes how students carry their books.",

  "Create a story where humans discover a second Earth.",

  "Design a school where every subject becomes an adventure.",

  "Imagine a device that translates emotions into colours.",

  "Invent something that could make classrooms more interactive.",

  "Create an eco-friendly invention for homes.",

  "Design a futuristic city for people and nature."

];

randomIdea?.addEventListener("click", () => {

  const idea =
    ideas[Math.floor(Math.random() * ideas.length)];

  showPage("ai");

  setTimeout(() => {
    addMessage(idea, "ai");
  }, 200);

});


/* =========================
   UNICANVAS YOUTUBE WATCH
========================= */

const YOUTUBE_API_KEY = "AIzaSyBZozGKP5QgHSgwCsFT9BBea3pdoFdxdAc";

const watchSearch = document.getElementById("watchSearch");
const watchSearchButton = document.getElementById("watchSearchButton");
const watchResults = document.getElementById("watchResults");
const watchPlayer = document.getElementById("watchPlayer");

async function searchYouTubeVideos() {
    const query = watchSearch.value.trim();

    if (!query) {
        showToast("Type something to search.");
        return;
    }

    watchResults.innerHTML = `
        <div class="watch-loading">
            🔎 Searching YouTube for "${escapeHTML(query)}"...
        </div>
    `;

    try {
        const url =
            "https://www.googleapis.com/youtube/v3/search" +
            "?part=snippet" +
            "&q=" + encodeURIComponent(query) +
            "&type=video" +
            "&videoEmbeddable=true" +
            "&maxResults=12" +
            "&regionCode=AE" +
            "&key=" + YOUTUBE_API_KEY;

        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            console.error(data);
            throw new Error(data.error?.message || "YouTube search failed.");
        }

        if (!data.items || data.items.length === 0) {
            watchResults.innerHTML = `
                <div class="watch-empty">
                    No videos found for "${escapeHTML(query)}".
                </div>
            `;
            return;
        }

        watchResults.innerHTML = data.items.map(video => {
            const videoId = video.id.videoId;
            const title = video.snippet.title;
            const channel = video.snippet.channelTitle;
            const thumbnail = video.snippet.thumbnails.medium.url;

            return `
    <article class="youtube-result" data-video-id="${videoId}">
        <img src="${thumbnail}" alt="">

        <div class="youtube-result-info">
            <h3>${escapeHTML(title)}</h3>

            <p>${escapeHTML(channel)}</p>

            <button
                class="uni-youtube-save"
                type="button"
                style="
                    margin-top:10px;
                    padding:8px 13px;
                    border-radius:12px;
                    border:1px solid rgba(255,255,255,.15);
                    background:rgba(139,92,246,.20);
                    color:white;
                    cursor:pointer;
                    font-size:13px;
                "
            >
                ＋ Save to Project
            </button>
        </div>
    </article>
`;
          }).join("");
        document.querySelectorAll(".youtube-result").forEach(card => {

    card.addEventListener("click", (event) => {

        /* Don't play the video when Save is clicked */
        if (
            event.target.closest(".uni-youtube-save")
        ) {
            return;
        }

        const videoId =
            card.dataset.videoId;

        playYouTubeVideo(videoId);

    });

});
      

    } catch (error) {
        console.error(error);

        watchResults.innerHTML = `
            <div class="watch-error">
                ⚠️ ${escapeHTML(error.message)}
            </div>
        `;
    }
}

function playYouTubeVideo(videoId) {
    watchPlayer.innerHTML = `
        <div class="youtube-player-wrapper">
            <iframe
                src="https://www.youtube.com/embed/${videoId}?autoplay=1"
                title="YouTube video player"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowfullscreen>
            </iframe>
        </div>
    `;

    watchPlayer.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

if (watchSearchButton) {
    watchSearchButton.addEventListener("click", searchYouTubeVideos);
}

if (watchSearch) {
    watchSearch.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            searchYouTubeVideos();
        }
    });
}



/* =========================================================
   INSPIRE — INTERNAL PINTEREST-STYLE EXPERIENCE
========================================================= */

const inspirationData = [

  {
    title:"Future City",
    category:"DESIGN",
    icon:"🏙️",
    description:"Imagine a city designed around people, nature and creativity."
  },

  {
    title:"Space Ideas",
    category:"SCIENCE",
    icon:"🚀",
    description:"Explore visual ideas inspired by planets, galaxies and space."
  },

  {
    title:"Creative Art",
    category:"ART",
    icon:"🎨",
    description:"Turn ordinary ideas into unusual visual concepts."
  },

  {
    title:"Eco Inventions",
    category:"INVENTION",
    icon:"🌱",
    description:"Ideas for inventions that could help people and the planet."
  },

  {
    title:"Story Worlds",
    category:"STORY",
    icon:"📖",
    description:"Build characters, worlds and stories from a single idea."
  },

  {
    title:"Architecture",
    category:"DESIGN",
    icon:"🏛️",
    description:"Discover unusual spaces, buildings and future designs."
  },

  {
    title:"Ocean Ideas",
    category:"NATURE",
    icon:"🌊",
    description:"Creative concepts inspired by oceans and marine life."
  },

  {
    title:"Tech Concepts",
    category:"TECH",
    icon:"⚡",
    description:"Imagine technology that solves everyday problems."
  }

];


function buildInternalInspiration() {

  const inspirePage =
    document.getElementById("inspire");

  if (!inspirePage) return;

  const old =
    document.getElementById("uniInspirationFeed");

  if (old) old.remove();

  const feed =
    document.createElement("div");

  feed.id =
    "uniInspirationFeed";

  feed.style.cssText = `
    display:grid;
    grid-template-columns:
      repeat(auto-fit,minmax(190px,1fr));
    gap:18px;
    margin-top:25px;
  `;

  inspirationData.forEach((item, index) => {

    const card =
      document.createElement("article");

    card.className =
      "uni-inspiration-card";

    card.dataset.search =
      (
        item.title +
        " " +
        item.category +
        " " +
        item.description
      ).toLowerCase();

    card.style.cssText = `
      min-height:${220 + (index % 3) * 35}px;
      padding:20px;
      border-radius:24px;
      border:1px solid rgba(255,255,255,.10);
      background:
        linear-gradient(
          145deg,
          rgba(139,92,246,.20),
          rgba(91,140,255,.10)
        );
      display:flex;
      flex-direction:column;
      justify-content:flex-end;
      position:relative;
      overflow:hidden;
      cursor:pointer;
      transition:.25s ease;
    `;

    card.innerHTML = `

      <div style="
        position:absolute;
        inset:0;
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:65px;
        opacity:.9;
        pointer-events:none;
      ">
        ${item.icon}
      </div>

      <div style="
        position:relative;
        z-index:2;
      ">

        <small style="
          color:#65d8ff;
          font-weight:700;
          letter-spacing:1px;
        ">
          ${escapeHTML(item.category)}
        </small>

        <h3 style="margin:6px 0;">
          ${escapeHTML(item.title)}
        </h3>

        <p style="
          color:#a9a5c3;
          margin:0;
          font-size:14px;
        ">
          ${escapeHTML(item.description)}
        </p>

        <button
          class="uni-inspire-save"
          style="
            margin-top:14px;
            border:1px solid rgba(255,255,255,.12);
            background:rgba(0,0,0,.20);
            color:white;
            padding:8px 13px;
            border-radius:12px;
            cursor:pointer;
          "
        >
          ♡ Save
        </button>

      </div>

    `;

    feed.appendChild(card);

  });


  const search =
    document.getElementById("inspireSearch");

  if (search) {
    search.parentElement.after(feed);
  } else {
    inspirePage.appendChild(feed);
  }

}

buildInternalInspiration();


/* =========================================================
   INSPIRE SEARCH
========================================================= */

const inspireSearch =
  document.getElementById("inspireSearch");

inspireSearch?.addEventListener("input", () => {

  const query =
    inspireSearch.value
      .trim()
      .toLowerCase();

  document
    .querySelectorAll(".uni-inspiration-card")
    .forEach(card => {

      card.style.display =
        card.dataset.search.includes(query)
          ? ""
          : "none";

    });

});


/* =========================================================
   INSPIRE SAVE
========================================================= */


/* =========================================
   INSPIRE — SAVE RESOURCE
   ========================================= */

document.addEventListener("click", function (event) {

    const button =
        event.target.closest(".uni-inspire-save");

    if (!button) return;

    event.preventDefault();
    event.stopPropagation();

    const card =
        button.closest(".uni-inspiration-card");

    if (!card) return;

    const title =
        card.querySelector("h3")
        ?.textContent.trim()
        || "Inspiration";

    const category =
        card.querySelector("small")
        ?.textContent.trim()
        || "Inspiration";

    const description =
        card.querySelector("p")
        ?.textContent.trim()
        || "";

    const image =
        card.querySelector("img")
        ?.src
        || "";

    let resources = [];

    try {
        resources =
            JSON.parse(
                localStorage.getItem(
                    "unicanvas_saved_resources"
                )
            ) || [];
    } catch (error) {
        resources = [];
    }

    const alreadySaved =
        resources.some(item =>
            item.type === "Inspiration" &&
            item.title === title &&
            item.image === image
        );

    if (alreadySaved) {

        button.textContent = "✓ Saved";

        showToast("Already saved ✦");

        return;
    }

    resources.push({

        id: Date.now(),

        type: "Inspiration",

        title: title,

        category: category,

        description: description,

        image: image,

        savedAt:
            new Date().toLocaleString()

    });

    localStorage.setItem(
        "unicanvas_saved_resources",
        JSON.stringify(resources)
    );

    button.textContent = "✓ Saved";

    showToast("✦ Saved to Saved Resources!");

    if (
        typeof loadSavedResources ===
        "function"
    ) {
        loadSavedResources();
    }

});
/* =========================================================
   CREATE
========================================================= */

let currentCreationType = "Story";

const creationTypeLabel =
  document.getElementById("creationTypeLabel");

document.querySelectorAll(".creation-type")
  .forEach(button => {

    button.addEventListener("click", () => {

      document
        .querySelectorAll(".creation-type")
        .forEach(item =>
          item.classList.remove("active")
        );

      button.classList.add("active");

      currentCreationType =
        button.dataset.type;

      if (creationTypeLabel) {

        creationTypeLabel.textContent =
          `Creating: ${currentCreationType}`;

      }

    });

  });


/* =========================================================
   SAVE DRAFT
========================================================= */

document
  .getElementById("saveDraft")
  ?.addEventListener("click", () => {

    const title =
      document
        .getElementById("creationTitle")
        .value;

    const text =
      document
        .getElementById("creationText")
        .value;

    localStorage.setItem(
      "unicCanvasDraft",
      JSON.stringify({
        title,
        text,
        type: currentCreationType
      })
    );

    showToast("Draft saved locally ✓");

  });


/* =========================================================
   LOAD DRAFT
========================================================= */

window.addEventListener("load", () => {

  const saved =
    localStorage.getItem(
      "unicCanvasDraft"
    );

  if (!saved) return;

  try {

    const draft =
      JSON.parse(saved);

    const title =
      document.getElementById("creationTitle");

    const text =
      document.getElementById("creationText");

    if (title) {
      title.value = draft.title || "";
    }

    if (text) {
      text.value = draft.text || "";
    }

    if (draft.type) {

      currentCreationType =
        draft.type;

      if (creationTypeLabel) {
        creationTypeLabel.textContent =
          `Creating: ${draft.type}`;
      }

    }

  } catch {

    console.log("No valid draft found.");

  }

});


/* =========================================================
   PUBLISH CREATION
========================================================= */

document
  .getElementById("publishCreation")
  ?.addEventListener("click", () => {

    const title =
      document
        .getElementById("creationTitle")
        .value
        .trim();

    const text =
      document
        .getElementById("creationText")
        .value
        .trim();

    if (!title || !text) {

      showToast(
        "Add a title and some content first."
      );

      return;
    }

    const showcaseGrid =
      document.getElementById("showcaseGrid");

    if (!showcaseGrid) return;

    const card =
      document.createElement("article");

    card.className =
      "creation-card";

    card.innerHTML = `

      <div class="creator-row">

        <div class="avatar">U</div>

        <div>
          <strong>@yourcanvas</strong>
          <small>Creator</small>
        </div>

        <button class="follow-btn">
          Follow
        </button>

      </div>

      <div class="creation-preview preview-purple">
        <span>
          ${escapeHTML(title)}
        </span>
      </div>

      <div class="creation-actions">

        <button class="like-btn">
          ♡ <span>0</span>
        </button>

        <button>
          ♡ Comment
        </button>

        <button>
          ↗ Share
        </button>

      </div>

      <h3>
        ${escapeHTML(title)}
      </h3>

      <p>
        ${escapeHTML(text.substring(0,150))}
      </p>

    `;

    showcaseGrid.prepend(card);

    const creationCount =
      document.getElementById("creationCount");

    if (creationCount) {

      const current =
        parseInt(
          creationCount.textContent
        ) || 0;

      creationCount.textContent =
        current + 1;

    }

    document
      .getElementById("creationTitle")
      .value = "";

    document
      .getElementById("creationText")
      .value = "";

    showToast(
      "Your creation is now in Showcase ✦"
    );

    setTimeout(() => {

      showPage("showcase");

    }, 600);

  });


/* =========================================================
   LIKE BUTTONS
========================================================= */

document.addEventListener("click", event => {

  const button =
    event.target.closest(".like-btn");

  if (!button) return;

  const count =
    button.querySelector("span");

  if (!count) return;

  let number =
    parseInt(count.textContent) || 0;

  if (
    button.dataset.liked === "true"
  ) {

    number--;

    button.dataset.liked =
      "false";

    button.style.color = "";

  } else {

    number++;

    button.dataset.liked =
      "true";

    button.style.color =
      "#d49aff";

  }

  count.textContent =
    number;

});


/* =========================================================
   FOLLOW BUTTONS
========================================================= */

document.addEventListener("click", event => {

  const button =
    event.target.closest(".follow-btn");

  if (!button) return;

  if (
    button.textContent.trim() ===
    "Follow"
  ) {

    button.textContent =
      "Following";

    showToast(
      "Following creator ✦"
    );

  } else {

    button.textContent =
      "Follow";

  }

});


/* =========================================================
   NOTES
========================================================= */

const addNote =
  document.getElementById("addNote");

const notesList =
  document.getElementById("notesList");

addNote?.addEventListener("click", () => {

  const title =
    document
      .getElementById("noteTitle")
      .value
      .trim();

  const text =
    document
      .getElementById("noteText")
      .value
      .trim();

  if (!title || !text) {

    showToast(
      "Write a title and note first."
    );

    return;
  }

  const note =
    document.createElement("div");

  note.className =
    "note-card";

  note.innerHTML = `

    <span>💡</span>

    <div>
      <h3>
        ${escapeHTML(title)}
      </h3>

      <p>
        ${escapeHTML(text)}
      </p>
    </div>

  `;

  notesList.prepend(note);

  document
    .getElementById("noteTitle")
    .value = "";

  document
    .getElementById("noteText")
    .value = "";

  showToast("Note added ✓");

});


/* =========================================================
   TASKS
========================================================= */

const addTask =
  document.getElementById("addTask");

const taskInput =
  document.getElementById("taskInput");

const taskList =
  document.getElementById("taskList");

function addNewTask() {

  if (!taskInput || !taskList) return;

  const text =
    taskInput.value.trim();

  if (!text) return;

  const label =
    document.createElement("label");

  label.className =
    "task";

  label.innerHTML = `
    <input type="checkbox">
    <span>${escapeHTML(text)}</span>
  `;

  taskList.appendChild(label);

  taskInput.value = "";

  showToast("Task added ✓");
}

addTask?.addEventListener(
  "click",
  addNewTask
);

taskInput?.addEventListener(
  "keydown",
  event => {

    if (event.key === "Enter") {
      addNewTask();
    }

  }
);


/* =========================================================
   FOCUS TIMER
========================================================= */

/* =========================================
   UNICANVAS FOCUS MODE
   ========================================= */

let totalSeconds = 15 * 60;
let selectedDuration = 15;

let timerInterval = null;
let sessions = 0;

let focusPoints = 0;
let focusMinutes = 0;

let focusRunning = false;

const timerDisplay =
  document.getElementById("timer");

const focusStatus =
  document.getElementById("focusStatus");

const startTimer =
  document.getElementById("startTimer");

const resetTimer =
  document.getElementById("resetTimer");

const focusDuration =
  document.getElementById("focusDuration");

const sessionDisplay =
  document.getElementById("sessions");

const focusPointsDisplay =
  document.getElementById("focusPoints");

const focusMinutesDisplay =
  document.getElementById("focusMinutes");


/* -----------------------------------------
   LOAD PROJECTS
   ----------------------------------------- */



/* -----------------------------------------
   TIMER DISPLAY
   ----------------------------------------- */

function updateTimer() {

  if (!timerDisplay) return;

  const minutes =
    Math.floor(totalSeconds / 60);

  const seconds =
    totalSeconds % 60;

  timerDisplay.textContent =
    `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

}


/* -----------------------------------------
   DURATION CHANGE
   ----------------------------------------- */

focusDuration?.addEventListener(
  "change",
  () => {

    if (focusRunning) {

      focusStatus.textContent =
        "Pause or reset the session before changing the duration.";

      focusDuration.value =
        String(selectedDuration);

      return;

    }

    selectedDuration =
      Number(focusDuration.value) || 15;

    totalSeconds =
      selectedDuration * 60;

    updateTimer();

    focusStatus.textContent =
      `${selectedDuration} minute focus session ready.`;

  }
);


/* -----------------------------------------
   START / PAUSE / RESUME
   ----------------------------------------- */

startTimer?.addEventListener(
  "click",
  () => {

    /* PAUSE */

    if (timerInterval) {

      clearInterval(timerInterval);

      timerInterval = null;

      focusRunning = false;

      startTimer.textContent =
        "Resume Focus";

      focusStatus.textContent =
        "Paused. Your progress is saved.";

      return;

    }


    /* DON'T START WITHOUT A PROJECT */

    if (focusProject && !focusProject.value) {

      focusStatus.textContent =
        "Choose a project before starting Focus Mode.";

      focusProject.focus();

      return;

    }


    /* SESSION FINISHED */

    if (totalSeconds <= 0) {

      totalSeconds =
        selectedDuration * 60;

      updateTimer();

    }


    /* START */

    focusRunning = true;

    focusStatus.textContent =
      "Focus mode is active. ✦";

    startTimer.textContent =
      "Pause";


    timerInterval =
      setInterval(
        () => {

          if (totalSeconds <= 0) {

            clearInterval(
              timerInterval
            );

            timerInterval = null;

            focusRunning = false;

            sessions++;

            focusPoints += selectedDuration;

            focusMinutes += selectedDuration;


            if (sessionDisplay) {

              sessionDisplay.textContent =
                sessions;

            }


            if (focusPointsDisplay) {

              focusPointsDisplay.textContent =
                focusPoints;

            }


            if (focusMinutesDisplay) {

              focusMinutesDisplay.textContent =
                focusMinutes;

            }


            startTimer.textContent =
              "Start Focus";

            focusStatus.textContent =
              `Amazing! You completed ${selectedDuration} minutes of focus. ✦`;

            return;

          }


          totalSeconds--;

          updateTimer();

        },
        1000
      );

  }
);


/* -----------------------------------------
   RESET
   ----------------------------------------- */

resetTimer?.addEventListener(
  "click",
  () => {

    clearInterval(
      timerInterval
    );

    timerInterval = null;

    focusRunning = false;

    selectedDuration =
      Number(focusDuration?.value) || 15;

    totalSeconds =
      selectedDuration * 60;

    updateTimer();

    startTimer.textContent =
      "Start Focus";

    focusStatus.textContent =
      "Ready when you are.";

  }
);


/* -----------------------------------------
   INITIAL DISPLAY
   ----------------------------------------- */

updateTimer();

/* =========================================================
   GLOBAL SEARCH
========================================================= */

const globalSearch =
  document.getElementById(
    "globalSearch"
  );

globalSearch?.addEventListener(
  "keydown",
  event => {

    if (event.key !== "Enter")
      return;

    const query =
      globalSearch.value.trim();

    if (!query) return;

    if (exploreInput) {
      exploreInput.value =
        query;
    }

    showPage("explore");

    explore();

  }
);


/* =========================================================
   CREATOR SEARCH
========================================================= */

const creatorSearch =
  document.getElementById(
    "creatorSearch"
  );

creatorSearch?.addEventListener(
  "input",
  () => {

    const query =
      creatorSearch.value
        .toLowerCase();

    document
      .querySelectorAll(".person-card")
      .forEach(card => {

        const heading =
          card.querySelector("h3");

        if (!heading) return;

        const username =
          heading.textContent
            .toLowerCase();

        card.style.display =
          username.includes(query)
            ? ""
            : "none";

      });

  }
);


/* =========================================================
   KEYBOARD SHORTCUT
========================================================= */

document.addEventListener(
  "keydown",
  event => {

    if (
      event.ctrlKey &&
      event.key.toLowerCase() === "k"
    ) {

      event.preventDefault();

      globalSearch?.focus();

    }

  }
);


/* =========================================================
   SECURITY
========================================================= */

function escapeHTML(value) {

  return String(value)
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");

}


/* =========================================================
   STARTUP
========================================================= */

updateTimer();

console.log(
  "✦ UniCanvas loaded successfully."
);
/* =========================
   PROFILE EDITOR
========================= */

const editProfileBtn = document.getElementById("editProfileBtn");
const profileModal = document.getElementById("profileModal");
const closeProfileModal = document.getElementById("closeProfileModal");
const cancelProfileBtn = document.getElementById("cancelProfileBtn");
const saveProfileBtn = document.getElementById("saveProfileBtn");

const profileNameInput = document.getElementById("profileNameInput");
const profileUsernameInput = document.getElementById("profileUsernameInput");
const profileAgeInput = document.getElementById("profileAgeInput");
const profileNicknameInput = document.getElementById("profileNicknameInput");
const profileBioInput = document.getElementById("profileBioInput");

const profileName = document.getElementById("profileName");
const profileSubtitle = document.getElementById("profileSubtitle");
const profileAvatar = document.getElementById("profileAvatar");

function loadProfile() {
    const savedProfile = JSON.parse(
        localStorage.getItem("unicanvasProfile") || "{}"
    );

    if (savedProfile.name) {
        profileName.textContent =
            savedProfile.nickname || savedProfile.name;
    }

    if (savedProfile.username || savedProfile.bio || savedProfile.age) {
        const username = savedProfile.username
            ? "@" + savedProfile.username
            : "@yourcanvas";

        const bio = savedProfile.bio || "Explorer • Creator • Thinker";

        profileSubtitle.textContent =
            username + " • " + bio;
    }

    if (savedProfile.name || savedProfile.nickname) {
        const letter =
            (savedProfile.nickname || savedProfile.name)
            .charAt(0)
            .toUpperCase();

        profileAvatar.textContent = letter;
    }
}

function openProfileEditor() {
    const savedProfile = JSON.parse(
        localStorage.getItem("unicanvasProfile") || "{}"
    );

    profileNameInput.value = savedProfile.name || "";
    profileUsernameInput.value = savedProfile.username || "";
    profileAgeInput.value = savedProfile.age || "";
    profileNicknameInput.value = savedProfile.nickname || "";
    profileBioInput.value =
        savedProfile.bio || "";

    profileModal.classList.add("active");
}

function closeProfileEditor() {
    profileModal.classList.remove("active");
}

function saveProfile() {
    const profile = {
        name: profileNameInput.value.trim(),
        username: profileUsernameInput.value.trim().replace(/^@/, ""),
        age: profileAgeInput.value,
        nickname: profileNicknameInput.value.trim(),
        bio: profileBioInput.value.trim()
    };

    if (!profile.name) {
        showToast("Please enter your name.");
        return;
    }

    localStorage.setItem(
        "unicanvasProfile",
        JSON.stringify(profile)
    );

    loadProfile();
    closeProfileEditor();

    showToast("Profile updated! ✨");
}

if (editProfileBtn) {
    editProfileBtn.addEventListener("click", openProfileEditor);
}

if (closeProfileModal) {
    closeProfileModal.addEventListener("click", closeProfileEditor);
}

if (cancelProfileBtn) {
    cancelProfileBtn.addEventListener("click", closeProfileEditor);
}

if (saveProfileBtn) {
    saveProfileBtn.addEventListener("click", saveProfile);
}

if (profileModal) {
    profileModal.addEventListener("click", function(event) {
        if (event.target === profileModal) {
            closeProfileEditor();
        }
    });
}

loadProfile();
/* =========================
   UNICANVAS INSPIRE SEARCH
========================= */

/* =========================
   UNICANVAS INSPIRE
   ========================= */

(function () {

  const unsplashKey = "Tt2XUYJFZVdoAzFztGNuzXiPZmimu34B8XlYOHece6o";
  const giphyKey = "IDwdHodeM2Uamy3s4EVp53DOBf9dFw0A";

  const searchInput = document.getElementById("inspireSearch");
  const searchButton = document.getElementById("inspireSearchButton");
  const results = document.getElementById("inspireResults");

  if (!searchInput || !searchButton || !results) {
    return;
  }

  let items = [];
  let filter = "all";

  async function searchInspire() {

    const query = searchInput.value.trim();

    if (!query) {
      if (typeof showToast === "function") {
        showToast("Type something to search.");
      }
      return;
    }

    results.innerHTML = `
      <div class="inspire-loading">
        ✨ Finding inspiration...
      </div>
    `;

    try {

      const [photosResponse, gifsResponse] = await Promise.all([

        fetch(
          "https://api.unsplash.com/search/photos" +
          "?query=" + encodeURIComponent(query) +
          "&per_page=20" +
          "&client_id=" + unsplashKey
        ),

        fetch(
          "https://api.giphy.com/v1/gifs/search" +
          "?api_key=" + giphyKey +
          "&q=" + encodeURIComponent(query) +
          "&limit=20" +
          "&rating=g"
        )

      ]);

      const photosData = await photosResponse.json();
      const gifsData = await gifsResponse.json();

      if (!photosResponse.ok) {
        throw new Error(
          photosData.errors?.join(", ") ||
          "Unsplash search failed."
        );
      }

      if (!gifsResponse.ok) {
        throw new Error(
          gifsData.message ||
          "GIPHY search failed."
        );
      }

      const photos = (photosData.results || []).map(photo => ({
        type: "photo",
        image: photo.urls?.regular,
        title: photo.alt_description || "Inspiration",
        author: photo.user?.name || "Unsplash"
      }));

      const gifs = (gifsData.data || []).map(gif => ({
        type: "gif",
        image:
          gif.images?.original?.url ||
          gif.images?.downsized?.url,
        title: gif.title || "Animated inspiration",
        author: gif.username || "GIPHY"
      }));

      items = [...photos, ...gifs].filter(item => item.image);

      render();

    } catch (error) {

      console.error("Inspire error:", error);

      results.innerHTML = `
        <div class="inspire-error">
          ⚠️ ${escapeHTML(error.message)}
        </div>
      `;
    }
  }

  function render() {

    let visible = items;

    if (filter === "photos") {
      visible = items.filter(item => item.type === "photo");
    }

    if (filter === "gifs") {
      visible = items.filter(item => item.type === "gif");
    }

    if (!visible.length) {
      results.innerHTML = `
        <div class="inspire-empty">
          No results found.
        </div>
      `;
      return;
    }

    results.innerHTML = visible.map((item, index) => {

      const realIndex = items.indexOf(item);

      return `
        <article
          class="inspire-card"
          data-index="${realIndex}"
        >
          <img
            src="${item.image}"
            alt="${escapeHTML(item.title)}"
            loading="lazy"
          >

          <div class="inspire-card-info">
            <h3>${escapeHTML(item.title)}</h3>

            <p>
              ${item.type === "gif" ? "🎞️ GIF" : "📷 Photo"}
              • ${escapeHTML(item.author)}
            </p>
          </div>
        </article>
      `;

    }).join("");

    results.querySelectorAll(".inspire-card").forEach(card => {

      card.addEventListener("click", function () {

        const item = items[Number(this.dataset.index)];

        if (item) {
          openViewer(item);
        }

      });

    });
  }

  function openViewer(item) {

    const viewer = document.getElementById("inspireViewer");
    const image = document.getElementById("inspireViewerImage");
    const title = document.getElementById("inspireViewerTitle");

    if (!viewer || !image) return;

    image.src = item.image;

    if (title) {
      title.textContent = item.title || "Inspiration";
    }

    viewer.classList.add("active");
  }

  function closeViewer() {

    const viewer = document.getElementById("inspireViewer");
    const image = document.getElementById("inspireViewerImage");

    if (viewer) {
      viewer.classList.remove("active");
    }

    if (image) {
      image.src = "";
    }
  }

  searchButton.addEventListener("click", searchInspire);

  searchInput.addEventListener("keydown", function (event) {

    if (event.key === "Enter") {
      searchInspire();
    }

  });

  document.querySelectorAll(".inspire-filter").forEach(button => {

    button.addEventListener("click", function () {

      document
        .querySelectorAll(".inspire-filter")
        .forEach(btn => btn.classList.remove("active"));

      this.classList.add("active");

      filter = this.dataset.filter;

      render();
    });

  });

  const closeButton =
    document.getElementById("closeInspireViewer");

  if (closeButton) {
    closeButton.addEventListener("click", closeViewer);
  }

  const viewer =
    document.getElementById("inspireViewer");

  if (viewer) {

    viewer.addEventListener("click", function (event) {

      if (event.target === viewer) {
        closeViewer();
      }

    });

  }

})();
/* =========================================================
   UNICANVAS — PROJECT CANVAS
   Safe add-on
   ========================================================= */

(function () {

  const PROJECT_PAGE_ID = "project-canvas";

  /* ---------- ADD NAVIGATION BUTTON ---------- */

  function addProjectNavigation() {
    const nav =
      document.querySelector(".sidebar nav") ||
      document.querySelector(".sidebar");

    if (!nav) return;

    if (document.querySelector('[data-page="project-canvas"]')) {
      return;
    }

    const button = document.createElement("button");

    button.className = "nav-btn";
    button.dataset.page = PROJECT_PAGE_ID;
    button.innerHTML = "🚀 <span>Project Canvas</span>";

    button.addEventListener("click", function () {
      openProjectCanvas();
    });

    nav.appendChild(button);
  }


  /* ---------- CREATE THE PAGE ---------- */

  function createProjectPage() {

    if (document.getElementById(PROJECT_PAGE_ID)) {
      return;
    }

    const main =
      document.querySelector("main") ||
      document.querySelector(".main-content") ||
      document.body;

    const page = document.createElement("section");

    page.id = PROJECT_PAGE_ID;
    page.className = "page project-canvas-page";

    page.innerHTML = `

      <div class="project-canvas-header">

        <h1>Project Canvas</h1>

        <p>
          Turn one idea into a complete project —
          all in one connected workspace.
        </p>

      </div>


      <!-- CREATE PROJECT -->

      <div class="project-create-box" id="project-create-box">

        <h2>✨ Create Your Project</h2>

        <p style="
          text-align:center;
          color:#aaa7bd;
          font-size:13px;
          line-height:1.5;
        ">
          Start with an idea. Then gather your research,
          videos, inspiration, notes and creations around it.
        </p>


        <label for="uc-project-name">
          Project Name
        </label>

        <input
          id="uc-project-name"
          type="text"
          placeholder="e.g. AquaVita"
        >


        <label for="uc-project-description">
          What is your project about?
        </label>

        <textarea
          id="uc-project-description"
          placeholder="Describe your idea in a few words..."
        ></textarea>


        <label for="uc-project-type">
          Project Type
        </label>

        <select id="uc-project-type">

          <option value="School Project">
            School Project
          </option>

          <option value="Invention">
            Invention
          </option>

          <option value="Research">
            Research
          </option>

          <option value="Art & Design">
            Art & Design
          </option>

          <option value="Story">
            Story
          </option>

          <option value="Business Idea">
            Business Idea
          </option>

          <option value="Other">
            Other
          </option>

        </select>


        <button
          class="project-create-button"
          id="uc-create-project-button"
        >
          🚀 Open My Project Canvas
        </button>

      </div>


      <!-- ACTIVE PROJECT -->

      <div id="uc-project-active" style="display:none;">

        <div class="project-active-bar">

          <div>
            <div
              class="project-active-title"
              id="uc-active-title"
            ></div>

            <div
              class="project-active-type"
              id="uc-active-type"
            ></div>
          </div>

          <button
            class="new-project-small"
            id="uc-new-project"
          >
            ＋ New Project
          </button>

        </div>


        <div class="project-workspace active">

          <!-- CENTER -->

          <div class="project-center">

            <div class="project-icon">🚀</div>

            <h2 id="uc-center-title">
              My Project
            </h2>

            <p id="uc-center-description">
              Your idea starts here.
            </p>

          </div>


          <!-- TOOLS -->

          <div
            class="project-tool tool-top"
            data-project-tool="explore"
          >

            <div class="tool-icon">🔎</div>

            <h3>Explore</h3>

            <p>
              Research information
              for your project.
            </p>

          </div>


          <div
            class="project-tool tool-top-left"
            data-project-tool="inspire"
          >

            <div class="tool-icon">🖼️</div>

            <h3>Inspire</h3>

            <p>
              Find pictures and
              visual ideas.
            </p>

          </div>


          <div
            class="project-tool tool-top-right"
            data-project-tool="watch"
          >

            <div class="tool-icon">📺</div>

            <h3>Watch</h3>

            <p>
              Find useful
              YouTube videos.
            </p>

          </div>


          <div
            class="project-tool tool-left"
            data-project-tool="ai"
          >

            <div class="tool-icon">🤖</div>

            <h3>AI Studio</h3>

            <p>
              Brainstorm and
              develop ideas.
            </p>

          </div>


          <div
            class="project-tool tool-right"
            data-project-tool="notes"
          >

            <div class="tool-icon">📝</div>

            <h3>Notes</h3>

            <p>
              Keep important
              information together.
            </p>

          </div>


          <div
            class="project-tool tool-bottom-left"
            data-project-tool="create"
          >

            <div class="tool-icon">🎨</div>

            <h3>Create</h3>

            <p>
              Turn your ideas
              into something real.
            </p>

          </div>


          <div
            class="project-tool tool-bottom-right"
            data-project-tool="tasks"
          >

            <div class="tool-icon">✅</div>

            <h3>Tasks</h3>

            <p>
              Organize what
              needs to be done.
            </p>

          </div>


          <div
            class="project-tool tool-bottom"
            data-project-tool="showcase"
          >

            <div class="tool-icon">🚀</div>

            <h3>Showcase</h3>

            <p>
              Present your
              finished project.
            </p>

          </div>

        </div>

      </div>

    `;

    main.appendChild(page);


    /* ---------- CREATE PROJECT ---------- */

    document
      .getElementById("uc-create-project-button")
      .addEventListener("click", function () {

        const name =
          document
            .getElementById("uc-project-name")
            .value
            .trim();

        const description =
          document
            .getElementById("uc-project-description")
            .value
            .trim();

        const type =
          document
            .getElementById("uc-project-type")
            .value;

        if (!name) {

          alert("Please give your project a name.");

          return;
        }


        const project = {
          name: name,
          description:
            description ||
            "A new UniCanvas project.",
          type: type
        };


        localStorage.setItem(
          "UNICANVAS_current_project",
          JSON.stringify(project)
        );


        showProject(project);

      });


    /* ---------- NEW PROJECT ---------- */

    document
      .getElementById("uc-new-project")
      .addEventListener("click", function () {

        document
          .getElementById("uc-project-active")
          .style.display = "none";

        document
          .getElementById("project-create-box")
          .style.display = "block";

      });


    /* ---------- PROJECT TOOL BUTTONS ---------- */

    document
      .querySelectorAll("[data-project-tool]")
      .forEach(function (tool) {

        tool.addEventListener("click", function () {

          const destination =
            tool.dataset.projectTool;

          openExistingPage(destination);

        });

      });

  }


  /* ---------- SHOW PROJECT ---------- */

  function showProject(project) {

    const createBox =
      document.getElementById(
        "project-create-box"
      );

    const active =
      document.getElementById(
        "uc-project-active"
      );

    if (!createBox || !active) return;


    createBox.style.display = "none";

    active.style.display = "block";


    document.getElementById(
      "uc-active-title"
    ).textContent = project.name;


    document.getElementById(
      "uc-active-type"
    ).textContent =
      project.type;


    document.getElementById(
      "uc-center-title"
    ).textContent =
      project.name;


    document.getElementById(
      "uc-center-description"
    ).textContent =
      project.description;

  }


  /* ---------- OPEN PROJECT CANVAS ---------- */

  function openProjectCanvas() {

    createProjectPage();

    const pages =
      document.querySelectorAll(".page");

    pages.forEach(function (page) {
      page.classList.remove("active");
      page.style.display = "";
    });


    const projectPage =
      document.getElementById(
        PROJECT_PAGE_ID
      );

    if (projectPage) {

      projectPage.classList.add("active");

      projectPage.style.display = "block";

    }


    /* Load previous project */

    try {

      const saved =
        localStorage.getItem(
          "UNICANVAS_current_project"
        );

      if (saved) {

        const project =
          JSON.parse(saved);

        showProject(project);

      }

    } catch (error) {

      console.log(
        "UniCanvas project loading:",
        error
      );

    }

  }


  /* ---------- OPEN EXISTING PAGE ---------- */

  function openExistingPage(pageName) {

    const page =
      document.getElementById(pageName);

    if (!page) {

      console.log(
        "UniCanvas: page not found:",
        pageName
      );

      return;

    }


    document
      .querySelectorAll(".page")
      .forEach(function (item) {

        item.classList.remove("active");
        item.style.display = "";

      });


    page.classList.add("active");
    page.style.display = "block";


    /* Keep existing navigation buttons visually correct */

    document
      .querySelectorAll("[data-page]")
      .forEach(function (button) {

        button.classList.remove("active");

        if (
          button.dataset.page === pageName
        ) {

          button.classList.add("active");

        }

      });

  }


  /* ---------- START ---------- */

  function initProjectCanvas() {

    addProjectNavigation();

    createProjectPage();

  }


  if (document.readyState === "loading") {

    document.addEventListener(
      "DOMContentLoaded",
      initProjectCanvas
    );

  } else {

    initProjectCanvas();

  }

})();

/* =========================================
   UNICANVAS PROJECT WORKSPACE
   ========================================= */

(function () {

    const STORAGE_KEY = "unicanvas_projects";

    function getProjects() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        } catch (error) {
            return [];
        }
    }

    function saveProjects(projects) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    }

    function createProjectCanvasPage() {

        if (document.getElementById("project-canvas-page")) return;

        const main =
            document.querySelector("main") ||
            document.querySelector(".main-content") ||
            document.body;

        const page = document.createElement("section");

        page.id = "project-canvas-page";
        page.className = "page project-canvas-page";

        page.innerHTML = `
            <div class="canvas-header">
                <h1>🚀 Project Canvas</h1>
                <p>
                    Your complete project workspace — research, ideas,
                    videos, notes, tasks and creations in one place.
                </p>
            </div>

            <div class="project-create-box">

                <h2>✨ Start a New Project</h2>

                <div class="project-form">

                    <input
                        id="canvasProjectName"
                        type="text"
                        placeholder="Project name..."
                    >

                    <textarea
                        id="canvasProjectDescription"
                        placeholder="What is your project about?"
                    ></textarea>

                    <button
                        class="canvas-btn"
                        id="createCanvasProject"
                    >
                        + Create Project
                    </button>

                </div>

            </div>

            <div id="canvasProjectsList"></div>

            <div id="activeCanvasProject"></div>
        `;

        main.appendChild(page);

        document
            .getElementById("createCanvasProject")
            .addEventListener("click", createProject);

        renderProjectList();
    }


    function createProject() {

        const nameInput =
            document.getElementById("canvasProjectName");

        const descriptionInput =
            document.getElementById("canvasProjectDescription");

        const name = nameInput.value.trim();
        const description = descriptionInput.value.trim();

        if (!name) {
            alert("Please enter a project name.");
            return;
        }

        const projects = getProjects();

        const project = {
            id: Date.now(),
            name: name,
            description: description || "My UniCanvas project",
            createdAt: new Date().toLocaleDateString(),
            notes: [],
            tasks: [],
            resources: [],
            videos: [],
            images: [],
            ideas: [],
            creations: []
        };

        projects.push(project);

        saveProjects(projects);

        nameInput.value = "";
        descriptionInput.value = "";

        openProject(project.id);
        renderProjectList();
    }


    function renderProjectList() {

        const container =
            document.getElementById("canvasProjectsList");

        if (!container) return;

        const projects = getProjects();

        if (!projects.length) {
            container.innerHTML = "";
            return;
        }

        container.innerHTML = `
            <div class="canvas-section">
                <div class="canvas-section-title">
                    <h3>📁 My Projects</h3>
                </div>

                <div class="project-list">

                    ${projects.map(project => `

                        <div
                            class="project-list-card"
                            data-project-id="${project.id}"
                        >

                            <strong>
                                ${escapeHTML(project.name)}
                            </strong>

                            <small>
                                ${escapeHTML(project.description)}
                            </small>

                        </div>

                    `).join("")}

                </div>
            </div>
        `;

        document
            .querySelectorAll(".project-list-card")
            .forEach(card => {

                card.addEventListener("click", () => {
                    openProject(Number(card.dataset.projectId));
                });

            });
    }


    function openProject(id) {

        const projects = getProjects();

        const project =
            projects.find(item => item.id === id);

        if (!project) return;

        const container =
            document.getElementById("activeCanvasProject");

        if (!container) return;

        container.innerHTML = `

            <div class="canvas-project active-project">

                <div class="project-top-card">

                    <h2>
                        ${escapeHTML(project.name)}
                    </h2>

                    <div class="project-description">
                        ${escapeHTML(project.description)}
                    </div>

                    <div class="project-progress">

                        <div
                            class="project-progress-bar"
                            id="canvasProgressBar"
                        ></div>

                    </div>

                    <div
                        class="project-progress-text"
                        id="canvasProgressText"
                    ></div>

                </div>


                <div class="canvas-grid">

                    <div
                        class="canvas-tool-card"
                        data-tool="explore"
                    >
                        <div class="canvas-tool-icon">🔍</div>
                        <h3>Explore</h3>
                        <p>
                            Research your topic and discover useful
                            information.
                        </p>
                    </div>


                    <div
                        class="canvas-tool-card"
                        data-tool="inspire"
                    >
                        <div class="canvas-tool-icon">✨</div>
                        <h3>Inspire</h3>
                        <p>
                            Find pictures and visual inspiration
                            for your project.
                        </p>
                    </div>


                    <div
                        class="canvas-tool-card"
                        data-tool="watch"
                    >
                        <div class="canvas-tool-icon">▶️</div>
                        <h3>Watch</h3>
                        <p>
                            Discover useful videos and explanations.
                        </p>
                    </div>


                    <div
                        class="canvas-tool-card"
                        data-tool="ai"
                    >
                        <div class="canvas-tool-icon">🤖</div>
                        <h3>AI Studio</h3>
                        <p>
                            Brainstorm ideas and develop your project.
                        </p>
                    </div>


                    <div
                        class="canvas-tool-card"
                        data-tool="notes"
                    >
                        <div class="canvas-tool-icon">📝</div>
                        <h3>Notes</h3>
                        <p>
                            Keep important information and ideas
                            together.
                        </p>
                    </div>


                    <div
                        class="canvas-tool-card"
                        data-tool="tasks"
                    >
                        <div class="canvas-tool-icon">✅</div>
                        <h3>Tasks</h3>
                        <p>
                            Turn your project into clear steps
                            and track your progress.
                        </p>
                    </div>


                    <div
                        class="canvas-tool-card"
                        data-tool="create"
                    >
                        <div class="canvas-tool-icon">🎨</div>
                        <h3>Create</h3>
                        <p>
                            Build the actual final project.
                        </p>
                    </div>


                    <div
                        class="canvas-tool-card"
                        data-tool="showcase"
                    >
                        <div class="canvas-tool-icon">🌟</div>
                        <h3>Showcase</h3>
                        <p>
                            Prepare and present your completed work.
                        </p>
                    </div>

                </div>


                <div class="canvas-section">

                    <div class="canvas-section-title">
                        <h3>📝 Project Notes</h3>
                    </div>

                    <div class="canvas-note-area">

                        <input
                            class="canvas-note-input"
                            id="newCanvasNote"
                            placeholder="Write an important idea..."
                        >

                        <button
                            class="canvas-btn"
                            id="addCanvasNote"
                        >
                            Add
                        </button>

                    </div>

                    <div
                        class="canvas-items"
                        id="canvasNotes"
                    ></div>

                </div>


                <div class="canvas-section">

                    <div class="canvas-section-title">
                        <h3>📦 Project Resources</h3>
                    </div>

                    <div
                        class="canvas-items"
                        id="canvasResources"
                    ></div>

                </div>

            </div>
        `;


        document
            .querySelectorAll(".canvas-tool-card")
            .forEach(card => {

                card.addEventListener("click", () => {

                    openExistingUniCanvasPage(
                        card.dataset.tool
                    );

                });

            });


        document
            .getElementById("addCanvasNote")
            .addEventListener("click", () => {

                addProjectNote(project.id);

            });


        renderProjectContent(project);
    }


    function addProjectNote(projectId) {

        const input =
            document.getElementById("newCanvasNote");

        const text = input.value.trim();

        if (!text) return;

        const projects = getProjects();

        const project =
            projects.find(item => item.id === projectId);

        if (!project) return;

        project.notes.push({
            text: text,
            createdAt: new Date().toLocaleString()
        });

        saveProjects(projects);

        input.value = "";

        renderProjectContent(project);
    }


    function renderProjectContent(project) {

        const notesContainer =
            document.getElementById("canvasNotes");

        const resourcesContainer =
            document.getElementById("canvasResources");

        if (!notesContainer || !resourcesContainer) return;


        if (!project.notes.length) {

            notesContainer.innerHTML = `
                <div class="canvas-empty">
                    No notes yet. Add your first project idea above.
                </div>
            `;

        } else {

            notesContainer.innerHTML =
                project.notes.map(note => `

                    <div class="canvas-item">

                        <strong>
                            ${escapeHTML(note.text)}
                        </strong>

                        <small>
                            ${escapeHTML(note.createdAt)}
                        </small>

                    </div>

                `).join("");

        }


        const totalItems =
            project.notes.length +
            project.tasks.length +
            project.resources.length +
            project.videos.length +
            project.images.length +
            project.ideas.length +
            project.creations.length;


        if (!project.resources.length) {

            resourcesContainer.innerHTML = `
                <div class="canvas-empty">
                    Resources you save from UniCanvas will appear here.
                </div>
            `;

        } else {

            resourcesContainer.innerHTML =
                project.resources.map(resource => `

                    <div class="canvas-item">

                        <strong>
                            ${escapeHTML(resource.title)}
                        </strong>

                        <small>
                            ${escapeHTML(resource.type)}
                        </small>

                    </div>

                `).join("");

        }


        const progress =
            Math.min(100, totalItems * 10);

        const progressBar =
            document.getElementById("canvasProgressBar");

        const progressText =
            document.getElementById("canvasProgressText");

        if (progressBar) {
            progressBar.style.width = progress + "%";
        }

        if (progressText) {
            progressText.textContent =
                totalItems === 0
                    ? "Your project is ready to begin."
                    : `${totalItems} project item${totalItems === 1 ? "" : "s"} collected`;
        }
    }


    function openExistingUniCanvasPage(tool) {

        const pageMap = {
            explore: "explore",
            inspire: "inspire",
            watch: "watch",
            ai: "ai",
            notes: "notes",
            tasks: "tasks",
            create: "create",
            showcase: "showcase"
        };

        const targetId = pageMap[tool];

        if (!targetId) return;

        const target =
            document.getElementById(targetId);

        if (target) {

            document
                .querySelectorAll(".page")
                .forEach(page => {
                    page.classList.remove("active");
                });

            target.classList.add("active");

        } else {

            console.log(
                "UniCanvas page not found:",
                targetId
            );

        }
    }


    function escapeHTML(value) {

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    /* Create the page after the existing app loads */

    if (document.readyState === "loading") {

        document.addEventListener(
            "DOMContentLoaded",
            createProjectCanvasPage
        );

    } else {

        createProjectCanvasPage();

    }

})();

/* =========================================
   CONNECT INSPIRE SAVES TO PROJECT CANVAS
   ========================================= */

/* =========================================
   INSPIRE — SAVE RESOURCE
   ========================================= */

document.addEventListener("click", function (event) {

    const button =
        event.target.closest(".uni-inspire-save");

    if (!button) return;

    event.preventDefault();
    event.stopPropagation();

    const card =
        button.closest(".uni-inspiration-card");

    if (!card) return;

    const title =
        card.querySelector("h3")
        ?.textContent.trim()
        || "Inspiration";

    const category =
        card.querySelector("small")
        ?.textContent.trim()
        || "Inspiration";

    const description =
        card.querySelector("p")
        ?.textContent.trim()
        || "";

    const image =
        card.querySelector("img")
        ?.src
        || "";

    let projects = [];

    try {

        projects =
            JSON.parse(
                localStorage.getItem(
                    "unicanvas_projects"
                )
            ) || [];

    } catch (error) {

        projects = [];

    }

    if (!projects.length) {

        showToast(
            "Create a project first to save resources."
        );

        return;
    }

    const project =
        projects[projects.length - 1];

    if (!project.resources) {
        project.resources = [];
    }

    const alreadySaved =
        project.resources.some(
            item =>
                item.type === "Inspiration" &&
                item.title === title
        );

    if (alreadySaved) {

        button.textContent = "✓ Saved";

        showToast("Already saved.");

        return;
    }

    project.resources.push({

        title: title,

        type: "Inspiration",

        category: category,

        description: description,

        image: image,

        savedAt:
            new Date().toLocaleString()

    });

    localStorage.setItem(
        "unicanvas_projects",
        JSON.stringify(projects)
    );

    button.textContent = "✓ Saved";

    showToast(
        `✦ "${title}" saved`
    );

    if (
        typeof loadSavedResources ===
        "function"
    ) {
        loadSavedResources();
    }

});
/* =========================================
   UNICANVAS — SAVE YOUTUBE VIDEOS TO PROJECT
   ========================================= */
/* =========================================
   WATCH — SAVE YOUTUBE VIDEO
   ========================================= */

document.addEventListener("click", function (event) {

    const button =
        event.target.closest(".uni-youtube-save");

    if (!button) return;

    event.preventDefault();
    event.stopPropagation();

    const card =
        button.closest(".youtube-result");

    if (!card) return;

    const videoId =
        card.dataset.videoId;

    if (!videoId) return;

    const title =
        card.querySelector("h3")
        ?.textContent.trim()
        || "YouTube Video";

    const channel =
        card.querySelector("p")
        ?.textContent.trim()
        || "";

    const thumbnail =
        card.querySelector("img")
        ?.src
        || "";

    let resources = [];

    try {
        resources =
            JSON.parse(
                localStorage.getItem(
                    "unicanvas_saved_resources"
                )
            ) || [];
    } catch (error) {
        resources = [];
    }

    const alreadySaved =
        resources.some(item =>
            item.type === "YouTube Video" &&
            item.videoId === videoId
        );

    if (alreadySaved) {

        button.textContent = "✓ Saved";

        showToast("Already saved ✦");

        return;
    }

    resources.push({

        id: Date.now(),

        type: "YouTube Video",

        title: title,

        channel: channel,

        videoId: videoId,

        thumbnail: thumbnail,

        url:
            "https://www.youtube.com/watch?v=" +
            videoId,

        savedAt:
            new Date().toLocaleString()

    });

    localStorage.setItem(
        "unicanvas_saved_resources",
        JSON.stringify(resources)
    );

    button.textContent = "✓ Saved";

    showToast("▶️ Video saved!");

    if (
        typeof loadSavedResources ===
        "function"
    ) {
        loadSavedResources();
    }

});

/* =========================================
   UNICANVAS — HOURLY BREAK REMINDER
   Separate from Focus Mode
   ========================================= */

let uniCanvasUsageTimer = null;
let uniCanvasUsageSeconds = 0;

const ONE_HOUR = 60 * 60;

/*
   Start counting active time.
   This is separate from Focus Mode.
*/

function startUniCanvasBreakReminder() {

    if (uniCanvasUsageTimer) return;

    uniCanvasUsageTimer = setInterval(() => {

        // Only count time while the page is visible
        if (document.visibilityState !== "visible") {
            return;
        }

        uniCanvasUsageSeconds++;

        if (uniCanvasUsageSeconds >= ONE_HOUR) {

            uniCanvasUsageSeconds = 0;

            showUniCanvasBreakReminder();
        }

    }, 1000);
}


/*
   Break reminder popup
*/

function showUniCanvasBreakReminder() {

    const oldReminder =
        document.getElementById("uniBreakReminder");

    if (oldReminder) {
        oldReminder.remove();
    }

    const reminder =
        document.createElement("div");

    reminder.id = "uniBreakReminder";

    reminder.innerHTML = `
        <div class="uni-break-card">

            <div class="uni-break-icon">
                🧘
            </div>

            <h2>
                Time for a short break
            </h2>

            <p>
                You've been working for an hour.
                Take a moment to rest your eyes,
                stretch, and relax.
            </p>

            <button id="uniBreakClose">
                ✓ Got it
            </button>

        </div>
    `;

    document.body.appendChild(reminder);

    document
        .getElementById("uniBreakClose")
        ?.addEventListener("click", () => {

            reminder.remove();

        });
}


/*
   Start automatically
*/

startUniCanvasBreakReminder();

/* =========================================
   SAVED RESOURCES PAGE
   ========================================= */

/* =========================================
   SAVED RESOURCES — LOAD
   ========================================= */

function loadSavedResources() {

    const grid =
        document.getElementById(
            "savedResourceGrid"
        );

    const empty =
        document.getElementById(
            "savedResourceEmpty"
        );

    const count =
        document.getElementById(
            "savedResourceCount"
        );

    if (!grid) return;

    let resources = [];

    try {
        resources =
            JSON.parse(
                localStorage.getItem(
                    "unicanvas_saved_resources"
                )
            ) || [];
    } catch (error) {
        resources = [];
    }

    if (!Array.isArray(resources)) {
        resources = [];
    }

    if (count) {
        count.textContent =
            resources.length === 0
                ? "Your saved resources will appear here."
                : `${resources.length} saved resource${resources.length === 1 ? "" : "s"}`;
    }

    if (!resources.length) {

        grid.innerHTML = "";

        if (empty) {
            empty.style.display = "block";
        }

        return;
    }

    if (empty) {
        empty.style.display = "none";
    }

    grid.innerHTML =
        resources.map(resource => {

            if (
                resource.type ===
                "YouTube Video"
            ) {

                return `
                    <article class="saved-resource-card">

                        <div class="saved-resource-thumbnail">

                            <img
                                src="${resource.thumbnail || ""}"
                                alt=""
                            >

                        </div>

                        <div class="saved-resource-body">

                            <span class="saved-resource-type">
                                ▶ YouTube Video
                            </span>

                            <h3>
                                ${escapeHTML(
                                    resource.title ||
                                    "YouTube Video"
                                )}
                            </h3>

                            <p>
                                ${escapeHTML(
                                    resource.channel || ""
                                )}
                            </p>

                            <div class="saved-resource-actions">

                                <a
                                    href="${resource.url}"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Watch
                                </a>

                                <button
                                    class="saved-resource-remove"
                                    data-resource-id="${resource.id}"
                                    type="button"
                                >
                                    Remove
                                </button>

                            </div>

                        </div>

                    </article>
                `;

            }

            return `
                <article class="saved-resource-card">

                    <div class="saved-resource-thumbnail">

                        ${
                            resource.image
                            ? `
                                <img
                                    src="${resource.image}"
                                    alt=""
                                >
                            `
                            : `
                                <div class="saved-no-image">
                                    ✦
                                </div>
                            `
                        }

                    </div>

                    <div class="saved-resource-body">

                        <span class="saved-resource-type">
                            ✨ Inspiration
                        </span>

                        <h3>
                            ${escapeHTML(
                                resource.title ||
                                "Inspiration"
                            )}
                        </h3>

                        <p>
                            ${escapeHTML(
                                resource.description ||
                                resource.category ||
                                ""
                            )}
                        </p>

                        <div class="saved-resource-actions">

                            <button
                                class="saved-resource-remove"
                                data-resource-id="${resource.id}"
                                type="button"
                            >
                                Remove
                            </button>

                        </div>

                    </div>

                </article>
            `;

        }).join("");
}

/* -----------------------------------------
   REMOVE SAVED RESOURCE
   ----------------------------------------- */

/* =========================================
   SAVED RESOURCES — REMOVE
   ========================================= */

document.addEventListener("click", function (event) {

    const button =
        event.target.closest(
            ".saved-resource-remove"
        );

    if (!button) return;

    const id =
        Number(button.dataset.resourceId);

    let resources = [];

    try {
        resources =
            JSON.parse(
                localStorage.getItem(
                    "unicanvas_saved_resources"
                )
            ) || [];
    } catch (error) {
        resources = [];
    }

    resources =
        resources.filter(
            resource =>
                Number(resource.id) !== id
        );

    localStorage.setItem(
        "unicanvas_saved_resources",
        JSON.stringify(resources)
    );

    loadSavedResources();

    showToast("Resource removed.");
});

/* -----------------------------------------
   LOAD WHEN PAGE OPENS
   ----------------------------------------- */

loadSavedResources();

/* =========================================
   INSPIRE — SAVE RESOURCE
   ========================================= */

document.addEventListener("click", function (event) {

    const saveButton =
        event.target.closest(".uni-inspire-save");

    if (!saveButton) return;

    event.preventDefault();
    event.stopPropagation();

    const card =
        saveButton.closest(
            ".uni-inspiration-card"
        );

    if (!card) return;

    const title =
        card.querySelector("h3")
        ?.textContent.trim()
        || "Inspiration";

    const category =
        card.querySelector("small")
        ?.textContent.trim()
        || "Inspiration";

    const description =
        card.querySelector("p")
        ?.textContent.trim()
        || "";

    const image =
        card.querySelector("img")
        ?.src
        || "";

    let projects = [];

    try {

        projects =
            JSON.parse(
                localStorage.getItem(
                    "unicanvas_projects"
                )
            ) || [];

    } catch {

        projects = [];

    }

    if (!projects.length) {

        showToast(
            "Create a project first to save resources."
        );

        return;

    }

    const project =
        projects[projects.length - 1];

    if (!project.resources) {
        project.resources = [];
    }

    const alreadySaved =
        project.resources.some(
            item =>
                item.type === "Inspiration" &&
                item.title === title
        );

    if (alreadySaved) {

        saveButton.textContent =
            "✓ Saved";

        showToast(
            "Already saved."
        );

        return;

    }

    project.resources.push({

        title: title,

        type: "Inspiration",

        category: category,

        description: description,

        image: image,

        savedAt:
            new Date().toLocaleString()

    });

    localStorage.setItem(
        "unicanvas_projects",
        JSON.stringify(projects)
    );

    saveButton.textContent =
        "✓ Saved";

    showToast(
        `✦ "${title}" saved`
    );

    if (
        typeof loadSavedResources ===
        "function"
    ) {
        loadSavedResources();
    }

});

/* =========================================
   REFRESH SAVED RESOURCES WHEN OPENED
   ========================================= */

document.addEventListener(
    "click",
    function (event) {

        const pageButton =
            event.target.closest(
                "[data-page]"
            );

        if (!pageButton) return;

        if (
            pageButton.dataset.page ===
            "savedResources"
        ) {

            setTimeout(() => {

                if (
                    typeof loadSavedResources ===
                    "function"
                ) {
                    loadSavedResources();
                }

            }, 50);

        }

    }
);