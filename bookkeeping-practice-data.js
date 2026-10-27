(function(){"use strict";window.BookkeepingPracticeData={
  "version": 1,
  "accounts": [
    {
      "code": "1100",
      "name": "Bank",
      "type": "asset"
    },
    {
      "code": "1300",
      "name": "Debiteuren",
      "type": "asset"
    },
    {
      "code": "0200",
      "name": "Inventaris",
      "type": "asset"
    },
    {
      "code": "0290",
      "name": "Cumulatieve afschrijving",
      "type": "contra"
    },
    {
      "code": "1400",
      "name": "Vooruitbetaalde kosten",
      "type": "asset"
    },
    {
      "code": "1500",
      "name": "Te vorderen btw",
      "type": "asset"
    },
    {
      "code": "1600",
      "name": "Te betalen btw",
      "type": "liability"
    },
    {
      "code": "2000",
      "name": "Kapitaalstorting",
      "type": "capital"
    },
    {
      "code": "2010",
      "name": "Privéopnamen",
      "type": "drawings"
    },
    {
      "code": "8000",
      "name": "Omzet diensten",
      "type": "revenue"
    },
    {
      "code": "4100",
      "name": "Softwarekosten",
      "type": "expense"
    },
    {
      "code": "4200",
      "name": "Telefoonkosten",
      "type": "expense"
    },
    {
      "code": "4300",
      "name": "Verzekeringskosten",
      "type": "expense"
    },
    {
      "code": "4400",
      "name": "Overige kosten",
      "type": "expense"
    },
    {
      "code": "4500",
      "name": "Afschrijvingskosten",
      "type": "expense"
    },
    {
      "code": "4600",
      "name": "Bankkosten",
      "type": "expense"
    }
  ],
  "cases": [
    {
      "id": "clean",
      "name": "1 · Nette administratie",
      "client": "Studio Helder · fictieve eenmanszaak",
      "subtitle": "Van voorgeboekte administratie naar jaarstukken",
      "intro": "Je krijgt een netjes voorgeboekt eerste boekjaar. Controleer de bronstukken en bank, corrigeer de afsluiting en lever een leesbaar rapport op. Je hoeft de eerste vijf leerfases niet opnieuw af te vinken.",
      "assignment": [
        "Controleer bank, omzet en openstaande facturen.",
        "Beoordeel de verzekering en laptop en boek je afsluitcorrecties.",
        "Bereken Q4-btw en maak balans, resultaat en toelichting.",
        "Schrijf een korte uitleg voor de ondernemer en rond je review af."
      ],
      "docs": [
        {
          "id": "I00",
          "kind": "Opdracht & uitgangspunten",
          "title": "Opdrachtkaart",
          "text": "Volledig fictieve eenmanszaak, zakelijke dienstverlening, gestart op 1 december 2026. Eerste boekjaar: 1–31 december 2026. Geen eerder jaar of beginsaldi vóór de storting. Factuurstelsel, alle dienstverlening in Nederland belast met 21% btw, geen KOR, werknemers, auto, voorraad, buitenlandse transacties of inkomstenbelastingberekening. Opdracht: controleer de administratie, rond Q4 af en maak jaarstukken (balans, resultaat en toelichting) voor de ondernemer. Alle bedragen in euro. Geen echte aangifte of deponering."
        },
        {
          "id": "D01",
          "kind": "Inkoopfactuur",
          "title": "Laptop · €1.452 incl. btw",
          "text": "Factuur SYN-LAP-001, ontvangen en geleverd 2 december 2026. Fictieve leverancier Demo Devices, fictieve klant als zakelijke afnemer; alle vereiste factuurgegevens worden in deze oefening als aanwezig beschouwd. Zakelijke laptop: €1.200 + €252 btw. Volledig zakelijk gebruikt en op 2 december betaald. Gegeven waarderingsbeleid: lineair in 60 maanden, restwaarde nihil, afschrijving vanaf december 2026. Investering blijft op de balans; één maand afschrijving is €20. Investeringsaftrek blijft buiten de case."
        },
        {
          "id": "D02",
          "kind": "Inkoopfactuur",
          "title": "Software december · €121 incl. btw",
          "text": "Factuur SYN-SOFT-001 van Nederlandse fictieve leverancier, d.d. 3 december. Alleen december 2026: €100 + €21 btw = €121, direct betaald. Geldige zakelijke factuur; geen jaarlijkse vooruitbetaling. Er bestaat precies één factuur met dit nummer."
        },
        {
          "id": "D03",
          "kind": "Polis & betaling",
          "title": "Verzekering · €600 zonder btw",
          "text": "Polis SYN-POL-001, dekking 1 december 2026 t/m 30 november 2027. Premie voor twaalf gelijke maanden: €600 totaal. Geen btw op dit stuk; bedrag inclusief eventuele overige heffingen is gegeven en hoeft niet uitgesplitst te worden. Betaald op 1 december. Slechts één maand behoort bij dit boekjaar."
        },
        {
          "id": "D04",
          "kind": "Inkoopfactuur",
          "title": "Telefoon december · €72,60 incl. btw",
          "text": "Factuur SYN-TEL-001, 10 december, geheel zakelijk abonnement voor december 2026. €60 exclusief btw + €12,60 btw. Factuur correct en op dezelfde dag betaald. Geen privégebruik in deze oefening."
        },
        {
          "id": "V01",
          "kind": "Verkoopfactuur",
          "title": "Factuur 2026-001 · €3.630 incl. btw",
          "text": "Fictieve klant Studio Voorbeeld A. Adviesdienst geleverd en factuur verzonden op 12 december 2026: €3.000 + €630 btw. Ontvangen op 22 december op de zakelijke bankrekening. Eén factuur en één ontvangst, geen tweede dienst."
        },
        {
          "id": "V02",
          "kind": "Verkoopfactuur",
          "title": "Factuur 2026-002 · €1.815 incl. btw",
          "text": "Fictieve klant Studio Voorbeeld B. Dienst geleverd en factuur verzonden op 20 december 2026: €1.500 + €315 btw. Op 31 december volledig onbetaald, vervaldatum 19 januari 2027. Geen aanwijzingen voor oninbaarheid; geen voorziening gegeven."
        },
        {
          "id": "B01",
          "kind": "Bankomschrijving",
          "title": "Startstorting eigenaar",
          "text": "1 december: €5.000 overgemaakt van de privérekening van de eigenaar naar de nieuwe zakelijke rekening. Geen factuur, geen omzet, geen lening."
        },
        {
          "id": "B06",
          "kind": "Bankomschrijving",
          "title": "Privéopname €800",
          "text": "15 december: €800 overgemaakt van zakelijk naar privé voor eigen levensonderhoud. Geen zakelijke last of btw."
        },
        {
          "id": "B07",
          "kind": "Bankomschrijving",
          "title": "Ontvangst factuur 2026-001",
          "text": "22 december: €3.630 ontvangen, betalingskenmerk 2026-001. Dit is betaling van V01, geen extra omzet."
        },
        {
          "id": "M00",
          "kind": "Werknotitie",
          "title": "Memoriaal / eigen onderbouwing",
          "text": "Gebruik deze bronreferentie voor samengestelde correcties. Verwijs in de omschrijving altijd naar het oorspronkelijke stuk en noteer je berekening. Verzin ontbrekende feiten niet."
        }
      ],
      "bank": [
        {
          "id": "B01",
          "date": "2026-12-01",
          "description": "Storting eigenaar",
          "amount": 500000
        },
        {
          "id": "B02",
          "date": "2026-12-02",
          "description": "Demo Devices SYN-LAP-001",
          "amount": -145200
        },
        {
          "id": "B03",
          "date": "2026-12-03",
          "description": "Software SYN-SOFT-001",
          "amount": -12100
        },
        {
          "id": "B04",
          "date": "2026-12-01",
          "description": "Polis SYN-POL-001",
          "amount": -60000
        },
        {
          "id": "B05",
          "date": "2026-12-10",
          "description": "Telefoon SYN-TEL-001",
          "amount": -7260
        },
        {
          "id": "B06",
          "date": "2026-12-15",
          "description": "Overboeking privé",
          "amount": -80000
        },
        {
          "id": "B07",
          "date": "2026-12-22",
          "description": "Ontvangst 2026-001",
          "amount": 363000
        }
      ],
      "seed": [
        {
          "id": "J1",
          "date": "2026-12-01",
          "description": "Startkapitaal",
          "source": "B01",
          "lines": [
            {
              "account": "1100",
              "debit": 500000,
              "credit": 0
            },
            {
              "account": "2000",
              "debit": 0,
              "credit": 500000
            }
          ]
        },
        {
          "id": "J2",
          "date": "2026-12-02",
          "description": "Laptop op factuur, direct betaald",
          "source": "D01",
          "lines": [
            {
              "account": "0200",
              "debit": 120000,
              "credit": 0
            },
            {
              "account": "1500",
              "debit": 25200,
              "credit": 0
            },
            {
              "account": "1100",
              "debit": 0,
              "credit": 145200
            }
          ]
        },
        {
          "id": "J3",
          "date": "2026-12-03",
          "description": "Software december",
          "source": "D02",
          "lines": [
            {
              "account": "4100",
              "debit": 10000,
              "credit": 0
            },
            {
              "account": "1500",
              "debit": 2100,
              "credit": 0
            },
            {
              "account": "1100",
              "debit": 0,
              "credit": 12100
            }
          ]
        },
        {
          "id": "J4",
          "date": "2026-12-01",
          "description": "Jaarpremie verzekering volledig als kosten geboekt",
          "source": "D03",
          "lines": [
            {
              "account": "4300",
              "debit": 60000,
              "credit": 0
            },
            {
              "account": "1100",
              "debit": 0,
              "credit": 60000
            }
          ]
        },
        {
          "id": "J5",
          "date": "2026-12-10",
          "description": "Zakelijk telefoonabonnement december",
          "source": "D04",
          "lines": [
            {
              "account": "4200",
              "debit": 6000,
              "credit": 0
            },
            {
              "account": "1500",
              "debit": 1260,
              "credit": 0
            },
            {
              "account": "1100",
              "debit": 0,
              "credit": 7260
            }
          ]
        },
        {
          "id": "J6",
          "date": "2026-12-15",
          "description": "Privéopname eigenaar",
          "source": "B06",
          "lines": [
            {
              "account": "2010",
              "debit": 80000,
              "credit": 0
            },
            {
              "account": "1100",
              "debit": 0,
              "credit": 80000
            }
          ]
        },
        {
          "id": "J7",
          "date": "2026-12-12",
          "description": "Verkoopfactuur 2026-001",
          "source": "V01",
          "lines": [
            {
              "account": "1300",
              "debit": 363000,
              "credit": 0
            },
            {
              "account": "8000",
              "debit": 0,
              "credit": 300000
            },
            {
              "account": "1600",
              "debit": 0,
              "credit": 63000
            }
          ]
        },
        {
          "id": "J8",
          "date": "2026-12-20",
          "description": "Verkoopfactuur 2026-002, nog niet betaald",
          "source": "V02",
          "lines": [
            {
              "account": "1300",
              "debit": 181500,
              "credit": 0
            },
            {
              "account": "8000",
              "debit": 0,
              "credit": 150000
            },
            {
              "account": "1600",
              "debit": 0,
              "credit": 31500
            }
          ]
        },
        {
          "id": "J9",
          "date": "2026-12-22",
          "description": "Ontvangst factuur 2026-001",
          "source": "B07",
          "lines": [
            {
              "account": "1100",
              "debit": 363000,
              "credit": 0
            },
            {
              "account": "1300",
              "debit": 0,
              "credit": 363000
            }
          ]
        }
      ],
      "solution": [
        {
          "description": "Verzekering: elf maanden vooruitbetaald",
          "source": "D03",
          "date": "2026-12-31",
          "lines": [
            {
              "account": "1400",
              "debit": 55000,
              "credit": 0
            },
            {
              "account": "4300",
              "debit": 0,
              "credit": 55000
            }
          ]
        },
        {
          "description": "Laptop: één maand afschrijving",
          "source": "D01",
          "date": "2026-12-31",
          "lines": [
            {
              "account": "4500",
              "debit": 2000,
              "credit": 0
            },
            {
              "account": "0290",
              "debit": 0,
              "credit": 2000
            }
          ]
        }
      ],
      "excel": null,
      "expected": {
        "bank": 558440,
        "receivables": 181500,
        "assetNet": 118000,
        "prepaid": 55000,
        "revenue": 450000,
        "expenses": 23000,
        "profit": 427000,
        "vatInput": 28560,
        "vatOutput": 94500,
        "vatNet": 65940,
        "equity": 847000,
        "assets": 912940
      },
      "hints": [
        "Premie hoort voor één twaalfde bij dit jaar.",
        "De laptop is een investering; de factuur-btw en afschrijving zijn verschillende zaken.",
        "Een onbetaalde verkoopfactuur kan al wel in de btw van deze periode vallen."
      ]
    },
    {
      "id": "messy",
      "name": "2 · Rommelig Excel-dossier",
      "client": "Studio Zoekwerk · fictieve eenmanszaak",
      "subtitle": "Opschonen, vragen stellen en fouten herstellen",
      "intro": "De klant heeft een spreadsheet gestuurd. De elf overgenomen journaalposten zijn nadrukkelijk NIET gecontroleerd. Losse stukken, een dubbel geboekte factuur en een verkeerd verwerkte ontvangst maken dit een ander type opdracht. Gebruik het klantantwoord als bewijs; gok niet op ontbrekende facturen.",
      "assignment": [
        "Vergelijk de Excelregels, bank en losse facturen. Maak een ontbrekende-stukkenlijst.",
        "Bepaal welke vragen je aan de klant moet stellen en gebruik het gegeven klantantwoord.",
        "Corrigeer verkeerde, dubbele en ontbrekende boekingen zonder de oorspronkelijke regels te wissen.",
        "Sluit bank en btw aan en maak daarna jaarstukken en een reviewlog."
      ],
      "docs": [
        {
          "id": "I00",
          "kind": "Opdracht & uitgangspunten",
          "title": "Opdrachtkaart",
          "text": "Volledig fictieve eenmanszaak, zakelijke dienstverlening, gestart op 1 december 2026. Eerste boekjaar: 1–31 december 2026. Geen eerder jaar of beginsaldi vóór de storting. Factuurstelsel, alle dienstverlening in Nederland belast met 21% btw, geen KOR, werknemers, auto, voorraad, buitenlandse transacties of inkomstenbelastingberekening. Opdracht: controleer de administratie, rond Q4 af en maak jaarstukken (balans, resultaat en toelichting) voor de ondernemer. Alle bedragen in euro. Geen echte aangifte of deponering."
        },
        {
          "id": "D01",
          "kind": "Inkoopfactuur",
          "title": "Laptop · €1.452 incl. btw",
          "text": "Factuur SYN-LAP-001, ontvangen en geleverd 2 december 2026. Fictieve leverancier Demo Devices, fictieve klant als zakelijke afnemer; alle vereiste factuurgegevens worden in deze oefening als aanwezig beschouwd. Zakelijke laptop: €1.200 + €252 btw. Volledig zakelijk gebruikt en op 2 december betaald. Gegeven waarderingsbeleid: lineair in 60 maanden, restwaarde nihil, afschrijving vanaf december 2026. Investering blijft op de balans; één maand afschrijving is €20. Investeringsaftrek blijft buiten de case."
        },
        {
          "id": "D02",
          "kind": "Inkoopfactuur",
          "title": "Software december · €121 incl. btw",
          "text": "Factuur SYN-SOFT-001 van Nederlandse fictieve leverancier, d.d. 3 december. Alleen december 2026: €100 + €21 btw = €121, direct betaald. Geldige zakelijke factuur; geen jaarlijkse vooruitbetaling. Er bestaat precies één factuur met dit nummer."
        },
        {
          "id": "D03",
          "kind": "Polis & betaling",
          "title": "Verzekering · €600 zonder btw",
          "text": "Polis SYN-POL-001, dekking 1 december 2026 t/m 30 november 2027. Premie voor twaalf gelijke maanden: €600 totaal. Geen btw op dit stuk; bedrag inclusief eventuele overige heffingen is gegeven en hoeft niet uitgesplitst te worden. Betaald op 1 december. Slechts één maand behoort bij dit boekjaar."
        },
        {
          "id": "D04",
          "kind": "Inkoopfactuur",
          "title": "Telefoon december · €72,60 incl. btw",
          "text": "Factuur SYN-TEL-001, 10 december, geheel zakelijk abonnement voor december 2026. €60 exclusief btw + €12,60 btw. Factuur correct en op dezelfde dag betaald. Geen privégebruik in deze oefening."
        },
        {
          "id": "V01",
          "kind": "Verkoopfactuur",
          "title": "Factuur 2026-001 · €3.630 incl. btw",
          "text": "Fictieve klant Studio Voorbeeld A. Adviesdienst geleverd en factuur verzonden op 12 december 2026: €3.000 + €630 btw. Ontvangen op 22 december op de zakelijke bankrekening. Eén factuur en één ontvangst, geen tweede dienst."
        },
        {
          "id": "V02",
          "kind": "Verkoopfactuur",
          "title": "Factuur 2026-002 · €1.815 incl. btw",
          "text": "Fictieve klant Studio Voorbeeld B. Dienst geleverd en factuur verzonden op 20 december 2026: €1.500 + €315 btw. Op 31 december volledig onbetaald, vervaldatum 19 januari 2027. Geen aanwijzingen voor oninbaarheid; geen voorziening gegeven."
        },
        {
          "id": "B01",
          "kind": "Bankomschrijving",
          "title": "Startstorting eigenaar",
          "text": "1 december: €5.000 overgemaakt van de privérekening van de eigenaar naar de nieuwe zakelijke rekening. Geen factuur, geen omzet, geen lening."
        },
        {
          "id": "B06",
          "kind": "Bankomschrijving",
          "title": "Privéopname €800",
          "text": "15 december: €800 overgemaakt van zakelijk naar privé voor eigen levensonderhoud. Geen zakelijke last of btw."
        },
        {
          "id": "B07",
          "kind": "Bankomschrijving",
          "title": "Ontvangst factuur 2026-001",
          "text": "22 december: €3.630 ontvangen, betalingskenmerk 2026-001. Dit is betaling van V01, geen extra omzet."
        },
        {
          "id": "M00",
          "kind": "Werknotitie",
          "title": "Memoriaal / eigen onderbouwing",
          "text": "Gebruik deze bronreferentie voor samengestelde correcties. Verwijs in de omschrijving altijd naar het oorspronkelijke stuk en noteer je berekening. Verzin ontbrekende feiten niet."
        },
        {
          "id": "X01",
          "kind": "Onvolledig aangeleverd",
          "title": "Kaartbetaling €242 · factuur ontbreekt",
          "text": "23 december: kaartbetaling €242 bij Voorbeeldwinkel. Excel bevat €200 kosten en €42 btw, maar er is geen zakelijke factuur aangeleverd. Uit de betaling alleen blijkt niet dat voorbelasting aftrekbaar is. Raadpleeg ook klantantwoord MAIL01."
        },
        {
          "id": "MAIL01",
          "kind": "Klantantwoord · ontvangen na navraag",
          "title": "Bevestiging: aankoop €242 was privé",
          "text": "Fictieve mail van de eigenaar, 29 december: “Die betaling van €242 was een cadeau voor mijn broer. Dat was privé; ik heb per ongeluk met de zakelijke pas betaald. Er is geen zakelijke factuur.” Dit antwoord maakt classificatie als privé mogelijk; verwijder de eerder geboekte kosten en voorbelasting."
        },
        {
          "id": "V03",
          "kind": "Losse verkoopfactuur",
          "title": "Niet in Excel: factuur 2026-003",
          "text": "Fictieve klant Studio Voorbeeld C. Dienst geleverd en factuur verzonden op 28 december 2026. €1.000 + €210 btw = €1.210. Nog niet betaald. Geldige verkoopfactuur, niet in de overgenomen Excelboekingen aanwezig."
        },
        {
          "id": "B09",
          "kind": "Bankbericht",
          "title": "Bankkosten €12",
          "text": "31 december: €12 bankkosten afgeschreven; geen btw op de bankdienst in deze case. De afschrijving staat alleen op het bankoverzicht en ontbreekt in Excel."
        }
      ],
      "bank": [
        {
          "id": "B01",
          "date": "2026-12-01",
          "description": "Storting eigenaar",
          "amount": 500000
        },
        {
          "id": "B02",
          "date": "2026-12-02",
          "description": "Demo Devices SYN-LAP-001",
          "amount": -145200
        },
        {
          "id": "B03",
          "date": "2026-12-03",
          "description": "Software SYN-SOFT-001",
          "amount": -12100
        },
        {
          "id": "B04",
          "date": "2026-12-01",
          "description": "Polis SYN-POL-001",
          "amount": -60000
        },
        {
          "id": "B05",
          "date": "2026-12-10",
          "description": "Telefoon SYN-TEL-001",
          "amount": -7260
        },
        {
          "id": "B06",
          "date": "2026-12-15",
          "description": "Overboeking privé",
          "amount": -80000
        },
        {
          "id": "B07",
          "date": "2026-12-22",
          "description": "Ontvangst 2026-001",
          "amount": 363000
        },
        {
          "id": "B08",
          "date": "2026-12-23",
          "description": "Voorbeeldwinkel · kaartbetaling",
          "amount": -24200
        },
        {
          "id": "B09",
          "date": "2026-12-31",
          "description": "Bankkosten",
          "amount": -1200
        }
      ],
      "seed": [
        {
          "id": "J1",
          "date": "2026-12-01",
          "description": "Startkapitaal",
          "source": "B01",
          "lines": [
            {
              "account": "1100",
              "debit": 500000,
              "credit": 0
            },
            {
              "account": "2000",
              "debit": 0,
              "credit": 500000
            }
          ]
        },
        {
          "id": "J2",
          "date": "2026-12-02",
          "description": "Laptop geboekt als kosten incl. btw",
          "source": "D01",
          "lines": [
            {
              "account": "4400",
              "debit": 145200,
              "credit": 0
            },
            {
              "account": "1100",
              "debit": 0,
              "credit": 145200
            }
          ]
        },
        {
          "id": "J3",
          "date": "2026-12-03",
          "description": "Software december",
          "source": "D02",
          "lines": [
            {
              "account": "4100",
              "debit": 10000,
              "credit": 0
            },
            {
              "account": "1500",
              "debit": 2100,
              "credit": 0
            },
            {
              "account": "1100",
              "debit": 0,
              "credit": 12100
            }
          ]
        },
        {
          "id": "J4",
          "date": "2026-12-01",
          "description": "Jaarpremie verzekering volledig als kosten geboekt",
          "source": "D03",
          "lines": [
            {
              "account": "4300",
              "debit": 60000,
              "credit": 0
            },
            {
              "account": "1100",
              "debit": 0,
              "credit": 60000
            }
          ]
        },
        {
          "id": "J5",
          "date": "2026-12-10",
          "description": "Zakelijk telefoonabonnement december",
          "source": "D04",
          "lines": [
            {
              "account": "4200",
              "debit": 6000,
              "credit": 0
            },
            {
              "account": "1500",
              "debit": 1260,
              "credit": 0
            },
            {
              "account": "1100",
              "debit": 0,
              "credit": 7260
            }
          ]
        },
        {
          "id": "J6",
          "date": "2026-12-15",
          "description": "Overboeking eigenaar als overige kosten",
          "source": "B06",
          "lines": [
            {
              "account": "4400",
              "debit": 80000,
              "credit": 0
            },
            {
              "account": "1100",
              "debit": 0,
              "credit": 80000
            }
          ]
        },
        {
          "id": "J7",
          "date": "2026-12-12",
          "description": "Verkoopfactuur 2026-001",
          "source": "V01",
          "lines": [
            {
              "account": "1300",
              "debit": 363000,
              "credit": 0
            },
            {
              "account": "8000",
              "debit": 0,
              "credit": 300000
            },
            {
              "account": "1600",
              "debit": 0,
              "credit": 63000
            }
          ]
        },
        {
          "id": "J8",
          "date": "2026-12-20",
          "description": "Verkoopfactuur 2026-002, nog niet betaald",
          "source": "V02",
          "lines": [
            {
              "account": "1300",
              "debit": 181500,
              "credit": 0
            },
            {
              "account": "8000",
              "debit": 0,
              "credit": 150000
            },
            {
              "account": "1600",
              "debit": 0,
              "credit": 31500
            }
          ]
        },
        {
          "id": "J9",
          "date": "2026-12-22",
          "description": "Ontvangst 2026-001 als extra omzet geboekt",
          "source": "B07",
          "lines": [
            {
              "account": "1100",
              "debit": 363000,
              "credit": 0
            },
            {
              "account": "8000",
              "debit": 0,
              "credit": 300000
            },
            {
              "account": "1600",
              "debit": 0,
              "credit": 63000
            }
          ]
        },
        {
          "id": "J10",
          "date": "2026-12-03",
          "description": "Softwarefactuur nogmaals verwerkt",
          "source": "D02",
          "lines": [
            {
              "account": "4100",
              "debit": 10000,
              "credit": 0
            },
            {
              "account": "1500",
              "debit": 2100,
              "credit": 0
            },
            {
              "account": "1100",
              "debit": 0,
              "credit": 12100
            }
          ]
        },
        {
          "id": "J11",
          "date": "2026-12-23",
          "description": "Aankoop zonder factuur als zakelijk geboekt",
          "source": "X01",
          "lines": [
            {
              "account": "4400",
              "debit": 20000,
              "credit": 0
            },
            {
              "account": "1500",
              "debit": 4200,
              "credit": 0
            },
            {
              "account": "1100",
              "debit": 0,
              "credit": 24200
            }
          ]
        }
      ],
      "solution": [
        {
          "description": "Verzekering: elf maanden vooruitbetaald",
          "source": "D03",
          "date": "2026-12-31",
          "lines": [
            {
              "account": "1400",
              "debit": 55000,
              "credit": 0
            },
            {
              "account": "4300",
              "debit": 0,
              "credit": 55000
            }
          ]
        },
        {
          "description": "Laptop: één maand afschrijving",
          "source": "D01",
          "date": "2026-12-31",
          "lines": [
            {
              "account": "4500",
              "debit": 2000,
              "credit": 0
            },
            {
              "account": "0290",
              "debit": 0,
              "credit": 2000
            }
          ]
        },
        {
          "description": "Laptop herclassificeren uit kosten incl. btw",
          "source": "D01",
          "date": "2026-12-31",
          "lines": [
            {
              "account": "0200",
              "debit": 120000,
              "credit": 0
            },
            {
              "account": "1500",
              "debit": 25200,
              "credit": 0
            },
            {
              "account": "4400",
              "debit": 0,
              "credit": 145200
            }
          ]
        },
        {
          "description": "Dubbele softwareboeking J10 terugnemen",
          "source": "D02",
          "date": "2026-12-31",
          "lines": [
            {
              "account": "1100",
              "debit": 12100,
              "credit": 0
            },
            {
              "account": "4100",
              "debit": 0,
              "credit": 10000
            },
            {
              "account": "1500",
              "debit": 0,
              "credit": 2100
            }
          ]
        },
        {
          "description": "Privéopname J6 uit kosten halen",
          "source": "B06",
          "date": "2026-12-31",
          "lines": [
            {
              "account": "2010",
              "debit": 80000,
              "credit": 0
            },
            {
              "account": "4400",
              "debit": 0,
              "credit": 80000
            }
          ]
        },
        {
          "description": "Ontvangst J9 afboeken op debiteuren, geen nieuwe omzet",
          "source": "B07",
          "date": "2026-12-31",
          "lines": [
            {
              "account": "8000",
              "debit": 300000,
              "credit": 0
            },
            {
              "account": "1600",
              "debit": 63000,
              "credit": 0
            },
            {
              "account": "1300",
              "debit": 0,
              "credit": 363000
            }
          ]
        },
        {
          "description": "Privéaankoop corrigeren op basis MAIL01",
          "source": "MAIL01",
          "date": "2026-12-31",
          "lines": [
            {
              "account": "2010",
              "debit": 24200,
              "credit": 0
            },
            {
              "account": "4400",
              "debit": 0,
              "credit": 20000
            },
            {
              "account": "1500",
              "debit": 0,
              "credit": 4200
            }
          ]
        },
        {
          "description": "Ontbrekende verkoopfactuur 2026-003",
          "source": "V03",
          "date": "2026-12-28",
          "lines": [
            {
              "account": "1300",
              "debit": 121000,
              "credit": 0
            },
            {
              "account": "8000",
              "debit": 0,
              "credit": 100000
            },
            {
              "account": "1600",
              "debit": 0,
              "credit": 21000
            }
          ]
        },
        {
          "description": "Ontbrekende bankkosten",
          "source": "B09",
          "date": "2026-12-31",
          "lines": [
            {
              "account": "4600",
              "debit": 1200,
              "credit": 0
            },
            {
              "account": "1100",
              "debit": 0,
              "credit": 1200
            }
          ]
        }
      ],
      "excel": [
        {
          "row": 2,
          "date": "2026-12-01",
          "description": "Startkapitaal",
          "source": "B01",
          "note": "Ongecontroleerde regel van de klant"
        },
        {
          "row": 3,
          "date": "2026-12-02",
          "description": "Laptop geboekt als kosten incl. btw",
          "source": "D01",
          "note": "Ongecontroleerde regel van de klant"
        },
        {
          "row": 4,
          "date": "2026-12-03",
          "description": "Software december",
          "source": "D02",
          "note": "Ongecontroleerde regel van de klant"
        },
        {
          "row": 5,
          "date": "2026-12-01",
          "description": "Jaarpremie verzekering volledig als kosten geboekt",
          "source": "D03",
          "note": "Ongecontroleerde regel van de klant"
        },
        {
          "row": 6,
          "date": "2026-12-10",
          "description": "Zakelijk telefoonabonnement december",
          "source": "D04",
          "note": "Ongecontroleerde regel van de klant"
        },
        {
          "row": 7,
          "date": "2026-12-15",
          "description": "Overboeking eigenaar als overige kosten",
          "source": "B06",
          "note": "Ongecontroleerde regel van de klant"
        },
        {
          "row": 8,
          "date": "2026-12-12",
          "description": "Verkoopfactuur 2026-001",
          "source": "V01",
          "note": "Ongecontroleerde regel van de klant"
        },
        {
          "row": 9,
          "date": "2026-12-20",
          "description": "Verkoopfactuur 2026-002, nog niet betaald",
          "source": "V02",
          "note": "Ongecontroleerde regel van de klant"
        },
        {
          "row": 10,
          "date": "2026-12-22",
          "description": "Ontvangst 2026-001 als extra omzet geboekt",
          "source": "B07",
          "note": "Ongecontroleerde regel van de klant"
        },
        {
          "row": 11,
          "date": "2026-12-03",
          "description": "Softwarefactuur nogmaals verwerkt",
          "source": "D02",
          "note": "Ongecontroleerde regel van de klant"
        },
        {
          "row": 12,
          "date": "2026-12-23",
          "description": "Aankoop zonder factuur als zakelijk geboekt",
          "source": "X01",
          "note": "Ongecontroleerde regel van de klant"
        }
      ],
      "expected": {
        "bank": 533040,
        "receivables": 302500,
        "assetNet": 118000,
        "prepaid": 55000,
        "revenue": 550000,
        "expenses": 24200,
        "profit": 525800,
        "vatInput": 28560,
        "vatOutput": 115500,
        "vatNet": 86940,
        "equity": 921600,
        "assets": 1008540
      },
      "hints": [
        "Eén factuur komt tweemaal voor; herstel met een tegenboeking zodat het spoor intact blijft.",
        "Een ontvangst van een bestaande verkoopfactuur is geen tweede omzet.",
        "Voor de kaartbetaling staat een expliciet klantantwoord in MAIL01.",
        "De bank en losse factuur V03 bevatten informatie die niet in Excel staat.",
        "Ook na het opschonen moet je nog afsluitcorrecties maken."
      ]
    }
  ],
  "sources": [
    {
      "name": "KVK: eenmanszaak hoeft niet te deponeren",
      "url": "https://www.kvk.nl/deponeren/jaarrekening-wel-of-niet-deponeren/"
    },
    {
      "name": "Belastingdienst: voorwaarden voorbelasting",
      "url": "https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/zakelijk/btw/btw_aftrekken/welke_btw_is_aftrekbaar/welke_btw_mag_u_aftrekken"
    }
  ]
};})();
