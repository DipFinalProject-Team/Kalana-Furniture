import Header from '../components/Header';
import Hero from '../components/Hero';
import FeaturedProducts from '../components/FeaturedProducts';
import Categories from '../components/Categories';
import Offers from '../components/Offers';
import Footer from '../components/Footer';

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
