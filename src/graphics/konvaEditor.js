import Konva from 'konva';

const RIB_MULTIPLIER = 1.3;
const CELL_MM = 30;
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 3;
const HEAT_RATIO_THRESHOLD = 0.08;
/** A) Bounds для вмятин: зазор вокруг детали (px в stage). */
const BOUNDS_MARGIN_PX = 12;
/** B) Hit area: доля от размера фигуры, min/max px (чтобы не цепляло издалека). */
const HIT_SIZE_MIN = 6;
const HIT_SIZE_MAX = 12;
const HIT_SIZE_RATIO = 0.35;
/** C) Stroke: тоньше для маленьких (minSizePx < 40), clamp. */
const STROKE_THIN = 0.8;
const STROKE_NORMAL = 1.4;
const STROKE_MIN = 0.6;
const STROKE_MAX = 2;
/** D) Удаление белого фона: порог RGB (255=только чисто белый). Уменьшить до 240 если «съедает» края. */
const REMOVE_WHITE_BACKGROUND = true;
const WHITE_THRESHOLD = 245;
/** B) Handle для перемещения вмятины: линия + крестик. */
const STEM_LEN_MIN = 18;
const STEM_LEN_MAX = 40;
const STEM_LEN_RATIO = 0.35;
const HANDLE_HIT_RADIUS = 18;
const HANDLE_COLOR = '#88E523';
const HANDLE_FILL = 'rgba(136,229,35,0.18)';
const HANDLE_STROKE = 'rgba(136,229,35,0.85)';
const HANDLE_RING_STROKE = 'rgba(136,229,35,0.35)';

let stage = null;
let containerRef = null;
let layerParts = null;
let layerGrid = null;
let layerDents = null;
let tr = null;
let selectedPart = null;
let prices = {};
let onDentChangeCallback = null;
/** Вызывается при смене выбора или изменении размеров выбранной вмятины (для UI «Размеры мм»). */
let onSelectedDentChangeCallback = null;
let dentsMap = new Map();
let partBounds = null;
let stageBounds = null;
let baseUrl = '';

/** Режим мм: деталь с realSizeMm и изображением */
let pxPerMm = null;
let imageRect = null; // { x, y, width, height } — bbox в координатах contentGroup (displayRect)
let imageNode = null; // Konva.Image/Rect детали для getClientRect (режим мм)
let useMmMode = false;

/** Двухуровневый transform: base (fit) + user (zoom/pan). Итог = baseScale*userScale, basePos+userPan */
let baseScale = 1;
let basePos = { x: 0, y: 0 };
let userScale = 1;
let userPan = { x: 0, y: 0 };
/** Для совместимости: итоговый scale (baseScale*userScale); обновляется в applyTransform */
let zoom = 1;
let contentGroup = null;
let contentWidth = 0;
let contentHeight = 0;
/** Scheduler: один fit за RAF, без дерганий */
let fitPending = false;
/** Сложные зоны в px в координатах stage для расчёта пересечения */
let heatZonesPx = [];
/** Тёмный фон stage в режиме мм (под contentGroup) */
let bgRect = null;
/** B) Handle для перемещения выбранной вмятины (крестик снизу). Только в mm-режиме. */
let handleGroup = null;
let activeDent = null;
let lastPlusPos = { x: 0, y: 0 };

function getActiveNode() {
  if (!tr) return null;
  const nodes = tr.nodes();
  return nodes && nodes.length > 0 ? nodes[0] : null;
}

/** Выбрать одну фигуру, показать Transformer, перерисовать слой. B) В mm-режиме для dent показываем handle. */
function selectNode(node) {
  if (!tr || !layerDents) return;
  tr.nodes([node]);
  if (node && node.moveToTop) node.moveToTop();
  if (tr.getParent() === layerDents) tr.moveToTop();
  if (useMmMode) {
    activeDent = node && node.getAttr?.('name') === 'dent' ? node : null;
    if (handleGroup) {
      if (activeDent) {
        handleGroup.visible(true);
        positionHandle(activeDent);
      } else {
        handleGroup.visible(false);
      }
    }
  }
  const layer = layerDents.getLayer ? layerDents.getLayer() : layerDents;
  if (layer) layer.batchDraw();
  if (onSelectedDentChangeCallback) onSelectedDentChangeCallback(getSelectedDentSizeMm());
}

/** Снять выделение. B) Скрываем handle. */
function clearSelection() {
  if (!tr) return;
  tr.nodes([]);
  if (useMmMode) {
    activeDent = null;
    if (handleGroup) handleGroup.visible(false);
  }
  const layer = layerDents ? (layerDents.getLayer ? layerDents.getLayer() : layerDents) : null;
  if (layer) layer.batchDraw();
  if (onSelectedDentChangeCallback) onSelectedDentChangeCallback(null);
}

/**
 * B) createHandleGroup() — один handle (линия + крестик) поверх dents. Фирменный кислотно-зелёный, лёгкое свечение.
 * plusGroup draggable; визуал в plusVisualGroup (listening:false), hitCircle (listening:true).
 */
function createHandleGroup() {
  if (handleGroup) return;
  handleGroup = new Konva.Group({ name: 'dent-handle', visible: false, listening: true });
  const stemLine = new Konva.Line({
    name: 'stem-line',
    points: [0, 0, 0, 0],
    stroke: HANDLE_COLOR,
    strokeWidth: 1,
    listening: false
  });
  const plusGroup = new Konva.Group({ name: 'handle-plus', draggable: true, listening: true });
  const plusVisualGroup = new Konva.Group({ listening: false });
  const baseCircle = new Konva.Circle({
    radius: 10,
    x: 0,
    y: 0,
    fill: HANDLE_FILL,
    stroke: HANDLE_STROKE,
    strokeWidth: 1.5,
    shadowColor: HANDLE_COLOR,
    shadowBlur: 10,
    shadowOpacity: 0.55,
    listening: false
  });
  const line1 = new Konva.Line({
    points: [-6, 0, 6, 0],
    stroke: HANDLE_COLOR,
    strokeWidth: 2,
    lineCap: 'round',
    listening: false
  });
  const line2 = new Konva.Line({
    points: [0, -6, 0, 6],
    stroke: HANDLE_COLOR,
    strokeWidth: 2,
    lineCap: 'round',
    listening: false
  });
  const ring = new Konva.Circle({
    radius: 12,
    x: 0,
    y: 0,
    stroke: HANDLE_RING_STROKE,
    strokeWidth: 1,
    listening: false
  });
  plusVisualGroup.add(baseCircle);
  plusVisualGroup.add(line1);
  plusVisualGroup.add(line2);
  plusVisualGroup.add(ring);
  const hitCircle = new Konva.Circle({
    radius: HANDLE_HIT_RADIUS,
    x: 0,
    y: 0,
    fill: 'rgba(0,0,0,0)',
    listening: true
  });
  plusGroup.add(plusVisualGroup);
  plusGroup.add(hitCircle);
  handleGroup.add(stemLine);
  handleGroup.add(plusGroup);

  plusGroup.on('click tap dragstart', (e) => {
    e.cancelBubble = true;
  });
  plusGroup.on('dragstart', (e) => {
    if (e && e.cancelBubble !== undefined) e.cancelBubble = true;
    if (contentGroup) contentGroup.draggable(false);
    lastPlusPos = plusGroup.position();
  });
  plusGroup.on('dragmove', () => {
    const dent = activeDent || getActiveNode();
    if (!dent || dent.getAttr?.('name') !== 'dent') return;
    const p = plusGroup.position();
    const dx = p.x - lastPlusPos.x;
    const dy = p.y - lastPlusPos.y;
    dent.x(dent.x() + dx);
    dent.y(dent.y() + dy);
    if (useMmMode && imageNode) applyBounds(dent);
    positionHandle(dent);
    if (tr) {
      tr.nodes([dent]);
      if (tr.forceUpdate) tr.forceUpdate();
    }
    lastPlusPos = plusGroup.position();
    const meta = dent._dentMeta;
    if (meta) updateShapeCalc(dent, meta.type, meta.id, meta.sizes);
    const layer = layerDents.getLayer ? layerDents.getLayer() : layerDents;
    if (layer) layer.batchDraw();
  });
  plusGroup.on('dragend', () => {
    updateCameraDraggable();
  });
}

