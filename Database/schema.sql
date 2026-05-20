-- This is the SQL schema for "Libro". Libro will be a multi tannet saas for managing books for single and centralized institutions, college and universities. Our main focus is now creating this library management system for our "Mymensingh Polytechnic Institute". This will a MVP and after finising this MVP, we will expand to other institutional models. -- 

-- First, Creating and initializing the database.

CREATE DATABASE libro;
USE libro;

-- Creating "institution" table for initial institution creation cause this is a multi tannet saas.

CREATE TABLE institution(
  institution_id VARCHAR(36) PRIMARY KEY,
  institution_name VARCHAR(255) NOT NULL,
  institution_short_form VARCHAR(10) NOT NULL,
  institution_slug VARCHAR(200) NOT NULL UNIQUE,
  institution_logo_url VARCHAR(1024),
  institution_email VARCHAR(255) UNIQUE NOT NULL,
  institution_founding_year SMALLINT UNSIGNED NOT NULL,
  institution_eiin_number VARCHAR(20) UNIQUE NOT NULL,
  institution_location VARCHAR(250) NOT NULL,
  institution_type ENUM('university', 'polytechnic') NOT NULL,
  student_approval_system ENUM('manual', 'automatic') NOT NULL,
  membership_fee_type ENUM('none', 'per_month', 'per_semester', 'per_year') NOT NULL DEFAULT 'none',
  membership_fee_amount DECIMAL(7,2) NOT NULL DEFAULT 0.00,
  student_book_borrow_limit TINYINT UNSIGNED NOT NULL,
  student_fine_limit_amount DECIMAL(7,2) NOT NULL,
  reservation_expiry_in_minutes SMALLINT UNSIGNED NOT NULL,
  library_opening_time TIME NOT NULL,
  library_closing_time TIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Constraints
  
  CONSTRAINT chk_founding_year CHECK (institution_founding_year >= 1000),
  CONSTRAINT chk_membership_fee_positive CHECK (membership_fee_amount >= 0.00),
  CONSTRAINT chk_fine_limit_positive CHECK (student_fine_limit_amount >= 0.00),
  
  -- Indexes
  INDEX idx_institute_name (institution_name)
);

-- "user" and "institute_member" tables creation. "institution_member" is junction table for "institution" and "user" table's many to many relationship.

CREATE TABLE user(
  user_id VARCHAR(36) PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  user_email VARCHAR(255) UNIQUE NOT NULL,
  user_phone VARCHAR(20) UNIQUE NOT NULL, 
  user_password_hashed VARCHAR(255) NOT NULL,
  gender ENUM('male', 'female', 'others') NOT NULL, 
  avatar_url VARCHAR(1024),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME DEFAULT NULL
);

