const fetch = require('node-fetch');

async function test() {
    try {
        const res = await fetch('http://localhost:3000/api/products');
        console.log('Status:', res.status);
        const data = await res.json();
        console.log('Data length:', Array.isArray(data) ? data.length : 'Not an array');
        if (Array.isArray(data)) {
            console.log('First Item:', JSON.stringify(data[0], null, 2));
        } else {
            console.log('Data:', data);
        }
    } catch (err) {
        console.error('Error:', err.message);
    }
}

test();
