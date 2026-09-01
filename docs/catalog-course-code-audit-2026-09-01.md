# Catalogue course-code audit — 1 September 2026

## Result

- Exam bundles audited: 80
- Bundles with a verified Tertiary Courses TGS alias: 42
- Verified TGS aliases: 44
- Bundles without a verified TGS alias: 38
- Duplicate or conflicting TGS aliases: 0

TGS identifiers are training-course codes, not certification exam codes. They
are therefore maintained as catalogue search aliases instead of being written
to the exam records. A TGS alias is added only when an authoritative Tertiary
Courses page explicitly identifies the matching course and code.

## Additions from this audit

| Exam bundle | Verified course code | Source |
| --- | --- | --- |
| Claude Certified Architect — Foundations | `TGS-2026061312` | WSQ – Claude Certified Architect Foundation |
| CompTIA PenTest+ | `TGS-2026064471` | CASL – CompTIA PenTest+ Training |
| Lean Six Sigma Green Belt | `TGS-2025055775` | WSQ – Certified Lean Six Sigma Green Belt Training |

## Bundles intentionally left without a TGS alias

No exact, authoritative TGS match was established for these 38 bundles:

- Anthropic Claude Certified Developer – Foundations
- Anthropic Claude Certified Architect – Professional
- Anthropic Claude Certified AI Operations – Foundations
- Professional Scrum Master I
- Microsoft SC-200
- HashiCorp Vault Associate
- Google Professional Cloud DevOps Engineer
- Microsoft SC-100
- Microsoft DP-600
- Google Professional Cloud Network Engineer
- Oracle OCI Foundations
- CompTIA Project+
- ISC2 SSCP
- Linux Foundation KCSA
- Oracle Java SE 17 Developer
- PMI Risk Management Professional
- HashiCorp Consul Associate
- Microsoft MS-700
- Microsoft MS-102
- Red Hat Certified System Administrator
- Linux Foundation CKS
- PMI CAPM
- Google Professional Cloud Architect
- Google Professional Data Engineer
- HashiCorp Terraform Associate
- Docker Certified Associate
- GitLab Certified Associate
- Microsoft AZ-305
- Microsoft AZ-204
- Microsoft SC-900
- ISC2 CCSP
- Professional Scrum Product Owner I
- Cisco CCNP Security
- Cisco DevNet Associate
- PMI Agile Certified Practitioner
- Microsoft PL-600
- ISC2 Certified in Cybersecurity
- PMI Project Management Professional

Several of these have a non-funded Tertiary Courses identifier, such as `C523`
for PMP, `C698` for Scrum training, and `C1799` for CKS. Those codes are not TGS
identifiers and are kept as separate search aliases rather than being silently
substituted for a TGS code.

## Verified non-TGS search aliases

| Exam bundle | Course code |
| --- | --- |
| Claude Certified Architect — Foundations | `C437` |
| Claude Certified Architect — Professional | `C364` |
| CompTIA PenTest+ | `C1136` |
| Lean Six Sigma Green Belt | `C481` |
| Certified Kubernetes Security Specialist | `C1799` |
| PMI Project Management Professional | `C523` |
| Professional Scrum Master I | `C698` |

## Audit safeguards

- Numeric identifier searches must match the complete normalized identifier;
  a shared prefix such as `TGS` cannot produce a result.
- Every alias must resolve to exactly one bundle.
- Related-course widgets and incidental TGS codes on a page are not accepted as
  evidence for the page's own course code.
