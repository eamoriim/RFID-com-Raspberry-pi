import sqlite3
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
DATABASE_PATH = DATA_DIR / "rfid.db"


def conectar():
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    conexao = sqlite3.connect(DATABASE_PATH)
    conexao.row_factory = sqlite3.Row
    return conexao
def inicializar_banco():
    with conectar() as conexao:
        conexao.executescript("""
            CREATE TABLE IF NOT EXISTS colaboradores (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                identificacao TEXT UNIQUE,
                ativo INTEGER NOT NULL DEFAULT 1
            );

            CREATE TABLE IF NOT EXISTS cartoes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                uid TEXT NOT NULL UNIQUE,
                colaborador_id INTEGER NOT NULL,
                permitido INTEGER NOT NULL DEFAULT 0,
                FOREIGN KEY (colaborador_id)
                    REFERENCES colaboradores(id)
            );

            CREATE TABLE IF NOT EXISTS registros (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                colaborador_id INTEGER,
                uid TEXT NOT NULL,
                evento TEXT NOT NULL,
                autorizado INTEGER NOT NULL,
                data_hora TEXT NOT NULL DEFAULT (
                    strftime('%Y-%m-%d %H:%M:%S', 'now', 'localtime')
                ),
                FOREIGN KEY (colaborador_id)
                    REFERENCES colaboradores(id)
            );
        """)
def cadastrar_colaborador(nome, identificacao):
    with conectar() as conexao:
        cursor = conexao.execute(
            """
            INSERT INTO colaboradores (nome, identificacao)
            VALUES (?, ?)
            """,
            (nome, identificacao)
        )
        return cursor.lastrowid
def listar_colaboradores():
    with conectar() as conexao:
        colaboradores = conexao.execute(
            """
            SELECT id, nome, identificacao, ativo
            FROM colaboradores
            ORDER BY nome
            """
        ).fetchall()
        return [dict(colaborador) for colaborador in colaboradores]
def cadastrar_cartao(uid, colaborador_id, permitido=False):
    with conectar() as conexao:
        cursor = conexao.execute(
            """
            INSERT INTO cartoes (uid, colaborador_id, permitido)
            VALUES (?, ?, ?)
            """,
            (uid, colaborador_id, int(permitido))
        )
        return cursor.lastrowid
def processar_acesso(uid):
    with conectar() as conexao:
        cartao = conexao.execute(
            """
            SELECT c.id, c.colaborador_id, c.permitido,
                   p.nome, p.ativo
            FROM cartoes c
            JOIN colaboradores p ON p.id = c.colaborador_id
            WHERE c.uid = ?
            """,
            (uid,)
        ).fetchone()

        autorizado = bool(
            cartao
            and cartao["permitido"] == 1
            and cartao["ativo"] == 1
        )

        colaborador_id = cartao["colaborador_id"] if cartao else None
        evento = "ACESSO_AUTORIZADO" if autorizado else "ACESSO_NEGADO"

        conexao.execute(
            """
            INSERT INTO registros (colaborador_id, uid, evento, autorizado)
            VALUES (?, ?, ?, ?)
            """,
            (colaborador_id, uid, evento, int(autorizado))
        )

        return {
            "uid": uid,
            "autorizado": autorizado,
            "evento": evento,
            "colaborador": cartao["nome"] if cartao else None
        }
def listar_registros():
    with conectar() as conexao:
        registros = conexao.execute(
            """
            SELECT
                r.id,
                r.uid,
                r.evento,
                r.autorizado,
                r.data_hora,
                c.nome AS colaborador
            FROM registros r
            LEFT JOIN colaboradores c
                ON c.id = r.colaborador_id
            ORDER BY r.id DESC
            """
        ).fetchall()

        return [dict(registro) for registro in registros]