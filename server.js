const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 3000;

// Mock API Key/Token
const MOCK_API_KEY = 'your_mock_api_key_here';
const API_BASE_URL = 'http://20.244.56.144/test/companies';

// Route to get top products
app.get('/categories/:category/products', async (req, res) => {
    try {
        const { category } = req.params;
        const { n = 10, minPrice = 0, maxPrice = 10000, sort = 'price', order = 'asc', page = 1, companies = 'AMZ' } = req.query;

        // Validate query parameters
        if (!['price', 'rating', 'discount'].includes(sort)) {
            return res.status(400).json({ message: 'Invalid sort parameter. Use "price", "rating", or "discount".' });
        }
        if (!['asc', 'desc'].includes(order)) {
            return res.status(400).json({ message: 'Invalid order parameter. Use "asc" or "desc".' });
        }

        // Split companies parameter into an array
        const companiesArray = companies.split(',');

        let products = [];

        // Fetch products from each company
        for (const company of companiesArray) {
            const response = await axios.get(`${API_BASE_URL}/${company}/categories/${category}/products`, {
                params: {
                    top: n,
                    minPrice,
                    maxPrice
                },
                headers: {
                    'Authorization': `Bearer ${MOCK_API_KEY}` // Mocking token in headers
                }
            });

            products = products.concat(response.data);
        }

        // Sort products
        products.sort((a, b) => {
            let comparison = 0;

            if (sort === 'price') {
                comparison = a.price - b.price;
            } else if (sort === 'rating') {
                comparison = a.rating - b.rating;
            } else if (sort === 'discount') {
                comparison = a.discount - b.discount;
            }

            return order === 'asc' ? comparison : -comparison;
        });

        // Pagination
        const startIndex = (page - 1) * n;
        const endIndex = startIndex + parseInt(n);
        const paginatedProducts = products.slice(startIndex, endIndex);

        // Generate unique IDs
        const result = paginatedProducts.map((product, index) => ({
            id: `product-${index}-${new Date().getTime()}`,
            ...product
        }));

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products', error: error.message });
    }
});

// Route to get specific product details
app.get('/categories/:category/products/:productid', async (req, res) => {
    try {
        const { category, productid } = req.params;
        const response = await axios.get(`${API_BASE_URL}/AMZ/categories/${category}/products`, {
            headers: {
                'Authorization': `Bearer ${MOCK_API_KEY}` // Mocking token in headers
            }
        });
        const products = response.data;

        const product = products.find(p => `product-${products.indexOf(p)}-${new Date().getTime()}` === productid);

        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching product details', error: error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
