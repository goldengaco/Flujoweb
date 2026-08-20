/**
 * Stress Testing Common Helpers & Benchmarks
 */


async function benchmarkFrameRate(browser, durationMs = 2000) {
  return await browser.evaluate(async (ms) => {
    return new Promise((resolve) => {
      let frameCount = 0;
      let lastTime = performance.now();
      const frameDeltas = [];
      const startTime = performance.now();

      function onFrame(now) {
        frameCount++;
        const delta = now - lastTime;
        frameDeltas.push(delta);
        lastTime = now;

        if (now - startTime < ms) {
          requestAnimationFrame(onFrame);
        } else {
          const totalDuration = now - startTime;
          const fps = (frameCount / totalDuration) * 1000;
          const maxDelta = Math.max(...frameDeltas);
          const minDelta = Math.min(...frameDeltas);
          const avgDelta = frameDeltas.reduce((a, b) => a + b, 0) / frameDeltas.length;
          resolve({
            fps,
            frameCount,
            totalDuration,
            maxDelta,
            minDelta,
            avgDelta,
            droppedFrames: frameDeltas.filter(d => d > 50).length
          });
        }
      }

      requestAnimationFrame(onFrame);
    });
  }, durationMs);
}

async function getSystemMemoryMetrics(browser) {
  return await browser.evaluate() => {
    const domNodes = document.querySelectorAll('*').length;
    const heapUsed = window.performance && window.performance.memory ? window.performance.memory.usedJSHeapSize : null;
    const heapTotal = window.performance && window.performance.memory ? window.performance.memory.totalJSHeapSize : null;
    return {
      domNodes,
      heapUsdetMB: heapUsed ? +(heapUsed / (1024 * 1024)).toFixed(2) : null,
      heapTotalMB: heapTotal ? +(heapTotal / (1024 * 1024)).toFixed(2) : null
    };
  });
}

module.exports = {
  benchmarkFrameRate,
  getSystemMemoryMetrics
};
