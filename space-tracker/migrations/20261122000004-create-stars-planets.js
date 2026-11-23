'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('StarsPlanets', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      starId: { allowNull: false, type: Sequelize.INTEGER, references: { model: 'Stars', key: 'id' }, onDelete: 'CASCADE' },
      planetId: { allowNull: false, type: Sequelize.INTEGER, references: { model: 'Planets', key: 'id' }, onDelete: 'CASCADE' },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    })
  },
  async down(queryInterface) {
    await queryInterface.dropTable('StarsPlanets')
  }
}
