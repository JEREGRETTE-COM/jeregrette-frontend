#!/usr/bin/env python3
"""Chronomètre l'API jeregrette sans passer par le site.

But : savoir si une lenteur vient du backend (API lente) ou du front (API
rapide, site lent). Le mot de passe est demandé sans être affiché, le token
n'est jamais écrit, et la session de test est fermée à la fin.

Usage : python3 scripts/mesure-api.py
"""
import getpass
import http.client
import json
import time

HOST = "jeregrette-api.benrango.com"
SLOW_MS, OK_MS = 800, 300

# One kept-alive connection, like the Next.js server does.
conn = http.client.HTTPSConnection(HOST, timeout=30)


def call(method, path, token=None, body=None):
    headers = {"Accept": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    data = None
    if body is not None:
        data = json.dumps(body)
        headers["Content-Type"] = "application/json"
    start = time.perf_counter()
    conn.request(method, "/api" + path, body=data, headers=headers)
    res = conn.getresponse()
    raw = res.read()
    ms = (time.perf_counter() - start) * 1000
    try:
        payload = json.loads(raw) if raw else None
    except ValueError:
        payload = None
    return res.status, ms, payload


def show(label, status, ms, extra=""):
    flag = "rapide" if ms < OK_MS else "moyen " if ms < SLOW_MS else "LENT  "
    print(f"  [{flag}] {label:<40} http={status}  {ms:6.0f} ms  {extra}")
    if status == 429:
        print("  ⚠️  Limite de 30 appels/minute atteinte : attends 1 minute et relance.")


def find_token(node):
    if isinstance(node, dict):
        if isinstance(node.get("access_token"), str):
            return node["access_token"]
        for value in node.values():
            found = find_token(value)
            if found:
                return found
    return None


def items(payload):
    data = (payload or {}).get("data")
    return data if isinstance(data, list) else []


print(f"\n=== API {HOST}\n")
status, ms, _ = call("GET", "/public/posts")
show("1er appel (inclut connexion + TLS)", status, ms)
status, ms, payload = call("GET", "/public/posts")
show("GET /public/posts (sans compte)", status, ms, f"{len(items(payload))} posts")

identifier = input("\nIdentifiant ou email (laisser vide = test sans compte) : ").strip()
if identifier:
    password = getpass.getpass("Mot de passe (rien ne s'affiche) : ")
    body = {"email" if "@" in identifier else "username": identifier, "password": password}
    status, ms, payload = call("POST", "/auth/login", body=body)
    del password, body
    token = find_token(payload)
    show("POST /auth/login", status, ms)

    if not token:
        print("  Connexion refusée : vérifie l'identifiant et le mot de passe.")
    else:
        timings = []
        for label, path in [
            ("GET /users/me", "/users/me"),
            ("GET /notifications?limit=1", "/notifications?limit=1"),
            ("GET /posts?limit=50 (fil)", "/posts?limit=50"),
            ("GET /users/me/posts (profil)", "/users/me/posts"),
        ]:
            status, ms, payload = call("GET", path, token)
            show(label, status, ms, f"{len(items(payload))} posts" if "posts" in path else "")
            timings.append(ms)
            if path == "/users/me/posts":
                my_posts = items(payload)

        reacted = [p["id"] for p in my_posts if p.get("reactions_count", 0) > 0][:8]
        reaction_ms = []
        for post_id in reacted:
            status, ms, _ = call("GET", f"/posts/{post_id}/reactions", token)
            reaction_ms.append(ms)
        if reaction_ms:
            avg = sum(reaction_ms) / len(reaction_ms)
            show(f"GET /posts/{{id}}/reactions × {len(reaction_ms)}", 200, avg, "(moyenne par appel)")

        call("POST", "/auth/logout", token)
        token = None
        print("  Session de test fermée.")

        page = timings[0] + timings[3] + (sum(reaction_ms) / 8 if reaction_ms else 0)
        print(f"\n  Temps d'API estimé pour ouvrir ton profil : ~{page:.0f} ms"
              f" ({len(reaction_ms)} compteurs de réactions inclus)")

print("""
=== Comment lire le résultat
  • Beaucoup de [LENT] (plus de 800 ms)   → la lenteur vient du backend.
  • Tout [rapide] mais le site reste lent → front, Vercel ou réseau.
  • Compare avec le site : F12 > Réseau > la page > « Attente du serveur (TTFB) ».
""")
