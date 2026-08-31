/**
 * PL-300 bundle seed — vendor (Microsoft), three practice-exam variants,
 * bundle, and 195 blueprint-aligned questions. Idempotent: replaces rows
 * tagged `generatedBy: 'manual:pl300-seed'` and upserts catalog rows.
 *
 * Exported as `seedPl300(db)` so the same code path is reachable from
 * the standalone CLI shim (`prisma/seeds/pl300.ts`) and the protected
 * admin API (`/api/admin/seed-pl300`) — letting us bootstrap the
 * production database without redeploying.
 *
 * Question content is authored against the public Microsoft Learn docs
 * and the Microsoft Power BI Data Analyst Associate (PL-300) study guide:
 *   - Prepare the data                          — 28% (18/variant)
 *   - Model the data                            — 28% (18/variant)
 *   - Visualize and analyze the data            — 28% (18/variant)
 *   - Manage and secure Power BI                — 16% (11/variant)
 *
 * These are original practice scenarios. They are NOT real exam items and
 * make no claim of being official or actual PL-300 questions.
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

const PREPARE = 'Prepare the data';
const MODEL = 'Model the data';
const VISUALIZE = 'Visualize and analyze the data';
const MANAGE = 'Manage and secure Power BI';

// ── Prepare references ──
const REF_PQ_WHAT = { label: 'Microsoft Learn — What is Power Query?', url: 'https://learn.microsoft.com/en-us/power-query/power-query-what-is-power-query' };
const REF_PQ_UI = { label: 'Microsoft Learn — The Power Query user interface', url: 'https://learn.microsoft.com/en-us/power-query/power-query-ui' };
const REF_PQ_M = { label: 'Microsoft Learn — Power Query M formula language', url: 'https://learn.microsoft.com/en-us/powerquery-m/' };
const REF_PQ_FOLDING = { label: 'Microsoft Learn — Power Query query folding', url: 'https://learn.microsoft.com/en-us/power-query/power-query-folding' };
const REF_DATA_TYPES = { label: 'Microsoft Learn — Data types in Power Query', url: 'https://learn.microsoft.com/en-us/power-query/data-types' };
const REF_PROFILE = { label: 'Microsoft Learn — Data profiling tools', url: 'https://learn.microsoft.com/en-us/power-query/data-profiling-tools' };
const REF_PRIVACY = { label: 'Microsoft Learn — Privacy levels', url: 'https://learn.microsoft.com/en-us/power-query/dataprivacyfirewall' };
const REF_CREDENTIALS = { label: 'Microsoft Learn — Manage data source settings and permissions in Power Query', url: 'https://learn.microsoft.com/en-us/power-query/data-source-settings' };
const REF_MODES = { label: 'Microsoft Learn — Semantic model modes in the Power BI service', url: 'https://learn.microsoft.com/en-us/power-bi/connect-data/service-dataset-modes-understand' };
const REF_DIRECTQUERY = { label: 'Microsoft Learn — Use DirectQuery in Power BI Desktop', url: 'https://learn.microsoft.com/en-us/power-bi/connect-data/desktop-use-directquery' };
const REF_DIRECTLAKE = { label: 'Microsoft Learn — Direct Lake overview', url: 'https://learn.microsoft.com/en-us/fabric/fundamentals/direct-lake-overview' };
const REF_COMPOSITE = { label: 'Microsoft Learn — Use composite models in Power BI Desktop', url: 'https://learn.microsoft.com/en-us/power-bi/transform-model/desktop-composite-models' };
const REF_PARAMETERS = { label: 'Microsoft Learn — Using parameters in Power Query', url: 'https://learn.microsoft.com/en-us/power-query/power-query-query-parameters' };
const REF_SHARED_MODEL = { label: 'Microsoft Learn — Connect to semantic models in Power BI service from Power BI Desktop', url: 'https://learn.microsoft.com/en-us/power-bi/connect-data/desktop-report-lifecycle-datasets' };
const REF_COLUMN_PROFILE = { label: 'Microsoft Learn — Column profile in Power Query', url: 'https://learn.microsoft.com/en-us/power-query/data-profiling-tools' };
const REF_REPLACE = { label: 'Microsoft Learn — Replace values in Power Query', url: 'https://learn.microsoft.com/en-us/power-query/replace-values' };
const REF_NULL = { label: 'Microsoft Learn — Dealing with errors in Power Query', url: 'https://learn.microsoft.com/en-us/power-query/dealing-with-errors' };
const REF_GROUPBY = { label: 'Microsoft Learn — Group by rows in Power Query', url: 'https://learn.microsoft.com/en-us/power-query/group-by' };
const REF_PIVOT = { label: 'Microsoft Learn — Pivot columns in Power Query', url: 'https://learn.microsoft.com/en-us/power-query/pivot-columns' };
const REF_UNPIVOT = { label: 'Microsoft Learn — Unpivot columns in Power Query', url: 'https://learn.microsoft.com/en-us/power-query/unpivot-column' };
const REF_MERGE = { label: 'Microsoft Learn — Merge queries in Power Query', url: 'https://learn.microsoft.com/en-us/power-query/merge-queries-overview' };
const REF_APPEND = { label: 'Microsoft Learn — Append queries in Power Query', url: 'https://learn.microsoft.com/en-us/power-query/append-queries' };
const REF_JSON = { label: 'Microsoft Learn — Working with JSON in Power Query', url: 'https://learn.microsoft.com/en-us/power-query/connectors/json' };
const REF_REFERENCE = { label: 'Microsoft Learn — Referenced queries in Power Query', url: 'https://learn.microsoft.com/en-us/power-query/power-query-referenced-queries' };
const REF_CUSTOM_COLUMN = { label: 'Microsoft Learn — Add a custom column in Power Query', url: 'https://learn.microsoft.com/en-us/power-query/add-custom-column' };
const REF_CONDITIONAL_COLUMN = { label: 'Microsoft Learn — Add a conditional column in Power Query', url: 'https://learn.microsoft.com/en-us/power-query/add-conditional-column' };
const REF_INDEX_COLUMN = { label: 'Microsoft Learn — Add an index column in Power Query', url: 'https://learn.microsoft.com/en-us/power-query/add-index-column' };
const REF_TYPES = { label: 'Microsoft Learn — Manage data types in Power Query', url: 'https://learn.microsoft.com/en-us/power-query/data-types' };
const REF_FACT_DIM = { label: 'Microsoft Learn — Understand star schema in Power BI', url: 'https://learn.microsoft.com/en-us/power-bi/guidance/star-schema' };
const REF_DATAFLOW = { label: 'Microsoft Learn — What are dataflows in Power BI?', url: 'https://learn.microsoft.com/en-us/power-bi/transform-model/dataflows/dataflows-introduction-self-service' };
const REF_LOAD = { label: 'Microsoft Learn — Configure load options in Power Query (enable load)', url: 'https://learn.microsoft.com/en-us/power-query/power-query-query-properties' };
const REF_ERROR_REPORT = { label: 'Microsoft Learn — Troubleshoot semantic model refresh errors', url: 'https://learn.microsoft.com/en-us/power-bi/connect-data/refresh-troubleshooting-refresh-scenarios' };

// ── Model references ──
const REF_TABLE_PROPS = { label: 'Microsoft Learn — Table properties in the model view', url: 'https://learn.microsoft.com/en-us/power-bi/transform-model/desktop-modeling-view' };
const REF_COLUMN_PROPS = { label: 'Microsoft Learn — Column properties (summarize by, data category)', url: 'https://learn.microsoft.com/en-us/power-bi/transform-model/desktop-modeling-view' };
const REF_RELATIONSHIPS = { label: 'Microsoft Learn — Create and manage relationships in Power BI Desktop', url: 'https://learn.microsoft.com/en-us/power-bi/transform-model/desktop-create-and-manage-relationships' };
const REF_RELATIONSHIPS_UNDERSTAND = { label: 'Microsoft Learn — Model relationships in Power BI Desktop', url: 'https://learn.microsoft.com/en-us/power-bi/transform-model/desktop-relationships-understand' };
const REF_M2M = { label: 'Microsoft Learn — Many-to-many relationships in Power BI Desktop', url: 'https://learn.microsoft.com/en-us/power-bi/transform-model/desktop-many-to-many-relationships' };
const REF_BIDIR = { label: 'Microsoft Learn — Bidirectional cross-filtering using DirectQuery in Power BI', url: 'https://learn.microsoft.com/en-us/power-bi/transform-model/desktop-bidirectional-filtering' };
const REF_ROLE_PLAY = { label: 'Microsoft Learn — Active vs inactive relationship guidance', url: 'https://learn.microsoft.com/en-us/power-bi/guidance/relationships-active-inactive' };
const REF_DATE_TABLE = { label: 'Microsoft Learn — Mark a date table in Power BI Desktop', url: 'https://learn.microsoft.com/en-us/power-bi/transform-model/desktop-mark-date-table' };
const REF_AUTO_DATE = { label: 'Microsoft Learn — Auto date/time guidance in Power BI Desktop', url: 'https://learn.microsoft.com/en-us/power-bi/transform-model/desktop-auto-date-time' };
const REF_CALC_TABLE = { label: 'Microsoft Learn — Create calculated tables in Power BI Desktop', url: 'https://learn.microsoft.com/en-us/power-bi/transform-model/desktop-calculated-tables' };
const REF_CALC_COLUMN = { label: 'Microsoft Learn — Tutorial: Create calculated columns in Power BI Desktop', url: 'https://learn.microsoft.com/en-us/power-bi/transform-model/desktop-tutorial-create-calculated-columns' };
const REF_MEASURES = { label: 'Microsoft Learn — Create measures for data analysis in Power BI Desktop', url: 'https://learn.microsoft.com/en-us/power-bi/transform-model/desktop-measures' };
const REF_DAX_BASICS = { label: 'Microsoft Learn — DAX basics in Power BI Desktop', url: 'https://learn.microsoft.com/en-us/power-bi/transform-model/desktop-quickstart-learn-dax-basics' };
const REF_CALCULATE = { label: 'Microsoft Learn — CALCULATE function (DAX)', url: 'https://learn.microsoft.com/en-us/dax/calculate-function-dax' };
const REF_FILTER_DAX = { label: 'Microsoft Learn — FILTER function (DAX)', url: 'https://learn.microsoft.com/en-us/dax/filter-function-dax' };
const REF_ALL_DAX = { label: 'Microsoft Learn — ALL function (DAX)', url: 'https://learn.microsoft.com/en-us/dax/all-function-dax' };
const REF_REMOVEFILTERS = { label: 'Microsoft Learn — REMOVEFILTERS function (DAX)', url: 'https://learn.microsoft.com/en-us/dax/removefilters-function-dax' };
const REF_KEEPFILTERS = { label: 'Microsoft Learn — KEEPFILTERS function (DAX)', url: 'https://learn.microsoft.com/en-us/dax/keepfilters-function-dax' };
const REF_USERELATIONSHIP = { label: 'Microsoft Learn — USERELATIONSHIP function (DAX)', url: 'https://learn.microsoft.com/en-us/dax/userelationship-function-dax' };
const REF_TIME_INTEL = { label: 'Microsoft Learn — Time intelligence functions (DAX)', url: 'https://learn.microsoft.com/en-us/dax/time-intelligence-functions-dax' };
const REF_SAMEPERIODLY = { label: 'Microsoft Learn — SAMEPERIODLASTYEAR function (DAX)', url: 'https://learn.microsoft.com/en-us/dax/sameperiodlastyear-function-dax' };
const REF_TOTALYTD = { label: 'Microsoft Learn — TOTALYTD function (DAX)', url: 'https://learn.microsoft.com/en-us/dax/totalytd-function-dax' };
const REF_DATEADD = { label: 'Microsoft Learn — DATEADD function (DAX)', url: 'https://learn.microsoft.com/en-us/dax/dateadd-function-dax' };
const REF_QUICK_MEASURE = { label: 'Microsoft Learn — Use quick measures for common calculations', url: 'https://learn.microsoft.com/en-us/power-bi/transform-model/desktop-quick-measures' };
const REF_CALC_GROUPS = { label: 'Microsoft Learn — Use calculation groups in Power BI', url: 'https://learn.microsoft.com/en-us/power-bi/transform-model/calculation-groups' };
const REF_DIVIDE = { label: 'Microsoft Learn — DIVIDE function (DAX)', url: 'https://learn.microsoft.com/en-us/dax/divide-function-dax' };
const REF_PERF_ANALYZER = { label: 'Microsoft Learn — Use Performance Analyzer to examine report performance', url: 'https://learn.microsoft.com/en-us/power-bi/create-reports/performance-analyzer' };
const REF_DAX_QUERY_VIEW = { label: 'Microsoft Learn — DAX query view in Power BI Desktop', url: 'https://learn.microsoft.com/en-us/power-bi/transform-model/dax-query-view' };
const REF_OPTIMIZE = { label: 'Microsoft Learn — Data reduction techniques for Import modeling', url: 'https://learn.microsoft.com/en-us/power-bi/guidance/import-modeling-data-reduction' };
const REF_ITERATORS = { label: 'Microsoft Learn — SUMX function (DAX)', url: 'https://learn.microsoft.com/en-us/dax/sumx-function-dax' };
const REF_CONTEXT = { label: 'Microsoft Learn — Filter context in DAX', url: 'https://learn.microsoft.com/en-us/dax/dax-overview' };

// ── Visualize references ──
const REF_VISUALS = { label: 'Microsoft Learn — Overview of visualizations in Power BI', url: 'https://learn.microsoft.com/en-us/power-bi/visuals/power-bi-visualizations-overview' };
const REF_COLUMN_CHART = { label: 'Microsoft Learn — Column charts in Power BI', url: 'https://learn.microsoft.com/en-us/power-bi/visuals/power-bi-visualization-column-charts' };
const REF_LINE_CHART = { label: 'Microsoft Learn — Line charts in Power BI', url: 'https://learn.microsoft.com/en-us/power-bi/visuals/power-bi-line-chart' };
const REF_MATRIX = { label: 'Microsoft Learn — Matrix visuals in Power BI', url: 'https://learn.microsoft.com/en-us/power-bi/visuals/power-bi-visualization-matrix-visual' };
const REF_TABLE_VISUAL = { label: 'Microsoft Learn — Tables in Power BI', url: 'https://learn.microsoft.com/en-us/power-bi/visuals/power-bi-visualization-tables' };
const REF_SCATTER = { label: 'Microsoft Learn — Scatter charts in Power BI', url: 'https://learn.microsoft.com/en-us/power-bi/visuals/power-bi-visualization-scatter' };
const REF_CARD = { label: 'Microsoft Learn — Card visuals in Power BI', url: 'https://learn.microsoft.com/en-us/power-bi/visuals/power-bi-visualization-card' };
const REF_KPI = { label: 'Microsoft Learn — KPIs in Power BI', url: 'https://learn.microsoft.com/en-us/power-bi/visuals/power-bi-visualization-kpi' };
const REF_SLICER = { label: 'Microsoft Learn — Slicers in Power BI', url: 'https://learn.microsoft.com/en-us/power-bi/visuals/power-bi-visualization-slicers' };
const REF_DECOMP = { label: 'Microsoft Learn — Decomposition tree visuals in Power BI', url: 'https://learn.microsoft.com/en-us/power-bi/visuals/power-bi-visualization-decomposition-tree' };
const REF_KEY_INFLUENCERS = { label: 'Microsoft Learn — Key influencers in Power BI', url: 'https://learn.microsoft.com/en-us/power-bi/visuals/power-bi-visualization-influencers' };
const REF_SMART_NARRATIVE = { label: 'Microsoft Learn — Smart narrative in Power BI', url: 'https://learn.microsoft.com/en-us/power-bi/visuals/power-bi-visualization-smart-narrative' };
const REF_ANOMALY = { label: 'Microsoft Learn — Anomaly detection in Power BI', url: 'https://learn.microsoft.com/en-us/power-bi/visuals/power-bi-visualization-anomaly-detection' };
const REF_PAGINATED = { label: 'Microsoft Learn — What are paginated reports in Power BI?', url: 'https://learn.microsoft.com/en-us/power-bi/paginated-reports/paginated-reports-report-builder-power-bi' };
const REF_THEMES = { label: 'Microsoft Learn — Use report themes in Power BI Desktop', url: 'https://learn.microsoft.com/en-us/power-bi/create-reports/desktop-report-themes' };
const REF_CONDITIONAL = { label: 'Microsoft Learn — Apply conditional formatting in tables and matrices', url: 'https://learn.microsoft.com/en-us/power-bi/create-reports/desktop-conditional-table-formatting' };
const REF_FILTERS_PANE = { label: 'Microsoft Learn — Filters pane in Power BI reports', url: 'https://learn.microsoft.com/en-us/power-bi/create-reports/power-bi-report-filter' };
const REF_BOOKMARKS = { label: 'Microsoft Learn — Use bookmarks to share insights and build stories', url: 'https://learn.microsoft.com/en-us/power-bi/create-reports/desktop-bookmarks' };
const REF_TOOLTIPS = { label: 'Microsoft Learn — Create tooltips based on report pages in Power BI', url: 'https://learn.microsoft.com/en-us/power-bi/create-reports/desktop-tooltips' };
const REF_INTERACTIONS = { label: 'Microsoft Learn — Change how visuals interact in a report', url: 'https://learn.microsoft.com/en-us/power-bi/create-reports/service-reports-visual-interactions' };
const REF_NAV = { label: 'Microsoft Learn — Create buttons in Power BI reports', url: 'https://learn.microsoft.com/en-us/power-bi/create-reports/desktop-buttons' };
const REF_SYNC_SLICER = { label: 'Microsoft Learn — Sync slicers across report pages in Power BI', url: 'https://learn.microsoft.com/en-us/power-bi/create-reports/desktop-slicers' };
const REF_SELECTION = { label: 'Microsoft Learn — Group, layer, and use the selection pane in Power BI', url: 'https://learn.microsoft.com/en-us/power-bi/create-reports/power-bi-reports-display-order' };
const REF_DRILLTHROUGH = { label: 'Microsoft Learn — Use drillthrough in Power BI reports', url: 'https://learn.microsoft.com/en-us/power-bi/create-reports/desktop-drillthrough' };
const REF_EXPORT = { label: 'Microsoft Learn — Export data from a Power BI visual', url: 'https://learn.microsoft.com/en-us/power-bi/visuals/power-bi-visualization-export-data' };
const REF_MOBILE = { label: 'Microsoft Learn — Optimize Power BI reports for the mobile app', url: 'https://learn.microsoft.com/en-us/power-bi/create-reports/desktop-create-phone-report' };
const REF_PERSONALIZE = { label: 'Microsoft Learn — Personalize visuals in a Power BI report', url: 'https://learn.microsoft.com/en-us/power-bi/create-reports/power-bi-personalize-visuals' };
const REF_ACCESSIBILITY = { label: 'Microsoft Learn — Design Power BI reports for accessibility', url: 'https://learn.microsoft.com/en-us/power-bi/create-reports/desktop-accessibility-creating-reports' };
const REF_AUTO_REFRESH = { label: 'Microsoft Learn — Automatic page refresh in Power BI', url: 'https://learn.microsoft.com/en-us/power-bi/create-reports/desktop-automatic-page-refresh' };
const REF_GROUPING = { label: 'Microsoft Learn — Use grouping and binning in Power BI Desktop', url: 'https://learn.microsoft.com/en-us/power-bi/create-reports/desktop-grouping-and-binning' };
const REF_CLUSTERING = { label: 'Microsoft Learn — Apply clustering in Power BI', url: 'https://learn.microsoft.com/en-us/power-bi/create-reports/desktop-clustering' };
const REF_FORECASTING = { label: 'Microsoft Learn — Use analytics pane (reference lines, forecasting)', url: 'https://learn.microsoft.com/en-us/power-bi/transform-model/desktop-analytics-pane' };
const REF_ANALYZE = { label: 'Microsoft Learn — Use Analyze in Power BI to explain fluctuations', url: 'https://learn.microsoft.com/en-us/power-bi/create-reports/desktop-insight-types' };
const REF_AI_VISUALS = { label: 'Microsoft Learn — AI insights in Power BI', url: 'https://learn.microsoft.com/en-us/power-bi/visuals/power-bi-visualizations-overview' };
const REF_COPILOT = { label: 'Microsoft Learn — Copilot for Power BI overview', url: 'https://learn.microsoft.com/en-us/power-bi/create-reports/copilot-introduction' };
const REF_COPILOT_NARRATIVE = { label: 'Microsoft Learn — Create a narrative visual with Copilot', url: 'https://learn.microsoft.com/en-us/power-bi/create-reports/copilot-create-narrative' };
const REF_COPILOT_PAGE = { label: 'Microsoft Learn — Create and edit reports with Copilot', url: 'https://learn.microsoft.com/en-us/power-bi/create-reports/copilot-create-reports' };
const REF_VISUAL_CALC = { label: 'Microsoft Learn — Visual calculations overview', url: 'https://learn.microsoft.com/en-us/power-bi/transform-model/desktop-visual-calculations-overview' };
const REF_SMALL_MULT = { label: 'Microsoft Learn — Create small multiples in Power BI', url: 'https://learn.microsoft.com/en-us/power-bi/visuals/power-bi-visualization-small-multiples' };

// ── Manage and secure references ──
const REF_WORKSPACE = { label: 'Microsoft Learn — Create a workspace in Power BI', url: 'https://learn.microsoft.com/en-us/power-bi/collaborate-share/service-create-the-new-workspaces' };
const REF_WORKSPACE_ROLES = { label: 'Microsoft Learn — Roles in workspaces in Power BI', url: 'https://learn.microsoft.com/en-us/power-bi/collaborate-share/service-roles-new-workspaces' };
const REF_APPS = { label: 'Microsoft Learn — Publish an app in Power BI', url: 'https://learn.microsoft.com/en-us/power-bi/collaborate-share/service-create-distribute-apps' };
const REF_PUBLISH = { label: 'Microsoft Learn — Publish from Power BI Desktop', url: 'https://learn.microsoft.com/en-us/power-bi/create-reports/desktop-upload-desktop-files' };
const REF_DASHBOARDS = { label: 'Microsoft Learn — Dashboards for designers in the Power BI service', url: 'https://learn.microsoft.com/en-us/power-bi/create-reports/service-dashboards' };
const REF_SUBSCRIPTIONS = { label: 'Microsoft Learn — Email subscriptions for reports and dashboards', url: 'https://learn.microsoft.com/en-us/power-bi/collaborate-share/service-publish-to-web' };
const REF_DATA_ALERTS = { label: 'Microsoft Learn — Data alerts in the Power BI service', url: 'https://learn.microsoft.com/en-us/power-bi/create-reports/service-set-data-alerts' };
const REF_PROMOTE = { label: 'Microsoft Learn — Endorsement: promote and certify Power BI content', url: 'https://learn.microsoft.com/en-us/power-bi/collaborate-share/service-endorsement-overview' };
const REF_GATEWAY = { label: 'Microsoft Learn — What is an on-premises data gateway?', url: 'https://learn.microsoft.com/en-us/data-integration/gateway/service-gateway-onprem' };
const REF_GATEWAY_PERSONAL = { label: 'Microsoft Learn — Use a personal gateway in Power BI', url: 'https://learn.microsoft.com/en-us/power-bi/connect-data/service-gateway-personal-mode' };
const REF_REFRESH = { label: 'Microsoft Learn — Configure scheduled refresh', url: 'https://learn.microsoft.com/en-us/power-bi/connect-data/refresh-scheduled-refresh' };
const REF_INCREMENTAL = { label: 'Microsoft Learn — Incremental refresh for semantic models', url: 'https://learn.microsoft.com/en-us/power-bi/connect-data/incremental-refresh-overview' };
const REF_RLS = { label: 'Microsoft Learn — Row-level security (RLS) with Power BI', url: 'https://learn.microsoft.com/en-us/fabric/security/service-admin-row-level-security' };
const REF_OLS = { label: 'Microsoft Learn — Object-level security (OLS) in Power BI', url: 'https://learn.microsoft.com/en-us/fabric/security/service-admin-object-level-security' };
const REF_SENSITIVITY = { label: 'Microsoft Learn — Sensitivity labels in Power BI', url: 'https://learn.microsoft.com/en-us/fabric/enterprise/powerbi/service-security-sensitivity-label-overview' };
const REF_BUILD = { label: 'Microsoft Learn — Build permission for semantic models', url: 'https://learn.microsoft.com/en-us/power-bi/connect-data/service-datasets-build-permissions' };
const REF_SHARING = { label: 'Microsoft Learn — Share reports and dashboards in Power BI', url: 'https://learn.microsoft.com/en-us/power-bi/collaborate-share/service-share-dashboards' };
const REF_SEMANTIC_MODEL = { label: 'Microsoft Learn — Semantic models in the Power BI service', url: 'https://learn.microsoft.com/en-us/power-bi/connect-data/service-datasets-understand' };
const REF_DEPLOY = { label: 'Microsoft Learn — Power BI deployment pipelines overview', url: 'https://learn.microsoft.com/en-us/fabric/cicd/deployment-pipelines/intro-to-deployment-pipelines' };

// Helper to build 4-option SINGLE questions with id 'a','b','c','d'.
const opts4 = (a: string, b: string, c: string, d: string): Opt[] => [
  { id: 'a', text: a }, { id: 'b', text: b }, { id: 'c', text: c }, { id: 'd', text: d }
];

// ───────────────────── Practice Exam 1 ─────────────────────
const P1: Q[] = [
  // ── Prepare the data (18) ──
  {
    domain: PREPARE, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'You are building a Power BI Desktop report from a single CSV file. You want a repeatable, refreshable process that connects to the file and applies the same cleaning steps every time the data changes. Which tool inside Power BI Desktop should you use?',
    options: opts4(
      'The DAX query view',
      'The Power Query editor',
      'A calculation group',
      'A paginated report'
    ),
    correct: ['b'],
    explanation: 'Power Query is the data transformation and preparation engine in Power BI Desktop. It records each step as M code that re-executes on refresh, making the transformations repeatable. DAX query view runs analytical queries; calculation groups define reusable measures; paginated reports are pixel-perfect rendering, not ETL.',
    references: [REF_PQ_WHAT, REF_PQ_UI]
  },
  {
    domain: PREPARE, difficulty: 2, type: QType.SINGLE,
    stem: 'A Power BI model needs to access a 200-GB fact table that is updated every few minutes. Reports must reflect data within 5 minutes. The dimension tables are small. Which storage mode is most appropriate for the fact table?',
    options: opts4(
      'Import mode',
      'DirectQuery mode',
      'Dual storage mode',
      'A live connection to Excel'
    ),
    correct: ['b'],
    explanation: 'DirectQuery is recommended when data volumes are too large to import or when reports need near real-time data beyond the scheduled refresh limits (8/day shared, 48/day Premium). Import would not fit and could not refresh fast enough. Dual is a per-table option used in composite models, typically for dimensions, not for very large fact tables.',
    references: [REF_MODES, REF_DIRECTQUERY]
  },
  {
    domain: PREPARE, difficulty: 2, type: QType.SINGLE,
    stem: 'You import a sales CSV. A column called Amount contains values like "1,250.40" with thousands separators. After applying a "Changed Type" step that converts Amount to Decimal Number, every row shows Error. What is the most likely fix?',
    options: opts4(
      'Replace the data type with Whole Number first, then to Decimal Number',
      'Use Locale-aware type conversion ("Using Locale...") to match the source culture (for example, English (United States))',
      'Delete the source file and re-import using a different connector',
      'Apply a Remove Duplicates step before the type conversion'
    ),
    correct: ['b'],
    explanation: 'When source data uses a specific cultural format for numbers (thousands and decimal separators), Power Query needs to know the locale to parse correctly. "Using Locale..." applies a type conversion that respects the chosen culture. Changing to Whole Number first would still error on the comma. Re-import or removing duplicates is unrelated.',
    references: [REF_DATA_TYPES, REF_TYPES]
  },
  {
    domain: PREPARE, difficulty: 1, type: QType.SINGLE,
    stem: 'In the Power Query editor, you turn on "Column quality" and "Column distribution" in the View tab. What information do these data profiling tools surface?',
    options: opts4(
      'The percentage of valid, error, and empty values in each column, plus distinct/unique value counts',
      'The DAX measure definitions that depend on each column',
      'A preview of the source database execution plan',
      'A heatmap of memory consumption per table'
    ),
    correct: ['a'],
    explanation: 'Column quality shows valid/error/empty percentages and Column distribution shows distinct and unique counts. These are the core data profiling tools in Power Query. DAX dependencies live elsewhere; execution plans and memory heatmaps are not surfaced by these toggles.',
    references: [REF_PROFILE, REF_COLUMN_PROFILE]
  },
  {
    domain: PREPARE, difficulty: 2, type: QType.SINGLE,
    stem: 'Two queries connect to the same SQL Server table but apply different filters. You want a single underlying query that other queries reference, so transformation logic lives in one place. Which Power Query feature accomplishes this?',
    options: opts4(
      'Duplicate the query so each has its own independent copy of the M code',
      'Reference the query so downstream queries inherit the upstream steps without duplicating M code',
      'Use a parameter to pass filter values',
      'Use Append Queries to combine them into one'
    ),
    correct: ['b'],
    explanation: 'A Reference creates a new query whose source is the existing query, so changes upstream flow downstream. Duplicate makes an independent copy that diverges. Parameters drive values, not query inheritance. Append combines rows from multiple queries — different purpose.',
    references: [REF_REFERENCE, REF_MERGE]
  },
  {
    domain: PREPARE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want users to be able to switch the database name your model connects to between Dev, Test, and Prod without editing M code. Which Power Query feature should you use?',
    options: opts4(
      'A calculated column',
      'A query parameter bound to the data source',
      'A measure',
      'A dataflow'
    ),
    correct: ['b'],
    explanation: 'Power Query parameters let you bind values like database names, file paths, or environment strings, and change them centrally (or through templates). Calculated columns and measures are DAX and run after load. A dataflow is a cloud-hosted Power Query, not a parameter mechanism.',
    references: [REF_PARAMETERS, REF_PQ_UI]
  },
  {
    domain: PREPARE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about query folding in Power Query.',
    options: opts4(
      'Query folding pushes transformation steps back to the source as native SQL when possible, improving refresh performance.',
      'Steps such as Group By, Filter, and Remove Columns often fold against a SQL Server source.',
      'Custom M functions and certain steps (for example, adding an index column) typically break folding.',
      'Query folding is required for Import mode but optional for DirectQuery.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Folding turns supported transforms into a single native query. Group by, filter, remove columns, and many others fold against relational sources. Adding indexes, custom functions, or certain text operations break folding. DirectQuery in fact requires folding because every visual issues a native query; Import benefits from folding but doesn\'t require it.',
    references: [REF_PQ_FOLDING, REF_DIRECTQUERY]
  },
  {
    domain: PREPARE, difficulty: 2, type: QType.SINGLE,
    stem: 'In Power Query, you have a column with values like "Red", "RED", and "  red  ". You want them all treated as "Red". Which sequence of transformations is correct?',
    options: opts4(
      'Replace Values, then Remove Duplicates only',
      'Trim, then Capitalize Each Word (or change case), then Replace Values if needed',
      'Pivot the column on itself',
      'Convert the column to Binary'
    ),
    correct: ['b'],
    explanation: 'Trim removes leading/trailing whitespace; changing case normalizes capitalization. Replace Values can clean any residual variants. Remove Duplicates alone doesn\'t change values, only deletes duplicate rows. Pivot and Binary are unrelated.',
    references: [REF_REPLACE, REF_PQ_UI]
  },
  {
    domain: PREPARE, difficulty: 2, type: QType.SINGLE,
    stem: 'A sales table has one row per order line; you need a "monthly sales by region" summary as an additional query. Which Power Query operation produces this efficiently?',
    options: opts4(
      'Pivot the OrderDate column',
      'Group By Region and YearMonth, aggregating SUM(LineAmount)',
      'Transpose the table',
      'Append the table to itself'
    ),
    correct: ['b'],
    explanation: 'Group By aggregates rows by one or more columns with an aggregation (sum, count, average, etc.) — exactly what monthly-by-region summaries need. Pivot rotates a column\'s values into headers (different operation), Transpose swaps rows and columns, Append stacks rows.',
    references: [REF_GROUPBY, REF_PQ_UI]
  },
  {
    domain: PREPARE, difficulty: 2, type: QType.SINGLE,
    stem: 'Your survey data has one column per question, with each row a respondent. To analyze responses by question in a single chart you want one row per question per respondent. Which Power Query transformation should you apply?',
    options: opts4(
      'Pivot Columns',
      'Unpivot Columns',
      'Transpose',
      'Merge Queries'
    ),
    correct: ['b'],
    explanation: 'Unpivot turns a wide layout (one column per attribute) into a tall layout (one row per attribute/value pair), which is what star schema fact tables and slicer-friendly visuals need. Pivot does the reverse. Transpose swaps the axis. Merge joins tables.',
    references: [REF_UNPIVOT, REF_PIVOT]
  },
  {
    domain: PREPARE, difficulty: 3, type: QType.SINGLE,
    stem: 'You connect to a REST API that returns JSON with nested arrays of "lineItems" inside each "order". Each row in the Power Query preview shows a "List" hyperlink for lineItems. What is the correct sequence to flatten this into a flat fact table at line-item grain?',
    options: opts4(
      'Click "Transpose", then "Use first row as headers"',
      'Click the List "Expand to New Rows", then expand the resulting Record column to its fields',
      'Right-click the column and "Remove other columns"',
      'Convert the column to Binary, then to Text'
    ),
    correct: ['b'],
    explanation: 'Expand to New Rows turns each list element into its own row (one row per line item per order). The resulting Record column is then expanded to surface each field as a column. Transpose, Remove other columns, and Binary conversion do not flatten nested JSON structures.',
    references: [REF_JSON, REF_PQ_UI]
  },
  {
    domain: PREPARE, difficulty: 2, type: QType.SINGLE,
    stem: 'In Power Query, what is the difference between Merge Queries and Append Queries?',
    options: opts4(
      'Merge joins two queries on matching columns (like a SQL JOIN); Append stacks rows from two queries (like a SQL UNION)',
      'Merge appends rows; Append joins on columns',
      'Both perform a SQL JOIN; the difference is just the wording',
      'Both perform a SQL UNION; only Merge supports more than two queries'
    ),
    correct: ['a'],
    explanation: 'Merge = join (combines columns from two tables based on a matching key). Append = union (stacks rows from one table after another). They are not interchangeable.',
    references: [REF_MERGE, REF_APPEND]
  },
  {
    domain: PREPARE, difficulty: 2, type: QType.SINGLE,
    stem: 'When designing a star schema in Power Query, a fact table typically contains which of the following?',
    options: opts4(
      'Descriptive attributes such as customer name, product category, and region',
      'Foreign keys to dimension tables and numeric measures (like quantity, amount, and discount)',
      'Only date and time columns',
      'Audit columns such as user names and login timestamps only'
    ),
    correct: ['b'],
    explanation: 'Fact tables store observations/events with foreign keys that link to dimension tables and numeric measure columns to be summarized. Descriptive attributes (name, category) belong to dimensions. Date-only tables are dimensions. Audit-only tables are not analytical facts.',
    references: [REF_FACT_DIM, REF_RELATIONSHIPS_UNDERSTAND]
  },
  {
    domain: PREPARE, difficulty: 1, type: QType.SINGLE,
    stem: 'In the Queries list of Power Query, you right-click a staging query and clear "Enable load". What does this do?',
    options: opts4(
      'The query is deleted from the file',
      'The query exists in Power Query but is not loaded into the data model and therefore consumes no model memory',
      'The query refreshes more slowly than other queries',
      'The query becomes a calculated column'
    ),
    correct: ['b'],
    explanation: 'Disabling Enable load keeps the query in the pbix for use by other queries (as a reference or merge source) but does NOT load it into the model, saving memory and avoiding clutter. The query is not deleted, doesn\'t change its refresh speed by itself, and is not converted into a calculated column.',
    references: [REF_LOAD, REF_PQ_UI]
  },
  {
    domain: PREPARE, difficulty: 2, type: QType.SINGLE,
    stem: 'You build a model in Power BI Desktop that combines a SQL Server source (marked Organizational) and an Excel file (marked Public). When you refresh, Power Query throws a "privacy levels" error. What does the privacy level setting control?',
    options: opts4(
      'It encrypts the data at rest in the .pbix file',
      'It controls whether Power Query is allowed to combine or pass data between sources when folding, to prevent sensitive data leaking to a less-trusted source',
      'It determines the gateway used at refresh time',
      'It enables row-level security automatically'
    ),
    correct: ['b'],
    explanation: 'Privacy levels (Private, Organizational, Public) prevent Power Query from sending data from a more-sensitive source to a less-sensitive one during folding/merge, which would risk leakage. They don\'t encrypt the file, choose the gateway, or configure RLS.',
    references: [REF_PRIVACY, REF_CREDENTIALS]
  },
  {
    domain: PREPARE, difficulty: 1, type: QType.SINGLE,
    stem: 'TRUE or FALSE: In Power BI Desktop, connecting Live to a shared semantic model published in the Power BI service requires you to author Power Query transformations against that semantic model before building visuals.',
    options: opts4('TRUE', 'FALSE', '', ''),
    correct: ['b'],
    explanation: 'False. A live connection to a published semantic model gives you read-only access to the existing model — no Power Query and no model authoring is available; you can only build report-level objects such as visuals and report-level measures.',
    references: [REF_SHARED_MODEL, REF_SEMANTIC_MODEL]
  },
  {
    domain: PREPARE, difficulty: 2, type: QType.SINGLE,
    stem: 'You add a "Conditional Column" step to bucket customers by Sales into Bronze (< 1000), Silver (1000-5000), and Gold (> 5000). Where does this calculation execute?',
    options: opts4(
      'At report render time, in the visual',
      'In Power Query at load (or refresh) time, before the data enters the model',
      'In DAX as a measure',
      'In the source database, regardless of folding'
    ),
    correct: ['b'],
    explanation: 'Power Query transformations execute when the model is loaded or refreshed (with folding pushing what it can to the source). The resulting column is materialized in the model. DAX measures, in contrast, execute at query time per visual.',
    references: [REF_CONDITIONAL_COLUMN, REF_CUSTOM_COLUMN]
  },
  {
    domain: PREPARE, difficulty: 3, type: QType.SINGLE,
    stem: 'A scheduled refresh of your Power BI semantic model fails with a "data source credentials are invalid" error after a password rotation. Where do you fix this?',
    options: opts4(
      'Edit the Power Query M code to embed the new password',
      'Update the data source credentials on the gateway or semantic model settings in the Power BI service',
      'Republish the .pbix from Desktop with the new credentials hard-coded',
      'Toggle the workspace to Premium capacity'
    ),
    correct: ['b'],
    explanation: 'Cloud refresh credentials are stored on the gateway or in the semantic model settings in the service. The standard remediation is to update them there. Embedding passwords in M is a security anti-pattern; republishing alone does not change stored credentials; Premium capacity has nothing to do with credential validity.',
    references: [REF_CREDENTIALS, REF_REFRESH]
  },

  // ── Model the data (18) ──
  {
    domain: MODEL, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'You design a star schema in Power BI Desktop. The Sales fact table has 200 million rows; Product, Customer, and Date are dimensions of a few thousand rows each. Which direction should the relationships point?',
    options: opts4(
      'Each dimension is the "one" side; Sales is the "many" side',
      'Each dimension is the "many" side; Sales is the "one" side',
      'All relationships should be many-to-many',
      'All relationships should be one-to-one'
    ),
    correct: ['a'],
    explanation: 'In a star schema, dimensions hold unique identifiers and sit on the "one" side; the fact table holds many rows per dimension key and sits on the "many" side. Many-to-many or one-to-one are exceptions, not the default.',
    references: [REF_FACT_DIM, REF_RELATIONSHIPS]
  },
  {
    domain: MODEL, difficulty: 1, type: QType.SINGLE,
    stem: 'In Power BI Desktop, what is the default cross-filter direction for a one-to-many relationship between a dimension and a fact table?',
    options: opts4(
      'Both directions',
      'Single (from the one side to the many side)',
      'No filtering — the relationship is for display only',
      'Both, but only when the dimension is in Dual storage mode'
    ),
    correct: ['b'],
    explanation: 'The default cross-filter direction is Single, propagating filters from the "one" side (dimension) to the "many" side (fact). Bidirectional can be enabled but creates ambiguity and performance risks; it isn\'t the default and isn\'t needed for typical star schemas.',
    references: [REF_RELATIONSHIPS, REF_RELATIONSHIPS_UNDERSTAND]
  },
  {
    domain: MODEL, difficulty: 2, type: QType.SINGLE,
    stem: 'You need to analyze Sales by OrderDate, ShipDate, and DeliveryDate, all of which join to a single Date table. Power BI only allows one active relationship between two tables. Which approach lets you use any of the three dates as the active filter, without writing one measure per role?',
    options: opts4(
      'Create three copies of the Date dimension (e.g., OrderDate, ShipDate, DeliveryDate), each with a single active relationship',
      'Enable Both cross-filter direction on the single Date-to-Sales relationship',
      'Mark Sales as the date table',
      'Use a calculated column with NOW()'
    ),
    correct: ['a'],
    explanation: 'Role-playing dimensions are best implemented by adding one dimension table per role with its own active relationship. This avoids USERELATIONSHIP-per-measure overhead and lets you filter all three perspectives simultaneously. Bidirectional cross-filter does not solve the three-relationship problem. The other options are unrelated.',
    references: [REF_ROLE_PLAY, REF_USERELATIONSHIP]
  },
  {
    domain: MODEL, difficulty: 2, type: QType.SINGLE,
    stem: 'You want time intelligence functions like TOTALYTD and SAMEPERIODLASTYEAR to work reliably. What model setup step is required?',
    options: opts4(
      'Enable bidirectional filtering on every relationship',
      'Build a continuous Date table that covers the full range of your fact data, then "Mark as date table" using its unique Date column',
      'Set every measure to use CALCULATE() with ALL()',
      'Switch the model to DirectQuery'
    ),
    correct: ['b'],
    explanation: 'Time intelligence requires a contiguous date table (no missing days) marked as the model\'s date table. Without this, DAX time-intelligence functions can return unexpected results. The other options do not establish the date context required.',
    references: [REF_DATE_TABLE, REF_TIME_INTEL]
  },
  {
    domain: MODEL, difficulty: 2, type: QType.SINGLE,
    stem: 'Which DAX function evaluates an expression in a modified filter context — for example, by overriding an existing filter on a column?',
    options: opts4(
      'SUM',
      'CALCULATE',
      'RELATED',
      'SUMMARIZE'
    ),
    correct: ['b'],
    explanation: 'CALCULATE is the single most important DAX function for changing filter context, applying or removing filters around the inner expression. SUM aggregates; RELATED reaches across a one-to-many relationship from the many side; SUMMARIZE creates grouped tables.',
    references: [REF_CALCULATE, REF_DAX_BASICS]
  },
  {
    domain: MODEL, difficulty: 2, type: QType.SINGLE,
    stem: 'Which measure calculates the year-to-date sales amount?',
    options: opts4(
      'YTD Sales = SUM(Sales[Amount]) / COUNT(Sales[OrderID])',
      'YTD Sales = TOTALYTD(SUM(Sales[Amount]), \'Date\'[Date])',
      'YTD Sales = ALL(\'Date\'[Date])',
      'YTD Sales = DIVIDE(SUM(Sales[Amount]), [Last Year Sales])'
    ),
    correct: ['b'],
    explanation: 'TOTALYTD evaluates the expression for the year-to-date in the current filter context. It requires a marked date table. The other options compute averages or ratios, not YTD totals.',
    references: [REF_TOTALYTD, REF_TIME_INTEL]
  },
  {
    domain: MODEL, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about CALCULATE in DAX.',
    options: opts4(
      'CALCULATE evaluates its first argument in a filter context that has been modified by the remaining filter arguments.',
      'Filter arguments can be Boolean expressions on a single table\'s columns, or table expressions, or filter modifier functions such as REMOVEFILTERS and KEEPFILTERS.',
      'CALCULATE without filter arguments performs context transition: it converts the current row context into an equivalent filter context.',
      'CALCULATE silently ignores filter arguments that reference measures.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'CALCULATE\'s purpose is to evaluate an expression in a modified filter context, supports Boolean and table filters plus modifier functions, and converts row context to filter context when used without filter arguments. It does NOT silently ignore — Boolean filter expressions referencing measures are illegal and raise an error.',
    references: [REF_CALCULATE, REF_REMOVEFILTERS, REF_KEEPFILTERS]
  },
  {
    domain: MODEL, difficulty: 2, type: QType.SINGLE,
    stem: 'You have measures [Total Sales] and want to compute Sales as a percentage of grand total, ignoring any slicer on Product[Category]. Which expression is correct?',
    options: opts4(
      '[Total Sales] / SUM(Sales[Amount])',
      'DIVIDE([Total Sales], CALCULATE([Total Sales], REMOVEFILTERS(Product[Category])))',
      'CALCULATE([Total Sales], FILTER(Product, [Total Sales] > 0))',
      'SUMX(Product, [Total Sales])'
    ),
    correct: ['b'],
    explanation: 'REMOVEFILTERS(Product[Category]) inside CALCULATE clears the Category filter for the denominator, while the numerator keeps the current context. DIVIDE handles division-by-zero. The other options either don\'t remove the filter or have unrelated semantics.',
    references: [REF_REMOVEFILTERS, REF_DIVIDE, REF_CALCULATE]
  },
  {
    domain: MODEL, difficulty: 2, type: QType.SINGLE,
    stem: 'When should you use a calculated column instead of a measure?',
    options: opts4(
      'Always — calculated columns are faster than measures',
      'When the result depends on the row, not on the visual filter context — for example, classifying customers into a static segment based on attributes',
      'When the result must change with the slicer selection — for example, "Sales selected by user"',
      'When the value must change as the report renders'
    ),
    correct: ['b'],
    explanation: 'Calculated columns are evaluated at refresh and stored row by row; they are appropriate for static, row-dependent attributes. Measures evaluate dynamically based on the visual\'s filter context — that\'s required for anything that changes with slicers. Calculated columns are NOT always faster — they bloat the model.',
    references: [REF_CALC_COLUMN, REF_MEASURES]
  },
  {
    domain: MODEL, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to compare current-period sales to the same period last year. Which DAX expression produces that comparison?',
    options: opts4(
      'CALCULATE([Total Sales], SAMEPERIODLASTYEAR(\'Date\'[Date]))',
      'CALCULATE([Total Sales], ALL(\'Date\'))',
      '[Total Sales] - 1',
      'IF([Total Sales] > 0, [Total Sales], 0)'
    ),
    correct: ['a'],
    explanation: 'SAMEPERIODLASTYEAR shifts the current date filter back one year, evaluating the inner expression for the equivalent prior-year period. The other choices either remove all filters or do arithmetic unrelated to time intelligence.',
    references: [REF_SAMEPERIODLY, REF_CALCULATE]
  },
  {
    domain: MODEL, difficulty: 3, type: QType.SINGLE,
    stem: 'A model has an inactive relationship between Sales[ShipDate] and Date[Date]. You want a measure that calculates total sales by ship date. Which DAX expression activates the inactive relationship just for that measure?',
    options: opts4(
      'Sales By Ship = CALCULATE(SUM(Sales[Amount]), USERELATIONSHIP(Sales[ShipDate], \'Date\'[Date]))',
      'Sales By Ship = SUM(Sales[Amount])',
      'Sales By Ship = CALCULATE(SUM(Sales[Amount]), CROSSFILTER(Sales[ShipDate], \'Date\'[Date], Both))',
      'Sales By Ship = ALL(Sales[ShipDate])'
    ),
    correct: ['a'],
    explanation: 'USERELATIONSHIP inside CALCULATE temporarily engages an inactive relationship for the duration of the calculation. CROSSFILTER changes filter direction (not relationship activation). The other options don\'t engage the inactive relationship.',
    references: [REF_USERELATIONSHIP, REF_CALCULATE]
  },
  {
    domain: MODEL, difficulty: 2, type: QType.SINGLE,
    stem: 'In a Power BI model with 250 columns across multiple tables, refresh and report performance are slow. Which is the single most effective first step?',
    options: opts4(
      'Add more calculated columns to precompute values',
      'Remove unused columns and high-cardinality columns (such as timestamps to the second) that are not needed for analysis',
      'Convert all measures to calculated columns',
      'Switch every fact table to DirectQuery'
    ),
    correct: ['b'],
    explanation: 'Reducing cardinality and removing unused columns is the most impactful optimization for VertiPaq compression and refresh time — it shrinks the model and speeds queries. Calculated columns increase model size. Indiscriminate DirectQuery is rarely a fix and trades one set of problems for another.',
    references: [REF_OPTIMIZE, REF_FACT_DIM]
  },
  {
    domain: MODEL, difficulty: 1, type: QType.SINGLE,
    stem: 'Which feature in Power BI Desktop helps you measure how long each visual on a report page takes to render, including DAX query duration?',
    options: opts4(
      'Performance analyzer',
      'Query Diagnostics',
      'DAX Studio Profiler',
      'VertiPaq Analyzer'
    ),
    correct: ['a'],
    explanation: 'Performance analyzer (in the Optimize ribbon) captures per-visual timings including DAX query, visual display, and other phases. Query Diagnostics is for Power Query refresh. DAX Studio and VertiPaq Analyzer are useful external tools but are not built into Power BI Desktop.',
    references: [REF_PERF_ANALYZER, REF_DAX_QUERY_VIEW]
  },
  {
    domain: MODEL, difficulty: 2, type: QType.SINGLE,
    stem: 'A measure [Average Order Value] = AVERAGE(Sales[OrderTotal]) gives the wrong answer when a single order is split across multiple rows. Which approach is appropriate?',
    options: opts4(
      'Use SUMX over distinct orders: AVERAGEX(VALUES(Sales[OrderID]), CALCULATE(SUM(Sales[Amount])))',
      'Convert the measure to a calculated column',
      'Add ALL() to remove the filter context',
      'Change Sales[OrderTotal] data type to Whole Number'
    ),
    correct: ['a'],
    explanation: 'When grain mismatch exists, an iterator over the right granularity (distinct orders) is required. AVERAGEX(VALUES(Sales[OrderID]), CALCULATE(SUM(Sales[Amount]))) computes per-order totals first, then averages. Calculated columns can\'t respect filter context like measures; ALL() doesn\'t solve grain; data type doesn\'t change math.',
    references: [REF_ITERATORS, REF_CALCULATE]
  },
  {
    domain: MODEL, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to give business users an easy way to author "% of total" and "Year-over-year" calculations without writing DAX. Which Power BI feature offers a guided dialog for these patterns?',
    options: opts4(
      'Quick measures',
      'DAX query view',
      'Power Query parameters',
      'Calculation groups'
    ),
    correct: ['a'],
    explanation: 'Quick measures provide a UI that authors common DAX patterns (year-over-year change, % of total, running total, etc.) without typing the formula. DAX query view is for ad-hoc queries; parameters are Power Query; calculation groups are for time-intelligence pattern reuse.',
    references: [REF_QUICK_MEASURE, REF_MEASURES]
  },
  {
    domain: MODEL, difficulty: 3, type: QType.SINGLE,
    stem: 'You have ten measures, each with YTD, MTD, QTD, YoY, and Prior Year variants — 50 measures total. You want to expose these as a single dropdown of time-intelligence calculations applied to any base measure. Which feature do you use?',
    options: opts4(
      'Calculation groups',
      'Bookmark navigators',
      'Aggregations',
      'Field parameters only'
    ),
    correct: ['a'],
    explanation: 'Calculation groups let you author a single set of "calculation items" (YTD, MTD, YoY, etc.) that can be applied to any measure at query time — reducing 50 measures to 10 base + 5 items. Bookmarks navigate report state; aggregations are storage optimizations for DirectQuery; field parameters swap fields but don\'t apply time-intelligence pattern reuse.',
    references: [REF_CALC_GROUPS, REF_MEASURES]
  },
  {
    domain: MODEL, difficulty: 1, type: QType.SINGLE,
    stem: 'In Power BI Desktop, you set a column\'s Data Category to "Web URL". What is the effect?',
    options: opts4(
      'The column is encrypted at rest',
      'Table visuals can render the value as a clickable hyperlink instead of plain text',
      'The column is automatically refreshed every 5 seconds',
      'Power BI hides the column from all users'
    ),
    correct: ['b'],
    explanation: 'Setting Data Category to Web URL allows table/matrix visuals to interpret the column as a hyperlink. The other behaviors (encryption, refresh, hiding) are unrelated to Data Category.',
    references: [REF_COLUMN_PROPS, REF_TABLE_PROPS]
  },
  {
    domain: MODEL, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to compare two measures in DAX query view interactively while testing optimizations. Which Power BI feature lets you run DAX queries inside Desktop, see results, and compare alternative formulations?',
    options: opts4(
      'DAX query view',
      'Performance analyzer only',
      'Bookmarks pane',
      'Selection pane'
    ),
    correct: ['a'],
    explanation: 'DAX query view (formerly accessible only via external tools) is now native to Power BI Desktop and lets you author and run DAX queries directly. Performance analyzer captures rendering timings but is not a query editor. Bookmarks/Selection are presentation features.',
    references: [REF_DAX_QUERY_VIEW, REF_PERF_ANALYZER]
  },

  // ── Visualize and analyze the data (18) ──
  {
    domain: VISUALIZE, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'You need to show how monthly revenue trends over the past 24 months. Which visual is most appropriate?',
    options: opts4(
      'A pie chart with one slice per month',
      'A line chart with Date on the X axis and Revenue on the Y axis',
      'A KPI visual with just the latest month',
      'A treemap colored by month'
    ),
    correct: ['b'],
    explanation: 'Line charts emphasize the shape of values over time, making them ideal for trends. Pie charts compare parts to a whole and are not for time series. A single KPI hides the trend. Treemaps are for hierarchical part-to-whole, not temporal patterns.',
    references: [REF_LINE_CHART, REF_VISUALS]
  },
  {
    domain: VISUALIZE, difficulty: 1, type: QType.SINGLE,
    stem: 'You want a single, prominent number on a report page that shows current-year revenue with a comparison to last year, colored red when below target. Which visual best fits?',
    options: opts4(
      'Card visual',
      'KPI visual',
      'Scatter chart',
      'Pie chart'
    ),
    correct: ['b'],
    explanation: 'KPI visuals are designed to show a value against a target with a trend axis and conditional coloring. A Card shows a single value but lacks target/trend semantics. Scatter and Pie are for relationships and part-to-whole, not single KPIs.',
    references: [REF_KPI, REF_CARD]
  },
  {
    domain: VISUALIZE, difficulty: 2, type: QType.SINGLE,
    stem: 'A stakeholder wants to know which factors most influence customer churn from a list of 20 candidate fields. Which AI-powered visual surfaces this analysis automatically?',
    options: opts4(
      'Decomposition tree',
      'Key influencers',
      'Smart narrative',
      'Anomaly detection'
    ),
    correct: ['b'],
    explanation: 'Key influencers identifies the factors that drive a selected metric, ranking them by influence. Decomposition tree drills into a value across dimensions interactively. Smart narrative generates text summaries. Anomaly detection flags unexpected spikes/dips in time series.',
    references: [REF_KEY_INFLUENCERS, REF_DECOMP]
  },
  {
    domain: VISUALIZE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want a single visual where users can interactively drill into "Total Sales" by Country, then by Region, then by City, and pick the drilldown order themselves. Which visual is purpose-built for that?',
    options: opts4(
      'Decomposition tree',
      'Matrix with row drill-down',
      'Funnel chart',
      'Combo chart'
    ),
    correct: ['a'],
    explanation: 'Decomposition tree lets users break a measure down by any dimension in any order they choose, and AI can suggest the next high-value split. A matrix supports a fixed hierarchy. Funnel and Combo are for sequential stages and dual-axis comparisons respectively.',
    references: [REF_DECOMP, REF_MATRIX]
  },
  {
    domain: VISUALIZE, difficulty: 1, type: QType.SINGLE,
    stem: 'You want a report consumer to be able to filter a visual to just "North America" without leaving the canvas. Which visual element provides this on-canvas filtering?',
    options: opts4(
      'A slicer',
      'A bookmark',
      'A custom tooltip',
      'A theme'
    ),
    correct: ['a'],
    explanation: 'Slicers provide on-canvas filter controls (list, dropdown, button, date range, etc.). Bookmarks capture report state; tooltips display extra info on hover; themes set global formatting.',
    references: [REF_SLICER, REF_FILTERS_PANE]
  },
  {
    domain: VISUALIZE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want a single date slicer on the report to filter every page consistently. Which feature should you enable?',
    options: opts4(
      'Sync slicers',
      'Drillthrough',
      'Personalized visuals',
      'Subscribe'
    ),
    correct: ['a'],
    explanation: 'Sync slicers replicates a slicer\'s selection across designated pages so users only need to set it once. Drillthrough navigates filtered between pages; personalized visuals let users tweak a visual; subscriptions email snapshots.',
    references: [REF_SYNC_SLICER, REF_SLICER]
  },
  {
    domain: VISUALIZE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want users to right-click a country in a sales summary visual and jump to a detail page that is already filtered to that country. Which feature do you configure?',
    options: opts4(
      'Drillthrough',
      'Cross-highlight',
      'Edit interactions',
      'Personalize this visual'
    ),
    correct: ['a'],
    explanation: 'Drillthrough navigates the user to a target page with the source filter context (e.g., Country = United States) automatically applied. Cross-highlight and edit interactions affect filtering on the current page. Personalize this visual is end-user formatting.',
    references: [REF_DRILLTHROUGH, REF_INTERACTIONS]
  },
  {
    domain: VISUALIZE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want hovering over a bar in a chart to reveal a mini sub-report (e.g., "top products for that customer") rather than the default value tooltip. Which feature should you build?',
    options: opts4(
      'A standard column tooltip',
      'A custom report-page tooltip',
      'A bookmark',
      'An export-to-Excel template'
    ),
    correct: ['b'],
    explanation: 'Report-page tooltips let you design a full mini-page that displays as a tooltip over data points in a visual. Standard tooltips show only the configured fields. Bookmarks capture report state; export-to-Excel is unrelated.',
    references: [REF_TOOLTIPS, REF_VISUALS]
  },
  {
    domain: VISUALIZE, difficulty: 1, type: QType.SINGLE,
    stem: 'You apply a Power BI report theme. Which design elements does the theme primarily control?',
    options: opts4(
      'The DAX optimization plan',
      'Colors, fonts, default visual formatting, and background settings across the report',
      'Row-level security roles',
      'Refresh frequency'
    ),
    correct: ['b'],
    explanation: 'Themes apply consistent colors, fonts, and default formatting across visuals. They don\'t affect DAX, security, or refresh.',
    references: [REF_THEMES, REF_VISUALS]
  },
  {
    domain: VISUALIZE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want a table cell\'s background to change from red to green based on the cell\'s percentage value. Which feature applies this?',
    options: opts4(
      'Conditional formatting on the column',
      'A bookmark',
      'A slicer with a color picker',
      'Power Query "Add Column from Examples"'
    ),
    correct: ['a'],
    explanation: 'Conditional formatting (Background color, Font color, Data bars, Icons) drives styling from data values. Bookmarks capture state; slicers filter; Add Column from Examples is a Power Query operation, not visualization formatting.',
    references: [REF_CONDITIONAL, REF_TABLE_VISUAL]
  },
  {
    domain: VISUALIZE, difficulty: 2, type: QType.SINGLE,
    stem: 'You need to publish a pixel-perfect, multi-page invoice-style report that prints cleanly to PDF and supports row-level data export. Which Power BI authoring tool produces this output?',
    options: opts4(
      'Power BI Desktop interactive report',
      'Paginated reports authored in Power BI Report Builder',
      'Power BI dashboards',
      'Excel PivotTables'
    ),
    correct: ['b'],
    explanation: 'Paginated reports (authored in Power BI Report Builder, based on SQL Server Reporting Services format) are designed for pixel-perfect, multi-page, printable output. Interactive Power BI Desktop reports are not optimized for pagination. Dashboards are summary tiles; PivotTables are Excel artifacts.',
    references: [REF_PAGINATED, REF_VISUALS]
  },
  {
    domain: VISUALIZE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want each user to be able to add, remove, or change which fields appear on a chart, without breaking the published report. Which feature should the report author enable on the visual?',
    options: opts4(
      'Sync slicers',
      'Personalize this visual',
      'Edit interactions',
      'Subscriptions'
    ),
    correct: ['b'],
    explanation: 'Personalize this visual lets report consumers modify a visual\'s fields, aggregation, etc., for their own session. Sync slicers replicates slicer selections; edit interactions controls cross-filter behavior; subscriptions email snapshots.',
    references: [REF_PERSONALIZE, REF_INTERACTIONS]
  },
  {
    domain: VISUALIZE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about accessibility in Power BI reports.',
    options: opts4(
      'Setting alt text on visuals helps screen-reader users understand the visual\'s content.',
      'Theme contrast between text and background should meet WCAG guidelines for readability.',
      'Keyboard navigation with Tab moves through visuals; users can press Ctrl+Right Arrow to enter visuals and explore data.',
      'Custom visuals are guaranteed to be accessible because Power BI enforces standards on all visuals in AppSource.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Alt text, sufficient contrast, and keyboard navigation are all important. Custom visuals from AppSource are not guaranteed accessible — accessibility quality varies by visual; report authors should test before publishing.',
    references: [REF_ACCESSIBILITY, REF_VISUALS]
  },
  {
    domain: VISUALIZE, difficulty: 2, type: QType.SINGLE,
    stem: 'On a sales trend line chart, you want to highlight values that are unusually high or low — automatically — without manually authoring them. Which feature in Power BI does this?',
    options: opts4(
      'Anomaly detection (in the Analytics pane)',
      'Conditional formatting on the legend',
      'A bookmark group',
      'Decomposition tree'
    ),
    correct: ['a'],
    explanation: 'Anomaly detection automatically flags outliers in line chart data and explains likely contributors. Conditional formatting is rule-based, not anomaly-aware. Bookmarks capture state; decomposition tree drills hierarchical values.',
    references: [REF_ANOMALY, REF_FORECASTING]
  },
  {
    domain: VISUALIZE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want a single visual that auto-generates a natural-language sentence summarizing the key insight ("Revenue grew 12% led by Product Category A"). Which AI-powered visual provides this?',
    options: opts4(
      'Smart narrative',
      'Q&A',
      'Decomposition tree',
      'KPI'
    ),
    correct: ['a'],
    explanation: 'Smart narrative adds dynamic, auto-generated text describing trends and key takeaways. Q&A answers natural-language questions but is being deprecated; decomposition tree drills; KPI shows a single metric.',
    references: [REF_SMART_NARRATIVE, REF_VISUALS]
  },
  {
    domain: VISUALIZE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want users opening the report on a phone to see a different, smaller layout than the desktop view. Which Power BI Desktop feature configures that?',
    options: opts4(
      'A bookmark named "Mobile"',
      'The mobile layout view in Power BI Desktop',
      'A second .pbix file',
      'A custom theme JSON'
    ),
    correct: ['b'],
    explanation: 'Power BI Desktop has a dedicated Mobile layout view where you arrange a subset of visuals in a phone-friendly aspect ratio without altering the desktop layout. Bookmarks, separate files, or theme JSON files don\'t configure mobile-specific layouts.',
    references: [REF_MOBILE, REF_VISUALS]
  },
  {
    domain: VISUALIZE, difficulty: 3, type: QType.SINGLE,
    stem: 'A report consumer needs to perform what-if analysis: "What if I increase price by 5%?" They want a slider that drives downstream calculations. Which Power BI feature gives that experience?',
    options: opts4(
      'A what-if parameter (numeric range parameter) consumed in a DAX measure',
      'A bookmark capturing the slider state',
      'A theme variable',
      'A drillthrough page filter'
    ),
    correct: ['a'],
    explanation: 'What-if parameters create a numeric range table and a measure that returns the selected value; you can then use that selected value inside DAX measures to simulate scenarios. Bookmarks, themes, and drillthrough don\'t produce a dynamic numeric driver.',
    references: [REF_FORECASTING, REF_VISUAL_CALC]
  },
  {
    domain: VISUALIZE, difficulty: 2, type: QType.SINGLE,
    stem: 'You add a Visual Calculation to a matrix that shows a running total of Sales across the visible rows. Where does this calculation execute?',
    options: opts4(
      'Inside the data source database',
      'On the visual itself, after the visual\'s query returns — operating within the rows and columns shown',
      'During the next scheduled refresh',
      'In Power Query M code'
    ),
    correct: ['b'],
    explanation: 'Visual calculations are DAX expressions stored on the visual and evaluated against the visual\'s result grid. They make per-visual patterns like running totals straightforward without affecting the underlying model. They are not source-side, refresh-side, or M code.',
    references: [REF_VISUAL_CALC, REF_DAX_BASICS]
  },

  // ── Manage and secure Power BI (11) ──
  {
    domain: MANAGE, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Power BI workspace role is REQUIRED for row-level security (RLS) filters to actually restrict a user\'s view of data inside the workspace?',
    options: opts4(
      'Admin',
      'Member',
      'Contributor',
      'Viewer'
    ),
    correct: ['d'],
    explanation: 'RLS only applies to users with the Viewer role in a workspace. Admin, Member, and Contributor roles have edit permission for the semantic model and RLS does not restrict them.',
    references: [REF_RLS, REF_WORKSPACE_ROLES]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You implement dynamic RLS so each salesperson only sees their own customers. The DAX filter on the Customer table is [SalespersonUPN] = USERPRINCIPALNAME(). Where do you ADD the user to the RLS role?',
    options: opts4(
      'In Power BI Desktop, before publishing',
      'In the Power BI service, on the semantic model\'s Security page',
      'In Microsoft Entra ID, by adding a custom directory role',
      'In Power Query, via a parameter'
    ),
    correct: ['b'],
    explanation: 'Role definitions (DAX filter expressions) live in Power BI Desktop; role MEMBERSHIP is assigned in the Power BI service on the semantic model\'s Security page. Entra ID roles and Power Query parameters are unrelated to RLS assignment.',
    references: [REF_RLS, REF_WORKSPACE_ROLES]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'Users need to read on-premises SQL Server data through Power BI scheduled refresh. There are 50 report authors and multiple data sources. Which gateway type is appropriate?',
    options: opts4(
      'On-premises data gateway (standard mode)',
      'On-premises data gateway (personal mode)',
      'Virtual network (VNet) data gateway only',
      'No gateway is needed because Power BI can connect directly'
    ),
    correct: ['a'],
    explanation: 'Standard mode supports multiple users, multiple data sources, and all supported Microsoft cloud services (Power BI, Power Automate, etc.). Personal mode is single-user and Power BI only. VNet gateways serve different scenarios (Azure-hosted sources). On-premises sources cannot be reached directly from the cloud without a gateway.',
    references: [REF_GATEWAY, REF_GATEWAY_PERSONAL]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to refresh a 5-billion-row sales fact table daily, but only re-process the last 7 days each refresh and keep 5 years of history. Which Power BI feature should you configure on the table?',
    options: opts4(
      'Incremental refresh',
      'DirectQuery storage mode',
      'A calculated column for date',
      'A bookmark group'
    ),
    correct: ['a'],
    explanation: 'Incremental refresh partitions the table by date and only re-loads the changed window (e.g., last N days), keeping historical partitions. DirectQuery avoids loading but doesn\'t give the "keep history, refresh latest" pattern. Calculated columns and bookmarks are unrelated.',
    references: [REF_INCREMENTAL, REF_REFRESH]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'A semantic model contains highly sensitive financial data. You want to ensure that any Excel export from the report carries the same "Confidential" classification. Which Power BI capability achieves this?',
    options: opts4(
      'Apply a Microsoft Purview sensitivity label to the report and semantic model',
      'Set a custom theme color to red',
      'Configure a data alert',
      'Switch the workspace to free SKU'
    ),
    correct: ['a'],
    explanation: 'Microsoft Purview sensitivity labels applied in Power BI persist to exported Excel, PowerPoint, PDF, and PBIX files, and the label\'s encryption settings apply to those files. Themes, alerts, and SKU changes don\'t enforce data classification.',
    references: [REF_SENSITIVITY, REF_EXPORT]
  },
  {
    domain: MANAGE, difficulty: 1, type: QType.SINGLE,
    stem: 'Which workspace role allows a user to view content and receive subscriptions, but NOT create or edit content?',
    options: opts4(
      'Admin',
      'Member',
      'Contributor',
      'Viewer'
    ),
    correct: ['d'],
    explanation: 'Viewers can view, interact, and subscribe but cannot create or edit content in the workspace. Admin/Member/Contributor all have create-and-edit privileges.',
    references: [REF_WORKSPACE_ROLES, REF_WORKSPACE]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to distribute a curated set of reports and dashboards to 1,500 business users in your organization, with controlled audiences (Sales sees one set, Finance another). What is the recommended Power BI distribution mechanism?',
    options: opts4(
      'Add 1,500 users as workspace Viewers',
      'Publish an app from the workspace with multiple audience groups',
      'Email a PDF export weekly',
      'Use Publish to web (public)'
    ),
    correct: ['b'],
    explanation: 'Power BI apps are the recommended distribution channel: they package the workspace contents and support up to 25 audience groups with different content visibility per audience. Adding 1,500 users as Viewers scales poorly. PDF email and Publish to web are not curated distribution.',
    references: [REF_APPS, REF_SHARING]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to mark a high-quality, official semantic model so other authors can find and trust it for building reports across the organization. Which feature should you apply?',
    options: opts4(
      'Endorsement: Promote it (or Certify, if you have permission)',
      'Set Sensitivity to Public',
      'Change workspace role to Admin',
      'Pin it to a dashboard'
    ),
    correct: ['a'],
    explanation: 'Endorsement allows content owners to Promote (anyone with appropriate role) or Certify (centrally controlled) datasets, reports, and dataflows, surfacing them as trusted assets to users. Sensitivity classifies data; workspace roles control access; pinning is a UI bookmark.',
    references: [REF_PROMOTE, REF_SEMANTIC_MODEL]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'A user wants to receive an email if a KPI on a dashboard tile crosses a threshold value. Which Power BI feature should they configure?',
    options: opts4(
      'Subscriptions',
      'Data alerts on dashboard tiles',
      'Row-level security',
      'Endorsement'
    ),
    correct: ['b'],
    explanation: 'Data alerts on supported dashboard tiles (card, KPI, gauge) fire when the value crosses configured thresholds and can notify via email or Microsoft Teams. Subscriptions send scheduled snapshots regardless of values. RLS and endorsement are unrelated.',
    references: [REF_DATA_ALERTS, REF_DASHBOARDS]
  },
  {
    domain: MANAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'A user with the Viewer workspace role queries the semantic model with Analyze in Excel and sees data from regions that should be hidden. What is the most likely cause?',
    options: opts4(
      'Analyze in Excel bypasses RLS',
      'No RLS role was assigned to the user (or none exists on the semantic model)',
      'The semantic model has DirectQuery turned on, which disables RLS',
      'Sensitivity labels override RLS'
    ),
    correct: ['b'],
    explanation: 'If the user is a Viewer but is not assigned to any RLS role (or the model has no role with a matching filter), RLS isn\'t enforced. Analyze in Excel honors RLS when properly configured; DirectQuery is compatible with RLS; sensitivity labels do not override RLS — they classify content.',
    references: [REF_RLS, REF_WORKSPACE_ROLES]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'Your organization needs to move semantic models and reports through Dev → Test → Production environments. Which Power BI feature is purpose-built for this CI/CD-style flow?',
    options: opts4(
      'Deployment pipelines',
      'Bookmarks',
      'Power BI dataflows',
      'Templates only'
    ),
    correct: ['a'],
    explanation: 'Deployment pipelines provide a three-stage (Dev/Test/Prod) workflow with diff/compare and dataset rule rebinding, designed for Power BI ALM. Bookmarks capture report state; dataflows are Power Query in the cloud; templates are a separate file format.',
    references: [REF_DEPLOY, REF_PUBLISH]
  }
];

// ───────────────────── Practice Exam 2 ─────────────────────
const P2: Q[] = [
  // ── Prepare the data (18) ──
  {
    domain: PREPARE, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'In Power Query, you import several CSV files from a folder. You want every file to be combined into a single table automatically. Which connector is purpose-built for this?',
    options: opts4(
      'The Web connector',
      'The Folder connector with the Combine Files operation',
      'A separate "From File" import per file, then Append Queries manually',
      'A dataflow only'
    ),
    correct: ['b'],
    explanation: 'The Folder connector enumerates files and the Combine Files button generates a sample query, transform function, and combined output automatically. The Web connector is for URLs. Manual per-file imports are tedious. A dataflow can do this in the cloud but isn\'t the only path inside Desktop.',
    references: [REF_PQ_UI, REF_APPEND]
  },
  {
    domain: PREPARE, difficulty: 2, type: QType.SINGLE,
    stem: 'A column contains a mix of "Yes", "No", and blank values. You need a Boolean type column where blanks become false. Which Power Query step handles this most reliably?',
    options: opts4(
      'Change the column data type directly to Logical (true/false) without cleaning',
      'Replace Values: replace null with "No", then add a Conditional Column setting "Yes" → true, otherwise false; finally change type to Logical',
      'Use Transpose to flip the table',
      'Apply Remove Duplicates'
    ),
    correct: ['b'],
    explanation: 'Cleaning nulls first, then mapping text to a Logical with a conditional column, gives a deterministic Boolean. Directly changing type can fail or produce nulls. Transpose flips axes; Remove Duplicates deletes duplicate rows.',
    references: [REF_REPLACE, REF_CONDITIONAL_COLUMN, REF_DATA_TYPES]
  },
  {
    domain: PREPARE, difficulty: 2, type: QType.SINGLE,
    stem: 'You connect to an Excel workbook and discover the data is in a non-rectangular layout: a few title rows above the table and merged cells in the header. Which Power Query strategy normalizes this into a clean table?',
    options: opts4(
      'Remove top rows that contain titles, then "Use First Row as Headers", then change column types',
      'Pivot the table on the first column',
      'Transpose, then export to JSON',
      'Apply Merge Queries with itself'
    ),
    correct: ['a'],
    explanation: 'A common first step for messy spreadsheets is to remove the leading title rows, promote the next row to headers, and set types. Pivot/Transpose/Self-merge solve different problems.',
    references: [REF_PQ_UI, REF_TYPES]
  },
  {
    domain: PREPARE, difficulty: 2, type: QType.SINGLE,
    stem: 'In a model with hundreds of tables, your refresh slows down dramatically after adding many transformation steps to a single query. Which technique most likely restores fold-friendly performance?',
    options: opts4(
      'Move filter steps earlier in the applied steps list so they fold to the source',
      'Add more "Add Custom Column" steps with M expressions',
      'Disable load on the source query',
      'Convert every step to a calculated column'
    ),
    correct: ['a'],
    explanation: 'Pushing filters and row reductions early lets folding eliminate rows at the source, shrinking what flows back. Adding custom columns or calculated columns increases work. Disabling load doesn\'t reduce computation done.',
    references: [REF_PQ_FOLDING, REF_OPTIMIZE]
  },
  {
    domain: PREPARE, difficulty: 1, type: QType.SINGLE,
    stem: 'You want to add a column "Margin %" computed as (Sales[Amount] - Sales[Cost]) / Sales[Amount] during data load. Which Power Query feature creates this?',
    options: opts4(
      'A measure',
      'A custom column using a formula in M (or via the Custom Column UI)',
      'A calculated column in DAX',
      'A bookmark'
    ),
    correct: ['b'],
    explanation: 'Custom columns in Power Query compute per-row values at load time. Measures and DAX calculated columns are model-level (different timing); bookmarks are presentation state.',
    references: [REF_CUSTOM_COLUMN, REF_PQ_UI]
  },
  {
    domain: PREPARE, difficulty: 3, type: QType.SINGLE,
    stem: 'You\'re importing 10 million rows from Azure SQL Database into Power BI Import mode. You only need the last 12 months of detail; older data is rolled up monthly in a separate table. Which set of Power Query steps best supports this?',
    options: opts4(
      'Import all rows, then add a Filter step at the end',
      'Add a Filter step on a date column EARLY so the WHERE clause folds to the database and only relevant rows are returned',
      'Use DirectQuery on the same dataset and ignore the filter',
      'Disable refresh on the query'
    ),
    correct: ['b'],
    explanation: 'Filtering early on a foldable step pushes the WHERE clause to the source database, reducing the data Power BI loads and accelerating refresh dramatically. Filtering at the end pulls everything down first; ignoring filters loses the benefit; disabling refresh isn\'t a solution.',
    references: [REF_PQ_FOLDING, REF_OPTIMIZE]
  },
  {
    domain: PREPARE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to convert a column "FullName" containing "Smith, Jane" into two columns "LastName" and "FirstName". Which Power Query transformation is most idiomatic?',
    options: opts4(
      'Split Column by Delimiter (comma)',
      'Pivot Column',
      'Group By',
      'Merge Columns'
    ),
    correct: ['a'],
    explanation: 'Split Column by Delimiter handles the comma-separated pattern. Pivot, Group By, and Merge Columns serve different purposes (rotating values, aggregation, concatenation).',
    references: [REF_PQ_UI, REF_CUSTOM_COLUMN]
  },
  {
    domain: PREPARE, difficulty: 2, type: QType.SINGLE,
    stem: 'You author a dataflow in the Power BI service. What benefit does using a dataflow give compared to embedding the same Power Query logic inside each .pbix?',
    options: opts4(
      'Dataflows replace DAX entirely',
      'Dataflows centralize and reuse Power Query logic so multiple semantic models can ingest the same prepared data',
      'Dataflows automatically encrypt all data',
      'Dataflows do not require any data source authentication'
    ),
    correct: ['b'],
    explanation: 'Dataflows are reusable, cloud-hosted Power Query pipelines: multiple semantic models can connect to the same dataflow rather than each redoing the prep. They do not replace DAX, automatically encrypt, or remove the need for source credentials.',
    references: [REF_DATAFLOW, REF_PQ_WHAT]
  },
  {
    domain: PREPARE, difficulty: 2, type: QType.SINGLE,
    stem: 'A semantic model uses a composite model that mixes Import storage for dimensions and DirectQuery for a large fact table. Which dimension table storage mode allows Power BI to choose the most efficient mode per query?',
    options: opts4(
      'Import only',
      'DirectQuery only',
      'Dual',
      'Live connection'
    ),
    correct: ['c'],
    explanation: 'Dual storage allows a table to be queried from in-memory (when joined with imported tables) or pushed via DirectQuery (when joined with a DirectQuery fact). It is the recommended mode for dimensions in composite models. Import-only or DQ-only locks a single behavior.',
    references: [REF_COMPOSITE, REF_MODES]
  },
  {
    domain: PREPARE, difficulty: 2, type: QType.SINGLE,
    stem: 'You\'re cleaning a Customer table where some rows have null in the "Country" column. You want to fill them down from the row above (typical of spreadsheets with grouped headings). Which Power Query operation does this?',
    options: opts4(
      'Group By with Sum',
      'Fill Down on the column',
      'Replace Errors with null',
      'Pivot the column'
    ),
    correct: ['b'],
    explanation: 'Fill Down propagates the most recent non-null value into subsequent null cells. Group By aggregates; Replace Errors only handles error tokens; Pivot rotates values into headers.',
    references: [REF_PQ_UI, REF_NULL]
  },
  {
    domain: PREPARE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about choosing between Import, DirectQuery, and Direct Lake storage modes.',
    options: opts4(
      'Import provides the best query performance through in-memory VertiPaq but requires scheduled refresh and fits within capacity memory limits.',
      'DirectQuery sends a query to the source for every visual and supports near real-time data, but DAX is limited to functions that can be translated to the source\'s native language.',
      'Direct Lake reads Parquet files in OneLake directly into memory on demand, combining freshness like DirectQuery with performance closer to Import (Fabric-only).',
      'Import mode always supports Q&A and Quick Insights; DirectQuery may not.'
    ),
    correct: ['a', 'b', 'c', 'd'],
    explanation: 'All four statements accurately describe key trade-offs between Import, DirectQuery, and Direct Lake. Q&A and Quick Insights are limited in DirectQuery models per Microsoft docs.',
    references: [REF_MODES, REF_DIRECTLAKE, REF_DIRECTQUERY]
  },
  {
    domain: PREPARE, difficulty: 1, type: QType.SINGLE,
    stem: 'You publish a Power BI Desktop file connected to a shared semantic model in a different workspace. Which connection type is created?',
    options: opts4(
      'Import',
      'DirectQuery to a relational source',
      'Live connection to a Power BI semantic model',
      'Direct Lake'
    ),
    correct: ['c'],
    explanation: 'Connecting Power BI Desktop to a published semantic model uses a live connection — read-only access to the model. Import would copy rows; DirectQuery is to relational sources; Direct Lake reads Fabric OneLake Parquet.',
    references: [REF_SHARED_MODEL, REF_SEMANTIC_MODEL]
  },
  {
    domain: PREPARE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to add a row-numbering column starting at 1 to a query. Which Power Query feature adds it most simply?',
    options: opts4(
      'Add Index Column → From 1',
      'Group By with Count',
      'Merge Queries',
      'Transpose'
    ),
    correct: ['a'],
    explanation: 'Add Index Column with From 1 (or 0) generates a sequential integer column without writing M manually. Group By aggregates; Merge joins; Transpose flips axes.',
    references: [REF_INDEX_COLUMN, REF_PQ_UI]
  },
  {
    domain: PREPARE, difficulty: 2, type: QType.SINGLE,
    stem: 'During refresh, your Power BI model raises the error: "Column [X] of the table wasn\'t found". This started after the source database schema was changed by a different team. Where would you fix this?',
    options: opts4(
      'Edit the Power Query M code to align with the new schema (rename or remap the column)',
      'Add an RLS role',
      'Re-pin the dashboard tile',
      'Change the gateway credentials'
    ),
    correct: ['a'],
    explanation: 'Schema drift requires adjusting Power Query steps that reference the missing column (rename, remove, or replace step). RLS, dashboard pins, and gateway credentials don\'t resolve a column-not-found error.',
    references: [REF_ERROR_REPORT, REF_PQ_M]
  },
  {
    domain: PREPARE, difficulty: 1, type: QType.SINGLE,
    stem: 'A coworker shares a .pbix that has a parameter called "ServerName". You open the file in your environment and need to point it at a different server. Where do you change this?',
    options: opts4(
      'Power Query → Manage Parameters (or Transform data → Edit Parameters)',
      'Power BI service portal admin settings',
      'The XML in the .pbix file (manually)',
      'A new calculated column'
    ),
    correct: ['a'],
    explanation: 'Manage Parameters/Edit Parameters in Power Query (or Transform data menu) lets you change parameter values without altering M code. Portal settings, XML editing, or calculated columns are not the parameter management surface.',
    references: [REF_PARAMETERS, REF_PQ_UI]
  },
  {
    domain: PREPARE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to retain only rows where Sales[Amount] > 0 in Power Query and ensure the filter is applied at the source. Which step type satisfies this?',
    options: opts4(
      'A "Filter Rows" step on the Amount column with the greater-than predicate (which typically folds against SQL sources)',
      'A DAX measure with IF',
      'A bookmark filter',
      'A calculated column'
    ),
    correct: ['a'],
    explanation: 'Filter Rows on a foldable source produces a WHERE clause in the native SQL, pushing work to the database. DAX, bookmarks, and calculated columns don\'t reduce data at load.',
    references: [REF_PQ_FOLDING, REF_PQ_UI]
  },
  {
    domain: PREPARE, difficulty: 1, type: QType.SINGLE,
    stem: 'TRUE or FALSE: A semantic model in DirectQuery storage mode does not require scheduled refresh because every visual queries the source at render time.',
    options: opts4('TRUE', 'FALSE', '', ''),
    correct: ['a'],
    explanation: 'True. DirectQuery semantic models hold only metadata. Each visual issues a native query to the source on demand, so scheduled refresh isn\'t required for data freshness (though optional refreshes may update tile caches).',
    references: [REF_MODES, REF_DIRECTQUERY]
  },
  {
    domain: PREPARE, difficulty: 2, type: QType.SINGLE,
    stem: 'A Power Query query returns 50 columns, but only 8 are needed downstream. Which transformation should you apply, and where?',
    options: opts4(
      '"Remove Other Columns" near the start of the applied steps, keeping only the 8 columns',
      'Hide the columns in the model view after load',
      'Delete the columns from the source database',
      'Apply a slicer'
    ),
    correct: ['a'],
    explanation: 'Removing unused columns early reduces the data that flows downstream and improves refresh and model size. Hiding doesn\'t reduce model footprint. Deleting from the source affects all consumers. Slicers filter visuals, not load shape.',
    references: [REF_OPTIMIZE, REF_PQ_UI]
  },

  // ── Model the data (18) ──
  {
    domain: MODEL, difficulty: 1, type: QType.SINGLE,
    stem: 'In a star schema, which type of table typically sits on the "one" side of a relationship?',
    options: opts4(
      'Fact table',
      'Dimension table',
      'Bridge table',
      'Staging table'
    ),
    correct: ['b'],
    explanation: 'Dimension tables contain unique keys and descriptive attributes; they sit on the "one" side and filter the "many" side fact table. Bridge tables resolve many-to-many; staging tables are unloaded helpers in Power Query.',
    references: [REF_FACT_DIM, REF_RELATIONSHIPS]
  },
  {
    domain: MODEL, difficulty: 1, type: QType.SINGLE,
    stem: 'Power BI auto-detects relationships between two tables only when:',
    options: opts4(
      'The tables come from the same data source',
      'The matching columns have similar names and Power BI is confident the keys uniquely identify rows on one side',
      'The user has the Global Admin role',
      'Both tables are in DirectQuery mode'
    ),
    correct: ['b'],
    explanation: 'Autodetect looks for column-name matches with sufficient uniqueness confidence. Data source identity, admin role, and storage mode don\'t drive autodetect.',
    references: [REF_RELATIONSHIPS, REF_RELATIONSHIPS_UNDERSTAND]
  },
  {
    domain: MODEL, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You have a measure [Sales]. You want a measure [Sales Selected Country] that returns Sales filtered to Country = "Canada", regardless of any other context. Which DAX is correct?',
    options: opts4(
      'CALCULATE([Sales], Customer[Country] = "Canada")',
      '[Sales] / COUNT(Customer[Country])',
      'SUM(Customer[Country])',
      'ALL(Customer)'
    ),
    correct: ['a'],
    explanation: 'CALCULATE with a Boolean filter expression overrides the filter on Customer[Country] to keep only "Canada". The other options compute unrelated values.',
    references: [REF_CALCULATE, REF_FILTER_DAX]
  },
  {
    domain: MODEL, difficulty: 2, type: QType.SINGLE,
    stem: 'You enable "Apply security filter in both directions" on a relationship. When is this typically required?',
    options: opts4(
      'For every star schema relationship',
      'When dynamic RLS is implemented at the server level and the filter must propagate across a many-to-one relationship the opposite direction',
      'To improve performance always',
      'To enable Q&A features'
    ),
    correct: ['b'],
    explanation: 'Bidirectional security filtering on a relationship is a deliberate setting used when RLS context (e.g., a user-mapping table) must flow upstream into a dimension. It is not a default, can hurt performance, and is unrelated to Q&A.',
    references: [REF_RLS, REF_BIDIR]
  },
  {
    domain: MODEL, difficulty: 2, type: QType.SINGLE,
    stem: 'Which DAX function returns a single distinct value when a column is filtered to one row, and an error otherwise?',
    options: opts4(
      'SELECTEDVALUE',
      'CALCULATE',
      'RELATED',
      'DISTINCT'
    ),
    correct: ['a'],
    explanation: 'SELECTEDVALUE returns the value when only one value is in context, otherwise a default (default blank). CALCULATE modifies context; RELATED follows relationships; DISTINCT returns a table.',
    references: [REF_DAX_BASICS, REF_MEASURES]
  },
  {
    domain: MODEL, difficulty: 2, type: QType.SINGLE,
    stem: 'In your model, a relationship from Sales[ProductID] to Product[ProductID] is set to many-to-many because Product has duplicate IDs. What is the recommended remediation?',
    options: opts4(
      'Leave it as many-to-many and enable bi-directional cross-filter',
      'De-duplicate Product[ProductID] in Power Query so it becomes unique, then use a one-to-many relationship',
      'Switch to DirectQuery',
      'Mark Product as a date table'
    ),
    correct: ['b'],
    explanation: 'Many-to-many introduces ambiguity and performance issues. Ideally, the dimension key should be unique — fix it upstream in Power Query (de-duplicate, group, or use a surrogate key). Bidirectional, DirectQuery, and date-table marking don\'t resolve the underlying key problem.',
    references: [REF_M2M, REF_FACT_DIM]
  },
  {
    domain: MODEL, difficulty: 3, type: QType.SINGLE,
    stem: 'You add a measure: ProductCount = COUNTROWS(Product). On a card with no slicers it shows 1,000. When you add a slicer on Sales[Year]=2024, it still shows 1,000 even though only some Products had sales in 2024. Why?',
    options: opts4(
      'The slicer is broken',
      'Sales filters Product through the relationship, but the relationship\'s cross-filter direction is Single from Product → Sales, so filters on Sales do NOT propagate to Product',
      'COUNTROWS does not work on dimensions',
      'The Card visual is in DirectQuery'
    ),
    correct: ['b'],
    explanation: 'In a star schema, filters flow from the "one" (dimension) to the "many" (fact), not the reverse. To make filters on Sales propagate to Product you would need bidirectional filtering or a measure that uses CROSSFILTER or a SUMMARIZE-based pattern. The other options misdiagnose.',
    references: [REF_RELATIONSHIPS_UNDERSTAND, REF_BIDIR]
  },
  {
    domain: MODEL, difficulty: 2, type: QType.SINGLE,
    stem: 'You need a measure for "sales of products that were active during the order period". The relationship between Sales and Product uses an inactive temporal-key relationship. Which DAX is used?',
    options: opts4(
      'USERELATIONSHIP inside CALCULATE',
      'ALL on the Date table',
      'A bookmark referencing the relationship',
      'TRUNCATE'
    ),
    correct: ['a'],
    explanation: 'USERELATIONSHIP activates an inactive relationship for the duration of a CALCULATE. ALL removes filters; bookmarks capture state; TRUNCATE doesn\'t exist as DAX function.',
    references: [REF_USERELATIONSHIP, REF_CALCULATE]
  },
  {
    domain: MODEL, difficulty: 2, type: QType.SINGLE,
    stem: 'You want a "% of grand total" measure that ignores filters on Customer but respects all other filters. Which DAX is correct?',
    options: opts4(
      'DIVIDE([Sales], CALCULATE([Sales], ALL(Customer)))',
      'ALL([Sales])',
      'COUNTROWS([Sales])',
      'SUMX([Sales], COUNTA(Customer))'
    ),
    correct: ['a'],
    explanation: 'ALL(Customer) inside CALCULATE removes only the Customer-table filters for the denominator, leaving other filters intact. DIVIDE handles divide-by-zero. The other expressions are syntactically or semantically wrong.',
    references: [REF_ALL_DAX, REF_DIVIDE, REF_CALCULATE]
  },
  {
    domain: MODEL, difficulty: 1, type: QType.SINGLE,
    stem: 'Where in Power BI Desktop do you mark a table as the date table for time-intelligence calculations?',
    options: opts4(
      'In Power Query, by renaming the table to "Date"',
      'In the Model view, on the table, choose "Mark as date table" and select the date column',
      'In the Power BI service, in the workspace settings',
      'In DAX, by writing TIMETABLE(Date)'
    ),
    correct: ['b'],
    explanation: 'Mark as date table is a property set in Power BI Desktop\'s Model view that ensures DAX time-intelligence functions get the right date context. The other options don\'t configure this property.',
    references: [REF_DATE_TABLE, REF_AUTO_DATE]
  },
  {
    domain: MODEL, difficulty: 2, type: QType.SINGLE,
    stem: 'A calculated table created with CALENDAR(MIN(Sales[Date]), MAX(Sales[Date])) produces a date table. Which is a key advantage of using CALENDARAUTO() instead?',
    options: opts4(
      'CALENDARAUTO() always uses the user\'s local time zone',
      'CALENDARAUTO() spans the calendar year boundaries that contain dates anywhere in the model, supporting fiscal-year customization via its optional argument',
      'CALENDARAUTO() runs in DirectQuery mode without limitations',
      'CALENDARAUTO() automatically marks itself as the date table'
    ),
    correct: ['b'],
    explanation: 'CALENDARAUTO inspects all date columns in the model and returns full calendar (or fiscal) years that contain them. It does not auto-mark, isn\'t timezone-magic, and isn\'t DQ-specific.',
    references: [REF_DATE_TABLE, REF_CALC_TABLE]
  },
  {
    domain: MODEL, difficulty: 2, type: QType.SINGLE,
    stem: 'You disable Auto Date/Time in Power BI Desktop. What is the practical effect on the model?',
    options: opts4(
      'Power BI deletes the user-created Date table',
      'Power BI stops auto-creating hidden per-column date hierarchies on every date column, which reduces model size and avoids confusion',
      'All time-intelligence functions stop working immediately',
      'The .pbix file is deleted'
    ),
    correct: ['b'],
    explanation: 'Auto Date/Time, when enabled, creates hidden mini-date tables per date column — bloating the model. Disabling it leaves your explicit, marked date table as the single source. It does not delete files or break properly authored time-intel.',
    references: [REF_AUTO_DATE, REF_DATE_TABLE]
  },
  {
    domain: MODEL, difficulty: 2, type: QType.SINGLE,
    stem: 'A measure SUMX(Product, [Sales]) calculates SUM of the Sales measure across the Product table. What does context transition mean in this expression?',
    options: opts4(
      'SUMX silently casts numbers to text',
      'For each row of Product, the row context (single product) is automatically transitioned into a filter context (CALCULATE-like) so that [Sales] is computed for that product only',
      'SUMX requires CALCULATE around [Sales] to work',
      'SUMX disables relationships'
    ),
    correct: ['b'],
    explanation: 'When a measure is referenced inside an iterator, an implicit context transition turns the current row context into a filter context — that\'s why [Sales] returns the sales of the specific product on each iteration. The other statements are incorrect.',
    references: [REF_ITERATORS, REF_CALCULATE]
  },
  {
    domain: MODEL, difficulty: 3, type: QType.SINGLE,
    stem: 'A measure runs slowly. Performance Analyzer shows DAX query duration of 9 seconds. What is the recommended first diagnostic step?',
    options: opts4(
      'Switch the storage mode to DirectQuery',
      'Copy the DAX query from Performance Analyzer and run it in DAX query view, then iterate on simpler formulations and compare timings',
      'Add 100 more measures to the model',
      'Convert the measure to a calculated column'
    ),
    correct: ['b'],
    explanation: 'Copying the visual\'s underlying DAX query into DAX query view (or DAX Studio) lets you iterate on alternative authorings and compare run times — the standard performance debugging loop. The other options don\'t diagnose, and converting to a calculated column can break filter context semantics.',
    references: [REF_PERF_ANALYZER, REF_DAX_QUERY_VIEW]
  },
  {
    domain: MODEL, difficulty: 1, type: QType.SINGLE,
    stem: 'Which DAX function returns BLANK when the divisor is zero, avoiding a division error?',
    options: opts4(
      'DIVIDE',
      'QUOTIENT',
      'IF only',
      'CALCULATE'
    ),
    correct: ['a'],
    explanation: 'DIVIDE(numerator, denominator) returns BLANK (or a user-supplied alternate) when the denominator is 0 or BLANK, gracefully avoiding errors. QUOTIENT errors on zero. IF/CALCULATE don\'t do safe division by themselves.',
    references: [REF_DIVIDE, REF_DAX_BASICS]
  },
  {
    domain: MODEL, difficulty: 2, type: QType.SINGLE,
    stem: 'You define a calculation group "Time Calculations" with items "Current", "YTD", and "PY". A user puts the calculation group on a slicer and Total Sales on a card. What happens?',
    options: opts4(
      'The card always shows the same value regardless of slicer selection',
      'The selected calculation item rewrites Total Sales for that visual (e.g., YTD applies TOTALYTD around the measure expression)',
      'The card displays an error',
      'The card silently switches to a paginated report'
    ),
    correct: ['b'],
    explanation: 'Calculation groups apply the selected calculation item\'s expression around the measure used in the visual, dynamically transforming the result without authoring per-time-pattern measures.',
    references: [REF_CALC_GROUPS, REF_MEASURES]
  },
  {
    domain: MODEL, difficulty: 2, type: QType.SINGLE,
    stem: 'You set "Summarize by" on Sales[OrderID] to "Don\'t summarize". Why is this important?',
    options: opts4(
      'It prevents users from accidentally getting a meaningless SUM of order IDs in visuals (since OrderIDs are identifiers, not measures)',
      'It encrypts the column',
      'It deletes the column at refresh',
      'It enables Q&A'
    ),
    correct: ['a'],
    explanation: 'Setting "Don\'t summarize" on identifier columns ensures visuals don\'t aggregate them as numeric values, which would be meaningless. It doesn\'t encrypt, delete, or affect Q&A.',
    references: [REF_COLUMN_PROPS, REF_TABLE_PROPS]
  },
  {
    domain: MODEL, difficulty: 2, type: QType.SINGLE,
    stem: 'You\'ve modeled a Sales table joined to a Date table. A coworker filters the report to FY24 and sees the same totals as FY23. Reviewing the model, you see two date columns in Sales: OrderDate and ShipDate, but Date only relates to OrderDate. What is most likely wrong?',
    options: opts4(
      'Date should be marked as the date table for both columns simultaneously',
      'The slicer probably filters ShipDate via an inactive relationship that requires USERELATIONSHIP, or the active relationship is wrong',
      'Power BI cannot model multiple dates',
      'The slicer is in DirectQuery'
    ),
    correct: ['b'],
    explanation: 'When multiple date columns exist, only one active relationship can drive the default filter. The likely fix is either to use role-playing dimensions or to apply USERELATIONSHIP inside the measure to switch to ShipDate when needed. Power BI does support multiple dates; the issue is which one is active.',
    references: [REF_ROLE_PLAY, REF_USERELATIONSHIP]
  },

  // ── Visualize and analyze the data (18) ──
  {
    domain: VISUALIZE, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'A stakeholder wants to display a single value (e.g., "Total Customers: 1,237") prominently on a dashboard. Which visual type is purpose-built for this?',
    options: opts4(
      'Card',
      'Matrix',
      'Scatter chart',
      'Slicer'
    ),
    correct: ['a'],
    explanation: 'Card visuals display a single fact prominently. Matrix, scatter, and slicer serve different purposes.',
    references: [REF_CARD, REF_VISUALS]
  },
  {
    domain: VISUALIZE, difficulty: 1, type: QType.SINGLE,
    stem: 'Which visual is best suited to display a running total contribution from many parts (positive and negative) to a final value?',
    options: opts4(
      'Pie chart',
      'Waterfall chart',
      'Treemap',
      'Funnel chart'
    ),
    correct: ['b'],
    explanation: 'Waterfall charts show a running total as positive and negative contributions accumulate to a final value (e.g., bridge from opening to closing balance). The others serve different purposes.',
    references: [REF_VISUALS, REF_COLUMN_CHART]
  },
  {
    domain: VISUALIZE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to visualize sales over time AND a count of transactions on the same chart, with both showing distinct Y axes. Which visual is best?',
    options: opts4(
      'Combo chart with two Y axes',
      'Pie chart with two slices',
      'KPI visual',
      'Decomposition tree'
    ),
    correct: ['a'],
    explanation: 'Combo charts (column + line) support dual Y axes for measures with different magnitudes. Pie compares parts; KPI shows one value; decomposition tree drills hierarchically.',
    references: [REF_VISUALS, REF_LINE_CHART]
  },
  {
    domain: VISUALIZE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want a single chart that splits sales by Region into multiple small panels (one per region) for side-by-side comparison. Which Power BI feature creates this layout?',
    options: opts4(
      'Small multiples (trellis layout)',
      'Bookmark groups',
      'Drillthrough',
      'A slicer with a slider'
    ),
    correct: ['a'],
    explanation: 'Small multiples split a single visual into a grid of sub-visuals based on a chosen field, enabling side-by-side comparison. Bookmarks capture state; drillthrough navigates pages; slicers filter.',
    references: [REF_SMALL_MULT, REF_VISUALS]
  },
  {
    domain: VISUALIZE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want different layers (background, frame, KPI cards, charts) on a complex report page that you can show/hide and reorder. Which pane in Power BI Desktop manages layer order and visibility?',
    options: opts4(
      'Selection pane',
      'Bookmarks pane',
      'Filters pane',
      'Format pane only'
    ),
    correct: ['a'],
    explanation: 'The Selection pane lists every object on the canvas with show/hide toggles and lets you reorder layers. Bookmarks save snapshots; Filters pane configures filter context; Format pane sets per-visual styles.',
    references: [REF_SELECTION, REF_BOOKMARKS]
  },
  {
    domain: VISUALIZE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to capture the current report state (which visuals are visible, which filters are applied, which page is open) and let users replay it from a button. Which feature do you use?',
    options: opts4(
      'Bookmarks',
      'Themes',
      'Dataflows',
      'Sensitivity labels'
    ),
    correct: ['a'],
    explanation: 'Bookmarks capture the visible state of a page (filters, slicers, visual visibility, sort orders) and a button can apply that bookmark to replay it. The other features serve different purposes.',
    references: [REF_BOOKMARKS, REF_NAV]
  },
  {
    domain: VISUALIZE, difficulty: 2, type: QType.SINGLE,
    stem: 'A report user clicks a bar in a chart and wants only the related table visual to filter — not every other visual on the page. What feature lets the report author configure this behavior?',
    options: opts4(
      'Edit interactions (set Filter/Highlight/None per visual pair)',
      'Sync slicers',
      'Drillthrough',
      'A theme'
    ),
    correct: ['a'],
    explanation: 'Edit interactions on the Format ribbon lets you set, per source-target pair of visuals, whether clicking the source filters, highlights, or does nothing to the target. Sync slicers is for slicers; drillthrough navigates pages; themes don\'t affect interactions.',
    references: [REF_INTERACTIONS, REF_VISUALS]
  },
  {
    domain: VISUALIZE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want a forecast line on a sales trend chart showing the next 6 months with confidence intervals. Which Power BI feature provides this?',
    options: opts4(
      'Forecasting in the Analytics pane',
      'Conditional formatting',
      'A bookmark',
      'A scatter chart'
    ),
    correct: ['a'],
    explanation: 'The Analytics pane on a line chart supports forecasting, reference lines, and error bars. Conditional formatting, bookmarks, and scatter charts don\'t produce forecasts.',
    references: [REF_FORECASTING, REF_LINE_CHART]
  },
  {
    domain: VISUALIZE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want users to be able to ask "What were the sales of widgets in Q1 2025?" in natural language and get an automatically generated visual. Which Power BI feature supports this?',
    options: opts4(
      'Q&A visual / Q&A in the service (note: scheduled for deprecation Dec 2026)',
      'Smart narrative',
      'Decomposition tree',
      'A theme'
    ),
    correct: ['a'],
    explanation: 'The Q&A visual interprets natural-language questions about the semantic model and generates appropriate visuals. (Microsoft has announced Q&A will be deprecated December 2026 in favor of Copilot.) Smart narrative writes text; decomposition tree drills; themes set style.',
    references: [REF_VISUALS, REF_COPILOT]
  },
  {
    domain: VISUALIZE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want Copilot to generate a draft new report page based on the semantic model. Which precondition must your environment meet?',
    options: opts4(
      'Power BI Pro license is sufficient on its own',
      'The workspace must be on a paid Fabric capacity (F2 or higher) or Power BI Premium capacity (P1 or higher) in a supported region',
      'A custom theme must be applied',
      'A bookmark named "Copilot" must exist'
    ),
    correct: ['b'],
    explanation: 'Copilot for Power BI requires a paid Fabric capacity (F2+) or Power BI Premium (P1+) in a supported region; a Pro license alone is insufficient. Themes and bookmarks are unrelated.',
    references: [REF_COPILOT, REF_COPILOT_PAGE]
  },
  {
    domain: VISUALIZE, difficulty: 2, type: QType.SINGLE,
    stem: 'A report author uses Copilot to "Create a narrative for this page". What kind of visual is produced?',
    options: opts4(
      'A page-level smart narrative text visual that summarizes the data and updates as filters change',
      'A printed PDF',
      'A new bookmark',
      'A new workspace'
    ),
    correct: ['a'],
    explanation: 'Copilot can author a narrative visual that adapts to filter changes and explains the report\'s data using natural language. It does not produce PDFs, bookmarks, or workspaces.',
    references: [REF_COPILOT_NARRATIVE, REF_SMART_NARRATIVE]
  },
  {
    domain: VISUALIZE, difficulty: 1, type: QType.SINGLE,
    stem: 'A line chart shows monthly sales but the X-axis order is alphabetical (April, August, December, …). What setting fixes the order to be chronological?',
    options: opts4(
      'Sort the axis by a numeric MonthNumber column using "Sort by column" on Month',
      'Apply a theme',
      'Use conditional formatting',
      'Switch storage to DirectQuery'
    ),
    correct: ['a'],
    explanation: 'Using "Sort by column" to drive Month\'s sort order by MonthNumber gives chronological ordering even when displayed as month names. The other options don\'t affect axis sort.',
    references: [REF_LINE_CHART, REF_VISUALS]
  },
  {
    domain: VISUALIZE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about exporting data from Power BI visuals.',
    options: opts4(
      'Report consumers can export summarized data from most visuals to Excel or CSV.',
      'Report authors can disable underlying-data export per semantic model.',
      'Exporting data may bypass sensitivity-label protection if the label is configured to apply to supported export paths.',
      'Sensitivity labels persist to exported Excel/PDF/PowerPoint files according to supported export paths.'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'a, b, and d are correct. c is incorrect because sensitivity labels (where configured) explicitly apply protection on supported export paths — they don\'t bypass.',
    references: [REF_EXPORT, REF_SENSITIVITY]
  },
  {
    domain: VISUALIZE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to bucket continuous Revenue into 10 equal-width groups for a histogram-style column chart. Which Power BI feature is purpose-built for this?',
    options: opts4(
      'Binning on the Revenue column (right-click → New group → Bin)',
      'A bookmark',
      'A theme',
      'A drillthrough page'
    ),
    correct: ['a'],
    explanation: 'Binning groups a continuous numeric column into bins of a configured size or count. Bookmarks, themes, and drillthrough don\'t produce buckets.',
    references: [REF_GROUPING, REF_VISUALS]
  },
  {
    domain: VISUALIZE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Power BI feature uses k-means to find groups of similar records in a scatter chart automatically?',
    options: opts4(
      'Clustering (Auto-cluster)',
      'Conditional formatting',
      'Sync slicers',
      'Themes'
    ),
    correct: ['a'],
    explanation: 'Clustering automatically segments data points in a scatter or table visual into groups using a k-means-style algorithm. The other features are unrelated.',
    references: [REF_CLUSTERING, REF_SCATTER]
  },
  {
    domain: VISUALIZE, difficulty: 2, type: QType.SINGLE,
    stem: 'A dashboard live tile shows the latest production-line output. The author wants the tile to refresh every minute so the line shows near real-time KPIs. Which feature supports this?',
    options: opts4(
      'Automatic page refresh (for DirectQuery sources) with a 1-minute interval',
      'Bookmarks',
      'Theme switching',
      'Email subscriptions'
    ),
    correct: ['a'],
    explanation: 'Automatic page refresh polls the source at the configured interval (DirectQuery models) for near real-time visuals. Bookmarks, themes, and subscriptions don\'t refresh data automatically.',
    references: [REF_AUTO_REFRESH, REF_DIRECTQUERY]
  },
  {
    domain: VISUALIZE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to use the Analyze feature in Power BI to explain why sales dropped from Q1 to Q2. How does this work?',
    options: opts4(
      'Right-click a data point and choose "Analyze → Explain the decrease" to surface AI-driven explanations',
      'Run a PowerShell script',
      'Switch storage to DirectQuery',
      'Apply a theme'
    ),
    correct: ['a'],
    explanation: 'Analyze provides AI-driven explanations of fluctuations from one period to another, highlighting key contributing factors. The other choices are unrelated.',
    references: [REF_ANALYZE, REF_AI_VISUALS]
  },
  {
    domain: VISUALIZE, difficulty: 1, type: QType.SINGLE,
    stem: 'A report consumer wants to focus on a single bar in a chart while still seeing the others greyed out. What term describes this default behavior?',
    options: opts4(
      'Cross-highlighting',
      'Drillthrough',
      'Personalize this visual',
      'Subscription'
    ),
    correct: ['a'],
    explanation: 'Cross-highlighting dims unselected data while emphasizing the selected. Drillthrough navigates pages; Personalize lets users modify visuals; Subscriptions email snapshots.',
    references: [REF_INTERACTIONS, REF_VISUALS]
  },

  // ── Manage and secure Power BI (11) ──
  {
    domain: MANAGE, difficulty: 1, type: QType.SINGLE,
    stem: 'Where in the Power BI service do you assign users or groups to a workspace role such as Member or Viewer?',
    options: opts4(
      'In the workspace\'s Access pane',
      'In the Microsoft 365 admin center',
      'In Microsoft Entra ID role assignments',
      'In Power BI Desktop'
    ),
    correct: ['a'],
    explanation: 'The Access pane of a workspace lets you assign Admin/Member/Contributor/Viewer roles to users or groups. Tenant admin centers, Entra ID, and Desktop are not where these roles are assigned.',
    references: [REF_WORKSPACE_ROLES, REF_WORKSPACE]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You want every user in a published app to receive content tailored to their team (Sales vs Finance). What is the maximum number of audience groups you can create per app?',
    options: opts4(
      '1 (one)',
      '5',
      '25',
      'Unlimited'
    ),
    correct: ['c'],
    explanation: 'Power BI apps support up to 25 audience groups per app, each with different content visibility. Microsoft documents this hard limit.',
    references: [REF_APPS, REF_WORKSPACE_ROLES]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'A Power BI Desktop user wants to schedule daily refresh of a semantic model that connects to an on-premises Oracle database. The user already published the report. What does the user need to configure in the Power BI service?',
    options: opts4(
      'Subscribe to the report',
      'Configure a gateway data source mapped to the semantic model, then enable scheduled refresh in semantic model settings',
      'Switch to Free license',
      'Pin the report to the home page'
    ),
    correct: ['b'],
    explanation: 'On-premises sources require a gateway. The user must register a data source on a gateway, map it to the semantic model, and enable scheduled refresh. Subscriptions, license tier, and pins don\'t enable refresh.',
    references: [REF_GATEWAY, REF_REFRESH]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'A user complains that they receive Power BI subscription emails for a report they no longer need. The report author is unavailable. What can the user do?',
    options: opts4(
      'Open Power BI service settings → Subscriptions and remove their own subscription',
      'Email the IT helpdesk to delete the semantic model',
      'Submit a Microsoft Support ticket',
      'Move the workspace to Free SKU'
    ),
    correct: ['a'],
    explanation: 'Users can manage their own subscriptions in the Power BI service\'s settings. The other options are disruptive or unnecessary.',
    references: [REF_SUBSCRIPTIONS, REF_SHARING]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'A dataflow in your workspace transforms data from multiple sources. Which workspace role is required to AUTHOR (create/edit) the dataflow?',
    options: opts4(
      'Viewer',
      'Contributor or higher',
      'Any external guest user',
      'Only Tenant Admin'
    ),
    correct: ['b'],
    explanation: 'Authoring content (including dataflows) requires Contributor, Member, or Admin role. Viewer can\'t create. External guests need a workspace role assigned. Tenant Admin is not required for content authoring.',
    references: [REF_WORKSPACE_ROLES, REF_DATAFLOW]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want users to see data in a report ONLY for the regions they are assigned to. You publish the .pbix from Desktop where you defined RLS roles like "EMEA", "Americas", and "APAC". Which step still must occur for users to actually be filtered?',
    options: opts4(
      'Mark the date table',
      'In the Power BI service, on the semantic model Security page, assign individual users or security groups to the relevant role',
      'Move the workspace to Free SKU',
      'Run Power Query refresh'
    ),
    correct: ['b'],
    explanation: 'Role membership lives in the service. Definitions travel from Desktop; assignment is a service-side step on the semantic model\'s Security page.',
    references: [REF_RLS, REF_WORKSPACE_ROLES]
  },
  {
    domain: MANAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'You publish a sensitive financial report to a workspace. You want to ensure that any future report built ON THIS SEMANTIC MODEL automatically inherits the "Confidential" sensitivity label. Which feature provides this?',
    options: opts4(
      'Sensitivity label downstream inheritance',
      'Bookmarks',
      'Themes',
      'Email subscriptions'
    ),
    correct: ['a'],
    explanation: 'Downstream inheritance propagates a sensitivity label from a semantic model to newly created reports that depend on it. The other features don\'t carry classification.',
    references: [REF_SENSITIVITY, REF_SEMANTIC_MODEL]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'Your tenant admin certified a corporate Date semantic model. What is the effect of certification on the model?',
    options: opts4(
      'It is hidden from non-admins',
      'It is marked with a Certified badge in lists and search results, signaling it as an authoritative, vetted asset for organization-wide reuse',
      'It is automatically deleted after 30 days',
      'It loses all relationships'
    ),
    correct: ['b'],
    explanation: 'Certified content carries a special badge and is prioritized in search/listings as a trusted source. Promotion is similar but less restricted. Certification doesn\'t hide, delete, or alter the model\'s structure.',
    references: [REF_PROMOTE, REF_SEMANTIC_MODEL]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want users to be able to access and modify a Power BI report\'s semantic model but not the model definition itself (so they can build new reports). What permission must they have on the semantic model?',
    options: opts4(
      'Build permission',
      'Workspace Admin role',
      'Sensitivity label "Public"',
      'Read on the underlying data source only'
    ),
    correct: ['a'],
    explanation: 'Build permission on a semantic model allows authoring new reports against it without giving model-edit rights. Admin role gives more than required; sensitivity labels classify; data source permissions are separate.',
    references: [REF_BUILD, REF_SEMANTIC_MODEL]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You publish reports through deployment pipelines from Dev → Test → Prod. Between stages, the semantic model needs to point to different SQL Server instances. Which deployment pipeline feature handles this rebinding without editing the .pbix?',
    options: opts4(
      'Deployment rules (data source rules)',
      'A new theme',
      'A new RLS role',
      'A new app'
    ),
    correct: ['a'],
    explanation: 'Deployment rules (data source rules, parameter rules) let you override values per stage so the same artifact targets the right environment without editing the source. The other options serve different needs.',
    references: [REF_DEPLOY, REF_WORKSPACE]
  },
  {
    domain: MANAGE, difficulty: 1, type: QType.SINGLE,
    stem: 'A user with a Power BI Free license attempts to view a report in a workspace on shared capacity. What happens?',
    options: opts4(
      'They see the report normally',
      'They cannot view content in shared-capacity workspaces; a Power BI Pro license (or Premium Per User) is required for collaboration in shared capacity',
      'Power BI emails them a printable copy',
      'They are auto-upgraded to Premium Per User'
    ),
    correct: ['b'],
    explanation: 'Sharing/collaboration in shared-capacity workspaces requires Pro or PPU licensing. Premium capacity allows Free users to consume content. The Power BI service does not auto-upgrade or auto-email.',
    references: [REF_WORKSPACE_ROLES, REF_SHARING]
  }
];

// ───────────────────── Practice Exam 3 ─────────────────────
const P3: Q[] = [
  // ── Prepare the data (18) ──
  {
    domain: PREPARE, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'You need to import data from a SharePoint Online list into Power BI Desktop. Which connector should you use?',
    options: opts4(
      'The Excel connector',
      'The SharePoint Online List connector',
      'The Web connector with a SOAP endpoint',
      'The OData connector pointed at /lists/_api/web/'
    ),
    correct: ['b'],
    explanation: 'The SharePoint Online List connector is the standard, user-friendly path. The OData connector can also work in advanced scenarios, but the SharePoint connector is recommended in the official docs. Excel and SOAP are not appropriate.',
    references: [REF_PQ_WHAT, REF_PQ_UI]
  },
  {
    domain: PREPARE, difficulty: 2, type: QType.SINGLE,
    stem: 'In Power Query, after applying many steps you notice the data preview becomes slow. Which is the recommended setting to reduce preview overhead during authoring?',
    options: opts4(
      'Disable column profiling for very large columns or set it to profile only the first 1,000 rows',
      'Add 50 more steps to break the chain',
      'Switch storage to DirectQuery',
      'Re-import the file in Binary mode'
    ),
    correct: ['a'],
    explanation: 'Power Query offers a "Column profiling based on top 1000 rows" toggle (default) vs "based on entire data set". Keeping profiling on a sample improves authoring responsiveness on large data.',
    references: [REF_PROFILE, REF_COLUMN_PROFILE]
  },
  {
    domain: PREPARE, difficulty: 2, type: QType.SINGLE,
    stem: 'A column contains user-entered "yes"/"YES"/"Yes". You want all variants treated identically in downstream analysis. Which clean-up pattern is best?',
    options: opts4(
      'Apply Uppercase (or Lowercase) transformation to normalize case',
      'Apply Remove Duplicates',
      'Apply Pivot',
      'Apply Transpose'
    ),
    correct: ['a'],
    explanation: 'Normalizing case ensures equality comparisons work uniformly. Remove Duplicates removes duplicate rows, doesn\'t normalize values; Pivot/Transpose are structural.',
    references: [REF_REPLACE, REF_PQ_UI]
  },
  {
    domain: PREPARE, difficulty: 1, type: QType.SINGLE,
    stem: 'You\'re writing a small custom M function to clean phone numbers. Where in Power Query do you write or edit M code directly?',
    options: opts4(
      'Modeling tab in Power BI Desktop',
      'The Advanced Editor in Power Query',
      'The DAX query view',
      'The Filters pane'
    ),
    correct: ['b'],
    explanation: 'Advanced Editor exposes the M code of a query for direct editing. Modeling tab is for DAX/data model; DAX query view runs DAX; Filters pane configures visual filters.',
    references: [REF_PQ_M, REF_PQ_UI]
  },
  {
    domain: PREPARE, difficulty: 2, type: QType.SINGLE,
    stem: 'You have a Power Query step that returns an Error for every row because the JSON column couldn\'t be parsed. You want to keep loading and tag those rows for investigation. Which approach is recommended?',
    options: opts4(
      'Use "Replace Errors" or "Add Column → Conditional" to mark error rows, then continue',
      'Delete the source file',
      'Disable refresh entirely',
      'Move the workspace to Free SKU'
    ),
    correct: ['a'],
    explanation: 'Replace Errors substitutes a sentinel value (or null) for error tokens so the query continues; you can then audit the substituted rows. The other options either drop data wholesale or are unrelated.',
    references: [REF_NULL, REF_PQ_UI]
  },
  {
    domain: PREPARE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to keep a query in the .pbix that is consumed by other queries (via Reference) but never load it into the model. What configuration achieves this?',
    options: opts4(
      'Right-click → Enable Load is unchecked (set to off)',
      'Delete the query',
      'Set the query to Live connection',
      'Pin the query to a dashboard'
    ),
    correct: ['a'],
    explanation: 'Unchecking Enable Load keeps the query available for referencing but excludes it from the model load. Deleting removes it entirely; Live connection is for semantic models; pinning is a UI metaphor unrelated to load.',
    references: [REF_LOAD, REF_REFERENCE]
  },
  {
    domain: PREPARE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Power BI dataflows.',
    options: opts4(
      'Dataflows let you centralize Power Query logic in the Power BI service so multiple semantic models can consume the same prepared data.',
      'Dataflow Gen2 (in Microsoft Fabric) can output to Lakehouses, Warehouses, or other destinations beyond the dataflow itself.',
      'Dataflows replace the need for an on-premises data gateway when reading on-premises sources.',
      'Dataflows are authored using the Power Query Online experience.'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'a, b, and d are accurate. c is false — dataflows that read on-premises sources still require a gateway because the dataflow itself runs in the cloud.',
    references: [REF_DATAFLOW, REF_GATEWAY]
  },
  {
    domain: PREPARE, difficulty: 2, type: QType.SINGLE,
    stem: 'A column "DateText" contains dates like "31/12/2024" (DD/MM/YYYY). When you convert to Date, several rows error because Power Query parses with the US locale. What is the recommended fix?',
    options: opts4(
      'Use "Using Locale..." in the Change Type dialog and choose English (United Kingdom) or another locale that uses DD/MM/YYYY',
      'Delete all rows that error',
      'Convert to Binary first',
      'Re-import via OData'
    ),
    correct: ['a'],
    explanation: 'Locale-aware conversions force Power Query to use the chosen culture\'s date format. The other options either lose data or don\'t address parsing.',
    references: [REF_DATA_TYPES, REF_TYPES]
  },
  {
    domain: PREPARE, difficulty: 2, type: QType.SINGLE,
    stem: 'A model has a fact table Sales (Import) and a dimension Product (Import). You want Product to support both Import-style fast joins and DirectQuery-style joins to a different fact table that is in DirectQuery. Which storage mode for Product accomplishes this?',
    options: opts4(
      'Import',
      'DirectQuery',
      'Dual',
      'Live'
    ),
    correct: ['c'],
    explanation: 'Dual storage lets a table participate efficiently in both Import and DirectQuery query paths in a composite model. Pure Import or DirectQuery limits behavior. Live is for semantic-model connections.',
    references: [REF_COMPOSITE, REF_MODES]
  },
  {
    domain: PREPARE, difficulty: 1, type: QType.SINGLE,
    stem: 'In Power Query, you want to verify that a column has no duplicate values before using it as a key. Which feature shows you that information at a glance?',
    options: opts4(
      'Column distribution shows distinct vs unique value counts',
      'Column quality shows valid/error/empty percentages only',
      'A measure',
      'A bookmark'
    ),
    correct: ['a'],
    explanation: 'Column distribution shows distinct (how many unique values) and unique (how many appear exactly once) counts — a fast way to spot duplicate keys. Column quality is about errors/blanks, not uniqueness; measures and bookmarks are unrelated.',
    references: [REF_PROFILE, REF_COLUMN_PROFILE]
  },
  {
    domain: PREPARE, difficulty: 2, type: QType.SINGLE,
    stem: 'You\'re building an inventory dataset that combines snapshot CSVs (one per day). Which Power Query operation combines them into one continuous fact table?',
    options: opts4(
      'Merge Queries',
      'Append Queries',
      'Pivot Columns',
      'Group By'
    ),
    correct: ['b'],
    explanation: 'Append stacks rows from multiple queries with matching columns — exactly what daily-snapshot CSVs need. Merge joins on a key; Pivot rotates values; Group By aggregates.',
    references: [REF_APPEND, REF_MERGE]
  },
  {
    domain: PREPARE, difficulty: 3, type: QType.SINGLE,
    stem: 'You want to enforce data privacy boundaries during query folding so that a private SQL Server source isn\'t combined with a public web source. Which Power Query setting governs this?',
    options: opts4(
      'Privacy Levels (Private, Organizational, Public)',
      'Sensitivity labels',
      'RLS roles',
      'Themes'
    ),
    correct: ['a'],
    explanation: 'Privacy Levels prevent Power Query from combining data across sources of differing trust during folding. Sensitivity labels classify exported content but don\'t block in-Power-Query folding. RLS filters rows by user; themes are styling.',
    references: [REF_PRIVACY, REF_CREDENTIALS]
  },
  {
    domain: PREPARE, difficulty: 1, type: QType.SINGLE,
    stem: 'In Power Query, you click "Use First Row as Headers". What does this do?',
    options: opts4(
      'It deletes the first row',
      'It promotes the first data row to the column-header row, then removes that row from the data',
      'It renames every column to "Header1", "Header2", …',
      'It opens the Advanced Editor'
    ),
    correct: ['b'],
    explanation: 'This common cleanup step replaces auto-generated headers (Column1, Column2, …) with the actual header values that appeared as the first data row. The other options describe unrelated actions.',
    references: [REF_PQ_UI, REF_PQ_WHAT]
  },
  {
    domain: PREPARE, difficulty: 2, type: QType.SINGLE,
    stem: 'A Power Query Step "Inserted Conditional Column" implements a CASE-like rule. You want the same logic to also be available in DAX, so visuals can apply it dynamically with slicers. What is true?',
    options: opts4(
      'Power Query computes the column at refresh time; DAX would need a measure or calculated column to express filter-aware behavior at query time',
      'Power Query and DAX are identical',
      'You can run DAX inside Power Query',
      'Conditional columns are deprecated'
    ),
    correct: ['a'],
    explanation: 'Power Query operates at refresh, materializing values; DAX operates at query time and can change based on visual filter context. Choose the layer based on whether the calculation depends on visual context.',
    references: [REF_CONDITIONAL_COLUMN, REF_DAX_BASICS]
  },
  {
    domain: PREPARE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to ensure that a numeric column with values like "1.23" is interpreted as a decimal even though the file uses a comma as decimal separator. Which Power Query feature helps?',
    options: opts4(
      'Locale-aware type conversion ("Using Locale...")',
      'Replace Values',
      'Pivot Column',
      'Transpose'
    ),
    correct: ['a'],
    explanation: 'Locale-aware conversion uses the chosen culture\'s decimal/thousands separators to parse numbers correctly. Replace Values is a stop-gap; Pivot and Transpose are unrelated.',
    references: [REF_DATA_TYPES, REF_TYPES]
  },
  {
    domain: PREPARE, difficulty: 1, type: QType.SINGLE,
    stem: 'A Power Query "Remove Duplicates" step affects which axis?',
    options: opts4(
      'Removes duplicate rows based on the selected columns',
      'Removes duplicate columns',
      'Removes duplicate workbooks',
      'Removes duplicate data sources'
    ),
    correct: ['a'],
    explanation: 'Remove Duplicates operates on rows; the engine compares values across the columns you select. The other options misdescribe the operation.',
    references: [REF_PQ_UI, REF_PQ_WHAT]
  },
  {
    domain: PREPARE, difficulty: 2, type: QType.SINGLE,
    stem: 'A data model contains 50 unused columns inherited from the source. From a performance standpoint, what is the recommended action?',
    options: opts4(
      'Hide them in the field list',
      'Remove them in Power Query so they never enter the model, reducing model size and refresh time',
      'Convert them to calculated columns',
      'Apply a theme'
    ),
    correct: ['b'],
    explanation: 'Hiding doesn\'t reduce footprint. Removing them upstream in Power Query is the recommended optimization for both refresh and storage. Calculated columns add overhead. Themes are unrelated.',
    references: [REF_OPTIMIZE, REF_PQ_UI]
  },
  {
    domain: PREPARE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to validate that two CSV files have the SAME schema before appending them. Which Power Query approach helps you compare?',
    options: opts4(
      'Use the column profile to inspect each source\'s columns; if mismatched, use Rename or Remove columns before Append',
      'Append blindly and hope schemas align',
      'Pivot one of the files',
      'Move data to DirectQuery'
    ),
    correct: ['a'],
    explanation: 'Comparing column names and types via profiling first, then aligning schemas via Rename/Remove/Reorder steps, ensures the Append produces a clean union. The other options either skip validation or are unrelated.',
    references: [REF_PROFILE, REF_APPEND]
  },

  // ── Model the data (18) ──
  {
    domain: MODEL, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'In DAX, which function returns a SCALAR value representing the sum of a column?',
    options: opts4(
      'SUMX',
      'SUM',
      'CALCULATE',
      'FILTER'
    ),
    correct: ['b'],
    explanation: 'SUM(column) returns a scalar aggregate. SUMX is an iterator; CALCULATE modifies context; FILTER returns a table.',
    references: [REF_DAX_BASICS, REF_MEASURES]
  },
  {
    domain: MODEL, difficulty: 2, type: QType.SINGLE,
    stem: 'You want a measure that calculates the maximum sales amount among customers in the current filter context. Which DAX is correct?',
    options: opts4(
      'MAX(Sales[Amount])',
      'MAXX(Customer, [Total Sales])',
      'TOPN(1, Sales)',
      'AVERAGE(Sales[Amount])'
    ),
    correct: ['b'],
    explanation: 'MAXX iterates Customer and evaluates [Total Sales] per customer (with context transition), then returns the maximum — exactly the per-customer max requested. MAX returns the max row-level amount. TOPN returns a table. AVERAGE is unrelated.',
    references: [REF_ITERATORS, REF_DAX_BASICS]
  },
  {
    domain: MODEL, difficulty: 1, type: QType.SINGLE,
    stem: 'A measure that uses TOTALYTD won\'t return year-to-date totals. Investigating, you find the Date table is not marked as a date table. What is the fix?',
    options: opts4(
      'In Model view, select the Date table, choose "Mark as date table", and pick the unique Date column',
      'Switch storage to DirectQuery',
      'Delete the Date table',
      'Apply a bookmark named "YTD"'
    ),
    correct: ['a'],
    explanation: 'Marking the date table is the prerequisite for reliable time intelligence. The other options are unrelated.',
    references: [REF_DATE_TABLE, REF_TOTALYTD]
  },
  {
    domain: MODEL, difficulty: 2, type: QType.SINGLE,
    stem: 'You author a measure: PreviousQuarter = CALCULATE([Sales], DATEADD(\'Date\'[Date], -1, QUARTER)). What does DATEADD do here?',
    options: opts4(
      'It shifts the current date filter back by one quarter',
      'It computes the average per quarter',
      'It removes all filters',
      'It deletes rows'
    ),
    correct: ['a'],
    explanation: 'DATEADD returns dates shifted by the specified interval (here, one quarter back) in the current filter context. The other choices misdescribe DATEADD.',
    references: [REF_DATEADD, REF_TIME_INTEL]
  },
  {
    domain: MODEL, difficulty: 2, type: QType.SINGLE,
    stem: 'In a Power BI model the relationship between Sales and Date is set to "Cross-filter direction: Both". What is the most common downside of this configuration?',
    options: opts4(
      'It reduces model file size',
      'It can introduce ambiguous filter paths and unexpected query results, and may hurt performance',
      'It encrypts the data',
      'It blocks RLS'
    ),
    correct: ['b'],
    explanation: 'Bidirectional filters add propagation paths that can yield ambiguous or unintended results and slow queries. They\'re sometimes necessary (e.g., for dynamic RLS) but shouldn\'t be the default. The other choices are inaccurate.',
    references: [REF_BIDIR, REF_RELATIONSHIPS_UNDERSTAND]
  },
  {
    domain: MODEL, difficulty: 3, type: QType.SINGLE,
    stem: 'You want a measure that returns Total Sales for the same period last year, ONLY for products that existed last year too. Which approach is correct?',
    options: opts4(
      'CALCULATE([Total Sales], SAMEPERIODLASTYEAR(\'Date\'[Date]))',
      'CALCULATE([Total Sales], SAMEPERIODLASTYEAR(\'Date\'[Date]), KEEPFILTERS(VALUES(Product[ProductID])))',
      'ALL(\'Date\') / [Total Sales]',
      'SUMX(Date, [Total Sales])'
    ),
    correct: ['b'],
    explanation: 'KEEPFILTERS preserves the existing product filter context while also applying SAMEPERIODLASTYEAR, ensuring the comparison is only for currently selected products. The simpler version overrides product context if used incorrectly.',
    references: [REF_KEEPFILTERS, REF_SAMEPERIODLY]
  },
  {
    domain: MODEL, difficulty: 2, type: QType.SINGLE,
    stem: 'You define a calculated column: Sales[ProductCategory] = RELATED(Product[Category]). What does RELATED do?',
    options: opts4(
      'It returns the Category value from Product for the current Sales row by following the many-to-one relationship',
      'It joins two tables for visualization only',
      'It removes a filter',
      'It creates an inactive relationship'
    ),
    correct: ['a'],
    explanation: 'RELATED retrieves a value from the related "one" side based on the relationship. The other choices misdescribe RELATED.',
    references: [REF_CALC_COLUMN, REF_RELATIONSHIPS]
  },
  {
    domain: MODEL, difficulty: 2, type: QType.SINGLE,
    stem: 'Your model uses many-to-many relationships through a bridge table. A user reports that totals don\'t add up — they over- or under-count. What is a likely cause and remediation?',
    options: opts4(
      'Storage mode is wrong; switch to DirectQuery',
      'The bridge introduces filter ambiguity; you may need to use DISTINCTCOUNT, explicit filter direction, or rework the schema with a factless fact bridge',
      'There are too many measures',
      'The theme is misconfigured'
    ),
    correct: ['b'],
    explanation: 'Many-to-many semantics frequently require explicit DAX handling (DISTINCTCOUNT, careful CROSSFILTER, or bridge-pattern modeling) to avoid duplicate counting. The other choices are unrelated.',
    references: [REF_M2M, REF_FACT_DIM]
  },
  {
    domain: MODEL, difficulty: 1, type: QType.SINGLE,
    stem: 'In DAX query view, you run "EVALUATE TOPN(10, Sales, Sales[Amount], DESC)". What does the query return?',
    options: opts4(
      'A table of the top 10 sales rows sorted by Amount descending',
      'A measure scalar',
      'An error because EVALUATE requires CALCULATE',
      'A bookmark'
    ),
    correct: ['a'],
    explanation: 'EVALUATE returns a table from a DAX query; TOPN here yields the 10 rows of Sales with the largest Amount. The other choices are wrong.',
    references: [REF_DAX_QUERY_VIEW, REF_DAX_BASICS]
  },
  {
    domain: MODEL, difficulty: 2, type: QType.SINGLE,
    stem: 'You want a measure that shows the running total of Sales across dates. Which approach is concise and idiomatic in DAX?',
    options: opts4(
      'CALCULATE([Total Sales], FILTER(ALL(\'Date\'[Date]), \'Date\'[Date] <= MAX(\'Date\'[Date])))',
      'SUM(Sales[Amount])',
      'AVERAGE(Sales[Date])',
      'A bookmark'
    ),
    correct: ['a'],
    explanation: 'The classic running-total pattern: open the date filter (ALL) and re-apply a less-than-or-equal date condition relative to the current visual context. The other choices either give the simple total or are unrelated.',
    references: [REF_FILTER_DAX, REF_CALCULATE]
  },
  {
    domain: MODEL, difficulty: 2, type: QType.SINGLE,
    stem: 'Which of the following is the BEST candidate to be a calculated column rather than a measure?',
    options: opts4(
      '"Customer Tenure Bucket" — a static text classification computed once per customer based on the customer\'s start date',
      '"Total Sales in current slicer context" — depends on the visual filters',
      '"Average over the last 6 months" — must respect slicers',
      '"Sales as % of grand total" — depends on context'
    ),
    correct: ['a'],
    explanation: 'A static, row-level classification fits a calculated column (computed at refresh, stored per row). The other three depend on visual filter context and must be measures.',
    references: [REF_CALC_COLUMN, REF_MEASURES]
  },
  {
    domain: MODEL, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about DAX context.',
    options: opts4(
      'Filter context is the set of filters from visuals, slicers, and CALCULATE that constrain a measure\'s evaluation.',
      'Row context exists when DAX iterates rows (e.g., inside SUMX or a calculated column expression).',
      'CALCULATE can convert row context into filter context (context transition).',
      'Measures inherit the row context of the calculated column they\'re defined next to.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'a, b, and c are correct. d is false — measures don\'t inherit a calculated column\'s row context; measures always evaluate in filter context (with implicit context transition when invoked inside an iterator).',
    references: [REF_CONTEXT, REF_CALCULATE]
  },
  {
    domain: MODEL, difficulty: 2, type: QType.SINGLE,
    stem: 'A semantic model exposes a measure [Sales] = SUM(Sales[Amount]). On a card it shows $1M. Inside SUMX(Customer, [Sales]) it still shows $1M, not the per-customer sum. Why?',
    options: opts4(
      'The customer relationship is missing or inactive — without filter propagation each iteration evaluates [Sales] in the entire context',
      'SUMX is broken',
      'Cards are special',
      'DirectQuery overrides'
    ),
    correct: ['a'],
    explanation: 'For per-customer iteration to yield per-customer values, the row context (the current Customer row) must propagate via a one-to-many relationship to Sales — otherwise CALCULATE\'s implicit context transition has no filter effect on Sales. Inspect/repair the relationship.',
    references: [REF_RELATIONSHIPS_UNDERSTAND, REF_CALCULATE]
  },
  {
    domain: MODEL, difficulty: 2, type: QType.SINGLE,
    stem: 'Which feature speeds up DirectQuery semantic models by pre-aggregating common queries in-memory while leaving raw data in the source?',
    options: opts4(
      'Aggregations (defining aggregation tables on top of DirectQuery fact tables)',
      'Calculated columns',
      'A theme',
      'A bookmark'
    ),
    correct: ['a'],
    explanation: 'Aggregations let you store summary tables in-memory and route queries to them when possible, falling back to DirectQuery for detail. This dramatically improves DQ performance for high-cardinality fact tables. The other options don\'t help DQ performance.',
    references: [REF_OPTIMIZE, REF_DIRECTQUERY]
  },
  {
    domain: MODEL, difficulty: 1, type: QType.SINGLE,
    stem: 'A calculated table is created from DAX expression like CountriesSubset = FILTER(Country, Country[Continent] = "EU"). What\'s a typical use case for a calculated table?',
    options: opts4(
      'Creating role-playing date tables (e.g., ShipDate, DeliveryDate) as copies of the main Date table',
      'Storing user passwords',
      'Issuing scheduled subscriptions',
      'Replacing themes'
    ),
    correct: ['a'],
    explanation: 'Calculated tables are commonly used for role-playing date dimensions, parameter tables (e.g., what-if), and tooling helper tables. Passwords, subscriptions, and themes are not relevant.',
    references: [REF_CALC_TABLE, REF_ROLE_PLAY]
  },
  {
    domain: MODEL, difficulty: 2, type: QType.SINGLE,
    stem: 'You want a measure [Cumulative Sales] that uses an existing measure [Total Sales]. The cumulative measure references [Total Sales] in a CALCULATE filter. This is legal because:',
    options: opts4(
      'Filter arguments can call measures wrapped in their own CALCULATE behavior — Boolean expressions cannot reference measures, but tables/iterators can',
      'You can never call a measure inside CALCULATE',
      'Measures are calculated columns',
      'Themes apply'
    ),
    correct: ['a'],
    explanation: 'Boolean filter expressions inside CALCULATE cannot reference measures directly (they\'d be ambiguous). However, table/iterator-based filters (like FILTER(ALL(\'Date\'), [Total Sales] > 0)) can invoke measures because the surrounding iterator provides the row context. The other choices are wrong.',
    references: [REF_CALCULATE, REF_FILTER_DAX]
  },
  {
    domain: MODEL, difficulty: 2, type: QType.SINGLE,
    stem: 'You define a measure [Sales YoY %] = DIVIDE([Sales] - [Sales LY], [Sales LY]). Where does this measure get the value of [Sales LY] for the comparison?',
    options: opts4(
      '[Sales LY] is evaluated in the same filter context as the visual, after applying its own CALCULATE/SAMEPERIODLASTYEAR (assuming that\'s its definition)',
      'From Power Query',
      'From a calculated column',
      'From the theme'
    ),
    correct: ['a'],
    explanation: 'Measures compose: [Sales LY] (presumably itself defined with SAMEPERIODLASTYEAR) is evaluated in the visual\'s filter context. The other answers misdescribe DAX evaluation.',
    references: [REF_DIVIDE, REF_SAMEPERIODLY]
  },
  {
    domain: MODEL, difficulty: 2, type: QType.SINGLE,
    stem: 'A measure named [Average Sale Per Order] should compute the mean order amount. Each order is a single row in Sales with Sales[OrderID] and Sales[Amount]. Which DAX is correct?',
    options: opts4(
      'AVERAGE(Sales[Amount])',
      'AVERAGEX(VALUES(Sales[OrderID]), CALCULATE(SUM(Sales[Amount])))',
      'SUM(Sales[Amount]) / COUNT(Sales[Amount])',
      'DIVIDE(SUM(Sales[Amount]), COUNTROWS(Customer))'
    ),
    correct: ['a'],
    explanation: 'When each order is exactly one row, AVERAGE(Sales[Amount]) returns the mean per order directly. AVERAGEX over orders would also be correct but is unnecessary at this grain. The third option is equivalent to AVERAGE only when there are no blanks; the fourth divides by customers, which is wrong.',
    references: [REF_DAX_BASICS, REF_MEASURES]
  },

  // ── Visualize and analyze the data (18) ──
  {
    domain: VISUALIZE, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'You want to compare two categories\' values at a single point in time using horizontal bars (long category labels). Which visual best fits?',
    options: opts4(
      'Bar chart (horizontal orientation)',
      'Pie chart',
      'KPI',
      'Slicer'
    ),
    correct: ['a'],
    explanation: 'Bar charts (horizontal) handle long category labels well and compare values across categories. Pie compares part-to-whole; KPI shows one number with a target; slicer is a filter control.',
    references: [REF_COLUMN_CHART, REF_VISUALS]
  },
  {
    domain: VISUALIZE, difficulty: 2, type: QType.SINGLE,
    stem: 'A scatter chart with hundreds of thousands of points is slow to render. Which Power BI feature down-samples points while preserving the distribution shape?',
    options: opts4(
      'High-density sampling on the scatter chart',
      'A bookmark',
      'A theme',
      'Sync slicers'
    ),
    correct: ['a'],
    explanation: 'Power BI\'s scatter chart applies high-density sampling to preserve the overall data shape at scale while improving rendering performance. The other features serve different needs.',
    references: [REF_SCATTER, REF_VISUALS]
  },
  {
    domain: VISUALIZE, difficulty: 2, type: QType.SINGLE,
    stem: 'You configure a "Custom tooltip" page for a chart visual. What is the prerequisite step?',
    options: opts4(
      'Mark a report page as a "Tooltip" page (Page size: Tooltip; Allow use as tooltip: On) and design it',
      'Apply a bookmark to the chart',
      'Switch the workspace to Free SKU',
      'Pin the chart to a dashboard'
    ),
    correct: ['a'],
    explanation: 'Tooltip pages must be designated by setting page properties (size = Tooltip, allow use as tooltip = on), then a visual\'s Tooltip property points to that page. Bookmarks, SKUs, and pins don\'t create tooltip pages.',
    references: [REF_TOOLTIPS, REF_VISUALS]
  },
  {
    domain: VISUALIZE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want a button that, when clicked, navigates to another page of the same report. Which button "Action" type do you use?',
    options: opts4(
      'Page navigation',
      'Bookmark',
      'Q&A',
      'Web URL'
    ),
    correct: ['a'],
    explanation: 'Page navigation action navigates to a chosen page. Bookmark replays state; Q&A opens the Q&A pane; Web URL opens a hyperlink.',
    references: [REF_NAV, REF_BOOKMARKS]
  },
  {
    domain: VISUALIZE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want different report pages to share the same date slicer selection without redundant slicers per page. Which feature solves this?',
    options: opts4(
      'Sync slicers (select pages to sync)',
      'Themes',
      'Drillthrough',
      'Bookmarks only'
    ),
    correct: ['a'],
    explanation: 'Sync slicers propagates the selection across chosen pages from a single slicer. Themes, drillthrough, and bookmarks have different purposes.',
    references: [REF_SYNC_SLICER, REF_SLICER]
  },
  {
    domain: VISUALIZE, difficulty: 2, type: QType.SINGLE,
    stem: 'A consumer wants to inspect a chart\'s underlying DAX query (for debugging or learning). How can a report AUTHOR see this in Power BI Desktop?',
    options: opts4(
      'Open Performance Analyzer → record a render → expand a visual → click Copy query, then paste/run in DAX query view',
      'Edit the .pbix XML',
      'Subscribe to the report',
      'Apply a theme'
    ),
    correct: ['a'],
    explanation: 'Performance Analyzer exposes the DAX query per visual via Copy query, and DAX query view can run it. The other options don\'t reveal the DAX.',
    references: [REF_PERF_ANALYZER, REF_DAX_QUERY_VIEW]
  },
  {
    domain: VISUALIZE, difficulty: 1, type: QType.SINGLE,
    stem: 'You want every value in a column chart\'s axis to show in dollars with two decimal places. Where do you configure this format?',
    options: opts4(
      'In Power BI Desktop, on the measure itself, set the format string (e.g., "$#,0.00")',
      'In Power Query, change the column to a Date type',
      'In the theme JSON only',
      'In a bookmark'
    ),
    correct: ['a'],
    explanation: 'Setting the format on the measure persists across every visual that uses it. Themes can default fonts/colors but not measure formats. Power Query type changes are unrelated. Bookmarks don\'t format measures.',
    references: [REF_MEASURES, REF_THEMES]
  },
  {
    domain: VISUALIZE, difficulty: 2, type: QType.SINGLE,
    stem: 'A report has a long list of products and a stakeholder wants to see only top 10 by Revenue in a chart. Which feature accomplishes this?',
    options: opts4(
      'A Top N filter on the visual (e.g., Top 10 by [Total Revenue])',
      'A bookmark group',
      'A theme',
      'A drillthrough page'
    ),
    correct: ['a'],
    explanation: 'Top N filters limit a visual to the highest or lowest N values by a chosen measure. Bookmarks/themes/drillthrough don\'t apply Top N.',
    references: [REF_FILTERS_PANE, REF_VISUALS]
  },
  {
    domain: VISUALIZE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want a paginated report that produces a 50-page PDF with one customer invoice per page. Which authoring tool produces this?',
    options: opts4(
      'Power BI Report Builder (for paginated reports)',
      'Power BI Desktop interactive report',
      'Power BI Q&A',
      'Power BI dashboards'
    ),
    correct: ['a'],
    explanation: 'Paginated reports authored in Power BI Report Builder are designed for pixel-perfect, multi-page printable output (invoices, statements, multi-page detail). Interactive reports, Q&A, and dashboards don\'t produce paginated output.',
    references: [REF_PAGINATED, REF_VISUALS]
  },
  {
    domain: VISUALIZE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to add bullet-point key insights below each chart that update with filters. Which feature provides this?',
    options: opts4(
      'Smart narrative visual (which can be customized with placeholders and dynamic values)',
      'A static text box',
      'A theme color change',
      'A KPI visual'
    ),
    correct: ['a'],
    explanation: 'Smart narrative generates and supports dynamic, filter-aware text. Static text boxes don\'t update. Theme/KPI don\'t describe insights.',
    references: [REF_SMART_NARRATIVE, REF_VISUALS]
  },
  {
    domain: VISUALIZE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want a slicer that lets users pick a value of "Comparison year" (e.g., 2023 vs 2024) that flows into a DAX measure for Year-over-year comparisons. Which feature is purpose-built?',
    options: opts4(
      'A field parameter that exposes Year values, used in a measure via SELECTEDVALUE',
      'A bookmark',
      'A theme',
      'Drillthrough'
    ),
    correct: ['a'],
    explanation: 'Field parameters provide a slicer-driven mechanism to select fields or values and consume them in measures via SELECTEDVALUE — ideal for "user picks comparison year". The other features serve different needs.',
    references: [REF_VISUAL_CALC, REF_DAX_BASICS]
  },
  {
    domain: VISUALIZE, difficulty: 1, type: QType.SINGLE,
    stem: 'A dashboard tile shows the current revenue. The author wants to receive an alert when the value drops below $1M. Which feature?',
    options: opts4(
      'A data alert on the dashboard tile',
      'A subscription',
      'A theme',
      'Drillthrough'
    ),
    correct: ['a'],
    explanation: 'Data alerts on dashboard tiles trigger notifications when thresholds are crossed. Subscriptions email snapshots regardless. The other options don\'t alert.',
    references: [REF_DATA_ALERTS, REF_DASHBOARDS]
  },
  {
    domain: VISUALIZE, difficulty: 2, type: QType.SINGLE,
    stem: 'A report consumer wants the report\'s mobile layout to have a single column of stacked cards. Which design step in Power BI Desktop enables this?',
    options: opts4(
      'Open the Mobile layout view and drag visuals into a phone-friendly arrangement (the desktop layout is unaffected)',
      'Apply a theme',
      'Use sync slicers',
      'Apply RLS'
    ),
    correct: ['a'],
    explanation: 'Mobile layout view designs a separate phone view without altering the desktop layout. Themes, sync slicers, and RLS don\'t produce mobile layouts.',
    references: [REF_MOBILE, REF_VISUALS]
  },
  {
    domain: VISUALIZE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want a "+" icon to expand or collapse a section in a matrix visual that groups Region → Country → City. Which matrix feature provides this?',
    options: opts4(
      'Hierarchical row drill-down with stepped layout, or expand-collapse icons enabled per row level',
      'A bookmark',
      'A theme',
      'A KPI'
    ),
    correct: ['a'],
    explanation: 'Matrix visuals support stepped layouts, drill-down, and per-row expand/collapse icons for hierarchical data. Bookmarks/themes/KPI don\'t provide hierarchy navigation.',
    references: [REF_MATRIX, REF_VISUALS]
  },
  {
    domain: VISUALIZE, difficulty: 2, type: QType.SINGLE,
    stem: 'A column chart shows monthly orders. You want a 12-month moving average line overlaid. Which Power BI feature adds this analytic overlay?',
    options: opts4(
      'Add a reference line or moving average via the Analytics pane (where supported by the visual)',
      'A bookmark',
      'A theme',
      'Drillthrough'
    ),
    correct: ['a'],
    explanation: 'The Analytics pane adds reference lines, average lines, forecasting, error bars and (on supported visuals) moving averages. The other options don\'t add analytic overlays.',
    references: [REF_FORECASTING, REF_LINE_CHART]
  },
  {
    domain: VISUALIZE, difficulty: 2, type: QType.SINGLE,
    stem: 'A user reports an accessibility issue: they cannot tab through the visuals on a page using a keyboard. What is the most likely fix?',
    options: opts4(
      'Set "Tab order" in the Selection pane and ensure visual titles and alt text are populated',
      'Apply a darker theme',
      'Enable a bookmark',
      'Move workspace to Free SKU'
    ),
    correct: ['a'],
    explanation: 'Tab order (Selection pane) and visual title/alt text are core accessibility settings. Themes affect contrast but not tab order. Bookmarks/SKU are unrelated.',
    references: [REF_ACCESSIBILITY, REF_SELECTION]
  },
  {
    domain: VISUALIZE, difficulty: 3, type: QType.SINGLE,
    stem: 'Copilot generates a report page for you based on a prompt like "Show me a sales overview by region". What is true about Copilot-generated content in Power BI?',
    options: opts4(
      'It is final and cannot be edited after generation',
      'The generated visuals are normal Power BI visuals that you can edit, format, and combine with manually authored content',
      'It bypasses RLS',
      'It does not require a Fabric/Premium capacity'
    ),
    correct: ['b'],
    explanation: 'Copilot-authored visuals are regular Power BI visuals — editable like any other. They respect RLS. Copilot does require an F2+ Fabric or P1+ Premium capacity.',
    references: [REF_COPILOT_PAGE, REF_COPILOT]
  },
  {
    domain: VISUALIZE, difficulty: 1, type: QType.SINGLE,
    stem: 'You want to use the Analyze feature to investigate why a metric increased. Which visual does this work on most naturally?',
    options: opts4(
      'A line chart or column chart with a measurable change between data points',
      'A slicer',
      'A static text box',
      'A theme'
    ),
    correct: ['a'],
    explanation: 'Right-clicking a data point in time-series visuals lets you choose Analyze → Explain the increase/decrease. Slicers and static elements have no data points to analyze.',
    references: [REF_ANALYZE, REF_LINE_CHART]
  },

  // ── Manage and secure Power BI (11) ──
  {
    domain: MANAGE, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'A report author publishes a .pbix to a workspace. Which Power BI role does the act of publishing typically require on that workspace?',
    options: opts4(
      'Viewer',
      'Contributor or higher',
      'No role; any user can publish',
      'Tenant Admin only'
    ),
    correct: ['b'],
    explanation: 'Publishing creates and edits content, which requires Contributor, Member, or Admin. Viewer cannot create or edit; tenant admin is not specifically required.',
    references: [REF_PUBLISH, REF_WORKSPACE_ROLES]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want users of your published app to be able to ASK the app a natural-language question scoped to the app\'s content (preview). Which feature in app settings enables this?',
    options: opts4(
      'Show Copilot in app navigation (in Advanced settings during app publish/update)',
      'Sensitivity label "Public"',
      'A bookmark',
      'A workspace rename'
    ),
    correct: ['a'],
    explanation: 'App-scoped Copilot is enabled per app via the Advanced settings "Show Copilot in app navigation" option. Sensitivity labels classify; bookmarks capture state; renaming doesn\'t enable Copilot.',
    references: [REF_APPS, REF_COPILOT]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'A team wants to share a Power BI report with 5 external partner users via Microsoft Entra B2B guest accounts. After granting access, the guests see no data even though RLS roles look correct. What is a typical cause and fix?',
    options: opts4(
      'B2B guest UPN format may differ (e.g., user_partner.com#EXT#@tenant.onmicrosoft.com) from what the user-mapping table expects; verify USERPRINCIPALNAME() returns the expected value for guests, and either add the guest directly to the RLS role or align the mapping format',
      'Disable RLS for guests',
      'Convert workspace to Free SKU',
      'Apply a theme'
    ),
    correct: ['a'],
    explanation: 'B2B UPN resolution can return alternate formats; troubleshooting includes confirming USERPRINCIPALNAME() and matching the user-mapping table. Disabling RLS would defeat security. Themes/SKU are unrelated.',
    references: [REF_RLS, REF_SENSITIVITY]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to use object-level security (OLS) to hide a "Salary" column from all users except HR. Why is OLS preferable to simply hiding the column in Power BI Desktop?',
    options: opts4(
      'Hiding in Desktop doesn\'t enforce access at query time — sophisticated users can unhide; OLS actually denies metadata and data to unauthorized roles',
      'Hiding is more secure than OLS',
      'OLS only works for paginated reports',
      'OLS is for visuals not tables'
    ),
    correct: ['a'],
    explanation: 'OLS denies metadata and data access at the engine level; hidden is just a UI affordance. OLS is enforced by role; users without permission cannot even see the column exists.',
    references: [REF_OLS, REF_RLS]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You publish a Power BI report to a workspace. Other team members say they cannot see it. What is the most common cause?',
    options: opts4(
      'They have not been added to the workspace (or to an app/share that exposes the report)',
      'The .pbix is corrupted',
      'Power BI is offline',
      'The theme is missing'
    ),
    correct: ['a'],
    explanation: 'Workspace role membership or app/share grants control visibility. Corruption is rare. Power BI uptime is high. Themes don\'t hide reports.',
    references: [REF_WORKSPACE_ROLES, REF_SHARING]
  },
  {
    domain: MANAGE, difficulty: 1, type: QType.SINGLE,
    stem: 'A user wants daily emailed snapshots of a report page. Which feature provides this?',
    options: opts4(
      'A subscription to the report (with a frequency and recipients)',
      'A data alert',
      'A theme',
      'A bookmark'
    ),
    correct: ['a'],
    explanation: 'Subscriptions send scheduled snapshots (and optionally a link) on a configured cadence. Data alerts fire on threshold breach. Themes/bookmarks don\'t schedule emails.',
    references: [REF_SUBSCRIPTIONS, REF_DASHBOARDS]
  },
  {
    domain: MANAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'A semantic model in DirectQuery mode connects to an Azure SQL Database. Single sign-on (SSO) is enabled. Users see only data their SQL Server account has rights to. Why might "Test as role" inside Power BI not be a reliable validation here?',
    options: opts4(
      'Test as role uses your own identity in the Power BI service, and for DirectQuery with SSO this isn\'t the same as the actual end-user\'s SQL Server identity — sign in as the actual user to validate',
      'Test as role is broken',
      'DirectQuery does not support security',
      'SSO disables semantic models'
    ),
    correct: ['a'],
    explanation: 'Per Microsoft docs, Test as role does not work for DirectQuery models with SSO enabled because the underlying source enforces a per-user identity. Validate by signing in as the actual user.',
    references: [REF_RLS, REF_DIRECTQUERY]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'A user wants to share a report\'s URL with a colleague but limit them to viewing only — no copy, no export. Which is most appropriate?',
    options: opts4(
      'Share with view-only permissions through the share dialog (no Build, no Reshare), and apply a sensitivity label that restricts export if needed',
      'Email a screenshot of the report',
      'Republish to a Free workspace',
      'Apply a theme named "ReadOnly"'
    ),
    correct: ['a'],
    explanation: 'Sharing with view-only permissions (no Build, no Reshare) and applying a sensitivity label with appropriate restrictions limits what the recipient can do. Screenshots are uncontrolled; Free SKU/themes are unrelated.',
    references: [REF_SHARING, REF_SENSITIVITY]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to track and report on which sensitive reports were viewed or exported. Which Power BI capability provides this audit data?',
    options: opts4(
      'Power BI activity logs and the unified audit log in Microsoft Purview',
      'A bookmark',
      'A theme',
      'A subscription'
    ),
    correct: ['a'],
    explanation: 'Audit data lives in Power BI activity logs and the Microsoft Purview unified audit log, including sensitivity-label activities and content access. Bookmarks/themes/subscriptions are not audit features.',
    references: [REF_SENSITIVITY, REF_WORKSPACE_ROLES]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'A user wants to create their own report against a Certified semantic model that lives in a different workspace. What permissions do they need?',
    options: opts4(
      'Build permission on the semantic model (granted to them or their group)',
      'Workspace Admin on the source workspace',
      'Tenant Admin',
      'A sensitivity label of "Public"'
    ),
    correct: ['a'],
    explanation: 'Build permission on a semantic model is the minimum and recommended grant for cross-workspace report authoring against an Endorsed shared model. Admin and Tenant Admin are excessive; sensitivity labels are unrelated.',
    references: [REF_BUILD, REF_PROMOTE]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want users to consume a Power BI report only via a published app and never directly from the workspace. Which approach is recommended?',
    options: opts4(
      'Give users access only to the app (not to the workspace) and publish the report to the app; they can install/open the app to consume it',
      'Add users as workspace Admins',
      'Apply a theme',
      'Pin the report to OneDrive'
    ),
    correct: ['a'],
    explanation: 'Apps are the recommended distribution channel for consumption-only audiences: users only need app access, not workspace access. Adding them as Admins gives edit rights (wrong); themes and OneDrive are unrelated.',
    references: [REF_APPS, REF_WORKSPACE_ROLES]
  }
];

const PL300_DOMAINS = [
  { name: PREPARE, weight: 28 },
  { name: MODEL, weight: 28 },
  { name: VISUALIZE, weight: 28 },
  { name: MANAGE, weight: 16 }
];

const PL300_EXAMS: { slug: string; code: string; titleSuffix: string; descriptionSuffix: string; questions: Q[] }[] = [
  {
    slug: 'microsoft-pl-300-p1',
    code: 'PL-300-P1',
    titleSuffix: 'Practice Exam 1',
    descriptionSuffix: 'Practice exam 1 of 3 — a full 100-minute, 65-question, blueprint-weighted set covering preparing data with Power Query, modeling with DAX, visualizing & analyzing reports, and managing & securing Power BI content.',
    questions: P1
  },
  {
    slug: 'microsoft-pl-300-p2',
    code: 'PL-300-P2',
    titleSuffix: 'Practice Exam 2',
    descriptionSuffix: 'Practice exam 2 of 3 — a second 100-minute, 65-question, blueprint-weighted set.',
    questions: P2
  },
  {
    slug: 'microsoft-pl-300-p3',
    code: 'PL-300-P3',
    titleSuffix: 'Practice Exam 3',
    descriptionSuffix: 'Practice exam 3 of 3 — a third 100-minute, 65-question, blueprint-weighted set.',
    questions: P3
  }
];

const PL300_BUNDLE = {
  slug: 'microsoft-pl-300',
  title: 'Microsoft Power BI Data Analyst Associate (PL-300)',
  description: 'All 3 PL-300 practice exams in one bundle — covering preparing data with Power Query, modeling with DAX, visualizing & analyzing reports, and managing & securing Power BI content, aligned to the official Microsoft Power BI Data Analyst Associate (PL-300) study guide.',
  price: 2000, // USD 20 — PRACTICE tier
  priceVoucher: 16500 // USD 165 — VOUCHER tier
};

type SeedResult = {
  vendor: 'created' | 'updated';
  exams: { slug: string; questionCount: number; teaserCount: number }[];
  bundle: 'created' | 'updated';
};

/**
 * Idempotent seed for the PL-300 bundle. Safe to call repeatedly —
 * vendor / exam / bundle rows are upserted, and questions tagged
 * `generatedBy: 'manual:pl300-seed'` are deleted and re-created.
 *
 * Pass an existing PrismaClient (lifecycle managed by caller).
 */
