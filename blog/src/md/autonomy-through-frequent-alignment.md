---
title: "Autonomy through frequent Alignment"
date: 2025-03-12
---

Mar. 12, 2025

# Autonomy through frequent Alignment

In my [previous post](https://yves.vg/blog/stop-human-approval-in-pull-requests-for-better-collaboration.html), I mentioned **Autonomy through frequent alignment** as a key principle to enable teams to merge code without the need for human approval in Pull Requests.

Before going on, let's define the two terms:

- **Autonomy** is the ability of all team members to take decisions and act on them.
- **Alignment** refers to shared principles and common objectives among teams.

I've often witnessed people opposing **autonomy** and **alignment** as if they were mutually exclusive. Alignment is often perceived as an interference to individual autonomy. However, autonomy can't be achieved if a team does not share a desire for collective cohesion.

Autonomy without alignment leads to chaos, where individuals value different aspects of software development and imagine solutions in very different ways.
Misalignment prevents effective collaboration and creates inconsistencies in technicalities, methods, and processes, and delay business objectives.

On the other hand, alignment without autonomy leads to bureaucracy, where managers are telling teams exclusively what is valued, what to do, and how to do it.

Both of these extremes are toxic to organisations. Whoever has witnessed these situations, knows that they lead to low morale and poor results.

From my experience, the key is to build a culture where teams are given autonomy to decide on how to solve a problem in an area, while frequently aligning on what is valued in solutions.

## Align on fundamentals

For teams to be given autonomy in how to execute, deciding fundamentals is a must. Good fundamentals should be consice, simple to understand, and vague enough to enable experimentation.

If our goal is to stop human approval in pull requests, a good way to start is to agree on a **"definition of Done"**. It can take the form of a checklist in a pull request template, it can be a shared agreement in a document.
What is important is to make it easy to find, to share, to understand, and to follow. A few lines will yield far better results than a 4-page essay.

Ideally the fundamentals would inform about a few things:

1. How to use Pull Requests.
2. Who owns decisions in a Pull Request.
3. What is valued technically.
4. How is quality ensured.

For instance, the guidelines that worked well for teams I led in the past were:

1. Many small short-lived Pull Requests.
2. PR authors decide if, when, and how to act on feedback.
3. Software Design Patterns and Twelve Factor App Methodology instead of magical frameworks.
4. All PRs should include appropriate level of unit tests, OR have been tested manually by a different person.

These 4 fundamentals don't go into much details, and aren't going to work in the long-run, for now, this is by design.

## First steps of Aligned Autonomy

With the guidelines in place, software engineers are given a modus-operandi to work within.
Anybody can open Pull Requests and merge them as long as they follow the principles the team aligned on.

Earlier, I mentioned that these fundamentals should remain somewhat vague and therefor open to interpretation. While we provided clarity on ownership and operation, we left some room for experimentation when it comes to technicalities and quality.
We did not specifically mention which design patterns, or which parts of the 12-factor manifesto are to be prioritised at this point. Engineers will be facing questions such as: Which methodologies, which libraries, which design patterns to use? What strategies and what level of automation to ensure quality?

The first resulting PRs should introduce some experiments to improve clarity around software design and quality. Which in turn, should result in opinions forming and the need for more alignment.

Now, exercice caution. Entrenched habits may lead some engineers to fear-driven reactions like paralysis-analysis. Other engineers might misinterpret autonomy as a free pass for unrestricted actions and steer them towards unproductive rabbit-holes or non-collaborative behaviours.
Watch out for these tendencies, lead by example, and repeat the mantra of autonomy through alignment.

## Frequency is key

The goal should now be to build on these fundamentals, to align continuously, to build trust, and to increase autonomy.

Invite people to discuss frequently, from experience, once a week is a good start. And allow for all sorts of questions: What tooling should we be using? Which should we agree on if any? What architectural principles shall we agree on, why? How do we measure enhancements to our workflow? What is bothering us technically, how can we improve it? How do we enable business initiative XYZ? How do we measure our impact?

All questions should be encouraged, there are no "stupid questions". Something obvious to a few, might be completely new to others. Use these moments to increase individual awareness.
Keep notes of what has been agreed, and keep pointing back to them at every opportunity.

Lastly, brace for disagreement. As much as I believe it is best for everybody to fully understand a situation and rationally come to the same conclusions, people have different experiences and are, after all, people. What we are seeking are means to autonomy through alignment, not consensus. Discussions should respectfully be led towards actionable outcomes. Experimenting with ideas is better than getting stuck and overthinking. Re-evaluate outcomes of experiments, and keep fine-tuning agreements.
Embrace mistakes, let people improve their competency by hitting walls, some softer, some harder.

## More opportunities to align

A weekly technical forum is a great habit to provide space and time for people to discuss and continuously align to improve overall autonomy.
While I would recommend using such forums to align on complex topics that affect everybody, people should seek out more opportunities to align daily.

For example, when starting the development of a new feature, kick-off the process with a "technical session". Collectively assess the feasibility of the acceptance criteria, translate user requirements into technical implementations and agree on architectural approaches. Centralise the decisions on tools such as Notion or Miro and make them the source of truth. Continuously review if you are on track. If you diverted discuss why, either come back to the agreements or, if the diversion is an improvement on the initial agreement reflect the changes in the document.

Avoid the pitfall of letting the first available engineer dictate the direction without discussion.

Furthermore, leverage every opportunity for micro-alignment. For instance, asynchronous chats (Slack, IRC,…) and "dailys" (or "stand-ups") are a great way to provide clarity, raise questions, and further increase alignment. Use moments of confusion to break out in mob-programming sessions to enhance clarity and alignment through code and design.

## Conclusion / `tl;dr`

**Alignment** and **autonomy** are two sides of the same coin.

If your teams are facing challenges with productivity and collaboration, I hope that you will experiment with these ideas:

- Define simple fundamentals, and create space and time to discuss weekly.
- Allow for all team members to run experiments, to make mistakes, and to share back results.
- Agree how to proceed with team members before starting major work.
- Continuously improve through daily syncs and asynchronous communication.
- Watch out for engineers that get stuck in paralysis-analysis, or engineers that consider autonomy as a free pass for ego-trips.

With time and consistency, such approaches will yield measurable improvements, such as:

- Increased team engagement and satisfaction.
- Improved efficiency (e.g.reduced cycle times)
- Enhanced software quality (fewer bugs, less outages, increased customer satisfaction,…)

Building this common understanding takes time, simply remember that the outcomes outweigh temporary challenges.

## Further inspiration

- [The Decision Tree](https://www.techtello.com/decision-tree-for-making-better-decisions/)
- [The Twelve-Factor App](https://12factor.net/)
- [Software Design Patterns](https://refactoring.guru/design-patterns)
- [Disagree and commit](https://en.wikipedia.org/wiki/Disagree_and_commit)

## Acknowledgements

Special thanks to <a href="https://chaos.social/@bassistance">@bassistance</a> and <a href="https://ruby.social/@eljojo">José Albornoz</a> for their valuable feedback and encouragement 👋.
