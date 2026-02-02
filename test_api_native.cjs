async function test() {
    try {
        console.log('Fetching http://localhost:3000/api/products...');
        const res = await fetch('http://localhost:3000/api/products');
        console.log('Status:', res.status);
        const data = await res.json();
        console.log('Data length:', Array.isArray(data) ? data.length : 'Not an array');
        if (Array.isArray(data) && data.length > 0) {
            console.log('First Item SKU:', data[0].sku_base);
        }
    } catch (err) {
        console.error('Error:', err.message);
    }
}

test();
