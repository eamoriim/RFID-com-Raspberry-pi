
from flask import Blueprint, jsonify, request
import sqlite3
from app.database import cadastrar_colaborador, listar_colaboradores

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
