#!/usr/bin/env python3
"""icons: the icon catalogue for decks and reports.

One geometry for the whole system. The `interface` theme is the same geometry as the React package
`@neonglow/icons`, copied verbatim; verify.py fails if the two drift apart. The other themes are the
domain of the fund: capital, company, market, technology, climate, biotech and status.

Rules the brand sets, and this module keeps:
  - **No emoji, ever.** check_icons() reports any emoji it finds in a document.
  - **No unicode character used as an icon.** The only marks that belong to the system are · – — → ×.
  - Geometric, 24 px box, 1.5 stroke, no fill, currentColor. An icon takes the colour of its text.
  - An icon is functional and secondary. It never carries the message of a slide on its own.

icon() fails on a name that does not exist, instead of printing nothing:

    X.icon("funnel")                  -> the SVG
    X.icon("funnnel")                 -> KeyError, with the near names
    X.find_icon("money")              -> ['investment', 'revenue', 'valuation', ...]
    X.check_icons(deck_html)          -> [] when the document is clean
"""
import difflib
import html
import re

E = html.escape

THEMES = ["interface", "capital", "company", "market", "technology", "climate", "biotech", "status"]

# --- interface: the same geometry as packages/icons/src/index.tsx ----------
_INTERFACE = {
    "chevron-down": ('<polyline points="6 9 12 15 18 9" />', "down open expand"),
    "chevron-right": ('<polyline points="9 6 15 12 9 18" />', "right next forward"),
    "chevron-up": ('<polyline points="6 15 12 9 18 15" />', "up close collapse"),
    "chevron-left": ('<polyline points="15 6 9 12 15 18" />', "left back previous"),
    "caret-down": ('<path d="M7 10l5 5 5-5" />', "down menu select"),
    "caret-up": ('<path d="M7 14l5-5 5 5" />', "up menu select"),
    "check": ('<polyline points="4 12 10 18 20 6" />', "done yes tick complete"),
    "x": ('<line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" />',
          "close no cancel remove"),
    "dash": ('<line x1="6" y1="12" x2="18" y2="12" />', "none empty not applicable"),
    "plus": ('<line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />',
             "add new more"),
    "minus": ('<line x1="5" y1="12" x2="19" y2="12" />', "remove less subtract"),
    "search": ('<circle cx="11" cy="11" r="7" /><line x1="16.5" y1="16.5" x2="21" y2="21" />',
               "find look magnifier"),
    "command": ('<path d="M9 6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3z" />',
                "shortcut key"),
    "filter": ('<polygon points="4 5 20 5 14 12.5 14 19 10 21 10 12.5" />',
               "funnel narrow screen stage"),
    "sort": ('<line x1="4" y1="7" x2="16" y2="7" /><line x1="4" y1="12" x2="13" y2="12" />'
             '<line x1="4" y1="17" x2="10" y2="17" /><polyline points="17 14 20 17 23 14" />',
             "order rank arrange"),
    "more-horizontal": ('<circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none" />'
                        '<circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />'
                        '<circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none" />',
                        "menu options ellipsis"),
    "more-vertical": ('<circle cx="12" cy="5" r="1.4" fill="currentColor" stroke="none" />'
                      '<circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />'
                      '<circle cx="12" cy="19" r="1.4" fill="currentColor" stroke="none" />',
                      "menu options ellipsis"),
    "arrow-right": ('<line x1="4" y1="12" x2="20" y2="12" /><polyline points="14 6 20 12 14 18" />',
                    "flow next leads to becomes"),
    "arrow-left": ('<line x1="20" y1="12" x2="4" y2="12" /><polyline points="10 6 4 12 10 18" />',
                   "back return"),
    "arrow-up": ('<line x1="12" y1="20" x2="12" y2="4" /><polyline points="6 10 12 4 18 10" />',
                 "rise increase up"),
    "arrow-down": ('<line x1="12" y1="4" x2="12" y2="20" /><polyline points="6 14 12 20 18 14" />',
                   "fall decrease down"),
    "calendar": ('<rect x="4" y="5" width="16" height="16" rx="1" />'
                 '<line x1="4" y1="9" x2="20" y2="9" /><line x1="8" y1="3" x2="8" y2="6" />'
                 '<line x1="16" y1="3" x2="16" y2="6" />', "date when schedule quarter"),
    "clock": ('<circle cx="12" cy="12" r="8" /><polyline points="12 8 12 12 15 14" />',
              "time hold period delayed late"),
    "info": ('<circle cx="12" cy="12" r="8" /><line x1="12" y1="11" x2="12" y2="16" />'
             '<circle cx="12" cy="8" r=".6" fill="currentColor" stroke="none" />', "note detail"),
    "warning": ('<path d="M12 4l8.5 15h-17z" /><line x1="12" y1="10" x2="12" y2="14" />'
                '<circle cx="12" cy="16.5" r=".6" fill="currentColor" stroke="none" />',
                "risk caution attention caveat"),
    "error": ('<circle cx="12" cy="12" r="8" /><line x1="9" y1="9" x2="15" y2="15" />'
              '<line x1="15" y1="9" x2="9" y2="15" />', "fail rejected wrong written off"),
    "success": ('<circle cx="12" cy="12" r="8" /><polyline points="8 12 11 15 16 9" />',
                "approved on track validated closed won"),
    "drag-handle": ('<circle cx="9" cy="6" r="1.2" fill="currentColor" stroke="none" />'
                    '<circle cx="15" cy="6" r="1.2" fill="currentColor" stroke="none" />'
                    '<circle cx="9" cy="12" r="1.2" fill="currentColor" stroke="none" />'
                    '<circle cx="15" cy="12" r="1.2" fill="currentColor" stroke="none" />'
                    '<circle cx="9" cy="18" r="1.2" fill="currentColor" stroke="none" />'
                    '<circle cx="15" cy="18" r="1.2" fill="currentColor" stroke="none" />',
                    "move reorder"),
    "external-link": ('<path d="M14 5h5v5" /><line x1="19" y1="5" x2="11" y2="13" />'
                      '<path d="M18 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h4" />',
                      "open source reference"),
    "eye": ('<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />'
            '<circle cx="12" cy="12" r="3" />', "watch visible monitor"),
    "eye-off": ('<path d="M2 12s3.5-7 10-7c2.1 0 3.9.7 5.4 1.7M22 12s-3.5 7-10 7'
                'c-2.1 0-3.9-.7-5.4-1.7" /><line x1="4" y1="20" x2="20" y2="4" />',
                "hidden private confidential"),
    "chevron-double": ('<polyline points="6 6 12 12 18 6" /><polyline points="6 13 12 19 18 13" />',
                       "expand all"),
    "folder": ('<path d="M3 7a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1z" />',
               "group category set"),
    "doc": ('<path d="M6 3h8l4 4v14H6z" /><polyline points="14 3 14 7 18 7" />',
            "document report paper file"),
}

