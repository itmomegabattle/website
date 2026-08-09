import { useEffect, useRef } from "react";
import "../styles/background.css";

/* =========================================================
   SETTINGS
   ========================================================= */

const MAX_FPS = 60;
const FRAME_INTERVAL = 1000 / MAX_FPS;

const AUTONOMOUS_SPEED = 0.13;
const HOVER_SPEED = AUTONOMOUS_SPEED;

/*
 * На одной и той же линии — максимум один НОВЫЙ
 * hover-светлячок раз в 3 секунды.
 *
 * Первый hover при этом запускается сразу.
 */
const HOVER_LINE_COOLDOWN_MS = 3000;

/*
 * Только визуальное проявление.
 * На сам момент запуска не влияет.
 */
const HOVER_FADE_IN_SECONDS = 0.38;

const PULSE_HALF_SPAN = 0.078;

/*
 * Широкая зона мягкого влияния курсора.
 * Само смещение при этом маленькое.
 */
const INTERACTION_RADIUS_RATIO = 0.19;

/*
 * Зона, в которой именно запускается hover-светлячок.
 */
const PULSE_HIT_RADIUS_RATIO = 0.085;
const MIN_HOVER_HIT_RADIUS = 70;

/*
 * Очень мягкая реакция линии.
 */
const TOUCH_AMPLITUDE = 6.5;
const TOUCH_WAVE_AMPLITUDE = 1.8;

/*
 * Позиция визуальной деформации достаточно быстро догоняет мышь,
 * но линия меняется плавно из-за маленькой амплитуды и smoothstep.
 */
const CURSOR_FOLLOW = 13;
const TOUCH_FOLLOW = 9;


/* =========================================================
   HELPERS
   ========================================================= */

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function smoothstep(value) {
  const x = clamp(value, 0, 1);
  return x * x * (3 - 2 * x);
}

function seededRandom(seed) {
  let value = seed >>> 0;

  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}


/* =========================================================
   NETWORK
   ========================================================= */

function buildNetwork(width, height) {
  const random = seededRandom(0x0069e0);

  const paths = [];
  let nextPathId = 0;

  const margin = Math.min(width, height) * 0.09;

  const roots = [
    {
      x: -margin,
      y: height * 0.2,
      angle: 0.045,
      branchAt: 0.24,
      branchDirection: -1,
    },
    {
      x: -margin,
      y: height * 0.5,
      angle: 0,
      branchAt: 0.48,
      branchDirection: 1,
    },
    {
      x: -margin,
      y: height * 0.8,
      angle: -0.045,
      branchAt: 0.7,
      branchDirection: 1,
    },
  ];

  const isOutside = (point) => (
    point.x > width + margin
    || point.y < -margin
    || point.y > height + margin
  );

  const grow = (
    origin,
    initialAngle,
    branchAt = null,
    branchDirection = 1,
    family = 0,
    parentId = null,
    parentJoinIndex = null,
  ) => {
    if (paths.length >= 8) {
      return null;
    }

    const path = {
      id: nextPathId++,
      points: [
        {
          x: origin.x,
          y: origin.y,
        },
      ],
      family,
      phase: random(),
      parentId,
      parentJoinIndex,
      parentJoinProgress: null,
      children: [],
    };

    paths.push(path);

    let point = {
      x: origin.x,
      y: origin.y,
    };

    let angle = initialAngle;
    let step = 0;
    let hasBranched = false;

    while (!isOutside(point) && step < 64) {
      const length = (
        Math.min(width, height)
        * (0.047 + random() * 0.019)
      );

      angle += (random() - 0.5) * 0.064;
      angle *= 0.988;
      angle = clamp(angle, -0.65, 0.65);

      point = {
        x: point.x + Math.cos(angle) * length,
        y: point.y + Math.sin(angle) * length,
      };

      path.points.push(point);

      const progress = point.x / width;

      if (
        branchAt != null
        && !hasBranched
        && progress >= branchAt
        && paths.length < 8
      ) {
        const joinIndex = path.points.length - 1;

        const child = grow(
          point,
          angle + branchDirection * (0.23 + random() * 0.085),
          null,
          1,
          family,
          path.id,
          joinIndex,
        );

        if (child) {
          path.children.push({
            pathId: child.id,
            joinIndex,
            joinProgress: 0,
          });
        }

        hasBranched = true;
      }

      step += 1;
    }

    return path;
  };

  roots.forEach((root, family) => {
    grow(
      root,
      root.angle,
      root.branchAt,
      root.branchDirection,
      family,
    );
  });

  const pathMap = new Map(
    paths.map((path) => [path.id, path]),
  );

  paths.forEach((path) => {
    if (path.parentId != null) {
      const parent = pathMap.get(path.parentId);

      if (parent) {
        path.parentJoinProgress = (
          path.parentJoinIndex
          / Math.max(1, parent.points.length - 1)
        );
      }
    }

    path.children = path.children.map((child) => ({
      ...child,
      joinProgress: (
        child.joinIndex
        / Math.max(1, path.points.length - 1)
      ),
    }));
  });

  return paths;
}


/* =========================================================
   CURSOR INTERACTION
   ========================================================= */

