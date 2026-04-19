import type { Platform } from "@/lib/platform";

/**
 * Structured install guides. Each platform has one or more "methods"
 * (package managers, version managers, official installer…). A method
 * is a title + body composed of typed steps so the renderer can handle
 * commands / links / plain text uniformly.
 */

export type InstallStep =
  | { kind: "command"; label?: string; command: string }
  | { kind: "link"; label: string; url: string }
  | { kind: "text"; content: string };

export interface InstallMethod {
  title: string;
  subtitle?: string;
  /** Marked as the recommended option (first card surface, accent dot). */
  recommended?: boolean;
  steps: InstallStep[];
}

export type PlatformInstructions = Record<Platform, InstallMethod[]>;

/* ── Node.js ─────────────────────────────────────────────────── */

export const NODE_INSTRUCTIONS: PlatformInstructions = {
  mac: [
    {
      title: "Homebrew",
      subtitle: "Easiest if you already use brew.",
      recommended: true,
      steps: [
        {
          kind: "command",
          label: "Install Node 20 (LTS)",
          command: "brew install node@20",
        },
        {
          kind: "command",
          label: "Link the latest binary",
          command: "brew link --overwrite node@20",
        },
      ],
    },
    {
      title: "fnm (Fast Node Manager)",
      subtitle: "Lets you swap Node versions per project.",
      steps: [
        {
          kind: "command",
          label: "Install fnm",
          command: "brew install fnm",
        },
        {
          kind: "command",
          label: "Install & use Node 20",
          command: "fnm install 20 && fnm default 20",
        },
      ],
    },
    {
      title: "Official installer",
      steps: [
        {
          kind: "link",
          label: "Download the macOS installer",
          url: "https://nodejs.org/en/download",
        },
      ],
    },
  ],
  windows: [
    {
      title: "winget",
      subtitle: "Shipped with Windows 10+.",
      recommended: true,
      steps: [
        {
          kind: "command",
          label: "Install Node 20 (LTS)",
          command: "winget install OpenJS.NodeJS.LTS",
        },
      ],
    },
    {
      title: "Chocolatey",
      steps: [
        {
          kind: "command",
          label: "Install Node 20 (LTS)",
          command: "choco install nodejs-lts",
        },
      ],
    },
    {
      title: "Official installer",
      steps: [
        {
          kind: "link",
          label: "Download the Windows installer",
          url: "https://nodejs.org/en/download",
        },
      ],
    },
  ],
  linux: [
    {
      title: "NodeSource (apt / dnf)",
      subtitle: "Official Node.js repositories.",
      recommended: true,
      steps: [
        {
          kind: "text",
          content: "Debian / Ubuntu",
        },
        {
          kind: "command",
          command:
            "curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -",
        },
        {
          kind: "command",
          command: "sudo apt-get install -y nodejs",
        },
        {
          kind: "text",
          content: "Fedora / RHEL",
        },
        {
          kind: "command",
          command:
            "curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo -E bash -",
        },
        {
          kind: "command",
          command: "sudo dnf install -y nodejs",
        },
      ],
    },
    {
      title: "fnm",
      subtitle: "Swap Node versions per project.",
      steps: [
        {
          kind: "command",
          label: "Install fnm",
          command: "curl -fsSL https://fnm.vercel.app/install | bash",
        },
        {
          kind: "command",
          label: "Install & use Node 20",
          command: "fnm install 20 && fnm default 20",
        },
      ],
    },
    {
      title: "Download a binary",
      steps: [
        {
          kind: "link",
          label: "Prebuilt Linux binaries",
          url: "https://nodejs.org/en/download",
        },
      ],
    },
  ],
};

/* ── Python ──────────────────────────────────────────────────── */

export const PYTHON_INSTRUCTIONS: PlatformInstructions = {
  mac: [
    {
      title: "Homebrew",
      subtitle: "Easiest if you already use brew.",
      recommended: true,
      steps: [
        {
          kind: "command",
          label: "Install Python 3.12",
          command: "brew install python@3.12",
        },
      ],
    },
    {
      title: "pyenv",
      subtitle: "Lets you run multiple Python versions side-by-side.",
      steps: [
        {
          kind: "command",
          label: "Install pyenv",
          command: "brew install pyenv",
        },
        {
          kind: "command",
          label: "Install & activate Python 3.12",
          command: "pyenv install 3.12 && pyenv global 3.12",
        },
      ],
    },
    {
      title: "Official installer",
      steps: [
        {
          kind: "link",
          label: "Download the macOS installer",
          url: "https://www.python.org/downloads/macos/",
        },
      ],
    },
  ],
  windows: [
    {
      title: "winget",
      subtitle: "Shipped with Windows 10+.",
      recommended: true,
      steps: [
        {
          kind: "command",
          label: "Install Python 3.12",
          command: "winget install Python.Python.3.12",
        },
      ],
    },
    {
      title: "Chocolatey",
      steps: [
        {
          kind: "command",
          label: "Install Python 3.12",
          command: "choco install python --version=3.12",
        },
      ],
    },
    {
      title: "Official installer",
      subtitle: "Make sure \"Add python.exe to PATH\" is checked.",
      steps: [
        {
          kind: "link",
          label: "Download the Windows installer",
          url: "https://www.python.org/downloads/windows/",
        },
      ],
    },
  ],
  linux: [
    {
      title: "System package manager",
      subtitle: "Most distros ship a reasonably current Python.",
      recommended: true,
      steps: [
        { kind: "text", content: "Debian / Ubuntu" },
        {
          kind: "command",
          command: "sudo apt-get install -y python3.12 python3.12-venv",
        },
        { kind: "text", content: "Fedora" },
        { kind: "command", command: "sudo dnf install -y python3.12" },
        { kind: "text", content: "Arch" },
        { kind: "command", command: "sudo pacman -S python" },
      ],
    },
    {
      title: "pyenv",
      subtitle: "Multiple versions on the same machine.",
      steps: [
        {
          kind: "command",
          label: "Install pyenv",
          command: "curl https://pyenv.run | bash",
        },
        {
          kind: "command",
          label: "Install & activate Python 3.12",
          command: "pyenv install 3.12 && pyenv global 3.12",
        },
      ],
    },
    {
      title: "Download",
      steps: [
        {
          kind: "link",
          label: "python.org source & build instructions",
          url: "https://www.python.org/downloads/source/",
        },
      ],
    },
  ],
};
