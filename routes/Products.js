const express = require('express');
const { createProduct, fetchAllProduct, fetchProductById, updateProduct } = require('../controller/Product');

const router = express.Router();
//  /products is already added in base path
router.post('/', createProduct)
      .get('/', fetchAllProduct)
      .get('/:id', fetchProductById)
      .patch('/:id', updateProduct)

exports.router = router;