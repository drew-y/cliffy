# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## 2.0.0 - 9 November 2018

### Added
- Support for optional parameters
- Support for rest parameters

### Changed
- The options are specified with `{ label: string }` instead of `{ option: string }`.
- Most CLI methods return a reference to this, allowing method chaining.
- command and commands methods have been renamed to addCommand and addCommands respectively
- If an action does not return a promise, it is assumed to be synchronous. `done` is no longer required.

### Removed
- Action functions are no longer passed `done`. Return a promise instead.

### Deprecated
- `command` - use `addCommand` instead.
- `commands` - use `addCommands` instead.
- `registerCommands` - use `addCommands` instead.

## 1.8.0

### Added

- Shorthand "Action" as an overload

## 1.7.0

### Added

- Shorthand command registration

## 1.6.0

### Added

- Unit tests

### Fixed

- Passed values of "false" or "0" are considered false by boolean parameters

## 1.5.0

### Added

- Parameters can specify a conversion method as a type

## 1.4.0

### Added

- `commands` An alias for registerCommands

## 1.3.0

### Added

- `registerCommands` for bulk registration of commands

## 1.2.0

### Added

- `setInfo` Set the help menu overview
- `setName` Set the name of the interface for the help menu
- `setVersion` Set a version to be displayed by help

## 1.1.0

### Added

- Importable Commands interface

### Changed

- Type definitions come from a generated .d.ts file

## 1.0.6

### Added

- Licesnse text

## 1.0.5

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