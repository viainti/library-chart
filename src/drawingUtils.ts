import type { DrawingObject, Point } from './types';
const drawRoundedRect = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius = 8) => {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
};


export class DrawingRenderer {
  static draw(drawing: DrawingObject, ctx: CanvasRenderingContext2D) {
    if (!drawing.visible) return;

    ctx.save();
    ctx.strokeStyle = drawing.color;
    ctx.lineWidth = drawing.width;
    ctx.setLineDash(drawing.style === 'dashed' ? [5, 5] : drawing.style === 'dotted' ? [2, 2] : []);

    switch (drawing.type) {
      case 'trendline':
        this.drawLine(drawing, ctx);
        break;
      case 'ray':
        this.drawRay(drawing, ctx);
        break;
      case 'extended-line':
        this.drawExtendedLine(drawing, ctx);
        break;
      case 'info-line':
        this.drawInfoLine(drawing, ctx);
        break;
      case 'trend-angle':
        this.drawTrendAngle(drawing, ctx);
        break;
      case 'horizontal':
        this.drawLine(drawing, ctx);
        break;
      case 'horizontal-line':
        this.drawInfiniteHorizontal(drawing, ctx);
        break;
      case 'horizontal-ray':
        this.drawHorizontalRay(drawing, ctx);
        break;
      case 'vertical-line':
        this.drawVerticalLine(drawing, ctx);
        break;
      case 'parallel':
      case 'channel':
      case 'regression-trend':
      case 'flat-top-bottom':
      case 'disjoint-channel':
      case 'pitchfork':
      case 'schiff-pitchfork':
      case 'modified-schiff-pitchfork':
      case 'inside-pitchfork':
        this.drawChannel(drawing, ctx);
        break;
      case 'rectangle':
        this.drawRectangle(drawing, ctx);
        break;
      case 'triangle':
        this.drawTriangle(drawing, ctx);
        break;
      case 'text':
        this.drawText(drawing, ctx);
        break;
      case 'icon':
        this.drawIcon(drawing, ctx);
        break;
      case 'ruler':
        this.drawRuler(drawing, ctx);
        break;
      case 'freehand':
        this.drawFreehand(drawing, ctx);
        break;
      case 'fibonacci':
        this.drawFibonacci(drawing, ctx);
        break;
      case 'cross-line':
        this.drawCrossLine(drawing, ctx);
        break;
      default:
        this.drawLine(drawing, ctx);
    }

    ctx.setLineDash([]);
    ctx.restore();
  }

  private static drawLine(drawing: DrawingObject, ctx: CanvasRenderingContext2D) {
    if (drawing.points.length < 2) return;
    const start = drawing.points[0];
    const end = drawing.points[1];
    if (!start || !end) return;

    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();

    if (drawing.type === 'parallel' && drawing.points.length >= 4) {
      const start2 = drawing.points[2];
      const end2 = drawing.points[3];
      if (start2 && end2) {
        ctx.beginPath();
        ctx.moveTo(start2.x, start2.y);
        ctx.lineTo(end2.x, end2.y);
        ctx.stroke();
      }
    }
  }


  private static drawRay(drawing: DrawingObject, ctx: CanvasRenderingContext2D) {
    if (drawing.points.length < 2) return;
    const start = drawing.points[0];
    const end = drawing.points[1];
    if (!start || !end) return;

    const intersections = this.computeBoundaryIntersections(start, end, ctx.canvas.width, ctx.canvas.height)
      .filter(point => point.t >= 0)
      .sort((a, b) => a.t - b.t);

    const target = intersections[0];
    if (!target) {
      this.drawLine(drawing, ctx);
      return;
    }

    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(target.x, target.y);
    ctx.stroke();
  }

