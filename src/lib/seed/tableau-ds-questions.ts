/**
 * Tableau Desktop Specialist bundle seed — vendor, three practice-exam
 * variants, bundle, and 195 blueprint-aligned questions. Idempotent:
 * replaces rows tagged `generatedBy: 'manual:tableau-ds-seed'` and
 * upserts catalog rows.
 *
 * Exported as `seedTableauDs(db)` so the same code path is reachable
 * from the standalone CLI shim (`prisma/seeds/tableau-ds.ts`) and the
 * protected admin API (`/api/admin/seed-tableau-ds`) — letting us
 * bootstrap the production database without redeploying.
 *
 * Question content is authored against the public Tableau Help docs and
 * the Tableau Desktop Specialist domain blueprint:
 *   - Connecting to and Preparing Data    — 25% (16 / variant)
 *   - Exploring and Analyzing Data        — 35% (23 / variant)
 *   - Sharing Insights                    — 20% (13 / variant)
 *   - Understanding Tableau Concepts      — 20% (13 / variant)
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

const CONNECT = 'Connecting to and Preparing Data';
const EXPLORE = 'Exploring and Analyzing Data';
const SHARE = 'Sharing Insights';
const CONCEPTS = 'Understanding Tableau Concepts';

const REF_CONNECT = { label: 'Tableau Help — Connect to Data', url: 'https://help.tableau.com/current/pro/desktop/en-us/exampleconnections_overview.htm' };
const REF_JOINS = { label: 'Tableau Help — Join Your Data', url: 'https://help.tableau.com/current/pro/desktop/en-us/joining_tables.htm' };
const REF_BLEND = { label: 'Tableau Help — Blend Your Data', url: 'https://help.tableau.com/current/pro/desktop/en-us/multiple_connections.htm' };
const REF_RELATE = { label: 'Tableau Help — Relate Your Data', url: 'https://help.tableau.com/current/pro/desktop/en-us/relate_tables.htm' };
const REF_UNION = { label: 'Tableau Help — Union Your Data', url: 'https://help.tableau.com/current/pro/desktop/en-us/union.htm' };
const REF_EXTRACT = { label: 'Tableau Help — Extract Your Data', url: 'https://help.tableau.com/current/pro/desktop/en-us/extracting_data.htm' };
const REF_LIVEEXTRACT = { label: 'Tableau Help — Refresh Extracts', url: 'https://help.tableau.com/current/pro/desktop/en-us/extracting_refresh.htm' };
const REF_PIVOT = { label: 'Tableau Help — Pivot Data (from columns to rows)', url: 'https://help.tableau.com/current/pro/desktop/en-us/pivot.htm' };
const REF_SPLIT = { label: 'Tableau Help — Split a Field into Multiple Fields', url: 'https://help.tableau.com/current/pro/desktop/en-us/split.htm' };
const REF_METADATA = { label: 'Tableau Help — Metadata Grid in the Data Source Page', url: 'https://help.tableau.com/current/pro/desktop/en-us/datafields_typesandroles_datatypes.htm' };
const REF_DATATYPES = { label: 'Tableau Help — Data Types', url: 'https://help.tableau.com/current/pro/desktop/en-us/datafields_typesandroles_datatypes.htm' };
const REF_DATAINTERPRETER = { label: 'Tableau Help — Clean Data with Data Interpreter', url: 'https://help.tableau.com/current/pro/desktop/en-us/data_interpreter.htm' };
const REF_DATASERVER = { label: 'Tableau Help — Publish a Data Source', url: 'https://help.tableau.com/current/pro/desktop/en-us/publish_datasources.htm' };
const REF_FIELDS = { label: 'Tableau Help — Organize and Customize Fields in the Data Pane', url: 'https://help.tableau.com/current/pro/desktop/en-us/datafields_dwfeatures.htm' };
const REF_DIMMEAS = { label: 'Tableau Help — Dimensions and Measures, Blue and Green', url: 'https://help.tableau.com/current/pro/desktop/en-us/datafields_typesandroles.htm' };
const REF_AGG = { label: 'Tableau Help — Aggregate Functions in Tableau', url: 'https://help.tableau.com/current/pro/desktop/en-us/calculations_aggregation.htm' };
const REF_CALC = { label: 'Tableau Help — Get Started with Calculations in Tableau', url: 'https://help.tableau.com/current/pro/desktop/en-us/calculations_calculatedfields_create.htm' };
const REF_LOD = { label: 'Tableau Help — Level of Detail Expressions', url: 'https://help.tableau.com/current/pro/desktop/en-us/calculations_calculatedfields_lod.htm' };
const REF_TABLECALC = { label: 'Tableau Help — Transform Values with Table Calculations', url: 'https://help.tableau.com/current/pro/desktop/en-us/calculations_tablecalculations.htm' };
const REF_FILTER = { label: 'Tableau Help — Filter Data from Your Views', url: 'https://help.tableau.com/current/pro/desktop/en-us/filtering.htm' };
const REF_FILTERORDER = { label: 'Tableau Help — Tableau Order of Operations', url: 'https://help.tableau.com/current/pro/desktop/en-us/order_of_operations.htm' };
const REF_SORT = { label: 'Tableau Help — Sort Data in a Visualization', url: 'https://help.tableau.com/current/pro/desktop/en-us/sortgroup_sorting_computed_howto.htm' };
const REF_GROUP = { label: 'Tableau Help — Group Your Data', url: 'https://help.tableau.com/current/pro/desktop/en-us/sortgroup_groups.htm' };
const REF_SET = { label: 'Tableau Help — Create Sets', url: 'https://help.tableau.com/current/pro/desktop/en-us/sortgroup_sets_create.htm' };
const REF_HIERARCHY = { label: 'Tableau Help — Create Hierarchies', url: 'https://help.tableau.com/current/pro/desktop/en-us/qs_hierarchies.htm' };
const REF_BINS = { label: 'Tableau Help — Create Bins from a Continuous Measure', url: 'https://help.tableau.com/current/pro/desktop/en-us/calculations_bins.htm' };
const REF_PARAM = { label: 'Tableau Help — Create Parameters', url: 'https://help.tableau.com/current/pro/desktop/en-us/parameters_create.htm' };
const REF_DATES = { label: 'Tableau Help — Change Date Levels', url: 'https://help.tableau.com/current/pro/desktop/en-us/dates_levels.htm' };
const REF_DISCCONT = { label: 'Tableau Help — Discrete and Continuous Fields', url: 'https://help.tableau.com/current/pro/desktop/en-us/datafields_typesandroles_data_types.htm' };
const REF_SHOWME = { label: 'Tableau Help — Use Show Me to Start a View', url: 'https://help.tableau.com/current/pro/desktop/en-us/buildmanual_showme.htm' };
const REF_MARKS = { label: 'Tableau Help — Control the Appearance of Marks in the View', url: 'https://help.tableau.com/current/pro/desktop/en-us/viewparts_marks.htm' };
const REF_MAPS = { label: 'Tableau Help — Get Started Mapping with Tableau', url: 'https://help.tableau.com/current/pro/desktop/en-us/maps_build.htm' };
const REF_REFLINE = { label: 'Tableau Help — Reference Lines, Bands, Distributions, and Boxes', url: 'https://help.tableau.com/current/pro/desktop/en-us/reference_lines.htm' };
const REF_TRENDLINE = { label: 'Tableau Help — Add Trend Lines to a Visualization', url: 'https://help.tableau.com/current/pro/desktop/en-us/trendlines_add.htm' };
const REF_HIGHLIGHT = { label: 'Tableau Help — Highlight Data Points in Context', url: 'https://help.tableau.com/current/pro/desktop/en-us/actions_highlight.htm' };
const REF_DASHBOARD = { label: 'Tableau Help — Create a Dashboard', url: 'https://help.tableau.com/current/pro/desktop/en-us/dashboards_create.htm' };
const REF_DASHACTION = { label: 'Tableau Help — Actions and Dashboards', url: 'https://help.tableau.com/current/pro/desktop/en-us/actions_dashboards.htm' };
const REF_STORY = { label: 'Tableau Help — Create a Story', url: 'https://help.tableau.com/current/pro/desktop/en-us/story_create.htm' };
const REF_EXPORT = { label: 'Tableau Help — Export Views and Workbooks', url: 'https://help.tableau.com/current/pro/desktop/en-us/save_export_image.htm' };
const REF_SHARE = { label: 'Tableau Help — Share Your Work', url: 'https://help.tableau.com/current/pro/desktop/en-us/publish_workbooks_share.htm' };
const REF_FORMAT = { label: 'Tableau Help — Format at the Workbook Level', url: 'https://help.tableau.com/current/pro/desktop/en-us/formatting_workbook.htm' };
const REF_TOOLTIP = { label: 'Tableau Help — Add Tooltips to Marks', url: 'https://help.tableau.com/current/pro/desktop/en-us/formatting_tooltip.htm' };
const REF_LEGEND = { label: 'Tableau Help — Legends, Highlighters, and Cards', url: 'https://help.tableau.com/current/pro/desktop/en-us/view_parts.htm' };
const REF_FILES = { label: 'Tableau Help — Tableau File Types and Folders', url: 'https://help.tableau.com/current/pro/desktop/en-us/environ_filesandfolders.htm' };
const REF_INTERFACE = { label: 'Tableau Help — The Tableau Workspace', url: 'https://help.tableau.com/current/pro/desktop/en-us/environment_workspace.htm' };
const REF_VIZTYPES = { label: 'Tableau Help — Building Common Chart Types', url: 'https://help.tableau.com/current/pro/desktop/en-us/dataview_examples.htm' };
const REF_PERFORMANCE = { label: 'Tableau Help — Tips for Designing Efficient Workbooks', url: 'https://help.tableau.com/current/pro/desktop/en-us/perf_tips.htm' };
const REF_PUBLIC = { label: 'Tableau Help — Save Workbooks to Tableau Public', url: 'https://help.tableau.com/current/pro/desktop/en-us/publish_workbooks_tableaupublic.htm' };

// Helper to build 4-option SINGLE questions with id 'a','b','c','d'.
const opts4 = (a: string, b: string, c: string, d: string): Opt[] => [
  { id: 'a', text: a }, { id: 'b', text: b }, { id: 'c', text: c }, { id: 'd', text: d }
];

// ───────────────────── Practice Exam 1 ─────────────────────
const P1: Q[] = [
  // ── Connecting to and Preparing Data (16) ──
  {
    domain: CONNECT, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'You want to connect Tableau Desktop to a Microsoft Excel workbook stored on your local machine. Under which category in the Connect pane do you find Excel?',
    options: opts4(
      'To a Server',
      'To a File',
      'Saved Data Sources only',
      'Tableau Server connectors only'
    ),
    correct: ['b'],
    explanation: 'Excel is a local file-based data source, so it appears under the "To a File" category of the Connect pane along with Text file, JSON, PDF, and Tableau extracts. Server connections (databases, cloud) appear under "To a Server".',
    references: [REF_CONNECT]
  },
  {
    domain: CONNECT, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What is the difference between a live connection and an extract connection to a data source in Tableau Desktop?',
    options: opts4(
      'A live connection queries the source data in real time; an extract is a compressed snapshot (.hyper) saved locally.',
      'A live connection always copies all data into memory; an extract queries the source directly.',
      'They are identical except an extract cannot be refreshed.',
      'A live connection works only with files; an extract works only with databases.'
    ),
    correct: ['a'],
    explanation: 'A live connection issues queries directly against the source so the view reflects current data. An extract is a saved subset/snapshot stored in Tableau\'s optimized Hyper format that can be refreshed on demand or on a schedule and improves performance / enables offline use.',
    references: [REF_EXTRACT]
  },
  {
    domain: CONNECT, difficulty: 2, type: QType.SINGLE,
    stem: 'Two tables, Orders and Returns, share an Order ID column. You want every row from Orders and only the matching rows from Returns. Which join type should you use?',
    options: opts4(
      'Inner join',
      'Left join (Orders on the left)',
      'Right join (Orders on the left)',
      'Full outer join'
    ),
    correct: ['b'],
    explanation: 'A left join keeps all rows from the left table (Orders) and brings in matching rows from the right table (Returns), filling unmatched Returns columns with null. An inner join would drop Orders without returns; a full outer join would also include unmatched Returns.',
    references: [REF_JOINS]
  },
  {
    domain: CONNECT, difficulty: 2, type: QType.SINGLE,
    stem: 'You have 12 monthly CSV files with identical columns (Jan.csv … Dec.csv) and want them stacked into one table. Which Tableau data-prep feature should you use?',
    options: opts4(
      'Join',
      'Blend',
      'Union',
      'Pivot'
    ),
    correct: ['c'],
    explanation: 'Union appends rows from tables with the same structure, stacking the 12 files into a single table. A wildcard union can automatically include files matching a pattern. Joins combine columns, blends combine aggregated results from separate sources, and pivot reshapes columns to rows.',
    references: [REF_UNION]
  },
  {
    domain: CONNECT, difficulty: 3, type: QType.SINGLE,
    stem: 'A survey table has 12 columns named Q1 Score, Q2 Score … Q12 Score. You need a single Question field and a single Score field for analysis. Which data-prep action accomplishes this?',
    options: opts4(
      'Split the columns',
      'Pivot the 12 score columns from columns to rows',
      'Create a calculated field with CASE',
      'Union the columns'
    ),
    correct: ['b'],
    explanation: 'Pivoting columns to rows converts the wide layout (12 score columns) into a tall layout with one row per question, producing a Pivot Field Names (Question) and Pivot Field Values (Score) pair — the analysis-friendly tidy shape.',
    references: [REF_PIVOT]
  },
  {
    domain: CONNECT, difficulty: 2, type: QType.SINGLE,
    stem: 'A Full Name column contains values like "Smith, John". You want separate Last Name and First Name fields. Which feature is the quickest?',
    options: opts4(
      'Pivot',
      'Split (or Custom Split on the comma)',
      'Union',
      'Group'
    ),
    correct: ['b'],
    explanation: 'Split (and Custom Split) divides a string field into multiple fields based on a separator such as the comma, producing Full Name - Split 1 and Full Name - Split 2. Tableau can often auto-detect the pattern with the "Split" option in the field menu.',
    references: [REF_SPLIT]
  },
  {
    domain: CONNECT, difficulty: 2, type: QType.SINGLE,
    stem: 'In the Data Source page, a field that should be a date is showing the # (number) data type icon. What should you do so date functions work correctly?',
    options: opts4(
      'Rename the field to "Date"',
      'Change the field\'s data type to Date (or Date & Time)',
      'Hide the field',
      'Create a group on the field'
    ),
    correct: ['b'],
    explanation: 'The data-type icon on the column (or in the Data pane) can be clicked to change the field\'s type. Setting it to Date or Date & Time enables date-part/date-trunc behavior, date filters, and the date hierarchy. Renaming alone does not change the underlying type.',
    references: [REF_DATATYPES]
  },
  {
    domain: CONNECT, difficulty: 2, type: QType.SINGLE,
    stem: 'An Excel sheet has titles and blank rows above the real header row, so Tableau imports messy columns. Which Tableau feature can automatically detect and clean this?',
    options: opts4(
      'Data Interpreter',
      'Pivot',
      'Custom SQL',
      'Extract filters'
    ),
    correct: ['a'],
    explanation: 'Data Interpreter scans Excel/CSV/PDF sources for embedded titles, notes, blank rows, and sub-tables, then proposes a cleaned interpretation of the data. You can review the changes and accept or turn it off.',
    references: [REF_DATAINTERPRETER]
  },
  {
    domain: CONNECT, difficulty: 3, type: QType.SINGLE,
    stem: 'You need data from a SQL Server table and an Excel file combined in one view, but the two sources cannot be joined at the database level. Which approach is appropriate?',
    options: opts4(
      'A cross-database join is impossible; you must export both to CSV first',
      'Use data blending: set a primary data source and blend the secondary on a common dimension',
      'Use a union of the two sources',
      'Use a parameter to switch sources'
    ),
    correct: ['b'],
    explanation: 'Data blending combines data from separate, already-aggregated data sources on a common linking field. It is appropriate when sources are at different levels of detail or in systems you cannot join directly. The primary source defines the view; the secondary supplies aggregated, blended values.',
    references: [REF_BLEND]
  },
  {
    domain: CONNECT, difficulty: 3, type: QType.SINGLE,
    stem: 'Using the newer Tableau data model, you drag two tables onto the canvas and connect them with a noodle without specifying a join type. What have you created?',
    options: opts4(
      'A union',
      'A relationship (logical layer)',
      'A blend',
      'A custom SQL query'
    ),
    correct: ['b'],
    explanation: 'Dragging tables together with the "noodle" creates a relationship in the logical layer. Relationships are flexible — Tableau chooses the appropriate join automatically per sheet based on the fields used and keeps the right level of detail without duplicating or filtering rows the way fixed joins can.',
    references: [REF_RELATE]
  },
  {
    domain: CONNECT, difficulty: 2, type: QType.SINGLE,
    stem: 'Creating an extract can improve workbook performance and allows you to work offline because the data is stored locally in Tableau\'s Hyper format.',
    options: opts4('True', 'False', 'Only true for cloud sources', 'Only true if the extract is unfiltered'),
    correct: ['a'],
    explanation: 'True. Extracts are stored in the high-performance Hyper engine on local disk, so queries are fast and the workbook can be used without a connection to the original source. Extracts can also be filtered, aggregated, or limited to top N rows.',
    references: [REF_EXTRACT]
  },
  {
    domain: CONNECT, difficulty: 2, type: QType.SINGLE,
    stem: 'You added a filter to an extract so it only contains rows where Region = "West". This is an example of which extract option?',
    options: opts4(
      'Aggregate for visible dimensions',
      'An extract (data source) filter that limits the rows stored',
      'A context filter',
      'A table calculation'
    ),
    correct: ['b'],
    explanation: 'An extract filter restricts which rows are pulled into the .hyper extract itself, permanently reducing its size and scope. This differs from a worksheet filter, which only hides data in a particular view while leaving the extract intact.',
    references: [REF_EXTRACT]
  },
  {
    domain: CONNECT, difficulty: 1, type: QType.SINGLE,
    stem: 'In the Data Source page, where can you rename a field, hide it, or change its data type before building views?',
    options: opts4(
      'Only in the Analysis menu',
      'In the metadata grid / data grid of the Data Source page',
      'Only after publishing to Tableau Server',
      'Only in a calculated field'
    ),
    correct: ['b'],
    explanation: 'The Data Source page exposes the data grid and metadata grid where you can rename fields, hide unused columns, change data types and geographic roles, split fields, and apply aliases before building worksheets.',
    references: [REF_METADATA]
  },
  {
    domain: CONNECT, difficulty: 3, type: QType.SINGLE,
    stem: 'A relationship between Orders and Products is defined on Product ID. In a sheet you use only fields from Orders. How many rows does Tableau query?',
    options: opts4(
      'It always materializes the full join of both tables',
      'It queries only the Orders table because no Products fields are used (context-aware querying)',
      'It returns zero rows until both tables are used',
      'It unions the two tables'
    ),
    correct: ['b'],
    explanation: 'With relationships, Tableau performs context-aware querying: it only brings in a related table when fields from it are actually used in the sheet. Using only Orders fields means Tableau queries Orders alone, avoiding unnecessary row duplication or filtering.',
    references: [REF_RELATE]
  },
  {
    domain: CONNECT, difficulty: 2, type: QType.SINGLE,
    stem: 'You want your colleagues to reuse a curated, governed connection (with calculations and metadata) from Tableau Server. What should you do in Tableau Desktop?',
    options: opts4(
      'Email them the .twb file',
      'Publish the data source to Tableau Server / Cloud so others can connect to it',
      'Create a packaged workbook only',
      'Export the data to CSV'
    ),
    correct: ['b'],
    explanation: 'Publishing a data source to Tableau Server or Tableau Cloud lets others connect to a single, governed, reusable source that carries your joins/relationships, calculations, aliases, and metadata, ensuring consistency across workbooks.',
    references: [REF_DATASERVER]
  },
  {
    domain: CONNECT, difficulty: 2, type: QType.SINGLE,
    stem: 'Which statement about a wildcard (automatic) union of files in a folder is correct?',
    options: opts4(
      'It joins files side by side on a key column',
      'It automatically appends rows from all files whose names match a search pattern, including files added later on refresh',
      'It blends the files at an aggregated level',
      'It only works with database tables'
    ),
    correct: ['b'],
    explanation: 'A wildcard union appends rows from all files in a directory matching a name pattern. When new matching files are added and the data source is refreshed, they are automatically included — ideal for recurring monthly/daily file drops.',
    references: [REF_UNION]
  },

  // ── Exploring and Analyzing Data (23) ──
  {
    domain: EXPLORE, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'In Tableau, what colour are discrete fields, and what colour are continuous fields, on the shelves?',
    options: opts4(
      'Discrete = green, continuous = blue',
      'Discrete = blue, continuous = green',
      'Both are always blue',
      'The colour depends on the chart type only'
    ),
    correct: ['b'],
    explanation: 'Discrete fields appear as blue pills and create headers (distinct values). Continuous fields appear as green pills and create axes (a continuous range). This blue/green distinction is independent of dimension vs. measure.',
    references: [REF_DISCCONT]
  },
  {
    domain: EXPLORE, difficulty: 2, type: QType.SINGLE,
    stem: 'You drag Sales to Rows and it shows as SUM(Sales). What is SUM here?',
    options: opts4(
      'A table calculation',
      'The default aggregation applied to the measure',
      'A level-of-detail expression',
      'A filter'
    ),
    correct: ['b'],
    explanation: 'Measures are aggregated by default when placed on a shelf; SUM is the default aggregation for most numeric measures. You can change the aggregation (AVG, MIN, MAX, COUNTD, etc.) from the field menu on the pill.',
    references: [REF_AGG]
  },
  {
    domain: EXPLORE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which feature recommends chart types based on the fields currently selected in the view or Data pane?',
    options: opts4(
      'Show Me',
      'Analytics pane',
      'Data Interpreter',
      'Pages shelf'
    ),
    correct: ['a'],
    explanation: 'Show Me suggests appropriate visualization types for the fields you have selected and highlights the recommended one. Chart types that require more or different fields are greyed out with a tooltip explaining what is needed.',
    references: [REF_SHOWME]
  },
  {
    domain: EXPLORE, difficulty: 2, type: QType.SINGLE,
    stem: 'You place Region on Filters and choose "Add to Context". What does a context filter do?',
    options: opts4(
      'Nothing different from a normal filter',
      'It is computed first and creates a temporary subset that all other (non-context) filters then operate on',
      'It removes the field from the view',
      'It converts the filter to a parameter'
    ),
    correct: ['b'],
    explanation: 'Context filters are applied before other dimension/measure filters and before FIXED LOD computations on the remaining data. They define the dataset the rest of the filters and many calculations see — useful for top-N within a subset.',
    references: [REF_FILTERORDER]
  },
  {
    domain: EXPLORE, difficulty: 3, type: QType.SINGLE,
    stem: 'You want total Sales per Customer regardless of the dimensions in the view. Which calculation type guarantees this fixed granularity?',
    options: opts4(
      '{ FIXED [Customer] : SUM([Sales]) }',
      'SUM([Sales]) as a normal measure',
      'A quick table calculation',
      'WINDOW_SUM(SUM([Sales]))'
    ),
    correct: ['a'],
    explanation: 'A FIXED level-of-detail expression computes the aggregate at the specified dimensionality ([Customer]) independent of the view\'s dimensions. A plain SUM is affected by the view granularity, and table calculations depend on the layout of marks.',
    references: [REF_LOD]
  },
  {
    domain: EXPLORE, difficulty: 3, type: QType.SINGLE,
    stem: 'A running total of Sales by month is best created with which mechanism?',
    options: opts4(
      'A FIXED LOD expression',
      'A Running Total quick table calculation',
      'A context filter',
      'A data blend'
    ),
    correct: ['b'],
    explanation: 'Running totals depend on the order and partitioning of marks in the view, which is exactly what table calculations do. The Running Total quick table calculation computes a cumulative sum along the specified addressing direction.',
    references: [REF_TABLECALC]
  },
  {
    domain: EXPLORE, difficulty: 2, type: QType.SINGLE,
    stem: 'You drag a date field to Columns and it shows YEAR(Order Date) as a blue pill. How do you drill from Year to Quarter to Month?',
    options: opts4(
      'You cannot drill dates in Tableau',
      'Click the + on the date pill (or use the field menu) to expand the built-in date hierarchy',
      'Create a separate calculated field for each level',
      'Change the data source'
    ),
    correct: ['b'],
    explanation: 'Date fields have a built-in hierarchy (Year ▸ Quarter ▸ Month ▸ Day). Clicking the + icon on the pill drills down a level; the field menu also lets you switch between discrete date parts and continuous date values/truncations.',
    references: [REF_DATES]
  },
  {
    domain: EXPLORE, difficulty: 2, type: QType.SINGLE,
    stem: 'What is the difference between a discrete date part MONTH([Date]) and a continuous date value MONTH([Date]) (the green "Month Year" option)?',
    options: opts4(
      'There is no difference',
      'The date part groups all Januaries together (headers); the date value plots a continuous timeline (axis)',
      'The date part creates an axis; the date value creates headers',
      'Only the date value can be filtered'
    ),
    correct: ['b'],
    explanation: 'A discrete date part (blue) extracts the month number/name and groups every January across years together, creating headers. A continuous date value/truncation (green) keeps the chronological timeline and produces a continuous axis — important for trend lines.',
    references: [REF_DATES]
  },
  {
    domain: EXPLORE, difficulty: 2, type: QType.SINGLE,
    stem: 'You bin a continuous Profit measure into ranges of 100 to build a histogram. Which Tableau feature creates the ranges?',
    options: opts4(
      'Groups',
      'Bins (Create > Bins)',
      'Sets',
      'Hierarchies'
    ),
    correct: ['b'],
    explanation: 'Bins divide a continuous measure into discrete, equal-size buckets (bin size 100). Plotting the bin dimension against COUNT/CNT produces a histogram. Groups combine selected members; sets define in/out membership.',
    references: [REF_BINS]
  },
  {
    domain: EXPLORE, difficulty: 2, type: QType.SINGLE,
    stem: 'You combine several misspelled category members ("Furnature", "Furniture", "furniture ") into one. Which feature is intended for this?',
    options: opts4(
      'Sets',
      'Groups',
      'Bins',
      'Parameters'
    ),
    correct: ['b'],
    explanation: 'Groups combine multiple selected dimension members into a single member, perfect for consolidating misspellings or rolling categories up. Sets are about in/out membership conditions; bins are numeric ranges.',
    references: [REF_GROUP]
  },
  {
    domain: EXPLORE, difficulty: 3, type: QType.SINGLE,
    stem: 'You create a set of the Top 10 Customers by Sales. Later sales change. What happens to a dynamic (computed) set?',
    options: opts4(
      'It is fixed forever to the original 10 customers',
      'It recomputes membership automatically as the underlying data changes',
      'It converts to a group',
      'It must be manually re-created'
    ),
    correct: ['b'],
    explanation: 'A computed/dynamic set defined by a condition (e.g., Top 10 by SUM(Sales)) recalculates its members whenever the data updates, so the set always reflects the current top 10. A constant set built from a manual selection does not update.',
    references: [REF_SET]
  },
  {
    domain: EXPLORE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want users to switch the measure shown in a chart between Sales, Profit, and Quantity using a single control. Which object enables this?',
    options: opts4(
      'A set',
      'A parameter combined with a calculated field (CASE on the parameter)',
      'A group',
      'A context filter'
    ),
    correct: ['b'],
    explanation: 'A parameter provides a single value the user can change; a calculated field with a CASE/IF on the parameter returns the chosen measure. Placing that calculation on the view lets users swap measures interactively via the parameter control.',
    references: [REF_PARAM]
  },
  {
    domain: EXPLORE, difficulty: 1, type: QType.SINGLE,
    stem: 'Which shelf would you use to add a third dimension of analysis through animation/flipbook pages?',
    options: opts4(
      'The Pages shelf',
      'The Filters shelf',
      'The Marks card colour',
      'The Rows shelf'
    ),
    correct: ['a'],
    explanation: 'The Pages shelf breaks a view into a sequence of pages by the field\'s members, with a player control to step or animate through them — useful for showing change over time as motion.',
    references: [REF_INTERFACE]
  },
  {
    domain: EXPLORE, difficulty: 2, type: QType.SINGLE,
    stem: 'You build a map by double-clicking a geographic field. What does the small globe icon next to a field in the Data pane indicate?',
    options: opts4(
      'The field is a measure',
      'The field has a geographic role assigned and can be mapped',
      'The field is a parameter',
      'The field is hidden'
    ),
    correct: ['b'],
    explanation: 'A globe/geographic icon means Tableau has assigned a geographic role (Country, State, City, ZIP, etc.) and can generate Latitude (generated) and Longitude (generated) for mapping. You can change or assign a geographic role via the field menu.',
    references: [REF_MAPS]
  },
  {
    domain: EXPLORE, difficulty: 2, type: QType.SINGLE,
    stem: 'You drop a measure on the Color Marks card with a continuous (green) field. What kind of legend appears?',
    options: opts4(
      'A discrete colour palette with one swatch per member',
      'A continuous (sequential/diverging) colour gradient legend',
      'A size legend',
      'No legend at all'
    ),
    correct: ['b'],
    explanation: 'A continuous measure on Color produces a gradient legend (sequential or diverging) mapping a range of values to a colour ramp. A discrete field on Color produces categorical swatches instead.',
    references: [REF_MARKS]
  },
  {
    domain: EXPLORE, difficulty: 3, type: QType.SINGLE,
    stem: 'You add a linear trend line to a scatter plot. Where do you find the model details (R-squared, p-value)?',
    options: opts4(
      'They are not available in Tableau',
      'Hover the trend line, or use the trend line menu > Describe Trend Model',
      'In the Data Source page',
      'Only after publishing to Server'
    ),
    correct: ['b'],
    explanation: 'Tableau computes trend models (linear, logarithmic, exponential, polynomial, power). Hovering a trend line shows the equation and R²/p-value; "Describe Trend Model" gives the full statistical summary so you can assess fit and significance.',
    references: [REF_TRENDLINE]
  },
  {
    domain: EXPLORE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to show a constant target line at Sales = 500,000 across a bar chart. Which Analytics feature do you use?',
    options: opts4(
      'A reference line with a constant value',
      'A trend line',
      'A forecast',
      'A set'
    ),
    correct: ['a'],
    explanation: 'A reference line can be a constant, an aggregate (average/median), or a computed value. A constant reference line at 500,000 draws a fixed line on the axis to compare bars against the target.',
    references: [REF_REFLINE]
  },
  {
    domain: EXPLORE, difficulty: 2, type: QType.SINGLE,
    stem: 'Sorting a bar chart by clicking the sort icon on an axis is a "computed" sort that updates automatically as the data changes.',
    options: opts4('True', 'False', 'Only manual sorts update', 'Sorting is not possible on bars'),
    correct: ['a'],
    explanation: 'True. A computed (toolbar/axis) sort orders members by a field and aggregation and re-evaluates as data changes. A manual sort (drag to reorder) fixes the order and does not update with new data.',
    references: [REF_SORT]
  },
  {
    domain: EXPLORE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Tableau\'s order of operations.',
    options: opts4(
      'Context filters are applied before dimension filters.',
      'FIXED LOD expressions are computed before dimension filters (but after context filters).',
      'Table calculations are applied after measure filters.',
      'Dimension filters are always applied before context filters.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Tableau\'s order of operations: extract filters → data source filters → context filters → FIXED LOD → dimension filters → INCLUDE/EXCLUDE LOD → measure filters → table calculations → table-calc filters. So A, B, and C are true; D reverses the correct order.',
    references: [REF_FILTERORDER]
  },
  {
    domain: EXPLORE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which calculation correctly returns the profit ratio as Profit divided by Sales, aggregated correctly across the view?',
    options: opts4(
      'AVG([Profit]/[Sales])',
      'SUM([Profit]) / SUM([Sales])',
      '[Profit] / [Sales]',
      'SUM([Profit] / [Sales])'
    ),
    correct: ['b'],
    explanation: 'Ratios of measures must aggregate the numerator and denominator separately: SUM([Profit]) / SUM([Sales]). Dividing row-level values then averaging gives a mathematically incorrect aggregate (an average of ratios, not the ratio of totals).',
    references: [REF_CALC]
  },
  {
    domain: EXPLORE, difficulty: 2, type: QType.SINGLE,
    stem: 'A calculated field uses IF [Sales] > 1000 THEN "High" ELSE "Low" END. In the Data pane this new field will appear as a:',
    options: opts4(
      'Continuous measure',
      'Discrete dimension (string result)',
      'Parameter',
      'Set'
    ),
    correct: ['b'],
    explanation: 'The calculation returns a string ("High"/"Low"), so Tableau classifies it as a dimension with discrete string values. It will create headers and can be used to group/colour marks categorically.',
    references: [REF_CALC]
  },
  {
    domain: EXPLORE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to highlight only marks for the "Technology" category when hovering, dimming the rest, without filtering them out. Which tool fits?',
    options: opts4(
      'A filter on Category',
      'A highlighter / highlight action on Category',
      'A context filter',
      'An extract filter'
    ),
    correct: ['b'],
    explanation: 'Highlighting (the highlighter card or a highlight action) visually emphasizes matching marks while keeping all data in the view (others are dimmed, not removed). A filter would remove the other marks entirely.',
    references: [REF_HIGHLIGHT]
  },
  {
    domain: EXPLORE, difficulty: 1, type: QType.SINGLE,
    stem: 'Double-clicking a measure in the Data pane (with nothing else in the view) does what?',
    options: opts4(
      'Deletes the field',
      'Adds it to the view using Tableau\'s automatic placement and a default chart',
      'Opens the calculation editor',
      'Creates a parameter'
    ),
    correct: ['b'],
    explanation: 'Double-clicking a field auto-adds it to the most appropriate shelf and lets Show Me / Tableau pick a sensible default visualization, a fast way to start building a view.',
    references: [REF_SHOWME]
  },

  // ── Sharing Insights (13) ──
  {
    domain: SHARE, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Tableau file type bundles the workbook together with a local copy of the data and images so it can be shared as a single file?',
    options: opts4(
      '.twb (Tableau Workbook)',
      '.twbx (Tableau Packaged Workbook)',
      '.tds (Tableau Data Source)',
      '.hyper (Extract)'
    ),
    correct: ['b'],
    explanation: 'A .twbx packaged workbook is a zipped bundle containing the .twb plus extracts, file data sources, custom images, and other resources, so a recipient who does not have access to the original data can still open it.',
    references: [REF_FILES]
  },
  {
    domain: SHARE, difficulty: 1, type: QType.SINGLE,
    stem: 'A plain .twb file is best described as:',
    options: opts4(
      'A bundle that includes the data',
      'An XML file that stores the workbook structure and a pointer/connection to the data, but not the data itself',
      'A compressed Hyper extract',
      'An image export'
    ),
    correct: ['b'],
    explanation: 'A .twb is an XML document describing sheets, dashboards, formatting, and the connection metadata. It does NOT contain the data — opening it requires access to the referenced live source or extract.',
    references: [REF_FILES]
  },
  {
    domain: SHARE, difficulty: 2, type: QType.SINGLE,
    stem: 'You assemble several worksheets, add filters and a title, onto a single canvas for at-a-glance monitoring. What have you built?',
    options: opts4(
      'A story',
      'A dashboard',
      'A data source',
      'A set'
    ),
    correct: ['b'],
    explanation: 'A dashboard is a single view that combines multiple worksheets and objects (filters, legends, text, images, containers) so related visualizations can be seen and interacted with together.',
    references: [REF_DASHBOARD]
  },
  {
    domain: SHARE, difficulty: 2, type: QType.SINGLE,
    stem: 'On a dashboard you want clicking a bar in one sheet to filter another sheet. Which feature do you configure?',
    options: opts4(
      'A filter action (Use as Filter or Dashboard > Actions)',
      'A reference line',
      'A parameter only',
      'A bin'
    ),
    correct: ['a'],
    explanation: 'A filter action passes the selected mark\'s values from a source sheet to filter one or more target sheets. The quickest setup is the "Use as Filter" button on a sheet; Dashboard > Actions allows fine control over run behavior and fields.',
    references: [REF_DASHACTION]
  },
  {
    domain: SHARE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to present a guided, sequential narrative of point-and-annotation views that the audience clicks through. Which Tableau object is designed for this?',
    options: opts4(
      'A dashboard',
      'A story (with story points)',
      'A set',
      'A parameter'
    ),
    correct: ['b'],
    explanation: 'A story is a sequence of sheets/dashboards called story points arranged to convey a narrative. Each point captures a particular state (filters, annotations) so the audience can be walked through the analysis step by step.',
    references: [REF_STORY]
  },
  {
    domain: SHARE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which dashboard sizing option automatically adjusts the dashboard to fit the viewer\'s screen/window?',
    options: opts4(
      'Fixed size',
      'Automatic (or Range) sizing',
      'Tiled only',
      'Floating only'
    ),
    correct: ['b'],
    explanation: 'Dashboard sizing can be Fixed, Range, or Automatic. Automatic resizes the dashboard to the window; Range keeps it within min/max bounds. Fixed gives the most predictable layout/performance but does not adapt to screen size.',
    references: [REF_DASHBOARD]
  },
  {
    domain: SHARE, difficulty: 2, type: QType.SINGLE,
    stem: 'You need to give a non-Tableau colleague a static PDF of a dashboard. Which menu accomplishes this in Tableau Desktop?',
    options: opts4(
      'File > Print to PDF (or File > Export > PDF / Image)',
      'Data > Extract',
      'Analysis > Create Calculated Field',
      'Worksheet > Show Me'
    ),
    correct: ['a'],
    explanation: 'Tableau Desktop can export the active view/dashboard to PDF or to an image (PNG/EMF) via File > Print to PDF or File > Export, producing a static artifact for recipients without Tableau.',
    references: [REF_EXPORT]
  },
  {
    domain: SHARE, difficulty: 2, type: QType.SINGLE,
    stem: 'You add a Category filter to a dashboard and want it to control every sheet that uses that data source. Which option do you choose on the filter card?',
    options: opts4(
      '"Only this worksheet"',
      '"All using this data source" (apply to all worksheets using this data source)',
      'Convert it to a parameter',
      'Hide the card'
    ),
    correct: ['b'],
    explanation: 'A quick filter\'s "Apply to Worksheets" option lets you scope it to only the current sheet, selected sheets, or all worksheets using the same data source — the last option makes one control drive the whole dashboard consistently.',
    references: [REF_FILTER]
  },
  {
    domain: SHARE, difficulty: 1, type: QType.SINGLE,
    stem: 'Which free platform lets you publish interactive Tableau visualizations publicly on the web from Tableau Desktop/Public?',
    options: opts4(
      'Tableau Public',
      'Tableau Prep',
      'Tableau Bridge',
      'Tableau Reader only'
    ),
    correct: ['a'],
    explanation: 'Tableau Public is a free service for publishing interactive vizzes to the web; saved workbooks are publicly accessible. Note its data and visibility constraints — it is not for confidential data.',
    references: [REF_PUBLIC]
  },
  {
    domain: SHARE, difficulty: 2, type: QType.SINGLE,
    stem: 'A colleague has Tableau Reader (free). What can they do with a .twbx you send?',
    options: opts4(
      'Edit calculations and republish',
      'Open and interact with (filter, sort, hover) the packaged workbook, but not edit its structure',
      'Connect to new data sources',
      'Nothing — Reader cannot open .twbx'
    ),
    correct: ['b'],
    explanation: 'Tableau Reader opens packaged workbooks (.twbx) and supports interaction (filtering, sorting, tooltips) but does not allow authoring/editing or connecting to new data. It is a viewer for sharing offline.',
    references: [REF_SHARE]
  },
  {
    domain: SHARE, difficulty: 2, type: QType.SINGLE,
    stem: 'You customized the tooltip to show "Sales: $1,234 for Acme Co.". Where do you edit tooltip content for a worksheet?',
    options: opts4(
      'Data Source page',
      'The Tooltip button on the Marks card',
      'Format > Workbook',
      'The Pages shelf'
    ),
    correct: ['b'],
    explanation: 'The Tooltip button on the Marks card opens an editor where you insert field values, parameters, and formatted text, and can enable tooltip commands and viz-in-tooltip. This controls what appears when users hover marks.',
    references: [REF_TOOLTIP]
  },
  {
    domain: SHARE, difficulty: 2, type: QType.SINGLE,
    stem: 'When you publish a workbook with a live connection to Tableau Server, viewers see data refreshed from the live source according to its connection, without you re-sending a file.',
    options: opts4('True', 'False', 'Only with extracts', 'Only on Tableau Public'),
    correct: ['a'],
    explanation: 'True. Publishing centralizes the workbook on Server/Cloud; a live connection means consumers see current source data when they open it, and extracts can be scheduled to refresh — no manual file distribution needed.',
    references: [REF_SHARE]
  },
  {
    domain: SHARE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to apply consistent fonts and colours across every sheet and dashboard in a workbook in one place. Where do you do this?',
    options: opts4(
      'Format > Workbook',
      'Each worksheet individually only',
      'The Data Source page',
      'Analysis menu'
    ),
    correct: ['a'],
    explanation: 'Format > Workbook sets default fonts and colours at the workbook level, applying them across all sheets/dashboards for consistent branding, instead of formatting each view separately.',
    references: [REF_FORMAT]
  },

  // ── Understanding Tableau Concepts (13) ──
  {
    domain: CONCEPTS, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'In Tableau, which category do fields generally fall into when they categorize, segment, or qualify data (e.g., Region, Category, Customer Name)?',
    options: opts4(
      'Measures',
      'Dimensions',
      'Parameters',
      'Sets'
    ),
    correct: ['b'],
    explanation: 'Dimensions are typically qualitative fields (categories, dates, geography) that segment data and define the level of detail. Measures are typically numeric values that get aggregated (sums, averages).',
    references: [REF_DIMMEAS]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which statement best distinguishes "dimension vs measure" from "discrete vs continuous"?',
    options: opts4(
      'They are the same concept',
      'Dimension/measure is about the role of the data; discrete (blue)/continuous (green) is about how the field is displayed (headers vs axis)',
      'Only measures can be continuous and only dimensions can be discrete',
      'Continuous fields cannot be aggregated'
    ),
    correct: ['b'],
    explanation: 'Dimension vs measure describes the field\'s analytical role (qualifying vs aggregable). Discrete (blue) vs continuous (green) describes display behavior — discrete creates headers, continuous creates an axis. A measure can be discrete and a dimension (like a date) can be continuous.',
    references: [REF_DIMMEAS]
  },
  {
    domain: CONCEPTS, difficulty: 1, type: QType.SINGLE,
    stem: 'What does the Marks card primarily control in a worksheet?',
    options: opts4(
      'The data source connection',
      'The mark type (bar, line, circle…) and visual encodings such as Color, Size, Label, Detail, and Tooltip',
      'The workbook theme',
      'The extract refresh schedule'
    ),
    correct: ['b'],
    explanation: 'The Marks card sets the mark type and exposes encoding targets (Color, Size, Text/Label, Detail, Tooltip, Shape, Path/Angle depending on type) that bind fields to visual properties of the marks.',
    references: [REF_MARKS]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'What does placing a dimension on the Detail shelf of the Marks card do?',
    options: opts4(
      'It hides the dimension',
      'It increases the granularity (more marks) without adding headers or an axis or a colour/size encoding',
      'It always changes the colour of marks',
      'It filters the data'
    ),
    correct: ['b'],
    explanation: 'Detail breaks marks apart to a finer level of detail (more marks) so each combination is shown, but without creating rows/columns headers or assigning colour/size. It is how you add granularity to a view subtly.',
    references: [REF_MARKS]
  },
  {
    domain: CONCEPTS, difficulty: 1, type: QType.SINGLE,
    stem: 'Which Tableau file extension is a saved connection/metadata (no data) that can be reused across workbooks?',
    options: opts4(
      '.tds (Tableau Data Source)',
      '.twbx',
      '.hyper',
      '.tbm'
    ),
    correct: ['a'],
    explanation: 'A .tds file stores the connection information, field metadata, calculations, and aliases for a data source (no data). A .tdsx additionally packages local extract/file data. Both promote reuse and governance.',
    references: [REF_FILES]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'The "level of detail" of a view is determined primarily by which of the following?',
    options: opts4(
      'The colour palette chosen',
      'The combination of dimensions in the view (on Rows, Columns, and the Marks card)',
      'The number of measures',
      'The dashboard size'
    ),
    correct: ['b'],
    explanation: 'View granularity (level of detail) is set by the dimensions present in the view — including those on Detail. Adding a dimension makes the view finer-grained (more marks); removing one aggregates further.',
    references: [REF_LOD]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'What does the Analytics pane provide?',
    options: opts4(
      'Connection management',
      'Drag-and-drop model elements like reference lines, trend lines, forecasts, average lines, and box plots',
      'Field renaming',
      'Workbook formatting defaults'
    ),
    correct: ['b'],
    explanation: 'The Analytics pane (next to the Data pane) lets you drag analytic objects — constant/average/median reference lines, trend lines, forecasts, distribution bands, box plots, clusters — onto the view.',
    references: [REF_REFLINE]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'A blue pill creates discrete headers and a green pill creates a continuous axis, regardless of whether the field is a dimension or a measure.',
    options: opts4('True', 'False', 'Only true for dimensions', 'Only true for measures'),
    correct: ['a'],
    explanation: 'True. Pill colour reflects discrete (blue → headers) vs continuous (green → axis). This is independent of dimension/measure: e.g., a measure can be made discrete and a continuous date is green.',
    references: [REF_DISCCONT]
  },
  {
    domain: CONCEPTS, difficulty: 1, type: QType.SINGLE,
    stem: 'Where do the Rows and Columns shelves sit conceptually in building a viz?',
    options: opts4(
      'They define the data source',
      'They define the structure of the view — which fields form the axes/headers (the table\'s rows and columns)',
      'They store calculated fields',
      'They control extract refresh'
    ),
    correct: ['b'],
    explanation: 'Rows and Columns shelves determine the structural layout of the visualization — the headers and axes. Discrete fields make headers; continuous fields make axes. Their arrangement defines the chart skeleton.',
    references: [REF_INTERFACE]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'What is the purpose of the Pages shelf compared with the Filters shelf?',
    options: opts4(
      'They are identical',
      'Filters remove data from the view; Pages keeps all data but splits it into a sequence of viewable pages you can step/animate through',
      'Pages permanently deletes data',
      'Filters animate the view'
    ),
    correct: ['b'],
    explanation: 'Filters exclude data from the view entirely. Pages partitions the same data into pages by the field\'s members and gives a player to navigate/animate, all data still present, just shown one page at a time.',
    references: [REF_INTERFACE]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which best describes a parameter in Tableau?',
    options: opts4(
      'A field that always comes from the data source',
      'A single, workbook-level dynamic value (number, date, string, boolean) the user can change to drive calculations, filters, or reference lines',
      'A group of dimension members',
      'A type of join'
    ),
    correct: ['b'],
    explanation: 'A parameter is a standalone placeholder for a single value not tied to the data. Users change it via a control, and calculated fields, filters, sets, bins, or reference lines can reference it to make views interactive.',
    references: [REF_PARAM]
  },
  {
    domain: CONCEPTS, difficulty: 1, type: QType.SINGLE,
    stem: 'In the Tableau Desktop workspace, what is the Data pane on the left used for?',
    options: opts4(
      'Showing the final dashboard',
      'Listing the fields (dimensions, measures, sets, parameters) of the connected data source for dragging into views',
      'Configuring the extract schedule',
      'Printing the workbook'
    ),
    correct: ['b'],
    explanation: 'The Data pane lists the data source\'s fields organized into dimensions and measures (plus sets and parameters). You drag these fields onto shelves and the Marks card to build visualizations.',
    references: [REF_INTERFACE]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'Why is Tableau\'s Hyper engine relevant to a Desktop Specialist?',
    options: opts4(
      'It is the charting library',
      'It is the high-performance in-memory data engine that powers extracts (.hyper), enabling fast queries and offline analysis',
      'It is the dashboard layout grid',
      'It is the trend-line model'
    ),
    correct: ['b'],
    explanation: 'Hyper is Tableau\'s in-memory data engine used for extracts. Understanding that extracts are stored as .hyper and queried by Hyper explains why extracts are fast, support large data, and allow offline work.',
    references: [REF_EXTRACT]
  }
];

// ───────────────────── Practice Exam 2 ─────────────────────
const P2: Q[] = [
  // ── Connecting to and Preparing Data (16) ──
  {
    domain: CONNECT, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'You need to connect Tableau Desktop to a cloud data warehouse such as Snowflake. Where in the Connect pane do you look?',
    options: opts4(
      'To a File',
      'To a Server',
      'Saved Data Sources',
      'Tableau Reader'
    ),
    correct: ['b'],
    explanation: 'Database and cloud platforms (Snowflake, Amazon Redshift, Google BigQuery, SQL Server, etc.) are server connections and appear under the "To a Server" category, while local files (Excel, CSV, JSON) are under "To a File".',
    references: [REF_CONNECT]
  },
  {
    domain: CONNECT, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'An inner join between Customers and Orders on Customer ID returns which rows?',
    options: opts4(
      'All customers, with nulls for those without orders',
      'Only rows where a Customer ID exists in BOTH tables',
      'All orders plus all customers',
      'Only customers without orders'
    ),
    correct: ['b'],
    explanation: 'An inner join keeps only rows whose join key matches in both tables — customers that have at least one order and orders that have a matching customer. Unmatched rows from either side are excluded.',
    references: [REF_JOINS]
  },
  {
    domain: CONNECT, difficulty: 2, type: QType.SINGLE,
    stem: 'When should you prefer a relationship over a physical join in the Tableau data model?',
    options: opts4(
      'When you want Tableau to keep tables at their own level of detail and avoid duplicated/filtered rows automatically',
      'When you must use Custom SQL',
      'Relationships are deprecated; always use joins',
      'Only when unioning files'
    ),
    correct: ['a'],
    explanation: 'Relationships (logical layer) preserve each table\'s native granularity and let Tableau pick the correct join per sheet, avoiding the row duplication and accidental filtering that fixed physical joins can introduce. Joins are still available in the physical layer when needed.',
    references: [REF_RELATE]
  },
  {
    domain: CONNECT, difficulty: 2, type: QType.SINGLE,
    stem: 'A "Sales" column imported as text ("1,234.50"). To total it you should:',
    options: opts4(
      'Leave it as text and use ATTR',
      'Change its data type to a number so it can be aggregated (or use a calculation to convert it)',
      'Pivot it',
      'Group it'
    ),
    correct: ['b'],
    explanation: 'A numeric field stored as text cannot be summed. Changing the data type to Number (decimal) — or using a calculated conversion if formatting interferes — makes it a measure that aggregates correctly.',
    references: [REF_DATATYPES]
  },
  {
    domain: CONNECT, difficulty: 3, type: QType.SINGLE,
    stem: 'You union three files but one file has a misnamed column ("Revenue" vs "Sales"), creating two partly-filled columns. Which union feature resolves this?',
    options: opts4(
      'There is no fix; you must edit the files',
      'Merge mismatched fields in the union (drag one column onto the other to combine them)',
      'Pivot the columns',
      'Add a context filter'
    ),
    correct: ['b'],
    explanation: 'After a union, mismatched columns appear separately. You can merge them by selecting both columns and choosing "Merge Mismatched Fields" (or dragging one onto the other) so the values combine into a single field.',
    references: [REF_UNION]
  },
  {
    domain: CONNECT, difficulty: 2, type: QType.SINGLE,
    stem: 'Which is a valid reason to use data blending instead of a join?',
    options: opts4(
      'The two sources are at different levels of detail or in different systems that cannot be joined directly',
      'You want to append rows from identical files',
      'You want to reshape columns to rows',
      'You need to rename a field'
    ),
    correct: ['a'],
    explanation: 'Blending aggregates each source independently and combines results on a linking dimension, which is ideal when sources differ in granularity or live in systems you cannot join. Unions append rows; pivots reshape; neither addresses cross-source aggregation.',
    references: [REF_BLEND]
  },
  {
    domain: CONNECT, difficulty: 2, type: QType.SINGLE,
    stem: 'A data source filter limits the data for ALL worksheets that use that data source in the workbook.',
    options: opts4('True', 'False', 'Only for the active sheet', 'Only on Tableau Server'),
    correct: ['a'],
    explanation: 'True. A data source filter is applied very early in the order of operations and affects every worksheet using that data source, making it useful for security/scope (e.g., excluding test rows) across the whole workbook.',
    references: [REF_FILTERORDER]
  },
  {
    domain: CONNECT, difficulty: 2, type: QType.SINGLE,
    stem: 'You want an extract that stores only aggregated data at the level of the visible dimensions to keep it small. Which extract option helps?',
    options: opts4(
      '"Aggregate data for visible dimensions" (roll up to the level of detail of the dimensions used)',
      'Number of rows = All rows',
      'Incremental refresh only',
      'Wildcard union'
    ),
    correct: ['a'],
    explanation: 'When creating an extract you can choose "Aggregate data for visible dimensions", which stores pre-aggregated rows at the granularity of the dimensions in use, dramatically reducing extract size for summary analysis.',
    references: [REF_EXTRACT]
  },
  {
    domain: CONNECT, difficulty: 3, type: QType.SINGLE,
    stem: 'An incremental extract refresh is configured on a "Created Date" column. What does Tableau do on refresh?',
    options: opts4(
      'Re-imports the entire table every time',
      'Adds only rows whose Created Date is greater than the maximum value already in the extract',
      'Deletes the extract and rebuilds it',
      'Switches the connection to live'
    ),
    correct: ['b'],
    explanation: 'An incremental refresh appends only new rows based on an identifier column (e.g., a date or ID) greater than the last extracted value. It is faster than a full refresh but does not capture updates/deletes to existing rows.',
    references: [REF_LIVEEXTRACT]
  },
  {
    domain: CONNECT, difficulty: 2, type: QType.SINGLE,
    stem: 'You have a "Region/Country/City" single column. To analyze by each level you would typically:',
    options: opts4(
      'Union the column',
      'Split (custom split) on the "/" separator into separate fields, then optionally build a hierarchy',
      'Blend on the column',
      'Create a parameter'
    ),
    correct: ['b'],
    explanation: 'A custom split on "/" produces separate Region, Country, and City fields. Those can then be combined into a drill-down hierarchy for analysis. Unions/blends do not reshape a delimited column.',
    references: [REF_SPLIT]
  },
  {
    domain: CONNECT, difficulty: 1, type: QType.SINGLE,
    stem: 'Where do you assign a geographic role (e.g., State, ZIP Code) to a field for mapping?',
    options: opts4(
      'Only in a dashboard',
      'In the Data pane / Data Source page via the field menu > Geographic Role',
      'In the Pages shelf',
      'In Format > Workbook'
    ),
    correct: ['b'],
    explanation: 'A field\'s menu (in the Data pane or Data Source page) has Geographic Role, where you assign Country, State/Province, City, ZIP/Postcode, etc. This lets Tableau generate latitude/longitude for mapping.',
    references: [REF_MAPS]
  },
  {
    domain: CONNECT, difficulty: 2, type: QType.SINGLE,
    stem: 'Why might you publish an extract data source (rather than a live one) to Tableau Server for a team?',
    options: opts4(
      'To reduce load on the source system and give faster, scheduled-refresh performance to all consumers',
      'Extracts cannot be published',
      'To prevent anyone from using the data',
      'To convert the data to CSV'
    ),
    correct: ['a'],
    explanation: 'A published extract offloads queries from the operational source, provides consistently fast performance via Hyper, and can be refreshed on a schedule, while still being a single governed source consumers connect to.',
    references: [REF_DATASERVER]
  },
  {
    domain: CONNECT, difficulty: 2, type: QType.SINGLE,
    stem: 'Hiding an unused column in the Data Source page primarily helps with:',
    options: opts4(
      'Changing the chart type',
      'Reducing clutter and, when extracting, excluding the column from the extract to improve performance',
      'Creating a calculated field',
      'Sorting the data'
    ),
    correct: ['b'],
    explanation: 'Hiding fields declutters the Data pane and, importantly, hidden fields are excluded from extracts (unless used), which reduces extract size and improves performance.',
    references: [REF_METADATA]
  },
  {
    domain: CONNECT, difficulty: 2, type: QType.SINGLE,
    stem: 'You connect to a text (.csv) file. By default Tableau treats it as which kind of connection?',
    options: opts4(
      'A live file connection (queried from the file) that can also be extracted',
      'Always an extract that cannot be live',
      'A server connection',
      'A published data source'
    ),
    correct: ['a'],
    explanation: 'File connections like CSV start as a live connection to the file. You can switch to an extract on the data source for performance/offline use; the choice is shown in the upper-right of the Data Source page (Connection: Live / Extract).',
    references: [REF_CONNECT]
  },
  {
    domain: CONNECT, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements comparing joins, unions, and blends.',
    options: opts4(
      'Joins combine columns from tables that share a key.',
      'Unions append rows from tables with matching structure.',
      'Blends combine aggregated results from separate data sources on a linking field.',
      'A union combines columns side by side on a key.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Joins add columns by matching keys; unions stack rows from similarly-structured tables; blends combine independently-aggregated results from different sources on a common field. Option D incorrectly describes a union as a key-based column merge (that is a join).',
    references: [REF_JOINS, REF_UNION, REF_BLEND]
  },
  {
    domain: CONNECT, difficulty: 2, type: QType.SINGLE,
    stem: 'A relationship requires you to pick matching fields between two tables. What is this matching definition called?',
    options: opts4(
      'A blend link',
      'The relationship\'s matching fields (relationship keys)',
      'A union pattern',
      'A pivot'
    ),
    correct: ['b'],
    explanation: 'When creating a relationship you define one or more pairs of matching fields between the tables. Tableau uses these keys to relate the tables and choose the proper join type per sheet automatically.',
    references: [REF_RELATE]
  },

  // ── Exploring and Analyzing Data (23) ──
  {
    domain: EXPLORE, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Placing a continuous (green) measure on Columns and a continuous (green) measure on Rows typically produces which chart?',
    options: opts4(
      'A bar chart',
      'A scatter plot',
      'A pie chart',
      'A text table'
    ),
    correct: ['b'],
    explanation: 'Two continuous measures create two axes; the marks become points plotted by their X/Y values — a scatter plot. Adding dimensions to Detail breaks it into more points for correlation analysis.',
    references: [REF_VIZTYPES]
  },
  {
    domain: EXPLORE, difficulty: 2, type: QType.SINGLE,
    stem: 'COUNTD([Customer ID]) returns:',
    options: opts4(
      'The total number of rows',
      'The number of distinct (unique) Customer ID values',
      'The sum of Customer IDs',
      'The average Customer ID'
    ),
    correct: ['b'],
    explanation: 'COUNTD is the distinct-count aggregation: it returns the number of unique values of the field, e.g., the number of distinct customers, regardless of how many order rows each has.',
    references: [REF_AGG]
  },
  {
    domain: EXPLORE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You drop Profit on Color with a diverging palette so losses are red and gains are blue around zero. Profit here is:',
    options: opts4(
      'A discrete dimension',
      'A continuous measure encoded on Color as a gradient',
      'A parameter',
      'A set'
    ),
    correct: ['b'],
    explanation: 'A continuous measure on Color yields a gradient legend; a diverging palette centered at zero is common for profit so negative/positive values are visually distinct. This is a continuous colour encoding, not discrete swatches.',
    references: [REF_MARKS]
  },
  {
    domain: EXPLORE, difficulty: 3, type: QType.SINGLE,
    stem: 'You need each customer\'s number of orders shown in a view that is sliced by Region, but the count must NOT change when Region is added/removed. Which expression works?',
    options: opts4(
      '{ FIXED [Customer] : COUNTD([Order ID]) }',
      'COUNTD([Order ID])',
      'WINDOW_COUNT(COUNTD([Order ID]))',
      'RANK(COUNTD([Order ID]))'
    ),
    correct: ['a'],
    explanation: 'A FIXED LOD computes COUNTD of orders per customer at a fixed grain independent of view dimensions like Region, so adding/removing Region does not change the value. A plain aggregate or table calc would respond to the view.',
    references: [REF_LOD]
  },
  {
    domain: EXPLORE, difficulty: 3, type: QType.SINGLE,
    stem: 'A "percent of total" within each pane is most directly created with:',
    options: opts4(
      'A FIXED LOD',
      'A Percent of Total quick table calculation with the appropriate "Compute Using" / partitioning',
      'A context filter',
      'A bin'
    ),
    correct: ['b'],
    explanation: 'Percent of Total is a table calculation; you control the partition/addressing via "Compute Using" so the percentage is taken within the desired scope (table, pane, or cell). It depends on the marks in the view.',
    references: [REF_TABLECALC]
  },
  {
    domain: EXPLORE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which is true about a continuous date axis vs discrete date headers for showing a trend over time?',
    options: opts4(
      'Discrete date parts are required for trend lines',
      'A continuous date (green) creates a true timeline axis and is preferred for trends/trend lines',
      'Both behave identically for trends',
      'Continuous dates cannot be used on Columns'
    ),
    correct: ['b'],
    explanation: 'A continuous date produces an unbroken time axis that correctly spaces points by time and supports meaningful trend lines and forecasting. Discrete date parts group values into categorical headers, which is not ideal for continuous trends.',
    references: [REF_DATES]
  },
  {
    domain: EXPLORE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want only the Top 5 Sub-Categories by Sales shown. Best built-in approach:',
    options: opts4(
      'A group',
      'A Top N filter on Sub-Category by SUM(Sales)',
      'A bin',
      'A reference line'
    ),
    correct: ['b'],
    explanation: 'A filter\'s Top tab lets you keep the Top N members by a field/aggregation (or by a formula/parameter). For Top 5 Sub-Categories by Sales, set Top 5 by SUM(Sales). Groups/bins/reference lines do not limit to a top-N.',
    references: [REF_FILTER]
  },
  {
    domain: EXPLORE, difficulty: 2, type: QType.SINGLE,
    stem: 'A dual-axis chart is created by:',
    options: opts4(
      'Putting two measures on Columns and right-clicking the second to select "Dual Axis"',
      'Using two data sources',
      'Adding a context filter',
      'Using the Pages shelf'
    ),
    correct: ['a'],
    explanation: 'Place a second measure on Rows (or Columns), then on its pill menu choose "Dual Axis" to overlay the two on shared marks space. You typically synchronize or independently scale the axes and adjust mark types per axis.',
    references: [REF_VIZTYPES]
  },
  {
    domain: EXPLORE, difficulty: 2, type: QType.SINGLE,
    stem: 'Adding an average line via the Analytics pane to a bar chart will:',
    options: opts4(
      'Filter bars below average',
      'Draw a reference line at the average of the measure for the chosen scope (table/pane/cell)',
      'Sort the bars',
      'Create a forecast'
    ),
    correct: ['b'],
    explanation: 'An average reference line computes and draws the mean of the measure over the selected scope, giving a visual benchmark to compare each bar against. It does not remove or sort marks.',
    references: [REF_REFLINE]
  },
  {
    domain: EXPLORE, difficulty: 3, type: QType.SINGLE,
    stem: 'INDEX() used as a table calculation returns:',
    options: opts4(
      'The sum of the partition',
      'The position (1-based) of the current row within the partition based on addressing',
      'A random number',
      'The total row count'
    ),
    correct: ['b'],
    explanation: 'INDEX() returns the 1-based index of the current mark within the partition, following the Compute Using addressing/partitioning. It is commonly used for top-N filtering, alternating bands, or custom sorting logic.',
    references: [REF_TABLECALC]
  },
  {
    domain: EXPLORE, difficulty: 2, type: QType.SINGLE,
    stem: 'You build a filled map of US states coloured by Sales. Which mark type and field combination is correct?',
    options: opts4(
      'Mark type Map (polygons) with State as the geographic dimension and Sales on Color',
      'Mark type Bar with State on Color',
      'Mark type Pie with Sales on Detail only',
      'Mark type Line with State on Path'
    ),
    correct: ['a'],
    explanation: 'A filled (choropleth) map uses the Map mark type with State filling polygons (via generated Lat/Long) and the measure (Sales) on Color to shade each state. Bars/lines/pies are not filled-map encodings.',
    references: [REF_MAPS]
  },
  {
    domain: EXPLORE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want a parameter-driven Top N where the user types how many products to see. Steps include:',
    options: opts4(
      'Create an integer parameter and reference it in a Top N filter (by field, value = the parameter)',
      'Create a group of products',
      'Use a continuous date',
      'Add the parameter to Detail only'
    ),
    correct: ['a'],
    explanation: 'Create an integer parameter (e.g., "Top N"), then in the dimension filter\'s Top tab choose "By field", and set the value to the parameter. Showing the parameter control lets users adjust N interactively.',
    references: [REF_PARAM]
  },
  {
    domain: EXPLORE, difficulty: 2, type: QType.SINGLE,
    stem: 'A measure filter is applied after FIXED LOD expressions and after dimension filters in Tableau\'s order of operations.',
    options: opts4('True', 'False', 'Measure filters are applied first', 'There is no defined order'),
    correct: ['a'],
    explanation: 'True. The order is: extract → data source → context → FIXED → dimension → INCLUDE/EXCLUDE → measure → table calc filters. Measure filters come after FIXED LOD and dimension filters but before table-calc filters.',
    references: [REF_FILTERORDER]
  },
  {
    domain: EXPLORE, difficulty: 2, type: QType.SINGLE,
    stem: 'To compute year-over-year growth %, the most appropriate built-in tool is:',
    options: opts4(
      'A FIXED LOD',
      'A "Percent Difference" / "Year over Year Growth" table calculation along the date',
      'A context filter',
      'A set'
    ),
    correct: ['b'],
    explanation: 'Period-over-period change is a table calculation (Percent Difference / Year over Year Growth) computed along the date dimension. It depends on the order of marks, which is what table calcs are designed for.',
    references: [REF_TABLECALC]
  },
  {
    domain: EXPLORE, difficulty: 1, type: QType.SINGLE,
    stem: 'Right-clicking a measure on a shelf and choosing Measure (Sum) > Average changes:',
    options: opts4(
      'The data type',
      'The aggregation applied to that measure in the view',
      'The chart type',
      'The colour palette'
    ),
    correct: ['b'],
    explanation: 'The pill\'s Measure submenu changes how the field is aggregated in the view (Sum, Average, Min, Max, Count, Count Distinct, Median, etc.) without altering the underlying data type.',
    references: [REF_AGG]
  },
  {
    domain: EXPLORE, difficulty: 2, type: QType.SINGLE,
    stem: 'A calculated field DATEDIFF(\'day\', [Order Date], [Ship Date]) returns:',
    options: opts4(
      'The ship date',
      'The number of days between order and ship dates',
      'A boolean',
      'The order date truncated to day'
    ),
    correct: ['b'],
    explanation: 'DATEDIFF(\'day\', start, end) returns the integer number of day boundaries between the two dates — here, processing/shipping lead time. The first argument sets the date unit (day, month, year, etc.).',
    references: [REF_CALC]
  },
  {
    domain: EXPLORE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL statements that correctly distinguish sets from groups.',
    options: opts4(
      'A set divides members into IN/OUT based on a condition or selection.',
      'A group combines selected members into a single new member.',
      'A computed set can update dynamically as data changes.',
      'Groups define IN/OUT membership conditions like sets.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Sets define binary IN/OUT membership and computed sets update with data. Groups simply consolidate selected members into one combined member. Option D is false — groups do not have IN/OUT conditional membership.',
    references: [REF_SET, REF_GROUP]
  },
  {
    domain: EXPLORE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to compare in/out of a Top Customers set against everyone else in a bar. Dragging the set to Color produces:',
    options: opts4(
      'Two colours: members IN the set vs OUT of the set',
      'A continuous gradient',
      'A histogram',
      'An error'
    ),
    correct: ['a'],
    explanation: 'A set on Color encodes the binary IN/OUT membership with two colours, letting you quickly compare set members against the rest. This is a common use of sets for cohort comparison.',
    references: [REF_SET]
  },
  {
    domain: EXPLORE, difficulty: 2, type: QType.SINGLE,
    stem: 'A box-and-whisker plot in Tableau is added via:',
    options: opts4(
      'The Analytics pane (Box Plot) onto a view with disaggregated marks',
      'A FIXED LOD only',
      'A union',
      'The Pages shelf'
    ),
    correct: ['a'],
    explanation: 'Box plots come from the Analytics pane and summarize the distribution (quartiles, whiskers, outliers) of the marks; you typically disaggregate or have enough marks per category for a meaningful distribution.',
    references: [REF_REFLINE]
  },
  {
    domain: EXPLORE, difficulty: 2, type: QType.SINGLE,
    stem: 'The Show Me panel greys out "Symbol map". The most likely reason is:',
    options: opts4(
      'The view has too many marks',
      'The required fields for that chart (e.g., a geographic field and a measure) are not present in the selection',
      'Maps are disabled in Tableau Desktop',
      'You must publish first'
    ),
    correct: ['b'],
    explanation: 'Show Me enables a chart only when the selected fields satisfy that chart\'s requirements. A symbol map needs a geographic dimension (and usually a measure); without them the option is greyed out with a tooltip describing what is needed.',
    references: [REF_SHOWME]
  },
  {
    domain: EXPLORE, difficulty: 3, type: QType.SINGLE,
    stem: 'Adding a quick table calculation "Moving Average" with a window of 3 will:',
    options: opts4(
      'Average the measure over the current and surrounding marks per the window/addressing',
      'Filter the data to 3 rows',
      'Create 3 sets',
      'Change the aggregation to MEDIAN'
    ),
    correct: ['a'],
    explanation: 'Moving Average is a table calculation that averages the measure across a sliding window of marks (e.g., previous 2 and current). The window size and direction are configured in the table-calc settings; it smooths trends.',
    references: [REF_TABLECALC]
  },
  {
    domain: EXPLORE, difficulty: 2, type: QType.SINGLE,
    stem: 'To analyze sales by a custom date range the user controls, you would combine:',
    options: opts4(
      'Two date parameters (Start/End) with a calculated boolean filter [Order Date] between them',
      'A group of dates',
      'A bin on the date',
      'A union of dates'
    ),
    correct: ['a'],
    explanation: 'Two date parameters define a user-controlled range; a calculated field returns TRUE when [Order Date] is between Start and End, and placing it on Filters = True restricts the view to that range interactively.',
    references: [REF_PARAM]
  },
  {
    domain: EXPLORE, difficulty: 2, type: QType.SINGLE,
    stem: 'You convert a continuous measure pill to discrete. The visible effect is:',
    options: opts4(
      'The data type changes to string',
      'It changes from green to blue and creates headers instead of an axis',
      'It is removed from the view',
      'It becomes a parameter'
    ),
    correct: ['b'],
    explanation: 'Discrete (blue) values create headers; continuous (green) create an axis. Converting a measure to discrete turns the pill blue and renders distinct value headers (e.g., as labels) rather than a continuous axis. The data type itself is unchanged.',
    references: [REF_DISCCONT]
  },

  // ── Sharing Insights (13) ──
  {
    domain: SHARE, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Tableau Desktop object lets you assemble multiple worksheets with interactive filters for monitoring on one screen?',
    options: opts4(
      'A story point',
      'A dashboard',
      'A data source',
      'A bin'
    ),
    correct: ['b'],
    explanation: 'A dashboard combines multiple worksheets and objects (filters, legends, images, text, containers) on a single canvas for combined, interactive monitoring and exploration.',
    references: [REF_DASHBOARD]
  },
  {
    domain: SHARE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want clicking a region on a map to navigate the viewer to a detail dashboard. Which dashboard action type is appropriate?',
    options: opts4(
      'Filter action',
      'Go to Sheet / Navigation action (or URL action)',
      'Highlight action',
      'Parameter action only'
    ),
    correct: ['b'],
    explanation: 'A Go to Sheet (navigation) action moves the user to another sheet/dashboard on select or menu; a URL action can open external pages. Filter/highlight actions affect data emphasis, not navigation.',
    references: [REF_DASHACTION]
  },
  {
    domain: SHARE, difficulty: 2, type: QType.SINGLE,
    stem: 'A floating object on a dashboard differs from a tiled object because:',
    options: opts4(
      'Floating objects are positioned with explicit x/y and can overlap; tiled objects snap into the layout grid',
      'Floating objects cannot show worksheets',
      'Tiled objects always overlap',
      'There is no difference'
    ),
    correct: ['a'],
    explanation: 'Tiled objects are placed in a non-overlapping layout that rearranges automatically; floating objects are freely positioned (and sized) with explicit coordinates and may overlap other objects — useful for overlays/legends.',
    references: [REF_DASHBOARD]
  },
  {
    domain: SHARE, difficulty: 1, type: QType.SINGLE,
    stem: 'Which file would you send so a recipient WITHOUT access to the database can still see the data and visuals?',
    options: opts4(
      '.twb',
      '.twbx (packaged, includes extract/data)',
      '.tds',
      '.tde schedule'
    ),
    correct: ['b'],
    explanation: 'A .twbx packages the workbook with its data (extract/file) and resources. A bare .twb only references the data source, so a recipient without source access could not load the data.',
    references: [REF_FILES]
  },
  {
    domain: SHARE, difficulty: 2, type: QType.SINGLE,
    stem: 'To export the underlying data of a selected view to a CSV/crosstab for a colleague, you use:',
    options: opts4(
      'Worksheet > Export > Data / Crosstab to Excel',
      'Data > New Data Source',
      'Analysis > Create Calculated Field',
      'Format > Workbook'
    ),
    correct: ['a'],
    explanation: 'Worksheet > Export offers Data (the rows behind the view) and Crosstab to Excel (the aggregated table as shown), letting recipients work with the numbers outside Tableau.',
    references: [REF_EXPORT]
  },
  {
    domain: SHARE, difficulty: 2, type: QType.SINGLE,
    stem: 'A story point captures which of the following?',
    options: opts4(
      'Only the chart type',
      'A snapshot of a sheet/dashboard\'s state (filters, sorting, annotations) at a step in the narrative',
      'The data source credentials',
      'The extract schedule'
    ),
    correct: ['b'],
    explanation: 'Each story point saves the state of the contained sheet/dashboard — applied filters, parameter values, selections, and annotations — so audiences can step through a curated analytical narrative.',
    references: [REF_STORY]
  },
  {
    domain: SHARE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want a dashboard filter shown as a dropdown that affects all sheets from the same data source. After adding the filter you should:',
    options: opts4(
      'Set "Apply to Worksheets" to "All Using This Data Source" and choose the Single Value (dropdown) display',
      'Convert it to a bin',
      'Add it to the Pages shelf',
      'Hide every worksheet'
    ),
    correct: ['a'],
    explanation: 'Use the filter card menu: set Apply to Worksheets > All Using This Data Source so one control governs every relevant sheet, and choose a Single Value (dropdown) presentation for a compact UI.',
    references: [REF_FILTER]
  },
  {
    domain: SHARE, difficulty: 2, type: QType.SINGLE,
    stem: 'Tableau Reader is free and can open .twbx files but cannot create new visualizations or connect to new data.',
    options: opts4('True', 'False', 'Reader can edit calculations', 'Reader cannot open .twbx'),
    correct: ['a'],
    explanation: 'True. Tableau Reader is a free viewer that opens packaged workbooks and supports interaction (filter/sort/hover) but not authoring, editing, or new data connections.',
    references: [REF_SHARE]
  },
  {
    domain: SHARE, difficulty: 2, type: QType.SINGLE,
    stem: 'To make tooltip text bold and include the region name dynamically, you would:',
    options: opts4(
      'Edit the Tooltip on the Marks card, insert the field, and apply formatting in the tooltip editor',
      'Change the data type',
      'Use a context filter',
      'Edit Format > Workbook only'
    ),
    correct: ['a'],
    explanation: 'The Marks-card Tooltip editor supports rich text formatting and inserting field/parameter tokens, so you can build a formatted, data-driven tooltip (e.g., bold region name and formatted sales).',
    references: [REF_TOOLTIP]
  },
  {
    domain: SHARE, difficulty: 1, type: QType.SINGLE,
    stem: 'A color legend that appears for a discrete dimension on Color is best edited via:',
    options: opts4(
      'Right-click the legend > Edit Colors to assign a palette/specific colours',
      'The Data Source page',
      'The Pages shelf',
      'Analysis > Aggregate Measures'
    ),
    correct: ['a'],
    explanation: 'Right-clicking a color legend opens Edit Colors, where you choose a categorical palette or assign specific colours to members, ensuring consistent, meaningful encoding for sharing.',
    references: [REF_LEGEND]
  },
  {
    domain: SHARE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want the dashboard to look the same regardless of the viewer\'s monitor and to maximize performance. Best sizing choice:',
    options: opts4(
      'Fixed size',
      'Automatic',
      'Range with very wide bounds',
      'It does not matter'
    ),
    correct: ['a'],
    explanation: 'Fixed dashboard size renders identically everywhere and lets Tableau cache/optimize layout, generally the best for consistency and performance, at the cost of not adapting to different screen sizes.',
    references: [REF_DASHBOARD]
  },
  {
    domain: SHARE, difficulty: 2, type: QType.SINGLE,
    stem: 'To publish an interactive viz to the public web for free from Tableau Desktop you would:',
    options: opts4(
      'Server > Tableau Public > Save to Tableau Public (sign in to a Public account)',
      'File > Export > PDF',
      'Data > Extract',
      'Worksheet > Duplicate'
    ),
    correct: ['a'],
    explanation: 'Saving to Tableau Public publishes the workbook to a free, publicly-visible Tableau Public profile. Remember Public is for non-confidential data and has size/visibility constraints.',
    references: [REF_PUBLIC]
  },
  {
    domain: SHARE, difficulty: 2, type: QType.SINGLE,
    stem: 'Why package custom shapes/images into a .twbx before sharing?',
    options: opts4(
      'So the recipient sees the custom marks/images even though they are not on their machine',
      'To make the file uneditable',
      'To delete the data',
      'To change the chart type automatically'
    ),
    correct: ['a'],
    explanation: 'A .twbx bundles custom shapes, images, and local data. Without packaging, custom resources stored only on your machine would be missing for the recipient, breaking the intended visuals.',
    references: [REF_FILES]
  },

  // ── Understanding Tableau Concepts (13) ──
  {
    domain: CONCEPTS, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Numeric fields that you typically aggregate (Sales, Profit, Quantity) are classified by Tableau as:',
    options: opts4(
      'Dimensions',
      'Measures',
      'Parameters',
      'Hierarchies'
    ),
    correct: ['b'],
    explanation: 'Measures are quantitative fields aggregated by default (SUM, AVG, etc.). Dimensions are qualitative fields that segment the data and set the level of detail.',
    references: [REF_DIMMEAS]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'What happens to the level of detail when you add another dimension to the Detail shelf?',
    options: opts4(
      'It coarsens (fewer marks)',
      'It becomes finer (more marks), one per additional combination',
      'It does not change',
      'It removes the measure'
    ),
    correct: ['b'],
    explanation: 'Adding a dimension (even on Detail) increases granularity, producing a mark for each new combination of dimension members, which also affects how measures aggregate.',
    references: [REF_LOD]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which statement about the Color vs Detail targets on the Marks card is correct?',
    options: opts4(
      'Both always change granularity and colour',
      'Color encodes a field as colour (and adds detail); Detail adds granularity without a colour/size encoding',
      'Detail changes the chart type',
      'Color removes marks'
    ),
    correct: ['b'],
    explanation: 'Putting a field on Color both encodes it visually as colour and increases detail. Detail only increases granularity (more marks) without an additional visual encoding like colour or size.',
    references: [REF_MARKS]
  },
  {
    domain: CONCEPTS, difficulty: 1, type: QType.SINGLE,
    stem: 'A .hyper file is:',
    options: opts4(
      'A Tableau workbook',
      'A Tableau extract stored in the high-performance Hyper data engine format',
      'A saved dashboard image',
      'A connection-only metadata file'
    ),
    correct: ['b'],
    explanation: 'A .hyper file is a Tableau extract created/queried by the Hyper engine. It stores a snapshot of data for fast, in-memory analytics and offline use.',
    references: [REF_EXTRACT]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which is true of a continuous field placed on the Columns shelf?',
    options: opts4(
      'It creates discrete headers',
      'It creates a continuous axis (green pill)',
      'It always becomes a filter',
      'It cannot be aggregated'
    ),
    correct: ['b'],
    explanation: 'A continuous (green) field on Columns produces a continuous axis. Discrete (blue) fields instead produce headers. This holds regardless of whether the field is a dimension or a measure.',
    references: [REF_DISCCONT]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'What does ATTR() do in Tableau?',
    options: opts4(
      'Sums a measure',
      'Returns the single value of an expression if it is unique across the rows for the mark, otherwise an asterisk (*)',
      'Creates a parameter',
      'Pivots data'
    ),
    correct: ['b'],
    explanation: 'ATTR() is an aggregate that returns the value if it is the same for all underlying rows of the mark, or "*" if values differ. It is useful for safely placing a dimension where an aggregate is expected.',
    references: [REF_AGG]
  },
  {
    domain: CONCEPTS, difficulty: 1, type: QType.SINGLE,
    stem: 'The Show Me feature primarily helps a user by:',
    options: opts4(
      'Refreshing the extract',
      'Suggesting and switching among appropriate visualization types for the selected fields',
      'Publishing to Server',
      'Editing data types'
    ),
    correct: ['b'],
    explanation: 'Show Me recommends suitable chart types based on the selected fields and lets you switch the visualization quickly, accelerating exploratory building for new users.',
    references: [REF_SHOWME]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'Dimensions define the level of detail (granularity) of a view, while measures provide the numbers that get aggregated.',
    options: opts4('True', 'False', 'Only measures define granularity', 'Dimensions cannot be dates'),
    correct: ['a'],
    explanation: 'True. The set of dimensions in a view (including Detail) determines its granularity; measures are the aggregated values shown at that granularity.',
    references: [REF_DIMMEAS]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'A hierarchy in Tableau (e.g., Country ▸ State ▸ City) primarily enables:',
    options: opts4(
      'Faster extracts',
      'Drill-down/up navigation via + / − on the field in the view',
      'Joining tables',
      'Publishing to Public'
    ),
    correct: ['b'],
    explanation: 'A hierarchy groups related dimensions so users can expand (+) or collapse (−) levels to drill down or roll up in the view, supporting intuitive exploration.',
    references: [REF_HIERARCHY]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which best describes the difference between the Filters shelf and an extract filter?',
    options: opts4(
      'They are identical',
      'A worksheet Filters-shelf filter affects only that view; an extract filter limits the rows stored in the .hyper extract itself',
      'Extract filters affect only one sheet',
      'Filters-shelf filters change the data source rows permanently'
    ),
    correct: ['b'],
    explanation: 'A Filters-shelf filter hides data in a single worksheet without changing stored data. An extract filter restricts which rows are written into the extract, affecting every use of that extract.',
    references: [REF_FILTERORDER]
  },
  {
    domain: CONCEPTS, difficulty: 1, type: QType.SINGLE,
    stem: 'In the workspace, the Marks card\'s mark type dropdown lets you:',
    options: opts4(
      'Change the data source',
      'Select how data is drawn (Automatic, Bar, Line, Area, Square, Circle, Shape, Text, Map, Pie, Gantt, etc.)',
      'Schedule a refresh',
      'Create a parameter'
    ),
    correct: ['b'],
    explanation: 'The mark type dropdown sets the geometry used to render marks (bar, line, circle, shape, text, map, etc.). "Automatic" lets Tableau choose based on the fields in the view.',
    references: [REF_MARKS]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'What is the practical difference between .twb and .twbx for a Desktop Specialist?',
    options: opts4(
      '.twb includes the data; .twbx does not',
      '.twb references the data (smaller, needs source access); .twbx packages the data/resources for self-contained sharing',
      'They are interchangeable in every scenario',
      '.twbx cannot be opened by Tableau Desktop'
    ),
    correct: ['b'],
    explanation: 'A .twb is a lightweight XML referencing the source; a .twbx zips the workbook with extracts/file data and custom resources so it opens anywhere. Choose .twbx when the recipient lacks source access.',
    references: [REF_FILES]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'Designing for performance, which guidance is correct for a Desktop Specialist?',
    options: opts4(
      'Always use live connections with maximum columns',
      'Use extracts, hide/remove unused fields, minimize complex calculations and high-cardinality filters, and prefer fixed dashboard sizes',
      'Add as many quick filters as possible',
      'Avoid aggregations entirely'
    ),
    correct: ['b'],
    explanation: 'Tableau performance guidance: prefer extracts, reduce fields, limit and simplify calculations, avoid many high-cardinality quick filters, and use fixed dashboard sizing, all reduce query/render cost.',
    references: [REF_PERFORMANCE]
  }
];

// ───────────────────── Practice Exam 3 ─────────────────────
const P3: Q[] = [
  // ── Connecting to and Preparing Data (16) ──
  {
    domain: CONNECT, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which of the following is a FILE-based data source in Tableau\'s Connect pane?',
    options: opts4(
      'Microsoft SQL Server',
      'JSON file',
      'Amazon Redshift',
      'Google BigQuery'
    ),
    correct: ['b'],
    explanation: 'JSON, Excel, Text/CSV, PDF, spatial files, and statistical files are file-based sources under "To a File". SQL Server, Redshift, and BigQuery are server/cloud connections under "To a Server".',
    references: [REF_CONNECT]
  },
  {
    domain: CONNECT, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A full outer join between two tables returns:',
    options: opts4(
      'Only matching rows',
      'All rows from both tables, with nulls where there is no match on either side',
      'Only left-table rows',
      'Only right-table rows'
    ),
    correct: ['b'],
    explanation: 'A full outer join returns every row from both tables; where a key does not match, the columns from the non-matching side are null. Inner returns only matches; left/right keep one full side.',
    references: [REF_JOINS]
  },
  {
    domain: CONNECT, difficulty: 2, type: QType.SINGLE,
    stem: 'You drag a single table onto the canvas and build views directly. This single-table model is valid because:',
    options: opts4(
      'Tableau requires at least two tables',
      'A data source can be a single table; relationships/joins/unions are only needed to combine multiple tables',
      'You must always create an extract first',
      'Single tables cannot be visualized'
    ),
    correct: ['b'],
    explanation: 'A data source can be one table. Joins, unions, relationships, and blends are mechanisms for combining multiple tables/sources; with a single table you can build views immediately.',
    references: [REF_RELATE]
  },
  {
    domain: CONNECT, difficulty: 2, type: QType.SINGLE,
    stem: 'A "Phone" field imported as a number drops leading zeros. The correct fix is to:',
    options: opts4(
      'Sum the field',
      'Change the field\'s data type to String so the value is preserved as text',
      'Pivot the field',
      'Blend it'
    ),
    correct: ['b'],
    explanation: 'Identifier-like values (phone numbers, ZIP codes) should be String, not Number, to preserve leading zeros and avoid unintended aggregation. Change the data type via the field/column menu.',
    references: [REF_DATATYPES]
  },
  {
    domain: CONNECT, difficulty: 3, type: QType.SINGLE,
    stem: 'You union monthly files. You want to know which source file each row came from. Which automatically-generated field helps?',
    options: opts4(
      'The "Path" / "Table Name" field generated by the union',
      'A FIXED LOD',
      'A context filter',
      'Pivot Field Names'
    ),
    correct: ['a'],
    explanation: 'A union adds metadata fields such as "Path" (for file-based wildcard unions) and "Table Name", letting you trace each row to its originating file/sheet and even filter or label by source.',
    references: [REF_UNION]
  },
  {
    domain: CONNECT, difficulty: 2, type: QType.SINGLE,
    stem: 'To reshape a "wide" table with Q1, Q2, Q3, Q4 sales columns into one Quarter and one Sales column, you:',
    options: opts4(
      'Pivot the four columns from columns to rows',
      'Join the columns',
      'Blend the columns',
      'Create a set'
    ),
    correct: ['a'],
    explanation: 'Selecting the four quarter columns and choosing Pivot transforms them into two columns: Pivot Field Names (Quarter) and Pivot Field Values (Sales), the tidy long format suited to analysis.',
    references: [REF_PIVOT]
  },
  {
    domain: CONNECT, difficulty: 2, type: QType.SINGLE,
    stem: 'Data Interpreter can be turned on and off, and you can review the changes it proposes before relying on them.',
    options: opts4('True', 'False', 'It is always on', 'It cannot be reviewed'),
    correct: ['a'],
    explanation: 'True. Data Interpreter is optional — you enable it on the Data Source page, and the "Review the results" link shows exactly what it cleaned/restructured so you can verify or disable it.',
    references: [REF_DATAINTERPRETER]
  },
  {
    domain: CONNECT, difficulty: 2, type: QType.SINGLE,
    stem: 'You want an extract limited to the most recent 10,000 rows for quick prototyping. Which extract option do you use?',
    options: opts4(
      'Number of Rows = Top N (sample) rows',
      'Aggregate for visible dimensions',
      'Incremental refresh',
      'Wildcard union'
    ),
    correct: ['a'],
    explanation: 'The extract dialog\'s "Number of Rows" lets you take a Sample (Top N) of rows, useful for fast prototyping on a subset before extracting all rows.',
    references: [REF_EXTRACT]
  },
  {
    domain: CONNECT, difficulty: 3, type: QType.SINGLE,
    stem: 'When blending, the orange checkmark/link icon next to a field in the secondary source indicates:',
    options: opts4(
      'The field is hidden',
      'The field is being used as the active linking field between primary and secondary sources',
      'The field is a parameter',
      'The field has a calculation error'
    ),
    correct: ['b'],
    explanation: 'In a blend, an orange link icon marks the active linking field(s) connecting the primary and secondary data sources; a grey/broken link means available but inactive. You can toggle which fields link.',
    references: [REF_BLEND]
  },
  {
    domain: CONNECT, difficulty: 2, type: QType.SINGLE,
    stem: 'A relationship is set between Sales (many) and Region lookup (one). Using only Region fields in a sheet, Tableau will:',
    options: opts4(
      'Always duplicate Region rows by Sales count',
      'Query the Region table at its own level of detail without inflating it via the relationship',
      'Return nothing',
      'Force an inner join dropping unmatched regions'
    ),
    correct: ['b'],
    explanation: 'Relationships keep each table at its native granularity. Using only Region fields queries Region without multiplying rows by Sales — avoiding the fan-out a fixed join could cause.',
    references: [REF_RELATE]
  },
  {
    domain: CONNECT, difficulty: 1, type: QType.SINGLE,
    stem: 'Renaming a field via the field menu (e.g., "Sales Amount" → "Sales") affects:',
    options: opts4(
      'The underlying database column name',
      'Only the display name (alias) of the field in Tableau, not the source column',
      'The data type',
      'The extract schedule'
    ),
    correct: ['b'],
    explanation: 'Renaming changes only Tableau\'s display label for the field; the source column is untouched. This improves readability without altering the database.',
    references: [REF_FIELDS]
  },
  {
    domain: CONNECT, difficulty: 2, type: QType.SINGLE,
    stem: 'Why publish a .tds/.tdsx (data source) to Tableau Server rather than embedding the connection in every workbook?',
    options: opts4(
      'It permanently deletes the source data',
      'Centralized, governed reuse: shared joins/relationships, calculations, and metadata stay consistent across many workbooks',
      'It disables extracts',
      'It converts data to PDF'
    ),
    correct: ['b'],
    explanation: 'A published data source provides one governed, reusable definition (model, calculations, aliases, security) that many workbooks share, preventing divergence and duplicated effort.',
    references: [REF_DATASERVER]
  },
  {
    domain: CONNECT, difficulty: 2, type: QType.SINGLE,
    stem: 'Setting a field\'s default aggregation to Average in the Data pane means:',
    options: opts4(
      'It changes the data type to decimal',
      'Whenever the measure is added to a view it aggregates as AVG by default (overridable per use)',
      'It deletes SUM',
      'It only affects extracts'
    ),
    correct: ['b'],
    explanation: 'Default Properties > Aggregation sets the measure\'s default aggregation (e.g., Average) so new uses start with that aggregation; you can still change it on a specific pill.',
    references: [REF_FIELDS]
  },
  {
    domain: CONNECT, difficulty: 2, type: QType.SINGLE,
    stem: 'A cross-database join in Tableau lets you:',
    options: opts4(
      'Join tables from different connections (e.g., Excel + SQL Server) within one data source',
      'Append rows from identical files',
      'Aggregate two published sources',
      'Reshape columns to rows'
    ),
    correct: ['a'],
    explanation: 'Cross-database joins combine tables from different connections/platforms inside a single Tableau data source (Tableau handles the federation), distinct from blending which combines aggregated results post-query.',
    references: [REF_JOINS]
  },
  {
    domain: CONNECT, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about extracts.',
    options: opts4(
      'Extracts are stored in the Hyper (.hyper) format.',
      'Extracts can be filtered and aggregated to reduce size.',
      'Extracts can be refreshed fully or incrementally.',
      'An extract always reflects live source changes in real time.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Extracts are .hyper snapshots; they support row/field filters, aggregation, and full or incremental refresh. They do NOT update in real time — that is a live connection — so D is false.',
    references: [REF_EXTRACT, REF_LIVEEXTRACT]
  },
  {
    domain: CONNECT, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to combine Customers and Orders so every customer appears even with no orders, and you need the result at the row (order) level. Which join keeps all customers?',
    options: opts4(
      'Inner join',
      'Left join with Customers on the left',
      'A union',
      'A pivot'
    ),
    correct: ['b'],
    explanation: 'A left join with Customers on the left retains every customer; orders attach where they exist and are null otherwise, preserving customers without orders at the order-level grain.',
    references: [REF_JOINS]
  },

  // ── Exploring and Analyzing Data (23) ──
  {
    domain: EXPLORE, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'A discrete dimension on Columns and a continuous measure on Rows most commonly produces:',
    options: opts4(
      'A scatter plot',
      'A bar chart',
      'A histogram',
      'A box plot'
    ),
    correct: ['b'],
    explanation: 'A categorical (discrete) dimension across Columns with an aggregated measure on Rows yields a bar chart by default — the classic comparison-by-category visualization.',
    references: [REF_VIZTYPES]
  },
  {
    domain: EXPLORE, difficulty: 2, type: QType.SINGLE,
    stem: 'MIN([Order Date]) in a calculation/aggregation returns:',
    options: opts4(
      'The latest order date',
      'The earliest (minimum) order date',
      'The count of dates',
      'Today\'s date'
    ),
    correct: ['b'],
    explanation: 'MIN on a date returns the earliest date in the aggregation scope; MAX returns the latest. These are common for first/last purchase analysis.',
    references: [REF_AGG]
  },
  {
    domain: EXPLORE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You want a text table (cross-tab) of Sales by Region (rows) and Year (columns). Which mark type is used?',
    options: opts4(
      'Bar',
      'Text (the Text/Label encoding with Region and Year as headers)',
      'Map',
      'Pie'
    ),
    correct: ['b'],
    explanation: 'A cross-tab/text table uses the Text mark type with dimensions forming row/column headers and the measure shown as text in each cell — effectively a pivoted numeric table.',
    references: [REF_VIZTYPES]
  },
  {
    domain: EXPLORE, difficulty: 3, type: QType.SINGLE,
    stem: 'You need average order size per customer, then averaged across customers (avg of a per-customer aggregate). Which approach is correct?',
    options: opts4(
      'AVG([Sales]) directly',
      'AVG({ FIXED [Customer] : AVG([Sales]) }) or use the LOD to pre-aggregate per customer then average',
      'SUM([Sales]) / COUNT(rows)',
      'A context filter'
    ),
    correct: ['b'],
    explanation: 'To average a per-customer metric you must first aggregate to the customer grain (a FIXED LOD per Customer), then average those results. A plain AVG([Sales]) averages rows, not customers.',
    references: [REF_LOD]
  },
  {
    domain: EXPLORE, difficulty: 3, type: QType.SINGLE,
    stem: 'RANK() applied as a table calculation on SUM(Sales) by Sub-Category will:',
    options: opts4(
      'Filter to the top sub-category',
      'Assign a competition rank to each sub-category based on SUM(Sales) per the addressing/partition',
      'Sum the sales',
      'Create bins'
    ),
    correct: ['b'],
    explanation: 'RANK() is a table calculation that orders marks by the chosen expression and assigns ranks within the partition. Compute Using controls the partitioning/addressing scope of the ranking.',
    references: [REF_TABLECALC]
  },
  {
    domain: EXPLORE, difficulty: 2, type: QType.SINGLE,
    stem: 'To show monthly sales as a smooth time series line, the date should be placed as:',
    options: opts4(
      'A discrete YEAR part only',
      'A continuous date (e.g., continuous Month) so it forms a time axis',
      'A string',
      'A measure'
    ),
    correct: ['b'],
    explanation: 'A continuous date (green Month/MonthYear) builds a true chronological axis, producing a connected line over time, the appropriate encoding for trend analysis.',
    references: [REF_DATES]
  },
  {
    domain: EXPLORE, difficulty: 2, type: QType.SINGLE,
    stem: 'You apply a filter "Sum of Sales is at least 10,000" on Customer. This is a:',
    options: opts4(
      'Dimension filter',
      'Measure (aggregate) filter on the customers by their summed sales',
      'Context filter',
      'Extract filter'
    ),
    correct: ['b'],
    explanation: 'Filtering members by an aggregated condition (SUM(Sales) ≥ 10,000) is a measure/aggregate filter. It is applied after dimension filters in the order of operations and keeps only qualifying customers.',
    references: [REF_FILTER]
  },
  {
    domain: EXPLORE, difficulty: 2, type: QType.SINGLE,
    stem: 'A combined axis (measure names/measure values) chart is useful when you want to:',
    options: opts4(
      'Plot multiple measures on the same axis using Measure Values / Measure Names',
      'Join two tables',
      'Create a set',
      'Pivot data'
    ),
    correct: ['a'],
    explanation: 'Measure Values and Measure Names let you display several measures together (e.g., on one axis or as separate columns) without manual dual-axis setup, handy for comparing multiple metrics.',
    references: [REF_VIZTYPES]
  },
  {
    domain: EXPLORE, difficulty: 2, type: QType.SINGLE,
    stem: 'You drag a "Median with 95% CI" reference distribution from the Analytics pane. This adds:',
    options: opts4(
      'A trend line',
      'A reference band/distribution summarizing the data\'s spread on the axis',
      'A filter',
      'A parameter'
    ),
    correct: ['b'],
    explanation: 'Reference distributions/bands from the Analytics pane shade a statistical range (e.g., confidence interval, percentiles, standard deviation) on the axis to contextualize marks.',
    references: [REF_REFLINE]
  },
  {
    domain: EXPLORE, difficulty: 3, type: QType.SINGLE,
    stem: 'PREVIOUS_VALUE(0) in a table calculation is typically used to:',
    options: opts4(
      'Return the next mark\'s value',
      'Reference the result of the calculation from the previous mark (e.g., to build custom running computations)',
      'Filter the data',
      'Rank members'
    ),
    correct: ['b'],
    explanation: 'PREVIOUS_VALUE returns the value of this calculation in the previous mark (with a starting value if none), enabling custom cumulative/recursive table calculations along the addressing direction.',
    references: [REF_TABLECALC]
  },
  {
    domain: EXPLORE, difficulty: 2, type: QType.SINGLE,
    stem: 'A symbol map sized by Sales and coloured by Profit requires:',
    options: opts4(
      'Map mark type with a geographic field on Detail, Sales on Size, Profit on Color',
      'Bar mark type',
      'Text mark type',
      'Pie with Sales on Path'
    ),
    correct: ['a'],
    explanation: 'A proportional symbol map uses the Map (circle) mark with a geographic dimension placing points, Sales encoded on Size, and Profit on Color, two encodings on geographic marks.',
    references: [REF_MAPS]
  },
  {
    domain: EXPLORE, difficulty: 2, type: QType.SINGLE,
    stem: 'A parameter of type String with allowable values "Sales","Profit","Quantity" combined with a CASE calculation lets users:',
    options: opts4(
      'Switch which measure the chart displays',
      'Change the data source',
      'Rename fields',
      'Create a union'
    ),
    correct: ['a'],
    explanation: 'A string parameter listing measure names plus a CASE [Parameter] WHEN ... calculation returns the chosen measure, so the user can swap the displayed metric through the parameter control.',
    references: [REF_PARAM]
  },
  {
    domain: EXPLORE, difficulty: 2, type: QType.SINGLE,
    stem: 'Table calculations are computed after most filters, based on what is in the view, so changing a dimension filter can change the table-calc result.',
    options: opts4('True', 'False', 'Table calcs ignore the view', 'Table calcs run before context filters'),
    correct: ['a'],
    explanation: 'True. Table calculations operate on the aggregated result set already shaped by filters/LODs; altering which marks are present (e.g., a dimension filter) changes the partition and thus the table-calc output.',
    references: [REF_FILTERORDER]
  },
  {
    domain: EXPLORE, difficulty: 2, type: QType.SINGLE,
    stem: 'IIF([Profit] > 0, "Profitable", "Loss") will most likely be created as a:',
    options: opts4(
      'Continuous measure',
      'Discrete dimension (string)',
      'Parameter',
      'Bin'
    ),
    correct: ['b'],
    explanation: 'IIF returning string values produces a discrete dimension with categorical members ("Profitable"/"Loss"), suitable for colouring or segmenting marks.',
    references: [REF_CALC]
  },
  {
    domain: EXPLORE, difficulty: 1, type: QType.SINGLE,
    stem: 'To turn a bar chart into a side-by-side (grouped) bar chart by Segment, you typically:',
    options: opts4(
      'Add Segment to Columns or to Color and adjust the layout',
      'Create an extract',
      'Add a context filter',
      'Use the Pages shelf only'
    ),
    correct: ['a'],
    explanation: 'Adding a second dimension (Segment) to Columns next to the existing dimension (or onto Color and adjusting) creates grouped/stacked bars for category comparison.',
    references: [REF_VIZTYPES]
  },
  {
    domain: EXPLORE, difficulty: 2, type: QType.SINGLE,
    stem: 'WINDOW_AVG(SUM([Sales])) computes:',
    options: opts4(
      'The row-level average sales',
      'The average of SUM(Sales) across the marks in the window/partition (a table calculation)',
      'The data source average',
      'A FIXED average per customer'
    ),
    correct: ['b'],
    explanation: 'WINDOW_AVG is a table calculation averaging an aggregate (SUM(Sales)) across marks in the defined window/partition, used for benchmarks like "average across visible categories".',
    references: [REF_TABLECALC]
  },
  {
    domain: EXPLORE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about LOD expressions.',
    options: opts4(
      'FIXED computes a value at the specified dimensions regardless of view dimensions.',
      'INCLUDE adds dimensions to the view\'s level of detail for the calculation.',
      'EXCLUDE removes dimensions from the level of detail for the calculation.',
      'LOD expressions are table calculations.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'FIXED, INCLUDE, and EXCLUDE control the granularity of an aggregate independent of, added to, or removed from the view. LOD expressions are NOT table calculations — they are computed in the query, so D is false.',
    references: [REF_LOD]
  },
  {
    domain: EXPLORE, difficulty: 2, type: QType.SINGLE,
    stem: 'To find the percent of total sales each region contributes to the grand total, the simplest built-in tool is:',
    options: opts4(
      'A Percent of Total table calculation computed using Table (across)',
      'A FIXED LOD only',
      'A group',
      'A bin'
    ),
    correct: ['a'],
    explanation: 'The Percent of Total quick table calculation divides each mark by the total of its partition; setting Compute Using to the appropriate scope yields each region\'s share of the grand total.',
    references: [REF_TABLECALC]
  },
  {
    domain: EXPLORE, difficulty: 2, type: QType.SINGLE,
    stem: 'Disaggregating measures (Analysis > Aggregate Measures off) is useful to:',
    options: opts4(
      'Show every individual data point (row) rather than an aggregate, e.g., for a detailed scatter',
      'Always speed up the workbook',
      'Convert measures to dimensions',
      'Create a parameter'
    ),
    correct: ['a'],
    explanation: 'Turning off Aggregate Measures plots each underlying row as its own mark instead of summarizing, useful for distribution/scatter analysis where you want individual points.',
    references: [REF_VIZTYPES]
  },
  {
    domain: EXPLORE, difficulty: 2, type: QType.SINGLE,
    stem: 'You add a forecast from the Analytics pane to a time series. Tableau requires:',
    options: opts4(
      'A continuous date and at least one measure to project future values',
      'A discrete string only',
      'A blended data source',
      'A parameter'
    ),
    correct: ['a'],
    explanation: 'Forecasting needs a date dimension (typically continuous) and a measure; Tableau applies exponential smoothing to estimate and extend future values with a confidence band.',
    references: [REF_TRENDLINE]
  },
  {
    domain: EXPLORE, difficulty: 2, type: QType.SINGLE,
    stem: 'Quick filter display "Multiple Values (dropdown)" vs "Single Value (list)" differs because:',
    options: opts4(
      'Multiple Values allows selecting several members; Single Value restricts to exactly one selection',
      'They are identical',
      'Single Value selects all members',
      'Multiple Values hides the filter'
    ),
    correct: ['a'],
    explanation: 'Multiple-value filter modes allow choosing several members (checkboxes/dropdown); single-value modes (radio/list/slider) constrain the selection to one member at a time, controlling interaction behavior.',
    references: [REF_FILTER]
  },
  {
    domain: EXPLORE, difficulty: 3, type: QType.SINGLE,
    stem: 'A FIXED LOD ignores which of the following that a normal aggregate would respond to?',
    options: opts4(
      'Extract filters',
      'The dimensions placed in the view (it stays at its declared granularity, though context filters still affect it)',
      'Data source filters',
      'The data type'
    ),
    correct: ['b'],
    explanation: 'FIXED computes at its stated dimensionality regardless of the view\'s dimensions. It is still affected by context, data source, and extract filters (which precede it) but not by ordinary dimension filters or view granularity.',
    references: [REF_LOD]
  },
  {
    domain: EXPLORE, difficulty: 1, type: QType.SINGLE,
    stem: 'To quickly add a total row/column to a text table you would use:',
    options: opts4(
      'Analysis > Totals > Show Column/Row Grand Totals',
      'A FIXED LOD',
      'A union',
      'A parameter'
    ),
    correct: ['a'],
    explanation: 'Analysis > Totals lets you show grand totals and subtotals on a view; Tableau adds aggregated total rows/columns automatically without manual calculations.',
    references: [REF_VIZTYPES]
  },

  // ── Sharing Insights (13) ──
  {
    domain: SHARE, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Tableau file extension is the bundled, shareable workbook that includes data?',
    options: opts4(
      '.twb',
      '.twbx',
      '.tds',
      '.hyper'
    ),
    correct: ['b'],
    explanation: 'The .twbx (Tableau Packaged Workbook) zips the workbook with its extract/file data and resources, so it can be opened by a recipient without access to the original source.',
    references: [REF_FILES]
  },
  {
    domain: SHARE, difficulty: 2, type: QType.SINGLE,
    stem: 'A dashboard "Use as Filter" toggle on a worksheet does what?',
    options: opts4(
      'Permanently deletes other sheets',
      'Makes selections in that sheet act as a filter action on the rest of the dashboard',
      'Creates an extract',
      'Changes the workbook theme'
    ),
    correct: ['b'],
    explanation: 'Enabling "Use as Filter" automatically creates a filter action so selecting marks in that worksheet filters the other sheets on the dashboard, a one-click interactivity setup.',
    references: [REF_DASHACTION]
  },
  {
    domain: SHARE, difficulty: 2, type: QType.SINGLE,
    stem: 'To create a story that walks viewers through three insights, you would:',
    options: opts4(
      'Add a story sheet and create three story points, each capturing a sheet/dashboard state with a caption',
      'Create three data sources',
      'Use the Pages shelf',
      'Publish three .tds files'
    ),
    correct: ['a'],
    explanation: 'A story is built from story points; each point holds a captioned snapshot of a sheet or dashboard, and the sequence guides the audience through the narrative.',
    references: [REF_STORY]
  },
  {
    domain: SHARE, difficulty: 1, type: QType.SINGLE,
    stem: 'A .twb (not packaged) sent to a colleague will fail to show data if:',
    options: opts4(
      'They have Tableau Desktop',
      'They lack access to the referenced data source (the .twb does not contain the data)',
      'They use Tableau Public',
      'It always works regardless'
    ),
    correct: ['b'],
    explanation: 'Because a .twb only stores the connection/metadata, a recipient without access to the live source or extract cannot load the data, this is why .twbx packaging exists for sharing.',
    references: [REF_FILES]
  },
  {
    domain: SHARE, difficulty: 2, type: QType.SINGLE,
    stem: 'To export the exact aggregated table shown in a worksheet to Excel, use:',
    options: opts4(
      'Worksheet > Export > Crosstab to Excel',
      'Data > New Data Source',
      'File > Print',
      'Analysis > Create Calculated Field'
    ),
    correct: ['a'],
    explanation: 'Crosstab to Excel exports the view\'s aggregated table (as displayed) into an Excel sheet, ideal for recipients who want the numbers behind the chart.',
    references: [REF_EXPORT]
  },
  {
    domain: SHARE, difficulty: 2, type: QType.SINGLE,
    stem: 'A URL action on a dashboard is used to:',
    options: opts4(
      'Open an external web page (optionally passing field values) when a user selects a mark or menu item',
      'Refresh the extract',
      'Create a calculated field',
      'Change the data type'
    ),
    correct: ['a'],
    explanation: 'A URL action opens a web link, optionally injecting field/parameter values into the URL, enabling drill-through to external systems or web content from the dashboard.',
    references: [REF_DASHACTION]
  },
  {
    domain: SHARE, difficulty: 2, type: QType.SINGLE,
    stem: 'A dashboard container (horizontal/vertical) primarily helps you:',
    options: opts4(
      'Group and arrange objects so they resize together with consistent layout',
      'Connect to data',
      'Create a parameter',
      'Aggregate measures'
    ),
    correct: ['a'],
    explanation: 'Layout containers group objects and control how they distribute/resize together (evenly or proportionally), key to building responsive, well-organized dashboards.',
    references: [REF_DASHBOARD]
  },
  {
    domain: SHARE, difficulty: 2, type: QType.SINGLE,
    stem: 'You can export a single worksheet or a dashboard as an image (e.g., PNG) directly from Tableau Desktop.',
    options: opts4('True', 'False', 'Only worksheets, never dashboards', 'Only after publishing'),
    correct: ['a'],
    explanation: 'True. Worksheet/Dashboard > Export Image (or copying as image) produces a static raster/EMF of the current view or dashboard for use in documents and slides.',
    references: [REF_EXPORT]
  },
  {
    domain: SHARE, difficulty: 2, type: QType.SINGLE,
    stem: 'To ensure a shared workbook uses your corporate font/colour everywhere, set them in:',
    options: opts4(
      'Format > Workbook (workbook-level defaults)',
      'Each tooltip separately',
      'The Data Source page',
      'A FIXED LOD'
    ),
    correct: ['a'],
    explanation: 'Format > Workbook applies consistent default fonts and colours across all sheets/dashboards, ensuring brand consistency when the workbook is shared.',
    references: [REF_FORMAT]
  },
  {
    domain: SHARE, difficulty: 1, type: QType.SINGLE,
    stem: 'Tableau Public is appropriate for:',
    options: opts4(
      'Confidential internal financial data',
      'Sharing non-sensitive visualizations publicly for free on the web',
      'Securely hosting private dashboards with row-level security',
      'Offline-only distribution'
    ),
    correct: ['b'],
    explanation: 'Tableau Public is a free platform for publishing public, non-confidential visualizations. It is not suitable for confidential data because content is publicly accessible.',
    references: [REF_PUBLIC]
  },
  {
    domain: SHARE, difficulty: 2, type: QType.SINGLE,
    stem: 'A filter action set to "Exclude all values" when the selection is cleared will:',
    options: opts4(
      'Show all data when nothing is selected',
      'Show no data in the target until a selection is made (clearing the selection excludes everything)',
      'Delete the worksheet',
      'Create a parameter'
    ),
    correct: ['b'],
    explanation: 'The filter action\'s "Clearing the selection will: Exclude all values" option leaves the target empty until the user selects something, often used for drill-down dashboards that start blank.',
    references: [REF_DASHACTION]
  },
  {
    domain: SHARE, difficulty: 2, type: QType.SINGLE,
    stem: 'To let viewers see a viz-in-tooltip (a mini chart inside the hover tooltip) you configure it in:',
    options: opts4(
      'The Tooltip editor on the Marks card (Insert > Sheet)',
      'The Data Source page',
      'A FIXED LOD',
      'The Pages shelf'
    ),
    correct: ['a'],
    explanation: 'Viz in Tooltip is added through the Marks-card Tooltip editor by inserting another sheet; hovering a mark then shows a contextual mini-visualization filtered to that mark.',
    references: [REF_TOOLTIP]
  },
  {
    domain: SHARE, difficulty: 2, type: QType.SINGLE,
    stem: 'Best practice before sharing a .twbx widely, regarding data, is to:',
    options: opts4(
      'Include every raw column for completeness',
      'Be aware the extract/data is bundled inside and may contain sensitive rows — filter/limit it appropriately',
      'Always switch to a live connection',
      'Remove all formatting'
    ),
    correct: ['b'],
    explanation: 'Because a .twbx embeds the data, sharing it can expose sensitive rows/columns. Apply extract/data source filters and remove unneeded fields before distributing publicly.',
    references: [REF_FILES]
  },

  // ── Understanding Tableau Concepts (13) ──
  {
    domain: CONCEPTS, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'In Tableau, a green pill on a shelf indicates the field is:',
    options: opts4(
      'Discrete',
      'Continuous (creates an axis)',
      'A parameter',
      'A set'
    ),
    correct: ['b'],
    explanation: 'Green pills are continuous and produce an axis (a continuous range of values). Blue pills are discrete and produce headers (distinct categories).',
    references: [REF_DISCCONT]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'A measure can be used as a dimension when:',
    options: opts4(
      'Never — measures cannot be dimensions',
      'You drag it to a dimension role or make it discrete, so its values segment the data rather than aggregate',
      'Only after publishing',
      'Only in extracts'
    ),
    correct: ['b'],
    explanation: 'Tableau lets you convert a measure to a dimension (or use it discretely) so its individual values segment the view instead of being aggregated, demonstrating that role and aggregation are flexible.',
    references: [REF_DIMMEAS]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'The Size target on the Marks card is used to:',
    options: opts4(
      'Change the data source',
      'Encode a field (or fixed size) to the size of marks (e.g., bubble size)',
      'Filter data',
      'Create a story'
    ),
    correct: ['b'],
    explanation: 'Size encodes a field as mark size (e.g., larger circles for larger sales) or sets a uniform size. It is one of the Marks-card visual encodings alongside Color, Label, Detail, and Shape.',
    references: [REF_MARKS]
  },
  {
    domain: CONCEPTS, difficulty: 1, type: QType.SINGLE,
    stem: 'A .tdsx file differs from a .tds because it:',
    options: opts4(
      'Contains a dashboard',
      'Packages the data source metadata together with the local data/extract (self-contained)',
      'Is an image',
      'Cannot be reused'
    ),
    correct: ['b'],
    explanation: 'A .tds stores only connection/metadata; a .tdsx additionally bundles the local extract/file data so the published/shared data source is self-contained.',
    references: [REF_FILES]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which is the best description of the difference between blending and joining conceptually?',
    options: opts4(
      'Joining combines data before aggregation (row level); blending combines results after each source is aggregated, on a linking field',
      'They are identical',
      'Blending always duplicates rows',
      'Joining only works on files'
    ),
    correct: ['a'],
    explanation: 'A join merges rows at the data level prior to aggregation; a blend queries each source separately, aggregates, then combines results on a common dimension, suited to different-granularity or cross-system data.',
    references: [REF_BLEND]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'The generated fields "Latitude (generated)" and "Longitude (generated)" appear because:',
    options: opts4(
      'You created a parameter',
      'Tableau recognized a field\'s geographic role and produced coordinates for mapping',
      'You unioned files',
      'You added a table calculation'
    ),
    correct: ['b'],
    explanation: 'When a field has a geographic role, Tableau auto-generates Latitude/Longitude (generated) so it can plot the geography on a map without you supplying coordinates.',
    references: [REF_MAPS]
  },
  {
    domain: CONCEPTS, difficulty: 1, type: QType.SINGLE,
    stem: 'The Analytics pane is distinct from the Data pane because it:',
    options: opts4(
      'Lists data fields',
      'Provides analytic objects (reference/trend lines, forecasts, box plots, clusters) to drag onto the view',
      'Manages connections',
      'Schedules refreshes'
    ),
    correct: ['b'],
    explanation: 'The Data pane lists fields; the Analytics pane offers model/summary objects (reference lines, trends, forecasts, distributions, clusters) you drag onto a view for analysis.',
    references: [REF_REFLINE]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'Putting a field on Detail increases the number of marks without adding a colour or size encoding or headers.',
    options: opts4('True', 'False', 'Detail always adds colour', 'Detail removes marks'),
    correct: ['a'],
    explanation: 'True. The Detail target raises granularity (more marks for each member combination) but does not add a visual encoding (colour/size) or create row/column headers.',
    references: [REF_MARKS]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'A parameter differs from a filter because a parameter:',
    options: opts4(
      'Always filters the data automatically',
      'Is a single user-controlled value not tied to the data; it only affects the view when referenced by a calculation, filter, set, or reference line',
      'Cannot be changed by users',
      'Stores multiple data rows'
    ),
    correct: ['b'],
    explanation: 'A parameter is just a single dynamic value; it has no effect until a calculation/filter/set/reference line references it. A filter directly restricts the data shown.',
    references: [REF_PARAM]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which statement about discrete vs continuous is correct?',
    options: opts4(
      'Discrete = green axis; continuous = blue headers',
      'Discrete (blue) = distinct headers; continuous (green) = an axis with a range',
      'Both create axes',
      'Both create headers'
    ),
    correct: ['b'],
    explanation: 'Discrete fields (blue) create headers from distinct values; continuous fields (green) create an axis spanning a range. Colour cues this behavior on the pills.',
    references: [REF_DISCCONT]
  },
  {
    domain: CONCEPTS, difficulty: 1, type: QType.SINGLE,
    stem: 'The Tableau Desktop "Show Me" panel will disable chart types when:',
    options: opts4(
      'The workbook is unsaved',
      'The selected fields do not meet that chart type\'s field requirements',
      'You are offline',
      'The data is an extract'
    ),
    correct: ['b'],
    explanation: 'Show Me enables only chart types whose field prerequisites are met by the current selection; unmet requirements grey out the option with an explanatory tooltip.',
    references: [REF_SHOWME]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'Why are extracts (.hyper) often recommended for a Desktop Specialist building dashboards on large data?',
    options: opts4(
      'They always show real-time data',
      'They leverage the fast in-memory Hyper engine, can be filtered/aggregated for size, and enable offline use, improving performance',
      'They prevent sharing',
      'They convert the workbook to PDF'
    ),
    correct: ['b'],
    explanation: 'Extracts use the high-performance Hyper engine and can be trimmed via filters/aggregation, giving faster dashboards and offline capability versus heavy live queries (at the cost of not being real-time).',
    references: [REF_EXTRACT, REF_PERFORMANCE]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'The fundamental building blocks you drag from the Data pane to create a viz are:',
    options: opts4(
      'Only measures',
      'Fields (dimensions and measures), plus sets and parameters, dropped onto shelves and the Marks card',
      'Only dashboards',
      'Only extracts'
    ),
    correct: ['b'],
    explanation: 'Visualizations are built by dragging fields (dimensions/measures) and objects (sets, parameters) from the Data pane onto Rows, Columns, Filters, Pages, and the Marks card encodings.',
    references: [REF_INTERFACE]
  }
];

const TABLEAU_DS_DOMAINS = [
  { name: CONNECT, weight: 25 },
  { name: EXPLORE, weight: 35 },
  { name: SHARE, weight: 20 },
  { name: CONCEPTS, weight: 20 }
];

const TABLEAU_DS_EXAMS: { slug: string; code: string; titleSuffix: string; descriptionSuffix: string; questions: Q[] }[] = [
  {
    slug: 'tableau-desktop-specialist-p1',
    code: 'TDS-P1',
    titleSuffix: 'Practice Exam 1',
    descriptionSuffix: 'Practice exam 1 of 3 — full 60-minute, 65-question, blueprint-weighted set covering connecting & preparing data, exploring & analyzing data, sharing insights, and core Tableau concepts.',
    questions: P1
  },
  {
    slug: 'tableau-desktop-specialist-p2',
    code: 'TDS-P2',
    titleSuffix: 'Practice Exam 2',
    descriptionSuffix: 'Practice exam 2 of 3 — a second 60-minute, 65-question, blueprint-weighted set.',
    questions: P2
  },
  {
    slug: 'tableau-desktop-specialist-p3',
    code: 'TDS-P3',
    titleSuffix: 'Practice Exam 3',
    descriptionSuffix: 'Practice exam 3 of 3 — a third 60-minute, 65-question, blueprint-weighted set.',
    questions: P3
  }
];

const TABLEAU_DS_BUNDLE = {
  slug: 'tableau-desktop-specialist',
  title: 'Tableau Desktop Specialist',
  description: 'All 3 Tableau Desktop Specialist practice exams in one bundle — covering connecting to and preparing data, exploring and analyzing data, sharing insights, and understanding Tableau concepts, aligned to the Tableau Desktop Specialist exam domains.',
  price: 2000, // USD 20 — PRACTICE tier
  priceVoucher: 10000 // USD 100 — VOUCHER tier
};

type SeedResult = {
  vendor: 'created' | 'updated';
  exams: { slug: string; questionCount: number; teaserCount: number }[];
  bundle: 'created' | 'updated';
};

/**
 * Idempotent seed for the Tableau Desktop Specialist bundle. Safe to call
 * repeatedly — vendor / exam / bundle rows are upserted, and questions
 * tagged `generatedBy: 'manual:tableau-ds-seed'` are deleted and
 * re-created.
 *
 * Pass an existing PrismaClient (lifecycle managed by caller).
 */