# --- capital and deal flow -------------------------------------------------
_CAPITAL = {
    "fund": ('<rect x="4" y="15" width="16" height="4.5" rx="1" />'
             '<rect x="6" y="9.5" width="12" height="4.5" rx="1" />'
             '<rect x="8" y="4" width="8" height="4.5" rx="1" />',
             "vehicle spv capital pool aum commitment"),
    "investment": ('<rect x="3" y="7" width="18" height="10" rx="1.5" />'
                   '<circle cx="12" cy="12" r="2.5" /><line x1="6" y1="12" x2="6.01" y2="12" />'
                   '<line x1="18" y1="12" x2="18.01" y2="12" />',
                   "cheque ticket money deployed entry capital"),
    "valuation": ('<path d="M3.5 11.5V4.5a1 1 0 0 1 1-1h7l9 9-8 8z" />'
                  '<circle cx="7.5" cy="7.5" r="1.3" />', "price tag mark post money worth"),
    "portfolio": ('<rect x="3" y="7" width="18" height="12.5" rx="1.5" />'
                  '<path d="M9 7V5.2a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1V7" />'
                  '<line x1="3" y1="12" x2="21" y2="12" />',
                  "holdings positions companies book"),
    "funnel": ('<path d="M3 5h18l-7 8v6.5l-4 2V13z" />',
               "pipeline stage screen deal flow narrow"),
    "diligence": ('<path d="M6 3h8l4 4v14H6z" /><polyline points="14 3 14 7 18 7" />'
                  '<circle cx="11.5" cy="13.5" r="2.8" />'
                  '<line x1="13.6" y1="15.6" x2="16" y2="18" />',
                  "due diligence review check research deal"),
    "cap-table": ('<rect x="3" y="5" width="18" height="14" rx="1.5" />'
                  '<line x1="3" y1="9.5" x2="21" y2="9.5" />'
                  '<line x1="9" y1="9.5" x2="9" y2="19" /><line x1="15" y1="9.5" x2="15" y2="19" />',
                  "ownership shares equity stake table"),
    "exit": ('<path d="M10 4H5.5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1H10" />'
             '<line x1="20" y1="12" x2="10" y2="12" /><polyline points="16 8 20 12 16 16" />',
             "realised sale acquisition liquidity moic return"),
    "growth": ('<polyline points="3 17 9 11 13 15 21 7" />'
               '<polyline points="15.5 7 21 7 21 12.5" />',
               "up markup increase traction rise above cost"),
    "burn": ('<polyline points="3 7 9 13 13 9 21 17" />'
             '<polyline points="15.5 17 21 17 21 11.5" />',
             "down decline write off below cost loss"),
    # a gauge reading low: the one picture everyone reads as "we are running out"
    "runway": ('<path d="M3.5 18a8.5 8.5 0 1 1 17 0" /><line x1="3.5" y1="18" x2="20.5" y2="18" />'
               '<line x1="12" y1="18" x2="7" y2="12.5" />'
               '<circle cx="12" cy="18" r="1.3" fill="currentColor" stroke="none" />',
               "cash months remaining deadline out of money gauge low"),
    "follow-on": ('<path d="M20 12a8 8 0 1 1-2.4-5.7" /><polyline points="20 3.5 20 8 15.5 8" />',
                  "reserve bridge second cheque again reinvest"),
    "milestone": ('<line x1="6" y1="3" x2="6" y2="21" />'
                  '<path d="M6 4.5h11.5l-2.6 4 2.6 4H6z" />',
                  "target goal gate flag checkpoint"),
    # a panel of three behind a table
    "committee": ('<circle cx="5.5" cy="8" r="2.2" /><path d="M2 15.5a3.5 3.5 0 0 1 7 0" />'
                  '<circle cx="12" cy="6.8" r="2.5" /><path d="M8 15.5a4 4 0 0 1 8 0" />'
                  '<circle cx="18.5" cy="8" r="2.2" /><path d="M15 15.5a3.5 3.5 0 0 1 7 0" />'
                  '<line x1="2.5" y1="19.5" x2="21.5" y2="19.5" />',
                  "board decision vote panel approval"),
    # a person and a coin
    "investor": ('<circle cx="8.5" cy="7.5" r="3" /><path d="M2.5 19.5a6 6 0 0 1 12 0" />'
                 '<circle cx="18" cy="15" r="3.4" /><circle cx="18" cy="15" r="1.3" />',
                 "lp limited partner backer shareholder"),
}

