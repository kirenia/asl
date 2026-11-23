'use strict'

// Join table for the many-to-many between Stars and Planets
module.exports = (sequelize, DataTypes) => {
  const StarsPlanets = sequelize.define('StarsPlanets', {
    starId: { type: DataTypes.INTEGER, allowNull: false },
    planetId: { type: DataTypes.INTEGER, allowNull: false }
  }, { tableName: 'StarsPlanets' })

  return StarsPlanets
}