/** Масштаб handle под zoom: визуал не раздувается при приближении. */
function updateHandleStyle() {
  if (!handleGroup || !contentGroup) return;
  const z = contentGroup.scaleX();
  const plus = handleGroup.getChildren?.()?.[1];
  if (plus) plus.scale({ x: 1 / z, y: 1 / z });
}

/**
 * B) positionHandle(dent) — ставит handle (линия + крестик) под нижней точкой bbox вмятины.
 * Координаты относительно родителя (layerDents).
 */
function positionHandle(dent) {
  if (!handleGroup || !dent) return;
  const parent = dent.getParent();
  const dentRect = dent.getClientRect({ relativeTo: parent });
  const anchorX = dentRect.x + dentRect.width / 2;
  const anchorY = dentRect.y + dentRect.height;
  const stemLen = Math.max(STEM_LEN_MIN, Math.min(STEM_LEN_MAX, dentRect.height * STEM_LEN_RATIO));
  const plusCenterX = anchorX;
  const plusCenterY = anchorY + stemLen;

  const children = handleGroup.getChildren ? handleGroup.getChildren() : [];
  const stemLine = children[0];
  if (stemLine) stemLine.points([anchorX, anchorY, plusCenterX, plusCenterY]);

  const plus = children[1];
  if (plus) {
    plus.position({ x: plusCenterX, y: plusCenterY });
    lastPlusPos = { x: plusCenterX, y: plusCenterY };
    updateHandleStyle();
  }
}

function isRectInside(rect, bounds) {
  if (!rect || !bounds) return true;
  return (
    rect.x >= bounds.x &&
    rect.y >= bounds.y &&
    rect.x + rect.width <= bounds.x + bounds.width &&
    rect.y + rect.height <= bounds.y + bounds.height
  );
}

function isRectInsideAllBounds(rect) {
  if (!rect) return true;
  const partOk = partBounds ? isRectInside(rect, partBounds) : true;
  const stageOk = stageBounds ? isRectInside(rect, stageBounds) : true;
  return partOk && stageOk;
}

/**
 * D) removeWhiteBackground(img) — делает близко-белые пиксели прозрачными.
 * Порог: WHITE_THRESHOLD (245). Если «съедает» края детали — уменьшить до 240 или 235.
 */
function removeWhiteBackground(srcImage) {
  return new Promise((resolve, reject) => {
    const w = srcImage.naturalWidth || srcImage.width;
    const h = srcImage.naturalHeight || srcImage.height;
    if (!w || !h) {
      resolve(srcImage);
      return;
    }
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      resolve(srcImage);
      return;
    }
    ctx.drawImage(srcImage, 0, 0);
    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;
    const t = WHITE_THRESHOLD;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] > t && data[i + 1] > t && data[i + 2] > t) {
        data[i + 3] = 0;
      }
    }
    ctx.putImageData(imageData, 0, 0);
    const dataURL = canvas.toDataURL('image/png');
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('removeWhiteBackground: failed to load result image'));
    img.src = dataURL;
  });
}

/**
 * Загрузить изображение по src (Vite dev: /parts/..., PROD: /DentMetric/parts/...).
 * Абсолютный URL для надёжной загрузки на GitHub Pages. Только после onload строим сетку и вмятины.
 */
function loadPartImage(src) {
  const path = (src || '').replace(/^\/+/, '');
  const base = (baseUrl || import.meta.env?.BASE_URL || '/').replace(/\/$/, '') || '';
  const fullSrc = path
    ? base
      ? `${window.location.origin}${base}/${path}`
      : `/${path}`
    : '';
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (!img.naturalWidth || !img.naturalHeight) reject(new Error('Image invalid size'));
      else resolve(img);
    };
    img.onerror = () => reject(new Error('Image load failed: ' + fullSrc));
    img.src = fullSrc;
  });
}

/**
 * Инициализация Konva: поддержка детали как изображения (realSizeMm) или legacy Path
 * Для деталей с изображением — асинхронная загрузка картинки.
 */
