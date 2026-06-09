-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 09, 2026 at 06:00 PM
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
-- Database: `plecs`
--

-- --------------------------------------------------------

--
-- Table structure for table `additional_learning_resources`
--

CREATE TABLE `additional_learning_resources` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `topic_id` bigint(20) UNSIGNED NOT NULL,
  `course_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `type` enum('Document','Video','Link','Presentation','Other') NOT NULL DEFAULT 'Document',
  `url` text DEFAULT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  `order_index` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_by` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `coding_exercises`
--

CREATE TABLE `coding_exercises` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `course_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `difficulty_level` enum('Beginner','Intermediate','Advanced') NOT NULL DEFAULT 'Beginner',
  `points` int(10) UNSIGNED NOT NULL DEFAULT 10,
  `instructions` longtext NOT NULL,
  `starter_code` longtext DEFAULT NULL,
  `test_cases` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`test_cases`)),
  `is_published` tinyint(1) NOT NULL DEFAULT 0,
  `published_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `coding_exercise_attempts`
--

CREATE TABLE `coding_exercise_attempts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `coding_exercise_id` bigint(20) UNSIGNED NOT NULL,
  `student_id` bigint(20) UNSIGNED NOT NULL,
  `submission_code` longtext NOT NULL,
  `score` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `max_score` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `passed` tinyint(1) NOT NULL DEFAULT 0,
  `feedback` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`feedback`)),
  `status` varchar(255) NOT NULL DEFAULT 'submitted',
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `enrollments`
--

CREATE TABLE `enrollments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `studentID` bigint(20) UNSIGNED NOT NULL,
  `courseID` bigint(20) UNSIGNED NOT NULL,
  `pathID` bigint(20) UNSIGNED DEFAULT NULL,
  `order` int(11) NOT NULL DEFAULT 0,
  `status` varchar(255) NOT NULL DEFAULT 'active',
  `progress` int(11) NOT NULL DEFAULT 0,
  `enrolled_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `completed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `learning_contents`
--

CREATE TABLE `learning_contents` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `content` longtext DEFAULT NULL,
  `type` varchar(255) NOT NULL DEFAULT 'course',
  `difficulty_level` enum('Beginner','Intermediate','Advanced') DEFAULT NULL,
  `estimated_hours` int(10) UNSIGNED DEFAULT NULL,
  `keywords` text DEFAULT NULL,
  `parent_id` bigint(20) UNSIGNED DEFAULT NULL,
  `resource_type` varchar(255) NOT NULL DEFAULT 'none',
  `resource_url` text DEFAULT NULL,
  `resource_path` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `learning_contents`
--

INSERT INTO `learning_contents` (`id`, `title`, `description`, `content`, `type`, `difficulty_level`, `estimated_hours`, `keywords`, `parent_id`, `resource_type`, `resource_url`, `resource_path`, `created_at`, `updated_at`) VALUES
(1, 'Asas Sains Komputer Tingkatan 1', '<p>Subjek ini mengandungi empat bab iaitu:</p><ol><li>Asas Pemikiran Komputasional</li><li>Perwakilan Data</li><li>Algoritma</li><li>Kod Arahan</li></ol>', NULL, 'course', 'Beginner', 30, 'beginner, basic computational thinking, data representation, algoritjm, instruction code', NULL, 'none', NULL, NULL, '2026-05-31 00:55:46', '2026-05-31 00:55:46'),
(2, 'Asas Sains Komputer Tingkatan 2', '<p>Subjek ini mengandungi tiga bab iaitu:</p><ol><li>Perwakilan Data</li><li>Algoritma</li><li>Kod Arahan</li></ol>', NULL, 'course', 'Beginner', 30, 'form 2, data represantation, algorithm, instruction code', NULL, 'none', NULL, NULL, '2026-06-01 03:57:25', '2026-06-07 02:21:21'),
(3, 'Asas Sains Komputer Tingkatan 3', '<p>Subjek ini mengandungi empat bab iaitu:</p><ol><li>Konsep Asas Pemikiran Komputasional</li><li>Perwakilan Data</li><li>Algoritma</li><li>Kod Arahan</li></ol>', NULL, 'course', 'Intermediate', 40, 'intermediate, basic computational thinking, data, algorithm, code', NULL, 'none', NULL, NULL, '2026-06-07 02:21:09', '2026-06-07 02:21:09');

-- --------------------------------------------------------

--
-- Table structure for table `learning_content_attachments`
--

