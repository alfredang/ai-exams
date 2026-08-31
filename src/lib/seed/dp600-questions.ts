/**
 * DP-600 bundle seed — vendor, three practice-exam variants, bundle,
 * and 195 blueprint-aligned questions. Idempotent: replaces rows
 * tagged `generatedBy: 'manual:dp600-seed'` and upserts catalog rows.
 *
 * Exported as `seedDp600(db)` so the same code path is reachable from
 * the standalone CLI shim (`prisma/seeds/dp600.ts`) and the protected
 * admin API (`/api/admin/seed-dp600`) — letting us bootstrap the
 * production database without redeploying.
 *
 * Question content is authored against the public Microsoft Learn
 * DP-600 study guide and Microsoft Fabric documentation. It is original
 * scenario-based material — not a copy of any real exam — covering the
 * DP-600 "Implementing Analytics Solutions Using Microsoft Fabric"
 * domain blueprint:
 *   - Plan, Implement, and Manage a Solution for Data Analytics — 12% (7/65)
 *   - Prepare and Serve Data                                    — 41% (27/65)
 *   - Implement and Manage Semantic Models                      — 23% (15/65)
 *   - Explore and Analyze Data                                  — 24% (16/65)
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

const PLAN = 'Plan, Implement, and Manage a Solution for Data Analytics';
const PREP = 'Prepare and Serve Data';
const MODEL = 'Implement and Manage Semantic Models';
const EXPLORE = 'Explore and Analyze Data';

const REF_WORKSPACE = { label: 'Microsoft Learn — Workspaces in Microsoft Fabric', url: 'https://learn.microsoft.com/en-us/fabric/fundamentals/workspaces' };
const REF_ADMIN = { label: 'Microsoft Learn — Microsoft Fabric admin overview', url: 'https://learn.microsoft.com/en-us/fabric/admin/admin-overview' };
const REF_CAPACITY = { label: 'Microsoft Learn — Microsoft Fabric capacity', url: 'https://learn.microsoft.com/en-us/fabric/enterprise/licenses' };
const REF_GIT = { label: 'Microsoft Learn — Introduction to Git integration', url: 'https://learn.microsoft.com/en-us/fabric/cicd/git-integration/intro-to-git-integration' };
const REF_DEPLOY = { label: 'Microsoft Learn — Introduction to deployment pipelines', url: 'https://learn.microsoft.com/en-us/fabric/cicd/deployment-pipelines/intro-to-deployment-pipelines' };
const REF_RBAC = { label: 'Microsoft Learn — Roles in workspaces', url: 'https://learn.microsoft.com/en-us/fabric/fundamentals/roles-workspaces' };
const REF_OneLake = { label: 'Microsoft Learn — OneLake, the OneDrive for data', url: 'https://learn.microsoft.com/en-us/fabric/onelake/onelake-overview' };
const REF_LAKEHOUSE = { label: 'Microsoft Learn — What is a lakehouse?', url: 'https://learn.microsoft.com/en-us/fabric/data-engineering/lakehouse-overview' };
const REF_SHORTCUT = { label: 'Microsoft Learn — OneLake shortcuts', url: 'https://learn.microsoft.com/en-us/fabric/onelake/onelake-shortcuts' };
const REF_WAREHOUSE = { label: 'Microsoft Learn — What is data warehousing in Microsoft Fabric?', url: 'https://learn.microsoft.com/en-us/fabric/data-warehouse/data-warehousing' };
const REF_PIPELINE = { label: 'Microsoft Learn — Data pipelines in Data Factory', url: 'https://learn.microsoft.com/en-us/fabric/data-factory/data-factory-overview' };
const REF_DATAFLOW = { label: 'Microsoft Learn — Dataflow Gen2 overview', url: 'https://learn.microsoft.com/en-us/fabric/data-factory/dataflows-gen2-overview' };
const REF_SPARK = { label: 'Microsoft Learn — Apache Spark in Microsoft Fabric', url: 'https://learn.microsoft.com/en-us/fabric/data-engineering/spark-compute' };
const REF_DELTA = { label: 'Microsoft Learn — Delta Lake table optimization', url: 'https://learn.microsoft.com/en-us/fabric/data-engineering/delta-optimization-and-v-order' };
const REF_SQLEP = { label: 'Microsoft Learn — SQL analytics endpoint of the lakehouse', url: 'https://learn.microsoft.com/en-us/fabric/data-engineering/lakehouse-sql-analytics-endpoint' };
const REF_INGEST = { label: 'Microsoft Learn — Options to get data into the lakehouse', url: 'https://learn.microsoft.com/en-us/fabric/data-engineering/load-data-lakehouse' };
const REF_TSQL = { label: 'Microsoft Learn — T-SQL surface area in Fabric Warehouse', url: 'https://learn.microsoft.com/en-us/fabric/data-warehouse/tsql-surface-area' };
const REF_TABLECLONE = { label: 'Microsoft Learn — Clone table in Microsoft Fabric', url: 'https://learn.microsoft.com/en-us/fabric/data-warehouse/clone-table' };
const REF_NOTEBOOK = { label: 'Microsoft Learn — Develop, execute, and manage notebooks', url: 'https://learn.microsoft.com/en-us/fabric/data-engineering/how-to-use-notebook' };
const REF_SECURITY = { label: 'Microsoft Learn — Security for data warehousing', url: 'https://learn.microsoft.com/en-us/fabric/data-warehouse/security' };
const REF_RLS = { label: 'Microsoft Learn — Row-level security in Fabric data warehousing', url: 'https://learn.microsoft.com/en-us/fabric/data-warehouse/row-level-security' };
const REF_SEMANTIC = { label: 'Microsoft Learn — Semantic models in Microsoft Fabric', url: 'https://learn.microsoft.com/en-us/power-bi/connect-data/service-datasets-understand' };
const REF_DIRECTLAKE = { label: 'Microsoft Learn — Direct Lake overview', url: 'https://learn.microsoft.com/en-us/fabric/get-started/direct-lake-overview' };
const REF_STORAGEMODE = { label: 'Microsoft Learn — Storage modes in Power BI Desktop', url: 'https://learn.microsoft.com/en-us/power-bi/transform-model/desktop-storage-mode' };
const REF_DAX = { label: 'Microsoft Learn — DAX overview', url: 'https://learn.microsoft.com/en-us/dax/dax-overview' };
const REF_CALC = { label: 'Microsoft Learn — Calculated columns and measures in DAX', url: 'https://learn.microsoft.com/en-us/power-bi/transform-model/desktop-calculated-columns' };
const REF_CONTEXT = { label: 'Microsoft Learn — DAX filter context and CALCULATE', url: 'https://learn.microsoft.com/en-us/dax/calculate-function-dax' };
const REF_TIME = { label: 'Microsoft Learn — Time intelligence functions in DAX', url: 'https://learn.microsoft.com/en-us/dax/time-intelligence-functions-dax' };
const REF_RELATION = { label: 'Microsoft Learn — Model relationships in Power BI', url: 'https://learn.microsoft.com/en-us/power-bi/transform-model/desktop-relationships-understand' };
const REF_STAR = { label: 'Microsoft Learn — Star schema and the importance for Power BI', url: 'https://learn.microsoft.com/en-us/power-bi/guidance/star-schema' };
const REF_AGG = { label: 'Microsoft Learn — User-defined aggregations', url: 'https://learn.microsoft.com/en-us/power-bi/transform-model/desktop-aggregations' };
const REF_INCREMENTAL = { label: 'Microsoft Learn — Incremental refresh for semantic models', url: 'https://learn.microsoft.com/en-us/power-bi/connect-data/incremental-refresh-overview' };
const REF_OLS = { label: 'Microsoft Learn — Object-level security in Power BI', url: 'https://learn.microsoft.com/en-us/fabric/security/service-admin-object-level-security' };
const REF_KQL = { label: 'Microsoft Learn — Kusto Query Language (KQL) overview', url: 'https://learn.microsoft.com/en-us/kusto/query/' };
const REF_EVENTHOUSE = { label: 'Microsoft Learn — Eventhouse overview', url: 'https://learn.microsoft.com/en-us/fabric/real-time-intelligence/eventhouse' };
const REF_KQLDB = { label: 'Microsoft Learn — Create a KQL database', url: 'https://learn.microsoft.com/en-us/fabric/real-time-intelligence/create-database' };
const REF_VISUAL = { label: 'Microsoft Learn — Visualizations in Power BI reports', url: 'https://learn.microsoft.com/en-us/power-bi/visuals/power-bi-report-visualizations' };
const REF_DAXQUERY = { label: 'Microsoft Learn — DAX queries', url: 'https://learn.microsoft.com/en-us/dax/dax-queries' };
const REF_PROFILE = { label: 'Microsoft Learn — Data profiling in Power Query', url: 'https://learn.microsoft.com/en-us/power-query/data-profiling-tools' };
const REF_PERF = { label: 'Microsoft Learn — Optimization guide for Power BI', url: 'https://learn.microsoft.com/en-us/power-bi/guidance/power-bi-optimization' };
const REF_PARTITION = { label: 'Microsoft Learn — Statistics in Fabric data warehousing', url: 'https://learn.microsoft.com/en-us/fabric/data-warehouse/statistics' };

// Helper to build 4-option SINGLE questions with id 'a','b','c','d'.
const opts4 = (a: string, b: string, c: string, d: string): Opt[] => [
  { id: 'a', text: a }, { id: 'b', text: b }, { id: 'c', text: c }, { id: 'd', text: d }
];

// ───────────────────── Practice Exam 1 ─────────────────────
const P1: Q[] = [
  // ── Plan, Implement, and Manage a Solution for Data Analytics (7) ──
  {
    domain: PLAN, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A data team needs an isolated container to develop and deploy a Fabric analytics solution that groups a lakehouse, notebooks, and reports for one project. Which Fabric object should they create first?',
    options: opts4(
      'A capacity',
      'A workspace',
      'A semantic model',
      'A deployment pipeline'
    ),
    correct: ['b'],
    explanation: 'A workspace is the collaboration container that groups items such as lakehouses, notebooks, and reports for a project. Capacity provides compute and is assigned to a workspace; semantic models and pipelines are created inside a workspace, not before it.',
    references: [REF_WORKSPACE]
  },
  {
    domain: PLAN, difficulty: 3, type: QType.SINGLE,
    stem: 'Your organization wants source control for Fabric items so developers can branch, commit, and review changes to notebooks and semantic models. Which Fabric feature should you configure?',
    options: opts4(
      'Deployment pipelines',
      'Git integration on the workspace',
      'OneLake shortcuts',
      'A data pipeline schedule'
    ),
    correct: ['b'],
    explanation: 'Workspace Git integration connects a workspace to an Azure DevOps or GitHub repository so supported items are version controlled with commits and branches. Deployment pipelines promote content between stages but are not source control.',
    references: [REF_GIT]
  },
  {
    domain: PLAN, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A solution must be promoted from Development to Test to Production with the ability to compare content and assign different data sources per stage. Which Fabric capability is designed for this?',
    options: opts4(
      'Deployment pipelines',
      'Git integration',
      'Workspace roles',
      'OneLake security'
    ),
    correct: ['a'],
    explanation: 'Deployment pipelines provide Development, Test, and Production stages with content comparison and deployment rules that swap data source parameters per stage. Git integration handles source control, not staged promotion.',
    references: [REF_DEPLOY]
  },
  {
    domain: PLAN, difficulty: 2, type: QType.SINGLE,
    stem: 'A user must build and edit lakehouses and reports in a workspace but should not manage workspace access or delete the workspace. Which workspace role grants the least privilege that still meets the need?',
    options: opts4(
      'Viewer',
      'Contributor',
      'Member',
      'Admin'
    ),
    correct: ['b'],
    explanation: 'The Contributor role can create and edit most items but cannot manage workspace access or delete the workspace. Viewer is read-only; Member and Admin add access-management privileges that exceed the requirement.',
    references: [REF_RBAC]
  },
  {
    domain: PLAN, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Microsoft Fabric capacity and licensing.',
    options: opts4(
      'A Fabric (F) SKU capacity provides the compute that powers Fabric workloads in assigned workspaces.',
      'Capacity Units (CUs) are pooled and smoothed so short bursts can exceed the baseline before throttling.',
      'Every individual report viewer always needs a separate paid Power BI Pro license regardless of the capacity SKU.',
      'A trial capacity can be used to evaluate Fabric workloads before purchasing an F SKU.'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'F SKUs supply Fabric compute, CUs are smoothed to absorb bursts, and a trial capacity enables evaluation. With an F64 or larger capacity, free users can consume content, so a paid Pro license per viewer is not always required — option C is false.',
    references: [REF_CAPACITY]
  },
  {
    domain: PLAN, difficulty: 4, type: QType.SINGLE,
    stem: 'A Fabric admin must restrict which security groups can create workspaces and disable export of report data tenant-wide. Where are these controls configured?',
    options: opts4(
      'Individual workspace settings only',
      'The Fabric admin portal tenant settings',
      'The semantic model settings page',
      'The OneLake file explorer'
    ),
    correct: ['b'],
    explanation: 'Tenant-wide governance such as who can create workspaces and whether data export is allowed is configured in the Fabric admin portal tenant settings by a Fabric administrator. Per-workspace settings cannot enforce tenant-wide policy.',
    references: [REF_ADMIN]
  },
  {
    domain: PLAN, difficulty: 3, type: QType.SINGLE,
    stem: 'A single OneLake exists per Microsoft Fabric tenant and is automatically provisioned without the customer creating or managing storage accounts.',
    options: opts4('True', 'False', 'Only with Premium capacity', 'Only when a lakehouse is created'),
    correct: ['a'],
    explanation: 'True. OneLake is a single, unified, tenant-wide data lake automatically provisioned for the tenant — there is one OneLake per tenant and no separate storage accounts to manage, similar to how OneDrive works for files.',
    references: [REF_OneLake]
  },

  // ── Prepare and Serve Data (27) ──
  {
    domain: PREP, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'In what open table format does a Fabric lakehouse store its managed tables in OneLake?',
    options: opts4(
      'Avro',
      'Delta Lake (Parquet + transaction log)',
      'CSV',
      'ORC'
    ),
    correct: ['b'],
    explanation: 'Lakehouse managed tables are stored as Delta Lake tables — Parquet data files plus a transaction log — which provides ACID transactions and time travel over OneLake.',
    references: [REF_LAKEHOUSE]
  },
  {
    domain: PREP, difficulty: 3, type: QType.SINGLE,
    stem: 'You need to query data that physically resides in an Azure Data Lake Storage Gen2 account from a Fabric lakehouse without copying it. Which feature do you use?',
    options: opts4(
      'A Dataflow Gen2 copy',
      'A OneLake shortcut',
      'A data pipeline Copy activity',
      'A SQL analytics endpoint view'
    ),
    correct: ['b'],
    explanation: 'A OneLake shortcut creates a virtual reference to data in ADLS Gen2 (or S3, or another OneLake location) so it can be queried in place without duplicating the data. The other options physically copy data.',
    references: [REF_SHORTCUT]
  },
  {
    domain: PREP, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A lakehouse is automatically provisioned with a read-only T-SQL query surface for reporting and SQL clients. What is this called?',
    options: opts4(
      'The SQL analytics endpoint',
      'A Fabric warehouse',
      'A KQL database',
      'A semantic model'
    ),
    correct: ['a'],
    explanation: 'Every lakehouse exposes an automatically generated SQL analytics endpoint that provides read-only T-SQL access over the Delta tables for reporting and SQL tools. A warehouse, by contrast, supports full read/write T-SQL.',
    references: [REF_SQLEP]
  },
  {
    domain: PREP, difficulty: 3, type: QType.SINGLE,
    stem: 'A team needs full multi-table INSERT, UPDATE, and DELETE T-SQL DML on a relational store in Fabric. Which item should they create?',
    options: opts4(
      'A lakehouse and use its SQL analytics endpoint',
      'A Fabric warehouse',
      'A KQL database',
      'A semantic model in Direct Lake mode'
    ),
    correct: ['b'],
    explanation: 'The Fabric warehouse supports the full read/write T-SQL surface including INSERT, UPDATE, and DELETE. The lakehouse SQL analytics endpoint is read-only, so DML must run through Spark or the warehouse.',
    references: [REF_WAREHOUSE]
  },
  {
    domain: PREP, difficulty: 3, type: QType.SINGLE,
    stem: 'You build a low-code, transformation-heavy ETL flow with a Power Query online editor that lands curated tables in a lakehouse on a schedule. Which Fabric item is this?',
    options: opts4(
      'A notebook',
      'A Dataflow Gen2',
      'A KQL queryset',
      'A semantic model'
    ),
    correct: ['b'],
    explanation: 'Dataflow Gen2 provides the Power Query online experience for low-code data transformation with configurable data destinations such as a lakehouse, and can be scheduled or orchestrated by a pipeline.',
    references: [REF_DATAFLOW]
  },
  {
    domain: PREP, difficulty: 3, type: QType.SINGLE,
    stem: 'You must orchestrate a sequence of activities: copy raw files, run a notebook, then refresh a semantic model, with dependencies and retries. Which Fabric item should you use?',
    options: opts4(
      'A Dataflow Gen2',
      'A data pipeline',
      'A standalone notebook',
      'A KQL queryset'
    ),
    correct: ['b'],
    explanation: 'A data pipeline orchestrates activities (Copy, Notebook, Semantic model refresh, etc.) with dependencies, retries, and scheduling. A dataflow transforms data but does not orchestrate multi-step control flow.',
    references: [REF_PIPELINE]
  },
  {
    domain: PREP, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Loading data into a Fabric lakehouse "Tables" area as Delta automatically makes it queryable through the SQL analytics endpoint.',
    options: opts4('True', 'False', 'Only after manual table creation', 'Only for CSV files'),
    correct: ['a'],
    explanation: 'True. Delta tables placed in the lakehouse Tables area are automatically discovered and exposed as queryable tables on the SQL analytics endpoint with no extra DDL required.',
    references: [REF_SQLEP]
  },
  {
    domain: PREP, difficulty: 3, type: QType.SINGLE,
    stem: 'A large Delta table in a lakehouse has many small files from frequent micro-batch writes, hurting read performance. Which maintenance operation best addresses this?',
    options: opts4(
      'Run OPTIMIZE to compact small files (and benefit from V-Order)',
      'Drop and recreate the table after every write',
      'Switch the table to CSV format',
      'Disable the SQL analytics endpoint'
    ),
    correct: ['a'],
    explanation: 'The Delta OPTIMIZE (table maintenance) operation compacts many small files into fewer larger files and, with V-Order, improves read performance. Recreating tables or changing format is unnecessary and lossy.',
    references: [REF_DELTA]
  },
  {
    domain: PREP, difficulty: 3, type: QType.SINGLE,
    stem: 'A notebook reads a Spark DataFrame and must persist it as a managed Delta table named "sales" in the default lakehouse. Which PySpark call accomplishes this?',
    options: opts4(
      'df.write.format("delta").saveAsTable("sales")',
      'df.toCSV("sales")',
      'df.createView("sales")',
      'df.export("sales.parquet")'
    ),
    correct: ['a'],
    explanation: 'df.write.format("delta").saveAsTable("sales") writes the DataFrame as a managed Delta table registered in the lakehouse metastore. The other calls do not create a managed Delta table.',
    references: [REF_NOTEBOOK]
  },
  {
    domain: PREP, difficulty: 4, type: QType.SINGLE,
    stem: 'A pipeline must load only rows changed since the last successful run from a SQL source into a lakehouse, minimizing data movement. Which approach is most appropriate?',
    options: opts4(
      'Full reload of the source every run',
      'An incremental/watermark pattern using a stored last-loaded value to filter the source query',
      'Export the entire source to CSV nightly',
      'Recreate the lakehouse each run'
    ),
    correct: ['b'],
    explanation: 'An incremental load using a high-water-mark (e.g., a max modified timestamp) filters the source to only new/changed rows and stores the watermark for the next run, minimizing data movement compared with full reloads.',
    references: [REF_PIPELINE, REF_INGEST]
  },
  {
    domain: PREP, difficulty: 3, type: QType.SINGLE,
    stem: 'In a Fabric warehouse you need a zero-copy, point-in-time copy of a table for testing without consuming additional storage for unchanged data. Which T-SQL feature do you use?',
    options: opts4(
      'SELECT INTO a new table',
      'CREATE TABLE AS CLONE OF (table clone)',
      'BACKUP DATABASE',
      'CREATE VIEW'
    ),
    correct: ['b'],
    explanation: 'Fabric warehouse zero-copy clone (CREATE TABLE ... AS CLONE OF) creates a metadata-based point-in-time copy that shares underlying data files until changes occur, so unchanged data is not duplicated. SELECT INTO physically copies all rows.',
    references: [REF_TABLECLONE]
  },
  {
    domain: PREP, difficulty: 2, type: QType.SINGLE,
    stem: 'Which language do you use to author notebook-based data engineering transformations on Spark compute in Fabric?',
    options: opts4(
      'Only T-SQL',
      'PySpark / Spark SQL / Scala / R',
      'Only DAX',
      'Only KQL'
    ),
    correct: ['b'],
    explanation: 'Fabric notebooks run on Apache Spark and support PySpark (Python), Spark SQL, Scala, and SparkR/R for data engineering transformations. DAX and KQL are used in semantic models and KQL databases respectively.',
    references: [REF_SPARK, REF_NOTEBOOK]
  },
  {
    domain: PREP, difficulty: 3, type: QType.SINGLE,
    stem: 'You want to ingest a one-time CSV upload into a lakehouse table quickly with no code. Which built-in lakehouse option is simplest?',
    options: opts4(
      'Write a custom Spark Structured Streaming job',
      'Use the lakehouse "Get data" / file upload then "Load to Tables"',
      'Create an Eventhouse',
      'Build a deployment pipeline'
    ),
    correct: ['b'],
    explanation: 'For a one-time CSV the lakehouse Get data / Upload files experience followed by "Load to Tables" creates a Delta table with no code. Streaming jobs and Eventhouses are for continuous/real-time scenarios.',
    references: [REF_INGEST]
  },
  {
    domain: PREP, difficulty: 4, type: QType.SINGLE,
    stem: 'A warehouse query joining a large fact to a dimension is slow and the query plan shows poor cardinality estimates. Which action most directly improves estimate quality?',
    options: opts4(
      'Create or update statistics on the join/filter columns',
      'Convert all columns to VARCHAR(MAX)',
      'Drop the dimension table',
      'Disable the SQL analytics endpoint'
    ),
    correct: ['a'],
    explanation: 'Accurate statistics on join and filter columns let the optimizer estimate cardinality and choose better plans. Fabric warehouse supports automatic and manual statistics; updating them addresses skewed estimates directly.',
    references: [REF_PARTITION]
  },
  {
    domain: PREP, difficulty: 3, type: QType.SINGLE,
    stem: 'A medallion architecture is implemented in a lakehouse. Which layer typically holds cleansed, conformed, business-ready dimensional tables?',
    options: opts4(
      'Bronze (raw)',
      'Gold (curated/serving)',
      'Silver only, never gold',
      'Staging files folder'
    ),
    correct: ['b'],
    explanation: 'In the medallion pattern, Bronze holds raw ingested data, Silver holds cleansed/conformed data, and Gold holds business-ready, aggregated or dimensional tables used for serving and reporting.',
    references: [REF_LAKEHOUSE]
  },
  {
    domain: PREP, difficulty: 3, type: QType.SINGLE,
    stem: 'You must copy 200 GB from an on-premises SQL Server into OneLake on a schedule. Which Fabric capability provides the managed copy with broad connector support?',
    options: opts4(
      'A DAX query',
      'A Data Factory pipeline Copy activity (with an on-premises data gateway)',
      'A KQL queryset',
      'A semantic model refresh'
    ),
    correct: ['b'],
    explanation: 'A Data Factory pipeline Copy activity with an on-premises data gateway provides a managed, scalable copy from on-prem SQL Server into OneLake with many connectors. DAX/KQL are query languages, not movement tools.',
    references: [REF_PIPELINE]
  },
  {
    domain: PREP, difficulty: 2, type: QType.SINGLE,
    stem: 'A Fabric warehouse and a lakehouse can be queried together in a single T-SQL query by adding both to the same SQL query workspace (cross-database query).',
    options: opts4('True', 'False', 'Only with Spark', 'Only via a pipeline'),
    correct: ['a'],
    explanation: 'True. Fabric supports cross-database (cross-warehouse/lakehouse SQL endpoint) queries within the same workspace using three-part names, so a single T-SQL query can join across a warehouse and a lakehouse.',
    references: [REF_TSQL, REF_WAREHOUSE]
  },
  {
    domain: PREP, difficulty: 3, type: QType.SINGLE,
    stem: 'You need to expose a curated subset of warehouse columns to analysts while hiding the base table structure and some sensitive columns. Which T-SQL object is most appropriate?',
    options: opts4(
      'A view that selects only the allowed columns',
      'A new capacity',
      'A deployment pipeline',
      'A OneLake shortcut'
    ),
    correct: ['a'],
    explanation: 'A view projecting only the permitted columns abstracts the base table and hides sensitive columns; analysts are granted access to the view rather than the base table. Pipelines and capacities are unrelated to column projection.',
    references: [REF_TSQL]
  },
  {
    domain: PREP, difficulty: 4, type: QType.SINGLE,
    stem: 'A regulated workload requires that warehouse query results only return rows belonging to the requesting user\'s region, enforced at the database engine. Which feature should you implement?',
    options: opts4(
      'Row-level security (RLS) with a security predicate function',
      'A Power BI page filter',
      'A bookmark',
      'A shortcut'
    ),
    correct: ['a'],
    explanation: 'Row-level security in the Fabric warehouse uses an inline table-valued function as a security predicate so the engine filters rows by the current user, enforcing access regardless of the client. Report-level filters can be bypassed.',
    references: [REF_RLS]
  },
  {
    domain: PREP, difficulty: 3, type: QType.SINGLE,
    stem: 'A Dataflow Gen2 must write its output to a lakehouse table that is fully replaced on each run. Which destination update method should you choose?',
    options: opts4(
      'Append',
      'Replace',
      'No destination',
      'Merge on a key'
    ),
    correct: ['b'],
    explanation: 'The Replace update method overwrites the destination table contents each run, which matches a full-refresh requirement. Append adds rows; merge upserts by key — neither performs a full replace.',
    references: [REF_DATAFLOW]
  },
  {
    domain: PREP, difficulty: 3, type: QType.SINGLE,
    stem: 'You must schedule a notebook to run every night and be retried on transient failure as part of a broader load. What is the recommended way to operationalize it?',
    options: opts4(
      'Manually run the notebook each night',
      'Add a Notebook activity to a scheduled data pipeline with retry settings',
      'Use a DAX measure',
      'Use object-level security'
    ),
    correct: ['b'],
    explanation: 'Wrapping the notebook in a Notebook activity inside a scheduled data pipeline provides scheduling, dependency control, and retry on transient failures — the recommended operationalization pattern.',
    references: [REF_PIPELINE, REF_NOTEBOOK]
  },
  {
    domain: PREP, difficulty: 2, type: QType.SINGLE,
    stem: 'Which storage location underpins lakehouses, warehouses, and KQL databases so data is not duplicated across engines in Fabric?',
    options: opts4(
      'Each item uses its own isolated storage account',
      'OneLake (a single logical data lake for the tenant)',
      'Local notebook disk',
      'An external S3 bucket only'
    ),
    correct: ['b'],
    explanation: 'All Fabric data items store data in OneLake, the single logical lake for the tenant, so engines can share the same Delta data without copying it between separate storage accounts.',
    references: [REF_OneLake]
  },
  {
    domain: PREP, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL valid ways to get data into a Fabric lakehouse.',
    options: opts4(
      'Dataflow Gen2 with a lakehouse destination',
      'A data pipeline Copy activity',
      'A Spark notebook writing Delta tables',
      'Editing a Power BI visual title'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Dataflows Gen2, pipeline Copy activities, and Spark notebooks are all supported ingestion paths into a lakehouse. Editing a visual title is a report formatting action and does not load data.',
    references: [REF_INGEST]
  },
  {
    domain: PREP, difficulty: 3, type: QType.SINGLE,
    stem: 'You want analysts to query the lakehouse with T-SQL tools like SSMS without granting Spark access. Which connection target do you give them?',
    options: opts4(
      'The lakehouse SQL analytics endpoint connection string',
      'The Spark pool admin URL',
      'The OneLake file path',
      'The deployment pipeline URL'
    ),
    correct: ['a'],
    explanation: 'The SQL analytics endpoint provides a T-SQL connection string usable by SSMS and other SQL clients for read-only querying of the lakehouse, without requiring Spark access.',
    references: [REF_SQLEP]
  },
  {
    domain: PREP, difficulty: 3, type: QType.SINGLE,
    stem: 'During preparation you must standardize inconsistent country codes and trim whitespace across millions of rows with reusable, low-code steps shared by several destinations. Which tool fits best?',
    options: opts4(
      'A Dataflow Gen2 with Power Query transformations',
      'A single ad-hoc T-SQL SELECT',
      'A Power BI bookmark',
      'A KQL update policy'
    ),
    correct: ['a'],
    explanation: 'Dataflow Gen2 with Power Query provides reusable, low-code transformation steps (replace values, trim, etc.) that can be applied at scale and reused, which fits standardizing codes across many rows and destinations.',
    references: [REF_DATAFLOW]
  },
  {
    domain: PREP, difficulty: 4, type: QType.SINGLE,
    stem: 'A warehouse load must be transactional so a failed multi-statement batch leaves no partial data. Which T-SQL construct ensures atomicity in a Fabric warehouse?',
    options: opts4(
      'Wrapping the statements in BEGIN TRANSACTION / COMMIT (with rollback on error)',
      'Running each statement in a separate session',
      'Disabling logging',
      'Using a Power BI measure'
    ),
    correct: ['a'],
    explanation: 'Fabric warehouse supports multi-table transactions; wrapping DML in an explicit transaction with rollback on error guarantees all-or-nothing application so failures leave no partial data.',
    references: [REF_TSQL]
  },
  {
    domain: PREP, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Fabric item is purpose-built to store and query high-volume time-series and log/telemetry data using KQL?',
    options: opts4(
      'A Fabric warehouse',
      'An Eventhouse / KQL database',
      'A Dataflow Gen2',
      'A semantic model'
    ),
    correct: ['b'],
    explanation: 'An Eventhouse hosting a KQL database is optimized for high-volume time-series, log, and telemetry data queried with Kusto Query Language. Warehouses and dataflows are not purpose-built for this.',
    references: [REF_EVENTHOUSE]
  },

  // ── Implement and Manage Semantic Models (15) ──
  {
    domain: MODEL, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which semantic model storage mode queries lakehouse/warehouse Delta data directly without import or DirectQuery translation, combining import-like speed with up-to-date data?',
    options: opts4(
      'Import',
      'Direct Lake',
      'DirectQuery',
      'Dual (composite)'
    ),
    correct: ['b'],
    explanation: 'Direct Lake reads Delta/Parquet data directly from OneLake into the analytics engine on demand, delivering import-level performance without scheduled import refresh and without DirectQuery query folding overhead.',
    references: [REF_DIRECTLAKE]
  },
  {
    domain: MODEL, difficulty: 3, type: QType.SINGLE,
    stem: 'You design a semantic model for performance and usability. Which schema design is recommended for Power BI/Fabric semantic models?',
    options: opts4(
      'A single wide flat table',
      'A star schema with fact and dimension tables',
      'A fully normalized snowflake with no dimensions',
      'Many-to-many relationships everywhere'
    ),
    correct: ['b'],
    explanation: 'A star schema (central fact tables related to descriptive dimension tables) is the recommended design for Power BI/Fabric semantic models, optimizing performance, simpler DAX, and usability.',
    references: [REF_STAR]
  },
  {
    domain: MODEL, difficulty: 3, type: QType.SINGLE,
    stem: 'In a model, Sales[Total] should sum SalesAmount and respond to filters and slicers. Should you create a calculated column or a measure?',
    options: opts4(
      'A calculated column, computed row-by-row at refresh',
      'A measure using SUM, evaluated in filter context at query time',
      'A calculated table',
      'A what-if parameter'
    ),
    correct: ['b'],
    explanation: 'An aggregation that must respond to slicers and filters at query time should be a measure (e.g., SUM(Sales[SalesAmount])); it is evaluated in the current filter context. A calculated column is fixed per row at refresh.',
    references: [REF_CALC]
  },
  {
    domain: MODEL, difficulty: 4, type: QType.SINGLE,
    stem: 'Which DAX expression returns total sales ignoring any filters on the Product table but respecting other filters?',
    options: opts4(
      'CALCULATE(SUM(Sales[Amount]), ALL(Product))',
      'SUM(Sales[Amount])',
      'CALCULATE(SUM(Sales[Amount]), Product)',
      'SUMX(ALL(Sales), Sales[Amount])'
    ),
    correct: ['a'],
    explanation: 'CALCULATE(SUM(Sales[Amount]), ALL(Product)) removes filters from the Product table while keeping other filters from the current context. Plain SUM keeps all filters; ALL(Sales) removes far more than intended.',
    references: [REF_CONTEXT]
  },
  {
    domain: MODEL, difficulty: 4, type: QType.SINGLE,
    stem: 'You need a year-to-date sales measure that respects the report\'s date filter and a marked date table. Which DAX function is appropriate?',
    options: opts4(
      'TOTALYTD(SUM(Sales[Amount]), \'Date\'[Date])',
      'SUM(Sales[Amount])',
      'COUNTROWS(Sales)',
      'RELATED(Sales[Amount])'
    ),
    correct: ['a'],
    explanation: 'TOTALYTD (a time-intelligence function) computes a year-to-date aggregation over a date column from a proper date table, respecting the current filter context. The other functions do not compute YTD.',
    references: [REF_TIME]
  },
  {
    domain: MODEL, difficulty: 3, type: QType.SINGLE,
    stem: 'Two tables relate on CustomerKey but the relationship arrow shows "inactive". To use it within a specific measure, which DAX function activates it for that calculation?',
    options: opts4(
      'USERELATIONSHIP inside CALCULATE',
      'RELATEDTABLE',
      'TREATAS without arguments',
      'KEEPFILTERS'
    ),
    correct: ['a'],
    explanation: 'USERELATIONSHIP, used as a CALCULATE modifier, activates an inactive relationship for the duration of that calculation, letting one measure use an alternative path between the tables.',
    references: [REF_RELATION]
  },
  {
    domain: MODEL, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'In a one-to-many relationship the filter, by default, propagates from the one-side dimension to the many-side fact table.',
    options: opts4('True', 'False', 'Only if bidirectional', 'Only in DirectQuery'),
    correct: ['a'],
    explanation: 'True. By default the single (one) side filters the many side. Filtering from the many side back to the one side requires bidirectional cross-filtering, which is not the default.',
    references: [REF_RELATION]
  },
  {
    domain: MODEL, difficulty: 4, type: QType.SINGLE,
    stem: 'A very large Direct Lake model has slow visuals over a multi-billion-row fact. Which modeling technique pre-summarizes data to speed common queries while keeping detail available?',
    options: opts4(
      'User-defined aggregation tables mapped to the detail fact',
      'Adding more calculated columns',
      'Removing all relationships',
      'Converting all measures to columns'
    ),
    correct: ['a'],
    explanation: 'User-defined aggregations store pre-summarized data that the engine transparently substitutes for matching queries, dramatically speeding common aggregate queries while detail remains for drill-down.',
    references: [REF_AGG]
  },
  {
    domain: MODEL, difficulty: 3, type: QType.SINGLE,
    stem: 'An import semantic model over 5 years of data must refresh quickly each night by only processing recent partitions. Which feature should you configure?',
    options: opts4(
      'Incremental refresh with RangeStart/RangeEnd parameters',
      'Object-level security',
      'A bookmark',
      'A calculated table'
    ),
    correct: ['a'],
    explanation: 'Incremental refresh partitions the table by a date range using RangeStart/RangeEnd parameters so only recent partitions are refreshed, greatly reducing nightly refresh time and resource use.',
    references: [REF_INCREMENTAL]
  },
  {
    domain: MODEL, difficulty: 3, type: QType.SINGLE,
    stem: 'Sales reps must only see rows for their own region in every report built on the shared model, enforced in the model. Which feature do you implement?',
    options: opts4(
      'Row-level security (RLS) roles with a DAX filter and role membership',
      'Object-level security only',
      'A report-level visual filter',
      'A workspace Viewer role'
    ),
    correct: ['a'],
    explanation: 'Semantic-model RLS defines roles with DAX table filters (e.g., Region = USERPRINCIPALNAME() lookup) and maps users to roles, enforcing row filtering for all reports on the model. Visual filters are not security.',
    references: [REF_RLS]
  },
  {
    domain: MODEL, difficulty: 4, type: QType.SINGLE,
    stem: 'Finance users must not even see the existence of a "Salary" column in the shared model, while still using the rest. Which feature meets this requirement?',
    options: opts4(
      'Object-level security (OLS) to hide the column/table for a role',
      'Row-level security',
      'Hiding the column in the report view only',
      'A page-level filter'
    ),
    correct: ['a'],
    explanation: 'Object-level security restricts visibility of specific tables/columns per role so members cannot see or query them — even metadata is hidden. RLS filters rows, not object visibility; report hiding can be bypassed.',
    references: [REF_OLS]
  },
  {
    domain: MODEL, difficulty: 3, type: QType.SINGLE,
    stem: 'A Direct Lake model unexpectedly "falls back" to DirectQuery for some visuals. Which is a common cause to investigate?',
    options: opts4(
      'Exceeding the capacity\'s Direct Lake guardrails (e.g., row/size limits) causing fallback',
      'Too few measures defined',
      'Using a star schema',
      'Having a date table'
    ),
    correct: ['a'],
    explanation: 'Direct Lake has capacity-tied guardrails; when a query exceeds limits (such as model/segment size for the SKU) it can fall back to DirectQuery. Star schemas and date tables are best practices, not causes.',
    references: [REF_DIRECTLAKE]
  },
  {
    domain: MODEL, difficulty: 2, type: QType.SINGLE,
    stem: 'You want a centralized, reusable semantic model that multiple reports and Excel users connect to. What should you do?',
    options: opts4(
      'Publish a shared semantic model and build thin reports with a live connection to it',
      'Duplicate the model into every report file',
      'Use only Excel pivot caches',
      'Store measures in a text file'
    ),
    correct: ['a'],
    explanation: 'Publishing a shared semantic model and connecting reports/Excel via live connection centralizes logic, ensures one version of the truth, and avoids duplicated, drift-prone models.',
    references: [REF_SEMANTIC]
  },
  {
    domain: MODEL, difficulty: 3, type: QType.SINGLE,
    stem: 'A composite model mixes an imported dimension and a DirectQuery fact. Which storage mode for a shared dimension reduces round-trips while still supporting DirectQuery joins?',
    options: opts4(
      'Dual',
      'Import only',
      'DirectQuery only',
      'None — composite models are unsupported'
    ),
    correct: ['a'],
    explanation: 'Dual storage mode lets a table act as Import or DirectQuery depending on the query, reducing source round-trips for cached use while still supporting DirectQuery joins in composite models.',
    references: [REF_STORAGEMODE]
  },
  {
    domain: MODEL, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL recommended practices for an efficient Fabric/Power BI semantic model.',
    options: opts4(
      'Use a star schema with conformed dimensions',
      'Prefer measures over many calculated columns for aggregations',
      'Mark a dedicated date table for time intelligence',
      'Import every raw source column even if unused'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Star schema, measure-centric aggregation, and a marked date table are recommended. Importing unused columns bloats the model and refresh — removing unused columns is the recommended practice, so option D is wrong.',
    references: [REF_STAR, REF_PERF]
  },

  // ── Explore and Analyze Data (16) ──
  {
    domain: EXPLORE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which query language do you use to explore data stored in a Fabric KQL database / Eventhouse?',
    options: opts4(
      'DAX',
      'Kusto Query Language (KQL)',
      'MDX',
      'T-SQL only'
    ),
    correct: ['b'],
    explanation: 'Data in a KQL database/Eventhouse is explored using Kusto Query Language (KQL). DAX is for semantic models; MDX is legacy multidimensional; T-SQL targets warehouses/SQL endpoints.',
    references: [REF_KQL]
  },
  {
    domain: EXPLORE, difficulty: 3, type: QType.SINGLE,
    stem: 'In KQL, which operator filters rows to those matching a predicate, analogous to SQL WHERE?',
    options: opts4(
      'project',
      'where',
      'summarize',
      'render'
    ),
    correct: ['b'],
    explanation: 'The KQL "where" operator filters rows by a predicate (like SQL WHERE). "project" selects columns, "summarize" aggregates, and "render" produces a chart from results.',
    references: [REF_KQL]
  },
  {
    domain: EXPLORE, difficulty: 3, type: QType.SINGLE,
    stem: 'You need a count of events grouped by Country in a KQL query. Which operator produces the aggregation?',
    options: opts4(
      'Events | summarize Count = count() by Country',
      'Events | project Country',
      'Events | take 10',
      'Events | sort by Country'
    ),
    correct: ['a'],
    explanation: 'The summarize operator with count() and "by Country" produces grouped aggregation in KQL. project selects columns, take samples rows, and sort orders rows without aggregating.',
    references: [REF_KQL]
  },
  {
    domain: EXPLORE, difficulty: 3, type: QType.SINGLE,
    stem: 'An analyst wants to run a DAX query against a published semantic model to validate a measure outside of a report. Which tool/approach is appropriate in Fabric?',
    options: opts4(
      'The DAX query view / DAX queries against the semantic model',
      'A KQL queryset',
      'A Spark notebook in Scala',
      'A data pipeline Copy activity'
    ),
    correct: ['a'],
    explanation: 'DAX queries (EVALUATE) run against a semantic model — for example via the DAX query view — to validate measures and tables outside reports. KQL and Spark target different stores.',
    references: [REF_DAXQUERY]
  },
  {
    domain: EXPLORE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Power BI visual is most appropriate to show a single key metric against its target with a progress bar style indicator?',
    options: opts4(
      'A KPI / gauge visual',
      'A scatter chart',
      'A matrix',
      'A map'
    ),
    correct: ['a'],
    explanation: 'A KPI or gauge visual is designed to display a single metric versus a target/goal. Scatter charts show correlation, matrices show tabular detail, and maps show geospatial data.',
    references: [REF_VISUAL]
  },
  {
    domain: EXPLORE, difficulty: 3, type: QType.SINGLE,
    stem: 'Before modeling you must quickly assess column data quality (errors, empties, value distribution) for a source. Which Power Query feature gives this fastest?',
    options: opts4(
      'Column quality / column distribution / column profile data profiling tools',
      'A DAX measure',
      'Row-level security',
      'A deployment pipeline'
    ),
    correct: ['a'],
    explanation: 'Power Query data profiling (column quality, column distribution, column profile) gives an immediate view of valid/error/empty percentages and value distribution to assess data quality before modeling.',
    references: [REF_PROFILE]
  },
  {
    domain: EXPLORE, difficulty: 3, type: QType.SINGLE,
    stem: 'A report visual is slow. Performance Analyzer shows most time in the DAX query. Which is the most relevant first optimization?',
    options: opts4(
      'Simplify the measure / reduce visual complexity and cardinality',
      'Change the report theme color',
      'Add more pages to the report',
      'Rename the workspace'
    ),
    correct: ['a'],
    explanation: 'When Performance Analyzer attributes time to the DAX query, optimizing the measure logic, reducing visual complexity, and lowering cardinality directly target the bottleneck. Theming and renaming do not affect query time.',
    references: [REF_PERF]
  },
  {
    domain: EXPLORE, difficulty: 2, type: QType.SINGLE,
    stem: 'In KQL, the "render timechart" instruction visualizes summarized time-series results directly from a query.',
    options: opts4('True', 'False', 'Only in Power BI', 'Only with T-SQL'),
    correct: ['a'],
    explanation: 'True. KQL\'s render operator (e.g., render timechart) visualizes query output, such as time-series, directly within the KQL query experience.',
    references: [REF_KQL]
  },
  {
    domain: EXPLORE, difficulty: 3, type: QType.SINGLE,
    stem: 'You want users to ask natural-language questions of a dataset and get auto-generated visuals. Which Power BI feature provides this?',
    options: opts4(
      'Q&A (natural language query)',
      'Row-level security',
      'Incremental refresh',
      'A deployment pipeline'
    ),
    correct: ['a'],
    explanation: 'The Q&A feature lets users type natural-language questions and returns auto-generated visuals from the semantic model. The other options are security/refresh/ALM features.',
    references: [REF_VISUAL]
  },
  {
    domain: EXPLORE, difficulty: 4, type: QType.SINGLE,
    stem: 'A KQL query must keep only the last 7 days of events relative to now. Which expression filters correctly?',
    options: opts4(
      'Events | where Timestamp > ago(7d)',
      'Events | take 7',
      'Events | project Timestamp',
      'Events | summarize by Timestamp'
    ),
    correct: ['a'],
    explanation: 'where Timestamp > ago(7d) keeps rows newer than 7 days before now using the ago() function. take samples rows, project selects columns, and summarize aggregates — none filter by relative time.',
    references: [REF_KQL]
  },
  {
    domain: EXPLORE, difficulty: 3, type: QType.SINGLE,
    stem: 'An analyst needs ad-hoc tabular exploration of a lakehouse table without building a report. Which low-friction option works directly on the SQL analytics endpoint?',
    options: opts4(
      'Run a T-SQL SELECT in the SQL query editor on the endpoint',
      'Write a Spark Scala job',
      'Create a deployment pipeline',
      'Add object-level security'
    ),
    correct: ['a'],
    explanation: 'The SQL analytics endpoint includes a SQL query editor where analysts can run ad-hoc T-SQL SELECTs against lakehouse tables without authoring a report or Spark code.',
    references: [REF_SQLEP]
  },
  {
    domain: EXPLORE, difficulty: 3, type: QType.SINGLE,
    stem: 'A DAX EVALUATE query should return the top 5 products by total sales. Which function caps the result set?',
    options: opts4(
      'TOPN(5, SUMMARIZE(...), [Total Sales], DESC)',
      'FILTER without arguments',
      'BLANK()',
      'NOW()'
    ),
    correct: ['a'],
    explanation: 'TOPN returns the top N rows of a table ordered by an expression, so TOPN(5, ..., [Total Sales], DESC) yields the top 5 products. FILTER, BLANK, and NOW do not limit to a ranked top-N.',
    references: [REF_DAXQUERY]
  },
  {
    domain: EXPLORE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which visual best compares a measure across many categories ranked from highest to lowest?',
    options: opts4(
      'A sorted bar/column chart',
      'A single-card visual',
      'A gauge',
      'A filled map'
    ),
    correct: ['a'],
    explanation: 'A bar/column chart sorted by the measure clearly compares and ranks a value across many categories. A card shows one number, a gauge shows progress to a goal, and a map shows geography.',
    references: [REF_VISUAL]
  },
  {
    domain: EXPLORE, difficulty: 4, type: QType.SINGLE,
    stem: 'In KQL you must join telemetry to a small lookup table to enrich rows with device metadata. Which operator performs the join?',
    options: opts4(
      'join kind=inner on DeviceId',
      'project DeviceId',
      'render barchart',
      'take 100'
    ),
    correct: ['a'],
    explanation: 'The KQL join operator (e.g., join kind=inner on DeviceId) combines two tables on a key to enrich rows. project, render, and take do not join datasets.',
    references: [REF_KQL]
  },
  {
    domain: EXPLORE, difficulty: 3, type: QType.SINGLE,
    stem: 'Analysts want to explore lakehouse data interactively in a notebook using familiar SQL. Which notebook capability supports this?',
    options: opts4(
      'A %%sql cell running Spark SQL against lakehouse tables',
      'A DAX measure cell',
      'A KQL control command',
      'A deployment rule'
    ),
    correct: ['a'],
    explanation: 'A %%sql magic cell in a Fabric notebook runs Spark SQL against the attached lakehouse tables, enabling interactive SQL exploration alongside PySpark.',
    references: [REF_NOTEBOOK, REF_SPARK]
  },
  {
    domain: EXPLORE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about exploring and analyzing data in Microsoft Fabric.',
    options: opts4(
      'KQL is used to analyze data in a KQL database / Eventhouse.',
      'The SQL analytics endpoint supports ad-hoc T-SQL exploration of a lakehouse.',
      'DAX queries can validate semantic model measures outside reports.',
      'Power BI visuals can only be built from imported CSV files.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'KQL explores KQL databases, the SQL endpoint allows ad-hoc T-SQL on lakehouses, and DAX queries validate model measures. Power BI visuals can be built over many sources (Direct Lake, DirectQuery, import), so option D is false.',
    references: [REF_KQL, REF_SQLEP, REF_DAXQUERY]
  }
];

// ───────────────────── Practice Exam 2 ─────────────────────
const P2: Q[] = [
  // ── Plan, Implement, and Manage a Solution for Data Analytics (7) ──
  {
    domain: PLAN, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A new analytics project needs its own collaboration boundary so a separate team can be assigned access independently of other projects. What should be provisioned?',
    options: opts4(
      'A dedicated workspace for the project',
      'A new tenant',
      'A single semantic model',
      'A OneLake shortcut'
    ),
    correct: ['a'],
    explanation: 'A dedicated workspace provides an isolated collaboration boundary with its own role assignments, which is the standard unit for organizing and securing a project\'s Fabric items.',
    references: [REF_WORKSPACE]
  },
  {
    domain: PLAN, difficulty: 3, type: QType.SINGLE,
    stem: 'Developers want to commit Fabric item changes to a feature branch and open a pull request for review. Which integration enables this workflow?',
    options: opts4(
      'Workspace Git integration with a connected repository',
      'A scheduled data pipeline',
      'OneLake shortcuts',
      'A semantic model refresh schedule'
    ),
    correct: ['a'],
    explanation: 'Workspace Git integration connects the workspace to a repo so item changes can be committed to branches and reviewed via pull requests, enabling a standard developer workflow.',
    references: [REF_GIT]
  },
  {
    domain: PLAN, difficulty: 3, type: QType.SINGLE,
    stem: 'An ALM process must move validated content from Test to Production and substitute the production data source connection automatically. Which Fabric feature handles the source substitution?',
    options: opts4(
      'Deployment pipeline deployment rules / parameter rules',
      'Git branch protection',
      'Workspace Viewer role',
      'A KQL update policy'
    ),
    correct: ['a'],
    explanation: 'Deployment pipelines support deployment/parameter rules that swap data source bindings per stage, so promoting to Production can automatically point items at production data sources.',
    references: [REF_DEPLOY]
  },
  {
    domain: PLAN, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A stakeholder should only view reports in a workspace and never edit or publish content. Which workspace role is correct?',
    options: opts4(
      'Viewer',
      'Contributor',
      'Member',
      'Admin'
    ),
    correct: ['a'],
    explanation: 'The Viewer role grants read-only consumption of content in the workspace with no authoring, publishing, or management rights — exactly matching a view-only stakeholder.',
    references: [REF_RBAC]
  },
  {
    domain: PLAN, difficulty: 3, type: QType.SINGLE,
    stem: 'Which statement correctly describes the relationship between a Fabric capacity and a workspace?',
    options: opts4(
      'A workspace is assigned to a capacity that provides its compute',
      'A capacity is created inside a workspace',
      'Workspaces never need a capacity for Fabric items',
      'Each report has its own capacity'
    ),
    correct: ['a'],
    explanation: 'A workspace is assigned to a Fabric capacity, which supplies the compute (Capacity Units) for the Fabric workloads in that workspace. Capacities are not created within workspaces.',
    references: [REF_CAPACITY, REF_WORKSPACE]
  },
  {
    domain: PLAN, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL tasks that are typically performed by a Fabric administrator in the admin portal.',
    options: opts4(
      'Enable or disable tenant settings such as export and sharing features',
      'Restrict which groups can create workspaces',
      'Monitor capacity usage and metrics',
      'Author DAX measures inside a report'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Tenant settings, workspace-creation restrictions, and capacity monitoring are admin-portal responsibilities. Authoring DAX measures is a developer/report task done in the model, not the admin portal.',
    references: [REF_ADMIN]
  },
  {
    domain: PLAN, difficulty: 3, type: QType.SINGLE,
    stem: 'Deployment pipelines and Git integration solve different problems — staged promotion versus source control — and can be used together.',
    options: opts4('True', 'False', 'Only one may be used per workspace', 'They are the same feature'),
    correct: ['a'],
    explanation: 'True. Git integration provides version control (branches/commits) while deployment pipelines provide staged promotion across Dev/Test/Prod; they are complementary and commonly used together.',
    references: [REF_GIT, REF_DEPLOY]
  },

  // ── Prepare and Serve Data (27) ──
  {
    domain: PREP, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Fabric item provides a Spark-based, schema-on-read environment storing tables as Delta and files in OneLake?',
    options: opts4(
      'A lakehouse',
      'A semantic model',
      'A KQL queryset',
      'A deployment pipeline'
    ),
    correct: ['a'],
    explanation: 'A lakehouse combines a files area and Delta tables in OneLake with Spark and SQL access, supporting schema-on-read for data engineering and analytics.',
    references: [REF_LAKEHOUSE]
  },
  {
    domain: PREP, difficulty: 3, type: QType.SINGLE,
    stem: 'You must reference an Amazon S3 dataset from a lakehouse without copying the data into OneLake. Which feature do you use?',
    options: opts4(
      'A OneLake shortcut to the S3 location',
      'A Dataflow Gen2 Replace destination',
      'A semantic model import',
      'A clone table'
    ),
    correct: ['a'],
    explanation: 'A OneLake shortcut can point to external storage such as Amazon S3, exposing the data virtually for query without copying it into OneLake.',
    references: [REF_SHORTCUT]
  },
  {
    domain: PREP, difficulty: 3, type: QType.SINGLE,
    stem: 'A read-only T-SQL consumer reports a new lakehouse table is missing on the SQL analytics endpoint shortly after a Spark write. What is the typical explanation?',
    options: opts4(
      'The endpoint never shows Spark-created tables',
      'There is a brief metadata sync; the table appears after sync completes (or can be refreshed)',
      'Delta tables are not supported by the endpoint',
      'You must rebuild the lakehouse'
    ),
    correct: ['b'],
    explanation: 'The SQL analytics endpoint syncs lakehouse table metadata; newly written Delta tables appear once that sync completes (and can be refreshed). The endpoint does support Spark-created Delta tables.',
    references: [REF_SQLEP]
  },
  {
    domain: PREP, difficulty: 3, type: QType.SINGLE,
    stem: 'A relational data store in Fabric must support stored procedures and full DML for an ELT process. Which item is appropriate?',
    options: opts4(
      'A Fabric warehouse',
      'A lakehouse SQL analytics endpoint',
      'A KQL database',
      'A semantic model'
    ),
    correct: ['a'],
    explanation: 'The Fabric warehouse supports the full T-SQL surface including stored procedures and DML, suitable for ELT. The lakehouse SQL endpoint is read-only.',
    references: [REF_WAREHOUSE, REF_TSQL]
  },
  {
    domain: PREP, difficulty: 3, type: QType.SINGLE,
    stem: 'You need reusable, low-code transformations with merge/append and parameterized queries landing into a warehouse. Which Fabric item is best suited?',
    options: opts4(
      'A Dataflow Gen2',
      'A KQL queryset',
      'A bookmark',
      'A semantic model'
    ),
    correct: ['a'],
    explanation: 'Dataflow Gen2 provides Power Query low-code transformations (merge, append, parameters) and can target a warehouse as the destination, making it the best fit.',
    references: [REF_DATAFLOW]
  },
  {
    domain: PREP, difficulty: 3, type: QType.SINGLE,
    stem: 'A nightly process must run a Dataflow, then a notebook, only if the dataflow succeeds. Which Fabric construct expresses this dependency?',
    options: opts4(
      'A data pipeline with activities and on-success dependency',
      'Two unrelated scheduled items',
      'A single DAX query',
      'A workspace role assignment'
    ),
    correct: ['a'],
    explanation: 'A data pipeline lets you chain a Dataflow activity to a Notebook activity with an on-success dependency, ensuring the notebook runs only after the dataflow succeeds.',
    references: [REF_PIPELINE]
  },
  {
    domain: PREP, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'OneLake stores data in open Delta/Parquet format, allowing multiple Fabric engines to use the same copy of data.',
    options: opts4('True', 'False', 'Only Parquet, never Delta', 'Only for warehouses'),
    correct: ['a'],
    explanation: 'True. OneLake uses open Delta/Parquet formats so lakehouse, warehouse, and other engines can operate on the same physical data without duplicating it.',
    references: [REF_OneLake, REF_DELTA]
  },
  {
    domain: PREP, difficulty: 4, type: QType.SINGLE,
    stem: 'Read performance on a lakehouse Delta table degrades over time despite OPTIMIZE. Which additional Delta maintenance reclaims space from obsolete files?',
    options: opts4(
      'VACUUM to remove files no longer referenced beyond the retention period',
      'Convert the table to CSV',
      'Delete the lakehouse',
      'Disable V-Order permanently'
    ),
    correct: ['a'],
    explanation: 'VACUUM removes data files no longer referenced by the Delta log beyond the retention threshold, reclaiming storage and helping performance after many rewrites. OPTIMIZE compacts; VACUUM cleans up.',
    references: [REF_DELTA]
  },
  {
    domain: PREP, difficulty: 3, type: QType.SINGLE,
    stem: 'In a notebook you must read an existing lakehouse Delta table named "customer" into a DataFrame. Which PySpark call is correct?',
    options: opts4(
      'spark.read.table("customer")',
      'spark.write.csv("customer")',
      'spark.delete("customer")',
      'spark.render("customer")'
    ),
    correct: ['a'],
    explanation: 'spark.read.table("customer") loads the registered lakehouse Delta table into a DataFrame. The other calls write, delete, or are not valid read APIs.',
    references: [REF_NOTEBOOK, REF_SPARK]
  },
  {
    domain: PREP, difficulty: 4, type: QType.SINGLE,
    stem: 'A copy from a SaaS REST API into OneLake must run hourly with parameterized date ranges and monitoring. Which Fabric capability fits best?',
    options: opts4(
      'A parameterized, scheduled data pipeline with a Copy activity',
      'A single manual notebook run',
      'A Power BI bookmark',
      'A semantic model role'
    ),
    correct: ['a'],
    explanation: 'A scheduled data pipeline with a parameterized Copy activity provides hourly runs, parameter passing for date ranges, and built-in monitoring of activity runs.',
    references: [REF_PIPELINE]
  },
  {
    domain: PREP, difficulty: 3, type: QType.SINGLE,
    stem: 'You need to create a development copy of a 2 TB warehouse table to test a transformation without doubling storage. Which feature is most efficient?',
    options: opts4(
      'Zero-copy table clone',
      'SELECT * INTO copy_table',
      'Export to CSV and reimport',
      'Create a Direct Lake model'
    ),
    correct: ['a'],
    explanation: 'A zero-copy clone creates a metadata copy that shares unchanged data files, so testing does not double storage. SELECT INTO and export/reimport physically duplicate all data.',
    references: [REF_TABLECLONE]
  },
  {
    domain: PREP, difficulty: 2, type: QType.SINGLE,
    stem: 'Which area of the lakehouse holds unmanaged files (e.g., raw CSV, JSON) that are not yet Delta tables?',
    options: opts4(
      'The Files section',
      'The Tables section',
      'The semantic model',
      'The deployment pipeline'
    ),
    correct: ['a'],
    explanation: 'The lakehouse Files section stores arbitrary unmanaged files (CSV, JSON, Parquet) while the Tables section holds managed Delta tables exposed to the SQL endpoint.',
    references: [REF_LAKEHOUSE]
  },
  {
    domain: PREP, difficulty: 3, type: QType.SINGLE,
    stem: 'A warehouse query filtering on OrderDate is slow with bad estimates. Statistics on OrderDate are stale. What should you do?',
    options: opts4(
      'Update statistics on OrderDate so the optimizer estimates accurately',
      'Convert OrderDate to text',
      'Remove the WHERE clause',
      'Disable the SQL endpoint'
    ),
    correct: ['a'],
    explanation: 'Updating statistics on the filtered column gives the optimizer accurate cardinality estimates, improving plan quality and query performance. Changing the data type or removing filters is counterproductive.',
    references: [REF_PARTITION]
  },
  {
    domain: PREP, difficulty: 3, type: QType.SINGLE,
    stem: 'In a medallion lakehouse, where should raw, unmodified ingested data land first?',
    options: opts4(
      'The Bronze layer',
      'The Gold layer',
      'The semantic model',
      'A deployment pipeline'
    ),
    correct: ['a'],
    explanation: 'Raw, unmodified data lands in the Bronze layer first; it is later cleansed into Silver and curated into Gold for serving and reporting.',
    references: [REF_LAKEHOUSE]
  },
  {
    domain: PREP, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL true statements about the lakehouse SQL analytics endpoint.',
    options: opts4(
      'It provides read-only T-SQL access over the lakehouse Delta tables.',
      'It is auto-generated for each lakehouse.',
      'It supports cross-database queries within the workspace.',
      'It supports INSERT/UPDATE/DELETE DML on lakehouse tables.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'The endpoint is auto-generated, read-only T-SQL over Delta tables and supports cross-database queries. It does not support write DML — that requires Spark or a warehouse — so option D is false.',
    references: [REF_SQLEP, REF_TSQL]
  },
  {
    domain: PREP, difficulty: 3, type: QType.SINGLE,
    stem: 'A pipeline must overwrite a curated lakehouse table fully each run via a dataflow. Which dataflow destination setting is correct?',
    options: opts4(
      'Replace the destination table',
      'Append rows',
      'Merge on a key',
      'No write at all'
    ),
    correct: ['a'],
    explanation: 'Choosing the Replace update method overwrites the destination each run, matching a full-refresh curated table. Append and merge do not fully replace contents.',
    references: [REF_DATAFLOW]
  },
  {
    domain: PREP, difficulty: 3, type: QType.SINGLE,
    stem: 'Analysts must query a warehouse with SSMS using T-SQL. What do you provide them?',
    options: opts4(
      'The warehouse SQL connection string and appropriate permissions',
      'The Spark pool URL',
      'A KQL cluster URI',
      'A OneLake folder path'
    ),
    correct: ['a'],
    explanation: 'A Fabric warehouse exposes a T-SQL connection string usable by SSMS; with granted permissions analysts can run T-SQL. Spark/KQL endpoints are for different engines.',
    references: [REF_WAREHOUSE, REF_TSQL]
  },
  {
    domain: PREP, difficulty: 4, type: QType.SINGLE,
    stem: 'A compliance rule requires the warehouse engine itself to mask part of an email column for non-privileged users. Which feature should you use?',
    options: opts4(
      'Dynamic data masking on the column',
      'A report-level filter',
      'A bookmark',
      'A OneLake shortcut'
    ),
    correct: ['a'],
    explanation: 'Dynamic data masking applied at the column obscures sensitive values for non-privileged users at query time within the engine, satisfying engine-enforced masking. Report filters can be bypassed.',
    references: [REF_SECURITY]
  },
  {
    domain: PREP, difficulty: 3, type: QType.SINGLE,
    stem: 'You must operationalize an hourly notebook with retries and alerting. What is the recommended approach?',
    options: opts4(
      'Add the notebook to a scheduled pipeline with retry and monitoring',
      'Open and run it manually each hour',
      'Convert it to a DAX measure',
      'Use object-level security'
    ),
    correct: ['a'],
    explanation: 'A scheduled pipeline Notebook activity provides hourly scheduling, retry policy, and run monitoring/alerting — the recommended operationalization rather than manual execution.',
    references: [REF_PIPELINE, REF_NOTEBOOK]
  },
  {
    domain: PREP, difficulty: 2, type: QType.SINGLE,
    stem: 'Which statement about OneLake is correct?',
    options: opts4(
      'There is one OneLake per Fabric tenant, automatically provisioned',
      'Each workspace has its own separate physical lake account to manage',
      'OneLake requires a manually created storage account',
      'OneLake only stores semantic models'
    ),
    correct: ['a'],
    explanation: 'OneLake is a single, automatically provisioned data lake per tenant. Customers do not create or manage separate storage accounts; data items store their data within OneLake.',
    references: [REF_OneLake]
  },
  {
    domain: PREP, difficulty: 4, type: QType.SINGLE,
    stem: 'A warehouse ELT batch must apply several DML statements atomically so a mid-batch error rolls everything back. Which approach is correct?',
    options: opts4(
      'Use an explicit transaction (BEGIN TRAN ... COMMIT/ROLLBACK)',
      'Run statements in autocommit only',
      'Disable transaction log',
      'Use a Power BI measure'
    ),
    correct: ['a'],
    explanation: 'Fabric warehouse supports multi-statement transactions; an explicit transaction with rollback on error guarantees atomic all-or-nothing application of the batch.',
    references: [REF_TSQL]
  },
  {
    domain: PREP, difficulty: 3, type: QType.SINGLE,
    stem: 'You need to ingest continuous event/telemetry streams for near-real-time analytics. Which Fabric store is purpose-built for this?',
    options: opts4(
      'An Eventhouse with a KQL database',
      'A semantic model',
      'A deployment pipeline',
      'A Power BI dashboard tile'
    ),
    correct: ['a'],
    explanation: 'An Eventhouse hosting a KQL database is optimized for high-volume streaming telemetry with fast ingestion and KQL analytics, fitting near-real-time scenarios.',
    references: [REF_EVENTHOUSE, REF_KQLDB]
  },
  {
    domain: PREP, difficulty: 3, type: QType.SINGLE,
    stem: 'To minimize storage and movement, you reference data in ADLS Gen2 from a warehouse/lakehouse for occasional queries. Which feature is most appropriate?',
    options: opts4(
      'A OneLake shortcut',
      'A nightly full export to CSV',
      'A semantic model import',
      'A bookmark'
    ),
    correct: ['a'],
    explanation: 'A OneLake shortcut virtualizes the ADLS Gen2 data so it can be queried in place without copying, minimizing storage and data movement for occasional queries.',
    references: [REF_SHORTCUT]
  },
  {
    domain: PREP, difficulty: 3, type: QType.SINGLE,
    stem: 'A lakehouse table written by frequent streaming micro-batches shows thousands of tiny files. Which Delta operation consolidates them?',
    options: opts4(
      'OPTIMIZE (file compaction)',
      'VACUUM only',
      'DROP TABLE',
      'CREATE VIEW'
    ),
    correct: ['a'],
    explanation: 'OPTIMIZE compacts many small Delta files into fewer larger files, improving read performance. VACUUM removes obsolete files but does not compact active data.',
    references: [REF_DELTA]
  },
  {
    domain: PREP, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Fabric component would you choose for code-first, large-scale distributed transformations in Python?',
    options: opts4(
      'A Spark notebook (PySpark)',
      'A Power BI report',
      'A KQL queryset',
      'A deployment pipeline'
    ),
    correct: ['a'],
    explanation: 'A Spark notebook running PySpark provides code-first, distributed, large-scale transformation on Fabric Spark compute. Reports/KQL/pipelines do not perform code-first Python transformations.',
    references: [REF_NOTEBOOK, REF_SPARK]
  },
  {
    domain: PREP, difficulty: 4, type: QType.SINGLE,
    stem: 'A warehouse view should restrict columns AND the engine must filter rows per user region. Which combination meets both engine-enforced requirements?',
    options: opts4(
      'A column-projecting view plus row-level security predicate',
      'Only a report visual filter',
      'Only a bookmark',
      'Only renaming the workspace'
    ),
    correct: ['a'],
    explanation: 'A view limits columns while a row-level security predicate function filters rows by the current user at the engine — together they enforce both column and row restrictions server-side.',
    references: [REF_TSQL, REF_RLS]
  },
  {
    domain: PREP, difficulty: 3, type: QType.SINGLE,
    stem: 'A team must grant analysts T-SQL read access to specific warehouse schemas but not the entire database. Which approach follows least privilege in a Fabric warehouse?',
    options: opts4(
      'GRANT SELECT on the specific schema/objects to the analyst role',
      'Add analysts as workspace Admins',
      'Disable the SQL analytics endpoint',
      'Share a OneLake shortcut to everything'
    ),
    correct: ['a'],
    explanation: 'Granting SELECT on only the required schema or objects to a database role gives least-privilege T-SQL read access in a Fabric warehouse, whereas workspace Admin grants far broader rights than needed.',
    references: [REF_SECURITY, REF_TSQL]
  },

  // ── Implement and Manage Semantic Models (15) ──
  {
    domain: MODEL, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which storage mode lets a semantic model query lakehouse Delta data with near-import speed and no scheduled import refresh?',
    options: opts4(
      'Direct Lake',
      'Import',
      'DirectQuery',
      'Live connection to Analysis Services only'
    ),
    correct: ['a'],
    explanation: 'Direct Lake reads Delta data directly from OneLake into memory on demand, giving near-import speed without scheduled import refresh or DirectQuery translation overhead.',
    references: [REF_DIRECTLAKE]
  },
  {
    domain: MODEL, difficulty: 3, type: QType.SINGLE,
    stem: 'A model has snowflaked dimensions causing complex DAX and slow visuals. What redesign is recommended?',
    options: opts4(
      'Flatten into a star schema with denormalized dimensions',
      'Add more snowflake levels',
      'Remove the fact table',
      'Use only calculated columns'
    ),
    correct: ['a'],
    explanation: 'Flattening snowflaked dimensions into a star schema simplifies relationships and DAX and improves performance, which is the recommended modeling guidance for Power BI/Fabric.',
    references: [REF_STAR]
  },
  {
    domain: MODEL, difficulty: 3, type: QType.SINGLE,
    stem: 'A KPI should show distinct count of customers responding to filters. Which DAX object/expression is appropriate?',
    options: opts4(
      'A measure: DISTINCTCOUNT(Sales[CustomerKey])',
      'A calculated column counting all rows',
      'A what-if parameter',
      'A bookmark'
    ),
    correct: ['a'],
    explanation: 'A measure using DISTINCTCOUNT evaluates the distinct customer count within the current filter context at query time, which is what a filter-responsive KPI needs.',
    references: [REF_CALC, REF_DAX]
  },
  {
    domain: MODEL, difficulty: 4, type: QType.SINGLE,
    stem: 'You need sales for the same period last year. Which DAX function expresses this most directly?',
    options: opts4(
      'CALCULATE([Sales], SAMEPERIODLASTYEAR(\'Date\'[Date]))',
      'SUM(Sales[Amount])',
      'COUNTROWS(\'Date\')',
      'BLANK()'
    ),
    correct: ['a'],
    explanation: 'CALCULATE with SAMEPERIODLASTYEAR shifts the date filter back one year over a marked date table, producing prior-year values in the current context. Plain SUM/COUNTROWS do not shift time.',
    references: [REF_TIME]
  },
  {
    domain: MODEL, difficulty: 3, type: QType.SINGLE,
    stem: 'A fact relates to Date via OrderDate and ShipDate; only OrderDate is active. A "Shipped Amount by date" measure must use ShipDate. What enables this?',
    options: opts4(
      'CALCULATE([Amount], USERELATIONSHIP(Sales[ShipDate], \'Date\'[Date]))',
      'Deleting the OrderDate relationship',
      'Setting both relationships active',
      'A page filter'
    ),
    correct: ['a'],
    explanation: 'USERELATIONSHIP within CALCULATE temporarily activates the inactive ShipDate relationship for that measure without affecting other measures or deleting the active OrderDate relationship.',
    references: [REF_RELATION, REF_CONTEXT]
  },
  {
    domain: MODEL, difficulty: 3, type: QType.SINGLE,
    stem: 'You want a measure showing each product\'s share of total sales regardless of category slicers. Which pattern is correct?',
    options: opts4(
      'DIVIDE([Sales], CALCULATE([Sales], ALL(Product)))',
      'SUM(Sales[Amount])',
      'COUNT(Product[Name])',
      'NOW()'
    ),
    correct: ['a'],
    explanation: 'Dividing the current [Sales] by CALCULATE([Sales], ALL(Product)) yields each product\'s share of the all-products total, ignoring product filters in the denominator while keeping other context.',
    references: [REF_CONTEXT]
  },
  {
    domain: MODEL, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A measure is evaluated at query time within the current filter context, whereas a calculated column is computed at data refresh and stored per row.',
    options: opts4('True', 'False', 'Both compute at refresh', 'Both compute per visual only'),
    correct: ['a'],
    explanation: 'True. Measures evaluate at query time using filter context; calculated columns are materialized per row during refresh and stored in the model.',
    references: [REF_CALC]
  },
  {
    domain: MODEL, difficulty: 4, type: QType.SINGLE,
    stem: 'A multi-billion-row Direct Lake fact makes summary visuals slow. Which technique pre-aggregates while keeping detail for drill-down?',
    options: opts4(
      'User-defined aggregation tables',
      'More bookmarks',
      'Removing the date table',
      'Converting measures to columns'
    ),
    correct: ['a'],
    explanation: 'Aggregation tables store pre-summarized data the engine substitutes for matching summary queries, accelerating them while detail rows remain for drill-down.',
    references: [REF_AGG]
  },
  {
    domain: MODEL, difficulty: 3, type: QType.SINGLE,
    stem: 'An import model over 7 years must refresh in minutes by only processing recent data. What do you configure?',
    options: opts4(
      'Incremental refresh policy with RangeStart/RangeEnd',
      'Object-level security',
      'A new capacity',
      'A bookmark'
    ),
    correct: ['a'],
    explanation: 'Incremental refresh with RangeStart/RangeEnd parameters partitions historical data so only recent partitions refresh, cutting refresh time substantially.',
    references: [REF_INCREMENTAL]
  },
  {
    domain: MODEL, difficulty: 3, type: QType.SINGLE,
    stem: 'Regional managers must each see only their region\'s rows across all reports built on a shared model. Which feature do you implement in the model?',
    options: opts4(
      'Row-level security roles with DAX filters',
      'Object-level security only',
      'A slicer on every page',
      'Workspace Admin role'
    ),
    correct: ['a'],
    explanation: 'Model RLS roles with DAX filter expressions and role membership enforce per-region row filtering for all reports on the shared model, unlike slicers which users can change.',
    references: [REF_RLS]
  },
  {
    domain: MODEL, difficulty: 4, type: QType.SINGLE,
    stem: 'A "Cost" column must be completely hidden (including metadata) from a contractor role using the shared model. Which feature is required?',
    options: opts4(
      'Object-level security (OLS)',
      'Row-level security',
      'Hiding it in report view',
      'A bookmark'
    ),
    correct: ['a'],
    explanation: 'Object-level security removes the column/table from view and query for the specified role so it is not even discoverable; report-level hiding can be circumvented and RLS only filters rows.',
    references: [REF_OLS]
  },
  {
    domain: MODEL, difficulty: 3, type: QType.SINGLE,
    stem: 'Time intelligence measures return blanks/errors. Which model setup is the most common prerequisite to fix?',
    options: opts4(
      'Have a contiguous, marked date table related to the fact dates',
      'Delete all relationships',
      'Use only calculated columns',
      'Disable the SQL endpoint'
    ),
    correct: ['a'],
    explanation: 'Reliable time intelligence requires a dedicated, contiguous date table marked as a date table and related to the fact date columns; missing this is the most common cause of blank/incorrect results.',
    references: [REF_TIME, REF_RELATION]
  },
  {
    domain: MODEL, difficulty: 2, type: QType.SINGLE,
    stem: 'To avoid duplicated logic across many reports, what is the recommended Fabric/Power BI practice?',
    options: opts4(
      'Build a shared semantic model and connect thin reports to it',
      'Copy the model into each report',
      'Email PBIX files around',
      'Store DAX in spreadsheets'
    ),
    correct: ['a'],
    explanation: 'A single shared semantic model with thin live-connected reports centralizes logic and provides one version of the truth, avoiding duplicate/drifting models.',
    references: [REF_SEMANTIC]
  },
  {
    domain: MODEL, difficulty: 3, type: QType.SINGLE,
    stem: 'In a composite model, a shared dimension is queried both from cache and from a DirectQuery fact. Which storage mode optimizes this dual usage?',
    options: opts4(
      'Dual',
      'Import only',
      'DirectQuery only',
      'Direct Lake only'
    ),
    correct: ['a'],
    explanation: 'Dual storage mode allows a table to behave as Import or DirectQuery depending on the query, reducing source round-trips while still supporting DirectQuery joins in composite models.',
    references: [REF_STORAGEMODE]
  },
  {
    domain: MODEL, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL true statements about Direct Lake semantic models.',
    options: opts4(
      'They read Delta data directly from OneLake without import refresh.',
      'They can fall back to DirectQuery when capacity guardrails are exceeded.',
      'They benefit from a well-designed star schema.',
      'They require exporting all data to CSV first.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Direct Lake reads Delta from OneLake without import refresh, may fall back to DirectQuery beyond guardrails, and benefits from a star schema. No CSV export is required, so option D is false.',
    references: [REF_DIRECTLAKE, REF_STAR]
  },

  // ── Explore and Analyze Data (16) ──
  {
    domain: EXPLORE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which operator in KQL aggregates rows, similar to SQL GROUP BY with aggregate functions?',
    options: opts4(
      'summarize',
      'where',
      'project',
      'take'
    ),
    correct: ['a'],
    explanation: 'The KQL summarize operator groups and aggregates rows (e.g., count(), avg()) similar to SQL GROUP BY. where filters, project selects columns, and take samples rows.',
    references: [REF_KQL]
  },
  {
    domain: EXPLORE, difficulty: 3, type: QType.SINGLE,
    stem: 'A KQL query should return only the 100 most recent events. Which combination is correct?',
    options: opts4(
      'Events | sort by Timestamp desc | take 100',
      'Events | project Timestamp',
      'Events | summarize by Timestamp',
      'Events | render table'
    ),
    correct: ['a'],
    explanation: 'Sorting by Timestamp descending then take 100 returns the 100 most recent events. project/summarize/render do not select the most recent N rows.',
    references: [REF_KQL]
  },
  {
    domain: EXPLORE, difficulty: 3, type: QType.SINGLE,
    stem: 'You must validate a model measure outside any report using a tabular query. Which approach works in Fabric?',
    options: opts4(
      'Run a DAX EVALUATE query against the semantic model',
      'Run a KQL query against the model',
      'Run T-SQL against the model directly',
      'Use a deployment pipeline'
    ),
    correct: ['a'],
    explanation: 'A DAX EVALUATE query executed against the semantic model (e.g., in the DAX query view) returns a table to validate measures outside of a report. KQL/T-SQL do not query semantic models directly.',
    references: [REF_DAXQUERY]
  },
  {
    domain: EXPLORE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which visual best shows the trend of a single measure over continuous time?',
    options: opts4(
      'A line chart',
      'A pie chart',
      'A single card',
      'A table'
    ),
    correct: ['a'],
    explanation: 'A line chart is best for showing how a measure trends over continuous time. Pie charts show parts of a whole, a card a single value, and a table raw detail.',
    references: [REF_VISUAL]
  },
  {
    domain: EXPLORE, difficulty: 3, type: QType.SINGLE,
    stem: 'Before importing, you need a fast assessment of error and empty percentages per column. Which Power Query tool helps most?',
    options: opts4(
      'Column quality data profiling',
      'A DAX measure',
      'Incremental refresh',
      'Object-level security'
    ),
    correct: ['a'],
    explanation: 'Power Query column quality profiling shows valid/error/empty percentages per column, giving a fast pre-import data quality assessment.',
    references: [REF_PROFILE]
  },
  {
    domain: EXPLORE, difficulty: 4, type: QType.SINGLE,
    stem: 'In KQL, you must compute average latency per 5-minute time bin. Which expression is correct?',
    options: opts4(
      'T | summarize avg(Latency) by bin(Timestamp, 5m)',
      'T | project Latency',
      'T | take 5',
      'T | sort by Latency'
    ),
    correct: ['a'],
    explanation: 'summarize avg(Latency) by bin(Timestamp, 5m) buckets rows into 5-minute windows and computes the average per bin — a standard KQL time-series aggregation pattern.',
    references: [REF_KQL]
  },
  {
    domain: EXPLORE, difficulty: 3, type: QType.SINGLE,
    stem: 'Performance Analyzer shows a visual\'s DAX query dominates render time. Which action best targets the problem?',
    options: opts4(
      'Optimize the measure/reduce cardinality and visual complexity',
      'Change the font',
      'Add more report pages',
      'Rename the dataset'
    ),
    correct: ['a'],
    explanation: 'When DAX query time dominates, optimizing the measure logic and reducing cardinality/visual complexity directly reduces query duration. Cosmetic changes do not.',
    references: [REF_PERF]
  },
  {
    domain: EXPLORE, difficulty: 2, type: QType.SINGLE,
    stem: 'KQL\'s "project" operator is used to select and optionally rename a subset of columns.',
    options: opts4('True', 'False', 'Only for numeric columns', 'Only inside summarize'),
    correct: ['a'],
    explanation: 'True. The project operator selects (and can rename/compute) a subset of columns, analogous to SQL SELECT of specific columns.',
    references: [REF_KQL]
  },
  {
    domain: EXPLORE, difficulty: 3, type: QType.SINGLE,
    stem: 'Business users want to type questions in plain English and receive visuals from a semantic model. Which feature provides this?',
    options: opts4(
      'Power BI Q&A',
      'Row-level security',
      'A clone table',
      'A deployment rule'
    ),
    correct: ['a'],
    explanation: 'Power BI Q&A interprets natural-language questions against the semantic model and returns generated visuals, enabling self-service exploration.',
    references: [REF_VISUAL]
  },
  {
    domain: EXPLORE, difficulty: 3, type: QType.SINGLE,
    stem: 'An analyst wants ad-hoc T-SQL exploration of a lakehouse without writing Spark. What should they use?',
    options: opts4(
      'The SQL query editor on the lakehouse SQL analytics endpoint',
      'A PySpark notebook only',
      'A KQL queryset',
      'A deployment pipeline'
    ),
    correct: ['a'],
    explanation: 'The lakehouse SQL analytics endpoint includes a SQL editor for ad-hoc read-only T-SQL exploration of Delta tables without Spark code.',
    references: [REF_SQLEP]
  },
  {
    domain: EXPLORE, difficulty: 4, type: QType.SINGLE,
    stem: 'A DAX query must return the bottom 10 stores by revenue. Which function should you use?',
    options: opts4(
      'TOPN(10, summary, [Revenue], ASC)',
      'SUM(Sales[Revenue])',
      'CALCULATE without filters',
      'BLANK()'
    ),
    correct: ['a'],
    explanation: 'TOPN with ascending order returns the bottom N rows by the expression — TOPN(10, ..., [Revenue], ASC) yields the 10 lowest-revenue stores. SUM/BLANK do not rank-limit.',
    references: [REF_DAXQUERY]
  },
  {
    domain: EXPLORE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which visual best shows the composition of a total across a small number of categories at one point in time?',
    options: opts4(
      'A stacked bar or pie chart',
      'A line chart over time',
      'A KPI card',
      'A scatter plot'
    ),
    correct: ['a'],
    explanation: 'A stacked bar or pie chart conveys composition (parts of a whole) for a small number of categories at a single point in time. Line charts show trends; scatter shows correlation.',
    references: [REF_VISUAL]
  },
  {
    domain: EXPLORE, difficulty: 4, type: QType.SINGLE,
    stem: 'In KQL you must enrich events with a small lookup of region names by RegionId. Which operator is correct?',
    options: opts4(
      'Events | join kind=leftouter (Regions) on RegionId',
      'Events | project RegionId',
      'Events | take 50',
      'Events | render piechart'
    ),
    correct: ['a'],
    explanation: 'The join operator (e.g., kind=leftouter on RegionId) combines events with the Regions lookup to enrich rows. project/take/render do not join tables.',
    references: [REF_KQL]
  },
  {
    domain: EXPLORE, difficulty: 3, type: QType.SINGLE,
    stem: 'Analysts want to explore lakehouse data with SQL inside a notebook alongside Python. Which capability supports this?',
    options: opts4(
      'A Spark SQL (%%sql) cell against the lakehouse',
      'A DAX cell',
      'A KQL control command cell',
      'A deployment rule cell'
    ),
    correct: ['a'],
    explanation: 'A %%sql Spark SQL cell in a Fabric notebook queries the attached lakehouse tables interactively alongside PySpark cells, enabling mixed exploration.',
    references: [REF_NOTEBOOK, REF_SPARK]
  },
  {
    domain: EXPLORE, difficulty: 3, type: QType.SINGLE,
    stem: 'You need to explore high-volume telemetry with sub-second filtering and time-series operators. Which environment is best?',
    options: opts4(
      'A KQL queryset over a KQL database',
      'A Power BI matrix only',
      'A Dataflow Gen2',
      'A deployment pipeline'
    ),
    correct: ['a'],
    explanation: 'A KQL queryset over a KQL database/Eventhouse provides fast, expressive KQL exploration with time-series operators over high-volume telemetry, unlike dataflows or pipelines.',
    references: [REF_KQL, REF_KQLDB]
  },
  {
    domain: EXPLORE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL appropriate Fabric tools for ad-hoc data exploration.',
    options: opts4(
      'KQL queryset for a KQL database',
      'SQL query editor on a lakehouse SQL analytics endpoint',
      'DAX query view against a semantic model',
      'A deployment pipeline for promoting content'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'KQL querysets, the SQL analytics endpoint editor, and the DAX query view are all ad-hoc exploration tools. Deployment pipelines are ALM/promotion, not data exploration, so option D is false.',
    references: [REF_KQL, REF_SQLEP, REF_DAXQUERY]
  }
];

// ───────────────────── Practice Exam 3 ─────────────────────
const P3: Q[] = [
  // ── Plan, Implement, and Manage a Solution for Data Analytics (7) ──
  {
    domain: PLAN, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'To organize Fabric items for a finance analytics initiative and control who can collaborate, what is the primary organizational container you create?',
    options: opts4(
      'A workspace',
      'A capacity unit',
      'A single report',
      'A KQL command'
    ),
    correct: ['a'],
    explanation: 'A workspace is the primary container that organizes Fabric items and controls collaboration via role assignments for an initiative or team.',
    references: [REF_WORKSPACE]
  },
  {
    domain: PLAN, difficulty: 3, type: QType.SINGLE,
    stem: 'A team must track and review changes to notebooks and semantic models using branches and commits. Which feature should be enabled on the workspace?',
    options: opts4(
      'Git integration',
      'A scheduled pipeline',
      'OneLake shortcut',
      'Object-level security'
    ),
    correct: ['a'],
    explanation: 'Workspace Git integration provides version control with branches and commits for supported Fabric items such as notebooks and semantic models.',
    references: [REF_GIT]
  },
  {
    domain: PLAN, difficulty: 3, type: QType.SINGLE,
    stem: 'You must promote a tested solution to production and automatically re-point datasets to the production lakehouse. Which capability provides staged promotion with rules?',
    options: opts4(
      'Deployment pipelines',
      'Git branches only',
      'Workspace Contributor role',
      'A KQL update policy'
    ),
    correct: ['a'],
    explanation: 'Deployment pipelines provide Dev/Test/Prod stages with deployment rules that re-point data sources for the target stage, enabling controlled promotion to production.',
    references: [REF_DEPLOY]
  },
  {
    domain: PLAN, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A user must add and edit items in a workspace but must NOT manage member access. Which role best fits least privilege?',
    options: opts4(
      'Contributor',
      'Viewer',
      'Member',
      'Admin'
    ),
    correct: ['a'],
    explanation: 'Contributor can create and edit items but cannot manage workspace access; Viewer is read-only, while Member and Admin can manage access, exceeding the requirement.',
    references: [REF_RBAC]
  },
  {
    domain: PLAN, difficulty: 3, type: QType.SINGLE,
    stem: 'Why must a workspace be assigned to a Fabric (F) capacity to run Fabric workloads?',
    options: opts4(
      'The capacity supplies the compute (Capacity Units) for the workloads',
      'Capacities store the report visuals',
      'Capacities replace OneLake storage',
      'Capacities are only for user licensing'
    ),
    correct: ['a'],
    explanation: 'A Fabric capacity provides the pooled compute (Capacity Units) that powers Fabric workloads; a workspace must be on a capacity to execute them.',
    references: [REF_CAPACITY]
  },
  {
    domain: PLAN, difficulty: 3, type: QType.SINGLE,
    stem: 'There is exactly one OneLake per Fabric tenant and it is provisioned automatically without managing storage accounts.',
    options: opts4('True', 'False', 'One per workspace', 'One per capacity'),
    correct: ['a'],
    explanation: 'True. OneLake is a single, automatically provisioned data lake per tenant; customers do not create or manage separate storage accounts.',
    references: [REF_OneLake]
  },
  {
    domain: PLAN, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL true statements about Fabric ALM (application lifecycle management).',
    options: opts4(
      'Git integration provides source control for supported items.',
      'Deployment pipelines promote content across Dev/Test/Prod stages.',
      'Deployment rules can swap data sources per stage.',
      'ALM features eliminate the need for any workspace roles.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Git integration is source control, deployment pipelines stage promotion, and deployment rules swap sources. Workspace roles still govern access regardless of ALM, so option D is false.',
    references: [REF_GIT, REF_DEPLOY, REF_RBAC]
  },

  // ── Prepare and Serve Data (27) ──
  {
    domain: PREP, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Fabric item stores managed tables as Delta and arbitrary files together, with Spark and SQL access over OneLake?',
    options: opts4(
      'A lakehouse',
      'A KQL queryset',
      'A semantic model',
      'A deployment pipeline'
    ),
    correct: ['a'],
    explanation: 'A lakehouse combines a Files area for arbitrary files and a Tables area of managed Delta tables in OneLake, accessible via Spark and the SQL analytics endpoint.',
    references: [REF_LAKEHOUSE]
  },
  {
    domain: PREP, difficulty: 3, type: QType.SINGLE,
    stem: 'A team must query data in another Fabric workspace\'s lakehouse without copying it. Which feature is appropriate?',
    options: opts4(
      'A OneLake shortcut to the other lakehouse',
      'A nightly CSV export',
      'A semantic model import',
      'A bookmark'
    ),
    correct: ['a'],
    explanation: 'A OneLake shortcut can reference data in another OneLake location (including another workspace\'s lakehouse) so it is queryable in place without copying.',
    references: [REF_SHORTCUT]
  },
  {
    domain: PREP, difficulty: 3, type: QType.SINGLE,
    stem: 'A read-only reporting consumer needs T-SQL access to lakehouse Delta tables. Which endpoint do you point them to?',
    options: opts4(
      'The lakehouse SQL analytics endpoint',
      'The Spark pool URL',
      'A KQL cluster URI',
      'A deployment pipeline link'
    ),
    correct: ['a'],
    explanation: 'The auto-generated SQL analytics endpoint provides read-only T-SQL over the lakehouse Delta tables for reporting consumers and SQL tools.',
    references: [REF_SQLEP]
  },
  {
    domain: PREP, difficulty: 3, type: QType.SINGLE,
    stem: 'An ELT process needs stored procedures, multi-table transactions, and full DML in a relational engine. Which Fabric item should you create?',
    options: opts4(
      'A Fabric warehouse',
      'A lakehouse SQL endpoint',
      'A semantic model',
      'A KQL database'
    ),
    correct: ['a'],
    explanation: 'The Fabric warehouse supports stored procedures, multi-table transactions, and full DML in T-SQL, fitting ELT. The lakehouse SQL endpoint is read-only.',
    references: [REF_WAREHOUSE, REF_TSQL]
  },
  {
    domain: PREP, difficulty: 3, type: QType.SINGLE,
    stem: 'A business analyst needs to build reusable low-code transformations with merge steps that output to a lakehouse. Which item fits best?',
    options: opts4(
      'A Dataflow Gen2',
      'A KQL queryset',
      'A semantic model',
      'A bookmark'
    ),
    correct: ['a'],
    explanation: 'Dataflow Gen2 (Power Query online) offers reusable low-code transformations including merge and supports a lakehouse destination, fitting the requirement.',
    references: [REF_DATAFLOW]
  },
  {
    domain: PREP, difficulty: 3, type: QType.SINGLE,
    stem: 'You must orchestrate copy → transform notebook → semantic model refresh with retries and scheduling. Which item should you use?',
    options: opts4(
      'A data pipeline',
      'A single dataflow',
      'A KQL command',
      'A workspace role'
    ),
    correct: ['a'],
    explanation: 'A data pipeline orchestrates a Copy activity, Notebook activity, and Semantic model refresh activity with dependencies, retries, and scheduling.',
    references: [REF_PIPELINE]
  },
  {
    domain: PREP, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Lakehouse Delta tables are automatically exposed for read-only T-SQL via the SQL analytics endpoint without manual DDL.',
    options: opts4('True', 'False', 'Only after manual CREATE TABLE', 'Only for CSV'),
    correct: ['a'],
    explanation: 'True. Delta tables in the lakehouse Tables area are auto-discovered and exposed on the SQL analytics endpoint for read-only T-SQL without manual DDL.',
    references: [REF_SQLEP]
  },
  {
    domain: PREP, difficulty: 4, type: QType.SINGLE,
    stem: 'A Delta table accumulated many small files from streaming and also retains obsolete files. Which two operations, in order, address compaction then cleanup?',
    options: opts4(
      'OPTIMIZE then VACUUM',
      'VACUUM then DROP',
      'DROP then CREATE VIEW',
      'CREATE VIEW then OPTIMIZE'
    ),
    correct: ['a'],
    explanation: 'OPTIMIZE compacts small files into larger ones; VACUUM then removes files no longer referenced beyond retention. Running OPTIMIZE then VACUUM addresses compaction and cleanup respectively.',
    references: [REF_DELTA]
  },
  {
    domain: PREP, difficulty: 3, type: QType.SINGLE,
    stem: 'In a notebook, which PySpark statement appends a DataFrame to an existing lakehouse Delta table "orders"?',
    options: opts4(
      'df.write.format("delta").mode("append").saveAsTable("orders")',
      'df.read.table("orders")',
      'df.drop("orders")',
      'df.render("orders")'
    ),
    correct: ['a'],
    explanation: 'Using write with format delta and mode("append") to saveAsTable("orders") appends rows to the existing managed Delta table. read/drop/render do not append.',
    references: [REF_NOTEBOOK, REF_SPARK]
  },
  {
    domain: PREP, difficulty: 4, type: QType.SINGLE,
    stem: 'A pipeline must load only new records since the last run from an API into a lakehouse. Which design minimizes movement?',
    options: opts4(
      'Watermark-based incremental load storing the last extracted value',
      'Full extract every run',
      'Daily full CSV export',
      'Recreate the lakehouse each run'
    ),
    correct: ['a'],
    explanation: 'A watermark/incremental pattern persists the last extracted value and queries only newer records each run, minimizing data movement versus full extracts.',
    references: [REF_PIPELINE, REF_INGEST]
  },
  {
    domain: PREP, difficulty: 3, type: QType.SINGLE,
    stem: 'You need a quick, storage-efficient point-in-time copy of a warehouse table for what-if testing. Which feature is best?',
    options: opts4(
      'Zero-copy table clone',
      'SELECT INTO',
      'BACKUP/RESTORE',
      'CREATE VIEW'
    ),
    correct: ['a'],
    explanation: 'A zero-copy clone produces a point-in-time copy sharing unchanged files, so it is fast and storage-efficient compared to SELECT INTO which fully duplicates data.',
    references: [REF_TABLECLONE]
  },
  {
    domain: PREP, difficulty: 2, type: QType.SINGLE,
    stem: 'Where do raw uploaded JSON files that are not yet tables live in a lakehouse?',
    options: opts4(
      'The Files section',
      'The Tables section',
      'The semantic model',
      'A deployment pipeline'
    ),
    correct: ['a'],
    explanation: 'The lakehouse Files section holds arbitrary unmanaged files like JSON until they are loaded/transformed into managed Delta tables in the Tables section.',
    references: [REF_LAKEHOUSE]
  },
  {
    domain: PREP, difficulty: 3, type: QType.SINGLE,
    stem: 'A warehouse query has poor estimates due to missing column statistics. What is the recommended remedy?',
    options: opts4(
      'Create/update statistics on the relevant columns',
      'Cast columns to VARCHAR(MAX)',
      'Drop indexes that do not exist',
      'Disable the SQL endpoint'
    ),
    correct: ['a'],
    explanation: 'Creating or updating statistics on join/filter columns gives the optimizer accurate cardinality, improving plans. Fabric warehouse supports automatic and manual statistics.',
    references: [REF_PARTITION]
  },
  {
    domain: PREP, difficulty: 3, type: QType.SINGLE,
    stem: 'In the medallion architecture, which layer holds business-ready, aggregated data optimized for serving reports?',
    options: opts4(
      'Gold',
      'Bronze',
      'Raw landing',
      'Staging files'
    ),
    correct: ['a'],
    explanation: 'The Gold layer holds curated, business-ready, often aggregated/dimensional data optimized for serving and reporting; Bronze is raw and Silver is cleansed.',
    references: [REF_LAKEHOUSE]
  },
  {
    domain: PREP, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL true statements about the Fabric warehouse.',
    options: opts4(
      'It supports full read/write T-SQL including DML.',
      'It supports multi-table transactions.',
      'It supports zero-copy table clone.',
      'It stores data outside OneLake in a separate account.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'The warehouse supports full read/write T-SQL, multi-table transactions, and zero-copy clone, and it stores data in OneLake (not a separate account), so option D is false.',
    references: [REF_WAREHOUSE, REF_TSQL, REF_TABLECLONE, REF_OneLake]
  },
  {
    domain: PREP, difficulty: 3, type: QType.SINGLE,
    stem: 'A dataflow must completely refresh a curated lakehouse table each run. Which destination update method is correct?',
    options: opts4(
      'Replace',
      'Append',
      'Merge',
      'No destination'
    ),
    correct: ['a'],
    explanation: 'The Replace method overwrites the destination table each run, matching a full-refresh requirement; Append/Merge do not fully replace contents.',
    references: [REF_DATAFLOW]
  },
  {
    domain: PREP, difficulty: 3, type: QType.SINGLE,
    stem: 'You want to copy 500 GB from on-prem SQL into OneLake on a schedule with broad connector support. Which capability fits?',
    options: opts4(
      'A Data Factory pipeline Copy activity with an on-premises gateway',
      'A DAX measure',
      'A KQL query',
      'A semantic model refresh'
    ),
    correct: ['a'],
    explanation: 'A Data Factory pipeline Copy activity with an on-premises data gateway provides scheduled, managed, broadly connected movement from on-prem SQL into OneLake.',
    references: [REF_PIPELINE]
  },
  {
    domain: PREP, difficulty: 4, type: QType.SINGLE,
    stem: 'Non-privileged users must see only the last 4 digits of a credit card column, enforced by the engine. Which warehouse feature applies?',
    options: opts4(
      'Dynamic data masking',
      'A report bookmark',
      'A page filter',
      'A OneLake shortcut'
    ),
    correct: ['a'],
    explanation: 'Dynamic data masking obscures sensitive column values for non-privileged users at the engine level, satisfying the engine-enforced masking requirement; report features can be bypassed.',
    references: [REF_SECURITY]
  },
  {
    domain: PREP, difficulty: 4, type: QType.SINGLE,
    stem: 'The warehouse must filter rows so each analyst sees only their department, enforced regardless of client tool. Which feature?',
    options: opts4(
      'Row-level security with a predicate function',
      'A slicer in the report',
      'A bookmark',
      'A theme'
    ),
    correct: ['a'],
    explanation: 'Row-level security uses an inline table-valued predicate function so the engine filters rows by the current user for any client tool; slicers and report features can be bypassed.',
    references: [REF_RLS]
  },
  {
    domain: PREP, difficulty: 3, type: QType.SINGLE,
    stem: 'An hourly notebook must run reliably with retries as part of a load chain. What is the recommended operationalization?',
    options: opts4(
      'A scheduled data pipeline Notebook activity with retry',
      'Manual hourly execution',
      'A DAX measure',
      'Object-level security'
    ),
    correct: ['a'],
    explanation: 'Wrapping the notebook in a scheduled pipeline Notebook activity provides hourly scheduling, retry on transient errors, and monitoring — the recommended pattern.',
    references: [REF_PIPELINE, REF_NOTEBOOK]
  },
  {
    domain: PREP, difficulty: 2, type: QType.SINGLE,
    stem: 'Which statement best describes OneLake\'s role across Fabric engines?',
    options: opts4(
      'A single tenant-wide lake so engines share one copy of open-format data',
      'A per-report cache that duplicates data',
      'An external S3 bucket only',
      'A semantic model store only'
    ),
    correct: ['a'],
    explanation: 'OneLake is one tenant-wide logical lake storing open Delta/Parquet data so multiple Fabric engines operate on the same copy without duplication.',
    references: [REF_OneLake]
  },
  {
    domain: PREP, difficulty: 4, type: QType.SINGLE,
    stem: 'A warehouse batch with several DML statements must be all-or-nothing. Which T-SQL construct guarantees atomicity?',
    options: opts4(
      'An explicit transaction with COMMIT/ROLLBACK',
      'Autocommit per statement',
      'Disabling logging',
      'A Power BI measure'
    ),
    correct: ['a'],
    explanation: 'An explicit transaction (BEGIN TRAN ... COMMIT, with ROLLBACK on error) makes the batch atomic; Fabric warehouse supports multi-statement transactions.',
    references: [REF_TSQL]
  },
  {
    domain: PREP, difficulty: 3, type: QType.SINGLE,
    stem: 'Continuous device telemetry must be ingested for near-real-time KQL analytics. Which store should you use?',
    options: opts4(
      'An Eventhouse / KQL database',
      'A semantic model',
      'A deployment pipeline',
      'A Power BI dashboard'
    ),
    correct: ['a'],
    explanation: 'An Eventhouse hosting a KQL database is purpose-built for high-volume telemetry ingestion and fast KQL analytics in near real time.',
    references: [REF_EVENTHOUSE, REF_KQLDB]
  },
  {
    domain: PREP, difficulty: 3, type: QType.SINGLE,
    stem: 'You need to query an external ADLS Gen2 folder from a lakehouse for occasional analysis without copying. Which feature do you create?',
    options: opts4(
      'A OneLake shortcut',
      'A full data export',
      'A semantic model',
      'A bookmark'
    ),
    correct: ['a'],
    explanation: 'A OneLake shortcut virtualizes the ADLS Gen2 folder so it can be queried in place from the lakehouse without copying the data.',
    references: [REF_SHORTCUT]
  },
  {
    domain: PREP, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Fabric tool is best for code-first distributed transformations using PySpark across large datasets?',
    options: opts4(
      'A Spark notebook',
      'A Power BI report',
      'A KQL queryset',
      'A deployment pipeline'
    ),
    correct: ['a'],
    explanation: 'A Spark notebook on Fabric Spark compute enables code-first, distributed PySpark transformations at scale, unlike reports, KQL, or pipelines.',
    references: [REF_NOTEBOOK, REF_SPARK]
  },
  {
    domain: PREP, difficulty: 4, type: QType.SINGLE,
    stem: 'A warehouse must hide certain columns from analysts AND filter rows by user region, both server-side. Which combination works?',
    options: opts4(
      'A column-projecting view plus row-level security',
      'A report visual filter only',
      'A bookmark only',
      'A theme only'
    ),
    correct: ['a'],
    explanation: 'A view limiting columns combined with a row-level security predicate enforces both column and row restrictions at the engine, independent of the client tool.',
    references: [REF_TSQL, REF_RLS]
  },
  {
    domain: PREP, difficulty: 3, type: QType.SINGLE,
    stem: 'A Dataflow Gen2 should incrementally upsert changed rows into a lakehouse dimension table keyed by CustomerId rather than fully reloading. Which destination update method should you choose?',
    options: opts4(
      'Merge (upsert) on the CustomerId key',
      'Replace the whole table',
      'Append all rows every run',
      'No destination'
    ),
    correct: ['a'],
    explanation: 'The Merge update method upserts rows on a key (CustomerId), updating existing rows and inserting new ones without a full reload. Replace overwrites everything and Append duplicates rows.',
    references: [REF_DATAFLOW]
  },

  // ── Implement and Manage Semantic Models (15) ──
  {
    domain: MODEL, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which storage mode reads OneLake Delta data directly for fast queries without import refresh or DirectQuery folding?',
    options: opts4(
      'Direct Lake',
      'Import',
      'DirectQuery',
      'ROLAP only'
    ),
    correct: ['a'],
    explanation: 'Direct Lake loads Delta/Parquet pages directly from OneLake on demand, achieving near-import speed without scheduled import refresh or DirectQuery translation.',
    references: [REF_DIRECTLAKE]
  },
  {
    domain: MODEL, difficulty: 3, type: QType.SINGLE,
    stem: 'For best Power BI/Fabric model performance and simpler DAX, which schema is recommended?',
    options: opts4(
      'Star schema (facts + dimensions)',
      'One giant flat table',
      'Deep snowflake with no dimensions',
      'Random many-to-many web'
    ),
    correct: ['a'],
    explanation: 'A star schema with central facts and conformed dimensions is the recommended design, optimizing query performance and simplifying DAX in Power BI/Fabric models.',
    references: [REF_STAR]
  },
  {
    domain: MODEL, difficulty: 3, type: QType.SINGLE,
    stem: 'A filter-responsive total revenue indicator is needed. Which DAX object is appropriate?',
    options: opts4(
      'A measure: SUM(Sales[Revenue])',
      'A calculated column summing all rows',
      'A what-if parameter',
      'A bookmark'
    ),
    correct: ['a'],
    explanation: 'A measure (e.g., SUM(Sales[Revenue])) is evaluated in the current filter context at query time, so it responds to slicers/filters — a calculated column is fixed per row at refresh.',
    references: [REF_CALC]
  },
  {
    domain: MODEL, difficulty: 4, type: QType.SINGLE,
    stem: 'You need previous month\'s sales respecting the report date filter and a marked date table. Which DAX is most direct?',
    options: opts4(
      'CALCULATE([Sales], PREVIOUSMONTH(\'Date\'[Date]))',
      'SUM(Sales[Amount])',
      'COUNTROWS(\'Date\')',
      'NOW()'
    ),
    correct: ['a'],
    explanation: 'CALCULATE with PREVIOUSMONTH shifts the date filter to the prior month over a marked date table, producing previous-month values in context. Plain SUM/COUNTROWS do not shift time.',
    references: [REF_TIME]
  },
  {
    domain: MODEL, difficulty: 3, type: QType.SINGLE,
    stem: 'A fact has both InvoiceDate (active) and DueDate (inactive) relationships to Date. A "by DueDate" measure must use DueDate. What enables it?',
    options: opts4(
      'USERELATIONSHIP within CALCULATE for the DueDate relationship',
      'Deleting the InvoiceDate relationship',
      'Marking both relationships active',
      'A report page filter'
    ),
    correct: ['a'],
    explanation: 'USERELATIONSHIP inside CALCULATE temporarily activates the inactive DueDate relationship for that measure only, without altering the active InvoiceDate relationship.',
    references: [REF_RELATION, REF_CONTEXT]
  },
  {
    domain: MODEL, difficulty: 4, type: QType.SINGLE,
    stem: 'Which DAX returns total sales ignoring all filters on the Date table but keeping other filters?',
    options: opts4(
      'CALCULATE(SUM(Sales[Amount]), ALL(\'Date\'))',
      'SUM(Sales[Amount])',
      'CALCULATE(SUM(Sales[Amount]), \'Date\')',
      'COUNTROWS(\'Date\')'
    ),
    correct: ['a'],
    explanation: 'CALCULATE(SUM(Sales[Amount]), ALL(\'Date\')) removes filters from the Date table while keeping other context filters. Plain SUM keeps all filters; COUNTROWS counts rows.',
    references: [REF_CONTEXT]
  },
  {
    domain: MODEL, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'By default, filters propagate from the one-side of a relationship to the many-side, not the reverse.',
    options: opts4('True', 'False', 'Only in DirectQuery', 'Only with aggregations'),
    correct: ['a'],
    explanation: 'True. Single-direction relationships propagate filters from the one-side to the many-side by default; reverse propagation requires bidirectional cross-filtering.',
    references: [REF_RELATION]
  },
  {
    domain: MODEL, difficulty: 4, type: QType.SINGLE,
    stem: 'Summary visuals over a huge Direct Lake fact are slow. Which technique pre-summarizes while keeping detail for drill-down?',
    options: opts4(
      'User-defined aggregation tables',
      'Additional bookmarks',
      'Removing relationships',
      'Converting all measures to columns'
    ),
    correct: ['a'],
    explanation: 'User-defined aggregations store pre-summarized data the engine transparently uses for matching summary queries, accelerating them while detail remains for drill-down.',
    references: [REF_AGG]
  },
  {
    domain: MODEL, difficulty: 3, type: QType.SINGLE,
    stem: 'An import model spanning many years must refresh fast by only processing recent partitions. What do you configure?',
    options: opts4(
      'Incremental refresh with RangeStart/RangeEnd',
      'Object-level security',
      'A larger capacity only',
      'A bookmark'
    ),
    correct: ['a'],
    explanation: 'Incremental refresh partitions by a date range using RangeStart/RangeEnd so only recent partitions refresh, dramatically reducing refresh time.',
    references: [REF_INCREMENTAL]
  },
  {
    domain: MODEL, difficulty: 3, type: QType.SINGLE,
    stem: 'Each salesperson must see only their own accounts in every report on the shared model. Which model feature enforces this?',
    options: opts4(
      'Row-level security roles with DAX filters',
      'Object-level security',
      'A slicer per page',
      'Workspace Member role'
    ),
    correct: ['a'],
    explanation: 'Model RLS roles with DAX filter expressions plus user-to-role mapping enforce per-user row filtering across all reports on the shared model; slicers can be changed by users.',
    references: [REF_RLS]
  },
  {
    domain: MODEL, difficulty: 4, type: QType.SINGLE,
    stem: 'A "Margin" column must be invisible (including metadata) to an external auditor role. Which feature is required?',
    options: opts4(
      'Object-level security (OLS)',
      'Row-level security',
      'Report-view hiding',
      'A bookmark'
    ),
    correct: ['a'],
    explanation: 'Object-level security hides specified tables/columns from a role entirely, including metadata, so the auditor cannot see or query Margin; RLS filters rows and report hiding is bypassable.',
    references: [REF_OLS]
  },
  {
    domain: MODEL, difficulty: 3, type: QType.SINGLE,
    stem: 'Time-intelligence measures return incorrect results. Which is the most common modeling prerequisite to verify?',
    options: opts4(
      'A dedicated, contiguous date table marked as a date table and related to fact dates',
      'Removing all measures',
      'Disabling relationships',
      'Using only DirectQuery'
    ),
    correct: ['a'],
    explanation: 'Reliable time intelligence requires a contiguous, dedicated date table marked as a date table and related to the fact date columns; a missing/incorrect date table is the most common cause.',
    references: [REF_TIME, REF_RELATION]
  },
  {
    domain: MODEL, difficulty: 2, type: QType.SINGLE,
    stem: 'To provide one version of the truth across many reports, what should you build?',
    options: opts4(
      'A shared semantic model that reports live-connect to',
      'A separate model per report',
      'A spreadsheet of measures',
      'A bookmark library'
    ),
    correct: ['a'],
    explanation: 'A shared semantic model with thin live-connected reports centralizes business logic and provides one version of the truth, avoiding duplicated, drifting models.',
    references: [REF_SEMANTIC]
  },
  {
    domain: MODEL, difficulty: 3, type: QType.SINGLE,
    stem: 'In a composite model a shared dimension is used both from import cache and a DirectQuery fact. Which storage mode optimizes it?',
    options: opts4(
      'Dual',
      'Import only',
      'DirectQuery only',
      'Direct Lake only'
    ),
    correct: ['a'],
    explanation: 'Dual mode lets the dimension act as Import or DirectQuery per query, reducing source round-trips while still supporting DirectQuery joins in composite models.',
    references: [REF_STORAGEMODE]
  },
  {
    domain: MODEL, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL recommended semantic model practices for performance and maintainability.',
    options: opts4(
      'Use a star schema with conformed dimensions',
      'Use measures for aggregations rather than many calculated columns',
      'Remove unused columns to reduce model size',
      'Keep every raw source column even if unused'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Star schema, measure-centric aggregation, and removing unused columns are recommended. Keeping every unused column bloats the model and refresh, so option D is incorrect.',
    references: [REF_STAR, REF_PERF]
  },

  // ── Explore and Analyze Data (16) ──
  {
    domain: EXPLORE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which language is used to explore and analyze data in a Fabric KQL database?',
    options: opts4(
      'Kusto Query Language (KQL)',
      'DAX',
      'MDX',
      'Only T-SQL'
    ),
    correct: ['a'],
    explanation: 'KQL databases/Eventhouses are queried with Kusto Query Language. DAX targets semantic models, MDX is legacy multidimensional, and T-SQL targets warehouses/SQL endpoints.',
    references: [REF_KQL]
  },
  {
    domain: EXPLORE, difficulty: 3, type: QType.SINGLE,
    stem: 'In KQL, which operator selects/derives a subset of columns for output?',
    options: opts4(
      'project',
      'where',
      'summarize',
      'render'
    ),
    correct: ['a'],
    explanation: 'The project operator chooses and can derive/rename output columns. where filters rows, summarize aggregates, and render visualizes results.',
    references: [REF_KQL]
  },
  {
    domain: EXPLORE, difficulty: 3, type: QType.SINGLE,
    stem: 'You must count log entries per Severity in KQL. Which expression is correct?',
    options: opts4(
      'Logs | summarize Count = count() by Severity',
      'Logs | project Severity',
      'Logs | take 100',
      'Logs | sort by Severity'
    ),
    correct: ['a'],
    explanation: 'summarize Count = count() by Severity groups rows by Severity and counts each group. project/take/sort do not aggregate counts by group.',
    references: [REF_KQL]
  },
  {
    domain: EXPLORE, difficulty: 3, type: QType.SINGLE,
    stem: 'To validate a measure independent of any report visual, which query type should you run against the semantic model?',
    options: opts4(
      'A DAX EVALUATE query',
      'A KQL query',
      'A T-SQL query against the model',
      'A pipeline run'
    ),
    correct: ['a'],
    explanation: 'A DAX EVALUATE query run against the semantic model returns a result table to validate a measure outside any report. KQL/T-SQL do not query semantic models directly.',
    references: [REF_DAXQUERY]
  },
  {
    domain: EXPLORE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which visual best displays a single metric versus a defined target/goal?',
    options: opts4(
      'A KPI or gauge visual',
      'A scatter plot',
      'A table',
      'A map'
    ),
    correct: ['a'],
    explanation: 'A KPI or gauge visual is purpose-built to show one metric against a target/goal. Scatter shows correlation, tables show detail, maps show geography.',
    references: [REF_VISUAL]
  },
  {
    domain: EXPLORE, difficulty: 3, type: QType.SINGLE,
    stem: 'Which Power Query capability quickly reveals per-column valid/error/empty percentages before load?',
    options: opts4(
      'Column quality data profiling',
      'A DAX measure',
      'Incremental refresh',
      'A deployment pipeline'
    ),
    correct: ['a'],
    explanation: 'Power Query column quality profiling displays valid/error/empty percentages per column, giving a fast pre-load data-quality view.',
    references: [REF_PROFILE]
  },
  {
    domain: EXPLORE, difficulty: 4, type: QType.SINGLE,
    stem: 'In KQL you need average response time per 1-hour window. Which expression is correct?',
    options: opts4(
      'T | summarize avg(Resp) by bin(Timestamp, 1h)',
      'T | project Resp',
      'T | take 1',
      'T | sort by Resp'
    ),
    correct: ['a'],
    explanation: 'summarize avg(Resp) by bin(Timestamp, 1h) buckets rows into 1-hour windows and averages within each — a standard KQL time-series aggregation.',
    references: [REF_KQL]
  },
  {
    domain: EXPLORE, difficulty: 3, type: QType.SINGLE,
    stem: 'Performance Analyzer indicates DAX query time dominates a slow visual. What is the best first step?',
    options: opts4(
      'Optimize the measure and reduce cardinality/visual complexity',
      'Recolor the visual',
      'Add report pages',
      'Rename the workspace'
    ),
    correct: ['a'],
    explanation: 'When DAX query duration dominates, optimizing measure logic and reducing cardinality/visual complexity directly cuts query time; cosmetic actions do not.',
    references: [REF_PERF]
  },
  {
    domain: EXPLORE, difficulty: 2, type: QType.SINGLE,
    stem: 'KQL\'s render operator can visualize query results (e.g., timechart) directly within the query experience.',
    options: opts4('True', 'False', 'Only in Power BI', 'Only with T-SQL'),
    correct: ['a'],
    explanation: 'True. The render operator visualizes KQL query output (such as render timechart) directly in the KQL query environment.',
    references: [REF_KQL]
  },
  {
    domain: EXPLORE, difficulty: 3, type: QType.SINGLE,
    stem: 'Business users want natural-language questions answered with auto-generated visuals from a model. Which feature?',
    options: opts4(
      'Power BI Q&A',
      'Row-level security',
      'A deployment pipeline',
      'A clone table'
    ),
    correct: ['a'],
    explanation: 'Power BI Q&A turns natural-language questions into visuals using the semantic model, enabling self-service exploration; the others are security/ALM/data features.',
    references: [REF_VISUAL]
  },
  {
    domain: EXPLORE, difficulty: 3, type: QType.SINGLE,
    stem: 'An analyst wants ad-hoc read-only T-SQL exploration of lakehouse tables without Spark. Which target should they use?',
    options: opts4(
      'The lakehouse SQL analytics endpoint SQL editor',
      'A PySpark notebook only',
      'A KQL queryset',
      'A deployment pipeline'
    ),
    correct: ['a'],
    explanation: 'The SQL analytics endpoint includes a SQL editor for ad-hoc read-only T-SQL exploration of lakehouse Delta tables without writing Spark.',
    references: [REF_SQLEP]
  },
  {
    domain: EXPLORE, difficulty: 4, type: QType.SINGLE,
    stem: 'A DAX query should return the top 3 categories by profit. Which function caps to the ranked top 3?',
    options: opts4(
      'TOPN(3, summary, [Profit], DESC)',
      'SUM(Sales[Profit])',
      'CALCULATE without filters',
      'NOW()'
    ),
    correct: ['a'],
    explanation: 'TOPN(3, ..., [Profit], DESC) returns the top 3 rows ordered by profit descending. SUM/CALCULATE/NOW do not rank-limit a table.',
    references: [REF_DAXQUERY]
  },
  {
    domain: EXPLORE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which visual best compares one measure across many discrete categories ranked high to low?',
    options: opts4(
      'A sorted bar/column chart',
      'A gauge',
      'A single card',
      'A line chart over time'
    ),
    correct: ['a'],
    explanation: 'A bar/column chart sorted by the measure clearly ranks and compares a value across many categories; gauges, cards, and time-series lines serve other purposes.',
    references: [REF_VISUAL]
  },
  {
    domain: EXPLORE, difficulty: 4, type: QType.SINGLE,
    stem: 'In KQL you must enrich telemetry rows with site metadata from a small Sites table on SiteId. Which operator?',
    options: opts4(
      'join kind=inner (Sites) on SiteId',
      'project SiteId',
      'take 25',
      'render columnchart'
    ),
    correct: ['a'],
    explanation: 'The join operator (e.g., join kind=inner (Sites) on SiteId) combines telemetry with the Sites lookup to enrich rows; project/take/render do not join.',
    references: [REF_KQL]
  },
  {
    domain: EXPLORE, difficulty: 3, type: QType.SINGLE,
    stem: 'Analysts want to explore lakehouse data with SQL within a notebook alongside Python cells. Which capability enables this?',
    options: opts4(
      'A Spark SQL (%%sql) cell against the lakehouse',
      'A DAX cell',
      'A KQL command cell',
      'A deployment rule'
    ),
    correct: ['a'],
    explanation: 'A %%sql Spark SQL cell in a Fabric notebook queries attached lakehouse tables interactively alongside PySpark, enabling mixed SQL/Python exploration.',
    references: [REF_NOTEBOOK, REF_SPARK]
  },
  {
    domain: EXPLORE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about analyzing data in Microsoft Fabric.',
    options: opts4(
      'KQL is used for KQL databases / Eventhouses.',
      'DAX EVALUATE queries can validate semantic model measures.',
      'The SQL analytics endpoint supports ad-hoc read-only T-SQL on a lakehouse.',
      'Power BI reports can only consume imported data, never Direct Lake.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'KQL queries KQL databases, DAX EVALUATE validates measures, and the SQL endpoint supports ad-hoc T-SQL. Power BI can consume Direct Lake, DirectQuery, and import — so option D is false.',
    references: [REF_KQL, REF_DAXQUERY, REF_SQLEP]
  }
];

const DP600_DOMAINS = [
  { name: PLAN, weight: 12 },
  { name: PREP, weight: 41 },
  { name: MODEL, weight: 23 },
  { name: EXPLORE, weight: 24 }
];

const DP600_EXAMS: { slug: string; code: string; titleSuffix: string; descriptionSuffix: string; questions: Q[] }[] = [
  {
    slug: 'microsoft-dp-600-p1',
    code: 'DP-600-P1',
    titleSuffix: 'Practice Exam 1',
    descriptionSuffix: 'Practice exam 1 of 3 — a full 100-minute, 65-question, blueprint-weighted set covering planning and managing analytics solutions, preparing and serving data (lakehouse, warehouse, pipelines, Delta), implementing and managing semantic models (Direct Lake, DAX), and exploring and analyzing data (KQL, DAX queries, visuals).',
    questions: P1
  },
  {
    slug: 'microsoft-dp-600-p2',
    code: 'DP-600-P2',
    titleSuffix: 'Practice Exam 2',
    descriptionSuffix: 'Practice exam 2 of 3 — a second 100-minute, 65-question, blueprint-weighted set with distinct scenario-based questions.',
    questions: P2
  },
  {
    slug: 'microsoft-dp-600-p3',
    code: 'DP-600-P3',
    titleSuffix: 'Practice Exam 3',
    descriptionSuffix: 'Practice exam 3 of 3 — a third 100-minute, 65-question, blueprint-weighted set with distinct scenario-based questions.',
    questions: P3
  }
];

const DP600_BUNDLE = {
  slug: 'microsoft-dp-600',
  title: 'Microsoft Fabric Analytics Engineer (DP-600)',
  description: 'All 3 DP-600 practice exams in one bundle — covering planning and managing analytics solutions, preparing and serving data, implementing and managing semantic models, and exploring and analyzing data, aligned to the Microsoft Certified: Fabric Analytics Engineer Associate (DP-600) exam domains.',
  price: 2000, // USD 20 — PRACTICE tier
  priceVoucher: 16500 // USD 165 — VOUCHER tier
};

type SeedResult = {
  vendor: 'created' | 'updated';
  exams: { slug: string; questionCount: number; teaserCount: number }[];
  bundle: 'created' | 'updated';
};

/**
 * Idempotent seed for the DP-600 bundle. Safe to call repeatedly — vendor /
 * exam / bundle rows are upserted, and questions tagged
 * `generatedBy: 'manual:dp600-seed'` are deleted and re-created.
 *
 * Pass an existing PrismaClient (lifecycle managed by caller).
 */
