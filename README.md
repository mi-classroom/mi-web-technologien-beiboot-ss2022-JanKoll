# Web Technologien // begleitendes Projekt Sommersemester 2022

Zum Modul Web Technologien gibt es ein begleitendes Projekt. Im Rahmen dieses Projekts werden wir von Veranstaltung zu Veranstaltung ein Projekt sukzessive weiter entwickeln und uns im Rahmen der Veranstaltung den Fortschritt anschauen, Code Reviews machen und Entwicklungsschritte vorstellen und diskutieren.

Als organisatorischen Rahmen für das Projekt nutzen wir GitHub Classroom. Inhaltlich befassen wir uns mit der Entwicklung einer kleinen Web-Anwendung für die Bearbeitung von Bildern. Hierbei steht weniger ein professioneller Konzeptions-, Entwurfs- und Entwicklungsprozess im Vordergrund, sondern vielmehr die sukzessive Weiterentwicklung einer Anwendung, das Ausprobieren, Vergleichen, Refactoren und die Freude an lauffähigem Code.

## Setup

- Auf dem Gerät muss Docker-Compose installiert sein.
- In den `backend/data` Ordner muss die `cda-paintings-2022-04-22.de.json` gelegt werden.
<!-- - Wenn **nicht** lokal gearbeitet wird, müssen die *env* in
    - `client/src/env.js` und
    - `server/.env` angepasst werden -->

Um das Projekt auszuführen, muss folgender Befehl im `root` Verzeichnis eingegeben werden:
```bash
docker-compose up
```

Damit Codeänderungen vorgenommen werden, 
muss folgender Befehl im `root` Verzeichnis eingegeben werden:
```bash
docker-compose up --build
```

## Projekt im Web
Die Anwendung kann unter [beiboot.jankoll.online](wss://beiboot.jankoll.online) erreicht werden.

## Zeitaufwand

| **Issue**            | **Zeit** |
|----------------------|----------|
| Basisfunktionen (#1) | 2h       |
| Review Process  (#2) | 0h       |
| 3D Zeitstrahl   (#3) | 15h      |
| Relationen      (#4) | 5h       |
| Explore more    (#5) | 7h       |

> Features für #5
> - Timeline
> - Zoom
> - Animations (+scrool to image)
> - Legende