-- MySQL dump 10.13  Distrib 8.0.32, for Linux (x86_64)
--
-- Host: localhost    Database: eventsphere
-- ------------------------------------------------------
-- Server version	8.0.32-0ubuntu0.22.04.2

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `BlacklistedTokens`
--

DROP TABLE IF EXISTS `BlacklistedTokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `BlacklistedTokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `token` text NOT NULL,
  `blacklisted_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `BlacklistedTokens`
--

LOCK TABLES `BlacklistedTokens` WRITE;
/*!40000 ALTER TABLE `BlacklistedTokens` DISABLE KEYS */;
INSERT INTO `BlacklistedTokens` VALUES (1,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzgsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0OTYzMzE5NiwiZXhwIjoxNzUwMjM3OTk2fQ.wZHpQO0DNX7zk-z-1JiOYDuXipy0NR34FIMr5GKMboY','2025-06-11 09:13:40'),(2,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzksInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzQ5NjU0MDk1LCJleHAiOjE3NTAyNTg4OTV9.IlVSuPmivKnykfh5PKaEJc27tZoKbpfFKWi6WQ64nvs','2025-06-11 15:19:09'),(3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzksInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzQ5NjU1MTgwLCJleHAiOjE3NTAyNTk5ODB9.pjM67gEPNXUHDQYBfqhsTKQNbGFSuiXfjZUtWfGnlps','2025-06-11 15:19:44'),(4,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzksInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzQ5NjU1MjAyLCJleHAiOjE3NTAyNjAwMDJ9.214_M8hBB0C1bbfpM8Lf3eX1k6U6r-Nqg_zZTppDqGQ','2025-06-11 15:20:05'),(5,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzksInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzQ5NjU1ODg2LCJleHAiOjE3NTAyNjA2ODZ9.czRmH1wXlsPjvLzyhpyN3WKUjiV0ATzNdTXLDrJqS7A','2025-06-11 15:31:31'),(6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzksInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzQ5NjU2MDE1LCJleHAiOjE3NTAyNjA4MTV9.UDGbNsMYT0cTr3oQu9WO-D2MeYzeFsCq9tZARZ8nDOE','2025-06-11 15:33:41'),(7,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzksInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzQ5NjU2MTAxLCJleHAiOjE3NTAyNjA5MDF9.u2AewWgtbkQ2o4suhoLqDeCHtBMDcuDDEiGmekxGGU0','2025-06-11 15:35:07'),(8,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzksInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzQ5NjU2ODQ4LCJleHAiOjE3NTAyNjE2NDh9.Oc0EFfJYAwKH7rnBW_91gEXkArUSePjopFs_IehNQ4g','2025-06-11 15:47:33'),(9,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzksInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzQ5NjU2ODc1LCJleHAiOjE3NTAyNjE2NzV9.O1jRX0Q2p1mcLDLWHjhOVl6NfgXxqrDpYIwNc6urHUI','2025-06-11 15:48:14'),(10,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzksInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzQ5NjU3MDAyLCJleHAiOjE3NTAyNjE4MDJ9.ChIb0Ief-BB_SrP8YeV0-13EpZeav8-6Istrm6DMEHs','2025-06-11 15:50:09'),(11,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzksInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzQ5NjU3MDgxLCJleHAiOjE3NTAyNjE4ODF9.PN7NziqMiNHnC3Ugupw7Q49h6OkXRr9FNimlP_3jDIU','2025-06-11 15:51:27'),(12,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzksInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzQ5NjU3MTAyLCJleHAiOjE3NTAyNjE5MDJ9.6W1nX7NgVm1XbcjnOJe8nXdv_rsO4NLDPnAtBfZNhV4','2025-06-11 15:51:48'),(13,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzksInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzQ5NjU3MjUwLCJleHAiOjE3NTAyNjIwNTB9.es-mMmmJZeHq-i5FRs5uc9UtsU-JS1NCkSF3JREyPO4','2025-06-11 15:54:19'),(14,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzksInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzQ5NjU3NDU2LCJleHAiOjE3NTAyNjIyNTZ9._QRbM6lPI3lGKs_AntDK9AMK0jpQXs4pDHTEDKS77d4','2025-06-11 15:57:40'),(15,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzksInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzQ5NjU3NDczLCJleHAiOjE3NTAyNjIyNzN9.4OQ7PUWnjyORrl44H5UVBCmLkexMlL-XafEafAg9UrM','2025-06-11 15:58:02'),(16,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzksInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzQ5NjU3NjAzLCJleHAiOjE3NTAyNjI0MDN9.ZkkYqwJJwdO1ply9vWjztCzFBjDMZ-k_K3IcrbiNMbo','2025-06-11 16:00:12'),(17,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzksInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzQ5NjU3NjkwLCJleHAiOjE3NTAyNjI0OTB9.E_YF9YBKgAg8L_utVz2PcHO8BmowVx7WYduwZDqjKZM','2025-06-11 16:01:40'),(18,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzksInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzQ5NjU3ODE4LCJleHAiOjE3NTAyNjI2MTh9.wz6L6D_LWE5avWKnSbZ4oYjZJXVHENrkJSB6kjhWw3Y','2025-06-11 16:03:44'),(19,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzksInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzQ5NjU3ODU2LCJleHAiOjE3NTAyNjI2NTZ9.Gs-C0VNauS1qJSrzJ4XPk3TlTyEpgFnz6Zsc50W3EWA','2025-06-11 16:04:30'),(20,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzksInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzQ5NjU3ODk2LCJleHAiOjE3NTAyNjI2OTZ9.x7hZk7AJBTcBcscdgH23d9jPjZTMRycQliI31VVS710','2025-06-11 16:05:02'),(21,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzksInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzQ5NjU4Mzg5LCJleHAiOjE3NTAyNjMxODl9.aHk2rW9iSKgX2guJVsj4y-zKKckFHpP3ddArB8vuz5c','2025-06-11 16:19:07'),(22,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NDAsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0OTY1ODc3MCwiZXhwIjoxNzUwMjYzNTcwfQ.bg2iuJwhd62bcnn-TlgCjEtnQmADH1jmxOvSH-VL8vU','2025-06-11 16:29:22'),(23,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzksInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzQ5NjYwMDkyLCJleHAiOjE3NTAyNjQ4OTJ9.0mzBxYk34k8M8QFi_aAATzAzO0mZ2B6nF9SPWfTNsAs','2025-06-11 17:18:32'),(24,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NDAsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0OTY2MjMzNSwiZXhwIjoxNzUwMjY3MTM1fQ.muTtJDuzJRFONDN78R6H2RlNmz5ImQBPwDJoh1ToLMc','2025-06-11 17:19:29'),(25,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzksInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzQ5NjY2MDAzLCJleHAiOjE3NTAyNzA4MDN9.qPHAAwFGiB76FPAmXTV8cSOI-7NfahSTGFVA_1WgXes','2025-06-11 18:20:18'),(26,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzksInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzQ5NjY2MDAzLCJleHAiOjE3NTAyNzA4MDN9.qPHAAwFGiB76FPAmXTV8cSOI-7NfahSTGFVA_1WgXes','2025-06-11 18:20:18'),(27,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzksInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzQ5NjY2MDQ4LCJleHAiOjE3NTAyNzA4NDh9.k1N9oJws1fCBGiTInyYVLPPORvfbewYpPMcji0YWvNY','2025-06-11 18:20:59'),(28,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzksInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzQ5NjY2MDc0LCJleHAiOjE3NTAyNzA4NzR9.RmYc_jx7qNNSYv9ihaYV6baBxwGknadaJ0S77pD6kx8','2025-06-11 18:30:59'),(29,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzksInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzQ5NjY2MDc0LCJleHAiOjE3NTAyNzA4NzR9.RmYc_jx7qNNSYv9ihaYV6baBxwGknadaJ0S77pD6kx8','2025-06-11 18:30:59'),(30,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzksInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzQ5NzExNDQwLCJleHAiOjE3NTAzMTYyNDB9.hnGhWiIy67NxLVnKnC8cPi9sBByKuCdjizzYt0Ronns','2025-06-12 07:15:20'),(31,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzksInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzQ5NzEyNTM0LCJleHAiOjE3NTAzMTczMzR9.fuN03bFmqOsMqGN6v7yZVg2GoLL7Vcv0z-U3Kkvz6Mg','2025-06-12 08:54:10'),(32,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzksInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzQ5NzE4NDc0LCJleHAiOjE3NTAzMjMyNzR9.Oo6ZX1VhckBCP2yAVwWWU5vVEOasP1SBFj7_dBNZOUw','2025-06-12 08:54:52'),(33,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzksInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzQ5NzE4NTA3LCJleHAiOjE3NTAzMjMzMDd9.kDIL-DHFhDqUfhYQdJUklvs2_V12uzLHeFMHO-yKPII','2025-06-12 09:29:15'),(34,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzksInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzQ5NzIwNTY5LCJleHAiOjE3NTAzMjUzNjl9.q-2tsC4oeGMODr_oSuMN61QG9Jn7y4lC0UFKYt_cMng','2025-06-12 09:29:36'),(35,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzksInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzQ5NzIwNTg5LCJleHAiOjE3NTAzMjUzODl9.aX7W6YarTQhtAF1WiDBaJpSTu8ZPIXkjTIQFaDGvO-E','2025-06-12 10:18:04'),(36,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NDAsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0OTcyNTI3OCwiZXhwIjoxNzUwMzMwMDc4fQ.t1SKqCrrO6fSz5DpYAuMvfkgIccVaAEqN7jk8Oer2aE','2025-06-12 10:52:37');
/*!40000 ALTER TABLE `BlacklistedTokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `SavedEvents`
--

