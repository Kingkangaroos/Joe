'use strict';
const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const source = fs.readFileSync('home-workout.js', 'utf8');
const context = { window: {} };
vm.createContext(context); vm.runInContext(source, context);
const workout = context.window.GamenfyHomeWorkout;
assert.equal(workout.dayType('2026-10-14'), 'strength', 'viewed Wednesday prescribes strength');
assert.equal(workout.dayType('2026-10-15'), 'mobility', 'viewed Thursday prescribes mobility');
assert.equal(workout.dayType('2026-10-18'), 'mobility', 'Sunday can complete the daily habit through gentle mobility');
for (const mode of ['short', 'extended']) for (let week = 1; week <= 4; week++) {
  const p = workout.plan({ mode, week, gear: 'mat', habitScore: 10 });
  assert.equal(p.exercises.length, 5);
  assert.equal(p.exercises[4][0], 'W-raise op je buik');
  assert.equal(p.exercises[4][4], 1, 'control exercise never becomes a substitute for heavy pulling');
  assert.equal(p.exercises[0][4], mode === 'extended' && week >= 2 ? 2 : 1);
  assert.equal(p.exercises[1][4], mode === 'extended' && week >= 4 ? 2 : 1);
}
assert.equal(workout.plan({ gear: 'dumbbell' }).exercises[4][0], 'Dumbbell row');
assert.equal(workout.plan({ mode: 'extended', week: 3, gear: 'dumbbell' }).exercises[4][4], 2);
assert.equal(workout.plan({ week: 100 }).week, 4, 'invalid future week cannot prescribe escalating sets');
assert.equal(JSON.stringify(workout.plan({ week: 1, habitScore: 0 })), JSON.stringify(workout.plan({ week: 1, habitScore: 10 })), 'habit streak is independent of physical readiness');
assert.doesNotMatch(source, /localStorage|addXP|checkHabit|toggleMission|fetch\(/, 'routine browsing cannot mark habits, write account data or create duplicate XP');
const home = fs.readFileSync('index.html', 'utf8');
assert.match(home, /GamenfyHomeWorkout\.shell\(viewedDateStr\(\)\)/, 'backdated mission detail uses the viewed civil date');
assert.doesNotMatch(home, /Volgende bespreking: oefeningen/);
assert.match(home, /GamenfyHomeWorkout\.bind\(bg\)/);
console.log('Home workout: dated plan, gradual volume, equipment substitution, habit-level independence and read-only controls passed.');
