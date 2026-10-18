/**
 * Claude Certified Associate — Foundations (CCAO-F) — Mock Exams 1–3
 * (bundle variants P2, P3, P4). Three timed 15-question mock exams
 * (30 minutes each), seeded by `seedCcaoFoundations()` in the sibling
 * `ccao-foundations-questions.ts` module.
 *
 * Mock exam questions © Amey Thakur, CLAUDE-CERTIFICATIONS, MIT License.
 * Source: https://github.com/Amey-Thakur/CLAUDE-CERTIFICATIONS/tree/main/associate-foundations
 *   (mock-exam-1.md, mock-exam-2.md, mock-exam-3.md)
 *
 * Full license notice, reproduced from the source repository:
 *
 *   MIT License
 *
 *   Copyright (c) 2026 Amey Thakur
 *
 *   Permission is hereby granted, free of charge, to any person obtaining a copy
 *   of this software and associated documentation files (the "Software"), to deal
 *   in the Software without restriction, including without limitation the rights
 *   to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *   copies of the Software, and to permit persons to whom the Software is
 *   furnished to do so, subject to the following conditions:
 *
 *   The above copyright notice and this permission notice shall be included in all
 *   copies or substantial portions of the Software.
 *
 *   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *   IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *   FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *   AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *   LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *   OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 *   SOFTWARE.
 *
 * Per the source: original questions written against the public CCAO-F
 * blueprint — not items from the live exam.
 *
 * Content is kept verbatim from the source (stems, options, answer key). Two
 * mechanical adaptations only:
 *   - Each explanation is the answer key's "Why" rationale, prefixed with the
 *     correct option's text so ExplanationView renders it as the titled
 *     "Correct option".
 *   - Positional letter references in the rationale ("(B)", "(A, C)") are
 *     stripped, because the runner shuffles option positions per attempt and
 *     the letters would point at the wrong option. A closing period is added
 *     where the table cell had none.
 *
 * Domain strings MUST exactly match CCAO_DOMAINS in ccao-foundations-questions.ts
 * (the exam blueprint) so the per-domain results breakdown maps; the seed
 * asserts this at run time.
 *
 * No `isTeaser` flags: the bundle page only ever links the teaser for the
 * first PRACTICE item (P1, which has its own curated teaser set), and the
 * mock exams are hidden from the catalog, so no teaser link reaches them.
 */
import { QType } from '@prisma/client';

export type Opt = { id: string; text: string };
export type CcaoMockQ = {
  domain: string;
  difficulty: number;
  type: QType;
  stem: string;
  options: Opt[];
  correct: string[];
  explanation: string;
  references: { label: string; url: string }[];
  isTeaser?: boolean;
};

const PROMPTING = 'Prompting and Task Execution';
const OUTPUT = 'Output Evaluation and Validation';
const SELECTION = 'Product and Model Selection';
const WORKFLOW = 'Workflow Integration and Solution Design';
const CONFIG = 'Configuration and Knowledge Management';
const GOVERNANCE = 'Governance, Risk, and Responsible Use';
const TROUBLESHOOT = 'Troubleshooting and Optimization';

// Vendor's official exam page (same URL as CCAO_INFO_URL in the P1 module).
const REF_EXAM_INFO = {
  label: 'Anthropic — Claude Certified Associate — Foundations (official exam page)',
  url: 'https://anthropic-partners.skilljar.com/claude-certified-associate-foundations-certification'
};

// Same option-id convention as P1: lowercase a–d in source order (A–D).
const opts4 = (a: string, b: string, c: string, d: string): Opt[] => [
  { id: 'a', text: a }, { id: 'b', text: b }, { id: 'c', text: c }, { id: 'd', text: d }
];

// ───────────────────── Mock exam 1 (15) ─────────────────────
const REF_MOCK1 = { label: 'CLAUDE-CERTIFICATIONS — Associate Foundations mock exam 1 (MIT)', url: 'https://github.com/Amey-Thakur/CLAUDE-CERTIFICATIONS/blob/main/associate-foundations/mock-exam-1.md' };

