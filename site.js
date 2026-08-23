(function () {
  'use strict';

  const businessConfig = Object.freeze({
    name: 'Erensan Jeneratör ve Makine Sanayi',
    phoneDisplay: '0534 937 39 79',
    phoneE164: '+905349373979',
    whatsapp: '905349373979',
    email: 'erensangenerator@gmail.com',
    address: 'Arpaçsakarlar Mahallesi, Camili Köyü Girişi, Toroslar / Mersin',
    city: 'Mersin',
    openingHours: '07:00-19:00',
    emergencySupport: '7/24 teknik servis',
    googleBusinessUrl: 'https://share.google/dx4l87Jjgidx7UCs3',
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Erensan%20Jenerat%C3%B6r%20ve%20Makine%20Sanayi%2C%20Arpa%C3%A7sakarlar%20Mahallesi%2C%20Camili%20K%C3%B6y%C3%BC%20Giri%C5%9Fi%2C%20Toroslar%2C%20Mersin',
    serviceAreas: Object.freeze(['Toroslar', 'Akdeniz', 'Yenişehir', 'Mezitli', 'Tarsus', 'Erdemli', 'Mersin Geneli', 'Türkiye Geneli'])
  });
  const generatorProducts = Object.freeze([]);
  const googleReviews = Object.freeze([]);

  const path = window.location.pathname.toLowerCase();
  const intents = [
    { test: /kiralama|kiralik/, key: 'rental', message: 'Merhaba, jeneratör kiralama hakkında teklif almak istiyorum. Konum, başlangıç tarihi, süre ve tahmini güç bilgilerini paylaşabilirim.' },
    { test: /yedek-parca/, key: 'spare_parts', message: 'Merhaba, jeneratör yedek parça hakkında bilgi almak istiyorum. Marka/model ve cihaz etiketi fotoğrafını paylaşabilirim.' },
    { test: /onarim|tamir/, key: 'repair', message: 'Merhaba, jeneratör bakım veya onarım desteğine ihtiyacım var. Marka/model, arıza belirtisi ve konum bilgisini paylaşabilirim.' },
    { test: /bakim|hararet|yag|filtre|aku/, key: 'service', message: 'Merhaba, jeneratör bakım desteğine ihtiyacım var. Marka/model, çalışma saati ve konum bilgisini paylaşabilirim.' },
    { test: /servis/, key: 'service', message: 'Merhaba, jeneratör teknik servis desteğine ihtiyacım var. Marka/model, arıza belirtisi ve konum bilgisini paylaşabilirim.' },
    { test: /satis|satin|kva|secimi/, key: 'sales', message: 'Merhaba, jeneratör satın almak için bilgi almak istiyorum. Kullanım amacı, tahmini yük ve kurulum konumunu paylaşabilirim.' }
  ];

  const intent = intents.find((item) => item.test.test(path)) || {
    key: 'general',
    message: 'Merhaba, jeneratör satışı, kiralama veya teknik servis hakkında bilgi almak istiyorum.'
  };

  function track(name, data) {
    if (typeof window.va !== 'function') return;
    const safeData = data && typeof data === 'object' ? data : {};
    window.va('event', { name: name, data: safeData });
  }

  function eventLocation(element) {
    return element.closest('header') ? 'header' :
      element.closest('footer') ? 'footer' :
      element.closest('.mobile-action-bar') ? 'mobile_sticky' :
      element.closest('article') ? 'article' : 'content';
  }

  function appendMobileActions() {
    if (document.querySelector('.mobile-action-bar')) return;
    const bar = document.createElement('nav');
    bar.className = 'mobile-action-bar';
    bar.setAttribute('aria-label', 'Hızlı iletişim');
    const whatsappUrl = 'https://wa.me/' + businessConfig.whatsapp + '?text=' + encodeURIComponent(intent.message);
    bar.innerHTML =
      '<a class="mobile-phone" href="tel:' + businessConfig.phoneE164 + '" aria-label="Erensan Jeneratör telefonunu ara">Telefon Et</a>' +
      '<a class="mobile-whatsapp" href="' + whatsappUrl + '" target="_blank" rel="noopener" aria-label="Erensan Jeneratör ile WhatsApp üzerinden iletişime geç">WhatsApp</a>';
    document.body.appendChild(bar);
  }

  function initMapLoaders() {
    document.querySelectorAll('[data-map-src]').forEach((container) => {
      const button = container.querySelector('[data-load-map]');
      if (!button) return;
      button.addEventListener('click', () => {
        if (container.querySelector('iframe')) return;
        const iframe = document.createElement('iframe');
        iframe.src = container.dataset.mapSrc;
        iframe.title = container.dataset.mapTitle || 'Erensan Jeneratör konum haritası';
        iframe.loading = 'lazy';
        iframe.referrerPolicy = 'no-referrer-when-downgrade';
        iframe.setAttribute('allowfullscreen', '');
        container.replaceChildren(iframe);
      });
    });
  }

  function bindAnalytics() {
    document.addEventListener('click', (event) => {
      const link = event.target.closest('a');
      if (!link) return;
      const href = link.getAttribute('href') || '';
      const location = eventLocation(link);
      let eventName = '';

      if (href.startsWith('tel:')) eventName = 'phone_click';
      else if (/wa\.me|api\.whatsapp\.com/i.test(href)) {
        eventName = intent.key === 'rental' ? 'rental_whatsapp_click' :
          intent.key === 'service' || intent.key === 'repair' ? 'service_whatsapp_click' :
          intent.key === 'sales' ? 'sales_whatsapp_click' :
          intent.key === 'spare_parts' ? 'spare_parts_whatsapp_click' : 'whatsapp_click';
      } else if (/maps\/dir|google\.com\/maps\/dir/i.test(href)) eventName = 'directions_click';
      else if (/share\.google/i.test(href)) eventName = 'google_business_click';
      else if (/referanslar\.html/i.test(href)) eventName = 'gallery_open';
      else if (/^\.\.\/mersin-jenerator-servisi\.html|mersin-jenerator-servisi\.html/i.test(href) && path.includes('/blog/')) eventName = 'blog_to_service';
      else if (/^\.\.\/mersin-jenerator-kiralama\.html|mersin-jenerator-kiralama\.html/i.test(href) && path.includes('/blog/')) eventName = 'blog_to_rental';
      else if (/^\.\.\/mersin-jenerator-satis\.html|mersin-jenerator-satis\.html/i.test(href) && path.includes('/blog/')) eventName = 'blog_to_sales';

      if (eventName) track(eventName, { location: location, intent: intent.key });
    });

    if (path.endsWith('/mersin-jenerator-servisi.html') || path.endsWith('/mersin-jenerator-onarimi.html')) track('service_page_view', { intent: intent.key });
    if (path.endsWith('/mersin-jenerator-kiralama.html')) track('rental_page_view', { intent: intent.key });
    if (path.endsWith('/mersin-jenerator-satis.html')) track('sales_page_view', { intent: intent.key });
  }

  window.erensanData = Object.freeze({
    businessConfig: businessConfig,
    generatorProducts: generatorProducts,
    googleReviews: googleReviews
  });
  appendMobileActions();
  initMapLoaders();
  bindAnalytics();
}());
