-- Update image paths for recipes
UPDATE recipes SET image_path = 'https://images.unsplash.com/photo-1595295333158-4742f28fbd85?w=600&h=400&fit=crop'
WHERE title = 'Classic Shakshuka';

UPDATE recipes SET image_path = 'assets/images/successcard-jollof-4659747_1920%20(1).jpg'
WHERE title IN ('Jollof Rice', 'Authentic Jollof Rice');

UPDATE recipes SET image_path = 'assets/images/113.jpg'
WHERE title = 'Miso Ramen';

UPDATE recipes SET image_path = 'assets/images/unserekleinemaus-tapas-1164263_1920.jpg'
WHERE title = 'Spanish Tortilla';

UPDATE recipes SET image_path = 'assets/images/sti300p-barbecue-4465142_1920.jpg'
WHERE title = 'Suya Skewers';

UPDATE recipes SET image_path = 'assets/images/land_of_aahs-matcha-marshmallow-8692659_1920.jpg'
WHERE title IN ('Matcha Tiramisu', 'Tiramisu', 'Tiramitsu');

-- Update image paths for events
UPDATE events SET image_path = 'assets/images/elegancenairobi-african-food-3957740_1920.jpg'
WHERE title = 'West African Street Food Masterclass';

UPDATE events SET image_path = 'assets/images/isakarakus-old-man-2879303_1920.jpg'
WHERE title IN ('Japanese Fermentation Workshop', 'Sushi Making Class');

UPDATE events SET image_path = 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600&h=400&fit=crop'
WHERE title = 'Mediterranean Sunday Brunch';

UPDATE events SET image_path = 'assets/images/congerdesign-knife-block-1897410_1920.jpg'
WHERE title = 'Knife Skills Bootcamp';
