"""
navigate.py — a tiny local transit navigator.

This is a rebuild of my "navigate" project so it can run on the website.
It runs unmodified in the browser through Pyodide: the page calls
`network()` to draw the map and `route(a, b)` to get an itinerary.
No JavaScript does any of the searching.

    $ python3 navigate.py Gare Nord Parc
"""

import heapq
import json
import sys
from datetime import datetime, timedelta

# --- the network -----------------------------------------------------------
# station -> (x, y) on a 100x100 grid, used only for drawing
STATIONS = {
    "Gare Nord": (50, 8),
    "Marché": (30, 22),
    "Université": (70, 22),
    "Centre": (50, 38),
    "Opéra": (28, 45),
    "Pont": (72, 45),
    "Parc": (12, 62),
    "Stade": (88, 62),
    "Hôpital": (50, 60),
    "Port": (35, 78),
    "Aéroport": (90, 88),
    "Gare Sud": (52, 92),
}

# lines: name -> (colour, ordered stops)
LINES = {
    "M1": ("#f38ba8", ["Gare Nord", "Centre", "Hôpital", "Gare Sud"]),
    "M2": ("#89b4fa", ["Parc", "Opéra", "Centre", "Pont", "Stade"]),
    "T3": ("#a6e3a1", ["Marché", "Opéra", "Port", "Gare Sud", "Aéroport"]),
    "T4": ("#f9e2af", ["Université", "Pont", "Hôpital", "Port"]),
}

TRANSFER_MIN = 4       # walking between platforms
DWELL_MIN = 0.5        # stop at each station


def travel_minutes(a, b):
    """Straight-line distance on the grid, scaled to roughly city speeds."""
    (x1, y1), (x2, y2) = STATIONS[a], STATIONS[b]
    return round(((x1 - x2) ** 2 + (y1 - y2) ** 2) ** 0.5 / 5, 1) + DWELL_MIN


def build_graph():
    """station -> list of (neighbour, line, minutes)"""
    graph = {s: [] for s in STATIONS}
    for line, (_, stops) in LINES.items():
        for a, b in zip(stops, stops[1:]):
            m = travel_minutes(a, b)
            graph[a].append((b, line, m))
            graph[b].append((a, line, m))
    return graph


GRAPH = build_graph()


# --- the search ------------------------------------------------------------
def dijkstra(start, goal):
    """
    Dijkstra over (station, line) states so that changing line costs
    TRANSFER_MIN. Returns the list of (station, line) hops, or None.
    """
    done = set()
    dist = {(start, None): 0.0}
    prev = {}
    queue = [(0.0, start, None)]
    while queue:
        cost, station, line = heapq.heappop(queue)
        if (station, line) in done:
            continue
        done.add((station, line))
        if station == goal:
            return unwind(prev, (station, line)), cost
        for nxt, nxt_line, minutes in GRAPH[station]:
            step = minutes + (TRANSFER_MIN if line and nxt_line != line else 0)
            state = (nxt, nxt_line)
            if cost + step < dist.get(state, float("inf")):
                dist[state] = cost + step
                prev[state] = (station, line)
                heapq.heappush(queue, (cost + step, nxt, nxt_line))
    return None, None


def unwind(prev, state):
    path = [state]
    while state in prev:
        state = prev[state]
        path.append(state)
    return list(reversed(path))


# --- what the page (or the CLI) asks for -----------------------------------
def network():
    return json.dumps({
        "stations": STATIONS,
        "lines": {k: {"colour": c, "stops": s} for k, (c, s) in LINES.items()},
    })


def route(start, goal, now=None):
    if start not in STATIONS or goal not in STATIONS:
        return json.dumps({"error": "unknown station"})
    if start == goal:
        return json.dumps({"error": "you are already there"})

    hops, total = dijkstra(start, goal)
    if not hops:
        return json.dumps({"error": "no route"})

    # group consecutive hops on the same line into legs
    legs = []
    for (station, line) in hops[1:]:
        if legs and legs[-1]["line"] == line:
            legs[-1]["to"] = station
            legs[-1]["stops"] += 1
        else:
            legs.append({"line": line, "from": legs[-1]["to"] if legs else start,
                         "to": station, "stops": 1})

    now = now or datetime.now()
    eta = now + timedelta(minutes=total)
    return json.dumps({
        "path": [s for s, _ in hops],
        "legs": legs,
        "minutes": round(total),
        "transfers": len(legs) - 1,
        "depart": now.strftime("%H:%M"),
        "eta": eta.strftime("%H:%M"),
    })


def describe(start, goal):
    """Human-readable itinerary, like the CLI prints."""
    r = json.loads(route(start, goal))
    if "error" in r:
        return f"navigate: {r['error']}"
    out = [f"{start} -> {goal}   depart {r['depart']}   ETA {r['eta']}   ({r['minutes']} min, {r['transfers']} transfer{'s' if r['transfers'] != 1 else ''})"]
    for i, leg in enumerate(r["legs"], 1):
        out.append(f"  {i}. take {leg['line']:<3} {leg['from']} -> {leg['to']}   ({leg['stops']} stop{'s' if leg['stops'] != 1 else ''})")
    return "\n".join(out)


if __name__ == "__main__":
    if len(sys.argv) >= 3:
        print(describe(sys.argv[1], sys.argv[2]))
    else:
        print("usage: navigate.py <from> <to>")
        print("stations:", ", ".join(STATIONS))
