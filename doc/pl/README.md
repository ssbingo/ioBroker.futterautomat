![Logo](../../admin/futterautomat.png)
# ioBroker.futterautomat

<p align="center">
  <a href="https://www.buymeacoffee.com/ssbingo"><img src="https://img.buymeacoffee.com/button-api/?text=Buy%20me%20a%20coffee&emoji=&slug=ssbingo&button_colour=FFDD00&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=ffffff" /></a>
</p>

## Adapter futterautomat dla ioBroker

Sterowanie (przerobionymi) automatami do karmienia. Adapter zgodnie z harmonogramem włącza i
wyłącza do **5 dowolnie wybieranych przełączników** (istniejących obiektów ioBroker) na
konfigurowalny czas („karmienie"). Opcjonalnie uwzględniane są temperatura powietrza i wody, a
na podstawie współrzędnych geograficznych obliczana jest pozycja słońca, aby nie karmić w nocy.

### Funkcje

* Do 5 przełączników, każdy z dowolnie wybieraną nazwą (= własna karta konfiguracji).
* Dwa tryby karmienia na przełącznik:
  * **Stałe godziny** (np. 08:00 i 18:00).
  * **Interwał w oknie czasowym** (np. co 60 min między 08:00 a 18:00).
* Konfigurowalny **czas karmienia w sekundach** na przełącznik.
* **Blokada temperaturowa**: blokowanie karmienia poniżej lub powyżej dowolnie ustawianych
  temperatur wody i/lub powietrza.
* **Ochrona nocna** na podstawie wschodu/zachodu słońca z konfigurowalnym przesunięciem
  (rano/wieczór).
* **Wyzwalanie ręczne** (`feedNow`) na przełącznik oraz **przycisk „Nakarm teraz"** z
  wybieralnym czasem; opcjonalnie z pominięciem wszystkich blokad.
* **Nadzór przełączania** na przełącznik: sprawdza, czy przełącznik faktycznie się włącza i
  wyłącza (wymaga przełącznika zgłaszającego swój stan, `ack=true`), z opcjonalnymi
  **powiadomieniami Telegram** (udane karmienie / nie wykonano / awaria wyłączenia).

### Konfiguracja

**Karta „Ustawienia ogólne"**
* **Lokalizacja (wymagana)**: użyć ustawień systemowych *lub* zdefiniować ręcznie – poprzez
  wyszukiwanie adresu i znacznik na mapie OpenStreetMap (bez klucza API).
* **Okno słoneczne**: przesunięcia w minutach po wschodzie / przed zachodem słońca.
* **Źródła temperatury**: włączyć temperaturę powietrza i wody oraz wybrać odpowiedni obiekt.
* **Przełączniki**: dodać przełączniki (maks. 5), nadać nazwy, wybrać obiekt, aktywować.

**Karta przełącznika** (tworzona dynamicznie, z nazwą przełącznika)
* Tryb (stałe godziny / interwał), godziny lub okno + interwał, czas karmienia, blokada
  temperaturowa, opcje nocne/ręczne, nadzór przełączania, powiadomienia Telegram, przycisk
  ręcznego karmienia.

### Punkty danych

Globalne:
* `info.connection` – adapter działa / konfiguracja prawidłowa
* `airTemperature`, `waterTemperature` – aktualnie zmierzone temperatury
* `sunrise`, `sunset` – obliczone godziny

Na przełącznik w `switches.<id>.`:
* `feedingActive` – karmienie w toku
* `lastFeeding`, `nextFeeding` – ostatnie / następne karmienie
* `blocked`, `blockReason` – obecnie zablokowane + powód
* `lastResult`, `error` – wynik ostatniej próby + flaga awarii
* `feedNow` – wyzwalanie ręczne (zapisywalne)

> Uwaga: wyszukiwanie adresu/geokodowanie (Nominatim) oraz kafelki mapy wymagają dostępu do
> internetu. Geokodowanie działa w backendzie adaptera; instancja musi być uruchomiona.

---

📖 [Dokumentacja główna (angielski)](../../README.md)
