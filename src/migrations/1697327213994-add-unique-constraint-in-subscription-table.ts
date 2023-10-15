import { MigrationInterface, QueryRunner } from "typeorm";

export class addUniqueConstraintInSubscriptionTable1697327213994 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE subscriptions
            ADD CONSTRAINT unique_subscription_constraint UNIQUE (user_id, movie_id, cinema_id);
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE subscriptions
            DROP CONSTRAINT "unique_subscription_constraint";
    `);
    }
}
