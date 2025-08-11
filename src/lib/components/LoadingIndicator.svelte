<script lang="ts">
	export let message: string = "AI is thinking...";
	export let size: 'sm' | 'md' | 'lg' = 'md';
	
	const sizeClasses = {
		sm: 'w-4 h-4',
		md: 'w-6 h-6',
		lg: 'w-8 h-8'
	};
</script>

<div class="flex items-center justify-center space-x-2" role="status" aria-label={message}>
	<!-- Animated dots -->
	<div class="flex space-x-1">
		{#each Array(3) as _, i}
			<div 
				class="rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 {sizeClasses[size]} neon-glow-blue"
				style="animation: pulse {1.4 + i * 0.2}s ease-in-out infinite alternate;"
			></div>
		{/each}
	</div>
	
	<!-- Loading message -->
	<span class="text-slate-400 text-sm ml-2 typewriter">{message}</span>
</div>

<style>
	@keyframes pulse {
		0% {
			opacity: 0.4;
			transform: scale(0.8);
		}
		100% {
			opacity: 1;
			transform: scale(1.2);
		}
	}
</style>