export async function seedPl300(db: PrismaClient): Promise<SeedResult> {
  const existingVendor = await db.vendor.findUnique({ where: { slug: 'microsoft' } });
  await db.vendor.upsert({
    where: { slug: 'microsoft' },
    update: { name: 'Microsoft', description: 'Microsoft certifications — Power BI data analytics, Microsoft 365 administration, Azure cloud, Power Platform, and the role-based certification track including the Microsoft Power BI Data Analyst Associate (PL-300) credential.' },
    create: { slug: 'microsoft', name: 'Microsoft', description: 'Microsoft certifications — Power BI data analytics, Microsoft 365 administration, Azure cloud, Power Platform, and the role-based certification track including the Microsoft Power BI Data Analyst Associate (PL-300) credential.' }
  });
  const vendor = await db.vendor.findUniqueOrThrow({ where: { slug: 'microsoft' } });

  const examResults: SeedResult['exams'] = [];
  const examIds: Record<string, string> = {};

  for (const e of PL300_EXAMS) {
    const title = `Microsoft Power BI Data Analyst Associate (PL-300) — ${e.titleSuffix}`;
    const description = `${e.descriptionSuffix} Aligned to the official Microsoft PL-300 study guide.`;
    const examData = {
      title,
      code: e.code,
      description,
      level: 'Associate',
      durationMinutes: 100,
      passingScore: 70,
      questionCount: e.questions.length,
      domains: PL300_DOMAINS,
      published: true
    };
    const exam = await db.exam.upsert({
      where: { slug: e.slug },
      update: examData,
      create: { ...examData, slug: e.slug, vendorId: vendor.id }
    });
    examIds[e.slug] = exam.id;

    // PL-300 had a pre-existing question pool from earlier seed generations
    // (manual:microsoft-pl-300-p1/p2/p3, topup:microsoft-pl-300:*, claude-sonnet-4-6).
    // The Wave-3 rebuild replaces all of it: delete every question on these
    // exam rows before inserting the curated 195. Idempotent — re-running
    // seeds the same 195 from scratch.
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
          generatedBy: 'manual:pl300-seed',
          isTeaser: !!q.isTeaser
        }
      });
      if (q.isTeaser) teaserCount++;
    }
    examResults.push({ slug: e.slug, questionCount: e.questions.length, teaserCount });
  }

  const existingBundle = await db.bundle.findUnique({ where: { slug: PL300_BUNDLE.slug } });
  const bundle = await db.bundle.upsert({
    where: { slug: PL300_BUNDLE.slug },
    update: {
      title: PL300_BUNDLE.title,
      description: PL300_BUNDLE.description,
      price: PL300_BUNDLE.price,
      priceVoucher: PL300_BUNDLE.priceVoucher,
      published: true
    },
    create: {
      slug: PL300_BUNDLE.slug,
      title: PL300_BUNDLE.title,
      description: PL300_BUNDLE.description,
      price: PL300_BUNDLE.price,
      priceVoucher: PL300_BUNDLE.priceVoucher,
      published: true
    }
  });

  // Replace bundle items deterministically: drop existing, recreate.
  await db.bundleItem.deleteMany({ where: { bundleId: bundle.id } });
  const items = [
    { examSlug: 'microsoft-pl-300-p1', tier: 'PRACTICE' as const, position: 1 },
    { examSlug: 'microsoft-pl-300-p2', tier: 'PRACTICE' as const, position: 2 },
    { examSlug: 'microsoft-pl-300-p3', tier: 'PRACTICE' as const, position: 3 },
    { examSlug: 'microsoft-pl-300-p1', tier: 'VOUCHER' as const, position: 4 }
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
