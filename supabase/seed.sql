-- Seed locations with mock data from locations.js
-- Run after 001_initial_schema.sql

INSERT INTO locations (name, nonprofit_name, description, continent, country, city, lat, lng, category, impact, approved) VALUES
-- Africa
('Teach English', 'Education for All Kenya', 'Teach English to local students', 'Africa', 'Kenya', 'Nairobi', -1.2921, 36.8219, 'education', 50, TRUE),
('Community Health Clinic', 'Health First Nigeria', 'Support community health outreach', 'Africa', 'Nigeria', 'Lagos', 6.5244, 3.3792, 'health', 120, TRUE),
('Water Well Project', 'Clean Water Africa', 'Build and maintain water wells', 'Africa', 'Zambia', 'Lusaka', -15.3767, 28.1927, 'environment', 200, TRUE),
('Youth Coding Camp', 'TechBridge Ghana', 'Teach coding to youth', 'Africa', 'Ghana', 'Accra', 5.6037, -0.1870, 'education', 35, TRUE),
('Reforestation Initiative', 'Green Earth Rwanda', 'Plant trees and restore ecosystems', 'Africa', 'Rwanda', 'Kigali', -1.9403, 29.8739, 'environment', 80, TRUE),
-- Asia
('Disaster Relief Training', 'Asia Resilience Org', 'Prepare communities for disasters', 'Asia', 'Philippines', 'Manila', 14.5995, 120.9842, 'emergency', 90, TRUE),
('Rural School Support', 'EduIndia Foundation', 'Support rural schools', 'Asia', 'India', 'New Delhi', 28.6139, 77.2090, 'education', 75, TRUE),
('Elder Care Program', 'Silver Lining Japan', 'Companion and care for elderly', 'Asia', 'Japan', 'Tokyo', 35.6762, 139.6503, 'health', 45, TRUE),
('Sustainable Farming Workshop', 'Green Vietnam', 'Teach sustainable agriculture', 'Asia', 'Vietnam', 'Hanoi', 21.0285, 105.8542, 'environment', 110, TRUE),
('Digital Literacy Class', 'Tech4All Indonesia', 'Teach digital skills', 'Asia', 'Indonesia', 'Jakarta', -6.2088, 106.8456, 'education', 60, TRUE),
-- Europe
('Refugee Integration Support', 'Welcome Europe', 'Support refugee families', 'Europe', 'Germany', 'Berlin', 52.5200, 13.4050, 'community', 85, TRUE),
('Urban Garden Project', 'Green Paris Collective', 'Community urban gardening', 'Europe', 'France', 'Paris', 48.8566, 2.3522, 'environment', 40, TRUE),
('Youth Mentorship', 'Rise Up London', 'Mentor underserved youth', 'Europe', 'UK', 'London', 51.5074, -0.1278, 'education', 65, TRUE),
('Food Bank Distribution', 'Share the Meal Spain', 'Distribute food to families', 'Europe', 'Spain', 'Madrid', 40.4168, -3.7038, 'food', 130, TRUE),
('Elder Companion Program', 'Silver Friends Italy', 'Companion for elderly', 'Europe', 'Italy', 'Rome', 41.9028, 12.4964, 'health', 55, TRUE),
-- North America
('Soup Kitchen Volunteer', 'Hearts of America', 'Serve meals to those in need', 'North America', 'USA', 'New York', 40.7128, -74.0060, 'food', 100, TRUE),
('Habitat for Housing', 'Build Together USA', 'Build affordable housing', 'North America', 'USA', 'Atlanta', 33.7490, -84.3880, 'community', 70, TRUE),
('Beach Cleanup', 'Ocean Guardians', 'Clean beaches and coastlines', 'North America', 'USA', 'Los Angeles', 34.0195, -118.4912, 'environment', 95, TRUE),
('Tutoring at Community Center', 'Learn Together Canada', 'Tutor students', 'North America', 'Canada', 'Toronto', 43.6532, -79.3832, 'education', 50, TRUE),
('Animal Shelter Support', 'Paw Rescue Mexico', 'Care for rescued animals', 'North America', 'Mexico', 'Mexico City', 19.4326, -99.1332, 'animals', 40, TRUE),
-- South America
('Amazon Reforestation', 'Pulmón Verde', 'Restore Amazon rainforest', 'South America', 'Brazil', 'Manaus', -3.1190, -60.0217, 'environment', 180, TRUE),
('Medical Outreach', 'HealthBridge Brasil', 'Mobile health clinics', 'South America', 'Brazil', 'São Paulo', -23.5505, -46.6333, 'health', 90, TRUE),
('School Build Project', 'EduPeru', 'Build schools in rural areas', 'South America', 'Peru', 'Lima', -12.0464, -77.0428, 'education', 75, TRUE),
('Indigenous Rights Support', 'Voz Nativa', 'Support indigenous communities', 'South America', 'Chile', 'Santiago', -33.4489, -70.6693, 'community', 60, TRUE),
('Microfinance Training', 'Empower Colombia', 'Teach financial literacy', 'South America', 'Colombia', 'Bogotá', 4.7110, -74.0721, 'education', 85, TRUE),
-- Oceania
('Coral Reef Restoration', 'Ocean Care Australia', 'Restore coral reefs', 'Oceania', 'Australia', 'Sydney', -33.8688, 151.2093, 'environment', 120, TRUE),
('Indigenous Education', 'First Nations Learning', 'Support indigenous education', 'Oceania', 'New Zealand', 'Auckland', -36.8485, 174.7633, 'education', 55, TRUE),
('Disaster Prep Workshop', 'Pacific Ready', 'Community disaster preparedness', 'Oceania', 'Indonesia', 'Bali', -8.4095, 115.1889, 'emergency', 70, TRUE),
('Wildlife Sanctuary', 'Kiwi Conservation', 'Protect native wildlife', 'Oceania', 'New Zealand', 'Wellington', -41.2866, 174.7756, 'animals', 45, TRUE),
('Youth Sports Program', 'Play Fiji', 'Organize youth sports', 'Oceania', 'Fiji', 'Suva', -17.7134, 178.0650, 'community', 35, TRUE),
-- Antarctica
('Research Station Support', 'Polar Research Institute', 'Support polar research', 'Antarctica', '', 'McMurdo Station', -77.8467, 166.6681, 'science', 25, TRUE);