export const CCAO_MOCK1: CcaoMockQ[] = [
  {
    domain: OUTPUT, difficulty: 2, type: QType.SINGLE,
    stem: 'A colleague shares a Claude-drafted policy summary that reads well and cites three internal documents by name. What is the appropriate review step before it circulates to the whole department?',
    options: opts4(
      'Circulate it, since the named sources demonstrate grounding',
      'Ask Claude to double-check its own work and circulate if it agrees',
      'Confirm each named document exists and says what the summary claims',
      'Add a disclaimer that the summary was AI-generated and circulate'
    ),
    correct: ['c'],
    explanation: 'Confirm each named document exists and says what the summary claims\nNamed sources can be fabricated; verification against the actual documents is the diligence step. Self-checking is not independent evidence, and a disclaimer does not make content correct.',
    references: [REF_EXAM_INFO, REF_MOCK1]
  },
  {
    domain: PROMPTING, difficulty: 2, type: QType.SINGLE,
    stem: 'You need a first draft of a stakeholder update from a long project log. Which prompt is most likely to produce a usable draft on the first attempt?',
    options: opts4(
      '"Summarize this project log."',
      '"Write something good about this project log for my boss."',
      '"Summarize this project log. Be detailed and thorough and professional."',
      '"You are writing a weekly update for non-technical executives. From the log, produce: status in one line, three progress items, two risks with owners, and next week\'s focus. Keep it under 200 words."'
    ),
    correct: ['d'],
    explanation: '"You are writing a weekly update for non-technical executives. From the log, produce: status in one line, three progress items, two risks with owners, and next week\'s focus. Keep it under 200 words."\nRole, audience, explicit structure, and length constraints are what turn a vague request into a usable draft. Intensifiers like "detailed and thorough" add no structure.',
    references: [REF_EXAM_INFO, REF_MOCK1]
  },
  {
    domain: SELECTION, difficulty: 2, type: QType.SINGLE,
    stem: 'A workflow drafts hundreds of routine appointment confirmations each day. Latency and cost dominate; the language is formulaic. Which choice fits?',
    options: opts4(
      'A fast, low-cost model, reserving a more capable one for exceptions',
      'The most capable model, for consistency',
      'Whichever model is newest',
      'Alternate between models to spread cost'
    ),
    correct: ['a'],
    explanation: 'A fast, low-cost model, reserving a more capable one for exceptions\nMatch the model tier to the work: fast and cheap for formulaic volume, capable for exceptions.',
    references: [REF_EXAM_INFO, REF_MOCK1]
  },
  {
    domain: CONFIG, difficulty: 2, type: QType.SINGLE,
    stem: 'Your team\'s Project answers questions from a product manual. Users report confident answers about a feature that was removed last quarter. What is the most likely cause?',
    options: opts4(
      'The model needs retraining',
      'The Project\'s knowledge still contains the outdated manual',
      'Users are asking the questions wrong',
      'The context window is too small'
    ),
    correct: ['b'],
    explanation: 'The Project\'s knowledge still contains the outdated manual\nProject knowledge is maintained by you; stale documents produce confidently outdated answers.',
    references: [REF_EXAM_INFO, REF_MOCK1]
  },
  {
    domain: GOVERNANCE, difficulty: 2, type: QType.SINGLE,
    stem: 'Legal asks you to analyze a spreadsheet of support tickets containing customer names and email addresses. Your organization prohibits sending personal data to external tools. What do you do?',
    options: opts4(
      'Upload it, since legal requested the analysis',
      'Upload it and ask Claude to disregard the personal columns',
      'Strip or pseudonymize the personal columns, then analyze what remains',
      'Tell legal the analysis is not possible'
    ),
    correct: ['c'],
    explanation: 'Strip or pseudonymize the personal columns, then analyze what remains\nMake the task compliant, then do it. A requester\'s seniority does not override policy, and instructing the model to ignore data does not un-send it.',
    references: [REF_EXAM_INFO, REF_MOCK1]
  },
  {
    domain: PROMPTING, difficulty: 2, type: QType.SINGLE,
    stem: 'Claude produces a five-paragraph answer when you needed three bullet points, twice in a row. What is the most effective adjustment?',
    options: opts4(
      'Ask again and hope for variation',
      'Switch to a more capable model',
      'Manually reformat each response',
      'State the format explicitly, including the number of bullets and their maximum length'
    ),
    correct: ['d'],
    explanation: 'State the format explicitly, including the number of bullets and their maximum length\nFormat failures are fixed by stating the format, not by re-rolling or upgrading the model.',
    references: [REF_EXAM_INFO, REF_MOCK1]
  },
  {
    domain: OUTPUT, difficulty: 2, type: QType.SINGLE,
    stem: 'Which of these is the strongest signal that a Claude-generated claim needs verification before use?',
    options: opts4(
      'The claim is a specific number, date, or citation that would matter if wrong',
      'The answer is long',
      'The answer was produced quickly',
      'The answer uses technical vocabulary'
    ),
    correct: ['a'],
    explanation: 'The claim is a specific number, date, or citation that would matter if wrong\nSpecific, consequential details are the highest-risk surface for fabrication. Length, speed, and vocabulary carry no accuracy signal.',
    references: [REF_EXAM_INFO, REF_MOCK1]
  },
  {
    domain: WORKFLOW, difficulty: 2, type: QType.SINGLE,
    stem: 'A manager wants to know whether Claude can "replace our weekly reporting process." What is the most useful response?',
    options: opts4(
      'Yes, automation is what AI is for',
      'A breakdown of which reporting steps Claude can draft or summarize, which need human judgment or system access, and what the review step would be',
      'No, reporting requires human oversight',
      'A recommendation to hire a consultant'
    ),
    correct: ['b'],
    explanation: 'A breakdown of which reporting steps Claude can draft or summarize, which need human judgment or system access, and what the review step would be\nThe valued skill is a realistic division of labor with a review step, not a yes or a no.',
    references: [REF_EXAM_INFO, REF_MOCK1]
  },
  {
    domain: CONFIG, difficulty: 2, type: QType.SINGLE,
    stem: 'You are configuring a Project that several colleagues will use for consistent client communications. What belongs in the Project instructions rather than in each individual prompt?',
    options: opts4(
      'The specific client\'s name for today\'s message',
      'Today\'s date',
      'The house tone, required disclaimers, and the standard structure of a client message',
      'The colleague\'s personal writing preferences'
    ),
    correct: ['c'],
    explanation: 'The house tone, required disclaimers, and the standard structure of a client message\nDurable, shared conventions belong in instructions; per-message specifics belong in the prompt.',
    references: [REF_EXAM_INFO, REF_MOCK1]
  },
  {
    domain: OUTPUT, difficulty: 2, type: QType.SINGLE,
    stem: 'A summary Claude produced omits a material caveat that appears in the source document. What does this failure mode illustrate?',
    options: opts4(
      'Hallucination through fabricated detail',
      'A context window limit',
      'A prompt injection attack',
      'Omission, which requires reading the source rather than only reviewing the output'
    ),
    correct: ['d'],
    explanation: 'Omission, which requires reading the source rather than only reviewing the output\nOmission is as damaging as fabrication and is only visible if you read the source, not just the output.',
    references: [REF_EXAM_INFO, REF_MOCK1]
  },
  {
    domain: TROUBLESHOOT, difficulty: 2, type: QType.SINGLE,
    stem: 'Your prompt worked well last month and now returns weaker results after your team added twelve documents to the Project\'s knowledge. What is the first thing to investigate?',
    options: opts4(
      'Whether the new documents are diluting or contradicting the sources the answers should use',
      'Whether the model changed',
      'Whether colleagues are using different browsers',
      'Whether the prompt should be longer'
    ),
    correct: ['a'],
    explanation: 'Whether the new documents are diluting or contradicting the sources the answers should use\nDiagnose the change that coincided with the regression before rewriting anything.',
    references: [REF_EXAM_INFO, REF_MOCK1]
  },
  {
    domain: WORKFLOW, difficulty: 2, type: QType.SINGLE,
    stem: 'For which task is a Project with persistent instructions and knowledge clearly better than a one-off chat?',
    options: opts4(
      'Asking for a synonym',
      'A monthly report that follows the same structure and draws on the same reference documents',
      'Checking a single fact',
      'Rewriting one email'
    ),
    correct: ['b'],
    explanation: 'A monthly report that follows the same structure and draws on the same reference documents\nRepeated work with stable context and structure is exactly what Projects are for.',
    references: [REF_EXAM_INFO, REF_MOCK1]
  },
  {
    domain: OUTPUT, difficulty: 2, type: QType.SINGLE,
    stem: 'Which practice best reduces the risk of sharing an inaccurate Claude output with a customer?',
    options: opts4(
      'Reading the output for tone before sending',
      'Sending it with a note that AI assisted',
      'Verifying the claims that would cause harm if wrong, then having a second person review customer-facing material',
      'Using the largest available model'
    ),
    correct: ['c'],
    explanation: 'Verifying the claims that would cause harm if wrong, then having a second person review customer-facing material\nVerification of consequential claims plus human review for customer-facing material. Model size is not a control.',
    references: [REF_EXAM_INFO, REF_MOCK1]
  },
  {
    domain: WORKFLOW, difficulty: 2, type: QType.SINGLE,
    stem: 'You want Claude to help redesign a slow approval process rather than just speed up its current steps. Which prompt direction fits that goal?',
    options: opts4(
      '"Make our approval process faster."',
      '"Automate our approvals."',
      '"What do other companies do for approvals?"',
      '"Here are the current approval steps and where delays occur. Propose two redesigns: one that keeps the current structure and one that reorders or removes steps, with the tradeoffs of each."'
    ),
    correct: ['d'],
    explanation: '"Here are the current approval steps and where delays occur. Propose two redesigns: one that keeps the current structure and one that reorders or removes steps, with the tradeoffs of each."\nProcess redesign requires giving Claude the current steps, the pain points, and asking for alternatives with tradeoffs.',
    references: [REF_EXAM_INFO, REF_MOCK1]
  },
  {
    domain: GOVERNANCE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which situation most clearly calls for escalating to a technical colleague rather than solving it yourself?',
    options: opts4(
      'A request to connect Claude directly to the company\'s internal order database through an integration',
      'A prompt that needs better structure',
      'An output with the wrong tone',
      'A Project that needs its knowledge updated'
    ),
    correct: ['a'],
    explanation: 'A request to connect Claude directly to the company\'s internal order database through an integration\nSystem integrations belong to the Developer and Architect scope; recognizing that boundary is an Associate competency.',
    references: [REF_EXAM_INFO, REF_MOCK1]
  }
];

