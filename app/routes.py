
from flask import Blueprint, jsonify, request
import sqlite3
from app.database import (
    cadastrar_colaborador,
    listar_colaboradores,
    cadastrar_cartao,
    processar_acesso
)

rotas = Blueprint("rotas", __name__)


@rotas.route("/api/colaboradores", methods=["GET"])
def obter_colaboradores():
    return jsonify(listar_colaboradores())


@rotas.route("/api/colaboradores", methods=["POST"])
def criar_colaborador():
    dados = request.get_json(silent=True) or {}

    nome = dados.get("nome")
    identificacao = dados.get("identificacao")

    if not isinstance(nome, str) or not nome.strip():
        return jsonify({"erro": "O nome é obrigatório."}), 400

    if identificacao is not None and not isinstance(identificacao, str):
        return jsonify({"erro": "A identificação deve ser um texto."}), 400

    nome = nome.strip()
    identificacao = identificacao.strip() if identificacao else None

    if identificacao == "":
        identificacao = None

    try:
        colaborador_id = cadastrar_colaborador(nome, identificacao)
        return jsonify({
            "mensagem": "Colaborador cadastrado com sucesso.",
            "id": colaborador_id
        }), 201
    except sqlite3.IntegrityError:
        return jsonify({
            "erro": "Essa identificação já está cadastrada."
        }), 409
@rotas.route("/api/acesso/teste", methods=["POST"])
def testar_acesso():
    dados = request.get_json(silent=True) or {}
    uid = dados.get("uid")

    if not isinstance(uid, str) or not uid.strip():
        return jsonify({"erro": "O UID do cartão é obrigatório."}), 400

    resultado = processar_acesso(uid.strip())
    return jsonify(resultado), 200


@rotas.route("/api/cartoes", methods=["POST"])
def criar_cartao():
    dados = request.get_json(silent=True) or {}

    uid = dados.get("uid")
    colaborador_id = dados.get("colaborador_id")
    permitido = dados.get("permitido", False)

    if not isinstance(uid, str) or not uid.strip():
        return jsonify({"erro": "O UID do cartão é obrigatório."}), 400

    if not isinstance(colaborador_id, int) or isinstance(colaborador_id, bool):
        return jsonify({"erro": "O ID do colaborador deve ser um número inteiro."}), 400

    if not isinstance(permitido, bool):
        return jsonify({"erro": "O campo permitido deve ser verdadeiro ou falso."}), 400

    try:
        cartao_id = cadastrar_cartao(
            uid.strip(),
            colaborador_id,
            permitido
        )
        return jsonify({
            "mensagem": "Cartão cadastrado com sucesso.",
            "id": cartao_id
        }), 201
    except sqlite3.IntegrityError:
        return jsonify({
            "erro": "O UID já está cadastrado ou o colaborador não existe."
        }), 409