function getRenderedPoints(
  path,
  pointer,
  width,
  height,
  time,
) {
  const cursorX = pointer.visualX * width;
  const cursorY = pointer.visualY * height;

  const radius = (
    Math.min(width, height)
    * INTERACTION_RADIUS_RATIO
  );

  return path.points.map((point, index) => {
    const previous = path.points[
      Math.max(0, index - 1)
    ];

    const next = path.points[
      Math.min(path.points.length - 1, index + 1)
    ];

    const tx = next.x - previous.x;
    const ty = next.y - previous.y;

    const tangentLength = Math.hypot(tx, ty) || 1;

    const normalX = -ty / tangentLength;
    const normalY = tx / tangentLength;

    const toCursorX = cursorX - point.x;
    const toCursorY = cursorY - point.y;

    const distance = Math.hypot(
      toCursorX,
      toCursorY,
    );

    if (
      distance >= radius
      || pointer.touch < 0.001
    ) {
      return point;
    }

    /*
     * Сила нарастает очень плавно по расстоянию.
     * Нет резкого on/off около линии.
     */
    const proximity = smoothstep(
      1 - distance / radius,
    );

    /*
     * В отличие от sign(), это значение непрерывно меняется
     * при пересечении курсором самой линии.
     */
    const signedNormalDistance = (
      toCursorX * normalX
      + toCursorY * normalY
    );

    const sideInfluence = clamp(
      signedNormalDistance / (radius * 0.4),
      -1,
      1,
    );

    const touchShift = (
      sideInfluence
      * TOUCH_AMPLITUDE
      * proximity
      * pointer.touch
    );

    const waveShift = (
      Math.sin(
        time * 1.15
        + point.x * 0.004
        + path.id * 0.75
      )
      * TOUCH_WAVE_AMPLITUDE
      * proximity
      * pointer.touch
    );

    const displacement = touchShift + waveShift;

    return {
      x: point.x + normalX * displacement,
      y: point.y + normalY * displacement,
    };
  });
}


/* =========================================================
   SPLINE
   ========================================================= */

function traceSpline(context, points) {
  if (points.length < 2) {
    return;
  }

  context.moveTo(
    points[0].x,
    points[0].y,
  );

  for (
    let index = 0;
    index < points.length - 1;
    index += 1
  ) {
    const p0 = points[
      Math.max(0, index - 1)
    ];

    const p1 = points[index];
    const p2 = points[index + 1];

    const p3 = points[
      Math.min(points.length - 1, index + 2)
    ];

    context.bezierCurveTo(
      p1.x + (p2.x - p0.x) / 6,
      p1.y + (p2.y - p0.y) / 6,

      p2.x - (p3.x - p1.x) / 6,
      p2.y - (p3.y - p1.y) / 6,

      p2.x,
      p2.y,
    );
  }
}


/* =========================================================
   POINT ON SPLINE
   ========================================================= */

function pointOnSpline(points, progress) {
  const safeProgress = clamp(
    progress,
    0,
    0.9999,
  );

  const scaled = (
    safeProgress
    * (points.length - 1)
  );

  const index = Math.floor(scaled);
  const t = scaled - index;

  const p0 = points[
    Math.max(0, index - 1)
  ];

  const p1 = points[index];

  const p2 = points[
    Math.min(points.length - 1, index + 1)
  ];

  const p3 = points[
    Math.min(points.length - 1, index + 2)
  ];

  const t2 = t * t;
  const t3 = t2 * t;

  return {
    x: 0.5 * (
      2 * p1.x
      + (-p0.x + p2.x) * t
      + (
        2 * p0.x
        - 5 * p1.x
        + 4 * p2.x
        - p3.x
      ) * t2
      + (
        -p0.x
        + 3 * p1.x
        - 3 * p2.x
        + p3.x
      ) * t3
    ),

    y: 0.5 * (
      2 * p1.y
      + (-p0.y + p2.y) * t
      + (
        2 * p0.y
        - 5 * p1.y
        + 4 * p2.y
        - p3.y
      ) * t2
      + (
        -p0.y
        + 3 * p1.y
        - 3 * p2.y
        + p3.y
      ) * t3
    ),
  };
}


/* =========================================================
   PULSE DRAWING
   ========================================================= */

function makePulsePath(
  points,
  start,
  end,
) {
  const result = new Path2D();

  const samples = 26;

  for (
    let index = 0;
    index <= samples;
    index += 1
  ) {
    const progress = (
      start
      + (end - start)
      * (index / samples)
    );

    const point = pointOnSpline(
      points,
      progress,
    );

    if (index === 0) {
      result.moveTo(
        point.x,
        point.y,
      );
    } else {
      result.lineTo(
        point.x,
        point.y,
      );
    }
  }

  return result;
}


function createPulseGradient(
  context,
  from,
  to,
  isLight,
  strength,
  core,
) {
  const gradient = context.createLinearGradient(
    from.x,
    from.y,
    to.x,
    to.y,
  );

  if (core) {
    gradient.addColorStop(
      0,
      "rgba(255,255,255,0)",
    );

    gradient.addColorStop(
      0.22,
      `rgba(220,238,255,${0.18 * strength})`,
    );

    gradient.addColorStop(
      0.5,
      `rgba(255,255,255,${0.9 * strength})`,
    );

    gradient.addColorStop(
      0.78,
      `rgba(220,238,255,${0.18 * strength})`,
    );

    gradient.addColorStop(
      1,
      "rgba(255,255,255,0)",
    );

    return gradient;
  }

  const alpha = isLight
    ? 0.72
    : 0.9;

  gradient.addColorStop(
    0,
    "rgba(0,105,224,0)",
  );

  gradient.addColorStop(
    0.18,
    `rgba(0,105,224,${0.16 * strength})`,
  );

  gradient.addColorStop(
    0.5,
    `rgba(0,105,224,${alpha * strength})`,
  );

  gradient.addColorStop(
    0.82,
    `rgba(0,105,224,${0.16 * strength})`,
  );

  gradient.addColorStop(
    1,
    "rgba(0,105,224,0)",
  );

  return gradient;
}