# --- company and team ------------------------------------------------------
_COMPANY = {
    "company": ('<path d="M4 21V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v16" />'
                '<path d="M14 10h5a1 1 0 0 1 1 1v10" /><line x1="7" y1="8" x2="11" y2="8" />'
                '<line x1="7" y1="12" x2="11" y2="12" /><line x1="7" y1="16" x2="11" y2="16" />'
                '<line x1="2.5" y1="21" x2="21.5" y2="21" />',
                "startup business office building firm"),
    "founder": ('<circle cx="12" cy="7.5" r="3.5" /><path d="M5 20.5a7 7 0 0 1 14 0" />',
                "person ceo entrepreneur individual"),
    "team": ('<circle cx="9" cy="7.5" r="3" /><path d="M3 19.5a6 6 0 0 1 12 0" />'
             '<path d="M16.5 5.6a3 3 0 0 1 0 5.8" /><path d="M17.5 14a6 6 0 0 1 3.5 4" />',
             "people staff headcount employees group"),
    "hiring": ('<circle cx="10" cy="7.5" r="3.4" /><path d="M3 20a7 7 0 0 1 13.2-3.2" />'
               '<line x1="19" y1="14" x2="19" y2="20" /><line x1="16" y1="17" x2="22" y2="17" />',
               "recruit add headcount grow team"),
    "board": ('<rect x="4" y="9" width="16" height="6" rx="3" />'
              '<circle cx="8.5" cy="5" r="1.9" /><circle cx="15.5" cy="5" r="1.9" />'
              '<circle cx="8.5" cy="19" r="1.9" /><circle cx="15.5" cy="19" r="1.9" />',
              "governance seat directors meeting table"),
}

