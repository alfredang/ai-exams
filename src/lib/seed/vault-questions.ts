/**
 * HashiCorp Certified: Vault Associate (002) bundle seed — vendor, three
 * practice-exam variants, bundle, and 195 blueprint-aligned questions.
 * Idempotent: replaces rows tagged `generatedBy: 'manual:vault-seed'`
 * and upserts catalog rows.
 *
 * Exported as `seedVault(db)` so the same code path is reachable from
 * the standalone CLI shim (`prisma/seeds/vault.ts`) and the protected
 * admin API (`/api/admin/seed-vault`) — letting us bootstrap the
 * production database without redeploying.
 *
 * Question content is authored against the public HashiCorp Vault docs
 * and the Vault Associate (002) exam objectives:
 *   - Vault Architecture                   — 15% (10 per 65-q variant)
 *   - Authentication and Authorization     — 20% (13)
 *   - Secrets Engines                      — 20% (13)
 *   - Vault Policies                       — 15% (10)
 *   - Tokens                               — 15% (10)
 *   - Encryption as a Service              — 15% ( 9)
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

const ARCH = 'Vault Architecture';
const AUTH = 'Authentication and Authorization';
const SECRETS = 'Secrets Engines';
const POLICIES = 'Vault Policies';
const TOKENS = 'Tokens';
const EAAS = 'Encryption as a Service';

const REF_ARCH = { label: 'Vault Docs — Vault architecture', url: 'https://developer.hashicorp.com/vault/docs/internals/architecture' };
const REF_SEAL = { label: 'Vault Docs — Seal/unseal', url: 'https://developer.hashicorp.com/vault/docs/concepts/seal' };
const REF_AUTOUNSEAL = { label: 'Vault Docs — Auto-unseal', url: 'https://developer.hashicorp.com/vault/docs/configuration/seal' };
const REF_HA = { label: 'Vault Docs — High availability', url: 'https://developer.hashicorp.com/vault/docs/concepts/ha' };
const REF_INTEGRATED_STORAGE = { label: 'Vault Docs — Integrated storage (Raft)', url: 'https://developer.hashicorp.com/vault/docs/configuration/storage/raft' };
const REF_STORAGE = { label: 'Vault Docs — Storage backends', url: 'https://developer.hashicorp.com/vault/docs/configuration/storage' };
const REF_NAMESPACES = { label: 'Vault Docs — Namespaces', url: 'https://developer.hashicorp.com/vault/docs/enterprise/namespaces' };
const REF_BARRIER = { label: 'Vault Docs — Security model', url: 'https://developer.hashicorp.com/vault/docs/internals/security' };
const REF_TELEMETRY = { label: 'Vault Docs — Telemetry', url: 'https://developer.hashicorp.com/vault/docs/configuration/telemetry' };

const REF_AUTH = { label: 'Vault Docs — Auth methods', url: 'https://developer.hashicorp.com/vault/docs/auth' };
const REF_AUTH_CONCEPT = { label: 'Vault Docs — Authentication', url: 'https://developer.hashicorp.com/vault/docs/concepts/auth' };
const REF_USERPASS = { label: 'Vault Docs — Userpass auth method', url: 'https://developer.hashicorp.com/vault/docs/auth/userpass' };
const REF_APPROLE = { label: 'Vault Docs — AppRole auth method', url: 'https://developer.hashicorp.com/vault/docs/auth/approle' };
const REF_AWS_AUTH = { label: 'Vault Docs — AWS auth method', url: 'https://developer.hashicorp.com/vault/docs/auth/aws' };
const REF_LDAP_AUTH = { label: 'Vault Docs — LDAP auth method', url: 'https://developer.hashicorp.com/vault/docs/auth/ldap' };
const REF_TOKEN_AUTH = { label: 'Vault Docs — Token auth method', url: 'https://developer.hashicorp.com/vault/docs/auth/token' };
const REF_IDENTITY = { label: 'Vault Docs — Identity: entities and groups', url: 'https://developer.hashicorp.com/vault/docs/concepts/identity' };
const REF_K8S_AUTH = { label: 'Vault Docs — Kubernetes auth method', url: 'https://developer.hashicorp.com/vault/docs/auth/kubernetes' };

const REF_SECRETS = { label: 'Vault Docs — Secrets engines', url: 'https://developer.hashicorp.com/vault/docs/secrets' };
const REF_KV = { label: 'Vault Docs — KV secrets engine', url: 'https://developer.hashicorp.com/vault/docs/secrets/kv' };
const REF_KV2 = { label: 'Vault Docs — KV version 2', url: 'https://developer.hashicorp.com/vault/docs/secrets/kv/kv-v2' };
const REF_DB = { label: 'Vault Docs — Databases secrets engine', url: 'https://developer.hashicorp.com/vault/docs/secrets/databases' };
const REF_DYNAMIC = { label: 'Vault Docs — Dynamic secrets', url: 'https://developer.hashicorp.com/vault/docs/concepts/dynamic-secrets' };
const REF_AWS_SECRETS = { label: 'Vault Docs — AWS secrets engine', url: 'https://developer.hashicorp.com/vault/docs/secrets/aws' };
const REF_PKI = { label: 'Vault Docs — PKI secrets engine', url: 'https://developer.hashicorp.com/vault/docs/secrets/pki' };
const REF_LEASE = { label: 'Vault Docs — Lease, renew, and revoke', url: 'https://developer.hashicorp.com/vault/docs/concepts/lease' };
const REF_MOUNT = { label: 'Vault Docs — Mounts', url: 'https://developer.hashicorp.com/vault/docs/commands/secrets/enable' };

const REF_POLICIES = { label: 'Vault Docs — Policies', url: 'https://developer.hashicorp.com/vault/docs/concepts/policies' };
const REF_POLICY_SYNTAX = { label: 'Vault Docs — ACL policy syntax', url: 'https://developer.hashicorp.com/vault/docs/concepts/policies#policy-syntax' };
const REF_POLICY_CMD = { label: 'Vault Docs — vault policy command', url: 'https://developer.hashicorp.com/vault/docs/commands/policy' };
const REF_CAPABILITIES = { label: 'Vault Docs — Capabilities', url: 'https://developer.hashicorp.com/vault/docs/concepts/policies#capabilities' };

const REF_TOKENS = { label: 'Vault Docs — Tokens', url: 'https://developer.hashicorp.com/vault/docs/concepts/tokens' };
const REF_TOKEN_TTL = { label: 'Vault Docs — Token time-to-live', url: 'https://developer.hashicorp.com/vault/docs/concepts/tokens#token-time-to-live-periodic-tokens-and-explicit-max-ttls' };
const REF_TOKEN_TYPES = { label: 'Vault Docs — Service vs batch tokens', url: 'https://developer.hashicorp.com/vault/docs/concepts/tokens#token-types' };
const REF_TOKEN_ROLE = { label: 'Vault Docs — Token roles', url: 'https://developer.hashicorp.com/vault/docs/auth/token#token-roles' };
const REF_RESPONSE_WRAP = { label: 'Vault Docs — Response wrapping', url: 'https://developer.hashicorp.com/vault/docs/concepts/response-wrapping' };

const REF_TRANSIT = { label: 'Vault Docs — Transit secrets engine', url: 'https://developer.hashicorp.com/vault/docs/secrets/transit' };
const REF_TRANSIT_REKEY = { label: 'Vault Docs — Transit key rotation', url: 'https://developer.hashicorp.com/vault/docs/secrets/transit#key-rotation' };
const REF_TRANSIT_CONVERGENT = { label: 'Vault Docs — Transit convergent encryption', url: 'https://developer.hashicorp.com/vault/docs/secrets/transit#convergent-encryption' };
const REF_TRANSIT_DATAKEY = { label: 'Vault Docs — Transit datakey generation', url: 'https://developer.hashicorp.com/vault/api-docs/secret/transit#generate-data-key' };

// Helper to build 4-option SINGLE questions with id 'a','b','c','d'.
const opts4 = (a: string, b: string, c: string, d: string): Opt[] => [
  { id: 'a', text: a }, { id: 'b', text: b }, { id: 'c', text: c }, { id: 'd', text: d }
];

// ───────────────────── Practice Exam 1 ─────────────────────
const P1: Q[] = [
  // ── Vault Architecture (10) ──
  {
    domain: ARCH, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A new Vault server is started and shows "Sealed: true". What does the sealed state mean for the running process?',
    options: opts4(
      'Vault has no storage backend configured yet.',
      'Vault knows where its data is but cannot decrypt it because the encryption key is not in memory.',
      'Vault has crashed and must be reinstalled.',
      'Vault is fully operational but read-only.'
    ),
    correct: ['b'],
    explanation: 'When sealed, Vault can access its physical storage but the master/encryption key is not held in memory, so it cannot decrypt the barrier. Unsealing reconstructs the key (via Shamir shares or auto-unseal) and brings Vault online.',
    references: [REF_SEAL]
  },
  {
    domain: ARCH, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'During `vault operator init` with default settings, how many unseal key shares are produced and how many are required to unseal?',
    options: opts4(
      '3 shares, 2 required',
      '5 shares, 3 required',
      '5 shares, 5 required',
      '1 share, 1 required'
    ),
    correct: ['b'],
    explanation: 'By default Vault splits the master key with Shamir\'s Secret Sharing into 5 key shares with a threshold of 3. Both values are configurable via -key-shares and -key-threshold at init time.',
    references: [REF_SEAL]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'An operator wants Vault to unseal automatically on restart using AWS KMS instead of manually entering Shamir key shares. Which mechanism provides this?',
    options: opts4(
      'Response wrapping',
      'Auto-unseal with a seal stanza referencing the cloud KMS',
      'Increasing the key-threshold to 1',
      'Enabling the transit secrets engine on the same node'
    ),
    correct: ['b'],
    explanation: 'Auto-unseal delegates the unseal step to a trusted external service (cloud KMS, HSM, or Transit). A seal stanza in the configuration references the provider so Vault can decrypt the root key without manual share entry on restart.',
    references: [REF_AUTOUNSEAL]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Vault\'s integrated storage (Raft).',
    options: opts4(
      'It stores data on the local disk of each Vault node and replicates via the Raft consensus protocol.',
      'It removes the need for a separate external storage system like Consul.',
      'It requires an even number of voting nodes for quorum.',
      'A cluster of 5 voting nodes tolerates the loss of 2 nodes while keeping quorum.'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Integrated storage keeps a replicated copy of data on each node\'s disk using Raft, eliminating the external Consul dependency. Raft needs a majority (quorum), so odd node counts are recommended; with 5 voters the cluster tolerates 2 failures (floor((5-1)/2)).',
    references: [REF_INTEGRATED_STORAGE, REF_HA]
  },
  {
    domain: ARCH, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'In a Vault HA cluster, all standby nodes can independently service client read and write requests without involving the active node.',
    options: opts4('True', 'False', 'Only for read requests', 'Only when sealed'),
    correct: ['b'],
    explanation: 'False. In a standard HA cluster only the active node services requests; standby nodes forward (or redirect) client requests to the active node. Performance Standby nodes (Enterprise) can serve read-only requests, but that is not the default open-source behavior.',
    references: [REF_HA]
  },
  {
    domain: ARCH, difficulty: 2, type: QType.SINGLE,
    stem: 'Which component encrypts ALL data before it is written to the storage backend, ensuring the backend never sees plaintext?',
    options: opts4(
      'The audit device',
      'The cryptographic barrier',
      'The PKI secrets engine',
      'The policy store'
    ),
    correct: ['b'],
    explanation: 'The barrier sits between Vault core and the storage backend; everything passing through it is encrypted/decrypted, so the storage backend only ever holds ciphertext. This is why the backend can be treated as untrusted.',
    references: [REF_BARRIER]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'A security team wants to provide isolated tenants with their own policies, auth methods, and secrets within one Vault cluster. Which Vault feature is designed for this?',
    options: opts4(
      'Multiple listener stanzas',
      'Namespaces',
      'Response wrapping',
      'Batch tokens'
    ),
    correct: ['b'],
    explanation: 'Namespaces (Vault Enterprise) create isolated administrative environments within a single cluster, each with its own policies, auth methods, secrets engines, and tokens — enabling secure multi-tenancy.',
    references: [REF_NAMESPACES]
  },
  {
    domain: ARCH, difficulty: 2, type: QType.SINGLE,
    stem: 'Which configuration stanza tells a Vault server where to persist its encrypted data?',
    options: opts4(
      'listener',
      'storage',
      'telemetry',
      'seal'
    ),
    correct: ['b'],
    explanation: 'The storage stanza configures the backend (e.g., raft, consul, file) where Vault persists its encrypted data. listener configures the API address, telemetry configures metrics, and seal configures auto-unseal.',
    references: [REF_STORAGE]
  },
  {
    domain: ARCH, difficulty: 2, type: QType.SINGLE,
    stem: 'Which stanza in the Vault server configuration controls how metrics are exported to systems such as Prometheus or StatsD?',
    options: opts4(
      'audit',
      'telemetry',
      'cache',
      'plugin_directory'
    ),
    correct: ['b'],
    explanation: 'The telemetry stanza configures emission of operational metrics (e.g., to StatsD, Prometheus, or Circonus). Audit devices log requests/responses but are not configured via a telemetry stanza.',
    references: [REF_TELEMETRY]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'After a successful `vault operator unseal` reaching the threshold, what is the resulting state of the Vault server?',
    options: opts4(
      'Initialized but still sealed until a token is provided',
      'Unsealed and able to decrypt data and serve requests',
      'In standby regardless of HA configuration',
      'Reset to an uninitialized state'
    ),
    correct: ['b'],
    explanation: 'Once the unseal threshold of key shares is reached, Vault reconstructs the master key, decrypts the barrier, and transitions to an unsealed, operational state where it can serve API requests.',
    references: [REF_SEAL]
  },

  // ── Authentication and Authorization (13) ──
  {
    domain: AUTH, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What is the primary purpose of a Vault auth method?',
    options: opts4(
      'To encrypt application data in transit',
      'To verify a client\'s identity and issue a token with attached policies',
      'To store static key/value secrets',
      'To replicate data to a secondary cluster'
    ),
    correct: ['b'],
    explanation: 'Auth methods authenticate a client (human or machine) using some trusted credential and, on success, generate a Vault token whose attached policies define what the client may do.',
    references: [REF_AUTH_CONCEPT]
  },
  {
    domain: AUTH, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which auth method is best suited for an automated application or CI pipeline rather than an interactive human?',
    options: opts4(
      'userpass',
      'AppRole',
      'GitHub',
      'Okta'
    ),
    correct: ['b'],
    explanation: 'AppRole is designed for machine-to-machine authentication: a RoleID plus a SecretID are exchanged for a token, making it well suited for applications and CI/CD pipelines. userpass, GitHub, and Okta target human users.',
    references: [REF_APPROLE]
  },
  {
    domain: AUTH, difficulty: 3, type: QType.SINGLE,
    stem: 'In the AppRole workflow, which two values must a client present to obtain a token?',
    options: opts4(
      'Username and password',
      'RoleID and SecretID',
      'Unseal key and root token',
      'Client certificate and CA bundle'
    ),
    correct: ['b'],
    explanation: 'AppRole login requires a RoleID (semi-public, like a username) and a SecretID (secret, like a password). Vault validates the pair and returns a token with the role\'s policies.',
    references: [REF_APPROLE]
  },
  {
    domain: AUTH, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command enables the userpass auth method at its default path?',
    options: opts4(
      'vault auth enable userpass',
      'vault secrets enable userpass',
      'vault login userpass',
      'vault policy write userpass'
    ),
    correct: ['a'],
    explanation: '`vault auth enable userpass` mounts the userpass auth method (default path `userpass`). `vault secrets enable` is for secrets engines, and `vault login` performs authentication once the method exists.',
    references: [REF_USERPASS]
  },
  {
    domain: AUTH, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Multiple auth methods can be enabled simultaneously on a single Vault server, each at its own path.',
    options: opts4('True', 'False', 'Only one per namespace', 'Only with Vault Enterprise'),
    correct: ['a'],
    explanation: 'True. Vault supports many auth methods enabled concurrently, each mounted at a unique path (default or custom via -path), so different client types can authenticate through the method best suited to them.',
    references: [REF_AUTH]
  },
  {
    domain: AUTH, difficulty: 3, type: QType.SINGLE,
    stem: 'A team wants EC2 instances to authenticate to Vault using their instance identity, with no pre-shared secret distributed to the host. Which auth method fits best?',
    options: opts4(
      'userpass',
      'AWS auth method',
      'TLS certificate auth with a shared cert',
      'GitHub auth method'
    ),
    correct: ['b'],
    explanation: 'The AWS auth method lets EC2 instances (iam or ec2 type) prove their identity to Vault using AWS-signed identity material rather than a distributed static secret, making it ideal for AWS-hosted workloads.',
    references: [REF_AWS_AUTH]
  },
  {
    domain: AUTH, difficulty: 3, type: QType.SINGLE,
    stem: 'In Vault\'s identity system, what is an entity?',
    options: opts4(
      'A single secrets engine mount',
      'An internal representation of a user that can link multiple auth-method aliases to one identity',
      'A policy attached to a token',
      'A node in the Raft cluster'
    ),
    correct: ['b'],
    explanation: 'An identity entity represents a logical user. Multiple aliases (e.g., the same person\'s LDAP and userpass logins) can be tied to one entity so policies and metadata follow the person across auth methods.',
    references: [REF_IDENTITY]
  },
  {
    domain: AUTH, difficulty: 2, type: QType.SINGLE,
    stem: 'Which auth method allows Kubernetes pods to authenticate to Vault using their service account token?',
    options: opts4(
      'AppRole',
      'Kubernetes auth method',
      'userpass',
      'LDAP'
    ),
    correct: ['b'],
    explanation: 'The Kubernetes auth method validates a pod\'s service account JWT against the Kubernetes API (TokenReview) and maps it to a Vault role and policies, enabling pods to authenticate without a static secret.',
    references: [REF_K8S_AUTH]
  },
  {
    domain: AUTH, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command authenticates a user with the userpass method and stores the resulting token for the CLI?',
    options: opts4(
      'vault auth enable -method=userpass',
      'vault login -method=userpass username=alice',
      'vault token create -policy=userpass',
      'vault write auth/userpass/login'
    ),
    correct: ['b'],
    explanation: '`vault login -method=userpass username=alice` performs authentication via userpass and caches the returned token in the CLI token helper. `vault auth enable` only mounts the method; `vault token create` mints a child token from an existing session.',
    references: [REF_USERPASS]
  },
  {
    domain: AUTH, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL accurate statements about how authorization works after authentication in Vault.',
    options: opts4(
      'Policies are attached to the token at creation/login time.',
      'Vault is default-deny: with no policy granting access, a request is denied.',
      'The token itself stores the full secret payload it is allowed to read.',
      'Identity group membership can contribute additional policies to a token.'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Tokens carry policy references set at login. Vault denies anything not explicitly allowed (default-deny). Identity groups can add policies on top of those from the auth method. Tokens do not embed the secrets they may read.',
    references: [REF_POLICIES, REF_IDENTITY]
  },
  {
    domain: AUTH, difficulty: 3, type: QType.SINGLE,
    stem: 'An organization already runs Active Directory and wants users to log in to Vault with their existing directory credentials. Which auth method is the natural choice?',
    options: opts4(
      'AppRole',
      'LDAP auth method',
      'AWS auth method',
      'TLS certificates'
    ),
    correct: ['b'],
    explanation: 'The LDAP auth method authenticates users against an existing LDAP/Active Directory server and can map LDAP groups to Vault policies, letting users reuse directory credentials.',
    references: [REF_LDAP_AUTH]
  },
  {
    domain: AUTH, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command lists all currently enabled auth methods on a Vault server?',
    options: opts4(
      'vault auth list',
      'vault secrets list',
      'vault policy list',
      'vault token lookup'
    ),
    correct: ['a'],
    explanation: '`vault auth list` shows every enabled auth method and its mount path. `vault secrets list` is for secrets engines, and `vault policy list` enumerates policies.',
    references: [REF_AUTH]
  },
  {
    domain: AUTH, difficulty: 3, type: QType.SINGLE,
    stem: 'A SecretID for an AppRole was configured with secret_id_num_uses=1. What happens after the application logs in once with it?',
    options: opts4(
      'The SecretID can be reused indefinitely.',
      'The SecretID is consumed and can no longer be used for another login.',
      'The RoleID is also invalidated.',
      'The token never expires.'
    ),
    correct: ['b'],
    explanation: 'secret_id_num_uses=1 limits a SecretID to a single use; after that login it is consumed and rejected on subsequent attempts. This is a common hardening control to limit credential replay.',
    references: [REF_APPROLE]
  },

  // ── Secrets Engines (13) ──
  {
    domain: SECRETS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command enables the key/value (KV) version 2 secrets engine at the path `kv`?',
    options: opts4(
      'vault secrets enable -version=2 -path=kv kv',
      'vault auth enable kv',
      'vault kv enable -version=2',
      'vault write sys/mounts/kv type=auth'
    ),
    correct: ['a'],
    explanation: '`vault secrets enable -version=2 -path=kv kv` mounts the KV v2 engine at path kv. Auth methods use `vault auth enable`; KV is a secrets engine, not an auth method.',
    references: [REF_KV2, REF_MOUNT]
  },
  {
    domain: SECRETS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What is the key difference between KV version 1 and KV version 2?',
    options: opts4(
      'KV v2 stores secrets in plaintext while v1 encrypts them',
      'KV v2 supports versioning and soft deletes of secrets; v1 does not',
      'KV v1 supports dynamic secrets; v2 does not',
      'KV v2 cannot be mounted at a custom path'
    ),
    correct: ['b'],
    explanation: 'KV v2 adds secret versioning, metadata, soft delete, and undelete/destroy operations. KV v1 stores only the latest value. Both encrypt data through the barrier; neither generates dynamic secrets.',
    references: [REF_KV2, REF_KV]
  },
  {
    domain: SECRETS, difficulty: 3, type: QType.SINGLE,
    stem: 'A database secrets engine is configured so each application instance receives a unique, short-lived PostgreSQL credential created on demand. What type of secret is this?',
    options: opts4(
      'A static secret',
      'A dynamic secret',
      'A wrapped token',
      'A transit ciphertext'
    ),
    correct: ['b'],
    explanation: 'Credentials generated on demand with a lease and automatically revoked at expiry are dynamic secrets. The database secrets engine creates a unique account per request, reducing blast radius and enabling automatic rotation.',
    references: [REF_DYNAMIC, REF_DB]
  },
  {
    domain: SECRETS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command writes a secret with keys `username` and `password` to `secret/data/app` using the KV v2 CLI helper?',
    options: opts4(
      'vault kv put secret/app username=app password=s3cr3t',
      'vault write secret/app type=kv',
      'vault secrets put secret/app',
      'vault policy write secret/app'
    ),
    correct: ['a'],
    explanation: '`vault kv put secret/app username=app password=s3cr3t` uses the KV helper, which handles the v2 data/ path prefix automatically. The other commands are not valid ways to write a KV secret.',
    references: [REF_KV2]
  },
  {
    domain: SECRETS, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about dynamic secrets in Vault.',
    options: opts4(
      'They are generated when requested rather than stored ahead of time.',
      'Each has an associated lease that Vault can renew or revoke.',
      'They are typically unique per consumer, limiting credential sharing.',
      'They never expire and must be deleted manually.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Dynamic secrets are created on demand, carry a lease (renew/revoke), and are usually unique per consumer. They expire automatically when the lease ends, so option D is false.',
    references: [REF_DYNAMIC, REF_LEASE]
  },
  {
    domain: SECRETS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which secrets engine can dynamically generate AWS IAM access keys scoped to a configured policy?',
    options: opts4(
      'transit',
      'aws',
      'kv',
      'pki'
    ),
    correct: ['b'],
    explanation: 'The AWS secrets engine generates dynamic AWS credentials (IAM users/STS) based on a configured role and AWS policy, with a lease so Vault revokes them automatically.',
    references: [REF_AWS_SECRETS]
  },
  {
    domain: SECRETS, difficulty: 3, type: QType.SINGLE,
    stem: 'A team needs Vault to act as a certificate authority and issue short-lived TLS certificates to services on request. Which secrets engine should they use?',
    options: opts4(
      'kv',
      'pki',
      'transit',
      'totp'
    ),
    correct: ['b'],
    explanation: 'The PKI secrets engine turns Vault into a CA that issues and signs X.509 certificates on demand with short TTLs, eliminating manual certificate management.',
    references: [REF_PKI]
  },
  {
    domain: SECRETS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command lists all enabled secrets engines and their mount paths?',
    options: opts4(
      'vault secrets list',
      'vault auth list',
      'vault kv list',
      'vault mounts show'
    ),
    correct: ['a'],
    explanation: '`vault secrets list` enumerates enabled secrets engines and their paths. `vault auth list` lists auth methods, and `vault kv list` lists keys within a KV mount.',
    references: [REF_SECRETS]
  },
  {
    domain: SECRETS, difficulty: 3, type: QType.SINGLE,
    stem: 'A developer ran `vault kv delete secret/app` on a KV v2 mount and now needs the data back. Which operation can recover it?',
    options: opts4(
      'It is permanently gone; only a backup helps',
      'vault kv undelete -versions=<n> secret/app',
      'vault kv destroy secret/app',
      'vault kv rollback secret/app'
    ),
    correct: ['b'],
    explanation: 'In KV v2 a delete is a soft delete that hides a version but retains the underlying data, so `vault kv undelete -versions=<n>` restores it. `destroy` permanently removes version data and cannot be undone.',
    references: [REF_KV2]
  },
  {
    domain: SECRETS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command disables (unmounts) a secrets engine mounted at path `aws`?',
    options: opts4(
      'vault secrets disable aws',
      'vault auth disable aws',
      'vault delete sys/aws',
      'vault kv delete aws'
    ),
    correct: ['a'],
    explanation: '`vault secrets disable aws` unmounts the engine at path aws and revokes secrets it generated. `vault auth disable` removes auth methods, not secrets engines.',
    references: [REF_SECRETS, REF_MOUNT]
  },
  {
    domain: SECRETS, difficulty: 3, type: QType.SINGLE,
    stem: 'Why is using the database secrets engine generally more secure than storing a single shared DB password in a KV mount?',
    options: opts4(
      'KV cannot store passwords',
      'Each consumer gets a unique, short-lived credential that Vault can revoke independently',
      'The database engine encrypts data while KV does not',
      'KV secrets are visible in the audit log as plaintext'
    ),
    correct: ['b'],
    explanation: 'Dynamic database credentials are unique per consumer and short-lived, so a leaked credential has limited scope and lifetime and can be revoked without affecting others — far better than one shared static password.',
    references: [REF_DB, REF_DYNAMIC]
  },
  {
    domain: SECRETS, difficulty: 2, type: QType.SINGLE,
    stem: 'A single secrets engine type can be enabled at multiple distinct paths on the same Vault server.',
    options: opts4('True', 'False', 'Only KV', 'Only with Enterprise'),
    correct: ['a'],
    explanation: 'True. The same engine type (e.g., kv or database) can be mounted at several paths using -path, allowing isolation between teams or environments on one Vault server.',
    references: [REF_MOUNT]
  },
  {
    domain: SECRETS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command reads the current value of a KV v2 secret at `secret/app`?',
    options: opts4(
      'vault kv get secret/app',
      'vault read auth/secret/app',
      'vault policy read secret/app',
      'vault token lookup secret/app'
    ),
    correct: ['a'],
    explanation: '`vault kv get secret/app` retrieves the latest version of the secret using the KV helper, which inserts the v2 data/ path automatically. The other commands target unrelated subsystems.',
    references: [REF_KV2]
  },

  // ── Vault Policies (10) ──
  {
    domain: POLICIES, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What is the default authorization behavior of Vault when no policy explicitly grants access to a path?',
    options: opts4(
      'Access is allowed (default-allow)',
      'Access is denied (default-deny)',
      'Access is allowed for read only',
      'Access depends on the storage backend'
    ),
    correct: ['b'],
    explanation: 'Vault is default-deny: a token can only perform actions a policy explicitly permits. Anything not granted is denied, which is why every non-root token needs at least one policy.',
    references: [REF_POLICIES]
  },
  {
    domain: POLICIES, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'In what language/format are Vault ACL policies written?',
    options: opts4(
      'YAML',
      'HCL (or its JSON equivalent)',
      'XML',
      'INI'
    ),
    correct: ['b'],
    explanation: 'Vault policies are authored in HashiCorp Configuration Language (HCL); a JSON representation is also accepted. Each policy is a set of path rules with capabilities.',
    references: [REF_POLICY_SYNTAX]
  },
  {
    domain: POLICIES, difficulty: 3, type: QType.SINGLE,
    stem: 'A policy contains the rule `path "secret/data/app/*" { capabilities = ["read"] }`. What can a token with this policy do?',
    options: opts4(
      'Write secrets anywhere under secret/',
      'Read secrets under secret/data/app/ but not write or delete them',
      'Read and delete secrets under secret/data/app/',
      'Manage policies'
    ),
    correct: ['b'],
    explanation: 'The rule grants only the read capability on paths matching secret/data/app/*. Without create/update/delete, the token can read those secrets but cannot modify or remove them, and it has no access elsewhere.',
    references: [REF_CAPABILITIES]
  },
  {
    domain: POLICIES, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL valid Vault policy capabilities.',
    options: opts4(
      'create',
      'sudo',
      'deny',
      'execute'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Valid capabilities include create, read, update, delete, list, sudo, and deny. "execute" is not a Vault capability. deny overrides any other grant on the matching path.',
    references: [REF_CAPABILITIES]
  },
  {
    domain: POLICIES, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command creates or updates a policy named `app-ro` from a file `app-ro.hcl`?',
    options: opts4(
      'vault policy write app-ro app-ro.hcl',
      'vault policy create app-ro.hcl',
      'vault write policy/app-ro app-ro.hcl',
      'vault auth write app-ro app-ro.hcl'
    ),
    correct: ['a'],
    explanation: '`vault policy write <name> <file>` creates or overwrites a named ACL policy from an HCL/JSON file. There is no `vault policy create` subcommand.',
    references: [REF_POLICY_CMD]
  },
  {
    domain: POLICIES, difficulty: 3, type: QType.SINGLE,
    stem: 'A token has two policies: one grants `read` on `secret/data/x` and another specifies `capabilities = ["deny"]` on `secret/data/x`. What is the effective access?',
    options: opts4(
      'Read is allowed because one policy grants it',
      'Access is denied because deny takes precedence over any other capability',
      'The result is undefined',
      'Only list is allowed'
    ),
    correct: ['b'],
    explanation: 'When policies conflict, the deny capability always wins. If any matching rule includes deny, the request is rejected regardless of other grants.',
    references: [REF_POLICY_SYNTAX]
  },
  {
    domain: POLICIES, difficulty: 2, type: QType.SINGLE,
    stem: 'Which built-in policy is automatically attached to every token and cannot be removed, allowing operations like token self-lookup and renewal?',
    options: opts4(
      'root',
      'default',
      'admin',
      'sys'
    ),
    correct: ['b'],
    explanation: 'The default policy is attached to all tokens (unless explicitly created with no_default_policy) and grants common self-service operations such as looking up and renewing one\'s own token.',
    references: [REF_POLICIES]
  },
  {
    domain: POLICIES, difficulty: 3, type: QType.SINGLE,
    stem: 'An operator needs to perform a root-protected operation on a specific path without using the root token. Which capability must the policy include for that path?',
    options: opts4(
      'list',
      'sudo',
      'update',
      'create'
    ),
    correct: ['b'],
    explanation: 'Certain root-protected API paths require the sudo capability in addition to the normal capability. Granting sudo on the specific path lets a non-root token perform that privileged operation.',
    references: [REF_CAPABILITIES]
  },
  {
    domain: POLICIES, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command lists the names of all policies configured on the Vault server?',
    options: opts4(
      'vault policy list',
      'vault list policies',
      'vault auth list',
      'vault secrets list'
    ),
    correct: ['a'],
    explanation: '`vault policy list` returns the names of all ACL policies. `vault policy read <name>` shows the contents of a specific one.',
    references: [REF_POLICY_CMD]
  },
  {
    domain: POLICIES, difficulty: 3, type: QType.SINGLE,
    stem: 'To allow a user to see the keys under `secret/metadata/team/` they need the `list` capability on that path, separate from `read`.',
    options: opts4('True', 'False', 'list implies read', 'read implies list'),
    correct: ['a'],
    explanation: 'True. Listing keys requires the list capability; reading a value requires read. They are independent, so a policy must grant list explicitly to enumerate keys under a path.',
    references: [REF_CAPABILITIES]
  },

  // ── Tokens (10) ──
  {
    domain: TOKENS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What is a Vault token primarily used for?',
    options: opts4(
      'Encrypting application data',
      'Authenticating subsequent client requests after an initial login',
      'Storing the storage backend credentials',
      'Defining the seal configuration'
    ),
    correct: ['b'],
    explanation: 'A token is the core authentication artifact: after authenticating via an auth method, the client uses the returned token on subsequent API calls, and its attached policies authorize each request.',
    references: [REF_TOKENS]
  },
  {
    domain: TOKENS, difficulty: 3, type: QType.SINGLE,
    stem: 'Which token type is lightweight, is not persisted to storage, and cannot create child tokens or be renewed — useful for high-volume, short-lived workloads?',
    options: opts4(
      'Service token',
      'Batch token',
      'Root token',
      'Periodic token'
    ),
    correct: ['b'],
    explanation: 'Batch tokens are encrypted blobs not written to storage; they are lightweight and scalable but cannot be renewed, cannot have child tokens, and lack some features of service tokens. They suit short-lived, high-throughput use.',
    references: [REF_TOKEN_TYPES]
  },
  {
    domain: TOKENS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command creates a new child token with the policy `app-ro` attached?',
    options: opts4(
      'vault token create -policy=app-ro',
      'vault policy write app-ro',
      'vault login -policy=app-ro',
      'vault auth enable app-ro'
    ),
    correct: ['a'],
    explanation: '`vault token create -policy=app-ro` mints a new (child) token with the specified policy. The other commands manage policies, log in, or enable auth methods rather than create tokens.',
    references: [REF_TOKENS]
  },
  {
    domain: TOKENS, difficulty: 3, type: QType.SINGLE,
    stem: 'A periodic token is configured with a period of 24h. What does this guarantee about its lifetime?',
    options: opts4(
      'It expires permanently after exactly 24 hours regardless of renewal',
      'As long as it is renewed within each period, it can live indefinitely without hitting a max TTL',
      'It cannot be revoked',
      'It ignores all policies after 24 hours'
    ),
    correct: ['b'],
    explanation: 'A periodic token has no max TTL; each renewal resets its TTL to the period. As long as it is renewed within every period it can live indefinitely, which suits long-running services. It can still be revoked.',
    references: [REF_TOKEN_TTL]
  },
  {
    domain: TOKENS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command shows information about the token currently in use, including its policies and TTL?',
    options: opts4(
      'vault token lookup',
      'vault policy read',
      'vault status',
      'vault auth list'
    ),
    correct: ['a'],
    explanation: '`vault token lookup` (with no argument) returns metadata about the calling token: accessor, policies, TTL, and creation time. `vault status` reports seal/HA state instead.',
    references: [REF_TOKENS]
  },
  {
    domain: TOKENS, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements comparing service tokens and batch tokens.',
    options: opts4(
      'Service tokens are persisted to Vault storage; batch tokens are not.',
      'Batch tokens cannot be renewed.',
      'Service tokens can create child tokens; batch tokens cannot.',
      'Batch tokens are stored as Shamir key shares.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Service tokens are persisted and support renewal and child token creation. Batch tokens are not persisted, are not renewable, and cannot spawn children. Batch tokens are encrypted blobs, not Shamir shares.',
    references: [REF_TOKEN_TYPES]
  },
  {
    domain: TOKENS, difficulty: 3, type: QType.SINGLE,
    stem: 'An operator wants to revoke a token and ALL tokens that were created as its children. Which command does this?',
    options: opts4(
      'vault token revoke <token>  (default revokes the tree)',
      'vault token revoke -mode=orphan <token>',
      'vault token renew <token>',
      'vault token create -orphan'
    ),
    correct: ['a'],
    explanation: 'By default `vault token revoke` revokes the token and its entire child token tree. `-mode=orphan` revokes only the token and orphans its children; `renew` extends a lease; `create -orphan` makes a parentless token.',
    references: [REF_TOKENS]
  },
  {
    domain: TOKENS, difficulty: 2, type: QType.SINGLE,
    stem: 'A token accessor can be used to look up and revoke a token without knowing the token value itself.',
    options: opts4('True', 'False', 'Only for root tokens', 'Only for batch tokens'),
    correct: ['a'],
    explanation: 'True. The accessor is a reference that allows limited operations such as lookup and revoke by accessor, without exposing the actual token, which is useful for auditing and management.',
    references: [REF_TOKENS]
  },
  {
    domain: TOKENS, difficulty: 3, type: QType.SINGLE,
    stem: 'A token role is created with a renewable TTL and an explicit max TTL of 72h. After repeated renewals, what is the longest the token can remain valid?',
    options: opts4(
      'Indefinitely as long as it is renewed',
      'Up to 72 hours from creation, after which renewal cannot extend it',
      'Exactly the initial TTL only; renewal is ignored',
      '24 hours by default'
    ),
    correct: ['b'],
    explanation: 'An explicit max TTL caps the token\'s total lifetime. Renewals can extend the current TTL but never beyond the max TTL, so the token cannot live past 72h from creation.',
    references: [REF_TOKEN_ROLE, REF_TOKEN_TTL]
  },
  {
    domain: TOKENS, difficulty: 3, type: QType.SINGLE,
    stem: 'A secret is delivered to a consumer using response wrapping. What does the consumer receive, and what must they do?',
    options: opts4(
      'The plaintext secret directly in the response body',
      'A single-use wrapping token they unwrap to retrieve the secret once',
      'A Shamir key share to reconstruct the secret',
      'A policy file describing the secret'
    ),
    correct: ['b'],
    explanation: 'Response wrapping returns a single-use, TTL-limited wrapping token instead of the secret. The consumer calls unwrap exactly once to retrieve it; any second use or expiry signals tampering.',
    references: [REF_RESPONSE_WRAP]
  },

  // ── Encryption as a Service (9) ──
  {
    domain: EAAS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Vault secrets engine provides encryption-as-a-service so applications can encrypt/decrypt data without Vault storing the data?',
    options: opts4(
      'kv',
      'transit',
      'pki',
      'database'
    ),
    correct: ['b'],
    explanation: 'The Transit secrets engine performs cryptographic operations (encrypt, decrypt, sign, HMAC) on data in transit. Vault holds the keys but does not store the application\'s data — encryption as a service.',
    references: [REF_TRANSIT]
  },
  {
    domain: EAAS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'When an application uses the Transit engine to encrypt data, where is the resulting ciphertext stored?',
    options: opts4(
      'Inside Vault\'s storage backend',
      'By the application itself; Vault only returns the ciphertext',
      'In the audit device only',
      'In the token store'
    ),
    correct: ['b'],
    explanation: 'Transit returns ciphertext to the caller but does not persist the data. The application stores the ciphertext wherever it likes and calls Transit again to decrypt, keeping key material centralized in Vault.',
    references: [REF_TRANSIT]
  },
  {
    domain: EAAS, difficulty: 3, type: QType.SINGLE,
    stem: 'After rotating a Transit key with `vault write -f transit/keys/my-key/rotate`, what happens to data previously encrypted with the old key version?',
    options: opts4(
      'It becomes permanently unreadable',
      'It can still be decrypted because Transit retains old key versions until min_decryption_version is raised',
      'It is automatically re-encrypted with the new version',
      'The rotate command is rejected if old ciphertext exists'
    ),
    correct: ['b'],
    explanation: 'Key rotation adds a new version used for new encryptions while older versions remain available for decryption. Old ciphertext stays readable unless min_decryption_version is increased; rewrap can upgrade it.',
    references: [REF_TRANSIT_REKEY]
  },
  {
    domain: EAAS, difficulty: 3, type: QType.SINGLE,
    stem: 'A team must encrypt the same plaintext and get identical ciphertext to support deduplication/equality checks. Which Transit key feature enables this?',
    options: opts4(
      'Derived keys only',
      'Convergent encryption',
      'Auto-unseal',
      'Response wrapping'
    ),
    correct: ['b'],
    explanation: 'Convergent encryption derives a deterministic nonce so identical plaintext (with the same context) yields identical ciphertext, enabling equality checks at the cost of some information leakage about equal values.',
    references: [REF_TRANSIT_CONVERGENT]
  },
  {
    domain: EAAS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Transit operation returns a high-entropy data key for client-side (envelope) encryption while keeping the wrapping key in Vault?',
    options: opts4(
      'transit/encrypt',
      'transit/datakey',
      'transit/hmac',
      'transit/random'
    ),
    correct: ['b'],
    explanation: 'transit/datakey generates a new data encryption key, returning both plaintext and a Vault-encrypted (wrapped) copy. The app encrypts data locally with the plaintext key and stores only the wrapped key — envelope encryption.',
    references: [REF_TRANSIT_DATAKEY]
  },
  {
    domain: EAAS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command encrypts base64-encoded plaintext using a Transit key named `orders`?',
    options: opts4(
      'vault write transit/encrypt/orders plaintext=$(base64 <<< "data")',
      'vault kv put transit/orders plaintext=data',
      'vault policy write transit/orders',
      'vault token create -policy=transit'
    ),
    correct: ['a'],
    explanation: 'Transit encrypts via `vault write transit/encrypt/<key> plaintext=<base64>`; the input must be base64-encoded. KV and policy commands are unrelated to cryptographic operations.',
    references: [REF_TRANSIT]
  },
  {
    domain: EAAS, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about the Transit (encryption as a service) engine.',
    options: opts4(
      'It can sign and verify data in addition to encrypt/decrypt.',
      'It can generate HMACs for data integrity.',
      'It stores the application\'s plaintext data inside Vault.',
      'Key rotation lets new data use a new key version while old data stays decryptable.'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Transit supports encrypt/decrypt, sign/verify, HMAC, and key rotation with versioned keys. It does not store the application\'s data — only key material — so option C is false.',
    references: [REF_TRANSIT, REF_TRANSIT_REKEY]
  },
  {
    domain: EAAS, difficulty: 2, type: QType.SINGLE,
    stem: 'With the Transit engine, applications never need to handle or store encryption key material directly.',
    options: opts4('True', 'False', 'Only with convergent keys', 'Only for signing'),
    correct: ['a'],
    explanation: 'True. Transit keeps key material in Vault and exposes only cryptographic operations through the API, so applications send data to be encrypted/decrypted without ever holding the keys.',
    references: [REF_TRANSIT]
  },
  {
    domain: EAAS, difficulty: 3, type: QType.SINGLE,
    stem: 'An auditor asks how to limit which Transit keys an application can use for decryption. What is the correct approach?',
    options: opts4(
      'Disable the audit device',
      'Write a Vault policy granting access only to the specific transit/decrypt/<key> paths the app needs',
      'Use a batch token with no policy',
      'Set min_decryption_version to 0'
    ),
    correct: ['b'],
    explanation: 'Access to Transit operations is controlled by ACL policies on the relevant paths. Granting only transit/decrypt/<key> for the required keys enforces least privilege for cryptographic operations.',
    references: [REF_TRANSIT, REF_POLICIES]
  }
];

// ───────────────────── Practice Exam 2 ─────────────────────
const P2: Q[] = [
  // ── Vault Architecture (10) ──
  {
    domain: ARCH, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What does `vault operator init` do when run against a fresh, uninitialized Vault server?',
    options: opts4(
      'Unseals an already-initialized Vault',
      'Initializes Vault, generating the unseal key shares and the initial root token',
      'Creates a new namespace',
      'Rotates the encryption key'
    ),
    correct: ['b'],
    explanation: 'Initialization is a one-time operation that sets up the storage backend, generates the master key split into unseal key shares, and returns the initial root token. It must be done before Vault can be unsealed.',
    references: [REF_SEAL]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'A Vault cluster uses Shamir seal. An operator wants to change the number of unseal key shares and threshold without re-initializing. Which operation accomplishes this?',
    options: opts4(
      'vault operator init again',
      'vault operator rekey',
      'vault operator rotate',
      'vault operator step-down'
    ),
    correct: ['b'],
    explanation: 'rekey generates a new master key and new unseal key shares, letting you change the share count/threshold without losing data. rotate changes the underlying encryption key for new writes; step-down forces an HA leader change.',
    references: [REF_SEAL]
  },
  {
    domain: ARCH, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'The Vault storage backend stores secrets in plaintext, so it must be on an encrypted disk.',
    options: opts4('True', 'False', 'Only for the file backend', 'Only for Consul'),
    correct: ['b'],
    explanation: 'False. All data is encrypted by Vault\'s barrier before it reaches the storage backend, so the backend never sees plaintext. Disk encryption is defense-in-depth but not required for confidentiality of Vault data.',
    references: [REF_BARRIER]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'In an HA cluster using integrated storage, which node is responsible for handling all write operations?',
    options: opts4(
      'Any node, chosen randomly',
      'The active (leader) node',
      'The node with the lowest IP',
      'A dedicated storage-only node'
    ),
    correct: ['b'],
    explanation: 'With Raft integrated storage, the elected leader (active node) handles writes and replicates them to followers. Standby nodes forward client requests to the active node.',
    references: [REF_INTEGRATED_STORAGE, REF_HA]
  },
  {
    domain: ARCH, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command reports whether Vault is initialized, sealed, and the seal type in use?',
    options: opts4(
      'vault status',
      'vault token lookup',
      'vault policy list',
      'vault secrets list'
    ),
    correct: ['a'],
    explanation: '`vault status` shows seal state, initialization status, seal type, HA mode, and cluster info. It is the standard health/operational check for a Vault server.',
    references: [REF_SEAL]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL valid Vault auto-unseal mechanisms.',
    options: opts4(
      'Cloud KMS (AWS KMS, Azure Key Vault, GCP KMS)',
      'Hardware Security Module (HSM) via PKCS#11',
      'Transit secrets engine on another Vault cluster',
      'Storing the root token in the storage backend'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Auto-unseal can use a cloud KMS, an HSM (PKCS#11), or the Transit engine on a separate trusted Vault. Storing the root token in storage is not an unseal mechanism and would be a serious security flaw.',
    references: [REF_AUTOUNSEAL]
  },
  {
    domain: ARCH, difficulty: 2, type: QType.SINGLE,
    stem: 'Which storage backend is officially recommended by HashiCorp for a production HA Vault deployment without an external dependency?',
    options: opts4(
      'In-memory storage',
      'Integrated storage (Raft)',
      'The file backend',
      'No storage backend is needed'
    ),
    correct: ['b'],
    explanation: 'Integrated storage (Raft) is the HashiCorp-recommended production backend; it provides HA and durability without an external system. In-memory and file backends are not suitable for production HA.',
    references: [REF_INTEGRATED_STORAGE]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'Why does HashiCorp recommend an odd number of voting nodes (e.g., 3 or 5) in a Raft-backed Vault cluster?',
    options: opts4(
      'It reduces disk usage',
      'Quorum is a majority; an even count provides no additional fault tolerance over the next lower odd count',
      'Even counts are not supported at all',
      'It speeds up TLS handshakes'
    ),
    correct: ['b'],
    explanation: 'Raft needs a majority for quorum. Going from 3 to 4 nodes still tolerates only 1 failure, so even counts waste a node. Odd counts (3, 5, 7) maximize fault tolerance per node.',
    references: [REF_INTEGRATED_STORAGE]
  },
  {
    domain: ARCH, difficulty: 2, type: QType.SINGLE,
    stem: 'What is the role of the initial root token produced by `vault operator init`?',
    options: opts4(
      'It is required on every unseal',
      'It is a superuser token used to perform initial configuration; it should then be revoked',
      'It encrypts the storage backend',
      'It is one of the Shamir key shares'
    ),
    correct: ['b'],
    explanation: 'The initial root token has unrestricted access for bootstrapping (enabling auth methods, writing policies). Best practice is to use it for setup and then revoke it, generating new root tokens only when needed.',
    references: [REF_TOKENS, REF_SEAL]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'An operator must temporarily reduce load on the active node in an HA cluster by forcing a new leader election. Which command does this safely?',
    options: opts4(
      'vault operator seal',
      'vault operator step-down',
      'vault operator rekey',
      'vault operator init'
    ),
    correct: ['b'],
    explanation: 'step-down makes the current active node give up leadership so a standby is promoted, without sealing the cluster. seal would take Vault offline; rekey/init are unrelated to leadership.',
    references: [REF_HA]
  },

  // ── Authentication and Authorization (13) ──
  {
    domain: AUTH, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'After a successful login through an auth method, what does Vault return to the client?',
    options: opts4(
      'The unseal keys',
      'A token with associated policies and a TTL',
      'The storage backend address',
      'A copy of the audit log'
    ),
    correct: ['b'],
    explanation: 'A successful authentication yields a client token with attached policies and a lease/TTL. The client uses this token for subsequent requests until it expires or is revoked.',
    references: [REF_AUTH_CONCEPT]
  },
  {
    domain: AUTH, difficulty: 3, type: QType.SINGLE,
    stem: 'A CI job needs a Vault token but should never store a long-lived secret on disk. Using AppRole, which pattern minimizes exposure of the SecretID?',
    options: opts4(
      'Hardcode the SecretID in the pipeline definition',
      'Use response-wrapped SecretID delivery so the CI job unwraps a single-use token to obtain it',
      'Disable the SecretID requirement entirely',
      'Share one SecretID across all jobs forever'
    ),
    correct: ['b'],
    explanation: 'Delivering the SecretID wrapped in a single-use response-wrapping token means the credential is only exposed once and tampering is detectable. Hardcoding or sharing SecretIDs broadly defeats AppRole\'s security model.',
    references: [REF_APPROLE, REF_RESPONSE_WRAP]
  },
  {
    domain: AUTH, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command enables the AppRole auth method?',
    options: opts4(
      'vault auth enable approle',
      'vault secrets enable approle',
      'vault write auth/approle',
      'vault login approle'
    ),
    correct: ['a'],
    explanation: '`vault auth enable approle` mounts the AppRole auth method. Roles are then configured under auth/approle/role/<name>. AppRole is an auth method, not a secrets engine.',
    references: [REF_APPROLE]
  },
  {
    domain: AUTH, difficulty: 3, type: QType.SINGLE,
    stem: 'How can the same human user authenticating via LDAP and via userpass be treated as one principal for policy and audit purposes?',
    options: opts4(
      'Create two separate root tokens',
      'Link both auth aliases to a single identity entity',
      'Disable one of the auth methods',
      'Use the same password for both'
    ),
    correct: ['b'],
    explanation: 'Vault\'s identity system lets you attach multiple auth-method aliases to one entity. Policies and metadata on the entity then apply regardless of which method the user logged in with.',
    references: [REF_IDENTITY]
  },
  {
    domain: AUTH, difficulty: 2, type: QType.SINGLE,
    stem: 'Which auth method validates a JSON Web Token / OIDC ID token issued by an external identity provider?',
    options: opts4(
      'kv',
      'JWT/OIDC auth method',
      'transit',
      'pki'
    ),
    correct: ['b'],
    explanation: 'The JWT/OIDC auth method authenticates clients by verifying a signed JWT or completing an OIDC flow against a configured provider, mapping claims to Vault roles and policies.',
    references: [REF_AUTH]
  },
  {
    domain: AUTH, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Vault identity groups.',
    options: opts4(
      'Groups can be internal (managed in Vault) or external (mapped from an identity provider).',
      'Policies assigned to a group apply to all member entities.',
      'Groups can be nested, with a parent group inheriting member policies.',
      'A group is a type of secrets engine.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Identity groups can be internal or external, propagate their policies to member entities, and support nesting. A group is part of the identity system, not a secrets engine, so option D is false.',
    references: [REF_IDENTITY]
  },
  {
    domain: AUTH, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command creates a userpass user named `alice` with password `changeit` and policy `app-ro`?',
    options: opts4(
      'vault write auth/userpass/users/alice password=changeit policies=app-ro',
      'vault token create alice',
      'vault policy write alice app-ro',
      'vault secrets enable userpass alice'
    ),
    correct: ['a'],
    explanation: 'Userpass users are configured by writing to auth/userpass/users/<name> with a password and policies. Token/policy/secrets commands do not create userpass users.',
    references: [REF_USERPASS]
  },
  {
    domain: AUTH, difficulty: 3, type: QType.SINGLE,
    stem: 'An AppRole is configured with token_policies set to ["app-ro"]. What does a token obtained via this role get?',
    options: opts4(
      'Root access',
      'The app-ro policy plus the default policy unless default is disabled',
      'No policies at all',
      'All policies on the server'
    ),
    correct: ['b'],
    explanation: 'Tokens issued by the role receive token_policies (app-ro) and, by default, the default policy as well. The default policy can be excluded by configuring the role to not attach it.',
    references: [REF_APPROLE, REF_POLICIES]
  },
  {
    domain: AUTH, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command disables the LDAP auth method mounted at the default path?',
    options: opts4(
      'vault auth disable ldap',
      'vault secrets disable ldap',
      'vault delete auth/ldap',
      'vault policy delete ldap'
    ),
    correct: ['a'],
    explanation: '`vault auth disable ldap` removes the LDAP auth method and revokes tokens it issued. `vault secrets disable` targets secrets engines, not auth methods.',
    references: [REF_LDAP_AUTH, REF_AUTH]
  },
  {
    domain: AUTH, difficulty: 3, type: QType.SINGLE,
    stem: 'A Kubernetes workload presents its service account token to Vault. How does the Kubernetes auth method confirm the token is valid?',
    options: opts4(
      'It decrypts the token with the Vault root key',
      'It calls the Kubernetes TokenReview API to validate the service account token',
      'It compares the token to a static list in a KV mount',
      'It trusts any token presented'
    ),
    correct: ['b'],
    explanation: 'The Kubernetes auth method uses the cluster\'s TokenReview API to validate the presented service account JWT, then maps it to a configured role and its policies.',
    references: [REF_K8S_AUTH]
  },
  {
    domain: AUTH, difficulty: 2, type: QType.SINGLE,
    stem: 'Authentication (proving who you are) and authorization (what you may do) are distinct steps in Vault, with policies handling authorization.',
    options: opts4('True', 'False', 'They are the same step', 'Only for root tokens'),
    correct: ['a'],
    explanation: 'True. Auth methods perform authentication and issue a token; ACL policies attached to that token govern authorization for each subsequent request.',
    references: [REF_AUTH_CONCEPT, REF_POLICIES]
  },
  {
    domain: AUTH, difficulty: 3, type: QType.SINGLE,
    stem: 'An operator wants AWS EC2 instances to authenticate using their IAM role rather than instance metadata signatures. Which AWS auth type should be configured?',
    options: opts4(
      'ec2 type',
      'iam type',
      'tls type',
      'oidc type'
    ),
    correct: ['b'],
    explanation: 'The AWS auth method supports ec2 and iam authentication types. The iam type authenticates using AWS IAM credentials/role identity, which is generally preferred for flexibility over the ec2 instance-identity flow.',
    references: [REF_AWS_AUTH]
  },
  {
    domain: AUTH, difficulty: 2, type: QType.SINGLE,
    stem: 'What does the token auth method (mounted at auth/token by default) primarily manage?',
    options: opts4(
      'External LDAP users',
      'Token creation, lookup, renewal, and revocation',
      'KV secret versions',
      'Transit encryption keys'
    ),
    correct: ['b'],
    explanation: 'The token auth method is always enabled and handles core token operations: creating child tokens, lookup, renewal, and revocation. It is the backbone of Vault\'s token lifecycle.',
    references: [REF_TOKEN_AUTH]
  },

  // ── Secrets Engines (13) ──
  {
    domain: SECRETS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What distinguishes a static secret from a dynamic secret in Vault?',
    options: opts4(
      'Static secrets are stored and returned as-is; dynamic secrets are generated on demand with a lease',
      'Static secrets are encrypted; dynamic secrets are not',
      'Dynamic secrets cannot be revoked',
      'Static secrets always expire in 60 seconds'
    ),
    correct: ['a'],
    explanation: 'A static secret (e.g., a KV value) is stored and returned unchanged. A dynamic secret is created when requested, carries a lease, and is automatically revoked at expiry, reducing exposure.',
    references: [REF_DYNAMIC, REF_KV]
  },
  {
    domain: SECRETS, difficulty: 3, type: QType.SINGLE,
    stem: 'A database role is configured with default_ttl=1h and max_ttl=24h. A credential is issued and renewed repeatedly. What is the maximum it can live?',
    options: opts4(
      '1 hour',
      '24 hours, after which it is revoked regardless of renewal',
      'Indefinitely',
      '60 seconds'
    ),
    correct: ['b'],
    explanation: 'default_ttl sets the initial lease; renewals extend it but never beyond max_ttl. After 24 hours the lease cannot be renewed further and Vault revokes the dynamic database credential.',
    references: [REF_DB, REF_LEASE]
  },
  {
    domain: SECRETS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command lists the secret keys under the path `secret/team` in a KV v2 engine?',
    options: opts4(
      'vault kv list secret/team',
      'vault kv get secret/team',
      'vault list auth/secret/team',
      'vault policy list secret/team'
    ),
    correct: ['a'],
    explanation: '`vault kv list secret/team` lists keys at that path (the helper maps to the v2 metadata/ path). `vault kv get` reads a value, not a listing.',
    references: [REF_KV2]
  },
  {
    domain: SECRETS, difficulty: 3, type: QType.SINGLE,
    stem: 'An application should be able to revoke all dynamic secrets it created from a given mount in an incident. Which command revokes by lease prefix?',
    options: opts4(
      'vault lease revoke -prefix <mount-path>',
      'vault secrets disable -force',
      'vault token revoke -all',
      'vault kv destroy <mount-path>'
    ),
    correct: ['a'],
    explanation: '`vault lease revoke -prefix <path>` revokes all leases under a path prefix, immediately invalidating the dynamic secrets generated there — useful for incident containment.',
    references: [REF_LEASE]
  },
  {
    domain: SECRETS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which secrets engine would you use to centrally manage and issue SSH credentials/certificates to access hosts?',
    options: opts4(
      'kv',
      'ssh',
      'transit',
      'totp'
    ),
    correct: ['b'],
    explanation: 'The SSH secrets engine issues signed SSH certificates or one-time passwords so clients can access hosts without distributing long-lived static SSH keys.',
    references: [REF_SECRETS]
  },
  {
    domain: SECRETS, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about the KV version 2 engine.',
    options: opts4(
      'It keeps a configurable number of historical versions of each secret.',
      'Deleting a secret is recoverable via undelete unless it is destroyed.',
      'It exposes data under a data/ path and metadata under a metadata/ path.',
      'It generates unique dynamic database passwords.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'KV v2 versions secrets, supports soft delete/undelete (vs. permanent destroy), and separates data/ from metadata/ paths. It does not generate dynamic secrets — that is the database engine — so D is false.',
    references: [REF_KV2]
  },
  {
    domain: SECRETS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command enables the database secrets engine at the default path?',
    options: opts4(
      'vault secrets enable database',
      'vault auth enable database',
      'vault kv enable database',
      'vault write database/enable'
    ),
    correct: ['a'],
    explanation: '`vault secrets enable database` mounts the database secrets engine. You then configure a connection and roles to generate dynamic credentials.',
    references: [REF_DB]
  },
  {
    domain: SECRETS, difficulty: 3, type: QType.SINGLE,
    stem: 'Why is the PKI secrets engine preferable to manually issuing long-lived certificates from a traditional CA for service-to-service TLS?',
    options: opts4(
      'It eliminates the need for TLS entirely',
      'It can automate issuance of short-lived certificates on demand, reducing the impact of key compromise',
      'It stores private keys in the audit log for recovery',
      'It removes the need for certificate validation'
    ),
    correct: ['b'],
    explanation: 'PKI automates short-lived certificate issuance, so compromised keys expire quickly and rotation is continuous, dramatically reducing operational burden and blast radius versus manual long-lived certs.',
    references: [REF_PKI]
  },
  {
    domain: SECRETS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command moves/remounts a secrets engine from path `kv` to path `kv-team`?',
    options: opts4(
      'vault secrets move kv kv-team',
      'vault kv mv kv kv-team',
      'vault auth move kv kv-team',
      'vault policy move kv kv-team'
    ),
    correct: ['a'],
    explanation: '`vault secrets move <src> <dst>` remounts an existing secrets engine to a new path. There is no `vault kv mv` for remounting engines.',
    references: [REF_SECRETS, REF_MOUNT]
  },
  {
    domain: SECRETS, difficulty: 3, type: QType.SINGLE,
    stem: 'A KV v2 secret was updated several times. How do you read version 2 specifically rather than the latest?',
    options: opts4(
      'vault kv get -version=2 secret/app',
      'vault kv get secret/app@2',
      'vault read secret/v2/app',
      'You cannot read old versions in KV v2'
    ),
    correct: ['a'],
    explanation: 'KV v2 retains versions; `vault kv get -version=<n>` reads a specific historical version. Old versions remain available until deleted or destroyed.',
    references: [REF_KV2]
  },
  {
    domain: SECRETS, difficulty: 2, type: QType.SINGLE,
    stem: 'The database secrets engine can rotate the root credential it uses to connect to the database so that even Vault\'s admin no longer knows it.',
    options: opts4('True', 'False', 'Only for PostgreSQL', 'Only with Enterprise'),
    correct: ['a'],
    explanation: 'True. The rotate-root operation changes the configured root password to a value only Vault knows, removing the original credential from human knowledge and strengthening security.',
    references: [REF_DB]
  },
  {
    domain: SECRETS, difficulty: 3, type: QType.SINGLE,
    stem: 'An app receives a dynamic database credential with a 1h lease but its job runs for 4 hours. What is the correct way to keep the credential valid?',
    options: opts4(
      'Disable leasing on the mount',
      'Periodically renew the lease before it expires (within max_ttl)',
      'Re-init Vault',
      'Use a root token instead'
    ),
    correct: ['b'],
    explanation: 'Long-running consumers should renew the lease before expiry (e.g., via Vault Agent) so the credential stays valid up to the configured max_ttl. Disabling leasing or using root tokens are not appropriate.',
    references: [REF_LEASE, REF_DB]
  },
  {
    domain: SECRETS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which engine generates time-based one-time passwords (TOTP) usable as a Vault-managed MFA code source?',
    options: opts4(
      'kv',
      'totp',
      'transit',
      'pki'
    ),
    correct: ['b'],
    explanation: 'The TOTP secrets engine can act as a generator or validator of time-based one-time passwords, useful for managing or verifying 2FA codes.',
    references: [REF_SECRETS]
  },

  // ── Vault Policies (10) ──
  {
    domain: POLICIES, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A policy rule lists `capabilities = ["create", "update"]` on a path. What can a token with only this policy NOT do on that path?',
    options: opts4(
      'Write new data',
      'Modify existing data',
      'Read the data back',
      'Send a POST request'
    ),
    correct: ['c'],
    explanation: 'create maps to writing new data and update to modifying it (both via POST/PUT). Reading requires the separate read capability, which this policy does not grant, so the token cannot read the data.',
    references: [REF_CAPABILITIES]
  },
  {
    domain: POLICIES, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command displays the contents of an existing policy named `admin`?',
    options: opts4(
      'vault policy read admin',
      'vault policy list admin',
      'vault read policy/admin',
      'vault token lookup admin'
    ),
    correct: ['a'],
    explanation: '`vault policy read <name>` prints the HCL of a named policy. `vault policy list` only shows names; the read subcommand reveals the rules.',
    references: [REF_POLICY_CMD]
  },
  {
    domain: POLICIES, difficulty: 3, type: QType.SINGLE,
    stem: 'In a policy path, what does the `+` wildcard match compared to `*`?',
    options: opts4(
      '+ matches a single path segment; * matches anything to the end of the path',
      '+ and * are identical',
      '+ matches only digits',
      '* matches a single segment; + matches everything'
    ),
    correct: ['a'],
    explanation: 'The `+` wildcard matches exactly one path segment, while `*` (only valid at the end) matches any remaining path. This lets policies target a specific level without granting deeper subpaths.',
    references: [REF_POLICY_SYNTAX]
  },
  {
    domain: POLICIES, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL statements that correctly describe how Vault evaluates multiple policies on a token.',
    options: opts4(
      'Capabilities from all attached policies are unioned for a path.',
      'An explicit deny on a matching path overrides any allow.',
      'More specific path rules take precedence over less specific ones.',
      'Only the first policy in alphabetical order is evaluated.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Vault unions capabilities across policies, lets the most specific path rule win, and always honors deny over allow. It does not evaluate just one policy, so option D is false.',
    references: [REF_POLICY_SYNTAX]
  },
  {
    domain: POLICIES, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command removes a policy named `temp` from Vault?',
    options: opts4(
      'vault policy delete temp',
      'vault delete policy temp',
      'vault policy remove temp',
      'vault auth delete temp'
    ),
    correct: ['a'],
    explanation: '`vault policy delete <name>` deletes a named ACL policy. Tokens that referenced it lose the granted capabilities on their next request evaluation.',
    references: [REF_POLICY_CMD]
  },
  {
    domain: POLICIES, difficulty: 3, type: QType.SINGLE,
    stem: 'A teammate wrote a policy granting `capabilities = ["read"]` on `secret/data/db`. The app reports it cannot list keys under `secret/metadata/`. Why?',
    options: opts4(
      'read also grants list',
      'list is a separate capability and must be granted on the metadata path explicitly',
      'KV v2 does not support listing',
      'The token is expired'
    ),
    correct: ['b'],
    explanation: 'Listing requires the list capability, which is independent of read, and KV v2 listings occur under the metadata/ path. The policy must explicitly grant list there.',
    references: [REF_CAPABILITIES, REF_KV2]
  },
  {
    domain: POLICIES, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'The root policy grants unrestricted access and is associated with root tokens.',
    options: opts4('True', 'False', 'Only in dev mode', 'Only with Enterprise'),
    correct: ['a'],
    explanation: 'True. The special root policy bypasses ACL checks entirely; root tokens carry it. Because of its power, root token use should be minimized and audited.',
    references: [REF_POLICIES]
  },
  {
    domain: POLICIES, difficulty: 3, type: QType.SINGLE,
    stem: 'Which policy construct lets you restrict the allowed parameters/values a client may send when writing to a path?',
    options: opts4(
      'min_decryption_version',
      'allowed_parameters / denied_parameters in the path rule',
      'token_num_uses',
      'seal stanza'
    ),
    correct: ['b'],
    explanation: 'Path rules support fine-grained controls like allowed_parameters and denied_parameters to constrain which request fields/values are permitted, enabling least-privilege at the parameter level.',
    references: [REF_POLICY_SYNTAX]
  },
  {
    domain: POLICIES, difficulty: 2, type: QType.SINGLE,
    stem: 'How are policies typically associated with a user who logs in through the userpass auth method?',
    options: opts4(
      'They are hardcoded in the storage backend',
      'The userpass user definition lists policies that are attached to the issued token',
      'Policies cannot be used with userpass',
      'Every userpass user gets the root policy'
    ),
    correct: ['b'],
    explanation: 'When you create a userpass user you specify policies; on login Vault issues a token carrying those policies (plus default unless disabled). Auth methods are the standard place to map principals to policies.',
    references: [REF_USERPASS, REF_POLICIES]
  },
  {
    domain: POLICIES, difficulty: 3, type: QType.SINGLE,
    stem: 'An auditor wants to verify exactly what a given token is permitted to do on `secret/data/app`. Which command answers this directly?',
    options: opts4(
      'vault token capabilities <token> secret/data/app',
      'vault policy list',
      'vault status',
      'vault kv get secret/data/app'
    ),
    correct: ['a'],
    explanation: '`vault token capabilities <token> <path>` returns the effective capabilities the token has on that path after combining all its policies — exactly what an auditor needs.',
    references: [REF_CAPABILITIES]
  },

  // ── Tokens (10) ──
  {
    domain: TOKENS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What is an orphan token?',
    options: opts4(
      'A token with no policies',
      'A token with no parent, so revoking another token will not cascade to it',
      'A token that cannot authenticate',
      'A token stored only in memory'
    ),
    correct: ['b'],
    explanation: 'An orphan token has no parent in the token hierarchy. Revoking a parent revokes its child tree, but orphan tokens are unaffected by such cascades and must be revoked directly.',
    references: [REF_TOKENS]
  },
  {
    domain: TOKENS, difficulty: 3, type: QType.SINGLE,
    stem: 'Which command renews the current token\'s lease, extending its TTL (subject to max TTL)?',
    options: opts4(
      'vault token renew',
      'vault token create',
      'vault token revoke',
      'vault policy write'
    ),
    correct: ['a'],
    explanation: '`vault token renew` (optionally with -increment) extends the current or specified token\'s TTL up to its max TTL. It does not create a new token or change policies.',
    references: [REF_TOKEN_TTL]
  },
  {
    domain: TOKENS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which token attribute defines how long the token is valid before it expires if not renewed?',
    options: opts4(
      'accessor',
      'TTL (time-to-live)',
      'display_name',
      'entity_id'
    ),
    correct: ['b'],
    explanation: 'The TTL governs how long a token remains valid before expiring; renewing resets it within the max TTL. The accessor and entity_id are identifiers, and display_name is cosmetic.',
    references: [REF_TOKEN_TTL]
  },
  {
    domain: TOKENS, difficulty: 3, type: QType.SINGLE,
    stem: 'A workload needs a token that lives only seconds and is created at very high request rates. Why is a batch token a good fit?',
    options: opts4(
      'It is persisted for durability',
      'It is not written to storage, so it is cheap to create at scale',
      'It can create unlimited child tokens',
      'It never expires'
    ),
    correct: ['b'],
    explanation: 'Batch tokens are encrypted blobs not persisted to storage, making them very cheap to issue at high volume. The trade-off is no renewal, no child tokens, and limited features.',
    references: [REF_TOKEN_TYPES]
  },
  {
    domain: TOKENS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command revokes a specific token using its accessor rather than the token value?',
    options: opts4(
      'vault token revoke -accessor <accessor>',
      'vault token renew <accessor>',
      'vault token create -accessor',
      'vault policy delete <accessor>'
    ),
    correct: ['a'],
    explanation: '`vault token revoke -accessor <accessor>` revokes by accessor, allowing administrators to revoke tokens without ever handling the sensitive token value.',
    references: [REF_TOKENS]
  },
  {
    domain: TOKENS, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about token TTL and lifecycle.',
    options: opts4(
      'A token can be renewed up to its explicit max TTL, if set.',
      'A periodic token has no max TTL and lives as long as it is renewed within the period.',
      'Expired tokens are automatically revoked by Vault.',
      'A revoked token can still be renewed back to life.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Max TTL caps total lifetime; periodic tokens avoid a max TTL; expired tokens are auto-revoked. A revoked token is permanently invalid and cannot be renewed, so option D is false.',
    references: [REF_TOKEN_TTL]
  },
  {
    domain: TOKENS, difficulty: 2, type: QType.SINGLE,
    stem: 'Creating a child token with a shorter TTL and fewer policies than the parent is a recommended least-privilege practice.',
    options: opts4('True', 'False', 'Only for root tokens', 'Only for batch tokens'),
    correct: ['a'],
    explanation: 'True. Issuing narrowly-scoped, short-lived child tokens limits blast radius if a token leaks and aligns with least-privilege principles.',
    references: [REF_TOKENS]
  },
  {
    domain: TOKENS, difficulty: 3, type: QType.SINGLE,
    stem: 'A token role at auth/token/roles/ci sets allowed_policies and renewable=false. What is the effect on tokens created with -role=ci?',
    options: opts4(
      'They can use any policy and be renewed',
      'They are constrained to the allowed_policies and cannot be renewed',
      'They become root tokens',
      'They never expire'
    ),
    correct: ['b'],
    explanation: 'Token roles constrain creation: allowed_policies limits which policies may be attached, and renewable=false prevents renewal, producing tightly-scoped tokens for automation.',
    references: [REF_TOKEN_ROLE]
  },
  {
    domain: TOKENS, difficulty: 3, type: QType.SINGLE,
    stem: 'A wrapping token created with `-wrap-ttl=90s` is not unwrapped within 90 seconds. What happens?',
    options: opts4(
      'It is automatically unwrapped by Vault',
      'It expires and the wrapped secret can no longer be retrieved',
      'It converts into a root token',
      'It is emailed to the operator'
    ),
    correct: ['b'],
    explanation: 'A wrapping token is single-use and TTL-limited. If it is not unwrapped before the wrap TTL expires, it becomes invalid and the wrapped data cannot be retrieved — a tamper/availability signal.',
    references: [REF_RESPONSE_WRAP]
  },
  {
    domain: TOKENS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command looks up details of an arbitrary token by accessor for administrative auditing?',
    options: opts4(
      'vault token lookup -accessor <accessor>',
      'vault token create -accessor <accessor>',
      'vault policy read <accessor>',
      'vault status <accessor>'
    ),
    correct: ['a'],
    explanation: '`vault token lookup -accessor <accessor>` returns metadata (policies, TTL, creation time) for the token referenced by the accessor without exposing the token value.',
    references: [REF_TOKENS]
  },

  // ── Encryption as a Service (9) ──
  {
    domain: EAAS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command enables the Transit secrets engine?',
    options: opts4(
      'vault secrets enable transit',
      'vault auth enable transit',
      'vault transit enable',
      'vault write sys/transit'
    ),
    correct: ['a'],
    explanation: '`vault secrets enable transit` mounts the Transit engine. You then create named keys and call encrypt/decrypt/sign endpoints. Transit is a secrets engine, not an auth method.',
    references: [REF_TRANSIT]
  },
  {
    domain: EAAS, difficulty: 3, type: QType.SINGLE,
    stem: 'After encrypting data with Transit and later rotating the key, how can existing ciphertext be upgraded to the newest key version without exposing plaintext to the operator?',
    options: opts4(
      'Decrypt and re-encrypt manually in a shell',
      'Use the transit/rewrap endpoint, which re-encrypts ciphertext to the latest version',
      'Delete and recreate the key',
      'Rotate the storage backend'
    ),
    correct: ['b'],
    explanation: 'transit/rewrap takes existing ciphertext and returns it encrypted with the latest key version without ever returning plaintext, enabling key-version upgrades without exposing data.',
    references: [REF_TRANSIT_REKEY]
  },
  {
    domain: EAAS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Transit operation produces a keyed hash to verify data integrity without encrypting the data?',
    options: opts4(
      'transit/encrypt',
      'transit/hmac',
      'transit/datakey',
      'transit/decrypt'
    ),
    correct: ['b'],
    explanation: 'transit/hmac generates a keyed HMAC of the input for integrity verification. It does not encrypt the data; it produces a verifiable digest using the named key.',
    references: [REF_TRANSIT]
  },
  {
    domain: EAAS, difficulty: 3, type: QType.SINGLE,
    stem: 'A compliance requirement states that decrypting data older than a certain key version must be blocked. Which Transit setting enforces this?',
    options: opts4(
      'min_decryption_version',
      'convergent_encryption',
      'exportable',
      'allow_plaintext_backup'
    ),
    correct: ['a'],
    explanation: 'Raising min_decryption_version prevents decryption with key versions below that number, effectively retiring old ciphertext that has not been rewrapped — useful for forced rotation/compliance.',
    references: [REF_TRANSIT_REKEY]
  },
  {
    domain: EAAS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'With Transit, the same Vault key can be used by many applications, centralizing key management and rotation.',
    options: opts4('True', 'False', 'Only one app per key', 'Only with Enterprise'),
    correct: ['a'],
    explanation: 'True. A Transit key is a centrally managed resource; multiple authorized applications can call encrypt/decrypt against it, and rotation is handled in one place rather than per application.',
    references: [REF_TRANSIT]
  },
  {
    domain: EAAS, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL valid use cases for the Transit secrets engine.',
    options: opts4(
      'Encrypting application data before storing it in a database',
      'Signing and verifying messages',
      'Generating data keys for envelope encryption',
      'Permanently storing application records inside Vault'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Transit handles encrypt/decrypt of app data, sign/verify, and data key generation for envelope encryption. It deliberately does not store the application\'s records, so option D is false.',
    references: [REF_TRANSIT, REF_TRANSIT_DATAKEY]
  },
  {
    domain: EAAS, difficulty: 2, type: QType.SINGLE,
    stem: 'When calling transit/encrypt, in what form must the plaintext be supplied?',
    options: opts4(
      'Raw UTF-8 text',
      'Base64-encoded',
      'Hex-encoded',
      'URL-encoded'
    ),
    correct: ['b'],
    explanation: 'Transit expects the plaintext parameter to be base64-encoded so binary data is handled safely; the returned ciphertext is a vault-prefixed string that decrypt accepts.',
    references: [REF_TRANSIT]
  },
  {
    domain: EAAS, difficulty: 3, type: QType.SINGLE,
    stem: 'A team wants the ability to detect when two records contain the same value while still encrypting them. Which Transit configuration supports this, and what is the trade-off?',
    options: opts4(
      'Standard encryption; no trade-off',
      'Convergent encryption; it leaks that two ciphertexts share the same plaintext',
      'Disabling the key; loses all access',
      'Exportable keys; no trade-off'
    ),
    correct: ['b'],
    explanation: 'Convergent encryption yields identical ciphertext for identical plaintext (with the same context), enabling equality detection but leaking the fact that two values are equal — a deliberate security trade-off.',
    references: [REF_TRANSIT_CONVERGENT]
  },
  {
    domain: EAAS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command rotates a Transit key named `payments` to a new version?',
    options: opts4(
      'vault write -f transit/keys/payments/rotate',
      'vault kv put transit/payments rotate=true',
      'vault token create -policy=payments',
      'vault policy write payments'
    ),
    correct: ['a'],
    explanation: '`vault write -f transit/keys/<name>/rotate` advances the key to a new version used for subsequent encryptions while older versions remain available for decryption.',
    references: [REF_TRANSIT_REKEY]
  }
];

// ───────────────────── Practice Exam 3 ─────────────────────
const P3: Q[] = [
  // ── Vault Architecture (10) ──
  {
    domain: ARCH, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which statement best describes Vault\'s threat model regarding the storage backend?',
    options: opts4(
      'The storage backend is fully trusted and sees plaintext',
      'The storage backend is treated as untrusted because Vault encrypts all data before writing it',
      'Vault stores nothing in the backend',
      'Only audit logs go to the backend'
    ),
    correct: ['b'],
    explanation: 'Vault encrypts data with its barrier before persisting, so the storage backend only holds ciphertext and is considered untrusted. This is a core part of Vault\'s security model.',
    references: [REF_BARRIER, REF_ARCH]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'During a planned key-management review, the team wants to change Vault\'s underlying encryption key used for new writes without changing the unseal keys. Which operation is appropriate?',
    options: opts4(
      'vault operator rekey',
      'vault operator rotate',
      'vault operator init',
      'vault operator seal'
    ),
    correct: ['b'],
    explanation: 'rotate generates a new encryption key version used for subsequent writes while existing data remains decryptable. rekey changes the unseal key shares, which is a different operation.',
    references: [REF_SEAL]
  },
  {
    domain: ARCH, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which configuration stanza defines the address and TLS settings clients use to reach the Vault API?',
    options: opts4(
      'storage',
      'listener',
      'seal',
      'telemetry'
    ),
    correct: ['b'],
    explanation: 'The listener stanza (typically tcp) configures the API bind address, port, and TLS certificate/key. storage defines persistence, seal defines auto-unseal, telemetry defines metrics.',
    references: [REF_STORAGE]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Vault\'s seal/unseal process.',
    options: opts4(
      'A freshly started Vault begins sealed and must be unsealed before serving requests.',
      'Shamir unseal requires a threshold of key shares to reconstruct the master key.',
      'Auto-unseal removes the manual share-entry step using an external key provider.',
      'Sealing Vault permanently deletes all stored secrets.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Vault starts sealed; Shamir requires a threshold of shares; auto-unseal offloads the step to a KMS/HSM/Transit. Sealing only makes data inaccessible until unsealed — it does not delete data, so D is false.',
    references: [REF_SEAL, REF_AUTOUNSEAL]
  },
  {
    domain: ARCH, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command manually seals a running Vault server (e.g., during a security incident)?',
    options: opts4(
      'vault operator seal',
      'vault operator unseal',
      'vault operator step-down',
      'vault status -seal'
    ),
    correct: ['a'],
    explanation: '`vault operator seal` immediately seals Vault, discarding the in-memory master key so no data can be decrypted until it is unsealed again — a fast incident-response control.',
    references: [REF_SEAL]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'Why might an operator choose Transit-based auto-unseal (one Vault unsealing another) over a cloud KMS?',
    options: opts4(
      'It is the only supported auto-unseal method',
      'It keeps the unseal trust within HashiCorp Vault rather than a cloud provider, useful on-prem',
      'It eliminates the need for any keys',
      'It disables the barrier'
    ),
    correct: ['b'],
    explanation: 'Transit auto-unseal lets a trusted central Vault provide the unseal key, keeping the trust boundary within Vault — valuable for on-prem or cloud-agnostic deployments without an external KMS.',
    references: [REF_AUTOUNSEAL]
  },
  {
    domain: ARCH, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Vault must be initialized exactly once per cluster, and initializing again on an existing cluster is not a normal operation.',
    options: opts4('True', 'False', 'It must be initialized on every boot', 'Only dev mode skips init'),
    correct: ['a'],
    explanation: 'True. Initialization is a one-time bootstrap that creates the master key and root token. An already-initialized cluster is not re-initialized; you unseal it instead.',
    references: [REF_SEAL]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'A 3-node Raft Vault cluster loses one node. What is the cluster status?',
    options: opts4(
      'The cluster loses quorum and becomes unavailable',
      'The cluster keeps quorum (2 of 3) and continues to operate',
      'All data is lost',
      'It automatically promotes a worker'
    ),
    correct: ['b'],
    explanation: 'Quorum is a majority. With 3 nodes, 2 remain after one failure, which is still a majority, so the cluster continues operating. Losing a second node would break quorum.',
    references: [REF_INTEGRATED_STORAGE]
  },
  {
    domain: ARCH, difficulty: 2, type: QType.SINGLE,
    stem: 'In Vault dev mode (`vault server -dev`), what is true about its state?',
    options: opts4(
      'It is durable and production-ready',
      'It is in-memory, automatically unsealed, and intended only for development/testing',
      'It uses Raft storage by default',
      'It requires manual unsealing'
    ),
    correct: ['b'],
    explanation: 'Dev mode runs in-memory, auto-unsealed, with a known root token and no TLS — convenient for learning/testing but explicitly not for production because data is not persisted.',
    references: [REF_SEAL]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'An operator notices Vault metrics are not reaching Prometheus. Which configuration area should they check first?',
    options: opts4(
      'The seal stanza',
      'The telemetry stanza',
      'The storage stanza',
      'The policy store'
    ),
    correct: ['b'],
    explanation: 'Metrics export is configured in the telemetry stanza (e.g., prometheus_retention_time and enabling the metrics endpoint). Seal/storage/policy are unrelated to metrics delivery.',
    references: [REF_TELEMETRY]
  },

  // ── Authentication and Authorization (13) ──
  {
    domain: AUTH, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which of the following is an auth method (not a secrets engine)?',
    options: opts4(
      'transit',
      'AppRole',
      'kv',
      'pki'
    ),
    correct: ['b'],
    explanation: 'AppRole is an auth method used for machine authentication. transit, kv, and pki are secrets engines that perform cryptographic operations or store/generate secrets.',
    references: [REF_AUTH]
  },
  {
    domain: AUTH, difficulty: 3, type: QType.SINGLE,
    stem: 'An operator enables userpass at a custom path with `vault auth enable -path=corp userpass`. How do users now log in?',
    options: opts4(
      'vault login -method=userpass -path=corp username=alice',
      'vault login -method=corp',
      'vault auth corp',
      'vault token create -path=corp'
    ),
    correct: ['a'],
    explanation: 'When an auth method is mounted at a custom path, clients specify -path so Vault routes the login to the correct mount: `vault login -method=userpass -path=corp username=alice`.',
    references: [REF_USERPASS, REF_AUTH]
  },
  {
    domain: AUTH, difficulty: 2, type: QType.SINGLE,
    stem: 'What does the RoleID represent in the AppRole auth method?',
    options: opts4(
      'A secret password that must be kept confidential at all costs',
      'A semi-public identifier of the role, analogous to a username',
      'The Vault root token',
      'An unseal key share'
    ),
    correct: ['b'],
    explanation: 'RoleID is a relatively non-sensitive identifier (like a username) that selects the AppRole. The SecretID is the sensitive credential paired with it to obtain a token.',
    references: [REF_APPROLE]
  },
  {
    domain: AUTH, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Vault entities and aliases in the identity system.',
    options: opts4(
      'An alias maps a specific auth-method login to an entity.',
      'An entity can have at most one alias per auth mount.',
      'Policies can be attached directly to an entity.',
      'Entities are stored in the audit device.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Aliases tie an auth-method login to an entity (one alias per mount per entity), and entities can carry their own policies. Entities live in the identity store, not the audit device, so D is false.',
    references: [REF_IDENTITY]
  },
  {
    domain: AUTH, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command generates a new SecretID for an AppRole named `app`?',
    options: opts4(
      'vault write -f auth/approle/role/app/secret-id',
      'vault token create -role=app',
      'vault policy write app',
      'vault auth enable app'
    ),
    correct: ['a'],
    explanation: 'Writing to auth/approle/role/<name>/secret-id issues a new SecretID for that role. The other commands create tokens, write policies, or enable auth methods — not SecretIDs.',
    references: [REF_APPROLE]
  },
  {
    domain: AUTH, difficulty: 3, type: QType.SINGLE,
    stem: 'A security team wants AppRole logins permitted only from a specific CIDR range. Which role parameter enforces this?',
    options: opts4(
      'token_policies',
      'secret_id_bound_cidrs / token_bound_cidrs',
      'min_decryption_version',
      'period'
    ),
    correct: ['b'],
    explanation: 'AppRole supports CIDR binding (secret_id_bound_cidrs and token_bound_cidrs) so SecretIDs/tokens can only be used from approved network ranges, hardening machine authentication.',
    references: [REF_APPROLE]
  },
  {
    domain: AUTH, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command shows detailed configuration (accessor, type, path) for the auth methods enabled?',
    options: opts4(
      'vault auth list -detailed',
      'vault policy list -detailed',
      'vault status -detailed',
      'vault token lookup -detailed'
    ),
    correct: ['a'],
    explanation: '`vault auth list -detailed` includes additional columns such as accessor, default/max lease TTLs, and configuration, beyond the basic path/type listing.',
    references: [REF_AUTH]
  },
  {
    domain: AUTH, difficulty: 3, type: QType.SINGLE,
    stem: 'Why is the AWS iam auth type often preferred over distributing an AppRole SecretID to EC2 instances?',
    options: opts4(
      'It is faster to type',
      'It leverages existing AWS identity so no Vault-specific secret needs to be distributed to the instance',
      'It disables policies',
      'It requires no configuration'
    ),
    correct: ['b'],
    explanation: 'AWS iam auth uses the instance/role\'s existing AWS credentials to prove identity, eliminating the need to distribute and protect a separate Vault SecretID on each host.',
    references: [REF_AWS_AUTH]
  },
  {
    domain: AUTH, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Disabling an auth method also revokes the tokens that were issued through it.',
    options: opts4('True', 'False', 'Only batch tokens survive', 'Only with Enterprise'),
    correct: ['a'],
    explanation: 'True. When an auth method is disabled, Vault revokes the tokens and leases created by it, preventing orphaned access through a removed method.',
    references: [REF_AUTH]
  },
  {
    domain: AUTH, difficulty: 3, type: QType.SINGLE,
    stem: 'A Kubernetes auth role binds bound_service_account_names and bound_service_account_namespaces. What is the purpose of these bindings?',
    options: opts4(
      'They encrypt the service account token',
      'They restrict which service accounts in which namespaces may authenticate to that role',
      'They set the token TTL only',
      'They disable the auth method'
    ),
    correct: ['b'],
    explanation: 'These bindings constrain a Kubernetes auth role so only the named service accounts in the specified namespaces can log in and receive that role\'s policies — enforcing least privilege.',
    references: [REF_K8S_AUTH]
  },
  {
    domain: AUTH, difficulty: 2, type: QType.SINGLE,
    stem: 'Which auth method is appropriate for letting developers log in with their organization\'s GitHub team membership?',
    options: opts4(
      'AppRole',
      'GitHub auth method',
      'transit',
      'pki'
    ),
    correct: ['b'],
    explanation: 'The GitHub auth method authenticates users via a GitHub personal access token and maps their GitHub organization/team membership to Vault policies.',
    references: [REF_AUTH]
  },
  {
    domain: AUTH, difficulty: 3, type: QType.SINGLE,
    stem: 'An identity group of type "external" is created. What is it primarily used for?',
    options: opts4(
      'Storing KV secrets',
      'Mapping groups from an external identity provider (e.g., LDAP/OIDC) to Vault policies',
      'Rotating Transit keys',
      'Sealing Vault'
    ),
    correct: ['b'],
    explanation: 'External identity groups correspond to groups defined in an external IdP. Membership is determined by the auth method, and the group\'s policies apply to matching users automatically.',
    references: [REF_IDENTITY]
  },
  {
    domain: AUTH, difficulty: 2, type: QType.SINGLE,
    stem: 'After `vault login -method=userpass username=alice`, where is the resulting token stored for subsequent CLI calls by default?',
    options: opts4(
      'In the storage backend',
      'In the CLI token helper (e.g., ~/.vault-token)',
      'In the audit log',
      'In an environment variable that Vault sets'
    ),
    correct: ['b'],
    explanation: 'The CLI caches the token via its token helper, by default the file ~/.vault-token, so subsequent commands authenticate automatically without re-login.',
    references: [REF_TOKEN_AUTH]
  },

  // ── Secrets Engines (13) ──
  {
    domain: SECRETS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which secrets engine is enabled by default in a non-dev Vault and stores arbitrary key/value secrets?',
    options: opts4(
      'No secrets engine is enabled until you enable one (KV at secret/ in dev only)',
      'transit',
      'pki',
      'database'
    ),
    correct: ['a'],
    explanation: 'In production Vault no secrets engine is pre-enabled; you mount KV (or others) explicitly. Dev mode conveniently mounts a KV v2 engine at secret/ automatically.',
    references: [REF_KV, REF_SECRETS]
  },
  {
    domain: SECRETS, difficulty: 3, type: QType.SINGLE,
    stem: 'A database secrets engine role uses creation_statements to define how the user is created. What does this enable?',
    options: opts4(
      'Hardcoding a single shared password',
      'Customizing the exact SQL/permissions granted to each dynamically created database user',
      'Disabling leases',
      'Encrypting the database files'
    ),
    correct: ['b'],
    explanation: 'creation_statements is templated SQL Vault runs to create each dynamic user, letting you tailor privileges precisely per role so credentials follow least privilege.',
    references: [REF_DB]
  },
  {
    domain: SECRETS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command permanently destroys version 3 of a KV v2 secret at secret/app so it cannot be undeleted?',
    options: opts4(
      'vault kv destroy -versions=3 secret/app',
      'vault kv delete -versions=3 secret/app',
      'vault kv undelete -versions=3 secret/app',
      'vault kv get -version=3 secret/app'
    ),
    correct: ['a'],
    explanation: '`vault kv destroy -versions=3` permanently removes that version\'s data (irreversible), unlike `delete` which is a recoverable soft delete via undelete.',
    references: [REF_KV2]
  },
  {
    domain: SECRETS, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL benefits of dynamic secrets over long-lived static credentials.',
    options: opts4(
      'Each consumer can get a unique credential',
      'Credentials are automatically revoked when the lease expires',
      'A leaked credential has a limited lifetime and scope',
      'They never need to be configured'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Dynamic secrets provide per-consumer uniqueness, automatic revocation at lease end, and limited blast radius if leaked. They still require engine/role configuration, so option D is false.',
    references: [REF_DYNAMIC, REF_LEASE]
  },
  {
    domain: SECRETS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command tunes the default lease TTL for a secrets engine mounted at `database`?',
    options: opts4(
      'vault secrets tune -default-lease-ttl=1h database/',
      'vault kv tune database',
      'vault policy tune database',
      'vault auth tune database'
    ),
    correct: ['a'],
    explanation: '`vault secrets tune -default-lease-ttl=<dur> <path>/` adjusts mount-level lease settings such as the default and max lease TTL for that secrets engine.',
    references: [REF_MOUNT, REF_LEASE]
  },
  {
    domain: SECRETS, difficulty: 3, type: QType.SINGLE,
    stem: 'A team wants Vault to issue and sign SSH certificates so users can SSH into hosts without managing key pairs. Which PKI-like engine handles SSH specifically?',
    options: opts4(
      'transit',
      'ssh (signed certificates / CA mode)',
      'kv',
      'totp'
    ),
    correct: ['b'],
    explanation: 'The SSH secrets engine in CA mode signs user SSH public keys producing short-lived certificates trusted by hosts, removing the need to distribute and manage static SSH key pairs.',
    references: [REF_SECRETS]
  },
  {
    domain: SECRETS, difficulty: 2, type: QType.SINGLE,
    stem: 'In KV v2, which path prefix is used to read/write the secret data itself (when not using the kv helper)?',
    options: opts4(
      'secret/data/<path>',
      'secret/raw/<path>',
      'secret/value/<path>',
      'secret/kv/<path>'
    ),
    correct: ['a'],
    explanation: 'KV v2 stores values under secret/data/<path> and metadata under secret/metadata/<path>. The `vault kv` helper hides this, but raw API/policy paths must use these prefixes.',
    references: [REF_KV2]
  },
  {
    domain: SECRETS, difficulty: 3, type: QType.SINGLE,
    stem: 'During an incident an operator must immediately invalidate every AWS credential Vault issued from the aws/ mount. Which approach is fastest and safest?',
    options: opts4(
      'Delete the IAM users one by one in the AWS console',
      'Run vault lease revoke -prefix aws/creds to revoke all leases under the mount',
      'Restart the Vault server',
      'Rotate the unseal keys'
    ),
    correct: ['b'],
    explanation: 'Revoking by lease prefix tells Vault to revoke all dynamic AWS secrets it issued under that path, which Vault then cleans up in AWS — far faster and more reliable than manual deletion.',
    references: [REF_LEASE, REF_AWS_SECRETS]
  },
  {
    domain: SECRETS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'The transit secrets engine stores the data you send it to be encrypted.',
    options: opts4('True', 'False', 'Only ciphertext', 'Only for convergent keys'),
    correct: ['b'],
    explanation: 'False. Transit performs cryptographic operations and returns ciphertext but does not store the data. The calling application is responsible for storing the returned ciphertext.',
    references: [REF_TRANSIT]
  },
  {
    domain: SECRETS, difficulty: 3, type: QType.SINGLE,
    stem: 'A database secrets engine is configured but credential generation fails with a permissions error from the database. What is the most likely cause?',
    options: opts4(
      'Vault is sealed',
      'The configured connection (root) user lacks privileges to create the users described in creation_statements',
      'The KV engine is disabled',
      'The token has no default policy'
    ),
    correct: ['b'],
    explanation: 'Vault uses the configured connection user to run creation_statements. If that account lacks CREATE USER/GRANT privileges, dynamic credential generation fails — a common misconfiguration.',
    references: [REF_DB]
  },
  {
    domain: SECRETS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command reads metadata (including version history) for a KV v2 secret at secret/app?',
    options: opts4(
      'vault kv metadata get secret/app',
      'vault kv get secret/app',
      'vault read secret/app/history',
      'vault policy read secret/app'
    ),
    correct: ['a'],
    explanation: '`vault kv metadata get secret/app` returns version metadata: current version, created/updated times, and per-version state (deleted/destroyed). `vault kv get` returns the value, not metadata.',
    references: [REF_KV2]
  },
  {
    domain: SECRETS, difficulty: 3, type: QType.SINGLE,
    stem: 'An application uses a dynamic database credential. The lease is about to expire and the app calls renew, but Vault denies it. The lease has reached max_ttl. What should the app do?',
    options: opts4(
      'Keep retrying renew until it succeeds',
      'Request a brand-new credential from the database role',
      'Switch to the root token',
      'Disable leasing'
    ),
    correct: ['b'],
    explanation: 'Once max_ttl is reached the lease cannot be renewed further. The correct pattern is to request a fresh dynamic credential from the role, obtaining a new lease.',
    references: [REF_LEASE, REF_DB]
  },
  {
    domain: SECRETS, difficulty: 2, type: QType.SINGLE,
    stem: 'What does enabling a secrets engine at a custom path with -path allow?',
    options: opts4(
      'Running multiple isolated instances of the same engine type for different teams/environments',
      'Bypassing policy checks',
      'Disabling encryption for that path',
      'Sharing one mount across all engine types'
    ),
    correct: ['a'],
    explanation: 'Custom -path lets you mount the same engine type multiple times (e.g., kv-team-a, kv-team-b), isolating data and policies per team or environment on one Vault server.',
    references: [REF_MOUNT]
  },

  // ── Vault Policies (10) ──
  {
    domain: POLICIES, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which capability is required for a token to enumerate (list) the keys under a path, as opposed to reading their values?',
    options: opts4(
      'read',
      'list',
      'sudo',
      'update'
    ),
    correct: ['b'],
    explanation: 'The list capability authorizes enumerating keys under a path. Reading a value needs read. They are independent, so a policy must grant list explicitly to allow listings.',
    references: [REF_CAPABILITIES]
  },
  {
    domain: POLICIES, difficulty: 3, type: QType.SINGLE,
    stem: 'A policy uses `path "secret/data/app/+/config"`. Which path does it match?',
    options: opts4(
      'secret/data/app/config only',
      'secret/data/app/<one-segment>/config (exactly one segment in place of +)',
      'Any path under secret/',
      'Nothing — + is invalid'
    ),
    correct: ['b'],
    explanation: 'The + wildcard matches exactly one path segment. So secret/data/app/+/config matches secret/data/app/web/config or .../db/config but not deeper or shallower paths.',
    references: [REF_POLICY_SYNTAX]
  },
  {
    domain: POLICIES, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which statement about the relationship between tokens and policies is correct?',
    options: opts4(
      'Policies are attached to tokens; a token with no policy (other than default) can do almost nothing',
      'Tokens contain the secrets they may read',
      'Policies are stored inside the token value',
      'A token can only ever have one policy'
    ),
    correct: ['a'],
    explanation: 'Policies are referenced by the token and define its permissions. Without granting policies a token is effectively powerless (default-deny). Tokens can carry multiple policies and do not embed secrets.',
    references: [REF_POLICIES]
  },
  {
    domain: POLICIES, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about the deny capability and policy precedence.',
    options: opts4(
      'deny on a matching path overrides all other capabilities for that path.',
      'A more specific path rule takes precedence over a less specific one.',
      'Capabilities across policies are combined (unioned) before deny is applied.',
      'deny only applies to root tokens.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'deny always wins on matching paths, the most specific rule takes precedence, and capabilities are unioned across policies (with deny then enforced). deny applies to non-root tokens generally, so D is false.',
    references: [REF_POLICY_SYNTAX]
  },
  {
    domain: POLICIES, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command formats/validates a policy file before applying it (checking HCL syntax via a write)?',
    options: opts4(
      'vault policy fmt policy.hcl',
      'vault policy compile policy.hcl',
      'vault policy lint policy.hcl',
      'vault hcl check policy.hcl'
    ),
    correct: ['a'],
    explanation: '`vault policy fmt <file>` formats a policy file in place to canonical HCL, which also surfaces obvious syntax problems. There is no compile/lint subcommand for policies.',
    references: [REF_POLICY_CMD]
  },
  {
    domain: POLICIES, difficulty: 3, type: QType.SINGLE,
    stem: 'A least-privilege policy should let an app read only secret/data/app/db and renew its own token. Which set of rules is appropriate?',
    options: opts4(
      'A single rule granting * with sudo on secret/',
      'A rule granting read on secret/data/app/db plus reliance on the default policy for token self-renewal',
      'Granting deny everywhere',
      'Granting root policy'
    ),
    correct: ['b'],
    explanation: 'Least privilege means granting read only on the specific secret path; token self-renewal/lookup is already covered by the default policy attached to most tokens. Wildcards/sudo/root violate least privilege.',
    references: [REF_POLICIES, REF_CAPABILITIES]
  },
  {
    domain: POLICIES, difficulty: 2, type: QType.SINGLE,
    stem: 'Editing a policy immediately affects existing tokens that reference it on their next request.',
    options: opts4('True', 'False', 'Only after token renewal', 'Only after reseal'),
    correct: ['a'],
    explanation: 'True. Policies are evaluated at request time, so updating a policy changes the effective permissions of all tokens that reference it on subsequent requests without needing re-issuance.',
    references: [REF_POLICIES]
  },
  {
    domain: POLICIES, difficulty: 3, type: QType.SINGLE,
    stem: 'Which command checks the effective capabilities the CURRENT token has on `sys/policies/acl`?',
    options: opts4(
      'vault token capabilities sys/policies/acl',
      'vault policy read sys',
      'vault status',
      'vault auth list'
    ),
    correct: ['a'],
    explanation: '`vault token capabilities <path>` (without a token argument) reports the calling token\'s effective capabilities on that path after merging all its policies.',
    references: [REF_CAPABILITIES]
  },
  {
    domain: POLICIES, difficulty: 2, type: QType.SINGLE,
    stem: 'Why must policies that manage other policies grant access to the `sys/policies/acl/*` path?',
    options: opts4(
      'Because secrets live there',
      'Because policy CRUD operations are exposed under that system path',
      'Because it stores unseal keys',
      'Because it is the audit device path'
    ),
    correct: ['b'],
    explanation: 'Policy management (create/read/update/delete ACL policies) is performed via the sys/policies/acl/ API path, so a delegated policy-admin policy must grant capabilities there.',
    references: [REF_POLICIES, REF_POLICY_CMD]
  },
  {
    domain: POLICIES, difficulty: 3, type: QType.SINGLE,
    stem: 'A policy includes `path "auth/token/create" { capabilities = ["update"] }`. What does this allow the token to do?',
    options: opts4(
      'Read secrets in secret/',
      'Create child tokens via the token auth method',
      'Seal Vault',
      'Rotate Transit keys'
    ),
    correct: ['b'],
    explanation: 'The auth/token/create endpoint mints tokens; granting update there lets the holder create child tokens. It does not confer secret access, sealing, or Transit operations.',
    references: [REF_CAPABILITIES, REF_TOKENS]
  },

  // ── Tokens (10) ──
  {
    domain: TOKENS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which token type is persisted to Vault storage and supports renewal and child tokens?',
    options: opts4(
      'Batch token',
      'Service token',
      'Wrapping token',
      'Unseal key'
    ),
    correct: ['b'],
    explanation: 'Service tokens are the default, fully-featured tokens: persisted to storage, renewable, capable of creating child tokens, and revocable with cascading. Batch tokens lack these features.',
    references: [REF_TOKEN_TYPES]
  },
  {
    domain: TOKENS, difficulty: 3, type: QType.SINGLE,
    stem: 'A token is created with `-explicit-max-ttl=2h`. After 2 hours of repeated renewals, what happens?',
    options: opts4(
      'It keeps renewing forever',
      'It is forcibly expired and cannot be renewed past the explicit max TTL',
      'It becomes a root token',
      'It converts to a batch token'
    ),
    correct: ['b'],
    explanation: 'An explicit max TTL is a hard cap; regardless of mount or system max TTL, the token cannot live or be renewed beyond 2 hours from creation, after which Vault expires it.',
    references: [REF_TOKEN_TTL]
  },
  {
    domain: TOKENS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command creates a token that has no parent (will not be revoked when another token is revoked)?',
    options: opts4(
      'vault token create -orphan',
      'vault token create -batch',
      'vault token renew -orphan',
      'vault token revoke -orphan'
    ),
    correct: ['a'],
    explanation: '`vault token create -orphan` produces an orphan token with no parent, so parent-revocation cascades do not affect it. It must be revoked explicitly when no longer needed.',
    references: [REF_TOKENS]
  },
  {
    domain: TOKENS, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL correct statements about response wrapping and wrapping tokens.',
    options: opts4(
      'The wrapping token is single-use; unwrapping it consumes it.',
      'A wrap TTL limits how long the wrapped data can be retrieved.',
      'Unwrapping returns the original wrapped response.',
      'A wrapping token grants permanent root access.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Wrapping tokens are single-use, TTL-limited, and unwrap to the original response, which lets recipients detect tampering. They do not grant root access, so option D is false.',
    references: [REF_RESPONSE_WRAP]
  },
  {
    domain: TOKENS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command unwraps data delivered via a response-wrapping token?',
    options: opts4(
      'vault unwrap <wrapping-token>',
      'vault token renew <wrapping-token>',
      'vault kv get <wrapping-token>',
      'vault policy read <wrapping-token>'
    ),
    correct: ['a'],
    explanation: '`vault unwrap` (with the wrapping token via -wrap or VAULT_TOKEN) retrieves the wrapped response exactly once. After that the wrapping token is consumed and invalid.',
    references: [REF_RESPONSE_WRAP]
  },
  {
    domain: TOKENS, difficulty: 3, type: QType.SINGLE,
    stem: 'An operator wants tokens issued to a CI system to be non-renewable, short-lived, and limited to specific policies. Which mechanism centralizes these constraints?',
    options: opts4(
      'A token role configured under auth/token/roles/<name>',
      'A KV secret',
      'A Transit key',
      'An audit device'
    ),
    correct: ['a'],
    explanation: 'Token roles let administrators predefine constraints (allowed_policies, renewable, TTLs, orphan, etc.) so `vault token create -role=<name>` consistently issues appropriately scoped tokens.',
    references: [REF_TOKEN_ROLE]
  },
  {
    domain: TOKENS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'The token accessor is sensitive and grants the same access as the token itself.',
    options: opts4('True', 'False', 'Only for service tokens', 'Only for batch tokens'),
    correct: ['b'],
    explanation: 'False. The accessor cannot be used to authenticate or read secrets; it only permits limited management operations like lookup and revoke, which is why it is safe to log for auditing.',
    references: [REF_TOKENS]
  },
  {
    domain: TOKENS, difficulty: 3, type: QType.SINGLE,
    stem: 'A parent token with TTL 1h creates a child token. The parent is revoked after 10 minutes. What happens to the child?',
    options: opts4(
      'The child continues until its own TTL',
      'The child is revoked because revoking a parent cascades to its children',
      'The child becomes an orphan automatically',
      'Nothing changes'
    ),
    correct: ['b'],
    explanation: 'Token revocation cascades down the hierarchy: revoking the parent revokes its child tokens (unless they were created as orphans). This bounds the lifetime of derived credentials.',
    references: [REF_TOKENS]
  },
  {
    domain: TOKENS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which field in a token lookup indicates how many more times the token may be used before it is automatically revoked?',
    options: opts4(
      'num_uses',
      'display_name',
      'entity_id',
      'orphan'
    ),
    correct: ['a'],
    explanation: 'num_uses (when set on creation) limits how many requests a token can make; once exhausted Vault revokes it. A value of 0 means unlimited uses (subject to TTL).',
    references: [REF_TOKENS]
  },
  {
    domain: TOKENS, difficulty: 3, type: QType.SINGLE,
    stem: 'Why might you create a use-limited token (num_uses) for a one-time bootstrap task?',
    options: opts4(
      'To make it last forever',
      'So it self-revokes after the expected number of operations, limiting exposure if leaked',
      'To bypass policies',
      'To convert it to a root token'
    ),
    correct: ['b'],
    explanation: 'A use-limited token automatically becomes invalid after the configured number of requests, ensuring a leaked bootstrap credential cannot be reused beyond its intended task.',
    references: [REF_TOKENS]
  },

  // ── Encryption as a Service (9) ──
  {
    domain: EAAS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What problem does the Transit engine primarily solve for application developers?',
    options: opts4(
      'Storing application records durably',
      'Performing cryptographic operations without the application managing key material',
      'Replacing the storage backend',
      'Authenticating users'
    ),
    correct: ['b'],
    explanation: 'Transit lets apps encrypt/decrypt/sign data while Vault centrally manages and protects the keys, so developers never handle raw key material or implement crypto themselves.',
    references: [REF_TRANSIT]
  },
  {
    domain: EAAS, difficulty: 3, type: QType.SINGLE,
    stem: 'An application stores Transit ciphertext in a database. The Transit key is rotated. Can the app still decrypt the old rows?',
    options: opts4(
      'No, rotation invalidates old ciphertext immediately',
      'Yes, because old key versions remain available for decryption until min_decryption_version is raised',
      'Only if it uses a batch token',
      'Only after re-initializing Vault'
    ),
    correct: ['b'],
    explanation: 'Rotation only adds a new version for new encryptions. Vault keeps prior versions for decryption, so existing ciphertext stays readable until min_decryption_version is increased or the data is rewrapped.',
    references: [REF_TRANSIT_REKEY]
  },
  {
    domain: EAAS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Transit endpoint verifies a previously generated signature against data?',
    options: opts4(
      'transit/verify/<key>',
      'transit/encrypt/<key>',
      'transit/datakey/<key>',
      'transit/rewrap/<key>'
    ),
    correct: ['a'],
    explanation: 'transit/verify/<key> checks whether a signature matches the provided input for the named key. transit/sign creates signatures; verify confirms them.',
    references: [REF_TRANSIT]
  },
  {
    domain: EAAS, difficulty: 3, type: QType.SINGLE,
    stem: 'A developer wants to encrypt large files locally for performance but keep key custody in Vault. Which Transit feature supports this envelope pattern?',
    options: opts4(
      'transit/encrypt for the whole file',
      'transit/datakey to obtain a data key (plaintext + wrapped) used to encrypt the file locally',
      'transit/hmac on the file',
      'Convergent encryption only'
    ),
    correct: ['b'],
    explanation: 'Envelope encryption: transit/datakey returns a one-time data key (plaintext for local use plus a Vault-wrapped copy to store). Bulk data is encrypted locally; only the small wrapped key needs Vault to decrypt later.',
    references: [REF_TRANSIT_DATAKEY]
  },
  {
    domain: EAAS, difficulty: 2, type: QType.SINGLE,
    stem: 'Transit key rotation can be scheduled/automated so keys are rotated periodically without re-encrypting all existing data immediately.',
    options: opts4('True', 'False', 'Only manual rotation exists', 'Only with batch tokens'),
    correct: ['a'],
    explanation: 'True. Transit supports automatic rotation (auto_rotate_period) and manual rotation; old data remains decryptable with prior versions, so no immediate bulk re-encryption is required.',
    references: [REF_TRANSIT_REKEY]
  },
  {
    domain: EAAS, difficulty: 3, type: QType.SINGLE,
    stem: 'Access to `transit/decrypt/payments` should be restricted to the billing service only. How is this enforced?',
    options: opts4(
      'By sealing Vault',
      'By writing an ACL policy that grants update on transit/decrypt/payments only to the billing role/token',
      'By making the key exportable',
      'By disabling audit logging'
    ),
    correct: ['b'],
    explanation: 'Transit operations are normal API paths governed by ACL policies. Granting the decrypt path only to the billing service\'s policy enforces least privilege for that key\'s use.',
    references: [REF_TRANSIT, REF_POLICIES]
  },
  {
    domain: EAAS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command creates a new named Transit encryption key called `orders`?',
    options: opts4(
      'vault write -f transit/keys/orders',
      'vault kv put transit/orders',
      'vault policy write orders',
      'vault token create -policy=orders'
    ),
    correct: ['a'],
    explanation: '`vault write -f transit/keys/orders` creates a new Transit key (default type aes256-gcm96). The -f flag allows the write with no additional data fields.',
    references: [REF_TRANSIT]
  },
  {
    domain: EAAS, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Transit key versions and min_decryption_version.',
    options: opts4(
      'Rotation creates a new latest version for encryption.',
      'Old versions can still decrypt prior ciphertext by default.',
      'Raising min_decryption_version blocks decryption with versions below it.',
      'Rotation deletes all previous versions automatically.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Rotation adds a new version; old versions remain usable for decryption until min_decryption_version is raised to retire them. Rotation does not auto-delete old versions, so option D is false.',
    references: [REF_TRANSIT_REKEY]
  },
  {
    domain: EAAS, difficulty: 2, type: QType.SINGLE,
    stem: 'What does the Transit engine return when you call transit/encrypt successfully?',
    options: opts4(
      'The plaintext echoed back',
      'A ciphertext string (prefixed like vault:v1:...) that decrypt can later reverse',
      'A new token',
      'An unseal key'
    ),
    correct: ['b'],
    explanation: 'transit/encrypt returns a ciphertext string with a version prefix (e.g., vault:v1:). Passing that exact string to transit/decrypt with the same key recovers the original plaintext.',
    references: [REF_TRANSIT]
  }
];

const VAULT_DOMAINS = [
  { name: ARCH, weight: 15 },
  { name: AUTH, weight: 20 },
  { name: SECRETS, weight: 20 },
  { name: POLICIES, weight: 15 },
  { name: TOKENS, weight: 15 },
  { name: EAAS, weight: 15 }
];

const VAULT_EXAMS: { slug: string; code: string; titleSuffix: string; descriptionSuffix: string; questions: Q[] }[] = [
  {
    slug: 'hashicorp-vault-associate-p1',
    code: 'VA-002-P1',
    titleSuffix: 'Practice Exam 1',
    descriptionSuffix: 'Practice exam 1 of 3 — full 60-minute, 65-question, blueprint-weighted set covering Vault architecture, authentication and authorization, secrets engines, Vault policies, tokens, and encryption as a service.',
    questions: P1
  },
  {
    slug: 'hashicorp-vault-associate-p2',
    code: 'VA-002-P2',
    titleSuffix: 'Practice Exam 2',
    descriptionSuffix: 'Practice exam 2 of 3 — a second 60-minute, 65-question, blueprint-weighted set.',
    questions: P2
  },
  {
    slug: 'hashicorp-vault-associate-p3',
    code: 'VA-002-P3',
    titleSuffix: 'Practice Exam 3',
    descriptionSuffix: 'Practice exam 3 of 3 — a third 60-minute, 65-question, blueprint-weighted set.',
    questions: P3
  }
];

const VAULT_BUNDLE = {
  slug: 'hashicorp-vault-associate',
  title: 'HashiCorp Certified: Vault Associate (002)',
  description: 'All 3 HashiCorp Certified: Vault Associate (002) practice exams in one bundle — 195 blueprint-weighted questions covering Vault architecture, authentication and authorization, secrets engines, Vault policies, tokens, and encryption as a service, aligned to the Vault Associate 002 exam objectives.',
  price: 2000, // USD 20 — PRACTICE tier
  priceVoucher: 7050 // USD 70.50 — VOUCHER tier
};

type SeedResult = {
  vendor: 'created' | 'updated';
  exams: { slug: string; questionCount: number; teaserCount: number }[];
  bundle: 'created' | 'updated';
};

/**
 * Idempotent seed for the Vault Associate bundle. Safe to call
 * repeatedly — vendor / exam / bundle rows are upserted, and questions
 * tagged `generatedBy: 'manual:vault-seed'` are deleted and re-created.
 *
 * Pass an existing PrismaClient (lifecycle managed by caller).
 */