function drawPulse(
  context,
  points,
  progress,
  isLight,
  strength = 1,
) {
  const start = Math.max(
    0,
    progress - PULSE_HALF_SPAN,
  );

  const end = Math.min(
    1,
    progress + PULSE_HALF_SPAN,
  );

  if (
    end - start < 0.003
  ) {
    return;
  }

  const from = pointOnSpline(
    points,
    start,
  );

  const to = pointOnSpline(
    points,
    end,
  );

  const pulsePath = makePulsePath(
    points,
    start,
    end,
  );

  context.save();

  context.lineCap = "round";
  context.lineJoin = "round";

  context.globalCompositeOperation = (
    isLight
      ? "source-over"
      : "screen"
  );

  /*
   * Свет — это именно более светлая часть самой линии,
   * без отдельного светящегося шарика.
   */
  context.lineWidth = 10;

  context.strokeStyle = createPulseGradient(
    context,
    from,
    to,
    isLight,
    strength,
    false,
  );

  context.stroke(pulsePath);

  context.lineWidth = 2.25;

  context.strokeStyle = createPulseGradient(
    context,
    from,
    to,
    isLight,
    strength,
    true,
  );

  context.stroke(pulsePath);

  context.restore();
}



/*
 * Непрерывный световой сегмент через развилку:
 * хвост остаётся на старой линии, голова уже идёт по новой.
 */
function makeJunctionPulsePath(
  fromPoints,
  fromProgress,
  fromDirection,
  toPoints,
  toProgress,
  toDirection,
  travel,
) {
  const path = new Path2D();

  const tailLength = Math.max(
    0,
    PULSE_HALF_SPAN - travel,
  );

  const headLength = (
    PULSE_HALF_SPAN + travel
  );

  const fromStart = clamp(
    fromProgress
      - fromDirection * tailLength,
    0,
    0.9999,
  );

  const toEnd = clamp(
    toProgress
      + toDirection * headLength,
    0,
    0.9999,
  );

  const oldSamples = 14;
  const newSamples = 14;

  for (
    let index = 0;
    index <= oldSamples;
    index += 1
  ) {
    const t = index / oldSamples;

    const progress = (
      fromStart
      + (fromProgress - fromStart) * t
    );

    const point = pointOnSpline(
      fromPoints,
      progress,
    );

    if (index === 0) {
      path.moveTo(
        point.x,
        point.y,
      );
    } else {
      path.lineTo(
        point.x,
        point.y,
      );
    }
  }

  for (
    let index = 1;
    index <= newSamples;
    index += 1
  ) {
    const t = index / newSamples;

    const progress = (
      toProgress
      + (toEnd - toProgress) * t
    );

    const point = pointOnSpline(
      toPoints,
      progress,
    );

    path.lineTo(
      point.x,
      point.y,
    );
  }

  return {
    path,

    startPoint: pointOnSpline(
      fromPoints,
      fromStart,
    ),

    endPoint: pointOnSpline(
      toPoints,
      toEnd,
    ),
  };
}


function drawJunctionPulse(
  context,
  frameMap,
  pulse,
  isLight,
  strength,
) {
  const bridge = pulse.junctionBridge;

  if (
    !bridge
    || pulse.pathId !== bridge.toPathId
  ) {
    return false;
  }

  const fromRendered = frameMap.get(
    bridge.fromPathId,
  );

  const toRendered = frameMap.get(
    bridge.toPathId,
  );

  if (
    !fromRendered
    || !toRendered
  ) {
    return false;
  }

  const travel = Math.abs(
    pulse.progress
      - bridge.toProgress,
  );

  if (
    travel >= PULSE_HALF_SPAN
  ) {
    return false;
  }

  const junctionPulse = (
    makeJunctionPulsePath(
      fromRendered.points,
      bridge.fromProgress,
      bridge.fromDirection,

      toRendered.points,
      bridge.toProgress,
      bridge.toDirection,

      travel,
    )
  );

  context.save();

  context.lineCap = "round";
  context.lineJoin = "round";

  context.globalCompositeOperation = (
    isLight
      ? "source-over"
      : "screen"
  );

  context.lineWidth = 10;

  context.strokeStyle = (
    createPulseGradient(
      context,
      junctionPulse.startPoint,
      junctionPulse.endPoint,
      isLight,
      strength,
      false,
    )
  );

  context.stroke(
    junctionPulse.path,
  );

  context.lineWidth = 2.25;

  context.strokeStyle = (
    createPulseGradient(
      context,
      junctionPulse.startPoint,
      junctionPulse.endPoint,
      isLight,
      strength,
      true,
    )
  );

  context.stroke(
    junctionPulse.path,
  );

  context.restore();

  return true;
}


function drawPulseState(
  context,
  frameMap,
  pulse,
  isLight,
  strength,
) {
  if (
    drawJunctionPulse(
      context,
      frameMap,
      pulse,
      isLight,
      strength,
    )
  ) {
    return;
  }

  const rendered = frameMap.get(
    pulse.pathId,
  );

  if (!rendered) {
    return;
  }

  drawPulse(
    context,
    rendered.points,
    pulse.progress,
    isLight,
    strength,
  );
}


/* =========================================================
   HIT TEST
   ========================================================= */

function nearestProgress(
  path,
  pointer,
  width,
  height,
) {
  const cursorX = pointer.rawX * width;
  const cursorY = pointer.rawY * height;

  const samples = 64;

  let nearest = {
    distance: Infinity,
    progress: 0,
  };

  for (
    let index = 0;
    index <= samples;
    index += 1
  ) {
    const progress = (
      index / samples
    );

    const point = pointOnSpline(
      path.points,
      progress,
    );

    const distance = Math.hypot(
      point.x - cursorX,
      point.y - cursorY,
    );

    if (
      distance < nearest.distance
    ) {
      nearest = {
        distance,
        progress,
      };
    }
  }

  return nearest;
}


