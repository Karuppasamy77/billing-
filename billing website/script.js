// Data Storage Keys
const STORAGE_KEYS = {
    MENU_ITEMS: 'menuItems',
    ORDERS: 'orders',
    CART: 'cart'
};

// Default menu items
const DEFAULT_MENU_ITEMS = [
    { id: 1, name: 'Idly', price: 20, image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&h=300&fit=crop', category: 'Breakfast' },
    { id: 2, name: 'Puttu', price: 25, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop', category: 'Breakfast' },
    { id: 3, name: 'Poori', price: 30, image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop', category: 'Breakfast' },
    { id: 4, name: 'Coffee', price: 15, image: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400&h=300&fit=crop', category: 'Beverage' },
    { id: 5, name: 'Dosai', price: 40, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop', category: 'Breakfast' },
    { id: 6, name: 'Vada Pazhampori', price: 35, image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop', category: 'Snacks' }
];

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Initialize default menu items if localStorage is empty
    if (!localStorage.getItem(STORAGE_KEYS.MENU_ITEMS)) {
        localStorage.setItem(STORAGE_KEYS.MENU_ITEMS, JSON.stringify(DEFAULT_MENU_ITEMS));
    }
    
    if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify([]));
    }
    
    if (!localStorage.getItem(STORAGE_KEYS.CART)) {
        localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify([]));
    }
    
    // Load initial data
    loadMenuItems();
    loadCart();
    
    // Set default month for sales report
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    document.getElementById('sales-month').value = `${now.getFullYear()}-${month}`;
    loadSalesReport();
}

// ==================== Section Navigation ====================
function showSection(sectionName, event) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(`${sectionName}-section`).classList.add('active');
    
    // Activate corresponding tab
    if (event && event.target) {
        event.target.classList.add('active');
    } else {
        // Fallback: find button by section name
        document.querySelectorAll('.tab-btn').forEach(btn => {
            if (btn.textContent.trim().toLowerCase().includes(sectionName.toLowerCase()) || 
                (sectionName === 'manage' && btn.textContent.includes('Manage'))) {
                btn.classList.add('active');
            }
        });
    }
    
    // Reload data if needed
    if (sectionName === 'sales') {
        loadSalesReport();
    }
}

// ==================== Menu CRUD Operations ====================
function getMenuItems() {
    const items = localStorage.getItem(STORAGE_KEYS.MENU_ITEMS);
    return items ? JSON.parse(items) : [];
}

function saveMenuItems(items) {
    localStorage.setItem(STORAGE_KEYS.MENU_ITEMS, JSON.stringify(items));
}

function loadMenuItems() {
    const items = getMenuItems();
    
    // Load menu grid
    const menuGrid = document.getElementById('menu-grid');
    menuGrid.innerHTML = '';
    
    if (items.length === 0) {
        menuGrid.innerHTML = '<p>No menu items available. Add items in Manage Menu section.</p>';
        return;
    }
    
    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'menu-item-card';
        card.innerHTML = `
            <img src="${item.image || 'https://via.placeholder.com/250x200?text=' + encodeURIComponent(item.name)}" 
                 alt="${item.name}" 
                 class="menu-item-image"
                 onerror="this.src='https://via.placeholder.com/250x200?text=' + encodeURIComponent('${item.name}')">
            <div class="menu-item-info">
                <div class="menu-item-name">${item.name}</div>
                <div class="menu-item-price">₹${item.price.toFixed(2)}</div>
                <button class="add-to-cart-btn" onclick="addToCart(${item.id})">Add to Cart</button>
            </div>
        `;
        menuGrid.appendChild(card);
    });
    
    // Load menu items list for management
    const menuList = document.getElementById('menu-items-list');
    menuList.innerHTML = '';
    
    items.forEach(item => {
        const listItem = document.createElement('div');
        listItem.className = 'menu-item-list-item';
        listItem.innerHTML = `
            <div class="menu-item-list-item-info">
                <div class="menu-item-list-item-name">${item.name}</div>
                <div class="menu-item-list-item-price">₹${item.price.toFixed(2)}</div>
            </div>
            <div class="menu-item-list-item-actions">
                <button class="edit-btn" onclick="editMenuItem(${item.id})">Edit</button>
                <button class="delete-btn" onclick="deleteMenuItem(${item.id})">Delete</button>
            </div>
        `;
        menuList.appendChild(listItem);
    });
}

