import { getDefaultConfig, type RuleConfig, type SequenceConfig } from "@/lib/rename/types";
import type { GuideLocale } from "./locales";

export interface GuideRecipe {
	id: string;
	guideSlug: string;
	name: Record<GuideLocale, string>;
	note: Record<GuideLocale, string>;
	rules: RuleConfig[];
	examples: { before: string; after: string }[];
}

function sequence(config: Partial<SequenceConfig>): RuleConfig {
	const defaults = getDefaultConfig("sequence");
	if (defaults.type !== "sequence") throw new Error("Invalid sequence defaults");
	return { type: "sequence", config: { ...defaults.config, ...config } };
}

function replace(find: string, replacement: string): RuleConfig {
	const defaults = getDefaultConfig("findReplace");
	if (defaults.type !== "findReplace") throw new Error("Invalid replacement defaults");
	return { type: "findReplace", config: { ...defaults.config, find, replace: replacement } };
}

export const guideRecipes: GuideRecipe[] = [
	{
		id: "photo-date-sequence",
		guideSlug: "organize-photos-by-date-sequence",
		name: {
			de: "Fotos mit festem Datum und Sequenz",
			fr: "Photos avec date fixe et séquence",
			es: "Fotos con fecha fija y secuencia",
			ja: "写真に固定日付と連番を付ける",
			ko: "사진에 고정 날짜와 순번 붙이기",
			en: "Photos with a fixed date and sequence",
			zh: "照片：固定日期与序号",
		},
		note: {
			de: "Verwendet das feste Datum 2026-05-22, keine EXIF-Daten. Ändern Sie Datum und Ort vor der Anwendung auf eigene Fotos.",
			fr: "Utilise la date fixe 2026-05-22, pas EXIF. Modifiez la date et le lieu avant de traiter vos photos.",
			es: "Usa la fecha fija 2026-05-22, no EXIF. Cambia fecha y lugar antes de usar tus propias fotos.",
			ja: "EXIFではなく固定日付 2026-05-22 を使います。自分の写真に適用する前に日付と場所を変更してください。",
			ko: "EXIF가 아닌 고정 날짜 2026-05-22를 사용합니다. 실제 사진에 쓰기 전에 날짜와 장소를 바꾸세요.",
			en: "Uses the literal date 2026-05-22, not EXIF metadata. Change the date and location before using your own photos.",
			zh: "使用固定日期 2026-05-22，不读取 EXIF。处理自己的照片前，请修改日期和地点。",
		},
		rules: [sequence({ template: "2026-05-22_{n}_tokyo" })],
		examples: [
			{ before: "IMG_0421.jpg", after: "2026-05-22_001_tokyo.jpg" },
			{ before: "IMG_0422.jpg", after: "2026-05-22_002_tokyo.jpg" },
		],
	},
	{
		id: "regex-date",
		guideSlug: "regex-batch-rename",
		name: {
			de: "Datum im Dateinamen verschieben",
			fr: "Déplacer la date dans le nom",
			es: "Mover la fecha del nombre",
			ja: "ファイル名の日付を移動する",
			ko: "파일 이름의 날짜 옮기기",
			en: "Move a leading date with regex",
			zh: "正则：把开头日期移到末尾",
		},
		note: {
			de: "Verschiebt ein führendes Datum ans Ende und ersetzt Leerzeichen durch Unterstriche. Namen ohne passendes Datum bleiben bis auf die Leerzeichenbereinigung unverändert.",
			fr: "Déplace une date initiale à la fin et remplace les espaces par des soulignements. Sans date correspondante, seul le nettoyage des espaces s’applique.",
			es: "Mueve una fecha inicial al final y cambia espacios por guiones bajos. Si la fecha no coincide, solo se aplica la limpieza de espacios.",
			ja: "先頭の日付を末尾へ移し、スペースをアンダースコアにします。日付が一致しない名前にはスペースの整理だけを適用します。",
			ko: "맨 앞 날짜를 끝으로 옮기고 공백을 밑줄로 바꿉니다. 날짜가 일치하지 않는 이름에는 공백 정리만 적용합니다.",
			en: "Matches a leading YYYY-MM-DD date, moves it after the title, then replaces spaces with underscores. Extensions are preserved.",
			zh: "匹配开头的 YYYY-MM-DD 日期并移到标题后，再将空格替换为下划线。扩展名保持不变。",
		},
		rules: [
			{
				type: "regex",
				config: { pattern: "^(\\d{4}-\\d{2}-\\d{2})\\s+(.+)$", replacement: "$2_$1", flags: "" },
			},
			replace(" ", "_"),
		],
		examples: [
			{ before: "2026-05-22 invoice client-a.pdf", after: "invoice_client-a_2026-05-22.pdf" },
			{ before: "notes.pdf", after: "notes.pdf" },
		],
	},
	{
		id: "sequence-preserve",
		guideSlug: "sequence-file-numbering",
		name: {
			de: "Vorhandene Fotonummern auffüllen",
			fr: "Compléter les numéros de photos existants",
			es: "Completar números de fotos existentes",
			ja: "既存の写真番号をゼロ埋めする",
			ko: "기존 사진 번호 자릿수 맞추기",
			en: "Pad existing photo numbers",
			zh: "序号：保留原编号并补零",
		},
		note: {
			de: "Erhält die erste Zahl im Namen und füllt sie auf drei Stellen auf. Namen ohne Zahl verwenden stattdessen den Sequenzzähler.",
			fr: "Conserve le premier nombre du nom et le complète sur trois chiffres. Sans nombre, utilise le compteur de séquence.",
			es: "Conserva el primer número del nombre y lo completa hasta tres dígitos. Los nombres sin número usan el contador de secuencia.",
			ja: "名前の最初の数字を保持し、3桁に揃えます。数字がない名前は連番カウンターを使います。",
			ko: "이름의 첫 숫자를 유지하고 세 자리로 채웁니다. 숫자가 없는 이름은 순번 카운터를 사용합니다.",
			en: "Preserves the first number in each name and pads it to three digits. Names without a number use the sequence counter instead.",
			zh: "保留名称中的第一个数字并补足三位。没有数字的名称会使用序号计数器。",
		},
		rules: [sequence({ preserveOriginal: true, preservePattern: "(\\d+)", template: "{n}_photo" })],
		examples: [
			{ before: "photo1.jpg", after: "001_photo.jpg" },
			{ before: "photo10.jpg", after: "010_photo.jpg" },
		],
	},
	{
		id: "prefix-suffix",
		guideSlug: "add-prefix-suffix-to-filenames",
		name: {
			de: "Projektpräfix und Versionssuffix hinzufügen",
			fr: "Ajouter un préfixe de projet et un suffixe de version",
			es: "Añadir prefijo de proyecto y sufijo de versión",
			ja: "案件の接頭辞と版の接尾辞を付ける",
			ko: "프로젝트 접두사와 버전 접미사 추가",
			en: "Add a project prefix and version suffix",
			zh: "添加项目名前缀与版本后缀",
		},
		note: {
			de: "Fügt client-a_ am Anfang und _review vor der Erweiterung ein. Ursprünglicher Name und Erweiterung bleiben erhalten.",
			fr: "Ajoute client-a_ au début et _review avant l’extension. Le nom initial et l’extension sont conservés.",
			es: "Añade client-a_ al inicio y _review antes de la extensión. Conserva el nombre original y la extensión.",
			ja: "先頭に client-a_、拡張子の前に _review を追加します。元の名前と拡張子は保持します。",
			ko: "앞에 client-a_, 확장자 앞에 _review를 추가합니다. 원래 이름과 확장자는 유지합니다.",
			en: "Adds client-a_ at the start and _review before the extension. Existing names and extensions stay intact.",
			zh: "在开头添加 client-a_，在扩展名前添加 _review，保留原名称和扩展名。",
		},
		rules: [
			{ type: "insert", config: { text: "client-a_", position: "start", index: 0 } },
			{ type: "insert", config: { text: "_review", position: "end", index: 0 } },
		],
		examples: [
			{ before: "proposal.pdf", after: "client-a_proposal_review.pdf" },
			{ before: "budget.xlsx", after: "client-a_budget_review.xlsx" },
		],
	},
	{
		id: "spaces-to-underscores",
		guideSlug: "replace-spaces-in-filenames",
		name: {
			de: "Leerzeichen durch Unterstriche ersetzen",
			fr: "Remplacer les espaces par des soulignements",
			es: "Cambiar espacios por guiones bajos",
			ja: "スペースをアンダースコアにする",
			ko: "공백을 밑줄로 바꾸기",
			en: "Replace spaces with underscores",
			zh: "将文件名空格替换为下划线",
		},
		note: {
			de: "Ersetzt jedes normale Leerzeichen durch einen Unterstrich. Zwei Leerzeichen ergeben zwei Unterstriche; andere Satzzeichen und Erweiterungen bleiben unverändert.",
			fr: "Remplace chaque espace ordinaire par un soulignement. Deux espaces donnent deux soulignements ; les autres signes et extensions restent inchangés.",
			es: "Cambia cada espacio normal por un guion bajo. Dos espacios producen dos guiones bajos; los demás signos y extensiones no cambian.",
			ja: "通常のスペースを一つずつ置換します。二つのスペースは二つのアンダースコアになり、他の記号と拡張子は変わりません。",
			ko: "일반 공백 하나를 밑줄 하나로 바꿉니다. 공백 두 개는 밑줄 두 개가 되며 다른 기호와 확장자는 그대로입니다.",
			en: "Replaces every ordinary space with an underscore. Two consecutive spaces become two underscores; other punctuation and extensions are unchanged.",
			zh: "将每个普通空格替换为下划线。两个连续空格会变成两个下划线；其他标点和扩展名不变。",
		},
		rules: [replace(" ", "_")],
		examples: [
			{ before: "Quarterly Report 2026.pdf", after: "Quarterly_Report_2026.pdf" },
			{ before: "draft  final.txt", after: "draft__final.txt" },
		],
	},
];

export function getGuideRecipe(id: string) {
	return guideRecipes.find((recipe) => recipe.id === id);
}

export function getRecipeForGuide(slug: string) {
	return guideRecipes.find((recipe) => recipe.guideSlug === slug);
}
