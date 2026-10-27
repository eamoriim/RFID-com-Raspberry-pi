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