DROP TABLE IF EXISTS `SavedEvents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `SavedEvents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `event_id` varchar(255) NOT NULL,
  `event_data` json NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `tags` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`,`event_id`),
  CONSTRAINT `SavedEvents_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `SavedEvents`
--

LOCK TABLES `SavedEvents` WRITE;
/*!40000 ALTER TABLE `SavedEvents` DISABLE KEYS */;
INSERT INTO `SavedEvents` VALUES (7,38,'ZFwVzcymWZ17AUFz','{\"name\": \"Esha Tewari ‘You Were Mine’ Tour\", \"address\": {\"line1\": \"68 North Terrace\"}}','2025-06-11 10:14:55',NULL),(10,39,'neon-dreams-1749658264210','{\"date\": \"12 June 2025\", \"name\": \"Neon Dreams\", \"image\": \"https://s1.ticketm.net/dam/c/fbc/b293c0ad-c904-4215-bc59-8d7f2414dfbc_106141_EVENT_DETAIL_PAGE_16_9.jpg\", \"location\": \"                 Sydney, Australia\\n            \", \"platform\": \"Ticketmaster\", \"ticketUrl\": \"https://www.universe.com/events/neon-dreams-tickets-C5S1TZ?ref=ticketmaster\"}','2025-06-11 16:11:04','Music'),(15,39,'imaginator-1749726307200','{\"date\": \"12 June 2025\", \"name\": \"IMAGINATOR\", \"image\": \"https://s1.ticketm.net/dam/a/0f4/61fe1066-ec74-4929-ad60-21931f75c0f4_TABLET_LANDSCAPE_LARGE_16_9.jpg\", \"location\": \"                 Docklands, Australia\\n            \", \"platform\": \"Ticketmaster\", \"ticketUrl\": \"1APZkaNGkeX2eze\"}','2025-06-12 11:05:07','Dance');
/*!40000 ALTER TABLE `SavedEvents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Users`
--

DROP TABLE IF EXISTS `Users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` varchar(255) DEFAULT NULL,
  `preferences` json DEFAULT NULL,
  `twoFactorSecret` varchar(255) DEFAULT NULL,
  `isTwoFactorEnabled` tinyint(1) DEFAULT '0',
  `avatar` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Users`
--

LOCK TABLES `Users` WRITE;
/*!40000 ALTER TABLE `Users` DISABLE KEYS */;
INSERT INTO `Users` VALUES (34,NULL,'test@123.com','$2b$10$mGe9ZAT8j25wuv6rY1kpxubI0TPRbj6IUQ6I7j40FQ2RRsB4P6wvK','user','{\"music\": \"true\"}',NULL,0,NULL),(35,NULL,'stuti@123.com','$2b$10$BFyR3LJKENbDh0nYsZPHCOjHShMoYkIT4UjKNXx2AKNCcbBsMNhTW','user','{\"music\": \"true\"}',NULL,0,NULL),(36,NULL,'stuti@gmail.com','$2b$12$XiaQ97.ijIlg3aRxodK2.O5fpxTyzaWZI1uo.weAtgUG2UoCBhFDu','admin','{\"theme\": \"dark\"}',NULL,0,'/uploads/avatar-1749484389606-97223258.jpg'),(37,'Stuti Nainwal','nainwalstuti14023@gmail.com','$2b$12$BLkekg3yvQrwH8QKPp9h/OKGgEwmgu2zrpBIqhBwOCzOuv.dIMPvi','user','{}','FR4UI3LJERUWWNTLF4VH2USHPM7WW6TEJFCDGVDJPBCD6QJOHNDQ',1,NULL),(38,NULL,'stutinainwal@gmail.com','$2b$12$tvMOsY11IXQWBA5Lzj/3ru.ReDxhlgQZO9tv7Vci/rlcvghGw1qvu','admin','{\"music\": \"true\"}',NULL,0,NULL),(39,'Stuti Nainwal','nainwalstuti140234@gmail.com','$2b$12$uT8zaYtdMG/tB7mqP2ouq.wMaB2282/hoBygVRXkFuzhcDDowo7Tu','user','{\"bio\": \"ssup\", \"phone\": \"0412965248\", \"location\": \"Adelaide\"}',NULL,0,'/uploads/avatar-1749658363072-837204963.jpg'),(40,'admin','admin123@gmail.com','$2b$12$PhqvzhjEeeWwCSKOI8tYHO8ul9ErX0JWDHNHeBywS2kiUqAEkT2vq','admin','{}',NULL,0,NULL),(41,NULL,'stutinainwal1@gmail.com','$2b$12$PRg8JNGCuM/6CHWI3l6cFenON0WAIiDeWx5aQJjf/CShtWeLVeXke','user','{\"music\": \"true\"}',NULL,0,NULL);
/*!40000 ALTER TABLE `Users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_logs`
--

DROP TABLE IF EXISTS `user_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) DEFAULT NULL,
  `action` varchar(50) DEFAULT NULL,
  `timestamp` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_logs`
--

LOCK TABLES `user_logs` WRITE;
/*!40000 ALTER TABLE `user_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_logs` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-12 11:11:46