function findNearestPath(
  paths,
  pointer,
  width,
  height,
) {
  return paths.reduce(
    (best, path) => {
      const candidate = nearestProgress(
        path,
        pointer,
        width,
        height,
      );

      if (
        candidate.distance < best.distance
      ) {
        return {
          ...candidate,
          path,
        };
      }

      return best;
    },
    {
      distance: Infinity,
      progress: 0,
      path: null,
    },
  );
}


function getHoverHitRadius(
  width,
  height,
) {
  return Math.max(
    MIN_HOVER_HIT_RADIUS,
    Math.min(width, height)
      * PULSE_HIT_RADIUS_RATIO,
  );
}


/* =========================================================
   NETWORK PULSE MOVEMENT
   ========================================================= */

function chooseHoverDirection(
  path,
  progress,
) {
  const junctions = [];

  path.children.forEach((child) => {
    junctions.push(
      child.joinProgress,
    );
  });

  if (
    path.parentId != null
  ) {
    junctions.push(0);
  }

  if (!junctions.length) {
    return (
      progress < 0.55
        ? 1
        : -1
    );
  }

  let nearestJunction = junctions[0];

  let nearestDistance = Math.abs(
    progress - nearestJunction,
  );

  junctions.forEach((junction) => {
    const distance = Math.abs(
      progress - junction,
    );

    if (
      distance < nearestDistance
    ) {
      nearestDistance = distance;
      nearestJunction = junction;
    }
  });

  return (
    nearestJunction >= progress
      ? 1
      : -1
  );
}


function pathDirection(
  path,
  progress,
  direction,
) {
  const epsilon = 0.01;

  const a = pointOnSpline(
    path.points,
    Math.max(
      0,
      progress - epsilon,
    ),
  );

  const b = pointOnSpline(
    path.points,
    Math.min(
      0.9999,
      progress + epsilon,
    ),
  );

  let x = b.x - a.x;
  let y = b.y - a.y;

  const length = Math.hypot(
    x,
    y,
  ) || 1;

  x /= length;
  y /= length;

  return {
    x: x * direction,
    y: y * direction,
  };
}


function getJunctionKey(parentPathId, childPathId) {
  return `${parentPathId}:${childPathId}`;
}


function clonePulse(pulse) {
  return {
    ...pulse,

    visitedJunctions: new Set(
      pulse.visitedJunctions || [],
    ),

    junctionBridge: pulse.junctionBridge
      ? { ...pulse.junctionBridge }
      : null,
  };
}


/*
 * Движение одного pulse по сети.
 *
 * Главное отличие от старой версии:
 * при развилке исходный pulse НЕ перескакивает на child.
 * Он продолжает идти по текущей линии, а его копия
 * одновременно уходит по дочерней ветке.
 */
