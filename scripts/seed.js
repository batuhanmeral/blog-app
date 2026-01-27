/**
 * Database Seed Script
 * Run with: npm run seed
 */

const { sequelize, Post, User, Category, PostCategory } = require('../models');
const bcrypt = require('bcrypt');
require('dotenv').config();

// ============ SAMPLE DATA ============

const blogPosts = [
    {
        title: "Siber Güvenlik 101: Temeller ve Korunma Yöntemleri",
        category: "Siber Güvenlik",
        date: new Date("2025-12-15"),
        image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80",
        summary: "Siber saldırılardan korunma yöntemleri, ethical hacking kavramı ve başlangıç için yol haritası.",
        content: `
Günümüzde veri güvenliği, sadece büyük şirketlerin değil, bireysel kullanıcıların da en önemli gündem maddelerinden biri haline geldi.

## Neden Siber Güvenlik?
İnternete bağlı cihaz sayısının artmasıyla birlikte saldırı yüzeyleri de genişledi. Phishing (oltalama), Malware (kötü amaçlı yazılım) ve Ransomware (fidye yazılımı) saldırıları her geçen gün artıyor.

> "Güvenlik bir ürün değil, bir süreçtir." - Bruce Schneier

## Temel Korunma Yöntemleri
* **Güçlü Parolalar:** En az 12 karakterli ve karmaşık şifreler kullanın.
* **2FA (İki Faktörlü Doğrulama):** Her yerde aktif edin.
* **Yazılım Güncellemeleri:** İşletim sisteminizi güncel tutun.
        `
    },
    {
        title: "Modern Web Yol Haritası",
        category: "Yazılım",
        date: new Date("2025-12-12"),
        image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80",
        summary: "Frontend ve Backend dünyasında 2025 trendleri. Hangi teknolojileri öğrenmelisiniz?",
        content: `
Web geliştirme dünyası baş döndürücü bir hızla değişiyor. 2025 itibarıyla "Modern Web" kavramı neleri kapsıyor?

## Frontend Trendleri
React Server Components, Qwik ve Astro gibi teknolojiler, performansı ön plana çıkarıyor. Artık "Hydration" maliyetlerini minimize eden yaklaşımlar standartlaşıyor.

## Backend ve Edge Computing
Sunucusuz mimariler (Serverless) ve Edge veritabanları (örn: Cloudflare D1, Turso) sayesinde veriler kullanıcıya daha yakın.
        `
    },
    {
        title: "AI ile Kodlama Pratiği",
        category: "Yapay Zeka",
        date: new Date("2025-12-10"),
        image: "https://images.unsplash.com/photo-1555099962-4199c345e5dd?auto=format&fit=crop&w=600&q=80",
        summary: "Yapay zeka araçlarını (Copilot, ChatGPT) kullanarak kodlama hızınızı nasıl artırırsınız?",
        content: `
AI asistanları artık junior geliştiricilerden senior mimarlara kadar herkesin alet çantasında.

## Doğru Prompt Mühendisliği
AI'dan verim almanın sırrı, ona doğru bağlamı vermekte gizli. "Bana kod yaz" yerine "Şu kütüphaneyi kullanarak, şu parametreleri alan bir fonksiyon yaz" demek çok daha etkili.

## Kod Kalitesi ve Güvenlik
AI tarafından üretilen kodun körü körüne kopyalanması güvenlik açıklarına yol açabilir. Her satırı anlamak ve doğrulamak insan geliştiricinin sorumluluğundadır.
        `
    }
];

const defaultCategories = [
    { name: 'Siber Güvenlik', slug: 'siber-guvenlik', color: '#ef4444' },
    { name: 'Yazılım', slug: 'yazilim', color: '#3b82f6' },
    { name: 'Yapay Zeka', slug: 'yapay-zeka', color: '#8b5cf6' },
    { name: 'Web Geliştirme', slug: 'web-gelistirme', color: '#10b981' },
    { name: 'DevOps', slug: 'devops', color: '#f59e0b' },
    { name: 'Blockchain', slug: 'blockchain', color: '#ec4899' }
];

// ============ SEED FUNCTION ============

const seedDB = async () => {
    console.log('\n🌱 Starting database seed...\n');
    
    try {
        await sequelize.sync({ force: true });
        console.log('✅ Database synced (tables recreated)');

        const salt = await bcrypt.genSalt(10);
        const adminPassword = await bcrypt.hash('admin123', salt);
        const writerPassword = await bcrypt.hash('yazar123', salt);

        const adminUser = await User.create({
            username: 'admin',
            name: 'Batuhan Meral',
            password: adminPassword,
            role: 'admin'
        });
        console.log('✅ Admin user created (admin / admin123)');

        const writerUser = await User.create({
            username: 'yazar',
            name: 'Konuk Yazar',
            password: writerPassword,
            role: 'writer'
        });
        console.log('✅ Writer user created (yazar / yazar123)');

        const categories = await Category.bulkCreate(defaultCategories);
        console.log(`✅ ${categories.length} categories created`);

        const postsWithUser = blogPosts.map((post, index) => ({
            ...post,
            userId: adminUser.id,
            slug: Post.generateSlug(post.title) + '-' + Date.now() + index,
            readTime: Post.calculateReadTime(post.content),
            status: 'published',
            viewCount: Math.floor(Math.random() * 500) + 50
        }));

        const createdPosts = await Post.bulkCreate(postsWithUser);
        console.log(`✅ ${createdPosts.length} posts created`);

        for (let i = 0; i < createdPosts.length; i++) {
            const post = await Post.findByPk(createdPosts[i].id);
            const randomCategories = categories.slice(0, Math.floor(Math.random() * 2) + 1);
            await post.setCategories(randomCategories);
        }
        console.log('✅ Categories assigned to posts');

        console.log('\n🎉 Database seeded successfully!\n');
        console.log('╔═══════════════════════════════════════╗');
        console.log('║  Admin Login: admin / admin123        ║');
        console.log('║  Writer Login: yazar / yazar123       ║');
        console.log('╚═══════════════════════════════════════╝\n');

    } catch (err) {
        console.error('❌ Seed error:', err);
        process.exit(1);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
};

seedDB();
