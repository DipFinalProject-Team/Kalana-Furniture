
import { Link } from 'react-router-dom';

const Offers = () => {
  return (
    <section className="bg-wood-accent text-white p-12">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="font-serif text-4xl font-bold mb-4">End of Season Sale!</h2>
        <p className="text-lg mb-6">Get up to 40% off on selected items. Don't miss out on the best deals.</p>
        <Link to="/offers">
          <button className="bg-white text-wood-brown font-bold py-3 px-6 rounded-md hover:bg-wood-light transition duration-300">
            Shop Now
          </button>
        </Link>
      </div>
    </section>
  );
};

export default Offers;
