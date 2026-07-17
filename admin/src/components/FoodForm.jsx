import { useEffect, useState } from 'react';
import { resolveImageUrl } from '../utils/image';

const emptyForm = {
  name: '',
  description: '',
  category: 'Pizza',
  price: '',
  imageFile: null,
  existingImage: ''
};

const categories = ['Pizza', 'Burger', 'Sandwich', 'Pasta', 'Rolls', 'Cake', 'Drinks', 'Salad', 'Dessert', 'Indian'];

const FoodForm = ({ selectedFood, onSubmit, submitting, onCancel }) => {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (selectedFood) {
      setForm({
        name: selectedFood.name,
        description: selectedFood.description,
        category: selectedFood.category,
        price: selectedFood.price,
        imageFile: null,
        existingImage: selectedFood.image
      });
      return;
    }

    setForm(emptyForm);
  }, [selectedFood]);

  const handleChange = (event) => {
    const { name, value, files } = event.target;
    if (name === 'imageFile') {
      setForm((current) => ({ ...current, imageFile: files[0] || null }));
      return;
    }

    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(form);
  };

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <div className="admin-form__grid">
        <label>
          <span>Name</span>
          <input className="admin-input" name="name" value={form.name} onChange={handleChange} required />
        </label>
        <label>
          <span>Price</span>
          <input className="admin-input" name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} required />
        </label>
        <label>
          <span>Category</span>
          <select className="admin-input" name="category" value={form.category} onChange={handleChange}>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
        <label className="admin-form__wide">
          <span>Description</span>
          <textarea className="admin-input admin-textarea" name="description" value={form.description} onChange={handleChange} required />
        </label>
        <label className="admin-form__wide">
          <span>Food Image</span>
          <input className="admin-input" name="imageFile" type="file" accept="image/*" onChange={handleChange} />
        </label>
      </div>
      {form.existingImage ? <img className="admin-form__preview" src={form.imageFile ? URL.createObjectURL(form.imageFile) : resolveImageUrl(form.existingImage)} alt="Preview" /> : null}
      <div className="admin-form__actions">
        <button type="submit" className="btn admin-btn-primary" disabled={submitting}>
          {submitting ? 'Saving...' : selectedFood ? 'Update Food' : 'Add Food'}
        </button>
        {selectedFood ? (
          <button type="button" className="btn admin-btn-ghost" onClick={onCancel}>
            Cancel Edit
          </button>
        ) : null}
      </div>
    </form>
  );
};

export default FoodForm;
