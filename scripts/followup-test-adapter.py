from pathlib import Path

# Retrospective fixture: record and answer the explicit-owner Supabase query.
p=Path('tests/autohabit-retrospective-smoke.js')
s=p.read_text()
s=s.replace("const fetchUrls = [];\n", "const cloudQueries = [];\n")
old="""  gamenfyAuthedFetch: async url => {
    fetchUrls.push(url);
    return {
      ok: true,
      json: async () => [
        { key: 'health_fitbit', data: healthData, updated_at: '2026-09-03T11:15:15.789Z' },
        { key: 'rpg', data: currentRemoteRpg(), updated_at: '2026-09-03T11:12:10.174Z' }
      ]
    };
  },
"""
new="""  gamenfyUserId: 'owner-1',
  gamenfySupabase: {
    from(table) {
      const query = {
        table, selected: null, owner: null,
        select(cols) { this.selected = cols; return this; },
        eq(col, value) { if (col === 'user_id') this.owner = value; return this; },
        in(col, values) {
          cloudQueries.push({ table: this.table, selected: this.selected, owner: this.owner, col, values: Array.from(values) });
          return Promise.resolve({ data: [
            { key: 'health_fitbit', data: healthData, updated_at: '2026-09-03T11:15:15.789Z' },
            { key: 'rpg', data: currentRemoteRpg(), updated_at: '2026-09-03T11:12:10.174Z' }
          ], error: null });
        }
      };
      return query;
    }
  },
"""
if old not in s: raise SystemExit('autohabit retrospective raw fetch fixture missing')
s=s.replace(old,new,1)
old_assert="  assert.ok(fetchUrls[0].includes('key=in.(health_fitbit,rpg)'), 'health and current RPG cloud baseline are fetched together');"
new_assert="""  assert.deepEqual(cloudQueries[0], { table:'app_state', selected:'key,data,updated_at', owner:'owner-1', col:'key', values:['health_fitbit','rpg'] }, 'health and RPG baseline are read together through an explicit-owner Supabase query');"""
if old_assert not in s: raise SystemExit('old retrospective fetch URL assertion missing')
s=s.replace(old_assert,new_assert,1)
p.write_text(s)

# XP exactly-once fixture: preserve the crash/retry scenarios, change only cloud transport.
p=Path('tests/autohabit-xp-ledger-smoke.js')
s=p.read_text()
old="""    gamenfyAuthReady:Promise.resolve(),
    getCharacter:()=>({xpLog:xpRows}),
    gamenfyAuthedFetch:async()=>({ok:true,json:async()=>[
      {key:'health_fitbit',data:{[DAY]:health},updated_at:'2026-09-03T11:15:15.789Z'},
      {key:'rpg',data:remoteRpg(),updated_at:'2026-09-03T11:12:10.174Z'}
    ]}),
"""
new="""    gamenfyAuthReady:Promise.resolve(),
    gamenfyUserId:'owner-1',
    gamenfySupabase:{
      from(table){return{
        select(){return this;},
        eq(){return this;},
        in(){return Promise.resolve({data:[
          {key:'health_fitbit',data:{[DAY]:health},updated_at:'2026-09-03T11:15:15.789Z'},
          {key:'rpg',data:remoteRpg(),updated_at:'2026-09-03T11:12:10.174Z'}
        ],error:null});}
      };}
    },
    getCharacter:()=>({xpLog:xpRows}),
"""
if old not in s: raise SystemExit('XP ledger raw fetch fixture missing')
s=s.replace(old,new,1)
p.write_text(s)

# Manual toggle integration fixture: same mission/XP behavior, owner-scoped cloud baseline.
p=Path('tests/fitbit-manual-toggle-cycle-smoke.js')
s=p.read_text()
old="""  gamenfyAuthReady:Promise.resolve(),
  getCharacter:()=>({xpLog:xpRows}),
  recomputeHabitFromLog(){},
  renderMissions(){},renderCharStrip(){},renderStreakPill(){},renderCheckinCard(){},renderArc(){},
  Streak:{},
  toggleMission(){},
  addXP(key,amount,reason){xpCalls.push({key,amount,reason});xpRows.unshift({skill:key,amount,reason,date:DAY});},
  gamenfyAuthedFetch:async()=>({
    ok:true,
    json:async()=>[
      {key:'health_fitbit',data:{[DAY]:{steps:12000,sleepMinutes:0}},updated_at:new Date().toISOString()},
      {key:'rpg',data:{
        rpg_autohabit_v1:JSON.parse(localStorage.getItem('rpg_autohabit_v1')||'{}'),
        rpg_habitlog_v1:JSON.parse(localStorage.getItem('rpg_habitlog_v1')||'{}'),
        rpg_streak_v1:JSON.parse(localStorage.getItem('rpg_streak_v1')||'{\"days\":{}}')
      },updated_at:new Date(Date.now()-1000).toISOString()}
    ]
  })
"""
new="""  gamenfyAuthReady:Promise.resolve(),
  gamenfyUserId:'owner-1',
  gamenfySupabase:{
    from(table){return{
      select(){return this;},
      eq(){return this;},
      in(){return Promise.resolve({data:[
        {key:'health_fitbit',data:{[DAY]:{steps:12000,sleepMinutes:0}},updated_at:new Date().toISOString()},
        {key:'rpg',data:{
          rpg_autohabit_v1:JSON.parse(localStorage.getItem('rpg_autohabit_v1')||'{}'),
          rpg_habitlog_v1:JSON.parse(localStorage.getItem('rpg_habitlog_v1')||'{}'),
          rpg_streak_v1:JSON.parse(localStorage.getItem('rpg_streak_v1')||'{\"days\":{}}')
        },updated_at:new Date(Date.now()-1000).toISOString()}
      ],error:null});}
    };}
  },
  getCharacter:()=>({xpLog:xpRows}),
  recomputeHabitFromLog(){},
  renderMissions(){},renderCharStrip(){},renderStreakPill(){},renderCheckinCard(){},renderArc(){},
  Streak:{},
  toggleMission(){},
  addXP(key,amount,reason){xpCalls.push({key,amount,reason});xpRows.unshift({skill:key,amount,reason,date:DAY});}
"""
if old not in s: raise SystemExit('manual toggle raw fetch fixture missing')
s=s.replace(old,new,1)
p.write_text(s)

print('all autohabit test fixtures adapted')
