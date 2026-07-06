CREATE TABLE IF NOT EXISTS guest_sessions (
  id VARCHAR(80) PRIMARY KEY,
  created_at DATETIME NOT NULL,
  last_seen_at DATETIME NOT NULL,
  expires_at DATETIME NOT NULL,
  INDEX guest_sessions_expires_at_index (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS pantry_items (
  id CHAR(16) PRIMARY KEY,
  guest_session_id VARCHAR(80) NOT NULL,
  name VARCHAR(120) NOT NULL,
  category VARCHAR(80) NOT NULL DEFAULT 'pantry',
  quantity VARCHAR(80) NOT NULL DEFAULT '',
  unit VARCHAR(40) NOT NULL DEFAULT '',
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  INDEX pantry_items_guest_session_id_index (guest_session_id),
  CONSTRAINT pantry_items_guest_session_id_foreign FOREIGN KEY (guest_session_id) REFERENCES guest_sessions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS saved_recipes (
  id CHAR(16) PRIMARY KEY,
  guest_session_id VARCHAR(80) NOT NULL,
  title VARCHAR(190) NOT NULL,
  description TEXT NULL,
  ingredients_json JSON NOT NULL,
  missing_ingredients_json JSON NOT NULL,
  instructions_json JSON NOT NULL,
  prep_time INT UNSIGNED NOT NULL DEFAULT 0,
  cook_time INT UNSIGNED NOT NULL DEFAULT 0,
  servings INT UNSIGNED NOT NULL DEFAULT 1,
  difficulty VARCHAR(20) NOT NULL DEFAULT 'easy',
  saved_at DATETIME NOT NULL,
  UNIQUE KEY saved_recipes_guest_title_unique (guest_session_id, title),
  CONSTRAINT saved_recipes_guest_session_id_foreign FOREIGN KEY (guest_session_id) REFERENCES guest_sessions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS shopping_items (
  id CHAR(16) PRIMARY KEY,
  guest_session_id VARCHAR(80) NOT NULL,
  name VARCHAR(190) NOT NULL,
  checked TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  UNIQUE KEY shopping_items_guest_name_unique (guest_session_id, name),
  CONSTRAINT shopping_items_guest_session_id_foreign FOREIGN KEY (guest_session_id) REFERENCES guest_sessions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS rate_limits (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  rate_key VARCHAR(190) NOT NULL UNIQUE,
  count INT UNSIGNED NOT NULL DEFAULT 0,
  reset_at INT UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS email_outbox (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  guest_session_id VARCHAR(80) NULL,
  recipient VARCHAR(190) NOT NULL,
  sender VARCHAR(190) NOT NULL,
  subject VARCHAR(190) NOT NULL,
  body TEXT NOT NULL,
  created_at DATETIME NOT NULL,
  CONSTRAINT email_outbox_guest_session_id_foreign FOREIGN KEY (guest_session_id) REFERENCES guest_sessions(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
