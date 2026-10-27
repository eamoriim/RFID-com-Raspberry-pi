
const servidor = document.getElementById("servidor");
const banco = document.getElementById("banco");
const statusServidor = document.getElementById("status-servidor");
const ultimaAtualizacao = document.getElementById("ultima-atualizacao");
const mensagem = document.getElementById("mensagem");
const botaoAtualizar = document.getElementById("atualizar");

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

botaoAtualizar.addEventListener("click", atualizarStatus);

atualizarStatus();
setInterval(atualizarStatus, 10000);
