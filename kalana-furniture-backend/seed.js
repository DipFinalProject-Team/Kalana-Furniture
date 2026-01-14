const supabase = require('./config/supabaseClient');

// Seed sample reviews
async function seedReviews() {
  try {
    // First, get some existing users and products
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id')
      .limit(3);

    const { data: products, error: productError } = await supabase
      .from('products')
      .select('id')
      .limit(3);

    if (userError || productError || !users.length || !products.length) {
      console.log('No users or products found. Please add some first.');
      return;
    }

    const sampleReviews = [
      {
        product_id: products[0].id,
        user_id: users[0].id,
        comment: 'Great quality furniture! Very comfortable and stylish.',
        rating: 5
      },
      {
        product_id: products[0].id,
        user_id: users[1].id,
        comment: 'Excellent craftsmanship. Worth every penny.',
        rating: 4
      },
      {
        product_id: products[1].id,
        user_id: users[0].id,
        comment: 'Beautiful design, but a bit pricey.',
        rating: 4
      },
      {
        product_id: products[1].id,
        user_id: users[2].id,
        comment: 'Love the color and finish. Highly recommend!',
        rating: 5
      },
      {
        product_id: products[2].id,
        user_id: users[1].id,
        comment: 'Good value for money. Sturdy build.',
        rating: 4
      },
      {
        product_id: products[2].id,
        user_id: users[2].id,
        comment: 'Perfect for my living room. Very satisfied.',
        rating: 5
      }
    ];

    const { data, error } = await supabase
      .from('reviews')
      .insert(sampleReviews);

    if (error) {
      console.error('Error seeding reviews:', error);
    } else {
      console.log('Sample reviews added successfully');
    }
  } catch (error) {
    console.error('Seeding error:', error);
  }
}

seedReviews();