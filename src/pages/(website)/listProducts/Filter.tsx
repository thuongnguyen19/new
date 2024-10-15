import React, { useState, useEffect } from 'react';

interface Product {
  id: number;
  name: string;
  price: number;
}

const products: Product[] = [
  { id: 1, name: 'Product 1', price: 500000 },
  { id: 2, name: 'Product 2', price: 2000000 },
  { id: 3, name: 'Product 3', price: 8000000 },
  { id: 4, name: 'Product 4', price: 300000 },
  { id: 5, name: 'Product 5', price: 1500000 },
];

const PriceFilter: React.FC<{
  minPrice: number;
  maxPrice: number;
  onPriceChange: (min: number, max: number) => void;
}> = ({ minPrice, maxPrice, onPriceChange }) => {
  const handleMinChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    if (value < maxPrice) {
      onPriceChange(value, maxPrice);
    }
  };

  const handleMaxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    if (value > minPrice) {
      onPriceChange(minPrice, value);
    }
  };

  return (
    <div className="widget-facet">
      <div className="facet-title">
        <span>Giá</span>
      </div>
      <div className="widget-price filter-price">
        <div className="range-input">
          <input
            className="range-min"
            type="range"
            min="100000"
            max="10000000"
            value={minPrice}
            onChange={handleMinChange}
          />
          <input
            className="range-max"
            type="range"
            min="100000"
            max="10000000"
            value={maxPrice}
            onChange={handleMaxChange}
          />
        </div>
        <div className="box-title-price">
          <span className="title-price">Giá :</span>
          <div className="caption-price">
            <div>
              <span className="min-price">{minPrice.toLocaleString('vi-VN')}</span>
              <span>đ</span>
            </div>
            <span>-</span>
            <div>
              <span className="max-price">{maxPrice.toLocaleString('vi-VN')}</span>
              <span>đ</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductList: React.FC = () => {
  const [minPrice, setMinPrice] = useState(100000);
  const [maxPrice, setMaxPrice] = useState(10000000);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);

  useEffect(() => {
    const filtered = products.filter(
      (product) => product.price >= minPrice && product.price <= maxPrice
    );
    setFilteredProducts(filtered);
  }, [minPrice, maxPrice]);

  return (
    <div>
      <PriceFilter minPrice={minPrice} maxPrice={maxPrice} onPriceChange={(min, max) => {
        setMinPrice(min);
        setMaxPrice(max);
      }} />
      <h3>Sản phẩm:</h3>
      <ul>
        {filteredProducts.map(product => (
          <li key={product.id}>
            {product.name} - {product.price.toLocaleString('vi-VN')} đ
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProductList;
