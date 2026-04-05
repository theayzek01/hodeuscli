import { type Component, visibleWidth } from "@games-coder/hodeuscli-tui";
import { theme } from "../theme/theme.js";

export interface TaskItem {
	text: string;
	completed: boolean;
}

/**
 * TaskView component - displays a list of tasks with checkboxes in a side panel
 */
export class TaskView implements Component {
	private tasks: TaskItem[] = [];
	private expanded = false;
	private width = 40;

	constructor() {}

	setTasks(tasks: TaskItem[]): void {
		this.tasks = tasks;
	}

	setExpanded(expanded: boolean): void {
		this.expanded = expanded;
	}

	isExpanded(): boolean {
		return this.expanded;
	}

	invalidate(): void {
		// No internal cache to invalidate yet
	}

	render(width: number): string[] {
		if (this.tasks.length === 0 && !this.expanded) {
			return [];
		}

		const lines: string[] = [];
		const border = theme.fg("border", "│");
		const topBorder = theme.fg("border", "┌" + "─".repeat(width - 2) + "┐");
		const bottomBorder = theme.fg("border", "└" + "─".repeat(width - 2) + "┘");
		const title = theme.bold(theme.fg("accent", " GÖREVLER "));
		
		// Header with title
		const titlePadding = Math.floor((width - 2 - visibleWidth(" GÖREVLER ")) / 2);
		const header = theme.fg("border", "┌" + "─".repeat(titlePadding)) + title + theme.fg("border", "─".repeat(width - 2 - titlePadding - visibleWidth(" GÖREVLER ")) + "┐");
		lines.push(header);

		if (this.tasks.length === 0) {
			lines.push(border + " ".repeat(width - 2) + border);
			const emptyMsg = "  Henüz bir görev eklenmedi. ";
			const emptyPadding = Math.floor((width - 2 - visibleWidth(emptyMsg)) / 2);
			lines.push(border + " ".repeat(emptyPadding) + theme.fg("dim", emptyMsg) + " ".repeat(Math.max(0, width - 2 - emptyPadding - visibleWidth(emptyMsg))) + border);
			lines.push(border + " ".repeat(width - 2) + border);
		} else {
			for (const task of this.tasks) {
				const checkbox = task.completed ? theme.fg("success", "✅") : theme.fg("dim", "⭕");
				const text = task.text;
				const contentWidth = width - 8; // Icon + space + border*2
				
				// Wrap text if needed
				const wrapped = this.wrapText(text, contentWidth);
				for (let i = 0; i < wrapped.length; i++) {
					const prefix = i === 0 ? ` ${checkbox} ` : "     ";
					const line = prefix + wrapped[i];
					const padding = " ".repeat(Math.max(0, width - 2 - visibleWidth(line)));
					lines.push(border + line + padding + border);
				}
			}
		}

		lines.push(bottomBorder);
		return lines;
	}

	private wrapText(text: string, width: number): string[] {
		const words = text.split(" ");
		const lines: string[] = [];
		let currentLine = "";

		for (const word of words) {
			if (visibleWidth(currentLine + " " + word) <= width) {
				currentLine += (currentLine === "" ? "" : " ") + word;
			} else {
				if (currentLine !== "") lines.push(currentLine);
				currentLine = word;
				// If a single word is longer than width, force break it
				while (visibleWidth(currentLine) > width) {
					lines.push(currentLine.substring(0, width));
					currentLine = currentLine.substring(width);
				}
			}
		}
		if (currentLine !== "") lines.push(currentLine);
		return lines;
	}
}
