/**
 * AI-900 bundle seed — vendor (Microsoft), three practice-exam variants,
 * bundle, and 195 blueprint-aligned questions.
 *
 * Unlike most other seeds, this one performs a FULL wipe of the exam's
 * question pool on every run (not filtered by `generatedBy`) because the
 * production pool was heavily skewed toward one domain (~154 ML out of 360)
 * and needs to be replaced wholesale with this blueprint-weighted set.
 *
 * Exported as `seedAi900(db)` so the same code path is reachable from the
 * standalone CLI shim (`prisma/seeds/ai900.ts`) and the protected admin
 * API (`/api/admin/seed-ai900`) — letting us bootstrap the production
 * database without redeploying.
 *
 * Question content is authored against the public Microsoft Learn docs
 * and the Microsoft Azure AI Fundamentals (AI-900) domain blueprint:
 *   - Describe Artificial Intelligence workloads and considerations        — 18% (12 per variant)
 *   - Describe fundamental principles of machine learning on Azure          — 18% (12 per variant)
 *   - Describe features of computer vision workloads on Azure               — 18% (12 per variant)
 *   - Describe features of Natural Language Processing (NLP) workloads      — 18% (12 per variant)
 *   - Describe features of generative AI workloads on Azure                 — 28% (17 per variant)
 *
 * These are original, scenario-based study questions — they are not copies
 * of any live Microsoft exam and make no claim to be the real
 * certification exam.
 */
import { PrismaClient, QStatus, QType } from '@prisma/client';

