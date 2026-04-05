import { type AgentToolResult, type AgentToolUpdateCallback } from "@games-coder/hodeuscli-agent-core";
import { type Static, Type } from "@sinclair/typebox";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import type { ExtensionContext, ToolDefinition } from "../extensions/types.js";
import { wrapToolDefinition } from "./tool-definition-wrapper.js";

const queryKnowledgeSchema = Type.Object({
	query: Type.String({ description: "The search query or keywords to look for in the knowledge base" }),
});

export type QueryKnowledgeInput = Static<typeof queryKnowledgeSchema>;

export const queryKnowledgeToolDefinition: ToolDefinition<typeof queryKnowledgeSchema> = {
	name: "query_knowledge",
	label: "knowledge base",
	description: "Query your personal knowledge base (Bilgi Bankası). Use this to find information in documents you have uploaded (PDFs, text files, docs, etc.).",
	parameters: queryKnowledgeSchema,
	execute: async (toolCallId, { query }, signal, onUpdate, ctx) => {
		const knowledgeDir = join(ctx.cwd, "knowledge");

		try {
			const files = await readdir(knowledgeDir).catch(() => []);
			if (files.length === 0) {
				return {
					content: [{ type: "text", text: "Knowledge base is currently empty. Please upload some files to the 'knowledge' directory first." }],
					details: { count: 0 }
				};
			}

			const results: { filename: string; snippet: string }[] = [];
			const lowercaseQuery = query.toLowerCase();

			for (const file of files) {
				if (file.startsWith(".")) continue;
				
				try {
					const content = await readFile(join(knowledgeDir, file), "utf-8");
					const lowercaseContent = content.toLowerCase();

					if (lowercaseContent.includes(lowercaseQuery)) {
						const index = lowercaseContent.indexOf(lowercaseQuery);
						const start = Math.max(0, index - 200);
						const end = Math.min(content.length, index + 300);
						
						results.push({
							filename: file,
							snippet: content.substring(start, end).replace(/\n/g, " "),
						});
					}
				} catch (e) {
					// Skip files that can't be read as text
				}
			}

			if (results.length === 0) {
				return {
					content: [{ type: "text", text: `No matches found for "${query}" in the knowledge base.` }],
					details: { count: 0 }
				};
			}

			const resultText = "Found the following relevant information in your knowledge base:\n\n" +
				results.map(r => `--- File: ${r.filename} ---\n...${r.snippet}...`).join("\n\n");

			return {
				content: [{ type: "text", text: resultText }],
				details: { count: results.length, files: results.map(r => r.filename) }
			};
		} catch (error: any) {
			return {
				content: [{ type: "text", text: `Error querying knowledge base: ${error.message}` }],
				details: { error: error.message }
			};
		}
	},
};

export function createQueryKnowledgeTool(): any {
	return wrapToolDefinition(queryKnowledgeToolDefinition);
}

export const queryKnowledgeTool = createQueryKnowledgeTool();
