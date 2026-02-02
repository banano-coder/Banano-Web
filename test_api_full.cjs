async function test() {
    try {
        const res = await fetch('http://localhost:3000/api/products');
        console.log('Status:', res.status);
        const data = await res.json();
        console.log('Is Array:', Array.isArray(data));
        if (Array.isArray(data)) {
            console.log('Length:', data.length);
            console.log('First Item Full:', JSON.stringify(data[0], null, 2));
        } else {
            console.log('Data:', JSON.stringify(data, null, 2));
        }
    } catch (err) {
        console.error('Error:', err.message);
    }
}

test();
