'use strict'

module.exports = (sequelize, DataTypes) => {
  const Star = sequelize.define('Star', {
    name: { type: DataTypes.STRING, allowNull: false },
    size: { type: DataTypes.INTEGER, allowNull: false },
    description: { type: DataTypes.TEXT },
    galaxyId: { type: DataTypes.INTEGER }
  })

  Star.associate = (models) => {
    // A star belongs to one galaxy
    Star.belongsTo(models.Galaxy, { foreignKey: 'galaxyId' })
    // A star has many planets, through the StarsPlanets join table
    Star.belongsToMany(models.Planet, { through: models.StarsPlanets, foreignKey: 'starId', otherKey: 'planetId' })
  }

  return Star
}