// ───────────────────── Mock exam 2 (15) ─────────────────────
const REF_MOCK2 = { label: 'CLAUDE-CERTIFICATIONS — Associate Foundations mock exam 2 (MIT)', url: 'https://github.com/Amey-Thakur/CLAUDE-CERTIFICATIONS/blob/main/associate-foundations/mock-exam-2.md' };

export const CCAO_MOCK2: CcaoMockQ[] = [
  {
    domain: OUTPUT, difficulty: 2, type: QType.SINGLE,
    stem: 'Claude returns a policy answer that matches your expectation exactly, with no citation. What does the match tell you?',
    options: opts4(
      'The answer is confirmed, since it agrees with your understanding',
      'The answer is probably correct but should be reworded',
      'Nothing about accuracy, because agreement with an expectation is not evidence',
      'The model has read the policy document'
    ),
    correct: ['c'],
    explanation: 'Nothing about accuracy, because agreement with an expectation is not evidence\nAgreement with what you already believed is the easiest error to miss, since nothing prompts a check. Neither confirmation, rewording, nor an assumption about retrieval establishes that the claim is true.',
    references: [REF_EXAM_INFO, REF_MOCK2]
  },
  {
    domain: OUTPUT, difficulty: 2, type: QType.SINGLE,
    stem: 'A colleague asks Claude to check its own earlier answer, and it confirms the answer. How much weight does the confirmation carry?',
    options: opts4(
      'None on its own, because the check is not independent of the thing being checked',
      'Substantial, because the model reviewed its own reasoning',
      'Substantial if the confirmation is detailed',
      'It depends on the model used'
    ),
    correct: ['a'],
    explanation: 'None on its own, because the check is not independent of the thing being checked\nSelf-review is not an independent source and cannot establish correctness. Detail and model choice do not make a self-check independent.',
    references: [REF_EXAM_INFO, REF_MOCK2]
  },
  {
    domain: OUTPUT, difficulty: 2, type: QType.SINGLE,
    stem: 'A report drafted with Claude contains one figure you cannot verify from any available source. What is the appropriate handling before circulation?',
    options: opts4(
      'Circulate it with a general disclaimer about AI assistance',
      'Keep the figure and mark it as an estimate',
      'Ask Claude to provide a source and keep whatever it returns',
      'Remove the figure and note that it could not be verified'
    ),
    correct: ['d'],
    explanation: 'Remove the figure and note that it could not be verified\nAn unverifiable claim should not be presented as fact, and a labeled gap is honest. A blanket disclaimer does not address the specific figure, an unfounded estimate misrepresents it, and a citation produced on demand needs the same verification.',
    references: [REF_EXAM_INFO, REF_MOCK2]
  },
  {
    domain: WORKFLOW, difficulty: 2, type: QType.SINGLE,
    stem: 'Which of these is the strongest candidate to hand to Claude in a monthly close process?',
    options: opts4(
      'Approving the final journal entries',
      'Drafting the variance commentary from figures that are already agreed',
      'Deciding which variances require investigation',
      'Signing off the reconciliation'
    ),
    correct: ['b'],
    explanation: 'Drafting the variance commentary from figures that are already agreed\nDrafting from agreed inputs is bounded and checkable. Approval, sign-off, and the decision about what to investigate all carry accountability.',
    references: [REF_EXAM_INFO, REF_MOCK2]
  },
  {
    domain: WORKFLOW, difficulty: 2, type: QType.SINGLE,
    stem: 'A workflow produces good output but nobody uses it. What should be examined first?',
    options: opts4(
      'Whether the model should be upgraded',
      'Whether the output arrives where the work actually happens, in a form people can act on',
      'Whether the prompt is long enough',
      'Whether more people need training'
    ),
    correct: ['b'],
    explanation: 'Whether the output arrives where the work actually happens, in a form people can act on\nAdoption usually fails on fit with the existing process rather than on output quality. Model and prompt length address quality that is already acceptable, and training treats a symptom.',
    references: [REF_EXAM_INFO, REF_MOCK2]
  },
  {
    domain: GOVERNANCE, difficulty: 2, type: QType.SINGLE,
    stem: 'A team wants to paste anonymised customer feedback into Claude for theme analysis. What remains a risk after names are removed?',
    options: opts4(
      'Nothing, since anonymisation removes the risk entirely',
      'The model may store the text permanently',
      'Theme analysis is unreliable on anonymised data',
      'Free text can still identify people through specific details, so review before sending is still needed'
    ),
    correct: ['d'],
    explanation: 'Free text can still identify people through specific details, so review before sending is still needed\nRemoving names does not remove identifying detail from free text, which is why a review step remains. Treating anonymisation as complete is the error tested, and neither storage assumptions nor reliability is the governance issue here.',
    references: [REF_EXAM_INFO, REF_MOCK2]
  },
  {
    domain: GOVERNANCE, difficulty: 2, type: QType.SINGLE,
    stem: 'Who should decide whether a Claude-assisted output is fit to send to a customer?',
    options: opts4(
      'The person accountable for the customer relationship',
      'Whoever wrote the prompt',
      'The model, if asked to assess its own output',
      'Nobody, if the workflow was approved in advance'
    ),
    correct: ['a'],
    explanation: 'The person accountable for the customer relationship\nAccountability for the outgoing communication decides the question. Prompt authorship is incidental, self-assessment is not independent, and prior approval of a workflow does not review this instance.',
    references: [REF_EXAM_INFO, REF_MOCK2]
  },
  {
    domain: PROMPTING, difficulty: 2, type: QType.SINGLE,
    stem: 'A prompt works well until the input document is much longer than usual, when quality drops. What is the most likely explanation?',
    options: opts4(
      'The model became less capable',
      'The prompt is too short',
      'The relevant material is now competing with far more surrounding text',
      'Longer documents always produce worse output'
    ),
    correct: ['c'],
    explanation: 'The relevant material is now competing with far more surrounding text\nDilution across a much longer input is the usual cause of this pattern. The model has not changed, prompt length is not the variable that changed, and length alone is not determinative.',
    references: [REF_EXAM_INFO, REF_MOCK2]
  },
  {
    domain: PROMPTING, difficulty: 2, type: QType.SINGLE,
    stem: 'You want the same analysis applied to fifty documents with consistent output. What matters most?',
    options: opts4(
      'Using the largest model available',
      'Processing the documents in one conversation',
      'Reviewing only a sample of the outputs',
      'Fixing the prompt and the required output structure, and applying both unchanged to every document'
    ),
    correct: ['d'],
    explanation: 'Fixing the prompt and the required output structure, and applying both unchanged to every document\nConsistency across a set comes from holding the instruction and the output shape constant. Model size does not create consistency, one long conversation invites drift, and sampling is a review policy rather than a design.',
    references: [REF_EXAM_INFO, REF_MOCK2]
  },
  {
    domain: SELECTION, difficulty: 2, type: QType.SINGLE,
    stem: 'A task must return an answer within a second for an interactive interface, and the work is simple classification. What follows?',
    options: opts4(
      'Use the most capable model to be safe',
      'Batch the requests',
      'Use the smallest model that meets the accuracy requirement, since latency is the binding constraint',
      'Increase the context supplied'
    ),
    correct: ['c'],
    explanation: 'Use the smallest model that meets the accuracy requirement, since latency is the binding constraint\nWith a hard latency requirement and a simple task, the smallest sufficient model is the fit. The most capable model spends latency for accuracy that is not needed, batching breaks interactivity, and more context adds cost and time.',
    references: [REF_EXAM_INFO, REF_MOCK2]
  },
  {
    domain: SELECTION, difficulty: 2, type: QType.SINGLE,
    stem: 'What is the correct reading of a model\'s published benchmark score when choosing for a specific business task?',
    options: opts4(
      'It predicts performance on your task',
      'It is a general signal that does not substitute for evaluating on your own task',
      'It is irrelevant',
      'It determines the price you should expect to pay'
    ),
    correct: ['b'],
    explanation: 'It is a general signal that does not substitute for evaluating on your own task\nBenchmarks indicate general capability and cannot stand in for measurement on the actual task. Treating them as predictive or irrelevant are both wrong, and they do not set price.',
    references: [REF_EXAM_INFO, REF_MOCK2]
  },
  {
    domain: CONFIG, difficulty: 2, type: QType.SINGLE,
    stem: 'Two teams keep separate copies of the same reference documents in their own projects. What is the main risk?',
    options: opts4(
      'The copies drift apart, and the two teams begin answering the same question differently',
      'Higher storage cost',
      'Slower responses',
      'The model becomes confused between projects'
    ),
    correct: ['a'],
    explanation: 'The copies drift apart, and the two teams begin answering the same question differently\nDuplicated knowledge diverges as each copy is maintained separately, producing inconsistent answers. Storage and speed are minor, and projects do not leak into one another.',
    references: [REF_EXAM_INFO, REF_MOCK2]
  },
  {
    domain: CONFIG, difficulty: 2, type: QType.SINGLE,
    stem: 'What is the right first step when setting up a project for a recurring task?',
    options: opts4(
      'Decide what the task needs to know every time, and add only that',
      'Upload every document the team owns',
      'Write the longest possible instruction',
      'Add documents as questions come up, without review'
    ),
    correct: ['a'],
    explanation: 'Decide what the task needs to know every time, and add only that\nA deliberate, minimal base keeps retrieval sharp and is maintainable. Uploading everything and accumulating without review both dilute, and instruction length is not the question.',
    references: [REF_EXAM_INFO, REF_MOCK2]
  },
  {
    domain: TROUBLESHOOT, difficulty: 2, type: QType.SINGLE,
    stem: 'A user reports that Claude gave a wrong answer, but you cannot reproduce it. What is the most useful next step?',
    options: opts4(
      'Assume the user made an error',
      'Obtain the exact prompt, inputs, and configuration they used',
      'Increase the model size for everyone',
      'Add a warning to the interface'
    ),
    correct: ['b'],
    explanation: 'Obtain the exact prompt, inputs, and configuration they used\nReproduction depends on the exact conditions, and gathering them is the only way to diagnose. Dismissing the report discards the signal, and a model change or a warning acts before the cause is known.',
    references: [REF_EXAM_INFO, REF_MOCK2]
  },
  {
    domain: TROUBLESHOOT, difficulty: 2, type: QType.SINGLE,
    stem: 'Output quality varies between runs of an identical prompt on identical input. What does this indicate?',
    options: opts4(
      'The system is broken',
      'The temperature must be zero for all tasks',
      'Some variation is expected, and the task needs constraints tight enough that the variation does not matter',
      'The input must be shortened'
    ),
    correct: ['c'],
    explanation: 'Some variation is expected, and the task needs constraints tight enough that the variation does not matter\nGeneration is not deterministic, so the design must tolerate variation within acceptable bounds. Treating it as breakage misreads normal behavior, a universal temperature rule is too blunt, and input length is unrelated.',
    references: [REF_EXAM_INFO, REF_MOCK2]
  }
];

