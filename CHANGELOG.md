# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [1.1.0]

### Changed

- `CLI.command` deprecated, use `CLI.addCommand`

### Add
- `setDelimiter`, `addCommand`, `command`, `show`, `hide` return CLI instance
- `getDelimiter`, `removeCommand`, `removeAllCommands`, `addExitCommand`, `getCommandsCount` methods

## [1.0.6]

### Added

- Licesnse text

## [1.0.5]

### Fixed

- Hide works immediatley.

### Changed

- Extracted some parsers to their own file
- We now show help for a command if it is used incorrectly
- Log rejected promises in returned by actions

### Added

- Build instructions to README.md
- Build command to package.json
- CHANGELOG.md
