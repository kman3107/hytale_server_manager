---
name: Bug report
about: Report a problem that’s affecting the Hytale manager
title: "[BUG] – short description"
labels: bug
assignees: ''
---

<!-- ---------------------------------------------------- -->
## Checklist (please tick before submitting)

- [ ] I have searched the existing issues and did not find a duplicate.
- [ ] The title clearly summarizes the problem in ≤ 70 characters.
- [ ] All required sections below are filled out.

<!-- ---------------------------------------------------- -->
## Describe the bug

A clear, concise description of what went wrong.  
*Example:* “The manager crashes when loading a world larger than 10 GB.”

## Steps to reproduce

1. **Environment** – where you observed the bug (local development machine, Docker container, production server, etc.).
2. **Exact steps** – list each click, command, or configuration change.
3. **Expected result** – what you thought should happen.
4. **Actual result** – what actually happened (include error messages, stack traces, or console output).

> Tip: Use fenced code blocks for commands or logs.  
> ```text
> java -jar hytale-manager.jar --load-world bigworld
> ```

## Environment details

- **Operating system:** (e.g., Ubuntu 22.04, Windows 11)  
- **CPU:** (e.g., AMD Ryzen 7 5800X)  
- **RAM:** (e.g., 32 GB)  
- **Java version:** (e.g., OpenJDK 17.0.2)  
- **Hytale‑manager version:** (tag, release number, or commit SHA)  
- **Deployment method:** (Docker, native binary, systemd service, etc.)

## Media (highly appreciated)

- **Screenshots** – attach PNG/JPG files.  
- **Video** – a short screen‑capture (≤ 30 seconds) showing the issue.  
- **Log excerpts** – paste relevant sections inside a fenced block.

## Additional context

Any other information that might help us diagnose the problem (network topology, custom plugins, recent configuration changes, etc.).
