/**
 * Component for displaying bash command execution with streaming output.
 */

import { Container, Spacer, Text, type TUI, truncateToWidth, visibleWidth } from "@mariozechner/pi-tui";
import stripAnsi from "strip-ansi";
import {
	DEFAULT_MAX_BYTES,
	DEFAULT_MAX_LINES,
	type TruncationResult,
	truncateTail,
} from "../../../core/tools/truncate.js";
import { theme } from "../theme/theme.js";
import { t } from "../../../core/i18n.js";
import { formatExecutionTime, getSpinnerFrame } from "./execution-utils.js";

// Preview line limit when not expanded (matches tool execution behavior)
const PREVIEW_LINES = 20;

export class BashExecutionComponent extends Container {
	private command: string;
	private outputLines: string[] = [];
	private status: "running" | "complete" | "cancelled" | "error" = "running";
	private exitCode: number | undefined = undefined;
	private truncationResult?: TruncationResult;
	private fullOutputPath?: string;
	private expanded = false;
	private contentContainer: Container;
	private cwd: string;
	private startTime: number;
	private endTime?: number;
	private uiInstance: TUI;
	private animationInterval?: NodeJS.Timeout;

	constructor(command: string, ui: TUI, cwd: string = process.cwd(), excludeFromContext = false) {
		super();
		this.command = command;
		this.cwd = cwd;
		this.uiInstance = ui;
		this.startTime = Date.now();

		// Add spacer for breathing room
		this.addChild(new Spacer(1));

		// Content container (holds our Antigravity-style Card)
		this.contentContainer = new Container();
		this.addChild(this.contentContainer);

		// Start animation loop while running
		this.animationInterval = setInterval(() => {
			if (this.status === "running") {
				this.uiInstance.requestRender();
			}
		}, 100);
	}

	/**
	 * Set whether the output is expanded (shows full output) or collapsed (preview only).
	 */
	setExpanded(expanded: boolean): void {
		this.expanded = expanded;
		this.updateDisplay();
	}

	override invalidate(): void {
		super.invalidate();
		this.updateDisplay();
	}

	override render(width: number): string[] {
		if (width < 15) {
			return [];
		}
		return super.render(width);
	}

	appendOutput(chunk: string): void {
		// Strip ANSI codes and normalize line endings
		const clean = stripAnsi(chunk).replace(/\r\n/g, "\n").replace(/\r/g, "\n");

		// Append to output lines
		const newLines = clean.split("\n");
		if (this.outputLines.length > 0 && newLines.length > 0) {
			// Append first chunk to last line (incomplete line continuation)
			this.outputLines[this.outputLines.length - 1] += newLines[0];
			this.outputLines.push(...newLines.slice(1));
		} else {
			this.outputLines.push(...newLines);
		}

		this.updateDisplay();
	}

	setComplete(
		exitCode: number | undefined,
		cancelled: boolean,
		truncationResult?: TruncationResult,
		fullOutputPath?: string,
	): void {
		this.exitCode = exitCode;
		this.status = cancelled
			? "cancelled"
			: exitCode !== 0 && exitCode !== undefined && exitCode !== null
				? "error"
				: "complete";
		this.truncationResult = truncationResult;
		this.fullOutputPath = fullOutputPath;
		this.endTime = Date.now();

		if (this.animationInterval) {
			clearInterval(this.animationInterval);
			this.animationInterval = undefined;
		}

		this.updateDisplay();
	}

