/**
 * Translate text using Google Translate API
 * @param text - Text to translate
 * @param sourceLang - Source language code (e.g., 'vi', 'en')
 * @param targetLang - Target language code (e.g., 'vi', 'en')
 * @returns Translated text
 */
export async function translateText(text: string, sourceLang: string, targetLang: string): Promise<string> {
	try {
		const encodedText = encodeURIComponent(text);
		const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodedText}`;

		const response = await fetch(url);
		
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data: any = await response.json();
		
		if (data && data[0]) {
			const translated = data[0].map((item: any) => item[0]).join('');
			return translated;
		} else {
			throw new Error('Translation failed: Invalid response');
		}
	} catch (error) {
		throw new Error(`Translation failed: ${error}`);
	}
}