type Opt = { id: string; text: string };
type Q = {
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

const AIW = 'Describe Artificial Intelligence workloads and considerations';
const ML = 'Describe fundamental principles of machine learning on Azure';
const CV = 'Describe features of computer vision workloads on Azure';
const NLP = 'Describe features of Natural Language Processing (NLP) workloads on Azure';
const GENAI = 'Describe features of generative AI workloads on Azure';

// ───────────────────────── References (Microsoft Learn only) ─────────────────────────
const REF_STUDY = { label: 'Microsoft Learn — Exam AI-900 study guide', url: 'https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/ai-900' };
const REF_RAI = { label: 'Microsoft Learn — What is Responsible AI', url: 'https://learn.microsoft.com/en-us/azure/machine-learning/concept-responsible-ai' };
const REF_RAI_DASH = { label: 'Microsoft Learn — Responsible AI dashboard', url: 'https://learn.microsoft.com/en-us/azure/machine-learning/concept-responsible-ai-dashboard' };
const REF_FAIRNESS = { label: 'Microsoft Learn — Fairness in machine learning models', url: 'https://learn.microsoft.com/en-us/azure/machine-learning/concept-fairness-ml' };
const REF_INTERP = { label: 'Microsoft Learn — Model interpretability', url: 'https://learn.microsoft.com/en-us/azure/machine-learning/how-to-machine-learning-interpretability' };

const REF_AML = { label: 'Microsoft Learn — What is Azure Machine Learning', url: 'https://learn.microsoft.com/en-us/azure/machine-learning/overview-what-is-azure-machine-learning' };
const REF_AUTOML = { label: 'Microsoft Learn — What is automated machine learning (AutoML)', url: 'https://learn.microsoft.com/en-us/azure/machine-learning/concept-automated-ml' };
const REF_DESIGNER = { label: 'Microsoft Learn — Azure Machine Learning designer overview', url: 'https://learn.microsoft.com/en-us/azure/machine-learning/concept-designer' };
const REF_COMPUTE = { label: 'Microsoft Learn — Compute targets in Azure Machine Learning', url: 'https://learn.microsoft.com/en-us/azure/machine-learning/concept-compute-target' };
const REF_DEPLOY = { label: 'Microsoft Learn — Deploy and score a model with online endpoints', url: 'https://learn.microsoft.com/en-us/azure/machine-learning/how-to-deploy-online-endpoints' };
const REF_MLOPS = { label: 'Microsoft Learn — MLOps: Model management, deployment, lineage, and monitoring', url: 'https://learn.microsoft.com/en-us/azure/machine-learning/concept-model-management-and-deployment' };
const REF_ML_FUND = { label: 'Microsoft Learn — Introduction to machine learning concepts', url: 'https://learn.microsoft.com/en-us/training/modules/fundamentals-machine-learning/' };
const REF_DL = { label: 'Microsoft Learn — Deep learning vs. classical machine learning', url: 'https://learn.microsoft.com/en-us/azure/machine-learning/concept-deep-learning-vs-machine-learning' };

const REF_VISION = { label: 'Microsoft Learn — What is Azure AI Vision', url: 'https://learn.microsoft.com/en-us/azure/ai-services/computer-vision/overview' };
const REF_IMAGE_ANALYSIS = { label: 'Microsoft Learn — Image Analysis overview', url: 'https://learn.microsoft.com/en-us/azure/ai-services/computer-vision/overview-image-analysis' };
const REF_OCR = { label: 'Microsoft Learn — Optical Character Recognition (OCR) overview', url: 'https://learn.microsoft.com/en-us/azure/ai-services/computer-vision/overview-ocr' };
const REF_FACE = { label: 'Microsoft Learn — What is the Azure Face service', url: 'https://learn.microsoft.com/en-us/azure/ai-services/face/overview-identity' };
const REF_CUSTOM_VISION = { label: 'Microsoft Learn — Azure AI Custom Vision overview', url: 'https://learn.microsoft.com/en-us/azure/ai-services/custom-vision-service/overview' };
const REF_DOC_INTEL = { label: 'Microsoft Learn — What is Azure AI Document Intelligence', url: 'https://learn.microsoft.com/en-us/azure/ai-services/document-intelligence/overview' };

const REF_LANG = { label: 'Microsoft Learn — What is Azure AI Language', url: 'https://learn.microsoft.com/en-us/azure/ai-services/language-service/overview' };
const REF_KEYPHRASE = { label: 'Microsoft Learn — Key phrase extraction overview', url: 'https://learn.microsoft.com/en-us/azure/ai-services/language-service/key-phrase-extraction/overview' };
const REF_NER = { label: 'Microsoft Learn — Named entity recognition (NER) overview', url: 'https://learn.microsoft.com/en-us/azure/ai-services/language-service/named-entity-recognition/overview' };
const REF_SENT = { label: 'Microsoft Learn — Sentiment analysis and opinion mining', url: 'https://learn.microsoft.com/en-us/azure/ai-services/language-service/sentiment-opinion-mining/overview' };
const REF_LANG_DETECT = { label: 'Microsoft Learn — Language detection overview', url: 'https://learn.microsoft.com/en-us/azure/ai-services/language-service/language-detection/overview' };
const REF_QA = { label: 'Microsoft Learn — Question answering overview', url: 'https://learn.microsoft.com/en-us/azure/ai-services/language-service/question-answering/overview' };
const REF_CLU = { label: 'Microsoft Learn — Conversational language understanding overview', url: 'https://learn.microsoft.com/en-us/azure/ai-services/language-service/conversational-language-understanding/overview' };
const REF_SUMM = { label: 'Microsoft Learn — Summarization overview', url: 'https://learn.microsoft.com/en-us/azure/ai-services/language-service/summarization/overview' };

const REF_SPEECH = { label: 'Microsoft Learn — What is Azure AI Speech', url: 'https://learn.microsoft.com/en-us/azure/ai-services/speech-service/overview' };
const REF_STT = { label: 'Microsoft Learn — Speech to text overview', url: 'https://learn.microsoft.com/en-us/azure/ai-services/speech-service/speech-to-text' };
const REF_TTS = { label: 'Microsoft Learn — Text to speech overview', url: 'https://learn.microsoft.com/en-us/azure/ai-services/speech-service/text-to-speech' };
const REF_SPEECH_TRANS = { label: 'Microsoft Learn — Speech translation overview', url: 'https://learn.microsoft.com/en-us/azure/ai-services/speech-service/speech-translation' };
const REF_TRANSLATOR = { label: 'Microsoft Learn — What is Azure AI Translator', url: 'https://learn.microsoft.com/en-us/azure/ai-services/translator/translator-overview' };

const REF_GENAI = { label: 'Microsoft Learn — Introduction to generative AI', url: 'https://learn.microsoft.com/en-us/training/modules/fundamentals-generative-ai/' };
const REF_FOUNDRY = { label: 'Microsoft Learn — What is Microsoft Foundry (Azure AI Foundry)', url: 'https://learn.microsoft.com/en-us/azure/ai-foundry/what-is-azure-ai-foundry' };
const REF_FOUNDRY_PORTAL = { label: 'Microsoft Learn — Microsoft Foundry portal overview', url: 'https://learn.microsoft.com/en-us/azure/ai-foundry/concepts/ai-resources' };
const REF_AOAI = { label: 'Microsoft Learn — What is Azure OpenAI Service', url: 'https://learn.microsoft.com/en-us/azure/ai-services/openai/overview' };
const REF_AOAI_MODELS = { label: 'Microsoft Learn — Azure OpenAI Service models', url: 'https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models' };
const REF_PROMPT = { label: 'Microsoft Learn — Prompt engineering techniques', url: 'https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/prompt-engineering' };
const REF_CONTENT_FILTER = { label: 'Microsoft Learn — Azure OpenAI content filtering', url: 'https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/content-filter' };
const REF_RAI_GENAI = { label: 'Microsoft Learn — Transparency note for Azure OpenAI', url: 'https://learn.microsoft.com/en-us/azure/ai-foundry/responsible-ai/openai/transparency-note' };
const REF_CATALOG = { label: 'Microsoft Learn — Model catalog in Azure AI Foundry', url: 'https://learn.microsoft.com/en-us/azure/ai-foundry/how-to/model-catalog-overview' };
const REF_RAG = { label: 'Microsoft Learn — Retrieval Augmented Generation (RAG) in Azure AI Foundry', url: 'https://learn.microsoft.com/en-us/azure/ai-foundry/concepts/retrieval-augmented-generation' };
const REF_COPILOT_STUDIO = { label: 'Microsoft Learn — Microsoft Copilot Studio overview', url: 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/fundamentals-what-is-copilot-studio' };
const REF_DALLE = { label: 'Microsoft Learn — DALL-E image generation in Azure OpenAI', url: 'https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models' };

// Helper to build 4-option questions with id 'a','b','c','d'.
const opts4 = (a: string, b: string, c: string, d: string): Opt[] => [
  { id: 'a', text: a }, { id: 'b', text: b }, { id: 'c', text: c }, { id: 'd', text: d }
];

// ───────────────────── Practice Exam 1 ─────────────────────
const P1: Q[] = [
  // ─── AI Workloads & considerations (12) ───
  {
    domain: AIW, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'A retailer wants software to recognize product logos in customer photos shared on social media. Which type of AI workload best fits this requirement?',
    options: opts4(
      'Natural language processing',
      'Computer vision',
      'Anomaly detection',
      'Knowledge mining'
    ),
    correct: ['b'],
    explanation: 'Recognizing objects (logos) in images is a computer vision workload. NLP processes text, anomaly detection finds unusual data points, and knowledge mining indexes documents.',
    references: [REF_STUDY, REF_VISION]
  },
  {
    domain: AIW, difficulty: 1, type: QType.SINGLE,
    stem: 'A customer support team wants to automatically detect whether incoming emails express a positive or negative tone. Which AI workload category does this fall under?',
    options: opts4(
      'Computer vision',
      'Document processing',
      'Natural language processing',
      'Generative AI'
    ),
    correct: ['c'],
    explanation: 'Determining the tone or emotion in text is sentiment analysis, an NLP workload provided by Azure AI Language.',
    references: [REF_STUDY, REF_SENT]
  },
  {
    domain: AIW, difficulty: 1, type: QType.SINGLE,
    stem: 'An insurance company wants to automatically pull policy numbers, dates, and amounts from scanned claim forms. Which AI workload is most appropriate?',
    options: opts4(
      'Document processing (intelligent document processing)',
      'Speech translation',
      'Knowledge mining only',
      'Anomaly detection'
    ),
    correct: ['a'],
    explanation: 'Extracting structured fields from forms and scanned documents is a document processing workload, addressed by Azure AI Document Intelligence.',
    references: [REF_STUDY, REF_DOC_INTEL]
  },
  {
    domain: AIW, difficulty: 1, type: QType.SINGLE,
    stem: 'A marketing team asks an AI tool to "write a 200-word blog post about sustainable packaging." Which AI workload best describes this?',
    options: opts4(
      'Object detection',
      'Generative AI',
      'Optical character recognition',
      'Clustering'
    ),
    correct: ['b'],
    explanation: 'Creating new text from a prompt is a generative AI workload, typically powered by a large language model such as those in Azure OpenAI or the Foundry model catalog.',
    references: [REF_STUDY, REF_GENAI]
  },
  {
    domain: AIW, difficulty: 2, type: QType.SINGLE,
    stem: 'A bank deploys an AI loan-approval model. The Responsible AI principle of FAIRNESS most directly requires that the model:',
    options: opts4(
      'Returns answers as fast as possible',
      'Treats applicants with similar financial circumstances similarly, regardless of attributes like gender or ethnicity',
      'Never explains its decisions to anyone',
      'Encrypts data at rest only'
    ),
    correct: ['b'],
    explanation: 'Fairness means an AI system should not make biased decisions based on sensitive attributes; people with similar circumstances should receive similar treatment. Speed, opacity, and encryption are not the fairness principle.',
    references: [REF_RAI, REF_FAIRNESS]
  },
  {
    domain: AIW, difficulty: 2, type: QType.SINGLE,
    stem: 'A self-driving car company runs additional tests on adverse weather behavior before release. Which Responsible AI principle does this most directly address?',
    options: opts4(
      'Inclusiveness',
      'Reliability and safety',
      'Accountability',
      'Privacy and security'
    ),
    correct: ['b'],
    explanation: 'Reliability and safety requires that AI systems operate consistently and respond safely to unexpected conditions — exactly the goal of stress-testing under adverse weather.',
    references: [REF_RAI, REF_STUDY]
  },
  {
    domain: AIW, difficulty: 2, type: QType.SINGLE,
    stem: 'A health app collects user voice samples to train a custom speech model. Which Responsible AI principle is most central to how that data must be handled?',
    options: opts4(
      'Transparency',
      'Privacy and security',
      'Accountability',
      'Inclusiveness'
    ),
    correct: ['b'],
    explanation: 'Privacy and security covers the collection, use, storage, and protection of personal data and compliance with privacy laws — directly relevant when handling user voice samples.',
    references: [REF_RAI, REF_STUDY]
  },
  {
    domain: AIW, difficulty: 2, type: QType.SINGLE,
    stem: 'A speech-to-text service is tested with voices across many accents, ages, and abilities to ensure it works well for all users. Which Responsible AI principle does this support?',
    options: opts4(
      'Inclusiveness',
      'Reliability and safety',
      'Transparency',
      'Accountability'
    ),
    correct: ['a'],
    explanation: 'Inclusiveness aims to empower all people regardless of ability or background, including diverse accents, ages, and physical capabilities.',
    references: [REF_RAI, REF_STUDY]
  },
  {
    domain: AIW, difficulty: 2, type: QType.MULTI,
    stem: 'Select ALL of the following that are Microsoft Responsible AI principles.',
    options: opts4(
      'Fairness',
      'Maximum profit',
      'Transparency',
      'Accountability'
    ),
    correct: ['a', 'c', 'd'],
    explanation: 'Microsoft\'s six Responsible AI principles are fairness, reliability and safety, privacy and security, inclusiveness, transparency, and accountability. Maximum profit is not one of them.',
    references: [REF_RAI, REF_STUDY]
  },
  {
    domain: AIW, difficulty: 2, type: QType.SINGLE,
    stem: 'Why is publishing a "Transparency Note" for an AI system important?',
    options: opts4(
      'It hides implementation details from auditors',
      'It guarantees the model is 100% accurate',
      'It helps users understand the system\'s intended uses, capabilities, and limitations — supporting the Transparency principle',
      'It replaces the need for testing'
    ),
    correct: ['c'],
    explanation: 'Transparency notes communicate the intended uses, capabilities, and limitations of an AI system so that users and stakeholders can make informed decisions — a core part of the Transparency principle.',
    references: [REF_RAI, REF_RAI_GENAI]
  },
  {
    domain: AIW, difficulty: 3, type: QType.SINGLE,
    stem: 'An organization establishes a review board that signs off on AI deployments and an incident process if a model causes harm. Which Responsible AI principle is being operationalized?',
    options: opts4(
      'Inclusiveness',
      'Privacy and security',
      'Accountability',
      'Reliability and safety'
    ),
    correct: ['c'],
    explanation: 'Accountability requires humans to remain responsible for AI behavior, including governance, review boards, and incident-response processes for AI systems.',
    references: [REF_RAI, REF_STUDY]
  },
  {
    domain: AIW, difficulty: 3, type: QType.SINGLE,
    stem: 'A workload that uses an Azure AI service to extract text from a scanned PDF and another that auto-summarizes a meeting transcript are both examples of AI workloads recognized in the AI-900 skills outline.',
    options: opts4('True', 'False', 'Only the OCR example is recognized', 'Only the summarization example is recognized'),
    correct: ['a'],
    explanation: 'True. Document processing (OCR/intelligent document processing) and NLP (summarization) are both AI workload categories in the AI-900 study guide.',
    references: [REF_STUDY, REF_DOC_INTEL, REF_SUMM]
  },

  // ─── ML on Azure (12) ───
  {
    domain: ML, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'A model predicts the SELLING PRICE of a used car from features like mileage and age. Which type of machine learning is this?',
    options: opts4(
      'Classification',
      'Regression',
      'Clustering',
      'Reinforcement learning'
    ),
    correct: ['b'],
    explanation: 'Regression predicts a continuous numeric value (price). Classification predicts a discrete category, and clustering groups unlabeled data.',
    references: [REF_ML_FUND, REF_AUTOML]
  },
  {
    domain: ML, difficulty: 1, type: QType.SINGLE,
    stem: 'A model predicts whether an email is "spam" or "not spam." Which type of machine learning best describes this task?',
    options: opts4(
      'Regression',
      'Binary classification',
      'Clustering',
      'Time-series forecasting'
    ),
    correct: ['b'],
    explanation: 'Predicting one of two categories (spam / not spam) is binary classification — a supervised learning task with categorical labels.',
    references: [REF_ML_FUND, REF_AML]
  },
  {
    domain: ML, difficulty: 1, type: QType.SINGLE,
    stem: 'A retailer wants to discover natural GROUPS of customers based on purchase behavior without any predefined labels. Which technique fits?',
    options: opts4(
      'Regression',
      'Classification',
      'Clustering',
      'Object detection'
    ),
    correct: ['c'],
    explanation: 'Clustering is unsupervised learning that groups similar records together without labeled output — ideal for customer segmentation discovery.',
    references: [REF_ML_FUND, REF_AML]
  },
  {
    domain: ML, difficulty: 1, type: QType.SINGLE,
    stem: 'In a tabular dataset used to predict house price, the column "price" is what kind of column?',
    options: opts4(
      'A feature',
      'A label',
      'A hyperparameter',
      'A compute target'
    ),
    correct: ['b'],
    explanation: 'The value you want to predict is called the label (or target). The columns used as input to the model are features.',
    references: [REF_ML_FUND, REF_AML]
  },
  {
    domain: ML, difficulty: 2, type: QType.SINGLE,
    stem: 'Why is a dataset typically split into training and validation sets?',
    options: opts4(
      'To make training faster only',
      'So model parameters and performance can be evaluated on data not seen during training, helping detect overfitting',
      'Because Azure requires it for billing',
      'To reduce model size'
    ),
    correct: ['b'],
    explanation: 'The validation set is held out from training so you can estimate how the model will generalize to new data and detect overfitting; a test set may be held out for final evaluation.',
    references: [REF_ML_FUND, REF_AUTOML]
  },
  {
    domain: ML, difficulty: 2, type: QType.SINGLE,
    stem: 'You want Azure Machine Learning to try many algorithms and hyperparameter combinations and pick the best model with minimal manual coding. Which capability should you use?',
    options: opts4(
      'Automated machine learning (AutoML)',
      'Azure Functions',
      'Azure Key Vault',
      'Power Automate desktop flows'
    ),
    correct: ['a'],
    explanation: 'Automated ML automates the iteration over algorithms and hyperparameter settings to find the best-performing model for the chosen metric — without writing each pipeline by hand.',
    references: [REF_AUTOML, REF_ML_FUND]
  },
  {
    domain: ML, difficulty: 2, type: QType.SINGLE,
    stem: 'A team prefers a drag-and-drop visual interface to build and train ML pipelines without writing code. Which Azure Machine Learning capability is most appropriate?',
    options: opts4(
      'Azure Machine Learning designer',
      'Azure Resource Manager templates',
      'Azure Container Registry',
      'Azure Storage Explorer'
    ),
    correct: ['a'],
    explanation: 'The Azure Machine Learning designer provides a drag-and-drop canvas for building, training, and deploying ML pipelines without code.',
    references: [REF_DESIGNER, REF_AML]
  },
  {
    domain: ML, difficulty: 2, type: QType.SINGLE,
    stem: 'What is a "compute target" in Azure Machine Learning?',
    options: opts4(
      'A model registry artifact',
      'A designated compute resource (such as a compute cluster, serverless compute, or attached VM) used to run training or inference',
      'A type of cost-management alert',
      'A storage encryption key'
    ),
    correct: ['b'],
    explanation: 'A compute target is the compute resource where a training run, pipeline step, or deployment executes — such as managed clusters, serverless compute, or attached compute.',
    references: [REF_COMPUTE, REF_ML_FUND]
  },
  {
    domain: ML, difficulty: 2, type: QType.SINGLE,
    stem: 'After training, you want to expose a model so an application can call it over HTTPS and get predictions in near real time. Which Azure Machine Learning capability is best?',
    options: opts4(
      'Batch endpoint',
      'Online (managed) endpoint',
      'Azure Data Factory',
      'Local notebook only'
    ),
    correct: ['b'],
    explanation: 'Real-time scoring uses online (managed) endpoints to receive HTTPS requests and return predictions with low latency. Batch endpoints are for asynchronous bulk scoring.',
    references: [REF_DEPLOY, REF_MLOPS]
  },
  {
    domain: ML, difficulty: 2, type: QType.MULTI,
    stem: 'Select ALL items that are true about deep learning relative to classical machine learning.',
    options: opts4(
      'Deep learning uses neural networks with multiple layers',
      'Deep learning typically requires more data than classical ML',
      'Deep learning never benefits from GPU acceleration',
      'Deep learning underlies many modern computer vision and NLP models'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Deep learning uses multilayer neural networks, generally needs large datasets, and powers most modern vision and NLP. GPU acceleration is commonly used to train deep networks efficiently.',
    references: [REF_DL, REF_ML_FUND]
  },
  {
    domain: ML, difficulty: 3, type: QType.SINGLE,
    stem: 'Which statement best describes the Transformer architecture, which underpins many modern large language models?',
    options: opts4(
      'It is a rules-based engine with no learnable parameters',
      'It uses self-attention to weigh the relevance of different positions in the input sequence',
      'It can only operate on numeric tabular data',
      'It is identical to a convolutional neural network'
    ),
    correct: ['b'],
    explanation: 'Transformers use self-attention to model relationships between tokens at different positions in a sequence, which is why they perform well on language. CNNs and rule-based engines are different.',
    references: [REF_GENAI, REF_ML_FUND]
  },
  {
    domain: ML, difficulty: 3, type: QType.SINGLE,
    stem: 'A data scientist registers a trained model, packages it with its environment, and tracks who deployed it and when. Which discipline does this represent?',
    options: opts4(
      'MLOps (machine learning operations)',
      'ETL only',
      'Manual file copy',
      'Visualization'
    ),
    correct: ['a'],
    explanation: 'MLOps applies DevOps practices to the ML lifecycle: model registration, packaging, deployment, lineage, monitoring, and governance — all supported by Azure Machine Learning.',
    references: [REF_MLOPS, REF_AML]
  },

  // ─── Computer vision (12) ───
  {
    domain: CV, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'A model decides whether an X-ray image shows "fracture" or "no fracture." Which computer vision task is this?',
    options: opts4(
      'Image classification',
      'Object detection',
      'Optical character recognition',
      'Face identification'
    ),
    correct: ['a'],
    explanation: 'Assigning a single label to an entire image is image classification. Object detection would also locate the fracture with a bounding box.',
    references: [REF_IMAGE_ANALYSIS, REF_VISION]
  },
  {
    domain: CV, difficulty: 1, type: QType.SINGLE,
    stem: 'A model draws bounding boxes around every car and pedestrian in a traffic-camera image. Which computer vision task is being performed?',
    options: opts4(
      'Image classification',
      'Object detection',
      'OCR',
      'Image generation'
    ),
    correct: ['b'],
    explanation: 'Locating multiple objects in an image and drawing bounding boxes is object detection. Image classification only labels the image as a whole.',
    references: [REF_IMAGE_ANALYSIS, REF_VISION]
  },
  {
    domain: CV, difficulty: 1, type: QType.SINGLE,
    stem: 'Which Azure AI service is designed to extract printed and handwritten text from images and scanned documents?',
    options: opts4(
      'Azure AI Translator',
      'Azure AI Vision Read API (OCR)',
      'Azure AI Speech',
      'Azure OpenAI'
    ),
    correct: ['b'],
    explanation: 'The Azure AI Vision OCR / Read API extracts printed and handwritten text from photos and documents and supports many languages.',
    references: [REF_OCR, REF_VISION]
  },
  {
    domain: CV, difficulty: 1, type: QType.SINGLE,
    stem: 'Which task does the Azure AI Face service perform?',
    options: opts4(
      'Translates text between languages',
      'Detects, verifies, and (where allowed) identifies human faces in images',
      'Generates new images from prompts',
      'Extracts key phrases from documents'
    ),
    correct: ['b'],
    explanation: 'Azure AI Face provides face detection, verification ("are these two faces the same person?"), and identification against a registered group, plus liveness detection.',
    references: [REF_FACE, REF_VISION]
  },
  {
    domain: CV, difficulty: 2, type: QType.SINGLE,
    stem: 'A logistics company wants to train its own model that recognizes its specific package types from photos, using only a few labeled examples. Which Azure service is best suited?',
    options: opts4(
      'Azure AI Custom Vision',
      'Azure AI Translator',
      'Azure AI Speech',
      'Azure AI Language'
    ),
    correct: ['a'],
    explanation: 'Azure AI Custom Vision lets you train custom image classification and object detection models on your own labeled images, with relatively small training sets.',
    references: [REF_CUSTOM_VISION, REF_VISION]
  },
  {
    domain: CV, difficulty: 2, type: QType.SINGLE,
    stem: 'A retailer wants to extract invoice number, total, vendor, and line items from supplier invoices in many formats. Which Azure service is purpose-built for this?',
    options: opts4(
      'Azure AI Document Intelligence (prebuilt invoice model)',
      'Azure AI Speech',
      'Azure Bot Service',
      'Azure AI Translator'
    ),
    correct: ['a'],
    explanation: 'Azure AI Document Intelligence provides prebuilt models for invoices, receipts, and IDs that extract structured key-value pairs and tables, as well as custom-trained models.',
    references: [REF_DOC_INTEL, REF_VISION]
  },
  {
    domain: CV, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Azure AI Face capability would you use to confirm that the live person on a webcam is the same person as on their submitted ID photo?',
    options: opts4(
      'Image classification',
      'Face verification (one-to-one match)',
      'Optical character recognition',
      'Image generation'
    ),
    correct: ['b'],
    explanation: 'Verification is a one-to-one match: it answers "are these two faces the same person?" Liveness detection complements verification by ensuring the camera sees a real person.',
    references: [REF_FACE, REF_VISION]
  },
  {
    domain: CV, difficulty: 2, type: QType.SINGLE,
    stem: 'Which task best describes facial DETECTION (as distinct from facial RECOGNITION)?',
    options: opts4(
      'Telling whose face is in an image by matching to a registered identity',
      'Locating that one or more faces are present in an image and returning their bounding boxes',
      'Generating a synthetic face image from a text prompt',
      'Translating a face description into another language'
    ),
    correct: ['b'],
    explanation: 'Face detection locates faces in an image and returns coordinates. Recognition (verification/identification) goes further by matching faces to known identities.',
    references: [REF_FACE, REF_VISION]
  },
  {
    domain: CV, difficulty: 2, type: QType.MULTI,
    stem: 'Select ALL capabilities provided by Azure AI Vision.',
    options: opts4(
      'Image analysis (describing image content)',
      'Reading printed and handwritten text (OCR)',
      'Training a custom regression model on tabular data',
      'Extracting auto-generated descriptions, tags, and detected objects from images'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Azure AI Vision provides image analysis, OCR (Read), and features like tags, captions, and object detection. Training a regression model on tabular data is Azure Machine Learning, not Azure AI Vision.',
    references: [REF_VISION, REF_IMAGE_ANALYSIS, REF_OCR]
  },
  {
    domain: CV, difficulty: 3, type: QType.SINGLE,
    stem: 'A team wants to count the number of distinct shopping carts on a store-camera frame, then alert when more than 10 are queued. Which sequence of computer vision tasks fits best?',
    options: opts4(
      'Image classification only, then sentiment analysis',
      'Object detection to locate each cart, then count the detected instances',
      'OCR to read cart labels and key phrase extraction',
      'Speech-to-text to transcribe employee comments'
    ),
    correct: ['b'],
    explanation: 'Counting carts requires locating each one — object detection. Image classification alone cannot give a count, and OCR/STT are unrelated to counting carts.',
    references: [REF_IMAGE_ANALYSIS, REF_VISION]
  },
  {
    domain: CV, difficulty: 3, type: QType.SINGLE,
    stem: 'A government agency wants to use Azure Face recognition for citizen access control. Which is TRUE about deploying Face recognition responsibly on Azure?',
    options: opts4(
      'Face recognition can be enabled with one click for any subscription',
      'Face recognition features are gated — access is limited and requires application review aligned with Microsoft\'s Responsible AI policies',
      'No notice or consent is required for biometric data',
      'There are no input image quality requirements'
    ),
    correct: ['b'],
    explanation: 'Azure Face\'s recognition and liveness features are gated and require an approval process consistent with Microsoft\'s Responsible AI policies. Customers must also comply with applicable biometric data laws including providing notice and obtaining consent.',
    references: [REF_FACE, REF_RAI]
  },
  {
    domain: CV, difficulty: 3, type: QType.SINGLE,
    stem: 'The Azure AI Vision Read API (OCR) can extract both printed and handwritten text from images.',
    options: opts4('True', 'False', 'Only printed text', 'Only handwritten text'),
    correct: ['a'],
    explanation: 'True. The Read API uses deep-learning models to extract printed and handwritten text from photos and documents.',
    references: [REF_OCR, REF_VISION]
  },

  // ─── NLP (12) ───
  {
    domain: NLP, difficulty: 1, type: QType.SINGLE,
    stem: 'A product team wants to know whether tweets about their product are mostly positive or negative. Which Azure AI Language capability best fits?',
    options: opts4(
      'Key phrase extraction',
      'Sentiment analysis',
      'Optical character recognition',
      'Speech translation'
    ),
    correct: ['b'],
    explanation: 'Sentiment analysis classifies text as positive, neutral, or negative (with opinion mining for aspects) — the right tool for tracking customer sentiment.',
    references: [REF_SENT, REF_LANG]
  },
  {
    domain: NLP, difficulty: 1, type: QType.SINGLE,
    stem: 'You want to pull out the main TOPICS or important phrases from each of 10,000 customer reviews. Which Azure AI Language capability fits?',
    options: opts4(
      'Key phrase extraction',
      'Language detection',
      'Speech synthesis',
      'Object detection'
    ),
    correct: ['a'],
    explanation: 'Key phrase extraction returns the main concepts (key phrases) found in unstructured text and is well-suited to summarizing review themes.',
    references: [REF_KEYPHRASE, REF_LANG]
  },
  {
    domain: NLP, difficulty: 1, type: QType.SINGLE,
    stem: 'Which Azure AI Language capability identifies and CATEGORIZES things like people, places, and organizations in text?',
    options: opts4(
      'Named entity recognition (NER)',
      'Sentiment analysis',
      'Translator',
      'Key phrase extraction'
    ),
    correct: ['a'],
    explanation: 'NER detects entities such as Person, Location, Organization, Date, and Quantity in unstructured text and categorizes them into predefined types.',
    references: [REF_NER, REF_LANG]
  },
  {
    domain: NLP, difficulty: 1, type: QType.SINGLE,
    stem: 'A multinational support desk wants to detect the LANGUAGE each incoming chat is written in so it can be routed to the right agent. Which capability fits?',
    options: opts4(
      'Language detection',
      'Translation',
      'Sentiment analysis',
      'Speech-to-text'
    ),
    correct: ['a'],
    explanation: 'Language detection identifies the language a piece of text is written in (and confidence) so applications can route or translate appropriately.',
    references: [REF_LANG_DETECT, REF_LANG]
  },
  {
    domain: NLP, difficulty: 2, type: QType.SINGLE,
    stem: 'A user says into a phone: "Book me a flight to Tokyo next Tuesday." You want to convert that utterance into an INTENT ("BookFlight") plus ENTITIES ("Tokyo", "next Tuesday"). Which capability fits?',
    options: opts4(
      'Conversational language understanding (CLU)',
      'OCR',
      'Translator document mode',
      'Image classification'
    ),
    correct: ['a'],
    explanation: 'Conversational language understanding lets you train custom models that predict a user\'s overall intent and extract relevant entities from utterances — central to building voice assistants and bots.',
    references: [REF_CLU, REF_LANG]
  },
  {
    domain: NLP, difficulty: 2, type: QType.SINGLE,
    stem: 'An IT team wants users to ask common questions in natural language ("How do I reset my password?") and receive answers from an organization-curated FAQ. Which Azure AI Language capability fits?',
    options: opts4(
      'Question answering (custom question answering)',
      'Anomaly detection',
      'Object detection',
      'Speech translation'
    ),
    correct: ['a'],
    explanation: 'Question answering builds a knowledge base from FAQs/docs and returns the best answer to natural-language user questions — ideal for self-service support bots.',
    references: [REF_QA, REF_LANG]
  },
  {
    domain: NLP, difficulty: 2, type: QType.SINGLE,
    stem: 'You need to take a 30-page transcript and produce a short, readable overview that includes new sentences synthesized from the content. Which Azure AI Language capability fits?',
    options: opts4(
      'Abstractive summarization',
      'Extractive summarization only',
      'Named entity recognition',
      'OCR'
    ),
    correct: ['a'],
    explanation: 'Abstractive summarization generates new sentences that capture the meaning. Extractive summarization selects existing sentences. Both are summarization modes in Azure AI Language.',
    references: [REF_SUMM, REF_LANG]
  },
  {
    domain: NLP, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Azure AI service is the right choice for converting LIVE microphone audio into text in near real time?',
    options: opts4(
      'Azure AI Translator',
      'Azure AI Speech (speech to text)',
      'Azure AI Vision',
      'Azure AI Language sentiment analysis'
    ),
    correct: ['b'],
    explanation: 'Azure AI Speech provides speech-to-text including real-time transcription from streaming audio sources such as microphones.',
    references: [REF_STT, REF_SPEECH]
  },
  {
    domain: NLP, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Azure AI Speech capability converts written text into spoken audio using neural voices?',
    options: opts4(
      'Text to speech',
      'Speech to text',
      'Language identification',
      'OCR'
    ),
    correct: ['a'],
    explanation: 'Text to speech synthesizes humanlike audio from text using neural voices and supports SSML for prosody control.',
    references: [REF_TTS, REF_SPEECH]
  },
  {
    domain: NLP, difficulty: 2, type: QType.MULTI,
    stem: 'Select ALL Azure AI Translator capabilities.',
    options: opts4(
      'Real-time text translation between many languages',
      'Asynchronous document translation that preserves formatting',
      'Building a custom translation model for domain-specific terminology',
      'Image classification of photos'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Azure AI Translator provides text translation, document translation (preserving formatting), and Custom Translator. It does not perform image classification — that is Azure AI Vision.',
    references: [REF_TRANSLATOR, REF_LANG]
  },
  {
    domain: NLP, difficulty: 3, type: QType.SINGLE,
    stem: 'A travel app needs to translate spoken phrases between English and Japanese during a live conversation. Which Azure AI Speech feature fits?',
    options: opts4(
      'Speech translation',
      'OCR',
      'Question answering',
      'Custom Vision'
    ),
    correct: ['a'],
    explanation: 'Speech translation supports real-time multilingual speech-to-speech and speech-to-text translation — exactly the live conversation use case.',
    references: [REF_SPEECH_TRANS, REF_SPEECH]
  },
  {
    domain: NLP, difficulty: 3, type: QType.SINGLE,
    stem: 'Which statement best distinguishes Azure AI Translator from the speech translation capability of Azure AI Speech?',
    options: opts4(
      'Translator works on AUDIO; Speech works on TEXT',
      'Translator translates TEXT (and documents); Speech translation handles SPOKEN audio in real time',
      'They are identical products with two names',
      'Translator is for images only'
    ),
    correct: ['b'],
    explanation: 'Azure AI Translator translates text and documents. Azure AI Speech\'s speech translation feature handles spoken audio in real time, often combining STT with translation.',
    references: [REF_TRANSLATOR, REF_SPEECH_TRANS]
  },

  // ─── Generative AI (17) ───
  {
    domain: GENAI, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which best describes a "large language model" (LLM)?',
    options: opts4(
      'A relational database optimized for SQL',
      'A deep-learning model trained on very large amounts of text that can generate and understand natural language',
      'A spreadsheet with macros',
      'A type of disk encryption'
    ),
    correct: ['b'],
    explanation: 'An LLM is a deep neural network (usually Transformer-based) trained on massive text corpora to generate and understand language, and to follow instructions.',
    references: [REF_GENAI, REF_AOAI]
  },
  {
    domain: GENAI, difficulty: 1, type: QType.SINGLE,
    stem: 'In generative AI, what is a "prompt"?',
    options: opts4(
      'The trained weights of the model',
      'The input or instruction given to a model to elicit a response',
      'A compute target',
      'A type of encryption key'
    ),
    correct: ['b'],
    explanation: 'A prompt is the input text or instruction supplied to a generative model. Crafting effective prompts is called prompt engineering.',
    references: [REF_PROMPT, REF_GENAI]
  },
  {
    domain: GENAI, difficulty: 1, type: QType.SINGLE,
    stem: 'Which is a COMMON scenario for generative AI?',
    options: opts4(
      'Drafting marketing copy from a short brief',
      'Encrypting a database',
      'Provisioning a virtual network',
      'Replacing the operating system'
    ),
    correct: ['a'],
    explanation: 'Typical generative AI scenarios include drafting/summarizing text, coding assistance, image generation, and conversational agents. Encryption and infrastructure provisioning are not generative AI workloads.',
    references: [REF_GENAI, REF_FOUNDRY]
  },
  {
    domain: GENAI, difficulty: 1, type: QType.SINGLE,
    stem: 'Which Azure service is the unified platform for building, evaluating, deploying, and managing generative AI applications and agents?',
    options: opts4(
      'Microsoft Foundry (Azure AI Foundry)',
      'Azure Key Vault',
      'Azure Resource Manager',
      'Azure Bastion'
    ),
    correct: ['a'],
    explanation: 'Microsoft Foundry (Azure AI Foundry) is the unified Azure platform that combines models, tools, agents, and evaluation for enterprise generative AI applications.',
    references: [REF_FOUNDRY, REF_GENAI]
  },
  {
    domain: GENAI, difficulty: 1, type: QType.SINGLE,
    stem: 'Which Azure service provides access to GPT-family models for completion, chat, and embeddings?',
    options: opts4(
      'Azure OpenAI Service',
      'Azure AI Translator',
      'Azure AI Vision',
      'Azure Data Factory'
    ),
    correct: ['a'],
    explanation: 'Azure OpenAI Service provides Microsoft-managed access to GPT, embeddings, and image models with enterprise security and compliance.',
    references: [REF_AOAI, REF_AOAI_MODELS]
  },
  {
    domain: GENAI, difficulty: 2, type: QType.SINGLE,
    stem: 'A team wants to BROWSE many available foundation models (from Microsoft, OpenAI, Meta, Mistral, etc.) and deploy one. Which Azure AI Foundry capability supports this?',
    options: opts4(
      'The Foundry model catalog',
      'Azure Bastion',
      'Azure Cost Management only',
      'Azure DNS'
    ),
    correct: ['a'],
    explanation: 'The Azure AI Foundry model catalog is the central place to discover and deploy foundation models from many providers, including Microsoft, OpenAI, Meta, Mistral, and more.',
    references: [REF_CATALOG, REF_FOUNDRY]
  },
  {
    domain: GENAI, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Azure OpenAI model family is designed to GENERATE IMAGES from text prompts?',
    options: opts4(
      'GPT-3.5 Turbo',
      'Whisper',
      'DALL-E',
      'text-embedding-ada-002'
    ),
    correct: ['c'],
    explanation: 'DALL-E is the image-generation model family in Azure OpenAI Service. Whisper is audio transcription; embeddings produce vector representations of text; GPT chat models produce text.',
    references: [REF_AOAI_MODELS, REF_DALLE]
  },
  {
    domain: GENAI, difficulty: 2, type: QType.SINGLE,
    stem: 'A developer wants to ground an LLM in the company\'s internal knowledge base so responses cite recent, organization-specific documents. Which pattern is most appropriate?',
    options: opts4(
      'Fine-tune the model on emojis',
      'Retrieval Augmented Generation (RAG) — retrieve relevant chunks from a search index and supply them to the model as context',
      'Replace the model with a relational database',
      'Disable content filters'
    ),
    correct: ['b'],
    explanation: 'RAG augments the LLM with relevant external content at query time so it can ground responses in current, organization-specific data without retraining the base model.',
    references: [REF_RAG, REF_FOUNDRY]
  },
  {
    domain: GENAI, difficulty: 2, type: QType.SINGLE,
    stem: 'In Azure OpenAI, which feature helps PREVENT the model from returning hate, sexual, self-harm, or violent content?',
    options: opts4(
      'Content filters (safety system)',
      'Azure DNS',
      'Azure Files',
      'Azure DevTest Labs'
    ),
    correct: ['a'],
    explanation: 'Azure OpenAI applies content filters that flag and block harmful categories (hate, sexual, self-harm, violence) at configurable severity levels for both prompts and completions.',
    references: [REF_CONTENT_FILTER, REF_RAI_GENAI]
  },
  {
    domain: GENAI, difficulty: 2, type: QType.SINGLE,
    stem: 'A business user wants to build a no-code conversational copilot grounded on their SharePoint and ServiceNow data. Which Microsoft product fits best?',
    options: opts4(
      'Microsoft Copilot Studio',
      'Azure Bastion',
      'Azure Functions',
      'Azure SQL Database'
    ),
    correct: ['a'],
    explanation: 'Microsoft Copilot Studio is the low-code product for building custom copilots/agents grounded in business data, with topics, actions, and channels.',
    references: [REF_COPILOT_STUDIO, REF_FOUNDRY]
  },
  {
    domain: GENAI, difficulty: 2, type: QType.SINGLE,
    stem: 'When a generative model produces a confident-sounding but factually wrong answer, what is this commonly called?',
    options: opts4(
      'Compilation error',
      'Hallucination',
      'Race condition',
      'Stack overflow'
    ),
    correct: ['b'],
    explanation: 'A hallucination is fabricated or inaccurate content that sounds plausible. Mitigations include grounding via RAG, lower temperature, citations, and human review.',
    references: [REF_RAI_GENAI, REF_GENAI]
  },
  {
    domain: GENAI, difficulty: 2, type: QType.MULTI,
    stem: 'Select ALL of the following that are valid Responsible AI considerations specifically called out for generative AI workloads.',
    options: opts4(
      'Risk of hallucinated / fabricated content',
      'Risk of generating harmful or biased content',
      'Need for human oversight in high-stakes decisions',
      'Requirement to disable all logging'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Microsoft\'s transparency notes for generative AI highlight hallucinations, harmful/biased outputs, and the need for human oversight in high-stakes scenarios. Disabling logging is not a recommended practice.',
    references: [REF_RAI_GENAI, REF_CONTENT_FILTER]
  },
  {
    domain: GENAI, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Azure AI Foundry feature lets you EVALUATE prompt and model performance interactively before committing to a deployment?',
    options: opts4(
      'Foundry portal playgrounds',
      'Azure Bastion',
      'Azure DevTest Labs only',
      'Azure Functions cold-start metrics'
    ),
    correct: ['a'],
    explanation: 'The Foundry portal includes playgrounds where you can interactively test prompts against deployed models, tune parameters, and compare outputs before going to production.',
    references: [REF_FOUNDRY, REF_FOUNDRY_PORTAL]
  },
  {
    domain: GENAI, difficulty: 3, type: QType.SINGLE,
    stem: 'You want a developer assistant that suggests and completes code inside the IDE. Which type of generative AI experience does this best illustrate?',
    options: opts4(
      'A code-focused copilot/assistant powered by an LLM',
      'A NoSQL database query',
      'A facial detection API',
      'A speech translator only'
    ),
    correct: ['a'],
    explanation: 'Code completion is a common generative AI scenario, delivered through copilots powered by LLMs (for example, GitHub Copilot built on OpenAI models, or developer copilots in Foundry).',
    references: [REF_GENAI, REF_AOAI]
  },
  {
    domain: GENAI, difficulty: 3, type: QType.SINGLE,
    stem: 'Which is the BEST description of "tokens" in the context of large language models?',
    options: opts4(
      'Pieces of text (often subwords) that the model processes — both inputs and outputs are measured in tokens',
      'JSON web tokens used for authentication only',
      'GPU device IDs',
      'Currency used to pay Azure invoices'
    ),
    correct: ['a'],
    explanation: 'LLMs operate on tokens (often subword units). Context windows and usage / billing for many models are measured in input + output tokens.',
    references: [REF_GENAI, REF_AOAI]
  },
  {
    domain: GENAI, difficulty: 3, type: QType.SINGLE,
    stem: 'A developer wants to ADAPT a base LLM\'s STYLE and behavior using a curated dataset of example prompts and ideal responses. Which technique is this?',
    options: opts4(
      'Fine-tuning',
      'Image classification',
      'OCR',
      'Anomaly detection'
    ),
    correct: ['a'],
    explanation: 'Fine-tuning further trains a base model on a curated dataset to adapt its style, format, or behavior. Azure OpenAI and Foundry support fine-tuning for several models.',
    references: [REF_AOAI, REF_AOAI_MODELS]
  },
  {
    domain: GENAI, difficulty: 3, type: QType.SINGLE,
    stem: 'Azure OpenAI gives the SAME GPT-family models as the public OpenAI API but adds Azure-grade security, networking, regional deployment, and content safety integration.',
    options: opts4('True', 'False', 'Only true for embeddings', 'Only true for image models'),
    correct: ['a'],
    explanation: 'True. Azure OpenAI provides Microsoft-managed access to the OpenAI models with Azure security, private networking, regional deployments, and integrated content filters.',
    references: [REF_AOAI, REF_AOAI_MODELS]
  }
];

// ───────────────────── Practice Exam 2 ─────────────────────
const P2: Q[] = [
  // ─── AI Workloads & considerations (12) ───
  {
    domain: AIW, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'A factory wants software to find unusual vibration patterns in machine sensor data that may indicate an impending failure. Which AI workload best fits?',
    options: opts4(
      'Computer vision',
      'Anomaly detection',
      'Generative AI image creation',
      'Optical character recognition'
    ),
    correct: ['b'],
    explanation: 'Finding rare or unusual data points relative to a baseline is anomaly detection — a recognized AI workload pattern.',
    references: [REF_STUDY, REF_RAI]
  },
  {
    domain: AIW, difficulty: 1, type: QType.SINGLE,
    stem: 'A team wants to make scanned legal contracts SEARCHABLE so users can find clauses across all archived PDFs. Which AI workload does this represent?',
    options: opts4(
      'Document processing combined with knowledge mining',
      'Generative image synthesis',
      'Reinforcement learning',
      'Speech translation'
    ),
    correct: ['a'],
    explanation: 'Indexing scanned documents to make them searchable typically combines OCR/document processing with search-based knowledge mining.',
    references: [REF_DOC_INTEL, REF_STUDY]
  },
  {
    domain: AIW, difficulty: 1, type: QType.SINGLE,
    stem: 'Which is an example of a NATURAL LANGUAGE PROCESSING workload?',
    options: opts4(
      'Translating an English sentence into French',
      'Detecting where a car is in a photo',
      'Reading a barcode',
      'Encrypting a file'
    ),
    correct: ['a'],
    explanation: 'Translation between languages is an NLP workload provided by Azure AI Translator. Object detection is computer vision; barcode reading and encryption are not NLP.',
    references: [REF_TRANSLATOR, REF_STUDY]
  },
  {
    domain: AIW, difficulty: 1, type: QType.SINGLE,
    stem: 'A clinic uses AI to draft a summary of a patient\'s previous notes. Which AI workload is this?',
    options: opts4(
      'Generative AI',
      'Object detection',
      'Optical character recognition',
      'Clustering'
    ),
    correct: ['a'],
    explanation: 'Producing new natural-language summaries is a generative AI workload, typically powered by an LLM.',
    references: [REF_GENAI, REF_SUMM]
  },
  {
    domain: AIW, difficulty: 2, type: QType.SINGLE,
    stem: 'A hiring tool reaches a different conclusion for two candidates with nearly identical résumés but different genders. Which Responsible AI principle is MOST clearly being violated?',
    options: opts4(
      'Fairness',
      'Reliability and safety',
      'Inclusiveness',
      'Transparency'
    ),
    correct: ['a'],
    explanation: 'Fairness requires similar treatment for similar applicants regardless of protected attributes such as gender — exactly the issue described.',
    references: [REF_RAI, REF_FAIRNESS]
  },
  {
    domain: AIW, difficulty: 2, type: QType.SINGLE,
    stem: 'An organization publishes a public document explaining what an AI system is designed to do, its limitations, and how it makes decisions. Which Responsible AI principle does this support?',
    options: opts4(
      'Privacy and security',
      'Transparency',
      'Inclusiveness',
      'Reliability and safety'
    ),
    correct: ['b'],
    explanation: 'Transparency requires that the design, capabilities, and limitations of AI systems be understandable to users — for example via transparency notes and interpretability tools.',
    references: [REF_RAI, REF_INTERP]
  },
  {
    domain: AIW, difficulty: 2, type: QType.SINGLE,
    stem: 'Which is the BEST example of supporting INCLUSIVENESS in an AI system?',
    options: opts4(
      'Requiring users to have the latest hardware',
      'Designing a UI that supports screen readers and high-contrast colors so people with disabilities can use it',
      'Removing all documentation',
      'Disabling logging'
    ),
    correct: ['b'],
    explanation: 'Inclusiveness empowers people of all abilities and backgrounds — accessibility features such as screen-reader support and high contrast are concrete inclusiveness measures.',
    references: [REF_RAI, REF_STUDY]
  },
  {
    domain: AIW, difficulty: 2, type: QType.SINGLE,
    stem: 'An AI healthcare tool will be used to flag patient records for follow-up. Which control most directly supports the ACCOUNTABILITY principle?',
    options: opts4(
      'Allowing the model to act fully autonomously with no review',
      'Hiding the model\'s outputs from doctors',
      'Requiring a qualified human to review and approve flagged records',
      'Disabling all monitoring'
    ),
    correct: ['c'],
    explanation: 'Accountability requires meaningful human oversight, especially in consequential domains such as healthcare. A "human in the loop" review is a canonical example.',
    references: [REF_RAI, REF_STUDY]
  },
  {
    domain: AIW, difficulty: 2, type: QType.MULTI,
    stem: 'Select ALL examples of considerations that relate to PRIVACY AND SECURITY in an AI system.',
    options: opts4(
      'Encrypting personal data at rest and in transit',
      'Applying role-based access control to training data',
      'Allowing the model to retain raw PII indefinitely with no controls',
      'Complying with regulations such as GDPR'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Encryption, RBAC, and regulatory compliance support privacy and security. Indefinite uncontrolled retention of PII violates the principle.',
    references: [REF_RAI, REF_STUDY]
  },
  {
    domain: AIW, difficulty: 3, type: QType.SINGLE,
    stem: 'Which is the BEST description of RELIABILITY AND SAFETY in the context of an AI system?',
    options: opts4(
      'The system always returns the same answer regardless of input',
      'The system operates consistently and handles unexpected conditions, errors, and edge cases without causing harm',
      'The system is the fastest model available',
      'The system runs only in one Azure region'
    ),
    correct: ['b'],
    explanation: 'Reliability and safety means the AI system behaves consistently, handles edge cases, and resists harmful manipulation, including under unexpected conditions.',
    references: [REF_RAI, REF_STUDY]
  },
  {
    domain: AIW, difficulty: 3, type: QType.SINGLE,
    stem: 'A team uses the Responsible AI dashboard\'s "error analysis" component on a credit model. They notice the error rate is much higher for one demographic cohort. Which TWO principles are MOST directly engaged?',
    options: opts4(
      'Fairness and reliability/safety',
      'Cost management and DevOps',
      'Region selection and pricing',
      'Disk I/O and CPU usage'
    ),
    correct: ['a'],
    explanation: 'Higher error rates for a demographic cohort is both a fairness concern (disparate impact) and a reliability/safety concern (the model underperforms for that group).',
    references: [REF_RAI_DASH, REF_FAIRNESS]
  },
  {
    domain: AIW, difficulty: 3, type: QType.SINGLE,
    stem: 'A Responsible AI scorecard exported from Azure Machine Learning can be shared with non-technical stakeholders to communicate model fairness, error analysis, and explanations.',
    options: opts4('True', 'False', 'Only available to administrators', 'Only available in preview regions'),
    correct: ['a'],
    explanation: 'True. The Responsible AI scorecard is a configurable PDF report intended to communicate model insights to both technical and non-technical stakeholders.',
    references: [REF_RAI, REF_RAI_DASH]
  },

  // ─── ML on Azure (12) ───
  {
    domain: ML, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which ML task predicts a category from a set of MORE THAN TWO labels (for example, classifying a photo as "cat", "dog", or "rabbit")?',
    options: opts4(
      'Regression',
      'Binary classification',
      'Multiclass classification',
      'Clustering'
    ),
    correct: ['c'],
    explanation: 'Predicting one label from three or more possible categories is multiclass classification, a supervised learning task.',
    references: [REF_ML_FUND, REF_AML]
  },
  {
    domain: ML, difficulty: 1, type: QType.SINGLE,
    stem: 'In supervised learning, the input variables used to predict an outcome are called:',
    options: opts4(
      'Features',
      'Labels',
      'Endpoints',
      'Workspaces'
    ),
    correct: ['a'],
    explanation: 'Features are the input variables. The label is what you want to predict. Endpoints expose the trained model; workspaces are the AML container.',
    references: [REF_ML_FUND, REF_AML]
  },
  {
    domain: ML, difficulty: 1, type: QType.SINGLE,
    stem: 'Which is an example of TIME-SERIES FORECASTING?',
    options: opts4(
      'Predicting next month\'s electricity demand from years of hourly readings',
      'Grouping customers by purchase behavior',
      'Detecting cats in a photo',
      'Translating English to Spanish'
    ),
    correct: ['a'],
    explanation: 'Forecasting numeric values over future time periods (such as demand) using historical observations is time-series forecasting, supported in AutoML.',
    references: [REF_AUTOML, REF_ML_FUND]
  },
  {
    domain: ML, difficulty: 1, type: QType.SINGLE,
    stem: 'Which Azure Machine Learning component automatically tries different algorithms and selects the best model?',
    options: opts4(
      'Automated ML (AutoML)',
      'Compute target',
      'Workspace',
      'Datastore'
    ),
    correct: ['a'],
    explanation: 'AutoML iterates through algorithms and hyperparameters to find the best model for your target metric — no manual algorithm selection required.',
    references: [REF_AUTOML, REF_ML_FUND]
  },
  {
    domain: ML, difficulty: 2, type: QType.SINGLE,
    stem: 'Which is TRUE about deep learning?',
    options: opts4(
      'It uses neural networks with multiple hidden layers and is well suited to images, speech, and language',
      'It cannot be used for image or language tasks',
      'It is the only ML technique that exists',
      'It works only on tiny datasets'
    ),
    correct: ['a'],
    explanation: 'Deep learning uses multilayer neural networks and is the backbone of modern image, speech, and language solutions. It typically benefits from large datasets.',
    references: [REF_DL, REF_ML_FUND]
  },
  {
    domain: ML, difficulty: 2, type: QType.SINGLE,
    stem: 'A team wants a no-code, drag-and-drop authoring experience in Azure Machine Learning for building pipelines. Which feature should they use?',
    options: opts4(
      'Azure Machine Learning designer',
      'Azure DevTest Labs',
      'Azure Cost Management',
      'Azure Bastion'
    ),
    correct: ['a'],
    explanation: 'The Azure Machine Learning designer is a drag-and-drop canvas where users can build, train, and deploy pipelines without writing code.',
    references: [REF_DESIGNER, REF_ML_FUND]
  },
  {
    domain: ML, difficulty: 2, type: QType.SINGLE,
    stem: 'What is the role of a VALIDATION dataset (as opposed to training and test sets)?',
    options: opts4(
      'It is used during training to tune model hyperparameters and pick the best configuration',
      'It is the same as the test set',
      'It encrypts the training data',
      'It is automatically deleted'
    ),
    correct: ['a'],
    explanation: 'Validation data is used to tune hyperparameters and select the best configuration during training. The test set is held out for a final, unbiased evaluation.',
    references: [REF_ML_FUND, REF_AUTOML]
  },
  {
    domain: ML, difficulty: 2, type: QType.SINGLE,
    stem: 'In Azure Machine Learning, what is a "workspace"?',
    options: opts4(
      'A relational database product',
      'A top-level resource that groups assets such as datasets, models, experiments, environments, and compute',
      'A particular GPU SKU',
      'A region pair'
    ),
    correct: ['b'],
    explanation: 'An Azure Machine Learning workspace is the top-level resource that organizes datasets, models, experiments, environments, jobs, and compute targets in one place.',
    references: [REF_AML, REF_ML_FUND]
  },
  {
    domain: ML, difficulty: 2, type: QType.SINGLE,
    stem: 'Which choice best matches a BATCH ENDPOINT in Azure Machine Learning?',
    options: opts4(
      'Real-time, synchronous scoring of a single record',
      'Asynchronous scoring of large volumes of data on compute clusters',
      'A storage encryption key',
      'A type of dataset'
    ),
    correct: ['b'],
    explanation: 'Batch endpoints run jobs asynchronously to process data in parallel on compute clusters — suitable for scoring large volumes of data, unlike online endpoints which are real-time.',
    references: [REF_DEPLOY, REF_MLOPS]
  },
  {
    domain: ML, difficulty: 2, type: QType.MULTI,
    stem: 'Select ALL capabilities described as part of Azure Machine Learning.',
    options: opts4(
      'Automated machine learning',
      'Designer for no-code pipelines',
      'Managed endpoints for real-time and batch scoring',
      'A relational OLTP database engine'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Azure Machine Learning includes AutoML, designer, and managed endpoints (online and batch). A relational OLTP engine is Azure SQL — a separate service.',
    references: [REF_AML, REF_AUTOML, REF_DESIGNER, REF_DEPLOY]
  },
  {
    domain: ML, difficulty: 3, type: QType.SINGLE,
    stem: 'Which BEST describes the Responsible AI dashboard in Azure Machine Learning?',
    options: opts4(
      'A reporting tool for Azure billing',
      'An integrated dashboard that includes model interpretability, error analysis, fairness, and counterfactual analysis',
      'A code editor',
      'A backup tool'
    ),
    correct: ['b'],
    explanation: 'The Responsible AI dashboard integrates fairness, error analysis, interpretability/explanations, and counterfactual what-if analysis to help debug and document models.',
    references: [REF_RAI_DASH, REF_FAIRNESS]
  },
  {
    domain: ML, difficulty: 3, type: QType.SINGLE,
    stem: 'Which BEST describes the goal of FEATURE ENGINEERING (or featurization) in machine learning?',
    options: opts4(
      'To delete training data',
      'To transform raw data into features that help algorithms learn better (for example, encoding, scaling, normalization)',
      'To rename the workspace',
      'To switch the Azure region'
    ),
    correct: ['b'],
    explanation: 'Feature engineering / featurization improves model performance by transforming raw data: scaling, normalizing, encoding categoricals, handling missing values, and similar steps.',
    references: [REF_AUTOML, REF_ML_FUND]
  },

  // ─── Computer vision (12) ───
  {
    domain: CV, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'A model must identify whether each photo is "ripe" or "unripe" for an entire crate of apples. Which computer vision task is this?',
    options: opts4(
      'Image classification',
      'Object detection',
      'OCR',
      'Image generation'
    ),
    correct: ['a'],
    explanation: 'Assigning a single label to a whole image is image classification. Object detection would also draw bounding boxes around each apple.',
    references: [REF_IMAGE_ANALYSIS, REF_VISION]
  },
  {
    domain: CV, difficulty: 1, type: QType.SINGLE,
    stem: 'Which Azure AI service offers PREBUILT models for invoices, receipts, IDs, and business cards?',
    options: opts4(
      'Azure AI Document Intelligence',
      'Azure AI Translator',
      'Azure AI Language',
      'Azure AI Speech'
    ),
    correct: ['a'],
    explanation: 'Azure AI Document Intelligence ships prebuilt models for common document types (invoices, receipts, IDs, business cards) and also supports custom-trained models.',
    references: [REF_DOC_INTEL, REF_VISION]
  },
  {
    domain: CV, difficulty: 1, type: QType.SINGLE,
    stem: 'A government office wants to digitize handwritten paper forms into searchable text. Which Azure capability is most directly applicable?',
    options: opts4(
      'OCR (the Read API in Azure AI Vision)',
      'Speech translation',
      'Anomaly detection',
      'Object detection only'
    ),
    correct: ['a'],
    explanation: 'OCR via the Azure AI Vision Read API extracts printed and handwritten text from images and documents.',
    references: [REF_OCR, REF_VISION]
  },
  {
    domain: CV, difficulty: 1, type: QType.SINGLE,
    stem: 'What does Azure AI Custom Vision allow you to do?',
    options: opts4(
      'Train your own image classification or object detection model on your labeled images',
      'Translate spoken audio in real time',
      'Build a relational database',
      'Encrypt blob storage'
    ),
    correct: ['a'],
    explanation: 'Azure AI Custom Vision lets you upload labeled images and train custom classification or object detection models that you can publish as endpoints.',
    references: [REF_CUSTOM_VISION, REF_VISION]
  },
  {
    domain: CV, difficulty: 2, type: QType.SINGLE,
    stem: 'Which BEST describes the difference between IMAGE CLASSIFICATION and OBJECT DETECTION?',
    options: opts4(
      'Classification assigns labels to the whole image; detection finds and locates each object with a bounding box',
      'They are identical tasks',
      'Classification works only on video; detection only on photos',
      'Detection assigns one label to the whole image; classification finds bounding boxes'
    ),
    correct: ['a'],
    explanation: 'Classification labels the whole image; object detection identifies multiple objects and returns their bounding-box coordinates.',
    references: [REF_IMAGE_ANALYSIS, REF_AUTOML]
  },
  {
    domain: CV, difficulty: 2, type: QType.SINGLE,
    stem: 'A user uploads a photo of a kitchen. The app returns "indoor, kitchen, stove, refrigerator". Which Azure AI Vision feature most likely produced this output?',
    options: opts4(
      'Image analysis with tags / objects',
      'Document Intelligence invoice model',
      'Speech to text',
      'Sentiment analysis'
    ),
    correct: ['a'],
    explanation: 'Azure AI Vision\'s image analysis returns tags, captions, and detected objects describing image content — exactly what is shown.',
    references: [REF_IMAGE_ANALYSIS, REF_VISION]
  },
  {
    domain: CV, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Azure AI Face capability would you use to find which one of 1,000 enrolled employees matches a face on a security camera?',
    options: opts4(
      'Face verification (one-to-one)',
      'Face identification (one-to-many)',
      'Object detection',
      'OCR'
    ),
    correct: ['b'],
    explanation: 'Face identification matches a face against a set (one-to-many). Verification is one-to-one — confirming whether two faces are the same person.',
    references: [REF_FACE, REF_VISION]
  },
  {
    domain: CV, difficulty: 2, type: QType.SINGLE,
    stem: 'Which is TRUE about facial DETECTION attributes returned by the Azure Face service today?',
    options: opts4(
      'Face emotion and gender are not returned because those capabilities were retired/limited to support Responsible AI',
      'It returns full medical diagnoses',
      'It returns the legal identity of the person automatically',
      'It always returns mood-prediction probabilities'
    ),
    correct: ['a'],
    explanation: 'Microsoft retired emotion and gender attributes and limited several others as part of Responsible AI commitments to avoid stereotyping and misuse.',
    references: [REF_FACE, REF_RAI]
  },
  {
    domain: CV, difficulty: 2, type: QType.MULTI,
    stem: 'Select ALL items that are valid use cases for Azure AI Document Intelligence.',
    options: opts4(
      'Extracting fields from supplier invoices',
      'Reading data from receipts for an expense app',
      'Translating subtitles of a movie',
      'Building a custom form-extraction model from sample documents'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Document Intelligence has prebuilt models (invoices, receipts) and supports custom models. Translating subtitles is Azure AI Translator / Speech translation.',
    references: [REF_DOC_INTEL, REF_VISION]
  },
  {
    domain: CV, difficulty: 3, type: QType.SINGLE,
    stem: 'A retailer wants to enforce "no face data may leave our region" while still using Azure to detect faces. Which control most directly supports this requirement?',
    options: opts4(
      'Choosing an Azure region close to the customer and using regional Azure AI resources',
      'Disabling all logging',
      'Sending data to a public web search',
      'Storing data on a personal laptop'
    ),
    correct: ['a'],
    explanation: 'Azure AI services are deployed regionally and data is processed in the chosen region — supporting data residency requirements. Disabling logging or storing data on a laptop does not satisfy the requirement responsibly.',
    references: [REF_FACE, REF_RAI]
  },
  {
    domain: CV, difficulty: 3, type: QType.SINGLE,
    stem: 'Which BEST contrasts Azure AI Vision OCR with Azure AI Document Intelligence?',
    options: opts4(
      'OCR extracts raw text from images; Document Intelligence ALSO extracts structured key-value pairs, tables, and document layout',
      'OCR only works on JPGs while Document Intelligence works on text files',
      'They are identical services',
      'Document Intelligence has no support for OCR'
    ),
    correct: ['a'],
    explanation: 'OCR returns raw text. Document Intelligence builds on OCR to extract structured key-value pairs, tables, selection marks, and layout — useful for forms.',
    references: [REF_OCR, REF_DOC_INTEL]
  },
  {
    domain: CV, difficulty: 3, type: QType.SINGLE,
    stem: 'Liveness detection in Azure AI Face is intended to confirm that the face presented to the camera belongs to a real, present person and not a photo or mask.',
    options: opts4('True', 'False', 'It detects emotions only', 'It detects ages only'),
    correct: ['a'],
    explanation: 'True. Liveness detection is an anti-spoofing feature that confirms the person is physically present, defending against printed photos, recorded videos, and 3D masks.',
    references: [REF_FACE, REF_VISION]
  },

  // ─── NLP (12) ───
  {
    domain: NLP, difficulty: 1, type: QType.SINGLE,
    stem: 'A bank wants every chatbot conversation translated into the customer\'s native language. Which service is most appropriate for translating chat messages?',
    options: opts4(
      'Azure AI Translator',
      'Azure AI Vision',
      'Azure Machine Learning AutoML',
      'Azure Key Vault'
    ),
    correct: ['a'],
    explanation: 'Azure AI Translator translates text between many languages, both interactively and in batches — ideal for chat translation.',
    references: [REF_TRANSLATOR, REF_LANG]
  },
  {
    domain: NLP, difficulty: 1, type: QType.SINGLE,
    stem: 'Which Azure AI Language feature returns the MAIN CONCEPTS of an article as a short list of phrases?',
    options: opts4(
      'Sentiment analysis',
      'Key phrase extraction',
      'Translator',
      'Speech translation'
    ),
    correct: ['b'],
    explanation: 'Key phrase extraction returns the main phrases / concepts in unstructured text — useful for tagging and summarization preview.',
    references: [REF_KEYPHRASE, REF_LANG]
  },
  {
    domain: NLP, difficulty: 1, type: QType.SINGLE,
    stem: 'Which is the right Azure capability to convert a long meeting transcript into a short paragraph summary?',
    options: opts4(
      'Summarization in Azure AI Language',
      'OCR',
      'Custom Vision',
      'AutoML regression'
    ),
    correct: ['a'],
    explanation: 'Summarization in Azure AI Language supports extractive and abstractive summarization of text and conversations — including meeting transcripts.',
    references: [REF_SUMM, REF_LANG]
  },
  {
    domain: NLP, difficulty: 1, type: QType.SINGLE,
    stem: 'Which Azure AI Language feature is BEST for detecting that a sentence mentions a "Person" called "Alice" and an "Organization" called "Contoso"?',
    options: opts4(
      'Named entity recognition',
      'Key phrase extraction',
      'Sentiment analysis',
      'Speech translation'
    ),
    correct: ['a'],
    explanation: 'Named entity recognition classifies words/phrases in text into predefined categories such as Person, Organization, Location, Date, and Quantity.',
    references: [REF_NER, REF_LANG]
  },
  {
    domain: NLP, difficulty: 2, type: QType.SINGLE,
    stem: 'A team wants the AI to read a customer review and decide whether the review expresses positive, neutral, or negative opinion ABOUT a specific feature (e.g., "battery life"). Which capability is best?',
    options: opts4(
      'Sentiment analysis with opinion mining',
      'OCR',
      'Object detection',
      'Translation only'
    ),
    correct: ['a'],
    explanation: 'Opinion mining (an aspect-based extension of sentiment analysis) ties sentiment to specific aspects (such as "battery life") rather than the whole document.',
    references: [REF_SENT, REF_LANG]
  },
  {
    domain: NLP, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Azure AI service is most appropriate for a voicebot that LISTENS to a caller, transcribes their utterance, and responds with synthesized speech?',
    options: opts4(
      'Azure AI Speech (combining speech-to-text and text-to-speech)',
      'Azure AI Vision only',
      'Azure AI Document Intelligence only',
      'Azure Bastion'
    ),
    correct: ['a'],
    explanation: 'A voicebot uses speech-to-text to transcribe the caller and text-to-speech to respond — both provided by Azure AI Speech.',
    references: [REF_SPEECH, REF_STT, REF_TTS]
  },
  {
    domain: NLP, difficulty: 2, type: QType.SINGLE,
    stem: 'What BEST describes the role of SSML (Speech Synthesis Markup Language) in Azure AI Speech?',
    options: opts4(
      'It is used to encrypt audio files',
      'It is a markup language to fine-tune text-to-speech output, such as voice, pitch, pronunciation, and speaking rate',
      'It defines a database schema',
      'It is a chart visualization library'
    ),
    correct: ['b'],
    explanation: 'SSML is an XML-based markup that lets you fine-tune voice, pitch, pronunciation, speaking rate, volume, pauses, and emphasis in text-to-speech output.',
    references: [REF_TTS, REF_LANG]
  },
  {
    domain: NLP, difficulty: 2, type: QType.SINGLE,
    stem: 'A company wants its internal support knowledge base to answer questions in chat using natural language. Which Azure AI Language feature is the most direct fit?',
    options: opts4(
      'Question answering',
      'OCR',
      'Anomaly detection',
      'Speech translation'
    ),
    correct: ['a'],
    explanation: 'Question answering (custom question answering) builds a knowledge base from FAQs and docs and responds to user questions in natural language.',
    references: [REF_QA, REF_LANG]
  },
  {
    domain: NLP, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Azure AI capability classifies the INTENT of a free-form user utterance and pulls out relevant entities (such as a destination or date) in a chatbot scenario?',
    options: opts4(
      'Conversational language understanding',
      'OCR',
      'Translator',
      'Custom Vision'
    ),
    correct: ['a'],
    explanation: 'CLU (Conversational Language Understanding) is the modern Azure AI Language capability for training intent / entity models for natural-language chat and voice apps.',
    references: [REF_CLU, REF_LANG]
  },
  {
    domain: NLP, difficulty: 2, type: QType.MULTI,
    stem: 'Select ALL features of Azure AI Language.',
    options: opts4(
      'Key phrase extraction',
      'Sentiment analysis',
      'Named entity recognition',
      'Image classification'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Key phrase extraction, sentiment analysis, and NER are Azure AI Language features. Image classification belongs to Azure AI Vision / Custom Vision.',
    references: [REF_LANG, REF_KEYPHRASE, REF_SENT, REF_NER]
  },
  {
    domain: NLP, difficulty: 3, type: QType.SINGLE,
    stem: 'A media company wants to dub a video into 10 languages with natural-sounding voices. Which combination of Azure services is most appropriate?',
    options: opts4(
      'Azure AI Translator for translation + Azure AI Speech text-to-speech (with neural voices) for narration',
      'Azure AI Vision for translation',
      'Azure Bastion for translation',
      'AutoML regression to translate'
    ),
    correct: ['a'],
    explanation: 'Translator handles text translation; Azure AI Speech\'s neural text-to-speech generates natural narration in many languages — a typical dubbing pipeline.',
    references: [REF_TRANSLATOR, REF_TTS]
  },
  {
    domain: NLP, difficulty: 3, type: QType.SINGLE,
    stem: 'Which BEST describes the difference between EXTRACTIVE and ABSTRACTIVE summarization?',
    options: opts4(
      'Extractive selects key sentences from the source; abstractive generates new sentences that paraphrase the content',
      'Extractive only works on images; abstractive only on audio',
      'Extractive is the same as translation',
      'Abstractive copies word-for-word from the source only'
    ),
    correct: ['a'],
    explanation: 'Extractive summarization selects existing sentences. Abstractive summarization produces new sentences that paraphrase and condense the content.',
    references: [REF_SUMM, REF_LANG]
  },

  // ─── Generative AI (17) ───
  {
    domain: GENAI, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Azure service is the unified PaaS for building, evaluating, deploying, and operating agents and generative AI applications across many model providers?',
    options: opts4(
      'Microsoft Foundry (Azure AI Foundry)',
      'Azure Cost Management',
      'Azure Storage Explorer',
      'Azure Data Studio'
    ),
    correct: ['a'],
    explanation: 'Microsoft Foundry is the unified platform that brings models, tools, agents, evaluation, observability, and governance under one Azure resource provider.',
    references: [REF_FOUNDRY, REF_GENAI]
  },
  {
    domain: GENAI, difficulty: 1, type: QType.SINGLE,
    stem: 'Which Azure OpenAI model family is purpose-built for AUDIO TRANSCRIPTION?',
    options: opts4(
      'DALL-E',
      'Whisper',
      'Embeddings',
      'GPT chat'
    ),
    correct: ['b'],
    explanation: 'Whisper is the audio transcription model family available through Azure OpenAI. DALL-E is image generation; embeddings produce vectors; GPT chat produces text replies.',
    references: [REF_AOAI_MODELS, REF_GENAI]
  },
  {
    domain: GENAI, difficulty: 1, type: QType.SINGLE,
    stem: 'Which Azure OpenAI model family is purpose-built to produce vector representations of text (often used for semantic search)?',
    options: opts4(
      'DALL-E',
      'Whisper',
      'Embeddings (e.g., text-embedding-3 models)',
      'GPT-4 chat'
    ),
    correct: ['c'],
    explanation: 'Embedding models produce vector representations that capture semantic meaning, enabling search, clustering, and similarity scoring (and underpinning RAG retrieval).',
    references: [REF_AOAI_MODELS, REF_RAG]
  },
  {
    domain: GENAI, difficulty: 1, type: QType.SINGLE,
    stem: 'What is "prompt engineering"?',
    options: opts4(
      'Designing inputs/instructions for a generative model to get more useful, accurate, or safer outputs',
      'A type of cloud encryption',
      'A facial recognition technique',
      'A way to provision GPUs'
    ),
    correct: ['a'],
    explanation: 'Prompt engineering is the practice of designing prompts (instructions, examples, system messages) to steer model behavior — without retraining the model.',
    references: [REF_PROMPT, REF_GENAI]
  },
  {
    domain: GENAI, difficulty: 1, type: QType.SINGLE,
    stem: 'Which generative AI scenario is BEST described by the phrase "summarize 100 long product reviews into one paragraph per product"?',
    options: opts4(
      'Image generation',
      'Text summarization with a generative model',
      'Sentiment scoring only',
      'Speech synthesis only'
    ),
    correct: ['b'],
    explanation: 'Summarizing long unstructured text into shorter coherent text is a generative-AI text scenario — LLMs (often chat models) do this well.',
    references: [REF_GENAI, REF_SUMM]
  },
  {
    domain: GENAI, difficulty: 2, type: QType.SINGLE,
    stem: 'A team wants to ground an LLM on their up-to-date internal documents WITHOUT retraining the model. Which approach fits best?',
    options: opts4(
      'Retrieval Augmented Generation (RAG) with a vector or hybrid index',
      'Fine-tune a model on every document daily',
      'Replace the LLM with a relational database',
      'Disable content filtering'
    ),
    correct: ['a'],
    explanation: 'RAG retrieves relevant text from an index (often using embeddings) and supplies it to the LLM as context — getting fresh, organization-specific answers without retraining.',
    references: [REF_RAG, REF_GENAI]
  },
  {
    domain: GENAI, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Azure AI service is the most direct way for a low-code maker to BUILD A CUSTOM COPILOT grounded on their business data and publish it to Microsoft Teams?',
    options: opts4(
      'Microsoft Copilot Studio',
      'Azure Bastion',
      'Azure Functions',
      'Azure Data Lake Storage'
    ),
    correct: ['a'],
    explanation: 'Microsoft Copilot Studio is the low-code product for building custom copilots/agents, with topics, knowledge sources, and channels including Microsoft Teams.',
    references: [REF_COPILOT_STUDIO, REF_GENAI]
  },
  {
    domain: GENAI, difficulty: 2, type: QType.SINGLE,
    stem: 'Which BEST describes the FOUNDRY MODEL CATALOG?',
    options: opts4(
      'A built-in malware database',
      'A central place to discover and deploy foundation models from Microsoft, OpenAI, Meta, Mistral, and others',
      'A storage account',
      'A cost analysis dashboard'
    ),
    correct: ['b'],
    explanation: 'The Foundry model catalog lets you browse and deploy a wide range of foundation models — including Microsoft, OpenAI, Meta Llama, Mistral, DeepSeek, and Hugging Face models.',
    references: [REF_CATALOG, REF_FOUNDRY]
  },
  {
    domain: GENAI, difficulty: 2, type: QType.SINGLE,
    stem: 'Which is TRUE about Azure OpenAI content filtering?',
    options: opts4(
      'It scans prompts and completions for harmful categories such as hate, sexual, self-harm, and violence at configurable severity levels',
      'It encrypts requests at rest only',
      'It cannot be configured',
      'It is identical to a database trigger'
    ),
    correct: ['a'],
    explanation: 'Azure OpenAI applies a configurable content-filtering safety system to both inputs and outputs across hate, sexual, self-harm, and violence categories at multiple severity levels.',
    references: [REF_CONTENT_FILTER, REF_GENAI]
  },
  {
    domain: GENAI, difficulty: 2, type: QType.SINGLE,
    stem: 'A team wants to make a generative AI assistant more reliable in a regulated industry. Which set of mitigations is MOST aligned with Microsoft\'s guidance for responsible generative AI?',
    options: opts4(
      'Grounding via RAG, content filters, human review of high-stakes outputs, and clear transparency about limitations',
      'Removing all content filters and logging',
      'Letting the model self-publish without review',
      'Hiding the model\'s limitations from users'
    ),
    correct: ['a'],
    explanation: 'Microsoft\'s transparency notes call out grounding (RAG), content filtering, human oversight in high-stakes domains, and clear communication of limitations as core mitigations.',
    references: [REF_RAI_GENAI, REF_RAG]
  },
  {
    domain: GENAI, difficulty: 2, type: QType.SINGLE,
    stem: 'What is fine-tuning of an LLM?',
    options: opts4(
      'Continuing to train a base model on a curated dataset to adapt its style/behavior',
      'Re-creating the GPU',
      'Replacing the workspace',
      'Encrypting the workspace'
    ),
    correct: ['a'],
    explanation: 'Fine-tuning further trains a pre-trained model on additional, curated examples to specialize its tone, format, or domain behavior.',
    references: [REF_AOAI, REF_GENAI]
  },
  {
    domain: GENAI, difficulty: 2, type: QType.MULTI,
    stem: 'Select ALL items that are valid features or capabilities of Microsoft Foundry / Azure AI Foundry.',
    options: opts4(
      'Model catalog with many providers',
      'Playgrounds for interactive prompt testing',
      'Building and orchestrating AI agents with tools and memory',
      'Configuring on-premises Active Directory replication'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Foundry provides the model catalog, playgrounds, and agent building blocks. Active Directory replication is unrelated.',
    references: [REF_FOUNDRY, REF_CATALOG, REF_FOUNDRY_PORTAL]
  },
  {
    domain: GENAI, difficulty: 3, type: QType.SINGLE,
    stem: 'A user complains the model "made up a citation that doesn\'t exist." Which mitigation MOST directly addresses this risk?',
    options: opts4(
      'Grounding with RAG and instructing the model to cite only retrieved sources',
      'Doubling the GPU count',
      'Disabling logging',
      'Removing content filters'
    ),
    correct: ['a'],
    explanation: 'Hallucinated citations are best mitigated by grounding (RAG) and constraining the prompt to cite only sources actually retrieved — and by human review for high-stakes outputs.',
    references: [REF_RAI_GENAI, REF_RAG]
  },
  {
    domain: GENAI, difficulty: 3, type: QType.SINGLE,
    stem: 'Which BEST describes a "system message" in a chat completion prompt?',
    options: opts4(
      'A persistent role/instruction set at the start of a conversation that shapes the assistant\'s behavior',
      'A type of Azure region',
      'A storage blob',
      'A type of GPU'
    ),
    correct: ['a'],
    explanation: 'A system message (sometimes called a system prompt) is a top-level instruction set that defines the assistant\'s persona, scope, and constraints throughout the conversation.',
    references: [REF_PROMPT, REF_GENAI]
  },
  {
    domain: GENAI, difficulty: 3, type: QType.SINGLE,
    stem: 'Which Azure OpenAI / Foundry capability lets you ATTACH organization-specific data to a chat model so answers are grounded on that data without manual prompt engineering for every call?',
    options: opts4(
      'On-your-data / RAG features in Azure OpenAI / Foundry',
      'Azure Bastion',
      'Azure Resource Locks',
      'Azure DDoS Protection'
    ),
    correct: ['a'],
    explanation: '"On your data" / RAG features in Azure OpenAI and Foundry let you attach a search index or files so the model retrieves and grounds answers on your data automatically.',
    references: [REF_RAG, REF_FOUNDRY]
  },
  {
    domain: GENAI, difficulty: 3, type: QType.SINGLE,
    stem: 'A marketing team wants to generate brand-aligned IMAGES from text descriptions. Which Azure OpenAI model family is most appropriate?',
    options: opts4(
      'DALL-E image generation models',
      'Whisper',
      'GPT-3.5 text only',
      'text-embedding models only'
    ),
    correct: ['a'],
    explanation: 'DALL-E generates images from text prompts. Whisper is audio transcription; embeddings are vector models; GPT chat models output text.',
    references: [REF_AOAI_MODELS, REF_DALLE]
  },
  {
    domain: GENAI, difficulty: 3, type: QType.SINGLE,
    stem: 'A common Responsible-AI mitigation for generative AI is to keep humans in the loop for high-stakes decisions (such as medical, legal, or financial actions).',
    options: opts4('True', 'False', 'Only for low-stakes decisions', 'Only outside Azure'),
    correct: ['a'],
    explanation: 'True. Microsoft\'s guidance for Azure OpenAI and generative AI explicitly recommends meaningful human review for high-stakes scenarios and avoiding fully autonomous use for consequential decisions.',
    references: [REF_RAI_GENAI, REF_RAI]
  }
];

// ───────────────────── Practice Exam 3 ─────────────────────
const P3: Q[] = [
  // ─── AI Workloads & considerations (12) ───
  {
    domain: AIW, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'A radiologist wants software to highlight suspected tumors in MRI scans. Which AI workload best describes this?',
    options: opts4(
      'Computer vision',
      'Speech translation',
      'Anomaly detection on numeric logs',
      'Generative image creation from prompts only'
    ),
    correct: ['a'],
    explanation: 'Detecting and locating regions in medical imagery is a computer vision workload (image classification/object detection/segmentation), distinct from text or audio tasks.',
    references: [REF_STUDY, REF_VISION]
  },
  {
    domain: AIW, difficulty: 1, type: QType.SINGLE,
    stem: 'A bank wants a chatbot that understands customer questions and answers in natural language. Which combination of AI workloads is involved?',
    options: opts4(
      'NLP and (optionally) generative AI',
      'Only computer vision',
      'OCR only',
      'Robotics control'
    ),
    correct: ['a'],
    explanation: 'A natural-language chatbot uses NLP (intents, entities, knowledge base lookup) and may use generative AI (LLMs) for free-form responses.',
    references: [REF_CLU, REF_QA, REF_GENAI]
  },
  {
    domain: AIW, difficulty: 1, type: QType.SINGLE,
    stem: 'Which is an example of a GENERATIVE AI workload?',
    options: opts4(
      'Producing a draft email reply from a short user prompt',
      'Computing the SUM of a column in a spreadsheet',
      'Pinging a network endpoint',
      'Creating a TCP connection'
    ),
    correct: ['a'],
    explanation: 'Producing new natural-language content from a prompt is generative AI, typically using an LLM.',
    references: [REF_GENAI, REF_RAI]
  },
  {
    domain: AIW, difficulty: 1, type: QType.SINGLE,
    stem: 'A team builds a tool that reads a PDF report and extracts every table into a spreadsheet. Which workload is this?',
    options: opts4(
      'Document processing',
      'Speech synthesis',
      'Reinforcement learning',
      'Image generation'
    ),
    correct: ['a'],
    explanation: 'Extracting structured information (tables, fields) from documents is document processing, supported by Azure AI Document Intelligence.',
    references: [REF_DOC_INTEL, REF_RAI]
  },
  {
    domain: AIW, difficulty: 2, type: QType.SINGLE,
    stem: 'A team publishes per-model fact sheets describing what each model is designed to do, its known limitations, and how to interpret outputs. Which Responsible AI principle is being directly supported?',
    options: opts4(
      'Transparency',
      'Privacy and security',
      'Inclusiveness only',
      'Reliability only'
    ),
    correct: ['a'],
    explanation: 'Publishing transparency notes / model fact sheets directly supports the Transparency principle, helping users and stakeholders understand intended uses and limitations.',
    references: [REF_RAI, REF_RAI_GENAI]
  },
  {
    domain: AIW, difficulty: 2, type: QType.SINGLE,
    stem: 'A health app deploys an AI feature globally and ensures interface text, voice models, and content moderation are validated across many languages and regional contexts. Which Responsible AI principle is MOST advanced by this work?',
    options: opts4(
      'Inclusiveness',
      'Cost optimization',
      'Reliability only',
      'Maximum throughput'
    ),
    correct: ['a'],
    explanation: 'Inclusiveness ensures AI works well for people across abilities, cultures, languages, and contexts — globally validated UX and content moderation reflect this principle.',
    references: [REF_RAI, REF_STUDY]
  },
  {
    domain: AIW, difficulty: 2, type: QType.SINGLE,
    stem: 'A team running a generative AI app turns on detailed prompt and response logging for audit and quality review. Which principle does this most directly support?',
    options: opts4(
      'Accountability',
      'Inclusiveness',
      'Generative novelty',
      'Maximum free usage'
    ),
    correct: ['a'],
    explanation: 'Logging supports accountability and oversight — being able to review what the system did and why is a key element of operating AI responsibly.',
    references: [REF_RAI, REF_STUDY]
  },
  {
    domain: AIW, difficulty: 2, type: QType.SINGLE,
    stem: 'Which is the BEST example of supporting PRIVACY AND SECURITY for an AI system that handles personal data?',
    options: opts4(
      'Encrypting data in transit and at rest, applying least-privilege access, and providing user controls over their data',
      'Storing data in unprotected public storage',
      'Disabling all encryption to improve speed',
      'Sharing raw PII publicly'
    ),
    correct: ['a'],
    explanation: 'Encryption, least-privilege access, and user controls (notice/consent) are foundational privacy and security practices for AI systems handling personal data.',
    references: [REF_RAI, REF_STUDY]
  },
  {
    domain: AIW, difficulty: 2, type: QType.MULTI,
    stem: 'Select ALL items that are TYPICAL responsible-AI considerations for a GENERATIVE AI workload.',
    options: opts4(
      'Hallucinations / fabricated content',
      'Potential to produce harmful or biased content',
      'Need to disclose limitations and intended use to users',
      'No need to consider data residency'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Hallucinations, harmful/biased outputs, and clear disclosure are explicitly called out. Data residency is still a concern; ignoring it is not responsible.',
    references: [REF_RAI_GENAI, REF_RAI]
  },
  {
    domain: AIW, difficulty: 3, type: QType.SINGLE,
    stem: 'A bank\'s loan model is more accurate on one ethnic group than another. Which Azure tooling can help the team quantify and reduce this disparity?',
    options: opts4(
      'The fairness assessment component of the Responsible AI dashboard in Azure Machine Learning',
      'Azure Bastion only',
      'Azure DDoS protection only',
      'Azure DevTest Labs only'
    ),
    correct: ['a'],
    explanation: 'The fairness assessment component of the Responsible AI dashboard helps measure model performance across sensitive groups and identify disparities to address.',
    references: [REF_FAIRNESS, REF_RAI_DASH]
  },
  {
    domain: AIW, difficulty: 3, type: QType.SINGLE,
    stem: 'Which BEST describes "model interpretability" in the context of Responsible AI?',
    options: opts4(
      'Generating human-understandable explanations of why a model produced a particular prediction',
      'Encrypting the model file',
      'Compressing the model for deployment',
      'Translating the model into another language'
    ),
    correct: ['a'],
    explanation: 'Interpretability provides explanations (global, local, cohort) of model behavior so stakeholders can understand and trust predictions — central to the Transparency principle.',
    references: [REF_INTERP, REF_RAI_DASH]
  },
  {
    domain: AIW, difficulty: 3, type: QType.SINGLE,
    stem: 'According to Microsoft\'s Responsible AI Standard, the six principles are fairness, reliability and safety, privacy and security, inclusiveness, transparency, and accountability.',
    options: opts4('True', 'False', 'Only four principles', 'Eight principles'),
    correct: ['a'],
    explanation: 'True. Microsoft\'s Responsible AI Standard is built on those six principles, and Azure Machine Learning provides tools to operationalize each.',
    references: [REF_RAI, REF_STUDY]
  },

  // ─── ML on Azure (12) ───
  {
    domain: ML, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'A model predicts whether a credit-card transaction is "fraud" or "not fraud." Which type of machine learning is this?',
    options: opts4(
      'Binary classification',
      'Regression',
      'Clustering',
      'Reinforcement learning'
    ),
    correct: ['a'],
    explanation: 'Predicting one of two classes (fraud / not fraud) is binary classification — a supervised learning task.',
    references: [REF_ML_FUND, REF_AML]
  },
  {
    domain: ML, difficulty: 1, type: QType.SINGLE,
    stem: 'A model predicts daily energy demand (a continuous numeric value) for the next 30 days. Which technique is this?',
    options: opts4(
      'Regression / time-series forecasting',
      'Multiclass classification',
      'Clustering',
      'Object detection'
    ),
    correct: ['a'],
    explanation: 'Predicting numeric values over future time periods is regression / time-series forecasting — supported as a task type in Azure AutoML.',
    references: [REF_AUTOML, REF_ML_FUND]
  },
  {
    domain: ML, difficulty: 1, type: QType.SINGLE,
    stem: 'In supervised learning, what is the LABEL?',
    options: opts4(
      'The compute cluster identifier',
      'The value you want the model to predict',
      'The Azure region',
      'The model file name'
    ),
    correct: ['b'],
    explanation: 'The label (or target) is the value to be predicted; features are the inputs.',
    references: [REF_ML_FUND, REF_AML]
  },
  {
    domain: ML, difficulty: 1, type: QType.SINGLE,
    stem: 'Which Azure capability lets a data scientist train a model with PYTHON code in managed Jupyter notebooks, with access to compute clusters?',
    options: opts4(
      'Azure Machine Learning studio (Notebooks experience)',
      'Azure Cost Management',
      'Azure DNS',
      'Azure Firewall'
    ),
    correct: ['a'],
    explanation: 'Azure Machine Learning studio includes integrated Jupyter Notebooks backed by managed compute, plus designer, AutoML, and other tools.',
    references: [REF_AML, REF_ML_FUND]
  },
  {
    domain: ML, difficulty: 2, type: QType.SINGLE,
    stem: 'Which is the BEST description of AUTOMATED ML (AutoML)?',
    options: opts4(
      'A capability that automatically iterates over algorithms and hyperparameters and selects the best-performing model for a chosen metric',
      'A storage encryption feature',
      'A type of compute SKU',
      'A NoSQL database'
    ),
    correct: ['a'],
    explanation: 'AutoML automates algorithm selection and hyperparameter tuning, returning the best model for the target metric — accessible from code or no-code studio.',
    references: [REF_AUTOML, REF_ML_FUND]
  },
  {
    domain: ML, difficulty: 2, type: QType.SINGLE,
    stem: 'Which is an example of UNSUPERVISED learning?',
    options: opts4(
      'Grouping customers into segments based on similarity without any labels',
      'Predicting next month\'s sales from labeled historical data',
      'Classifying emails as spam vs. not spam',
      'Predicting house prices from labeled examples'
    ),
    correct: ['a'],
    explanation: 'Clustering (e.g., k-means) is unsupervised — it discovers structure without labels. The other examples are supervised learning.',
    references: [REF_ML_FUND, REF_AML]
  },
  {
    domain: ML, difficulty: 2, type: QType.SINGLE,
    stem: 'A team has labeled images of factory parts as "OK" or "DEFECT" and wants to train a CUSTOM image classifier with low code. Which Azure service is most appropriate?',
    options: opts4(
      'Azure AI Custom Vision',
      'Azure AI Language',
      'Azure AI Translator',
      'Azure AI Speech'
    ),
    correct: ['a'],
    explanation: 'Azure AI Custom Vision lets you train a custom classification or object detection model from your own labeled images via a low-code portal.',
    references: [REF_CUSTOM_VISION, REF_AUTOML]
  },
  {
    domain: ML, difficulty: 2, type: QType.SINGLE,
    stem: 'Which is TRUE about the DEPLOYMENT lifecycle in Azure Machine Learning?',
    options: opts4(
      'Models can be deployed to managed online endpoints (real-time) or batch endpoints (asynchronous), abstracting infrastructure',
      'Models can only be deployed to a local laptop',
      'Models can only be deployed on-premises',
      'Models cannot be deployed at all'
    ),
    correct: ['a'],
    explanation: 'Azure Machine Learning provides managed online (real-time) and batch (asynchronous) endpoints, removing most of the infrastructure burden of deploying models.',
    references: [REF_DEPLOY, REF_MLOPS]
  },
  {
    domain: ML, difficulty: 2, type: QType.MULTI,
    stem: 'Select ALL items that are recognized types of machine learning techniques.',
    options: opts4(
      'Regression',
      'Classification',
      'Clustering',
      'Network packet sniffing'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Regression, classification, and clustering are standard ML techniques. Network packet sniffing is a security/diagnostic activity, not a machine-learning technique.',
    references: [REF_ML_FUND, REF_AML]
  },
  {
    domain: ML, difficulty: 3, type: QType.SINGLE,
    stem: 'Which BEST describes the relationship between an "experiment" and a "job" (or "run") in Azure Machine Learning?',
    options: opts4(
      'An experiment groups one or more jobs (runs) of the same training process, allowing comparison across runs',
      'They are the same thing',
      'A job stores model files; an experiment encrypts data',
      'Experiments and jobs are unrelated'
    ),
    correct: ['a'],
    explanation: 'An experiment in Azure Machine Learning is a logical container that groups jobs (runs) so you can compare metrics, parameters, and artifacts.',
    references: [REF_AML, REF_ML_FUND]
  },
  {
    domain: ML, difficulty: 3, type: QType.SINGLE,
    stem: 'Which BEST describes the Transformer architecture\'s role in modern AI?',
    options: opts4(
      'It is the foundation of most modern LLMs and many state-of-the-art NLP and multimodal models, relying on attention mechanisms',
      'It is a relational database protocol',
      'It is unrelated to language tasks',
      'It is a type of disk RAID configuration'
    ),
    correct: ['a'],
    explanation: 'The Transformer architecture (with self-attention) underpins most modern LLMs and many leading vision/multimodal models — the AI-900 study guide explicitly calls it out.',
    references: [REF_STUDY, REF_GENAI]
  },
  {
    domain: ML, difficulty: 2, type: QType.SINGLE,
    stem: 'A team wants to understand WHY their classification model made a particular prediction for a given customer. Which Azure Machine Learning capability is most directly useful?',
    options: opts4(
      'Model interpretability / explanations (e.g., in the Responsible AI dashboard)',
      'Azure Bastion',
      'Azure DDoS Protection',
      'Azure Key Vault key rotation'
    ),
    correct: ['a'],
    explanation: 'Model interpretability in Azure Machine Learning produces global and local explanations of model behavior, helping users understand why a model made a specific prediction.',
    references: [REF_INTERP, REF_RAI_DASH]
  },

  // ─── Computer vision (12) ───
  {
    domain: CV, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which is the BEST example of OBJECT DETECTION?',
    options: opts4(
      'Drawing boxes around every dog and cat in a photo and labeling each one',
      'Labeling an image as "indoor" or "outdoor"',
      'Generating a synthetic image from a text prompt',
      'Translating a caption into Spanish'
    ),
    correct: ['a'],
    explanation: 'Object detection finds multiple objects in an image, drawing labeled bounding boxes for each. Image classification only labels the whole image.',
    references: [REF_IMAGE_ANALYSIS, REF_VISION]
  },
  {
    domain: CV, difficulty: 1, type: QType.SINGLE,
    stem: 'Which scenario is BEST served by Azure AI Vision\'s Read API (OCR)?',
    options: opts4(
      'Extracting text from a photo of a printed restaurant menu',
      'Generating a song from a prompt',
      'Predicting next month\'s sales numbers',
      'Translating spoken audio in real time'
    ),
    correct: ['a'],
    explanation: 'OCR / Read API extracts printed and handwritten text from images — for example, photographs of menus, receipts, or signage.',
    references: [REF_OCR, REF_VISION]
  },
  {
    domain: CV, difficulty: 1, type: QType.SINGLE,
    stem: 'Which Azure service provides PREBUILT models for receipts and invoices that return structured fields like total, vendor, date, and line items?',
    options: opts4(
      'Azure AI Document Intelligence',
      'Azure AI Vision Custom Vision only',
      'Azure AI Translator',
      'Azure AI Speech'
    ),
    correct: ['a'],
    explanation: 'Azure AI Document Intelligence ships prebuilt receipt and invoice models that return structured key-value pairs and tables.',
    references: [REF_DOC_INTEL, REF_VISION]
  },
  {
    domain: CV, difficulty: 1, type: QType.SINGLE,
    stem: 'Which task is performed by FACIAL ANALYSIS (Azure AI Face)?',
    options: opts4(
      'Detecting attributes like head pose, glasses, or facial landmarks from an image of a face',
      'Translating a face into another language',
      'Generating new faces from a text prompt',
      'Summarizing a face into key phrases'
    ),
    correct: ['a'],
    explanation: 'Azure AI Face detects faces and can return attributes such as head pose, landmarks, and other characteristics — emotion and gender were retired and several other attributes are limited as part of Responsible AI.',
    references: [REF_FACE, REF_VISION]
  },
  {
    domain: CV, difficulty: 2, type: QType.SINGLE,
    stem: 'A retailer wants to train a model that detects ONLY their two specific product types using a few hundred labeled photos. Which Azure service is the BEST fit?',
    options: opts4(
      'Azure AI Custom Vision (object detection project)',
      'Azure AI Language CLU',
      'Azure AI Speech',
      'Azure AI Translator'
    ),
    correct: ['a'],
    explanation: 'Custom Vision provides custom image classification AND custom object detection projects that learn from a small set of labeled images.',
    references: [REF_CUSTOM_VISION, REF_VISION]
  },
  {
    domain: CV, difficulty: 2, type: QType.SINGLE,
    stem: 'A retailer asks: "Which scenario does Azure AI Vision\'s image analysis NOT do natively?"',
    options: opts4(
      'Return tags, captions, and detected objects for an image',
      'Read printed and handwritten text via the OCR (Read) API',
      'Train a custom RELATIONAL DATABASE schema',
      'Detect adult content and brand logos'
    ),
    correct: ['c'],
    explanation: 'Azure AI Vision returns image tags, captions, objects, OCR text, adult content, brand detection, and more — but it does not train relational database schemas.',
    references: [REF_VISION, REF_IMAGE_ANALYSIS]
  },
  {
    domain: CV, difficulty: 2, type: QType.SINGLE,
    stem: 'Which is the BEST description of FACE VERIFICATION?',
    options: opts4(
      'A one-to-one match that confirms whether two face images belong to the same person',
      'A one-to-many search across a large registry of identities',
      'A way to detect adult content in images',
      'A way to translate text inside images'
    ),
    correct: ['a'],
    explanation: 'Verification answers a yes/no question: "are these two faces the same person?" Identification matches against many candidates in a registered group.',
    references: [REF_FACE, REF_VISION]
  },
  {
    domain: CV, difficulty: 2, type: QType.SINGLE,
    stem: 'A bank wants to verify a remote customer\'s identity by comparing a selfie to a photo on their ID. To defend against someone holding up a printed photo, what should be added?',
    options: opts4(
      'Liveness detection',
      'OCR on the selfie',
      'Generative AI image enhancement',
      'Speech translation'
    ),
    correct: ['a'],
    explanation: 'Liveness detection confirms the camera sees a real, physically present person — defending against printed photos, recorded videos, or masks.',
    references: [REF_FACE, REF_VISION]
  },
  {
    domain: CV, difficulty: 2, type: QType.MULTI,
    stem: 'Select ALL Azure AI services that COULD reasonably play a role in an end-to-end "scan, extract, summarize, translate" document pipeline.',
    options: opts4(
      'Azure AI Document Intelligence',
      'Azure AI Language (summarization)',
      'Azure AI Translator',
      'Azure DDoS Protection'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Document Intelligence extracts content; Azure AI Language summarizes; Azure AI Translator translates. Azure DDoS Protection is a network-security service, unrelated to document AI.',
    references: [REF_DOC_INTEL, REF_SUMM, REF_TRANSLATOR]
  },
  {
    domain: CV, difficulty: 3, type: QType.SINGLE,
    stem: 'Which BEST describes the responsible-AI posture currently applied to the Azure AI Face service?',
    options: opts4(
      'Recognition / liveness features are gated and require approval, and certain attributes such as emotion and gender are retired',
      'It is fully open to anyone with no controls',
      'It cannot be used for any scenario',
      'Only public-sector customers can ever use it'
    ),
    correct: ['a'],
    explanation: 'Microsoft applies access controls (intake form) to Face recognition and liveness, retired emotion/gender attributes, and limited several others as part of Responsible AI.',
    references: [REF_FACE, REF_RAI]
  },
  {
    domain: CV, difficulty: 3, type: QType.SINGLE,
    stem: 'A team wants to extract content from documents in BULK (thousands per day), keep them in their tenant\'s region, and combine OCR with structured field extraction. Which service combination is most appropriate?',
    options: opts4(
      'Azure AI Document Intelligence in a regional resource, optionally augmented with custom-trained extraction models',
      'Azure Bastion alone',
      'Azure Cost Management alone',
      'AutoML regression alone'
    ),
    correct: ['a'],
    explanation: 'Document Intelligence combines OCR with structured key-value extraction and supports custom models. Azure resources are deployed regionally, supporting data residency.',
    references: [REF_DOC_INTEL, REF_OCR]
  },
  {
    domain: CV, difficulty: 3, type: QType.SINGLE,
    stem: 'Optical character recognition (OCR) is one of the recognized computer-vision solution types in the AI-900 skills outline.',
    options: opts4('True', 'False', 'OCR is part of NLP only', 'OCR is part of generative AI only'),
    correct: ['a'],
    explanation: 'True. The AI-900 skills outline lists image classification, object detection, OCR, and facial detection/analysis as common computer-vision solution types.',
    references: [REF_STUDY, REF_OCR]
  },

  // ─── NLP (12) ───
  {
    domain: NLP, difficulty: 1, type: QType.SINGLE,
    stem: 'Which Azure AI service is BEST for converting written text into natural-sounding speech using neural voices?',
    options: opts4(
      'Azure AI Speech — text to speech',
      'Azure AI Translator',
      'Azure AI Vision',
      'Azure AI Document Intelligence'
    ),
    correct: ['a'],
    explanation: 'Azure AI Speech\'s text-to-speech (TTS) converts text into humanlike speech using neural voices, with SSML for prosody control.',
    references: [REF_TTS, REF_SPEECH]
  },
  {
    domain: NLP, difficulty: 1, type: QType.SINGLE,
    stem: 'Which Azure AI service translates TEXT (and documents) between many languages?',
    options: opts4(
      'Azure AI Translator',
      'Azure AI Vision',
      'Azure Machine Learning',
      'Azure Key Vault'
    ),
    correct: ['a'],
    explanation: 'Azure AI Translator is the neural machine translation service for text translation, document translation, and Custom Translator.',
    references: [REF_TRANSLATOR, REF_LANG]
  },
  {
    domain: NLP, difficulty: 1, type: QType.SINGLE,
    stem: 'Which Azure AI Language feature returns "Positive", "Neutral", or "Negative" labels (with confidence scores) for a piece of text?',
    options: opts4(
      'Sentiment analysis',
      'OCR',
      'Object detection',
      'Anomaly detection'
    ),
    correct: ['a'],
    explanation: 'Sentiment analysis classifies text overall (and per sentence) as positive, neutral, or negative, with confidence scores — and can do opinion mining by aspect.',
    references: [REF_SENT, REF_LANG]
  },
  {
    domain: NLP, difficulty: 1, type: QType.SINGLE,
    stem: 'A multilingual support team needs the system to figure out which LANGUAGE a customer wrote in. Which Azure AI Language capability fits?',
    options: opts4(
      'Language detection',
      'Sentiment analysis',
      'Custom Vision',
      'OCR'
    ),
    correct: ['a'],
    explanation: 'Language detection identifies the language (and confidence) of input text so the application can route or translate it appropriately.',
    references: [REF_LANG_DETECT, REF_LANG]
  },
  {
    domain: NLP, difficulty: 2, type: QType.SINGLE,
    stem: 'A help-desk team wants to MAP user utterances to one of a few intents ("ResetPassword", "OpenTicket", "TalkToHuman") and extract relevant entities. Which capability fits BEST?',
    options: opts4(
      'Conversational language understanding (CLU)',
      'Sentiment analysis only',
      'OCR only',
      'Anomaly detection'
    ),
    correct: ['a'],
    explanation: 'CLU lets you train custom intent / entity models for natural-language inputs in chat and voice apps. Sentiment analysis would not classify the intent.',
    references: [REF_CLU, REF_LANG]
  },
  {
    domain: NLP, difficulty: 2, type: QType.SINGLE,
    stem: 'Which is TRUE about Azure AI Language\'s QUESTION ANSWERING feature?',
    options: opts4(
      'It builds a knowledge base from FAQs / docs and answers natural-language questions',
      'It generates new images from text',
      'It only works on PDF files in English',
      'It is a relational database engine'
    ),
    correct: ['a'],
    explanation: 'Question answering ingests FAQs, URLs, and documents to build a knowledge base, then returns the most relevant answer to user questions in natural language.',
    references: [REF_QA, REF_LANG]
  },
  {
    domain: NLP, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Azure AI Speech capability would BEST help a transcription app that processes pre-recorded MP3 files in batches?',
    options: opts4(
      'Batch transcription in speech to text',
      'OCR',
      'Custom Vision',
      'Anomaly detection'
    ),
    correct: ['a'],
    explanation: 'Batch transcription in Azure AI Speech is built for processing large volumes of pre-recorded audio files asynchronously.',
    references: [REF_STT, REF_SPEECH]
  },
  {
    domain: NLP, difficulty: 2, type: QType.SINGLE,
    stem: 'Which scenario does ENTITY LINKING (Azure AI Language) add ON TOP of plain NER?',
    options: opts4(
      'It disambiguates an entity (e.g., "Mercury" the planet vs. the element) and links it to a knowledge source such as Wikipedia',
      'It encrypts text',
      'It removes all entities',
      'It translates entities into another language'
    ),
    correct: ['a'],
    explanation: 'Entity linking disambiguates an entity\'s meaning and returns a link to an authoritative knowledge source (such as Wikipedia), enabling richer understanding than basic NER.',
    references: [REF_LANG, REF_NER]
  },
  {
    domain: NLP, difficulty: 2, type: QType.SINGLE,
    stem: 'A media company wants AUTOMATIC chapters and summaries of 60-minute meeting recordings. Which combination is most appropriate?',
    options: opts4(
      'Azure AI Speech (speech to text) to transcribe + Azure AI Language summarization (conversation summarization)',
      'Azure AI Vision Custom Vision only',
      'Azure AI Translator only',
      'Azure Bastion only'
    ),
    correct: ['a'],
    explanation: 'Speech to text transcribes the audio; conversation summarization in Azure AI Language produces chapters and recap summaries for long meetings.',
    references: [REF_STT, REF_SUMM]
  },
  {
    domain: NLP, difficulty: 2, type: QType.MULTI,
    stem: 'Select ALL items that are Azure AI Speech CAPABILITIES.',
    options: opts4(
      'Speech to text (transcription)',
      'Text to speech with neural voices',
      'Speech translation',
      'Building a relational database schema'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'STT, TTS, and speech translation are all Azure AI Speech capabilities. Database schema design is not.',
    references: [REF_SPEECH, REF_STT, REF_TTS, REF_SPEECH_TRANS]
  },
  {
    domain: NLP, difficulty: 3, type: QType.SINGLE,
    stem: 'A team builds a worldwide voice assistant that needs to LISTEN, UNDERSTAND INTENT, and respond in the SAME language as the user. Which Azure combination best fits?',
    options: opts4(
      'Azure AI Speech (STT and TTS) with language identification + Azure AI Language CLU for intent/entities',
      'Azure AI Document Intelligence only',
      'Azure DevTest Labs only',
      'Azure AI Vision Custom Vision only'
    ),
    correct: ['a'],
    explanation: 'Azure AI Speech handles audio in and out (with language ID) and Azure AI Language CLU classifies the user\'s intent and extracts entities for the assistant logic.',
    references: [REF_SPEECH, REF_STT, REF_TTS, REF_CLU]
  },
  {
    domain: NLP, difficulty: 3, type: QType.SINGLE,
    stem: 'Azure AI Translator can translate documents (e.g., DOCX, PDF) and preserve their formatting, in addition to translating plain text.',
    options: opts4('True', 'False', 'It can only translate emojis', 'It only translates images'),
    correct: ['a'],
    explanation: 'True. Document Translation in Azure AI Translator translates entire documents asynchronously while preserving structure and formatting; text translation handles real-time text.',
    references: [REF_TRANSLATOR, REF_LANG]
  },

  // ─── Generative AI (17) ───
  {
    domain: GENAI, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Azure service provides the unified PaaS for managing agents, models, and tools, including built-in tracing, monitoring, and evaluations?',
    options: opts4(
      'Microsoft Foundry (Azure AI Foundry)',
      'Azure Bastion',
      'Azure DevTest Labs',
      'Azure DNS'
    ),
    correct: ['a'],
    explanation: 'Microsoft Foundry consolidates AI building blocks (models, agents, tools), observability, and governance under one Azure resource provider.',
    references: [REF_FOUNDRY, REF_GENAI]
  },
  {
    domain: GENAI, difficulty: 1, type: QType.SINGLE,
    stem: 'Which is a typical use of an LLM?',
    options: opts4(
      'Drafting an email, summarizing a document, or answering a question in natural language',
      'Provisioning a virtual machine',
      'Configuring a virtual network',
      'Compressing a disk'
    ),
    correct: ['a'],
    explanation: 'LLMs excel at natural-language tasks: drafting, summarizing, answering questions, classifying, and coding. Infrastructure provisioning is not a generative-AI workload.',
    references: [REF_GENAI, REF_AOAI]
  },
  {
    domain: GENAI, difficulty: 1, type: QType.SINGLE,
    stem: 'Which BEST describes Azure OpenAI Service?',
    options: opts4(
      'An Azure-hosted service that provides access to OpenAI models (GPT, embeddings, image, audio) with Azure security, networking, and compliance',
      'A relational database',
      'A facial recognition service',
      'A backup service'
    ),
    correct: ['a'],
    explanation: 'Azure OpenAI provides Microsoft-managed access to OpenAI models — GPT chat, embeddings, image, and audio — with Azure security, networking, regional deployments, and integrated content filters.',
    references: [REF_AOAI, REF_AOAI_MODELS]
  },
  {
    domain: GENAI, difficulty: 1, type: QType.SINGLE,
    stem: 'Which is an example of a multimodal AI scenario?',
    options: opts4(
      'A model that takes BOTH images and text as input and produces a text answer',
      'A relational database table',
      'A static HTML page',
      'A spreadsheet sum'
    ),
    correct: ['a'],
    explanation: 'Multimodal models process more than one modality (e.g., image + text). Modern LLMs in the Foundry catalog increasingly support this.',
    references: [REF_FOUNDRY, REF_AOAI_MODELS]
  },
  {
    domain: GENAI, difficulty: 1, type: QType.SINGLE,
    stem: 'Which Azure offering is BEST for a low-code maker to build a CUSTOM COPILOT that answers from internal knowledge?',
    options: opts4(
      'Microsoft Copilot Studio',
      'Azure Bastion',
      'Azure Backup',
      'Azure Service Bus'
    ),
    correct: ['a'],
    explanation: 'Microsoft Copilot Studio is the low-code product for building custom copilots/agents grounded on business data, with knowledge sources, topics, actions, and channels.',
    references: [REF_COPILOT_STUDIO, REF_GENAI]
  },
  {
    domain: GENAI, difficulty: 2, type: QType.SINGLE,
    stem: 'Which BEST contrasts FINE-TUNING with PROMPT ENGINEERING?',
    options: opts4(
      'Fine-tuning further TRAINS the model on new data, while prompt engineering crafts inputs to steer the existing model without retraining',
      'They are the same technique',
      'Both require GPU clusters and many days; neither can be done quickly',
      'Prompt engineering rebuilds the model weights'
    ),
    correct: ['a'],
    explanation: 'Fine-tuning updates model weights using a curated dataset; prompt engineering changes the INPUT to steer the existing model — much cheaper and faster, but less customizable.',
    references: [REF_PROMPT, REF_AOAI]
  },
  {
    domain: GENAI, difficulty: 2, type: QType.SINGLE,
    stem: 'Which BEST describes "embeddings" in generative AI?',
    options: opts4(
      'Numeric vector representations of text (or other content) that capture semantic meaning',
      'A type of compute SKU',
      'A backup format',
      'A Kubernetes node pool'
    ),
    correct: ['a'],
    explanation: 'Embedding models convert text (or images) into vectors so semantically similar items are close in vector space — used for search, clustering, and RAG.',
    references: [REF_AOAI_MODELS, REF_RAG]
  },
  {
    domain: GENAI, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Azure capability lets you BROWSE foundation models from many providers (Microsoft, OpenAI, Meta Llama, Mistral, DeepSeek, etc.) in one place?',
    options: opts4(
      'The Foundry / Azure AI Foundry model catalog',
      'Azure Cost Management',
      'Azure DDoS Protection',
      'Azure Activity Log'
    ),
    correct: ['a'],
    explanation: 'The Foundry model catalog is the unified place to discover and deploy foundation models from a wide range of providers.',
    references: [REF_CATALOG, REF_GENAI]
  },
  {
    domain: GENAI, difficulty: 2, type: QType.SINGLE,
    stem: 'Which is TRUE about Azure OpenAI CONTENT FILTERS?',
    options: opts4(
      'They are integrated safety filters that scan prompts and completions for hate, sexual, self-harm, and violent content at configurable severity thresholds',
      'They are optional billing controls only',
      'They translate prompts between languages',
      'They generate images'
    ),
    correct: ['a'],
    explanation: 'Azure OpenAI applies a safety system that classifies content into severity levels across hate, sexual, self-harm, and violence categories for both inputs and outputs.',
    references: [REF_CONTENT_FILTER, REF_GENAI]
  },
  {
    domain: GENAI, difficulty: 2, type: QType.SINGLE,
    stem: 'Which is a RESPONSIBLE-AI consideration for generative AI that Microsoft explicitly calls out?',
    options: opts4(
      'Models can hallucinate plausible-sounding but inaccurate content; mitigations include grounding, citations, and human review',
      'Generative models are guaranteed to be 100% accurate',
      'Generative AI cannot reflect societal bias',
      'Logging should always be disabled for generative AI'
    ),
    correct: ['a'],
    explanation: 'Microsoft\'s transparency notes for Azure OpenAI explicitly call out hallucinations and recommend grounding (RAG), citations, and human review as mitigations.',
    references: [REF_RAI_GENAI, REF_GENAI]
  },
  {
    domain: GENAI, difficulty: 2, type: QType.MULTI,
    stem: 'Select ALL of the following that are CHARACTERISTICS of large language models.',
    options: opts4(
      'They are typically Transformer-based deep neural networks',
      'They process inputs and outputs as tokens',
      'They can hallucinate plausible-sounding but incorrect content',
      'They never need any safety filtering'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'LLMs are Transformer-based deep neural networks that operate on tokens, and they can hallucinate. They DO benefit from safety filtering and human oversight.',
    references: [REF_GENAI, REF_AOAI, REF_CONTENT_FILTER]
  },
  {
    domain: GENAI, difficulty: 2, type: QType.SINGLE,
    stem: 'Which is the BEST way to keep a chat assistant\'s answers grounded on RECENT internal docs WITHOUT retraining the base model?',
    options: opts4(
      'Use Retrieval Augmented Generation (RAG) with an updated vector / hybrid index',
      'Fine-tune the base model with every new doc, every minute',
      'Replace the assistant with a static FAQ',
      'Disable safety filters'
    ),
    correct: ['a'],
    explanation: 'RAG keeps the base model frozen and pulls in fresh, relevant docs at query time — the standard pattern for grounding chat assistants on rapidly changing internal knowledge.',
    references: [REF_RAG, REF_GENAI]
  },
  {
    domain: GENAI, difficulty: 3, type: QType.SINGLE,
    stem: 'Which BEST describes the role of EMBEDDING models in a RAG architecture?',
    options: opts4(
      'They produce vector representations of documents and queries so a vector search can return the most semantically similar chunks to inject into the prompt',
      'They generate images from prompts',
      'They translate spoken audio to text',
      'They encrypt data at rest'
    ),
    correct: ['a'],
    explanation: 'Embeddings turn documents and queries into vectors so a similarity search can retrieve the most relevant chunks, which are then included in the prompt — the core retrieval step in RAG.',
    references: [REF_RAG, REF_AOAI_MODELS]
  },
  {
    domain: GENAI, difficulty: 3, type: QType.SINGLE,
    stem: 'Which BEST describes "few-shot" prompting?',
    options: opts4(
      'Including a few input/output examples in the prompt to demonstrate the desired pattern, without retraining the model',
      'Training the model for a few hours',
      'Reducing the model size',
      'Deploying the model only a few times'
    ),
    correct: ['a'],
    explanation: 'Few-shot prompting supplies a handful of demonstrations in the prompt itself, helping the model infer the desired format/behavior — a prompt-engineering technique distinct from fine-tuning.',
    references: [REF_PROMPT, REF_GENAI]
  },
  {
    domain: GENAI, difficulty: 3, type: QType.SINGLE,
    stem: 'A team is concerned that their internal generative AI assistant will produce harmful or biased output. Which combination of mitigations BEST aligns with Microsoft Responsible-AI guidance?',
    options: opts4(
      'Enable Azure OpenAI content filters, ground answers via RAG, add a clear system message about scope and limitations, and require human review for high-impact actions',
      'Remove content filters and disable logging',
      'Hide the model behind public anonymous endpoints with no auth',
      'Tell users the model is always correct'
    ),
    correct: ['a'],
    explanation: 'Microsoft\'s guidance combines content filters, grounding, scoped system messages, transparency about limitations, and human review for high-impact decisions.',
    references: [REF_RAI_GENAI, REF_CONTENT_FILTER, REF_RAG]
  },
  {
    domain: GENAI, difficulty: 3, type: QType.SINGLE,
    stem: 'Which is TRUE about AGENTS in Microsoft Foundry?',
    options: opts4(
      'They can use tools, memory, and knowledge sources to perform multi-step tasks, with options for tracing and evaluation',
      'They are simple static FAQ bots only',
      'They cannot integrate with Microsoft 365',
      'They never use models'
    ),
    correct: ['a'],
    explanation: 'Foundry agents can call tools, retain memory, ground on knowledge sources (Foundry IQ), be published to Microsoft 365 and Teams, and are observable via tracing and evaluations.',
    references: [REF_FOUNDRY, REF_GENAI]
  },
  {
    domain: GENAI, difficulty: 3, type: QType.SINGLE,
    stem: 'A model catalog\'s value is that you can compare and deploy many foundation models (open and proprietary) through one interface without integrating each provider separately.',
    options: opts4('True', 'False', 'Only Microsoft models are available', 'Only image models are available'),
    correct: ['a'],
    explanation: 'True. The Foundry model catalog lets you discover, evaluate, and deploy models from Microsoft, OpenAI, Meta Llama, Mistral, DeepSeek, Hugging Face, and others through one interface.',
    references: [REF_CATALOG, REF_FOUNDRY]
  }
];

const AI900_DOMAINS = [
  { name: AIW, weight: 18 },
  { name: ML, weight: 18 },
  { name: CV, weight: 18 },
  { name: NLP, weight: 18 },
  { name: GENAI, weight: 28 }
];

const AI900_EXAMS: { slug: string; code: string; titleSuffix: string; descriptionSuffix: string; questions: Q[] }[] = [
  {
    slug: 'microsoft-ai-900-p1',
    code: 'AI-900-P1',
    titleSuffix: 'Practice Exam 1',
    descriptionSuffix: 'Practice exam 1 of 3 — a full 60-minute, 65-question, blueprint-weighted set covering AI workloads & considerations, machine learning on Azure, computer vision, natural language processing, and generative AI on Azure.',
    questions: P1
  },
  {
    slug: 'microsoft-ai-900-p2',
    code: 'AI-900-P2',
    titleSuffix: 'Practice Exam 2',
    descriptionSuffix: 'Practice exam 2 of 3 — a second 60-minute, 65-question, blueprint-weighted set.',
    questions: P2
  },
  {
    slug: 'microsoft-ai-900-p3',
    code: 'AI-900-P3',
    titleSuffix: 'Practice Exam 3',
    descriptionSuffix: 'Practice exam 3 of 3 — a third 60-minute, 65-question, blueprint-weighted set.',
    questions: P3
  }
];

const AI900_BUNDLE = {
  slug: 'microsoft-ai-900',
  title: 'Microsoft Azure AI Fundamentals (AI-900)',
  description: 'Unlimited AI-900 practice exam retakes, each drawn fresh from a question pool weighted by the official exam domains — covering AI workloads & considerations, machine learning on Azure, computer vision, natural language processing, and generative AI on Azure, aligned to the Microsoft Azure AI Fundamentals (AI-900) exam blueprint.',
  price: 2000, // USD 20 — PRACTICE tier
  priceVoucher: 9900 // USD 99 — VOUCHER tier (Foundational pricing, mirrors DP-900)
};

type SeedResult = {
  vendor: 'created' | 'updated';
  exams: { slug: string; questionCount: number; teaserCount: number }[];
  bundle: 'created' | 'updated';
};

/**
 * Idempotent seed for the AI-900 bundle. Safe to call repeatedly.
 *
 * IMPORTANT: unlike most other seeds, this performs a FULL question wipe for
 * each AI-900 exam (NOT filtered by `generatedBy`) because the prior pool was
 * heavily skewed toward one domain (~154 ML out of 360) and needs wholesale
 * replacement with this blueprint-weighted set. Vendor / exam / bundle rows
 * are upserted.
 *
 * Pass an existing PrismaClient (lifecycle managed by caller).
 */
export async function seedAi900(db: PrismaClient): Promise<SeedResult> {
  const existingVendor = await db.vendor.findUnique({ where: { slug: 'microsoft' } });
  await db.vendor.upsert({
    where: { slug: 'microsoft' },
    update: { name: 'Microsoft', description: 'Microsoft certifications — cloud, data, security, AI, and the Azure AI Fundamentals (AI-900) credential.' },
    create: { slug: 'microsoft', name: 'Microsoft', description: 'Microsoft certifications — cloud, data, security, AI, and the Azure AI Fundamentals (AI-900) credential.' }
  });
  const vendor = await db.vendor.findUniqueOrThrow({ where: { slug: 'microsoft' } });

  const examResults: SeedResult['exams'] = [];
  const examIds: Record<string, string> = {};

  for (const e of AI900_EXAMS) {
    const title = `Microsoft Azure AI Fundamentals (AI-900) — ${e.titleSuffix}`;
    const description = `${e.descriptionSuffix} Aligned to the Microsoft Azure AI Fundamentals (AI-900) exam blueprint.`;
    const examData = {
      title,
      code: e.code,
      description,
      level: 'Foundational',
      durationMinutes: 60,
      passingScore: 70,
      questionCount: e.questions.length,
      domains: AI900_DOMAINS,
      published: true
    };
    const exam = await db.exam.upsert({
      where: { slug: e.slug },
      update: examData,
      create: { ...examData, slug: e.slug, vendorId: vendor.id }
    });
    examIds[e.slug] = exam.id;

    // FULL wipe (not filtered by generatedBy) — see header comment for rationale.
    await db.question.deleteMany({ where: { examId: exam.id } });
    let teaserCount = 0;
    for (const q of e.questions) {
      await db.question.create({
        data: {
          examId: exam.id,
          domain: q.domain,
          difficulty: q.difficulty,
          type: q.type,
          stem: q.stem,
          options: q.options,
          correct: q.correct,
          explanation: q.explanation,
          references: q.references,
          status: QStatus.PUBLISHED,
          generatedBy: 'manual:ai900-seed',
          isTeaser: !!q.isTeaser
        }
      });
      if (q.isTeaser) teaserCount++;
    }
    examResults.push({ slug: e.slug, questionCount: e.questions.length, teaserCount });
  }

  const existingBundle = await db.bundle.findUnique({ where: { slug: AI900_BUNDLE.slug } });
  const bundle = await db.bundle.upsert({
    where: { slug: AI900_BUNDLE.slug },
    update: {
      title: AI900_BUNDLE.title,
      description: AI900_BUNDLE.description,
      price: AI900_BUNDLE.price,
      priceVoucher: AI900_BUNDLE.priceVoucher,
      published: true
    },
    create: {
      slug: AI900_BUNDLE.slug,
      title: AI900_BUNDLE.title,
      description: AI900_BUNDLE.description,
      price: AI900_BUNDLE.price,
      priceVoucher: AI900_BUNDLE.priceVoucher,
      published: true
    }
  });

  // Replace bundle items deterministically: drop existing, recreate.
  await db.bundleItem.deleteMany({ where: { bundleId: bundle.id } });
  const items = [
    { examSlug: 'microsoft-ai-900-p1', tier: 'PRACTICE' as const, position: 1 },
    { examSlug: 'microsoft-ai-900-p2', tier: 'PRACTICE' as const, position: 2 },
    { examSlug: 'microsoft-ai-900-p3', tier: 'PRACTICE' as const, position: 3 },
    { examSlug: 'microsoft-ai-900-p1', tier: 'VOUCHER' as const, position: 4 }
  ];
  for (const it of items) {
    await db.bundleItem.create({
      data: { bundleId: bundle.id, examId: examIds[it.examSlug], tier: it.tier, position: it.position }
    });
  }

  return {
    vendor: existingVendor ? 'updated' : 'created',
    exams: examResults,
    bundle: existingBundle ? 'updated' : 'created'
  };
}
