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
| `assets/character.js` | Kaydırmayla oynayan karakter. |
| `assets/character/` | Karakter videosunun kareleri. |
| `scripts/build-character.py` | Videodan kareleri üretir. |
| `assets/fonts/` | Indie Flower ve Bricolage Grotesque (ikisi de SIL Open Font License). |
| `assets/logo.svg`, `assets/favicon.svg` | Logo (PDF'ten vektör olarak çıkarıldı). |

## Kaydırınca hareket eden karakter

Menüde kaydırdıkça Dip'in karakteri burgeri yiyor, patatese, kolaya ve kurabiyeye geçiyor.
Yukarı kaydırınca geri sarıyor.

- **Geniş ekranda (900 px ve üstü):** karakter menünün solunda sabit durur.
- **Telefonda:** burgerler, kızartmalar, içecekler ve tatlı bölümlerinin başında birer pano olur.

Video, sprite dosyalarına çevrilip (`assets/character/480-*.webp`) tuvale kare kare çizilir;
böylece iPhone'da da akıcı geri sarar. Yeni bir video gelirse:

```bash
python3 scripts/build-character.py yeni-video.mp4   # ffmpeg ve Pillow gerekir
```

Video 1280x720 ise kırpma ayarı (`CROP`) aynen çalışır; farklıysa script'in başından değiştirin.
Hangi bölümün videonun hangi saniyesine denk geldiği `assets/character.js` içindeki `ANCHORS`
(masaüstü) ve HTML'deki `data-seg` (telefon) değerlerindedir.

## Yayına almadan önce onaylanacaklar

- **İletişim:** açık adres, çalışma saatleri, telefon (alt kısımda "yakında" yazıyor).
- **Instagram:** `@dipsmashburger` hesabı tahmin; doğru kullanıcı adı girilmeli.
- **Dip Sorrel:** menü PDF'inde "yanık kuzu sos" yazıyor, kuzukulağı sos olabilir.
- **"Neden smash?" metni:** smash tekniğini anlatan örnek metin; işletmenin ağzından onaylanmalı.
- **Trüf & Parmesan:** "Trüflü, parmesanlı patates." açıklaması tarafımızdan eklendi.
