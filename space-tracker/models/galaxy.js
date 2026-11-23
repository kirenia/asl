'use strict'

module.exports = (sequelize, DataTypes) => {
  const Galaxy = sequelize.define('Galaxy', {
    name: { type: DataTypes.STRING, allowNull: false },
    size: { type: DataTypes.INTEGER, allowNull: false },
    description: { type: DataTypes.TEXT }
  })

  Galaxy.associate = (models) => {
    // A galaxy has many stars
    Galaxy.hasMany(models.Star, { foreignKey: 'galaxyId' })
  }

  return Galaxy
}
