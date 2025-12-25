// ===== PRODUCT DATA =====
alert("Welcome to THE BURGER X! Enjoy delicious burgers and more.");

const products = [
    {
        id: 1,
        name: "Classic Burger",
        description: "Juicy beef patty with fresh lettuce, tomato, and special sauce",
        extra:249,
        price: 149,
       image: "amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg"

    },
    {
        id: 2,
        name: "Cheese Burger",
        description: "Double cheese with premium beef patty and crispy bacon",
       extra:279, price: 179,
         image: "amirali-mirhashemian-jh5XyK4Rr3Y-unsplash.jpg"

    },
    {
        id: 3,
        name: "Chicken Burger",
        description: "Grilled chicken breast with mayo and fresh veggies",
       extra:259, price: 159,
         image: "food-burger-flame-835852.jpeg"

    },
    {
        id: 4,
        name: "Veg Delight",
        description: "Veggie patty with avocado, lettuce, and special herb sauce",
        price: 139,
        extra:239,
         image: "images/karl-janisse-G8QZP_RddAY-unsplash.jpg"

    },
    {
        id: 5,
        name: "BBQ Burger",
        description: "Smoky BBQ sauce with caramelized onions and beef patty",
        price: 129,
        extra:229,
        image: "kirsty-tg-IVCZE9U6OQw-unsplash.jpg"

    },
    {
        id: 6,
        name: "Spicy Chicken ",
        description: "Hot and spicy chicken with jalapeños and pepper jack cheese",
        extra:269, price: 169,
         image: "alex-bayev-BUPlkEeDmMk-unsplash.jpg"

    },
    {
        id: 7,
        name: "Mushroom Swiss",
        description: "Sautéed mushrooms with Swiss cheese and garlic aioli",
        extra:299, price: 199,
        image: "zayed-ahmed-zadu-cujwrR1zfDI-unsplash.jpg"
    },
    {
        id: 8,
        name: "Fish Burger",
        description: "Crispy fish fillet with tartar sauce and fresh coleslaw",
        extra:279, price: 179,
        image: "jacky-watt-H1Ji_RjTKd4-unsplash.jpg"
    },
    {
        id: 9,
        name: "Paneer Tikka",
        description: "Grilled paneer tikka with mint chutney and onions",
        extra:239, price: 139,
        image: "rupa-venketa-vardhan-85gaOsWNsHo-unsplash.jpg"
    },
    {
        id: 10,
        name: "Noodles",
        description: "Spicy, grilled garlic flavoured noodles ",
        extra:269, price: 169,
        image: "zoshua-colah-pw7W5rdhIT8-unsplash.jpg"
    },
    {
        id: 11,
        name: "Diet Coke",
        description: "Refreshing without suger Coke",
        extra:189, price: 89,
        image: "andrey-ilkevich-Qvnohn4GyJA-unsplash.jpg"
    },
    {
        id: 12,
        name: "French Fries",
        description: "French Fries is not food it is feeling",
        extra:289, price: 189,
        image: "mustafa-fatemi-IPukhdQ1zq8-unsplash (1).jpg"
    },
];

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
function loadProducts() {
    const container = document.getElementById('productContainer');
    container.innerHTML = '';

    products.forEach(product => {
        const productCard = `
            <div class="col-lg-4 col-md-6">
                <div class="product-card">
                    <div class="product-image">
                     <img src="${product.image}" alt="${product.name}">
                        </div>

                    <div class="product-body">
                        <h3 class="product-title">${product.name}</h3>
                        <p class="product-description">${product.description}</p>
                        <div class="product-footer">
                        <span class="product-extra">₹${product.extra}</span>   
                        <span class="product-price">₹${product.price}</span>    
                          </div>
                          <div class="product-foot-btn">
                            <button class="btn-add-cart" onclick="addToCart(${product.id})">
                                <i class="fas fa-cart-plus"></i> Add
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += productCard;
    });
}

// ===== ADD TO CART =====
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }

    saveCart();
    updateCartUI();
    showNotification('Item added to cart!');
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