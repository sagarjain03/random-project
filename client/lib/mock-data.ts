import { Lead } from "@/types"

export const MOCK_LEADS: Lead[] = [
  {
    id: "1",
    name: "Nexora Systems",
    industry: "FinTech",
    score: 91,
    signals: [
      { label: "Series B raised", detail: "$40M raised last month — active budget for new tools" },
      { label: "CTO hire", detail: "New CTO appointed 3 weeks ago, historically drives vendor changes" },
      { label: "Headcount growth", detail: "Engineering team grew 60% in 6 months" },
    ],
  },
  {
    id: "2",
    name: "Orbis Health",
    industry: "HealthTech",
    score: 78,
    signals: [
      { label: "Expansion signal", detail: "Opened 3 new regional offices in Q3" },
      { label: "Tech stack change", detail: "Migrating from legacy CRM to Salesforce" },
    ],
  },
  {
    id: "3",
    name: "Stratford Logistics",
    industry: "Supply Chain",
    score: 65,
    signals: [
      { label: "Leadership change", detail: "New VP of Operations joined from a Blostem partner company" },
      { label: "RFP activity", detail: "Posted 2 vendor RFPs in the last 60 days" },
    ],
  },
  {
    id: "4",
    name: "Velorum Energy",
    industry: "CleanTech",
    score: 82,
    signals: [
      { label: "Government contract", detail: "Won $120M federal contract — procurement cycle starting" },
      { label: "Compliance pressure", detail: "New ESG reporting mandate requires new software stack" },
      { label: "Board change", detail: "3 new board members with SaaS backgrounds" },
    ],
  },
  {
    id: "5",
    name: "Pinnacle Retail",
    industry: "Retail",
    score: 44,
    signals: [
      { label: "Slow growth", detail: "Revenue growth at 4% YoY, below industry average" },
    ],
  },
  {
    id: "6",
    name: "Arctis Manufacturing",
    industry: "Industrial",
    score: 57,
    signals: [
      { label: "Digital push", detail: "CEO publicly committed to 'digital-first' strategy for 2025" },
      { label: "Budget cycle", detail: "Annual procurement window opens next quarter" },
    ],
  },
  {
    id: "7",
    name: "Luminary Media",
    industry: "Media & Ad Tech",
    score: 73,
    signals: [
      { label: "Acquisition", detail: "Acquired smaller competitor — integration spend expected" },
      { label: "New product launch", detail: "Launching B2B arm, needs enterprise tooling" },
    ],
  },
]

import { OutreachDrafts } from "@/types"

export const MOCK_OUTREACH: Record<string, OutreachDrafts> = {
  "1": {
    cto_draft: `Subject: How Blostem integrates with Nexora's stack in under a day

Hi [CTO Name],

Congrats on the Series B — the engineering scale-up you're driving is impressive.

I'll be direct: most tools at your stage create integration debt. Blostem is built differently. Our REST API is fully documented, sandbox-ready, and has native connectors for the modern data stack — so your team isn't blocked waiting on professional services.

Two things I think will matter to you specifically:
— Zero-downtime deployment: we run on your infra or ours, with SOC 2 Type II and GDPR controls baked in, not bolted on.
— Single-tenant option: given your fintech compliance requirements, we can isolate your environment completely.

Worth a 20-minute technical call this week? I can have our solutions engineer join.

Best,
[Your name]`,

    cfo_draft: `Subject: Nexora's ROI case for Blostem — numbers first

Hi [CFO Name],

Series B means your board is watching burn rate closely. I won't waste your time.

Here's what our last 3 fintech customers at your stage saw in the first 90 days:
— 34% reduction in outbound campaign cost per qualified lead
— $180K saved annually by consolidating 3 point solutions into Blostem
— Payback period: 4.2 months on average

We price on seats, not usage, so your costs are predictable as you scale. No surprise invoices.

I can send a customised ROI model for Nexora's headcount and growth trajectory if useful — takes me 10 minutes to build.

Happy to connect?

Best,
[Your name]`,

    user_draft: `Subject: Your team will actually use this one

Hi [Team Lead Name],

Most enterprise tools get bought by the C-suite and ignored by the people doing the actual work. We built Blostem the other way around.

A few things your team will notice on day one:
— No training required: the interface is built around how outreach teams already work, not how software vendors think they work.
— One dashboard for everything: leads, drafts, compliance checks — no tab-switching between 4 tools.
— AI does the heavy lifting: generate a fully personalised draft in 8 seconds, edit it, send it. That's the whole flow.

I'd love to show you a live demo — 15 minutes, no slides. Just the product.

[Your name]`,
  },

  "4": {
    cto_draft: `Subject: Blostem + Velorum's new compliance stack

Hi [CTO Name],

The ESG reporting mandate you're navigating is a real infrastructure problem, not just a compliance checkbox. We've helped 2 other energy companies solve exactly this in the last 6 months.

Blostem's compliance module runs a RAG layer over your internal policy documents — every AI-generated output is cross-referenced before it leaves the system. No unverified claims, no GDPR exposure.

Happy to do a technical walkthrough of how we'd plug into Velorum's existing stack.

[Your name]`,

    cfo_draft: `Subject: Your $120M contract just opened a procurement window

Hi [CFO Name],

Federal contracts at Velorum's scale come with serious vendor scrutiny. Blostem is FedRAMP-aligned and has been through procurement cycles at 3 other government contractors this year — we know how to move fast without creating compliance risk.

Our enterprise tier is fixed-cost, auditable, and comes with an SLA that satisfies most federal procurement requirements out of the box.

Want me to send the compliance and pricing overview?

[Your name]`,

    user_draft: `Subject: Less copy-pasting, more closing

Hi [Team Name],

We know your outreach team is managing a huge pipeline post-contract win. Blostem automates the personalisation work — your reps describe the prospect, the AI drafts the email, compliance checks it automatically.

Average time saved per rep: 2.5 hours per day.

Worth seeing?

[Your name]`,
  },
}

