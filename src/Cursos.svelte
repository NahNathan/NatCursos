<script>
    export let onNavigate

    let cursosDisponiveis = [
        {
            id: 1,
            nome: "Estrutura de Dados com C",
            instrutor: "Camelo Lelis",
            imagem: "https://arquivo.devmedia.com.br/marketing/img/guia-introducao-a-programacao-37404.png",
        },
        {
            id: 2,
            nome: "Web Design Avançado",
            instrutor: "Maria Luisa",
            imagem: "https://uniateneu.edu.br/wp-content/uploads/2021/10/woman-designing-website-graphic.webp",
        },
        {
            id: 3,
            nome: "Marketing Digital",
            instrutor: "Heitor Borba",
            imagem: "https://i0.wp.com/www.webprecious.com/wp-content/uploads/2023/03/Become-a-Web-Designer.jpg?resize=750%2C410&ssl=1",
        },
        {
            id: 4,
            nome: "Python para Iniciantes",
            instrutor: "Mateus Alves",
            imagem: "https://t.ctcdn.com.br/o1B2PCtA5iQc2ofKn7FrcWiP9t4=/4032x2268/smart/i569772.jpeg",
        },
        {
            id: 5,
            nome: "UX/UI Design Fundamentals",
            instrutor: "Igor Marinho",
            imagem: "https://assets.telegraphindia.com/telegraph/2022/Sep/1663430911_untitled.jpg",
        },
        {
            id: 6,
            nome: "JavaScript Moderno",
            instrutor: "Dogonski33",
            imagem: "https://miro.medium.com/v2/resize:fit:1200/0*FXxXHe5eVfn1T4Rf.png",
        },
        {
            id: 7,
            nome: "Recriando o Instagram com Kotlin",
            instrutor: "Jefferson Kot",
            imagem: "https://blog.geekhunter.com.br/wp-content/uploads/2021/02/Kotlin-e1612441852104.jpg",
        },
        {
            id: 8,
            nome: "Estratégias de SEO",
            instrutor: "Gabriela Gabri",
            imagem: "https://99designs-blog.imgix.net/blog/wp-content/uploads/2019/05/DIFFERENT_TYPES_of_WEBSITES_jpg_CIaku32S.jpg?auto=format&q=60&fit=max&w=930",
        },
        {
            id: 9,
            nome: "Banco de Dados para Web",
            instrutor: "Gustavo Machado",
            imagem: "https://cdn.cl9.com.br/wp-content/uploads/2020/06/banco-de-dados-como-servico-o-que-e-e-quais-os-beneficios-p10drsmzu8okc1cww9o3ypie6ymj3uxj7xqj7reqq0.jpg",
        },
        {
            id: 10,
            nome: "Machine Learning com Python",
            instrutor: "David Bow",
            imagem: "https://solvimm.com/wp-content/uploads/2019/11/Destacada_Qual_tipo_de_Banco_de_Dados_utilizar.png",
        },
        {
            id: 11,
            nome: "Criando o melhor site com Svelte",
            instrutor: "NathanRdS",
            imagem: "https://miro.medium.com/max/2880/1*oHCbzzQSSmDF9icaxCk3iw.jpeg",
        },
    ];

</script>

<h1>Cursos Disponíveis</h1>

<div class="cursos-disponiveis">
    {#each cursosDisponiveis as curso (curso.id)}
        <div class="curso-card">
            <h2>{curso.nome}</h2>
            <img src={curso.imagem} alt="imagem do curso" />
            <p>Instrutor: {curso.instrutor}</p>
            <button on:click={() => onNavigate('Detalhes')}>Inscrever-se</button>
        </div>
    {/each}
</div>

<style>
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    h1 {
        font-size: 2.5em;
        font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        text-align: center;
        margin-top: 0px;
        margin-bottom: 30px;
        color: #dfdfff;
    }

    .cursos-disponiveis {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
    }

    .curso-card {
        border: 1px solid #c5bba0;
        padding: 20px;
        margin: 10px;
        border-radius: 5px;
        background-color: #f5e8c7;
        width: 300px;
        cursor: pointer;
        transition: background-color 0.3s;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }

    .curso-card:hover {
        background-color: #f0f0f0;
    }

    button {
        background-color: #435585;
        color: #fff;
        border: none;
        padding: 10px 20px;
        cursor: pointer;
        border-radius: 5px;
    }

    button:hover {
        background-color: #818fb4;
    }

    img {
        width: 100%;
        border-radius: 10px;
        height: 50%;
    }
</style>
