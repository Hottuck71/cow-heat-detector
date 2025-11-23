from flask import Flask, request, jsonify
from camera_manager import add_camera, CAMERAS

app = Flask(__name__)

@app.route("/api/addCamera", methods=["POST"])
def add_camera_api():
    data = request.json
    url = data.get("url")

    if not url:
        return jsonify({"error": "Missing camera URL"}), 400

    cam_id = add_camera(url)
    return jsonify({"success": True, "cameraId": cam_id})

@app.route("/api/listCameras", methods=["GET"])
def list_cameras():
    return jsonify(CAMERAS)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
