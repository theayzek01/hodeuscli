import type { ThinkingLevel } from "@games-coder/hodeuscli-agent-core";
import type { Transport } from "@games-coder/hodeuscli-ai";
import {
	Container,
	getCapabilities,
	type SelectItem,
	SelectList,
	type SelectListLayoutOptions,
	type SettingItem,
	SettingsList,
	Spacer,
	Text,
} from "@games-coder/hodeuscli-tui";
import { getSelectListTheme, getSettingsListTheme, theme } from "../theme/theme.js";
import { DynamicBorder } from "./dynamic-border.js";

const SETTINGS_SUBMENU_SELECT_LIST_LAYOUT: SelectListLayoutOptions = {
	minPrimaryColumnWidth: 12,
	maxPrimaryColumnWidth: 32,
};

const THINKING_DESCRIPTIONS: Record<ThinkingLevel, string> = {
	off: "Düşünme kapalı",
	minimal: "Çok kısa düşünme (~1k jeton)",
	low: "Hafif düşünme (~2k jeton)",
	medium: "Orta düzey düşünme (~8k jeton)",
	high: "Derin düşünme (~16k jeton)",
	xhigh: "Maksimum düşünme (~32k jeton)",
};

export interface SettingsConfig {
	autoCompact: boolean;
	showImages: boolean;
	autoResizeImages: boolean;
	blockImages: boolean;
	enableSkillCommands: boolean;
	steeringMode: "all" | "one-at-a-time";
	followUpMode: "all" | "one-at-a-time";
	transport: Transport;
	thinkingLevel: ThinkingLevel;
	availableThinkingLevels: ThinkingLevel[];
	currentTheme: string;
	availableThemes: string[];
	hideThinkingBlock: boolean;
	collapseChangelog: boolean;
	doubleEscapeAction: "fork" | "tree" | "none";
	treeFilterMode: "default" | "no-tools" | "user-only" | "labeled-only" | "all";
	showHardwareCursor: boolean;
	editorPaddingX: number;
	autocompleteMaxVisible: number;
	quietStartup: boolean;
	clearOnShrink: boolean;
	language: "en" | "tr";
}

export interface SettingsCallbacks {
	onAutoCompactChange: (enabled: boolean) => void;
	onShowImagesChange: (enabled: boolean) => void;
	onAutoResizeImagesChange: (enabled: boolean) => void;
	onBlockImagesChange: (blocked: boolean) => void;
	onEnableSkillCommandsChange: (enabled: boolean) => void;
	onSteeringModeChange: (mode: "all" | "one-at-a-time") => void;
	onFollowUpModeChange: (mode: "all" | "one-at-a-time") => void;
	onTransportChange: (transport: Transport) => void;
	onThinkingLevelChange: (level: ThinkingLevel) => void;
	onThemeChange: (theme: string) => void;
	onThemePreview?: (theme: string) => void;
	onHideThinkingBlockChange: (hidden: boolean) => void;
	onCollapseChangelogChange: (collapsed: boolean) => void;
	onDoubleEscapeActionChange: (action: "fork" | "tree" | "none") => void;
	onTreeFilterModeChange: (mode: "default" | "no-tools" | "user-only" | "labeled-only" | "all") => void;
	onShowHardwareCursorChange: (enabled: boolean) => void;
	onEditorPaddingXChange: (padding: number) => void;
	onAutocompleteMaxVisibleChange: (maxVisible: number) => void;
	onQuietStartupChange: (enabled: boolean) => void;
	onClearOnShrinkChange: (enabled: boolean) => void;
	onLanguageChange: (language: "en" | "tr") => void;
	onCancel: () => void;
}

/**
 * A submenu component for selecting from a list of options.
 */
class SelectSubmenu extends Container {
	private selectList: SelectList;

