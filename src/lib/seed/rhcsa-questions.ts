/**
 * RHCSA bundle seed — vendor, three practice-exam variants, bundle,
 * and 195 blueprint-aligned questions. Idempotent: replaces rows
 * tagged `generatedBy: 'manual:rhcsa-seed'` and upserts catalog rows.
 *
 * Exported as `seedRhcsa(db)` so the same code path is reachable from
 * the standalone CLI shim (`prisma/seeds/rhcsa.ts`) and the protected
 * admin API (`/api/admin/seed-rhcsa`) — letting us bootstrap the
 * production database without redeploying.
 *
 * Question content is authored against the public Red Hat Enterprise
 * Linux 9 documentation and the official Red Hat EX200 exam objectives:
 *   - Understand and Use Essential Tools          — 15% (3)
 *   - Operate Running Systems                     — 15% (3)
 *   - Configure Local Storage                     — 15% (3)
 *   - Create and Configure File Systems           — 15% (3)
 *   - Deploy, Configure, and Maintain Systems     — 20% (4)
 *   - Manage Users and Groups                     — 10% (2)
 *   - Manage Security                             — 10% (2)
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

const TOOLS = 'Understand and Use Essential Tools';
const OPERATE = 'Operate Running Systems';
const STORAGE = 'Configure Local Storage';
const FILESYS = 'Create and Configure File Systems';
const DEPLOY = 'Deploy, Configure, and Maintain Systems';
const USERS = 'Manage Users and Groups';
const SECURITY = 'Manage Security';

const REF_SHELL = { label: 'RHEL 9 — Configuring basic system settings', url: 'https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/configuring_basic_system_settings/index' };
const REF_SYSTEMD = { label: 'RHEL 9 — Managing systemd services', url: 'https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/configuring_basic_system_settings/managing-systemd_configuring-basic-system-settings' };
const REF_BOOT = { label: 'RHEL 9 — Managing the boot process / rescue & emergency targets', url: 'https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/managing_monitoring_and_updating_the_kernel/index' };
const REF_LVM = { label: 'RHEL 9 — Configuring and managing logical volumes', url: 'https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/configuring_and_managing_logical_volumes/index' };
const REF_STORAGE = { label: 'RHEL 9 — Managing storage devices', url: 'https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/managing_storage_devices/index' };
const REF_FS = { label: 'RHEL 9 — Managing file systems', url: 'https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/managing_file_systems/index' };
const REF_NFS = { label: 'RHEL 9 — Deploying and using NFS / autofs', url: 'https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/managing_file_systems/mounting-nfs-shares_managing-file-systems' };
const REF_USERS = { label: 'RHEL 9 — Configuring basic system settings: managing users & groups', url: 'https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/configuring_basic_system_settings/managing-users-and-groups_configuring-basic-system-settings' };
const REF_SELINUX = { label: 'RHEL 9 — Using SELinux', url: 'https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/using_selinux/index' };
const REF_FW = { label: 'RHEL 9 — Securing networks: using and configuring firewalld', url: 'https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/securing_networks/using-and-configuring-firewalld_securing-networks' };
const REF_NET = { label: 'RHEL 9 — Configuring and managing networking', url: 'https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/configuring_and_managing_networking/index' };
const REF_DNF = { label: 'RHEL 9 — Managing software with the DNF tool', url: 'https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/managing_software_with_the_dnf_tool/index' };
const REF_CHRONY = { label: 'RHEL 9 — Configuring basic system settings: chrony time sync', url: 'https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/configuring_basic_system_settings/using-chrony-to-configure-ntp_configuring-basic-system-settings' };
const REF_PODMAN = { label: 'RHEL 9 — Building, running, and managing containers', url: 'https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/building_running_and_managing_containers/index' };
const REF_TUNED = { label: 'RHEL 9 — Monitoring and managing system status & performance (tuned)', url: 'https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/monitoring_and_managing_system_status_and_performance/index' };

// Helper to build 4-option SINGLE questions with id 'a','b','c','d'.
const opts4 = (a: string, b: string, c: string, d: string): Opt[] => [
  { id: 'a', text: a }, { id: 'b', text: b }, { id: 'c', text: c }, { id: 'd', text: d }
];

// Helper for genuine TRUE_FALSE questions. Five RHCSA records were
// originally authored as binary True/False but used `opts4('True',
// 'False', '', '')` — which would render two empty buttons at runtime.
// Switching them to `tf()` keeps them as proper TRUE_FALSE questions.
const tf = (): Opt[] => [{ id: 'a', text: 'True' }, { id: 'b', text: 'False' }];

// ───────────────────── Practice Exam 1 ─────────────────────
const P1: Q[] = [
  // ── Understand and Use Essential Tools (3) ──
  {
    domain: TOOLS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You want to send the standard output of `ls -l /etc` to a file `out.txt` while DISCARDING any error messages. Which command does this?',
    options: opts4(
      'ls -l /etc > out.txt 2>/dev/null',
      'ls -l /etc 2> out.txt > /dev/null',
      'ls -l /etc | out.txt',
      'ls -l /etc &> /dev/null > out.txt'
    ),
    correct: ['a'],
    explanation: '`> out.txt` redirects stdout (fd 1) to the file; `2>/dev/null` discards stderr (fd 2). Option B swaps the two streams; `|` pipes to a command, not a file; option D sends everything to /dev/null first so out.txt stays empty.',
    references: [REF_SHELL]
  },
  {
    domain: TOOLS, difficulty: 3, type: QType.SINGLE,
    stem: 'Which `grep` command prints every line in `/var/log/messages` that does NOT contain the string "error", case-insensitively?',
    options: opts4(
      'grep -v -i error /var/log/messages',
      'grep -i -n error /var/log/messages',
      'grep -e error /var/log/messages',
      'grep -c error /var/log/messages'
    ),
    correct: ['a'],
    explanation: '`-v` inverts the match (lines NOT matching) and `-i` ignores case. `-n` adds line numbers, `-e` specifies a pattern, and `-c` only prints a count — none of those invert the match.',
    references: [REF_SHELL]
  },
  {
    domain: TOOLS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Logged in as user `student`, you copy a file to a remote host with `scp report.txt server:/tmp/`. What does this command rely on for authentication by default?',
    options: opts4(
      'An anonymous FTP session',
      'SSH — password or public-key authentication for user `student` on `server`',
      'Kerberos tickets only',
      'NFS share permissions'
    ),
    correct: ['b'],
    explanation: '`scp` transfers files over SSH, so it authenticates exactly like `ssh` — using a password or a configured key pair for the (implied) user. It does not use FTP or NFS, and Kerberos is not required.',
    references: [REF_SHELL]
  },

  // ── Operate Running Systems (3) ──
  {
    domain: OPERATE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command immediately stops the `httpd` service and prevents it from starting at the next boot?',
    options: opts4(
      'systemctl disable httpd; systemctl stop httpd',
      'systemctl stop httpd && systemctl disable httpd',
      'systemctl mask httpd only',
      'systemctl reload httpd'
    ),
    correct: ['b'],
    explanation: '`systemctl stop` halts the running service now; `systemctl disable` removes its boot-time enablement. Order does not change correctness, but both actions are required. `mask` is stronger (blocks even manual start) and `reload` only re-reads config.',
    references: [REF_SYSTEMD]
  },
  {
    domain: OPERATE, difficulty: 3, type: QType.SINGLE,
    stem: 'Which command sets the default boot target to the multi-user (text, non-graphical) target?',
    options: opts4(
      'systemctl isolate multi-user.target',
      'systemctl set-default multi-user.target',
      'systemctl enable multi-user.target',
      'systemctl default multi-user'
    ),
    correct: ['b'],
    explanation: '`systemctl set-default` updates the `default.target` symlink used at every boot. `isolate` switches the current session only (not persistent), and `enable` does not control the default target.',
    references: [REF_SYSTEMD]
  },
  {
    domain: OPERATE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about inspecting logs with `journalctl` on RHEL 9.',
    options: opts4(
      '`journalctl -u sshd` shows log entries for the sshd unit.',
      '`journalctl -b` shows messages from the current boot.',
      '`journalctl` data is persistent across reboots by default with no extra configuration.',
      '`journalctl -p err` filters to entries of priority error and worse.'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Per-unit (`-u`), current-boot (`-b`), and priority (`-p`) filters are all valid. By default RHEL 9 stores the journal in volatile `/run/log/journal`; persistence requires `Storage=persistent` or creating `/var/log/journal`, so option C is false.',
    references: [REF_SYSTEMD]
  },

  // ── Configure Local Storage (3) ──
  {
    domain: STORAGE, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'You added a new disk `/dev/vdb` and need a single GPT partition spanning the whole disk. Which non-interactive tool/command creates a GPT label and one partition?',
    options: opts4(
      'parted -s /dev/vdb mklabel gpt mkpart primary 1MiB 100%',
      'mkfs.gpt /dev/vdb',
      'fdisk --gpt /dev/vdb --all',
      'lvcreate -L 100% /dev/vdb'
    ),
    correct: ['a'],
    explanation: '`parted -s` runs scripted (non-interactive); `mklabel gpt` writes a GPT table and `mkpart` defines the partition. `mkfs.gpt` is not a command, the `fdisk` syntax shown is invalid, and `lvcreate` operates on an LVM volume group, not a raw disk.',
    references: [REF_STORAGE]
  },
  {
    domain: STORAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'A volume group `vgdata` has free extents. Which sequence extends logical volume `/dev/vgdata/lvweb` by 1 GiB AND grows its XFS file system online?',
    options: opts4(
      'lvextend -L +1G /dev/vgdata/lvweb && xfs_growfs /dev/vgdata/lvweb',
      'lvresize -1G /dev/vgdata/lvweb && resize2fs /dev/vgdata/lvweb',
      'vgextend +1G lvweb && xfs_repair /dev/vgdata/lvweb',
      'lvcreate -L 1G lvweb && mkfs.xfs /dev/vgdata/lvweb'
    ),
    correct: ['a'],
    explanation: '`lvextend -L +1G` adds 1 GiB to the LV, then `xfs_growfs` grows the mounted XFS file system (XFS uses `xfs_growfs`, not `resize2fs`). `vgextend` adds PVs to a VG, and `lvcreate`/`mkfs.xfs` would destroy existing data.',
    references: [REF_LVM]
  },
  {
    domain: STORAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You created a 2 GiB swap partition `/dev/vdb2`. Which two commands initialize and activate it?',
    options: opts4(
      'mkswap /dev/vdb2 ; swapon /dev/vdb2',
      'mkfs.swap /dev/vdb2 ; mount /dev/vdb2',
      'swapcreate /dev/vdb2 ; swapon -a',
      'mkswap /dev/vdb2 ; swapctl --enable /dev/vdb2'
    ),
    correct: ['a'],
    explanation: '`mkswap` writes a swap signature and `swapon` activates the area. `mkfs.swap` and `swapcreate`/`swapctl` are not RHEL commands, and swap is not mounted with `mount`. Add an `/etc/fstab` entry for persistence.',
    references: [REF_STORAGE]
  },

  // ── Create and Configure File Systems (3) ──
  {
    domain: FILESYS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command formats `/dev/vgdata/lvbackup` with an XFS file system?',
    options: opts4(
      'mkfs.xfs /dev/vgdata/lvbackup',
      'mkfs -t ext4 /dev/vgdata/lvbackup',
      'xfs_admin -f /dev/vgdata/lvbackup',
      'mkxfs /dev/vgdata/lvbackup'
    ),
    correct: ['a'],
    explanation: '`mkfs.xfs` creates an XFS file system on the device. `mkfs -t ext4` makes ext4 (not XFS), `xfs_admin` changes parameters of an existing XFS, and `mkxfs` is not a command.',
    references: [REF_FS]
  },
  {
    domain: FILESYS, difficulty: 3, type: QType.SINGLE,
    stem: 'To make `/dev/vgdata/lvbackup` mount automatically at `/backup` on boot, the MOST robust `/etc/fstab` identifier is:',
    options: opts4(
      'The kernel device name like /dev/sdb1',
      'A UUID (obtained with `blkid` or `lsblk -f`)',
      'The inode number of the mount point',
      'The PID of the mount process'
    ),
    correct: ['b'],
    explanation: 'A UUID is stable across reboots and disk re-enumeration, unlike kernel names such as /dev/sdb1 which can change. Inode numbers and PIDs are not file-system identifiers in fstab.',
    references: [REF_FS]
  },
  {
    domain: FILESYS, difficulty: 3, type: QType.SINGLE,
    stem: 'You want directory `/srv/data/shared` to allow read, write, and execute for user `bob` IN ADDITION to its normal permissions, without changing the owning group. Which command sets that ACL?',
    options: opts4(
      'setfacl -m u:bob:rwx /srv/data/shared',
      'chmod u+rwx,bob /srv/data/shared',
      'chown bob /srv/data/shared',
      'getfacl -m u:bob:rwx /srv/data/shared'
    ),
    correct: ['a'],
    explanation: '`setfacl -m u:bob:rwx` adds a named-user ACL entry granting bob rwx without altering ownership or the base group. `chmod` cannot name an arbitrary user, `chown` changes ownership, and `getfacl` only displays ACLs.',
    references: [REF_FS]
  },

  // ── Deploy, Configure, and Maintain Systems (4) ──
  {
    domain: DEPLOY, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which `dnf` command installs the `httpd` package and its dependencies non-interactively?',
    options: opts4(
      'dnf -y install httpd',
      'dnf get httpd',
      'rpm -i httpd',
      'dnf search httpd --install'
    ),
    correct: ['a'],
    explanation: '`dnf -y install httpd` resolves and installs dependencies, auto-confirming with `-y`. `dnf get` is not a subcommand, `rpm -i` does not resolve dependencies, and `dnf search` only searches metadata.',
    references: [REF_DNF]
  },
  {
    domain: DEPLOY, difficulty: 3, type: QType.SINGLE,
    stem: 'Which command configures the system to keep its clock synchronized using the chrony service and enables it persistently?',
    options: opts4(
      'systemctl enable --now chronyd',
      'systemctl enable --now ntpd',
      'timedatectl set-ntp false',
      'chrony --sync now'
    ),
    correct: ['a'],
    explanation: 'RHEL 9 uses `chronyd` for NTP; `systemctl enable --now chronyd` both starts it and enables it at boot. `ntpd` is not the RHEL 9 default, disabling NTP is the opposite goal, and `chrony --sync` is not valid syntax.',
    references: [REF_CHRONY]
  },
  {
    domain: DEPLOY, difficulty: 3, type: QType.SINGLE,
    stem: 'You need to schedule a one-time job to run `/usr/local/bin/report.sh` at 23:30 today. Which tool is designed for one-off scheduled jobs?',
    options: opts4(
      'at 23:30 (then enter the command)',
      'crontab -e adding `30 23 * * *`',
      'systemctl start report.sh',
      'nohup /usr/local/bin/report.sh'
    ),
    correct: ['a'],
    explanation: '`at` schedules a command to run once at a specified time (requires the `atd` service). A cron entry would run repeatedly every day, `systemctl start` does not schedule, and `nohup` only detaches a process from the terminal.',
    references: [REF_SHELL]
  },
  {
    domain: DEPLOY, difficulty: 3, type: QType.SINGLE,
    stem: 'A rootless container is running with `podman run -d --name web nginx`. Which command creates a systemd user unit so it starts at user login (lingering enabled)?',
    options: opts4(
      'podman generate systemd --name web --files; then enable the generated user unit with `systemctl --user enable container-web`',
      'systemctl enable podman-web at the system level',
      'podman service install web',
      'crontab -e adding @reboot podman start web'
    ),
    correct: ['a'],
    explanation: '`podman generate systemd --files` produces a unit that `systemctl --user enable` manages for rootless, login-scoped startup (with `loginctl enable-linger` for boot-time). There is no `podman service install`, and a root-level service or @reboot cron is not the rootless-managed approach RHCSA expects.',
    references: [REF_PODMAN]
  },

  // ── Manage Users and Groups (2) ──
  {
    domain: USERS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command creates user `alice` with a home directory and her primary login shell set to `/bin/bash`?',
    options: opts4(
      'useradd -m -s /bin/bash alice',
      'usermod -a alice',
      'adduser alice --no-home',
      'passwd -add alice'
    ),
    correct: ['a'],
    explanation: '`useradd -m` creates the home directory and `-s /bin/bash` sets the login shell. `usermod` modifies an existing account, `--no-home` is the opposite, and `passwd` only manages passwords.',
    references: [REF_USERS]
  },
  {
    domain: USERS, difficulty: 3, type: QType.SINGLE,
    stem: 'You must force user `bob` to change his password at next login and expire the account if unused for 90 inactive days. Which command sets the password-expiry policy?',
    options: opts4(
      'chage -d 0 -I 90 bob',
      'passwd -e -n 90 bob',
      'usermod -L bob',
      'chage -E 0 bob'
    ),
    correct: ['a'],
    explanation: '`chage -d 0` forces a password change at next login (last-change date set to epoch) and `-I 90` sets the inactivity period. `usermod -L` only locks the account, and `chage -E 0` would set an absolute expiry date, not an inactivity window.',
    references: [REF_USERS]
  },

  // ── Manage Security (2) ──
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'Which `firewall-cmd` command permanently allows the `http` service in the default zone and applies the change immediately?',
    options: opts4(
      'firewall-cmd --permanent --add-service=http ; firewall-cmd --reload',
      'firewall-cmd --add-service=http (only)',
      'firewall-cmd --enable http',
      'systemctl restart http'
    ),
    correct: ['a'],
    explanation: '`--permanent --add-service=http` writes the rule to the permanent configuration; `--reload` activates it in the running firewall. Without `--permanent` the rule is lost on reload, `--enable` is not a firewalld option, and `http` is not a systemd service.',
    references: [REF_FW]
  },
  {
    domain: SECURITY, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'After moving content into `/var/www/html` with `mv`, Apache returns 403 errors. SELinux is enforcing. Which command restores the correct SELinux context on the web root?',
    options: opts4(
      'restorecon -Rv /var/www/html',
      'setenforce 0',
      'chmod -R 777 /var/www/html',
      'semanage login -a /var/www/html'
    ),
    correct: ['a'],
    explanation: 'Files moved with `mv` keep their original SELinux context; `restorecon -Rv` resets them to the policy default (`httpd_sys_content_t`). Disabling enforcement or chmod 777 are insecure workarounds, and `semanage login` manages user-to-SELinux-user mappings, not file contexts.',
    references: [REF_SELINUX]
  },

  // ── Understand and Use Essential Tools (+7 → 10) ──
  {
    domain: TOOLS, difficulty: 1, type: QType.TRUE_FALSE,
    stem: 'Running `cd` with no arguments changes the working directory to the current user\'s home directory.',
    options: tf(),
    correct: ['a'],
    explanation: '`cd` with no argument (equivalently `cd ~`) returns you to `$HOME`. The shell treats the bare `cd` as a request to go to the home directory, so the statement is true.',
    references: [REF_SHELL]
  },
  {
    domain: TOOLS, difficulty: 3, type: QType.SINGLE,
    stem: 'You want to find every file under `/etc` larger than 1 MB. Which `find` command is correct?',
    options: opts4(
      'find /etc -type f -size +1M',
      'find /etc -size 1MB -file',
      'find /etc --larger 1M',
      'find /etc -type f -bigger +1M'
    ),
    correct: ['a'],
    explanation: '`find /etc -type f -size +1M` matches regular files whose size exceeds 1 MiB (the `+` means "greater than"). The other options use options/syntax (`-larger`, `-bigger`, `1MB -file`) that `find` does not support.',
    references: [REF_SHELL]
  },
  {
    domain: TOOLS, difficulty: 3, type: QType.MULTI, isTeaser: true,
    stem: 'Select ALL commands that display the contents of a text file to standard output.',
    options: opts4(
      'cat /etc/hosts',
      'less /etc/hosts',
      'head -n 5 /etc/hosts',
      'chmod /etc/hosts'
    ),
    correct: ['a', 'b', 'c'],
    explanation: '`cat` dumps the whole file, `less` is a pager that displays it, and `head -n 5` shows the first 5 lines. `chmod` changes permission bits and does not display file contents, so it is not a viewing tool.',
    references: [REF_SHELL]
  },
  {
    domain: TOOLS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command creates an empty file named `notes.txt` (or updates its timestamp if it already exists)?',
    options: opts4(
      'touch notes.txt',
      'mkdir notes.txt',
      'cat > notes.txt < /dev/null only on existing files',
      'rm -i notes.txt'
    ),
    correct: ['a'],
    explanation: '`touch notes.txt` creates the file if absent and otherwise updates its access/modification times. `mkdir` makes a directory, and `rm` deletes; the redirection option is malformed and not the standard idiom.',
    references: [REF_SHELL]
  },
  {
    domain: TOOLS, difficulty: 3, type: QType.SINGLE,
    stem: 'Which command counts the number of lines in `/etc/passwd`?',
    options: opts4(
      'wc -l /etc/passwd',
      'wc -c /etc/passwd',
      'grep -c "" /etc/passwd | sort',
      'cat -n /etc/passwd | wc -w'
    ),
    correct: ['a'],
    explanation: '`wc -l` prints the line count. `wc -c` counts bytes, and the other options either word-count or add unnecessary stages that do not give a clean line total.',
    references: [REF_SHELL]
  },
  {
    domain: TOOLS, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'You need to recursively copy directory `/data` to `/backup/data` preserving permissions, ownership, and timestamps. Which command is best?',
    options: opts4(
      'cp -a /data /backup/data',
      'cp /data /backup/data',
      'mv -r /data /backup/data',
      'cp -i /data /backup/data'
    ),
    correct: ['a'],
    explanation: '`cp -a` (archive) is recursive and preserves mode, ownership, timestamps, and symlinks. Plain `cp` fails on directories without `-r`, `mv` relocates rather than copies, and `cp -i` only prompts before overwrite.',
    references: [REF_SHELL]
  },
  {
    domain: TOOLS, difficulty: 4, type: QType.SINGLE,
    stem: 'Which extended regular expression with `grep -E` matches lines in a file that contain ONLY digits from start to end?',
    options: opts4(
      "grep -E '^[0-9]+$' file",
      "grep -E '[0-9]' file",
      "grep -E '^[0-9]*' file",
      "grep -E 'digits' file"
    ),
    correct: ['a'],
    explanation: 'The anchors `^` and `$` bind the pattern to the whole line, and `[0-9]+` requires one-or-more digits with nothing else. Without anchors any line containing a digit matches; `[0-9]*` also matches empty/non-digit lines because `*` allows zero occurrences.',
    references: [REF_SHELL]
  },

  // ── Operate Running Systems (+7 → 10) ──
  {
    domain: OPERATE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command lists all unit files and shows whether each is enabled, disabled, or static?',
    options: opts4(
      'systemctl list-unit-files',
      'systemctl list-units --failed',
      'systemctl status',
      'systemctl show --all'
    ),
    correct: ['a'],
    explanation: '`systemctl list-unit-files` enumerates installed unit files with their enablement state (enabled/disabled/static/masked). `list-units --failed` shows only failed runtime units, `status` shows a tree, and `show --all` dumps properties.',
    references: [REF_SYSTEMD]
  },
  {
    domain: OPERATE, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command shows only the most recent 50 lines of the journal and then keeps following new entries in real time?',
    options: opts4(
      'journalctl -n 50 -f',
      'journalctl --since 50',
      'journalctl -r -n 50 --stop',
      'tail -f journalctl'
    ),
    correct: ['a'],
    explanation: '`-n 50` limits to the last 50 lines and `-f` follows the journal as new entries arrive. `--since` expects a time, `-r` reverses order (and `--stop` is invalid), and `tail -f journalctl` treats a command name as a file.',
    references: [REF_SYSTEMD]
  },
  {
    domain: OPERATE, difficulty: 3, type: QType.SINGLE,
    stem: 'A service failed to start. Which command shows its recent status, including the last log lines and the failed result?',
    options: opts4(
      'systemctl status httpd',
      'systemctl is-active httpd',
      'systemctl cat httpd',
      'systemctl daemon-reload'
    ),
    correct: ['a'],
    explanation: '`systemctl status <unit>` displays the active state, main PID, and the most recent journal lines, which is the first diagnostic step. `is-active` prints just a word, `cat` shows the unit file, and `daemon-reload` re-reads unit definitions.',
    references: [REF_SYSTEMD]
  },
  {
    domain: OPERATE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command immediately reboots the system?',
    options: opts4(
      'systemctl reboot',
      'systemctl isolate reboot.target',
      'systemctl restart system',
      'shutdown --reboot now -k'
    ),
    correct: ['a'],
    explanation: '`systemctl reboot` (equivalent to `reboot`) restarts the machine. There is no `reboot.target` to isolate, `restart system` is not a unit, and `shutdown ... -k` only sends a wall message without actually halting.',
    references: [REF_SYSTEMD]
  },
  {
    domain: OPERATE, difficulty: 3, type: QType.SINGLE,
    stem: 'Which command starts the `firewalld` service now AND ensures it starts at every boot in a single invocation?',
    options: opts4(
      'systemctl enable --now firewalld',
      'systemctl start firewalld --persistent',
      'systemctl enable firewalld --boot-now',
      'systemctl reload firewalld'
    ),
    correct: ['a'],
    explanation: '`systemctl enable --now firewalld` combines `enable` (boot persistence) and `start` (immediate activation). The `--persistent` / `--boot-now` flags do not exist, and `reload` only re-reads configuration.',
    references: [REF_SYSTEMD]
  },
  {
    domain: OPERATE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about the `at` command for one-time scheduled jobs on RHEL 9.',
    options: opts4(
      'The `atd` service must be running for `at` jobs to execute.',
      '`atq` lists the current user\'s pending `at` jobs.',
      '`atrm <jobnumber>` removes a pending `at` job.',
      '`at` jobs automatically repeat every day.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'The `atd` daemon runs queued jobs, `atq` lists them, and `atrm` deletes one by job number. `at` is for ONE-TIME execution — recurring jobs are the domain of cron — so option D is false.',
    references: [REF_SHELL]
  },
  {
    domain: OPERATE, difficulty: 4, type: QType.SINGLE,
    stem: 'You want a normal user `student` to run `/usr/local/bin/cleanup.sh` every day at 02:15. Which crontab entry (in `crontab -e` as that user) is correct?',
    options: opts4(
      '15 2 * * * /usr/local/bin/cleanup.sh',
      '2 15 * * * /usr/local/bin/cleanup.sh',
      '* * 15 2 * /usr/local/bin/cleanup.sh',
      '@daily 02:15 /usr/local/bin/cleanup.sh'
    ),
    correct: ['a'],
    explanation: 'The cron fields are minute hour day-of-month month day-of-week, so 02:15 daily is `15 2 * * *`. Option B reverses minute/hour, option C misplaces the values, and `@daily` does not accept a time argument.',
    references: [REF_SHELL]
  },

  // ── Configure Local Storage (+7 → 10) ──
  {
    domain: STORAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command displays the amount of used and free space on all mounted file systems in human-readable units?',
    options: opts4(
      'df -h',
      'du -h',
      'lsblk -m',
      'free -h'
    ),
    correct: ['a'],
    explanation: '`df -h` reports per-file-system disk usage in human-readable sizes. `du -h` measures directory sizes, `lsblk -m` shows device permissions, and `free -h` reports memory, not disk.',
    references: [REF_STORAGE]
  },
  {
    domain: STORAGE, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'After creating a new partition with `parted`, the kernel still does not see it. Which command forces the kernel to re-read the partition table without rebooting?',
    options: opts4(
      'partprobe /dev/vdb',
      'udevadm reload',
      'systemctl restart disk',
      'blkid --rescan'
    ),
    correct: ['a'],
    explanation: '`partprobe <device>` asks the kernel to re-read the partition table so new partitions appear (`partx`/`kpartx` are alternatives). `udevadm reload`, a non-existent `disk` service, and `blkid --rescan` do not perform this.',
    references: [REF_STORAGE]
  },
  {
    domain: STORAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'Which command shows the size, free space, and number of physical volumes in volume group `vgdata`?',
    options: opts4(
      'vgdisplay vgdata',
      'pvcreate vgdata',
      'lvscan vgdata',
      'vgchange -a n vgdata'
    ),
    correct: ['a'],
    explanation: '`vgdisplay vgdata` prints VG attributes including total/free PE and PV count (`vgs` gives a terse view). `pvcreate` initializes a PV, `lvscan` lists LVs, and `vgchange -a n` deactivates the VG.',
    references: [REF_LVM]
  },
  {
    domain: STORAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'You must reduce logical volume `/dev/vg01/lvtmp` that holds an EXT4 file system. What is the correct safe order?',
    options: opts4(
      'Unmount, run `e2fsck -f`, shrink the filesystem with `resize2fs`, then `lvreduce` to the same size',
      '`lvreduce` first, then `resize2fs` to grow it back',
      '`xfs_growfs` then `lvreduce`',
      'Just run `lvreduce -L -1G` while mounted'
    ),
    correct: ['a'],
    explanation: 'For ext4 you must shrink the FILE SYSTEM before the LV: unmount, force-check with `e2fsck -f`, `resize2fs` smaller, then `lvreduce`. Reducing the LV first destroys data, `xfs_growfs` is for XFS (which cannot shrink), and shrinking while mounted is unsafe.',
    references: [REF_LVM]
  },
  {
    domain: STORAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command shows currently active swap areas and their sizes?',
    options: opts4(
      'swapon --show',
      'swapctl -l',
      'free --swap-only',
      'cat /etc/swap'
    ),
    correct: ['a'],
    explanation: '`swapon --show` (or `cat /proc/swaps`) lists active swap devices/files and their sizes. `swapctl` is not a RHEL command, `free` has no `--swap-only`, and `/etc/swap` does not exist (swap is declared in `/etc/fstab`).',
    references: [REF_STORAGE]
  },
  {
    domain: STORAGE, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL true statements about LVM logical volumes on RHEL 9.',
    options: opts4(
      'A logical volume can be extended online while mounted if the file system supports online grow.',
      'Physical volumes must be created before they can be added to a volume group.',
      'A volume group can contain physical volumes from multiple disks.',
      'Reducing an XFS file system in place is fully supported.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'LVs can grow online (with `xfs_growfs`/`resize2fs`), PVs must be `pvcreate`d before `vgextend`, and a VG can span multiple disks\' PVs. XFS does NOT support shrinking, so option D is false.',
    references: [REF_LVM]
  },
  {
    domain: STORAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'Which command lists existing Stratis pools and their total/used size?',
    options: opts4(
      'stratis pool list',
      'stratis show pools',
      'lsblk --stratis',
      'stratisctl pools'
    ),
    correct: ['a'],
    explanation: '`stratis pool list` displays each pool with its size and usage. `stratis show pools`, `lsblk --stratis`, and `stratisctl` are not valid Stratis command forms.',
    references: [REF_STORAGE]
  },

  // ── Create and Configure File Systems (+7 → 10) ──
  {
    domain: FILESYS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command creates an ext4 file system on the partition `/dev/vdb1`?',
    options: opts4(
      'mkfs.ext4 /dev/vdb1',
      'mke4fs /dev/vdb1',
      'mkfs --ext4 only',
      'tune2fs -ext4 /dev/vdb1'
    ),
    correct: ['a'],
    explanation: '`mkfs.ext4 /dev/vdb1` formats the partition as ext4 (equivalently `mkfs -t ext4`). `mke4fs` is not a command, the `mkfs --ext4 only` form is incomplete, and `tune2fs` adjusts an existing ext file system.',
    references: [REF_FS]
  },
  {
    domain: FILESYS, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'You added an `/etc/fstab` line and want to verify it parses correctly WITHOUT actually rebooting. Besides `mount -a`, which command validates that systemd can generate mount units from fstab?',
    options: opts4(
      'systemctl daemon-reload',
      'systemctl restart fstab',
      'mount --fake --all-verbose only',
      'fsck -A'
    ),
    correct: ['a'],
    explanation: 'After editing `/etc/fstab`, `systemctl daemon-reload` regenerates the systemd mount units so the new entry is recognized; combined with `mount -a` it confirms validity. There is no `fstab` service, and `fsck -A` checks file systems rather than fstab syntax.',
    references: [REF_FS]
  },
  {
    domain: FILESYS, difficulty: 3, type: QType.SINGLE,
    stem: 'Which command labels an XFS file system on `/dev/vdb1` with the label `DATA`?',
    options: opts4(
      'xfs_admin -L DATA /dev/vdb1',
      'e2label /dev/vdb1 DATA',
      'mkfs.xfs -L DATA /dev/vdb1 (on an existing populated FS)',
      'tune2fs -L DATA /dev/vdb1'
    ),
    correct: ['a'],
    explanation: '`xfs_admin -L DATA` sets the label on an existing XFS file system. `e2label`/`tune2fs -L` work on ext2/3/4, and re-running `mkfs.xfs` on a populated file system would destroy its data.',
    references: [REF_FS]
  },
  {
    domain: FILESYS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command displays the UUID of every block device so you can reference it in `/etc/fstab`?',
    options: opts4(
      'blkid',
      'lsof -u',
      'uuidgen --all',
      'cat /proc/uuid'
    ),
    correct: ['a'],
    explanation: '`blkid` lists devices with their UUID, LABEL, and TYPE (`lsblk -f` is an alternative). `lsof` lists open files, `uuidgen` generates a NEW random UUID, and `/proc/uuid` does not exist.',
    references: [REF_FS]
  },
  {
    domain: FILESYS, difficulty: 3, type: QType.SINGLE,
    stem: 'Which command shows the ACLs currently set on the directory `/srv/share`?',
    options: opts4(
      'getfacl /srv/share',
      'setfacl -x /srv/share',
      'ls -Z /srv/share',
      'lsattr /srv/share'
    ),
    correct: ['a'],
    explanation: '`getfacl` prints the access and default ACL entries. `setfacl -x` REMOVES an ACL entry, `ls -Z` shows SELinux contexts, and `lsattr` shows ext file attributes (immutable, etc.), not ACLs.',
    references: [REF_FS]
  },
  {
    domain: FILESYS, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'An NFS client needs `/exports/home` from `nfssrv` mounted at `/home` automatically at boot. Which `/etc/fstab` line is correct?',
    options: opts4(
      'nfssrv:/exports/home  /home  nfs  defaults,_netdev  0 0',
      '/exports/home  nfssrv:/home  nfs  defaults  0 0',
      'nfssrv:/exports/home  /home  xfs  auto  0 0',
      'nfssrv  /home  nfs4  loop  0 0'
    ),
    correct: ['a'],
    explanation: 'The fstab format is `server:/export  mountpoint  nfs  options  0 0`; `_netdev` defers the mount until networking is up. Option B swaps source/target, C uses the wrong fs type, and D omits the export path and misuses `loop`.',
    references: [REF_NFS]
  },
  {
    domain: FILESYS, difficulty: 4, type: QType.SINGLE,
    stem: 'You need users to access `nfssrv:/data` on demand under `/misc/data` using autofs. Which configuration is correct?',
    options: opts4(
      'In /etc/auto.master add `/misc /etc/auto.misc`, and in /etc/auto.misc add `data -rw nfssrv:/data`',
      'Add only an `/etc/fstab` line for /misc/data',
      'In /etc/auto.master add `nfssrv:/data /misc/data`',
      'Run `automount /misc/data nfssrv:/data` which persists by itself'
    ),
    correct: ['a'],
    explanation: 'autofs uses a master map pointing a mount point base (`/misc`) at a map file (`/etc/auto.misc`), whose entries (`data -rw nfssrv:/data`) define on-demand mounts. The other options confuse autofs with fstab or use invalid syntax.',
    references: [REF_NFS]
  },

  // ── Deploy, Configure, and Maintain Systems (+9 → 13) ──
  {
    domain: DEPLOY, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command removes the `telnet` package and any now-unneeded dependencies?',
    options: opts4(
      'dnf remove telnet',
      'dnf erase --keep-deps telnet',
      'rpm -e --force telnet',
      'dnf clean telnet'
    ),
    correct: ['a'],
    explanation: '`dnf remove telnet` uninstalls the package and removes leaf dependencies it pulled in. `dnf erase --keep-deps` is not standard syntax, `rpm -e --force` skips dependency handling, and `dnf clean` only clears cached metadata.',
    references: [REF_DNF]
  },
  {
    domain: DEPLOY, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command shows the current time, time zone, and whether NTP synchronization is active?',
    options: opts4(
      'timedatectl',
      'date --ntp',
      'chronyc time',
      'hwclock --show-zone'
    ),
    correct: ['a'],
    explanation: '`timedatectl` (with no arguments) reports local/universal time, the time zone, and NTP-synchronized status. `date --ntp`, `chronyc time`, and `hwclock --show-zone` are not valid forms for that summary.',
    references: [REF_CHRONY]
  },
  {
    domain: DEPLOY, difficulty: 3, type: QType.SINGLE,
    stem: 'Which `nmcli` command brings the connection profile `ens3` down and back up to apply changed settings?',
    options: opts4(
      'nmcli con down ens3 ; nmcli con up ens3',
      'nmcli reload ens3',
      'nmcli dev restart ens3',
      'systemctl restart ens3'
    ),
    correct: ['a'],
    explanation: 'Re-activating a profile with `nmcli con down` then `nmcli con up` applies modified `ipv4.*` settings. `nmcli reload` reloads NetworkManager config files, `nmcli dev restart` is invalid, and `ens3` is not a systemd unit.',
    references: [REF_NET]
  },
  {
    domain: DEPLOY, difficulty: 3, type: QType.SINGLE,
    stem: 'You need to install package group "Development Tools" on RHEL 9. Which command is correct?',
    options: opts4(
      'dnf group install "Development Tools"',
      'dnf install group=Development-Tools',
      'dnf -g Development Tools',
      'yum addgroup "Development Tools"'
    ),
    correct: ['a'],
    explanation: '`dnf group install "Development Tools"` (or `dnf groupinstall`) installs all packages in the group. The other forms use option syntax that DNF does not accept.',
    references: [REF_DNF]
  },
  {
    domain: DEPLOY, difficulty: 3, type: QType.SINGLE,
    stem: 'Which command displays the list of available kernel boot entries with their indices so you can pick a default?',
    options: opts4(
      'grubby --info=ALL',
      'grub2-list --all',
      'grubby --show-menu',
      'cat /boot/grub2/menu.lst'
    ),
    correct: ['a'],
    explanation: '`grubby --info=ALL` prints every boot entry (kernel, args, index). `grub2-list`/`--show-menu` are not commands, and RHEL 9 uses `grub.cfg`/BLS snippets, not the legacy `menu.lst`.',
    references: [REF_BOOT]
  },
  {
    domain: DEPLOY, difficulty: 4, type: QType.SINGLE,
    stem: 'Which command sets the default kernel for the next boots to the entry with index 1?',
    options: opts4(
      'grubby --set-default-index=1',
      'grub2-set-default --index 1',
      'grubby --default 1 --once',
      'systemctl set-default kernel-1'
    ),
    correct: ['a'],
    explanation: '`grubby --set-default-index=1` makes that BLS entry the persistent default. `grub2-set-default` takes a menu entry title/number differently, `--once` (via `grub2-reboot`) is one-time only, and `systemctl set-default` controls targets not kernels.',
    references: [REF_BOOT]
  },
  {
    domain: DEPLOY, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A rootless container should expose its service on host port 8080. Which `podman run` option publishes container port 80 to host 8080?',
    options: opts4(
      'podman run -d -p 8080:80 nginx',
      'podman run -d --expose 8080 nginx',
      'podman run -d --net host 80:8080 nginx',
      'podman run -d -P 8080 nginx'
    ),
    correct: ['a'],
    explanation: '`-p 8080:80` maps host port 8080 to container port 80. `--expose` only documents a port without publishing, the `--net host 80:8080` form is invalid, and `-P` publishes all exposed ports to random host ports (no fixed 8080).',
    references: [REF_PODMAN]
  },
  {
    domain: DEPLOY, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about managing rootless containers with Podman on RHEL 9.',
    options: opts4(
      'Rootless containers run under the invoking user\'s UID without root privileges.',
      '`podman generate systemd` can produce unit files to manage container lifecycle.',
      'A user systemd service for a container is enabled with `systemctl --user enable`.',
      'Rootless containers require the Docker daemon to be running.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Podman is daemonless and supports rootless mode; `podman generate systemd` plus `systemctl --user enable` integrates containers with the user\'s systemd. Podman does NOT need a Docker daemon, so option D is false.',
    references: [REF_PODMAN]
  },
  {
    domain: DEPLOY, difficulty: 3, type: QType.SINGLE,
    stem: 'Which command checks the chrony tracking status to confirm the system clock is synchronized to a time source?',
    options: opts4(
      'chronyc tracking',
      'chronyc sources --sync',
      'systemctl tracking chronyd',
      'timedatectl ntp-status'
    ),
    correct: ['a'],
    explanation: '`chronyc tracking` reports the reference ID, stratum, offset, and whether the clock is synchronized. `chronyc sources` lists sources (no `--sync`), and the systemd/timedatectl forms shown are not valid.',
    references: [REF_CHRONY]
  },

  // ── Manage Users and Groups (+4 → 6) ──
  {
    domain: USERS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command creates a new group named `engineers`?',
    options: opts4(
      'groupadd engineers',
      'useradd -g engineers',
      'newgrp engineers',
      'usermod -G engineers'
    ),
    correct: ['a'],
    explanation: '`groupadd engineers` creates the group in `/etc/group`. `useradd -g` sets a new user\'s primary group (and needs the group to exist), `newgrp` switches your active group, and `usermod -G` modifies an existing user.',
    references: [REF_USERS]
  },
  {
    domain: USERS, difficulty: 3, type: QType.SINGLE,
    stem: 'Which command changes the primary group of existing user `frank` to `staff`?',
    options: opts4(
      'usermod -g staff frank',
      'usermod -aG staff frank',
      'groupmod -g frank staff',
      'gpasswd staff frank'
    ),
    correct: ['a'],
    explanation: '`usermod -g staff frank` sets `staff` as the PRIMARY group. `-aG` adds a SUPPLEMENTARY group, `groupmod` modifies a group definition, and `gpasswd` administers group membership/passwords.',
    references: [REF_USERS]
  },
  {
    domain: USERS, difficulty: 3, type: QType.SINGLE,
    stem: 'Which command deletes user `guest` AND removes their home directory and mail spool?',
    options: opts4(
      'userdel -r guest',
      'userdel guest',
      'usermod -d /dev/null guest',
      'rm -rf /home/guest only'
    ),
    correct: ['a'],
    explanation: '`userdel -r guest` removes the account plus its home directory and mail spool. Plain `userdel` leaves the home behind, `usermod -d` only changes the home path, and `rm -rf` alone leaves the account in `/etc/passwd`.',
    references: [REF_USERS]
  },
  {
    domain: USERS, difficulty: 4, type: QType.SINGLE,
    stem: 'You must create a system account `appsvc` with no login shell and no home directory, to own a daemon process. Which command is correct?',
    options: opts4(
      'useradd -r -s /sbin/nologin -M appsvc',
      'useradd -m -s /bin/bash appsvc',
      'adduser --system --shell /bin/bash appsvc',
      'useradd -r -d /home/appsvc appsvc'
    ),
    correct: ['a'],
    explanation: '`useradd -r` creates a system account (low UID, no aging), `-s /sbin/nologin` blocks interactive login, and `-M` skips home-directory creation. The other options grant a shell and/or a home directory, which is wrong for a service account.',
    references: [REF_USERS]
  },

  // ── Manage Security (+4 → 6) ──
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command lists all currently allowed services in the default firewalld zone?',
    options: opts4(
      'firewall-cmd --list-services',
      'firewall-cmd --get-zones',
      'firewall-cmd --reload',
      'firewall-cmd --check-config'
    ),
    correct: ['a'],
    explanation: '`firewall-cmd --list-services` (or `--list-all`) shows the services permitted in the active zone. `--get-zones` lists available zones, `--reload` re-applies permanent config, and `--check-config` validates configuration.',
    references: [REF_FW]
  },
  {
    domain: SECURITY, difficulty: 3, type: QType.SINGLE,
    stem: 'Which command sets the SELinux mode to permissive immediately (until next boot) for troubleshooting?',
    options: opts4(
      'setenforce 0',
      'setenforce 1',
      'getenforce permissive',
      'semanage permissive -a'
    ),
    correct: ['a'],
    explanation: '`setenforce 0` switches the running system to permissive (logs denials without blocking). `setenforce 1` returns to enforcing, `getenforce` only reports, and `semanage permissive -a` makes a specific DOMAIN permissive, not the whole system.',
    references: [REF_SELINUX]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'The command `ls -Z` displays the SELinux security context of files.',
    options: tf(),
    correct: ['a'],
    explanation: '`ls -Z` adds the SELinux context (user:role:type:level) to the listing, while `ls -l` shows only the traditional DAC owner/group/mode. The statement is therefore true.',
    references: [REF_SELINUX]
  },
  {
    domain: SECURITY, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about firewalld on RHEL 9.',
    options: opts4(
      'Changes made without `--permanent` are lost after `firewall-cmd --reload`.',
      'A zone defines a trust level with its own allowed services and ports.',
      '`firewall-cmd --runtime-to-permanent` saves the running config to permanent.',
      'firewalld and the raw `iptables` service can both be enabled simultaneously without conflict.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Runtime-only changes vanish on reload, zones are trust levels with their own rule sets, and `--runtime-to-permanent` persists current rules. Running firewalld alongside the legacy iptables service causes conflicts, so option D is false.',
    references: [REF_FW]
  }
];

// ───────────────────── Practice Exam 2 ─────────────────────
const P2: Q[] = [
  // ── Understand and Use Essential Tools (3) ──
  {
    domain: TOOLS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command archives the directory `/home/student` into a single gzip-compressed file `backup.tar.gz`?',
    options: opts4(
      'tar -czf backup.tar.gz /home/student',
      'tar -xzf backup.tar.gz /home/student',
      'gzip -r /home/student backup.tar.gz',
      'tar -tf backup.tar.gz /home/student'
    ),
    correct: ['a'],
    explanation: '`-c` creates an archive, `-z` pipes it through gzip, and `-f` names the output file. `-x` extracts, `-t` only lists contents, and `gzip -r` compresses files in place rather than building a tar archive.',
    references: [REF_SHELL]
  },
  {
    domain: TOOLS, difficulty: 3, type: QType.SINGLE,
    stem: 'Which `sed` command replaces every occurrence of `dev` with `prod` on all lines of `app.conf` and writes the change back to the file?',
    options: opts4(
      "sed -i 's/dev/prod/g' app.conf",
      "sed 's/dev/prod/' app.conf",
      "sed -n 's/dev/prod/g' app.conf",
      "sed -e 'dev=prod' app.conf"
    ),
    correct: ['a'],
    explanation: '`-i` edits the file in place, `s/dev/prod/g` substitutes globally on each line. Without `-i` the change only prints to stdout, without `g` only the first match per line changes, and `-n` suppresses output.',
    references: [REF_SHELL]
  },
  {
    domain: TOOLS, difficulty: 2, type: QType.SINGLE,
    stem: 'You do not remember the options of the `find` command. Which command opens its manual page?',
    options: opts4(
      'man find',
      'find --man',
      'help find',
      'info --man find'
    ),
    correct: ['a'],
    explanation: '`man find` displays the manual page. `find --man` is not a valid option, `help` is a bash builtin for shell builtins only, and `info --man` is not valid syntax (use `info find` for the info reader).',
    references: [REF_SHELL]
  },

  // ── Operate Running Systems (3) ──
  {
    domain: OPERATE, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A runaway process with PID 4821 must be terminated. Which command sends the default termination signal to it?',
    options: opts4(
      'kill 4821',
      'kill -9 -4821',
      'renice 4821',
      'nice 4821'
    ),
    correct: ['a'],
    explanation: '`kill 4821` sends SIGTERM (signal 15), the default, allowing graceful shutdown. `kill -9 -4821` targets a process GROUP with SIGKILL, while `renice`/`nice` change scheduling priority, not termination.',
    references: [REF_SHELL]
  },
  {
    domain: OPERATE, difficulty: 3, type: QType.SINGLE,
    stem: 'You want to lower the scheduling priority of an ALREADY RUNNING process (PID 3300) so it competes less for CPU. Which command does this?',
    options: opts4(
      'renice +10 3300',
      'nice -n 10 3300',
      'kill -STOP 3300',
      'chrt -f 10 3300'
    ),
    correct: ['a'],
    explanation: '`renice` changes the niceness of an existing process; a higher (more positive) nice value lowers priority. `nice` only launches NEW commands with a niceness, `kill -STOP` suspends the process, and `chrt` sets real-time scheduling policy.',
    references: [REF_SHELL]
  },
  {
    domain: OPERATE, difficulty: 3, type: QType.SINGLE,
    stem: 'Which command applies the `throughput-performance` tuned profile and makes it the active profile?',
    options: opts4(
      'tuned-adm profile throughput-performance',
      'tuned-adm list throughput-performance',
      'systemctl set-default throughput-performance',
      'tuned --profile throughput-performance --once'
    ),
    correct: ['a'],
    explanation: '`tuned-adm profile <name>` activates the named profile via the tuned daemon. `tuned-adm list` only enumerates profiles, `systemctl set-default` controls boot targets, and `tuned --profile` is not the supported management command (use `tuned-adm`).',
    references: [REF_TUNED]
  },

  // ── Configure Local Storage (3) ──
  {
    domain: STORAGE, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which sequence builds an LVM stack: turn `/dev/vdb1` into a physical volume, create volume group `vg01`, then a 5 GiB logical volume `lv01`?',
    options: opts4(
      'pvcreate /dev/vdb1 ; vgcreate vg01 /dev/vdb1 ; lvcreate -L 5G -n lv01 vg01',
      'vgcreate /dev/vdb1 ; pvcreate vg01 ; lvcreate vg01 5G',
      'lvcreate /dev/vdb1 ; vgextend vg01 ; pvscan lv01',
      'mkfs.lvm /dev/vdb1 ; vgcreate vg01 ; lvcreate lv01'
    ),
    correct: ['a'],
    explanation: 'The correct LVM order is `pvcreate` (initialize the PV) → `vgcreate` (group PVs) → `lvcreate -L 5G -n lv01 vg01` (carve out the LV). The other options reverse the order or use non-existent commands like `mkfs.lvm`.',
    references: [REF_LVM]
  },
  {
    domain: STORAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'Which Stratis commands create a pool `pool1` from `/dev/vdc` and then a file system `fs1` on it?',
    options: opts4(
      'stratis pool create pool1 /dev/vdc ; stratis filesystem create pool1 fs1',
      'stratis create pool /dev/vdc pool1 ; stratis fs new pool1',
      'mkfs.stratis /dev/vdc ; stratis mount fs1',
      'lvcreate --stratis pool1 /dev/vdc'
    ),
    correct: ['a'],
    explanation: 'Stratis uses `stratis pool create <pool> <dev>` then `stratis filesystem create <pool> <fs>`. The `stratis-cli` syntax in the other options is invalid, and Stratis is not created via `mkfs.stratis` or `lvcreate`.',
    references: [REF_STORAGE]
  },
  {
    domain: STORAGE, difficulty: 4, type: QType.SINGLE,
    stem: 'You need to add new disk `/dev/vdd` to an EXISTING volume group `vgapp` to gain more free extents. Which command does this?',
    options: opts4(
      'pvcreate /dev/vdd ; vgextend vgapp /dev/vdd',
      'vgcreate vgapp /dev/vdd',
      'lvextend vgapp /dev/vdd',
      'pvmove /dev/vdd vgapp'
    ),
    correct: ['a'],
    explanation: 'First initialize the disk with `pvcreate`, then `vgextend vgapp /dev/vdd` adds the new PV to the existing VG. `vgcreate` would make a new VG, `lvextend` grows an LV, and `pvmove` relocates extents between PVs.',
    references: [REF_LVM]
  },

  // ── Create and Configure File Systems (3) ──
  {
    domain: FILESYS, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'An `/etc/fstab` line for an NFS export should use which file-system type field and a recommended mount option for resilience?',
    options: opts4(
      'Type `nfs` with the `_netdev` option so the mount waits for networking',
      'Type `xfs` with the `noauto` option',
      'Type `swap` with the `defaults` option',
      'Type `cifs` with the `loop` option'
    ),
    correct: ['a'],
    explanation: 'NFS mounts use fs type `nfs`; the `_netdev` option ensures the mount is attempted only after the network is up. `xfs`/`swap` are local types, and `cifs`/`loop` apply to SMB shares and loopback images respectively.',
    references: [REF_NFS]
  },
  {
    domain: FILESYS, difficulty: 3, type: QType.SINGLE,
    stem: 'You want `/etc/fstab` entries that should NOT block boot if the device is missing, but still be mountable later. Which mount option fits?',
    options: opts4(
      'nofail',
      'remount',
      'sync',
      'ro'
    ),
    correct: ['a'],
    explanation: 'The `nofail` option lets the system boot even if the device is absent, while the entry remains valid for a later `mount -a`. `remount` re-applies options, `sync` forces synchronous I/O, and `ro` mounts read-only — none address boot-blocking.',
    references: [REF_FS]
  },
  {
    domain: FILESYS, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL true statements about autofs on RHEL 9.',
    options: opts4(
      'autofs mounts file systems on demand and unmounts them after a period of inactivity.',
      'A master map (e.g. `/etc/auto.master`) references one or more map files.',
      'autofs requires editing `/etc/fstab` for every mount it manages.',
      'autofs is commonly used to automount NFS home directories.'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'autofs is an on-demand automounter driven by master/indirect maps, often used for NFS home directories. It deliberately replaces static `/etc/fstab` entries, so option C is false.',
    references: [REF_NFS]
  },

  // ── Deploy, Configure, and Maintain Systems (4) ──
  {
    domain: DEPLOY, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which `nmcli` command sets a static IPv4 address 192.168.10.5/24 with gateway 192.168.10.1 on connection `ens3`?',
    options: opts4(
      'nmcli con mod ens3 ipv4.addresses 192.168.10.5/24 ipv4.gateway 192.168.10.1 ipv4.method manual',
      'nmcli dev ip ens3 192.168.10.5',
      'ifconfig ens3 192.168.10.5 netmask 255.255.255.0',
      'nmcli con add static ens3 192.168.10.5'
    ),
    correct: ['a'],
    explanation: 'Modifying the connection profile with `ipv4.addresses`, `ipv4.gateway`, and `ipv4.method manual` makes the static config persistent (re-apply with `nmcli con up ens3`). `ifconfig` is deprecated and not persistent; the other nmcli forms are invalid syntax.',
    references: [REF_NET]
  },
  {
    domain: DEPLOY, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command sets the system static hostname to `server1.example.com` persistently?',
    options: opts4(
      'hostnamectl set-hostname server1.example.com',
      'hostname server1.example.com',
      'echo server1 > /proc/hostname',
      'nmcli hostname server1.example.com'
    ),
    correct: ['a'],
    explanation: '`hostnamectl set-hostname` writes `/etc/hostname` and applies it persistently. The `hostname` command only changes it until reboot, `/proc/hostname` is not writable that way, and `nmcli hostname ...` is not valid syntax.',
    references: [REF_NET]
  },
  {
    domain: DEPLOY, difficulty: 3, type: QType.SINGLE,
    stem: 'You must list all available module streams for `nodejs` and then install the `18` stream. Which commands accomplish this on RHEL 9?',
    options: opts4(
      'dnf module list nodejs ; dnf module install nodejs:18',
      'dnf list nodejs ; dnf install nodejs-18',
      'dnf stream nodejs 18',
      'dnf module enable 18'
    ),
    correct: ['a'],
    explanation: '`dnf module list nodejs` shows streams; `dnf module install nodejs:18` enables stream 18 and installs its default profile. Plain `dnf install nodejs-18` ignores modular metadata, and the other forms are not valid module syntax.',
    references: [REF_DNF]
  },
  {
    domain: DEPLOY, difficulty: 4, type: QType.SINGLE,
    stem: 'You must add `console=ttyS0` to the default kernel command line persistently for future boots. Which RHEL 9 tool is intended for this?',
    options: opts4(
      'grubby --update-kernel=ALL --args="console=ttyS0"',
      'grub-install --args console=ttyS0',
      'edit /proc/cmdline directly',
      'sysctl -w kernel.cmdline=console=ttyS0'
    ),
    correct: ['a'],
    explanation: '`grubby --update-kernel=ALL --args=...` edits the boot loader entries persistently. `grub-install` reinstalls the bootloader, `/proc/cmdline` is read-only, and `sysctl` tunes runtime kernel parameters, not the boot command line.',
    references: [REF_BOOT]
  },

  // ── Manage Users and Groups (2) ──
  {
    domain: USERS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command adds existing user `carol` to the supplementary group `developers` WITHOUT removing her other supplementary groups?',
    options: opts4(
      'usermod -aG developers carol',
      'usermod -G developers carol',
      'groupadd carol developers',
      'gpasswd -d carol developers'
    ),
    correct: ['a'],
    explanation: '`usermod -aG` APPENDS the group, preserving existing memberships. `usermod -G` (without `-a`) REPLACES the supplementary group list, `groupadd` creates a group, and `gpasswd -d` removes a member.',
    references: [REF_USERS]
  },
  {
    domain: USERS, difficulty: 3, type: QType.SINGLE,
    stem: 'You want members of group `wheel` to run any command via `sudo`. On RHEL 9 the recommended way to express this is to:',
    options: opts4(
      'Create a file under /etc/sudoers.d/ (validated with visudo) granting `%wheel ALL=(ALL) ALL`',
      'Add each user to /etc/passwd with UID 0',
      'chmod 4755 /bin/bash',
      'Edit /etc/group and set the wheel GID to 0'
    ),
    correct: ['a'],
    explanation: 'A drop-in under `/etc/sudoers.d/` with `%wheel ALL=(ALL) ALL`, edited via `visudo`, is the supported sudo configuration. Sharing UID 0, setuid-ing bash, or remapping the wheel GID are dangerous and incorrect.',
    references: [REF_USERS]
  },

  // ── Manage Security (2) ──
  {
    domain: SECURITY, difficulty: 3, type: QType.SINGLE,
    stem: 'Which command lets the Apache `httpd` process make outbound network connections by toggling the appropriate SELinux boolean persistently?',
    options: opts4(
      'setsebool -P httpd_can_network_connect on',
      'setenforce 1',
      'semanage fcontext -a httpd_can_network_connect',
      'restorecon -R /etc/httpd'
    ),
    correct: ['a'],
    explanation: '`setsebool -P httpd_can_network_connect on` flips the boolean and `-P` makes it persistent across reboots. `setenforce` only changes enforcing/permissive mode, `semanage fcontext` manages file contexts, and `restorecon` relabels files.',
    references: [REF_SELINUX]
  },
  {
    domain: SECURITY, difficulty: 3, type: QType.SINGLE,
    stem: 'Which `firewall-cmd` command permanently opens custom TCP port 8080 in the `public` zone?',
    options: opts4(
      'firewall-cmd --permanent --zone=public --add-port=8080/tcp ; firewall-cmd --reload',
      'firewall-cmd --add-port 8080 --temporary',
      'iptables -A INPUT -p tcp 8080',
      'firewall-cmd --open 8080/tcp'
    ),
    correct: ['a'],
    explanation: 'Adding the port with `--permanent --zone=public --add-port=8080/tcp` then `--reload` makes the rule survive reloads/reboots. The `--temporary`/`--open` forms are invalid, and a raw `iptables` rule is not the firewalld-managed approach RHCSA expects.',
    references: [REF_FW]
  },

  // ── Understand and Use Essential Tools (+7 → 10) ──
  {
    domain: TOOLS, difficulty: 1, type: QType.TRUE_FALSE,
    stem: 'The `pwd` command prints the absolute path of the current working directory.',
    options: tf(),
    correct: ['a'],
    explanation: '`pwd` (print working directory) outputs the full absolute path of the directory you are currently in, so the statement is true.',
    references: [REF_SHELL]
  },
  {
    domain: TOOLS, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command searches the file `data.txt` for lines that start with the word `total`?',
    options: opts4(
      "grep '^total' data.txt",
      "grep 'total$' data.txt",
      "grep -v 'total' data.txt",
      "grep 'total' --start data.txt"
    ),
    correct: ['a'],
    explanation: 'The `^` anchor ties the pattern to the BEGINNING of the line, so `^total` matches lines starting with "total". `total$` anchors to the END, `-v` inverts the match, and `--start` is not a grep option.',
    references: [REF_SHELL]
  },
  {
    domain: TOOLS, difficulty: 3, type: QType.SINGLE,
    stem: 'Which command extracts and prints just the first colon-separated field (the username) from every line of `/etc/passwd`?',
    options: opts4(
      "cut -d: -f1 /etc/passwd",
      "cut -f1 /etc/passwd",
      "awk '{print $2}' /etc/passwd",
      "sed -n '1p' /etc/passwd"
    ),
    correct: ['a'],
    explanation: '`cut -d: -f1` sets the delimiter to `:` and prints field 1 (the username). Without `-d:` cut defaults to TAB, the awk default delimiter is whitespace (so `$2` is wrong here), and `sed -n 1p` prints only line 1.',
    references: [REF_SHELL]
  },
  {
    domain: TOOLS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command lists files in the current directory sorted by modification time, newest first?',
    options: opts4(
      'ls -lt',
      'ls -lS',
      'ls -lr',
      'ls --sort=name'
    ),
    correct: ['a'],
    explanation: '`ls -lt` sorts by modification time with the most recent first. `-lS` sorts by size, `-lr` reverses the default name order, and `--sort=name` sorts alphabetically.',
    references: [REF_SHELL]
  },
  {
    domain: TOOLS, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about the `tar` command on RHEL 9.',
    options: opts4(
      '`tar -tf archive.tar` lists the contents without extracting.',
      '`tar -xJf archive.tar.xz` extracts an xz-compressed archive.',
      '`tar -czf a.tgz dir/` creates a gzip-compressed archive of dir/.',
      '`tar -rf` can only be used on compressed archives.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: '`-tf` lists, `-xJf` extracts xz archives, and `-czf` creates a gzip archive. `tar -rf` appends files but ONLY to uncompressed archives (you cannot append to a gzip/xz stream), so option D is false.',
    references: [REF_SHELL]
  },
  {
    domain: TOOLS, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'You connect to a remote server as `admin` on host `db1` over SSH using port 2222. Which command is correct?',
    options: opts4(
      'ssh -p 2222 admin@db1',
      'ssh admin@db1 -port 2222',
      'ssh --port=2222 db1 admin',
      'ssh admin:2222@db1'
    ),
    correct: ['a'],
    explanation: 'The SSH port is specified with the lowercase `-p` option: `ssh -p 2222 admin@db1`. `-port`/`--port` are not valid (uppercase `-P` is for scp/sftp), and `admin:2222@db1` is not valid SSH target syntax.',
    references: [REF_SHELL]
  },
  {
    domain: TOOLS, difficulty: 4, type: QType.SINGLE,
    stem: 'Which command appends the standard output of `dmesg` to the file `boot.log` WITHOUT overwriting existing content?',
    options: opts4(
      'dmesg >> boot.log',
      'dmesg > boot.log',
      'dmesg | boot.log',
      'dmesg 2> boot.log'
    ),
    correct: ['a'],
    explanation: '`>>` appends stdout to the file, preserving prior content. `>` truncates and overwrites, `|` pipes to a command (not a file), and `2>` would redirect stderr (and also truncate).',
    references: [REF_SHELL]
  },

  // ── Operate Running Systems (+7 → 10) ──
  {
    domain: OPERATE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command shows a one-time snapshot of all running processes with full details?',
    options: opts4(
      'ps aux',
      'top -1',
      'jobs -l',
      'pgrep -a'
    ),
    correct: ['a'],
    explanation: '`ps aux` (or `ps -ef`) prints a full one-time process listing. `top` is interactive/continuous, `jobs` lists only shell job-control jobs, and `pgrep` matches processes by name/pattern rather than listing all.',
    references: [REF_SHELL]
  },
  {
    domain: OPERATE, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'You want to terminate every process named `myapp` by name. Which command does this?',
    options: opts4(
      'pkill myapp',
      'kill myapp',
      'killall -l myapp',
      'pgrep -k myapp'
    ),
    correct: ['a'],
    explanation: '`pkill myapp` sends SIGTERM to all processes matching the name (`killall myapp` is equivalent). `kill` needs a PID not a name, `killall -l` only lists signal names, and `pgrep -k` is not valid (`pgrep` has no kill flag).',
    references: [REF_SHELL]
  },
  {
    domain: OPERATE, difficulty: 3, type: QType.SINGLE,
    stem: 'Which command launches `/usr/bin/backup` with a lower scheduling priority (nice value 15)?',
    options: opts4(
      'nice -n 15 /usr/bin/backup',
      'renice -n 15 /usr/bin/backup',
      'nice 15 -p /usr/bin/backup',
      'chrt 15 /usr/bin/backup'
    ),
    correct: ['a'],
    explanation: '`nice -n 15 <command>` STARTS a new process with niceness 15 (lower priority). `renice` only adjusts an EXISTING process by PID/user, the `nice 15 -p` form is wrong, and `chrt` sets real-time policy.',
    references: [REF_SHELL]
  },
  {
    domain: OPERATE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command lists currently loaded systemd units that are in a failed state?',
    options: opts4(
      'systemctl --failed',
      'systemctl list-unit-files --all',
      'systemctl status --failed-only',
      'journalctl --failed'
    ),
    correct: ['a'],
    explanation: '`systemctl --failed` (alias of `systemctl list-units --failed`) shows units that failed to start. `list-unit-files` shows enablement state, and the `status --failed-only`/`journalctl --failed` forms are not valid.',
    references: [REF_SYSTEMD]
  },
  {
    domain: OPERATE, difficulty: 3, type: QType.SINGLE,
    stem: 'After editing a unit file in `/etc/systemd/system/`, which command must you run before restarting the service so systemd picks up the change?',
    options: opts4(
      'systemctl daemon-reload',
      'systemctl reload-or-restart all',
      'systemctl reset-failed',
      'systemctl revert'
    ),
    correct: ['a'],
    explanation: '`systemctl daemon-reload` reloads the systemd manager configuration so edited unit files take effect. `reset-failed` clears failed state, `revert` discards customizations, and `reload-or-restart all` is not a valid command.',
    references: [REF_SYSTEMD]
  },
  {
    domain: OPERATE, difficulty: 3, type: QType.SINGLE,
    stem: 'Which command shows kernel and boot messages from the PREVIOUS boot (if persistent journaling is enabled)?',
    options: opts4(
      'journalctl -b -1',
      'journalctl --previous',
      'dmesg -1',
      'journalctl -b 0'
    ),
    correct: ['a'],
    explanation: '`journalctl -b -1` selects the previous boot (`-b 0` or `-b` is the current boot). `--previous` is not an option, and `dmesg -1` is not valid syntax for prior-boot kernel messages.',
    references: [REF_SYSTEMD]
  },
  {
    domain: OPERATE, difficulty: 4, type: QType.SINGLE,
    stem: 'You need a one-time job that runs in 5 minutes. Which `at` invocation schedules it correctly?',
    options: opts4(
      'echo "/usr/local/bin/job.sh" | at now + 5 minutes',
      'at --delay 5 /usr/local/bin/job.sh',
      'at +5m /usr/local/bin/job.sh',
      'sleep 300 && at job.sh'
    ),
    correct: ['a'],
    explanation: 'Piping a command into `at now + 5 minutes` schedules a one-time job five minutes from now. `at` reads the command from stdin (or a file with `-f`); the `--delay`/`+5m`/`sleep` forms are not valid `at` syntax.',
    references: [REF_SHELL]
  },

  // ── Configure Local Storage (+7 → 10) ──
  {
    domain: STORAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command lists all physical volumes known to LVM with their volume group and size?',
    options: opts4(
      'pvs',
      'pvcreate --list',
      'lvs --physical',
      'vgscan --pv'
    ),
    correct: ['a'],
    explanation: '`pvs` gives a concise table of physical volumes (PV, VG, size, free). `pvcreate` initializes a PV (no `--list`), `lvs` lists logical volumes, and `vgscan` scans for VGs (no `--pv`).',
    references: [REF_LVM]
  },
  {
    domain: STORAGE, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'You want to set the partition type of `/dev/vdb1` to "Linux LVM" so LVM can use it. Using `fdisk`, which type code applies?',
    options: opts4(
      'Type code `8e` (Linux LVM) in an MBR/DOS table',
      'Type code `82` (Linux swap)',
      'Type code `83` (Linux filesystem) is required for LVM',
      'LVM cannot use partitioned disks at all'
    ),
    correct: ['a'],
    explanation: 'In an MBR/DOS partition table the "Linux LVM" type is hex `8e` (GPT uses a different GUID, set via `parted set N lvm on`). `82` is swap and `83` is a generic Linux filesystem; LVM works fine on partitions.',
    references: [REF_STORAGE]
  },
  {
    domain: STORAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'Which command creates a 500 MiB logical volume named `lvlogs` in volume group `vgdata`?',
    options: opts4(
      'lvcreate -L 500M -n lvlogs vgdata',
      'lvcreate -n vgdata -L 500M lvlogs',
      'lvcreate vgdata --size lvlogs 500',
      'vgcreate -L 500M lvlogs vgdata'
    ),
    correct: ['a'],
    explanation: '`lvcreate -L 500M -n lvlogs vgdata` sets size with `-L`, name with `-n`, and takes the VG as the final argument. The other orderings/options are invalid, and `vgcreate` makes a volume group, not an LV.',
    references: [REF_LVM]
  },
  {
    domain: STORAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'You want to grow logical volume `/dev/vgapp/lvdata` to use ALL remaining free space in the volume group and resize the XFS at the same time. Which command does this in one step?',
    options: opts4(
      'lvextend -l +100%FREE -r /dev/vgapp/lvdata',
      'lvextend -L 100% /dev/vgapp/lvdata',
      'lvresize --all /dev/vgapp/lvdata',
      'vgextend -l +100%FREE /dev/vgapp/lvdata'
    ),
    correct: ['a'],
    explanation: '`-l +100%FREE` consumes all free extents and `-r` (`--resizefs`) automatically grows the file system after extending. `-L 100%` is not valid sizing, `lvresize --all` is not valid, and `vgextend` adds PVs.',
    references: [REF_LVM]
  },
  {
    domain: STORAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command deactivates swap on `/dev/vg01/lvswap` so the device can be removed?',
    options: opts4(
      'swapoff /dev/vg01/lvswap',
      'swapon -d /dev/vg01/lvswap',
      'umount /dev/vg01/lvswap',
      'mkswap -off /dev/vg01/lvswap'
    ),
    correct: ['a'],
    explanation: '`swapoff <device>` deactivates the swap area so it is no longer in use. Swap is not unmounted with `umount`, `swapon -d` is for discard not disabling, and `mkswap -off` is not valid.',
    references: [REF_STORAGE]
  },
  {
    domain: STORAGE, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL true statements about partitioning tools on RHEL 9.',
    options: opts4(
      '`parted` can create both MBR (msdos) and GPT partition tables.',
      '`gdisk` is specifically designed for GPT partition tables.',
      '`fdisk` in current RHEL supports GPT as well as MBR.',
      '`mkfs` is the tool used to create a partition table.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: '`parted` supports msdos and gpt labels, `gdisk` is GPT-focused, and modern `fdisk` handles GPT. `mkfs` creates a FILE SYSTEM on an existing partition, not a partition table, so option D is false.',
    references: [REF_STORAGE]
  },
  {
    domain: STORAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'Which command removes a logical volume `/dev/vgdata/lvold` permanently?',
    options: opts4(
      'lvremove /dev/vgdata/lvold',
      'lvreduce -L 0 /dev/vgdata/lvold',
      'vgremove /dev/vgdata/lvold',
      'rm -f /dev/vgdata/lvold'
    ),
    correct: ['a'],
    explanation: '`lvremove` deletes the logical volume and frees its extents back to the VG. `lvreduce -L 0` is invalid, `vgremove` deletes the whole volume group, and `rm` on the device node does not remove the LVM metadata.',
    references: [REF_LVM]
  },

  // ── Create and Configure File Systems (+7 → 10) ──
  {
    domain: FILESYS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command mounts the file system on `/dev/vgdata/lvweb` at the existing directory `/srv/web`?',
    options: opts4(
      'mount /dev/vgdata/lvweb /srv/web',
      'mount /srv/web /dev/vgdata/lvweb',
      'mount -o /dev/vgdata/lvweb=/srv/web',
      'mountpoint /dev/vgdata/lvweb /srv/web'
    ),
    correct: ['a'],
    explanation: 'The syntax is `mount <device> <mountpoint>`, so `mount /dev/vgdata/lvweb /srv/web`. Option B reverses the arguments, the `-o` form is invalid, and `mountpoint` only tests whether a path is a mount point.',
    references: [REF_FS]
  },
  {
    domain: FILESYS, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command unmounts `/srv/web`, returning an error if the file system is busy (no force)?',
    options: opts4(
      'umount /srv/web',
      'umount -l /srv/web',
      'umount -f /srv/web',
      'unmount /srv/web'
    ),
    correct: ['a'],
    explanation: 'Plain `umount /srv/web` cleanly unmounts and fails (without forcing) if the FS is busy. `-l` is a lazy detach, `-f` forces (typically for network FS), and `unmount` is not the correct command name.',
    references: [REF_FS]
  },
  {
    domain: FILESYS, difficulty: 3, type: QType.SINGLE,
    stem: 'Which command checks and repairs an UNMOUNTED ext4 file system on `/dev/vdb1`?',
    options: opts4(
      'fsck.ext4 -y /dev/vdb1',
      'xfs_repair /dev/vdb1',
      'fsck.ext4 /dev/vdb1 (while mounted)',
      'tune2fs -c 0 /dev/vdb1'
    ),
    correct: ['a'],
    explanation: '`fsck.ext4 -y /dev/vdb1` (i.e. `e2fsck`) checks/repairs an UNMOUNTED ext4 file system, answering yes to fixes. `xfs_repair` is for XFS, checking a mounted FS risks corruption, and `tune2fs -c 0` only disables the mount-count check.',
    references: [REF_FS]
  },
  {
    domain: FILESYS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command tells you the file-system type of an already-mounted directory `/home`?',
    options: opts4(
      'findmnt /home',
      'df /home --type',
      'lsblk /home',
      'file /home'
    ),
    correct: ['a'],
    explanation: '`findmnt /home` shows the source device, mount point, FS type, and options. `df /home --type` is invalid syntax, `lsblk` takes a device not a path, and `file /home` just says it is a directory.',
    references: [REF_FS]
  },
  {
    domain: FILESYS, difficulty: 3, type: QType.SINGLE,
    stem: 'You want a directory `/team` where every new file is owned by the group `team` automatically. Which special permission bit accomplishes this?',
    options: opts4(
      'The setgid bit: chmod g+s /team',
      'The sticky bit: chmod +t /team',
      'The setuid bit: chmod u+s /team',
      'A default ACL is the only possible way'
    ),
    correct: ['a'],
    explanation: 'The setgid bit on a directory makes new files/subdirs inherit the directory\'s GROUP ownership. The sticky bit restricts deletion, setuid affects executables, and while a default ACL can also work, setgid is the classic intended mechanism.',
    references: [REF_FS]
  },
  {
    domain: FILESYS, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which `/etc/fstab` mount option mounts a file system read-only?',
    options: opts4(
      'ro',
      'rw',
      'noexec',
      'nosuid'
    ),
    correct: ['a'],
    explanation: '`ro` mounts the file system read-only. `rw` is read-write, `noexec` blocks executing binaries, and `nosuid` ignores setuid/setgid bits — none of those make it read-only.',
    references: [REF_FS]
  },
  {
    domain: FILESYS, difficulty: 4, type: QType.SINGLE,
    stem: 'Which command mounts an NFSv4 export with the option to retry indefinitely in the background if the server is temporarily unreachable?',
    options: opts4(
      'mount -t nfs -o bg,vers=4 nfssrv:/exp /mnt/exp',
      'mount -t nfs -o sync nfssrv:/exp /mnt/exp',
      'mount -t nfs -o hard,nolock,async nfssrv:/exp /mnt/exp',
      'mount -t cifs -o bg nfssrv:/exp /mnt/exp'
    ),
    correct: ['a'],
    explanation: 'The `bg` option retries the mount in the background, and `vers=4` selects NFSv4. `sync` only forces synchronous writes, `cifs` is the wrong type for NFS, and the `nolock,async` combo does not provide background retry.',
    references: [REF_NFS]
  },

  // ── Deploy, Configure, and Maintain Systems (+9 → 13) ──
  {
    domain: DEPLOY, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'On RHEL 9, `dnf info httpd` displays the version, size, and summary of the httpd package.',
    options: tf(),
    correct: ['a'],
    explanation: '`dnf info httpd` prints package metadata such as name, version, size, and summary (equivalent to `rpm -qi` for an installed package), so the statement is true.',
    references: [REF_DNF]
  },
  {
    domain: DEPLOY, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command finds out which installed package provides the file `/usr/sbin/httpd`?',
    options: opts4(
      'rpm -qf /usr/sbin/httpd',
      'rpm -ql /usr/sbin/httpd',
      'dnf list /usr/sbin/httpd',
      'rpm -qa /usr/sbin/httpd'
    ),
    correct: ['a'],
    explanation: '`rpm -qf <file>` queries which package OWNS the file (`dnf provides /usr/sbin/httpd` also works). `rpm -ql` lists a package\'s files, `dnf list` lists packages by name, and `rpm -qa` lists all installed packages.',
    references: [REF_DNF]
  },
  {
    domain: DEPLOY, difficulty: 3, type: QType.SINGLE,
    stem: 'Which command updates ALL installed packages to their latest available versions non-interactively?',
    options: opts4(
      'dnf -y upgrade',
      'dnf refresh --all',
      'rpm -U *',
      'dnf reinstall all'
    ),
    correct: ['a'],
    explanation: '`dnf -y upgrade` (alias `dnf -y update`) upgrades every package, auto-confirming with `-y`. `dnf refresh` is not a subcommand, `rpm -U *` would not resolve dependencies, and `dnf reinstall` only re-installs existing versions.',
    references: [REF_DNF]
  },
  {
    domain: DEPLOY, difficulty: 3, type: QType.SINGLE,
    stem: 'Which `nmcli` command adds a DNS server 8.8.8.8 to the existing connection `ens3` and keeps it persistent?',
    options: opts4(
      'nmcli con mod ens3 ipv4.dns 8.8.8.8 ; nmcli con up ens3',
      'nmcli dns add ens3 8.8.8.8',
      'echo nameserver 8.8.8.8 >> /etc/resolv.conf (persistent)',
      'nmcli con mod ens3 dns=8.8.8.8 --temp'
    ),
    correct: ['a'],
    explanation: 'Setting `ipv4.dns` on the connection profile and re-activating it (`con up`) persists the DNS server. Editing `/etc/resolv.conf` directly is overwritten by NetworkManager, and the other nmcli forms are invalid.',
    references: [REF_NET]
  },
  {
    domain: DEPLOY, difficulty: 3, type: QType.SINGLE,
    stem: 'You must temporarily add the kernel argument `systemd.unit=rescue.target` for ONLY the next boot. Which approach fits?',
    options: opts4(
      'At the GRUB menu, press `e`, append the argument to the linux line, and press Ctrl+x to boot once',
      'grubby --update-kernel=ALL --args="systemd.unit=rescue.target"',
      'Edit /etc/default/grub and run grub2-mkconfig',
      'sysctl -w systemd.unit=rescue.target'
    ),
    correct: ['a'],
    explanation: 'Editing the GRUB entry interactively with `e` and booting with Ctrl+x applies the argument for that single boot only. The `grubby` and `/etc/default/grub` options make PERSISTENT changes, and `sysctl` is unrelated to boot arguments.',
    references: [REF_BOOT]
  },
  {
    domain: DEPLOY, difficulty: 4, type: QType.SINGLE,
    stem: 'Which command removes the kernel argument `quiet` from all boot entries persistently?',
    options: opts4(
      'grubby --update-kernel=ALL --remove-args="quiet"',
      'grubby --delete-arg quiet',
      'grub2-editenv - unset quiet',
      'sed -i /quiet/d /proc/cmdline'
    ),
    correct: ['a'],
    explanation: '`grubby --update-kernel=ALL --remove-args="quiet"` strips the argument from every boot entry persistently. `--delete-arg` is not the option name, `grub2-editenv` manages environment variables, and `/proc/cmdline` is read-only.',
    references: [REF_BOOT]
  },
  {
    domain: DEPLOY, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command lists all containers (including stopped ones) for the current rootless user?',
    options: opts4(
      'podman ps -a',
      'podman ps',
      'podman images -a',
      'podman list --stopped'
    ),
    correct: ['a'],
    explanation: '`podman ps -a` lists all containers including exited ones. `podman ps` alone shows only running containers, `podman images` lists images, and `podman list --stopped` is not valid syntax.',
    references: [REF_PODMAN]
  },
  {
    domain: DEPLOY, difficulty: 3, type: QType.SINGLE,
    stem: 'Which command mounts a host directory `/srv/data` into a rootless container at `/data` with a correct SELinux relabel?',
    options: opts4(
      'podman run -v /srv/data:/data:Z nginx',
      'podman run -v /srv/data:/data:ro,noselinux nginx',
      'podman run --mount /srv/data /data nginx',
      'podman run -v /srv/data=/data nginx'
    ),
    correct: ['a'],
    explanation: 'The `:Z` suffix on a `-v` bind mount tells Podman to relabel the host path with a private SELinux container label so the container can access it. The other forms use invalid syntax or disable SELinux improperly.',
    references: [REF_PODMAN]
  },
  {
    domain: DEPLOY, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about chrony on RHEL 9.',
    options: opts4(
      'The configuration file is `/etc/chrony.conf`.',
      '`chronyc sources` lists the time sources chrony is using.',
      'The `iburst` option speeds up initial synchronization.',
      'chrony cannot act as an NTP server for other hosts.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'chrony reads `/etc/chrony.conf`, `chronyc sources` lists sources, and `iburst` accelerates the first sync. chrony CAN serve time to clients via the `allow` directive, so option D is false.',
    references: [REF_CHRONY]
  },

  // ── Manage Users and Groups (+4 → 6) ──
  {
    domain: USERS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command sets (or changes) the password for user `erin`, prompting for the new password?',
    options: opts4(
      'passwd erin',
      'chage erin',
      'usermod -p erin',
      'useradd -p erin'
    ),
    correct: ['a'],
    explanation: '`passwd erin` (run as root) interactively sets erin\'s password. `chage` manages aging, `usermod -p` expects a pre-hashed value (not a prompt), and `useradd` creates a new account.',
    references: [REF_USERS]
  },
  {
    domain: USERS, difficulty: 3, type: QType.SINGLE,
    stem: 'Which command displays the password-aging information (last change, expiry, etc.) for user `frank`?',
    options: opts4(
      'chage -l frank',
      'passwd -S frank only shows aging',
      'id frank',
      'getent aging frank'
    ),
    correct: ['a'],
    explanation: '`chage -l frank` lists last-change date, min/max age, warning, and expiry. `passwd -S` shows only status (locked/expired summary), `id` shows UID/GID, and `getent aging` is not valid.',
    references: [REF_USERS]
  },
  {
    domain: USERS, difficulty: 3, type: QType.SINGLE,
    stem: 'Which command changes the login shell of user `gina` to `/bin/sh`?',
    options: opts4(
      'usermod -s /bin/sh gina',
      'chsh -s gina /bin/sh',
      'usermod -shell /bin/sh gina',
      'passwd -s /bin/sh gina'
    ),
    correct: ['a'],
    explanation: '`usermod -s /bin/sh gina` updates the shell field in `/etc/passwd` (root for any user). `chsh -s` syntax is `chsh -s /bin/sh gina` (the option shown is reversed), `-shell` is not valid, and `passwd -s` shows status.',
    references: [REF_USERS]
  },
  {
    domain: USERS, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL true statements about user and group management on RHEL 9.',
    options: opts4(
      'Each user has exactly one primary group and zero or more supplementary groups.',
      'Default settings for new accounts come from `/etc/login.defs` and `/etc/default/useradd`.',
      '`id <user>` shows the user\'s UID, primary GID, and group memberships.',
      'Deleting a user with `userdel` always removes their home directory automatically.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'A user has one primary group plus optional supplementary groups; defaults live in `/etc/login.defs` and `/etc/default/useradd`; `id` summarizes IDs/groups. `userdel` removes the home directory ONLY with `-r`, so option D is false.',
    references: [REF_USERS]
  },

  // ── Manage Security (+4 → 6) ──
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command shows a detailed SELinux status report including current mode, config-file mode, and policy?',
    options: opts4(
      'sestatus',
      'getenforce -v',
      'semanage status',
      'selinux --report'
    ),
    correct: ['a'],
    explanation: '`sestatus` prints SELinux status, mounted FS, current/config mode, and loaded policy. `getenforce` only prints one word (no `-v`), and `semanage status`/`selinux --report` are not valid.',
    references: [REF_SELINUX]
  },
  {
    domain: SECURITY, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Apache must listen on the non-standard port 8888. With SELinux enforcing, which command adds 8888 to the allowed http port type persistently?',
    options: opts4(
      'semanage port -a -t http_port_t -p tcp 8888',
      'setsebool -P httpd_port 8888',
      'firewall-cmd --add-port=8888/tcp',
      'chcon -t http_port_t 8888'
    ),
    correct: ['a'],
    explanation: '`semanage port -a -t http_port_t -p tcp 8888` registers the new port with the SELinux policy so httpd may bind it. `setsebool` toggles booleans, firewalld only handles packet filtering, and `chcon` relabels files (ports are not files).',
    references: [REF_SELINUX]
  },
  {
    domain: SECURITY, difficulty: 3, type: QType.SINGLE,
    stem: 'Which command lists all SELinux booleans and their current on/off state?',
    options: opts4(
      'getsebool -a',
      'setsebool -a',
      'semanage boolean -d',
      'sestatus -b'
    ),
    correct: ['a'],
    explanation: '`getsebool -a` lists every boolean with its state (`semanage boolean -l` is an alternative). `setsebool -a` is invalid (it SETs a named boolean), `semanage boolean -d` deletes, and `sestatus -b` is not a valid option.',
    references: [REF_SELINUX]
  },
  {
    domain: SECURITY, difficulty: 3, type: QType.SINGLE,
    stem: 'Which command permanently changes the default firewalld zone to `work`?',
    options: opts4(
      'firewall-cmd --set-default-zone=work',
      'firewall-cmd --permanent --zone=work --default',
      'firewall-cmd --change-zone work',
      'firewall-cmd --add-zone=work --default'
    ),
    correct: ['a'],
    explanation: '`firewall-cmd --set-default-zone=work` immediately and permanently sets the default zone (no separate `--permanent`/`--reload` needed for this specific command). The other option strings are not valid firewalld syntax.',
    references: [REF_FW]
  }
];

// ───────────────────── Practice Exam 3 ─────────────────────
const P3: Q[] = [
  // ── Understand and Use Essential Tools (3) ──
  {
    domain: TOOLS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'In bash, which glob pattern matches every file in the current directory that ends in `.log`?',
    options: opts4(
      '*.log',
      '?.log only',
      '%.log',
      'log.*'
    ),
    correct: ['a'],
    explanation: '`*` matches any sequence of characters, so `*.log` matches all names ending in `.log`. `?` matches exactly one character, `%` has no globbing meaning in bash, and `log.*` matches names that START with `log.`.',
    references: [REF_SHELL]
  },
  {
    domain: TOOLS, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about bash input/output redirection.',
    options: opts4(
      '`>>` appends stdout to a file instead of truncating it.',
      '`2>&1` redirects stderr to wherever stdout currently points.',
      '`<` reads a command\'s standard input from a file.',
      '`|` redirects stdout to a file, overwriting it.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: '`>>` appends, `2>&1` ties stderr to stdout\'s current target, and `<` feeds stdin from a file. `|` pipes stdout to ANOTHER COMMAND, not to a file (that would be `>`), so option D is false.',
    references: [REF_SHELL]
  },
  {
    domain: TOOLS, difficulty: 3, type: QType.SINGLE,
    stem: 'You generate an SSH key pair and want to enable passwordless login to `host2` for the current user. Which command installs your public key into the remote `authorized_keys`?',
    options: opts4(
      'ssh-copy-id user@host2',
      'scp ~/.ssh/id_rsa user@host2:/',
      'ssh-keygen -R host2',
      'ssh-add host2'
    ),
    correct: ['a'],
    explanation: '`ssh-copy-id` appends your PUBLIC key to the remote `~/.ssh/authorized_keys` with correct permissions. Copying the PRIVATE key is wrong/insecure, `ssh-keygen -R` removes a known_hosts entry, and `ssh-add` loads keys into the local agent.',
    references: [REF_SHELL]
  },

  // ── Operate Running Systems (3) ──
  {
    domain: OPERATE, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'You have forgotten the root password. On RHEL 9, which boot-time approach lets you reset it?',
    options: opts4(
      'Edit the GRUB entry to add `rd.break`, then remount sysroot rw, run `chroot /sysroot`, `passwd`, and create `/.autorelabel`',
      'Boot normally and run `passwd root` as an unprivileged user',
      'Reinstall the operating system',
      'Press Ctrl+Alt+Del at the login screen'
    ),
    correct: ['a'],
    explanation: 'Adding `rd.break` drops to the initramfs; you remount `/sysroot` rw, `chroot`, set the password, and touch `/.autorelabel` so SELinux relabels on the next boot. An unprivileged user cannot change root\'s password, and reinstalling is unnecessary.',
    references: [REF_BOOT]
  },
  {
    domain: OPERATE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command switches the CURRENT running system into rescue mode without rebooting?',
    options: opts4(
      'systemctl isolate rescue.target',
      'systemctl set-default rescue.target',
      'systemctl enable rescue.target',
      'systemctl rescue --boot'
    ),
    correct: ['a'],
    explanation: '`systemctl isolate rescue.target` transitions the live system to the rescue target immediately. `set-default` only affects future boots, `enable` does not isolate, and `systemctl rescue --boot` is not valid syntax (`systemctl rescue` works but the `--boot` flag does not).',
    references: [REF_BOOT]
  },
  {
    domain: OPERATE, difficulty: 3, type: QType.SINGLE,
    stem: 'Which command shows a continuously updating, interactive view of running processes and their CPU/memory usage?',
    options: opts4(
      'top',
      'ps -ef --once',
      'journalctl -f',
      'systemctl status --top'
    ),
    correct: ['a'],
    explanation: '`top` provides a live, refreshing process monitor. `ps -ef` is a one-time snapshot (and `--once` is not a real option), `journalctl -f` follows logs, and `systemctl status --top` is not a valid command.',
    references: [REF_SHELL]
  },

  // ── Configure Local Storage (3) ──
  {
    domain: STORAGE, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command displays block devices with their mount points and file-system types in a tree view?',
    options: opts4(
      'lsblk -f',
      'df -i',
      'fdisk -t',
      'mount --tree'
    ),
    correct: ['a'],
    explanation: '`lsblk -f` lists block devices in a tree with FSTYPE, LABEL, UUID, and MOUNTPOINTS. `df -i` shows inode usage of mounted file systems, `fdisk -t` is not valid, and `mount --tree` is not a real option.',
    references: [REF_STORAGE]
  },
  {
    domain: STORAGE, difficulty: 4, type: QType.SINGLE,
    stem: 'You want a VDO-style deduplicated/compressed volume in RHEL 9. Which approach is supported in RHEL 9?',
    options: opts4(
      'Create an LVM VDO logical volume (`lvcreate --type vdo`) on a volume group',
      'Run `vdo create` from the standalone vdo package, which is the only RHEL 9 method',
      'Use `mkfs.vdo /dev/vdb` directly',
      'VDO is not available on RHEL 9 at all'
    ),
    correct: ['a'],
    explanation: 'In RHEL 9 VDO is integrated with LVM — you create it as an LVM VDO LV (`lvcreate --type vdo`). The standalone `vdo` command from RHEL 8 is no longer the supported path, `mkfs.vdo` is not a command, and VDO IS available (just LVM-managed).',
    references: [REF_LVM]
  },
  {
    domain: STORAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'To make a newly created swap LV `/dev/vg01/lvswap` activate automatically at every boot, you should:',
    options: opts4(
      'Add a line `/dev/vg01/lvswap none swap defaults 0 0` to /etc/fstab',
      'Run `swapon` once and rely on it persisting',
      'Add the device to /etc/crypttab',
      'Create a systemd timer that runs swapon'
    ),
    correct: ['a'],
    explanation: 'An `/etc/fstab` entry with fs type `swap` and mountpoint `none` makes the swap area persistent across reboots. A one-off `swapon` does not persist, `/etc/crypttab` is for encrypted devices, and a timer is unnecessary and non-standard.',
    references: [REF_STORAGE]
  },

  // ── Create and Configure File Systems (3) ──
  {
    domain: FILESYS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'After adding a new line to `/etc/fstab`, which command mounts ALL listed file systems that are not yet mounted, letting you validate the entry without rebooting?',
    options: opts4(
      'mount -a',
      'mount --remount /',
      'systemctl daemon-reexec',
      'umount -a'
    ),
    correct: ['a'],
    explanation: '`mount -a` attempts to mount every fstab entry not already mounted — the standard way to test new entries safely. `--remount /` only re-applies root options, `daemon-reexec` re-executes systemd, and `umount -a` unmounts everything.',
    references: [REF_FS]
  },
  {
    domain: FILESYS, difficulty: 3, type: QType.SINGLE,
    stem: 'You must mount the NFS export `nfs.example.com:/exports/data` at `/mnt/data` right now for testing. Which command does this?',
    options: opts4(
      'mount -t nfs nfs.example.com:/exports/data /mnt/data',
      'mount -t xfs nfs.example.com:/exports/data /mnt/data',
      'mount --nfs /exports/data /mnt/data',
      'nfs-mount nfs.example.com /mnt/data'
    ),
    correct: ['a'],
    explanation: '`mount -t nfs server:/export /mountpoint` is the correct syntax (requires the `nfs-utils` package). `xfs` is the wrong type for a network export, and `--nfs` / `nfs-mount` are not valid commands.',
    references: [REF_NFS]
  },
  {
    domain: FILESYS, difficulty: 3, type: QType.SINGLE,
    stem: 'Which command sets a DEFAULT ACL on directory `/data/projects` so that newly created files inherit read access for group `team`?',
    options: opts4(
      'setfacl -m d:g:team:r-- /data/projects',
      'setfacl -m g:team:r-- /data/projects',
      'chmod g+s /data/projects',
      'chacl team:r /data/projects'
    ),
    correct: ['a'],
    explanation: 'The `d:` prefix denotes a DEFAULT ACL entry, which new files/dirs inherit. Without `d:` it is only an access ACL on the directory itself. `chmod g+s` sets the setgid bit (group inheritance, not ACL), and `chacl` is not standard on RHEL.',
    references: [REF_FS]
  },

  // ── Deploy, Configure, and Maintain Systems (4) ──
  {
    domain: DEPLOY, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command lists all installed packages whose name contains "kernel"?',
    options: opts4(
      'dnf list installed | grep kernel',
      'dnf remove kernel',
      'rpm --search kernel',
      'dnf info --all kernel'
    ),
    correct: ['a'],
    explanation: '`dnf list installed` enumerates installed packages; piping to `grep kernel` filters by name. `dnf remove` would uninstall, `rpm --search` is not a valid option, and `dnf info --all` is not the right query form.',
    references: [REF_DNF]
  },
  {
    domain: DEPLOY, difficulty: 3, type: QType.SINGLE,
    stem: 'You need to add an extra NTP server `time.example.com` to chrony and apply it. Which steps are correct on RHEL 9?',
    options: opts4(
      'Add `server time.example.com iburst` to /etc/chrony.conf, then `systemctl restart chronyd`',
      'Add the server to /etc/ntp.conf, then `systemctl restart ntpd`',
      'Run `chronyc add time.example.com` which is permanent by itself',
      'Edit /etc/resolv.conf to add the time server'
    ),
    correct: ['a'],
    explanation: 'chrony reads `/etc/chrony.conf`; adding a `server ... iburst` line and restarting `chronyd` applies it persistently. RHEL 9 uses chrony (not ntpd/ntp.conf), `chronyc add` changes are runtime-only, and `/etc/resolv.conf` is for DNS.',
    references: [REF_CHRONY]
  },
  {
    domain: DEPLOY, difficulty: 3, type: QType.SINGLE,
    stem: 'Which command pulls the `registry.access.redhat.com/ubi9/ubi` image and runs an interactive rootless container with a bash shell?',
    options: opts4(
      'podman run -it registry.access.redhat.com/ubi9/ubi /bin/bash',
      'podman pull --run ubi9 bash',
      'docker exec -it ubi9 bash',
      'podman create ubi9 --shell'
    ),
    correct: ['a'],
    explanation: '`podman run -it <image> /bin/bash` pulls the image if absent and starts an interactive (`-i -t`) container — rootless by default for a normal user. `podman pull --run` is invalid, `docker exec` attaches to an EXISTING container, and `podman create` does not start it.',
    references: [REF_PODMAN]
  },
  {
    domain: DEPLOY, difficulty: 3, type: QType.SINGLE,
    stem: 'A rootless container must keep running after the user logs out and start at system boot. Besides a generated systemd user unit, which command enables this?',
    options: opts4(
      'loginctl enable-linger <username>',
      'systemctl enable getty@tty1',
      'usermod -s /sbin/nologin <username>',
      'podman run --keep-alive'
    ),
    correct: ['a'],
    explanation: '`loginctl enable-linger <user>` lets that user\'s systemd user instance (and its containers) run without an active login and start at boot. The getty unit is unrelated, `nologin` would block login entirely, and `--keep-alive` is not a podman option.',
    references: [REF_PODMAN]
  },

  // ── Manage Users and Groups (2) ──
  {
    domain: USERS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command locks the account of user `dan` so he cannot log in with a password, without deleting the account?',
    options: opts4(
      'usermod -L dan',
      'userdel dan',
      'passwd -d dan',
      'chage -E -1 dan'
    ),
    correct: ['a'],
    explanation: '`usermod -L` (or `passwd -l`) locks the account by disabling the password hash. `userdel` deletes the account, `passwd -d` REMOVES the password (allowing empty-password login depending on PAM), and `chage -E -1` removes account expiry — the opposite effect.',
    references: [REF_USERS]
  },
  {
    domain: USERS, difficulty: 3, type: QType.SINGLE,
    stem: 'You want all NEW users to receive a 60-day maximum password age by default. Which file should you configure?',
    options: opts4(
      '/etc/login.defs (set PASS_MAX_DAYS 60)',
      '/etc/passwd',
      '/etc/shells',
      '/etc/profile'
    ),
    correct: ['a'],
    explanation: '`/etc/login.defs` defines defaults like `PASS_MAX_DAYS` applied to newly created accounts. `/etc/passwd` lists accounts (no aging policy), `/etc/shells` lists valid shells, and `/etc/profile` is a login shell script.',
    references: [REF_USERS]
  },

  // ── Manage Security (2) ──
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command shows the CURRENT SELinux mode (enforcing, permissive, or disabled)?',
    options: opts4(
      'getenforce',
      'setenforce',
      'sestatus --set',
      'selinuxctl mode'
    ),
    correct: ['a'],
    explanation: '`getenforce` prints the current mode; `sestatus` also shows it with more detail. `setenforce` CHANGES the mode (0/1), `sestatus --set` is invalid, and `selinuxctl` is not a command.',
    references: [REF_SELINUX]
  },
  {
    domain: SECURITY, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'You moved a web app to a non-standard document root `/web` and Apache (SELinux enforcing) is denied access. Which command persistently labels `/web` (and below) with the correct context so it survives a relabel?',
    options: opts4(
      'semanage fcontext -a -t httpd_sys_content_t "/web(/.*)?" ; restorecon -Rv /web',
      'chcon -t httpd_sys_content_t /web only',
      'setenforce 0',
      'restorecon -Rv /web only'
    ),
    correct: ['a'],
    explanation: '`semanage fcontext -a` records the context rule in policy so it is PERSISTENT, then `restorecon` applies it. `chcon` alone changes the label but is lost on a full relabel, `restorecon` alone has no rule to apply for a custom path, and `setenforce 0` just disables enforcement.',
    references: [REF_SELINUX]
  },

  // ── Understand and Use Essential Tools (+7 → 10) ──
  {
    domain: TOOLS, difficulty: 1, type: QType.TRUE_FALSE,
    stem: 'The command `mkdir -p /srv/app/conf` creates any missing parent directories and does not error if the path already exists.',
    options: tf(),
    correct: ['a'],
    explanation: '`mkdir -p` creates intermediate parent directories as needed and exits successfully even when the directory already exists, so the statement is true.',
    references: [REF_SHELL]
  },
  {
    domain: TOOLS, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command moves and renames the file `old.txt` to `/tmp/new.txt`?',
    options: opts4(
      'mv old.txt /tmp/new.txt',
      'cp old.txt /tmp/new.txt',
      'rename old.txt /tmp/new.txt',
      'mv -c old.txt /tmp/new.txt'
    ),
    correct: ['a'],
    explanation: '`mv old.txt /tmp/new.txt` relocates and renames in a single operation, removing the source. `cp` would leave the original behind, the `rename` syntax shown is not the move idiom, and `mv -c` is not a valid option.',
    references: [REF_SHELL]
  },
  {
    domain: TOOLS, difficulty: 3, type: QType.SINGLE,
    stem: 'Which command searches the entire filesystem for files literally named `core` (regular files) starting from `/`?',
    options: opts4(
      'find / -type f -name core',
      'find / -name -type f core',
      'locate -type f core',
      'grep -r core /'
    ),
    correct: ['a'],
    explanation: '`find / -type f -name core` walks from `/` matching regular files named exactly `core`. The second option misorders find arguments, `locate` has no `-type`, and `grep -r` searches file CONTENTS rather than names.',
    references: [REF_SHELL]
  },
  {
    domain: TOOLS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command shows the last 20 lines of `/var/log/secure`?',
    options: opts4(
      'tail -n 20 /var/log/secure',
      'head -n 20 /var/log/secure',
      'cat -20 /var/log/secure',
      'less +20 /var/log/secure'
    ),
    correct: ['a'],
    explanation: '`tail -n 20` prints the final 20 lines. `head -n 20` shows the FIRST 20, `cat -20` is invalid, and `less +20` jumps to line 20 but does not limit output to 20 lines.',
    references: [REF_SHELL]
  },
  {
    domain: TOOLS, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about getting help on RHEL 9 commands.',
    options: opts4(
      '`man 5 crontab` opens the file-format (section 5) man page for crontab.',
      '`command --help` typically prints a brief usage summary.',
      '`apropos copy` searches man page descriptions for the word "copy".',
      '`man -k` is unrelated to keyword searching.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Man sections can be requested explicitly (`man 5 crontab`), most tools support `--help`, and `apropos` searches man descriptions. `man -k` is actually the SAME as `apropos` (keyword search), so option D is false.',
    references: [REF_SHELL]
  },
  {
    domain: TOOLS, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command securely copies the local directory `site/` recursively to `/var/www/` on remote host `web1` as user `deploy`?',
    options: opts4(
      'scp -r site/ deploy@web1:/var/www/',
      'scp site/ deploy@web1:/var/www/',
      'cp -r site/ deploy@web1:/var/www/',
      'scp -R deploy@web1 site/ /var/www/'
    ),
    correct: ['a'],
    explanation: '`scp -r` copies directories recursively over SSH to `user@host:/path`. Without `-r` scp refuses a directory, `cp` is local-only, and `-R` (uppercase) is not the scp recurse flag and the argument order is wrong.',
    references: [REF_SHELL]
  },
  {
    domain: TOOLS, difficulty: 4, type: QType.SINGLE,
    stem: 'Which command pipeline shows the 5 largest entries (by size) directly under `/var` in human-readable form?',
    options: opts4(
      'du -sh /var/* | sort -rh | head -n 5',
      'du -sh /var/* | sort -n | tail -n 5',
      'ls -lS /var | head -5',
      'df -h /var/* | sort -r | head -5'
    ),
    correct: ['a'],
    explanation: '`du -sh /var/*` sizes each entry, `sort -rh` sorts human-readable sizes in reverse (largest first), and `head -n 5` keeps the top five. `sort -n` mis-sorts suffixed sizes, `ls -lS` does not sum directory trees, and `df` reports file systems.',
    references: [REF_SHELL]
  },

  // ── Operate Running Systems (+7 → 10) ──
  {
    domain: OPERATE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command reloads the configuration of the running `nginx` service WITHOUT fully restarting it (if the unit supports reload)?',
    options: opts4(
      'systemctl reload nginx',
      'systemctl restart nginx',
      'systemctl refresh nginx',
      'systemctl reexec nginx'
    ),
    correct: ['a'],
    explanation: '`systemctl reload nginx` triggers the unit\'s ExecReload (re-read config, keep the process). `restart` stops and starts (drops connections), and `refresh`/`reexec` are not valid per-service actions.',
    references: [REF_SYSTEMD]
  },
  {
    domain: OPERATE, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command prevents the `bluetooth` service from being started either manually OR automatically (the strongest disable)?',
    options: opts4(
      'systemctl mask bluetooth',
      'systemctl disable bluetooth',
      'systemctl stop bluetooth',
      'systemctl freeze bluetooth'
    ),
    correct: ['a'],
    explanation: '`systemctl mask` links the unit to `/dev/null` so it cannot be started by any means until unmasked. `disable` only removes boot enablement (manual start still works), `stop` is temporary, and `freeze` suspends a running unit\'s processes.',
    references: [REF_SYSTEMD]
  },
  {
    domain: OPERATE, difficulty: 3, type: QType.SINGLE,
    stem: 'Which command sends SIGHUP (often used to reload config) to the process with PID 990?',
    options: opts4(
      'kill -HUP 990',
      'kill -9 990',
      'kill -SIGKILL 990',
      'kill --reload 990'
    ),
    correct: ['a'],
    explanation: '`kill -HUP 990` (or `kill -1 990`) sends SIGHUP, which many daemons treat as "reload configuration". `-9`/`-SIGKILL` force-kill the process, and `--reload` is not a valid kill option.',
    references: [REF_SHELL]
  },
  {
    domain: OPERATE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command shows the boot target the system will boot into by default?',
    options: opts4(
      'systemctl get-default',
      'systemctl default',
      'systemctl is-default',
      'runlevel --default'
    ),
    correct: ['a'],
    explanation: '`systemctl get-default` prints the unit the `default.target` symlink points to. `systemctl default` switches to that target now, `is-default` is not a command, and `runlevel` reports the current/previous runlevel only.',
    references: [REF_SYSTEMD]
  },
  {
    domain: OPERATE, difficulty: 3, type: QType.SINGLE,
    stem: 'Which command filters the journal to show only messages for the `sshd` unit since today?',
    options: opts4(
      'journalctl -u sshd --since today',
      'journalctl sshd --today',
      'journalctl -f sshd',
      'journalctl --unit=sshd --recent'
    ),
    correct: ['a'],
    explanation: 'Combining `-u sshd` (unit filter) with `--since today` limits output to today\'s sshd entries. `journalctl sshd` treats sshd as a path, `-f` follows new entries, and `--recent` is not a valid option.',
    references: [REF_SYSTEMD]
  },
  {
    domain: OPERATE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about controlling services with systemctl on RHEL 9.',
    options: opts4(
      '`systemctl enable <unit>` creates the symlinks so the unit starts at boot.',
      '`systemctl start <unit>` starts the unit immediately for this session.',
      '`systemctl is-enabled <unit>` reports whether the unit starts at boot.',
      '`systemctl enable <unit>` also starts the unit immediately.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: '`enable` sets boot-time symlinks, `start` activates now, and `is-enabled` queries boot status. `enable` does NOT start the unit unless you add `--now`, so option D is false.',
    references: [REF_SYSTEMD]
  },
  {
    domain: OPERATE, difficulty: 4, type: QType.SINGLE,
    stem: 'A system boots to a black screen and you suspect a bad service. Which kernel argument added at the GRUB prompt boots into a minimal single-user-like environment for repair?',
    options: opts4(
      'systemd.unit=rescue.target',
      'systemd.unit=graphical.target',
      'init=/usr/lib/systemd/systemd-graphical',
      'runlevel=5'
    ),
    correct: ['a'],
    explanation: 'Appending `systemd.unit=rescue.target` boots a minimal maintenance environment (root shell, basic mounts) ideal for repairs. `graphical.target` is the full GUI, the `init=` path is invalid, and `runlevel=5` is legacy syntax not used by systemd.',
    references: [REF_BOOT]
  },

  // ── Configure Local Storage (+7 → 10) ──
  {
    domain: STORAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command lists all logical volumes with their volume group and size?',
    options: opts4(
      'lvs',
      'lvcreate --show',
      'vgs --lv',
      'pvdisplay -l'
    ),
    correct: ['a'],
    explanation: '`lvs` prints a terse list of logical volumes (LV, VG, size, attributes); `lvdisplay` gives the verbose form. `lvcreate --show`, `vgs --lv`, and `pvdisplay -l` are not valid for listing LVs.',
    references: [REF_LVM]
  },
  {
    domain: STORAGE, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'You need to add a 1 GiB swap FILE (not a partition) at `/swapfile`. Which sequence is correct?',
    options: opts4(
      'dd if=/dev/zero of=/swapfile bs=1M count=1024 ; chmod 600 /swapfile ; mkswap /swapfile ; swapon /swapfile',
      'touch /swapfile ; swapon /swapfile',
      'mkswap -f /swapfile 1G ; mount /swapfile',
      'fallocate /swapfile ; mkfs.swap /swapfile'
    ),
    correct: ['a'],
    explanation: 'Allocate the file (dd or fallocate), tighten permissions to 600, run `mkswap` to write the signature, then `swapon`. An empty/touched file has no swap signature, `mkswap -f ... 1G`/`mkfs.swap` are wrong, and swap is not mounted.',
    references: [REF_STORAGE]
  },
  {
    domain: STORAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'Which command scans all disks and activates any volume groups it finds (useful after attaching disks from another system)?',
    options: opts4(
      'vgscan ; vgchange -a y',
      'pvcreate --scan',
      'lvscan --activate-all',
      'vgimport --auto'
    ),
    correct: ['a'],
    explanation: '`vgscan` discovers VGs on attached disks and `vgchange -a y` activates them so their LVs become available. `pvcreate --scan` would (wrongly) try to initialize PVs, and the other options are not valid activation commands.',
    references: [REF_LVM]
  },
  {
    domain: STORAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'Using `parted` interactively, which command sequence creates a new 2 GiB primary partition starting at 1 MiB on a GPT-labelled disk?',
    options: opts4(
      'mkpart primary 1MiB 2049MiB',
      'mklabel primary 2GiB',
      'mkfs primary 1 2049',
      'addpart 1MiB 2GiB primary'
    ),
    correct: ['a'],
    explanation: 'In `parted`, `mkpart <name> <start> <end>` defines a partition; starting at 1MiB and ending at 2049MiB yields ~2 GiB. `mklabel` writes a partition TABLE, `mkfs` (in parted) is deprecated/unsafe, and `addpart` is not a parted command.',
    references: [REF_STORAGE]
  },
  {
    domain: STORAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command shows total, used, and free swap along with RAM usage in megabytes?',
    options: opts4(
      'free -m',
      'df -m',
      'vmstat --swap',
      'swapon -m'
    ),
    correct: ['a'],
    explanation: '`free -m` reports memory and swap totals/used/free in MiB. `df` reports disk file systems, `vmstat --swap` is not valid syntax, and `swapon -m` is not a valid option.',
    references: [REF_STORAGE]
  },
  {
    domain: STORAGE, difficulty: 4, type: QType.SINGLE,
    stem: 'You created an LVM VDO volume `vdo0` in VG `vgvdo`. Which command formats it with XFS so VDO discard works correctly?',
    options: opts4(
      'mkfs.xfs -K /dev/vgvdo/vdo0',
      'mkfs.xfs /dev/vgvdo/vdo0 with full discard',
      'mkfs.vdo /dev/vgvdo/vdo0',
      'mkfs.ext4 -E nodiscard /dev/vgvdo/vdo0'
    ),
    correct: ['a'],
    explanation: 'Use `mkfs.xfs -K` (do NOT discard blocks at mkfs time) on a VDO device so the thin-provisioned space is not prematurely consumed by a full discard. `mkfs.vdo` is not a command, and forcing a full discard defeats VDO\'s space savings.',
    references: [REF_LVM]
  },
  {
    domain: STORAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'Which command removes a Stratis file system `fs1` from pool `pool1`?',
    options: opts4(
      'stratis filesystem destroy pool1 fs1',
      'stratis fs delete fs1',
      'stratis pool remove fs1',
      'lvremove pool1/fs1'
    ),
    correct: ['a'],
    explanation: '`stratis filesystem destroy <pool> <fs>` deletes the named Stratis file system. The other forms use invalid Stratis syntax, and Stratis file systems are not managed with `lvremove`.',
    references: [REF_STORAGE]
  },

  // ── Create and Configure File Systems (+7 → 10) ──
  {
    domain: FILESYS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which `/etc/fstab` field order is correct?',
    options: opts4(
      'device  mountpoint  fstype  options  dump  pass',
      'mountpoint  device  options  fstype  pass  dump',
      'fstype  device  mountpoint  dump  options  pass',
      'device  fstype  options  mountpoint  pass  dump'
    ),
    correct: ['a'],
    explanation: 'The six fstab fields are: file system (device/UUID), mount point, type, options, dump frequency, and fsck pass order — in that exact sequence. The other orderings are incorrect.',
    references: [REF_FS]
  },
  {
    domain: FILESYS, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which mount option in `/etc/fstab` causes the file system to be mounted automatically at boot (the default behavior you would explicitly state)?',
    options: opts4(
      'auto',
      'noauto',
      'user',
      'bind'
    ),
    correct: ['a'],
    explanation: '`auto` (part of `defaults`) means the file system is mounted by `mount -a`/at boot. `noauto` explicitly EXCLUDES it from automatic mounting, `user` permits unprivileged mounting, and `bind` creates a bind mount.',
    references: [REF_FS]
  },
  {
    domain: FILESYS, difficulty: 3, type: QType.SINGLE,
    stem: 'Which command extends an already-mounted XFS file system after its underlying LV was grown?',
    options: opts4(
      'xfs_growfs /mountpoint',
      'resize2fs /mountpoint',
      'xfs_admin -g /mountpoint',
      'mkfs.xfs --grow /mountpoint'
    ),
    correct: ['a'],
    explanation: '`xfs_growfs <mountpoint>` grows a mounted XFS file system to fill the enlarged device. `resize2fs` is for ext2/3/4, `xfs_admin -g` is not a grow option, and re-running `mkfs.xfs` would destroy the data.',
    references: [REF_FS]
  },
  {
    domain: FILESYS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command creates a bind mount so that `/data/www` also appears at `/var/www/html`?',
    options: opts4(
      'mount --bind /data/www /var/www/html',
      'mount -t bind /data/www /var/www/html',
      'ln -s /data/www /var/www/html',
      'mount --rbind=/data/www /var/www/html'
    ),
    correct: ['a'],
    explanation: '`mount --bind <src> <dst>` makes the source directory tree accessible at the destination. `-t bind` is not the correct syntax, a symlink is not a mount, and `--rbind=` is malformed (recursive bind is `--rbind src dst`).',
    references: [REF_FS]
  },
  {
    domain: FILESYS, difficulty: 3, type: QType.SINGLE,
    stem: 'Which command removes ALL ACL entries from the file `/srv/report`, leaving only the standard permission bits?',
    options: opts4(
      'setfacl -b /srv/report',
      'setfacl -x /srv/report',
      'getfacl -r /srv/report',
      'chmod -A /srv/report'
    ),
    correct: ['a'],
    explanation: '`setfacl -b` removes all extended ACL entries (keeping the base owner/group/other bits). `-x` removes a SPECIFIC entry (and needs an entry argument), `getfacl` only displays, and `chmod -A` is not valid.',
    references: [REF_FS]
  },
  {
    domain: FILESYS, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'You must mount NFS share `srv:/share` with NFSv4.2 explicitly. Which mount option selects that version?',
    options: opts4(
      'mount -t nfs -o vers=4.2 srv:/share /mnt/share',
      'mount -t nfs -o nfs4.2 srv:/share /mnt/share',
      'mount -t nfs42 srv:/share /mnt/share',
      'mount -t nfs -o version=4.2 srv:/share /mnt/share'
    ),
    correct: ['a'],
    explanation: 'The mount option `vers=4.2` (or `nfsvers=4.2`) selects the NFS protocol version. `nfs4.2`, the `nfs42` type, and `version=4.2` are not recognized by `mount.nfs`.',
    references: [REF_NFS]
  },
  {
    domain: FILESYS, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL true statements about XFS vs ext4 on RHEL 9.',
    options: opts4(
      'XFS is the default file system for RHEL 9 root installations.',
      'XFS can be grown online but cannot be shrunk.',
      'ext4 can be both grown and shrunk (offline for shrink).',
      'XFS file systems are checked and repaired with `fsck.ext4`.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'RHEL defaults to XFS, which grows online but cannot shrink; ext4 supports both grow and (offline) shrink. XFS is repaired with `xfs_repair`, not `fsck.ext4`, so option D is false.',
    references: [REF_FS]
  },

  // ── Deploy, Configure, and Maintain Systems (+9 → 13) ──
  {
    domain: DEPLOY, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command searches DNF repositories for packages whose name or summary mentions "nginx"?',
    options: opts4(
      'dnf search nginx',
      'dnf find nginx',
      'rpm -qa | dnf nginx',
      'dnf lookup nginx'
    ),
    correct: ['a'],
    explanation: '`dnf search nginx` queries repository metadata for matching package names/summaries. `dnf find`, `dnf lookup`, and the piped `rpm`/`dnf` form are not valid commands.',
    references: [REF_DNF]
  },
  {
    domain: DEPLOY, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'You added a repo definition by creating a `.repo` file under `/etc/yum.repos.d/`. Which command lists it among the configured repositories?',
    options: opts4(
      'dnf repolist --all',
      'dnf addrepo --list',
      'dnf config --show-repos',
      'rpm -q repos'
    ),
    correct: ['a'],
    explanation: '`dnf repolist --all` lists every configured repository (enabled and disabled), including newly added `.repo` files. `dnf addrepo --list`, `dnf config --show-repos`, and `rpm -q repos` are not valid.',
    references: [REF_DNF]
  },
  {
    domain: DEPLOY, difficulty: 3, type: QType.SINGLE,
    stem: 'Which command resets the `nodejs` module so a different stream can be installed cleanly?',
    options: opts4(
      'dnf module reset nodejs',
      'dnf module clear nodejs',
      'dnf module disable nodejs --stream',
      'dnf reset module nodejs'
    ),
    correct: ['a'],
    explanation: '`dnf module reset nodejs` clears the enabled-stream state so you can enable/install a different stream without conflicts. `dnf module clear`, `disable ... --stream`, and `dnf reset module` are not valid forms.',
    references: [REF_DNF]
  },
  {
    domain: DEPLOY, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command brings the network connection profile `ens3` up using NetworkManager?',
    options: opts4(
      'nmcli con up ens3',
      'nmcli con start ens3',
      'ifconfig ens3 up only',
      'systemctl start ens3'
    ),
    correct: ['a'],
    explanation: '`nmcli con up ens3` activates the connection profile. `nmcli con start` is not a valid subcommand, `ifconfig ... up` is deprecated and bypasses NetworkManager, and `ens3` is not a systemd unit.',
    references: [REF_NET]
  },
  {
    domain: DEPLOY, difficulty: 3, type: QType.SINGLE,
    stem: 'Which command lists the available kernel command-line arguments currently applied to the running kernel?',
    options: opts4(
      'cat /proc/cmdline',
      'grubby --running',
      'sysctl kernel.cmdline',
      'dmesg --cmdline'
    ),
    correct: ['a'],
    explanation: '`/proc/cmdline` contains the exact arguments the running kernel was booted with. `grubby --running` is not an option, there is no `kernel.cmdline` sysctl, and `dmesg --cmdline` is not valid.',
    references: [REF_BOOT]
  },
  {
    domain: DEPLOY, difficulty: 4, type: QType.SINGLE,
    stem: 'After `rd.break` and resetting root\'s password on RHEL 9 with SELinux enforcing, which step ensures the system relabels and boots correctly?',
    options: opts4(
      'touch /.autorelabel before rebooting',
      'Run `setenforce 0` from the initramfs',
      'Delete /etc/selinux/config',
      'Run `restorecon /etc/shadow` only'
    ),
    correct: ['a'],
    explanation: 'Creating `/.autorelabel` triggers a full SELinux relabel on the next boot so the modified `/etc/shadow` gets the correct context (otherwise login may fail). Disabling SELinux or deleting its config is incorrect, and relabeling only `/etc/shadow` from initramfs is impractical.',
    references: [REF_BOOT]
  },
  {
    domain: DEPLOY, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command stops and removes a running rootless container named `web`?',
    options: opts4(
      'podman stop web ; podman rm web',
      'podman delete web',
      'podman rm -running web',
      'podman kill --remove web'
    ),
    correct: ['a'],
    explanation: 'Stop the container first (`podman stop web`) then remove it (`podman rm web`); `podman rm -f web` also force-removes a running one. `podman delete`, `rm -running`, and `kill --remove` are not valid commands/options.',
    references: [REF_PODMAN]
  },
  {
    domain: DEPLOY, difficulty: 3, type: QType.SINGLE,
    stem: 'Which command persists environment variables and a restart policy by generating a systemd unit from an existing container `app`?',
    options: opts4(
      'podman generate systemd --name app --new --files',
      'podman systemd create app',
      'systemctl generate app',
      'podman export --systemd app'
    ),
    correct: ['a'],
    explanation: '`podman generate systemd --name app --new --files` writes a unit file (the `--new` form recreates the container on start) suitable for `systemctl --user`. `podman systemd create`, `systemctl generate`, and `podman export --systemd` are not valid.',
    references: [REF_PODMAN]
  },
  {
    domain: DEPLOY, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about DNF modules on RHEL 9.',
    options: opts4(
      'A module can provide multiple streams representing different versions.',
      '`dnf module enable name:stream` enables a stream without installing packages.',
      'Only one stream of a given module can be enabled at a time.',
      'Modules cannot define installation profiles.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Modules expose multiple streams (versions), `dnf module enable` selects a stream without installing, and only one stream per module is active at once. Modules DO define profiles (e.g. minimal/default/devel), so option D is false.',
    references: [REF_DNF]
  },

  // ── Manage Users and Groups (+4 → 6) ──
  {
    domain: USERS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command displays the UID, primary GID, and group memberships of the user `hugo`?',
    options: opts4(
      'id hugo',
      'who hugo',
      'finger -u hugo',
      'getent uid hugo'
    ),
    correct: ['a'],
    explanation: '`id hugo` prints uid, gid, and the list of groups. `who` shows logged-in users, `finger` is not installed by default and the option shown is wrong, and `getent uid` is not a valid database name (use `getent passwd hugo`).',
    references: [REF_USERS]
  },
  {
    domain: USERS, difficulty: 3, type: QType.SINGLE,
    stem: 'Which command sets an absolute account-expiration date of 2026-12-31 for user `iris`?',
    options: opts4(
      'chage -E 2026-12-31 iris',
      'usermod -e 2026-12-31',
      'passwd -x 2026-12-31 iris',
      'chage -d 2026-12-31 iris'
    ),
    correct: ['a'],
    explanation: '`chage -E 2026-12-31 iris` sets the date the account becomes unusable (`usermod -e <date> iris` is equivalent but the option B form omits the username). `passwd -x` sets max password age, and `chage -d` sets the LAST password-change date.',
    references: [REF_USERS]
  },
  {
    domain: USERS, difficulty: 3, type: QType.SINGLE,
    stem: 'Which command removes user `jack` from the supplementary group `developers` without affecting his other groups?',
    options: opts4(
      'gpasswd -d jack developers',
      'usermod -G developers jack',
      'groupdel developers',
      'usermod -r jack developers'
    ),
    correct: ['a'],
    explanation: '`gpasswd -d jack developers` removes jack from that one group only. `usermod -G developers jack` would REPLACE all his supplementary groups with just `developers`, `groupdel` deletes the group entirely, and `usermod -r` is not valid here.',
    references: [REF_USERS]
  },
  {
    domain: USERS, difficulty: 4, type: QType.SINGLE,
    stem: 'You must require ALL users to change their password every 90 days, warn 7 days before, and you want to apply it to the EXISTING user `kate`. Which command does this for kate?',
    options: opts4(
      'chage -M 90 -W 7 kate',
      'chage -d 90 -W 7 kate',
      'passwd -n 90 -w 7 kate',
      'usermod -M 90 -W 7 kate'
    ),
    correct: ['a'],
    explanation: '`chage -M 90 -W 7 kate` sets the maximum password age to 90 days and the warning period to 7 days for the existing user. `-d` sets last-change date, `passwd -n` sets MINIMUM age, and `usermod` has no `-M 90 -W 7` aging options.',
    references: [REF_USERS]
  },

  // ── Manage Security (+4 → 6) ──
  {
    domain: SECURITY, difficulty: 2, type: QType.TRUE_FALSE, isTeaser: true,
    stem: 'The persistent boot-time SELinux mode is configured via the `SELINUX=` directive in `/etc/selinux/config`.',
    options: tf(),
    correct: ['a'],
    explanation: 'The `SELINUX=` line in `/etc/selinux/config` (often symlinked from `/etc/sysconfig/selinux`) sets the mode applied at every boot, whereas `setenforce` only changes it at runtime. The statement is true.',
    references: [REF_SELINUX]
  },
  {
    domain: SECURITY, difficulty: 3, type: QType.SINGLE,
    stem: 'Which command temporarily changes the SELinux context (type) of the file `/web/index.html` to `httpd_sys_content_t` for testing?',
    options: opts4(
      'chcon -t httpd_sys_content_t /web/index.html',
      'semanage fcontext -t httpd_sys_content_t /web/index.html',
      'restorecon -t httpd_sys_content_t /web/index.html',
      'setsebool httpd_sys_content_t on'
    ),
    correct: ['a'],
    explanation: '`chcon -t` changes the type label immediately but is NOT persistent across a full relabel (use `semanage fcontext` + `restorecon` for permanence). `restorecon` has no `-t`, and `setsebool` toggles booleans, not file types.',
    references: [REF_SELINUX]
  },
  {
    domain: SECURITY, difficulty: 3, type: QType.SINGLE,
    stem: 'Which command removes the `http` service from the permanent firewalld configuration of the default zone and applies it?',
    options: opts4(
      'firewall-cmd --permanent --remove-service=http ; firewall-cmd --reload',
      'firewall-cmd --remove-service=http (only)',
      'firewall-cmd --permanent --delete=http',
      'firewall-cmd --disable http'
    ),
    correct: ['a'],
    explanation: '`--permanent --remove-service=http` then `--reload` permanently revokes the rule. Without `--permanent` the change is lost on reload, and `--delete`/`--disable` are not valid firewalld options for services.',
    references: [REF_FW]
  },
  {
    domain: SECURITY, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL true statements about SELinux troubleshooting on RHEL 9.',
    options: opts4(
      'AVC denial messages are recorded by auditd (e.g. in /var/log/audit/audit.log).',
      '`ausearch -m avc -ts recent` can surface recent SELinux denials.',
      'Switching to permissive mode logs denials without blocking access.',
      'Permissive mode is the recommended permanent fix for SELinux denials.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'AVC denials go to the audit log, `ausearch -m avc` finds them, and permissive mode logs without enforcing — useful for diagnosis. Leaving SELinux permanently permissive is NOT a recommended fix (correct the contexts/booleans instead), so option D is false.',
    references: [REF_SELINUX]
  }
];

const RHCSA_DOMAINS = [
  { name: TOOLS, weight: 15 },
  { name: OPERATE, weight: 15 },
  { name: STORAGE, weight: 15 },
  { name: FILESYS, weight: 15 },
  { name: DEPLOY, weight: 20 },
  { name: USERS, weight: 10 },
  { name: SECURITY, weight: 10 }
];

const RHCSA_EXAMS: { slug: string; code: string; titleSuffix: string; descriptionSuffix: string; questions: Q[] }[] = [
  {
    slug: 'redhat-rhcsa-ex200-p1',
    code: 'RHCSA-P1',
    titleSuffix: 'Practice Exam 1',
    descriptionSuffix: 'Practice exam 1 of 3 — full 150-minute, 65-question, blueprint-weighted set covering essential tools, running systems, local storage, file systems, system deployment & maintenance, users & groups, and security on RHEL 9.',
    questions: P1
  },
  {
    slug: 'redhat-rhcsa-ex200-p2',
    code: 'RHCSA-P2',
    titleSuffix: 'Practice Exam 2',
    descriptionSuffix: 'Practice exam 2 of 3 — a second 150-minute, 65-question, blueprint-weighted set.',
    questions: P2
  },
  {
    slug: 'redhat-rhcsa-ex200-p3',
    code: 'RHCSA-P3',
    titleSuffix: 'Practice Exam 3',
    descriptionSuffix: 'Practice exam 3 of 3 — a third 150-minute, 65-question, blueprint-weighted set.',
    questions: P3
  }
];

const RHCSA_BUNDLE = {
  slug: 'redhat-rhcsa-ex200',
  title: 'Red Hat Certified System Administrator (RHCSA EX200)',
  description: 'All 3 RHCSA EX200 practice exams in one bundle — covering essential tools, operating running systems, local storage, file systems, system deployment/configuration/maintenance, user & group management, and security, aligned to the official Red Hat EX200 objectives on RHEL 9.',
  price: 2000, // USD 20 — PRACTICE tier
  priceVoucher: 50000 // USD 500 — VOUCHER tier (matches RHCSA real-exam fee)
};

type SeedResult = {
  vendor: 'created' | 'updated';
  exams: { slug: string; questionCount: number; teaserCount: number }[];
  bundle: 'created' | 'updated';
};

/**
 * Idempotent seed for the RHCSA bundle. Safe to call repeatedly — vendor /
 * exam / bundle rows are upserted, and questions tagged
 * `generatedBy: 'manual:rhcsa-seed'` are deleted and re-created.
 *
 * Pass an existing PrismaClient (lifecycle managed by caller).
 */
