const fileInput = document.querySelector(".file-input");
const chooseImgBtn = document.querySelector(".choose-img");
const saveImgBtn = document.querySelector(".save-img");
const textInput = document.getElementById("watermark-text");

const canvas = new fabric.Canvas("c", {
  width: 500,
  height: 350,
});

let selectedFile = null;
let imgObj = null;

function fitImageToCanvas(img) {
  const cw = canvas.getWidth();
  const ch = canvas.getHeight();

  const iw = img.width || img.getElement().naturalWidth;
  const ih = img.height || img.getElement().naturalHeight;

  const scale = Math.min(cw / iw, ch / ih);

  img.set({
    left: cw / 2,
    top: ch / 2,
    originX: "center",
    originY: "center",
    scaleX: scale,
    scaleY: scale,
  });
}

function loadImageToCanvas(url) {
  fabric.Image.fromURL(url, (img) => {
    canvas.clear();
    canvas.setBackgroundColor("#fff", canvas.renderAll.bind(canvas));

    fitImageToCanvas(img);

    img.set({
      selectable: false,
      evented: false,
      hasControls: false,
      hasBorders: false,
      lockMovementX: true,
      lockMovementY: true,
      lockScalingX: true,
      lockScalingY: true,
      lockRotation: true,
    });

    canvas.add(img);
    img.sendToBack();
    imgObj = img;

    canvas.renderAll();
  });
}

chooseImgBtn.addEventListener("click", () => {
  fileInput.click();
});

fileInput.addEventListener("change", () => {
  selectedFile = fileInput.files[0];

  if (!selectedFile) return;

  document.querySelector(".container").classList.remove("disable");

  const imgURL = URL.createObjectURL(selectedFile);
  loadImageToCanvas(imgURL);
});

saveImgBtn.addEventListener("click", async () => {
  if (!selectedFile) {
    alert("Please choose an image first.");
    return;
  }

  if (!textInput.value) {
    alert("Please enter watermark text.");
    return;
  }

  const formData = new FormData();
  formData.append("image", selectedFile);
  formData.append("text", textInput.value);

  const response = await fetch("http://127.0.0.1:5000/hide", {
    method: "POST",
    body: formData,
  });

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "stego_output.png";
  a.click();
});