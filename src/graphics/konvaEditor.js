import Konva from 'konva';
import { normalizeNumber, clamp } from '../utils/validation';

const RIB_MULTIPLIER = 1.3;
const CELL_MM = 30;
const HEAT_RATIO_THRESHOLD = 0.08;
/** A) Bounds для вмятин: зазор вокруг детали (px в stage). */
const BOUNDS_MARGIN_PX = 12;
/** Отступ сетки от края видимой части детали (1–2px). */
const GRID_PADDING_PX = 2;
/** B) Hit area: доля от размера фигуры, min/max px (удобный захват пальцем, но не мешает другим). */
const HIT_SIZE_MIN = 8;
const HIT_SIZE_MAX = 16;
const HIT_SIZE_RATIO = 0.42;
/** C) Stroke: тоньше для маленьких (minSizePx < 40), clamp. */
const STROKE_THIN = 0.8;
const STROKE_NORMAL = 1.4;
const STROKE_MIN = 0.6;
const STROKE_MAX = 2;
/** D) Удаление белого фона: порог RGB (255=только чисто белый). Уменьшить до 240 если «съедает» края. */
const REMOVE_WHITE_BACKGROUND = true;
const WHITE_THRESHOLD = 245;
/** E) Минимальный размер при ресайзе (px) — защита от инверсии и слишком мелких фигур. */
const MIN_TRANSFORM_SIZE_PX = 10;
/** B) Handle для перемещения вмятины: линия + крестик; смещён гораздо ниже формы. */
const HANDLE_OFFSET_MIN = 36;
const HANDLE_OFFSET_MAX = 70;
const HANDLE_OFFSET_RATIO = 0.4;
const HANDLE_HIT_RADIUS = 16;
const HANDLE_COLOR = '#88E523';
const HANDLE_FILL = 'rgba(136,229,35,0.22)';
const HANDLE_STROKE = 'rgba(136,229,35,0.9)';
const HANDLE_RING_STROKE = 'rgba(136,229,35,0.4)';
const HANDLE_VISUAL_RADIUS = 8;

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
/** gridRect в координатах contentGroup — область сетки (bbox детали + padding). Для clip и bounds вмятин. */
let gridRectRef = null;

/** Automatic fit-to-width transform: только baseScale и basePos (автоматическое масштабирование) */
let baseScale = 1;
let basePos = { x: 0, y: 0 };
let contentGroup = null;
let contentWidth = 0;
let contentHeight = 0;
/** Scheduler: один fit за RAF, без дерганий */
let fitPending = false;
/** Размеры stage при последнем fit (чтобы не двигать вид при ложном resize, напр. после закрытия модалки) */
let lastFitW = 0;
let lastFitH = 0;
/** Допуск в px: при изменении размера не больше этого считаем "без изменений", вид статичен */
const FIT_SIZE_TOLERANCE_PX = 4;
/** Сложные зоны в px в координатах stage для расчёта пересечения */
let heatZonesPx = [];
/** Тёмный фон stage в режиме мм (под contentGroup) */
let bgRect = null;
/** B) Handle для перемещения выбранной вмятины (крестик снизу). Только в mm-режиме. */
let handleGroup = null;
let activeDent = null;
let lastPlusPos = { x: 0, y: 0 };
/** Режим свободного растяжения (не keepRatio) для выбранной вмятины. */
let transformerKeepRatio = true;
/** ResizeObserver и window resize — для подстройки Stage под контейнер. */
let resizeObserverRef = null;
let resizeObservedEl = null;
let windowResizeHandler = null;
/** Текущий шаг визарда: 1=Размещение (форма и handle draggable), 2+=редактирование. */
let wizardStep = 2;
/** Скрыть сетку на мобильных (узкий экран). */
let hideGridOnMobile = false;

function getActiveNode() {
  if (!tr) return null;
  const nodes = tr.nodes();
  if (nodes && nodes.length > 0) return nodes[0];
  /** На этапе 1 Transformer не привязан — используем activeDent для выбора и удаления. */
  if (useMmMode && activeDent) return activeDent;
  return null;
}

