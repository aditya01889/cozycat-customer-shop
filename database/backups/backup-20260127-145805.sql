SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict aN64kdfo6GneoTqf2a8CaUETWeOxdACNIcOpgrQhnbDJZ721dgsAwWt4CUbuUrS

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."flow_state" ("id", "user_id", "auth_code", "code_challenge_method", "code_challenge", "provider_type", "provider_access_token", "provider_refresh_token", "created_at", "updated_at", "authentication_method", "auth_code_issued_at") VALUES
	('2dd2a6ec-3410-4732-ba4d-7d6079a7c810', '4f5040d5-323d-43b8-b2ae-1284ee34be32', '85fcdc0a-7d14-41e4-88ba-825c43b7d5fe', 's256', 'sVKnyJOsp8YlhOkbiIwv9mMxkXIMPIS-0Z6Hzg-c8Oo', 'email', '', '', '2026-01-26 12:00:01.111839+00', '2026-01-26 12:00:01.111839+00', 'email/signup', NULL);


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', '8ae51402-7d66-42f7-ad1c-cc2f5a21b2ab', 'authenticated', 'authenticated', 'admin@cozycatkitchen.com', '$2a$10$63Gvh9y.O6zdPpqrPCf1AOOefpUZqFfPgJvs7aUL2hrrdCzGvGkym', NULL, NULL, '45330efde3727ceb1f1310186427a80a4880a0f9100747a16c4febbd', '2026-01-16 16:14:44.894933+00', '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"sub": "8ae51402-7d66-42f7-ad1c-cc2f5a21b2ab", "name": "admin", "email": "admin@cozycatkitchen.com", "email_verified": false, "phone_verified": false}', NULL, '2026-01-16 16:14:44.8405+00', '2026-01-16 16:14:46.327603+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '3cbc1133-e8e1-4e8c-9ba6-38ba14434727', 'authenticated', 'authenticated', 'cozykitchenemail@gmail.com', '$2a$10$2wbhIOWhY4E09tlOvf1tYOpgmefu9b2m0L3mNl9c2hheXGit/LJZq', '2026-01-17 21:41:13.65692+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-01-18 10:07:52.549133+00', '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2026-01-17 21:41:13.624399+00', '2026-01-25 09:06:38.594747+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '6fec6f12-473a-4218-9ed5-783233bc4252', 'authenticated', 'authenticated', 'cozycatkitchen@gmail.com', '$2a$10$xZPOSbdUcm3rE6x5XVog/euWq62i1Dr3yEfV/IGpt9hCr6lH8yTCm', '2026-01-16 20:05:55.733538+00', NULL, '', '2026-01-16 20:05:23.214149+00', '2f27b527720e89022153889213b106e38c1f9cea06a2c888464c6e64', '2026-01-17 16:28:08.330071+00', '', '', NULL, '2026-01-25 09:08:34.432181+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "6fec6f12-473a-4218-9ed5-783233bc4252", "name": "Priyanka Yadav", "email": "cozycatkitchen@gmail.com", "email_verified": true, "phone_verified": false}', NULL, '2026-01-16 20:05:23.186332+00', '2026-01-26 21:52:52.268765+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '685d4246-f961-4bcb-9215-89a9a5023a11', 'authenticated', 'authenticated', 'testuser789@cozycatkitchen.com', '$2a$10$aSRg2B5Ki7F2ctAg8wnb5.dUw1tJ3YBvLdibWtzrlf8aRvLOWNvIy', NULL, NULL, 'eef423a6ffccc9f3efbbfc67c6326d6fbfed77f2cb41f87db6d4fcee', '2026-01-26 12:03:24.684601+00', '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"sub": "685d4246-f961-4bcb-9215-89a9a5023a11", "role": "customer", "email": "testuser789@cozycatkitchen.com", "full_name": "Test User", "email_verified": false, "phone_verified": false}', NULL, '2026-01-26 12:03:24.67686+00', '2026-01-26 12:03:25.954587+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '4f5040d5-323d-43b8-b2ae-1284ee34be32', 'authenticated', 'authenticated', 'timeoutuser123@cozycatkitchen.com', '$2a$10$iMKZH.fjjAxbymq5qpUAv.fLKVZtsb1DwhNgjW/sT4blHzxxuRNoG', NULL, NULL, 'pkce_f9f6e083d768b25614f15d53d59b2006de03bd92909429186a2193fa', '2026-01-26 12:00:01.11322+00', '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"sub": "4f5040d5-323d-43b8-b2ae-1284ee34be32", "role": "customer", "email": "timeoutuser123@cozycatkitchen.com", "full_name": "Timeout Test User", "email_verified": false, "phone_verified": false}', NULL, '2026-01-26 12:00:01.104815+00', '2026-01-26 12:00:02.503056+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '1bdc0d75-de5a-462e-8050-78169ac09139', 'authenticated', 'authenticated', 'aditya01889@gmail.com', '$2a$10$avLpEnVhVRYOkgYnn3c8feW8Qt6CsJ4.q4U.IYoVqcx9GezvBBRwy', '2026-01-16 18:59:36.523621+00', NULL, '', '2026-01-16 18:58:58.439523+00', '', NULL, '', '', NULL, '2026-01-27 02:52:35.060809+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "1bdc0d75-de5a-462e-8050-78169ac09139", "name": "Admin User", "role": "admin", "email": "aditya01889@gmail.com", "email_verified": true, "phone_verified": false}', NULL, '2026-01-16 18:58:58.40533+00', '2026-01-27 09:01:09.468304+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '4759d999-15c5-4197-8d70-42fa9218cbbd', 'authenticated', 'authenticated', 'testuser456@cozycatkitchen.com', '$2a$10$CPDe.8T7Eit/U8WlWfebEehz..FvDgVs54x1P8PamMX7PKP.YkvLW', NULL, NULL, 'ebc4df650a0a35405302719a465ba7f10b52124ee5cda11502541106', '2026-01-26 12:01:44.561197+00', '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"sub": "4759d999-15c5-4197-8d70-42fa9218cbbd", "role": "customer", "email": "testuser456@cozycatkitchen.com", "full_name": "Test User", "email_verified": false, "phone_verified": false}', NULL, '2026-01-26 12:01:44.553793+00', '2026-01-26 12:01:45.888776+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '14407fd4-d966-44ae-b1f8-cf1716fbd900', 'authenticated', 'authenticated', 'testuser123@cozycatkitchen.com', '$2a$10$dTrjHufdmRkCxC0Ul4A7LOgvIu4pyz/gPMgrrj5Ng1CVv1VEqQ0Ka', NULL, NULL, '6dea4797be04e04b13b911ee9c90eefe6d773a5e3370a534bf772423', '2026-01-26 11:59:59.008885+00', '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"sub": "14407fd4-d966-44ae-b1f8-cf1716fbd900", "role": "customer", "email": "testuser123@cozycatkitchen.com", "full_name": "Test User", "email_verified": false, "phone_verified": false}', NULL, '2026-01-26 11:59:59.000376+00', '2026-01-26 12:00:00.036424+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('8ae51402-7d66-42f7-ad1c-cc2f5a21b2ab', '8ae51402-7d66-42f7-ad1c-cc2f5a21b2ab', '{"sub": "8ae51402-7d66-42f7-ad1c-cc2f5a21b2ab", "name": "admin", "email": "admin@cozycatkitchen.com", "email_verified": false, "phone_verified": false}', 'email', '2026-01-16 16:14:44.876117+00', '2026-01-16 16:14:44.876172+00', '2026-01-16 16:14:44.876172+00', 'b961b896-9858-48e5-b726-31cd5cd1da93'),
	('1bdc0d75-de5a-462e-8050-78169ac09139', '1bdc0d75-de5a-462e-8050-78169ac09139', '{"sub": "1bdc0d75-de5a-462e-8050-78169ac09139", "name": "Admin User", "email": "aditya01889@gmail.com", "email_verified": true, "phone_verified": false}', 'email', '2026-01-16 18:58:58.430775+00', '2026-01-16 18:58:58.430833+00', '2026-01-16 18:58:58.430833+00', '256ba690-4620-441f-ad35-22b4c1913782'),
	('6fec6f12-473a-4218-9ed5-783233bc4252', '6fec6f12-473a-4218-9ed5-783233bc4252', '{"sub": "6fec6f12-473a-4218-9ed5-783233bc4252", "name": "Priyanka Yadav", "email": "cozycatkitchen@gmail.com", "email_verified": true, "phone_verified": false}', 'email', '2026-01-16 20:05:23.209208+00', '2026-01-16 20:05:23.209261+00', '2026-01-16 20:05:23.209261+00', '855a2ee0-72b4-4b46-bebc-1a09c60a0d78'),
	('3cbc1133-e8e1-4e8c-9ba6-38ba14434727', '3cbc1133-e8e1-4e8c-9ba6-38ba14434727', '{"sub": "3cbc1133-e8e1-4e8c-9ba6-38ba14434727", "email": "cozykitchenemail@gmail.com", "email_verified": false, "phone_verified": false}', 'email', '2026-01-17 21:41:13.647934+00', '2026-01-17 21:41:13.647999+00', '2026-01-17 21:41:13.647999+00', '832ad6bf-d4ae-4764-b6f4-14ef6383d3b9'),
	('14407fd4-d966-44ae-b1f8-cf1716fbd900', '14407fd4-d966-44ae-b1f8-cf1716fbd900', '{"sub": "14407fd4-d966-44ae-b1f8-cf1716fbd900", "role": "customer", "email": "testuser123@cozycatkitchen.com", "full_name": "Test User", "email_verified": false, "phone_verified": false}', 'email', '2026-01-26 11:59:59.00406+00', '2026-01-26 11:59:59.004107+00', '2026-01-26 11:59:59.004107+00', 'c507296b-3a93-4b55-bca2-c318659c9f5f'),
	('4f5040d5-323d-43b8-b2ae-1284ee34be32', '4f5040d5-323d-43b8-b2ae-1284ee34be32', '{"sub": "4f5040d5-323d-43b8-b2ae-1284ee34be32", "role": "customer", "email": "timeoutuser123@cozycatkitchen.com", "full_name": "Timeout Test User", "email_verified": false, "phone_verified": false}', 'email', '2026-01-26 12:00:01.109101+00', '2026-01-26 12:00:01.109151+00', '2026-01-26 12:00:01.109151+00', '333bc1ca-dc30-4380-b712-05ea7428543b'),
	('4759d999-15c5-4197-8d70-42fa9218cbbd', '4759d999-15c5-4197-8d70-42fa9218cbbd', '{"sub": "4759d999-15c5-4197-8d70-42fa9218cbbd", "role": "customer", "email": "testuser456@cozycatkitchen.com", "full_name": "Test User", "email_verified": false, "phone_verified": false}', 'email', '2026-01-26 12:01:44.557399+00', '2026-01-26 12:01:44.557462+00', '2026-01-26 12:01:44.557462+00', '8f3b9c79-8c90-4620-8f52-7ace0666c009'),
	('685d4246-f961-4bcb-9215-89a9a5023a11', '685d4246-f961-4bcb-9215-89a9a5023a11', '{"sub": "685d4246-f961-4bcb-9215-89a9a5023a11", "role": "customer", "email": "testuser789@cozycatkitchen.com", "full_name": "Test User", "email_verified": false, "phone_verified": false}', 'email', '2026-01-26 12:03:24.682506+00', '2026-01-26 12:03:24.682577+00', '2026-01-26 12:03:24.682577+00', '9d5445a6-5907-45d5-8f4d-c4ba78a605b8');


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag", "oauth_client_id", "refresh_token_hmac_key", "refresh_token_counter", "scopes") VALUES
	('b3750ab6-c674-4681-9c8d-f440dfd8c50d', '1bdc0d75-de5a-462e-8050-78169ac09139', '2026-01-27 02:52:35.060914+00', '2026-01-27 09:01:09.476605+00', NULL, 'aal1', NULL, '2026-01-27 09:01:09.476478', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '103.208.68.213', NULL, NULL, NULL, NULL, NULL),
	('d71cc621-64d3-4c2c-89f1-864029cf871c', '1bdc0d75-de5a-462e-8050-78169ac09139', '2026-01-17 05:53:25.935984+00', '2026-01-17 05:53:25.935984+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '45.119.31.38', NULL, NULL, NULL, NULL, NULL),
	('0411f35f-2036-4c2b-bf17-914b072a8913', '1bdc0d75-de5a-462e-8050-78169ac09139', '2026-01-17 06:26:17.362128+00', '2026-01-17 06:26:17.362128+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '45.119.31.38', NULL, NULL, NULL, NULL, NULL),
	('8d51d486-a003-4fe1-bf49-65c7c0fe56ce', '1bdc0d75-de5a-462e-8050-78169ac09139', '2026-01-17 06:26:48.330913+00', '2026-01-17 06:26:48.330913+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '45.119.31.38', NULL, NULL, NULL, NULL, NULL),
	('363c513f-dd5a-47bd-83a7-09a375e6a59d', '1bdc0d75-de5a-462e-8050-78169ac09139', '2026-01-17 06:27:20.367441+00', '2026-01-17 06:27:20.367441+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '45.119.31.38', NULL, NULL, NULL, NULL, NULL),
	('e6cf92d0-5143-4e2b-b32b-590406aa0fb3', '1bdc0d75-de5a-462e-8050-78169ac09139', '2026-01-17 06:27:40.370799+00', '2026-01-17 06:27:40.370799+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '45.119.31.38', NULL, NULL, NULL, NULL, NULL),
	('f25264c8-ff3c-47d4-81ae-575c0ac8106b', '1bdc0d75-de5a-462e-8050-78169ac09139', '2026-01-17 06:30:01.486061+00', '2026-01-17 06:30:01.486061+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '45.119.31.38', NULL, NULL, NULL, NULL, NULL),
	('e5a80cb7-8ef9-415c-82c1-575ec50f6da8', '1bdc0d75-de5a-462e-8050-78169ac09139', '2026-01-17 06:55:59.000753+00', '2026-01-17 06:55:59.000753+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '45.119.31.38', NULL, NULL, NULL, NULL, NULL),
	('0f576180-2074-457e-a5f9-5d03f2c1bbae', '1bdc0d75-de5a-462e-8050-78169ac09139', '2026-01-17 06:56:23.795698+00', '2026-01-17 06:56:23.795698+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '45.119.31.38', NULL, NULL, NULL, NULL, NULL),
	('61ae2942-857e-4e6c-8342-c571c0ec75f8', '1bdc0d75-de5a-462e-8050-78169ac09139', '2026-01-17 06:58:03.940916+00', '2026-01-17 06:58:03.940916+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '45.119.31.38', NULL, NULL, NULL, NULL, NULL),
	('d76b539d-256d-449f-9e9c-8008826f132b', '1bdc0d75-de5a-462e-8050-78169ac09139', '2026-01-18 06:26:23.265369+00', '2026-01-18 06:26:23.265369+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '103.208.68.220', NULL, NULL, NULL, NULL, NULL),
	('ca22af69-5828-4d0b-9079-db334e37d7fd', '3cbc1133-e8e1-4e8c-9ba6-38ba14434727', '2026-01-17 21:44:44.95237+00', '2026-01-17 21:44:44.95237+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '45.119.31.38', NULL, NULL, NULL, NULL, NULL),
	('1f17cbb2-9a44-4a7d-8532-22438fb61dd2', '3cbc1133-e8e1-4e8c-9ba6-38ba14434727', '2026-01-17 21:46:43.216646+00', '2026-01-17 21:46:43.216646+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '45.119.31.38', NULL, NULL, NULL, NULL, NULL),
	('29589748-e0e8-4a73-9a42-4d2bac1f67cb', '3cbc1133-e8e1-4e8c-9ba6-38ba14434727', '2026-01-17 22:24:59.075814+00', '2026-01-17 22:24:59.075814+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '45.119.31.38', NULL, NULL, NULL, NULL, NULL),
	('3fca02bb-91ea-49d5-a123-f1d6032eb170', '1bdc0d75-de5a-462e-8050-78169ac09139', '2026-01-18 13:35:21.927013+00', '2026-01-18 13:35:21.927013+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '45.119.31.64', NULL, NULL, NULL, NULL, NULL),
	('ca75ced4-6f21-4fee-9286-5845144c8858', '1bdc0d75-de5a-462e-8050-78169ac09139', '2026-01-18 13:36:54.326593+00', '2026-01-18 13:36:54.326593+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '45.119.31.64', NULL, NULL, NULL, NULL, NULL),
	('2bd6811e-7a87-4b59-9af2-744489ffbd71', '1bdc0d75-de5a-462e-8050-78169ac09139', '2026-01-17 20:27:02.86646+00', '2026-01-17 20:27:02.86646+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '45.119.31.38', NULL, NULL, NULL, NULL, NULL),
	('f38db3a7-c91b-4e52-9d0a-61c4f7719bce', '3cbc1133-e8e1-4e8c-9ba6-38ba14434727', '2026-01-17 21:44:24.897367+00', '2026-01-17 21:44:24.897367+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '45.119.31.38', NULL, NULL, NULL, NULL, NULL),
	('2e534df0-5913-48a3-9b87-d99fb8e83895', '3cbc1133-e8e1-4e8c-9ba6-38ba14434727', '2026-01-17 21:44:29.100652+00', '2026-01-17 21:44:29.100652+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '45.119.31.38', NULL, NULL, NULL, NULL, NULL),
	('267464c4-576d-4cf5-9e5d-e72907cc8063', '3cbc1133-e8e1-4e8c-9ba6-38ba14434727', '2026-01-17 21:44:39.935711+00', '2026-01-17 21:44:39.935711+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '45.119.31.38', NULL, NULL, NULL, NULL, NULL),
	('f7621618-d5cd-41c6-aef9-a5b1c56024f3', '3cbc1133-e8e1-4e8c-9ba6-38ba14434727', '2026-01-17 23:03:16.249248+00', '2026-01-17 23:03:16.249248+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '45.119.31.38', NULL, NULL, NULL, NULL, NULL),
	('4585a399-29a3-48a0-a2b9-9eeb2acb5c42', '3cbc1133-e8e1-4e8c-9ba6-38ba14434727', '2026-01-17 23:08:01.242605+00', '2026-01-17 23:08:01.242605+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '45.119.31.38', NULL, NULL, NULL, NULL, NULL),
	('2619c9ab-79e5-487d-bedd-8f6a7f0ef7d7', '1bdc0d75-de5a-462e-8050-78169ac09139', '2026-01-18 11:08:02.616017+00', '2026-01-18 11:08:02.616017+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Windsurf/1.106.0 Chrome/138.0.7204.251 Electron/37.7.0 Safari/537.36', '45.119.31.64', NULL, NULL, NULL, NULL, NULL),
	('a1b969fe-1156-4240-a824-1537ff20e1f2', '6fec6f12-473a-4218-9ed5-783233bc4252', '2026-01-17 09:03:14.282246+00', '2026-01-18 05:16:17.462928+00', NULL, 'aal1', NULL, '2026-01-18 05:16:17.462813', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36', '45.119.31.38', NULL, NULL, NULL, NULL, NULL),
	('c3b01342-a224-42fb-9087-643b6ba1c600', '1bdc0d75-de5a-462e-8050-78169ac09139', '2026-01-26 13:35:33.586958+00', '2026-01-26 13:35:33.586958+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '103.208.68.213', NULL, NULL, NULL, NULL, NULL),
	('02abaa37-fa85-4a2e-927d-45e8dfd1a639', '1bdc0d75-de5a-462e-8050-78169ac09139', '2026-01-18 13:36:59.006747+00', '2026-01-18 13:36:59.006747+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '45.119.31.64', NULL, NULL, NULL, NULL, NULL),
	('6351e09f-0943-4130-a9ce-2f6de3f8f8b8', '1bdc0d75-de5a-462e-8050-78169ac09139', '2026-01-18 13:12:43.153613+00', '2026-01-18 13:12:43.153613+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '45.119.31.64', NULL, NULL, NULL, NULL, NULL),
	('c807214e-ac3d-4565-b318-552b1572e0cd', '1bdc0d75-de5a-462e-8050-78169ac09139', '2026-01-18 13:20:03.379212+00', '2026-01-18 13:20:03.379212+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '45.119.31.64', NULL, NULL, NULL, NULL, NULL),
	('3cf91ec8-1eda-4682-82a1-4bdf91b1b769', '1bdc0d75-de5a-462e-8050-78169ac09139', '2026-01-18 13:35:20.956214+00', '2026-01-18 13:35:20.956214+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '45.119.31.64', NULL, NULL, NULL, NULL, NULL),
	('bf705827-969a-41a3-81f2-0bb98c2dea0e', '1bdc0d75-de5a-462e-8050-78169ac09139', '2026-01-17 07:01:14.139441+00', '2026-01-26 13:33:45.927199+00', NULL, 'aal1', NULL, '2026-01-26 13:33:45.926476', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '103.208.68.213', NULL, NULL, NULL, NULL, NULL),
	('5230f388-fd90-48b6-89fb-f5e7dda3d072', '1bdc0d75-de5a-462e-8050-78169ac09139', '2026-01-26 13:35:38.286738+00', '2026-01-26 13:35:38.286738+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '103.208.68.213', NULL, NULL, NULL, NULL, NULL),
	('ec4dcd55-ce4a-40eb-a7e6-90c98ae982a8', '1bdc0d75-de5a-462e-8050-78169ac09139', '2026-01-26 13:34:16.674131+00', '2026-01-26 13:34:16.674131+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '103.208.68.213', NULL, NULL, NULL, NULL, NULL),
	('e43747bf-0bd8-43a8-a44f-d09b9bb72e2c', '1bdc0d75-de5a-462e-8050-78169ac09139', '2026-01-26 13:34:21.618456+00', '2026-01-26 13:34:21.618456+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '103.208.68.213', NULL, NULL, NULL, NULL, NULL),
	('6d29a47b-be12-4c88-b6a9-aeb120755802', '1bdc0d75-de5a-462e-8050-78169ac09139', '2026-01-26 13:49:18.598373+00', '2026-01-26 13:49:18.598373+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '103.208.68.213', NULL, NULL, NULL, NULL, NULL),
	('06475475-2234-43f1-b919-1eca6fc12721', '1bdc0d75-de5a-462e-8050-78169ac09139', '2026-01-26 13:49:23.578295+00', '2026-01-26 13:49:23.578295+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '103.208.68.213', NULL, NULL, NULL, NULL, NULL),
	('e9c3cb23-4025-4054-9567-0dd5a949a1d3', '1bdc0d75-de5a-462e-8050-78169ac09139', '2026-01-26 14:07:00.667685+00', '2026-01-26 14:07:00.667685+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '103.208.68.213', NULL, NULL, NULL, NULL, NULL),
	('675461ab-a1f9-42bd-8ec1-4657d1b29449', '1bdc0d75-de5a-462e-8050-78169ac09139', '2026-01-26 14:07:05.661414+00', '2026-01-26 14:07:05.661414+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '103.208.68.213', NULL, NULL, NULL, NULL, NULL),
	('16500098-2083-4607-88ae-e61af4b8299f', '1bdc0d75-de5a-462e-8050-78169ac09139', '2026-01-26 15:04:46.872649+00', '2026-01-26 15:04:46.872649+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '103.208.68.213', NULL, NULL, NULL, NULL, NULL),
	('a4d69229-b3ea-4417-9fda-71f2dd4f16ea', '1bdc0d75-de5a-462e-8050-78169ac09139', '2026-01-26 20:44:27.452821+00', '2026-01-27 00:23:36.643864+00', NULL, 'aal1', NULL, '2026-01-27 00:23:36.643755', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '103.208.68.213', NULL, NULL, NULL, NULL, NULL),
	('af08c7d6-7637-46f4-b051-ad59693aa12c', '1bdc0d75-de5a-462e-8050-78169ac09139', '2026-01-26 13:49:09.932491+00', '2026-01-27 01:14:00.30147+00', NULL, 'aal1', NULL, '2026-01-27 01:14:00.301362', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '103.208.68.213', NULL, NULL, NULL, NULL, NULL),
	('d0f9ecfb-866a-4add-9d13-93c0bea3788b', '1bdc0d75-de5a-462e-8050-78169ac09139', '2026-01-26 23:13:23.290964+00', '2026-01-27 03:04:48.965928+00', NULL, 'aal1', NULL, '2026-01-27 03:04:48.965817', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '103.208.68.213', NULL, NULL, NULL, NULL, NULL),
	('4136bf92-a304-4273-b41b-bd4f60669815', '1bdc0d75-de5a-462e-8050-78169ac09139', '2026-01-26 20:35:14.571285+00', '2026-01-26 20:35:14.571285+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '103.208.68.213', NULL, NULL, NULL, NULL, NULL),
	('ddf0a4d9-64c2-4219-ae54-85dd6862a058', '1bdc0d75-de5a-462e-8050-78169ac09139', '2026-01-26 21:53:28.899966+00', '2026-01-27 03:10:27.003373+00', NULL, 'aal1', NULL, '2026-01-27 03:10:27.003274', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '103.208.68.213', NULL, NULL, NULL, NULL, NULL),
	('2c9d1ddb-b64f-4dab-828f-ecb346a2cc37', '1bdc0d75-de5a-462e-8050-78169ac09139', '2026-01-26 15:57:49.781961+00', '2026-01-27 05:18:44.625615+00', NULL, 'aal1', NULL, '2026-01-27 05:18:44.625511', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '103.208.68.213', NULL, NULL, NULL, NULL, NULL);


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES
	('d71cc621-64d3-4c2c-89f1-864029cf871c', '2026-01-17 05:53:25.940178+00', '2026-01-17 05:53:25.940178+00', 'password', 'dd2ef213-40e2-4db3-827d-e98f731600a5'),
	('0411f35f-2036-4c2b-bf17-914b072a8913', '2026-01-17 06:26:17.419596+00', '2026-01-17 06:26:17.419596+00', 'password', 'cbac60b3-f09c-4458-81b6-9d1d3f3f6d81'),
	('8d51d486-a003-4fe1-bf49-65c7c0fe56ce', '2026-01-17 06:26:48.33528+00', '2026-01-17 06:26:48.33528+00', 'password', '6737017b-65f6-432c-800d-a18ae74cd1ae'),
	('363c513f-dd5a-47bd-83a7-09a375e6a59d', '2026-01-17 06:27:20.370282+00', '2026-01-17 06:27:20.370282+00', 'password', '5efff171-8e7d-4ce5-aa5c-a9861ce5c4c1'),
	('e6cf92d0-5143-4e2b-b32b-590406aa0fb3', '2026-01-17 06:27:40.373357+00', '2026-01-17 06:27:40.373357+00', 'password', '368439d5-1195-4f6e-9f0b-ce92a994958b'),
	('f25264c8-ff3c-47d4-81ae-575c0ac8106b', '2026-01-17 06:30:01.491016+00', '2026-01-17 06:30:01.491016+00', 'password', '59199280-f4d7-4eac-9792-d4601ad2b30e'),
	('e5a80cb7-8ef9-415c-82c1-575ec50f6da8', '2026-01-17 06:55:59.068948+00', '2026-01-17 06:55:59.068948+00', 'password', '5f63756e-c0ec-4015-844f-898f49adafa9'),
	('0f576180-2074-457e-a5f9-5d03f2c1bbae', '2026-01-17 06:56:23.798061+00', '2026-01-17 06:56:23.798061+00', 'password', 'aa700919-4a12-4e21-a7e5-1e79b5c39644'),
	('61ae2942-857e-4e6c-8342-c571c0ec75f8', '2026-01-17 06:58:03.943626+00', '2026-01-17 06:58:03.943626+00', 'password', '70aa1308-34ea-41c5-b001-d17169195c5f'),
	('bf705827-969a-41a3-81f2-0bb98c2dea0e', '2026-01-17 07:01:14.14588+00', '2026-01-17 07:01:14.14588+00', 'password', '9d2bb10e-6ff2-4ff4-81eb-7e006cf981fa'),
	('a1b969fe-1156-4240-a824-1537ff20e1f2', '2026-01-17 09:03:14.37245+00', '2026-01-17 09:03:14.37245+00', 'password', 'c3e0e929-ecf6-4dbf-83b3-97cd277d8443'),
	('2bd6811e-7a87-4b59-9af2-744489ffbd71', '2026-01-17 20:27:02.883324+00', '2026-01-17 20:27:02.883324+00', 'password', 'ec3a9718-2398-4379-957c-7f2b1760dadd'),
	('f38db3a7-c91b-4e52-9d0a-61c4f7719bce', '2026-01-17 21:44:24.944639+00', '2026-01-17 21:44:24.944639+00', 'password', 'b2bde41d-1a78-45ef-ac13-9f32489dca8c'),
	('2e534df0-5913-48a3-9b87-d99fb8e83895', '2026-01-17 21:44:29.103968+00', '2026-01-17 21:44:29.103968+00', 'password', 'd069becb-69de-470d-b8fb-7f4c4b926e2d'),
	('267464c4-576d-4cf5-9e5d-e72907cc8063', '2026-01-17 21:44:39.942138+00', '2026-01-17 21:44:39.942138+00', 'password', '5b7b8eaf-031d-4523-a989-c6f4fd6ff1c0'),
	('ca22af69-5828-4d0b-9079-db334e37d7fd', '2026-01-17 21:44:44.958508+00', '2026-01-17 21:44:44.958508+00', 'password', 'fde0b0cb-34dd-4a91-907b-9317d216bdb3'),
	('1f17cbb2-9a44-4a7d-8532-22438fb61dd2', '2026-01-17 21:46:43.226169+00', '2026-01-17 21:46:43.226169+00', 'password', '5eefa86c-71dc-4032-bcbc-5f1b6d772b26'),
	('29589748-e0e8-4a73-9a42-4d2bac1f67cb', '2026-01-17 22:24:59.135874+00', '2026-01-17 22:24:59.135874+00', 'password', '44690543-ffe7-4de7-86ae-25acca8011ef'),
	('f7621618-d5cd-41c6-aef9-a5b1c56024f3', '2026-01-17 23:03:16.252383+00', '2026-01-17 23:03:16.252383+00', 'password', '786744ff-433f-44b5-b06a-6a66d5776826'),
	('4585a399-29a3-48a0-a2b9-9eeb2acb5c42', '2026-01-17 23:08:01.249998+00', '2026-01-17 23:08:01.249998+00', 'password', '2f6f48f8-5603-4b6e-b91e-ff2af2215807'),
	('d76b539d-256d-449f-9e9c-8008826f132b', '2026-01-18 06:26:23.300939+00', '2026-01-18 06:26:23.300939+00', 'password', 'd55751fb-dfa0-4377-bb04-530f3e887652'),
	('2619c9ab-79e5-487d-bedd-8f6a7f0ef7d7', '2026-01-18 11:08:02.681274+00', '2026-01-18 11:08:02.681274+00', 'password', '75552a27-404c-4f91-b80e-ecdffa99dcc1'),
	('6351e09f-0943-4130-a9ce-2f6de3f8f8b8', '2026-01-18 13:12:43.187294+00', '2026-01-18 13:12:43.187294+00', 'password', 'd089f95a-ed41-4bc5-904a-fc34950f319c'),
	('c807214e-ac3d-4565-b318-552b1572e0cd', '2026-01-18 13:20:03.384989+00', '2026-01-18 13:20:03.384989+00', 'password', '164c3661-e837-4f2e-8e7c-60ddf86a4ab3'),
	('3cf91ec8-1eda-4682-82a1-4bdf91b1b769', '2026-01-18 13:35:20.985561+00', '2026-01-18 13:35:20.985561+00', 'password', '495d994d-3415-4321-9878-6f5c38b94f25'),
	('3fca02bb-91ea-49d5-a123-f1d6032eb170', '2026-01-18 13:35:21.929798+00', '2026-01-18 13:35:21.929798+00', 'password', '91e8d219-73aa-4ad1-98d5-77116ae07d08'),
	('ca75ced4-6f21-4fee-9286-5845144c8858', '2026-01-18 13:36:54.336652+00', '2026-01-18 13:36:54.336652+00', 'password', 'cf67aaa7-72fa-424e-936f-35531a2477f2'),
	('02abaa37-fa85-4a2e-927d-45e8dfd1a639', '2026-01-18 13:36:59.010089+00', '2026-01-18 13:36:59.010089+00', 'password', '6cf2657f-12ad-450f-89aa-3729c29d9455'),
	('ec4dcd55-ce4a-40eb-a7e6-90c98ae982a8', '2026-01-26 13:34:16.688154+00', '2026-01-26 13:34:16.688154+00', 'password', 'b462d900-4538-436a-9069-8d0fc327cca2'),
	('e43747bf-0bd8-43a8-a44f-d09b9bb72e2c', '2026-01-26 13:34:21.623203+00', '2026-01-26 13:34:21.623203+00', 'password', '9cbb9304-8d47-42b3-a0d5-a74426c7eee9'),
	('c3b01342-a224-42fb-9087-643b6ba1c600', '2026-01-26 13:35:33.590266+00', '2026-01-26 13:35:33.590266+00', 'password', 'febda58e-1949-4df3-904a-f46af7354f3e'),
	('5230f388-fd90-48b6-89fb-f5e7dda3d072', '2026-01-26 13:35:38.289128+00', '2026-01-26 13:35:38.289128+00', 'password', '580a8768-43c0-4169-81e3-0df9b28bdbed'),
	('af08c7d6-7637-46f4-b051-ad59693aa12c', '2026-01-26 13:49:09.958664+00', '2026-01-26 13:49:09.958664+00', 'password', '11993da1-3626-4f62-bf1b-b6be6bf33c72'),
	('6d29a47b-be12-4c88-b6a9-aeb120755802', '2026-01-26 13:49:18.604534+00', '2026-01-26 13:49:18.604534+00', 'password', 'a502b4b5-edc1-408e-9c9f-ca193d109afe'),
	('06475475-2234-43f1-b919-1eca6fc12721', '2026-01-26 13:49:23.58062+00', '2026-01-26 13:49:23.58062+00', 'password', 'ed2667c5-4fed-4dd8-bc32-fff1045c0602'),
	('e9c3cb23-4025-4054-9567-0dd5a949a1d3', '2026-01-26 14:07:00.742822+00', '2026-01-26 14:07:00.742822+00', 'password', '8e9342e7-694b-4c6e-860f-fe669f64e097'),
	('675461ab-a1f9-42bd-8ec1-4657d1b29449', '2026-01-26 14:07:05.67197+00', '2026-01-26 14:07:05.67197+00', 'password', 'd0cec1d4-6743-4a6c-b6e6-8dacc472f6b5'),
	('16500098-2083-4607-88ae-e61af4b8299f', '2026-01-26 15:04:46.924812+00', '2026-01-26 15:04:46.924812+00', 'password', '3404d8d9-4046-4526-b86c-f8cecd5c4d33'),
	('2c9d1ddb-b64f-4dab-828f-ecb346a2cc37', '2026-01-26 15:57:49.791652+00', '2026-01-26 15:57:49.791652+00', 'password', '975932e6-10da-4c16-af1c-1a8d23c9110d'),
	('4136bf92-a304-4273-b41b-bd4f60669815', '2026-01-26 20:35:14.654285+00', '2026-01-26 20:35:14.654285+00', 'password', '1955c8e0-18e5-432a-ab55-bd11595a0052'),
	('a4d69229-b3ea-4417-9fda-71f2dd4f16ea', '2026-01-26 20:44:27.481935+00', '2026-01-26 20:44:27.481935+00', 'password', 'f9276284-9464-4178-aedf-cd3ce0549a05'),
	('ddf0a4d9-64c2-4219-ae54-85dd6862a058', '2026-01-26 21:53:28.915943+00', '2026-01-26 21:53:28.915943+00', 'password', '864f53c3-08cd-4a49-961c-639df2a10e58'),
	('d0f9ecfb-866a-4add-9d13-93c0bea3788b', '2026-01-26 23:13:23.301737+00', '2026-01-26 23:13:23.301737+00', 'password', '0a765366-170d-4486-9853-880d9856b76d'),
	('b3750ab6-c674-4681-9c8d-f440dfd8c50d', '2026-01-27 02:52:35.079547+00', '2026-01-27 02:52:35.079547+00', 'password', 'bedfa170-35a4-4414-97bd-872db9caed5a');


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."one_time_tokens" ("id", "user_id", "token_type", "token_hash", "relates_to", "created_at", "updated_at") VALUES
	('897b60e2-071c-4e32-8781-b0aa1431c519', '8ae51402-7d66-42f7-ad1c-cc2f5a21b2ab', 'confirmation_token', '45330efde3727ceb1f1310186427a80a4880a0f9100747a16c4febbd', 'admin@cozycatkitchen.com', '2026-01-16 16:14:46.350948', '2026-01-16 16:14:46.350948'),
	('e345d236-1900-4a6a-9ffc-a398b1000bd4', '6fec6f12-473a-4218-9ed5-783233bc4252', 'recovery_token', '2f27b527720e89022153889213b106e38c1f9cea06a2c888464c6e64', 'cozycatkitchen@gmail.com', '2026-01-17 16:28:09.739295', '2026-01-17 16:28:09.739295'),
	('0b05da2f-814c-4cbb-a27e-43c08e8f877b', '14407fd4-d966-44ae-b1f8-cf1716fbd900', 'confirmation_token', '6dea4797be04e04b13b911ee9c90eefe6d773a5e3370a534bf772423', 'testuser123@cozycatkitchen.com', '2026-01-26 12:00:00.051638', '2026-01-26 12:00:00.051638'),
	('679f878b-3954-4904-acd8-31c86fbcd3db', '4f5040d5-323d-43b8-b2ae-1284ee34be32', 'confirmation_token', 'pkce_f9f6e083d768b25614f15d53d59b2006de03bd92909429186a2193fa', 'timeoutuser123@cozycatkitchen.com', '2026-01-26 12:00:02.503933', '2026-01-26 12:00:02.503933'),
	('168538e4-6f00-4494-beb4-4227cc62cacf', '4759d999-15c5-4197-8d70-42fa9218cbbd', 'confirmation_token', 'ebc4df650a0a35405302719a465ba7f10b52124ee5cda11502541106', 'testuser456@cozycatkitchen.com', '2026-01-26 12:01:45.890632', '2026-01-26 12:01:45.890632'),
	('b64f6ccc-c7f2-4c15-b4bb-c5a0d1d5817e', '685d4246-f961-4bcb-9215-89a9a5023a11', 'confirmation_token', 'eef423a6ffccc9f3efbbfc67c6326d6fbfed77f2cb41f87db6d4fcee', 'testuser789@cozycatkitchen.com', '2026-01-26 12:03:25.956602', '2026-01-26 12:03:25.956602');


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES
	('00000000-0000-0000-0000-000000000000', 158, 'l44zndlqbquu', '1bdc0d75-de5a-462e-8050-78169ac09139', false, '2026-01-26 13:49:18.601763+00', '2026-01-26 13:49:18.601763+00', NULL, '6d29a47b-be12-4c88-b6a9-aeb120755802'),
	('00000000-0000-0000-0000-000000000000', 75, 'fwcwcdqbj6iu', '1bdc0d75-de5a-462e-8050-78169ac09139', true, '2026-01-18 05:43:39.989582+00', '2026-01-26 07:40:15.100938+00', 'tpolcpugysn7', 'bf705827-969a-41a3-81f2-0bb98c2dea0e'),
	('00000000-0000-0000-0000-000000000000', 159, 'p7hs2uvh6urv', '1bdc0d75-de5a-462e-8050-78169ac09139', false, '2026-01-26 13:49:23.579301+00', '2026-01-26 13:49:23.579301+00', NULL, '06475475-2234-43f1-b919-1eca6fc12721'),
	('00000000-0000-0000-0000-000000000000', 69, 'jo5wrnhvz35w', '3cbc1133-e8e1-4e8c-9ba6-38ba14434727', false, '2026-01-17 23:03:16.250368+00', '2026-01-17 23:03:16.250368+00', NULL, 'f7621618-d5cd-41c6-aef9-a5b1c56024f3'),
	('00000000-0000-0000-0000-000000000000', 70, 'm466d46wufnj', '3cbc1133-e8e1-4e8c-9ba6-38ba14434727', false, '2026-01-17 23:08:01.246032+00', '2026-01-17 23:08:01.246032+00', NULL, '4585a399-29a3-48a0-a2b9-9eeb2acb5c42'),
	('00000000-0000-0000-0000-000000000000', 162, 'xnsjsekqf2h7', '1bdc0d75-de5a-462e-8050-78169ac09139', true, '2026-01-26 14:47:47.972312+00', '2026-01-26 15:54:14.420739+00', '45nexyel7wiu', 'af08c7d6-7637-46f4-b051-ad59693aa12c'),
	('00000000-0000-0000-0000-000000000000', 39, 'bdzxdo6ooqfs', '6fec6f12-473a-4218-9ed5-783233bc4252', true, '2026-01-17 12:26:45.322027+00', '2026-01-17 23:28:52.248438+00', 'bvh5gstioyur', 'a1b969fe-1156-4240-a824-1537ff20e1f2'),
	('00000000-0000-0000-0000-000000000000', 72, 'idmd6r5wmwf4', '6fec6f12-473a-4218-9ed5-783233bc4252', true, '2026-01-17 23:28:52.265491+00', '2026-01-18 05:16:17.404507+00', 'bdzxdo6ooqfs', 'a1b969fe-1156-4240-a824-1537ff20e1f2'),
	('00000000-0000-0000-0000-000000000000', 73, 'qomkpbual3dh', '6fec6f12-473a-4218-9ed5-783233bc4252', false, '2026-01-18 05:16:17.431477+00', '2026-01-18 05:16:17.431477+00', 'idmd6r5wmwf4', 'a1b969fe-1156-4240-a824-1537ff20e1f2'),
	('00000000-0000-0000-0000-000000000000', 167, 'w6sdlpkk5otf', '1bdc0d75-de5a-462e-8050-78169ac09139', true, '2026-01-26 15:57:49.788279+00', '2026-01-26 17:26:53.199435+00', NULL, '2c9d1ddb-b64f-4dab-828f-ecb346a2cc37'),
	('00000000-0000-0000-0000-000000000000', 53, 'tpolcpugysn7', '1bdc0d75-de5a-462e-8050-78169ac09139', true, '2026-01-17 20:15:43.878207+00', '2026-01-18 05:43:39.96931+00', 'odsmrfngygt2', 'bf705827-969a-41a3-81f2-0bb98c2dea0e'),
	('00000000-0000-0000-0000-000000000000', 169, 'kqn7cwci5y2v', '1bdc0d75-de5a-462e-8050-78169ac09139', true, '2026-01-26 17:34:42.91624+00', '2026-01-26 18:36:36.804509+00', 'vxzlwlo7zvrs', 'af08c7d6-7637-46f4-b051-ad59693aa12c'),
	('00000000-0000-0000-0000-000000000000', 171, 'ug5vbnmhhlqc', '1bdc0d75-de5a-462e-8050-78169ac09139', true, '2026-01-26 19:40:28.957851+00', '2026-01-26 20:40:48.970374+00', 'r7dasmrivqlg', 'af08c7d6-7637-46f4-b051-ad59693aa12c'),
	('00000000-0000-0000-0000-000000000000', 78, 'qiu3s2ichxn2', '1bdc0d75-de5a-462e-8050-78169ac09139', false, '2026-01-18 06:26:23.289149+00', '2026-01-18 06:26:23.289149+00', NULL, 'd76b539d-256d-449f-9e9c-8008826f132b'),
	('00000000-0000-0000-0000-000000000000', 173, '3glzizujnivv', '1bdc0d75-de5a-462e-8050-78169ac09139', true, '2026-01-26 20:40:48.987097+00', '2026-01-26 21:39:53.225583+00', 'ug5vbnmhhlqc', 'af08c7d6-7637-46f4-b051-ad59693aa12c'),
	('00000000-0000-0000-0000-000000000000', 175, '6gbfwbsptawm', '1bdc0d75-de5a-462e-8050-78169ac09139', true, '2026-01-26 21:39:53.239505+00', '2026-01-26 22:51:17.008207+00', '3glzizujnivv', 'af08c7d6-7637-46f4-b051-ad59693aa12c'),
	('00000000-0000-0000-0000-000000000000', 23, 'lratq3ebhe7r', '1bdc0d75-de5a-462e-8050-78169ac09139', false, '2026-01-17 05:53:25.93806+00', '2026-01-17 05:53:25.93806+00', NULL, 'd71cc621-64d3-4c2c-89f1-864029cf871c'),
	('00000000-0000-0000-0000-000000000000', 24, 'p2h5ffm3ax4u', '1bdc0d75-de5a-462e-8050-78169ac09139', false, '2026-01-17 06:26:17.390962+00', '2026-01-17 06:26:17.390962+00', NULL, '0411f35f-2036-4c2b-bf17-914b072a8913'),
	('00000000-0000-0000-0000-000000000000', 25, 'n2et2gwrolzp', '1bdc0d75-de5a-462e-8050-78169ac09139', false, '2026-01-17 06:26:48.334058+00', '2026-01-17 06:26:48.334058+00', NULL, '8d51d486-a003-4fe1-bf49-65c7c0fe56ce'),
	('00000000-0000-0000-0000-000000000000', 27, '6mtzqmvvb5fn', '1bdc0d75-de5a-462e-8050-78169ac09139', false, '2026-01-17 06:27:20.368742+00', '2026-01-17 06:27:20.368742+00', NULL, '363c513f-dd5a-47bd-83a7-09a375e6a59d'),
	('00000000-0000-0000-0000-000000000000', 28, 'jafw2tx2mzmj', '1bdc0d75-de5a-462e-8050-78169ac09139', false, '2026-01-17 06:27:40.372079+00', '2026-01-17 06:27:40.372079+00', NULL, 'e6cf92d0-5143-4e2b-b32b-590406aa0fb3'),
	('00000000-0000-0000-0000-000000000000', 29, '5mkdh7675vkz', '1bdc0d75-de5a-462e-8050-78169ac09139', false, '2026-01-17 06:30:01.487809+00', '2026-01-17 06:30:01.487809+00', NULL, 'f25264c8-ff3c-47d4-81ae-575c0ac8106b'),
	('00000000-0000-0000-0000-000000000000', 30, 'pbx2gvqm7ao2', '1bdc0d75-de5a-462e-8050-78169ac09139', false, '2026-01-17 06:55:59.041276+00', '2026-01-17 06:55:59.041276+00', NULL, 'e5a80cb7-8ef9-415c-82c1-575ec50f6da8'),
	('00000000-0000-0000-0000-000000000000', 31, 'rhhgjp4wgzfp', '1bdc0d75-de5a-462e-8050-78169ac09139', false, '2026-01-17 06:56:23.796771+00', '2026-01-17 06:56:23.796771+00', NULL, '0f576180-2074-457e-a5f9-5d03f2c1bbae'),
	('00000000-0000-0000-0000-000000000000', 33, '67dmcbgwqzth', '1bdc0d75-de5a-462e-8050-78169ac09139', false, '2026-01-17 06:58:03.942182+00', '2026-01-17 06:58:03.942182+00', NULL, '61ae2942-857e-4e6c-8342-c571c0ec75f8'),
	('00000000-0000-0000-0000-000000000000', 179, 'izr76xz5cxjg', '1bdc0d75-de5a-462e-8050-78169ac09139', true, '2026-01-26 22:51:17.028939+00', '2026-01-27 00:15:28.694422+00', '6gbfwbsptawm', 'af08c7d6-7637-46f4-b051-ad59693aa12c'),
	('00000000-0000-0000-0000-000000000000', 84, '2zzlo6n5nvpt', '1bdc0d75-de5a-462e-8050-78169ac09139', false, '2026-01-18 11:08:02.649441+00', '2026-01-18 11:08:02.649441+00', NULL, '2619c9ab-79e5-487d-bedd-8f6a7f0ef7d7'),
	('00000000-0000-0000-0000-000000000000', 184, 'yqqriyewvcfw', '1bdc0d75-de5a-462e-8050-78169ac09139', false, '2026-01-27 00:23:36.63635+00', '2026-01-27 00:23:36.63635+00', 'h2i2jppycenl', 'a4d69229-b3ea-4417-9fda-71f2dd4f16ea'),
	('00000000-0000-0000-0000-000000000000', 182, 'etyokq545po5', '1bdc0d75-de5a-462e-8050-78169ac09139', true, '2026-01-26 23:54:19.854644+00', '2026-01-27 00:59:18.181201+00', 'kbwlioi6ib3u', '2c9d1ddb-b64f-4dab-828f-ecb346a2cc37'),
	('00000000-0000-0000-0000-000000000000', 86, 'cagfqw37ygfv', '1bdc0d75-de5a-462e-8050-78169ac09139', false, '2026-01-18 13:12:43.175711+00', '2026-01-18 13:12:43.175711+00', NULL, '6351e09f-0943-4130-a9ce-2f6de3f8f8b8'),
	('00000000-0000-0000-0000-000000000000', 38, 'bvh5gstioyur', '6fec6f12-473a-4218-9ed5-783233bc4252', true, '2026-01-17 09:03:14.33536+00', '2026-01-17 12:26:45.296895+00', NULL, 'a1b969fe-1156-4240-a824-1537ff20e1f2'),
	('00000000-0000-0000-0000-000000000000', 186, 'ilti6zmvcmj3', '1bdc0d75-de5a-462e-8050-78169ac09139', false, '2026-01-27 01:14:00.287487+00', '2026-01-27 01:14:00.287487+00', 'w6wclawkfssd', 'af08c7d6-7637-46f4-b051-ad59693aa12c'),
	('00000000-0000-0000-0000-000000000000', 88, 'mybmmcxmiy4x', '1bdc0d75-de5a-462e-8050-78169ac09139', false, '2026-01-18 13:20:03.381561+00', '2026-01-18 13:20:03.381561+00', NULL, 'c807214e-ac3d-4565-b318-552b1572e0cd'),
	('00000000-0000-0000-0000-000000000000', 35, 'qp76oyyadurn', '1bdc0d75-de5a-462e-8050-78169ac09139', true, '2026-01-17 07:01:14.142934+00', '2026-01-17 13:14:38.387865+00', NULL, 'bf705827-969a-41a3-81f2-0bb98c2dea0e'),
	('00000000-0000-0000-0000-000000000000', 89, 'bpek5onlxx75', '1bdc0d75-de5a-462e-8050-78169ac09139', false, '2026-01-18 13:35:20.972046+00', '2026-01-18 13:35:20.972046+00', NULL, '3cf91ec8-1eda-4682-82a1-4bdf91b1b769'),
	('00000000-0000-0000-0000-000000000000', 90, 'gtcs4jve7rly', '1bdc0d75-de5a-462e-8050-78169ac09139', false, '2026-01-18 13:35:21.928551+00', '2026-01-18 13:35:21.928551+00', NULL, '3fca02bb-91ea-49d5-a123-f1d6032eb170'),
	('00000000-0000-0000-0000-000000000000', 91, 'ltmhvpoyx62x', '1bdc0d75-de5a-462e-8050-78169ac09139', false, '2026-01-18 13:36:54.330111+00', '2026-01-18 13:36:54.330111+00', NULL, 'ca75ced4-6f21-4fee-9286-5845144c8858'),
	('00000000-0000-0000-0000-000000000000', 92, 'pmr3rar7x2rj', '1bdc0d75-de5a-462e-8050-78169ac09139', false, '2026-01-18 13:36:59.007953+00', '2026-01-18 13:36:59.007953+00', NULL, '02abaa37-fa85-4a2e-927d-45e8dfd1a639'),
	('00000000-0000-0000-0000-000000000000', 41, 'fw7uuxs357oi', '1bdc0d75-de5a-462e-8050-78169ac09139', true, '2026-01-17 13:14:38.390388+00', '2026-01-17 14:37:53.081857+00', 'qp76oyyadurn', 'bf705827-969a-41a3-81f2-0bb98c2dea0e'),
	('00000000-0000-0000-0000-000000000000', 187, 'xrwmvwi6cv2w', '1bdc0d75-de5a-462e-8050-78169ac09139', true, '2026-01-27 01:15:32.523476+00', '2026-01-27 03:04:48.91336+00', '4zph5w5qzk7r', 'd0f9ecfb-866a-4add-9d13-93c0bea3788b'),
	('00000000-0000-0000-0000-000000000000', 191, 'sjnjvklmshzo', '1bdc0d75-de5a-462e-8050-78169ac09139', false, '2026-01-27 03:10:26.997996+00', '2026-01-27 03:10:26.997996+00', 'zt6vo67cu5an', 'ddf0a4d9-64c2-4219-ae54-85dd6862a058'),
	('00000000-0000-0000-0000-000000000000', 189, 'k6g5f3i32hv6', '1bdc0d75-de5a-462e-8050-78169ac09139', true, '2026-01-27 02:52:35.076503+00', '2026-01-27 03:51:09.693114+00', NULL, 'b3750ab6-c674-4681-9c8d-f440dfd8c50d'),
	('00000000-0000-0000-0000-000000000000', 193, 'mqk3egbge6l2', '1bdc0d75-de5a-462e-8050-78169ac09139', true, '2026-01-27 04:05:13.786887+00', '2026-01-27 05:18:44.591636+00', '2z6td5ay35c6', '2c9d1ddb-b64f-4dab-828f-ecb346a2cc37'),
	('00000000-0000-0000-0000-000000000000', 46, 'bcgtnuqcuhsn', '1bdc0d75-de5a-462e-8050-78169ac09139', true, '2026-01-17 14:37:53.111969+00', '2026-01-17 18:08:25.710199+00', 'fw7uuxs357oi', 'bf705827-969a-41a3-81f2-0bb98c2dea0e'),
	('00000000-0000-0000-0000-000000000000', 51, 'odsmrfngygt2', '1bdc0d75-de5a-462e-8050-78169ac09139', true, '2026-01-17 18:08:25.710936+00', '2026-01-17 20:15:43.839036+00', 'bcgtnuqcuhsn', 'bf705827-969a-41a3-81f2-0bb98c2dea0e'),
	('00000000-0000-0000-0000-000000000000', 55, 'nstuxjc2atjo', '1bdc0d75-de5a-462e-8050-78169ac09139', false, '2026-01-17 20:27:02.878047+00', '2026-01-17 20:27:02.878047+00', NULL, '2bd6811e-7a87-4b59-9af2-744489ffbd71'),
	('00000000-0000-0000-0000-000000000000', 56, 'tqnmamwirs2r', '3cbc1133-e8e1-4e8c-9ba6-38ba14434727', false, '2026-01-17 21:44:24.921572+00', '2026-01-17 21:44:24.921572+00', NULL, 'f38db3a7-c91b-4e52-9d0a-61c4f7719bce'),
	('00000000-0000-0000-0000-000000000000', 57, '2e37fqosrpbw', '3cbc1133-e8e1-4e8c-9ba6-38ba14434727', false, '2026-01-17 21:44:29.101917+00', '2026-01-17 21:44:29.101917+00', NULL, '2e534df0-5913-48a3-9b87-d99fb8e83895'),
	('00000000-0000-0000-0000-000000000000', 58, 'znzm2dxhwkuv', '3cbc1133-e8e1-4e8c-9ba6-38ba14434727', false, '2026-01-17 21:44:39.939395+00', '2026-01-17 21:44:39.939395+00', NULL, '267464c4-576d-4cf5-9e5d-e72907cc8063'),
	('00000000-0000-0000-0000-000000000000', 59, 'nrxjhahvm3zw', '3cbc1133-e8e1-4e8c-9ba6-38ba14434727', false, '2026-01-17 21:44:44.955023+00', '2026-01-17 21:44:44.955023+00', NULL, 'ca22af69-5828-4d0b-9079-db334e37d7fd'),
	('00000000-0000-0000-0000-000000000000', 60, 'jqqzhpxehf76', '3cbc1133-e8e1-4e8c-9ba6-38ba14434727', false, '2026-01-17 21:46:43.220537+00', '2026-01-17 21:46:43.220537+00', NULL, '1f17cbb2-9a44-4a7d-8532-22438fb61dd2'),
	('00000000-0000-0000-0000-000000000000', 63, 'nsr43fjigjpu', '3cbc1133-e8e1-4e8c-9ba6-38ba14434727', false, '2026-01-17 22:24:59.11026+00', '2026-01-17 22:24:59.11026+00', NULL, '29589748-e0e8-4a73-9a42-4d2bac1f67cb'),
	('00000000-0000-0000-0000-000000000000', 160, 'v2pesjp7cgvd', '1bdc0d75-de5a-462e-8050-78169ac09139', false, '2026-01-26 14:07:00.703294+00', '2026-01-26 14:07:00.703294+00', NULL, 'e9c3cb23-4025-4054-9567-0dd5a949a1d3'),
	('00000000-0000-0000-0000-000000000000', 161, 'hkby5srgumby', '1bdc0d75-de5a-462e-8050-78169ac09139', false, '2026-01-26 14:07:05.670595+00', '2026-01-26 14:07:05.670595+00', NULL, '675461ab-a1f9-42bd-8ec1-4657d1b29449'),
	('00000000-0000-0000-0000-000000000000', 157, '45nexyel7wiu', '1bdc0d75-de5a-462e-8050-78169ac09139', true, '2026-01-26 13:49:09.946546+00', '2026-01-26 14:47:47.964829+00', NULL, 'af08c7d6-7637-46f4-b051-ad59693aa12c'),
	('00000000-0000-0000-0000-000000000000', 163, 'p6zuw2irm2b5', '1bdc0d75-de5a-462e-8050-78169ac09139', false, '2026-01-26 15:04:46.896752+00', '2026-01-26 15:04:46.896752+00', NULL, '16500098-2083-4607-88ae-e61af4b8299f'),
	('00000000-0000-0000-0000-000000000000', 166, 'vxzlwlo7zvrs', '1bdc0d75-de5a-462e-8050-78169ac09139', true, '2026-01-26 15:54:14.427677+00', '2026-01-26 17:34:42.911603+00', 'xnsjsekqf2h7', 'af08c7d6-7637-46f4-b051-ad59693aa12c'),
	('00000000-0000-0000-0000-000000000000', 170, 'r7dasmrivqlg', '1bdc0d75-de5a-462e-8050-78169ac09139', true, '2026-01-26 18:36:36.825778+00', '2026-01-26 19:40:28.926693+00', 'kqn7cwci5y2v', 'af08c7d6-7637-46f4-b051-ad59693aa12c'),
	('00000000-0000-0000-0000-000000000000', 172, 'ccybwihea57f', '1bdc0d75-de5a-462e-8050-78169ac09139', false, '2026-01-26 20:35:14.612109+00', '2026-01-26 20:35:14.612109+00', NULL, '4136bf92-a304-4273-b41b-bd4f60669815'),
	('00000000-0000-0000-0000-000000000000', 168, '3pflqv25gek7', '1bdc0d75-de5a-462e-8050-78169ac09139', true, '2026-01-26 17:26:53.227573+00', '2026-01-26 21:52:37.723502+00', 'w6sdlpkk5otf', '2c9d1ddb-b64f-4dab-828f-ecb346a2cc37'),
	('00000000-0000-0000-0000-000000000000', 178, 'mmibsgr3utft', '1bdc0d75-de5a-462e-8050-78169ac09139', true, '2026-01-26 21:53:28.912022+00', '2026-01-26 23:12:32.235509+00', NULL, 'ddf0a4d9-64c2-4219-ae54-85dd6862a058'),
	('00000000-0000-0000-0000-000000000000', 176, 'kbwlioi6ib3u', '1bdc0d75-de5a-462e-8050-78169ac09139', true, '2026-01-26 21:52:37.739919+00', '2026-01-26 23:54:19.840555+00', '3pflqv25gek7', '2c9d1ddb-b64f-4dab-828f-ecb346a2cc37'),
	('00000000-0000-0000-0000-000000000000', 174, 'h2i2jppycenl', '1bdc0d75-de5a-462e-8050-78169ac09139', true, '2026-01-26 20:44:27.472564+00', '2026-01-27 00:23:36.632132+00', NULL, 'a4d69229-b3ea-4417-9fda-71f2dd4f16ea'),
	('00000000-0000-0000-0000-000000000000', 183, 'w6wclawkfssd', '1bdc0d75-de5a-462e-8050-78169ac09139', true, '2026-01-27 00:15:28.708177+00', '2026-01-27 01:14:00.277233+00', 'izr76xz5cxjg', 'af08c7d6-7637-46f4-b051-ad59693aa12c'),
	('00000000-0000-0000-0000-000000000000', 181, '4zph5w5qzk7r', '1bdc0d75-de5a-462e-8050-78169ac09139', true, '2026-01-26 23:13:23.300317+00', '2026-01-27 01:15:32.510334+00', NULL, 'd0f9ecfb-866a-4add-9d13-93c0bea3788b'),
	('00000000-0000-0000-0000-000000000000', 185, '3e2ddipazyn6', '1bdc0d75-de5a-462e-8050-78169ac09139', true, '2026-01-27 00:59:18.197001+00', '2026-01-27 02:44:22.210219+00', 'etyokq545po5', '2c9d1ddb-b64f-4dab-828f-ecb346a2cc37'),
	('00000000-0000-0000-0000-000000000000', 190, 'kb4v3x2kvxmt', '1bdc0d75-de5a-462e-8050-78169ac09139', false, '2026-01-27 03:04:48.935017+00', '2026-01-27 03:04:48.935017+00', 'xrwmvwi6cv2w', 'd0f9ecfb-866a-4add-9d13-93c0bea3788b'),
	('00000000-0000-0000-0000-000000000000', 180, 'zt6vo67cu5an', '1bdc0d75-de5a-462e-8050-78169ac09139', true, '2026-01-26 23:12:32.251557+00', '2026-01-27 03:10:26.995156+00', 'mmibsgr3utft', 'ddf0a4d9-64c2-4219-ae54-85dd6862a058'),
	('00000000-0000-0000-0000-000000000000', 188, '2z6td5ay35c6', '1bdc0d75-de5a-462e-8050-78169ac09139', true, '2026-01-27 02:44:22.219115+00', '2026-01-27 04:05:13.769373+00', '3e2ddipazyn6', '2c9d1ddb-b64f-4dab-828f-ecb346a2cc37'),
	('00000000-0000-0000-0000-000000000000', 192, 'bia2lv5xa4gh', '1bdc0d75-de5a-462e-8050-78169ac09139', true, '2026-01-27 03:51:09.710635+00', '2026-01-27 04:54:09.728984+00', 'k6g5f3i32hv6', 'b3750ab6-c674-4681-9c8d-f440dfd8c50d'),
	('00000000-0000-0000-0000-000000000000', 195, 'gopuah4dtuwx', '1bdc0d75-de5a-462e-8050-78169ac09139', false, '2026-01-27 05:18:44.602278+00', '2026-01-27 05:18:44.602278+00', 'mqk3egbge6l2', '2c9d1ddb-b64f-4dab-828f-ecb346a2cc37'),
	('00000000-0000-0000-0000-000000000000', 194, 'peqfpngc2ari', '1bdc0d75-de5a-462e-8050-78169ac09139', true, '2026-01-27 04:54:09.755802+00', '2026-01-27 05:52:38.868497+00', 'bia2lv5xa4gh', 'b3750ab6-c674-4681-9c8d-f440dfd8c50d'),
	('00000000-0000-0000-0000-000000000000', 196, 'l4beu5ah5uzi', '1bdc0d75-de5a-462e-8050-78169ac09139', true, '2026-01-27 05:52:38.884237+00', '2026-01-27 07:01:25.350512+00', 'peqfpngc2ari', 'b3750ab6-c674-4681-9c8d-f440dfd8c50d'),
	('00000000-0000-0000-0000-000000000000', 197, 'agosebeulenm', '1bdc0d75-de5a-462e-8050-78169ac09139', true, '2026-01-27 07:01:25.380224+00', '2026-01-27 07:59:54.622398+00', 'l4beu5ah5uzi', 'b3750ab6-c674-4681-9c8d-f440dfd8c50d'),
	('00000000-0000-0000-0000-000000000000', 198, 'xf346sohxbk3', '1bdc0d75-de5a-462e-8050-78169ac09139', true, '2026-01-27 07:59:54.641275+00', '2026-01-27 09:01:09.453294+00', 'agosebeulenm', 'b3750ab6-c674-4681-9c8d-f440dfd8c50d'),
	('00000000-0000-0000-0000-000000000000', 199, 'vzle55mf24hv', '1bdc0d75-de5a-462e-8050-78169ac09139', false, '2026-01-27 09:01:09.463917+00', '2026-01-27 09:01:09.463917+00', 'xf346sohxbk3', 'b3750ab6-c674-4681-9c8d-f440dfd8c50d'),
	('00000000-0000-0000-0000-000000000000', 144, 'b7liiteukdgu', '1bdc0d75-de5a-462e-8050-78169ac09139', true, '2026-01-26 07:40:15.136184+00', '2026-01-26 10:54:55.513745+00', 'fwcwcdqbj6iu', 'bf705827-969a-41a3-81f2-0bb98c2dea0e'),
	('00000000-0000-0000-0000-000000000000', 148, 'n5he4yyng6h2', '1bdc0d75-de5a-462e-8050-78169ac09139', true, '2026-01-26 10:54:55.515759+00', '2026-01-26 12:28:42.473251+00', 'b7liiteukdgu', 'bf705827-969a-41a3-81f2-0bb98c2dea0e'),
	('00000000-0000-0000-0000-000000000000', 150, 'hf52kzfu6uec', '1bdc0d75-de5a-462e-8050-78169ac09139', true, '2026-01-26 12:28:42.480672+00', '2026-01-26 13:33:45.864294+00', 'n5he4yyng6h2', 'bf705827-969a-41a3-81f2-0bb98c2dea0e'),
	('00000000-0000-0000-0000-000000000000', 151, 'jluz7osrb2m2', '1bdc0d75-de5a-462e-8050-78169ac09139', false, '2026-01-26 13:33:45.890754+00', '2026-01-26 13:33:45.890754+00', 'hf52kzfu6uec', 'bf705827-969a-41a3-81f2-0bb98c2dea0e'),
	('00000000-0000-0000-0000-000000000000', 152, 'hojyxucg7jmi', '1bdc0d75-de5a-462e-8050-78169ac09139', false, '2026-01-26 13:34:16.683541+00', '2026-01-26 13:34:16.683541+00', NULL, 'ec4dcd55-ce4a-40eb-a7e6-90c98ae982a8'),
	('00000000-0000-0000-0000-000000000000', 153, 'oy3k3fry75kp', '1bdc0d75-de5a-462e-8050-78169ac09139', false, '2026-01-26 13:34:21.620046+00', '2026-01-26 13:34:21.620046+00', NULL, 'e43747bf-0bd8-43a8-a44f-d09b9bb72e2c'),
	('00000000-0000-0000-0000-000000000000', 154, '2xua2q74b3vv', '1bdc0d75-de5a-462e-8050-78169ac09139', false, '2026-01-26 13:35:33.588344+00', '2026-01-26 13:35:33.588344+00', NULL, 'c3b01342-a224-42fb-9087-643b6ba1c600'),
	('00000000-0000-0000-0000-000000000000', 155, 'y5yifge5aocy', '1bdc0d75-de5a-462e-8050-78169ac09139', false, '2026-01-26 13:35:38.287919+00', '2026-01-26 13:35:38.287919+00', NULL, '5230f388-fd90-48b6-89fb-f5e7dda3d072');


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."categories" ("id", "name", "slug", "description", "display_order", "is_active", "created_at") VALUES
	('4c4fb304-ba44-41dc-9a53-8db1fed30ef2', 'Meals', 'meals', 'Complete nutritious meals - 70g per pack', 1, true, '2026-01-13 18:18:36.485961+00'),
	('75e9b486-e95c-4389-b986-a54aba3af190', 'Broths', 'broths', 'Nutrient-rich broths - 100ml per pack', 2, true, '2026-01-13 18:18:36.485961+00'),
	('49d190d1-e039-4827-938f-af4cd8473d03', 'Cookies', 'cookies', 'Baked cookie treats - 100g or 200g', 3, true, '2026-01-13 18:18:36.485961+00'),
	('887d6bde-b2c9-438d-8428-fcbd075bbdca', 'Cupcakes', 'cupcakes', 'Cupcake treats - Sold in pairs (2 x 50g)', 4, true, '2026-01-13 18:18:36.485961+00');


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."profiles" ("id", "role", "full_name", "phone", "email", "avatar_url", "created_at", "updated_at") VALUES
	('1bdc0d75-de5a-462e-8050-78169ac09139', 'admin', 'Admin User', '09953940842', 'aditya01889@gmail.com', NULL, '2026-01-16 18:59:37.486946+00', '2026-01-27 09:20:50.985846+00'),
	('3cbc1133-e8e1-4e8c-9ba6-38ba14434727', 'operations', 'Ops', '09953940842', 'cozykitchenemail@gmail.com', NULL, '2026-01-17 21:46:59.992545+00', '2026-01-25 09:06:46.168528+00'),
	('6fec6f12-473a-4218-9ed5-783233bc4252', 'customer', 'Priyanka Yadav', '8800243400', 'cozycatkitchen@gmail.com', NULL, '2026-01-17 07:17:14.335092+00', '2026-01-26 21:52:59.113566+00');


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."customers" ("id", "profile_id", "phone", "whatsapp_number", "is_active", "created_at", "updated_at") VALUES
	('1bdc0d75-de5a-462e-8050-78169ac09139', '1bdc0d75-de5a-462e-8050-78169ac09139', '09953940842', NULL, true, '2026-01-16 18:59:38.254772+00', '2026-01-18 09:46:49.333449+00'),
	('6fec6f12-473a-4218-9ed5-783233bc4252', '6fec6f12-473a-4218-9ed5-783233bc4252', '8800243400', NULL, true, '2026-01-17 07:17:14.335092+00', '2026-01-18 10:07:30.026456+00'),
	('3cbc1133-e8e1-4e8c-9ba6-38ba14434727', '3cbc1133-e8e1-4e8c-9ba6-38ba14434727', '09953940842', NULL, true, '2026-01-17 21:46:59.992545+00', '2026-01-18 11:32:12.129069+00');


--
-- Data for Name: customer_addresses; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."customer_addresses" ("id", "customer_id", "label", "address_line1", "address_line2", "landmark", "city", "state", "pincode", "is_default", "created_at", "delivery_notes", "latitude", "longitude") VALUES
	('fffe35c1-9270-4aa8-af46-0527f356ec76', '1bdc0d75-de5a-462e-8050-78169ac09139', NULL, '603, Tower - B5, Jaypee Klassic, Sector - 134, Noida', NULL, NULL, 'Noida', 'Uttar Pradesh', '201304', false, '2026-01-18 22:09:45.070077+00', 'test', 28.52454400, 77.39801600),
	('45e9f5af-5388-4dc4-aa4d-97408751c537', '6fec6f12-473a-4218-9ed5-783233bc4252', 'Home Address', '123, Test Apartment', 'Near Test Market', 'Test Landmark', 'Test City', 'Test State', '123456', true, '2026-01-25 09:41:31.79615+00', 'Test delivery notes', NULL, NULL);


--
-- Data for Name: vendors; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."vendors" ("id", "name", "contact_person", "phone", "email", "address", "payment_terms", "is_active", "created_at", "last_ordered") VALUES
	('dc7211d4-f4d5-44a3-a7ed-ec06df4b669d', 'Vegetable Vendor', 'Amit Sharma', '+91-98765-43211', 'ammit@veggies.com', NULL, 'COD', true, '2026-01-13 18:18:36.485961+00', NULL),
	('b975b9b7-3c97-4467-be08-651cb98a8d80', 'Packaging Supplies', 'Priya Patel', '+91-98765-43212', 'priya@packaging.com', NULL, 'Net 30', true, '2026-01-13 18:18:36.485961+00', NULL),
	('5e01287d-4bf6-48f7-9d75-d94ea9281057', 'Ahmad Chicken', 'Ahmad', '9958919265', 'aditya01889@gmail.com', 'Nangli, Sector - 134, Noida', '50% Advance', true, '2026-01-20 17:42:12.751204+00', NULL),
	('44f82e39-b7a4-49d2-ad95-51966b26226a', 'Fresh Meat Supplier', 'Raj Kumar', '+91-98765-43210', 'raj@freshmeat.com', NULL, 'Net 15', true, '2026-01-13 18:18:36.485961+00', NULL),
	('253f8435-1e34-4ebe-bfda-9de89b19c1b8', 'Health Store', 'Contact Name', '+91-XXXXXXXXXX', 'vendor@example.com', 'Auto-generated address', 'COD', true, '2026-01-23 13:32:35.793837+00', NULL),
	('10f415ed-816c-48ed-9148-412ec55da91e', 'Packaging Supplier', 'Contact Name', '+91-XXXXXXXXXX', 'vendor@example.com', 'Auto-generated address', 'COD', true, '2026-01-23 13:32:35.793837+00', NULL),
	('4e95be74-8f96-4974-9cdf-8003a3dc4292', 'Grocery Supplier', 'Contact Name', '+91-XXXXXXXXXX', 'vendor@example.com', 'Auto-generated address', 'COD', true, '2026-01-23 13:32:35.793837+00', NULL),
	('b59c33eb-af2e-41ae-876c-d096446b4966', 'Homemade', 'Contact Name', '+91-XXXXXXXXXX', 'vendor@example.com', 'Auto-generated address', 'COD', true, '2026-01-23 13:32:35.793837+00', NULL),
	('ce3823ba-bd9c-4194-93e4-d9b6249a9ccf', 'Premium Fish Supplier', 'Contact Name', '+91-XXXXXXXXXX', 'vendor@example.com', 'Auto-generated address', 'COD', true, '2026-01-23 13:32:35.793837+00', NULL),
	('1513f9f3-4184-46b8-bd35-da7b37e6e974', 'Local Supplier', 'Contact Name', '+91-XXXXXXXXXX', 'vendor@example.com', 'Auto-generated address', 'COD', true, '2026-01-23 13:32:35.793837+00', NULL),
	('37fc529c-283e-48d4-af40-a4dfdf5d61d7', 'Shipping Supplier', 'Contact Name', '+91-XXXXXXXXXX', 'vendor@example.com', 'Auto-generated address', 'COD', true, '2026-01-23 13:32:35.793837+00', NULL),
	('9c216322-a9c5-4994-bc44-c9087722282c', 'Pet Store', 'Contact Name', '+91-XXXXXXXXXX', 'vendor@example.com', 'Auto-generated address', 'COD', true, '2026-01-23 13:32:35.793837+00', NULL),
	('0c4b6af3-78ec-4238-947c-516802b64703', 'Fresh Meat Suppliers', 'Contact Name', '+91-XXXXXXXXXX', 'vendor@example.com', 'Auto-generated address', 'COD', true, '2026-01-23 13:32:35.793837+00', NULL),
	('145f5f36-8582-4a77-9c0b-89bde47c649b', 'Local Market', 'John Doe', '+91-98765-43210', 'realvendor@example.com', 'Auto-generated address', 'COD', true, '2026-01-23 13:32:35.793837+00', NULL),
	('9dacf72f-0997-444a-9b29-95644e5663ae', 'Local Farm', 'Contact Name', '+91-XXXXXXXXXX', 'vendor@example.com', 'Auto-generated address', 'COD', true, '2026-01-23 13:32:35.793837+00', '2026-01-27 09:02:02.627+00');


--
-- Data for Name: ingredients; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."ingredients" ("id", "name", "unit", "current_stock", "reorder_level", "unit_cost", "created_at", "updated_at", "supplier") VALUES
	('db9789e5-9369-4047-a0f8-27780b1ce015', 'Chicken', 'grams', 104.346, 5000.000, 0.29, '2026-01-13 18:18:36.485961+00', '2026-01-13 18:18:36.485961+00', '1513f9f3-4184-46b8-bd35-da7b37e6e974'),
	('6e43f4da-d41f-43de-a7ef-154181f7dc79', 'Banana', 'grams', 1299.857, 1500.000, 0.06, '2026-01-13 18:18:36.485961+00', '2026-01-13 18:18:36.485961+00', '145f5f36-8582-4a77-9c0b-89bde47c649b'),
	('bbf5cbf8-1d98-4cb3-a83e-fb5960e00ff2', 'Basa (Fish)', 'grams', 1200.000, 3000.000, 0.57, '2026-01-13 18:18:36.485961+00', '2026-01-13 18:18:36.485961+00', 'ce3823ba-bd9c-4194-93e4-d9b6249a9ccf'),
	('adad8c20-00ab-4831-8867-9c91ca78935c', 'Beetroot', 'grams', 700.000, 1500.000, 0.05, '2026-01-13 18:18:36.485961+00', '2026-01-13 18:18:36.485961+00', '9dacf72f-0997-444a-9b29-95644e5663ae'),
	('4344b5a0-c059-4ba0-86d1-8e7482b0041d', '70g Stand Up Pouch', 'pieces', 1000.000, 200.000, 2.50, '2026-01-25 23:19:11.959397+00', '2026-01-25 23:19:11.959397+00', NULL),
	('f04af2e8-0190-4282-868a-7e0a689c5d83', 'Cookie Jar', 'pieces', 300.000, 50.000, 8.00, '2026-01-25 23:19:11.959397+00', '2026-01-25 23:19:11.959397+00', NULL),
	('71589c5f-ac09-4b09-912b-5210d5d5c189', 'Cupcake Box', 'pieces', 400.000, 80.000, 4.00, '2026-01-25 23:19:11.959397+00', '2026-01-25 23:19:11.959397+00', NULL),
	('e4fbc6f5-11eb-4991-b6bd-ed909006b056', 'Nourish Label', 'pieces', 2000.000, 400.000, 0.50, '2026-01-25 23:19:11.959397+00', '2026-01-25 23:19:11.959397+00', NULL),
	('4e3d762d-e66b-483f-8d37-637d163aa632', 'Vitality Label', 'pieces', 2000.000, 400.000, 0.50, '2026-01-25 23:19:11.959397+00', '2026-01-25 23:19:11.959397+00', NULL),
	('988215fb-8d77-42ac-8c57-ec50bfb7ccc9', 'Power Label', 'pieces', 2000.000, 400.000, 0.50, '2026-01-25 23:19:11.959397+00', '2026-01-25 23:19:11.959397+00', NULL),
	('80aab7de-0282-4cae-a556-f49dc5a35b92', 'Supreme Label', 'pieces', 2000.000, 400.000, 0.50, '2026-01-25 23:19:11.959397+00', '2026-01-25 23:19:11.959397+00', NULL),
	('c1b8b45f-aa9d-4e75-9d35-8c2f601229b0', 'Nurture Label', 'pieces', 2000.000, 400.000, 0.50, '2026-01-25 23:19:11.959397+00', '2026-01-25 23:19:11.959397+00', NULL),
	('7949e75e-e383-4c23-9753-6aa9ceaf4330', 'Thrive Label', 'pieces', 2000.000, 400.000, 0.50, '2026-01-25 23:19:11.959397+00', '2026-01-25 23:19:11.959397+00', NULL),
	('7f44ffea-c423-4ad5-b33c-b2772f2f4266', 'Essence Label', 'pieces', 1000.000, 200.000, 0.60, '2026-01-25 23:19:11.959397+00', '2026-01-25 23:19:11.959397+00', NULL),
	('a3ea41ce-77bd-4815-8eb3-b1883326b961', 'Bone Rich Label', 'pieces', 1000.000, 200.000, 0.60, '2026-01-25 23:19:11.959397+00', '2026-01-25 23:19:11.959397+00', NULL),
	('0c49d242-962c-4683-8479-1d1e44f05201', 'Logo Sticker', 'pieces', 5000.000, 1000.000, 0.25, '2026-01-25 23:19:11.959397+00', '2026-01-25 23:19:11.959397+00', NULL),
	('fafe7f04-3319-4c31-a13b-8ae867bc33d4', '100ml Spout Pouch', 'pieces', 500.000, 100.000, 3.25, '2026-01-25 23:19:11.959397+00', '2026-01-25 23:19:11.959397+00', NULL),
	('1e5abb2b-4904-407d-9b00-c33c1286f5a1', 'Gram Flour', 'g', 500.000, 250.000, 1.00, '2026-01-27 05:09:11.077625+00', '2026-01-27 05:09:11.077625+00', NULL),
	('fbb6520f-7977-4eef-beee-dc42f1e9ac34', 'Eggs', 'pieces', 35.000, 60.000, 8.00, '2026-01-13 18:18:36.485961+00', '2026-01-25 22:03:30.393467+00', '9dacf72f-0997-444a-9b29-95644e5663ae'),
	('9a14c0f0-1bac-4a6a-8911-0a6f8bd2a776', 'Hearts', 'grams', 200.000, 800.000, 0.20, '2026-01-13 18:18:36.485961+00', '2026-01-13 18:18:36.485961+00', '1513f9f3-4184-46b8-bd35-da7b37e6e974'),
	('30912850-47c2-43f4-8b20-864a2a0504c4', 'Tuna', 'grams', 500.000, 1500.000, 1.40, '2026-01-13 18:18:36.485961+00', '2026-01-13 18:18:36.485961+00', 'ce3823ba-bd9c-4194-93e4-d9b6249a9ccf'),
	('511a547b-d8d8-44ae-b899-a14f621ac74f', 'Rice', 'grams', 1945.928, 5000.000, 0.00, '2026-01-13 18:18:36.485961+00', '2026-01-13 18:18:36.485961+00', '4e95be74-8f96-4974-9cdf-8003a3dc4292'),
	('42852e14-b034-4e8b-b3d0-7265272c6c85', 'Pumpkin', 'grams', 793.064, 3000.000, 0.07, '2026-01-13 18:18:36.485961+00', '2026-01-13 18:18:36.485961+00', '145f5f36-8582-4a77-9c0b-89bde47c649b'),
	('cf84ff33-1d0a-4645-a559-996a0c2cb6c2', 'Carrots', 'grams', 500.000, 1500.000, 0.00, '2026-01-13 18:18:36.485961+00', '2026-01-13 18:18:36.485961+00', '145f5f36-8582-4a77-9c0b-89bde47c649b'),
	('af4e7a6d-36ba-4073-aed8-d83c0d7d13b9', 'Virgin Coconut Oil', 'grams', 454.704, 1500.000, 0.00, '2026-01-13 18:18:36.485961+00', '2026-01-13 18:18:36.485961+00', '4e95be74-8f96-4974-9cdf-8003a3dc4292'),
	('ac8c0d87-9200-4b22-8545-4b6b91ab69a4', 'Oats', 'grams', 1000.000, 3000.000, 0.09, '2026-01-13 18:18:36.485961+00', '2026-01-13 18:18:36.485961+00', '4e95be74-8f96-4974-9cdf-8003a3dc4292'),
	('e59aa3b4-44c9-40c9-b628-570777c3dd9e', 'Oat Flour', 'grams', 903.680, 3000.000, 0.00, '2026-01-13 18:18:36.485961+00', '2026-01-13 18:18:36.485961+00', '4e95be74-8f96-4974-9cdf-8003a3dc4292'),
	('76e76623-56b9-4809-8afa-9f567a1f2b3a', 'Flaxseeds', 'grams', 200.000, 500.000, 0.00, '2026-01-13 18:18:36.485961+00', '2026-01-13 18:18:36.485961+00', '253f8435-1e34-4ebe-bfda-9de89b19c1b8'),
	('e3007499-1070-43ab-a662-883100b87a27', 'Salmon Oil', 'ml', 200.000, 500.000, 0.00, '2026-01-13 18:18:36.485961+00', '2026-01-13 18:18:36.485961+00', '9c216322-a9c5-4994-bc44-c9087722282c'),
	('aeb8b029-8668-415f-9d26-1a1f423463de', 'Seaweed', 'grams', 200.000, 500.000, 0.00, '2026-01-13 18:18:36.485961+00', '2026-01-13 18:18:36.485961+00', '253f8435-1e34-4ebe-bfda-9de89b19c1b8'),
	('2e2f019a-33c1-4373-9e76-b71611611a33', 'Psyllium Husk', 'grams', 100.000, 300.000, 0.00, '2026-01-13 18:18:36.485961+00', '2026-01-13 18:18:36.485961+00', '253f8435-1e34-4ebe-bfda-9de89b19c1b8'),
	('c5de1205-6eae-4863-9b7c-26384177b620', 'Labels (product stickers)', 'pieces', 200.000, 500.000, 2.00, '2026-01-13 18:18:36.485961+00', '2026-01-13 18:18:36.485961+00', '10f415ed-816c-48ed-9148-412ec55da91e'),
	('065171d6-56ad-4ec4-8430-39b3a9ccdfa9', 'Thermocol boxes (single size)', 'pieces', 10.000, 30.000, 75.00, '2026-01-13 18:18:36.485961+00', '2026-01-13 18:18:36.485961+00', '37fc529c-283e-48d4-af40-a4dfdf5d61d7'),
	('a6e3971e-14cd-4b41-9a51-b81869b8c8a4', 'Ice gel packs (150g)', 'pieces', 30.000, 100.000, 15.00, '2026-01-13 18:18:36.485961+00', '2026-01-13 18:18:36.485961+00', '37fc529c-283e-48d4-af40-a4dfdf5d61d7'),
	('8e531bf4-2a63-462d-b86f-9dd9a3666bd2', 'Packaging tape', 'rolls', 5.000, 15.000, 30.00, '2026-01-13 18:18:36.485961+00', '2026-01-13 18:18:36.485961+00', '37fc529c-283e-48d4-af40-a4dfdf5d61d7'),
	('418fcf1f-5957-483b-91fe-cafb9df8cdc5', 'Shipping labels', 'pieces', 50.000, 150.000, 2.00, '2026-01-13 18:18:36.485961+00', '2026-01-13 18:18:36.485961+00', '37fc529c-283e-48d4-af40-a4dfdf5d61d7'),
	('4ed35437-c7b2-4f4e-9a34-1e8d8d64f76a', 'Chicken Liver', 'grams', 1500.000, 300.000, 0.10, '2026-01-14 16:03:16.167049+00', '2026-01-14 16:03:16.167049+00', '0c4b6af3-78ec-4238-947c-516802b64703'),
	('0310a18d-f905-4684-bcf4-8adc50ea567a', 'Bone Broth', 'ml', 1100.000, 3000.000, 1.00, '2026-01-13 18:18:36.485961+00', '2026-01-13 18:18:36.485961+00', 'b59c33eb-af2e-41ae-876c-d096446b4966'),
	('9f2dea46-05f1-4cfd-873b-cf82a66a93a4', 'Rice Flour', 'g', 500.000, 250.000, 1.00, '2026-01-27 05:05:15.779772+00', '2026-01-27 05:05:15.779772+00', NULL),
	('635a914f-8c44-41e5-a6c8-fcca78a0cfc0', 'Chicken Broth Base', 'grams', 168.634, 1500.000, 0.00, '2026-01-13 18:18:36.485961+00', '2026-01-13 18:18:36.485961+00', 'b59c33eb-af2e-41ae-876c-d096446b4966');


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."orders" ("id", "order_number", "customer_id", "status", "payment_method", "payment_status", "subtotal", "delivery_fee", "total_amount", "delivery_address_id", "delivery_notes", "order_date", "confirmed_date", "production_start_date", "ready_date", "delivered_date", "created_at", "updated_at", "delivery_created", "production_started_at", "production_completed_at", "delivery_created_at", "delivery_pickedup_at", "delivery_in_transit_at", "delivery_delivered_at") VALUES
	('30671888-b26f-456c-bae4-cec69c1e6a49', 'ORD-40617048', '6fec6f12-473a-4218-9ed5-783233bc4252', 'out_for_delivery', 'cod', 'pending', 520.00, 0.00, 520.00, NULL, '{"customer_name":"Priyanka Yadav","customer_phone":"+919953940842","customer_email":"cozycatkitchen@gmail.com","customer_whatsapp":"+919953940842","address_line1":"603, Tower - B5, Jaypee Klassic, Sector - 134, Noida","address_line2":"","landmark":"","city":"Noida","state":"Uttar Pradesh","pincode":"201304","delivery_notes":"","is_guest_order":false}', '2026-01-17 09:03:37.092453+00', NULL, NULL, NULL, NULL, '2026-01-17 09:03:37.092453+00', '2026-01-25 19:51:33.598599+00', true, NULL, NULL, NULL, NULL, NULL, NULL),
	('5d46802e-9064-44fc-8b82-aa5da83e9929', 'ORD-58151409', '1bdc0d75-de5a-462e-8050-78169ac09139', 'out_for_delivery', 'online', 'paid', 210.00, 40.00, 250.00, NULL, '{"customer_name":"Admin User","customer_phone":"+919953940842","customer_email":"aditya01889@gmail.com","customer_whatsapp":"+919953940842","address_line1":"603, Tower - B5, Jaypee Klassic, Sector - 134, Noida","address_line2":"","landmark":"","city":"Noida","state":"Uttar Pradesh","pincode":"201304","delivery_notes":"","is_guest_order":false}', '2026-01-25 16:22:34.389178+00', NULL, NULL, '2026-01-25 17:45:00.5+00', NULL, '2026-01-25 16:22:34.389178+00', '2026-01-25 19:51:33.598599+00', true, NULL, NULL, NULL, NULL, NULL, NULL),
	('4005542a-5506-45b8-b84c-6e8b7c7bd224', 'ORD-57279845', '1bdc0d75-de5a-462e-8050-78169ac09139', 'pending', 'online', 'pending', 470.00, 40.00, 510.00, NULL, '{"customer_name":"Aditya Srivastava","customer_phone":"+919953940842","customer_email":"aditya01889@gmail.com","customer_whatsapp":"+919953940842","address_line1":"603, Tower - B5, Jaypee Klassic, Sector - 134, Noida","address_line2":"","landmark":"","city":"Noida","state":"Uttar Pradesh","pincode":"201304","delivery_notes":"","is_guest_order":false}', '2026-01-26 19:54:39.663822+00', NULL, NULL, NULL, NULL, '2026-01-26 19:54:39.663822+00', '2026-01-26 19:54:39.663822+00', false, NULL, NULL, NULL, NULL, NULL, NULL),
	('5a504de3-a8c1-44f4-92bd-ab389a605f42', 'ORD-27558652', NULL, 'out_for_delivery', 'cod', 'pending', 220.00, 40.00, 260.00, NULL, '{"customer_name":"Aditya Srivastava","customer_phone":"+919953940842","customer_email":"aditya01889@gmail.com","customer_whatsapp":"+919953940842","address_line1":"603, Tower - B5, Jaypee Klassic, Sector - 134, Noida","address_line2":"","landmark":"","city":"Noida","state":"Uttar Pradesh","pincode":"201304","delivery_notes":"","is_guest_order":true}', '2026-01-17 05:25:58.748533+00', '2026-01-23 22:23:24.67+00', '2026-01-23 22:23:24.67+00', '2026-01-23 22:41:42.262+00', NULL, '2026-01-17 05:25:58.748533+00', '2026-01-25 19:51:33.598599+00', true, NULL, NULL, NULL, NULL, NULL, NULL),
	('116e2163-c63a-4588-9362-95c208433e31', 'ORD-66837131', '1bdc0d75-de5a-462e-8050-78169ac09139', 'ready', 'online', 'pending', 470.00, 40.00, 510.00, NULL, '{"customer_name":"Aditya Srivastava","customer_phone":"+919953940842","customer_email":"aditya01889@gmail.com","customer_whatsapp":"+919953940842","address_line1":"603, Tower - B5, Jaypee Klassic, Sector - 134, Noida","address_line2":"","landmark":"","city":"Noida","state":"Uttar Pradesh","pincode":"201304","delivery_notes":"","is_guest_order":false}', '2026-01-18 20:07:21.966253+00', '2026-01-25 18:11:01.475+00', '2026-01-25 18:11:01.475+00', '2026-01-25 18:11:26.564+00', NULL, '2026-01-18 20:07:21.966253+00', '2026-01-25 19:51:33.598599+00', false, NULL, NULL, NULL, NULL, NULL, NULL),
	('fbcd882a-0e69-4d27-a3f5-33928940862f', 'ORD-32002516', NULL, 'out_for_delivery', 'cod', 'pending', 80.00, 40.00, 120.00, NULL, '{"customer_name":"Aditya Srivastava","customer_phone":"+919953940842","customer_email":"aditya01889@gmail.com","customer_whatsapp":"+919953940842","address_line1":"603, Tower - B5, Jaypee Klassic, Sector - 134, Noida","address_line2":"Sector 134","landmark":"","city":"Noida","state":"Uttar Pradesh","pincode":"201304","delivery_notes":""}', '2026-01-13 19:20:02.352734+00', NULL, NULL, NULL, NULL, '2026-01-13 19:20:02.352734+00', '2026-01-25 19:51:33.598599+00', true, NULL, NULL, NULL, NULL, NULL, NULL),
	('f4372062-0965-434c-ba77-8013f52a05d1', 'ORD-58219200', '1bdc0d75-de5a-462e-8050-78169ac09139', 'pending', 'online', 'pending', 470.00, 40.00, 510.00, NULL, '{"customer_name":"Aditya Srivastava","customer_phone":"+919953940842","customer_email":"aditya01889@gmail.com","customer_whatsapp":"+919953940842","address_line1":"603, Tower - B5, Jaypee Klassic, Sector - 134, Noida","address_line2":"","landmark":"","city":"Noida","state":"Uttar Pradesh","pincode":"201304","delivery_notes":"","is_guest_order":false}', '2026-01-26 20:10:19.028684+00', NULL, NULL, NULL, NULL, '2026-01-26 20:10:19.028684+00', '2026-01-26 20:10:19.028684+00', false, NULL, NULL, NULL, NULL, NULL, NULL),
	('71ef857d-43de-45e8-b84b-7fb2263471c9', 'ORD-96204546', NULL, 'delivered', 'cod', 'pending', 900.00, 0.00, 900.00, NULL, '{"customer_name":"Aditya Srivastava","customer_phone":"+919953940842","customer_email":"aditya01889@gmail.com","customer_whatsapp":"+919953940842","address_line1":"603, Tower - B5, Jaypee Klassic, Sector - 134, Noida","address_line2":"Sector 134","landmark":"","city":"Noida","state":"Uttar Pradesh","pincode":"201304","delivery_notes":""}', '2026-01-14 13:10:03.941192+00', NULL, NULL, NULL, NULL, '2026-01-14 13:10:03.941192+00', '2026-01-14 15:47:22.995605+00', false, NULL, NULL, NULL, NULL, NULL, NULL),
	('6ee43395-6b26-43aa-aa76-99b327802700', 'ORD-58381283', '1bdc0d75-de5a-462e-8050-78169ac09139', 'pending', 'online', 'pending', 470.00, 40.00, 510.00, NULL, '{"customer_name":"Aditya Srivastava","customer_phone":"+919953940842","customer_email":"aditya01889@gmail.com","customer_whatsapp":"+919953940842","address_line1":"603, Tower - B5, Jaypee Klassic, Sector - 134, Noida","address_line2":"","landmark":"","city":"Noida","state":"Uttar Pradesh","pincode":"201304","delivery_notes":"","is_guest_order":false}', '2026-01-26 20:13:01.07294+00', NULL, NULL, NULL, NULL, '2026-01-26 20:13:01.07294+00', '2026-01-26 20:13:01.07294+00', false, NULL, NULL, NULL, NULL, NULL, NULL),
	('5b580ef8-6ee4-4cd9-85fc-a11079260b5b', 'ORD-58928245', '1bdc0d75-de5a-462e-8050-78169ac09139', 'pending', 'online', 'pending', 470.00, 40.00, 510.00, NULL, '{"customer_name":"Aditya Srivastava","customer_phone":"+919953940842","customer_email":"aditya01889@gmail.com","customer_whatsapp":"+919953940842","address_line1":"603, Tower - B5, Jaypee Klassic, Sector - 134, Noida","address_line2":"","landmark":"","city":"Noida","state":"Uttar Pradesh","pincode":"201304","delivery_notes":"","is_guest_order":false}', '2026-01-26 20:22:08.063682+00', NULL, NULL, NULL, NULL, '2026-01-26 20:22:08.063682+00', '2026-01-26 20:22:08.063682+00', false, NULL, NULL, NULL, NULL, NULL, NULL),
	('49ffd9b0-628c-42b2-a4b3-23042aa6c275', 'ORD-82754929', '1bdc0d75-de5a-462e-8050-78169ac09139', 'delivered', 'cod', 'pending', 400.00, 40.00, 440.00, NULL, '{"customer_name":"Admin User","customer_phone":"+919953940842","customer_email":"aditya01889@gmail.com","customer_whatsapp":"+919953940842","address_line1":"603, Tower - B5, Jaypee Klassic, Sector - 134, Noida","address_line2":"","landmark":"","city":"Noida","state":"Uttar Pradesh","pincode":"201304","delivery_notes":"","is_guest_order":false}', '2026-01-17 20:45:57.628114+00', '2026-01-24 12:25:29.229+00', '2026-01-24 12:25:29.229+00', '2026-01-24 12:25:36.159+00', '2026-01-25 20:09:56.407122+00', '2026-01-17 20:45:57.628114+00', '2026-01-25 20:09:56.407122+00', true, NULL, NULL, NULL, '2026-01-25 20:04:30.049971', '2026-01-25 20:07:35.830418', '2026-01-25 20:09:56.407122'),
	('239d581f-848f-41af-a9f6-38acd3e6af5d', 'ORD-26633295', '1bdc0d75-de5a-462e-8050-78169ac09139', 'pending', 'online', 'pending', 300.00, 40.00, 340.00, NULL, '{"customer_name":"Aditya Srivastava","customer_phone":"+919953940842","customer_email":"aditya01889@gmail.com","customer_whatsapp":"+919953940842","address_line1":"603, Tower - B5, Jaypee Klassic, Sector - 134, Noida","address_line2":"","landmark":"","city":"Noida","state":"Uttar Pradesh","pincode":"201304","delivery_notes":"","is_guest_order":false}', '2026-01-26 11:23:53.513458+00', NULL, NULL, NULL, NULL, '2026-01-26 11:23:53.513458+00', '2026-01-26 11:23:53.513458+00', false, NULL, NULL, NULL, NULL, NULL, NULL),
	('beee4e6a-ce8d-4944-98da-a747793484df', 'ORD-26659812', '1bdc0d75-de5a-462e-8050-78169ac09139', 'pending', 'online', 'pending', 300.00, 40.00, 340.00, NULL, '{"customer_name":"Admin User","customer_phone":"+919953940842","customer_email":"aditya01889@gmail.com","customer_whatsapp":"+919953940842","address_line1":"603, Tower - B5, Jaypee Klassic, Sector - 134, Noida","address_line2":"","landmark":"","city":"Noida","state":"Uttar Pradesh","pincode":"201304","delivery_notes":"","is_guest_order":false}', '2026-01-26 11:24:19.999648+00', NULL, NULL, NULL, NULL, '2026-01-26 11:24:19.999648+00', '2026-01-26 11:24:19.999648+00', false, NULL, NULL, NULL, NULL, NULL, NULL),
	('58126ba0-44f6-40cc-a324-978eb81aa8da', 'ORD-59479589', '1bdc0d75-de5a-462e-8050-78169ac09139', 'pending', 'online', 'pending', 470.00, 40.00, 510.00, NULL, '{"customer_name":"Aditya Srivastava","customer_phone":"+919953940842","customer_email":"aditya01889@gmail.com","customer_whatsapp":"+919953940842","address_line1":"603, Tower - B5, Jaypee Klassic, Sector - 134, Noida","address_line2":"","landmark":"","city":"Noida","state":"Uttar Pradesh","pincode":"201304","delivery_notes":"","is_guest_order":false}', '2026-01-26 20:31:19.351219+00', NULL, NULL, NULL, NULL, '2026-01-26 20:31:19.351219+00', '2026-01-26 20:31:19.351219+00', false, NULL, NULL, NULL, NULL, NULL, NULL),
	('630dbc6f-2179-4ed7-924b-29c9ce2f05ab', 'ORD-59753926', '1bdc0d75-de5a-462e-8050-78169ac09139', 'pending', 'online', 'pending', 470.00, 40.00, 510.00, NULL, '{"customer_name":"Admin User","customer_phone":"+919953940842","customer_email":"aditya01889@gmail.com","customer_whatsapp":"+919953940842","address_line1":"603, Tower - B5, Jaypee Klassic, Sector - 134, Noida","address_line2":"","landmark":"","city":"Noida","state":"Uttar Pradesh","pincode":"201304","delivery_notes":"","is_guest_order":false}', '2026-01-26 20:35:53.696764+00', NULL, NULL, NULL, NULL, '2026-01-26 20:35:53.696764+00', '2026-01-26 20:35:53.696764+00', false, NULL, NULL, NULL, NULL, NULL, NULL),
	('948b9006-32a3-4f83-8026-948040f30897', 'ORD-60339016', '1bdc0d75-de5a-462e-8050-78169ac09139', 'pending', 'online', 'pending', 470.00, 40.00, 510.00, NULL, '{"customer_name":"Admin User","customer_phone":"9876543210","customer_email":"aditya01889@gmail.com","customer_whatsapp":"9876543210","address_line1":"abc, 123 lane","address_line2":"","landmark":"","city":"Delhi","state":"Delhi","pincode":"110001","delivery_notes":"","is_guest_order":false}', '2026-01-26 20:45:38.815211+00', NULL, NULL, NULL, NULL, '2026-01-26 20:45:38.815211+00', '2026-01-26 20:45:38.815211+00', false, NULL, NULL, NULL, NULL, NULL, NULL),
	('d8c011f7-b07f-4d99-95f2-895969b7a27d', 'ORD-66942014', '1bdc0d75-de5a-462e-8050-78169ac09139', 'ready', 'online', 'pending', 470.00, 40.00, 510.00, NULL, '{"customer_name":"Aditya Srivastava","customer_phone":"+919953940842","customer_email":"aditya01889@gmail.com","customer_whatsapp":"+919953940842","address_line1":"603, Tower - B5, Jaypee Klassic, Sector - 134, Noida","address_line2":"","landmark":"","city":"Noida","state":"Uttar Pradesh","pincode":"201304","delivery_notes":"","is_guest_order":false}', '2026-01-18 20:09:06.8611+00', '2026-01-25 18:48:19.092+00', '2026-01-25 18:48:19.092+00', '2026-01-25 18:48:42.719+00', NULL, '2026-01-18 20:09:06.8611+00', '2026-01-25 19:51:33.598599+00', false, NULL, NULL, NULL, NULL, NULL, NULL),
	('0c09b0d9-f404-4715-8aa2-abc38d3d8720', 'ORD-78197887', NULL, 'out_for_delivery', 'cod', 'pending', 300.00, 40.00, 340.00, NULL, '{"customer_name":"Aditya Srivastava","customer_phone":"+919953940842","customer_email":"aditya01889@gmail.com","customer_whatsapp":"+919953940842","address_line1":"603, Tower - B5, Jaypee Klassic, Sector - 134, Noida","address_line2":"Sector 134","landmark":"","city":"Noida","state":"Uttar Pradesh","pincode":"201304","delivery_notes":"","is_guest_order":true}', '2026-01-16 15:43:19.038653+00', '2026-01-23 20:01:23.085+00', '2026-01-23 20:01:23.085+00', '2026-01-23 20:02:15.452+00', NULL, '2026-01-16 15:43:19.038653+00', '2026-01-25 19:51:33.598599+00', true, NULL, NULL, NULL, NULL, NULL, NULL),
	('bf3198fa-ac34-483c-9a1f-a19c5c54affa', 'ORD-67635288', '1bdc0d75-de5a-462e-8050-78169ac09139', 'pending', 'online', 'pending', 470.00, 40.00, 510.00, NULL, '{"customer_name":"Aditya Srivastava","customer_phone":"+919953940842","customer_email":"aditya01889@gmail.com","customer_whatsapp":"+919953940842","address_line1":"603, Tower - B5, Jaypee Klassic, Sector - 134, Noida","address_line2":"","landmark":"","city":"Noida","state":"Uttar Pradesh","pincode":"201304","delivery_notes":"","is_guest_order":false}', '2026-01-18 20:20:40.073931+00', NULL, NULL, NULL, NULL, '2026-01-18 20:20:40.073931+00', '2026-01-18 20:20:40.073931+00', false, NULL, NULL, NULL, NULL, NULL, NULL),
	('e85d9397-82d8-467f-b3e5-48992ef7bc7f', 'ORD-77502459', NULL, 'out_for_delivery', 'cod', 'pending', 500.00, 0.00, 500.00, NULL, '{"customer_name":"Aditya Srivastava","customer_phone":"+919953940842","customer_email":"aditya01889@gmail.com","customer_whatsapp":"+919953940842","address_line1":"603, Tower - B5, Jaypee Klassic, Sector - 134, Noida","address_line2":"Sector 134","landmark":"","city":"Noida","state":"Uttar Pradesh","pincode":"201304","delivery_notes":""}', '2026-01-16 15:31:43.663232+00', '2026-01-23 19:48:40.053+00', '2026-01-23 19:48:40.053+00', '2026-01-23 19:51:33.795+00', NULL, '2026-01-16 15:31:43.663232+00', '2026-01-25 19:51:33.598599+00', true, NULL, NULL, NULL, NULL, NULL, NULL),
	('4a5142a3-2d8d-478f-bd59-c2f2655b99b7', 'ORD-97720548', '1bdc0d75-de5a-462e-8050-78169ac09139', 'out_for_delivery', 'cod', 'pending', 400.00, 40.00, 440.00, NULL, '{"customer_name":"Admin User","customer_phone":"+919953940842","customer_email":"aditya01889@gmail.com","customer_whatsapp":"+919953940842","address_line1":"603, Tower - B5, Jaypee Klassic, Sector - 134, Noida","address_line2":"","landmark":"","city":"Noida","state":"Uttar Pradesh","pincode":"201304","delivery_notes":"","is_guest_order":false}', '2026-01-16 21:08:41.309475+00', '2026-01-23 22:16:50.996+00', '2026-01-23 22:16:50.996+00', '2026-01-23 22:23:12.414+00', NULL, '2026-01-16 21:08:41.309475+00', '2026-01-25 19:51:33.598599+00', true, NULL, NULL, NULL, NULL, NULL, NULL),
	('53765906-5672-4fe6-b648-2a4b866f3bd1', 'ORD-58402400', '1bdc0d75-de5a-462e-8050-78169ac09139', 'pending', 'online', 'pending', 470.00, 40.00, 510.00, NULL, '{"customer_name":"Admin User","customer_phone":"+919953940842","customer_email":"aditya01889@gmail.com","customer_whatsapp":"+919953940842","address_line1":"603, Tower - B5, Jaypee Klassic, Sector - 134, Noida","address_line2":"","landmark":"","city":"Noida","state":"Uttar Pradesh","pincode":"201304","delivery_notes":"","is_guest_order":false}', '2026-01-26 20:13:22.191368+00', NULL, NULL, NULL, NULL, '2026-01-26 20:13:22.191368+00', '2026-01-26 20:13:22.191368+00', false, NULL, NULL, NULL, NULL, NULL, NULL),
	('b3c4713e-0faf-4075-9ffa-02c7c54166e4', 'ORD-67449426', '1bdc0d75-de5a-462e-8050-78169ac09139', 'delivered', 'online', 'pending', 470.00, 40.00, 510.00, NULL, '{"customer_name":"Aditya Srivastava","customer_phone":"+919953940842","customer_email":"aditya01889@gmail.com","customer_whatsapp":"+919953940842","address_line1":"603, Tower - B5, Jaypee Klassic, Sector - 134, Noida","address_line2":"","landmark":"","city":"Noida","state":"Uttar Pradesh","pincode":"201304","delivery_notes":"","is_guest_order":false}', '2026-01-18 20:17:34.230635+00', '2026-01-25 19:12:51.707+00', '2026-01-25 19:12:51.707+00', '2026-01-25 19:13:55.308+00', '2026-01-25 20:51:52.587856+00', '2026-01-18 20:17:34.230635+00', '2026-01-25 20:51:52.587856+00', true, NULL, NULL, NULL, '2026-01-25 20:50:50.785479', '2026-01-25 20:51:24.78558', '2026-01-25 20:51:52.587856'),
	('5666525a-6405-4f8d-aa65-e5a540c0897c', 'ORD-57052501', '1bdc0d75-de5a-462e-8050-78169ac09139', 'pending', 'online', 'pending', 470.00, 40.00, 510.00, NULL, '{"customer_name":"Admin User","customer_phone":"+919953940842","customer_email":"aditya01889@gmail.com","customer_whatsapp":"+919953940842","address_line1":"603, Tower - B5, Jaypee Klassic, Sector - 134, Noida","address_line2":"","landmark":"","city":"Noida","state":"Uttar Pradesh","pincode":"201304","delivery_notes":"","is_guest_order":false}', '2026-01-26 19:50:52.358986+00', NULL, NULL, NULL, NULL, '2026-01-26 19:50:52.358986+00', '2026-01-26 19:50:52.358986+00', false, NULL, NULL, NULL, NULL, NULL, NULL),
	('3cf3d6af-26a5-4c1c-9320-caa59ae8f33c', 'ORD-31420392', NULL, 'cancelled', 'cod', 'pending', 580.00, 0.00, 0.00, NULL, '{"customer_name":"Aditya Srivastava","customer_phone":"+919953940842","customer_email":"aditya01889@gmail.com","customer_whatsapp":"+919953940842","address_line1":"603, Tower - B5, Jaypee Klassic, Sector - 134, Noida","address_line2":"Sector 134","landmark":"","city":"Noida","state":"Uttar Pradesh","pincode":"201304","delivery_notes":""}::{"cancellation_reason":"No order items found - data corruption detected","cancellation_date":"2026-01-24 00:21:02.071323+00"}', '2026-01-13 19:10:20.61871+00', NULL, NULL, NULL, NULL, '2026-01-13 19:10:20.61871+00', '2026-01-24 00:21:02.071323+00', false, NULL, NULL, NULL, NULL, NULL, NULL),
	('6b9378b2-5dbf-48d7-9749-e9a7202091bd', 'ORD-31528760', NULL, 'cancelled', 'cod', 'pending', 580.00, 0.00, 0.00, NULL, '{"customer_name":"Aditya Srivastava","customer_phone":"+919953940842","customer_email":"aditya01889@gmail.com","customer_whatsapp":"+919953940842","address_line1":"603, Tower - B5, Jaypee Klassic, Sector - 134, Noida","address_line2":"Sector 134","landmark":"","city":"Noida","state":"Uttar Pradesh","pincode":"201304","delivery_notes":""}::{"cancellation_reason":"No order items found - data corruption detected","cancellation_date":"2026-01-24 00:21:02.071323+00"}', '2026-01-13 19:12:08.684792+00', NULL, NULL, NULL, NULL, '2026-01-13 19:12:08.684792+00', '2026-01-24 00:21:02.071323+00', false, NULL, NULL, NULL, NULL, NULL, NULL),
	('bc37fa40-98f9-40b6-b260-f1b86549ba18', 'ORD-57299819', '1bdc0d75-de5a-462e-8050-78169ac09139', 'pending', 'online', 'pending', 470.00, 40.00, 510.00, NULL, '{"customer_name":"Aditya Srivastava","customer_phone":"+919953940842","customer_email":"aditya01889@gmail.com","customer_whatsapp":"+919953940842","address_line1":"603, Tower - B5, Jaypee Klassic, Sector - 134, Noida","address_line2":"","landmark":"","city":"Noida","state":"Uttar Pradesh","pincode":"201304","delivery_notes":"","is_guest_order":false}', '2026-01-26 19:54:59.647416+00', NULL, NULL, NULL, NULL, '2026-01-26 19:54:59.647416+00', '2026-01-26 19:54:59.647416+00', false, NULL, NULL, NULL, NULL, NULL, NULL),
	('f20e5133-47a6-4f36-8c23-5cc1b0441cc4', 'ORD-58234904', '1bdc0d75-de5a-462e-8050-78169ac09139', 'pending', 'online', 'pending', 470.00, 40.00, 510.00, NULL, '{"customer_name":"Aditya Srivastava","customer_phone":"+919953940842","customer_email":"aditya01889@gmail.com","customer_whatsapp":"+919953940842","address_line1":"603, Tower - B5, Jaypee Klassic, Sector - 134, Noida","address_line2":"","landmark":"","city":"Noida","state":"Uttar Pradesh","pincode":"201304","delivery_notes":"","is_guest_order":false}', '2026-01-26 20:10:34.838846+00', NULL, NULL, NULL, NULL, '2026-01-26 20:10:34.838846+00', '2026-01-26 20:10:34.838846+00', false, NULL, NULL, NULL, NULL, NULL, NULL),
	('2efd5832-cc0c-4d83-a556-f38c467f5c74', 'ORD-59291471', '1bdc0d75-de5a-462e-8050-78169ac09139', 'pending', 'online', 'pending', 470.00, 40.00, 510.00, NULL, '{"customer_name":"Admin User","customer_phone":"+919953940842","customer_email":"aditya01889@gmail.com","customer_whatsapp":"+919953940842","address_line1":"603, Tower - B5, Jaypee Klassic, Sector - 134, Noida","address_line2":"","landmark":"","city":"Noida","state":"Uttar Pradesh","pincode":"201304","delivery_notes":"","is_guest_order":false}', '2026-01-26 20:28:11.23505+00', NULL, NULL, NULL, NULL, '2026-01-26 20:28:11.23505+00', '2026-01-26 20:28:11.23505+00', false, NULL, NULL, NULL, NULL, NULL, NULL),
	('d2feb8fe-430f-437e-850e-962c16105d64', 'ORD-59623468', '1bdc0d75-de5a-462e-8050-78169ac09139', 'pending', 'online', 'pending', 470.00, 40.00, 510.00, NULL, '{"customer_name":"Aditya Srivastava","customer_phone":"+919953940842","customer_email":"aditya01889@gmail.com","customer_whatsapp":"+919953940842","address_line1":"603, Tower - B5, Jaypee Klassic, Sector - 134, Noida","address_line2":"","landmark":"","city":"Noida","state":"Uttar Pradesh","pincode":"201304","delivery_notes":"","is_guest_order":false}', '2026-01-26 20:33:43.224592+00', NULL, NULL, NULL, NULL, '2026-01-26 20:33:43.224592+00', '2026-01-26 20:33:43.224592+00', false, NULL, NULL, NULL, NULL, NULL, NULL),
	('728876d1-1480-49fa-8ece-37eeee15bd18', 'ORD-59924868', '1bdc0d75-de5a-462e-8050-78169ac09139', 'pending', 'online', 'pending', 470.00, 40.00, 510.00, NULL, '{"customer_name":"Aditya Srivastava","customer_phone":"+919953940842","customer_email":"aditya01889@gmail.com","customer_whatsapp":"+919953940842","address_line1":"603, Tower - B5, Jaypee Klassic, Sector - 134, Noida","address_line2":"","landmark":"","city":"Noida","state":"Uttar Pradesh","pincode":"201304","delivery_notes":"","is_guest_order":false}', '2026-01-26 20:38:44.669435+00', NULL, NULL, NULL, NULL, '2026-01-26 20:38:44.669435+00', '2026-01-26 20:38:44.669435+00', false, NULL, NULL, NULL, NULL, NULL, NULL),
	('14cf586b-a754-4128-99bf-e0961fc87955', 'ORD-67932407', '1bdc0d75-de5a-462e-8050-78169ac09139', 'out_for_delivery', 'online', 'paid', 470.00, 40.00, 510.00, NULL, '{"customer_name":"Aditya Srivastava","customer_phone":"+919953940842","customer_email":"aditya01889@gmail.com","customer_whatsapp":"+919953940842","address_line1":"603, Tower - B5, Jaypee Klassic, Sector - 134, Noida","address_line2":"","landmark":"","city":"Noida","state":"Uttar Pradesh","pincode":"201304","delivery_notes":"","is_guest_order":false}', '2026-01-18 20:25:37.19322+00', NULL, NULL, '2026-01-23 22:14:52.459+00', NULL, '2026-01-18 20:25:37.19322+00', '2026-01-25 19:51:33.598599+00', true, NULL, NULL, NULL, NULL, NULL, NULL),
	('19c65ff1-f2b7-49b4-b5ed-e989bd321a45', 'ORD-67400565', '1bdc0d75-de5a-462e-8050-78169ac09139', 'out_for_delivery', 'online', 'pending', 470.00, 40.00, 510.00, NULL, '{"customer_name":"Aditya Srivastava","customer_phone":"+919953940842","customer_email":"aditya01889@gmail.com","customer_whatsapp":"+919953940842","address_line1":"603, Tower - B5, Jaypee Klassic, Sector - 134, Noida","address_line2":"","landmark":"","city":"Noida","state":"Uttar Pradesh","pincode":"201304","delivery_notes":"","is_guest_order":false}', '2026-01-18 20:16:45.366001+00', '2026-01-25 18:52:23.844+00', '2026-01-25 18:52:23.844+00', '2026-01-25 18:56:55.313+00', NULL, '2026-01-18 20:16:45.366001+00', '2026-01-25 19:51:33.598599+00', true, NULL, NULL, NULL, NULL, NULL, NULL),
	('5feb4f7f-5ad4-411e-833e-16200c1923ba', 'ORD-34299892', '6fec6f12-473a-4218-9ed5-783233bc4252', 'out_for_delivery', 'cod', 'pending', 340.00, 40.00, 380.00, NULL, '{"customer_name":"Priyanka Yadav","customer_phone":"+919953940842","customer_email":"cozycatkitchen@gmail.com","customer_whatsapp":"+919953940842","address_line1":"603, Tower - B5, Jaypee Klassic, Sector - 134, Noida","address_line2":"","landmark":"","city":"Noida","state":"Uttar Pradesh","pincode":"201304","delivery_notes":"","is_guest_order":false}', '2026-01-17 07:18:21.826293+00', '2026-01-24 12:51:29.245+00', '2026-01-24 12:51:29.245+00', NULL, NULL, '2026-01-17 07:18:21.826293+00', '2026-01-25 19:51:33.598599+00', true, NULL, NULL, NULL, NULL, NULL, NULL),
	('64d03ae6-8628-4e14-940f-c90263a425c6', 'ORD-80996392', NULL, 'out_for_delivery', 'cod', 'pending', 300.00, 40.00, 340.00, NULL, '{"customer_name":"Aditya Srivastava","customer_phone":"+919953940842","customer_email":"aditya01889@gmail.com","customer_whatsapp":"+919953940842","address_line1":"603, Tower - B5, Jaypee Klassic, Sector - 134, Noida","address_line2":"Sector 134","landmark":"","city":"Noida","state":"Uttar Pradesh","pincode":"201304","delivery_notes":""}', '2026-01-14 08:56:35.680839+00', NULL, NULL, NULL, NULL, '2026-01-14 08:56:35.680839+00', '2026-01-25 19:51:33.598599+00', true, NULL, NULL, NULL, NULL, NULL, NULL),
	('3a2be9a6-588a-4a93-9e04-999216891c31', 'ORD-31621538', NULL, 'out_for_delivery', 'cod', 'pending', 580.00, 0.00, 580.00, NULL, '{"customer_name":"Aditya Srivastava","customer_phone":"+919953940842","customer_email":"aditya01889@gmail.com","customer_whatsapp":"+919953940842","address_line1":"603, Tower - B5, Jaypee Klassic, Sector - 134, Noida","address_line2":"Sector 134","landmark":"","city":"Noida","state":"Uttar Pradesh","pincode":"201304","delivery_notes":""}', '2026-01-13 19:13:41.43316+00', NULL, NULL, NULL, NULL, '2026-01-13 19:13:41.43316+00', '2026-01-25 19:51:33.598599+00', true, NULL, NULL, NULL, NULL, NULL, NULL),
	('21aa7e58-4d2f-487b-bfbc-ba9c29cdf079', 'ORD-33936528', NULL, 'out_for_delivery', 'cod', 'pending', 400.00, 40.00, 440.00, NULL, '{"customer_name":"Aditya Srivastava","customer_phone":"+919953940842","customer_email":"aditya01889@gmail.com","customer_whatsapp":"+919953940842","address_line1":"603, Tower - B5, Jaypee Klassic, Sector - 134, Noida","address_line2":"","landmark":"","city":"Noida","state":"Uttar Pradesh","pincode":"201304","delivery_notes":"","is_guest_order":true}', '2026-01-17 07:12:18.527451+00', '2026-01-23 22:28:43.45+00', '2026-01-23 22:28:43.45+00', '2026-01-24 12:24:10.158+00', NULL, '2026-01-17 07:12:18.527451+00', '2026-01-25 19:51:33.598599+00', true, NULL, NULL, NULL, NULL, NULL, NULL),
	('bab1460e-0f2c-41a3-8efb-ba40eec61acd', 'ORD-46410701', '1bdc0d75-de5a-462e-8050-78169ac09139', 'out_for_delivery', 'online', 'pending', 470.00, 40.00, 510.00, NULL, '{"customer_name":"Aditya Srivastava","customer_phone":"+919953940842","customer_email":"aditya01889@gmail.com","customer_whatsapp":"+919953940842","address_line1":"603, Tower - B5, Jaypee Klassic, Sector - 134, Noida","address_line2":"","landmark":"","city":"Noida","state":"Uttar Pradesh","pincode":"201304","delivery_notes":"","is_guest_order":false}', '2026-01-18 14:26:55.127328+00', '2026-01-24 12:26:13.49+00', '2026-01-24 12:26:13.49+00', '2026-01-24 12:26:21.207+00', NULL, '2026-01-18 14:26:55.127328+00', '2026-01-25 19:51:33.598599+00', true, NULL, NULL, NULL, NULL, NULL, NULL),
	('ee7c805c-489e-4045-8700-e9ea6b907540', 'ORD-57133967', '1bdc0d75-de5a-462e-8050-78169ac09139', 'pending', 'online', 'pending', 470.00, 40.00, 510.00, NULL, '{"customer_name":"Aditya Srivastava","customer_phone":"+919953940842","customer_email":"aditya01889@gmail.com","customer_whatsapp":"+919953940842","address_line1":"603, Tower - B5, Jaypee Klassic, Sector - 134, Noida","address_line2":"","landmark":"","city":"Noida","state":"Uttar Pradesh","pincode":"201304","delivery_notes":"","is_guest_order":false}', '2026-01-26 19:52:13.791142+00', NULL, NULL, NULL, NULL, '2026-01-26 19:52:13.791142+00', '2026-01-26 19:52:13.791142+00', false, NULL, NULL, NULL, NULL, NULL, NULL),
	('9f5dec03-4977-47a9-9f08-4fadebb86b35', 'ORD-57405392', '1bdc0d75-de5a-462e-8050-78169ac09139', 'pending', 'online', 'pending', 470.00, 40.00, 510.00, NULL, '{"customer_name":"Aditya Srivastava","customer_phone":"+919953940842","customer_email":"aditya01889@gmail.com","customer_whatsapp":"+919953940842","address_line1":"603, Tower - B5, Jaypee Klassic, Sector - 134, Noida","address_line2":"","landmark":"","city":"Noida","state":"Uttar Pradesh","pincode":"201304","delivery_notes":"","is_guest_order":false}', '2026-01-26 19:56:45.202239+00', NULL, NULL, NULL, NULL, '2026-01-26 19:56:45.202239+00', '2026-01-26 19:56:45.202239+00', false, NULL, NULL, NULL, NULL, NULL, NULL),
	('219126f7-a384-42dc-ad7a-5c9b10b08127', 'ORD-58309622', '1bdc0d75-de5a-462e-8050-78169ac09139', 'pending', 'online', 'pending', 470.00, 40.00, 510.00, NULL, '{"customer_name":"Aditya Srivastava","customer_phone":"+919953940842","customer_email":"aditya01889@gmail.com","customer_whatsapp":"+919953940842","address_line1":"603, Tower - B5, Jaypee Klassic, Sector - 134, Noida","address_line2":"","landmark":"","city":"Noida","state":"Uttar Pradesh","pincode":"201304","delivery_notes":"","is_guest_order":false}', '2026-01-26 20:11:49.423808+00', NULL, NULL, NULL, NULL, '2026-01-26 20:11:49.423808+00', '2026-01-26 20:11:49.423808+00', false, NULL, NULL, NULL, NULL, NULL, NULL),
	('649f1197-14c3-4cfa-b80a-8aad2fc54f67', 'ORD-58816216', '1bdc0d75-de5a-462e-8050-78169ac09139', 'pending', 'online', 'pending', 470.00, 40.00, 510.00, NULL, '{"customer_name":"Admin User","customer_phone":"+919953940842","customer_email":"aditya01889@gmail.com","customer_whatsapp":"+919953940842","address_line1":"603, Tower - B5, Jaypee Klassic, Sector - 134, Noida","address_line2":"","landmark":"","city":"Noida","state":"Uttar Pradesh","pincode":"201304","delivery_notes":"","is_guest_order":false}', '2026-01-26 20:20:15.993986+00', NULL, NULL, NULL, NULL, '2026-01-26 20:20:15.993986+00', '2026-01-26 20:20:15.993986+00', false, NULL, NULL, NULL, NULL, NULL, NULL),
	('09a21282-b781-4b46-968c-74ec4c5212c1', 'ORD-59462388', '1bdc0d75-de5a-462e-8050-78169ac09139', 'pending', 'online', 'pending', 470.00, 40.00, 510.00, NULL, '{"customer_name":"Aditya Srivastava","customer_phone":"+919953940842","customer_email":"aditya01889@gmail.com","customer_whatsapp":"+919953940842","address_line1":"603, Tower - B5, Jaypee Klassic, Sector - 134, Noida","address_line2":"","landmark":"","city":"Noida","state":"Uttar Pradesh","pincode":"201304","delivery_notes":"","is_guest_order":false}', '2026-01-26 20:31:02.162697+00', NULL, NULL, NULL, NULL, '2026-01-26 20:31:02.162697+00', '2026-01-26 20:31:02.162697+00', false, NULL, NULL, NULL, NULL, NULL, NULL),
	('f79866ff-d14c-4a7c-9daf-42e025de703b', 'ORD-59679586', '1bdc0d75-de5a-462e-8050-78169ac09139', 'pending', 'online', 'pending', 470.00, 40.00, 510.00, NULL, '{"customer_name":"Aditya Srivastava","customer_phone":"+919953940842","customer_email":"aditya01889@gmail.com","customer_whatsapp":"+919953940842","address_line1":"603, Tower - B5, Jaypee Klassic, Sector - 134, Noida","address_line2":"","landmark":"","city":"Noida","state":"Uttar Pradesh","pincode":"201304","delivery_notes":"","is_guest_order":false}', '2026-01-26 20:34:39.369437+00', NULL, NULL, NULL, NULL, '2026-01-26 20:34:39.369437+00', '2026-01-26 20:34:39.369437+00', false, NULL, NULL, NULL, NULL, NULL, NULL),
	('ceca13df-8100-4671-ab48-a379adcfbbc0', 'ORD-60116546', '1bdc0d75-de5a-462e-8050-78169ac09139', 'pending', 'online', 'pending', 470.00, 40.00, 510.00, NULL, '{"customer_name":"Aditya Srivastava","customer_phone":"+919953940842","customer_email":"aditya01889@gmail.com","customer_whatsapp":"+919953940842","address_line1":"603, Tower - B5, Jaypee Klassic, Sector - 134, Noida","address_line2":"","landmark":"","city":"Noida","state":"Uttar Pradesh","pincode":"201304","delivery_notes":"","is_guest_order":false}', '2026-01-26 20:41:56.308929+00', NULL, NULL, NULL, NULL, '2026-01-26 20:41:56.308929+00', '2026-01-26 20:41:56.308929+00', false, NULL, NULL, NULL, NULL, NULL, NULL),
	('744ffe2b-9f5e-4838-a625-135f7af01fe6', 'ORD-60131292', '1bdc0d75-de5a-462e-8050-78169ac09139', 'pending', 'online', 'pending', 470.00, 40.00, 510.00, NULL, '{"customer_name":"Aditya Srivastava","customer_phone":"+919953940842","customer_email":"aditya01889@gmail.com","customer_whatsapp":"+919953940842","address_line1":"603, Tower - B5, Jaypee Klassic, Sector - 134, Noida","address_line2":"","landmark":"","city":"Noida","state":"Uttar Pradesh","pincode":"201304","delivery_notes":"","is_guest_order":false}', '2026-01-26 20:42:11.039944+00', NULL, NULL, NULL, NULL, '2026-01-26 20:42:11.039944+00', '2026-01-26 20:42:11.039944+00', false, NULL, NULL, NULL, NULL, NULL, NULL),
	('00b2483c-1fdf-4516-9bd9-92178b7b545b', 'ORD-60432364', '1bdc0d75-de5a-462e-8050-78169ac09139', 'pending', 'online', 'pending', 470.00, 40.00, 510.00, NULL, '{"customer_name":"Admin User","customer_phone":"9953940842","customer_email":"","customer_whatsapp":"9953940842","address_line1":"123, Abc lane","address_line2":"","landmark":"","city":"Delhi","state":"Delhi","pincode":"110001","delivery_notes":"","is_guest_order":false}', '2026-01-26 20:47:12.127509+00', NULL, NULL, NULL, NULL, '2026-01-26 20:47:12.127509+00', '2026-01-26 20:47:12.127509+00', false, NULL, NULL, NULL, NULL, NULL, NULL),
	('f8e063ca-e73a-42a5-82f8-7537499c89f3', 'ORD-60523300', '1bdc0d75-de5a-462e-8050-78169ac09139', 'pending', 'online', 'pending', 470.00, 40.00, 510.00, NULL, '{"customer_name":"Aditya Srivastava","customer_phone":"+919953940842","customer_email":"aditya01889@gmail.com","customer_whatsapp":"+919953940842","address_line1":"603, Tower - B5, Jaypee Klassic, Sector - 134, Noida","address_line2":"","landmark":"","city":"Noida","state":"Uttar Pradesh","pincode":"201304","delivery_notes":"","is_guest_order":false}', '2026-01-26 20:48:43.035821+00', NULL, NULL, NULL, NULL, '2026-01-26 20:48:43.035821+00', '2026-01-26 20:48:43.035821+00', false, NULL, NULL, NULL, NULL, NULL, NULL),
	('82204a2c-34b4-4ca8-b6ac-030e2959eb84', 'ORD-60594318', '1bdc0d75-de5a-462e-8050-78169ac09139', 'pending', 'online', 'pending', 470.00, 40.00, 510.00, NULL, '{"customer_name":"Aditya Srivastava","customer_phone":"9953940842","customer_email":"","customer_whatsapp":"9953940842","address_line1":"123, abc lane","address_line2":"","landmark":"","city":"Delhi","state":"Delhi","pincode":"110001","delivery_notes":"","is_guest_order":false}', '2026-01-26 20:49:54.075311+00', NULL, NULL, NULL, NULL, '2026-01-26 20:49:54.075311+00', '2026-01-26 20:49:54.075311+00', false, NULL, NULL, NULL, NULL, NULL, NULL),
	('601cdfbe-df90-4c56-b81f-812b96dc1dc1', 'ORD-60847455', '1bdc0d75-de5a-462e-8050-78169ac09139', 'pending', 'online', 'pending', 470.00, 40.00, 510.00, NULL, '{"customer_name":"Aditya Srivastava","customer_phone":"+919953940842","customer_email":"aditya01889@gmail.com","customer_whatsapp":"+919953940842","address_line1":"603, Tower - B5, Jaypee Klassic, Sector - 134, Noida","address_line2":"","landmark":"","city":"Noida","state":"Uttar Pradesh","pincode":"201304","delivery_notes":"","is_guest_order":false}', '2026-01-26 20:54:07.298026+00', NULL, NULL, NULL, NULL, '2026-01-26 20:54:07.298026+00', '2026-01-26 20:54:07.298026+00', false, NULL, NULL, NULL, NULL, NULL, NULL),
	('a4c6d9b2-4ca6-437b-9a21-396dd1bab64e', 'ORD-62072774', '1bdc0d75-de5a-462e-8050-78169ac09139', 'pending', 'online', 'pending', 470.00, 40.00, 510.00, NULL, '{"customer_name":"Aditya Srivastava","customer_phone":"+919953940842","customer_email":"aditya01889@gmail.com","customer_whatsapp":"+919953940842","address_line1":"603, Tower - B5, Jaypee Klassic, Sector - 134, Noida","address_line2":"","landmark":"","city":"Noida","state":"Uttar Pradesh","pincode":"201304","delivery_notes":"","is_guest_order":false}', '2026-01-26 21:14:32.491493+00', NULL, NULL, NULL, NULL, '2026-01-26 21:14:32.491493+00', '2026-01-26 21:14:32.491493+00', false, NULL, NULL, NULL, NULL, NULL, NULL),
	('4770fc0b-a42c-4345-88f0-04fdeaa5a579', 'ORD-62153094', '1bdc0d75-de5a-462e-8050-78169ac09139', 'pending', 'online', 'pending', 470.00, 40.00, 510.00, NULL, '{"customer_name":"Aditya Srivastava","customer_phone":"+919953940842","customer_email":"aditya01889@gmail.com","customer_whatsapp":"+919953940842","address_line1":"603, Tower - B5, Jaypee Klassic, Sector - 134, Noida","address_line2":"","landmark":"","city":"Noida","state":"Uttar Pradesh","pincode":"201304","delivery_notes":"","is_guest_order":false}', '2026-01-26 21:15:52.786934+00', NULL, NULL, NULL, NULL, '2026-01-26 21:15:52.786934+00', '2026-01-26 21:15:52.786934+00', false, NULL, NULL, NULL, NULL, NULL, NULL),
	('16a242be-8ba9-4ef7-9be9-e359379163ff', 'ORD-62186955', '1bdc0d75-de5a-462e-8050-78169ac09139', 'pending', 'online', 'pending', 470.00, 40.00, 510.00, NULL, '{"customer_name":"Aditya Srivastava","customer_phone":"+919953940842","customer_email":"aditya01889@gmail.com","customer_whatsapp":"+919953940842","address_line1":"603, Tower - B5, Jaypee Klassic, Sector - 134, Noida","address_line2":"","landmark":"","city":"Noida","state":"Uttar Pradesh","pincode":"201304","delivery_notes":"","is_guest_order":false}', '2026-01-26 21:16:26.649524+00', NULL, NULL, NULL, NULL, '2026-01-26 21:16:26.649524+00', '2026-01-26 21:16:26.649524+00', false, NULL, NULL, NULL, NULL, NULL, NULL),
	('039892e3-b4e4-4ebd-ab7b-1d42302ddaa3', 'ORD-62541885', '1bdc0d75-de5a-462e-8050-78169ac09139', 'pending', 'online', 'pending', 470.00, 40.00, 510.00, NULL, '{"customer_name":"Aditya Srivastava","customer_phone":"+919953940842","customer_email":"aditya01889@gmail.com","customer_whatsapp":"+919953940842","address_line1":"603, Tower - B5, Jaypee Klassic, Sector - 134, Noida","address_line2":"","landmark":"","city":"Noida","state":"Uttar Pradesh","pincode":"201304","delivery_notes":"","is_guest_order":false}', '2026-01-26 21:22:21.589297+00', NULL, NULL, NULL, NULL, '2026-01-26 21:22:21.589297+00', '2026-01-26 21:22:21.589297+00', false, NULL, NULL, NULL, NULL, NULL, NULL),
	('a148aca5-c4dd-4151-941b-de375e544a69', 'ORD-62554584', '1bdc0d75-de5a-462e-8050-78169ac09139', 'pending', 'online', 'pending', 470.00, 40.00, 510.00, NULL, '{"customer_name":"Aditya Srivastava","customer_phone":"+919953940842","customer_email":"aditya01889@gmail.com","customer_whatsapp":"+919953940842","address_line1":"603, Tower - B5, Jaypee Klassic, Sector - 134, Noida","address_line2":"","landmark":"","city":"Noida","state":"Uttar Pradesh","pincode":"201304","delivery_notes":"","is_guest_order":false}', '2026-01-26 21:22:34.27431+00', NULL, NULL, NULL, NULL, '2026-01-26 21:22:34.27431+00', '2026-01-26 21:22:34.27431+00', false, NULL, NULL, NULL, NULL, NULL, NULL),
	('ef4587a3-450f-4df6-b1d3-559287855108', 'ORD-64644484', '1bdc0d75-de5a-462e-8050-78169ac09139', 'pending', 'online', 'pending', 470.00, 40.00, 510.00, NULL, '{"customer_name":"Admin User","customer_phone":"+919953940842","customer_email":"aditya01889@gmail.com","customer_whatsapp":"+919953940842","address_line1":"603, Tower - B5, Jaypee Klassic, Sector - 134, Noida","address_line2":"","landmark":"","city":"Noida","state":"Uttar Pradesh","pincode":"201304","delivery_notes":"","is_guest_order":false}', '2026-01-26 21:57:24.397268+00', NULL, NULL, NULL, NULL, '2026-01-26 21:57:24.397268+00', '2026-01-26 21:57:24.397268+00', false, NULL, NULL, NULL, NULL, NULL, NULL),
	('501b20e8-aedd-46f9-b4a9-8218d8d302c9', 'ORD-64680862', '1bdc0d75-de5a-462e-8050-78169ac09139', 'pending', 'online', 'pending', 470.00, 40.00, 510.00, NULL, '{"customer_name":"Admin User","customer_phone":"+919953940842","customer_email":"aditya01889@gmail.com","customer_whatsapp":"+919953940842","address_line1":"603, Tower - B5, Jaypee Klassic, Sector - 134, Noida","address_line2":"","landmark":"","city":"Noida","state":"Uttar Pradesh","pincode":"201304","delivery_notes":"","is_guest_order":false}', '2026-01-26 21:58:01.053904+00', NULL, NULL, NULL, NULL, '2026-01-26 21:58:01.053904+00', '2026-01-26 21:58:01.053904+00', false, NULL, NULL, NULL, NULL, NULL, NULL),
	('87604d24-4926-4d03-a80a-cb2ec02d24e9', 'ORD-69537206', '1bdc0d75-de5a-462e-8050-78169ac09139', 'confirmed', 'online', 'paid', 470.00, 40.00, 510.00, NULL, '{"customer_name":"Admin User","customer_phone":"+919953940842","customer_email":"aditya01889@gmail.com","customer_whatsapp":"+919953940842","address_line1":"603, Tower - B5, Jaypee Klassic, Sector - 134, Noida","address_line2":"","landmark":"","city":"Noida","state":"Uttar Pradesh","pincode":"201304","delivery_notes":"","is_guest_order":false}', '2026-01-26 23:18:57.118657+00', NULL, NULL, NULL, NULL, '2026-01-26 23:18:57.118657+00', '2026-01-26 23:19:36.828147+00', false, NULL, NULL, NULL, NULL, NULL, NULL);


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."products" ("id", "category_id", "name", "slug", "description", "short_description", "nutritional_info", "ingredients_display", "image_url", "is_active", "display_order", "created_at", "updated_at", "packaging_type", "label_type", "packaging_quantity_per_product", "label_quantity_per_product") VALUES
	('e017972d-4a82-4461-b24d-8a1fd72b5c71', '4c4fb304-ba44-41dc-9a53-8db1fed30ef2', 'Nourish', 'nourish', 'Complete balanced meal with chicken, pumpkin and rice. Perfect for daily nutrition.', 'Balanced chicken meal with pumpkin', NULL, NULL, 'https://xfnbhheapralprcwjvzl.supabase.co/storage/v1/object/public/product-images/product-images/1768592432205-39fsykfg387.webp', true, 1, '2026-01-13 18:18:36.485961+00', '2026-01-25 23:19:11.959397+00', '70g Stand Up Pouch', 'Nourish Label', 1, 1),
	('7bc76252-827b-4429-ae6c-68e60dc07fb2', '4c4fb304-ba44-41dc-9a53-8db1fed30ef2', 'Vitality', 'vitality', 'Enhanced nutrition with eggs, flaxseeds and seaweed. For active cats needing extra nutrients.', 'Enhanced meal with eggs and superfoods', NULL, NULL, 'https://xfnbhheapralprcwjvzl.supabase.co/storage/v1/object/public/product-images/product-images/1768592847760-mw7x3jtwn4r.webp', true, 2, '2026-01-13 18:18:36.485961+00', '2026-01-25 23:19:11.959397+00', '70g Stand Up Pouch', 'Vitality Label', 1, 1),
	('cb5b0c0d-80a8-4017-9fe7-9f69b1a5a042', '4c4fb304-ba44-41dc-9a53-8db1fed30ef2', 'Power', 'power', 'High-protein meal with chicken, liver and hearts. Ideal for growing cats and high energy needs.', 'High-protein meal with organ meats', NULL, NULL, 'https://xfnbhheapralprcwjvzl.supabase.co/storage/v1/object/public/product-images/product-images/1768592877381-ze1jkxvjz3h.webp', true, 3, '2026-01-13 18:18:36.485961+00', '2026-01-25 23:19:11.959397+00', '70g Stand Up Pouch', 'Power Label', 1, 1),
	('4a45f496-00fc-43c0-ba34-1137e56ec9be', '887d6bde-b2c9-438d-8428-fcbd075bbdca', 'Golden Glow Cupcake', 'golden-glow-cupcake', 'Fish-based cupcake with carrots for vision health. Sold in pairs (2 x 50g).', 'Fish cupcakes with carrots', NULL, NULL, 'https://xfnbhheapralprcwjvzl.supabase.co/storage/v1/object/public/product-images/product-images/1768593790686-qd0o6xbrjbe.webp', true, 3, '2026-01-13 18:18:36.485961+00', '2026-01-25 23:19:11.959397+00', 'Cupcake Box', 'Logo Sticker', 1, 1),
	('f29a33a5-a354-42e0-a1cd-6713cbdfc61e', '887d6bde-b2c9-438d-8428-fcbd075bbdca', 'Fruity Paws Cupcake', 'fruity-paws-cupcake', 'Chicken cupcake with apple pieces for antioxidants. Sold in pairs (2 x 50g).', 'Chicken cupcakes with apples', NULL, NULL, 'https://xfnbhheapralprcwjvzl.supabase.co/storage/v1/object/public/product-images/product-images/1768593805696-k5dxu5m8mx.webp', true, 4, '2026-01-13 18:18:36.485961+00', '2026-01-25 23:19:11.959397+00', 'Cupcake Box', 'Logo Sticker', 1, 1),
	('4243a708-5ec4-4686-b219-61477782b70d', '887d6bde-b2c9-438d-8428-fcbd075bbdca', 'Veggie Mew Cupcake', 'veggie-mew-cupcake', 'Egg-based cupcake with carrots for vegetarian option. Sold in pairs (2 x 50g).', 'Egg-based vegetarian cupcakes', NULL, NULL, 'https://xfnbhheapralprcwjvzl.supabase.co/storage/v1/object/public/product-images/product-images/1768593823716-qc89dqwlzfn.webp', true, 5, '2026-01-13 18:18:36.485961+00', '2026-01-25 23:19:11.959397+00', 'Cupcake Box', 'Logo Sticker', 1, 1),
	('82fc463b-2b19-4be4-ac0d-180d56322b4b', '887d6bde-b2c9-438d-8428-fcbd075bbdca', 'Happy Tummy Cupcake', 'happy-tummy-cupcake', 'Digestive health cupcake with psyllium husk. Sold in pairs (2 x 50g).', 'Digestive health cupcakes', NULL, NULL, 'https://xfnbhheapralprcwjvzl.supabase.co/storage/v1/object/public/product-images/product-images/1768593840890-ff1bq2crbpv.webp', true, 6, '2026-01-13 18:18:36.485961+00', '2026-01-25 23:19:11.959397+00', 'Cupcake Box', 'Logo Sticker', 1, 1),
	('66c100e1-7f24-4953-b49b-63250db854d9', '4c4fb304-ba44-41dc-9a53-8db1fed30ef2', 'Thrive', 'thrive', 'Luxury tuna and egg meal with pumpkin and oats. Premium nutrition for optimal health.', 'Luxury tuna and egg meal', NULL, NULL, 'https://xfnbhheapralprcwjvzl.supabase.co/storage/v1/object/public/product-images/product-images/1768593294212-1xy4twlfqs5.webp', true, 6, '2026-01-13 18:18:36.485961+00', '2026-01-25 23:19:11.959397+00', '70g Stand Up Pouch', 'Thrive Label', 1, 1),
	('de648df5-cd0f-4e29-b53c-da676c55258f', '75e9b486-e95c-4389-b986-a54aba3af190', 'Essence', 'essence', 'Light chicken broth with 25% chicken content. Perfect for hydration and light meals.', 'Light chicken broth for hydration', NULL, NULL, 'https://xfnbhheapralprcwjvzl.supabase.co/storage/v1/object/public/product-images/product-images/1768593313747-se2u7ak5kcf.png', true, 1, '2026-01-13 18:18:36.485961+00', '2026-01-25 23:19:11.959397+00', '100ml Spout Pouch', 'Essence Label', 1, 1),
	('0e9204cf-21af-482f-a332-d36269959ffd', '75e9b486-e95c-4389-b986-a54aba3af190', 'Bone Rich', 'bone-rich', 'Pure collagen-rich bone broth. Excellent for joint health and senior cats.', 'Pure bone broth for joint health', NULL, NULL, 'https://xfnbhheapralprcwjvzl.supabase.co/storage/v1/object/public/product-images/product-images/1768593338967-vj9p503xbg.png', true, 2, '2026-01-13 18:18:36.485961+00', '2026-01-25 23:19:11.959397+00', '100ml Spout Pouch', 'Bone Rich Label', 1, 1),
	('ccd26ecf-8059-4a27-a2db-6ae15da11ca4', '49d190d1-e039-4827-938f-af4cd8473d03', 'Chicken Cookies', 'chicken-cookies', 'Crunchy chicken-flavored treats baked with real chicken. Perfect for training and rewards.', 'Crunchy chicken-flavored treats', NULL, NULL, 'https://xfnbhheapralprcwjvzl.supabase.co/storage/v1/object/public/product-images/product-images/1768593540853-4qvyrmn71fx.webp', true, 1, '2026-01-13 18:18:36.485961+00', '2026-01-25 23:19:11.959397+00', 'Cookie Jar', 'Logo Sticker', 1, 2),
	('ed3392a2-2738-4c05-9717-cf43ad40e1be', '49d190d1-e039-4827-938f-af4cd8473d03', 'Banana Cookies', 'banana-cookies', 'Sweet banana cookies with natural banana flavor. Healthy and delicious treat option.', 'Sweet banana-flavored treats', NULL, NULL, 'https://xfnbhheapralprcwjvzl.supabase.co/storage/v1/object/public/product-images/product-images/1768593556911-642hw0ou3wh.webp', true, 2, '2026-01-13 18:18:36.485961+00', '2026-01-25 23:19:11.959397+00', 'Cookie Jar', 'Logo Sticker', 1, 2),
	('90310ac1-6f99-4c07-8e3e-68677ffcc96f', '49d190d1-e039-4827-938f-af4cd8473d03', 'Beetroot Cookies', 'beetroot-cookies', 'Vibrant beetroot cookies with natural color and nutrients. Unique and healthy treat.', 'Vibrant beetroot-flavored treats', NULL, NULL, 'https://xfnbhheapralprcwjvzl.supabase.co/storage/v1/object/public/product-images/product-images/1768593570250-44c11pjf8uc.webp', true, 3, '2026-01-13 18:18:36.485961+00', '2026-01-25 23:19:11.959397+00', 'Cookie Jar', 'Logo Sticker', 1, 2),
	('68e827a3-3eaa-4d3f-be58-084ea66f7d28', '49d190d1-e039-4827-938f-af4cd8473d03', 'Pumpkin Cookies', 'pumpkin-cookies', 'Seasonal pumpkin cookies with digestive benefits. Perfect for autumn and digestive health.', 'Seasonal pumpkin digestive treats', NULL, NULL, 'https://xfnbhheapralprcwjvzl.supabase.co/storage/v1/object/public/product-images/product-images/1768593587026-93y0zll043i.webp', true, 4, '2026-01-13 18:18:36.485961+00', '2026-01-25 23:19:11.959397+00', 'Cookie Jar', 'Logo Sticker', 1, 2),
	('7bd899d2-e50e-4af5-b574-59b5bf4ca5ee', '4c4fb304-ba44-41dc-9a53-8db1fed30ef2', 'Supreme', 'supreme', 'Premium blend with chicken, liver, tuna and salmon oil. Ultimate nutrition for discerning cats.', 'Premium meal with multiple proteins', NULL, NULL, 'https://xfnbhheapralprcwjvzl.supabase.co/storage/v1/object/public/product-images/product-images/1768592906701-hbyg5xu64c7.webp', true, 4, '2026-01-13 18:18:36.485961+00', '2026-01-25 23:19:11.959397+00', '70g Stand Up Pouch', 'Supreme Label', 1, 1),
	('b97698ca-4b52-427e-bc57-e141e55d3493', '4c4fb304-ba44-41dc-9a53-8db1fed30ef2', 'Nurture', 'nurture', 'Gentle fish-based meal with basa, rice and pumpkin. Perfect for sensitive stomachs and fish lovers.', 'Gentle fish meal for sensitive cats', NULL, NULL, 'https://xfnbhheapralprcwjvzl.supabase.co/storage/v1/object/public/product-images/product-images/1768593278197-yp493me7ifb.webp', true, 5, '2026-01-13 18:18:36.485961+00', '2026-01-25 23:19:11.959397+00', '70g Stand Up Pouch', 'Nurture Label', 1, 1),
	('e019ccf1-3a0e-4cd1-adca-3910635c3161', '887d6bde-b2c9-438d-8428-fcbd075bbdca', 'Purrfect Protein Cupcake', 'purrfect-protein-cupcake', 'High-protein chicken cupcake for muscle health. Sold in pairs (2 x 50g).', 'High-protein chicken cupcakes', NULL, NULL, 'https://xfnbhheapralprcwjvzl.supabase.co/storage/v1/object/public/product-images/product-images/1768593610443-eopbto9ubc8.webp', true, 1, '2026-01-13 18:18:36.485961+00', '2026-01-25 23:19:11.959397+00', 'Cupcake Box', 'Logo Sticker', 1, 1),
	('35a83797-69af-4257-8178-35894f481b02', '887d6bde-b2c9-438d-8428-fcbd075bbdca', 'Tuna Delight Cupcake', 'tuna-delight-cupcake', 'Premium tuna cupcake with omega-3 benefits. Sold in pairs (2 x 50g).', 'Premium tuna cupcakes', NULL, NULL, 'https://xfnbhheapralprcwjvzl.supabase.co/storage/v1/object/public/product-images/product-images/1768593774679-dcxl45lyhtt.webp', true, 2, '2026-01-13 18:18:36.485961+00', '2026-01-25 23:19:11.959397+00', 'Cupcake Box', 'Logo Sticker', 1, 1);


--
-- Data for Name: production_batches; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."production_batches" ("id", "batch_number", "product_id", "quantity_produced", "status", "planned_date", "actual_production_date", "notes", "created_at", "updated_at", "order_id", "created_by", "start_time", "end_time", "priority", "delivery_created", "batch_type", "total_orders", "total_quantity_produced", "waste_factor", "total_weight_grams") VALUES
	('f316a835-a19f-4e3f-adf5-0cc1f27f26df', 'BATCH-7112585', NULL, 1, 'planned', '2026-01-14', NULL, NULL, '2026-01-14 21:41:52.586+00', '2026-01-14 21:41:52.586+00', NULL, NULL, NULL, NULL, 1, false, 'single', 1, 0, 7.50, NULL),
	('34fce5f5-de51-4565-814e-044644973229', 'BATCH-7599351', NULL, 1, 'planned', '2026-01-14', NULL, NULL, '2026-01-14 21:49:59.351+00', '2026-01-14 21:49:59.351+00', NULL, NULL, NULL, NULL, 1, false, 'single', 1, 0, 7.50, NULL),
	('a1925a9d-1081-446a-b9f2-beb3924e00c2', 'BATCH-8018439', NULL, 1, 'planned', '2026-01-14', NULL, NULL, '2026-01-14 21:56:58.439+00', '2026-01-14 21:56:58.439+00', NULL, NULL, NULL, NULL, 1, false, 'single', 1, 0, 7.50, NULL),
	('ea02c182-282c-42da-a98a-b288b9664fbb', 'PB-000009', NULL, 0, 'planned', NULL, NULL, NULL, '2026-01-24 00:12:33.732323+00', '2026-01-24 00:12:33.732323+00', NULL, NULL, NULL, NULL, 1, false, 'single', 1, 0, 7.50, NULL),
	('4832bc8a-e427-4e9b-a349-23aaff311a0f', 'PB-000010', NULL, 0, 'planned', NULL, NULL, NULL, '2026-01-24 00:21:24.685436+00', '2026-01-24 00:21:24.685436+00', NULL, NULL, NULL, NULL, 1, false, 'single', 1, 0, 7.50, NULL),
	('b16eba6f-6666-4ab4-9eb2-8aef5ecf4c7c', 'PB-000013', NULL, 0, 'planned', NULL, NULL, 'Created from production queue', '2026-01-24 12:23:57.567491+00', '2026-01-24 12:23:57.567491+00', '5a504de3-a8c1-44f4-92bd-ab389a605f42', '1bdc0d75-de5a-462e-8050-78169ac09139', NULL, NULL, 1, false, 'single', 1, 0, 7.50, NULL),
	('48da70d6-28e6-4c4d-a4e3-03e4dbb8765b', 'PB-000014', NULL, 0, 'planned', NULL, NULL, 'Created from production queue', '2026-01-24 12:24:24.388698+00', '2026-01-24 12:24:24.388698+00', '21aa7e58-4d2f-487b-bfbc-ba9c29cdf079', '1bdc0d75-de5a-462e-8050-78169ac09139', NULL, NULL, 1, false, 'single', 1, 0, 7.50, NULL),
	('a32ec839-a70d-47ab-999e-666444247323', 'BATCH-20260124-130257', 'de648df5-cd0f-4e29-b53c-da676c55258f', 0, 'planned', NULL, NULL, 'Created from product group batching', '2026-01-24 13:02:57.0886+00', '2026-01-24 13:02:57.0886+00', NULL, '1bdc0d75-de5a-462e-8050-78169ac09139', NULL, NULL, 1, false, 'group', 13, 14, 7.50, NULL),
	('a70c92fb-224a-4287-8234-1a380634f5ae', 'PB-000011', NULL, 0, 'completed', NULL, NULL, 'Created from production queue', '2026-01-24 00:55:57.309571+00', '2026-01-24 16:07:32.667007+00', '3a2be9a6-588a-4a93-9e04-999216891c31', '1bdc0d75-de5a-462e-8050-78169ac09139', '2026-01-24 01:47:58.99+00', '2026-01-24 16:07:31.396+00', 1, false, 'single', 1, 0, 7.50, NULL),
	('5ca1bd94-b947-4f4f-9a17-0a9b9fbc1e5d', 'PB-000012', NULL, 0, 'completed', NULL, NULL, 'Created from production queue', '2026-01-24 01:15:52.812639+00', '2026-01-24 16:39:59.458442+00', '3a2be9a6-588a-4a93-9e04-999216891c31', '1bdc0d75-de5a-462e-8050-78169ac09139', '2026-01-24 01:36:15.929+00', '2026-01-24 01:37:55.794+00', 1, false, 'single', 1, 0, 7.50, NULL),
	('23c8ecee-fd41-4890-bfdc-c0bbf1551cc0', 'BATCH-2026-01-24-210276', 'ccd26ecf-8059-4a27-a2db-6ae15da11ca4', 5, 'completed', NULL, NULL, 'Created from product group batching', '2026-01-24 15:18:21.027669+00', '2026-01-24 16:41:10.057666+00', NULL, '1bdc0d75-de5a-462e-8050-78169ac09139', '2026-01-24 15:53:18.231+00', '2026-01-24 16:41:08.862+00', 1, false, 'group', 5, 5, 0.08, 800.00),
	('62f3efaf-ddf2-4663-bf6c-6935e6d326fa', 'BATCH-2026-01-24-115394', 'e019ccf1-3a0e-4cd1-adca-3910635c3161', 7, 'completed', NULL, NULL, 'Created from product group batching', '2026-01-24 14:13:11.539455+00', '2026-01-24 17:01:34.715792+00', NULL, '1bdc0d75-de5a-462e-8050-78169ac09139', '2026-01-24 16:41:18.081+00', '2026-01-24 17:01:33.545+00', 1, false, 'group', 7, 7, 0.08, 700.00),
	('96202390-d7da-4a22-ba75-54a12169950f', 'BATCH-20260124-132050', 'de648df5-cd0f-4e29-b53c-da676c55258f', 0, 'completed', NULL, NULL, 'Created from product group batching', '2026-01-24 13:20:50.535493+00', '2026-01-24 17:22:21.506717+00', NULL, '1bdc0d75-de5a-462e-8050-78169ac09139', '2026-01-24 17:01:49.153+00', '2026-01-24 17:22:20.374+00', 1, false, 'group', 13, 14, 7.50, NULL),
	('2ae3072b-c0d5-4748-8138-de045d3d4060', 'BATCH-2026-01-25-422656', 'e017972d-4a82-4461-b24d-8a1fd72b5c71', 7, 'completed', NULL, NULL, 'Created from product group batching', '2026-01-25 17:46:42.265612+00', '2026-01-25 17:47:51.113593+00', NULL, '1bdc0d75-de5a-462e-8050-78169ac09139', '2026-01-25 17:47:40.165+00', '2026-01-25 17:47:48.342+00', 1, false, 'group', 4, 7, 0.08, 490.00),
	('2cefa5b6-d0ee-4a53-b9c6-c6207aee6ede', 'BATCH-2026-01-25-484566', 'ed3392a2-2738-4c05-9717-cf43ad40e1be', 1, 'completed', NULL, NULL, 'Created from product group batching', '2026-01-25 18:10:48.456613+00', '2026-01-25 18:14:55.76994+00', NULL, '1bdc0d75-de5a-462e-8050-78169ac09139', '2026-01-25 18:14:39.325+00', '2026-01-25 18:14:53.053+00', 1, false, 'group', 1, 1, 0.08, 200.00),
	('1324449b-df21-4303-a362-b7a5064ddb09', 'BATCH-2026-01-25-386558', 'de648df5-cd0f-4e29-b53c-da676c55258f', 1, 'planned', NULL, NULL, 'Created from product group batching', '2026-01-25 18:30:38.65583+00', '2026-01-25 18:30:38.65583+00', NULL, '1bdc0d75-de5a-462e-8050-78169ac09139', NULL, NULL, 1, false, 'group', 1, 1, 0.08, 100.00),
	('d063e7ce-80de-4b68-a4f7-af88469ef90e', 'BATCH-2026-01-25-244651', 'e017972d-4a82-4461-b24d-8a1fd72b5c71', 2, 'planned', NULL, NULL, 'Created from product group batching', '2026-01-25 18:51:24.465167+00', '2026-01-25 18:51:24.465167+00', NULL, '1bdc0d75-de5a-462e-8050-78169ac09139', NULL, NULL, 1, false, 'group', 2, 2, 0.08, 140.00),
	('4414bbdd-cd96-4c5a-8208-ca33c07452ac', 'BATCH-2026-01-25-327570', 'e017972d-4a82-4461-b24d-8a1fd72b5c71', 1, 'completed', NULL, NULL, 'Created from product group batching', '2026-01-25 18:57:32.757069+00', '2026-01-25 18:58:50.961232+00', NULL, '1bdc0d75-de5a-462e-8050-78169ac09139', '2026-01-25 18:58:14.209+00', '2026-01-25 18:58:48.303+00', 1, false, 'group', 1, 1, 0.08, 70.00),
	('eaedac71-0d93-4035-aebf-0bdca58b77f2', 'BATCH-2026-01-25-313425', 'de648df5-cd0f-4e29-b53c-da676c55258f', 2, 'completed', NULL, NULL, 'Created from product group batching', '2026-01-25 18:57:31.342585+00', '2026-01-25 18:59:05.58167+00', NULL, '1bdc0d75-de5a-462e-8050-78169ac09139', '2026-01-25 18:58:57.086+00', '2026-01-25 18:59:02.912+00', 1, false, 'group', 2, 2, 0.08, 200.00),
	('f056095e-086b-4eb1-af3f-9729f8fda557', 'BATCH-2026-01-25-226794', 'e019ccf1-3a0e-4cd1-adca-3910635c3161', 3, 'completed', NULL, NULL, 'Created from product group batching', '2026-01-25 18:57:22.679452+00', '2026-01-25 18:59:18.434428+00', NULL, '1bdc0d75-de5a-462e-8050-78169ac09139', '2026-01-25 18:59:10.818+00', '2026-01-25 18:59:15.766+00', 1, false, 'group', 3, 3, 0.08, 300.00),
	('f287586d-386d-422f-bcb1-ec81e079e68a', 'BATCH-2026-01-25-295074', 'e019ccf1-3a0e-4cd1-adca-3910635c3161', 1, 'completed', NULL, NULL, 'Created from product group batching', '2026-01-25 19:19:29.507451+00', '2026-01-25 19:27:13.665077+00', NULL, '1bdc0d75-de5a-462e-8050-78169ac09139', '2026-01-25 19:23:47.649+00', '2026-01-25 19:27:11.027+00', 1, false, 'group', 1, 1, 0.08, 100.00),
	('baf214fa-a110-4160-91ab-e192f46010d1', 'BATCH-2026-01-25-270018', 'e017972d-4a82-4461-b24d-8a1fd72b5c71', 1, 'completed', NULL, NULL, 'Created from product group batching', '2026-01-25 19:19:27.00186+00', '2026-01-25 19:27:21.623246+00', NULL, '1bdc0d75-de5a-462e-8050-78169ac09139', '2026-01-25 19:26:40.176+00', '2026-01-25 19:27:18.981+00', 1, false, 'group', 1, 1, 0.08, 70.00),
	('8a03e393-fd38-48ec-93d3-2729888f02db', 'BATCH-2026-01-25-398862', 'de648df5-cd0f-4e29-b53c-da676c55258f', 1, 'completed', NULL, NULL, 'Created from product group batching', '2026-01-25 19:14:39.886242+00', '2026-01-25 19:27:28.680648+00', NULL, '1bdc0d75-de5a-462e-8050-78169ac09139', '2026-01-25 19:26:46.684+00', '2026-01-25 19:27:26.039+00', 1, false, 'group', 1, 1, 0.08, 100.00);


--
-- Data for Name: batch_ingredients; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: product_variants; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."product_variants" ("id", "product_id", "weight_grams", "price", "sku", "is_active", "created_at") VALUES
	('c53513f9-b34a-4273-94d0-4aa5cbb8edb3', '0e9204cf-21af-482f-a332-d36269959ffd', 100, 100.00, 'BONERICH-100ML', true, '2026-01-13 18:18:36.485961+00'),
	('90717e7a-f505-42e0-a2b4-3c7fbac0cf25', '4a45f496-00fc-43c0-ba34-1137e56ec9be', 100, 450.00, 'GOLDENGLOW-2PC', true, '2026-01-13 18:18:36.485961+00'),
	('f029e841-22b7-4b72-b21b-92475826d041', 'f29a33a5-a354-42e0-a1cd-6713cbdfc61e', 100, 400.00, 'FRUITYPAWS-2PC', true, '2026-01-13 18:18:36.485961+00'),
	('ef365007-10ac-4303-92ac-46eed1c7501b', '4243a708-5ec4-4686-b219-61477782b70d', 100, 350.00, 'VEGGIEMEW-2PC', true, '2026-01-13 18:18:36.485961+00'),
	('3cd038ed-7fa8-4f97-9f90-162bef81bd14', '82fc463b-2b19-4be4-ac0d-180d56322b4b', 100, 300.00, 'HAPPYTUMMY-2PC', true, '2026-01-13 18:18:36.485961+00'),
	('146cf2f9-619d-4f76-8269-841d749bb096', '90310ac1-6f99-4c07-8e3e-68677ffcc96f', 200, 200.00, 'BEETROOT-200G', true, '2026-01-13 18:18:36.485961+00'),
	('1fc9cbbf-ba5a-4d20-8e17-5060bde7bd09', '7bd899d2-e50e-4af5-b574-59b5bf4ca5ee', 70, 85.00, 'SUPREME-70G', true, '2026-01-13 18:18:36.485961+00'),
	('2afa2e6c-fcbe-42d9-886d-21a56af7062e', 'ccd26ecf-8059-4a27-a2db-6ae15da11ca4', 200, 200.00, 'CHICKEN-200G', true, '2026-01-13 18:18:36.485961+00'),
	('36a16b6b-12f8-4b36-99ef-b16b7da7ab0b', 'ed3392a2-2738-4c05-9717-cf43ad40e1be', 200, 200.00, 'BANANA-200G', true, '2026-01-13 18:18:36.485961+00'),
	('3d268a61-5b12-4208-ad99-f5f7b504447a', 'ed3392a2-2738-4c05-9717-cf43ad40e1be', 100, 120.00, 'BANANA-100G', true, '2026-01-13 18:18:36.485961+00'),
	('45fd1df1-3e40-4fb1-baa0-3a564d3982a7', '7bc76252-827b-4429-ae6c-68e60dc07fb2', 70, 70.00, 'VITALITY-70G', true, '2026-01-13 18:18:36.485961+00'),
	('50abcb20-ce4e-4ce6-836b-2eea55ce5146', 'e017972d-4a82-4461-b24d-8a1fd72b5c71', 70, 70.00, 'NOURISH-70G', true, '2026-01-13 18:18:36.485961+00'),
	('51f4c881-fa78-4ea5-aa0e-a4f73a070da5', '68e827a3-3eaa-4d3f-be58-084ea66f7d28', 200, 200.00, 'PUMPKIN-200G', true, '2026-01-13 18:18:36.485961+00'),
	('6823aaaa-c16f-487a-8b3a-2095b1b4d24d', '90310ac1-6f99-4c07-8e3e-68677ffcc96f', 100, 120.00, 'BEETROOT-100G', true, '2026-01-13 18:18:36.485961+00'),
	('779bb500-37d2-4bbd-9c3f-0dbbbd8adc49', '68e827a3-3eaa-4d3f-be58-084ea66f7d28', 100, 120.00, 'PUMPKIN-100G', true, '2026-01-13 18:18:36.485961+00'),
	('d6a3d062-0a39-4873-9160-09655e7e3305', 'de648df5-cd0f-4e29-b53c-da676c55258f', 100, 100.00, 'ESSENCE-100ML', true, '2026-01-13 18:18:36.485961+00'),
	('f80d6ad7-8fe7-4719-8e74-84aaecef57ba', 'cb5b0c0d-80a8-4017-9fe7-9f69b1a5a042', 70, 85.00, 'POWER-70G', true, '2026-01-13 18:18:36.485961+00'),
	('feba92c4-6a09-4096-9844-961849434910', 'ccd26ecf-8059-4a27-a2db-6ae15da11ca4', 100, 120.00, 'CHICKEN-100G', true, '2026-01-13 18:18:36.485961+00'),
	('dc32e85b-9d13-4224-9f9b-00b3c48f8b9f', '66c100e1-7f24-4953-b49b-63250db854d9', 70, 100.00, 'THRIVE-70G', true, '2026-01-13 18:18:36.485961+00'),
	('8e23464a-0b99-47a6-be88-dcdb822e18ae', 'e019ccf1-3a0e-4cd1-adca-3910635c3161', 100, 300.00, 'PURRPROTEIN-2PC', true, '2026-01-13 18:18:36.485961+00'),
	('d4611049-7f9b-42f6-9cbf-0cb4f4e5802b', '35a83797-69af-4257-8178-35894f481b02', 100, 400.00, 'TUNADELIGHT-2PC', true, '2026-01-13 18:18:36.485961+00'),
	('7208c09b-2b39-4c47-9e0e-b508216211ac', 'b97698ca-4b52-427e-bc57-e141e55d3493', 70, 100.00, 'NURTURE-70G', true, '2026-01-13 18:18:36.485961+00');


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."order_items" ("id", "order_id", "product_variant_id", "quantity", "unit_price", "total_price", "created_at") VALUES
	('378c092a-7e4f-40c5-b130-a82c49f27da4', '3a2be9a6-588a-4a93-9e04-999216891c31', '8e23464a-0b99-47a6-be88-dcdb822e18ae', 1, 500.00, 500.00, '2026-01-13 19:13:41.717459+00'),
	('7da81023-c7a2-4441-8257-33f9d2213333', '3a2be9a6-588a-4a93-9e04-999216891c31', 'd6a3d062-0a39-4873-9160-09655e7e3305', 1, 80.00, 80.00, '2026-01-13 19:13:41.717459+00'),
	('07077f33-a7f3-4219-8392-655d1a3f4eef', 'fbcd882a-0e69-4d27-a3f5-33928940862f', 'd6a3d062-0a39-4873-9160-09655e7e3305', 1, 80.00, 80.00, '2026-01-13 19:20:02.555511+00'),
	('114d1a30-6d3b-437c-8406-70f4e50040df', '64d03ae6-8628-4e14-940f-c90263a425c6', '2afa2e6c-fcbe-42d9-886d-21a56af7062e', 1, 200.00, 200.00, '2026-01-14 08:56:35.939128+00'),
	('b05bf340-c805-4293-9da4-7e653aaea305', '64d03ae6-8628-4e14-940f-c90263a425c6', 'd6a3d062-0a39-4873-9160-09655e7e3305', 1, 100.00, 100.00, '2026-01-14 08:56:35.939128+00'),
	('1b74a721-9193-4b95-a16f-69c95c8afcd1', '71ef857d-43de-45e8-b84b-7fb2263471c9', '8e23464a-0b99-47a6-be88-dcdb822e18ae', 3, 300.00, 900.00, '2026-01-14 13:10:04.173131+00'),
	('bbc35faf-b405-409e-a77a-1459f2c2b1d5', 'e85d9397-82d8-467f-b3e5-48992ef7bc7f', '36a16b6b-12f8-4b36-99ef-b16b7da7ab0b', 1, 200.00, 200.00, '2026-01-16 15:31:44.018039+00'),
	('4e635a6c-6e32-4994-adcb-fd81a6d8a0d0', 'e85d9397-82d8-467f-b3e5-48992ef7bc7f', '2afa2e6c-fcbe-42d9-886d-21a56af7062e', 1, 200.00, 200.00, '2026-01-16 15:31:44.018039+00'),
	('7a548f5a-7802-47a8-8838-48cc84cfa5db', 'e85d9397-82d8-467f-b3e5-48992ef7bc7f', 'd6a3d062-0a39-4873-9160-09655e7e3305', 1, 100.00, 100.00, '2026-01-16 15:31:44.018039+00'),
	('6dbc06b0-5472-441d-81af-444f0536c535', '0c09b0d9-f404-4715-8aa2-abc38d3d8720', '2afa2e6c-fcbe-42d9-886d-21a56af7062e', 1, 200.00, 200.00, '2026-01-16 15:43:19.297373+00'),
	('f652a654-b3b7-4d2d-9ca3-21729b321f0c', '0c09b0d9-f404-4715-8aa2-abc38d3d8720', 'd6a3d062-0a39-4873-9160-09655e7e3305', 1, 100.00, 100.00, '2026-01-16 15:43:19.297373+00'),
	('1d52bf84-4235-4072-a11b-ffc2ae63da29', '4a5142a3-2d8d-478f-bd59-c2f2655b99b7', 'd6a3d062-0a39-4873-9160-09655e7e3305', 1, 100.00, 100.00, '2026-01-16 21:08:41.624508+00'),
	('b6c10e60-3768-485a-974e-a10df30525dc', '4a5142a3-2d8d-478f-bd59-c2f2655b99b7', '8e23464a-0b99-47a6-be88-dcdb822e18ae', 1, 300.00, 300.00, '2026-01-16 21:08:41.624508+00'),
	('c72dd085-6d7a-451c-a158-fc432b264372', '5a504de3-a8c1-44f4-92bd-ab389a605f42', 'feba92c4-6a09-4096-9844-961849434910', 1, 120.00, 120.00, '2026-01-17 05:25:59.029473+00'),
	('1812d7f5-42d2-401b-bf4f-9e4d002f69e9', '5a504de3-a8c1-44f4-92bd-ab389a605f42', 'd6a3d062-0a39-4873-9160-09655e7e3305', 1, 100.00, 100.00, '2026-01-17 05:25:59.029473+00'),
	('7779145c-e0b2-4171-85cb-fdd53609d31a', '21aa7e58-4d2f-487b-bfbc-ba9c29cdf079', 'd6a3d062-0a39-4873-9160-09655e7e3305', 1, 100.00, 100.00, '2026-01-17 07:12:18.836487+00'),
	('a22a798d-062e-4124-8b5a-91577cb0c6c4', '21aa7e58-4d2f-487b-bfbc-ba9c29cdf079', '8e23464a-0b99-47a6-be88-dcdb822e18ae', 1, 300.00, 300.00, '2026-01-17 07:12:18.836487+00'),
	('51d5410a-5f12-4b78-a51d-ecae4201d88a', '5feb4f7f-5ad4-411e-833e-16200c1923ba', 'd6a3d062-0a39-4873-9160-09655e7e3305', 2, 100.00, 200.00, '2026-01-17 07:18:22.027962+00'),
	('4dbd5dc4-5cd8-47ef-aa67-b9cd3642a952', '5feb4f7f-5ad4-411e-833e-16200c1923ba', '50abcb20-ce4e-4ce6-836b-2eea55ce5146', 2, 70.00, 140.00, '2026-01-17 07:18:22.027962+00'),
	('79a2235f-5d0b-4ae4-bb60-018035935be7', '30671888-b26f-456c-bae4-cec69c1e6a49', 'feba92c4-6a09-4096-9844-961849434910', 1, 120.00, 120.00, '2026-01-17 09:03:37.369582+00'),
	('71026ac1-4e55-40f7-ba9d-b48c831c7021', '30671888-b26f-456c-bae4-cec69c1e6a49', 'd6a3d062-0a39-4873-9160-09655e7e3305', 1, 100.00, 100.00, '2026-01-17 09:03:37.369582+00'),
	('4d3f8bbb-0f3e-4d4c-9361-ab16f83b776c', '30671888-b26f-456c-bae4-cec69c1e6a49', '8e23464a-0b99-47a6-be88-dcdb822e18ae', 1, 300.00, 300.00, '2026-01-17 09:03:37.369582+00'),
	('e9b06707-e6d0-4318-bce7-18eb332520a3', '49ffd9b0-628c-42b2-a4b3-23042aa6c275', 'd6a3d062-0a39-4873-9160-09655e7e3305', 1, 100.00, 100.00, '2026-01-17 20:45:57.872522+00'),
	('d75c08e8-bd9f-48de-8442-2e6f80a4e1c2', '49ffd9b0-628c-42b2-a4b3-23042aa6c275', '8e23464a-0b99-47a6-be88-dcdb822e18ae', 1, 300.00, 300.00, '2026-01-17 20:45:57.872522+00'),
	('4798e045-7220-4c43-a935-d9507b39acc3', 'bab1460e-0f2c-41a3-8efb-ba40eec61acd', 'd6a3d062-0a39-4873-9160-09655e7e3305', 1, 100.00, 100.00, '2026-01-18 14:26:55.511999+00'),
	('5e7c27dc-4095-4496-ac77-5192df3f0ec4', 'bab1460e-0f2c-41a3-8efb-ba40eec61acd', '8e23464a-0b99-47a6-be88-dcdb822e18ae', 1, 300.00, 300.00, '2026-01-18 14:26:55.511999+00'),
	('2a5ecdae-636e-4933-9708-f6b057110f37', 'bab1460e-0f2c-41a3-8efb-ba40eec61acd', '50abcb20-ce4e-4ce6-836b-2eea55ce5146', 1, 70.00, 70.00, '2026-01-18 14:26:55.511999+00'),
	('b31f2285-545d-4245-9f19-f823693d15c5', '116e2163-c63a-4588-9362-95c208433e31', 'd6a3d062-0a39-4873-9160-09655e7e3305', 1, 100.00, 100.00, '2026-01-18 20:07:22.230991+00'),
	('8c736e3e-7ff7-4559-9da3-7cdaf62e4978', '116e2163-c63a-4588-9362-95c208433e31', '8e23464a-0b99-47a6-be88-dcdb822e18ae', 1, 300.00, 300.00, '2026-01-18 20:07:22.230991+00'),
	('670a29c7-57c2-4c2c-8853-26552be24836', '116e2163-c63a-4588-9362-95c208433e31', '50abcb20-ce4e-4ce6-836b-2eea55ce5146', 1, 70.00, 70.00, '2026-01-18 20:07:22.230991+00'),
	('f7c19f26-328d-44c7-bb42-ef473e82b269', 'd8c011f7-b07f-4d99-95f2-895969b7a27d', 'd6a3d062-0a39-4873-9160-09655e7e3305', 1, 100.00, 100.00, '2026-01-18 20:09:07.250413+00'),
	('9a905a92-2000-4db1-a590-2988a7318855', 'd8c011f7-b07f-4d99-95f2-895969b7a27d', '8e23464a-0b99-47a6-be88-dcdb822e18ae', 1, 300.00, 300.00, '2026-01-18 20:09:07.250413+00'),
	('da3690aa-922f-4b18-9b78-a76b9a8ce820', 'd8c011f7-b07f-4d99-95f2-895969b7a27d', '50abcb20-ce4e-4ce6-836b-2eea55ce5146', 1, 70.00, 70.00, '2026-01-18 20:09:07.250413+00'),
	('bbb7895d-0d51-4380-93d4-31fa2349be7b', '19c65ff1-f2b7-49b4-b5ed-e989bd321a45', 'd6a3d062-0a39-4873-9160-09655e7e3305', 1, 100.00, 100.00, '2026-01-18 20:16:45.686873+00'),
	('545f2051-707b-4245-96f2-0cdffd85e189', '19c65ff1-f2b7-49b4-b5ed-e989bd321a45', '8e23464a-0b99-47a6-be88-dcdb822e18ae', 1, 300.00, 300.00, '2026-01-18 20:16:45.686873+00'),
	('e8ee7797-ac41-409e-b127-bf6505c672ad', '19c65ff1-f2b7-49b4-b5ed-e989bd321a45', '50abcb20-ce4e-4ce6-836b-2eea55ce5146', 1, 70.00, 70.00, '2026-01-18 20:16:45.686873+00'),
	('61f93adc-7be6-413f-b0e1-9cc6eff4cf9b', 'b3c4713e-0faf-4075-9ffa-02c7c54166e4', 'd6a3d062-0a39-4873-9160-09655e7e3305', 1, 100.00, 100.00, '2026-01-18 20:17:34.533219+00'),
	('32225b73-6dc8-4953-879c-a6a3bd12a4a5', 'b3c4713e-0faf-4075-9ffa-02c7c54166e4', '8e23464a-0b99-47a6-be88-dcdb822e18ae', 1, 300.00, 300.00, '2026-01-18 20:17:34.533219+00'),
	('8224b42a-5c90-45b6-9f98-055ad3a57530', 'b3c4713e-0faf-4075-9ffa-02c7c54166e4', '50abcb20-ce4e-4ce6-836b-2eea55ce5146', 1, 70.00, 70.00, '2026-01-18 20:17:34.533219+00'),
	('0ed96bb1-36bd-4399-9260-4ba37991f6c2', 'bf3198fa-ac34-483c-9a1f-a19c5c54affa', 'd6a3d062-0a39-4873-9160-09655e7e3305', 1, 100.00, 100.00, '2026-01-18 20:20:40.26456+00'),
	('9dc58ddb-0a26-4a6d-bf5a-936f39c3a045', 'bf3198fa-ac34-483c-9a1f-a19c5c54affa', '8e23464a-0b99-47a6-be88-dcdb822e18ae', 1, 300.00, 300.00, '2026-01-18 20:20:40.26456+00'),
	('e0d9eff8-cc60-4caf-99e7-11541dcb9f73', 'bf3198fa-ac34-483c-9a1f-a19c5c54affa', '50abcb20-ce4e-4ce6-836b-2eea55ce5146', 1, 70.00, 70.00, '2026-01-18 20:20:40.26456+00'),
	('85b1dbbd-7fcb-449a-ba66-afcd235d33ea', '14cf586b-a754-4128-99bf-e0961fc87955', 'd6a3d062-0a39-4873-9160-09655e7e3305', 1, 100.00, 100.00, '2026-01-18 20:25:37.414375+00'),
	('1ce50c75-2c1d-4074-9ca5-07be4cc86450', '14cf586b-a754-4128-99bf-e0961fc87955', '8e23464a-0b99-47a6-be88-dcdb822e18ae', 1, 300.00, 300.00, '2026-01-18 20:25:37.414375+00'),
	('3e8e001e-401f-4783-bf41-553bc9c89863', '14cf586b-a754-4128-99bf-e0961fc87955', '50abcb20-ce4e-4ce6-836b-2eea55ce5146', 1, 70.00, 70.00, '2026-01-18 20:25:37.414375+00'),
	('b3b7cac8-a6ab-47aa-a321-aef29a636247', '5d46802e-9064-44fc-8b82-aa5da83e9929', '50abcb20-ce4e-4ce6-836b-2eea55ce5146', 3, 70.00, 210.00, '2026-01-25 16:22:34.841237+00'),
	('a8a091d1-a14f-4310-a3a6-e85177a24c7c', '239d581f-848f-41af-a9f6-38acd3e6af5d', '8e23464a-0b99-47a6-be88-dcdb822e18ae', 1, 300.00, 300.00, '2026-01-26 11:23:53.791344+00'),
	('ca819900-8d56-42c9-b746-06590e22dedd', 'beee4e6a-ce8d-4944-98da-a747793484df', '8e23464a-0b99-47a6-be88-dcdb822e18ae', 1, 300.00, 300.00, '2026-01-26 11:24:20.308174+00'),
	('16c5b2b1-8e14-417e-837c-6ff3a9dca36e', '5666525a-6405-4f8d-aa65-e5a540c0897c', 'd6a3d062-0a39-4873-9160-09655e7e3305', 1, 100.00, 100.00, '2026-01-26 19:50:52.654908+00'),
	('a8ec96a7-bbf1-4c07-b571-f45eddb6a1b5', '5666525a-6405-4f8d-aa65-e5a540c0897c', '50abcb20-ce4e-4ce6-836b-2eea55ce5146', 1, 70.00, 70.00, '2026-01-26 19:50:52.654908+00'),
	('29d09053-1190-46b6-b3df-94eb0b32b73b', '5666525a-6405-4f8d-aa65-e5a540c0897c', '8e23464a-0b99-47a6-be88-dcdb822e18ae', 1, 300.00, 300.00, '2026-01-26 19:50:52.654908+00'),
	('a7637eb5-4b4f-415f-9d51-2b396714e792', 'ee7c805c-489e-4045-8700-e9ea6b907540', 'd6a3d062-0a39-4873-9160-09655e7e3305', 1, 100.00, 100.00, '2026-01-26 19:52:13.986528+00'),
	('4ef67a97-2c7a-40bc-83f8-780bc909e512', 'ee7c805c-489e-4045-8700-e9ea6b907540', '50abcb20-ce4e-4ce6-836b-2eea55ce5146', 1, 70.00, 70.00, '2026-01-26 19:52:13.986528+00'),
	('c17180ec-7498-48ed-b840-639a156f4dfc', 'ee7c805c-489e-4045-8700-e9ea6b907540', '8e23464a-0b99-47a6-be88-dcdb822e18ae', 1, 300.00, 300.00, '2026-01-26 19:52:13.986528+00'),
	('884b3b0e-1dad-41b4-bff6-55fdc155e977', '4005542a-5506-45b8-b84c-6e8b7c7bd224', 'd6a3d062-0a39-4873-9160-09655e7e3305', 1, 100.00, 100.00, '2026-01-26 19:54:39.967164+00'),
	('6f06d6dc-f7fa-454e-8281-7d7e874ca611', '4005542a-5506-45b8-b84c-6e8b7c7bd224', '50abcb20-ce4e-4ce6-836b-2eea55ce5146', 1, 70.00, 70.00, '2026-01-26 19:54:39.967164+00'),
	('884787b4-bad3-4b81-b169-85fdd97868d4', '4005542a-5506-45b8-b84c-6e8b7c7bd224', '8e23464a-0b99-47a6-be88-dcdb822e18ae', 1, 300.00, 300.00, '2026-01-26 19:54:39.967164+00'),
	('a16f521a-fbcd-48b9-bea2-a3897bf40097', 'bc37fa40-98f9-40b6-b260-f1b86549ba18', 'd6a3d062-0a39-4873-9160-09655e7e3305', 1, 100.00, 100.00, '2026-01-26 19:54:59.847241+00'),
	('f048fe1b-d156-45ce-8d26-6c08e12ceed4', 'bc37fa40-98f9-40b6-b260-f1b86549ba18', '50abcb20-ce4e-4ce6-836b-2eea55ce5146', 1, 70.00, 70.00, '2026-01-26 19:54:59.847241+00'),
	('caef43cd-e20a-49a8-b953-f3d5b14fe408', 'bc37fa40-98f9-40b6-b260-f1b86549ba18', '8e23464a-0b99-47a6-be88-dcdb822e18ae', 1, 300.00, 300.00, '2026-01-26 19:54:59.847241+00'),
	('2f907ab1-e44b-4666-bdde-dc7500ad3fa8', '9f5dec03-4977-47a9-9f08-4fadebb86b35', 'd6a3d062-0a39-4873-9160-09655e7e3305', 1, 100.00, 100.00, '2026-01-26 19:56:45.406182+00'),
	('61efd0f1-7ca4-4f06-a8dd-a270fa1b8a78', '9f5dec03-4977-47a9-9f08-4fadebb86b35', '50abcb20-ce4e-4ce6-836b-2eea55ce5146', 1, 70.00, 70.00, '2026-01-26 19:56:45.406182+00'),
	('5fb99f3a-92e9-4f78-b859-d37ef9da7b18', '9f5dec03-4977-47a9-9f08-4fadebb86b35', '8e23464a-0b99-47a6-be88-dcdb822e18ae', 1, 300.00, 300.00, '2026-01-26 19:56:45.406182+00'),
	('669162b9-0bb3-4c6d-8d14-66d6cc6b8e3e', 'f4372062-0965-434c-ba77-8013f52a05d1', 'd6a3d062-0a39-4873-9160-09655e7e3305', 1, 100.00, 100.00, '2026-01-26 20:10:19.326504+00'),
	('f69d3dd1-7be9-43f9-bfaf-c228fa9b116e', 'f4372062-0965-434c-ba77-8013f52a05d1', '50abcb20-ce4e-4ce6-836b-2eea55ce5146', 1, 70.00, 70.00, '2026-01-26 20:10:19.326504+00'),
	('9246b4e4-a3f7-4f2d-90f1-2025f41963c8', 'f4372062-0965-434c-ba77-8013f52a05d1', '8e23464a-0b99-47a6-be88-dcdb822e18ae', 1, 300.00, 300.00, '2026-01-26 20:10:19.326504+00'),
	('fde93a7b-f5df-4b62-985d-470712c24b67', 'f20e5133-47a6-4f36-8c23-5cc1b0441cc4', 'd6a3d062-0a39-4873-9160-09655e7e3305', 1, 100.00, 100.00, '2026-01-26 20:10:35.071943+00'),
	('e991c153-8ddc-4cda-b332-857fb9b2112e', 'f20e5133-47a6-4f36-8c23-5cc1b0441cc4', '50abcb20-ce4e-4ce6-836b-2eea55ce5146', 1, 70.00, 70.00, '2026-01-26 20:10:35.071943+00'),
	('2f94fbf7-490e-41bf-bc6d-e21c5b3cf137', 'f20e5133-47a6-4f36-8c23-5cc1b0441cc4', '8e23464a-0b99-47a6-be88-dcdb822e18ae', 1, 300.00, 300.00, '2026-01-26 20:10:35.071943+00'),
	('c020e7c3-7268-4592-a9ed-fc8bcb744b6d', '219126f7-a384-42dc-ad7a-5c9b10b08127', 'd6a3d062-0a39-4873-9160-09655e7e3305', 1, 100.00, 100.00, '2026-01-26 20:11:49.660337+00'),
	('255f2399-c760-44e4-852f-a8f15ddf142b', '219126f7-a384-42dc-ad7a-5c9b10b08127', '50abcb20-ce4e-4ce6-836b-2eea55ce5146', 1, 70.00, 70.00, '2026-01-26 20:11:49.660337+00'),
	('5e415f11-8ca9-46ad-8925-c9a610928014', '219126f7-a384-42dc-ad7a-5c9b10b08127', '8e23464a-0b99-47a6-be88-dcdb822e18ae', 1, 300.00, 300.00, '2026-01-26 20:11:49.660337+00'),
	('0a41f47c-a11d-4210-9fa0-9bd30368cb13', '6ee43395-6b26-43aa-aa76-99b327802700', 'd6a3d062-0a39-4873-9160-09655e7e3305', 1, 100.00, 100.00, '2026-01-26 20:13:01.292584+00'),
	('28265198-6796-4c7f-bf28-217e5906ec38', '6ee43395-6b26-43aa-aa76-99b327802700', '50abcb20-ce4e-4ce6-836b-2eea55ce5146', 1, 70.00, 70.00, '2026-01-26 20:13:01.292584+00'),
	('5442e1a4-042e-47c3-8251-620190171f56', '6ee43395-6b26-43aa-aa76-99b327802700', '8e23464a-0b99-47a6-be88-dcdb822e18ae', 1, 300.00, 300.00, '2026-01-26 20:13:01.292584+00'),
	('b0a93881-0773-4d94-bea3-b3449b0dc72f', '53765906-5672-4fe6-b648-2a4b866f3bd1', 'd6a3d062-0a39-4873-9160-09655e7e3305', 1, 100.00, 100.00, '2026-01-26 20:13:22.386331+00'),
	('8ca351e1-748f-4635-aa09-6e911171ef88', '53765906-5672-4fe6-b648-2a4b866f3bd1', '50abcb20-ce4e-4ce6-836b-2eea55ce5146', 1, 70.00, 70.00, '2026-01-26 20:13:22.386331+00'),
	('5f7486ef-3474-4a34-bd1b-9a28db8d22b7', '53765906-5672-4fe6-b648-2a4b866f3bd1', '8e23464a-0b99-47a6-be88-dcdb822e18ae', 1, 300.00, 300.00, '2026-01-26 20:13:22.386331+00'),
	('2ef4a434-5f90-4b42-992f-951585321ab1', '649f1197-14c3-4cfa-b80a-8aad2fc54f67', 'd6a3d062-0a39-4873-9160-09655e7e3305', 1, 100.00, 100.00, '2026-01-26 20:20:16.186836+00'),
	('7c943047-fe98-48d9-ba8d-5ddec0d8691b', '649f1197-14c3-4cfa-b80a-8aad2fc54f67', '50abcb20-ce4e-4ce6-836b-2eea55ce5146', 1, 70.00, 70.00, '2026-01-26 20:20:16.186836+00'),
	('638d367b-36da-49a4-b069-fdc92716f444', '649f1197-14c3-4cfa-b80a-8aad2fc54f67', '8e23464a-0b99-47a6-be88-dcdb822e18ae', 1, 300.00, 300.00, '2026-01-26 20:20:16.186836+00'),
	('b06ff3cd-0f89-4c94-8b1a-87eace539109', '5b580ef8-6ee4-4cd9-85fc-a11079260b5b', 'd6a3d062-0a39-4873-9160-09655e7e3305', 1, 100.00, 100.00, '2026-01-26 20:22:08.311501+00'),
	('be233dba-3d5f-410e-9cce-249e54d72397', '5b580ef8-6ee4-4cd9-85fc-a11079260b5b', '50abcb20-ce4e-4ce6-836b-2eea55ce5146', 1, 70.00, 70.00, '2026-01-26 20:22:08.311501+00'),
	('52802132-1cb1-486e-bb41-f78e2bab27fc', '5b580ef8-6ee4-4cd9-85fc-a11079260b5b', '8e23464a-0b99-47a6-be88-dcdb822e18ae', 1, 300.00, 300.00, '2026-01-26 20:22:08.311501+00'),
	('ceffe885-68a9-44c4-ac59-01fb4685f9fe', '2efd5832-cc0c-4d83-a556-f38c467f5c74', 'd6a3d062-0a39-4873-9160-09655e7e3305', 1, 100.00, 100.00, '2026-01-26 20:28:11.430379+00'),
	('4005d078-d5a1-4a27-a0de-3662e28ef525', '2efd5832-cc0c-4d83-a556-f38c467f5c74', '50abcb20-ce4e-4ce6-836b-2eea55ce5146', 1, 70.00, 70.00, '2026-01-26 20:28:11.430379+00'),
	('8550852c-4ee3-4d39-b3b6-6dc2c653925e', '2efd5832-cc0c-4d83-a556-f38c467f5c74', '8e23464a-0b99-47a6-be88-dcdb822e18ae', 1, 300.00, 300.00, '2026-01-26 20:28:11.430379+00'),
	('b61bd236-0634-44df-83bd-42a3fe9af9fb', '09a21282-b781-4b46-968c-74ec4c5212c1', 'd6a3d062-0a39-4873-9160-09655e7e3305', 1, 100.00, 100.00, '2026-01-26 20:31:02.452806+00'),
	('5d3cac48-b1d3-4520-99d2-fda8f679c3a4', '09a21282-b781-4b46-968c-74ec4c5212c1', '50abcb20-ce4e-4ce6-836b-2eea55ce5146', 1, 70.00, 70.00, '2026-01-26 20:31:02.452806+00'),
	('0c05d2d3-6222-4b8e-a3a9-940b180f7c88', '09a21282-b781-4b46-968c-74ec4c5212c1', '8e23464a-0b99-47a6-be88-dcdb822e18ae', 1, 300.00, 300.00, '2026-01-26 20:31:02.452806+00'),
	('f0d7e148-1a89-436f-8784-231a2f1f1a61', '58126ba0-44f6-40cc-a324-978eb81aa8da', 'd6a3d062-0a39-4873-9160-09655e7e3305', 1, 100.00, 100.00, '2026-01-26 20:31:19.556925+00'),
	('c5249c31-4c3e-4ece-a469-cd1a3b9c127b', '58126ba0-44f6-40cc-a324-978eb81aa8da', '50abcb20-ce4e-4ce6-836b-2eea55ce5146', 1, 70.00, 70.00, '2026-01-26 20:31:19.556925+00'),
	('a4e6d4b8-004c-44e0-a24a-40baf739f530', '58126ba0-44f6-40cc-a324-978eb81aa8da', '8e23464a-0b99-47a6-be88-dcdb822e18ae', 1, 300.00, 300.00, '2026-01-26 20:31:19.556925+00'),
	('5f6292b8-a6ec-4ff5-b797-bf075031575a', 'd2feb8fe-430f-437e-850e-962c16105d64', 'd6a3d062-0a39-4873-9160-09655e7e3305', 1, 100.00, 100.00, '2026-01-26 20:33:43.440737+00'),
	('2d78a0b4-bf45-411c-96de-53ca6220c124', 'd2feb8fe-430f-437e-850e-962c16105d64', '50abcb20-ce4e-4ce6-836b-2eea55ce5146', 1, 70.00, 70.00, '2026-01-26 20:33:43.440737+00'),
	('374f4074-2daf-458a-837e-0e5d23384d57', 'd2feb8fe-430f-437e-850e-962c16105d64', '8e23464a-0b99-47a6-be88-dcdb822e18ae', 1, 300.00, 300.00, '2026-01-26 20:33:43.440737+00'),
	('8618d5d3-6663-4917-a1f9-59b4e7d3f7d1', 'f79866ff-d14c-4a7c-9daf-42e025de703b', 'd6a3d062-0a39-4873-9160-09655e7e3305', 1, 100.00, 100.00, '2026-01-26 20:34:39.646577+00'),
	('bc447e7e-86b9-4fb3-8cb8-4aec47a375fc', 'f79866ff-d14c-4a7c-9daf-42e025de703b', '50abcb20-ce4e-4ce6-836b-2eea55ce5146', 1, 70.00, 70.00, '2026-01-26 20:34:39.646577+00'),
	('ed5a9a44-5e57-49eb-87cc-23513ae612d3', 'f79866ff-d14c-4a7c-9daf-42e025de703b', '8e23464a-0b99-47a6-be88-dcdb822e18ae', 1, 300.00, 300.00, '2026-01-26 20:34:39.646577+00'),
	('52f11336-186b-4cd1-a279-0b9dc2fc9315', '630dbc6f-2179-4ed7-924b-29c9ce2f05ab', 'd6a3d062-0a39-4873-9160-09655e7e3305', 1, 100.00, 100.00, '2026-01-26 20:35:53.92183+00'),
	('0fccb2e3-9335-4564-98e5-10b60fe3b4fc', '630dbc6f-2179-4ed7-924b-29c9ce2f05ab', '8e23464a-0b99-47a6-be88-dcdb822e18ae', 1, 300.00, 300.00, '2026-01-26 20:35:53.92183+00'),
	('04ae95f0-2952-41c7-a499-297713136f34', '630dbc6f-2179-4ed7-924b-29c9ce2f05ab', '50abcb20-ce4e-4ce6-836b-2eea55ce5146', 1, 70.00, 70.00, '2026-01-26 20:35:53.92183+00'),
	('d71c5c1e-8d4e-4c18-b980-b7d21d248cd9', '728876d1-1480-49fa-8ece-37eeee15bd18', 'd6a3d062-0a39-4873-9160-09655e7e3305', 1, 100.00, 100.00, '2026-01-26 20:38:44.93761+00'),
	('cc34bd03-12f0-484e-a500-5418f4c7fb7d', '728876d1-1480-49fa-8ece-37eeee15bd18', '8e23464a-0b99-47a6-be88-dcdb822e18ae', 1, 300.00, 300.00, '2026-01-26 20:38:44.93761+00'),
	('20f92a43-9538-4535-bc58-878b83bd3719', '728876d1-1480-49fa-8ece-37eeee15bd18', '50abcb20-ce4e-4ce6-836b-2eea55ce5146', 1, 70.00, 70.00, '2026-01-26 20:38:44.93761+00'),
	('a83eab92-af4b-48a3-b1a6-f916460b9639', 'ceca13df-8100-4671-ab48-a379adcfbbc0', 'd6a3d062-0a39-4873-9160-09655e7e3305', 1, 100.00, 100.00, '2026-01-26 20:41:56.611799+00'),
	('11c343b4-bdb2-440d-80ee-b597f7513b66', 'ceca13df-8100-4671-ab48-a379adcfbbc0', '8e23464a-0b99-47a6-be88-dcdb822e18ae', 1, 300.00, 300.00, '2026-01-26 20:41:56.611799+00'),
	('012a5041-37d6-48f2-b184-9b19cb656b63', 'ceca13df-8100-4671-ab48-a379adcfbbc0', '50abcb20-ce4e-4ce6-836b-2eea55ce5146', 1, 70.00, 70.00, '2026-01-26 20:41:56.611799+00'),
	('a52aa00a-fe82-48bf-a7d1-591bf5fd0efc', '744ffe2b-9f5e-4838-a625-135f7af01fe6', 'd6a3d062-0a39-4873-9160-09655e7e3305', 1, 100.00, 100.00, '2026-01-26 20:42:11.231268+00'),
	('9eca6d30-49b8-40ae-9427-19dc5ff51151', '744ffe2b-9f5e-4838-a625-135f7af01fe6', '8e23464a-0b99-47a6-be88-dcdb822e18ae', 1, 300.00, 300.00, '2026-01-26 20:42:11.231268+00'),
	('3f42033e-80fe-45ed-a83c-15532fc01638', '744ffe2b-9f5e-4838-a625-135f7af01fe6', '50abcb20-ce4e-4ce6-836b-2eea55ce5146', 1, 70.00, 70.00, '2026-01-26 20:42:11.231268+00'),
	('4c57bb77-12d1-45b3-869f-3a4d721010be', '948b9006-32a3-4f83-8026-948040f30897', 'd6a3d062-0a39-4873-9160-09655e7e3305', 1, 100.00, 100.00, '2026-01-26 20:45:39.086113+00'),
	('c2dc059c-9ca0-45c1-b3e6-6f1ef1cd4f14', '948b9006-32a3-4f83-8026-948040f30897', '50abcb20-ce4e-4ce6-836b-2eea55ce5146', 1, 70.00, 70.00, '2026-01-26 20:45:39.086113+00'),
	('059fcf13-ace2-46ec-a9c8-160f10377ca3', '948b9006-32a3-4f83-8026-948040f30897', '8e23464a-0b99-47a6-be88-dcdb822e18ae', 1, 300.00, 300.00, '2026-01-26 20:45:39.086113+00'),
	('4d32e592-35c2-4abf-aad8-604fb3be3946', '00b2483c-1fdf-4516-9bd9-92178b7b545b', 'd6a3d062-0a39-4873-9160-09655e7e3305', 1, 100.00, 100.00, '2026-01-26 20:47:12.428203+00'),
	('3b6d503a-e160-4970-a6bb-e237d442b3ce', '00b2483c-1fdf-4516-9bd9-92178b7b545b', '50abcb20-ce4e-4ce6-836b-2eea55ce5146', 1, 70.00, 70.00, '2026-01-26 20:47:12.428203+00'),
	('c7cca179-31c5-4a44-bd9f-5f1626b723ce', '00b2483c-1fdf-4516-9bd9-92178b7b545b', '8e23464a-0b99-47a6-be88-dcdb822e18ae', 1, 300.00, 300.00, '2026-01-26 20:47:12.428203+00'),
	('07c21862-ff7b-4c01-949b-c656de47a79f', 'f8e063ca-e73a-42a5-82f8-7537499c89f3', 'd6a3d062-0a39-4873-9160-09655e7e3305', 1, 100.00, 100.00, '2026-01-26 20:48:43.326938+00'),
	('f74fc7b1-4f07-4299-a797-c455832a9a11', 'f8e063ca-e73a-42a5-82f8-7537499c89f3', '50abcb20-ce4e-4ce6-836b-2eea55ce5146', 1, 70.00, 70.00, '2026-01-26 20:48:43.326938+00'),
	('b0a98a09-11f9-4e52-a1d9-5c4312643805', 'f8e063ca-e73a-42a5-82f8-7537499c89f3', '8e23464a-0b99-47a6-be88-dcdb822e18ae', 1, 300.00, 300.00, '2026-01-26 20:48:43.326938+00'),
	('3d67f262-ba12-419d-955f-bc1c315f76e8', '82204a2c-34b4-4ca8-b6ac-030e2959eb84', 'd6a3d062-0a39-4873-9160-09655e7e3305', 1, 100.00, 100.00, '2026-01-26 20:49:54.326214+00'),
	('287529d2-050d-443c-965a-d4a2827bc611', '82204a2c-34b4-4ca8-b6ac-030e2959eb84', '50abcb20-ce4e-4ce6-836b-2eea55ce5146', 1, 70.00, 70.00, '2026-01-26 20:49:54.326214+00'),
	('866befd5-eb5d-4894-88a0-560d9ed6f9f9', '82204a2c-34b4-4ca8-b6ac-030e2959eb84', '8e23464a-0b99-47a6-be88-dcdb822e18ae', 1, 300.00, 300.00, '2026-01-26 20:49:54.326214+00'),
	('0a4dfef5-d949-442f-bd30-5774d74d2d6b', '601cdfbe-df90-4c56-b81f-812b96dc1dc1', 'd6a3d062-0a39-4873-9160-09655e7e3305', 1, 100.00, 100.00, '2026-01-26 20:54:07.694303+00'),
	('597f1c39-c678-4e21-8b19-15cfdddaf615', '601cdfbe-df90-4c56-b81f-812b96dc1dc1', '50abcb20-ce4e-4ce6-836b-2eea55ce5146', 1, 70.00, 70.00, '2026-01-26 20:54:07.694303+00'),
	('2f655f77-69d1-4fca-a705-714402753549', '601cdfbe-df90-4c56-b81f-812b96dc1dc1', '8e23464a-0b99-47a6-be88-dcdb822e18ae', 1, 300.00, 300.00, '2026-01-26 20:54:07.694303+00'),
	('5db09115-7ac6-4e3e-bead-65599d288ab2', 'a4c6d9b2-4ca6-437b-9a21-396dd1bab64e', 'd6a3d062-0a39-4873-9160-09655e7e3305', 1, 100.00, 100.00, '2026-01-26 21:14:32.781307+00'),
	('54308157-59a1-43d1-80dd-cdcd48462829', 'a4c6d9b2-4ca6-437b-9a21-396dd1bab64e', '8e23464a-0b99-47a6-be88-dcdb822e18ae', 1, 300.00, 300.00, '2026-01-26 21:14:32.781307+00'),
	('5bf3e51c-d7af-4e0b-96cf-f3f3d1681713', 'a4c6d9b2-4ca6-437b-9a21-396dd1bab64e', '50abcb20-ce4e-4ce6-836b-2eea55ce5146', 1, 70.00, 70.00, '2026-01-26 21:14:32.781307+00'),
	('c6f4861a-a50d-40f4-b95f-56a041e6354e', '4770fc0b-a42c-4345-88f0-04fdeaa5a579', 'd6a3d062-0a39-4873-9160-09655e7e3305', 1, 100.00, 100.00, '2026-01-26 21:15:52.974897+00'),
	('6becde58-4476-4870-a29f-002551f888da', '4770fc0b-a42c-4345-88f0-04fdeaa5a579', '8e23464a-0b99-47a6-be88-dcdb822e18ae', 1, 300.00, 300.00, '2026-01-26 21:15:52.974897+00'),
	('ce85ac82-98c6-44be-aa15-8feacf831929', '4770fc0b-a42c-4345-88f0-04fdeaa5a579', '50abcb20-ce4e-4ce6-836b-2eea55ce5146', 1, 70.00, 70.00, '2026-01-26 21:15:52.974897+00'),
	('31d3f9ed-0563-4ac3-9959-4149c97f4803', '16a242be-8ba9-4ef7-9be9-e359379163ff', 'd6a3d062-0a39-4873-9160-09655e7e3305', 1, 100.00, 100.00, '2026-01-26 21:16:26.845807+00'),
	('336108f6-56a5-41db-aeab-99140acfe132', '16a242be-8ba9-4ef7-9be9-e359379163ff', '8e23464a-0b99-47a6-be88-dcdb822e18ae', 1, 300.00, 300.00, '2026-01-26 21:16:26.845807+00'),
	('a2bfde87-bd8d-4234-8f6f-94947bc32d00', '16a242be-8ba9-4ef7-9be9-e359379163ff', '50abcb20-ce4e-4ce6-836b-2eea55ce5146', 1, 70.00, 70.00, '2026-01-26 21:16:26.845807+00'),
	('b8f09992-d373-42a4-98a3-c88df9c3fee9', '039892e3-b4e4-4ebd-ab7b-1d42302ddaa3', 'd6a3d062-0a39-4873-9160-09655e7e3305', 1, 100.00, 100.00, '2026-01-26 21:22:21.878234+00'),
	('8c083bbe-a7d0-4a66-99ba-e8dccd3cb2de', '039892e3-b4e4-4ebd-ab7b-1d42302ddaa3', '8e23464a-0b99-47a6-be88-dcdb822e18ae', 1, 300.00, 300.00, '2026-01-26 21:22:21.878234+00'),
	('771991f8-ea83-4086-bf16-c23f3e52c8ba', '039892e3-b4e4-4ebd-ab7b-1d42302ddaa3', '50abcb20-ce4e-4ce6-836b-2eea55ce5146', 1, 70.00, 70.00, '2026-01-26 21:22:21.878234+00'),
	('e0bbeaed-4f2f-450e-8921-2ad9912172e9', 'a148aca5-c4dd-4151-941b-de375e544a69', 'd6a3d062-0a39-4873-9160-09655e7e3305', 1, 100.00, 100.00, '2026-01-26 21:22:34.57305+00'),
	('fa5895fc-d532-4e85-a59a-d40599088ccd', 'a148aca5-c4dd-4151-941b-de375e544a69', '8e23464a-0b99-47a6-be88-dcdb822e18ae', 1, 300.00, 300.00, '2026-01-26 21:22:34.57305+00'),
	('a772954e-61e9-40ea-ac4b-913d6a63bf04', 'a148aca5-c4dd-4151-941b-de375e544a69', '50abcb20-ce4e-4ce6-836b-2eea55ce5146', 1, 70.00, 70.00, '2026-01-26 21:22:34.57305+00'),
	('39557a57-3eb7-4eac-a272-ca43ded982da', 'ef4587a3-450f-4df6-b1d3-559287855108', 'd6a3d062-0a39-4873-9160-09655e7e3305', 1, 100.00, 100.00, '2026-01-26 21:57:24.703331+00'),
	('4b00878f-efd0-4741-b4d6-4b7652463aec', 'ef4587a3-450f-4df6-b1d3-559287855108', '50abcb20-ce4e-4ce6-836b-2eea55ce5146', 1, 70.00, 70.00, '2026-01-26 21:57:24.703331+00'),
	('6bc8a709-8f3a-497b-aede-1a5aa9276e91', 'ef4587a3-450f-4df6-b1d3-559287855108', '8e23464a-0b99-47a6-be88-dcdb822e18ae', 1, 300.00, 300.00, '2026-01-26 21:57:24.703331+00'),
	('57039240-b2ee-4e8d-ad58-dd36fba36202', '501b20e8-aedd-46f9-b4a9-8218d8d302c9', 'd6a3d062-0a39-4873-9160-09655e7e3305', 1, 100.00, 100.00, '2026-01-26 21:58:01.340132+00'),
	('eae750bf-00ff-4d29-a452-b4c4037021e2', '501b20e8-aedd-46f9-b4a9-8218d8d302c9', '50abcb20-ce4e-4ce6-836b-2eea55ce5146', 1, 70.00, 70.00, '2026-01-26 21:58:01.340132+00'),
	('b5d72c1a-02b7-49e3-a6a3-29098e1788e9', '501b20e8-aedd-46f9-b4a9-8218d8d302c9', '8e23464a-0b99-47a6-be88-dcdb822e18ae', 1, 300.00, 300.00, '2026-01-26 21:58:01.340132+00'),
	('c2672453-5f2f-4cdd-85c5-5c699acff466', '87604d24-4926-4d03-a80a-cb2ec02d24e9', 'd6a3d062-0a39-4873-9160-09655e7e3305', 1, 100.00, 100.00, '2026-01-26 23:18:57.376035+00'),
	('76bd5d74-e60c-4dd2-b50b-d6c39b53e8cb', '87604d24-4926-4d03-a80a-cb2ec02d24e9', '50abcb20-ce4e-4ce6-836b-2eea55ce5146', 1, 70.00, 70.00, '2026-01-26 23:18:57.376035+00'),
	('3e204a49-43de-4e30-b58e-87c2812a1965', '87604d24-4926-4d03-a80a-cb2ec02d24e9', '8e23464a-0b99-47a6-be88-dcdb822e18ae', 1, 300.00, 300.00, '2026-01-26 23:18:57.376035+00');


--
-- Data for Name: batch_order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."batch_order_items" ("id", "batch_id", "order_id", "order_item_id", "quantity", "created_at") VALUES
	('f6086900-5b89-4546-92a2-94fe948cbd29', '96202390-d7da-4a22-ba75-54a12169950f', '3a2be9a6-588a-4a93-9e04-999216891c31', '7da81023-c7a2-4441-8257-33f9d2213333', 1, '2026-01-24 13:20:50.535493+00'),
	('906ee921-f205-45e3-bc86-49dd6c2aefa6', '96202390-d7da-4a22-ba75-54a12169950f', 'fbcd882a-0e69-4d27-a3f5-33928940862f', '07077f33-a7f3-4219-8392-655d1a3f4eef', 1, '2026-01-24 13:20:50.535493+00'),
	('fc01c568-a586-4186-af4e-d8b7b3f0e88e', '96202390-d7da-4a22-ba75-54a12169950f', '64d03ae6-8628-4e14-940f-c90263a425c6', 'b05bf340-c805-4293-9da4-7e653aaea305', 1, '2026-01-24 13:20:50.535493+00'),
	('d6d2e134-6bec-4b7d-96d1-70b2917f7aac', '96202390-d7da-4a22-ba75-54a12169950f', 'e85d9397-82d8-467f-b3e5-48992ef7bc7f', '7a548f5a-7802-47a8-8838-48cc84cfa5db', 1, '2026-01-24 13:20:50.535493+00'),
	('739fd8b0-72d9-4087-9bef-8f62cc9f9918', '96202390-d7da-4a22-ba75-54a12169950f', '0c09b0d9-f404-4715-8aa2-abc38d3d8720', 'f652a654-b3b7-4d2d-9ca3-21729b321f0c', 1, '2026-01-24 13:20:50.535493+00'),
	('40dbcaac-5647-4eeb-9b93-6991f5e4abb5', '96202390-d7da-4a22-ba75-54a12169950f', '4a5142a3-2d8d-478f-bd59-c2f2655b99b7', '1d52bf84-4235-4072-a11b-ffc2ae63da29', 1, '2026-01-24 13:20:50.535493+00'),
	('e23885e3-f129-43e8-a581-f99147f13617', '96202390-d7da-4a22-ba75-54a12169950f', '5a504de3-a8c1-44f4-92bd-ab389a605f42', '1812d7f5-42d2-401b-bf4f-9e4d002f69e9', 1, '2026-01-24 13:20:50.535493+00'),
	('6af05051-d27b-4b70-9cb2-d916dc19b096', '96202390-d7da-4a22-ba75-54a12169950f', '21aa7e58-4d2f-487b-bfbc-ba9c29cdf079', '7779145c-e0b2-4171-85cb-fdd53609d31a', 1, '2026-01-24 13:20:50.535493+00'),
	('46a20def-5422-457b-b023-41ba1946b8d9', '96202390-d7da-4a22-ba75-54a12169950f', '5feb4f7f-5ad4-411e-833e-16200c1923ba', '51d5410a-5f12-4b78-a51d-ecae4201d88a', 2, '2026-01-24 13:20:50.535493+00'),
	('dd282ade-6b42-4117-b0cd-296c4a8299a4', '96202390-d7da-4a22-ba75-54a12169950f', '30671888-b26f-456c-bae4-cec69c1e6a49', '71026ac1-4e55-40f7-ba9d-b48c831c7021', 1, '2026-01-24 13:20:50.535493+00'),
	('ebd634a9-c38a-4233-9279-e96b690f1811', '96202390-d7da-4a22-ba75-54a12169950f', '49ffd9b0-628c-42b2-a4b3-23042aa6c275', 'e9b06707-e6d0-4318-bce7-18eb332520a3', 1, '2026-01-24 13:20:50.535493+00'),
	('c6ac892a-88b4-4d6a-b35a-4033cc5891d9', '96202390-d7da-4a22-ba75-54a12169950f', 'bab1460e-0f2c-41a3-8efb-ba40eec61acd', '4798e045-7220-4c43-a935-d9507b39acc3', 1, '2026-01-24 13:20:50.535493+00'),
	('025bbb71-4149-4a5c-8d14-30ed7ce80391', '96202390-d7da-4a22-ba75-54a12169950f', '14cf586b-a754-4128-99bf-e0961fc87955', '85b1dbbd-7fcb-449a-ba66-afcd235d33ea', 1, '2026-01-24 13:20:50.535493+00'),
	('07504085-f75b-42a9-af0e-b47dc1489e76', '62f3efaf-ddf2-4663-bf6c-6935e6d326fa', '3a2be9a6-588a-4a93-9e04-999216891c31', '378c092a-7e4f-40c5-b130-a82c49f27da4', 1, '2026-01-24 14:13:11.539455+00'),
	('cb6cb8c3-3aa2-4590-98c9-ce8bb1e53020', '62f3efaf-ddf2-4663-bf6c-6935e6d326fa', '4a5142a3-2d8d-478f-bd59-c2f2655b99b7', 'b6c10e60-3768-485a-974e-a10df30525dc', 1, '2026-01-24 14:13:11.539455+00'),
	('0daf183c-5591-4104-83e3-416adc8b2604', '62f3efaf-ddf2-4663-bf6c-6935e6d326fa', '21aa7e58-4d2f-487b-bfbc-ba9c29cdf079', 'a22a798d-062e-4124-8b5a-91577cb0c6c4', 1, '2026-01-24 14:13:11.539455+00'),
	('be12d68a-677a-4d1c-ac88-1d8475f6921b', '62f3efaf-ddf2-4663-bf6c-6935e6d326fa', '30671888-b26f-456c-bae4-cec69c1e6a49', '4d3f8bbb-0f3e-4d4c-9361-ab16f83b776c', 1, '2026-01-24 14:13:11.539455+00'),
	('7779bce5-79d1-462c-ba95-4b56c90a610b', '62f3efaf-ddf2-4663-bf6c-6935e6d326fa', '49ffd9b0-628c-42b2-a4b3-23042aa6c275', 'd75c08e8-bd9f-48de-8442-2e6f80a4e1c2', 1, '2026-01-24 14:13:11.539455+00'),
	('7c665857-f1e7-4be1-94ac-6f64d375cfb8', '62f3efaf-ddf2-4663-bf6c-6935e6d326fa', 'bab1460e-0f2c-41a3-8efb-ba40eec61acd', '5e7c27dc-4095-4496-ac77-5192df3f0ec4', 1, '2026-01-24 14:13:11.539455+00'),
	('0e3fc453-9c9c-4c6f-9832-221d2c143bbe', '62f3efaf-ddf2-4663-bf6c-6935e6d326fa', '14cf586b-a754-4128-99bf-e0961fc87955', '1ce50c75-2c1d-4074-9ca5-07be4cc86450', 1, '2026-01-24 14:13:11.539455+00'),
	('d0cd5e58-fa03-4834-b40b-4e4f20045781', '23c8ecee-fd41-4890-bfdc-c0bbf1551cc0', '64d03ae6-8628-4e14-940f-c90263a425c6', '114d1a30-6d3b-437c-8406-70f4e50040df', 1, '2026-01-24 15:18:21.027669+00'),
	('4ec99b14-e1cd-4069-9e6f-3b7db6232224', '23c8ecee-fd41-4890-bfdc-c0bbf1551cc0', 'e85d9397-82d8-467f-b3e5-48992ef7bc7f', '4e635a6c-6e32-4994-adcb-fd81a6d8a0d0', 1, '2026-01-24 15:18:21.027669+00'),
	('d93a7fb1-ac6d-46a6-80fc-f5eab6fdd7fb', '23c8ecee-fd41-4890-bfdc-c0bbf1551cc0', '0c09b0d9-f404-4715-8aa2-abc38d3d8720', '6dbc06b0-5472-441d-81af-444f0536c535', 1, '2026-01-24 15:18:21.027669+00'),
	('9ab39ccb-3beb-4722-85f7-cf8916624bc7', '23c8ecee-fd41-4890-bfdc-c0bbf1551cc0', '5a504de3-a8c1-44f4-92bd-ab389a605f42', 'c72dd085-6d7a-451c-a158-fc432b264372', 1, '2026-01-24 15:18:21.027669+00'),
	('bd8245a8-b53f-4ae7-a1c7-6dc717fa2a9e', '23c8ecee-fd41-4890-bfdc-c0bbf1551cc0', '30671888-b26f-456c-bae4-cec69c1e6a49', '79a2235f-5d0b-4ae4-bb60-018035935be7', 1, '2026-01-24 15:18:21.027669+00'),
	('25ac9bb2-b8bd-4b73-83d7-10d421871844', '5ca1bd94-b947-4f4f-9a17-0a9b9fbc1e5d', '3a2be9a6-588a-4a93-9e04-999216891c31', '378c092a-7e4f-40c5-b130-a82c49f27da4', 1, '2026-01-24 16:39:18.369262+00'),
	('9c107dea-1176-471d-b57b-8a632ed80ca2', 'a70c92fb-224a-4287-8234-1a380634f5ae', '3a2be9a6-588a-4a93-9e04-999216891c31', '7da81023-c7a2-4441-8257-33f9d2213333', 1, '2026-01-24 16:39:18.369262+00'),
	('48b6c3db-e4aa-4404-b5bc-c0cc133d6ff0', '2ae3072b-c0d5-4748-8138-de045d3d4060', '5feb4f7f-5ad4-411e-833e-16200c1923ba', '4dbd5dc4-5cd8-47ef-aa67-b9cd3642a952', 2, '2026-01-25 17:46:42.265612+00'),
	('4132a205-11bd-4086-ad7d-0a65879ec77f', '2ae3072b-c0d5-4748-8138-de045d3d4060', 'bab1460e-0f2c-41a3-8efb-ba40eec61acd', '2a5ecdae-636e-4933-9708-f6b057110f37', 1, '2026-01-25 17:46:42.265612+00'),
	('3ac9ff87-ba27-4ab1-8e50-3b56695f1bf2', '2ae3072b-c0d5-4748-8138-de045d3d4060', '14cf586b-a754-4128-99bf-e0961fc87955', '3e8e001e-401f-4783-bf41-553bc9c89863', 1, '2026-01-25 17:46:42.265612+00'),
	('84ce75ac-5b88-44ef-b7db-8b0d2db4cbf7', '2ae3072b-c0d5-4748-8138-de045d3d4060', '5d46802e-9064-44fc-8b82-aa5da83e9929', 'b3b7cac8-a6ab-47aa-a321-aef29a636247', 3, '2026-01-25 17:46:42.265612+00'),
	('ece384d4-cd12-4d83-ab77-0c9d8894e9a2', '2cefa5b6-d0ee-4a53-b9c6-c6207aee6ede', 'e85d9397-82d8-467f-b3e5-48992ef7bc7f', 'bbc35faf-b405-409e-a77a-1459f2c2b1d5', 1, '2026-01-25 18:10:48.456613+00'),
	('deaf5527-daf5-4137-8d8c-e9e8862d94ac', '1324449b-df21-4303-a362-b7a5064ddb09', '116e2163-c63a-4588-9362-95c208433e31', 'b31f2285-545d-4245-9f19-f823693d15c5', 1, '2026-01-25 18:30:38.65583+00'),
	('d8e70f11-0727-49bd-8d86-6d306e726535', 'd063e7ce-80de-4b68-a4f7-af88469ef90e', '116e2163-c63a-4588-9362-95c208433e31', '670a29c7-57c2-4c2c-8853-26552be24836', 1, '2026-01-25 18:51:24.465167+00'),
	('f58145bf-6d08-4ef1-ad0f-560d03291793', 'd063e7ce-80de-4b68-a4f7-af88469ef90e', 'd8c011f7-b07f-4d99-95f2-895969b7a27d', 'da3690aa-922f-4b18-9b78-a76b9a8ce820', 1, '2026-01-25 18:51:24.465167+00'),
	('461c2c0c-acea-46ea-b735-71d2a14a49b4', 'f056095e-086b-4eb1-af3f-9729f8fda557', '116e2163-c63a-4588-9362-95c208433e31', '8c736e3e-7ff7-4559-9da3-7cdaf62e4978', 1, '2026-01-25 18:57:22.679452+00'),
	('4fb3c4ea-d5b8-41ed-8291-8c4b040d0c81', 'f056095e-086b-4eb1-af3f-9729f8fda557', 'd8c011f7-b07f-4d99-95f2-895969b7a27d', '9a905a92-2000-4db1-a590-2988a7318855', 1, '2026-01-25 18:57:22.679452+00'),
	('55b6475c-8dfd-48bb-a842-f827a9d052b3', 'f056095e-086b-4eb1-af3f-9729f8fda557', '19c65ff1-f2b7-49b4-b5ed-e989bd321a45', '545f2051-707b-4245-96f2-0cdffd85e189', 1, '2026-01-25 18:57:22.679452+00'),
	('3ce31acd-b995-4cbc-a7ad-8caac1e25e53', 'eaedac71-0d93-4035-aebf-0bdca58b77f2', 'd8c011f7-b07f-4d99-95f2-895969b7a27d', 'f7c19f26-328d-44c7-bb42-ef473e82b269', 1, '2026-01-25 18:57:31.342585+00'),
	('785f55b8-1e1a-40ff-8f3b-5e796c9fc00f', 'eaedac71-0d93-4035-aebf-0bdca58b77f2', '19c65ff1-f2b7-49b4-b5ed-e989bd321a45', 'bbb7895d-0d51-4380-93d4-31fa2349be7b', 1, '2026-01-25 18:57:31.342585+00'),
	('f0b6f7e3-d762-4801-8066-052ee5c0341b', '4414bbdd-cd96-4c5a-8208-ca33c07452ac', '19c65ff1-f2b7-49b4-b5ed-e989bd321a45', 'e8ee7797-ac41-409e-b127-bf6505c672ad', 1, '2026-01-25 18:57:32.757069+00'),
	('33cde005-aae9-488f-99b5-683cd85c4887', '8a03e393-fd38-48ec-93d3-2729888f02db', 'b3c4713e-0faf-4075-9ffa-02c7c54166e4', '61f93adc-7be6-413f-b0e1-9cc6eff4cf9b', 1, '2026-01-25 19:14:39.886242+00'),
	('68cdbcd4-3e23-456b-ada0-25ae746c7b2c', 'baf214fa-a110-4160-91ab-e192f46010d1', 'b3c4713e-0faf-4075-9ffa-02c7c54166e4', '8224b42a-5c90-45b6-9f98-055ad3a57530', 1, '2026-01-25 19:19:27.00186+00'),
	('13c1dfb9-1fab-424c-8583-effcb850a6fc', 'f287586d-386d-422f-bcb1-ec81e079e68a', 'b3c4713e-0faf-4075-9ffa-02c7c54166e4', '32225b73-6dc8-4953-879c-a6a3bd12a4a5', 1, '2026-01-25 19:19:29.507451+00');


--
-- Data for Name: batch_orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."batch_orders" ("id", "batch_id", "order_id", "created_at") VALUES
	('a4c09cb0-283f-4ea4-971c-ffdbeac59648', 'a32ec839-a70d-47ab-999e-666444247323', '0c09b0d9-f404-4715-8aa2-abc38d3d8720', '2026-01-24 13:02:57.0886+00'),
	('d8c943f3-6a48-49fc-bc7b-8b8a41fc566c', 'a32ec839-a70d-47ab-999e-666444247323', '14cf586b-a754-4128-99bf-e0961fc87955', '2026-01-24 13:02:57.0886+00'),
	('ad87bf78-78bc-40b1-bb1c-e09c3d2f6345', 'a32ec839-a70d-47ab-999e-666444247323', '21aa7e58-4d2f-487b-bfbc-ba9c29cdf079', '2026-01-24 13:02:57.0886+00'),
	('8ec0ca87-7914-48ba-b7af-6a90775e61f5', 'a32ec839-a70d-47ab-999e-666444247323', '30671888-b26f-456c-bae4-cec69c1e6a49', '2026-01-24 13:02:57.0886+00'),
	('471d3523-ef07-4b3f-a7ca-6c6ca242e77b', 'a32ec839-a70d-47ab-999e-666444247323', '3a2be9a6-588a-4a93-9e04-999216891c31', '2026-01-24 13:02:57.0886+00'),
	('8b9cbdbe-f6bf-4804-8654-a21d0c5482e7', 'a32ec839-a70d-47ab-999e-666444247323', '49ffd9b0-628c-42b2-a4b3-23042aa6c275', '2026-01-24 13:02:57.0886+00'),
	('b0d16bc2-3e15-4ead-9c5a-74b21c3e7e2b', 'a32ec839-a70d-47ab-999e-666444247323', '4a5142a3-2d8d-478f-bd59-c2f2655b99b7', '2026-01-24 13:02:57.0886+00'),
	('8bb1afac-f723-4ea9-b04c-418a598a1df5', 'a32ec839-a70d-47ab-999e-666444247323', '5a504de3-a8c1-44f4-92bd-ab389a605f42', '2026-01-24 13:02:57.0886+00'),
	('ca15f309-82c8-4332-acdc-c23b6c59131d', 'a32ec839-a70d-47ab-999e-666444247323', '5feb4f7f-5ad4-411e-833e-16200c1923ba', '2026-01-24 13:02:57.0886+00'),
	('b36cea3b-fd15-4cc4-a9a1-9dc608aee317', 'a32ec839-a70d-47ab-999e-666444247323', '64d03ae6-8628-4e14-940f-c90263a425c6', '2026-01-24 13:02:57.0886+00'),
	('efcc81c5-826f-4ebe-87ea-b8d6d55230f5', 'a32ec839-a70d-47ab-999e-666444247323', 'bab1460e-0f2c-41a3-8efb-ba40eec61acd', '2026-01-24 13:02:57.0886+00'),
	('ea42fd52-c1d9-46fa-969f-2b216b65cc07', 'a32ec839-a70d-47ab-999e-666444247323', 'e85d9397-82d8-467f-b3e5-48992ef7bc7f', '2026-01-24 13:02:57.0886+00'),
	('76b946d1-357f-4c1e-9402-dbaae4ed04b0', 'a32ec839-a70d-47ab-999e-666444247323', 'fbcd882a-0e69-4d27-a3f5-33928940862f', '2026-01-24 13:02:57.0886+00');


--
-- Data for Name: communication_log; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: delivery_partners; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."delivery_partners" ("id", "name", "contact_phone", "is_active", "created_at") VALUES
	('0ab7f8ca-7a44-4113-bbf1-61d3f08007af', 'Quick Delivery', '+91-98765-54321', true, '2026-01-13 18:18:36.485961+00'),
	('6b521c1a-984c-4ffb-b41f-0162fe77d205', 'Safe Transport', '+91-98765-54322', true, '2026-01-13 18:18:36.485961+00'),
	('9f88457d-2762-462a-8b6f-c58e6b223d0b', 'Express Logistics', '+91-98765-54323', true, '2026-01-13 18:18:36.485961+00'),
	('0a6890b4-f835-4687-aa92-ff53809fc11c', 'Ram', '9876543210', true, '2026-01-25 07:14:03.893631+00');


--
-- Data for Name: deliveries; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."deliveries" ("id", "order_id", "delivery_partner_id", "pickup_time", "delivered_time", "status", "notes", "created_at", "updated_at", "delivery_number", "batch_id", "customer_name", "customer_email", "customer_phone", "delivery_address", "delivery_partner_name", "delivery_partner_phone", "estimated_delivery_date", "actual_delivery_date", "tracking_number", "items_count", "total_value", "delivery_status") VALUES
	('7f6a87d7-391e-467a-b0e0-e2c6dc309944', '3a2be9a6-588a-4a93-9e04-999216891c31', NULL, NULL, NULL, 'in_progress', 'Test delivery after constraint removal', '2026-01-24 16:58:47.527273+00', '2026-01-24 16:58:47.527273+00', 'TEST-DELIVERY-1769273927.527273', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-27 16:58:47.527273+00', NULL, NULL, 0, 0.00, 'pending'),
	('5e46dc3a-d04e-4487-920b-e87aaf3954b1', '3a2be9a6-588a-4a93-9e04-999216891c31', NULL, NULL, NULL, 'in_progress', 'Auto-created when all order items were completed for order: ORD-31621538', '2026-01-24 17:00:18.554169+00', '2026-01-24 17:00:18.554169+00', 'DEL-2026-01-24-185541', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-27 17:00:18.554169+00', NULL, NULL, 0, 0.00, 'pending'),
	('2486eddc-c52b-4cfa-8853-a3ddd6afdb7c', '3a2be9a6-588a-4a93-9e04-999216891c31', NULL, NULL, NULL, 'in_progress', 'Auto-created when all order items were completed for order: ORD-31621538', '2026-01-24 17:01:34.715792+00', '2026-01-24 17:01:34.715792+00', 'DEL-2026-01-24-347157', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-27 17:01:34.715792+00', NULL, NULL, 0, 0.00, 'pending'),
	('b7509116-cb31-45bb-99a7-d1300ff2c8c0', '0c09b0d9-f404-4715-8aa2-abc38d3d8720', NULL, NULL, NULL, 'in_progress', 'Auto-created when all order items were completed for order: ORD-78197887', '2026-01-24 17:22:21.506717+00', '2026-01-24 17:22:21.506717+00', 'DEL-2026-01-24-176927-cfbbf1c5', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-27 17:22:21.506717+00', NULL, NULL, 0, 0.00, 'pending'),
	('25c95d8f-27fd-42b6-ad12-56e06e7eb476', '21aa7e58-4d2f-487b-bfbc-ba9c29cdf079', NULL, NULL, NULL, 'in_progress', 'Auto-created when all order items were completed for order: ORD-33936528', '2026-01-24 17:22:21.506717+00', '2026-01-24 17:22:21.506717+00', 'DEL-2026-01-24-176927-487d4943', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-27 17:22:21.506717+00', NULL, NULL, 0, 0.00, 'pending'),
	('af05d9d7-fa72-48af-b736-4f1b1cda105b', '4a5142a3-2d8d-478f-bd59-c2f2655b99b7', NULL, NULL, NULL, 'in_progress', 'Auto-created when all order items were completed for order: ORD-97720548', '2026-01-24 17:22:21.506717+00', '2026-01-24 17:22:21.506717+00', 'DEL-2026-01-24-176927-53cbc96f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-27 17:22:21.506717+00', NULL, NULL, 0, 0.00, 'pending'),
	('8cfde3b8-03ff-4611-9ef9-9aef3093197b', '5a504de3-a8c1-44f4-92bd-ab389a605f42', NULL, NULL, NULL, 'in_progress', 'Auto-created when all order items were completed for order: ORD-27558652', '2026-01-24 17:22:21.506717+00', '2026-01-24 17:22:21.506717+00', 'DEL-2026-01-24-176927-f72677d7', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-27 17:22:21.506717+00', NULL, NULL, 0, 0.00, 'pending'),
	('7ec95bd3-9c0c-4ba4-9cc8-edf57bc28669', '64d03ae6-8628-4e14-940f-c90263a425c6', NULL, NULL, NULL, 'in_progress', 'Auto-created when all order items were completed for order: ORD-80996392', '2026-01-24 17:22:21.506717+00', '2026-01-24 17:22:21.506717+00', 'DEL-2026-01-24-176927-a36760f9', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-27 17:22:21.506717+00', NULL, NULL, 0, 0.00, 'pending'),
	('657bbb20-208d-4496-a084-e8c7b8c6c500', 'fbcd882a-0e69-4d27-a3f5-33928940862f', NULL, NULL, NULL, 'in_progress', 'Auto-created when all order items were completed for order: ORD-32002516', '2026-01-24 17:22:21.506717+00', '2026-01-24 17:22:21.506717+00', 'DEL-2026-01-24-176927-a89c6f22', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-27 17:22:21.506717+00', NULL, NULL, 0, 0.00, 'pending'),
	('36e28273-0640-466a-b59a-23d5725e53ed', 'e85d9397-82d8-467f-b3e5-48992ef7bc7f', NULL, NULL, NULL, 'in_progress', 'Auto-created when all order items were completed for order: ORD-77502459', '2026-01-25 18:14:55.76994+00', '2026-01-25 18:14:55.76994+00', 'DEL-2026-01-25-176936-8e3edfc7', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-28 18:14:55.76994+00', NULL, NULL, 0, 0.00, 'pending'),
	('af393a8c-fd38-4322-a76a-bc4ca1eaeac2', '30671888-b26f-456c-bae4-cec69c1e6a49', '0a6890b4-f835-4687-aa92-ff53809fc11c', NULL, NULL, 'in_progress', 'Auto-created when all order items were completed for order: ORD-40617048', '2026-01-24 17:22:21.506717+00', '2026-01-25 16:10:38.447749+00', 'DEL-2026-01-24-176927-53dc1206', NULL, NULL, NULL, NULL, NULL, 'Ram', '9876543210', '2026-01-27 17:22:21.506717+00', NULL, NULL, 0, 0.00, 'delivered'),
	('e5eb4d52-9124-45a1-a1f3-856e4573298b', '14cf586b-a754-4128-99bf-e0961fc87955', NULL, NULL, NULL, 'in_progress', 'Auto-created when all order items were completed for order: ORD-67932407', '2026-01-25 17:47:51.113593+00', '2026-01-25 17:47:51.113593+00', 'DEL-2026-01-25-176936-8e6db9b5', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-28 17:47:51.113593+00', NULL, NULL, 0, 0.00, 'pending'),
	('f1590cab-ba7c-4d58-ab27-1805877d8d89', '5d46802e-9064-44fc-8b82-aa5da83e9929', NULL, NULL, NULL, 'in_progress', 'Auto-created when all order items were completed for order: ORD-58151409', '2026-01-25 17:47:51.113593+00', '2026-01-25 17:47:51.113593+00', 'DEL-2026-01-25-176936-1ad310e4', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-28 17:47:51.113593+00', NULL, NULL, 0, 0.00, 'pending'),
	('5f4adb04-7403-416b-b381-bb18e3103e1e', '5feb4f7f-5ad4-411e-833e-16200c1923ba', NULL, NULL, NULL, 'in_progress', 'Auto-created when all order items were completed for order: ORD-34299892', '2026-01-25 17:47:51.113593+00', '2026-01-25 17:47:51.113593+00', 'DEL-2026-01-25-176936-7721d61d', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-28 17:47:51.113593+00', NULL, NULL, 0, 0.00, 'pending'),
	('49e56547-85b8-4461-a7c9-78228093ab84', '19c65ff1-f2b7-49b4-b5ed-e989bd321a45', '9f88457d-2762-462a-8b6f-c58e6b223d0b', NULL, NULL, 'in_progress', 'Auto-created when all order items were completed for order: ORD-67400565', '2026-01-25 18:59:18.434428+00', '2026-01-25 19:01:14.396631+00', 'DEL-2026-01-25-176936-bb48385e', NULL, NULL, NULL, NULL, NULL, 'Express Logistics', '+91-98765-54323', '2026-01-28 18:59:18.434428+00', NULL, 'TRK-1769367595519', 0, 0.00, 'delivered'),
	('d9062f11-e272-4ab7-b403-346869b73a3f', 'bab1460e-0f2c-41a3-8efb-ba40eec61acd', NULL, NULL, NULL, 'in_progress', 'Auto-created when all order items were completed for order: ORD-46410701', '2026-01-25 17:47:51.113593+00', '2026-01-25 17:49:32.910903+00', 'DEL-2026-01-25-176936-1c6c3919', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-28 17:47:51.113593+00', NULL, NULL, 0, 0.00, 'delivered'),
	('afc201c1-b8c6-4f5a-9b25-400f25386084', '49ffd9b0-628c-42b2-a4b3-23042aa6c275', '0a6890b4-f835-4687-aa92-ff53809fc11c', NULL, NULL, 'delivered', 'Auto-created when all order items were completed for order: ORD-82754929', '2026-01-24 17:22:21.506717+00', '2026-01-25 20:09:56.407122+00', 'DEL-2026-01-24-176927-24f8a2da', NULL, NULL, NULL, NULL, NULL, 'Ram', '9876543210', '2026-01-27 17:22:21.506717+00', NULL, 'TRK-1769350741126', 0, 0.00, 'scheduled'),
	('672d99c6-dc65-4742-a13a-23130e3509e8', 'b3c4713e-0faf-4075-9ffa-02c7c54166e4', '0ab7f8ca-7a44-4113-bbf1-61d3f08007af', NULL, NULL, 'delivered', 'Auto-created when all order items were completed for order: ORD-67449426', '2026-01-25 19:27:28.680648+00', '2026-01-25 20:51:52.587856+00', 'DEL-2026-01-25-176936-afabd731', NULL, NULL, NULL, NULL, NULL, 'Quick Delivery', '+91-98765-54321', '2026-01-28 19:27:28.680648+00', NULL, 'TRK-1769369286300', 0, 0.00, 'delivered');


--
-- Data for Name: ingredient_unit_conversions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."ingredient_unit_conversions" ("id", "ingredient_id", "from_unit", "to_unit", "conversion_factor", "is_primary", "created_at", "updated_at") VALUES
	('76a5b9ea-9cec-4b4a-99e7-e695c851135c', 'fbb6520f-7977-4eef-beee-dc42f1e9ac34', 'pieces', 'grams', 50.000, true, '2026-01-25 22:24:13.681199+00', '2026-01-25 22:24:13.681199+00');


--
-- Data for Name: ingredient_updates; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."ingredient_updates" ("id", "ingredient_id", "previous_stock", "new_stock", "previous_cost", "new_cost", "previous_supplier", "new_supplier", "update_type", "notes", "created_by", "created_at") VALUES
	('22193597-7758-4ff5-ae8f-30ec1e228761', '6e43f4da-d41f-43de-a7ef-154181f7dc79', 1200.00, 1300.00, 0.06, 0.06, 'dc7211d4-f4d5-44a3-a7ed-ec06df4b669d', 'dc7211d4-f4d5-44a3-a7ed-ec06df4b669d', 'purchase', NULL, NULL, '2026-01-21 12:06:28.817334+00'),
	('3ac353c6-108b-4e96-9a93-ead7883d859f', 'bbf5cbf8-1d98-4cb3-a83e-fb5960e00ff2', 1100.00, 1200.00, 0.57, 0.57, '5e01287d-4bf6-48f7-9d75-d94ea9281057', '44f82e39-b7a4-49d2-ad95-51966b26226a', 'purchase', NULL, NULL, '2026-01-23 13:16:08.384301+00'),
	('2a781408-6c93-41c0-9f7b-fa508d241074', '0310a18d-f905-4684-bcf4-8adc50ea567a', 1000.00, 1100.00, 0.00, 1.00, 'b59c33eb-af2e-41ae-876c-d096446b4966', 'b59c33eb-af2e-41ae-876c-d096446b4966', 'purchase', NULL, NULL, '2026-01-23 13:35:19.918833+00'),
	('09105404-65c9-440f-871d-56c632467b67', 'db9789e5-9369-4047-a0f8-27780b1ce015', 1999.59, 1.59, 0.29, 0.29, '1513f9f3-4184-46b8-bd35-da7b37e6e974', '1513f9f3-4184-46b8-bd35-da7b37e6e974', 'adjustment', NULL, NULL, '2026-01-23 20:38:50.502775+00'),
	('5898b861-365b-4674-9de6-2a664262b908', 'db9789e5-9369-4047-a0f8-27780b1ce015', 13.50, 1.50, 0.29, 0.29, '1513f9f3-4184-46b8-bd35-da7b37e6e974', '1513f9f3-4184-46b8-bd35-da7b37e6e974', 'adjustment', NULL, NULL, '2026-01-23 20:41:16.348565+00'),
	('b8cafe11-99c5-42e0-98ee-b7a7d9fd8363', '42852e14-b034-4e8b-b3d0-7265272c6c85', 1000.00, 0.00, 0.00, 0.07, '145f5f36-8582-4a77-9c0b-89bde47c649b', '145f5f36-8582-4a77-9c0b-89bde47c649b', 'adjustment', NULL, NULL, '2026-01-23 20:43:23.500482+00'),
	('415b2186-814c-4e90-95e0-ebd1e06abe9e', 'db9789e5-9369-4047-a0f8-27780b1ce015', 1.50, 0.50, 0.29, 0.29, '1513f9f3-4184-46b8-bd35-da7b37e6e974', '1513f9f3-4184-46b8-bd35-da7b37e6e974', 'adjustment', NULL, NULL, '2026-01-23 21:23:02.683292+00');


--
-- Data for Name: purchase_orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."purchase_orders" ("id", "order_number", "vendor_id", "status", "total_amount", "notes", "created_at", "sent_at", "confirmed_at", "received_at", "created_by") VALUES
	('e45bf375-3ad7-4f0b-89ae-943a21ca8aca', 'PO-20260123-176919', '1513f9f3-4184-46b8-bd35-da7b37e6e974', 'received', 0.00, 'Auto-generated for Chicken from Local Supplier', '2026-01-23 19:59:32.099621+00', '2026-01-23 20:10:31.415+00', '2026-01-23 20:10:40.734+00', '2026-01-23 20:10:49.176+00', '1bdc0d75-de5a-462e-8050-78169ac09139'),
	('b16e8980-dcb7-4afa-a442-d0ab59ab3510', 'PO-20260123-17691993', '1513f9f3-4184-46b8-bd35-da7b37e6e974', 'draft', 1595.12, 'Auto-generated for Chicken from Local Supplier. Quantity: 5500.412 units @ ₹0.29/unit', '2026-01-23 20:15:56.180584+00', NULL, NULL, NULL, '1bdc0d75-de5a-462e-8050-78169ac09139'),
	('019a80c5-3eab-4b95-8590-7e928516b1cb', 'PO-20260123-17692001', '1513f9f3-4184-46b8-bd35-da7b37e6e974', 'draft', 0.19, 'Auto-generated for Chicken from Local Supplier. Quantity: 0.645 units @ ₹0.29/unit', '2026-01-23 20:29:46.995204+00', NULL, NULL, NULL, '1bdc0d75-de5a-462e-8050-78169ac09139'),
	('f19fdfc4-d29a-4bf0-a70d-3c17d6d1dee1', 'PO-20260123-17692002', '1513f9f3-4184-46b8-bd35-da7b37e6e974', 'received', 3.46, 'Auto-generated for Chicken from Local Supplier. Quantity: 11.915 units @ ₹0.29/unit', '2026-01-23 20:30:55.044185+00', '2026-01-23 20:39:56.115+00', '2026-01-23 20:40:00.897+00', '2026-01-23 20:40:05.155+00', '1bdc0d75-de5a-462e-8050-78169ac09139'),
	('fa1327e4-de2d-4086-9fc9-b3752d62eebc', 'PO-20260123-17692013', '145f5f36-8582-4a77-9c0b-89bde47c649b', 'draft', 315.00, 'Auto-generated for Pumpkin from Local Market. Quantity: 4500.000 units @ ₹0.07/unit', '2026-01-23 20:48:55.892912+00', NULL, NULL, NULL, '1bdc0d75-de5a-462e-8050-78169ac09139'),
	('85ad6d0f-7981-4465-b239-ad907a921ce0', 'PO-20260123-17692024', '145f5f36-8582-4a77-9c0b-89bde47c649b', 'draft', 0.01, 'Auto-generated for Pumpkin from Local Market. Quantity: 0.108 units @ ₹0.07/unit', '2026-01-23 21:07:39.142651+00', NULL, NULL, NULL, '1bdc0d75-de5a-462e-8050-78169ac09139'),
	('b84cbaa8-a4fd-43ed-b204-c18d9e0261b5', 'PO-20260123-17692025', '145f5f36-8582-4a77-9c0b-89bde47c649b', 'draft', 0.28, 'Auto-generated for Pumpkin from Local Market. Quantity: 4.000 units @ ₹0.07/unit', '2026-01-23 21:09:39.511437+00', NULL, NULL, NULL, '1bdc0d75-de5a-462e-8050-78169ac09139'),
	('7e339908-a097-40a8-9ade-545a81a546ae', 'PO-20260123-17692026', '145f5f36-8582-4a77-9c0b-89bde47c649b', 'draft', 0.01, 'Auto-generated for Pumpkin from Local Market. Quantity: 0.108 units @ ₹0.07/unit', '2026-01-23 21:10:02.758296+00', NULL, NULL, NULL, '1bdc0d75-de5a-462e-8050-78169ac09139'),
	('7397ad2d-cf22-490d-8daf-9aa24610bdbe', 'PO-20260123-17692027', '145f5f36-8582-4a77-9c0b-89bde47c649b', 'received', 70.00, 'Auto-generated for Pumpkin from Local Market. Quantity: 1000.000 units @ ₹0.07/unit', '2026-01-23 21:11:47.532575+00', '2026-01-23 21:12:17.287+00', '2026-01-23 21:12:19.023+00', '2026-01-23 21:12:20.615+00', '1bdc0d75-de5a-462e-8050-78169ac09139'),
	('f0d4dca4-abe0-4aca-a6f7-632d9465bcfa', 'PO-20260123-1769204045476', '1513f9f3-4184-46b8-bd35-da7b37e6e974', 'draft', 0.19, 'Auto-generated for Chicken from Local Supplier. Quantity: 0.645 units @ ₹0.29/unit', '2026-01-23 21:34:05.475982+00', NULL, NULL, NULL, '1bdc0d75-de5a-462e-8050-78169ac09139'),
	('242ca7d1-26f5-4128-8070-cbf1e16f32be', 'PO-20260123-1769204982717', '1513f9f3-4184-46b8-bd35-da7b37e6e974', 'draft', 0.19, 'Auto-generated for Chicken from Local Supplier for order 4a5142a3-2d8d-478f-bd59-c2f2655b99b7. Quantity: 0.645 units @ ₹0.29/unit', '2026-01-23 21:49:42.717456+00', NULL, NULL, NULL, '1bdc0d75-de5a-462e-8050-78169ac09139'),
	('0ca854d8-0079-4681-a07e-e195a7d1dd50', 'PO-20260123-1769205039139', '9dacf72f-0997-444a-9b29-95644e5663ae', 'draft', 5.00, 'Auto-generated for Beetroot from Local Farm. Quantity: 100.000 units @ ₹0.05/unit', '2026-01-23 21:50:39.139101+00', NULL, NULL, NULL, '1bdc0d75-de5a-462e-8050-78169ac09139'),
	('33f34f83-55a3-41cc-ba85-184b81bb4b79', 'PO-20260123-1769205283590', '1513f9f3-4184-46b8-bd35-da7b37e6e974', 'draft', 0.19, 'Auto-generated for Chicken from Local Supplier for order 4a5142a3-2d8d-478f-bd59-c2f2655b99b7. Quantity: 0.645 units @ ₹0.29/unit', '2026-01-23 21:54:43.589629+00', NULL, NULL, NULL, '1bdc0d75-de5a-462e-8050-78169ac09139'),
	('8e714c6f-b817-4600-b654-a6cb7931e4ad', 'PO-20260123-1769205525619', '1513f9f3-4184-46b8-bd35-da7b37e6e974', 'draft', 0.19, 'Auto-generated for ingredient: Chicken (ID: db9789e5-9369-4047-a0f8-27780b1ce015) for order 4a5142a3-2d8d-478f-bd59-c2f2655b99b7. Quantity: 0.645 units @ ₹0.29/unit', '2026-01-23 21:58:45.618641+00', NULL, NULL, NULL, '1bdc0d75-de5a-462e-8050-78169ac09139'),
	('c505fb64-ea7a-4814-b830-310315df4db5', 'PO-20260123-1769205836267', '1513f9f3-4184-46b8-bd35-da7b37e6e974', 'draft', 0.19, 'Auto-generated for ingredient: Chicken (ID: db9789e5-9369-4047-a0f8-27780b1ce015) for order ORD-97720548. Quantity: 0.645 units @ ₹0.29/unit', '2026-01-23 22:03:56.266665+00', NULL, NULL, NULL, '1bdc0d75-de5a-462e-8050-78169ac09139'),
	('23d67bf3-ace1-4165-825f-2d2100eaf1d2', 'PO-20260123-1769206173052', '1513f9f3-4184-46b8-bd35-da7b37e6e974', 'draft', 3.48, 'Auto-generated for Chicken. Quantity: 12.000 units @ ₹0.29/unit [Ingredient ID: db9789e5-9369-4047-a0f8-27780b1ce015]', '2026-01-23 22:09:33.051669+00', NULL, NULL, NULL, '1bdc0d75-de5a-462e-8050-78169ac09139'),
	('3e31092f-69ff-4285-96bc-d423c450b78a', 'PO-20260123-1769208175165', '1513f9f3-4184-46b8-bd35-da7b37e6e974', 'draft', 0.19, 'Auto-generated for Chicken for order ORD-31621538. Quantity: 0.645 units @ ₹0.29/unit [Ingredient ID: db9789e5-9369-4047-a0f8-27780b1ce015]', '2026-01-23 22:42:55.164976+00', NULL, NULL, NULL, '1bdc0d75-de5a-462e-8050-78169ac09139'),
	('649ed863-9b6f-4e6c-91ed-ddbeb166e2de', 'PO-20260123-1769208149239', '1513f9f3-4184-46b8-bd35-da7b37e6e974', 'received', 2.96, 'Auto-generated for Chicken. Quantity: 10.210 units @ ₹0.29/unit [Ingredient ID: db9789e5-9369-4047-a0f8-27780b1ce015]', '2026-01-23 22:42:29.238776+00', '2026-01-23 22:44:57.953+00', '2026-01-23 22:45:00.919+00', '2026-01-23 22:45:02.651+00', '1bdc0d75-de5a-462e-8050-78169ac09139'),
	('7a49a5f9-ee6e-4d84-8fdf-8cbcbba07655', 'PO-20260125-1769367324018', '1513f9f3-4184-46b8-bd35-da7b37e6e974', 'received', 31.80, 'Auto-generated for Chicken for order ORD-67400565. Quantity: 109.650 units @ ₹0.29/unit [Ingredient ID: db9789e5-9369-4047-a0f8-27780b1ce015]', '2026-01-25 18:55:24.018469+00', '2026-01-25 18:55:48.857+00', '2026-01-25 18:55:50.507+00', '2026-01-25 18:55:51.707+00', '1bdc0d75-de5a-462e-8050-78169ac09139'),
	('a625e758-2138-4437-a867-9cc6e2952e06', 'PO-20260125-1769367321002', '9dacf72f-0997-444a-9b29-95644e5663ae', 'received', 215.00, 'Auto-generated for Eggs for order ORD-67400565. Quantity: 26.875 units @ ₹8.00/unit [Ingredient ID: fbb6520f-7977-4eef-beee-dc42f1e9ac34]', '2026-01-25 18:55:21.001626+00', '2026-01-25 18:56:14.074+00', '2026-01-25 18:56:15.845+00', '2026-01-25 18:56:17.47+00', '1bdc0d75-de5a-462e-8050-78169ac09139'),
	('5f15dd7d-2c85-4a73-963a-211c56202d62', 'PO-20260125-1769368392324', '9dacf72f-0997-444a-9b29-95644e5663ae', 'received', 215.00, 'Auto-generated for Eggs for order ORD-67449426. Quantity: 26.875 units @ ₹8.00/unit [Ingredient ID: fbb6520f-7977-4eef-beee-dc42f1e9ac34]', '2026-01-25 19:13:12.32416+00', '2026-01-25 19:13:25.612+00', '2026-01-25 19:13:27.12+00', '2026-01-25 19:13:28.168+00', '1bdc0d75-de5a-462e-8050-78169ac09139'),
	('6417eb7c-904d-4a3e-805d-a18426124bde', 'PO-1769500802794-UVWHB5', '1513f9f3-4184-46b8-bd35-da7b37e6e974', 'draft', 0.00, 'Auto-generated PO for Chicken - Production Queue. Quantity: 1035 units', '2026-01-27 08:00:02.340658+00', NULL, NULL, NULL, '1bdc0d75-de5a-462e-8050-78169ac09139'),
	('5a8beaa9-4758-4d77-85d5-9c967f343d50', 'PO-1769500911906-5JD463', '1513f9f3-4184-46b8-bd35-da7b37e6e974', 'draft', 0.00, 'Auto-generated PO for Chicken - Production Queue. Quantity: 1035 units', '2026-01-27 08:01:51.443613+00', NULL, NULL, NULL, '1bdc0d75-de5a-462e-8050-78169ac09139'),
	('517fb5be-d67e-49c8-8720-7ee16854e780', 'PO-1769503238171-1QVWSQ', '9dacf72f-0997-444a-9b29-95644e5663ae', 'received', 160.00, 'Auto-generated PO for Eggs - Quantity: 20.00 pieces', '2026-01-27 08:40:37.646953+00', '2026-01-27 08:40:57.604+00', '2026-01-27 08:40:59.34+00', '2026-01-27 08:41:00.882+00', '1bdc0d75-de5a-462e-8050-78169ac09139'),
	('4a9ccc94-66c0-4d1c-8d0d-095da37bcaa1', 'PO-1769503924792-5HDA86', '9dacf72f-0997-444a-9b29-95644e5663ae', 'received', 160.00, 'Auto-generated PO for Eggs - Quantity: 20.00 pieces', '2026-01-27 08:52:04.253492+00', '2026-01-27 08:52:24.096+00', '2026-01-27 08:52:25.764+00', '2026-01-27 08:52:27.41+00', '1bdc0d75-de5a-462e-8050-78169ac09139'),
	('16085c91-0b0d-4cc0-b6e5-7c6ac64e9ebb', 'PO-1769504120282-RJ4NHT', '9dacf72f-0997-444a-9b29-95644e5663ae', 'received', 160.00, 'Auto-generated PO for Eggs - Quantity: 20.00 pieces', '2026-01-27 08:55:19.740392+00', '2026-01-27 08:55:33.402+00', '2026-01-27 08:55:34.984+00', '2026-01-27 08:55:36.348+00', '1bdc0d75-de5a-462e-8050-78169ac09139'),
	('d71238e3-ffba-4257-ac23-64930426c0fc', 'PO-1769504522013-F48FU5', '9dacf72f-0997-444a-9b29-95644e5663ae', 'received', 160.00, 'Auto-generated PO for Eggs - Quantity: 20.00 pieces', '2026-01-27 09:02:01.484932+00', '2026-01-27 09:02:14.638+00', '2026-01-27 09:02:16.194+00', '2026-01-27 09:02:17.926+00', '1bdc0d75-de5a-462e-8050-78169ac09139');


--
-- Data for Name: low_stock_alerts; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: packaging_materials; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."packaging_materials" ("id", "name", "type", "unit", "current_stock", "reorder_level", "unit_cost", "supplier", "description", "created_at", "updated_at") VALUES
	('99f27444-603d-4767-80f6-938f38e6db88', '70g Stand Up Pouch', 'packaging', 'pieces', 1000.00, 200.00, 2.50, NULL, 'Packaging for 70g meals', '2026-01-25 23:03:43.793297+00', '2026-01-25 23:03:43.793297+00'),
	('87d0330f-a27d-417a-b4e3-ce65951842a8', '100ml Spout Pouch', 'packaging', 'pieces', 500.00, 100.00, 3.00, NULL, 'Packaging for 100ml broths', '2026-01-25 23:03:43.793297+00', '2026-01-25 23:03:43.793297+00'),
	('1ce07e03-595a-4008-8669-28a21dfce23a', 'Cookie Jar', 'packaging', 'pieces', 300.00, 50.00, 8.00, NULL, 'Packaging for cookies (both 100g and 200g)', '2026-01-25 23:03:43.793297+00', '2026-01-25 23:03:43.793297+00'),
	('134e5ca1-cef0-4ca0-a8d3-447151fdb9f9', 'Cupcake Box', 'packaging', 'pieces', 400.00, 80.00, 4.00, NULL, 'Packaging for cupcakes', '2026-01-25 23:03:43.793297+00', '2026-01-25 23:03:43.793297+00'),
	('86893116-4ebf-428f-9790-e8d884f94b0b', 'Nourish Label', 'label', 'pieces', 2000.00, 400.00, 0.50, NULL, 'Label for Nourish 70g meal', '2026-01-25 23:03:43.793297+00', '2026-01-25 23:03:43.793297+00'),
	('4af05287-6b17-47fa-ac12-743655fe3c69', 'Vitality Label', 'label', 'pieces', 2000.00, 400.00, 0.50, NULL, 'Label for Vitality 70g meal', '2026-01-25 23:03:43.793297+00', '2026-01-25 23:03:43.793297+00'),
	('81f889cc-9a51-4f91-b7cf-e53e5b1a1f22', 'Power Label', 'label', 'pieces', 2000.00, 400.00, 0.50, NULL, 'Label for Power 70g meal', '2026-01-25 23:03:43.793297+00', '2026-01-25 23:03:43.793297+00'),
	('e43ad71a-b916-4be6-8244-e602387564e6', 'Supreme Label', 'label', 'pieces', 2000.00, 400.00, 0.50, NULL, 'Label for Supreme 70g meal', '2026-01-25 23:03:43.793297+00', '2026-01-25 23:03:43.793297+00'),
	('6efb9589-6ae9-4d0c-b7fa-9bc88d582bb6', 'Nurture Label', 'label', 'pieces', 2000.00, 400.00, 0.50, NULL, 'Label for Nurture 70g meal', '2026-01-25 23:03:43.793297+00', '2026-01-25 23:03:43.793297+00'),
	('32d00c12-55e9-4aaa-b9b5-db3c52cf6234', 'Thrive Label', 'label', 'pieces', 2000.00, 400.00, 0.50, NULL, 'Label for Thrive 70g meal', '2026-01-25 23:03:43.793297+00', '2026-01-25 23:03:43.793297+00'),
	('e930a53d-7576-4a4d-b522-d3b405615254', 'Essence Label', 'label', 'pieces', 1000.00, 200.00, 0.60, NULL, 'Label for Essence 100ml broth', '2026-01-25 23:03:43.793297+00', '2026-01-25 23:03:43.793297+00'),
	('9abe89a6-9981-4423-a82a-aee4471c27fe', 'Bone Rich Label', 'label', 'pieces', 1000.00, 200.00, 0.60, NULL, 'Label for Bone Rich 100ml broth', '2026-01-25 23:03:43.793297+00', '2026-01-25 23:03:43.793297+00'),
	('b99845b1-c458-4725-a5da-37f0d9d8d6df', 'Logo Sticker', 'label', 'pieces', 5000.00, 1000.00, 0.25, NULL, 'Logo sticker for cookie jars and cupcakes', '2026-01-25 23:03:43.793297+00', '2026-01-25 23:03:43.793297+00');


--
-- Data for Name: product_recipes; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."product_recipes" ("id", "product_id", "ingredient_id", "percentage", "created_at") VALUES
	('afc6663e-a189-4fec-9ddb-6f1621d741d6', 'e017972d-4a82-4461-b24d-8a1fd72b5c71', 'db9789e5-9369-4047-a0f8-27780b1ce015', 60.00, '2026-01-13 18:18:36.485961+00'),
	('36c7592a-d81e-4246-8293-afb9e243d0c6', 'e017972d-4a82-4461-b24d-8a1fd72b5c71', '42852e14-b034-4e8b-b3d0-7265272c6c85', 30.00, '2026-01-13 18:18:36.485961+00'),
	('951428a0-f89d-40c5-b569-350818714e34', 'e017972d-4a82-4461-b24d-8a1fd72b5c71', '511a547b-d8d8-44ae-b899-a14f621ac74f', 10.00, '2026-01-13 18:18:36.485961+00'),
	('eb6662fc-018d-4b0a-84e6-ddd4e84cff39', '7bc76252-827b-4429-ae6c-68e60dc07fb2', 'db9789e5-9369-4047-a0f8-27780b1ce015', 30.00, '2026-01-13 18:18:36.485961+00'),
	('ae12d614-6571-4f8f-b755-0ca4ba3d1966', '7bc76252-827b-4429-ae6c-68e60dc07fb2', 'fbb6520f-7977-4eef-beee-dc42f1e9ac34', 30.00, '2026-01-13 18:18:36.485961+00'),
	('475edd44-898e-4af8-bfaf-a08cc0624d9b', '7bc76252-827b-4429-ae6c-68e60dc07fb2', '42852e14-b034-4e8b-b3d0-7265272c6c85', 20.00, '2026-01-13 18:18:36.485961+00'),
	('094c0819-5f68-4d71-b2f7-d35e930e1767', '7bc76252-827b-4429-ae6c-68e60dc07fb2', 'ac8c0d87-9200-4b22-8545-4b6b91ab69a4', 10.00, '2026-01-13 18:18:36.485961+00'),
	('ee018c0d-8ac7-442c-841d-1a8a0df43478', '7bc76252-827b-4429-ae6c-68e60dc07fb2', '76e76623-56b9-4809-8afa-9f567a1f2b3a', 7.00, '2026-01-13 18:18:36.485961+00'),
	('ed6587d7-b985-4bd3-88f3-fe8e79c96f07', '7bc76252-827b-4429-ae6c-68e60dc07fb2', 'aeb8b029-8668-415f-9d26-1a1f423463de', 2.00, '2026-01-13 18:18:36.485961+00'),
	('546c9f3c-e4bb-4b8f-a156-c91aebdc5b82', '7bc76252-827b-4429-ae6c-68e60dc07fb2', '635a914f-8c44-41e5-a6c8-fcca78a0cfc0', 1.00, '2026-01-13 18:18:36.485961+00'),
	('a27e22bb-9d3a-42e7-a120-96e1d72dbeaf', 'cb5b0c0d-80a8-4017-9fe7-9f69b1a5a042', 'db9789e5-9369-4047-a0f8-27780b1ce015', 50.00, '2026-01-13 18:18:36.485961+00'),
	('e4aac19b-5890-432e-82c5-14949ea57e39', 'cb5b0c0d-80a8-4017-9fe7-9f69b1a5a042', '9a14c0f0-1bac-4a6a-8911-0a6f8bd2a776', 10.00, '2026-01-13 18:18:36.485961+00'),
	('c173c35b-58af-4ffe-8d45-aa6abd3527cd', 'cb5b0c0d-80a8-4017-9fe7-9f69b1a5a042', '42852e14-b034-4e8b-b3d0-7265272c6c85', 10.00, '2026-01-13 18:18:36.485961+00'),
	('05747913-1ada-4b14-83d6-c15ca902db12', 'cb5b0c0d-80a8-4017-9fe7-9f69b1a5a042', '511a547b-d8d8-44ae-b899-a14f621ac74f', 10.00, '2026-01-13 18:18:36.485961+00'),
	('e8f632c0-79ac-4762-939a-1f9bf70f6807', 'cb5b0c0d-80a8-4017-9fe7-9f69b1a5a042', 'ac8c0d87-9200-4b22-8545-4b6b91ab69a4', 10.00, '2026-01-13 18:18:36.485961+00'),
	('6cf151f3-5211-4e04-a95b-6d9525668933', 'cb5b0c0d-80a8-4017-9fe7-9f69b1a5a042', 'aeb8b029-8668-415f-9d26-1a1f423463de', 3.00, '2026-01-13 18:18:36.485961+00'),
	('3d6b60c7-1439-4eb3-8e2f-4d473c378295', 'cb5b0c0d-80a8-4017-9fe7-9f69b1a5a042', '635a914f-8c44-41e5-a6c8-fcca78a0cfc0', 2.00, '2026-01-13 18:18:36.485961+00'),
	('3b92cddf-939c-4e72-babf-dadf51045659', '7bd899d2-e50e-4af5-b574-59b5bf4ca5ee', 'db9789e5-9369-4047-a0f8-27780b1ce015', 40.00, '2026-01-13 18:18:36.485961+00'),
	('f327faf7-98e6-4d5f-86d7-62b8fddcad93', '7bd899d2-e50e-4af5-b574-59b5bf4ca5ee', '30912850-47c2-43f4-8b20-864a2a0504c4', 20.00, '2026-01-13 18:18:36.485961+00'),
	('e2a99cf8-9444-4699-9fdb-540884029bce', '7bd899d2-e50e-4af5-b574-59b5bf4ca5ee', '42852e14-b034-4e8b-b3d0-7265272c6c85', 10.00, '2026-01-13 18:18:36.485961+00'),
	('4178c7d3-2059-40fa-81bc-d9ba6a4f869d', '7bd899d2-e50e-4af5-b574-59b5bf4ca5ee', '511a547b-d8d8-44ae-b899-a14f621ac74f', 10.00, '2026-01-13 18:18:36.485961+00'),
	('8eccce87-0028-47ac-9662-58ffde3cb59c', '7bd899d2-e50e-4af5-b574-59b5bf4ca5ee', 'e3007499-1070-43ab-a662-883100b87a27', 3.00, '2026-01-13 18:18:36.485961+00'),
	('2db68110-6846-454e-b9fd-a1bf6b084322', '7bd899d2-e50e-4af5-b574-59b5bf4ca5ee', '635a914f-8c44-41e5-a6c8-fcca78a0cfc0', 2.00, '2026-01-13 18:18:36.485961+00'),
	('6d2cdae7-2f4f-4b81-ba33-d063cf381870', 'b97698ca-4b52-427e-bc57-e141e55d3493', 'bbf5cbf8-1d98-4cb3-a83e-fb5960e00ff2', 50.00, '2026-01-13 18:18:36.485961+00'),
	('2f481d7f-b7dc-45dd-a3b2-089854b0e423', 'b97698ca-4b52-427e-bc57-e141e55d3493', '511a547b-d8d8-44ae-b899-a14f621ac74f', 20.00, '2026-01-13 18:18:36.485961+00'),
	('e01c5976-db50-4f70-bf53-4ef6ccc70429', 'b97698ca-4b52-427e-bc57-e141e55d3493', '42852e14-b034-4e8b-b3d0-7265272c6c85', 15.00, '2026-01-13 18:18:36.485961+00'),
	('bacc997b-3790-4d4f-ad6c-d441c26fcd88', 'b97698ca-4b52-427e-bc57-e141e55d3493', 'ac8c0d87-9200-4b22-8545-4b6b91ab69a4', 10.00, '2026-01-13 18:18:36.485961+00'),
	('df1f3e66-7b4b-459d-bb17-7e67c699b2a9', 'b97698ca-4b52-427e-bc57-e141e55d3493', 'aeb8b029-8668-415f-9d26-1a1f423463de', 5.00, '2026-01-13 18:18:36.485961+00'),
	('c757f86f-750d-48d9-b380-538b03feea09', 'b97698ca-4b52-427e-bc57-e141e55d3493', '0310a18d-f905-4684-bcf4-8adc50ea567a', 10.00, '2026-01-13 18:18:36.485961+00'),
	('f5d40e90-8fce-471d-a1c5-18669ca2f3a6', '66c100e1-7f24-4953-b49b-63250db854d9', '30912850-47c2-43f4-8b20-864a2a0504c4', 30.00, '2026-01-13 18:18:36.485961+00'),
	('7bb03f89-3a40-47fe-a8d6-361a74403c5e', '66c100e1-7f24-4953-b49b-63250db854d9', 'fbb6520f-7977-4eef-beee-dc42f1e9ac34', 30.00, '2026-01-13 18:18:36.485961+00'),
	('bb9989a0-6201-4bce-9622-ed336ad445ab', '66c100e1-7f24-4953-b49b-63250db854d9', '42852e14-b034-4e8b-b3d0-7265272c6c85', 15.00, '2026-01-13 18:18:36.485961+00'),
	('fe32bfef-8786-4b72-bc48-144000ca048d', '66c100e1-7f24-4953-b49b-63250db854d9', 'ac8c0d87-9200-4b22-8545-4b6b91ab69a4', 15.00, '2026-01-13 18:18:36.485961+00'),
	('a38404da-92f9-449e-9d94-03a891ff9a95', '66c100e1-7f24-4953-b49b-63250db854d9', '76e76623-56b9-4809-8afa-9f567a1f2b3a', 5.00, '2026-01-13 18:18:36.485961+00'),
	('fdd2e2aa-6918-43b9-975e-3f275927466a', '66c100e1-7f24-4953-b49b-63250db854d9', '0310a18d-f905-4684-bcf4-8adc50ea567a', 5.00, '2026-01-13 18:18:36.485961+00'),
	('d027e4ad-dd42-4361-bb40-2d22d97a7205', 'de648df5-cd0f-4e29-b53c-da676c55258f', 'db9789e5-9369-4047-a0f8-27780b1ce015', 25.00, '2026-01-13 18:18:36.485961+00'),
	('f66a690c-80a6-4085-ab56-0b95ca8c54b3', 'de648df5-cd0f-4e29-b53c-da676c55258f', '635a914f-8c44-41e5-a6c8-fcca78a0cfc0', 75.00, '2026-01-13 18:18:36.485961+00'),
	('bb4adec7-f360-4e97-af17-757de91b0b0a', '0e9204cf-21af-482f-a332-d36269959ffd', '0310a18d-f905-4684-bcf4-8adc50ea567a', 100.00, '2026-01-13 18:18:36.485961+00'),
	('c2a33c4b-11f7-4cc7-be15-e49122d134d1', 'e019ccf1-3a0e-4cd1-adca-3910635c3161', 'db9789e5-9369-4047-a0f8-27780b1ce015', 35.00, '2026-01-13 18:18:36.485961+00'),
	('08e3b02d-178e-4213-9e09-a81c4f5dd7c8', 'e019ccf1-3a0e-4cd1-adca-3910635c3161', 'fbb6520f-7977-4eef-beee-dc42f1e9ac34', 25.00, '2026-01-13 18:18:36.485961+00'),
	('1e858343-39c5-4435-9eb4-4af1937d2e44', 'e019ccf1-3a0e-4cd1-adca-3910635c3161', 'e59aa3b4-44c9-40c9-b628-570777c3dd9e', 20.00, '2026-01-13 18:18:36.485961+00'),
	('f60c5f34-1768-4a76-8a41-2a89a6ca6095', 'e019ccf1-3a0e-4cd1-adca-3910635c3161', 'af4e7a6d-36ba-4073-aed8-d83c0d7d13b9', 10.00, '2026-01-13 18:18:36.485961+00'),
	('b91cc89d-c2bb-4882-b08b-96a78873f1a5', 'e019ccf1-3a0e-4cd1-adca-3910635c3161', '42852e14-b034-4e8b-b3d0-7265272c6c85', 10.00, '2026-01-13 18:18:36.485961+00'),
	('10c08ae6-b0cf-4a0f-ba71-1a417fe8ea20', '35a83797-69af-4257-8178-35894f481b02', '30912850-47c2-43f4-8b20-864a2a0504c4', 35.00, '2026-01-13 18:18:36.485961+00'),
	('533b8e81-0166-40b3-a5d3-4db3579785c2', '35a83797-69af-4257-8178-35894f481b02', 'fbb6520f-7977-4eef-beee-dc42f1e9ac34', 25.00, '2026-01-13 18:18:36.485961+00'),
	('1b27c8f3-d5e0-42e2-8c71-b6ee3368e777', '35a83797-69af-4257-8178-35894f481b02', 'e59aa3b4-44c9-40c9-b628-570777c3dd9e', 20.00, '2026-01-13 18:18:36.485961+00'),
	('803396e5-c2e1-4197-8d3a-26ef7d751339', 'ccd26ecf-8059-4a27-a2db-6ae15da11ca4', 'db9789e5-9369-4047-a0f8-27780b1ce015', 13.33, '2026-01-13 18:18:36.485961+00'),
	('96665605-7c2b-4217-b8c2-bb783e7d58e6', 'ccd26ecf-8059-4a27-a2db-6ae15da11ca4', 'e59aa3b4-44c9-40c9-b628-570777c3dd9e', 80.00, '2026-01-13 18:18:36.485961+00'),
	('63720ade-fbbe-425c-8bd0-a42b00e7de7b', 'ccd26ecf-8059-4a27-a2db-6ae15da11ca4', 'af4e7a6d-36ba-4073-aed8-d83c0d7d13b9', 6.67, '2026-01-13 18:18:36.485961+00'),
	('3bbcd6f8-543d-45d0-a520-1540421ce807', 'ed3392a2-2738-4c05-9717-cf43ad40e1be', '6e43f4da-d41f-43de-a7ef-154181f7dc79', 13.33, '2026-01-13 18:18:36.485961+00'),
	('eb5c3b12-1a43-4ea6-bb84-dd0b3fcebba8', 'ed3392a2-2738-4c05-9717-cf43ad40e1be', 'e59aa3b4-44c9-40c9-b628-570777c3dd9e', 80.00, '2026-01-13 18:18:36.485961+00'),
	('44b7ca8d-795f-454d-ad67-36014ab07e93', 'ed3392a2-2738-4c05-9717-cf43ad40e1be', 'af4e7a6d-36ba-4073-aed8-d83c0d7d13b9', 6.67, '2026-01-13 18:18:36.485961+00'),
	('7dc63bdb-8fea-43e8-8689-5f1b264e1ea3', '35a83797-69af-4257-8178-35894f481b02', '42852e14-b034-4e8b-b3d0-7265272c6c85', 15.00, '2026-01-13 18:18:36.485961+00'),
	('2d6a97bc-0329-47d7-ab89-e637a21451f3', '35a83797-69af-4257-8178-35894f481b02', 'af4e7a6d-36ba-4073-aed8-d83c0d7d13b9', 5.00, '2026-01-13 18:18:36.485961+00'),
	('ecde9648-54cd-417f-b491-e50867f5f5c4', '68e827a3-3eaa-4d3f-be58-084ea66f7d28', '9f2dea46-05f1-4cfd-873b-cf82a66a93a4', 35.00, '2026-01-27 05:12:31.437509+00'),
	('c4cea0ea-5ee8-4533-a2dc-13a21201a76e', '68e827a3-3eaa-4d3f-be58-084ea66f7d28', '1e5abb2b-4904-407d-9b00-c33c1286f5a1', 35.00, '2026-01-27 05:12:54.644871+00'),
	('16a2d589-b96e-489a-9142-a43a01cba42c', '68e827a3-3eaa-4d3f-be58-084ea66f7d28', '42852e14-b034-4e8b-b3d0-7265272c6c85', 20.00, '2026-01-13 18:18:36.485961+00'),
	('be5e77cd-3719-4621-8475-052fde22b78a', '68e827a3-3eaa-4d3f-be58-084ea66f7d28', 'af4e7a6d-36ba-4073-aed8-d83c0d7d13b9', 10.00, '2026-01-13 18:18:36.485961+00'),
	('40f3dd3b-2273-4d1d-892b-d347299fb836', '90310ac1-6f99-4c07-8e3e-68677ffcc96f', '9f2dea46-05f1-4cfd-873b-cf82a66a93a4', 35.00, '2026-01-27 05:14:25.90124+00'),
	('d2f5be3b-8e85-4d80-b138-b4f5b8d2e119', '90310ac1-6f99-4c07-8e3e-68677ffcc96f', '1e5abb2b-4904-407d-9b00-c33c1286f5a1', 35.00, '2026-01-27 05:14:43.719653+00'),
	('98117783-f46e-455e-b187-609b17679b57', '90310ac1-6f99-4c07-8e3e-68677ffcc96f', 'adad8c20-00ab-4831-8867-9c91ca78935c', 20.00, '2026-01-13 18:18:36.485961+00'),
	('92a6b600-44a2-4526-bafc-8068e9a55d55', '90310ac1-6f99-4c07-8e3e-68677ffcc96f', 'af4e7a6d-36ba-4073-aed8-d83c0d7d13b9', 10.00, '2026-01-13 18:18:36.485961+00');


--
-- Data for Name: production_batch_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."production_batch_items" ("id", "batch_id", "order_id", "order_item_id", "product_id", "quantity_planned", "quantity_produced", "weight_grams", "status", "notes", "created_at", "updated_at") VALUES
	('3ff772d4-2380-42ca-a46d-3a487f3a24fc', 'a70c92fb-224a-4287-8234-1a380634f5ae', '3a2be9a6-588a-4a93-9e04-999216891c31', '7da81023-c7a2-4441-8257-33f9d2213333', 'de648df5-cd0f-4e29-b53c-da676c55258f', 1.000, 0.000, 100.000, 'pending', NULL, '2026-01-24 00:55:57.309571+00', '2026-01-24 00:55:57.309571+00'),
	('4aa3accf-2dfc-4684-a30d-fc213acf6db3', 'a70c92fb-224a-4287-8234-1a380634f5ae', '3a2be9a6-588a-4a93-9e04-999216891c31', '378c092a-7e4f-40c5-b130-a82c49f27da4', 'e019ccf1-3a0e-4cd1-adca-3910635c3161', 1.000, 0.000, 100.000, 'pending', NULL, '2026-01-24 00:55:57.309571+00', '2026-01-24 00:55:57.309571+00'),
	('5febd716-24c8-491c-bebb-9336518663b0', '5ca1bd94-b947-4f4f-9a17-0a9b9fbc1e5d', '3a2be9a6-588a-4a93-9e04-999216891c31', '7da81023-c7a2-4441-8257-33f9d2213333', 'de648df5-cd0f-4e29-b53c-da676c55258f', 1.000, 0.000, 100.000, 'pending', NULL, '2026-01-24 01:15:52.812639+00', '2026-01-24 01:15:52.812639+00'),
	('acd65135-599b-4fc1-9c23-14bfca46506d', '5ca1bd94-b947-4f4f-9a17-0a9b9fbc1e5d', '3a2be9a6-588a-4a93-9e04-999216891c31', '378c092a-7e4f-40c5-b130-a82c49f27da4', 'e019ccf1-3a0e-4cd1-adca-3910635c3161', 1.000, 0.000, 100.000, 'pending', NULL, '2026-01-24 01:15:52.812639+00', '2026-01-24 01:15:52.812639+00'),
	('7f7a281b-0e1a-4c35-9d82-6a8e308eafa2', 'b16eba6f-6666-4ab4-9eb2-8aef5ecf4c7c', '5a504de3-a8c1-44f4-92bd-ab389a605f42', '1812d7f5-42d2-401b-bf4f-9e4d002f69e9', 'de648df5-cd0f-4e29-b53c-da676c55258f', 1.000, 0.000, 100.000, 'pending', NULL, '2026-01-24 12:23:57.567491+00', '2026-01-24 12:23:57.567491+00'),
	('90a78a00-7cfa-4fa4-b699-9d2dcb37c5aa', 'b16eba6f-6666-4ab4-9eb2-8aef5ecf4c7c', '5a504de3-a8c1-44f4-92bd-ab389a605f42', 'c72dd085-6d7a-451c-a158-fc432b264372', 'ccd26ecf-8059-4a27-a2db-6ae15da11ca4', 1.000, 0.000, 100.000, 'pending', NULL, '2026-01-24 12:23:57.567491+00', '2026-01-24 12:23:57.567491+00'),
	('2d6a077f-eea6-4dee-a7a3-aebda1dafb32', '48da70d6-28e6-4c4d-a4e3-03e4dbb8765b', '21aa7e58-4d2f-487b-bfbc-ba9c29cdf079', '7779145c-e0b2-4171-85cb-fdd53609d31a', 'de648df5-cd0f-4e29-b53c-da676c55258f', 1.000, 0.000, 100.000, 'pending', NULL, '2026-01-24 12:24:24.388698+00', '2026-01-24 12:24:24.388698+00'),
	('783032f2-6492-47e5-a721-969f24b68f5f', '48da70d6-28e6-4c4d-a4e3-03e4dbb8765b', '21aa7e58-4d2f-487b-bfbc-ba9c29cdf079', 'a22a798d-062e-4124-8b5a-91577cb0c6c4', 'e019ccf1-3a0e-4cd1-adca-3910635c3161', 1.000, 0.000, 100.000, 'pending', NULL, '2026-01-24 12:24:24.388698+00', '2026-01-24 12:24:24.388698+00');


--
-- Data for Name: production_batches_simple; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: production_batches_test; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: purchase_order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."purchase_order_items" ("id", "purchase_order_id", "ingredient_id", "quantity", "unit_price", "status", "created_at") VALUES
	('4050b616-25d0-4fc5-86d2-0d8550ca7184', '6417eb7c-904d-4a3e-805d-a18426124bde', 'db9789e5-9369-4047-a0f8-27780b1ce015', 1035.000, 0.00, 'ordered', '2026-01-27 08:00:02.659934+00'),
	('e1f76881-8e9f-4264-b9ba-807fb8e4b59a', '5a8beaa9-4758-4d77-85d5-9c967f343d50', 'db9789e5-9369-4047-a0f8-27780b1ce015', 1035.000, 0.00, 'ordered', '2026-01-27 08:01:51.705634+00'),
	('c851e04b-f2fe-4cda-ade3-c306b43a6b32', '517fb5be-d67e-49c8-8720-7ee16854e780', 'fbb6520f-7977-4eef-beee-dc42f1e9ac34', 20.000, 8.00, 'ordered', '2026-01-27 08:40:37.849114+00'),
	('24001012-d69c-4a0a-b0bf-2c318e15d10e', '4a9ccc94-66c0-4d1c-8d0d-095da37bcaa1', 'fbb6520f-7977-4eef-beee-dc42f1e9ac34', 20.000, 8.00, 'ordered', '2026-01-27 08:52:04.462766+00'),
	('f98e7a59-209e-47b1-9795-ffb2d4645c67', '16085c91-0b0d-4cc0-b6e5-7c6ac64e9ebb', 'fbb6520f-7977-4eef-beee-dc42f1e9ac34', 20.000, 8.00, 'ordered', '2026-01-27 08:55:20.010949+00'),
	('ed65dc38-da83-41fa-9fa5-9dd094cb8a2e', 'd71238e3-ffba-4257-ac23-64930426c0fc', 'fbb6520f-7977-4eef-beee-dc42f1e9ac34', 20.000, 8.00, 'ordered', '2026-01-27 09:02:01.794154+00');


--
-- Data for Name: simple_test; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: stock_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."stock_transactions" ("id", "ingredient_id", "transaction_type", "quantity", "unit_cost", "reference_id", "notes", "created_at") VALUES
	('131f4260-bbdc-428b-b0dd-8d9a7a27c7a1', 'fbb6520f-7977-4eef-beee-dc42f1e9ac34', 'purchase', 1000.000, NULL, NULL, 'PO #PO-1769504120282-RJ4NHT - Received: 20.000 pieces (1000.000g)', '2026-01-27 08:55:36.032517+00'),
	('ef3d3555-b92f-4a66-b0a2-3d64eeec273b', 'fbb6520f-7977-4eef-beee-dc42f1e9ac34', 'purchase', 20.000, NULL, NULL, 'PO #PO-1769504522013-F48FU5 - Received: 20.000 pieces', '2026-01-27 09:02:17.64381+00');


--
-- Data for Name: subscriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: test_table; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: vendor_orders; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: vendor_order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."buckets" ("id", "name", "owner", "created_at", "updated_at", "public", "avif_autodetection", "file_size_limit", "allowed_mime_types", "owner_id", "type") VALUES
	('product-images', 'product-images', NULL, '2026-01-16 16:00:26.076872+00', '2026-01-16 16:00:26.076872+00', true, false, 5242880, '{image/*}', NULL, 'STANDARD');


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."objects" ("id", "bucket_id", "name", "owner", "created_at", "updated_at", "last_accessed_at", "metadata", "version", "owner_id", "user_metadata", "level") VALUES
	('e8570054-46db-46da-a32a-1052073a2512', 'product-images', 'product-images/1768592432205-39fsykfg387.webp', '1bdc0d75-de5a-462e-8050-78169ac09139', '2026-01-16 19:40:34.278989+00', '2026-01-16 19:40:34.278989+00', '2026-01-16 19:40:34.278989+00', '{"eTag": "\"9efb93780e040751b3b7c7abf7cba9ff\"", "size": 181634, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-01-16T19:40:35.000Z", "contentLength": 181634, "httpStatusCode": 200}', '8beee6cf-319f-4db0-b066-c3c93f169dec', '1bdc0d75-de5a-462e-8050-78169ac09139', '{}', 2),
	('658f3211-4370-49be-b7e2-19279bdaae50', 'product-images', 'product-images/1768592847760-mw7x3jtwn4r.webp', '1bdc0d75-de5a-462e-8050-78169ac09139', '2026-01-16 19:47:29.799692+00', '2026-01-16 19:47:29.799692+00', '2026-01-16 19:47:29.799692+00', '{"eTag": "\"b91dc004fe16f24140b20bf9ee58386e\"", "size": 181102, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-01-16T19:47:30.000Z", "contentLength": 181102, "httpStatusCode": 200}', 'b432bad3-d8da-42c8-9597-1b96cc75e564', '1bdc0d75-de5a-462e-8050-78169ac09139', '{}', 2),
	('dba155f9-07e6-414d-8375-c8d6cf8fb57d', 'product-images', 'product-images/1768592877381-ze1jkxvjz3h.webp', '1bdc0d75-de5a-462e-8050-78169ac09139', '2026-01-16 19:47:59.005061+00', '2026-01-16 19:47:59.005061+00', '2026-01-16 19:47:59.005061+00', '{"eTag": "\"cc78b746d3b2f820ec2b3563b9754a3c\"", "size": 181176, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-01-16T19:47:59.000Z", "contentLength": 181176, "httpStatusCode": 200}', '235495df-76a4-4646-be14-30c8eb3f00e2', '1bdc0d75-de5a-462e-8050-78169ac09139', '{}', 2),
	('6d6cadbc-9618-4edd-bdf7-a7fe0a666c7c', 'product-images', 'product-images/1768592906701-hbyg5xu64c7.webp', '1bdc0d75-de5a-462e-8050-78169ac09139', '2026-01-16 19:48:28.651319+00', '2026-01-16 19:48:28.651319+00', '2026-01-16 19:48:28.651319+00', '{"eTag": "\"686f404432cdb16e4821da54db0c242c\"", "size": 181022, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-01-16T19:48:29.000Z", "contentLength": 181022, "httpStatusCode": 200}', 'bb6314f2-b397-4206-b150-e9ba45619bdf', '1bdc0d75-de5a-462e-8050-78169ac09139', '{}', 2),
	('fcd8fa43-1ddc-4838-b4e4-969ad9e85ebf', 'product-images', 'product-images/1768593278197-yp493me7ifb.webp', '1bdc0d75-de5a-462e-8050-78169ac09139', '2026-01-16 19:54:39.904648+00', '2026-01-16 19:54:39.904648+00', '2026-01-16 19:54:39.904648+00', '{"eTag": "\"49498f6d4cf2c3a67b6b80c0bd68d345\"", "size": 170356, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-01-16T19:54:40.000Z", "contentLength": 170356, "httpStatusCode": 200}', 'c352e008-3c4f-4165-93b2-a2fc8044cad7', '1bdc0d75-de5a-462e-8050-78169ac09139', '{}', 2),
	('073f2cdc-83c7-45ac-bb28-22fbbb3a372a', 'product-images', 'product-images/1768593294212-1xy4twlfqs5.webp', '1bdc0d75-de5a-462e-8050-78169ac09139', '2026-01-16 19:54:56.006824+00', '2026-01-16 19:54:56.006824+00', '2026-01-16 19:54:56.006824+00', '{"eTag": "\"72c232f44af6142948eea3e31f489176\"", "size": 167766, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-01-16T19:54:56.000Z", "contentLength": 167766, "httpStatusCode": 200}', '3a13aac7-b321-49cf-b19b-85cb95dfaabe', '1bdc0d75-de5a-462e-8050-78169ac09139', '{}', 2),
	('81c14f52-b8c4-4520-a38e-a58919dc01f7', 'product-images', 'product-images/1768593313747-se2u7ak5kcf.png', '1bdc0d75-de5a-462e-8050-78169ac09139', '2026-01-16 19:55:15.496062+00', '2026-01-16 19:55:15.496062+00', '2026-01-16 19:55:15.496062+00', '{"eTag": "\"3ba9cc05b038bc804b68d3b5806c72e5\"", "size": 210366, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-01-16T19:55:16.000Z", "contentLength": 210366, "httpStatusCode": 200}', '607630ea-41e8-4bcc-8fbc-1171fb6771e3', '1bdc0d75-de5a-462e-8050-78169ac09139', '{}', 2),
	('84f34c87-6efd-497c-8343-43701db62e90', 'product-images', 'product-images/1768593338967-vj9p503xbg.png', '1bdc0d75-de5a-462e-8050-78169ac09139', '2026-01-16 19:55:40.545125+00', '2026-01-16 19:55:40.545125+00', '2026-01-16 19:55:40.545125+00', '{"eTag": "\"ac68ac0ffe826a1bd6a567784007b2cc\"", "size": 201311, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-01-16T19:55:41.000Z", "contentLength": 201311, "httpStatusCode": 200}', '7f2ae760-eebe-4aa6-a846-f4996f0036b0', '1bdc0d75-de5a-462e-8050-78169ac09139', '{}', 2),
	('1f052259-dfa3-4e80-b872-ded414115ed7', 'product-images', 'product-images/1768593540853-4qvyrmn71fx.webp', '1bdc0d75-de5a-462e-8050-78169ac09139', '2026-01-16 19:59:02.897016+00', '2026-01-16 19:59:02.897016+00', '2026-01-16 19:59:02.897016+00', '{"eTag": "\"c0ad1b97a8ca2be4efd33549b4a38198\"", "size": 305472, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-01-16T19:59:03.000Z", "contentLength": 305472, "httpStatusCode": 200}', '4f009877-b550-4736-96cf-9634c3ff88b4', '1bdc0d75-de5a-462e-8050-78169ac09139', '{}', 2),
	('d4a30c34-3b2c-426a-8ab5-7ec1616f9e09', 'product-images', 'product-images/1768593556911-642hw0ou3wh.webp', '1bdc0d75-de5a-462e-8050-78169ac09139', '2026-01-16 19:59:19.025621+00', '2026-01-16 19:59:19.025621+00', '2026-01-16 19:59:19.025621+00', '{"eTag": "\"c0ad1b97a8ca2be4efd33549b4a38198\"", "size": 305472, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-01-16T19:59:19.000Z", "contentLength": 305472, "httpStatusCode": 200}', 'b2d3160f-e417-405e-b87e-51fffa9d4ea6', '1bdc0d75-de5a-462e-8050-78169ac09139', '{}', 2),
	('cf69ca58-0e02-4415-886a-75c8622bbe52', 'product-images', 'product-images/1768593587026-93y0zll043i.webp', '1bdc0d75-de5a-462e-8050-78169ac09139', '2026-01-16 19:59:48.618398+00', '2026-01-16 19:59:48.618398+00', '2026-01-16 19:59:48.618398+00', '{"eTag": "\"c0ad1b97a8ca2be4efd33549b4a38198\"", "size": 305472, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-01-16T19:59:49.000Z", "contentLength": 305472, "httpStatusCode": 200}', '0040af7b-92e7-4af9-9fc5-e9e48ec2a308', '1bdc0d75-de5a-462e-8050-78169ac09139', '{}', 2),
	('af4798a9-c758-490d-b875-41ff1998bbec', 'product-images', 'product-images/1768593840890-ff1bq2crbpv.webp', '1bdc0d75-de5a-462e-8050-78169ac09139', '2026-01-16 20:04:02.493491+00', '2026-01-16 20:04:02.493491+00', '2026-01-16 20:04:02.493491+00', '{"eTag": "\"5df3efb4baf40af11a58a5dcd3536a82\"", "size": 329294, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-01-16T20:04:03.000Z", "contentLength": 329294, "httpStatusCode": 200}', '10a6b49d-235d-43f3-a5b1-22617827ff3a', '1bdc0d75-de5a-462e-8050-78169ac09139', '{}', 2),
	('d7cfe747-cc0e-4704-8812-cbc9f9d81f54', 'product-images', 'product-images/1768593570250-44c11pjf8uc.webp', '1bdc0d75-de5a-462e-8050-78169ac09139', '2026-01-16 19:59:32.034071+00', '2026-01-16 19:59:32.034071+00', '2026-01-16 19:59:32.034071+00', '{"eTag": "\"c0ad1b97a8ca2be4efd33549b4a38198\"", "size": 305472, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-01-16T19:59:32.000Z", "contentLength": 305472, "httpStatusCode": 200}', '513e36e5-2a91-4e2a-874d-e8c101ea6e8c', '1bdc0d75-de5a-462e-8050-78169ac09139', '{}', 2),
	('06fc5389-70ea-4e57-af35-ed710594a42d', 'product-images', 'product-images/1768593610443-eopbto9ubc8.webp', '1bdc0d75-de5a-462e-8050-78169ac09139', '2026-01-16 20:00:12.099581+00', '2026-01-16 20:00:12.099581+00', '2026-01-16 20:00:12.099581+00', '{"eTag": "\"5df3efb4baf40af11a58a5dcd3536a82\"", "size": 329294, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-01-16T20:00:13.000Z", "contentLength": 329294, "httpStatusCode": 200}', 'cb081393-1671-4ee9-a501-852992aaf0a1', '1bdc0d75-de5a-462e-8050-78169ac09139', '{}', 2),
	('4fda33f7-70b1-4e7e-b383-de1f32730d46', 'product-images', 'product-images/1768593774679-dcxl45lyhtt.webp', '1bdc0d75-de5a-462e-8050-78169ac09139', '2026-01-16 20:02:56.986562+00', '2026-01-16 20:02:56.986562+00', '2026-01-16 20:02:56.986562+00', '{"eTag": "\"3435c2796d95c12fa359f2e30d1ba2bd\"", "size": 305378, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-01-16T20:02:57.000Z", "contentLength": 305378, "httpStatusCode": 200}', '457ac50e-f3ff-4cd7-a05b-56f307383901', '1bdc0d75-de5a-462e-8050-78169ac09139', '{}', 2),
	('5645d8cb-4bef-4282-8698-42ee95b36efe', 'product-images', 'product-images/1768593790686-qd0o6xbrjbe.webp', '1bdc0d75-de5a-462e-8050-78169ac09139', '2026-01-16 20:03:12.390742+00', '2026-01-16 20:03:12.390742+00', '2026-01-16 20:03:12.390742+00', '{"eTag": "\"5df3efb4baf40af11a58a5dcd3536a82\"", "size": 329294, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-01-16T20:03:13.000Z", "contentLength": 329294, "httpStatusCode": 200}', 'dd259cb1-6833-4050-a957-dcdddd61c54e', '1bdc0d75-de5a-462e-8050-78169ac09139', '{}', 2),
	('2684a899-0379-46b1-b615-0590556188ba', 'product-images', 'product-images/1768593805696-k5dxu5m8mx.webp', '1bdc0d75-de5a-462e-8050-78169ac09139', '2026-01-16 20:03:27.725687+00', '2026-01-16 20:03:27.725687+00', '2026-01-16 20:03:27.725687+00', '{"eTag": "\"3435c2796d95c12fa359f2e30d1ba2bd\"", "size": 305378, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-01-16T20:03:28.000Z", "contentLength": 305378, "httpStatusCode": 200}', 'cf5075fa-ddd6-405c-a98a-bc63d46dce42', '1bdc0d75-de5a-462e-8050-78169ac09139', '{}', 2),
	('0fc6972c-1470-48df-ae7d-3167261c9f3d', 'product-images', 'product-images/1768593823716-qc89dqwlzfn.webp', '1bdc0d75-de5a-462e-8050-78169ac09139', '2026-01-16 20:03:45.316596+00', '2026-01-16 20:03:45.316596+00', '2026-01-16 20:03:45.316596+00', '{"eTag": "\"3435c2796d95c12fa359f2e30d1ba2bd\"", "size": 305378, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-01-16T20:03:46.000Z", "contentLength": 305378, "httpStatusCode": 200}', '2260d79c-fbc1-4f64-a96b-d9686350c46e', '1bdc0d75-de5a-462e-8050-78169ac09139', '{}', 2);


--
-- Data for Name: prefixes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."prefixes" ("bucket_id", "name", "created_at", "updated_at") VALUES
	('product-images', 'product-images', '2026-01-16 19:40:34.278989+00', '2026-01-16 19:40:34.278989+00');


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 199, true);


--
-- Name: production_batch_number_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."production_batch_number_seq"', 14, true);


--
-- PostgreSQL database dump complete
--

-- \unrestrict aN64kdfo6GneoTqf2a8CaUETWeOxdACNIcOpgrQhnbDJZ721dgsAwWt4CUbuUrS

RESET ALL;
