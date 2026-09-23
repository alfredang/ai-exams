/**
 * CompTIA A+ bundle seed — vendor, three practice-exam variants, bundle,
 * and 195 blueprint-aligned questions (65 per variant). Idempotent:
 * replaces rows tagged `generatedBy: 'manual:aplus-seed'` and upserts
 * catalog rows.
 *
 * Exported as `seedAplus(db)` so the same code path is reachable from
 * the standalone CLI shim (`prisma/seeds/aplus.ts`) and the protected
 * admin API (`/api/admin/seed-aplus`) — letting us bootstrap the
 * production database without redeploying.
 *
 * Question content is authored against the public CompTIA A+ exam
 * objectives (220-1101 Core 1 + 220-1102 Core 2) and authoritative
 * vendor documentation. Domain blueprint (sums to 100):
 *   - Hardware                                       — 18% (12)
 *   - Networking                                     — 17% (11)
 *   - Mobile Devices and Virtualization              — 13% (8)
 *   - Operating Systems                              — 18% (12)
 *   - Security                                       — 18% (12)
 *   - Software and Operational Troubleshooting       — 16% (10)
 *
 * These are original study questions inspired by the published exam
 * objectives; they are NOT real or official CompTIA exam items.
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

const HW = 'Hardware';
const NET = 'Networking';
const MOB = 'Mobile Devices and Virtualization';
const OS = 'Operating Systems';
const SEC = 'Security';
const TRB = 'Software and Operational Troubleshooting';

// Reference catalog — only real CompTIA objective pages and authoritative
// vendor docs (Microsoft / Apple). Never invent URLs.
const REF_1101 = { label: 'CompTIA A+ Certification Exam: Core 1 (220-1101) Objectives', url: 'https://www.comptia.org/en-us/certifications/a/' };
const REF_1102 = { label: 'CompTIA A+ Certification Exam: Core 2 (220-1102) Objectives', url: 'https://www.comptia.org/en-us/certifications/a/' };
const REF_APLUS = { label: 'CompTIA A+ Certification', url: 'https://www.comptia.org/en-us/certifications/a/' };
const REF_WIN_INSTALL = { label: 'Microsoft Learn — Install and deploy Windows', url: 'https://learn.microsoft.com/en-us/windows/deployment/' };
const REF_WIN_DISK = { label: 'Microsoft Learn — Disk Management', url: 'https://learn.microsoft.com/en-us/windows-server/storage/disk-management/overview-of-disk-management' };
const REF_WIN_CMD = { label: 'Microsoft Learn — Windows commands', url: 'https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/windows-commands' };
const REF_WIN_BITLOCKER = { label: 'Microsoft Learn — BitLocker overview', url: 'https://learn.microsoft.com/en-us/windows/security/operating-system-security/data-protection/bitlocker/' };
const REF_WIN_DEFENDER = { label: 'Microsoft Learn — Microsoft Defender Antivirus', url: 'https://learn.microsoft.com/en-us/defender-endpoint/microsoft-defender-antivirus-windows' };
const REF_WIN_UAC = { label: 'Microsoft Learn — User Account Control', url: 'https://learn.microsoft.com/en-us/windows/security/application-security/application-control/user-account-control/' };
const REF_WIN_RECOVERY = { label: 'Microsoft Learn — Windows Recovery Environment', url: 'https://learn.microsoft.com/en-us/windows-hardware/manufacture/desktop/windows-recovery-environment--windows-re--technical-reference' };
const REF_WIN_NTFS = { label: 'Microsoft Learn — NTFS overview', url: 'https://learn.microsoft.com/en-us/windows-server/storage/file-server/ntfs-overview' };
const REF_WIN_POWERSHELL = { label: 'Microsoft Learn — PowerShell documentation', url: 'https://learn.microsoft.com/en-us/powershell/' };
const REF_WIN_IPCONFIG = { label: 'Microsoft Learn — ipconfig command', url: 'https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/ipconfig' };
const REF_APPLE_MAC = { label: 'Apple Support — macOS User Guide', url: 'https://support.apple.com/guide/mac-help/welcome/mac' };
const REF_APPLE_TIME = { label: 'Apple Support — Back up your Mac with Time Machine', url: 'https://support.apple.com/en-us/HT201250' };
const REF_APPLE_IOS = { label: 'Apple Support — iPhone User Guide', url: 'https://support.apple.com/guide/iphone/welcome/ios' };

// Helper to build 4-option SINGLE questions with id 'a','b','c','d'.
const opts4 = (a: string, b: string, c: string, d: string): Opt[] => [
  { id: 'a', text: a }, { id: 'b', text: b }, { id: 'c', text: c }, { id: 'd', text: d }
];

// ───────────────────── Practice Exam 1 ─────────────────────
const P1: Q[] = [
  // ── Hardware (12) ──
  {
    domain: HW, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'A technician needs to install dual-channel memory in a desktop. Which action ensures the memory runs in dual-channel mode?',
    options: opts4(
      'Install a single large DIMM in the first slot',
      'Install matched DIMMs in the slots of the same color (matching channel pairs) per the motherboard manual',
      'Mix different-capacity DIMMs across all slots',
      'Disable XMP in the UEFI/BIOS'
    ),
    correct: ['b'],
    explanation: 'Dual-channel requires matched modules installed in the correct paired slots, which the motherboard manual indicates (often by slot color). A single DIMM runs single-channel, and mismatched modules can fall back to single-channel or flex mode.',
    references: [REF_1101]
  },
  {
    domain: HW, difficulty: 2, type: QType.SINGLE,
    stem: 'Which connector type is used by an M.2 NVMe solid-state drive to communicate over the PCIe bus?',
    options: opts4(
      'SATA data + power cables',
      'An M.2 slot keyed for PCIe (commonly M-key)',
      'A 4-pin Molex connector',
      'An IDE 40-pin ribbon'
    ),
    correct: ['b'],
    explanation: 'NVMe SSDs use the PCIe lanes of an M.2 slot, typically M-keyed. SATA cabling and Molex/IDE connectors are used by older or SATA-based drives, not PCIe NVMe.',
    references: [REF_1101]
  },
  {
    domain: HW, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A user reports that a newly built PC powers on, fans spin, but there is no display and no POST beeps. Which component should the technician verify first?',
    options: opts4(
      'The optical drive firmware',
      'That the RAM and the CPU/EPS power connector are properly seated',
      'The printer spooler service',
      'The DNS configuration'
    ),
    correct: ['b'],
    explanation: 'No display with fans spinning commonly indicates unseated RAM or a missing CPU (EPS 4/8-pin) power connector. Reseating RAM and confirming all power connectors is the correct first hardware check.',
    references: [REF_1101]
  },
  {
    domain: HW, difficulty: 2, type: QType.SINGLE,
    stem: 'Which RAID level provides disk mirroring with no parity, requiring exactly two drives for redundancy?',
    options: opts4('RAID 0', 'RAID 1', 'RAID 5', 'RAID 10'),
    correct: ['b'],
    explanation: 'RAID 1 mirrors data across two drives for redundancy with no parity. RAID 0 stripes with no redundancy, RAID 5 uses striping with parity, and RAID 10 combines mirroring and striping (4+ drives).',
    references: [REF_1101]
  },
  {
    domain: HW, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL connectors that can carry a digital video signal to an external display.',
    options: opts4('HDMI', 'DisplayPort', 'VGA', 'USB-C (with DisplayPort Alt Mode)'),
    correct: ['a', 'b', 'd'],
    explanation: 'HDMI, DisplayPort, and USB-C with DisplayPort Alt Mode all carry digital video. VGA is an analog-only interface and does not carry a digital signal.',
    references: [REF_1101]
  },
  {
    domain: HW, difficulty: 2, type: QType.SINGLE,
    stem: 'A laser printer produces output with toner that smears and rubs off the page. Which assembly is the most likely cause?',
    options: opts4(
      'The pickup roller',
      'The fuser assembly',
      'The transfer belt',
      'The duplexing unit'
    ),
    correct: ['b'],
    explanation: 'The fuser bonds toner to the paper using heat and pressure. If toner smears or rubs off, the fuser is failing to fuse the toner. The pickup roller affects paper feed, not toner adhesion.',
    references: [REF_1101]
  },
  {
    domain: HW, difficulty: 2, type: QType.SINGLE,
    stem: 'Which power supply specification is most important when adding a high-end GPU that requires two 8-pin PCIe power connectors?',
    options: opts4(
      'The number of SATA data ports',
      'Sufficient wattage and the required PCIe power connectors / rail capacity',
      'The case form factor only',
      'The motherboard chipset'
    ),
    correct: ['b'],
    explanation: 'A high-end GPU needs adequate total wattage and the proper PCIe power connectors with enough current on the 12V rail. SATA ports and chipset are unrelated to powering the GPU.',
    references: [REF_1101]
  },
  {
    domain: HW, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'ESD (electrostatic discharge) can damage computer components even when no visible spark or shock is felt.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'True. ESD damage can occur well below the threshold a person can perceive (around 3,000V), so anti-static wrist straps and proper grounding are required even without a felt shock.',
    references: [REF_1101]
  },
  {
    domain: HW, difficulty: 3, type: QType.SINGLE,
    stem: 'A workstation randomly reboots under heavy CPU load but is stable when idle. Thermal monitoring shows the CPU rapidly reaching its maximum temperature. What is the most likely cause?',
    options: opts4(
      'A failing network switch',
      'Inadequate CPU cooling — dried thermal paste or a clogged/poorly seated heatsink',
      'An expired TLS certificate',
      'A corrupted printer driver'
    ),
    correct: ['b'],
    explanation: 'Reboots that occur only under load with rapid temperature spikes point to a cooling problem: degraded thermal paste, dust-clogged heatsink/fan, or a heatsink not making proper contact. Network and software items would not cause thermal shutdowns.',
    references: [REF_1101]
  },
  {
    domain: HW, difficulty: 2, type: QType.SINGLE,
    stem: 'Which expansion slot standard would a technician use to install a modern dedicated graphics card?',
    options: opts4('PCIe x16', 'PCI 32-bit', 'AGP 8x', 'ISA'),
    correct: ['a'],
    explanation: 'Modern GPUs use a PCIe x16 slot for the bandwidth they require. PCI, AGP, and ISA are legacy slots not used by current graphics cards.',
    references: [REF_1101]
  },
  {
    domain: HW, difficulty: 3, type: QType.SINGLE,
    stem: 'A technician is asked to recommend storage for a database server that prioritizes the lowest read/write latency. Which option best meets that requirement?',
    options: opts4(
      '7,200 RPM SATA hard disk drive',
      'NVMe PCIe solid-state drive',
      '5,400 RPM laptop hard disk drive',
      'External USB 2.0 hard drive'
    ),
    correct: ['b'],
    explanation: 'An NVMe PCIe SSD offers the lowest latency and highest throughput by using the PCIe bus and a flash controller, far outperforming spinning HDDs or USB 2.0 drives.',
    references: [REF_1101]
  },
  {
    domain: HW, difficulty: 2, type: QType.SINGLE,
    stem: 'A motherboard repeatedly loses date/time and resets BIOS settings after the system is unplugged. What is the most likely fix?',
    options: opts4(
      'Replace the CMOS battery (CR2032)',
      'Reinstall the operating system',
      'Replace the SATA cable',
      'Update the printer driver'
    ),
    correct: ['a'],
    explanation: 'A dead CMOS coin-cell battery (typically CR2032) causes BIOS/UEFI settings and the real-time clock to reset when power is removed. Replacing it resolves the issue.',
    references: [REF_1101]
  },

  // ── Networking (11) ──
  {
    domain: NET, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which TCP port is used by HTTPS by default?',
    options: opts4('80', '443', '25', '3389'),
    correct: ['b'],
    explanation: 'HTTPS uses TCP port 443. Port 80 is HTTP, port 25 is SMTP, and port 3389 is RDP.',
    references: [REF_1101]
  },
  {
    domain: NET, difficulty: 2, type: QType.SINGLE,
    stem: 'A SOHO router should automatically assign IP addresses to client devices. Which service must be enabled?',
    options: opts4('DNS forwarding', 'DHCP', 'NAT loopback', 'WPS'),
    correct: ['b'],
    explanation: 'DHCP automatically leases IP addresses, subnet masks, gateways, and DNS to clients. DNS resolves names, NAT translates addresses, and WPS is a Wi-Fi setup convenience.',
    references: [REF_1101]
  },
  {
    domain: NET, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which wireless security standard should be configured on a new SOHO access point for the strongest currently recommended protection?',
    options: opts4('WEP', 'WPA', 'WPA2-TKIP', 'WPA3'),
    correct: ['d'],
    explanation: 'WPA3 is the strongest current Wi-Fi security standard. WEP and original WPA are deprecated and easily broken; WPA2-TKIP uses the weaker TKIP cipher.',
    references: [REF_1101]
  },
  {
    domain: NET, difficulty: 2, type: QType.SINGLE,
    stem: 'A workstation has the IP address 169.254.23.7 and cannot reach the network. What does this address indicate?',
    options: opts4(
      'A static public IP was assigned',
      'APIPA — the client failed to obtain an address from a DHCP server',
      'The device is using IPv6 only',
      'The subnet mask is incorrect by design'
    ),
    correct: ['b'],
    explanation: 'The 169.254.0.0/16 range is APIPA (link-local). It is self-assigned when a client cannot reach a DHCP server, indicating a DHCP or connectivity problem.',
    references: [REF_1101, REF_WIN_IPCONFIG]
  },
  {
    domain: NET, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL valid private IPv4 address ranges (RFC 1918).',
    options: opts4(
      '10.0.0.0 – 10.255.255.255',
      '172.16.0.0 – 172.31.255.255',
      '192.168.0.0 – 192.168.255.255',
      '8.8.0.0 – 8.8.255.255'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'RFC 1918 private ranges are 10.0.0.0/8, 172.16.0.0/12, and 192.168.0.0/16. 8.8.0.0 is public address space (used by a well-known public DNS resolver).',
    references: [REF_1101]
  },
  {
    domain: NET, difficulty: 2, type: QType.SINGLE,
    stem: 'Which cable type should be used for a 1 Gbps Ethernet run of approximately 80 meters in an office?',
    options: opts4(
      'Cat 5e (or better) twisted pair',
      'RG-6 coaxial',
      'Single-mode fiber with SC connectors only',
      'USB-A to USB-A'
    ),
    correct: ['a'],
    explanation: 'Cat 5e supports 1 Gbps up to 100 meters, so an 80-meter run is within spec. Coaxial and USB are not used for standard Ethernet runs, and single-mode fiber is unnecessary here.',
    references: [REF_1101]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE,
    stem: 'A technician needs to verify the full path and per-hop latency between a workstation and a remote web server. Which Windows command is most appropriate?',
    options: opts4('ping', 'tracert', 'ipconfig', 'netstat'),
    correct: ['b'],
    explanation: 'tracert lists each router hop and the round-trip time to each, revealing where latency or failure occurs. ping only tests reachability/latency to one endpoint; ipconfig shows local config; netstat shows connections.',
    references: [REF_WIN_CMD]
  },
  {
    domain: NET, difficulty: 2, type: QType.SINGLE,
    stem: 'Which device operates at Layer 2 and forwards frames based on MAC addresses, maintaining a MAC address table?',
    options: opts4('Hub', 'Unmanaged/managed switch', 'Repeater', 'Patch panel'),
    correct: ['b'],
    explanation: 'A switch learns MAC addresses and forwards frames only to the correct port. A hub repeats to all ports, a repeater regenerates signals, and a patch panel is a passive termination point.',
    references: [REF_1101]
  },
  {
    domain: NET, difficulty: 1, type: QType.SINGLE,
    stem: 'DNS is responsible for resolving human-readable hostnames into IP addresses.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'True. DNS translates names such as example.com into IP addresses so clients can route traffic to the correct host.',
    references: [REF_1101]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE,
    stem: 'A remote worker must securely access internal company resources over the public internet as if locally connected. Which technology should be used?',
    options: opts4(
      'A port-forwarded RDP session with no encryption',
      'A VPN (virtual private network)',
      'An open guest Wi-Fi network',
      'Telnet to the gateway'
    ),
    correct: ['b'],
    explanation: 'A VPN creates an encrypted tunnel over the public internet, giving the client secure access to the internal network. The other options are insecure and do not provide protected internal access.',
    references: [REF_1101]
  },
  {
    domain: NET, difficulty: 2, type: QType.SINGLE,
    stem: 'Which protocol and port does Remote Desktop Protocol (RDP) use by default?',
    options: opts4('TCP 22', 'TCP 3389', 'UDP 53', 'TCP 21'),
    correct: ['b'],
    explanation: 'RDP uses TCP 3389 by default. TCP 22 is SSH, UDP 53 is DNS, and TCP 21 is FTP control.',
    references: [REF_1101]
  },

  // ── Mobile Devices and Virtualization (8) ──
  {
    domain: MOB, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A user wants to add corporate email to a personal smartphone while keeping work data separately manageable. Which solution best meets this?',
    options: opts4(
      'Disable the device passcode',
      'Enroll the device in an MDM/MAM solution with a managed work profile',
      'Share the user’s domain password by email',
      'Factory reset the phone weekly'
    ),
    correct: ['b'],
    explanation: 'Mobile Device/Application Management (MDM/MAM) with a managed work profile lets IT control and wipe corporate data while keeping personal data separate. The other options are insecure or impractical.',
    references: [REF_1102]
  },
  {
    domain: MOB, difficulty: 2, type: QType.SINGLE,
    stem: 'A laptop’s built-in display is dim while an external monitor is bright at the same settings. Which component is the most likely cause?',
    options: opts4(
      'The laptop battery',
      'The display backlight or inverter/backlight power circuit',
      'The Wi-Fi antenna',
      'The trackpad driver'
    ),
    correct: ['b'],
    explanation: 'A dim built-in panel while external output is normal points to the backlight or its power circuit, not the GPU or OS. Battery, Wi-Fi, and trackpad are unrelated to panel brightness.',
    references: [REF_1101]
  },
  {
    domain: MOB, difficulty: 2, type: QType.SINGLE,
    stem: 'Which type of hypervisor runs directly on the host hardware without a host operating system?',
    options: opts4(
      'Type 2 (hosted) hypervisor',
      'Type 1 (bare-metal) hypervisor',
      'A container runtime',
      'A sandbox emulator'
    ),
    correct: ['b'],
    explanation: 'A Type 1 (bare-metal) hypervisor runs directly on hardware for maximum performance and isolation. A Type 2 hypervisor runs on top of a host OS; containers and emulators are different abstractions.',
    references: [REF_1101]
  },
  {
    domain: MOB, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL requirements that should be verified before deploying client-side virtual machines on a workstation.',
    options: opts4(
      'CPU virtualization extensions enabled in UEFI/BIOS (Intel VT-x / AMD-V)',
      'Sufficient RAM and storage for the host plus all guest VMs',
      'Adequate CPU cores/resources for the planned workload',
      'A dial-up modem installed'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Client virtualization needs hardware virtualization extensions enabled, plus enough RAM, storage, and CPU for the host and guests. A dial-up modem is irrelevant to virtualization.',
    references: [REF_1101]
  },
  {
    domain: MOB, difficulty: 2, type: QType.SINGLE,
    stem: 'A smartphone is not charging when connected with a known-good cable and charger. After cleaning the charging port carefully, it works. What was the most likely cause?',
    options: opts4(
      'A corrupted DNS cache',
      'Lint/debris obstructing the charging port',
      'An expired SSL certificate',
      'A misconfigured VLAN'
    ),
    correct: ['b'],
    explanation: 'Pocket lint and debris commonly block charging-port contacts. Since cleaning resolved it with a known-good cable/charger, port obstruction was the cause. The other options are unrelated to physical charging.',
    references: [REF_1102]
  },
  {
    domain: MOB, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which connector is used by current iPhone and most modern Android phones (2024+) for charging and data?',
    options: opts4('USB-C', 'Micro-USB only', 'Mini-USB', 'FireWire 800'),
    correct: ['a'],
    explanation: 'Modern smartphones, including recent iPhones and most Android devices, have standardized on USB-C. Micro/Mini-USB are older standards and FireWire is not used for phones.',
    references: [REF_APPLE_IOS]
  },
  {
    domain: MOB, difficulty: 3, type: QType.SINGLE,
    stem: 'A cloud customer wants the provider to manage the OS and runtime while the customer only deploys and manages their application code. Which cloud service model is this?',
    options: opts4(
      'IaaS (Infrastructure as a Service)',
      'PaaS (Platform as a Service)',
      'SaaS (Software as a Service)',
      'On-premises bare metal'
    ),
    correct: ['b'],
    explanation: 'PaaS provides a managed platform (OS, runtime, scaling) so the customer focuses on application code. IaaS gives raw VMs/infrastructure to manage, and SaaS delivers a finished application.',
    references: [REF_1101]
  },
  {
    domain: MOB, difficulty: 3, type: QType.SINGLE,
    stem: 'A laptop drains its battery quickly even when powered off and the clock loses time. Which is the best first troubleshooting step?',
    options: opts4(
      'Replace the motherboard immediately',
      'Check for an aging/failing battery and review power settings, then update firmware as needed',
      'Reinstall the web browser',
      'Disable DNS over HTTPS'
    ),
    correct: ['b'],
    explanation: 'Rapid battery drain combined with timekeeping issues points to a degraded battery and/or power configuration; checking battery health, power settings, and firmware is the correct, least-invasive first step before replacing hardware wholesale.',
    references: [REF_1101]
  },

  // ── Operating Systems (12) ──
  {
    domain: OS, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Windows file system supports file/folder permissions, encryption (EFS), and large volumes, and is recommended for the system drive?',
    options: opts4('FAT32', 'exFAT', 'NTFS', 'ext4'),
    correct: ['c'],
    explanation: 'NTFS supports ACL permissions, EFS encryption, journaling, and large volumes, making it the standard for Windows system drives. FAT32/exFAT lack permissions; ext4 is a Linux file system.',
    references: [REF_WIN_NTFS]
  },
  {
    domain: OS, difficulty: 2, type: QType.SINGLE,
    stem: 'A technician must convert a single basic disk into a layout that can later span volumes across multiple disks in Windows. Which tool is used?',
    options: opts4(
      'Disk Management (convert to dynamic disk) or Storage Spaces',
      'Notepad',
      'Task Manager',
      'Event Viewer'
    ),
    correct: ['a'],
    explanation: 'Disk Management can convert a basic disk to dynamic (or you can use Storage Spaces) to enable spanned/striped volumes. Notepad, Task Manager, and Event Viewer do not manage disk layout.',
    references: [REF_WIN_DISK]
  },
  {
    domain: OS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Windows command-line utility checks and repairs file system integrity on a volume?',
    options: opts4('chkdsk', 'ipconfig', 'tasklist', 'ping'),
    correct: ['a'],
    explanation: 'chkdsk scans a volume for file system errors and bad sectors and can repair them (e.g., chkdsk /f /r). The other commands handle networking or process listing.',
    references: [REF_WIN_CMD]
  },
  {
    domain: OS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which macOS built-in utility is used to perform scheduled, incremental backups to an external drive?',
    options: opts4('Time Machine', 'Disk Defragmenter', 'BitLocker', 'gpedit.msc'),
    correct: ['a'],
    explanation: 'Time Machine performs automatic incremental backups on macOS. BitLocker and gpedit.msc are Windows features, and macOS does not require routine defragmentation.',
    references: [REF_APPLE_TIME]
  },
  {
    domain: OS, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL valid Windows clean-installation considerations.',
    options: opts4(
      'Back up user data before wiping the drive',
      'Verify hardware meets the Windows edition’s minimum requirements',
      'Have required drivers available for network/storage',
      'Skip product activation permanently with no consequences'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'A clean install requires backing up data, confirming hardware compatibility, and having drivers ready. Windows must still be activated; skipping activation leads to feature limitations and notices.',
    references: [REF_WIN_INSTALL]
  },
  {
    domain: OS, difficulty: 2, type: QType.SINGLE,
    stem: 'A Linux administrator needs to run a single command with elevated (root) privileges without logging in as root. Which command is used?',
    options: opts4('sudo', 'chmod', 'grep', 'pwd'),
    correct: ['a'],
    explanation: 'sudo runs a single command as another user (root by default) with proper authorization and logging. chmod changes permissions, grep searches text, and pwd prints the working directory.',
    references: [REF_APLUS]
  },
  {
    domain: OS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Windows feature allows applying consistent security and configuration policies to domain-joined computers centrally?',
    options: opts4(
      'Group Policy (via Active Directory)',
      'Notepad++',
      'The Recycle Bin',
      'ReadyBoost'
    ),
    correct: ['a'],
    explanation: 'Group Policy, managed through Active Directory, applies centralized security and configuration settings to domain computers and users. The other options do not manage policy.',
    references: [REF_WIN_INSTALL]
  },
  {
    domain: OS, difficulty: 1, type: QType.SINGLE,
    stem: 'A 32-bit version of Windows can directly address more than 4 GB of RAM for a single process without special extensions.',
    options: opts4('True', 'False', '', ''),
    correct: ['b'],
    explanation: 'False. A 32-bit OS is generally limited to about 4 GB of addressable memory. To use significantly more RAM, a 64-bit edition is required.',
    references: [REF_WIN_INSTALL]
  },
  {
    domain: OS, difficulty: 3, type: QType.SINGLE,
    stem: 'A technician must remotely run an automated configuration script across many Windows machines. Which scripting environment is built into Windows for this purpose?',
    options: opts4('PowerShell', 'Bash (default)', 'AppleScript', 'AutoCAD'),
    correct: ['a'],
    explanation: 'PowerShell is the native Windows automation and configuration scripting environment, supporting remote execution. Bash and AppleScript are not native Windows shells, and AutoCAD is unrelated.',
    references: [REF_WIN_POWERSHELL]
  },
  {
    domain: OS, difficulty: 2, type: QType.SINGLE,
    stem: 'In Windows, which utility lets a technician enable/disable startup programs and view detailed CPU, memory, and disk usage per process?',
    options: opts4('Task Manager', 'Disk Cleanup', 'Magnifier', 'Snipping Tool'),
    correct: ['a'],
    explanation: 'Task Manager manages processes, monitors resource usage, and controls startup apps. Disk Cleanup frees space, while Magnifier and Snipping Tool are accessibility/capture tools.',
    references: [REF_WIN_CMD]
  },
  {
    domain: OS, difficulty: 3, type: QType.SINGLE,
    stem: 'A Windows PC will not boot to the desktop after a failed update. Which environment provides Startup Repair, System Restore, and command-prompt recovery options?',
    options: opts4(
      'Windows Recovery Environment (WinRE)',
      'Device Manager',
      'Control Panel > Sound',
      'Calculator'
    ),
    correct: ['a'],
    explanation: 'WinRE provides Startup Repair, System Restore, Reset, and a recovery command prompt for unbootable systems. Device Manager and other listed tools require a working logged-in session.',
    references: [REF_WIN_RECOVERY]
  },
  {
    domain: OS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command displays a Windows client’s current IP address, subnet mask, and default gateway?',
    options: opts4('ipconfig', 'chkdsk', 'sfc', 'cls'),
    correct: ['a'],
    explanation: 'ipconfig displays the active IP configuration including address, mask, and gateway. chkdsk repairs disks, sfc verifies system files, and cls clears the console.',
    references: [REF_WIN_IPCONFIG]
  },

  // ── Security (12) ──
  {
    domain: SEC, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'A user receives an email that appears to be from their bank, urgently asking them to click a link and confirm their password. This is an example of which attack?',
    options: opts4('Phishing', 'DDoS', 'SQL injection', 'Zero-day exploit'),
    correct: ['a'],
    explanation: 'Phishing uses deceptive messages impersonating a trusted entity to trick users into revealing credentials. DDoS overwhelms services, SQL injection targets databases, and a zero-day exploits an unknown flaw.',
    references: [REF_1102]
  },
  {
    domain: SEC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which authentication approach requires something you know plus something you have, significantly improving account security?',
    options: opts4(
      'A longer single password',
      'Multi-factor authentication (MFA)',
      'Disabling the screen lock',
      'Sharing one account among the team'
    ),
    correct: ['b'],
    explanation: 'MFA combines factors (e.g., a password plus a one-time code or token), so a stolen password alone is insufficient. The other options weaken security.',
    references: [REF_1102]
  },
  {
    domain: SEC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Windows feature provides full-disk encryption so data is protected if a laptop is lost or stolen?',
    options: opts4('BitLocker', 'ReadyBoost', 'Storage Sense', 'OneDrive Recycle Bin'),
    correct: ['a'],
    explanation: 'BitLocker encrypts the entire volume, typically tied to the TPM, protecting data at rest if the device is lost. The other features do not provide full-disk encryption.',
    references: [REF_WIN_BITLOCKER]
  },
  {
    domain: SEC, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL practices that strengthen physical security for a workstation in a shared office.',
    options: opts4(
      'Use a cable lock to secure the chassis',
      'Lock the screen when stepping away',
      'Store credentials on a sticky note under the keyboard',
      'Restrict access with a badge/PIN entry to the room'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Cable locks, screen locking, and controlled room access all improve physical security. Writing credentials on a sticky note exposes them and undermines security.',
    references: [REF_1102]
  },
  {
    domain: SEC, difficulty: 2, type: QType.SINGLE,
    stem: 'A technician must follow the principle of least privilege when creating a new standard user account. What does this mean?',
    options: opts4(
      'Give the account local administrator rights for convenience',
      'Grant only the minimum permissions required to perform the user’s tasks',
      'Disable all logging for the account',
      'Share the account with contractors'
    ),
    correct: ['b'],
    explanation: 'Least privilege grants only the access necessary for the role, limiting damage from compromise or mistakes. Excess rights, disabled logging, and shared accounts all violate the principle.',
    references: [REF_1102]
  },
  {
    domain: SEC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Windows feature prompts for consent or admin credentials before allowing changes that require elevated privileges?',
    options: opts4(
      'User Account Control (UAC)',
      'Disk Defragmenter',
      'Windows Search',
      'Night Light'
    ),
    correct: ['a'],
    explanation: 'UAC prompts before an action runs with elevated privileges, helping prevent unauthorized or malware-driven system changes. The other features are unrelated to privilege elevation.',
    references: [REF_WIN_UAC]
  },
  {
    domain: SEC, difficulty: 3, type: QType.SINGLE,
    stem: 'A company must securely dispose of old hard drives containing sensitive data. Which method guarantees the data cannot be recovered?',
    options: opts4(
      'Quick format and reuse',
      'Physical destruction (shredding/degaussing) or certified secure erase',
      'Moving files to the Recycle Bin and emptying it',
      'Renaming the files'
    ),
    correct: ['b'],
    explanation: 'Physical destruction or a certified secure-erase/sanitization process ensures data is unrecoverable. Quick formats, deleting to the Recycle Bin, and renaming leave data recoverable.',
    references: [REF_1102]
  },
  {
    domain: SEC, difficulty: 1, type: QType.SINGLE,
    stem: 'Tailgating is a social-engineering technique where an unauthorized person follows an authorized employee through a secure door.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'True. Tailgating (piggybacking) is a physical social-engineering tactic where an attacker follows an authorized person into a restricted area without proper credentials.',
    references: [REF_1102]
  },
  {
    domain: SEC, difficulty: 3, type: QType.SINGLE,
    stem: 'Multiple users report files renamed with an unknown extension and a ransom note demanding payment. What is the most appropriate immediate response?',
    options: opts4(
      'Pay the ransom right away',
      'Isolate affected systems from the network and begin incident-response/remediation procedures',
      'Reboot all servers and ignore it',
      'Email the ransom note to all staff'
    ),
    correct: ['b'],
    explanation: 'Ransomware containment starts with isolating infected hosts to stop spread, then following incident-response and recovery (restore from clean backups). Paying the ransom is discouraged and does not guarantee recovery.',
    references: [REF_1102, REF_WIN_DEFENDER]
  },
  {
    domain: SEC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which security control should be configured to automatically lock a workstation after a period of inactivity?',
    options: opts4(
      'A screen saver/lock with password on resume and an inactivity timeout',
      'Disabling the password entirely',
      'Setting the timeout to never',
      'Removing the user account'
    ),
    correct: ['a'],
    explanation: 'An inactivity timeout that locks the session and requires a password on resume protects unattended workstations. Disabling passwords or setting no timeout removes the protection.',
    references: [REF_1102]
  },
  {
    domain: SEC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A help-desk technician receives a call from someone claiming to be an executive demanding an immediate password reset without verification. What is the correct action?',
    options: opts4(
      'Reset the password immediately to avoid upsetting the executive',
      'Follow the established identity-verification policy before any reset',
      'Post the new password in a public channel',
      'Disable account logging during the call'
    ),
    correct: ['b'],
    explanation: 'This is a likely social-engineering / pretexting attempt. The technician must follow the organization’s identity-verification procedure before performing sensitive actions, regardless of claimed authority.',
    references: [REF_1102]
  },
  {
    domain: SEC, difficulty: 3, type: QType.SINGLE,
    stem: 'Which malware type disguises itself as legitimate software to trick users into installing it, then performs malicious actions?',
    options: opts4('Trojan', 'Worm', 'Rootkit', 'Adware'),
    correct: ['a'],
    explanation: 'A Trojan masquerades as legitimate software to gain installation, then performs malicious actions. A worm self-propagates, a rootkit hides at a privileged level, and adware displays unwanted ads.',
    references: [REF_1102]
  },

  // ── Software and Operational Troubleshooting (10) ──
  {
    domain: TRB, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'According to the CompTIA troubleshooting methodology, what is the FIRST step?',
    options: opts4(
      'Implement the solution',
      'Identify the problem',
      'Document findings',
      'Establish a plan of action'
    ),
    correct: ['b'],
    explanation: 'The CompTIA troubleshooting methodology begins with identifying the problem (gather information, question the user, identify changes). Theory, testing, planning, implementing, verifying, and documenting follow.',
    references: [REF_1102]
  },
  {
    domain: TRB, difficulty: 2, type: QType.SINGLE,
    stem: 'After establishing a theory of probable cause, what is the next step in the methodology?',
    options: opts4(
      'Document the outcome',
      'Test the theory to determine the cause',
      'Implement preventive measures only',
      'Escalate to the vendor immediately'
    ),
    correct: ['b'],
    explanation: 'After forming a theory of probable cause, you test the theory to confirm or refute it. If unconfirmed, you establish a new theory or escalate.',
    references: [REF_1102]
  },
  {
    domain: TRB, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A Windows application crashes intermittently. Which built-in tool should a technician check for error details and event IDs?',
    options: opts4('Event Viewer', 'Calculator', 'Paint', 'Notepad'),
    correct: ['a'],
    explanation: 'Event Viewer logs application, system, and security events with error codes and event IDs, which help diagnose intermittent crashes. The other tools provide no diagnostic logs.',
    references: [REF_WIN_CMD]
  },
  {
    domain: TRB, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL appropriate actions when documenting and closing out a resolved incident.',
    options: opts4(
      'Record the cause and the steps taken to resolve it',
      'Verify full system functionality with the user',
      'Implement preventive measures if applicable',
      'Delete all related logs to save space'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Proper closeout includes documenting cause/resolution, verifying functionality, and applying preventive measures. Deleting logs destroys audit and future troubleshooting value.',
    references: [REF_1102]
  },
  {
    domain: TRB, difficulty: 2, type: QType.SINGLE,
    stem: 'A user reports a Windows machine is extremely slow shortly after installing a free utility from an untrusted site. Which step should be performed first?',
    options: opts4(
      'Reformat the drive immediately',
      'Run a reputable anti-malware scan and review recently installed programs/startup items',
      'Replace the hard drive',
      'Disable the firewall permanently'
    ),
    correct: ['b'],
    explanation: 'Sudden slowness after installing untrusted software suggests malware/PUP. Scanning with anti-malware and reviewing recent installs/startup entries is the correct, least-destructive first step before drastic actions.',
    references: [REF_WIN_DEFENDER]
  },
  {
    domain: TRB, difficulty: 3, type: QType.SINGLE,
    stem: 'A Windows system shows a "Boot Device Not Found" error. After verifying the drive is detected in UEFI/BIOS, which action is most appropriate next?',
    options: opts4(
      'Replace the CPU',
      'Use Windows recovery tools to repair the bootloader/boot configuration',
      'Reinstall the GPU driver',
      'Increase the monitor refresh rate'
    ),
    correct: ['b'],
    explanation: 'If the drive is detected but Windows will not boot, the bootloader/BCD is likely damaged. Using WinRE Startup Repair or bootrec/bcd repair addresses it. CPU/GPU/monitor changes are unrelated.',
    references: [REF_WIN_RECOVERY]
  },
  {
    domain: TRB, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Windows command verifies and repairs corrupted protected operating-system files?',
    options: opts4('sfc /scannow', 'ping -t', 'cls', 'dir /s'),
    correct: ['a'],
    explanation: 'sfc /scannow (System File Checker) scans and repairs corrupted protected system files. The other commands handle networking, clearing the screen, or directory listing.',
    references: [REF_WIN_CMD]
  },
  {
    domain: TRB, difficulty: 1, type: QType.SINGLE,
    stem: 'When troubleshooting, you should always consider corporate policies, procedures, and impact before implementing a change.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'True. The methodology explicitly requires considering corporate policies, procedures, and potential impact before applying a fix, often using change-management processes.',
    references: [REF_1102]
  },
  {
    domain: TRB, difficulty: 3, type: QType.SINGLE,
    stem: 'A scheduled batch job must run automatically every night to back up a folder. Which Windows component should be configured?',
    options: opts4(
      'Task Scheduler',
      'Device Manager',
      'Disk Cleanup',
      'Sound settings'
    ),
    correct: ['a'],
    explanation: 'Task Scheduler runs scripts or programs on triggers/schedules, ideal for nightly backups. Device Manager, Disk Cleanup, and Sound settings do not schedule jobs.',
    references: [REF_WIN_CMD]
  },
  {
    domain: TRB, difficulty: 2, type: QType.SINGLE,
    stem: 'A printer on the network suddenly stops printing and jobs pile up in the Windows queue. Which service should the technician restart first?',
    options: opts4(
      'Print Spooler service',
      'Windows Time service',
      'DNS Client service',
      'Plug and Play service'
    ),
    correct: ['a'],
    explanation: 'Stuck print jobs are commonly resolved by clearing the queue and restarting the Print Spooler service. The other services do not control print job queuing.',
    references: [REF_WIN_CMD]
  }
];

// ───────────────────── Practice Exam 2 ─────────────────────
const P2: Q[] = [
  // ── Hardware (12) ──
  {
    domain: HW, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which component temporarily holds data and instructions the CPU is actively using and loses its contents when power is removed?',
    options: opts4('SSD', 'RAM', 'BIOS ROM', 'Hard disk drive'),
    correct: ['b'],
    explanation: 'RAM is volatile working memory for active data/instructions and loses contents on power loss. SSDs and HDDs are non-volatile storage; BIOS ROM holds firmware.',
    references: [REF_1101]
  },
  {
    domain: HW, difficulty: 2, type: QType.SINGLE,
    stem: 'A technician installs a SATA hard drive but it does not appear in the OS. The drive is not detected in UEFI/BIOS either. What should be checked first?',
    options: opts4(
      'The DNS server settings',
      'The SATA data and power cable connections to the drive and board',
      'The display resolution',
      'The antivirus exclusions'
    ),
    correct: ['b'],
    explanation: 'If a drive is not detected even in firmware, the most likely cause is a loose or faulty SATA data/power cable or port. Software settings cannot make an undetected drive appear.',
    references: [REF_1101]
  },
  {
    domain: HW, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which printer type uses a thermal print head to heat ink and spray droplets onto paper?',
    options: opts4('Laser', 'Inkjet', 'Impact (dot-matrix)', 'Thermal label (direct thermal)'),
    correct: ['b'],
    explanation: 'Inkjet printers commonly use thermal (bubble) or piezoelectric heads to deposit ink droplets. Laser uses toner and a fuser; impact uses pins/ribbon; direct thermal heats special paper.',
    references: [REF_1101]
  },
  {
    domain: HW, difficulty: 2, type: QType.SINGLE,
    stem: 'Which RAID level stripes data across three or more disks with distributed parity, surviving a single drive failure?',
    options: opts4('RAID 0', 'RAID 1', 'RAID 5', 'JBOD'),
    correct: ['c'],
    explanation: 'RAID 5 uses block-level striping with distributed parity and tolerates one disk failure. RAID 0 has no redundancy, RAID 1 mirrors, and JBOD is just a span with no parity.',
    references: [REF_1101]
  },
  {
    domain: HW, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL symptoms that commonly indicate failing RAM.',
    options: opts4(
      'Frequent random blue screens / kernel panics',
      'Intermittent application crashes and memory errors in logs',
      'System fails memory diagnostic (e.g., Windows Memory Diagnostic)',
      'The monitor power LED is amber'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Failing RAM typically causes random crashes/BSODs, memory-related log errors, and failed memory diagnostics. An amber monitor LED indicates a display power/signal state, not RAM.',
    references: [REF_1101]
  },
  {
    domain: HW, difficulty: 2, type: QType.SINGLE,
    stem: 'A technician must connect a high-resolution external monitor and also charge a laptop through a single cable. Which port supports power delivery, data, and video?',
    options: opts4('USB-C (Thunderbolt/USB4 with PD)', 'PS/2', 'RJ-45', 'VGA'),
    correct: ['a'],
    explanation: 'USB-C with Thunderbolt/USB4 and Power Delivery can carry data, video (DP Alt Mode), and charging over one cable. PS/2, RJ-45, and VGA are single-purpose legacy/network connectors.',
    references: [REF_1101]
  },
  {
    domain: HW, difficulty: 2, type: QType.SINGLE,
    stem: 'A laser printer outputs pages with a repeating ghost image of a previous print at regular intervals down the page. Which component is the most likely cause?',
    options: opts4(
      'The imaging drum/photoconductor',
      'The network cable',
      'The power supply fan',
      'The USB controller'
    ),
    correct: ['a'],
    explanation: 'Repeating ghost images at a fixed interval usually indicate a worn or failing imaging drum (or fuser) that retains a residual charge/image. Cables, fans, and USB do not cause ghosting.',
    references: [REF_1101]
  },
  {
    domain: HW, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'An anti-static (ESD) wrist strap should be connected to a known ground point when servicing internal PC components.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'True. An ESD wrist strap must be grounded so static charge safely dissipates, protecting sensitive components during service.',
    references: [REF_1101]
  },
  {
    domain: HW, difficulty: 3, type: QType.SINGLE,
    stem: 'A desktop powers on, but emits a series of beeps and does not display. The board manual maps the beep pattern to a video error. What is the best next step?',
    options: opts4(
      'Replace the operating system',
      'Reseat or test the graphics card / verify integrated video output',
      'Reset the router',
      'Clear the browser cache'
    ),
    correct: ['b'],
    explanation: 'POST beep codes are firmware diagnostics; a video-error code points to the GPU. Reseating/testing the graphics card or using integrated video isolates the fault. Software/network actions are irrelevant.',
    references: [REF_1101]
  },
  {
    domain: HW, difficulty: 2, type: QType.SINGLE,
    stem: 'Which form factor describes a small motherboard commonly used in compact/HTPC builds, smaller than ATX and microATX?',
    options: opts4('Mini-ITX', 'Extended ATX (E-ATX)', 'Full tower', 'BTX rackmount'),
    correct: ['a'],
    explanation: 'Mini-ITX (17 cm square) is the small form factor used in compact systems. E-ATX is larger than ATX; full tower is a case size; BTX is a legacy form factor.',
    references: [REF_1101]
  },
  {
    domain: HW, difficulty: 3, type: QType.SINGLE,
    stem: 'A workstation’s case fans and CPU fan are caked with dust and the system thermally throttles under load. Which preventive maintenance action is most appropriate?',
    options: opts4(
      'Spray water into the fans',
      'Power down, ground yourself, and clean dust using compressed air in a controlled manner',
      'Increase the screen brightness',
      'Disable the page file'
    ),
    correct: ['b'],
    explanation: 'Safely powering down, observing ESD precautions, and removing dust with compressed air restores airflow and cooling. Water and the unrelated software settings do not address thermal throttling and can cause damage.',
    references: [REF_1101]
  },
  {
    domain: HW, difficulty: 2, type: QType.SINGLE,
    stem: 'Which storage interface is associated with the fastest sequential and random performance for consumer SSDs?',
    options: opts4('NVMe over PCIe', 'SATA III', 'USB 2.0', 'eSATA (3 Gbps)'),
    correct: ['a'],
    explanation: 'NVMe SSDs over PCIe deliver far higher throughput and lower latency than SATA III, USB 2.0, or older eSATA interfaces, which are bandwidth-limited.',
    references: [REF_1101]
  },

  // ── Networking (11) ──
  {
    domain: NET, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which TCP port does SSH use by default for secure remote command-line access?',
    options: opts4('22', '23', '80', '143'),
    correct: ['a'],
    explanation: 'SSH uses TCP port 22. Port 23 is Telnet (insecure), port 80 is HTTP, and port 143 is IMAP.',
    references: [REF_1101]
  },
  {
    domain: NET, difficulty: 2, type: QType.SINGLE,
    stem: 'A SOHO network should hide internal private IP addresses behind a single public IP. Which router feature performs this?',
    options: opts4('NAT (Network Address Translation)', 'QoS', 'WPS', 'UPnP'),
    correct: ['a'],
    explanation: 'NAT translates many internal private addresses to one (or few) public addresses. QoS prioritizes traffic, WPS simplifies Wi-Fi setup, and UPnP automates port mapping.',
    references: [REF_1101]
  },
  {
    domain: NET, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which wireless frequency band generally provides longer range but is more prone to interference and lower maximum throughput?',
    options: opts4('2.4 GHz', '5 GHz', '6 GHz', '60 GHz'),
    correct: ['a'],
    explanation: 'The 2.4 GHz band penetrates obstacles better (longer range) but has fewer non-overlapping channels and more interference, with lower throughput than 5/6 GHz.',
    references: [REF_1101]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE,
    stem: 'A client receives a valid IP via DHCP and can ping its gateway by IP, but cannot browse websites by name. What is the most likely problem?',
    options: opts4(
      'The Ethernet cable is unplugged',
      'A DNS resolution problem (misconfigured/unreachable DNS server)',
      'The CPU is overheating',
      'The monitor cable is loose'
    ),
    correct: ['b'],
    explanation: 'Reaching the gateway by IP but failing name-based browsing indicates DNS is failing. Verifying/correcting DNS settings resolves it; physical and unrelated hardware issues would also break IP connectivity.',
    references: [REF_WIN_IPCONFIG]
  },
  {
    domain: NET, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL devices/services typically found at the boundary of a SOHO network to the internet.',
    options: opts4(
      'Router/gateway',
      'Firewall',
      'Modem (provided by ISP)',
      'A desktop’s sound card'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'A SOHO edge typically includes an ISP modem, a router/gateway, and firewall functionality (often integrated). A sound card is an internal audio component, not a network boundary device.',
    references: [REF_1101]
  },
  {
    domain: NET, difficulty: 2, type: QType.SINGLE,
    stem: 'Which connector is used to terminate twisted-pair Ethernet cabling for a typical wired LAN connection?',
    options: opts4('RJ-45', 'RJ-11', 'BNC', 'LC fiber'),
    correct: ['a'],
    explanation: 'RJ-45 is the 8-position connector used for twisted-pair Ethernet. RJ-11 is for telephone lines, BNC is coaxial, and LC is a fiber connector.',
    references: [REF_1101]
  },
  {
    domain: NET, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command-line tool tests basic reachability and round-trip time to a host using ICMP echo requests?',
    options: opts4('ping', 'nslookup', 'format', 'taskkill'),
    correct: ['a'],
    explanation: 'ping sends ICMP echo requests and reports reachability and latency. nslookup queries DNS, format prepares a disk, and taskkill ends processes.',
    references: [REF_WIN_CMD]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE,
    stem: 'An administrator wants to logically segment a single physical switch so that two departments cannot communicate at Layer 2 without a router. Which feature is used?',
    options: opts4('VLANs', 'PoE', 'DHCP reservations', 'Jumbo frames'),
    correct: ['a'],
    explanation: 'VLANs partition a switch into separate broadcast domains, isolating departments at Layer 2 unless inter-VLAN routing is configured. PoE supplies power; reservations and jumbo frames do not segment traffic.',
    references: [REF_1101]
  },
  {
    domain: NET, difficulty: 1, type: QType.SINGLE,
    stem: 'A default gateway is the router address a host uses to send traffic destined for other networks.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'True. The default gateway is the next-hop router for traffic leaving the local subnet. Without it, hosts cannot reach remote networks.',
    references: [REF_1101]
  },
  {
    domain: NET, difficulty: 2, type: QType.SINGLE,
    stem: 'Which technology delivers both data and electrical power to a device such as an IP camera over a single Ethernet cable?',
    options: opts4('PoE (Power over Ethernet)', 'DSL', 'NFC', 'Bluetooth'),
    correct: ['a'],
    explanation: 'PoE supplies power and data over one Ethernet cable, ideal for IP cameras, APs, and phones. DSL is a WAN broadband technology; NFC and Bluetooth are short-range wireless.',
    references: [REF_1101]
  },
  {
    domain: NET, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Windows command queries DNS to resolve a hostname and shows which DNS server answered?',
    options: opts4('nslookup', 'chkdsk', 'cls', 'shutdown'),
    correct: ['a'],
    explanation: 'nslookup performs DNS queries and reports the answering server and resolved records. The other commands handle disk repair, screen clearing, or shutdown.',
    references: [REF_WIN_CMD]
  },

  // ── Mobile Devices and Virtualization (8) ──
  {
    domain: MOB, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A user’s laptop will not connect to any Wi-Fi network, but a hardware function key toggles a small radio icon. What should the technician check first?',
    options: opts4(
      'That the wireless radio / airplane mode is enabled correctly (Wi-Fi turned on)',
      'The printer spooler',
      'The monitor color profile',
      'The BIOS boot order'
    ),
    correct: ['a'],
    explanation: 'Many laptops have a hardware/Fn key or airplane-mode toggle that disables the Wi-Fi radio. Confirming the radio is enabled is the quickest first check before deeper troubleshooting.',
    references: [REF_1101]
  },
  {
    domain: MOB, difficulty: 2, type: QType.SINGLE,
    stem: 'A smartphone overheats and the battery is visibly swollen. What is the correct action?',
    options: opts4(
      'Continue using it until it stops working',
      'Stop using/charging it and safely replace the battery following proper handling procedures',
      'Puncture the battery to release pressure',
      'Place it in a freezer indefinitely'
    ),
    correct: ['b'],
    explanation: 'A swollen lithium battery is a safety hazard. The device should be powered down, removed from charging, and the battery safely replaced/disposed of per proper procedures. Puncturing it is dangerous.',
    references: [REF_1102]
  },
  {
    domain: MOB, difficulty: 3, type: QType.SINGLE,
    stem: 'Which virtualization concept allows a single physical server to run multiple isolated operating systems simultaneously, each with virtual hardware?',
    options: opts4(
      'Virtual machines managed by a hypervisor',
      'A single dual-boot configuration',
      'Disk partitioning only',
      'A RAID array'
    ),
    correct: ['a'],
    explanation: 'A hypervisor presents virtual hardware so multiple isolated guest OSes (VMs) run concurrently on one host. Dual-boot runs one OS at a time; partitioning and RAID are storage concepts.',
    references: [REF_1101]
  },
  {
    domain: MOB, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL benefits commonly cited for using virtual machines in a lab or test environment.',
    options: opts4(
      'Snapshots allow quick rollback to a known state',
      'Multiple OS environments on one physical host',
      'Isolation/sandboxing of risky software',
      'Guaranteed faster performance than bare metal in all cases'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'VMs provide snapshots, OS consolidation, and isolation. They do not guarantee faster-than-bare-metal performance; virtualization adds some overhead.',
    references: [REF_1101]
  },
  {
    domain: MOB, difficulty: 2, type: QType.SINGLE,
    stem: 'A user reports very poor mobile data performance only inside a specific building. Which is the most likely cause?',
    options: opts4(
      'Weak cellular signal/coverage in that location',
      'A corrupted printer driver',
      'An expired domain certificate',
      'A full Recycle Bin'
    ),
    correct: ['a'],
    explanation: 'Location-specific poor cellular data typically indicates weak coverage/signal (building materials, distance from tower). The other items are unrelated to cellular reception.',
    references: [REF_1102]
  },
  {
    domain: MOB, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which short-range wireless technology is commonly used to pair a wireless headset or keyboard with a mobile device?',
    options: opts4('Bluetooth', 'LTE', 'Fibre Channel', 'SATA'),
    correct: ['a'],
    explanation: 'Bluetooth is the short-range standard for pairing peripherals like headsets and keyboards. LTE is cellular, while Fibre Channel and SATA are storage technologies.',
    references: [REF_1102]
  },
  {
    domain: MOB, difficulty: 3, type: QType.SINGLE,
    stem: 'A company wants applications and data delivered to users as a finished, vendor-managed web service with no infrastructure for the customer to maintain. Which model is this?',
    options: opts4('SaaS', 'IaaS', 'Private bare metal', 'Hybrid SAN'),
    correct: ['a'],
    explanation: 'SaaS delivers a complete, vendor-managed application over the web; the customer manages neither infrastructure nor the platform. IaaS gives infrastructure to manage; the others are not service models.',
    references: [REF_1101]
  },
  {
    domain: MOB, difficulty: 2, type: QType.SINGLE,
    stem: 'A laptop runs hot and fans are loud only when running many VMs. Which is the most reasonable explanation?',
    options: opts4(
      'High CPU/RAM load from the virtual machines increases heat and fan speed',
      'The DNS server is down',
      'The keyboard backlight is on',
      'The screen saver is enabled'
    ),
    correct: ['a'],
    explanation: 'Running multiple VMs heavily loads CPU and memory, increasing heat output and fan speed. The unrelated software/network items do not cause sustained thermal load.',
    references: [REF_1101]
  },

  // ── Operating Systems (12) ──
  {
    domain: OS, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which file system is commonly used for cross-platform USB flash drives that must store files larger than 4 GB?',
    options: opts4('FAT32', 'exFAT', 'NTFS (read-only on many devices)', 'HFS+'),
    correct: ['b'],
    explanation: 'exFAT supports files larger than 4 GB and is widely cross-platform, making it ideal for large-file flash drives. FAT32 has a 4 GB file limit; NTFS/HFS+ have limited cross-platform write support.',
    references: [REF_WIN_NTFS]
  },
  {
    domain: OS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Linux command lists files, including detailed permissions and ownership, in the current directory?',
    options: opts4('ls -l', 'cd /', 'rm -rf', 'echo'),
    correct: ['a'],
    explanation: 'ls -l lists directory contents with permissions, owner, size, and timestamps. cd changes directories, rm removes files, and echo prints text.',
    references: [REF_APLUS]
  },
  {
    domain: OS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Windows tool would a technician use to add, repair, or remove installed desktop applications?',
    options: opts4(
      'Apps & features / Programs and Features',
      'Magnifier',
      'Character Map',
      'Steps Recorder'
    ),
    correct: ['a'],
    explanation: 'Apps & features (Settings) or Programs and Features (Control Panel) manages installed application add/repair/remove. The other tools are accessibility/utility apps.',
    references: [REF_WIN_INSTALL]
  },
  {
    domain: OS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which macOS feature provides a fast desktop search for files, apps, and information?',
    options: opts4('Spotlight', 'Registry Editor', 'Disk Management', 'Task Scheduler'),
    correct: ['a'],
    explanation: 'Spotlight is the macOS system-wide search. Registry Editor, Disk Management, and Task Scheduler are Windows tools.',
    references: [REF_APPLE_MAC]
  },
  {
    domain: OS, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL valid Windows upgrade/installation methods.',
    options: opts4(
      'In-place upgrade keeping apps and files',
      'Clean install from bootable media',
      'Network/PXE-based deployment',
      'Editing the monitor refresh rate to install Windows'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Windows can be deployed via in-place upgrade, clean install from media, or network/PXE imaging. Monitor refresh rate has nothing to do with OS installation.',
    references: [REF_WIN_INSTALL]
  },
  {
    domain: OS, difficulty: 2, type: QType.SINGLE,
    stem: 'A technician needs the absolute current working directory path in a Linux terminal. Which command provides it?',
    options: opts4('pwd', 'ps', 'top', 'df'),
    correct: ['a'],
    explanation: 'pwd prints the full path of the current working directory. ps lists processes, top shows live resource usage, and df reports disk space.',
    references: [REF_APLUS]
  },
  {
    domain: OS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Windows console manages services, allowing a technician to start, stop, or set startup type?',
    options: opts4('services.msc', 'mspaint', 'calc', 'write'),
    correct: ['a'],
    explanation: 'services.msc opens the Services console to control Windows services and their startup type. mspaint, calc, and write are unrelated applications.',
    references: [REF_WIN_CMD]
  },
  {
    domain: OS, difficulty: 1, type: QType.SINGLE,
    stem: 'NTFS permissions can be applied to both files and folders to control user access on a Windows volume.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'True. NTFS supports access control lists on files and folders, enabling granular permissions per user/group.',
    references: [REF_WIN_NTFS]
  },
  {
    domain: OS, difficulty: 3, type: QType.SINGLE,
    stem: 'A Windows feature must roll the system back to a previous good configuration after a problematic driver install, without affecting user documents. Which feature is appropriate?',
    options: opts4(
      'System Restore (restore point)',
      'Disk Cleanup',
      'Format C:',
      'Defragment and Optimize Drives'
    ),
    correct: ['a'],
    explanation: 'System Restore reverts system files, drivers, and registry to an earlier restore point while typically leaving personal files intact. The other tools do not roll back system state safely.',
    references: [REF_WIN_RECOVERY]
  },
  {
    domain: OS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which partition style supports more than four primary partitions and disks larger than 2 TB, and is required for UEFI boot?',
    options: opts4('GPT', 'MBR', 'FAT', 'RAID'),
    correct: ['a'],
    explanation: 'GPT supports many partitions and large disks and is required for UEFI booting. MBR is limited to four primary partitions and ~2 TB; FAT is a file system and RAID is a storage scheme.',
    references: [REF_WIN_DISK]
  },
  {
    domain: OS, difficulty: 3, type: QType.SINGLE,
    stem: 'A help-desk script must repeat an action for every user in a list on Windows. Which native tool is most appropriate to automate this?',
    options: opts4(
      'A PowerShell script using a loop',
      'Microsoft Paint macros',
      'The Calculator history',
      'The Snipping Tool timer'
    ),
    correct: ['a'],
    explanation: 'PowerShell supports loops, variables, and cmdlets for administrative automation across many users. The other tools have no scripting/automation capability.',
    references: [REF_WIN_POWERSHELL]
  },
  {
    domain: OS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Windows utility shows real-time per-process CPU, memory, disk, and network usage and lets you end an unresponsive process?',
    options: opts4('Task Manager', 'Notepad', 'WordPad', 'Paint 3D'),
    correct: ['a'],
    explanation: 'Task Manager displays live resource usage and lets you terminate hung processes. The other applications have no process-management features.',
    references: [REF_WIN_CMD]
  },

  // ── Security (12) ──
  {
    domain: SEC, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which practice most directly reduces the risk from known software vulnerabilities being exploited?',
    options: opts4(
      'Disabling the firewall',
      'Applying security patches/updates promptly',
      'Using the same password everywhere',
      'Turning off antivirus'
    ),
    correct: ['b'],
    explanation: 'Promptly applying patches closes known vulnerabilities before attackers exploit them. The other options weaken security posture.',
    references: [REF_1102]
  },
  {
    domain: SEC, difficulty: 2, type: QType.SINGLE,
    stem: 'A strong organizational password policy should require which of the following?',
    options: opts4(
      'Short passwords with no expiration',
      'Sufficient length/complexity, lockout after failed attempts, and no password reuse',
      'Sharing passwords among the team',
      'Writing passwords on monitors'
    ),
    correct: ['b'],
    explanation: 'Effective password policies enforce adequate length/complexity, account lockout thresholds, and prevent reuse. The other options seriously weaken security.',
    references: [REF_1102]
  },
  {
    domain: SEC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which device hardening step reduces attack surface by removing unneeded functionality?',
    options: opts4(
      'Enable every available service by default',
      'Disable or uninstall unused services, ports, and default accounts',
      'Use the default administrator password',
      'Open all firewall ports'
    ),
    correct: ['b'],
    explanation: 'Hardening disables/uninstalls unnecessary services and accounts and closes unused ports to shrink the attack surface. The other options expand exposure.',
    references: [REF_1102]
  },
  {
    domain: SEC, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL examples of social engineering.',
    options: opts4(
      'Phishing email impersonating IT support',
      'Shoulder surfing to read a password',
      'Pretexting a phone call to extract information',
      'A power supply failure'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Phishing, shoulder surfing, and pretexting manipulate people to gain access/information — all social engineering. A power supply failure is a hardware fault, not an attack technique.',
    references: [REF_1102]
  },
  {
    domain: SEC, difficulty: 2, type: QType.SINGLE,
    stem: 'A laptop with sensitive data must be protected so that, if stolen, the drive contents cannot be read on another machine. Which control is most effective?',
    options: opts4(
      'A BIOS supervisor password only',
      'Full-disk encryption (e.g., BitLocker/FileVault)',
      'A desktop shortcut to lock the screen',
      'Hiding files in a folder'
    ),
    correct: ['b'],
    explanation: 'Full-disk encryption renders the drive unreadable without the key even if removed and mounted elsewhere. A BIOS password and hidden folders do not protect data on a removed drive.',
    references: [REF_WIN_BITLOCKER]
  },
  {
    domain: SEC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which control limits which programs can execute on a workstation by permitting only approved software?',
    options: opts4(
      'Application allow-listing (whitelisting)',
      'Disabling the antivirus',
      'Granting all users admin rights',
      'Opening all inbound firewall ports'
    ),
    correct: ['a'],
    explanation: 'Application allow-listing permits only explicitly approved applications to run, blocking unknown/malicious software. The other options reduce security.',
    references: [REF_1102]
  },
  {
    domain: SEC, difficulty: 3, type: QType.SINGLE,
    stem: 'An employee’s account should be disabled the moment they leave the company. Which security principle/process does this support?',
    options: opts4(
      'Account/offboarding lifecycle management (timely deprovisioning)',
      'Increasing screen brightness',
      'Disabling logging',
      'Sharing the account with the replacement hire'
    ),
    correct: ['a'],
    explanation: 'Timely deprovisioning of accounts during offboarding prevents former employees retaining access. Sharing the account or disabling logging would create serious security gaps.',
    references: [REF_1102]
  },
  {
    domain: SEC, difficulty: 1, type: QType.SINGLE,
    stem: 'A Windows firewall can restrict inbound and outbound network connections based on configured rules.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'True. A host firewall enforces rules controlling inbound and outbound traffic, helping block unauthorized connections.',
    references: [REF_WIN_DEFENDER]
  },
  {
    domain: SEC, difficulty: 2, type: QType.SINGLE,
    stem: 'A user is tricked into entering credentials on a fake site reached via a link in a text message. What is this attack called?',
    options: opts4('Smishing', 'Vishing', 'Whaling (only)', 'Tailgating'),
    correct: ['a'],
    explanation: 'Smishing is phishing carried out via SMS/text messages. Vishing uses voice calls, whaling targets executives, and tailgating is a physical entry attack.',
    references: [REF_1102]
  },
  {
    domain: SEC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which is the most appropriate way to securely sanitize an SSD before redeploying it internally?',
    options: opts4(
      'Use the manufacturer’s secure-erase / cryptographic-erase function',
      'Drag files to the Recycle Bin',
      'Hide the partition',
      'Change the volume label'
    ),
    correct: ['a'],
    explanation: 'SSDs are best sanitized with a vendor secure-erase or cryptographic-erase, which clears all cells/keys. Deleting files, hiding partitions, or relabeling leaves data recoverable.',
    references: [REF_1102]
  },
  {
    domain: SEC, difficulty: 3, type: QType.SINGLE,
    stem: 'A workstation’s browser is redirected to unwanted sites and shows constant pop-ups after a toolbar was installed. Which malware category best fits?',
    options: opts4('Browser hijacker / adware (PUP)', 'Boot sector virus', 'Hardware keylogger', 'Logic bomb'),
    correct: ['a'],
    explanation: 'Unwanted redirects and pop-ups tied to an installed toolbar are typical of browser-hijacking adware/PUPs. A boot sector virus, hardware keylogger, and logic bomb have different behaviors.',
    references: [REF_1102]
  },
  {
    domain: SEC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which authentication factor is "something you are"?',
    options: opts4(
      'A fingerprint or facial biometric',
      'A password',
      'A smart card',
      'A one-time code app'
    ),
    correct: ['a'],
    explanation: 'Biometrics (fingerprint, face) are the "something you are" factor. A password is "something you know"; a smart card and OTP app are "something you have".',
    references: [REF_1102]
  },

  // ── Software and Operational Troubleshooting (10) ──
  {
    domain: TRB, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'In the CompTIA troubleshooting methodology, which step comes immediately after testing the theory and confirming the cause?',
    options: opts4(
      'Identify the problem',
      'Establish a plan of action to resolve the problem and implement the solution',
      'Document findings',
      'Question the user'
    ),
    correct: ['b'],
    explanation: 'After confirming the cause, you establish a plan of action and implement the solution. Identifying and questioning occur earlier; documentation is the final step.',
    references: [REF_1102]
  },
  {
    domain: TRB, difficulty: 2, type: QType.SINGLE,
    stem: 'A Windows PC repeatedly blue-screens on startup after a recent driver update. Which recovery option should be tried first to remove the bad driver?',
    options: opts4(
      'Reinstall all applications',
      'Boot into Safe Mode and roll back/uninstall the driver',
      'Replace the motherboard',
      'Disable DNS'
    ),
    correct: ['b'],
    explanation: 'Safe Mode loads minimal drivers, letting you roll back or uninstall the offending driver. This least-invasive step should precede hardware replacement or unrelated changes.',
    references: [REF_WIN_RECOVERY]
  },
  {
    domain: TRB, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A user says "the internet is down." Following best practice, what should the technician do first?',
    options: opts4(
      'Replace the router immediately',
      'Gather information and ask the user clarifying questions to identify the problem',
      'Reinstall Windows',
      'Format the drive'
    ),
    correct: ['b'],
    explanation: 'Step one is identifying the problem by gathering information and questioning the user (scope, recent changes, what "down" means). Drastic actions before diagnosis waste time and risk data.',
    references: [REF_1102]
  },
  {
    domain: TRB, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL actions that are part of proper change/operational procedures when applying a fix in a business environment.',
    options: opts4(
      'Assess potential impact and have a rollback/backout plan',
      'Obtain appropriate approval per change management',
      'Document the change and outcome',
      'Apply changes without informing anyone to save time'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Operational best practice includes impact assessment with a backout plan, change approval, and documentation. Applying undocumented, unapproved changes violates change management.',
    references: [REF_1102]
  },
  {
    domain: TRB, difficulty: 2, type: QType.SINGLE,
    stem: 'An application reports "missing DLL" errors after a partial uninstall. Which approach is most appropriate first?',
    options: opts4(
      'Repair or reinstall the affected application',
      'Replace the power supply',
      'Reset the BIOS',
      'Re-cable the monitor'
    ),
    correct: ['a'],
    explanation: 'Missing DLLs from a broken install are best fixed by repairing or reinstalling the application so its files/registry entries are restored. Hardware actions are unrelated to a software DLL error.',
    references: [REF_WIN_INSTALL]
  },
  {
    domain: TRB, difficulty: 3, type: QType.SINGLE,
    stem: 'A Windows machine boots very slowly and many unknown programs launch at login. Which tool best helps reduce startup load?',
    options: opts4(
      'Task Manager Startup tab (disable unnecessary startup apps)',
      'Calculator',
      'Snipping Tool',
      'Magnifier'
    ),
    correct: ['a'],
    explanation: 'The Task Manager Startup tab shows and disables programs that launch at login, improving boot time. The other utilities have no startup management.',
    references: [REF_WIN_CMD]
  },
  {
    domain: TRB, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Windows command can repair a corrupted Windows component store used by Windows Update and SFC?',
    options: opts4(
      'DISM /Online /Cleanup-Image /RestoreHealth',
      'ping 127.0.0.1',
      'cls',
      'color 0a'
    ),
    correct: ['a'],
    explanation: 'DISM with /Online /Cleanup-Image /RestoreHealth repairs the Windows component store, often run before sfc /scannow. The other commands do not repair system images.',
    references: [REF_WIN_CMD]
  },
  {
    domain: TRB, difficulty: 1, type: QType.SINGLE,
    stem: 'Verifying full system functionality and, if applicable, implementing preventive measures is part of the troubleshooting methodology before documentation.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'True. After implementing the solution you verify full functionality and apply preventive measures, then document findings, actions, and outcomes.',
    references: [REF_1102]
  },
  {
    domain: TRB, difficulty: 3, type: QType.SINGLE,
    stem: 'A technician must script a routine that maps a network drive for users at logon on Windows. Which is an appropriate native scripting choice?',
    options: opts4(
      'A batch (.bat/.cmd) or PowerShell logon script',
      'A spreadsheet formula',
      'A BIOS setting',
      'A monitor OSD menu'
    ),
    correct: ['a'],
    explanation: 'Batch or PowerShell logon scripts can map network drives at sign-in (often via Group Policy). Spreadsheets, BIOS, and monitor menus cannot perform logon automation.',
    references: [REF_WIN_POWERSHELL]
  },
  {
    domain: TRB, difficulty: 2, type: QType.SINGLE,
    stem: 'A specific website fails to load on one PC but works on others on the same network. Which is the best first step?',
    options: opts4(
      'Clear the browser cache/cookies and try another browser to isolate the issue',
      'Replace the network switch',
      'Reinstall the operating system',
      'Reset everyone’s passwords'
    ),
    correct: ['a'],
    explanation: 'Since only one PC and one site are affected, a local browser issue is likely. Clearing cache/cookies and testing another browser isolates the cause before broader, disruptive actions.',
    references: [REF_1102]
  }
];

// ───────────────────── Practice Exam 3 ─────────────────────
const P3: Q[] = [
  // ── Hardware (12) ──
  {
    domain: HW, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which component is primarily responsible for executing program instructions and performing calculations in a computer?',
    options: opts4('CPU', 'Power supply', 'Network card', 'Optical drive'),
    correct: ['a'],
    explanation: 'The CPU (processor) executes instructions and performs computations. The PSU supplies power, the NIC handles networking, and the optical drive reads discs.',
    references: [REF_1101]
  },
  {
    domain: HW, difficulty: 2, type: QType.SINGLE,
    stem: 'A technician must add memory to a laptop. Which memory form factor is typically used in laptops?',
    options: opts4('SO-DIMM', 'Full-size DIMM', 'RIMM', 'SIPP'),
    correct: ['a'],
    explanation: 'Laptops use the smaller SO-DIMM form factor. Full-size DIMMs are for desktops/servers, while RIMM and SIPP are obsolete.',
    references: [REF_1101]
  },
  {
    domain: HW, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which connector typically delivers power to a 3.5-inch SATA hard disk drive?',
    options: opts4(
      'A 15-pin SATA power connector',
      'A PS/2 connector',
      'An RJ-45 connector',
      'A VGA connector'
    ),
    correct: ['a'],
    explanation: 'SATA drives receive power via a 15-pin SATA power connector from the PSU. PS/2 is for legacy peripherals, RJ-45 is networking, and VGA is video.',
    references: [REF_1101]
  },
  {
    domain: HW, difficulty: 3, type: QType.SINGLE,
    stem: 'A four-drive array must maximize usable capacity while still surviving a single disk failure. Which RAID level best fits?',
    options: opts4('RAID 0', 'RAID 5', 'RAID 1', 'RAID 10'),
    correct: ['b'],
    explanation: 'RAID 5 across four drives yields 3 drives of usable capacity while tolerating one failure — better capacity efficiency than RAID 1 or RAID 10 for the same drive count. RAID 0 has no redundancy.',
    references: [REF_1101]
  },
  {
    domain: HW, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL items that are appropriate ESD/safety precautions when servicing a PC.',
    options: opts4(
      'Disconnect AC power before opening the case',
      'Use an anti-static mat and grounded wrist strap',
      'Avoid working on carpet without ESD protection',
      'Hold expansion cards by their gold edge contacts'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Disconnecting power, using anti-static mat/strap, and avoiding ungrounded carpet are correct precautions. Cards should be held by the edges, NOT by the gold contacts, to prevent contamination/ESD damage.',
    references: [REF_1101]
  },
  {
    domain: HW, difficulty: 2, type: QType.SINGLE,
    stem: 'Which display technology characteristic distinguishes OLED panels from typical LCD panels?',
    options: opts4(
      'OLED pixels emit their own light, enabling true blacks (no separate backlight)',
      'OLED always requires a CCFL backlight',
      'OLED can only display monochrome output',
      'OLED uses a spinning mirror to form an image'
    ),
    correct: ['a'],
    explanation: 'OLED pixels are self-emissive, so they can turn fully off for true blacks and need no backlight. LCDs require a backlight (LED/CCFL).',
    references: [REF_1101]
  },
  {
    domain: HW, difficulty: 2, type: QType.SINGLE,
    stem: 'An inkjet printer produces output with missing colors and white horizontal lines. What is the most appropriate first step?',
    options: opts4(
      'Run the printer’s nozzle check and head cleaning utility',
      'Replace the motherboard',
      'Reinstall Windows',
      'Reset the router'
    ),
    correct: ['a'],
    explanation: 'Missing colors/banding on inkjets typically indicate clogged nozzles. Running the built-in nozzle check and head-cleaning routine is the correct first step before replacing hardware.',
    references: [REF_1101]
  },
  {
    domain: HW, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'A UPS (uninterruptible power supply) provides battery backup so a system can shut down gracefully during a power outage.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'True. A UPS supplies temporary battery power during outages and conditions power, allowing a safe, graceful shutdown and protecting against data loss.',
    references: [REF_1101]
  },
  {
    domain: HW, difficulty: 3, type: QType.SINGLE,
    stem: 'A PC randomly loses connection to its NVMe drive and reports drive errors. Firmware and another known-good slot were tested with the same result on this drive. What is the most likely conclusion?',
    options: opts4(
      'The DNS cache is corrupt',
      'The NVMe SSD itself is failing and should be replaced (after backing up data)',
      'The monitor needs recalibration',
      'The keyboard driver is outdated'
    ),
    correct: ['b'],
    explanation: 'When the same drive fails across firmware updates and a known-good slot, the drive itself is the fault. Back up data immediately and replace the SSD. The other items are unrelated to storage faults.',
    references: [REF_1101]
  },
  {
    domain: HW, difficulty: 2, type: QType.SINGLE,
    stem: 'Which cooling method uses a liquid loop with a pump, radiator, and fans to dissipate CPU heat?',
    options: opts4(
      'Liquid (AIO/custom loop) cooling',
      'Passive heatsink only with no airflow ever',
      'Thermal throttling software',
      'A larger power supply'
    ),
    correct: ['a'],
    explanation: 'Liquid cooling circulates coolant through a block, pump, and radiator with fans to remove CPU heat efficiently. Throttling software and a larger PSU do not provide cooling.',
    references: [REF_1101]
  },
  {
    domain: HW, difficulty: 2, type: QType.SINGLE,
    stem: 'A user wants to expand a desktop’s connectivity with additional USB and an extra display output via an expansion slot. Which is the correct approach?',
    options: opts4(
      'Install an appropriate PCIe expansion card (e.g., USB/graphics card)',
      'Replace the CPU',
      'Reinstall the OS',
      'Increase the page file'
    ),
    correct: ['a'],
    explanation: 'Adding a PCIe expansion card (USB controller or graphics card) provides additional ports/outputs. Replacing the CPU or OS reinstallation does not add physical connectivity.',
    references: [REF_1101]
  },
  {
    domain: HW, difficulty: 3, type: QType.SINGLE,
    stem: 'A desktop intermittently powers off completely under varying loads; voltages on the PSU rails are out of spec when tested. Which component should be replaced?',
    options: opts4(
      'The power supply unit',
      'The sound card',
      'The optical drive',
      'The webcam'
    ),
    correct: ['a'],
    explanation: 'Out-of-spec rail voltages causing unexpected shutdowns indicate a failing PSU, which should be replaced. The other peripherals would not cause whole-system power loss.',
    references: [REF_1101]
  },

  // ── Networking (11) ──
  {
    domain: NET, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which TCP port does FTP use for its control connection by default?',
    options: opts4('21', '22', '53', '443'),
    correct: ['a'],
    explanation: 'FTP uses TCP port 21 for control. Port 22 is SSH/SFTP, port 53 is DNS, and port 443 is HTTPS.',
    references: [REF_1101]
  },
  {
    domain: NET, difficulty: 2, type: QType.SINGLE,
    stem: 'A technician needs to assign a server a permanent IP from the DHCP server tied to its MAC address. Which feature is used?',
    options: opts4('DHCP reservation', 'APIPA', 'PoE', 'NAT'),
    correct: ['a'],
    explanation: 'A DHCP reservation always assigns the same IP to a specific MAC address, keeping centralized management while providing a stable address. APIPA, PoE, and NAT do not perform this.',
    references: [REF_1101]
  },
  {
    domain: NET, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which addressing characteristic is true of IPv6 compared with IPv4?',
    options: opts4(
      'IPv6 uses 128-bit addresses, vastly expanding the address space',
      'IPv6 uses 32-bit addresses like IPv4',
      'IPv6 cannot be used on local networks',
      'IPv6 requires coaxial cabling'
    ),
    correct: ['a'],
    explanation: 'IPv6 uses 128-bit addresses, dramatically increasing available addresses versus IPv4’s 32-bit space. IPv6 works on local and wide networks over standard media.',
    references: [REF_1101]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE,
    stem: 'Users on one floor lose network access while others are fine. The affected floor connects through a single access switch. What is the most likely focus of investigation?',
    options: opts4(
      'The user accounts of everyone in the company',
      'The access switch / uplink serving that floor',
      'The DNS root servers',
      'Each user’s monitor cable'
    ),
    correct: ['b'],
    explanation: 'A single floor losing access points to a shared device — the floor’s access switch or its uplink. Company-wide accounts and DNS roots would affect everyone; monitor cables are unrelated to network access.',
    references: [REF_1101]
  },
  {
    domain: NET, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL valid uses of a firewall in a SOHO/business network.',
    options: opts4(
      'Block inbound connections to unused services',
      'Allow only specific outbound traffic by policy',
      'Filter traffic by port/protocol/address',
      'Increase the monitor refresh rate'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Firewalls block unwanted inbound traffic, control outbound flows by policy, and filter by port/protocol/address. Monitor refresh rate is unrelated to firewalls.',
    references: [REF_1101]
  },
  {
    domain: NET, difficulty: 2, type: QType.SINGLE,
    stem: 'Which wireless standard family (Wi-Fi 6/6E) operates with high throughput and, for 6E, adds the 6 GHz band?',
    options: opts4('802.11ax', '802.11b', '802.11a', '802.3'),
    correct: ['a'],
    explanation: '802.11ax is Wi-Fi 6/6E, offering high efficiency/throughput and (6E) 6 GHz support. 802.11b/a are older Wi-Fi standards and 802.3 is wired Ethernet.',
    references: [REF_1101]
  },
  {
    domain: NET, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Windows command displays active TCP connections and listening ports on the local machine?',
    options: opts4('netstat', 'sfc', 'chkdsk', 'cls'),
    correct: ['a'],
    explanation: 'netstat shows active connections and listening ports. sfc/chkdsk are repair tools, and cls clears the console.',
    references: [REF_WIN_CMD]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE,
    stem: 'A SOHO router must allow external users to reach an internal web server on a specific port. Which feature should be configured?',
    options: opts4(
      'Port forwarding (port mapping) to the internal server',
      'Disabling the firewall entirely',
      'Turning off DHCP',
      'Lowering the wireless channel width'
    ),
    correct: ['a'],
    explanation: 'Port forwarding maps an external port to an internal host/port so external users can reach the internal service while keeping the rest of the network protected. Disabling the firewall is unsafe and unnecessary.',
    references: [REF_1101]
  },
  {
    domain: NET, difficulty: 1, type: QType.SINGLE,
    stem: 'A subnet mask determines which portion of an IP address represents the network and which represents the host.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'True. The subnet mask splits an IP address into network and host portions, which is essential for routing and determining local vs. remote destinations.',
    references: [REF_1101]
  },
  {
    domain: NET, difficulty: 2, type: QType.SINGLE,
    stem: 'Which internet connection type typically delivers the highest sustained bandwidth and lowest latency for a modern office?',
    options: opts4('Fiber optic', 'Dial-up', 'Satellite (geostationary)', 'ISDN'),
    correct: ['a'],
    explanation: 'Fiber generally provides the highest bandwidth and low latency. Dial-up and ISDN are very slow legacy options, and geostationary satellite adds significant latency.',
    references: [REF_1101]
  },
  {
    domain: NET, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command releases and renews a Windows client’s DHCP-assigned IPv4 address?',
    options: opts4(
      'ipconfig /release then ipconfig /renew',
      'sfc /scannow',
      'chkdsk /f',
      'tasklist'
    ),
    correct: ['a'],
    explanation: 'ipconfig /release drops the current lease and ipconfig /renew requests a new one from DHCP. The other commands repair files, check disks, or list processes.',
    references: [REF_WIN_IPCONFIG]
  },

  // ── Mobile Devices and Virtualization (8) ──
  {
    domain: MOB, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A laptop’s touchpad stops responding after a Windows update, but an external USB mouse works. What is the best first step?',
    options: opts4(
      'Update or reinstall the touchpad driver (and verify it is enabled)',
      'Replace the laptop battery',
      'Reinstall the printer',
      'Reset the router'
    ),
    correct: ['a'],
    explanation: 'A touchpad failing after an update while a USB mouse works points to a driver/enable issue. Updating/reinstalling the touchpad driver and confirming it is enabled is the correct first step.',
    references: [REF_1101]
  },
  {
    domain: MOB, difficulty: 2, type: QType.SINGLE,
    stem: 'A corporate phone is lost. Which MDM capability allows IT to protect company data on the device?',
    options: opts4(
      'Remote lock and remote wipe',
      'Increasing ringtone volume remotely',
      'Changing the wallpaper',
      'Disabling the camera flash'
    ),
    correct: ['a'],
    explanation: 'MDM remote lock and remote wipe protect corporate data on lost/stolen devices. Cosmetic actions like wallpaper or ringtone do not protect data.',
    references: [REF_1102]
  },
  {
    domain: MOB, difficulty: 3, type: QType.SINGLE,
    stem: 'Which is a key difference between a Type 2 hypervisor and a Type 1 hypervisor?',
    options: opts4(
      'A Type 2 hypervisor runs as an application on top of a host OS',
      'A Type 2 hypervisor runs directly on bare metal',
      'A Type 1 hypervisor cannot run multiple VMs',
      'A Type 1 hypervisor requires a web browser'
    ),
    correct: ['a'],
    explanation: 'A Type 2 (hosted) hypervisor runs as an application atop a host OS, while a Type 1 hypervisor runs directly on hardware. Both can run multiple VMs.',
    references: [REF_1101]
  },
  {
    domain: MOB, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL valid characteristics of cloud computing models commonly referenced in A+.',
    options: opts4(
      'IaaS provides virtualized infrastructure (VMs, storage, networking)',
      'PaaS provides a managed development/runtime platform',
      'SaaS delivers ready-to-use applications over the internet',
      'All cloud models eliminate the need for any user accounts'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'IaaS, PaaS, and SaaS describe increasing levels of provider-managed services. Cloud services still require identity/account management, so the last option is false.',
    references: [REF_1101]
  },
  {
    domain: MOB, difficulty: 2, type: QType.SINGLE,
    stem: 'A user reports their phone’s battery drains unusually fast after installing several new apps. Which is the best initial troubleshooting step?',
    options: opts4(
      'Review battery usage by app and disable/uninstall power-hungry or misbehaving apps',
      'Replace the motherboard',
      'Reformat the corporate file server',
      'Change the DNS server'
    ),
    correct: ['a'],
    explanation: 'Most mobile OSes show per-app battery usage. Identifying and removing/limiting power-hungry apps is the correct first step. Server/DNS/hardware actions are unrelated.',
    references: [REF_1102]
  },
  {
    domain: MOB, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which technology lets a smartphone make a contactless payment by tapping a terminal at very short range?',
    options: opts4('NFC', 'GPS', 'IMAP', 'RAID'),
    correct: ['a'],
    explanation: 'NFC (Near Field Communication) enables tap-to-pay at a few centimeters. GPS is location, IMAP is email retrieval, and RAID is storage redundancy.',
    references: [REF_1102]
  },
  {
    domain: MOB, difficulty: 3, type: QType.SINGLE,
    stem: 'An organization wants to test a risky software update without endangering production systems. Which virtualization feature is most useful?',
    options: opts4(
      'A VM snapshot taken before the update for fast rollback',
      'Increasing the host monitor brightness',
      'Disabling host networking permanently',
      'Removing all host RAM'
    ),
    correct: ['a'],
    explanation: 'Taking a VM snapshot before the change allows quick rollback if the update fails, isolating risk from production. The other options are irrelevant or harmful.',
    references: [REF_1101]
  },
  {
    domain: MOB, difficulty: 2, type: QType.SINGLE,
    stem: 'A laptop is extremely slow only when undocked and on battery, but fast when plugged in. Which is the most likely explanation?',
    options: opts4(
      'A power plan/CPU power management setting reduces performance on battery',
      'The DNS server is unreachable',
      'The keyboard is faulty',
      'The printer is offline'
    ),
    correct: ['a'],
    explanation: 'Power-saving plans throttle CPU/GPU on battery to extend runtime, causing slowness only when unplugged. Adjusting the power plan resolves it; the other items do not affect on-battery performance.',
    references: [REF_1101]
  },

  // ── Operating Systems (12) ──
  {
    domain: OS, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which is an example of an open-source operating system commonly used on servers and embedded devices?',
    options: opts4('Linux', 'Windows 11 Pro', 'macOS', 'ChromeOS Flex (proprietary core)'),
    correct: ['a'],
    explanation: 'Linux is a widely used open-source operating system. Windows and macOS are proprietary commercial operating systems.',
    references: [REF_APLUS]
  },
  {
    domain: OS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Windows tool provides a graphical view of disks/partitions to create, format, extend, or shrink volumes?',
    options: opts4('Disk Management (diskmgmt.msc)', 'Notepad', 'Paint', 'Calculator'),
    correct: ['a'],
    explanation: 'Disk Management creates, formats, extends, and shrinks volumes and assigns drive letters. The other tools have no disk capabilities.',
    references: [REF_WIN_DISK]
  },
  {
    domain: OS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Linux command changes the permission bits of a file or directory?',
    options: opts4('chmod', 'cat', 'ls', 'man'),
    correct: ['a'],
    explanation: 'chmod modifies permission bits (read/write/execute) for owner, group, and others. cat displays files, ls lists them, and man shows manual pages.',
    references: [REF_APLUS]
  },
  {
    domain: OS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which macOS feature lets a user remove an application by moving it to the Trash (for app-bundle installs) or using its uninstaller?',
    options: opts4(
      'Drag the app to the Trash / use the provided uninstaller',
      'Run gpedit.msc',
      'Use Windows Programs and Features',
      'Edit the Windows Registry'
    ),
    correct: ['a'],
    explanation: 'On macOS, many apps are removed by dragging the app bundle to the Trash or running a provided uninstaller. gpedit, Programs and Features, and the Registry are Windows-only.',
    references: [REF_APPLE_MAC]
  },
  {
    domain: OS, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about 32-bit vs 64-bit Windows.',
    options: opts4(
      '64-bit Windows can address far more than 4 GB of RAM',
      '64-bit Windows can run many 32-bit applications via compatibility layers',
      '32-bit Windows is generally limited to about 4 GB addressable memory',
      '32-bit Windows can natively run 64-bit applications'
    ),
    correct: ['a', 'b', 'c'],
    explanation: '64-bit Windows addresses much more RAM and runs many 32-bit apps via WoW64; 32-bit Windows is limited near 4 GB. A 32-bit OS cannot natively run 64-bit applications.',
    references: [REF_WIN_INSTALL]
  },
  {
    domain: OS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Windows utility edits low-level configuration keys and should be used with caution and a backup?',
    options: opts4('Registry Editor (regedit)', 'Calculator', 'Sticky Notes', 'Weather app'),
    correct: ['a'],
    explanation: 'regedit edits the Windows Registry; incorrect changes can destabilize the system, so backing up the registry/key first is recommended. The other apps do not edit system configuration.',
    references: [REF_WIN_CMD]
  },
  {
    domain: OS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command shows the Windows directory structure or changes directories at the command prompt?',
    options: opts4('cd and dir', 'ping', 'nslookup', 'tracert'),
    correct: ['a'],
    explanation: 'cd changes directories and dir lists directory contents in Windows. ping, nslookup, and tracert are networking tools.',
    references: [REF_WIN_CMD]
  },
  {
    domain: OS, difficulty: 1, type: QType.SINGLE,
    stem: 'A 64-bit edition of Windows is required to make full use of more than approximately 4 GB of RAM.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'True. A 32-bit OS is limited to roughly 4 GB of addressable memory, so a 64-bit edition is needed to use significantly more RAM.',
    references: [REF_WIN_INSTALL]
  },
  {
    domain: OS, difficulty: 3, type: QType.SINGLE,
    stem: 'A technician must deploy the same Windows image to 50 identical PCs efficiently. Which approach is most appropriate?',
    options: opts4(
      'Use imaging/deployment tools (e.g., disk image + network/PXE deployment)',
      'Manually install Windows separately on each PC with no automation',
      'Copy C:\\Windows folder over the network',
      'Email the ISO to each user'
    ),
    correct: ['a'],
    explanation: 'Imaging and network/PXE deployment apply a standardized image to many machines quickly and consistently. Manual per-PC installs are slow, and copying the Windows folder or emailing an ISO does not produce a bootable, sysprepped system.',
    references: [REF_WIN_INSTALL]
  },
  {
    domain: OS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Windows feature lets multiple local users keep separate desktops, documents, and settings on one PC?',
    options: opts4('User accounts/profiles', 'Disk Cleanup', 'Magnifier', 'Night Light'),
    correct: ['a'],
    explanation: 'Separate user accounts/profiles isolate each user’s desktop, files, and settings. Disk Cleanup, Magnifier, and Night Light do not provide multi-user separation.',
    references: [REF_WIN_INSTALL]
  },
  {
    domain: OS, difficulty: 3, type: QType.SINGLE,
    stem: 'A Linux server administrator must view running processes and resource usage in real time from the terminal. Which command is appropriate?',
    options: opts4('top (or htop)', 'mkdir', 'touch', 'mv'),
    correct: ['a'],
    explanation: 'top (or htop) displays live process and resource usage. mkdir creates directories, touch creates/updates files, and mv moves/renames files.',
    references: [REF_APLUS]
  },
  {
    domain: OS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Windows boot mode loads a minimal set of drivers and services to help troubleshoot startup issues?',
    options: opts4('Safe Mode', 'Game Mode', 'Tablet Mode', 'Focus Assist'),
    correct: ['a'],
    explanation: 'Safe Mode boots with minimal drivers/services to isolate and fix problems caused by drivers or software. Game Mode, Tablet Mode, and Focus Assist are unrelated features.',
    references: [REF_WIN_RECOVERY]
  },

  // ── Security (12) ──
  {
    domain: SEC, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which is the BEST practice for creating user passwords?',
    options: opts4(
      'Reuse one simple password everywhere',
      'Use long, unique passphrases and a password manager',
      'Use the username as the password',
      'Write passwords on a shared whiteboard'
    ),
    correct: ['b'],
    explanation: 'Long, unique passphrases stored in a reputable password manager strongly resist guessing and credential reuse attacks. The other options are insecure.',
    references: [REF_1102]
  },
  {
    domain: SEC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which control best mitigates the risk of unauthorized devices plugging into open network jacks in a lobby?',
    options: opts4(
      'Disable unused switch ports / enable port security',
      'Increase monitor brightness',
      'Disable the antivirus',
      'Share the Wi-Fi password publicly'
    ),
    correct: ['a'],
    explanation: 'Disabling unused ports or enabling port security prevents rogue devices from gaining network access via open jacks. The other options do not address physical port access.',
    references: [REF_1102]
  },
  {
    domain: SEC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A user should verify a website is using encryption before entering credentials. Which indicator is appropriate?',
    options: opts4(
      'HTTPS with a valid certificate (TLS) in the address bar',
      'The site loads quickly',
      'The site has many images',
      'The site uses a long domain name'
    ),
    correct: ['a'],
    explanation: 'HTTPS with a valid TLS certificate indicates the connection is encrypted and the server identity is validated. Speed, images, or domain length are not security indicators.',
    references: [REF_1102]
  },
  {
    domain: SEC, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL appropriate steps in the malware-removal best-practice process.',
    options: opts4(
      'Quarantine/disable System Restore and remediate the infected system',
      'Update anti-malware definitions and scan/remediate',
      'Educate the end user and re-enable protections afterward',
      'Immediately email the malware sample to all employees'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Best-practice malware removal includes quarantining and disabling System Restore during cleanup, updating definitions and remediating, then educating the user and restoring protections. Emailing malware to staff is harmful.',
    references: [REF_1102, REF_WIN_DEFENDER]
  },
  {
    domain: SEC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which authentication technology uses a physical or virtual token generating time-based one-time codes for MFA?',
    options: opts4(
      'A TOTP authenticator (hardware/soft token)',
      'A screensaver',
      'A spreadsheet of passwords',
      'A printed list of usernames'
    ),
    correct: ['a'],
    explanation: 'A TOTP authenticator generates rotating time-based codes used as a second factor in MFA. The other options provide no second factor.',
    references: [REF_1102]
  },
  {
    domain: SEC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which is the most secure method to dispose of paper documents containing customer PII?',
    options: opts4(
      'Cross-cut shredding (or certified secure document destruction)',
      'Placing them in the open recycling bin',
      'Reusing them as scratch paper',
      'Leaving them on a desk overnight'
    ),
    correct: ['a'],
    explanation: 'Cross-cut shredding or certified destruction renders PII documents unrecoverable. Open recycling, reuse, or leaving documents out exposes sensitive data.',
    references: [REF_1102]
  },
  {
    domain: SEC, difficulty: 3, type: QType.SINGLE,
    stem: 'An attacker calls pretending to be a vendor and asks an employee to install "support software." This combines which techniques?',
    options: opts4(
      'Vishing and social engineering to deliver malware',
      'A RAID rebuild',
      'A DNS cache flush',
      'A disk defragmentation'
    ),
    correct: ['a'],
    explanation: 'A deceptive phone call (vishing) using impersonation (social engineering) to get malicious software installed is a common attack chain. The other options are unrelated technical tasks.',
    references: [REF_1102]
  },
  {
    domain: SEC, difficulty: 1, type: QType.SINGLE,
    stem: 'Disabling AutoRun/AutoPlay for removable media helps prevent malware from automatically executing when a USB drive is inserted.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'True. Disabling AutoRun/AutoPlay prevents automatic execution of code from removable media, mitigating a common USB-based malware vector.',
    references: [REF_1102]
  },
  {
    domain: SEC, difficulty: 2, type: QType.SINGLE,
    stem: 'A shared workstation should ensure each technician’s actions are individually attributable. Which practice supports this?',
    options: opts4(
      'Each user has a unique account; no shared/generic logins',
      'Everyone uses one shared admin account',
      'Disable all auditing',
      'Use a blank password'
    ),
    correct: ['a'],
    explanation: 'Unique per-user accounts with auditing make actions individually attributable (accountability/non-repudiation). Shared accounts and disabled auditing eliminate accountability.',
    references: [REF_1102]
  },
  {
    domain: SEC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which security measure best protects data confidentiality on a USB flash drive that may be lost?',
    options: opts4(
      'Encrypt the drive (e.g., BitLocker To Go) with a strong passphrase',
      'Put the files in a folder named "private"',
      'Rename files to random names',
      'Use a longer file path'
    ),
    correct: ['a'],
    explanation: 'Encrypting the removable drive protects confidentiality if it is lost or stolen. Folder names, file renaming, and path length provide no real protection.',
    references: [REF_WIN_BITLOCKER]
  },
  {
    domain: SEC, difficulty: 3, type: QType.SINGLE,
    stem: 'An organization wants to restrict standard users from installing software on their workstations. Which approach achieves this?',
    options: opts4(
      'Remove local admin rights and enforce via policy (least privilege)',
      'Give all users administrator accounts',
      'Disable Windows Update',
      'Share the admin password with everyone'
    ),
    correct: ['a'],
    explanation: 'Running users as standard (non-admin) accounts with policy enforcement prevents unauthorized software installation, applying least privilege. The other options weaken control.',
    references: [REF_WIN_UAC]
  },
  {
    domain: SEC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which is a recommended response when a user reports they may have entered credentials on a phishing site?',
    options: opts4(
      'Immediately change the affected password (and any reused ones) and report the incident',
      'Ignore it since nothing happened yet',
      'Disable the firewall',
      'Share the incident details publicly'
    ),
    correct: ['a'],
    explanation: 'Promptly changing the compromised password (and any reused credentials) and reporting per incident-response policy limits attacker access. Ignoring or disabling controls increases risk.',
    references: [REF_1102]
  },

  // ── Software and Operational Troubleshooting (10) ──
  {
    domain: TRB, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which is the correct ordering of the first three CompTIA troubleshooting steps?',
    options: opts4(
      'Identify the problem → Establish a theory of probable cause → Test the theory',
      'Document → Implement → Identify',
      'Test the theory → Identify the problem → Plan',
      'Implement → Verify → Identify'
    ),
    correct: ['a'],
    explanation: 'The methodology starts with identifying the problem, then establishing a theory of probable cause, then testing the theory. Documentation is the final step.',
    references: [REF_1102]
  },
  {
    domain: TRB, difficulty: 2, type: QType.SINGLE,
    stem: 'A Windows update fails repeatedly with an error. Which built-in tool first helps diagnose and often fix update problems?',
    options: opts4(
      'Windows Update troubleshooter',
      'Microsoft Paint',
      'Calculator',
      'Snipping Tool'
    ),
    correct: ['a'],
    explanation: 'The Windows Update troubleshooter detects and resolves common update problems (services, cache, components). The other utilities have no diagnostic role.',
    references: [REF_WIN_CMD]
  },
  {
    domain: TRB, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'When multiple possible causes exist, what should a technician do per the methodology after testing fails to confirm the first theory?',
    options: opts4(
      'Establish a new theory or escalate',
      'Skip straight to documentation',
      'Replace all hardware',
      'Reinstall every application'
    ),
    correct: ['a'],
    explanation: 'If a theory is not confirmed by testing, the methodology says to establish a new theory of probable cause or escalate. Jumping to documentation or wholesale replacement is inappropriate.',
    references: [REF_1102]
  },
  {
    domain: TRB, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL examples of good operational/communication procedures for a technician.',
    options: opts4(
      'Set and meet expectations/timelines with the customer',
      'Maintain professionalism and avoid jargon when explaining to users',
      'Document the issue, actions, and outcome',
      'Make undocumented production changes during business hours without approval'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Professional communication, managing expectations, and documentation are core operational procedures. Undocumented, unapproved production changes violate change management.',
    references: [REF_1102]
  },
  {
    domain: TRB, difficulty: 2, type: QType.SINGLE,
    stem: 'A program installs but fails to launch with a runtime error referencing a missing runtime/redistributable. Which fix is most appropriate?',
    options: opts4(
      'Install the required runtime/redistributable the application depends on',
      'Replace the CPU',
      'Reset the router',
      'Change the wallpaper'
    ),
    correct: ['a'],
    explanation: 'Applications often require a runtime/redistributable; installing the required dependency resolves the launch error. Hardware/network/cosmetic changes do not address a missing software dependency.',
    references: [REF_WIN_INSTALL]
  },
  {
    domain: TRB, difficulty: 3, type: QType.SINGLE,
    stem: 'A Windows PC shows "low disk space" warnings and applications fail to save. Which is the best first step?',
    options: opts4(
      'Use Disk Cleanup/Storage Sense and remove unnecessary files to free space',
      'Replace the GPU',
      'Reinstall the network driver',
      'Disable the firewall'
    ),
    correct: ['a'],
    explanation: 'Freeing space with Disk Cleanup/Storage Sense (temp files, caches, old updates) typically resolves low-disk-space errors. The other actions do not address storage capacity.',
    references: [REF_WIN_CMD]
  },
  {
    domain: TRB, difficulty: 2, type: QType.SINGLE,
    stem: 'A user’s default search engine and homepage keep changing back after they reset them. Which is the most likely cause to investigate?',
    options: opts4(
      'A malicious browser extension/PUP re-applying the settings',
      'A failing power supply',
      'An incorrect subnet mask',
      'A defective monitor cable'
    ),
    correct: ['a'],
    explanation: 'Settings that revert are commonly caused by a malicious extension or PUP. Removing the offending extension/program and scanning is the right path. Hardware/network items would not change browser settings.',
    references: [REF_1102]
  },
  {
    domain: TRB, difficulty: 1, type: QType.SINGLE,
    stem: 'After resolving an issue, a technician should document the cause, the steps taken, and the outcome.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'True. The final methodology step is to document findings, actions, and outcomes for future reference and knowledge sharing.',
    references: [REF_1102]
  },
  {
    domain: TRB, difficulty: 3, type: QType.SINGLE,
    stem: 'A technician must back up a folder to a network share every Friday at 6 PM automatically on Windows. Which combination is appropriate?',
    options: opts4(
      'A backup script scheduled via Task Scheduler with a weekly trigger',
      'A spreadsheet reminder only',
      'A BIOS timer',
      'A monitor sleep setting'
    ),
    correct: ['a'],
    explanation: 'A script (batch/PowerShell) triggered by Task Scheduler on a weekly schedule automates the backup reliably. Spreadsheets, BIOS, and monitor settings cannot run scheduled jobs.',
    references: [REF_WIN_POWERSHELL]
  },
  {
    domain: TRB, difficulty: 2, type: QType.SINGLE,
    stem: 'A networked printer prints test pages from the print server but client jobs never arrive. Which is the most appropriate first troubleshooting focus?',
    options: opts4(
      'Verify client printer connection/driver and the print queue on the client/server',
      'Replace the client’s RAM',
      'Reinstall the client OS',
      'Replace the network switch'
    ),
    correct: ['a'],
    explanation: 'If the printer works from the server, the issue is likely the client connection, driver, or a stalled queue. Checking those is the least-invasive first step before hardware replacement or OS reinstall.',
    references: [REF_WIN_CMD]
  }
];

const APLUS_DOMAINS = [
  { name: HW, weight: 18 },
  { name: NET, weight: 17 },
  { name: MOB, weight: 13 },
  { name: OS, weight: 18 },
  { name: SEC, weight: 18 },
  { name: TRB, weight: 16 }
];

const APLUS_EXAMS: { slug: string; code: string; titleSuffix: string; descriptionSuffix: string; questions: Q[] }[] = [
  {
    slug: 'comptia-a-plus-p1',
    code: '220-1100-P1',
    titleSuffix: 'Practice Exam 1',
    descriptionSuffix: 'Practice exam 1 of 3 — full 90-minute, 65-question, blueprint-weighted set covering hardware, networking, mobile devices & virtualization, operating systems, security, and software & operational troubleshooting across Core 1 (220-1101) and Core 2 (220-1102).',
    questions: P1
  },
  {
    slug: 'comptia-a-plus-p2',
    code: '220-1100-P2',
    titleSuffix: 'Practice Exam 2',
    descriptionSuffix: 'Practice exam 2 of 3 — a second 90-minute, 65-question, blueprint-weighted set across Core 1 (220-1101) and Core 2 (220-1102).',
    questions: P2
  },
  {
    slug: 'comptia-a-plus-p3',
    code: '220-1100-P3',
    titleSuffix: 'Practice Exam 3',
    descriptionSuffix: 'Practice exam 3 of 3 — a third 90-minute, 65-question, blueprint-weighted set across Core 1 (220-1101) and Core 2 (220-1102).',
    questions: P3
  }
];

const APLUS_BUNDLE = {
  slug: 'comptia-a-plus',
  title: 'CompTIA A+ (220-1101 / 220-1102)',
  description: 'All 3 CompTIA A+ practice exams in one bundle — covering hardware, networking, mobile devices & virtualization, operating systems, security, and software & operational troubleshooting, aligned to the published CompTIA A+ Core 1 (220-1101) and Core 2 (220-1102) exam objectives.',
  price: 2000, // USD 20 — PRACTICE tier
  priceVoucher: 27400 // USD 274 — VOUCHER tier
};

type SeedResult = {
  vendor: 'created' | 'updated';
  exams: { slug: string; questionCount: number; teaserCount: number }[];
  bundle: 'created' | 'updated';
};

/**
 * Idempotent seed for the CompTIA A+ bundle. Safe to call repeatedly —
 * vendor / exam / bundle rows are upserted, and questions tagged
 * `generatedBy: 'manual:aplus-seed'` are deleted and re-created.
 *
 * Pass an existing PrismaClient (lifecycle managed by caller).
 */