	constructor(
		title: string,
		description: string,
		options: SelectItem[],
		currentValue: string,
		onSelect: (value: string) => void,
		onCancel: () => void,
		onSelectionChange?: (value: string) => void,
	) {
		super();

		// Title
		this.addChild(new Text(theme.bold(theme.fg("accent", title)), 0, 0));

		// Description
		if (description) {
			this.addChild(new Spacer(1));
			this.addChild(new Text(theme.fg("muted", description), 0, 0));
		}

		// Spacer
		this.addChild(new Spacer(1));

		// Select list
		this.selectList = new SelectList(
			options,
			Math.min(options.length, 10),
			getSelectListTheme(),
			SETTINGS_SUBMENU_SELECT_LIST_LAYOUT,
		);

		// Pre-select current value
		const currentIndex = options.findIndex((o) => o.value === currentValue);
		if (currentIndex !== -1) {
			this.selectList.setSelectedIndex(currentIndex);
		}

		this.selectList.onSelect = (item) => {
			onSelect(item.value);
		};

		this.selectList.onCancel = onCancel;

		if (onSelectionChange) {
			this.selectList.onSelectionChange = (item) => {
				onSelectionChange(item.value);
			};
		}

		this.addChild(this.selectList);

		// Hint
		this.addChild(new Spacer(1));
		this.addChild(new Text(theme.fg("dim", "  Seçmek için Enter · Geri dönmek için Esc"), 0, 0));
	}

	handleInput(data: string): void {
		this.selectList.handleInput(data);
	}
}

/**
 * Main settings selector component.
 */
export class SettingsSelectorComponent extends Container {
	private settingsList: SettingsList;