export async function initKonva(containerEl, partData, priceMap, onDentChange, baseUrlOption = '', onSelectedDentChange = null) {
  if (!containerEl || !partData) return;

  containerRef = containerEl;
  baseUrl = baseUrlOption || '';
  selectedPart = partData;
  prices = priceMap || {};
  onDentChangeCallback = onDentChange;
  onSelectedDentChangeCallback = onSelectedDentChange ?? null;
  useMmMode = !!(partData.realSizeMm && partData.asset && partData.asset.type === 'image');
  pxPerMm = null;
  imageRect = null;

  let w = containerEl.offsetWidth || 0;
  let h = containerEl.offsetHeight || 0;
  if (w <= 0 || h <= 0) {
    await new Promise((r) => requestAnimationFrame(r));
    w = containerEl.offsetWidth || 0;
    h = containerEl.offsetHeight || 0;
  }
  if (w <= 0 || h <= 0) {
    w = Math.max(w, 320);
    h = Math.max(h, 240);
  }
  stageBounds = { x: 0, y: 0, width: w, height: h };

  if (stage) stage.destroy();

  stage = new Konva.Stage({ container: containerEl, width: w, height: h });

  if (useMmMode) {
    const mainLayer = new Konva.Layer();
    stage.add(mainLayer);
    bgRect = new Konva.Rect({
      x: 0,
      y: 0,
      width: w,
      height: h,
      fill: '#0b0f14',
      listening: false
    });
    mainLayer.add(bgRect);
    contentGroup = new Konva.Group();
    contentGroup.listening(true);
    contentGroup.draggable(false);
    mainLayer.add(contentGroup);
    layerParts = new Konva.Group();
    layerParts.listening(false);
    layerParts.setAttr('isBackground', true);
    layerGrid = new Konva.Group();
    layerGrid.listening(false);
    layerGrid.setAttr('isBackground', true);
    layerDents = new Konva.Group();
    contentGroup.add(layerParts);
    contentGroup.add(layerGrid);
    contentGroup.add(layerDents);
    await initImagePart(w, h);
    contentWidth = imageRect ? imageRect.width : 0;
    contentHeight = imageRect ? imageRect.height : 0;
    contentGroup.offset({ x: 0, y: 0 });
    const fit = computeFitTransform(w, h);
    baseScale = fit.scaleFit;
    basePos = { x: fit.posFit.x, y: fit.posFit.y };
    userScale = 1;
    userPan = { x: 0, y: 0 };
    applyTransform();
    contentGroup.dragBoundFunc((pos) => clampGroupPos(pos));
    contentGroup.on('dragmove', () => {
      const layer = contentGroup.getLayer();
      if (layer) layer.batchDraw();
    });
    contentGroup.on('dragend', () => {
      userPan.x = contentGroup.x() - basePos.x;
      userPan.y = contentGroup.y() - basePos.y;
      clampCamera();
    });
    updateCameraDraggable();
  } else {
    bgRect = null;
    contentGroup = null;
    contentWidth = 0;
    contentHeight = 0;
    heatZonesPx = [];
    layerParts = new Konva.Layer();
    stage.add(layerParts);
    initLegacyPathPart(w, h);
    layerDents = new Konva.Layer();
    stage.add(layerDents);
  }

  tr = new Konva.Transformer({
    anchorStroke: '#88E523',
    anchorFill: '#0B121E',
    anchorSize: 15,
    borderStroke: '#88E523',
    borderDash: [4, 4],
    centeredScaling: true,
    rotateEnabled: true
  });
  layerDents.add(tr);

  if (useMmMode) createHandleGroup();
  if (useMmMode && handleGroup) layerDents.add(handleGroup);

  stage.on('click tap', (e) => {
    const t = e.target;
    const isStage = t === stage;
    const isBackground = t?.getAttr && t.getAttr('isBackground') === true;
    const isTransformer = t === tr || (t?.getParent && t.getParent() === tr) || (tr && typeof tr.isAncestorOf === 'function' && tr.isAncestorOf(t));
    const isHandle = t?.name?.() === 'dent-handle' || t?.name?.() === 'handle-plus' || (t?.getParent?.()?.name?.() === 'dent-handle') || (t?.getParent?.()?.name?.() === 'handle-plus');
    if (isTransformer || isHandle) return;
    const isContentGroup = contentGroup && t === contentGroup;
    const isLayer = t?.getType && t.getType() === 'Layer';
    const isLayerDents = layerDents && t === layerDents;
    if (isStage || isBackground || isContentGroup || isLayer || isLayerDents) {
      tr.nodes([]);
      if (useMmMode) {
        activeDent = null;
        if (handleGroup) handleGroup.visible(false);
      }
      const layer = layerDents?.getLayer ? layerDents.getLayer() : layerDents;
      if (layer) layer.batchDraw();
      if (onSelectedDentChangeCallback) onSelectedDentChangeCallback(null);
    }
  });

  if (import.meta.env?.DEV) {
    console.log('[Konva] stage listening', stage.listening());
    stage.on('mousedown touchstart', (e) => {
      const t = e.target;
      console.log('[Konva] DOWN target=', t?.className, t?.name?.(), t?.getAttr?.('isBackground'));
    });
  }
  const drawLayer = layerDents.getLayer ? layerDents.getLayer() : layerDents;
  if (drawLayer) drawLayer.batchDraw();
}

/** Margin (px) для clamp: контент не уезжает за край больше чем на это. */
const CLAMP_MARGIN_PX = 40;

/**
 * C) clampCamera() — удерживает изображение детали в viewport; обновляет userPan и applyTransform.
 */
function clampCamera() {
  if (!contentGroup || !stage || !imageNode) return;
  const rect = imageNode.getClientRect({ relativeTo: stage });
  const stageW = stage.width();
  const stageH = stage.height();
  const m = CLAMP_MARGIN_PX;
  let dx = 0;
  let dy = 0;
  if (rect.x > m) dx = m - rect.x;
  else if (rect.x + rect.width < stageW - m) dx = (stageW - m) - (rect.x + rect.width);
  if (rect.y > m) dy = m - rect.y;
  else if (rect.y + rect.height < stageH - m) dy = (stageH - m) - (rect.y + rect.height);
  if (dx !== 0 || dy !== 0) {
    userPan.x += dx;
    userPan.y += dy;
    applyTransform();
  } else {
    contentGroup.getLayer().batchDraw();
  }
}

/**
 * A) applyBounds(node, opts) — ограничивает позицию вмятины bbox детали + margin (в stage-координатах).
 * opts: { marginPx } (по умолчанию BOUNDS_MARGIN_PX).
 */
function applyBounds(node, opts = {}) {
  if (!stage || !imageNode || !contentGroup) return;
  const marginPx = opts.marginPx ?? BOUNDS_MARGIN_PX;
  const partRect = imageNode.getClientRect({ relativeTo: stage });
  const expanded = {
    left: partRect.x - marginPx,
    top: partRect.y - marginPx,
    right: partRect.x + partRect.width + marginPx,
    bottom: partRect.y + partRect.height + marginPx
  };
  const dentRect = node.getClientRect({ relativeTo: stage });
  const dentLeft = dentRect.x;
  const dentTop = dentRect.y;
  const dentRight = dentRect.x + dentRect.width;
  const dentBottom = dentRect.y + dentRect.height;
  let dx = 0;
  let dy = 0;
  if (dentLeft < expanded.left) dx = expanded.left - dentLeft;
  else if (dentRight > expanded.right) dx = expanded.right - dentRight;
  if (dentTop < expanded.top) dy = expanded.top - dentTop;
  else if (dentBottom > expanded.bottom) dy = expanded.bottom - dentBottom;
  if (dx === 0 && dy === 0) return;
  const parent = node.getParent();
  if (!parent) return;
  const inv = parent.getAbsoluteTransform().copy().invert();
  const p0 = inv.point({ x: 0, y: 0 });
  const p1 = inv.point({ x: dx, y: dy });
  const localDx = p1.x - p0.x;
  const localDy = p1.y - p0.y;
  node.x(node.x() + localDx);
  node.y(node.y() + localDy);
}

/** Меньшая сторона фигуры в px (в координатах stage) для hit/stroke. */
function getDentMinSizePx(shape) {
  if (!shape) return 20;
  const scaleX = Math.max(0.01, shape.scaleX());
  const scaleY = Math.max(0.01, shape.scaleY());
  let sizePx;
  if (shape.className === 'Ellipse') {
    const dx = shape.radiusX() * scaleX * 2;
    const dy = shape.radiusY() * scaleY * 2;
    sizePx = Math.min(dx, dy);
  } else {
    sizePx = Math.min(shape.width() * scaleX, shape.height() * scaleY);
  }
  return sizePx;
}

/**
 * B) updateHitArea(shape) — hit area «чуть больше вмятины», с учётом zoom (в stage px).
 */
