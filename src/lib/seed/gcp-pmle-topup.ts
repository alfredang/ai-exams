/**
 * Google Professional Machine Learning Engineer (PMLE) — grounded top-up.
 *
 * The existing PMLE practice variants P1–P3 were thin (37/37/38 published
 * questions) AND were originally generated from third-party practice-exam
 * PDFs. This module ADDS net-new questions authored against the official
 * Google Cloud / Vertex AI documentation to bring P1–P3 up to 60 published
 * questions each, distributed to the published PMLE blueprint. It does NOT
 * touch the pre-existing questions, the exam metadata, or the bundle — it
 * only inserts its own tagged rows and then resyncs questionCount.
 *
 * Idempotent: deletes + recreates only rows tagged
 * `generatedBy: 'manual:gcp-pmle-topup'`, keyed by exam SLUG (prod exam
 * codes diverge from local — see the top-up-by-slug rule). Re-running is a
 * no-op beyond recreating the same tagged set.
 *
 * Blueprint (already grounded in scripts/_google-batch.ts and prisma/seed.ts):
 *   Architecting low-code AI solutions                               12%
 *   Collaborating within/across teams to manage data and models      16%
 *   Scaling prototypes into ML models                                18%
 *   Serving and scaling models                                       20%
 *   Automating and orchestrating ML pipelines                        22%
 *   Monitoring AI solutions                                          12%
 *
 * These are independent practice questions authored from public Google
 * Cloud docs — not real or official exam items, and no claim of exam
 * accuracy or reproduction is made.
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
};

const ARCH = 'Architecting low-code AI solutions';
const COLLAB = 'Collaborating within and across teams to manage data and models';
const SCALE = 'Scaling prototypes into ML models';
const SERVE = 'Serving and scaling models';
const AUTO = 'Automating and orchestrating ML pipelines';
const MONITOR = 'Monitoring AI solutions';

const TAG = 'manual:gcp-pmle-topup';

// ── reference constants (official Google Cloud docs) ──
const R_VERTEX = { label: 'Google Cloud — Introduction to Vertex AI', url: 'https://cloud.google.com/vertex-ai/docs/start/introduction-unified-platform' };
const R_BQML = { label: 'Google Cloud — Introduction to BigQuery ML', url: 'https://cloud.google.com/bigquery/docs/bqml-introduction' };
const R_BQML_CREATE = { label: 'Google Cloud — The CREATE MODEL statement', url: 'https://cloud.google.com/bigquery/docs/reference/standard-sql/bigqueryml-syntax-create' };
const R_AUTOML = { label: 'Google Cloud — AutoML on Vertex AI', url: 'https://cloud.google.com/vertex-ai/docs/training/automl-models' };
const R_NL = { label: 'Google Cloud — Natural Language API', url: 'https://cloud.google.com/natural-language/docs' };
const R_SPEECH = { label: 'Google Cloud — Speech-to-Text', url: 'https://cloud.google.com/speech-to-text/docs' };
const R_TRANSLATE = { label: 'Google Cloud — Cloud Translation', url: 'https://cloud.google.com/translate/docs' };
const R_DOCAI = { label: 'Google Cloud — Document AI overview', url: 'https://cloud.google.com/document-ai/docs/overview' };
const R_GEMINI = { label: 'Google Cloud — Generative AI on Vertex AI', url: 'https://cloud.google.com/vertex-ai/generative-ai/docs/learn/overview' };
const R_FS = { label: 'Google Cloud — Vertex AI Feature Store', url: 'https://cloud.google.com/vertex-ai/docs/featurestore/overview' };
const R_DATASETS = { label: 'Google Cloud — Use managed datasets', url: 'https://cloud.google.com/vertex-ai/docs/training/using-managed-datasets' };
const R_METADATA = { label: 'Google Cloud — Introduction to Vertex ML Metadata', url: 'https://cloud.google.com/vertex-ai/docs/ml-metadata/introduction' };
const R_EXPERIMENTS = { label: 'Google Cloud — Introduction to Vertex AI Experiments', url: 'https://cloud.google.com/vertex-ai/docs/experiments/intro-vertex-ai-experiments' };
const R_WORKBENCH = { label: 'Google Cloud — Introduction to Vertex AI Workbench', url: 'https://cloud.google.com/vertex-ai/docs/workbench/introduction' };
const R_REGISTRY = { label: 'Google Cloud — Introduction to Vertex AI Model Registry', url: 'https://cloud.google.com/vertex-ai/docs/model-registry/introduction' };
const R_TRAIN = { label: 'Google Cloud — Custom training overview', url: 'https://cloud.google.com/vertex-ai/docs/training/overview' };
const R_PREBUILT = { label: 'Google Cloud — Prebuilt containers for custom training', url: 'https://cloud.google.com/vertex-ai/docs/training/pre-built-containers' };
const R_CUSTOM_CONTAINER = { label: 'Google Cloud — Create a custom container for training', url: 'https://cloud.google.com/vertex-ai/docs/training/create-custom-container' };
const R_DISTRIBUTED = { label: 'Google Cloud — Distributed training', url: 'https://cloud.google.com/vertex-ai/docs/training/distributed-training' };
const R_HPT = { label: 'Google Cloud — Overview of hyperparameter tuning', url: 'https://cloud.google.com/vertex-ai/docs/training/hyperparameter-tuning-overview' };
const R_VIZIER = { label: 'Google Cloud — Overview of Vertex AI Vizier', url: 'https://cloud.google.com/vertex-ai/docs/vizier/overview' };
const R_COMPUTE = { label: 'Google Cloud — Configure compute resources for custom training', url: 'https://cloud.google.com/vertex-ai/docs/training/configure-compute' };
const R_ONLINE = { label: 'Google Cloud — Get online predictions', url: 'https://cloud.google.com/vertex-ai/docs/predictions/get-online-predictions' };
const R_DEPLOY = { label: 'Google Cloud — Deploy a model to an endpoint', url: 'https://cloud.google.com/vertex-ai/docs/general/deployment' };
const R_BATCH = { label: 'Google Cloud — Get batch predictions', url: 'https://cloud.google.com/vertex-ai/docs/predictions/get-batch-predictions' };
const R_PRED_COMPUTE = { label: 'Google Cloud — Configure compute for prediction', url: 'https://cloud.google.com/vertex-ai/docs/predictions/configure-compute' };
const R_PRIVATE = { label: 'Google Cloud — Use private endpoints for online prediction', url: 'https://cloud.google.com/vertex-ai/docs/predictions/using-private-endpoints' };
const R_OPT_TF = { label: 'Google Cloud — Optimized TensorFlow runtime', url: 'https://cloud.google.com/vertex-ai/docs/predictions/optimized-tensorflow-runtime' };
const R_PIPELINES = { label: 'Google Cloud — Introduction to Vertex AI Pipelines', url: 'https://cloud.google.com/vertex-ai/docs/pipelines/introduction' };
const R_BUILD_PIPELINE = { label: 'Google Cloud — Build a pipeline', url: 'https://cloud.google.com/vertex-ai/docs/pipelines/build-pipeline' };
const R_SCHEDULE = { label: 'Google Cloud — Schedule a pipeline run', url: 'https://cloud.google.com/vertex-ai/docs/pipelines/schedule-pipeline-run' };
const R_TFX = { label: 'Google Cloud — Run TFX pipelines on Vertex AI', url: 'https://cloud.google.com/vertex-ai/docs/pipelines/build-tfx-pipeline' };
const R_MONITOR = { label: 'Google Cloud — Introduction to Vertex AI Model Monitoring', url: 'https://cloud.google.com/vertex-ai/docs/model-monitoring/overview' };
const R_XAI = { label: 'Google Cloud — Introduction to Vertex Explainable AI', url: 'https://cloud.google.com/vertex-ai/docs/explainable-ai/overview' };
const R_CLOUD_MON = { label: 'Google Cloud — Cloud Monitoring', url: 'https://cloud.google.com/monitoring/docs' };
const R_BUILD = { label: 'Google Cloud — Cloud Build', url: 'https://cloud.google.com/build/docs' };
const R_AR = { label: 'Google Cloud — Artifact Registry', url: 'https://cloud.google.com/artifact-registry/docs' };

const opts4 = (a: string, b: string, c: string, d: string): Opt[] => [
  { id: 'a', text: a }, { id: 'b', text: b }, { id: 'c', text: c }, { id: 'd', text: d }
];

// ───────────────────────── P1 top-up (+23) ─────────────────────────
const P1: Q[] = [
  // ── Architecting low-code AI solutions (3) ──
  {
    domain: ARCH, difficulty: 2, type: QType.SINGLE,
    stem: 'A data analytics team already stores all of its labeled data in BigQuery and wants to train and predict a logistic-regression churn model using only SQL, without exporting data. Which approach requires the least new infrastructure?',
    options: opts4(
      'Create the model with BigQuery ML using CREATE MODEL ... OPTIONS(model_type=\'LOGISTIC_REG\')',
      'Export the table to Cloud Storage and train a custom scikit-learn job on Vertex AI',
      'Build a Vertex AI Pipeline that reads from BigQuery and trains a TensorFlow model',
      'Use the Cloud Natural Language API to classify the records'),
    correct: ['a'],
    explanation: 'BigQuery ML lets analysts create and run models directly in BigQuery with SQL — no data movement and no extra serving infrastructure. The other options add export, custom training, or pre-trained APIs that do not fit a SQL-only churn model.',
    references: [R_BQML, R_BQML_CREATE]
  },
  {
    domain: ARCH, difficulty: 2, type: QType.SINGLE,
    stem: 'A retailer wants to extract text and key-value pairs from scanned invoices with minimal ML development. Which Google Cloud product is the best fit?',
    options: opts4(
      'Document AI',
      'Cloud Vision label detection',
      'AutoML image classification',
      'BigQuery ML'),
    correct: ['a'],
    explanation: 'Document AI provides pretrained and customizable processors that parse documents such as invoices into structured fields. Vision label detection identifies objects, not document structure, and the others are not document-parsing services.',
    references: [R_DOCAI]
  },
  {
    domain: ARCH, difficulty: 2, type: QType.SINGLE,
    stem: 'A team has only ~2,000 labeled product images and limited ML expertise, but needs a high-quality custom image classifier. Which option best balances quality and effort?',
    options: opts4(
      'Train an AutoML image classification model on Vertex AI',
      'Write a custom CNN in TensorFlow and tune it manually',
      'Use the Cloud Vision API generic label detection',
      'Use BigQuery ML linear regression'),
    correct: ['a'],
    explanation: 'AutoML image classification builds a high-quality custom model from a modest labeled dataset without requiring the team to design or tune a network. Generic Vision labels are not customized to the product taxonomy, and BigQuery ML is for tabular SQL models.',
    references: [R_AUTOML]
  },
  // ── Collaborating within and across teams (4) ──
  {
    domain: COLLAB, difficulty: 2, type: QType.SINGLE,
    stem: 'Several teams compute the same customer features independently, causing inconsistent values between training and serving. Which Vertex AI capability is designed to centralize and share feature values?',
    options: opts4(
      'Vertex AI Feature Store',
      'Vertex ML Metadata',
      'Vertex AI Experiments',
      'Vertex AI Model Registry'),
    correct: ['a'],
    explanation: 'Vertex AI Feature Store is a central repository for organizing, serving, and sharing feature values, which reduces duplication and training-serving skew. Metadata, Experiments, and Model Registry track lineage, runs, and model versions respectively.',
    references: [R_FS]
  },
  {
    domain: COLLAB, difficulty: 2, type: QType.SINGLE,
    stem: 'A team needs an auditable record of which datasets, parameters, and artifacts produced each model so they can reproduce results. Which Vertex AI service tracks this lineage?',
    options: opts4(
      'Vertex ML Metadata',
      'Cloud Logging',
      'Vertex AI Feature Store',
      'Artifact Registry'),
    correct: ['a'],
    explanation: 'Vertex ML Metadata records artifacts, executions, and their relationships so you can analyze and reproduce ML workflows. Cloud Logging captures logs, Feature Store serves features, and Artifact Registry stores container/package artifacts.',
    references: [R_METADATA]
  },
  {
    domain: COLLAB, difficulty: 2, type: QType.SINGLE,
    stem: 'Data scientists want to compare runs that used different learning rates and architectures, tracking metrics and parameters side by side. Which Vertex AI feature should they use?',
    options: opts4(
      'Vertex AI Experiments',
      'Vertex AI Model Registry',
      'Cloud Monitoring',
      'Vertex AI Vizier'),
    correct: ['a'],
    explanation: 'Vertex AI Experiments lets you track, analyze, and compare parameters and metrics across runs. Model Registry manages model versions, Cloud Monitoring is for operational metrics, and Vizier is a black-box optimization service.',
    references: [R_EXPERIMENTS]
  },
  {
    domain: COLLAB, difficulty: 2, type: QType.SINGLE,
    stem: 'A team wants a managed JupyterLab development environment that integrates with BigQuery and Vertex AI and can run on GPUs for prototyping. Which service is most appropriate?',
    options: opts4(
      'Vertex AI Workbench',
      'Cloud Shell',
      'App Engine',
      'Cloud Functions'),
    correct: ['a'],
    explanation: 'Vertex AI Workbench provides managed, Jupyter-based notebook instances integrated with Google Cloud data and ML services, with GPU options for prototyping. The other services are not notebook development environments for ML.',
    references: [R_WORKBENCH]
  },
  // ── Scaling prototypes into ML models (4) ──
  {
    domain: SCALE, difficulty: 2, type: QType.SINGLE,
    stem: 'A notebook prototype trains a scikit-learn model. The team wants to run the same training reproducibly at scale on Vertex AI with the least container work. What should they use?',
    options: opts4(
      'A custom training job with a Google-provided prebuilt container',
      'A custom container built from scratch for every run',
      'An AutoML tabular training job',
      'A BigQuery ML CREATE MODEL statement'),
    correct: ['a'],
    explanation: 'Prebuilt training containers for common frameworks (including scikit-learn) let you submit a training script as a custom job without building images. A from-scratch custom container is only needed for unusual dependencies, and AutoML/BQML do not run the existing scikit-learn code.',
    references: [R_PREBUILT, R_TRAIN]
  },
  {
    domain: SCALE, difficulty: 3, type: QType.SINGLE,
    stem: 'A training job needs an OS-level library and a private package not available in any prebuilt image. Which Vertex AI training approach fits best?',
    options: opts4(
      'Build a custom container image with the dependencies and submit it as a custom training job',
      'Use a prebuilt container and hope the dependency is present',
      'Switch the workload to AutoML',
      'Run the training only inside a Workbench notebook'),
    correct: ['a'],
    explanation: 'A custom container lets you fully control OS packages and private dependencies for the training job. Prebuilt containers fix the dependency set, AutoML does not run custom code, and a notebook is not a scalable, reproducible training job.',
    references: [R_CUSTOM_CONTAINER]
  },
  {
    domain: SCALE, difficulty: 3, type: QType.SINGLE,
    stem: 'Single-GPU training of a large TensorFlow model takes too long. The team wants to cut wall-clock time by training across multiple GPUs/nodes. Which Vertex AI capability addresses this?',
    options: opts4(
      'Configure the custom job for distributed (multi-worker) training',
      'Increase the batch size and keep one worker',
      'Switch to a batch prediction job',
      'Move the model to BigQuery ML'),
    correct: ['a'],
    explanation: 'Vertex AI supports distributed training by configuring worker pools across multiple machines and accelerators to reduce training time. Simply changing batch size does not parallelize across nodes, and prediction/BQML are unrelated.',
    references: [R_DISTRIBUTED, R_COMPUTE]
  },
  {
    domain: SCALE, difficulty: 3, type: QType.SINGLE,
    stem: 'A team wants Vertex AI to automatically search learning rate and number of layers to maximize validation accuracy during custom training. Which feature should they configure?',
    options: opts4(
      'A hyperparameter tuning job that optimizes a reported metric',
      'A batch prediction job',
      'Model Monitoring drift detection',
      'A Feature Store online serving node'),
    correct: ['a'],
    explanation: 'Vertex AI hyperparameter tuning runs multiple trials with different hyperparameter values and uses the reported metric to find the best combination (it is backed by Vizier). The other options do not perform hyperparameter search.',
    references: [R_HPT, R_VIZIER]
  },
  // ── Serving and scaling models (5) ──
  {
    domain: SERVE, difficulty: 2, type: QType.SINGLE,
    stem: 'A mobile app needs low-latency, real-time predictions for individual requests. How should the model be served on Vertex AI?',
    options: opts4(
      'Deploy the model to an endpoint and call online prediction',
      'Run a batch prediction job for each request',
      'Query the model with BigQuery scheduled queries',
      'Export predictions nightly to Cloud Storage'),
    correct: ['a'],
    explanation: 'Online prediction requires deploying the model to an endpoint, which provides low-latency synchronous responses suited to real-time per-request inference. Batch prediction and scheduled/nightly exports are for high-throughput, latency-tolerant workloads.',
    references: [R_ONLINE, R_DEPLOY]
  },
  {
    domain: SERVE, difficulty: 2, type: QType.SINGLE,
    stem: 'A nightly job must score 50 million records where latency does not matter and no endpoint should remain running. Which serving method minimizes cost?',
    options: opts4(
      'A Vertex AI batch prediction job',
      'An always-on online prediction endpoint',
      'A private online endpoint',
      'A Cloud Function per record'),
    correct: ['a'],
    explanation: 'Batch prediction processes large datasets asynchronously and does not require a persistent endpoint, which is the most cost-effective choice for latency-tolerant bulk scoring. An always-on endpoint incurs continuous cost.',
    references: [R_BATCH]
  },
  {
    domain: SERVE, difficulty: 3, type: QType.SINGLE,
    stem: 'A team wants to roll out a new model version to 10% of live traffic while the current version serves the remaining 90% on the same endpoint. Which Vertex AI feature enables this?',
    options: opts4(
      'Traffic splitting across deployed models on the endpoint',
      'Deleting the old model and deploying the new one',
      'Running both as separate batch jobs',
      'Model Monitoring sampling rate'),
    correct: ['a'],
    explanation: 'A Vertex AI endpoint can host multiple deployed models and split prediction traffic between them by percentage, enabling canary rollouts. Deleting the old model is not a gradual rollout, and the other options do not split live traffic.',
    references: [R_DEPLOY]
  },
  {
    domain: SERVE, difficulty: 3, type: QType.SINGLE,
    stem: 'An online endpoint experiences sharp daytime traffic peaks and idle nights. The team wants to control cost while meeting latency targets. What should they configure?',
    options: opts4(
      'Autoscaling with min and max replica counts on the deployed model',
      'A single fixed replica sized for peak load at all times',
      'Batch prediction during the day',
      'A larger machine type with no replica limits'),
    correct: ['a'],
    explanation: 'Configuring autoscaling with minimum and maximum replicas lets the endpoint add nodes under load and scale down when idle, balancing latency and cost. A fixed peak-sized replica wastes resources at night, and batch prediction is not real-time.',
    references: [R_PRED_COMPUTE]
  },
  {
    domain: SERVE, difficulty: 3, type: QType.SINGLE,
    stem: 'Regulatory rules require that prediction traffic never traverse the public internet and stay within the VPC. Which Vertex AI prediction option meets this?',
    options: opts4(
      'Deploy to a private endpoint accessed over VPC peering',
      'Use a public endpoint with an API key',
      'Expose the endpoint through Cloud CDN',
      'Use signed URLs to the public endpoint'),
    correct: ['a'],
    explanation: 'Vertex AI private endpoints allow online prediction to be reached through VPC Network Peering so traffic stays on Google\'s internal network rather than the public internet. Public endpoints, CDN, and signed URLs still involve public access paths.',
    references: [R_PRIVATE]
  },
  // ── Automating and orchestrating ML pipelines (5) ──
  {
    domain: AUTO, difficulty: 2, type: QType.SINGLE,
    stem: 'A team wants a serverless, repeatable way to orchestrate data prep, training, evaluation, and deployment steps with tracked artifacts. Which Google Cloud service is purpose-built for this?',
    options: opts4(
      'Vertex AI Pipelines',
      'Cloud Scheduler alone',
      'A single Cloud Function',
      'BigQuery scheduled queries'),
    correct: ['a'],
    explanation: 'Vertex AI Pipelines runs serverless ML workflows defined with KFP (or TFX), automatically tracking artifacts and lineage through ML Metadata. Cloud Scheduler/Functions and scheduled queries do not orchestrate multi-step ML workflows with artifact tracking.',
    references: [R_PIPELINES]
  },
  {
    domain: AUTO, difficulty: 3, type: QType.SINGLE,
    stem: 'A Vertex AI pipeline should retrain the model automatically every Monday at 02:00. What is the recommended way to set this up?',
    options: opts4(
      'Create a schedule for the pipeline run',
      'Manually trigger the pipeline each week',
      'Add a sleep loop inside a pipeline component',
      'Use Model Monitoring to start the run'),
    correct: ['a'],
    explanation: 'Vertex AI Pipelines supports schedules that trigger recurring pipeline runs on a cron-like cadence, which is the recommended automated approach. Manual triggers are not automated, and sleep loops or Model Monitoring are not schedulers.',
    references: [R_SCHEDULE]
  },
  {
    domain: AUTO, difficulty: 2, type: QType.SINGLE,
    stem: 'A TensorFlow team already maintains a TFX codebase and wants to run those components as a managed pipeline. Which option is most direct?',
    options: opts4(
      'Compile the TFX pipeline and run it on Vertex AI Pipelines',
      'Rewrite everything as BigQuery ML',
      'Run TFX only on a local workstation',
      'Replace TFX with Cloud Composer DAGs'),
    correct: ['a'],
    explanation: 'Vertex AI Pipelines can execute TFX pipelines, letting an existing TFX codebase run as a managed workflow. Rewriting in BQML or local-only execution loses managed orchestration, and Composer is general workflow orchestration rather than a TFX runtime requirement here.',
    references: [R_TFX, R_PIPELINES]
  },
  {
    domain: AUTO, difficulty: 3, type: QType.SINGLE,
    stem: 'In a CI/CD setup for ML, what should be used to build and store the custom training/serving container images that pipeline steps reference?',
    options: opts4(
      'Cloud Build to build images and Artifact Registry to store them',
      'BigQuery to store the images',
      'Cloud Storage buckets as the container runtime',
      'Vertex AI Feature Store'),
    correct: ['a'],
    explanation: 'Cloud Build builds container images in CI, and Artifact Registry is the managed registry for storing and versioning those images that Vertex AI jobs pull. BigQuery, plain buckets, and Feature Store are not container registries.',
    references: [R_BUILD, R_AR]
  },
  {
    domain: AUTO, difficulty: 3, type: QType.SINGLE,
    stem: 'After a pipeline trains a new model, the team wants to register and version it so deployments reference a managed version. Which component should the final pipeline step write to?',
    options: opts4(
      'Vertex AI Model Registry',
      'A Cloud Storage text file listing versions',
      'Cloud Logging',
      'A BigQuery table of hyperparameters'),
    correct: ['a'],
    explanation: 'Vertex AI Model Registry centrally manages model versions and is the standard target for pipeline steps that register trained models for deployment. The other options do not provide managed model versioning.',
    references: [R_REGISTRY]
  },
  // ── Monitoring AI solutions (2) ──
  {
    domain: MONITOR, difficulty: 3, type: QType.SINGLE,
    stem: 'After deployment, the distribution of a key input feature gradually diverges from the training data, and accuracy slips. Which Vertex AI capability detects this automatically?',
    options: opts4(
      'Model Monitoring training-serving skew and prediction drift detection',
      'Vertex AI Experiments',
      'Hyperparameter tuning',
      'Artifact Registry scanning'),
    correct: ['a'],
    explanation: 'Vertex AI Model Monitoring detects training-serving skew and prediction drift by comparing serving input distributions against a baseline and can alert when thresholds are exceeded. Experiments, tuning, and registry scanning do not monitor live input distributions.',
    references: [R_MONITOR]
  },
  {
    domain: MONITOR, difficulty: 2, type: QType.SINGLE,
    stem: 'Stakeholders ask which input features most influenced a specific prediction so they can justify model decisions. Which Vertex AI capability provides per-prediction feature attributions?',
    options: opts4(
      'Vertex Explainable AI feature attributions',
      'Cloud Monitoring dashboards',
      'Vertex AI Feature Store',
      'BigQuery INFORMATION_SCHEMA'),
    correct: ['a'],
    explanation: 'Vertex Explainable AI returns feature attributions that quantify each feature\'s contribution to a prediction, supporting transparency and debugging. Cloud Monitoring shows operational metrics, Feature Store serves features, and INFORMATION_SCHEMA is BigQuery metadata.',
    references: [R_XAI]
  }
];

// ───────────────────────── P2 top-up (+23) ─────────────────────────
const P2: Q[] = [
  // ── Architecting low-code AI solutions (3) ──
  {
    domain: ARCH, difficulty: 2, type: QType.SINGLE,
    stem: 'A support team wants to detect the sentiment of incoming customer emails without training a model. Which managed API is the best fit?',
    options: opts4(
      'Cloud Natural Language API sentiment analysis',
      'AutoML image classification',
      'BigQuery ML k-means',
      'Speech-to-Text'),
    correct: ['a'],
    explanation: 'The Natural Language API offers pretrained sentiment analysis on text with no model training required. AutoML image and Speech-to-Text address other modalities, and k-means is unsupervised clustering, not sentiment.',
    references: [R_NL]
  },
  {
    domain: ARCH, difficulty: 2, type: QType.SINGLE,
    stem: 'A team wants to transcribe call-center audio recordings into text to feed downstream analytics. Which API should they use?',
    options: opts4(
      'Speech-to-Text',
      'Text-to-Speech',
      'Cloud Translation',
      'Document AI'),
    correct: ['a'],
    explanation: 'Speech-to-Text converts spoken audio into text transcripts. Text-to-Speech does the inverse, Translation converts between languages, and Document AI parses documents.',
    references: [R_SPEECH]
  },
  {
    domain: ARCH, difficulty: 2, type: QType.SINGLE,
    stem: 'A team wants to summarize and answer questions over internal documents using a foundation model with minimal custom training. Which Google Cloud option fits best?',
    options: opts4(
      'Use generative AI models via Vertex AI',
      'Train a custom RNN from scratch',
      'Use BigQuery ML linear regression',
      'Use Cloud Vision OCR only'),
    correct: ['a'],
    explanation: 'Generative AI on Vertex AI provides foundation models (such as Gemini) for summarization and question answering with little or no custom training. A from-scratch RNN is high-effort, regression is for numeric prediction, and OCR only extracts text.',
    references: [R_GEMINI]
  },
  // ── Collaborating within and across teams (4) ──
  {
    domain: COLLAB, difficulty: 2, type: QType.SINGLE,
    stem: 'A team labels image data for an AutoML model and wants Vertex AI to manage the dataset, splits, and annotations centrally. Which Vertex AI feature should they use?',
    options: opts4(
      'Vertex AI managed datasets',
      'A raw Cloud Storage bucket of images only',
      'Vertex AI Vizier',
      'Cloud Monitoring'),
    correct: ['a'],
    explanation: 'Vertex AI managed datasets store data and annotations, manage train/validation/test splits, and integrate with training. A raw bucket lacks annotation and split management, and Vizier/Monitoring are unrelated.',
    references: [R_DATASETS]
  },
  {
    domain: COLLAB, difficulty: 3, type: QType.SINGLE,
    stem: 'To prevent training-serving skew, an online recommendation model must read the exact same precomputed features at serving time that were used in training. Which approach is recommended?',
    options: opts4(
      'Serve features from Vertex AI Feature Store online serving',
      'Recompute features in the serving code with separate logic',
      'Hard-code average feature values',
      'Read features from training CSV files at request time'),
    correct: ['a'],
    explanation: 'Feature Store provides consistent online serving of the same feature definitions used for training, which reduces training-serving skew. Recomputing with separate logic or hard-coding values reintroduces skew.',
    references: [R_FS]
  },
  {
    domain: COLLAB, difficulty: 2, type: QType.SINGLE,
    stem: 'An MLOps lead wants a single place to see all model versions, their aliases, and which endpoint each version is deployed to. Which service provides this?',
    options: opts4(
      'Vertex AI Model Registry',
      'Vertex AI Experiments',
      'Cloud Source Repositories',
      'Vertex ML Metadata'),
    correct: ['a'],
    explanation: 'Model Registry centralizes model versions and aliases and shows deployment status, giving an organized view for governance. Experiments track runs, Source Repositories host code, and ML Metadata tracks artifact lineage.',
    references: [R_REGISTRY]
  },
  {
    domain: COLLAB, difficulty: 3, type: QType.SINGLE,
    stem: 'Two teams must reproduce a colleague\'s result. They need to know the exact dataset version, container, and parameters tied to a produced model artifact. Which Vertex AI service records these relationships?',
    options: opts4(
      'Vertex ML Metadata',
      'Cloud Billing export',
      'Vertex AI Feature Store',
      'Cloud DNS'),
    correct: ['a'],
    explanation: 'ML Metadata captures artifacts, executions, and their relationships, enabling reproducibility and lineage analysis. The other services do not track ML artifact lineage.',
    references: [R_METADATA]
  },
  // ── Scaling prototypes into ML models (4) ──
  {
    domain: SCALE, difficulty: 2, type: QType.SINGLE,
    stem: 'A PyTorch prototype runs in a notebook. The team wants to submit it as a managed training job with the least image maintenance. What should they choose?',
    options: opts4(
      'A custom training job using a prebuilt PyTorch container',
      'A from-scratch custom image rebuilt every commit',
      'AutoML tabular',
      'BigQuery ML'),
    correct: ['a'],
    explanation: 'Vertex AI provides prebuilt containers for PyTorch, so a training script can run as a custom job without maintaining a custom image. AutoML/BQML do not run the PyTorch code, and a from-scratch image is unnecessary maintenance here.',
    references: [R_PREBUILT]
  },
  {
    domain: SCALE, difficulty: 3, type: QType.SINGLE,
    stem: 'Distributed multi-worker GPU training is bottlenecked by gradient all-reduce network overhead. Which Vertex AI option is designed to speed up this synchronization?',
    options: opts4(
      'Enable Reduction Server for the distributed training job',
      'Reduce the number of GPUs to one',
      'Switch to batch prediction',
      'Disable checkpoints'),
    correct: ['a'],
    explanation: 'Reduction Server is a Vertex AI all-reduce algorithm that reduces bandwidth and latency for multi-node GPU training, shortening training time. Reducing GPUs or disabling checkpoints does not address all-reduce overhead, and batch prediction is unrelated.',
    references: [R_DISTRIBUTED]
  },
  {
    domain: SCALE, difficulty: 3, type: QType.SINGLE,
    stem: 'A team needs efficient black-box optimization of a non-ML objective (e.g., tuning a system\'s parameters) as a standalone service. Which Vertex AI product fits?',
    options: opts4(
      'Vertex AI Vizier',
      'Vertex AI Feature Store',
      'Vertex AI Pipelines',
      'Model Monitoring'),
    correct: ['a'],
    explanation: 'Vertex AI Vizier is a black-box optimization service that can tune parameters of any system, not just ML training metrics. Feature Store, Pipelines, and Model Monitoring do not perform general black-box optimization.',
    references: [R_VIZIER]
  },
  {
    domain: SCALE, difficulty: 2, type: QType.SINGLE,
    stem: 'A custom training job needs accelerators. Where is the machine type and GPU/TPU configuration specified for the job?',
    options: opts4(
      'In the worker pool / compute configuration of the custom job',
      'In the Feature Store online serving node count',
      'In the endpoint traffic split',
      'In the BigQuery reservation'),
    correct: ['a'],
    explanation: 'Compute resources, including machine type and accelerators, are configured in the custom training job\'s worker pool specification. Endpoint traffic splits, Feature Store nodes, and BigQuery reservations do not configure training compute.',
    references: [R_COMPUTE]
  },
  // ── Serving and scaling models (4) ──
  {
    domain: SERVE, difficulty: 3, type: QType.SINGLE,
    stem: 'A TensorFlow model deployed for online prediction must meet a strict tail-latency budget on CPU. Which Vertex AI option can reduce serving latency for compatible TF models?',
    options: opts4(
      'Use the optimized TensorFlow runtime for the deployed model',
      'Switch to batch prediction',
      'Increase the prediction request timeout',
      'Store inputs in Feature Store'),
    correct: ['a'],
    explanation: 'The optimized TensorFlow runtime can lower latency and cost for compatible models on Vertex AI prediction. Batch prediction is not low-latency, raising timeouts does not reduce latency, and Feature Store does not change model runtime speed.',
    references: [R_OPT_TF]
  },
  {
    domain: SERVE, difficulty: 2, type: QType.SINGLE,
    stem: 'An online endpoint occasionally returns errors during cold starts when traffic begins. Which configuration reduces cold-start impact for steady availability?',
    options: opts4(
      'Set a minimum replica count greater than zero',
      'Set maximum replicas to one',
      'Use only batch prediction',
      'Disable autoscaling entirely'),
    correct: ['a'],
    explanation: 'Setting a minimum replica count above zero keeps warm nodes available, reducing cold-start latency and errors. Capping at one replica or disabling autoscaling hurts scalability, and batch prediction is not real-time.',
    references: [R_PRED_COMPUTE]
  },
  {
    domain: SERVE, difficulty: 2, type: QType.SINGLE,
    stem: 'A data team must score a large historical BigQuery table once for analysis. Which Vertex AI serving approach reads from and writes results back efficiently without a live endpoint?',
    options: opts4(
      'A batch prediction job with BigQuery as source and destination',
      'An online endpoint queried row by row',
      'A private endpoint',
      'Streaming inserts to Pub/Sub'),
    correct: ['a'],
    explanation: 'Vertex AI batch prediction can read input from and write output to BigQuery for large one-time scoring jobs, without maintaining an endpoint. Row-by-row online calls are slow and costly for bulk data.',
    references: [R_BATCH]
  },
  {
    domain: SERVE, difficulty: 3, type: QType.SINGLE,
    stem: 'A team wants to compare a candidate model against the production model on live traffic before fully promoting it, on a single endpoint. What is the recommended mechanism?',
    options: opts4(
      'Deploy both versions to the endpoint and split traffic (canary)',
      'Replace the production model immediately',
      'Run the candidate only as a batch job',
      'Use two separate projects with manual DNS switching'),
    correct: ['a'],
    explanation: 'Deploying both models to one endpoint and splitting traffic enables a controlled canary comparison before full promotion. Immediate replacement is risky, batch-only does not test live serving, and DNS switching is unnecessary complexity.',
    references: [R_DEPLOY]
  },
  // ── Automating and orchestrating ML pipelines (5) ──
  {
    domain: AUTO, difficulty: 2, type: QType.SINGLE,
    stem: 'Which SDK is the recommended way to author Vertex AI Pipelines components and compile them for execution?',
    options: opts4(
      'The Kubeflow Pipelines (KFP) SDK',
      'The BigQuery client library',
      'The Cloud Functions framework',
      'The gcloud compute SDK'),
    correct: ['a'],
    explanation: 'Vertex AI Pipelines are typically authored with the Kubeflow Pipelines SDK (or TFX) and compiled to a pipeline definition that Vertex AI runs. The other libraries are not pipeline authoring SDKs.',
    references: [R_BUILD_PIPELINE, R_PIPELINES]
  },
  {
    domain: AUTO, difficulty: 3, type: QType.SINGLE,
    stem: 'A pipeline component recomputes the same expensive feature-engineering step with identical inputs on every run. How can Vertex AI Pipelines avoid redundant recomputation?',
    options: opts4(
      'Enable step (execution) caching so unchanged steps are skipped',
      'Add a longer timeout to the step',
      'Increase the machine type',
      'Disable ML Metadata'),
    correct: ['a'],
    explanation: 'Vertex AI Pipelines supports execution caching, reusing prior outputs when a step\'s inputs and definition are unchanged, which avoids redundant work. Larger machines or longer timeouts do not prevent recomputation, and disabling metadata would remove the lineage caching relies on.',
    references: [R_PIPELINES]
  },
  {
    domain: AUTO, difficulty: 2, type: QType.SINGLE,
    stem: 'A team wants their pipeline to run automatically whenever new training data lands, by triggering the pipeline from an event-driven function. Which combination is appropriate?',
    options: opts4(
      'A Cloud Function (or Cloud Run) that submits a Vertex AI pipeline run on a Cloud Storage event',
      'A BigQuery scheduled query that trains the model directly',
      'A manual notebook execution',
      'A Model Monitoring alert that retrains automatically with no pipeline'),
    correct: ['a'],
    explanation: 'An event-driven Cloud Function or Cloud Run service can submit a Vertex AI pipeline run in response to new data arriving in Cloud Storage, enabling event-based automation. Scheduled queries and manual runs are not event-driven pipeline triggers.',
    references: [R_PIPELINES, R_SCHEDULE]
  },
  {
    domain: AUTO, difficulty: 3, type: QType.SINGLE,
    stem: 'In a production MLOps workflow, where should reusable pipeline templates and the container images they use be versioned for promotion across environments?',
    options: opts4(
      'Artifact Registry (images and pipeline templates)',
      'A shared spreadsheet',
      'Cloud Monitoring metrics',
      'The endpoint traffic split table'),
    correct: ['a'],
    explanation: 'Artifact Registry stores and versions container images and can host Kubeflow Pipelines templates, supporting controlled promotion across environments. The other options are not artifact repositories.',
    references: [R_AR]
  },
  {
    domain: AUTO, difficulty: 2, type: QType.SINGLE,
    stem: 'What is the primary benefit of using Vertex AI Pipelines over ad-hoc scripts for an ML workflow?',
    options: opts4(
      'Serverless, reproducible orchestration with automatic artifact and lineage tracking',
      'It eliminates the need for any training compute',
      'It guarantees the model will be accurate',
      'It replaces the need for a model registry, monitoring, and endpoints'),
    correct: ['a'],
    explanation: 'Vertex AI Pipelines provide serverless, repeatable orchestration and automatically record artifacts and lineage via ML Metadata. It does not remove the need for compute, guarantee accuracy, or replace registry/monitoring/serving services.',
    references: [R_PIPELINES]
  },
  // ── Monitoring AI solutions (3) ──
  {
    domain: MONITOR, difficulty: 2, type: QType.SINGLE,
    stem: 'A team needs alerts when an endpoint\'s prediction latency or error rate exceeds thresholds. Which Google Cloud service provides these operational metrics and alerting?',
    options: opts4(
      'Cloud Monitoring',
      'Vertex AI Vizier',
      'Artifact Registry',
      'BigQuery Data Transfer Service'),
    correct: ['a'],
    explanation: 'Cloud Monitoring collects operational metrics (latency, errors, resource usage) for Vertex AI endpoints and can trigger alerting policies. Vizier, Artifact Registry, and DTS do not provide operational alerting.',
    references: [R_CLOUD_MON]
  },
  {
    domain: MONITOR, difficulty: 3, type: QType.SINGLE,
    stem: 'For a deployed model, the team wants Model Monitoring to compare live serving inputs against the original training data to catch skew. What must they provide as the baseline?',
    options: opts4(
      'The training dataset (or its statistics) as the skew baseline',
      'Only the endpoint URL',
      'A list of model versions',
      'The pipeline schedule'),
    correct: ['a'],
    explanation: 'Training-serving skew detection compares serving input distributions against the training data baseline, so Model Monitoring must reference the training dataset or its statistics. The other items are not baselines for skew detection.',
    references: [R_MONITOR]
  },
  {
    domain: MONITOR, difficulty: 2, type: QType.SINGLE,
    stem: 'A model has no ground-truth labels at serving time, but the team still wants early warning of degraded inputs. Which monitoring signal is most useful?',
    options: opts4(
      'Prediction drift detection on input feature distributions',
      'Exact accuracy computed in real time',
      'Hyperparameter tuning trials',
      'Endpoint billing reports'),
    correct: ['a'],
    explanation: 'When labels are unavailable, monitoring input feature drift gives early warning that the data has shifted from the baseline, even without computing accuracy. Real-time accuracy requires labels, and tuning/billing do not detect input shift.',
    references: [R_MONITOR]
  }
];

// ───────────────────────── P3 top-up (+22) ─────────────────────────
const P3: Q[] = [
  // ── Architecting low-code AI solutions (2) ──
  {
    domain: ARCH, difficulty: 2, type: QType.SINGLE,
    stem: 'A team needs to translate user-generated content into multiple languages in real time with no model training. Which API should they use?',
    options: opts4(
      'Cloud Translation',
      'Speech-to-Text',
      'Document AI',
      'BigQuery ML'),
    correct: ['a'],
    explanation: 'Cloud Translation provides pretrained machine translation across many languages via a simple API. The other services address speech, documents, and SQL modeling respectively.',
    references: [R_TRANSLATE]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'A team wants to forecast next month\'s sales per store directly from a BigQuery table using SQL, with the platform handling time-series modeling. Which option is most efficient?',
    options: opts4(
      'Create a BigQuery ML time-series (ARIMA_PLUS) model',
      'Train a custom LSTM in a Vertex AI custom job',
      'Use the Cloud Vision API',
      'Use Document AI'),
    correct: ['a'],
    explanation: 'BigQuery ML offers ARIMA_PLUS time-series forecasting that runs in SQL directly on BigQuery data, minimizing infrastructure. A custom LSTM is far more effort, and Vision/Document AI are unrelated modalities.',
    references: [R_BQML, R_BQML_CREATE]
  },
  // ── Collaborating within and across teams (4) ──
  {
    domain: COLLAB, difficulty: 2, type: QType.SINGLE,
    stem: 'Which statement best describes the role of Vertex AI Feature Store in an organization with many ML teams?',
    options: opts4(
      'A central place to define, store, and serve features consistently for training and serving',
      'A registry of trained model versions',
      'A container image repository',
      'A dashboard of endpoint latency'),
    correct: ['a'],
    explanation: 'Feature Store centralizes feature definitions and serves them consistently for both training and online/offline serving, reducing duplication and skew across teams. The other descriptions match Model Registry, Artifact Registry, and Cloud Monitoring.',
    references: [R_FS]
  },
  {
    domain: COLLAB, difficulty: 2, type: QType.SINGLE,
    stem: 'A new analyst should be able to reproduce a model by reading the recorded inputs and executions. Which Vertex AI service stores that lineage graph?',
    options: opts4(
      'Vertex ML Metadata',
      'Cloud CDN',
      'Vertex AI Vizier',
      'Cloud Scheduler'),
    correct: ['a'],
    explanation: 'Vertex ML Metadata stores artifacts, executions, and their relationships as a lineage graph that supports reproducibility. CDN, Vizier, and Scheduler are unrelated to lineage.',
    references: [R_METADATA]
  },
  {
    domain: COLLAB, difficulty: 3, type: QType.SINGLE,
    stem: 'Two data scientists run dozens of experiments and need to identify which configuration produced the best F1 score across all runs. Which Vertex AI feature is purpose-built for this comparison?',
    options: opts4(
      'Vertex AI Experiments',
      'Model Monitoring',
      'Batch prediction',
      'Private endpoints'),
    correct: ['a'],
    explanation: 'Vertex AI Experiments logs parameters and metrics across runs and lets you compare them to find the best configuration. Monitoring, batch prediction, and private endpoints serve different purposes.',
    references: [R_EXPERIMENTS]
  },
  {
    domain: COLLAB, difficulty: 2, type: QType.SINGLE,
    stem: 'A regulated team must control who can deploy models to production endpoints versus who can only train. What is the recommended Google Cloud mechanism to enforce this separation?',
    options: opts4(
      'IAM roles and permissions scoped to Vertex AI resources',
      'Sharing one owner account among all users',
      'Embedding API keys in notebooks',
      'Relying on naming conventions only'),
    correct: ['a'],
    explanation: 'IAM lets you grant least-privilege roles so, for example, only certain principals can deploy models while others can only train. Shared accounts, embedded keys, and naming conventions do not enforce access control.',
    references: [R_VERTEX]
  },
  // ── Scaling prototypes into ML models (4) ──
  {
    domain: SCALE, difficulty: 2, type: QType.SINGLE,
    stem: 'A team wants AutoML to handle a tabular classification problem end to end, including feature handling and architecture search. Which Vertex AI product should they use?',
    options: opts4(
      'AutoML tabular training on Vertex AI',
      'A custom training job with hand-written feature code',
      'BigQuery ML k-means',
      'The Cloud Vision API'),
    correct: ['a'],
    explanation: 'AutoML tabular automates feature engineering and model/architecture search for tabular classification with minimal code. A custom job requires manual work, k-means is unsupervised clustering, and Vision is for images.',
    references: [R_AUTOML]
  },
  {
    domain: SCALE, difficulty: 3, type: QType.SINGLE,
    stem: 'A custom training job must read terabytes of training shards efficiently and resume after preemption. Which practices are recommended on Vertex AI custom training?',
    options: opts4(
      'Stream/shard data from Cloud Storage and write periodic checkpoints',
      'Load all data into the container image',
      'Disable checkpointing to save time',
      'Use a single small CPU and no sharding'),
    correct: ['a'],
    explanation: 'Reading sharded data from Cloud Storage and writing periodic checkpoints lets large jobs scale and resume after interruptions. Baking data into the image, disabling checkpoints, or undersizing compute work against scalability and resilience.',
    references: [R_TRAIN, R_COMPUTE]
  },
  {
    domain: SCALE, difficulty: 3, type: QType.SINGLE,
    stem: 'During a hyperparameter tuning job, the team wants Vertex AI to intelligently choose the next trials rather than testing a fixed grid. Which search strategy provides this?',
    options: opts4(
      'Bayesian optimization (the default Vizier-based algorithm)',
      'Grid search only',
      'Random shutdown of trials',
      'No search — use defaults'),
    correct: ['a'],
    explanation: 'Vertex AI hyperparameter tuning defaults to a Bayesian optimization algorithm (via Vizier) that uses prior trial results to choose promising next trials, which is more efficient than fixed grid search. Random shutdown and defaults are not search strategies.',
    references: [R_HPT, R_VIZIER]
  },
  {
    domain: SCALE, difficulty: 2, type: QType.SINGLE,
    stem: 'A training script reports its objective metric so a tuning job can optimize it. How does Vertex AI hyperparameter tuning receive this metric?',
    options: opts4(
      'The training code reports the metric via the hyperparameter tuning library/metric tag',
      'It reads the metric from the endpoint traffic split',
      'It infers the metric from billing data',
      'It uses the container image name'),
    correct: ['a'],
    explanation: 'The training code reports the optimization metric (e.g., via the cloudml-hypertune utility/metric tag) so the tuning service can compare trials. Traffic splits, billing, and image names are not metric sources.',
    references: [R_HPT]
  },
  // ── Serving and scaling models (4) ──
  {
    domain: SERVE, difficulty: 2, type: QType.SINGLE,
    stem: 'Before serving online predictions, what must happen to a model registered in Model Registry?',
    options: opts4(
      'It must be deployed to an endpoint with allocated compute resources',
      'It must be exported to BigQuery',
      'It must be converted to a Cloud Function',
      'It must be added to a Feature Store'),
    correct: ['a'],
    explanation: 'Online prediction requires deploying the model to an endpoint with compute resources allocated. Exporting to BigQuery, converting to a function, or adding to Feature Store are not prerequisites for online serving.',
    references: [R_DEPLOY, R_ONLINE]
  },
  {
    domain: SERVE, difficulty: 3, type: QType.SINGLE,
    stem: 'An endpoint serves a heavy deep-learning model and must meet latency targets under load. Which compute change most directly helps per-request latency?',
    options: opts4(
      'Deploy on machines with GPUs (and right-size machine type) for the model',
      'Reduce the maximum replica count to one',
      'Switch to nightly batch prediction',
      'Remove the model from the registry'),
    correct: ['a'],
    explanation: 'For heavy deep-learning models, deploying on GPU-backed machines and right-sizing the machine type reduces per-request inference latency. Capping replicas hurts throughput, batch prediction is not real-time, and registry actions do not affect latency.',
    references: [R_PRED_COMPUTE, R_DEPLOY]
  },
  {
    domain: SERVE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which scenario is the clearest fit for batch prediction rather than online prediction?',
    options: opts4(
      'Generating monthly propensity scores for the entire customer base offline',
      'Returning a fraud score within 100 ms during checkout',
      'Powering an interactive chatbot',
      'Real-time ad ranking per impression'),
    correct: ['a'],
    explanation: 'Batch prediction suits large, latency-tolerant offline scoring such as a monthly propensity run. The other scenarios require low-latency online prediction.',
    references: [R_BATCH, R_ONLINE]
  },
  {
    domain: SERVE, difficulty: 3, type: QType.SINGLE,
    stem: 'A team wants to fully cut over from model v1 to v2 only after v2 proves stable at 5%, then 50%, then 100% of traffic. Which endpoint capability supports this gradual cutover?',
    options: opts4(
      'Adjusting the traffic split percentages across deployed model versions',
      'Deleting v1 before deploying v2',
      'Creating a new project per stage',
      'Using batch prediction for v2'),
    correct: ['a'],
    explanation: 'Incrementally changing the endpoint\'s traffic split between v1 and v2 supports a staged cutover (5% → 50% → 100%). Deleting v1 first removes the safety net, and per-project stages or batch prediction do not provide live traffic shifting.',
    references: [R_DEPLOY]
  },
  // ── Automating and orchestrating ML pipelines (5) ──
  {
    domain: AUTO, difficulty: 2, type: QType.SINGLE,
    stem: 'A pipeline should only deploy a newly trained model if its evaluation metric beats the current production model. How is this best implemented in Vertex AI Pipelines?',
    options: opts4(
      'A conditional step that compares metrics and gates the deploy step',
      'Always deploy and roll back manually later',
      'Deploy from a Cloud Function with no evaluation',
      'Skip evaluation to speed up the pipeline'),
    correct: ['a'],
    explanation: 'A conditional (gating) step that compares the candidate\'s evaluation metric to the production model and only proceeds to deployment when it wins implements safe continuous training. Always-deploy or skipping evaluation risks shipping worse models.',
    references: [R_PIPELINES, R_BUILD_PIPELINE]
  },
  {
    domain: AUTO, difficulty: 3, type: QType.SINGLE,
    stem: 'A retraining pipeline must run daily AND also on-demand when monitoring flags drift. Which design meets both triggers?',
    options: opts4(
      'A scheduled pipeline run for the daily cadence plus an event/API trigger for drift-initiated runs',
      'Only a manual run each day',
      'A single Cloud Function with a sleep timer',
      'Hard-coding two copies of the pipeline'),
    correct: ['a'],
    explanation: 'Combining a pipeline schedule (daily) with an event/API-based trigger (invoked when monitoring detects drift) cleanly satisfies both scheduled and on-demand retraining. Manual runs, sleep timers, and duplicated pipelines are poor practices.',
    references: [R_SCHEDULE, R_PIPELINES]
  },
  {
    domain: AUTO, difficulty: 2, type: QType.SINGLE,
    stem: 'What does Vertex AI Pipelines automatically record for each run to support governance and debugging?',
    options: opts4(
      'Artifacts, executions, and lineage via Vertex ML Metadata',
      'Only the final accuracy number',
      'Nothing; tracking must be built manually',
      'Just the billing total'),
    correct: ['a'],
    explanation: 'Vertex AI Pipelines integrate with ML Metadata to automatically capture artifacts, executions, and lineage for each run. It records far more than a single metric, and tracking is built in rather than manual.',
    references: [R_PIPELINES, R_METADATA]
  },
  {
    domain: AUTO, difficulty: 3, type: QType.SINGLE,
    stem: 'A team wants reproducible CI for ML: on each merge, build the training container, run the pipeline, and register the model. Which services compose this CI/CD flow on Google Cloud?',
    options: opts4(
      'Cloud Build to build/test, Artifact Registry for images, Vertex AI Pipelines to run, Model Registry to register',
      'BigQuery for everything',
      'Only Cloud Scheduler',
      'A single shell script on one VM'),
    correct: ['a'],
    explanation: 'A typical ML CI/CD flow uses Cloud Build for build/test, Artifact Registry to store images, Vertex AI Pipelines to execute the workflow, and Model Registry to version the result. The other options do not provide this end-to-end automation.',
    references: [R_BUILD, R_AR]
  },
  {
    domain: AUTO, difficulty: 2, type: QType.SINGLE,
    stem: 'Why package a pipeline as a reusable, parameterized template rather than editing code for each run?',
    options: opts4(
      'It enables consistent, parameterized reruns and promotion across environments',
      'It makes the model inherently more accurate',
      'It removes the need for compute resources',
      'It disables lineage tracking'),
    correct: ['a'],
    explanation: 'Parameterized pipeline templates enable consistent reruns with different inputs and controlled promotion (dev → staging → prod). They do not change model accuracy, remove compute needs, or disable lineage.',
    references: [R_BUILD_PIPELINE, R_PIPELINES]
  },
  // ── Monitoring AI solutions (3) ──
  {
    domain: MONITOR, difficulty: 3, type: QType.SINGLE,
    stem: 'Model Monitoring flagged drift on an endpoint. What is the most appropriate automated follow-up in a mature MLOps setup?',
    options: opts4(
      'Trigger the retraining pipeline and evaluate a candidate model before redeploying',
      'Immediately delete the endpoint',
      'Ignore it until the next quarter',
      'Disable monitoring to stop the alerts'),
    correct: ['a'],
    explanation: 'A drift alert should trigger the retraining pipeline, which trains and evaluates a candidate before any gated redeployment. Deleting the endpoint, ignoring the alert, or disabling monitoring are not sound responses.',
    references: [R_MONITOR, R_PIPELINES]
  },
  {
    domain: MONITOR, difficulty: 2, type: QType.SINGLE,
    stem: 'To reduce monitoring cost on a very high-traffic endpoint while still detecting drift, which Model Monitoring setting is appropriate?',
    options: opts4(
      'Set a prediction request sampling rate below 100%',
      'Monitor every single request always',
      'Turn off all logging',
      'Only monitor after labels arrive'),
    correct: ['a'],
    explanation: 'Model Monitoring lets you sample a fraction of prediction requests, lowering cost while still detecting distribution changes statistically. Monitoring every request maximizes cost, and disabling logging would remove the data monitoring needs.',
    references: [R_MONITOR]
  },
  {
    domain: MONITOR, difficulty: 2, type: QType.SINGLE,
    stem: 'A stakeholder questions why a loan model rejected an application. Which Vertex AI capability helps explain the contribution of each input feature to that prediction?',
    options: opts4(
      'Vertex Explainable AI feature attributions',
      'Cloud Build logs',
      'Pipeline run caching',
      'Endpoint autoscaling metrics'),
    correct: ['a'],
    explanation: 'Vertex Explainable AI provides feature attributions that quantify how each feature influenced a specific prediction, supporting transparency for stakeholders. Build logs, caching, and autoscaling metrics do not explain predictions.',
    references: [R_XAI]
  }
];

const TOPUP: Record<string, Q[]> = {
  'google-professional-ml-engineer-p1': P1,
  'google-professional-ml-engineer-p2': P2,
  'google-professional-ml-engineer-p3': P3
};

type TopupResult = {
  exams: { slug: string; added: number; publishedTotal: number; questionCountField: number; missing?: boolean }[];
};

/**
 * Idempotent grounded top-up of PMLE P1–P3. For each target exam (keyed by
 * slug): delete prior rows tagged `manual:gcp-pmle-topup`, insert the
 * grounded batch as PUBLISHED, then set questionCount to the actual published
 * total. Existing (non-tagged) questions, exam metadata domains, and the
 * bundle are left untouched. Skips (does not create) any exam that is absent.
 */
export async function topupGcpPmle(db: PrismaClient): Promise<TopupResult> {
  const exams: TopupResult['exams'] = [];

  for (const [slug, batch] of Object.entries(TOPUP)) {
    const exam = await db.exam.findUnique({ where: { slug }, select: { id: true } });
    if (!exam) {
      exams.push({ slug, added: 0, publishedTotal: 0, questionCountField: 0, missing: true });
      continue;
    }

    await db.question.deleteMany({ where: { examId: exam.id, generatedBy: TAG } });

    for (const q of batch) {
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
          generatedBy: TAG,
          isTeaser: false
        }
      });
    }

    const publishedTotal = await db.question.count({
      where: { examId: exam.id, status: QStatus.PUBLISHED }
    });
    await db.exam.update({ where: { id: exam.id }, data: { questionCount: publishedTotal } });

    exams.push({ slug, added: batch.length, publishedTotal, questionCountField: publishedTotal });
  }

  return { exams };
}
