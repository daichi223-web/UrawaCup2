"""
初期データ投入スクリプト

使用方法:
  python -m src.backend.seed
"""

import os
import sys
from datetime import date

# パスを追加
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from src.backend.database import SessionLocal, engine, Base
from src.backend.models import Tournament, Team, Venue, User, Group, TeamType
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def seed_database():
    """初期データを投入"""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 既存データチェック
        existing = db.query(Tournament).first()
        if existing:
            print("データベースに既にデータが存在します。スキップします。")
            return

        print("初期データを投入中...")

        # 1. 管理者ユーザー作成
        admin_password = os.getenv("ADMIN_PASSWORD", "admin123")
        admin = User(
            username="admin",
            password_hash=pwd_context.hash(admin_password),
            display_name="管理者",
            role="admin",
            is_active=True
        )
        db.add(admin)
        print("  - 管理者ユーザー作成完了")

        # 2. 大会作成
        tournament = Tournament(
            name="浦和カップ",
            year=2025,
            edition=1,
            start_date=date(2025, 3, 28),
            end_date=date(2025, 3, 30),
            match_duration=25,
            half_count=2
        )
        db.add(tournament)
        db.flush()
        print(f"  - 大会作成完了 (ID: {tournament.id})")

        # 3. グループ作成
        for group_id in ["A", "B", "C", "D"]:
            group = Group(
                id=f"{tournament.id}_{group_id}",
                tournament_id=tournament.id,
                name=f"グループ{group_id}"
            )
            db.add(group)
        print("  - グループA〜D作成完了")

        # 4. 会場作成
        venues_data = [
            ("浦和駒場スタジアム", "駒場"),
            ("さいたま市浦和駒場第2グラウンド", "駒場第2"),
            ("浦和南高校", "浦和南"),
            ("浦和東高校", "浦和東"),
        ]
        for name, short_name in venues_data:
            venue = Venue(
                tournament_id=tournament.id,
                name=name,
                short_name=short_name
            )
            db.add(venue)
        print("  - 会場作成完了")

        # 5. サンプルチーム作成（各グループ4チーム）
        teams_data = [
            # グループA
            ("A", "浦和南高校", "浦和南", "埼玉県", True),
            ("A", "前橋育英高校", "前橋育英", "群馬県", False),
            ("A", "國學院久我山高校", "國學院久我山", "東京都", False),
            ("A", "市立浦和高校", "市浦和", "埼玉県", False),
            # グループB
            ("B", "浦和東高校", "浦和東", "埼玉県", True),
            ("B", "青森山田高校", "青森山田", "青森県", False),
            ("B", "流通経済大柏高校", "流経柏", "千葉県", False),
            ("B", "川越南高校", "川越南", "埼玉県", False),
            # グループC
            ("C", "浦和西高校", "浦和西", "埼玉県", True),
            ("C", "静岡学園高校", "静岡学園", "静岡県", False),
            ("C", "昌平高校", "昌平", "埼玉県", False),
            ("C", "西武台高校", "西武台", "埼玉県", False),
            # グループD
            ("D", "浦和高校", "浦和", "埼玉県", True),
            ("D", "帝京高校", "帝京", "東京都", False),
            ("D", "正智深谷高校", "正智深谷", "埼玉県", False),
            ("D", "武南高校", "武南", "埼玉県", False),
        ]

        for i, (group_id, name, short_name, prefecture, is_host) in enumerate(teams_data):
            team = Team(
                tournament_id=tournament.id,
                group_id=group_id,
                group_order=i % 4 + 1,
                name=name,
                short_name=short_name,
                prefecture=prefecture,
                team_type=TeamType.local if prefecture == "埼玉県" else TeamType.invited,
                is_host=is_host
            )
            db.add(team)
        print("  - サンプルチーム作成完了 (16チーム)")

        db.commit()
        print("\n初期データ投入完了!")
        print(f"\nログイン情報:")
        print(f"  ユーザー名: admin")
        print(f"  パスワード: {admin_password}")

    except Exception as e:
        db.rollback()
        print(f"エラー: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
