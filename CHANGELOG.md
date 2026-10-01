# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow
[Semantic Versioning](https://semver.org/).

## Unreleased

### Changed

- Badges, such as the Source Control changes count, use the same color as the
  activity bar badge.
- Inputs and chat messages stand out from the sidebar: Gruvbox and Nord inputs
  are a step lighter (dark) or darker (light), and Solarized sidebars are
  darker, as in VS Code's built-in Solarized themes.
- Soy Solarized Dark has brighter activity bar icons.
- File tabs stand out more: the tab strip is a step off the editor background,
  and the active tab matches the editor.
- In Soy Solarized Light, the title bar, status bar and the gaps between panes
  match the sidebars, as in VS Code's built-in Solarized Light.

## 0.1.1 (2026-10-01)

### Added

- An icon for the extension.

## 0.1.0 (2026-09-30)

### Added

- Nine themes: Soy Gruvbox Dark and Light in medium, hard and soft contrast, Soy
  Solarized Dark and Light, and Soy Nord.
- Minimal syntax highlighting based on Alabaster: prominent comments, strings,
  constants and definitions are colored; keywords, variables, calls and type
  references are plain. Semantic tokens from language servers follow the same
  rules.
- A fully colored workbench based on the Gruvbox Theme's UI colors, including
  GitLens and Jupyter notebook colors.
- The official terminal colors for Solarized and Nord.