# --- market ----------------------------------------------------------------
_MARKET = {
    "market": ('<circle cx="12" cy="12" r="8.5" /><ellipse cx="12" cy="12" rx="3.6" ry="8.5" />'
               '<line x1="3.5" y1="12" x2="20.5" y2="12" />',
               "world global geography tam region"),
    "customer": ('<circle cx="9.5" cy="19" r="1.5" /><circle cx="17" cy="19" r="1.5" />'
                 '<path d="M2.5 4H5l2.6 10.5h10L20 7.5H6.2" />',
                 "buyer demand offtake client sales"),
    "revenue": ('<circle cx="12" cy="12" r="8.5" />'
                '<path d="M15 9.4A3.2 3.2 0 0 0 12 8c-1.7 0-3 .9-3 2s1.3 1.9 3 1.9 3 .9 3 2-1.3 2-3 2'
                'a3.2 3.2 0 0 1-3-1.4" /><line x1="12" y1="6" x2="12" y2="18" />',
                "money sales arr turnover income"),
    "partnership": ('<circle cx="8.8" cy="12" r="5.2" /><circle cx="15.2" cy="12" r="5.2" />',
                    "alliance joint overlap deal partner"),
}

# --- technology ------------------------------------------------------------
_TECHNOLOGY = {
    "lab": ('<path d="M9.5 3v6.2L4.6 18.6A1.4 1.4 0 0 0 5.9 20.7h12.2a1.4 1.4 0 0 0 1.3-2.1L14.5 9.2V3" />'
            '<line x1="8" y1="3" x2="16" y2="3" /><line x1="7" y1="14" x2="17" y2="14" />',
            "flask experiment chemistry rnd science"),
    "research": ('<line x1="3.5" y1="21" x2="20.5" y2="21" />'
                 '<path d="M7 21v-1.5a5 5 0 0 1 5-5h1.5" />'
                 '<line x1="4" y1="16.5" x2="11" y2="16.5" />'
                 '<rect x="12.5" y="3" width="5.5" height="11" rx="2.7" />'
                 '<line x1="15.25" y1="14" x2="15.25" y2="16.5" />',
                 "microscope science study paper lab"),
    "patent": ('<path d="M12 3l7.5 3.2v5.8c0 4.6-3.2 8-7.5 9.4-4.3-1.4-7.5-4.8-7.5-9.4V6.2z" />'
               '<polyline points="9 12 11.2 14.2 15.2 10" />',
               "ip protection shield granted moat"),
    "prototype": ('<path d="M12 3l8 4.6v8.8L12 21l-8-4.6V7.6z" />'
                  '<polyline points="4 7.6 12 12.2 20 7.6" /><line x1="12" y1="12.2" x2="12" y2="21" />',
                  "mvp cube unit product build trl"),
    "factory": ('<path d="M3 21v-9.5l6 3.5v-3.5l6 3.5V7l6 3.5V21z" />'
                '<line x1="2" y1="21" x2="22" y2="21" />'
                '<line x1="7" y1="18" x2="7" y2="18.01" />',
                "plant manufacturing scale up production industrial"),
    "data": ('<ellipse cx="12" cy="6" rx="7.5" ry="2.8" />'
             '<path d="M4.5 6v12c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8V6" />'
             '<path d="M4.5 12c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8" />',
             "database dataset records storage"),
    "ai": ('<circle cx="12" cy="12" r="2.6" /><circle cx="5" cy="5.5" r="1.8" />'
           '<circle cx="19" cy="5.5" r="1.8" /><circle cx="5" cy="18.5" r="1.8" />'
           '<circle cx="19" cy="18.5" r="1.8" /><line x1="6.3" y1="6.8" x2="10.2" y2="10.3" />'
           '<line x1="17.7" y1="6.8" x2="13.8" y2="10.3" />'
           '<line x1="6.3" y1="17.2" x2="10.2" y2="13.7" />'
           '<line x1="17.7" y1="17.2" x2="13.8" y2="13.7" />',
           "model machine learning network algorithm"),
    "software": ('<polyline points="9 6.5 3.5 12 9 17.5" /><polyline points="15 6.5 20.5 12 15 17.5" />',
                 "code platform saas digital"),
    "hardware": ('<rect x="7" y="7" width="10" height="10" rx="1.5" />'
                 '<line x1="9.5" y1="3.5" x2="9.5" y2="7" /><line x1="14.5" y1="3.5" x2="14.5" y2="7" />'
                 '<line x1="9.5" y1="17" x2="9.5" y2="20.5" />'
                 '<line x1="14.5" y1="17" x2="14.5" y2="20.5" />'
                 '<line x1="3.5" y1="9.5" x2="7" y2="9.5" /><line x1="3.5" y1="14.5" x2="7" y2="14.5" />'
                 '<line x1="17" y1="9.5" x2="20.5" y2="9.5" />'
                 '<line x1="17" y1="14.5" x2="20.5" y2="14.5" />',
                 "chip device sensor equipment deep tech"),
}