function advancePulse(
  pulse,
  delta,
  pathMap,
) {
  let movement = (
    delta * pulse.speed
  );

  const spawned = [];

  let guard = 0;

  while (
    movement > 0
    && guard < 8
  ) {
    guard += 1;

    const path = pathMap.get(
      pulse.pathId,
    );

    if (!path) {
      return {
        alive: false,
        spawned,
      };
    }

    const start = pulse.progress;

    const target = (
      start
      + movement
      * pulse.direction
    );


    /* =====================================================
       PARENT -> CHILD

       На развилке создаём второй огонёк:
       - текущий остаётся на parent;
       - копия идёт в child.
       ===================================================== */

    const upcomingChildren = (
      path.children
        .filter((child) => {
          const junctionKey = (
            getJunctionKey(
              path.id,
              child.pathId,
            )
          );

          if (
            pulse.visitedJunctions?.has(
              junctionKey,
            )
          ) {
            return false;
          }

          const join = child.joinProgress;

          if (
            Math.abs(
              join - start,
            ) < 0.008
          ) {
            return true;
          }

          if (
            pulse.direction > 0
          ) {
            return (
              join > start
              && join <= target
            );
          }

          return (
            join < start
            && join >= target
          );
        })
        .sort((a, b) => (
          pulse.direction > 0
            ? (
              a.joinProgress
              - b.joinProgress
            )
            : (
              b.joinProgress
              - a.joinProgress
            )
        ))
    );

    if (
      upcomingChildren.length
    ) {
      const junction = (
        upcomingChildren[0]
      );

      const junctionKey = (
        getJunctionKey(
          path.id,
          junction.pathId,
        )
      );

      const usedMovement = Math.abs(
        junction.joinProgress
        - start,
      );

      const remainingMovement = (
        Math.max(
          0,
          movement - usedMovement,
        )
      );

      if (!pulse.visitedJunctions) {
        pulse.visitedJunctions = (
          new Set()
        );
      }

      pulse.visitedJunctions.add(
        junctionKey,
      );

      const branchPulse = clonePulse(
        pulse,
      );

      branchPulse.pathId = (
        junction.pathId
      );

      branchPulse.progress = 0;
      branchPulse.direction = 1;

      branchPulse.junctionBridge = {
        fromPathId: path.id,

        fromProgress:
          junction.joinProgress,

        fromDirection:
          pulse.direction,

        toPathId:
          junction.pathId,

        toProgress: 0,
        toDirection: 1,
      };

      spawned.push(
        branchPulse,
      );

      /*
       * Исходный огонёк остаётся на основной линии.
       */
      pulse.progress = (
        junction.joinProgress
      );

      pulse.junctionBridge = null;

      movement = remainingMovement;

      continue;
    }


    /* =====================================================
       CHILD -> PARENT

       Если огонёк возвращается к родительской линии,
       в junction он расходится по обеим сторонам parent.
       ===================================================== */

    if (
      pulse.direction < 0
      && target <= 0
      && path.parentId != null
    ) {
      const parent = pathMap.get(
        path.parentId,
      );

      if (parent) {
        const remainingMovement = (
          Math.max(
            0,
            movement - start,
          )
        );

        const parentProgress = (
          path.parentJoinProgress
        );

        const junctionKey = (
          getJunctionKey(
            parent.id,
            path.id,
          )
        );

        if (!pulse.visitedJunctions) {
          pulse.visitedJunctions = (
            new Set()
          );
        }

        pulse.visitedJunctions.add(
          junctionKey,
        );

        const incoming = pathDirection(
          path,
          0,
          -1,
        );

        const forward = pathDirection(
          parent,
          parentProgress,
          1,
        );

        const backward = pathDirection(
          parent,
          parentProgress,
          -1,
        );

        const forwardScore = (
          incoming.x * forward.x
          + incoming.y * forward.y
        );

        const backwardScore = (
          incoming.x * backward.x
          + incoming.y * backward.y
        );

        const primaryDirection = (
          forwardScore >= backwardScore
            ? 1
            : -1
        );

        const secondaryDirection = (
          -primaryDirection
        );

        const childPathId = (
          pulse.pathId
        );

        pulse.pathId = parent.id;
        pulse.progress = parentProgress;

        pulse.direction = (
          primaryDirection
        );

        pulse.junctionBridge = {
          fromPathId: childPathId,
          fromProgress: 0,
          fromDirection: -1,

          toPathId: parent.id,
          toProgress: parentProgress,

          toDirection:
            primaryDirection,
        };

        const secondParentPulse = (
          clonePulse(
            pulse,
          )
        );

        secondParentPulse.direction = (
          secondaryDirection
        );

        secondParentPulse.junctionBridge = {
          fromPathId: childPathId,
          fromProgress: 0,
          fromDirection: -1,

          toPathId: parent.id,
          toProgress: parentProgress,

          toDirection:
            secondaryDirection,
        };

        spawned.push(
          secondParentPulse,
        );

        movement = remainingMovement;

        continue;
      }
    }


    /* =====================================================
       Обычное движение без junction.
       ===================================================== */

    pulse.progress = target;
    movement = 0;
  }


  /* =======================================================
     Убираем bridge после полного выхода из junction.
     ======================================================= */

  if (
    pulse.junctionBridge
    && pulse.pathId
      === pulse.junctionBridge.toPathId
    && Math.abs(
      pulse.progress
      - pulse.junctionBridge.toProgress,
    ) >= PULSE_HALF_SPAN
  ) {
    pulse.junctionBridge = null;
  }


  /* =======================================================
     Конец линии.
     ======================================================= */

  if (
    pulse.direction > 0
    && pulse.progress
      > (
        1
        + PULSE_HALF_SPAN * 1.3
      )
  ) {
    return {
      alive: false,
      spawned,
    };
  }

  if (
    pulse.direction < 0
    && pulse.progress
      < (
        -PULSE_HALF_SPAN * 1.3
      )
  ) {
    return {
      alive: false,
      spawned,
    };
  }

  return {
    alive: true,
    spawned,
  };
}


/*
 * Обновляет группу огоньков одной волны.
 * После развилки в массиве одновременно живут
 * основной pulse и pulse дочерней ветки.
 */
function advancePulseGroup(
  pulses,
  delta,
  pathMap,
) {
  const next = [];

  pulses.forEach((pulse) => {
    const result = advancePulse(
      pulse,
      delta,
      pathMap,
    );

    if (result.alive) {
      next.push(
        pulse,
      );
    }

    result.spawned.forEach(
      (newPulse) => {
        next.push(
          newPulse,
        );
      },
    );
  });

  /*
   * Защита от бесконтрольного роста массива,
   * если сеть позже станет намного сложнее.
   */
  return next.slice(
    0,
    12,
  );
}


/* =========================================================
   COMPONENT
   ========================================================= */