	private updateDisplay(): void {
		// Apply truncation for LLM context limits (same limits as bash tool)
		const fullOutput = this.outputLines.join("\n");
		const contextTruncation = truncateTail(fullOutput, {
			maxLines: DEFAULT_MAX_LINES,
			maxBytes: DEFAULT_MAX_BYTES,
		});

		// Get the lines to potentially display (after context truncation)
		const availableLines = contextTruncation.content ? contextTruncation.content.split("\n") : [];

		// Apply preview truncation based on expanded state
		const previewLogicalLines = availableLines.slice(-PREVIEW_LINES);

		// Rebuild content container
		this.contentContainer.clear();

		const colorKey = this.status === "error" ? "error" : this.status === "running" ? "accent" : "bashMode";
		const borderColor = (str: string) => theme.fg(colorKey, str);

		// --- Header ---
		const titleText = this.status === "running" ? t("bash.running_title") : t("bash.ran_title");
		this.contentContainer.addChild({
			render: (width: number) => {
				let title = ` ${titleText} `;
				if (title.length > Math.max(0, width - 3)) {
					title = title.substring(0, Math.max(0, width - 6)) + "...";
				}
				const line = "─".repeat(Math.max(0, width - stripAnsi(title).length - 2));
				return [borderColor(`┌─${theme.bold(theme.fg("accent", title))}${line}┐`)];
			},
			invalidate: () => {},
		});

		// --- Context Line (CWD > Command) ---
		const shortCwd = this.cwd.length > 30 ? "..." + this.cwd.slice(-27) : this.cwd;
		const contextLine = ` ${shortCwd} > ${this.command}`;
		this.contentContainer.addChild({
			render: (width: number) => {
				const visibleWidth = width - 4;
				const truncated =
					contextLine.length > visibleWidth ? contextLine.substring(0, visibleWidth - 3) + "..." : contextLine;
				const padding = " ".repeat(Math.max(0, width - stripAnsi(truncated).length - 2));
				return [borderColor(`│`) + theme.fg("muted", truncated) + padding + borderColor(`│`)];
			},
			invalidate: () => {},
		});

		// --- Divider ---
		this.contentContainer.addChild({
			render: (width: number) => [borderColor(`├${"─".repeat(width - 2)}┤`)],
			invalidate: () => {},
		});

		// --- Output Area ---
		if (availableLines.length > 0) {
			const renderOutput = (lines: string[], width: number) => {
				const visibleWidth = width - 4;
				return lines.map((line) => {
					const cleanLine = stripAnsi(line);
					const truncated = cleanLine.length > visibleWidth ? cleanLine.substring(0, visibleWidth - 3) + "..." : cleanLine;
					const paddingChars = Math.max(0, width - stripAnsi(truncated).length - 3); // -3 because of borders (2) + leading space (1)
					const padding = " ".repeat(paddingChars);
					return borderColor(`│`) + theme.fg("muted", ` ${truncated}`) + padding + borderColor(`│`);
				});
			};

			if (this.expanded) {
				this.contentContainer.addChild({
					render: (width: number) => renderOutput(availableLines, width),
					invalidate: () => {},
				});
			} else {
				this.contentContainer.addChild({
					render: (width: number) => renderOutput(previewLogicalLines, width),
					invalidate: () => {},
				});
			}
		} else if (this.status === "running") {
			// Center the animated spinner in the box
			this.contentContainer.addChild({
				render: (width: number) => {
					const spinner = getSpinnerFrame(this.startTime);
					let label = ` ${spinner} ${t("bash.waiting_label")}`;
					if (stripAnsi(label).length > Math.max(0, width - 2)) {
						label = label.substring(0, Math.max(0, width - 5)) + "...";
					}
					const paddingChars = Math.max(0, width - stripAnsi(label).length - 2);
					const padding = " ".repeat(paddingChars);
					
					// Return properly truncated colored structure
					const visibleSpinner = stripAnsi(label).includes(spinner) ? theme.fg("accent", ` ${spinner} `) : "";
					const visibleText = label.replace(` ${spinner} `, "");
					
					return [borderColor(`│`) + visibleSpinner + theme.fg("dim", visibleText) + padding + borderColor(`│`)];
				},
				invalidate: () => {},
			});
		}

		// --- Footer ---
		const durationMs = (this.endTime || Date.now()) - this.startTime;
		const durStr = formatExecutionTime(durationMs);

		const smartHint = this.status === "error" ? " [Alt+Enter -> Ask AI to Fix] " : "";

		const footerText =
			this.status === "running"
				? ` ${t("bash.waiting")} (${durStr}) `
				: this.status === "complete"
					? ` ${t("bash.success")} (${durStr}) `
					: this.status === "cancelled"
						? ` ${t("bash.cancelled")} (${durStr}) `
						: ` ${t("bash.status")}: ${this.exitCode} (${durStr}) `;

		this.contentContainer.addChild({
			render: (width: number) => {
				const leftSide = `└─${theme.bold(theme.fg("dim", footerText))}`;
				const rightSide = (smartHint ? theme.fg("error", smartHint) : "") + "┘";
				
				const leftWidth = visibleWidth(leftSide);
				const rightWidth = visibleWidth(rightSide);
				
				if (leftWidth + rightWidth > width) {
					// Fallback: simplified footer if text is too long
					const simpleFooter = `└─${theme.bold(theme.fg("dim", t("bash.status")))}─┘`;
					const simpleWidth = visibleWidth(simpleFooter);
					if (simpleWidth > width) return [borderColor("└" + "─".repeat(Math.max(0, width - 2)) + "┘")];
					return [borderColor(truncateToWidth(simpleFooter, width - 1) + "┘")];
				}

				const remaining = Math.max(0, width - leftWidth - rightWidth);
				const line = borderColor("─".repeat(remaining));
				
				return [borderColor(leftSide) + line + borderColor(rightSide)];
			},
			invalidate: () => {},
		});
	}

	/**
	 * Get the raw output for creating BashExecutionMessage.
	 */
	getOutput(): string {
		return this.outputLines.join("\n");
	}

	/**
	 * Get the command that was executed.
	 */
	getCommand(): string {
		return this.command;
	}
}
