-- StockPro - Base de Données Complète
-- MySQL 5.7+

CREATE DATABASE IF NOT EXISTS stockpro CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE stockpro;

-- ========== UTILISATEURS ==========
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('DG', 'TECH', 'STOCK') DEFAULT 'STOCK',
    is_active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========== CATEGORIES ==========
CREATE TABLE IF NOT EXISTS categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7),
    icon VARCHAR(50),
    created_by VARCHAR(20),
    is_active BOOLEAN DEFAULT 1,
    deleted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========== UNITES ==========
CREATE TABLE IF NOT EXISTS units (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    abbreviation VARCHAR(10),
    created_by VARCHAR(20),
    is_active BOOLEAN DEFAULT 1,
    deleted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========== MATIERES/PRODUITS ==========
CREATE TABLE IF NOT EXISTS materials (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id INT,
    unit_id INT,
    current_stock INT DEFAULT 0,
    min_stock INT DEFAULT 10,
    max_stock INT DEFAULT 100,
    safety_stock INT DEFAULT 20,
    unit_price DECIMAL(10, 2) DEFAULT 0,
    supplier VARCHAR(100),
    color VARCHAR(7),
    icon VARCHAR(50),
    created_by VARCHAR(20),
    is_active BOOLEAN DEFAULT 1,
    deleted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_name (name),
    INDEX idx_category (category_id),
    INDEX idx_stock (current_stock)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========== TRANSACTIONS (MOUVEMENTS STOCK) ==========
CREATE TABLE IF NOT EXISTS transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    material_id INT NOT NULL,
    material_code VARCHAR(50),
    type ENUM('entry', 'exit', 'adjustment') DEFAULT 'entry',
    quantity INT NOT NULL,
    reference_no VARCHAR(100),
    notes TEXT,
    created_by VARCHAR(20),
    deleted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_material (material_id),
    INDEX idx_material_code (material_code),
    INDEX idx_type (type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========== ALERTES ==========
CREATE TABLE IF NOT EXISTS alerts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    material_id INT NOT NULL,
    material_code VARCHAR(50),
    alert_type ENUM('low_stock', 'out_of_stock', 'overstock') DEFAULT 'low_stock',
    severity ENUM('critical', 'warning', 'info') DEFAULT 'info',
    message TEXT,
    is_read BOOLEAN DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    deleted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_material (material_id),
    INDEX idx_material_code (material_code),
    INDEX idx_severity (severity),
    INDEX idx_is_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========== LOGS SECURITE ==========
CREATE TABLE IF NOT EXISTS security_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(20),
    action VARCHAR(100),
    resource VARCHAR(255),
    ip_address VARCHAR(45),
    result ENUM('success', 'failure') DEFAULT 'success',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user (user_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========== UTILISATEURS REELS UNIQUEMENT ==========

-- Utilisateurs (3 utilisateurs réels)
INSERT INTO users (user_id, name, password, role) VALUES
('DIR001', 'Directeur Général', 'DG1234', 'DG'),
('TECH01', 'Responsable Technique', 'TECH1234', 'TECH'),
('STOCK01', 'Responsable de Stock', 'STOCK1234', 'STOCK');

-- SYSTÈME VIERGE - Base de données prête pour l'entrée des données réelles
