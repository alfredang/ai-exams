/**
 * Elastic Certified Engineer bundle seed — vendor, three practice-exam
 * variants, bundle, and 195 blueprint-aligned questions. Idempotent:
 * replaces rows tagged `generatedBy: 'manual:elastic-seed'` and upserts
 * catalog rows.
 *
 * Exported as `seedElastic(db)` so the same code path is reachable from
 * the standalone CLI shim (`prisma/seeds/elastic.ts`) and the protected
 * admin API (`/api/admin/seed-elastic`) — letting us bootstrap the
 * production database without redeploying.
 *
 * Question content is authored against the public Elasticsearch 8.x
 * reference documentation and the Elastic Certified Engineer exam
 * objective areas:
 *   - Installation and Configuration            — 20% (4)
 *   - Indexing Data                             — 20% (4)
 *   - Queries                                   — 20% (4)
 *   - Mappings and Text Analysis                — 20% (4)
 *   - Cluster Administration                    — 10% (2)
 *   - Data Processing and Aggregations          — 10% (2)
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

const INSTALL = 'Installation and Configuration';
const INDEX = 'Indexing Data';
const QUERIES = 'Queries';
const MAPPING = 'Mappings and Text Analysis';
const CLUSTER = 'Cluster Administration';
const DATAPROC = 'Data Processing and Aggregations';

const REF_CONFIG = { label: 'Elasticsearch Reference — Configuring Elasticsearch', url: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/settings.html' };
const REF_NODE = { label: 'Elasticsearch Reference — Node roles', url: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/modules-node.html' };
const REF_DISCOVERY = { label: 'Elasticsearch Reference — Discovery and cluster formation', url: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/modules-discovery.html' };
const REF_BOOTSTRAP = { label: 'Elasticsearch Reference — Bootstrap a cluster', url: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/modules-discovery-bootstrap-cluster.html' };
const REF_SECURITY = { label: 'Elasticsearch Reference — Configure security', url: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/configuring-stack-security.html' };
const REF_INDEX_API = { label: 'Elasticsearch Reference — Create index API', url: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-create-index.html' };
const REF_DOC_API = { label: 'Elasticsearch Reference — Index API', url: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-index_.html' };
const REF_BULK = { label: 'Elasticsearch Reference — Bulk API', url: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-bulk.html' };
const REF_REINDEX = { label: 'Elasticsearch Reference — Reindex API', url: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-reindex.html' };
const REF_UBQ = { label: 'Elasticsearch Reference — Update By Query API', url: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-update-by-query.html' };
const REF_ALIAS = { label: 'Elasticsearch Reference — Aliases', url: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/aliases.html' };
const REF_ILM = { label: 'Elasticsearch Reference — Index lifecycle management', url: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/index-lifecycle-management.html' };
const REF_SNAPSHOT = { label: 'Elasticsearch Reference — Snapshot and restore', url: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/snapshot-restore.html' };
const REF_QDSL = { label: 'Elasticsearch Reference — Query DSL', url: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl.html' };
const REF_BOOL = { label: 'Elasticsearch Reference — Boolean query', url: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-bool-query.html' };
const REF_FULLTEXT = { label: 'Elasticsearch Reference — Full text queries', url: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/full-text-queries.html' };
const REF_TERM_QUERY = { label: 'Elasticsearch Reference — Term-level queries', url: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/term-level-queries.html' };
const REF_FILTER_CTX = { label: 'Elasticsearch Reference — Query and filter context', url: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-filter-context.html' };
const REF_MAPPING = { label: 'Elasticsearch Reference — Mapping', url: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/mapping.html' };
const REF_FIELD_TYPES = { label: 'Elasticsearch Reference — Field data types', url: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/mapping-types.html' };
const REF_MULTIFIELDS = { label: 'Elasticsearch Reference — multi-fields', url: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/multi-fields.html' };
const REF_RUNTIME = { label: 'Elasticsearch Reference — Runtime fields', url: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/runtime.html' };
const REF_ANALYSIS = { label: 'Elasticsearch Reference — Text analysis', url: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/analysis.html' };
const REF_ANALYZE = { label: 'Elasticsearch Reference — Analyze API', url: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-analyze.html' };
const REF_CUSTOM_ANALYZER = { label: 'Elasticsearch Reference — Create a custom analyzer', url: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/analysis-custom-analyzer.html' };
const REF_AGGS = { label: 'Elasticsearch Reference — Aggregations', url: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations.html' };
const REF_PIPELINE_AGG = { label: 'Elasticsearch Reference — Pipeline aggregations', url: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-pipeline.html' };
const REF_INGEST = { label: 'Elasticsearch Reference — Ingest pipelines', url: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/ingest.html' };
const REF_PROCESSORS = { label: 'Elasticsearch Reference — Ingest processor reference', url: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/processors.html' };
const REF_SEARCH_TEMPLATE = { label: 'Elasticsearch Reference — Search templates', url: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-template.html' };
const REF_CCS = { label: 'Elasticsearch Reference — Cross-cluster search', url: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/modules-cross-cluster-search.html' };
const REF_HEALTH = { label: 'Elasticsearch Reference — Cluster health API', url: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/cluster-health.html' };
const REF_ALLOCATION = { label: 'Elasticsearch Reference — Cluster allocation explain API', url: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/cluster-allocation-explain.html' };

// Helper to build 4-option SINGLE questions with id 'a','b','c','d'.
const opts4 = (a: string, b: string, c: string, d: string): Opt[] => [
  { id: 'a', text: a }, { id: 'b', text: b }, { id: 'c', text: c }, { id: 'd', text: d }
];

// ───────────────────── Practice Exam 1 ─────────────────────
const P1: Q[] = [
  // ── Installation and Configuration (4) ──
  {
    domain: INSTALL, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which file is the primary YAML configuration file for an Elasticsearch node, where settings such as `cluster.name` and `node.name` are defined?',
    options: opts4(
      'elasticsearch.properties',
      'elasticsearch.yml',
      'jvm.options',
      'log4j2.properties'
    ),
    correct: ['b'],
    explanation: '`elasticsearch.yml` in the config directory holds cluster/node/network settings. `jvm.options` tunes the JVM heap, `log4j2.properties` configures logging, and `elasticsearch.properties` does not exist.',
    references: [REF_CONFIG]
  },
  {
    domain: INSTALL, difficulty: 3, type: QType.SINGLE,
    stem: 'In `elasticsearch.yml`, which setting explicitly assigns a node ONLY the master-eligible role and removes the data role?',
    options: opts4(
      'node.master: true',
      'node.roles: [ master ]',
      'node.type: master-only',
      'cluster.master.only: true'
    ),
    correct: ['b'],
    explanation: 'Since Elasticsearch 7.9 node roles are declared with the `node.roles` list. `node.roles: [ master ]` makes the node master-eligible and not a data node. The legacy `node.master: true` boolean form is deprecated and does not by itself drop the data role.',
    references: [REF_NODE]
  },
  {
    domain: INSTALL, difficulty: 3, type: QType.SINGLE,
    stem: 'When forming a brand-new multi-node cluster for the first time, which setting names the initial set of master-eligible nodes used to bootstrap the cluster?',
    options: opts4(
      'discovery.seed_hosts',
      'cluster.initial_master_nodes',
      'discovery.zen.minimum_master_nodes',
      'gateway.recover_after_nodes'
    ),
    correct: ['b'],
    explanation: '`cluster.initial_master_nodes` performs the one-time cluster bootstrap and must be set only on the very first cluster formation. `discovery.seed_hosts` lists addresses for node discovery. `minimum_master_nodes` was removed in 7.0. `gateway.recover_after_nodes` controls recovery, not bootstrap.',
    references: [REF_BOOTSTRAP]
  },
  {
    domain: INSTALL, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about node discovery and cluster formation in Elasticsearch 8.x.',
    options: opts4(
      '`discovery.seed_hosts` provides the list of addresses a node probes to find other nodes.',
      '`cluster.initial_master_nodes` should be removed (or left unset) after the cluster has formed for the first time.',
      'Every node must list every other node in `discovery.seed_hosts` for the cluster to function.',
      'Only master-eligible nodes participate in master elections.'
    ),
    correct: ['a', 'b', 'd'],
    explanation: '`discovery.seed_hosts` only needs to reference enough master-eligible nodes for discovery to converge — not every node. `cluster.initial_master_nodes` is a one-time bootstrap setting. Only master-eligible nodes vote in elections.',
    references: [REF_DISCOVERY, REF_NODE]
  },
  {
    domain: INDEX, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which request creates an index named `products` with 3 primary shards and 1 replica?',
    options: opts4(
      'PUT products with body {"settings":{"number_of_shards":3,"number_of_replicas":1}}',
      'POST products/_create {"shards":3,"replicas":1}',
      'PUT products/_settings {"index.shards":3}',
      'POST _index/products?shards=3&replicas=1'
    ),
    correct: ['a'],
    explanation: 'A `PUT /products` with `settings.number_of_shards` and `settings.number_of_replicas` is the Create index API. `number_of_shards` is fixed at creation time; `number_of_replicas` can be changed later via `_settings`.',
    references: [REF_INDEX_API]
  },
  {
    domain: INDEX, difficulty: 3, type: QType.SINGLE,
    stem: 'Using the Index API, `PUT my-index/_doc/1` versus `POST my-index/_doc` differ in that:',
    options: opts4(
      'PUT requires an explicit document ID; POST auto-generates an ID if none is given.',
      'POST requires an explicit document ID; PUT auto-generates one.',
      'PUT only updates, POST only creates.',
      'There is no difference; both require an ID.'
    ),
    correct: ['a'],
    explanation: '`PUT /index/_doc/<id>` indexes with a caller-supplied ID (create or overwrite). `POST /index/_doc` without an ID lets Elasticsearch auto-generate one. Use `_create` to fail if the ID already exists.',
    references: [REF_DOC_API]
  },
  {
    domain: INDEX, difficulty: 3, type: QType.SINGLE,
    stem: 'In a `_bulk` request, what is required between each action/metadata line and its optional source document?',
    options: opts4(
      'A JSON array wrapping all operations',
      'Each line must be a complete JSON object/newline-delimited, and the body must end with a newline',
      'A comma separating every operation',
      'All operations must target the same document ID'
    ),
    correct: ['b'],
    explanation: 'The Bulk API uses newline-delimited JSON (NDJSON): an action line followed (for index/create/update) by a source line, each on its own line, with a trailing newline. It is NOT a JSON array and operations are independent.',
    references: [REF_BULK]
  },
  {
    domain: INDEX, difficulty: 3, type: QType.SINGLE,
    stem: 'You must copy all documents from `orders-2023` into a new index `orders-archive` that has a different shard count. Which API is designed for this?',
    options: opts4(
      'POST _reindex with source orders-2023 and dest orders-archive',
      'POST orders-archive/_clone',
      'PUT orders-archive/_settings with number_of_shards',
      'POST orders-2023/_split'
    ),
    correct: ['a'],
    explanation: 'The `_reindex` API copies documents from a source to a destination index and is the standard way to re-shard or transform data. `_clone` requires an identical shard count and a read-only source; `_split` only multiplies shards.',
    references: [REF_REINDEX]
  },
  {
    domain: QUERIES, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which query analyzes the input text and is the standard choice for full-text search on an analyzed `text` field?',
    options: opts4(
      'term',
      'match',
      'exists',
      'ids'
    ),
    correct: ['b'],
    explanation: 'The `match` query runs the search text through the field analyzer, making it the canonical full-text query. `term` does NOT analyze input and is for exact tokens (keyword/numeric). `exists` and `ids` are structural.',
    references: [REF_FULLTEXT]
  },
  {
    domain: QUERIES, difficulty: 3, type: QType.SINGLE,
    stem: 'In a `bool` query, which clause contributes to the relevance score AND is optional (it boosts matching docs but does not exclude non-matching ones when other clauses match)?',
    options: opts4(
      'must',
      'filter',
      'should',
      'must_not'
    ),
    correct: ['c'],
    explanation: '`should` clauses are optional and contribute to `_score`. `must` is required and scored; `filter` is required but NOT scored (filter context); `must_not` excludes and is not scored.',
    references: [REF_BOOL]
  },
  {
    domain: QUERIES, difficulty: 3, type: QType.SINGLE,
    stem: 'You need to return documents where `status` is exactly `"active"` without affecting relevance scoring, for maximum cache reuse. The best approach is:',
    options: opts4(
      'A `match` query in must',
      'A `term` query in the bool `filter` clause',
      'A `match_phrase` query in should',
      'A `wildcard` query in must'
    ),
    correct: ['b'],
    explanation: 'Exact-value matching belongs in a `term` query, and placing it in `filter` (filter context) skips scoring and enables filter caching. `match`/`match_phrase` analyze text and run in query context.',
    references: [REF_FILTER_CTX, REF_TERM_QUERY]
  },
  {
    domain: QUERIES, difficulty: 3, type: QType.SINGLE,
    stem: 'Which query searches the same text across multiple fields (e.g. `title` and `body`) in one clause?',
    options: opts4(
      'multi_match',
      'match_all',
      'terms',
      'dis_max only with manual per-field match'
    ),
    correct: ['a'],
    explanation: '`multi_match` runs a `match` against several fields with configurable type (best_fields, most_fields, cross_fields, phrase). `match_all` matches everything; `terms` is exact multi-value term matching.',
    references: [REF_FULLTEXT]
  },
  {
    domain: MAPPING, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which statement about `text` versus `keyword` field types is correct?',
    options: opts4(
      'text is analyzed/tokenized for full-text search; keyword is stored as a single exact token for filtering, sorting and aggregations.',
      'keyword is analyzed for full-text search; text is not analyzed.',
      'Both are analyzed identically.',
      'text supports aggregations by default; keyword does not.'
    ),
    correct: ['a'],
    explanation: 'A `text` field is passed through an analyzer and tokenized for relevance search but is not efficient for aggregations/sorting (fielddata disabled by default). A `keyword` field is indexed verbatim and is used for exact match, sort, and aggregations.',
    references: [REF_FIELD_TYPES]
  },
  {
    domain: MAPPING, difficulty: 3, type: QType.SINGLE,
    stem: 'You want a single source field indexed both as analyzed `text` (for search) and as `keyword` (for aggregations). The idiomatic mapping uses:',
    options: opts4(
      'Two separate top-level fields you must populate yourself',
      'A multi-field: a `text` field with a `fields.keyword` sub-field of type keyword',
      'A `runtime` field of type keyword',
      'The `copy_to` parameter pointing to itself'
    ),
    correct: ['b'],
    explanation: 'Multi-fields index the same value multiple ways. The common pattern is a `text` field with `fields: { keyword: { type: "keyword", ignore_above: 256 } }`. Runtime fields are computed at query time, not indexed for aggregations efficiently.',
    references: [REF_MULTIFIELDS]
  },
  {
    domain: MAPPING, difficulty: 3, type: QType.SINGLE,
    stem: 'With dynamic mapping enabled (the default), what happens when you index a document containing a previously unseen field `price` with a JSON number?',
    options: opts4(
      'The document is rejected until you add an explicit mapping.',
      'Elasticsearch dynamically adds a mapping for `price` (e.g. as long or float) and indexes the document.',
      'The field is stored but never indexed or searchable.',
      'The whole index becomes read-only.'
    ),
    correct: ['b'],
    explanation: 'Default dynamic mapping detects the JSON type and creates a field mapping automatically. Setting `dynamic: strict` would reject unknown fields; `dynamic: false` would store but not index them.',
    references: [REF_MAPPING]
  },
  {
    domain: MAPPING, difficulty: 3, type: QType.SINGLE,
    stem: 'A `runtime` field defined in the mapping is best described as:',
    options: opts4(
      'A field evaluated at query time via a script (or from source), not indexed at ingest, trading query speed for schema flexibility.',
      'A field that is indexed faster than normal fields.',
      'A field that can only be a date.',
      'An alias to another index.'
    ),
    correct: ['a'],
    explanation: 'Runtime fields are computed when the query runs (or at index time if backed by a script-on-index), enabling schema-on-read without reindexing — at the cost of per-query computation versus pre-indexed fields.',
    references: [REF_RUNTIME]
  },
  {
    domain: CLUSTER, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A cluster health status of `yellow` means:',
    options: opts4(
      'All primary AND replica shards are allocated.',
      'All primary shards are allocated but at least one replica shard is unallocated.',
      'At least one primary shard is unallocated (data missing).',
      'The cluster is read-only.'
    ),
    correct: ['b'],
    explanation: 'Green = all primaries and replicas allocated. Yellow = all primaries allocated but some replicas unassigned (still fully searchable, reduced redundancy). Red = at least one primary unassigned.',
    references: [REF_HEALTH]
  },
  {
    domain: CLUSTER, difficulty: 3, type: QType.SINGLE,
    stem: 'A replica shard is stuck unassigned. Which API explains WHY the allocation decision was made?',
    options: opts4(
      'GET _cluster/allocation/explain',
      'GET _cat/shards?why',
      'POST _cluster/reroute?explain_only=true',
      'GET _nodes/stats/allocation'
    ),
    correct: ['a'],
    explanation: 'The cluster allocation explain API returns the deciders and reason a shard is or is not allocated. `_cat/shards` shows state but not the decision reasoning.',
    references: [REF_ALLOCATION]
  },
  {
    domain: DATAPROC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which aggregation type groups documents into buckets, such as one bucket per distinct value of a keyword field?',
    options: opts4(
      'metric aggregation (e.g. avg)',
      'bucket aggregation (e.g. terms)',
      'pipeline aggregation (e.g. derivative)',
      'matrix aggregation only'
    ),
    correct: ['b'],
    explanation: 'Bucket aggregations like `terms`, `date_histogram`, and `range` group documents. Metric aggregations compute values (avg, sum) over documents; pipeline aggregations operate on the output of other aggregations.',
    references: [REF_AGGS]
  },
  {
    domain: DATAPROC, difficulty: 3, type: QType.SINGLE,
    stem: 'An ingest pipeline is used to:',
    options: opts4(
      'Transform/enrich documents with processors BEFORE they are indexed.',
      'Replicate shards across nodes.',
      'Stream query results to a client.',
      'Schedule snapshots.'
    ),
    correct: ['a'],
    explanation: 'Ingest pipelines run on ingest-role nodes and apply processors (set, rename, grok, geoip, etc.) to documents before indexing. They do not handle replication, search streaming, or snapshots.',
    references: [REF_INGEST]
  },
  {
    domain: INSTALL, difficulty: 2, type: QType.SINGLE,
    stem: 'Where is the JVM heap size for an Elasticsearch node configured?',
    options: opts4(
      'In `elasticsearch.yml` under `index.heap`',
      'In `jvm.options` (or a file in `jvm.options.d/`) via `-Xms`/`-Xmx`',
      'In `log4j2.properties`',
      'Via the `_cluster/settings` API'
    ),
    correct: ['b'],
    explanation: 'Heap is a JVM concern set in `jvm.options` (or drop-in files in `jvm.options.d/`) using `-Xms`/`-Xmx`. It is not an Elasticsearch YAML or dynamic cluster setting; `log4j2.properties` only configures logging.',
    references: [REF_CONFIG]
  },
  {
    domain: INSTALL, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which setting provides the list of master-eligible node addresses that a starting node probes to discover the cluster?',
    options: opts4(
      'discovery.seed_hosts',
      'cluster.initial_master_nodes',
      'network.publish_host',
      'transport.profiles.default.port'
    ),
    correct: ['a'],
    explanation: '`discovery.seed_hosts` lists addresses used for node discovery (the seed hosts providers). `cluster.initial_master_nodes` is a one-time bootstrap-only setting; `network.publish_host` and transport profiles relate to binding/transport, not discovery seeding.',
    references: [REF_DISCOVERY]
  },
  {
    domain: INSTALL, difficulty: 3, type: QType.SINGLE,
    stem: 'Which `node.roles` value makes a node store warm-tier shards for ILM data-tier allocation?',
    options: opts4(
      'node.roles: [ data_warm ]',
      'node.roles: [ warm ]',
      'node.roles: [ data, tier_warm ]',
      'node.tier: warm'
    ),
    correct: ['a'],
    explanation: 'Data tiers use dedicated roles `data_hot`, `data_warm`, `data_cold`, `data_frozen` (and generic `data`/`data_content`). The exact role is `data_warm`; `warm`, `tier_warm`, and `node.tier` are not valid role keywords.',
    references: [REF_NODE]
  },
  {
    domain: INSTALL, difficulty: 2, type: QType.SINGLE,
    stem: 'Which setting names the cluster so that nodes only join the intended cluster?',
    options: opts4(
      'cluster.name',
      'node.name',
      'cluster.uuid',
      'discovery.cluster'
    ),
    correct: ['a'],
    explanation: '`cluster.name` defines the logical cluster a node belongs to — nodes with the same `cluster.name` form one cluster. `node.name` identifies an individual node; `cluster.uuid` is generated automatically and not user-set.',
    references: [REF_CONFIG]
  },
  {
    domain: INSTALL, difficulty: 3, type: QType.SINGLE,
    stem: 'How are secure/sensitive settings (such as the S3 repository access key) stored for an Elasticsearch node?',
    options: opts4(
      'As plaintext in elasticsearch.yml',
      'In the Elasticsearch keystore via the elasticsearch-keystore tool',
      'In jvm.options',
      'As environment variables only'
    ),
    correct: ['b'],
    explanation: 'Sensitive settings belong in the encrypted Elasticsearch keystore, managed with `bin/elasticsearch-keystore add ...`. Putting credentials plaintext in `elasticsearch.yml` is insecure; `jvm.options` is JVM tuning only.',
    references: [REF_SECURITY]
  },
  {
    domain: INSTALL, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'True or False: `cluster.initial_master_nodes` should be left configured permanently on every node so the cluster can re-bootstrap after a full restart.',
    options: [
      { id: 'a', text: 'True' },
      { id: 'b', text: 'False' }
    ],
    correct: ['b'],
    explanation: 'False. `cluster.initial_master_nodes` is a one-time bootstrap setting used only for the very first cluster formation; leaving it set can cause split-brain on later restarts. After formation it should be removed.',
    references: [REF_BOOTSTRAP]
  },
  {
    domain: INSTALL, difficulty: 3, type: QType.SINGLE,
    stem: 'Which command-line tool generates an enrollment token so Kibana can connect securely to an 8.x cluster?',
    options: opts4(
      'bin/elasticsearch-create-enrollment-token -s kibana',
      'bin/elasticsearch-setup-passwords kibana',
      'bin/elasticsearch-certutil kibana',
      'bin/kibana-enroll'
    ),
    correct: ['a'],
    explanation: '`elasticsearch-create-enrollment-token -s kibana` mints a Kibana enrollment token containing the CA fingerprint and connection info. `elasticsearch-certutil` generates certs; `setup-passwords` was the pre-8.x reset tool.',
    references: [REF_SECURITY]
  },
  {
    domain: INSTALL, difficulty: 2, type: QType.SINGLE,
    stem: 'Which setting controls the HTTP port Elasticsearch listens on for the REST API?',
    options: opts4(
      'http.port',
      'transport.port',
      'network.bind_port',
      'rest.api.port'
    ),
    correct: ['a'],
    explanation: '`http.port` (default 9200) is the REST/HTTP layer port. `transport.port` (default 9300) is for inter-node communication. `network.bind_port` and `rest.api.port` are not real settings.',
    references: [REF_CONFIG]
  },
  {
    domain: INSTALL, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL recommended production bootstrap/OS settings for an Elasticsearch node.',
    options: opts4(
      'Increase the max file descriptors (e.g. 65535) for the elasticsearch user.',
      'Increase `vm.max_map_count` to at least 262144.',
      'Disable swap or enable `bootstrap.memory_lock: true`.',
      'Run Elasticsearch as the root user for maximum permissions.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'High file descriptor limits, `vm.max_map_count >= 262144`, and disabling swap (or memory-locking) are documented production prerequisites. Running as root is explicitly discouraged for security.',
    references: [REF_CONFIG]
  },
  {
    domain: INDEX, difficulty: 2, type: QType.SINGLE,
    stem: 'Which API permanently deletes a single document by id from an index?',
    options: opts4(
      'DELETE <index>/_doc/<id>',
      'POST <index>/_remove/<id>',
      'DELETE <index>/_settings/<id>',
      'POST <index>/_delete_doc'
    ),
    correct: ['a'],
    explanation: '`DELETE /<index>/_doc/<id>` removes a document by id. To delete by query you use `_delete_by_query`. The other forms are not valid Elasticsearch endpoints.',
    references: [REF_DOC_API]
  },
  {
    domain: INDEX, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which API deletes all documents matching a query without deleting the index itself?',
    options: opts4(
      'POST <index>/_delete_by_query',
      'DELETE <index>',
      'POST <index>/_truncate',
      'PUT <index>/_settings {"blocks.write": true}'
    ),
    correct: ['a'],
    explanation: '`_delete_by_query` removes documents matching a Query DSL query while keeping the index. `DELETE <index>` drops the whole index; there is no `_truncate` API; a write block only prevents new writes.',
    references: [REF_UBQ]
  },
  {
    domain: INDEX, difficulty: 3, type: QType.SINGLE,
    stem: 'You index `PUT books/_doc/1` twice with different bodies. What is the resulting `_version` and document state?',
    options: opts4(
      'Two documents with id 1 exist',
      'The document is fully replaced and `_version` increments to 2',
      'The second request is rejected as a duplicate',
      'Only changed fields are merged (partial update)'
    ),
    correct: ['b'],
    explanation: 'Indexing with the same id replaces the whole document and increments `_version`. Ids are unique within an index. Partial merges require the `_update` API; `_create` would reject the second write.',
    references: [REF_DOC_API]
  },
  {
    domain: INDEX, difficulty: 3, type: QType.SINGLE,
    stem: 'Which endpoint applies a partial update (e.g. increment a counter via script) to one existing document?',
    options: opts4(
      'POST <index>/_update/<id>',
      'PUT <index>/_doc/<id>',
      'POST <index>/_doc',
      'POST <index>/_bulk'
    ),
    correct: ['a'],
    explanation: '`POST /<index>/_update/<id>` performs a partial update or scripted update of an existing document. `PUT /_doc/<id>` replaces the whole document; plain `POST /_doc` creates a new auto-id document.',
    references: [REF_DOC_API]
  },
  {
    domain: INDEX, difficulty: 3, type: QType.SINGLE,
    stem: 'You want the index call to return only AFTER the change is searchable. Which refresh parameter do you use?',
    options: opts4(
      '?refresh=wait_for',
      '?refresh=never',
      '?flush=true',
      '?searchable=immediate'
    ),
    correct: ['a'],
    explanation: '`?refresh=wait_for` blocks the request until a refresh makes the change visible without forcing an immediate refresh. `?refresh=true` forces a refresh now; `flush` persists the translog and is unrelated to visibility.',
    references: [REF_DOC_API]
  },
  {
    domain: INDEX, difficulty: 3, type: QType.SINGLE,
    stem: 'To halve the primary shard count of a read-only index from 6 to 3, which API is appropriate?',
    options: opts4(
      'POST <index>/_shrink/<target>',
      'POST <index>/_split/<target>',
      'POST <index>/_clone/<target>',
      'POST _reindex with fewer replicas'
    ),
    correct: ['a'],
    explanation: 'The `_shrink` API reduces the number of primary shards (target must divide the source count); the source must be read-only and its shards co-located. `_split` only increases shards; `_clone` keeps the same count.',
    references: [REF_REINDEX]
  },
  {
    domain: INDEX, difficulty: 3, type: QType.SINGLE,
    stem: 'For optimistic concurrency control on a document update, which two values does a client supply to detect conflicting writes?',
    options: opts4(
      'if_seq_no and if_primary_term',
      '_version and _id only',
      'op_type and routing',
      'wait_for_active_shards and timeout'
    ),
    correct: ['a'],
    explanation: 'Elasticsearch uses `if_seq_no` + `if_primary_term` for optimistic concurrency: the write only applies if the document still has that sequence number/primary term, otherwise a 409 conflict is returned.',
    references: [REF_DOC_API]
  },
  {
    domain: INDEX, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A data stream in Elasticsearch is primarily designed for:',
    options: opts4(
      'Append-only time-series/log data automatically backed by rolling hidden indices',
      'Storing a single mutable document',
      'Replacing aliases for random-access updates',
      'Real-time query result streaming'
    ),
    correct: ['a'],
    explanation: 'A data stream abstracts append-only time-series data over auto-created backing indices managed by ILM rollover. Documents are not updated in place (only appended), and it is not a query-streaming mechanism.',
    references: [REF_ILM]
  },
  {
    domain: INDEX, difficulty: 3, type: QType.SINGLE,
    stem: 'Which object must exist so a new data stream gets correct mappings and settings on every backing index?',
    options: opts4(
      'An index template (composable) with a `data_stream` definition',
      'A search template',
      'An ingest pipeline alias',
      'A snapshot policy'
    ),
    correct: ['a'],
    explanation: 'A composable index template containing a `data_stream` block (plus mappings/settings via component templates) governs each rolled-over backing index. Search templates and snapshot policies are unrelated to backing-index mappings.',
    references: [REF_INDEX_API]
  },
  {
    domain: QUERIES, difficulty: 2, type: QType.SINGLE,
    stem: 'Which query returns every document in the searched index?',
    options: opts4(
      'match_all',
      'match_none',
      'exists',
      'term with empty value'
    ),
    correct: ['a'],
    explanation: '`match_all` matches all documents (with `_score` 1.0 by default). `match_none` matches nothing; `exists` only matches docs that have a given field indexed.',
    references: [REF_QDSL]
  },
  {
    domain: QUERIES, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which query matches documents that contain ANY value for the field `email` (the field is present and not null)?',
    options: opts4(
      'exists query on "email"',
      'term query on "email"',
      'missing query on "email"',
      'match query on "email"'
    ),
    correct: ['a'],
    explanation: 'The `exists` query matches documents where the field has at least one non-null indexed value. There is no `missing` query in modern ES (use `must_not` + `exists`); `term`/`match` need an actual value.',
    references: [REF_QDSL]
  },
  {
    domain: QUERIES, difficulty: 3, type: QType.SINGLE,
    stem: 'Which query matches one of several exact values, e.g. `status` is `open`, `pending`, or `closed`?',
    options: opts4(
      'terms query with an array of values',
      'term query repeated three times in must',
      'match query with the values space-separated',
      'range query'
    ),
    correct: ['a'],
    explanation: 'The `terms` query matches if the field equals any value in the supplied array — the idiomatic OR-of-exact-values. Repeated `term` in `must` would require ALL values; `match` analyzes text.',
    references: [REF_TERM_QUERY]
  },
  {
    domain: QUERIES, difficulty: 3, type: QType.SINGLE,
    stem: 'A `prefix` query on a `keyword` field `sku` with value "ABC" matches:',
    options: opts4(
      'Documents whose `sku` term starts with "ABC"',
      'Documents containing "ABC" anywhere in the term',
      'Only the exact term "ABC"',
      'Documents where `sku` ends with "ABC"'
    ),
    correct: ['a'],
    explanation: 'A `prefix` query matches terms beginning with the given characters. Substring/contains needs `wildcard`/`*ABC*`; exact match is `term`; suffix matching is not what `prefix` does.',
    references: [REF_TERM_QUERY]
  },
  {
    domain: QUERIES, difficulty: 3, type: QType.SINGLE,
    stem: 'Which clause in a `bool` query requires the condition to match but contributes NOTHING to `_score` and is cacheable?',
    options: opts4(
      'filter',
      'must',
      'should',
      'boost'
    ),
    correct: ['a'],
    explanation: '`filter` is mandatory like `must` but runs in filter context: no scoring contribution, cacheable. `must` is scored; `should` is optional; `boost` is a parameter, not a clause.',
    references: [REF_BOOL]
  },
  {
    domain: QUERIES, difficulty: 4, type: QType.SINGLE,
    stem: 'In a `bool` query that has `should` clauses but NO `must` or `filter`, what is the default behavior?',
    options: opts4(
      'At least one `should` clause must match (minimum_should_match defaults to 1)',
      'All `should` clauses must match',
      'No documents are returned',
      'Every document matches regardless of should'
    ),
    correct: ['a'],
    explanation: 'When a `bool` query has only `should` clauses, `minimum_should_match` defaults to 1, so at least one should match. If a `must`/`filter` is present, `should` becomes purely score-boosting (min_should_match defaults to 0).',
    references: [REF_BOOL]
  },
  {
    domain: QUERIES, difficulty: 3, type: QType.SINGLE,
    stem: 'To tolerate small typos in a full-text `match` query on a name field, you set:',
    options: opts4(
      'fuzziness (e.g. "AUTO") on the match query',
      'slop on the match query',
      'boost to 2',
      'analyzer to keyword'
    ),
    correct: ['a'],
    explanation: '`fuzziness` (often `"AUTO"`) enables Levenshtein edit-distance matching for typos. `slop` affects phrase term proximity, not spelling; a `keyword` analyzer would disable analysis entirely.',
    references: [REF_FULLTEXT]
  },
  {
    domain: QUERIES, difficulty: 3, type: QType.SINGLE,
    stem: 'Which query type lets you wrap a filter so all matching docs get a fixed constant score?',
    options: opts4(
      'constant_score',
      'dis_max',
      'function_score with no functions',
      'boosting'
    ),
    correct: ['a'],
    explanation: 'The `constant_score` query wraps a filter and assigns every match the same (configurable) score, ignoring TF/IDF. `dis_max` picks the best sub-query score; `boosting` demotes rather than flattens scores.',
    references: [REF_QDSL]
  },
  {
    domain: QUERIES, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'How do you paginate to results 11–20 of a search with the simple from/size approach?',
    options: opts4(
      '"from": 10, "size": 10',
      '"from": 11, "size": 20',
      '"offset": 10, "limit": 10',
      '"page": 2'
    ),
    correct: ['a'],
    explanation: '`from` is a zero-based offset and `size` the page length, so page 2 of size 10 is `from:10, size:10`. Elasticsearch uses `from`/`size`, not `offset`/`limit`/`page`. Deep pagination should use `search_after`.',
    references: [REF_QDSL]
  },
  {
    domain: MAPPING, difficulty: 2, type: QType.SINGLE,
    stem: 'Which API returns the current mapping of an index?',
    options: opts4(
      'GET <index>/_mapping',
      'GET <index>/_settings',
      'GET <index>/_schema',
      'GET <index>/_fields'
    ),
    correct: ['a'],
    explanation: '`GET /<index>/_mapping` returns the field mappings. `_settings` returns index settings (shards, analysis defs); `_schema`/`_fields` are not mapping endpoints (`_field_caps` exists but is different).',
    references: [REF_MAPPING]
  },
  {
    domain: MAPPING, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which numeric type should you choose for a monetary amount needing exact decimal storage and range queries?',
    options: opts4(
      'scaled_float (with a scaling_factor) or a fixed integer of cents',
      'text',
      'keyword',
      'boolean'
    ),
    correct: ['a'],
    explanation: '`scaled_float` stores a float as a long times a `scaling_factor`, giving compact, exact-enough monetary storage with range support. `text`/`keyword` are strings (no numeric ranges); `boolean` is unrelated.',
    references: [REF_FIELD_TYPES]
  },
  {
    domain: MAPPING, difficulty: 3, type: QType.SINGLE,
    stem: 'The `keyword` field parameter `ignore_above: 256` causes:',
    options: opts4(
      'Strings longer than 256 chars to be stored in _source but NOT indexed for that field',
      'The document to be rejected if longer than 256',
      'The string to be truncated to 256 chars in _source',
      'Aggregations to be disabled'
    ),
    correct: ['a'],
    explanation: '`ignore_above` skips indexing values longer than the limit (they stay in `_source` but are not searchable/aggregatable on that field). It neither rejects the doc nor truncates the stored source.',
    references: [REF_FIELD_TYPES]
  },
  {
    domain: MAPPING, difficulty: 3, type: QType.SINGLE,
    stem: 'Setting `"dynamic": "strict"` at the mapping level means:',
    options: opts4(
      'Indexing a document with an unmapped field is rejected with an error',
      'Unknown fields are stored but not indexed',
      'Unknown fields are dynamically mapped',
      'All fields become keyword'
    ),
    correct: ['a'],
    explanation: '`dynamic: strict` rejects documents containing fields not in the mapping. `dynamic: false` keeps them in `_source` unindexed; the default `dynamic: true` auto-creates mappings.',
    references: [REF_MAPPING]
  },
  {
    domain: MAPPING, difficulty: 3, type: QType.SINGLE,
    stem: 'Which field type stores an array of objects so that each object\'s sub-fields keep their per-element relationship for querying?',
    options: opts4(
      'nested',
      'object',
      'flattened',
      'join'
    ),
    correct: ['a'],
    explanation: 'The `nested` type indexes each object as a hidden sub-document, preserving which sub-field values belong together. The default `object` type flattens arrays, losing element correlation. `flattened` indexes the whole object as keywords.',
    references: [REF_FIELD_TYPES]
  },
  {
    domain: MAPPING, difficulty: 3, type: QType.SINGLE,
    stem: 'You add a field with `"index": false`. The effect is:',
    options: opts4(
      'The value is stored in _source but is not searchable (no inverted index for it)',
      'The field is removed from the document',
      'The field is indexed but not stored',
      'The field becomes a runtime field automatically'
    ),
    correct: ['a'],
    explanation: '`index: false` disables building searchable structures for the field, though it remains in `_source` (and can still be returned/used by runtime scripts). It is not deleted nor auto-promoted to a runtime field.',
    references: [REF_MAPPING]
  },
  {
    domain: MAPPING, difficulty: 2, type: QType.SINGLE,
    stem: 'Which analyzer emits the ENTIRE input string as a single, unmodified token?',
    options: opts4(
      'keyword analyzer',
      'standard analyzer',
      'simple analyzer',
      'whitespace analyzer'
    ),
    correct: ['a'],
    explanation: 'The `keyword` analyzer treats the whole input as one token (no tokenization/lowercasing). `standard`/`simple`/`whitespace` all split the input into multiple tokens.',
    references: [REF_ANALYSIS]
  },
  {
    domain: MAPPING, difficulty: 3, type: QType.SINGLE,
    stem: 'A `synonym` token filter is applied at which stage of analysis?',
    options: opts4(
      'As a token filter, after the tokenizer produces tokens',
      'As a character filter, before tokenization',
      'As the tokenizer itself',
      'At query parse time only, never at index time'
    ),
    correct: ['a'],
    explanation: 'Synonyms are token filters that operate on the token stream after tokenization. They can be applied at index time and/or via a search analyzer (synonym_graph), but they are token filters, not char filters/tokenizers.',
    references: [REF_CUSTOM_ANALYZER]
  },
  {
    domain: MAPPING, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'You want a different analyzer at search time than at index time for a `text` field. Which mapping parameter sets the query-time analyzer?',
    options: opts4(
      'search_analyzer',
      'index_analyzer',
      'normalizer',
      'query_filter'
    ),
    correct: ['a'],
    explanation: 'A field can specify `analyzer` (index time) and `search_analyzer` (query time) — e.g. edge-ngram at index time, standard at search time. `normalizer` is for keyword fields; `index_analyzer` is the deprecated old name.',
    references: [REF_ANALYSIS]
  },
  {
    domain: CLUSTER, difficulty: 2, type: QType.SINGLE,
    stem: 'Which _cat API quickly lists every index with its health, doc count, and store size?',
    options: opts4(
      'GET _cat/indices?v',
      'GET _cat/health?v',
      'GET _cat/nodes?v',
      'GET _cat/shards?v'
    ),
    correct: ['a'],
    explanation: '`_cat/indices` lists per-index health/status/docs/size. `_cat/health` is cluster-wide summary, `_cat/nodes` lists nodes, `_cat/shards` lists individual shards.',
    references: [REF_HEALTH]
  },
  {
    domain: CLUSTER, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A Snapshot Lifecycle Management (SLM) policy is responsible for:',
    options: opts4(
      'Automatically creating snapshots on a schedule and applying retention',
      'Transitioning indices through hot/warm/cold phases',
      'Rerouting shards between nodes',
      'Defining index mappings'
    ),
    correct: ['a'],
    explanation: 'SLM schedules automatic snapshots to a registered repository and enforces retention. ILM (not SLM) handles hot/warm/cold phase transitions; shard rerouting and mappings are unrelated.',
    references: [REF_SNAPSHOT]
  },
  {
    domain: CLUSTER, difficulty: 3, type: QType.SINGLE,
    stem: 'Which API updates a transient/persistent cluster-wide setting such as `cluster.routing.allocation.enable`?',
    options: opts4(
      'PUT _cluster/settings',
      'PUT _settings',
      'PUT <index>/_settings',
      'POST _cluster/reroute'
    ),
    correct: ['a'],
    explanation: '`PUT _cluster/settings` changes persistent/transient cluster-level settings. `PUT <index>/_settings` is per-index; `_cluster/reroute` manually moves shards rather than changing settings.',
    references: [REF_CONFIG]
  },
  {
    domain: CLUSTER, difficulty: 3, type: QType.SINGLE,
    stem: 'Before a rolling upgrade/restart, disabling shard allocation prevents unnecessary rebalancing. The correct setting is:',
    options: opts4(
      'cluster.routing.allocation.enable: "primaries" (or "none")',
      'index.blocks.write: true',
      'discovery.type: single-node',
      'cluster.routing.rebalance.enable: "always"'
    ),
    correct: ['a'],
    explanation: 'Setting `cluster.routing.allocation.enable` to `none`/`primaries` during a rolling restart stops replica reallocation churn while a node is briefly down. A write block stops indexing, not allocation.',
    references: [REF_ALLOCATION]
  },
  {
    domain: DATAPROC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which aggregation counts the approximate number of distinct values of a field?',
    options: opts4(
      'cardinality',
      'value_count',
      'terms',
      'sum'
    ),
    correct: ['a'],
    explanation: 'The `cardinality` aggregation gives an approximate distinct count (HyperLogLog++). `value_count` counts all values (not distinct); `terms` lists top buckets; `sum` totals numeric values.',
    references: [REF_AGGS]
  },
  {
    domain: DATAPROC, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which aggregation buckets numeric values into user-defined ranges such as 0–50, 50–100, 100+?',
    options: opts4(
      'range aggregation',
      'avg aggregation',
      'cardinality aggregation',
      'top_hits aggregation'
    ),
    correct: ['a'],
    explanation: 'The `range` (or `date_range`) bucket aggregation groups documents into explicit numeric/date ranges. `avg`/`cardinality` are metrics; `top_hits` returns sample docs per bucket.',
    references: [REF_AGGS]
  },
  {
    domain: DATAPROC, difficulty: 3, type: QType.SINGLE,
    stem: 'Which ingest processor extracts structured fields from an unstructured log line using named patterns?',
    options: opts4(
      'grok',
      'set',
      'remove',
      'date_index_name'
    ),
    correct: ['a'],
    explanation: 'The `grok` processor parses unstructured text into fields via regex/pattern definitions. `set` assigns a value, `remove` deletes fields, `date_index_name` routes by date — none parse free-form text.',
    references: [REF_PROCESSORS]
  },
  {
    domain: DATAPROC, difficulty: 3, type: QType.SINGLE,
    stem: 'Which processor lets you parse a string field as a date and store the result in a target field/timezone?',
    options: opts4(
      'date',
      'convert',
      'gsub',
      'json'
    ),
    correct: ['a'],
    explanation: 'The `date` processor parses one or more date formats and writes a timestamp (often `@timestamp`). `convert` changes scalar types, `gsub` does regex replace, `json` parses a JSON string.',
    references: [REF_PROCESSORS]
  },
  {
    domain: DATAPROC, difficulty: 3, type: QType.SINGLE,
    stem: 'How do you attach a default ingest pipeline so every write to an index is processed automatically?',
    options: opts4(
      'Set index.default_pipeline in the index settings',
      'Add a processor to elasticsearch.yml',
      'Use a search template',
      'Set cluster.routing.allocation.pipeline'
    ),
    correct: ['a'],
    explanation: 'The index setting `index.default_pipeline` (or `index.final_pipeline`) runs a pipeline on every indexed document without specifying `?pipeline=` per request. Pipelines are not configured in `elasticsearch.yml`.',
    references: [REF_INGEST]
  }
];

// ───────────────────── Practice Exam 2 ─────────────────────
const P2: Q[] = [
  // ── Installation and Configuration (4) ──
  {
    domain: INSTALL, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'On a fresh Elasticsearch 8.x install, what is true about the security configuration by default?',
    options: opts4(
      'Security is disabled and must be enabled manually.',
      'Security (TLS + authentication) is enabled automatically on first start, with an enrollment token generated for additional nodes/Kibana.',
      'Only API key auth is available; TLS is never configured.',
      'Security requires a paid license.'
    ),
    correct: ['b'],
    explanation: 'Since 8.0 the Elastic Stack security features are on by default: TLS for the transport and HTTP layers is auto-configured and an enrollment token is printed for joining nodes and Kibana. Basic security is free.',
    references: [REF_SECURITY]
  },
  {
    domain: INSTALL, difficulty: 3, type: QType.SINGLE,
    stem: 'Which `node.roles` value makes a node a coordinating-only node (no master, data, or ingest duties)?',
    options: opts4(
      'node.roles: [ coordinating ]',
      'node.roles: []',
      'node.roles: [ none ]',
      'node.coordinating: true'
    ),
    correct: ['b'],
    explanation: 'A coordinating-only node is configured with an EMPTY roles list: `node.roles: []`. There is no explicit `coordinating` role keyword — every node implicitly coordinates; removing all other roles yields a coordinating-only node.',
    references: [REF_NODE]
  },
  {
    domain: INSTALL, difficulty: 2, type: QType.SINGLE,
    stem: 'Which setting in `elasticsearch.yml` controls the network address the node binds to and publishes for client and inter-node traffic?',
    options: opts4(
      'network.host',
      'http.cors.host',
      'path.data',
      'cluster.routing.host'
    ),
    correct: ['a'],
    explanation: '`network.host` sets the bind/publish address (e.g. `0.0.0.0` or a specific IP). `path.data` is the data directory; `http.cors.host` is CORS-only; `cluster.routing.host` is not a setting.',
    references: [REF_CONFIG]
  },
  {
    domain: INSTALL, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about JVM heap and system configuration for an Elasticsearch node.',
    options: opts4(
      'Heap is typically set no more than ~50% of physical RAM and below the ~32 GB compressed-oops threshold.',
      'Min and max heap (Xms/Xmx) should be set to the same value to avoid resize pauses.',
      'Swapping should be disabled (e.g. bootstrap.memory_lock: true) for predictable performance.',
      'Heap size is configured in elasticsearch.yml under index.heap.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Heap is set via `jvm.options` (or JVM env), NOT `elasticsearch.yml`/`index.heap`. Best practice: Xms == Xmx, ≤ 50% RAM and under ~32 GB, and lock memory to avoid swapping.',
    references: [REF_CONFIG]
  },
  {
    domain: INDEX, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which index setting CANNOT be changed after the index is created?',
    options: opts4(
      'number_of_replicas',
      'refresh_interval',
      'number_of_shards',
      'index.blocks.read_only'
    ),
    correct: ['c'],
    explanation: '`number_of_shards` (primary shard count) is fixed at creation; changing it requires reindex/split/shrink. Replicas, refresh interval, and blocks are dynamic settings updatable via `_settings`.',
    references: [REF_INDEX_API]
  },
  {
    domain: INDEX, difficulty: 3, type: QType.SINGLE,
    stem: 'You need to add a `processed: true` field to every document in `logs-*` that matches a query, in place. Which API does this?',
    options: opts4(
      'POST logs-*/_update_by_query with a script',
      'POST _reindex into the same index',
      'PUT logs-*/_mapping',
      'POST logs-*/_forcemerge'
    ),
    correct: ['a'],
    explanation: '`_update_by_query` runs a script over documents matching a query and updates them in place. Reindexing into the same index is unsafe; `_mapping` changes schema only; `_forcemerge` merges segments.',
    references: [REF_UBQ]
  },
  {
    domain: INDEX, difficulty: 3, type: QType.SINGLE,
    stem: 'An alias `orders` points to `orders-v1`. To switch readers to `orders-v2` atomically with zero downtime, you should:',
    options: opts4(
      'Delete the alias, then recreate it on orders-v2',
      'POST _aliases with one atomic action: remove orders from orders-v1 AND add it to orders-v2',
      'Rename orders-v1 to orders-v2',
      'Set orders-v1 read-only'
    ),
    correct: ['b'],
    explanation: 'The `_aliases` API applies multiple add/remove actions atomically in one request, enabling zero-downtime cutover. Delete-then-recreate leaves a window with no alias.',
    references: [REF_ALIAS]
  },
  {
    domain: INDEX, difficulty: 4, type: QType.SINGLE,
    stem: 'In a `_bulk` request, one of 500 operations fails with a mapping conflict. What happens to the rest?',
    options: opts4(
      'The entire bulk request is rolled back.',
      'Only the failing operation fails; the others succeed, and the response `errors` flag is true with per-item status.',
      'All operations after the failing one are skipped.',
      'The index is locked.'
    ),
    correct: ['b'],
    explanation: 'Bulk operations are independent. A failure affects only that item; the response has `errors: true` and a per-item `status`/`error`. There is no transactional rollback.',
    references: [REF_BULK]
  },
  {
    domain: QUERIES, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'The key difference between query context and filter context is:',
    options: opts4(
      'Query context computes a relevance `_score`; filter context only answers yes/no and is cacheable.',
      'Filter context computes a score; query context does not.',
      'Both always compute a score.',
      'Filter context can only be used on text fields.'
    ),
    correct: ['a'],
    explanation: 'In query context a clause contributes to `_score` (how well it matches). In filter context the question is only "does it match?" — no scoring, and results are cacheable for speed.',
    references: [REF_FILTER_CTX]
  },
  {
    domain: QUERIES, difficulty: 3, type: QType.SINGLE,
    stem: 'Which query finds documents with a numeric `age` between 18 and 30 inclusive?',
    options: opts4(
      'range query on age with gte:18, lte:30',
      'term query on age with value "18-30"',
      'match query on age with "18 30"',
      'exists query on age'
    ),
    correct: ['a'],
    explanation: 'The `range` query with `gte`/`lte` (or `gt`/`lt`) handles numeric and date ranges. `term`/`match` are not range operators; `exists` only checks presence.',
    references: [REF_TERM_QUERY]
  },
  {
    domain: QUERIES, difficulty: 3, type: QType.SINGLE,
    stem: 'You want documents that MUST match `category:books`, SHOULD prefer `author:asimov`, and MUST NOT be `discontinued:true`. Which compound query expresses this?',
    options: opts4(
      'A `bool` query with `must` (category), `should` (author), and `must_not` (discontinued)',
      'A `dis_max` query',
      'A `constant_score` query',
      'A single `match` query with all conditions concatenated'
    ),
    correct: ['a'],
    explanation: 'The `bool` query composes `must`, `should`, `must_not`, and `filter` clauses — exactly mapping required, preferred, and excluded conditions.',
    references: [REF_BOOL]
  },
  {
    domain: QUERIES, difficulty: 4, type: QType.SINGLE,
    stem: 'Relevance scoring in Elasticsearch by default uses which similarity algorithm?',
    options: opts4(
      'TF-IDF (classic Lucene)',
      'BM25 (Okapi BM25)',
      'PageRank',
      'Cosine similarity on raw term counts'
    ),
    correct: ['b'],
    explanation: 'Since Lucene 6 / Elasticsearch 5, the default similarity is BM25, which improves on classic TF-IDF with term-frequency saturation and length normalization. PageRank/cosine are not the default text scoring model.',
    references: [REF_QDSL]
  },
  {
    domain: MAPPING, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which API lets you test how a specific analyzer tokenizes a piece of text WITHOUT indexing anything?',
    options: opts4(
      'GET _analyze (the Analyze API)',
      'GET _tokens',
      'POST _simulate/text',
      'GET _mapping/_test'
    ),
    correct: ['a'],
    explanation: 'The `_analyze` API returns the token stream produced by an analyzer (or a custom char_filter/tokenizer/filter chain) for given text, with no document indexed. The others are not real APIs for this.',
    references: [REF_ANALYZE]
  },
  {
    domain: MAPPING, difficulty: 3, type: QType.SINGLE,
    stem: 'An analyzer in Elasticsearch is composed, in order, of:',
    options: opts4(
      'tokenizer → char filters → token filters',
      'zero or more character filters → exactly one tokenizer → zero or more token filters',
      'one token filter → many tokenizers',
      'a mapping → a query → a result'
    ),
    correct: ['b'],
    explanation: 'An analyzer = optional character filter(s), then exactly ONE tokenizer, then optional token filter(s). Char filters preprocess raw text, the tokenizer splits into tokens, token filters modify the token stream (lowercase, stop, stemming).',
    references: [REF_CUSTOM_ANALYZER]
  },
  {
    domain: MAPPING, difficulty: 3, type: QType.SINGLE,
    stem: 'You define a custom analyzer with a `lowercase` token filter and an `html_strip` char filter. Which order is correct in the analysis chain?',
    options: opts4(
      'html_strip (char filter) runs first on raw text, then the tokenizer, then lowercase (token filter)',
      'lowercase runs first, then html_strip',
      'Both run after the tokenizer',
      'Char filters and token filters cannot be combined'
    ),
    correct: ['a'],
    explanation: 'Character filters (e.g. `html_strip`) operate on the raw character stream BEFORE tokenization. Token filters (e.g. `lowercase`) operate on tokens AFTER the tokenizer. They are routinely combined in a custom analyzer.',
    references: [REF_CUSTOM_ANALYZER, REF_ANALYSIS]
  },
  {
    domain: MAPPING, difficulty: 3, type: QType.SINGLE,
    stem: 'Once an index is created, changing the type of an existing field (e.g. `text` → `keyword`) requires:',
    options: opts4(
      'A simple PUT _mapping update on the existing field',
      'Creating a new index with the corrected mapping and reindexing the data',
      'Restarting the cluster',
      'Setting dynamic: true'
    ),
    correct: ['b'],
    explanation: 'You cannot change the type of an existing mapped field in place. The standard procedure is to create a new index with the desired mapping and `_reindex` into it (often behind an alias for a clean cutover).',
    references: [REF_MAPPING, REF_REINDEX]
  },
  {
    domain: CLUSTER, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which feature automatically transitions indices through hot/warm/cold/delete phases based on age or size?',
    options: opts4(
      'Index Lifecycle Management (ILM)',
      'Snapshot Lifecycle Management only',
      'Cross-cluster replication',
      'The reindex API on a schedule'
    ),
    correct: ['a'],
    explanation: 'ILM applies a policy with phases (hot, warm, cold, frozen, delete) and actions (rollover, shrink, force-merge, delete) based on age/size/doc count. SLM manages snapshots, not index phases.',
    references: [REF_ILM]
  },
  {
    domain: CLUSTER, difficulty: 3, type: QType.SINGLE,
    stem: 'Before you can take a snapshot, you must first:',
    options: opts4(
      'Register a snapshot repository (e.g. shared FS or S3) via the _snapshot API',
      'Set the cluster to read-only',
      'Stop all indexing',
      'Delete all replicas'
    ),
    correct: ['a'],
    explanation: 'Snapshots are written to a registered repository. You register one with `PUT _snapshot/<repo>` (fs, s3, gcs, azure) before creating snapshots. Indexing can continue; snapshots are incremental and non-blocking.',
    references: [REF_SNAPSHOT]
  },
  {
    domain: DATAPROC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which is a METRIC aggregation (computes a value over a set of documents)?',
    options: opts4(
      'terms',
      'date_histogram',
      'avg',
      'filters'
    ),
    correct: ['c'],
    explanation: '`avg` (also sum, min, max, stats, cardinality) is a metric aggregation. `terms`, `date_histogram`, and `filters` are bucket aggregations that group documents.',
    references: [REF_AGGS]
  },
  {
    domain: DATAPROC, difficulty: 3, type: QType.SINGLE,
    stem: 'A pipeline aggregation such as `derivative` or `cumulative_sum`:',
    options: opts4(
      'Operates on the output (buckets/metrics) of another aggregation, not directly on documents',
      'Replaces the need for a query',
      'Runs only on keyword fields',
      'Is a type of ingest processor'
    ),
    correct: ['a'],
    explanation: 'Pipeline aggregations consume the results of other aggregations (e.g. a metric inside a date_histogram) to compute moving functions, derivatives, cumulative sums, bucket scripts, etc.',
    references: [REF_PIPELINE_AGG]
  },
  {
    domain: INSTALL, difficulty: 2, type: QType.SINGLE,
    stem: 'Which file configures the logging behavior of an Elasticsearch node?',
    options: opts4(
      'log4j2.properties',
      'elasticsearch.yml',
      'jvm.options',
      'logging.json'
    ),
    correct: ['a'],
    explanation: 'Elasticsearch uses Log4j2; `log4j2.properties` in the config directory defines appenders/levels. `elasticsearch.yml` is cluster/node config and `jvm.options` is JVM tuning.',
    references: [REF_CONFIG]
  },
  {
    domain: INSTALL, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'In `node.roles`, which combination yields a node that holds data AND can run ingest pipelines but is NOT master-eligible?',
    options: opts4(
      'node.roles: [ data, ingest ]',
      'node.roles: [ master, data, ingest ]',
      'node.roles: []',
      'node.roles: [ master ]'
    ),
    correct: ['a'],
    explanation: '`[ data, ingest ]` gives data storage + pipeline execution while omitting `master`, so the node cannot be elected master. An empty list is coordinating-only; including `master` makes it master-eligible.',
    references: [REF_NODE]
  },
  {
    domain: INSTALL, difficulty: 3, type: QType.SINGLE,
    stem: 'Which setting list seeds discovery by pointing at the addresses of master-eligible nodes?',
    options: opts4(
      'discovery.seed_hosts',
      'cluster.initial_master_nodes',
      'gateway.expected_data_nodes',
      'transport.tcp.compress'
    ),
    correct: ['a'],
    explanation: '`discovery.seed_hosts` is the unicast seed list used to find peers. `cluster.initial_master_nodes` is bootstrap-only; `gateway.expected_data_nodes` gates recovery; transport compression is unrelated.',
    references: [REF_DISCOVERY]
  },
  {
    domain: INSTALL, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command adds a secure setting (e.g. an S3 secret key) to the node keystore?',
    options: opts4(
      'bin/elasticsearch-keystore add s3.client.default.secret_key',
      'bin/elasticsearch-certutil add secret_key',
      'PUT _cluster/settings with the secret',
      'Add it to jvm.options'
    ),
    correct: ['a'],
    explanation: '`elasticsearch-keystore add <setting>` stores encrypted secure settings. `certutil` is for certificates; secrets must not go into `_cluster/settings` plaintext or `jvm.options`.',
    references: [REF_SECURITY]
  },
  {
    domain: INSTALL, difficulty: 3, type: QType.SINGLE,
    stem: 'Which built-in superuser account is created/managed for bootstrapping a secured 8.x cluster?',
    options: opts4(
      'elastic',
      'admin',
      'root',
      'superuser'
    ),
    correct: ['a'],
    explanation: 'The built-in `elastic` user is the bootstrap superuser; its password can be (re)set with `elasticsearch-reset-password`. `admin`/`root`/`superuser` are not the default built-in account name (superuser is a role).',
    references: [REF_SECURITY]
  },
  {
    domain: INSTALL, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'True or False: A coordinating-only node still participates in master elections.',
    options: [
      { id: 'a', text: 'True' },
      { id: 'b', text: 'False' }
    ],
    correct: ['b'],
    explanation: 'False. A coordinating-only node has `node.roles: []` and is not master-eligible, so it does not vote in elections. It only routes requests and gathers/merges results.',
    references: [REF_NODE]
  },
  {
    domain: INSTALL, difficulty: 3, type: QType.SINGLE,
    stem: 'For a production node bound to a routable IP, which bootstrap check commonly fails if the OS limit is too low?',
    options: opts4(
      'The vm.max_map_count check (must be >= 262144)',
      'The cluster.name presence check',
      'The path.logs writable check only',
      'The number_of_replicas check'
    ),
    correct: ['a'],
    explanation: '`vm.max_map_count` must be at least 262144 or the production bootstrap check fails and the node refuses to start. `number_of_replicas` is an index setting, not a bootstrap check.',
    references: [REF_CONFIG]
  },
  {
    domain: INSTALL, difficulty: 2, type: QType.SINGLE,
    stem: 'Which setting identifies an individual node (shown in cluster APIs and logs)?',
    options: opts4(
      'node.name',
      'cluster.name',
      'node.attr.rack',
      'node.id'
    ),
    correct: ['a'],
    explanation: '`node.name` is the human-readable node identifier (defaults to the hostname). `cluster.name` groups nodes; `node.attr.*` are custom allocation attributes; `node.id` is auto-generated, not user-set.',
    references: [REF_CONFIG]
  },
  {
    domain: INSTALL, difficulty: 3, type: QType.SINGLE,
    stem: 'You want shard allocation awareness so replicas avoid the same rack as their primary. The first step is to set:',
    options: opts4(
      'A custom node attribute (node.attr.rack_id) plus cluster.routing.allocation.awareness.attributes',
      'discovery.seed_hosts per rack',
      'index.number_of_replicas: 0',
      'node.roles: [ data_warm ]'
    ),
    correct: ['a'],
    explanation: 'Allocation awareness uses a custom node attribute (e.g. `node.attr.rack_id`) plus `cluster.routing.allocation.awareness.attributes: rack_id` so Elasticsearch spreads primaries/replicas across racks. The other options are unrelated.',
    references: [REF_NODE]
  },
  {
    domain: INDEX, difficulty: 2, type: QType.SINGLE,
    stem: 'Which call creates an index using an explicit mappings object at creation time?',
    options: opts4(
      'PUT my-index with body containing "mappings": { "properties": { ... } }',
      'POST my-index/_mapping/_create',
      'PUT my-index/_doc with the mapping',
      'POST _create/my-index?mappings=...'
    ),
    correct: ['a'],
    explanation: 'The Create Index API accepts `settings` and `mappings` in the body of `PUT /my-index`. Mappings cannot be supplied through `_doc`; `_mapping` is for updating an existing index.',
    references: [REF_INDEX_API]
  },
  {
    domain: INDEX, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which API merges Lucene segments to reduce their count (commonly run on read-only/older indices)?',
    options: opts4(
      'POST <index>/_forcemerge?max_num_segments=1',
      'POST <index>/_flush',
      'POST <index>/_refresh',
      'POST <index>/_shrink'
    ),
    correct: ['a'],
    explanation: '`_forcemerge` rewrites segments down to a target count, reclaiming deletes and improving read performance — best on indices no longer written to. `_flush` persists the translog; `_refresh` makes docs searchable; `_shrink` changes shard count.',
    references: [REF_REINDEX]
  },
  {
    domain: INDEX, difficulty: 3, type: QType.SINGLE,
    stem: 'A write to a single document needs to be acknowledged by the primary AND one replica before returning. Which parameter expresses that?',
    options: opts4(
      'wait_for_active_shards=2',
      'refresh=true',
      'timeout=2s',
      'routing=2'
    ),
    correct: ['a'],
    explanation: '`wait_for_active_shards` requires that many shard copies (primary + replicas) be active before the operation proceeds. `refresh` controls visibility; `timeout` bounds the wait; `routing` selects a shard.',
    references: [REF_DOC_API]
  },
  {
    domain: INDEX, difficulty: 3, type: QType.SINGLE,
    stem: 'Which combination correctly upserts: update the document if it exists, otherwise insert it?',
    options: opts4(
      'POST <index>/_update/<id> with "doc" and "doc_as_upsert": true (or an "upsert" object)',
      'PUT <index>/_doc/<id> with op_type=create',
      'POST <index>/_bulk with only delete actions',
      'POST <index>/_reindex'
    ),
    correct: ['a'],
    explanation: 'The `_update` API with `doc_as_upsert: true` (or an explicit `upsert` object) updates an existing doc or creates it if missing. `op_type=create` fails when the id exists rather than upserting.',
    references: [REF_DOC_API]
  },
  {
    domain: INDEX, difficulty: 3, type: QType.SINGLE,
    stem: 'You reindex with `"conflicts": "proceed"`. This means:',
    options: opts4(
      'Version conflicts are counted and skipped instead of aborting the whole reindex',
      'Conflicting documents are overwritten regardless of version',
      'The reindex retries forever',
      'The destination index is recreated'
    ),
    correct: ['a'],
    explanation: '`conflicts: proceed` lets `_reindex`/`_update_by_query` continue past version conflicts (counted in the response) rather than aborting on the first conflict. It does not force overwrite.',
    references: [REF_REINDEX]
  },
  {
    domain: INDEX, difficulty: 3, type: QType.SINGLE,
    stem: 'A write alias used by a data stream / rollover pattern must have exactly one index designated as:',
    options: opts4(
      'is_write_index: true',
      'is_primary: true',
      'routing: write',
      'index.blocks.read: false'
    ),
    correct: ['a'],
    explanation: 'When an alias spans multiple indices, exactly one must have `is_write_index: true` so writes target the current rollover index while reads span all. The other options are not how a write target is designated.',
    references: [REF_ALIAS]
  },
  {
    domain: INDEX, difficulty: 4, type: QType.SINGLE,
    stem: 'A `_reindex` must pull from a DIFFERENT (remote) Elasticsearch cluster. What is required?',
    options: opts4(
      'A "remote" block in the reindex source plus the host in reindex.remote.whitelist',
      'Cross-cluster replication only',
      'A snapshot first; reindex cannot read remote',
      'It is impossible without manual export'
    ),
    correct: ['a'],
    explanation: 'Remote reindex uses `source.remote.host` and the remote host must be listed in `reindex.remote.whitelist` in `elasticsearch.yml`. CCR is a separate replication feature; remote reindex does not require a snapshot.',
    references: [REF_REINDEX]
  },
  {
    domain: INDEX, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which API removes an entire index and all its data?',
    options: opts4(
      'DELETE <index>',
      'POST <index>/_close',
      'PUT <index>/_settings {"index.blocks.read_only": true}',
      'POST <index>/_flush'
    ),
    correct: ['a'],
    explanation: '`DELETE /<index>` deletes the index and its data. `_close` just makes it unavailable for read/write but keeps data; a read-only block does not delete; `_flush` persists the translog.',
    references: [REF_INDEX_API]
  },
  {
    domain: INDEX, difficulty: 3, type: QType.SINGLE,
    stem: 'Closing an index with `POST <index>/_close`:',
    options: opts4(
      'Releases most of its resources; it cannot be read/written until reopened with _open',
      'Permanently deletes it',
      'Makes it read-only but still searchable',
      'Forces a snapshot'
    ),
    correct: ['a'],
    explanation: 'A closed index is blocked for reads and writes and frees most heap/resources; reopen with `_open`. It is not deleted, not searchable while closed, and closing does not snapshot.',
    references: [REF_INDEX_API]
  },
  {
    domain: QUERIES, difficulty: 2, type: QType.SINGLE,
    stem: 'Which endpoint executes a search query against an index?',
    options: opts4(
      'GET <index>/_search',
      'GET <index>/_query',
      'POST <index>/_find',
      'GET <index>/_doc/_all'
    ),
    correct: ['a'],
    explanation: '`GET|POST /<index>/_search` runs a Query DSL search. `_query`, `_find`, and `_doc/_all` are not valid search endpoints.',
    references: [REF_QDSL]
  },
  {
    domain: QUERIES, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'You only need a count of matching documents, not the hits themselves. The most efficient call is:',
    options: opts4(
      'GET <index>/_count with the query',
      'GET <index>/_search?size=10000',
      'A terms aggregation',
      'GET <index>/_stats'
    ),
    correct: ['a'],
    explanation: 'The `_count` API returns just the number of matches for a query — cheaper than fetching hits. `_search?size=10000` still scores/returns docs; `_stats` is index-level metrics, not query counts.',
    references: [REF_QDSL]
  },
  {
    domain: QUERIES, difficulty: 3, type: QType.SINGLE,
    stem: 'A `wildcard` query `eng*ng` on a keyword field is best described as:',
    options: opts4(
      'A term-level pattern match that can be slow on large datasets and should be used cautiously',
      'A full-text analyzed query',
      'A range query',
      'Always faster than a term query'
    ),
    correct: ['a'],
    explanation: '`wildcard` matches term patterns (`*`, `?`) without analysis and can be expensive (especially leading wildcards). It is generally slower than an exact `term` query and should be used carefully.',
    references: [REF_TERM_QUERY]
  },
  {
    domain: QUERIES, difficulty: 3, type: QType.SINGLE,
    stem: 'To boost recent documents\' relevance using a decay over a `date` field, which query do you use?',
    options: opts4(
      'function_score with a gauss/exp/linear decay function',
      'constant_score',
      'match_all with sort by date',
      'range query with boost'
    ),
    correct: ['a'],
    explanation: '`function_score` with a decay function (`gauss`, `exp`, `linear`) smoothly adjusts `_score` based on distance from an origin (e.g. now) — ideal for recency boosting. `constant_score` flattens scoring; sorting by date is not relevance boosting.',
    references: [REF_QDSL]
  },
  {
    domain: QUERIES, difficulty: 3, type: QType.SINGLE,
    stem: 'In a `match` query, setting `"operator": "and"` changes behavior so that:',
    options: opts4(
      'ALL analyzed terms of the query must be present (instead of the default OR)',
      'The query becomes a phrase match',
      'Only the first term is required',
      'The field analyzer is bypassed'
    ),
    correct: ['a'],
    explanation: 'By default `match` uses OR between query terms; `operator: "and"` requires every term to match. It does not enforce order (that is `match_phrase`) and still analyzes the input.',
    references: [REF_FULLTEXT]
  },
  {
    domain: QUERIES, difficulty: 4, type: QType.SINGLE,
    stem: 'The `multi_match` type `cross_fields` is appropriate when:',
    options: opts4(
      'Terms of a single concept (e.g. a person\'s name) are spread across multiple fields and should be treated as one combined field',
      'You want the single best-scoring field only',
      'You need phrase matching',
      'You want to query a nested object'
    ),
    correct: ['a'],
    explanation: '`cross_fields` treats matched fields as one big field, useful when query terms span fields (first_name/last_name). `best_fields` uses the top field score; phrase is a different type; nested needs a `nested` query.',
    references: [REF_FULLTEXT]
  },
  {
    domain: QUERIES, difficulty: 3, type: QType.SINGLE,
    stem: 'Which clause both EXCLUDES non-matching documents and runs in filter context (no scoring)?',
    options: opts4(
      'must_not',
      'should',
      'must',
      'boost'
    ),
    correct: ['a'],
    explanation: '`must_not` excludes documents that match it and runs in filter context (no score contribution, cacheable). `must` is scored-required, `should` is scored-optional, `boost` is a parameter.',
    references: [REF_BOOL]
  },
  {
    domain: QUERIES, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which parameter on a search request returns highlighted snippets of matching text?',
    options: opts4(
      'highlight',
      'explain',
      'profile',
      'stored_fields'
    ),
    correct: ['a'],
    explanation: 'The `highlight` section returns fragments with the matched terms emphasized. `explain` shows score computation, `profile` shows timing, `stored_fields` returns specific stored fields.',
    references: [REF_QDSL]
  },
  {
    domain: QUERIES, difficulty: 3, type: QType.SINGLE,
    stem: 'Setting `"explain": true` on a search request causes Elasticsearch to:',
    options: opts4(
      'Return a detailed breakdown of how each hit\'s relevance score was computed',
      'Explain why a shard is unallocated',
      'Validate the query syntax only',
      'Profile query execution time per phase'
    ),
    correct: ['a'],
    explanation: '`explain: true` adds an `_explanation` describing the scoring math per hit. Allocation explain is a cluster API; query validation is `_validate/query`; timing is `profile: true`.',
    references: [REF_QDSL]
  },
  {
    domain: MAPPING, difficulty: 2, type: QType.SINGLE,
    stem: 'Which field type should you use to store an IPv4/IPv6 address for range and CIDR queries?',
    options: opts4(
      'ip',
      'keyword',
      'text',
      'long'
    ),
    correct: ['a'],
    explanation: 'The dedicated `ip` field type supports IPv4/IPv6 and CIDR range queries. `keyword`/`text` only do string matching; `long` cannot represent IPv6.',
    references: [REF_FIELD_TYPES]
  },
  {
    domain: MAPPING, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which field type efficiently stores geographic latitude/longitude points for distance and bounding-box queries?',
    options: opts4(
      'geo_point',
      'geo_line',
      'point',
      'double_array'
    ),
    correct: ['a'],
    explanation: '`geo_point` stores lat/lon and supports `geo_distance`, `geo_bounding_box`, and geo aggregations. `geo_shape` handles complex shapes; `point` is a 2D Cartesian type, not geographic; `double_array` is not a type.',
    references: [REF_FIELD_TYPES]
  },
  {
    domain: MAPPING, difficulty: 3, type: QType.SINGLE,
    stem: 'The `_source` field in a mapping, if disabled (`"_source": { "enabled": false }`):',
    options: opts4(
      'Saves space but you can no longer retrieve the original JSON, reindex from it, or update partially',
      'Has no downside',
      'Improves relevance scoring',
      'Makes the index read-only'
    ),
    correct: ['a'],
    explanation: 'Disabling `_source` saves disk but you lose the original document — breaking reindex, partial updates, highlight on source, and Update By Query. It is rarely recommended.',
    references: [REF_MAPPING]
  },
  {
    domain: MAPPING, difficulty: 3, type: QType.SINGLE,
    stem: 'The `standard` analyzer applied to "The Quick-Brown FOX!" produces approximately:',
    options: opts4(
      '[the, quick, brown, fox]',
      '[The, Quick-Brown, FOX!]',
      '[the quick-brown fox!]',
      '[t, h, e, q, ...]'
    ),
    correct: ['a'],
    explanation: 'The `standard` analyzer (standard tokenizer + lowercase) splits on word boundaries (the hyphen separates quick/brown) and lowercases, yielding `the, quick, brown, fox`. It does not keep the whole string or split into characters.',
    references: [REF_ANALYSIS]
  },
  {
    domain: MAPPING, difficulty: 3, type: QType.SINGLE,
    stem: 'You want autocomplete (prefix) suggestions while typing. A common indexing technique is:',
    options: opts4(
      'An analyzer using an edge_ngram token filter at index time with the standard analyzer at search time',
      'A keyword field with ignore_above',
      'Disabling _source',
      'A pipeline aggregation'
    ),
    correct: ['a'],
    explanation: 'Edge n-grams index prefixes (e.g. "qu", "qui", "quic", "quick") so a short query matches; using `search_analyzer: standard` avoids n-gramming the query itself. The other options do not enable prefix completion.',
    references: [REF_CUSTOM_ANALYZER]
  },
  {
    domain: MAPPING, difficulty: 3, type: QType.SINGLE,
    stem: 'The `stop` token filter is used to:',
    options: opts4(
      'Remove very common words (e.g. "the", "is", "a") from the token stream',
      'Stop indexing the document',
      'Split text into tokens',
      'Lowercase tokens'
    ),
    correct: ['a'],
    explanation: 'The `stop` token filter drops configurable stop words to reduce noise/index size. Tokenizing is the tokenizer\'s job; lowercasing is the `lowercase` filter.',
    references: [REF_CUSTOM_ANALYZER]
  },
  {
    domain: MAPPING, difficulty: 2, type: QType.SINGLE,
    stem: 'Which analyzer lowercases and splits on non-letter characters (dropping numbers)?',
    options: opts4(
      'simple analyzer',
      'standard analyzer',
      'keyword analyzer',
      'pattern analyzer with \\d+'
    ),
    correct: ['a'],
    explanation: 'The `simple` analyzer uses the lowercase tokenizer: it breaks on non-letters and lowercases, discarding digits. `standard` keeps numbers; `keyword` emits one token; the pattern option is a different configurable analyzer.',
    references: [REF_ANALYSIS]
  },
  {
    domain: MAPPING, difficulty: 3, type: QType.SINGLE,
    stem: 'A `normalizer` differs from an `analyzer` in that a normalizer:',
    options: opts4(
      'Produces a single token (no tokenizer) and is used on keyword fields',
      'Can use any tokenizer',
      'Only works on text fields',
      'Runs at query time only'
    ),
    correct: ['a'],
    explanation: 'A normalizer has no tokenizer — it applies char/token filters (like lowercase, asciifolding) and emits ONE token, used to normalize `keyword` fields for case-insensitive exact matching.',
    references: [REF_ANALYSIS]
  },
  {
    domain: MAPPING, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which `text` field parameter, when set to `false`, disables storing term positions and prevents `match_phrase`/proximity queries on that field?',
    options: opts4(
      'index_options / index_phrases-related settings (e.g. "index_options": "freqs")',
      'doc_values',
      'norms',
      'eager_global_ordinals'
    ),
    correct: ['a'],
    explanation: 'Phrase/proximity queries need positional data; lowering `index_options` (e.g. to `freqs`, dropping positions) makes `match_phrase` impossible. `doc_values`/`norms`/`global_ordinals` affect aggregations/scoring, not phrase capability.',
    references: [REF_MAPPING]
  },
  {
    domain: CLUSTER, difficulty: 2, type: QType.SINGLE,
    stem: 'Which API gives a one-line cluster-wide health summary (status, node count, active shards %)?',
    options: opts4(
      'GET _cluster/health',
      'GET _cat/indices',
      'GET _nodes/stats',
      'GET _tasks'
    ),
    correct: ['a'],
    explanation: 'The Cluster Health API returns overall status (green/yellow/red), node and shard counts, and percentages. `_cat/indices` is per-index; `_nodes/stats` is detailed per-node; `_tasks` lists running tasks.',
    references: [REF_HEALTH]
  },
  {
    domain: CLUSTER, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'During a rolling restart you set allocation to "primaries". After the node returns, you should:',
    options: opts4(
      'Re-enable allocation with cluster.routing.allocation.enable: "all" so replicas recover',
      'Leave it at "primaries" permanently',
      'Delete unassigned replicas',
      'Force a full cluster restart'
    ),
    correct: ['a'],
    explanation: 'After the node rejoins, reset `cluster.routing.allocation.enable` to `all` so replica shards reallocate and the cluster returns to green. Leaving it restricted keeps replicas unassigned (yellow).',
    references: [REF_ALLOCATION]
  },
  {
    domain: CLUSTER, difficulty: 3, type: QType.SINGLE,
    stem: 'Which API lists currently running long tasks (e.g. reindex, force-merge) and allows cancellation?',
    options: opts4(
      'GET _tasks (and POST _tasks/<id>/_cancel)',
      'GET _cat/recovery',
      'GET _nodes/hot_threads',
      'GET _cluster/pending_tasks'
    ),
    correct: ['a'],
    explanation: 'The Task Management API lists tasks and supports `_cancel`. `_cat/recovery` shows shard recovery; `hot_threads` profiles CPU; `pending_tasks` shows queued cluster-state changes, not cancelable user tasks.',
    references: [REF_HEALTH]
  },
  {
    domain: CLUSTER, difficulty: 3, type: QType.SINGLE,
    stem: 'A snapshot is incremental. This means:',
    options: opts4(
      'Only segments not already in the repository are copied; unchanged data is referenced, not re-copied',
      'It snapshots one document at a time',
      'It always copies the entire cluster state and all data fully each time',
      'It requires the index to be closed'
    ),
    correct: ['a'],
    explanation: 'Snapshots are incremental at the Lucene segment level — only new/changed segments are uploaded; shared segments are referenced. Indices can stay open and writable; full re-copy is not required.',
    references: [REF_SNAPSHOT]
  },
  {
    domain: DATAPROC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which aggregation returns multiple statistics (min, max, avg, sum, count) in one result?',
    options: opts4(
      'stats',
      'terms',
      'cardinality',
      'date_histogram'
    ),
    correct: ['a'],
    explanation: 'The `stats` metric aggregation returns count/min/max/avg/sum together (`extended_stats` adds variance/std-dev). `terms`/`date_histogram` are buckets; `cardinality` is distinct count only.',
    references: [REF_AGGS]
  },
  {
    domain: DATAPROC, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Inside a `terms` bucket aggregation, adding a `top_hits` sub-aggregation does what?',
    options: opts4(
      'Returns the top matching document(s) per bucket (e.g. newest order per customer)',
      'Counts distinct values',
      'Computes a moving average',
      'Renames a field'
    ),
    correct: ['a'],
    explanation: '`top_hits` is a metric aggregation returning the highest-ranked documents within each parent bucket — ideal for "best/latest per group". It does not count distinct values or do pipeline math.',
    references: [REF_AGGS]
  },
  {
    domain: DATAPROC, difficulty: 3, type: QType.SINGLE,
    stem: 'Which ingest processor enriches a document with geographic data (city, country) from an IP address?',
    options: opts4(
      'geoip',
      'set',
      'grok',
      'foreach'
    ),
    correct: ['a'],
    explanation: 'The `geoip` processor looks up an IP in a GeoIP database and adds location fields. `set` assigns static/computed values, `grok` parses text, `foreach` iterates an array applying another processor.',
    references: [REF_PROCESSORS]
  },
  {
    domain: DATAPROC, difficulty: 3, type: QType.SINGLE,
    stem: 'The `enrich` processor in an ingest pipeline is used to:',
    options: opts4(
      'Add data from a separate enrich index/policy based on a match field at ingest time',
      'Aggregate documents at search time',
      'Replicate shards',
      'Compress the document'
    ),
    correct: ['a'],
    explanation: 'The `enrich` processor augments incoming documents with reference data from a precomputed enrich index defined by an enrich policy (e.g. add product details by SKU). It is ingest-time, not a search aggregation.',
    references: [REF_PROCESSORS]
  },
  {
    domain: DATAPROC, difficulty: 3, type: QType.SINGLE,
    stem: 'Which pipeline aggregation computes the running total of a metric across ordered buckets?',
    options: opts4(
      'cumulative_sum',
      'derivative',
      'bucket_selector',
      'avg'
    ),
    correct: ['a'],
    explanation: '`cumulative_sum` is a parent pipeline aggregation that accumulates a metric across the ordered buckets. `derivative` gives bucket-to-bucket change, `bucket_selector` filters buckets, `avg` is a plain metric.',
    references: [REF_PIPELINE_AGG]
  }
];