export function getMockOutreach(leadId: string): OutreachDrafts {
  return (
    MOCK_OUTREACH[leadId] ?? {
      cto_draft: `Subject: A technical conversation worth having\n\nHi [CTO Name],\n\nI'd love to show you how Blostem fits into your current stack.\n\n[Your name]`,
      cfo_draft: `Subject: The ROI case for Blostem\n\nHi [CFO Name],\n\nOur customers see payback in under 5 months. Happy to share the numbers.\n\n[Your name]`,
      user_draft: `Subject: Built for the people actually doing the work\n\nHi [Team Name],\n\nBlostem cuts the repetitive parts of outreach so your team can focus on conversations.\n\n[Your name]`,
    }
  )
}

import { ComplianceResult } from "@/types"

export const MOCK_COMPLIANCE: Record<string, ComplianceResult> = {
  cto_draft: {
    status: "flagged",
    flags: [
      {
        sentence: "our REST API is fully documented, sandbox-ready, and has native connectors for the modern data stack",
        rule: "Unverified capability claim — must link to documentation or qualify with 'currently supported' language",
        rewrite: "our REST API documentation and sandbox environment are available for evaluation, with connectors for commonly used data stack tools",
      },
      {
        sentence: "we run on your infra or ours, with SOC 2 Type II and GDPR controls baked in, not bolted on",
        rule: "Compliance certification claim requires verified date and scope — SOC 2 Type II must not be stated without qualification",
        rewrite: "we support both cloud-hosted and self-hosted deployments, and our platform is designed with SOC 2 Type II and GDPR alignment in mind — certification details available on request",
      },
    ],
  },
  cfo_draft: {
    status: "flagged",
    flags: [
      {
        sentence: "34% reduction in outbound campaign cost per qualified lead",
        rule: "Specific ROI statistic requires attribution — unverified quantitative claims violate GDPR marketing guidelines and internal brand policy",
        rewrite: "customers have reported meaningful reductions in outbound campaign cost per qualified lead — we can share anonymised case study data on request",
      },
      {
        sentence: "$180K saved annually by consolidating 3 point solutions into Blostem",
        rule: "Dollar-value saving claim requires customer attribution or must be qualified as illustrative",
        rewrite: "consolidating multiple point solutions into Blostem has helped customers reduce tooling costs — specific figures available in our ROI model",
      },
      {
        sentence: "Payback period: 4.2 months on average",
        rule: "Average payback period is an unverified aggregate claim — requires data source or must be qualified",
        rewrite: "based on customer feedback, payback periods have typically fallen within a single business quarter — we can model this for your specific context",
      },
    ],
  },
  user_draft: {
    status: "clear",
    flags: [],
  },
}