	constructor(config: SettingsConfig, callbacks: SettingsCallbacks) {
		super();

		const supportsImages = getCapabilities().images;

		const items: SettingItem[] = [
			{
				id: "autocompact",
				label: "Otomatik sıkıştırma",
				description: "Bağlam çok büyüdüğünde otomatik olarak sıkıştır",
				currentValue: config.autoCompact ? "true" : "false",
				values: ["true", "false"],
			},
			{
				id: "steering-mode",
				label: "Yönlendirme modu",
				description:
					"Akış sırasında Enter tuşu mesajları kuyruğa alır. 'one-at-a-time': birini ilet, yanıt bekle. 'all': hepsini birden ilet.",
				currentValue: config.steeringMode,
				values: ["one-at-a-time", "all"],
			},
			{
				id: "follow-up-mode",
				label: "Takip modu",
				description:
					"Alt+Enter, ajan durana kadar takip mesajlarını kuyruğa alır. 'one-at-a-time': birini ilet, yanıt bekle. 'all': hepsini birden ilet.",
				currentValue: config.followUpMode,
				values: ["one-at-a-time", "all"],
			},
			{
				id: "transport",
				label: "Taşıma protokolü",
				description: "Birden fazla taşımayı destekleyen sağlayıcılar için tercih edilen protokol",
				currentValue: config.transport,
				values: ["sse", "websocket", "auto"],
			},
			{
				id: "hide-thinking",
				label: "Düşünceyi gizle",
				description: "Asistan yanıtlarındaki düşünme bloklarını gizle",
				currentValue: config.hideThinkingBlock ? "true" : "false",
				values: ["true", "false"],
			},
			{
				id: "collapse-changelog",
				label: "Günlüğü daralt",
				description: "Güncellemelerden sonra özetlenmiş değişiklik günlüğünü göster",
				currentValue: config.collapseChangelog ? "true" : "false",
				values: ["true", "false"],
			},
			{
				id: "quiet-startup",
				label: "Sessiz başlangıç",
				description: "Başlangıçta ayrıntılı çıktıları devre dışı bırak",
				currentValue: config.quietStartup ? "true" : "false",
				values: ["true", "false"],
			},
			{
				id: "double-escape-action",
				label: "Çift Esc işlemi",
				description: "Editör boşken Escape tuşuna iki kez basıldığında yapılacak işlem",
				currentValue: config.doubleEscapeAction,
				values: ["tree", "fork", "none"],
			},
			{
				id: "tree-filter-mode",
				label: "Ağaç filtresi modu",
				description: "/tree komutu açıldığında varsayılan filtre",
				currentValue: config.treeFilterMode,
				values: ["default", "no-tools", "user-only", "labeled-only", "all"],
			},
			{
				id: "thinking",
				label: "Düşünme seviyesi",
				description: "Düşünme yeteneğine sahip modeller için akıl yürütme derinliği",
				currentValue: config.thinkingLevel,
				submenu: (currentValue, done) =>
					new SelectSubmenu(
						"Düşünme Seviyesi",
						"Düşünme yeteneğine sahip modeller için akıl yürütme derinliğini seçin",
						config.availableThinkingLevels.map((level) => ({
							value: level,
							label: level,
							description: THINKING_DESCRIPTIONS[level],
						})),
						currentValue,
						(value) => {
							callbacks.onThinkingLevelChange(value as ThinkingLevel);
							done(value);
						},
						() => done(),
					),
			},
			{
				id: "theme",
				label: "Tema",
				description: "Arayüz için renk teması",
				currentValue: config.currentTheme,
				submenu: (currentValue, done) =>
					new SelectSubmenu(
						"Tema",
						"Renk teması seçin",
						config.availableThemes.map((t) => ({
							value: t,
							label: t,
						})),
						currentValue,
						(value) => {
							callbacks.onThemeChange(value);
							done(value);
						},
						() => {
							// Restore original theme on cancel
							callbacks.onThemePreview?.(currentValue);
							done();
						},
						(value) => {
							// Preview theme on selection change
							callbacks.onThemePreview?.(value);
						},
					),
			},
			{
				id: "language",
				label: "Dil",
				description: "Arayüz dilini ayarlayın (İngilizce veya Türkçe)",
				currentValue: config.language,
				values: ["en", "tr"],
			},
		];

		// Only show image toggle if terminal supports it
		if (supportsImages) {
			// Insert after autocompact
			items.splice(1, 0, {
				id: "show-images",
				label: "Resimleri göster",
				description: "Resimleri terminalde satır içi oluştur",
				currentValue: config.showImages ? "true" : "false",
				values: ["true", "false"],
			});
		}

		// Image auto-resize toggle (always available, affects both attached and read images)
		items.splice(supportsImages ? 2 : 1, 0, {
			id: "auto-resize-images",
			label: "Resimleri otomatik boyutlandır",
			description: "Daha iyi model uyumluluğu için büyük resimleri maksimum 2000x2000 boyutuna getir",
			currentValue: config.autoResizeImages ? "true" : "false",
			values: ["true", "false"],
		});

		// Block images toggle (always available, insert after auto-resize-images)
		const autoResizeIndex = items.findIndex((item) => item.id === "auto-resize-images");
		items.splice(autoResizeIndex + 1, 0, {
			id: "block-images",
			label: "Resimleri engelle",
			description: "Resimlerin LLM sağlayıcılarına gönderilmesini engelle",
			currentValue: config.blockImages ? "true" : "false",
			values: ["true", "false"],
		});

		// Skill commands toggle (insert after block-images)
		const blockImagesIndex = items.findIndex((item) => item.id === "block-images");
		items.splice(blockImagesIndex + 1, 0, {
			id: "skill-commands",
			label: "Yetenek komutları",
			description: "Yetenekleri /skill:isim komutları olarak kaydet",
			currentValue: config.enableSkillCommands ? "true" : "false",
			values: ["true", "false"],
		});

		// Hardware cursor toggle (insert after skill-commands)
		const skillCommandsIndex = items.findIndex((item) => item.id === "skill-commands");
		items.splice(skillCommandsIndex + 1, 0, {
			id: "show-hardware-cursor",
			label: "Donanım imlecini göster",
			description: "IME desteği için konumlandırırken terminal imlecini göster",
			currentValue: config.showHardwareCursor ? "true" : "false",
			values: ["true", "false"],
		});

		// Editor padding toggle (insert after show-hardware-cursor)
		const hardwareCursorIndex = items.findIndex((item) => item.id === "show-hardware-cursor");
		items.splice(hardwareCursorIndex + 1, 0, {
			id: "editor-padding",
			label: "Editör boşluğu",
			description: "Giriş editörü için yatay boşluk (0-3)",
			currentValue: String(config.editorPaddingX),
			values: ["0", "1", "2", "3"],
		});

		// Autocomplete max visible toggle (insert after editor-padding)
		const editorPaddingIndex = items.findIndex((item) => item.id === "editor-padding");
		items.splice(editorPaddingIndex + 1, 0, {
			id: "autocomplete-max-visible",
			label: "Otomatik tamamlama maks. öge",
			description: "Açılır listede maksimum görünür öge sayısı (3-20)",
			currentValue: String(config.autocompleteMaxVisible),
			values: ["3", "5", "7", "10", "15", "20"],
		});

		// Clear on shrink toggle (insert after autocomplete-max-visible)
		const autocompleteIndex = items.findIndex((item) => item.id === "autocomplete-max-visible");
		items.splice(autocompleteIndex + 1, 0, {
			id: "clear-on-shrink",
			label: "Küçülmede temizle",
			description: "İçerik küçüldüğünde boş satırları temizle (titremeye neden olabilir)",
			currentValue: config.clearOnShrink ? "true" : "false",
			values: ["true", "false"],
		});

		// Add borders
		this.addChild(new DynamicBorder());

		this.settingsList = new SettingsList(
			items,
			10,
			getSettingsListTheme(),
			(id, newValue) => {
				switch (id) {
					case "autocompact":
						callbacks.onAutoCompactChange(newValue === "true");
						break;
					case "show-images":
						callbacks.onShowImagesChange(newValue === "true");
						break;
					case "auto-resize-images":
						callbacks.onAutoResizeImagesChange(newValue === "true");
						break;
					case "block-images":
						callbacks.onBlockImagesChange(newValue === "true");
						break;
					case "skill-commands":
						callbacks.onEnableSkillCommandsChange(newValue === "true");
						break;
					case "steering-mode":
						callbacks.onSteeringModeChange(newValue as "all" | "one-at-a-time");
						break;
					case "follow-up-mode":
						callbacks.onFollowUpModeChange(newValue as "all" | "one-at-a-time");
						break;
					case "transport":
						callbacks.onTransportChange(newValue as Transport);
						break;
					case "hide-thinking":
						callbacks.onHideThinkingBlockChange(newValue === "true");
						break;
					case "collapse-changelog":
						callbacks.onCollapseChangelogChange(newValue === "true");
						break;
					case "quiet-startup":
						callbacks.onQuietStartupChange(newValue === "true");
						break;
					case "double-escape-action":
						callbacks.onDoubleEscapeActionChange(newValue as "fork" | "tree");
						break;
					case "tree-filter-mode":
						callbacks.onTreeFilterModeChange(
							newValue as "default" | "no-tools" | "user-only" | "labeled-only" | "all",
						);
						break;
					case "show-hardware-cursor":
						callbacks.onShowHardwareCursorChange(newValue === "true");
						break;
					case "editor-padding":
						callbacks.onEditorPaddingXChange(parseInt(newValue, 10));
						break;
					case "autocomplete-max-visible":
						callbacks.onAutocompleteMaxVisibleChange(parseInt(newValue, 10));
						break;
					case "clear-on-shrink":
						callbacks.onClearOnShrinkChange(newValue === "true");
						break;
					case "language":
						callbacks.onLanguageChange(newValue as "en" | "tr");
						break;
				}
			},
			callbacks.onCancel,
			{ enableSearch: true },
		);

		this.addChild(this.settingsList);
		this.addChild(new DynamicBorder());
	}

	getSettingsList(): SettingsList {
		return this.settingsList;
	}
}