CREATE TABLE `learning_content_attachments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `learning_content_id` bigint(20) UNSIGNED NOT NULL,
  `topic_id` bigint(20) UNSIGNED DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `type` varchar(20) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `sort_order` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `learning_content_blocks`
--

CREATE TABLE `learning_content_blocks` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `learning_content_id` bigint(20) UNSIGNED NOT NULL,
  `topic_id` bigint(20) UNSIGNED DEFAULT NULL,
  `type` varchar(20) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `content` longtext DEFAULT NULL,
  `url` text DEFAULT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  `sort_order` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `learning_content_blocks`
--

INSERT INTO `learning_content_blocks` (`id`, `learning_content_id`, `topic_id`, `type`, `title`, `content`, `url`, `file_path`, `sort_order`, `created_at`, `updated_at`) VALUES
(35, 1, 1, 'text', NULL, '<h2><strong>1.1 Asas Pemikiran Komputasional</strong></h2><p><br></p><p>Pemikiran komputasional bukanlah berfikir tentang komputer atau “berfikir“ seperti komputer. Sebenarnya, komputer tidak boleh berfikir sendiri.</p><p><br></p><p>Pemikiran komputasional ialah satu proses pemikiran bagi tujuan menyelesaikan masalah oleh manusia sendiri berbantukan mesin atau kedua-duanya sekali dengan menggunakan konsep asas sains komputer.</p><p><br></p><p>Pemikiran komputasional memecahkan sesuatu masalah kepada bahagian-bahagian yang lebih kecil. Proses seterusnya ialah mengesan dan menggunakan pengecaman corak bagi menyelesaikan masalah. Perkara-perkara yang tidak penting ditinggalkan. Akhir sekali ialah proses membentuk satu model penyelesaian masalah berdasarkan ciri-ciri kesamaan seperti dalam Rajah 1.1.</p><p><br></p><p>Kemahiran-kemahiran yang diperlukan untuk melaksanakan pemikiran komputasional ialah kemahiran berfikir secara logik dan kemahiran membina algoritma. Kemahiran lain yang penting dipupuk bersama termasuk kreativiti, belajar daripada kesalahan, berupaya menjelaskan dan dapat bekerja sepasukan.</p>', NULL, NULL, 1, '2026-05-31 22:06:18', '2026-05-31 22:06:18'),
(36, 1, 1, 'image', NULL, NULL, NULL, 'learning-content/blocks/lv3YuwR0SwcPJdYThxyT264kEl4zNLa9FXVlh9VI.png', 2, '2026-05-31 22:06:18', '2026-05-31 22:06:18'),
(37, 1, 1, 'text', NULL, '<h3><strong>1.1.1 Teknik dalam Pemikiran Komputasional</strong></h3><p><br></p><p>Ada empat teknik asas digunakan dalam pemikiran komputasional:</p><ol><li>Teknik Leraian (<em>Decomposition</em>)</li><li>Teknik Pengecaman Corak (<em>Pattern Recognition</em>)</li><li>Teknik Peniskalaan (<em>Abstraction</em>)</li><li>Teknik Pengitlakan (<em>Generalisation</em>)</li></ol>', NULL, NULL, 3, '2026-05-31 22:06:18', '2026-05-31 22:06:18'),
(38, 1, 1, 'text', NULL, '<h3><strong><u>Teknik Leraian (</u><em><u>Decomposition</u></em><u>)</u></strong></h3><p><br></p><p class=\"ql-align-justify\">Teknik leraian melibatkan pemecahan suatu masalah atau sistem yang kompleks kepada bahagian-bahagian kecil bagi memudahkan pemahaman dan penyelesaian. Selepas itu, bahagian-bahagian yang kecil boleh diteliti, diselesaikan atau direka bentuk secara berasingan. Hal ini akan membolehkan sesuatu masalah yang besar dapat diselesaikan dengan mudah.</p><p><br></p><p class=\"ql-align-justify\">Rajah 1.2 menunjukkan masalah binaan anak tangga yang menggunakan batu bata. Berapakah jumlah batu bata yang digunakan untuk membina tangga ini?</p>', NULL, NULL, 4, '2026-05-31 22:06:18', '2026-05-31 22:06:18'),
(39, 1, 1, 'image', NULL, NULL, NULL, 'learning-content/blocks/VMx9oSNljABcO9Ttil1WL2MNil43FybwGyVFiRjT.png', 5, '2026-05-31 22:06:18', '2026-05-31 22:06:18'),
(40, 1, 1, 'text', NULL, '<p>Teknik leraian boleh digunakan untuk menyelesaikan masalah ini dengan memisahkan binaan anak tangga kepada beberapa bahagian yang lebih kecil dan ringkas. Binaan anak tangga dibahagikan kepada lima bahagian mengikut anak tangga. Rajah 1.3 menunjukkan cara teknik leraian digunakan.</p>', NULL, NULL, 6, '2026-05-31 22:06:18', '2026-05-31 22:06:18'),
(41, 1, 1, 'image', NULL, NULL, NULL, 'learning-content/blocks/zJ6KuVAlY3wge8J8vdlnr2hkJXtOYdKVp4h6J1a5.png', 7, '2026-05-31 22:06:18', '2026-05-31 22:06:18'),
(42, 1, 1, 'text', NULL, '<p>Masalah utama telah dipecahkan kepada lima masalah yang lebih kecil dan ringkas. Bilangan batu bata pada setiap bahagian akan dikira bagi mendapatkan jumlah batu bata keseluruhan.</p>', NULL, NULL, 8, '2026-05-31 22:06:18', '2026-05-31 22:06:18'),
(43, 1, 1, 'text', NULL, '<h3><strong><u>Teknik Pengecaman Corak (</u><em><u>Pattern Recognition</u></em><u>)</u></strong></h3><p><br></p><p class=\"ql-align-justify\">Selepas meleraikan masalah, bahagian-bahagian kecil yang telah dipisahkan akan dianalisis untuk mengenal pasti corak-corak tertentu. Corak-corak tersebut terdiri daripada kesamaan atau ciri-ciri yang sama untuk masalah yang lebih kecil. Penelitian pada kesamaan dan corak-corak dalam masalah yang lebih kecil ini dapat membantu menyelesaikan masalah kompleks dengan lebih berkesan.</p><p class=\"ql-align-justify\"><br></p><p class=\"ql-align-justify\">Masalah binaan anak tangga dalam Rajah 1.2 menunjukkan ciri-ciri kesamaan yang dapat membantu dalam menyelesaikan masalah itu ialah kelima-lima bahagian masalah tersebut mempunyai bilangan batu bata yang sama banyak sebagai tapak. Corak yang membezakan ialah bilangan lapisan batu bata.</p><p class=\"ql-align-justify\"><br></p><p class=\"ql-align-justify\">Bilangan batu bata yang ada sebagai tapak dan bilangan lapisan batu bata dikenal pasti bagi menentukan jumlah batu bata yang digunakan bagi setiap bahagian masalah. Rajah 1.4 menunjukkan cara pengecaman corak dilakukan.</p>', NULL, NULL, 9, '2026-05-31 22:06:18', '2026-05-31 22:06:18'),
(44, 1, 1, 'image', NULL, NULL, NULL, 'learning-content/blocks/KV3v7AsIm5BrfWzCjO0q9weBSHLPFJChRHCU3J4E.png', 10, '2026-05-31 22:06:18', '2026-05-31 22:06:18'),
(45, 1, 1, 'text', NULL, '<h3 class=\"ql-align-justify\"><strong><u>Teknik Peniskalaan (</u><em><u>Abstraction</u></em><u>)</u></strong></h3><p class=\"ql-align-justify\"><br></p><p class=\"ql-align-justify\">Teknik peniskalaan meninggalkan aspek-aspek kurang penting yang terdapat dalam corak-corak yang dicamkan dan memfokus kepada aspek-aspek penting yang dapat membantu dalam penyelesaian masalah.</p><p class=\"ql-align-justify\"><br></p><p class=\"ql-align-justify\">Aspek-aspek yang penting bagi menyelesaikan masalah dalam masalah binaan anak tangga termasuk:</p><ul><li class=\"ql-align-justify\">Lebar tangga terdiri daripada lima biji batu bata.</li><li class=\"ql-align-justify\">Bilangan anak tangga ialah lima.</li></ul><p class=\"ql-align-justify\"><br></p><p class=\"ql-align-justify\">Manakala contoh aspek-aspek yang kurang penting dalam masalah binaan anak tangga termasuk:</p><ul><li class=\"ql-align-justify\">Saiz batu bata.</li><li class=\"ql-align-justify\">Bahan yang digunakan untuk membuat batu bata.</li></ul><p class=\"ql-align-justify\"><br></p><h3 class=\"ql-align-justify\"><strong><u>Teknik Pengitlakan (</u><em><u>Generalisation</u></em><u>)</u></strong></h3><p class=\"ql-align-justify\"><br></p><p class=\"ql-align-justify\">Teknik pengitlakan melibatkan pembinaan model bagi masalah yang diselesaikan. Model boleh dalam bentuk <strong>formula</strong>, <strong>teknik</strong>, <strong>peraturan</strong> atau <strong>langkah-langkah</strong> bagi menyelesaikan masalah. Model dibina setelah pengecaman corak dan peniskalaan dilakukan ke atas dua atau lebih masalah yang hampir sama. Model yang dihasilkan boleh digunakan untuk menyelesaikan masalah lain yang serupa. Jadual 1.1 ialah ringkasan yang diperoleh daripada Rajah 1.5.</p>', NULL, NULL, 11, '2026-05-31 22:06:18', '2026-05-31 22:06:18'),
(46, 1, 1, 'image', NULL, NULL, NULL, 'learning-content/blocks/sVcrEOrU3rK5IkLOBe8IKWelPBth7rkfXPasN9Nz.png', 12, '2026-05-31 22:06:18', '2026-05-31 22:06:18'),
(47, 1, 1, 'text', NULL, '<p class=\"ql-align-justify\">Berdasarkan Jadual 1.1, satu model dalam bentuk formula dibina.</p><p class=\"ql-align-justify\"><br></p><p class=\"ql-align-justify\">Jumlah batu bata bagi setiap bahagian = Bilangan batu bata bagi panjang X Bilangan batu bata bagi lebar X Bilangan batu bata bagi tinggi</p><p class=\"ql-align-justify\"><br></p><p class=\"ql-align-justify\">Jadual 1.2 menunjukkan ringkasan yang diperoleh daripada Rajah 1.6. Corak data pada Jadual 1.2 hampir sama dengan corak data pada Jadual 1.1. Oleh itu, model (formula) untuk menyelesaikan masalah binaan anak tangga juga boleh digunakan untuk menyelesaikan masalah Rajah 1.6.</p><p class=\"ql-align-justify\"><br></p><p class=\"ql-align-justify\">Model atau formula yang dihasilkan untuk menyelesaikan masalah binaan anak tangga juga boleh digunakan untuk mengira isi padu kiub atau kuboid.&nbsp;</p>', NULL, NULL, 13, '2026-05-31 22:06:18', '2026-05-31 22:06:18'),
(48, 1, 1, 'image', NULL, NULL, NULL, 'learning-content/blocks/iDdWSp3DkdnYJGnORzWxvajacrPoxMoOlHhihBPA.png', 14, '2026-05-31 22:06:18', '2026-05-31 22:06:18'),
(49, 1, 1, 'youtube', NULL, NULL, 'https://www.youtube.com/watch?v=31TfTTrNeao', NULL, 15, '2026-05-31 22:06:18', '2026-05-31 22:06:18'),
(62, 1, 2, 'text', NULL, '<h1 class=\"ql-align-justify\"><strong>2.1 Sistem Nombor Perduaan</strong></h1><p class=\"ql-align-justify\"><br></p><p class=\"ql-align-justify\">Isyarat elektrik boleh wujud dalam keadaan <em>Off</em> dan <em>On</em>. Data diwakilkan dalam komputer sebagai isyarat elektrik dengan menggunakan digit 0 untuk <em>Off</em> dan digit 1 untuk <em>On</em>. Komputer melihat semua data sebagai satu siri nombor perduaan. Semua data yang diproses oleh komputer perlu ditukarkan kepada format nombor perduaan.</p><p class=\"ql-align-justify\"><br></p><p class=\"ql-align-justify\">Litar dalam suatu pemprosesan komputer dibentuk daripada berjuta-juta transistor. Transistor ialah suis halus yang diaktifkan oleh isyarat elektronik yang diterima. Perwakilan data dalam bentuk digit 0 untuk <em>Off</em> dan 1 untuk <em>On</em> adalah gambaran <em>Off</em> dan <em>On</em> transistor.</p><p class=\"ql-align-justify\"><br></p><p class=\"ql-align-justify\">Suatu program komputer adalah satu set arahan. Pengatur cara menuliskan kod komputer yang terdiri daripada set arahan. Setiap set arahan akan diterjemahkan kepada kod mesin yang menggunakan kod nombor perduaan supaya unit pemprosesan dapat melaksanakannya. Sebagai contoh, perisian, muzik, dokumen dan maklumat yang diproses oleh komputer disimpan dalam bentuk nombor perduaan.</p>', NULL, NULL, 1, '2026-05-31 22:21:58', '2026-05-31 22:21:58'),
(63, 1, 2, 'image', NULL, NULL, NULL, 'learning-content/blocks/F6Knk42WEkKOE2kqCWEpKchOOmDaVjjoaS6o6psI.png', 2, '2026-05-31 22:21:58', '2026-05-31 22:21:58'),
(64, 1, 2, 'text', NULL, '<h1 class=\"ql-align-justify\"><strong>2.1.1 Nombor Perduaan dan Nombor Perpuluhan</strong></h1><p class=\"ql-align-justify\"><br></p><p class=\"ql-align-justify\">Manusia menggunakan sistem perpuluhan dalam kehidupan seharian. Sistem ini menggunakan digit-digit 0, 1, 2, 3, 4, 5, 6, 7, 8 dan 9 untuk mewakili sebarang nombor. Sistem perpuluhan juga dikenali sebagai <strong>Sistem Asas 10</strong> kerana terdapat sepuluh pilihan digit daripada 0 hingga 9.</p><p class=\"ql-align-justify\"><br></p><p class=\"ql-align-justify\">Nilai sesuatu digit dalam sistem perpuluhan bergantung kepada nilai tempatnya dalam nombor yang berkenaan. Nilai sesuatu digit dikira dengan mendarabkannya dengan nilai tempatnya.</p><p class=\"ql-align-justify\"><br></p><p class=\"ql-align-justify\">Jadual 2.1 menunjukkan nilai digit-digit bagi nombor 345.</p>', NULL, NULL, 3, '2026-05-31 22:21:58', '2026-05-31 22:21:58'),
(65, 1, 2, 'image', NULL, NULL, NULL, 'learning-content/blocks/pYJ9xNSuE8Ljy7xqKCNtwwGkoe3ohjSCNoR8o084.png', 4, '2026-05-31 22:21:58', '2026-05-31 22:21:58'),
(66, 1, 2, 'text', NULL, '<p class=\"ql-align-justify\">Komputer menggunakan sistem perduaan untuk menyimpan data. Sistem ini menggunakan dua digit sahaja iaitu 0 dan 1 untuk mewakili data. Sistem perduaan juga dikenali sebagai <strong>Sistem Asas 2</strong> kerana terdapat dua pilihan digit iaitu 0 dan 1.</p><p class=\"ql-align-justify\"><br></p><p class=\"ql-align-justify\">Nilai sesuatu digit dalam sistem perduaan bergantung kepada nilai tempatnya dalam nombor yang berkenaan. Darabkan digit itu dengan nilai tempatnya untuk menentukan nilai sesuatu digit. Jadual 2.2 menunjukkan nilai digit-digit dalam nombor perduaan 1011.</p>', NULL, NULL, 5, '2026-05-31 22:21:58', '2026-05-31 22:21:58'),
(67, 1, 2, 'image', NULL, NULL, NULL, 'learning-content/blocks/hYEwCiwE1JpzW9xNPK2BoW002uJgRYtzgzB8Q8zw.png', 6, '2026-05-31 22:21:58', '2026-05-31 22:21:58'),
(68, 1, 2, 'text', NULL, '<p class=\"ql-align-justify\">Jadi, nilai perduaan 1011 = 0 + 8 + 0 + 2 + 1 = 11 (sebelas)</p>', NULL, NULL, 7, '2026-05-31 22:21:58', '2026-05-31 22:21:58'),
(69, 1, 2, 'text', NULL, '<h2 class=\"ql-align-justify\"><strong>2.1.3 Penukaran Nombor Perpuluhan kepada Nombor Perduaan</strong></h2><p class=\"ql-align-justify\"><br></p><p class=\"ql-align-justify\"><strong>Kaedah bahagi dengan 2 dan gunakan bakinya </strong></p><p class=\"ql-align-justify\">Dalam kaedah ini, nombor asal dibahagi dengan 2. Catatkan hasil bahagi dan bakinya. Hasil bahagi pertama dibahagikan dengan 2 sekali lagi dan hasil bahagi serta bakinya dicatatkan. Hasil bahagi akan dibahagikan dengan 2 sehingga tidak boleh dibahagi lagi dan setiap bakinya dicatatkan. Nilai nombor perduaan diambil berdasarkan bakinya secara menyongsang.</p><p class=\"ql-align-justify\"><br></p><p class=\"ql-align-justify\"><strong>Kaedah ambil daripada baki </strong></p><p class=\"ql-align-justify\">Bandingkan nilai nombor perpuluhan dengan nilai tempat terdekat nombor perduaan yang kurang daripada nombor perpuluhan tersebut. Jika nilai tempat kurang daripada nilai nombor perpuluhan, catatkan perbezaannya dan tandakan 1 pada nilai tempat tersebut. Ulangi proses ini sehingga nilai tempat yang terakhir.</p><p class=\"ql-align-justify\"><br></p><p class=\"ql-align-justify\">Berikut adalah contoh dua kaedah yang diterangkan di atas:</p>', NULL, NULL, 8, '2026-05-31 22:21:58', '2026-05-31 22:21:58'),
(70, 1, 2, 'image', NULL, NULL, NULL, 'learning-content/blocks/jl0uGdQF83c8oXO3uZZSOrsKPqfty13egKJSqHeP.png', 9, '2026-05-31 22:21:58', '2026-05-31 22:21:58'),
(71, 1, 2, 'image', NULL, NULL, NULL, 'learning-content/blocks/TMAnPGAQs6dPCZlDSxRIXiLHaETCMIMNWQduj2Gz.png', 10, '2026-05-31 22:21:58', '2026-05-31 22:21:58'),
(72, 1, 2, 'youtube', NULL, NULL, 'https://www.youtube.com/watch?v=9FpHR2f87L0', NULL, 11, '2026-05-31 22:21:58', '2026-05-31 22:21:58'),
(73, 1, 3, 'text', NULL, '<h1>3.1 Pembangunan Algoritma</h1><p><br></p><p>Setiap masalah boleh diselesaikan dengan melaksanakan satu siri tindakan mengikut urutan yang tertentu. Tatacara yang menyatakan</p><ul><li>tindakan-tindakan yang perlu dilaksanakan dan</li><li>urutan tindakan untuk menyelesaikan sesuatu masalah dikenali sebagai <strong>algoritma</strong>. </li></ul><p><br></p><p>Algoritma dalam pengaturcaraan komputer menyatakan dengan jelas urutan langkah atau tindakan yang perlu dilaksanakan oleh komputer agar dapat memperoleh output yang diingini. </p>', NULL, NULL, 1, '2026-05-31 22:50:34', '2026-05-31 22:50:34'),
(74, 1, 3, 'image', NULL, NULL, NULL, 'learning-content/blocks/fD339SLVzlgE8yNvLITDOtq7EHS8k0crDfL10Hnf.png', 2, '2026-05-31 22:50:34', '2026-05-31 22:50:34'),
(75, 1, 3, 'text', NULL, '<p><strong>Perkara-perkara penting semasa menulis algoritma</strong></p><p><br></p><p class=\"ql-align-justify\">Semasa pembangunan algoritma, perkara-perkara penting yang berikut harus dipenuhi: </p><p class=\"ql-align-justify\"><br></p><p class=\"ql-align-justify\">(a) Langkah-langkah dalam algoritma biasanya ditulis dalam bahasa yang difahami oleh manusia seperti bahasa Melayu, bahasa Inggeris atau bahasa tabii manusia lain. Rajah 3.1 menunjukkan algoritma menguji kefungsian sebuah lampu. Setiap langkah dinyatakan dalam bahasa Melayu yang mudah difahami</p><p class=\"ql-align-justify\"><br></p><p class=\"ql-align-justify\">(b) Setiap langkah yang perlu dilaksanakan mesti dihuraikan dengan jelas. Misalnya, langkah yang menyatakan “pilih satu nombor yang besar” adalah kurang jelas. Pernyataan yang lebih baik ialah “pilih satu nombor yang lebih besar daripada 1000”.</p><p class=\"ql-align-justify\"><br></p><p class=\"ql-align-justify\">(c) Urutan langkah hendaklah dinyatakan dengan betul. Contoh algoritma berikut menunjukkan kepentingan menulis dengan betul urutan langkah yang akan dilaksanakan.</p><p class=\"ql-align-justify\"><br></p><p class=\"ql-align-justify\">Rajah 3.2 menunjukkan murid bersiap sedia ke sekolah menggunakan Algoritma 1. Algoritma ini membolehkan murid berpakaian kemas untuk pergi ke sekolah.</p>', NULL, NULL, 3, '2026-05-31 22:50:34', '2026-05-31 22:50:34'),
(76, 1, 3, 'image', NULL, NULL, NULL, 'learning-content/blocks/quvKFI9vCbvHySoFmFBEPmcZW8fQGcA1JNQYNrE9.png', 4, '2026-05-31 22:50:34', '2026-05-31 22:50:34'),
(77, 1, 3, 'text', NULL, '<p>Jika urutan langkah dalam algoritma diubahsuaikan seperti yang ditunjukkan dalam Rajah 3.3, murid yang mengikuti algoritma ini akan kelihatan tidak kemas.</p>', NULL, NULL, 5, '2026-05-31 22:50:34', '2026-05-31 22:50:34'),
(78, 1, 3, 'image', NULL, NULL, NULL, 'learning-content/blocks/XDEBNSyXMsXNULZaJi0QsbkEUatOvUEWTkISGL1i.png', 6, '2026-05-31 22:50:34', '2026-05-31 22:50:34'),
(79, 1, 3, 'text', NULL, '<p class=\"ql-align-justify\">(d) Algoritma mesti mempunyai kesudahan tertentu dalam suatu tempoh masa. Dengan kata lain, algoritma mesti menghasilkan output yang bermakna setelah satu set langkah telah dilaksanakan dalam suatu tempoh tertentu.</p><p><br></p><p><strong>Perwakilan algoritma</strong></p><p><br></p><p class=\"ql-align-justify\">Algoritma boleh diwakili atau dibentuk dalam pelbagai cara. Lazimnya, algoritma yang menunjukkan langkah-langkah sesuatu tugasan adalah seperti yang disenaraikan dalam Rajah 3.1 hingga Rajah 3.3. Namun, penggunaan carta alir dan pseudokod lebih lazim digunakan oleh pengatur cara.</p><p class=\"ql-align-justify\"><br></p><p class=\"ql-align-justify\"><strong>Carta alir</strong></p><p class=\"ql-align-justify\"><br></p><p class=\"ql-align-justify\"><span class=\"ql-cursor\">﻿</span>Carta alir menggunakan simbol grafi k seperti garis lurus, anak panah dan bentuk geometri untuk mewakili urutan langkah bagi algoritma yang perlu dilaksanakan. Rajah 3.4 menunjukkan carta alir menguji kefungsian lampu.</p>', NULL, NULL, 7, '2026-05-31 22:50:34', '2026-05-31 22:50:34'),
(80, 1, 3, 'image', NULL, NULL, NULL, 'learning-content/blocks/Zj5S85wVCjhzLVNuo3JC6BScOUMjVGU0X3W1ZC7Q.png', 8, '2026-05-31 22:50:34', '2026-05-31 22:50:34'),
(81, 1, 3, 'text', NULL, '<p><strong>Pseudokod</strong></p><p><br></p><p>Pseudokod memerihalkan langkah-langkah algoritma dengan menggunakan ayat-ayat yang ringkas dan padat. Bahasa Melayu atau bahasa Inggeris biasanya digunakan. Inden digunakan secara meluas bagi memudahkan pembacaan suatu pseudokod. Rajah 3.5 menunjukkan pseudokod bagi menguji kefungsian lampu dalam Rajah 3.1</p>', NULL, NULL, 9, '2026-05-31 22:50:34', '2026-05-31 22:50:34'),
(82, 1, 3, 'image', NULL, NULL, NULL, 'learning-content/blocks/RRMfXmAipOIsz5FrIZ1TBMkXrbTrFUX1OgDZ2mZP.png', 10, '2026-05-31 22:50:34', '2026-05-31 22:50:34'),
(83, 1, 3, 'text', NULL, '<h2>3.1.1 Pseudokod dan Carta Alir yang Melibatkan Struktur Kawalan Pilihan</h2><p><br></p><p class=\"ql-align-justify\">Struktur kawalan pilihan (<em>selection control structure</em>) ialah satu langkah yang memecahkan aliran algoritma kepada dua atau lebih cabang. Setiap cabang mengandungi set langkah yang berlainan untuk dilaksanakan. Langkah yang dilaksanakan bergantung kepada syarat-syarat tertentu. Struktur kawalan pilihan terdiri daripada tiga jenis iaitu struktur kawalan <strong>pilihan tunggal (<em>single selection</em>)</strong>, <strong>dwipilihan (<em>double selection</em>)</strong> dan <strong>pelbagai pilihan (<em>multi selection</em>). </strong></p><p class=\"ql-align-justify\"><br></p><p class=\"ql-align-justify\"><strong>Struktur kawalan pilihan tunggal (<em>single selection</em>) </strong></p><p class=\"ql-align-justify\"><br></p><p class=\"ql-align-justify\">Struktur kawalan pilihan tunggal hanya mempunyai satu pilihan untuk melaksanakan satu set tindakan yang tertentu. Ini bermakna, jika satu syarat yang diuji didapati BENAR maka satu set tindakan akan dilaksanakan.</p><p class=\"ql-align-justify\"><br></p><p class=\"ql-align-justify\">Rajah 3.6 menunjukkan pseudokod dan Rajah 3.7 menunjukkan carta alir satu struktur kawalan pilihan tunggal yang terdapat dalam algoritma menguji kefungsian lampu.</p>', NULL, NULL, 11, '2026-05-31 22:50:34', '2026-05-31 22:50:34'),
(84, 1, 3, 'image', NULL, NULL, NULL, 'learning-content/blocks/Q78f1Wu5Oiv9oVTG3STeOwGujI3bkVetmpRSGZJV.png', 12, '2026-05-31 22:50:34', '2026-05-31 22:50:34'),
(85, 1, 3, 'text', NULL, '<p class=\"ql-align-justify\">Struktur kawalan ini mempunyai satu pilihan tindakan untuk dilaksanakan sahaja, iaitu palamkan plag ke dalam soket. Tindakan ini akan dilaksanakan jika syarat plag tidak dipalam ke dalam soket didapati benar.</p><p class=\"ql-align-justify\"><br></p><p class=\"ql-align-justify\"><strong>Struktur kawalan dwipilihan (<em>double selection</em>)</strong></p><p class=\"ql-align-justify\"><br></p><p class=\"ql-align-justify\">Dwipilihan bermaksud memilih di antara dua tindakan atau dua set tindakan untuk dilaksanakan. Tindakan atau set tindakan yang dilaksanakan bergantung kepada sama ada satu syarat dipenuhi atau tidak. </p><p class=\"ql-align-justify\"><br></p><p class=\"ql-align-justify\">Rajah 3.8 menunjukkan pseudokod dan Rajah 3.9 menunjukkan carta alir untuk satu struktur kawalan dwipilihan. Jika syarat yang diuji adalah benar maka set tindakan A akan dilaksanakan. Jika palsu, maka set tindakan B akan dilaksanakan.</p>', NULL, NULL, 13, '2026-05-31 22:50:34', '2026-05-31 22:50:34'),
(86, 1, 3, 'image', NULL, NULL, NULL, 'learning-content/blocks/Wths6CZkPcPxFuhsrRRAfjvQ4RYySft6cRxi2AEC.png', 14, '2026-05-31 22:50:34', '2026-05-31 22:50:34'),
(87, 1, 3, 'text', NULL, '<p class=\"ql-align-justify\">Rajah 3.10 dan Rajah 3.11 menunjukkan pseudokod dan carta alir struktur kawalan dwipilihan yang terdapat dalam satu algoritma bagi menentukan dan mencetakkan gred murid.</p>', NULL, NULL, 15, '2026-05-31 22:50:34', '2026-05-31 22:50:34'),
(88, 1, 3, 'image', NULL, NULL, NULL, 'learning-content/blocks/sioo79OzKJ9G3t59vLUKTA22FPVpACRpinzKtf8E.png', 16, '2026-05-31 22:50:34', '2026-05-31 22:50:34'),
(89, 1, 3, 'text', NULL, '<p class=\"ql-align-justify\">Berdasarkan Rajah 3.10 dan Rajah 3.11, bahagian yang ditandakan biru merupakan satu struktur kawalan dwipilihan. Dwipilihan ini mengandungi dua tindakan berlainan sebagai pilihan untuk dilaksanakan, iaitu cetak “Lulus” atau cetak “Gagal”. Syarat yang menentukan apa tindakan yang akan dilaksanakan ialah Markah &gt;= 40. Jika syarat dipenuhi, misalnya markah bersamaan dengan 65, maka Lulus akan dicetak. Sebaliknya, jika markah bersamaan dengan 39, maka Gagal akan dicetak. </p><p class=\"ql-align-justify\"><br></p><p class=\"ql-align-justify\">Simbol &gt;= bermaksud lebih besar atau sama dengan. Pernyataan syarat Markah &gt;= 40 bermaksud markah lebih besar atau sama dengan 40. Simbol &gt;= ialah satu contoh pengendali hubungan. Jadual 3.1 menyenaraikan pengendali hubungan lain yang sering digunakan dalam pengaturcaraan</p>', NULL, NULL, 17, '2026-05-31 22:50:34', '2026-05-31 22:50:34'),
(90, 1, 3, 'image', NULL, NULL, NULL, 'learning-content/blocks/L8A1rjfMzRI6mQmLufVudvRJEtDVMzgmYpcgKuMS.png', 18, '2026-05-31 22:50:34', '2026-05-31 22:50:34'),
(91, 1, 4, 'text', NULL, '<h1><strong>4.1 Kod Arahan</strong></h1><p><br></p><p class=\"ql-align-justify\">Kod arahan ialah satu arahan yang mengarahkan komputer melakukan sesuatu tugas. Kod ini boleh disimpan dalam ingatan dan digunakan semula. Kod arahan ditulis dalam suatu bahasa komputer yang boleh difahami oleh komputer. Satu set kod arahan yang mengarahkan komputer untuk menyelesaikan sesuatu tugas dipanggil atur cara atau program komputer.</p><p class=\"ql-align-justify\"><br></p><h2 class=\"ql-align-justify\">4.1.1 Pemboleh Ubah dan Operator Matematik dalam Pengaturcaraan</h2><p class=\"ql-align-justify\"><br></p><p class=\"ql-align-justify\"><strong>Pemboleh ubah</strong> ialah storan ingatan yang digunakan oleh program komputer untuk menyimpan data yang perlu diolahkan kemudian. Pemboleh ubah boleh menyimpan data dalam bentuk nilai berangka seperti integer dan nombor perpuluhan, teks seperti “jumlah” atau nilai logik seperti “Benar” atau “Palsu”. Data yang disimpan dalam pemboleh ubah boleh diolah. </p><p class=\"ql-align-justify\"><br></p><p class=\"ql-align-justify\">Pemboleh ubah dalam konteks pengaturcaraan digunakan untuk mewakili data yang hendak dimasukkan ke dalam program. Apabila program diuji lari, pemboleh ubah akan digantikan dengan data yang sebenar. Hal ini membenarkan sesuatu program untuk memproses set-set data yang berlainan.</p>', NULL, NULL, 1, '2026-05-31 22:58:47', '2026-05-31 22:58:47'),
(92, 1, 4, 'image', NULL, NULL, NULL, 'learning-content/blocks/wj9XvXYiKoeeGTyNxDJhNpju5LLLg8R86PbLjXIu.png', 2, '2026-05-31 22:58:47', '2026-05-31 22:58:47'),
(93, 1, 4, 'text', NULL, '<p class=\"ql-align-justify\">Dalam Rajah 4.1, data yang berupa nilai berangka seperti 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 atau dalam bentuk teks yang mempunyai satu abjad atau beberapa abjad. Data logik dalam bentuk True/ False yang dikenali sebagai Boolean juga boleh disimpan dalam pemboleh ubah.</p><p class=\"ql-align-justify\"><br></p><p class=\"ql-align-justify\"><strong>Operator matematik</strong> ialah simbol-simbol yang digunakan dalam menjalankan operasi matematik dalam kod arahan. Operasi matematik melibatkan operasi asas seperti tambah (+), tolak (–), darab (×) dan bahagi (÷). Program komputer sering digunakan untuk membuat pengiraan, maka operator matematik akan digunakan semasa membina pengaturcaraan untuk program-program komputer yang membuat pengiraan.</p>', NULL, NULL, 3, '2026-05-31 22:58:47', '2026-05-31 22:58:47'),
(94, 1, 4, 'image', NULL, NULL, NULL, 'learning-content/blocks/BOX849BDvSpfiLHtZJIrUD6pad8VWZ3FySBrz3Xc.png', 4, '2026-05-31 22:58:47', '2026-05-31 22:58:47'),
(95, 1, 4, 'text', NULL, '<h2 class=\"ql-align-justify\">4.1.2 Atur Cara yang Melibatkan Struktur Kawalan Pelbagai Pilihan</h2><p class=\"ql-align-justify\"><br></p><p class=\"ql-align-justify\">Dalam pengaturcaraan, sesuatu program mungkin mempunyai beberapa pilihan arahan untuk dilaksanakan dalam keadaan tertentu. Pelaksanaan pilihan arahan ini bergantung kepada syarat-syarat yang tertentu. Struktur kawalan ini disebut pelbagai pilihan. </p><p class=\"ql-align-justify\"><br></p><p class=\"ql-align-justify\">Rajah 4.2 menunjukkan paparan aplikasi sistem navigasi yang digunakan oleh seorang pemandu untuk menuju ke satu destinasi.</p>', NULL, NULL, 5, '2026-05-31 22:58:47', '2026-05-31 22:58:47'),
(96, 1, 4, 'image', NULL, NULL, NULL, 'learning-content/blocks/raybDtup2OSxSds9DUr0J4iMhvsDVRAhBh7UQcXV.png', 6, '2026-05-31 22:58:47', '2026-05-31 22:58:47'),
(97, 1, 4, 'text', NULL, '<p class=\"ql-align-justify\">Paparan aplikasi sistem nagivasi ini menunjukkan tiga laluan alternatif. Pemandu boleh membuat pilihan untuk laluan yang paling sesuai berdasarkan syarat-syarat yang dikehendaki. Pilihan laluan berdasarkan syarat-syarat berikut:</p><p class=\"ql-align-justify\"><br></p><p class=\"ql-align-justify\">(a) Jika ingin sampai ke destinasi dalam masa yang paling singkat, maka Laluan 1 dipilih. </p><p class=\"ql-align-justify\">(b) Jika ingin menggunakan jalan tanpa tol, maka Laluan 2 dipilih. </p><p class=\"ql-align-justify\">(c) Jika ingin menggunakan laluan yang paling dekat, maka Laluan 1 dipilih.</p><p class=\"ql-align-justify\"><br></p><p class=\"ql-align-justify\">Dalam pengaturcaraan, perkataan-perkataan pengekodan (IF), (IF…ELSE) dan (IF…ELSE IF…ELSE) digunakan untuk mengawal pilihan. Jadual 4.2 menunjukkan jenis pilihan yang digunakan dalam pengaturcaraan.</p>', NULL, NULL, 7, '2026-05-31 22:58:47', '2026-05-31 22:58:47'),
(98, 1, 4, 'image', NULL, NULL, NULL, 'learning-content/blocks/AD6WomOq9bHChNK7ZE5FkGrU8ot96xUXgSmpNd4n.png', 8, '2026-05-31 22:58:47', '2026-05-31 22:58:47'),
(172, 3, 8, 'text', NULL, '<p class=\"ql-align-justify\">Pembangunan atur cara terdiri daripada lima fasa, iaitu fasa analisis masalah, fasa reka bentuk atur cara, fasa pengekodan, fasa pengujian dan penyahpepijatan serta fasa dokumentasi. Rajah 1.1 menunjukkan fasa-fasa pembangunan atur cara.</p>', NULL, NULL, 1, '2026-06-07 02:56:07', '2026-06-07 02:56:07'),
(173, 3, 8, 'image', NULL, NULL, NULL, 'learning-content/blocks/E1dBtGyVK2iRhhvYjkPWCdlLdpdma0wa6PVHRy0o.png', 2, '2026-06-07 02:56:07', '2026-06-07 02:56:07'),
(174, 3, 8, 'text', NULL, '<h3>1.1.1 Menggunakan Konsep Pemikiran Komputasional dalam Pembangunan Atur Cara</h3><p><br></p><p>Pemikiran komputasional ditakrifkan sebagai satu proses pemikiran bertujuan untuk menyelesaikan masalah oleh manusia sendiri berbantukan mesin atau kedua-duanya sekali dengan menggunakan konsep asas sains komputer. Proses penyelesaian masalah ini melibatkan usaha memecahkan masalah kepada komponen yang lebih kecil dan mencari penyelesaian secara sistematik. </p><p><br></p><p>Pernyataan berikut menunjukkan suatu masalah yang diketengahkan bagi membincangkan tentang penggunaan konsep pemikiran komputasional dalam pembangunan atur cara.</p><p><br></p><blockquote>Anda diminta untuk membina atur cara mudah bagi mengira luas dan perimeter sebuah padang bola yang berbentuk segi empat tepat.</blockquote>', NULL, NULL, 3, '2026-06-07 02:56:07', '2026-06-07 02:56:07'),
(175, 3, 8, 'image', NULL, NULL, NULL, 'learning-content/blocks/2arSCHSC4sAe2KyXg5hZCzhL6hEHvCwerpFtqxaN.png', 4, '2026-06-07 02:56:07', '2026-06-07 02:56:07'),
(176, 3, 8, 'text', NULL, '<h3>(i) Fasa Analisis Masalah</h3><p><br></p><p>Dalam fasa ini, pengatur cara akan: </p><p>(a) Mengenal pasti masalah, keperluan sistem dan perisian serta sasaran pengguna. </p><p>(b) Mengenal pasti input, proses dan output bagi atur cara yang akan dibina. </p><p>(c) Menemu bual, membuat soal selidik dan pemerhatian bagi mengetahui keperluan pelanggan.</p><p><br></p><h2>Teknik Leraian</h2><p><br></p><p class=\"ql-align-justify\">Teknik leraian digunakan untuk menganalisis masalah dengan memecahkan masalah yang besar kepada bahagian-bahagian yang lebih kecil. Bahagian-bahagian kecil ini ialah masalah kecil yang lebih mudah diselesaikan. Rajah 1.3 menunjukkan penggunaan teknik leraian dalam fasa analisis masalah.</p>', NULL, NULL, 5, '2026-06-07 02:56:07', '2026-06-07 02:56:07'),
(177, 3, 8, 'image', NULL, NULL, NULL, 'learning-content/blocks/NBRBj1FmzweEyXfRjRWjmhzKyHsYhirKCMnHp1Xi.png', 6, '2026-06-07 02:56:07', '2026-06-07 02:56:07'),
(178, 3, 8, 'text', NULL, '<h3>(ii) Fasa Reka Bentuk Atur Cara</h3><p><br></p><p>Dalam fasa ini, pengatur cara akan: </p><p>(a) Menulis pseudokod. </p><p>(b) Melukis carta alir. </p><p>(c) Mereka bentuk antara muka pengguna.</p><p><br></p><h3>Teknik Pengecaman Corak</h3><p><br></p><p class=\"ql-align-justify\">Selepas meleraikan masalah besar, setiap bahagian kecil atau masalah kecil akan dianalisis untuk mengecam corak-corak yang tertentu sekiranya ada. Pengecaman corak ini dapat membantu dalam mencari penyelesaian masalah dengan lebih efisien. Rajah 1.4 menunjukkan corak yang wujud dalam pengiraan luas dan perimeter sebuah padang bola. Didapati bahawa pengiraan bagi luas dan perimeter tersebut menggunakan pemboleh ubah yang sama, iaitu panjang dan lebar.</p>', NULL, NULL, 7, '2026-06-07 02:56:07', '2026-06-07 02:56:07'),
(179, 3, 8, 'text', NULL, '<h3>Teknik Peniskalaan</h3><p><br></p><p class=\"ql-align-justify\">Setelah corak-corak dicamkan, corak-corak ini diteliti untuk meninggalkan aspek-aspek kurang penting dan memberikan penekanan terhadap aspek-aspek penting yang dapat membantu dalam penyelesaian masalah. Pemboleh ubah merupakan jenis corak yang telah dicamkan manakala panjang dan lebar merupakan aspek penting yang perlu diberikan penekanan. Panjang dan lebar padang bola yang berbentuk segi empat tepat serta formula matematik yang berkenaan diperlukan untuk mendapatkan luas dan perimeter padang bola tersebut. Formula untuk mengira luas dan perimeter sebuah padang bola adalah seperti berikut:</p><p class=\"ql-align-justify\"><br></p><blockquote class=\"ql-align-justify\">Luas padang bola = panjang × lebar</blockquote><blockquote class=\"ql-align-justify\">Perimeter padang bola = (panjang + lebar) × 2&nbsp;</blockquote><p class=\"ql-align-justify\"><br></p><h3 class=\"ql-align-justify\">Teknik Pengitlakan</h3><p class=\"ql-align-justify\"><br></p><p class=\"ql-align-justify\">Berdasarkan maklumat yang diperoleh daripada leraian dan peniskalaan masalah yang dilakukan, algoritma yang diperlukan untuk menyelesaikan masalah pengiraan luas dan perimeter padang bola boleh ditentukan. Algoritma komputer biasanya terdapat dalam bentuk pseudokod atau carta alir. Aspek penting yang perlu ditekankan semasa menulis algoritma ialah langkah-langkah yang perlu dilaksanakan untuk menghasilkan pseudokod dan carta alir yang betul. Bagi carta alir, penggunaan simbol yang betul untuk sesuatu langkah merupakan aspek yang penting kerana simbol-simbol tersebut merujuk kepada suatu fungsi yang tertentu.</p><p class=\"ql-align-justify\"><br></p><p class=\"ql-align-justify\">Rajah 1.5 dan Rajah 1.6 masing-masing menunjukkan pseudokod dan carta alir bagi mengira luas dan perimeter sebuah padang bola.</p>', NULL, NULL, 8, '2026-06-07 02:56:07', '2026-06-07 02:56:07'),
(180, 3, 8, 'image', NULL, NULL, NULL, 'learning-content/blocks/hddJ99HFnQfAUPfLKl4YX3UWObBWqICjoRnHdI5m.png', 9, '2026-06-07 02:56:07', '2026-06-07 02:56:07'),
(181, 3, 8, 'text', NULL, '<p>(iii) Fasa Pengekodan</p><p><br></p><p>Dalam fasa ini, pengatur cara akan: </p><p>(a) Memilih bahasa pengaturcaraan, misalnya Python dan perisian pengaturcaraan, misalnya Pyscripter dan IDLE. </p><p>(b) Mengekod atur cara berdasarkan pseudokod dan carta alir.</p><p><br></p><h3>Teknik Leraian </h3><p><br></p><p>Semasa fasa pengekodan, anda boleh menggunakan teknik leraian untuk mengenal pasti komponen masalah ketika menulis kod arahan. Rajah 1.7 menunjukkan penggunaan teknik leraian bagi mengatasi masalah penulisan kod arahan.</p>', NULL, NULL, 10, '2026-06-07 02:56:07', '2026-06-07 02:56:07'),
(182, 3, 8, 'image', NULL, NULL, NULL, 'learning-content/blocks/PeZVvAICA3aSqup07JmTiROYZwSZf6spaeUob8QO.png', 11, '2026-06-07 02:56:07', '2026-06-07 02:56:07'),
(183, 3, 8, 'text', NULL, '<h3>Teknik Pengecaman Corak</h3><p><br></p><p class=\"ql-align-justify\">Teknik pengecaman corak memberikan penekanan kepada pemboleh ubah bagi input, iaitu panjang dan lebar kerana kedua-duanya menunjukkan corak yang sama. Nilai bagi pemboleh ubah pula merupakan corak yang berbeza kerana pengguna boleh memasukkan sebarang nilai yang ingin diuji bagi mendapatkan luas dan perimeter sebuah padang bola. Jadual 1.1 menunjukkan persamaan dan perbezaan pemboleh ubah.</p>', NULL, NULL, 12, '2026-06-07 02:56:07', '2026-06-07 02:56:07'),
(184, 3, 8, 'image', NULL, NULL, NULL, 'learning-content/blocks/rc727YNlEk7u4YCYid4Pa21Kgau7PMhntq7r0Kke.png', 13, '2026-06-07 02:56:08', '2026-06-07 02:56:08'),
(185, 3, 8, 'text', NULL, '<h3>Teknik Peniskalaan</h3><p><br></p><p class=\"ql-align-justify\">Aspek-aspek penting bagi setiap bahagian masalah kecil adalah berlainan. Contohnya penggunaan pemboleh ubah yang betul, kod arahan input, formula yang digunakan dan kod arahan output perlu diambil kira semasa penulisan kod arahan. Rajah 1.8 menunjukkan kod arahan bagi input, proses dan output dalam bahasa pengaturcaraan Python.</p>', NULL, NULL, 14, '2026-06-07 02:56:08', '2026-06-07 02:56:08'),
(186, 3, 8, 'image', NULL, NULL, NULL, 'learning-content/blocks/C0f5aArEClXw9pBRVLSVuFA8mDiQPKvD9fmPcI6m.png', 15, '2026-06-07 02:56:08', '2026-06-07 02:56:08'),
(187, 3, 8, 'text', NULL, '<p class=\"ql-align-justify\">(iv) Fasa Pengujian Atur Cara dan Penyahpepijatan Ralat</p><p class=\"ql-align-justify\"><br></p><p class=\"ql-align-justify\">Dalam fasa ini, pengatur cara akan: </p><p class=\"ql-align-justify\">(a) Menguji atur cara yang telah ditulis bagi mengesan dan membetulkan sebarang ralat yang terdapat pada atur cara. </p><p class=\"ql-align-justify\">(b) Mengenal pasti ralat-ralat yang ada. Terdapat tiga jenis ralat, iaitu: </p><p class=\"ql-align-justify\">	(i) Ralat sintaks (<em>syntax error</em>) Ralat yang disebabkan oleh penggunaan sintaks sesuatu bahasa pengaturcaraan yang tidak betul dalam penulisan satu atur cara. bahagian, iaitu input, proses dan output. </p><p class=\"ql-align-justify\">	(ii) Ralat masa larian (<em>runtime error</em>) Ralat yang disebabkan oleh kemasukan data yang tidak menepati kehendak arahan. Ralat ini akan menyebabkan pelaksanaan atur cara terhenti secara tiba-tiba dengan mengeluarkan paparan mesej ralat yang tertentu.</p><p class=\"ql-align-justify\">	(iii) Ralat logik (<em>logical error</em>) Ralat yang disebabkan oleh kesilapan logik pengatur cara sehingga menyebabkan atur cara menghasilkan output yang salah.</p><p class=\"ql-align-justify\"><br></p><h3 class=\"ql-align-justify\">Teknik Leraian</h3><p class=\"ql-align-justify\"><br></p><p class=\"ql-align-justify\">Selepas meleraikan masalah besar kepada bahagian-bahagian kecil, pengujian atur cara dan penyahpepijatan ralat dapat dilakukan secara berperingkat. Rajah 1.9 menunjukkan penggunaan teknik leraian bagi pengujian atur cara dan penyahpepijatan ralat secara berperingkat.</p>', NULL, NULL, 16, '2026-06-07 02:56:08', '2026-06-07 02:56:08'),
(188, 3, 8, 'image', NULL, NULL, NULL, 'learning-content/blocks/VQuVPmhlnGuca3DMy1X6lK2Xi5gJFzBelHirZCxQ.png', 17, '2026-06-07 02:56:08', '2026-06-07 02:56:08'),
(189, 3, 8, 'text', NULL, '<h3 class=\"ql-align-justify\">Teknik Pengecaman Corak</h3><p class=\"ql-align-justify\"><br></p><p class=\"ql-align-justify\">Tujuan utama proses pengujian kod arahan adalah untuk memastikan atur cara berfungsi dengan baik dan memaparkan output yang betul. Semasa proses pengujian, jenis mesej ralat yang diterima atau cara sesuatu atur cara bertindak perlu dikenal pasti. Setiap ralat yang ditemui perlu dikenal pasti ciri-ciri persamaan dan perbezaannya. </p><p class=\"ql-align-justify\"><br></p><p class=\"ql-align-justify\">Pengecaman corak-corak ini dapat membantu anda dalam mengenal pasti jenis-jenis ralat yang ditemui, iaitu ralat sintaks, ralat masa larian atau ralat logik. Pengecaman corak boleh dibuat berdasarkan mesej ralat yang dipaparkan semasa pengujian. Paparan mesej ralat itu sendiri merupakan corak yang dicamkan. Persamaan corak pada mesej ralat membolehkan anda mengenal pasti jenis ralat tersebut. Jadual 1.2 menunjukkan corak paparan mesej ralat bagi setiap jenis ralat.</p>', NULL, NULL, 18, '2026-06-07 02:56:08', '2026-06-07 02:56:08'),
(190, 3, 8, 'image', NULL, NULL, NULL, 'learning-content/blocks/4LbIsrcNlFumIDt1QGvKvWcU3IcLvjJrdKJcirjc.png', 19, '2026-06-07 02:56:08', '2026-06-07 02:56:08'),
(191, 3, 8, 'image', NULL, NULL, NULL, 'learning-content/blocks/1ILmCvkMXv5VjPkY3BwZKAYPNCi7776F6le5IP0V.png', 20, '2026-06-07 02:56:08', '2026-06-07 02:56:08'),
(192, 3, 8, 'youtube', NULL, NULL, 'https://www.youtube.com/watch?v=UacLmYCHyjE', NULL, 21, '2026-06-07 02:56:08', '2026-06-07 02:56:08'),
(193, 3, 9, 'text', NULL, '<h1>3.1 Pembangunan Algoritma</h1><p><br></p><p class=\"ql-align-justify\">Algoritma ialah satu siri langkah atau tindakan yang jelas yang perlu dilaksanakan untuk menghasilkan output yang dikehendaki. Dalam bidang pengkomputeran, pengatur cara akan membina atur cara berpandukan algoritma yang dibangunkan terlebih dahulu. Pembangunan algoritma merupakan satu teknik pengitlakan yang melibatkan pembinaan langkah-langkah penyelesaian masalah. </p><p class=\"ql-align-justify\"><br></p><p class=\"ql-align-justify\">Tugas ahli-ahli dalam bidang sains komputer adalah mengkaji dan membangunkan algoritma dengan tujuan untuk menyelesaikan masalah-masalah pengaturcaraan. Antara faedah yang diperoleh daripada kajian serta pembangunan algoritma yang dilakukan adalah seperti berikut:</p><p class=\"ql-align-justify\"><br></p><ol><li class=\"ql-align-justify\">Memahami bagaimana komputer memproses urutan tindakan-tindakan yang perlu dilaksanakan. </li><li class=\"ql-align-justify\">Mempelajari cara menulis algoritma yang teratur, mudah dibaca dan difahami. </li><li class=\"ql-align-justify\">Mempelajari cara menulis algoritma dengan cekap. </li><li class=\"ql-align-justify\">Mempelajari cara melakukan penambahbaikan pada algoritma.</li></ol><p class=\"ql-align-justify\"><br></p><p class=\"ql-align-justify\">Dalam bab ini, anda akan mempelajari algoritma bagi dua jenis masalah pengaturcaraan, iaitu algoritma search dan algoritma sort.</p>', NULL, NULL, 1, '2026-06-08 00:11:39', '2026-06-08 00:11:39'),
(194, 3, 9, 'text', NULL, '<h2>3.1.1 Ciri-ciri Search dan Sort</h2><p><br></p><p class=\"ql-align-justify\">Zulaikha ingin mendapatkan sebuah buku di perpustakaan untuk digunakan sebagai rujukan semasa membuat tugasan. Bagaimanakah Zulaikha mencari buku yang dikehendakinya di perpustakaan? Terdapat lebih daripada satu cara atau teknik search boleh digunakan bagi mencari buku-buku di perpustakaan bergantung kepada bagaimana buku-buku tersebut disusun.</p><p class=\"ql-align-justify\"><br></p><p class=\"ql-align-justify\">(i) <em>Search</em></p><p class=\"ql-align-justify\"><br></p><p class=\"ql-align-justify\">Search ialah proses untuk mendapatkan suatu item tertentu yang terkandung dalam satu senarai. Dalam bidang pengkomputeraan, search amat penting untuk membantu manusia mendapatkan maklumat yang dikehendaki dengan lebih cepat. Manusia boleh mengarahkan aplikasi pemprosesan kata untuk mencari satu perkataan yang berulang dalam suatu senarai. </p><p class=\"ql-align-justify\"><br></p><p class=\"ql-align-justify\">Dalam bab ini, dua jenis search akan dipelajari, iaitu <em><u>linear search</u></em> dan <em><u>binary search.</u></em></p><p class=\"ql-align-justify\"><br></p><ul><li class=\"ql-align-justify\"><em>Linear Search</em></li></ul><p class=\"ql-align-justify\"><em>Linear search</em> ialah satu teknik untuk mendapatkan item yang dikehendaki dalam satu senarai <em>linear</em>. Carian akan bermula dengan item pertama yang terdapat dalam senarai. Jika item pertama bukan item yang dikehendaki, carian akan diteruskan dengan item kedua. Jika item kedua bukan item yang dikehendaki, carian akan diteruskan dengan item ketiga dan seterusnya sehingga item yang dikehendaki diperoleh. Jika item yang dikehendaki tidak diperoleh sehingga carian selesai, maka carian akan ditamatkan tanpa hasil.</p><p class=\"ql-align-justify\"><br></p><p class=\"ql-align-justify\">Algoritma linear search ialah satu algoritma yang sangat mudah. Item-item dalam senarai tidak perlu diisih mengikut urutan terlebih dahulu apabila linear search ingin diaplikasikan. Walau bagaimanapun, linear search ini tidak begitu efisien kerana teknik ini akan menyemak setiap item yang terdapat dalam senarai. Cara penyemakan ini memerlukan masa yang panjang, terutamanya jika senarai mengandungi terlalu banyak item. Jika item yang dicari berada di akhir senarai atau item yang dicari tidak berada dalam senarai, carian akan tetap dilakukan sehingga item yang terakhir.</p>', NULL, NULL, 2, '2026-06-08 00:11:39', '2026-06-08 00:11:39'),
(195, 3, 9, 'image', NULL, NULL, NULL, 'learning-content/blocks/mSVydBW5krxOVUp5pr2yKXPx8aqXvwNuqphHe59f.png', 3, '2026-06-08 00:11:39', '2026-06-08 00:11:39'),
(196, 3, 9, 'image', NULL, NULL, NULL, 'learning-content/blocks/19DOEYo3VlD3TM9p0vRlfjkrQDF548SZkwMfgNt6.png', 4, '2026-06-08 00:11:39', '2026-06-08 00:11:39'),
(197, 3, 9, 'text', NULL, '<p class=\"ql-align-justify\"><br></p><ul><li class=\"ql-align-justify\"><em>Binary Search</em></li></ul><p class=\"ql-align-justify\">Binary search ialah teknik carian yang melibatkan keputusan dwipilihan. Sebelum melakukan <em>binary search</em>, item-item dalam senarai perlu diisih dalam urutan menaik. Kemudian, item yang berada di tengah senarai akan disemak. Jika item di tengah ialah item yang dikehendaki, maka carian akan tamat. Jika tidak, item yang dikehendaki dibandingkan dengan item di tengah senarai itu. Jika item yang dikehendaki lebih kecil, maka item di tengah senarai serta semua item di sebelah kanannya diabaikan. Jika item yang dikehendaki lebih besar, maka item di tengah senarai serta semua item di sebelah kirinya diabaikan. Proses ini diulang pada senarai item yang tinggal dan berterusan sehingga item yang dikehendaki diperoleh. Jika item yang dikehendaki tidak diperoleh apabila carian selesai, maka carian akan ditamatkan tanpa hasil.</p><p class=\"ql-align-justify\"><br></p><p class=\"ql-align-justify\"><em>Binary search</em> adalah lebih efisien dan menjimatkan masa berbanding dengan <em>linear search</em> kerana <em>binary search</em> tidak perlu menyemak setiap item dalam senarai. Binary search ini juga sesuai digunakan pada senarai dengan item yang banyak.</p><p><br></p>', NULL, NULL, 5, '2026-06-08 00:11:39', '2026-06-08 00:11:39'),
(198, 3, 9, 'image', NULL, NULL, NULL, 'learning-content/blocks/d7GJWV63CHAiitDNI1xlcNLjINEaMcsaQ5j6UxAK.png', 6, '2026-06-08 00:11:39', '2026-06-08 00:11:39'),
(199, 3, 9, 'image', NULL, NULL, NULL, 'learning-content/blocks/oaWo5xdoYetOc8WS3NA5zpOCof0b4uCDMGildbcJ.png', 7, '2026-06-08 00:11:39', '2026-06-08 00:11:39'),
(200, 3, 9, 'text', NULL, '<p class=\"ql-align-justify\">(ii) <em>Sort</em></p><p class=\"ql-align-justify\"><br></p><p class=\"ql-align-justify\"><em>Sort </em>ialah proses mengisih atau menyusun item-item dalam suatu senarai linear mengikut urutan yang tertentu. Dalam bidang perkomputeran, <em>sort</em> ialah teknik yang penting untuk mendapatkan maklumat dengan cepat dan tepat. </p><p class=\"ql-align-justify\"><br></p><p class=\"ql-align-justify\">	Antara contoh <em>sort</em> dalam kehidupan seharian ialah mengisih surat-surat di pejabat pos mengikut negeri, menyusun senarai nama murid mengikut abjad dan menyusun murid-murid ke dalam barisan mengikut rumah sukan. </p><p class=\"ql-align-justify\"><br></p><p class=\"ql-align-justify\">Dalam bab ini, dua jenis sort akan dipelajari, iaitu <em><u>bubble sort</u> </em>dan <em><u>bucket sort</u></em>.</p><p class=\"ql-align-justify\"><br></p><ul><li class=\"ql-align-justify\"><em>Bubble Sort</em></li></ul><p class=\"ql-align-justify\"><br></p><p class=\"ql-align-justify\"><em>Bubble sort</em> ialah satu teknik pengisihan yang mudah untuk mengisih item-item dalam senarai mengikut urutan menaik atau menurun. Teknik isihan ini bermula dengan membandingkan dua item pertama dalam senarai. Bagi isihan yang melibatkan urutan menaik, item pertama dengan item kedua akan bertukar tempat jika nilai item pertama lebih besar daripada nilai item kedua. Bagi isihan yang melibatkan urutan menurun, item pertama dengan item kedua akan bertukar tempat jika nilai item pertama lebih kecil daripada nilai item kedua. Perbandingan dua item bersebelahan akan berterusan pada item-item seterusnya sehingga ke item terakhir.</p>', NULL, NULL, 8, '2026-06-08 00:11:39', '2026-06-08 00:11:39'),
(201, 3, 9, 'image', NULL, NULL, NULL, 'learning-content/blocks/u3theHcFE4QBUKxGenS7mPuCp3mZ7k14p4DDQVHF.png', 9, '2026-06-08 00:11:39', '2026-06-08 00:11:39'),
(202, 3, 9, 'image', NULL, NULL, NULL, 'learning-content/blocks/N4BfcbvYMFX1wooIdRSUTYxC3MfUMPr1awahbJlx.png', 10, '2026-06-08 00:11:39', '2026-06-08 00:11:39'),
(203, 3, 9, 'text', NULL, '<ul><li class=\"ql-align-justify\"><em>Bucket Sort</em></li></ul><p><br></p><p><em>Bucket sort</em> ialah satu teknik yang mengasingkan item-item dalam senarai tertentu ke dalam baldi (<em>bucket</em>), seterusnya item-item di dalam baldi akan diisih dan disusun semula ke dalam senarai. Bilangan baldi yang diperlukan bergantung kepada pengatur cara dan bilangan item dalam senarai yang perlu diisih.&nbsp;</p>', NULL, NULL, 11, '2026-06-08 00:11:39', '2026-06-08 00:11:39'),
(204, 3, 9, 'image', NULL, NULL, NULL, 'learning-content/blocks/Kpu1SUeMQG9jRhkIxXPmc552APfIyLSdDRHD0KgV.png', 12, '2026-06-08 00:11:39', '2026-06-08 00:11:39'),
(205, 3, 9, 'text', NULL, '<p class=\"ql-align-justify\">Daripada kedua-dua kaedah search dan sort yang telah dipelajari, terdapat beberapa ciri persamaan dan perbezaan antara kedua-duanya. Rajah 3.1 menunjukkan persamaan dan perbezaan ciri-ciri bagi search dan sort.</p>', NULL, NULL, 13, '2026-06-08 00:11:39', '2026-06-08 00:11:39'),
(206, 3, 9, 'image', NULL, NULL, NULL, 'learning-content/blocks/gd2WqClKYnGLRSIdYrreoFwOL6XFJwyTHoG8iL8o.png', 14, '2026-06-08 00:11:39', '2026-06-08 00:11:39'),
(207, 3, 9, 'youtube', NULL, NULL, 'https://www.youtube.com/watch?v=98VygvwLOVI', NULL, 15, '2026-06-08 00:11:39', '2026-06-08 00:11:39');
INSERT INTO `learning_content_blocks` (`id`, `learning_content_id`, `topic_id`, `type`, `title`, `content`, `url`, `file_path`, `sort_order`, `created_at`, `updated_at`) VALUES
(208, 3, 10, 'text', NULL, '<h1>2.1 Kriptografi Dalam Keselamatan Data</h1><p><br></p><p class=\"ql-align-justify\">Dalam era teknologi maklumat dan komunikasi, kebanyakan maklumat dikongsi melalui Internet dalam bentuk digital. Penghantaran suatu dokumen tidak lagi bergantung kepada perkhidmatan pos tetapi lebih kepada penggunaan rangkaian komputer, contohnya melalui e-mel atau media sosial. Pernahkah anda terfikir bagaimana sesuatu mesej atau data yang dihantar secara elektronik diterima oleh penerima tanpa dicuri, diubah atau ditokok tambah oleh pihak lain?</p><p class=\"ql-align-justify\"><br></p><h2 class=\"ql-align-justify\">2.1.1 Kriptografi	dalam	Pengkomputeran</h2><p class=\"ql-align-justify\"><br></p><p class=\"ql-align-justify\">Kriptografi (<em>cryptography</em>) berasal daripada bahasa Yunani yang terdiri daripada dua suku kata, iaitu “<em>kriptos</em>” dan “<em>graphein</em>”. “<em>Kriptos</em>” bermaksud sembunyi manakala “<em>graphein</em>” bermaksud untuk tulis. Oleh itu, kriptografi boleh dihuraikan sebagai kajian tentang teknik kerahsiaan atau dikenali sebagai keselamatan komunikasi data. Tujuan utama kriptografi dicipta adalah untuk melindungi informasi daripada terdedah dan dipintas oleh pihak lain. </p><p class=\"ql-align-justify\"><br></p><p class=\"ql-align-justify\">Gambar foto 2.1 menunjukkan satu contoh tulisan Hieroglif yang digunakan oleh golongan elit Tamadun Mesir Purba. Tulisan Hieroglif ini ialah satu contoh kriptografi.</p><p class=\"ql-align-justify\"><br></p><p class=\"ql-align-justify\">Pada zaman moden hari ini, kita sangat bergantung kepada sistem pengkomputeran digital. Situasi ini telah menyebabkan kebanyakan maklumat penting atau sulit individu, masyarakat dan negara disimpan dalam bentuk digital yang boleh diakses melalui laman sesawang. Cara penyimpanan dalam bentuk digital ini telah membuka ruang untuk pencerobohan maklumat berlaku.</p>', NULL, NULL, 1, '2026-06-08 00:44:11', '2026-06-08 00:44:11'),
(209, 3, 10, 'image', NULL, NULL, NULL, 'learning-content/blocks/prUZZRJVCOcXqe2nmNmJtqWfPIYLd8Km5vuux9PU.png', 2, '2026-06-08 00:44:11', '2026-06-08 00:44:11'),
(210, 3, 10, 'text', NULL, '<p>Bagi mengatasi masalah pencerobohan maklumat, kriptografi telah menjadi satu keperluan besar untuk melindungi kepentingan maklumat dalam pengkomputeran. Rajah 2.1 menunjukkan empat kepentingan perkhidmatan keselamatan data kriptografi.</p>', NULL, NULL, 3, '2026-06-08 00:44:11', '2026-06-08 00:44:11'),
(211, 3, 10, 'image', NULL, NULL, NULL, 'learning-content/blocks/2HkUG8bE5giOgPiAsUyI7FEM0f6htjVNVHbqJBnf.png', 4, '2026-06-08 00:44:11', '2026-06-08 00:44:11'),
(212, 3, 10, 'text', NULL, '<p class=\"ql-align-justify\">	<strong>Kerahsiaan</strong> merujuk kepada kesulitan sesuatu maklumat yang dihantar melalui rangkaian komputer yang perlu dilindungi supaya maklumat tersebut tidak diketahui oleh pihak lain selain penerima. <strong>Pengesahan</strong> pula berkaitan dengan pengenalpastian pihak-pihak yang terlibat dalam suatu komunikasi. Maklumat atau data yang diterima perlu dikenal pasti agar maklumat dihantar oleh pihak yang disahkan. Contohnya, nama pengguna dan kata laluan bagi perbankan Internet hanya boleh diakses oleh pengguna yang sah sahaja. </p><p class=\"ql-align-justify\"><br></p><p class=\"ql-align-justify\">	<strong>Integriti</strong> ialah perkhidmatan keselamatan yang mengenal pasti sebarang perubahan terhadap maklumat atau data oleh pihak lain. Contohnya, transaksi perbankan dalam talian menggunakan kriptografi bagi mengelakkan pihak lain melakukan perubahan sebarang maklumat dalam transaksi seperti jumlah wang, nombor akaun dan sebagainya. <strong>Tiada sangkalan </strong>digunakan untuk membuktikan bahawa penghantar dan penerima maklumat tidak menafikan bahawa mereka menghantar dan menerima maklumat tersebut. </p><p class=\"ql-align-justify\"><br></p><p class=\"ql-align-justify\">Oleh itu, penggunaan kriptografi penting untuk menjaga kerahsiaan maklumat serta mengelakkan sebarang penyamaran atau penipuan berlaku.</p>', NULL, NULL, 5, '2026-06-08 00:44:11', '2026-06-08 00:44:11'),
(213, 3, 10, 'text', NULL, '<h2>2.1.2 Proses Sifer (<em>Cipher</em>)</h2><p><br></p><p>Anda telah mempelajari bahawa kriptografi ialah penyamaran demi menjaga kerahsiaan dan keselamatan sesuatu data. Satu cara untuk mencapai tujuan ini adalah dengan melakukan penyulitan (<em>encryption</em>). </p><p><br></p><p>Dalam kriptografi, pasangan algoritma digunakan untuk melakukan penyulitan dan nyahsulit. Pasangan algoritma ini dikenali sebagai algoritma kriptografi atau sifer. Sesuatu <strong>teks biasa (<em>plaintext</em>)</strong> akan melalui proses <strong>penyulitan</strong> <strong>(<em>encryption</em>)</strong> yang menyebabkan data berubah menjadi bentuk yang tidak bermakna, iaitu <strong>teks sifer (<em>ciphertext</em>)</strong> sebelum dihantar kepada penerima. Hanya penerima yang berhak sahaja dapat melakukan proses <strong>nyahsulit (<em>decryption</em>)</strong>, iaitu menukarkan kembali teks sifer menjadi teks biasa. Setiap proses penyulitan dan proses nyahsulit dapat dilengkapi dengan penggunaan <strong>kunci (<em>key</em>) </strong>yang hanya diketahui oleh penghantar dan penerima. Teks sifer tidak boleh dinyahsulit oleh pihak yang tidak berhak tanpa kunci tersebut. </p><p><br></p><p>Algoritma kriptografi atau sifer yang dicipta pada zaman dahulu dikenali sebagai sifer klasik. Pada masa itu, sifer klasik digunakan untuk penyulitan dan nyahsulit teks tulisan. Kini, perkembangan teknologi komputer telah membolehkan ciptaan sifer yang sangat kompleks digunakan untuk menyulitkan sebarang bentuk data. Rajah 2.2 menunjukkan dua jenis sifer.</p>', NULL, NULL, 6, '2026-06-08 00:44:11', '2026-06-08 00:44:11'),
(214, 3, 10, 'image', NULL, NULL, NULL, 'learning-content/blocks/rbqKXh88pEqKPixsXI41ioo2Paiphy19Xt7SbQrf.png', 7, '2026-06-08 00:44:11', '2026-06-08 00:44:11'),
(215, 3, 10, 'text', NULL, '<p>(i) Penyulitan (<em>Encryption</em>)</p><p><br></p><p class=\"ql-align-justify\">Penyulitan ialah satu komponen penting dalam bidang kriptografi. Penyulitan ialah satu proses penukaran teks biasa kepada teks sifer, iaitu teks dalam bentuk yang tidak bermakna apabila dibaca. Penukaran ini dilakukan dengan menggunakan algoritma dan kunci penyulitan. Rajah 2.3 menunjukkan proses penyulitan.</p>', NULL, NULL, 8, '2026-06-08 00:44:11', '2026-06-08 00:44:11'),
(216, 3, 10, 'image', NULL, NULL, NULL, 'learning-content/blocks/TSeJIOZYITnE0aIUGfm8ElvD9rLTxw4sG8lYxjUV.png', 9, '2026-06-08 00:44:11', '2026-06-08 00:44:11'),
(217, 3, 10, 'text', NULL, '<p>Langkah-langkah penyulitan adalah seperti berikut. </p><ol><li>Pengirim menghantar mesej (teks biasa) kepada penerima. </li><li>Mesej ini akan disulitkan menggunakan satu kunci dan algoritma penyulitan. </li><li>Teks sifer, iaitu teks yang tidak bermakna akan terhasil.</li></ol><p><br></p><p>(i) Nyahsulit (<em>Decryption</em>)</p><p><br></p><p class=\"ql-align-justify\">Apabila suatu teks biasa telah melalui proses penyulitan dan menghasilkan teks sifer, proses nyahsulit akan berlaku terhadap teks sifer untuk mendapatkan kembali teks biasa yang asal. Secara umumnya, nyahsulit ialah proses untuk mengembalikan teks sifer menjadi teks biasa yang dapat dibaca dan mempunyai maksud. Seperti proses penyulitan, nyahsulit juga menggunakan suatu algoritma dan kunci nyahsulit. Rajah 2.4 menunjukkan proses nyahsulit.</p>', NULL, NULL, 10, '2026-06-08 00:44:11', '2026-06-08 00:44:11'),
(218, 3, 10, 'image', NULL, NULL, NULL, 'learning-content/blocks/DX9ynlWCHo919lLwVloGeshKrP9mNBsq4y3YxMoR.png', 11, '2026-06-08 00:44:11', '2026-06-08 00:44:11'),
(219, 3, 10, 'text', NULL, '<p class=\"ql-align-justify\">Langkah-langkah nyahsulit adalah seperti berikut. </p><p class=\"ql-align-justify\"><br></p><ol><li class=\"ql-align-justify\">Teks sifer yang telah disulitkan akan dinyahsulit menggunakan satu kunci dan algoritma nyahsulit. </li><li class=\"ql-align-justify\">Teks sifer akan menjadi teks biasa. </li><li class=\"ql-align-justify\">Penerima akan menerima teks biasa yang dapat dibaca.</li></ol>', NULL, NULL, 12, '2026-06-08 00:44:11', '2026-06-08 00:44:11'),
(220, 3, 10, 'text', NULL, '<h2>2.1.3 Menghasil dan Menterjemah Mesej Menggunakan Kaedah Sifer</h2><p><br></p><p class=\"ql-align-justify\">Julius Caesar telah memperkenalkan satu kaedah sifer sekitar 100 tahun Sebelum Masihi (SM). Sifer yang dicipta oleh Julius Caesar ini bertujuan untuk menghantar mesej dan pesanan kepada semua pegawainya dengan menggunakan huruf ketiga daripada huruf-huruf Roman yang asal. Selain itu, kod Morse juga dibangunkan sebagai suatu sifer. Kod Morse menggunakan telegraf untuk menghantar pesanan semasa peperangan. Sebuah mesin yang dikenali sebagai Enigma, iaitu mesin yang menggunakan sistem sifer dan kunci yang sangat kompleks telah digunakan semasa Perang Dunia ke-2. Kesemua contoh ini menggunakan kaedah sifer untuk menghantar mesej kepada penerima tanpa diketahui oleh pihak lain. </p><p class=\"ql-align-justify\"><br></p><p class=\"ql-align-justify\">Dalam topik ini, kita akan mempelajari cara-cara untuk menghasilkan dan menterjemah mesej menggunakan kaedah sifer. Kaedah-kaedah sifer yang akan dipelajari adalah seperti ditunjukkan dalam Rajah 2.5.</p>', NULL, NULL, 13, '2026-06-08 00:44:11', '2026-06-08 00:44:11'),
(221, 3, 10, 'image', NULL, NULL, NULL, 'learning-content/blocks/qJJTaFscKKBSO89KsnuCV1Cf0QAVw9B0hfBK1WxA.png', 14, '2026-06-08 00:44:11', '2026-06-08 00:44:11'),
(222, 3, 10, 'text', NULL, '<p>(i) <em>Reverse cipher</em></p><p><br></p><p class=\"ql-align-justify\"><em>Reverse cipher</em> ialah satu kaedah sifer yang paling mudah. Hal ini demikian kerana kaedah ini menggunakan cara songsangan untuk menyulitkan mesej. Terdapat tiga jenis <em>Reverse cipher</em>. Jadual 2.1 menunjukkan cara-cara dan penerangan kepada tiga jenis <em>Reverse cipher</em>.</p>', NULL, NULL, 15, '2026-06-08 00:44:11', '2026-06-08 00:44:11'),
(223, 3, 10, 'image', NULL, NULL, NULL, 'learning-content/blocks/lNZVifBAfM9tJIA8tLiRWOWpoc4SBM363ijlKVcM.png', 16, '2026-06-08 00:44:11', '2026-06-08 00:44:11'),
(224, 3, 10, 'text', NULL, '<p>(ii) <em>Substitution cipher</em></p><p><br></p><p>Dalam <em>Substitution cipher</em>, mesej disulitkan dengan menggantikan satu unit teks biasa dengan satu unit teks yang lain (sifer). Satu unit bermaksud satu abjad, pasangan abjad atau kumpulan abjad. Rajah 2.6 menunjukkan dua contoh <em>Substitution cipher.</em></p><p><em><span class=\"ql-cursor\">﻿</span></em></p>', NULL, NULL, 17, '2026-06-08 00:44:11', '2026-06-08 00:44:11'),
(225, 3, 10, 'image', NULL, NULL, NULL, 'learning-content/blocks/a2fPpJ73LWnQC8di2KoPkLs1nF2jdKJ0U2thZodl.png', 18, '2026-06-08 00:44:11', '2026-06-08 00:44:11'),
(226, 3, 10, 'text', NULL, '<p class=\"ql-align-justify\"><em>Monoalphabetic substitution</em> ialah jenis <em>Substitution cipher</em> yang paling mudah. <em>Caesar Cipher</em> dan <em>Pigpen Cipher</em> terdiri daripada <em>monoalphabetic substitution</em> kerana proses penyulitan dilakukan dengan menggantikan setiap abjad teks biasa dengan abjad yang lain.</p><p class=\"ql-align-justify\"><br></p><ul><li class=\"ql-align-justify\"><em>Caesar Cipher</em></li></ul><p class=\"ql-align-justify\"><em>Caesar Cipher</em> ialah salah satu kaedah sifer yang paling awal digunakan oleh manusia untuk menyulitkan mesej. <em>Caesar Cipher</em> juga disebut <em>shift cipher</em> (sifer anjakan). Penyulitan teks biasa (<em>plaintext</em>) dilakukan dengan menggantikan setiap abjad dalam teks itu dengan abjad yang lain dalam susunan abjad, iaitu dengan menganjakkan abjad dalam susunan abjad. Bilangan anjakan ini dikenali sebagai kunci dan boleh diwakili dengan sebarang simbol. Contohnya, K = 5 bermaksud anjakan sebanyak lima tempat ke kanan dilakukan pada senarai abjad. Rajah 2.7 menunjukkan contoh anjakan K = 5.</p>', NULL, NULL, 19, '2026-06-08 00:44:11', '2026-06-08 00:44:11'),
(227, 3, 10, 'image', NULL, NULL, NULL, 'learning-content/blocks/WiTAkoG2DSwrTJBgD0NmpyOjrQMogYr05Og4QLe0.png', 20, '2026-06-08 00:44:11', '2026-06-08 00:44:11'),
(228, 3, 10, 'text', NULL, '<p class=\"ql-align-justify\">Maka, abjad ‘A’ dalam teks biasa akan digantikan dengan abjad ‘V’, abjad ‘B’ akan digantikan dengan abjad ‘W’ dan seterusnya. Pengirim mesej akan menentukan nilai K yang akan dijadikan sebagai kunci penyulitan.</p>', NULL, NULL, 21, '2026-06-08 00:44:11', '2026-06-08 00:44:11'),
(229, 3, 10, 'image', NULL, NULL, NULL, 'learning-content/blocks/yuV1F8JIBGlaqlA97y1YlhwcBm38HIjimYy3cR4z.png', 22, '2026-06-08 00:44:11', '2026-06-08 00:44:11'),
(230, 3, 10, 'youtube', NULL, NULL, 'https://www.youtube.com/watch?v=pCIOIZHuLsk', NULL, 23, '2026-06-08 00:44:11', '2026-06-08 00:44:11');

-- --------------------------------------------------------

--
-- Table structure for table `learning_content_prerequisites`
--

CREATE TABLE `learning_content_prerequisites` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `learning_content_id` bigint(20) UNSIGNED NOT NULL,
  `prerequisite_learning_content_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `learning_content_prerequisites`
