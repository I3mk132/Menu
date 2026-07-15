"""
Populates the database with two demo tenants so multi-tenant isolation
is visible out of the box, not just implemented in theory:

  - "local-table"  (The Local Table)  — the full 5-category, 20-item
    menu used throughout development, warm-cafe branding.
  - "sunset-diner" (Sunset Diner)      — a smaller, distinct menu with
    its own bold red/yellow branding, to prove tenant A never sees
    tenant B's categories or items.

Run with:  python seed.py
Re-running clears existing Tenant/Category/MenuItem rows first, so
it's safe to use for resetting a demo environment.

NOTE: image_url values point at Unsplash demo photography. Swap these
for the client's own photos (ideally uploaded through the admin panel,
which stores them in Cloudflare R2) before a real deployment.
"""
from sqlmodel import Session, delete

from app.database import engine, init_db
from app.models import Tenant, Category, MenuItem

UNSPLASH = lambda photo_id: f"https://images.unsplash.com/{photo_id}?auto=format&fit=crop&w=800&q=80"

TENANTS = [
    dict(
        slug="local-table",
        domain=None,
        name="The Local Table",
        description="Fresh ingredients, made with care.",
        primary_color="#6F4E37",
        secondary_color="#C08552",
        contact_email="hello@localtable.example",
        contact_phone="+1 (555) 014-2200",
        address="128 Market Street, Springfield",
    ),
    dict(
        slug="sunset-diner",
        domain=None,
        name="Sunset Diner",
        description="Classic American comfort food, done right.",
        primary_color="#D62828",
        secondary_color="#FCBF49",
        contact_email="hello@sunsetdiner.example",
        contact_phone="+1 (555) 019-9081",
        address="44 Ocean Avenue, Bay City",
    ),
]

# ------------------------------------------------------------- local-table
CATEGORIES = [
    {"key": "appetizers", "name_en": "Appetizers", "name_ar": "المقبلات", "name_tr": "Meze ve Başlangıçlar", "sort_order": 1},
    {"key": "western", "name_en": "Western Food", "name_ar": "المطبخ الغربي", "name_tr": "Batı Mutfağı", "sort_order": 2},
    {"key": "eastern", "name_en": "Eastern Food", "name_ar": "المطبخ الشرقي", "name_tr": "Doğu Mutfağı", "sort_order": 3},
    {"key": "drinks", "name_en": "Drinks", "name_ar": "المشروبات", "name_tr": "İçecekler", "sort_order": 4},
    {"key": "desserts", "name_en": "Desserts", "name_ar": "الحلويات", "name_tr": "Tatlılar", "sort_order": 5},
]

