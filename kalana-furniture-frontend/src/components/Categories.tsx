import { Link } from 'react-router-dom';
import { categories } from '../data/mockdata.ts';

const Categories = () => {
  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-serif text-3xl font-bold text-wood-brown text-center mb-8">Browse by Category</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {categories.map(category => (
            <Link key={category.name} to={`/category/${encodeURIComponent(category.name)}`} className="block">
              <div className="relative rounded-lg overflow-hidden group cursor-pointer">
                <img src={category.image} alt={category.name} className="w-full h-64 object-cover transform group-hover:scale-110 transition duration-300" />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center group-hover:bg-opacity-30 transition duration-300">
                  <h3 className="font-serif text-2xl font-bold text-white">{category.name}</h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