export function getMockCompliance(draftKey: string): ComplianceResult {
  return (
    MOCK_COMPLIANCE[draftKey] ?? {
      status: "clear",
      flags: [],
    }
  )
}

import { NudgeItem } from "@/types"

export const MOCK_NUDGE_QUEUE: NudgeItem[] = [
  {
    partner_id: "p1",
    name: "Meridian Consulting Group",
    days_inactive: 23,
    stage: "Onboarding",
    draft_email: `Subject: Getting Meridian up and running — we're here to help

Hi [Name],

It's been a few weeks since you signed on with Blostem, and we noticed you haven't had a chance to complete the onboarding setup yet. That's completely normal — we know Q4 gets hectic.

Here's what takes less than 10 minutes to get your first campaign live:
1. Connect your CRM (we support HubSpot, Salesforce, and Pipedrive out of the box)
2. Upload your compliance handbook so our RAG layer can protect your outreach
3. Score your first batch of leads — just paste in a company name and we handle the rest

I've also attached a Quick Start guide specific to consulting firms that shows how teams like yours typically use Blostem in the first 30 days.

Happy to jump on a 15-minute call this week to walk through it together.

Best,
[Your name]
Blostem Partner Success`,
  },
  {
    partner_id: "p2",
    name: "Altus Financial Partners",
    days_inactive: 31,
    stage: "Integration",
    draft_email: `Subject: Your Blostem integration — quick unblock

Hi [Name],

We noticed the API integration for Altus hasn't been completed yet. Our engineering team flagged that this sometimes happens when the sandbox credentials aren't set up correctly — an easy fix.

Here's a direct link to the integration checklist for financial services firms: [link]

Two things that typically unblock teams at this stage:
— Make sure your IP whitelist includes our outbound range (documented here: [link])
— The API key in your dashboard needs to be rotated if it's older than 30 days

If it's a resourcing issue and your team needs more time, just let us know — we can extend your trial period at no cost.

Best,
[Your name]
Blostem Partner Success`,
  },
  {
    partner_id: "p3",
    name: "Crestwood Ventures",
    days_inactive: 9,
    stage: "Active",
    draft_email: `Subject: A feature you'll want to try this week

Hi [Name],

Great to see Crestwood active on the platform. One thing we've noticed top-performing partners do in month 2: they start using the persona switching feature to generate CTO and CFO variants of the same outreach in one click.

Given your deal sizes, we think this could meaningfully improve your reply rates on enterprise accounts.

Worth a quick look — it's already in your dashboard under Outreach > Persona mode.

Best,
[Your name]
Blostem Partner Success`,
  },
  {
    partner_id: "p4",
    name: "Ironclad Systems",
    days_inactive: 47,
    stage: "Stalled",
    draft_email: `Subject: Checking in — is there anything blocking Ironclad?

Hi [Name],

We haven't seen any activity on the Ironclad account in about 6 weeks, and we want to make sure there isn't something on our end causing friction.

A few things we can help with right away:
— If the initial setup felt overwhelming, we can assign a dedicated onboarding engineer for a week at no extra cost
— If there's a budget or approval issue internally, we're happy to provide documentation that supports your procurement process
— If the product isn't meeting a specific need, we'd genuinely like to know — your feedback directly shapes our roadmap

No pressure either way. If things have changed on your end and Blostem isn't the right fit right now, just let us know and we'll pause your account gracefully.

Best,
[Your name]
Blostem Partner Success`,
  },
  {
    partner_id: "p5",
    name: "Beacon Growth Partners",
    days_inactive: 14,
    stage: "Onboarding",
    draft_email: `Subject: Two weeks in — how's Beacon getting on?

Hi [Name],

Two weeks in is usually when teams start hitting their first real questions. We wanted to check in proactively.

A few things that tend to come up at this stage:
— How to structure your first lead scoring batch for the best signal quality
— Setting up your brand voice guidelines so drafts stay consistent
— Understanding the compliance handbook format we support

Our onboarding docs cover all of these, but sometimes it's faster to just ask. Reply here or book a slot with our team: [link]

Best,
[Your name]
Blostem Partner Success`,
  },
]