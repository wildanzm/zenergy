<script lang="ts">
	import { onMount } from 'svelte';
	import { marked } from 'marked';
	import ZenLogo from '$lib/assets/zen.svg?raw';
	import hljs from 'highlight.js/lib/core';

	// Import specific languages to reduce bundle size
	import javascript from 'highlight.js/lib/languages/javascript';
	import typescript from 'highlight.js/lib/languages/typescript';
	import python from 'highlight.js/lib/languages/python';
	import java from 'highlight.js/lib/languages/java';
	import cpp from 'highlight.js/lib/languages/cpp';
	import css from 'highlight.js/lib/languages/css';
	import html from 'highlight.js/lib/languages/xml';
	import json from 'highlight.js/lib/languages/json';
	import bash from 'highlight.js/lib/languages/bash';
	import sql from 'highlight.js/lib/languages/sql';
	import markdown from 'highlight.js/lib/languages/markdown';

	// Register languages
	hljs.registerLanguage('javascript', javascript);
	hljs.registerLanguage('typescript', typescript);
	hljs.registerLanguage('python', python);
	hljs.registerLanguage('java', java);
	hljs.registerLanguage('cpp', cpp);
	hljs.registerLanguage('css', css);
	hljs.registerLanguage('html', html);
	hljs.registerLanguage('xml', html);
	hljs.registerLanguage('json', json);
	hljs.registerLanguage('bash', bash);
	hljs.registerLanguage('sh', bash);
	hljs.registerLanguage('sql', sql);
	hljs.registerLanguage('markdown', markdown);
	hljs.registerLanguage('js', javascript);
	hljs.registerLanguage('ts', typescript);
	hljs.registerLanguage('py', python);

	export let message: string;
	export let isUser: boolean;
	export let timestamp: Date = new Date();
	export let animate: boolean = false;
	export let fileAttachments: string[] = [];

	let displayedMessage = '';
	let messageContainer: HTMLDivElement;
	let isAnimating = false;
	let showCopyButton = false;
	let copySuccess = false;
	let showThinkingProcess = false;

	// Parse message for thinking and output sections
	$: ({ thinkingSection, outputSection, hasThinking } = parseDeepThinkMessage(displayedMessage));

	// Configure marked for safe HTML and better table handling
	marked.setOptions({
		breaks: true,
		gfm: true,
		silent: true, // Disable warnings for production
		pedantic: false
	});

	// Custom renderer to handle code blocks and prevent comment display
	const renderer = new marked.Renderer();

	// Override table renderer first (before code renderer)
	renderer.table = function (token) {
		const header = token.header;
		const rows = token.rows;

		let headerHtml = '';
		if (header && header.length > 0) {
			const headerCells = header
				.map((cell, index) => {
					// Clean up markdown markers from header text
					const cleanText = (cell.text || '')
						.replace(/\*\*/g, '') // Remove bold markers
						.replace(/\*/g, '') // Remove italic markers
						.replace(/`/g, '') // Remove code markers
						.trim();
					return `<th style="padding: 8px 10px; text-align: left; font-weight: 600; font-size: 11px; color: rgb(255 255 255); background: rgb(59 130 246); white-space: nowrap; min-width: 80px; position: sticky; top: 0; z-index: 2;">${cleanText}</th>`;
				})
				.join('');
			headerHtml = `<tr>${headerCells}</tr>`;
		}

		let bodyHtml = '';
		if (rows && rows.length > 0) {
			bodyHtml = rows
				.map((row) => {
					const cells = row
						.map((cell, index) => {
							// Clean up markdown markers from cell text
							const cleanText = (cell.text || '')
								.replace(/\*\*/g, '') // Remove bold markers
								.replace(/\*/g, '') // Remove italic markers
								.replace(/`/g, '') // Remove code markers
								.trim();
							return `<td style="padding: 6px 8px; font-size: 11px; color: rgb(31 41 55); background: rgb(248 250 252); word-wrap: break-word; max-width: 120px; min-width: 80px; vertical-align: top; white-space: normal; overflow-wrap: break-word;">${cleanText}</td>`;
						})
						.join('');
					return `<tr style="transition: background-color 0.2s;" onmouseover="this.style.backgroundColor='rgb(243 244 246)'" onmouseout="this.style.backgroundColor='rgb(248 250 252)'">${cells}</tr>`;
				})
				.join('');
		}

		return `
			<div class="table-wrapper responsive-table-wrapper" style="margin: 12px 0; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); background: rgb(248 250 252); overflow-x: auto; -webkit-overflow-scrolling: touch; max-width: 100%; width: 100%; border: 1px solid rgb(203 213 225); position: relative;">
				<table class="markdown-table responsive-table" style="width: 100%; border-collapse: collapse; background: rgb(248 250 252); min-width: 320px; table-layout: auto; font-size: 11px;">
					<thead>
						${headerHtml}
					</thead>
					<tbody>
						${bodyHtml}
					</tbody>
				</table>
			</div>
		`;
	};

	renderer.code = function (token) {
		const code = token.text;
		const lang = token.lang || '';
		const validLang = lang && lang.match(/^[a-zA-Z0-9_+-]*$/);
		const language = validLang ? lang : '';

		// Apply syntax highlighting
		let highlightedCode = code;
		try {
			if (language && hljs.getLanguage(language)) {
				highlightedCode = hljs.highlight(code, { language }).value;
			} else {
				highlightedCode = hljs.highlightAuto(code).value;
			}
		} catch (err) {
			highlightedCode = code
				.replace(/&/g, '&amp;')
				.replace(/</g, '&lt;')
				.replace(/>/g, '&gt;')
				.replace(/"/g, '&quot;')
				.replace(/'/g, '&#39;');
		}

		// Generate unique ID for each code block
		const codeId = `code-${Math.random().toString(36).substr(2, 9)}`;

		return `
			<div class="code-block-container" style="position: relative; margin: 16px 0; max-width: 100%; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.15); background: rgb(15 23 42);">
				<div class="code-header bg-gray-100/80 dark:bg-gray-800/80 border border-gray-200/60 dark:border-gray-700/60 backdrop-blur-sm" style="padding: 8px 12px; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center; background: rgb(59 130 246); color: white;">
					<span class="text-white" style="font-size: 12px; font-family: 'SF Mono', 'Monaco', 'Consolas', monospace; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">${language || 'code'}</span>
					<button 
						class="copy-code-btn bg-white/20 hover:bg-white/30 border border-white/20" 
						data-code="${code.replace(/"/g, '&quot;')}"
						style="padding: 4px 8px; border-radius: 6px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); color: white;"
						title="Copy code"
					>
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M7.5 3H14.6C16.8402 3 17.9603 3 18.816 3.43597C19.5686 3.81947 20.1805 4.43139 20.564 5.18404C21 6.03969 21 7.15979 21 9.4V16.5M6.2 21H14.3C15.4201 21 15.9802 21 16.408 20.782C16.7843 20.5903 17.0903 20.2843 17.282 19.908C17.5 19.4802 17.5 18.9201 17.5 17.8V9.7C17.5 8.57989 17.5 8.01984 17.282 7.59202C17.0903 7.21569 16.7843 6.90973 16.408 6.71799C15.9802 6.5 15.4201 6.5 14.3 6.5H6.2C5.0799 6.5 4.51984 6.5 4.09202 6.71799C3.71569 6.90973 3.40973 7.21569 3.21799 7.59202C3 8.01984 3 8.57989 3 9.7V17.8C3 18.9201 3 19.4802 3.21799 19.908C3.40973 20.2843 3.71569 20.5903 4.09202 20.782C4.51984 21 5.0799 21 6.2 21Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					</button>
				</div>
				<div class="code-content-wrapper" style="overflow-x: auto; overflow-y: hidden; -webkit-overflow-scrolling: touch; width: 100%; position: relative; background: rgb(15 23 42);">
					<pre class="code-content" style="margin: 0; border-radius: 0 0 12px 12px; padding: 0; background: transparent; border: none; min-width: 100%; width: max-content; display: block;"><code class="language-${language} hljs" style="display: block; min-width: 100%; padding: 16px; font-family: 'SF Mono', 'Monaco', 'Consolas', 'Fira Code', monospace; font-size: 13px; line-height: 1.6; white-space: pre; color: rgb(229 231 235); background: transparent;">${highlightedCode}</code></pre>
				</div>
			</div>
		`;
	};

	renderer.codespan = function (token) {
		const code = token.text
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;');

		return `<code class="inline-code">${code}</code>`;
	};

	marked.use({ renderer });



	/**
	 * Normalize markdown content from different AI models
	 */
	function normalizeMarkdown(content: string): string {
		if (!content) return content;

		let normalized = content;

		// Only fix obvious table issues without being too aggressive

		// 1. Fix simple space-separated headers that clearly look like tables
		// Only apply if there's a clear separator line following
		normalized = normalized.replace(
			/^([^\n|]+)\s*\n\s*([-\s|:]+)\s*\n/gm,
			(match, header, separator) => {
				// Only process if separator looks like a table separator
				if (separator.includes('-') && !header.includes('|') && header.trim().length > 0) {
					const cols = header.trim().split(/\s{2,}/);
					if (cols.length > 1 && cols.every((col: string) => col.trim().length > 0)) {
						const headerRow = '| ' + cols.join(' | ') + ' |';
						const separatorRow = '| ' + cols.map(() => '---').join(' | ') + ' |';
						return headerRow + '\n' + separatorRow + '\n';
					}
				}
				return match;
			}
		);

		// 2. Fix code blocks with different fence styles
		normalized = normalized.replace(/~~~(\w*)\s*\n([\s\S]*?)\n~~~/g, (match, lang, code) => {
			return '```' + (lang || '') + '\n' + code.trim() + '\n```';
		});

		// 3. Ensure proper spacing (minimal changes)
		normalized = normalized.replace(/\n{3,}/g, '\n\n'); // Remove excessive newlines only

		return normalized.trim();
	}

	/**
	 * Safe markdown renderer that always returns string
	 */
	function renderMarkdownSafe(md: string): string {
		try {
			// First try with normalization
			const normalizedMd = normalizeMarkdown(md);
			let result = marked.parse(normalizedMd);

			// Ensure result is always a string
			if (result instanceof Promise) {
				// Handle async case by returning original markdown
				return md;
			}

			const resultStr = result as string;

			// Check if tables were properly rendered
			if (md.includes('|') && !resultStr.includes('<table>')) {
				// Tables exist in input but weren't rendered, try without normalization
				const directResult = marked.parse(md);
				if (typeof directResult === 'string') {
					result = directResult;
				}
			}

			return typeof result === 'string' ? result : md;
		} catch (error) {
			console.warn('Markdown parsing error:', error);
			// Jika error, try without normalization
			try {
				const result = marked.parse(md);
				if (typeof result === 'string') return result;
			} catch (e) {
				// Final fallback to plain text
			}
			return md;
		}
	}



	/**
	 * Parse deepthink message to separate thinking from output
	 */
	function parseDeepThinkMessage(msg: string) {
		if (!msg) {
			return { thinkingSection: '', outputSection: msg, hasThinking: false };
		}

		// Enhanced patterns to detect thinking sections from any model
		const thinkingPatterns = [
			// XML-style tags
			/<think>([\s\S]*?)<\/think>/gi,
			/<thinking>([\s\S]*?)<\/thinking>/gi,

			// Markdown-style headers
			/^\s*#+\s*(thinking|thought process|reasoning):?\s*$([\s\S]*?)^\s*#+\s*(answer|response|output|conclusion):?\s*$/gim,

			// Bold markers
			/\*\*thinking\*\*([\s\S]*?)\*\*(answer|response|output)\*\*/gi,
			/\*\*thought process\*\*([\s\S]*?)\*\*(answer|response|output)\*\*/gi,

			// Colon-based patterns
			/^thinking:\s*([\s\S]*?)^(answer|response|output):\s*/gim,
			/^thought process:\s*([\s\S]*?)^(answer|response|output):\s*/gim,
			/^reasoning:\s*([\s\S]*?)^(answer|response|output):\s*/gim,

			// Bracket patterns
			/\[thinking\]([\s\S]*?)\[\/thinking\]/gi,
			/\[thought\]([\s\S]*?)\[\/thought\]/gi
		];

		for (const pattern of thinkingPatterns) {
			const match = msg.match(pattern);
			if (match) {
				let thinking = '';
				let output = '';

				// Handle different capture groups
				if (pattern.source.includes('([\\s\\S]*?)')) {
					const fullMatch = match[0];
					const thinkingMatch =
						fullMatch.match(/<think>([\s\S]*?)<\/think>/i) ||
						fullMatch.match(/<thinking>([\s\S]*?)<\/thinking>/i) ||
						fullMatch.match(/\*\*thinking\*\*([\s\S]*?)\*\*/i) ||
						fullMatch.match(/thinking:\s*([\s\S]*?)(?:answer|response|output):/i) ||
						fullMatch.match(/\[thinking\]([\s\S]*?)\[\/thinking\]/i);

					if (thinkingMatch) {
						thinking = thinkingMatch[1].trim();
						output = msg.replace(fullMatch, '').trim();

						// Clean up output
						output = output.replace(/^(answer|response|output):\s*/i, '').trim();
					}
				}

				if (thinking && output) {
					return {
						thinkingSection: thinking,
						outputSection: output,
						hasThinking: true
					};
				}
			}
		}

		// Check for simple patterns without clear end markers
		const simplePatterns = [
			/^thinking:\s*([\s\S]*)/im,
			/^thought process:\s*([\s\S]*)/im,
			/\*\*thinking\*\*\s*([\s\S]*)/im,
			/<think>\s*([\s\S]*)/im,
			/<thinking>\s*([\s\S]*)/im
		];

		for (const pattern of simplePatterns) {
			const match = msg.match(pattern);
			if (match) {
				// Try to find where thinking ends and answer begins
				const fullText = match[1];
				const answerMarkers = [
					/\n\n(answer|response|output|conclusion):\s*/i,
					/\n\n\*\*(answer|response|output)\*\*/i,
					/\n\n#+\s*(answer|response|output)/i
				];

				for (const answerPattern of answerMarkers) {
					const answerMatch = fullText.match(answerPattern);
					if (answerMatch && typeof answerMatch.index === 'number') {
						const thinking = fullText.substring(0, answerMatch.index).trim();
						const output = fullText.substring(answerMatch.index + answerMatch[0].length).trim();

						if (thinking && output) {
							return {
								thinkingSection: thinking,
								outputSection: output,
								hasThinking: true
							};
						}
					}
				}
			}
		}

		return { thinkingSection: '', outputSection: msg, hasThinking: false };
	}

	/**
	 * Typewriter animation for AI messages
	 */
	async function typewriterAnimation() {
		if (!animate || isUser) {
			displayedMessage = message;
			return;
		}

		// history messages (reload page), tampilkan langsung tanpa animasi
		isAnimating = true;
		displayedMessage = '';

		const step = 4;
		for (let i = 0; i <= message.length; i += step) {
			displayedMessage = message.slice(0, i);
			await new Promise((resolve) => setTimeout(resolve, 0));
		}
		displayedMessage = message;
		isAnimating = false;
	}

	onMount(() => {
		typewriterAnimation();
	});

	// Watch for message changes and setup copy buttons after animation completes
	$: if (messageContainer && processedMessage && !isUser && !isAnimating) {
		setTimeout(() => {
			setupCodeBlockCopyButtons();
		}, 50);
	}

	// Also setup when animation completes
	$: if (!isAnimating && messageContainer && !isUser) {
		setTimeout(() => {
			setupCodeBlockCopyButtons();
		}, 50);
	}

	function setupCodeBlockCopyButtons() {
		if (!messageContainer) return;

		// Find all code blocks and add copy buttons
		const codeBlocks = messageContainer.querySelectorAll('pre code');
		codeBlocks.forEach((codeElement, index) => {
			const preElement = codeElement.parentElement;
			if (!preElement) return;

			// Check if this is part of our custom code block structure
			const container = preElement.closest('.code-block-container');
			if (container) {
				// Already has our structure, just setup the button
				const button = container.querySelector('.copy-code-btn') as HTMLButtonElement;
				if (button && !button.dataset.listenerAdded) {
					setupButtonListener(button, codeElement.textContent || '');
				}
			} else {
				// This is a plain code block, add our structure
				const codeText = codeElement.textContent || '';
				const language = codeElement.className.replace('language-', '') || 'code';

				// Create wrapper structure
				const wrapper = document.createElement('div');
				wrapper.className = 'code-content-wrapper';
				wrapper.style.cssText = 'overflow-x: auto; overflow-y: hidden; -webkit-overflow-scrolling: touch; width: 100%; position: relative; background: rgb(15 23 42);';

				const container = document.createElement('div');
				container.className = 'code-block-container';
				container.style.cssText = 'position: relative; margin: 16px 0; max-width: 100%; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.15); background: rgb(15 23 42);';

				const header = document.createElement('div');
				header.className =
					'code-header bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-600';
				header.style.cssText =
					'padding: 8px 12px; border-radius: 8px 8px 0 0; border-bottom: none; display: flex; justify-content: space-between; align-items: center; position: relative;';

				const langSpan = document.createElement('span');
				langSpan.className = 'text-gray-500 dark:text-gray-400';
				langSpan.style.cssText = 'font-size: 12px; font-family: monospace; font-weight: 500;';
				langSpan.textContent = language;

				const button = document.createElement('button');
				button.className =
					'copy-code-btn bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600';
				button.style.cssText =
					'padding: 6px; border-radius: 4px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center;';
				button.title = 'Copy code';
				button.innerHTML = `
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M7.5 3H14.6C16.8402 3 17.9603 3 18.816 3.43597C19.5686 3.81947 20.1805 4.43139 20.564 5.18404C21 6.03969 21 7.15979 21 9.4V16.5M6.2 21H14.3C15.4201 21 15.9802 21 16.408 20.782C16.7843 20.5903 17.0903 20.2843 17.282 19.908C17.5 19.4802 17.5 18.9201 17.5 17.8V9.7C17.5 8.57989 17.5 8.01984 17.282 7.59202C17.0903 7.21569 16.7843 6.90973 16.408 6.71799C15.9802 6.5 15.4201 6.5 14.3 6.5H6.2C5.0799 6.5 4.51984 6.5 4.09202 6.71799C3.71569 6.90973 3.40973 7.21569 3.21799 7.59202C3 8.01984 3 8.57989 3 9.7V17.8C3 18.9201 3 19.4802 3.21799 19.908C3.40973 20.2843 3.71569 20.5903 4.09202 20.782C4.51984 21 5.0799 21 6.2 21Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				`;

				header.appendChild(langSpan);
				header.appendChild(button);

				// Update pre element styles
				preElement.className = '';
				preElement.style.cssText =
					'margin: 0; border-radius: 0 0 12px 12px; padding: 0; background: transparent; border: none; min-width: 100%; width: max-content; display: block;';
				
				// Update code element styles
				(codeElement as HTMLElement).style.cssText =
					'display: block; min-width: 100%; padding: 16px; font-family: "SF Mono", "Monaco", "Consolas", "Fira Code", monospace; font-size: 13px; line-height: 1.6; white-space: pre; color: rgb(229 231 235); background: transparent;';

				// Wrap the pre element
				preElement.parentNode?.insertBefore(container, preElement);
				wrapper.appendChild(preElement);
				container.appendChild(header);
				container.appendChild(wrapper);

				// Setup button listener
				setupButtonListener(button, codeText);
			}
		});
	}

	function setupButtonListener(button: HTMLButtonElement, codeText: string) {
		if (button.dataset.listenerAdded) return;
		button.dataset.listenerAdded = 'true';

		// Add click event listener
		button.addEventListener('click', async (e) => {
			e.preventDefault();
			e.stopPropagation();

			try {
				await navigator.clipboard.writeText(codeText);

				// Show success state with checkmark
				button.innerHTML = `
			       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				       <circle cx="12" cy="12" r="10" fill="#10b981"/>
				       <path d="M8 12.5l2.5 2.5 5-5" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
			       </svg>
		       `;
				button.title = 'Copied!';
				button.style.background = '#10b981';
				button.style.borderColor = '#10b981';

				// Reset after 2 seconds
				setTimeout(() => {
					button.innerHTML = `
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M7.5 3H14.6C16.8402 3 17.9603 3 18.816 3.43597C19.5686 3.81947 20.1805 4.43139 20.564 5.18404C21 6.03969 21 7.15979 21 9.4V16.5M6.2 21H14.3C15.4201 21 15.9802 21 16.408 20.782C16.7843 20.5903 17.0903 20.2843 17.282 19.908C17.5 19.4802 17.5 18.9201 17.5 17.8V9.7C17.5 8.57989 17.5 8.01984 17.282 7.59202C17.0903 7.21569 16.7843 6.90973 16.408 6.71799C15.9802 6.5 15.4201 6.5 14.3 6.5H6.2C5.0799 6.5 4.51984 6.5 4.09202 6.71799C3.71569 6.90973 3.40973 7.21569 3.21799 7.59202C3 8.01984 3 8.57989 3 9.7V17.8C3 18.9201 3 19.4802 3.21799 19.908C3.40973 20.2843 3.71569 20.5903 4.09202 20.782C4.51984 21 5.0799 21 6.2 21Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					`;
					button.title = 'Copy code';
					button.style.background = '';
					button.style.borderColor = '';
					button.className =
						'copy-code-btn bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600';
				}, 2000);
			} catch (err) {
				// Show error state
				button.innerHTML = `
					<svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20" style="color: #ef4444;">
						<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
					</svg>
				`;
				button.style.background = '#ef4444';
				setTimeout(() => {
					button.innerHTML = `
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M7.5 3H14.6C16.8402 3 17.9603 3 18.816 3.43597C19.5686 3.81947 20.1805 4.43139 20.564 5.18404C21 6.03969 21 7.15979 21 9.4V16.5M6.2 21H14.3C15.4201 21 15.9802 21 16.408 20.782C16.7843 20.5903 17.0903 20.2843 17.282 19.908C17.5 19.4802 17.5 18.9201 17.5 17.8V9.7C17.5 8.57989 17.5 8.01984 17.282 7.59202C17.0903 7.21569 16.7843 6.90973 16.408 6.71799C15.9802 6.5 15.4201 6.5 14.3 6.5H6.2C5.0799 6.5 4.51984 6.5 4.09202 6.71799C3.71569 6.90973 3.40973 7.21569 3.21799 7.59202C3 8.01984 3 8.57989 3 9.7V17.8C3 18.9201 3 19.4802 3.21799 19.908C3.40973 20.2843 3.71569 20.5903 4.09202 20.782C4.51984 21 5.0799 21 6.2 21Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					`;
					button.title = 'Copy code';
					button.style.background = '';
					button.style.borderColor = '';
					button.className =
						'copy-code-btn bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600';
				}, 2000);
			}
		});
	}

	$: if (message && animate && !isUser) {
		typewriterAnimation();
	}

	$: if (message && (!animate || isUser)) {
		displayedMessage = message;
	}

	// Format timestamp
	$: formattedTime = timestamp.toLocaleTimeString([], {
		hour: '2-digit',
		minute: '2-digit'
	});

	// Process message for markdown
	$: processedMessage = (() => {
		try {
			// Extract the source text based on thinking blocks
			const sourceText = hasThinking && outputSection ? outputSection : displayedMessage;

			// Remove any unwanted comments or artifacts
			const cleanMessage = sourceText
				.replace(/<!--[\s\S]*?-->/g, '') // Remove HTML comments
				.replace(/\/\*[\s\S]*?\*\//g, '') // Remove CSS comments
				.trim();

			// Use the safe markdown renderer with normalization
			return renderMarkdownSafe(cleanMessage);
		} catch (error) {
			console.warn('Error processing message:', error);
			return displayedMessage;
		}
	})();

	/**
	 * Copy message to clipboard
	 */
	async function copyToClipboard(text: string) {
		try {
			await navigator.clipboard.writeText(text);
			copySuccess = true;
			setTimeout(() => {
				copySuccess = false;
			}, 2000);
		} catch (err) {
			copySuccess = false;
		}
	}

	/**
	 * Copy code block to clipboard
	 */
	function copyCodeBlock(event: Event) {
		event.stopPropagation();
		const target = event.target as HTMLElement;
		const codeBlock = target.closest('pre')?.querySelector('code');
		if (codeBlock) {
			copyToClipboard(codeBlock.textContent || '');
		}
	}
</script>

<div
	class="flex {isUser
		? 'justify-end'
		: 'justify-start'} animate-in slide-in-from-bottom-2 mb-4 duration-300"
	bind:this={messageContainer}
>
	<div class="w-full {isUser ? 'ml-auto max-w-full sm:max-w-lg' : ''} group relative">
		<!-- User message bubble -->
		{#if isUser}
			<div
				class="relative flex flex-col items-end justify-end gap-2"
				on:mouseenter={() => (showCopyButton = true)}
				on:mouseleave={() => (showCopyButton = false)}
				role="group"
			>
				<!-- File attachments display - shown above bubble -->
				{#if fileAttachments && fileAttachments.length > 0}
					<div class="flex max-w-lg flex-wrap justify-end gap-2">
						{#each fileAttachments as fileName}
							<div
								class="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm dark:bg-gray-700"
							>
								<svg
									class="h-4 w-4 text-blue-500"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
									/>
								</svg>
								<span class="max-w-32 truncate text-gray-700 dark:text-gray-300">{fileName}</span>
							</div>
						{/each}
					</div>
				{/if}

				<div
					class="w-fit max-w-full sm:max-w-lg rounded-2xl rounded-br-sm bg-blue-500 px-4 py-2.5 shadow-sm"
					role="button"
					tabindex="0"
				>
					<p class="overflow-wrap-anywhere text-sm leading-relaxed break-words text-white">
						{displayedMessage}
					</p>
				</div>
				<div class="absolute right-2 -bottom-7" style="z-index:2;">
					<button
						class="text-gray-500 opacity-0 transition-all duration-200 group-hover:opacity-100 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
						style="background: none; border: none; padding: 0;"
						on:click={() => copyToClipboard(displayedMessage)}
						title="Copy message"
					>
						{#if copySuccess}
							<svg class="h-4 w-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
								<path
									fill-rule="evenodd"
									d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
									clip-rule="evenodd"
								/>
							</svg>
						{:else}
							<svg
								class="h-4 w-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M7.5 3H14.6C16.8402 3 17.9603 3 18.816 3.43597C19.5686 3.81947 20.1805 4.43139 20.564 5.18404C21 6.03969 21 7.15979 21 9.4V16.5M6.2 21H14.3C15.4201 21 15.9802 21 16.408 20.782C16.7843 20.5903 17.0903 20.2843 17.282 19.908C17.5 19.4802 17.5 18.9201 17.5 17.8V9.7C17.5 8.57989 17.5 8.01984 17.282 7.59202C17.0903 7.21569 16.7843 6.90973 16.408 6.71799C15.9802 6.5 15.4201 6.5 14.3 6.5H6.2C5.0799 6.5 4.51984 6.5 4.09202 6.71799C3.71569 6.90973 3.40973 7.21569 3.21799 7.59202C3 8.01984 3 8.57989 3 9.7V17.8C3 18.9201 3 19.4802 3.21799 19.908C3.40973 20.2843 3.71569 20.5903 4.09202 20.782C4.51984 21 5.0799 21 6.2 21Z"
									stroke-width="1.5"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
							</svg>
						{/if}
					</button>
				</div>
			</div>
		{:else}
			<!-- AI message - badge Z di samping message -->
			<div
				class="flex w-full items-start gap-3 py-2"
				on:mouseenter={() => (showCopyButton = true)}
				on:mouseleave={() => (showCopyButton = false)}
				role="group"
			>
				<div
					class="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 shadow-sm"
				>
					<!-- Zenergy logo SVG -->
					<div class="zen-logo flex h-4 w-4 items-center justify-center">
						{@html ZenLogo}
					</div>
				</div>
				<div
					class="relative flex min-w-0 flex-1 flex-col"
					on:mouseenter={() => (showCopyButton = true)}
					on:mouseleave={() => (showCopyButton = false)}
					role="group"
				>
					<!-- Show thinking process accordion for any model with thinking content -->
					{#if hasThinking && thinkingSection && !isUser}
						<div class="mb-3">
							<button
								class="flex w-full items-center justify-between rounded-lg bg-gray-100/80 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200/80 dark:bg-gray-800/80 dark:text-gray-300 dark:hover:bg-gray-700/80"
								on:click={() => (showThinkingProcess = !showThinkingProcess)}
								type="button"
							>
								<span class="flex items-center gap-2">
									<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
										/>
									</svg>
									Thinking Process
								</span>
								<svg
									class="h-4 w-4 transform transition-transform {showThinkingProcess
										? 'rotate-180'
										: ''}"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M19 9l-7 7-7-7"
									/>
								</svg>
							</button>

							{#if showThinkingProcess}
								<div
									class="mt-2 rounded-lg bg-gray-50/50 px-4 py-3 text-sm text-gray-600 dark:bg-gray-900/50 dark:text-gray-400"
								>
									<div class="prose prose-sm max-w-none">
										{@html renderMarkdownSafe(thinkingSection)}
									</div>
								</div>
							{/if}
						</div>
					{/if}

					<div
						class="prose prose-sm overflow-wrap-anywhere max-w-none break-words text-gray-800 dark:text-gray-200"
					>
						{@html typeof processedMessage === 'string' ? processedMessage : ''}
					</div>
					{#if isAnimating}
						<span
							class="ml-2 inline-block animate-pulse rounded-full bg-blue-500 shadow-sm"
							style="width: 10px; height: 10px; display: inline-block; vertical-align: middle;"
						></span>
					{/if}
					<div
						class="absolute -bottom-7 left-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
						style="z-index:2;"
					>
						<button
							class="text-gray-500 transition-all duration-200 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
							style="background: none; border: none; padding: 0;"
							on:click={() => copyToClipboard(message)}
							title="Copy message"
						>
							{#if copySuccess}
								<svg class="h-4 w-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
									<path
										fill-rule="evenodd"
										d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
										clip-rule="evenodd"
									/>
								</svg>
							{:else}
								<svg
									class="h-4 w-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M7.5 3H14.6C16.8402 3 17.9603 3 18.816 3.43597C19.5686 3.81947 20.1805 4.43139 20.564 5.18404C21 6.03969 21 7.15979 21 9.4V16.5M6.2 21H14.3C15.4201 21 15.9802 21 16.408 20.782C16.7843 20.5903 17.0903 20.2843 17.282 19.908C17.5 19.4802 17.5 18.9201 17.5 17.8V9.7C17.5 8.57989 17.5 8.01984 17.282 7.59202C17.0903 7.21569 16.7843 6.90973 16.408 6.71799C15.9802 6.5 15.4201 6.5 14.3 6.5H6.2C5.0799 6.5 4.51984 6.5 4.09202 6.71799C3.71569 6.90973 3.40973 7.21569 3.21799 7.59202C3 8.01984 3 8.57989 3 9.7V17.8C3 18.9201 3 19.4802 3.21799 19.908C3.40973 20.2843 3.71569 20.5903 4.09202 20.782C4.51984 21 5.0799 21 6.2 21Z"
										stroke-width="1.5"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
								</svg>
							{/if}
						</button>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	/* Responsive table styles */
	:global(.responsive-table-wrapper) {
		width: 100% !important;
		max-width: 100% !important;
		overflow-x: auto !important;
		-webkit-overflow-scrolling: touch !important;
		position: relative !important;
	}

	:global(.responsive-table) {
		min-width: 280px !important;
		max-width: 100% !important;
		table-layout: auto !important;
	}

	/* Mobile optimizations */
	@media (max-width: 640px) {
		:global(.responsive-table) {
			min-width: 280px !important;
			font-size: 10px !important;
		}

		:global(.responsive-table th),
		:global(.responsive-table td) {
			padding: 4px 6px !important;
			font-size: 10px !important;
			min-width: 60px !important;
			max-width: 100px !important;
		}

		:global(.code-block-container) {
			margin: 8px 0 !important;
			border-radius: 6px !important;
		}

		:global(.code-content) {
			font-size: 11px !important;
			padding: 8px 10px !important;
			line-height: 1.3 !important;
		}

		:global(.code-header) {
			padding: 4px 8px !important;
		}

		:global(.copy-code-btn) {
			padding: 3px 4px !important;
		}

		:global(.copy-code-btn svg) {
			width: 12px !important;
			height: 12px !important;
		}
	}

	/* Small mobile devices */
	@media (max-width: 480px) {
		:global(.responsive-table) {
			min-width: 260px !important;
		}

		:global(.responsive-table th),
		:global(.responsive-table td) {
			padding: 3px 5px !important;
			font-size: 9px !important;
			min-width: 50px !important;
			max-width: 80px !important;
		}

		:global(.code-content) {
			font-size: 10px !important;
			padding: 6px 8px !important;
		}
	}

	/* Enhanced scrolling for touch devices */
	:global(.table-wrapper::-webkit-scrollbar) {
		height: 6px;
	}

	:global(.table-wrapper::-webkit-scrollbar-track) {
		background: rgba(0, 0, 0, 0.1);
		border-radius: 3px;
	}

	:global(.table-wrapper::-webkit-scrollbar-thumb) {
		background: rgba(59, 130, 246, 0.5);
		border-radius: 3px;
	}

	:global(.table-wrapper::-webkit-scrollbar-thumb:hover) {
		background: rgba(59, 130, 246, 0.7);
	}

	:global(.code-content-wrapper::-webkit-scrollbar) {
		height: 6px;
	}

	:global(.code-content-wrapper::-webkit-scrollbar-track) {
		background: rgba(255, 255, 255, 0.1);
		border-radius: 3px;
	}

	:global(.code-content-wrapper::-webkit-scrollbar-thumb) {
		background: rgba(255, 255, 255, 0.3);
		border-radius: 3px;
	}

	:global(.code-content-wrapper::-webkit-scrollbar-thumb:hover) {
		background: rgba(255, 255, 255, 0.5);
	}

	/* Small mobile devices */
	@media (max-width: 480px) {
		:global(.responsive-table) {
			min-width: 260px !important;
		}

		:global(.responsive-table th),
		:global(.responsive-table td) {
			padding: 3px 5px !important;
			font-size: 9px !important;
			min-width: 50px !important;
			max-width: 80px !important;
		}

		:global(.code-content) {
			font-size: 10px !important;
			padding: 6px 8px !important;
		}
	}

	/* Enhanced scrolling for touch devices */
	:global(.table-wrapper::-webkit-scrollbar) {
		height: 6px;
	}

	:global(.table-wrapper::-webkit-scrollbar-track) {
		background: rgba(0, 0, 0, 0.1);
		border-radius: 3px;
	}

	:global(.table-wrapper::-webkit-scrollbar-thumb) {
		background: rgba(59, 130, 246, 0.5);
		border-radius: 3px;
	}

	:global(.table-wrapper::-webkit-scrollbar-thumb:hover) {
		background: rgba(59, 130, 246, 0.7);
	}

	:global(.code-content-wrapper::-webkit-scrollbar) {
		height: 6px;
	}

	:global(.code-content-wrapper::-webkit-scrollbar-track) {
		background: rgba(255, 255, 255, 0.1);
		border-radius: 3px;
	}

	:global(.code-content-wrapper::-webkit-scrollbar-thumb) {
		background: rgba(255, 255, 255, 0.3);
		border-radius: 3px;
	}

	:global(.code-content-wrapper::-webkit-scrollbar-thumb:hover) {
		background: rgba(255, 255, 255, 0.5);
	}

	/* Inline code responsiveness */
	:global(.inline-code) {
		background: rgba(59, 130, 246, 0.1);
		color: rgb(59, 130, 246);
		padding: 2px 4px;
		border-radius: 4px;
		font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
		font-size: 0.9em;
		word-break: break-word;
	}

	/* Custom prose styles for better markdown rendering */
	:global(.prose p) {
		margin: 0.75rem 0 1rem 0;
		word-wrap: break-word;
		line-height: 1.7;
		overflow-wrap: break-word;
		hyphens: auto;
	}

	:global(.prose strong) {
		font-weight: 600;
		color: rgb(17 24 39);
	}
	:global(.dark .prose strong) {
		color: rgb(243 244 246);
	}

	:global(.prose a) {
		color: rgb(59 130 246);
		text-decoration: none;
		font-weight: 500;
		border-bottom: 1px dashed rgb(147 197 253);
		transition: all 0.2s ease;
	}
	:global(.prose a:hover) {
		color: rgb(37 99 235);
		border-bottom-style: solid;
		border-bottom-color: rgb(59 130 246);
	}
	:global(.dark .prose a) {
		color: rgb(96 165 250);
		border-bottom-color: rgb(30 58 138);
	}
	:global(.dark .prose a:hover) {
		color: rgb(147 197 253);
		border-bottom-color: rgb(96 165 250);
	}

	:global(.prose h1) {
		font-size: 1.75rem; margin: 1.5rem 0 1rem 0; font-weight: 700; color: rgb(17 24 39);
		letter-spacing: -0.025em; border-bottom: 1px solid rgb(229 231 235); padding-bottom: 0.5rem;
	}
	:global(.prose h2) {
		font-size: 1.5rem; margin: 2rem 0 1rem 0; font-weight: 600; color: rgb(31 41 55);
		letter-spacing: -0.025em; border-bottom: 1px inset rgb(229 231 235); padding-bottom: 0.3rem;
	}
	:global(.prose h3) { font-size: 1.25rem; margin: 1.5rem 0 0.75rem 0; font-weight: 600; color: rgb(55 65 81); }
	:global(.prose h4) { font-size: 1.125rem; margin: 1.25rem 0 0.5rem 0; font-weight: 600; color: rgb(75 85 99); }
	:global(.prose h5), :global(.prose h6) { font-size: 1rem; margin: 1rem 0 0.5rem 0; font-weight: 600; }

	:global(.dark .prose h1), :global(.dark .prose h2) {
		color: rgb(243 244 246); border-bottom-color: rgb(55 65 81);
	}
	:global(.dark .prose h3) { color: rgb(229 231 235); }
	:global(.dark .prose h4) { color: rgb(209 213 219); }

	/* Responsive text handling */
	:global(.prose) {
		max-width: 100%;
		word-wrap: break-word;
		overflow-wrap: break-word;
		hyphens: auto;
	}

	/* Mobile responsive prose */
	@media (max-width: 768px) {
		:global(.prose) {
			font-size: 14px;
		}

		:global(.prose p) {
			margin: 0.5rem 0;
		}

		:global(.prose h1) {
			font-size: 1.5rem;
		}

		:global(.prose h2) {
			font-size: 1.3rem;
		}

		:global(.prose h3) {
			font-size: 1.2rem;
		}

		:global(.prose h4),
		:global(.prose h5),
		:global(.prose h6) {
			font-size: 1.1rem;
		}
	}

	@media (max-width: 480px) {
		:global(.prose) {
			font-size: 13px;
		}

		:global(.prose h1) {
			font-size: 1.4rem;
		}

		:global(.prose h2) {
			font-size: 1.25rem;
		}

		:global(.prose h3) {
			font-size: 1.15rem;
		}

		:global(.prose h4),
		:global(.prose h5),
		:global(.prose h6) {
			font-size: 1.05rem;
		}
	}

	/* Inline code styling */
	:global(.prose .inline-code) {
		background-color: rgb(249 250 251);
		padding: 0.375rem 0.625rem;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		font-family: 'SF Mono', 'Monaco', 'Consolas', 'Fira Code', monospace;
		border: 1px solid rgb(229 231 235);
		color: rgb(239 68 68);
		font-weight: 500;
		margin: 0 0.25rem;
		display: inline-block;
		line-height: 1.4;
		word-break: break-all;
		max-width: 100%;
		overflow-wrap: break-word;
	}

	/* Responsive inline code */
	@media (max-width: 768px) {
		:global(.prose .inline-code) {
			font-size: 0.75rem;
			padding: 0.25rem 0.5rem;
		}
	}

	@media (max-width: 480px) {
		:global(.prose .inline-code) {
			font-size: 0.7rem;
			padding: 0.2rem 0.4rem;
		}
	}

	:global(.dark .prose .inline-code) {
		background-color: rgb(31 41 55);
		border-color: rgb(75 85 99);
		color: rgb(248 113 113);
	}

	/* Code block container styling */
	:global(.code-block-container) {
		border-radius: 12px;
		overflow: hidden;
		box-shadow:
			0 4px 6px -1px rgb(0 0 0 / 0.1),
			0 2px 4px -2px rgb(0 0 0 / 0.1);
		max-width: 100%;
		overflow-x: auto;
	}

	/* Responsive code blocks */
	@media (max-width: 768px) {
		:global(.code-block-container) {
			margin: 12px -8px;
			border-radius: 8px;
		}

		:global(.code-header) {
			padding: 6px 10px !important;
			font-size: 11px !important;
		}

		:global(.code-content code), :global(pre code.hljs) {
			padding: 12px !important;
			font-size: 12px !important;
			line-height: 1.4 !important;
		}

		:global(.code-content-wrapper) {
			max-width: calc(100vw - 40px);
		}

		:global(.copy-code-btn) {
			padding: 4px 6px !important;
		}

		:global(.copy-code-btn svg) {
			width: 14px !important;
			height: 14px !important;
		}
	}

	@media (max-width: 480px) {
		:global(.code-block-container) {
			margin: 10px -12px;
		}

		:global(.code-header) {
			padding: 4px 8px !important;
			font-size: 10px !important;
		}

		:global(.code-content code), :global(pre code.hljs) {
			padding: 10px !important;
			font-size: 11px !important;
			line-height: 1.3 !important;
		}

		:global(.code-content-wrapper) {
			max-width: calc(100vw - 30px);
		}

		:global(.copy-code-btn) {
			padding: 3px 5px !important;
		}

		:global(.copy-code-btn svg) {
			width: 12px !important;
			height: 12px !important;
		}
	}

	/* Syntax highlighting for different languages - Premium Dark Theme */
	:global(.hljs) {
		background: rgb(15 23 42) !important;
		color: #abb2bf !important;
	}

	:global(.hljs-keyword),
	:global(.hljs-operator),
	:global(.hljs-selector-tag),
	:global(.hljs-built_in),
	:global(.hljs-literal) {
		color: #c678dd !important; /* Bright Purple */
		font-weight: 500;
	}

	:global(.hljs-string),
	:global(.hljs-value),
	:global(.hljs-addition) {
		color: #9ece6a !important; /* Soft Lime Green */
	}

	:global(.hljs-number) {
		color: #ff9e64 !important; /* Peach Orange */
	}

	:global(.hljs-comment),
	:global(.hljs-quote) {
		color: #64748b !important; /* Slate 500 */
		font-style: italic;
	}

	:global(.hljs-function),
	:global(.hljs-title),
	:global(.hljs-name) {
		color: #61afef !important; /* Sky Blue */
		font-weight: 500;
	}

	:global(.hljs-variable),
	:global(.hljs-params),
	:global(.hljs-template-variable) {
		color: #e5c07b !important; /* Warm Yellow */
	}

	:global(.hljs-type),
	:global(.hljs-class),
	:global(.hljs-title.class_) {
		color: #56b6c2 !important; /* Cyan */
		font-weight: 500;
	}

	:global(.hljs-attr),
	:global(.hljs-property),
	:global(.hljs-tag) {
		color: #e06c75 !important; /* Software Red/Coral */
	}
	
	:global(.hljs-doctag),
	:global(.hljs-meta) {
		color: #7aa2f7 !important; /* Meta tags like imports */
	}

	/* Table styling */
	:global(.table-wrapper) {
		border-radius: 12px;
		overflow: hidden;
		margin: 16px 0;
		border: 1px solid rgb(229 231 235);
		box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
		overflow-x: auto;
		-webkit-overflow-scrolling: touch;
		max-width: 100%;
	}

	/* Responsive table wrapper */
	:global(.responsive-table-wrapper) {
		overflow-x: auto;
		-webkit-overflow-scrolling: touch;
		max-width: 100%;
	}

	/* Mobile responsive table */
	@media (max-width: 768px) {
		:global(.responsive-table-wrapper) {
			margin: 12px -8px;
			border-radius: 8px;
			max-width: calc(100vw - 40px);
		}

		:global(.responsive-table) {
			font-size: 11px !important;
			min-width: 450px;
		}

		:global(.responsive-table th) {
			padding: 8px 10px !important;
			font-size: 10px !important;
			white-space: nowrap;
			min-width: 80px !important;
		}

		:global(.responsive-table td) {
			padding: 6px 8px !important;
			font-size: 10px !important;
			word-wrap: break-word;
			max-width: 120px !important;
			line-height: 1.3;
		}
	}

	@media (max-width: 480px) {
		:global(.responsive-table-wrapper) {
			margin: 10px -12px;
			max-width: calc(100vw - 30px);
		}

		:global(.responsive-table) {
			min-width: 350px;
			font-size: 10px !important;
		}

		:global(.responsive-table th) {
			padding: 6px 8px !important;
			font-size: 9px !important;
			min-width: 70px !important;
		}

		:global(.responsive-table td) {
			padding: 4px 6px !important;
			font-size: 9px !important;
			max-width: 100px !important;
			line-height: 1.2;
		}
	}

	:global(.dark .table-wrapper) {
		border-color: rgb(75 85 99);
	}

	:global(.markdown-table) {
		width: 100%;
		border-collapse: collapse;
		background: rgb(248 250 252) !important;
		font-size: 13px;
		table-layout: auto;
		min-width: 500px;
	}

	:global(.dark .markdown-table) {
		background: rgb(30 41 59) !important;
	}

	:global(.markdown-table thead) {
		background: rgb(59 130 246) !important;
	}

	:global(.dark .markdown-table thead) {
		background: rgb(59 130 246) !important;
	}

	:global(.markdown-table tr) {
		border-bottom: 1px solid rgb(203 213 225);
		background: rgb(248 250 252) !important;
		transition: background-color 0.2s;
	}

	:global(.dark .markdown-table tr) {
		border-bottom-color: rgb(75 85 99);
		background: rgb(30 41 59) !important;
	}

	:global(.markdown-table th) {
		padding: 10px 12px;
		text-align: left;
		font-weight: 600;
		font-size: 13px;
		color: rgb(255 255 255) !important;
		background: rgb(59 130 246) !important;
		white-space: nowrap;
		min-width: 100px;
		vertical-align: top;
	}

	:global(.dark .markdown-table th) {
		color: rgb(255 255 255) !important;
		background: rgb(59 130 246) !important;
	}

	:global(.markdown-table td) {
		padding: 8px 10px;
		font-size: 12px;
		color: rgb(31 41 55) !important;
		background: rgb(248 250 252) !important;
		word-wrap: break-word;
		max-width: 180px;
		vertical-align: top;
		line-height: 1.4;
	}

	:global(.dark .markdown-table td) {
		color: rgb(229 231 235) !important;
		background: rgb(30 41 59) !important;
	}

	:global(.markdown-table tr:hover) {
		background: rgb(243 244 246) !important;
	}

	:global(.dark .markdown-table tr:hover) {
		background: rgb(45 55 72) !important;
	}

	:global(.markdown-table tr:hover td) {
		background: rgb(243 244 246) !important;
	}

	:global(.dark .markdown-table tr:hover td) {
		background: rgb(45 55 72) !important;
	}

	:global(.prose pre) {
		background-color: transparent !important;
		border: none !important;
		border-radius: 0 !important;
		padding: 0 !important;
		overflow-x: auto;
		max-width: 100%;
		margin: 0 !important;
	}

	:global(.prose pre code) {
		background: transparent !important;
		padding: 0 !important;
		font-size: 14px !important;
		line-height: 1.6 !important;
		white-space: pre !important;
		word-break: normal !important;
		border: none !important;
		color: inherit !important;
		font-family: 'SF Mono', 'Monaco', 'Consolas', 'Fira Code', monospace !important;
		letter-spacing: 0.025em !important;
		overflow-x: auto;
		max-width: 100%;
	}

	/* Responsive pre and code */
	@media (max-width: 768px) {
		:global(.prose pre code) {
			font-size: 12px !important;
			line-height: 1.4 !important;
		}
	}

	@media (max-width: 480px) {
		:global(.prose pre code) {
			font-size: 11px !important;
			line-height: 1.3 !important;
		}
	}

	:global(.prose ul) {
		list-style-type: none;
		padding-left: 0;
		margin: 1rem 0;
		word-wrap: break-word;
		overflow-wrap: break-word;
	}
	:global(.prose ul li) {
		position: relative;
		padding-left: 1.25rem;
		margin-bottom: 0.5rem;
		line-height: 1.6;
	}
	:global(.prose ul li::before) {
		content: '•';
		position: absolute;
		left: 0.25rem;
		color: rgb(59 130 246); /* text-blue-500 */
		font-weight: bold;
		font-size: 1.1em;
	}
	
	:global(.prose ol) {
		padding-left: 1.25rem;
		margin: 1rem 0;
		word-wrap: break-word;
		overflow-wrap: break-word;
	}
	:global(.prose ol li) {
		margin-bottom: 0.5rem;
		padding-left: 0.25rem;
		line-height: 1.6;
	}
	:global(.prose ol li::marker) {
		color: rgb(59 130 246); /* text-blue-500 */
		font-weight: 600;
	}

	:global(.dark .prose ul li::before),
	:global(.dark .prose ol li::marker) {
		color: rgb(96 165 250); /* text-blue-400 */
	}

	:global(.prose blockquote) {
		border-left: 4px solid rgb(59 130 246);
		padding: 0.75rem 1rem;
		margin: 1.25rem 0;
		background: linear-gradient(to right, rgb(239 246 255), transparent);
		border-radius: 0 0.5rem 0.5rem 0;
		word-wrap: break-word;
		color: rgb(75 85 99);
		font-style: italic;
	}

	:global(.dark .prose blockquote) {
		border-left-color: rgb(96 165 250);
		background: linear-gradient(to right, rgba(30, 58, 138, 0.4), transparent);
		color: rgb(156 163 175);
	}

	/* Mobile responsive blockquote */
	@media (max-width: 768px) {
		:global(.prose blockquote) {
			padding: 0.5rem 0.75rem;
			margin: 1rem 0;
			font-size: 14px;
		}
	}

	/* Zen logo styling */
	.zen-logo :global(svg) {
		fill: white !important;
		width: 100% !important;
		height: 100% !important;
	}

	/* Copy button animations */
	:global(.copy-code-btn:hover) {
		transform: translateY(-1px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	}

	:global(.copy-code-btn:active) {
		transform: translateY(0);
	}
</style>
