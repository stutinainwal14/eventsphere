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
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Users`
--

LOCK TABLES `Users` WRITE;
/*!40000 ALTER TABLE `Users` DISABLE KEYS */;
INSERT INTO `Users` VALUES (17,'stuti','dummydata2','$2b$10$uDXzxhz0.5j4j.7iSmsfFOwHaTsqhWDzjcE.ydsNLWUsLG4FUOCuO','user','{\"music\": \"true\"}','J5XUAQ2VH44VM3DLLZZGWLCULMTGIXRRJ5PFI4JMJQ4T4UZ4JU7A',1),(18,'stutid','dummydata23d','$2b$10$aS102ndCtWILMIuL66R1SuODWTOOhXG1pB1C7/beV17.yGBawkYry','user','{\"music\": \"true\"}',NULL,0),(19,'nainwal','nainwal','$2b$10$on44MzcY3SDAcx4pXR/6.upXILZo7h.xZ0/6qEVoQ3AgYGhDSumM2','user','{\"music\": \"true\"}',NULL,0),(20,'nainwal1','nainwal1','$2b$10$xpmnI3hcxKl3gnusX7m3J.vG1.QXdpfinlIiU8d.UREsjC8VOi.7u','user','{\"music\": \"true\"}','FYWFK2C3OBRW2RKMMIXG65L5LZXHKVTYNRCTSVZRLBBEYOTZMIXA',0),(21,NULL,'nainwal12','$2b$10$L1IEwcbvuF2e5KyohFpg.O4vpSbBOc9J3LXF05gEhyPAn34q6oPAW','user','{\"music\": \"true\"}','EV4GK33BNY7VKZKSJVTHSUSAGQSVMILXOAYV4KBPENPFIV3LLZBQ',1),(22,NULL,'nainwal123','$2b$10$iTMoWjRujVV6W1bshVO6G.ydZ8hLhNzsOjOONEceSifKVgutD2LTW','user','{\"music\": \"true\"}',NULL,0);
/*!40000 ALTER TABLE `Users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-05-12 18:11:23
