import * as esbuild from 'esbuild';

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

const esbuildProblemMatcherPlugin: esbuild.Plugin = {
	name: 'esbuild-problem-matcher',

	setup(build) {
		build.onStart(() => {
			console.log('[watch] build started');
		});
		build.onEnd((result) => {
			result.errors.forEach(({ text, location }) => {
				console.error(`✘ [ERROR] ${text}`);
				if (location) {
					console.error(`    ${location.file}:${location.line}:${location.column}:`);
				}
			});
			console.log('[watch] build finished');
		});
	},
};

async function main(): Promise<void> {
	// Build main extension
	const ctx = await esbuild.context({
		entryPoints: [
			'src/extension.ts'
		],
		bundle: true,
		format: 'cjs',
		minify: production,
		sourcemap: !production,
		sourcesContent: false,
		platform: 'node',
		outfile: 'dist/extension.js',
		external: ['vscode'],
		logLevel: 'silent',
		plugins: [
			esbuildProblemMatcherPlugin,
		],
	});

	// Build webview editor.ts
	const editorCtx = await esbuild.context({
		entryPoints: ['media/editor/editor.ts'],
		bundle: true,
		format: 'iife',
		minify: production,
		sourcemap: false, // Disable sourcemap for webview to avoid CSP issues
		platform: 'browser',
		outfile: 'media/editor/editor.js',
		logLevel: 'silent',
		plugins: [esbuildProblemMatcherPlugin],
	});

	// Build webview toolbar.ts
	const toolbarCtx = await esbuild.context({
		entryPoints: ['media/editor/toolbar.ts'],
		bundle: true,
		format: 'iife',
		minify: production,
		sourcemap: false, // Disable sourcemap for webview to avoid CSP issues
		platform: 'browser',
		outfile: 'media/editor/toolbar.js',
		logLevel: 'silent',
		plugins: [esbuildProblemMatcherPlugin],
	});

	if (watch) {
		await Promise.all([
			ctx.watch(),
			editorCtx.watch(),
			toolbarCtx.watch()
		]);
	} else {
		await ctx.rebuild();
		await editorCtx.rebuild();
		await toolbarCtx.rebuild();
		await ctx.dispose();
		await editorCtx.dispose();
		await toolbarCtx.dispose();
	}
}

main().catch((e: Error) => {
	console.error(e);
	process.exit(1);
});
