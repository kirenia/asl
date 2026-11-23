'use strict'

module.exports = (sequelize, DataTypes) => {
  const Planet = sequelize.define('Planet', {
    name: { type: DataTypes.STRING, allowNull: false },
    size: { type: DataTypes.INTEGER, allowNull: false },
    description: { type: DataTypes.TEXT }
  })

  Planet.associate = (models) => {
    // A planet can orbit many stars (binary systems), through StarsPlanets
    Planet.belongsToMany(models.Star, { through: models.StarsPlanets, foreignKey: 'planetId', otherKey: 'starId' })
  }

  return Planet
}
