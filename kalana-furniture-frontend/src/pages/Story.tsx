import Header from '../components/Header';
import Footer from '../components/Footer';

const Story = () => {
  return (
    <>
      <Header />
      <div className="bg-[url('/wood-bg.jpg')] bg-cover bg-fixed min-h-screen pt-20">
        <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="bg-white bg-opacity-95 rounded-lg shadow-xl p-8 md:p-12">
            <div className="text-center mb-12">
              <h1 className="font-serif text-4xl md:text-5xl font-bold text-wood-brown mb-4">
                Our Story
              </h1>
              <div className="w-24 h-1 bg-wood-accent mx-auto mb-6"></div>
              <p className="text-xl text-gray-600 italic">
                Crafting timeless pieces for generations to come
              </p>
            </div>

            <div className="space-y-8 text-gray-700 leading-relaxed">
              <div className="text-center">
                <img
                  src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                  alt="Traditional woodworking workshop"
                  className="w-full h-64 md:h-80 object-cover rounded-lg shadow-lg mb-8"
                />
              </div>

              <section>
                <h2 className="text-3xl font-serif font-bold text-wood-brown mb-4">The Beginning</h2>
                <p className="text-lg mb-4">
                  In 1995, Kalana Fernando began his journey as a humble carpenter in a small workshop in the heart of Sri Lanka's central highlands.
                  What started as a passion for working with wood soon blossomed into a lifelong commitment to preserving traditional craftsmanship
                  while embracing modern design sensibilities.
                </p>
                <p className="text-lg">
                  With just a few hand tools and an unwavering dedication to quality, Kalana spent his early years learning the ancient techniques
                  passed down through generations of Sri Lankan woodworkers. He believed that furniture wasn't just about function—it was about
                  creating pieces that would become cherished heirlooms.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-serif font-bold text-wood-brown mb-4">From Workshop to Legacy</h2>
                <p className="text-lg mb-4">
                  As word spread about Kalana's exceptional craftsmanship, what began as a one-man operation grew into Kalana Furniture.
                  Today, our workshop employs skilled artisans who share the same passion for perfection that Kalana instilled from the beginning.
                </p>
                <p className="text-lg">
                  We source our timber from sustainable forests, ensuring that every piece we create not only beautifies your home but also
                  contributes to the preservation of our natural environment. Our commitment to ethical sourcing and traditional techniques
                  sets us apart in an industry increasingly dominated by mass production.
                </p>
              </section>

              <div className="grid md:grid-cols-2 gap-8 my-12">
                <div className="text-center">
                  <img
                    src="https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                    alt="Skilled craftsmen at work"
                    className="w-full h-48 object-cover rounded-lg shadow-md mb-4"
                  />
                  <h3 className="text-xl font-semibold text-wood-brown mb-2">Master Craftsmen</h3>
                  <p className="text-gray-600">Each piece is handcrafted by experienced artisans with decades of expertise.</p>
                </div>
                <div className="text-center">
                  <img
                    src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                    alt="Sustainable wood sourcing"
                    className="w-full h-48 object-cover rounded-lg shadow-md mb-4"
                  />
                  <h3 className="text-xl font-semibold text-wood-brown mb-2">Sustainable Practices</h3>
                  <p className="text-gray-600">We prioritize eco-friendly sourcing and responsible forest management.</p>
                </div>
              </div>

              <section>
                <h2 className="text-3xl font-serif font-bold text-wood-brown mb-4">Our Philosophy</h2>
                <p className="text-lg mb-4">
                  At Kalana Furniture, we believe that great furniture transcends trends. Our pieces are designed to be timeless,
                  functional, and beautiful—investments that will enhance your living spaces for years to come.
                </p>
                <p className="text-lg">
                  Every item in our collection tells a story—of skilled hands shaping raw materials, of traditional techniques meeting
                  contemporary needs, and of our commitment to creating furniture that becomes part of your family's legacy.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-serif font-bold text-wood-brown mb-4">Looking Forward</h2>
                <p className="text-lg mb-4">
                  As we continue to grow, our core values remain unchanged. We're expanding our showroom and online presence to bring
                  our craftsmanship to more homes, while maintaining the personal touch that has defined us since day one.
                </p>
                <p className="text-lg">
                  Thank you for being part of our story. When you choose Kalana Furniture, you're not just buying furniture—you're
                  investing in craftsmanship, sustainability, and the timeless beauty of wood.
                </p>
              </section>

              <div className="text-center mt-12 pt-8 border-t border-gray-200">
                <h3 className="text-2xl font-serif font-bold text-wood-brown mb-4">Visit Our Showroom</h3>
                <p className="text-lg text-gray-600 mb-6">
                  Experience our collection in person and meet the artisans behind the craftsmanship.
                </p>
                <div className="bg-wood-light p-6 rounded-lg">
                  <p className="font-semibold text-wood-brown mb-2">Kalana Furniture Showroom</p>
                  <p className="text-gray-700">123 Woodcraft Lane, Kandy, Sri Lanka</p>
                  <p className="text-gray-700">Open: Monday - Saturday, 9:00 AM - 6:00 PM</p>
                  <p className="text-gray-700">Phone: +94 81 123 4567</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Story;