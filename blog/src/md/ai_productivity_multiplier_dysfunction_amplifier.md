---
title: "AI: Productivity Multiplier, Dysfunction Amplifier"
date: 2026-01-25
---

Jan. 25, 2026

# AI: Productivity Multiplier, Dysfunction Amplifier

For a few years now LLMs have reshaped how millions of people retrieve information, work on a daily basis, entertain themselves, and imagine the future.

And like most new shiny things, reactions vary from absolute rejection to blind embracement. I'm a proponent of neither. I prefer to experiment and figure things out for myself. I'm a technologist after all, and LLMs are not as easy to dismiss as scams like NFTs or the laughable Metaverse. So I try to understand the goods and the bads, and accept a certain level of cognitive dissonance.

Before going on, a quick aside: I'm in favour of AI regulation. There are too many important issues to pretend otherwise. But that's a topic for another time.

This post is my attempt to make sense of all the noise around AI productivity. Spoiler: it's less about AI and more about what you already have. Your team, your architecture, your habits. AI just multiplies whatever is already there.

## The Productivity Paradox

Social media is full of polarising claims. On one end: "I built a SaaS company over the weekend." On the other: "AI has a negative impact on productivity."

Let's look at both.

### Claim 1: SaaS over the weekend

While statistically possible, it's about as likely as breaking the bank at a casino. 99% of founders won't have this experience.

And for those who do make such claims, they eventually realise that there's a lot more to running a business than writing code over the weekend. Marketing, support, sales, operations, legal, customer conversations... none of that happened over the weekend. Output does not equal outcome.

### Claim 2: AI has a negative impact on productivity

This one is harder to dismiss. After all, it follows scientific methodology and is published by renowned institutes, right?

Right. But beyond titles and abstracts, people don't look much deeper. If they did, they'd find out that researchers do not claim AI has a *global* negative impact on productivity. Rather, in a given controlled environment, with certain teams, certain tools, certain workflows, certain tasks... they saw a negative impact. They can extrapolate that these impacts could be visible at a bigger scale in similar setups.

