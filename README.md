# Genji MCP Server

[![npm version](https://img.shields.io/npm/v/@nakamura196/genji-mcp-server.svg)](https://www.npmjs.com/package/@nakamura196/genji-mcp-server)

A Model Context Protocol (MCP) server that provides access to the Genji API for classical Japanese literature analysis and search. This server enables AI assistants like Claude to search and analyze texts from classical Japanese literature with advanced normalization features.

## Features

- 🏥 **Health Check**: Monitor API status and availability
- 🔍 **Advanced Text Search**: Search classical Japanese texts with sophisticated normalization options
- ⚙️ **Normalization Rules**: Access and understand text normalization rules
- 🔍 **Normalization Preview**: Preview how text will be normalized before processing
- 🇯🇵 **Classical Japanese Support**: Specialized handling of historical Japanese text variations

## Installation

```bash
npm install -g @nakamura196/genji-mcp-server
```

## Configuration

Add the server to your Claude Desktop configuration file:

### macOS
Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "genji": {
      "command": "npx",
      "args": ["@nakamura196/genji-mcp-server"]
    }
  }
}
```

### Windows
Edit `%APPDATA%/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "genji": {
      "command": "npx",
      "args": ["@nakamura196/genji-mcp-server"]
    }
  }
}
```

Alternatively, if you installed globally:

```json
{
  "mcpServers": {
    "genji": {
      "command": "genji-mcp-server"
    }
  }
}
```

## Usage

After configuration, restart Claude Desktop. The Genji tools will be automatically available. You can ask Claude for classical Japanese literature analysis like:

### Health Check
- "Check if the Genji API is working"
- "Is the classical Japanese literature database available?"

### Text Search
- "Search for '花' in classical Japanese texts"
- "Find passages containing '源氏' with phonetic normalization"
- "Search for text in volume 1 of Genji Monogatari"
- "Look for '恋' with all normalization options enabled"

### Normalization Features
- "What normalization rules are available for classical Japanese?"
- "Preview how '源氏物語' would be normalized"
- "Show me the normalization rules for historical kana"

## Available Tools

### `genji_health_check`
Checks the health and availability of the Genji API.

**Parameters:** None

### `genji_search`
Searches classical Japanese texts with advanced normalization options.

**Parameters:**
- `query` (string, optional): Search query text
- `limit` (number, optional): Maximum results to return (1-100, default: 20)
- `offset` (number, optional): Number of results to skip (default: 0)
- `sort` (string, optional): Sort order for results
- `expand_repeat_marks` (boolean, optional): Expand repeat marks (default: true)
- `unify_kanji_kana` (boolean, optional): Unify kanji/kana variations (default: true)
- `unify_historical_kana` (boolean, optional): Unify historical kana (default: true)
- `unify_phonetic_changes` (boolean, optional): Unify phonetic variations (default: true)
- `unify_dakuon` (boolean, optional): Unify voiced sound variations (default: true)
- `vol_str` (array, optional): Volume/chapter filter

### `genji_get_normalization_rules`
Retrieves the list of available text normalization rules.

**Parameters:** None

### `genji_preview_normalization`
Previews how text would be normalized with current rules.

**Parameters:**
- `text` (string, required): Text to preview normalization for

## Text Normalization Features

The server supports various normalization options for classical Japanese text:

- **Repeat Marks Expansion**: Converts repeat marks (々, ゝ, ゞ) to full characters
- **Kanji-Kana Unification**: Handles variations between kanji and kana representations
- **Historical Kana Unification**: Normalizes historical kana usage to modern equivalents
- **Phonetic Changes**: Accounts for historical phonetic variations
- **Dakuon Unification**: Handles voiced/unvoiced sound variations

## Requirements

- Node.js 16.0.0 or higher
- Internet connection for API access
- Access to the Genji API (https://genji-api.aws.ldas.jp)

## Development

```bash
# Clone the repository
git clone https://github.com/nakamura196/genji-mcp-server.git
cd genji-mcp-server

# Install dependencies
npm install

# Build the project
npm run build

# Start in development mode
npm run dev
```

## API Reference

This server interfaces with the [Genji API](https://genji-api.aws.ldas.jp), which provides:

- Full-text search of classical Japanese literature
- Advanced text normalization for historical Japanese
- Metadata about literary works and volumes
- Health monitoring endpoints

## Error Handling

The server includes comprehensive error handling for:

- API connectivity issues
- Invalid search parameters
- Text encoding problems
- Normalization errors
- Rate limiting (if applicable)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues, please file them on the [GitHub Issues](https://github.com/nakamura196/genji-mcp-server/issues) page.

## Related Projects

- [Genji API](https://genji-api.aws.ldas.jp) - The underlying API for classical Japanese literature
- [Model Context Protocol](https://modelcontextprotocol.io/) - The protocol this server implements

## Changelog

### 1.0.1
- Fix API URL references in documentation
- Remove unused TypeScript interfaces for cleaner code
- Update documentation links

### 1.0.0
- Initial release
- Health check functionality
- Advanced text search with normalization options
- Normalization rules management
- Text normalization preview
- Full classical Japanese text analysis support