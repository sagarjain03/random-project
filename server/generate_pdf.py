"""
Generate docs/compliance_handbook.pdf using reportlab.
Run once: python generate_pdf.py
"""
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable

OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "docs", "compliance_handbook.pdf")

os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)

doc = SimpleDocTemplate(
    OUTPUT_PATH,
    pagesize=A4,
    rightMargin=2.5 * cm,
    leftMargin=2.5 * cm,
    topMargin=2.5 * cm,
    bottomMargin=2.5 * cm,
)

styles = getSampleStyleSheet()

title_style = ParagraphStyle(
    "Title",
    parent=styles["Title"],
    fontSize=22,
    spaceAfter=10,
    textColor=colors.HexColor("#1a1a2e"),
)

subtitle_style = ParagraphStyle(
    "Subtitle",
    parent=styles["Normal"],
    fontSize=11,
    spaceAfter=20,
    textColor=colors.HexColor("#4a4a6a"),
    leading=16,
)

rule_heading_style = ParagraphStyle(
    "RuleHeading",
    parent=styles["Heading2"],
    fontSize=13,
    spaceBefore=18,
    spaceAfter=6,
    textColor=colors.HexColor("#1a1a2e"),
)

body_style = ParagraphStyle(
    "Body",
    parent=styles["Normal"],
    fontSize=10,
    leading=16,
    spaceAfter=8,
    textColor=colors.HexColor("#2c2c3e"),
)

example_style = ParagraphStyle(
    "Example",
    parent=styles["Normal"],
    fontSize=9,
    leading=14,
    leftIndent=20,
    textColor=colors.HexColor("#555577"),
    spaceAfter=6,
)

story = []

# ── Title ────────────────────────────────────────────────────────────
story.append(Paragraph("Blostem Marketing Compliance Handbook", title_style))
story.append(Paragraph(
    "Version 1.0 — April 2025 | Applies to all outbound marketing, email outreach, and AI-generated content.",
    subtitle_style
))
story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#ccccdd"), spaceAfter=20))

# ── Introduction ─────────────────────────────────────────────────────
story.append(Paragraph("Introduction", rule_heading_style))
story.append(Paragraph(
    "This handbook defines the mandatory compliance rules that govern all marketing communications produced "
    "by Blostem, including AI-generated email drafts, sales outreach, and promotional content. Every draft "
    "must be reviewed against these rules before delivery. Violations are to be flagged, rewritten, and "
    "documented before any communication is sent to a prospect or customer.",
    body_style
))
story.append(Spacer(1, 10))

# ── Rule 1 ────────────────────────────────────────────────────────────
story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#ddddee"), spaceAfter=8))
story.append(Paragraph("Rule 1 — Statistical Claims and ROI Figures", rule_heading_style))
story.append(Paragraph(
    "Specific ROI statistics (percentages, dollar amounts, timeframes) require attribution to named "
    "customers or must be qualified with the words <i>\"typically\"</i> or <i>\"on average\"</i>. "
    "Unverified or unattributed quantitative figures in marketing communications violate GDPR Article 6 "
    "marketing guidelines and expose Blostem to regulatory risk.",
    body_style
))
story.append(Paragraph(
    "<b>Non-compliant example:</b> \"Our platform reduces costs by 47% for all customers.\"",
    example_style
))
story.append(Paragraph(
    "<b>Compliant alternative:</b> \"Our platform typically reduces costs by 40–50%, based on average results "
    "across enterprise customers.\"",
    example_style
))

# ── Rule 2 ────────────────────────────────────────────────────────────
story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#ddddee"), spaceAfter=8))
story.append(Paragraph("Rule 2 — Security Certification Claims", rule_heading_style))
story.append(Paragraph(
    "Security certifications (SOC 2, ISO 27001, GDPR compliant, etc.) must include the certification date, "
    "the scope of the certification, and the certifying body when referenced in marketing material. "
    "Stating a certification without this qualification is a misrepresentation and may constitute a "
    "deceptive trade practice.",
    body_style
))
story.append(Paragraph(
    "<b>Non-compliant example:</b> \"Blostem is SOC 2 certified.\"",
    example_style
))
story.append(Paragraph(
    "<b>Compliant alternative:</b> \"Blostem holds a SOC 2 Type II certification (issued March 2024, "
    "scope: platform security controls, certified by Schellman & Company).\"",
    example_style
))

# ── Rule 3 ────────────────────────────────────────────────────────────
story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#ddddee"), spaceAfter=8))
story.append(Paragraph("Rule 3 — Capability and Performance Claims", rule_heading_style))
story.append(Paragraph(
    "Absolute capability claims such as <i>\"fully integrated\"</i>, <i>\"works with everything\"</i>, "
    "or <i>\"zero downtime\"</i> require documented technical evidence or must use appropriately qualified "
    "language such as <i>\"designed to\"</i> or <i>\"built for\"</i>. Overstating product capability without "
    "supporting evidence creates liability and erodes customer trust.",
    body_style
))
story.append(Paragraph(
    "<b>Non-compliant example:</b> \"Our platform guarantees 99.9% uptime.\"",
    example_style
))
story.append(Paragraph(
    "<b>Compliant alternative:</b> \"Our platform is designed for 99.9% uptime and is backed by an SLA "
    "with documented support response times.\"",
    example_style
))

# ── Rule 4 ────────────────────────────────────────────────────────────
story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#ddddee"), spaceAfter=8))
story.append(Paragraph("Rule 4 — Competitor Comparisons", rule_heading_style))
story.append(Paragraph(
    "Competitor comparisons are prohibited in all marketing and sales communications unless they are "
    "supported by documented, third-party benchmark sources. Internal benchmarks or unverified internal "
    "comparisons do not constitute acceptable evidence. Misleading competitor comparisons may violate the "
    "Unfair Commercial Practices Directive (EU) and equivalent regulations in other jurisdictions.",
    body_style
))
story.append(Paragraph(
    "<b>Non-compliant example:</b> \"Blostem outperforms Competitor X on every metric.\"",
    example_style
))
story.append(Paragraph(
    "<b>Compliant alternative:</b> \"Based on [Third-Party Report, Year], Blostem ranked highest for "
    "[specific metric] among platforms evaluated in the [category] segment.\"",
    example_style
))

# ── Rule 5 ────────────────────────────────────────────────────────────
story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#ddddee"), spaceAfter=8))
story.append(Paragraph("Rule 5 — Customer Success Metrics and Attribution", rule_heading_style))
story.append(Paragraph(
    "Customer success metrics referenced in marketing material must be anonymised (e.g., <i>\"a leading "
    "FinTech company\"</i>) or must have the explicit, documented written consent of the customer for "
    "named attribution. Using customer names, logos, or specific outcome data without consent violates "
    "confidentiality agreements and GDPR data processing obligations.",
    body_style
))
story.append(Paragraph(
    "<b>Non-compliant example:</b> \"Nexora Systems achieved 3x pipeline growth using Blostem.\"",
    example_style
))
story.append(Paragraph(
    "<b>Compliant alternative:</b> \"A Series B FinTech customer achieved 3x pipeline growth within "
    "6 months [customer reference available on request under NDA].\"",
    example_style
))

# ── Footer note ───────────────────────────────────────────────────────
story.append(Spacer(1, 20))
story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#ccccdd"), spaceAfter=10))
story.append(Paragraph(
    "Questions about these rules should be directed to the Blostem Legal & Compliance team. "
    "This handbook is reviewed and updated quarterly. Last review: April 2025.",
    example_style
))

doc.build(story)
print(f"[OK] PDF generated: {OUTPUT_PATH}")
