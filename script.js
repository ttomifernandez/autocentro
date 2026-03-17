document.addEventListener('DOMContentLoaded', () => {
    const header = document.getElementById('header');
    const reveals = document.querySelectorAll('[data-reveal]');

    // --- State Management (LocalStorage) ---
    const defaultState = {
        promos_active: false,
        promos: [],
        products_active: false,
        products: []
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
        // Insert after 'Inicio'
        menuUl.insertBefore(li, menuUl.children[1]);

        const container = document.getElementById('promos-container');
        container.innerHTML = state.promos.map(p => `
            <div class="service-card" style="border-color: var(--primary);">
                <div class="service-img">
                    <img src="${p.img || 'service1.png'}" alt="Promo">
                </div>
                <div class="service-info">
                    <h3 style="color: var(--primary); margin: 0; font-size: 0.8rem;">OFERTA LIMITADA</h3>
                    <p style="font-size: 1.4rem; font-weight: 800; color: #fff; margin: 0.5rem 0;">${p.title}</p>
                    <a href="#contacto" class="cta-btn" style="margin-top: 10px; display: block; text-align: center; font-size: 0.7rem; padding: 0.5rem;">Lo quiero</a>
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
                    <span style="font-size: 0.7rem; color: var(--primary); text-transform: uppercase;">${p.category}</span>
                    <h3>${p.title}</h3>
                    <p>${p.desc}</p>
                    <button class="cta-btn" style="margin-top: 1rem; width: 100%;" onclick="orderProduct('${p.title}')">Pedir Presupuesto</button>
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

    function saveLead(name, vehicle, interest) {
        const lead = {
            name,
            vehicle,
            interest,
            date: new Date().toLocaleDateString()
        };
        const curState = JSON.parse(localStorage.getItem('autocentro_state')) || defaultState;
        if (!curState.leads) curState.leads = [];
        curState.leads.push(lead);
        localStorage.setItem('autocentro_state', JSON.stringify(curState));
    }

    window.redirectToWhatsApp = (service) => {
        closeModal();
        const text = `Hola Autocentro! Quisiera solicitar un turno para: *${service}*`;
        const encoded = encodeURIComponent(text);
        window.open(`https://wa.me/5493515929043?text=${encoded}`, '_blank');
    };

    window.openModal = () => document.getElementById('serviceModal').classList.add('active');
    window.closeModal = () => document.getElementById('serviceModal').classList.remove('active');

    window.orderProduct = (name) => {
        document.getElementById('formInterest').value = name;
        document.querySelector('#contacto').scrollIntoView({ behavior: 'smooth' });
    };

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
