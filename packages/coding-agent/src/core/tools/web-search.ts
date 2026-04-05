import { type AgentToolResult, type AgentToolUpdateCallback } from "@games-coder/hodeuscli-agent-core";
import { type Static, Type } from "@sinclair/typebox";
import { fetch } from "undici";
import type { ExtensionContext, ToolDefinition } from "../extensions/types.js";
import { wrapToolDefinition } from "./tool-definition-wrapper.js";

const webSearchSchema = Type.Object({
	query: Type.String({ description: "The search query" }),
	maxResults: Type.Optional(Type.Number({ description: "Maximum number of results to return (default 5)", default: 5 })),
});

export type WebSearchInput = Static<typeof webSearchSchema>;

export const webSearchToolDefinition: ToolDefinition<typeof webSearchSchema> = {
	name: "web_search",
	label: "web search",
	description: "Search the web for up-to-date information, news, and documentation. Use this to find information not in your training data, like recent events or specific library docs.",
	parameters: webSearchSchema,
	execute: async (toolCallId, { query, maxResults = 5 }, signal, onUpdate, ctx) => {
		const apiKey = process.env.TAVILY_API_KEY;

		if (!apiKey) {
			return {
				content: [{ type: "text", text: "Error: TAVILY_API_KEY is not set. Please set it in your environment variables to enable web search." }],
				details: { error: "API key missing" }
			};
		}

		try {
			const response = await fetch("https://api.tavily.com/search", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					api_key: apiKey,
					query,
					search_depth: "smart",
					max_results: maxResults,
				}),
				signal
			});

			if (!response.ok) {
				const error = await response.text();
				return {
					content: [{ type: "text", text: `Web search failed: ${error}` }],
					details: { error }
				};
			}

			const data = (await response.json()) as any;
			const results = data.results.map((r: any) => ({
				title: r.title,
				url: r.url,
				content: r.content,
			}));

			const resultText = results.map((r: any) => `[${r.title}](${r.url})\n${r.content}`).join("\n\n");

			return {
				content: [{ type: "text", text: resultText }],
				details: { results }
			};
		} catch (error: any) {
			return {
				content: [{ type: "text", text: `Web search error: ${error.message}` }],
				details: { error: error.message }
			};
		}
	},
};

export function createWebSearchTool(): any {
	return wrapToolDefinition(webSearchToolDefinition);
}

export const webSearchTool = createWebSearchTool();
