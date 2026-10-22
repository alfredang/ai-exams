/**
 * Google Professional Data Engineer bundle seed — vendor, three
 * practice-exam variants, bundle, and 195 blueprint-aligned questions.
 * Idempotent: replaces rows tagged `generatedBy: 'manual:gcp-pde-seed'`
 * and upserts catalog rows.
 *
 * Exported as `seedGcpPde(db)` so the same code path is reachable from
 * the standalone CLI shim (`prisma/seeds/gcp-pde.ts`) and the protected
 * admin API (`/api/admin/seed-gcp-pde`) — letting us bootstrap the
 * production database without redeploying.
 *
 * Question content is authored against the public Google Cloud docs and
 * the Google Professional Data Engineer domain blueprint:
 *   - Designing data processing systems            — 22% (14)
 *   - Ingesting and processing the data            — 25% (17)
 *   - Storing the data                             — 20% (13)
 *   - Preparing and using data for analysis        — 15% (10)
 *   - Maintaining and automating data workloads    — 18% (11)
 * These are independent practice questions, not real or official exam
 * items, and make no claim of exam accuracy or reproduction.
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

const DESIGN = 'Designing data processing systems';
const INGEST = 'Ingesting and processing the data';
const STORE = 'Storing the data';
const ANALYZE = 'Preparing and using data for analysis';
const MAINTAIN = 'Maintaining and automating data workloads';

const REF_BQ = { label: 'Google Cloud — BigQuery documentation', url: 'https://cloud.google.com/bigquery/docs/introduction' };
const REF_BQ_PART = { label: 'Google Cloud — Partitioned tables', url: 'https://cloud.google.com/bigquery/docs/partitioned-tables' };
const REF_BQ_CLUSTER = { label: 'Google Cloud — Clustered tables', url: 'https://cloud.google.com/bigquery/docs/clustered-tables' };
const REF_BQ_SLOTS = { label: 'Google Cloud — BigQuery slots', url: 'https://cloud.google.com/bigquery/docs/slots' };
const REF_BQ_SCHEMA = { label: 'Google Cloud — Specifying a schema', url: 'https://cloud.google.com/bigquery/docs/schemas' };
const REF_BQ_NESTED = { label: 'Google Cloud — Nested and repeated columns', url: 'https://cloud.google.com/bigquery/docs/nested-repeated' };
const REF_BQ_MV = { label: 'Google Cloud — Materialized views', url: 'https://cloud.google.com/bigquery/docs/materialized-views-intro' };
const REF_BQ_STREAM = { label: 'Google Cloud — Streaming data into BigQuery', url: 'https://cloud.google.com/bigquery/docs/streaming-data-into-bigquery' };
const REF_BQ_STORAGE_WRITE = { label: 'Google Cloud — BigQuery Storage Write API', url: 'https://cloud.google.com/bigquery/docs/write-api' };
const REF_BQ_EXTERNAL = { label: 'Google Cloud — External data sources', url: 'https://cloud.google.com/bigquery/docs/external-data-sources' };
const REF_BQ_AUTH_VIEW = { label: 'Google Cloud — Authorized views', url: 'https://cloud.google.com/bigquery/docs/authorized-views' };
const REF_BQ_COLUMN_SEC = { label: 'Google Cloud — Column-level access control', url: 'https://cloud.google.com/bigquery/docs/column-level-security-intro' };
const REF_BQ_ML = { label: 'Google Cloud — BigQuery ML introduction', url: 'https://cloud.google.com/bigquery/docs/bqml-introduction' };
const REF_BQ_BEST = { label: 'Google Cloud — Optimize query computation', url: 'https://cloud.google.com/bigquery/docs/best-practices-performance-compute' };
const REF_BQ_PRICING = { label: 'Google Cloud — BigQuery editions and pricing', url: 'https://cloud.google.com/bigquery/docs/editions-intro' };
const REF_DATAFLOW = { label: 'Google Cloud — Dataflow documentation', url: 'https://cloud.google.com/dataflow/docs' };
const REF_BEAM = { label: 'Google Cloud — Apache Beam programming model', url: 'https://cloud.google.com/dataflow/docs/concepts/beam-programming-model' };
const REF_DF_WINDOW = { label: 'Google Cloud — Windowing in Dataflow', url: 'https://cloud.google.com/dataflow/docs/concepts/streaming-pipelines' };
const REF_DF_TEMPLATE = { label: 'Google Cloud — Dataflow templates', url: 'https://cloud.google.com/dataflow/docs/concepts/dataflow-templates' };
const REF_DF_SHUFFLE = { label: 'Google Cloud — Dataflow Shuffle', url: 'https://cloud.google.com/dataflow/docs/shuffle-for-batch' };
const REF_DF_STREAM_ENGINE = { label: 'Google Cloud — Streaming Engine', url: 'https://cloud.google.com/dataflow/docs/streaming-engine' };
const REF_DF_DRAIN = { label: 'Google Cloud — Stopping a pipeline', url: 'https://cloud.google.com/dataflow/docs/guides/stopping-a-pipeline' };
const REF_PUBSUB = { label: 'Google Cloud — Pub/Sub documentation', url: 'https://cloud.google.com/pubsub/docs/overview' };
const REF_PUBSUB_DELIVERY = { label: 'Google Cloud — Pub/Sub message delivery', url: 'https://cloud.google.com/pubsub/docs/subscription-overview' };
const REF_PUBSUB_ORDER = { label: 'Google Cloud — Ordering messages', url: 'https://cloud.google.com/pubsub/docs/ordering' };
const REF_PUBSUB_DLQ = { label: 'Google Cloud — Handling message failures', url: 'https://cloud.google.com/pubsub/docs/handling-failures' };
const REF_PUBSUB_SCHEMA = { label: 'Google Cloud — Pub/Sub schemas', url: 'https://cloud.google.com/pubsub/docs/schemas' };
const REF_PUBSUB_LITE = { label: 'Google Cloud — Pub/Sub Lite', url: 'https://cloud.google.com/pubsub/lite/docs' };
const REF_DATAPROC = { label: 'Google Cloud — Dataproc documentation', url: 'https://cloud.google.com/dataproc/docs' };
const REF_DATAPROC_EPH = { label: 'Google Cloud — Dataproc ephemeral clusters', url: 'https://cloud.google.com/dataproc/docs/concepts/configuring-clusters/cluster-lifecycle' };
const REF_DATAPROC_PREEMPT = { label: 'Google Cloud — Secondary (preemptible) workers', url: 'https://cloud.google.com/dataproc/docs/concepts/compute/secondary-vms' };
const REF_DATAPROC_SERVERLESS = { label: 'Google Cloud — Dataproc Serverless', url: 'https://cloud.google.com/dataproc-serverless/docs' };
const REF_DATAFUSION = { label: 'Google Cloud — Cloud Data Fusion', url: 'https://cloud.google.com/data-fusion/docs' };
const REF_DATAFORM = { label: 'Google Cloud — Dataform overview', url: 'https://cloud.google.com/dataform/docs/overview' };
const REF_DATAPREP = { label: 'Google Cloud — Cloud Dataprep', url: 'https://cloud.google.com/dataprep/docs' };
const REF_DTS = { label: 'Google Cloud — BigQuery Data Transfer Service', url: 'https://cloud.google.com/bigquery/docs/dts-introduction' };
const REF_DATASTREAM = { label: 'Google Cloud — Datastream overview', url: 'https://cloud.google.com/datastream/docs/overview' };
const REF_BIGTABLE = { label: 'Google Cloud — Bigtable documentation', url: 'https://cloud.google.com/bigtable/docs/overview' };
const REF_BIGTABLE_SCHEMA = { label: 'Google Cloud — Bigtable schema design', url: 'https://cloud.google.com/bigtable/docs/schema-design' };
const REF_BIGTABLE_PERF = { label: 'Google Cloud — Understanding Bigtable performance', url: 'https://cloud.google.com/bigtable/docs/performance' };
const REF_SPANNER = { label: 'Google Cloud — Spanner documentation', url: 'https://cloud.google.com/spanner/docs' };
const REF_SPANNER_SCHEMA = { label: 'Google Cloud — Spanner schema design best practices', url: 'https://cloud.google.com/spanner/docs/schema-design' };
const REF_FIRESTORE = { label: 'Google Cloud — Firestore documentation', url: 'https://cloud.google.com/firestore/docs' };
const REF_CLOUDSQL = { label: 'Google Cloud — Cloud SQL documentation', url: 'https://cloud.google.com/sql/docs' };
const REF_ALLOYDB = { label: 'Google Cloud — AlloyDB for PostgreSQL', url: 'https://cloud.google.com/alloydb/docs' };
const REF_GCS = { label: 'Google Cloud — Cloud Storage documentation', url: 'https://cloud.google.com/storage/docs' };
const REF_GCS_CLASSES = { label: 'Google Cloud — Storage classes', url: 'https://cloud.google.com/storage/docs/storage-classes' };
const REF_GCS_LIFECYCLE = { label: 'Google Cloud — Object lifecycle management', url: 'https://cloud.google.com/storage/docs/lifecycle' };
const REF_COMPOSER = { label: 'Google Cloud — Cloud Composer documentation', url: 'https://cloud.google.com/composer/docs' };
const REF_SCHEDULER = { label: 'Google Cloud — Cloud Scheduler', url: 'https://cloud.google.com/scheduler/docs' };
const REF_WORKFLOWS = { label: 'Google Cloud — Workflows documentation', url: 'https://cloud.google.com/workflows/docs' };
const REF_DATAPLEX = { label: 'Google Cloud — Dataplex documentation', url: 'https://cloud.google.com/dataplex/docs' };
const REF_DATACATALOG = { label: 'Google Cloud — Data Catalog overview', url: 'https://cloud.google.com/data-catalog/docs/concepts/overview' };
const REF_DLP = { label: 'Google Cloud — Sensitive Data Protection', url: 'https://cloud.google.com/sensitive-data-protection/docs' };
const REF_CMEK = { label: 'Google Cloud — Customer-managed encryption keys (CMEK)', url: 'https://cloud.google.com/kms/docs/cmek' };
const REF_IAM = { label: 'Google Cloud — IAM overview', url: 'https://cloud.google.com/iam/docs/overview' };
const REF_VERTEX = { label: 'Google Cloud — Vertex AI documentation', url: 'https://cloud.google.com/vertex-ai/docs' };
const REF_VERTEX_PIPE = { label: 'Google Cloud — Vertex AI Pipelines', url: 'https://cloud.google.com/vertex-ai/docs/pipelines/introduction' };
const REF_LOOKER = { label: 'Google Cloud — Looker / Looker Studio', url: 'https://cloud.google.com/looker/docs' };
const REF_MONITORING = { label: 'Google Cloud — Cloud Monitoring', url: 'https://cloud.google.com/monitoring/docs' };
const REF_DR = { label: 'Google Cloud — Disaster recovery planning guide', url: 'https://cloud.google.com/architecture/dr-scenarios-planning-guide' };

// Helper to build 4-option SINGLE questions with id 'a','b','c','d'.
const opts4 = (a: string, b: string, c: string, d: string): Opt[] => [
  { id: 'a', text: a }, { id: 'b', text: b }, { id: 'c', text: c }, { id: 'd', text: d }
];

// ───────────────────── Practice Exam 1 ─────────────────────
const P1: Q[] = [
  // ── Designing data processing systems (14) ──
  {
    domain: DESIGN, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A retailer needs a fully managed, serverless analytics warehouse for ad-hoc SQL over petabytes with no cluster sizing. Which service fits best?',
    options: opts4(
      'BigQuery',
      'Cloud SQL for PostgreSQL',
      'Dataproc with Hive',
      'Bigtable'
    ),
    correct: ['a'],
    explanation: 'BigQuery is the serverless, petabyte-scale analytics warehouse with no infrastructure to size. Cloud SQL is an OLTP relational database, Dataproc requires cluster management, and Bigtable is a wide-column NoSQL store, not a SQL analytics warehouse.',
    references: [REF_BQ]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE,
    stem: 'You are designing a pipeline that must handle both a nightly bulk load and a continuous low-latency stream with the same transformation logic. Which approach minimizes duplicated code?',
    options: opts4(
      'Write a Beam pipeline on Dataflow and run it in batch and streaming modes from one codebase',
      'Maintain two separate Dataproc Spark jobs, one batch and one streaming',
      'Use BigQuery scheduled queries for batch and a Cloud Function for the stream',
      'Load everything as batch and accept higher latency'
    ),
    correct: ['a'],
    explanation: 'Apache Beam on Dataflow unifies batch and streaming under one programming model, so the same transform code runs in both modes. The other options duplicate logic across distinct engines or sacrifice the latency requirement.',
    references: [REF_BEAM, REF_DATAFLOW]
  },
  {
    domain: DESIGN, difficulty: 2, type: QType.SINGLE,
    stem: 'An application needs single-digit-millisecond reads and writes at very high throughput for time-series IoT data with no SQL joins. Which database is the best choice?',
    options: opts4(
      'Cloud Bigtable',
      'BigQuery',
      'Cloud Spanner',
      'Firestore'
    ),
    correct: ['a'],
    explanation: 'Bigtable delivers low-latency, high-throughput key/value access ideal for time-series and IoT workloads. BigQuery is analytical, Spanner targets globally consistent relational workloads, and Firestore is a document store with lower write throughput than Bigtable.',
    references: [REF_BIGTABLE]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE,
    stem: 'A global financial app requires strongly consistent, horizontally scalable relational storage with SQL and 99.999% availability. Which service should you choose?',
    options: opts4(
      'Cloud Spanner',
      'Cloud SQL with read replicas',
      'Bigtable',
      'Firestore in Datastore mode'
    ),
    correct: ['a'],
    explanation: 'Cloud Spanner provides horizontally scalable, strongly consistent relational storage with up to 99.999% availability for multi-region instances. Cloud SQL does not scale writes horizontally, and Bigtable/Firestore are non-relational.',
    references: [REF_SPANNER]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL valid reasons to choose Cloud Storage as a data lake landing zone feeding BigQuery.',
    options: opts4(
      'It durably stores raw files cheaply before transformation',
      'BigQuery can query Cloud Storage data as external tables',
      'It enforces a relational schema on write',
      'Lifecycle rules can tier or delete aged raw objects automatically'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Cloud Storage is cheap, durable object storage that BigQuery can read as external tables, with lifecycle rules to tier/expire data. It is schema-on-read object storage and does not enforce a relational schema on write.',
    references: [REF_GCS, REF_BQ_EXTERNAL, REF_GCS_LIFECYCLE]
  },
  {
    domain: DESIGN, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'BigQuery is best suited as the primary transactional (OLTP) database for high-frequency single-row updates.',
    options: opts4('True', 'False', '', '').slice(0, 2),
    correct: ['b'],
    explanation: 'False. BigQuery is an analytical (OLAP) warehouse optimized for large scans, not high-frequency single-row OLTP updates; Cloud SQL, Spanner, or Bigtable serve transactional workloads.',
    references: [REF_BQ]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE,
    stem: 'You must design a pipeline that joins streaming clickstream events with a slowly changing dimension table for enrichment. Which Dataflow pattern is appropriate?',
    options: opts4(
      'Use a side input loaded from BigQuery to enrich the streaming PCollection',
      'Re-read the dimension table from disk for every element',
      'Store the dimension in a global variable in the DoFn constructor only once and never refresh',
      'Disable windowing so all data is processed together'
    ),
    correct: ['a'],
    explanation: 'A Beam side input lets the streaming pipeline reference the dimension dataset and can be refreshed periodically. Re-reading per element is inefficient, a never-refreshed global goes stale, and disabling windowing breaks streaming semantics.',
    references: [REF_BEAM, REF_DF_WINDOW]
  },
  {
    domain: DESIGN, difficulty: 2, type: QType.SINGLE,
    stem: 'A team needs a managed Apache Airflow service to orchestrate dependent BigQuery and Dataflow jobs. Which product should they use?',
    options: opts4(
      'Cloud Composer',
      'Cloud Scheduler',
      'Cloud Tasks',
      'Pub/Sub'
    ),
    correct: ['a'],
    explanation: 'Cloud Composer is managed Apache Airflow, designed for authoring DAGs with task dependencies across BigQuery and Dataflow. Cloud Scheduler is a cron trigger only, Cloud Tasks is a task queue, and Pub/Sub is messaging.',
    references: [REF_COMPOSER]
  },
  {
    domain: DESIGN, difficulty: 4, type: QType.SINGLE,
    stem: 'A workload runs short, unpredictable BigQuery queries at irregular intervals and you want predictable cost with no idle commitment. Which pricing model is most appropriate?',
    options: opts4(
      'On-demand (per-byte-scanned) pricing',
      'A large annual slot commitment',
      'Dataproc per-second billing',
      'Cloud SQL committed use discount'
    ),
    correct: ['a'],
    explanation: 'For sporadic, low-volume queries, on-demand per-byte pricing avoids paying for idle reserved slots. Annual commitments suit steady high utilization, and the other options are not BigQuery query pricing models.',
    references: [REF_BQ_PRICING]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE,
    stem: 'You need to migrate an on-premises Oracle database to Google Cloud with continuous low-latency change data capture into BigQuery. Which service is purpose-built for this?',
    options: opts4(
      'Datastream',
      'BigQuery Data Transfer Service',
      'Storage Transfer Service',
      'Cloud Data Fusion batch only'
    ),
    correct: ['a'],
    explanation: 'Datastream is a serverless CDC and replication service that streams changes from Oracle/MySQL/PostgreSQL into destinations such as BigQuery. The Data Transfer Service handles scheduled SaaS loads, and Storage Transfer moves objects.',
    references: [REF_DATASTREAM]
  },
  {
    domain: DESIGN, difficulty: 2, type: QType.SINGLE,
    stem: 'Which storage choice best fits a product catalog requiring flexible JSON-like documents, mobile SDK sync, and per-document access rules?',
    options: opts4(
      'Firestore',
      'Bigtable',
      'BigQuery',
      'Cloud SQL'
    ),
    correct: ['a'],
    explanation: 'Firestore is a document database with offline/mobile SDK sync and fine-grained security rules, ideal for flexible documents. Bigtable and BigQuery are not document stores, and Cloud SQL is rigidly relational.',
    references: [REF_FIRESTORE]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE,
    stem: 'A lift-and-shift of an existing Hadoop/Spark estate must change as little code as possible. Which managed service is the best landing target?',
    options: opts4(
      'Dataproc',
      'Dataflow',
      'BigQuery',
      'Pub/Sub'
    ),
    correct: ['a'],
    explanation: 'Dataproc runs managed Hadoop and Spark, allowing existing jobs to migrate with minimal changes. Dataflow uses the Beam model (a rewrite), and BigQuery/Pub/Sub are not Spark engines.',
    references: [REF_DATAPROC]
  },
  {
    domain: DESIGN, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL design choices that improve BigQuery query cost and performance for a large fact table frequently filtered by event_date and customer_id.',
    options: opts4(
      'Partition the table by event_date',
      'Cluster the table by customer_id',
      'SELECT * in every query to simplify code',
      'Avoid scanning unneeded partitions by filtering on the partition column'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Date partitioning plus clustering on the common filter column prunes data and reduces bytes scanned, and filtering on the partition column enables pruning. SELECT * scans every column and increases cost.',
    references: [REF_BQ_PART, REF_BQ_CLUSTER, REF_BQ_BEST]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE,
    stem: 'A design must guarantee in-order processing of events per user key in a streaming pipeline. Which Pub/Sub capability supports this?',
    options: opts4(
      'Enable message ordering and publish with an ordering key per user',
      'Increase the subscription ack deadline',
      'Use a pull subscription with more threads',
      'Disable dead-letter topics'
    ),
    correct: ['a'],
    explanation: 'Pub/Sub message ordering with a consistent ordering key delivers messages sharing that key in publish order. Ack deadlines, thread counts, and dead-letter settings do not provide ordering guarantees.',
    references: [REF_PUBSUB_ORDER]
  },

  // ── Ingesting and processing the data (17) ──
  {
    domain: INGEST, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which fully managed service decouples high-volume event producers from consumers with at-least-once delivery?',
    options: opts4(
      'Pub/Sub',
      'Cloud SQL',
      'Cloud Storage',
      'BigQuery'
    ),
    correct: ['a'],
    explanation: 'Pub/Sub is a managed messaging service that decouples publishers and subscribers and provides at-least-once delivery. The other services are not message brokers.',
    references: [REF_PUBSUB, REF_PUBSUB_DELIVERY]
  },
  {
    domain: INGEST, difficulty: 3, type: QType.SINGLE,
    stem: 'A streaming Dataflow job must compute 1-minute aggregates but late events arrive up to 10 minutes after their event time. What should you configure?',
    options: opts4(
      'Fixed 1-minute windows with allowed lateness and triggers for late data',
      'Global window with no triggers',
      'Processing-time windows ignoring event time',
      'Batch mode with a daily load'
    ),
    correct: ['a'],
    explanation: 'Fixed 1-minute windows keyed on event time, combined with allowed lateness and late-firing triggers, correctly accumulate and emit results for late-arriving data. The other options either never emit or ignore event time.',
    references: [REF_DF_WINDOW, REF_BEAM]
  },
  {
    domain: INGEST, difficulty: 3, type: QType.SINGLE,
    stem: 'Messages that repeatedly fail processing should be isolated for later inspection without blocking the subscription. What should you configure on Pub/Sub?',
    options: opts4(
      'A dead-letter topic with a maximum delivery attempts threshold',
      'A longer ack deadline only',
      'Exactly-once delivery only',
      'A larger subscriber machine type'
    ),
    correct: ['a'],
    explanation: 'A dead-letter topic forwards messages that exceed the configured max delivery attempts so they no longer block the subscription and can be inspected. The other options do not isolate poison messages.',
    references: [REF_PUBSUB_DLQ]
  },
  {
    domain: INGEST, difficulty: 2, type: QType.SINGLE,
    stem: 'Which is the recommended high-throughput, lower-cost API for streaming rows into BigQuery in new pipelines?',
    options: opts4(
      'The BigQuery Storage Write API',
      'The legacy tabledata.insertAll streaming API exclusively',
      'A nightly load job only',
      'The Cloud SQL import API'
    ),
    correct: ['a'],
    explanation: 'The Storage Write API is the recommended high-throughput, lower-cost streaming ingestion path that also supports exactly-once semantics. The legacy insertAll API is older and costlier, and load jobs are not streaming.',
    references: [REF_BQ_STORAGE_WRITE, REF_BQ_STREAM]
  },
  {
    domain: INGEST, difficulty: 3, type: QType.SINGLE,
    stem: 'A managed, code-free ETL tool with a visual pipeline designer and CDAP plugins is required for analysts. Which service fits?',
    options: opts4(
      'Cloud Data Fusion',
      'Dataflow with Java',
      'Dataproc with custom Spark',
      'Cloud Functions'
    ),
    correct: ['a'],
    explanation: 'Cloud Data Fusion is a managed, code-free, visual ETL/ELT service built on CDAP with a plugin ecosystem. The other options require writing code.',
    references: [REF_DATAFUSION]
  },
  {
    domain: INGEST, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to deploy a reusable parameterized Dataflow job that operators can launch from the console without a build environment. What should you create?',
    options: opts4(
      'A Dataflow template (classic or Flex)',
      'A standalone Compute Engine cron',
      'A Cloud SQL stored procedure',
      'A BigQuery scheduled query'
    ),
    correct: ['a'],
    explanation: 'Dataflow templates package a pipeline so it can be launched repeatedly with runtime parameters from the console, gcloud, or API without recompiling. The alternatives do not run Beam pipelines.',
    references: [REF_DF_TEMPLATE]
  },
  {
    domain: INGEST, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Dataflow autoscaling and Shuffle.',
    options: opts4(
      'Dataflow can autoscale workers based on backlog and CPU',
      'Dataflow Shuffle moves the batch shuffle off worker VMs into a managed service',
      'Streaming Engine moves streaming state/shuffle off worker VMs',
      'Autoscaling requires manually setting a fixed worker count'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Dataflow autoscales on backlog and utilization; Dataflow Shuffle and Streaming Engine offload shuffle/state from worker VMs for efficiency. Autoscaling specifically removes the need to hardcode worker counts.',
    references: [REF_DF_SHUFFLE, REF_DF_STREAM_ENGINE]
  },
  {
    domain: INGEST, difficulty: 3, type: QType.SINGLE,
    stem: 'You must drain an updated streaming pipeline so in-flight data finishes before the old job stops. Which Dataflow action do you use?',
    options: opts4(
      'Drain the job',
      'Cancel the job immediately',
      'Delete the project',
      'Pause the subscription only'
    ),
    correct: ['a'],
    explanation: 'Draining stops ingesting new data but lets buffered/in-flight data finish, avoiding data loss during updates. Cancel discards in-flight data, and the other options do not gracefully stop the pipeline.',
    references: [REF_DF_DRAIN]
  },
  {
    domain: INGEST, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A scheduled, fully managed load of Google Ads and YouTube reporting data into BigQuery is needed with no custom code. Which service is intended for this?',
    options: opts4(
      'BigQuery Data Transfer Service',
      'Datastream',
      'Pub/Sub',
      'Cloud Composer custom operator'
    ),
    correct: ['a'],
    explanation: 'The BigQuery Data Transfer Service automates scheduled loads from Google SaaS sources (Google Ads, YouTube, Campaign Manager) and other sources into BigQuery without code. Datastream is CDC for databases.',
    references: [REF_DTS]
  },
  {
    domain: INGEST, difficulty: 4, type: QType.SINGLE,
    stem: 'A Dataflow streaming job shows growing system latency and a large unacked Pub/Sub backlog at a fixed worker count. What is the most likely remedy?',
    options: opts4(
      'Enable autoscaling (and Streaming Engine) so workers scale with backlog',
      'Reduce the Pub/Sub publish rate permanently',
      'Switch the sink from BigQuery to Cloud SQL',
      'Disable windowing'
    ),
    correct: ['a'],
    explanation: 'A persistent backlog with fixed workers indicates under-provisioning; enabling autoscaling (and Streaming Engine) lets Dataflow add workers to clear the backlog. Throttling producers or changing sinks does not address insufficient processing capacity.',
    references: [REF_DF_STREAM_ENGINE, REF_DATAFLOW]
  },
  {
    domain: INGEST, difficulty: 3, type: QType.SINGLE,
    stem: 'You want producers and consumers to agree on message structure and reject malformed Pub/Sub messages at publish time. What should you use?',
    options: opts4(
      'Pub/Sub schemas (Avro or Protocol Buffers) attached to the topic',
      'A Cloud Function that logs bad messages after the fact',
      'BigQuery constraints',
      'Increasing the message retention duration'
    ),
    correct: ['a'],
    explanation: 'Attaching an Avro or protobuf schema to a Pub/Sub topic validates message structure at publish time and rejects non-conforming messages. The other options do not enforce structure at publish.',
    references: [REF_PUBSUB_SCHEMA]
  },
  {
    domain: INGEST, difficulty: 2, type: QType.SINGLE,
    stem: 'Cloud Dataproc can autoscale by adding secondary (preemptible/spot) workers to reduce cost for fault-tolerant batch jobs.',
    options: opts4('True', 'False', '', '').slice(0, 2),
    correct: ['a'],
    explanation: 'True. Dataproc autoscaling policies can add secondary workers (preemptible/spot VMs) to scale cheaply for fault-tolerant batch processing. Secondary workers do not store HDFS data, so they suit compute-heavy stages.',
    references: [REF_DATAPROC_PREEMPT]
  },
  {
    domain: INGEST, difficulty: 3, type: QType.SINGLE,
    stem: 'A serverless Spark batch job should run without provisioning or sizing a Dataproc cluster. Which option meets this?',
    options: opts4(
      'Dataproc Serverless for Spark',
      'A long-lived Dataproc standard cluster',
      'Dataflow Java pipeline',
      'BigQuery scheduled query'
    ),
    correct: ['a'],
    explanation: 'Dataproc Serverless runs Spark batch workloads without creating or sizing clusters. A standard cluster requires provisioning, and the other options are not Spark engines.',
    references: [REF_DATAPROC_SERVERLESS]
  },
  {
    domain: INGEST, difficulty: 3, type: QType.SINGLE,
    stem: 'Ephemeral Dataproc clusters per job are recommended primarily because they:',
    options: opts4(
      'Reduce cost and isolate jobs by deleting the cluster when the job completes',
      'Provide stronger HDFS durability than Cloud Storage',
      'Eliminate the need for IAM',
      'Guarantee exactly-once Pub/Sub delivery'
    ),
    correct: ['a'],
    explanation: 'Job-scoped ephemeral clusters cut idle cost and isolate workloads; data should persist in Cloud Storage rather than cluster HDFS. They do not change IAM requirements or Pub/Sub delivery semantics.',
    references: [REF_DATAPROC_EPH]
  },
  {
    domain: INGEST, difficulty: 2, type: QType.SINGLE,
    stem: 'Which is the recommended way to trigger a Dataflow batch job every night at 02:00 with no always-on VM?',
    options: opts4(
      'Cloud Scheduler invoking a Dataflow template (directly or via a small function)',
      'A Compute Engine instance running cron 24/7',
      'A manual console launch each night',
      'A BigQuery view'
    ),
    correct: ['a'],
    explanation: 'Cloud Scheduler is a managed cron that can launch a Dataflow template on schedule without an always-on VM. A 24/7 Compute Engine cron wastes cost, manual launches are not reliable, and a view does not run pipelines.',
    references: [REF_SCHEDULER, REF_DF_TEMPLATE]
  },
  {
    domain: INGEST, difficulty: 3, type: QType.SINGLE,
    stem: 'A pipeline must deduplicate events that Pub/Sub may deliver more than once. Which approach is most robust in Dataflow?',
    options: opts4(
      'Use a stable message attribute as an idempotency key and deduplicate within a window or via the Storage Write API exactly-once path',
      'Assume Pub/Sub never delivers duplicates',
      'Drop all events older than one second',
      'Disable acknowledgements'
    ),
    correct: ['a'],
    explanation: 'Because Pub/Sub is at-least-once, deduplication should key on a stable idempotency identifier (e.g., a message attribute) within a window, or rely on exactly-once sinks like the Storage Write API. Assuming no duplicates is unsafe.',
    references: [REF_PUBSUB_DELIVERY, REF_BQ_STORAGE_WRITE]
  },
  {
    domain: INGEST, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL appropriate uses of Pub/Sub Lite versus Pub/Sub.',
    options: opts4(
      'Pub/Sub Lite can be lower cost for predictable, high-volume zonal/regional workloads where you pre-provision capacity',
      'Pub/Sub (standard) is fully managed with automatic capacity and global routing',
      'Pub/Sub Lite requires you to provision throughput/storage capacity',
      'Pub/Sub Lite automatically scales capacity with no provisioning'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Pub/Sub Lite trades operational simplicity for lower cost by requiring you to pre-provision throughput/storage capacity, suiting predictable high-volume streams. Standard Pub/Sub auto-scales capacity; Lite does not.',
    references: [REF_PUBSUB_LITE, REF_PUBSUB]
  },

  // ── Storing the data (13) ──
  {
    domain: STORE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which BigQuery feature reduces bytes scanned by limiting queries to a date range column?',
    options: opts4(
      'Partitioning the table by a date/timestamp column',
      'Increasing the project quota',
      'Enabling legacy SQL',
      'Adding more columns'
    ),
    correct: ['a'],
    explanation: 'Partitioning by date/timestamp lets BigQuery prune partitions outside the filter range, scanning fewer bytes. Quotas, legacy SQL, and extra columns do not reduce scanned data.',
    references: [REF_BQ_PART]
  },
  {
    domain: STORE, difficulty: 3, type: QType.SINGLE,
    stem: 'A Bigtable table suffers hotspotting because the row key is a monotonically increasing timestamp. What is the recommended fix?',
    options: opts4(
      'Design a non-monotonic row key (e.g., field promotion / salting) to distribute writes',
      'Add more column families',
      'Switch the table to BigQuery',
      'Increase the Bigtable app profile priority'
    ),
    correct: ['a'],
    explanation: 'Sequential keys concentrate writes on one tablet/node; using field promotion, hashing, or salting spreads writes across the key space. Column families and app profiles do not solve sequential-key hotspots.',
    references: [REF_BIGTABLE_SCHEMA, REF_BIGTABLE_PERF]
  },
  {
    domain: STORE, difficulty: 2, type: QType.SINGLE,
    stem: 'Data is read frequently for 30 days then rarely accessed but must be retained 1 year. Which Cloud Storage strategy minimizes cost?',
    options: opts4(
      'Lifecycle rule transitioning objects from Standard to Nearline/Coldline after 30 days',
      'Keep everything in Standard for a year',
      'Delete after 30 days',
      'Store in BigQuery as a table'
    ),
    correct: ['a'],
    explanation: 'A lifecycle rule that transitions aged objects to Nearline/Coldline cuts storage cost while keeping retention. Keeping Standard for a year is costly, deletion violates retention, and BigQuery is not object storage.',
    references: [REF_GCS_CLASSES, REF_GCS_LIFECYCLE]
  },
  {
    domain: STORE, difficulty: 3, type: QType.SINGLE,
    stem: 'A relational workload needs PostgreSQL compatibility with much higher analytical and transactional performance than Cloud SQL and high availability. Which service should you evaluate?',
    options: opts4(
      'AlloyDB for PostgreSQL',
      'Bigtable',
      'Firestore',
      'Cloud Storage'
    ),
    correct: ['a'],
    explanation: 'AlloyDB is a PostgreSQL-compatible managed database offering substantially higher transactional and analytical performance than standard Cloud SQL with high availability. The others are not PostgreSQL-compatible relational databases.',
    references: [REF_ALLOYDB]
  },
  {
    domain: STORE, difficulty: 3, type: QType.SINGLE,
    stem: 'In Cloud Spanner, which schema practice avoids write hotspots on a high-insert table?',
    options: opts4(
      'Avoid monotonically increasing primary keys; use a UUID or hashed/bit-reversed key',
      'Always use an auto-increment integer primary key',
      'Store all data in one row',
      'Disable secondary indexes entirely'
    ),
    correct: ['a'],
    explanation: 'Spanner splits data by primary-key ranges, so monotonically increasing keys hotspot one split; UUIDs or bit-reversed keys distribute writes. Auto-increment keys reintroduce the hotspot.',
    references: [REF_SPANNER_SCHEMA]
  },
  {
    domain: STORE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which BigQuery construct stores nested, repeated data efficiently to avoid expensive joins for one-to-many relationships?',
    options: opts4(
      'STRUCT and ARRAY (nested and repeated fields)',
      'A separate table per child row',
      'Legacy SQL only',
      'Wide string columns with delimiters'
    ),
    correct: ['a'],
    explanation: 'BigQuery supports STRUCT and ARRAY for nested/repeated data, modeling one-to-many relationships without joins. Splitting into many tables or delimited strings is less efficient and harder to query.',
    references: [REF_BQ_NESTED]
  },
  {
    domain: STORE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL valid statements about BigQuery table partitioning.',
    options: opts4(
      'Tables can be partitioned by ingestion time, a DATE/TIMESTAMP column, or an integer range',
      'A require_partition_filter setting can force queries to filter on the partition column',
      'Partitioning always physically sorts every row by all columns',
      'Partition expiration can auto-delete old partitions'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'BigQuery supports time-unit, ingestion-time, and integer-range partitioning, can require a partition filter, and supports partition expiration. Partitioning prunes by partition column; it does not globally sort by all columns (that is closer to clustering).',
    references: [REF_BQ_PART]
  },
  {
    domain: STORE, difficulty: 2, type: QType.SINGLE,
    stem: 'An application needs an OLTP MySQL database with automated backups and read replicas, with minimal operations. Which service is the simplest fit?',
    options: opts4(
      'Cloud SQL for MySQL',
      'Bigtable',
      'BigQuery',
      'Spanner'
    ),
    correct: ['a'],
    explanation: 'Cloud SQL for MySQL is a managed MySQL service with automated backups and read replicas, ideal for standard OLTP. Bigtable/BigQuery are non-relational/analytical, and Spanner is heavier than needed for a single MySQL workload.',
    references: [REF_CLOUDSQL]
  },
  {
    domain: STORE, difficulty: 4, type: QType.SINGLE,
    stem: 'A BigQuery table is clustered by customer_id. Which query benefits most from clustering?',
    options: opts4(
      'A query filtering or aggregating on customer_id',
      'A query with no WHERE clause selecting all rows',
      'A query filtering only on an unclustered free-text column',
      'A DDL statement creating an unrelated table'
    ),
    correct: ['a'],
    explanation: 'Clustering co-locates rows by the clustering columns, so filters/aggregations on customer_id read fewer blocks. Full scans or filters on unrelated columns gain little from clustering.',
    references: [REF_BQ_CLUSTER]
  },
  {
    domain: STORE, difficulty: 3, type: QType.SINGLE,
    stem: 'You must query Parquet files in Cloud Storage from BigQuery without loading them, accepting some performance tradeoff. What do you create?',
    options: opts4(
      'A BigQuery external (federated) table over the Cloud Storage URI',
      'A Bigtable instance',
      'A Cloud SQL import job',
      'A Pub/Sub topic'
    ),
    correct: ['a'],
    explanation: 'An external table lets BigQuery query Cloud Storage files in place (e.g., Parquet) without ingestion, trading some performance for flexibility. The other services do not provide federated query over GCS files.',
    references: [REF_BQ_EXTERNAL]
  },
  {
    domain: STORE, difficulty: 2, type: QType.SINGLE,
    stem: 'Bigtable is a strong choice when you need ad-hoc multi-row SQL analytics with complex joins.',
    options: opts4('True', 'False', '', '').slice(0, 2),
    correct: ['b'],
    explanation: 'False. Bigtable is a NoSQL wide-column store optimized for key/range access, not ad-hoc SQL joins; BigQuery is the appropriate analytics engine for that need.',
    references: [REF_BIGTABLE]
  },
  {
    domain: STORE, difficulty: 3, type: QType.SINGLE,
    stem: 'A multi-region BigQuery dataset is required for resilience. Which statement is correct about BigQuery dataset location?',
    options: opts4(
      'Dataset location is set at creation and cannot be changed; data is redundantly stored within that location',
      'You can move a dataset between regions with a simple flag update at any time without copying',
      'Datasets are always global by default',
      'Location only affects billing, not data residency'
    ),
    correct: ['a'],
    explanation: 'A BigQuery dataset location is fixed at creation; moving regions requires copying/recreating data. Location governs data residency and processing, not just billing.',
    references: [REF_BQ_SCHEMA, REF_BQ]
  },
  {
    domain: STORE, difficulty: 3, type: QType.SINGLE,
    stem: 'A reporting query repeatedly aggregates the same large base table with stable logic. Which BigQuery feature can transparently accelerate it and stay incrementally fresh?',
    options: opts4(
      'A materialized view',
      'A temporary table rebuilt manually',
      'Increasing slot quota only',
      'Switching to legacy SQL'
    ),
    correct: ['a'],
    explanation: 'Materialized views precompute and incrementally maintain aggregate results and can be transparently used by the optimizer. Manual temp tables are not auto-maintained, and quota/legacy SQL do not precompute results.',
    references: [REF_BQ_MV]
  },

  // ── Preparing and using data for analysis (10) ──
  {
    domain: ANALYZE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which feature lets you train and run ML models directly inside BigQuery using SQL?',
    options: opts4(
      'BigQuery ML',
      'Cloud SQL ML',
      'Bigtable ML',
      'Pub/Sub ML'
    ),
    correct: ['a'],
    explanation: 'BigQuery ML lets you create and run models (linear/logistic regression, k-means, boosted trees, etc.) using SQL inside BigQuery. The other named services do not provide in-database SQL ML.',
    references: [REF_BQ_ML]
  },
  {
    domain: ANALYZE, difficulty: 3, type: QType.SINGLE,
    stem: 'A team needs a managed environment to build, train, tune, and deploy custom TensorFlow models with managed pipelines. Which platform should they use?',
    options: opts4(
      'Vertex AI',
      'BigQuery ML only',
      'Dataproc',
      'Cloud Composer'
    ),
    correct: ['a'],
    explanation: 'Vertex AI is the unified ML platform for custom training, tuning, deployment, and pipelines. BigQuery ML targets SQL-based models, Dataproc is Spark/Hadoop, and Composer is workflow orchestration.',
    references: [REF_VERTEX]
  },
  {
    domain: ANALYZE, difficulty: 2, type: QType.SINGLE,
    stem: 'An analyst needs governed dashboards and a shared semantic data model across BigQuery. Which Google tool is designed for this?',
    options: opts4(
      'Looker',
      'Cloud Monitoring',
      'Pub/Sub',
      'Cloud Scheduler'
    ),
    correct: ['a'],
    explanation: 'Looker provides a governed semantic modeling layer (LookML) and BI dashboards on BigQuery. Monitoring is for operations, and the other services are not BI tools.',
    references: [REF_LOOKER]
  },
  {
    domain: ANALYZE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL valid ways to restrict which columns of a BigQuery table different analysts can read.',
    options: opts4(
      'Column-level access control with policy tags via Data Catalog',
      'Authorized views exposing only permitted columns',
      'Granting bigquery.dataViewer on the whole dataset to everyone',
      'Dynamic data masking with policy tags'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Policy-tag column-level security, authorized views, and dynamic data masking all restrict column exposure. Granting dataViewer on the whole dataset to everyone removes the restriction entirely.',
    references: [REF_BQ_COLUMN_SEC, REF_BQ_AUTH_VIEW]
  },
  {
    domain: ANALYZE, difficulty: 3, type: QType.SINGLE,
    stem: 'You must transform and version SQL data models in BigQuery with dependency management, tests, and CI/CD. Which managed service fits?',
    options: opts4(
      'Dataform',
      'Cloud Dataprep',
      'Pub/Sub',
      'Cloud Storage'
    ),
    correct: ['a'],
    explanation: 'Dataform manages SQL-based ELT in BigQuery with dependencies, assertions/tests, and version control for CI/CD. Dataprep is visual data wrangling, and the others are not transformation frameworks.',
    references: [REF_DATAFORM]
  },
  {
    domain: ANALYZE, difficulty: 2, type: QType.SINGLE,
    stem: 'Analysts need a visual, no-code way to explore and clean messy data interactively before loading to BigQuery. Which tool fits best?',
    options: opts4(
      'Cloud Dataprep',
      'Dataproc Spark shell',
      'BigQuery Storage Write API',
      'Cloud KMS'
    ),
    correct: ['a'],
    explanation: 'Cloud Dataprep is a visual, no-code data preparation/wrangling tool for exploring and cleaning data. The other options require code or are unrelated to interactive wrangling.',
    references: [REF_DATAPREP]
  },
  {
    domain: ANALYZE, difficulty: 4, type: QType.SINGLE,
    stem: 'A churn model in BigQuery ML shows high training accuracy but poor accuracy on new data. What is the most appropriate first step?',
    options: opts4(
      'Evaluate with a held-out test split and apply regularization / feature review to reduce overfitting',
      'Train on the full dataset with no evaluation split',
      'Increase the BigQuery slot reservation',
      'Switch storage to Coldline'
    ),
    correct: ['a'],
    explanation: 'A large train-vs-new gap indicates overfitting; using a proper held-out evaluation and regularization/feature review addresses it. Slots and storage class do not affect model generalization.',
    references: [REF_BQ_ML]
  },
  {
    domain: ANALYZE, difficulty: 3, type: QType.SINGLE,
    stem: 'You need reproducible, parameterized ML workflows that chain preprocessing, training, and deployment steps. Which Vertex AI feature should you use?',
    options: opts4(
      'Vertex AI Pipelines',
      'A single ad-hoc notebook run manually',
      'BigQuery scheduled query',
      'Cloud Scheduler alone'
    ),
    correct: ['a'],
    explanation: 'Vertex AI Pipelines orchestrate reproducible, parameterized ML steps (preprocess, train, evaluate, deploy) with lineage. A manual notebook is not reproducible orchestration, and the other tools do not chain ML steps.',
    references: [REF_VERTEX_PIPE]
  },
  {
    domain: ANALYZE, difficulty: 2, type: QType.SINGLE,
    stem: 'A BigQuery authorized view lets users query results without granting them direct access to the underlying source tables.',
    options: opts4('True', 'False', '', '').slice(0, 2),
    correct: ['a'],
    explanation: 'True. An authorized view runs against source tables on behalf of users who only have access to the view, not the underlying tables, enabling fine-grained sharing.',
    references: [REF_BQ_AUTH_VIEW]
  },
  {
    domain: ANALYZE, difficulty: 3, type: QType.SINGLE,
    stem: 'A dashboard must show near-real-time metrics on streaming data already landing in BigQuery. Which approach gives fresh results efficiently?',
    options: opts4(
      'Query a partitioned/clustered streaming table or a materialized view from Looker Studio',
      'Export the whole table to CSV every minute',
      'Move the data to Coldline first',
      'Recreate the table on every dashboard refresh'
    ),
    correct: ['a'],
    explanation: 'Querying a well-partitioned/clustered streaming table (or a materialized view) directly from a BI tool gives fresh, efficient results. CSV exports, Coldline, and full recreation add latency and cost.',
    references: [REF_BQ_MV, REF_LOOKER]
  },

  // ── Maintaining and automating data workloads (11) ──
  {
    domain: MAINTAIN, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which service centrally discovers, catalogs, and governs data across BigQuery and Cloud Storage with metadata and lineage?',
    options: opts4(
      'Dataplex (with Data Catalog)',
      'Cloud Scheduler',
      'Pub/Sub',
      'Cloud SQL'
    ),
    correct: ['a'],
    explanation: 'Dataplex provides unified data governance, discovery, and metadata management (with Data Catalog) across BigQuery and Cloud Storage. The other services do not provide data governance/cataloging.',
    references: [REF_DATAPLEX, REF_DATACATALOG]
  },
  {
    domain: MAINTAIN, difficulty: 3, type: QType.SINGLE,
    stem: 'Sensitive PII must be discovered and de-identified (masked/tokenized) in a data pipeline. Which service should you integrate?',
    options: opts4(
      'Sensitive Data Protection (Cloud DLP)',
      'Cloud Monitoring',
      'Cloud Scheduler',
      'BigQuery slots'
    ),
    correct: ['a'],
    explanation: 'Sensitive Data Protection (Cloud DLP) inspects, classifies, and de-identifies PII (masking, tokenization, redaction). Monitoring, Scheduler, and slots do not handle data de-identification.',
    references: [REF_DLP]
  },
  {
    domain: MAINTAIN, difficulty: 3, type: QType.SINGLE,
    stem: 'A compliance requirement mandates that you control and rotate the encryption keys used for BigQuery and Cloud Storage data. What should you configure?',
    options: opts4(
      'Customer-managed encryption keys (CMEK) with Cloud KMS',
      'Default Google-managed encryption only',
      'Disable encryption at rest',
      'Public access on the bucket'
    ),
    correct: ['a'],
    explanation: 'CMEK with Cloud KMS lets you own, rotate, and revoke the keys protecting data at rest in BigQuery and Cloud Storage. Default encryption does not give key control, and the other options are insecure.',
    references: [REF_CMEK]
  },
  {
    domain: MAINTAIN, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL good practices for granting access to a BigQuery analytics environment.',
    options: opts4(
      'Grant predefined or custom roles at dataset/table scope following least privilege',
      'Use groups rather than individual user bindings where possible',
      'Grant project Owner to all analysts for convenience',
      'Use authorized views to share results without exposing base tables'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Least-privilege roles scoped narrowly, group-based bindings, and authorized views are sound IAM practices. Granting project Owner broadly violates least privilege.',
    references: [REF_IAM, REF_BQ_AUTH_VIEW]
  },
  {
    domain: MAINTAIN, difficulty: 3, type: QType.SINGLE,
    stem: 'A Cloud Composer DAG fails intermittently due to a flaky external API. Which is the best built-in mitigation?',
    options: opts4(
      'Configure task retries with exponential backoff and alerting on repeated failure',
      'Remove the task from the DAG',
      'Run the DAG manually only',
      'Increase BigQuery slots'
    ),
    correct: ['a'],
    explanation: 'Airflow/Composer task retries with backoff handle transient failures, and alerting surfaces persistent issues. Removing the task or manual-only runs do not address reliability, and slots are unrelated.',
    references: [REF_COMPOSER]
  },
  {
    domain: MAINTAIN, difficulty: 2, type: QType.SINGLE,
    stem: 'You need to monitor Dataflow job health and alert when system latency or backlog exceeds a threshold. Which service provides metrics and alerting?',
    options: opts4(
      'Cloud Monitoring',
      'Cloud Scheduler',
      'Data Catalog',
      'Cloud KMS'
    ),
    correct: ['a'],
    explanation: 'Cloud Monitoring collects Dataflow metrics (system lag, backlog, throughput) and supports alerting policies. The other services do not provide metric-based alerting.',
    references: [REF_MONITORING]
  },
  {
    domain: MAINTAIN, difficulty: 4, type: QType.SINGLE,
    stem: 'A pipeline must orchestrate steps across multiple Google Cloud APIs with conditional branching and retries, defined as code but lighter than Airflow. Which service fits?',
    options: opts4(
      'Workflows',
      'Cloud Composer',
      'Pub/Sub',
      'Cloud Storage'
    ),
    correct: ['a'],
    explanation: 'Workflows is a serverless orchestrator for sequencing Google Cloud and HTTP APIs with conditions and retries, lighter weight than managed Airflow (Composer). Pub/Sub and Cloud Storage are not orchestrators.',
    references: [REF_WORKFLOWS]
  },
  {
    domain: MAINTAIN, difficulty: 3, type: QType.SINGLE,
    stem: 'A monthly BigQuery cost spike is traced to analysts running SELECT * on a huge table. Which control most directly limits accidental large scans?',
    options: opts4(
      'Set custom query/bytes-billed limits (e.g., maximum bytes billed) and educate on partition filters',
      'Delete the table',
      'Switch the dataset to multi-region',
      'Disable the BigQuery API for everyone'
    ),
    correct: ['a'],
    explanation: 'Maximum-bytes-billed limits and required partition filters cap accidental large scans while keeping the data usable. Deleting the table or disabling the API removes legitimate access; region does not control scan size.',
    references: [REF_BQ_BEST, REF_BQ_PART]
  },
  {
    domain: MAINTAIN, difficulty: 3, type: QType.SINGLE,
    stem: 'A documented disaster recovery plan for a data platform should define RPO and RPT/RTO targets and test restores periodically.',
    options: opts4('True', 'False', '', '').slice(0, 2),
    correct: ['a'],
    explanation: 'True. A sound DR plan defines recovery point/time objectives and validates them with periodic restore testing; untested backups are unreliable.',
    references: [REF_DR]
  },
  {
    domain: MAINTAIN, difficulty: 2, type: QType.SINGLE,
    stem: 'Which approach automates recurring BigQuery transformation SQL on a schedule with the least operational overhead?',
    options: opts4(
      'BigQuery scheduled queries (or Dataform with a release schedule)',
      'A 24/7 Compute Engine VM running cron and bq CLI',
      'Manually running the query daily',
      'A Bigtable trigger'
    ),
    correct: ['a'],
    explanation: 'BigQuery scheduled queries (or Dataform schedules) run recurring SQL with no infrastructure to manage. A 24/7 VM adds cost/ops, manual runs are unreliable, and Bigtable has no such trigger.',
    references: [REF_BQ, REF_DATAFORM]
  },
  {
    domain: MAINTAIN, difficulty: 3, type: QType.SINGLE,
    stem: 'You must guarantee that only a specific service account can run a production Dataflow job and write to the target BigQuery dataset. What is the best practice?',
    options: opts4(
      'Run the job as a dedicated least-privilege service account granted only the needed BigQuery/Dataflow roles',
      'Use a user’s personal credentials',
      'Grant the default service account project Editor',
      'Make the dataset publicly writable'
    ),
    correct: ['a'],
    explanation: 'A dedicated, least-privilege service account scoped to exactly the required roles isolates the workload and limits blast radius. Personal credentials, broad Editor, or public write all violate least privilege.',
    references: [REF_IAM]
  }
];

// ───────────────────── Practice Exam 2 ─────────────────────
const P2: Q[] = [
  // ── Designing data processing systems (14) ──
  {
    domain: DESIGN, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A startup wants the lowest-operations option to run analytical SQL over growing data without managing servers or clusters. Which service should they pick?',
    options: opts4(
      'BigQuery',
      'Self-managed PostgreSQL on Compute Engine',
      'Dataproc with Presto',
      'Bigtable'
    ),
    correct: ['a'],
    explanation: 'BigQuery is serverless analytics with no servers or clusters to manage. Self-managed PostgreSQL and Dataproc both require operations, and Bigtable is not a SQL analytics engine.',
    references: [REF_BQ]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE,
    stem: 'A workload needs strong global transactional consistency for inventory across continents with SQL. Which is the correct service?',
    options: opts4(
      'Cloud Spanner (multi-region)',
      'Cloud SQL with cross-region replicas',
      'Firestore Datastore mode',
      'Bigtable replicated clusters'
    ),
    correct: ['a'],
    explanation: 'Multi-region Cloud Spanner offers globally strong consistency with relational SQL. Cloud SQL replicas are eventually consistent for reads and not horizontally write-scalable; Firestore/Bigtable are non-relational.',
    references: [REF_SPANNER]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE,
    stem: 'You must choose between Dataflow and Dataproc for a brand-new unified batch+stream pipeline with autoscaling and no cluster management. Which is preferred?',
    options: opts4(
      'Dataflow (serverless Beam, unified batch/stream)',
      'Dataproc standard cluster (always on)',
      'Cloud SQL triggers',
      'Firestore functions'
    ),
    correct: ['a'],
    explanation: 'Dataflow is serverless, autoscaling, and unifies batch and streaming with Beam — ideal for greenfield pipelines. A standing Dataproc cluster adds management overhead, and the other options are not stream processors.',
    references: [REF_DATAFLOW, REF_BEAM]
  },
  {
    domain: DESIGN, difficulty: 2, type: QType.SINGLE,
    stem: 'A mobile app needs offline-capable document storage that syncs to clients automatically. Which database is designed for this?',
    options: opts4(
      'Firestore',
      'BigQuery',
      'Bigtable',
      'Cloud SQL'
    ),
    correct: ['a'],
    explanation: 'Firestore offers offline persistence and automatic client synchronization through its mobile/web SDKs. The other services lack built-in offline client sync.',
    references: [REF_FIRESTORE]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL appropriate reasons to choose Bigtable over BigQuery for a workload.',
    options: opts4(
      'You need single-digit-millisecond random reads/writes at very high QPS',
      'You need a key-based time-series store',
      'You need ad-hoc multi-table SQL analytics with joins',
      'You need very high sustained write throughput'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Bigtable excels at low-latency, high-QPS key access, time-series, and sustained writes. Ad-hoc multi-table SQL with joins is a BigQuery strength, not a Bigtable use case.',
    references: [REF_BIGTABLE]
  },
  {
    domain: DESIGN, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Apache Beam pipelines on Dataflow can run the same code in both batch and streaming modes.',
    options: opts4('True', 'False', '', '').slice(0, 2),
    correct: ['a'],
    explanation: 'True. The Beam unified model lets the same pipeline code execute in batch or streaming mode on Dataflow, differing mainly by the input source and windowing.',
    references: [REF_BEAM]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE,
    stem: 'A design must ingest CDC from MySQL into BigQuery continuously with minimal code. Which combination is most appropriate?',
    options: opts4(
      'Datastream from MySQL into BigQuery',
      'Nightly mysqldump uploaded to Cloud Storage and manually loaded',
      'Bigtable replication',
      'A Cloud Scheduler ping every minute to a Cloud SQL view'
    ),
    correct: ['a'],
    explanation: 'Datastream provides serverless CDC from MySQL into BigQuery with minimal code and low latency. Nightly dumps are batch and high-latency; the other options do not perform CDC.',
    references: [REF_DATASTREAM]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE,
    stem: 'For a data lake of raw files queried occasionally and processed by Spark, what is the recommended primary store?',
    options: opts4(
      'Cloud Storage (with Dataproc/BigQuery reading it)',
      'HDFS on a permanent Dataproc cluster',
      'Cloud SQL',
      'Firestore'
    ),
    correct: ['a'],
    explanation: 'Cloud Storage is the recommended durable, decoupled data-lake store; Dataproc and BigQuery can read it directly. Persistent HDFS couples storage to compute and adds cost; relational/document DBs are unsuitable for raw file lakes.',
    references: [REF_GCS, REF_DATAPROC_EPH]
  },
  {
    domain: DESIGN, difficulty: 4, type: QType.SINGLE,
    stem: 'A steady, predictable, high-utilization BigQuery workload runs 24/7. Which pricing model is most cost-effective?',
    options: opts4(
      'A slot commitment / reservation (BigQuery editions)',
      'On-demand per-byte pricing',
      'Per-second Dataproc billing',
      'Cloud SQL committed use'
    ),
    correct: ['a'],
    explanation: 'For steady high utilization, reserved slots/commitments give predictable, lower cost than on-demand per-byte. On-demand suits spiky/low usage, and the other models are not BigQuery query pricing.',
    references: [REF_BQ_SLOTS, REF_BQ_PRICING]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE,
    stem: 'You must orchestrate a multi-step daily pipeline with complex dependencies, backfills, and retries. Which service is the best fit?',
    options: opts4(
      'Cloud Composer (managed Airflow)',
      'Cloud Scheduler alone',
      'A single Cloud Function',
      'Pub/Sub fan-out only'
    ),
    correct: ['a'],
    explanation: 'Cloud Composer (Airflow) handles complex DAG dependencies, backfills, and retries. Cloud Scheduler only triggers, a single function lacks dependency management, and Pub/Sub is messaging, not orchestration.',
    references: [REF_COMPOSER]
  },
  {
    domain: DESIGN, difficulty: 2, type: QType.SINGLE,
    stem: 'A workload needs a managed relational database with full PostgreSQL compatibility and automated patching for a moderate OLTP app. Which is simplest?',
    options: opts4(
      'Cloud SQL for PostgreSQL',
      'Bigtable',
      'BigQuery',
      'Spanner multi-region'
    ),
    correct: ['a'],
    explanation: 'Cloud SQL for PostgreSQL is a managed, automatically patched PostgreSQL suitable for moderate OLTP. Bigtable/BigQuery are non-relational/analytical, and multi-region Spanner is more than needed here.',
    references: [REF_CLOUDSQL]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE,
    stem: 'A regulated workload requires you to control encryption keys for data at rest across BigQuery and Cloud Storage. What should the design include?',
    options: opts4(
      'CMEK using Cloud KMS keys you manage and rotate',
      'No encryption to simplify',
      'Public buckets with signed URLs only',
      'Client-side base64 encoding'
    ),
    correct: ['a'],
    explanation: 'CMEK with Cloud KMS gives the organization control over key lifecycle for BigQuery and Cloud Storage. The other options are insecure or do not provide real key-managed encryption.',
    references: [REF_CMEK]
  },
  {
    domain: DESIGN, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL valid factors when choosing between Spanner and Cloud SQL.',
    options: opts4(
      'Spanner scales writes horizontally; Cloud SQL scales writes vertically',
      'Spanner offers strong global consistency across regions',
      'Cloud SQL is typically lower cost for small single-region workloads',
      'Cloud SQL scales writes horizontally like Spanner'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Spanner scales horizontally with global strong consistency; Cloud SQL scales vertically and is cheaper for small single-region apps. Cloud SQL does not scale writes horizontally like Spanner.',
    references: [REF_SPANNER, REF_CLOUDSQL]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE,
    stem: 'A schema design must support analytics over events that each contain a variable list of attributes, minimizing joins in BigQuery. What do you use?',
    options: opts4(
      'Nested and repeated fields (STRUCT/ARRAY)',
      'One row per attribute in a tall narrow table only',
      'A separate dataset per event',
      'A single delimited string column'
    ),
    correct: ['a'],
    explanation: 'Nested/repeated fields model variable attribute lists per event efficiently and avoid joins. Tall narrow tables, per-event datasets, and delimited strings are harder to query and less efficient.',
    references: [REF_BQ_NESTED]
  },

  // ── Ingesting and processing the data (17) ──
  {
    domain: INGEST, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which service buffers bursty event traffic so downstream Dataflow consumers are not overwhelmed?',
    options: opts4(
      'Pub/Sub',
      'Cloud SQL',
      'Cloud KMS',
      'Data Catalog'
    ),
    correct: ['a'],
    explanation: 'Pub/Sub absorbs bursts and decouples producers from consumers so downstream processing can drain at its own rate. The other services do not buffer streaming events.',
    references: [REF_PUBSUB]
  },
  {
    domain: INGEST, difficulty: 3, type: QType.SINGLE,
    stem: 'A streaming job must emit running totals and also re-emit corrected results when late data arrives. Which Beam concept enables this?',
    options: opts4(
      'Triggers with accumulating mode and allowed lateness',
      'A global window with no triggers',
      'Discarding all late data silently',
      'Processing-time-only windows'
    ),
    correct: ['a'],
    explanation: 'Accumulating-mode triggers with allowed lateness emit early/on-time/late panes and update results as late data arrives. Global windows without triggers never fire incrementally, and discarding late data loses corrections.',
    references: [REF_BEAM, REF_DF_WINDOW]
  },
  {
    domain: INGEST, difficulty: 3, type: QType.SINGLE,
    stem: 'A subscriber occasionally crashes mid-processing; you must avoid losing messages. Which Pub/Sub behavior helps?',
    options: opts4(
      'Unacknowledged messages are redelivered after the ack deadline',
      'Messages are deleted as soon as they are delivered once',
      'Pub/Sub guarantees exactly-once without acknowledgements',
      'Crashes automatically extend retention to infinity'
    ),
    correct: ['a'],
    explanation: 'Pub/Sub redelivers messages that are not acknowledged before the ack deadline, so a crashed subscriber’s messages are retried. Messages are not deleted until acked, and ordering/exactly-once still require acks.',
    references: [REF_PUBSUB_DELIVERY]
  },
  {
    domain: INGEST, difficulty: 2, type: QType.SINGLE,
    stem: 'You want exactly-once, high-throughput streaming inserts into BigQuery for a new pipeline. Which API should you target?',
    options: opts4(
      'BigQuery Storage Write API (with exactly-once stream)',
      'Legacy tabledata.insertAll only',
      'Cloud SQL bulk import',
      'Bigtable mutate rows'
    ),
    correct: ['a'],
    explanation: 'The Storage Write API supports exactly-once committed streams at high throughput and lower cost, the recommended path for new streaming ingestion. The legacy API lacks these benefits, and the others are not BigQuery streaming APIs.',
    references: [REF_BQ_STORAGE_WRITE]
  },
  {
    domain: INGEST, difficulty: 3, type: QType.SINGLE,
    stem: 'Non-developers must build a batch ETL from SFTP to BigQuery visually with prebuilt connectors. Which managed service fits?',
    options: opts4(
      'Cloud Data Fusion',
      'Hand-written Dataflow Java',
      'Custom Spark on Dataproc',
      'A shell script on a VM'
    ),
    correct: ['a'],
    explanation: 'Cloud Data Fusion provides a visual designer and prebuilt connectors (including SFTP) for code-free ETL into BigQuery. The alternatives all require custom code or scripting.',
    references: [REF_DATAFUSION]
  },
  {
    domain: INGEST, difficulty: 2, type: QType.SINGLE,
    stem: 'Operations staff must launch a parameterized pipeline repeatedly from gcloud with no build step. What should the developer hand off?',
    options: opts4(
      'A Dataflow Flex template',
      'A local Maven project',
      'A Jupyter notebook',
      'A raw JAR with no entrypoint'
    ),
    correct: ['a'],
    explanation: 'A Dataflow Flex template packages the pipeline and parameters so operators can launch it via gcloud/console without a build environment. The other artifacts require a developer toolchain.',
    references: [REF_DF_TEMPLATE]
  },
  {
    domain: INGEST, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Dataflow Streaming Engine and autoscaling.',
    options: opts4(
      'Streaming Engine offloads window state and shuffle from worker VMs',
      'Autoscaling can grow/shrink workers based on backlog',
      'Streaming Engine generally improves autoscaling responsiveness',
      'Streaming Engine requires you to manage ZooKeeper'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Streaming Engine moves state/shuffle off worker VMs and improves autoscaling responsiveness; it is fully managed with no ZooKeeper to operate.',
    references: [REF_DF_STREAM_ENGINE]
  },
  {
    domain: INGEST, difficulty: 3, type: QType.SINGLE,
    stem: 'You must update a running streaming pipeline’s code while preserving in-flight aggregations where possible. Which is preferred over draining?',
    options: opts4(
      'An in-place pipeline update (job update) preserving state when compatible',
      'Cancel and recreate, accepting state loss',
      'Delete the Pub/Sub topic',
      'Pause Cloud Monitoring'
    ),
    correct: ['a'],
    explanation: 'A Dataflow in-place update can replace the pipeline graph while preserving in-flight state when the change is compatible. Cancel/recreate loses state, and the other actions do not update the pipeline.',
    references: [REF_DF_DRAIN, REF_DATAFLOW]
  },
  {
    domain: INGEST, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A scheduled daily import of Google Ads data into BigQuery with no custom code is required. Which service is intended?',
    options: opts4(
      'BigQuery Data Transfer Service',
      'Datastream',
      'Cloud KMS',
      'Bigtable'
    ),
    correct: ['a'],
    explanation: 'The BigQuery Data Transfer Service schedules managed loads from Google Ads and other sources into BigQuery without code. Datastream is database CDC, and the others are unrelated.',
    references: [REF_DTS]
  },
  {
    domain: INGEST, difficulty: 4, type: QType.SINGLE,
    stem: 'A Dataflow streaming job intermittently fails on a few malformed records and stalls the pipeline. What is the recommended pattern?',
    options: opts4(
      'Route bad records to a dead-letter sink and continue processing good records',
      'Throw and crash the whole pipeline on the first bad record',
      'Silently drop all records in the bundle',
      'Disable logging'
    ),
    correct: ['a'],
    explanation: 'A dead-letter pattern (e.g., side output to a separate sink) isolates malformed records so the pipeline keeps processing valid data and bad records can be inspected. Crashing or dropping whole bundles loses good data.',
    references: [REF_BEAM, REF_PUBSUB_DLQ]
  },
  {
    domain: INGEST, difficulty: 3, type: QType.SINGLE,
    stem: 'You must enforce a strict event schema so consumers can deserialize reliably. Which Pub/Sub feature applies?',
    options: opts4(
      'Topic schemas with Avro/Protocol Buffers and schema validation',
      'A larger ack deadline',
      'More subscriptions',
      'Disabling message retention'
    ),
    correct: ['a'],
    explanation: 'Pub/Sub topic schemas (Avro/protobuf) validate message structure at publish time and let consumers deserialize reliably. Ack deadlines, extra subscriptions, and retention settings do not enforce schema.',
    references: [REF_PUBSUB_SCHEMA]
  },
  {
    domain: INGEST, difficulty: 2, type: QType.SINGLE,
    stem: 'Dataproc workflow templates can create an ephemeral cluster, run jobs, and delete the cluster automatically.',
    options: opts4('True', 'False', '', '').slice(0, 2),
    correct: ['a'],
    explanation: 'True. Dataproc workflow templates can manage an ephemeral cluster lifecycle — create, run the job graph, then delete — minimizing idle cost.',
    references: [REF_DATAPROC_EPH]
  },
  {
    domain: INGEST, difficulty: 3, type: QType.SINGLE,
    stem: 'A Spark job is fault-tolerant and you want to cut cost on a Dataproc cluster. Which option helps most?',
    options: opts4(
      'Add secondary (spot/preemptible) workers via an autoscaling policy',
      'Switch every node to the largest machine type',
      'Move the job to Cloud SQL',
      'Disable YARN'
    ),
    correct: ['a'],
    explanation: 'Secondary spot/preemptible workers cut cost for fault-tolerant jobs and can be added by autoscaling. Larger nodes everywhere raise cost, Cloud SQL is not a Spark engine, and disabling YARN breaks the cluster.',
    references: [REF_DATAPROC_PREEMPT]
  },
  {
    domain: INGEST, difficulty: 3, type: QType.SINGLE,
    stem: 'You want to run a one-off Spark batch job without creating or sizing any cluster. Which service is correct?',
    options: opts4(
      'Dataproc Serverless for Spark',
      'A permanent Dataproc HA cluster',
      'BigQuery scheduled query',
      'Cloud Functions Gen2'
    ),
    correct: ['a'],
    explanation: 'Dataproc Serverless runs Spark batch workloads with no cluster creation or sizing. A permanent HA cluster requires provisioning, and the other services do not run Spark.',
    references: [REF_DATAPROC_SERVERLESS]
  },
  {
    domain: INGEST, difficulty: 2, type: QType.SINGLE,
    stem: 'Which is the simplest managed way to trigger a Dataflow template every hour without an always-on server?',
    options: opts4(
      'Cloud Scheduler launching the template (optionally via a function)',
      'A 24/7 VM crontab',
      'Manual gcloud each hour',
      'A BigQuery materialized view'
    ),
    correct: ['a'],
    explanation: 'Cloud Scheduler is a managed cron that can launch a Dataflow template on a schedule with no standing infrastructure. A 24/7 VM is wasteful, manual runs are unreliable, and a view does not run pipelines.',
    references: [REF_SCHEDULER]
  },
  {
    domain: INGEST, difficulty: 3, type: QType.SINGLE,
    stem: 'A pipeline must guarantee per-key ordering of Pub/Sub events through Dataflow. Which combination is required?',
    options: opts4(
      'Publish with ordering keys and process keyed/windowed in Dataflow preserving key order',
      'Random keys and global windows',
      'No keys and parallel unordered processing',
      'Disable acknowledgements to speed up'
    ),
    correct: ['a'],
    explanation: 'Ordering keys on publish plus keyed/windowed processing maintain per-key order end to end. Random/no keys or unordered parallelism break ordering, and disabling acks risks loss.',
    references: [REF_PUBSUB_ORDER, REF_BEAM]
  },
  {
    domain: INGEST, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL appropriate techniques to keep a streaming Dataflow pipeline within capacity.',
    options: opts4(
      'Enable autoscaling and Streaming Engine',
      'Right-size windows and avoid hot keys',
      'Use a fixed tiny worker count regardless of backlog',
      'Monitor system lag/backlog and alert'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Autoscaling + Streaming Engine, balanced windowing/key distribution, and backlog monitoring keep streaming pipelines healthy. A fixed tiny worker count ignores backlog and causes growing latency.',
    references: [REF_DF_STREAM_ENGINE, REF_MONITORING]
  },

  // ── Storing the data (13) ──
  {
    domain: STORE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which BigQuery technique co-locates rows by a frequently filtered column to reduce scanned blocks?',
    options: opts4(
      'Clustering',
      'Legacy SQL',
      'Adding a surrogate key',
      'Increasing project quota'
    ),
    correct: ['a'],
    explanation: 'Clustering sorts and co-locates data by the clustering columns so filters/aggregations on them read fewer blocks. The other options do not influence physical data layout.',
    references: [REF_BQ_CLUSTER]
  },
  {
    domain: STORE, difficulty: 3, type: QType.SINGLE,
    stem: 'A Bigtable workload has read latency spikes; the Key Visualizer shows a hot row range. What is the best remedy?',
    options: opts4(
      'Redesign the row key to distribute access (salting/field promotion) and add nodes if needed',
      'Add more column qualifiers',
      'Switch to BigQuery for the same access pattern',
      'Lower the replication factor'
    ),
    correct: ['a'],
    explanation: 'Hot ranges in Key Visualizer indicate a row-key design problem; redistributing keys (and scaling nodes) resolves hotspotting. More qualifiers, switching to BigQuery, or changing replication does not fix the key design.',
    references: [REF_BIGTABLE_SCHEMA, REF_BIGTABLE_PERF]
  },
  {
    domain: STORE, difficulty: 2, type: QType.SINGLE,
    stem: 'Archive data must be retained 7 years and accessed at most once a year. Which Cloud Storage class is most cost-effective?',
    options: opts4(
      'Archive',
      'Standard',
      'Nearline',
      'Multi-region Standard'
    ),
    correct: ['a'],
    explanation: 'The Archive class offers the lowest storage cost for data accessed less than once a year with long retention. Standard and Nearline cost more for rarely accessed long-term archives.',
    references: [REF_GCS_CLASSES]
  },
  {
    domain: STORE, difficulty: 3, type: QType.SINGLE,
    stem: 'A relational app needs PostgreSQL with strong analytical acceleration and high availability beyond standard Cloud SQL. Which service should you choose?',
    options: opts4(
      'AlloyDB for PostgreSQL',
      'Bigtable',
      'BigQuery BI Engine',
      'Firestore'
    ),
    correct: ['a'],
    explanation: 'AlloyDB is PostgreSQL-compatible with a columnar engine for analytical acceleration and high availability beyond standard Cloud SQL. Bigtable/Firestore are non-relational, and BI Engine accelerates BigQuery, not Postgres OLTP.',
    references: [REF_ALLOYDB]
  },
  {
    domain: STORE, difficulty: 3, type: QType.SINGLE,
    stem: 'A Spanner table keyed by an auto-incrementing ID hotspots on inserts. Which key design avoids this?',
    options: opts4(
      'Use a UUIDv4 or bit-reversed sequence as the primary key',
      'Keep the auto-increment but add a secondary index',
      'Put all rows in a single parent row',
      'Disable transactions'
    ),
    correct: ['a'],
    explanation: 'Spanner splits by key range, so sequential keys hotspot one split; UUIDs or bit-reversed sequences distribute inserts. Secondary indexes do not fix the base-table hotspot, and the other options are invalid designs.',
    references: [REF_SPANNER_SCHEMA]
  },
  {
    domain: STORE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which BigQuery feature lets you require that every query filters on the partition column to control cost?',
    options: opts4(
      'require_partition_filter on the partitioned table',
      'Legacy SQL mode',
      'A view with SELECT *',
      'Higher slot quota'
    ),
    correct: ['a'],
    explanation: 'Setting require_partition_filter forces queries to include a predicate on the partition column, preventing accidental full-table scans. The other options do not enforce partition filtering.',
    references: [REF_BQ_PART]
  },
  {
    domain: STORE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL correct statements about BigQuery clustering.',
    options: opts4(
      'Clustering can be combined with partitioning',
      'Clustering helps filters and aggregations on the clustering columns',
      'Clustering requires choosing a fixed number of partitions',
      'Clustering can reduce bytes scanned for selective queries'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Clustering complements partitioning, accelerates selective filters/aggregations on clustering columns, and reduces scanned bytes. It is independent of partition counts (partitioning, not clustering, defines partitions).',
    references: [REF_BQ_CLUSTER, REF_BQ_PART]
  },
  {
    domain: STORE, difficulty: 2, type: QType.SINGLE,
    stem: 'A small OLTP service needs a managed SQL Server-compatible database with automated backups. Which service is appropriate?',
    options: opts4(
      'Cloud SQL for SQL Server',
      'Bigtable',
      'BigQuery',
      'Firestore'
    ),
    correct: ['a'],
    explanation: 'Cloud SQL supports a managed SQL Server engine with automated backups for OLTP. Bigtable/Firestore are non-relational and BigQuery is analytical.',
    references: [REF_CLOUDSQL]
  },
  {
    domain: STORE, difficulty: 4, type: QType.SINGLE,
    stem: 'You need cheap, durable storage for raw ingestion that BigQuery can query without a load step for occasional analysis. Which approach is best?',
    options: opts4(
      'Store files in Cloud Storage and define BigQuery external tables over them',
      'Stream every raw byte into Bigtable',
      'Load everything into Spanner',
      'Keep raw data only in Pub/Sub'
    ),
    correct: ['a'],
    explanation: 'Cloud Storage plus BigQuery external tables gives cheap durable storage with on-demand SQL access and no load step for occasional queries. Bigtable/Spanner are costlier for raw archives and Pub/Sub is not long-term storage.',
    references: [REF_GCS, REF_BQ_EXTERNAL]
  },
  {
    domain: STORE, difficulty: 3, type: QType.SINGLE,
    stem: 'A globally distributed app needs relational data with 99.999% multi-region availability and external consistency. Which database meets all requirements?',
    options: opts4(
      'Cloud Spanner multi-region',
      'Cloud SQL single zone',
      'Bigtable single cluster',
      'Firestore native single region'
    ),
    correct: ['a'],
    explanation: 'Multi-region Spanner delivers up to 99.999% availability with externally consistent relational transactions. The other options are non-relational or lack multi-region 99.999% relational guarantees.',
    references: [REF_SPANNER]
  },
  {
    domain: STORE, difficulty: 2, type: QType.SINGLE,
    stem: 'A BigQuery dataset’s region/location can be freely changed after creation without copying data.',
    options: opts4('True', 'False', '', '').slice(0, 2),
    correct: ['b'],
    explanation: 'False. Dataset location is fixed at creation; relocating data to another region requires copying or recreating it (e.g., via a dataset copy or export/import).',
    references: [REF_BQ_SCHEMA]
  },
  {
    domain: STORE, difficulty: 3, type: QType.SINGLE,
    stem: 'An expensive dashboard repeatedly recomputes the same aggregation over a huge table. Which BigQuery feature reduces cost while staying fresh?',
    options: opts4(
      'Materialized view that incrementally maintains the aggregate',
      'Re-running the raw query each load',
      'Coldline storage for the table',
      'Disabling caching'
    ),
    correct: ['a'],
    explanation: 'A materialized view precomputes and incrementally refreshes the aggregate, cutting repeated scan cost. Re-running the raw query is costly, Coldline does not speed queries, and disabling caching increases cost.',
    references: [REF_BQ_MV]
  },
  {
    domain: STORE, difficulty: 3, type: QType.SINGLE,
    stem: 'You must store IoT time-series at millions of events/sec with millisecond reads by device and time range. Which store and key design is best?',
    options: opts4(
      'Bigtable with row key like deviceId#reverseTimestamp',
      'BigQuery with one insert per event and no partitioning',
      'Cloud SQL with a single table and serial primary key',
      'Firestore with one document per event in one collection'
    ),
    correct: ['a'],
    explanation: 'Bigtable handles very high write rates and fast range scans; a deviceId#reverseTimestamp key avoids hotspots and supports recent-data queries. The relational/document options cannot sustain that throughput efficiently.',
    references: [REF_BIGTABLE_SCHEMA]
  },

  // ── Preparing and using data for analysis (10) ──
  {
    domain: ANALYZE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which approach trains a logistic regression model with SQL and no separate ML infrastructure?',
    options: opts4(
      'CREATE MODEL in BigQuery ML',
      'Export to CSV and use a spreadsheet',
      'Bigtable model functions',
      'Cloud SQL stored ML'
    ),
    correct: ['a'],
    explanation: 'BigQuery ML’s CREATE MODEL trains models like logistic regression directly in BigQuery using SQL with no separate ML infrastructure. The other options are not in-database ML capabilities.',
    references: [REF_BQ_ML]
  },
  {
    domain: ANALYZE, difficulty: 3, type: QType.SINGLE,
    stem: 'You must deploy a custom PyTorch model with managed endpoints, autoscaling, and monitoring. Which service is appropriate?',
    options: opts4(
      'Vertex AI prediction endpoints',
      'BigQuery ML only',
      'Cloud SQL',
      'Pub/Sub'
    ),
    correct: ['a'],
    explanation: 'Vertex AI provides managed online prediction endpoints with autoscaling and monitoring for custom models. BigQuery ML is SQL-model focused, and the others are not model-serving platforms.',
    references: [REF_VERTEX]
  },
  {
    domain: ANALYZE, difficulty: 2, type: QType.SINGLE,
    stem: 'Business users need self-service dashboards on BigQuery with no SQL. Which Google tool is most appropriate?',
    options: opts4(
      'Looker Studio',
      'Cloud Logging',
      'Cloud KMS',
      'Dataproc'
    ),
    correct: ['a'],
    explanation: 'Looker Studio enables self-service BI dashboards over BigQuery without writing SQL. Logging/KMS/Dataproc are not BI tools.',
    references: [REF_LOOKER]
  },
  {
    domain: ANALYZE, difficulty: 3, type: QType.SINGLE,
    stem: 'A team needs versioned, tested SQL transformations with dependency graphs in BigQuery integrated with Git. Which service fits best?',
    options: opts4(
      'Dataform',
      'Cloud Dataprep',
      'Cloud Scheduler',
      'Pub/Sub'
    ),
    correct: ['a'],
    explanation: 'Dataform manages dependency-aware, tested, Git-versioned SQL transformations in BigQuery. Dataprep is visual wrangling, and the others do not provide SQL transformation frameworks.',
    references: [REF_DATAFORM]
  },
  {
    domain: ANALYZE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL valid ways to limit which rows a BigQuery analyst can see.',
    options: opts4(
      'Row-level security policies on the table',
      'Authorized views that filter rows',
      'Granting Owner on the project to all analysts',
      'A secured view with a WHERE clause plus dataset-scoped access'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Row-level security, authorized views, and filtered secured views all restrict visible rows. Granting project Owner to everyone removes restrictions entirely.',
    references: [REF_BQ_AUTH_VIEW, REF_IAM]
  },
  {
    domain: ANALYZE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Vertex AI capability orchestrates repeatable, parameterized ML steps with lineage tracking?',
    options: opts4(
      'Vertex AI Pipelines',
      'A manual notebook cell',
      'A Cloud Scheduler job alone',
      'A Pub/Sub topic'
    ),
    correct: ['a'],
    explanation: 'Vertex AI Pipelines orchestrate reproducible ML workflows with parameters and lineage. The other options do not provide ML pipeline orchestration with lineage.',
    references: [REF_VERTEX_PIPE]
  },
  {
    domain: ANALYZE, difficulty: 4, type: QType.SINGLE,
    stem: 'A BigQuery ML model underperforms; feature columns include high-cardinality free text and unscaled numerics. What is a reasonable improvement step?',
    options: opts4(
      'Apply feature preprocessing (e.g., TRANSFORM clause: standardize numerics, encode text) and re-evaluate',
      'Remove the evaluation step to speed iteration',
      'Increase Cloud Storage retention',
      'Switch the dataset region'
    ),
    correct: ['a'],
    explanation: 'Preprocessing features (scaling numerics, encoding text via the TRANSFORM clause) commonly improves model quality, validated by re-evaluation. The other options do not affect model performance.',
    references: [REF_BQ_ML]
  },
  {
    domain: ANALYZE, difficulty: 3, type: QType.SINGLE,
    stem: 'Analysts need to interactively clean inconsistent CSVs (typos, formats) before loading to BigQuery, with no code. Which tool fits?',
    options: opts4(
      'Cloud Dataprep',
      'Dataflow Python',
      'Spark on Dataproc',
      'BigQuery BI Engine'
    ),
    correct: ['a'],
    explanation: 'Cloud Dataprep provides no-code, interactive data cleaning and wrangling with suggested transforms. Dataflow/Spark require code, and BI Engine accelerates queries rather than wrangling data.',
    references: [REF_DATAPREP]
  },
  {
    domain: ANALYZE, difficulty: 2, type: QType.SINGLE,
    stem: 'BigQuery ML supports model evaluation functions (such as ML.EVALUATE) to assess model quality with SQL.',
    options: opts4('True', 'False', '', '').slice(0, 2),
    correct: ['a'],
    explanation: 'True. BigQuery ML provides ML.EVALUATE and related functions to assess model metrics directly with SQL after training.',
    references: [REF_BQ_ML]
  },
  {
    domain: ANALYZE, difficulty: 3, type: QType.SINGLE,
    stem: 'You must give external partners query access to only aggregated results, never the raw rows, in BigQuery. Which is the cleanest mechanism?',
    options: opts4(
      'An authorized view exposing only aggregates, shared to the partner project',
      'Granting them dataViewer on the raw dataset',
      'Emailing CSV extracts manually',
      'Making the table public'
    ),
    correct: ['a'],
    explanation: 'An authorized view can expose only aggregated columns/rows while the partner has no access to base tables. Granting raw dataViewer or public access overexposes data, and manual CSVs are error-prone.',
    references: [REF_BQ_AUTH_VIEW]
  },

  // ── Maintaining and automating data workloads (11) ──
  {
    domain: MAINTAIN, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which service provides a unified data fabric for cataloging, organizing, and governing data across lakes and warehouses?',
    options: opts4(
      'Dataplex',
      'Cloud Scheduler',
      'Pub/Sub Lite',
      'Cloud SQL'
    ),
    correct: ['a'],
    explanation: 'Dataplex provides unified governance, organization, and cataloging across data lakes and warehouses. The other services are not data governance fabrics.',
    references: [REF_DATAPLEX]
  },
  {
    domain: MAINTAIN, difficulty: 3, type: QType.SINGLE,
    stem: 'A pipeline must scan datasets for credit-card numbers and redact them before storage. Which service should you use?',
    options: opts4(
      'Sensitive Data Protection (Cloud DLP)',
      'Cloud Monitoring',
      'Cloud Composer only',
      'BigQuery slots'
    ),
    correct: ['a'],
    explanation: 'Cloud DLP detects sensitive infoTypes (like credit-card numbers) and can redact/mask/tokenize them. Monitoring/Composer/slots do not perform sensitive-data discovery and redaction.',
    references: [REF_DLP]
  },
  {
    domain: MAINTAIN, difficulty: 3, type: QType.SINGLE,
    stem: 'You must restrict a data engineer to run queries but not delete datasets in a BigQuery project. Which IAM approach is correct?',
    options: opts4(
      'Grant a least-privilege role (e.g., jobUser + dataViewer) instead of Owner/Editor',
      'Grant project Owner',
      'Grant Editor at the organization level',
      'Use a shared password'
    ),
    correct: ['a'],
    explanation: 'Assigning narrowly scoped roles (run jobs + read data) follows least privilege and prevents destructive actions. Owner/Editor are over-privileged, and shared passwords are an anti-pattern.',
    references: [REF_IAM]
  },
  {
    domain: MAINTAIN, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL good practices for automating recurring data workloads.',
    options: opts4(
      'Use Cloud Composer/Workflows for dependency-aware orchestration',
      'Implement retries with backoff and alerting on failures',
      'Hardcode credentials in DAG files',
      'Use service accounts with least privilege'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Orchestration with dependencies, retries/alerting, and least-privilege service accounts are sound automation practices. Hardcoding credentials in DAGs is a serious security anti-pattern.',
    references: [REF_COMPOSER, REF_IAM]
  },
  {
    domain: MAINTAIN, difficulty: 3, type: QType.SINGLE,
    stem: 'A nightly Composer DAG that loads BigQuery occasionally fails when an upstream file is late. What is the most robust fix?',
    options: opts4(
      'Add a sensor/poke for the file with a timeout and retry policy',
      'Always run at a fixed time and ignore missing files',
      'Disable the DAG',
      'Increase Bigtable nodes'
    ),
    correct: ['a'],
    explanation: 'An Airflow sensor waits for the upstream file (with timeout and retries) so the load runs only when data is ready. Ignoring missing files or disabling the DAG does not solve the dependency; Bigtable is unrelated.',
    references: [REF_COMPOSER]
  },
  {
    domain: MAINTAIN, difficulty: 2, type: QType.SINGLE,
    stem: 'Which service do you use to alert when a Dataflow job’s data freshness/system lag exceeds an SLA?',
    options: opts4(
      'Cloud Monitoring alerting policies',
      'Cloud KMS',
      'Data Catalog',
      'Cloud Scheduler'
    ),
    correct: ['a'],
    explanation: 'Cloud Monitoring exposes Dataflow metrics like data freshness/system lag and supports alerting policies against SLAs. The other services do not provide metric alerting.',
    references: [REF_MONITORING]
  },
  {
    domain: MAINTAIN, difficulty: 4, type: QType.SINGLE,
    stem: 'You need lightweight serverless orchestration to chain a few Cloud Run and BigQuery API calls with conditional logic, without managing Airflow. Which service is best?',
    options: opts4(
      'Workflows',
      'Cloud Composer',
      'Bigtable',
      'Pub/Sub Lite'
    ),
    correct: ['a'],
    explanation: 'Workflows is a serverless orchestrator for chaining Google Cloud/HTTP APIs with conditions and retries, lighter than managing Composer. Bigtable and Pub/Sub Lite are not orchestrators.',
    references: [REF_WORKFLOWS]
  },
  {
    domain: MAINTAIN, difficulty: 3, type: QType.SINGLE,
    stem: 'To meet compliance you must rotate the keys protecting BigQuery tables every 90 days. What should you configure?',
    options: opts4(
      'CMEK with a Cloud KMS rotation schedule',
      'Google-managed default keys only',
      'No encryption',
      'Bucket-level ACLs'
    ),
    correct: ['a'],
    explanation: 'CMEK with a Cloud KMS automatic rotation schedule enforces periodic key rotation for BigQuery data. Default keys cannot be rotated on your schedule, and ACLs/no encryption do not meet the requirement.',
    references: [REF_CMEK]
  },
  {
    domain: MAINTAIN, difficulty: 3, type: QType.SINGLE,
    stem: 'Periodically testing restores from backups is required to validate a data platform’s recovery objectives.',
    options: opts4('True', 'False', '', '').slice(0, 2),
    correct: ['a'],
    explanation: 'True. Untested backups can fail at recovery time; periodic restore testing validates that RPO/RTO objectives are actually achievable.',
    references: [REF_DR]
  },
  {
    domain: MAINTAIN, difficulty: 2, type: QType.SINGLE,
    stem: 'Which is the lowest-overhead way to run a transformation SQL statement every morning in BigQuery?',
    options: opts4(
      'A BigQuery scheduled query',
      'A persistent VM running cron',
      'Manual execution daily',
      'A Dataproc cluster left running'
    ),
    correct: ['a'],
    explanation: 'BigQuery scheduled queries run recurring SQL with no infrastructure. A persistent VM or running Dataproc cluster adds cost/ops, and manual runs are unreliable.',
    references: [REF_BQ]
  },
  {
    domain: MAINTAIN, difficulty: 3, type: QType.SINGLE,
    stem: 'To track data lineage and discover datasets across the org with searchable metadata and tags, which service should you adopt?',
    options: opts4(
      'Data Catalog (within Dataplex)',
      'Cloud Scheduler',
      'Pub/Sub',
      'Cloud SQL'
    ),
    correct: ['a'],
    explanation: 'Data Catalog (part of Dataplex) provides searchable metadata, tagging, and discovery, supporting governance and lineage. The other services do not catalog or discover datasets.',
    references: [REF_DATACATALOG, REF_DATAPLEX]
  }
];

// ───────────────────── Practice Exam 3 ─────────────────────
const P3: Q[] = [
  // ── Designing data processing systems (14) ──
  {
    domain: DESIGN, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which service is the right default for a serverless enterprise data warehouse with standard SQL and ML built in?',
    options: opts4(
      'BigQuery',
      'Cloud SQL',
      'Dataproc Hive',
      'Firestore'
    ),
    correct: ['a'],
    explanation: 'BigQuery is the serverless enterprise warehouse with standard SQL and built-in ML (BigQuery ML). Cloud SQL is OLTP, Dataproc Hive needs cluster management, and Firestore is a document store.',
    references: [REF_BQ, REF_BQ_ML]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE,
    stem: 'A new pipeline must support exactly-once streaming and reuse the same transformation logic in nightly batch. Which engine should you choose?',
    options: opts4(
      'Dataflow with Apache Beam',
      'Dataproc Spark Streaming only',
      'Cloud SQL triggers',
      'Cloud Functions chained manually'
    ),
    correct: ['a'],
    explanation: 'Dataflow/Beam unifies batch and streaming with the same code and supports exactly-once processing semantics. The other options either duplicate logic or do not provide unified exactly-once stream processing.',
    references: [REF_DATAFLOW, REF_BEAM]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE,
    stem: 'An ad-serving system needs sub-10ms key lookups at extremely high QPS with linear scaling. Which database is the best fit?',
    options: opts4(
      'Bigtable',
      'BigQuery',
      'Cloud SQL',
      'Spanner'
    ),
    correct: ['a'],
    explanation: 'Bigtable provides single-digit-millisecond key lookups at very high QPS with linear node scaling. BigQuery is analytical, Cloud SQL does not scale to that QPS, and Spanner targets relational consistency, not raw key-lookup QPS economics.',
    references: [REF_BIGTABLE]
  },
  {
    domain: DESIGN, difficulty: 2, type: QType.SINGLE,
    stem: 'A small relational reporting app needs a managed PostgreSQL with read replicas and minimal ops. Which is simplest?',
    options: opts4(
      'Cloud SQL for PostgreSQL',
      'Bigtable',
      'BigQuery',
      'Firestore'
    ),
    correct: ['a'],
    explanation: 'Cloud SQL for PostgreSQL is managed PostgreSQL with read replicas and minimal operations. Bigtable/Firestore are non-relational and BigQuery is analytical.',
    references: [REF_CLOUDSQL]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL valid reasons to land raw data in Cloud Storage before BigQuery.',
    options: opts4(
      'Durable, low-cost retention of immutable raw data',
      'Replay/reprocess capability if transformations change',
      'It is required because BigQuery cannot load from anywhere else',
      'Decouples ingestion from transformation'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'A Cloud Storage landing zone gives cheap durable raw retention, replay ability, and ingestion/transformation decoupling. BigQuery can also load from other sources, so the absolute-requirement claim is false.',
    references: [REF_GCS, REF_BQ_EXTERNAL]
  },
  {
    domain: DESIGN, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Cloud Spanner provides horizontally scalable, strongly consistent relational storage.',
    options: opts4('True', 'False', '', '').slice(0, 2),
    correct: ['a'],
    explanation: 'True. Spanner combines relational semantics and SQL with horizontal scalability and strong (external) consistency, including multi-region configurations.',
    references: [REF_SPANNER]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE,
    stem: 'You must replicate an on-prem PostgreSQL into BigQuery with near-real-time CDC and minimal engineering. Which service is purpose-built?',
    options: opts4(
      'Datastream',
      'Storage Transfer Service',
      'Pub/Sub Lite',
      'Bigtable replication'
    ),
    correct: ['a'],
    explanation: 'Datastream is serverless CDC/replication from PostgreSQL/MySQL/Oracle into BigQuery and Cloud Storage. Storage Transfer moves objects, and the other services are not CDC tools.',
    references: [REF_DATASTREAM]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE,
    stem: 'Which orchestration choice best handles a 30-task DAG with branching, backfill, and SLAs across BigQuery and Dataflow?',
    options: opts4(
      'Cloud Composer',
      'Cloud Scheduler',
      'A single Cloud Function',
      'Manual runbook'
    ),
    correct: ['a'],
    explanation: 'Cloud Composer (Airflow) is built for large dependency-rich DAGs with branching, backfill, and SLA tracking. Scheduler only triggers, a single function lacks orchestration, and manual runbooks do not scale.',
    references: [REF_COMPOSER]
  },
  {
    domain: DESIGN, difficulty: 4, type: QType.SINGLE,
    stem: 'A predictable analytics team wants cost isolation and guaranteed capacity for BigQuery. Which approach provides this?',
    options: opts4(
      'A dedicated slot reservation/assignment for the team',
      'On-demand pricing shared across all teams',
      'Switching to Bigtable',
      'Disabling query caching'
    ),
    correct: ['a'],
    explanation: 'A dedicated slot reservation/assignment isolates and guarantees compute capacity (and cost) for the team. On-demand is shared/variable, Bigtable is not an analytics warehouse, and cache settings do not isolate capacity.',
    references: [REF_BQ_SLOTS]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE,
    stem: 'A document-oriented catalog with strong per-document security and real-time listeners is required. Which database is most suitable?',
    options: opts4(
      'Firestore',
      'Bigtable',
      'BigQuery',
      'Cloud SQL'
    ),
    correct: ['a'],
    explanation: 'Firestore offers document storage, security rules, and real-time listeners. Bigtable/BigQuery/Cloud SQL lack native document model with real-time listeners and per-document rules.',
    references: [REF_FIRESTORE]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE,
    stem: 'An existing Hive/Spark estate must be migrated quickly with minimal rewrite while moving storage to Cloud Storage. Which target is best?',
    options: opts4(
      'Dataproc reading data from Cloud Storage',
      'Dataflow rewrite in Beam',
      'BigQuery only with no Spark',
      'Cloud SQL'
    ),
    correct: ['a'],
    explanation: 'Dataproc runs existing Hive/Spark with little change and can read from Cloud Storage (decoupled storage). A Beam rewrite is more effort, and BigQuery/Cloud SQL are not Spark engines.',
    references: [REF_DATAPROC, REF_DATAPROC_EPH]
  },
  {
    domain: DESIGN, difficulty: 2, type: QType.SINGLE,
    stem: 'Which design avoids expensive joins in BigQuery for an order with many line items?',
    options: opts4(
      'Model line items as a repeated (ARRAY of STRUCT) field on the order',
      'Store each line item in a separate dataset',
      'Use a single comma-delimited string for items',
      'Duplicate the entire order per line item with no structure'
    ),
    correct: ['a'],
    explanation: 'A repeated ARRAY<STRUCT> of line items keeps the one-to-many relationship in one row, avoiding joins. Separate datasets, delimited strings, or unstructured duplication are inefficient or hard to query.',
    references: [REF_BQ_NESTED]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE,
    stem: 'You must guarantee per-customer event order through ingestion. Which Pub/Sub design element is required?',
    options: opts4(
      'Publish with an ordering key equal to the customer ID and enable message ordering',
      'Use random message IDs',
      'Disable retries',
      'Use a separate topic per message'
    ),
    correct: ['a'],
    explanation: 'A consistent ordering key per customer with message ordering enabled preserves per-customer order. Random IDs, disabling retries, or per-message topics do not provide ordering.',
    references: [REF_PUBSUB_ORDER]
  },
  {
    domain: DESIGN, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL appropriate criteria for choosing BigQuery over Bigtable.',
    options: opts4(
      'You need ad-hoc SQL analytics with joins and aggregations',
      'You need serverless petabyte-scale scans',
      'You need sub-10ms single-key writes at very high QPS',
      'You want built-in SQL ML'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'BigQuery suits ad-hoc SQL analytics, serverless petabyte scans, and in-database SQL ML. Sub-10ms single-key writes at very high QPS is a Bigtable strength, not a BigQuery one.',
    references: [REF_BQ, REF_BIGTABLE]
  },

  // ── Ingesting and processing the data (17) ──
  {
    domain: INGEST, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which service ingests millions of events per second and delivers them to multiple independent subscribers?',
    options: opts4(
      'Pub/Sub',
      'Cloud SQL',
      'BigQuery',
      'Cloud KMS'
    ),
    correct: ['a'],
    explanation: 'Pub/Sub scales to high event rates and fans out to multiple independent subscriptions. The other services are not pub/sub messaging systems.',
    references: [REF_PUBSUB]
  },
  {
    domain: INGEST, difficulty: 3, type: QType.SINGLE,
    stem: 'You need 5-minute tumbling aggregates over event time with correct handling of moderately late events. What Beam construct fits?',
    options: opts4(
      'Fixed (tumbling) 5-minute windows with allowed lateness',
      'A single global window',
      'Sessions windows with no gap',
      'Processing-time sliding windows ignoring event time'
    ),
    correct: ['a'],
    explanation: 'Fixed 5-minute (tumbling) event-time windows with allowed lateness compute periodic aggregates and still handle late data. Global/session/processing-time-only options do not match the requirement.',
    references: [REF_DF_WINDOW, REF_BEAM]
  },
  {
    domain: INGEST, difficulty: 3, type: QType.SINGLE,
    stem: 'After three failed deliveries, problem messages should be moved aside automatically without blocking the subscription. What do you configure?',
    options: opts4(
      'A dead-letter topic with maxDeliveryAttempts = 3',
      'A shorter retention duration',
      'Exactly-once delivery only',
      'A bigger subscriber VM'
    ),
    correct: ['a'],
    explanation: 'A dead-letter topic with a max delivery attempts threshold automatically forwards poison messages so the subscription is not blocked. Retention/delivery-mode/VM size do not isolate poison messages.',
    references: [REF_PUBSUB_DLQ]
  },
  {
    domain: INGEST, difficulty: 2, type: QType.SINGLE,
    stem: 'Which is the recommended modern API for high-throughput, lower-cost streaming into BigQuery?',
    options: opts4(
      'BigQuery Storage Write API',
      'Legacy streaming insertAll only',
      'A Cloud SQL trigger',
      'Bigtable bulk import'
    ),
    correct: ['a'],
    explanation: 'The Storage Write API is the recommended modern, high-throughput, lower-cost streaming ingestion API for BigQuery with optional exactly-once. The other options are legacy or unrelated.',
    references: [REF_BQ_STORAGE_WRITE]
  },
  {
    domain: INGEST, difficulty: 3, type: QType.SINGLE,
    stem: 'A code-free, visually designed batch pipeline with prebuilt transforms is needed by data analysts. Which managed service is appropriate?',
    options: opts4(
      'Cloud Data Fusion',
      'Dataflow SDK in Java',
      'Spark code on Dataproc',
      'A custom Cloud Run service'
    ),
    correct: ['a'],
    explanation: 'Cloud Data Fusion offers a visual, code-free pipeline designer with prebuilt transforms/connectors. The other options require writing code.',
    references: [REF_DATAFUSION]
  },
  {
    domain: INGEST, difficulty: 2, type: QType.SINGLE,
    stem: 'Operators must launch a parameterized Dataflow job from the console with no SDK installed. What do you provide?',
    options: opts4(
      'A Dataflow template',
      'The pipeline source code repo',
      'A Maven build script',
      'A Dockerfile only'
    ),
    correct: ['a'],
    explanation: 'A Dataflow template lets operators launch parameterized jobs from the console/gcloud/API without an SDK or build. Source code or build scripts require a developer environment.',
    references: [REF_DF_TEMPLATE]
  },
  {
    domain: INGEST, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL valid Dataflow performance/cost techniques.',
    options: opts4(
      'Enable Dataflow Shuffle for batch to offload shuffle from VMs',
      'Enable Streaming Engine for streaming jobs',
      'Avoid hot keys that serialize processing',
      'Pin a single small worker with autoscaling disabled for all jobs'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Dataflow Shuffle, Streaming Engine, and avoiding hot keys improve performance/cost. Pinning a single small worker with autoscaling off harms throughput for variable workloads.',
    references: [REF_DF_SHUFFLE, REF_DF_STREAM_ENGINE]
  },
  {
    domain: INGEST, difficulty: 3, type: QType.SINGLE,
    stem: 'You must stop a streaming pipeline so buffered data is fully written before shutdown. Which action achieves this?',
    options: opts4(
      'Drain the Dataflow job',
      'Cancel the Dataflow job',
      'Delete the worker VMs manually',
      'Revoke the service account'
    ),
    correct: ['a'],
    explanation: 'Draining processes and writes in-flight data before stopping, preventing data loss. Cancel discards in-flight data, and deleting VMs/revoking the SA causes abrupt failure.',
    references: [REF_DF_DRAIN]
  },
  {
    domain: INGEST, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A scheduled, managed import of Cloud Storage files into BigQuery on a recurring basis with no code is needed. Which service is intended?',
    options: opts4(
      'BigQuery Data Transfer Service',
      'Datastream',
      'Pub/Sub Lite',
      'Cloud KMS'
    ),
    correct: ['a'],
    explanation: 'The BigQuery Data Transfer Service can schedule recurring managed loads, including from Cloud Storage, with no custom code. Datastream is CDC, and the others are unrelated.',
    references: [REF_DTS]
  },
  {
    domain: INGEST, difficulty: 4, type: QType.SINGLE,
    stem: 'A streaming job’s data freshness keeps rising while CPU is low and one key dominates traffic. What is the most likely root cause and fix?',
    options: opts4(
      'A hot key serializes processing; redistribute/rekey or add salting to parallelize',
      'Workers are overloaded; reduce worker count',
      'BigQuery is the bottleneck; switch sink to Cloud SQL',
      'Pub/Sub retention is too long; shorten it'
    ),
    correct: ['a'],
    explanation: 'Low CPU with rising freshness and a dominant key indicates a hot key serializing work; rekeying/salting parallelizes it. Reducing workers worsens it, and sink/retention changes do not address key skew.',
    references: [REF_DF_WINDOW, REF_BEAM]
  },
  {
    domain: INGEST, difficulty: 3, type: QType.SINGLE,
    stem: 'You must validate that all events conform to a defined structure at publish time. Which Pub/Sub feature is correct?',
    options: opts4(
      'Attach an Avro/Protobuf schema to the topic',
      'Increase ack deadline',
      'Use more subscriptions',
      'Enable longer retention'
    ),
    correct: ['a'],
    explanation: 'A topic schema (Avro/protobuf) validates structure at publish and rejects malformed messages. Ack deadline, subscriptions, and retention do not enforce structure.',
    references: [REF_PUBSUB_SCHEMA]
  },
  {
    domain: INGEST, difficulty: 2, type: QType.SINGLE,
    stem: 'Pub/Sub provides at-least-once delivery by default, so consumers should be idempotent.',
    options: opts4('True', 'False', '', '').slice(0, 2),
    correct: ['a'],
    explanation: 'True. Pub/Sub guarantees at-least-once delivery by default (duplicates are possible), so consumers should be designed to be idempotent.',
    references: [REF_PUBSUB_DELIVERY]
  },
  {
    domain: INGEST, difficulty: 3, type: QType.SINGLE,
    stem: 'A fault-tolerant Spark batch on Dataproc needs to cut compute cost significantly. Which is the best option?',
    options: opts4(
      'Use an autoscaling policy with secondary spot/preemptible workers',
      'Use only on-demand standard workers and the largest machine type',
      'Run it on Cloud SQL',
      'Disable HDFS'
    ),
    correct: ['a'],
    explanation: 'Secondary spot/preemptible workers via autoscaling significantly reduce cost for fault-tolerant batch. Largest on-demand nodes raise cost, Cloud SQL is not a Spark engine, and disabling HDFS breaks the cluster.',
    references: [REF_DATAPROC_PREEMPT]
  },
  {
    domain: INGEST, difficulty: 3, type: QType.SINGLE,
    stem: 'You must run a Spark batch job once with zero cluster management. Which is correct?',
    options: opts4(
      'Dataproc Serverless for Spark',
      'A permanent multi-master Dataproc cluster',
      'BigQuery scheduled query',
      'Cloud Composer task only'
    ),
    correct: ['a'],
    explanation: 'Dataproc Serverless executes a Spark batch with no cluster to manage. A permanent cluster needs management, and the other options do not run Spark.',
    references: [REF_DATAPROC_SERVERLESS]
  },
  {
    domain: INGEST, difficulty: 2, type: QType.SINGLE,
    stem: 'Which is the simplest way to kick off a Dataflow template every 15 minutes with no standing server?',
    options: opts4(
      'Cloud Scheduler triggering the template',
      'A 24/7 cron VM',
      'Manual runs every 15 minutes',
      'A BigQuery view refresh'
    ),
    correct: ['a'],
    explanation: 'Cloud Scheduler triggers the template on schedule with no standing infrastructure. A 24/7 VM wastes cost, manual runs are impractical, and a view does not run pipelines.',
    references: [REF_SCHEDULER]
  },
  {
    domain: INGEST, difficulty: 3, type: QType.SINGLE,
    stem: 'A Beam pipeline must enrich streaming events with reference data updated hourly. Which approach is best?',
    options: opts4(
      'Use a periodically refreshed side input loaded from the reference source',
      'Hardcode the reference data in the pipeline',
      'Query the reference DB once per element synchronously',
      'Disable windowing to load everything together'
    ),
    correct: ['a'],
    explanation: 'A periodically refreshed side input keeps enrichment data reasonably current without per-element lookups. Hardcoding goes stale, per-element synchronous queries are slow, and disabling windowing breaks streaming.',
    references: [REF_BEAM, REF_DF_WINDOW]
  },
  {
    domain: INGEST, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL appropriate ways to make a streaming ingestion path resilient.',
    options: opts4(
      'Make consumers idempotent for at-least-once delivery',
      'Use dead-letter topics for poison messages',
      'Enable autoscaling for the processing job',
      'Assume zero duplicates and skip idempotency'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Idempotent consumers, dead-letter topics, and autoscaling make streaming ingestion resilient. Assuming zero duplicates is unsafe given at-least-once delivery.',
    references: [REF_PUBSUB_DELIVERY, REF_PUBSUB_DLQ]
  },

  // ── Storing the data (13) ──
  {
    domain: STORE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which BigQuery feature prunes data by a date column to reduce bytes scanned and cost?',
    options: opts4(
      'Date/timestamp partitioning',
      'Legacy SQL',
      'A surrogate key',
      'More slots'
    ),
    correct: ['a'],
    explanation: 'Partitioning by a date/timestamp column lets BigQuery skip partitions outside the filter, reducing scanned bytes and cost. The other options do not prune data.',
    references: [REF_BQ_PART]
  },
  {
    domain: STORE, difficulty: 3, type: QType.SINGLE,
    stem: 'A Bigtable cluster shows uneven node CPU because most reads hit recent timestamps with a timestamp-prefixed key. What is the fix?',
    options: opts4(
      'Use field promotion / reverse-timestamp keys to spread hot recent data',
      'Add more column families',
      'Switch to BigQuery for the same low-latency lookups',
      'Reduce the number of nodes'
    ),
    correct: ['a'],
    explanation: 'Timestamp-prefixed keys concentrate recent traffic; promoting an identifying field or reversing the timestamp spreads load. More families, switching to BigQuery, or fewer nodes do not solve the key-design hotspot.',
    references: [REF_BIGTABLE_SCHEMA, REF_BIGTABLE_PERF]
  },
  {
    domain: STORE, difficulty: 2, type: QType.SINGLE,
    stem: 'Data accessed roughly monthly for a year, then deleted. Which Cloud Storage approach minimizes cost while honoring retention?',
    options: opts4(
      'Nearline with a lifecycle rule to delete after 1 year',
      'Standard kept indefinitely',
      'Archive accessed monthly',
      'Delete immediately'
    ),
    correct: ['a'],
    explanation: 'Monthly access fits Nearline, and a lifecycle delete rule enforces the 1-year retention cheaply. Standard kept forever is costly, Archive penalizes monthly access with retrieval costs/minimums, and immediate deletion violates retention.',
    references: [REF_GCS_CLASSES, REF_GCS_LIFECYCLE]
  },
  {
    domain: STORE, difficulty: 3, type: QType.SINGLE,
    stem: 'You need PostgreSQL compatibility with a columnar accelerator for mixed transactional/analytical queries. Which service should you evaluate?',
    options: opts4(
      'AlloyDB for PostgreSQL',
      'Bigtable',
      'Firestore',
      'Cloud Storage'
    ),
    correct: ['a'],
    explanation: 'AlloyDB is PostgreSQL-compatible with a columnar engine accelerating analytical queries alongside transactions. Bigtable/Firestore are non-relational and Cloud Storage is object storage.',
    references: [REF_ALLOYDB]
  },
  {
    domain: STORE, difficulty: 3, type: QType.SINGLE,
    stem: 'A high-write Spanner table keyed by a sequential order number hotspots. Which redesign is recommended?',
    options: opts4(
      'Switch to a UUID or hashed/bit-reversed primary key to distribute writes',
      'Keep sequential key but add read replicas',
      'Store all orders under one parent key',
      'Disable foreign keys'
    ),
    correct: ['a'],
    explanation: 'Sequential keys hotspot one Spanner split; UUID/bit-reversed keys distribute writes across splits. Read replicas, single-parent keys, or disabling FKs do not solve the write hotspot.',
    references: [REF_SPANNER_SCHEMA]
  },
  {
    domain: STORE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which combination most reduces scanned bytes for queries that filter by date and group by region in BigQuery?',
    options: opts4(
      'Partition by date and cluster by region',
      'Cluster by date and partition by row number',
      'No partitioning, SELECT *',
      'Legacy SQL with wildcards'
    ),
    correct: ['a'],
    explanation: 'Partitioning by date prunes by the date filter and clustering by region speeds the group/filter, minimizing scanned bytes. The other options do not optimize for these access patterns.',
    references: [REF_BQ_PART, REF_BQ_CLUSTER]
  },
  {
    domain: STORE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL accurate statements about choosing Bigtable vs Firestore.',
    options: opts4(
      'Bigtable is better for very high-throughput, low-latency wide-column/time-series workloads',
      'Firestore is better for hierarchical documents with mobile sync and security rules',
      'Firestore is the best choice for petabyte analytical SQL scans',
      'Bigtable does not support SQL-style multi-row joins'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Bigtable suits high-throughput wide-column/time-series; Firestore suits documents with mobile sync/security rules; Bigtable lacks SQL joins. Neither is for petabyte analytical SQL — that is BigQuery.',
    references: [REF_BIGTABLE, REF_FIRESTORE]
  },
  {
    domain: STORE, difficulty: 2, type: QType.SINGLE,
    stem: 'An OLTP service needs managed MySQL with point-in-time recovery and high availability. Which is the simplest fit?',
    options: opts4(
      'Cloud SQL for MySQL (HA configuration)',
      'Bigtable',
      'BigQuery',
      'Spanner multi-region'
    ),
    correct: ['a'],
    explanation: 'Cloud SQL for MySQL offers HA and point-in-time recovery for OLTP with minimal ops. Bigtable/BigQuery are not relational MySQL, and multi-region Spanner exceeds this need.',
    references: [REF_CLOUDSQL]
  },
  {
    domain: STORE, difficulty: 4, type: QType.SINGLE,
    stem: 'A 50 TB fact table is usually queried for the last 7 days only. How do you minimize cost while keeping history?',
    options: opts4(
      'Partition by date and (optionally) set partition expiration / use long-term storage for old partitions',
      'Store the whole table unpartitioned and SELECT * each query',
      'Move it to Bigtable',
      'Duplicate it into three datasets'
    ),
    correct: ['a'],
    explanation: 'Date partitioning lets queries scan only recent partitions, and partition expiration plus automatic long-term storage pricing reduces cost for old data. Unpartitioned full scans, Bigtable, or duplication increase cost.',
    references: [REF_BQ_PART, REF_BQ_BEST]
  },
  {
    domain: STORE, difficulty: 3, type: QType.SINGLE,
    stem: 'You must query Avro files already in Cloud Storage from BigQuery without ingesting them. What do you create?',
    options: opts4(
      'A BigQuery external table referencing the Cloud Storage Avro files',
      'A Bigtable import',
      'A Cloud SQL federated query',
      'A Pub/Sub subscription'
    ),
    correct: ['a'],
    explanation: 'A BigQuery external table queries Cloud Storage Avro files in place without loading. The other services do not federate over GCS Avro for BigQuery SQL.',
    references: [REF_BQ_EXTERNAL]
  },
  {
    domain: STORE, difficulty: 2, type: QType.SINGLE,
    stem: 'Clustering and partitioning can be used together on the same BigQuery table.',
    options: opts4('True', 'False', '', '').slice(0, 2),
    correct: ['a'],
    explanation: 'True. A table can be partitioned (e.g., by date) and clustered (e.g., by a high-filter column) simultaneously to maximize pruning and scan reduction.',
    references: [REF_BQ_PART, REF_BQ_CLUSTER]
  },
  {
    domain: STORE, difficulty: 3, type: QType.SINGLE,
    stem: 'A frequently rerun aggregation over a huge table is expensive. Which feature precomputes and incrementally refreshes results?',
    options: opts4(
      'Materialized view',
      'A scheduled CREATE TABLE AS SELECT only',
      'Coldline storage',
      'Disabling the cache'
    ),
    correct: ['a'],
    explanation: 'A materialized view precomputes and incrementally maintains the aggregate, transparently lowering cost. A scheduled CTAS is not auto-incremental, and storage class/cache settings do not precompute results.',
    references: [REF_BQ_MV]
  },
  {
    domain: STORE, difficulty: 3, type: QType.SINGLE,
    stem: 'Which is the best store for a 100k-writes/sec sensor feed needing fast recent-time-range reads per sensor?',
    options: opts4(
      'Bigtable with sensorId#reverseTimestamp row keys',
      'Cloud SQL single instance',
      'BigQuery with per-row streaming and no partitioning',
      'Firestore one collection of all readings'
    ),
    correct: ['a'],
    explanation: 'Bigtable sustains very high write rates and fast range scans; sensorId#reverseTimestamp keys avoid hotspots and serve recent data efficiently. Cloud SQL/Firestore cannot sustain that rate well and unpartitioned BigQuery streaming is costly here.',
    references: [REF_BIGTABLE_SCHEMA]
  },

  // ── Preparing and using data for analysis (10) ──
  {
    domain: ANALYZE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which lets you create a k-means clustering model using only SQL inside the warehouse?',
    options: opts4(
      'BigQuery ML',
      'Cloud SQL ML',
      'Bigtable ML',
      'Dataproc ML SQL'
    ),
    correct: ['a'],
    explanation: 'BigQuery ML supports k-means (and other models) created with SQL inside BigQuery. The other named services do not offer in-database SQL ML.',
    references: [REF_BQ_ML]
  },
  {
    domain: ANALYZE, difficulty: 3, type: QType.SINGLE,
    stem: 'You must train a large custom deep-learning model with GPUs/TPUs, then serve it with managed endpoints. Which platform fits?',
    options: opts4(
      'Vertex AI',
      'BigQuery ML only',
      'Cloud SQL',
      'Pub/Sub'
    ),
    correct: ['a'],
    explanation: 'Vertex AI provides managed GPU/TPU custom training and managed serving endpoints. BigQuery ML targets SQL models, and the others are not ML platforms.',
    references: [REF_VERTEX]
  },
  {
    domain: ANALYZE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Google tool gives a governed semantic layer (LookML) over BigQuery for consistent metrics?',
    options: opts4(
      'Looker',
      'Cloud Logging',
      'Cloud Scheduler',
      'Data Catalog'
    ),
    correct: ['a'],
    explanation: 'Looker’s LookML provides a governed semantic modeling layer for consistent, reusable metrics on BigQuery. Logging/Scheduler/Data Catalog are not semantic BI layers.',
    references: [REF_LOOKER]
  },
  {
    domain: ANALYZE, difficulty: 3, type: QType.SINGLE,
    stem: 'A team needs Git-versioned, dependency-aware, tested SQL pipelines in BigQuery with CI/CD. Which service is best?',
    options: opts4(
      'Dataform',
      'Cloud Dataprep',
      'Pub/Sub',
      'Cloud Storage'
    ),
    correct: ['a'],
    explanation: 'Dataform provides Git-versioned, dependency-aware, tested SQL transformations with CI/CD in BigQuery. The other services do not provide a managed SQL transformation framework.',
    references: [REF_DATAFORM]
  },
  {
    domain: ANALYZE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL valid BigQuery techniques for restricting sensitive column exposure to analysts.',
    options: opts4(
      'Policy-tag column-level security via Data Catalog',
      'Dynamic data masking with policy tags',
      'Authorized views exposing only non-sensitive columns',
      'Granting bigquery.admin to all analysts'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Policy-tag column security, dynamic masking, and authorized views all restrict sensitive column exposure. Granting bigquery.admin broadly removes restrictions and is over-privileged.',
    references: [REF_BQ_COLUMN_SEC, REF_BQ_AUTH_VIEW]
  },
  {
    domain: ANALYZE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Vertex AI feature provides reproducible, parameterized ML workflow orchestration with lineage?',
    options: opts4(
      'Vertex AI Pipelines',
      'A single manual training script',
      'Cloud Scheduler only',
      'Bigtable'
    ),
    correct: ['a'],
    explanation: 'Vertex AI Pipelines orchestrate reproducible, parameterized ML steps with lineage tracking. Manual scripts/Scheduler/Bigtable do not provide ML pipeline orchestration.',
    references: [REF_VERTEX_PIPE]
  },
  {
    domain: ANALYZE, difficulty: 4, type: QType.SINGLE,
    stem: 'A BigQuery ML classification model has high accuracy but the classes are highly imbalanced. Which evaluation focus is most appropriate?',
    options: opts4(
      'Use precision/recall/ROC-AUC (not just accuracy) and consider class weighting/resampling',
      'Trust accuracy alone since it is high',
      'Increase the dataset region count',
      'Move data to Coldline'
    ),
    correct: ['a'],
    explanation: 'With imbalanced classes, accuracy is misleading; precision/recall/ROC-AUC plus class weighting or resampling give a truer picture. Region count and storage class do not affect model evaluation.',
    references: [REF_BQ_ML]
  },
  {
    domain: ANALYZE, difficulty: 3, type: QType.SINGLE,
    stem: 'Analysts must visually standardize messy date/number formats before BigQuery load, with no coding. Which tool fits best?',
    options: opts4(
      'Cloud Dataprep',
      'Dataflow Java SDK',
      'Spark on Dataproc',
      'Cloud KMS'
    ),
    correct: ['a'],
    explanation: 'Cloud Dataprep enables no-code interactive standardization/cleaning with suggested transforms before loading. Dataflow/Spark require coding and KMS is unrelated.',
    references: [REF_DATAPREP]
  },
  {
    domain: ANALYZE, difficulty: 2, type: QType.SINGLE,
    stem: 'Looker Studio can connect directly to BigQuery to build dashboards without copying data into another store.',
    options: opts4('True', 'False', '', '').slice(0, 2),
    correct: ['a'],
    explanation: 'True. Looker Studio connects directly to BigQuery as a data source, so dashboards query BigQuery without copying data elsewhere.',
    references: [REF_LOOKER]
  },
  {
    domain: ANALYZE, difficulty: 3, type: QType.SINGLE,
    stem: 'You must share only summarized results with a partner team in another project without granting base-table access. Which is cleanest in BigQuery?',
    options: opts4(
      'Create an authorized view of the summary and authorize the partner dataset/project',
      'Grant the partner dataViewer on the raw dataset',
      'Make the dataset public',
      'Email CSV exports each day'
    ),
    correct: ['a'],
    explanation: 'An authorized view exposes only the summary while the partner has no access to base tables, the cleanest cross-project sharing. Raw dataViewer or public access overexpose data, and manual CSVs are error-prone.',
    references: [REF_BQ_AUTH_VIEW]
  },

  // ── Maintaining and automating data workloads (11) ──
  {
    domain: MAINTAIN, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which service centralizes data discovery, metadata, and governance across BigQuery and Cloud Storage?',
    options: opts4(
      'Dataplex (with Data Catalog)',
      'Cloud Scheduler',
      'Pub/Sub',
      'Cloud SQL'
    ),
    correct: ['a'],
    explanation: 'Dataplex with Data Catalog centralizes discovery, metadata, and governance across BigQuery and Cloud Storage. The other services are not governance/catalog tools.',
    references: [REF_DATAPLEX, REF_DATACATALOG]
  },
  {
    domain: MAINTAIN, difficulty: 3, type: QType.SINGLE,
    stem: 'Before loading a dataset to a shared warehouse, you must detect and tokenize emails and national IDs. Which service should you use?',
    options: opts4(
      'Sensitive Data Protection (Cloud DLP)',
      'Cloud Monitoring',
      'Cloud Scheduler',
      'BigQuery slots'
    ),
    correct: ['a'],
    explanation: 'Cloud DLP detects sensitive infoTypes (emails, national IDs) and can tokenize/de-identify them before loading. Monitoring/Scheduler/slots do not perform sensitive-data detection or tokenization.',
    references: [REF_DLP]
  },
  {
    domain: MAINTAIN, difficulty: 3, type: QType.SINGLE,
    stem: 'A service account running a pipeline currently has project Editor. Following least privilege, what should you do?',
    options: opts4(
      'Replace it with narrowly scoped roles for only the resources/actions it needs',
      'Upgrade it to Owner for reliability',
      'Share the key widely so jobs do not break',
      'Grant Editor at the org level'
    ),
    correct: ['a'],
    explanation: 'Least privilege means scoping the service account to only the roles/resources it requires, reducing blast radius. Owner/org-Editor and key sharing increase risk.',
    references: [REF_IAM]
  },
  {
    domain: MAINTAIN, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL recommended practices for resilient automated data pipelines.',
    options: opts4(
      'Idempotent tasks so retries are safe',
      'Alerting on SLA/freshness breaches via Cloud Monitoring',
      'Orchestrate dependencies with Composer or Workflows',
      'Store secrets in plaintext in the repo'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Idempotent tasks, SLA/freshness alerting, and dependency-aware orchestration build resilient pipelines. Plaintext secrets in the repo are a security anti-pattern.',
    references: [REF_COMPOSER, REF_MONITORING]
  },
  {
    domain: MAINTAIN, difficulty: 3, type: QType.SINGLE,
    stem: 'A daily Composer DAG should only start once an upstream partition lands in BigQuery. What is the best mechanism?',
    options: opts4(
      'A sensor that waits for the partition with a timeout and retries',
      'A fixed-time start ignoring readiness',
      'Manual triggering only',
      'Increasing slot reservation'
    ),
    correct: ['a'],
    explanation: 'An Airflow sensor blocks until the upstream partition is present (with timeout/retries), ensuring correctness. Fixed-time or manual starts risk processing missing data; slots are unrelated.',
    references: [REF_COMPOSER]
  },
  {
    domain: MAINTAIN, difficulty: 2, type: QType.SINGLE,
    stem: 'Which service should you use to alert when a BigQuery scheduled query starts failing repeatedly?',
    options: opts4(
      'Cloud Monitoring (with logs-based metrics/alerts)',
      'Cloud KMS',
      'Pub/Sub Lite',
      'Data Catalog'
    ),
    correct: ['a'],
    explanation: 'Cloud Monitoring (often with logs-based metrics) can alert on repeated scheduled-query failures. KMS/Pub/Sub Lite/Data Catalog do not provide failure alerting.',
    references: [REF_MONITORING]
  },
  {
    domain: MAINTAIN, difficulty: 4, type: QType.SINGLE,
    stem: 'You must chain a few API calls (Cloud Run, BigQuery, Pub/Sub) with conditional branching, serverless and lighter than Airflow. Which service is best?',
    options: opts4(
      'Workflows',
      'Cloud Composer',
      'Bigtable',
      'Cloud SQL'
    ),
    correct: ['a'],
    explanation: 'Workflows is a serverless orchestrator for chaining Google Cloud/HTTP APIs with conditional logic, lighter than managed Airflow. Bigtable/Cloud SQL are databases, not orchestrators.',
    references: [REF_WORKFLOWS]
  },
  {
    domain: MAINTAIN, difficulty: 3, type: QType.SINGLE,
    stem: 'Compliance requires customer-controlled, rotatable encryption keys for Cloud Storage data feeding BigQuery. What should you configure?',
    options: opts4(
      'CMEK via Cloud KMS with a rotation period',
      'Default Google-managed keys only',
      'Public bucket access',
      'No encryption at rest'
    ),
    correct: ['a'],
    explanation: 'CMEK with Cloud KMS gives customer-controlled keys with configurable rotation for Cloud Storage (and BigQuery). Default keys are not customer-controlled, and the other options are insecure.',
    references: [REF_CMEK]
  },
  {
    domain: MAINTAIN, difficulty: 3, type: QType.SINGLE,
    stem: 'A disaster recovery plan should define and periodically test RPO and RTO for critical data pipelines.',
    options: opts4('True', 'False', '', '').slice(0, 2),
    correct: ['a'],
    explanation: 'True. DR plans must define RPO/RTO for critical pipelines and validate them through periodic testing to ensure recoverability.',
    references: [REF_DR]
  },
  {
    domain: MAINTAIN, difficulty: 2, type: QType.SINGLE,
    stem: 'Which is the lowest-overhead way to run recurring transformation SQL nightly in BigQuery?',
    options: opts4(
      'BigQuery scheduled queries (or Dataform schedules)',
      'A standing Dataproc cluster running a cron',
      'A 24/7 VM with bq CLI cron',
      'Manual execution each night'
    ),
    correct: ['a'],
    explanation: 'BigQuery scheduled queries (or Dataform schedules) run recurring SQL with no infrastructure to maintain. Standing clusters/VMs add cost and ops; manual runs are unreliable.',
    references: [REF_BQ, REF_DATAFORM]
  },
  {
    domain: MAINTAIN, difficulty: 3, type: QType.SINGLE,
    stem: 'You need org-wide searchable metadata, tags, and lineage to support data governance. Which service should you adopt?',
    options: opts4(
      'Data Catalog (within Dataplex)',
      'Cloud Scheduler',
      'Pub/Sub Lite',
      'Cloud SQL'
    ),
    correct: ['a'],
    explanation: 'Data Catalog (part of Dataplex) provides org-wide searchable metadata, tagging, and lineage for governance. The other services do not catalog metadata or track lineage.',
    references: [REF_DATACATALOG, REF_DATAPLEX]
  }
];

const GCP_PDE_DOMAINS = [
  { name: DESIGN, weight: 22 },
  { name: INGEST, weight: 25 },
  { name: STORE, weight: 20 },
  { name: ANALYZE, weight: 15 },
  { name: MAINTAIN, weight: 18 }
];

const GCP_PDE_EXAMS: { slug: string; code: string; titleSuffix: string; descriptionSuffix: string; questions: Q[] }[] = [
  {
    slug: 'google-professional-data-engineer-p1',
    code: 'PDE-P1',
    titleSuffix: 'Practice Exam 1',
    descriptionSuffix: 'Practice exam 1 of 3 — full 120-minute, 65-question, blueprint-weighted set covering designing data processing systems, ingesting & processing data, storing data, preparing & using data for analysis, and maintaining & automating data workloads.',
    questions: P1
  },
  {
    slug: 'google-professional-data-engineer-p2',
    code: 'PDE-P2',
    titleSuffix: 'Practice Exam 2',
    descriptionSuffix: 'Practice exam 2 of 3 — a second 120-minute, 65-question, blueprint-weighted set.',
    questions: P2
  },
  {
    slug: 'google-professional-data-engineer-p3',
    code: 'PDE-P3',
    titleSuffix: 'Practice Exam 3',
    descriptionSuffix: 'Practice exam 3 of 3 — a third 120-minute, 65-question, blueprint-weighted set.',
    questions: P3
  }
];

const GCP_PDE_BUNDLE = {
  slug: 'google-professional-data-engineer',
  title: 'Google Professional Data Engineer',
  description: 'Unlimited Google Professional Data Engineer practice exam retakes, each drawn fresh from a question pool weighted by the official exam domains — covering designing data processing systems, ingesting & processing data, storing data, preparing & using data for analysis, and maintaining & automating data workloads, aligned to the Google Professional Data Engineer exam domains.',
  price: 2000, // USD 20 — PRACTICE tier
  priceVoucher: 20000 // USD 200 — VOUCHER tier
};

type SeedResult = {
  vendor: 'created' | 'updated';
  exams: { slug: string; questionCount: number; teaserCount: number }[];
  bundle: 'created' | 'updated';
};

/**
 * Idempotent seed for the Google Professional Data Engineer bundle.
 * Safe to call repeatedly — vendor / exam / bundle rows are upserted,
 * and questions tagged `generatedBy: 'manual:gcp-pde-seed'` are deleted
 * and re-created.
 *
 * Pass an existing PrismaClient (lifecycle managed by caller).
 */
