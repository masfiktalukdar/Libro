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
  institution_logo_url VARCHAR(1024) NOT NULL,
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

