<script lang="ts">
	import { selectedModel } from '$lib/stores/model';
	
	const modelName = 'OpenAI GPT-OSS 120B';
</script>

<div class="relative" data-model-dropdown>
	<!-- Desktop: show full name -->
	<div
		class="hidden items-center gap-3 rounded-lg border border-blue-500/30 bg-gray-800/80 px-4 py-2.5 text-sm text-gray-200 shadow-sm backdrop-blur-sm transition-all duration-200 sm:flex"
		aria-label="Active AI model"
		title="Current active model: {modelName}"
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
		<div class="flex min-w-0 flex-col items-start bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-cyan-300">
			<span class="text-xs font-semibold uppercase tracking-wider text-blue-400">Powered By</span>
			<span class="max-w-[200px] truncate text-sm font-bold">
				{modelName}
			</span>
		</div>
	</div>

	<!-- Mobile: show icon and button only -->
	<div
		class="flex items-center gap-2 rounded-lg border border-blue-500/30 bg-gray-800/80 px-3 py-2 text-sm text-gray-200 shadow-sm backdrop-blur-sm transition-all duration-200 sm:hidden"
		aria-label="Active AI model"
		title="Current active model: {modelName}"
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
		<span class="bg-clip-text text-xs font-bold text-transparent bg-gradient-to-r from-blue-300 to-cyan-300">OSS 120B</span>
	</div>
</div>
