import Header from './Header';
import Hero from './Hero';
import FeaturedProducts from './FeaturedProducts';
import Categories from './Categories';
import Offers from './Offers';
import Footer from './Footer';

const HomePage = () => {
  return (
    <div className="bg-white font-sans">
      <Header />
      <main>
        <Hero />
        <div className="bg-wood-light">
          <FeaturedProducts />
        </div>
        <Categories />
        <div className="bg-wood-light">
          <Offers />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
