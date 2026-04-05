/**
 * i18n Helper for Hodeuscli
 */
type Translations = {
	[lang: string]: {
		[key: string]: string;
	};
};

const dic: Translations = {
	en: {
		"banner.interrupt": "to interrupt",
		"banner.clear": "to clear",
		"banner.twice": "twice",
		"banner.exit": "to exit",
		"banner.exit_empty": "to exit (empty)",
		"banner.suspend": "to suspend",
		"banner.delete_end": "to delete to end",
		"banner.cycle_thinking": "to cycle thinking level",
		"banner.cycle_models": "to cycle models",
		"banner.select_model": "to select model",
		"banner.expand_tools": "to expand tools",
		"banner.expand_thinking": "to expand thinking",
		"banner.external_editor": "for external editor",
		"banner.commands": "for commands",
		"banner.run_bash": "to run bash",
		"banner.run_bash_no_context": "to run bash (no context)",
		"banner.queue_follow_up": "to queue follow-up",
		"banner.edit_queued": "to edit all queued messages",
		"banner.paste_image": "to paste image",
		"banner.drop_files": "drop files",
		"banner.attach": "to attach",
		"banner.onboarding": "Hodeuscli can explain its own features and look up its docs. Ask it how to use or extend Hodeuscli.",
		"banner.nomodels": "Warning: No models available. Use /login or set an API key environment variable. Then use /model to select a model.",
		
		"tool.running": "Running",
		"tool.ran": "Ran",
		"tool.waiting": "Waiting...",
		"tool.success": "Success",
		"tool.error": "Error",
		
		"bash.running": "Executing Bash",
		"bash.running_title": "Running Command",
		"bash.ran_title": "Ran Command",
		"bash.waiting_label": "Running... (Esc to cancel)",
		"bash.status": "Exit Code",
		"bash.active": "Active",
		"bash.complete": "Complete",
		"bash.cancelled": "Cancelled",
		"bash.success": "Success",
		"bash.waiting": "Waiting...",
		
		"status.thinking": "Thinking...",
		"status.working": "Working...",
		"status.compacting": "Compacting context...",
		"status.compacted": "Context compacted",
		"status.retrying": "Retrying ({{attempt}})...",
		"status.aborted": "Operation aborted",
		"status.error": "Error: {{error}}",
		"status.model_not_found": "Model not found: {{model}}",
		"status.search_web": "Searching the web...",
		"status.share_cancelled": "Share cancelled",
		"status.gist_creating": "Creating gist...",
		
		"notification.new_version": "New version available: {{version}}. Run 'npm install -g @mariozechner/pi-coding-agent' to update.",
		"notification.updates_available": "{{count}} package updates available. View in settings.",
		
		"help.title": "Help & Commands",
		"help.description": "Hodeuscli commands and shortcuts:",
		"help.commands": "Commands",
		"help.hotkeys": "Hotkeys",
		"help.back": "Press Esc to go back"
	},
	tr: {
		"banner.interrupt": "durdurmak için",
		"banner.clear": "temizlemek için",
		"banner.twice": "iki kez",
		"banner.exit": "çıkmak için",
		"banner.exit_empty": "çıkmak için (boşken)",
		"banner.suspend": "askıya almak için",
		"banner.delete_end": "sonuna kadar silmek için",
		"banner.cycle_thinking": "düşünme seviyesini değiştirmek için",
		"banner.cycle_models": "modelleri değiştirmek için",
		"banner.select_model": "model seçmek için",
		"banner.expand_tools": "araçları genişletmek için",
		"banner.expand_thinking": "düşünceyi genişletmek için",
		"banner.external_editor": "harici düzenleyici için",
		"banner.commands": "komutlar için",
		"banner.run_bash": "bash çalıştırmak için",
		"banner.run_bash_no_context": "bash çalıştırmak için (bağlamsız)",
		"banner.queue_follow_up": "takip sorusu eklemek için",
		"banner.edit_queued": "sıradaki tüm mesajları düzenlemek için",
		"banner.paste_image": "resim yapıştırmak için",
		"banner.drop_files": "sürükle-bırak",
		"banner.attach": "eklemek için",
		"banner.onboarding": "Hodeuscli kendi özelliklerini açıklayabilir ve dokümanlarına bakabilir. Nasıl kullanılacağını veya genişletileceğini sorun.",
		"banner.nomodels": "Uyarı: Model bulunamadı. /login kullanın veya API anahtarı ayarlayın. Sonra /model ile seçim yapın.",
		
		"tool.running": "Çalışıyor",
		"tool.ran": "Çalıştırıldı",
		"tool.waiting": "Bekleniyor...",
		"tool.success": "Başarılı",
		"tool.error": "Hata",
		
		"bash.running": "Bash Çalıştırılıyor",
		"bash.running_title": "Komut Çalıştırılıyor",
		"bash.ran_title": "Komut Çalıştırıldı",
		"bash.waiting_label": "Çalışıyor... (Esc ile iptal)",
		"bash.status": "Çıkış Kodu",
		"bash.active": "Aktif",
		"bash.complete": "Tamamlandı",
		"bash.cancelled": "İptal Edildi",
		"bash.success": "Başarılı",
		"bash.waiting": "Bekleniyor...",
		
		"status.thinking": "Düşünüyor...",
		"status.working": "Çalışıyor...",
		"status.compacting": "Bağlam sıkıştırılıyor...",
		"status.compacted": "Bağlam sıkıştırıldı",
		"status.retrying": "Yeniden deneniyor ({{attempt}})...",
		"status.aborted": "İşlem iptal edildi",
		"status.error": "Hata: {{error}}",
		"status.model_not_found": "Model bulunamadı: {{model}}",
		"status.search_web": "Web'de aranıyor...",
		"status.share_cancelled": "Paylaşım iptal edildi",
		"status.gist_creating": "Gist oluşturuluyor...",
		
		"notification.new_version": "Yeni versiyon mevcut: {{version}}. Güncellemek için 'npm install -g @mariozechner/pi-coding-agent' komutunu çalıştırın.",
		"notification.updates_available": "{{count}} paket güncellemesi mevcut. Ayarlardan görüntüleyin.",
		
		"help.title": "Yardım ve Komutlar",
		"help.description": "Hodeuscli komutları ve kısayolları:",
		"help.commands": "Komutlar",
		"help.hotkeys": "Kısayol Tuşları",
		"help.back": "Geri dönmek için Esc'ye basın"
	}
};

let currentLang = "en";

export function setLanguage(lang: string) {
	currentLang = lang;
}

export function t(key: string, vars?: Record<string, string>): string {
	let template = dic[currentLang]?.[key] || dic["en"]?.[key] || key;

	if (vars) {
		for (const [k, v] of Object.entries(vars)) {
			template = template.replace(new RegExp(`{{\\s*${k}\\s*}}`, "g"), v);
		}
	}
	
	return template;
}