/** Выбрать одну фигуру. На этапе 1: только handle "плюс", без Transformer. На этапе 2+: Transformer + handle. */
function selectNode(node) {
  if (!tr || !layerDents) return;
  tr.keepRatio(transformerKeepRatio);
  /** На этапе 1 не привязываем к Transformer (нет квадратов/ручек resize). */
  tr.nodes(wizardStep === 1 ? [] : [node]);
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
    radius: HANDLE_VISUAL_RADIUS,
    x: 0,
    y: 0,
    fill: HANDLE_FILL,
    stroke: HANDLE_STROKE,
    strokeWidth: 1.5,
    shadowColor: HANDLE_COLOR,
    shadowBlur: 8,
    shadowOpacity: 0.5,
    listening: false
  });
  const line1 = new Konva.Line({
    points: [-5, 0, 5, 0],
    stroke: HANDLE_COLOR,
    strokeWidth: 1.8,
    lineCap: 'round',
    listening: false
  });
  const line2 = new Konva.Line({
    points: [0, -5, 0, 5],
    stroke: HANDLE_COLOR,
    strokeWidth: 1.8,
    lineCap: 'round',
    listening: false
  });
  const ring = new Konva.Circle({
    radius: HANDLE_VISUAL_RADIUS + 2,
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
  plusGroup.on('mousedown touchstart', () => {
    if (contentGroup) contentGroup.draggable(false);
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
    // Handle drag end
  });
}

/** Масштаб handle под автоматический fit: визуал не раздувается. */
function updateHandleStyle() {
  if (!handleGroup || !contentGroup) return;
  const s = contentGroup.scaleX();
  const plus = handleGroup.getChildren?.()?.[1];
  if (plus) plus.scale({ x: 1 / s, y: 1 / s });
}

/**
 * B) positionHandle(dent) — ставит handle (линия + крестик) ниже bbox формы.
 * offset = clamp(rect.height * 0.18, 18, 34) — адаптивный отступ, палец не перекрывает вмятину.
 * Координаты относительно родителя (layerDents). При перемещении вмятины плюс следует за ней.
 */
function positionHandle(dent) {
  if (!handleGroup || !dent) return;
  const parent = dent.getParent();
  const dentRect = dent.getClientRect({ relativeTo: parent });
  const anchorX = dentRect.x + dentRect.width / 2;
  const anchorY = dentRect.y + dentRect.height;
  const offset = Math.max(HANDLE_OFFSET_MIN, Math.min(HANDLE_OFFSET_MAX, dentRect.height * HANDLE_OFFSET_RATIO));
  const plusCenterX = anchorX;
  const plusCenterY = anchorY + offset;

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

/** Кэш bbox по ключу src — не сканировать пиксели повторно. */
const alphaBoundsCache = new Map();

/**
 * computeAlphaBounds(img, alphaThreshold): bbox видимой области (контур детали).
 * - PNG с прозрачностью: alpha > threshold.
 * - JPG без alpha: исключаем near-white фон (R,G,B > WHITE_THRESHOLD).
 * Fallback: весь размер, если ничего не найдено.
 */
function computeAlphaBounds(img, alphaThreshold = 10) {
  const cacheKey = img.src || img.currentSrc || '';
  if (cacheKey && alphaBoundsCache.has(cacheKey)) {
    return alphaBoundsCache.get(cacheKey);
  }
  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;
  const fallback = { x: 0, y: 0, width: w || 1, height: h || 1 };
  if (!w || !h) return fallback;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return fallback;
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, w, h).data;
  const whiteT = WHITE_THRESHOLD;
  let minX = w, minY = h, maxX = 0, maxY = 0;
  let found = false;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      const isTransparent = a <= alphaThreshold;
      const isNearWhite = r > whiteT && g > whiteT && b > whiteT;
      const isContent = !isTransparent && !isNearWhite;
      if (isContent) {
        found = true;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  const result = found
    ? { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 }
    : fallback;
  if (cacheKey) alphaBoundsCache.set(cacheKey, result);
  return result;
}

/** Bbox непустых (непрозрачных) пикселей в координатах изображения. Порог alpha. */
function getImageOpaqueBbox(img, alphaThreshold = 10) {
  const bbox = computeAlphaBounds(img, alphaThreshold);
  return bbox.width > 0 && bbox.height > 0 ? bbox : null;
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

  if (stage) {
    stage.destroy();
    stage = null;
  }
  /** Сброс handleGroup — иначе при смене детали (капот→дверь→крыло) handle остаётся ссылкой на уничтоженный узел */
  handleGroup = null;
  activeDent = null;

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
    if (gridRectRef) {
      contentGroup.clip({ x: gridRectRef.x, y: gridRectRef.y, width: gridRectRef.width, height: gridRectRef.height });
    }
    const fit = computeFitTransform(w, h);
    baseScale = fit.scaleFit;
    basePos = { x: fit.posFit.x, y: fit.posFit.y };
    lastFitW = w;
    lastFitH = h;
    applyTransform();
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
    rotateEnabled: true,
    keepRatio: transformerKeepRatio,
    /** Запрет инверсии (отрицательного scale) и минимальный размер при ресайзе. */
    boundBoxFunc: (oldBox, newBox) => {
      if (newBox.width < MIN_TRANSFORM_SIZE_PX || newBox.height < MIN_TRANSFORM_SIZE_PX) return oldBox;
      if (newBox.width < 0 || newBox.height < 0) return oldBox;
      return newBox;
    }
  });
  tr.on('mousedown touchstart', () => {
    if (contentGroup) contentGroup.draggable(false);
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

  const drawLayer = layerDents.getLayer ? layerDents.getLayer() : layerDents;
  if (drawLayer) drawLayer.batchDraw();

  /** ResizeObserver: при изменении размеров контейнера — resize + fit. */
  if (resizeObserverRef && resizeObservedEl) {
    resizeObserverRef.unobserve(resizeObservedEl);
    resizeObserverRef = null;
    resizeObservedEl = null;
  }
  resizeObservedEl = containerEl;
  resizeObserverRef = new ResizeObserver(() => {
    scheduleFit('resize-observer');
  });
  resizeObserverRef.observe(containerEl);

  /** window resize — запасной вариант (orientation, virtual keyboard и т.д.). */
  windowResizeHandler = () => scheduleFit('window-resize');
  window.addEventListener('resize', windowResizeHandler);
}


/**
 * A) applyBounds(node, opts) — ограничивает позицию вмятины bbox детали + margin (в stage-координатах).
 * Использует gridRect (если есть) как bounds, иначе imageNode.
 * opts: { marginPx } (по умолчанию BOUNDS_MARGIN_PX).
 */
function applyBounds(node, opts = {}) {
  if (!stage || !contentGroup) return;
  const marginPx = gridRectRef ? (opts.marginPx ?? 0) : (opts.marginPx ?? BOUNDS_MARGIN_PX);
  let partRect;
  if (gridRectRef) {
    const s = contentGroup.scaleX();
    const pos = contentGroup.position();
    partRect = {
      x: pos.x + gridRectRef.x * s,
      y: pos.y + gridRectRef.y * s,
      width: gridRectRef.width * s,
      height: gridRectRef.height * s
    };
  } else if (imageNode) {
    partRect = imageNode.getClientRect({ relativeTo: stage });
  } else {
    return;
  }
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

/** Меньшая сторона фигуры в px (в координатах stage) для hit/stroke. Использует Math.abs. */
function getDentMinSizePx(shape) {
  if (!shape) return 20;
  const scaleX = Math.max(0.01, Math.abs(shape.scaleX()));
  const scaleY = Math.max(0.01, Math.abs(shape.scaleY()));
  let sizePx;
  if (shape.className === 'Ellipse') {
    const dx = Math.abs(shape.radiusX()) * scaleX * 2;
    const dy = Math.abs(shape.radiusY()) * scaleY * 2;
    sizePx = Math.min(dx, dy);
  } else {
    sizePx = Math.min(Math.abs(shape.width()) * scaleX, Math.abs(shape.height()) * scaleY);
  }
  return sizePx;
}

/**
 * B) updateHitArea(shape) — hit area «чуть больше вмятины», с учётом scale (в stage px).
 */
function updateHitArea(shape) {
  if (!shape || !contentGroup) return;
  const scaleVal = contentGroup.scaleX();
  const sizePx = getDentMinSizePx(shape);
  const sizeStage = sizePx * scaleVal;
  const baseHit = Math.max(HIT_SIZE_MIN, Math.min(HIT_SIZE_MAX, sizeStage * HIT_SIZE_RATIO));
  const hit = Math.max(2, baseHit / scaleVal);
  shape.hitStrokeWidth(hit);
}

/**
 * C) updateStroke(shape) — тонкий stroke для маленьких вмятин, с учётом scale (размер в stage px).
 */
function updateStroke(shape) {
  if (!shape || !contentGroup) return;
  const scaleVal = contentGroup.scaleX();
  const sizePx = getDentMinSizePx(shape);
  const sizeStage = sizePx * scaleVal;
  const baseStroke = sizeStage < 40 ? STROKE_THIN : STROKE_NORMAL;
  const strokeWidth = Math.max(STROKE_MIN, Math.min(STROKE_MAX, baseStroke / scaleVal));
  shape.strokeWidth(strokeWidth);
}

/** Доп. тонкий stroke для маленьких dents: max(0.6, 1.2/scale). */
function updateDentStyle(dent) {
  if (!dent || !contentGroup) return;
  const s = contentGroup.scaleX();
  dent.strokeWidth(Math.max(0.6, 1.2 / s));
}



/** Микро-коэффициент (0.99) чтобы избежать обрезания на 1px по краям. */
const FIT_MICRO_GAP = 0.99;

/**
 * fitPartToStage(mode): авто-масштаб детали максимально крупно.
 * mode = 'fitWidth' (по умолчанию): приоритет — занять почти всю ширину, центрировать по высоте.
 * Если при scaleX деталь по высоте не помещается — fallback на contain (min(scaleX, scaleY)).
 */
function computeFitTransform(vw, vh, mode = 'fitWidth') {
  if (!contentWidth || !contentHeight || vw <= 0 || vh <= 0) {
    return { scaleFit: 1, posFit: { x: 0, y: 0 } };
  }
  const scaleX = vw / contentWidth;
  const scaleY = vh / contentHeight;
  let scaleFit;
  if (mode === 'fitWidth') {
    scaleFit = scaleX;
    if (contentHeight * scaleX > vh) {
      scaleFit = Math.min(scaleX, scaleY);
    }
  } else {
    scaleFit = Math.min(scaleX, scaleY);
  }
  scaleFit *= FIT_MICRO_GAP;
  if (!Number.isFinite(scaleFit) || scaleFit <= 0) scaleFit = 1;
  const scaledW = contentWidth * scaleFit;
  const scaledH = contentHeight * scaleFit;
  const posFit = {
    x: (vw - scaledW) / 2,
    y: (vh - scaledH) / 2
  };
  return { scaleFit, posFit };
}

/** Применить автоматический fit transform на contentGroup и перерисовать. */
function applyTransform() {
  if (!contentGroup || !stage) return;
  contentGroup.scale({ x: baseScale, y: baseScale });
  contentGroup.position({ x: basePos.x, y: basePos.y });
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


/** Включить/выключить сохранение пропорций при растягивании выбранной вмятины (свободное растяжение). */
export function setKeepRatio(keepRatio) {
  transformerKeepRatio = !!keepRatio;
  if (tr) tr.keepRatio(transformerKeepRatio);
}

/**
 * Включить/выключить интерактивность редактора (режим "только просмотр" на шаге "Условия").
 * Когда false: никакой drag, resize, rotate, выделения; stage не реагирует на клики/тапы.
 * step: 1=Размещение (форма draggable, handle "плюс" тоже, без Transformer); 2+=полное редактирование.
 */
export function setEditorInteractive(interactive, step = 2) {
  if (!stage) return;
  wizardStep = step;
  stage.listening(!!interactive);
  /** На этапе 1: Transformer скрыт (нет квадратов/ручек resize). На этапе 2+: показываем. */
  if (tr) {
    if (step === 1) {
      tr.nodes([]);
      tr.visible(false);
    } else {
      tr.visible(!!interactive);
      if (!!interactive && activeDent) tr.nodes([activeDent]);
    }
  }
  if (handleGroup) handleGroup.visible(!!interactive && !!activeDent);
  /** На этапе 1: сетка скрыта. На этапах 2/3 — показываем, кроме мобильной версии. */
  if (layerGrid) layerGrid.visible(step !== 1 && !hideGridOnMobile);
  /** На этапах 1–2: форма draggable (и за саму вмятину, и за крестик). */
  const shapeDraggable = !!interactive;
  const children = layerDents?.getChildren?.() || [];
  children.forEach((node) => {
    if (node !== tr && node !== handleGroup && node.getAttr?.('name') === 'dent') {
      node.draggable(shapeDraggable);
    }
  });
  /** Handle "плюс": draggable только когда interactive (этапы 1–2). */
  const plusGroup = handleGroup?.getChildren?.()?.[1];
  if (plusGroup && plusGroup.getAttr?.('name') === 'handle-plus') plusGroup.draggable(!!interactive);
  const layer = layerDents?.getLayer ? layerDents.getLayer() : layerDents;
  if (layer) layer.batchDraw();
}

/**
 * Включить/выключить редактирование.
 * editable=true, step=1: форма draggable (и за крестик, и за саму вмятину).
 * editable=true, step>=2: форма draggable (текущая логика).
 * editable=false: только отрисовка.
 */
export function setEditable(editable, step = 2) {
  setEditorInteractive(!!editable, editable ? step : 2);
}

/** Скрыть сетку на мобильных (ширина < 480px). Вызывать при resize. */
export function setHideGridOnMobile(hide) {
  hideGridOnMobile = !!hide;
  if (layerGrid) {
    layerGrid.visible(wizardStep !== 1 && !hideGridOnMobile);
    const layer = layerGrid.getLayer ? layerGrid.getLayer() : null;
    if (layer) layer.batchDraw();
  }
}

/**
 * Обновить размер stage при изменении контейнера; обновляет bgRect.
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
  const layer = layerDents ? (layerDents.getLayer ? layerDents.getLayer() : layerDents) : null;
  if (layer) layer.batchDraw();
}

/**
 * Resize stage to current container dimensions (getBoundingClientRect для точности).
 * Для fullscreen/fit вызывать scheduleFit.
 */
export function resizeStageToContainer() {
  const el = containerRef || (stage && stage.container && stage.container());
  if (!stage || !el) return;
  const rect = el.getBoundingClientRect();
  const w = Math.round(rect.width) || el.clientWidth || el.offsetWidth;
  const h = Math.round(rect.height) || el.clientHeight || el.offsetHeight;
  if (w <= 0 || h <= 0) return;
  resizeStage(w, h);
}

/**
 * Один раз: resize контейнера + пересчёт fit-to-width transform. Без дерганий.
 * Если размеры изменились не больше чем на FIT_SIZE_TOLERANCE_PX (напр. скроллбар/модалка) — basePos/baseScale не трогаем, вид статичен.
 */
function doResizeAndFitOnce() {
  resizeStageToContainer();
  if (!contentGroup || contentWidth <= 0 || contentHeight <= 0) return;
  const vw = stage.width();
  const vh = stage.height();
  const tol = FIT_SIZE_TOLERANCE_PX;
  const sizeUnchanged = lastFitW > 0 && lastFitH > 0 &&
    Math.abs(vw - lastFitW) <= tol && Math.abs(vh - lastFitH) <= tol;
  if (sizeUnchanged) {
    applyTransform();
    return;
  }
  lastFitW = vw;
  lastFitH = vh;
  const fit = computeFitTransform(vw, vh, 'fitWidth');
  baseScale = fit.scaleFit;
  basePos = { x: fit.posFit.x, y: fit.posFit.y };
  applyTransform();
}

/**
 * Запланировать один fit-to-width на следующий RAF (вход/выход fullscreen, resize, orientationchange).
 */
export function scheduleFit(reason) {
  if (fitPending) return;
  fitPending = true;
  requestAnimationFrame(() => {
    fitPending = false;
    doResizeAndFitOnce();
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
  let imgForBbox = null;

  try {
    let img = await loadPartImage(src);
    if (REMOVE_WHITE_BACKGROUND) {
      try {
        img = await removeWhiteBackground(img);
      } catch (_) {
        // fallback: use original image
      }
    }
    imgForBbox = img;
    const natW = img.naturalWidth || img.width;
    const natH = img.naturalHeight || img.height;
    const bbox = computeAlphaBounds(img, 10);
    dispW = bbox.width;
    dispH = bbox.height;
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
      crop: { x: bbox.x, y: bbox.y, width: bbox.width, height: bbox.height },
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
  gridRectRef = null;

  const gridRect = { x: 0, y: 0, width: dispW, height: dispH };
  gridRectRef = gridRect;
  partBounds = gridRect;
  drawGridStage(gridRect.x, gridRect.y, gridRect.width, gridRect.height);
  heatZonesPx = [];
  // TODO: heatZones temporarily disabled — re-enable drawHeatZonesStage when zones are corrected

  const layer = layerParts.getLayer();
  if (layer) layer.batchDraw();
}

/** Сетка 30×30 мм. (x,y,dispW,dispH) — область отрисовки в координатах contentGroup. Линии выравниваются по глобальной сетке (0,0). */
function drawGridStage(x, y, dispW, dispH) {
  if (!layerGrid || pxPerMm == null || dispW <= 0 || dispH <= 0) return;
  layerGrid.destroyChildren();
  const cellPx = CELL_MM * pxPerMm;
  const firstCol = Math.floor(x / cellPx);
  const lastCol = Math.ceil((x + dispW) / cellPx);
  const firstRow = Math.floor(y / cellPx);
  const lastRow = Math.ceil((y + dispH) / cellPx);
  for (let i = firstCol; i <= lastCol; i++) {
    const lx = i * cellPx;
    const line = new Konva.Line({
      points: [lx, y, lx, y + dispH],
      stroke: 'rgba(255,255,255,0.06)',
      strokeWidth: 1,
      strokeScaleEnabled: false,
      listening: false
    });
    line.setAttr('isBackground', true);
    layerGrid.add(line);
  }
  for (let j = firstRow; j <= lastRow; j++) {
    const ly = j * cellPx;
    const line = new Konva.Line({
      points: [x, ly, x + dispW, ly],
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
  const last = sorted[sorted.length - 1];
  const areaS11 = last.areaMm2 ?? 0;
  const priceS11 = prices[last.code] ?? 15000;
  if (areaMm2 <= areaS11) {
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
    return priceS11;
  }
  /** Площадь > S11: убираем потолок. Условия считаются от фактической предварительной цены. */
  const extraArea = areaMm2 - areaS11;
  const markup = Math.max(500, 3500 * Math.log(1 + extraArea / 50000));
  return priceS11 + markup;
}

function getInterpolatedPriceByAreaPx(areaPx, type, sizes) {
  if (!sizes || sizes.length === 0) return 0;
  const sorted = [...sizes].sort((a, b) => (a.area || 0) - (b.area || 0));
  if (sorted[0].area != null && areaPx <= sorted[0].area) return prices[sorted[0].code] ?? sorted[0].basePrice ?? 0;
  const last = sorted[sorted.length - 1];
  const areaMax = last.area ?? 0;
  const priceMax = prices[last.code] ?? last.basePrice ?? 42000;
  if (areaPx <= areaMax) {
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
    return priceMax;
  }
  /** Площадь > LS8: убираем потолок 42 000. Условия считаются от фактической предварительной цены. */
  const extraArea = areaPx - areaMax;
  const markup = Math.max(500, 5000 * Math.log(1 + extraArea / 50000));
  return priceMax + markup;
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

/** Возвращает локальный rect фигуры; всегда положительные width/height (через Math.abs). */
function getShapeRectLocal(shape) {
  const scaleX = Math.abs(shape.scaleX()) || 1;
  const scaleY = Math.abs(shape.scaleY()) || 1;
  if (shape.className === 'Ellipse') {
    const rx = Math.abs(shape.radiusX() * scaleX);
    const ry = Math.abs(shape.radiusY() * scaleY);
    return {
      x: shape.x() - rx,
      y: shape.y() - ry,
      width: rx * 2,
      height: ry * 2
    };
  }
  const w = Math.abs(shape.width() * scaleX);
  const h = Math.abs(shape.height() * scaleY);
  const ox = shape.offsetX ? shape.offsetX() : 0;
  const oy = shape.offsetY ? shape.offsetY() : 0;
  return {
    x: shape.x() - (Math.abs(ox * scaleX) || w / 2),
    y: shape.y() - (Math.abs(oy * scaleY) || h / 2),
    width: w,
    height: h
  };
}

/** Пересчёт площади и цены вмятины; использует Math.abs для защиты от инверсии. */
function updateShapeCalc(shape, type, id, sizes) {
  if (!shape || !stage) return;

  // Используем абсолютные значения scale для корректного расчёта площади (защита от NaN/undefined)
  const scaleX = Math.max(0.01, Math.abs(normalizeNumber(shape.scaleX(), 1)));
  const scaleY = Math.max(0.01, Math.abs(normalizeNumber(shape.scaleY(), 1)));
  let areaPx = 0;
  if (shape.className === 'Ellipse') {
    areaPx = Math.PI * Math.abs(shape.radiusX() * scaleX) * Math.abs(shape.radiusY() * scaleY);
  } else {
    areaPx = Math.abs(shape.width() * scaleX) * Math.abs(shape.height() * scaleY);
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
    price,
    rotation: shape.rotation ? shape.rotation() : 0
  };
  dentsMap.set(id, dentData);
  if (onDentChangeCallback) {
    onDentChangeCallback(Array.from(dentsMap.values()));
  }
}

/** Макс. размер по оси в мм для UI (защита от багов). */
const SIZE_MM_MAX = 2000;
const SIZE_MM_MIN = 0.1;
/** Порог для авто-выбора круга: |width - height| < 2 мм → круг. */
const CIRCLE_EQUAL_THRESHOLD_MM = 2;

/** Авто shapeVariant: ширина ≈ высота → круг, иначе овал. Для strip: ширина ≥ высота → полоса, иначе царапина. */
function inferShapeVariant(type, widthMm, heightMm) {
  const w = normalizeNumber(widthMm, 0);
  const h = normalizeNumber(heightMm, 0);
  if (type === 'circle') {
    return Math.abs(w - h) < CIRCLE_EQUAL_THRESHOLD_MM ? 'circle' : 'oval';
  }
  return w >= h ? 'strip' : 'scratch';
}

/**
 * Размеры выбранной вмятины в мм (единый источник: pxPerMm в konvaEditor).
 * shapeVariant вычисляется автоматически: круг если width≈height, иначе овал.
 */
export function getSelectedDentSizeMm() {
  const node = getActiveNode();
  if (!node || !node._dentMeta || !useMmMode || pxPerMm == null || pxPerMm <= 0) return null;
  const r = getShapeRectLocal(node);
  const wPx = normalizeNumber(r?.width, 0);
  const hPx = normalizeNumber(r?.height, 0);
  const px = Math.max(0.01, pxPerMm);
  const widthMm = clamp(wPx / px, SIZE_MM_MIN, SIZE_MM_MAX);
  const heightMm = clamp(hPx / px, SIZE_MM_MIN, SIZE_MM_MAX);
  const type = node._dentMeta.type;
  const shapeVariant = inferShapeVariant(type, widthMm, heightMm);
  node._dentMeta.shapeVariant = shapeVariant;
  return {
    id: node._dentMeta.id,
    type,
    shapeVariant,
    widthMm,
    heightMm
  };
}

/**
 * Установить размеры выбранной вмятины по мм; центр сохраняется.
 * Вызывает applyBounds, updateShapeCalc, positionHandle.
 */
export function setSelectedDentSizeMm(widthMm, heightMm) {
  const node = getActiveNode();
  if (!node || !node._dentMeta || !useMmMode || pxPerMm == null || pxPerMm <= 0) return;
  const wMm = clamp(normalizeNumber(widthMm, SIZE_MM_MIN), SIZE_MM_MIN, SIZE_MM_MAX);
  const hMm = clamp(normalizeNumber(heightMm, SIZE_MM_MIN), SIZE_MM_MIN, SIZE_MM_MAX);
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

/**
 * Установить вариант формы вмятины: circle/oval для type=circle, strip/scratch для type=strip.
 * Сохраняет позицию, clamp размеров > 1.
 */
export function setDentShapeVariant(variant) {
  const node = getActiveNode();
  if (!node || !node._dentMeta || !useMmMode || pxPerMm == null || pxPerMm <= 0) return;
  const meta = node._dentMeta;
  const type = meta.type;
  const r = getShapeRectLocal(node);
  const minPx = Math.max(2, SIZE_MM_MIN * pxPerMm);
  const cx = node.x();
  const cy = node.y();

  if (type === 'circle') {
    const rx = Math.max(minPx / 2, r.width / 2);
    const ry = Math.max(minPx / 2, r.height / 2);
    if (variant === 'circle') {
      const r0 = Math.min(rx, ry);
      node.radiusX(r0);
      node.radiusY(r0);
      node.offsetX(r0);
      node.offsetY(r0);
    } else {
      const rx2 = Math.max(minPx / 2, rx);
      const ry2 = Math.max(minPx / 2, ry);
      node.radiusX(rx2);
      node.radiusY(ry2);
      node.offsetX(rx2);
      node.offsetY(ry2);
    }
  } else {
    let w = Math.max(minPx, r.width);
    let h = Math.max(minPx, r.height);
    if (variant === 'strip' && h > w) {
      [w, h] = [h, w];
    } else if (variant === 'scratch' && w > h) {
      [w, h] = [h, w];
    }
    node.width(w);
    node.height(h);
    node.scaleX(1);
    node.scaleY(1);
    node.offsetX(w / 2);
    node.offsetY(h / 2);
  }

  meta.shapeVariant = variant;
  if (useMmMode && imageNode) applyBounds(node);
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
  if (useMmMode && partBounds) {
    centerX = partBounds.x + partBounds.width / 2;
    centerY = partBounds.y + partBounds.height / 2;
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
    const rx = radiusX || 15;
    const ry = radiusY || 15;
    shape = new Konva.Ellipse({
      x: centerX,
      y: centerY,
      radiusX: rx,
      radiusY: ry,
      offsetX: rx,
      offsetY: ry,
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

  const wMm = type === 'circle' ? (shape.radiusX?.() ?? 0) * 2 / (pxPerMm || 1) : (shape.width?.() ?? 0) / (pxPerMm || 1);
  const hMm = type === 'circle' ? (shape.radiusY?.() ?? 0) * 2 / (pxPerMm || 1) : (shape.height?.() ?? 0) / (pxPerMm || 1);
  const shapeVariant = inferShapeVariant(type, wMm, hMm);
  shape._dentMeta = { id, type, sizes, shapeVariant };

  if (useMmMode && partBounds) {
    const r = getShapeRectLocal(shape);
    let dx = 0, dy = 0;
    if (r.x < partBounds.x) dx = partBounds.x - r.x;
    else if (r.x + r.width > partBounds.x + partBounds.width) dx = partBounds.x + partBounds.width - (r.x + r.width);
    if (r.y < partBounds.y) dy = partBounds.y - r.y;
    else if (r.y + r.height > partBounds.y + partBounds.height) dy = partBounds.y + partBounds.height - (r.y + r.height);
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
  /** Сохраняем последнее корректное состояние (scale всегда положительный). */
  const storeLastGoodTransform = () => {
    const sx = Math.max(MIN_SCALE, Math.abs(shape.scaleX()));
    const sy = Math.max(MIN_SCALE, Math.abs(shape.scaleY()));
    const attrs = {
      x: shape.x(),
      y: shape.y(),
      scaleX: sx,
      scaleY: sy,
      rotation: shape.rotation ? shape.rotation() : 0
    };
    if (shape.className === 'Ellipse') {
      const rx = Math.abs(shape.radiusX());
      const ry = Math.abs(shape.radiusY());
      attrs.radiusX = rx;
      attrs.radiusY = ry;
      attrs.offsetX = rx;
      attrs.offsetY = ry;
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

  shape.on('mousedown touchstart', (e) => {
    e.cancelBubble = true;
    if (contentGroup) contentGroup.draggable(false);
  });
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
    updateHandler();
    const layer = layerDents.getLayer ? layerDents.getLayer() : layerDents;
    if (layer) layer.batchDraw();
  });
  shape.on('transform', updateHandler);
  shape.on('transformstart', () => {
    if (contentGroup) contentGroup.draggable(false);
  });
  shape.on('transformend', () => {
    if (useMmMode && partBounds) {
      const r = getShapeRectLocal(shape);
      let dx = 0, dy = 0;
      if (r.x < partBounds.x) dx = partBounds.x - r.x;
      else if (r.x + r.width > partBounds.x + partBounds.width) dx = partBounds.x + partBounds.width - (r.x + r.width);
      if (r.y < partBounds.y) dy = partBounds.y - r.y;
      else if (r.y + r.height > partBounds.y + partBounds.height) dy = partBounds.y + partBounds.height - (r.y + r.height);
      if (dx !== 0 || dy !== 0) shape.position({ x: shape.x() + dx, y: shape.y() + dy });
    }
    // Нормализация размеров: всегда положительные, scale сбрасывается в 1
    if (shape.className === 'Rect') {
      const newW = Math.max(MIN_TRANSFORM_SIZE_PX, Math.abs(shape.width() * shape.scaleX()));
      const newH = Math.max(MIN_TRANSFORM_SIZE_PX, Math.abs(shape.height() * shape.scaleY()));
      shape.width(newW);
      shape.height(newH);
      shape.scaleX(1);
      shape.scaleY(1);
      shape.offsetX(newW / 2);
      shape.offsetY(newH / 2);
    }
    if (shape.className === 'Ellipse') {
      let newRx = Math.abs(shape.radiusX() * shape.scaleX());
      let newRy = Math.abs(shape.radiusY() * shape.scaleY());
      if (useMmMode && pxPerMm != null && pxPerMm > 0) {
        const maxR = (SIZE_MM_MAX / 2) * pxPerMm;
        newRx = Math.min(newRx, maxR);
        newRy = Math.min(newRy, maxR);
      }
      newRx = Math.max(MIN_TRANSFORM_SIZE_PX / 2, newRx);
      newRy = Math.max(MIN_TRANSFORM_SIZE_PX / 2, newRy);
      shape.radiusX(newRx);
      shape.radiusY(newRy);
      shape.offsetX(newRx);
      shape.offsetY(newRy);
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
        // Гарантируем положительный scale после трансформа
        const sx = Math.max(MIN_SCALE, Math.abs(shape.scaleX()));
        const sy = Math.max(MIN_SCALE, Math.abs(shape.scaleY()));
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
  /** На этапах 1–2: форма draggable (и за вмятину, и за крестик). */
  shape.draggable(wizardStep <= 2);
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

export function deleteSelected() {
  const node = getActiveNode();
  if (!node || !node._dentMeta) return;
  dentsMap.delete(node._dentMeta.id);
  tr.nodes([]);
  if (useMmMode) {
    activeDent = null;
    if (handleGroup) handleGroup.visible(false);
  }
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
        rotateEnabled: true,
        keepRatio: transformerKeepRatio,
        /** Запрет инверсии (отрицательного scale) и минимальный размер при ресайзе. */
        boundBoxFunc: (oldBox, newBox) => {
          if (newBox.width < MIN_TRANSFORM_SIZE_PX || newBox.height < MIN_TRANSFORM_SIZE_PX) return oldBox;
          if (newBox.width < 0 || newBox.height < 0) return oldBox;
          return newBox;
        }
      });
      tr.on('mousedown touchstart', () => {
        if (contentGroup) contentGroup.draggable(false);
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
  if (resizeObserverRef && resizeObservedEl) {
    resizeObserverRef.unobserve(resizeObservedEl);
    resizeObserverRef = null;
    resizeObservedEl = null;
  }
  if (windowResizeHandler) {
    window.removeEventListener('resize', windowResizeHandler);
    windowResizeHandler = null;
  }
  if (stage) {
    stage.destroy();
    stage = null;
  }
  containerRef = null;
  baseScale = 1;
  basePos = { x: 0, y: 0 };
  fitPending = false;
  lastFitW = 0;
  lastFitH = 0;
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
  gridRectRef = null;
  useMmMode = false;
  baseUrl = '';
  contentGroup = null;
  contentWidth = 0;
  contentHeight = 0;
  heatZonesPx = [];
  bgRect = null;
  handleGroup = null;
  activeDent = null;
  transformerKeepRatio = true;
  hideGridOnMobile = false;
}
