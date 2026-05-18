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

CREATE TABLE institute_member(
  institution_member_id VARCHAR(36) PRIMARY KEY,
  institution_id VARCHAR(36),
  user_id VARCHAR(36),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME DEFAULT NULL,

  FOREIGN KEY (institution_id) REFERENCES institution(institution_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE
);

-- created "departments" table for institute departments

CREATE TABLE departments(
  department_id VARCHAR(36) PRIMARY KEY,
  institution_id VARCHAR(36) NOT NULL,
  department_name VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (institution_id) REFERENCES institution(institution_id) ON DELETE CASCADE
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

  FOREIGN KEY (institution_id) REFERENCES institution(institution_id) ON DELETE CASCADE
);