export async function seedAplus(db: PrismaClient): Promise<SeedResult> {
  const existingVendor = await db.vendor.findUnique({ where: { slug: 'comptia' } });
  await db.vendor.upsert({
    where: { slug: 'comptia' },
    update: { name: 'CompTIA', description: 'CompTIA certifications — vendor-neutral IT credentials including A+, Network+, Security+, Linux+, and Server+.' },
    create: { slug: 'comptia', name: 'CompTIA', description: 'CompTIA certifications — vendor-neutral IT credentials including A+, Network+, Security+, Linux+, and Server+.' }
  });
  const vendor = await db.vendor.findUniqueOrThrow({ where: { slug: 'comptia' } });

  const examResults: SeedResult['exams'] = [];
  const examIds: Record<string, string> = {};

  for (const e of APLUS_EXAMS) {
    const title = `CompTIA A+ (220-1101 / 220-1102) — ${e.titleSuffix}`;
    const description = `${e.descriptionSuffix} Aligned to the published CompTIA A+ exam objectives.`;
    const examData = {
      title,
      code: e.code,
      description,
      level: 'Foundational',
      durationMinutes: 90,
      passingScore: 72,
      questionCount: e.questions.length,
      domains: APLUS_DOMAINS,
      published: true
    };
    const exam = await db.exam.upsert({
      where: { slug: e.slug },
      update: examData,
      create: { ...examData, slug: e.slug, vendorId: vendor.id }
    });
    examIds[e.slug] = exam.id;

    await db.question.deleteMany({ where: { examId: exam.id, generatedBy: 'manual:aplus-seed' } });
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
          generatedBy: 'manual:aplus-seed',
          isTeaser: !!q.isTeaser
        }
      });
      if (q.isTeaser) teaserCount++;
    }
    examResults.push({ slug: e.slug, questionCount: e.questions.length, teaserCount });
  }

  const existingBundle = await db.bundle.findUnique({ where: { slug: APLUS_BUNDLE.slug } });
  const bundle = await db.bundle.upsert({
    where: { slug: APLUS_BUNDLE.slug },
    update: {
      title: APLUS_BUNDLE.title,
      description: APLUS_BUNDLE.description,
      price: APLUS_BUNDLE.price,
      priceVoucher: APLUS_BUNDLE.priceVoucher,
      published: true
    },
    create: {
      slug: APLUS_BUNDLE.slug,
      title: APLUS_BUNDLE.title,
      description: APLUS_BUNDLE.description,
      price: APLUS_BUNDLE.price,
      priceVoucher: APLUS_BUNDLE.priceVoucher,
      published: true
    }
  });

  // Replace bundle items deterministically: drop existing, recreate.
  await db.bundleItem.deleteMany({ where: { bundleId: bundle.id } });
  const items = [
    { examSlug: 'comptia-a-plus-p1', tier: 'PRACTICE' as const, position: 1 },
    { examSlug: 'comptia-a-plus-p2', tier: 'PRACTICE' as const, position: 2 },
    { examSlug: 'comptia-a-plus-p3', tier: 'PRACTICE' as const, position: 3 },
    { examSlug: 'comptia-a-plus-p1', tier: 'VOUCHER' as const, position: 4 }
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
