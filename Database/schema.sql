-- This is the SQL schema for "Libro". Libro will be a multi tannet saas for managing books for single and centralized institutions, college and universities. Our main focus is now creating this library management system for our "Mymensingh Polytechnic Institute". This will a MVP and after finising this MVP, we will expand to other institutional models. -- 

-- First, Creating and initializing the database.

CREATE DATABASE libro;
USE libro;

-- Creating "institution_registration_request" table for holding initial institution creation request

CREATE TABLE institution_registration_request(
  institution_request_id VARCHAR(36) PRIMARY KEY,
  institution_name VARCHAR(255) NOT NULL,
  institution_logo_url VARCHAR(1024),
  institution_email VARCHAR(255) UNIQUE NOT NULL,
  institution_founding_year SMALLINT UNSIGNED NOT NULL,
  institution_eiin_number VARCHAR(20) UNIQUE NOT NULL,
  institution_location VARCHAR(250) NOT NULL,
  institution_type ENUM('university', 'polytechnic') NOT NULL,
  registration_request_status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending';
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME DEFAULT NULL,
  
  -- Constraints
  
  CONSTRAINT chk_registration_founding_year CHECK (institution_founding_year >= 1000),

  
  -- Indexes
  INDEX idx_institute_name (institution_name)
);

-- Creating "institution" table for initial institution creation cause this is a multi tannet saas.