function handleMenuFormSubmit(event) {
    event.preventDefault();
    
    const itemId = document.getElementById('item-id').value;
    const name = document.getElementById('item-name').value;
    const price = parseFloat(document.getElementById('item-price').value);
    const image = document.getElementById('item-image').value || `images/${name.toLowerCase().replace(/\s+/g, '-')}.jpg`;
    const category = document.getElementById('item-category').value || 'General';
    
    const items = getMenuItems();
    
    if (itemId) {
        // Edit existing item
        const index = items.findIndex(item => item.id === parseInt(itemId));
        if (index !== -1) {
            items[index] = { ...items[index], name, price, image, category };
        }
    } else {
        // Add new item
        const newId = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
        items.push({ id: newId, name, price, image, category });
    }
    
    saveMenuItems(items);
    loadMenuItems();
    resetForm();
}

function editMenuItem(id) {
    const items = getMenuItems();
    const item = items.find(i => i.id === id);
    
    if (item) {
        document.getElementById('item-id').value = item.id;
        document.getElementById('item-name').value = item.name;
        document.getElementById('item-price').value = item.price;
        document.getElementById('item-image').value = item.image;
        document.getElementById('item-category').value = item.category || '';
        
        document.getElementById('form-title').textContent = 'Edit Menu Item';
        document.getElementById('submit-btn').textContent = 'Update Item';
        document.getElementById('cancel-btn').style.display = 'inline-block';
        
        // Scroll to form
        document.getElementById('item-name').scrollIntoView({ behavior: 'smooth' });
    }
}

function deleteMenuItem(id) {
    if (confirm('Are you sure you want to delete this menu item?')) {
        const items = getMenuItems();
        const filteredItems = items.filter(item => item.id !== id);
        saveMenuItems(filteredItems);
        loadMenuItems();
    }
}

function resetForm() {
    document.getElementById('menu-form').reset();
    document.getElementById('item-id').value = '';
    document.getElementById('form-title').textContent = 'Add New Menu Item';
    document.getElementById('submit-btn').textContent = 'Add Item';
    document.getElementById('cancel-btn').style.display = 'none';
}

// ==================== Cart Operations ====================
function getCart() {
    const cart = localStorage.getItem(STORAGE_KEYS.CART);
    return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
}

function addToCart(itemId) {
    const items = getMenuItems();
    const item = items.find(i => i.id === itemId);
    
    if (!item) return;
    
    const cart = getCart();
    const existingItem = cart.find(c => c.itemId === itemId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            itemId: item.id,
            name: item.name,
            price: item.price,
            quantity: 1
        });
    }
    
    saveCart(cart);
    loadCart();
}

function removeFromCart(itemId) {
    const cart = getCart();
    const filteredCart = cart.filter(item => item.itemId !== itemId);
    saveCart(filteredCart);
    loadCart();
}

function updateQuantity(itemId, change) {
    const cart = getCart();
    const item = cart.find(c => c.itemId === itemId);
    
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(itemId);
        } else {
            saveCart(cart);
            loadCart();
        }
    }
}

function clearCart() {
    if (confirm('Are you sure you want to clear the cart?')) {
        saveCart([]);
        loadCart();
    }
}

