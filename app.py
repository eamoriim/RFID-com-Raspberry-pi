
from flask import Flask, jsonify, render_template
from app.database import inicializar_banco
from app.routes import rotas

app = Flask( 
    __name__,
    template_folder="app/templates",
    static_folder="app/static"
)

app.register_blueprint(rotas)

@app.route("/")
def inicio():
    return render_template("index.html")


@app.route("/api/status")
def status():
    return jsonify({
        "servidor": "online",
        "banco_de_dados": "configurado"
    })


if __name__ == "__main__":
    inicializar_banco()
    app.run(host="0.0.0.0", port=5000, debug=False)

