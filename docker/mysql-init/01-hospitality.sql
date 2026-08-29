-- MySQL dump 10.16  Distrib 10.1.37-MariaDB, for Win32 (AMD64)
--
-- Host: localhost    Database: hospitality
-- ------------------------------------------------------
-- Server version	10.1.37-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `ai_alerts`
--

DROP TABLE IF EXISTS `ai_alerts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ai_alerts` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `propertyId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `severity` enum('CRITICAL','HIGH','MEDIUM','LOW') COLLATE utf8mb4_unicode_ci NOT NULL,
  `module` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `isRead` tinyint(1) NOT NULL DEFAULT '0',
  `readAt` datetime(3) DEFAULT NULL,
  `actionUrl` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `metadata` longtext COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `ai_alerts_propertyId_isRead_idx` (`propertyId`,`isRead`),
  CONSTRAINT `ai_alerts_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `properties` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ai_alerts`
--

LOCK TABLES `ai_alerts` WRITE;
/*!40000 ALTER TABLE `ai_alerts` DISABLE KEYS */;
INSERT INTO `ai_alerts` VALUES ('alert_1','prop_grand_meridian','Weekend likely undersold','4 Deluxe rooms unsold for Sat ÔÇö AI suggests +12% rate cut on Fri to fill.','MEDIUM','revenue',0,NULL,NULL,NULL,'2026-07-22 23:58:56.724'),('alert_2','prop_grand_meridian','VIP arrival not pre-assigned','Platinum guest Rahul Gupta arrives in 3h; suite 501 not yet inspected.','HIGH','frontdesk',0,NULL,NULL,NULL,'2026-07-22 23:58:56.724');
/*!40000 ALTER TABLE `ai_alerts` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 /*!50003 TRIGGER `bi_ai_alerts`            BEFORE INSERT ON `ai_alerts`            FOR EACH ROW IF NEW.`id` IS NULL OR NEW.`id` = '' THEN SET NEW.`id` = UUID(); END IF */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `audit_logs` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `propertyId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `action` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entityId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `beforeState` longtext COLLATE utf8mb4_unicode_ci,
  `afterState` longtext COLLATE utf8mb4_unicode_ci,
  `ipAddress` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `userAgent` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `audit_logs_propertyId_entity_idx` (`propertyId`,`entity`),
  KEY `audit_logs_propertyId_createdAt_idx` (`propertyId`,`createdAt`),
  KEY `audit_logs_userId_idx` (`userId`),
  CONSTRAINT `audit_logs_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `properties` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `audit_logs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 /*!50003 TRIGGER `bi_audit_logs`           BEFORE INSERT ON `audit_logs`           FOR EACH ROW IF NEW.`id` IS NULL OR NEW.`id` = '' THEN SET NEW.`id` = UUID(); END IF */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `autopilot_config`
--

DROP TABLE IF EXISTS `autopilot_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `autopilot_config` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `propertyId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT '0',
  `lastRunAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ap_property` (`propertyId`),
  CONSTRAINT `ap_property_fk` FOREIGN KEY (`propertyId`) REFERENCES `properties` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `autopilot_config`
--

LOCK TABLES `autopilot_config` WRITE;
/*!40000 ALTER TABLE `autopilot_config` DISABLE KEYS */;
INSERT INTO `autopilot_config` VALUES ('353ba196-a897-48eb-b1b1-f7e0594446d5','prop_grand_meridian',0,NULL,'2026-08-16 13:43:00.920');
/*!40000 ALTER TABLE `autopilot_config` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 /*!50003 TRIGGER `bi_autopilot_config` BEFORE INSERT ON `autopilot_config` FOR EACH ROW
BEGIN IF NEW.id IS NULL OR NEW.id = '' THEN SET NEW.id = UUID(); END IF; END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `autopilot_runs`
--

DROP TABLE IF EXISTS `autopilot_runs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `autopilot_runs` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `propertyId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `applied` int(11) NOT NULL DEFAULT '0',
  `skipped` int(11) NOT NULL DEFAULT '0',
  `trigger` enum('SCHEDULED','MANUAL') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MANUAL',
  `summary` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `apr_property_idx` (`propertyId`),
  CONSTRAINT `apr_property_fk` FOREIGN KEY (`propertyId`) REFERENCES `properties` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `autopilot_runs`
--

LOCK TABLES `autopilot_runs` WRITE;
/*!40000 ALTER TABLE `autopilot_runs` DISABLE KEYS */;
/*!40000 ALTER TABLE `autopilot_runs` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 /*!50003 TRIGGER `bi_autopilot_runs` BEFORE INSERT ON `autopilot_runs` FOR EACH ROW
BEGIN IF NEW.id IS NULL OR NEW.id = '' THEN SET NEW.id = UUID(); END IF; END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `campaigns`
--

DROP TABLE IF EXISTS `campaigns`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `campaigns` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `propertyId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `segment` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `channel` enum('EMAIL','SMS','WHATSAPP') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'EMAIL',
  `subject` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `body` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `audienceCount` int(11) NOT NULL DEFAULT '0',
  `status` enum('DRAFT','SCHEDULED','SENT') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DRAFT',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `campaigns_propertyId_idx` (`propertyId`),
  CONSTRAINT `campaigns_property_fk` FOREIGN KEY (`propertyId`) REFERENCES `properties` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `campaigns`
--

LOCK TABLES `campaigns` WRITE;
/*!40000 ALTER TABLE `campaigns` DISABLE KEYS */;
/*!40000 ALTER TABLE `campaigns` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 /*!50003 TRIGGER `bi_campaigns` BEFORE INSERT ON `campaigns` FOR EACH ROW
BEGIN
  IF NEW.id IS NULL OR NEW.id = '' THEN SET NEW.id = UUID(); END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `cancellation_policies`
--

DROP TABLE IF EXISTS `cancellation_policies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cancellation_policies` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `propertyId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Standard',
  `freeCancellationHours` int(11) NOT NULL DEFAULT '48',
  `penaltyType` enum('NONE','FIRST_NIGHT','PERCENT','FULL') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'FIRST_NIGHT',
  `penaltyValue` decimal(5,2) NOT NULL DEFAULT '0.00',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `cxl_property` (`propertyId`),
  CONSTRAINT `cxl_property_fk` FOREIGN KEY (`propertyId`) REFERENCES `properties` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cancellation_policies`
--

LOCK TABLES `cancellation_policies` WRITE;
/*!40000 ALTER TABLE `cancellation_policies` DISABLE KEYS */;
INSERT INTO `cancellation_policies` VALUES ('cxl_default','prop_grand_meridian','Standard 48h',48,'FIRST_NIGHT',0.00,'2026-08-16 18:11:05.265');
/*!40000 ALTER TABLE `cancellation_policies` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 /*!50003 TRIGGER `bi_cancellation_policies` BEFORE INSERT ON `cancellation_policies` FOR EACH ROW
BEGIN IF NEW.id IS NULL OR NEW.id = '' THEN SET NEW.id = UUID(); END IF; END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `channel_sync_logs`
--

DROP TABLE IF EXISTS `channel_sync_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `channel_sync_logs` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `propertyId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `channelId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `direction` enum('PUSH','PULL') COLLATE utf8mb4_unicode_ci NOT NULL,
  `summary` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `count` int(11) NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `csl_property_idx` (`propertyId`),
  KEY `csl_channel_idx` (`channelId`),
  CONSTRAINT `csl_channel_fk` FOREIGN KEY (`channelId`) REFERENCES `channels` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `channel_sync_logs`
--

LOCK TABLES `channel_sync_logs` WRITE;
/*!40000 ALTER TABLE `channel_sync_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `channel_sync_logs` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 /*!50003 TRIGGER `bi_channel_sync_logs` BEFORE INSERT ON `channel_sync_logs` FOR EACH ROW
BEGIN IF NEW.id IS NULL OR NEW.id = '' THEN SET NEW.id = UUID(); END IF; END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `channels`
--

DROP TABLE IF EXISTS `channels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `channels` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `propertyId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `isConnected` tinyint(1) NOT NULL DEFAULT '0',
  `commissionPct` decimal(5,2) NOT NULL DEFAULT '0.00',
  `autoSync` tinyint(1) NOT NULL DEFAULT '1',
  `lastSyncAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `channels_property_code` (`propertyId`,`code`),
  CONSTRAINT `channels_property_fk` FOREIGN KEY (`propertyId`) REFERENCES `properties` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `channels`
--

LOCK TABLES `channels` WRITE;
/*!40000 ALTER TABLE `channels` DISABLE KEYS */;
INSERT INTO `channels` VALUES ('ch_agoda','prop_grand_meridian','AGODA','Agoda',0,17.00,1,NULL,'2026-08-15 12:55:45.512'),('ch_airbnb','prop_grand_meridian','AIRBNB','Airbnb',0,3.00,1,NULL,'2026-08-15 12:55:45.512'),('ch_bcom','prop_grand_meridian','BOOKING_COM','Booking.com',0,15.00,1,NULL,'2026-08-15 12:55:45.512'),('ch_exp','prop_grand_meridian','EXPEDIA','Expedia',0,18.00,1,NULL,'2026-08-15 12:55:45.512'),('ch_goibibo','prop_grand_meridian','GOIBIBO','Goibibo',0,18.00,1,NULL,'2026-08-15 12:55:45.512'),('ch_mmt','prop_grand_meridian','MAKEMYTRIP','MakeMyTrip',0,20.00,1,NULL,'2026-08-15 12:55:45.512');
/*!40000 ALTER TABLE `channels` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 /*!50003 TRIGGER `bi_channels` BEFORE INSERT ON `channels` FOR EACH ROW
BEGIN IF NEW.id IS NULL OR NEW.id = '' THEN SET NEW.id = UUID(); END IF; END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `folio_charges`
--

DROP TABLE IF EXISTS `folio_charges`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `folio_charges` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `folioId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT '1',
  `chargedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `department` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ROOMS',
  PRIMARY KEY (`id`),
  KEY `folio_charges_folioId_idx` (`folioId`),
  CONSTRAINT `folio_charges_folioId_fkey` FOREIGN KEY (`folioId`) REFERENCES `folios` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `folio_charges`
--

LOCK TABLES `folio_charges` WRITE;
/*!40000 ALTER TABLE `folio_charges` DISABLE KEYS */;
/*!40000 ALTER TABLE `folio_charges` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 /*!50003 TRIGGER `bi_folio_charges`        BEFORE INSERT ON `folio_charges`        FOR EACH ROW IF NEW.`id` IS NULL OR NEW.`id` = '' THEN SET NEW.`id` = UUID(); END IF */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `folios`
--

