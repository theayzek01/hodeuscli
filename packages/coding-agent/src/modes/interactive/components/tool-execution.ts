/**
 * Component for displaying tool execution with rendering support.
 */
import { Box, type Component, Container, getCapabilities, Image, Spacer, Text, type TUI } from "@games-coder/hodeuscli-tui";
import stripAnsi from "strip-ansi";
import type { ToolDefinition, ToolRenderContext } from "../../../core/extensions/types.js";
import { allToolDefinitions } from "../../../core/tools/index.js";
import { getTextOutput as getRenderedTextOutput } from "../../../core/tools/render-utils.js";
import { convertToPng } from "../../../utils/image-convert.js";
import { t } from "../../../core/i18n.js";
import { theme } from "../theme/theme.js";
import { formatExecutionTime, getSpinnerFrame, syntaxHighlightJson } from "./execution-utils.js";

export interface ToolExecutionOptions {
	showImages?: boolean;
}

export class ToolExecutionComponent extends Container {
	private contentBox: Container;
	private callRendererComponent?: Component;
	private resultRendererComponent?: Component;
	private rendererState: any = {};
	private imageComponents: Image[] = [];
	private imageSpacers: Spacer[] = [];
	private toolName: string;
	private toolCallId: string;
	private args: any;
	private expanded = false;
	private showImages: boolean;
	private isPartial = true;
	private toolDefinition?: ToolDefinition<any, any>;
	private builtInToolDefinition?: ToolDefinition<any, any>;
	private ui: TUI;
	private cwd: string;
	private executionStarted = false;
	private argsComplete = false;
	private result?: {
		content: Array<{ type: string; text?: string; data?: string; mimeType?: string }>;
		isError: boolean;
		details?: any;
	};
	private convertedImages: Map<number, { data: string; mimeType: string }> = new Map();
	private hideComponent = false;
	private startTime: number = Date.now();
	private endTime?: number;
	private animationInterval?: NodeJS.Timeout;

	constructor(
		toolName: string,
		toolCallId: string,
		args: any,
		options: ToolExecutionOptions = {},
		toolDefinition: ToolDefinition<any, any> | undefined,
		ui: TUI,
		cwd: string = process.cwd(),
	) {
		super();
		this.toolName = toolName;
		this.toolCallId = toolCallId;
		this.args = args;
		this.toolDefinition = toolDefinition;
		this.builtInToolDefinition = allToolDefinitions[toolName as keyof typeof allToolDefinitions];
		this.showImages = options.showImages ?? true;
		this.ui = ui;
		this.cwd = cwd;

		this.addChild(new Spacer(1));

		// Content container (Antigravity-style Card)
		this.contentBox = new Container();
		this.addChild(this.contentBox);

		this.updateDisplay();
	}

	private getCallRenderer(): ToolDefinition<any, any>["renderCall"] | undefined {
		if (!this.builtInToolDefinition) {
			return this.toolDefinition?.renderCall;
		}
		if (!this.toolDefinition) {
			return this.builtInToolDefinition.renderCall;
		}
		return this.toolDefinition.renderCall ?? this.builtInToolDefinition.renderCall;
	}

	private getResultRenderer(): ToolDefinition<any, any>["renderResult"] | undefined {
		if (!this.builtInToolDefinition) {
			return this.toolDefinition?.renderResult;
		}
		if (!this.toolDefinition) {
			return this.builtInToolDefinition.renderResult;
		}
		return this.toolDefinition.renderResult ?? this.builtInToolDefinition.renderResult;
	}

	private hasRendererDefinition(): boolean {
		return this.builtInToolDefinition !== undefined || this.toolDefinition !== undefined;
	}

	private getRenderContext(lastComponent: Component | undefined): ToolRenderContext {
		return {
			args: this.args,
			toolCallId: this.toolCallId,
			invalidate: () => {
				this.invalidate();
				this.ui.requestRender();
			},
			lastComponent,
			state: this.rendererState,
			cwd: this.cwd,
			executionStarted: this.executionStarted,
			argsComplete: this.argsComplete,
			isPartial: this.isPartial,
			expanded: this.expanded,
			showImages: this.showImages,
			isError: this.result?.isError ?? false,
		};
	}

	private createCallFallback(): Component {
		return new Text(theme.fg("toolTitle", theme.bold(this.toolName)), 0, 0);
	}

	private createResultFallback(): Component | undefined {
		const output = this.getTextOutput();
		if (!output) {
			return undefined;
		}
		return new Text(theme.fg("toolOutput", output), 0, 0);
	}

	updateArgs(args: any): void {
		this.args = args;
		this.updateDisplay();
	}