function updateHitArea(shape) {
  if (!shape || !contentGroup) return;
  const zoomVal = contentGroup.scaleX();
  const sizePx = getDentMinSizePx(shape);
  const sizeStage = sizePx * zoomVal;
  const baseHit = Math.max(HIT_SIZE_MIN, Math.min(HIT_SIZE_MAX, sizeStage * HIT_SIZE_RATIO));
  const hit = Math.max(2, baseHit / zoomVal);
  shape.hitStrokeWidth(hit);
}

/**
 * C) updateStroke(shape) — тонкий stroke для маленьких вмятин, с учётом zoom (размер в stage px).
 */
function updateStroke(shape) {
  if (!shape || !contentGroup) return;
  const zoomVal = contentGroup.scaleX();
  const sizePx = getDentMinSizePx(shape);
  const sizeStage = sizePx * zoomVal;
  const baseStroke = sizeStage < 40 ? STROKE_THIN : STROKE_NORMAL;
  const strokeWidth = Math.max(STROKE_MIN, Math.min(STROKE_MAX, baseStroke / zoomVal));
  shape.strokeWidth(strokeWidth);
}

/** Доп. тонкий stroke для маленьких dents: max(0.6, 1.2/zoom). */
function updateDentStyle(dent) {
  if (!dent || !contentGroup) return;
  const z = contentGroup.scaleX();
  dent.strokeWidth(Math.max(0.6, 1.2 / z));
}

/** B) enablePanByZoom() — pan только при zoom > 1.01; иначе камера не тянущаяся и clampCamera центрирует. */
function enablePanByZoom() {
  if (contentGroup) contentGroup.draggable(zoom > 1.01);
}
function updateCameraDraggable() {
  enablePanByZoom();
}

/**
 * clampGroupPos(pos) — для contentGroup.dragBoundFunc (возвращает позицию без мутации).
 */
function clampGroupPos(pos) {
  if (!contentGroup || !stage || contentWidth <= 0 || contentHeight <= 0) return pos;
  const stageW = stage.width();
  const stageH = stage.height();
  const totalScale = contentGroup.scaleX();
  const scaledW = contentWidth * totalScale;
  const scaledH = contentHeight * totalScale;
  let x = pos.x;
  let y = pos.y;
  if (scaledW >= stageW) {
    x = Math.max(0, Math.min(stageW - scaledW, x));
  } else {
    x = (stageW - scaledW) / 2;
  }
  if (scaledH >= stageH) {
    y = Math.max(0, Math.min(stageH - scaledH, y));
  } else {
    y = (stageH - scaledH) / 2;
  }
  return { x, y };
}

function clampContentPosition() {
  if (!contentGroup || !stage || contentWidth <= 0 || contentHeight <= 0) return;
  const pos = clampGroupPos(contentGroup.position());
  contentGroup.position(pos);
  if (imageNode) clampCamera();
  else contentGroup.getLayer().batchDraw();
}

/** Bounds контента: fit scale и позиция по центру для vw×vh. */
function computeFitTransform(vw, vh) {
  if (!contentWidth || !contentHeight || vw <= 0 || vh <= 0) {
    return { scaleFit: 1, posFit: { x: 0, y: 0 } };
  }
  const ratio = 0.92;
  const scaleFit = Math.min(vw / contentWidth, vh / contentHeight) * ratio;
  const posFit = {
    x: (vw - contentWidth * scaleFit) / 2,
    y: (vh - contentHeight * scaleFit) / 2
  };
  return { scaleFit, posFit };
}

/** Применить base + user transform на contentGroup; обновить zoom и перерисовать. */
function applyTransform() {
  if (!contentGroup || !stage) return;
  const totalScale = baseScale * userScale;
  zoom = totalScale;
  contentGroup.scale({ x: totalScale, y: totalScale });
  contentGroup.position({
    x: basePos.x + userPan.x,
    y: basePos.y + userPan.y
  });
  updateCameraDraggable();
  if (layerDents) {
    const children = layerDents.getChildren ? layerDents.getChildren() : [];
    children.forEach((node) => {
      if (node !== tr && node.getAttr?.('name') === 'dent') {
        updateStroke(node);
        updateHitArea(node);
        updateDentStyle(node);
      }
    });
  }
  updateHandleStyle();
  const layer = contentGroup.getLayer();
  if (layer) layer.batchDraw();
}

/**
 * B) setZoomCentered(newZoom) — управляет только userScale; центр stage фиксирован.
 */
export function setZoomCentered(newZoom) {
  const z = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, Math.round(Number(newZoom) * 10) / 10));
  if (!contentGroup || !stage || contentWidth <= 0 || contentHeight <= 0) return userScale;
  const stageW = stage.width();
  const stageH = stage.height();
  const anchor = { x: stageW / 2, y: stageH / 2 };
  const totalScale = baseScale * userScale;
  const pointInContent = {
    x: (anchor.x - (basePos.x + userPan.x)) / totalScale,
    y: (anchor.y - (basePos.y + userPan.y)) / totalScale
  };
  userScale = z;
  const newTotalScale = baseScale * userScale;
  userPan.x = anchor.x - pointInContent.x * newTotalScale - basePos.x;
  userPan.y = anchor.y - pointInContent.y * newTotalScale - basePos.y;
  applyTransform();
  return userScale;
}

/** Оставлен для совместимости; внутри вызывает setZoomCentered. */
export function setZoom(value) {
  return setZoomCentered(value);
}

export function zoomIn() {
  return setZoomCentered(userScale + 0.1);
}

export function zoomOut() {
  return setZoomCentered(userScale - 0.1);
}

/** Для UI слайдера: пользовательский зум (1..3), не итоговый base*user. */
export function getZoom() {
  return contentGroup ? userScale : 1;
}

/** Шаг панорамирования в экранных пикселях (в stage-координатах). */
const PAN_STEP_PX = 40;

/**
 * Pan by UI buttons: сдвиг userPan; затем clamp и applyTransform.
 */
export function panBy(dx, dy) {
  if (!contentGroup || !stage) return;
  if (zoom <= 1.01) return;
  userPan.x -= Number(dx) || 0;
  userPan.y -= Number(dy) || 0;
  const clamped = clampGroupPos({ x: basePos.x + userPan.x, y: basePos.y + userPan.y });
  userPan.x = clamped.x - basePos.x;
  userPan.y = clamped.y - basePos.y;
  applyTransform();
}

/**
 * Обновить размер stage при изменении контейнера; обновляет bgRect. В mm-режиме clamp не вызываем (fit делает scheduleFit).
 */
export function resizeStage(w, h) {
  if (!stage || w <= 0 || h <= 0) return;
  stage.width(w);
  stage.height(h);
  stageBounds = { x: 0, y: 0, width: w, height: h };
  if (bgRect) {
    bgRect.width(w);
    bgRect.height(h);
  }
  if (contentGroup && !imageNode && contentWidth > 0 && contentHeight > 0) {
    clampContentPosition();
  }
  const layer = layerDents ? (layerDents.getLayer ? layerDents.getLayer() : layerDents) : null;
  if (layer) layer.batchDraw();
}