DROP TABLE IF EXISTS `folios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `folios` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reservationId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `totalCharges` decimal(10,2) NOT NULL,
  `totalPayments` decimal(10,2) NOT NULL,
  `balance` decimal(10,2) NOT NULL,
  `isClosed` tinyint(1) NOT NULL DEFAULT '0',
  `closedAt` datetime(3) DEFAULT NULL,
  `invoiceNo` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `invoiceUrl` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `folios_reservationId_key` (`reservationId`),
  CONSTRAINT `folios_reservationId_fkey` FOREIGN KEY (`reservationId`) REFERENCES `reservations` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `folios`
--

LOCK TABLES `folios` WRITE;
/*!40000 ALTER TABLE `folios` DISABLE KEYS */;
INSERT INTO `folios` VALUES ('3a63eeee-3740-481c-bf5d-aa4f1ce924d3','res_demo_arr',27140.00,0.00,27140.00,0,NULL,NULL,NULL,'2026-08-16 15:23:46.977','2026-08-16 15:23:46.977'),('995cdc97-716d-4263-b020-ad85dfc1d058','5cb118a1-d1c5-4a78-a68d-9efc77d827ab',27140.00,0.00,27140.00,0,NULL,NULL,NULL,'2026-08-16 15:23:43.337','2026-08-16 15:23:43.337'),('fol_demo_1','res_demo_1',29028.00,29028.00,0.00,0,NULL,NULL,NULL,'2026-07-22 23:58:56.720','2026-07-27 01:47:39.974');
/*!40000 ALTER TABLE `folios` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 /*!50003 TRIGGER `bi_folios`               BEFORE INSERT ON `folios`               FOR EACH ROW IF NEW.`id` IS NULL OR NEW.`id` = '' THEN SET NEW.`id` = UUID(); END IF */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `groups`
--

DROP TABLE IF EXISTS `groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `groups` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `propertyId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contactName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contactEmail` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contactPhone` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `checkIn` date NOT NULL,
  `checkOut` date NOT NULL,
  `status` enum('INQUIRY','CONFIRMED','CANCELLED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'CONFIRMED',
  `notes` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `groups_property_idx` (`propertyId`),
  CONSTRAINT `groups_property_fk` FOREIGN KEY (`propertyId`) REFERENCES `properties` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `groups`
--

LOCK TABLES `groups` WRITE;
/*!40000 ALTER TABLE `groups` DISABLE KEYS */;
/*!40000 ALTER TABLE `groups` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 /*!50003 TRIGGER `bi_groups` BEFORE INSERT ON `groups` FOR EACH ROW
BEGIN IF NEW.id IS NULL OR NEW.id = '' THEN SET NEW.id = UUID(); END IF; END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `guest_preferences`
--

DROP TABLE IF EXISTS `guest_preferences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `guest_preferences` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `guestId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `preferredRoomType` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `preferredFloor` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pillowType` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dietaryRestrictions` longtext COLLATE utf8mb4_unicode_ci,
  `smokingRoom` tinyint(1) NOT NULL DEFAULT '0',
  `extraBed` tinyint(1) NOT NULL DEFAULT '0',
  `earlyCheckIn` tinyint(1) NOT NULL DEFAULT '0',
  `lateCheckOut` tinyint(1) NOT NULL DEFAULT '0',
  `noDisturbBefore` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `noDisturbAfter` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `communicationChannel` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'email',
  `spokenLanguages` longtext COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  UNIQUE KEY `guest_preferences_guestId_key` (`guestId`),
  CONSTRAINT `guest_preferences_guestId_fkey` FOREIGN KEY (`guestId`) REFERENCES `guests` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `guest_preferences`
--

LOCK TABLES `guest_preferences` WRITE;
/*!40000 ALTER TABLE `guest_preferences` DISABLE KEYS */;
/*!40000 ALTER TABLE `guest_preferences` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 /*!50003 TRIGGER `bi_guest_preferences`    BEFORE INSERT ON `guest_preferences`    FOR EACH ROW IF NEW.`id` IS NULL OR NEW.`id` = '' THEN SET NEW.`id` = UUID(); END IF */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `guests`
--

DROP TABLE IF EXISTS `guests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `guests` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `propertyId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `firstName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lastName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nationality` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dateOfBirth` datetime(3) DEFAULT NULL,
  `idType` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `idNumber` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `idDocumentUrl` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `loyaltyTier` enum('BRONZE','SILVER','GOLD','PLATINUM') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'BRONZE',
  `loyaltyPoints` int(11) NOT NULL DEFAULT '0',
  `totalStays` int(11) NOT NULL DEFAULT '0',
  `totalNights` int(11) NOT NULL DEFAULT '0',
  `lifetimeValue` decimal(12,2) NOT NULL DEFAULT '0.00',
  `language` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'en',
  `tags` longtext COLLATE utf8mb4_unicode_ci,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `doNotDisturb` tinyint(1) NOT NULL DEFAULT '0',
  `marketingOptIn` tinyint(1) NOT NULL DEFAULT '1',
  `isVip` tinyint(1) NOT NULL DEFAULT '0',
  `lastStayAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `guests_propertyId_email_idx` (`propertyId`,`email`),
  KEY `guests_propertyId_phone_idx` (`propertyId`,`phone`),
  CONSTRAINT `guests_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `properties` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `guests`
--

LOCK TABLES `guests` WRITE;
/*!40000 ALTER TABLE `guests` DISABLE KEYS */;
INSERT INTO `guests` VALUES ('834d17d8-a9a2-436f-ab9d-24bb1f3c44dc','prop_grand_meridian','Akshay','Ekunde','akshay@presolv360.com','9359552876',NULL,NULL,NULL,NULL,NULL,'BRONZE',0,1,0,0.00,'en',NULL,NULL,0,1,0,NULL,'2026-08-16 14:53:57.933','2026-08-16 14:53:57.990'),('gst_arjun','prop_grand_meridian','Arjun','Malhotra','arjun.malhotra@gmail.com','+91 98765 43210','Indian',NULL,NULL,NULL,NULL,'GOLD',12450,18,42,485000.00,'en','[\"VIP\",\"Regular\",\"Corporate\"]',NULL,0,1,1,NULL,'2026-07-22 23:58:56.700','2026-07-27 01:47:39.983'),('gst_priya','prop_grand_meridian','Priya','Sharma','priya.sharma@techcorp.com','+91 87654 32109','Indian',NULL,NULL,NULL,NULL,'SILVER',3200,8,11,124000.00,'en','[\"Corporate\"]',NULL,0,1,0,NULL,'2026-07-22 23:58:56.700','2026-08-03 12:02:01.758'),('gst_rahul','prop_grand_meridian','Rahul','Gupta','rahul.gupta@ventures.in','+91 76543 21098','Indian',NULL,NULL,NULL,NULL,'PLATINUM',48700,52,134,2180000.00,'en','[\"VIP\",\"Platinum\"]',NULL,0,1,1,NULL,'2026-07-22 23:58:56.700','2026-07-22 23:58:56.700');
/*!40000 ALTER TABLE `guests` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 /*!50003 TRIGGER `bi_guests`               BEFORE INSERT ON `guests`               FOR EACH ROW IF NEW.`id` IS NULL OR NEW.`id` = '' THEN SET NEW.`id` = UUID(); END IF */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `housekeeping_tasks`
--