--

INSERT INTO `learning_content_prerequisites` (`id`, `learning_content_id`, `prerequisite_learning_content_id`, `created_at`, `updated_at`) VALUES
(1, 2, 1, '2026-06-01 04:26:12', '2026-06-01 04:26:12'),
(2, 3, 2, '2026-06-07 02:21:09', '2026-06-07 02:21:09');

-- --------------------------------------------------------

--
-- Table structure for table `learning_paths`
--

CREATE TABLE `learning_paths` (
  `pathID` bigint(20) UNSIGNED NOT NULL,
  `studentID` bigint(20) UNSIGNED NOT NULL,
  `pathName` varchar(255) NOT NULL,
  `complexityLevel` enum('Beginner','Intermediate','Advanced') NOT NULL DEFAULT 'Beginner',
  `isAdaptive` tinyint(1) NOT NULL DEFAULT 1 COMMENT 'True = AI-generated via Hugging Face API',
  `estimatedDuration` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Estimated duration in minutes',
  `currentProgress` float NOT NULL DEFAULT 0 COMMENT 'Completion percentage 0.00 to 100.00',
  `status` enum('Active','Completed','Paused') NOT NULL DEFAULT 'Active',
  `path_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`path_data`)),
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `learning_path_courses`
--

CREATE TABLE `learning_path_courses` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `pathID` bigint(20) UNSIGNED NOT NULL,
  `courseID` bigint(20) UNSIGNED NOT NULL,
  `order` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `learning_path_topics`
--

CREATE TABLE `learning_path_topics` (
  `pathTopicID` bigint(20) UNSIGNED NOT NULL,
  `pathID` bigint(20) UNSIGNED NOT NULL,
  `topicID` bigint(20) UNSIGNED NOT NULL,
  `orderIndex` int(10) UNSIGNED NOT NULL DEFAULT 1 COMMENT 'Order of this topic within the student learning path',
  `isCompleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Whether the student has completed this topic',
  `completedAt` timestamp NULL DEFAULT NULL COMMENT 'Timestamp when the student completed this topic'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2026_03_18_090154_add_google_id_to_users_table', 1),
(5, '2026_03_18_090556_create_personal_access_tokens_table', 1),
(6, '2026_04_16_181341_create_learning_contents_table', 1),
(7, '2026_04_20_103303_create_learning_paths_table', 1),
(8, '2026_04_20_113134_create_topics', 1),
(9, '2026_04_20_113243_create_learning_path_topics', 1),
(10, '2026_04_20_150000_create_learning_content_attachments_table', 1),
(11, '2026_04_22_000000_create_learning_content_blocks_table', 1),
(12, '2026_05_21_190241_create_enrollments_table', 1),
(13, '2026_05_31_000001_create_quizzes_table', 1),
(14, '2026_05_31_000002_create_coding_exercises_table', 1),
(15, '2026_05_31_000003_create_quiz_attempts_table', 1),
(16, '2026_05_31_000004_create_coding_exercise_attempts_table', 1),
(17, '2026_05_31_000005_create_learning_content_prerequisites_table', 1),
(18, '2026_06_09_120000_create_additional_learning_resources_table', 1);

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `quizzes`
--

CREATE TABLE `quizzes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `topic_id` bigint(20) UNSIGNED NOT NULL,
  `course_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `difficulty_level` enum('Beginner','Intermediate','Advanced') NOT NULL DEFAULT 'Beginner',
  `points` int(10) UNSIGNED NOT NULL DEFAULT 10,
  `questions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`questions`)),
  `is_published` tinyint(1) NOT NULL DEFAULT 0,
  `published_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `quiz_attempts`
--

CREATE TABLE `quiz_attempts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `quiz_id` bigint(20) UNSIGNED NOT NULL,
  `student_id` bigint(20) UNSIGNED NOT NULL,
  `answers` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`answers`)),
  `score` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `max_score` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `passed` tinyint(1) NOT NULL DEFAULT 0,
  `feedback` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`feedback`)),
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('mHW77oPKkcl5Rc1o8z0gDqqwemlnceftjTFlRF72', 3, '127.0.0.1', 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36', 'YTo0OntzOjY6Il90b2tlbiI7czo0MDoiTTcyODFPaXJlNHJVU3FIQ1RtVkhQak9PeDB1Vk1ram1wMWlHNlJ1RCI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319czo1MDoibG9naW5fd2ViXzU5YmEzNmFkZGMyYjJmOTQwMTU4MGYwMTRjN2Y1OGVhNGUzMDk4OWQiO2k6MztzOjk6Il9wcmV2aW91cyI7YToxOntzOjM6InVybCI7czo0MDoiaHR0cDovLzEyNy4wLjAuMTo4MDAwL3N0dWRlbnQvZW5yb2xsbWVudCI7fX0=', 1781020476);

-- --------------------------------------------------------

--
-- Table structure for table `topics`
--

CREATE TABLE `topics` (
  `topicID` bigint(20) UNSIGNED NOT NULL,
  `courseID` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `prerequisites` varchar(255) DEFAULT NULL COMMENT 'Comma-separated topicIDs required before this topic',
  `difficultyLevel` enum('Beginner','Intermediate','Advanced') NOT NULL DEFAULT 'Beginner',
  `orderIndex` int(10) UNSIGNED NOT NULL DEFAULT 1 COMMENT 'Order of topic within a course',
  `isActive` tinyint(1) NOT NULL DEFAULT 1 COMMENT 'Whether topic is published and visible',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `topics`
--

INSERT INTO `topics` (`topicID`, `courseID`, `name`, `description`, `prerequisites`, `difficultyLevel`, `orderIndex`, `isActive`, `created_at`, `updated_at`) VALUES
(1, 1, 'Bab 1: Asas Pemikiran Komputasional', '<p><em>Tahukah anda semasa mereka bentuk langkah-langkah membuat popia basah, anda telah menerapkan konsep yang diperlukan dalam pemikiran komputasional?&nbsp;</em></p>', NULL, 'Beginner', 1, 1, '2026-05-31 01:20:23', '2026-05-31 01:22:11'),
(2, 1, 'Bab 2: Perwakilan Data', '<p class=\"ql-align-justify\">Tahukah anda bahawa imej daripada kamera digital boleh digunakan untuk menghasilkan pelbagai persembahan digital dan cetakan? Bolehkah anda gunakan fail imej dari laman sesawang untuk kegunaan yang sama?</p>', NULL, 'Beginner', 2, 1, '2026-05-31 22:10:03', '2026-05-31 22:10:03'),
(3, 1, 'Bab 3: Algoritma', '<p class=\"ql-align-justify\">Dalam bab ini, anda akan mempelajari mengenai algoritma dan cara menulis pseudokod dan carta alir yang melibatkan pelbagai pilihan dan ulangan.</p>', NULL, 'Beginner', 3, 1, '2026-05-31 22:50:34', '2026-05-31 22:50:34'),
(4, 1, 'Bab 4: Kod Arahan', '<p class=\"ql-align-justify\">Tahukah anda bahawa ada sebuah hotel yang dikendalikan sepenuhnya oleh robot? Bagaimanakah robot-robot ini menjalankan tugas seperti manusia?</p>', NULL, 'Beginner', 4, 1, '2026-05-31 22:58:47', '2026-05-31 22:58:47'),
(5, 2, 'Bab 1: Perwakilan Data', '<p class=\"ql-align-justify\">Kebanyakan sistem komputer moden beroperasi dengan sistem pengendalian 32 bit atau 64 bit. Sistem pengendalian 32 bit bermaksud sistem komputer berupaya mengendalikan 32 bit data pada masa yang sama. Bayangkan perwakilan data 32 bit dengan menggunakan nombor perduaan, perwakilan data ini adalah panjang dan susah dibaca. Sistem nombor perlapanan dan sistem nombor perenambelasan dicipta bagi mengatasi masalah ini.</p>', NULL, 'Beginner', 1, 1, '2026-06-02 04:22:53', '2026-06-02 04:22:53'),
(6, 2, 'Bab 2: Algoritma', '<p>Dalam kehidupan seharian, kita selalu menyaksikan dan mengalami banyak situasi yang melibatkan pilihan dan ulangan. Baca situasi-situasi yang disenaraikan. Setiap satunya dapat dihubungkaitkan dengan algoritma dan struktur kawalan yang akan anda pelajari dalam bab ini. Berdasarkan situasi-situasi yang disenaraikan, terangkan algoritma yang terlibat. Bolehkah anda memberi contoh-contoh lain dalam kehidupan seharian yang melibatkan langkah ulangan dan pilihan?</p><p><br></p><ol><li>Dalam perlumbaan kereta profesional bertaraf dunia, Formula One (F1), para peserta perlu memandu di litar berdasarkan pusingan yang telah ditetapkan.</li><li>Lampu isyarat yang terdapat di jalan-jalan raya akan sentiasa berulang menunjukkan lampu merah, kuning dan hijau untuk mengurus trafik. Perhatikan juga butang melintas jalan yang terdapat pada tiang lampu isyarat. Jika butang itu ditekan, ulangan lampu isyarat akan terganggu bagi membenarkan pejalan kaki melintas jalan.</li></ol>', NULL, 'Beginner', 2, 1, '2026-06-07 01:16:19', '2026-06-07 01:16:19'),
(7, 2, 'Bab 3: Kod Arahan', '<p class=\"ql-align-justify\">Teknologi telah mengubah cara kita berbelanja. Pembangunan sistem Radio-Frequency IDentification (RFID) menjadikan proses pembelian di pasar raya menjadi lebih mudah, teratur dan tanpa tunai (cashless). Teknologi RFID yang menggunakan tag pintar mampu menyimpan lebih banyak maklumat tentang barangan dan boleh dikesan melalui frekuensi radio. Barangan yang dilabel dengan tag RFID akan dikesan oleh terminal seperti troli pintar, rak barangan pintar, kaunter keluar dan sistem inventori.</p>', NULL, 'Beginner', 3, 1, '2026-06-07 02:06:32', '2026-06-07 02:06:32'),
(8, 3, 'Bab 1: Asas Pemikiran Komputasional', '<p class=\"ql-align-justify\">Pemikiran komputasional telah membantu manusia bagi menyelesaikan masalah secara sistematik. Selaras dengan perkembangan teknologi yang pesat, konsep pemikiran komputasional perlu diberi penekanan yang serius malah ilmu pengaturcaraan juga perlu dikuasai dengan baik bagi melahirkan generasi pencipta teknologi yang unggul.</p>', NULL, 'Beginner', 1, 1, '2026-06-07 02:56:07', '2026-06-07 02:56:07'),
(9, 3, 'Bab 3: Algoritma', '<p class=\"ql-align-justify\">Keluarga Encik Fong sedang membuat persiapan untuk pergi bercuti ke Kundasang, Sabah. Mereka perlu menempah tiket kapal terbang dari Kuala Lumpur ke Kota Kinabalu. Mereka juga perlu menempah bilik hotel di Kundasang. Bagaimanakah apps (aplikasi) dalam telefon pintar dapat membantu keluarga Encik Fong untuk menempah tiket kapal terbang dan bilik hotel?</p>', NULL, 'Beginner', 2, 1, '2026-06-08 00:11:39', '2026-06-08 00:11:39'),
(10, 3, 'Bab 2: Perwakilan Data', '<p class=\"ql-align-justify\">Sejak zaman purba hingga zaman moden, kriptografi telah digunakan oleh manusia untuk menjaga privasi mesej yang ingin dihantar. Pelbagai kaedah sifer diwujudkan untuk menjamin keselamatan data dan memastikan mesej hanya dapat dibaca dan difahami oleh penerimanya.</p>', NULL, 'Beginner', 3, 1, '2026-06-08 00:44:11', '2026-06-08 00:44:11');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('student','teacher','administrator') NOT NULL DEFAULT 'student',
  `points` bigint(20) UNSIGNED NOT NULL,
  `streak_days` int(10) UNSIGNED NOT NULL,
  `last_quiz_date` date NOT NULL,
  `badges` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`badges`)),
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `google_id` varchar(255) DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `email_verified_at`, `password`, `role`, `points`, `streak_days`, `last_quiz_date`, `badges`, `remember_token`, `created_at`, `updated_at`, `google_id`, `avatar`) VALUES
(1, 'Admin', 'admin@gmail.com', '2026-05-31 00:36:17', '$2y$12$Ss1zAUyV16Az.ah5xRhCqezg9d1wmdI4aulEL857rrzthf.jOh5VK', 'administrator', 0, 0, '0000-00-00', NULL, '0u4FQEwhwsBlb3ni88V5fAX4A1P7GlbfU6JIbOzMNhBkyJ8fNTp9qa4AkhyC', '2026-05-31 00:36:17', '2026-05-31 00:36:17', NULL, NULL),
(2, 'Razak', 'razak@gmail.com', '2026-05-31 00:36:17', '$2y$12$eWgJ2o942KkHlT.Ec2mxX.5Cdn54yyqsDrTedPHZBFW4eodDDCwji', 'teacher', 0, 0, '0000-00-00', NULL, 'peslkiyGg4', '2026-05-31 00:36:17', '2026-05-31 00:36:17', NULL, NULL),
(3, 'Ahmad', 'ahmad@gmail.com', '2026-05-31 00:36:18', '$2y$12$iPbXfoJ.Dj3lY8eN2C3UbeL8nqLQsM53tyjDUIZhzmezXmmEq14/a', 'student', 0, 0, '0000-00-00', NULL, 'Qkq9CixAq8QIVVyDjWWetLtMpWtPpHEkdzkGf9ayiatJf5vIChSvQsMy9G4i', '2026-05-31 00:36:18', '2026-05-31 00:36:18', NULL, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `additional_learning_resources`
--
ALTER TABLE `additional_learning_resources`
  ADD PRIMARY KEY (`id`),
  ADD KEY `additional_learning_resources_topic_id_index` (`topic_id`),
  ADD KEY `additional_learning_resources_course_id_index` (`course_id`),
  ADD KEY `additional_learning_resources_created_by_index` (`created_by`);

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `coding_exercises`
--
ALTER TABLE `coding_exercises`
  ADD PRIMARY KEY (`id`),
  ADD KEY `coding_exercises_course_id_is_published_index` (`course_id`,`is_published`);

--
-- Indexes for table `coding_exercise_attempts`
--
ALTER TABLE `coding_exercise_attempts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `coding_exercise_attempts_student_id_foreign` (`student_id`),
  ADD KEY `coding_exercise_attempts_coding_exercise_id_student_id_index` (`coding_exercise_id`,`student_id`);

--
-- Indexes for table `enrollments`
--
ALTER TABLE `enrollments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `enrollments_studentid_courseid_unique` (`studentID`,`courseID`),
  ADD KEY `enrollments_courseid_foreign` (`courseID`),
  ADD KEY `enrollments_pathid_foreign` (`pathID`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `learning_contents`
--
ALTER TABLE `learning_contents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `learning_contents_parent_id_foreign` (`parent_id`);

--
-- Indexes for table `learning_content_attachments`
--
ALTER TABLE `learning_content_attachments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `learning_content_attachments_learning_content_id_foreign` (`learning_content_id`),
  ADD KEY `learning_content_attachments_topic_id_foreign` (`topic_id`);

--
-- Indexes for table `learning_content_blocks`
--
ALTER TABLE `learning_content_blocks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `learning_content_blocks_learning_content_id_foreign` (`learning_content_id`),
  ADD KEY `learning_content_blocks_topic_id_foreign` (`topic_id`);

--
-- Indexes for table `learning_content_prerequisites`
--
ALTER TABLE `learning_content_prerequisites`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `lcp_unique_content_prerequisite` (`learning_content_id`,`prerequisite_learning_content_id`),
  ADD KEY `lcp_content_idx` (`learning_content_id`),
  ADD KEY `lcp_prereq_idx` (`prerequisite_learning_content_id`);

--
-- Indexes for table `learning_paths`
--
ALTER TABLE `learning_paths`
  ADD PRIMARY KEY (`pathID`),
  ADD KEY `learning_paths_studentid_foreign` (`studentID`);

--
-- Indexes for table `learning_path_courses`
--
ALTER TABLE `learning_path_courses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `learning_path_courses_pathid_courseid_unique` (`pathID`,`courseID`),
  ADD KEY `learning_path_courses_courseid_foreign` (`courseID`),
  ADD KEY `learning_path_courses_pathid_order_index` (`pathID`,`order`);

--
-- Indexes for table `learning_path_topics`
--
ALTER TABLE `learning_path_topics`
  ADD PRIMARY KEY (`pathTopicID`),
  ADD UNIQUE KEY `learning_path_topics_pathid_topicid_unique` (`pathID`,`topicID`),
  ADD KEY `learning_path_topics_topicid_foreign` (`topicID`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  ADD KEY `personal_access_tokens_expires_at_index` (`expires_at`);

--
-- Indexes for table `quizzes`
--
ALTER TABLE `quizzes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `quizzes_topic_id_is_published_index` (`topic_id`,`is_published`),
  ADD KEY `quizzes_course_id_is_published_index` (`course_id`,`is_published`);

--
-- Indexes for table `quiz_attempts`
--
ALTER TABLE `quiz_attempts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `quiz_attempts_student_id_foreign` (`student_id`),
  ADD KEY `quiz_attempts_quiz_id_student_id_index` (`quiz_id`,`student_id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `topics`
--
ALTER TABLE `topics`
  ADD PRIMARY KEY (`topicID`),
  ADD KEY `topics_courseid_foreign` (`courseID`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`),
  ADD UNIQUE KEY `users_google_id_unique` (`google_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `additional_learning_resources`
--
ALTER TABLE `additional_learning_resources`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `coding_exercises`
--
ALTER TABLE `coding_exercises`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `coding_exercise_attempts`
--
ALTER TABLE `coding_exercise_attempts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `enrollments`
--
ALTER TABLE `enrollments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `learning_contents`
--
ALTER TABLE `learning_contents`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `learning_content_attachments`
--
ALTER TABLE `learning_content_attachments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `learning_content_blocks`
--
ALTER TABLE `learning_content_blocks`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=231;

--
-- AUTO_INCREMENT for table `learning_content_prerequisites`
--
ALTER TABLE `learning_content_prerequisites`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `learning_paths`
--
ALTER TABLE `learning_paths`
  MODIFY `pathID` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `learning_path_courses`
--
ALTER TABLE `learning_path_courses`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `learning_path_topics`
--
ALTER TABLE `learning_path_topics`
  MODIFY `pathTopicID` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `quizzes`
--
ALTER TABLE `quizzes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `quiz_attempts`
--
ALTER TABLE `quiz_attempts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `topics`
--
ALTER TABLE `topics`
  MODIFY `topicID` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `additional_learning_resources`
--
ALTER TABLE `additional_learning_resources`
  ADD CONSTRAINT `additional_learning_resources_course_id_foreign` FOREIGN KEY (`course_id`) REFERENCES `learning_contents` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `additional_learning_resources_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `additional_learning_resources_topic_id_foreign` FOREIGN KEY (`topic_id`) REFERENCES `topics` (`topicID`) ON DELETE CASCADE;

--
-- Constraints for table `coding_exercises`
--
ALTER TABLE `coding_exercises`
  ADD CONSTRAINT `coding_exercises_course_id_foreign` FOREIGN KEY (`course_id`) REFERENCES `learning_contents` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `coding_exercise_attempts`
--
ALTER TABLE `coding_exercise_attempts`
  ADD CONSTRAINT `coding_exercise_attempts_coding_exercise_id_foreign` FOREIGN KEY (`coding_exercise_id`) REFERENCES `coding_exercises` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `coding_exercise_attempts_student_id_foreign` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `enrollments`
--
ALTER TABLE `enrollments`
  ADD CONSTRAINT `enrollments_courseid_foreign` FOREIGN KEY (`courseID`) REFERENCES `learning_contents` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `enrollments_pathid_foreign` FOREIGN KEY (`pathID`) REFERENCES `learning_paths` (`pathID`) ON DELETE SET NULL,
  ADD CONSTRAINT `enrollments_studentid_foreign` FOREIGN KEY (`studentID`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `learning_contents`
--
ALTER TABLE `learning_contents`
  ADD CONSTRAINT `learning_contents_parent_id_foreign` FOREIGN KEY (`parent_id`) REFERENCES `learning_contents` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `learning_content_attachments`
--
ALTER TABLE `learning_content_attachments`
  ADD CONSTRAINT `learning_content_attachments_learning_content_id_foreign` FOREIGN KEY (`learning_content_id`) REFERENCES `learning_contents` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `learning_content_attachments_topic_id_foreign` FOREIGN KEY (`topic_id`) REFERENCES `topics` (`topicID`) ON DELETE CASCADE;

--
-- Constraints for table `learning_content_blocks`
--
ALTER TABLE `learning_content_blocks`
  ADD CONSTRAINT `learning_content_blocks_learning_content_id_foreign` FOREIGN KEY (`learning_content_id`) REFERENCES `learning_contents` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `learning_content_blocks_topic_id_foreign` FOREIGN KEY (`topic_id`) REFERENCES `topics` (`topicID`) ON DELETE CASCADE;

--
-- Constraints for table `learning_content_prerequisites`
--
ALTER TABLE `learning_content_prerequisites`
  ADD CONSTRAINT `lcp_content_fk` FOREIGN KEY (`learning_content_id`) REFERENCES `learning_contents` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `lcp_prereq_fk` FOREIGN KEY (`prerequisite_learning_content_id`) REFERENCES `learning_contents` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `learning_paths`
--
ALTER TABLE `learning_paths`
  ADD CONSTRAINT `learning_paths_studentid_foreign` FOREIGN KEY (`studentID`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `learning_path_courses`
--
ALTER TABLE `learning_path_courses`
  ADD CONSTRAINT `learning_path_courses_courseid_foreign` FOREIGN KEY (`courseID`) REFERENCES `learning_contents` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `learning_path_courses_pathid_foreign` FOREIGN KEY (`pathID`) REFERENCES `learning_paths` (`pathID`) ON DELETE CASCADE;

--
-- Constraints for table `learning_path_topics`
--
ALTER TABLE `learning_path_topics`
  ADD CONSTRAINT `learning_path_topics_pathid_foreign` FOREIGN KEY (`pathID`) REFERENCES `learning_paths` (`pathID`) ON DELETE CASCADE,
  ADD CONSTRAINT `learning_path_topics_topicid_foreign` FOREIGN KEY (`topicID`) REFERENCES `topics` (`topicID`) ON DELETE CASCADE;

--
-- Constraints for table `quizzes`
--
ALTER TABLE `quizzes`
  ADD CONSTRAINT `quizzes_topic_id_foreign` FOREIGN KEY (`topic_id`) REFERENCES `topics` (`topicID`) ON DELETE CASCADE;

--
-- Constraints for table `quiz_attempts`
--
ALTER TABLE `quiz_attempts`
  ADD CONSTRAINT `quiz_attempts_quiz_id_foreign` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `quiz_attempts_student_id_foreign` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `topics`
--
ALTER TABLE `topics`
  ADD CONSTRAINT `topics_courseid_foreign` FOREIGN KEY (`courseID`) REFERENCES `learning_contents` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