Because they are scientists and recognise the limitations of their research, they also mention: **"(…) it seems plausible or likely that AI tools are useful in many other contexts different from our setting…"** (from [Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity](https://arxiv.org/abs/2507.09089))

This is exactly the point: context matters. AI productivity is not universal. It depends on what you're multiplying.

## Where Productivity Shines

So, if impact on productivity is context-dependent, what matters for productivity?

In my experience as a manager, the teams that produce the best outcomes have a few things in common. They:

 - liked each other and had good interpersonal relationships.
 - taught each other and embraced experimentation.
 - were motivated and had a sense of common goal.
 - shared a flexible set of rules that changed when needed.
 - were empowered to take decisions autonomously within these rules.
 - reduced hand-offs as much as possible by collaborating synchronously.

These teams wrote the highest quality software and shipped continuously, in the spirit of the Agile manifesto. It was measurable in:

 - short lead times, short feedback cycles, quick release times.
 - near zero bugs, near zero outages.
 - the right mix of pairing and individual work.
 - cross-disciplinary work with designers, engineers and managers at all important steps.

As I write this down, I realise this pretty much matches the [SCARF model](https://en.wikipedia.org/wiki/SCARF_model). Among teams with similar skills, the ones that felt safest shipped the highest quality software.

Therefore, if your aim is to improve team productivity, **you need to invest in communication and collaboration first and foremost.**

What does this have to do with AI? AI does not fix broken team dynamics. If people don't work well together, adding AI into the mix won't help. It will only make things worse.

## Trust Is Visible in the Workflow

One of the easiest ways to spot dysfunction in a team is to observe how they ship a single feature.

In many organisations, the workflow looks something like this:

 1. **Customer feedback:** Collect pains.
 2. **Silo ideation:** PM and designers debate alone.
 3. **Design handoff:** Wireframes and prototypes built in Figma.
 4. **Stakeholder review:** Repeat until stakeholders are happy.
 5. **Dev handoff:** Concept is presented to a developer.
 6. **Solo coding:** Developer works alone.
 7. **PR + automated checks:** Compile, tests, linters.
 8. **Human approval:** Another developer reviews. Conflicts fixed. Stakeholder preview. Loop until approved.
 9. **Manual release.**

That's 9 steps (often more), full of hand-offs, silos, waiting, and context switching. It looks agile on paper. It's waterfall in disguise.

Here is what great teams do instead:

 1. Collect customer feedback.
 2. Pair on the problem synchronously: product, design, code, marketing.
 3. Merge to main.
 4. CI deploys to production.

4 steps. No silos. [No PRs](https://yves.vg/blog/stop-human-approval-in-pull-requests-for-better-collaboration.html). No hidden waterfall. Just a handful of people working together, trusting each other, shipping in one go.

If your reaction is "I can't possibly do this," then your problem isn't tooling. It's trust, and focus on what actually matters to users. Invest in that first. AI won't save you.

But if your team *can* work this way, the next question is: what else matters?

## The Technical Prerequisites

Team dynamics come first. But if your team works well together, what does your codebase need to make AI useful?

Unsurprisingly, what makes great software also makes great AI-assisted software.

AI struggles with tangled dependencies. What helps: clear boundaries between layers, interfaces that define contracts, flexibility to swap implementations. When a module has a well-defined interface, AI (and people) can reason about it in isolation. When everything is coupled, small changes ripple unpredictably. AI can't help you if it can't understand the blast radius of a change.

The same goes for patterns. Repository pattern, dependency injection, service layers. Boring, well-known, over-represented in training data. AI knows them deeply. The latest meta-framework with its own abstractions? AI hasn't seen enough examples. It will hallucinate.

What about tech stack? Every framework you add is friction. I can't claim to have seen many AI-augmented teams, but in my own experience, running 3 repos in a single IDE workspace, instead of switching between separate projects, has made all the difference. It makes me question every decision to split things apart. One language, one set of architectural principles, one way of doing things across frontend and backend. Boringly consistent. AI thrives on consistency.

Same for code readability. AI should infer intent from well-named functions, clear types, and small, focused modules. So should people. If you're spending hours writing documentation for AI agents, you've already lost.

Repeatability beats DRY. Abstractions lead to more abstractions. Indirection leads to confusion. LLMs are just pattern-recognising machines. The more repeatable your code, the easier it is for AI to spot the pattern and extend it. Repeating yourself is almost always fine.

None of this is new. Complexity is the killer of software. The "boring technology" crowd has been saying it for years. At [ToolTime](https://tooltime.tech), we practiced these principles long before AI coding agents existed: well-defined layers, readable code, repeatable patterns. People could rely on it. LLMs can too.


## My Productivity Gains

I'm building [fluado](https://fluado.com). We're three people. Here's what changed with AI. I do most of this inside an IDE with agentic chat. Same model, same window, whether I'm researching or coding.

Boilerplate got faster. Resolvers, repositories, service layers, type definitions. Sometimes AI drafts and I refine. But the best results come from the opposite: I draft one, AI learns the pattern and repeats it. Hours became minutes.

Exploratory research got faster too. Before diving into implementation, I ask AI to map the landscape. "I want a GraphQL solution for client and backend. Provide a matrix of existing options, link to sources, pros and cons, score them for our setup. Ask clarifying questions, don't assume." Structured prompts, structured answers.

Product design and UX wireframing got faster. I describe my ideas to Gemini and it creates a rough wireframe. No need to pick up a pen. I work from that to implement properly with Cursor or Antigravity.

Refactoring and migrations got dramatically faster. Migrating from cloud functions to a proper backend took a few hours for the basics: auth, caching, modular architecture. A week for most features. Another week for the edge cases. Without AI, this would have taken months. I've done similar refactors at SoundCloud and ToolTime that dragged on endlessly, pulling engineers away from product work.

What stayed human: architecture and business logic. I make the architectural decisions and guide AI to implement them. I accept pushback. When two approaches seem to conflict, I ask AI why, and it often points to where my thinking failed. Quick feedback loop, quick refactor. Business logic? Still mine. Letting LLMs decide the logic your business runs on is a terrible idea.

The bottom line: writing a feature end-to-end used to take days or weeks. Now it takes hours to days. No more weeks. At least for me and my co-founders, because we quickly implemented guardrails and principles to avoid chaotic AI slop.

Workflow didn't really change. [Trunk-based development](https://yves.vg/blog/stop-human-approval-in-pull-requests-for-better-collaboration.html) made sense before AI. It makes even more sense now. Moving people to code reviews remains wasteful, if you have proper boundaries in place.


## What's Next

Everything I've described is AI as a personal multiplier. One person, faster.

But there's another layer. What happens when you orchestrate AI across a team? Across a company? Agents talking to agents, sharing context, dividing work, coordinating outcomes.

I don't have answers yet. I'm still in the personal multiplier phase. But I can see the shape of what's coming: AI as an organisational multiplier. Not just faster individuals, but faster systems.

If the fundamentals matter now, they'll matter even more then. Team dynamics. Clear architecture. Repeatability.

I'm still figuring this out.


## Conclusion / `tl;dr`

So where does this leave you?

If your team doesn't trust each other, AI won't fix it. If your codebase is a tangled mess, AI will make it worse. AI is a multiplier. Review the fundamentals first.

But if you've got the basics right, AI can accelerate everything. Boilerplate, research, refactoring, even wireframing. The gains are real.

Don't trust influencers selling weekend SaaS dreams. Take headlines claiming AI hurts productivity with a grain of salt.

Experiment for yourself. Measure what matters. Adjust.

- AI is a multiplier. It amplifies what you already have: good or bad.
- Team dynamics come first. Invest in trust, autonomy, psychological safety, and skills.
- Then architecture: clear boundaries, boring patterns, repeatability over DRY.
- Personal gains are real, but only if you set up boundaries early.
- What's next: AI as an organisational multiplier. Still figuring that out.

That's my take. Yours might be different. I only hope this voice makes it through the polarising noise.


## Further inspiration

- [Choose Boring Technology](https://mcfunley.com/choose-boring-technology)
- [Trunk Based Development](https://trunkbaseddevelopment.com/)
- [The SCARF Model](https://en.wikipedia.org/wiki/SCARF_model)
- [Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity](https://arxiv.org/abs/2507.09089)


## Acknowledgements

Special thanks to [Arbo](https://www.linkedin.com/in/arbovm) and [Hannes](https://mastodon.xyz/@pht) for their valuable feedback and encouragement 👋.