/**
 * Resize stage to current container dimensions. Для fullscreen/fit вызывать scheduleFit.
 */
export function resizeStageToContainer() {
  const el = containerRef || (stage && stage.container && stage.container());
  if (!stage || !el) return;
  const w = el.clientWidth || el.offsetWidth;
  const h = el.clientHeight || el.offsetHeight;
  if (w <= 0 || h <= 0) return;
  resizeStage(w, h);
}

/**
 * Один раз: resize контейнера + пересчёт baseTransform (+ опционально сброс user). Без дерганий.
 */
function doResizeAndFitOnce(resetUser) {
  resizeStageToContainer();
  if (!contentGroup || contentWidth <= 0 || contentHeight <= 0) return;
  const vw = stage.width();
  const vh = stage.height();
  const fit = computeFitTransform(vw, vh);
  baseScale = fit.scaleFit;
  basePos = { x: fit.posFit.x, y: fit.posFit.y };
  if (resetUser) {
    userScale = 1;
    userPan = { x: 0, y: 0 };
  }
  applyTransform();
}

/**
 * Запланировать один fit на следующий RAF (вход/выход fullscreen, resize). Не перезаписывает user zoom/pan при resize.
 */
export function scheduleFit(reason) {
  if (fitPending) return;
  fitPending = true;
  requestAnimationFrame(() => {
    fitPending = false;
    const resetUser = reason === 'enter-fullscreen' || reason === 'exit-fullscreen';
    doResizeAndFitOnce(resetUser);
  });
}

function initLegacyPathPart(w, h) {
  const scaleX = w / 320;
  const scaleY = h / 420;
  const scale = Math.min(scaleX, scaleY);
  const partShape = new Konva.Path({
    data: selectedPart.path,
    fill: '#151F2E',
    stroke: '#334155',
    strokeWidth: 3 / scale,
    shadowColor: 'black',
    shadowBlur: 20,
    shadowOpacity: 0.5,
    scaleX: scale,
    scaleY: scale,
    x: (w - 300 * scale) / 2,
    y: (h - 400 * scale) / 2,
    name: 'partPath'
  });
  layerParts.add(partShape);
  partBounds = partShape.getClientRect();

  if (selectedPart.ribs && selectedPart.ribs.length) {
    selectedPart.ribs.forEach((rib) => {
      const ribRect = new Konva.Rect({
        x: rib.x * scale + partShape.x(),
        y: rib.y * scale + partShape.y(),
        width: rib.w * scale,
        height: rib.h * scale,
        fill: 'rgba(255, 50, 50, 0.25)',
        stroke: 'rgba(255, 50, 50, 0.5)',
        strokeWidth: 1,
        name: 'rib',
        listening: false
      });
      layerParts.add(ribRect);
    });
  }
}

async function initImagePart(stageW, stageH) {
  const realW = selectedPart.realSizeMm.w;
  const realH = selectedPart.realSizeMm.h;
  const src = selectedPart.asset.src;

  let imgNode = null;
  let dispW = 0;
  let dispH = 0;

  try {
    let img = await loadPartImage(src);
    if (REMOVE_WHITE_BACKGROUND) {
      try {
        img = await removeWhiteBackground(img);
      } catch (_) {
        // fallback: use original image
      }
    }
    const realWpx = Math.max(1, img.naturalWidth);
    const realHpx = Math.max(1, img.naturalHeight);
    const scale = Math.min(stageW / realWpx, stageH / realHpx) || 1;
    dispW = realWpx * scale;
    dispH = realHpx * scale;
    pxPerMm = Math.min(dispW / realW, dispH / realH) || 0.1;

    const underlay = new Konva.Rect({
      x: 0,
      y: 0,
      width: dispW,
      height: dispH,
      fill: 'rgba(255,255,255,0.03)',
      listening: false
    });
    layerParts.add(underlay);
    imgNode = new Konva.Image({
      image: img,
      x: 0,
      y: 0,
      width: dispW,
      height: dispH,
      shadowColor: 'black',
      shadowBlur: 18,
      shadowOpacity: 0.45,
      name: 'partImage',
      listening: false
    });
    imgNode.setAttr('isBackground', true);
    layerParts.add(imgNode);
    imageNode = imgNode;
  } catch (e) {
    dispW = Math.min(300, stageW);
    dispH = Math.min(400, stageH);
    pxPerMm = Math.min(dispW / realW, dispH / realH) || 0.1;
    imgNode = new Konva.Rect({
      x: 0,
      y: 0,
      width: dispW,
      height: dispH,
      fill: '#2a2a2a',
      stroke: '#444',
      strokeWidth: 2,
      name: 'partPlaceholder',
      listening: false
    });
    imgNode.setAttr('isBackground', true);
    layerParts.add(imgNode);
    const label = new Konva.Text({
      text: selectedPart.name || 'Деталь',
      fontSize: 16,
      fill: '#888',
      width: 280,
      padding: 10,
      align: 'center',
      listening: false
    });
    label.position({ x: 10, y: (dispH - label.height()) / 2 });
    layerParts.add(label);
    imageNode = imgNode;
  }

  imageRect = { x: 0, y: 0, width: dispW, height: dispH };
  partBounds = imageRect;

  drawGridStage(0, 0, dispW, dispH);
  heatZonesPx = [];
  // TODO: heatZones temporarily disabled — re-enable drawHeatZonesStage when zones are corrected

  const layer = layerParts.getLayer();
  if (layer) layer.batchDraw();
}

/** Сетка 30×30 мм в координатах contentGroup (0,0 — dispW, dispH). strokeScaleEnabled: false чтобы при зуме линии не жирнели. */
function drawGridStage(x, y, dispW, dispH) {
  if (!layerGrid || pxPerMm == null || dispW <= 0 || dispH <= 0) return;
  layerGrid.destroyChildren();
  const cellPx = CELL_MM * pxPerMm;
  const cols = Math.ceil(dispW / cellPx);
  const rows = Math.ceil(dispH / cellPx);
  for (let i = 0; i <= cols; i++) {
    const line = new Konva.Line({
      points: [x + i * cellPx, y, x + i * cellPx, y + dispH],
      stroke: 'rgba(255,255,255,0.06)',
      strokeWidth: 1,
      strokeScaleEnabled: false,
      listening: false
    });
    line.setAttr('isBackground', true);
    layerGrid.add(line);
  }
  for (let j = 0; j <= rows; j++) {
    const line = new Konva.Line({
      points: [x, y + j * cellPx, x + dispW, y + j * cellPx],
      stroke: 'rgba(255,255,255,0.06)',
      strokeWidth: 1,
      strokeScaleEnabled: false,
      listening: false
    });
    line.setAttr('isBackground', true);
    layerGrid.add(line);
  }
  const layer = layerGrid.getLayer();
  if (layer) layer.batchDraw();
}