CREATE TABLE institution_member(
  institution_member_id VARCHAR(36) PRIMARY KEY,
  institution_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME DEFAULT NULL,

  FOREIGN KEY (institution_id) REFERENCES institution(institution_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE,

  CONSTRAINT uq_institution_user UNIQUE (institution_id, user_id)
);

-- created "departments" table for institute departments

CREATE TABLE departments(
  department_id VARCHAR(36) PRIMARY KEY,
  institution_id VARCHAR(36) NOT NULL,
  department_name VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (institution_id) REFERENCES institution(institution_id) ON DELETE CASCADE,

  CONSTRAINT uq_institution_department UNIQUE (institution_id, department_name)
);

-- created "shifts" table for institute shift

CREATE TABLE shifts(
  shift_id VARCHAR(36) PRIMARY KEY,
  institution_id VARCHAR(36) NOT NULL,
  shift_name VARCHAR(100) NOT NULL,
  shift_start_time TIME NOT NULL,
  shift_end_time TIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (institution_id) REFERENCES institution(institution_id) ON DELETE CASCADE,

  CONSTRAINT uq_institution_shift UNIQUE (institution_id, shift_name)
);

-- created "document_sample" table for showing the registration document to the students

CREATE TABLE document_sample(
  document_id VARCHAR(36) PRIMARY KEY,
  institution_id VARCHAR(36) NOT NULL,
  document_url VARCHAR(1024) NOT NULL,
  document_type ENUM('pdf', 'image') NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (institution_id) REFERENCES institution(institution_id) ON DELETE CASCADE
);

-- created "automatic_registration_keyword" table for defining keywords for automaic student registrations

CREATE TABLE automatic_registration_keyword(
  keyword_id VARCHAR(36) PRIMARY KEY,
  institution_id VARCHAR(36) NOT NULL,
  keyword_value VARCHAR(100) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (institution_id) REFERENCES institution(institution_id) ON DELETE CASCADE,

  UNIQUE KEY uq_institution_keyword (institution_id, keyword_value)
);

-- created "sudent_profile" table for storing student spasific data

CREATE TABLE student_profile(
  student_id VARCHAR(36) PRIMARY KEY,
  institution_member_id VARCHAR(36) NOT NULL,
  department_id VARCHAR(36) NOT NULL,
  shift_id VARCHAR(36) NOT NULL,
  student_roll_no VARCHAR(50) NOT NULL,
  student_registration_no VARCHAR(50) NOT NULL,
  account_status ENUM('active', 'flagged', 'banned') NOT NULL DEFAULT 'active',
  reputation_score DECIMAL(4,2) NOT NULL DEFAULT 5.00,
  has_library_clarence BOOLEAN NOT NULL DEFAULT TRUE,
  total_fine_amount DECIMAL(7,2) NOT NULL DEFAULT 0.00,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME DEFAULT NULL,

  FOREIGN KEY (institution_member_id) REFERENCES institution_member(institution_member_id) ON DELETE CASCADE,
  FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE CASCADE,
  FOREIGN KEY (shift_id) REFERENCES shifts(shift_id) ON DELETE CASCADE,

  CONSTRAINT chk_reputation_bounds CHECK (reputation_score BETWEEN 0.00 AND 10.00),
  CONSTRAINT chk_total_fine_positive CHECK (total_fine_amount >= 0.00),

  UNIQUE KEY uq_dept_shift_roll (department_id, shift_id, student_roll_no)
);

-- created "stuff_profile" table for storing stuff spasific data

CREATE TABLE staff_profile(
  staff_id VARCHAR(36) PRIMARY KEY,
  institution_member_id VARCHAR(36) NOT NULL,
  staff_employee_id VARCHAR(20),
  about_staff VARCHAR(250),
  chamber_location VARCHAR(100) NOT NULL,
  joining_date DATE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME DEFAULT NULL,

  FOREIGN KEY (institution_member_id) REFERENCES institution_member(institution_member_id) ON DELETE CASCADE,

  UNIQUE KEY uq_institution_member_staff (institution_member_id)
);

-- created "roll" & "permission" features to tackle user permission and roles

CREATE TABLE saas_role(
  role_id VARCHAR(36) PRIMARY KEY,
  role_value VARCHAR(20) UNIQUE NOT NULL
);

CREATE TABLE saas_permission(
  permission_id VARCHAR(36) PRIMARY KEY,
  permission_key VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE institution_member_role(
  institution_member_role_id VARCHAR(36) PRIMARY KEY,
  institution_member_id VARCHAR(36) NOT NULL,
  role_id VARCHAR(36) NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (institution_member_id) REFERENCES institution_member(institution_member_id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES saas_role(role_id) ON DELETE CASCADE,

  UNIQUE KEY uq_primary_secondary_role (institution_member_id, role_id)
);

CREATE TABLE role_permission(
  institution_member_role_id VARCHAR(36) NOT NULL,
  permission_id VARCHAR(36) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY(institution_member_role_id, permission_id),
  FOREIGN KEY (institution_member_role_id) REFERENCES institution_member_role(institution_member_role_id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES saas_permission(permission_id) ON DELETE CASCADE
);

-- created "feedback" table for making a system for giving Libro feedback

CREATE TABLE saas_feedback(
  feedback_id VARCHAR(36) PRIMARY KEY,
  institution_id VARCHAR(36) NOT NULL,
  institution_member_id VARCHAR(36) NOT NULL,
  feedback_title VARCHAR(255) NOT NULL,
  feedback_description VARCHAR(1024) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (institution_id) REFERENCES institution(institution_id) ON DELETE CASCADE,
  FOREIGN KEY (institution_member_id) REFERENCES institution_member(institution_member_id) ON DELETE CASCADE
);

-- created "book" & "book_copies" table for storing the books and book copies

CREATE TABLE book(
  book_id VARCHAR(36) PRIMARY KEY,
  institution_id VARCHAR(36) NOT NULL,
  created_by_id VARCHAR(36) NOT NULL,
  book_name VARCHAR(500) NOT NULL,
  book_cover_url VARCHAR(1024) NOT NULL,
  book_description VARCHAR(1024),
  book_published_year SMALLINT UNSIGNED NOT NULL,
  book_isbn_number VARCHAR(20),
  book_ranking_score DECIMAL(5,2) NOT NULL DEFAULT 50.00,
  book_access_type ENUM('public', 'restricted', 'not_allowed') NOT NULL DEFAULT 'public',
  max_borrow_time_in_days TINYINT UNSIGNED NOT NULL,
  overdue_fine_amount_per_day DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (institution_id) REFERENCES institution(institution_id) ON DELETE CASCADE,
  FOREIGN KEY (created_by_id) REFERENCES institution_member(institution_member_id) ON DELETE CASCADE,

  INDEX idx_book_name (book_name),

  CONSTRAINT chk_book_ranking_score_max CHECK (book_ranking_score <= 100.00),
  CONSTRAINT chk_overdue_fine_amount_per_day CHECK (overdue_fine_amount_per_day >= 0.00)
);

CREATE TABLE book_copies(
  book_copy_id VARCHAR(36) PRIMARY KEY,
  institution_id VARCHAR(36) NOT NULL,
  book_id VARCHAR(36) NOT NULL,
  created_by_id VARCHAR(36) NOT NULL,
  book_copy_status ENUM('available', 'reserved', 'borrowed', 'damaged', 'lost') NOT NULL DEFAULT 'available',
  qr_code_slug VARCHAR(500) NOT NULL,
  shelf_location VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (institution_id) REFERENCES institution(institution_id),
  FOREIGN KEY (book_id) REFERENCES book(book_id) ON DELETE CASCADE,
  FOREIGN KEY (created_by_id) REFERENCES institution_member(institution_member_id) ON DELETE CASCADE,

  UNIQUE KEY uq_institution_qr_slug(institution_id, qr_code_slug);
);

CREATE TABLE favorite_book(
  favorite_book_id VARCHAR(36) PRIMARY KEY,
  institution_id VARCHAR(36) NOT NULL,
  book_id VARCHAR(36) NOT NULL,
  favorited_by VARCHAR(36) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (institution_id) REFERENCES institution(institution_id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES book(book_id) ON DELETE CASCADE,
  FOREIGN KEY (favorited_by) REFERENCES institution_member(institution_member_id) ON DELETE CASCADE,

  UNIQUE KEY uq_member_favorite_book(book_id, favorited_by)
);

-- created "author" & "book_author" tables for maintaining relation between book and author

CREATE TABLE author(
  author_id VARCHAR(36) PRIMARY KEY,
  institution_id VARCHAR(36) NOT NULL,
  created_by_id VARCHAR(36) NOT NULL,
  author_name VARCHAR(100) NOT NULL,
  author_image_url VARCHAR(1024),
  author_gender ENUM('male', 'female', 'others') NOT NULL,
  author_follower_count INT UNSIGNED NOT NULL DEFAULT 0,
  author_country_name VARCHAR(100),
  author_dob DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (institution_id) REFERENCES institution(institution_id) ON DELETE CASCADE,
  FOREIGN KEY (created_by_id) REFERENCES institution_member(institution_member_id) ON DELETE CASCADE,

  INDEX idx_author_name (institution_id, author_name)
);

CREATE TABLE book_author(
  book_id VARCHAR(36) NOT NULL,
  author_id VARCHAR(36) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY(book_id, author_id),
  FOREIGN KEY (book_id) REFERENCES book(book_id) ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES author(author_id) ON DELETE CASCADE
);

CREATE TABLE student_author_follow(
  student_author_follow_id VARCHAR(36) PRIMARY KEY,
  institution_id VARCHAR(36) NOT NULL,
  followed_by_id VARCHAR(36) NOT NULL,
  author_id VARCHAR(36) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (institution_id) REFERENCES institution(institution_id) ON DELETE CASCADE,
  FOREIGN KEY (followed_by_id) REFERENCES institution_member(institution_member_id) ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES author(author_id) ON DELETE CASCADE,

  UNIQUE KEY uq_follower_author (followed_by_id, author_id),

  INDEX idx_institution_author_follow (institution_id, author_id)
);

-- created "category" & "book_category" table to hardening the relation between category and book table

CREATE TABLE category(
  category_id VARCHAR(36) PRIMARY KEY,
  institution_id VARCHAR(36) NOT NULL,
  created_by_id VARCHAR(36) NOT NULL,
  category_name VARCHAR(100) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (institution_id) REFERENCES institution(institution_id) ON DELETE CASCADE,
  FOREIGN KEY (created_by_id) REFERENCES institution_member(institution_member_id) ON DELETE CASCADE,

  UNIQUE KEY uq_institution_category (institution_id, category_name)
);

CREATE TABLE book_category(
  book_id VARCHAR(36) NOT NULL,
  category_id VARCHAR(36) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY(book_id, category_id),
  FOREIGN KEY (book_id) REFERENCES book(book_id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES category(category_id) ON DELETE CASCADE
);

