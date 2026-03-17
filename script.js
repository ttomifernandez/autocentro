document.addEventListener('DOMContentLoaded', () => {
    const header = document.getElementById('header');
    const reveals = document.querySelectorAll('[data-reveal]');

    // --- State Management (LocalStorage) ---
    const defaultState = {
        promos_active: true,
        promos: [
            { title: "20% OFF en Alineación 3D", img: "service2.png" },
            { title: "Kit de Suspensión -15%", img: "service3.png" },
            { title: "4x3 en Neumáticos Michelin", img: "service1.png" },
            { title: "Chequeo Preventivo Gratis", img: "service2.png" },
            { title: "Cambio de Aceite Promo", img: "service3.png" },
            { title: "Balanceo de Regalo", img: "service1.png" }
        ],
        products_active: true,
        products: [
            { title: "Pirelli Scorpion", desc: "Máximo agarre en terrenos difíciles.", category: "Neumáticos", img: "service1.png" },
            { title: "Michelin Primacy 4", desc: "Seguridad duradera y eficiencia.", category: "Neumáticos", img: "service1.png" },
            { title: "Bridgestone Turanza", desc: "Confort premium en cada viaje.", category: "Neumáticos", img: "service1.png" },
            { title: "Llantas Deportivas R17", desc: "Diseño aerodinámico y resistente.", category: "Llantas", img: "service2.png" },
            { title: "Amortiguadores Monroe", desc: "Estabilidad controlada y suave.", category: "Servicios", img: "service3.png" },
            { title: "Kit de Frenos Brembo", desc: "Frenado de alta performance.", category: "Servicios", img: "service3.png" }
        ],
        leads: []
    };
    const state = JSON.parse(localStorage.getItem('autocentro_state')) || defaultState;

    // --- Dynamic UI Injection ---
    const menuUl = document.querySelector('nav ul');
    const promosSec = document.getElementById('promos');
    const productsSec = document.getElementById('productos');
    const formSelection = document.getElementById('formInterest');

    if (state.promos_active) {
        promosSec.classList.add('active');
        const li = document.createElement('li');
        li.innerHTML = '<a href="#promos">Promos</a>';
        menuUl.insertBefore(li, menuUl.children[1]);

        const container = document.getElementById('promos-container');
        container.innerHTML = state.promos.map(p => `
            <div class="service-card" style="border-color: rgba(var(--primary-rgb), 0.2);">
                <div class="service-img">
                    <img src="${p.img || 'service1.png'}" alt="Promo">
                </div>
                <div class="service-info" style="padding: 1.5rem;">
                    <span style="font-size: 0.65rem; color: var(--primary); letter-spacing: 0.15em; font-weight: 700; text-transform: uppercase;">Promoción</span>
                    <h3 style="font-size: 1.1rem; margin: 0.5rem 0; line-height: 1.2;">${p.title}</h3>
                    <button class="cta-btn" style="width: 100%; display: block; text-align: center; margin-top: 1rem; font-size: 0.7rem;" onclick="openCheckout('${p.title.replace(/'/g, "\\'").replace(/"/g, '&quot;')}', 'PROMO')">Me interesa</button>
                </div>
            </div>
        `).join('');
    }

    if (state.products_active) {
        productsSec.classList.add('active');
        const li = document.createElement('li');
        li.innerHTML = '<a href="#productos">Productos</a>';
        // Find 'Contacto' and insert before it
        const contactLink = [...menuUl.children].find(child => child.innerHTML.includes('#contacto'));
        menuUl.insertBefore(li, contactLink);
        
        renderProducts(state.products);

        // Update Form select with dynamic products
        state.products.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.title;
            opt.textContent = p.title;
            formSelection.appendChild(opt);
        });
    }

    function renderProducts(prods) {
        const grid = document.getElementById('products-grid');
        grid.innerHTML = prods.map(p => `
            <div class="service-card">
                <div class="service-img">
                    <img src="${p.img}" alt="${p.title}">
                </div>
                <div class="service-info">
                    <span style="font-size: 0.65rem; color: var(--primary); letter-spacing: 0.1em; font-weight: 700; text-transform: uppercase;">${p.category}</span>
                    <h3>${p.title}</h3>
                    <p>${p.desc}</p>
                    <button class="cta-btn" style="margin-top: 1rem; width: 100%; font-size: 0.72rem;" onclick="openCheckout('${p.title.replace(/'/g, "\\'").replace(/"/g, '&quot;')}', 'CATÁLOGO')">
                        Pedir Presupuesto
                    </button>
                </div>
            </div>
        `).join('');
    }

    // --- Search & Filters ---
    const searchInput = document.getElementById('productSearch');
    const filterSelect = document.getElementById('categoryFilter');

    const filterHandler = () => {
        const query = searchInput.value.toLowerCase();
        const cat = filterSelect.value;
        const filtered = state.products.filter(p => {
            const matchesQuery = p.title.toLowerCase().includes(query) || p.desc.toLowerCase().includes(query);
            const matchesCat = cat === 'all' || p.category === cat;
            return matchesQuery && matchesCat;
        });
        renderProducts(filtered);
    };

    if(searchInput) searchInput.addEventListener('input', filterHandler);
    if(filterSelect) filterSelect.addEventListener('change', filterHandler);

    // --- WhatsApp Form ---
    const contactForm = document.getElementById('whatsappForm');
    if (contactForm) {
        contactForm.onsubmit = (e) => {
            e.preventDefault();
            const name = document.getElementById('formName').value;
            const vehicle = document.getElementById('formVehicle').value;
            const interest = document.getElementById('formInterest').value;
            const msg = document.getElementById('formMessage').value;

            // Save Lead
            saveLead(name, vehicle, interest);

            const text = `Hola Autocentro! Mi nombre es *${name}*.\nEstoy interesado en: *${interest}*.\nVehículo: *${vehicle}*.\nMensaje: ${msg}`;
            const encoded = encodeURIComponent(text);
            window.open(`https://wa.me/5493515929043?text=${encoded}`, '_blank');
        };
    }

    // --- Mobile Menu ---
    const menuToggle = document.getElementById('menuToggle');
    const closeDrawer = document.getElementById('closeDrawer');
    const mobileMenu = document.getElementById('mobileMenu');

    window.toggleMenu = () => mobileMenu.classList.toggle('active');
    if (menuToggle) menuToggle.onclick = toggleMenu;
    if (closeDrawer) closeDrawer.onclick = toggleMenu;

    // --- Admin Login ---
    window.openLogin = () => {
        toggleMenu();
        document.getElementById('loginModal').classList.add('active');
    };
    window.closeLogin = () => document.getElementById('loginModal').classList.remove('active');
    
    window.checkLogin = () => {
        const user = document.getElementById('userLogin').value;
        const pass = document.getElementById('passLogin').value;
        const error = document.getElementById('loginError');
        if(user === 'admin' && pass === 'admin') {
            window.location.href = 'admin.html';
        } else {
            error.style.display = 'block';
        }
    };

    // ── CHECKOUT UNIVERSAL ───────────────────────────────
    let _checkoutContext = ''; // stores what interest/product was clicked

    window.openCheckout = (interest, badge) => {
        _checkoutContext = interest || 'Consulta General';
        document.getElementById('checkoutTitle').textContent = interest || 'Solicitar Turno';
        document.getElementById('checkoutBadge').textContent = badge || 'TURNOS ONLINE';
        document.getElementById('ckName').value = '';
        document.getElementById('ckPhone').value = '';
        document.getElementById('ckMessage').value = '';
        document.getElementById('checkoutModal').classList.add('active');
    };

    window.closeCheckout = () => document.getElementById('checkoutModal').classList.remove('active');

    // Alias for "Turnos Online" button in header
    window.openModal = () => openCheckout('Solicitar Turno', 'TURNOS ONLINE');

    window.submitCheckout = () => {
        const name  = document.getElementById('ckName').value.trim();
        const phone = document.getElementById('ckPhone').value.trim();
        const msg   = document.getElementById('ckMessage').value.trim();

        if (!name || !phone) {
            alert('Por favor completá tu nombre y teléfono.');
            return;
        }

        // Save lead
        saveLead(name, phone, _checkoutContext);

        // Compose WhatsApp message
        const text = [
            `Hola Autocentro! 👋`,
            `Nombre: *${name}*`,
            `Tel: *${phone}*`,
            `Consulta: *${_checkoutContext}*`,
            msg ? `Mensaje: ${msg}` : ''
        ].filter(Boolean).join('\n');

        window.open(`https://wa.me/5493515929043?text=${encodeURIComponent(text)}`, '_blank');
        closeCheckout();
    };

    // Legacy shortcut used by contact form
    window.orderProduct = (name) => openCheckout(name, 'CATÁLOGO');

    function saveLead(name, phone, interest) {
        const lead = { name, phone, interest, date: new Date().toLocaleDateString() };
        const curState = JSON.parse(localStorage.getItem('autocentro_state')) || { leads: [] };
        if (!curState.leads) curState.leads = [];
        curState.leads.push(lead);
        localStorage.setItem('autocentro_state', JSON.stringify(curState));
    }

    window.orderProduct = (name) => {
        document.getElementById('formInterest').value = name;
        document.querySelector('#contacto').scrollIntoView({ behavior: 'smooth' });
    };

    // --- Carousel Controls ---
    window.scrollCarousel = (id, dir) => {
        const track = document.getElementById(id);
        if (!track) return;
        const card = track.querySelector('.service-card');
        const cardWidth = card ? card.offsetWidth + 20 : 300; // 20 = gap
        track.scrollBy({ left: dir * cardWidth * 2, behavior: 'smooth' });
    };

    // Touch/swipe support for carousels
    document.querySelectorAll('.services-grid').forEach(track => {
        let startX = 0;
        track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
        track.addEventListener('touchend', e => {
            const diff = startX - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 50) {
                track.scrollBy({ left: diff * 2, behavior: 'smooth' });
            }
        }, { passive: true });
    });

    // --- Existing Visual Logic ---
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                revealObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    reveals.forEach(el => revealObserver.observe(el));

    document.querySelectorAll('nav a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSector = document.querySelector(targetId);
            if (targetSector) {
                window.scrollTo({ top: targetSector.offsetTop - 80, behavior: 'smooth' });
            }
        });
    });

    const video = document.getElementById('heroVideo');
    if (video) video.playbackRate = 0.8;
});
