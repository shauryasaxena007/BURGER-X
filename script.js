// ===== PRODUCT DATA =====
alert("Welcome to THE BURGER X! Enjoy delicious burgers and more.");

let products = [];

// ===== CART MANAGEMENT =====
let cart = JSON.parse(localStorage.getItem('sburgerx_cart')) || [];

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    updateCartUI();
    initializeNavbar();
    initializeCart();
    initializeScrollAnimations();
});

// ===== NAVBAR FUNCTIONALITY =====
function initializeNavbar() {
    const navToggler = document.getElementById('navToggler');
    const navbarCollapse = document.getElementById('navbarNav');
    const navLinks = document.querySelectorAll('.nav-link');

    navToggler.addEventListener('click', function() {
        this.classList.toggle('active');
        navbarCollapse.classList.toggle('show');
    });

    // Close navbar when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth < 992) {
                navToggler.classList.remove('active');
                navbarCollapse.classList.remove('show');
            }
            
            // Update active link
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.15)';
        } else {
            navbar.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
        }
    });
}

// ===== LOAD PRODUCTS =====
async function loadProducts() {

    const container = document.getElementById('productContainer');

    try {

        const response = await fetch("http://127.0.0.1:5000/burgers");

        if (!response.ok) {
            throw new Error("Failed to fetch burgers");
        }

        products = await response.json();

        container.innerHTML = '';

        products.forEach(product => {

            const productCard = `
                <div class="col-lg-4 col-md-6">
                    <div class="product-card">

                        <div class="product-image">
                            <img src="image/${product.image}" alt="${product.name}">
                        </div>

                        <div class="product-body">

                            <h3 class="product-title">
                                ${product.name}
                            </h3>

                            <p class="product-description">
                                ${product.description}
                            </p>

                            <div class="product-footer">
                                <span class="product-extra">
                                    ₹${product.extra}
                                </span>

                                <span class="product-price">
                                    ₹${product.price}
                                </span>
                            </div>

                            <div class="product-foot-btn">

                                <button 
                                    class="btn-add-cart" 
                                    onclick="addToCart(${product.id})">

                                    <i class="fas fa-cart-plus"></i>
                                    Add

                                </button>

                            </div>

                        </div>
                    </div>
                </div>
            `;

            container.innerHTML += productCard;
        });

    } catch (error) {

        console.error("Error loading burgers:", error);

        container.innerHTML = `
            <div class="alert alert-danger">
                Unable to load burgers from server.
            </div>
        `;
    }
}

// ===== ADD TO CART =====
async function addToCart(productId) {

    // Check login
    const user = JSON.parse(
        localStorage.getItem("burgerx_user")
    );

    if (!user) {
        showNotification("Item added to cart!", "success");
        await loadDatabaseCart();
        setTimeout(() => {
            window.location.href = "/auth";
        }, 1000);

        return;
    }

    try {

        const response = await fetch(
            "http://127.0.0.1:5000/cart",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    user_id: user.id,
                    burger_id: productId,
                    quantity: 1
                })
            }
        );

        const data = await response.json();

        console.log(data);

       if (data.success) {

    showNotification("Item added to cart!", "success");

    // DB se latest cart lao
    const cartResponse = await fetch(
        `http://127.0.0.1:5000/cart/${user.id}`
    );

    const cartData = await cartResponse.json();

    if (cartData.success) {

        cart = cartData.cart.map(item => ({
            id: item.burger_id,
            name: item.name,
            price: Number(item.price),
            image: item.image,
            quantity: Number(item.quantity),
            emoji: "🍔"
        }));

        // 🔥 Immediately update cart number
        updateCartUI();

        // 🔥 Immediately update cart items
        renderCartItems();
    }
} else {

            showNotification(
                data.message,
                "warning"
            );
        }

    } catch (error) {

        console.error(error);

        showNotification(
            "Unable to add item to cart.",
            "warning"
        );
    }
}

// ===== REMOVE FROM CART =====
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
    renderCartItems();
}

// ===== UPDATE QUANTITY =====
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCart();
            updateCartUI();
            renderCartItems();
        }
    }
}

// ===== SAVE CART =====
function saveCart() {
    localStorage.setItem('sburgerx_cart', JSON.stringify(cart));
}

// ===== UPDATE CART UI =====
function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    if (totalItems > 0) {
        cartCount.style.display = 'flex';
    } else {
        cartCount.style.display = 'none';
    }
}

