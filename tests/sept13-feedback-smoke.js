/* Sept 13 feedback regression: private Home UX, gratitude reward, dormant L0,
   complete artwork framing, Command Quests and authenticated Fitbit recovery. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');

const home=read('index.html');
const character=read('character.html');
const park=read('park31.js');
const parkCss=read('park31.css');
const fitbit=read('fitbit-client-direct.js');
const xp=read('xp.js');

const privateDaily=home.match(/const PRIVATE_DAILY = \[([\s\S]*?)\n\];/);
assert.ok(privateDaily,'Home private mission registry exists');
assert.match(privateDaily[1],/id:'no_porn'[\s\S]*label:'Discipline'/,'Home exposes only the generic Discipline name');
assert.doesNotMatch(privateDaily[1],/weed_control|No Porn|Weed Control|Gardening/,'Home registry does not expose private names or Gardening');
const privateToggle=home.match(/window\.togglePrivateQuest = function\(id\)\{([\s\S]*?)\n\};\n\nwindow\.privatePinPrompt/);
assert.ok(privateToggle,'Home private checkbox controller exists');
assert.doesNotMatch(privateToggle[1],/privatePinPrompt|rpg_private_unlocked/,'checking Discipline never asks for or unlocks a PIN');
assert.match(privateToggle[1],/return !was/,'private checkbox reports completion for immediate celebration');
assert.match(home,/gamenfyOpenPrivateMission[\s\S]*privatePinPrompt[\s\S]*persist:false/,'opening Discipline always takes the non-persistent PIN route');
assert.match(home,/localStorage\.getItem\('rpg_pin_v1'\) \|\| '1111'/,'Home uses the configured PIN');
assert.match(character,/configuredPrivatePin\(\)[\s\S]*rpg_pin_v1/,'Skills uses the configured PIN');

assert.doesNotMatch(park.match(/var DISPLAY_MISSIONS=\[([\s\S]*?)\n  \]/)[1],/weed_control/,'Gardening is absent from the visible companion roster');
assert.match(park,/info\.raw===0\?'Slapend/,'level zero has a distinct dormant state');
assert.match(parkCss,/\.p31-slot-art img\{object-fit:contain/,'all roster characters use uncropped transparent framing');
assert.match(parkCss,/\.p31-modal-art img\{object-fit:contain/,'all detail characters use uncropped transparent framing');

assert.match(home,/const missionCompleted=completeGratitudeMission\(todayStr\(\)\)/,'Home gratitude entry auto-completes the mission');
assert.match(character,/toggleDailyQuest\(gratitudeQuest,sd\)/,'dated Character gratitude entry auto-completes the matching mission');
assert.match(home,/className='grat-cloud-row'/,'gratitude words themselves are arranged into cloud rows');

assert.match(home,/goal-quests\.js\?v=1\.0/,'Home loads Command Quests');
assert.match(home,/id="goalQuestCards"/,'Home mounts Command Quests');
assert.match(xp,/rpg_goal_quests_v1/,'Command Quests are in the canonical synced state scope');

const store={};
const localStorage={getItem:k=>store[k]||null,setItem:(k,v)=>{store[k]=String(v);}};
const window={addEventListener(){},dispatchEvent(){},crypto:null};
const document={readyState:'loading',addEventListener(){},getElementById(){return null;}};
const sandbox={window,document,localStorage,CustomEvent:function(){},Date,Math,JSON,String,Array,Object,setTimeout};
vm.runInNewContext(read('goal-quests.js'),sandbox,{filename:'goal-quests.js'});
assert.equal(window.GamenfyGoalQuests.period('weekly',new Date(2026,8,13)),'2026-09-07','weekly quest rolls over on local Monday');
assert.equal(window.GamenfyGoalQuests.due('weekly',new Date(2026,8,13)),'2026-09-13','weekly quest is due Sunday');
assert.equal(window.GamenfyGoalQuests.period('monthly',new Date(2026,8,13)),'2026-09','monthly quest uses a calendar-month period');
assert.equal(window.GamenfyGoalQuests.due('monthly',new Date(2026,8,13)),'2026-09-30','monthly quest uses the calendar month end');

assert.match(fitbit,/client_status=1/,'client can read owner-scoped Fitbit connection status');
assert.match(fitbit,/client_reauth=1/,'client can request a one-time Fitbit OAuth recovery link');
assert.match(fitbit,/gamenfyAuthHeaders/,'Fitbit recovery uses the authenticated Gamenfy session');
assert.match(character,/gamenfyReconnectFitbit\(this\)/,'stale Body data offers direct reconnect');

console.log('Sept 13 feedback smoke: privacy, instant L1, full artwork, gratitude, Command Quests and Fitbit recovery are wired.');
