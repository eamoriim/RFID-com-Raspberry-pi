
from flask import Flask, jsonify
from app.database import inicializar_banco

app = Flask(__name__)


@app.route("/")
def inicio():
    return """
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Controle de Acesso RFID</title>
    </head>
    <body>
        <h1>Controle de Acesso RFID</h1>
        <p>Servidor Flask funcionando na Raspberry Pi.</p>
        <p>Banco de dados SQLite configurado.</p>
    </body>
    </html>
    """


@app.route("/api/status")
def status():
    return jsonify({
        "servidor": "online",
        "banco_de_dados": "configurado"
    })


if __name__ == "__main__":
    inicializar_banco()
    app.run(host="0.0.0.0", port=5000, debug=False)
