<script>
    export let onNavigate

    async function fazerCadastro() {
        alert("Usuário cadastrado com sucesso")
        onNavigate('Cursos')
    }
</script>


    <div class="login-form">
        <h2>Cadastrar</h2>
        <div class="form-field">
            <label for="usuario">Nome de usuário:</label>
            <input type="text" id="usuario" placeholder="Digite um nome de usuário" />
        </div>
        <div class="form-field">
            <label for="email">Email:</label>
            <input type="text" id="usuario" placeholder="Digite seu email" />
        </div>
        <div class="form-field">
            <label for="senha">Senha:</label>
            <input type="password" id="senha" placeholder="Digite sua senha" />
        </div>
        <div class="form-field">
            <label for="senhac">Confirmar Senha:</label>
            <input type="password" id="senha" placeholder="Confirme sua senha" />
        </div>
        <button on:click={fazerCadastro}>Cadastrar</button>
    </div>

<style>
    .login-form {
        background-color: #F5E8C7;
        padding: 4vh 4vw;
        margin: 5vh;
        border-radius: 3%;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.9);
        max-width: 800px;
        position: relative;
    }

    h2 {
        color: #444;
        margin-bottom: 2vh;
    }

    .form-field {
        margin-bottom: 1.5rem;
    }

    label {
        display: block;
        margin-bottom: 0.5rem;
        color: #333;
        font-weight: bold;
    }

    input {
        width: 30vw;
        padding: 0.75rem 1rem;
        border: 1px solid #ddd;
        border-radius: 5%;
        box-sizing: border-box;
        transition: border-color 0.3s, box-shadow 0.3s;
    }

    input:focus {
        border-color: #363062;
        box-shadow: 0 0 10px #363062;
        outline: none;
    }

    button {
        background-color: #363062;
        color: #fff;
        border: none;
        border-radius: 5%;
        padding: 0.75rem 1.5rem;
        cursor: pointer;
        transition: background-color 0.3s, transform 0.3s;
    }

    button:hover {
        background-color: #818FB4;
        transform: translateY(-5%);
    }

    button:active {
        transform: translateY(0);
    }
</style>