# --- climate ---------------------------------------------------------------
_CLIMATE = {
    "emissions": ('<path d="M5.5 21V9.5" /><path d="M10 21V9.5" />'
                  '<path d="M4.8 9.5h5.9L9.9 4.2H5.6z" />'
                  '<path d="M13.5 7.5c1.4 0 1.4 1.8 2.8 1.8s1.4-1.8 2.8-1.8" />'
                  '<path d="M13.5 12.5c1.4 0 1.4 1.8 2.8 1.8s1.4-1.8 2.8-1.8" />',
                  "co2 scope chimney pollution footprint"),
    "carbon": ('<path d="M7 13.5a3.6 3.6 0 0 1 .6-7.2 5 5 0 0 1 9.5 1.5 3.1 3.1 0 0 1-.6 5.7" />'
               '<line x1="12" y1="12" x2="12" y2="21" />'
               '<polyline points="8.8 17.8 12 21 15.2 17.8" />',
               "capture sequestration removal offset drawdown"),
    "renewable": ('<path d="M20 12a8 8 0 0 1-13.7 5.7" />'
                  '<polyline points="3.5 20 3.5 14.8 8.7 14.8" />'
                  '<path d="M4 12a8 8 0 0 1 13.7-5.7" />'
                  '<polyline points="20.5 4 20.5 9.2 15.3 9.2" />',
                  "clean energy cycle regenerate renew"),
    "solar": ('<circle cx="12" cy="5.5" r="2.6" /><line x1="12" y1="0.8" x2="12" y2="2" />'
              '<line x1="7.8" y1="2.6" x2="8.6" y2="3.6" /><line x1="16.2" y1="2.6" x2="15.4" y2="3.6" />'
              '<path d="M4.5 20.5h15l-2.2-8.5H6.7z" /><line x1="5.6" y1="16.2" x2="18.4" y2="16.2" />'
              '<line x1="11.2" y1="12" x2="10.4" y2="20.5" />'
              '<line x1="12.8" y1="12" x2="13.6" y2="20.5" />',
              "pv panel sun photovoltaic"),
    "wind": ('<line x1="12" y1="12.8" x2="12" y2="21" /><line x1="9" y1="21" x2="15" y2="21" />'
             '<circle cx="12" cy="11.2" r="1.4" /><line x1="12" y1="9.8" x2="12" y2="3" />'
             '<line x1="13.2" y1="12" x2="19.2" y2="15" />'
             '<line x1="10.8" y1="12" x2="4.8" y2="15" />',
             "turbine power generation offshore"),
    "battery": ('<rect x="2.5" y="8" width="16.5" height="9" rx="1.8" />'
                '<line x1="21.5" y1="11" x2="21.5" y2="14" />'
                '<line x1="6.5" y1="11" x2="6.5" y2="14" /><line x1="10.5" y1="11" x2="10.5" y2="14" />',
                "storage charge cell energy"),
    "grid": ('<line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" />'
             '<line x1="9" y1="3" x2="9" y2="21" /><line x1="15" y1="3" x2="15" y2="21" />'
             '<circle cx="9" cy="9" r="1.6" fill="currentColor" stroke="none" />',
             "network distribution utility infrastructure"),
    "water": ('<path d="M12 3.2s6.2 6.6 6.2 10.6a6.2 6.2 0 0 1-12.4 0C5.8 9.8 12 3.2 12 3.2z" />',
              "droplet irrigation blue scarcity"),
    "waste": ('<line x1="3.5" y1="7" x2="20.5" y2="7" />'
              '<path d="M6 7l1 13.5h10L18 7" />'
              '<path d="M9.5 7V4.2a.8.8 0 0 1 .8-.8h3.4a.8.8 0 0 1 .8.8V7" />'
              '<line x1="10" y1="11" x2="10.4" y2="17" /><line x1="14" y1="11" x2="13.6" y2="17" />',
              "residue byproduct landfill disposal"),
    "circular": ('<path d="M5.5 9.2A7.6 7.6 0 0 1 18.2 7.4" />'
                 '<polyline points="18.6 3.2 18.8 7.8 14.2 8" />'
                 '<path d="M18.5 14.8A7.6 7.6 0 0 1 5.8 16.6" />'
                 '<polyline points="5.4 20.8 5.2 16.2 9.8 16" />',
                 "loop recycle reuse closed valorisation"),
    "leaf": ('<path d="M4.5 19.5C4.5 10.5 10.5 4.5 20 4.5c0 9.5-5.5 15-15 15z" />'
             '<line x1="4.5" y1="19.5" x2="13" y2="11" />',
             "nature biodiversity bio green plant"),
    "soil": ('<line x1="3" y1="13" x2="21" y2="13" /><line x1="3" y1="17" x2="21" y2="17" />'
             '<line x1="3" y1="21" x2="21" y2="21" /><line x1="12" y1="13" x2="12" y2="5" />'
             '<path d="M12 8.5c0-2 1.5-3.2 3.6-3.2" />'
             '<path d="M12 10.5c0-2-1.5-3.2-3.6-3.2" />',
             "agriculture land regenerative farm crop"),
    "forest": ('<path d="M7 12.5H3.2L7 6.2l3.8 6.3H7z" />'
               '<path d="M7 16.5H3.8L7 11.2l3.2 5.3H7z" /><line x1="7" y1="16.5" x2="7" y2="21" />'
               '<path d="M17 11.5h-3.4L17 5.8l3.4 5.7H17z" />'
               '<line x1="17" y1="11.5" x2="17" y2="21" /><line x1="3" y1="21" x2="21" y2="21" />',
               "tree forestry carbon sink land use"),
}

