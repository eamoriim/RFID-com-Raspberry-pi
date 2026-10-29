
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

const seletorColaboradorCartao = document.getElementById("colaborador-cartao");

const listaRegistros = document.getElementById("lista-registros");
const botaoAtualizarRegistros = document.getElementById("atualizar-registros");
const mensagemRegistros = document.getElementById("mensagem-registros");

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

async function carregarColaboradoresCartao() {
    if (!seletorColaboradorCartao) return;

    try {
        const resposta = await fetch("/api/colaboradores");

        if (!resposta.ok) {
            throw new Error("Não foi possível carregar os colaboradores.");
        }

        const colaboradores = await resposta.json();

        seletorColaboradorCartao.replaceChildren();

        const opcaoInicial = document.createElement("option");
        opcaoInicial.value = "";
        opcaoInicial.textContent = "Selecione um colaborador";
        seletorColaboradorCartao.appendChild(opcaoInicial);

        colaboradores
            .filter((colaborador) => Number(colaborador.ativo) === 1)
            .forEach((colaborador) => {
                const opcao = document.createElement("option");
                opcao.value = colaborador.id;
                opcao.textContent = colaborador.nome;
                seletorColaboradorCartao.appendChild(opcao);
            });
    } catch (erro) {
        console.error("Erro ao carregar colaboradores para cartões:", erro);
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
        await carregarColaboradoresCartao();
    } catch (erro) {
        mensagemCadastro.textContent = erro.message;
    } finally {
        botaoCadastrar.disabled = false;
    }
}

async function atualizarRegistros() {
    listaRegistros.replaceChildren();
    mensagemRegistros.textContent = "Carregando histórico...";

    try {
        const resposta = await fetch("/api/registros");

        if (!resposta.ok) {
            throw new Error("Não foi possível carregar o histórico.");
        }

        const registros = await resposta.json();

        if (registros.length === 0) {
            const linha = document.createElement("tr");
            const celula = document.createElement("td");

            celula.colSpan = 4;
            celula.textContent = "Nenhum acesso registrado.";
            linha.appendChild(celula);
            listaRegistros.appendChild(linha);
            mensagemRegistros.textContent = "";
            return;
        }

        registros.forEach((registro) => {
            const linha = document.createElement("tr");
            const valores = [
                registro.data_hora || "Não informada",
                registro.colaborador || "Desconhecido",
                registro.uid,
                Number(registro.autorizado) === 1
                    ? "Acesso autorizado"
                    : "Acesso negado"
            ];

            valores.forEach((valor) => {
                const celula = document.createElement("td");
                celula.textContent = valor;
                linha.appendChild(celula);
            });

            listaRegistros.appendChild(linha);
        });

        mensagemRegistros.textContent =
            `${registros.length} registro(s) encontrado(s).`;
    } catch (erro) {
        const linha = document.createElement("tr");
        const celula = document.createElement("td");

        celula.colSpan = 4;
        celula.textContent = "Erro ao carregar o histórico.";
        linha.appendChild(celula);
        listaRegistros.appendChild(linha);
        mensagemRegistros.textContent = erro.message;
    }
}

botaoAtualizar.addEventListener("click", atualizarStatus);
formulario.addEventListener("submit", cadastrarColaborador);
botaoAtualizarColaboradores.addEventListener("click", atualizarColaboradores);
botaoAtualizarRegistros.addEventListener("click", atualizarRegistros);

atualizarStatus();
atualizarColaboradores();
carregarColaboradoresCartao();
atualizarRegistros();

setInterval(atualizarStatus, 10000);
