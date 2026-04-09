import type { ModuleData, CaseStudyVariant } from '../module-types';

export const module02: ModuleData & { caseStudyPool: CaseStudyVariant[] } = {
  id: 2,
  title: 'Windows Security',
  description:
    'Arsitektur & Operasi Windows, Konfigurasi & Monitoring Keamanan, Windows Defender, BitLocker, GPO, dan Windows Firewall',
  iconName: 'Server',

  // ──────────────────────────────────────────────
  // THEORY (7 items)
  // ──────────────────────────────────────────────
  theory: [
    {
      title: 'Arsitektur Windows: Kernel Mode vs User Mode',
      content:
        'Windows NT menggunakan arsitektur microkernel hibrida yang membagi eksekusi ke dalam dua mode proteksi hardware: Kernel Mode (Ring 0) dan User Mode (Ring 3). Pembagian ini adalah mekanisme keamanan fundamental yang mencegah aplikasi pengguna dari mengakses langsung hardware atau memori sistem operasi. Pemahaman arsitektur ini penting karena banyak teknik serangan (privilege escalation, rootkit) bertujuan untuk berpindah dari User Mode ke Kernel Mode.',
      table: {
        caption: 'Perbandingan Kernel Mode dan User Mode pada Windows',
        headers: ['Aspek', 'Kernel Mode (Ring 0)', 'User Mode (Ring 3)'],
        rows: [
          ['Privilege Level', 'Penuh — akses langsung ke hardware dan semua memori', 'Terbatas — hanya akses ke virtual address space sendiri'],
          ['Komponen', 'NT Kernel, HAL, Device Drivers, Executive, Win32k.sys', 'Aplikasi (browser, office), DLL, Win32 subsystem'],
          ['Crash Impact', 'BSOD (Blue Screen of Death) — sistem crash total', 'Hanya proses yang crash, OS tetap berjalan'],
          ['Memory Access', 'Akses ke seluruh physical memory', 'Hanya virtual memory yang dialokasikan OS'],
          ['Keamanan', 'Kode di sini sangat dipercaya; exploit kernel = game over', 'Diproteksi oleh mekanisme seperti ASLR, DEP, CFG'],
          ['Contoh Exploit', 'Rootkit, driver exploit (PrintNightmare), EternalBlue', 'Buffer overflow, privilege escalation via Token manipulation'],
          ['Akses Hardware', 'Langsung melalui HAL (Hardware Abstraction Layer)', 'Melalui System Calls ke kernel (tidak langsung)'],
        ],
      },
      keyPoints: [
        'HAL (Hardware Abstraction Layer): lapisan antara kernel dan hardware fisik, memungkinkan Windows berjalan di berbagai arsitektur (x86, x64, ARM).',
        'SSDT (System Service Descriptor Table): tabel pointer fungsi kernel yang digunakan rootkit untuk intercept system calls — ini adalah teknik hooking yang dideteksi oleh AV/EDR modern.',
        'ASLR (Address Space Layout Randomization): mengacak base address memori setiap kali proses diload, mempersulit eksploitasi buffer overflow.',
        'DEP/NX (Data Execution Prevention): mencegah kode dieksekusi dari halaman memori yang ditandai sebagai data — penting untuk mencegah shellcode execution.',
        'SMEP/SMAP: fitur CPU modern yang mencegah Kernel Mode mengeksekusi/mengakses User Mode pages secara langsung — penting untuk mencegah kernel exploit.',
        'Protected Process Light (PPL): mekanisme Windows 8.1+ yang melindungi proses kritis (LSASS) dari akses oleh proses non-trusted, menyulitkan credential dumping.',
      ],
      note: 'Banyak serangan ransomware dan APT modern mencoba privilege escalation dari User Mode ke Kernel Mode menggunakan driver vulnerability (Bring Your Own Vulnerable Driver/BYOVD). Contoh: driver Gigabyte yang rentan digunakan oleh ransomware BlackByte.',
      noteType: 'warning',
    },
    {
      title: 'Windows Registry & Security',
      content:
        'Windows Registry adalah database hierarki terpusat yang menyimpan konfigurasi sistem operasi, perangkat keras, software, dan preferensi pengguna. Registry diorganisasi dalam struktur tree dengan root keys (Hive), sub-keys, dan values. Bagi security analyst, Registry adalah sumber bukti forensik yang sangat kaya dan juga target utama penyerang untuk menanamkan persistence mekanisme.',
      codeSnippet: `# ============================================================
# Registry Paths Penting untuk Security Analysis
# ============================================================

# --- PERSISTENCE LOCATIONS (Malware sering menulis di sini) ---
# Run keys — dieksekusi otomatis saat user login
HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run
HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run
HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\RunOnce

# Services persistence
HKLM\\SYSTEM\\CurrentControlSet\\Services

# Scheduled Tasks (dalam registry)
HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Schedule\\TaskCache

# --- CREDENTIAL & AUTHENTICATION ---
# SAM database (lokal user accounts + password hashes)
HKLM\\SAM\\SAM\\Domains\\Account\\Users
# (hanya bisa dibaca dengan SYSTEM privilege / offline)

# LSA Secrets (service account passwords, cached domain creds)
HKLM\\SECURITY\\Policy\\Secrets

# --- AUDIT & FORENSIC VALUE ---
# MRU (Most Recently Used) files — jejak file yang pernah dibuka
HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\RecentDocs
HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\RunMRU

# USB history — perangkat USB yang pernah terhubung
HKLM\\SYSTEM\\CurrentControlSet\\Enum\\USBSTOR

# Network connections history
HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\NetworkList\\Profiles

# --- COMMON MALWARE TECHNIQUES ---
# Image File Execution Options (IFEO) — teknik hijacking proses
HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Image File Execution Options

# AppInit_DLLs — DLL injection ke setiap proses
HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Windows\\AppInit_DLLs

# ============================================================
# PowerShell: Query registry untuk forensic
# ============================================================
# Lihat semua Run keys (persistence check)
Get-ItemProperty "HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run"
Get-ItemProperty "HKCU:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run"

# Cari nilai registry yang mengandung kata "Temp" (red flag)
Get-ChildItem -Path "HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run" |
  Where-Object { $_.GetValue('') -match 'Temp|AppData|Roaming' }

# Export seluruh HKLM untuk forensic
reg export HKLM C:\\forensic\\hklm_backup.reg`,
      note: 'Alat Autoruns dari Sysinternals Suite (Microsoft) adalah cara paling efisien untuk memeriksa semua titik autostart di registry sekaligus. Setiap entry yang tidak dikenal harus diinvestigasi. Warna merah di Autoruns = tidak ada digital signature = sangat mencurigakan.',
      noteType: 'warning',
    },
    {
      title: 'Windows CLI & PowerShell untuk Security Analysis',
      content:
        'Command-line tools adalah senjata utama security analyst. Windows menyediakan dua environment CLI: Command Prompt (cmd.exe) legacy dan PowerShell modern yang berbasis .NET. Bagi seorang SOC analyst, menguasai keduanya sangat penting untuk melakukan triage cepat tanpa bergantung pada tools pihak ketiga yang mungkin tidak tersedia di saat insiden.',
      codeSnippet: `# ============================================================
# CMD.EXE — Perintah Security Essentials
# ============================================================

# System Information
systeminfo                              # info lengkap OS, hotfix, hardware
hostname && whoami /all                # identitas sistem dan hak akses user saat ini
net user                               # daftar semua local user accounts
net localgroup administrators          # siapa saja dalam grup admin lokal?

# Network Analysis
netstat -ano                           # semua koneksi + PID
netstat -ano | findstr ESTABLISHED     # hanya koneksi yang aktif
netstat -ano | findstr LISTENING       # port yang sedang listening
arp -a                                 # ARP cache (IP-to-MAC mapping)
ipconfig /all                          # konfigurasi jaringan lengkap
route print                            # routing table
nslookup malicious-domain.com          # DNS lookup investigasi

# Process & Service
tasklist /v /fo csv                    # daftar proses dengan detail
tasklist /m /fi "pid eq [PID]"         # DLL yang dimuat oleh proses tertentu
sc query type= all state= all          # semua service Windows
sc qc [service_name]                   # konfigurasi service tertentu
wmic process list full                 # detail proses via WMI (lebih verbose)
wmic service list brief | findstr Running

# File System
dir /a /o:d C:\\Windows\\Temp          # file di Temp diurutkan by date
icacls C:\\SensitiveFolder             # permission file/folder
attrib +h +s evil.exe                  # [ATTACKER TECHNIQUE] sembunyikan file
forfiles /p C:\\ /s /d +1 /c "cmd /c echo @path"  # file dimodifikasi hari ini

# ============================================================
# POWERSHELL — Security Analysis
# ============================================================

# Proses mencurigakan (path tidak wajar)
Get-Process | Where-Object {$_.Path -notlike "C:\\Windows\\*" -and
  $_.Path -notlike "C:\\Program Files*"} |
  Select-Object Name, Id, Path, CPU | Sort-Object CPU -Descending

# Koneksi jaringan dengan nama proses
Get-NetTCPConnection -State Established |
  Select-Object LocalAddress, LocalPort, RemoteAddress, RemotePort,
    @{Name='Process';Expression={(Get-Process -Id $_.OwningProcess).Name}},
    @{Name='Path';Expression={(Get-Process -Id $_.OwningProcess).Path}} |
  Sort-Object RemoteAddress

# Semua scheduled tasks (persistence check)
Get-ScheduledTask | Where-Object {$_.State -eq 'Ready'} |
  Select-Object TaskName, TaskPath, @{Name='Action';Expression={$_.Actions.Execute}}

# Event Log — login failures (brute force detection)
Get-WinEvent -FilterHashtable @{LogName='Security'; Id=4625} -MaxEvents 50 |
  Select-Object TimeCreated,
    @{Name='User';Expression={$_.Properties[5].Value}},
    @{Name='IP';Expression={$_.Properties[19].Value}},
    @{Name='Reason';Expression={$_.Properties[8].Value}}

# Hash semua executable di folder Temp (IOC collection)
Get-ChildItem C:\\Windows\\Temp -Recurse -Include *.exe,*.dll,*.ps1 |
  Get-FileHash -Algorithm SHA256 | Export-Csv C:\\forensic\\hashes.csv

# Base64 decode (malware sering encode payload)
[System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String("dGVzdA=="))

# Cek PowerShell execution policy (jika Too Restrictive = hardened)
Get-ExecutionPolicy -List

# ============================================================
# Sysinternals Tools (download dari live.sysinternals.com)
# ============================================================
# \\\\live.sysinternals.com\\tools\\autoruns.exe  # autostart locations
# \\\\live.sysinternals.com\\tools\\procexp.exe   # Process Explorer (advanced)
# \\\\live.sysinternals.com\\tools\\procmon.exe   # Process Monitor (real-time)
# \\\\live.sysinternals.com\\tools\\tcpview.exe   # network connections GUI`,
      note: 'PowerShell sering disalahgunakan penyerang karena kemampuannya yang powerful dan sering tidak diblokir antivirus. Teknik "Living off the Land" menggunakan PowerShell untuk download & execute payload di memori tanpa menyentuh disk (fileless attack). Pastikan PowerShell Script Block Logging diaktifkan via Group Policy.',
      noteType: 'danger',
    },
    {
      title: 'Windows Event Logs & Event IDs untuk Security Monitoring',
      content:
        'Windows Event Log adalah pencatatan aktivitas sistem yang komprehensif, tersimpan di file .evtx. Untuk security analyst, event log adalah sumber utama bukti forensik dan basis untuk SIEM correlation rules. Log disimpan di tiga kanal utama: Security, System, dan Application, serta ratusan Application and Services Logs untuk komponen spesifik.',
      table: {
        caption: 'Event ID Windows yang kritis untuk Security Monitoring',
        headers: ['Event ID', 'Log Channel', 'Nama Event', 'Signifikansi Security', 'Red Flag Kondisi'],
        rows: [
          ['4624', 'Security', 'An account was successfully logged on', 'Setiap login berhasil. Audit semua logon untuk anomali.', 'Logon Type 3 (network) dari IP aneh di luar jam kerja'],
          ['4625', 'Security', 'An account failed to log on', 'Login gagal — bisa indikasi brute force.', '> 10 kali dalam 5 menit dari IP yang sama'],
          ['4648', 'Security', 'Logon attempted using explicit credentials', 'Pass-the-Hash, lateral movement menggunakan alternate credentials.', 'Terjadi dari proses non-interaktif seperti svchost'],
          ['4672', 'Security', 'Special privileges assigned to new logon', 'Akun dengan privilege admin login — perlu diaudit.', 'Akun non-admin tiba-tiba mendapat privilege ini'],
          ['4688', 'Security', 'A new process has been created', 'Pelacakan eksekusi program — wajib untuk threat hunting.', 'cmd.exe/powershell.exe di-spawn oleh Office, browser'],
          ['4698', 'Security', 'A scheduled task was created', 'Persistence mechanism umum digunakan malware.', 'Task baru dengan nama acak atau path di Temp'],
          ['4720', 'Security', 'A user account was created', 'Pembuatan akun baru — bisa backdoor account.', 'Di luar jam kerja atau oleh akun non-HR'],
          ['4732', 'Security', 'A member was added to a security-enabled local group', 'Privilege escalation — user ditambah ke grup Admin.', 'User reguler ditambah ke Administrators group'],
          ['4776', 'Security', 'The computer attempted to validate credentials', 'Validasi NTLM — penting untuk deteksi credential attack.', 'Volume tinggi tiba-tiba dari satu sumber'],
          ['4768/4769', 'Security', 'Kerberos authentication ticket (AS/TGS) requested', 'Kerberoasting dan overpass-the-hash meninggalkan jejak di sini.', 'Banyak TGS request untuk service accounts'],
          ['7045', 'System', 'A new service was installed', 'Malware sering menginstal diri sebagai service.', 'Service dengan nama acak atau binary path di Temp'],
          ['1102', 'Security', 'The audit log was cleared', 'Log dihapus — hampir selalu tanda aktivitas jahat.', 'Selalu alert jika event ini muncul'],
          ['4657', 'Security', 'A registry value was modified', 'Perubahan registry — monitoring persistence locations.', 'Perubahan di Run keys, Services, IFEO'],
        ],
      },
      codeSnippet: `# PowerShell: Hunting Lateral Movement (Event 4648 + 4624 Type 3)
$start = (Get-Date).AddDays(-7)
Get-WinEvent -FilterHashtable @{
  LogName='Security'; Id=4624; StartTime=$start
} | Where-Object {
  $_.Properties[8].Value -eq 3  # Logon Type 3 = Network
} | Select-Object TimeCreated,
  @{N='TargetUser';E={$_.Properties[5].Value}},
  @{N='SourceIP';E={$_.Properties[18].Value}},
  @{N='WorkstationName';E={$_.Properties[11].Value}} |
  Where-Object { $_.SourceIP -ne '-' -and $_.SourceIP -ne '::1' } |
  Group-Object SourceIP | Sort-Object Count -Descending | Select-Object -First 20

# Detect process spawning anomaly (cmd/powershell dari Office apps)
Get-WinEvent -FilterHashtable @{LogName='Security'; Id=4688} -MaxEvents 1000 |
  Where-Object {
    $_.Properties[5].Value -match 'cmd\.exe|powershell\.exe|wscript\.exe' -and
    $_.Properties[13].Value -match 'winword|excel|outlook|chrome'
  } | Select-Object TimeCreated,
    @{N='ParentProcess';E={$_.Properties[13].Value}},
    @{N='NewProcess';E={$_.Properties[5].Value}},
    @{N='CommandLine';E={$_.Properties[8].Value}}`,
      note: 'Aktifkan "Audit Process Creation" dan "Include command line in process creation events" via Group Policy untuk mendapatkan Event 4688 yang berisi command line lengkap. Tanpa ini, Anda hanya tahu proses apa yang berjalan, bukan dengan argumen apa.',
      noteType: 'warning',
    },
    {
      title: 'Windows Defender & BitLocker — Keamanan Built-in Windows',
      content:
        'Microsoft terus meningkatkan kemampuan keamanan built-in Windows. Windows Defender (sekarang Microsoft Defender Antivirus) dan Microsoft Defender for Endpoint telah berkembang dari antivirus sederhana menjadi platform EDR enterprise. BitLocker menyediakan enkripsi disk penuh yang terintegrasi dengan hardware TPM untuk proteksi data saat perangkat hilang atau dicuri.',
      keyPoints: [
        'Microsoft Defender Antivirus: proteksi real-time terhadap malware, ransomware, dan spyware. Terintegrasi dengan Windows Security Center dan dapat dikelola via Group Policy atau Intune.',
        'Cloud-delivered Protection: mengirim file mencurigakan ke Microsoft cloud untuk analisis dalam <1 detik — ini adalah cara Defender mendeteksi zero-day yang belum ada signaturenya.',
        'Tamper Protection: fitur yang mencegah perubahan pengaturan Defender tanpa autentikasi proper — penting untuk mencegah malware me-disable Defender.',
        'Microsoft Defender for Endpoint (MDE): versi enterprise dengan EDR, threat hunting, automated investigation, dan integrasi SIEM. Berbeda dengan Defender Antivirus yang gratis di setiap Windows.',
        'Controlled Folder Access: fitur anti-ransomware yang melindungi folder tertentu dari modifikasi oleh proses yang tidak dipercaya — sangat efektif melawan ransomware.',
        'BitLocker: enkripsi volume AES-128 atau AES-256. Memerlukan TPM 1.2+ untuk pre-boot authentication. Recovery key harus disimpan di Active Directory atau Azure AD.',
        'BitLocker Network Unlock: di domain environment, komputer bisa unlock otomatis jika terhubung ke jaringan corporate yang trusted — menghindari kebutuhan PIN manual untuk server.',
        'TPM (Trusted Platform Module): chip hardware yang menyimpan BitLocker key secara aman dan memastikan boot chain tidak dimodifikasi (Secure Boot verification).',
        'Measured Boot + Attestation: TPM merekam hash setiap komponen boot chain. Server dapat memverifikasi integritas boot komputer client — penting untuk zero-trust architecture.',
        'Windows Hello for Business: pengganti password dengan biometrik atau PIN yang di-backup oleh TPM dan sertifikat asymmetric — lebih aman dari password karena tidak dapat di-phish.',
      ],
      codeSnippet: `# Periksa status Windows Defender
Get-MpComputerStatus | Select-Object AMServiceEnabled, RealTimeProtectionEnabled,
  AntivirusEnabled, AntispywareEnabled, BehaviorMonitorEnabled,
  OnAccessProtectionEnabled, NISEnabled, CloudBlockLevel,
  AntivirusSignatureLastUpdated, QuickScanAge

# Cek status Controlled Folder Access (anti-ransomware)
Get-MpPreference | Select-Object EnableControlledFolderAccess, ControlledFolderAccessAllowedApplications

# Aktifkan CFA via PowerShell (sebagai admin)
Set-MpPreference -EnableControlledFolderAccess Enabled

# Status BitLocker semua drive
manage-bde -status

# Aktifkan BitLocker pada drive C: dengan TPM
Enable-BitLocker -MountPoint "C:" -EncryptionMethod XtsAes256 -TpmProtector

# Backup BitLocker recovery key ke Active Directory
Backup-BitLockerKeyProtector -MountPoint "C:" -KeyProtectorId (
  (Get-BitLockerVolume -MountPoint "C:").KeyProtector |
  Where-Object {$_.KeyProtectorType -eq 'RecoveryPassword'}
).KeyProtectorId

# Cek Tamper Protection status
Get-MpPreference | Select-Object DisableTamperProtection`,
    },
    {
      title: 'Group Policy Objects (GPO) untuk Penguatan Keamanan Windows',
      content:
        'Group Policy adalah mekanisme manajemen konfigurasi terpusat di lingkungan Active Directory Windows. GPO memungkinkan administrator menerapkan ratusan pengaturan keamanan ke seluruh komputer dan pengguna di domain secara terpusat dan konsisten. GPO adalah implementasi teknis dari security baseline dan compliance requirements di organisasi.',
      example: {
        title: 'Implementasi Security Baseline GPO untuk Workstation Enterprise',
        steps: [
          'ACCOUNT POLICY — Password Policy: Minimum length 14 karakter, complexity enabled, history 24 passwords, max age 90 hari, lockout setelah 5 percobaan gagal, lockout duration 30 menit. Path: Computer Configuration > Windows Settings > Security Settings > Account Policies.',
          'AUDIT POLICY — Aktifkan semua kategori audit kritis: Logon Events (Success+Failure), Account Logon (Success+Failure), Process Tracking (Success — wajib untuk Event 4688), Policy Change (Success+Failure), Object Access (Failure), Privilege Use (Failure). Path: Computer Configuration > Windows Settings > Security Settings > Advanced Audit Policy.',
          'USER RIGHTS ASSIGNMENT — Batasi hak akses kritikal: "Access this computer from the network" hanya Domain Admins dan Users; "Allow log on locally" hanya Users dan Admins; "Debug programs" hanya Administrators (sering dieksploitasi); "Act as part of the OS" dikosongkan.',
          'SECURITY OPTIONS — Hardening konfigurasi: Interactive logon: Do not display last username = Enabled; Accounts: Rename administrator account = ganti ke nama acak; Network security: LAN Manager authentication level = NTLMv2 only (tolak LM dan NTLMv1); UAC: Behavior of elevation prompt = Prompt for credentials (bukan hanya consent).',
          'POWERSHELL POLICY — Aktifkan ScriptBlock Logging dan Module Logging: Computer Configuration > Administrative Templates > Windows Components > Windows PowerShell. Execution Policy = RemoteSigned atau AllSigned. Ini mencatat semua perintah PowerShell yang dieksekusi, sangat berharga untuk investigasi.',
          'WINDOWS FIREWALL — Baseline firewall rules via GPO: Block semua inbound connections kecuali yang explicitly diizinkan; Enable logging blocked connections; Disable netbios dan LLMNR (vektor lateral movement). Path: Computer Configuration > Windows Settings > Security Settings > Windows Defender Firewall.',
          'SOFTWARE RESTRICTION / APPLOCKER — Whitelist aplikasi yang boleh berjalan: blokir eksekusi dari %TEMP%, %APPDATA%, dan path non-standar; Hanya izinkan executable yang ada di Program Files dan Windows. Efektif mencegah malware yang ditulis ke Temp folder.',
        ],
        result:
          'GPO security baseline yang diterapkan dari CIS Benchmark Level 1 untuk Windows 10/11 atau Windows Server dapat mengurangi attack surface lebih dari 80%. Microsoft juga menyediakan Security Compliance Toolkit (SCT) berisi template GPO siap pakai.',
      },
      codeSnippet: `# Cek GPO yang berlaku pada komputer lokal
gpresult /r                    # ringkasan
gpresult /h C:\\gpo_report.html # laporan HTML lengkap

# Paksa refresh GPO segera
gpupdate /force

# Audit GPO menggunakan PowerShell (memerlukan RSAT)
Get-GPO -All | Select-Object DisplayName, GpoStatus, ModificationTime |
  Sort-Object ModificationTime -Descending | Select-Object -First 20

# Cek security settings yang berlaku (lokal)
secedit /export /cfg C:\\security_audit.cfg /quiet
Get-Content C:\\security_audit.cfg | Select-String "PasswordComplexity|MinimumPasswordLength|LockoutBadCount"`,
    },
    {
      title: 'Windows Firewall & Fitur Keamanan Jaringan Windows',
      content:
        'Windows Defender Firewall with Advanced Security (WFAS) adalah stateful firewall host-based yang melindungi sistem dari traffic jaringan yang tidak diinginkan, baik dari luar (inbound) maupun ke luar (outbound). Berbeda dengan firewall perimeter, WFAS memberikan proteksi "last line of defense" langsung di endpoint, sangat penting di era kerja remote dan BYOD.',
      codeSnippet: `# ============================================================
# Windows Firewall Management via PowerShell & Netsh
# ============================================================

# Cek status firewall semua profil (Domain, Private, Public)
Get-NetFirewallProfile | Select-Object Name, Enabled, DefaultInboundAction, DefaultOutboundAction, LogFileName

# Lihat semua rules yang enabled dan allow inbound
Get-NetFirewallRule -Direction Inbound -Action Allow -Enabled True |
  Select-Object DisplayName, Profile, LocalPort, Protocol |
  Sort-Object DisplayName

# Buat rule untuk blokir port 445 (SMB) dari luar — mitigasi WannaCry
New-NetFirewallRule -DisplayName "Block SMB Inbound" -Direction Inbound \`
  -Protocol TCP -LocalPort 445 -Action Block -Profile Any

# Buat rule untuk allow aplikasi spesifik saja
New-NetFirewallRule -DisplayName "Allow AppName" -Direction Inbound \`
  -Program "C:\\\\Program Files\\\\App\\\\app.exe" -Action Allow

# Enable firewall logging (semua profil)
Set-NetFirewallProfile -Profile Domain,Public,Private \`
  -LogBlocked True -LogMaxSizeKilobytes 16384 \`
  -LogFileName "%systemroot%\\\\system32\\\\LogFiles\\\\Firewall\\\\pfirewall.log"

# Netsh legacy — masih sering digunakan di script
netsh advfirewall show allprofiles
netsh advfirewall firewall show rule name=all dir=in action=allow

# ============================================================
# Windows Defender Credential Guard & Device Guard
# ============================================================
# Credential Guard menggunakan virtualization-based security (VBS)
# untuk memproteksi LSASS dari credential dumping tools (Mimikatz)

# Cek apakah Credential Guard aktif
(Get-CimInstance -ClassName Win32_DeviceGuard -Namespace root\\Microsoft\\Windows\\DeviceGuard).SecurityServicesRunning
# Return: 1 = Credential Guard, 2 = HVCI (Hypervisor-Protected Code Integrity)

# Aktifkan Credential Guard via PowerShell (Windows 10/11 Enterprise)
# Lebih baik via GPO: Computer Config > Admin Templates > System > Device Guard
# "Turn On Virtualization Based Security" = Enabled
# "Credential Guard Configuration" = Enabled with UEFI lock

# ============================================================
# Windows Advanced Threat Protection Features
# ============================================================
# ASR (Attack Surface Reduction) Rules — blokir teknik serangan umum
# Block Office apps from creating child processes
Set-MpPreference -AttackSurfaceReductionRules_Ids D4F940AB-401B-4EFC-AADC-AD5F3C50688A \`
  -AttackSurfaceReductionRules_Actions Enabled

# Block execution of potentially obfuscated scripts
Set-MpPreference -AttackSurfaceReductionRules_Ids 5BEB7EFE-FD9A-4556-801D-275E5FFC04CC \`
  -AttackSurfaceReductionRules_Actions Enabled

# Cek semua ASR rules status
Get-MpPreference | Select-Object -ExpandProperty AttackSurfaceReductionRules_Ids
Get-MpPreference | Select-Object -ExpandProperty AttackSurfaceReductionRules_Actions`,
      keyPoints: [
        'Windows Firewall memiliki 3 profil: Domain (terhubung ke domain), Private (jaringan rumah/terpercaya), Public (jaringan publik/tidak terpercaya). Setiap profil bisa memiliki aturan berbeda.',
        'Stateful inspection: WFAS melacak connection state dan mengizinkan return traffic secara otomatis tanpa rule explicit — berbeda dengan packet filter sederhana.',
        'IPsec integration: WFAS terintegrasi dengan IPsec untuk authentication dan enkripsi koneksi antar komputer Windows di domain (Connection Security Rules).',
        'Credential Guard: menggunakan Hyper-V virtualization untuk memproteksi hash NTLM dan Kerberos ticket dari tools seperti Mimikatz — ini adalah pertahanan paling efektif terhadap Pass-the-Hash.',
        'Attack Surface Reduction (ASR) Rules: kumpulan lebih dari 15 rules yang secara spesifik memblokir teknik serangan umum seperti "Office apps membuat proses anak", "obfuscated script", dan "credential stealing dari LSASS".',
        'Windows Sandbox: lingkungan virtual terisolasi bawaan Windows 10/11 Pro untuk membuka file mencurigakan tanpa risiko — alternatif gratis untuk cloud sandbox.',
      ],
    },
  ],

  // ──────────────────────────────────────────────
  // LAB
  // ──────────────────────────────────────────────
  lab: {
    title: 'Lab 2: Windows Security Analysis — Forensik & Hardening',
    downloads: [
      {
        name: 'Sysinternals Suite',
        url: 'https://docs.microsoft.com/en-us/sysinternals/downloads/sysinternals-suite',
        description: 'Kumpulan tools keamanan Windows dari Microsoft: Autoruns, Process Explorer, Process Monitor, TCPView, dan lainnya.',
      },
      {
        name: 'Event Log Explorer (Free)',
        url: 'https://www.eventlogxp.com/',
        description: 'Tool untuk analisis Windows Event Log dengan kemampuan filter dan search yang lebih baik dari Event Viewer default.',
      },
    ],
    steps: [
      {
        title: 'Pengumpulan Informasi Sistem (System Triage)',
        description:
          'Kumpulkan informasi sistem lengkap menggunakan command prompt dan PowerShell. Ini mensimulasikan langkah pertama triage SOC saat merespons insiden di endpoint Windows.',
        command: 'systeminfo | findstr /C:"OS Name" /C:"OS Version" /C:"System Type" /C:"Total Physical Memory" && whoami /all && net user && net localgroup administrators',
        expectedOutput:
          'OS Name: Microsoft Windows 10 Pro\nOS Version: 10.0.xxxxx\n...\nUser Name: COMPUTER\\analyst\n...\nMembers: Administrator, [user list]',
        hint: 'Perhatikan kolom "Hotfix(s)" di output systeminfo. Jumlah hotfix yang sedikit bisa menandakan sistem jarang dipatch.',
        screenshotNote: 'Screenshot 1: Output systeminfo dan whoami /all menampilkan privilege dan group membership.',
      },
      {
        title: 'Analisis Koneksi Jaringan Aktif',
        description:
          'Periksa semua koneksi jaringan yang aktif dan korelasikan dengan nama proses. Identifikasi koneksi ke IP eksternal yang mencurigakan.',
        command: 'netstat -ano | findstr ESTABLISHED && echo --- && powershell "Get-NetTCPConnection -State Established | Select-Object LocalAddress,LocalPort,RemoteAddress,RemotePort,@{N=\'Process\';E={(Get-Process -Id $_.OwningProcess -EA SilentlyContinue).Name}}"',
        expectedOutput:
          'TCP    192.168.1.x:52xxx    8.8.8.8:443    ESTABLISHED    1234\n...\nLocalAddress   LocalPort   RemoteAddress   RemotePort   Process\n192.168.1.x    52xxx       8.8.8.8         443          chrome',
        hint: 'Flag -EA SilentlyContinue mencegah error saat proses sudah tidak ada. Fokus pada koneksi ke port non-standar atau ke IP luar negeri dari proses yang seharusnya tidak perlu internet.',
        screenshotNote: 'Screenshot 2: Tabel koneksi jaringan dengan nama proses. Tandai jika ada yang mencurigakan.',
        warningNote: 'Jika ada koneksi dari proses "svchost.exe" ke IP tidak dikenal di luar negeri, ini bisa indikasi C2 beacon. Catat IP-nya dan cek di VirusTotal atau Shodan.',
      },
      {
        title: 'Analisis Proses yang Berjalan',
        description:
          'Identifikasi proses yang berjalan dengan detail lengkap. Cari proses dengan parent process tidak wajar atau berjalan dari path yang mencurigakan.',
        command: 'tasklist /v /fo csv | more && powershell "Get-Process | Where-Object {$_.Path -ne $null} | Select-Object Name,Id,Path,CPU,WorkingSet | Sort-Object CPU -Desc | Select-Object -First 20"',
        expectedOutput:
          '"Image Name","PID","Session Name","Session#","Mem Usage","Status","User Name","CPU Time","Window Title"\n"System Idle Process","0","Services","0","8 K","Unknown","NT AUTHORITY\\SYSTEM"...\n...',
        hint: 'Gunakan Process Explorer dari Sysinternals untuk tampilan visual yang lebih baik. Klik kanan proses > Check VirusTotal untuk submit hash secara otomatis.',
        screenshotNote: 'Screenshot 3: Daftar proses lengkap. Identifikasi 3 proses yang paling banyak menggunakan CPU/Memory dan jelaskan fungsinya.',
      },
      {
        title: 'Review Windows Event Log — Security Events',
        description:
          'Buka Event Viewer (eventvwr.msc) dan analisis Security Log. Filter untuk event ID kritis: 4624, 4625, 4672, 4688. Gunakan PowerShell untuk analisis otomatis.',
        command: 'powershell "Get-WinEvent -FilterHashtable @{LogName=\'Security\'; Id=4625} -MaxEvents 20 | Select-Object TimeCreated, @{N=\'User\';E={$_.Properties[5].Value}}, @{N=\'IP\';E={$_.Properties[19].Value}} | Format-Table -AutoSize"',
        expectedOutput: 'TimeCreated              User               IP\n-----------              ----               --\n4/9/2026 14:23:15 PM     Administrator      192.168.1.105\n...',
        hint: 'Jika tidak ada Event 4625, sistem mungkin belum mengaktifkan audit logon failure. Cek: secpol.msc > Local Policies > Audit Policy > Audit Account Logon Events.',
        screenshotNote: 'Screenshot 4: Event Viewer menampilkan Security Log dengan filter Event ID 4625 (login gagal). Jika tidak ada, tampilkan langkah mengaktifkan audit policy.',
        warningNote: 'Jangan memodifikasi event log selama lab. Hanya baca dan analisis saja.',
      },
      {
        title: 'Pemeriksaan Autostart dan Persistence Locations',
        description:
          'Gunakan Autoruns (Sysinternals) dan PowerShell untuk memeriksa semua lokasi persistence. Ini adalah langkah kritis dalam mendeteksi malware yang "bertahan" setelah reboot.',
        command: 'powershell "Get-ItemProperty HKLM:\\\\SOFTWARE\\\\Microsoft\\\\Windows\\\\CurrentVersion\\\\Run | Select-Object * -ExcludeProperty PS*" && powershell "Get-ItemProperty HKCU:\\\\SOFTWARE\\\\Microsoft\\\\Windows\\\\CurrentVersion\\\\Run | Select-Object * -ExcludeProperty PS*"',
        expectedOutput: 'SecurityHealth    : C:\\Windows\\system32\\SecurityHealthSystray.exe\nOneDrive          : "C:\\Program Files\\Microsoft OneDrive\\OneDrive.exe" /background\n...',
        hint: 'Di Autoruns, centang "Check VirusTotal.com" di menu Options untuk otomatis cek semua entry. Entry berwarna merah (tidak ada signature) atau kuning (signature tidak terverifikasi) perlu investigasi.',
        screenshotNote: 'Screenshot 5: Output Run Keys dari Registry dan/atau tampilan Autoruns. Identifikasi setiap entry dan nilai masing-masing.',
      },
    ],
    deliverable:
      'Laporan lab (format PDF, minimal 6 halaman) berisi: (1) 5 screenshot berlabel dari setiap langkah, (2) tabel rangkuman temuan: proses mencurigakan (jika ada), koneksi jaringan tidak wajar, event log anomali, (3) jawaban: Apa perbedaan Event ID 4624 dan 4648? Mengapa Run Keys di Registry penting untuk forensik? (4) Rekomendasi hardening: minimal 5 pengaturan yang bisa diperbaiki dari sistem yang dianalisis.',
  },

  // ──────────────────────────────────────────────
  // DEFAULT CASE STUDY (fallback)
  // ──────────────────────────────────────────────
  caseStudy: {
    title: 'Insider Threat di Perusahaan Manufaktur — Analisis Event Log',
    scenario:
      'Seorang administrator IT di PT Manufaktur Maju Bersama menggunakan akses privileged-nya untuk secara diam-diam menyalin 12.000 file design produk eksklusif ke USB drive selama 3 bulan sebelum mengundurkan diri dan bergabung dengan perusahaan kompetitor. Insiden terdeteksi setelah 6 bulan ketika design produk yang identik muncul di catalog perusahaan pesaing. Investigasi digital forensik menemukan jejak aktivitas di Windows Event Log, USB device history di Registry, dan log akses file server.',
    questions: [
      'Event ID Windows apa saja yang dapat memberikan bukti aktivitas insider threat ini? Untuk setiap Event ID, jelaskan apa informasi yang bisa digali dan bagaimana menjadi bukti hukum yang valid.',
      'Bagaimana investigator menemukan history perangkat USB yang pernah dicolokkan ke komputer tersebut melalui Registry? Path Registry apa yang relevan dan data apa yang tersimpan di sana?',
      'Rancang program DLP (Data Loss Prevention) berlapis menggunakan fitur Windows bawaan (GPO, BitLocker To Go, Applocker) untuk mencegah exfiltrasi data via USB drive di masa mendatang.',
      'Jika kasus ini dibawa ke pengadilan, bagaimana chain of custody untuk bukti digital harus dijaga? Apa yang membuat bukti digital bisa ditolak di pengadilan Indonesia berdasarkan UU ITE?',
    ],
  },

  // ──────────────────────────────────────────────
  // CASE STUDY POOL (15 variants)
  // ──────────────────────────────────────────────
  caseStudyPool: [
    {
      title: 'Ransomware via RDP Brute Force di Sistem Rekam Medis RS Regional Harapan Sehat',
      scenario:
        'RS Regional Harapan Sehat menemukan bahwa server RME (Rekam Medis Elektronik) berbasis Windows Server 2019 terenkripsi ransomware Dharma/CrySiS. Investigasi menemukan Event ID 4625 sebanyak 4.800 kali dalam 2 jam dari IP eksternal yang sama, diikuti Event ID 4624 dengan Logon Type 10 (RemoteInteractive/RDP) dari IP yang sama — menandakan brute force RDP berhasil. Serangan terjadi malam Jumat jam 23.00, di luar jam operasional IT support. Password akun Administrator yang dieksploitasi adalah "Admin@2020".',
      questions: [
        'Rekonstruksi urutan serangan berdasarkan Event ID yang ditemukan. Buat timeline dari brute force hingga deployment ransomware, lengkap dengan Event ID yang menjadi bukti di setiap tahap.',
        'Audit kebijakan password yang ada: mengapa "Admin@2020" bisa lolos dari password policy yang seharusnya ada? Rancang password policy GPO yang ketat namun masih usable untuk staf rumah sakit yang bukan IT-savvy.',
        'RDP yang terekspos langsung ke internet adalah kesalahan fatal. Rancang arsitektur akses remote yang aman untuk rumah sakit: VPN dengan MFA, RDP Gateway, atau solusi lain, beserta pertimbangannya.',
        'Sebagai konsultan yang diminta membuat laporan post-incident untuk Dewan Direksi RS, apa saja isi laporan tersebut? Bagaimana menyampaikan kerugian data pasien secara transparan sambil mematuhi kewajiban pelaporan ke Kemenkes dan BSSN?',
      ],
    },
    {
      title: 'Pencurian Kredensial via PowerShell Attack di BPR Dana Sejahtera',
      scenario:
        'BPR Dana Sejahtera menginvestigasi transaksi mencurigakan setelah tim SOC menerima alert dari EDR: proses PowerShell dengan encoded command (Base64) dieksekusi dari konteks proses winword.exe di komputer salah satu teller. Payload PowerShell mendownload script Invoke-Mimikatz dari server eksternal dan mengekstrak credential dari LSASS. Event Log menunjukkan Event 4688 dengan command line berisi "powershell -enc [base64string]" dan Event 7045 menunjukkan service baru bernama "WindowsUpdate2" terinstal menit kemudian.',
      questions: [
        'Decode Base64 command tersebut secara konseptual: jelaskan teknik "PowerShell encoded command" dan mengapa teknik ini populer di kalangan penyerang. Bagaimana deteksinya dengan Script Block Logging?',
        'Bagaimana Mimikatz mengekstrak credential dari LSASS? Jelaskan teknis dump LSASS dan bagaimana Credential Guard dan Protected Process Light (PPL) dapat mencegahnya.',
        'Analisis Event 4688 yang mencatat winword.exe mem-spawn PowerShell. Ini adalah indikator kuat serangan Office macro atau exploit. Buat ASR (Attack Surface Reduction) rule GPO untuk mencegah Office apps membuat child processes.',
        'Service "WindowsUpdate2" yang diinstal adalah persistence mechanism. Rancang monitoring rule di SIEM untuk mendeteksi service baru yang diinstal di luar window maintenance (misalnya, di luar jam kerja atau oleh user non-admin).',
      ],
    },
    {
      title: 'GPO Misconfiguration dan Privilege Escalation di Instansi Pemerintah Kab. Merapi',
      scenario:
        'Auditor keamanan dari BSSN menemukan bahwa jaringan Windows Active Directory Pemkab Merapi memiliki GPO yang salah konfigurasi: setting "Debug Programs" user right diberikan ke grup "Domain Users" alih-alih hanya "Administrators". Ini memungkinkan siapa saja di domain untuk mengakses memori proses lain, termasuk dump credentials dari LSASS. Selain itu, ditemukan GPO lain yang menonaktifkan Windows Defender di seluruh komputer untuk "mempercepat kinerja". Auditor berhasil melakukan privilege escalation dari akun staf biasa ke Domain Admin dalam 15 menit.',
      questions: [
        'Jelaskan mengapa "Debug Programs" user right yang diberikan ke Domain Users adalah misconfiguration kritis. Teknik apa yang bisa dilakukan penyerang dengan hak ini dan bagaimana langkah eksploit dari staf biasa ke Domain Admin?',
        'Menonaktifkan Windows Defender di seluruh domain melalui GPO adalah praktik sangat buruk. Diskusikan "security vs performance" trade-off ini: apa alternatif yang lebih baik jika Defender dianggap memperlambat sistem legacy?',
        'Lakukan GPO security audit: tuliskan daftar 10 GPO setting yang wajib diperiksa dalam audit keamanan Active Directory, berdasarkan standar CIS Benchmark untuk Windows Server. Sertakan path GPO dan nilai yang benar.',
        'Buat prosedur regular GPO review untuk Pemkab Merapi: seberapa sering, siapa yang melakukan, tools apa yang digunakan (Microsoft Security Compliance Toolkit, etc.), dan bagaimana change management untuk perubahan GPO?',
      ],
    },
    {
      title: 'Serangan Pass-the-Hash Lateral Movement di Jaringan Universitas Negeri Khatulistiwa',
      scenario:
        'Tim SOC Universitas Negeri Khatulistiwa mendeteksi pola anomali di SIEM: satu IP address (komputer lab mahasiswa) melakukan autentikasi NTLM ke puluhan server universitas dalam 30 menit, termasuk server akademik, server keuangan, dan storage server riset. Event Log menunjukkan Event 4648 (Logon with explicit credentials) yang diikuti Event 4624 Type 3 (network logon) berhasil di setiap server yang diakses. Komputer yang digunakan terbukti tidak pernah memiliki akun dengan hak akses ke server tersebut sebelumnya.',
      questions: [
        'Jelaskan secara teknis bagaimana Pass-the-Hash (PtH) attack bekerja: bagaimana hash NTLM diperoleh, bagaimana digunakan tanpa mengetahui password plaintext, dan mengapa NTLM rentan terhadap teknik ini.',
        'Identifikasi Event ID spesifik yang menjadi tanda tangan (signature) serangan Pass-the-Hash. Tulis SIEM correlation rule menggunakan bahasa pseudocode atau SPL Splunk untuk mendeteksi pola lateral movement PtH.',
        'Credential Guard diklaim dapat mencegah PtH dengan menyembunyikan NTLM hash dari lsass.exe. Jelaskan bagaimana Credential Guard bekerja secara teknis (Virtualization-Based Security, isolated LSASS) dan kenapa ini membuat PtH lebih sulit meskipun tidak sepenuhnya mustahil.',
        'Rancang strategi pertahanan berlapis untuk mencegah lateral movement di jaringan universitas yang besar dan heterogen: network segmentation, local admin password management (LAPS), restricted admin mode RDP, dan SMB signing.',
      ],
    },
    {
      title: 'Fileless Malware via WMI Subscription di Sistem E-Commerce TokoBaru.id',
      scenario:
        'Tim SOC TokoBaru.id menemukan aktivitas mencurigakan: data transaksi secara periodik dikirim ke IP eksternal setiap malam pukul 02.00. Tidak ada file executable mencurigakan yang ditemukan di disk meskipun sudah dilakukan full scan antivirus. Investigasi mendalam menemukan WMI Event Subscription yang berisi PowerShell script encoded yang di-trigger setiap pukul 02.00 untuk mengeksekusi payload di memori. Subscription terdaftar atas nama service account "svc_backup" yang pernah dikompromikan 4 bulan lalu melalui phishing.',
      questions: [
        'Jelaskan mekanisme WMI (Windows Management Instrumentation) Event Subscription sebagai teknik persistence fileless. Mengapa ini sulit dideteksi oleh antivirus konvensional yang berbasis file scanning?',
        'Buat perintah PowerShell untuk menginventarisasi semua WMI Event Subscriptions aktif di sistem. Informasi apa yang harus dicari untuk mengidentifikasi subscription yang dibuat oleh malware vs yang legitimate?',
        'Fileless attack meninggalkan sedikit jejak di disk tetapi meninggalkan banyak jejak di memori dan event log. Jelaskan teknik memory forensics menggunakan Volatility untuk menganalisis artefak WMI persistence di memory dump.',
        'Rancang monitoring strategy untuk mendeteksi WMI abuse di SIEM: event apa yang harus dikumpulkan (WMI Activity log, Security log, Sysmon Event ID 19/20/21), dan threshold atau pattern apa yang menjadi alert trigger?',
      ],
    },
    {
      title: 'Serangan Kerberoasting di Active Directory Pabrik Otomotif Nusanta Motor',
      scenario:
        'Tim Red Team yang dikontrak Nusanta Motor berhasil melakukan Kerberoasting: dengan akun domain biasa, mereka meminta Kerberos TGS (Ticket Granting Service) ticket untuk semua service accounts yang memiliki SPN (Service Principal Name) terdaftar. Mereka memperoleh 23 TGS tickets offline dan berhasil crack 8 di antaranya dalam waktu 2 jam menggunakan hashcat dengan wordlist rockyou.txt. Di antara akun yang berhasil di-crack: akun "svc_backup" dengan password "Backup2019!" yang memiliki akses ke semua server produksi.',
      questions: [
        'Jelaskan Kerberos authentication flow secara lengkap (AS-REQ, AS-REP, TGS-REQ, TGS-REP) dan identifikasi di mana Kerberoasting mengeksploitasi protokol ini. Mengapa serangan ini tidak memerlukan hak admin dan hampir tidak terdeteksi?',
        'Identifikasi Event ID Kerberos yang menjadi jejak serangan Kerberoasting (khususnya terkait TGS-REQ). Tulis SIEM rule untuk mendeteksi volume anomali TGS request yang mengindikasikan Kerberoasting.',
        'Service accounts dengan SPN harus memiliki password panjang dan kompleks yang tidak bisa di-crack dengan wordlist. Rancang kebijakan pengelolaan service account: penggunaan gMSA (Group Managed Service Account), rotasi password otomatis, dan prinsip least privilege.',
        'Dari perspektif Active Directory hardening, apa yang harus dilakukan untuk meminimalkan permukaan serangan Kerberoasting: review semua SPN, identifikasi service accounts dengan password lemah, dan bagaimana LAPS (Local Admin Password Solution) berperan?',
      ],
    },
    {
      title: 'Malware via USB AutoRun pada Workstation Operator Telekomunikasi Nusatel',
      scenario:
        'Operator Nusatel melaporkan bahwa workstation NOC (Network Operations Center) mereka terinfeksi malware setelah seorang teknisi lapangan mencolokkan USB drive "yang ditemukan di parkiran kantor" untuk memeriksa isinya. USB tersebut mengandung file LNK (Windows shortcut) yang menyamar sebagai folder namun berisi command PowerShell tersembunyi di properti "Target". Saat diklik, malware menginstal keylogger dan backdoor yang memberikan akses RDP tersembunyi ke NOC network. NOC Nusatel memiliki visibilitas ke seluruh jaringan seluler nasional.',
      questions: [
        'Jelaskan secara teknis bagaimana file LNK (shortcut) bisa digunakan sebagai dropper malware. Apa informasi yang tersimpan dalam file LNK dan bagaimana menganalisisnya menggunakan tools seperti LNKParse atau forensik manual?',
        'Serangan "USB Drop" adalah teknik social engineering klasik (proven dalam Stuxnet). Rancang program security awareness training yang efektif untuk teknisi lapangan Nusatel: content, delivery method, dan cara mengukur efektivitasnya.',
        'Dari perspektif GPO hardening, bagaimana menonaktifkan AutoRun/AutoPlay untuk USB drives, membatasi eksekusi dari removable media, dan mengimplementasikan device control policy yang mengizinkan hanya USB tertentu (whitelisted device ID)?',
        'Akses ke NOC yang terkompromi sangat berbahaya karena dampaknya ke infrastruktur nasional. Rancang segmentasi jaringan dan access control untuk NOC: network zone, jump server, privileged access workstation (PAW), dan session recording.',
      ],
    },
    {
      title: 'Credential Dumping via LSASS di Startup Fintech PayNow',
      scenario:
        'PayNow (platform payment, memproses Rp 2 triliun/bulan) mendeteksi alert EDR: proses "lsass.exe" diakses oleh proses yang tidak dikenal "svchost_update.exe" dengan teknik MiniDump (OpenProcess + ReadProcessMemory ke LSASS). Alert terjadi di workstation CFO 30 menit setelah CFO membuka lampiran email berisi file .docx "Laporan Keuangan Q1 2026.docx" yang ternyata berisi macro berbahaya. Dalam 2 jam, penyerang sudah berhasil lateral movement ke server utama menggunakan credential yang dicuri.',
      questions: [
        'Jelaskan teknik credential dumping dari LSASS: apa yang disimpan di LSASS (NTLM hash, Kerberos tickets, plaintext credentials), mengapa LSASS menjadi target utama, dan bagaimana Protected Process Light (PPL) dan Credential Guard dapat mencegahnya.',
        'Analisis attack chain: dari dokumen Word dengan macro hingga lateral movement dalam 2 jam. Petakan ke MITRE ATT&CK (minimal 5 teknik). Untuk setiap teknik, sebutkan satu detection method dan satu prevention control.',
        'EDR berhasil mendeteksi akses mencurigakan ke LSASS. Jelaskan bagaimana EDR mendeteksi teknik ini: apa behavioral indicator yang digunakan (OpenProcess dengan PROCESS_VM_READ handle ke lsass, MiniDump API), dan mengapa signature-based AV sering gagal mendeteksi ini.',
        'Rancang hardening spesifik untuk workstation eksekutif tinggi (CFO, CEO, CISO) yang menjadi target favorit serangan: Privileged Access Workstation (PAW) concept, tidak ada email/browsing di workstation yang sama dengan akses sistem keuangan, dan monitoring tambahan.',
      ],
    },
    {
      title: 'Windows Event Log Tampering di Sistem Logistik Muatan Cepat Express',
      scenario:
        'Muatan Cepat Express menemukan bahwa penyerang yang berhasil masuk ke server pengiriman paket mencoba menghapus jejak dengan menghapus Security Event Log. Event ID 1102 (Security audit log was cleared) dan 4719 (System audit policy was changed) ditemukan di System Log yang belum sempat dihapus. SIEM juga mendeteksi gap mencurigakan: tidak ada event Security Log dari pukul 01.00-03.00 meskipun server seharusnya aktif. Penyerang menggunakan teknik "wevtutil cl Security" untuk membersihkan log.',
      questions: [
        'Mengapa menghapus event log adalah tanda bahaya yang hampir pasti menandakan aktivitas jahat? Jelaskan Event ID 1102 dan 4719 secara detail, termasuk informasi apa yang masih bisa diperoleh meskipun log sudah dihapus.',
        'Rancang arsitektur log management yang tamper-proof: bagaimana memastikan event log segera diforward ke SIEM/syslog server terpusat sebelum bisa dihapus di sumber? Apa tools yang tersedia (Windows Event Forwarding, Sysmon, Beats/Winlogbeat)?',
        'Meskipun Security Log dihapus, investigator masih bisa merekonstruksi aktivitas dari sumber lain. Identifikasi minimal 5 sumber bukti alternatif di Windows yang bisa memberikan informasi tentang aktivitas selama 2 jam yang gap tersebut.',
        'Buat incident response playbook khusus untuk "Event Log Tampering": langkah apa yang diambil segera setelah menemukan log dihapus, bagaimana menentukan scope intrusi meskipun log hilang, dan apa rekomendasi untuk penggugatan hukum?',
      ],
    },
    {
      title: 'Serangan Living-off-the-Land via WMI dan Scheduled Task di PLTU Khatulistiwa Power',
      scenario:
        'SOC PLTU Khatulistiwa Power menginvestigasi anomali: Scheduled Task bernama "WindowsDefenderUpdate" dibuat pada pukul 03.15 yang men-trigger wmic.exe dengan argumen panjang berisi IP address eksternal dan port 4444 (port Metasploit default). Task tersebut dieksekusi setiap 6 jam dan berhasil membuat reverse shell ke server luar negeri tanpa trigger alert antivirus karena hanya menggunakan tool Windows built-in (wmic.exe, powershell.exe). Investigasi menunjukkan initial access melalui akun service contractor yang terhubung via VPN.',
      questions: [
        '"Living off the Land" (LotL) attack menggunakan tool bawaan Windows untuk menghindari deteksi. Jelaskan mengapa teknik ini efektif, tool Windows mana yang paling sering disalahgunakan (LOLBins/LOLScripts), dan bagaimana membedakan penggunaan legitimate vs malicious.',
        'Buat comprehensive detection strategy untuk LotL attacks di environment OT/ICS seperti PLTU: behavioral analytics apa yang diterapkan di SIEM, Sysmon rules apa yang relevan (Event ID 1, 3, 7, 11), dan bagaimana mengelola false positive yang tinggi?',
        'Scheduled Task sebagai persistence mechanism: buat PowerShell script untuk menginventarisasi semua Scheduled Tasks yang dibuat baru-baru ini (dalam 30 hari terakhir), filter yang dibuat di luar jam kerja, dan identifikasi yang mencurigakan berdasarkan action yang dilakukan.',
        'Akun VPN contractor yang dieksploitasi adalah vektor umum serangan supply chain. Rancang contractor access management policy: provisioning akun temporary, MFA, network access segmentation (contractor hanya bisa akses segmen tertentu), dan monitoring aktivitas contractor real-time.',
      ],
    },
    {
      title: 'Defacement Website dan Backdoor di Server Stasiun TV MediaNusa Channel',
      scenario:
        'Website streaming MediaNusa Channel (platform berbasis Windows Server IIS) ditemukan ter-deface dan menampilkan pesan politik. Investigasi menemukan penyerang mengeksploitasi kerentanan dalam CMS custom berbasis ASP.NET (CVE score 8.8) untuk upload webshell "web.config.aspx" yang menyamar sebagai file konfigurasi IIS. Dari webshell ini, penyerang bisa mengeksekusi perintah sistem dengan hak IIS Application Pool. Event Log IIS menunjukkan POST request besar ke path yang tidak biasa tepat sebelum deface.',
      questions: [
        'Jelaskan cara kerja webshell: apa itu webshell, bagaimana penyerang menggunakannya untuk mengendalikan server dari browser, dan mengapa file "web.config.aspx" adalah nama yang dipilih penyerang (kamuflase).',
        'Analisis IIS access log untuk menemukan bukti webshell upload dan eksekusi: pola apa (metode HTTP, ukuran request, path tidak wajar) yang mengindikasikan aktivitas berbahaya? Buat query log analysis untuk mendeteksi webshell dari log IIS.',
        'Webshell berjalan dengan privilege IIS Application Pool yang mungkin terbatas. Namun penyerang berhasil privilege escalation ke SYSTEM. Jelaskan teknik privilege escalation dari IIS/web context ke SYSTEM di Windows Server.',
        'Rancang hardening Windows Server IIS untuk mencegah upload dan eksekusi webshell: directory permission (NTFS), execution prevention di folder upload, application whitelist via AppLocker, dan file integrity monitoring.',
      ],
    },
    {
      title: 'Insider Data Exfiltration via Cloud Storage di Firma Hukum Pratama Partners',
      scenario:
        'Firma hukum Pratama Partners menemukan bahwa salah satu partner junior, yang baru saja mengundurkan diri, telah mengupload lebih dari 15.000 file dokumen klien ke akun Google Drive pribadi selama 2 minggu sebelum pengunduran dirinya. DLP (Data Loss Prevention) tidak mendeteksi karena traffic HTTPS ke Google Drive dianggap legitimate oleh proxy. File log Windows menunjukkan volume file access yang sangat tidak normal dari workstation yang bersangkutan: rata-rata 50 file/hari melonjak ke 800 file/hari.',
      questions: [
        'DLP berbasis signature gagal mendeteksi exfiltrasi via cloud storage HTTPS. Jelaskan keterbatasan DLP konvensional dan pendekatan apa (SSL inspection, CASB/Cloud Access Security Broker, UEBA) yang lebih efektif untuk mendeteksi insider cloud exfiltration?',
        'Analisis anomali berbasis baseline: bagaimana sistem UEBA bisa mendeteksi lonjakan 50 ke 800 file access/hari sebagai anomali? Apa faktor lain yang harus dipertimbangkan (konteks pekerjaan, jabatan, waktu)?',
        'Dari perspektif bukti hukum: setelah karyawan mengundurkan diri, apakah dokumen yang diupload ke Google Drive pribadi masih bisa menjadi bukti kejahatan? Jelaskan langkah pengumpulan bukti digital dan koordinasi dengan Google (lawful intercept/legal hold request)?',
        'Rancang offboarding security checklist yang komprehensif untuk firma hukum: kapan akses dicabut, bagaimana audit aktivitas 30 hari sebelum resignation, apa yang harus diperiksa di SIEM, dan bagaimana menangani dokumen yang mungkin sudah di-download ke perangkat pribadi?',
      ],
    },
    {
      title: 'Serangan PrintNightmare di Jaringan Perusahaan Asuransi Proteksi Abadi',
      scenario:
        'PT Proteksi Abadi melaporkan bahwa penyerang yang memiliki akun domain dengan privilege rendah berhasil menjadi Domain Administrator dalam 20 menit menggunakan exploit PrintNightmare (CVE-2021-1675 / CVE-2021-34527). Exploit ini memanfaatkan kerentanan di Windows Print Spooler service yang berjalan sebagai SYSTEM untuk load DLL berbahaya dari share UNC path yang dikontrol penyerang. Log menunjukkan EventID 316 di Microsoft-Windows-PrintService/Admin log dan 808 di PrintService/Operational log sebelum privilege escalation berhasil.',
      questions: [
        'Jelaskan secara teknis bagaimana PrintNightmare (CVE-2021-34527) bekerja: kenapa Print Spooler yang berjalan sebagai SYSTEM bisa dieksploitasi untuk load arbitrary DLL, dan apa kondisi prasyarat yang diperlukan untuk exploit ini berhasil?',
        'Identifikasi Event ID spesifik di Windows Event Log dan PrintService operational log yang menjadi tanda tangan (IoC) serangan PrintNightmare. Buat detection rule untuk SIEM atau EDR.',
        'Microsoft merilis patch untuk PrintNightmare secara bertahap dan patch awal terbukti tidak complete. Diskusikan tantangan patch management untuk kerentanan "zero-day in production": bagaimana mengelola risiko antara menerapkan patch segera (potensi compatibility issue) vs menunda patch (risiko exploit)?',
        'Selain patching, apa mitigasi alternatif yang bisa diterapkan segera jika patch belum bisa diaplikasikan? Diskusikan trade-off antara menon-aktifkan Print Spooler service (efektif tapi mengganggu fungsi printing) vs workaround lain.',
      ],
    },
    {
      title: 'Ransomware via Phishing Macro di Pengembang Properti Griya Prima',
      scenario:
        'PT Griya Prima mengalami insiden ransomware Qakbot yang dimulai dari seorang staf marketing membuka dokumen "Penawaran Proyek.xlsm" yang diterima via email dari calon klien palsu. File Excel berisi macro VBA yang diobfuscated, setelah "Enable Content" diklik, macro mendownload payload ke %APPDATA%, membuat scheduled task untuk persistence, kemudian men-deploy ransomware Qakbot yang kemudian mengenkripsi semua network shares. EDR mencatat chain: excel.exe → cmd.exe → powershell.exe → certutil.exe (download) → schtasks.exe (persistence).',
      questions: [
        'Analisis "process chain" yang dicatat EDR: mengapa chain excel.exe → cmd.exe → powershell.exe → certutil.exe adalah pola sangat mencurigakan? Buat EDR behavioral detection rule untuk process chain anomali ini (gunakan pseudocode atau format Sigma rule).',
        'Macro VBA yang diobfuscated menggunakan berbagai teknik evasion (chr(), Split(), execute, Shell). Jelaskan teknik obfuscation macro umum dan bagaimana cara menganalisisnya (static analysis, deobfuscation tools, sandbox).',
        'Ransomware berhasil mengenkripsi network shares karena workstation yang terinfeksi memiliki akses write ke semua share tersebut. Prinsip least privilege yang mana yang dilanggar? Rancang file share permission model yang membatasi blast radius ransomware.',
        'Post-incident: bagaimana memvalidasi bahwa eradication sudah complete — tidak ada persistence tersisa — sebelum menyatakan sistem aman untuk kembali ke operasi normal? Buat eradication checklist dan validation steps.',
      ],
    },
    {
      title: 'Serangan Credential Stuffing pada Portal Donatur Lembaga Zakat Berkah Sejati',
      scenario:
        'Lembaga Zakat Berkah Sejati menemukan bahwa 3.200 akun donatur berhasil dilogin oleh penyerang menggunakan teknik credential stuffing — menggunakan kombinasi email-password yang bocor dari breach situs lain. Meski platform menggunakan Windows Server dengan IIS, sebagian besar kelemahan bersifat aplikasi. Log IIS menunjukkan pola: ribuan POST request ke /login.aspx dari ratusan IP berbeda menggunakan User-Agent yang identik, masing-masing IP hanya melakukan 3-5 percobaan (menghindari account lockout per IP). Penyerang berhasil mengubah nomor rekening penerima zakat di 150 akun.',
      questions: [
        'Credential stuffing berbeda dari brute force: jelaskan perbedaan teknis dan mengapa account lockout per IP tidak efektif melawannya. Apa mekanisme deteksi yang lebih efektif (device fingerprinting, behavioral biometrics, honeypot credentials)?',
        'Analisis pola dari log IIS: User-Agent identik dari banyak IP adalah tanda khas credential stuffing tool. Buat query analisis log IIS (menggunakan PowerShell atau Splunk) untuk mendeteksi pola credential stuffing.',
        'Sebagai respons insiden: 3.200 akun dikompromikan dan 150 nomor rekening diubah. Buat prioritas tindakan dalam 24 jam pertama: reset massal credential, notifikasi donatur, reversal perubahan rekening yang tidak sah, dan koordinasi dengan bank.',
        'Rancang program Web Application Security untuk portal donatur: implementasi CAPTCHA yang efektif, rate limiting berbasis perilaku (bukan hanya IP), MFA untuk akun dengan akses ke data finansial, dan monitoring anomali login real-time menggunakan Windows Event Log dan IIS log.',
      ],
    },
  ],

  // ──────────────────────────────────────────────
  // QUIZ (14 questions: 8 MC + 6 essay)
  // ──────────────────────────────────────────────
  quiz: [
    {
      id: 1,
      question: 'Event ID 4625 pada Windows Security Log menunjukkan apa, dan Logon Type berapa yang paling berbahaya jika gagal berulang kali?',
      type: 'multiple-choice',
      options: [
        'Account was locked out; Logon Type 2 (interactive) paling berbahaya karena dilakukan langsung di konsol fisik',
        'An account failed to log on; Logon Type 3 (network) paling berbahaya karena bisa jadi brute force RDP atau SMB dari jarak jauh',
        'A user account was deleted; semua Logon Type sama berbahayanya',
        'Special privileges assigned to new logon; Logon Type 10 (remote interactive/RDP) tidak berbahaya jika dari IP internal',
      ],
      answer:
        'An account failed to log on; Logon Type 3 (network) paling berbahaya karena bisa jadi brute force RDP atau SMB dari jarak jauh',
    },
    {
      id: 2,
      question: 'Perbedaan utama antara Kernel Mode (Ring 0) dan User Mode (Ring 3) pada arsitektur Windows adalah:',
      type: 'multiple-choice',
      options: [
        'Kernel Mode hanya untuk proses pengguna, User Mode untuk kernel OS dan driver',
        'Kernel Mode memiliki akses penuh ke hardware dan semua memori fisik, sementara User Mode terbatas pada virtual address space proses sendiri',
        'Tidak ada perbedaan nyata; keduanya bisa mengakses hardware secara langsung',
        'Kernel Mode hanya aktif saat komputer pertama kali boot, User Mode aktif setelah login',
      ],
      answer:
        'Kernel Mode memiliki akses penuh ke hardware dan semua memori fisik, sementara User Mode terbatas pada virtual address space proses sendiri',
    },
    {
      id: 3,
      question: 'Perintah PowerShell manakah yang paling tepat untuk memeriksa semua persistence locations (Run Keys) di registry yang sering digunakan malware?',
      type: 'multiple-choice',
      options: [
        'Get-Service | Where-Object {$_.Status -eq "Running"}',
        'Get-Process | Select-Object Name, Id, Path',
        'Get-ItemProperty "HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run" dan "HKCU:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run"',
        'Get-NetTCPConnection -State Established',
      ],
      answer:
        'Get-ItemProperty "HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run" dan "HKCU:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run"',
    },
    {
      id: 4,
      question: 'Event ID 1102 pada Windows Event Log adalah sinyal yang sangat mengkhawatirkan karena:',
      type: 'multiple-choice',
      options: [
        'Menandakan CPU usage mencapai 100% selama lebih dari 5 menit',
        'Menandakan Security Audit Log berhasil dihapus — hampir selalu mengindikasikan upaya menghapus jejak setelah serangan',
        'Menandakan Update Windows gagal diinstall dan perlu manual intervention',
        'Menandakan account lockout karena terlalu banyak percobaan login gagal',
      ],
      answer:
        'Menandakan Security Audit Log berhasil dihapus — hampir selalu mengindikasikan upaya menghapus jejak setelah serangan',
    },
    {
      id: 5,
      question: 'Windows Credential Guard menggunakan teknologi apa untuk melindungi NTLM hash dari tools seperti Mimikatz?',
      type: 'multiple-choice',
      options: [
        'Enkripsi AES-256 pada file SAM database yang tersimpan di disk',
        'Virtualization-Based Security (VBS) yang mengisolasi LSASS dalam Virtual Trust Level 1 yang terpisah dari OS utama',
        'Memindahkan NTLM hash ke TPM chip yang tidak bisa diakses secara software',
        'Menghapus semua NTLM hash dari memori dan menggantinya dengan Kerberos-only authentication',
      ],
      answer:
        'Virtualization-Based Security (VBS) yang mengisolasi LSASS dalam Virtual Trust Level 1 yang terpisah dari OS utama',
    },
    {
      id: 6,
      question: 'Fitur "Controlled Folder Access" di Windows Defender dirancang khusus untuk melindungi dari:',
      type: 'multiple-choice',
      options: [
        'Serangan brute force password pada akun Windows lokal',
        'Ransomware yang mencoba mengenkripsi file di folder yang dilindungi dengan memblokir akses write dari proses yang tidak terpercaya',
        'Serangan DDoS yang berasal dari internet ke port Windows yang terbuka',
        'Phishing email yang berisi attachment berbahaya di folder Downloads',
      ],
      answer:
        'Ransomware yang mencoba mengenkripsi file di folder yang dilindungi dengan memblokir akses write dari proses yang tidak terpercaya',
    },
    {
      id: 7,
      question: 'Teknik "Pass-the-Hash" memungkinkan penyerang melakukan autentikasi ke sistem Windows tanpa mengetahui password plaintext karena:',
      type: 'multiple-choice',
      options: [
        'Windows menyimpan password dalam plaintext di memori saat user login aktif, dan penyerang hanya membacanya langsung',
        'Protokol autentikasi NTLM menggunakan hash langsung sebagai credential dalam challenge-response, bukan memerlukan password asli',
        'Penyerang menggunakan rainbow table untuk mengkonversi hash kembali ke password dan kemudian login normal',
        'Windows memiliki bug bahwa hash dan password asli bisa digunakan secara bergantian karena enkripsi yang lemah',
      ],
      answer:
        'Protokol autentikasi NTLM menggunakan hash langsung sebagai credential dalam challenge-response, bukan memerlukan password asli',
    },
    {
      id: 8,
      question: 'Dalam konteks GPO (Group Policy Object), "Account Lockout Policy" dengan threshold 5 kali gagal dalam 30 menit memberikan proteksi utama terhadap:',
      type: 'multiple-choice',
      options: [
        'Serangan Man-in-the-Middle yang menyadap traffic antara domain controller dan client',
        'Serangan brute force password yang mencoba ribuan kombinasi password secara otomatis',
        'Serangan SQL Injection pada aplikasi web yang berjalan di domain',
        'Pencurian cookie session yang memungkinkan bypass autentikasi sama sekali',
      ],
      answer:
        'Serangan brute force password yang mencoba ribuan kombinasi password secara otomatis',
    },
    {
      id: 9,
      question: 'Jelaskan perbedaan antara Windows Defender Antivirus (gratis, built-in) dan Microsoft Defender for Endpoint (MDE) berbayar. Mengapa organisasi enterprise membutuhkan MDE meskipun sudah ada Defender Antivirus?',
      type: 'essay',
      answer:
        'Windows Defender Antivirus adalah komponen keamanan built-in yang sudah termasuk di setiap Windows 10/11 dan Windows Server. Fungsinya: real-time protection terhadap virus, malware, dan ransomware menggunakan signature database dan cloud-based protection. Gratis dan cukup untuk pengguna rumahan. Microsoft Defender for Endpoint (MDE/MDATP) adalah platform EDR enterprise berbayar dengan kemampuan jauh lebih luas: (1) EDR: merekam semua aktivitas proses, file, jaringan, registry dengan telemetri detail untuk investigasi; (2) Threat Hunting: query interface (Advanced Hunting) menggunakan Kusto Query Language untuk mencari ancaman tersembunyi; (3) Automated Investigation & Response: AI yang secara otomatis menginvestigasi alert dan melakukan remediation terbatas; (4) Vulnerability Management: inventarisasi CVE di semua endpoint dan rekomendasi remediation; (5) Attack Surface Reduction: visibilitas dan kontrol ASR rules di semua endpoint; (6) Integration: terintegrasi dengan Microsoft Sentinel (SIEM), Azure AD, dan Microsoft 365 Defender. Mengapa enterprise membutuhkan MDE: (1) Skala — mengelola ribuan endpoint membutuhkan single pane of glass, bukan memeriksa satu per satu; (2) Threat Hunting — ancaman sophisticated tidak selalu trigger alert, perlu hunting aktif; (3) Forensik — telemetri detail diperlukan untuk investigasi insiden yang komprehensif; (4) Compliance — audit trail dan laporan untuk kepatuhan regulasi; (5) Response time — automated response memperpendek MTTR secara signifikan.',
    },
    {
      id: 10,
      question: 'Seorang analis menemukan proses powershell.exe berjalan dari parent process winword.exe dengan command line yang berisi string Base64 panjang. Apa yang dapat disimpulkan dan apa langkah analisis selanjutnya?',
      type: 'essay',
      answer:
        'Kesimpulan: Ini adalah indikator kuat serangan macro malware atau phishing document. winword.exe yang men-spawn powershell.exe adalah pola yang sangat tidak normal — Microsoft Word tidak seharusnya membuka PowerShell. Command Base64 encoded mengindikasikan penyerang menyembunyikan payload dari deteksi berbasis string. Langkah analisis: 1) Decode Base64 segera: di PowerShell, jalankan [System.Text.Encoding]::Unicode.GetString([Convert]::FromBase64String("string_base64")) untuk melihat command aslinya. Ganti Unicode dengan UTF8 jika hasilnya tidak terbaca. 2) Isolasi endpoint dari jaringan untuk mencegah C2 communication dan lateral movement. 3) Capture memori RAM sebelum kill proses. 4) Periksa Event Log 4688 untuk command line lengkap dan proses parent-child chain. 5) Cek apakah PowerShell script mencoba koneksi ke internet (network IOC), mendownload file, atau membuat persistence. 6) Periksa file Word yang dibuka user di VirusTotal. 7) Cari IOC (domain, IP, hash) di threat intel database. 8) Cek apakah host lain memiliki proses serupa menggunakan EDR hunt query. 9) Jika malware sudah berhasil dieksekusi, lakukan full incident response (isolasi, forensik, eradication, recovery). Pencegahan: aktifkan ASR rule "Block Office applications from creating child processes" dan Script Block Logging via GPO.',
    },
    {
      id: 11,
      question: 'Jelaskan mengapa Windows Event ID 4688 (Process Creation) sangat penting untuk threat hunting! Apa informasi yang dikandungnya dan mengapa setting "Include command line in process creation events" harus diaktifkan?',
      type: 'essay',
      answer:
        'Event ID 4688 mencatat setiap kali proses baru dibuat (process creation). Ini adalah salah satu event paling berharga untuk threat hunting karena: Informasi yang dikandung: timestamp proses dibuat, nama dan path executable, command line arguments, PID (process ID), PPID (parent process ID dan nama parent process), user account yang menjalankan proses, token elevation type. Mengapa penting: (1) Deteksi malware: malware harus dieksekusi sebagai proses — setiap persistence mechanism (scheduled task, service, registry run key) akhirnya menghasilkan Event 4688; (2) Process chain analysis: field parent process memungkinkan membangun "process tree" untuk mendeteksi anomali (winword.exe → cmd.exe adalah sangat mencurigakan); (3) Threat hunting: dapat mencari teknik ATT&CK spesifik seperti "powershell -enc" (obfuscated commands), "certutil -decode" (download tool), "mshta.exe http://" (HTA download), dll; (4) Timeline reconstruction: dalam investigasi insiden, Event 4688 memungkinkan rekonstruksi urutan eksekusi serangan dengan presisi. Mengapa "Include command line" harus diaktifkan: tanpa setting ini, Event 4688 hanya mencatat nama proses tanpa argumennya. Sangat banyak serangan yang menggunakan tool legitimate (powershell, wmic, certutil) dengan argumen berbahaya — nama proses saja tidak cukup untuk deteksi. Dengan command line, query "powershell -encodedcommand" atau "certutil -urlcache" langsung dapat dideteksi. Cara mengaktifkan: Group Policy > Computer Config > Windows Settings > Security Settings > Advanced Audit Policy > Detailed Tracking > Audit Process Creation = Success. Kemudian Computer Config > Administrative Templates > System > Audit Process Creation > Include command line = Enabled.',
    },
    {
      id: 12,
      question: 'Apa perbedaan antara IDS (Intrusion Detection System) dan EDR (Endpoint Detection and Response) dalam konteks Windows security monitoring? Kapan menggunakan masing-masing?',
      type: 'essay',
      answer:
        'IDS (Network-based) memantau traffic jaringan untuk mendeteksi pola serangan berdasarkan signature atau anomali. Dipasang di network tap atau SPAN port, memonitor semua traffic yang melewati jaringan. Kelebihan: visibilitas ke seluruh jaringan dari satu titik, efektif untuk serangan berbasis jaringan (scanning, exploits). Kelemahan: tidak bisa melihat aktivitas di dalam endpoint (apa yang terjadi setelah malware masuk), blind terhadap encrypted traffic, tidak bisa melihat proses, file, registry di endpoint. EDR (Endpoint) dipasang sebagai agen di setiap endpoint. Merekam semua aktivitas: proses, file, registry, network connections, memory injection, dari perspektif sistem operasi. Kelebihan: visibilitas mendalam ke aktivitas endpoint, mendeteksi fileless malware dan living-off-the-land techniques yang tidak terlihat di jaringan, kemampuan forensik dan response (isolasi endpoint, kill proses, quarantine file). Kelemahan: harus diinstall di setiap endpoint, membutuhkan resources endpoint. Kapan menggunakan: NIDS + EDR adalah kombinasi terbaik (defense in depth). NIDS sangat baik untuk: mendeteksi scanning/reconnaissance, lateral movement via jaringan, exfiltrasi data, koneksi ke known-malicious IPs. EDR sangat baik untuk: malware execution, privilege escalation, credential dumping, fileless attacks, persistence mechanisms. Dalam praktik SOC modern: EDR mendeteksi 80%+ insiden modern karena penyerang semakin bergerak ke fileless/encrypted techniques yang tidak terdeteksi NIDS.',
    },
    {
      id: 13,
      question: 'Jelaskan konsep BitLocker dan mengapa backup Recovery Key ke Active Directory atau Azure AD sangat penting. Apa skenario di mana BitLocker Recovery Key dibutuhkan?',
      type: 'essay',
      answer:
        'BitLocker adalah fitur enkripsi disk penuh (FDE/Full Disk Encryption) yang tersedia di Windows Pro/Enterprise/Server. BitLocker mengenkripsi entire volume (bukan hanya file tertentu) menggunakan AES-128 atau AES-256. Cara kerja: Volume Encryption Key (VEK) digunakan untuk enkripsi data, Key Protector (TPM + PIN atau Password) melindungi VEK. Saat boot, TPM memverifikasi integrity boot chain sebelum melepaskan VEK. Jika boot chain dimodifikasi (malware bootkkit, dual boot OS baru), TPM menolak melepaskan key dan BitLocker meminta Recovery Key 48 digit. Recovery Key adalah kunci backup yang digunakan jika protector utama gagal. Mengapa WAJIB backup ke AD/Azure AD: Hardware failure TPM — jika TPM chip rusak, sistem tidak bisa boot tanpa Recovery Key. Board replacement — mengganti motherboard mengubah TPM, BitLocker akan terkunci. Firmware update — beberapa BIOS/UEFI update bisa mengubah PCR values yang diukur TPM. Lupa PIN — jika BitLocker dikonfigurasi dengan PIN tambahan dan user lupa. Migrasi hardware — memindahkan disk ke komputer lain. Skenario darurat — koneksi AD terputus saat login. Cara backup: di environment domain, GPO bisa dikonfigurasi agar BitLocker tidak bisa aktif kecuali Recovery Key sudah dibackup ke AD. Perintah: Backup-BitLockerKeyProtector dan menggunakan MBAM (Microsoft BitLocker Administration and Monitoring) untuk manajemen enterprise. Tanpa backup Recovery Key yang proper, kehilangan protector (TPM rusak, PIN lupa) = kehilangan akses ke semua data disk secara permanen.',
    },
    {
      id: 14,
      question: 'Sebutkan dan jelaskan 5 event ID Windows yang paling penting untuk dimonitoring dalam SOC! Untuk setiap event ID, berikan contoh kondisi "red flag" yang harus segera diinvestigasi.',
      type: 'essay',
      answer:
        '1) Event ID 4625 - An account failed to log on: Sangat penting untuk deteksi brute force. Red flag: lebih dari 20 kali gagal dalam 5 menit dari IP yang sama (brute force RDP/SMB), atau ratusan kali gagal ke berbagai akun dari IP yang sama (credential stuffing). 2) Event ID 4688 - A new process has been created: Kritis untuk threat hunting. Red flag: powershell.exe atau cmd.exe di-spawn oleh winword.exe/excel.exe/outlook.exe (macro malware); proses dari path C:\\Temp atau C:\\Users\\*\\AppData (malware sering ditulis ke sini); command line berisi -enc atau -encodedcommand (obfuscated PowerShell). 3) Event ID 4672 - Special privileges assigned to new logon: Setiap login dengan privilege admin. Red flag: akun yang seharusnya tidak admin mendapat privilege ini; terjadi di luar jam kerja; dari IP yang tidak dikenal. 4) Event ID 1102 - The audit log was cleared: SELALU merupakan red flag — tidak ada alasan legitimate untuk menghapus Security Log kecuali maintenance terjadwal yang tercatat di change management. Setiap kemunculan event ini harus segera diinvestigasi sebagai potential indicator of compromise. 5) Event ID 7045 - A new service was installed in the system: Red flag: service dengan nama acak (asjdfhksd, windowssupdate, svchost32); service binary berada di path tidak standar (Temp, AppData, Desktop); service diinstall di luar jam kerja atau oleh akun non-admin; service description kosong atau sangat generic.',
    },
  ],

  // ──────────────────────────────────────────────
  // VIDEO RESOURCES
  // ──────────────────────────────────────────────
  videoResources: [
    {
      title: 'Windows Security Fundamentals for Security Analysts',
      youtubeId: 'inWWhr5tnEA',
      description:
        'Fondasi keamanan Windows yang harus dikuasai setiap security analyst: architecture, event logs, dan key security features.',
      language: 'en',
      duration: '15:20',
    },
    {
      title: 'Windows Event Log Analysis for Threat Hunting',
      youtubeId: '2ztx5A_x6TY',
      description:
        'Cara menganalisis Windows Event Logs secara efektif untuk mendeteksi ancaman: event ID penting, PowerShell queries, dan SIEM integration.',
      language: 'en',
      duration: '18:45',
    },
    {
      title: 'PowerShell for Security Professionals',
      youtubeId: 'UVUd9_k9C0A',
      description:
        'PowerShell sebagai tool forensik dan security monitoring: commands esensial, automasi analisis, dan threat hunting scripts.',
      language: 'en',
      duration: '24:30',
    },
    {
      title: 'Active Directory Security and Attack Paths',
      youtubeId: 'SWvmXkuHFfE',
      description:
        'Keamanan Active Directory: serangan umum (Kerberoasting, Pass-the-Hash, DCSync) dan cara mitigasinya menggunakan GPO dan hardening.',
      language: 'en',
      duration: '32:15',
    },
    {
      title: 'Mimikatz & Credential Dumping — How Attackers Steal Windows Passwords',
      youtubeId: 'fSSQclMrqGw',
      description:
        'Cara kerja credential dumping dari perspektif blue team: apa yang dicuri Mimikatz, bagaimana mendeteksinya, dan mitigasi dengan Credential Guard.',
      language: 'en',
      duration: '16:40',
    },
  ],
};
