-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 16, 2026 at 07:38 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `glucare_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `fullname` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `create_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_completed` tinyint(1) DEFAULT 0,
  `gender` varchar(20) DEFAULT NULL,
  `birth_date` date DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `profile_image` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `fullname`, `email`, `password`, `create_at`, `is_completed`, `gender`, `birth_date`, `phone`, `profile_image`) VALUES
(1, 'Jachira Jleva', 'jachirajleva@gmail.com', '$2b$10$VAXzQk2oqx8reIlsHHYrt.PeQ4V.kKIBb8/U9AiF/wvxwP4H2p/Pq', '2026-05-12 10:01:01', 1, 'Perempuan', '2003-09-14', '0895626401020', '/uploads/1778826158894-JAEMIN (1).jpeg'),
(2, 'Mamas', 'Najaemin0813@gmail.com', '$2b$10$flS5ozdXYUt8ZhV9PdKvYu4kAsd3285AH7v1iL1JGTsEbMgTwMkba', '2026-05-12 14:30:12', 1, 'Laki-laki', '2026-05-06', '0895626401020', '/uploads/1778649000932-download.jpeg'),
(3, 'Na Mita', 'jumitatambunan@gmail.com', '$2b$10$hnK4RFajGqschNW/sOdwIegFpHWGlSpcOwLl9coaXVMcHuRmnyTBe', '2026-05-15 06:27:20', 1, 'Perempuan', '2004-11-16', '0895626401020', '/uploads/1778904122933-me.jpg'),
(4, 'Raja', 'rajasantoso@gmail.com', '$2b$10$LUH6UyiJHQgoHcem46Eyk.ZVOHdYamwvKr4tzKAiT7moJtuCQJZ6C', '2026-05-15 06:36:41', 1, 'Laki Laki', '2001-12-20', '08934892384', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