ITEMS = {
    "appetizers": [
        dict(
            name_en="Classic Hummus", name_ar="حمص كلاسيك", name_tr="Klasik Humus",
            description_en="Creamy chickpea puree with tahini, lemon, and a swirl of olive oil.",
            description_ar="حمص كريمي مع الطحينة والليمون وزيت الزيتون.",
            description_tr="Tahin, limon ve zeytinyağı ile kremsi nohut ezmesi.",
            price=6.5, discounted_price=None,
            image_url=UNSPLASH("photo-1622973536968-3ead9e780960"),
        ),
        dict(
            name_en="Stuffed Grape Leaves", name_ar="ورق عنب محشي", name_tr="Yaprak Sarma",
            description_en="Vine leaves stuffed with rice, herbs, and a touch of pomegranate molasses.",
            description_ar="ورق عنب محشو بالأرز والأعشاب مع دبس الرمان.",
            description_tr="Pirinç ve otlarla doldurulmuş, nar ekşili asma yaprakları.",
            price=7.0, discounted_price=None,
            image_url=UNSPLASH("photo-1600335895229-6e75511892c8"),
        ),
        dict(
            name_en="Crispy Calamari", name_ar="كاليماري مقرمش", name_tr="Çıtır Kalamar",
            description_en="Lightly battered calamari rings, fried golden, served with lemon aioli.",
            description_ar="حلقات كاليماري مقلية بخفة مع صلصة الليمون.",
            description_tr="Hafif harçla kızartılmış kalamar halkaları, limonlu sos ile.",
            price=9.5, discounted_price=7.5,
            image_url=UNSPLASH("photo-1599487488170-d11ec9c172f0"),
        ),
        dict(
            name_en="Garlic Cheese Bread", name_ar="خبز بالثوم والجبن", name_tr="Sarımsaklı Peynirli Ekmek",
            description_en="Oven-baked flatbread with garlic butter and melted mozzarella.",
            description_ar="خبز مخبوز بزبدة الثوم وجبنة الموزاريلا الذائبة.",
            description_tr="Sarımsak tereyağı ve eritilmiş mozzarella ile fırınlanmış pide.",
            price=5.5, discounted_price=None,
            image_url=UNSPLASH("photo-1573140247632-f8fd74997d5c"),
        ),
    ],
    "western": [
        dict(
            name_en="Classic Margherita Pizza", name_ar="بيتزا مارغريتا", name_tr="Klasik Margherita Pizza",
            description_en="San Marzano tomato, fresh mozzarella, and basil on a hand-stretched crust.",
            description_ar="طماطم سان مارزانو وجبنة موزاريلا طازجة وريحان على عجينة مشدودة يدويًا.",
            description_tr="El açması hamur üzerinde San Marzano domates, taze mozzarella ve fesleğen.",
            price=12.0, discounted_price=None,
            image_url=UNSPLASH("photo-1565299624946-b28f40a0ae38"),
            sizes=[
                {"name_en": "Small (9\")", "name_ar": "صغير", "name_tr": "Küçük", "price_modifier": 0.0},
                {"name_en": "Medium (12\")", "name_ar": "وسط", "name_tr": "Orta", "price_modifier": 3.0},
                {"name_en": "Large (16\")", "name_ar": "كبير", "name_tr": "Büyük", "price_modifier": 6.0},
            ],
        ),
        dict(
            name_en="Classic Cheeseburger", name_ar="تشيز برجر كلاسيك", name_tr="Klasik Çizburger",
            description_en="Grilled beef patty, cheddar, lettuce, tomato, and house sauce in a brioche bun.",
            description_ar="قرص لحم مشوي مع جبنة الشيدر والخس والطماطم في خبز بريوش.",
            description_tr="Izgara dana köfte, cheddar peyniri, marul ve domates, brioche ekmek arasında.",
            price=11.0, discounted_price=None,
            image_url=UNSPLASH("photo-1568901346375-23c9450c58cd"),
        ),
        dict(
            name_en="Creamy Alfredo Pasta", name_ar="باستا ألفريدو الكريمية", name_tr="Kremalı Alfredo Makarna",
            description_en="Fettuccine tossed in a rich parmesan cream sauce with cracked black pepper.",
            description_ar="فيتوتشيني مع صلصة كريمية بالبارميزان وفلفل أسود مطحون.",
            description_tr="Zengin parmesanlı krema sos ile karıştırılmış fettuccine, karabiber ile.",
            price=13.5, discounted_price=10.5,
            image_url=UNSPLASH("photo-1645112411341-6c4fd023714a"),
        ),
        dict(
            name_en="Grilled Ribeye Steak", name_ar="ستيك ريب آي مشوي", name_tr="Izgara Antrikot",
            description_en="10oz ribeye grilled to order, served with rosemary jus and roasted vegetables.",
            description_ar="ستيك ريب آي 280 غرام مشوي حسب الطلب مع خضار مشوية.",
            description_tr="İsteğe göre pişirilmiş 280 gr antrikot, közlenmiş sebzelerle servis edilir.",
            price=24.0, discounted_price=None,
            image_url=UNSPLASH("photo-1504674900247-0877df9cc836"),
        ),
    ],
    "eastern": [
        dict(
            name_en="Chicken Shawarma Plate", name_ar="صحن شاورما دجاج", name_tr="Tavuk Şavarma Tabağı",
            description_en="Marinated chicken shaved off the spit, served with rice, salad, and garlic sauce.",
            description_ar="دجاج متبل ومشوي على السيخ مع الأرز والسلطة وصلصة الثوم.",
            description_tr="Şişten kesilen marine tavuk, pilav, salata ve sarımsak sos ile.",
            price=10.5, discounted_price=None,
            image_url=UNSPLASH("photo-1633436375153-d7045cb93e38"),
        ),
        dict(
            name_en="Lamb Kebab Skewers", name_ar="كباب لحم غنم", name_tr="Kuzu Şiş Kebap",
            description_en="Char-grilled minced lamb skewers with sumac onions and grilled tomato.",
            description_ar="أسياخ كباب لحم غنم مشوية على الفحم مع بصل السماق والطماطم المشوية.",
            description_tr="Közde pişirilmiş kuzu şiş kebap, sumaklı soğan ve közlenmiş domates ile.",
            price=15.0, discounted_price=None,
            image_url=UNSPLASH("photo-1529193591184-b1d58069ecdd"),
        ),
        dict(
            name_en="Mixed Grill Platter", name_ar="مشاوي مشكلة", name_tr="Karışık Izgara Tabağı",
            description_en="Chef's selection of kebab, shish tawook, and kofta with rice and grilled vegetables.",
            description_ar="تشكيلة الشيف من الكباب وشيش طاووق والكفتة مع الأرز والخضار المشوية.",
            description_tr="Şefin seçtiği kebap, şiş tavuk ve köfte, pilav ve közlenmiş sebzeler eşliğinde.",
            price=22.0, discounted_price=18.0,
            image_url=UNSPLASH("photo-1544025162-d76694265947"),
        ),
        dict(
            name_en="Falafel Wrap", name_ar="لفافة فلافل", name_tr="Falafel Dürüm",
            description_en="Crispy chickpea falafel, pickles, and tahini sauce wrapped in warm flatbread.",
            description_ar="فلافل مقرمشة مع المخللات وصلصة الطحينة ملفوفة بخبز دافئ.",
            description_tr="Çıtır falafel, turşu ve tahin sos, sıcak lavaş içinde dürülmüş.",
            price=7.5, discounted_price=None,
            image_url=UNSPLASH("photo-1601050690597-df0568f70950"),
        ),
    ],
    "drinks": [
        dict(
            name_en="Fresh Orange Juice", name_ar="عصير برتقال طازج", name_tr="Taze Portakal Suyu",
            description_en="Squeezed to order from ripe, seasonal oranges.",
            description_ar="يُعصر عند الطلب من برتقال موسمي ناضج.",
            description_tr="Siparişte mevsim portakallarından sıkılır.",
            price=4.0, discounted_price=None,
            image_url=UNSPLASH("photo-1600271886742-f049cd451bba"),
            sizes=[
                {"name_en": "Regular", "name_ar": "عادي", "name_tr": "Normal", "price_modifier": 0.0},
                {"name_en": "Large", "name_ar": "كبير", "name_tr": "Büyük", "price_modifier": 1.5},
            ],
        ),
        dict(
            name_en="Turkish Coffee", name_ar="قهوة تركية", name_tr="Türk Kahvesi",
            description_en="Slow-brewed on sand, served with Turkish delight on the side.",
            description_ar="قهوة مطبوخة ببطء على الرمل، تقدم مع الحلقوم.",
            description_tr="Kum üzerinde yavaşça pişirilmiş, yanında lokum ile servis edilir.",
            price=3.5, discounted_price=None,
            image_url=UNSPLASH("photo-1509785307050-d4066910ec1e"),
        ),
        dict(
            name_en="Iced Mint Lemonade", name_ar="ليموناضة بالنعناع المثلج", name_tr="Buzlu Naneli Limonata",
            description_en="Fresh lemon juice blended with mint leaves over crushed ice.",
            description_ar="عصير ليمون طازج مع أوراق النعناع على الثلج المجروش.",
            description_tr="Taze limon suyu, nane yaprakları ve kırık buz ile karıştırılır.",
            price=4.5, discounted_price=None,
            image_url=UNSPLASH("photo-1497534446932-c925b458314e"),
        ),
        dict(
            name_en="Sparkling Water", name_ar="مياه غازية", name_tr="Maden Sodası",
            description_en="Chilled sparkling mineral water, served with a slice of lime.",
            description_ar="مياه معدنية غازية باردة تقدم مع شريحة ليمون.",
            description_tr="Soğutulmuş maden sodası, bir dilim misket limonu ile.",
            price=2.5, discounted_price=None,
            image_url=UNSPLASH("photo-1560023907-5f339617ea30"),
        ),
    ],
    "desserts": [
        dict(
            name_en="Baklava Platter", name_ar="طبق بقلاوة", name_tr="Baklava Tabağı",
            description_en="Layers of crisp filo, pistachio, and honey syrup, hand-cut into diamonds.",
            description_ar="طبقات من العجين المقرمش والفستق وشراب العسل مقطعة يدويًا.",
            description_tr="Çıtır yufka, fıstık ve bal şerbeti katmanları, elle kesilmiş baklava dilimleri.",
            price=6.0, discounted_price=None,
            image_url=UNSPLASH("photo-1571115177098-24ec42ed204d"),
        ),
        dict(
            name_en="Kunafa with Pistachio", name_ar="كنافة بالفستق", name_tr="Fıstıklı Künefe",
            description_en="Warm shredded pastry with sweet cheese filling, topped with crushed pistachio.",
            description_ar="كنافة دافئة محشوة بالجبنة الحلوة ومغطاة بالفستق المطحون.",
            description_tr="Tatlı peynir dolgulu sıcak tel kadayıf, üzeri dövülmüş fıstıklı.",
            price=7.5, discounted_price=6.0,
            image_url=UNSPLASH("photo-1519676867240-f03562e64548"),
        ),
        dict(
            name_en="Chocolate Lava Cake", name_ar="كيك الشوكولاتة الذائبة", name_tr="Sıcak Çikolatalı Sufle",
            description_en="Warm chocolate cake with a molten center, served with vanilla ice cream.",
            description_ar="كيك شوكولاتة دافئ بقلب سائل يقدم مع آيس كريم الفانيليا.",
            description_tr="Sıvı kalpli sıcak çikolatalı kek, vanilyalı dondurma ile servis edilir.",
            price=6.5, discounted_price=None,
            image_url=UNSPLASH("photo-1624353365286-3f8d62daad51"),
        ),
        dict(
            name_en="Pistachio Ice Cream", name_ar="آيس كريم الفستق", name_tr="Antep Fıstıklı Dondurma",
            description_en="House-churned pistachio ice cream, dense and chewy in the Turkish style.",
            description_ar="آيس كريم الفستق المصنوع منزليًا، كثيف وطري على الطريقة التركية.",
            description_tr="Ev yapımı, yoğun ve sakızlı Antep fıstıklı dondurma.",
            price=5.5, discounted_price=None,
            image_url=UNSPLASH("photo-1497034825429-c343d7c6a68f"),
        ),
    ],
}


