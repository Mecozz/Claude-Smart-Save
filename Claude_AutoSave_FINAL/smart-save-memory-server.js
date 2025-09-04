#!/usr/bin/env node

// ============================================
// SMART SAVE MEMORY MCP SERVER
// ============================================
// Gives Claude access to extracted Smart Save memories
// ============================================

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs';
import path from 'path';
import os from 'os';

class SmartSaveMemoryServer {
  constructor() {
    this.server = new Server(
      {
        name: 'smart-save-memory',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.memoryPath = path.join(
      os.homedir(),
      '.cache/smart-save-memory/extracted-memories.json'
    );

    this.setupHandlers();
    this.error = null;
  }

  loadMemories() {
    try {
      if (fs.existsSync(this.memoryPath)) {
        const data = fs.readFileSync(this.memoryPath, 'utf8');
        return JSON.parse(data);
      }
      return null;
    } catch (error) {
      this.error = error.message;
      return null;
    }
  }

  setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'search_memories',
          description: 'Search through extracted Smart Save memories for specific information',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Search query (searches all memory types)',
              },
              type: {
                type: 'string',
                description: 'Optional: Filter by type (people, projects, bugs, solutions, preferences, code)',
                enum: ['people', 'projects', 'bugs', 'solutions', 'preferences', 'code'],
              },
            },
            required: ['query'],
          },
        },
        {
          name: 'get_all_people',
          description: 'Get all people mentioned in conversations',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'get_all_projects