DROP TABLE IF EXISTS `housekeeping_tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `housekeeping_tasks` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `propertyId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `roomId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `taskType` enum('FULL_CLEAN','STAYOVER','TURNDOWN','DEEP_CLEAN','INSPECTION','MAINTENANCE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `priority` enum('URGENT','HIGH','NORMAL','LOW') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'NORMAL',
  `status` enum('PENDING','IN_PROGRESS','INSPECTING','COMPLETED','SKIPPED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `assignedToId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estimatedMinutes` int(11) NOT NULL DEFAULT '30',
  `startedAt` datetime(3) DEFAULT NULL,
  `completedAt` datetime(3) DEFAULT NULL,
  `nextCheckInTime` datetime(3) DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `photoUrls` longtext COLLATE utf8mb4_unicode_ci,
  `supervisorNotes` text COLLATE utf8mb4_unicode_ci,
  `scheduledDate` date NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `housekeeping_tasks_propertyId_scheduledDate_idx` (`propertyId`,`scheduledDate`),
  KEY `housekeeping_tasks_propertyId_status_idx` (`propertyId`,`status`),
  KEY `housekeeping_tasks_roomId_idx` (`roomId`),
  KEY `housekeeping_tasks_assignedToId_idx` (`assignedToId`),
  CONSTRAINT `housekeeping_tasks_assignedToId_fkey` FOREIGN KEY (`assignedToId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `housekeeping_tasks_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `properties` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `housekeeping_tasks_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `rooms` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `housekeeping_tasks`
--

LOCK TABLES `housekeeping_tasks` WRITE;
/*!40000 ALTER TABLE `housekeeping_tasks` DISABLE KEYS */;
INSERT INTO `housekeeping_tasks` VALUES ('hk_1','prop_grand_meridian','rm_102','FULL_CLEAN','URGENT','PENDING',NULL,45,NULL,NULL,'2026-08-16 14:00:00.000',NULL,NULL,NULL,'2026-08-16','2026-08-16 20:17:33.968','2026-08-16 20:17:33.968'),('hk_2','prop_grand_meridian','rm_512','DEEP_CLEAN','URGENT','PENDING',NULL,60,NULL,NULL,'2026-08-16 14:00:00.000',NULL,NULL,NULL,'2026-08-16','2026-08-16 20:17:33.968','2026-08-16 20:17:33.968'),('hk_3','prop_grand_meridian','rm_203','FULL_CLEAN','HIGH','PENDING',NULL,40,NULL,NULL,NULL,NULL,NULL,NULL,'2026-08-16','2026-08-16 20:17:33.968','2026-08-16 20:17:33.968'),('hk_4','prop_grand_meridian','rm_103','STAYOVER','NORMAL','IN_PROGRESS','usr_hk2',30,'2026-08-16 20:17:33.968',NULL,NULL,NULL,NULL,NULL,'2026-08-16','2026-08-16 20:17:33.968','2026-08-16 20:17:33.968'),('hk_5','prop_grand_meridian','rm_301','FULL_CLEAN','HIGH','IN_PROGRESS','usr_hk3',45,'2026-08-16 20:17:33.968',NULL,'2026-08-16 15:00:00.000',NULL,NULL,NULL,'2026-08-16','2026-08-16 20:17:33.968','2026-08-16 20:17:33.968'),('hk_6','prop_grand_meridian','rm_202','FULL_CLEAN','NORMAL','INSPECTING','usr_hk3',40,'2026-08-16 20:17:33.968',NULL,NULL,NULL,NULL,NULL,'2026-08-16','2026-08-16 20:17:33.968','2026-08-16 20:17:33.968'),('hk_7','prop_grand_meridian','rm_408','TURNDOWN','LOW','COMPLETED','usr_hk2',20,'2026-08-16 20:17:33.968','2026-08-16 20:17:33.968',NULL,NULL,NULL,NULL,'2026-08-16','2026-08-16 20:17:33.968','2026-08-16 20:17:33.968');
/*!40000 ALTER TABLE `housekeeping_tasks` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 /*!50003 TRIGGER `bi_housekeeping_tasks`   BEFORE INSERT ON `housekeeping_tasks`   FOR EACH ROW IF NEW.`id` IS NULL OR NEW.`id` = '' THEN SET NEW.`id` = UUID(); END IF */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `loyalty_transactions`
--

DROP TABLE IF EXISTS `loyalty_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `loyalty_transactions` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `guestId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `points` int(11) NOT NULL,
  `type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `referenceId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `loyalty_transactions_guestId_idx` (`guestId`),
  CONSTRAINT `loyalty_transactions_guestId_fkey` FOREIGN KEY (`guestId`) REFERENCES `guests` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `loyalty_transactions`
--

LOCK TABLES `loyalty_transactions` WRITE;
/*!40000 ALTER TABLE `loyalty_transactions` DISABLE KEYS */;
INSERT INTO `loyalty_transactions` VALUES ('lt_1','gst_arjun',1200,'EARN','Stay at The Grand Meridian',NULL,'2026-04-05 17:24:56.423'),('lt_2','gst_arjun',800,'EARN','Suite upgrade bonus',NULL,'2026-05-15 17:24:56.423'),('lt_3','gst_arjun',-2000,'REDEEM','Redeemed for spa package',NULL,'2026-06-24 17:24:56.423'),('lt_4','gst_arjun',450,'EARN','Referral bonus',NULL,'2026-07-24 17:24:56.423'),('lt_5','gst_rahul',5000,'EARN','Platinum welcome bonus',NULL,'2026-01-15 17:24:56.423'),('lt_6','gst_rahul',3200,'EARN','Corporate booking reward',NULL,'2026-07-04 17:24:56.423'),('lt_7','gst_priya',600,'EARN','First stay bonus',NULL,'2026-07-19 17:24:56.423');
/*!40000 ALTER TABLE `loyalty_transactions` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 /*!50003 TRIGGER `bi_loyalty_transactions` BEFORE INSERT ON `loyalty_transactions` FOR EACH ROW IF NEW.`id` IS NULL OR NEW.`id` = '' THEN SET NEW.`id` = UUID(); END IF */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `maintenance_tickets`
--