// ───────────────────── Practice Exam 3 ─────────────────────
const P3: Q[] = [
  // ── Installation and Configuration (4) ──
  {
    domain: INSTALL, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which setting defines the directory where Elasticsearch stores its index data on disk?',
    options: opts4(
      'path.data',
      'path.logs',
      'path.repo',
      'path.home'
    ),
    correct: ['a'],
    explanation: '`path.data` is the data directory. `path.logs` is logs, `path.repo` is allowed snapshot filesystem repository locations, and `path.home` (ES_HOME) is the install root.',
    references: [REF_CONFIG]
  },
  {
    domain: INSTALL, difficulty: 3, type: QType.SINGLE,
    stem: 'You want a dedicated ingest node that runs ingest pipelines but holds no shards. The correct `node.roles` is:',
    options: opts4(
      'node.roles: [ ingest ]',
      'node.roles: [ data, ingest ]',
      'node.roles: [ master ]',
      'node.ingest: only'
    ),
    correct: ['a'],
    explanation: '`node.roles: [ ingest ]` makes the node ingest-only (runs pipelines, holds no data). Including `data` would also store shards; `master` is unrelated; `node.ingest: only` is not valid syntax.',
    references: [REF_NODE]
  },
  {
    domain: INSTALL, difficulty: 3, type: QType.SINGLE,
    stem: 'After 8.x security auto-configuration, how does a NEW node typically join the existing secured cluster?',
    options: opts4(
      'By copying the elasticsearch.yml verbatim',
      'By starting with an enrollment token generated on an existing node (elasticsearch-create-enrollment-token)',
      'By disabling TLS first',
      'By manually editing the keystore on every node'
    ),
    correct: ['b'],
    explanation: 'An enrollment token (from `bin/elasticsearch-create-enrollment-token -s node`) lets a new node automatically obtain the CA/TLS material and join the secured cluster. Copying yml or disabling TLS is incorrect/insecure.',
    references: [REF_SECURITY]
  },
  {
    domain: INSTALL, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL valid Elasticsearch node roles that can appear in `node.roles`.',
    options: opts4(
      'master',
      'data',
      'ingest',
      'coordinator'
    ),
    correct: ['a', 'b', 'c'],
    explanation: '`master`, `data` (and data tiers like data_hot/data_warm), and `ingest` are valid roles, along with ml, transform, remote_cluster_client. There is no explicit `coordinator` role — a coordinating-only node uses an empty roles list.',
    references: [REF_NODE]
  },
  {
    domain: INDEX, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A document is indexed but does not appear in search results immediately. The most likely reason is:',
    options: opts4(
      'It is lost permanently.',
      'It is not yet refreshed/searchable — by default the index refreshes about every 1 second.',
      'The cluster is red.',
      'The mapping rejected it silently.'
    ),
    correct: ['b'],
    explanation: 'Newly indexed documents become searchable only after a refresh (default `index.refresh_interval` ~1s), unless you force `?refresh=true`/`wait_for`. The document is durably written to the translog regardless.',
    references: [REF_DOC_API]
  },
  {
    domain: INDEX, difficulty: 3, type: QType.SINGLE,
    stem: 'You want an ILM-managed time-series data stream to start writing to a new backing index when the current one reaches 50 GB or 30 days. Which ILM action achieves this?',
    options: opts4(
      'The `rollover` action in the hot phase',
      'The `shrink` action',
      'The `freeze` action',
      'The `delete` action'
    ),
    correct: ['a'],
    explanation: 'The `rollover` action (hot phase) creates a new backing index when size/age/doc conditions are met. `shrink` reduces shards, `delete` removes the index, `freeze` is deprecated/cold-related.',
    references: [REF_ILM]
  },
  {
    domain: INDEX, difficulty: 3, type: QType.SINGLE,
    stem: 'To restore a single index from an existing snapshot, you use:',
    options: opts4(
      'POST _snapshot/<repo>/<snapshot>/_restore with indices specified',
      'POST <index>/_reindex from the repository',
      'PUT <index>/_recovery',
      'GET _snapshot/<repo>/<snapshot>'
    ),
    correct: ['a'],
    explanation: 'The restore API `POST _snapshot/<repo>/<snapshot>/_restore` (optionally with `indices` and rename patterns) restores selected indices. `GET _snapshot/...` only reads metadata; `_recovery` reports recovery progress.',
    references: [REF_SNAPSHOT]
  },
  {
    domain: INDEX, difficulty: 4, type: QType.SINGLE,
    stem: 'A `_reindex` request needs to copy only documents where `region:"eu"`. How is this expressed?',
    options: opts4(
      'Add a `query` under `source` in the reindex body',
      'Reindex everything then delete the rest',
      'Use a `filter` at the top level of the reindex body',
      'It is not possible to filter a reindex'
    ),
    correct: ['a'],
    explanation: 'The `_reindex` body accepts `source.query` (a standard Query DSL query) to copy only matching documents. Filtering at reindex time is supported and preferred over copy-then-delete.',
    references: [REF_REINDEX]
  },
  {
    domain: QUERIES, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which query matches an exact, non-analyzed value and is appropriate on a `keyword` field?',
    options: opts4(
      'match',
      'term',
      'match_phrase',
      'query_string with analysis'
    ),
    correct: ['b'],
    explanation: 'The `term` query looks for the exact indexed token and does not analyze the input — correct for `keyword`, numeric, and boolean fields. `match`/`match_phrase` analyze the query text.',
    references: [REF_TERM_QUERY]
  },
  {
    domain: QUERIES, difficulty: 3, type: QType.SINGLE,
    stem: 'A `match_phrase` query on `"quick brown fox"` matches documents where:',
    options: opts4(
      'Any of the three terms appears anywhere',
      'All three terms appear in that order, adjacent (subject to slop)',
      'The exact untokenized string is stored',
      'Only the first term matches'
    ),
    correct: ['b'],
    explanation: '`match_phrase` requires the analyzed terms to appear in the same order and adjacent (positions), optionally allowing reordering/gaps via `slop`. It still uses the field analyzer.',
    references: [REF_FULLTEXT]
  },
  {
    domain: QUERIES, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'True or False: Placing a clause in the `filter` section of a `bool` query excludes it from relevance scoring and makes it eligible for query result caching.',
    options: [
      { id: 'a', text: 'True' },
      { id: 'b', text: 'False' }
    ],
    correct: ['a'],
    explanation: 'True. `filter` (and `must_not`) run in filter context: they answer yes/no, do not affect `_score`, and their results can be cached by the node query cache, improving performance for repeated filters.',
    references: [REF_FILTER_CTX]
  },
  {
    domain: QUERIES, difficulty: 4, type: QType.SINGLE,
    stem: 'A parameterized, reusable search defined server-side and invoked with runtime parameters is implemented with:',
    options: opts4(
      'A search template (stored Mustache script invoked via _search/template)',
      'An ingest pipeline',
      'A runtime field',
      'An index alias'
    ),
    correct: ['a'],
    explanation: 'Search templates store a Mustache-templated query (via the scripts API) and are executed with `_search/template` by id and params — decoupling the query shape from the client. Aliases/pipelines/runtime fields serve other purposes.',
    references: [REF_SEARCH_TEMPLATE]
  },
  {
    domain: MAPPING, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which is the correct way to add a NEW field to an existing index mapping?',
    options: opts4(
      'PUT <index>/_mapping with the new field properties',
      'You must delete and recreate the index',
      'PUT <index>/_settings with the field',
      'It happens only via dynamic mapping; explicit addition is impossible'
    ),
    correct: ['a'],
    explanation: 'You CAN add new fields to an existing mapping with `PUT <index>/_mapping`. What you cannot do is change the type of an existing field. `_settings` is for index settings, not fields.',
    references: [REF_MAPPING]
  },
  {
    domain: MAPPING, difficulty: 3, type: QType.SINGLE,
    stem: 'The default analyzer applied to `text` fields when none is specified is:',
    options: opts4(
      'the `standard` analyzer',
      'the `keyword` analyzer',
      'the `whitespace` analyzer',
      'no analyzer (text is stored verbatim)'
    ),
    correct: ['a'],
    explanation: 'The `standard` analyzer (standard tokenizer + lowercase token filter, Unicode-aware) is the default for `text` fields. `keyword` analyzer emits the whole input as one token; `whitespace` only splits on whitespace.',
    references: [REF_ANALYSIS]
  },
  {
    domain: MAPPING, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Elasticsearch text analysis components.',
    options: opts4(
      'A tokenizer splits a character stream into tokens (e.g. the `standard` tokenizer).',
      'Token filters can add, remove, or modify tokens (e.g. `lowercase`, `stop`, `synonym`).',
      'Character filters operate on the token stream after tokenization.',
      'A custom analyzer can combine char filters, one tokenizer, and multiple token filters.'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Character filters operate on the RAW character stream BEFORE tokenization, not after. Tokenizer splits into tokens; token filters transform them; a custom analyzer composes char filters + one tokenizer + token filters.',
    references: [REF_CUSTOM_ANALYZER, REF_ANALYSIS]
  },
  {
    domain: MAPPING, difficulty: 4, type: QType.SINGLE,
    stem: 'You map an analyzed `text` field but also need fast exact-match filtering on its raw value. The most storage-efficient idiomatic solution is:',
    options: opts4(
      'A multi-field: text with a `.keyword` sub-field (type keyword, ignore_above)',
      'Two completely separate indices',
      'Enabling fielddata on the text field',
      'A separate runtime script field for every query'
    ),
    correct: ['a'],
    explanation: 'A multi-field indexes the same source both as `text` and `keyword` without duplicating the source field in your documents. Enabling fielddata on text is memory-heavy and discouraged for exact match/aggregations.',
    references: [REF_MULTIFIELDS]
  },
  {
    domain: CLUSTER, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A cluster health status of `red` indicates:',
    options: opts4(
      'All shards allocated; cluster healthy.',
      'At least one PRIMARY shard is not allocated — some data is unavailable.',
      'Only replica shards are unassigned.',
      'The cluster is performing a rolling upgrade.'
    ),
    correct: ['b'],
    explanation: 'Red means at least one primary shard is unassigned, so part of the data cannot be searched or indexed. Yellow = primaries OK but some replicas unassigned; green = all assigned.',
    references: [REF_HEALTH]
  },
  {
    domain: CLUSTER, difficulty: 3, type: QType.SINGLE,
    stem: 'For querying indices that live on a SEPARATE remote Elasticsearch cluster without moving the data, you use:',
    options: opts4(
      'Cross-cluster search (configured remote clusters, query `remote:index`)',
      'A bigger single index',
      'Snapshot then restore on every query',
      'An ingest pipeline'
    ),
    correct: ['a'],
    explanation: 'Cross-cluster search registers remote clusters and lets a local cluster query them with `<remote>:<index>` notation. Snapshots/ingest pipelines do not provide federated search.',
    references: [REF_CCS]
  },
  {
    domain: DATAPROC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which ingest processor would you use to copy/rename an incoming field to a new field name before indexing?',
    options: opts4(
      'The `rename` processor',
      'The `terms` aggregation',
      'The `reindex` API',
      'The `match` query'
    ),
    correct: ['a'],
    explanation: 'The `rename` ingest processor renames a field within the document during ingest. Aggregations/queries are search-time; reindex is a bulk copy API, not an in-pipeline transform.',
    references: [REF_PROCESSORS]
  },
  {
    domain: DATAPROC, difficulty: 3, type: QType.SINGLE,
    stem: 'You want average order value bucketed per day. The correct aggregation structure is:',
    options: opts4(
      'A `date_histogram` bucket aggregation (calendar/fixed interval) with a nested `avg` metric sub-aggregation',
      'A single `avg` metric aggregation only',
      'A `terms` aggregation on the date field',
      'A pipeline aggregation with no parent'
    ),
    correct: ['a'],
    explanation: 'Bucket per day = `date_histogram` (e.g. `calendar_interval: day`); the per-bucket average is a nested `avg` sub-aggregation. A bare `avg` gives one global number; `terms` on a raw date is not time-bucketed; pipeline aggs need a parent.',
    references: [REF_AGGS]
  },
  {
    domain: INSTALL, difficulty: 2, type: QType.SINGLE,
    stem: 'Which directory does `path.logs` configure?',
    options: opts4(
      'Where Elasticsearch writes its log files',
      'Where index data is stored',
      'Where snapshots are written',
      'The install root'
    ),
    correct: ['a'],
    explanation: '`path.logs` sets the log output directory. `path.data` is index data, `path.repo` is snapshot filesystem repos, and `path.home` (ES_HOME) is the install root.',
    references: [REF_CONFIG]
  },
  {
    domain: INSTALL, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which `node.roles` makes a node capable of running machine learning jobs?',
    options: opts4(
      'node.roles: [ ml ]',
      'node.roles: [ data_ml ]',
      'node.roles: [ analytics ]',
      'node.ml.enabled: true only'
    ),
    correct: ['a'],
    explanation: 'The `ml` role designates an ML node. There is no `data_ml`/`analytics` role; `xpack.ml.enabled` is a feature toggle, but the node role keyword in `node.roles` is `ml`.',
    references: [REF_NODE]
  },
  {
    domain: INSTALL, difficulty: 3, type: QType.SINGLE,
    stem: 'Which `node.roles` value supports running transforms (pivoting data into entity-centric indices)?',
    options: opts4(
      'transform',
      'pivot',
      'data_transform',
      'aggregator'
    ),
    correct: ['a'],
    explanation: 'The `transform` role lets a node run transform jobs. `pivot` is a transform concept, not a role; `data_transform`/`aggregator` are not valid roles.',
    references: [REF_NODE]
  },
  {
    domain: INSTALL, difficulty: 2, type: QType.SINGLE,
    stem: 'After installing via the tar.gz archive, where do `elasticsearch.yml`, `jvm.options`, and `log4j2.properties` live by default?',
    options: opts4(
      'In the `config/` directory under ES_HOME',
      'In `/etc/elasticsearch` always',
      'In `path.data`',
      'In the JVM classpath only'
    ),
    correct: ['a'],
    explanation: 'For the archive distributions config files are in `$ES_HOME/config`. The package (RPM/DEB) installs place them in `/etc/elasticsearch`. They are never in `path.data`.',
    references: [REF_CONFIG]
  },
  {
    domain: INSTALL, difficulty: 3, type: QType.SINGLE,
    stem: 'Which is true about file-realm vs native-realm users in Elasticsearch security?',
    options: opts4(
      'File realm users are defined in files on each node (managed with elasticsearch-users); native realm users are stored in a system index via the API',
      'Both are stored only in elasticsearch.yml',
      'Native realm users require LDAP',
      'File realm users are stored in the keystore'
    ),
    correct: ['a'],
    explanation: 'The file realm keeps users in node-local files (managed by `bin/elasticsearch-users`); the native realm stores users in a hidden security index, managed via the user-management APIs/Kibana. Neither lives in `elasticsearch.yml` or the keystore.',
    references: [REF_SECURITY]
  },
  {
    domain: INSTALL, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'True or False: In Elasticsearch 8.x, basic authentication and TLS are part of the free Basic license.',
    options: [
      { id: 'a', text: 'True' },
      { id: 'b', text: 'False' }
    ],
    correct: ['a'],
    explanation: 'True. Since 6.8/7.1 and continuing in 8.x, core security (TLS, native realm authentication, RBAC) is included in the free Basic license; advanced features (SSO, field-level security) need a paid tier.',
    references: [REF_SECURITY]
  },
  {
    domain: INSTALL, difficulty: 3, type: QType.SINGLE,
    stem: 'Which setting controls how long a node waits to find a master before logging warnings / failing health (cluster formation timeout-related)?',
    options: opts4(
      'cluster.election.* / discovery timeouts in the discovery module',
      'http.max_content_length',
      'index.refresh_interval',
      'thread_pool.write.size'
    ),
    correct: ['a'],
    explanation: 'Discovery/election timeout settings (in the discovery module) govern master discovery/election behavior. `http.max_content_length`, `refresh_interval`, and thread pool sizing are unrelated to cluster formation.',
    references: [REF_DISCOVERY]
  },
  {
    domain: INSTALL, difficulty: 2, type: QType.SINGLE,
    stem: 'A dedicated master node should generally NOT also be a data node because:',
    options: opts4(
      'Heavy data/query load can destabilize the master and risk cluster stability',
      'Master nodes cannot store any settings',
      'It is forbidden by the API',
      'Data nodes cannot vote'
    ),
    correct: ['a'],
    explanation: 'Separating master-eligible nodes from data load keeps the cluster-coordination function stable under heavy indexing/search. It is allowed (small clusters combine roles) but discouraged at scale.',
    references: [REF_NODE]
  },
  {
    domain: INSTALL, difficulty: 3, type: QType.SINGLE,
    stem: 'Which command-line tool can be used to safely remove a node\'s persisted cluster metadata for unsafe recovery scenarios?',
    options: opts4(
      'bin/elasticsearch-node',
      'bin/elasticsearch-keystore',
      'bin/elasticsearch-certutil',
      'bin/elasticsearch-sql-cli'
    ),
    correct: ['a'],
    explanation: 'The `elasticsearch-node` tool provides unsafe cluster bootstrap/detach/repair subcommands. `keystore` handles secrets, `certutil` certs, and `sql-cli` is the SQL client.',
    references: [REF_CONFIG]
  },
  {
    domain: INDEX, difficulty: 2, type: QType.SINGLE,
    stem: 'Which API updates a dynamic index setting such as `refresh_interval`?',
    options: opts4(
      'PUT <index>/_settings',
      'PUT <index>/_mapping',
      'POST <index>/_update',
      'PUT <index>/_doc'
    ),
    correct: ['a'],
    explanation: '`PUT /<index>/_settings` updates dynamic index settings (replicas, refresh interval, blocks). `_mapping` changes fields; `_update`/`_doc` operate on documents.',
    references: [REF_INDEX_API]
  },
  {
    domain: INDEX, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Disabling refresh during a large bulk load (`index.refresh_interval: -1`) primarily:',
    options: opts4(
      'Improves indexing throughput by avoiding frequent segment creation (re-enable/refresh afterwards)',
      'Makes documents immediately searchable',
      'Permanently prevents searching the index',
      'Deletes existing documents'
    ),
    correct: ['a'],
    explanation: 'Setting `refresh_interval: -1` stops periodic refreshes, reducing segment churn and boosting bulk indexing speed. You re-enable it (or call `_refresh`) afterward so data becomes searchable. It does not delete data.',
    references: [REF_INDEX_API]
  },
  {
    domain: INDEX, difficulty: 3, type: QType.SINGLE,
    stem: 'The translog in Elasticsearch exists to:',
    options: opts4(
      'Provide durability for operations not yet committed to a Lucene segment (recovered on restart/crash)',
      'Store query results',
      'Hold the mapping',
      'Cache aggregations'
    ),
    correct: ['a'],
    explanation: 'The transaction log records indexing operations so they can be replayed after a crash before the next Lucene commit/flush. It is not for query results, mappings, or aggregation caching.',
    references: [REF_DOC_API]
  },
  {
    domain: INDEX, difficulty: 3, type: QType.SINGLE,
    stem: 'A `_flush` operation on an index:',
    options: opts4(
      'Commits in-memory/translog data to Lucene and clears the translog',
      'Makes new documents searchable (like refresh)',
      'Deletes the index',
      'Merges all segments into one'
    ),
    correct: ['a'],
    explanation: '`_flush` performs a Lucene commit and trims the translog. `_refresh` is what makes documents searchable; `_forcemerge` merges segments; flush does not delete data.',
    references: [REF_DOC_API]
  },
  {
    domain: INDEX, difficulty: 3, type: QType.SINGLE,
    stem: 'Which `op_type`/endpoint guarantees a document is only created and never overwrites an existing id?',
    options: opts4(
      'PUT <index>/_create/<id>',
      'PUT <index>/_doc/<id>',
      'POST <index>/_update/<id>',
      'POST <index>/_doc'
    ),
    correct: ['a'],
    explanation: '`PUT /<index>/_create/<id>` (equivalent to `op_type=create`) returns 409 if the id already exists, never overwriting. `_doc/<id>` overwrites; `_update` modifies; `POST /_doc` auto-generates a new id.',
    references: [REF_DOC_API]
  },
  {
    domain: INDEX, difficulty: 3, type: QType.SINGLE,
    stem: 'You want a `_reindex` to also run each document through an ingest pipeline. You specify:',
    options: opts4(
      '"dest": { "index": "...", "pipeline": "my-pipeline" }',
      '"source": { "pipeline": "my-pipeline" }',
      'A separate _ingest call after reindex',
      'It cannot be combined with a pipeline'
    ),
    correct: ['a'],
    explanation: 'Reindex applies an ingest pipeline by setting `dest.pipeline`. The pipeline runs as documents are written to the destination. There is no `source.pipeline` option.',
    references: [REF_REINDEX]
  },
  {
    domain: INDEX, difficulty: 4, type: QType.SINGLE,
    stem: 'Which `_split` precondition must hold to split an index from 2 primary shards to 6?',
    options: opts4(
      'The index must be read-only and the target shard count must be a multiple of the source count',
      'The index must be empty',
      'Replicas must be set to 0 permanently',
      'The source must first be force-merged to one segment'
    ),
    correct: ['a'],
    explanation: '`_split` requires the source index to be read-only and the target primary count to be a multiple of the original (2 → 6 is 3×). Force-merge and emptiness are not requirements; replicas need not be permanently zero.',
    references: [REF_REINDEX]
  },
  {
    domain: INDEX, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which API rolls over a write alias / data stream to a new backing index when a condition is met?',
    options: opts4(
      'POST <alias>/_rollover with conditions (max_age, max_size, max_docs)',
      'POST <index>/_split',
      'PUT <index>/_settings',
      'POST <index>/_clone'
    ),
    correct: ['a'],
    explanation: 'The Rollover API creates a new index and points the write alias/data stream at it when `max_age`/`max_primary_shard_size`/`max_docs` conditions are satisfied (ILM automates this). Split/clone/settings do not roll over.',
    references: [REF_ILM]
  },
  {
    domain: INDEX, difficulty: 3, type: QType.SINGLE,
    stem: 'Which is true about how a document update (`_update`) is implemented internally?',
    options: opts4(
      'Elasticsearch fetches the doc, applies the change, and re-indexes the whole document (Lucene docs are immutable)',
      'It mutates the Lucene segment in place',
      'It only changes the _source, not the inverted index',
      'It requires the index to be closed'
    ),
    correct: ['a'],
    explanation: 'Lucene documents are immutable; an update is a get-modify-reindex (old doc marked deleted, new one written). It does not patch segments in place and does not require closing the index.',
    references: [REF_DOC_API]
  },
  {
    domain: QUERIES, difficulty: 2, type: QType.SINGLE,
    stem: 'In a search request, which key holds the query definition?',
    options: opts4(
      '"query"',
      '"filter"',
      '"where"',
      '"match_criteria"'
    ),
    correct: ['a'],
    explanation: 'The top-level `"query"` object contains the Query DSL. There is no top-level `"filter"`/`"where"`/`"match_criteria"` key (filtering is done inside a `bool.filter`).',
    references: [REF_QDSL]
  },
  {
    domain: QUERIES, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A `range` query on a `date` field supports relative date math such as:',
    options: opts4(
      '"gte": "now-7d/d" (last 7 days, rounded to the day)',
      '"gte": "last_week"',
      '"gte": "-7"',
      '"gte": "7 days ago"'
    ),
    correct: ['a'],
    explanation: 'Elasticsearch date math uses anchors like `now` with offsets/rounding (`now-7d/d`). Natural-language strings like "last_week" or "7 days ago" are not valid date math.',
    references: [REF_TERM_QUERY]
  },
  {
    domain: QUERIES, difficulty: 3, type: QType.SINGLE,
    stem: 'You want to retrieve aggregation results WITHOUT returning any matching documents. Set:',
    options: opts4(
      '"size": 0 on the search request',
      '"track_total_hits": false',
      '"_source": true',
      '"terminate_after": 1'
    ),
    correct: ['a'],
    explanation: '`"size": 0` returns aggregations only with no hits, saving fetch cost. `track_total_hits` only affects the total count accuracy; `terminate_after` early-stops collection (skewing aggs).',
    references: [REF_AGGS]
  },
  {
    domain: QUERIES, difficulty: 3, type: QType.SINGLE,
    stem: 'By default Elasticsearch reports `hits.total` as `"relation": "gte"` and caps the exact count at 10,000. To get an exact total you set:',
    options: opts4(
      '"track_total_hits": true',
      '"size": 10001',
      '"from": 10000',
      '"explain": true'
    ),
    correct: ['a'],
    explanation: '`track_total_hits: true` forces an exact total hit count (at extra cost) instead of the default 10,000 lower-bound. Changing `size`/`from`/`explain` does not change total-hit tracking.',
    references: [REF_QDSL]
  },
  {
    domain: QUERIES, difficulty: 3, type: QType.SINGLE,
    stem: 'A `terms` query with 200 values is generally preferable to 200 `should` `term` clauses because:',
    options: opts4(
      'It is more concise and efficient for matching any of many exact values',
      'It analyzes the input',
      'It contributes more to scoring',
      'It supports phrase matching'
    ),
    correct: ['a'],
    explanation: 'A single `terms` query expresses "match any of these exact values" concisely and efficiently. Like `term`, it does not analyze input and is typically used in filter context; it is not a phrase/scoring construct.',
    references: [REF_TERM_QUERY]
  },
  {
    domain: QUERIES, difficulty: 4, type: QType.SINGLE,
    stem: 'A `match_phrase_prefix` query is appropriate for:',
    options: opts4(
      '"Search as you type" where the last term is treated as a prefix and earlier terms must form a phrase',
      'Exact keyword matching',
      'Numeric range filtering',
      'Aggregating by term'
    ),
    correct: ['a'],
    explanation: '`match_phrase_prefix` matches the leading terms as a phrase and the final term as a prefix — useful for live phrase autocompletion. It is not for exact keyword, ranges, or aggregations.',
    references: [REF_FULLTEXT]
  },
  {
    domain: QUERIES, difficulty: 3, type: QType.SINGLE,
    stem: 'Within a `match_phrase` query, the `slop` parameter controls:',
    options: opts4(
      'How many position moves are allowed between terms (tolerance for word order/gaps)',
      'Fuzziness for spelling',
      'The number of results',
      'The boost factor'
    ),
    correct: ['a'],
    explanation: '`slop` allows terms to be reordered/separated by up to N positions while still matching the phrase. Spelling tolerance is `fuzziness`; `slop` is positional, not a result limit or boost.',
    references: [REF_FULLTEXT]
  },
  {
    domain: QUERIES, difficulty: 3, type: QType.SINGLE,
    stem: 'Which compound query lets you take the single best-scoring sub-query among several, with optional tie-breaking?',
    options: opts4(
      'dis_max',
      'bool with all in must',
      'constant_score',
      'boosting'
    ),
    correct: ['a'],
    explanation: '`dis_max` returns documents matching any sub-query and scores by the highest single sub-query score (plus `tie_breaker`). `bool/must` sums scores; `constant_score` flattens; `boosting` demotes.',
    references: [REF_QDSL]
  },
  {
    domain: QUERIES, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'To run several independent searches in one HTTP round trip, use:',
    options: opts4(
      'The Multi Search API (_msearch) with NDJSON header/body pairs',
      'A single _search with multiple query keys',
      '_mget',
      '_bulk'
    ),
    correct: ['a'],
    explanation: '`_msearch` accepts newline-delimited header/body pairs and runs multiple searches in one request. `_mget` fetches docs by id; `_bulk` is for writes; a `_search` body has only one `query`.',
    references: [REF_QDSL]
  },
  {
    domain: MAPPING, difficulty: 2, type: QType.SINGLE,
    stem: 'Which field type stores true/false values?',
    options: opts4(
      'boolean',
      'keyword',
      'byte',
      'flag'
    ),
    correct: ['a'],
    explanation: 'The `boolean` field type stores true/false (also accepting "true"/"false" strings). `keyword`/`byte` are string/numeric; there is no `flag` type.',
    references: [REF_FIELD_TYPES]
  },
  {
    domain: MAPPING, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Why are `text` fields generally NOT directly usable in a `terms` aggregation?',
    options: opts4(
      'Aggregating on analyzed text requires fielddata (heap-heavy) which is disabled by default; use a `.keyword` sub-field instead',
      'text fields are not indexed',
      'Aggregations only work on numbers',
      'text fields have no doc values and cannot be aggregated at all under any circumstance'
    ),
    correct: ['a'],
    explanation: 'Aggregating analyzed `text` needs in-heap fielddata (default disabled to protect the heap). The idiomatic fix is to aggregate on the `keyword` multi-field, which uses doc values. (Fielddata can be enabled but is discouraged.)',
    references: [REF_FIELD_TYPES]
  },
  {
    domain: MAPPING, difficulty: 3, type: QType.SINGLE,
    stem: 'Which numeric type is the most space-efficient choice for a value that is always 0–255?',
    options: opts4(
      'byte',
      'long',
      'double',
      'keyword'
    ),
    correct: ['a'],
    explanation: 'A `byte` covers -128..127... but for 0–255 the smallest practical fits are `short`/`byte`; among the options `byte` is the most compact numeric (vs the 8-byte `long`/`double`). `keyword` is a string, not numeric.',
    references: [REF_FIELD_TYPES]
  },
  {
    domain: MAPPING, difficulty: 3, type: QType.SINGLE,
    stem: 'Which mapping setting disables dynamic field detection so unknown fields are stored in `_source` but not indexed?',
    options: opts4(
      '"dynamic": false',
      '"dynamic": "strict"',
      '"enabled": false',
      '"index": false'
    ),
    correct: ['a'],
    explanation: '`dynamic: false` keeps unknown fields in `_source` but does not index them (no errors). `dynamic: strict` rejects them; `enabled: false` disables an object entirely; `index: false` applies per existing field.',
    references: [REF_MAPPING]
  },
  {
    domain: MAPPING, difficulty: 3, type: QType.SINGLE,
    stem: 'Setting `"enabled": false` on an object field means:',
    options: opts4(
      'The object is stored in _source but not parsed/indexed at all (not searchable/aggregatable)',
      'The whole index is disabled',
      'The field is deleted',
      'The field becomes a runtime field'
    ),
    correct: ['a'],
    explanation: '`enabled: false` tells Elasticsearch to store the object in `_source` without indexing its contents — useful for metadata blobs you only retrieve. It does not delete data or affect the rest of the index.',
    references: [REF_MAPPING]
  },
  {
    domain: MAPPING, difficulty: 3, type: QType.SINGLE,
    stem: 'The `lowercase` token filter is applied:',
    options: opts4(
      'After the tokenizer, lowercasing each token',
      'Before the tokenizer, on raw characters',
      'As the tokenizer itself',
      'Only at query time'
    ),
    correct: ['a'],
    explanation: '`lowercase` is a token filter operating on tokens produced by the tokenizer. Lowercasing raw characters before tokenization would be a char filter; the `lowercase` tokenizer is a separate component.',
    references: [REF_CUSTOM_ANALYZER]
  },
  {
    domain: MAPPING, difficulty: 2, type: QType.SINGLE,
    stem: 'Which API simulates how an analyzer/custom chain tokenizes text, returning token text, position, and offsets?',
    options: opts4(
      'POST <index>/_analyze',
      'GET <index>/_mapping',
      'POST <index>/_validate/query',
      'GET _cat/analyzers'
    ),
    correct: ['a'],
    explanation: 'The Analyze API returns the produced tokens (with positions/offsets/types) for given text and an analyzer or explicit char_filter/tokenizer/filter chain. `_mapping`/`_validate/query`/`_cat/analyzers` do not do this.',
    references: [REF_ANALYZE]
  },
  {
    domain: MAPPING, difficulty: 3, type: QType.SINGLE,
    stem: 'A `stemmer` token filter (e.g. English stemmer) does what?',
    options: opts4(
      'Reduces words to a root form (e.g. "running" → "run") so variants match',
      'Removes stop words',
      'Splits on whitespace',
      'Strips HTML'
    ),
    correct: ['a'],
    explanation: 'A stemmer normalizes inflected words to a common stem, improving recall (e.g. "runs/running/ran" → "run"). Stop-word removal is `stop`, whitespace splitting is a tokenizer, HTML stripping is `html_strip`.',
    references: [REF_CUSTOM_ANALYZER]
  },
  {
    domain: MAPPING, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'You need exact, case-INSENSITIVE matching of email addresses. The best mapping is:',
    options: opts4(
      'A `keyword` field with a `normalizer` that applies a `lowercase` filter',
      'A `text` field with the standard analyzer',
      'A `keyword` field with no normalizer',
      'A runtime field that lowercases at query time only'
    ),
    correct: ['a'],
    explanation: 'A `keyword` field plus a lowercase `normalizer` indexes one normalized token, giving exact case-insensitive matching/aggregation. Plain `keyword` is case-sensitive; `text` tokenizes (splitting the address); a runtime field is slower per query.',
    references: [REF_ANALYSIS]
  },
  {
    domain: CLUSTER, difficulty: 2, type: QType.SINGLE,
    stem: 'Which API shows shard recovery progress (bytes/percent) for indices being relocated or restored?',
    options: opts4(
      'GET _cat/recovery?v (or <index>/_recovery)',
      'GET _cat/health?v',
      'GET _cluster/settings',
      'GET _nodes/hot_threads'
    ),
    correct: ['a'],
    explanation: '`_cat/recovery` / `<index>/_recovery` report ongoing shard recovery progress. `_cat/health` is a summary, `_cluster/settings` shows config, `hot_threads` profiles CPU.',
    references: [REF_HEALTH]
  },
  {
    domain: CLUSTER, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A searchable snapshot allows you to:',
    options: opts4(
      'Mount snapshot data as a (cold/frozen) index and search it without fully restoring it to local disk',
      'Search while taking the snapshot',
      'Convert a snapshot into an ingest pipeline',
      'Replicate a snapshot to another cluster automatically'
    ),
    correct: ['a'],
    explanation: 'Searchable snapshots mount snapshot-backed indices (cold/frozen tiers) so data is queryable while residing primarily in the repository, cutting local storage cost. It is not about taking snapshots concurrently or CCR.',
    references: [REF_SNAPSHOT]
  },
  {
    domain: CLUSTER, difficulty: 3, type: QType.SINGLE,
    stem: 'Which ILM action in the warm/cold phase reduces the number of primary shards of an index?',
    options: opts4(
      'shrink',
      'rollover',
      'allocate',
      'set_priority'
    ),
    correct: ['a'],
    explanation: 'The `shrink` action reduces primary shard count for older indices. `rollover` (hot) starts a new index, `allocate` moves/changes replicas/tiering, `set_priority` orders recovery.',
    references: [REF_ILM]
  },
  {
    domain: CLUSTER, difficulty: 3, type: QType.SINGLE,
    stem: 'The ILM `allocate` action is commonly used to:',
    options: opts4(
      'Move an index to a different data tier/node attribute and/or change its replica count as it ages',
      'Delete the index',
      'Roll over to a new index',
      'Force-merge segments'
    ),
    correct: ['a'],
    explanation: 'The `allocate` action reassigns shards (e.g. to warm/cold nodes via allocation attributes) and can change `number_of_replicas`. Deletion is `delete`, rollover is `rollover`, segment merge is `forcemerge`.',
    references: [REF_ILM]
  },
  {
    domain: DATAPROC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which aggregation buckets numeric values into fixed-width intervals (e.g. every 10 units)?',
    options: opts4(
      'histogram',
      'terms',
      'avg',
      'cardinality'
    ),
    correct: ['a'],
    explanation: 'The `histogram` bucket aggregation groups numeric values into fixed `interval`-width buckets (`date_histogram` is its time variant). `terms` buckets by distinct value; `avg`/`cardinality` are metrics.',
    references: [REF_AGGS]
  },
  {
    domain: DATAPROC, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A `filters` (plural) aggregation lets you:',
    options: opts4(
      'Define multiple named buckets, each based on its own query/filter',
      'Filter the query before searching',
      'Remove a field',
      'Compute an average'
    ),
    correct: ['a'],
    explanation: 'The `filters` aggregation creates one bucket per supplied named filter (plus an optional "other" bucket) — handy for categorizing docs by arbitrary conditions. It is not a query-level filter or a metric.',
    references: [REF_AGGS]
  },
  {
    domain: DATAPROC, difficulty: 3, type: QType.SINGLE,
    stem: 'Which ingest processor conditionally runs another processor only when a script/condition is true?',
    options: opts4(
      'Using the `if` parameter on a processor (painless condition)',
      'The `terms` aggregation',
      'The `bool` query',
      'The `reindex` API'
    ),
    correct: ['a'],
    explanation: 'Any ingest processor can take an `if` condition (a Painless expression) so it executes only when the condition holds. Aggregations/queries are search-time; reindex is a bulk copy, not conditional logic.',
    references: [REF_PROCESSORS]
  },
  {
    domain: DATAPROC, difficulty: 3, type: QType.SINGLE,
    stem: 'The `script` ingest processor is used to:',
    options: opts4(
      'Run a Painless script to compute or transform fields during ingest',
      'Run a search-time aggregation',
      'Define an analyzer',
      'Schedule a snapshot'
    ),
    correct: ['a'],
    explanation: 'The `script` processor executes Painless against the document at ingest time (e.g. derive fields). It is not a search aggregation, analyzer, or snapshot mechanism.',
    references: [REF_PROCESSORS]
  },
  {
    domain: DATAPROC, difficulty: 3, type: QType.SINGLE,
    stem: 'A `significant_terms` aggregation surfaces:',
    options: opts4(
      'Terms that are unusually frequent in the query result set compared to the background corpus',
      'The most frequent terms overall only',
      'A moving average',
      'Distinct value counts'
    ),
    correct: ['a'],
    explanation: '`significant_terms` finds terms over-represented in the foreground (matching) set relative to the background, highlighting "interesting" terms. Plain `terms` shows raw frequency; cardinality counts distinct values.',
    references: [REF_AGGS]
  }
];

const ELASTIC_DOMAINS = [
  { name: INSTALL, weight: 20 },
  { name: INDEX, weight: 20 },
  { name: QUERIES, weight: 20 },
  { name: MAPPING, weight: 20 },
  { name: CLUSTER, weight: 10 },
  { name: DATAPROC, weight: 10 }
];

const ELASTIC_EXAMS: { slug: string; code: string; titleSuffix: string; descriptionSuffix: string; questions: Q[] }[] = [
  {
    slug: 'elastic-certified-engineer-p1',
    code: 'ECE-P1',
    titleSuffix: 'Practice Exam 1',
    descriptionSuffix: 'Practice exam 1 of 3 — full 180-minute, 65-question, blueprint-weighted set covering installation & configuration, indexing data, queries, mappings & text analysis, cluster administration, and data processing & aggregations on Elasticsearch 8.x.',
    questions: P1
  },
  {
    slug: 'elastic-certified-engineer-p2',
    code: 'ECE-P2',
    titleSuffix: 'Practice Exam 2',
    descriptionSuffix: 'Practice exam 2 of 3 — a second 180-minute, 65-question, blueprint-weighted set.',
    questions: P2
  },
  {
    slug: 'elastic-certified-engineer-p3',
    code: 'ECE-P3',
    titleSuffix: 'Practice Exam 3',
    descriptionSuffix: 'Practice exam 3 of 3 — a third 180-minute, 65-question, blueprint-weighted set.',
    questions: P3
  }
];

const ELASTIC_BUNDLE = {
  slug: 'elastic-certified-engineer',
  title: 'Elastic Certified Engineer',
  description: 'All 3 Elastic Certified Engineer practice exams in one bundle — covering installation & configuration, indexing data, queries, mappings & text analysis, cluster administration, and data processing & aggregations, aligned to the Elastic Certified Engineer exam objectives on Elasticsearch 8.x.',
  price: 2000, // USD 20 — PRACTICE tier
  priceVoucher: 40000 // USD 400 — VOUCHER tier (matches Elastic Certified Engineer real-exam fee)
};

type SeedResult = {
  vendor: 'created' | 'updated';
  exams: { slug: string; questionCount: number; teaserCount: number }[];
  bundle: 'created' | 'updated';
};

/**
 * Idempotent seed for the Elastic Certified Engineer bundle. Safe to call
 * repeatedly — vendor / exam / bundle rows are upserted, and questions
 * tagged `generatedBy: 'manual:elastic-seed'` are deleted and re-created.
 *
 * Pass an existing PrismaClient (lifecycle managed by caller).
 */
export async function seedElastic(db: PrismaClient): Promise<SeedResult> {
  const existingVendor = await db.vendor.findUnique({ where: { slug: 'elastic' } });
  await db.vendor.upsert({
    where: { slug: 'elastic' },
    update: { name: 'Elastic', description: 'Elastic certifications — Elasticsearch, Kibana, the Elastic Stack, and the Elastic Certified Engineer credential.' },
    create: { slug: 'elastic', name: 'Elastic', description: 'Elastic certifications — Elasticsearch, Kibana, the Elastic Stack, and the Elastic Certified Engineer credential.' }
  });
  const vendor = await db.vendor.findUniqueOrThrow({ where: { slug: 'elastic' } });

  const examResults: SeedResult['exams'] = [];
  const examIds: Record<string, string> = {};

  for (const e of ELASTIC_EXAMS) {
    const title = `Elastic Certified Engineer — ${e.titleSuffix}`;
    const description = `${e.descriptionSuffix} Aligned to the Elastic Certified Engineer exam objectives.`;
    const examData = {
      title,
      code: e.code,
      description,
      level: 'Professional',
      durationMinutes: 180,
      passingScore: 70,
      questionCount: e.questions.length,
      domains: ELASTIC_DOMAINS,
      published: true
    };
    const exam = await db.exam.upsert({
      where: { slug: e.slug },
      update: examData,
      create: { ...examData, slug: e.slug, vendorId: vendor.id }
    });
    examIds[e.slug] = exam.id;

    await db.question.deleteMany({ where: { examId: exam.id, generatedBy: 'manual:elastic-seed' } });
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
          generatedBy: 'manual:elastic-seed',
          isTeaser: !!q.isTeaser
        }
      });
      if (q.isTeaser) teaserCount++;
    }
    examResults.push({ slug: e.slug, questionCount: e.questions.length, teaserCount });
  }

  const existingBundle = await db.bundle.findUnique({ where: { slug: ELASTIC_BUNDLE.slug } });
  const bundle = await db.bundle.upsert({
    where: { slug: ELASTIC_BUNDLE.slug },
    update: {
      title: ELASTIC_BUNDLE.title,
      description: ELASTIC_BUNDLE.description,
      price: ELASTIC_BUNDLE.price,
      priceVoucher: ELASTIC_BUNDLE.priceVoucher,
      published: true
    },
    create: {
      slug: ELASTIC_BUNDLE.slug,
      title: ELASTIC_BUNDLE.title,
      description: ELASTIC_BUNDLE.description,
      price: ELASTIC_BUNDLE.price,
      priceVoucher: ELASTIC_BUNDLE.priceVoucher,
      published: true
    }
  });

  // Replace bundle items deterministically: drop existing, recreate.
  await db.bundleItem.deleteMany({ where: { bundleId: bundle.id } });
  const items = [
    { examSlug: 'elastic-certified-engineer-p1', tier: 'PRACTICE' as const, position: 1 },
    { examSlug: 'elastic-certified-engineer-p2', tier: 'PRACTICE' as const, position: 2 },
    { examSlug: 'elastic-certified-engineer-p3', tier: 'PRACTICE' as const, position: 3 },
    { examSlug: 'elastic-certified-engineer-p1', tier: 'VOUCHER' as const, position: 4 }
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
