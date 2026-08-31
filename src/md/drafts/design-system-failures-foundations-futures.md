---
title: "Design System, Part 1: Failures, Foundations, Futures"
date: 2025-03-18
---

Mar. 18, 2025

# Design System, Part 1: Failures, Foundations, Futures

This is the first part in a series about how I coordinated the development of a **rigid themable design system** at <a href="https://tooltime.app">ToolTime.</a>

In this first post, we will dive into the historical choices, the learnings of peoples and teams, and the evolving technicalities and mindsets that eventually led us to build a rigid design system.

## Short history

When I started at ToolTime in summer 2019, Web and Mobile React applications had been build by a consultancy and various freelancers. The result had been a working proof of concept with paying customers, however the codebases had been build with varying approaches.

The previous authors had decided on using tools such as MaterialUI, JSS, SASS and CSS Modules, and a few patterns such as the "container pattern" and "colocated styles". In addition, the different application layers and modules were tightly coupled. There were no identifiable CSS patterns such as Atomic Design, BEM, OOCSS, etc. Not even linting rules or conventions.

The mixture made for difficult readability and inflexible software, which immensily impacted our velocity.
They did write a `design-system` folder, however the result suffered from the same problems, and acted more like a showcase of MUI usage.

The first step I took was to lead the team to agree on principles, so we came up with these:

- Ignore the existing MUI code and the "design-system" folder.
- Write vanilla CSS for greater control and simplicity.
- Follow <a href="https://yves.vg/blog/separation-of-concerns-in-react-apps.html">Separation of Concerns</a> to enhance maintainability.
- Write <strong>hyper specific styles</strong> (more on that in the second post).
- Test accross multiple browsers to ensure compatibility.
- Use Emotion for some flexibility.

We also encountered premature abstractions and tight-coupling in other codebases. In addition to the specific front-end agreements, our Head Of Engineering suggested to optimise code for deletion. We introduced layered modular architecture, isolation, and <abbr title="Write Every Time">WET</abbr> principles to avoid repeating the mistakes of the past.

With these foundations, colocated JSS and hacked MUI components started to fade month by month.

## First shareability attempts

By winter 2020, we had accelerated our feature releases on a daily basis, and started to see the technical benefits of our initiatives. We maximised code flexibility, increased maintainability, enhanced readability, and CSS competency for all engineers. During this time the design team began working on concepts for reusable components, flows, templates, and more.

Due to our embrace of the WET principle, and the lack of clear UI and UX vision at that point, we wrote components using vanilla HTML/JSX & CSS. We aimed to avoid the rigid situation we inherited, and since we were uncertain about the specific needs of the customers, we chose not to invest in code shareability yet.

With designers now leading the vision for reusable UI, we extended our agreements and introduced the <abbr title="object-oriented css">OOCSS</abbr> pattern as our first attempt at shareability. We created reusable styles for buttons, links, inputs, lists, boxes, etc. With time and a lot of "search and replace", we removed the hand-written styles and replaced them with shared OOCSS classes. To align this with the SoC pattern we leveraged Emotion's <a href="https://emotion.sh/docs/composition">composition feature</a> to avoid "classitis" and tight-coupling.

Why did we invest in shared styles instead of sharing components? There were a few reasons for this:

- Principles: shared styles fit our existing approach, following single responsibility and separation of concerns.
- Semantics: shared components often suffer from "divitis" trying to accommodate too many use cases, which hurt accessibility.
- Responsibilities: the team struggled to agree on how to distinguish and share various component levels, such as UI components, stateful components, and extendable components.
- Contracts: we faced challenges in articulating guidelines for interface contracts and coupling choices.

There were more considerations, but as the goal was purely a UI/UX goal at this stage, we simplified the problem, and therefor the solution. This approach allowed us to work as before: we still had to provided HTML scaffolding, and we could still experiment with multiple approaches to JSX components, while now benefiting from reusable styles.

However, this approach had one downside: communication with designers wasn't seamless. We spoke of styles, and they spoke of components.
They did encounter the same problems though, unable to express what a components responsibility should be, to what degree they should embrace rigidity or extendability, etc. And until we would solve it, we were confident that for the time being, we had taken a good step without overthinking it.

## First shareable components

Over a year had passed, our customer base grew, and the team grew with it. The principles we had established were now being challenged. The product and design teams expected higher UI cohesion and less need for quality testing, while some engineers wanted to reduce redundant work and minimize lines of code.

Principles like SoC, modularisation, isolation and WET had helped us release stable and flexible software. However, we were now wondering how to improve velocity without falling into the <abbr title="Don't Repeat Yourself">DRY</abbr> trap, and keeping the benefits of our earlier choices.

As a next step, we created space for experimentation and encouraged presentations of isolated alternatives to shared styles. Multiple initiatives quickly formed due to ToolTime's <a href="https://yves.vg/blog/hello-tech-time-good-bye-tech-debt.html">Tech Time.</a>

### Web codebase

In the Web codebase, a few engineers set out to create shareable components. They were ambitious and developed a small component library over multiple weeks, exposing components like `<Input />`, `<List />`, and `<Button />`.

They frequently reported on their progress and began using these components in the codebase. However it soon became clear that their efforts were not addressing the initial concerns. Instead, they focused on pleasing their preconceived notion of "good software", such as eliminating lines of code and DRYing-up code for the sake of it.

The result resembled component libraries like MUI more than a predictable design-system. And components showed the same symptoms as the initial codebase, to name only a few:

