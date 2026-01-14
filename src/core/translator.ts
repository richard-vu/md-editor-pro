interface CodeBlock {
	placeholder: string;
	content: string;
	language: string;
}

interface MermaidBlock {
	placeholder: string;
	content: string;
}

/**
 * Extract only fenced code blocks from markdown text
 * Inline code will be handled differently (translated with smart string replacement)
 */
function extractCodeBlocks(text: string): { text: string; blocks: CodeBlock[]; mermaidBlocks: MermaidBlock[] } {
	const blocks: CodeBlock[] = [];
	const mermaidBlocks: MermaidBlock[] = [];
	let counter = 0;
	let mermaidCounter = 0;

	// Match fenced code blocks with language identifier
	// Use \r?\n to match both LF and CRLF line endings
	const fencedPattern = /```(\w+)?\r?\n([\s\S]*?)```/g;

	const processedText = text.replace(fencedPattern, (match, language, code) => {
		// Extract mermaid blocks separately - they will be translated to English
		if (language && language.toLowerCase() === 'mermaid') {
			const placeholder = `__MERMAID_BLOCK_${mermaidCounter}__`;
			mermaidBlocks.push({
				placeholder,
				content: match
			});
			mermaidCounter++;
			return placeholder;
		}

		const placeholder = `__CODE_BLOCK_${counter}__`;
		blocks.push({
			placeholder,
			content: match,
			language: language || 'plain'
		});
		counter++;
		return placeholder;
	});

	return { text: processedText, blocks, mermaidBlocks };
}

/**
 * Restore code blocks from placeholders
 */
function restoreCodeBlocks(text: string, blocks: CodeBlock[]): string {
	let result = text;
	for (const block of blocks) {
		result = result.replace(block.placeholder, block.content);
	}
	return result;
}

/**
 * Translate mermaid blocks to English
 */
async function translateMermaidBlocks(mermaidBlocks: MermaidBlock[]): Promise<MermaidBlock[]> {
	const translatedBlocks: MermaidBlock[] = [];

	for (const block of mermaidBlocks) {
		// Extract mermaid content from the code block
		const mermaidMatch = block.content.match(/```mermaid\r?\n([\s\S]*?)```/);
		if (!mermaidMatch) {
			translatedBlocks.push(block);
			continue;
		}

		const mermaidContent = mermaidMatch[1];

		try {
			// Translate to English
			const encodedText = encodeURIComponent(mermaidContent);
			const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodedText}`;

			const response = await fetch(url);
			if (!response.ok) {
				// If translation fails, keep original
				translatedBlocks.push(block);
				continue;
			}

			const data: any = await response.json();
			if (data && data[0]) {
				const translated = data[0].map((item: any) => item[0]).join('');
				translatedBlocks.push({
					placeholder: block.placeholder,
					content: `\`\`\`mermaid\n${translated}\`\`\``
				});
			} else {
				translatedBlocks.push(block);
			}
		} catch (error) {
			// If error, keep original
			translatedBlocks.push(block);
		}
	}

	return translatedBlocks;
}

/**
 * Translate string literals inside inline code
 * Preserves code syntax, only translates string content
 */
