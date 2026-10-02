"""Watermark shown on every Plotly chart: the Sandworm mark and wordmark, faint, centred."""
from . import tokens as t

# Template items need a name: Plotly adds named items to every figure that
# uses the template, and a figure can restyle or hide one by that name.
NAME = "sandworm-watermark"

# apps/web SandwormLogo as an SVG data URI, so charts need no network request for it.
LOGO_URI = "data:image/svg+xml;base64," + (
    "PHN2ZyB2aWV3Qm94PSIwIDAgMTMzIDEzMyIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIw"
    "MDAvc3ZnIiA+PHJlY3QgeD0iNC4xNTYyNSIgeT0iNC4xNTYyNSIgd2lkdGg9IjEyNC42ODgiIGhlaWdodD0iMTI0"
    "LjY4OCIgcng9IjYyLjM0MzgiIGZpbGw9IiNGRUVEQjciLz48cmVjdCB4PSI0LjE1NjI1IiB5PSI0LjE1NjI1IiB3"
    "aWR0aD0iMTI0LjY4OCIgaGVpZ2h0PSIxMjQuNjg4IiByeD0iNjIuMzQzOCIgc3Ryb2tlPSIjMUEzQzQ0IiBzdHJv"
    "a2Utd2lkdGg9IjguMzEyNSIvPjxwYXRoIGQ9Ik0yNC42ODEyIDY2LjgxNDdDMjMuMTg4MiA2OC4wMTkxIDIyLjMy"
    "MDMgNjkuODM0NCAyMi4zMjAzIDcxLjc1MjZDMjIuMzIwMyA3Ny4wODQ2IDI4LjQ5ODUgODAuMDM4NCAzMi42NDg0"
    "IDc2LjY5MDZMMzcuMjM2MiA3Mi45ODk1TDI4LjgxNTcgNjMuNDc5M0wyNC42ODEyIDY2LjgxNDdaIiBmaWxsPSIj"
    "RkU3RTRFIi8+PHBhdGggZD0iTTMyLjk1MDEgNjAuMTQ0TDI4LjgxNTcgNjMuNDc5M0wzNy4yMzYyIDcyLjk4OTVM"
    "NDEuODI0MSA2OS4yODgzQzQyLjkzNzkgNjguMzg5OCA0NC4xODAyIDY3LjcxNDkgNDUuNDg4MSA2Ny4yNzAyTDM3"
    "LjIzNjIgNTcuMzAzMUMzNS43NDA1IDU4LjEwMzggMzQuMzA0NiA1OS4wNTEyIDMyLjk1MDEgNjAuMTQ0WiIgZmls"
    "bD0iI0QzNUEzNCIvPjxwYXRoIGQ9Ik00NS40ODgxIDY3LjI3MDJDNDguNDg1NiA2Ni4yNTExIDUxLjgyNzIgNjYu"
    "NDQxNSA1NC43NTQxIDY3LjkyMThMNTcuNzE1NSA1NS4xMDY0QzUwLjg5MyA1My4xNjIzIDQzLjUzMzcgNTMuOTMy"
    "IDM3LjIzNjIgNTcuMzAzMUw0NS40ODgxIDY3LjI3MDJaIiBmaWxsPSIjRkU3RjRFIi8+PHBhdGggZD0iTTU0Ljc1"
    "NDEgNjcuOTIxOEw2Ni41MTA2IDczLjg2NzZMNzIuMzg4OSA2Mi4yNTM1TDY2LjUxMDYgNTkuMjgwNUw2NC4yNzc3"
    "IDU3Ljk0NTlDNjIuMTg4NiA1Ni42OTcyIDU5Ljk4MTYgNTUuNzUyMSA1Ny43MTU1IDU1LjEwNjRMNTQuNzU0MSA2"
    "Ny45MjE4WiIgZmlsbD0iI0I3NDIyNSIvPjxwYXRoIGQ9Ik02Ni41MTA2IDczLjg2NzZMNjguNzQzNiA3NS4yMDIz"
    "QzcxLjQyMiA3Ni44MDMyIDc0LjI5NDEgNzcuOTA1MiA3Ny4yMzY0IDc4LjUxNjlMODEuNTg4OSA2Ni4zMzM1Qzgw"
    "LjQ1MTEgNjYuMTMyNSA3OS4zMzE3IDY1Ljc2NDggNzguMjY3MiA2NS4yMjY0TDcyLjM4ODkgNjIuMjUzNUw2Ni41"
    "MTA2IDczLjg2NzZaIiBmaWxsPSIjRDE1QjMzIi8+PHBhdGggZD0iTTgxLjU4ODkgNjYuMzMzNUw3Ny4yMzY0IDc4"
    "LjUxNjlDODIuODc3NCA3OS42ODk3IDg4Ljc3NjQgNzkuMDYwNiA5NC4wNjMyIDc2LjY5MDZMODguODIwMyA2NS4z"
    "NTUyQzg2LjU2NyA2Ni40MjY4IDg0LjAzNTUgNjYuNzY1OCA4MS41ODg5IDY2LjMzMzVaIiBmaWxsPSIjQjc0MjI1"
    "Ii8+PHBhdGggZD0iTTkxLjE5NzEgNjMuODU5OUM5MC40NTU2IDY0LjQ1ODEgODkuNjU3MiA2NC45NTcxIDg4Ljgy"
    "MDMgNjUuMzU1Mkw5NC4wNjMyIDc2LjY5MDZDOTYuMTgzIDc1Ljc0MDQgOTguMjA0MyA3NC41MTAzIDEwMC4wNzEg"
    "NzMuMDA0MkwxMDQuMjA2IDY5LjY2ODlMOTUuNzg1IDYwLjE1ODdMOTEuMTk3MSA2My44NTk5WiIgZmlsbD0iI0Qz"
    "NUIzMyIvPjxwYXRoIGQ9Ik0xMDguMzQgNjYuMzMzNUMxMDkuODMzIDY1LjEyOTEgMTEwLjcwMSA2My4zMTM4IDEx"
    "MC43MDEgNjEuMzk1NkMxMTAuNzAxIDU2LjA2MzYgMTA0LjUyMyA1My4xMDk3IDEwMC4zNzMgNTYuNDU3Nkw5NS43"
    "ODUgNjAuMTU4N0wxMDQuMjA2IDY5LjY2ODlMMTA4LjM0IDY2LjMzMzVaIiBmaWxsPSIjQjc0MjI1Ii8+PC9zdmc+"
)


def layout() -> dict:
    """Template layout entries: mark then wordmark, side by side."""
    # The two meet at x=0.4, not 0.5: the wordmark is the wider half, so
    # anchoring left of centre is what centres the pair on a full-width chart.
    return {
        "images": [
            {
                "name": NAME,
                "source": LOGO_URI,
                "xref": "paper",
                "yref": "paper",
                "x": 0.4,
                "y": 0.5,
                "xanchor": "right",
                "yanchor": "middle",
                "sizex": 0.08,
                "sizey": 0.2,
                "sizing": "contain",
                "opacity": 0.14,
                "layer": "above",
            }
        ],
        "annotations": [
            {
                "name": NAME,
                "text": "<b>SANDWORM</b>",
                "xref": "paper",
                "yref": "paper",
                "x": 0.4,
                "y": 0.5,
                "xanchor": "left",
                "yanchor": "middle",
                "xshift": 10,
                "showarrow": False,
                "font": {"family": t.FONT_STACK, "size": 34, "color": "rgba(111, 100, 120, 0.18)"},
            }
        ],
    }
