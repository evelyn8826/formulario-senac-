# -*- coding: utf-8 -*-
import json, os, sqlite3
from datetime import datetime
from flask import Flask, request, jsonify

app = Flask(__name__)
BASE = os.path.dirname(os.path.abspath(__file__))

def load(f):
    with open(os.path.join(BASE, f), encoding='utf-8') as fp:
        return json.load(fp)

ACOES = load('acoes.json')
COLABS = load('colabs.json')
AREAS = load('areas.json')

# Tenta usar PostgreSQL (Render) ou cai para SQLite local
DATABASE_URL = os.environ.get('DATABASE_URL')

if DATABASE_URL:
    import psycopg2
    from psycopg2.extras import RealDictCursor

    def get_conn():
        return psycopg2.connect(DATABASE_URL, sslmode='require')

    def init_db():
        conn = get_conn()
        cur = conn.cursor()
        cur.execute("""
            CREATE TABLE IF NOT EXISTS status (
                id TEXT PRIMARY KEY, data TEXT, area TEXT,
                chapa TEXT, nome TEXT, acao TEXT,
                tipo TEXT, exp TEXT, status TEXT
            )
        """)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS novas (
                id TEXT PRIMARY KEY, data TEXT, area TEXT,
                nome TEXT, just TEXT, tipo TEXT, exp TEXT,
                cls TEXT, ori TEXT, comp TEXT, modal TEXT,
                viagem TEXT, carga TEXT, di TEXT, df TEXT,
                st_acao TEXT, parts TEXT
            )
        """)
        conn.commit()
        cur.close()
        conn.close()

    def query(sql, params=None, fetch=True):
        conn = get_conn()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(sql, params or [])
        if fetch:
            rows = cur.fetchall()
            cur.close(); conn.close()
            return [dict(r) for r in rows]
        else:
            conn.commit()
            cur.close(); conn.close()

    def execute(sql, params=None):
        query(sql, params, fetch=False)

    def count(sql, params=None):
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(sql, params or [])
        result = cur.fetchone()[0]
        cur.close(); conn.close()
        return result

    PLACEHOLDER = '%s'

else:
    DB = os.path.join(BASE, 'respostas.db')

    def get_conn():
        c = sqlite3.connect(DB)
        c.row_factory = sqlite3.Row
        return c

    def init_db():
        conn = get_conn()
        conn.executescript("""
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
        conn.commit(); conn.close()

    def query(sql, params=None, fetch=True):
        conn = get_conn()
        rows = [dict(r) for r in conn.execute(sql, params or [])]
        conn.close()
        return rows if fetch else None

    def execute(sql, params=None):
        conn = get_conn()
        conn.execute(sql, params or [])
        conn.commit(); conn.close()

    def count(sql, params=None):
        conn = get_conn()
        result = conn.execute(sql, params or []).fetchone()[0]
        conn.close()
        return result

    PLACEHOLDER = '?'

def P(n=1):
    return ','.join([PLACEHOLDER]*n)

@app.route('/')
@app.route('/painel')
def home():
    path = os.path.join(BASE, 'index.html')
    with open(path, encoding='utf-8') as f:
        return f.read()

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

    if d.get('tipo') == 'atualizar':
        for s in d.get('statuses', []):
            rid = ts + '_' + s.get('chapa', '')
            if DATABASE_URL:
                sql = f"""INSERT INTO status VALUES ({P(9)})
                          ON CONFLICT (id) DO UPDATE SET status=EXCLUDED.status"""
            else:
                sql = f"INSERT OR REPLACE INTO status VALUES ({P(9)})"
            execute(sql, (rid, dt, d.get('area',''), s.get('chapa',''),
                         s.get('nome',''), s.get('acao',''), s.get('tipo',''),
                         str(s.get('exp','')), s.get('status','')))

    elif d.get('tipo') == 'nova':
        n = d.get('novaAcao', {})
        parts = '; '.join([p[1] for p in n.get('parts', [])])
        if DATABASE_URL:
            sql = f"INSERT INTO novas VALUES ({P(17)}) ON CONFLICT (id) DO NOTHING"
        else:
            sql = f"INSERT OR REPLACE INTO novas VALUES ({P(17)})"
        execute(sql, (ts, dt, d.get('area',''), n.get('nome',''), n.get('just',''),
                     n.get('tipo',''), n.get('exp',''), n.get('cls',''), n.get('ori',''),
                     n.get('comp',''), n.get('modal',''), n.get('viagem',''),
                     n.get('carga',''), n.get('di',''), n.get('df',''),
                     n.get('status_acao',''), parts))

    return jsonify({'ok': True})

@app.route('/api/respostas')
def api_respostas():
    area = request.args.get('area', '')
    status = request.args.get('status', '')

    q1 = 'SELECT * FROM status WHERE 1=1'
    p1 = []
    if area: q1 += f' AND area={PLACEHOLDER}'; p1.append(area)
    if status: q1 += f' AND status={PLACEHOLDER}'; p1.append(status)
    rows1 = query(q1 + ' ORDER BY data DESC', p1)

    q2 = 'SELECT * FROM novas WHERE 1=1'
    p2 = []
    if area: q2 += f' AND area={PLACEHOLDER}'; p2.append(area)
    rows2 = query(q2 + ' ORDER BY data DESC', p2)

    total = count('SELECT COUNT(*) FROM status')
    real = count(f"SELECT COUNT(*) FROM status WHERE status={PLACEHOLDER}", ['REALIZADO'])
    ar1 = [r['area'] for r in query('SELECT DISTINCT area FROM status ORDER BY area')]
    ar2 = [r['area'] for r in query('SELECT DISTINCT area FROM novas ORDER BY area')]

    return jsonify({
        'st': rows1, 'nv': rows2,
        'stats': {'total': total, 'real': real,
                  'pct': round(real/total*100) if total else 0,
                  'n_nv': len(rows2),
                  'areas': sorted(set(ar1+ar2))}
    })

init_db()

if __name__ == '__main__':
    import webbrowser, threading
    print('Servidor iniciado! Acesse: http://localhost:5000')
    def open_b():
        import time; time.sleep(1.5)
        webbrowser.open('http://localhost:5000')
    threading.Thread(target=open_b, daemon=True).start()
    app.run(host='0.0.0.0', port=5000, debug=False)
