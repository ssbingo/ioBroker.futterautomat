![Logo](../../admin/futterautomat.png)
# ioBroker.futterautomat

<p align="center">
  <a href="https://www.buymeacoffee.com/ssbingo"><img src="https://img.buymeacoffee.com/button-api/?text=Buy%20me%20a%20coffee&emoji=&slug=ssbingo&button_colour=FFDD00&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=ffffff" /></a>
</p>

## Adaptador futterautomat para ioBroker

Controlo para alimentadores automáticos (modificados). O adaptador liga e desliga até
**5 interruptores de livre escolha** (objetos ioBroker existentes) segundo um agendamento
durante uma duração configurável («alimentação»). Opcionalmente são consideradas a temperatura
do ar e da água e, através das coordenadas geográficas, é calculada a posição do sol para não
alimentar à noite.

### Funcionalidades

* Até 5 interruptores, cada um com um nome livre (= separador de configuração próprio).
* Dois modos de alimentação por interruptor:
  * **Horas fixas** (p. ex. 08:00 e 18:00).
  * **Intervalo dentro de uma janela horária** (p. ex. a cada 60 min entre 08:00 e 18:00).
* **Duração de alimentação em segundos** configurável por interruptor.
* **Bloqueio por temperatura**: bloquear a alimentação abaixo ou acima de temperaturas de água
  e/ou ar de livre escolha.
* **Proteção noturna** através do nascer/pôr do sol com deslocamento configurável (manhã/noite).
* **Acionamento manual** (`feedNow`) por interruptor e um **botão «Alimentar agora»** com
  duração selecionável; opcionalmente ignorando todos os bloqueios.
* **Supervisão da comutação** por interruptor: verifica se o interruptor realmente liga e
  desliga (requer um interruptor que comunique o seu estado, `ack=true`), com **notificações
  Telegram** opcionais (alimentação bem-sucedida / não realizada / falha ao desligar).

### Configuração

**Separador «Definições gerais»**
* **Localização (obrigatória)**: usar as definições do sistema *ou* definir manualmente –
  através de pesquisa de endereço e um marcador num mapa OpenStreetMap (sem chave API).
* **Janela solar**: deslocamentos em minutos após o nascer / antes do pôr do sol.
* **Fontes de temperatura**: ativar a temperatura do ar e da água e escolher o respetivo
  objeto.
* **Interruptores**: adicionar interruptores (máx. 5), atribuir nomes, selecionar o objeto,
  ativar.

**Separador por interruptor** (criado dinamicamente, com o nome do interruptor)
* Modo (horas fixas / intervalo), horas ou janela + intervalo, duração de alimentação, bloqueio
  por temperatura, opções de noite/manual, supervisão da comutação, notificações Telegram,
  botão de alimentação manual.

### Pontos de dados

Global:
* `info.connection` – adaptador em funcionamento / configuração válida
* `airTemperature`, `waterTemperature` – temperaturas atualmente medidas
* `sunrise`, `sunset` – horas calculadas

Por interruptor em `switches.<id>.`:
* `feedingActive` – alimentação em curso
* `lastFeeding`, `nextFeeding` – última / próxima alimentação
* `blocked`, `blockReason` – atualmente bloqueado + motivo
* `lastResult`, `error` – resultado da última tentativa + indicador de falha
* `feedNow` – acionamento manual (gravável)

> Nota: a pesquisa de endereço/geocodificação (Nominatim) e os mosaicos do mapa requerem
> acesso à Internet. A geocodificação é executada no backend do adaptador; a instância tem de
> estar em execução.

---

📖 [Documentação principal (inglês)](../../README.md)
