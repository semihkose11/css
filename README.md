# Gemi Bileşen Kaydı

Kruvaziyer gemi projelerinde kamera, kablo ve diğer bileşenleri farklı açılardan çekilmiş fotoğraflar ve bilgilerle kaydetmek için web uygulaması. Kayıtlar ve fotoğraflar Supabase'de tutulur; Excel, CSV ve PDF rapor alınabilir.

## Kullanıcılar
- Giriş kullanıcı adı ve şifre ile yapılır. Siteden kayıt olunamaz.
- Hesapları yalnızca yönetici açar: sağ üstteki **Ayarlar → Kullanıcıları yönet**.
- Herkes kendi şifresini **Ayarlar → Şifremi değiştir** ile değiştirebilir.

## Kurulum (yeni bir Supabase projesi için)
1. SQL Editor'de sırasıyla `supabase-setup.sql`, `supabase-users.sql`, `supabase-username.sql` dosyalarını çalıştırın.
2. `supabase/functions/admin-users/index.ts` dosyasını `admin-users` adıyla Edge Function olarak yayınlayın.
3. Authentication > Sign In / Providers'da "Allow new users to sign up" seçeneğini kapatın.
4. Authentication > Users > Add user ile ilk hesabı açın (Auto Confirm). İlk hesap otomatik olarak yönetici olur.
5. Project Settings > API'deki Project URL ve anon key değerlerini `config.js` dosyasına yazın.