	markExecutionStarted(): void {
		this.executionStarted = true;
		this.updateDisplay();
		this.ui.requestRender();
	}

	setArgsComplete(): void {
		this.argsComplete = true;
		this.updateDisplay();
		this.ui.requestRender();
	}

	updateResult(
		result: {
			content: Array<{ type: string; text?: string; data?: string; mimeType?: string }>;
			details?: any;
			isError: boolean;
		},
		isPartial = false,
	): void {
		this.result = result;
		this.isPartial = isPartial;
		
		if (!isPartial) {
			this.endTime = Date.now();
			if (this.animationInterval) {
				clearInterval(this.animationInterval);
				this.animationInterval = undefined;
			}
		}

		this.updateDisplay();
		this.maybeConvertImagesForKitty();
	}

	private maybeConvertImagesForKitty(): void {
		const caps = getCapabilities();
		if (caps.images !== "kitty") return;
		if (!this.result) return;

		const imageBlocks = this.result.content.filter((c) => c.type === "image");
		for (let i = 0; i < imageBlocks.length; i++) {
			const img = imageBlocks[i];
			if (!img.data || !img.mimeType) continue;
			if (img.mimeType === "image/png") continue;
			if (this.convertedImages.has(i)) continue;

			const index = i;
			convertToPng(img.data, img.mimeType).then((converted) => {
				if (converted) {
					this.convertedImages.set(index, converted);
					this.updateDisplay();
					this.ui.requestRender();
				}
			});
		}
	}

	setExpanded(expanded: boolean): void {
		this.expanded = expanded;
		this.updateDisplay();
	}

	setShowImages(show: boolean): void {
		this.showImages = show;
		this.updateDisplay();
	}

	override invalidate(): void {
		super.invalidate();
		this.updateDisplay();
	}

	override render(width: number): string[] {
		if (this.hideComponent || width < 15) {
			return [];
		}
		return super.render(width);
	}