# --- biotech ---------------------------------------------------------------
_BIOTECH = {
    "dna": ('<path d="M8 3c0 6 8 6 8 9s-8 3-8 9" /><path d="M16 3c0 6-8 6-8 9s8 3 8 9" />'
            '<line x1="9.6" y1="6.5" x2="14.4" y2="6.5" /><line x1="8.2" y1="12" x2="15.8" y2="12" />'
            '<line x1="9.6" y1="17.5" x2="14.4" y2="17.5" />',
            "genomics gene helix sequence genetic"),
    "cell": ('<circle cx="12" cy="12" r="8.5" /><circle cx="13.2" cy="10.8" r="2.6" />'
             '<circle cx="8.2" cy="14.8" r="1.1" />',
             "biology culture strain organism microbe"),
    "molecule": ('<circle cx="5.8" cy="17.2" r="2.5" /><circle cx="18.2" cy="17.2" r="2.5" />'
                 '<circle cx="12" cy="6" r="2.5" /><line x1="7.3" y1="15.2" x2="10.5" y2="8" />'
                 '<line x1="16.7" y1="15.2" x2="13.5" y2="8" />'
                 '<line x1="8.3" y1="17.2" x2="15.7" y2="17.2" />',
                 "compound chemistry ingredient structure"),
    "bioreactor": ('<rect x="6" y="5.5" width="12" height="15" rx="2" />'
                   '<line x1="6" y1="11" x2="18" y2="11" />'
                   '<circle cx="9.8" cy="15.5" r="1.1" /><circle cx="14.2" cy="17.5" r="1.4" />'
                   '<circle cx="12.4" cy="13.6" r=".8" />'
                   '<line x1="9" y1="2.5" x2="9" y2="5.5" /><line x1="15" y1="2.5" x2="15" y2="5.5" />',
                   "fermentation tank vessel precision scale"),
    "clinical-trial": ('<rect x="5" y="4" width="14" height="17" rx="1.8" />'
                       '<path d="M9.2 4V3a1 1 0 0 1 1-1h3.6a1 1 0 0 1 1 1v1" />'
                       '<line x1="12" y1="10" x2="12" y2="16" />'
                       '<line x1="9" y1="13" x2="15" y2="13" />',
                       "study trial protocol phase patient"),
    "regulatory": ('<path d="M12 3l7.5 3.2v5.8c0 4.6-3.2 8-7.5 9.4-4.3-1.4-7.5-4.8-7.5-9.4V6.2z" />'
                   '<line x1="8.8" y1="11" x2="15.2" y2="11" />'
                   '<line x1="8.8" y1="14" x2="13.2" y2="14" />',
                   "approval efsa fda novel food compliance"),
    "sequencing": ('<line x1="4" y1="8.5" x2="4" y2="15.5" /><line x1="8" y1="4.5" x2="8" y2="19.5" />'
                   '<line x1="12" y1="9.5" x2="12" y2="14.5" />'
                   '<line x1="16" y1="3.5" x2="16" y2="20.5" />'
                   '<line x1="20" y1="7" x2="20" y2="17" />',
                   "read genome assay signal spectrum"),
    "protein": ('<path d="M4 18.5c2.5-5.5 4.5 1.5 6.5-3.5s3 3.5 5 0 1-5.5 3.5-6.5" />'
                '<circle cx="4" cy="18.5" r="1.6" /><circle cx="19" cy="8.5" r="1.6" />',
                "chain fold alternative amino peptide"),
}