export async function seedRhcsa(db: PrismaClient): Promise<SeedResult> {
  const existingVendor = await db.vendor.findUnique({ where: { slug: 'redhat' } });
  await db.vendor.upsert({
    where: { slug: 'redhat' },
    update: { name: 'Red Hat', description: 'Red Hat certifications — RHCSA, RHCE, and enterprise Linux system administration credentials.' },
    create: { slug: 'redhat', name: 'Red Hat', description: 'Red Hat certifications — RHCSA, RHCE, and enterprise Linux system administration credentials.' }
  });
  const vendor = await db.vendor.findUniqueOrThrow({ where: { slug: 'redhat' } });

  const examResults: SeedResult['exams'] = [];
  const examIds: Record<string, string> = {};

  for (const e of RHCSA_EXAMS) {
    const title = `Red Hat Certified System Administrator (RHCSA EX200) — ${e.titleSuffix}`;
    const description = `${e.descriptionSuffix} Aligned to the official Red Hat EX200 objectives.`;
    const examData = {
      title,
      code: e.code,
      description,
      level: 'Associate',
      durationMinutes: 150,
      passingScore: 70,
      questionCount: e.questions.length,
      domains: RHCSA_DOMAINS,
      published: true
    };
    const exam = await db.exam.upsert({
      where: { slug: e.slug },
      update: examData,
      create: { ...examData, slug: e.slug, vendorId: vendor.id }
    });
    examIds[e.slug] = exam.id;

    await db.question.deleteMany({ where: { examId: exam.id, generatedBy: 'manual:rhcsa-seed' } });
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
          generatedBy: 'manual:rhcsa-seed',
          isTeaser: !!q.isTeaser
        }
      });
      if (q.isTeaser) teaserCount++;
    }
    examResults.push({ slug: e.slug, questionCount: e.questions.length, teaserCount });
  }

  const existingBundle = await db.bundle.findUnique({ where: { slug: RHCSA_BUNDLE.slug } });
  const bundle = await db.bundle.upsert({
    where: { slug: RHCSA_BUNDLE.slug },
    update: {
      title: RHCSA_BUNDLE.title,
      description: RHCSA_BUNDLE.description,
      price: RHCSA_BUNDLE.price,
      priceVoucher: RHCSA_BUNDLE.priceVoucher,
      published: true
    },
    create: {
      slug: RHCSA_BUNDLE.slug,
      title: RHCSA_BUNDLE.title,
      description: RHCSA_BUNDLE.description,
      price: RHCSA_BUNDLE.price,
      priceVoucher: RHCSA_BUNDLE.priceVoucher,
      published: true
    }
  });

  // Replace bundle items deterministically: drop existing, recreate.
  await db.bundleItem.deleteMany({ where: { bundleId: bundle.id } });
  const items = [
    { examSlug: 'redhat-rhcsa-ex200-p1', tier: 'PRACTICE' as const, position: 1 },
    { examSlug: 'redhat-rhcsa-ex200-p2', tier: 'PRACTICE' as const, position: 2 },
    { examSlug: 'redhat-rhcsa-ex200-p3', tier: 'PRACTICE' as const, position: 3 },
    { examSlug: 'redhat-rhcsa-ex200-p1', tier: 'VOUCHER' as const, position: 4 }
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