  private static drawExtendedLine(drawing: DrawingObject, ctx: CanvasRenderingContext2D) {
    if (drawing.points.length < 2) return;
    const start = drawing.points[0];
    const end = drawing.points[1];
    if (!start || !end) return;

    const intersections = this.computeBoundaryIntersections(start, end, ctx.canvas.width, ctx.canvas.height);
    const forward = intersections.filter(point => point.t >= 0).sort((a, b) => a.t - b.t)[0];
    const backward = intersections.filter(point => point.t <= 0).sort((a, b) => b.t - a.t)[0];

    if (!forward || !backward) {
      this.drawLine(drawing, ctx);
      return;
    }

    ctx.beginPath();
    ctx.moveTo(backward.x, backward.y);
    ctx.lineTo(forward.x, forward.y);
    ctx.stroke();
  }

  private static drawInfoLine(drawing: DrawingObject, ctx: CanvasRenderingContext2D) {
    this.drawLine(drawing, ctx);
    if (drawing.points.length < 2) return;
    const start = drawing.points[0];
    const end = drawing.points[1];
    if (!start || !end) return;

    const priceDelta = (end.price ?? 0) - (start.price ?? 0);
    const timeDelta = (end.time ?? 0) - (start.time ?? 0);
    const label = `ΔP ${priceDelta >= 0 ? '+' : ''}${priceDelta.toFixed(2)} | ΔT ${timeDelta >= 0 ? '+' : ''}${timeDelta.toFixed(0)}`;

    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;
    const fontSize = 10;
    const paddingX = 10;
    const paddingY = 6;
    ctx.font = `${fontSize}px Inter, sans-serif`;
    const textWidth = ctx.measureText(label).width;
    const boxWidth = textWidth + paddingX * 2;
    const boxHeight = fontSize + paddingY * 2;
    const boxX = midX - boxWidth / 2;
    const boxY = midY - boxHeight - 8;

    ctx.fillStyle = 'rgba(15,23,42,0.9)';
    ctx.strokeStyle = '#38bdf8';
    drawRoundedRect(ctx, boxX, boxY, boxWidth, boxHeight, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#e2e8f0';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, midX, boxY + boxHeight / 2);
  }

  private static drawTrendAngle(drawing: DrawingObject, ctx: CanvasRenderingContext2D) {
    this.drawLine(drawing, ctx);
    if (drawing.points.length < 2) return;
    const start = drawing.points[0];
    const end = drawing.points[1];
    if (!start || !end) return;

    const angleRad = Math.atan2(start.y - end.y, end.x - start.x);
    const angleDeg = ((angleRad * 180) / Math.PI + 360) % 360;
    const label = `${angleDeg.toFixed(1)}°`;

    ctx.font = '11px Inter, sans-serif';
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#2563eb';

    const paddingX = 8;
    const paddingY = 4;
    const textWidth = ctx.measureText(label).width;
    const boxWidth = textWidth + paddingX * 2;
    const boxHeight = 18;
    const boxX = end.x + 10;
    const boxY = end.y - boxHeight - 4;

    ctx.beginPath();
    drawRoundedRect(ctx, boxX, boxY, boxWidth, boxHeight, 8);
    ctx.fillStyle = 'rgba(2,6,23,0.85)';
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#f8fafc';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, boxX + boxWidth / 2, boxY + boxHeight / 2);
  }

  private static drawHorizontalRay(drawing: DrawingObject, ctx: CanvasRenderingContext2D) {
    if (drawing.points.length < 1) return;
    const start = drawing.points[0];
    const guide = drawing.points[1] ?? start;
    if (!start || !guide) return;

    const direction = guide.x >= start.x ? 1 : -1;
    const targetX = direction > 0 ? ctx.canvas.width : 0;

    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(targetX, start.y);
    ctx.stroke();
  }

  private static drawInfiniteHorizontal(drawing: DrawingObject, ctx: CanvasRenderingContext2D) {
    if (drawing.points.length < 1) return;
    const start = drawing.points[0];
    if (!start) return;

    ctx.beginPath();
    ctx.moveTo(0, start.y);
    ctx.lineTo(ctx.canvas.width, start.y);
    ctx.stroke();
  }

  private static drawVerticalLine(drawing: DrawingObject, ctx: CanvasRenderingContext2D) {
    if (drawing.points.length < 1) return;
    const start = drawing.points[0];
    if (!start) return;

    ctx.beginPath();
    ctx.moveTo(start.x, 0);
    ctx.lineTo(start.x, ctx.canvas.height);
    ctx.stroke();
  }

  private static computeBoundaryIntersections(start: Point, end: Point, width: number, height: number) {
    const intersections: { x: number; y: number; t: number }[] = [];
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    if (dx === 0 && dy === 0) {
      return intersections;
    }

    if (dx !== 0) {
      const tLeft = (0 - start.x) / dx;
      const yLeft = start.y + tLeft * dy;
      if (!Number.isNaN(yLeft) && yLeft >= 0 && yLeft <= height) {
        intersections.push({ x: 0, y: yLeft, t: tLeft });
      }

      const tRight = (width - start.x) / dx;
      const yRight = start.y + tRight * dy;
      if (!Number.isNaN(yRight) && yRight >= 0 && yRight <= height) {
        intersections.push({ x: width, y: yRight, t: tRight });
      }
    }

    if (dy !== 0) {
      const tTop = (0 - start.y) / dy;
      const xTop = start.x + tTop * dx;
      if (!Number.isNaN(xTop) && xTop >= 0 && xTop <= width) {
        intersections.push({ x: xTop, y: 0, t: tTop });
      }

      const tBottom = (height - start.y) / dy;
      const xBottom = start.x + tBottom * dx;
      if (!Number.isNaN(xBottom) && xBottom >= 0 && xBottom <= width) {
        intersections.push({ x: xBottom, y: height, t: tBottom });
      }
    }

    return intersections;
  }


  private static drawRectangle(drawing: DrawingObject, ctx: CanvasRenderingContext2D) {
    if (drawing.points.length < 2) return;
    const start = drawing.points[0];
    const end = drawing.points[1];
    if (!start || !end) return;

    const rectX = Math.min(start.x, end.x);
    const rectY = Math.min(start.y, end.y);
    const rectWidth = Math.abs(end.x - start.x);
    const rectHeight = Math.abs(end.y - start.y);

    if (drawing.backgroundColor) {
      ctx.fillStyle = drawing.backgroundColor;
      ctx.fillRect(rectX, rectY, rectWidth, rectHeight);
    }

    ctx.strokeRect(rectX, rectY, rectWidth, rectHeight);
  }

  private static drawTriangle(drawing: DrawingObject, ctx: CanvasRenderingContext2D) {
    if (drawing.points.length < 3) return;
    const p1 = drawing.points[0];
    const p2 = drawing.points[1];
    const p3 = drawing.points[2];
    if (!p1 || !p2 || !p3) return;

    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.closePath();

    if (drawing.backgroundColor) {
      ctx.fillStyle = drawing.backgroundColor;
      ctx.fill();
    }

    ctx.stroke();
  }

  private static drawChannel(drawing: DrawingObject, ctx: CanvasRenderingContext2D) {
    if (drawing.points.length < 4) {
      this.drawLine(drawing, ctx);
      return;
    }

    const [start1, end1, start2, end2] = drawing.points;
    if (!start1 || !end1 || !start2 || !end2) return;

    if (drawing.backgroundColor) {
      ctx.fillStyle = drawing.backgroundColor;
      ctx.beginPath();
      ctx.moveTo(start1.x, start1.y);
      ctx.lineTo(end1.x, end1.y);
      ctx.lineTo(end2.x, end2.y);
      ctx.lineTo(start2.x, start2.y);
      ctx.closePath();
      ctx.fill();
    }

    ctx.beginPath();
    ctx.moveTo(start1.x, start1.y);
    ctx.lineTo(end1.x, end1.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(start2.x, start2.y);
    ctx.lineTo(end2.x, end2.y);
    ctx.stroke();
  }

  private static drawText(drawing: DrawingObject, ctx: CanvasRenderingContext2D) {
    if (drawing.points.length < 1 || !drawing.text) return;
    const point = drawing.points[0];
    if (!point) return;

    const fontSize = drawing.fontSize ?? 14;
    ctx.font = `${fontSize}px Inter, sans-serif`;
    const textMetrics = ctx.measureText(drawing.text);
    const textWidth = textMetrics.width;
    const paddingX = 12;
    const paddingY = 6;
    const boxWidth = textWidth + paddingX * 2;
    const boxHeight = fontSize + paddingY * 2;
    const originX = point.x - boxWidth / 2;
    const originY = point.y - boxHeight - 6;

    ctx.fillStyle = drawing.backgroundColor ?? 'rgba(15,23,42,0.85)';
    drawRoundedRect(ctx, originX, originY, boxWidth, boxHeight, 10);
    ctx.fill();

    ctx.fillStyle = drawing.color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(drawing.text, point.x, originY + boxHeight / 2);
  }

  private static drawIcon(drawing: DrawingObject, ctx: CanvasRenderingContext2D) {
    if (drawing.points.length < 1 || !drawing.icon) return;
    const point = drawing.points[0];
    if (!point) return;

    const fontSize = drawing.fontSize ?? 20;
    ctx.font = `${fontSize}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI Emoji", "Noto Color Emoji", "Android Emoji", "EmojiSymbols"`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = drawing.color;
    ctx.fillText(drawing.icon, point.x, point.y);
  }

  private static drawRuler(drawing: DrawingObject, ctx: CanvasRenderingContext2D) {
    this.drawLine(drawing, ctx);
    if (drawing.points.length < 2) return;
    const start = drawing.points[0];
    const end = drawing.points[1];
    const measurement = drawing.meta?.measurement;
    if (!start || !end || !measurement) return;

    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;
    const label = `${measurement.priceDelta >= 0 ? '+' : ''}${measurement.priceDelta.toFixed(2)} | ${measurement.percentDelta.toFixed(2)}%`;

    ctx.font = '11px Inter, sans-serif';
    const textWidth = ctx.measureText(label).width;
    const boxWidth = textWidth + 16;
    const boxHeight = 20;
    const boxX = midX - boxWidth / 2;
    const boxY = midY - boxHeight - 8;

    ctx.fillStyle = 'rgba(15,23,42,0.9)';
    ctx.strokeStyle = drawing.color;
    drawRoundedRect(ctx, boxX, boxY, boxWidth, boxHeight, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#e2e8f0';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, midX, boxY + boxHeight / 2);
  }

  private static drawFreehand(drawing: DrawingObject, ctx: CanvasRenderingContext2D) {
    if (drawing.points.length < 2) return;

    const firstPoint = drawing.points[0];
    if (!firstPoint) return;

    ctx.beginPath();
    ctx.moveTo(firstPoint.x, firstPoint.y);
    for (let i = 1; i < drawing.points.length; i++) {
      const point = drawing.points[i];
      if (point) {
        ctx.lineTo(point.x, point.y);
      }
    }
    ctx.stroke();
  }

  private static drawFibonacci(drawing: DrawingObject, ctx: CanvasRenderingContext2D) {
    if (drawing.points.length < 2) return;
    const start = drawing.points[0];
    const end = drawing.points[1];
    if (!start || !end) return;

    const levels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];
    const height = end.y - start.y;

    levels.forEach(level => {
      const y = start.y + height * level;
      ctx.beginPath();
      ctx.moveTo(start.x, y);
      ctx.lineTo(end.x, y);
      ctx.stroke();
    });
  }

  private static drawCrossLine(drawing: DrawingObject, ctx: CanvasRenderingContext2D) {
    if (drawing.points.length < 1) return;
    const center = drawing.points[0];
    if (!center) return;

    // Draw horizontal line
    ctx.beginPath();
    ctx.moveTo(0, center.y);
    ctx.lineTo(ctx.canvas.width, center.y);
    ctx.stroke();

    // Draw vertical line
    ctx.beginPath();
    ctx.moveTo(center.x, 0);
    ctx.lineTo(center.x, ctx.canvas.height);
    ctx.stroke();
  }
}