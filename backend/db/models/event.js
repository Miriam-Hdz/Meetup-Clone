'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Event extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Event.belongsTo(
        models.Group,
        { foreignKey: 'groupId'}
      );
      Event.belongsTo(
        models.Venue,
        { foreignKey: 'venueId'}
      );
      Event.hasMany(
        models.Image,
        { foreignKey: 'eventId', onDelete: 'CASCADE', hooks: true}
      );
    }
  }
  Event.init({
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    type: DataTypes.STRING,
    capacity: DataTypes.INTEGER,
    price: DataTypes.DECIMAL,
    startDate: DataTypes.DATE,
    endDate: DataTypes.DATE,
    numAttending: DataTypes.INTEGER,
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Groups',
        key: 'id'
      },
      onDelete: 'cascade'
    },
    venueId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Venues',
        key: 'id'
      },
      onDelete: 'cascade'
    }
  }, {
    sequelize,
    modelName: 'Event',
  });
  return Event;
};
