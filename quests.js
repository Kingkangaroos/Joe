// =============================================================
// Gamenfy — Quest ladders per skill  (v4.6 — expanded)
// Quests are OPTIONAL level-gated challenges that make a skill fun.
// They unlock as your skill level rises. Completing one is a one-off
// win that also grants XP. Each: { lvl, title, desc, xp }.
//
// Design: dense early levels (1-10) so there's always a next step,
// then meaningful checkpoints all the way to 100. Concrete and
// realistic — "what do I actually do" is always obvious.
// =============================================================
(function () {
  'use strict';

  const QUESTS = {
    // ───────────── MONEY ─────────────
    saving: [
      { lvl: 2,  title: 'Open a Savings Pot',   desc: 'Create a separate account just for savings.',                xp: 50 },
      { lvl: 4,  title: 'Auto-Transfer',        desc: 'Auto-move a fixed amount on payday — pay yourself first.',    xp: 100 },
      { lvl: 7,  title: 'No-Spend Day',         desc: 'Get through a full day spending €0.',                        xp: 80 },
      { lvl: 12, title: 'One Month Buffer',     desc: 'Save one month of expenses.',                                xp: 250 },
      { lvl: 25, title: 'Emergency Fund',       desc: 'Build a 3-month emergency fund.',                            xp: 700 },
      { lvl: 40, title: 'Half-Year Safe',       desc: '6 months of runway in the bank.',                            xp: 1300 },
      { lvl: 60, title: 'One Year Free',        desc: '12 months of expenses saved.',                               xp: 2400 },
      { lvl: 80, title: 'Save 30%',             desc: 'Save 30%+ of income for 6 straight months.',                 xp: 3500 },
      { lvl: 100,title: 'Two-Year Cushion',     desc: '2+ years of runway — total peace of mind.',                  xp: 6000 },
    ],
    investing: [
      { lvl: 2,  title: 'Open a Broker',        desc: 'Open an account (DEGIRO / Trade Republic). Just the account.',  xp: 80 },
      { lvl: 5,  title: 'Buy Your First ETF',    desc: 'Invest €50-100 in a world index ETF (IWDA / VWCE).',         xp: 150 },
      { lvl: 9,  title: 'Set Auto-Invest',       desc: 'Schedule an automatic monthly deposit, even €25.',           xp: 250 },
      { lvl: 14, title: 'Learn Index Investing', desc: 'Understand why broad index ETFs beat picking stocks.',        xp: 300 },
      { lvl: 20, title: 'Diversify',             desc: 'Hold a globally diversified portfolio (not one country/sector).', xp: 450 },
      { lvl: 26, title: 'Hold Through a Dip',    desc: 'Sit through a market drop without selling. The real test.',   xp: 600 },
      { lvl: 33, title: 'Rebalance on Plan',   desc: 'Trim or add positions per your plan \u2014 not emotion, not panic.', xp: 700 },
      { lvl: 42, title: 'Understand FIRE',       desc: 'Grasp the 4% rule & how dividends/compounding fund freedom.', xp: 900 },
      { lvl: 50, title: '€25k Invested',         desc: 'Reach €25,000 invested capital.',                            xp: 1400 },
      { lvl: 65, title: 'Tax-Smart',             desc: 'Use tax-efficient accounts/allowances where you live.',       xp: 2000 },
      { lvl: 80, title: 'Six Figures',           desc: 'Cross €100,000 invested.',                                   xp: 3500 },
      { lvl: 100,title: 'Financial Independence', desc: 'Investments could cover your living costs.',                  xp: 6000 },
    ],
    budgeting: [
      { lvl: 1,  title: 'Track One Day',        desc: 'Log every expense for 24 hours.',                            xp: 30 },
      { lvl: 3,  title: 'Track One Week',       desc: 'Log every expense for 7 days.',                              xp: 80 },
      { lvl: 6,  title: 'Know Your Burn',       desc: 'Calculate your average monthly spend.',                      xp: 120 },
      { lvl: 10, title: 'Monthly Budget',       desc: 'Run a full month on a written budget.',                      xp: 250 },
      { lvl: 15, title: 'Cut the Fat',          desc: 'Cancel 3 subscriptions you dont use.',                       xp: 300 },
      { lvl: 25, title: 'Zero-Based',           desc: 'Give every euro a job for a full month.',                    xp: 600 },
      { lvl: 40, title: '50/30/20',             desc: 'Hit a needs/wants/savings split for 3 months.',              xp: 1000 },
      { lvl: 60, title: 'Budget on Autopilot',  desc: 'Run 6 months without overspending.',                         xp: 2000 },
      { lvl: 85, title: 'Money Master',         desc: 'A full year fully on-budget.',                               xp: 4000 },
    ],
    net_worth: [
      { lvl: 1,  title: 'Know Your Number',     desc: 'Calculate your current net worth.',                          xp: 50 },
      { lvl: 5,  title: 'Track It Monthly',     desc: 'Log your net worth 3 months running.',                       xp: 120 },
      { lvl: 12, title: 'In the Black',         desc: 'Reach a positive net worth.',                                xp: 300 },
      { lvl: 25, title: 'First €10k',           desc: 'Cross €10k net worth.',                                      xp: 700 },
      { lvl: 40, title: '€25k Club',            desc: 'Cross €25k net worth.',                                      xp: 1200 },
      { lvl: 55, title: '€50k Club',            desc: 'Cross €50k net worth.',                                      xp: 2000 },
      { lvl: 75, title: 'Six Figures',          desc: 'Cross €100k net worth.',                                     xp: 3500 },
      { lvl: 90, title: 'Quarter Million',      desc: 'Cross €250k net worth.',                                     xp: 6000 },
      { lvl: 100,title: 'Millionaire',          desc: 'Cross €1,000,000 net worth.',                                xp: 12000 },
    ],

    // ───────────── BODY ─────────────
    tennis: [
      { lvl: 1,  title: 'First Rally',          desc: 'Hit 10 balls in a row against a wall.',                      xp: 40 },
      { lvl: 2,  title: 'Grip & Stance',        desc: 'Learn the proper forehand grip and ready position.',         xp: 50 },
      { lvl: 3,  title: 'Club Night',           desc: 'Show up to one social tennis evening at a club.',            xp: 80 },
      { lvl: 4,  title: 'Backhand Reps',        desc: 'Hit 20 backhands in a row against a wall.',                  xp: 90 },
      { lvl: 5,  title: 'Ball Machine Drill',   desc: 'Do a full 30-min ball-machine / cannon session.',            xp: 120 },
      { lvl: 7,  title: 'First Serve In',       desc: 'Land 10 first serves in the box.',                           xp: 150 },
      { lvl: 10, title: 'First Set',            desc: 'Play a full set against a real opponent.',                   xp: 250 },
      { lvl: 15, title: 'Win a Set',            desc: 'Win a full set against someone.',                            xp: 350 },
      { lvl: 20, title: 'Serve & Volley',       desc: 'Win 5 points in one match serve-and-volley.',                xp: 450 },
      { lvl: 30, title: 'Beat a Regular',       desc: 'Beat someone who plays weekly.',                             xp: 700 },
      { lvl: 40, title: 'Tournament Entry',     desc: 'Enter a local amateur tournament.',                          xp: 1000 },
      { lvl: 55, title: 'Ranked Player',        desc: 'Earn an official club / league ranking.',                    xp: 1800 },
      { lvl: 75, title: 'Tournament Win',       desc: 'Win a bracket at any sanctioned tournament.',                xp: 3000 },
      { lvl: 90, title: 'Club Champion',        desc: 'Win your club championship.',                                xp: 5000 },
    ],
    gym: [
      { lvl: 1,  title: 'Walk In',              desc: 'Complete your first logged workout.',                                 xp: 40 },
      { lvl: 2,  title: 'Learn Your Six',       desc: 'Nail form on your six lifts: bench, row, press, hip thrust, pulldown, weighted core.', xp: 60 },
      { lvl: 3,  title: 'Three in a Week',      desc: 'Train 3 times in one week.',                                          xp: 100 },
      { lvl: 5,  title: 'Log Everything',       desc: '10 workouts fully logged in Hevy.',                                   xp: 200 },
      { lvl: 7,  title: 'Two-Week Streak',      desc: 'Train consistently for 2 full weeks.',                                xp: 180 },
      { lvl: 10, title: 'Month of Iron',        desc: '12 workouts inside one calendar month.',                              xp: 350 },
      { lvl: 15, title: 'Body Recomp',          desc: 'Notice your first visible muscle change.',                            xp: 300 },
      { lvl: 25, title: 'Quarter Consistent',   desc: 'Average 3 sessions per week for 12 straight weeks.',                  xp: 700 },
      { lvl: 40, title: 'Volume Milestone',     desc: '100,000 kg lifetime training volume in Hevy.',                        xp: 1200 },
      { lvl: 50, title: 'Century Club',         desc: '100 logged workouts total.',                                          xp: 1600 },
      { lvl: 70, title: 'Progressive Year',     desc: 'Estimated 1RM up on all six lifts vs 6 months ago.',                  xp: 2800 },
      { lvl: 90, title: 'Iron Veteran',         desc: '500 logged workouts \u2014 a lifestyle, not a phase.',               xp: 5000 },
    ],
    calisthenics: [
      // Newbie → Beginner
      { lvl: 3,  title: 'Newbie Base',           desc: '10 push-ups, 30 sec plank, 10 squats.',                     xp: 80 },
      { lvl: 8,  title: 'Twenty + Negatives',    desc: '20 push-ups, 60 sec plank, 3 negative pull-ups.',            xp: 200 },
      // Novice
      { lvl: 14, title: 'First Pull-up',         desc: '1 strict pull-up, 10 dips, 20 sec wall handstand.',          xp: 350 },
      // Athlete
      { lvl: 22, title: 'Five & L-sit',          desc: '5 pull-ups, 20 dips, 10 sec L-sit.',                        xp: 550 },
      // Strong
      { lvl: 30, title: 'Pistol + Handstand',    desc: '10 pull-ups, a pistol squat, 60 sec wall handstand.',        xp: 800 },
      // Advanced
      { lvl: 40, title: 'Free Handstand',        desc: 'Muscle-up prep, 15 pull-ups, 5 sec freestanding handstand.', xp: 1200 },
      // Elite
      { lvl: 52, title: 'First Muscle-up',       desc: '1 muscle-up, 30 sec L-sit, 10 sec tuck front lever.',        xp: 1800 },
      // Beast
      { lvl: 64, title: 'Five Muscle-ups',       desc: '5 muscle-ups, wall HSPU, advanced tuck lever.',              xp: 2600 },
      // Master
      { lvl: 78, title: 'Front Lever',           desc: '5 sec front lever, straddle planche lean, 30 sec handstand.', xp: 3800 },
      // Legend
      { lvl: 92, title: 'Planche Path',          desc: '15 sec front lever, planche progression, one-arm pull-up prep.', xp: 5500 },
      { lvl: 100,title: 'Legend',                desc: 'Full planche / front lever / one-arm pull-up.',              xp: 9000 },
    ],
    core: [
      { lvl: 1,  title: 'Plank Start',          desc: 'Hold a plank for 30 seconds.',                               xp: 40 },
      { lvl: 2,  title: 'Hollow Hold',          desc: 'Hold a hollow body for 20 seconds.',                         xp: 50 },
      { lvl: 4,  title: 'One-Minute Plank',     desc: 'Hold a plank for 60 seconds.',                               xp: 100 },
      { lvl: 6,  title: 'Two-Minute Plank',     desc: 'Hold a plank for 2 minutes.',                                xp: 180 },
      { lvl: 10, title: 'Hanging Knee Raises',  desc: '15 strict hanging knee raises.',                             xp: 300 },
      { lvl: 15, title: 'Side Plank Pair',       desc: '60-second side plank on each side.',                             xp: 350 },
      { lvl: 25, title: 'Hollow Minute',         desc: 'One unbroken 60-second hollow body hold.',                                   xp: 600 },
      { lvl: 30, title: 'Toes to Bar',          desc: '10 toes-to-bar reps.',                                       xp: 750 },
      { lvl: 50, title: 'L-sit 30s',            desc: 'Hold an L-sit for 30 seconds.',                              xp: 1200 },
      { lvl: 65, title: 'Hanging Leg Raise',    desc: '10 straight-leg hanging raises.',                            xp: 1600 },
      { lvl: 80, title: 'Dragon Flag',          desc: 'One full dragon flag.',                                      xp: 2500 },
      { lvl: 95, title: 'Front Lever Raises',   desc: 'Core strong enough for front-lever raises.',                 xp: 4000 },
    ],
    stretching: [
      { lvl: 1,  title: 'Touch Your Toes',      desc: 'Reach your toes with straight legs.',                        xp: 40 },
      { lvl: 3,  title: 'Daily 5',              desc: 'Stretch 5 min a day for a week.',                            xp: 90 },
      { lvl: 6,  title: 'Forward Fold',         desc: 'Flat palms to floor in a forward fold.',                     xp: 120 },
      { lvl: 10, title: 'Deep Squat Hold',      desc: 'Sit in a flat-foot deep squat for 2 min.',                   xp: 250 },
      { lvl: 18, title: 'Shoulder Opener',      desc: 'Clasp hands behind back, both sides.',                       xp: 350 },
      { lvl: 25, title: 'Pancake Progress',     desc: 'Chest toward floor in a straddle pancake.',                  xp: 500 },
      { lvl: 40, title: 'Bridge Up',            desc: 'Push up into a full back bridge.',                           xp: 900 },
      { lvl: 60, title: 'Half Splits Flat',     desc: 'Both half-splits flat to the ground.',                       xp: 1400 },
      { lvl: 80, title: 'The Splits',           desc: 'Full front splits, both sides.',                             xp: 2200 },
      { lvl: 95, title: 'Middle Splits',        desc: 'Full straddle / middle splits.',                             xp: 3500 },
    ],
    recovery: [
      { lvl: 1,  title: 'Rest Day Respect',     desc: 'Take one planned, full rest day this week.',                          xp: 40 },
      { lvl: 3,  title: 'Wind-Down',            desc: 'Screen-free for the last 30 minutes before bed, 3 nights.',           xp: 80 },
      { lvl: 6,  title: 'Seven Straight',       desc: '7 consecutive nights of 7+ hours sleep.',                             xp: 150 },
      { lvl: 12, title: 'Deload Learned',       desc: 'Complete a deliberate deload week after 6-8 weeks of training.',      xp: 300 },
      { lvl: 20, title: 'Sleep Month',          desc: '30-day average of 7+ hours sleep (Fitbit tracks this).',              xp: 500 },
      { lvl: 35, title: 'Active Recovery',      desc: '10 logged recovery sessions: mobility, walking or stretching only.',  xp: 900 },
      { lvl: 50, title: 'Resting Trend',        desc: 'Resting heart rate measurably down vs your 3-month baseline.',        xp: 1400 },
      { lvl: 70, title: 'Recovery Year',        desc: '12 months with a deload every 6-8 weeks and no overuse injury.',      xp: 2400 },
      { lvl: 90, title: 'Master of Rest',       desc: 'Bedtime consistent within \u00b130 minutes for 60 days.',            xp: 4000 },
    ],
    strength: [
      { lvl: 1,  title: 'Find Your Baseline',   desc: 'Log an estimated 1RM (Epley) for bench, row and press.',              xp: 60 },
      { lvl: 3,  title: 'Progressive Overload', desc: 'Add weight or reps to the same lift two weeks running.',              xp: 100 },
      { lvl: 6,  title: 'Half-BW Press',        desc: 'Strict overhead press 0.5\u00d7 bodyweight.',                        xp: 180 },
      { lvl: 10, title: 'Bodyweight Bench',     desc: 'Bench press 1.0\u00d7 bodyweight for 1 rep.',                        xp: 300 },
      { lvl: 18, title: 'Bodyweight Row',       desc: 'Bent-over row 1.0\u00d7 bodyweight.',                                xp: 500 },
      { lvl: 28, title: '1.25x Bench',          desc: 'Bench press 1.25\u00d7 bodyweight.',                                 xp: 800 },
      { lvl: 45, title: 'Double Hip Thrust',    desc: 'Hip thrust 2\u00d7 bodyweight.',                                     xp: 1500 },
      { lvl: 65, title: 'Advanced Push',        desc: 'Bench 1.5\u00d7 bodyweight or strict press 0.9\u00d7 bodyweight.',  xp: 2500 },
      { lvl: 85, title: 'Elite Upper',          desc: 'Bench 1.5\u00d7 AND row 1.3\u00d7 AND press 0.9\u00d7 bodyweight in the same month.', xp: 4500 },
    ],

    // ───────────── MIND ─────────────
    reading: [
      { lvl: 2,  title: 'Phone-Free 10',        desc: 'Read 10 minutes with your phone in another room.',           xp: 50 },
      { lvl: 5,  title: 'A Week Straight',       desc: 'Read every day for 7 days.',                                xp: 120 },
      { lvl: 10, title: 'First Finish',          desc: 'Finish one full book.',                                     xp: 250 },
      { lvl: 18, title: 'Summarise It',          desc: 'Write 5 bullet takeaways after a book.',                     xp: 350 },
      { lvl: 25, title: 'Five Done',             desc: 'Finish 5 books, each with a short summary.',                 xp: 550 },
      { lvl: 40, title: 'Apply a Lesson',        desc: 'Use something from a book in real life.',                    xp: 900 },
      { lvl: 50, title: 'Ten Deep',              desc: '10 books finished and applied.',                            xp: 1400 },
      { lvl: 60, title: 'Month-Later Recall',         desc: 'Explain a book\u2019s core argument a month after finishing it.',                xp: 1800 },
      { lvl: 75, title: 'Notes System',          desc: '25 books with a real notes/highlight system.',              xp: 2800 },
      { lvl: 90, title: 'Tackle the Hard Ones',  desc: 'Understand a genuinely difficult book.',                    xp: 4000 },
      { lvl: 100,title: 'Sage',                  desc: '100 books and you actively use the knowledge.',             xp: 6000 },
    ],
    focus: [
      { lvl: 1,  title: 'One Focus Block',      desc: 'A single 25-min phone-free focus block.',                    xp: 40 },
      { lvl: 3,  title: 'Three Blocks',         desc: '3 focus blocks in one day.',                                 xp: 100 },
      { lvl: 6,  title: 'Deep Ninety',            desc: 'One uninterrupted 90-min deep work block.',                  xp: 200 },
      { lvl: 12, title: 'Flow Week',            desc: '5 deep blocks in one week.',                                 xp: 400 },
      { lvl: 20, title: 'Phone Away',           desc: 'A full work session with phone out of reach.',               xp: 350 },
      { lvl: 35, title: 'Deep Day',             desc: '4 hours of deep work in one day.',                           xp: 800 },
      { lvl: 55, title: 'Hundred Sessions',     desc: '100 logged deep work sessions.',                             xp: 1800 },
      { lvl: 80, title: 'Deep Master',          desc: 'Sustained deep work as a daily default.',                    xp: 3500 },
    ],
    journaling: [
      { lvl: 1,  title: 'First Entry',          desc: 'Write one journal entry today.',                             xp: 40 },
      { lvl: 3,  title: 'Three Days',           desc: 'Journal 3 days in a row.',                                   xp: 80 },
      { lvl: 7,  title: 'Seven Day Streak',     desc: 'Journal every day for a week.',                              xp: 200 },
      { lvl: 15, title: 'Month of Pages',       desc: '30 journal entries logged.',                                 xp: 500 },
      { lvl: 30, title: 'Morning Pages',        desc: '30 days of morning journaling.',                             xp: 900 },
      { lvl: 50, title: 'The Archive',          desc: '100 entries — a record of your growth.',                     xp: 1800 },
      { lvl: 75, title: 'A Year Written',       desc: '365 entries logged.',                                        xp: 4000 },
    ],

    // ───────────── BUSINESS ─────────────
    sales: [
      { lvl: 1,  title: 'First Pitch',          desc: 'Pitch an idea or product to one person.',                   xp: 60 },
      { lvl: 3,  title: 'Ten Pitches',          desc: 'Pitch to 10 people, any outcome.',                           xp: 150 },
      { lvl: 5,  title: 'First Yes',            desc: 'Close your first deal / sale.',                              xp: 300 },
      { lvl: 10, title: 'Five Closed',          desc: 'Close 5 deals.',                                             xp: 500 },
      { lvl: 18, title: 'Ten Closed',           desc: 'Close 10 deals total.',                                      xp: 800 },
      { lvl: 30, title: 'Handle the No',        desc: 'Turn a no into a yes through follow-up.',                    xp: 1000 },
      { lvl: 45, title: 'First €1k Deal',       desc: 'Close a single deal worth €1,000+.',                         xp: 1500 },
      { lvl: 65, title: 'Pipeline Pro',         desc: 'Keep a full pipeline for 3 months.',                         xp: 2500 },
      { lvl: 85, title: 'Rainmaker',            desc: 'Hit a personal revenue milestone you set.',                  xp: 4500 },
    ],
    marketing: [
      { lvl: 1,  title: 'First Post',           desc: 'Publish one piece of content publicly.',                     xp: 40 },
      { lvl: 3,  title: 'Five Posts',           desc: 'Publish 5 pieces of content.',                               xp: 100 },
      { lvl: 6,  title: 'Consistent Voice',     desc: 'Post 10 times on one channel.',                              xp: 250 },
      { lvl: 12, title: 'First 1k Views',       desc: 'Get a post past 1,000 views.',                               xp: 400 },
      { lvl: 20, title: '100 Followers',        desc: 'Reach 100 followers on one platform.',                       xp: 600 },
      { lvl: 35, title: 'First 10k Views',      desc: 'A post breaks 10,000 views.',                                xp: 1000 },
      { lvl: 50, title: '1,000 Followers',      desc: 'Reach 1,000 followers.',                                     xp: 1800 },
      { lvl: 75, title: '10k Audience',         desc: 'Reach 10,000 followers.',                                    xp: 3500 },
      { lvl: 95, title: 'Real Influence',       desc: 'A following that drives real results.',                      xp: 6000 },
    ],
    ai_tools: [
      { lvl: 1,  title: 'First Automation',     desc: 'Automate one repetitive task with AI.',                      xp: 60 },
      { lvl: 3,  title: 'Daily Driver',         desc: 'Use AI tools every day for a week.',                         xp: 120 },
      { lvl: 6,  title: 'Prompt Craft',         desc: 'Build a reusable prompt you rely on.',                       xp: 180 },
      { lvl: 12, title: 'Connect Two Tools',    desc: 'Make two tools talk to each other.',                         xp: 350 },
      { lvl: 20, title: 'Pipeline Builder',     desc: 'Chain tools into one automated pipeline.',                   xp: 600 },
      { lvl: 35, title: 'Save 3 Hours/Week',    desc: 'Automation saves you 3+ hrs weekly.',                        xp: 1000 },
      { lvl: 55, title: 'Agent Architect',      desc: 'Build an autonomous agent that does real work.',             xp: 2000 },
      { lvl: 80, title: 'AI-First',             desc: 'Your whole workflow is AI-native.',                          xp: 4000 },
    ],
    coding: [
      { lvl: 1,  title: 'Hello World',          desc: 'Write and run your first script.',                           xp: 60 },
      { lvl: 3,  title: 'Edit & Break',         desc: 'Change code, break it, fix it.',                             xp: 100 },
      { lvl: 6,  title: 'Ship a Page',          desc: 'Put a working site live (this dashboard counts!).',          xp: 250 },
      { lvl: 12, title: 'Connect an API',       desc: 'Fetch and display real data from an API.',                   xp: 450 },
      { lvl: 20, title: 'Add a Database',       desc: 'Build something with a database behind it.',                 xp: 700 },
      { lvl: 30, title: 'Squash Real Bugs',     desc: 'Debug and fix a tricky production issue.',                   xp: 900 },
      { lvl: 45, title: 'Full Stack',           desc: 'Build a complete front-to-back feature.',                    xp: 1500 },
      { lvl: 65, title: 'Ship a Product',       desc: 'Launch an app real people use.',                             xp: 2800 },
      { lvl: 90, title: 'Builder',              desc: 'Ship multiple products people pay for.',                     xp: 5500 },
    ],
    content: [
      { lvl: 1,  title: 'First Upload',         desc: 'Create and publish one video / reel / post.',                xp: 60 },
      { lvl: 3,  title: 'Five Pieces',          desc: 'Publish 5 pieces of content.',                               xp: 120 },
      { lvl: 7,  title: 'Ten Pieces',           desc: 'Publish 10 pieces of content.',                              xp: 300 },
      { lvl: 15, title: 'Find Your Format',     desc: 'Settle on a repeatable content format.',                     xp: 450 },
      { lvl: 25, title: 'First 10k Views',      desc: 'One piece breaks 10k views.',                                xp: 800 },
      { lvl: 40, title: 'Consistent Drops',     desc: 'Post on schedule for 2 months.',                             xp: 1200 },
      { lvl: 60, title: 'Creator',              desc: 'Build a real audience around your content.',                 xp: 2500 },
      { lvl: 85, title: 'Signature Style',      desc: 'A recognisable body of work.',                               xp: 4500 },
    ],

    // ───────────── LIFESTYLE ─────────────
    dating: [
      { lvl: 1,  title: 'Say Hi',               desc: 'Start a conversation with someone new.',                     xp: 40 },
      { lvl: 2,  title: 'Hold Eye Contact',     desc: 'Hold warm eye contact in a chat.',                           xp: 50 },
      { lvl: 3,  title: 'Social Reps',          desc: 'Go to a social event and meet people.',                      xp: 80 },
      { lvl: 5,  title: 'The Ask',              desc: 'Ask someone out (any outcome counts).',                      xp: 150 },
      { lvl: 7,  title: 'Three Conversations',  desc: 'Talk to 3 new people in one outing.',                        xp: 180 },
      { lvl: 10, title: 'Five Strangers',       desc: 'Genuinely talk to 5 new people in one night.',               xp: 300 },
      { lvl: 15, title: 'First Date',           desc: 'Go on a real planned date.',                                 xp: 450 },
      { lvl: 25, title: 'Second Date',          desc: 'Get to a second date with someone.',                         xp: 600 },
      { lvl: 40, title: 'Three Dates',          desc: 'See the same person for a 3rd date.',                        xp: 1000 },
      { lvl: 60, title: 'Something Real',       desc: 'Build a genuine connection.',                                xp: 1800 },
      { lvl: 85, title: 'Chosen Partner',       desc: 'A relationship you consciously chose.',                      xp: 3500 },
    ],
    cooking: [
      { lvl: 1,  title: 'Cook One Meal',        desc: 'Cook a meal from scratch.',                                  xp: 40 },
      { lvl: 3,  title: 'Three Dishes',         desc: 'Cook 3 different meals this week.',                           xp: 100 },
      { lvl: 6,  title: 'Signature Dish',       desc: 'Master one dish you can make blind.',                        xp: 200 },
      { lvl: 12, title: 'Five Recipes',         desc: 'Have 5 solid recipes in your pocket.',                       xp: 350 },
      { lvl: 20, title: 'Meal Prep',            desc: 'Prep a full week of meals in advance.',                      xp: 500 },
      { lvl: 35, title: 'Dinner Host',          desc: 'Cook a 3-course meal for guests.',                           xp: 900 },
      { lvl: 55, title: 'Twenty Recipes',       desc: 'Master 20 distinct recipes.',                                xp: 1600 },
      { lvl: 80, title: 'Home Chef',            desc: 'Cook restaurant-level food at home.',                        xp: 3000 },
    ],
    social: [
      { lvl: 1,  title: 'Reach Out',            desc: 'Message a friend you havent seen in a while.',               xp: 40 },
      { lvl: 3,  title: 'Make a Plan',          desc: 'Set up a hangout with someone.',                             xp: 90 },
      { lvl: 7,  title: 'Host Night',           desc: 'Organise a hangout for 3+ friends.',                         xp: 250 },
      { lvl: 15, title: 'New Friend',           desc: 'Turn an acquaintance into a friend.',                        xp: 400 },
      { lvl: 30, title: 'Wide Circle',          desc: 'Maintain 5 close friendships actively.',                     xp: 800 },
      { lvl: 50, title: 'The Connector',        desc: 'Introduce two people who become friends.',                   xp: 1400 },
      { lvl: 75, title: 'Community',            desc: 'Build or lead a group / community.',                         xp: 3000 },
    ],
    planning: [
      { lvl: 1,  title: 'Plan Tomorrow',        desc: 'Write tomorrows plan tonight.',                              xp: 40 },
      { lvl: 3,  title: 'Plan the Week',        desc: 'Map out a full week ahead.',                                 xp: 100 },
      { lvl: 7,  title: 'Weekly Review',        desc: 'Do a full weekly planning session.',                         xp: 250 },
      { lvl: 15, title: 'Time-Block a Day',     desc: 'Run one day fully time-blocked.',                            xp: 400 },
      { lvl: 25, title: 'Quarter Vision',       desc: 'Set and write 90-day goals.',                                xp: 700 },
      { lvl: 45, title: 'Run on the System',    desc: 'Use your own system for a month straight.',                  xp: 1200 },
      { lvl: 70, title: 'Life OS',              desc: 'Run your whole life from your system for a quarter.',        xp: 2800 },
    ],
    puzzling: [
      { lvl: 3,  title: 'Starter — 100 pc',     desc: 'Complete a 100-piece puzzle.',                              xp: 80 },
      { lvl: 10, title: 'Beginner — 300 pc',    desc: 'Complete a 300-piece puzzle.',                              xp: 200 },
      { lvl: 20, title: 'Casual — 500 pc',      desc: 'Complete a 500-piece puzzle.',                              xp: 400 },
      { lvl: 32, title: 'Focused — 750 pc',     desc: 'Complete a 750-piece puzzle.',                              xp: 650 },
      { lvl: 42, title: 'Solid — 1000 pc',      desc: 'Complete a 1000-piece puzzle.',                             xp: 900 },
      { lvl: 55, title: 'Strategist',           desc: '1000 pieces under 8 hours.',                                xp: 1400 },
      { lvl: 65, title: 'Advanced — 1500 pc',   desc: 'Complete a 1500-piece puzzle.',                             xp: 1900 },
      { lvl: 75, title: 'Expert — 2000 pc',     desc: 'Complete a 2000-piece puzzle.',                             xp: 2600 },
      { lvl: 88, title: 'Master — 3000 pc',     desc: '3000+ pieces, or a brutal colour-field puzzle.',            xp: 4000 },
      { lvl: 100,title: 'Legend — 5000 pc',     desc: '5000+ pieces or an extreme puzzle.',                        xp: 7000 },
    ],

    // ───────────── KNOWLEDGE ─────────────
    languages: [
      { lvl: 2,  title: 'Sound of French',      desc: 'Learn the alphabet sounds + 20 greetings (bonjour, merci, ça va).', xp: 60 },
      { lvl: 5,  title: 'Survive a Café',        desc: 'Order food & drink fully in French.',                        xp: 120 },
      { lvl: 10, title: '500 Words',             desc: 'Know ~500 common words (use Anki/Duolingo daily).',           xp: 250 },
      { lvl: 15, title: 'Present Tense',         desc: 'Conjugate -er/-ir/-re verbs in présent reliably.',           xp: 350 },
      { lvl: 22, title: 'Past Tense',            desc: 'Tell a story in passé composé.',                             xp: 450 },
      { lvl: 30, title: 'A2 Conversation',       desc: 'Hold a 5-min chat about daily life without freezing.',       xp: 600 },
      { lvl: 38, title: 'Watch With FR Subs',    desc: 'Watch a French film with French (not English) subtitles.',   xp: 700 },
      { lvl: 45, title: 'Imparfait & Futur',     desc: 'Use imparfait and futur simple correctly in speech.',        xp: 850 },
      { lvl: 55, title: 'B1 — Opinions',         desc: 'Argue a viewpoint for 2 minutes in French.',                 xp: 1100 },
      { lvl: 65, title: 'Subjonctif',            desc: 'Use the subjunctive in real sentences (il faut que…).',       xp: 1400 },
      { lvl: 70, title: 'No Subtitles',          desc: 'Follow a French YouTuber / podcast with no subs.',           xp: 1700 },
      { lvl: 85, title: 'B2 — Debate',           desc: 'Hold a 20-min deep conversation with a native.',             xp: 2500 },
      { lvl: 100,title: 'C1 — Think in French',  desc: 'Catch yourself thinking and dreaming in French.',            xp: 5000 },
    ],
    piano: [
      // 1-10 Absolute Beginner — first sounds
      { lvl: 2,  title: 'Find Middle C',         desc: 'Know where C is and name all white keys.',                  xp: 50 },
      { lvl: 4,  title: 'Right-Hand 5 Notes',    desc: 'Play a 5-note pattern with your right hand, notes A-G named.', xp: 90 },
      { lvl: 6,  title: 'Hands Apart',           desc: 'Play a simple melody with each hand separately.',            xp: 150 },
      { lvl: 8,  title: 'One Song Clean',        desc: 'Play one simple song with no mistakes.',                    xp: 220 },
      { lvl: 10, title: 'Metronome + Both Hands',desc: 'Play your first piece hands-together to a metronome.',       xp: 300 },
      // 11-20 Beginner — control
      { lvl: 13, title: 'First Scales',          desc: 'Play C, G and F major scales cleanly.',                     xp: 350 },
      { lvl: 16, title: 'I-IV-V Chords',         desc: 'Play a I-IV-V chord progression.',                          xp: 420 },
      { lvl: 18, title: 'Pedal & 2 Min',         desc: 'Use the sustain pedal; play 2 min without stopping.',         xp: 480 },
      { lvl: 20, title: 'First Full Song',       desc: 'Play a complete song start to finish.',                     xp: 600 },
      // 21-30 Novice — become a real pianist
      { lvl: 23, title: 'All Major+Minor Chords',desc: 'Play every major and minor chord on command.',              xp: 650 },
      { lvl: 25, title: 'First Improv',          desc: 'Improvise over a simple chord progression.',                xp: 720 },
      { lvl: 28, title: 'Play for Someone',      desc: 'Perform a piece for another person.',                       xp: 800 },
      { lvl: 30, title: '10 Songs + 15 Min',     desc: '10-song repertoire, 15 min of music memorised.',            xp: 950 },
      // 31-40 Intermediate — fluency
      { lvl: 33, title: 'All Scales + Arpeggios',desc: 'All major & minor scales, plus arpeggios.',                 xp: 1000 },
      { lvl: 36, title: 'Play by Ear',           desc: 'Work out a tune by ear; scales at 100 BPM.',                xp: 1150 },
      { lvl: 38, title: 'First Performance',     desc: 'Play at a small gig / for a group.',                        xp: 1300 },
      { lvl: 40, title: 'Jazz/Blues Basics',     desc: '20-song repertoire, jazz/blues foundation, 30 min.',         xp: 1500 },
      // 41-50 Advanced Intermediate
      { lvl: 44, title: 'Bach Level',            desc: 'Play a Bach two-part invention.',                           xp: 1700 },
      { lvl: 47, title: 'Read Pop Instantly',    desc: 'Play pop songs on first read; transpose a tune.',            xp: 1900 },
      { lvl: 50, title: 'Chopin Beginner',       desc: 'Play a beginner Chopin piece; 1 hr repertoire.',            xp: 2200 },
      // 51-70 Advanced → Expert
      { lvl: 55, title: 'Improv 5 Min',          desc: 'Improvise for 5 minutes; advanced jazz chords.',            xp: 2600 },
      { lvl: 60, title: 'ABRSM 6-7',             desc: 'Play grade 6-7 pieces; can accompany others.',              xp: 3200 },
      { lvl: 65, title: 'Sight-Read Fluently',   desc: 'Play unfamiliar music on first sight; all keys improv.',     xp: 3800 },
      { lvl: 70, title: 'Semi-Pro',              desc: 'Concert pieces, can teach beginners, 2 hr repertoire.',       xp: 4500 },
      // 71-100 Master → Legend
      { lvl: 78, title: 'Master Technique',      desc: 'Virtuoso passages, full sonatas, play with other musicians.', xp: 5500 },
      { lvl: 85, title: 'Full Recital',          desc: 'Perform a complete recital; your own arrangements.',          xp: 7000 },
      { lvl: 92, title: 'Virtuoso',              desc: 'Internationally-strong repertoire; your own style.',         xp: 9000 },
      { lvl: 100,title: 'Concert Pianist',       desc: 'Total mastery of technique, ear and theory.',                xp: 15000 },
    ],
    learning: [
      { lvl: 2,  title: 'Pick a Topic',         desc: 'Choose one skill/subject and find a course or book for it.',  xp: 50 },
      { lvl: 5,  title: 'First Hour',            desc: 'Complete your first full hour of focused study.',            xp: 120 },
      { lvl: 10, title: 'Finish a Course',       desc: 'Complete one online course start to finish.',                xp: 300 },
      { lvl: 18, title: 'Take Notes',            desc: 'Build a notes system (Notion/cards) for what you learn.',     xp: 400 },
      { lvl: 25, title: 'Apply It',              desc: 'Use something you learned in a real project.',               xp: 550 },
      { lvl: 35, title: 'Three Deep',            desc: 'Complete 3 courses in one domain.',                          xp: 900 },
      { lvl: 50, title: 'Teach It',              desc: 'Explain a concept to someone until they get it.',            xp: 1400 },
      { lvl: 70, title: 'Master a Domain',       desc: 'Reach real, usable competence in one field.',                xp: 2800 },
      { lvl: 90, title: 'Polymath Path',         desc: 'Reach competence across 3 different fields.',                xp: 5000 },
    ],
    superiority: [
      // Phase 1 — Structure of reality
      { lvl: 3,  title: 'Math: the Language',    desc: 'Refresh algebra → start calculus. Khan Academy or 3Blue1Brown.', xp: 100 },
      { lvl: 7,  title: 'Classical Physics',     desc: 'Learn Newtonian mechanics: force, energy, momentum.',         xp: 200 },
      { lvl: 11, title: 'Chemistry & Biology',   desc: 'How matter changes; how life organises itself.',             xp: 250 },
      { lvl: 14, title: 'Systems Thinking',      desc: 'Read about how complexity emerges from simple rules.',        xp: 350 },
      // Phase 2 — The mind
      { lvl: 18, title: 'Neuroscience Basics',   desc: 'How the brain processes information (Sapolsky lectures).',     xp: 300 },
      { lvl: 22, title: 'Cognitive Psychology',  desc: 'Memory, attention, decision-making, creativity.',            xp: 350 },
      { lvl: 28, title: 'Consciousness',         desc: 'Read on philosophy of mind: what is "I"? + daily meditation.', xp: 450 },
      // Phase 3 — Language & logic
      { lvl: 33, title: 'Critical Thinking',     desc: 'Learn logical fallacies & argumentation.',                   xp: 400 },
      { lvl: 38, title: 'Rhetoric & Writing',    desc: 'Practise expressing ideas clearly in writing.',              xp: 500 },
      { lvl: 42, title: 'Programming',           desc: 'Learn to code — the modern mathematics of the mind (Python).', xp: 600 },
      // Phase 4 — Humanity
      { lvl: 47, title: 'World History',         desc: 'Patterns across time; history of philosophy.',               xp: 500 },
      { lvl: 52, title: 'Economics',             desc: 'How value and power move through society.',                  xp: 600 },
      { lvl: 56, title: 'Art & Music History',   desc: 'How humans have tried to understand beauty.',                xp: 650 },
      // Phase 5 — The great thinkers
      { lvl: 62, title: 'The Philosophers',      desc: 'Plato, Aristotle, Descartes, Spinoza, Nietzsche, Aurelius.', xp: 800 },
      { lvl: 70, title: 'The Scientists',        desc: 'Newton, Darwin, Einstein, Turing, Feynman, Da Vinci.',       xp: 1000 },
      // Phase 6 — Connect
      { lvl: 78, title: 'Cross Domains',         desc: 'Link physics↔philosophy, biology↔economics, art↔math.',       xp: 1400 },
      { lvl: 84, title: 'One Whole',             desc: 'Stop seeing subjects; see one connected system.',            xp: 1800 },
      // Phase 7 — Create
      { lvl: 92, title: 'Form a Worldview',      desc: 'Synthesise your own philosophy from everything learned.',     xp: 2500 },
      { lvl: 100,title: 'Create',                desc: 'Make something new — knowledge becomes wisdom.',             xp: 5000 },
    ],

    // ───────────── CORE / NEW SKILLS ─────────────
    whistling: [
      { lvl: 2,  title: 'The Setup',            desc: 'Lips over teeth, fingers in a V, tongue back. Aim the air down.', xp: 60 },
      { lvl: 5,  title: 'First Sound',           desc: 'Produce any clear whistle tone, even once.',                 xp: 150 },
      { lvl: 10, title: 'Do It Again',           desc: 'Get a sound on 5 of 10 tries.',                             xp: 250 },
      { lvl: 18, title: 'Hold It',               desc: 'Hold a steady tone for 10 seconds.',                        xp: 350 },
      { lvl: 28, title: 'Make It Loud',          desc: 'A whistle audible across a whole room.',                    xp: 500 },
      { lvl: 38, title: 'On Command',            desc: 'Sharp, hard whistle the instant you want it.',              xp: 700 },
      { lvl: 50, title: 'Reliable',              desc: 'Hit it 8 of 10 tries, both hands.',                         xp: 1000 },
      { lvl: 65, title: 'Carry 30m',             desc: 'Whistle heard 20-30m away outside.',                        xp: 1500 },
      { lvl: 82, title: 'Pitch Control',         desc: 'Vary pitch and volume on demand.',                          xp: 2500 },
      { lvl: 100,title: 'Siren Mode',            desc: 'Instant, loud, reliable — a true crowd-call whistle.',       xp: 4000 },
    ],
    dancing: [
      { lvl: 1,  title: 'Find the Beat',        desc: 'Move on-beat to a full song.',                               xp: 60 },
      { lvl: 2,  title: 'Loosen Up',            desc: 'Dance alone in your room without judging it.',               xp: 70 },
      { lvl: 3,  title: 'One Basic Step',       desc: 'Learn one clean basic step.',                                xp: 90 },
      { lvl: 5,  title: 'One Routine',          desc: 'Learn a short choreographed sequence.',                      xp: 200 },
      { lvl: 8,  title: 'Two Songs',            desc: 'Dance through 2 full songs comfortably.',                    xp: 250 },
      { lvl: 15, title: 'Floor Confidence',     desc: 'Dance at a party fully sober and unbothered.',               xp: 400 },
      { lvl: 25, title: 'Lead the Group',       desc: 'Be the first one on the dance floor.',                       xp: 700 },
      { lvl: 35, title: 'Partner Up',           desc: 'Lead or follow a partner dance for one song.',               xp: 1000 },
      { lvl: 55, title: 'Own the Floor',        desc: 'Freestyle for a full song and enjoy it.',                    xp: 1800 },
      { lvl: 80, title: 'Performer',            desc: 'Dance in front of a crowd on purpose.',                      xp: 3500 },
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
