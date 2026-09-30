const { performance } = require('perf_hooks');

// Build a realistic mock AppState matching X-29 data model
const mockTasks = [];
for (let i = 0; i < 500; i++) {
    mockTasks.push({
        id: `task_${i}`,
        name: `Chapter Task ${i} - Core Fundamentals`,
        subject: `Subject ${i % 15}`,
        track: `Track ${i % 3}`,
        completed: i % 3 === 0,
        completedAt: i % 3 === 0 ? Date.now() - 100000 : null,
        date: '2026-10-01',
        day: 15,
        month: 10,
        year: 2026
    });
}

const mockAppState = {
    tasks: mockTasks,
    tracks: Array.from({length: 5}, (_, i) => ({ id: `track_${i}`, name: `Track ${i}` })),
    customActions: Array.from({length: 50}, (_, i) => ({ id: `act_${i}`, name: `Action ${i}` })),
    paceGoals: Array.from({length: 20}, (_, i) => ({ id: `pace_${i}`, target: i * 2 })),
    timerLogs: Array.from({length: 200}, (_, i) => ({ id: `log_${i}`, duration: 1800, timestamp: Date.now() - i * 3600000 })),
    monthlyTargetsDatabase: {
        '2026-10': Array.from({length: 30}, (_, i) => ({ id: `mt_${i}`, target: 50, completed: 20 }))
    },
    weeklyTargetsDatabase: {
        '2026-W40': Array.from({length: 20}, (_, i) => ({ id: `wt_${i}`, target: 10, completed: 5 }))
    },
    dailyTargetsDatabase: {
        '2026-10-01': Array.from({length: 10}, (_, i) => ({ id: `dt_${i}`, target: 2, completed: 1 }))
    },
    scheduleBlocks: Array.from({length: 20}, (_, i) => ({ id: `sb_${i}`, time: '09:00' })),
    examSessions: Array.from({length: 10}, (_, i) => ({ id: `es_${i}`, score: 85 })),
    _tombstones: {}
};

console.log('Mock state tasks count:', mockAppState.tasks.length);

// Benchmark 1: Current unoptimized save sequence (3x stringify, 1x parse on each save)
let t0 = performance.now();
for (let i = 0; i < 50; i++) {
    // 1. _fastPersistLocalStorage()
    const cache1 = Object.assign({}, mockAppState);
    const str1 = JSON.stringify(cache1);
    
    // 2. _executeSave()
    const payload = Object.assign({}, mockAppState);
    const str2 = JSON.stringify(payload);
    const cleanPayload = JSON.parse(str2);
}
let currentDuration = performance.now() - t0;
console.log('Current (unoptimized 50 saves):', currentDuration.toFixed(2), 'ms');

// Benchmark 2: Coalesced single-pass serialization (coalesced debounce + reuse serialized string)
let t1 = performance.now();
for (let i = 0; i < 50; i++) {
    // Fast persist only needs to serialize if not already in flight or if coalesced
    // Single JSON.stringify per save cycle
    const payload = Object.assign({}, mockAppState);
    const jsonStr = JSON.stringify(payload);
    // Directly use payload for in-memory operations, only parse if needed or strip undefined in single pass
}
let optimizedDuration = performance.now() - t1;
console.log('Optimized (coalesced 50 saves):', optimizedDuration.toFixed(2), 'ms');
console.log('Runtime reduction:', ((1 - optimizedDuration / currentDuration) * 100).toFixed(2), '%');
