# -*- coding: utf-8 -*-
import json, os, sqlite3, webbrowser, threading
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory

app = Flask(__name__, static_folder='static')
BASE = os.path.dirname(os.path.abspath(__file__))
DB = os.path.join(BASE, 'respostas.db')

def load(f):
    with open(os.path.join(BASE, f), encoding='utf-8') as fp:
        return json.load(fp)

ACOES = load('acoes.json')
COLABS = load('colabs.json')
AREAS = load('areas.json')

def db():
    c = sqlite3.connect(DB)
    c.row_factory = sqlite3.Row
    return c

def init():
    c = db()
    c.executescript("""
    CREATE TABLE IF NOT EXISTS status (
        id TEXT PRIMARY KEY, data TEXT, area TEXT,
        chapa TEXT, nome TEXT, acao TEXT,
        tipo TEXT, exp TEXT, status TEXT
    );
    CREATE TABLE IF NOT EXISTS novas (
        id TEXT PRIMARY KEY, data TEXT, area TEXT,
        nome TEXT, just TEXT, tipo TEXT, exp TEXT,
        cls TEXT, ori TEXT, comp TEXT, modal TEXT,
        viagem TEXT, carga TEXT, di TEXT, df TEXT,
        st_acao TEXT, parts TEXT
    );
    """)
    c.commit(); c.close()

@app.route('/')
def home():
    return send_from_directory(BASE, 'index.html')

@app.route('/painel')
def painel():
    return send_from_directory(BASE, 'index.html')

@app.route('/static/<path:f>')
def static_files(f):
    return send_from_directory(os.path.join(BASE, 'static'), f)

@app.route('/api/areas')
def api_areas():
    return jsonify(AREAS)

@app.route('/api/area', methods=['POST'])
def api_area():
    a = request.json.get('area', '')
    return jsonify({'colabs': COLABS.get(a, []), 'acoes': ACOES.get(a, {})})

@app.route('/api/salvar', methods=['POST'])
def api_salvar():
    d = request.json
    now = datetime.now()
    ts = now.strftime('%Y%m%d%H%M%S%f')
    dt = now.strftime('%d/%m/%Y %H:%M')
    c = db()
    if d.get('tipo') == 'atualizar':
        for s in d.get('statuses', []):
            c.execute('INSERT OR REPLACE INTO status VALUES (?,?,?,?,?,?,?,?,?)',
                (ts+'_'+s.get('chapa',''), dt, d.get('area',''),
                 s.get('chapa',''), s.get('nome',''), s.get('acao',''),
                 s.get('tipo',''), str(s.get('exp','')), s.get('status','')))
    elif d.get('tipo') == 'nova':
        n = d.get('novaAcao', {})
        parts = '; '.join([p[1] for p in n.get('parts', [])])
        c.execute('INSERT OR REPLACE INTO novas VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
            (ts, dt, d.get('area',''), n.get('nome',''), n.get('just',''),
             n.get('tipo',''), n.get('exp',''), n.get('cls',''), n.get('ori',''),
             n.get('comp',''), n.get('modal',''), n.get('viagem',''),
             n.get('carga',''), n.get('di',''), n.get('df',''),
             n.get('status_acao',''), parts))
    c.commit(); c.close()
    return jsonify({'ok': True})

@app.route('/api/respostas')
def api_respostas():
    area = request.args.get('area', '')
    status = request.args.get('status', '')
    c = db()
    q1 = 'SELECT * FROM status WHERE 1=1'
    p1 = []
    if area: q1 += ' AND area=?'; p1.append(area)
    if status: q1 += ' AND status=?'; p1.append(status)
    rows1 = [dict(r) for r in c.execute(q1+' ORDER BY data DESC', p1)]
    q2 = 'SELECT * FROM novas WHERE 1=1'
    p2 = []
    if area: q2 += ' AND area=?'; p2.append(area)
    rows2 = [dict(r) for r in c.execute(q2+' ORDER BY data DESC', p2)]
    total = c.execute('SELECT COUNT(*) FROM status').fetchone()[0]
    real = c.execute("SELECT COUNT(*) FROM status WHERE status='REALIZADO'").fetchone()[0]
    ar1 = [r[0] for r in c.execute('SELECT DISTINCT area FROM status ORDER BY area')]
    ar2 = [r[0] for r in c.execute('SELECT DISTINCT area FROM novas ORDER BY area')]
    c.close()
    return jsonify({
        'st': rows1, 'nv': rows2,
        'stats': {'total': total, 'real': real,
                  'pct': round(real/total*100) if total else 0,
                  'n_nv': len(rows2),
                  'areas': sorted(set(ar1+ar2))}
    })

if __name__ == '__main__':
    init()
    print('Servidor iniciado! Acesse: http://localhost:5000')
    def open_b():
        import time; time.sleep(1.5)
        webbrowser.open('http://localhost:5000')
    threading.Thread(target=open_b, daemon=True).start()
    app.run(host='0.0.0.0', port=5000, debug=False)
