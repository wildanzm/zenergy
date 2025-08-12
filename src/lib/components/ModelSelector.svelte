<script lang="ts">
	import { selectedModel } from '$lib/stores/model';
	import { onMount } from 'svelte';

	let modelDropdownOpen = false;

	// Available AI models
	const models = [
		{ id: 'deepseek-r1-distill-llama-70b', name: 'DeepSeek R1 Distill Llama 70B' },
		{ id: 'gemma2-9b-it', name: 'Gemma2 9B' },
		{ id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant' },
		{ id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile' },
		{
			id: 'meta-llama/llama-4-maverick-17b-128e-instruct',
			name: 'Meta Llama 4 Maverick 17B 128E Instruct'
		},
		{
			id: 'meta-llama/llama-4-scout-17b-16e-instruct',
			name: 'Meta Llama 4 Scout 17B 16E Instruct'
		},
		{ id: 'moonshotai/kimi-k2-instruct', name: 'MoonshotAI Kimi K2 Instruct' },
		{ id: 'openai/gpt-oss-120b', name: 'OpenAI GPT-OSS 120B' },
		{ id: 'openai/gpt-oss-20b', name: 'OpenAI GPT-OSS 20B' },
		{ id: 'qwen/qwen3-32b', name: 'Qwen 3 32B' }
	];

	// Get current model name
	$: currentModelName = models.find((m) => m.id === $selectedModel)?.name || 'Select Model';

	/**
	 * Toggle model dropdown
	 */
	function toggleModelDropdown() {
		modelDropdownOpen = !modelDropdownOpen;
	}

	/**
	 * Select a model and close dropdown
	 */
	function selectModel(modelId: string) {
		selectedModel.set(modelId);
		modelDropdownOpen = false;
	}

	/**
	 * Close dropdown when clicking outside
	 */
	function handleClickOutside(event: MouseEvent) {
		const target = event.target as Element;
		if (!target.closest('[data-model-dropdown]')) {
			modelDropdownOpen = false;
		}
	}

	onMount(() => {
		document.addEventListener('click', handleClickOutside);
		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	});
</script>

<div class="relative" data-model-dropdown>
	<!-- Desktop: show full name -->
	<button
		type="button"
		on:click={toggleModelDropdown}
		class="hidden items-center gap-3 rounded-lg border border-gray-600/30 bg-gray-800/50 px-4 py-2.5 text-sm text-gray-200 shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-gray-500/50 hover:bg-gray-700/60 sm:flex"
		aria-label="Select AI model"
		title="Current model: {currentModelName}"
	>
		<svg
			class="h-4 w-4 flex-shrink-0 text-blue-400"
			viewBox="0 0 512 512"
			fill="currentColor"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M502.472,256.833c-6.491-61.075-40.69-110.46-86.082-144.101c-45.887-34.04-103.296-52.724-157.675-52.76 c-56.443,0.009-91.262,7.173-114.312,17.082c-22.776,9.644-33.774,22.98-39.813,30.843c-24.68,4.029-49.262,18.348-68.77,38.697 C15.107,168.343,0.054,197.423,0,229.381c0,34.97,8.112,64.52,24.299,86.498c14.354,19.596,35.288,32.472,60.207,37.148 c1.638,9.456,5.56,20.003,13.672,29.647c8.412,10.06,19.888,17.383,33.454,22.032c13.584,4.675,29.329,6.836,47.234,6.853h75.084 c1.85,4.729,4.108,9.236,7.217,13.213c7.642,9.785,18.649,16.656,31.834,20.96c13.248,4.33,28.859,6.288,46.995,6.296 c8.909,0,17.348-0.407,24.512-0.752h0.026c5.136-0.274,9.555-0.469,12.698-0.469c9.466,0,18.526-2.302,26.318-6.819 c7.793-4.498,14.257-11.166,18.676-19.357c2.232-4.154,3.702-8.51,4.8-12.902c16.727-3.126,30.604-9.236,41.407-17.028 c12.663-9.121,21.367-20.11,27.283-30.09c11.556-19.552,16.267-41.247,16.285-61.384 C511.982,286.064,508.511,270.08,502.472,256.833z"
			/>
		</svg>
		<div class="flex min-w-0 flex-col items-start">
			<span class="text-xs font-medium text-gray-400">AI Model</span>
			<span class="max-w-[200px] truncate text-sm font-semibold text-gray-100">
				{currentModelName}
			</span>
		</div>
		<svg
			class="h-3 w-3 flex-shrink-0 text-gray-400 transition-transform duration-200 {modelDropdownOpen
				? 'rotate-180'
				: ''}"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
		</svg>
	</button>

	<!-- Mobile: show icon and button only -->
	<button
		type="button"
		on:click={toggleModelDropdown}
		class="flex items-center gap-2 rounded-lg border border-gray-600/30 bg-gray-800/50 px-3 py-2 text-sm text-gray-200 shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-gray-500/50 hover:bg-gray-700/60 sm:hidden"
		aria-label="Select AI model"
		title="Current model: {currentModelName}"
	>
		<svg
			class="h-5 w-5 flex-shrink-0 text-blue-400"
			viewBox="0 0 512 512"
			fill="currentColor"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M502.472,256.833c-6.491-61.075-40.69-110.46-86.082-144.101c-45.887-34.04-103.296-52.724-157.675-52.76 c-56.443,0.009-91.262,7.173-114.312,17.082c-22.776,9.644-33.774,22.98-39.813,30.843c-24.68,4.029-49.262,18.348-68.77,38.697 C15.107,168.343,0.054,197.423,0,229.381c0,34.97,8.112,64.52,24.299,86.498c14.354,19.596,35.288,32.472,60.207,37.148 c1.638,9.456,5.56,20.003,13.672,29.647c8.412,10.06,19.888,17.383,33.454,22.032c13.584,4.675,29.329,6.836,47.234,6.853h75.084 c1.85,4.729,4.108,9.236,7.217,13.213c7.642,9.785,18.649,16.656,31.834,20.96c13.248,4.33,28.859,6.288,46.995,6.296 c8.909,0,17.348-0.407,24.512-0.752h0.026c5.136-0.274,9.555-0.469,12.698-0.469c9.466,0,18.526-2.302,26.318-6.819 c7.793-4.498,14.257-11.166,18.676-19.357c2.232-4.154,3.702-8.51,4.8-12.902c16.727-3.126,30.604-9.236,41.407-17.028 c12.663-9.121,21.367-20.11,27.283-30.09c11.556-19.552,16.267-41.247,16.285-61.384 C511.982,286.064,508.511,270.08,502.472,256.833z"
			/>
		</svg>
		<span class="text-xs font-medium text-gray-400">AI Model</span>
	</button>

	<!-- Model dropdown (always full names) -->
	{#if modelDropdownOpen}
		<div
			class="absolute top-full right-0 z-50 mt-2 min-w-[220px] rounded-xl border border-gray-600/30 bg-gray-800/95 shadow-xl backdrop-blur-md sm:min-w-[320px]"
		>
			<div class="p-4">
				<div class="mb-3 text-xs font-semibold tracking-wider text-gray-400 uppercase">
					Select AI Model
				</div>
				<div class="space-y-1">
					{#each models as model}
						<button
							type="button"
							on:click={() => selectModel(model.id)}
							class="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-all duration-150 hover:bg-gray-700/60 {$selectedModel ===
							model.id
								? 'bg-blue-600/80 text-white'
								: 'text-gray-200 hover:text-white'}"
						>
							<span class="font-medium break-words whitespace-normal">{model.name}</span>
							{#if $selectedModel === model.id}
								<svg
									class="h-4 w-4 flex-shrink-0 text-white"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										fill-rule="evenodd"
										d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
										clip-rule="evenodd"
									/>
								</svg>
							{/if}
						</button>
					{/each}
				</div>
			</div>
		</div>
	{/if}
</div>
