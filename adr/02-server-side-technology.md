# Server side technology

## Status

proposed

## Context

Die Verarbeitung von Informationen muss (teilweise) vom Server übernommen werden. Außerdem gibt dieser Informationen an den Client (REST oder GraphQL).

## Decision

Deno.land wird auf Serverseite zum Einsatz kommen.

## Consequences

Deno.land ist leichtgewichtig und schnell aufzusetzen. Es basiert auf der Chrome V8-Engine und ist damit vielseitig erweiterbar. Durch die in Deno verwobenen Rechtefreigaben bietet es von Haus aus solide Sicherheitsmechanismen. 