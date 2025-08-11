<script lang="ts">
	import { onMount, tick } from 'svelte';
	import ChatMessage from './ChatMessage.svelte';
	import ChatInput from './ChatInput.svelte';
	import LoadingIndicator from './LoadingIndicator.svelte';
	import WelcomeScreen from './WelcomeScreen.svelte';
	import ZenLogo from '$lib/assets/zen.svg?raw';
	import { selectedModel } from '$lib/stores/model';

	interface Message {
		id: string;
		content: string;
		role: 'user' | 'assistant';
		createdAt: string;
		animate?: boolean;
		fileAttachments?: string[];
		model?: string;
	}

	let { messages = [], chatId = null } = $props();
	let isLoading = $state(false);
	let chatContainer: HTMLDivElement;
	let error: string | null = $state(null);
	let abortController: AbortController | null = null;
	let uploadedFiles: File[] = $state([]);
	let localMessages: Message[] = $state([]);
	let isNewSession = $state(true); // Flag untuk menandai session baru

	$effect(() => {
		localMessages = [...messages];
		// Jika ada messages dari props (history), tandai sebagai bukan session baru
		if (messages.length > 0) {
			isNewSession = false;
		}
	});

	function generateId(): string {
		return Date.now().toString(36) + Math.random().toString(36).substr(2);
	}

	function removeFile(index: number) {
		uploadedFiles = uploadedFiles.filter((_, i) => i !== index);
	}

	async function scrollToBottom() {
		await tick();
		if (chatContainer) {
			chatContainer.scrollTo({
				top: chatContainer.scrollHeight,
				behavior: 'smooth'
			});
		}
	}

	$effect(() => {
		if (localMessages.length > 0) {
			setTimeout(() => scrollToBottom(), 50);
		}
	});

	async function handleSendMessage(
		event: CustomEvent<{ message: string; model: string; files?: File[] }>
	) {
		const userMessage = event.detail.message;
		const files = event.detail.files || uploadedFiles;
		selectedModel.set(event.detail.model);
		error = null;

		uploadedFiles = [];

		let fileContent = '';
		let fileNames: string[] = [];
		if (files && files.length > 0) {
			fileContent = await processUploadedFiles(files);
			fileNames = files.map((f) => f.name);
		}

		const optimisticUserMessage: Message = {
			id: 'temp-' + Date.now(),
			content: userMessage, // Just the user's message, no file info
			role: 'user',
			createdAt: new Date().toISOString(),
			animate: true,
			fileAttachments: fileNames // Store file names separately
		};

		localMessages = [...localMessages, optimisticUserMessage];
		await scrollToBottom();

		// Tandai bahwa ini adalah session baru (ada interaksi baru)
		isNewSession = true;
		isLoading = true;
		abortController = new AbortController();

		try {
			// Call our simplified chat API
			const response = await fetch('/api/chat', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					message: fileContent ? `${userMessage}\n\nFile content:\n${fileContent}` : userMessage,
					model: $selectedModel
				}),
				signal: abortController.signal
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();

			if (data.error) {
				throw new Error(data.error);
			}

			localMessages = localMessages.filter((msg) => msg.id !== optimisticUserMessage.id);

			const realUserMessage: Message = {
				id: generateId(),
				content: optimisticUserMessage.content,
				role: 'user',
				createdAt: new Date().toISOString(),
				animate: true,
				fileAttachments: optimisticUserMessage.fileAttachments
			};

			const aiMsg: Message = {
				id: generateId(),
				content: data.response,
				role: 'assistant',
				createdAt: new Date().toISOString(),
				animate: true,
				model: $selectedModel
			};

			localMessages = [...localMessages, realUserMessage, aiMsg];
			await scrollToBottom();
		} catch (err) {
			localMessages = localMessages.filter((msg) => msg.id !== optimisticUserMessage.id);

			if (err instanceof Error && err.name === 'AbortError') {
				error = 'Request was cancelled';
			} else {
				error = err instanceof Error ? err.message : 'An error occurred while sending the message';
			}
		} finally {
			isLoading = false;
			abortController = null;
		}
	}

	async function processUploadedFiles(files: File[]): Promise<string> {
		let content = '';
		const maxFileSize = 1024 * 1024; // 1MB limit per file
		const maxTotalSize = 5 * 1024 * 1024; // 5MB total limit
		let totalSize = 0;

		for (const file of files) {
			try {
				if (file.size > maxFileSize) {
					content += `\n\n--- ${file.name} ---\nFile too large (max 1MB per file). Please use a smaller file.`;
					continue;
				}

				totalSize += file.size;
				if (totalSize > maxTotalSize) {
					content += `\n\n--- ${file.name} ---\nTotal file size limit exceeded (max 5MB total). File skipped.`;
					continue;
				}

				let text = '';

				if (file.type.startsWith('image/')) {
					text = await readImageAsText(file);
				} else if (file.type === 'application/pdf') {
					text = `[PDF File: ${file.name}] - PDF content extraction not yet implemented. Please convert to text format.`;
				} else if (file.type.includes('spreadsheet') || file.name.endsWith('.csv')) {
					text = await readFileAsText(file);
				} else {
					text = await readFileAsText(file);
				}

				const maxChars = 8000; // Roughly 2000 tokens
				if (text.length > maxChars) {
					text = text.substring(0, maxChars) + '\n\n[Content truncated due to length...]';
				}

				content += `\n\n--- ${file.name} (${(file.size / 1024).toFixed(1)}KB) ---\n${text}`;
			} catch (error) {
				content += `\n\n--- ${file.name} ---\nError reading file: ${error}`;
			}
		}

		return content;
	}

	function readFileAsText(file: File): Promise<string> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = (e) => {
				const result = (e.target?.result as string) || '';
				resolve(result);
			};
			reader.onerror = (e) => reject(e);

			try {
				reader.readAsText(file, 'UTF-8');
			} catch (error) {
				const binaryReader = new FileReader();
				binaryReader.onload = (e) => {
					const arrayBuffer = e.target?.result as ArrayBuffer;
					const decoder = new TextDecoder('utf-8', { fatal: false });
					const text = decoder.decode(arrayBuffer);
					resolve(text);
				};
				binaryReader.onerror = (e) => reject(e);
				binaryReader.readAsArrayBuffer(file);
			}
		});
	}

	function readImageAsText(file: File): Promise<string> {
		return new Promise((resolve) => {
			const reader = new FileReader();
			reader.onload = (e) => {
				const dataUrl = e.target?.result as string;

				resolve(`[Image File: ${file.name}]
Type: ${file.type}
Size: ${(file.size / 1024).toFixed(1)}KB
Note: Image content analysis not yet implemented. Please describe the image content in your message.`);
			};
			reader.readAsDataURL(file);
		});
	}

	function handleStop() {
		if (abortController) {
			abortController.abort();
		}
	}

	onMount(() => {
		// Start with empty chat to show welcome screen
		localMessages = [];
	});