export async function seedDp600(db: PrismaClient): Promise<SeedResult> {
  const existingVendor = await db.vendor.findUnique({ where: { slug: 'microsoft' } });
  await db.vendor.upsert({
    where: { slug: 'microsoft' },
    update: { name: 'Microsoft', description: 'Microsoft certifications — Azure, Microsoft Fabric, data, and AI credentials including the Fabric Analytics Engineer Associate (DP-600).' },
    create: { slug: 'microsoft', name: 'Microsoft', description: 'Microsoft certifications — Azure, Microsoft Fabric, data, and AI credentials including the Fabric Analytics Engineer Associate (DP-600).' }
  });
  const vendor = await db.vendor.findUniqueOrThrow({ where: { slug: 'microsoft' } });

  const examResults: SeedResult['exams'] = [];
  const examIds: Record<string, string> = {};

  for (const e of DP600_EXAMS) {
    const title = `Microsoft Fabric Analytics Engineer (DP-600) — ${e.titleSuffix}`;
    const description = `${e.descriptionSuffix} Aligned to the Microsoft Certified: Fabric Analytics Engineer Associate (DP-600) exam domains.`;
    const examData = {
      title,
      code: e.code,
      description,
      level: 'Associate',
      durationMinutes: 100,
      passingScore: 70,
      questionCount: e.questions.length,
      domains: DP600_DOMAINS,
      published: true
    };
    const exam = await db.exam.upsert({
      where: { slug: e.slug },
      update: examData,
      create: { ...examData, slug: e.slug, vendorId: vendor.id }
    });
    examIds[e.slug] = exam.id;

    await db.question.deleteMany({ where: { examId: exam.id, generatedBy: 'manual:dp600-seed' } });
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
          generatedBy: 'manual:dp600-seed',
          isTeaser: !!q.isTeaser
        }
      });
      if (q.isTeaser) teaserCount++;
    }
    examResults.push({ slug: e.slug, questionCount: e.questions.length, teaserCount });
  }

  const existingBundle = await db.bundle.findUnique({ where: { slug: DP600_BUNDLE.slug } });
  const bundle = await db.bundle.upsert({
    where: { slug: DP600_BUNDLE.slug },
    update: {
      title: DP600_BUNDLE.title,
      description: DP600_BUNDLE.description,
      price: DP600_BUNDLE.price,
      priceVoucher: DP600_BUNDLE.priceVoucher,
      published: true
    },
    create: {
      slug: DP600_BUNDLE.slug,
      title: DP600_BUNDLE.title,
      description: DP600_BUNDLE.description,
      price: DP600_BUNDLE.price,
      priceVoucher: DP600_BUNDLE.priceVoucher,
      published: true
    }
  });

  // Replace bundle items deterministically: drop existing, recreate.
  await db.bundleItem.deleteMany({ where: { bundleId: bundle.id } });
  const items = [
    { examSlug: 'microsoft-dp-600-p1', tier: 'PRACTICE' as const, position: 1 },
    { examSlug: 'microsoft-dp-600-p2', tier: 'PRACTICE' as const, position: 2 },
    { examSlug: 'microsoft-dp-600-p3', tier: 'PRACTICE' as const, position: 3 },
    { examSlug: 'microsoft-dp-600-p1', tier: 'VOUCHER' as const, position: 4 }
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