# -------------------------------------------------------------- sunset-diner
SUNSET_CATEGORIES = [
    {"key": "mains", "name_en": "Diner Classics", "name_ar": "أطباق كلاسيكية", "name_tr": "Lokanta Klasikleri", "sort_order": 1},
    {"key": "drinks", "name_en": "Shakes & Sodas", "name_ar": "ميلك شيك ومشروبات غازية", "name_tr": "Milkshake ve Gazozlar", "sort_order": 2},
]

SUNSET_ITEMS = {
    "mains": [
        dict(
            name_en="All-American Cheeseburger", name_ar="تشيز برجر أمريكي", name_tr="Amerikan Çizburger",
            description_en="Double smash patty, American cheese, pickles, and diner sauce.",
            description_ar="قرصان لحم مع جبنة أمريكية ومخلل وصلصة خاصة.",
            description_tr="Çift köfte, Amerikan peyniri, turşu ve özel sos.",
            price=10.0, discounted_price=None,
            image_url=UNSPLASH("photo-1553979459-d2229ba7433b"),
        ),
        dict(
            name_en="Crispy Chicken Tenders", name_ar="أصابع دجاج مقرمشة", name_tr="Çıtır Tavuk Parmakları",
            description_en="Buttermilk-brined tenders, fried golden, served with honey mustard.",
            description_ar="أصابع دجاج منقوعة باللبن الرائب ومقلية مع صلصة العسل والخردل.",
            description_tr="Ayranla marine edilmiş, altın rengi kızarmış, ballı hardal soslu.",
            price=9.5, discounted_price=7.5,
            image_url=UNSPLASH("photo-1562967914-608f82629710"),
        ),
        dict(
            name_en="Loaded Diner Fries", name_ar="بطاطا مقلية محملة", name_tr="Dolgulu Patates Kızartması",
            description_en="Crispy fries topped with cheese sauce, bacon bits, and scallions.",
            description_ar="بطاطا مقرمشة مغطاة بصلصة الجبن وقطع اللحم المقدد والبصل الأخضر.",
            description_tr="Peynir sos, kanadalı jambon ve yeşil soğanla üzeri kaplı çıtır patates.",
            price=6.5, discounted_price=None,
            image_url=UNSPLASH("photo-1573080496219-bb080dd4f877"),
        ),
    ],
    "drinks": [
        dict(
            name_en="Classic Vanilla Milkshake", name_ar="ميلك شيك فانيليا كلاسيك", name_tr="Klasik Vanilyalı Milkshake",
            description_en="Hand-spun vanilla ice cream shake, topped with whipped cream.",
            description_ar="ميلك شيك آيس كريم الفانيليا مغطى بالكريمة المخفوقة.",
            description_tr="El yapımı vanilyalı dondurma milkshake, üzeri krem şantili.",
            price=5.0, discounted_price=None,
            image_url=UNSPLASH("photo-1572490122747-3968b75cc699"),
            sizes=[
                {"name_en": "Regular", "name_ar": "عادي", "name_tr": "Normal", "price_modifier": 0.0},
                {"name_en": "Large", "name_ar": "كبير", "name_tr": "Büyük", "price_modifier": 1.5},
            ],
        ),
        dict(
            name_en="Fountain Soda", name_ar="مشروب غازي", name_tr="Fıçı Gazoz",
            description_en="Classic fountain soda, served ice cold with free refills.",
            description_ar="مشروب غازي كلاسيكي بارد مع إعادة تعبئة مجانية.",
            description_tr="Buz gibi soğuk, ücretsiz doldurmalı klasik gazoz.",
            price=2.5, discounted_price=None,
            image_url=UNSPLASH("photo-1543253687-c931c8e01820"),
        ),
    ],
}


