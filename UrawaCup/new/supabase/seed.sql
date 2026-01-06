-- サンプルデータ挿入
-- 大会データ
INSERT INTO tournaments (id, name, short_name, year, edition, start_date, end_date, match_duration, half_duration, interval_minutes, group_count, teams_per_group, advancing_teams)
VALUES (1, '浦和カップ高校サッカーフェスティバル', '浦和カップ2026', 2026, 35, '2026-03-20', '2026-03-22', 50, 25, 15, 4, 6, 1)
ON CONFLICT (id) DO NOTHING;

-- グループデータ
INSERT INTO groups (id, tournament_id, name) VALUES
('A', 1, 'Aグループ'),
('B', 1, 'Bグループ'),
('C', 1, 'Cグループ'),
('D', 1, 'Dグループ')
ON CONFLICT (id) DO NOTHING;

-- 会場データ
INSERT INTO venues (id, tournament_id, name, short_name, group_id, pitch_count, max_matches_per_day) VALUES
(1, 1, '浦和南高校グラウンド', '浦和南', 'A', 1, 6),
(2, 1, '市立浦和高校グラウンド', '市浦和', 'B', 1, 6),
(3, 1, '浦和学院グラウンド', '浦和学院', 'C', 1, 6),
(4, 1, '武南高校グラウンド', '武南', 'D', 1, 6)
ON CONFLICT (id) DO NOTHING;

-- チームデータ（各グループ6チーム）
INSERT INTO teams (id, tournament_id, name, short_name, group_id, team_type, is_venue_host, group_order) VALUES
-- Aグループ
(1, 1, '浦和南高校', '浦和南', 'A', 'local', true, 1),
(2, 1, '青森山田高校', '青森山田', 'A', 'invited', false, 2),
(3, 1, '前橋育英高校', '前橋育', 'A', 'invited', false, 3),
(4, 1, '國學院久我山高校', '久我山', 'A', 'invited', false, 4),
(5, 1, '鹿島学園高校', '鹿島学園', 'A', 'invited', false, 5),
(6, 1, '昌平高校', '昌平', 'A', 'local', false, 6),
-- Bグループ
(7, 1, '市立浦和高校', '市浦和', 'B', 'local', true, 1),
(8, 1, '流通経済大柏高校', '流経柏', 'B', 'invited', false, 2),
(9, 1, '静岡学園高校', '静岡学園', 'B', 'invited', false, 3),
(10, 1, '帝京高校', '帝京', 'B', 'invited', false, 4),
(11, 1, '桐光学園高校', '桐光', 'B', 'invited', false, 5),
(12, 1, '大宮アルディージャU18', '大宮U18', 'B', 'local', false, 6),
-- Cグループ
(13, 1, '浦和学院高校', '浦和学院', 'C', 'local', true, 1),
(14, 1, '東福岡高校', '東福岡', 'C', 'invited', false, 2),
(15, 1, '大津高校', '大津', 'C', 'invited', false, 3),
(16, 1, '市立船橋高校', '市船', 'C', 'invited', false, 4),
(17, 1, '西武台高校', '西武台', 'C', 'local', false, 5),
(18, 1, '浦和レッズユース', '浦和U18', 'C', 'local', false, 6),
-- Dグループ
(19, 1, '武南高校', '武南', 'D', 'local', true, 1),
(20, 1, '長崎総合科学大附高校', '長崎総科大', 'D', 'invited', false, 2),
(21, 1, '尚志高校', '尚志', 'D', 'invited', false, 3),
(22, 1, '正智深谷高校', '正智深谷', 'D', 'local', false, 4),
(23, 1, '立正大淞南高校', '立正淞南', 'D', 'invited', false, 5),
(24, 1, '浦和東高校', '浦和東', 'D', 'local', false, 6)
ON CONFLICT (id) DO NOTHING;

-- 順位表初期データ（各チームの初期順位）
INSERT INTO standings (tournament_id, group_id, team_id, played, won, drawn, lost, goals_for, goals_against, goal_difference, points, rank) VALUES
-- Aグループ
(1, 'A', 1, 0, 0, 0, 0, 0, 0, 0, 0, 1),
(1, 'A', 2, 0, 0, 0, 0, 0, 0, 0, 0, 2),
(1, 'A', 3, 0, 0, 0, 0, 0, 0, 0, 0, 3),
(1, 'A', 4, 0, 0, 0, 0, 0, 0, 0, 0, 4),
(1, 'A', 5, 0, 0, 0, 0, 0, 0, 0, 0, 5),
(1, 'A', 6, 0, 0, 0, 0, 0, 0, 0, 0, 6),
-- Bグループ
(1, 'B', 7, 0, 0, 0, 0, 0, 0, 0, 0, 1),
(1, 'B', 8, 0, 0, 0, 0, 0, 0, 0, 0, 2),
(1, 'B', 9, 0, 0, 0, 0, 0, 0, 0, 0, 3),
(1, 'B', 10, 0, 0, 0, 0, 0, 0, 0, 0, 4),
(1, 'B', 11, 0, 0, 0, 0, 0, 0, 0, 0, 5),
(1, 'B', 12, 0, 0, 0, 0, 0, 0, 0, 0, 6),
-- Cグループ
(1, 'C', 13, 0, 0, 0, 0, 0, 0, 0, 0, 1),
(1, 'C', 14, 0, 0, 0, 0, 0, 0, 0, 0, 2),
(1, 'C', 15, 0, 0, 0, 0, 0, 0, 0, 0, 3),
(1, 'C', 16, 0, 0, 0, 0, 0, 0, 0, 0, 4),
(1, 'C', 17, 0, 0, 0, 0, 0, 0, 0, 0, 5),
(1, 'C', 18, 0, 0, 0, 0, 0, 0, 0, 0, 6),
-- Dグループ
(1, 'D', 19, 0, 0, 0, 0, 0, 0, 0, 0, 1),
(1, 'D', 20, 0, 0, 0, 0, 0, 0, 0, 0, 2),
(1, 'D', 21, 0, 0, 0, 0, 0, 0, 0, 0, 3),
(1, 'D', 22, 0, 0, 0, 0, 0, 0, 0, 0, 4),
(1, 'D', 23, 0, 0, 0, 0, 0, 0, 0, 0, 5),
(1, 'D', 24, 0, 0, 0, 0, 0, 0, 0, 0, 6)
ON CONFLICT DO NOTHING;

