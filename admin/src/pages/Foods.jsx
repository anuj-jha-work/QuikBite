import { useEffect, useState } from 'react';
import api from '../api/client';
import FoodForm from '../components/FoodForm';
import { formatCurrency } from '../utils/currency';
import { resolveImageUrl } from '../utils/image';

const Foods = () => {
  const [foods, setFoods] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const loadFoods = async () => {
    const response = await api.get('/api/food/list');
    setFoods(response.data.foods || []);
  };

  useEffect(() => {
    loadFoods().catch((error) => {
      console.error(error);
    });
  }, []);

  const handleSubmit = async (form) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('category', form.category);
      formData.append('price', form.price);

      if (form.imageFile) {
        formData.append('image', form.imageFile);
      } else if (selectedFood?.image) {
        formData.append('image', selectedFood.image);
      }

      if (selectedFood) {
        await api.put(`/api/food/update/${selectedFood._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/api/food/add', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      setSelectedFood(null);
      await loadFoods();
    } catch (error) {
      alert(error.response?.data?.message || error.message || 'Unable to save food');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Delete this food item?');
    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/api/food/remove/${id}`);
      await loadFoods();
    } catch (error) {
      alert(error.response?.data?.message || error.message || 'Unable to delete food');
    }
  };

  return (
    <div className="admin-stack">
      <section className="admin-panel">
        <div className="admin-panel__header">
          <h2>{selectedFood ? 'Edit Food' : 'Add Food'}</h2>
          {selectedFood ? <button className="btn admin-btn-ghost" type="button" onClick={() => setSelectedFood(null)}>Clear</button> : null}
        </div>
        <FoodForm selectedFood={selectedFood} onSubmit={handleSubmit} onCancel={() => setSelectedFood(null)} submitting={submitting} />
      </section>

      <section className="admin-panel">
        <div className="admin-panel__header">
          <h2>All Foods</h2>
          <span>{foods.length} items</span>
        </div>
        <div className="admin-table">
          <div className="admin-table__row admin-table__head">
            <span>Image</span>
            <span>Name</span>
            <span>Category</span>
            <span>Price</span>
            <span>Actions</span>
          </div>
          {foods.map((food) => (
            <div className="admin-table__row admin-table__row--food" key={food._id}>
              <img 
                src={resolveImageUrl(food.image)} 
                alt={food.name} 
                className="admin-food-thumb" 
                onError={(event) => {
                  event.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80';
                }}
              />
              <span>{food.name}</span>
              <span>{food.category}</span>
              <span>{formatCurrency(food.price)}</span>
              <div className="admin-inline-actions">
                <button type="button" className="btn admin-btn-ghost" onClick={() => setSelectedFood(food)}>
                  Edit
                </button>
                <button type="button" className="btn admin-btn-danger" onClick={() => handleDelete(food._id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Foods;
