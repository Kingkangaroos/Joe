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
    // ───────────── MONEY ─────────────
    saving: [
      { lvl: 1,  title: 'First €100 Saved',     desc: 'Set aside your first €100 on purpose.',                      xp: 60 },
      { lvl: 10, title: 'One Month Buffer',     desc: 'Save one month of expenses.',                                xp: 300 },
      { lvl: 30, title: 'Emergency Fund',       desc: 'Build a 3-month emergency fund.',                            xp: 900 },
      { lvl: 60, title: 'Six Months Safe',      desc: '6 months of runway in the bank.',                            xp: 2000 },
    ],
    investing: [
      { lvl: 1,  title: 'First Position',       desc: 'Make your first investment, any size.',                      xp: 80 },
      { lvl: 10, title: 'Diversified',          desc: 'Hold 3+ different assets/funds.',                            xp: 300 },
      { lvl: 30, title: 'Auto-Invest',          desc: 'Set up an automatic monthly investment.',                    xp: 700 },
      { lvl: 60, title: 'Portfolio Builder',    desc: 'Reach an invested-capital milestone you set.',               xp: 2500 },
    ],
    budgeting: [
      { lvl: 1,  title: 'Track One Week',       desc: 'Log every expense for 7 days.',                              xp: 60 },
      { lvl: 10, title: 'Monthly Budget',       desc: 'Run a full month on a written budget.',                      xp: 300 },
      { lvl: 30, title: 'Cut the Fat',          desc: 'Cancel 3 subscriptions you don\u2019t use.',                  xp: 500 },
      { lvl: 50, title: 'Zero-Based',           desc: 'Give every euro a job for a full month.',                    xp: 1000 },
    ],
    net_worth: [
      { lvl: 1,  title: 'Know Your Number',     desc: 'Calculate your current net worth.',                          xp: 60 },
      { lvl: 10, title: 'In the Black',         desc: 'Reach a positive net worth.',                                xp: 400 },
      { lvl: 40, title: 'First €10k',           desc: 'Cross €10k net worth.',                                      xp: 1200 },
      { lvl: 70, title: 'Six Figures',          desc: 'Cross €100k net worth.',                                     xp: 3000 },
    ],

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
    stretching: [
      { lvl: 1,  title: 'Touch Your Toes',      desc: 'Reach your toes with straight legs.',                        xp: 40 },
      { lvl: 10, title: 'Deep Squat Hold',      desc: 'Sit in a flat-foot deep squat for 2 min.',                   xp: 200 },
      { lvl: 25, title: 'Pancake Progress',     desc: 'Chest toward floor in a straddle pancake.',                  xp: 500 },
      { lvl: 50, title: 'Bridge Up',            desc: 'Push up into a full back bridge.',                           xp: 900 },
      { lvl: 75, title: 'The Splits',           desc: 'Full front splits, both sides.',                             xp: 1800 },
    ],
    recovery: [
      { lvl: 1,  title: 'First 5K',             desc: 'Run 5 km without stopping.',                                 xp: 100 },
      { lvl: 10, title: 'Sub-30 5K',            desc: 'Run 5 km under 30 minutes.',                                 xp: 300 },
      { lvl: 25, title: '10K Club',             desc: 'Complete a 10 km run.',                                      xp: 600 },
      { lvl: 50, title: 'Half Marathon',        desc: 'Finish a 21 km run.',                                        xp: 1500 },
      { lvl: 80, title: 'Marathon',             desc: 'Finish a full 42 km marathon.',                              xp: 3000 },
    ],
    strength: [
      { lvl: 1,  title: 'Find Your Baseline',   desc: 'Log a 1-rep max for one big lift.',                          xp: 60 },
      { lvl: 10, title: 'Bodyweight Bench',     desc: 'Bench press your bodyweight.',                               xp: 300 },
      { lvl: 25, title: 'Overhead Press BW',    desc: 'Strict overhead press 0.75× bodyweight.',                    xp: 600 },
      { lvl: 45, title: 'The 1000lb Club',      desc: 'Squat + bench + deadlift total of 450 kg.',                  xp: 1500 },
      { lvl: 70, title: 'Elite Total',          desc: 'Hit a powerlifting total you set as a stretch goal.',        xp: 2800 },
    ],

    // ───────────── MIND ─────────────
    reading: [
      { lvl: 1,  title: 'Open a Book',          desc: 'Read for 20 minutes today.',                                 xp: 40 },
      { lvl: 5,  title: 'First Finish',         desc: 'Finish one full book.',                                      xp: 200 },
      { lvl: 15, title: 'Five Shelf',           desc: 'Finish 5 books total.',                                      xp: 500 },
      { lvl: 35, title: 'Genre Hopper',         desc: 'Finish books in 4 different genres.',                        xp: 900 },
      { lvl: 60, title: 'Library of 25',        desc: 'Finish 25 books total.',                                     xp: 2000 },
    ],
    focus: [
      { lvl: 1,  title: 'One Focus Block',      desc: 'A single 25-min phone-free focus block.',                    xp: 40 },
      { lvl: 10, title: 'Deep Hour',            desc: 'One uninterrupted 90-min deep work block.',                  xp: 250 },
      { lvl: 30, title: 'Flow Week',            desc: '5 deep blocks in one week.',                                 xp: 700 },
      { lvl: 60, title: 'Deep Master',          desc: '100 logged deep work sessions.',                             xp: 2000 },
    ],
    journaling: [
      { lvl: 1,  title: 'First Entry',          desc: 'Write one journal entry today.',                             xp: 40 },
      { lvl: 10, title: 'Seven Day Streak',     desc: 'Journal every day for a week.',                              xp: 250 },
      { lvl: 30, title: 'Month of Pages',       desc: '30 journal entries logged.',                                 xp: 700 },
      { lvl: 60, title: 'The Archive',          desc: '100 entries — a record of your growth.',                     xp: 2000 },
    ],

    // ───────────── BUSINESS ─────────────
    sales: [
      { lvl: 1,  title: 'First Pitch',          desc: 'Pitch an idea or product to one person.',                   xp: 60 },
      { lvl: 10, title: 'First Yes',            desc: 'Close your first deal / sale.',                              xp: 300 },
      { lvl: 30, title: 'Ten Closed',           desc: 'Close 10 deals total.',                                      xp: 800 },
      { lvl: 60, title: 'Rainmaker',            desc: 'Hit a personal revenue milestone you set.',                  xp: 2500 },
    ],
    marketing: [
      { lvl: 1,  title: 'First Post',           desc: 'Publish one piece of content publicly.',                     xp: 40 },
      { lvl: 10, title: 'Consistent Voice',     desc: 'Post 10 times on one channel.',                              xp: 300 },
      { lvl: 30, title: 'First 1k Views',       desc: 'Get a post past 1,000 views.',                               xp: 700 },
      { lvl: 60, title: 'Audience Built',       desc: 'Reach a follower milestone you set.',                        xp: 2000 },
    ],
    ai_tools: [
      { lvl: 1,  title: 'First Automation',     desc: 'Automate one repetitive task with AI.',                      xp: 60 },
      { lvl: 10, title: 'Daily Driver',         desc: 'Use AI tools in your workflow every day for a week.',        xp: 300 },
      { lvl: 30, title: 'Pipeline Builder',     desc: 'Chain tools into one automated pipeline.',                   xp: 800 },
      { lvl: 60, title: 'Agent Architect',      desc: 'Build an autonomous agent that does real work.',             xp: 2500 },
    ],
    coding: [
      { lvl: 1,  title: 'Hello World',          desc: 'Write and run your first script.',                           xp: 60 },
      { lvl: 10, title: 'Ship a Page',          desc: 'Put a working site live (this dashboard counts!).',          xp: 300 },
      { lvl: 20, title: 'Connect an API',       desc: 'Fetch and display real data from an API.',                   xp: 500 },
      { lvl: 40, title: 'Full Stack',           desc: 'Build something with a database behind it.',                 xp: 1200 },
      { lvl: 70, title: 'Ship a Product',       desc: 'Launch an app real people use.',                             xp: 3000 },
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
    planning: [
      { lvl: 1,  title: 'Plan Tomorrow',        desc: 'Write tomorrow\u2019s plan tonight.',                         xp: 40 },
      { lvl: 10, title: 'Weekly Review',        desc: 'Do a full weekly planning session.',                         xp: 250 },
      { lvl: 30, title: 'Quarter Vision',       desc: 'Set and write 90-day goals.',                                xp: 700 },
      { lvl: 60, title: 'Life OS',              desc: 'Run your whole life from your own system for a month.',      xp: 2000 },
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
    content: [
      { lvl: 1,  title: 'First Upload',         desc: 'Create and publish one video / reel / post.',                xp: 60 },
      { lvl: 10, title: 'Ten Pieces',           desc: 'Publish 10 pieces of content.',                              xp: 300 },
      { lvl: 30, title: 'Viral Moment',         desc: 'One piece breaks 10k views.',                                xp: 900 },
      { lvl: 60, title: 'Creator',              desc: 'Build a real audience around your content.',                 xp: 2500 },
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
