# Gemi Bileşen Kaydı

Kruvaziyer gemi projelerinde kamera, kablo ve diğer bileşenleri farklı açılardan çekilmiş fotoğraflar ve bilgilerle kaydetmek için web uygulaması. Kayıtlar ve fotoğraflar Supabase'de tutulur; Excel, CSV ve PDF rapor alınabilir.

## Kurulum
1. supabase.com'da bir proje açın.
2. SQL Editor'de `supabase-setup.sql` dosyasının tamamını çalıştırın.
3. Project Settings > API sayfasındaki **Project URL** ve **anon public key** değerlerini `config.js` dosyasına yazın.
4. Authentication > URL Configuration'da **Site URL** olarak GitHub Pages adresini girin (e-posta onay bağlantıları için).
5. GitHub'da Settings > Pages > Branch: `main` / `(root)` seçip kaydedin.

## Kullanım
Siteyi açın, hesap oluşturup giriş yapın. Hesabı olan herkes tüm projeleri görür ve düzenler.
