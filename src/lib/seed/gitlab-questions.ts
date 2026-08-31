/**
 * GitLab Certified Associate bundle seed — vendor, three practice-exam
 * variants, bundle, and 195 blueprint-aligned questions. Idempotent:
 * replaces rows tagged `generatedBy: 'manual:gitlab-seed'` and upserts
 * catalog rows.
 *
 * Exported as `seedGitlab(db)` so the same code path is reachable from
 * the standalone CLI shim (`prisma/seeds/gitlab.ts`) and the protected
 * admin API (`/api/admin/seed-gitlab`) — letting us bootstrap the
 * production database without redeploying.
 *
 * Question content is authored against the public GitLab documentation
 * and the GitLab Certified Associate curriculum:
 *   - Git and GitLab Fundamentals                — 20% (4)
 *   - Source Code Management and Workflows        — 20% (4)
 *   - CI/CD Pipelines                             — 30% (6)
 *   - Project Management and Collaboration        — 15% (3)
 *   - Security and Compliance Basics              — 15% (3)
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

const FUND = 'Git and GitLab Fundamentals';
const SCM = 'Source Code Management and Workflows';
const CICD = 'CI/CD Pipelines';
const PM = 'Project Management and Collaboration';
const SEC = 'Security and Compliance Basics';

const REF_GIT_BASICS = { label: 'GitLab Docs — Git basics', url: 'https://docs.gitlab.com/ee/topics/git/' };
const REF_GIT_COMMIT = { label: 'GitLab Docs — Commit changes to Git', url: 'https://docs.gitlab.com/ee/topics/git/commit.html' };
const REF_GIT_STASH = { label: 'GitLab Docs — Git stash', url: 'https://docs.gitlab.com/ee/topics/git/stash.html' };
const REF_GIT_REBASE = { label: 'GitLab Docs — Git rebase', url: 'https://docs.gitlab.com/ee/topics/git/git_rebase.html' };
const REF_GIT_TAGS = { label: 'GitLab Docs — Tags', url: 'https://docs.gitlab.com/ee/user/project/repository/tags/' };
const REF_PROJECTS = { label: 'GitLab Docs — Projects', url: 'https://docs.gitlab.com/ee/user/project/' };
const REF_GROUPS = { label: 'GitLab Docs — Groups', url: 'https://docs.gitlab.com/ee/user/group/' };
const REF_SUBGROUPS = { label: 'GitLab Docs — Subgroups', url: 'https://docs.gitlab.com/ee/user/group/subgroups/' };
const REF_FORK = { label: 'GitLab Docs — Fork a project', url: 'https://docs.gitlab.com/ee/user/project/repository/forking_workflow.html' };
const REF_PROTECTED = { label: 'GitLab Docs — Protected branches', url: 'https://docs.gitlab.com/ee/user/project/protected_branches.html' };
const REF_MR = { label: 'GitLab Docs — Merge requests', url: 'https://docs.gitlab.com/ee/user/project/merge_requests/' };
const REF_MR_APPROVALS = { label: 'GitLab Docs — Merge request approvals', url: 'https://docs.gitlab.com/ee/user/project/merge_requests/approvals/' };
const REF_MR_METHODS = { label: 'GitLab Docs — Merge methods', url: 'https://docs.gitlab.com/ee/user/project/merge_requests/methods/' };
const REF_MWPS = { label: 'GitLab Docs — Merge when pipeline succeeds', url: 'https://docs.gitlab.com/ee/user/project/merge_requests/auto_merge.html' };
const REF_DRAFT = { label: 'GitLab Docs — Draft merge requests', url: 'https://docs.gitlab.com/ee/user/project/merge_requests/drafts.html' };
const REF_ISSUES = { label: 'GitLab Docs — Issues', url: 'https://docs.gitlab.com/ee/user/project/issues/' };
const REF_LABELS = { label: 'GitLab Docs — Labels', url: 'https://docs.gitlab.com/ee/user/project/labels.html' };
const REF_MILESTONES = { label: 'GitLab Docs — Milestones', url: 'https://docs.gitlab.com/ee/user/project/milestones/' };
const REF_EPICS = { label: 'GitLab Docs — Epics', url: 'https://docs.gitlab.com/ee/user/group/epics/' };
const REF_BOARDS = { label: 'GitLab Docs — Issue boards', url: 'https://docs.gitlab.com/ee/user/project/issue_board.html' };
const REF_CI_INTRO = { label: 'GitLab Docs — CI/CD', url: 'https://docs.gitlab.com/ee/ci/' };
const REF_CI_YAML = { label: 'GitLab Docs — .gitlab-ci.yml keyword reference', url: 'https://docs.gitlab.com/ee/ci/yaml/' };
const REF_CI_STAGES = { label: 'GitLab Docs — CI/CD stages', url: 'https://docs.gitlab.com/ee/ci/yaml/#stages' };
const REF_CI_RULES = { label: 'GitLab Docs — CI/CD rules', url: 'https://docs.gitlab.com/ee/ci/yaml/#rules' };
const REF_CI_NEEDS = { label: 'GitLab Docs — needs / DAG pipelines', url: 'https://docs.gitlab.com/ee/ci/yaml/needs.html' };
const REF_CI_ARTIFACTS = { label: 'GitLab Docs — Job artifacts', url: 'https://docs.gitlab.com/ee/ci/jobs/job_artifacts.html' };
const REF_CI_CACHE = { label: 'GitLab Docs — Caching in CI/CD', url: 'https://docs.gitlab.com/ee/ci/caching/' };
const REF_CI_VARS = { label: 'GitLab Docs — CI/CD variables', url: 'https://docs.gitlab.com/ee/ci/variables/' };
const REF_CI_ENV = { label: 'GitLab Docs — Environments and deployments', url: 'https://docs.gitlab.com/ee/ci/environments/' };
const REF_CI_INCLUDE = { label: 'GitLab Docs — include', url: 'https://docs.gitlab.com/ee/ci/yaml/includes.html' };
const REF_CI_PARENT_CHILD = { label: 'GitLab Docs — Parent-child pipelines', url: 'https://docs.gitlab.com/ee/ci/pipelines/downstream_pipelines.html' };
const REF_RUNNERS = { label: 'GitLab Docs — GitLab Runner', url: 'https://docs.gitlab.com/runner/' };
const REF_EXECUTORS = { label: 'GitLab Docs — Runner executors', url: 'https://docs.gitlab.com/runner/executors/' };
const REF_REGISTRY = { label: 'GitLab Docs — Container Registry', url: 'https://docs.gitlab.com/ee/user/packages/container_registry/' };
const REF_PAGES = { label: 'GitLab Docs — GitLab Pages', url: 'https://docs.gitlab.com/ee/user/project/pages/' };
const REF_PERMISSIONS = { label: 'GitLab Docs — Roles and permissions', url: 'https://docs.gitlab.com/ee/user/permissions.html' };
const REF_SAST = { label: 'GitLab Docs — SAST', url: 'https://docs.gitlab.com/ee/user/application_security/sast/' };
const REF_SECRET = { label: 'GitLab Docs — Secret detection', url: 'https://docs.gitlab.com/ee/user/application_security/secret_detection/' };
const REF_DEPSCAN = { label: 'GitLab Docs — Dependency scanning', url: 'https://docs.gitlab.com/ee/user/application_security/dependency_scanning/' };
const REF_COMPLIANCE = { label: 'GitLab Docs — Compliance', url: 'https://docs.gitlab.com/ee/administration/compliance.html' };
const REF_AUDIT = { label: 'GitLab Docs — Audit events', url: 'https://docs.gitlab.com/ee/administration/audit_events.html' };
const REF_GITLAB_FLOW = { label: 'GitLab Docs — GitLab Flow', url: 'https://docs.gitlab.com/ee/topics/gitlab_flow.html' };

// Helper to build 4-option SINGLE questions with id 'a','b','c','d'.
const opts4 = (a: string, b: string, c: string, d: string): Opt[] => [
  { id: 'a', text: a }, { id: 'b', text: b }, { id: 'c', text: c }, { id: 'd', text: d }
];

// ───────────────────── Practice Exam 1 ─────────────────────
const P1: Q[] = [
  // ── Git and GitLab Fundamentals (4) ──
  {
    domain: FUND, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Git command creates a local copy of a remote repository, including its full history and working tree?',
    options: opts4(
      'git pull',
      'git clone <url>',
      'git fetch <url>',
      'git init <url>'
    ),
    correct: ['b'],
    explanation: '`git clone <url>` downloads the entire repository, history, and checks out the default branch. `git pull` updates an existing clone, `git fetch` only downloads objects/refs without merging, and `git init` creates a new empty repo (it takes a directory, not a URL).',
    references: [REF_GIT_BASICS]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'You modified three tracked files but want to commit only one of them. Which sequence stages just `app.py` and records the commit?',
    options: opts4(
      'git commit app.py -m "fix"',
      'git add app.py && git commit -m "fix"',
      'git stage --all && git commit -m "fix"',
      'git commit -a -m "fix"'
    ),
    correct: ['b'],
    explanation: '`git add app.py` stages only that file, then `git commit -m` records the staged snapshot. `git commit -a` would commit all modified tracked files, and `git stage --all` stages everything.',
    references: [REF_GIT_COMMIT]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You have uncommitted local changes but need to switch branches quickly without committing. Which command shelves the changes for later restoration?',
    options: opts4(
      'git reset --hard',
      'git stash',
      'git checkout -- .',
      'git clean -fd'
    ),
    correct: ['b'],
    explanation: '`git stash` saves modified tracked files and staged changes to a stack, restoring a clean working tree; `git stash pop` reapplies them. `git reset --hard` and `git checkout -- .` discard changes permanently, and `git clean -fd` deletes untracked files.',
    references: [REF_GIT_STASH]
  },
  {
    domain: FUND, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'True or False: `git rebase` rewrites commit history by reapplying commits onto a new base, which can change commit SHAs.',
    options: [
      { id: 'a', text: 'True' },
      { id: 'b', text: 'False' }
    ],
    correct: ['a'],
    explanation: 'True. Rebasing replays a branch\'s commits onto a different base commit, producing new commit objects with new SHAs. This is why rebasing shared/published branches is discouraged — it diverges history for collaborators.',
    references: [REF_GIT_REBASE]
  },

  // ── Source Code Management and Workflows (4) ──
  {
    domain: SCM, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'In GitLab Flow, what is the recommended relationship between feature branches and the main branch?',
    options: opts4(
      'Feature branches are created from main and merged back via merge request after review.',
      'Feature branches are committed to directly on production servers.',
      'Feature work is committed straight to main without branches.',
      'Each developer maintains a permanent personal copy of main that is never merged.'
    ),
    correct: ['a'],
    explanation: 'GitLab Flow uses short-lived feature branches branched off main, integrated back through merge requests after review and CI. Committing directly to main or to production bypasses review and pipeline validation.',
    references: [REF_GITLAB_FLOW]
  },
  {
    domain: SCM, difficulty: 2, type: QType.SINGLE,
    stem: 'A protected branch in GitLab, by default, prevents which action for users below the configured push role?',
    options: opts4(
      'Viewing the branch in the repository',
      'Pushing commits directly and force-pushing to that branch',
      'Creating issues that reference the branch',
      'Cloning the repository'
    ),
    correct: ['b'],
    explanation: 'Protected branches restrict who can push and merge, and block force pushes by default, so changes must flow through merge requests. They do not affect read access, cloning, or issue creation.',
    references: [REF_PROTECTED]
  },
  {
    domain: SCM, difficulty: 3, type: QType.SINGLE,
    stem: 'You want to contribute to a project where you lack push access. Which GitLab workflow lets you propose changes from your own copy?',
    options: opts4(
      'Clone the project and push a new branch to the original repository',
      'Fork the project, push to your fork, then open a merge request to the upstream project',
      'Open an issue and attach a patch file',
      'Request the Owner role on the upstream project'
    ),
    correct: ['b'],
    explanation: 'The fork workflow creates a server-side copy you control; you push branches there and open a merge request targeting the upstream project. You cannot push branches to a repo you lack access to, and issues are not a code-contribution mechanism.',
    references: [REF_FORK]
  },
  {
    domain: SCM, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Git command creates an annotated tag `v1.0.0` on the current commit?',
    options: opts4(
      'git tag v1.0.0',
      'git tag -a v1.0.0 -m "Release 1.0.0"',
      'git branch v1.0.0',
      'git commit --tag v1.0.0'
    ),
    correct: ['b'],
    explanation: '`git tag -a <name> -m <msg>` creates an annotated tag (a full object with tagger, date, and message). `git tag v1.0.0` alone creates a lightweight tag, and `git branch` creates a branch, not a tag.',
    references: [REF_GIT_TAGS]
  },

  // ── CI/CD Pipelines (6) ──
  {
    domain: CICD, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'By default, what is the file name and location GitLab looks for to define a project\'s CI/CD pipeline?',
    options: opts4(
      '.gitlab-ci.yml in the repository root',
      'ci/pipeline.yaml in the repository root',
      '.gitlab/config.yml in the project',
      'gitlab-pipeline.json in the repository root'
    ),
    correct: ['a'],
    explanation: 'GitLab reads the pipeline definition from `.gitlab-ci.yml` in the repository root by default (the path is configurable in project settings). The other paths are not GitLab defaults.',
    references: [REF_CI_INTRO, REF_CI_YAML]
  },
  {
    domain: CICD, difficulty: 2, type: QType.SINGLE,
    stem: 'In `.gitlab-ci.yml`, jobs that belong to the same `stage` behave how relative to each other?',
    options: opts4(
      'They run sequentially in the order written',
      'They run in parallel, and the next stage starts only after all jobs in the current stage succeed',
      'Only the first job in the stage runs; the rest are skipped',
      'They each trigger a separate pipeline'
    ),
    correct: ['b'],
    explanation: 'Jobs in the same stage run in parallel (subject to runner availability). The pipeline advances to the next stage only when every job in the current stage passes (unless `allow_failure` is set).',
    references: [REF_CI_STAGES]
  },
  {
    domain: CICD, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about `artifacts` and `cache` in GitLab CI/CD.',
    options: opts4(
      'artifacts are uploaded to GitLab and can be passed to jobs in later stages and downloaded from the UI.',
      'cache is intended to speed up jobs by reusing files (e.g. dependencies) between pipeline runs and is best-effort.',
      'cache is guaranteed to always be available and is the correct way to pass build outputs between stages.',
      'artifacts have a configurable expiry via expire_in.'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Artifacts are stored by GitLab, passed downstream, downloadable, and can expire via `expire_in`. Cache is a best-effort optimization for reuse between runs and is NOT guaranteed; build outputs that must reach later stages should use artifacts, not cache.',
    references: [REF_CI_ARTIFACTS, REF_CI_CACHE]
  },
  {
    domain: CICD, difficulty: 3, type: QType.SINGLE,
    stem: 'You want a `deploy` job to start as soon as its `build` job finishes, without waiting for other jobs in the build stage. Which keyword expresses this dependency?',
    options: opts4(
      'only: [build]',
      'needs: [build]',
      'dependencies: build',
      'when: on_success'
    ),
    correct: ['b'],
    explanation: '`needs` creates a directed acyclic graph (DAG): a job runs as soon as its listed `needs` jobs complete, ignoring stage ordering. `dependencies` only controls which artifacts are downloaded; `only` controls job inclusion; `when` controls run conditions.',
    references: [REF_CI_NEEDS]
  },
  {
    domain: CICD, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which modern keyword should be used to control whether a job is added to a pipeline based on conditions such as branch name or changed files?',
    options: opts4(
      'rules',
      'tags',
      'environment',
      'services'
    ),
    correct: ['a'],
    explanation: '`rules` is the recommended mechanism to include/exclude jobs conditionally (it supersedes `only`/`except`). `tags` selects runners, `environment` declares a deployment target, and `services` attaches helper containers.',
    references: [REF_CI_RULES]
  },
  {
    domain: CICD, difficulty: 3, type: QType.SINGLE,
    stem: 'A job specifies `tags: [docker]`. What does this control?',
    options: opts4(
      'Which Git tag the job builds from',
      'That the job only runs for tagged releases',
      'That the job runs only on runners that have the matching `docker` tag',
      'The Docker image used to run the job'
    ),
    correct: ['c'],
    explanation: 'Job `tags` are matched against runner tags so the job is picked up only by runners registered with those tags. Git tag pipelines use `rules`/`CI_COMMIT_TAG`; the job\'s container is set with `image`.',
    references: [REF_RUNNERS, REF_CI_YAML]
  },

  // ── Project Management and Collaboration (3) ──
  {
    domain: PM, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'In a merge request description or commit message, which phrase automatically closes issue #42 when the change merges to the default branch?',
    options: opts4(
      'See #42',
      'Closes #42',
      'Related to #42',
      'Mentions #42'
    ),
    correct: ['b'],
    explanation: 'GitLab recognizes closing keywords such as `Closes #42` (also Fixes/Resolves) in MR descriptions and commit messages; merging to the default branch closes the referenced issue. "See" / "Related to" only create cross-links.',
    references: [REF_ISSUES, REF_MR]
  },
  {
    domain: PM, difficulty: 2, type: QType.SINGLE,
    stem: 'A team wants a Kanban-style view where dragging an issue between columns changes its labels. Which GitLab feature provides this?',
    options: opts4(
      'Milestones',
      'Issue boards',
      'Epics',
      'Snippets'
    ),
    correct: ['b'],
    explanation: 'Issue boards present issues in label/list columns; moving a card between lists updates the issue\'s labels. Milestones group work by time/scope, epics group issues across projects, and snippets store shareable code.',
    references: [REF_BOARDS, REF_LABELS]
  },
  {
    domain: PM, difficulty: 2, type: QType.SINGLE,
    stem: 'Which GitLab object groups multiple related issues that may span several projects into a single higher-level deliverable?',
    options: opts4(
      'Label',
      'Milestone',
      'Epic',
      'Tag'
    ),
    correct: ['c'],
    explanation: 'Epics (a group-level feature) collect issues across projects under one initiative. Labels categorize, milestones track a scoped/time-boxed set of work, and Git tags mark commits.',
    references: [REF_EPICS]
  },

  // ── Security and Compliance Basics (3) ──
  {
    domain: SEC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which GitLab security scanner analyzes your source code (without executing it) to find potential vulnerabilities?',
    options: opts4(
      'SAST (Static Application Security Testing)',
      'Dependency Scanning',
      'Secret Detection',
      'Container Registry'
    ),
    correct: ['a'],
    explanation: 'SAST inspects source code statically for insecure patterns. Dependency Scanning checks third-party libraries for known CVEs, Secret Detection finds leaked credentials, and the Container Registry stores images (not a scanner).',
    references: [REF_SAST]
  },
  {
    domain: SEC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which GitLab default role grants the LEAST privilege — typically read-only visibility into a private project, with no ability to push code?',
    options: opts4(
      'Guest',
      'Developer',
      'Maintainer',
      'Owner'
    ),
    correct: ['a'],
    explanation: 'The role hierarchy is Guest < Reporter < Developer < Maintainer < Owner. Guest is the lowest, with limited read access and no push rights. Developers can push to non-protected branches; Maintainers/Owners administer the project/group.',
    references: [REF_PERMISSIONS]
  },
  {
    domain: SEC, difficulty: 3, type: QType.SINGLE,
    stem: 'Which feature records who performed sensitive actions (e.g. permission changes, settings changes) for compliance review?',
    options: opts4(
      'Issue boards',
      'Audit events',
      'CI/CD cache',
      'Snippets'
    ),
    correct: ['b'],
    explanation: 'Audit events log security-relevant actions (membership/permission/setting changes) with actor and timestamp, supporting compliance and forensics. Boards, cache, and snippets are unrelated to audit logging.',
    references: [REF_AUDIT, REF_COMPLIANCE]
  },

  // ── Git and GitLab Fundamentals (9 more → 13) ──
  {
    domain: FUND, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'What is the staging area (also called the index) in Git?',
    options: opts4(
      'A remote server that mirrors the repository',
      'An intermediate area where changes are prepared before they become part of the next commit',
      'A backup of every previous commit',
      'A temporary branch created during a merge'
    ),
    correct: ['b'],
    explanation: 'The staging area (index) holds the snapshot that will go into the next commit. `git add` moves changes into it, and `git commit` records exactly what is staged. It is local, not a remote or a backup.',
    references: [REF_GIT_BASICS]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command discards unstaged changes in the tracked file `app.py`, restoring it to the last committed state?',
    options: opts4(
      'git restore app.py',
      'git rm app.py',
      'git stash drop app.py',
      'git commit --reset app.py'
    ),
    correct: ['a'],
    explanation: '`git restore app.py` (or the older `git checkout -- app.py`) discards working-tree changes for that file. `git rm` deletes and stages a removal, `git stash drop` removes a stash entry, and `--reset` is not a commit flag.',
    references: [REF_GIT_BASICS]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'What does the `.gitignore` file do?',
    options: opts4(
      'Encrypts files before they are committed',
      'Specifies intentionally untracked file patterns that Git should not stage or report as untracked',
      'Lists files that must always be committed',
      'Records the commit history in a human-readable form'
    ),
    correct: ['b'],
    explanation: '`.gitignore` lists glob patterns for files Git should not track (build output, secrets, dependencies). It does not encrypt, force-include, or store history. Already-tracked files are not affected until untracked.',
    references: [REF_GIT_BASICS]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command shows the commit history of the current branch, most recent first?',
    options: opts4(
      'git status',
      'git log',
      'git reflog --branches',
      'git diff HEAD'
    ),
    correct: ['b'],
    explanation: '`git log` lists commits reachable from HEAD, newest first, with author, date, and message. `git status` shows working-tree state, `git diff HEAD` shows changes vs HEAD, and `git reflog` shows ref movements (not the same as branch history).',
    references: [REF_GIT_BASICS]
  },
  {
    domain: FUND, difficulty: 3, type: QType.SINGLE,
    stem: 'A merge produced conflicts. After manually editing the files to resolve them, what completes the merge?',
    options: opts4(
      'git merge --abort',
      'git add the resolved files, then git commit',
      'git reset --hard HEAD',
      'git checkout --theirs .'
    ),
    correct: ['b'],
    explanation: 'After fixing conflict markers you stage the resolved files with `git add` and then `git commit` to finalize the merge commit. `--abort` cancels the merge, `reset --hard` discards work, and `--theirs` blindly takes one side.',
    references: [REF_GIT_BASICS]
  },
  {
    domain: FUND, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: A commit SHA in Git is a hash that uniquely identifies the content and history of that commit.',
    options: [
      { id: 'a', text: 'True' },
      { id: 'b', text: 'False' }
    ],
    correct: ['a'],
    explanation: 'True. Each commit gets a SHA-1 (or SHA-256) hash computed over its tree, parent(s), author, message, etc. Changing any of those produces a different SHA, which is why rewriting history changes commit IDs.',
    references: [REF_GIT_BASICS]
  },
  {
    domain: FUND, difficulty: 1, type: QType.SINGLE,
    stem: 'What does `git diff` (with no arguments) show by default?',
    options: opts4(
      'The differences between staged changes and the last commit',
      'The differences between the working tree and the staging area (unstaged changes)',
      'A list of all branches',
      'The remote URL configuration'
    ),
    correct: ['b'],
    explanation: 'Plain `git diff` shows unstaged changes — working tree vs index. `git diff --cached` (or `--staged`) shows staged vs last commit. It does not list branches or show remotes.',
    references: [REF_GIT_BASICS]
  },
  {
    domain: FUND, difficulty: 3, type: QType.SINGLE,
    stem: 'You want to undo a pushed commit on a shared branch without rewriting history. Which command is safest?',
    options: opts4(
      'git reset --hard HEAD~1 then force push',
      'git revert <commit>',
      'git rebase -i HEAD~1',
      'git commit --amend then force push'
    ),
    correct: ['b'],
    explanation: '`git revert` creates a new commit that undoes the target commit, preserving history — safe for shared branches. The other options rewrite history and require force-pushing, which disrupts collaborators.',
    references: [REF_GIT_COMMIT]
  },
  {
    domain: FUND, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Git branches.',
    options: opts4(
      'A branch is a lightweight movable pointer to a commit.',
      'Creating a branch copies the entire repository contents to a new directory.',
      'HEAD normally points to the currently checked-out branch.',
      'Deleting a merged branch removes the commits it shared with main.'
    ),
    correct: ['a', 'c'],
    explanation: 'A branch is just a movable pointer/ref to a commit, and HEAD references the current branch. Branches are not directory copies, and deleting a branch only removes the label — shared commits reachable from other branches remain.',
    references: [REF_GIT_BASICS]
  },

  // ── Source Code Management and Workflows (9 more → 13) ──
  {
    domain: SCM, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What is the default branch in a GitLab project typically used for?',
    options: opts4(
      'Storing CI/CD logs',
      'Serving as the primary, stable line of development that pipelines and merge requests target by default',
      'Holding only documentation',
      'Running runners'
    ),
    correct: ['b'],
    explanation: 'The default branch (often `main`) is the primary integration branch; new MRs and many pipeline rules target it, and it is commonly protected. It is not a log store or runner.',
    references: [REF_PROJECTS, REF_PROTECTED]
  },
  {
    domain: SCM, difficulty: 3, type: QType.SINGLE,
    stem: 'A CODEOWNERS file in a GitLab repository primarily does what?',
    options: opts4(
      'Defines which users/groups are responsible for specific files or paths so they can be required reviewers',
      'Lists the project members allowed to clone the repository',
      'Configures CI/CD runner tags',
      'Sets the project visibility level'
    ),
    correct: ['a'],
    explanation: 'CODEOWNERS maps file/path patterns to owners; combined with protected branches, owners can be required approvers for changes to their paths. It does not manage cloning, runners, or visibility.',
    references: [REF_PROTECTED, REF_MR_APPROVALS]
  },
  {
    domain: SCM, difficulty: 2, type: QType.SINGLE,
    stem: 'Which statement best describes a merge request in GitLab?',
    options: opts4(
      'A request to delete a branch permanently',
      'A proposal to merge changes from a source branch into a target branch, with review, discussion, and CI',
      'A scheduled backup of the repository',
      'A way to fork a project'
    ),
    correct: ['b'],
    explanation: 'A merge request proposes integrating a source branch into a target branch and is the hub for code review, discussion, approvals, and pipeline results. It is not a deletion, backup, or fork operation.',
    references: [REF_MR]
  },
  {
    domain: SCM, difficulty: 3, type: QType.SINGLE,
    stem: 'Your MR target branch advanced and now has conflicts with your source branch. Which is a valid resolution path entirely within GitLab/Git?',
    options: opts4(
      'Close the MR and open a new project',
      'Rebase or merge the target branch into your source branch, resolve conflicts, and push the update',
      'Delete the target branch',
      'Force the MR to merge ignoring conflicts'
    ),
    correct: ['b'],
    explanation: 'You update the source branch by merging or rebasing the latest target into it, resolving conflicts, then pushing; the MR re-evaluates. GitLab will not merge with unresolved conflicts, and deleting the target is not a resolution.',
    references: [REF_MR, REF_GIT_REBASE]
  },
  {
    domain: SCM, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL valid GitLab merge methods.',
    options: opts4(
      'Merge commit',
      'Merge commit with semi-linear history',
      'Fast-forward merge',
      'Rebase and rename'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'GitLab supports "Merge commit", "Merge commit with semi-linear history", and "Fast-forward merge". "Rebase and rename" is not a GitLab merge method.',
    references: [REF_MR_METHODS]
  },
  {
    domain: SCM, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'In GitLab Flow, what triggers a deployment to an environment in the simplest model?',
    options: opts4(
      'Manually copying files to the server',
      'Merging into the branch associated with that environment, which runs the deployment pipeline',
      'Creating an issue labeled deploy',
      'Renaming the repository'
    ),
    correct: ['b'],
    explanation: 'GitLab Flow ties environments to branches; merging into an environment branch triggers the pipeline that deploys it. Manual file copies or issue labels are not the GitLab Flow deployment mechanism.',
    references: [REF_GITLAB_FLOW, REF_CI_ENV]
  },
  {
    domain: SCM, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Git command integrates upstream changes into your branch by replaying your commits on top of the latest upstream tip, keeping linear history?',
    options: opts4(
      'git merge upstream/main',
      'git rebase upstream/main',
      'git cherry-pick upstream/main',
      'git reset upstream/main'
    ),
    correct: ['b'],
    explanation: '`git rebase upstream/main` reapplies your commits onto the updated base for a linear history. `git merge` creates a merge commit instead; cherry-pick copies specific commits; reset moves the branch pointer.',
    references: [REF_GIT_REBASE]
  },
  {
    domain: SCM, difficulty: 3, type: QType.SINGLE,
    stem: 'Which protected-branch setting forces all changes to go through a merge request rather than direct pushes, even for Maintainers?',
    options: opts4(
      'Set "Allowed to push and merge" to "No one" while allowing merge',
      'Disable the repository',
      'Make the project private',
      'Remove all members'
    ),
    correct: ['a'],
    explanation: 'Setting "Allowed to push" to "No one" (while merge is still allowed for some role) forces all changes through MRs since nobody can push directly. Privacy/visibility and membership do not enforce MR-only flow.',
    references: [REF_PROTECTED]
  },
  {
    domain: SCM, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: In a typical GitLab feature-branch workflow, the feature branch should be kept short-lived and merged back via a merge request after review and passing CI.',
    options: [
      { id: 'a', text: 'True' },
      { id: 'b', text: 'False' }
    ],
    correct: ['a'],
    explanation: 'True. Short-lived feature branches reduce merge conflicts and integration risk; they are merged via MR once reviewed and CI is green, keeping the default branch stable.',
    references: [REF_GITLAB_FLOW, REF_MR]
  },

  // ── CI/CD Pipelines (13 more → 19) ──
  {
    domain: CICD, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'In `.gitlab-ci.yml`, what does the top-level `stages` keyword define?',
    options: opts4(
      'The Docker images used by all jobs',
      'The ordered list of stages and the order in which groups of jobs execute',
      'The runners assigned to the project',
      'The environment variables for the pipeline'
    ),
    correct: ['b'],
    explanation: '`stages` lists the pipeline stages in execution order; jobs are assigned to a stage and stages run sequentially while jobs within a stage run in parallel. It does not set images, runners, or variables.',
    references: [REF_CI_STAGES, REF_CI_YAML]
  },
  {
    domain: CICD, difficulty: 2, type: QType.SINGLE,
    stem: 'What does the `script` keyword in a job specify?',
    options: opts4(
      'The runner tags',
      'The shell commands the runner executes for that job',
      'The artifacts to upload',
      'The stage name'
    ),
    correct: ['b'],
    explanation: '`script` is the required list of shell commands a job runs. `tags` selects runners, `artifacts` declares outputs, and `stage` assigns the job to a stage.',
    references: [REF_CI_YAML]
  },
  {
    domain: CICD, difficulty: 2, type: QType.SINGLE,
    stem: 'Which keyword sets commands that run before the main `script` in a job (e.g. installing dependencies)?',
    options: opts4(
      'before_script',
      'pre_run',
      'setup',
      'init'
    ),
    correct: ['a'],
    explanation: '`before_script` runs prior to `script` (and `after_script` runs afterward, even on failure). `pre_run`, `setup`, and `init` are not GitLab CI keywords.',
    references: [REF_CI_YAML]
  },
  {
    domain: CICD, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What does the `image` keyword specify for a job using the Docker executor?',
    options: opts4(
      'The Git branch to build',
      'The Docker image used as the environment in which the job runs',
      'The artifact name',
      'The runner host operating system'
    ),
    correct: ['b'],
    explanation: '`image` sets the container image the job runs inside (with the Docker executor). It is unrelated to branches, artifact naming, or directly choosing the runner host OS.',
    references: [REF_CI_YAML]
  },
  {
    domain: CICD, difficulty: 3, type: QType.SINGLE,
    stem: 'You want a job to run only when files under `src/` change. Which configuration expresses this?',
    options: opts4(
      'rules: - changes: ["src/**/*"]',
      'only: branches',
      'needs: [src]',
      'environment: src'
    ),
    correct: ['a'],
    explanation: '`rules:changes` includes the job only when the listed paths change. `only: branches` is unrelated to file changes, `needs` builds a DAG, and `environment` declares a deployment target.',
    references: [REF_CI_RULES]
  },
  {
    domain: CICD, difficulty: 3, type: QType.SINGLE,
    stem: 'A job sets `retry: 2`. What is the effect?',
    options: opts4(
      'The job runs twice in parallel',
      'If the job fails, GitLab automatically retries it up to two more times',
      'The job is delayed by two minutes',
      'The pipeline retries from the first stage'
    ),
    correct: ['b'],
    explanation: '`retry: 2` makes GitLab automatically re-run a failed job up to two additional times before marking it failed. It does not parallelize, delay, or restart the whole pipeline.',
    references: [REF_CI_YAML]
  },
  {
    domain: CICD, difficulty: 2, type: QType.SINGLE,
    stem: 'What does `when: on_failure` on a job mean?',
    options: opts4(
      'The job runs only if a job in an earlier stage failed',
      'The job always runs',
      'The job never runs',
      'The job runs only on protected branches'
    ),
    correct: ['a'],
    explanation: '`when: on_failure` runs the job only when at least one job in an earlier stage failed (useful for cleanup/notifications). `on_success` (default), `always`, and `manual` are the other common values.',
    references: [REF_CI_YAML]
  },
  {
    domain: CICD, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about pipeline triggers/types in GitLab.',
    options: opts4(
      'A branch pipeline runs when commits are pushed to a branch.',
      'A merge request pipeline can run for changes proposed in an MR.',
      'A scheduled pipeline runs on a defined cron-like schedule.',
      'Pipelines can only ever be started manually by an administrator.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'GitLab supports branch, merge request, scheduled, tag, and manually-triggered pipelines, among others. Pipelines are NOT restricted to admin-only manual starts.',
    references: [REF_CI_INTRO]
  },
  {
    domain: CICD, difficulty: 2, type: QType.SINGLE,
    stem: 'Which predefined CI/CD variable holds the branch or tag name for which the pipeline is running?',
    options: opts4(
      'CI_PROJECT_DIR',
      'CI_COMMIT_REF_NAME',
      'CI_RUNNER_ID',
      'CI_JOB_STAGE'
    ),
    correct: ['b'],
    explanation: '`CI_COMMIT_REF_NAME` is the branch or tag the pipeline runs for. `CI_PROJECT_DIR` is the checkout path, `CI_JOB_STAGE` the stage name, and `CI_RUNNER_ID` the runner identifier.',
    references: [REF_CI_VARS]
  },
  {
    domain: CICD, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'What is the purpose of the `cache:key` keyword?',
    options: opts4(
      'It encrypts the cache contents',
      'It defines a key that determines which cache is reused/stored, enabling per-branch or per-dependency caches',
      'It selects which runner stores the cache',
      'It sets the artifact expiry'
    ),
    correct: ['b'],
    explanation: '`cache:key` controls cache identity (e.g. keyed by branch or a lockfile hash) so the right cache is restored/saved. It does not encrypt, choose runners, or set artifact expiry.',
    references: [REF_CI_CACHE]
  },
  {
    domain: CICD, difficulty: 4, type: QType.SINGLE,
    stem: 'A deploy job has `environment: name: production` and `when: manual`. What is the typical reason for this combination?',
    options: opts4(
      'To deploy automatically on every commit',
      'To require a human to explicitly trigger the production deployment (a manual gate)',
      'To disable deployments',
      'To run the job on every branch'
    ),
    correct: ['b'],
    explanation: 'Combining `environment` with `when: manual` creates a tracked production deployment that a person must click to run — a deliberate release gate. It is the opposite of automatic on every commit.',
    references: [REF_CI_ENV, REF_CI_YAML]
  },
  {
    domain: CICD, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL true statements about GitLab Runners and executors.',
    options: opts4(
      'Runners can be instance-wide (shared), group, or project-specific.',
      'The docker executor isolates each job in a container.',
      'A runner must always use the shell executor.',
      'Job tags are matched to runner tags to route jobs.'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Runners can be shared/group/project-scoped, the docker executor isolates jobs per container, and job tags route work to tagged runners. A runner is NOT forced to use the shell executor — many executors exist (docker, kubernetes, shell, ssh, etc.).',
    references: [REF_RUNNERS, REF_EXECUTORS]
  },
  {
    domain: CICD, difficulty: 3, type: QType.SINGLE,
    stem: 'To authenticate a CI/CD job pushing an image to the project Container Registry, which predefined variables are most relevant?',
    options: opts4(
      'CI_REGISTRY, CI_REGISTRY_USER, CI_REGISTRY_PASSWORD',
      'CI_PAGES_URL only',
      'CI_RUNNER_TAGS',
      'CI_DEFAULT_BRANCH'
    ),
    correct: ['a'],
    explanation: 'GitLab injects `CI_REGISTRY`, `CI_REGISTRY_USER`, and `CI_REGISTRY_PASSWORD` (and `CI_REGISTRY_IMAGE`) so jobs can `docker login` and push to the integrated registry. The others are unrelated to registry auth.',
    references: [REF_REGISTRY, REF_CI_VARS]
  },

  // ── Project Management and Collaboration (7 more → 10) ──
  {
    domain: PM, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'What is a GitLab issue primarily used for?',
    options: opts4(
      'Storing compiled binaries',
      'Tracking work such as bugs, feature requests, and tasks, with discussion and assignment',
      'Running CI/CD pipelines',
      'Hosting a static website'
    ),
    correct: ['b'],
    explanation: 'Issues track and discuss work items (bugs, features, tasks) with assignees, labels, milestones, and threaded comments. Binaries go to artifacts/registry, pipelines run CI, and Pages hosts sites.',
    references: [REF_ISSUES]
  },
  {
    domain: PM, difficulty: 2, type: QType.SINGLE,
    stem: 'Which feature lets you assign an issue or merge request to a specific person responsible for it?',
    options: opts4(
      'Assignees',
      'Labels',
      'Tags',
      'Runners'
    ),
    correct: ['a'],
    explanation: 'Assignees designate who is responsible for an issue/MR (GitLab also supports multiple assignees in some tiers). Labels categorize, Git tags mark commits, and runners execute CI.',
    references: [REF_ISSUES, REF_MR]
  },
  {
    domain: PM, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What does referencing `!123` in an issue comment do?',
    options: opts4(
      'Deletes merge request 123',
      'Creates a cross-link to merge request number 123',
      'Merges MR 123 immediately',
      'Assigns the issue to user 123'
    ),
    correct: ['b'],
    explanation: 'GitLab reference syntax: `#123` links an issue, `!123` links a merge request, `@user` mentions a user. It creates a navigable cross-reference, not a destructive action.',
    references: [REF_ISSUES, REF_MR]
  },
  {
    domain: PM, difficulty: 3, type: QType.SINGLE,
    stem: 'Which feature visualizes remaining work over time for a milestone?',
    options: opts4(
      'Burndown chart',
      'Container registry',
      'CI/CD cache',
      'Protected branch'
    ),
    correct: ['a'],
    explanation: 'A burndown (and burnup) chart on a milestone shows progress/remaining work over the milestone period. The registry, cache, and protected branches are unrelated to milestone progress visualization.',
    references: [REF_MILESTONES]
  },
  {
    domain: PM, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about labels in GitLab.',
    options: opts4(
      'Labels can be project-scoped or group-scoped.',
      'Scoped labels (key::value) enforce mutual exclusivity within a scope.',
      'Labels can be used to build issue board lists.',
      'A label can only ever be applied to one issue at a time.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Labels can be project or group level, scoped labels (`key::value`) are mutually exclusive within their key, and board lists are built from labels. A label can be applied to many issues — it is not single-use.',
    references: [REF_LABELS, REF_BOARDS]
  },
  {
    domain: PM, difficulty: 3, type: QType.SINGLE,
    stem: 'Two issues must be done in order — issue B should not start until A is finished. Which GitLab capability models this dependency?',
    options: opts4(
      'Linked issues with a "blocks/is blocked by" relationship',
      'A shared label only',
      'A protected tag',
      'A CI/CD cache'
    ),
    correct: ['a'],
    explanation: 'GitLab linked issues support relationship types including "blocks" / "is blocked by", explicitly modeling ordering dependencies. Labels alone do not enforce a dependency, and tags/cache are unrelated.',
    references: [REF_ISSUES]
  },
  {
    domain: PM, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'What is a GitLab Wiki used for?',
    options: opts4(
      'Running CI/CD jobs',
      'Maintaining project documentation in a versioned, separate Git repository',
      'Storing Docker images',
      'Tracking commit SHAs'
    ),
    correct: ['b'],
    explanation: 'A project Wiki holds documentation, backed by its own Git repository and versioned independently of the code. It does not run CI, store images, or track commit hashes.',
    references: [REF_PROJECTS]
  },

  // ── Security and Compliance Basics (7 more → 10) ──
  {
    domain: SEC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Order the GitLab default roles from least to most privileged.',
    options: opts4(
      'Owner < Maintainer < Developer < Reporter < Guest',
      'Guest < Reporter < Developer < Maintainer < Owner',
      'Reporter < Guest < Maintainer < Developer < Owner',
      'Developer < Guest < Reporter < Maintainer < Owner'
    ),
    correct: ['b'],
    explanation: 'The default role hierarchy is Guest < Reporter < Developer < Maintainer < Owner, with each level adding capabilities (Reporter adds read of issues/code analytics, Developer adds push, etc.).',
    references: [REF_PERMISSIONS]
  },
  {
    domain: SEC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which role can typically view issues and the repository but cannot push code or create merge requests?',
    options: opts4(
      'Owner',
      'Maintainer',
      'Reporter',
      'Developer'
    ),
    correct: ['c'],
    explanation: 'Reporter has read-oriented access (view code, issues, analytics) but no push or MR-create rights. Developers can push and open MRs; Maintainers/Owners administer the project.',
    references: [REF_PERMISSIONS]
  },
  {
    domain: SEC, difficulty: 3, type: QType.SINGLE,
    stem: 'How are GitLab SAST results most commonly surfaced to reviewers?',
    options: opts4(
      'As emails only',
      'In the merge request security widget and the pipeline Security tab, showing newly introduced vulnerabilities',
      'Only in the project README',
      'In the container registry'
    ),
    correct: ['b'],
    explanation: 'SAST (and other scanners) report findings into the pipeline Security tab and the MR security widget, highlighting vulnerabilities introduced by the change so reviewers can act before merging.',
    references: [REF_SAST]
  },
  {
    domain: SEC, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL GitLab application security scanning categories.',
    options: opts4(
      'SAST (static analysis of source code)',
      'Secret Detection (finding leaked credentials)',
      'Dependency Scanning (known CVEs in dependencies)',
      'Branch Renaming Scanning'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'SAST, Secret Detection, and Dependency Scanning are real GitLab security scanning categories (alongside DAST, container scanning, etc.). "Branch Renaming Scanning" is not a security scanner.',
    references: [REF_SAST, REF_SECRET, REF_DEPSCAN]
  },
  {
    domain: SEC, difficulty: 3, type: QType.SINGLE,
    stem: 'A leaked API token was committed last week. Which scanner is designed to detect it, and what is the recommended remediation?',
    options: opts4(
      'Dependency Scanning; ignore it',
      'Secret Detection; revoke/rotate the token and remove it from the codebase',
      'SAST; just delete the file',
      'Container Scanning; rebuild the image only'
    ),
    correct: ['b'],
    explanation: 'Secret Detection flags committed credentials. Because Git history retains the secret, the correct response is to revoke/rotate the token immediately and remove it from code/config (deleting the file alone is insufficient).',
    references: [REF_SECRET]
  },
  {
    domain: SEC, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: Making a project "private" in GitLab restricts access so only explicitly added members can view it.',
    options: [
      { id: 'a', text: 'True' },
      { id: 'b', text: 'False' }
    ],
    correct: ['a'],
    explanation: 'True. Private visibility means only project members (or group members with inherited access) can see the project. Internal is logged-in users; public is anyone.',
    references: [REF_PERMISSIONS, REF_PROJECTS]
  },
  {
    domain: SEC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Why should secrets (passwords, tokens) be stored as masked/protected CI/CD variables rather than committed to the repository?',
    options: opts4(
      'It makes pipelines run faster',
      'It keeps secrets out of version history and reduces exposure in logs and to untrusted branches',
      'It is required to use any runner',
      'It automatically encrypts the whole repository'
    ),
    correct: ['b'],
    explanation: 'Storing secrets as masked/protected CI/CD variables avoids persisting them in Git history, hides them in job logs, and limits exposure to protected refs — far safer than committing them. It is not a speed or runner requirement.',
    references: [REF_CI_VARS, REF_SECRET]
  }
];

// ───────────────────── Practice Exam 2 ─────────────────────
const P2: Q[] = [
  // ── Git and GitLab Fundamentals (4) ──
  {
    domain: FUND, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command creates a new branch named `feature-x` and immediately switches to it?',
    options: opts4(
      'git branch feature-x',
      'git checkout -b feature-x',
      'git switch feature-x',
      'git merge feature-x'
    ),
    correct: ['b'],
    explanation: '`git checkout -b feature-x` creates and checks out the branch in one step (equivalent to `git switch -c feature-x`). `git branch feature-x` creates it without switching, and `git switch feature-x` fails if the branch does not exist.',
    references: [REF_GIT_BASICS]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What does `git merge feature` do when run while `main` is checked out and the branches have diverged?',
    options: opts4(
      'Deletes the feature branch after copying its files',
      'Combines the histories of feature into main, creating a merge commit when needed',
      'Rewrites main\'s history to match feature exactly',
      'Pushes feature to the remote main branch'
    ),
    correct: ['b'],
    explanation: 'Merging integrates the feature branch into main; with diverged history Git creates a merge commit with two parents. It does not delete branches, rewrite history (that is rebase), or push anything.',
    references: [REF_GIT_BASICS]
  },
  {
    domain: FUND, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: `git fetch` updates your remote-tracking branches but does NOT modify your local working branch or files.',
    options: [
      { id: 'a', text: 'True' },
      { id: 'b', text: 'False' }
    ],
    correct: ['a'],
    explanation: 'True. `git fetch` downloads new objects and updates remote-tracking refs (e.g. `origin/main`) but leaves your checked-out branch untouched. `git pull` is `fetch` followed by a merge/rebase, which does change your working branch.',
    references: [REF_GIT_BASICS]
  },
  {
    domain: FUND, difficulty: 3, type: QType.SINGLE,
    stem: 'You accidentally ran `git stash` twice. Which command lists all stash entries so you can choose which to restore?',
    options: opts4(
      'git stash show',
      'git stash list',
      'git stash pop --all',
      'git log --stash'
    ),
    correct: ['b'],
    explanation: '`git stash list` shows the stack of stash entries (stash@{0}, stash@{1}, ...). `git stash show` displays one entry\'s diff, and there is no `--all` flag on pop or a `--stash` option on log.',
    references: [REF_GIT_STASH]
  },

  // ── Source Code Management and Workflows (4) ──
  {
    domain: SCM, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Within a GitLab group, what is a subgroup primarily used for?',
    options: opts4(
      'Storing CI/CD job logs separately from projects',
      'Organizing projects and members into a nested hierarchy under the parent group',
      'Replacing protected branches at the instance level',
      'Running pipelines without a runner'
    ),
    correct: ['b'],
    explanation: 'Subgroups create a nested namespace hierarchy, letting you mirror team/department structure and inherit/scope membership and settings. They are not log storage, branch protection, or a runner substitute.',
    references: [REF_SUBGROUPS, REF_GROUPS]
  },
  {
    domain: SCM, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about protected branches in GitLab.',
    options: opts4(
      'You can configure which roles are allowed to push and which are allowed to merge.',
      'Force push to a protected branch is blocked by default.',
      'Protected branches make the repository read-only for everyone.',
      'You can require code owner approval on a protected branch.'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Protected branches let you set allowed push/merge roles, block force pushes by default, and optionally require Code Owner approval. They do NOT make the whole repository read-only — only the protected branch is restricted.',
    references: [REF_PROTECTED]
  },
  {
    domain: SCM, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'After forking a project, how do you keep your fork up to date with new commits on the original (upstream) project?',
    options: opts4(
      'Delete and re-fork every time upstream changes',
      'Add the original project as a remote (e.g. upstream) and fetch/merge its changes into your fork',
      'Open an issue asking maintainers to sync your fork',
      'Forks update automatically and require no action ever'
    ),
    correct: ['b'],
    explanation: 'You add the original repo as a second remote (commonly `upstream`), then fetch and merge/rebase its changes into your fork. GitLab also offers a UI "Update fork" action, but forks do not sync fully automatically.',
    references: [REF_FORK]
  },
  {
    domain: SCM, difficulty: 3, type: QType.SINGLE,
    stem: 'In GitLab Flow with environment branches, how is code typically promoted from staging to production?',
    options: opts4(
      'By force-pushing the staging branch over production',
      'By merging the production-ready branch into the production environment branch (often via merge request)',
      'By committing directly to the production branch on the server',
      'By deleting the staging branch'
    ),
    correct: ['b'],
    explanation: 'GitLab Flow promotes changes forward by merging into downstream environment branches (e.g. main → pre-production → production), typically through merge requests so review/CI gate each promotion. Force-pushing or direct server commits bypass that flow.',
    references: [REF_GITLAB_FLOW]
  },

  // ── CI/CD Pipelines (6) ──
  {
    domain: CICD, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A job sets `when: manual`. What is the effect?',
    options: opts4(
      'The job runs automatically but with low priority',
      'The job is added to the pipeline but only runs when a user explicitly triggers (plays) it',
      'The job is skipped entirely',
      'The job runs only on manual (self-managed) runners'
    ),
    correct: ['b'],
    explanation: '`when: manual` creates a job that appears in the pipeline but stays paused until a user clicks play. It is commonly used for deployments. It is unrelated to runner type or priority.',
    references: [REF_CI_YAML]
  },
  {
    domain: CICD, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A job has `allow_failure: true` and it fails. What happens to the pipeline?',
    options: opts4(
      'The pipeline fails immediately',
      'The pipeline continues and is not marked as failed because of this job (it shows a warning)',
      'The job is automatically retried three times',
      'The next stage is skipped'
    ),
    correct: ['b'],
    explanation: '`allow_failure: true` lets a job fail without failing the pipeline; the pipeline proceeds and shows a warning indicator. It does not trigger retries or skip stages.',
    references: [REF_CI_YAML]
  },
  {
    domain: CICD, difficulty: 3, type: QType.SINGLE,
    stem: 'You want to reuse a shared pipeline template stored in another repository. Which `.gitlab-ci.yml` keyword references external configuration?',
    options: opts4(
      'extends',
      'include',
      'needs',
      'trigger'
    ),
    correct: ['b'],
    explanation: '`include` pulls in external YAML (local file, another project, remote URL, or a template). `extends` reuses configuration defined within the same file, `needs` builds a DAG, and `trigger` starts downstream pipelines.',
    references: [REF_CI_INCLUDE]
  },
  {
    domain: CICD, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about CI/CD variables in GitLab.',
    options: opts4(
      'Project-level CI/CD variables can be marked "masked" so their values are hidden in job logs.',
      'Variables can be marked "protected" so they are only available on protected branches and tags.',
      'Predefined variables like CI_COMMIT_REF_NAME are provided automatically by GitLab.',
      'CI/CD variables can only be defined inside the .gitlab-ci.yml file.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Variables can be masked, marked protected, and GitLab injects many predefined variables (e.g. `CI_COMMIT_REF_NAME`). They can be defined in the YAML file OR in project/group/instance settings — not only in the file.',
    references: [REF_CI_VARS]
  },
  {
    domain: CICD, difficulty: 3, type: QType.SINGLE,
    stem: 'A `deploy` job defines `environment: name: production, url: https://example.com`. What does declaring an environment provide?',
    options: opts4(
      'It encrypts all artifacts produced by the job',
      'It tracks deployments to that environment and enables features like deployment history and rollback',
      'It forces the job to run on a shared runner',
      'It disables the job\'s logs for security'
    ),
    correct: ['b'],
    explanation: 'Declaring an `environment` lets GitLab record deployments, show deployment history, link the live URL, and support rollback/stop actions. It does not affect artifact encryption, runner selection, or log visibility.',
    references: [REF_CI_ENV]
  },
  {
    domain: CICD, difficulty: 4, type: QType.SINGLE,
    stem: 'Which runner executor runs each CI/CD job in its own container, giving clean isolated environments per job?',
    options: opts4(
      'shell',
      'docker',
      'ssh',
      'static'
    ),
    correct: ['b'],
    explanation: 'The `docker` executor spins up a fresh container per job, providing isolation and reproducibility. The `shell` executor runs jobs directly on the runner host (shared state), `ssh` runs them on a remote machine, and `static` is not a GitLab Runner executor.',
    references: [REF_EXECUTORS]
  },

  // ── Project Management and Collaboration (3) ──
  {
    domain: PM, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What is the purpose of marking a merge request as a Draft (e.g. title prefixed with "Draft:")?',
    options: opts4(
      'It permanently deletes the source branch',
      'It signals the MR is not ready and blocks merging until the Draft flag is removed',
      'It automatically approves the merge request',
      'It converts the MR into an issue'
    ),
    correct: ['b'],
    explanation: 'A Draft MR communicates work-in-progress and GitLab prevents it from being merged until the Draft status is cleared. It does not delete branches, auto-approve, or convert to an issue.',
    references: [REF_DRAFT]
  },
  {
    domain: PM, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You want to track all issues and merge requests targeted for the "2.0 Release" with a due date. Which feature fits best?',
    options: opts4(
      'A label named release-2.0',
      'A milestone named 2.0 Release with a due date',
      'A protected tag',
      'A snippet'
    ),
    correct: ['b'],
    explanation: 'Milestones group issues/MRs toward a deliverable and support start/due dates and progress burndown. A label only categorizes (no dates), a protected tag marks a commit, and a snippet stores code.',
    references: [REF_MILESTONES]
  },
  {
    domain: PM, difficulty: 3, type: QType.SINGLE,
    stem: 'In a merge request, which mechanism lets reviewers formally signal that required approval criteria are met before merging?',
    options: opts4(
      'Adding a comment that says "LGTM"',
      'Merge request approvals (approval rules / required approvers)',
      'Closing the related issue',
      'Adding a label named approved'
    ),
    correct: ['b'],
    explanation: 'Merge request approval rules require a configured number/group of approvers to approve before the MR can merge. A comment or a label is informal and not enforced; closing an issue is unrelated.',
    references: [REF_MR_APPROVALS]
  },

  // ── Security and Compliance Basics (3) ──
  {
    domain: SEC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which GitLab scanner specifically looks for credentials (API keys, tokens, passwords) accidentally committed to the repository?',
    options: opts4(
      'Secret Detection',
      'SAST',
      'Dependency Scanning',
      'GitLab Pages'
    ),
    correct: ['a'],
    explanation: 'Secret Detection scans commits/history for leaked secrets like tokens and keys. SAST analyzes code logic, Dependency Scanning checks libraries for known CVEs, and GitLab Pages is static-site hosting.',
    references: [REF_SECRET]
  },
  {
    domain: SEC, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A user must be able to push to non-protected branches and create merge requests, but should NOT manage project settings or members. Which default role is appropriate?',
    options: opts4(
      'Guest',
      'Reporter',
      'Developer',
      'Owner'
    ),
    correct: ['c'],
    explanation: 'The Developer role can push to non-protected branches and create MRs but cannot administer project settings/members. Guest/Reporter cannot push code, and Owner has full administrative control.',
    references: [REF_PERMISSIONS]
  },
  {
    domain: SEC, difficulty: 3, type: QType.SINGLE,
    stem: 'Which scanner flags third-party libraries declared in your project that have known published vulnerabilities (CVEs)?',
    options: opts4(
      'Secret Detection',
      'Dependency Scanning',
      'SAST',
      'Container Registry cleanup policy'
    ),
    correct: ['b'],
    explanation: 'Dependency Scanning analyzes your declared dependencies against vulnerability databases to surface known CVEs. Secret Detection finds leaked credentials, SAST inspects your own code, and a registry cleanup policy only prunes old images.',
    references: [REF_DEPSCAN]
  },

  // ── Git and GitLab Fundamentals (16 more → 20) ──
  {
    domain: FUND, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command initializes a brand-new, empty Git repository in the current directory?',
    options: opts4(
      'git init',
      'git start',
      'git create',
      'git new'
    ),
    correct: ['a'],
    explanation: '`git init` creates a new `.git` directory, turning the current folder into a Git repository. `git start`, `git create`, and `git new` are not Git commands.',
    references: [REF_GIT_BASICS]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command stages all modified and new files in the current directory tree?',
    options: opts4(
      'git add .',
      'git stage --commit',
      'git commit -all',
      'git push .'
    ),
    correct: ['a'],
    explanation: '`git add .` stages changes (including new files) under the current path. `git add -A` stages across the whole repo including deletions. The other forms are not valid Git syntax.',
    references: [REF_GIT_COMMIT]
  },
  {
    domain: FUND, difficulty: 3, type: QType.SINGLE,
    stem: 'You want to apply a single commit from another branch onto your current branch. Which command do you use?',
    options: opts4(
      'git merge <commit>',
      'git cherry-pick <commit>',
      'git rebase <commit>',
      'git stash <commit>'
    ),
    correct: ['b'],
    explanation: '`git cherry-pick <commit>` applies the changes of one specific commit onto the current branch as a new commit. Merge integrates whole branches, rebase replays a range, and stash is unrelated.',
    references: [REF_GIT_BASICS]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What does `git clone --branch develop <url>` do?',
    options: opts4(
      'Clones the repository and checks out the develop branch',
      'Deletes the develop branch on the remote',
      'Creates a new branch called develop locally only',
      'Clones only the develop file'
    ),
    correct: ['a'],
    explanation: '`git clone --branch develop <url>` clones the repo and checks out `develop` instead of the default branch. It does not delete remote branches or clone a single file.',
    references: [REF_GIT_BASICS]
  },
  {
    domain: FUND, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: `git commit` records a snapshot of only the changes that were added to the staging area.',
    options: [
      { id: 'a', text: 'True' },
      { id: 'b', text: 'False' }
    ],
    correct: ['a'],
    explanation: 'True. A commit captures the staged (indexed) content. Modifications not added to the index are not part of the commit (unless `-a` is used to auto-stage tracked files).',
    references: [REF_GIT_COMMIT]
  },
  {
    domain: FUND, difficulty: 3, type: QType.SINGLE,
    stem: 'You deleted a local branch that had unmerged commits. Which command can help you find those lost commits?',
    options: opts4(
      'git status',
      'git reflog',
      'git diff',
      'git remote -v'
    ),
    correct: ['b'],
    explanation: '`git reflog` records where HEAD and branch refs have pointed, letting you recover commit SHAs from a deleted branch and recreate it. `status`, `diff`, and `remote -v` do not show ref history.',
    references: [REF_GIT_BASICS]
  },
  {
    domain: FUND, difficulty: 1, type: QType.SINGLE,
    stem: 'In Git, what is HEAD?',
    options: opts4(
      'The oldest commit in the repository',
      'A reference to the current commit/branch you have checked out',
      'The remote server name',
      'The staging area'
    ),
    correct: ['b'],
    explanation: 'HEAD is a symbolic reference to the currently checked-out branch (or commit in detached state). It is not the first commit, a remote name, or the index.',
    references: [REF_GIT_BASICS]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command lists all local branches and marks the current one with an asterisk?',
    options: opts4(
      'git branch',
      'git branch -r',
      'git log --branches',
      'git checkout'
    ),
    correct: ['a'],
    explanation: '`git branch` lists local branches, marking the active one with `*`. `git branch -r` lists remote-tracking branches, and the others do not list local branches that way.',
    references: [REF_GIT_BASICS]
  },
  {
    domain: FUND, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements comparing merge and rebase.',
    options: opts4(
      'Merge preserves the original branch history and adds a merge commit when histories diverge.',
      'Rebase rewrites commits onto a new base, producing a linear history.',
      'Rebasing a shared/published branch is generally discouraged.',
      'Merge always rewrites commit SHAs of the feature branch.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Merge keeps both histories (often via a merge commit), rebase replays commits for a linear history, and rebasing shared branches is discouraged because it rewrites history. Merge does NOT rewrite the feature branch\'s commit SHAs.',
    references: [REF_GIT_REBASE, REF_GIT_BASICS]
  },

  // ── Source Code Management and Workflows (9 more → 13) ──
  {
    domain: SCM, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What does the source branch of a merge request refer to?',
    options: opts4(
      'The branch whose changes are proposed to be merged into the target branch',
      'The default branch only',
      'The branch the changes will be merged into',
      'A read-only mirror branch'
    ),
    correct: ['a'],
    explanation: 'In an MR the source branch contains the changes you want merged; the target branch is where they will land. The source need not be the default branch.',
    references: [REF_MR]
  },
  {
    domain: SCM, difficulty: 3, type: QType.SINGLE,
    stem: 'A maintainer enabled "Fast-forward merge" only. What must be true for an MR to merge?',
    options: opts4(
      'The MR can always merge regardless of history',
      'The source branch must be rebased on the latest target so a linear fast-forward is possible',
      'A merge commit will be created automatically',
      'The target branch must be deleted first'
    ),
    correct: ['b'],
    explanation: 'Fast-forward-only merges require the source to be directly ahead of the target (no merge commit). If the target moved, you must rebase/update the source first. No merge commit is created.',
    references: [REF_MR_METHODS, REF_GIT_REBASE]
  },
  {
    domain: SCM, difficulty: 2, type: QType.SINGLE,
    stem: 'Which is a benefit of keeping feature branches short-lived in GitLab Flow?',
    options: opts4(
      'It guarantees no code review is needed',
      'It reduces merge conflicts and integration risk by merging small changes frequently',
      'It removes the need for CI/CD',
      'It prevents the main branch from being protected'
    ),
    correct: ['b'],
    explanation: 'Short-lived branches integrate small changes often, minimizing divergence and conflicts. Review and CI are still required, and main remains protectable.',
    references: [REF_GITLAB_FLOW]
  },
  {
    domain: SCM, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about GitLab groups and subgroups.',
    options: opts4(
      'A subgroup inherits members and permissions from its parent group.',
      'Projects can be moved between groups (transferred).',
      'A group can contain both projects and subgroups.',
      'Subgroups cannot have their own members beyond inherited ones.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Subgroups inherit parent membership, projects can be transferred between namespaces, and a group can hold projects and subgroups. Subgroups CAN also have their own additional members, not only inherited ones.',
    references: [REF_GROUPS, REF_SUBGROUPS]
  },
  {
    domain: SCM, difficulty: 2, type: QType.SINGLE,
    stem: 'What is the target branch of a typical feature merge request?',
    options: opts4(
      'Always a tag',
      'Usually the default/integration branch (e.g. main) the feature should land in',
      'The runner',
      'The container registry'
    ),
    correct: ['b'],
    explanation: 'A feature MR usually targets the default integration branch (commonly `main`) where reviewed work is integrated. Tags, runners, and the registry are not MR targets.',
    references: [REF_MR, REF_GITLAB_FLOW]
  },
  {
    domain: SCM, difficulty: 3, type: QType.SINGLE,
    stem: 'How can you require that specific people review changes to files in `/infra/` before merge?',
    options: opts4(
      'Add a label named infra',
      'Define CODEOWNERS entries for /infra/ and enable code owner approval on the protected branch',
      'Delete the /infra/ directory',
      'Disable merge requests'
    ),
    correct: ['b'],
    explanation: 'CODEOWNERS maps `/infra/` to owners; enabling "Require code owner approval" on the protected target branch forces those owners to approve MRs touching that path. Labels do not enforce reviewers.',
    references: [REF_PROTECTED, REF_MR_APPROVALS]
  },
  {
    domain: SCM, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which statement about forking is correct?',
    options: opts4(
      'A fork shares the same storage as the upstream project, so changes affect upstream immediately',
      'A fork is an independent server-side copy; you push to it and propose changes upstream via merge requests',
      'Forking automatically grants you Owner on upstream',
      'You cannot open a merge request from a fork'
    ),
    correct: ['b'],
    explanation: 'A fork is a separate copy you control; changes do not affect upstream until merged via an MR from the fork. Forking does not grant upstream roles, and MRs from forks are fully supported.',
    references: [REF_FORK]
  },
  {
    domain: SCM, difficulty: 3, type: QType.SINGLE,
    stem: 'In a release-branch GitLab Flow, what is a release branch typically used for?',
    options: opts4(
      'Daily feature development',
      'Stabilizing a specific release and applying only bug fixes/cherry-picks before tagging',
      'Storing CI logs',
      'Hosting documentation'
    ),
    correct: ['b'],
    explanation: 'Release branches isolate a version for stabilization: only fixes (often cherry-picked from main) go in before tagging the release. Active feature work continues on main, not the release branch.',
    references: [REF_GITLAB_FLOW]
  },
  {
    domain: SCM, difficulty: 2, type: QType.SINGLE,
    stem: 'What does "rebase" do to an MR\'s source branch in GitLab when you click the Rebase button?',
    options: opts4(
      'Squashes all commits into one',
      'Replays the source branch commits on top of the latest target branch',
      'Deletes the source branch',
      'Merges the MR immediately'
    ),
    correct: ['b'],
    explanation: 'The Rebase action replays the source branch onto the current tip of the target branch, updating it without a merge commit. It does not squash, delete the branch, or merge.',
    references: [REF_GIT_REBASE, REF_MR]
  },

  // ── CI/CD Pipelines (13 more → 19) ──
  {
    domain: CICD, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'What is a "job" in a GitLab CI/CD pipeline?',
    options: opts4(
      'A protected branch',
      'A defined unit of work (with a script) that a runner executes as part of a stage',
      'A merge request',
      'A container registry image'
    ),
    correct: ['b'],
    explanation: 'A job is the smallest pipeline unit: it has a script, belongs to a stage, and is run by a runner. It is not a branch, MR, or image.',
    references: [REF_CI_YAML, REF_CI_INTRO]
  },
  {
    domain: CICD, difficulty: 2, type: QType.SINGLE,
    stem: 'If no `stages` are defined in `.gitlab-ci.yml`, what default stages does GitLab use?',
    options: opts4(
      'build, test, deploy',
      'compile, package, ship',
      'init, run, end',
      'There are no default stages; the pipeline fails'
    ),
    correct: ['a'],
    explanation: 'When `stages` is omitted, GitLab uses the default `.pre`, `build`, `test`, `deploy`, `.post` ordering (commonly summarized as build → test → deploy). The pipeline does not fail for omitting `stages`.',
    references: [REF_CI_STAGES]
  },
  {
    domain: CICD, difficulty: 2, type: QType.SINGLE,
    stem: 'Which keyword assigns a job to a particular stage?',
    options: opts4(
      'stage',
      'phase',
      'step',
      'group'
    ),
    correct: ['a'],
    explanation: 'The `stage` keyword places a job in a named stage (must exist in `stages` or be a default). `phase`, `step`, and `group` are not GitLab CI keywords for this.',
    references: [REF_CI_YAML, REF_CI_STAGES]
  },
  {
    domain: CICD, difficulty: 3, type: QType.SINGLE,
    stem: 'You want a job to run for tag pipelines only. Which rule condition matches?',
    options: opts4(
      'rules: - if: $CI_COMMIT_TAG',
      'rules: - if: $CI_MERGE_REQUEST_IID',
      'only: branches',
      'when: never'
    ),
    correct: ['a'],
    explanation: '`$CI_COMMIT_TAG` is set only for tag pipelines, so `rules: - if: $CI_COMMIT_TAG` includes the job for tags. The MR variable matches MR pipelines, `only: branches` excludes tags, and `when: never` disables the job.',
    references: [REF_CI_RULES, REF_CI_VARS]
  },
  {
    domain: CICD, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL valid values for a job\'s `when` keyword.',
    options: opts4(
      'on_success',
      'manual',
      'always',
      'random'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Valid `when` values include `on_success` (default), `on_failure`, `always`, `manual`, `delayed`, and `never`. `random` is not a valid value.',
    references: [REF_CI_YAML]
  },
  {
    domain: CICD, difficulty: 2, type: QType.SINGLE,
    stem: 'Which predefined variable contains the absolute path to the cloned project on the runner?',
    options: opts4(
      'CI_PROJECT_DIR',
      'CI_COMMIT_SHA',
      'CI_PIPELINE_ID',
      'CI_JOB_NAME'
    ),
    correct: ['a'],
    explanation: '`CI_PROJECT_DIR` is the full path where the repository is checked out. `CI_COMMIT_SHA` is the commit hash, `CI_PIPELINE_ID` the pipeline ID, and `CI_JOB_NAME` the job name.',
    references: [REF_CI_VARS]
  },
  {
    domain: CICD, difficulty: 3, type: QType.SINGLE,
    stem: 'A job needs a Postgres database for integration tests. Which keyword attaches it as a linked container?',
    options: opts4(
      'services',
      'image',
      'cache',
      'needs'
    ),
    correct: ['a'],
    explanation: '`services` attaches helper containers (e.g. `postgres`) accessible by hostname during the job. `image` is the job\'s own container, `cache` reuses files, and `needs` builds a DAG.',
    references: [REF_CI_YAML]
  },
  {
    domain: CICD, difficulty: 3, type: QType.SINGLE,
    stem: 'What does `parallel: 5` on a job do?',
    options: opts4(
      'Runs the job 5 times in parallel as separate instances',
      'Retries the job 5 times',
      'Limits the job to 5 minutes',
      'Requires 5 runners to be online before starting'
    ),
    correct: ['a'],
    explanation: '`parallel: N` creates N parallel instances of the job (each with `CI_NODE_INDEX`/`CI_NODE_TOTAL`), often used to split test suites. It is not retry, timeout, or a runner-count gate.',
    references: [REF_CI_YAML]
  },
  {
    domain: CICD, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which keyword defines per-job or global environment variables directly in `.gitlab-ci.yml`?',
    options: opts4(
      'variables',
      'env',
      'export',
      'params'
    ),
    correct: ['a'],
    explanation: 'The `variables` keyword defines CI/CD variables globally or per job in the YAML. `env`, `export`, and `params` are not GitLab CI keywords for declaring variables.',
    references: [REF_CI_VARS, REF_CI_YAML]
  },
  {
    domain: CICD, difficulty: 3, type: QType.SINGLE,
    stem: 'A job has `artifacts: paths: [build/]` and `expire_in: 1 week`. What happens after one week?',
    options: opts4(
      'The job is deleted',
      'The stored artifacts for that job are removed automatically',
      'The pipeline reruns',
      'The cache is cleared'
    ),
    correct: ['b'],
    explanation: '`expire_in` controls how long artifacts are retained; after the period GitLab deletes those artifacts (unless kept as latest). It does not delete the job, rerun the pipeline, or clear cache.',
    references: [REF_CI_ARTIFACTS]
  },
  {
    domain: CICD, difficulty: 3, type: QType.SINGLE,
    stem: 'Which keyword lets a job start before earlier-stage jobs finish, based on an explicit dependency list (DAG)?',
    options: opts4(
      'needs',
      'stage',
      'only',
      'tags'
    ),
    correct: ['a'],
    explanation: '`needs` creates a directed acyclic graph so a job runs as soon as its needed jobs complete, ignoring strict stage ordering. `stage` enforces ordering, `only` filters inclusion, and `tags` selects runners.',
    references: [REF_CI_NEEDS]
  },
  {
    domain: CICD, difficulty: 4, type: QType.SINGLE,
    stem: 'A pipeline must deploy to staging automatically but require a click for production. How is this typically modeled?',
    options: opts4(
      'Both jobs use when: always',
      'staging deploy uses when: on_success; production deploy uses when: manual with environment: production',
      'Both jobs use when: never',
      'Use only the build stage'
    ),
    correct: ['b'],
    explanation: 'Automatic staging plus a manual production gate is the standard pattern: staging runs on success, production is a `when: manual` job with `environment: production` so a human approves the release.',
    references: [REF_CI_YAML, REF_CI_ENV]
  },
  {
    domain: CICD, difficulty: 2, type: QType.SINGLE,
    stem: 'What does `interruptible: true` on a job allow GitLab to do?',
    options: opts4(
      'Automatically cancel the job/pipeline if a newer pipeline starts for the same ref',
      'Pause the job for manual approval',
      'Retry the job indefinitely',
      'Run the job on any runner'
    ),
    correct: ['a'],
    explanation: '`interruptible: true` marks a job safe to cancel so GitLab can auto-cancel redundant running pipelines when a newer commit is pushed, saving CI minutes. It is not approval, retry, or runner selection.',
    references: [REF_CI_YAML]
  },

  // ── Project Management and Collaboration (7 more → 10) ──
  {
    domain: PM, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'What does mentioning `@username` in an issue or MR comment do?',
    options: opts4(
      'Assigns the issue to that user permanently',
      'Notifies (mentions) that user and creates a link to their profile',
      'Deletes that user',
      'Grants that user Owner access'
    ),
    correct: ['b'],
    explanation: '`@username` mentions the user, sending them a notification and linking their profile. It does not assign, delete, or change permissions.',
    references: [REF_ISSUES, REF_MR]
  },
  {
    domain: PM, difficulty: 2, type: QType.SINGLE,
    stem: 'Which quick action assigns the current issue to a user from a comment?',
    options: opts4(
      '/assign @user',
      '/owner @user',
      '/give @user',
      '/take @user only'
    ),
    correct: ['a'],
    explanation: '`/assign @user` sets the assignee (and `/assign me` assigns yourself). `/owner`, `/give`, and `/take @user only` are not the assign quick action.',
    references: [REF_ISSUES]
  },
  {
    domain: PM, difficulty: 2, type: QType.SINGLE,
    stem: 'What is an issue board list most commonly backed by?',
    options: opts4(
      'A label',
      'A commit',
      'A runner tag',
      'A cache key'
    ),
    correct: ['a'],
    explanation: 'Board lists are typically created from labels (or assignees/milestones); moving a card between label lists updates the issue\'s labels. Commits, runner tags, and cache keys do not back board lists.',
    references: [REF_BOARDS, REF_LABELS]
  },
  {
    domain: PM, difficulty: 3, type: QType.SINGLE,
    stem: 'How do epics differ from milestones?',
    options: opts4(
      'Epics are time-boxed; milestones group unrelated commits',
      'Epics group related issues (often across projects) under an initiative; milestones track a time-boxed scope of work',
      'They are identical features',
      'Milestones are a Git concept'
    ),
    correct: ['b'],
    explanation: 'Epics organize related issues (frequently across projects) toward a larger goal; milestones track a defined, often time-boxed set of issues/MRs with dates and progress. They are distinct, non-Git features.',
    references: [REF_EPICS, REF_MILESTONES]
  },
  {
    domain: PM, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Including `Closes #15` in a merge request description has what effect?',
    options: opts4(
      'It deletes issue #15 immediately',
      'It links the MR to issue #15 and closes it automatically when the MR merges to the default branch',
      'It assigns issue #15 to you',
      'It creates 15 new issues'
    ),
    correct: ['b'],
    explanation: 'Closing keywords like `Closes #15` in an MR description link the issue and auto-close it upon merge to the default branch. It does not delete immediately, assign, or create issues.',
    references: [REF_MR, REF_ISSUES]
  },
  {
    domain: PM, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about merge request approvals.',
    options: opts4(
      'You can require a minimum number of approvals before merging.',
      'Approval rules can require specific users or groups (e.g. code owners).',
      'An approval can be configured to be removed when new commits are pushed.',
      'Approvals are purely cosmetic and never block merging.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Approvals can enforce a minimum count, require specific approvers/groups, and optionally reset on new commits. They are an enforced merge gate, not cosmetic.',
    references: [REF_MR_APPROVALS]
  },
  {
    domain: PM, difficulty: 2, type: QType.SINGLE,
    stem: 'Which quick action sets a milestone on an issue from a comment?',
    options: opts4(
      '/milestone %"2.0 Release"',
      '/release 2.0',
      '/due 2.0',
      '/sprint 2.0'
    ),
    correct: ['a'],
    explanation: '`/milestone %"Milestone Name"` assigns a milestone via quick action. `/release`, `/due`, and `/sprint` are not the milestone quick action (`/due` sets a due date instead).',
    references: [REF_MILESTONES, REF_ISSUES]
  },

  // ── Security and Compliance Basics (7 more → 10) ──
  {
    domain: SEC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which role is the highest default privilege level for a project or group in GitLab?',
    options: opts4(
      'Owner',
      'Maintainer',
      'Developer',
      'Reporter'
    ),
    correct: ['a'],
    explanation: 'Owner is the top default role, able to administer the project/group including deletion, visibility, and member/role management. Maintainer is below it; Developer/Reporter are lower still.',
    references: [REF_PERMISSIONS]
  },
  {
    domain: SEC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which scanner inspects your own application source code (not dependencies) for insecure patterns without running it?',
    options: opts4(
      'Dependency Scanning',
      'SAST',
      'Secret Detection',
      'Container Scanning'
    ),
    correct: ['b'],
    explanation: 'SAST statically analyzes your source code for vulnerabilities. Dependency Scanning targets third-party libraries, Secret Detection finds credentials, and Container Scanning analyzes image OS/packages.',
    references: [REF_SAST]
  },
  {
    domain: SEC, difficulty: 3, type: QType.SINGLE,
    stem: 'A team wants every change to the default branch to be reviewed and to leave an auditable trail. Which combination best achieves this?',
    options: opts4(
      'Allow direct pushes and disable audit events',
      'Protect the branch, require MR approvals, and rely on audit events for change tracking',
      'Give all users Owner and remove approvals',
      'Use only Git stash'
    ),
    correct: ['b'],
    explanation: 'Protecting the branch with required approvals enforces review, while audit events provide the immutable record of who changed what — together forming a strong compliance control. The other options weaken or remove controls.',
    references: [REF_PROTECTED, REF_MR_APPROVALS, REF_AUDIT]
  },
  {
    domain: SEC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which project visibility level allows any authenticated user on the GitLab instance to view it, but not anonymous users?',
    options: opts4(
      'Public',
      'Internal',
      'Private',
      'Protected'
    ),
    correct: ['b'],
    explanation: 'Internal visibility lets any signed-in instance user view the project; Public allows anyone (including anonymous), and Private restricts to members. "Protected" is not a visibility level.',
    references: [REF_PERMISSIONS, REF_PROJECTS]
  },
  {
    domain: SEC, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL good practices for handling secrets in GitLab CI/CD.',
    options: opts4(
      'Store secrets as masked, protected CI/CD variables instead of in the repo.',
      'Use the short-lived CI_JOB_TOKEN or scoped tokens where possible.',
      'Commit production passwords directly in .gitlab-ci.yml for convenience.',
      'Rotate any credential that is detected as leaked.'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Best practice: keep secrets out of the repo (masked/protected variables), prefer short-lived/scoped tokens, and rotate leaked credentials. Committing production passwords into YAML is a serious anti-pattern.',
    references: [REF_CI_VARS, REF_SECRET]
  },
  {
    domain: SEC, difficulty: 3, type: QType.SINGLE,
    stem: 'Where do GitLab security scan results for an MR typically appear so reviewers can gate the merge?',
    options: opts4(
      'Only in email',
      'In the MR security widget / pipeline Security tab listing newly introduced vulnerabilities',
      'In the Git stash',
      'In the runner logs only'
    ),
    correct: ['b'],
    explanation: 'Scan results surface in the MR security widget and pipeline Security tab, highlighting vulnerabilities introduced by the change so reviewers can require fixes before merging.',
    references: [REF_SAST, REF_DEPSCAN]
  },
  {
    domain: SEC, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: The principle of least privilege suggests assigning users the lowest role that still lets them do their job (e.g. Reporter instead of Maintainer when they only need read access).',
    options: [
      { id: 'a', text: 'True' },
      { id: 'b', text: 'False' }
    ],
    correct: ['a'],
    explanation: 'True. Least privilege minimizes risk by granting only the access required; in GitLab that means choosing the lowest sufficient role (Guest/Reporter/Developer/Maintainer/Owner) for each user.',
    references: [REF_PERMISSIONS]
  }
];

// ───────────────────── Practice Exam 3 ─────────────────────
const P3: Q[] = [
  // ── Git and GitLab Fundamentals (4) ──
  {
    domain: FUND, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command shows the working tree status — which files are staged, modified, or untracked?',
    options: opts4(
      'git log',
      'git status',
      'git diff --cached',
      'git show'
    ),
    correct: ['b'],
    explanation: '`git status` summarizes staged, modified, and untracked files plus branch tracking info. `git log` shows commit history, `git diff --cached` shows only the staged diff, and `git show` displays a single commit.',
    references: [REF_GIT_BASICS]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You committed with a typo in the message and have not pushed yet. Which command edits the most recent commit message?',
    options: opts4(
      'git commit --amend',
      'git rebase --continue',
      'git revert HEAD',
      'git reset HEAD~1'
    ),
    correct: ['a'],
    explanation: '`git commit --amend` rewrites the latest commit (message and/or staged content). `git revert` creates a new commit that undoes changes, and `git reset HEAD~1` moves the branch pointer back rather than editing the message.',
    references: [REF_GIT_COMMIT]
  },
  {
    domain: FUND, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'True or False: A lightweight Git tag is essentially just a named pointer to a commit, while an annotated tag is a full object storing tagger, date, and a message.',
    options: [
      { id: 'a', text: 'True' },
      { id: 'b', text: 'False' }
    ],
    correct: ['a'],
    explanation: 'True. Lightweight tags are simple refs to a commit; annotated tags (`git tag -a`) are stored as full objects with metadata and can be GPG-signed, which is why annotated tags are recommended for releases.',
    references: [REF_GIT_TAGS]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command uploads your local `main` branch commits to the remote named `origin`?',
    options: opts4(
      'git fetch origin main',
      'git push origin main',
      'git pull origin main',
      'git clone origin main'
    ),
    correct: ['b'],
    explanation: '`git push origin main` sends local commits to the remote branch. `git fetch`/`git pull` download from the remote, and `git clone` creates a new local copy of a repository.',
    references: [REF_GIT_BASICS]
  },

  // ── Source Code Management and Workflows (4) ──
  {
    domain: SCM, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What is a GitLab project primarily a container for?',
    options: opts4(
      'Only CI/CD runners',
      'A repository plus its issues, merge requests, CI/CD, wiki, and related features',
      'Only billing and subscription data',
      'A single user account'
    ),
    correct: ['b'],
    explanation: 'A GitLab project bundles the Git repository together with issues, merge requests, pipelines, wiki, registry, and more. It is not limited to runners, billing, or a user account.',
    references: [REF_PROJECTS]
  },
  {
    domain: SCM, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A group Owner wants every new project under the group to inherit the same members and permissions automatically. Which structure achieves this?',
    options: opts4(
      'Create each project as a personal project and add members manually',
      'Place the projects in the group (or its subgroups); members and roles cascade down by inheritance',
      'Use a protected tag on each project',
      'Fork a template project for each new project'
    ),
    correct: ['b'],
    explanation: 'Group and subgroup membership cascades to contained projects, so adding a member at the group level grants inherited access to its projects. Personal projects, tags, and forking do not provide group-wide inherited membership.',
    references: [REF_GROUPS, REF_SUBGROUPS]
  },
  {
    domain: SCM, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about the GitLab fork-based contribution workflow.',
    options: opts4(
      'A fork is a server-side copy of a project that you own and can push to.',
      'You open a merge request from a branch in your fork targeting the upstream project.',
      'Forking requires Owner access on the upstream project.',
      'Maintainers of the upstream project can be allowed to edit the MR source branch.'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Forks are your own server-side copies; MRs go from your fork branch to upstream; and the "Allow commits from members who can merge to the target branch" option lets maintainers edit the source branch. Forking does NOT require Owner access — read access to a public/visible project is enough.',
    references: [REF_FORK]
  },
  {
    domain: SCM, difficulty: 2, type: QType.SINGLE,
    stem: 'In GitLab Flow, why is the main branch generally kept deployable at all times?',
    options: opts4(
      'So that broken code can be released faster',
      'Because feature work is integrated only after passing review and CI, keeping main stable and releasable',
      'Because main cannot be protected',
      'Because GitLab forbids feature branches'
    ),
    correct: ['b'],
    explanation: 'GitLab Flow keeps main releasable by merging only reviewed, CI-passing changes via merge requests. Main can and should be protected, and feature branches are central to the flow — not forbidden.',
    references: [REF_GITLAB_FLOW]
  },

  // ── CI/CD Pipelines (6) ──
  {
    domain: CICD, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What is the role of a GitLab Runner?',
    options: opts4(
      'It stores the project\'s Git history',
      'It is the agent that picks up CI/CD jobs and executes them',
      'It renders the merge request diff',
      'It manages user permissions'
    ),
    correct: ['b'],
    explanation: 'A GitLab Runner is the agent that polls GitLab for jobs and runs them (using an executor such as docker or shell). It does not store Git history, render diffs, or manage permissions.',
    references: [REF_RUNNERS]
  },
  {
    domain: CICD, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A pipeline uses a job with `trigger: include: child-pipeline.yml`. This creates which kind of pipeline relationship?',
    options: opts4(
      'A merge request pipeline',
      'A parent-child pipeline, where the parent triggers a separate child pipeline',
      'A scheduled pipeline',
      'A manual pipeline only'
    ),
    correct: ['b'],
    explanation: 'Using `trigger` to run another configuration creates a parent-child (downstream) pipeline; the child runs as its own pipeline orchestrated by the parent. This is distinct from merge request, scheduled, or manual pipeline types.',
    references: [REF_CI_PARENT_CHILD]
  },
  {
    domain: CICD, difficulty: 3, type: QType.SINGLE,
    stem: 'A `build` job produces a compiled binary that a later `test` job must use. Which keyword should `build` use so the file is passed forward reliably?',
    options: opts4(
      'cache:',
      'artifacts:',
      'services:',
      'variables:'
    ),
    correct: ['b'],
    explanation: 'Build outputs that must reach later jobs should be declared as `artifacts`, which GitLab stores and passes to downstream jobs by default. `cache` is best-effort reuse between runs and is not a reliable hand-off mechanism.',
    references: [REF_CI_ARTIFACTS, REF_CI_CACHE]
  },
  {
    domain: CICD, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about `rules` vs `only`/`except` in GitLab CI/CD.',
    options: opts4(
      'rules is the recommended, more flexible mechanism and can use rules:if and rules:changes.',
      'only/except are older keywords and should not be combined with rules in the same job.',
      'rules can set when and allow_failure per condition.',
      'only/except can evaluate complex CI/CD variable expressions exactly like rules:if.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'rules is the modern, flexible approach (supports `if`, `changes`, per-rule `when`/`allow_failure`) and must not be mixed with only/except in the same job. only/except are simpler and do NOT support the full expression capability of rules:if.',
    references: [REF_CI_RULES]
  },
  {
    domain: CICD, difficulty: 4, type: QType.SINGLE,
    stem: 'You want a CI/CD job to build and push a Docker image to the project\'s built-in image storage. Which GitLab feature is that storage?',
    options: opts4(
      'GitLab Pages',
      'The Container Registry',
      'The CI/CD cache',
      'Job artifacts'
    ),
    correct: ['b'],
    explanation: 'The GitLab Container Registry is the integrated registry for storing/distributing Docker images per project (with predefined `CI_REGISTRY*` variables). Pages hosts static sites; cache/artifacts store build files, not container images.',
    references: [REF_REGISTRY]
  },
  {
    domain: CICD, difficulty: 3, type: QType.SINGLE,
    stem: 'A job named `pages` publishes the contents of its `public/` directory as a static website. Which GitLab feature does this?',
    options: opts4(
      'GitLab Pages',
      'Container Registry',
      'Environments',
      'Releases'
    ),
    correct: ['a'],
    explanation: 'GitLab Pages serves a static site from artifacts produced by a job conventionally named `pages` that exposes a `public/` directory. The Registry stores images, Environments track deployments, and Releases publish versioned release notes/assets.',
    references: [REF_PAGES]
  },

  // ── Project Management and Collaboration (3) ──
  {
    domain: PM, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which merge method results in a single commit on the target branch that combines all of the merge request\'s commits?',
    options: opts4(
      'Merge commit',
      'Squash and merge (squashing the MR commits into one)',
      'Fast-forward only',
      'Cherry-pick each commit individually'
    ),
    correct: ['b'],
    explanation: 'Squash combines all MR commits into a single commit on the target branch, keeping history tidy. A plain merge commit preserves individual commits, fast-forward keeps them linearly, and cherry-pick is a separate manual operation.',
    references: [REF_MR_METHODS]
  },
  {
    domain: PM, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'You want a merge request to merge automatically as soon as its pipeline passes, without watching it. Which feature do you use?',
    options: opts4(
      'Draft status',
      'Merge when pipeline succeeds (auto-merge)',
      'Closing the linked issue',
      'Adding a milestone'
    ),
    correct: ['b'],
    explanation: 'Auto-merge ("Merge when pipeline succeeds") queues the MR to merge automatically once the pipeline is green and other conditions are met. Draft blocks merging, and issues/milestones do not trigger merges.',
    references: [REF_MWPS]
  },
  {
    domain: PM, difficulty: 2, type: QType.SINGLE,
    stem: 'Which feature lets you apply colored, named categories to issues and merge requests for filtering and board organization?',
    options: opts4(
      'Labels',
      'Tags',
      'Releases',
      'Runners'
    ),
    correct: ['a'],
    explanation: 'Labels are colored, named categories applied to issues/MRs/epics, used for filtering and board lists. Git tags mark commits, releases publish versioned artifacts, and runners execute CI jobs.',
    references: [REF_LABELS]
  },

  // ── Security and Compliance Basics (3) ──
  {
    domain: SEC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which default role is required to administer project settings, manage members, and configure protected branches (short of full Owner)?',
    options: opts4(
      'Guest',
      'Reporter',
      'Developer',
      'Maintainer'
    ),
    correct: ['d'],
    explanation: 'Maintainer can manage project settings, members, and protected branches. Guest/Reporter are read-oriented, Developer can push to non-protected branches but not administer the project; Owner is the top-level role.',
    references: [REF_PERMISSIONS]
  },
  {
    domain: SEC, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'True or False: GitLab security scanners such as SAST and Secret Detection are typically run as jobs inside the CI/CD pipeline.',
    options: [
      { id: 'a', text: 'True' },
      { id: 'b', text: 'False' }
    ],
    correct: ['a'],
    explanation: 'True. GitLab security scanning (SAST, Secret Detection, Dependency Scanning, etc.) is delivered as CI/CD jobs (often via includable templates), so results appear in the pipeline and merge request security widget.',
    references: [REF_SAST, REF_SECRET]
  },
  {
    domain: SEC, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'For compliance, an organization needs an immutable record of who changed group membership and when. Which capability provides this?',
    options: opts4(
      'CI/CD pipeline logs',
      'Audit events / audit logging',
      'Issue comments',
      'The container registry'
    ),
    correct: ['b'],
    explanation: 'Audit events capture security/compliance-relevant changes (membership, permissions, settings) with actor and timestamp for review. Pipeline logs, issue comments, and the registry are not designed as the authoritative audit trail.',
    references: [REF_AUDIT, REF_COMPLIANCE]
  },

  // ── Git and GitLab Fundamentals (16 more → 20) ──
  {
    domain: FUND, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'What is the primary purpose of `git add`?',
    options: opts4(
      'To create a new branch',
      'To stage changes so they are included in the next commit',
      'To upload commits to the remote',
      'To delete files from history'
    ),
    correct: ['b'],
    explanation: '`git add` moves working-tree changes into the staging area (index) for the next commit. Branching, pushing, and history rewriting use different commands.',
    references: [REF_GIT_COMMIT]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command commits all changes to already-tracked files without separately running `git add`?',
    options: opts4(
      'git commit -a -m "msg"',
      'git commit --new -m "msg"',
      'git add --commit -m "msg"',
      'git push -a -m "msg"'
    ),
    correct: ['a'],
    explanation: '`git commit -a -m "msg"` auto-stages modifications and deletions of tracked files, then commits. It does NOT include brand-new untracked files (those still need `git add`).',
    references: [REF_GIT_COMMIT]
  },
  {
    domain: FUND, difficulty: 3, type: QType.SINGLE,
    stem: 'You want to temporarily save uncommitted work including untracked files before switching context. Which command does that?',
    options: opts4(
      'git stash -u (or --include-untracked)',
      'git reset --hard',
      'git clean -fd',
      'git commit -u'
    ),
    correct: ['a'],
    explanation: '`git stash -u` (`--include-untracked`) stashes modified tracked files plus untracked files, leaving a clean tree to restore later. `reset --hard`/`clean -fd` destroy changes, and `commit -u` is not valid.',
    references: [REF_GIT_STASH]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What does `git pull --rebase` do differently from a plain `git pull`?',
    options: opts4(
      'It deletes local commits',
      'It fetches and then rebases your local commits on top of the updated remote branch instead of creating a merge commit',
      'It pushes instead of pulling',
      'It only fetches without integrating'
    ),
    correct: ['b'],
    explanation: '`git pull --rebase` replays your local commits on top of the fetched remote tip, producing a linear history without a merge commit. Plain `git pull` merges instead. It does not delete commits or push.',
    references: [REF_GIT_REBASE, REF_GIT_BASICS]
  },
  {
    domain: FUND, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: A lightweight tag and a branch are the same thing in Git.',
    options: [
      { id: 'a', text: 'True' },
      { id: 'b', text: 'False' }
    ],
    correct: ['b'],
    explanation: 'False. Both are refs, but a branch is meant to move as you commit, while a tag is intended as a fixed marker on a specific commit (e.g. a release point) and does not advance automatically.',
    references: [REF_GIT_TAGS, REF_GIT_BASICS]
  },
  {
    domain: FUND, difficulty: 3, type: QType.SINGLE,
    stem: 'Which command lists which commit and author last modified each line of `app.py`?',
    options: opts4(
      'git blame app.py',
      'git log app.py',
      'git diff app.py',
      'git show app.py'
    ),
    correct: ['a'],
    explanation: '`git blame app.py` annotates each line with the commit, author, and timestamp that last changed it. `git log` shows commit history, `diff` shows changes, and `show` displays a commit.',
    references: [REF_GIT_BASICS]
  },
  {
    domain: FUND, difficulty: 1, type: QType.SINGLE,
    stem: 'Which command downloads new commits and refs from `origin` without changing your working branch?',
    options: opts4(
      'git fetch origin',
      'git pull origin',
      'git merge origin',
      'git push origin'
    ),
    correct: ['a'],
    explanation: '`git fetch origin` updates remote-tracking refs only. `git pull` also integrates them into the current branch, `git merge` combines branches, and `git push` uploads commits.',
    references: [REF_GIT_BASICS]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'What does `git checkout -- file.txt` (or `git restore file.txt`) do?',
    options: opts4(
      'Stages file.txt',
      'Discards unstaged changes in file.txt, restoring it to the last committed version',
      'Deletes file.txt from history',
      'Creates a branch named file.txt'
    ),
    correct: ['b'],
    explanation: 'It reverts working-tree changes for that file to the committed state, discarding unstaged edits. It does not stage, rewrite history, or create a branch.',
    references: [REF_GIT_BASICS]
  },
  {
    domain: FUND, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Git as a distributed VCS.',
    options: opts4(
      'Each clone contains the full project history.',
      'You can commit locally without network access.',
      'A central server is mandatory for making any commit.',
      'Branching and merging are core, lightweight operations.'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Distributed Git gives every clone full history, allows offline local commits, and treats branching/merging as cheap operations. A central server is a convention (e.g. GitLab) but not required to commit.',
    references: [REF_GIT_BASICS]
  },

  // ── Source Code Management and Workflows (9 more → 13) ──
  {
    domain: SCM, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What is the recommended way to integrate a finished feature branch into main in GitLab?',
    options: opts4(
      'Push directly to main',
      'Open a merge request from the feature branch to main and merge after review/CI',
      'Email the diff to a maintainer',
      'Rename main to the feature branch'
    ),
    correct: ['b'],
    explanation: 'Open an MR from the feature branch targeting main; after review and a green pipeline it is merged. Direct pushes bypass review/CI, and emailing/renaming are not GitLab workflows.',
    references: [REF_MR, REF_GITLAB_FLOW]
  },
  {
    domain: SCM, difficulty: 3, type: QType.SINGLE,
    stem: 'Which protected-branch capability requires that the person who pushed/authored a change cannot also be its sole approver?',
    options: opts4(
      'Prevent approval by the author / separation-of-duties approval settings',
      'Squash commits',
      'Delete source branch',
      'Fast-forward merge'
    ),
    correct: ['a'],
    explanation: 'GitLab approval settings can prevent authors (and optionally committers) from approving their own MRs, enforcing separation of duties. Squash, delete-source-branch, and fast-forward are merge behaviors, not approval controls.',
    references: [REF_MR_APPROVALS, REF_PROTECTED]
  },
  {
    domain: SCM, difficulty: 2, type: QType.SINGLE,
    stem: 'What does the target branch field of a merge request specify?',
    options: opts4(
      'The branch the source changes will be merged into',
      'The branch that contains the proposed changes',
      'The runner that builds the MR',
      'The label applied to the MR'
    ),
    correct: ['a'],
    explanation: 'The target branch is where the MR\'s changes will land (often the default branch). The source branch holds the proposed changes; runners and labels are unrelated to this field.',
    references: [REF_MR]
  },
  {
    domain: SCM, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about protected branches and merge requests working together.',
    options: opts4(
      'Setting push to "No one" forces changes through merge requests.',
      'You can require approvals before a protected branch MR can merge.',
      'Code owner approval can be required for protected branches.',
      'Protected branches automatically merge all open MRs.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Protecting a branch (no direct push) plus required approvals and optional code-owner approval enforces a reviewed MR workflow. Protected branches do NOT auto-merge open MRs.',
    references: [REF_PROTECTED, REF_MR_APPROVALS]
  },
  {
    domain: SCM, difficulty: 2, type: QType.SINGLE,
    stem: 'Why might a team choose "Squash and merge" as the default merge method?',
    options: opts4(
      'To preserve every WIP commit on main',
      'To keep the target branch history clean with one tidy commit per merge request',
      'To delete the target branch',
      'To skip code review'
    ),
    correct: ['b'],
    explanation: 'Squashing condenses an MR\'s many work-in-progress commits into a single coherent commit on the target branch, keeping history clean. It does not delete branches or bypass review.',
    references: [REF_MR_METHODS]
  },
  {
    domain: SCM, difficulty: 3, type: QType.SINGLE,
    stem: 'A subgroup `team-a` is under group `engineering`. A user added as Developer on `engineering` has what access to projects in `team-a`?',
    options: opts4(
      'No access at all',
      'Inherited Developer access to projects in team-a via group membership cascade',
      'Owner access automatically',
      'Read-only regardless of role'
    ),
    correct: ['b'],
    explanation: 'Membership cascades down the namespace: a Developer on `engineering` inherits Developer access to subgroups like `team-a` and their projects (unless further restricted). It is neither no access nor automatic Owner.',
    references: [REF_GROUPS, REF_SUBGROUPS]
  },
  {
    domain: SCM, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'In a fork-based contribution, where do you push your changes?',
    options: opts4(
      'Directly to the upstream default branch',
      'To a branch in your own fork, then open a merge request to upstream',
      'To the upstream wiki',
      'To the container registry'
    ),
    correct: ['b'],
    explanation: 'You push to a branch in your fork (which you own) and open an MR from there to upstream. You cannot push to upstream without access, and the wiki/registry are not contribution paths.',
    references: [REF_FORK, REF_MR]
  },
  {
    domain: SCM, difficulty: 3, type: QType.SINGLE,
    stem: 'Which GitLab Flow practice keeps production deployable and traceable?',
    options: opts4(
      'Committing experimental code straight to the production branch',
      'Merging only reviewed, CI-passing changes forward through environment/main branches via merge requests',
      'Force-pushing to production nightly',
      'Disabling pipelines for production'
    ),
    correct: ['b'],
    explanation: 'GitLab Flow promotes only reviewed, tested changes forward via MRs, keeping production deployable and changes traceable. Direct/experimental commits or force-pushes to production undermine stability and traceability.',
    references: [REF_GITLAB_FLOW]
  },
  {
    domain: SCM, difficulty: 2, type: QType.SINGLE,
    stem: 'What does adding `upstream` as a remote let a fork owner do?',
    options: opts4(
      'Push directly to the original project',
      'Fetch the latest changes from the original project to keep the fork in sync',
      'Delete the original project',
      'Bypass merge requests'
    ),
    correct: ['b'],
    explanation: 'An `upstream` remote lets the fork owner fetch and merge/rebase the original project\'s latest changes to stay current. It does not grant push access or bypass MRs.',
    references: [REF_FORK]
  },

  // ── CI/CD Pipelines (13 more → 19) ──
  {
    domain: CICD, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'What is a GitLab CI/CD pipeline?',
    options: opts4(
      'A single Git branch',
      'A collection of jobs grouped into stages that automate build, test, and deploy',
      'A user role',
      'A container image registry'
    ),
    correct: ['b'],
    explanation: 'A pipeline is the top-level CI/CD construct: jobs organized into ordered stages that automate building, testing, and deploying. It is not a branch, role, or registry.',
    references: [REF_CI_INTRO]
  },
  {
    domain: CICD, difficulty: 2, type: QType.SINGLE,
    stem: 'Within one stage, if two jobs are defined, how do they execute (given enough runners)?',
    options: opts4(
      'Sequentially, alphabetically',
      'In parallel',
      'Only the last one runs',
      'They merge into a single job'
    ),
    correct: ['b'],
    explanation: 'Jobs in the same stage run in parallel (subject to runner availability); the pipeline advances only when all of them succeed. They are not serialized or merged.',
    references: [REF_CI_STAGES]
  },
  {
    domain: CICD, difficulty: 2, type: QType.SINGLE,
    stem: 'Which keyword would you use to ensure a job runs even if a previous-stage job failed (e.g. for notifications)?',
    options: opts4(
      'when: always',
      'when: on_success',
      'when: never',
      'allow_failure: false'
    ),
    correct: ['a'],
    explanation: '`when: always` runs the job regardless of earlier success/failure, useful for notifications/cleanup. `on_success` (default) skips it on failure, `never` disables it, and `allow_failure` does not control run conditions.',
    references: [REF_CI_YAML]
  },
  {
    domain: CICD, difficulty: 3, type: QType.SINGLE,
    stem: 'A job should only run on the default branch. Which rule is correct?',
    options: opts4(
      'rules: - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH',
      'rules: - if: $CI_MERGE_REQUEST_IID',
      'only: tags',
      'when: manual'
    ),
    correct: ['a'],
    explanation: 'Comparing `$CI_COMMIT_BRANCH` to `$CI_DEFAULT_BRANCH` restricts the job to the default branch. The MR variable matches MR pipelines, `only: tags` matches tags, and `when: manual` only changes trigger mode.',
    references: [REF_CI_RULES, REF_CI_VARS]
  },
  {
    domain: CICD, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about artifacts.',
    options: opts4(
      'Artifacts can be browsed/downloaded from the GitLab UI.',
      'Artifacts can be passed to jobs in later stages by default.',
      'expire_in controls how long artifacts are retained.',
      'Artifacts are the same as cache and have identical guarantees.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Artifacts are stored by GitLab, downloadable, passed downstream by default, and expire via `expire_in`. They are NOT the same as cache — artifacts are reliable hand-offs while cache is best-effort.',
    references: [REF_CI_ARTIFACTS, REF_CI_CACHE]
  },
  {
    domain: CICD, difficulty: 2, type: QType.SINGLE,
    stem: 'Which predefined variable holds the full commit SHA of the pipeline\'s commit?',
    options: opts4(
      'CI_COMMIT_SHA',
      'CI_PIPELINE_SOURCE',
      'CI_JOB_ID',
      'CI_PROJECT_NAME'
    ),
    correct: ['a'],
    explanation: '`CI_COMMIT_SHA` is the commit hash being built. `CI_PIPELINE_SOURCE` is what triggered the pipeline, `CI_JOB_ID` the job ID, and `CI_PROJECT_NAME` the project name.',
    references: [REF_CI_VARS]
  },
  {
    domain: CICD, difficulty: 3, type: QType.SINGLE,
    stem: 'A deploy job uses `environment: name: staging`. Where can you see the deployment history for staging?',
    options: opts4(
      'In the Git stash',
      'On the project\'s Environments page (Deployments)',
      'In the container registry tags',
      'In the issue board'
    ),
    correct: ['b'],
    explanation: 'Declaring an environment records deployments visible on the Environments/Deployments page, including history and the ability to re-deploy or roll back. Stash, registry, and boards do not track deployments.',
    references: [REF_CI_ENV]
  },
  {
    domain: CICD, difficulty: 3, type: QType.SINGLE,
    stem: 'Which keyword would let a job download artifacts from only a specific named job in an earlier stage?',
    options: opts4(
      'dependencies: [build_linux]',
      'cache: build_linux',
      'image: build_linux',
      'stage: build_linux'
    ),
    correct: ['a'],
    explanation: '`dependencies: [build_linux]` restricts artifact downloads to that job. `cache`, `image`, and `stage` serve different purposes and do not scope artifact fetching.',
    references: [REF_CI_ARTIFACTS]
  },
  {
    domain: CICD, difficulty: 4, type: QType.SINGLE,
    stem: 'You need build → test → deploy where deploy starts immediately after its specific build job (skip waiting for unrelated test jobs). What do you use?',
    options: opts4(
      'parallel on deploy',
      'needs: ["build_app"] on the deploy job to form a DAG',
      'allow_failure on test jobs',
      'cache:key on deploy'
    ),
    correct: ['b'],
    explanation: 'Adding `needs: ["build_app"]` to deploy creates a DAG so deploy runs as soon as `build_app` completes, regardless of unrelated jobs/stages. `parallel`, `allow_failure`, and `cache:key` do not change ordering this way.',
    references: [REF_CI_NEEDS]
  },
  {
    domain: CICD, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What does the `image:` keyword at the top level of `.gitlab-ci.yml` (outside any job) define?',
    options: opts4(
      'The default container image used by all jobs unless they override it',
      'The Git branch to build',
      'The runner host',
      'The artifact retention'
    ),
    correct: ['a'],
    explanation: 'A top-level `image` sets the default job container; individual jobs can override it with their own `image`. It does not pick branches, runner hosts, or artifact retention.',
    references: [REF_CI_YAML]
  },
  {
    domain: CICD, difficulty: 3, type: QType.SINGLE,
    stem: 'Which keyword delays a job\'s start by a configured period after it becomes eligible?',
    options: opts4(
      'when: delayed (with start_in)',
      'timeout',
      'retry',
      'interruptible'
    ),
    correct: ['a'],
    explanation: '`when: delayed` with `start_in: <duration>` schedules the job to start after a delay (e.g. delayed rollouts). `timeout` caps runtime, `retry` re-runs failures, and `interruptible` enables auto-cancel.',
    references: [REF_CI_YAML]
  },
  {
    domain: CICD, difficulty: 3, type: QType.SINGLE,
    stem: 'How do you reuse a common job definition defined as `.deploy_base` for two deploy jobs?',
    options: opts4(
      'extends: .deploy_base in each deploy job',
      'include: .deploy_base',
      'needs: .deploy_base',
      'trigger: .deploy_base'
    ),
    correct: ['a'],
    explanation: '`extends: .deploy_base` inherits and lets each job override the hidden template\'s configuration. `include` is for external files, `needs` builds a DAG, and `trigger` starts downstream pipelines.',
    references: [REF_CI_YAML]
  },
  {
    domain: CICD, difficulty: 2, type: QType.SINGLE,
    stem: 'What does `coverage: \'/Total.*?(\\d+\\.\\d+)%/\'` in a job do?',
    options: opts4(
      'Sets the test timeout',
      'Extracts a code coverage percentage from job output to display in the UI/MR',
      'Defines artifacts',
      'Selects a runner'
    ),
    correct: ['b'],
    explanation: 'The `coverage` keyword applies a regex to the job log to capture a coverage percentage that GitLab then displays on the pipeline/MR. It is unrelated to timeouts, artifacts, or runner selection.',
    references: [REF_CI_YAML]
  },

  // ── Project Management and Collaboration (7 more → 10) ──
  {
    domain: PM, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'What does referencing `#42` in an issue or MR comment create?',
    options: opts4(
      'A deletion of issue 42',
      'A cross-link/reference to issue number 42',
      'A new merge request',
      'An assignment to user 42'
    ),
    correct: ['b'],
    explanation: 'In GitLab, `#42` links issue 42 (and `!42` links MR 42). It creates a navigable cross-reference, not a deletion, MR, or assignment.',
    references: [REF_ISSUES]
  },
  {
    domain: PM, difficulty: 2, type: QType.SINGLE,
    stem: 'Which feature is best for grouping related issues across multiple projects under one initiative?',
    options: opts4(
      'Epics',
      'Labels only',
      'Git tags',
      'Snippets'
    ),
    correct: ['a'],
    explanation: 'Epics (a group-level feature) collect related issues that may span projects under a single initiative with their own timeline. Labels categorize but do not provide hierarchy; tags/snippets are unrelated.',
    references: [REF_EPICS]
  },
  {
    domain: PM, difficulty: 2, type: QType.SINGLE,
    stem: 'A quick action `/spend 2h` on an issue does what?',
    options: opts4(
      'Records 2 hours of time spent on the issue',
      'Sets a 2-hour due date',
      'Closes the issue after 2 hours',
      'Assigns 2 users'
    ),
    correct: ['a'],
    explanation: '`/spend 2h` logs time spent (paired with `/estimate` for the estimate). It is not a due date, auto-close timer, or assignment action.',
    references: [REF_ISSUES]
  },
  {
    domain: PM, difficulty: 3, type: QType.SINGLE,
    stem: 'Which capability lets you see remaining vs completed work for a milestone over its timeframe?',
    options: opts4(
      'Burndown/burnup charts',
      'CI/CD cache',
      'Container registry',
      'Git reflog'
    ),
    correct: ['a'],
    explanation: 'Milestone burndown/burnup charts visualize progress (remaining/completed work) across the milestone period. Cache, registry, and reflog are unrelated to milestone tracking.',
    references: [REF_MILESTONES]
  },
  {
    domain: PM, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'How does a label-based issue board column relate to issue labels?',
    options: opts4(
      'Each board list maps to a label; moving a card changes the issue\'s labels accordingly',
      'Board lists ignore labels entirely',
      'A board can only have one list',
      'Boards delete labels when used'
    ),
    correct: ['a'],
    explanation: 'Label-based board lists correspond to labels; dragging a card between lists updates the issue\'s labels to match the destination list. Boards support many lists and do not delete labels.',
    references: [REF_BOARDS, REF_LABELS]
  },
  {
    domain: PM, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about GitLab issues.',
    options: opts4(
      'Issues can have assignees, labels, milestones, and a due date.',
      'Issues support threaded discussion and mentions.',
      'Closing keywords in a merged MR can auto-close linked issues.',
      'Issues are stored as Git tags in the repository.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Issues support assignees, labels, milestones, due dates, threaded discussion/mentions, and auto-close via MR keywords. They are stored in GitLab\'s database, NOT as Git tags in the repo.',
    references: [REF_ISSUES, REF_MR]
  },
  {
    domain: PM, difficulty: 2, type: QType.SINGLE,
    stem: 'What does the `/label ~bug` quick action do in an issue?',
    options: opts4(
      'Adds the bug label to the issue',
      'Deletes all labels',
      'Closes the issue',
      'Creates a label called issue'
    ),
    correct: ['a'],
    explanation: '`/label ~bug` applies the `bug` label (`/unlabel` removes labels). It does not delete all labels, close the issue, or create a label named "issue".',
    references: [REF_LABELS, REF_ISSUES]
  },

  // ── Security and Compliance Basics (7 more → 10) ──
  {
    domain: SEC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which default role can push to non-protected branches but cannot manage project members or settings?',
    options: opts4(
      'Guest',
      'Reporter',
      'Developer',
      'Owner'
    ),
    correct: ['c'],
    explanation: 'Developer can push to non-protected branches and open MRs but cannot administer members/settings/protected branches (that needs Maintainer/Owner). Guest/Reporter cannot push code.',
    references: [REF_PERMISSIONS]
  },
  {
    domain: SEC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which scanner is specifically aimed at finding committed credentials such as tokens and keys?',
    options: opts4(
      'SAST',
      'Secret Detection',
      'Dependency Scanning',
      'Container Scanning'
    ),
    correct: ['b'],
    explanation: 'Secret Detection scans code and history for leaked credentials. SAST analyzes code logic, Dependency Scanning checks libraries, and Container Scanning inspects image packages.',
    references: [REF_SECRET]
  },
  {
    domain: SEC, difficulty: 3, type: QType.SINGLE,
    stem: 'An organization needs to prove that every production change was reviewed by someone other than the author. Which combination supports this audit requirement?',
    options: opts4(
      'Allow self-approval and disable logging',
      'Require MR approvals with author self-approval prevented, plus audit events',
      'Give all users Owner',
      'Use only Git tags'
    ),
    correct: ['b'],
    explanation: 'Requiring approvals while preventing the author from approving enforces independent review (separation of duties), and audit events provide the immutable proof. Self-approval or universal Owner undermines the control.',
    references: [REF_MR_APPROVALS, REF_AUDIT]
  },
  {
    domain: SEC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which project visibility allows anyone, including users who are not signed in, to view the project?',
    options: opts4(
      'Private',
      'Internal',
      'Public',
      'Restricted'
    ),
    correct: ['c'],
    explanation: 'Public visibility lets anyone (including anonymous visitors) view the project. Internal requires sign-in, Private restricts to members, and "Restricted" is not a visibility level.',
    references: [REF_PERMISSIONS, REF_PROJECTS]
  },
  {
    domain: SEC, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about GitLab security scanning.',
    options: opts4(
      'Scanners typically run as CI/CD jobs, often added via include templates.',
      'Findings appear in the pipeline Security tab and the MR security widget.',
      'SAST analyzes source code without executing it.',
      'Security scanners replace the need for code review.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'GitLab scanners run as CI jobs (added via templates), surface results in the pipeline/MR, and SAST is static analysis. They complement — but do NOT replace — human code review and approvals.',
    references: [REF_SAST, REF_SECRET]
  },
  {
    domain: SEC, difficulty: 3, type: QType.SINGLE,
    stem: 'A live token was leaked in a commit. Beyond removing it from code, what is essential?',
    options: opts4(
      'Nothing else is needed',
      'Revoke/rotate the token because it remains recoverable in Git history',
      'Make the project public',
      'Add it to .gitignore'
    ),
    correct: ['b'],
    explanation: 'Because Git history retains the secret, deleting it from the latest code is insufficient — the token must be revoked/rotated. `.gitignore` only affects future tracking, not existing history.',
    references: [REF_SECRET]
  },
  {
    domain: SEC, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: Storing a deploy key or token as a masked, protected CI/CD variable is more secure than committing it to the repository.',
    options: [
      { id: 'a', text: 'True' },
      { id: 'b', text: 'False' }
    ],
    correct: ['a'],
    explanation: 'True. Masked/protected variables keep secrets out of Git history, hide them in logs, and limit exposure to protected branches/tags — far safer than committing them into the repository.',
    references: [REF_CI_VARS, REF_SECRET]
  }
];

const GITLAB_DOMAINS = [
  { name: FUND, weight: 20 },
  { name: SCM, weight: 20 },
  { name: CICD, weight: 30 },
  { name: PM, weight: 15 },
  { name: SEC, weight: 15 }
];

const GITLAB_EXAMS: { slug: string; code: string; titleSuffix: string; descriptionSuffix: string; questions: Q[] }[] = [
  {
    slug: 'gitlab-certified-associate-p1',
    code: 'GLCA-P1',
    titleSuffix: 'Practice Exam 1',
    descriptionSuffix: 'Practice exam 1 of 3 — full 60-minute, 65-question, blueprint-weighted set covering Git fundamentals, source code management & workflows, CI/CD pipelines, project management & collaboration, and security & compliance basics.',
    questions: P1
  },
  {
    slug: 'gitlab-certified-associate-p2',
    code: 'GLCA-P2',
    titleSuffix: 'Practice Exam 2',
    descriptionSuffix: 'Practice exam 2 of 3 — a second 60-minute, 65-question, blueprint-weighted set.',
    questions: P2
  },
  {
    slug: 'gitlab-certified-associate-p3',
    code: 'GLCA-P3',
    titleSuffix: 'Practice Exam 3',
    descriptionSuffix: 'Practice exam 3 of 3 — a third 60-minute, 65-question, blueprint-weighted set.',
    questions: P3
  }
];

const GITLAB_BUNDLE = {
  slug: 'gitlab-certified-associate',
  title: 'GitLab Certified Associate',
  description: 'All 3 GitLab Certified Associate practice exams in one bundle — covering Git and GitLab fundamentals, source code management & workflows, CI/CD pipelines, project management & collaboration, and security & compliance basics, aligned to the GitLab Certified Associate curriculum.',
  price: 2000, // USD 20 — PRACTICE tier
  priceVoucher: 9900 // USD 99 — VOUCHER tier
};

type SeedResult = {
  vendor: 'created' | 'updated';
  exams: { slug: string; questionCount: number; teaserCount: number }[];
  bundle: 'created' | 'updated';
};

/**
 * Idempotent seed for the GitLab Certified Associate bundle. Safe to
 * call repeatedly — vendor / exam / bundle rows are upserted, and
 * questions tagged `generatedBy: 'manual:gitlab-seed'` are deleted and
 * re-created.
 *
 * Pass an existing PrismaClient (lifecycle managed by caller).
 */
export async function seedGitlab(db: PrismaClient): Promise<SeedResult> {
  const existingVendor = await db.vendor.findUnique({ where: { slug: 'gitlab' } });
  await db.vendor.upsert({
    where: { slug: 'gitlab' },
    update: { name: 'GitLab', description: 'GitLab certifications — Git workflows, CI/CD pipelines, DevSecOps, and the GitLab Certified Associate credential.' },
    create: { slug: 'gitlab', name: 'GitLab', description: 'GitLab certifications — Git workflows, CI/CD pipelines, DevSecOps, and the GitLab Certified Associate credential.' }
  });
  const vendor = await db.vendor.findUniqueOrThrow({ where: { slug: 'gitlab' } });

  const examResults: SeedResult['exams'] = [];
  const examIds: Record<string, string> = {};

  for (const e of GITLAB_EXAMS) {
    const title = `GitLab Certified Associate — ${e.titleSuffix}`;
    const description = `${e.descriptionSuffix} Aligned to the GitLab Certified Associate curriculum.`;
    const examData = {
      title,
      code: e.code,
      description,
      level: 'Associate',
      durationMinutes: 60,
      passingScore: 70,
      questionCount: e.questions.length,
      domains: GITLAB_DOMAINS,
      published: true
    };
    const exam = await db.exam.upsert({
      where: { slug: e.slug },
      update: examData,
      create: { ...examData, slug: e.slug, vendorId: vendor.id }
    });
    examIds[e.slug] = exam.id;

    await db.question.deleteMany({ where: { examId: exam.id, generatedBy: 'manual:gitlab-seed' } });
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
          generatedBy: 'manual:gitlab-seed',
          isTeaser: !!q.isTeaser
        }
      });
      if (q.isTeaser) teaserCount++;
    }
    examResults.push({ slug: e.slug, questionCount: e.questions.length, teaserCount });
  }

  const existingBundle = await db.bundle.findUnique({ where: { slug: GITLAB_BUNDLE.slug } });
  const bundle = await db.bundle.upsert({
    where: { slug: GITLAB_BUNDLE.slug },
    update: {
      title: GITLAB_BUNDLE.title,
      description: GITLAB_BUNDLE.description,
      price: GITLAB_BUNDLE.price,
      priceVoucher: GITLAB_BUNDLE.priceVoucher,
      published: true
    },
    create: {
      slug: GITLAB_BUNDLE.slug,
      title: GITLAB_BUNDLE.title,
      description: GITLAB_BUNDLE.description,
      price: GITLAB_BUNDLE.price,
      priceVoucher: GITLAB_BUNDLE.priceVoucher,
      published: true
    }
  });

  // Replace bundle items deterministically: drop existing, recreate.
  await db.bundleItem.deleteMany({ where: { bundleId: bundle.id } });
  const items = [
    { examSlug: 'gitlab-certified-associate-p1', tier: 'PRACTICE' as const, position: 1 },
    { examSlug: 'gitlab-certified-associate-p2', tier: 'PRACTICE' as const, position: 2 },
    { examSlug: 'gitlab-certified-associate-p3', tier: 'PRACTICE' as const, position: 3 },
    { examSlug: 'gitlab-certified-associate-p1', tier: 'VOUCHER' as const, position: 4 }
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