async function translateInlineCode(code: string, sourceLang: string, targetLang: string): Promise<string> {
	// Match string literals (single or double quotes)
	// Use separate patterns for single and double quotes
	const strings: Array<{ placeholder: string; quote: string; content: string; match: string }> = [];
	let counter = 0;

	// Extract strings
	let codeWithPlaceholders = code;

	// First, handle double-quoted strings
	codeWithPlaceholders = codeWithPlaceholders.replace(/"([^"]*)"/g, (match, content) => {
		const placeholder = `__STRING_${counter}__`;
		strings.push({ placeholder, quote: '"', content, match });
		counter++;
		return placeholder;
	});

	// Then, handle single-quoted strings
	codeWithPlaceholders = codeWithPlaceholders.replace(/'([^']*)'/g, (match, content) => {
		const placeholder = `__STRING_${counter}__`;
		strings.push({ placeholder, quote: "'", content, match });
		counter++;
		return placeholder;
	});

	// Translate each string
	const translatedStrings: Array<{ placeholder: string; translatedMatch: string }> = [];
	for (const str of strings) {
		try {
			const encodedText = encodeURIComponent(str.content);
			const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodedText}`;
			const response = await fetch(url);

			if (response.ok) {
				const data: any = await response.json();
				if (data && data[0]) {
					const translated = data[0].map((item: any) => item[0]).join('');
					translatedStrings.push({
						placeholder: str.placeholder,
						translatedMatch: `${str.quote}${translated}${str.quote}`
					});
				} else {
					translatedStrings.push({
						placeholder: str.placeholder,
						translatedMatch: str.match
					});
				}
			} else {
				translatedStrings.push({
					placeholder: str.placeholder,
					translatedMatch: str.match
				});
			}

			await new Promise(resolve => setTimeout(resolve, 50));
		} catch (error) {
			translatedStrings.push({
				placeholder: str.placeholder,
				translatedMatch: str.match
			});
		}
	}

	// Restore strings
	let result = codeWithPlaceholders;
	for (const str of translatedStrings) {
		result = result.replace(str.placeholder, str.translatedMatch);
	}

	return result;
}

/**
 * Translate a single line of text using Google Translate API
 * Handles inline code by translating string literals within it
 * @param line - Line to translate
 * @param sourceLang - Source language code
 * @param targetLang - Target language code
 * @returns Translated line
 */
async function translateLine(line: string, sourceLang: string, targetLang: string): Promise<string> {
	if (!line.trim()) {
		return line; // Keep empty lines
	}

	// Extract inline code blocks
	const codeBlocks: Array<{ placeholder: string; code: string; match: string }> = [];
	let counter = 0;

	const lineWithPlaceholders = line.replace(/`([^`]+)`/g, (match, code) => {
		const placeholder = `__INLINE_CODE_${counter}__`;
		codeBlocks.push({ placeholder, code, match });
		counter++;
		return placeholder;
	});

	// Translate the text (without inline code)
	try {
		const encodedText = encodeURIComponent(lineWithPlaceholders);
		const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodedText}`;

		const response = await fetch(url);

		if (!response.ok) {
			return line; // Keep original on error
		}

		const data: any = await response.json();

		let translatedLine = line;
		if (data && data[0]) {
			translatedLine = data[0].map((item: any) => item[0]).join('');
		}

		await new Promise(resolve => setTimeout(resolve, 50));

		// Translate inline code blocks (only string literals)
		const translatedCodeBlocks: Array<{ placeholder: string; translatedMatch: string }> = [];
		for (const block of codeBlocks) {
			const translatedCode = await translateInlineCode(block.code, sourceLang, targetLang);
			translatedCodeBlocks.push({
				placeholder: block.placeholder,
				translatedMatch: '`' + translatedCode + '`'
			});
		}

		// Restore inline code
		let result = translatedLine;
		for (const block of translatedCodeBlocks) {
			result = result.replace(block.placeholder, block.translatedMatch);
		}

		return result;
	} catch (error) {
		return line; // Keep original on error
	}
}

/**
 * Translate text using Google Translate API
 * Automatically preserves code blocks
 * Mermaid blocks are always translated to English
 * Translates line-by-line to avoid issues with markdown headers
 * @param text - Text to translate
 * @param sourceLang - Source language code (e.g., 'vi', 'en', 'auto')
 * @param targetLang - Target language code (e.g., 'vi', 'en')
 * @returns Translated text
 */
export async function translateText(text: string, sourceLang: string, targetLang: string): Promise<string> {
	try {
		// Extract code blocks (including mermaid) before translation
		const { text: textWithoutCode, blocks, mermaidBlocks } = extractCodeBlocks(text);

		// Translate mermaid blocks to English separately
		const translatedMermaidBlocks = await translateMermaidBlocks(mermaidBlocks);

		// Split text into lines and translate each line separately
		// This avoids issues with Google Translate API truncating responses for complex markdown
		const lines = textWithoutCode.split('\n');
		const translatedLines: string[] = [];

		for (const line of lines) {
			const translatedLine = await translateLine(line, sourceLang, targetLang);
			translatedLines.push(translatedLine);
			// Small delay to avoid rate limiting
			await new Promise(resolve => setTimeout(resolve, 50));
		}

		let translated = translatedLines.join('\n');

		// Restore regular code blocks
		translated = restoreCodeBlocks(translated, blocks);

		// Restore mermaid blocks (now in English)
		for (const mermaidBlock of translatedMermaidBlocks) {
			translated = translated.replace(mermaidBlock.placeholder, mermaidBlock.content);
		}

		return translated;
	} catch (error) {
		throw new Error(`Translation failed: ${error}`);
	}
}
