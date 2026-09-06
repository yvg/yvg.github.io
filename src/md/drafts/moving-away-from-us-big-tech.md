---
title: "Moving away from US Big Tech"
date: 2026-08-31
---

Sep. 6, 2026

# Moving away from US Big Tech

In summer 2025, when we started building [fluado](https://fluado.com), one of our aspirations was to run outside US Big Tech. While we agreed on it, in the big scheme of registering and building a company, it felt "not so important". So we relegated that concern to "another time" and started building our infrastructure inside the Google Cloud Platform because we were familiar with it. It felt icky, but it was one less thing to think about.

Now one year later, we realised that we had deepened our dependency on US providers: Cloudflare, GCP, Supabase, GitHub, LetsEncrypt, Slack, Google Workspace, Anthropic, etc. 

One week ago we set out to move away from US tech. I have not yet addressed them all. But I'll tell you which dependencies I have moved away from, and what alternatives I have chosen and more importantly why I chose them.

## Hardware

> Google Cloud -> Hetzner

First, I decided to rent our own machines at Hetzner. It's a German hosting provider, and we already had a business account with them. They also have a rather useful API to run and teardown most of their services and products. French provider OVH had similar products and pricing but did not provide such a complete API. Given we do most of our work with AI Agents, this is a must-have.

PaaS was out of the question, I had estimated that EU providers like Scaleway would have increased our infrastructure costs by a factor of 6. Sovereign PaaS might still be interesting at a later stage though.

## Source Code & Artifact Registry

> GitHub + Google Artifact Registry -> Forgejo

Moving away from GitHub felt like a simple and isolated idea before taking on more complex migrations from Supabase and GCP.

Along the way I discovered a few complexities, but none of them were related to GitHub or Forgejo. Our own fluado Agents had a GitHub Search API integration, Forgejo however does not provide an equivalent. So it took me a day to come up with an alternative approach.

Repositories, users, secrets, actions were super simple to move from GitHub to Forgejo. I did it manually with the help of Claude Code before realising Forgejo had a built-in migration tool, which I suspect would have probably been faster and used no tokens :D

Forgejo also provides an artifact registry, so this solved two problems at once.

## Runtime

> Google Cloud Run -> Docker Swarm + Shell scripts

Compute was Cloud Run. With all the scalability options, we didn't really need because most of our usage was limited to a handful of instances.

When thinking about self-managed compute, Kubernetes was the obvious first thought. However, k8s is built for clusters, and we don't operate one. I would have been running an orchestration platform on a single machine, with complexity I didn't need.

But there was another factor, I had started thinking about how to enable on-prem installs with minimal efforts on our side.

I didn't want to operate k8s clusters, and I certainly didn't want a customer's IT team to operate one to run fluado.

Given we were already using Docker, expanding into Docker Swarm was pretty natural. It provides rolling updates and health-gated rollouts without the complexity of a new system.

The "glue" which in k8s world would be something like Argo or Helm, is just a bunch of bash scripts around Swarm. They do the simple mechanics like pulling a new version, rendering secrets, dumping databases, and more.

## Database and Authentication

> Supabase Cloud -> self-hosted Supabase
>
> Firebase Auth -> Supabase Auth + Scaleway TEM

Interestingely this migration was the simplest in theory but the most surprising in practice.
Given Supabase is open-source, all I had to do was run a box on Hetzner, install Supabase on it and import a dump. Right? Nah.

As I started thinking about it, I realised our Authentication layer was on Firebase (for historical reasons). So moving Auth from Firebase to Supabase was part of the same job. This was simple because in my initial db design I had decoupled authentication from identity. The hard part about this though is that Firebase sends out emails on account creation or forgotten passwords.

So suddenly the migration wasn't only relocating the database and moving auth provider, it also meant finding an email provider. And this required its own research I had not planned nor done. So mid-migration I was now looking up possible solutions, and that's where I decided on Scaleway TEM. The reasons were multiple again, one reason was we had a Scaleway business account already, it's obviously a European company, and if we ever chose to move to PaaS, Scaleway would be a candidate.

But the email story does not end here. I also had to write a new email template, and point its link at a new route in the product, because Supabase Auth's default link goes to an API.

As for the Supabase migration… this was as simple as exporting a dump, deciding a cut-off time, and importing the dump onto the new Hetzner machine. 

## Release Process

> Push-deploy -> pull-based

On GCP the "fastest way" to ship code was a typical push-driven approach to deployments. Cloud Build would build a docker image, push it to the Artifact Registry, and deploy it to Cloud Run as a service account scoped by IAM.

This is all well and good in a setup where the platform manages the trust boundary, however on our own boxes, pushing from CI means holding onto SSH keys or poking an endpoint to trigger a pull.

Holding onto SSH keys has obvious security downsides. Given the alternative is pulling, I decided to fully embrace the [GitOps](https://web.archive.org/web/20230530181135/https://www.weave.works/technologies/gitops/) philosophy with all the goodness that comes from it: declarative configs, a single-source of truth as a git repository, no risks of drifts, and self-healing boxes.

Now CI builds an image, tags it, and commits a version pointer in our "versions" repository. Each box pulls on its own, and CI never touches production.

## Secret Management

> Google Cloud Secret Manager -> Git + Gopass + Age

Now another aspect of GitOps is how secrets are sealed and distributed.

I replaced Secret Manager with gopass, an age-encrypted store, and one git repo per environment. Each box decrypts its own repo with its own key, and the values are written into memory through a tmpfs mount.

Purest simplicity.

## DNS

> Cloudflare DNS -> Hetzner DNS

This was a no-brainer, Cloudflare was only doing DNS for us. We did not use any of the other features like proxying, WAFs, etc. So it was as simple as importing our config into Hetzner and flipping the registrar.

## Networking and TLS

> Cloud Load Balancer + GCP Domain Mapping + Hosting rewrites -> one Caddyfile

This kind of work is the furthest away from my daily work as a software engineer, and I suppose if you aren't a systems engineering this is true for you too.

Therefore, moving away from a Cloud Load Balancer with its proxies, URL maps, serverless NEGs, domain mappings, hosting rewrites, etc. felt a bit like the dog in a lab meme "I Have No Idea What I'm Doing".

With the help of Claude Code I was able to translate all of this complexity into one small Caddyfile that did not exceed 20 lines, solving TLS certificates, domain routing, and where each request goes.

Each environment has its own, committed to the repo, again in the spirit of GitOps.

## Observability

> Google Cloud Logging -> VictoriaLogs
>
> Google Cloud Monitoring -> Gatus + Beszel

Observability suddenly needed a new dimension: Hardware monitoring. On GCP it's not something I really had to think about, the magic of managed infrastructure :) But now, I had to think about "what happens if disks fill up", and "what if memory is insufficient", things like that…
After a bit of research, I decided on Beszel. I wanted a Web UI, not just a TUI, and it does all I want: a simple pane to monitor a bunch of machines, and alerts.

For logging, my first thought went to SigNoz… I am used to DataDog from former projects and the idea to utilise the "open-source alternative" felt extremely appealing, however, I quickly realised SigNoz is a setup I currently do not require, and heavy enough that it would need its own machine.

I decided against it, and instead went for VictoriaLogs, a project I was not familiar with, but its UX quickly reminded me of Google Logs, so it felt good enough. Also an important aspect to me was the license. VictoriaLogs ships as Apache-2.0, and this means, if I want to run this setup on-prem, I can.

As for uptime, I chose Gatus, its config is a simple YAML file, and you might have understood my preference for GitOps by now.

## Operations

> IAP-only SSH -> key-only + fail2ban
>
> Managed platform updates -> nightly container patching

TODO: what we lost with IAP (identity-based access, audit trail), plan to move to managed SSH keys once things settle. What you take over yourself when nobody is patching the base image for you.

## Backups

> Cloud Storage + Snapshots + Supabase backups -> Hetzner Object Storage

On GCP, backups are a simple checkbox. On Hetzner, I needed a real strategy around what to store, where to store, how to store, and how to read it.

The strategy I took is a typical least-privileged approach: every machine dumps its database nightly, encrypts it, and uploads it to a private bucket with object lock. They can only append backups, not read them.

GCP and Supabase also had snapshots enabled, I didn't feel there was a need for this on Hetzner now, since restoring a machine simply means provisioning a new one from git and a backup.

## Chat

> Slack -> self-hosted Mattermost

After Forgejo, self-hosting a chat server felt like no big deal.
I tested Zulip first and burned my eyes and brain on its horrendous UX, so I tried Mattermost instead. It is still a US company, but the product is open-core, so I self-host the open-source version and use none of the features that need their servers.

If you know something better, that still feels like Slack, please let me know :) 

## Still To Do

There are still a couple infrastructural and operational aspects we need to migrate:
 - LetsEncrypt, I could not find a European drop-in replacement. The Italian provider Actalis might be the closest match, but I need to do more research.
 - Google Workspace: Gmail, Google Meet, Google Drive,… this is the heaviest given we rely on the transcript functionality from Google Meet and have our own fluado Agents integrate with Google Workspace APIs. 
 - Coding agents, right now we do most of our heavy lifting with Claude Code, at times we have used other tools and LLM combinations such as Antigravity, OpenCode, Gemini, GLM, Kimicode, etc. The easiest approach is probably an LLM Router with guaranteed EU sovereignity. I am aware of a few providers such as Requesty, EURouter, CortecsAI, etc. but I have not decided yet.

I will update this blog post as I make decisions about them.

## What We Are Not Moving

Some of our customers agents are utilising Gemini models under the hood, we are not planning to move any of these to different providers. Partly due to technical reasons, partly due to contractual obligations.

## Doing This In A Week

This is what surprised me the most. The moment I realised moving from github to Forgejo took me a day, I wondered how fast I can move the rest. I never expected to do this in a week.

Two reasons I could go that fast: I've seen these setups built multiple times in previous companies by extremely capable engineers, and I have also been part of some migrations myself. So I knew more or less what I wanted, or at least the shape of what I wanted.

Projects like these used to stretch months and occupy 2 or 3 people. Doing it with AI, was an absolute game changer, and I am somewhat glad I postponed this "tech debt" for a year, because models like Fable got it done extremely fast.

## Was It Worth It

TODO: cost comparison, what got simpler, what got worse, what I would do differently.


## tl;dr

Two things decided most of this. First, GitOps: git says what should be running, and each box pulls it and sorts itself out. Second, whatever I picked had to run on a customer's own machine, without asking their IT to operate complex systems. That ruled out Kubernetes, and it is why everything fits on a single box.

| | Before | After |
|---|---|---|
| Hardware | GCP | Hetzner |
| Runtime | GCP Cloud Run | Docker Swarm + shell scripts |
| Artifact registry | GCP Artifact Registry | Forgejo |
| Secrets | GCP Secret Manager | gopass + age, in git |
| Networking & TLS | GCP Cloud Load Balancer | one Caddyfile |
| Logs | GCP Cloud Logging | VictoriaLogs |
| Monitoring | GCP Cloud Monitoring | Gatus + Beszel |
| Backups | GCP Cloud Storage + snapshots | Hetzner Object Storage |
| Authentication | Firebase Auth | Supabase Auth |
| Auth emails | Firebase | Scaleway TEM |
| Source code | GitHub | Forgejo |
| Database | Supabase Cloud | self-hosted Supabase |
| DNS | Cloudflare | Hetzner DNS |
| Chat | Slack | self-hosted Mattermost |
| Release process | push from CI | pull-based, GitOps |

And what I skipped:

| | Typical | Instead |
|---|---|---|
| Orchestration | Kubernetes | Docker Swarm, single node |
| Deployment | ArgoCD, Helm | a versions repo and bash |
| Infrastructure as code | Terraform, Ansible | shell scripts and a compose file |
| Self-hosted PaaS | Coolify, Dokploy, Kamal | nothing, Docker is the platform |
| Secrets | Vault | gopass + age |
| Logs | Loki, SigNoz, Grafana | VictoriaLogs |
| Uptime | Uptime Kuma | Gatus |
