import { type GuideLocale, getGuideLocale } from "./locales";

export const guideIndexCopy: Record<
	GuideLocale,
	{
		title: string;
		description: string;
		eyebrow: string;
		heading: string;
		intro: string;
		allGuides: string;
		featured: string;
		updated: string;
		minRead: string;
		relatedGuides: string;
		startRenaming: string;
		readGuide: string;
		backToGuides: string;
		ctaTitle: string;
		ctaDesc: string;
		findGuides: string;
		byTask: string;
		byMaterial: string;
		tryExample: string;
		before: string;
		after: string;
		reviewHint: string;
	}
> = {
	en: {
		findGuides: "Find guides by task and material",
		byTask: "By task",
		byMaterial: "By material",
		tryExample: "Try this example",
		before: "Before",
		after: "After",
		reviewHint: "Review the rules, then preview sample filenames without changing real files.",
		title: "File Renaming Guides & Tutorials | Rename.Tools",
		description:
			"Practical guides for bulk file renaming with Rename.Tools: regex, sequences, photo organization, music libraries, and batch rename workflows.",
		eyebrow: "Guides",
		heading: "Practical file renaming guides",
		intro:
			"Learn reliable workflows for cleaning up photos, media libraries, downloads, and archive folders with live preview and local processing.",
		allGuides: "All guides",
		featured: "Featured workflows",
		updated: "Updated",
		minRead: "min read",
		relatedGuides: "Related guides",
		startRenaming: "Start renaming",
		readGuide: "Read guide",
		backToGuides: "Back to guides",
		ctaTitle: "Ready to try the workflow?",
		ctaDesc:
			"Open Rename.Tools, add a few sample files, and preview every rule before touching the real filenames.",
	},
	zh: {
		findGuides: "按任务与素材查找指南",
		byTask: "按任务",
		byMaterial: "按素材",
		tryExample: "试用这个示例",
		before: "原文件名",
		after: "新文件名",
		reviewHint: "先确认规则，再用示例文件名预览；不会修改真实文件。",
		title: "批量文件重命名指南与教程 | Rename.Tools",
		description:
			"Rename.Tools 批量文件重命名实用指南：正则表达式、序号、照片整理、音乐库和剧集文件名整理。",
		eyebrow: "使用指南",
		heading: "实用的文件重命名指南",
		intro: "学习如何用实时预览和本地处理工作流，安全整理照片、媒体库、下载文件和归档文件夹。",
		allGuides: "全部指南",
		featured: "精选工作流",
		updated: "更新于",
		minRead: "分钟阅读",
		relatedGuides: "相关指南",
		startRenaming: "开始重命名",
		readGuide: "阅读指南",
		backToGuides: "返回指南",
		ctaTitle: "准备试试这个工作流？",
		ctaDesc: "打开 Rename.Tools，先添加几个示例文件，用预览确认每条规则后再处理真实文件名。",
	},
	de: {
		title: "Anleitungen zum Umbenennen von Dateien | Rename.Tools",
		description:
			"Praktische Anleitungen für Stapelumbenennung: Regex, Nummerierung, Fotos, Musik, Präfixe und Leerzeichen.",
		eyebrow: "Anleitungen",
		heading: "Dateien praktisch und sicher umbenennen",
		intro:
			"Fotos, Medien, Downloads und Archive mit lokaler Verarbeitung und direkter Vorschau organisieren.",
		allGuides: "Alle Anleitungen",
		featured: "Ausgewählte Abläufe",
		updated: "Aktualisiert",
		minRead: "Min. Lesezeit",
		relatedGuides: "Verwandte Anleitungen",
		startRenaming: "Umbenennen starten",
		readGuide: "Anleitung lesen",
		backToGuides: "Zurück zu den Anleitungen",
		ctaTitle: "Bereit zum Ausprobieren?",
		ctaDesc:
			"Öffnen Sie Rename.Tools, fügen Sie einige Beispieldateinamen hinzu und prüfen Sie jede Regel vor Änderungen an echten Dateien.",
		findGuides: "Anleitungen nach Aufgabe und Material finden",
		byTask: "Nach Aufgabe",
		byMaterial: "Nach Material",
		tryExample: "Dieses Beispiel testen",
		before: "Vorher",
		after: "Nachher",
		reviewHint:
			"Prüfen Sie die Regeln und testen Sie Beispieldateinamen, ohne echte Dateien zu ändern.",
	},
	fr: {
		title: "Guides pour renommer des fichiers | Rename.Tools",
		description:
			"Guides pratiques de renommage par lot : regex, numérotation, photos, musique, préfixes et espaces.",
		eyebrow: "Guides",
		heading: "Guides pratiques de renommage",
		intro:
			"Organisez photos, médias, téléchargements et archives avec un aperçu immédiat et un traitement local.",
		allGuides: "Tous les guides",
		featured: "Méthodes à découvrir",
		updated: "Mis à jour",
		minRead: "min de lecture",
		relatedGuides: "Guides associés",
		startRenaming: "Commencer à renommer",
		readGuide: "Lire le guide",
		backToGuides: "Retour aux guides",
		ctaTitle: "Prêt à essayer ?",
		ctaDesc:
			"Ouvrez Rename.Tools, ajoutez quelques noms d’exemple et vérifiez chaque règle avant de modifier de vrais fichiers.",
		findGuides: "Trouver des guides par tâche et type de fichier",
		byTask: "Par tâche",
		byMaterial: "Par type de fichier",
		tryExample: "Essayer cet exemple",
		before: "Avant",
		after: "Après",
		reviewHint:
			"Vérifiez les règles puis testez les noms d’exemple sans modifier de vrais fichiers.",
	},
	es: {
		title: "Guías para renombrar archivos | Rename.Tools",
		description:
			"Guías prácticas de renombrado por lotes: regex, numeración, fotos, música, prefijos y espacios.",
		eyebrow: "Guías",
		heading: "Guías prácticas para renombrar archivos",
		intro:
			"Organiza fotos, archivos multimedia, descargas y archivos históricos con vista previa y procesamiento local.",
		allGuides: "Todas las guías",
		featured: "Flujos destacados",
		updated: "Actualizado",
		minRead: "min de lectura",
		relatedGuides: "Guías relacionadas",
		startRenaming: "Empezar a renombrar",
		readGuide: "Leer la guía",
		backToGuides: "Volver a las guías",
		ctaTitle: "¿Quieres probarlo?",
		ctaDesc:
			"Abre Rename.Tools, añade algunos nombres de ejemplo y revisa cada regla antes de modificar archivos reales.",
		findGuides: "Buscar guías por tarea y tipo de archivo",
		byTask: "Por tarea",
		byMaterial: "Por tipo de archivo",
		tryExample: "Probar este ejemplo",
		before: "Antes",
		after: "Después",
		reviewHint: "Revisa las reglas y prueba los nombres de ejemplo sin modificar archivos reales.",
	},
	ja: {
		title: "ファイル名変更ガイド・チュートリアル | Rename.Tools",
		description: "一括リネームの実践ガイド：正規表現、連番、写真、音楽、接頭辞、スペースの整理。",
		eyebrow: "ガイド",
		heading: "実践的なファイル名変更ガイド",
		intro:
			"プレビューとローカル処理を使い、写真、メディア、ダウンロード、保存フォルダーを整理します。",
		allGuides: "すべてのガイド",
		featured: "おすすめの手順",
		updated: "更新日",
		minRead: "分で読めます",
		relatedGuides: "関連ガイド",
		startRenaming: "名前変更を始める",
		readGuide: "ガイドを読む",
		backToGuides: "ガイド一覧に戻る",
		ctaTitle: "この手順を試してみませんか？",
		ctaDesc: "Rename.Toolsでサンプル名を追加し、実ファイルを変更する前に各ルールを確認しましょう。",
		findGuides: "作業やファイルの種類からガイドを探す",
		byTask: "作業から探す",
		byMaterial: "ファイルの種類から探す",
		tryExample: "この例を試す",
		before: "変更前",
		after: "変更後",
		reviewHint: "ルールを確認してからサンプル名でプレビューします。実ファイルは変更しません。",
	},
	ko: {
		title: "파일 이름 변경 가이드 | Rename.Tools",
		description: "일괄 이름 변경 실전 가이드: 정규식, 순번, 사진, 음악, 접두사와 공백 정리.",
		eyebrow: "가이드",
		heading: "실용적인 파일 이름 변경 가이드",
		intro: "미리보기와 로컬 처리로 사진, 미디어, 다운로드와 보관 폴더를 정리하세요.",
		allGuides: "모든 가이드",
		featured: "추천 작업 흐름",
		updated: "업데이트",
		minRead: "분 읽기",
		relatedGuides: "관련 가이드",
		startRenaming: "이름 변경 시작",
		readGuide: "가이드 읽기",
		backToGuides: "가이드 목록으로",
		ctaTitle: "직접 해 보시겠어요?",
		ctaDesc: "Rename.Tools에서 샘플 이름을 추가하고 실제 파일을 바꾸기 전에 각 규칙을 확인하세요.",
		findGuides: "작업과 파일 종류별 가이드 찾기",
		byTask: "작업별",
		byMaterial: "파일 종류별",
		tryExample: "이 예제 사용하기",
		before: "변경 전",
		after: "변경 후",
		reviewHint: "규칙을 검토한 뒤 샘플 이름으로 미리 봅니다. 실제 파일은 변경하지 않습니다.",
	},
};

export function getGuideIndexCopy(locale: string) {
	return guideIndexCopy[getGuideLocale(locale)];
}
