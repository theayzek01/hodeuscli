export const SPINNER_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

export function getSpinnerFrame(startTimeMs: number): string {
	const now = Date.now();
	const diff = now - startTimeMs;
	const fps = 10;
	// 1000ms / 10 = 100ms per frame
	const frameIndex = Math.floor(diff / 100) % SPINNER_FRAMES.length;
	return SPINNER_FRAMES[frameIndex];
}

export function formatExecutionTime(durationMs: number): string {
    if (durationMs < 1000) {
        return `${durationMs}ms`;
    }
    const seconds = durationMs / 1000;
    if (seconds < 60) {
        return `${seconds.toFixed(1)}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remSeconds = Math.floor(seconds % 60);
    return `${minutes}m ${remSeconds}s`;
}

export function syntaxHighlightJson(jsonString: string, themeCb: (type: string, text: string) => string): string {
    try {
        // Attempt to parse just to ensure validity
        JSON.parse(jsonString);
    } catch {
        return jsonString;
    }
    
    // Naive highlighting for terminals
    return jsonString.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        let cls = "jsonValue";
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = "jsonKey";
                // Color key and remove semicolon for base match to color independently
                const key = match.slice(0, match.length - 1);
                return themeCb(cls, key) + ":";
            } else {
                cls = "jsonString";
            }
        } else if (/true|false/.test(match)) {
            cls = "jsonBoolean";
        } else if (/null/.test(match)) {
            cls = "jsonNull";
        } else {
            cls = "jsonNumber";
        }
        return themeCb(cls, match);
    });
}