export async function seedTableauDs(db: PrismaClient): Promise<SeedResult> {
  const existingVendor = await db.vendor.findUnique({ where: { slug: 'tableau' } });
  await db.vendor.upsert({
    where: { slug: 'tableau' },
    update: { name: 'Tableau', description: 'Tableau certifications — data visualization, analytics, and the Tableau Desktop Specialist credential.' },
    create: { slug: 'tableau', name: 'Tableau', description: 'Tableau certifications — data visualization, analytics, and the Tableau Desktop Specialist credential.' }
  });
  const vendor = await db.vendor.findUniqueOrThrow({ where: { slug: 'tableau' } });

  const examResults: SeedResult['exams'] = [];
  const examIds: Record<string, string> = {};

  for (const e of TABLEAU_DS_EXAMS) {
    const title = `Tableau Desktop Specialist — ${e.titleSuffix}`;
    const description = `${e.descriptionSuffix} Aligned to the Tableau Desktop Specialist exam domains.`;
    const examData = {
      title,
      code: e.code,
      description,
      level: 'Foundational',
      durationMinutes: 60,
      passingScore: 70,
      questionCount: e.questions.length,
      domains: TABLEAU_DS_DOMAINS,
      published: true
    };
    const exam = await db.exam.upsert({
      where: { slug: e.slug },
      update: examData,
      create: { ...examData, slug: e.slug, vendorId: vendor.id }
    });
    examIds[e.slug] = exam.id;

    await db.question.deleteMany({ where: { examId: exam.id, generatedBy: 'manual:tableau-ds-seed' } });
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
          generatedBy: 'manual:tableau-ds-seed',
          isTeaser: !!q.isTeaser
        }
      });
      if (q.isTeaser) teaserCount++;
    }
    examResults.push({ slug: e.slug, questionCount: e.questions.length, teaserCount });
  }

  const existingBundle = await db.bundle.findUnique({ where: { slug: TABLEAU_DS_BUNDLE.slug } });
  const bundle = await db.bundle.upsert({
    where: { slug: TABLEAU_DS_BUNDLE.slug },
    update: {
      title: TABLEAU_DS_BUNDLE.title,
      description: TABLEAU_DS_BUNDLE.description,
      price: TABLEAU_DS_BUNDLE.price,
      priceVoucher: TABLEAU_DS_BUNDLE.priceVoucher,
      published: true
    },
    create: {
      slug: TABLEAU_DS_BUNDLE.slug,
      title: TABLEAU_DS_BUNDLE.title,
      description: TABLEAU_DS_BUNDLE.description,
      price: TABLEAU_DS_BUNDLE.price,
      priceVoucher: TABLEAU_DS_BUNDLE.priceVoucher,
      published: true
    }
  });

  // Replace bundle items deterministically: drop existing, recreate.
  await db.bundleItem.deleteMany({ where: { bundleId: bundle.id } });
  const items = [
    { examSlug: 'tableau-desktop-specialist-p1', tier: 'PRACTICE' as const, position: 1 },
    { examSlug: 'tableau-desktop-specialist-p2', tier: 'PRACTICE' as const, position: 2 },
    { examSlug: 'tableau-desktop-specialist-p3', tier: 'PRACTICE' as const, position: 3 },
    { examSlug: 'tableau-desktop-specialist-p1', tier: 'VOUCHER' as const, position: 4 }
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
