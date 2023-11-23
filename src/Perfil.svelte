<script>
    export let onNavigate
    
    let usuario = {
        id: 1,
        nome: "Nathan Rodrigues dos Santos",
        user: "NahNathan",
        biografia: "Vou escrever alguma coisa aqui eventualmente, eu juro.",
        xp: 1000,
        cursos: [
            "Recriando o Instagram com Kotlin",
            "Estruturas de Dados com C",
            "Criando o melhor site com Svelte",
        ],
    };
</script>

<div class="informacoes-usuario">
    <h1>{usuario.nome}<br></h1>
    <h2>{usuario.user}<br></h2>
    <h2>XP:{usuario.xp}<br><br></h2>
    <h3>Biografia:</h3><h4>{usuario.biografia}</h4>
</div>

<div class="informacoes-usuario">
    <h2>Cursos terminados:</h2>
    {#each usuario.cursos as curso}
        <div class="curso-item">
            {curso}
            <br>
            <center>
                <button on:click={() => onNavigate('Detalhes')}>Mais informações</button>
            </center>
        </div>
    {/each}
</div>

<style>
    .informacoes-usuario {
        background-color: #ddd;
        padding: 4vh 4vw;
        margin: 5vh;
        border-radius: 3%;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.9);
        max-width: 80vw;
        position: relative;
    }

    .curso-item {
        background-color: #eee;
        margin: 2vh;
        padding: 2vh;
        border-radius: 4px;
        border: 1px solid #e1deff;
        font-size: 1.3rem;
        color: #101;
        font-weight: bold;
        font-family:Arial, Helvetica, sans-serif;
    }

    button {
        background-color: #bbb;
        color: #222;
        border: none;
        border-radius: 10px;
        padding: 0.75rem 1.5rem;
        cursor: pointer;
        margin: 3px;
        font-size: 1.2rem;
        font-family:monospace;
        font-weight: bolder;
    }

    
</style>
