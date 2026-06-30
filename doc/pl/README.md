![Logo](../../admin/automatic-feeder.png)
# ioBroker.automatic-feeder

<p align="center">
  <a href="https://www.buymeacoffee.com/ssbingo"><img src="https://img.buymeacoffee.com/button-api/?text=Buy%20me%20a%20coffee&emoji=&slug=ssbingo&button_colour=FFDD00&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=ffffff" /></a>
</p>

## Adapter automatic-feeder dla ioBroker

Ten adapter zamienia dowolny, już istniejący przełącznik ioBroker (gniazdko,
przekaźnik, wyjście GPIO …) w **sterowany czasowo automat do karmienia**. Włącza on
wyjście o ustalonych przez Ciebie porach na zdefiniowaną liczbę sekund i może przy tym
uwzględniać temperaturę oraz zmianę dnia i nocy, aby karmienie nigdy nie odbywało się o
niewłaściwej porze.

Ten dokument jest kompletną instrukcją. Jeśli nigdy wcześniej nie korzystałeś z adaptera,
przeczytaj go od góry do dołu – **Szybki start** doprowadzi Cię w kilka minut do pierwszego
karmienia, a reszta wyjaśnia każde ustawienie szczegółowo.

---

## Spis treści

1. [Co robi adapter](#1-co-robi-adapter)
2. [Wymagania](#2-wymagania)
3. [Instalacja](#3-instalacja)
4. [Szybki start](#4-szybki-start--pierwsze-karmienie)
5. [Strona ustawień szczegółowo](#5-strona-ustawień-szczegółowo)
6. [Obiekty / punkty danych](#6-obiekty--punkty-danych)
7. [Przykłady / przepisy](#7-przykłady--przepisy)
8. [Powiadomienia Telegram](#8-powiadomienia-telegram)
9. [Rozwiązywanie problemów i FAQ](#9-rozwiązywanie-problemów-i-faq)
10. [Logowanie i diagnostyka](#10-logowanie-i-diagnostyka)

---

## 1. Co robi adapter

„Karmienie" jest w istocie bardzo proste: **wyjście WŁ → odczekanie ustawialnej liczby
sekund → ponowne WYŁ**. W przebudowanym automacie do karmienia w tym czasie pracuje silnik i
wydaje porcję karmy.

Adapter zarządza **maksymalnie 5 przełącznikami**, każdy całkowicie niezależnie i z własną
zakładką konfiguracji nazwaną według przełącznika. Dla każdego przełącznika określasz:

* **kiedy** odbywa się karmienie – albo o **stałych porach** (np. 08:00 i 18:00), albo w
  **interwale** w obrębie okna czasowego (np. co 60 minut między 08:00 a 18:00);
* **jak długo** wyjście pozostaje włączone (czas karmienia w sekundach);
* **czy blokować** karmienie, gdy temperatura wody lub powietrza jest zbyt niska/wysoka;
* **czy w nocy** nie karmić (na podstawie rzeczywistego wschodu/zachodu słońca dla Twojej
  lokalizacji);
* **czy proces przełączania jest monitorowany** (sprawdzenie, czy rzeczywiście doszło do
  włączenia i wyłączenia) oraz opcjonalnie czy wysyłana jest wiadomość **Telegram** z wynikiem.

Karmienie możesz w dowolnej chwili wyzwolić **ręcznie** – bezpośrednio na stronie ustawień
(przycisk z dowolnie wybieranym czasem) lub poprzez punkt danych (np. przycisk w widoku
VIS).

> Ważne: Adapter nie tworzy sam przełącznika. **Steruje już istniejącym obiektem** w Twoim
> ioBroker. Ten obiekt wybierasz w konfiguracji.

---

## 2. Wymagania

| Czego potrzebujesz | Szczegóły |
|-------------|---------|
| **ioBroker** z aktualnym **admin** (≥ 7) | Strona konfiguracji jest zrealizowana w React. |
| **Obiekt przełącznika** | Zapisywalny punkt danych ioBroker, który włącza/wyłącza automat do karmienia – np. gniazdko (`shelly.0.…`, `sonoff.0.…`, `zigbee.0.…`), przekaźnik lub zmienna skryptowa. |
| **Współrzędne geograficzne** | Do obliczania wschodu/zachodu słońca. Albo z ustawień systemowych ioBroker, albo poprzez adres/mapę. **Obowiązkowe.** |
| *(opcjonalnie)* Obiekty temperatury | Istniejące punkty danych z temperaturą powietrza i/lub wody, jeśli chcesz blokować w zależności od temperatury. |
| *(opcjonalnie)* Instancja **Telegram** | Oficjalny adapter `telegram`, skonfigurowany i uruchomiony, jeśli chcesz otrzymywać powiadomienia push. |
| Dostęp do internetu na hoście ioBroker | Tylko do wyszukiwania adresu/mapy w konfiguracji. Normalna praca przebiega offline. |

---

## 3. Instalacja

1. W **admin** ioBroker otwórz zakładkę **Adapter**.
2. Znajdź **automatic-feeder** na liście adapterów i kliknij **Zainstaluj**.
3. Utwórz **instancję** adaptera.
4. Otwórz ustawienia instancji (ikona zębatki) – powinna pojawić się strona konfiguracji z
   zakładką **Ustawienia podstawowe** (Grundeinstellungen). Jeśli pozostaje pusta, zobacz [Rozwiązywanie problemów](#9-rozwiązywanie-problemów-i-faq).

---

## 4. Szybki start – pierwsze karmienie

Cel: Przełącznik ma – natychmiast, w ramach testu – karmić przez 5 sekund.

1. **Otwórz ustawienia** instancji automatic-feeder.
2. W zakładce **Ustawienia podstawowe** (Grundeinstellungen):
   * W sekcji **Lokalizacja** (Standort) pozostaw *Przejmij ustawienia systemowe*, jeśli Twój
     ioBroker ma już współrzędne. W przeciwnym razie wybierz *Ustaw lokalizację indywidualnie*,
     wpisz adres, kliknij **Szukaj** i potwierdź znacznik na mapie.
   * Przewiń w dół do sekcji **Przełączniki** (Schalter) i kliknij **Dodaj przełącznik**.
   * Nadaj **nazwę** (np. `Koi-Teich`). Ta nazwa stanie się tytułem osobnej zakładki.
   * Obok **Obiekt przełącznika** kliknij ikonę listy i wybierz punkt danych, który steruje
     Twoim automatem (np. Twoje gniazdko). Przełącznik musi być **aktywny** (haczyk po lewej).
3. **Zapisz** (dyskietka/haczyk u dołu). Pojawi się nowa zakładka z nazwą Twojego przełącznika.
4. Otwórz tę **zakładkę przełącznika**. Na samej górze w sekcji **Karmienie ręczne** ustaw czas
   trwania (np. `5` sekund) i kliknij **Nakarm teraz**. Wyjście powinno włączyć się na 5 sekund,
   a następnie ponownie wyłączyć.
5. W tej samej zakładce skonfiguruj rzeczywisty harmonogram w sekcji **Plan karmienia** (np. stałe
   pory 08:00 i 18:00) oraz ustaw **Czas karmienia** w sekcji **Proces karmienia**, następnie
   **Zapisz**.

Gotowe – od teraz adapter karmi automatycznie. Wszystko pozostałe wyjaśnia opcje szczegółowo.

---

## 5. Strona ustawień szczegółowo

Konfiguracja ma zakładkę **Ustawienia podstawowe** (Grundeinstellungen) oraz **jedną zakładkę na
każdy przełącznik** (tworzoną automatycznie, gdy tylko przełącznik otrzyma nazwę). Jeśli strona
się nie przewija, powiększ okno lub użyj paska przewijania po prawej stronie – wszystkie sekcje są
dostępne.

### 5.1 Zakładka „Ustawienia podstawowe"

#### Lokalizacja (obowiązkowo)

Adapter potrzebuje Twojego położenia geograficznego, aby obliczyć wschód i zachód słońca (dla
blokady nocnej). Dwie możliwości:

* **Przejmij ustawienia systemowe** – pobiera szerokość/długość geograficzną z konfiguracji
  systemowej ioBroker (zalecane, jeśli są tam już ustawione). Wyświetlane są aktualne wartości.
* **Ustaw lokalizację indywidualnie** – określ położenie samodzielnie:
  * Wpisz **adres** i naciśnij **Szukaj**. Adapter go rozpozna (poprzez
    OpenStreetMap / Nominatim) i ustawi znacznik.
  * Albo **kliknij na mapę** / **przeciągnij znacznik**, aby wybrać dokładne miejsce.
  * Szerokość/długość geograficzną można też wpisać bezpośrednio; mapa podąży za wartościami.

> Wyszukiwanie adresu działa w zapleczu (backend) adaptera, dlatego **instancja musi być
> uruchomiona**. Mapa i wyszukiwanie wymagają dostępu do internetu.

#### Okno słoneczne (brak karmienia w nocy)

Określa okno czasowe, w którym wolno karmić:

* **Minuty po wschodzie słońca** – karm dopiero tyle minut *po* wschodzie słońca.
* **Minuty przed zachodem słońca** – zakończ tyle minut *przed* zachodem słońca.

Przykład: Przy wschodzie słońca o 06:30, zachodzie o 21:00 i przesunięciach 30 / 30 karmienie jest
dozwolone tylko między **07:00 a 20:30**. Każdy przełącznik może to okno uwzględniać lub
ignorować indywidualnie (zobacz *Ograniczenia* w zakładce przełącznika). Obliczone czasy znajdują
się ponadto w punktach danych `sunrise` / `sunset` i są co noc automatycznie obliczane na nowo.

#### Źródła temperatury

Do blokowania w zależności od temperatury aktywuj tutaj źródła i wybierz obiekty:

* **Temperatura powietrza** – zaznacz haczyk i wybierz punkt danych z temperaturą powietrza.
* **Temperatura wody** – zaznacz haczyk i wybierz punkt danych z temperaturą wody.

Sensowne są tylko liczbowe punkty danych. Aktualne wartości są odzwierciedlane w punktach danych
`airTemperature` / `waterTemperature`. Właściwe progi ustawia się **dla każdego
przełącznika** (zobacz *Blokada temperaturowa*).

#### Przełączniki

Lista automatów do karmienia (maksymalnie 5). Dla każdego wpisu:

* **Aktywny** (haczyk) – planowane są tylko aktywne przełączniki.
* **Nazwa** – dowolny tekst; staje się tytułem zakładki przełącznika i nazwą kanału w drzewie
  obiektów.
* **Obiekt przełącznika** – istniejący punkt danych ioBroker, który jest sterowany. Wybierz przez
  ikonę listy, wyczyść przez krzyżyk.

Za pomocą **Dodaj przełącznik** tworzysz kolejny (maks. 5), za pomocą ikony kosza usuwasz jeden.
Przy usuwaniu kasowane są także jego punkty danych.

### 5.2 Zakładki przełączników

Każdy skonfigurowany przełącznik otrzymuje własną zakładkę z jego nazwą. Zawiera ona następujące
sekcje.

#### Karmienie ręczne

* **Czas karmienia ręcznego (sekundy)** – czas używany przez przycisk.
* **Nakarm teraz** – natychmiast wyzwala karmienie o tym czasie. Praktyczne do testowania lub
  dla dodatkowej porcji. (To, czy blokady są ignorowane, zależy od *Ręczny wyzwalacz ignoruje
  wszystkie blokady* w sekcji *Ograniczenia*.)
* Aby użyć przycisku, instancja musi być uruchomiona, a konfiguracja **zapisana**.

#### Plan karmienia

Wybierz **jeden** tryb:

* **Stałe pory** – lista godzin (`HH:mm`). Dodaj dowolną liczbę; automat działa codziennie o
  każdej z nich. Przykład: `08:00` i `18:00`.
* **Interwał w obrębie okresu** – karmienie powtarzane w obrębie okna:
  * **Początek okresu** / **Koniec okresu** – np. od 08:00 do 18:00.
  * **Interwał (minuty)** – np. 60 → karmi codziennie o 08:00, 09:00, … aż do końca okna.

Następna zaplanowana pora znajduje się zawsze w punkcie danych `nextFeeding`.

#### Proces karmienia

* **Czas karmienia (sekundy)** – jak długo wyjście pozostaje WŁ podczas zaplanowanego karmienia.
* **Wartość WŁ** / **Wartość WYŁ** – wartości zapisywane do obiektu przełącznika.
  Domyślnie są to `true` i `false`, co pasuje do większości gniazdek/przekaźników. Jeśli Twoje
  urządzenie oczekuje liczb lub tekstu, wpisz tutaj np. `1` / `0` lub `ON` / `OFF`.

#### Blokada temperaturowa

Wyświetlana tylko dla źródeł temperatury aktywowanych w ustawieniach podstawowych. Dla każdego
przełącznika:

* **Blokuj według temperatury wody** – *Blokuj jeśli poniżej* i/lub *Blokuj jeśli powyżej* (°C).
* **Blokuj według temperatury powietrza** – to samo dla powietrza.

Jeśli aktualna temperatura leży poza dozwolonym zakresem, karmienie zostaje pominięte,
a powód zapisany w `blockReason`. (Jeśli wartość temperatury jest nieznana, to źródło nie
blokuje.)

#### Ograniczenia

* **Nie karm w nocy** – uwzględnia okno słoneczne (wraz z przesunięciami). Wyłącz, jeśli ten
  przełącznik może karmić przez całą dobę.
* **Ręczny wyzwalacz ignoruje wszystkie blokady** – gdy aktywne, przycisk oraz punkt danych
  `feedNow` karmią również przy aktywnej blokadzie temperaturowej/nocnej.

#### Monitorowanie przełączania

Po przełączeniu adapter może sprawdzić, czy przełącznik **rzeczywiście** osiągnął stan
włączenia i wyłączenia, i zgłasza dla każdego karmienia jeden z trzech wyników:

| Wynik | Znaczenie | Komunikat |
|----------|-----------|---------|
| ✅ Sukces | przełącznik włączył i wyłączył się zgodnie z oczekiwaniem | „Karmienie uruchomione na x s." |
| ❌ Włączenie nie powiodło się | przełącznik nigdy nie potwierdził stanu WŁ | „Nie udało się przeprowadzić karmienia. Sprawdź przełącznik!" |
| ❌ Wyłączenie nie powiodło się | włączył się, ale nie wyłączył ponownie | „Awaria: automat do karmienia nie wyłączył się!" |

> Wiadomość jest wysyłana w ustawionym języku systemowym ioBroker (domyślnie angielski).


* **Sprawdzaj, czy przełącznik rzeczywiście włącza i wyłącza** – aktywuje monitorowanie.
* **Limit czasu monitorowania (sekundy)** – jak długo czekać na potwierdzenie.

> **Ważne:** Monitorowanie działa tylko wtedy, gdy przełącznik **zgłasza zwrotnie swój
> rzeczywisty stan**, tzn. obiekt docelowy jest aktualizowany z `ack=true` (typowe dla
> gniazdek/przekaźników z potwierdzeniem stanu). Prosta zmienna pomocnicza typu boolean, której
> nikt nie potwierdza, zawsze zgłaszałaby usterkę – wtedy wyłącz monitorowanie dla tego
> przełącznika.

Wynik znajduje się ponadto w punktach danych `lastResult` (tekst) i `error` (boolean),
dzięki czemu możesz na niego reagować (np. wyzwolić własne powiadomienie).

#### Powiadomienia Telegram

Wysyła komunikaty monitorowania przełączania do Telegrama – konfigurowane **dla każdego
przełącznika**:

* **Instancja Telegram** – wybierz jedną z zainstalowanych instancji `telegram.*` (lub *Brak*, aby
  wyłączyć Telegram dla tego przełącznika). Jeśli żadna nie jest zainstalowana, pole o tym
  informuje.
* **Odbiorca Telegram (opcjonalnie)** – określony użytkownik/nazwa czatu, jak skonfigurowano w
  adapterze telegram; pozostaw puste, aby wysyłać do wszystkich skonfigurowanych odbiorców.
* **Pola wyboru** – wybierz, które komunikaty są wysyłane: udane karmienie, niewykonalne
  i/lub usterka wyłączenia.

Pełna konfiguracja znajduje się w sekcji [Powiadomienia Telegram](#8-powiadomienia-telegram).

---

## 6. Obiekty / punkty danych

Adapter tworzy następujące punkty danych w swojej przestrzeni nazw
(`automatic-feeder.<instanz>.`).

**Globalne**

| Punkt danych | Typ | Znaczenie |
|------------|-----|-----------|
| `info.connection` | boolean (ro) | Adapter działa, a konfiguracja jest prawidłowa. |
| `airTemperature` | number (ro) | Odzwierciedlenie skonfigurowanego źródła temperatury powietrza. |
| `waterTemperature` | number (ro) | Odzwierciedlenie skonfigurowanego źródła temperatury wody. |
| `sunrise` / `sunset` | string (ro) | Obliczony wschód/zachód słońca na dziś. |

**Dla każdego przełącznika pod `switches.<id>.`** (`<id>` to wewnętrzny identyfikator, np. `sw-0`)

| Punkt danych | Typ | Znaczenie |
|------------|-----|-----------|
| `feedingActive` | boolean (ro) | Właśnie trwa karmienie. |
| `lastFeeding` | string (ro) | Moment ostatniego karmienia. |
| `nextFeeding` | string (ro) | Moment następnego zaplanowanego karmienia. |
| `blocked` | boolean (ro) | Ostatnia próba była zablokowana. |
| `blockReason` | string (ro) | Powód zablokowania (noc/temperatura). |
| `lastResult` | string (ro) | Tekst wyniku ostatniej próby karmienia. |
| `error` | boolean (ro) | Ostatnia próba miała usterkę przełączania. |
| `feedNow` | boolean (rw) | Zapisz `true`, aby nakarmić ręcznie. |

Te punkty danych można wykorzystać w VIS, skryptach lub innych adapterach – np. wyświetlić
`nextFeeding` na pulpicie albo wyzwolić własny alarm przy `error = true`.

---

## 7. Przykłady / przepisy

**Staw koi, dwa razy dziennie, tylko przy wystarczającym cieple**
* Tryb *Stałe pory* → `08:00`, `18:00`; czas `6` s.
* Aktywuj temperaturę wody w ustawieniach podstawowych, następnie w zakładce przełącznika *Blokuj
  według temperatury wody* → *Blokuj jeśli poniżej* `8` °C (brak karmienia przy zbyt zimnej wodzie).
* Włącz *Nie karm w nocy*.

**Woliera, częste małe porcje w ciągu dnia**
* Tryb *Interwał w obrębie okresu* → 07:00–19:00, interwał `90` min; czas `3` s.

**Ręczna dodatkowa porcja przez przycisk VIS**
* W VIS utwórz przycisk, który zapisuje `true` do `automatic-feeder.0.switches.sw-0.feedNow`.
* Opcjonalnie aktywuj *Ręczny wyzwalacz ignoruje wszystkie blokady*, aby karmienie zawsze
  następowało.

---

## 8. Powiadomienia Telegram

1. Zainstaluj i skonfiguruj adapter **telegram** (utwórz bota za pomocą @BotFather, wpisz token,
   rozpocznij czat z botem). Instancja Telegram musi być **uruchomiona**.
2. W **zakładce przełącznika** automatic-feeder otwórz sekcję **Powiadomienia Telegram**:
   * Wybierz **instancję Telegram** z listy rozwijanej (np. `telegram.0`).
   * Opcjonalnie wpisz **odbiorcę** (użytkownik/nazwa czatu wyświetlana w adapterze telegram);
     pozostaw puste, aby powiadomić wszystkich.
   * Zaznacz żądane komunikaty: *udane karmienie*, *niewykonalne*,
     *usterka wyłączenia*.
3. Zapisz. Od teraz wybrane wyniki monitorowania są wysyłane do Telegrama (poprzedzone nazwą
   przełącznika). Warunkiem jest, aby *Monitorowanie przełączania* było aktywowane dla tego
   przełącznika.

---

## 9. Rozwiązywanie problemów i FAQ

**Strona ustawień jest pusta / biała.**
Przeładuj przeglądarkę za pomocą **Strg+Shift+R**. Jeśli problem nadal występuje, uruchom
ponownie instancję i otwórz ustawienia jeszcze raz.

**Nowa ikona / zmiana nie pojawia się.**
Pamięć podręczna przeglądarki. Przeładuj na twardo za pomocą **Strg+Shift+R**.

**Karmienie w ogóle się nie odbywa.**
Sprawdź po kolei: przełącznik **Aktywny**; wybrany **obiekt przełącznika**; prawidłowy
**harmonogram** (`nextFeeding` pokazuje czas); brak **blokady** (sprawdź `blocked` / `blockReason`);
**okno słoneczne** nie wyklucza danego czasu; ustaw **poziom logowania** instancji na `debug`
i obserwuj log.

**W nocy nigdy nie ma karmienia, choć tego chcę.**
Albo dezaktywuj *Nie karm w nocy* dla tego przełącznika, albo dostosuj przesunięcia słoneczne.
Bez prawidłowych współrzędnych blokada nocna jest dezaktywowana (i zapisywane jest ostrzeżenie
w logu).

**Monitorowanie zawsze zgłasza usterkę.**
Twój obiekt przełącznika prawdopodobnie nie zgłasza zwrotnie swojego rzeczywistego stanu
(`ack=true`). Albo użyj przełącznika z potwierdzeniem stanu, albo dezaktywuj *Monitorowanie
przełączania* dla tego przełącznika.

**Wyszukiwanie adresu mówi, że instancja musi być uruchomiona.**
Uruchom instancję automatic-feeder – geokodowanie działa w zapleczu (backend).

**Wiadomości Telegram nie docierają.**
Czy w zakładce przełącznika wybrana jest instancja Telegram? Czy adapter telegram jest
skonfigurowany i uruchomiony? Czy zaznaczono co najmniej jeden rodzaj komunikatu i aktywowano
*Monitorowanie przełączania*?

---

## 10. Logowanie i diagnostyka

Adapter zapisuje logi na zwykłych poziomach ioBroker. Aby uzyskać szczegółowe komunikaty,
podnieś poziom logowania instancji (Instancje → automatic-feeder.x → poziom logowania) do
**debug** lub **silly**:

* **error** – błędy wymagające uwagi (np. nieudany zapis do przełącznika).
* **warn** – błędna konfiguracja (brak współrzędnych, nieprawidłowy harmonogram …).
* **info** – kamienie milowe (start, wykonane lub zablokowane karmienie, ręczny wyzwalacz).
* **debug** – szczegółowy przebieg (decyzje planowania, aktualizacje temperatury, geokodowanie,
  wartości WŁ/WYŁ, weryfikacja potwierdzona/limit czasu).
* **silly** – bardzo szczegółowe śledzenie (każdy timer, każde sprawdzenie blokady, każda zmiana
  stanu).

---

📖 [Dokumentacja główna (angielski)](../../README.md)
