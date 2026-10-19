# Dip Smash Burger: dipsmashburger.com

Denizli'deki Dip Smash Burger'in menü sitesi. Tek sayfa, derleme gerektirmeyen düz HTML/CSS/JS.
Masadaki QR kodu doğrudan menüye açmak için `https://dipsmashburger.com/#menu` adresini kullanın.

## Menü ve fiyat güncelleme

Menünün tek kaynağı `menu.json` dosyasıdır.

1. `menu.json` içinde fiyatı, ürün adını ya da açıklamayı değiştirin. Yeni ürün eklemek için ilgili
   kategorinin `items` listesine `{ "name": "...", "price": 0, "desc": "..." }` ekleyin.
   Yeni ürün etiketi için `"new": true` yazın.
2. Sayfayı güncelleyin:

   ```bash
   node scripts/build-menu.mjs
   ```

   Bu komut `index.html` içindeki `<!-- menu:... -->` işaretlerinin arasını yeniden yazar
   (ürünler, ekstra fiyatları, hero'daki fiyat aralıkları, "Menü yap" hesaplayıcısının verisi).
   İşaretlerin dışındaki tasarıma dokunmaz.

## Dosyalar

| Dosya | Ne işe yarar |
| --- | --- |
| `index.html` | Sayfanın kendisi. Logo ve çizimler içine gömülü SVG. |
| `menu.json` | Menü ve fiyatlar. |
| `scripts/build-menu.mjs` | `menu.json`'u `index.html`'e yazar. |
| `assets/site.css` | Tüm stiller. Renkler ve yazı boyutları en üstte. |
| `assets/site.js` | Kayarak belirme, menü çubuğu, "Menü yap" hesaplayıcısı. |
| `assets/fonts/` | Indie Flower ve Bricolage Grotesque (ikisi de SIL Open Font License). |
| `assets/logo.svg`, `assets/favicon.svg` | Logo (PDF'ten vektör olarak çıkarıldı). |

## Fotoğraf ekleme

Burger ve patates alanlarında şimdilik çizimler var (`<figure class="plate" data-photo="...">`).
Fotoğraf geldiğinde içindeki `<svg>` yerine şunu koymak yeterli:

```html
<img src="assets/photos/burger.jpg" alt="Dip Truffle" width="1200" height="900">
```

## Yayına almadan önce onaylanacaklar

- **İletişim:** açık adres, çalışma saatleri, telefon (alt kısımda "yakında" yazıyor).
- **Instagram:** `@dipsmashburger` hesabı tahmin; doğru kullanıcı adı girilmeli.
- **Dip Sorrel:** menü PDF'inde "yanık kuzu sos" yazıyor, kuzukulağı sos olabilir.
- **"Neden smash?" metni:** smash tekniğini anlatan örnek metin; işletmenin ağzından onaylanmalı.
- **Trüf & Parmesan:** "Trüflü, parmesanlı patates." açıklaması tarafımızdan eklendi.
