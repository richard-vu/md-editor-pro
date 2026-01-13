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
 * Extract code blocks from markdown text (except mermaid)
 * Replace them with placeholders
 */
function extractCodeBlocks(text: string): { text: string; blocks: CodeBlock[]; mermaidBlocks: MermaidBlock[] } {
	const blocks: CodeBlock[] = [];
	const mermaidBlocks: MermaidBlock[] = [];
	let counter = 0;
	let mermaidCounter = 0;
	
	// Match fenced code blocks with language identifier
	const fencedPattern = /```(\w+)?\n([\s\S]*?)```/g;
	
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
	
	// Also handle inline code
	const inlinePattern = /`([^`]+)`/g;
	const finalText = processedText.replace(inlinePattern, (match, code) => {
		const placeholder = `__INLINE_CODE_${counter}__`;
		blocks.push({
			placeholder,
			content: match,
			language: 'inline'
		});
		counter++;
		return placeholder;
	});
	
	return { text: finalText, blocks, mermaidBlocks };
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
		const mermaidMatch = block.content.match(/```mermaid\n([\s\S]*?)```/);
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
 * Translate text using Google Translate API
 * Automatically preserves code blocks
 * Mermaid blocks are always translated to English
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
		
		// Translate the main text to target language
		const encodedText = encodeURIComponent(textWithoutCode);
		const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodedText}`;

		const response = await fetch(url);
		
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data: any = await response.json();
		
		if (data && data[0]) {
			let translated = data[0].map((item: any) => item[0]).join('');
			
			// Restore regular code blocks
			translated = restoreCodeBlocks(translated, blocks);
			
			// Restore mermaid blocks (now in English)
			for (const mermaidBlock of translatedMermaidBlocks) {
				translated = translated.replace(mermaidBlock.placeholder, mermaidBlock.content);
			}
			
			return translated;
		} else {
			throw new Error('Translation failed: Invalid response');
		}
	} catch (error) {
		throw new Error(`Translation failed: ${error}`);
	}
}
