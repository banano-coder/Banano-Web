async function test() {
    try {
        console.log('Fetching http://localhost:3000/api/categories...');
        // We need a token if it's protected
        // For now, let's just see if it's 401 or 500
        const res = await fetch('http://localhost:3000/api/categories');
        console.log('Status:', res.status);
        const text = await res.text();
        console.log('Response body:', text);
    } catch (err) {
        console.error('Error:', err.message);
    }
}

test();
