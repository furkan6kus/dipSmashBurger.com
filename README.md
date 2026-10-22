# Dip Smash Burger: dipsmashburger.com

Denizli'deki Dip Smash Burger'in menü sitesi. Tek sayfa, derleme gerektirmeyen düz HTML/CSS/JS.
Masadaki QR kodu doğrudan menüye açmak için `https://dipsmashburger.com/#menu` adresini kullanın.

## Yayın

Site GitHub Pages'te yayında: **https://furkan6kus.github.io/dipSmashBurger.com/**
(QR kod için: `https://furkan6kus.github.io/dipSmashBurger.com/#menu`)

`claude/sweet-thompson-y3p7yr` branch'ine yapılan her push 1-2 dakika içinde otomatik yayına çıkar.
`menu.json` değişince `.github/workflows/menu.yml` menüyü `index.html`'e kendisi yazar ve siteyi
yeniden yayınlar; fiyatı GitHub sitesinden `menu.json`'u düzenleyerek değiştirmek yeterli.

## Menü ve fiyat güncelleme

Menünün tek kaynağı `menu.json` dosyasıdır.

1. `menu.json` içinde fiyatı, ürün adını ya da açıklamayı değiştirin. Yeni ürün eklemek için ilgili
   kategorinin `items` listesine `{ "name": "...", "price": 0, "desc": "..." }` ekleyin.
   Yeni ürün etiketi için `"new": true` yazın.
2. GitHub sitesinden düzenlediyseniz başka bir şey gerekmez, iş akışı sayfayı günceller.
   Bilgisayarda düzenlediyseniz sayfayı güncelleyin:

   ```bash
   node scripts/build-menu.mjs
   ```

   Bu komut `index.html` içindeki `<!-- menu:... -->` işaretlerinin arasını yeniden yazar
   (ürünler, ekstra fiyatları ve "Her burger menü olur" notundaki menü fiyatı).
   İşaretlerin dışındaki tasarıma dokunmaz.

## Dosyalar

| Dosya | Ne işe yarar |
| --- | --- |
| `index.html` | Sayfanın kendisi. Logo ve çizimler içine gömülü SVG. |
| `menu.json` | Menü ve fiyatlar. |
| `scripts/build-menu.mjs` | `menu.json`'u `index.html`'e yazar. |
| `assets/site.css` | Tüm stiller. Renkler ve yazı boyutları en üstte. |
| `assets/site.js` | Kayarak belirme, menü çubuğu. |
| `assets/character.js` | Kaydırmayla oynayan karakter. |
| `assets/character/` | Karakter videosunun kareleri (beyaz çizgi, şeffaf). |
| `scripts/build-character.py` | Videodan kareleri üretir. |
| `assets/fonts/` | Indie Flower ve Bricolage Grotesque (ikisi de SIL Open Font License). |
| `assets/logo.svg`, `assets/favicon.svg` | Logo (PDF'ten vektör olarak çıkarıldı). |

## Açılış ekranı

Yeşil zeminde "TASTE THE SMASH. LOVE THE DIP!" sloganı ve turuncu "Menüyü keşfet" butonu var.
Buton sayfayı menüye kaydırır. Sol üstte dip işareti, sağ üstte Instagram butonu
(`https://www.instagram.com/dipsmashburger/`) durur.

"Menü yap" hesaplayıcısı ve adisyon şimdilik kaldırıldı. Gerekirse git geçmişinden geri getirilebilir.

## Kaydırınca hareket eden karakter

Menü yeşil zeminde, Dip'in karakteri beyaz çizgilerle arkada duruyor. Kaydırdıkça burgeri yiyor,
patatese, kolaya ve kurabiyeye geçiyor; yukarı kaydırınca geri sarıyor. Menü boyunca hiç kaybolmuyor.

- **Geniş ekranda (900 px ve üstü):** karakter solda büyük durur, menü sağ sütunda akar.
- **Telefonda:** karakter yazıların arkasında, okunurluğu bozmayacak kadar soluk durur.

Videonun beyaz zemini (karakterin içi dahil) silinir, çizgiler beyaz yapılır ve her kare ayrı bir
şeffaf WebP olarak kaydedilir (`assets/character/720/` masaüstü, `assets/character/480/` telefon).
Yeni bir video gelirse:

```bash
python3 scripts/build-character.py yeni-video.mp4   # ffmpeg ve Pillow gerekir, birkaç dakika sürer
```

Video 1280x720 ise kırpma ayarı (`CROP`) aynen çalışır; farklıysa script'in başından değiştirin.
Hangi bölümün videonun hangi saniyesine denk geldiği `assets/character.js` içindeki `ANCHORS`'tadır.

## Yayına almadan önce onaylanacaklar

- **İletişim:** açık adres, çalışma saatleri, telefon (alt kısımda "yakında" yazıyor).
- **Dip Sorrel:** menü PDF'inde "yanık kuzu sos" yazıyor, kuzukulağı sos olabilir.
- **"Neden smash?" metni:** smash tekniğini anlatan örnek metin; işletmenin ağzından onaylanmalı.
- **Trüf & Parmesan:** "Trüflü, parmesanlı patates." açıklaması tarafımızdan eklendi.
