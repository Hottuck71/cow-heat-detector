// ----- CAMERA STORAGE (TEMP LOCAL) -----
let cameras = [];
let clips = [];

// DOM ELEMENTS
const modal = document.getElementById("modal");
const addCameraBtn = document.getElementById("addCameraBtn");
const saveCameraBtn = document.getElementById("saveCameraBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const urlInput = document.getElementById("cameraUrlInput");

const cameraList = document.getElementById("cameraList");
const videoGrid = document.getElementById("videoGrid");
const clipsList = document.getElementById("clipsList");

// ----- OPEN MODAL -----
addCameraBtn.onclick = () => {
  modal.classList.remove("hidden");
};

// ----- CLOSE MODAL -----
closeModalBtn.onclick = () => {
  modal.classList.add("hidden");
};

// ----- SAVE CAMERA -----
saveCameraBtn.onclick = () => {
  const url = urlInput.value.trim();
  if (!url) return;

  cameras.push({ url });

  urlInput.value = "";
  modal.classList.add("hidden");

  refreshUI();
};

// ----- RENDER UI -----
function refreshUI() {
  // Render camera list
  cameraList.innerHTML = "";
  cameras.forEach((cam, i) => {
    const li = document.createElement("li");
    li.textContent = `Camera ${i + 1}`;
    cameraList.appendChild(li);
  });

  // Render video grid
  videoGrid.innerHTML = "";
  cameras.forEach(cam => {
    const card = document.createElement("div");
    card.className = "videoCard";

    // Replace this with your streamed <video src="...">
    const img = document.createElement("img");
    img.src = "assets/placeholder.jpg";

    card.appendChild(img);
    videoGrid.appendChild(card);
  });

  // Render clips panel
  clipsList.innerHTML = "";
  clips.forEach(c => {
    const img = document.createElement("img");
    img.className = "clipThumb";
    img.src = c;
    clipsList.appendChild(img);
  });
}

// Initial load
refreshUI();
