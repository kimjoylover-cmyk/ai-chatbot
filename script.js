const wmInput = document.querySelector("#watermark-text");
const fileInput = document.querySelector(".file-input");
const filterOptions = document.querySelectorAll(".filter button");
const filterName = document.querySelector(".filter-info .name");
const filterValue = document.querySelector(".filter-info .value");
const filterSlider = document.querySelector(".slider input");
const resetFilterBtn = document.querySelector(".reset-filter");
const chooseImgBtn = document.querySelector(".choose-img");
const saveImgBtn = document.querySelector(".save-img");
const colorPicker = document.getElementById("color-picker");
const fontFamily = document.getElementById("font-family");


let rotate = -30;
let opacity = 40;
let lineheight = 0;
let textsize = 0;

const canvas = new fabric.Canvas("c");
canvas.setWidth(490);
canvas.setHeight(335);
canvas.setBackgroundColor("#fff", canvas.renderAll.bind(canvas));
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

function removeWatermarks() {
  canvas.getObjects().slice().forEach((obj) => {
    if (obj && obj.isWatermark) {
      canvas.remove(obj);
    }
  });
}

function getWatermarkStyle() {
  const fontSize = 28 + (parseFloat(textsize) || 0) * 0.28;
  const lineHeightFactor = 1 + (parseFloat(lineheight) || 0) / 100;

  return {
    fontSize,
    opacity: (parseFloat(opacity) || 40) / 100,
    angle: parseFloat(rotate) || 0,
    colGap: Math.max(fontSize * 3, 85),
    rowGap: Math.max(fontSize * lineHeightFactor * 1.8, 50),
  };
}

function buildWatermarks() {
  removeWatermarks();

  const textValue = wmInput.value.trim();
  if (!textValue || !imgObj) return;

  const { fontSize, opacity: wmOpacity, angle, colGap, rowGap } = getWatermarkStyle();
  const cw = canvas.getWidth();
  const ch = canvas.getHeight();
  const cols = Math.ceil(cw / colGap) + 2;
  const rows = Math.ceil(ch / rowGap) + 2;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if ((row + col) % 2 !== 0) continue;

      const text = new fabric.Text(textValue, {
        left: col * colGap - colGap / 2,
        top: row * rowGap - rowGap / 2,
        fontSize,
        fill: colorPicker.value,
        fontFamily: fontFamily.value,
        opacity: wmOpacity,
        angle,
        selectable: false,
        evented: false,
        hasControls: false,
        hasBorders: false,
      });
      text.isWatermark = true;
      canvas.add(text);
    }
  }

  imgObj.sendToBack();
  canvas.renderAll();
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
    buildWatermarks();
  });
}

const applyFilters = () => {
  if (imgObj) {
    buildWatermarks();
  }
};

const loadImage = () => {
  const file = fileInput.files[0];
  if (!file) return;

  const url = URL.createObjectURL(file);
  loadImageToCanvas(url);

  document.querySelector(".container").classList.remove("disable");
};

chooseImgBtn.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", loadImage);

filterOptions.forEach((option) => {
  option.addEventListener("click", () => {
    document.querySelector(".filter .active").classList.remove("active");
    option.classList.add("active");
    filterName.innerText = option.innerText;

    if (option.id === "rotate") {
      filterSlider.max = "180";
      filterSlider.min = "-180";
      filterSlider.value = rotate;
      filterValue.innerText = `${rotate}%`;
    } else if (option.id === "opacity") {
      filterSlider.max = "100";
      filterSlider.min = "0";
      filterSlider.value = opacity;
      filterValue.innerText = `${opacity}%`;
    } else if (option.id === "lineheight") {
      filterSlider.max = "100";
      filterSlider.min = "-10";
      filterSlider.value = lineheight;
      filterValue.innerText = `${lineheight}%`;
    } else {
      filterSlider.max = "50";
      filterSlider.min = "-50";
      filterSlider.value = textsize;
      filterValue.innerText = `${textsize}%`;
    }
  });
});

const updateFilter = () => {
  filterValue.innerText = `${filterSlider.value}%`;
  const selectedFilter = document.querySelector(".filter .active");

  if (selectedFilter.id === "rotate") {
    rotate = parseFloat(filterSlider.value) || 0;
  } else if (selectedFilter.id === "opacity") {
    opacity = parseFloat(filterSlider.value) || 40;
  } else if (selectedFilter.id === "lineheight") {
    lineheight = filterSlider.value;
  } else {
    textsize = filterSlider.value;
  }
  applyFilters();
};

const resetFilter = () => {
  rotate = -30;
  opacity = 40;
  lineheight = 0;
  textsize = 0;
  filterOptions[0].click();
  applyFilters();
};

const saveImage = () => {
  const link = document.createElement("a");
  link.download = "edited-image.png";
  link.href = canvas.toDataURL({
    format: "png",
    quality: 1,
    multiplier: 2,
  });
  link.click();
};

filterSlider.addEventListener("input", updateFilter);
resetFilterBtn.addEventListener("click", resetFilter);
saveImgBtn.addEventListener("click", saveImage);
wmInput.addEventListener("input", () => {
  if (!imgObj) return;
  buildWatermarks();
});

filterOptions[0].click();
