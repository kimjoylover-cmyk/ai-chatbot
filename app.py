from flask import Flask, request, send_file
from flask_cors import CORS
from steganography_en import hide_text
import os
import uuid

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
OUTPUT_FOLDER = "outputs"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

@app.route("/hide", methods=["POST"])
def hide():
    image = request.files["image"]
    text = request.form["text"]

    file_id = str(uuid.uuid4())

    input_path = os.path.join(UPLOAD_FOLDER, file_id + ".png")
    output_path = os.path.join(OUTPUT_FOLDER, file_id + "_stego.png")

    image.save(input_path)

    hide_text(input_path, text, output_path, bits=2, verbose=False)

    return send_file(
        output_path,
        mimetype="image/png",
        as_attachment=True,
        download_name="stego_output.png"
    )

if __name__ == "__main__":
    app.run(debug=True)