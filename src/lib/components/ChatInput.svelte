<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { selectedModel } from '$lib/stores/model';

	export let disabled: boolean = false;
	export let placeholder: string = 'Type your message here bestie... 💫';
	export let isGenerating: boolean = false;
	export let uploadedFiles: File[] = [];
	let fileInputElement: HTMLInputElement;

	const dispatch = createEventDispatcher<{
		send: { message: string; model: string; files?: File[] };
		stop: {};
		removeFile: { index: number };
	}>();

	let message = '';
	let textareaElement: HTMLTextAreaElement;

	/**
	 * Handle form submission
	 */
	function handleSubmit() {
		const trimmedMessage = message.trim();
		if (!disabled) {
			if (isGenerating) {
				// Stop current generation
				dispatch('stop', {});
			} else if (trimmedMessage || uploadedFiles.length > 0) {
				// Send new message with files
				dispatch('send', {
					message: trimmedMessage,
					model: $selectedModel,
					files: uploadedFiles.length > 0 ? uploadedFiles : undefined
				});
				message = '';
				adjustTextareaHeight();
			}
		}
	}

	/**
	 * Handle keyboard events
	 */
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			handleSubmit();
		}
	}

	/**
	 * Auto-adjust textarea height based on content
	 */
	function adjustTextareaHeight() {
		if (textareaElement) {
			textareaElement.style.height = 'auto';
			textareaElement.style.height = `${Math.min(textareaElement.scrollHeight, 120)}px`;
		}
	}

	/**
	 * Handle input changes
	 */
	function handleInput() {
		adjustTextareaHeight();
	}

	/**
	 * Trigger file upload dialog
	 */
	function triggerFileUpload() {
		if (fileInputElement) {
			fileInputElement.click();
		}
	}

	/**
	 * Handle file input change with validation
	 */
	function handleFileUpload(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files) {
			const newFiles = Array.from(input.files);
			const maxFileSize = 1024 * 1024; // 1MB per file
			const maxTotalFiles = 10;

			// Validate files
			const validFiles = newFiles.filter((file) => {
				if (file.size > maxFileSize) {
					alert(
						`File "${file.name}" is too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Maximum size is 1MB per file.`
					);
					return false;
				}
				return true;
			});

			// Check total file count
			if (uploadedFiles.length + validFiles.length > maxTotalFiles) {
				alert(`Maximum ${maxTotalFiles} files allowed. Please remove some files first.`);
				const allowedCount = maxTotalFiles - uploadedFiles.length;
				uploadedFiles = [...uploadedFiles, ...validFiles.slice(0, allowedCount)];
			} else {
				uploadedFiles = [...uploadedFiles, ...validFiles];
			}

			// Reset input to allow selecting the same file again
			input.value = '';
		}
	}
</script>

<div
	class="flex-shrink-0 bg-white/90 px-2 py-2 backdrop-blur-sm sm:px-4 sm:py-4 dark:border-gray-700/40 dark:bg-gray-900/90"
