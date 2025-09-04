# Changelog

All notable changes to Smart Save will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [11.0.0] - 2025-09-04

### 🎉 Major Release - Complete Overhaul

#### Added
- Real-time token tracking up to 200,000 tokens
- Automatic dependency installation via npm
- Enhanced memory extraction with knowledge graph building
- Better project folder auto-detection
- Improved statistics accuracy for large conversations  
- Virtual scrolling support for Claude Desktop
- Auto-version detection from folder name
- Comprehensive GitHub integration
- Privacy-focused .gitignore configuration

#### Changed
- Complete rewrite of content capture mechanism
- Improved performance with better DOM selection
- Enhanced save threshold (25 characters minimum)
- Better handling of Claude Desktop's virtual scrolling
- Cleaner project structure and organization
- Updated dashboard with real-time statistics

#### Fixed
- Memory leak issues from v10.x
- Incorrect word count display
- Duplicate save prevention
- Cache persistence problems
- Interval management issues
- Statistics calculation errors

#### Security
- All conversation files excluded from Git
- No telemetry or tracking
- Complete local-only operation

## [10.0.5] - 2025-09-03

### Changed
- Memory optimization improvements
- Better fingerprint deduplication
- Save reliability enhancements

### Fixed
- Memory leaks in long-running sessions
- Duplicate file creation issues

## [10.0.1] - 2025-09-02

### Added
- Fingerprint-based deduplication
- Project statistics tracking

### Fixed
- File naming conflicts
- Dashboard display issues

## [10.0.0] - 2025-09-01

### Added
- Complete memory extraction system
- Knowledge graph building
- Web dashboard at localhost:3737
- Menu bar control for macOS

### Changed
- New file naming convention (chat name = file name)
- Removed date prefixes from filenames
- Simplified project structure

## [9.3.0] - 2025-08-28

### Added
- Claude Desktop App support
- Auto-injection system
- Developer tools integration

### Changed
- Improved content detection
- Better error handling

## [9.2.0] - 2025-08-25

### Added
- Chrome extension for claude.ai
- Cross-platform support

## [9.1.0] - 2025-08-20

### Added
- Project-based organization
- Automatic folder creation
- Save statistics

## [9.0.1] - 2025-08-15

### Fixed
- Initial bugs and issues
- Installation problems

## [9.0.0] - 2025-08-15

### Added
- Initial public release
- Basic auto-save functionality
- Simple folder organization

---

## Upgrade Instructions

### From v10.x to v11.0
1. Backup your `Claude_Conversations` folder
2. Replace all files except the conversations folder
3. Run `npm install` to update dependencies
4. Start with `npm start`

### From v9.x to v11.0  
1. Full reinstall recommended
2. Backup existing conversations
3. Clone fresh v11.0 repository
4. Copy conversations to new folder structure

## Support

For issues or questions, please visit:
https://github.com/Mecozz/Claude-Smart-Save/issues