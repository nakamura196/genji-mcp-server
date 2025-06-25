#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

/**
 * Genji MCP Server
 * Provides access to the Genji API for classical Japanese literature analysis
 */



// Create server instance
const server = new Server(
  {
    name: 'genji-mcp-server',
    version: '1.0.1',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Base URL for Genji API
const GENJI_API_BASE = 'https://genji-api.aws.ldas.jp';

// Helper function to make API requests
async function makeGenjiApiRequest(
  endpoint: string,
  params: Record<string, any> = {}
): Promise<any> {
  const url = new URL(`${GENJI_API_BASE}${endpoint}`);
  
  // Add parameters to URL
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          url.searchParams.append(`${key}[${index}]`, String(item));
        });
      } else {
        url.searchParams.append(key, String(value));
      }
    }
  });

  const response = await fetch(url.toString(), {
    headers: {
      'User-Agent': 'Genji MCP Server',
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Genji API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return await response.json();
}

// Define available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'genji_health_check',
      description: 'Check the health status of the Genji API',
      inputSchema: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
    {
      name: 'genji_search',
      description: 'Search classical Japanese texts with advanced normalization options',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search query text',
          },
          limit: {
            type: 'number',
            description: 'Maximum number of results to return (default: 20)',
            minimum: 1,
            maximum: 100,
            default: 20,
          },
          offset: {
            type: 'number',
            description: 'Number of results to skip (default: 0)',
            minimum: 0,
            default: 0,
          },
          sort: {
            type: 'string',
            description: 'Sort order for results',
          },
          expand_repeat_marks: {
            type: 'boolean',
            description: 'Expand repeat marks in text (default: true)',
            default: true,
          },
          unify_kanji_kana: {
            type: 'boolean',
            description: 'Unify kanji and kana variations (default: true)',
            default: true,
          },
          unify_historical_kana: {
            type: 'boolean',
            description: 'Unify historical kana variations (default: true)',
            default: true,
          },
          unify_phonetic_changes: {
            type: 'boolean',
            description: 'Unify phonetic variations (default: true)',
            default: true,
          },
          unify_dakuon: {
            type: 'boolean',
            description: 'Unify dakuon (voiced sound) variations (default: true)',
            default: true,
          },
          vol_str: {
            type: 'array',
            items: {
              type: 'string',
            },
            description: 'Volume/chapter filter',
          },
        },
        required: [],
      },
    },
    {
      name: 'genji_get_normalization_rules',
      description: 'Get the list of available text normalization rules',
      inputSchema: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
    {
      name: 'genji_preview_normalization',
      description: 'Preview how text would be normalized with current rules',
      inputSchema: {
        type: 'object',
        properties: {
          text: {
            type: 'string',
            description: 'Text to preview normalization for',
          },
        },
        required: ['text'],
      },
    },
  ],
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    switch (name) {
      case 'genji_health_check': {
        const healthData = await makeGenjiApiRequest('/health');
        
        return {
          content: [
            {
              type: 'text',
              text: `🟢 **Genji API Health Check**

**Status:** ${healthData.status || 'OK'}
**Timestamp:** ${healthData.timestamp || new Date().toISOString()}
${healthData.version ? `**Version:** ${healthData.version}` : ''}

The Genji API is operational and ready to serve classical Japanese literature queries.`,
            },
          ],
        };
      }

      case 'genji_search': {
        const {
          query,
          limit = 20,
          offset = 0,
          sort,
          expand_repeat_marks = true,
          unify_kanji_kana = true,
          unify_historical_kana = true,
          unify_phonetic_changes = true,
          unify_dakuon = true,
          vol_str,
        } = args as any;

        const params: Record<string, any> = {
          'page[limit]': limit,
          'page[offset]': offset,
          'filter[expandRepeatMarks]': expand_repeat_marks.toString(),
          'filter[unifyKanjiKana]': unify_kanji_kana.toString(),
          'filter[unifyHistoricalKana]': unify_historical_kana.toString(),
          'filter[unifyPhoneticChanges]': unify_phonetic_changes.toString(),
          'filter[unifyDakuon]': unify_dakuon.toString(),
        };

        if (query) {
          params.q = query;
        }
        if (sort) {
          params.sort = sort;
        }
        if (vol_str && Array.isArray(vol_str)) {
          params['filter[vol_str]'] = vol_str;
        }

        const searchResults = await makeGenjiApiRequest('/search', params);
        
        const resultCount = (searchResults.data && searchResults.data.length) || 0;
        const totalResults = (searchResults.meta && searchResults.meta.pagination && searchResults.meta.pagination.total) || resultCount;
        
        let resultsText = `📚 **Genji Search Results**

**Query:** ${query || '(all)'}
**Results:** ${resultCount} of ${totalResults} total
**Page:** ${Math.floor(offset / limit) + 1}

**Normalization Settings:**
- Expand repeat marks: ${expand_repeat_marks ? '✅' : '❌'}
- Unify kanji/kana: ${unify_kanji_kana ? '✅' : '❌'}
- Unify historical kana: ${unify_historical_kana ? '✅' : '❌'}
- Unify phonetic changes: ${unify_phonetic_changes ? '✅' : '❌'}
- Unify dakuon: ${unify_dakuon ? '✅' : '❌'}

`;

        if (resultCount === 0) {
          resultsText += '\n❌ No results found for this query.';
        } else {
          resultsText += '\n**Results:**\n\n';
          
          searchResults.data.slice(0, 10).forEach((result: any, index: number) => {
            resultsText += `**${index + 1 + offset}.** `;
            
            if (result.attributes && result.attributes.title) {
              resultsText += `**${result.attributes.title}**\n`;
            }
            
            if (result.attributes && result.attributes.text) {
              const text = result.attributes.text.length > 200 
                ? result.attributes.text.substring(0, 200) + '...'
                : result.attributes.text;
              resultsText += `${text}\n`;
            }
            
            if (result.attributes && result.attributes.vol_str) {
              resultsText += `*Volume:* ${result.attributes.vol_str}\n`;
            }
            
            resultsText += '\n';
          });
          
          if (resultCount > 10) {
            resultsText += `\n... and ${resultCount - 10} more results.`;
          }
        }

        return {
          content: [
            {
              type: 'text',
              text: resultsText,
            },
          ],
        };
      }

      case 'genji_get_normalization_rules': {
        const rulesData = await makeGenjiApiRequest('/normalization/rules');
        
        let rulesText = `⚙️ **Text Normalization Rules**\n\n`;
        
        if (rulesData.data && Array.isArray(rulesData.data)) {
          rulesData.data.forEach((rule: any, index: number) => {
            rulesText += `**${index + 1}. ${rule.name || rule.id}**\n`;
            if (rule.description) {
              rulesText += `   ${rule.description}\n`;
            }
            rulesText += `   Status: ${rule.enabled ? '✅ Enabled' : '❌ Disabled'}\n\n`;
          });
        } else {
          rulesText += 'No normalization rules available or data format not recognized.';
        }

        return {
          content: [
            {
              type: 'text',
              text: rulesText,
            },
          ],
        };
      }

      case 'genji_preview_normalization': {
        const { text } = args as { text: string };
        
        const previewData = await makeGenjiApiRequest('/normalization/preview', { text });
        
        let previewText = `🔍 **Normalization Preview**\n\n`;
        previewText += `**Original Text:**\n${text}\n\n`;
        
        if (previewData.normalized) {
          previewText += `**Normalized Text:**\n${previewData.normalized}\n\n`;
        }
        
        if (previewData.rules_applied && Array.isArray(previewData.rules_applied)) {
          previewText += `**Rules Applied:**\n`;
          previewData.rules_applied.forEach((rule: string) => {
            previewText += `- ${rule}\n`;
          });
        }
        
        if (previewData.original === previewData.normalized) {
          previewText += `\n✅ No changes needed - text is already normalized.`;
        }

        return {
          content: [
            {
              type: 'text',
              text: previewText,
            },
          ],
        };
      }

      default:
        return {
          content: [
            {
              type: 'text',
              text: `Unknown tool: ${name}`,
            },
          ],
          isError: true,
        };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      content: [
        {
          type: 'text',
          text: `❌ Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  // Server started successfully
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  process.exit(0);
});

process.on('SIGTERM', async () => {
  process.exit(0);
});

// Start the server
main().catch(() => {
  process.exit(1);
});