// ───────────────────── Mock exam 3 (15) ─────────────────────
const REF_MOCK3 = { label: 'CLAUDE-CERTIFICATIONS — Associate Foundations mock exam 3 (MIT)', url: 'https://github.com/Amey-Thakur/CLAUDE-CERTIFICATIONS/blob/main/associate-foundations/mock-exam-3.md' };

export const CCAO_MOCK3: CcaoMockQ[] = [
  {
    domain: OUTPUT, difficulty: 2, type: QType.SINGLE,
    stem: 'A summary cites a statistic that turns out to be correct. Does that validate the rest of the summary?',
    options: opts4(
      'Yes, one verified claim indicates the whole is reliable',
      'Yes, if the statistic was the hardest claim',
      'No, each material claim needs its own check',
      'Only if the source was named'
    ),
    correct: ['c'],
    explanation: 'No, each material claim needs its own check\nVerification does not generalise from one claim to the others. Treating it as a proxy for the whole is the error tested, and naming a source does not verify the remaining claims.',
    references: [REF_EXAM_INFO, REF_MOCK3]
  },
  {
    domain: OUTPUT, difficulty: 2, type: QType.SINGLE,
    stem: 'Claude declines to answer part of a request and explains why. How should this be read?',
    options: opts4(
      'As information about a limit or a policy that is worth understanding before proceeding',
      'As a failure that should be worked around',
      'As a sign the prompt was too long',
      'As a reason to switch models'
    ),
    correct: ['a'],
    explanation: 'As information about a limit or a policy that is worth understanding before proceeding\nA refusal with a reason is a signal about the task, not an obstacle to route around. Working around it ignores the reason, and neither prompt length nor model choice is indicated.',
    references: [REF_EXAM_INFO, REF_MOCK3]
  },
  {
    domain: OUTPUT, difficulty: 2, type: QType.SINGLE,
    stem: 'You need to know whether a long report supports a specific conclusion. What is the most reliable approach?',
    options: opts4(
      'Ask for a summary and read that',
      'Ask whether the report supports the conclusion',
      'Ask for a confidence score',
      'Ask for the passages that bear on the conclusion, then read those passages yourself'
    ),
    correct: ['d'],
    explanation: 'Ask for the passages that bear on the conclusion, then read those passages yourself\nRetrieving the evidence and reading it keeps the judgment with you. A summary and a direct verdict hand the judgment to the model, and a confidence score is not evidence.',
    references: [REF_EXAM_INFO, REF_MOCK3]
  },
  {
    domain: WORKFLOW, difficulty: 2, type: QType.SINGLE,
    stem: 'A manual process takes four hours and produces a document nobody reads. What should happen before automating it?',
    options: opts4(
      'Automate it, since four hours is significant',
      'Establish whether the document is needed at all',
      'Automate it and measure adoption afterwards',
      'Split it across more people'
    ),
    correct: ['b'],
    explanation: 'Establish whether the document is needed at all\nAutomating unnecessary work makes waste faster. Proceeding regardless skips the question, and redistributing it does not address whether it is needed.',
    references: [REF_EXAM_INFO, REF_MOCK3]
  },
  {
    domain: WORKFLOW, difficulty: 2, type: QType.SINGLE,
    stem: 'Which sequencing is correct when introducing Claude to a recurring team process?',
    options: opts4(
      'Automate the whole process, then refine',
      'Start with the step that is bounded and checkable, prove it, then extend',
      'Start with the hardest step, since it has most value',
      'Let each person adopt it however they prefer'
    ),
    correct: ['b'],
    explanation: 'Start with the step that is bounded and checkable, prove it, then extend\nA bounded first step produces evidence and trust cheaply. Full automation first risks everything at once, the hardest step is the least likely to succeed early, and uncoordinated adoption produces drift.',
    references: [REF_EXAM_INFO, REF_MOCK3]
  },
  {
    domain: GOVERNANCE, difficulty: 2, type: QType.SINGLE,
    stem: 'A policy forbids sending customer data to external services. A colleague asks Claude to summarise a customer email. What applies?',
    options: opts4(
      'Nothing, because summarising is not sending',
      'The policy only if the customer is named',
      'Nothing, because the output stays internal',
      'The policy, since the email is customer data'
    ),
    correct: ['d'],
    explanation: 'The policy, since the email is customer data\nSubmitting the content is the act the policy governs. Framing it as summarising or by where the output goes misreads the policy, and it is not limited to named individuals.',
    references: [REF_EXAM_INFO, REF_MOCK3]
  },
  {
    domain: GOVERNANCE, difficulty: 2, type: QType.SINGLE,
    stem: 'What is the correct response to a request that a model output be presented as human-written to a customer?',
    options: opts4(
      'Decline to misrepresent it, and raise the disclosure question with whoever owns the relationship',
      'Comply, since the customer cares about quality not provenance',
      'Comply if the output was heavily edited',
      'Comply and record the decision internally'
    ),
    correct: ['a'],
    explanation: 'Decline to misrepresent it, and raise the disclosure question with whoever owns the relationship\nActively misrepresenting provenance is the issue, and it belongs to the person accountable for the relationship. Editing and internal records do not make the representation true, and quality is not the point.',
    references: [REF_EXAM_INFO, REF_MOCK3]
  },
  {
    domain: PROMPTING, difficulty: 2, type: QType.SINGLE,
    stem: 'A prompt asks for a recommendation and gets a balanced discussion instead. What is the most likely cause?',
    options: opts4(
      'The model is incapable of recommending',
      'The temperature is too high',
      'The prompt did not state that a single recommendation with a reason was required',
      'The input was too short'
    ),
    correct: ['c'],
    explanation: 'The prompt did not state that a single recommendation with a reason was required\nOutput shape follows the instruction, and no decision was requested. Incapability is not the issue, and neither temperature nor input length determines whether a recommendation is given.',
    references: [REF_EXAM_INFO, REF_MOCK3]
  },
  {
    domain: PROMPTING, difficulty: 2, type: QType.SINGLE,
    stem: 'What is the most effective way to get output pitched at the right level for a specific audience?',
    options: opts4(
      'Ask for it to be clear',
      'Ask for a shorter response',
      'Ask for simpler words',
      'Name the audience and what they already know'
    ),
    correct: ['d'],
    explanation: 'Name the audience and what they already know\nNaming the reader and their prior knowledge is what calibrates level. Clarity, length, and vocabulary are consequences rather than the instruction.',
    references: [REF_EXAM_INFO, REF_MOCK3]
  },
  {
    domain: SELECTION, difficulty: 2, type: QType.SINGLE,
    stem: 'A colleague uses the largest model for every task including formatting. What should you point out?',
    options: opts4(
      'Nothing, capability is never wasted',
      'That the largest model is less accurate on simple tasks',
      'That matching the model to the work saves cost without losing anything on simple tasks',
      'That formatting should be done manually'
    ),
    correct: ['c'],
    explanation: 'That matching the model to the work saves cost without losing anything on simple tasks\nFit-to-task is the principle, and simple work does not benefit from extra capability. Capability is not free, larger models are not less accurate on simple tasks, and manual work is not the alternative.',
    references: [REF_EXAM_INFO, REF_MOCK3]
  },
  {
    domain: SELECTION, difficulty: 2, type: QType.SINGLE,
    stem: 'When does the choice of interface matter more than the choice of model?',
    options: opts4(
      'Never, the model determines the outcome',
      'When the obstacle is how people supply context and act on output, not the quality of the answer',
      'Only for very large teams',
      'Only when cost is constrained'
    ),
    correct: ['b'],
    explanation: 'When the obstacle is how people supply context and act on output, not the quality of the answer\nWhere adoption or context-supply is the bottleneck, interface dominates. Treating the model as decisive misses that, and neither team size nor cost defines the case.',
    references: [REF_EXAM_INFO, REF_MOCK3]
  },
  {
    domain: CONFIG, difficulty: 2, type: QType.SINGLE,
    stem: 'What is the risk of adding a document to project knowledge without removing the version it replaces?',
    options: opts4(
      'Both versions can be drawn on, producing answers that mix current and superseded material',
      'Storage cost',
      'Slower responses',
      'The project will refuse to answer'
    ),
    correct: ['a'],
    explanation: 'Both versions can be drawn on, producing answers that mix current and superseded material\nSuperseded material remains retrievable and contradicts the current version. Storage and speed are minor, and the project does not refuse.',
    references: [REF_EXAM_INFO, REF_MOCK3]
  },
  {
    domain: CONFIG, difficulty: 2, type: QType.SINGLE,
    stem: 'Which is the better test of whether something belongs in project knowledge?',
    options: opts4(
      'Whether every conversation in the project would benefit from it',
      'Whether it is long enough to be worth uploading',
      'Whether it was recently created',
      'Whether it is confidential'
    ),
    correct: ['a'],
    explanation: 'Whether every conversation in the project would benefit from it\nRecurrence across conversations is what distinguishes shared knowledge from prompt content. Length, recency, and sensitivity are unrelated to that test.',
    references: [REF_EXAM_INFO, REF_MOCK3]
  },
  {
    domain: TROUBLESHOOT, difficulty: 2, type: QType.SINGLE,
    stem: 'A previously reliable prompt now returns shorter answers than before. What is worth checking first?',
    options: opts4(
      'Whether the model is deprecated',
      'Whether the input or the instructions changed, including anything added to the project',
      'Whether the network is slow',
      'Whether the account has hit a limit'
    ),
    correct: ['b'],
    explanation: 'Whether the input or the instructions changed, including anything added to the project\nA behavioral change points to a change in inputs or configuration. Deprecation, network, and limits produce errors rather than shorter answers.',
    references: [REF_EXAM_INFO, REF_MOCK3]
  },
  {
    domain: TROUBLESHOOT, difficulty: 2, type: QType.SINGLE,
    stem: 'Someone reports that Claude is wrong about a fact that it stated correctly last week. What is the most useful first question?',
    options: opts4(
      'Which model did you use',
      'How long was the conversation',
      'What exactly did you ask, and what did it reply',
      'Have you tried again'
    ),
    correct: ['c'],
    explanation: 'What exactly did you ask, and what did it reply\nThe exact exchange is what makes the claim examinable. Model, length, and retrying may matter later but none of them establishes what happened.',
    references: [REF_EXAM_INFO, REF_MOCK3]
  }
];