# --- status ----------------------------------------------------------------
_STATUS = {
    "blocked": ('<circle cx="12" cy="12" r="8.5" /><line x1="6" y1="6" x2="18" y2="18" />',
                "stopped halted no entry stuck"),
    "decision": ('<path d="M12 2.8L21.2 12 12 21.2 2.8 12z" />'
                 '<line x1="12" y1="8.5" x2="12" y2="13" />'
                 '<circle cx="12" cy="16" r=".7" fill="currentColor" stroke="none" />',
                 "choice fork gate go no go"),
    "question": ('<circle cx="12" cy="12" r="8.5" />'
                 '<path d="M9.6 9.3A2.6 2.6 0 0 1 14.6 10c0 1.8-2.6 2.1-2.6 3.7" />'
                 '<circle cx="12" cy="17" r=".7" fill="currentColor" stroke="none" />',
                 "open unknown to confirm unresolved"),
    "target": ('<circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.2" />'
               '<circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />',
               "goal objective aim plan benchmark"),
    "location": ('<path d="M12 21.2s7-6.4 7-11.2a7 7 0 1 0-14 0c0 4.8 7 11.2 7 11.2z" />'
                 '<circle cx="12" cy="10" r="2.6" />',
                 "place site hq country where geography"),
}

_SOURCES = [("interface", _INTERFACE), ("capital", _CAPITAL), ("company", _COMPANY),
            ("market", _MARKET), ("technology", _TECHNOLOGY), ("climate", _CLIMATE),
            ("biotech", _BIOTECH), ("status", _STATUS)]

ICONS = {}
for _theme, _set in _SOURCES:
    for _name, (_body, _words) in _set.items():
        ICONS[_name] = dict(theme=_theme, body=_body, words=_words)

# A few names point at one geometry. An alias is a second way to find the same icon, not a copy.
ALIASES = {
    "on-track": "success", "approved": "success", "validated": "success",
    "rejected": "error", "written-off": "error", "risk": "warning", "caveat": "warning",
    "delayed": "clock", "pipeline": "funnel", "microscope": "research",
    "lp": "investor", "moic": "exit", "co2": "emissions", "recycle": "circular",
    "source": "doc", "person": "founder", "people": "team", "globe": "market",
}


def resolve(name):
    """The real name behind an alias."""
    return ALIASES.get(name, name)


def icon(name, size=24, stroke=1.5, title=None, style=""):
    """One icon as inline SVG. It takes the colour of the text around it.

    It raises on a name that does not exist, instead of printing nothing. size in px on a 24 px box;
    the stroke scales with it. title gives the icon an accessible name; leave it out when the icon only
    repeats the text beside it."""
    real = resolve(name)
    if real not in ICONS:
        near = find_icon(name)
        hint = f" Did you mean: {', '.join(near[:5])}?" if near else " Run find_icon() to search."
        raise KeyError(f"there is no icon named {name!r}.{hint}")
    label = f"<title>{E(title)}</title>" if title else ""
    aria = f'role="img"' if title else 'aria-hidden="true"'
    return (f'<svg class="av-icon" width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" '
            f'stroke="currentColor" stroke-width="{stroke}" stroke-linecap="round" '
            f'stroke-linejoin="round" {aria} data-icon="{real}"'
            + (f' style="{style}"' if style else "")
            + f">{label}{ICONS[real]['body']}</svg>")


