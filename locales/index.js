// UI çeviri sözlükleri (yalnızca arayüz; yazı içerikleri çevrilmez).
// Anahtarlar iki dilde de bulunmalı; eksik anahtar TR'ye, o da yoksa anahtarın
// kendisine düşer (bkz. middleware/i18n.js).

const tr = {
    'lang.tr': 'Türkçe',
    'lang.en': 'İngilizce',

    'nav.home': 'Ana Sayfa',
    'nav.blog': 'Yazılar',
    'nav.about': 'Hakkımda',
    'nav.contact': 'İletişim',
    'nav.panel': 'Panel',
    'nav.logout': 'Çıkış',
    'nav.login': 'Giriş Yap',
    'nav.theme': 'Tema Değiştir',

    'footer.tagline': 'Siber güvenlik, yazılım ve teknoloji üzerine yazılar ve teknik analizler.',
    'footer.quicklinks': 'Hızlı Linkler',
    'footer.follow': 'Takip Et',
    'footer.rights': 'Tüm hakları saklıdır.',

    'home.hero_subtitle': 'Siber Güvenlik Platformu',
    'home.btn_about': 'Hakkımızda',
    'home.btn_explore': 'Yazıları Keşfet',
    'home.latest': 'Son Makaleler',
    'home.popular': 'Popüler Yazılar',

    'common.minread': 'dk oku',
    'common.views': 'görüntülenme',
    'common.readmore': 'Devamını Oku',

    'blog.title': 'Makaleler',
    'blog.subtitle': 'Siber güvenlik üzerine makaleler.',
    'blog.search_ph': 'Makale ara... (örn: web güvenliği)',
    'blog.all': 'Tümü',
    'blog.results': '"{q}" için {n} sonuç',
    'blog.tag_results': '#{tag} etiketi · {n} yazı',
    'blog.clear': 'Temizle',
    'blog.popular': 'Popüler Yazılar',
    'blog.empty': 'Henüz yazı eklenmemiş.',
    'blog.no_results': 'Aramanızla eşleşen yazı bulunamadı.',

    'detail.share': 'Paylaş:',
    'detail.related': 'İlgili Yazılar',
    'detail.toc': 'İçindekiler',

    'comments.title': 'Yorumlar',
    'comments.add': 'Yorum Yap',
    'comments.name': 'Adınız',
    'comments.email': 'E-posta (yayınlanmaz, opsiyonel)',
    'comments.body_ph': 'Yorumunuz...',
    'comments.send': 'Gönder',
    'comments.note': 'Yorumlar onaylandıktan sonra yayınlanır.',
    'comments.empty': 'Henüz yorum yok. İlk yorumu sen yaz!',
    'comments.success': 'Yorumunuz alındı; onaylandıktan sonra yayınlanacak.',
    'comments.error': 'Lütfen yorum bilgilerini kontrol edin.',

    'contact.title': 'İletişime Geç',
    'contact.subtitle': 'Projeleriniz veya sorularınız için bana yazabilirsiniz.',
    'contact.name': 'Adınız Soyadınız',
    'contact.name_ph': 'Örn: Ahmet Yılmaz',
    'contact.email': 'E-posta Adresiniz',
    'contact.email_ph': 'ornek@email.com',
    'contact.message': 'Mesajınız',
    'contact.message_ph': 'Mesajınızı buraya yazın...',
    'contact.send': 'Gönder',
    'contact.success': 'Mesajınız iletildi. Teşekkürler!',
    'contact.error': 'Lütfen formdaki bilgileri kontrol ediniz.',

    'about.title': 'Biz Kimiz?',
    'about.p1': '<strong>Crypton</strong>, Batuhan Meral tarafından yürütülen; yazılım, teknoloji ve siber güvenlik üzerine makalelerin paylaşıldığı bir blogdur.',
    'about.p2': 'Güncel siber tehditler, savunma stratejileri ve teknik analizler üzerine yazılar paylaşıyoruz. Siber güvenlik farkındalığını artırmayı ve Türkçe kaynak havuzunu genişletmeyi hedefliyoruz; makaleler ve teknik incelemelerle siber güvenlik meraklılarına rehberlik etmeye çalışıyoruz.',
    'about.focus': 'Odak Alanlarımız',
    'about.skill_web': 'Web Güvenliği',
    'about.skill_net': 'Ağ Güvenliği',
    'about.skill_ctf': 'CTF',
    'about.skill_zeroday': 'Zero Day',
    'about.skill_crypto': 'Kriptoloji',
    'about.skill_bugbounty': 'Bug Bounty',

    'errors.404_title': 'Sayfa Bulunamadı',
    'errors.404_msg': 'Aradığınız sayfa mevcut değil veya taşınmış olabilir.',
    'errors.403_title': 'Erişim Engellendi',
    'errors.403_msg': 'Bu sayfaya erişim yetkiniz bulunmamaktadır.',
    'errors.500_title': 'Sunucu Hatası',
    'errors.500_msg': 'Bir şeyler yanlış gitti. Lütfen daha sonra tekrar deneyin.',
    'errors.btn_home': 'Ana Sayfaya Dön',
    'errors.btn_back': 'Geri Dön',
    'errors.btn_articles': 'Makalelere Git',

    'login.title': 'Giriş Yap',
    'login.subtitle': 'Admin paneline erişim',
    'login.username': 'Kullanıcı Adı',
    'login.password': 'Şifre',
    'login.btn': 'Giriş',
    'login.code_label': 'Doğrulama Kodu',
    'login.code_ph': '6 haneli kod veya yedek kod',
    'login.code_hint': 'Authenticator kodu ya da yedek kodlarınızdan biri',
    'login.verify': 'Doğrula',
    'login.back_home': 'Ana Sayfaya Dön',

    // --- Admin ---
    'a.back': 'Geri', 'a.save': 'Kaydet', 'a.update': 'Güncelle', 'a.create': 'Oluştur',
    'a.actions': 'İşlemler', 'a.date': 'Tarih', 'a.confirm_delete': 'Silmek istediğinize emin misiniz?',

    'a.dashboard': 'Dashboard', 'a.posts': 'Yazılar', 'a.categories': 'Kategoriler', 'a.media': 'Medya',
    'a.messages': 'Mesajlar', 'a.comments': 'Yorumlar', 'a.users': 'Kullanıcılar', 'a.audit': 'İşlem Kayıtları',
    'a.twofa': '2FA', 'a.profile': 'Profilim', 'a.viewsite': 'Siteyi Görüntüle', 'a.logout': 'Çıkış',

    'a.dash_title': 'Yönetim Paneli', 'a.dash_welcome': 'Hoş geldin', 'a.dash_posts': 'Toplam Yazı',
    'a.dash_views': 'Toplam Görüntülenme', 'a.dash_categories': 'Kategori', 'a.dash_messages': 'Mesaj',
    'a.dash_audit': 'Audit Log', 'a.dash_users': 'Kullanıcılar', 'a.dash_comments': 'Yorumlar', 'a.dash_pending': 'bekliyor', 'a.manage': 'Yönet →', 'a.view_link': 'Görüntüle →',
    'a.dash_traffic': 'Son 30 Gün Trafiği', 'a.dash_traffic_total': '(toplam {n} görüntülenme)',
    'a.dash_cat_chart': 'Kategori Başına Yazı Sayısı',

    'a.posts_title': 'Makaleler', 'a.posts_new': '+ Yeni Yazı Ekle', 'a.tab_all': 'Tümü',
    'a.tab_published': 'Yayında', 'a.tab_draft': 'Taslak', 'a.col_image': 'Görsel', 'a.col_title': 'Başlık',
    'a.col_status': 'Durum', 'a.col_stats': 'İstatistik', 'a.st_published': 'Yayında', 'a.st_draft': 'Taslak',
    'a.bulk_ph': 'Toplu işlem seç…', 'a.bulk_publish': 'Yayına Al', 'a.bulk_draft': 'Taslağa Al',
    'a.bulk_delete': 'Sil', 'a.bulk_apply': 'Uygula', 'a.bulk_selected': 'seçili',
    'a.posts_empty': 'Henüz yazı yok.', 'a.posts_bulk_confirm': 'Seçili yazılar silinecek. Emin misiniz?',

    'a.cat_title': 'Kategoriler', 'a.cat_new': 'Yeni Kategori', 'a.cat_color': 'Renk', 'a.cat_name': 'Kategori Adı',
    'a.cat_slug': 'Slug', 'a.cat_empty': 'Henüz kategori eklenmemiş.', 'a.cat_new_title': 'Yeni Kategori Ekle',
    'a.cat_edit_title': 'Kategoriyi Düzenle', 'a.cat_preview': 'Önizleme', 'a.cat_name_ph': 'Örn: JavaScript',
    'a.cat_confirm': 'Bu kategoriyi silmek istediğinize emin misiniz?',

    'a.users_title': 'Kullanıcılar', 'a.users_new': '+ Yeni Kullanıcı', 'a.u_username': 'Kullanıcı Adı',
    'a.u_name': 'Ad Soyad', 'a.u_role': 'Rol', 'a.u_2fa': '2FA', 'a.u_lastlogin': 'Son Giriş',
    'a.u_2fa_on': 'Açık', 'a.u_2fa_off': 'Kapalı', 'a.u_confirm': 'Kullanıcıyı silmek istediğinize emin misiniz?',
    'a.u_new_title': 'Yeni Kullanıcı', 'a.u_edit_title': 'Kullanıcıyı Düzenle', 'a.u_password': 'Parola',
    'a.u_newpass': 'Yeni Parola (boş bırakırsanız değişmez)',

    'a.msg_title': 'Gelen Mesajlar', 'a.msg_from': 'Gönderen', 'a.msg_email': 'E-posta', 'a.msg_message': 'Mesaj',
    'a.msg_empty': 'Henüz mesaj yok.', 'a.msg_detail': 'Mesaj Detayı', 'a.msg_view': 'Detay',

    'a.cm_title': 'Yorumlar', 'a.cm_pending': 'Onay Bekleyen', 'a.cm_approved': 'Onaylı', 'a.cm_spam': 'Spam',
    'a.cm_empty': 'Bu kategoride yorum yok.', 'a.cm_approve': 'Onayla', 'a.cm_spam_btn': 'Spam', 'a.cm_delete': 'Sil',
    'a.cm_confirm': 'Bu yorum kalıcı olarak silinecek. Emin misiniz?',

    'a.media_title': 'Medya Kütüphanesi', 'a.media_total': 'Toplam {n} dosya', 'a.media_new': 'Yeni Yükle',
    'a.media_copy': 'URL Kopyala', 'a.media_empty': 'Henüz medya yüklenmemiş.', 'a.media_upload': 'Medya Yükle',
    'a.media_drop': 'Dosyaları buraya sürükleyin veya', 'a.media_choose': 'Dosya Seç', 'a.media_uploading': 'Yükleniyor...',
    'a.media_confirm': 'Bu medyayı silmek istediğinize emin misiniz?',

    'a.audit_title': 'İşlem Kayıtları (Audit Log)', 'a.audit_subtitle': 'Sistemdeki tüm admin işlemlerinin kaydı',
    'a.audit_all_actions': 'Tüm İşlemler', 'a.audit_all_users': 'Tüm Kullanıcılar', 'a.audit_filter': 'Filtrele',
    'a.audit_clear_filter': 'Filtreleri Temizle', 'a.audit_total': 'Toplam {n} kayıt bulundu', 'a.audit_user': 'Kullanıcı',
    'a.audit_action': 'İşlem', 'a.audit_detail': 'Detay', 'a.audit_ip': 'IP Adresi', 'a.audit_empty': 'Henüz kayıt bulunmuyor',
    'a.audit_prev': 'Önceki', 'a.audit_next': 'Sonraki', 'a.audit_page': 'Sayfa {p} / {t}',
    'a.audit_clear_all': 'Tüm Kayıtları Temizle',
    'a.audit_clear_confirm': 'Tüm işlem kayıtlarını silmek istediğinize emin misiniz? Bu işlem geri alınamaz!',

    'a.prof_title': 'Profilimi Düzenle', 'a.prof_name': 'Ad Soyad', 'a.prof_username': 'Kullanıcı Adı',
    'a.prof_newpass': 'Yeni Şifre (Değiştirmek istemiyorsanız boş bırakın)',
    'a.prof_must_change': 'Parola değişikliği gerekli.',
    'a.prof_must_change_desc': 'Panele devam edebilmek için aşağıdan yeni bir parola belirleyin.',
    'a.prof_delete_warn': 'Hesabınızı sildiğinizde yayınladığınız tüm makaleler de silinecektir. Bu işlem geri alınamaz.',
    'a.prof_delete_btn': 'Hesabımı Sil',
    'a.prof_delete_confirm': 'Hesabınızı ve tüm verilerinizi kalıcı olarak silmek istediğinize emin misiniz?',

    'a.tf_title': 'İki Aşamalı Doğrulama (TOTP)', 'a.tf_enabled': '2FA hesabınızda etkin.',
    'a.tf_remaining': 'Kalan yedek kod:', 'a.tf_regen': 'Yedek Kodları Yenile',
    'a.tf_regen_confirm': 'Yeni yedek kodlar üretilecek ve eskiler geçersiz olacak. Emin misiniz?',
    'a.tf_disable': 'Devre Dışı Bırak', 'a.tf_disable_confirm': '2FA devre dışı bırakılacak. Emin misiniz?',
    'a.tf_scan': 'Authenticator uygulamanızla aşağıdaki QR kodu tarayın:', 'a.tf_manual': 'Manuel anahtar:',
    'a.tf_code': 'Doğrulama Kodu', 'a.tf_enable': 'Etkinleştir', 'a.tf_backup_title': 'Yedek Kurtarma Kodları',
    'a.tf_backup_desc': 'Bu kodları şimdi güvenli bir yere kaydedin — bir daha gösterilmeyecek. Authenticator uygulamanıza erişemezseniz her kod bir kez giriş için kullanılabilir.',

    'a.pf_new_title': 'Yeni Yazı Ekle', 'a.pf_edit_title': 'Yazıyı Düzenle', 'a.pf_title': 'Başlık',
    'a.pf_summary': 'Özet', 'a.pf_categories': 'Kategoriler', 'a.pf_tags': 'Etiketler',
    'a.pf_tags_hint': '(virgülle ayırın, max 15)', 'a.pf_cover': 'Kapak Resmi', 'a.pf_cover_url': 'Veya Resim URL\'si',
    'a.pf_cover_url2': 'Resim URL', 'a.pf_alt': 'Kapak Görsel Açıklaması (alt)', 'a.pf_content': 'İçerik (Markdown)',
    'a.pf_seo': 'SEO Ayarları (Opsiyonel)', 'a.pf_seo_title': 'SEO Başlık', 'a.pf_seo_desc': 'SEO Açıklama',
    'a.pf_seo_kw': 'Anahtar Kelimeler', 'a.pf_og': 'Open Graph Görseli (Sosyal medya paylaşımları için)',
    'a.pf_publish': 'Yayınla'
};

