<p align="center">
  <img src="https://i.hizliresim.com/qhndmho.png" width="100%" alt="Hodeuscli Banner" />
</p>

# Hodeuscli Monorepo

<p align="center">
  <br>
  <b><font size="6">◆ HODEUSCLI ◆</font></b><br>
  <i>The Sovereign Terminal Coding Assistant</i>
  <br>
</p>

<p align="center">
  <a href="https://discord.com/invite/3cU7Bz4UPx"><img alt="Discord" src="https://img.shields.io/badge/discord-community-5865F2?style=flat-square&logo=discord&logoColor=white" /></a>
  <a href="https://github.com/games-coder/hodeuscli/actions/workflows/ci.yml"><img alt="Build status" src="https://img.shields.io/github/actions/workflow/status/games-coder/hodeuscli/ci.yml?style=flat-square&branch=main" /></a>
</p>

---

Hodeuscli is the world's most advanced, luxury-grade terminal coding assistant, designed for performance and aesthetic excellence. Powered by **Hodeus Studio**, it features a high-fidelity **Luxury TUI** with millisecond-precision timers, real-time status spinners, and a sophisticated bilingual (TR/EN) interface.

> **Get Started with the CLI:** See **[packages/coding-agent](packages/coding-agent)** for installation and usage.

## 📦 Packages

| Package | Description |
|---------|-------------|
| **[@hodeuscli/ai](packages/ai)** | Unified multi-provider LLM API (OpenAI, Anthropic, Google, etc.) |
| **[@hodeuscli/agent-core](packages/agent)** | Agent runtime with tool calling and state management |
| **[@hodeuscli/cli](packages/coding-agent)** | Flagship Hodeuscli Interactive Terminal Experience |
| **[@hodeuscli/tui](packages/tui)** | Premium Terminal UI library with high-perf differential rendering |
| **[@hodeuscli/web-ui](packages/web-ui)** | Web components for modern AI chat interfaces |
| **[@hodeuscli/pods](packages/pods)** | CLI for managing vLLM deployments on GPU pods |

## 🛠️ Development

```bash
npm install          # Install all dependencies
npm run build        # Build all packages with Luxury TUI assets
npm run check        # Lint, format, and type check
./hodeuscli-test.sh  # Run hodeuscli from source
```

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines and [AGENTS.md](AGENTS.md) for project-specific rules.

## 📄 License

MIT - Copyright (c) 2026 Games-coder / Hodeus Studio