function calculateTotal() {
    const cart = getCart();
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function loadCart() {
    const cart = getCart();
    const cartItemsDiv = document.getElementById('cart-items');
    const cartTotalDiv = document.getElementById('cart-total');
    
    if (cart.length === 0) {
        cartItemsDiv.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
    } else {
        cartItemsDiv.innerHTML = '';
        cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">₹${item.price.toFixed(2)} × ${item.quantity}</div>
                </div>
                <div class="cart-item-controls">
                    <button class="quantity-btn" onclick="updateQuantity(${item.itemId}, -1)">-</button>
                    <span class="quantity-display">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${item.itemId}, 1)">+</button>
                    <button class="remove-item-btn" onclick="removeFromCart(${item.itemId})">Remove</button>
                </div>
            `;
            cartItemsDiv.appendChild(cartItem);
        });
    }
    
    const total = calculateTotal();
    cartTotalDiv.innerHTML = `<strong>Total: ₹${total.toFixed(2)}</strong>`;
}

// ==================== Billing Operations ====================
function showQRCode() {
    const cart = getCart();
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    const modal = document.getElementById('qr-modal');
    const qrDiv = document.getElementById('qrcode');
    qrDiv.innerHTML = '';
    
    // Generate static QR code
    const qrData = 'Restaurant Payment QR Code - Scan to Pay';
    QRCode.toCanvas(qrDiv, qrData, {
        width: 200,
        margin: 2
    }, function (error) {
        if (error) {
            qrDiv.innerHTML = '<p>QR Code generation failed</p>';
        }
    });
    
    modal.style.display = 'block';
}

function closeQRModal() {
    document.getElementById('qr-modal').style.display = 'none';
}

function processPayment() {
    const cart = getCart();
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    // Save order
    const orders = getOrders();
    const newOrder = {
        id: Date.now(),
        items: [...cart],
        total: calculateTotal(),
        date: new Date().toLocaleDateString(),
        timestamp: new Date().toISOString()
    };
    
    orders.push(newOrder);
    saveOrders(orders);
    
    // Clear cart
    saveCart([]);
    loadCart();
    
    // Close modal
    closeQRModal();
    
    alert('Payment successful! Order has been saved.');
}

function generateBill() {
    const cart = getCart();
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    const total = calculateTotal();
    const now = new Date();
    const dateStr = now.toLocaleDateString();
    const timeStr = now.toLocaleTimeString();
    
    const billContent = `
        <div class="bill-content">
            <div class="bill-header">
                <h1>Restaurant Bill</h1>
                <div class="bill-date">Date: ${dateStr} ${timeStr}</div>
            </div>
            <div class="bill-items">
                ${cart.map(item => `
                    <div class="bill-item-row">
                        <span>${item.name} (${item.quantity})</span>
                        <span>₹${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                `).join('')}
            </div>
            <div class="bill-total">
                <span>Total:</span>
                <span>₹${total.toFixed(2)}</span>
            </div>
            <div class="bill-footer">
                <p>Thank you for your visit!</p>
                <p>Visit us again soon!</p>
            </div>
        </div>
    `;
    
    return billContent;
}

function printBill() {
    const cart = getCart();
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    const billPrintDiv = document.getElementById('bill-print');
    billPrintDiv.innerHTML = generateBill();
    
    // Trigger print
    window.print();
}

// ==================== Sales Report ====================
function getOrders() {
    const orders = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return orders ? JSON.parse(orders) : [];
}

function saveOrders(orders) {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
}

function loadSalesReport() {
    const monthInput = document.getElementById('sales-month').value;
    if (!monthInput) return;
    
    const [year, month] = monthInput.split('-').map(Number);
    const orders = getOrders();
    
    // Filter orders by month and year
    const filteredOrders = orders.filter(order => {
        const orderDate = new Date(order.timestamp);
        return orderDate.getFullYear() === year && orderDate.getMonth() === (month - 1);
    });
    
    const reportDiv = document.getElementById('sales-report');
    
    if (filteredOrders.length === 0) {
        reportDiv.innerHTML = '<div class="no-sales">No sales data available for this month.</div>';
        return;
    }
    
    // Group orders by date
    const salesByDate = {};
    filteredOrders.forEach(order => {
        const date = order.date;
        if (!salesByDate[date]) {
            salesByDate[date] = {
                date: date,
                orders: 0,
                total: 0
            };
        }
        salesByDate[date].orders += 1;
        salesByDate[date].total += order.total;
    });
    
    // Convert to array and sort by date
    const salesArray = Object.values(salesByDate).sort((a, b) => {
        return new Date(a.date) - new Date(b.date);
    });
    
    // Calculate monthly total
    const monthlyTotal = filteredOrders.reduce((sum, order) => sum + order.total, 0);
    
    // Generate report HTML
    let reportHTML = `
        <table class="sales-table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Number of Orders</th>
                    <th>Total Sales (₹)</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    salesArray.forEach(sale => {
        reportHTML += `
            <tr>
                <td>${sale.date}</td>
                <td>${sale.orders}</td>
                <td>₹${sale.total.toFixed(2)}</td>
            </tr>
        `;
    });
    
    reportHTML += `
            </tbody>
        </table>
        <div class="sales-total">
            Monthly Total: ₹${monthlyTotal.toFixed(2)}
        </div>
    `;
    
    reportDiv.innerHTML = reportHTML;
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('qr-modal');
    if (event.target === modal) {
        closeQRModal();
    }
}
