---
title: "Hello Tech Time, Goodbye Tech Debt"
date: 2021-06-01
---

Jun. 01, 2021

# Hello Tech Time, Goodbye Tech Debt

<p class="info">
  This article was orginally published at <a href="https://tooltime.tech/goodbye-tech-debt-hello-tech-time/">tooltime.tech</a>, it has been copied for archiving purposes.
</p>

At ToolTime, like in every engineering organisation, we have a lot to do: build new features, scale existing ones, tidy existing code, improve architectures, fix bugs, update tools, research new solutions, imagine the future, et cetera, et cetera…

With this many responsibilities, and the backlog endlessly full of new potential features, teams tend to get trapped into an unhealthy "always busy" mode. This article is about recognising and avoiding this situation in the first place, or if it's too late, give you the means to get out of it.

The concept of tech debt is a negatively connoted one, instead, we came up with what we call Tech Time. Let's have a look at how we organically grew Tech Time over a year and a half, starting Early 2020.

## Dedicate Time

The first step we took to avoid the hyper-busy mode, was to provide recurring time for all engineers to work on technical aspects.
We started by asking engineers to **dedicate 20% of their week** to it.
The weekly recurrence is important, from our experience, the frequency provides time for habits to develop.
It resulted in people pairing, organising work into daily solvable problems, and leading to **weekly incremental improvements** to a variety of codebases, conventions, pipelines, processes, etc.

## Provide Space

After a few weeks, the feedback was clear, engineers loved weekly recurring time to work on something else than features. However, we also discovered that not all engineers were engaged and that the combined time of the group did not get close to 20%.

While we did provide time, it still felt odd to some engineers to work on a tech task, while the rest of the team was working on the product backlog.
We tried to address it like so:

- We periodically reminded each other that tech time is **valuable to the business.**
- We presented impactful changes to the wider engineering organisation every two weeks in meetings we call "Tech Forums".
- Engineers announced their unavailability when they focused on tech time to avoid interruptions.

## Enhance Focus

A few months had passed, and what started as a shy attempt to frequently work on technical topics felt natural by now. Engagement increased and most engineers were contributing.
After a retrospective, our squad felt like we could refine the approach, so we decided to experiment with the format, and here is what we did:

- The squad devoted Mondays to tech time, a fixed day resulted in more synergy, pairing, and even mob-programming.
- To avoid context switching and interruptions, we asked co-workers to not plan meetings on that day.
- We added a Slack reminder that would notify us every Monday about the opportunity.
- We focused our Monday stand-ups on tech tasks only.
- We momentarily introduced an impact-effort matrix to help us prioritise tasks as a group.

The outcome became known as "Tech Task Monday", and engineers enjoyed a **meeting-free day** to collaborate with each other on topics they considered important.

Other squads started following a more focused approach like ours, and product designers joined the process too, this led to even more opportunities for collaboration.

## Coordinate Priorities

From the start, engineers were responsible to pick the tasks they deemed worth prioritising, they know best what is unnecessarily painful, and what requires attention.

To coordinate on a higher level and to increase the visibility of potentially highly impactful tasks, we introduced a few changes:

- Engineers organise and decide quarterly engineering goals, and we frequently remind ourselves about them.
- On Mondays, the multiple squad stand-ups merged into a single engineering stand-up, this improved awareness of ongoing tasks and enhanced the opportunity for collaboration between all engineers and designers.
- Every third week, we hold a meeting to verify the progress on past post-mortem action points.

## Conclusion

We are not striving for perfection in our systems, we are not striving for zero legacy code. We are striving for **small frequent improvements every Monday,** to keep things tidy and innovative. We want to avoid desperate situations in which the accumulated tech debt would be so unconquerable that radical solutions, such as rewrites, would seem like a good solution.

And we also want to enable individuals to learn, grow, experiment. To enable future product initiatives. And to provide the technical means for the business to flourish.

What did we achieve? Well, a lot: Design systems, ready to boot micro-services, sub 10 minutes pipelines, style libraries, modular software architectures, workshops, CLIs to generate code, bots and tools to support our work, dashboards, better testing, updating libraries, reducing legacy code, embracing Kotlin, improved error detection,… and much much more.

Finally, this process is not carved in stone, we remain curious and open to experiments, and we will keep shaping it as we go.

Hopefully, this blog post has provided you with an alternative concept to tech debt, and ideas on how to gradually implement **Tech Time.**
