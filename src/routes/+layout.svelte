<script lang="ts">
	import '../app.css';
	import Navbar from '$lib/components/Navbar.svelte';
	import { onMount } from 'svelte';

	let { children } = $props();

	// Always show chat layout for now since we removed separate routes
	const isChatPage = $derived(true);

	// Force dark mode always
	onMount(() => {
		const root = document.documentElement;
		root.classList.add('dark');
		root.setAttribute('data-theme', 'dark');
	});
</script>

<svelte:head>
	<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
	<link rel="icon" href="/favicon.ico" sizes="any" />
	<title>Zenergy - Your Friendly AI Companion</title>
	<meta name="description" content="Modern AI chatbot" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<!-- PWA meta tags -->
	<meta name="theme-color" content="#3b82f6" />
	<link rel="manifest" href="/manifest.json" />
	<!-- Prevent indexing by search engines -->
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

{#if isChatPage}
	<div class="flex h-screen flex-col overflow-hidden bg-white dark:bg-gray-900">
		<Navbar />
		<main class="flex-1 overflow-hidden">
			{@render children?.()}
		</main>
	</div>
{:else}
	<div class="min-h-screen bg-white dark:bg-gray-900">
		<Navbar />
		{@render children?.()}
	</div>
{/if}