export async function seedGcpPde(db: PrismaClient): Promise<SeedResult> {
  const existingVendor = await db.vendor.findUnique({ where: { slug: 'google' } });
  await db.vendor.upsert({
    where: { slug: 'google' },
    update: { name: 'Google Cloud', description: 'Google Cloud certifications — data engineering, analytics, machine learning, and the Google Professional Data Engineer credential.' },
    create: { slug: 'google', name: 'Google Cloud', description: 'Google Cloud certifications — data engineering, analytics, machine learning, and the Google Professional Data Engineer credential.' }
  });
  const vendor = await db.vendor.findUniqueOrThrow({ where: { slug: 'google' } });

  const examResults: SeedResult['exams'] = [];
  const examIds: Record<string, string> = {};

  for (const e of GCP_PDE_EXAMS) {
    const title = `Google Professional Data Engineer — ${e.titleSuffix}`;
    const description = `${e.descriptionSuffix} Aligned to the Google Professional Data Engineer exam domains.`;
    const examData = {
      title,
      code: e.code,
      description,
      level: 'Professional',
      durationMinutes: 120,
      passingScore: 70,
      questionCount: e.questions.length,
      domains: GCP_PDE_DOMAINS,
      published: true
    };
    const exam = await db.exam.upsert({
      where: { slug: e.slug },
      update: examData,
      create: { ...examData, slug: e.slug, vendorId: vendor.id }
    });
    examIds[e.slug] = exam.id;

    await db.question.deleteMany({ where: { examId: exam.id, generatedBy: 'manual:gcp-pde-seed' } });
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
          generatedBy: 'manual:gcp-pde-seed',
          isTeaser: !!q.isTeaser
        }
      });
      if (q.isTeaser) teaserCount++;
    }
    examResults.push({ slug: e.slug, questionCount: e.questions.length, teaserCount });
  }

  const existingBundle = await db.bundle.findUnique({ where: { slug: GCP_PDE_BUNDLE.slug } });
  const bundle = await db.bundle.upsert({
    where: { slug: GCP_PDE_BUNDLE.slug },
    update: {
      title: GCP_PDE_BUNDLE.title,
      description: GCP_PDE_BUNDLE.description,
      price: GCP_PDE_BUNDLE.price,
      priceVoucher: GCP_PDE_BUNDLE.priceVoucher,
      published: true
    },
    create: {
      slug: GCP_PDE_BUNDLE.slug,
      title: GCP_PDE_BUNDLE.title,
      description: GCP_PDE_BUNDLE.description,
      price: GCP_PDE_BUNDLE.price,
      priceVoucher: GCP_PDE_BUNDLE.priceVoucher,
      published: true
    }
  });

  // Replace bundle items deterministically: drop existing, recreate.
  await db.bundleItem.deleteMany({ where: { bundleId: bundle.id } });
  const items = [
    { examSlug: 'google-professional-data-engineer-p1', tier: 'PRACTICE' as const, position: 1 },
    { examSlug: 'google-professional-data-engineer-p2', tier: 'PRACTICE' as const, position: 2 },
    { examSlug: 'google-professional-data-engineer-p3', tier: 'PRACTICE' as const, position: 3 },
    { examSlug: 'google-professional-data-engineer-p1', tier: 'VOUCHER' as const, position: 4 }
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
