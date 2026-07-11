interface SystemTiming {
  name: string;
  totalTime: number;
  callCount: number;
  avgTime: number;
  maxTime: number;
  minTime: number;
}

interface FrameMetrics {
  timestamp: number;
  frameTime: number;
  fps: number;
  drawCalls: number;
  triangles: number;
  points: number;
  lines: number;
  geometries: number;
  textures: number;
  memory: {
    used: number;
    total: number;
  };
  systemTimes: Record<string, number>;
}

class PerformanceMonitor {
  private frames: FrameMetrics[] = [];
  private maxFrames = 300; // 5 seconds at 60fps
  private systemTimes = new Map<string, SystemTiming>();
  private lastFrameTime = 0;
  private frameCount = 0;
  private lastFPSUpdate = 0;
  private currentFPS = 0;
  private currentFrameTime = 0;
  private drawCalls = 0;
  private triangles = 0;
  private points = 0;
  private lines = 0;
  private geometries = 0;
  private textures = 0;
  private warningsEnabled = true;
  private thresholds = {
    frameTime: 16.67, // 60fps
    fps: 30,
    memory: 512 * 1024 * 1024, // 512MB
    drawCalls: 1000,
  };
  private warningCallbacks: Map<string, Function[]> = new Map();

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.logReport());
    }
  }

  beginFrame(): void {
    const now = performance.now();
    this.currentFrameTime = now - this.lastFrameTime;
    this.lastFrameTime = now;
    this.frameCount++;
    this.drawCalls = 0;
    this.triangles = 0;
    this.points = 0;
    this.lines = 0;
  }

  endFrame(rendererInfo?: any): void {
    const frameMetrics: FrameMetrics = {
      timestamp: Date.now(),
      frameTime: this.currentFrameTime,
      fps: this.currentFPS,
      drawCalls: this.drawCalls,
      triangles: this.triangles,
      points: this.points,
      lines: this.lines,
      geometries: rendererInfo?.geometries || this.geometries,
      textures: rendererInfo?.textures || this.textures,
      memory: this.getMemoryInfo(),
      systemTimes: Object.fromEntries(
        Array.from(this.systemTimes.entries()).map(([name, t]) => [name, t.avgTime])
      ),
    };

    this.frames.push(frameMetrics);
    if (this.frames.length > this.maxFrames) {
      this.frames.shift();
    }

    this.updateFPS();
    this.checkThresholds(frameMetrics);
  }

  recordSystemTime(systemName: string, time: number): void {
    let timing = this.systemTimes.get(systemName);
    if (!timing) {
      timing = {
        name: systemName,
        totalTime: 0,
        callCount: 0,
        avgTime: 0,
        maxTime: 0,
        minTime: Infinity,
      };
      this.systemTimes.set(systemName, timing);
    }

    timing.totalTime += time;
    timing.callCount++;
    timing.avgTime = timing.totalTime / timing.callCount;
    timing.maxTime = Math.max(timing.maxTime, time);
    timing.minTime = Math.min(timing.minTime, time);
  }

  recordDrawCalls(count: number): void {
    this.drawCalls += count;
  }

  recordTriangles(count: number): void {
    this.triangles += count;
  }

  recordGeometries(count: number): void {
    this.geometries = count;
  }

  recordTextures(count: number): void {
    this.textures = count;
  }

  private updateFPS(): void {
    const now = performance.now();
    if (now - this.lastFPSUpdate >= 1000) {
      this.currentFPS = this.frameCount * 1000 / (now - this.lastFPSUpdate);
      this.frameCount = 0;
      this.lastFPSUpdate = now;
    }
  }

  private checkThresholds(metrics: FrameMetrics): void {
    if (!this.warningsEnabled) return;

    if (metrics.frameTime > this.thresholds.frameTime) {
      this.emitWarning('frameTime', `Frame time ${metrics.frameTime.toFixed(2)}ms exceeds ${this.thresholds.frameTime}ms`);
    }
    if (metrics.fps < this.thresholds.fps) {
      this.emitWarning('fps', `FPS ${metrics.fps.toFixed(1)} below ${this.thresholds.fps}`);
    }
    if (metrics.memory.used > this.thresholds.memory) {
      this.emitWarning('memory', `Memory ${(metrics.memory.used / 1024 / 1024).toFixed(1)}MB exceeds ${this.thresholds.memory / 1024 / 1024}MB`);
    }
    if (metrics.drawCalls > this.thresholds.drawCalls) {
      this.emitWarning('drawCalls', `Draw calls ${metrics.drawCalls} exceeds ${this.thresholds.drawCalls}`);
    }
  }

  private emitWarning(type: string, message: string): void {
    const callbacks = this.warningCallbacks.get(type) || [];
    callbacks.forEach(cb => cb({ type, message, timestamp: Date.now() }));
  }

  onWarning(type: string, callback: (data: { type: string; message: string; timestamp: number }) => void): () => void {
    if (!this.warningCallbacks.has(type)) {
      this.warningCallbacks.set(type, []);
    }
    this.warningCallbacks.get(type)!.push(callback);
    return () => {
      const callbacks = this.warningCallbacks.get(type) || [];
      const index = callbacks.indexOf(callback);
      if (index >= 0) callbacks.splice(index, 1);
    };
  }

  setThreshold(type: 'frameTime' | 'fps' | 'memory' | 'drawCalls', value: number): void {
    this.thresholds[type] = value;
  }

  enableWarnings(enabled: boolean): void {
    this.warningsEnabled = enabled;
  }

  private getMemoryInfo(): { used: number; total: number } {
    if ('memory' in performance) {
      const mem = (performance as any).memory;
      return {
        used: mem.usedJSHeapSize,
        total: mem.totalJSHeapSize,
      };
    }
    return { used: 0, total: 0 };
  }

  getAverageFPS(): number {
    if (this.frames.length === 0) return 0;
    const sum = this.frames.reduce((acc, f) => acc + f.fps, 0);
    return sum / this.frames.length;
  }

  getAverageFrameTime(): number {
    if (this.frames.length === 0) return 0;
    const sum = this.frames.reduce((acc, f) => acc + f.frameTime, 0);
    return sum / this.frames.length;
  }

  getSystemStats(): SystemTiming[] {
    return Array.from(this.systemTimes.values())
      .sort((a, b) => b.avgTime - a.avgTime);
  }

  getFrameHistory(): FrameMetrics[] {
    return [...this.frames];
  }

  getCurrentMetrics(): FrameMetrics | null {
    return this.frames[this.frames.length - 1] || null;
  }

  getReport(): string {
    const stats = this.getSystemStats();
    const current = this.getCurrentMetrics();
    
    let report = '=== Performance Report ===\n';
    report += `Current FPS: ${current?.fps.toFixed(1) || 0}\n`;
    report += `Avg FPS: ${this.getAverageFPS().toFixed(1)}\n`;
    report += `Current Frame Time: ${current?.frameTime.toFixed(2) || 0}ms\n`;
    report += `Avg Frame Time: ${this.getAverageFrameTime().toFixed(2)}ms\n`;
    report += `Draw Calls: ${current?.drawCalls || 0}\n`;
    report += `Triangles: ${current?.triangles || 0}\n`;
    report += `Memory: ${(current?.memory.used / 1024 / 1024).toFixed(1)}MB / ${(current?.memory.total / 1024 / 1024).toFixed(1)}MB\n\n`;
    
    report += 'System Times:\n';
    stats.forEach(s => {
      report += `  ${s.name}: ${s.avgTime.toFixed(3)}ms (max: ${s.maxTime.toFixed(3)}ms, calls: ${s.callCount})\n`;
    });
    
    return report;
  }

  logReport(): void {
    console.log(this.getReport());
  }

  reset(): void {
    this.frames = [];
    this.systemTimes.clear();
    this.frameCount = 0;
    this.lastFPSUpdate = 0;
    this.currentFPS = 0;
    this.currentFrameTime = 0;
    this.drawCalls = 0;
    this.triangles = 0;
    this.points = 0;
    this.lines = 0;
    this.geometries = 0;
    this.textures = 0;
    this.lastFrameTime = performance.now();
  }
}

export const performanceMonitor = new PerformanceMonitor();