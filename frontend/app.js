function addCam() {
  const url = document.getElementById("camInput").value;

  fetch("http://localhost:5000/api/addCamera", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url })
  })
    .then(r => r.json())
    .then(d => {
      alert("Camera added!");
      loadCameras();
    });
}

function loadCameras() {
  fetch("http://localhost:5000/api/listCameras")
    .then(r => r.json())
    .then(cams => {
      let html = "";
      for (let id in cams) {
        const cam = cams[id];
        html += `<div class="cam-box">Camera ${cam.id}: ${cam.url}</div>`;
      }
      document.getElementById("cameraList").innerHTML = html;
    });
}

loadCameras();
