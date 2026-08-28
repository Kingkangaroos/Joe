/* Park 2.0 browserless smoke test
   Performed-by: ChatGPT (OpenAI)
   Run with: node tests/park2-smoke.js */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

class ClassList {
  constructor(owner) { this.owner = owner; this.values = new Set(); }
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
  constructor() { this.values = {}; }
  setProperty(name, value) { this.values[name] = String(value); }
}

const ids = {};

class Element {
  constructor(tag = 'div', id = '') {
    this.tagName = tag.toUpperCase();
    this.id = id;
    this.children = [];
    this.dataset = {};
    this.style = new Style();
    this.classList = new ClassList(this);
    this.clientWidth = 0;
    this.clientHeight = 0;
    this.onclick = null;
    this.textContent = '';
    this.offsetWidth = 80;
    this._innerHTML = '';
    this._className = '';
    if (id) ids[id] = this;
  }
  set className(value) { this._className = value; this.classList.sync(value); }
  get className() { return Array.from(this.classList.values).join(' '); }
  set innerHTML(value) {
    this._innerHTML = String(value);
    this.children = [];
    if (this.classList.contains('p2-agent') && this._innerHTML.includes('<img')) {
      const img = new Element('img');
      const match = this._innerHTML.match(/<img src="([^"]+)"/);
      img.src = match ? match[1] : '';
      this.children.push(img);
    }
    if (this.id === 'park2Detail' && this._innerHTML.includes('park2FocusToggle')) {
      const button = new Element('button', 'park2FocusToggle');
      button.textContent = this._innerHTML.includes('Laat weer vrij rondlopen')
        ? 'Laat weer vrij rondlopen'
        : 'Focus';
      this.children.push(button);
    }
  }
  get innerHTML() { return this._innerHTML; }
  appendChild(child) { this.children.push(child); return child; }
  setAttribute(name, value) { this[name] = String(value); }
  querySelector(selector) {
    if (selector === 'img') return this.children.find(child => child.tagName === 'IMG') || null;
    return null;
  }
}

const root = new Element('section', 'park2');
const stage = new Element('div', 'park2Stage');
stage.clientWidth = 390;
stage.clientHeight = 400;
const agents = new Element('div', 'park2Agents');
const roster = new Element('div', 'park2Roster');
new Element('div', 'park2Detail');
new Element('div', 'park2Garden');
new Element('button', 'park2Motion');
new Element('span', 'park2Time');

const habitScores = { good_deed:7, budgeting:3, sleep:5, walking:2, meditation:9 };
const skillLevels = { ai_tools:100, tennis:24, piano:50 };
const skillDefs = {
  ai_tools:{}, tennis:{}, piano:{},
  good_deed:{isHabit:true}, budgeting:{isHabit:true}, sleep:{isHabit:true},
  walking:{isHabit:true}, meditation:{isHabit:true}
};

class FakeImage {
  set src(value) {
    this._src = value;
    const available = value.endsWith('/sleep/advanced.png') || value.endsWith('/sleep/mastery.png')
      || value.endsWith('/meditation/advanced.png') || value.endsWith('/meditation/mastery.png');
    if (available && this.onload) this.onload();
    if (!available && this.onerror) this.onerror();
  }
  get src() { return this._src; }
}

const sandboxWindow = {
  RPG_DEFAULT_SKILLS: skillDefs,
  getCharacter: () => ({ skills:{} }),
  getSkillLevel: key => skillLevels[key] || 1,
  getHabits: () => Object.fromEntries(Object.entries(habitScores).map(([key,score]) => [key,{score}]))
};

const sandbox = {
  window: sandboxWindow,
  document: {
    createElement: tag => new Element(tag),
    getElementById: id => ids[id] || null
  },
  Image: FakeImage,
  requestAnimationFrame: () => 1,
  setTimeout: fn => { fn(); return 1; },
  clearTimeout: () => {},
  console,
  Date,
  Math,
  Number
};
sandboxWindow.addEventListener = () => {};

const source = fs.readFileSync(path.join(__dirname, '..', 'park2.js'), 'utf8');
vm.runInNewContext(source, sandbox, { filename:'park2.js' });

assert.equal(agents.children.length, 8, 'all eight companions render');
assert.equal(roster.children.length, 8, 'all eight roster controls render');

const bySkill = key => agents.children.find(agent => agent.dataset.skill === key);
assert.equal(bySkill('sleep').dataset.evolution, 'advanced');
assert.equal(bySkill('walking').dataset.evolution, 'starter');
assert.equal(bySkill('meditation').dataset.evolution, 'mastery');
assert.equal(bySkill('budgeting').dataset.evolution, 'apprentice');
assert.equal(bySkill('good_deed').dataset.evolution, 'expert');
assert.ok(bySkill('ai_tools').classList.contains('is-prestige'), 'level 100 gets prestige');
assert.equal(bySkill('sleep').querySelector('img').src, 'img/lab/park2/sleep/advanced.png');
assert.equal(bySkill('meditation').querySelector('img').src, 'img/lab/park2/meditation/mastery.png');

ids.park2FocusToggle.onclick();
assert.ok(root.classList.contains('is-focus-mode'), 'focus mode activates');
assert.equal(agents.children.filter(agent => agent.classList.contains('is-focus-lead')).length, 1);
assert.equal(agents.children.filter(agent => agent.classList.contains('is-focus-support')).length, 7);

roster.children[6].onclick();
assert.ok(bySkill('walking').classList.contains('is-focus-lead'), 'focus switches to a tapped companion');
assert.equal(ids.park2FocusToggle.textContent, 'Laat weer vrij rondlopen');

ids.park2FocusToggle.onclick();
assert.ok(!root.classList.contains('is-focus-mode'), 'focus mode releases');
assert.equal(agents.children.filter(agent => agent.classList.contains('is-focus-lead')).length, 0);

console.log('Park 2.0 smoke test passed: 8 companions, evolution bands, prestige and focus switching.');
