from pathlib import Path
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
if old_assert not in s: raise SystemExit('old fetch URL assertion missing')
s=s.replace(old_assert,new_assert,1)
p.write_text(s)
print('autohabit test fixture adapted')