/** HeatZones в координатах stage (displayRect offset + мм → px). */
function drawHeatZonesStage(dispX, dispY) {
  heatZonesPx = [];
  const zones = selectedPart.heatZones || selectedPart.ribs;
  if (!zones || !zones.length || !pxPerMm) return;
  zones.forEach((z) => {
    const xPx = dispX + (z.xMm ?? z.x ?? 0) * pxPerMm;
    const yPx = dispY + (z.yMm ?? z.y ?? 0) * pxPerMm;
    const wPx = (z.wMm ?? z.w ?? 0) * pxPerMm;
    const hPx = (z.hMm ?? z.h ?? 0) * pxPerMm;
    heatZonesPx.push({ x: xPx, y: yPx, width: wPx, height: hPx, mult: z.mult ?? RIB_MULTIPLIER });
    const rect = new Konva.Rect({
      x: xPx,
      y: yPx,
      width: wPx,
      height: hPx,
      fill: 'rgba(255,0,0,0.18)',
      stroke: 'rgba(255,0,0,0.45)',
      strokeWidth: 1,
      name: 'heatZone',
      listening: false
    });
    layerParts.add(rect);
  });
  const layer = layerParts.getLayer();
  if (layer) layer.batchDraw();
}

function getInterpolatedPriceByAreaMm2(areaMm2, type, sizesWithArea) {
  if (!sizesWithArea || sizesWithArea.length === 0) return 0;
  const sorted = [...sizesWithArea].sort((a, b) => a.areaMm2 - b.areaMm2);
  if (areaMm2 <= sorted[0].areaMm2) return prices[sorted[0].code] ?? 0;
  if (areaMm2 >= sorted[sorted.length - 1].areaMm2) return prices[sorted[sorted.length - 1].code] ?? 0;
  for (let i = 0; i < sorted.length - 1; i++) {
    const s1 = sorted[i];
    const s2 = sorted[i + 1];
    if (areaMm2 >= s1.areaMm2 && areaMm2 <= s2.areaMm2) {
      const p1 = prices[s1.code] ?? 0;
      const p2 = prices[s2.code] ?? 0;
      const ratio = (areaMm2 - s1.areaMm2) / (s2.areaMm2 - s1.areaMm2);
      return p1 + (p2 - p1) * ratio;
    }
  }
  return prices[sorted[0].code] ?? 0;
}

function getInterpolatedPriceByAreaPx(areaPx, type, sizes) {
  if (!sizes || sizes.length === 0) return 0;
  const sorted = [...sizes].sort((a, b) => (a.area || 0) - (b.area || 0));
  if (sorted[0].area != null && areaPx <= sorted[0].area) return prices[sorted[0].code] ?? sorted[0].basePrice ?? 0;
  const last = sorted[sorted.length - 1];
  if (last.area != null && areaPx >= last.area) return prices[last.code] ?? last.basePrice ?? 0;
  for (let i = 0; i < sorted.length - 1; i++) {
    const s1 = sorted[i];
    const s2 = sorted[i + 1];
    const a1 = s1.area ?? 0;
    const a2 = s2.area ?? 0;
    if (a2 > a1 && areaPx >= a1 && areaPx <= a2) {
      const p1 = prices[s1.code] ?? s1.basePrice ?? 0;
      const p2 = prices[s2.code] ?? s2.basePrice ?? 0;
      const ratio = (areaPx - a1) / (a2 - a1);
      return p1 + (p2 - p1) * ratio;
    }
  }
  return prices[sorted[0].code] ?? sorted[0].basePrice ?? 0;
}

function rectIntersectionArea(a, b) {
  const left = Math.max(a.x, b.x);
  const top = Math.max(a.y, b.y);
  const right = Math.min(a.x + a.width, b.x + b.width);
  const bottom = Math.min(a.y + a.height, b.y + b.height);
  const w = Math.max(0, right - left);
  const h = Math.max(0, bottom - top);
  return w * h;
}

function getShapeRectLocal(shape) {
  const scaleX = shape.scaleX();
  const scaleY = shape.scaleY();
  if (shape.className === 'Ellipse') {
    const rx = shape.radiusX() * scaleX;
    const ry = shape.radiusY() * scaleY;
    return {
      x: shape.x() - rx,
      y: shape.y() - ry,
      width: rx * 2,
      height: ry * 2
    };
  }
  const w = shape.width() * scaleX;
  const h = shape.height() * scaleY;
  const ox = shape.offsetX ? shape.offsetX() : 0;
  const oy = shape.offsetY ? shape.offsetY() : 0;
  return {
    x: shape.x() - (ox * scaleX || w / 2),
    y: shape.y() - (oy * scaleY || h / 2),
    width: w,
    height: h
  };
}

function updateShapeCalc(shape, type, id, sizes) {
  if (!shape || !stage) return;

  const scaleX = shape.scaleX();
  const scaleY = shape.scaleY();
  let areaPx = 0;
  if (shape.className === 'Ellipse') {
    areaPx = Math.PI * (shape.radiusX() * scaleX) * (shape.radiusY() * scaleY);
  } else {
    areaPx = shape.width() * scaleX * shape.height() * scaleY;
  }

  let areaMm2 = null;
  let cellsCount = null;
  if (useMmMode && pxPerMm != null && pxPerMm > 0) {
    areaMm2 = areaPx / (pxPerMm * pxPerMm);
    cellsCount = areaMm2 / (CELL_MM * CELL_MM);
  }

  let isComplex = false;
  let complexMult = 1;
  // TODO: heatZones temporarily disabled — re-enable when zones are corrected
  if (!useMmMode) {
    const shapeRect = shape.getClientRect();
    const ribs = stage.find('.rib');
    for (let rib of ribs) {
      if (Konva.Util.haveIntersection(rib.getClientRect(), shapeRect)) {
        isComplex = true;
        complexMult = RIB_MULTIPLIER;
        break;
      }
    }
  }

  let price;
  if (useMmMode && areaMm2 != null && sizes && sizes[0] && sizes[0].areaMm2 != null) {
    price = getInterpolatedPriceByAreaMm2(areaMm2, type, sizes);
  } else {
    price = getInterpolatedPriceByAreaPx(areaPx, type, sizes);
  }
  if (isComplex) price *= complexMult;

  if (isComplex) {
    shape.stroke('#FF4444');
    shape.fill(type === 'circle' ? 'rgba(255, 68, 68, 0.3)' : 'rgba(255, 68, 68, 0.3)');
  } else {
    shape.stroke(type === 'circle' ? '#88E523' : '#A0AEC0');
    shape.fill(type === 'circle' ? 'rgba(136, 229, 35, 0.3)' : 'rgba(200, 200, 200, 0.3)');
  }

  const dentData = {
    id,
    type,
    areaPx,
    areaMm2: areaMm2 ?? undefined,
    cellsCount: cellsCount != null ? Math.round(cellsCount * 100) / 100 : undefined,
    isComplex,
    price
  };
  dentsMap.set(id, dentData);
  if (onDentChangeCallback) {
    onDentChangeCallback(Array.from(dentsMap.values()));
  }
}

/** Макс. размер по оси в мм для UI (защита от багов). */
const SIZE_MM_MAX = 2000;
const SIZE_MM_MIN = 0.1;

/**
 * Размеры выбранной вмятины в мм (единый источник: pxPerMm в konvaEditor).
 * null если ничего не выбрано или не mm-режим.
 */