const en = {
    'lang.tr': 'Turkish',
    'lang.en': 'English',

    'nav.home': 'Home',
    'nav.blog': 'Articles',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    'nav.panel': 'Panel',
    'nav.logout': 'Log out',
    'nav.login': 'Sign in',
    'nav.theme': 'Toggle theme',

    'footer.tagline': 'Articles and technical analyses on cybersecurity, software, and technology.',
    'footer.quicklinks': 'Quick Links',
    'footer.follow': 'Follow',
    'footer.rights': 'All rights reserved.',

    'home.hero_subtitle': 'Cybersecurity Platform',
    'home.btn_about': 'About us',
    'home.btn_explore': 'Explore articles',
    'home.latest': 'Latest Articles',
    'home.popular': 'Popular Posts',

    'common.minread': 'min read',
    'common.views': 'views',
    'common.readmore': 'Read more',

    'blog.title': 'Articles',
    'blog.subtitle': 'Articles on cybersecurity.',
    'blog.search_ph': 'Search articles... (e.g., web security)',
    'blog.all': 'All',
    'blog.results': '{n} results for "{q}"',
    'blog.tag_results': 'Tag #{tag} · {n} posts',
    'blog.clear': 'Clear',
    'blog.popular': 'Popular Posts',
    'blog.empty': 'No articles yet.',
    'blog.no_results': 'No articles match your search.',

    'detail.share': 'Share:',
    'detail.related': 'Related Posts',
    'detail.toc': 'Contents',

    'comments.title': 'Comments',
    'comments.add': 'Leave a Comment',
    'comments.name': 'Your name',
    'comments.email': 'Email (not published, optional)',
    'comments.body_ph': 'Your comment...',
    'comments.send': 'Submit',
    'comments.note': 'Comments are published after approval.',
    'comments.empty': 'No comments yet. Be the first!',
    'comments.success': 'Your comment has been received and will be published after approval.',
    'comments.error': 'Please check your comment details.',

    'contact.title': 'Get in Touch',
    'contact.subtitle': 'Reach out about your projects or questions.',
    'contact.name': 'Your Full Name',
    'contact.name_ph': 'e.g., John Doe',
    'contact.email': 'Your Email',
    'contact.email_ph': 'example@email.com',
    'contact.message': 'Your Message',
    'contact.message_ph': 'Write your message here...',
    'contact.send': 'Send',
    'contact.success': 'Your message has been sent. Thank you!',
    'contact.error': 'Please check the information in the form.',

    'about.title': 'Who Are We?',
    'about.p1': '<strong>Crypton</strong> is a blog on software, technology and cybersecurity, run by Batuhan Meral.',
    'about.p2': 'I write about current cyber threats, defense strategies, and technical analyses. My goal is to raise cybersecurity awareness and grow the pool of resources, guiding enthusiasts through articles and technical reviews.',
    'about.focus': 'Our Focus Areas',
    'about.skill_web': 'Web Security',
    'about.skill_net': 'Network Security',
    'about.skill_ctf': 'CTF',
    'about.skill_zeroday': 'Zero Day',
    'about.skill_crypto': 'Cryptography',
    'about.skill_bugbounty': 'Bug Bounty',

    'errors.404_title': 'Page Not Found',
    'errors.404_msg': "The page you're looking for doesn't exist or may have moved.",
    'errors.403_title': 'Access Denied',
    'errors.403_msg': "You don't have permission to access this page.",
    'errors.500_title': 'Server Error',
    'errors.500_msg': 'Something went wrong. Please try again later.',
    'errors.btn_home': 'Back to Home',
    'errors.btn_back': 'Go Back',
    'errors.btn_articles': 'Browse Articles',

    'login.title': 'Sign In',
    'login.subtitle': 'Admin panel access',
    'login.username': 'Username',
    'login.password': 'Password',
    'login.btn': 'Sign in',
    'login.code_label': 'Verification Code',
    'login.code_ph': '6-digit code or backup code',
    'login.code_hint': 'Authenticator code or one of your backup codes',
    'login.verify': 'Verify',
    'login.back_home': 'Back to Home',

    // --- Admin ---
    'a.back': 'Back', 'a.save': 'Save', 'a.update': 'Update', 'a.create': 'Create',
    'a.actions': 'Actions', 'a.date': 'Date', 'a.confirm_delete': 'Are you sure you want to delete this?',

    'a.dashboard': 'Dashboard', 'a.posts': 'Posts', 'a.categories': 'Categories', 'a.media': 'Media',
    'a.messages': 'Messages', 'a.comments': 'Comments', 'a.users': 'Users', 'a.audit': 'Audit Log',
    'a.twofa': '2FA', 'a.profile': 'My Profile', 'a.viewsite': 'View Site', 'a.logout': 'Log out',

    'a.dash_title': 'Dashboard', 'a.dash_welcome': 'Welcome', 'a.dash_posts': 'Total Posts',
    'a.dash_views': 'Total Views', 'a.dash_categories': 'Categories', 'a.dash_messages': 'Messages',
    'a.dash_audit': 'Audit Log', 'a.dash_users': 'Users', 'a.dash_comments': 'Comments', 'a.dash_pending': 'pending', 'a.manage': 'Manage →', 'a.view_link': 'View →',
    'a.dash_traffic': 'Last 30 Days Traffic', 'a.dash_traffic_total': '({n} total views)',
    'a.dash_cat_chart': 'Posts per Category',

    'a.posts_title': 'Articles', 'a.posts_new': '+ New Post', 'a.tab_all': 'All',
    'a.tab_published': 'Published', 'a.tab_draft': 'Draft', 'a.col_image': 'Image', 'a.col_title': 'Title',
    'a.col_status': 'Status', 'a.col_stats': 'Stats', 'a.st_published': 'Published', 'a.st_draft': 'Draft',
    'a.bulk_ph': 'Bulk action…', 'a.bulk_publish': 'Publish', 'a.bulk_draft': 'Move to Draft',
    'a.bulk_delete': 'Delete', 'a.bulk_apply': 'Apply', 'a.bulk_selected': 'selected',
    'a.posts_empty': 'No posts yet.', 'a.posts_bulk_confirm': 'Selected posts will be deleted. Are you sure?',

    'a.cat_title': 'Categories', 'a.cat_new': 'New Category', 'a.cat_color': 'Color', 'a.cat_name': 'Category Name',
    'a.cat_slug': 'Slug', 'a.cat_empty': 'No categories yet.', 'a.cat_new_title': 'New Category',
    'a.cat_edit_title': 'Edit Category', 'a.cat_preview': 'Preview', 'a.cat_name_ph': 'e.g., JavaScript',
    'a.cat_confirm': 'Are you sure you want to delete this category?',

    'a.users_title': 'Users', 'a.users_new': '+ New User', 'a.u_username': 'Username',
    'a.u_name': 'Full Name', 'a.u_role': 'Role', 'a.u_2fa': '2FA', 'a.u_lastlogin': 'Last Login',
    'a.u_2fa_on': 'On', 'a.u_2fa_off': 'Off', 'a.u_confirm': 'Are you sure you want to delete this user?',
    'a.u_new_title': 'New User', 'a.u_edit_title': 'Edit User', 'a.u_password': 'Password',
    'a.u_newpass': 'New Password (leave blank to keep current)',

    'a.msg_title': 'Incoming Messages', 'a.msg_from': 'Sender', 'a.msg_email': 'Email', 'a.msg_message': 'Message',
    'a.msg_empty': 'No messages yet.', 'a.msg_detail': 'Message Details', 'a.msg_view': 'Details',

    'a.cm_title': 'Comments', 'a.cm_pending': 'Pending', 'a.cm_approved': 'Approved', 'a.cm_spam': 'Spam',
    'a.cm_empty': 'No comments in this category.', 'a.cm_approve': 'Approve', 'a.cm_spam_btn': 'Spam', 'a.cm_delete': 'Delete',
    'a.cm_confirm': 'This comment will be permanently deleted. Are you sure?',

    'a.media_title': 'Media Library', 'a.media_total': '{n} files total', 'a.media_new': 'Upload New',
    'a.media_copy': 'Copy URL', 'a.media_empty': 'No media uploaded yet.', 'a.media_upload': 'Upload Media',
    'a.media_drop': 'Drag files here or', 'a.media_choose': 'Choose File', 'a.media_uploading': 'Uploading...',
    'a.media_confirm': 'Are you sure you want to delete this media?',

    'a.audit_title': 'Audit Log', 'a.audit_subtitle': 'Record of all admin actions in the system',
    'a.audit_all_actions': 'All Actions', 'a.audit_all_users': 'All Users', 'a.audit_filter': 'Filter',
    'a.audit_clear_filter': 'Clear Filters', 'a.audit_total': '{n} records found', 'a.audit_user': 'User',
    'a.audit_action': 'Action', 'a.audit_detail': 'Detail', 'a.audit_ip': 'IP Address', 'a.audit_empty': 'No records yet',
    'a.audit_prev': 'Previous', 'a.audit_next': 'Next', 'a.audit_page': 'Page {p} / {t}',
    'a.audit_clear_all': 'Clear All Records',
    'a.audit_clear_confirm': 'Are you sure you want to delete all audit records? This cannot be undone!',

    'a.prof_title': 'Edit My Profile', 'a.prof_name': 'Full Name', 'a.prof_username': 'Username',
    'a.prof_newpass': 'New Password (leave blank to keep current)',
    'a.prof_must_change': 'Password change required.',
    'a.prof_must_change_desc': 'Set a new password below to continue to the panel.',
    'a.prof_delete_warn': 'Deleting your account will also remove all articles you have published. This cannot be undone.',
    'a.prof_delete_btn': 'Delete My Account',
    'a.prof_delete_confirm': 'Are you sure you want to permanently delete your account and all your data?',

    'a.tf_title': 'Two-Factor Authentication (TOTP)', 'a.tf_enabled': '2FA is enabled on your account.',
    'a.tf_remaining': 'Remaining backup codes:', 'a.tf_regen': 'Regenerate Backup Codes',
    'a.tf_regen_confirm': 'New backup codes will be generated and the old ones invalidated. Are you sure?',
    'a.tf_disable': 'Disable', 'a.tf_disable_confirm': '2FA will be disabled. Are you sure?',
    'a.tf_scan': 'Scan the QR code below with your authenticator app:', 'a.tf_manual': 'Manual key:',
    'a.tf_code': 'Verification Code', 'a.tf_enable': 'Enable', 'a.tf_backup_title': 'Backup Recovery Codes',
    'a.tf_backup_desc': 'Save these codes somewhere safe now — they will not be shown again. If you lose access to your authenticator, each code can be used once to sign in.',

    'a.pf_new_title': 'New Post', 'a.pf_edit_title': 'Edit Post', 'a.pf_title': 'Title',
    'a.pf_summary': 'Summary', 'a.pf_categories': 'Categories', 'a.pf_tags': 'Tags',
    'a.pf_tags_hint': '(comma-separated, max 15)', 'a.pf_cover': 'Cover Image', 'a.pf_cover_url': 'Or Image URL',
    'a.pf_cover_url2': 'Image URL', 'a.pf_alt': 'Cover Image Alt Text', 'a.pf_content': 'Content (Markdown)',
    'a.pf_seo': 'SEO Settings (Optional)', 'a.pf_seo_title': 'SEO Title', 'a.pf_seo_desc': 'SEO Description',
    'a.pf_seo_kw': 'Keywords', 'a.pf_og': 'Open Graph Image (for social media shares)',
    'a.pf_publish': 'Publish'
};

const SUPPORTED = ['tr', 'en'];
const DEFAULT_LOCALE = 'tr';
const dicts = { tr, en };

function translate(locale, key, vars) {
    const dict = dicts[locale] || dicts[DEFAULT_LOCALE];
    let s = (dict[key] != null) ? dict[key] : (dicts[DEFAULT_LOCALE][key] != null ? dicts[DEFAULT_LOCALE][key] : key);
    if (vars) {
        for (const k of Object.keys(vars)) {
            s = s.replace(new RegExp('\\{' + k + '\\}', 'g'), vars[k]);
        }
    }
    return s;
}

module.exports = { dicts, SUPPORTED, DEFAULT_LOCALE, translate };