	private updateDisplay(): void {
		const colorKey = this.isPartial ? "bashMode" : this.result?.isError ? "error" : "bashMode";
		const borderColor = (str: string) => theme.fg(colorKey, str);

		this.contentBox.clear();
		this.hideComponent = false;

		// --- Header ---
		const isWebSearch = this.toolName.includes("search") || this.toolName.includes("web");
		const titleText = this.isPartial ? (isWebSearch ? "Web'de aranıyor..." : t("tool.running")) : t("tool.ran");
		const headerColorKey = isWebSearch ? "syntaxKeyword" : "bashMode"; // Use blue for web search
		const headerBorderColor = (str: string) => theme.fg(headerColorKey, str);
		this.contentBox.addChild({
			render: (width: number) => {
				const spinner = this.isPartial ? ` ${getSpinnerFrame(this.startTime)}` : "";
				const durMs = (this.endTime || Date.now()) - this.startTime;
				const timer = `(${formatExecutionTime(durMs)})`;
				let title = ` ${titleText}: ${this.toolName}${spinner} ${theme.fg("dim", timer)} `;
				
				if (stripAnsi(title).length > Math.max(0, width - 3)) {
					const clean = stripAnsi(title);
					title = title.replace(clean, clean.substring(0, Math.max(0, width - 6)) + "...");
				}

				const titleLength = stripAnsi(title).length;
				const line = "─".repeat(Math.max(0, width - titleLength - 2));
				const titleColor = isWebSearch ? "syntaxKeyword" : "accent";
				return [headerBorderColor(`┌─${theme.bold(theme.fg(titleColor as any, title))}${line}┐`)];
			},
			invalidate: () => {},
		});

		// --- Renderer Content ---
		const innerContainer = new Container();
		if (this.hasRendererDefinition()) {
			const callRenderer = this.getCallRenderer();
			if (!callRenderer) {
				innerContainer.addChild(this.createCallFallback());
			} else {
				try {
					const component = callRenderer(this.args, theme, this.getRenderContext(this.callRendererComponent));
					this.callRendererComponent = component;
					innerContainer.addChild(component);
				} catch {
					this.callRendererComponent = undefined;
					innerContainer.addChild(this.createCallFallback());
				}
			}

			if (this.result) {
				const resultRenderer = this.getResultRenderer();
				if (!resultRenderer) {
					const component = this.createResultFallback();
					if (component) innerContainer.addChild(component);
				} else {
					try {
						const component = resultRenderer(
							{ content: this.result.content as any, details: this.result.details },
							{ expanded: this.expanded, isPartial: this.isPartial },
							theme,
							this.getRenderContext(this.resultRendererComponent),
						);
						this.resultRendererComponent = component;
						innerContainer.addChild(component);
					} catch {
						this.resultRendererComponent = undefined;
						const component = this.createResultFallback();
						if (component) innerContainer.addChild(component);
					}
				}
			}
		} else {
			innerContainer.addChild(new Text(this.formatToolExecution(), 0, 0));
		}

		// Wrap inner container in borders
		this.contentBox.addChild({
			render: (width: number) => {
				const lines = innerContainer.render(width - 4);
				return lines.map((line) => {
					const visibleLength = stripAnsi(line).length;
					const paddingChars = Math.max(0, width - visibleLength - 4);
					const padding = " ".repeat(paddingChars);
					return headerBorderColor(`│ `) + line + padding + headerBorderColor(` │`);
				});
			},
			invalidate: () => innerContainer.invalidate(),
		});

		// --- Footer ---
		const footerText = this.isPartial ? t("tool.waiting") : this.result?.isError ? t("tool.error") : t("tool.success");
		const smartHint = this.result?.isError ? " [Alt+Enter -> Ask AI to Fix] " : "";

		this.contentBox.addChild({
			render: (width: number) => {
				const leftSide = `└─${theme.bold(theme.fg("dim", ` ${footerText} `))}`;
				let rightSide = smartHint ? theme.fg("error", smartHint) + "┘" : "┘";
				
				let leftAnsiClean = stripAnsi(leftSide);
				let rightAnsiClean = stripAnsi(rightSide);
				
				if (leftAnsiClean.length + rightAnsiClean.length > width) {
					rightSide = "┘";
					rightAnsiClean = stripAnsi(rightSide);
				}

				const remaining = Math.max(0, width - leftAnsiClean.length - rightAnsiClean.length);
				const line = "─".repeat(remaining);

				let combined = headerBorderColor(`└─${theme.bold(theme.fg("dim", ` ${footerText} `))}─${line}`) + (rightSide === "┘" ? headerBorderColor("┘") : theme.fg("error", smartHint) + headerBorderColor("┘"));
				if (stripAnsi(combined).length > width) {
					let safeFooter = stripAnsi(footerText);
					if (safeFooter.length > width - 4) safeFooter = safeFooter.substring(0, width - 7) + "...";
					combined = headerBorderColor(`└─${theme.bold(theme.fg("dim", ` ${safeFooter} `))}`) + headerBorderColor("─".repeat(Math.max(0, width - safeFooter.length - 5))) + headerBorderColor("┘");
				}

				return [combined];
			},
			invalidate: () => {},
		});

		// Handle images
		for (const img of this.imageComponents) {
			this.removeChild(img);
		}
		this.imageComponents = [];
		for (const spacer of this.imageSpacers) {
			this.removeChild(spacer);
		}
		this.imageSpacers = [];

		if (this.result) {
			const imageBlocks = this.result.content.filter((c) => c.type === "image");
			const caps = getCapabilities();
			for (let i = 0; i < imageBlocks.length; i++) {
				const img = imageBlocks[i];
				if (caps.images && this.showImages && img.data && img.mimeType) {
					const converted = this.convertedImages.get(i);
					const imageData = converted?.data ?? img.data;
					const imageMimeType = converted?.mimeType ?? img.mimeType;
					if (caps.images === "kitty" && imageMimeType !== "image/png") continue;

					const spacer = new Spacer(1);
					this.addChild(spacer);
					this.imageSpacers.push(spacer);
					const imageComponent = new Image(
						imageData,
						imageMimeType,
						{ fallbackColor: (s: string) => theme.fg("toolOutput", s) },
						{ maxWidthCells: 60 },
					);
					this.imageComponents.push(imageComponent);
					this.addChild(imageComponent);
				}
			}
		}
	}

	private getTextOutput(): string {
		return getRenderedTextOutput(this.result, this.showImages);
	}

	private formatToolExecution(): string {
		let text = theme.fg("toolTitle", theme.bold(this.toolName));
		const content = JSON.stringify(this.args, null, 2);
		if (content) {
			const highlighted = syntaxHighlightJson(content, (type, match) => {
				switch (type) {
					case "jsonKey": return theme.fg("syntaxKeyword", match);
					case "jsonString": return theme.fg("syntaxString", match);
					case "jsonNumber": return theme.fg("syntaxNumber", match);
					case "jsonBoolean": return theme.fg("syntaxVariable", match);
					default: return theme.fg("dim", match);
				}
			});
			text += `\n\n${highlighted}`;
		}
		const output = this.getTextOutput();
		if (output) {
			text += `\n${output}`;
		}
		return text;
	}
}