export async function seedVault(db: PrismaClient): Promise<SeedResult> {
  const existingVendor = await db.vendor.findUnique({ where: { slug: 'hashicorp' } });
  await db.vendor.upsert({
    where: { slug: 'hashicorp' },
    update: { name: 'HashiCorp', description: 'HashiCorp certifications — Terraform, Vault, Consul, and infrastructure automation credentials.' },
    create: { slug: 'hashicorp', name: 'HashiCorp', description: 'HashiCorp certifications — Terraform, Vault, Consul, and infrastructure automation credentials.' }
  });
  const vendor = await db.vendor.findUniqueOrThrow({ where: { slug: 'hashicorp' } });

  const examResults: SeedResult['exams'] = [];
  const examIds: Record<string, string> = {};

  for (const e of VAULT_EXAMS) {
    const title = `HashiCorp Certified: Vault Associate (002) — ${e.titleSuffix}`;
    const description = `${e.descriptionSuffix} Aligned to the HashiCorp Vault Associate 002 exam objectives.`;
    const examData = {
      title,
      code: e.code,
      description,
      level: 'Associate',
      durationMinutes: 60,
      passingScore: 70,
      questionCount: e.questions.length,
      domains: VAULT_DOMAINS,
      published: true
    };
    const exam = await db.exam.upsert({
      where: { slug: e.slug },
      update: examData,
      create: { ...examData, slug: e.slug, vendorId: vendor.id }
    });
    examIds[e.slug] = exam.id;

    await db.question.deleteMany({ where: { examId: exam.id, generatedBy: 'manual:vault-seed' } });
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
          generatedBy: 'manual:vault-seed',
          isTeaser: !!q.isTeaser
        }
      });
      if (q.isTeaser) teaserCount++;
    }
    examResults.push({ slug: e.slug, questionCount: e.questions.length, teaserCount });
  }

  const existingBundle = await db.bundle.findUnique({ where: { slug: VAULT_BUNDLE.slug } });
  const bundle = await db.bundle.upsert({
    where: { slug: VAULT_BUNDLE.slug },
    update: {
      title: VAULT_BUNDLE.title,
      description: VAULT_BUNDLE.description,
      price: VAULT_BUNDLE.price,
      priceVoucher: VAULT_BUNDLE.priceVoucher,
      published: true
    },
    create: {
      slug: VAULT_BUNDLE.slug,
      title: VAULT_BUNDLE.title,
      description: VAULT_BUNDLE.description,
      price: VAULT_BUNDLE.price,
      priceVoucher: VAULT_BUNDLE.priceVoucher,
      published: true
    }
  });

  // Replace bundle items deterministically: drop existing, recreate.
  await db.bundleItem.deleteMany({ where: { bundleId: bundle.id } });
  const items = [
    { examSlug: 'hashicorp-vault-associate-p1', tier: 'PRACTICE' as const, position: 1 },
    { examSlug: 'hashicorp-vault-associate-p2', tier: 'PRACTICE' as const, position: 2 },
    { examSlug: 'hashicorp-vault-associate-p3', tier: 'PRACTICE' as const, position: 3 },
    { examSlug: 'hashicorp-vault-associate-p1', tier: 'VOUCHER' as const, position: 4 }
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