>
	<div class="mx-auto w-full max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl">
		<!-- File upload previews -->
		{#if uploadedFiles.length > 0}
			<div class="mb-3 flex flex-wrap gap-2">
				{#each uploadedFiles as file, index}
					<div
						class="flex items-center gap-2 rounded-lg border border-gray-200/80 bg-gray-50/90 px-3 py-2 text-sm text-gray-700 shadow-sm dark:border-gray-600/60 dark:bg-gray-800/90 dark:text-gray-300"
					>
						<svg
							class="h-4 w-4 flex-shrink-0 text-blue-500"
							fill="currentColor"
							viewBox="0 0 20 20"
						>
							<path
								fill-rule="evenodd"
								d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
								clip-rule="evenodd"
							/>
						</svg>
						<span class="max-w-40 truncate font-medium">{file.name}</span>
						<button
							type="button"
							on:click={() => {
								uploadedFiles = uploadedFiles.filter((_, i) => i !== index);
							}}
							class="ml-1 text-gray-500 transition-colors duration-150 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
							aria-label="Remove file"
						>
							<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>
					</div>
				{/each}
			</div>
		{/if}

		<!-- Input form -->
		<form on:submit|preventDefault={handleSubmit} class="flex items-end gap-3">
			<!-- Message input area -->
			<div class="relative flex-1">
				<textarea
					bind:this={textareaElement}
					bind:value={message}
					on:input={handleInput}
					on:keydown={handleKeydown}
					{placeholder}
					{disabled}
					class="w-full resize-none rounded-xl border border-gray-200/60 bg-white/95 px-4 py-3 pr-12 text-gray-900 placeholder-gray-500 backdrop-blur-sm transition-all duration-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 focus:outline-none dark:border-gray-600/60 dark:bg-gray-800/95 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500/20 {disabled
						? 'cursor-not-allowed opacity-50'
						: ''}"
					rows="1"
					style="height: auto; min-height: 52px; max-height: 200px;"
				></textarea>

				<!-- File upload button inside textarea (far right) -->
				<button
					type="button"
					on:click={triggerFileUpload}
					{disabled}
					class="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300/60 bg-white/90 text-gray-600 transition-all duration-200 hover:scale-105 hover:border-gray-400 hover:bg-white dark:border-gray-600/60 dark:bg-gray-700/90 dark:text-gray-300 dark:hover:bg-gray-700 {disabled
						? 'cursor-not-allowed opacity-50'
						: ''}"
					aria-label="Attach files"
					title="Attach files"
				>
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
						/>
					</svg>
				</button>

				<!-- Hidden file input -->
				<input
					bind:this={fileInputElement}
					type="file"
					multiple
					accept=".txt,.md,.js,.ts,.jsx,.tsx,.py,.java,.cpp,.c,.h,.css,.html,.json,.xml,.yaml,.yml,.csv,.log,.sql,.sh,.bat,.ini,.cfg,.conf,.properties,.env,.gitignore,.dockerfile,.makefile,.readme,.LICENSE,.png,.jpg,.jpeg,.gif,.svg,.webp,.bmp,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
					on:change={handleFileUpload}
					class="hidden"
					aria-hidden="true"
				/>
			</div>

			<!-- Submit button outside the input -->
			<button
				type="submit"
				{disabled}
				class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-blue-500 text-white shadow-lg transition-all duration-200 hover:bg-blue-600 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 {isGenerating
					? ''
					: disabled
						? ''
						: 'hover:scale-105'}"
				aria-label={isGenerating ? 'Stop generation' : 'Send message'}
			>
				{#if isGenerating}
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				{:else}
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
						/>
					</svg>
				{/if}
			</button>
		</form>

		<!-- AI disclaimer message -->
		<div class="mt-3 flex items-center justify-center">
			<p class="text-center text-xs text-gray-500 dark:text-gray-400">
				AI can make mistakes. Please verify important information and use responsibly.
			</p>
		</div>
	</div>
</div>

<style>
	/* Focus styles for textarea */
	textarea:focus {
		outline: none;
	}

	/* Hide scrollbar for textarea */
	textarea {
		scrollbar-width: none; /* Firefox */
		-ms-overflow-style: none; /* IE 10+ */
	}
	textarea::-webkit-scrollbar {
		display: none; /* Chrome, Safari, Opera */
	}

	/* Button hover effects */
	button:hover:not(:disabled) {
		transform: translateY(-1px);
	}

	button:active:not(:disabled) {
		transform: translateY(0);
	}

	/* Adjust input prompt and button size */
	textarea {
		height: 52px;
		line-height: 1.5;
		font-size: 1rem;
	}

	button[type='submit'] {
		height: 52px;
		width: 52px;
	}

	/* Enlarge the submit button icon */
	button[type='submit'] svg {
		height: 24px;
		width: 24px;
	}

	/* Center align input and button */
	form {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	/* Rotate the submit button icon to point northeast */
	button[type='submit'] svg {
		transform: rotate(45deg);
	}

	/* Center the submit button icon */
	button[type='submit'] {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	@media (max-width: 640px) {
		form {
			gap: 0.5rem;
		}
		button[type='submit'] {
			height: 44px;
			width: 44px;
		}
		textarea {
			font-size: 0.95rem;
			min-height: 44px;
		}
	}
</style>