export function getSelectedDentSizeMm() {
  const node = getActiveNode();
  if (!node || !node._dentMeta || !useMmMode || pxPerMm == null || pxPerMm <= 0) return null;
  const r = getShapeRectLocal(node);
  return {
    id: node._dentMeta.id,
    type: node._dentMeta.type,
    widthMm: r.width / pxPerMm,
    heightMm: r.height / pxPerMm
  };
}

/**
 * Установить размеры выбранной вмятины по мм; центр сохраняется.
 * Вызывает applyBounds, updateShapeCalc, positionHandle.
 */
export function setSelectedDentSizeMm(widthMm, heightMm) {
  const node = getActiveNode();
  if (!node || !node._dentMeta || !useMmMode || pxPerMm == null || pxPerMm <= 0) return;
  const wMm = Math.max(SIZE_MM_MIN, Math.min(SIZE_MM_MAX, Number(widthMm) || SIZE_MM_MIN));
  const hMm = Math.max(SIZE_MM_MIN, Math.min(SIZE_MM_MAX, Number(heightMm) || SIZE_MM_MIN));
  const wPx = wMm * pxPerMm;
  const hPx = hMm * pxPerMm;
  if (node.className === 'Ellipse') {
    node.radiusX(wPx / 2);
    node.radiusY(hPx / 2);
  } else {
    node.width(wPx);
    node.height(hPx);
    node.scaleX(1);
    node.scaleY(1);
    node.offsetX(wPx / 2);
    node.offsetY(hPx / 2);
  }
  if (useMmMode && imageNode) applyBounds(node);
  const meta = node._dentMeta;
  updateShapeCalc(node, meta.type, meta.id, meta.sizes);
  updateStroke(node);
  updateHitArea(node);
  if (useMmMode && handleGroup) positionHandle(node);
  const layer = node.getLayer();
  if (layer) layer.batchDraw();
  if (onSelectedDentChangeCallback) onSelectedDentChangeCallback(getSelectedDentSizeMm());
}

export function addDent(type, sizeCode, sizes) {
  if (!stage || !layerDents || !tr) return;

  const sizeObj = sizes.find((s) => s.code === sizeCode);
  if (!sizeObj) return;

  const id = Date.now();
  let centerX, centerY;
  if (useMmMode && imageRect) {
    centerX = imageRect.x + imageRect.width / 2;
    centerY = imageRect.y + imageRect.height / 2;
  } else if (partBounds) {
    centerX = partBounds.x + partBounds.width / 2;
    centerY = partBounds.y + partBounds.height / 2;
  } else {
    centerX = stage.width() / 2;
    centerY = stage.height() / 2;
  }

  let shape;

  if (type === 'circle') {
    let radiusX, radiusY;
    if (useMmMode && pxPerMm != null && sizeObj.mm) {
      radiusX = (sizeObj.mm.w / 2) * pxPerMm;
      radiusY = (sizeObj.mm.h / 2) * pxPerMm;
    } else {
      const r = sizeObj.radius ?? 20;
      radiusX = r;
      radiusY = r;
    }
    shape = new Konva.Ellipse({
      x: centerX,
      y: centerY,
      radiusX: radiusX || 15,
      radiusY: radiusY || 15,
      fill: 'rgba(136, 229, 35, 0.3)',
      stroke: '#88E523',
      strokeWidth: 1,
      draggable: true,
      listening: true,
      name: 'dent',
      id: String(id)
    });
    shape.setAttr('type', 'circle');
  } else {
    let w, h;
    if (useMmMode && pxPerMm != null && sizeObj.mm) {
      w = (sizeObj.mm.w || sizeObj.w) * pxPerMm;
      h = (sizeObj.mm.h || sizeObj.h) * pxPerMm;
    } else {
      w = sizeObj.w ?? 40;
      h = sizeObj.h ?? 20;
    }
    shape = new Konva.Rect({
      x: centerX,
      y: centerY,
      width: w,
      height: h,
      offsetX: w / 2,
      offsetY: h / 2,
      cornerRadius: 5,
      fill: 'rgba(200, 200, 200, 0.3)',
      stroke: '#A0AEC0',
      strokeWidth: 1,
      draggable: true,
      listening: true,
      name: 'dent',
      id: String(id)
    });
    shape.setAttr('type', 'strip');
  }

  shape._dentMeta = { id, type, sizes };

  if (useMmMode && imageRect) {
    const r = getShapeRectLocal(shape);
    let dx = 0, dy = 0;
    if (r.x < imageRect.x) dx = imageRect.x - r.x;
    else if (r.x + r.width > imageRect.x + imageRect.width) dx = imageRect.x + imageRect.width - (r.x + r.width);
    if (r.y < imageRect.y) dy = imageRect.y - r.y;
    else if (r.y + r.height > imageRect.y + imageRect.height) dy = imageRect.y + imageRect.height - (r.y + r.height);
    if (dx !== 0 || dy !== 0) shape.position({ x: shape.x() + dx, y: shape.y() + dy });
  }

  /** A) В mm-режиме ограничение через applyBounds на dragmove/dragend; dragBoundFunc не используем, чтобы избежать инверсии. */
  shape.dragBoundFunc((pos) => {
    if (useMmMode) return pos;
    const currentPos = shape.position();
    const currentRect = shape.getClientRect();
    const dx = pos.x - currentPos.x;
    const dy = pos.y - currentPos.y;
    const nextRect = {
      x: currentRect.x + dx,
      y: currentRect.y + dy,
      width: currentRect.width,
      height: currentRect.height
    };
    if (isRectInsideAllBounds(nextRect)) return pos;
    return currentPos;
  });

  const MIN_SCALE = 0.1;
  const storeLastGoodTransform = () => {
    const sx = Math.max(MIN_SCALE, shape.scaleX());
    const sy = Math.max(MIN_SCALE, shape.scaleY());
    const attrs = {
      x: shape.x(),
      y: shape.y(),
      scaleX: sx,
      scaleY: sy,
      rotation: shape.rotation()
    };
    if (shape.className === 'Ellipse') {
      attrs.radiusX = shape.radiusX();
      attrs.radiusY = shape.radiusY();
    }
    shape._lastGoodTransform = attrs;
  };
  storeLastGoodTransform();

  /** Центр фигуры внутри bounds — не сбрасываем трансформ при растягивании. */
  const isCenterInsideBounds = (shape, bounds) => {
    const cx = shape.x();
    const cy = shape.y();
    return cx >= bounds.x && cx <= bounds.x + bounds.width && cy >= bounds.y && cy <= bounds.y + bounds.height;
  };

  const updateHandler = () => {
    updateShapeCalc(shape, type, id, sizes);
    if (useMmMode && partBounds) {
      const r = getShapeRectLocal(shape);
      if (isRectInside(r, partBounds)) storeLastGoodTransform();
      else if (isCenterInsideBounds(shape, partBounds)) storeLastGoodTransform();
    } else if (isRectInsideAllBounds(shape.getClientRect())) {
      storeLastGoodTransform();
    }
  };

  shape.on('dragstart', (e) => {
    e.cancelBubble = true;
    selectNode(shape);
    if (contentGroup) contentGroup.draggable(false);
  });
  shape.on('dragmove', () => {
    if (useMmMode && imageNode) applyBounds(shape);
    if (useMmMode && handleGroup) positionHandle(shape);
    if (tr) {
      tr.nodes([shape]);
      if (tr.forceUpdate) tr.forceUpdate();
    }
    updateHandler();
    const layer = layerDents.getLayer ? layerDents.getLayer() : layerDents;
    if (layer) layer.batchDraw();
  });
  shape.on('dragend', () => {
    if (useMmMode && imageNode) applyBounds(shape);
    if (useMmMode && handleGroup) positionHandle(shape);
    updateCameraDraggable();
    updateHandler();
    const layer = layerDents.getLayer ? layerDents.getLayer() : layerDents;
    if (layer) layer.batchDraw();
  });
  shape.on('transform', updateHandler);
  shape.on('transformstart', () => {
    if (contentGroup) contentGroup.draggable(false);
  });
  shape.on('transformend', () => {
    updateCameraDraggable();
    if (useMmMode && partBounds) {
      const r = getShapeRectLocal(shape);
      let dx = 0, dy = 0;
      if (r.x < partBounds.x) dx = partBounds.x - r.x;
      else if (r.x + r.width > partBounds.x + partBounds.width) dx = partBounds.x + partBounds.width - (r.x + r.width);
      if (r.y < partBounds.y) dy = partBounds.y - r.y;
      else if (r.y + r.height > partBounds.y + partBounds.height) dy = partBounds.y + partBounds.height - (r.y + r.height);
      if (dx !== 0 || dy !== 0) shape.position({ x: shape.x() + dx, y: shape.y() + dy });
    }
    if (shape.className === 'Rect') {
      const newW = Math.max(2, shape.width() * shape.scaleX());
      const newH = Math.max(2, shape.height() * shape.scaleY());
      shape.width(newW);
      shape.height(newH);
      shape.scaleX(1);
      shape.scaleY(1);
      shape.offsetX(newW / 2);
      shape.offsetY(newH / 2);
    }
    if (shape.className === 'Ellipse') {
      let newRx = shape.radiusX() * shape.scaleX();
      let newRy = shape.radiusY() * shape.scaleY();
      if (useMmMode && pxPerMm != null && pxPerMm > 0) {
        const maxR = (SIZE_MM_MAX / 2) * pxPerMm;
        newRx = Math.min(newRx, maxR);
        newRy = Math.min(newRy, maxR);
      }
      newRx = Math.max(2, newRx);
      newRy = Math.max(2, newRy);
      shape.radiusX(newRx);
      shape.radiusY(newRy);
      shape.scaleX(1);
      shape.scaleY(1);
    }
    if (useMmMode && imageNode) applyBounds(shape);
    updateStroke(shape);
    updateHitArea(shape);
    if (useMmMode && partBounds && shape._lastGoodTransform) {
      if (!isCenterInsideBounds(shape, partBounds)) {
        shape.setAttrs(shape._lastGoodTransform);
      } else {
        const sx = Math.max(MIN_SCALE, shape.scaleX());
        const sy = Math.max(MIN_SCALE, shape.scaleY());
        shape.scaleX(sx);
        shape.scaleY(sy);
        storeLastGoodTransform();
      }
    } else if (!useMmMode && !isRectInsideAllBounds(shape.getClientRect()) && shape._lastGoodTransform) {
      shape.setAttrs(shape._lastGoodTransform);
    }
    updateHandler();
    if (useMmMode && handleGroup) positionHandle(shape);
    if (onSelectedDentChangeCallback) onSelectedDentChangeCallback(getSelectedDentSizeMm());
  });
  shape.on('click tap', (e) => {
    e.cancelBubble = true;
    if (useMmMode) activeDent = shape;
    selectNode(shape);
  });

  layerDents.add(shape);
  if (handleGroup) handleGroup.moveToTop();
  updateStroke(shape);
  updateHitArea(shape);
  updateDentStyle(shape);
  selectNode(shape);
  updateHandler();
  const layer = layerDents.getLayer ? layerDents.getLayer() : layerDents;
  if (layer) layer.batchDraw();

  // if (import.meta.env?.DEV) console.debug('[Konva] dent added at', centerX, centerY, 'partBounds', partBounds);
}