- Unpredictable contracts that allowed for a mix of different inputs (e.g., data, functions, JSX elements).
- Contracts that catered to specific, uncommon use cases, which were not specified by designers.
- Implementations that were not agnostic and sometimes included business logic and module-specific type definitions.
- Implementations that were sometimes too wide, making testing difficult.

Furthermore, the outcome did not address design-system governance, cross-collaboration with designers, or quality insurance.

Still, the experiment was positive for many other aspects, particularly for individual and team development:

- Engineers improved their understanding of contracts, coupling, implementation, and semantics.
- Many chose to use or wrap the shared styles to create module-shared components.
- The differences between component libraries and design-systems became clearer to everyone.
- People realised that DRY isn't the ultimate goal that many in the industry claim, and that WET isn't always the best approach, so folks got attracted to other principles such as <abbr title="Avoid Hasty Abstractions">AHA</abbr>.

### Mobile codebase

In the mobile codebase, people took a different approach. They decided to write highly atomic components adhering closer to WET principles.

For example, a button was not a single component as in the Web codebase. Instead there were a dozen different variations, such as `<PrimaryDefaultButton />`, `<PrimaryDefaultIconButton />`, and `<PrimaryDefaultIconTextButton />`, with almost identical scaffolding and minor rendering variations. They followed WET & SRP patterns to the letter, resulting in a proliferation of UI components. Each component was extensively unit tested to ensure proper rendering, without resorting to costly long-running visual tests.

The results were more thoughtful, with particular attention to interfaces and naming. They had addressed a lot of issues faced in the Web codebase:

- Contracts were strongly typed, narrow, predictable and solved common use cases.
- Implementations were short and readable.
- The granularity allowed for high flexibility, making it easy to update, adapt or replace components in the long-run.

It did come with a few downsides:

- The granularity was potentially costly to maintain in the long-run.
- Some components still ended up in the design-system despite having specific usage.
- There was also no solution to address long-term governance and collaboration with designers.

### Aftermath

Running these initiatives side by side immensily helped the engineers learn from each other.

The mobile design-system saw increased usage accross the app, mostly due to the predictable nature of its components, the simplicity of maintenance, and perhaps the overall lower complexity of the mobile application.

In contrast, the Web codebase went through a lot more phases of trial-and-error. Some engineers created complex components that solved too many usecases, others produced elegant and simple components that addressed common issues.
Still, the design-system retained a chaotic reputation, and shared styles remained the preferred approach for most feature development, unless an elegant existing component existed or had been developed in collaboration with designers.

## Start from scratch

In summer 2023, we were about to finalize a business opportunity: white-labeling our applications to a well-known german brand.

What does this mean? It involves spinning off the same apps and replacing our brand, our logo, our colors, our buttons, our spacings, our fonts,… with those of our partner, allowing them to present it as their own product.
I hacked together a proof of concept in 2022 for this potential partnership, but now we needed to consider long-term maintenance, themability, governance, cross-collaboration, technical cohesion,… all the things no one solved in the first initiatives described above.

This time, I was tasked with forming a team to coordinate efforts for this partnership. One of my top priorities was to resolve the existing chaos and deliver a cohesive experience within 12 months.

I began by organising company-wide workshops with engineers and designers, encouraging participation to discuss challenges they faced and to gather ideas and suggestions for a future design-system.

Naturally, a few people took particular interest in this endeveour, so the company-wide workshops turned into smaller sessions with a handful of engineers and designers. And again, we decided to start with the very basics: **The principles.**

Our first step was to research what others were doing, so we analysed design-systems such as [DRUIDS](https://druids.datadoghq.com/), [DBUXDS](https://design-system.deutschebahn.com/), [Atlassian's DS](https://atlassian.design/), and many more.

With a clearer understanding of existing approaches, we realised that we needed foundational patterns to avoid new chaos. We experimented mostly with Brad Frost's [Atomic Web Design Pattern](https://bradfrost.com/blog/post/atomic-web-design/) (and a few others).

We started by brainstorming with these patterns on whiteboards with our existing UI before doing any coding, and quickly agreed on the concepts of Atoms, Molecules and Organisms. And we came to a few realisations:

- We needed to provide a design-system that was foremost rigid and predictable while allowing for multiple themes.
- The Atomic Design Pattern lacked a subatomic level to solve foundational aspects such as: colors, fonts, icons, visuals, radii, shadows, borders, spacings,…
- The concept of "Templates" did not fulfill any of our needs at this moment.
- The concept of "Pages" was too application-specific and we intended the design-system to be application-agnostic.

I will explore how we used the Atomic Design Pattern as a foundation in my next blog post, how we made shared styles a core foundation, and I will also describe the principles we laid out, and explain how we solved the subatomic problem with a concept I introduced: "Particles".

## Conclusion

By introducing a clear technical vision we had improved our codebases flexibility, readability and maintainability by letting go of past decisions. We enhanced people's understanding of software design patterns and principles, and bridged the gap in collaboration with designers. We clarified our expectations towards the responsibilities and governance of a potential design-system by running initiatives, experiments, and following-up with weekly discussions.

I also learned to accept simultaneous competing ideas, as long as their costs did not burden us. Governance and collaboration can be approached pragmatically, and become a priority when specific business needs arise.

Finally, shared styles continue to have a place in the world of seemingly omnipresent design-systems and component libraries. At the same time, front-end patterns are more relevant than ever, and mastering them is essential for creating strong foundations that enable maintainable and flexible software, while paving the way for new business opportunities.
