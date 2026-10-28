
const servidor = document.getElementById("servidor");
const banco = document.getElementById("banco");
const statusServidor = document.getElementById("status-servidor");
const ultimaAtualizacao = document.getElementById("ultima-atualizacao");
const mensagem = document.getElementById("mensagem");
const botaoAtualizar = document.getElementById("atualizar");

const formulario = document.getElementById("form-colaborador");
const campoNome = document.getElementById("nome");
const campoIdentificacao = document.getElementById("identificacao");
const botaoCadastrar = document.getElementById("cadastrar");
const mensagemCadastro = document.getElementById("mensagem-cadastro");
const listaColaboradores = document.getElementById("lista-colaboradores");
const botaoAtualizarColaboradores = document.getElementById("atualizar-colaboradores");

async function atualizarStatus() {
    botaoAtualizar.disabled = true;
    mensagem.textContent = "Consultando servidor...";

    try {
        const resposta = await fetch("/api/status");

        if (!resposta.ok) {
            throw new Error("Não foi possível consultar a API.");
        }

        const dados = await resposta.json();

        servidor.textContent = dados.servidor === "online" ? "Online" : "Offline";
        banco.textContent = dados.banco_de_dados === "configurado"
            ? "Configurado"
            : "Indisponível";

        statusServidor.textContent = dados.servidor === "online"
            ? "Servidor online"
            : "Servidor offline";

        ultimaAtualizacao.textContent =
            "Última atualização: " + new Date().toLocaleTimeString("pt-BR");

        mensagem.textContent = "Status atualizado com sucesso.";
    } catch (erro) {
        servidor.textContent = "Indisponível";
        banco.textContent = "Não verificado";
        statusServidor.textContent = "Sem conexão";
        mensagem.textContent = "Falha ao consultar o servidor.";
    } finally {
        botaoAtualizar.disabled = false;
    }
}

async function atualizarColaboradores() {
    listaColaboradores.replaceChildren();

    try {
        const resposta = await fetch("/api/colaboradores");

        if (!resposta.ok) {
            throw new Error("Não foi possível carregar os colaboradores.");
        }

        const colaboradores = await resposta.json();

        if (colaboradores.length === 0) {
            const linha = document.createElement("tr");
            const celula = document.createElement("td");

            celula.colSpan = 4;
            celula.textContent = "Nenhum colaborador cadastrado.";
            linha.appendChild(celula);
            listaColaboradores.appendChild(linha);
            return;
        }

        colaboradores.forEach((colaborador) => {
            const linha = document.createElement("tr");
            const valores = [
                colaborador.id,
                colaborador.nome,
                colaborador.identificacao || "Não informada",
                Number(colaborador.ativo) === 1 ? "Ativo" : "Inativo"
            ];

            valores.forEach((valor) => {
                const celula = document.createElement("td");
                celula.textContent = valor;
                linha.appendChild(celula);
            });

            listaColaboradores.appendChild(linha);
        });
    } catch (erro) {
        const linha = document.createElement("tr");
        const celula = document.createElement("td");

        celula.colSpan = 4;
        celula.textContent = "Erro ao carregar colaboradores.";
        linha.appendChild(celula);
        listaColaboradores.appendChild(linha);
    }
}

async function cadastrarColaborador(evento) {
    evento.preventDefault();

    botaoCadastrar.disabled = true;
    mensagemCadastro.textContent = "Cadastrando colaborador...";

    try {
        const resposta = await fetch("/api/colaboradores", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                nome: campoNome.value.trim(),
                identificacao: campoIdentificacao.value.trim()
            })
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(dados.erro || "Não foi possível cadastrar o colaborador.");
        }

        mensagemCadastro.textContent = dados.mensagem;
        formulario.reset();
        await atualizarColaboradores();
    } catch (erro) {
        mensagemCadastro.textContent = erro.message;
    } finally {
        botaoCadastrar.disabled = false;
    }
}

botaoAtualizar.addEventListener("click", atualizarStatus);
formulario.addEventListener("submit", cadastrarColaborador);
botaoAtualizarColaboradores.addEventListener("click", atualizarColaboradores);

atualizarStatus();
atualizarColaboradores();

setInterval(atualizarStatus, 10000);