</script>

<div class="flex h-full flex-col bg-gray-50/50 dark:bg-gray-900">
	<!-- Messages container - compact design -->
	<div
		class="flex-1 overflow-y-auto px-3 py-4 pb-2 sm:px-4"
		bind:this={chatContainer}
		role="log"
		aria-label="Chat messages"
		aria-live="polite"
	>
		{#if localMessages.length === 0 && !isLoading}
			<!-- Show welcome screen when no messages -->
			<WelcomeScreen />
		{:else}
			<!-- Show chat messages when there are messages -->
			<div class="mx-auto max-w-3xl space-y-3 pb-4">
				{#each localMessages as message (message.id)}
					<ChatMessage
						message={message.content}
						isUser={message.role === 'user'}
						timestamp={new Date(message.createdAt)}
						animate={isNewSession && message.role === 'assistant' && (message.animate || false)}
						fileAttachments={message.fileAttachments || []}
					/>
				{/each}

				{#if isLoading}
					<div class="mb-4 flex justify-start">
						<div
							class="rounded-2xl rounded-bl-sm border border-gray-200/50 bg-white/80 px-4 py-3 shadow-sm backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-800/80"
						>
							<div class="flex items-start space-x-3">
								<div
									class="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 shadow-sm"
								>
									<div class="zen-logo flex h-4 w-4 items-center justify-center">
										<span class="zen-logo-white">
											{@html ZenLogo}
										</span>
									</div>
								</div>
								<LoadingIndicator message="Thinking..." size="sm" />
							</div>
						</div>
					</div>
				{/if}
			</div>
		{/if}
	</div>

	<!-- Chat input -->
	<ChatInput
		on:send={handleSendMessage}
		on:stop={handleStop}
		on:removeFile={(e) => removeFile(e.detail.index)}
		disabled={isLoading}
		isGenerating={isLoading}
		placeholder={isLoading
			? "Hold up, I'm thinking..."
			: "What's on your mind?"}
		{uploadedFiles}
	/>
</div>

<style>
	.zen-logo-white :global(svg) {
		fill: white !important;
		width: 100% !important;
		height: 100% !important;
		display: block;
	}
	/* Custom scrollbar for chat container */
	div[role='log'] {
		scrollbar-width: thin;
		scrollbar-color: rgba(59, 130, 246, 0.4) transparent;
	}

	div[role='log']::-webkit-scrollbar {
		width: 6px;
	}

	div[role='log']::-webkit-scrollbar-track {
		background: transparent;
	}

	div[role='log']::-webkit-scrollbar-thumb {
		background: rgba(59, 130, 246, 0.4);
		border-radius: 3px;
	}

	div[role='log']::-webkit-scrollbar-thumb:hover {
		background: rgba(59, 130, 246, 0.6);
	}
</style>