def _seed_tenant(session, tenant_data, categories_def, items_by_key):
    tenant = Tenant(**tenant_data)
    session.add(tenant)
    session.commit()
    session.refresh(tenant)

    category_ids = {}
    for cat in categories_def:
        row = Category(
            tenant_id=tenant.id,
            name_en=cat["name_en"], name_ar=cat["name_ar"], name_tr=cat["name_tr"],
            sort_order=cat["sort_order"],
        )
        session.add(row)
        session.commit()
        session.refresh(row)
        category_ids[cat["key"]] = row.id

    item_count = 0
    for key, items in items_by_key.items():
        for item in items:
            item.setdefault("sizes", [])
            row = MenuItem(tenant_id=tenant.id, category_id=category_ids[key], **item)
            session.add(row)
            item_count += 1
    session.commit()

    return tenant, len(categories_def), item_count


def run():
    init_db()
    with Session(engine) as session:
        # Clear existing demo data so the script is safely re-runnable.
        session.exec(delete(MenuItem))
        session.exec(delete(Category))
        session.exec(delete(Tenant))
        session.commit()

        tenant1, cat1_count, item1_count = _seed_tenant(session, TENANTS[0], CATEGORIES, ITEMS)
        tenant2, cat2_count, item2_count = _seed_tenant(session, TENANTS[1], SUNSET_CATEGORIES, SUNSET_ITEMS)

        print(f"Seeded tenant '{tenant1.slug}': {cat1_count} categories, {item1_count} menu items.")
        print(f"Seeded tenant '{tenant2.slug}': {cat2_count} categories, {item2_count} menu items.")
        print()
        print("Test isolation locally with the X-Tenant-Slug header, e.g.:")
        print("  curl -H 'X-Tenant-Slug: sunset-diner' http://localhost:8000/api/v1/categories")


if __name__ == "__main__":
    run()