export default function Background() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    const context = canvas?.getContext(
      "2d",
      {
        alpha: false,
        desynchronized: true,
      },
    );

    if (
      !canvas
      || !context
    ) {
      return undefined;
    }

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    const random = seededRandom(
      0x19450069,
    );

    const pointer = {
      /*
       * raw = мгновенный hover hit-test.
       */
      rawX: 0.5,
      rawY: 0.5,

      /*
       * visual = только мягкая деформация.
       */
      visualX: 0.5,
      visualY: 0.5,

      touch: 0,
      inside: false,
    };

    let width = 1;
    let height = 1;
    let dpr = 1;

    let paths = [];
    let pathMap = new Map();

    let frameId = 0;
    let lastFrame = 0;
    let lastPaintTime = 0;

    let animationTime = 0;

    let autonomousTracks = [];

    /*
     * Hover теперь хранится как группа.
     * До развилки здесь один pulse, после — два и больше.
     */
    let hoverPulses = [];

    /*
     * Последняя ближайшая к курсору точка линии.
     */
    let hoverHit = null;

    /*
     * Оставляем прежний быстрый принцип hover.
     */
    let hoverWasOverLine = false;
    let lastHoverLaunchPathId = null;
    let lastHoverLaunchProgress = 0;

    /*
     * НОВОЕ:
     * cooldown хранится отдельно для каждой линии.
     *
     * Поэтому:
     * - первая реакция на линию мгновенная;
     * - другая линия тоже реагирует мгновенно;
     * - только повтор на той же линии ждёт 3 секунды.
     */
    const hoverLaunchByPath = new Map();


    /* =====================================================
       SIZES
       ===================================================== */

    const getInteractionRadius = () => (
      Math.max(
        90,
        Math.min(
          width,
          height,
        )
        * INTERACTION_RADIUS_RATIO,
      )
    );


    /* =====================================================
       AUTONOMOUS
       ===================================================== */

    const createTracks = () => [
      {
        family: 0,
        pulses: [],
        nextAt: 0.2,
      },
      {
        family: 1,
        pulses: [],
        nextAt: 1.1,
      },
      {
        family: 2,
        pulses: [],
        nextAt: 2,
      },
    ];



    const launchAutonomous = (
      track,
    ) => {
      const familyPaths = (
        paths.filter(
          (path) => (
            path.family
            === track.family
          ),
        )
      );

      if (
        !familyPaths.length
      ) {
        return;
      }

      const path = familyPaths[
        Math.floor(
          random()
          * familyPaths.length
        )
      ];

      const direction = (
        random() > 0.5
          ? 1
          : -1
      );

      track.pulses = [
        {
          kind: "auto",
          pathId: path.id,

          progress: (
            direction > 0
              ? -PULSE_HALF_SPAN * 1.3
              : 1 + PULSE_HALF_SPAN * 1.3
          ),

          direction,

          speed: (
            AUTONOMOUS_SPEED
            * (
              0.9
              + random() * 0.22
            )
          ),

          strength: (
            0.86
            + random() * 0.1
          ),

          junctionBridge: null,
          visitedJunctions: new Set(),
        },
      ];
    };



    /* =====================================================
       HOVER PULSE
       ===================================================== */

    const launchHoverPulse = (
      hit,
      replaceCurrent = false,
    ) => {
      if (!hit?.path) {
        return;
      }

      if (
        hoverPulses.length
        && !replaceCurrent
      ) {
        return;
      }

      const progress = clamp(
        hit.progress,
        0.01,
        0.99,
      );

      const pulse = {
        kind: "hover",

        pathId: hit.path.id,
        progress,

        direction: chooseHoverDirection(
          hit.path,
          progress,
        ),

        speed: HOVER_SPEED,
        strength: 1.28,
        age: 0,

        junctionBridge: null,
        visitedJunctions: new Set(),
      };

      /*
       * Новое наведение заменяет предыдущую hover-волну,
       * но затем эта новая волна может раздвоиться сама.
       */
      hoverPulses = [
        pulse,
      ];

      lastHoverLaunchPathId = hit.path.id;
      lastHoverLaunchProgress = progress;

      hoverLaunchByPath.set(
        hit.path.id,
        performance.now(),
      );
    };



    /*
     * Здесь мы ТОЛЬКО определяем ближайшую линию.
     *
     * Запуск светлячка происходит отдельно в paint().
     * Благодаря этому он не зависит от того,
     * случился ли в нужный момент pointermove.
     */
    const updateHoverHit = () => {
      if (
        !pointer.inside
        || !paths.length
      ) {
        hoverHit = null;
        return;
      }

      const nearest = findNearestPath(
        paths,
        pointer,
        width,
        height,
      );

      const hitRadius = getHoverHitRadius(
        width,
        height,
      );

      if (
        nearest.path
        && nearest.distance <= hitRadius
      ) {
        hoverHit = nearest;
      } else {
        hoverHit = null;
      }
    };


    /* =====================================================
       RESIZE
       ===================================================== */

    const resize = () => {
      width = Math.max(
        1,
        window.innerWidth,
      );

      height = Math.max(
        1,
        window.innerHeight,
      );

      dpr = Math.min(
        window.devicePixelRatio || 1,
        1.75,
      );

      canvas.width = Math.round(
        width * dpr,
      );

      canvas.height = Math.round(
        height * dpr,
      );

      canvas.style.width = (
        `${width}px`
      );

      canvas.style.height = (
        `${height}px`
      );

      context.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0,
      );

      paths = buildNetwork(
        width,
        height,
      );

      pathMap = new Map(
        paths.map(
          (path) => [
            path.id,
            path,
          ],
        ),
      );

      autonomousTracks = (
        createTracks()
      );

      hoverPulses = [];
      hoverHit = null;

      hoverWasOverLine = false;
      lastHoverLaunchPathId = null;
      lastHoverLaunchProgress = 0;
      hoverLaunchByPath.clear();
    };


    /* =====================================================
       PAINT
       ===================================================== */

    const paint = (
      time = 0,
    ) => {
      const delta = (
        lastPaintTime
          ? Math.min(
              0.04,
              (
                time
                - lastPaintTime
              ) / 1000,
            )
          : 0
      );

      lastPaintTime = time;
      animationTime += delta;

      const isLight = (
        document.documentElement
          .dataset.theme === "light"
        || document.documentElement
          .classList.contains(
            "light",
          )
      );


      /*
       * Гарантированно обновляем hit-test каждый кадр.
       *
       * Даже если мышка перестала двигаться,
       * hover остаётся активным.
       */
      if (pointer.inside) {
        updateHoverHit();
      } else {
        hoverHit = null;
      }


      /*
       * Единственное новое ограничение для неподвижного курсора:
       * на этой же линии следующий свет запускается
       * только через 3 секунды после предыдущего.
       *
       * Если старый hover-pulse ещё едет, новый просто
       * заменит его в текущей точке курсора.
       */
      if (
        hoverHit?.path
      ) {
        const pathId = hoverHit.path.id;

        const lastLaunchOnThisPath = (
          hoverLaunchByPath.get(pathId)
          ?? -Infinity
        );

        if (
          performance.now()
          - lastLaunchOnThisPath
          >= HOVER_LINE_COOLDOWN_MS
        ) {
          launchHoverPulse(
            hoverHit,
            true,
          );
        }
      }


      /* ===================================================
         CURSOR RESPONSE
         =================================================== */

      const cursorEase = (
        1
        - Math.exp(
          -CURSOR_FOLLOW
          * delta,
        )
      );

      pointer.visualX += (
        pointer.rawX
        - pointer.visualX
      ) * cursorEase;

      pointer.visualY += (
        pointer.rawY
        - pointer.visualY
      ) * cursorEase;


      /*
       * Сила деформации не бинарная.
       * Чем ближе курсор к линии, тем мягче она оживает.
       */
      let targetTouch = 0;

      if (
        pointer.inside
        && hoverHit?.path
      ) {
        const interactionRadius = (
          getInteractionRadius()
        );

        targetTouch = smoothstep(
          1
          - hoverHit.distance
          / interactionRadius,
        );
      }

      const touchEase = (
        1
        - Math.exp(
          -TOUCH_FOLLOW
          * delta,
        )
      );

      pointer.touch += (
        targetTouch
        - pointer.touch
      ) * touchEase;


      /* ===================================================
         BACKGROUND
         =================================================== */

      const background = (
        context.createLinearGradient(
          0,
          0,
          width,
          height,
        )
      );

      if (isLight) {
        background.addColorStop(
          0,
          "#e9edf3",
        );

        background.addColorStop(
          0.55,
          "#f6f8fb",
        );

        background.addColorStop(
          1,
          "#e4eaf2",
        );
      } else {
        background.addColorStop(
          0,
          "#010204",
        );

        background.addColorStop(
          0.52,
          "#02050a",
        );

        background.addColorStop(
          1,
          "#000103",
        );
      }

      context.fillStyle = (
        background
      );

      context.fillRect(
        0,
        0,
        width,
        height,
      );

      context.lineCap = "round";
      context.lineJoin = "round";


      /* ===================================================
         GEOMETRY ONCE PER FRAME
         =================================================== */

      const framePaths = (
        paths.map(
          (path) => ({
            path,

            points: getRenderedPoints(
              path,
              pointer,
              width,
              height,
              animationTime,
            ),
          }),
        )
      );

      const frameMap = new Map(
        framePaths.map(
          (item) => [
            item.path.id,
            item,
          ],
        ),
      );


      /*
       * Убираем физический визуальный зазор на развилке.
       *
       * После cursor-warp parent и child раньше могли
       * получить немного разные координаты одного junction.
       * Теперь начало ветки всегда совпадает с parent.
       */
      framePaths.forEach(
        (item) => {
          const path = item.path;

          if (
            path.parentId == null
            || path.parentJoinIndex == null
            || !item.points.length
          ) {
            return;
          }

          const parentRendered = (
            frameMap.get(
              path.parentId,
            )
          );

          const parentJunction = (
            parentRendered?.points[
              path.parentJoinIndex
            ]
          );

          if (!parentJunction) {
            return;
          }

          const originalStart = (
            item.points[0]
          );

          const correctionX = (
            parentJunction.x
            - originalStart.x
          );

          const correctionY = (
            parentJunction.y
            - originalStart.y
          );

          /*
           * Не только первая точка, но и ближайшие к ней
           * слегка подтягиваются, чтобы не было излома.
           */
          const blendCount = Math.min(
            4,
            item.points.length,
          );

          for (
            let index = 0;
            index < blendCount;
            index += 1
          ) {
            const influence = (
              1
              - index
              / Math.max(
                  1,
                  blendCount - 1,
                )
            );

            item.points[index] = {
              x:
                item.points[index].x
                + correctionX
                * influence,

              y:
                item.points[index].y
                + correctionY
                * influence,
            };
          }

          item.points[0] = {
            x: parentJunction.x,
            y: parentJunction.y,
          };
        },
      );


      /* ===================================================
         SINGLE-COLOR LINE
         ===================================================

         Линия теперь рисуется ОДНИМ stroke:
         без тёмной подложки, без градиента по длине
         и без отдельного светлого highlight-слоя.

         Поэтому визуально это один цельный цвет.
         =================================================== */

      context.beginPath();

      framePaths.forEach(
        (item) => {
          traceSpline(
            context,
            item.points,
          );
        },
      );

      context.lineWidth = 6.15;

      context.strokeStyle = (
        isLight
          ? "rgba(0,91,194,.62)"
          : "rgba(0,105,224,.72)"
      );

      context.stroke();


      /* ===================================================
         AUTONOMOUS PULSES
         =================================================== */

      autonomousTracks.forEach(
        (track) => {
          if (!track.pulses.length) {
            if (
              animationTime
              >= track.nextAt
            ) {
              launchAutonomous(
                track,
              );
            }

            return;
          }

          track.pulses = (
            advancePulseGroup(
              track.pulses,
              delta,
              pathMap,
            )
          );

          track.pulses.forEach(
            (pulse) => {
              drawPulseState(
                context,
                frameMap,
                pulse,
                isLight,
                pulse.strength,
              );
            },
          );

          if (!track.pulses.length) {
            track.nextAt = (
              animationTime
              + 0.45
              + random() * 0.8
            );
          }
        },
      );


      /* ===================================================
         HOVER PULSES

         До junction это один огонёк.
         После junction группа содержит обе ветви.
         =================================================== */

      if (hoverPulses.length) {
        /*
         * Сначала рисуем текущие позиции,
         * чтобы первый кадр возникал прямо под курсором.
         */
        hoverPulses.forEach(
          (pulse) => {
            pulse.age += delta;

            const appear = smoothstep(
              pulse.age
              / HOVER_FADE_IN_SECONDS,
            );

            drawPulseState(
              context,
              frameMap,
              pulse,
              isLight,
              pulse.strength
              * appear,
            );
          },
        );

        /*
         * После отрисовки двигаем всю группу.
         * В junction advancePulseGroup добавляет
         * второй pulse вместо перескакивания первого.
         */
        hoverPulses = (
          advancePulseGroup(
            hoverPulses,
            delta,
            pathMap,
          )
        );
      }
    };


    /* =====================================================
       ANIMATION LOOP
       ===================================================== */

    const animate = (
      time,
    ) => {
      frameId = 0;

      if (
        document.hidden
      ) {
        return;
      }

      if (
        time - lastFrame
        >= FRAME_INTERVAL
      ) {
        paint(time);
        lastFrame = time;
      }

      if (
        !reducedMotion.matches
      ) {
        frameId = (
          window.requestAnimationFrame(
            animate,
          )
        );
      }
    };


    const start = () => {
      window.cancelAnimationFrame(
        frameId,
      );

      if (
        document.hidden
      ) {
        return;
      }

      lastPaintTime = 0;

      if (
        reducedMotion.matches
      ) {
        paint(
          performance.now(),
        );
      } else {
        frameId = (
          window.requestAnimationFrame(
            animate,
          )
        );
      }
    };


    /* =====================================================
       POINTER
       ===================================================== */

    const updatePointerPosition = (
      clientX,
      clientY,
    ) => {
      pointer.inside = true;

      pointer.rawX = clamp(
        clientX / width,
        0,
        1,
      );

      pointer.rawY = clamp(
        clientY / height,
        0,
        1,
      );

      /*
       * Как и в предыдущей рабочей версии:
       * hit-test происходит сразу в событии мыши.
       */
      updateHoverHit();

      const isOverLine = Boolean(
        hoverHit?.path
      );

      if (!isOverLine) {
        hoverWasOverLine = false;
        return;
      }

      const now = performance.now();
      const pathId = hoverHit.path.id;

      const enteredLine = (
        !hoverWasOverLine
      );

      const changedPath = (
        lastHoverLaunchPathId
        !== pathId
      );

      const movedAlongPath = (
        lastHoverLaunchPathId === pathId
        && Math.abs(
          hoverHit.progress
          - lastHoverLaunchProgress
        ) >= 0.055
      );

      const lastLaunchOnThisPath = (
        hoverLaunchByPath.get(pathId)
        ?? -Infinity
      );

      const sameLineCooldownPassed = (
        now - lastLaunchOnThisPath
        >= HOVER_LINE_COOLDOWN_MS
      );

      /*
       * ВАЖНО:
       *
       * 1. Если это другая линия — запуск сразу.
       * 2. Если это первая встреча с этой линией — запуск сразу.
       * 3. Если это та же линия — максимум один раз в 3 секунды.
       *
       * Никаких ожиданий завершения старого светлячка.
       */
      const canLaunchHere = (
        changedPath
        || sameLineCooldownPassed
      );

      if (
        canLaunchHere
        && (
          enteredLine
          || changedPath
          || movedAlongPath
        )
      ) {
        launchHoverPulse(
          hoverHit,
          true,
        );
      }

      hoverWasOverLine = true;
    };


    const handlePointerMove = (
      event,
    ) => {
      if (
        event.pointerType === "touch"
      ) {
        return;
      }

      updatePointerPosition(
        event.clientX,
        event.clientY,
      );
    };


    /*
     * mousemove оставлен как дополнительный fallback.
     * На обычной мыши оба события могут приходить,
     * но это безопасно: здесь ничего не создаётся,
     * только обновляются координаты.
     */
    const handleMouseMove = (
      event,
    ) => {
      updatePointerPosition(
        event.clientX,
        event.clientY,
      );
    };


    const handlePointerLeave = () => {
      pointer.inside = false;
      hoverHit = null;
      hoverWasOverLine = false;
    };


    const handleResize = () => {
      resize();

      paint(
        performance.now(),
      );
    };


    const themeObserver = (
      new MutationObserver(
        () => {
          paint(
            performance.now(),
          );
        },
      )
    );


    /* =====================================================
       START
       ===================================================== */

    resize();
    start();

    /*
     * capture:true:
     * фон получает pointermove даже если какой-нибудь
     * UI-компонент ниже вызывает stopPropagation().
     */
    window.addEventListener(
      "pointermove",
      handlePointerMove,
      {
        passive: true,
        capture: true,
      },
    );

    /*
     * Fallback для браузеров/окружений,
     * где pointermove ведёт себя нестабильно.
     */
    window.addEventListener(
      "mousemove",
      handleMouseMove,
      {
        passive: true,
        capture: true,
      },
    );

    window.addEventListener(
      "pointerleave",
      handlePointerLeave,
    );

    window.addEventListener(
      "blur",
      handlePointerLeave,
    );

    document.addEventListener(
      "visibilitychange",
      start,
    );

    window.addEventListener(
      "resize",
      handleResize,
      {
        passive: true,
      },
    );

    reducedMotion.addEventListener?.(
      "change",
      start,
    );

    themeObserver.observe(
      document.documentElement,
      {
        attributes: true,

        attributeFilter: [
          "class",
          "data-theme",
        ],
      },
    );


    return () => {
      window.cancelAnimationFrame(
        frameId,
      );

      window.removeEventListener(
        "pointermove",
        handlePointerMove,
        {
          capture: true,
        },
      );

      window.removeEventListener(
        "mousemove",
        handleMouseMove,
        {
          capture: true,
        },
      );

      window.removeEventListener(
        "pointerleave",
        handlePointerLeave,
      );

      window.removeEventListener(
        "blur",
        handlePointerLeave,
      );

      document.removeEventListener(
        "visibilitychange",
        start,
      );

      window.removeEventListener(
        "resize",
        handleResize,
      );

      reducedMotion.removeEventListener?.(
        "change",
        start,
      );

      themeObserver.disconnect();
    };
  }, []);


  return (
    <div
      className="brand-background"
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="brand-background__canvas"
      />
    </div>
  );
}
