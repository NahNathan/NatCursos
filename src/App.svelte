<script>

	let page = "Login";
	import Login from "./Login.svelte";
	import Cadastro from "./Cadastro.svelte";
	import Cursos from "./Cursos.svelte";
	import Perfil from "./Perfil.svelte";
	import Configurações from "./Configurações.svelte";
	import Detalhes from "./Detalhes.svelte";
	import Contato from "./Contato.svelte";
	console.log(page);

	function navigate(to) {
		page = to;
	}

</script>

<div id="tudo">
	<nav>
		<img src=".\Logo.png" alt="Logo" />
		<button on:click={() => navigate("Cadastro")}>Cadastrar</button>
		<button on:click={() => navigate("Login")}>Login</button>
		<button on:click={() => navigate("Cursos")}>Todos os Cursos</button>
		<button on:click={() => navigate("Perfil")}>Perfil</button>
		<button on:click={() => navigate("Configurações")}>Configurações</button>
		<button on:click={() => navigate("Contato")}>Contato</button>
	</nav>

	<main>
		{#if page === "Login"}
			<Login onNavigate={navigate} />
		{:else if page === "Cadastro"}
			<Cadastro onNavigate={navigate} />
		{:else if page === "Cursos"}
		<Cursos onNavigate={navigate} />
		{:else if page === "Perfil"}
			<Perfil onNavigate={navigate} />
		{:else if page === "Configurações"}
			<Configurações />
		{:else if page === "Detalhes"}
			<Detalhes onNavigate={navigate} />
		{:else if page === "Contato"}
			<Contato />
		{/if}
	</main>
</div>

<style>
	
	* {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}
	:global(body) {
		padding: 0;
		background-color: #333;
	}

	#tudo {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		padding: 0;
	}

	nav {
		width: 15vw; 
		height: 100vh;
		background-color: #ccc;
		position: fixed; 
		top: 0; 
		left: 0; 
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-top: 2rem; 
	}

	img {
		width: 80%;
		margin-bottom: 1vh;
	}

	button {
		margin-bottom: 1rem; /* espaço entre os botões */
		padding: 0.5rem 1rem; /* padding interno dos botões */
		font-size: 1rem;
		cursor: pointer;
		border: none;
		background-color: #f5e8c7;
		color: #111111;
		border-radius: 5px;
		transition: background-color 0.3s;
		position: relative;
		font-weight: bold;
		font-family: monospace;
		width: 80%;
		height: 6vh;
	}

	button:hover {
		background-color: #e5d8b7;
	}

	main {
		margin-left: 15vw;
		overflow-y: auto;
	}
</style>