// ===== INITIALIZE CART MODAL =====
function initializeCart() {
    const cartBtn = document.getElementById('cartBtn');
    const cartModal = new bootstrap.Modal(document.getElementById('cartModal'));
    const checkoutBtn = document.getElementById('checkoutBtn');

    cartBtn.addEventListener('click', function(e) {
        e.preventDefault();
        renderCartItems();
        cartModal.show();
    });

    checkoutBtn.addEventListener('click', function() {
        if (cart.length === 0) {
            showNotification('Your cart is empty!', 'warning');
            return;
        }
        showNotification('Order placed successfully! Thank you for choosing S BURGER X!', 'success');
        cart = [];
        saveCart();
        updateCartUI();
        renderCartItems();
        setTimeout(() => {
            cartModal.hide();
        }, 1500);
    });
}

// ===== RENDER CART ITEMS =====
function renderCartItems() {
    const cartItemsContainer = document.getElementById('cartItems');
    const emptyCart = document.getElementById('emptyCart');
    const cartTotal = document.getElementById('cartTotal');

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '';
        emptyCart.style.display = 'block';
        cartTotal.textContent = '0';
        return;
    }

    emptyCart.style.display = 'none';
    let total = 0;
    let cartHTML = '';

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        cartHTML += `
            <div class="cart-item">
                <div class="cart-item-image">${item.emoji}</div>
                <div class="cart-item-details">
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-price">₹${item.price} each</div>
                </div>
                <div class="cart-item-controls">
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                    </div>
                    <button class="remove-btn" onclick="removeFromCart(${item.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });

    cartItemsContainer.innerHTML = cartHTML;
    cartTotal.textContent = total;
}

// ===== NOTIFICATION SYSTEM =====
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#27ae60' : '#f39c12'};
        color: white;
        padding: 1rem 2rem;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        z-index: 9999;
        animation: slideInRight 0.3s ease-out;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add notification animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ===== SCROLL ANIMATIONS =====
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.product-card, .contact-card, .about-content').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(50px)';
        el.style.transition = 'all 0.6s ease-out';
        observer.observe(el);
    });
}
// ===== AUTH NAVBAR =====

function updateAuthNavbar() {

    const authNav = document.getElementById("authNav");

    if (!authNav) return;

    const user = JSON.parse(
        localStorage.getItem("burgerx_user")
    );

    if (user) {

        authNav.innerHTML = `
            <a class="nav-link" href="#" id="userName">
                👤 ${user.name}
            </a>

            <a class="nav-link" href="#" id="logoutBtn">
                Logout
            </a>
        `;

        document.getElementById("logoutBtn").addEventListener(
            "click",
            function(e) {

                e.preventDefault();

                localStorage.removeItem("burgerx_user");

                window.location.href = "/";
            }
        );

    } else {

        authNav.innerHTML = `
            <a class="nav-link" href="/auth">
                Login
            </a>
        `;
    }
}


// Run when website loads
document.addEventListener("DOMContentLoaded", function() {
    updateAuthNavbar();
    loadDatabaseCart();
});
async function loadDatabaseCart() {

    const user = JSON.parse(localStorage.getItem("burgerx_user"));

    if (!user) {
        return;
    }

    try {

        const response = await fetch(
            `http://127.0.0.1:5000/cart/${user.id}`
        );

        const data = await response.json();

        console.log("Database Cart:", data);

        if (data.success) {

            cart = data.cart.map(item => ({
                id: item.burger_id,
                name: item.name,
                price: item.price,
                image: item.image,
                quantity: item.quantity
            }));

            renderCartItems();

        }

    } catch (error) {

        console.error("Cart loading error:", error);

    }
}
// ===== LOAD CART FROM DATABASE =====
async function loadDatabaseCart() {

    const user = JSON.parse(localStorage.getItem("burgerx_user"));

    if (!user) return;

    try {

        const response = await fetch(
            `http://127.0.0.1:5000/cart/${user.id}`
        );

        const data = await response.json();

        console.log("Database Cart:", data);

        if (data.success) {

            cart = data.cart.map(item => ({
                id: item.burger_id,
                name: item.name,
                price: Number(item.price),
                image: item.image,
                quantity: Number(item.quantity),
                emoji: "🍔"
            }));

            updateCartUI();
            renderCartItems();
        }

    } catch (error) {

        console.error("Database cart error:", error);

    }
}