def find_icon(query, theme=None):
    """The icons whose name, theme or keywords match the query.

    Ranked: the exact name, then a name that contains the query, then a keyword. When nothing matches,
    it falls back to the nearest names, so a typo still gets an answer."""
    q = query.lower().strip()
    exact, partial, keyword = [], [], []
    pool = {n: s for n, s in ICONS.items() if not theme or s["theme"] == theme}
    for name, spec in pool.items():
        words = spec["words"].split()
        if name == q or q in words:
            exact.append(name)
        elif q in name or spec["theme"] == q:
            partial.append(name)
        # a keyword may contain the query; the reverse only for a word long enough to mean something,
        # otherwise "on" inside "carbon" matches everything that is on track
        elif any(q in w or (len(w) >= 4 and w in q) for w in words):
            keyword.append(name)
    for alias, real in ALIASES.items():
        if q in alias and real in pool and real not in exact + partial + keyword:
            partial.append(real)
    found = exact + sorted(partial) + sorted(keyword)
    if found:
        return found
    return difflib.get_close_matches(q, list(pool) + list(ALIASES), n=5, cutoff=0.6)


def by_theme(theme):
    """Every icon of a theme, in the order they are declared."""
    return [n for n, s in ICONS.items() if s["theme"] == theme]


# Emoji and the unicode marks that are used as icons. The brand forbids both.
# The only marks that belong to the system are the middot, the en dash, the em dash,
# the rightward arrow (money flow only) and the multiplication sign (the MOIC unit).
_EMOJI = re.compile(
    "[\U0001F000-\U0001FAFF\U00002600-\U000027BF\U0001F1E6-\U0001F1FF\U00002B00-\U00002BFF"
    "\U0000FE0F\U00002190-\U000021FF\U00002700-\U000027BF]")
_ALLOWED_MARKS = set("·–—→×")
_FAKE_ICONS = set("✓✔✗✘★☆●◆▶▲▼■□→←↑↓⇒⇑✦✱❯❮")


def check_icons(document_html):
    """Every icon problem in a built deck. An empty list means the document is clean.

    It reports three things: an icon name that does not exist, an emoji, and a unicode character used
    as an icon. Run it before you deliver."""
    problems = []
    for name in sorted(set(re.findall(r'data-icon="([^"]+)"', document_html))):
        if name not in ICONS:
            problems.append(f"unknown icon: {name}")
    text = re.sub(r"<(script|style)\b.*?</\1>", "", document_html, flags=re.S)
    text = re.sub(r"<[^>]+>", " ", text)
    for ch in sorted(set(text)):
        if ch in _ALLOWED_MARKS:
            continue
        if ch in _FAKE_ICONS:
            problems.append(f"unicode character used as an icon: {ch!r}. Use icon() instead.")
        elif _EMOJI.match(ch):
            problems.append(f"emoji: {ch!r}. The brand allows none.")
    return problems


CSS = """
/* ---- icons: functional and secondary, never the message of a slide ---- */
.av-icon{display:inline-block;vertical-align:-0.15em;flex:none;}
.icon-row{display:flex;align-items:flex-start;gap:14px;}
.icon-row .t{min-width:0;}
.icon-label{display:inline-flex;align-items:center;gap:10px;font-size:var(--fs-body-sm);
color:var(--ink-2);}
.ink .icon-label{color:var(--grey-d8);}
.icon-box{display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;
border:1.5px solid var(--rule-light);border-radius:var(--radius);color:var(--ink);flex:none;}
.ink .icon-box{border-color:var(--rule-dark-light);color:var(--paper);}
.icon-box.filled{background:var(--accent);border-color:var(--accent);color:var(--accent-ink);}
"""


def icon_label(name, text, size=20):
    """An icon and one line of text. The icon supports the text; it never replaces it."""
    return f'<span class="icon-label">{icon(name, size)}<span>{E(text)}</span></span>'


def icon_box(name, size=28, filled=False):
    """An icon in a box, for the head of a card. filled puts it on the accent."""
    return f'<span class="icon-box{" filled" if filled else ""}">{icon(name, size)}</span>'