export function rotateSelected(deltaDeg) {
  const node = getActiveNode();
  if (!node) return;
  node.rotation(node.rotation() + deltaDeg);
  const meta = node._dentMeta;
  if (meta) updateShapeCalc(node, meta.type, meta.id, meta.sizes);
  if (node.getLayer()) node.getLayer().batchDraw();
}

export function deleteSelected() {
  const node = getActiveNode();
  if (!node || !node._dentMeta) return;
  dentsMap.delete(node._dentMeta.id);
  tr.nodes([]);
  node.destroy();
  const layer = layerDents ? layerDents.getLayer() : null;
  if (layer) layer.batchDraw();
  if (onDentChangeCallback) onDentChangeCallback(Array.from(dentsMap.values()));
  if (onSelectedDentChangeCallback) onSelectedDentChangeCallback(null);
}

export function resetDents() {
  if (layerDents) {
    layerDents.destroyChildren();
    dentsMap.clear();
    if (stage && layerDents) {
      tr = new Konva.Transformer({
        anchorStroke: '#88E523',
        anchorFill: '#0B121E',
        anchorSize: 15,
        borderStroke: '#88E523',
        borderDash: [4, 4],
        centeredScaling: true,
        rotateEnabled: true
      });
      layerDents.add(tr);
      if (useMmMode) {
        handleGroup = null;
        createHandleGroup();
        if (handleGroup) layerDents.add(handleGroup);
      }
      const layer = layerDents.getLayer ? layerDents.getLayer() : layerDents;
      if (layer) layer.batchDraw();
    }
    if (onDentChangeCallback) onDentChangeCallback([]);
    if (onSelectedDentChangeCallback) onSelectedDentChangeCallback(null);
  }
}

export function getDents() {
  return Array.from(dentsMap.values());
}

export function destroyKonva() {
  if (stage) {
    stage.destroy();
    stage = null;
  }
  containerRef = null;
  baseScale = 1;
  basePos = { x: 0, y: 0 };
  userScale = 1;
  userPan = { x: 0, y: 0 };
  zoom = 1;
  fitPending = false;
  layerParts = null;
  layerGrid = null;
  layerDents = null;
  tr = null;
  selectedPart = null;
  prices = {};
  onDentChangeCallback = null;
  onSelectedDentChangeCallback = null;
  dentsMap.clear();
  partBounds = null;
  stageBounds = null;
  pxPerMm = null;
  imageRect = null;
  imageNode = null;
  useMmMode = false;
  baseUrl = '';
  contentGroup = null;
  contentWidth = 0;
  contentHeight = 0;
  heatZonesPx = [];
  bgRect = null;
  handleGroup = null;
  activeDent = null;
}
