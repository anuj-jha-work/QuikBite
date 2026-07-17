import { useContext, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { StoreContext } from '../context/StoreContext';
import FoodCard from '../components/FoodCard';

const categories = ['All', 'Pizza', 'Burger', 'Sandwich', 'Pasta', 'Rolls', 'Cake', 'Drinks', 'Salad', 'Dessert', 'Indian'];

const Menu = () => {
  const { foods } = useContext(StoreContext);
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [sort, setSort] = useState('featured');

  const filteredFoods = foods
    .filter((food) => {
      const matchesSearch = food.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === 'All' || food.category === category;
      return matchesSearch && matchesCategory;
    })
    .sort((left, right) => {
      if (sort === 'price-low') return left.price - right.price;
      if (sort === 'price-high') return right.price - left.price;
      return 0;
    });

  return (
    <section className="section">
      <div className="container">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Menu</span>
            <h1>Search, filter, and sort everything in one view.</h1>
          </div>
        </div>

        <div className="toolbar">
          <input
            className="input search-input"
            placeholder="Search food by name"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select className="input select-input" value={category} onChange={(event) => setCategory(event.target.value)}>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select className="input select-input" value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="featured">Featured</option>
            <option value="price-low">Price low-high</option>
            <option value="price-high">Price high-low</option>
          </select>
        </div>

        <div className="food-grid">
          {filteredFoods.map((food) => (
            <FoodCard key={food._id} food={food} />
          ))}
        </div>

        {filteredFoods.length === 0 ? <div className="empty-state">No food matches your search filters.</div> : null}
      </div>
    </section>
  );
};

export default Menu;
