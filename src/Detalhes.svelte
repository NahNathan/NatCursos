<script>
    export let onNavigate

    let curso = {
        id: 1,
        nome: "Estruturas de Dados com C",
        descrição:
            "Neste curso você irá embarcar no incrível mundo das estruturas de dados. Você aprenderá a analisar, adicionar e retirar dados de diversas estruturas como Pilhas, Filas, Listas, Árvores e muito mais. Tudo isso utilizando a incrível linguagem C, consagrada no mercado há mais de 50 anos",
        video: "https://youtube.com/embed/9GdesxWtOgs?si=yJmg2Leon5g21Abo",
    };
</script>

<div class="informacoes-curso">
    <h1>{curso.nome}</h1>
    <h4>{curso.descrição}</h4>
    <div id="video">
    <iframe
        width="1120"
        height="630"
        src={curso.video}
        title="YouTube video player"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
    /></div> <br><br><br>
    <button on:click={() => onNavigate('Perfil')}>Curso Concluído✅</button>
</div>

<style>
    .informacoes-curso {
        background-color: #ddd;
        padding: 4vh 4vw;
        margin: 5vh;
        border-radius: 3%;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.9);
        max-width: 80vw;
        position: relative;
    }

    #video{
        justify-content: center;
        display: flex;
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
        transition: background-color 0.3s;
        font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
        font-weight: bold;
    }
    button:hover {
		background-color: #818FB4;
	}
</style>