-- サンプル試合データ（Day1の一部）
INSERT INTO matches (id, tournament_id, group_id, stage, home_team_id, away_team_id, venue_id, match_date, match_time, match_order, status, home_score_half1, home_score_half2, home_score_total, away_score_half1, away_score_half2, away_score_total, result) VALUES
-- Aグループ Day1
(1, 1, 'A', 'preliminary', 1, 2, 1, '2026-03-20', '09:30:00', 1, 'completed', 1, 1, 2, 0, 1, 1, 'home_win'),
(2, 1, 'A', 'preliminary', 3, 4, 1, '2026-03-20', '10:45:00', 2, 'completed', 0, 0, 0, 0, 0, 0, 'draw'),
(3, 1, 'A', 'preliminary', 5, 6, 1, '2026-03-20', '12:00:00', 3, 'completed', 2, 1, 3, 1, 0, 1, 'home_win'),
-- Bグループ Day1
(4, 1, 'B', 'preliminary', 7, 8, 2, '2026-03-20', '09:30:00', 1, 'completed', 0, 1, 1, 2, 0, 2, 'away_win'),
(5, 1, 'B', 'preliminary', 9, 10, 2, '2026-03-20', '10:45:00', 2, 'completed', 3, 0, 3, 0, 1, 1, 'home_win'),
(6, 1, 'B', 'preliminary', 11, 12, 2, '2026-03-20', '12:00:00', 3, 'completed', 1, 1, 2, 2, 0, 2, 'draw'),
-- Cグループ Day1
(7, 1, 'C', 'preliminary', 13, 14, 3, '2026-03-20', '09:30:00', 1, 'completed', 0, 2, 2, 1, 1, 2, 'draw'),
(8, 1, 'C', 'preliminary', 15, 16, 3, '2026-03-20', '10:45:00', 2, 'scheduled', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(9, 1, 'C', 'preliminary', 17, 18, 3, '2026-03-20', '12:00:00', 3, 'scheduled', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
-- Dグループ Day1
(10, 1, 'D', 'preliminary', 19, 20, 4, '2026-03-20', '09:30:00', 1, 'scheduled', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(11, 1, 'D', 'preliminary', 21, 22, 4, '2026-03-20', '10:45:00', 2, 'scheduled', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(12, 1, 'D', 'preliminary', 23, 24, 4, '2026-03-20', '12:00:00', 3, 'scheduled', NULL, NULL, NULL, NULL, NULL, NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- サンプル得点データ
INSERT INTO goals (id, match_id, team_id, player_name, half, minute, is_own_goal, is_penalty) VALUES
(1, 1, 1, '田中太郎', 1, 15, false, false),
(2, 1, 1, '鈴木一郎', 2, 55, false, false),
(3, 1, 2, '佐藤健', 2, 70, false, false),
(4, 3, 5, '山田花子', 1, 10, false, false),
(5, 3, 5, '高橋翔', 1, 35, false, false),
(6, 3, 5, '山田花子', 2, 60, false, true),
(7, 3, 6, '伊藤拓海', 1, 25, false, false),
(8, 4, 8, '渡辺裕太', 1, 20, false, false),
(9, 4, 8, '中村光', 1, 40, false, false),
(10, 4, 7, '小林誠', 2, 50, false, false),
(11, 5, 9, '木村達也', 1, 5, false, false),
(12, 5, 9, '加藤俊介', 1, 30, false, false),
(13, 5, 9, '木村達也', 1, 45, false, false),
(14, 5, 10, '吉田健太', 2, 75, false, false),
(15, 6, 11, '山本陸', 1, 22, false, false),
(16, 6, 11, '斎藤遼', 2, 55, false, false),
(17, 6, 12, '松本大地', 1, 35, false, false),
(18, 6, 12, '松本大地', 2, 80, false, false),
(19, 7, 13, '井上凌', 2, 52, false, false),
(20, 7, 13, '清水翔太', 2, 78, false, false),
(21, 7, 14, '森田圭吾', 1, 18, false, false),
(22, 7, 14, '石井隼人', 2, 65, false, false)
ON CONFLICT (id) DO NOTHING;

-- RLSポリシー（公開読み取り許可）
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE standings ENABLE ROW LEVEL SECURITY;

-- 匿名ユーザーに読み取り権限を付与
CREATE POLICY "Allow anonymous read tournaments" ON tournaments FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read groups" ON groups FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read venues" ON venues FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read matches" ON matches FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read goals" ON goals FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read standings" ON standings FOR SELECT USING (true);

-- 認証済みユーザーに全権限付与
CREATE POLICY "Allow authenticated full access tournaments" ON tournaments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated full access groups" ON groups FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated full access teams" ON teams FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated full access venues" ON venues FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated full access matches" ON matches FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated full access goals" ON goals FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated full access standings" ON standings FOR ALL USING (auth.role() = 'authenticated');
