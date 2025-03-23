(() => {
  const PRODUCTS_KEY = "productList";
  const FAVORITES_KEY = "favoriteProducts";
  const API_URL = "https://gist.githubusercontent.com/sevindi/8bcbde9f02c1d4abe112809c974e1f49/raw/9bf93b58df623a9b16f1db721cd0a7a539296cf0/products.json";

  function init() {
    if (window.location.pathname !== "/") {
      console.log("wrong page");
      return;
    }

    console.log("✅ Sayfa doğru");
    buildCSS();
    fetchProducts();
  }

  function fetchProducts() {
    const saved = localStorage.getItem(PRODUCTS_KEY);
    if (saved) {
      const products = JSON.parse(saved);
      console.log("📦 Ürünler LocalStorage'dan alındı:", products);
      buildHTML(products);
    } else {
      fetch(API_URL)
        .then(res => res.json())
        .then(data => {
          localStorage.setItem(PRODUCTS_KEY, JSON.stringify(data));
          console.log("🌐 Ürünler API'dan alındı:", data);
          buildHTML(data);
        })
        .catch(err => console.error("❌ Ürün verisi alınamadı:", err));
    }
  }

  function buildHTML(products) {
    console.log("🔧 HTML kuruluyor...");

    let storiesElement = document.querySelector(".stories");
    if (!storiesElement) {
      console.warn("❗ '.stories' öğesi bulunamadı. 'banner__titles' öğesinden önce ekleniyor...");
      const bannerTitlesElement = document.querySelector(".banner__titles");
      if (bannerTitlesElement) {
        bannerTitlesElement.insertAdjacentHTML("beforebegin", `<div class="stories"></div>`);
        storiesElement = document.querySelector(".stories");
      } else {
        console.error("❌ '.banner__titles' öğesi bulunamadı. HTML yapısını kontrol edin.");
        return;
      }
    }

    const title = `<h2 class="title-primary">Beğenebileceğinizi düşündüklerimiz</h2>`;
    storiesElement.insertAdjacentHTML("afterend", title);
    document.querySelector(".title-primary").insertAdjacentHTML("afterend", `<div class="product-carousel"></div>`);

    const carousel = document.querySelector(".product-carousel");
    const carouselInner = `<div class="carousel-inner"></div>`;
    carousel.insertAdjacentHTML("beforeend", carouselInner);

    const carouselInnerElement = document.querySelector(".carousel-inner");
    products.forEach(product => {
      const price = parseFloat(product.price);
      const original = parseFloat(product.original_price);
      const hasDiscount = original && price < original;

      const html = `
        <div class="carousel-item">
          <div class="product-item" onclick="window.open('${product.url}', '_blank')">
            <figure class="product-item__img">
              ${product.image ? `<img src="${product.image}" alt="${product.name}" loading="lazy" />` : `<div>📷 Görsel Yok</div>`}
            </figure>
            <h2 class="product-item__brand">
              <b></b> <span>${product.name}</span>
            </h2>
            <div class="product-item__price">
              ${hasDiscount
                ? `
                <span class="product-item__old-price">${original.toFixed(2)} TL</span>
                <span class="product-item__percent carousel-product-price-percent ml-2">
                  %${Math.round(((original - price) / original) * 100)}
                </span>
                <span class="product-item__new-price discount-product">${price.toFixed(2)} TL</span>
              `
                : `<span class="product-item__new-price">${price.toFixed(2)} TL</span>`}
            </div>
            <div class="heart">
              <img class="heart-icon ${getHeartIcon(product.id) ? 'filled' : ''}" src="https://cdn-icons-png.flaticon.com/512/833/833300.png" data-id="${product.id}" />
            </div>
          </div>
        </div>
      `;

      carouselInnerElement.insertAdjacentHTML("beforeend", html);
    });

    setEvents();
    setCarouselEvents();
  }

  function getHeartIcon(id) {
    const favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
    return favorites.includes(id)
      ? "https://cdn-icons-png.flaticon.com/512/833/833472.png"
      : "https://cdn-icons-png.flaticon.com/512/833/833300.png";
  }

  function buildCSS() {
    const css = `
      .title-primary {
        font-family: Arial, sans-serif; /* Yazı tipi */
        font-size: 24px; /* Yazı boyutu */
        font-weight: bold; /* Kalın yazı */
        color: #f58220; /* Turuncu renk */
        margin-bottom: 20px; /* Alt boşluk */
        text-align: center; /* Ortaya hizalama */
      }

      .carousel-container {
        position: relative;
        display: flex;
        align-items: center;
      }

      .product-carousel {
        overflow: hidden;
        width: 100%;
      }

      .carousel-inner {
        display: flex;
        transition: transform 0.3s ease-in-out;
      }

      .carousel-item {
        flex: 0 0 auto;
        width: 240px;
        margin-right: 16px;
      }

      .product-item {
        position: relative;
        padding: 12px;
        border: 1px solid #eee;
        border-radius: 8px;
        background: #fff;
        box-sizing: border-box;
      }

      .product-item__img {
        height: 150px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 10px;
      }

      .product-item__img img {
        max-width: 100%;
        max-height: 100%;
      }

      .heart {
        position: absolute;
        top: 8px;
        right: 8px;
        cursor: pointer;
      }

      .heart-icon.filled {
        filter: hue-rotate(30deg) saturate(5);
      }

      .carousel-btn {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        background-color: rgba(0, 0, 0, 0.5);
        color: white;
        border: none;
        padding: 10px;
        cursor: pointer;
        z-index: 10;
      }

      .left-btn {
        left: 0;
      }

      .right-btn {
        right: 0;
      }
    `;

    const style = document.createElement("style");
    style.className = "custom-carousel-style";
    style.textContent = css;
    document.head.appendChild(style);

    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Quicksand:wght@700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }

  function setEvents() {
    const heartIcons = document.querySelectorAll(".heart-icon");
    if (!heartIcons.length) {
      console.warn("❗ 'heart-icon' öğesi bulunamadı. Event'ler eklenemedi.");
      return;
    }

    heartIcons.forEach(icon => {
      icon.addEventListener("click", function (e) {
        e.stopPropagation();
        const id = this.getAttribute("data-id");
        const favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
        const index = favorites.indexOf(id);

        if (index > -1) {
          favorites.splice(index, 1);
          this.setAttribute("src", "https://cdn-icons-png.flaticon.com/512/833/833300.png");
        } else {
          favorites.push(id);
          this.setAttribute("src", "https://cdn-icons-png.flaticon.com/512/833/833472.png");
        }

        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      });
    });

    console.log("✅ Event'ler yüklendi");
  }

  function setCarouselEvents() {
    const leftBtn = document.querySelector(".left-btn");
    const rightBtn = document.querySelector(".right-btn");
    const carouselInner = document.querySelector(".carousel-inner");

    let scrollPosition = 0;

    leftBtn.addEventListener("click", () => {
      const itemWidth = document.querySelector(".carousel-item").offsetWidth + 16; // 16px margin
      scrollPosition = Math.max(scrollPosition - itemWidth, 0);
      carouselInner.style.transform = `translateX(-${scrollPosition}px)`;
    });

    rightBtn.addEventListener("click", () => {
      const itemWidth = document.querySelector(".carousel-item").offsetWidth + 16; // 16px margin
      const maxScroll = carouselInner.scrollWidth - carouselInner.offsetWidth;
      scrollPosition = Math.min(scrollPosition + itemWidth, maxScroll);
      carouselInner.style.transform = `translateX(-${scrollPosition}px)`;
    });
  }

  // Başlat
  init();
})();