import { MigrationInterface, QueryRunner } from "typeorm";

export class addCinemasToCinemasTable1697223439915 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO cinemas (id, name)
      VALUES
        ('001', 'Movie Montevideo'),
        ('002', 'Movie Portones'),
        ('003', 'Movie Punta Carretas'),
        ('005', 'Movie Nuevo Centro Shopping');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM cinemas
      WHERE id IN ('001', '002', '003', '005');
    `);
  }
}
