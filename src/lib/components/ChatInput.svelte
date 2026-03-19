<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { selectedModel } from '$lib/stores/model';

	export let disabled: boolean = false;
	export let placeholder: string = 'Type your message here bestie... 💫';
	export let isGenerating: boolean = false;
	export let uploadedFiles: File[] = [];
	let fileInputElement: HTMLInputElement;

	let webSearchEnabled = false;

	const dispatch = createEventDispatcher<{
		send: { message: string; model: string; files?: File[]; webSearch: boolean };
		stop: {};
		removeFile: { index: number };
	}>();

	let message = '';
	let textareaElement: HTMLTextAreaElement;

	let toastMessage = '';
	let showToast = false;
	let toastTimeout: ReturnType<typeof setTimeout>;

	function showCustomAlert(msg: string) {
		toastMessage = msg;
		showToast = true;
		if (toastTimeout) clearTimeout(toastTimeout);
		toastTimeout = setTimeout(() => {
			showToast = false;
		}, 4000);
	}

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
					files: uploadedFiles.length > 0 ? uploadedFiles : undefined,
					webSearch: webSearchEnabled
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
					showCustomAlert(
						`File "${file.name}" is too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Maximum size is 1MB per file.`
					);
					return false;
				}
				return true;
			});

			// Check total file count
			if (uploadedFiles.length + validFiles.length > maxTotalFiles) {
				showCustomAlert(`Maximum ${maxTotalFiles} files allowed. Please remove some files first.`);
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

{#if showToast}
	<div
		transition:fly={{ y: 20, duration: 300 }}
		class="fixed bottom-24 left-1/2 z-[100] flex -translate-x-1/2 items-center gap-3 rounded-2xl border border-red-500/20 bg-red-50/95 px-5 py-3 text-red-600 shadow-xl shadow-red-500/10 backdrop-blur-md dark:border-red-400/20 dark:bg-gray-900/95 dark:text-red-400 sm:bottom-8"
	>
		<div class="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40">
			<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
			</svg>
		</div>
		<p class="text-sm font-medium">{toastMessage}</p>
		<button
			type="button"
			on:click={() => (showToast = false)}
			class="ml-2 rounded-full p-1 transition-colors hover:bg-red-100 dark:hover:bg-red-900/50"
		>
			<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
			</svg>
		</button>
	</div>
{/if}

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
					class="w-full resize-none rounded-xl border border-gray-200/60 bg-white/95 px-4 py-3 pr-20 text-gray-900 placeholder-gray-500 backdrop-blur-sm transition-all duration-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 focus:outline-none dark:border-gray-600/60 dark:bg-gray-800/95 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500/20 {disabled
						? 'cursor-not-allowed opacity-50'
						: ''}"
					rows="1"
					style="height: auto; min-height: 52px; max-height: 200px;"
				></textarea>

				<!-- Web Search toggle button inside textarea (left of attachment) -->
				<button
					type="button"
					on:click={() => webSearchEnabled = !webSearchEnabled}
					{disabled}
					class="absolute top-3 right-[3.25rem] flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300/60 transition-all duration-200 hover:scale-105 {webSearchEnabled ? 'bg-blue-100 text-blue-600 border-blue-400 dark:bg-blue-900/40 dark:text-blue-400 dark:border-blue-500/60' : 'bg-white/90 text-gray-600 hover:border-gray-400 hover:bg-white dark:border-gray-600/60 dark:bg-gray-700/90 dark:text-gray-300 dark:hover:bg-gray-700'} {disabled
						? 'cursor-not-allowed opacity-50'
						: ''}"
					aria-label="Toggle web search"
					title="Toggle web search"
				>
					<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g id="style=linear" clip-path="url(#clip0_1_1825)"> <g id="web"> <path id="vector" d="M7.8 12L7.05 12L7.8 12ZM16.2 12H16.95H16.2ZM12 16.2V16.95V16.2ZM14.1729 22.2749L14.3273 23.0088L14.1729 22.2749ZM9.82712 22.2749L9.67269 23.0088L9.82712 22.2749ZM2.27554 8.03225L1.58122 7.74867H1.58122L2.27554 8.03225ZM1.7251 14.1729L0.991173 14.3273L1.7251 14.1729ZM9.82712 1.7251L9.67269 0.991173L9.82712 1.7251ZM14.1729 1.7251L14.3273 0.991174L14.1729 1.7251ZM21.6399 8.07014L21.8576 8.78785L21.6399 8.07014ZM2.35887 8.06976L2.14116 8.78747L2.35887 8.06976ZM21.0312 8.3185C21.4944 9.45344 21.75 10.6959 21.75 12H23.25C23.25 10.4983 22.9553 9.06352 22.42 7.75174L21.0312 8.3185ZM21.75 12C21.75 12.6927 21.6779 13.3678 21.541 14.0184L23.0088 14.3273C23.167 13.5757 23.25 12.7972 23.25 12H21.75ZM21.541 14.0184C20.7489 17.7827 17.7828 20.7489 14.0184 21.541L14.3273 23.0088C18.6735 22.0943 22.0943 18.6735 23.0088 14.3273L21.541 14.0184ZM14.0184 21.541C13.3678 21.6779 12.6927 21.75 12 21.75V23.25C12.7972 23.25 13.5757 23.167 14.3273 23.0088L14.0184 21.541ZM12 21.75C11.3072 21.75 10.6322 21.6779 9.98156 21.541L9.67269 23.0088C10.4242 23.167 11.2028 23.25 12 23.25V21.75ZM2.25 12C2.25 10.6949 2.50601 9.45149 2.96986 8.31584L1.58122 7.74867C1.0451 9.06127 0.75 10.4971 0.75 12H2.25ZM9.98156 21.541C6.21724 20.7489 3.25112 17.7827 2.45903 14.0184L0.991173 14.3273C1.90571 18.6735 5.32647 22.0943 9.67269 23.0088L9.98156 21.541ZM2.45903 14.0184C2.32213 13.3678 2.25 12.6927 2.25 12H0.75C0.75 12.7972 0.83303 13.5757 0.991173 14.3273L2.45903 14.0184ZM2.96986 8.31584C4.17707 5.36016 6.79381 3.1298 9.98155 2.45903L9.67269 0.991173C5.99032 1.76602 2.97369 4.33941 1.58122 7.74867L2.96986 8.31584ZM9.98155 2.45903C10.6322 2.32213 11.3072 2.25 12 2.25V0.75C11.2028 0.75 10.4242 0.83303 9.67269 0.991173L9.98155 2.45903ZM12 2.25C12.6927 2.25 13.3678 2.32213 14.0184 2.45903L14.3273 0.991174C13.5757 0.833031 12.7972 0.75 12 0.75V2.25ZM14.0184 2.45903C17.2071 3.13 19.8245 5.3615 21.0312 8.3185L22.42 7.75174C21.0281 4.34096 18.0108 1.76625 14.3273 0.991174L14.0184 2.45903ZM13.4584 1.95309C13.7482 2.8614 14.8215 6.35621 15.2615 9.5682L16.7476 9.36461C16.289 6.01664 15.1813 2.41835 14.8874 1.49712L13.4584 1.95309ZM15.2615 9.5682C15.3795 10.4292 15.45 11.2568 15.45 12L16.95 12C16.95 11.1681 16.8715 10.269 16.7476 9.36461L15.2615 9.5682ZM21.4222 7.35242C20.2692 7.70212 18.1033 8.3164 15.8685 8.72886L16.1407 10.204C18.4546 9.7769 20.6809 9.14473 21.8576 8.78785L21.4222 7.35242ZM15.8685 8.72886C14.5129 8.97904 13.1579 9.15 12 9.15L12 10.65C13.2874 10.65 14.743 10.4619 16.1407 10.204L15.8685 8.72886ZM15.45 12C15.45 13.1009 15.2954 14.3808 15.0647 15.671L16.5413 15.935C16.7797 14.6019 16.95 13.2252 16.95 12L15.45 12ZM15.0647 15.671C14.5591 18.4992 13.7097 21.2593 13.4584 22.0469L14.8874 22.5029C15.145 21.6956 16.0181 18.8613 16.5413 15.935L15.0647 15.671ZM22.0469 13.4584C21.2593 13.7097 18.4992 14.5591 15.671 15.0647L15.935 16.5413C18.8613 16.0181 21.6956 15.145 22.5029 14.8874L22.0469 13.4584ZM15.671 15.0647C14.3808 15.2954 13.1009 15.45 12 15.45L12 16.95C13.2252 16.95 14.6019 16.7797 15.935 16.5413L15.671 15.0647ZM12 15.45C10.8991 15.45 9.61923 15.2954 8.32897 15.0647L8.06496 16.5413C9.39807 16.7797 10.7748 16.95 12 16.95L12 15.45ZM8.32897 15.0647C5.50076 14.5591 2.74066 13.7097 1.95309 13.4584L1.49712 14.8874C2.30437 15.145 5.13873 16.0181 8.06496 16.5413L8.32897 15.0647ZM7.05 12C7.05 13.2252 7.22032 14.6019 7.45867 15.935L8.93526 15.671C8.70456 14.3808 8.55 13.1009 8.55 12L7.05 12ZM7.45867 15.935C7.98188 18.8613 8.85504 21.6956 9.11261 22.5029L10.5416 22.0469C10.2903 21.2593 9.44094 18.4992 8.93526 15.671L7.45867 15.935ZM9.11261 1.49712C8.81867 2.41835 7.711 6.01664 7.25235 9.36461L8.73846 9.5682C9.17849 6.35621 10.2518 2.8614 10.5416 1.95309L9.11261 1.49712ZM7.25235 9.36461C7.12846 10.269 7.05 11.1681 7.05 12L8.55 12C8.55 11.2568 8.62052 10.4292 8.73846 9.5682L7.25235 9.36461ZM12 9.15C10.8421 9.15 9.4871 8.97904 8.13152 8.72886L7.85929 10.204C9.25697 10.4619 10.7126 10.65 12 10.65L12 9.15ZM8.13152 8.72886C5.89586 8.31625 3.72921 7.70168 2.57657 7.35205L2.14116 8.78747C3.3175 9.14428 5.54457 9.77675 7.85929 10.204L8.13152 8.72886ZM21.38 7.3695C21.3919 7.3633 21.4065 7.35719 21.4222 7.35242L21.8576 8.78785C21.933 8.76498 22.0039 8.73569 22.0712 8.70074L21.38 7.3695ZM1.88425 8.67209C1.96322 8.72038 2.04888 8.75948 2.14116 8.78747L2.57657 7.35205C2.60983 7.36214 2.64048 7.3763 2.66683 7.39242L1.88425 8.67209Z" fill="currentColor"></path> </g> </g> <defs> <clipPath id="clip0_1_1825"> <rect width="24" height="24" fill="white"></rect> </clipPath> </defs> </g></svg>
				</button>

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
