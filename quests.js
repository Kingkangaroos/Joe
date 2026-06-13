// =============================================================
// Gamenfy — Quest ladders per skill.
// Quests are OPTIONAL level-gated challenges that make a skill fun.
// They unlock as your skill level rises (the level you reach by
// logging XP). Completing a quest is a one-off win that also grants
// a chunk of XP. Each quest has: lvl (unlock level), title, desc, xp.
//
// Design principle: each ladder maps to a realistic progression for
// that skill — beginner-friendly at the bottom, genuinely demanding
// near the top. Kept concrete so "what do I actually do" is obvious.
// =============================================================
(function () {
  'use strict';

  const QUESTS = {
    // ───────────── BODY ─────────────
    tennis: [
      { lvl: 1,  title: 'First Rally',          desc: 'Hit 10 balls in a row against a wall.',                      xp: 40 },
      { lvl: 3,  title: 'Club Night',           desc: 'Show up to one social tennis evening at a club.',            xp: 80 },
      { lvl: 5,  title: 'Ball Machine Drill',   desc: 'Do a full 30-min ball-machine / cannon session.',            xp: 120 },
      { lvl: 10, title: 'First Set',            desc: 'Play a full set against a real opponent.',                   xp: 200 },
      { lvl: 20, title: 'Serve & Volley',       desc: 'Win 5 points in one match purely serve-and-volley.',         xp: 350 },
      { lvl: 35, title: 'Tournament Entry',     desc: 'Enter a local amateur tournament.',                          xp: 600 },
      { lvl: 50, title: 'Ranked Player',        desc: 'Earn an official club / league ranking.',                    xp: 1000 },
      { lvl: 75, title: 'Tournament Win',       desc: 'Win a bracket at any sanctioned tournament.',                xp: 2000 },
    ],
    gym: [
      { lvl: 1,  title: 'Walk In',              desc: 'Complete your first logged workout.',                        xp: 40 },
      { lvl: 5,  title: 'Bodyweight Bench',     desc: 'Bench press your own bodyweight for 1 rep.',                 xp: 200 },
      { lvl: 10, title: 'Plate Club',           desc: 'Deadlift 100 kg.',                                           xp: 350 },
      { lvl: 25, title: '1.5x Squat',           desc: 'Squat 1.5× bodyweight.',                                     xp: 700 },
      { lvl: 40, title: '2x Deadlift',          desc: 'Deadlift 2× bodyweight.',                                    xp: 1200 },
      { lvl: 60, title: 'Iron Discipline',      desc: '100 logged workouts total.',                                 xp: 2000 },
    ],
    calisthenics: [
      { lvl: 1,  title: 'First Pull-up',        desc: 'One clean dead-hang pull-up.',                               xp: 60 },
      { lvl: 5,  title: 'Dip Master',           desc: '10 strict parallel-bar dips.',                               xp: 150 },
      { lvl: 10, title: 'Pistol Squat',         desc: 'One full pistol squat each leg.',                            xp: 300 },
      { lvl: 20, title: 'Muscle-up',            desc: 'Your first bar muscle-up.',                                  xp: 600 },
      { lvl: 35, title: 'Handstand Hold',       desc: 'Free-standing handstand for 10 seconds.',                    xp: 900 },
      { lvl: 50, title: 'L-sit to Handstand',   desc: 'Press from L-sit to handstand.',                             xp: 1400 },
      { lvl: 75, title: 'Planche Lean',         desc: 'Hold a tuck planche for 5 seconds.',                         xp: 2500 },
    ],
    core: [
      { lvl: 1,  title: 'Plank Start',          desc: 'Hold a plank for 30 seconds.',                               xp: 40 },
      { lvl: 5,  title: 'Two-Minute Plank',     desc: 'Hold a plank for 2 minutes.',                                xp: 150 },
      { lvl: 15, title: 'Hanging Knee Raises',  desc: '15 strict hanging knee raises.',                             xp: 300 },
      { lvl: 30, title: 'Toes to Bar',          desc: '10 toes-to-bar reps.',                                       xp: 600 },
      { lvl: 50, title: 'L-sit 30s',            desc: 'Hold an L-sit for 30 seconds.',                              xp: 1000 },
      { lvl: 75, title: 'Dragon Flag',          desc: 'One full dragon flag.',                                      xp: 2000 },
    ],
    mobility: [
      { lvl: 1,  title: 'Touch Your Toes',      desc: 'Reach your toes with straight legs.',                        xp: 40 },
      { lvl: 10, title: 'Deep Squat Hold',      desc: 'Sit in a flat-foot deep squat for 2 min.',                   xp: 200 },
      { lvl: 25, title: 'Pancake Progress',     desc: 'Chest toward floor in a straddle pancake.',                  xp: 500 },
      { lvl: 50, title: 'Bridge Up',            desc: 'Push up into a full back bridge.',                           xp: 900 },
      { lvl: 75, title: 'The Splits',           desc: 'Full front splits, both sides.',                             xp: 1800 },
    ],
    endurance: [
      { lvl: 1,  title: 'First 5K',             desc: 'Run 5 km without stopping.',                                 xp: 100 },
      { lvl: 10, title: 'Sub-30 5K',            desc: 'Run 5 km under 30 minutes.',                                 xp: 300 },
      { lvl: 25, title: '10K Club',             desc: 'Complete a 10 km run.',                                      xp: 600 },
      { lvl: 50, title: 'Half Marathon',        desc: 'Finish a 21 km run.',                                        xp: 1500 },
      { lvl: 80, title: 'Marathon',             desc: 'Finish a full 42 km marathon.',                              xp: 3000 },
    ],

    // ───────────── MIND ─────────────
    reading: [
      { lvl: 1,  title: 'Open a Book',          desc: 'Read for 20 minutes today.',                                 xp: 40 },
      { lvl: 5,  title: 'First Finish',         desc: 'Finish one full book.',                                      xp: 200 },
      { lvl: 15, title: 'Five Shelf',           desc: 'Finish 5 books total.',                                      xp: 500 },
      { lvl: 35, title: 'Genre Hopper',         desc: 'Finish books in 4 different genres.',                        xp: 900 },
      { lvl: 60, title: 'Library of 25',        desc: 'Finish 25 books total.',                                     xp: 2000 },
    ],
    deep_work: [
      { lvl: 1,  title: 'One Focus Block',      desc: 'A single 25-min phone-free focus block.',                    xp: 40 },
      { lvl: 10, title: 'Deep Hour',            desc: 'One uninterrupted 90-min deep work block.',                  xp: 250 },
      { lvl: 30, title: 'Flow Week',            desc: '5 deep blocks in one week.',                                 xp: 700 },
      { lvl: 60, title: 'Deep Master',          desc: '100 logged deep work sessions.',                             xp: 2000 },
    ],
    meditation: [
      { lvl: 1,  title: 'Sit Still',            desc: 'Meditate for 5 minutes.',                                    xp: 40 },
      { lvl: 10, title: 'Daily Ten',            desc: 'Meditate 10 min for 7 days straight.',                       xp: 250 },
      { lvl: 30, title: 'Half Hour',            desc: 'One 30-minute sit.',                                         xp: 600 },
      { lvl: 60, title: 'Retreat',              desc: 'A full silent half-day (4h).',                               xp: 1800 },
    ],

    // ───────────── BUSINESS ─────────────
    sales: [
      { lvl: 1,  title: 'First Pitch',          desc: 'Pitch an idea or product to one person.',                   xp: 60 },
      { lvl: 10, title: 'First Yes',            desc: 'Close your first deal / sale.',                              xp: 300 },
      { lvl: 30, title: 'Ten Closed',           desc: 'Close 10 deals total.',                                      xp: 800 },
      { lvl: 60, title: 'Rainmaker',            desc: 'Hit a personal revenue milestone you set.',                  xp: 2500 },
    ],

    // ───────────── LIFESTYLE ─────────────
    dating: [
      { lvl: 1,  title: 'Say Hi',               desc: 'Start a conversation with someone new.',                     xp: 40 },
      { lvl: 3,  title: 'Social Reps',           desc: 'Go to a social event (e.g. club tennis night) and meet people.', xp: 80 },
      { lvl: 5,  title: 'The Ask',              desc: 'Ask someone out (any outcome counts).',                      xp: 150 },
      { lvl: 10, title: 'Five Strangers',       desc: 'Go out and genuinely talk to 5 new people in one night.',    xp: 300 },
      { lvl: 20, title: 'First Date',           desc: 'Go on a real planned date.',                                 xp: 500 },
      { lvl: 40, title: 'Three Dates',          desc: 'See the same person for a 3rd date.',                        xp: 900 },
    ],
    cooking: [
      { lvl: 1,  title: 'Cook One Meal',        desc: 'Cook a meal from scratch.',                                  xp: 40 },
      { lvl: 10, title: 'Signature Dish',       desc: 'Master one dish you can make blind.',                        xp: 250 },
      { lvl: 30, title: 'Dinner Host',          desc: 'Cook a 3-course meal for guests.',                           xp: 700 },
      { lvl: 60, title: 'Recipe Book',          desc: 'Master 50 distinct recipes.',                                xp: 2000 },
    ],
    social: [
      { lvl: 1,  title: 'Reach Out',            desc: 'Message a friend you haven\u2019t seen in a while.',          xp: 40 },
      { lvl: 10, title: 'Host Night',           desc: 'Organise a hangout for 3+ friends.',                         xp: 250 },
      { lvl: 30, title: 'Wide Circle',          desc: 'Maintain 5 close friendships actively.',                     xp: 700 },
    ],

    // ───────────── KNOWLEDGE ─────────────
    languages: [
      { lvl: 1,  title: 'First Words',          desc: 'Learn 20 words in a new language.',                          xp: 60 },
      { lvl: 10, title: 'Small Talk',           desc: 'Hold a 2-minute basic conversation.',                        xp: 300 },
      { lvl: 30, title: 'Order & Ask',          desc: 'Get through a whole day abroad in the language.',            xp: 800 },
      { lvl: 50, title: 'Watch Without Subs',   desc: 'Watch a film with no subtitles and follow it.',              xp: 1400 },
      { lvl: 75, title: 'Fluent Debate',        desc: 'Hold a 30-min deep conversation fluently.',                  xp: 2500 },
    ],
    piano: [
      { lvl: 1,  title: 'First Notes',          desc: 'Play a simple melody with both hands.',                      xp: 60 },
      { lvl: 10, title: 'First Song',           desc: 'Play one full song from memory.',                            xp: 300 },
      { lvl: 30, title: 'Five Songs',           desc: 'Build a 5-song repertoire.',                                 xp: 800 },
      { lvl: 60, title: 'Perform Live',         desc: 'Play for an audience, however small.',                       xp: 2000 },
    ],
    learning: [
      { lvl: 1,  title: 'Start a Course',       desc: 'Begin any structured online course.',                        xp: 40 },
      { lvl: 10, title: 'First Certificate',    desc: 'Complete one course fully.',                                 xp: 300 },
      { lvl: 40, title: 'Stack Three',          desc: 'Complete 3 courses.',                                        xp: 1000 },
    ],

    // ───────────── CORE / NEW SKILLS ─────────────
    whistling: [
      { lvl: 1,  title: 'Make a Sound',         desc: 'Produce any clear note with fingers in your mouth.',         xp: 60 },
      { lvl: 5,  title: 'Loud & Clear',         desc: 'Whistle loud enough to turn heads across a room.',           xp: 200 },
      { lvl: 15, title: 'On Command',           desc: 'Whistle reliably 9 out of 10 tries.',                        xp: 400 },
      { lvl: 30, title: 'Two-Tone',             desc: 'Whistle two distinct pitches on demand.',                    xp: 800 },
      { lvl: 50, title: 'Call the Dog',         desc: 'Whistle a tune someone can recognise.',                      xp: 1500 },
    ],
    dancing: [
      { lvl: 1,  title: 'Find the Beat',        desc: 'Move on-beat to a full song.',                               xp: 60 },
      { lvl: 5,  title: 'One Routine',          desc: 'Learn a short choreographed sequence.',                      xp: 200 },
      { lvl: 15, title: 'Floor Confidence',     desc: 'Dance at a party fully sober and unbothered.',               xp: 400 },
      { lvl: 30, title: 'Partner Up',           desc: 'Lead or follow a partner dance for one song.',               xp: 800 },
      { lvl: 50, title: 'Own the Floor',        desc: 'Freestyle for a full song and enjoy it.',                    xp: 1500 },
    ],
  };

  window.RPG_QUESTS = QUESTS;

  // Storage of completed quests: { "skill:lvl": true }
  const QC_KEY = 'rpg_quests_done_v1';
  window.getQuestsDone = function () {
    try { return JSON.parse(localStorage.getItem(QC_KEY)) || {}; } catch (e) { return {}; }
  };
  window.setQuestDone = function (skill, lvl, done) {
    const all = window.getQuestsDone();
    const k = skill + ':' + lvl;
    if (done) all[k] = true; else delete all[k];
    try { localStorage.setItem(QC_KEY, JSON.stringify(all)); } catch (e) {}
    return all;
  };
})();
