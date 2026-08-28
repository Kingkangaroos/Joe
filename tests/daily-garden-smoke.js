/* Daily Mission Garden browserless smoke test
   Performed-by: ChatGPT (OpenAI)
   Run with: node tests/daily-garden-smoke.js */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

class ClassList {
  constructor() { this.values = new Set(); }
  sync(value) { this.values = new Set(String(value || '').split(/\s+/).filter(Boolean)); }
  add(...names) { names.forEach(name => this.values.add(name)); }
  remove(...names) { names.forEach(name => this.values.delete(name)); }
  contains(name) { return this.values.has(name); }
  toggle(name, force) {
    const on = force === undefined ? !this.contains(name) : !!force;
    if (on) this.add(name); else this.remove(name);
    return on;
  }
}

class Style {
  setProperty(name, value) { this[name] = String(value); }
}

const ids = {};

class Element {
  constructor(tag = 'div', id = '') {
    this.tagName = tag.toUpperCase();
    this.id = id;
    this.children = [];
    this.dataset = {};
    this.style = new Style();
    this.classList = new ClassList();
    this.clientWidth = 390;
    this.clientHeight = 196;
    this.offsetWidth = 390;
    this.onclick = null;
    this.textContent = '';
    this._innerHTML = '';
    if (id) ids[id] = this;
  }
  set className(value) { this.classList.sync(value); }
  get className() { return Array.from(this.classList.values).join(' '); }
  set innerHTML(value) {
    this._innerHTML = String(value);
    this.children = [];
    if (this.id === 'mgFocusCard' && this._innerHTML.includes('mg-focus-check')) {
      const button = new Element('button');
      button.className = 'mg-focus-check';
      this.children.push(button);
    }
  }
  get innerHTML() { return this._innerHTML; }
  appendChild(child) { this.children.push(child); return child; }
  setAttribute(name, value) { this[name] = String(value); }
  removeAttribute(name) { delete this[name]; }
  querySelectorAll(selector) {
    if (selector === '.mg-plot') return this.children.filter(child => child.classList.contains('mg-plot'));
    return [];
  }
  querySelector(selector) {
    if (selector === 'img') return this.children.find(child => child.tagName === 'IMG') || null;
    if (selector === '.mg-focus-check') return this.children.find(child => child.classList.contains('mg-focus-check')) || null;
    if (selector === '.mg-plot') return this.children.find(child => child.classList.contains('mg-plot')) || null;
    const key = selector.match(/^\[data-key="(.+)"\]$/);
    if (key) return this.children.find(child => child.dataset.key === key[1]) || null;
    return null;
  }
}

const root = new Element('section', 'missionGarden');
const stage = new Element('div', 'mgStage');
const plots = new Element('div', 'mgPlots');
new Element('div', 'mgFocusCard');
new Element('span', 'mgProgress');
new Element('div', 'mgTitle');
const good = new Element('button', 'mgGuideGood');
const goodImg = new Element('img'); good.children.push(goodImg);
const budget = new Element('button', 'mgGuideBudget');
const budgetImg = new Element('img'); budget.children.push(budgetImg);
const special = new Element('button', 'mgGuideSpecial');
const specialImg = new Element('img'); special.children.push(specialImg);

const defs = {
  sleep:{isHabit:true,active:true,label:'Sleep',icon:'😴'},
  walking:{isHabit:true,active:true,label:'10k Steps',icon:'👟'},
  meditation:{isHabit:true,active:true,label:'Meditation',icon:'🧘'},
  good_deed:{isHabit:true,active:true,label:'Good Deed',icon:'💛'},
  budgeting:{isHabit:true,active:true,label:'Budgeting',icon:'🪙'}
};
const toggled = [];

const sandboxWindow = {
  RPG_DEFAULT_SKILLS: defs,
  getHabits: () => Object.fromEntries(Object.keys(defs).map(key => [key,{score:key === 'sleep' ? 5 : 2}])),
  toggleMission: key => toggled.push(key),
  addEventListener: () => {}
};

const sandbox = {
  window: sandboxWindow,
  document: {
    readyState:'complete',
    createElement: tag => new Element(tag),
    getElementById: id => ids[id] || null,
    addEventListener: () => {}
  },
  hlogHas: () => false,
  viewedDateStr: () => '2026-08-27',
  viewedDateLabel: () => 'Today',
  setTimeout: fn => { fn(); return 1; },
  clearTimeout: () => {},
  console,
  Date,
  Math,
  Object
};

const source = fs.readFileSync(path.join(__dirname, '..', 'daily-garden.js'), 'utf8');
vm.runInNewContext(source, sandbox, { filename:'daily-garden.js' });

assert.equal(plots.children.length, 5, 'all active public missions render');
assert.equal(good.style['--gx'], '16px', 'Good Deed guide starts at the left edge');
assert.equal(budget.style['--gx'], '308px', 'Budgeting guide uses the mobile stage width instead of its own width');

plots.querySelector('[data-key="sleep"]').onclick();
assert.ok(special.classList.contains('active'), 'Sleep activates the special mission guide');
assert.ok(special.classList.contains('focused'), 'Sleep guide receives focus');
assert.equal(special.dataset.skill, 'sleep');
assert.equal(specialImg.src, 'img/lab/park2/sleep.png');

ids.mgFocusCard.querySelector('.mg-focus-check').onclick({ stopPropagation(){} });
assert.deepEqual(toggled, ['sleep'], 'mission completion still uses the existing toggle flow');

plots.querySelector('[data-key="good_deed"]').onclick();
assert.ok(!special.classList.contains('active'), 'generic guide returns for other missions');
assert.ok(good.classList.contains('focused'), 'Good Deed receives focus');
assert.equal(budget.style['--gx'], '308px', 'an unfocused guide returns to its resting position');

console.log('Daily Mission Garden smoke test passed: character routing, focus and mission toggle.');
