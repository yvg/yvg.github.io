---
title: "Stop Human Approval in Pull Requests: A case for better collaboration"
date: 2024-02-02
---

Feb. 2, 2024

# Stop Human Approval in Pull Requests: A case for better collaboration

Your immediate thought might be: “This is stupid! Human approval in PRs is a fundamental process in software development, it ensures quality, detects issues, is a great way to collaborate, defines governance, helps to learn from each other… aaand everybody does it. It works well for me, I have countless examples.”

Everybody does it. Some famous people, technical influencers, big corporations,… are big proponents of it. And everybody, you, me, and our colleagues who have used PRs are biased by ingrained habits.
Some claim that it's the only way, that PRs should be long-lived and that each keystroke must be reviewed for absolute technical perfection.

We move from organisation to organisation, from repo to repo, and we repeat the same process over and over again. We don't question it, we just do it.
When it's not present in small projects, we add it. When an organisation works without it, we introduce it.

However, we rarely question this choice.

So… let's question it, let's explore some of the consequences that emanate from it, and some alternatives we can apply to yield better results.

## Delays

The evident consequence of human approval is delay. While numerous delays can be attributed to it, we can summarise it to one: **delayed value delivery to end customers.** In turn, this results in delayed feedback to enhance our products.

Many of the same organisations pride themselves in embracing agility and following lean principles. However, if you are familiar with the **8 Wastes of Lean**, waiting for approval is a waste, a waste of time, and a major (if not the biggest) reason for slow delivery, it's also a waterfall principle right in the middle of the process.

The immediate consequence of this is visible in metrics. For instance, lead times and delivery frequency visibly improve when human approval is not part of the process.

## Quality

Thoroughly reviewing a PR, fully understanding the acceptance criteria, verifying the architecture, the layers, reading all files (not just the diff), understanding how it all belongs together, thinking about each variable name, validating interfaces, reading the tests, running the code,… is a lot of work.

And let's be frank, most people don't engage in such a comprehensive review. Nobody has the capacity, energy or time for this.
Instead, it's very common to skim through the PR, look for a few things that one would do differently, and comment on those.

A more effective way to ensure quality is for people to collaborate, to align beforehand, to teach each other, and to continuously agree on software principles, architectural concepts and design patterns. To write them down and to point to them in every discussion.

Bug detection, static analysis, pattern enforcement, test coverage, linting,… should be automated as much as possible.

## Interpersonal Friction

It's not uncommon to see heated discussions in PRs, with people getting upset, angry, and frustrated. In the worst cases, people have to be reminded to be respectful and professional by their managers, or worse.

Still, well-formulated and well-intentioned comments can still be misinterpreted.

By removing human approval, we must shift how we interact with one another. A highly successful way to do so is to **pair**, to **mob**, or at least to **pair code-review**. It's much easier to have a conversation about code, share ideas, and learn from each other synchronously with a common contextual understanding, than to try to convey the same context, information and sentiment asynchronously in comments.

## Ownership

When we introduce human approval, we implicitly convey that we don't trust each other. That others must check our work.

This tends to diminish accountability. Some people are less likely to feel responsible for the work they do.

A healthier approach is to foster individual responsibility for one's work. To let authors decide when and when not to ask for help and to be fully accountable for the outcome. Not by blaming them when things go wrong, but by helping them to learn from their mistakes.

It's a fantastic way to ensure continuous growth, eliminate the fear of merging, and become better at what we do, truly collaboratively.

## Context Switching

This is an obvious one which leads to many interruptions and fatigue.
Human approvals tend to decuple context switching as everybody is asking each other to review pieces of work asynchronously and in parallel.
In the best case, people batch review and dedicate time in their day to do so.

A more efficient way to work is to focus on a single task at a time, from definition to completion, and only then move to a new task. It is a well-known principle of lean methodologies and one of the most impactful ways to improve our workflow.

## Conclusion / `tl;dr`

Human approval in PRs delays delivery, does not ensure quality, creates friction, diminishes ownership, and leads to enormous context switching.

Automation and a culture of real-time collaboration, in which everyone assumes best intentions, can replace the need for human approval in its entirety.

The best way to convince oneself is to try it out for a few months and measure the results.

## Further inspiration

- [The 8 Wastes of Lean](https://theleanway.net/The-8-Wastes-of-Lean)
- [Trunk Based Development](https://trunkbaseddevelopment.com/#one-line-summary)
- [Agile Manifesto](https://agilemanifesto.org/)