CREATE TABLE institution(
  institution_id VARCHAR(36) PRIMARY KEY,
  institution_name VARCHAR(255) NOT NULL,
  institution_short_form VARCHAR(10) NOT NULL,
  institution_slug VARCHAR(200) NOT NULL UNIQUE,
  institution_logo_url VARCHAR(1024),
  institution_email VARCHAR(255) UNIQUE NOT NULL,
  institution_password_hashed VARCHAR(255) NULL,
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
  deleted_at DATETIME DEFAULT NULL,
  
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

-- created "file_assets" table for storing docuemnts for students and institutions to show

CREATE TABLE file_assets (
  asset_id VARCHAR(36) PRIMARY KEY,
  institution_id VARCHAR(36) NULL, -- NULL = System-wide sample; Filled = Private tenant asset
  file_url VARCHAR(1024) NOT NULL,
  file_type ENUM('pdf', 'image') NOT NULL,
  asset_scope ENUM('system_template', 'tenant_private') NOT NULL DEFAULT 'tenant_private',
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

-- created "student_registration_application" table to store pending regestrations of student

CREATE TABLE student_registration_application (
  application_id VARCHAR(36) PRIMARY KEY,
  institution_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL, 
  requested_department_id VARCHAR(36) NOT NULL,
  requested_shift_id VARCHAR(36) NOT NULL,
  submitted_roll_no VARCHAR(50) NOT NULL,
  submitted_registration_no VARCHAR(50) NOT NULL,
  submitted_session VARCHAR(20) NOT NULL,
  document_proof_url VARCHAR(1024) NOT NULL,
  application_status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  reviewed_by_member_id VARCHAR(36) NULL, 
  rejection_reason VARCHAR(255) NULL, 
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (institution_id) REFERENCES institution(institution_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_by_member_id) REFERENCES institution_member(institution_member_id) ON DELETE SET NULL,
  
  INDEX idx_pending_applications (institution_id, application_status, created_at ASC)
);

-- created "student_registration_proof_document" for students to hold there regestration proof documents

CREATE TABLE student_registration_proof_document (
  asset_id VARCHAR(36) PRIMARY KEY,
  application_id VARCHAR(36) NULL, -- This should be not null is backend part
  student_id VARCHAR(36) NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (asset_id) REFERENCES file_assets(asset_id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES student_profile(student_id) ON DELETE CASCADE,
  FOREIGN KEY (application_id) REFERENCES student_registration_application(application_id) ON DELETE SET NULL
);

-- created "sudent_profile" table for storing student spasific data

CREATE TABLE student_profile(
  student_id VARCHAR(36) PRIMARY KEY,
  institution_member_id VARCHAR(36) NOT NULL,
  department_id VARCHAR(36) NOT NULL,
  shift_id VARCHAR(36) NOT NULL,
  student_roll_no VARCHAR(50) NOT NULL,
  student_registration_no VARCHAR(50) NOT NULL,
  student_session VARCHAR(20) NOT NULL,
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


-- created "reservation_request" & "book_borrow" table to streamline reservation and borrow process

CREATE TABLE reservation_request(
  reservation_id VARCHAR(36) PRIMARY KEY,
  institution_id VARCHAR(36) NOT NULL,
  book_id VARCHAR(36) NOT NULL,
  book_borrowed_by VARCHAR(36) NOT NULL,
  reservation_status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  reservation_rejection_reason VARCHAR(255) NULL,
  borrowed_duration_in_days TINYINT UNSIGNED NOT NULL,
  reservation_req_expiey DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (institution_id) REFERENCES institution(institution_id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES book(book_id) ON DELETE CASCADE,
  FOREIGN KEY (book_borrowed_by) REFERENCES institution_member(institution_member_id)
);

CREATE TABLE book_borrow(
  borrow_id VARCHAR(36) PRIMARY KEY,
  institution_id VARCHAR(36) NOT NULL,
  book_copy_id VARCHAR(36) NOT NULL,
  reservation_id VARCHAR(36) NOT NULL,
  borrowed_by_member_id VARCHAR(36) NOT NULL,
  issued_by_member_id VARCHAR(36) NOT NULL,
  received_by_member_id VARCHAR(36) NULL,
  issued_at DATETIME NOT NULL,
  due_at DATETIME NOT NULL,
  returned_at DATETIME NULL,
  book_status_after_return ENUM('good', 'damaged', 'lost') NULL DEFAULT 'good',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (institution_id) REFERENCES institution(institution_id) ON DELETE CASCADE,
  FOREIGN KEY (book_copy_id) REFERENCES book_copies(book_copy_id) ON DELETE CASCADE,
  FOREIGN KEY (reservation_id) REFERENCES reservation_request(reservation_id) ON DELETE CASCADE,
  FOREIGN KEY (borrowed_by_member_id) REFERENCES institution_member(institution_member_id) ON DELETE CASCADE,
  FOREIGN KEY (issued_by_member_id) REFERENCES institution_member(institution_member_id) ON DELETE CASCADE,
  FOREIGN KEY (received_by_member_id) REFERENCES institution_member(institution_member_id) ON DELETE CASCADE,

  UNIQUE KEY uq_institution_reservation (institution_id, reservation_id)
);


-- created "book_fine" table to store all the fine realated information

CREATE TABLE book_fine(
  fine_id VARCHAR(36) PRIMARY KEY,
  institution_id VARCHAR(36) NOT NULL,
  institution_member_id VARCHAR(36) NOT NULL,
  book_copy_id VARCHAR(36) NOT NULL,
  book_borrow_id VARCHAR(36) NOT NULL,
  fine_reason VARCHAR(255) NOT NULL,
  fine_amount DECIMAL(7,2) NOT NULL,
  fine_status ENUM('paid', 'unpaid') NOT NULL DEFAULT 'unpaid',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (institution_id) REFERENCES institution(institution_id) ON DELETE CASCADE,
  FOREIGN KEY (institution_member_id) REFERENCES institution_member(institution_member_id) ON DELETE CASCADE,
  FOREIGN KEY (book_copy_id) REFERENCES book_copies(book_copy_id) ON DELETE CASCADE,
  FOREIGN KEY (book_borrow_id) REFERENCES book_borrow(borrow_id) ON DELETE CASCADE,
  
  CONSTRAINT chk_fine_amount CHECK (fine_amount > 0.00)
);

-- created "activity_logs" table for storing all the activity happening in Libro

CREATE TABLE activity_logs(
  log_id VARCHAR(36) PRIMARY KEY,
  institution_id VARCHAR(36) NOT NULL,
  actor_member_id VARCHAR(36) NULL,
  target_member_id VARCHAR(36) NULL,
  action_type VARCHAR(100) NOT NULL,
  entity_name VARCHAR(100) NOT NULL,
  entity_id VARCHAR(36) NOT NULL,
  log_description text NOT NULL,
  ip_address VARCHAR(100),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (institution_id) REFERENCES institution(institution_id) ON DELETE CASCADE,
  FOREIGN KEY (actor_member_id) REFERENCES institution_member(institution_member_id) ON DELETE SET NULL,
  FOREIGN KEY (target_member_id) REFERENCES institution_member(institution_member_id) ON DELETE SET NULL,

  INDEX idx_institution_activity_time (institution_id, created_at DESC),
  INDEX idx_entity_action_lookup (entity_name, entity_id, action_type)
);

-- created "financial_transactions" table to store spasifically financial transaction records

CREATE TABLE institution_library_fund(
  transaction_id VARCHAR(36) PRIMARY KEY,
  institution_id VARCHAR(36) NOT NULL,
  transaction_type ENUM('deposit', 'withdrawal') NOT NULL,
  amount DECIMAL(8,2) NOT NULL,
  transaction_category ENUM('fine_payment', 'donation', 'book_procurement', 'equipment', 'other') NOT NULL,
  fine_id VARCHAR(36) NULL,
  withdrawal_by_member_id VARCHAR(36) NULL,
  transaction_edit_permission_status ENUM('approved', 'rejected') NOT NULL DEFAULT 'approved',
  transaction_description VARCHAR(500),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (institution_id) REFERENCES institution(institution_id) ON DELETE CASCADE,
  FOREIGN KEY (fine_id) REFERENCES book_fine(fine_id) ON DELETE SET NULL,
  FOREIGN KEY (withdrawal_by_member_id) REFERENCES institution_member(institution_member_id) ON DELETE SET NULL,

  CONSTRAINT chk_transaction_amount_positive CHECK (amount > 0.00),
  
  INDEX idx_institution_ledger (institution_id, transaction_type, amount)
);