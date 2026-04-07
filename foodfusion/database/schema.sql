
CREATE DATABASE IF NOT EXISTS foodfusion
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE foodfusion;

CREATE TABLE IF NOT EXISTS users (
  user_id               INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  first_name            VARCHAR(60)       NOT NULL,
  last_name             VARCHAR(60)       NOT NULL,
  email                 VARCHAR(180)      NOT NULL UNIQUE,
  password_hash         VARCHAR(255)      NOT NULL,
  profile_image         VARCHAR(255)      DEFAULT 'default-avatar.png',
  bio                   TEXT,
  role                  ENUM('user','admin') NOT NULL DEFAULT 'user',
  failed_login_attempts TINYINT UNSIGNED  NOT NULL DEFAULT 0,
  locked_until          DATETIME          DEFAULT NULL,
  last_login            DATETIME          DEFAULT NULL,
  created_at            DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  INDEX idx_email (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS activity_logs (
  log_id      INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  user_id     INT UNSIGNED  DEFAULT NULL,
  action      VARCHAR(100)  NOT NULL,
  ip_address  VARCHAR(45)   DEFAULT NULL,
  user_agent  TEXT          DEFAULT NULL,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (log_id),
  INDEX idx_user (user_id),
  CONSTRAINT fk_log_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS recipes (
  recipe_id           INT UNSIGNED   NOT NULL AUTO_INCREMENT,
  user_id             INT UNSIGNED   NOT NULL,
  title               VARCHAR(200)   NOT NULL,
  description         TEXT           NOT NULL,
  ingredients         TEXT           NOT NULL,
  instructions        TEXT           NOT NULL,
  cuisine_type        VARCHAR(80)    NOT NULL,
  difficulty_level    ENUM('easy','medium','hard') NOT NULL DEFAULT 'medium',
  prep_time           SMALLINT UNSIGNED DEFAULT NULL COMMENT 'minutes',
  cook_time           SMALLINT UNSIGNED DEFAULT NULL COMMENT 'minutes',
  servings            TINYINT UNSIGNED  DEFAULT 4,
  image_path          VARCHAR(255)   DEFAULT NULL,
  dietary_preferences JSON           DEFAULT NULL,
  featured            TINYINT(1)     NOT NULL DEFAULT 0,
  status              ENUM('draft','published','archived') NOT NULL DEFAULT 'published',
  created_at          DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (recipe_id),
  INDEX idx_user  (user_id),
  INDEX idx_status (status),
  INDEX idx_cuisine (cuisine_type),
  FULLTEXT ft_search (title, description, ingredients),
  CONSTRAINT fk_recipe_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS recipe_likes (
  like_id    INT UNSIGNED NOT NULL AUTO_INCREMENT,
  recipe_id  INT UNSIGNED NOT NULL,
  user_id    INT UNSIGNED NOT NULL,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (like_id),
  UNIQUE KEY uq_recipe_like (recipe_id, user_id),
  CONSTRAINT fk_rl_recipe FOREIGN KEY (recipe_id) REFERENCES recipes (recipe_id) ON DELETE CASCADE,
  CONSTRAINT fk_rl_user   FOREIGN KEY (user_id)   REFERENCES users   (user_id)   ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS recipe_comments (
  comment_id INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  recipe_id  INT UNSIGNED  NOT NULL,
  user_id    INT UNSIGNED  NOT NULL,
  comment    TEXT          NOT NULL,
  created_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (comment_id),
  INDEX idx_recipe (recipe_id),
  CONSTRAINT fk_rc_recipe FOREIGN KEY (recipe_id) REFERENCES recipes (recipe_id) ON DELETE CASCADE,
  CONSTRAINT fk_rc_user   FOREIGN KEY (user_id)   REFERENCES users   (user_id)   ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS events (
  event_id             INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  title                VARCHAR(200)  NOT NULL,
  description          TEXT          NOT NULL,
  event_date           DATE          NOT NULL,
  event_time           TIME          DEFAULT NULL,
  location             VARCHAR(255)  NOT NULL,
  max_participants     SMALLINT UNSIGNED NOT NULL DEFAULT 30,
  current_participants SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  price                DECIMAL(8,2)  NOT NULL DEFAULT 0.00,
  image_path           VARCHAR(255)  DEFAULT NULL,
  status               ENUM('upcoming','ongoing','completed','cancelled') NOT NULL DEFAULT 'upcoming',
  created_at           DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (event_id),
  INDEX idx_date   (event_date),
  INDEX idx_status (status)
) ENGINE=InnoDB;


CREATE TABLE IF NOT EXISTS resources (
  resource_id   INT UNSIGNED NOT NULL AUTO_INCREMENT,
  title         VARCHAR(200) NOT NULL,
  description   TEXT         DEFAULT NULL,
  category      ENUM('culinary','educational') NOT NULL,
  resource_type ENUM('video','download') NOT NULL DEFAULT 'video',
  file_path     VARCHAR(255) NOT NULL,
  created_by    INT UNSIGNED DEFAULT NULL,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (resource_id),
  INDEX idx_category (category),
  CONSTRAINT fk_resource_user FOREIGN KEY (created_by) REFERENCES users (user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS event_registrations (
  registration_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  event_id        INT UNSIGNED NOT NULL,
  user_id         INT UNSIGNED NOT NULL,
  status          ENUM('registered','cancelled') NOT NULL DEFAULT 'registered',
  registered_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  cancelled_at    DATETIME DEFAULT NULL,
  PRIMARY KEY (registration_id),
  UNIQUE KEY uq_event_user (event_id, user_id),
  CONSTRAINT fk_er_event FOREIGN KEY (event_id) REFERENCES events (event_id) ON DELETE CASCADE,
  CONSTRAINT fk_er_user  FOREIGN KEY (user_id)  REFERENCES users  (user_id)  ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS community_posts (
  post_id        INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id        INT UNSIGNED NOT NULL,
  title          VARCHAR(200) NOT NULL,
  content        TEXT         NOT NULL,
  post_type      ENUM('tip','experience','question','review') NOT NULL DEFAULT 'tip',
  cuisine_type   VARCHAR(80)  DEFAULT NULL,
  image_path     VARCHAR(255) DEFAULT NULL,
  likes_count    INT UNSIGNED NOT NULL DEFAULT 0,
  comments_count INT UNSIGNED NOT NULL DEFAULT 0,
  status         ENUM('active','hidden','deleted') NOT NULL DEFAULT 'active',
  created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (post_id),
  INDEX idx_user   (user_id),
  INDEX idx_status (status),
  INDEX idx_type   (post_type),
  CONSTRAINT fk_cp_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS post_likes (
  like_id    INT UNSIGNED NOT NULL AUTO_INCREMENT,
  post_id    INT UNSIGNED NOT NULL,
  user_id    INT UNSIGNED NOT NULL,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (like_id),
  UNIQUE KEY uq_post_like (post_id, user_id),
  CONSTRAINT fk_pl_post FOREIGN KEY (post_id) REFERENCES community_posts (post_id) ON DELETE CASCADE,
  CONSTRAINT fk_pl_user FOREIGN KEY (user_id) REFERENCES users            (user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS post_comments (
  comment_id        INT UNSIGNED NOT NULL AUTO_INCREMENT,
  post_id           INT UNSIGNED NOT NULL,
  user_id           INT UNSIGNED NOT NULL,
  parent_comment_id INT UNSIGNED DEFAULT NULL,
  comment           TEXT         NOT NULL,
  created_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (comment_id),
  INDEX idx_post (post_id),
  CONSTRAINT fk_pco_post   FOREIGN KEY (post_id)           REFERENCES community_posts (post_id)   ON DELETE CASCADE,
  CONSTRAINT fk_pco_user   FOREIGN KEY (user_id)           REFERENCES users            (user_id)   ON DELETE CASCADE,
  CONSTRAINT fk_pco_parent FOREIGN KEY (parent_comment_id) REFERENCES post_comments    (comment_id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS contact_messages (
  message_id INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  name       VARCHAR(120)  NOT NULL,
  email      VARCHAR(180)  NOT NULL,
  subject    VARCHAR(200)  NOT NULL DEFAULT 'General Inquiry',
  message    TEXT          NOT NULL,
  ip_address VARCHAR(45)   DEFAULT NULL,
  user_agent TEXT          DEFAULT NULL,
  is_read    TINYINT(1)    NOT NULL DEFAULT 0,
  created_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (message_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  subscriber_id   INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  email           VARCHAR(180)  NOT NULL UNIQUE,
  name            VARCHAR(120)  DEFAULT NULL,
  is_active       TINYINT(1)    NOT NULL DEFAULT 1,
  unsubscribed_at DATETIME      DEFAULT NULL,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (subscriber_id),
  INDEX idx_email (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS downloads (
  download_id   INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  user_id       INT UNSIGNED  DEFAULT NULL,
  resource_type VARCHAR(80)   NOT NULL,
  resource_name VARCHAR(200)  NOT NULL,
  file_name     VARCHAR(255)  NOT NULL,
  ip_address    VARCHAR(45)   DEFAULT NULL,
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (download_id),
  CONSTRAINT fk_dl_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

INSERT INTO users (first_name, last_name, email, password_hash, bio, role) VALUES
('Admin', 'Chef', 'admin@foodfusion.com',
 '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
 'FoodFusion platform administrator and head chef.', 'admin'),
('Maria', 'Santos', 'maria@example.com',
 '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
 'Passionate home cook specialising in Mediterranean cuisine.', 'user'),
('James', 'Okafor', 'james@example.com',
 '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
 'Street food enthusiast and West African recipe developer.', 'user'),
('Yuki', 'Tanaka', 'yuki@example.com',
 '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
 'Japanese cuisine educator and fermentation nerd.', 'user');

INSERT INTO recipes (user_id, title, description, ingredients, instructions, cuisine_type, difficulty_level, prep_time, cook_time, servings, image_path, featured, dietary_preferences) VALUES
(2, 'Classic Shakshuka', 'Poached eggs in a rich, spiced tomato and pepper sauce - the ultimate one-pan brunch.',
 '6 eggs|400g canned tomatoes|2 red peppers, sliced|1 onion, diced|3 garlic cloves, minced|1 tsp cumin|1 tsp smoked paprika|1/2 tsp chilli flakes|Salt and pepper|Fresh parsley|Feta cheese (optional)',
 'Heat oil in a wide pan over medium heat.|Saute onion and peppers for 8 minutes until soft.|Add garlic, cumin, paprika and chilli; cook 1 minute.|Pour in tomatoes, season and simmer 10 minutes.|Make 6 wells and crack in the eggs.|Cover and cook 5-7 minutes until whites set.|Garnish with parsley and feta.',
 'Mediterranean', 'easy', 10, 25, 4, 'https://images.unsplash.com/photo-1595295333158-4742f28fbd85?w=600&h=400&fit=crop', 1, '["vegetarian","gluten-free"]'),
(3, 'Jollof Rice', 'The legendary West African one-pot rice dish, smoky and vibrant with tomato, peppers and spices.',
 '400g long-grain rice|400g canned tomatoes|2 red peppers|1 large onion|3 garlic cloves|1 Scotch bonnet (optional)|2 tbsp tomato paste|500ml chicken stock|2 tsp thyme|1 tsp curry powder|Bay leaf|Salt and pepper|Vegetable oil',
 'Blend tomatoes, peppers, onion and Scotch bonnet into a smooth puree.|Fry tomato paste in oil for 3 minutes.|Add the blended puree and cook down 15 minutes until thick.|Stir in stock, thyme, curry powder and bay leaf.|Add washed rice, stir once, cover tightly and cook on low 30 minutes.|Uncover, fluff gently and serve.',
 'West African', 'medium', 20, 50, 6, 'assets/images/successcard-jollof-4659747_1920%20(1).jpg', 1, '["gluten-free","dairy-free"]'),
(4, 'Miso Ramen', 'Deeply savoury miso broth with chewy noodles, soft-boiled egg and crispy shiitake mushrooms.',
 '200g fresh ramen noodles|4 tbsp white miso paste|1L dashi or vegetable stock|200g shiitake mushrooms|2 soft-boiled eggs, halved|Spring onions, sliced|Nori sheets|Sesame oil|Soy sauce|1 tbsp ginger, grated|2 garlic cloves',
 'Saute garlic and ginger in sesame oil 1 minute.|Add stock and bring to gentle simmer.|Whisk in miso paste - do not boil after this point.|Season with soy sauce to taste.|Pan-fry shiitake in a dry pan until crispy.|Cook noodles per packet and divide into bowls.|Ladle broth over, top with mushrooms, egg, spring onion and nori.',
 'Japanese', 'medium', 15, 20, 2, 'assets/images/113.jpg', 1, '["vegetarian"]'),
(2, 'Spanish Tortilla', 'The iconic potato omelette from Spain - golden outside, silky inside, perfect hot or cold.',
 '6 eggs|600g waxy potatoes, thinly sliced|1 large onion, sliced|150ml olive oil|Salt and pepper',
 'Heat oil in a 24cm non-stick pan over medium-low.|Add potatoes and onion with a good pinch of salt.|Cook gently 20-25 minutes, stirring occasionally, until tender -- not crispy.|Beat eggs in a bowl; add the potato mixture.|Return a thin layer of oil to the pan, pour in the egg mixture.|Cook 4 minutes until the base is set.|Slide onto a plate, flip back into the pan and cook 3 more minutes.|Rest 5 minutes before slicing.',
 'Spanish', 'medium', 15, 35, 6, 'assets/images/unserekleinemaus-tapas-1164263_1920.jpg', 0, '["vegetarian","gluten-free","dairy-free"]'),
(3, 'Suya Skewers', 'Nigerian-style spiced beef skewers with a fragrant groundnut coating - perfect off the grill.',
 '600g beef sirloin, cut into cubes|4 tbsp groundnut (peanut) powder|1 tsp ginger powder|1 tsp garlic powder|1 tsp paprika|1/2 tsp cayenne|1/2 tsp onion powder|Salt|Vegetable oil',
 'Mix groundnut powder with all the spices and a pinch of salt.|Toss beef in oil then coat thoroughly with spice mix.|Thread onto skewers and refrigerate 1 hour.|Grill on high heat 2-3 minutes per side until charred at edges.|Rest 2 minutes and serve with sliced onion and tomato.',
 'West African', 'easy', 70, 10, 4, 'assets/images/sti300p-barbecue-4465142_1920.jpg', 0, '["gluten-free","dairy-free"]'),
(4, 'Matcha Tiramisu', 'A Japanese twist on the Italian classic - earthy matcha cream layered with matcha-soaked sponge.',
 '250g mascarpone|3 eggs, separated|80g caster sugar|3 tbsp matcha powder|200ml hot water|200g sponge fingers|2 tbsp icing sugar|Matcha powder to dust',
 'Whisk egg yolks with sugar until pale and thick.|Beat in mascarpone until smooth.|Whisk egg whites to stiff peaks; fold into mascarpone mixture.|Mix matcha with hot water and let cool.|Dip sponge fingers briefly in matcha and layer in a dish.|Spread half the cream, add another sponge layer, then remaining cream.|Refrigerate 4 hours or overnight.|Dust with matcha before serving.',
 'Japanese', 'medium', 30, 0, 8, 'assets/images/land_of_aahs-matcha-marshmallow-8692659_1920.jpg', 1, '["vegetarian"]');

INSERT INTO events (title, description, event_date, event_time, location, max_participants, price, image_path, status) VALUES
('West African Street Food Masterclass',
 'Join Chef James for an immersive hands-on session covering suya, puff-puff, kelewele and more. All ingredients and equipment provided.',
 DATE_ADD(CURDATE(), INTERVAL 14 DAY), '10:00:00',
 'The Fusion Kitchen, 12 Harare St, Avondale', 16, 35.00, 'assets/images/elegancenairobi-african-food-3957740_1920.jpg', 'upcoming'),
('Japanese Fermentation Workshop',
 'Learn to make miso paste, pickled vegetables and amazake from scratch with Yuki. Take your creations home at the end.',
 DATE_ADD(CURDATE(), INTERVAL 21 DAY), '14:00:00',
 'Community Food Lab, 5 Enterprise Rd, Eastlea', 12, 45.00, 'assets/images/isakarakus-old-man-2879303_1920.jpg', 'upcoming'),
('Mediterranean Sunday Brunch',
 'A relaxed communal cooking session - shakshuka, hummus, tabbouleh and fresh pita. Great for beginners.',
 DATE_ADD(CURDATE(), INTERVAL 7 DAY), '09:30:00',
 'The Fusion Kitchen, 12 Harare St, Avondale', 20, 25.00, 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600&h=400&fit=crop', 'upcoming'),
('Knife Skills Bootcamp',
 'Master the fundamentals: julienne, brunoise, chiffonade and more. A must-do session for anyone serious about cooking.',
 DATE_ADD(CURDATE(), INTERVAL 35 DAY), '11:00:00',
 'Culinary Arts Centre, 88 Samora Machel Ave', 10, 55.00, 'assets/images/congerdesign-knife-block-1897410_1920.jpg', 'upcoming');

INSERT INTO community_posts (user_id, title, content, post_type, cuisine_type) VALUES
(2, 'The trick to perfect shakshuka every time',
 'After making shakshuka weekly for two years I finally cracked it: cook the tomato sauce until the oil separates on the surface before adding eggs. That step creates a silkier, more complex base. Also, covering with a glass lid lets you watch the whites cook without lifting and releasing steam.',
 'tip', 'Mediterranean'),
(3, 'My Jollof Rice journey - from disasters to triumph',
 'The first time I made Jollof the bottom was burnt and the top undercooked. The fix? Wrap foil under the lid before sealing so the steam circulates evenly, and turn the heat to its absolute lowest setting after adding the rice. Three years later I now make 6-litre pots for events.',
 'experience', 'West African'),
(4, 'Why your miso soup tastes flat',
 'Most people boil the miso - that kills the beneficial bacteria and blunts the flavour. Add your miso paste off the heat, and only to dashi (not plain water). The depth of flavour difference is remarkable. Use white miso for delicate dishes, red for hearty winter soups.',
 'tip', 'Japanese'),
(2, 'Has anyone tried making tortilla in a carbon steel pan?',
 'I have been using non-stick for years but my non-stick is finally on its last legs. Wondering whether carbon steel gives a better crust or just more headaches. Happy to hear from anyone who has made the switch.',
 'question', 'Spanish'),
(3, 'Review: The Food Lab by J. Kenji Lopez-Alt',
 'Genuinely the most useful cooking book I own. The science-first approach changed how I think about heat, browning and seasoning. Highly recommend the burger and fried chicken chapters even if those are not your usual cuisines - the principles transfer everywhere.',
 'review', NULL);
