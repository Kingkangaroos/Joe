/* Original Gamenfy learning content · ChatGPT (OpenAI) · researched 2026-10-19. */
(function(){
"use strict";
window.GamenfyAccountancyData = {
  "version": 1,
  "researchedAt": "2026-10-19",
  "title": "Accountancy",
  "goal": "Zelfstandig een Nederlandse jaarrekening maken en onderbouwen",
  "stages": [
    {
      "id": "start",
      "level": 1,
      "title": "Startscan & opdracht afbakenen",
      "track": "Basis",
      "meaning": "Bepaal wat je al kunt en welk verslaggevingsstelsel bij je oefenbedrijf hoort.",
      "steps": [
        "Beschrijf rechtsvorm, activiteiten, boekjaar, gebruikers en gewenste rapportage.",
        "Leg uit: commerciële jaarrekening, fiscale cijfers, inrichtingsjaarrekening en publicatiestukken.",
        "Maak zonder hulp vijf boekingen en leg het effect op balans en resultaat uit."
      ],
      "deliverables": [
        "Opdrachtkaart met rechtsvorm, boekjaar en stelsel",
        "Startscan: bank, debiteuren, crediteuren, btw, memoriaal, toelichting (zelfstandig / met hulp / nieuw)"
      ],
      "criterion": "Je kunt vijf boekingen uitleggen en de juiste rapportages onderscheiden.",
      "tip": "Gebruik je werkervaring als startpunt; markeer iets pas beheerst als je bewijs hebt.",
      "sources": [
        "kvk",
        "rjk"
      ]
    },
    {
      "id": "dossier",
      "level": 5,
      "title": "Proefbalans → werkdossier",
      "track": "Nederland",
      "meaning": "Bouw een controleerbaar dossier met bronstukken en een sluitende proefbalans.",
      "steps": [
        "Maak dossiermappen 00 opdracht, 01 proefbalans, 02 aansluitingen, 03 memoriaal, 04 rapportage, 05 review.",
        "Importeer of typ de fictieve proefbalans uit case 1; controleer debet = credit.",
        "Map elke rekening naar balans of winst-en-verlies; zet per post de bron en open vraag erbij."
      ],
      "deliverables": [
        "Sluitende proefbalans met mapping",
        "Dossierindex en ontbrekende-stukkenlijst"
      ],
      "criterion": "Een ander kan iedere grootboekregel terugvinden en de proefbalans sluit zonder restpost.",
      "tip": "Oefen in een leeg spreadsheet of een aparte oefenadministratie van je werkgever.",
      "sources": [
        "exact",
        "nba"
      ]
    },
    {
      "id": "aansluiten",
      "level": 10,
      "title": "Balansposten aansluiten",
      "track": "Nederland",
      "meaning": "Onderbouw de saldi voordat je een rapport uitdraait.",
      "steps": [
        "Sluit bank aan op afschrift, debiteuren/crediteuren op open posten.",
        "Maak btw-aansluiting met aangiften, betalingen en grootboek; verklaar verschillen.",
        "Sluit lonen aan op loonjournaal en aangiften; leg tussenrekeningen en oude posten uit."
      ],
      "deliverables": [
        "Aansluitstaat bank, debiteuren, crediteuren, btw en loon",
        "Verschillenlijst met oplossing of gerichte vraag"
      ],
      "criterion": "Alle relevante saldi hebben een onderbouwing; geen onverklaarde verschillen wegboeken.",
      "tip": "Vraag op werk één balanspost die je van begin tot eind mag voorbereiden en laat die reviewen.",
      "sources": [
        "exact",
        "nba"
      ]
    },
    {
      "id": "afsluiten",
      "level": 16,
      "title": "Memoriaal & jaarafsluiting",
      "track": "Nederland",
      "meaning": "Boek kosten en opbrengsten in het juiste jaar en laat een mutatiespoor achter.",
      "steps": [
        "Werk case 1 uit: afschrijving, vooruitbetaling, overlopende kosten/opbrengsten en oninbaarheid.",
        "Schrijf per correctie: feit → regel → berekening → journaalpost → bron.",
        "Maak de gecorrigeerde proefbalans, resultaatberekening en vermogensvergelijking."
      ],
      "deliverables": [
        "Memoriaalstaat met vijf onderbouwde correcties",
        "Gecorrigeerde proefbalans en vermogensvergelijking"
      ],
      "criterion": "Case 1 sluit: resultaat, balans en eigen vermogen kloppen; je kunt elke correctie mondeling verdedigen.",
      "tip": "Verdeel deze case over drie sessies: analyseren, boeken, aansluiten.",
      "sources": [
        "belasting",
        "exact"
      ]
    },
    {
      "id": "waarderen",
      "level": 22,
      "title": "Waardering & fiscale aansluiting",
      "track": "Nederland",
      "meaning": "Leer waarom een sluitende balans nog niet automatisch een goede jaarrekening is.",
      "steps": [
        "Beoordeel activa, voorraad, debiteuren, schulden en schattingen op basis van de toepasselijke grondslagen.",
        "Maak case 2 en verklaar commerciële versus fiscale winst en het effect op belasting.",
        "Noteer wanneer je moet overleggen: continuïteit, claims, verbonden partijen, schattingsonzekerheid."
      ],
      "deliverables": [
        "Waarderingsmemo bij minimaal drie posten",
        "Commercieel-fiscale aansluiting en belastingberekening"
      ],
      "criterion": "Case 2 sluit; je verwart fiscale correcties niet met commerciële boekingen.",
      "tip": "Gebruik de RJk-editie passend bij het boekjaar via je kantoor, bibliotheek of eigen toegang.",
      "sources": [
        "rjk",
        "belasting",
        "nba"
      ]
    },
    {
      "id": "jaarrekening",
      "level": 32,
      "title": "Eerste complete jaarrekening",
      "track": "Nederland",
      "meaning": "Maak een Nederlandse conceptjaarrekening voor een eenvoudige micro- of kleine BV.",
      "steps": [
        "Bepaal met bronverwijzing de grootteklasse, groepscontext en toepasselijke BW2/RJk-grondslagen.",
        "Werk case 2 uit tot balans, winst-en-verlies, grondslagen, toelichtingen en vergelijkende cijfers.",
        "Maak een afzonderlijke publicatiecheck: opstellen, ondertekenen, vaststellen en deponeren zijn verschillende stappen."
      ],
      "deliverables": [
        "Conceptjaarrekening met vergelijkende cijfers en toelichtingen",
        "Dossier met onderbouwingen en publicatiecheck"
      ],
      "criterion": "Bedragen zijn traceerbaar; toelichtingen passen bij de onderneming; vergelijkende cijfers en tekst sluiten aan.",
      "tip": "Vraag een senior om een fictief of intern geanonimiseerd voorbeelddossier. Gebruik nooit een echte KVK-deponering om te oefenen.",
      "sources": [
        "kvk",
        "rjk",
        "nba"
      ]
    },
    {
      "id": "zelfstandig",
      "level": 48,
      "title": "Jaarrekeningen maken — hoofddoel",
      "track": "Nederland",
      "meaning": "Lever herhaalbaar een reviewbaar dossier op en los reviewpunten inhoudelijk op.",
      "steps": [
        "Rond drie verschillende volledige dossiers af: dienstverlening, handelsbedrijf/voorraad en een eenvoudige BV.",
        "Laat minimaal één volledig dossier door een senior/accountant reviewen; bewaar alleen anonieme bevindingen.",
        "Herstel alle materiële of inhoudelijke fouten en maak een persoonlijke afsluitchecklist.",
        "Leg in tien minuten uit hoe resultaat, vermogen, liquiditeit en belangrijkste schattingen samenhangen."
      ],
      "deliverables": [
        "Drie complete oefendossiers",
        "Reviewlog met oplossingen en minimaal één externe review",
        "Eigen afsluitchecklist en korte klanttoelichting"
      ],
      "criterion": "Drie dossiers sluiten en alle kritieke reviewpunten zijn opgelost. Zonder externe review blijft dit oefenbekwaam, nog niet praktijkgevalideerd.",
      "tip": "Plan een reviewmoment op werk. Je hoeft geen extra abonnement te kopen om hiermee te starten.",
      "sources": [
        "nba",
        "rjk"
      ]
    },
    {
      "id": "english",
      "level": 60,
      "title": "Engelstalig rapporteren",
      "track": "Internationaal",
      "meaning": "Maak dezelfde jaarrekening leesbaar in het Engels en behoud het gekozen stelsel.",
      "steps": [
        "Maak een woordenlijst van 40 termen: accruals, receivables, impairment, equity, retained earnings enzovoort.",
        "Zet een eerder beoordeelde Nederlandse oefencase om naar een Engelstalig reporting pack.",
        "Schrijf een Engelstalige management summary van één pagina en presenteer de cijfers in vijf minuten."
      ],
      "deliverables": [
        "Engelstalige balans, resultaat en toelichtingen",
        "Woordenlijst en management summary"
      ],
      "criterion": "De vertaling wijzigt bedragen of grondslagen niet; Dutch GAAP blijft herkenbaar vermeld.",
      "tip": "Een Engelse jaarrekening onder Dutch GAAP is een taalstap; IFRS is een afzonderlijke inhoudelijke stap.",
      "sources": [
        "rjk",
        "ifrs-materials"
      ]
    },
    {
      "id": "smes",
      "level": 74,
      "title": "IFRS for SMEs — inhoudelijke brug",
      "track": "Internationaal",
      "meaning": "Leer een internationaal stelsel toepassen en verschillen met Dutch GAAP onderbouwen.",
      "steps": [
        "Gebruik de officiële 2025/derde-editie-modules; begin bij 1, 2, 7, 13, 17, 21, 23, 29 en 30.",
        "Maak per behandeld onderwerp oefeningen en een verschilnotitie: bron → verwerking → journaalpost → toelichting.",
        "Maak een mini reporting pack inclusief kasstroomoverzicht en een overgangsmemo met minimaal vijf beoordeelde verschillen."
      ],
      "deliverables": [
        "Uitwerkingen van officiële module-oefeningen",
        "Verschillenmatrix en Engelstalig reporting pack"
      ],
      "criterion": "Je onderbouwt minimaal vijf stelselvergelijkingen en laat het pack reviewen; een verschil kan ook nihil zijn.",
      "tip": "Derde editie geldt vanaf boekjaren beginnend op/na 1 januari 2027, eerdere toepassing toegestaan. Niet automatisch toepasbaar op Nederlandse statutaire jaarrekeningen: bepaal toegestane stelsels per land/rechtspersoon.",
      "sources": [
        "ifrs",
        "ifrs-materials"
      ]
    },
    {
      "id": "group",
      "level": 100,
      "title": "Full IFRS & internationale groep",
      "track": "Verdieping",
      "meaning": "Een vervolgrichting met valuta, consolidatie en complexere verslaggeving.",
      "steps": [
        "Maak case 3 voor valuta en groepseliminaties; onderbouw transactievaluta versus functionele valuta.",
        "Verdiep full IFRS: IAS 7, IAS 12, IAS 21, IFRS 9, 10, 15 en 16; vergelijk expliciet met IFRS for SMEs.",
        "Werk een volledige groepscase uit met acquisitie/openingsbalans, eliminaties, valutareserve en toelichtingen.",
        "Laat het dossier reviewen door iemand met IFRS/consolidatie-ervaring."
      ],
      "deliverables": [
        "Case 3 met eliminatieboekingen",
        "Full-IFRS-consolidatiedossier en reviewmemo"
      ],
      "criterion": "Een gecontroleerde mini-case is de instap; pas een volledig beoordeeld groepsdossier maakt deze fase afgerond.",
      "tip": "Full IFRS is een ander stelsel dan IFRS for SMEs. IAS 1 wordt voor boekjaren vanaf 1 januari 2027 vervangen door IFRS 18 (eerdere toepassing toegestaan). Dit pad kent geen automatische AA/RA-titel of bevoegdheid toe.",
      "sources": [
        "ifrs",
        "ifrs-materials",
        "ifrs18"
      ]
    }
  ],
  "sources": [
    {
      "id": "kvk",
      "name": "KVK — grootteklasse & publicatie",
      "url": "https://www.kvk.nl/deponeren/in-welke-bedrijfsklasse-valt-je-bedrijf/",
      "use": "Bepaal rechtsvorm, grootteklasse en de passende publicatiecheck; bekijk ook de actuele termijnen.",
      "access": "Vrij toegankelijk"
    },
    {
      "id": "rjk",
      "name": "Raad voor de Jaarverslaggeving — RJk",
      "url": "https://www.rjnet.nl/richtlijnen/kleine-bundel/",
      "use": "Regels voor micro- en kleine rechtspersonen; gebruik de editie die bij het boekjaar hoort.",
      "access": "Uitleg vrij; volledige bundel doorgaans via kantoor/abonnement"
    },
    {
      "id": "nba",
      "name": "NBA — risicogericht samenstellen",
      "url": "https://www.nba.nl/tools-en-ondersteuning/publicaties/2015/risicogerichte-aanpak-samenstellingsopdracht/",
      "use": "Dossieropbouw en risicogericht werken; lees de brochure samen met de actuele Standaard 4410. Een samenstellingsopdracht geeft geen controlezekerheid.",
      "access": "Vrije brochure; controleer actuele standaard via kantoor/NBA"
    },
    {
      "id": "exact",
      "name": "Exact Online — trainingen",
      "url": "https://www.exact.com/nl/exact-online/support/trainingen",
      "use": "Software-oefening: memoriaal, balansspecificaties en jaarafsluiting. Kies een aparte oefenadministratie; beschikbaarheid hangt van je toegang af.",
      "access": "Aanbod en toegang kunnen per account verschillen"
    },
    {
      "id": "belasting",
      "name": "Belastingdienst — commerciële en fiscale winst",
      "url": "https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/zakelijk/winst/inkomstenbelasting/inkomstenbelasting_voor_ondernemers/winst_uit_onderneming",
      "use": "Introductie commerciële versus fiscale waardering. Deze IB-pagina bepaalt geen BV-Vpb-tarief; case 2 gebruikt een gegeven oefentarief.",
      "access": "Vrij toegankelijk"
    },
    {
      "id": "ifrs",
      "name": "IFRS Foundation — IFRS for SMEs",
      "url": "https://www.ifrs.org/issued-standards/ifrs-for-smes/",
      "use": "Stelsel, editie en ingangsdatum; IFRS for SMEs staat los van full IFRS.",
      "access": "Overzicht vrij; registratie kan voor documenten nodig zijn"
    },
    {
      "id": "ifrs-materials",
      "name": "IFRS — officiële oefenmodules derde editie",
      "url": "https://www.ifrs.org/supporting-implementation/2025-ifrs-for-smes-supporting-materials/",
      "use": "Uitleg, voorbeelden, zelftoetsen en cases. Controleer de editie van elke module vóór gebruik.",
      "access": "Officiële leermaterialen; mogelijk gratis registratie"
    },
    {
      "id": "ifrs18",
      "name": "IFRS Foundation — IFRS 18",
      "url": "https://www.ifrs.org/issued-standards/list-of-standards/ifrs-18-presentation-and-disclosure-in-financial-statements/",
      "use": "Full-IFRS-presentatie vanaf 2027; geen automatische wijziging van IFRS for SMEs.",
      "access": "Overzicht vrij"
    }
  ],
  "cases": [
    {
      "id": "dienst",
      "title": "Case 1 · Studio Almere",
      "subtitle": "Eenmanszaak · afsluiten zonder inkomstenbelasting",
      "intro": "Boekjaar X, alle bedragen in euro. Dit is een afsluitoefening: de proefbalans is al geboekt. Btw-correcties op de vijf nieuwe posten blijven in deze fictieve case buiten beschouwing; pas dit niet zonder beoordeling op echte dossiers toe. Privéopnamen horen in het eigen vermogen, niet bij de kosten.",
      "trial": [
        [
          "Bank",
          18000,
          0
        ],
        [
          "Debiteuren",
          12100,
          0
        ],
        [
          "Inventaris aanschafwaarde",
          12000,
          0
        ],
        [
          "Vooruitbetaalde verzekering",
          2400,
          0
        ],
        [
          "Huurkosten",
          12000,
          0
        ],
        [
          "Loonkosten",
          30000,
          0
        ],
        [
          "Overige kosten",
          5500,
          0
        ],
        [
          "Privéopnamen",
          6000,
          0
        ],
        [
          "Beginvermogen",
          0,
          20000
        ],
        [
          "Cumulatieve afschrijving",
          0,
          2400
        ],
        [
          "Crediteuren",
          0,
          8100
        ],
        [
          "Te betalen btw",
          0,
          3500
        ],
        [
          "Omzet",
          0,
          64000
        ]
      ],
      "facts": [
        "Jaarafschrijving inventaris: €2.400; nog niet geboekt.",
        "Van €2.400 geboekte vooruitbetaalde verzekering betreft €600 dit boekjaar; €1.800 het volgende jaar.",
        "De accountant moet nog €1.200 exclusief btw factureren voor werk in dit boekjaar. Neem alleen de gegeven kosten exclusief btw op.",
        "Geleverde en aanvaarde diensten van €2.000 zijn nog niet gefactureerd en niet geboekt.",
        "Van debiteuren is €1.100 aantoonbaar oninbaar. Vorm een waardecorrectie van €1.100; eventuele btw-teruggaaf hoort niet bij deze oefening."
      ],
      "questions": [
        {
          "id": "profit",
          "label": "Resultaat vóór inkomstenbelasting",
          "answer": 13200
        },
        {
          "id": "assets",
          "label": "Balanstotaal na correcties",
          "answer": 40000
        },
        {
          "id": "equity",
          "label": "Eindvermogen na privéopnamen",
          "answer": 27200
        },
        {
          "id": "liabilities",
          "label": "Totaal vreemd vermogen",
          "answer": 12800
        }
      ],
      "solution": [
        "D afschrijvingskosten 2.400 / C cumulatieve afschrijving 2.400.",
        "D verzekeringskosten 600 / C vooruitbetaalde verzekering 600.",
        "D accountantskosten 1.200 / C nog te betalen kosten 1.200.",
        "D nog te factureren omzet 2.000 / C omzet 2.000.",
        "D kosten oninbaarheid 1.100 / C waardecorrectie debiteuren 1.100.",
        "Omzet 66.000 − kosten 52.800 = resultaat 13.200.",
        "Activa: bank 18.000 + netto debiteuren 11.000 + netto inventaris 7.200 + verzekering 1.800 + te factureren 2.000 = 40.000.",
        "Vermogen: begin 20.000 − privé 6.000 + resultaat 13.200 = 27.200. Schulden: 8.100 + 3.500 + 1.200 = 12.800."
      ],
      "extension": "Maak zelf een nieuwe variant met andere afschrijving en overlopende posten. Sluit resultaat, eindvermogen en balans opnieuw aan."
    },
    {
      "id": "bv",
      "title": "Case 2 · Flevo Handel BV",
      "subtitle": "Waardering · belastingbrug · conceptjaarrekening",
      "intro": "Fictieve eenvoudige BV, boekjaar X; geen deelnemingen, financiering, latente belastingen of tijdelijke verschillen. Het gegeven oefentarief Vpb is 20% (geen actueel Nederlands tarief). De jaarrekening vóór onderstaande correcties heeft activa €150.000, schulden €50.000 en eigen vermogen €100.000. In dit eigen vermogen zit €30.000 resultaat vóór belasting; het beginvermogen is €70.000. Geen dividend of kapitaalmutaties. Omzet €200.000, kostprijs omzet €120.000, overige kosten €50.000. De gecorrigeerde proefbalans is niet gegeven: documenteer welke bronstukken je aanvullend nodig hebt.",
      "trial": [],
      "facts": [
        "Voorraad van €40.000 bevat incourante goederen met kostprijs €8.000 en gegeven netto-opbrengstwaarde €5.000. Waardeer €3.000 af, zowel commercieel als fiscaal.",
        "Een onbetaalde factuur voor geleverde diensten van €2.000 is vergeten. Deze kosten zijn commercieel en fiscaal aftrekbaar; voor deze oefening geen btw boeken.",
        "Een fiscale boete van €1.000 is al in de €50.000 overige kosten verwerkt. Deze blijft commercieel een last, maar is voor de fictieve fiscale winst niet aftrekbaar.",
        "Er zijn geen verdere fiscale verschillen of vooruitbetaalde Vpb. Boek de berekende belasting als nog te betalen.",
        "Maak een concept met balans, resultaat en grondslagen. Een volledige echte jaarrekening vergt aanvullende gegevens: vergelijkende cijfers, saldospecificaties, rechtsvormgegevens en toelichtingsinformatie. Benoem ontbrekende informatie; verzin die niet."
      ],
      "questions": [
        {
          "id": "pbt",
          "label": "Gecorrigeerde commerciële winst vóór belasting",
          "answer": 25000
        },
        {
          "id": "taxable",
          "label": "Fiscale winst",
          "answer": 26000
        },
        {
          "id": "tax",
          "label": "Belastinglast tegen gegeven oefentarief",
          "answer": 5200
        },
        {
          "id": "net",
          "label": "Resultaat na belasting",
          "answer": 19800
        },
        {
          "id": "assets",
          "label": "Gecorrigeerd balanstotaal",
          "answer": 147000
        },
        {
          "id": "equity",
          "label": "Eindvermogen",
          "answer": 89800
        }
      ],
      "solution": [
        "D voorraadlast 3.000 / C voorraad 3.000; D dienstenkosten 2.000 / C crediteuren 2.000.",
        "Commerciële winst: 30.000 − 3.000 − 2.000 = 25.000. Fiscale winst: 25.000 + niet-aftrekbare boete 1.000 = 26.000.",
        "Vpb volgens de case: 26.000 × 20% = 5.200. D belastinglast 5.200 / C te betalen Vpb 5.200.",
        "Resultaat na belasting 19.800. Activa 147.000; schulden 50.000 + 2.000 + 5.200 = 57.200; eigen vermogen 70.000 + 19.800 = 89.800.",
        "Winst-en-verlies: omzet 200.000 − kostprijs 123.000 − overige kosten 52.000 − belasting 5.200 = 19.800.",
        "Grootteklasse, vergelijkende cijfers en definitieve toelichtingen vereisen extra feiten; markeer het rapport daarom als onvolledig oefenconcept."
      ],
      "extension": "Maak een dossierverzoeklijst en voeg zelf een consistent fictief vergelijkend jaar toe, duidelijk gelabeld. Laat de gekozen grondslagen en toelichtingen reviewen."
    },
    {
      "id": "international",
      "title": "Case 3 · Een internationale groep",
      "subtitle": "EUR/USD · intragroepstransacties · mini-consolidatie",
      "intro": "Een afgebakende rekenoefening, geen volledige IFRS-jaarrekening. Parent bezit 100% van Sub; acquisitie-eliminatie, goodwill, belastingen, NCI en overige intragroepstransacties blijven buiten scope. Functionele valuta en presentatievaluta van beide entiteiten zijn EUR. Een USD-vordering betreft dus een transactie in vreemde valuta, geen omrekening van een buitenlandse bedrijfsactiviteit.",
      "trial": [],
      "facts": [
        "Parent heeft een externe handelsvordering van USD 10.000. Initiële koers: EUR 0,90 per USD. Slotkoers: EUR 0,95 per USD. Er is nog niet betaald.",
        "Parent verkoopt goederen intern aan Sub voor €15.000; kostprijs Parent €10.000. Sub heeft alles op balansdatum nog op voorraad. De factuur is volledig onbetaald.",
        "Vóór eliminaties is de som van de geboekte omzet €120.000 en van de kostprijs omzet €70.000. Deze bedragen bevatten de interne verkoop, maar nog geen valutacorrectie.",
        "De som van de opgenomen voorraad is €30.000, inclusief de intern ingekochte voorraad tegen €15.000.",
        "Maak de valuta-journaalpost, eliminatie interne vordering/schuld, omzet/kostprijs-eliminatie en eliminatie ongerealiseerde voorraadwinst."
      ],
      "questions": [
        {
          "id": "receivable",
          "label": "USD-vordering tegen slotkoers in EUR",
          "answer": 9500
        },
        {
          "id": "fx",
          "label": "Valutawinst in EUR",
          "answer": 500
        },
        {
          "id": "revenue",
          "label": "Groepsomzet na eliminatie",
          "answer": 105000
        },
        {
          "id": "cogs",
          "label": "Groepskostprijs omzet na beide winsteliminaties",
          "answer": 60000
        },
        {
          "id": "inventory",
          "label": "Groepsvoorraad na eliminatie interne winst",
          "answer": 25000
        }
      ],
      "solution": [
        "Vordering van 9.000 naar 9.500: D debiteuren 500 / C valutawinst 500.",
        "D interne schuld 15.000 / C interne vordering 15.000.",
        "D omzet 15.000 / C kostprijs omzet 15.000; daarna D kostprijs omzet 5.000 / C voorraad 5.000.",
        "Omzet: 120.000 − 15.000 = 105.000. Kostprijs: 70.000 − 15.000 + 5.000 = 60.000. Voorraad: 30.000 − 5.000 = 25.000.",
        "De valutawinst van 500 blijft apart van omzet. Met een andere functionele valuta van Sub zijn aanvullende omrekening en mogelijk OCI/valutareserve nodig; deze case toetst dat niet."
      ],
      "extension": "Volgende case: buitenlandse dochter met USD als functionele valuta, openingsnettoactiva, gemiddelde en historische koersen en een sluitende valutareserve. Laat het volledige model door een IFRS-specialist beoordelen."
    }
  ],
  "resources": [
    {
      "id": "exact-training",
      "group": "Nederlands & software",
      "name": "Exact Online trainingen",
      "url": "https://www.exact.com/nl/exact-online/support/trainingen",
      "language": "Nederlands",
      "access": "Aanbod en toegang verschillen per training/account",
      "purpose": "Handelingen oefenen in de software die je op werk gebruikt.",
      "action": "Zoek een training over memoriaal of jaarafsluiting. Herhaal de stappen in een aparte oefenadministratie en maak één aansluitstaat.",
      "stages": [
        "dossier",
        "aansluiten",
        "afsluiten"
      ]
    },
    {
      "id": "snelstart",
      "group": "Nederlands & software",
      "name": "SnelStart Academy — boekhouden",
      "url": "https://www.snelstart.nl/academy/e-learning/boekhouden-bundel",
      "language": "Nederlands",
      "access": "Bekijk actuele toegang en voorwaarden bij de aanbieder",
      "purpose": "Nederlandstalige uitleg over grootboek, btw, voorraad en eindejaarsverwerking.",
      "action": "Kies het onderwerp balans of eindejaarsverwerking. Schrijf na afloop zelf vijf afsluitboekingen; boekingsschermen zijn SnelStart-specifiek.",
      "stages": [
        "start",
        "dossier",
        "afsluiten"
      ]
    },
    {
      "id": "coach",
      "group": "Basis & losse oefeningen",
      "name": "AccountingCoach — afsluitboekingen oefenen",
      "url": "https://www.accountingcoach.com/adjusting-entries/quiz",
      "language": "Engels · Amerikaanse context",
      "access": "Online quiz vrij toegankelijk; extra PRO-materiaal betaald",
      "purpose": "Korte vragen over overlopende posten, vooruitbetalingen en afschrijvingen.",
      "action": "Maak eerst tien vragen zonder uitleg. Noteer elk fout antwoord met de juiste journaalpost. Gebruik dit voor de boekhoudtechniek; Nederlandse verslaggevingsregels toets je apart.",
      "stages": [
        "start",
        "afsluiten",
        "english"
      ]
    },
    {
      "id": "ot-fa",
      "group": "Basis & losse oefeningen",
      "name": "OpenTuition — Financial Accounting (FA)",
      "url": "https://opentuition.com/acca/fa/",
      "language": "Engels · ACCA",
      "access": "Gratis cursus, colleges en toetsen; registratie kan nodig zijn",
      "purpose": "Gestructureerde basis in dubbel boekhouden en financiële overzichten.",
      "action": "Kies een hoofdstuk bij jouw kennishiaat, bekijk het college en maak daarna de hoofdstuktoets. Bewaar je drie belangrijkste fouten in je bewijsnotities.",
      "stages": [
        "start",
        "dossier",
        "afsluiten",
        "english"
      ]
    },
    {
      "id": "kvk-micro",
      "group": "Nederlandse jaarrekening & naslag",
      "name": "KVK — jaarrekening micro en klein",
      "url": "https://www.kvk.nl/deponeren/jaarrekening-deponeren-bedrijfsklasse-micro-en-klein/",
      "language": "Nederlands",
      "access": "Vrij toegankelijk",
      "purpose": "Wat je voor een micro- of kleine rechtspersoon moet deponeren en via welke route.",
      "action": "Maak voor je fictieve BV een publicatiechecklist. Leg uit wat in de inrichtingsjaarrekening staat en wat bij KVK openbaar wordt. Oefen op papier; verzend geen fictieve deponering.",
      "stages": [
        "start",
        "jaarrekening",
        "zelfstandig"
      ]
    },
    {
      "id": "rjk",
      "group": "Nederlandse jaarrekening & naslag",
      "name": "RJnet — richtlijnen voor micro en klein",
      "url": "https://www.rjnet.nl/richtlijnen/kleine-bundel/",
      "language": "Nederlands",
      "access": "Uitleg vrij; volledige richtlijnen doorgaans via kantoor/abonnement",
      "purpose": "De juiste grondslagen, waardering en toelichtingen voor je Nederlandse case.",
      "action": "Zoek via de boekjaar-editie van je kantoor de regel voor één balanspost. Schrijf de bron, jouw keuze en het effect op de cijfers op.",
      "stages": [
        "waarderen",
        "jaarrekening",
        "zelfstandig"
      ]
    },
    {
      "id": "nba4410",
      "group": "Nederlandse jaarrekening & naslag",
      "name": "NBA — Standaard 4410 Samenstellingsopdrachten",
      "url": "https://www.nba.nl/wet--en-regelgeving/hra/1619/10430/10543/",
      "language": "Nederlands",
      "access": "Online tekst vrij toegankelijk",
      "purpose": "Begrijpen wat een accountant bij een samenstellingsopdracht doet en vastlegt.",
      "action": "Lees de onderdelen over uitvoering, documentatie en rapportage. Maak vijf reviewvragen voor je eigen oefendossier; bespreek je interpretatie met een senior.",
      "stages": [
        "dossier",
        "aansluiten",
        "jaarrekening",
        "zelfstandig"
      ]
    },
    {
      "id": "belasting",
      "group": "Nederlandse jaarrekening & naslag",
      "name": "Belastingdienst — fiscale versus commerciële winst",
      "url": "https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/zakelijk/winst/inkomstenbelasting/inkomstenbelasting_voor_ondernemers/winst_uit_onderneming",
      "language": "Nederlands · IB-context",
      "access": "Vrij toegankelijk",
      "purpose": "Waarom fiscale waardering en commerciële cijfers kunnen verschillen.",
      "action": "Maak een aansluiting met twee verschillen. Deze pagina gaat over inkomstenbelasting; bepaal voor een BV de toepasselijke Vpb-regels afzonderlijk.",
      "stages": [
        "waarderen"
      ]
    },
    {
      "id": "ifrs-modules",
      "group": "Internationaal & vervolg",
      "name": "IFRS Foundation — officiële oefenmodules",
      "url": "https://www.ifrs.org/supporting-implementation/2025-ifrs-for-smes-supporting-materials/modules/",
      "language": "Engels · IFRS for SMEs",
      "access": "Officiële leermaterialen; registratie kan nodig zijn",
      "purpose": "Uitleg, voorbeelden en assessments bij de derde editie van IFRS for SMEs.",
      "action": "Begin met module 1 en 2; ga daarna naar voorraad (13), vaste activa (17), omzet (23) en valuta (30). Controleer op de overzichtspagina de editie en beschikbaarheid van de gekozen module.",
      "stages": [
        "smes",
        "group"
      ]
    },
    {
      "id": "ot-fr",
      "group": "Internationaal & vervolg",
      "name": "OpenTuition — Financial Reporting (FR)",
      "url": "https://opentuition.com/acca/fr/",
      "language": "Engels · ACCA/IFRS",
      "access": "Gratis leermateriaal; registratie kan nodig zijn",
      "purpose": "Verdieping in verslaggeving, financiële overzichten en consolidatie.",
      "action": "Kies eerst één onderwerp dat je uit de Nederlandse route kent. Maak een verschilnotitie en daarna een groepsopgave. Deze cursus behandelt niet automatisch de Nederlandse RJk-regels.",
      "stages": [
        "english",
        "smes",
        "group"
      ]
    },
    {
      "id": "acca",
      "group": "Internationaal & vervolg",
      "name": "ACCA — Financial Reporting examenoefeningen",
      "url": "https://www.accaglobal.com/ie/en/student/exam-support-resources/fundamentals-exams-study-resources/f7/cbe-question-practice.html",
      "language": "Engels · ACCA/IFRS",
      "access": "Uitleg openbaar; Practice Platform vraagt om inloggen/toegang",
      "purpose": "Specimen- en examenvragen met uitwerkingen om je toepassing te toetsen.",
      "action": "Kies een vraag over een enkelvoudige jaarrekening en later consolidatie. Werk eerst zelf uit en vergelijk met de marking guide; toegang en syllabusjaar bepalen welke vragen beschikbaar zijn.",
      "stages": [
        "smes",
        "group"
      ]
    },
    {
      "id": "ifrs18",
      "group": "Internationaal & vervolg",
      "name": "IFRS Foundation — IFRS 18",
      "url": "https://www.ifrs.org/issued-standards/list-of-standards/ifrs-18-presentation-and-disclosure-in-financial-statements/",
      "language": "Engels · full IFRS",
      "access": "Overzicht vrij; volledige tekst kan registratie vereisen",
      "purpose": "De presentatiestandaard die onder full IFRS vanaf boekjaren beginnend in 2027 IAS 1 vervangt.",
      "action": "Maak een korte notitie over ingangsdatum en presentatiegevolgen. Pas deze full-IFRS-wijziging niet automatisch toe op Dutch GAAP of IFRS for SMEs.",
      "stages": [
        "group"
      ]
    }
  ]
};
})();