DROP TABLE IF EXISTS `maintenance_tickets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `maintenance_tickets` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `propertyId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `roomId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `priority` enum('CRITICAL','HIGH','NORMAL','LOW') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'NORMAL',
  `status` enum('OPEN','IN_PROGRESS','ON_HOLD','RESOLVED','CLOSED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'OPEN',
  `assignedToId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reportedById` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estimatedCost` decimal(10,2) DEFAULT NULL,
  `actualCost` decimal(10,2) DEFAULT NULL,
  `photoUrls` longtext COLLATE utf8mb4_unicode_ci,
  `resolvedAt` datetime(3) DEFAULT NULL,
  `dueDate` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `maintenance_tickets_propertyId_status_idx` (`propertyId`,`status`),
  KEY `maintenance_tickets_roomId_idx` (`roomId`),
  KEY `maintenance_tickets_assignedToId_idx` (`assignedToId`),
  CONSTRAINT `maintenance_tickets_assignedToId_fkey` FOREIGN KEY (`assignedToId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `maintenance_tickets_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `properties` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `maintenance_tickets_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `rooms` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `maintenance_tickets`
--

LOCK TABLES `maintenance_tickets` WRITE;
/*!40000 ALTER TABLE `maintenance_tickets` DISABLE KEYS */;
INSERT INTO `maintenance_tickets` VALUES ('mnt_1','prop_grand_meridian','rm_302','AC not cooling in Room 302','Guest reported the air conditioner runs but does not cool. Likely low refrigerant or compressor fault.','CRITICAL','IN_PROGRESS','usr_hk','usr_fd','HVAC',3500.00,NULL,NULL,NULL,'2026-07-31 00:00:00.000','2026-07-30 16:56:44.001','2026-07-30 16:56:44.001'),('mnt_2','prop_grand_meridian','rm_512','Leaking faucet ÔÇö Suite 512 bathroom','Continuous drip from the basin faucet. Needs washer replacement.','NORMAL','OPEN',NULL,'usr_hk','Plumbing',800.00,NULL,NULL,NULL,'2026-08-02 00:00:00.000','2026-07-30 16:56:44.001','2026-07-30 11:31:27.693'),('mnt_3','prop_grand_meridian',NULL,'Lobby chandelier flickering','Two bulbs in the main lobby chandelier flicker intermittently. Check wiring and replace bulbs.','HIGH','OPEN',NULL,'usr_gm','Electrical',2200.00,NULL,NULL,NULL,'2026-08-01 00:00:00.000','2026-07-30 16:56:44.001','2026-07-30 17:01:28.008'),('mnt_4','prop_grand_meridian','rm_201','TV remote not working ÔÇö Room 201','Replace batteries or unit.','LOW','RESOLVED','usr_hk','usr_fd','Electronics',200.00,NULL,NULL,'2026-07-30 16:56:44.052',NULL,'2026-07-30 16:56:44.001','2026-07-30 16:56:44.052'),('mnt_5','prop_grand_meridian','rm_103','Door lock jammed ÔÇö Room 103','Electronic door lock intermittently fails to read keycards. Battery + reader inspection needed.','HIGH','ON_HOLD','usr_hk','usr_fd','Security',1500.00,NULL,NULL,NULL,'2026-08-03 00:00:00.000','2026-07-30 16:56:44.001','2026-07-30 16:56:44.001'),('mnt_6','prop_grand_meridian',NULL,'Elevator #2 annual inspection due','Schedule the mandatory annual safety inspection with the vendor.','NORMAL','OPEN',NULL,'usr_gm','Facilities',12000.00,NULL,NULL,NULL,'2026-08-06 00:00:00.000','2026-07-30 16:56:44.001','2026-07-30 16:56:44.001');
/*!40000 ALTER TABLE `maintenance_tickets` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 /*!50003 TRIGGER `bi_maintenance_tickets`  BEFORE INSERT ON `maintenance_tickets`  FOR EACH ROW IF NEW.`id` IS NULL OR NEW.`id` = '' THEN SET NEW.`id` = UUID(); END IF */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `payments` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reservationId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `method` enum('CASH','CARD','UPI','BANK_TRANSFER','CORPORATE_CREDIT','OTA_COLLECT') COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('PENDING','PAID','PARTIAL','REFUNDED','FAILED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `reference` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `processedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `payments_reservationId_idx` (`reservationId`),
  CONSTRAINT `payments_reservationId_fkey` FOREIGN KEY (`reservationId`) REFERENCES `reservations` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 /*!50003 TRIGGER `bi_payments`             BEFORE INSERT ON `payments`             FOR EACH ROW IF NEW.`id` IS NULL OR NEW.`id` = '' THEN SET NEW.`id` = UUID(); END IF */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `promo_codes`
--

DROP TABLE IF EXISTS `promo_codes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `promo_codes` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `propertyId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `discountType` enum('PERCENT','FLAT') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PERCENT',
  `discountValue` decimal(10,2) NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `promo_codes_propertyId_code_key` (`propertyId`,`code`),
  CONSTRAINT `promo_codes_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `properties` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `promo_codes`
--

LOCK TABLES `promo_codes` WRITE;
/*!40000 ALTER TABLE `promo_codes` DISABLE KEYS */;
INSERT INTO `promo_codes` VALUES ('promo_flat500','prop_grand_meridian','FLAT500','FLAT',500.00,1,'2026-08-12 15:42:29.694'),('promo_welcome','prop_grand_meridian','WELCOME10','PERCENT',10.00,1,'2026-08-12 15:42:29.694');
/*!40000 ALTER TABLE `promo_codes` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 /*!50003 TRIGGER `bi_promo_codes` BEFORE INSERT ON `promo_codes` FOR EACH ROW
  IF NEW.`id` IS NULL OR NEW.`id` = '' THEN SET NEW.`id` = UUID(); END IF */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `properties`
--

DROP TABLE IF EXISTS `properties`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `properties` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenantId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `brand` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `chain` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `starRating` int(11) NOT NULL DEFAULT '3',
  `address` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `city` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `state` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'India',
  `pincode` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `website` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `timezone` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Asia/Kolkata',
  `currency` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'INR',
  `gstNumber` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `logoUrl` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `totalRooms` int(11) NOT NULL DEFAULT '0',
  `checkInTime` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '14:00',
  `checkOutTime` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '12:00',
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `properties_tenantId_idx` (`tenantId`),
  CONSTRAINT `properties_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenants` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `properties`
--

LOCK TABLES `properties` WRITE;
/*!40000 ALTER TABLE `properties` DISABLE KEYS */;
INSERT INTO `properties` VALUES ('9773ec77-7d34-4890-9e78-1d6989e2115b','43fb3578-7dc2-4049-beb0-c8e4a5c30154','Sunrise Grand','Hotel',NULL,4,'221 Marine Drive','Mumbai','Maharashtra','India',NULL,NULL,NULL,NULL,'Asia/Kolkata','INR',NULL,NULL,60,'14:00','12:00',1,'2026-07-23 13:05:14.259','2026-07-23 13:05:14.259'),('prop_grand_meridian','tnt_meridian','The Grand Meridian','Meridian Hotels','Meridian Group',5,'12, Barakhamba Road, Connaught Place','New Delhi','Delhi','India','110001','+91 11 4567 8900','reservations@grandmeridian.in',NULL,'Asia/Kolkata','INR','07AABCT1234A1Z5',NULL,142,'14:00','12:00',1,'2026-07-22 23:58:56.655','2026-08-05 10:55:15.064');
/*!40000 ALTER TABLE `properties` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 /*!50003 TRIGGER `bi_properties`           BEFORE INSERT ON `properties`           FOR EACH ROW IF NEW.`id` IS NULL OR NEW.`id` = '' THEN SET NEW.`id` = UUID(); END IF */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `rate_plan_items`
--

DROP TABLE IF EXISTS `rate_plan_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `rate_plan_items` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ratePlanId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `roomTypeId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date` date NOT NULL,
  `ratePerNight` decimal(10,2) NOT NULL,
  `isLocked` tinyint(1) NOT NULL DEFAULT '0',
  `lockedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `rate_plan_items_ratePlanId_roomTypeId_date_key` (`ratePlanId`,`roomTypeId`,`date`),
  KEY `rate_plan_items_roomTypeId_date_idx` (`roomTypeId`,`date`),
  CONSTRAINT `rate_plan_items_ratePlanId_fkey` FOREIGN KEY (`ratePlanId`) REFERENCES `rate_plans` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `rate_plan_items_roomTypeId_fkey` FOREIGN KEY (`roomTypeId`) REFERENCES `room_types` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rate_plan_items`
--

LOCK TABLES `rate_plan_items` WRITE;
/*!40000 ALTER TABLE `rate_plan_items` DISABLE KEYS */;
INSERT INTO `rate_plan_items` VALUES ('108d42c3-fe8d-49a5-bdda-607c6bf79c4e','rp_bar','rt_ste','2026-08-25',19400.00,0,NULL,'2026-08-16 13:43:02.251','2026-08-16 13:43:02.251'),('289ca751-cae8-41fb-881d-1acd9d361be8','rp_bar','rt_std','2026-08-28',5200.00,0,NULL,'2026-08-16 13:43:02.337','2026-08-16 13:43:02.337'),('3216603c-053d-459e-8b57-f92081793458','rp_bar','rt_ste','2026-08-26',19400.00,0,NULL,'2026-08-16 13:43:02.286','2026-08-16 13:43:02.286'),('38a2a3a4-f791-4cea-819d-ee6be3fc32bf','rp_bar','rt_clb','2026-08-23',10100.00,0,NULL,'2026-08-16 13:43:02.151','2026-08-16 13:43:02.151'),('39177045-d808-47d6-b970-64c540a68456','rp_bar','rt_dlx','2026-08-23',6900.00,0,NULL,'2026-08-16 13:43:02.163','2026-08-16 13:43:02.163'),('3b2481be-c2f1-4b2b-b748-69ff40caba06','rp_bar','rt_std','2026-08-29',5200.00,0,NULL,'2026-08-16 13:43:02.367','2026-08-16 13:43:02.367'),('4a43f9ae-8b78-448c-b9f7-016b221a15aa','rp_bar','rt_ste','2026-08-28',20900.00,0,NULL,'2026-08-16 13:43:02.344','2026-08-16 13:43:02.344'),('57abbea9-0ce5-4e2d-8579-bcd7a9566f22','rp_bar','rt_dlx','2026-08-24',6900.00,0,NULL,'2026-08-16 13:43:02.200','2026-08-16 13:43:02.200'),('604d349d-8fd0-4bfd-b01e-2ebba2fa6684','rp_bar','rt_clb','2026-08-30',10100.00,0,NULL,'2026-08-16 13:43:02.381','2026-08-16 13:43:02.381'),('6127f13a-1199-4cd6-ab6d-e8a87c53818e','rp_bar','rt_std','2026-08-24',4800.00,0,NULL,'2026-08-16 13:43:02.207','2026-08-16 13:43:02.207'),('68adc650-2949-409a-8fd6-ba5bf36b837f','rp_bar','rt_dlx','2026-08-30',6900.00,0,NULL,'2026-08-16 13:43:02.388','2026-08-16 13:43:02.388'),('6b82f9a2-4ea5-402d-b736-4ab78d3e8b9b','rp_bar','rt_dlx','2026-08-27',6900.00,0,NULL,'2026-08-16 13:43:02.301','2026-08-16 13:43:02.301'),('740f9799-2216-4e03-8dd1-6ba150e15d2e','rp_bar','rt_clb','2026-08-25',10100.00,0,NULL,'2026-08-16 13:43:02.225','2026-08-16 13:43:02.225'),('76b7ceb8-1a4c-4514-82da-7327081626fe','rp_bar','rt_ste','2026-08-27',19400.00,0,NULL,'2026-08-16 13:43:02.314','2026-08-16 13:43:02.314'),('8509e586-9815-4112-b2d1-0b9ac73a7711','rp_bar','rt_std','2026-08-23',4800.00,0,NULL,'2026-08-16 13:43:02.173','2026-08-16 13:43:02.173'),('8a65dcd6-5694-4f40-8a6a-63a672b2defb','rp_bar','rt_dlx','2026-08-25',6900.00,0,NULL,'2026-08-16 13:43:02.233','2026-08-16 13:43:02.233'),('8af056c7-bb7a-4580-aba9-e24612e0f427','rp_bar','rt_ste','2026-08-23',19400.00,0,NULL,'2026-08-16 13:43:02.181','2026-08-16 13:43:02.181'),('8edca336-adff-4e10-ae05-4de7244e8a19','rp_bar','rt_clb','2026-08-26',10100.00,0,NULL,'2026-08-16 13:43:02.260','2026-08-16 13:43:02.260'),('9011e93b-7fbf-4c14-9338-b2774bfa98c6','rp_bar','rt_clb','2026-08-24',10100.00,0,NULL,'2026-08-16 13:43:02.189','2026-08-16 13:43:02.189'),('90bb5744-12eb-4909-a5ab-9cff6932b96c','rp_bar','rt_clb','2026-08-29',10900.00,0,NULL,'2026-08-16 13:43:02.351','2026-08-16 13:43:02.351'),('93231a1d-2325-428f-b24c-a3b07bef0fba','rp_bar','rt_dlx','2026-08-29',7400.00,0,NULL,'2026-08-16 13:43:02.358','2026-08-16 13:43:02.358'),('9dc780c7-8d07-4adb-8fe4-9959f21039c4','rp_bar','rt_std','2026-08-25',4800.00,0,NULL,'2026-08-16 13:43:02.243','2026-08-16 13:43:02.243'),('a2bc45b4-7a55-483b-8ab8-fb8b5eefbf3d','rp_bar','rt_dlx','2026-08-26',6900.00,0,NULL,'2026-08-16 13:43:02.269','2026-08-16 13:43:02.269'),('b81c5e90-c4ec-4c29-92ca-45c6bb8e49ac','rp_bar','rt_clb','2026-08-28',10900.00,0,NULL,'2026-08-16 13:43:02.322','2026-08-16 13:43:02.322'),('be1108f6-14f6-44af-ae11-1b3313887dfe','rp_bar','rt_std','2026-08-27',4800.00,0,NULL,'2026-08-16 13:43:02.308','2026-08-16 13:43:02.308'),('bf2562f3-e352-453c-9922-9f913ba42804','rp_bar','rt_ste','2026-08-24',19400.00,0,NULL,'2026-08-16 13:43:02.215','2026-08-16 13:43:02.215'),('c13e7f54-fb2d-4fed-a854-8162b5535379','rp_bar','rt_std','2026-08-26',4800.00,0,NULL,'2026-08-16 13:43:02.277','2026-08-16 13:43:02.277'),('ccb42cde-43f2-46eb-b2bd-d05aed88178b','rp_bar','rt_std','2026-08-30',4800.00,0,NULL,'2026-08-16 13:43:02.397','2026-08-16 13:43:02.397'),('ee026475-ca58-4216-a57f-2d6484170a1a','rp_bar','rt_ste','2026-08-29',20900.00,0,NULL,'2026-08-16 13:43:02.374','2026-08-16 13:43:02.374'),('f35f07aa-52b7-46d8-a892-b216856cfc58','rp_bar','rt_ste','2026-08-30',19400.00,0,NULL,'2026-08-16 13:43:02.404','2026-08-16 13:43:02.404'),('f487dc38-b494-48c3-9d04-65e72483298e','rp_bar','rt_clb','2026-08-27',10100.00,0,NULL,'2026-08-16 13:43:02.293','2026-08-16 13:43:02.293'),('f57c1ed5-817b-43e9-9469-30088bd54348','rp_bar','rt_dlx','2026-08-28',7400.00,0,NULL,'2026-08-16 13:43:02.330','2026-08-16 13:43:02.330'),('rpi_rt_clb_2026-08-02','rp_bar','rt_clb','2026-08-02',11500.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-03 18:35:01.149'),('rpi_rt_clb_2026-08-03','rp_bar','rt_clb','2026-08-03',11500.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-03 18:35:01.149'),('rpi_rt_clb_2026-08-04','rp_bar','rt_clb','2026-08-04',11500.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-03 18:35:01.149'),('rpi_rt_clb_2026-08-05','rp_bar','rt_clb','2026-08-05',11500.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-04 15:14:27.644'),('rpi_rt_clb_2026-08-06','rp_bar','rt_clb','2026-08-06',10100.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-05 10:44:06.751'),('rpi_rt_clb_2026-08-07','rp_bar','rt_clb','2026-08-07',10900.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-05 10:44:06.804'),('rpi_rt_clb_2026-08-08','rp_bar','rt_clb','2026-08-08',10900.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-05 10:44:06.857'),('rpi_rt_clb_2026-08-09','rp_bar','rt_clb','2026-08-09',10100.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-05 10:44:06.905'),('rpi_rt_clb_2026-08-10','rp_bar','rt_clb','2026-08-10',10100.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-05 10:44:06.950'),('rpi_rt_clb_2026-08-11','rp_bar','rt_clb','2026-08-11',10100.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-05 10:44:06.993'),('rpi_rt_clb_2026-08-12','rp_bar','rt_clb','2026-08-12',10100.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-05 10:44:07.037'),('rpi_rt_clb_2026-08-13','rp_bar','rt_clb','2026-08-13',10100.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-05 10:44:07.082'),('rpi_rt_clb_2026-08-14','rp_bar','rt_clb','2026-08-14',10900.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-05 10:44:07.125'),('rpi_rt_clb_2026-08-15','rp_bar','rt_clb','2026-08-15',10900.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-05 10:44:07.169'),('rpi_rt_clb_2026-08-16','rp_bar','rt_clb','2026-08-16',10100.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-05 10:44:07.216'),('rpi_rt_clb_2026-08-17','rp_bar','rt_clb','2026-08-17',10100.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-16 13:43:01.931'),('rpi_rt_clb_2026-08-18','rp_bar','rt_clb','2026-08-18',10100.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-16 13:43:01.978'),('rpi_rt_clb_2026-08-19','rp_bar','rt_clb','2026-08-19',10100.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-16 13:43:02.013'),('rpi_rt_clb_2026-08-20','rp_bar','rt_clb','2026-08-20',10100.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-16 13:43:02.048'),('rpi_rt_clb_2026-08-21','rp_bar','rt_clb','2026-08-21',10900.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-16 13:43:02.083'),('rpi_rt_clb_2026-08-22','rp_bar','rt_clb','2026-08-22',10900.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-16 13:43:02.117'),('rpi_rt_dlx_2026-08-02','rp_bar','rt_dlx','2026-08-02',7800.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-03 18:35:01.149'),('rpi_rt_dlx_2026-08-03','rp_bar','rt_dlx','2026-08-03',7800.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-03 18:35:01.149'),('rpi_rt_dlx_2026-08-04','rp_bar','rt_dlx','2026-08-04',7800.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-03 18:35:01.149'),('rpi_rt_dlx_2026-08-05','rp_bar','rt_dlx','2026-08-05',7800.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-03 18:35:01.149'),('rpi_rt_dlx_2026-08-06','rp_bar','rt_dlx','2026-08-06',6900.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-05 10:44:06.771'),('rpi_rt_dlx_2026-08-07','rp_bar','rt_dlx','2026-08-07',7400.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-05 10:44:06.820'),('rpi_rt_dlx_2026-08-08','rp_bar','rt_dlx','2026-08-08',7400.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-05 10:44:06.871'),('rpi_rt_dlx_2026-08-09','rp_bar','rt_dlx','2026-08-09',6900.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-05 10:44:06.918'),('rpi_rt_dlx_2026-08-10','rp_bar','rt_dlx','2026-08-10',6900.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-05 10:44:06.961'),('rpi_rt_dlx_2026-08-11','rp_bar','rt_dlx','2026-08-11',6900.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-05 10:44:07.004'),('rpi_rt_dlx_2026-08-12','rp_bar','rt_dlx','2026-08-12',6900.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-05 10:44:07.048'),('rpi_rt_dlx_2026-08-13','rp_bar','rt_dlx','2026-08-13',6900.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-05 10:44:07.091'),('rpi_rt_dlx_2026-08-14','rp_bar','rt_dlx','2026-08-14',7400.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-05 10:44:07.136'),('rpi_rt_dlx_2026-08-15','rp_bar','rt_dlx','2026-08-15',7400.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-05 10:44:07.181'),('rpi_rt_dlx_2026-08-16','rp_bar','rt_dlx','2026-08-16',6900.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-05 10:44:07.227'),('rpi_rt_dlx_2026-08-17','rp_bar','rt_dlx','2026-08-17',6900.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-16 13:43:01.947'),('rpi_rt_dlx_2026-08-18','rp_bar','rt_dlx','2026-08-18',6900.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-16 13:43:01.985'),('rpi_rt_dlx_2026-08-19','rp_bar','rt_dlx','2026-08-19',6900.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-16 13:43:02.023'),('rpi_rt_dlx_2026-08-20','rp_bar','rt_dlx','2026-08-20',6900.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-16 13:43:02.058'),('rpi_rt_dlx_2026-08-21','rp_bar','rt_dlx','2026-08-21',7400.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-16 13:43:02.091'),('rpi_rt_dlx_2026-08-22','rp_bar','rt_dlx','2026-08-22',7400.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-16 13:43:02.126'),('rpi_rt_std_2026-08-02','rp_bar','rt_std','2026-08-02',5500.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-03 18:35:01.149'),('rpi_rt_std_2026-08-03','rp_bar','rt_std','2026-08-03',5500.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-04 09:44:05.796'),('rpi_rt_std_2026-08-04','rp_bar','rt_std','2026-08-04',5500.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-03 18:35:01.149'),('rpi_rt_std_2026-08-05','rp_bar','rt_std','2026-08-05',5500.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-03 18:35:01.149'),('rpi_rt_std_2026-08-06','rp_bar','rt_std','2026-08-06',4800.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-05 10:44:06.783'),('rpi_rt_std_2026-08-07','rp_bar','rt_std','2026-08-07',5200.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-05 10:44:06.834'),('rpi_rt_std_2026-08-08','rp_bar','rt_std','2026-08-08',5200.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-05 10:44:06.882'),('rpi_rt_std_2026-08-09','rp_bar','rt_std','2026-08-09',4800.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-05 10:44:06.928'),('rpi_rt_std_2026-08-10','rp_bar','rt_std','2026-08-10',4800.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-05 10:44:06.972'),('rpi_rt_std_2026-08-11','rp_bar','rt_std','2026-08-11',4800.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-05 10:44:07.013'),('rpi_rt_std_2026-08-12','rp_bar','rt_std','2026-08-12',4800.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-05 10:44:07.058'),('rpi_rt_std_2026-08-13','rp_bar','rt_std','2026-08-13',4800.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-05 10:44:07.103'),('rpi_rt_std_2026-08-14','rp_bar','rt_std','2026-08-14',5200.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-05 10:44:07.147'),('rpi_rt_std_2026-08-15','rp_bar','rt_std','2026-08-15',5200.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-05 10:44:07.196'),('rpi_rt_std_2026-08-16','rp_bar','rt_std','2026-08-16',4800.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-05 10:44:07.236'),('rpi_rt_std_2026-08-17','rp_bar','rt_std','2026-08-17',4800.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-16 13:43:01.958'),('rpi_rt_std_2026-08-18','rp_bar','rt_std','2026-08-18',4800.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-16 13:43:01.995'),('rpi_rt_std_2026-08-19','rp_bar','rt_std','2026-08-19',4800.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-16 13:43:02.031'),('rpi_rt_std_2026-08-20','rp_bar','rt_std','2026-08-20',4800.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-16 13:43:02.066'),('rpi_rt_std_2026-08-21','rp_bar','rt_std','2026-08-21',5200.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-16 13:43:02.099'),('rpi_rt_std_2026-08-22','rp_bar','rt_std','2026-08-22',5200.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-16 13:43:02.133'),('rpi_rt_ste_2026-08-02','rp_bar','rt_ste','2026-08-02',22000.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-03 18:35:01.149'),('rpi_rt_ste_2026-08-03','rp_bar','rt_ste','2026-08-03',22000.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-03 18:35:01.149'),('rpi_rt_ste_2026-08-04','rp_bar','rt_ste','2026-08-04',22000.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-03 18:35:01.149'),('rpi_rt_ste_2026-08-05','rp_bar','rt_ste','2026-08-05',22000.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-03 18:35:01.149'),('rpi_rt_ste_2026-08-06','rp_bar','rt_ste','2026-08-06',19400.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-05 10:44:06.792'),('rpi_rt_ste_2026-08-07','rp_bar','rt_ste','2026-08-07',20900.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-05 10:44:06.844'),('rpi_rt_ste_2026-08-08','rp_bar','rt_ste','2026-08-08',20900.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-05 10:44:06.892'),('rpi_rt_ste_2026-08-09','rp_bar','rt_ste','2026-08-09',19400.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-05 10:44:06.939'),('rpi_rt_ste_2026-08-10','rp_bar','rt_ste','2026-08-10',19400.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-05 10:44:06.983'),('rpi_rt_ste_2026-08-11','rp_bar','rt_ste','2026-08-11',19400.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-05 10:44:07.024'),('rpi_rt_ste_2026-08-12','rp_bar','rt_ste','2026-08-12',19400.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-05 10:44:07.071'),('rpi_rt_ste_2026-08-13','rp_bar','rt_ste','2026-08-13',19400.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-05 10:44:07.115'),('rpi_rt_ste_2026-08-14','rp_bar','rt_ste','2026-08-14',20900.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-05 10:44:07.158'),('rpi_rt_ste_2026-08-15','rp_bar','rt_ste','2026-08-15',20900.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-05 10:44:07.206'),('rpi_rt_ste_2026-08-16','rp_bar','rt_ste','2026-08-16',19400.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-05 10:44:07.246'),('rpi_rt_ste_2026-08-17','rp_bar','rt_ste','2026-08-17',19400.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-16 13:43:01.968'),('rpi_rt_ste_2026-08-18','rp_bar','rt_ste','2026-08-18',19400.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-16 13:43:02.005'),('rpi_rt_ste_2026-08-19','rp_bar','rt_ste','2026-08-19',19400.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-16 13:43:02.039'),('rpi_rt_ste_2026-08-20','rp_bar','rt_ste','2026-08-20',19400.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-16 13:43:02.075'),('rpi_rt_ste_2026-08-21','rp_bar','rt_ste','2026-08-21',20900.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-16 13:43:02.109'),('rpi_rt_ste_2026-08-22','rp_bar','rt_ste','2026-08-22',20900.00,0,NULL,'2026-08-03 18:35:01.149','2026-08-16 13:43:02.143');
/*!40000 ALTER TABLE `rate_plan_items` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 /*!50003 TRIGGER `bi_rate_plan_items`      BEFORE INSERT ON `rate_plan_items`      FOR EACH ROW IF NEW.`id` IS NULL OR NEW.`id` = '' THEN SET NEW.`id` = UUID(); END IF */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `rate_plans`
--

DROP TABLE IF EXISTS `rate_plans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `rate_plans` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `propertyId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('BAR','CORPORATE','OTA','PACKAGE','GROUP','PROMOTIONAL') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'BAR',
  `description` text COLLATE utf8mb4_unicode_ci,
  `minStay` int(11) DEFAULT NULL,
  `maxStay` int(11) DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `rate_plans_propertyId_code_key` (`propertyId`,`code`),
  CONSTRAINT `rate_plans_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `properties` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rate_plans`
--

LOCK TABLES `rate_plans` WRITE;
/*!40000 ALTER TABLE `rate_plans` DISABLE KEYS */;
INSERT INTO `rate_plans` VALUES ('rp_bar','prop_grand_meridian','Best Available Rate','BAR','BAR',NULL,NULL,NULL,1,'2026-07-22 23:58:56.691','2026-07-22 23:58:56.691'),('rp_corp','prop_grand_meridian','Corporate Rate','CORP','CORPORATE',NULL,NULL,NULL,1,'2026-07-22 23:58:56.691','2026-07-22 23:58:56.691');
/*!40000 ALTER TABLE `rate_plans` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 /*!50003 TRIGGER `bi_rate_plans`           BEFORE INSERT ON `rate_plans`           FOR EACH ROW IF NEW.`id` IS NULL OR NEW.`id` = '' THEN SET NEW.`id` = UUID(); END IF */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `reservation_extras`
--

DROP TABLE IF EXISTS `reservation_extras`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `reservation_extras` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reservationId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `price` decimal(10,2) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT '1',
  `totalPrice` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `reservation_extras_reservationId_idx` (`reservationId`),
  CONSTRAINT `reservation_extras_reservationId_fkey` FOREIGN KEY (`reservationId`) REFERENCES `reservations` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reservation_extras`
--

LOCK TABLES `reservation_extras` WRITE;
/*!40000 ALTER TABLE `reservation_extras` DISABLE KEYS */;
/*!40000 ALTER TABLE `reservation_extras` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 /*!50003 TRIGGER `bi_reservation_extras`   BEFORE INSERT ON `reservation_extras`   FOR EACH ROW IF NEW.`id` IS NULL OR NEW.`id` = '' THEN SET NEW.`id` = UUID(); END IF */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `reservations`
--

DROP TABLE IF EXISTS `reservations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `reservations` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `confirmationNumber` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `propertyId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `guestId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `roomId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `roomTypeId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ratePlanId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checkIn` date NOT NULL,
  `checkOut` date NOT NULL,
  `nights` int(11) NOT NULL,
  `adults` int(11) NOT NULL DEFAULT '1',
  `children` int(11) NOT NULL DEFAULT '0',
  `ratePerNight` decimal(10,2) NOT NULL,
  `subTotal` decimal(10,2) NOT NULL,
  `taxAmount` decimal(10,2) NOT NULL,
  `totalAmount` decimal(10,2) NOT NULL,
  `paidAmount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `balanceDue` decimal(10,2) NOT NULL,
  `status` enum('PENDING','CONFIRMED','CHECKED_IN','CHECKED_OUT','CANCELLED','NO_SHOW') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'CONFIRMED',
  `channel` enum('DIRECT','BOOKING_COM','AIRBNB','EXPEDIA','AGODA','MAKEMYTRIP','GOIBIBO','PHONE','WALK_IN','OTHER') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DIRECT',
  `otaConfirmationNo` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `specialRequests` text COLLATE utf8mb4_unicode_ci,
  `internalNotes` text COLLATE utf8mb4_unicode_ci,
  `checkedInAt` datetime(3) DEFAULT NULL,
  `checkedOutAt` datetime(3) DEFAULT NULL,
  `cancelledAt` datetime(3) DEFAULT NULL,
  `cancellationReason` text COLLATE utf8mb4_unicode_ci,
  `noShowAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `groupId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `reservations_confirmationNumber_key` (`confirmationNumber`),
  KEY `reservations_propertyId_status_idx` (`propertyId`,`status`),
  KEY `reservations_propertyId_checkIn_idx` (`propertyId`,`checkIn`),
  KEY `reservations_propertyId_checkOut_idx` (`propertyId`,`checkOut`),
  KEY `reservations_guestId_idx` (`guestId`),
  KEY `reservations_roomId_idx` (`roomId`),
  KEY `reservations_roomTypeId_idx` (`roomTypeId`),
  KEY `reservations_ratePlanId_idx` (`ratePlanId`),
  KEY `res_group_idx` (`groupId`),
  CONSTRAINT `res_group_fk` FOREIGN KEY (`groupId`) REFERENCES `groups` (`id`) ON DELETE SET NULL,
  CONSTRAINT `reservations_guestId_fkey` FOREIGN KEY (`guestId`) REFERENCES `guests` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `reservations_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `properties` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `reservations_ratePlanId_fkey` FOREIGN KEY (`ratePlanId`) REFERENCES `rate_plans` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `reservations_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `rooms` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `reservations_roomTypeId_fkey` FOREIGN KEY (`roomTypeId`) REFERENCES `room_types` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reservations`
--

LOCK TABLES `reservations` WRITE;
/*!40000 ALTER TABLE `reservations` DISABLE KEYS */;
INSERT INTO `reservations` VALUES ('5cb118a1-d1c5-4a78-a68d-9efc77d827ab','HOS-459721','prop_grand_meridian','834d17d8-a9a2-436f-ab9d-24bb1f3c44dc','rm_402','rt_clb','rp_bar','2026-08-16','2026-08-18',2,2,0,11500.00,23000.00,4140.00,27140.00,0.00,27140.00,'CHECKED_IN','AGODA',NULL,NULL,NULL,'2026-08-16 15:23:43.309',NULL,NULL,NULL,NULL,'2026-08-16 14:53:57.972','2026-08-16 15:23:43.315',NULL),('res_demo_1','HOS-284731','prop_grand_meridian','gst_arjun','rm_204','rt_dlx','rp_bar','2026-08-24','2026-08-27',3,2,0,8200.00,24600.00,4428.00,29028.00,29028.00,0.00,'CHECKED_IN','DIRECT',NULL,NULL,NULL,'2026-08-24 07:29:27.681',NULL,NULL,NULL,NULL,'2026-07-22 23:58:56.708','2026-08-24 07:29:27.681',NULL),('res_demo_arr','HOS-ARR001','prop_grand_meridian','gst_priya','rm_401','rt_clb','rp_bar','2026-08-16','2026-08-18',2,2,0,11500.00,23000.00,4140.00,27140.00,0.00,27140.00,'CHECKED_IN','BOOKING_COM',NULL,NULL,NULL,'2026-08-16 15:23:46.956',NULL,NULL,NULL,NULL,'2026-08-16 20:17:33.958','2026-08-16 15:23:46.958',NULL),('res_demo_dep','HOS-DEP001','prop_grand_meridian','gst_rahul','rm_501','rt_ste','rp_bar','2026-08-14','2026-08-16',2,2,0,22000.00,44000.00,7920.00,51920.00,51920.00,0.00,'CHECKED_IN','DIRECT',NULL,NULL,NULL,'2026-08-14 20:17:33.958',NULL,NULL,NULL,NULL,'2026-08-16 20:17:33.958','2026-08-16 20:17:33.958',NULL);
/*!40000 ALTER TABLE `reservations` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 /*!50003 TRIGGER `bi_reservations`         BEFORE INSERT ON `reservations`         FOR EACH ROW IF NEW.`id` IS NULL OR NEW.`id` = '' THEN SET NEW.`id` = UUID(); END IF */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `room_types`
--

DROP TABLE IF EXISTS `room_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `room_types` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `propertyId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `maxOccupancy` int(11) NOT NULL DEFAULT '2',
  `maxAdults` int(11) NOT NULL DEFAULT '2',
  `maxChildren` int(11) NOT NULL DEFAULT '1',
  `baseRate` decimal(10,2) NOT NULL,
  `totalCount` int(11) NOT NULL DEFAULT '0',
  `amenities` longtext COLLATE utf8mb4_unicode_ci,
  `imageUrls` longtext COLLATE utf8mb4_unicode_ci,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `sortOrder` int(11) NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `room_types_propertyId_code_key` (`propertyId`,`code`),
  CONSTRAINT `room_types_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `properties` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `room_types`
--

LOCK TABLES `room_types` WRITE;
/*!40000 ALTER TABLE `room_types` DISABLE KEYS */;
INSERT INTO `room_types` VALUES ('rt_clb','prop_grand_meridian','Club Room','CLB','Exclusive club floor access and lounge',2,2,1,11500.00,30,'[\"King Bed\",\"Club Lounge\",\"WiFi\",\"AC\",\"55\\\" TV\",\"Bathtub\"]',NULL,1,3,'2026-07-22 23:58:56.681','2026-07-22 23:58:56.681'),('rt_dlx','prop_grand_meridian','Deluxe Room','DLX','Spacious room with premium amenities',3,2,1,7800.00,50,'[\"King Bed\",\"WiFi\",\"AC\",\"Mini Bar\",\"55\\\" TV\",\"Bathtub\"]',NULL,1,2,'2026-07-22 23:58:56.681','2026-07-22 23:58:56.681'),('rt_std','prop_grand_meridian','Standard Room','STD','Comfortable room with city view',2,2,1,5500.00,40,'[\"King Bed\",\"WiFi\",\"AC\",\"Mini Bar\",\"32\\\" TV\"]',NULL,1,1,'2026-07-22 23:58:56.681','2026-07-22 23:58:56.681'),('rt_ste','prop_grand_meridian','Suite','STE','Luxurious suite with separate living area',4,2,1,22000.00,15,'[\"King Bed\",\"Living Room\",\"Club Lounge\",\"WiFi\",\"AC\",\"65\\\" TV\",\"Jacuzzi\"]',NULL,1,4,'2026-07-22 23:58:56.681','2026-07-22 23:58:56.681');
/*!40000 ALTER TABLE `room_types` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 /*!50003 TRIGGER `bi_room_types`           BEFORE INSERT ON `room_types`           FOR EACH ROW IF NEW.`id` IS NULL OR NEW.`id` = '' THEN SET NEW.`id` = UUID(); END IF */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `rooms`
--

DROP TABLE IF EXISTS `rooms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `rooms` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `propertyId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `roomTypeId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `number` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `floor` int(11) NOT NULL,
  `status` enum('CLEAN','DIRTY','CLEANING','INSPECTING','MAINTENANCE','BLOCKED','OUT_OF_ORDER') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DIRTY',
  `isBlocked` tinyint(1) NOT NULL DEFAULT '0',
  `blockReason` text COLLATE utf8mb4_unicode_ci,
  `blockedUntil` datetime(3) DEFAULT NULL,
  `features` longtext COLLATE utf8mb4_unicode_ci,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `rooms_propertyId_number_key` (`propertyId`,`number`),
  KEY `rooms_roomTypeId_idx` (`roomTypeId`),
  KEY `rooms_propertyId_status_idx` (`propertyId`,`status`),
  CONSTRAINT `rooms_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `properties` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `rooms_roomTypeId_fkey` FOREIGN KEY (`roomTypeId`) REFERENCES `room_types` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rooms`
--

LOCK TABLES `rooms` WRITE;
/*!40000 ALTER TABLE `rooms` DISABLE KEYS */;
INSERT INTO `rooms` VALUES ('rm_101','prop_grand_meridian','rt_std','101',1,'CLEAN',0,NULL,NULL,NULL,NULL,'2026-07-22 23:58:56.693','2026-08-03 11:53:05.087'),('rm_102','prop_grand_meridian','rt_std','102',1,'DIRTY',0,NULL,NULL,NULL,NULL,'2026-07-22 23:58:56.693','2026-08-03 15:51:52.778'),('rm_103','prop_grand_meridian','rt_std','103',1,'CLEANING',0,NULL,NULL,NULL,NULL,'2026-07-22 23:58:56.693','2026-07-22 23:58:56.693'),('rm_201','prop_grand_meridian','rt_dlx','201',2,'CLEAN',0,NULL,NULL,NULL,NULL,'2026-07-22 23:58:56.693','2026-08-05 16:06:29.147'),('rm_202','prop_grand_meridian','rt_dlx','202',2,'INSPECTING',0,NULL,NULL,NULL,NULL,'2026-07-22 23:58:56.693','2026-07-22 23:58:56.693'),('rm_203','prop_grand_meridian','rt_dlx','203',2,'DIRTY',0,NULL,NULL,NULL,NULL,'2026-07-22 23:58:56.693','2026-07-22 23:58:56.693'),('rm_204','prop_grand_meridian','rt_dlx','204',2,'CLEAN',0,NULL,NULL,NULL,NULL,'2026-07-22 23:58:56.693','2026-07-27 01:47:39.970'),('rm_301','prop_grand_meridian','rt_dlx','301',3,'CLEANING',0,NULL,NULL,NULL,NULL,'2026-07-22 23:58:56.693','2026-08-03 15:47:40.119'),('rm_302','prop_grand_meridian','rt_dlx','302',3,'MAINTENANCE',1,'AC Repair',NULL,NULL,NULL,'2026-07-22 23:58:56.693','2026-07-22 23:58:56.693'),('rm_401','prop_grand_meridian','rt_clb','401',4,'DIRTY',0,NULL,NULL,NULL,NULL,'2026-07-22 23:58:56.693','2026-08-16 15:23:46.958'),('rm_402','prop_grand_meridian','rt_clb','402',4,'DIRTY',0,NULL,NULL,NULL,NULL,'2026-07-22 23:58:56.693','2026-08-16 15:23:43.315'),('rm_408','prop_grand_meridian','rt_dlx','408',4,'CLEAN',0,NULL,NULL,NULL,NULL,'2026-07-22 23:58:56.693','2026-07-22 23:58:56.693'),('rm_501','prop_grand_meridian','rt_ste','501',5,'CLEAN',0,NULL,NULL,NULL,NULL,'2026-07-22 23:58:56.693','2026-07-22 23:58:56.693'),('rm_502','prop_grand_meridian','rt_ste','502',5,'CLEAN',0,NULL,NULL,NULL,NULL,'2026-07-22 23:58:56.693','2026-07-22 23:58:56.693'),('rm_512','prop_grand_meridian','rt_ste','512',5,'DIRTY',0,NULL,NULL,NULL,NULL,'2026-07-22 23:58:56.693','2026-07-22 23:58:56.693');
/*!40000 ALTER TABLE `rooms` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 /*!50003 TRIGGER `bi_rooms`                BEFORE INSERT ON `rooms`                FOR EACH ROW IF NEW.`id` IS NULL OR NEW.`id` = '' THEN SET NEW.`id` = UUID(); END IF */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `tenants`
--

DROP TABLE IF EXISTS `tenants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tenants` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `plan` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'starter',
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `tenants_slug_key` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenants`
--

LOCK TABLES `tenants` WRITE;
/*!40000 ALTER TABLE `tenants` DISABLE KEYS */;
INSERT INTO `tenants` VALUES ('43fb3578-7dc2-4049-beb0-c8e4a5c30154','Sunrise Hospitality Group','sunrise-hospitality-group','trial',1,'2026-07-23 13:05:14.244','2026-07-23 13:05:14.244'),('tnt_meridian','Meridian Hotels Group','meridian-group','enterprise',1,'2026-07-22 23:58:56.647','2026-07-22 23:58:56.647');
/*!40000 ALTER TABLE `tenants` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 /*!50003 TRIGGER `bi_tenants`              BEFORE INSERT ON `tenants`              FOR EACH ROW IF NEW.`id` IS NULL OR NEW.`id` = '' THEN SET NEW.`id` = UUID(); END IF */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenantId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `propertyId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `firstName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lastName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('OWNER','GENERAL_MANAGER','REVENUE_MANAGER','FRONT_DESK','HOUSEKEEPING_SUPERVISOR','HOUSEKEEPER','MAINTENANCE','FINANCE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'FRONT_DESK',
  `department` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `lastLoginAt` datetime(3) DEFAULT NULL,
  `refreshToken` text COLLATE utf8mb4_unicode_ci,
  `avatarUrl` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_key` (`email`),
  KEY `users_tenantId_idx` (`tenantId`),
  KEY `users_propertyId_idx` (`propertyId`),
  CONSTRAINT `users_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `properties` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `users_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenants` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('40244eeb-8ee7-4070-9685-9a682590a8db','43fb3578-7dc2-4049-beb0-c8e4a5c30154','9773ec77-7d34-4890-9e78-1d6989e2115b','owner@sunrisehotels.in','$2b$12$7Fiq8KGD0gmfgOpiF7YNDuboJfIvA6nWFimQDyWNsua3StH7JDg8K','Aarav','Sharma','+91 98765 43210','OWNER','Management',1,'2026-07-23 13:05:15.373','$2b$10$BOM2aHs0VSG7OyR43Dq8.eIhgG.rq2W/q2ndlcIjh9uaiyKq0C/2a',NULL,'2026-07-23 13:05:14.285','2026-07-23 13:05:15.375'),('usr_fd','tnt_meridian','prop_grand_meridian','frontdesk@grandmeridian.in','$2b$12$XKIHRF9pkIMlmyfRT2FSpuKV16c5MvQn.U1ikPjPmIVsH5RPIcNQq','Priya','Nair',NULL,'FRONT_DESK','Front Office',1,NULL,NULL,NULL,'2026-07-22 23:58:56.678','2026-07-22 23:58:56.678'),('usr_gm','tnt_meridian','prop_grand_meridian','manager@grandmeridian.in','$2b$12$XKIHRF9pkIMlmyfRT2FSpuKV16c5MvQn.U1ikPjPmIVsH5RPIcNQq','Akshay','Kumar',NULL,'GENERAL_MANAGER','Management',1,'2026-08-24 02:02:10.459','$2b$10$PYRMMAa0cIr61PfdHTDKquOT.g7si20UhXMTshqFMK74XNV8LI4hW',NULL,'2026-07-22 23:58:56.678','2026-08-24 02:02:10.463'),('usr_hk','tnt_meridian','prop_grand_meridian','housekeeping@grandmeridian.in','$2b$12$XKIHRF9pkIMlmyfRT2FSpuKV16c5MvQn.U1ikPjPmIVsH5RPIcNQq','Meena','Singh',NULL,'HOUSEKEEPING_SUPERVISOR','Housekeeping',1,NULL,NULL,NULL,'2026-07-22 23:58:56.678','2026-07-22 23:58:56.678'),('usr_hk2','tnt_meridian','prop_grand_meridian','sunita@grandmeridian.in','$2b$12$XKIHRF9pkIMlmyfRT2FSpuKV16c5MvQn.U1ikPjPmIVsH5RPIcNQq','Sunita','Devi',NULL,'HOUSEKEEPER','Housekeeping',1,NULL,NULL,NULL,'2026-08-03 15:47:40.008','2026-08-03 15:47:40.008'),('usr_hk3','tnt_meridian','prop_grand_meridian','ramesh@grandmeridian.in','$2b$12$XKIHRF9pkIMlmyfRT2FSpuKV16c5MvQn.U1ikPjPmIVsH5RPIcNQq','Ramesh','Kumar',NULL,'HOUSEKEEPER','Housekeeping',1,NULL,NULL,NULL,'2026-08-03 15:47:40.008','2026-08-03 15:47:40.008'),('usr_rev','tnt_meridian','prop_grand_meridian','revenue@grandmeridian.in','$2b$12$XKIHRF9pkIMlmyfRT2FSpuKV16c5MvQn.U1ikPjPmIVsH5RPIcNQq','Rohit','Verma',NULL,'REVENUE_MANAGER','Revenue',1,NULL,NULL,NULL,'2026-07-22 23:58:56.678','2026-07-22 23:58:56.678');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 /*!50003 TRIGGER `bi_users`                BEFORE INSERT ON `users`                FOR EACH ROW IF NEW.`id` IS NULL OR NEW.`id` = '' THEN SET NEW.`id` = UUID(); END IF */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Dumping routines for database 'hospitality'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-29 22:54:16
